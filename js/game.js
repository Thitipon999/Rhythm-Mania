const COLORS=['#ffffff','#4dabf7','#ffd23f'];
const Game={
 async start(ch,df,set,onEnd){
  await AU.init();
  const K=df.keys||4,binds=set.keys[K]||DEF_KEYS[K]||DEF_KEYS[4],spd=.28*set.speed;
  const P=innerHeight>innerWidth*1.05,W=P?440:900,GH=P?820:640,fs=P?.68:1,T=set.pad===undefined?matchMedia('(pointer:coarse)').matches:!!set.pad,padH=T?(P?190:150):0,HY=GH-(P?150:100)-padH;
  let buf=null;if(ch.audio){try{buf=await AU.c.decodeAudioData(await(await fetch(ch.audio)).arrayBuffer())}catch(e){}}
  const notes=df.notes.map(n=>({...n,hit:0,held:0,dead:0})).sort((a,b)=>a.t-b.t),total=notes.length||1;
  const app=document.getElementById('app');app.innerHTML=`<canvas id="cv" width="${W}" height="${GH}"></canvas>`;document.body.classList.add('playing');
  const qb=document.createElement('button');qb.id='qb';qb.className='alt';qb.textContent='✕ ออก';document.body.appendChild(qb);
  const cv=document.getElementById('cv'),g=cv.getContext('2d'),lw=T?Math.min(170,(W-12)/K|0):Math.min(84,(W-30)/K|0),fx=(W-K*lw)/2;
  cv.style.touchAction='none';cv.oncontextmenu=e=>e.preventDefault();
  const t0=AU.c.currentTime+2.5;AU.start(ch.bpm,t0,buf);
  const st={score:0,combo:0,max:0,c:{P:0,G:0,O:0,M:0},w:0,j:'',jt:0,down:Array(K).fill(0)};
  const endT=(notes.length?Math.max(...notes.map(n=>n.t+n.d)):0)+1500,now=()=>(AU.c.currentTime-t0)*1000;
  const JW={P:1,G:.8,O:.5,M:0},JC={P:'#ffd23f',G:'#69db7c',O:'#4dabf7',M:'#ff6b6b'},JN={P:'PERFECT',G:'GREAT',O:'GOOD',M:'MISS'};
  const judge=j=>{st.c[j]++;st.w+=JW[j];if(j=='M')st.combo=0;else st.max=Math.max(st.max,++st.combo);st.score=Math.round(1e6*st.w/total);st.j=j;st.jt=performance.now()};
  const press=l=>{if(st.down[l])return;st.down[l]=1;AU.sfx(l);const t=now(),n=notes.find(n=>n.l==l&&!n.hit&&!n.dead&&Math.abs(n.t-t)<=130);
   if(n){const d=Math.abs(n.t-t);n.hit=1;if(n.d>0)n.held=1;judge(d<=40?'P':d<=85?'G':'O')}};
  const release=l=>{st.down[l]=0;const t=now();for(const n of notes)if(n.held&&n.l==l&&t<n.t+n.d-120){n.held=0;n.dead=1;st.combo=0;st.j='B';st.jt=performance.now()}};
  const kn=e=>e.key==' '?'space':e.key.toLowerCase();
  const kd=e=>{if(e.key=='Escape')return finish(true);const l=binds.indexOf(kn(e));if(l>=0&&!e.repeat){e.preventDefault();press(l)}};
  const ku=e=>{const l=binds.indexOf(kn(e));if(l>=0)release(l)};
  const pm={},lane=e=>{const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width-fx;return T?Math.max(0,Math.min(K-1,Math.floor(x/lw))):(x>=0&&x<K*lw?x/lw|0:-1)};
  const pd=e=>{e.preventDefault();const l=lane(e);if(l>=0){pm[e.pointerId]=l;press(l)}},pu=e=>{const l=pm[e.pointerId];if(l!==undefined){delete pm[e.pointerId];release(l)}};
  addEventListener('keydown',kd);addEventListener('keyup',ku);cv.addEventListener('pointerdown',pd);addEventListener('pointerup',pu);addEventListener('pointercancel',pu);
  let raf,over=0;qb.onclick=()=>finish(true);
  const finish=quit=>{if(over)return;over=1;cancelAnimationFrame(raf);AU.stop();removeEventListener('keydown',kd);removeEventListener('keyup',ku);removeEventListener('pointerup',pu);removeEventListener('pointercancel',pu);qb.remove();document.body.classList.remove('playing');
   const acc=Math.round(st.w/total*10000)/100,rank=acc>=95?'S':acc>=85?'A':acc>=70?'B':acc>=50?'C':'D';
   onEnd(quit?null:{score:st.score,acc,max:st.max,c:st.c,rank})};
  const draw=t=>{const p=performance.now(),gr=g.createLinearGradient(0,0,0,GH);gr.addColorStop(0,'#123c7a');gr.addColorStop(.6,'#5fa8ee');gr.addColorStop(1,'#cfe8ff');g.fillStyle=gr;g.fillRect(0,0,W,GH);
   g.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<5;i++){const x=((p/40*(1+i%3*.4)+i*220)%(W+200))-100,y=70+i*GH/6;g.beginPath();g.ellipse(x,y,70,20,0,0,7);g.ellipse(x+40,y-12,40,18,0,0,7);g.fill()}
   g.font='40px serif';g.fillStyle='#fff';g.fillText('✈',((p/12)%(W+200))-100,GH-20);
   g.fillStyle='rgba(16,20,30,.94)';g.fillRect(fx,0,K*lw,GH);g.fillStyle='#ffb400';g.fillRect(fx-5,0,5,GH);g.fillRect(fx+K*lw,0,5,GH);
   g.strokeStyle='rgba(255,255,255,.15)';g.setLineDash([16,16]);for(let i=1;i<K;i++){g.beginPath();g.moveTo(fx+i*lw,0);g.lineTo(fx+i*lw,GH);g.stroke()}g.setLineDash([]);
   const b=60000/ch.bpm;for(let k=Math.floor(t/b)-1;;k++){const y=HY-(k*b-t)*spd;if(y<0)break;if(k>=0&&y<GH){g.fillStyle=k%4?'rgba(255,255,255,.07)':'rgba(255,180,0,.25)';g.fillRect(fx,y,K*lw,2)}}
   for(let i=0;i<K;i++)if(st.down[i]){g.fillStyle='rgba(255,180,0,.25)';g.fillRect(fx+i*lw,0,lw,HY)}
   g.fillStyle='#ffb400';g.fillRect(fx,HY,K*lw,6);g.fillStyle='#fff';g.font='600 18px Kanit,sans-serif';g.textAlign='center';
   for(let i=0;i<K;i++)g.fillText(binds[i].toUpperCase(),fx+i*lw+lw/2,HY+38);
   if(T){for(let i=0;i<K;i++){const x=fx+i*lw+4,y=GH-padH+6,w=lw-8,h=padH-16,on=st.down[i];g.fillStyle=on?'#ffb400':'rgba(20,40,80,.95)';g.beginPath();g.roundRect(x,y,w,h,16);g.fill();g.strokeStyle='#ffb400';g.lineWidth=3;g.stroke();g.fillStyle=on?'#1a1200':'#fff';g.font=`800 ${Math.min(44,w/2|0)}px Kanit`;g.textAlign='center';g.fillText(binds[i].toUpperCase().slice(0,3),x+w/2,y+h/2+14)}g.lineWidth=1}
   for(const n of notes){if(n.hit==2||(n.hit&&!n.d)||(n.dead&&n.t-t<-300))continue;let y=HY-(n.t-t)*spd;if(y<-40)break;if(HY-(n.t+n.d-t)*spd>GH+60)continue;
    const col=n.l*2+1==K?COLORS[2]:COLORS[Math.min(n.l,K-1-n.l)%2],x=fx+n.l*lw+3;g.globalAlpha=n.dead?.3:1;
    if(n.d>0){const yt=HY-(n.t+n.d-t)*spd,yh=n.held?Math.min(y,HY):y;g.fillStyle=col+'88';g.fillRect(x+10,yt,lw-26,yh-yt)}
    if(n.held)y=HY;g.fillStyle=col;g.beginPath();g.roundRect(x,y-11,lw-6,22,6);g.fill();g.globalAlpha=1}
   const ty=P?[34,74,100,124]:[60,110,145,180],x0=P?12:24,fl=Math.round(18*(P?.8:1)),fb=Math.round(52*fs),fm=Math.round(22*(P?.8:1));
   g.fillStyle='#fff';g.textAlign='left';g.font=`600 ${fl}px Kanit`;g.fillText('SCORE',x0,ty[0]);g.font=`800 ${fb}px Kanit`;g.fillText(String(st.score).padStart(7,'0'),x0,ty[1]);
   g.font=`600 ${fm}px Kanit`;g.fillText('ACC '+(st.w/Math.max(1,st.c.P+st.c.G+st.c.O+st.c.M)*100).toFixed(1)+'%',x0,ty[2]);
   g.fillText(`P ${st.c.P}  G ${st.c.G}  O ${st.c.O}  M ${st.c.M}`,x0,ty[3]);
   g.textAlign='right';g.font=`600 ${fl}px Kanit`;g.fillText('BPM',W-x0,ty[0]);g.font=`800 ${fb}px Kanit`;g.fillText(Math.round(ch.bpm),W-x0,ty[1]);
   g.font=`600 ${fm}px Kanit`;if(!P)g.fillText(ch.title,W-x0,ty[2]);g.fillStyle='#ffb400';g.fillText(`${df.name} Lv.${df.level} ${K}K x${set.speed}`,W-x0,P?ty[2]:ty[3]);
   const cy=P?330:250;g.textAlign='center';if(st.combo>=2){g.fillStyle='#fff';g.font='800 64px Kanit';g.fillText(st.combo,W/2,cy);g.font='600 20px Kanit';g.fillText('COMBO',W/2,cy+28)}
   const a=1-(p-st.jt)/600;if(st.j&&a>0){g.globalAlpha=a;g.fillStyle=st.j=='B'?'#ff6b6b':JC[st.j];g.font='800 34px Kanit';g.fillText(st.j=='B'?'BREAK':JN[st.j],W/2,cy+90);g.globalAlpha=1}
   if(t<0){g.fillStyle='#fff';g.font='800 90px Kanit';g.fillText(Math.ceil(-t/1000),W/2,cy+80)}g.textAlign='left'};
  const loop=()=>{AU.tick();const t=now();
   for(const n of notes){if(n.t-t>200)break;if(!n.hit&&!n.dead&&t-n.t>130){n.dead=1;judge('M')}if(n.held&&t>=n.t+n.d){n.held=0;n.hit=2}}
   draw(t);if(t>endT)return finish(false);raf=requestAnimationFrame(loop)};
  loop()}};
