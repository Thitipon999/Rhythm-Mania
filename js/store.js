const DEF_KEYS={4:['d','f','j','k'],5:['d','f','space','j','k'],6:['s','d','f','j','k','l'],7:['s','d','f','space','j','k','l'],8:['a','s','d','f','j','k','l',';'],9:['a','s','d','f','space','j','k','l',';'],10:['a','s','d','f','v','n','j','k','l',';']};
const DIFF_NAMES=['Easy','Normal','Hard','Extreme','Challenge'];
const toArr=x=>Array.isArray(x)?x.filter(Boolean):Object.values(x||{});
const rid=()=>'d'+Math.random().toString(36).slice(2,8);
function gen(bpm,bars,dens,seed,K=4){let s=seed;const r=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
 const b=60000/bpm,per=dens>=.55?16:8,st=b*4/per,n=[],busy=Array(K).fill(-1);let last=-1;
 for(let i=8;i<bars*per;i++){const t=Math.round(i*st),beat=(i*(4/per))%1===0;if(r()>(beat?Math.min(1,dens+.3):dens*.75))continue;
  const c=dens>.5&&r()<.18?2:1;for(let k=0;k<c;k++){let l,tries=0;do{l=r()*K|0}while((l==last||busy[l]>t)&&++tries<12);if(busy[l]>t)continue;
   const hold=dens<.9&&r()<.1,d=hold?Math.round(st*(2+(r()*3|0))):0;busy[l]=t+d+st/2;n.push({t,l,d});last=l}}
 return n}
function defaultCharts(){const D=(name,level,bpm,bars,dens,seed)=>({id:rid(),name,level,keys:4,notes:gen(bpm,bars,dens,seed)});
 return[{id:'c1',ts:1,title:'Runway Lights',artist:'Sky Ops',bpm:128,diffs:[D('Easy',2,128,32,.3,1),D('Normal',4,128,32,.45,2),D('Hard',7,128,32,.62,3)]},
 {id:'c2',ts:2,title:'Gate 11 Departure',artist:'Tower Crew',bpm:150,diffs:[D('Easy',3,150,32,.3,4),D('Hard',8,150,32,.65,5),D('Extreme',11,150,32,.8,6)]},
 {id:'c3',ts:3,title:'Midnight Overnight Flight',artist:'Jet Stream',bpm:174,diffs:[D('Hard',9,174,40,.68,7),D('Extreme',12,174,40,.82,8),D('Challenge',14,174,40,.95,9)]}]}
// ชั้นข้อมูล: ใช้ Firebase RTDB (REST) ถ้ามี DB_URL ไม่งั้นใช้ localStorage
const DB={remote:!!CONFIG.DB_URL,
 async req(path,method,body,q=''){const u=CONFIG.DB_URL.replace(/\/$/,'')+'/'+path.split('/').map(encodeURIComponent).join('/')+'.json'+q;
  const r=await fetch(u,{method,body:body===undefined?undefined:JSON.stringify(body)}).catch(()=>{throw new Error('เชื่อมต่อฐานข้อมูลไม่ได้ (ตรวจอินเทอร์เน็ต/ค่า DB_URL)')});
  if(!r.ok)throw new Error('ฐานข้อมูลตอบกลับผิดพลาด ('+r.status+') — ตรวจ Rules ใน Firebase');return r.json()},
 loc(){try{return JSON.parse(localStorage.getItem('rm_local'))||{}}catch(e){return{}}},
 async get(path){if(this.remote)return this.req(path,'GET');let o=this.loc();for(const k of path.split('/')){if(o==null)return null;o=o[k]}return o===undefined?null:o},
 async put(path,val){if(this.remote)return this.req(path,'PUT',val);const root=this.loc(),ks=path.split('/');let o=root;
  ks.slice(0,-1).forEach(k=>o=o[k]=o[k]||{});if(val===null)delete o[ks[ks.length-1]];else o[ks[ks.length-1]]=val;
  try{localStorage.setItem('rm_local',JSON.stringify(root))}catch(e){throw new Error('พื้นที่จัดเก็บเต็ม (ไฟล์เสียงใหญ่เกินไป)')}},
 async keys(path){if(this.remote)return Object.keys(await this.req(path,'GET',undefined,'?shallow=true')||{});return Object.keys(await this.get(path)||{})},
 async charts(){let o=await this.get('charts');if(!o){for(const c of defaultCharts())await this.put('charts/'+c.id,c);o=await this.get('charts')}
  return toArr(o).map(c=>({...c,diffs:toArr(c.diffs).map((d,i)=>({...d,id:d.id||c.id+'_'+i,keys:d.keys||4,notes:toArr(d.notes)}))})).sort((a,b)=>(a.ts||0)-(b.ts||0))},
 async board(cid,did){const o=await this.get(`scores/${cid}/${did}`)||{};return Object.entries(o).map(([user,s])=>({user,...s})).sort((a,b)=>b.score-a.score).slice(0,10)},
 async submit(u,cid,did,r){const p=`scores/${cid}/${did}/${u}`,old=await this.get(p);
  if(!old||r.score>old.score)await this.put(p,{score:r.score,acc:r.acc,combo:r.max,rank:r.rank,ts:Date.now()});
  await this.put('stats/plays',(await this.get('stats/plays')||0)+1)}};
