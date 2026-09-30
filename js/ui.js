const $=(s,e=document)=>e.querySelector(s),H=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const app=$('#app');let U=null,sel={c:0,d:0},CH=[];
const getSet=()=>{try{return{speed:3,keys:{},...JSON.parse(localStorage.getItem('rm_set'))}}catch(e){return{speed:3,keys:{}}}};
const saveSet=s=>localStorage.setItem('rm_set',JSON.stringify(s));
function openModal(h){const m=$('#modal');m.innerHTML=`<div class="card">${h}</div>`;m.hidden=false}
function closeModal(){$('#modal').hidden=true;if(U)menu()}
async function hash(n,p){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('rm:'+n+':'+p));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch(e){return'p:'+n+':'+p}}
const KEYRE=/^[A-Za-z0-9_\u0E00-\u0E7F]{2,16}$/,err=e=>`<section class="card"><p style="color:var(--red)">${H(e.message||e)}</p><button onclick="location.reload()">ลองใหม่</button></section>`;
function auth(msg=''){U=null;localStorage.removeItem('rm_session');$('#who').innerHTML='';
 app.innerHTML=`<section class="card auth"><h2>CHECK-IN · เข้าสู่ระบบ</h2><input id="un" placeholder="ชื่อผู้เล่น" maxlength="16" autocapitalize="off"><input id="pw" type="password" placeholder="รหัสผ่าน (อย่างน้อย 4 ตัว)"><div><button id="li">Login</button><button id="rg" class="alt">Register</button></div><p id="msg">${H(msg)}</p><small>${DB.remote?'☁ ออนไลน์: ล็อกอินได้ทุกเครื่อง':'⚠ โหมดออฟไลน์: ข้อมูลอยู่เฉพาะเครื่องนี้ (ดู README เพื่อเปิดโหมดออนไลน์)'}</small></section>`;
 const m=t=>$('#msg').textContent=t,rd=()=>[$('#un').value.trim(),$('#pw').value],busy=b=>{$('#li').disabled=$('#rg').disabled=b};
 $('#li').onclick=async()=>{const[n,p]=rd();if(!n||!p)return m('กรอกชื่อและรหัสผ่าน');busy(1);try{const u=await DB.get('users/'+n);if(u&&u.pw==await hash(n,p))login(n,u.pw);else m('ชื่อผู้เล่นหรือรหัสผ่านไม่ถูกต้อง')}catch(e){m(e.message)}busy(0)};
 $('#rg').onclick=async()=>{const[n,p]=rd();if(!KEYRE.test(n))return m('ชื่อ 2-16 ตัว ใช้ได้เฉพาะ ก-ฮ, A-Z, 0-9 และ _');if(p.length<4)return m('รหัสผ่านต้องมี 4 ตัวขึ้นไป');
  busy(1);try{if(await DB.get('users/'+n))m('ชื่อนี้ถูกใช้แล้ว');else{const h=await hash(n,p);await DB.put('users/'+n,{pw:h,created:Date.now()});login(n,h,true)}}catch(e){m(e.message)}busy(0)};
 $('#pw').onkeydown=e=>{if(e.key=='Enter')$('#li').click()}}
function login(n,h,first){U=n;localStorage.setItem('rm_session',JSON.stringify({n,h}));menu().then(()=>first&&howto())}
async function menu(reload=true){$('#who').innerHTML=`ผู้เล่น: <b>${H(U)}</b> · <a href="#" id="st">Settings</a> · <a href="#" id="lo">Logout</a>`;
 $('#st').onclick=e=>{e.preventDefault();settings()};$('#lo').onclick=e=>{e.preventDefault();auth()};
 if(reload||!CH.length){app.innerHTML='<section class="card">กำลังโหลดเพลง...</section>';try{CH=await DB.charts()}catch(e){app.innerHTML=err(e);return}}
 draw()}
const kl=c=>[...new Set(c.diffs.map(d=>d.keys))].sort((a,b)=>a-b).map(k=>k+'K').join('/');
function draw(){if(!CH.length){app.innerHTML='<section class="card">ยังไม่มีเพลง — เข้าโหมด STAFF เพื่อเพิ่ม</section>';return}
 sel.c=Math.min(sel.c,CH.length-1);const ch=CH[sel.c];sel.d=Math.min(sel.d,ch.diffs.length-1);const df=ch.diffs[sel.d],b=getSet().keys[df.keys]||DEF_KEYS[df.keys]||[];
 app.innerHTML=`<div class="wrap"><div class="board"><div class="hd"><span>FLIGHT</span><span>SONG</span><span>KEYS</span></div>${CH.map((c,i)=>`<div class="row ${i==sel.c?'on':''}" data-c="${i}"><span>RM${String(i+1).padStart(3,'0')}</span><span>${H(c.title)}<br><small>${H(c.artist)} · ${c.bpm} BPM</small></span><span>${kl(c)}</span></div>`).join('')}</div>
 <div class="card" style="margin:0"><h2 style="margin:0">${H(ch.title)}</h2><small>${H(ch.artist)} · ${ch.bpm} BPM</small><div class="diffs">${ch.diffs.map((d,i)=>`<button data-d="${i}" class="${i==sel.d?'on':'alt'}">${H(d.name)} ${d.level}<br><small>${d.keys}K</small></button>`).join('')}</div>
 <p>ใช้ <b>${df.keys} ปุ่ม</b>: ${b.map(k=>`<kbd>${H(k.toUpperCase())}</kbd>`).join(' ')||'—'} <small>(หรือแตะเลนบนจอมือถือ)</small></p>
 <button id="go" style="width:100%;font-size:20px">▶ BOARDING — เริ่มเล่น</button><h3>Leaderboard · ${H(df.name)} <a href="#" id="rf" style="font-size:14px;color:var(--amber)">🔄</a></h3><div id="bd">กำลังโหลด...</div></div></div>`;
 app.querySelectorAll('[data-c]').forEach(e=>e.onclick=()=>{sel.c=+e.dataset.c;sel.d=0;draw()});app.querySelectorAll('[data-d]').forEach(e=>e.onclick=()=>{sel.d=+e.dataset.d;draw()});
 $('#go').onclick=()=>play(ch,df);const lb=async()=>{try{const bd=await DB.board(ch.id,df.id);if($('#bd'))$('#bd').innerHTML=bd.length?`<table>${bd.map((s,i)=>`<tr><td>${i+1}</td><td>${H(s.user)}</td><td>${s.score.toLocaleString()}</td><td>${s.rank}</td></tr>`).join('')}</table>`:'ยังไม่มีใครขึ้นบอร์ด — เป็นคนแรกเลย'}catch(e){$('#bd').textContent=e.message}};
 $('#rf').onclick=e=>{e.preventDefault();$('#bd').textContent='กำลังโหลด...';lb()};lb()}
async function play(ch,df){if(ch.hasAudio&&!ch.audio){try{ch.audio=await DB.get('audio/'+ch.id)}catch(e){}}
 Game.start(ch,df,getSet(),async r=>{if(!r){draw();return}result(ch,df,r);try{await DB.submit(U,ch.id,df.id,r)}catch(e){$('#sv')&&($('#sv').textContent='บันทึกคะแนนไม่สำเร็จ: '+e.message)}})}
function result(ch,df,r){app.innerHTML=`<section class="card res"><small>${H(ch.title)} · ${H(df.name)} · ${df.keys}K</small><div class="rk">${r.rank}</div><div class="sc">${r.score.toLocaleString()}</div><p>ACC ${r.acc}% · MAX COMBO ${r.max}<br>PERFECT ${r.c.P} · GREAT ${r.c.G} · GOOD ${r.c.O} · MISS ${r.c.M}</p><p id="sv"></p><button id="rt">เล่นอีกครั้ง</button> <button class="alt" id="bk">กลับหน้าเลือกเพลง</button></section>`;
 $('#rt').onclick=()=>play(ch,df);$('#bk').onclick=()=>menu(true)}
function settings(K=4){const s=getSet(),b=s.keys[K]||DEF_KEYS[K],dup=new Set(b).size<b.length;
 openModal(`<h2>Settings</h2><label>ความเร็วโน้ต</label><div class="diffs">${[1,2,3,4,5,6].map(n=>`<button data-sp="${n}" class="${s.speed==n?'on':'alt'}">x${n}</button>`).join('')}</div>
 <h3>Key Binding (คีย์บอร์ด)</h3><p>จำนวนปุ่มถูกกำหนดโดยเพลงที่เลือก ตั้งปุ่มแยกตามจำนวนปุ่มของเพลงได้ที่นี่</p><div class="diffs">${Object.keys(DEF_KEYS).map(n=>`<button data-k="${n}" class="${n==K?'on':'alt'}">${n}K</button>`).join('')}</div>
 <label>คลิกช่องแล้วกดปุ่มที่ต้องการ (เลน ซ้าย→ขวา)</label><div class="grid">${b.map((k,i)=>`<input class="kb" data-i="${i}" value="${H(k)}" readonly>`).join('')}</div>${dup?'<p style="color:var(--red)">มีปุ่มซ้ำกัน</p>':''}
 <button class="alt" id="rk">คืนค่าเริ่มต้น ${K}K</button> <button onclick="closeModal()">เสร็จสิ้น</button>`);
 const M=$('#modal');M.querySelectorAll('[data-sp]').forEach(e=>e.onclick=()=>{s.speed=+e.dataset.sp;saveSet(s);settings(K)});M.querySelectorAll('[data-k]').forEach(e=>e.onclick=()=>settings(+e.dataset.k));
 $('#rk').onclick=()=>{delete s.keys[K];saveSet(s);settings(K)};
 M.querySelectorAll('.kb').forEach(e=>e.onkeydown=ev=>{ev.preventDefault();if(ev.key=='Tab')return;const nb=b.slice();nb[+e.dataset.i]=ev.key==' '?'space':ev.key.toLowerCase();s.keys[K]=nb;saveSet(s);settings(K)})}
function howto(){openModal(`<h2>✈ วิธีเล่น (สำหรับมือใหม่)</h2>
<p><b>เป้าหมาย:</b> โน้ตจะตกลงมาตามเลน กดปุ่มของเลนนั้น <u>ตอนที่โน้ตถึงเส้นสีเหลือง</u> ให้ตรงจังหวะที่สุด</p>
<p><b>ปุ่มบนคีย์บอร์ด:</b> เพลง 4 ปุ่มใช้ <kbd>D</kbd> <kbd>F</kbd> <kbd>J</kbd> <kbd>K</kbd> (เปลี่ยนได้ใน Settings) · <b>มือถือ:</b> แตะเลนบนจอได้เลย ใช้หลายนิ้วพร้อมกันได้ (แนะนำหมุนจอแนวนอน)</p>
<p><b>โน้ตกดค้าง (Hold):</b> โน้ตที่มีแท่งยาว ให้กดที่หัวโน้ตแล้ว <u>ค้างไว้จนสุดแท่ง</u> ถ้าปล่อยก่อนจะ BREAK และคอมโบขาด</p>
<p><b>การตัดสิน:</b> PERFECT (แม่นสุด) › GREAT › GOOD › MISS (พลาด/ไม่กด → คอมโบขาด)</p>
<p><b>คะแนน:</b> เต็ม 1,000,000 ยิ่งแม่นยิ่งสูง · เกรด S ≥95% · A ≥85% · B ≥70% · C ≥50%</p>
<p><b>เริ่มต้นแนะนำ:</b> เลือกเพลงระดับ <b>Easy</b> ความเร็ว x2–x3 ก่อน ถ้าโน้ตเร็วไปให้ลดใน Settings · ปุ่ม <kbd>Esc</kbd> หรือ ✕ เพื่อออกระหว่างเล่น</p>
<p><b>อันดับ:</b> คะแนนดีที่สุดของคุณในแต่ละระดับจะขึ้น Leaderboard ให้ผู้เล่นทุกคนเห็น</p><button onclick="closeModal()">เข้าใจแล้ว</button>`)}
$('#adminBtn').onclick=adminLogin;$('#helpBtn').onclick=howto;
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
(async()=>{try{const s=JSON.parse(localStorage.getItem('rm_session'));if(s){const u=await DB.get('users/'+s.n);if(u&&u.pw==s.h)return login(s.n,s.h)}}catch(e){}auth()})();
