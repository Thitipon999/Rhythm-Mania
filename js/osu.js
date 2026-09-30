// osu!mania (.osu, Mode 3) + .osz (zip) importer
function parseOsu(txt){const m={};let sec='',bpm=null,notes=[],objs=[];
 for(let l of txt.split(/\r?\n/)){l=l.trim();if(/^\[.+\]$/.test(l)){sec=l.slice(1,-1);continue}
  if(['General','Metadata','Difficulty'].includes(sec)){const i=l.indexOf(':');if(i>0)m[l.slice(0,i).trim()]=l.slice(i+1).trim()}
  else if(sec=='TimingPoints'&&bpm==null){const p=l.split(',');if(p.length>1&&(p[6]===undefined||p[6]==='1')&&+p[1]>0)bpm=60000/+p[1]}
  else if(sec=='HitObjects'&&l)objs.push(l.split(','))}
 if(m.Mode!=='3')throw new Error('ไม่ใช่ osu!mania (Mode ต้องเป็น 3)');
 const K=Math.round(+m.CircleSize);if(K<1||K>10)throw new Error('รองรับ 1-10 ปุ่ม');
 for(const p of objs){const x=+p[0],t=+p[2],ty=+p[3],l=Math.min(K-1,Math.floor(x*K/512));notes.push({t,l,d:ty&128?Math.max(0,parseInt(p[5])-t):0})}
 notes.sort((a,b)=>a.t-b.t);
 return{title:m.TitleUnicode||m.Title||'Untitled',artist:m.ArtistUnicode||m.Artist||'',version:m.Version||'Imported',bpm:Math.round((bpm||120)*100)/100,keys:K,notes,audioName:m.AudioFilename}}
const estLevel=n=>{if(n.length<2)return 1;const s=(n[n.length-1].t-n[0].t)/1000||1;return Math.max(1,Math.min(20,Math.round(n.length/s*1.5)))};
// คืน {title,artist,bpm,diffs:[{name,level,keys,notes}],audio(dataURL|null),skipped}
async function importFiles(files){const out={diffs:[],audio:null,skipped:0,audioBig:false};
 const add=(txt)=>{try{const o=parseOsu(txt);Object.assign(out,{title:out.title||o.title,artist:out.artist||o.artist,bpm:out.bpm||o.bpm,an:out.an||o.audioName});
  out.diffs.push({id:rid(),name:o.version,level:estLevel(o.notes),keys:o.keys,notes:o.notes})}catch(e){out.skipped++}};
 for(const f of files){
  if(/\.osu$/i.test(f.name))add(await f.text());
  else if(/\.osz$/i.test(f.name)){if(!window.JSZip)throw new Error('โหลด JSZip ไม่ได้ (ตรวจอินเทอร์เน็ต)');const z=await JSZip.loadAsync(f);
   for(const n of Object.keys(z.files))if(/\.osu$/i.test(n))add(await z.files[n].async('string'));
   const an=(out.an||'').toLowerCase(),af=Object.keys(z.files).find(n=>n.toLowerCase()==an)||Object.keys(z.files).find(n=>/\.(mp3|ogg|wav)$/i.test(n));
   if(af&&!out.audio){const b=await z.files[af].async('base64');if(b.length>8e6)out.audioBig=true;else out.audio='data:'+(/\.ogg$/i.test(af)?'audio/ogg':/\.wav$/i.test(af)?'audio/wav':'audio/mpeg')+';base64,'+b}}}
 out.diffs.sort((a,b)=>a.notes.length-b.notes.length);return out}
