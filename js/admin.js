const ADMIN_PASS='2026';let ED=null,edSel=0,LIST=null;
const clone=o=>JSON.parse(JSON.stringify(o));
const errH=e=>`<p style="color:var(--red)">${H(e.message||e)}</p>`;
function adminLogin(){openModal(`<h2>STAFF LOGIN</h2><input id="ap" type="password" inputmode="numeric" placeholder="รหัสผ่านทีมพัฒนา"><p id="msg"></p><button id="ao">เข้าสู่ระบบ</button> <button class="alt" onclick="closeModal()">ยกเลิก</button>`);
 const go=()=>{if($('#ap').value===ADMIN_PASS)adminPanel('dash');else $('#msg').textContent='รหัสผ่านไม่ถูกต้อง'};$('#ao').onclick=go;$('#ap').onkeydown=e=>{if(e.key=='Enter')go()};$('#ap').focus()}
function adminPanel(tab){const T=(k,n)=>`<button class="${tab==k?'on':'alt'}" onclick="adminPanel('${k}')">${n}</button>`;
 openModal(`<div class="tabs">${T('dash','Dashboard')}${T('edit','เพิ่ม/แก้เพลง')}${T('db','Database')}<button class="bad" style="margin-left:auto" onclick="closeModal()">ปิด</button></div><div id="tb"></div>`);
 ({dash:dash,edit:e=>editor(e,true),db:dbTab})[tab]($('#tb'))}
async function dash(el){el.innerHTML='กำลังโหลด...';try{
 const[users,sc,plays]=await Promise.all([DB.keys('users'),DB.get('scores'),DB.get('stats/plays')]);
 const all=[],best={};Object.values(sc||{}).forEach(c=>Object.values(c).forEach(d=>Object.entries(d).forEach(([u,s])=>{all.push({u,score:s.score});best[u]=Math.max(best[u]||0,s.score)})));
 const top=all.sort((a,b)=>b.score-a.score)[0];
 el.innerHTML=`<div class="stats"><div><b>${users.length}</b>ผู้เล่นทั้งหมด</div><div><b>${top?top.score.toLocaleString():'-'}</b>ท็อปสกอร์${top?' ('+H(top.u)+')':''}</div><div><b>${plays||0}</b>จำนวนรอบการเล่นสะสม</div></div><canvas id="chartjs" height="120" style="background:#081428"></canvas>`;
 const names=Object.keys(best).sort((a,b)=>best[b]-best[a]).slice(0,15);
 if(window.Chart)new Chart($('#chartjs'),{type:'bar',data:{labels:names,datasets:[{label:'คะแนนสูงสุดของผู้เล่น',data:names.map(n=>best[n]),backgroundColor:'#ffb400'}]},options:{plugins:{legend:{labels:{color:'#e8f1ff'}}},scales:{x:{ticks:{color:'#e8f1ff'}},y:{ticks:{color:'#e8f1ff'},beginAtZero:true,suggestedMax:1000000}}}});
 else el.innerHTML+='<p>โหลด Chart.js ไม่ได้ (ตรวจอินเทอร์เน็ต)</p>'}catch(e){el.innerHTML=errH(e)}}
async function dbTab(el){el.innerHTML=`<p>โหมดฐานข้อมูล: <b>${DB.remote?'ออนไลน์ (Firebase) — ใช้ร่วมกันทุกเครื่อง':'ออฟไลน์ (เฉพาะเครื่องนี้)'}</b></p><button class="bad" id="rs">รีเซ็ตสถิติคะแนนผู้เล่นทุกคน</button><p style="color:#7a8aa8">บัญชีผู้เล่นและเพลงจะไม่ถูกลบ</p><p id="msg"></p>`;
 $('#rs').onclick=async()=>{if(!confirm('ลบคะแนนและจำนวนรอบทั้งหมดของทุกคน? ย้อนกลับไม่ได้'))return;try{await DB.put('scores',null);await DB.put('stats/plays',0);$('#msg').textContent='รีเซ็ตแล้ว'}catch(e){$('#msg').innerHTML=errH(e)}}}
const blank=()=>({id:'c'+Date.now(),ts:Date.now(),title:'',artist:'',bpm:120,diffs:[]});
function sync(){if(!ED||!$('#et'))return;ED.title=$('#et').value;ED.artist=$('#ea').value;ED.bpm=+$('#eb').value||120;
 document.querySelectorAll('.dr').forEach((r,i)=>{const d=ED.diffs[i];d.name=r.querySelector('.dn').value;d.level=+r.querySelector('.dv').value||1;d.keys=Math.min(10,Math.max(1,+r.querySelector('.dk').value||4))});
 const ta=$('#nt');if(ta&&ED.diffs[edSel])ED.diffs[edSel].notes=ta.value.split('\n').map(l=>l.trim().split(/[,\s]+/).map(Number)).filter(a=>a.length>=2&&!a.some(isNaN)).map(a=>({t:a[0],l:a[1],d:a[2]||0})).sort((a,b)=>a.t-b.t)}
async function editor(el,fresh){if(fresh||!LIST){el.innerHTML='กำลังโหลด...';try{LIST=await DB.charts()}catch(e){el.innerHTML=errH(e);return}}
 ED=ED||blank();const sd=ED.diffs[edSel];
 el.innerHTML=`<div class="drop"><b>① นำเข้าเพลงแบบง่าย</b><br>เลือกไฟล์ <b>.osz</b> (ได้ชื่อเพลง ศิลปิน BPM ทุกระดับความยาก และไฟล์เสียงครบในทีเดียว) หรือ .osu หลายไฟล์<br><input id="ez" type="file" multiple accept=".osz,.osu"><br><button class="alt" id="ag" style="margin-top:8px">หรือ: สร้างเพลงทดลองอัตโนมัติ 5 ระดับ (Easy–Challenge)</button></div><p id="msg"></p>
 <b>② ตรวจสอบ/แก้ไข</b> <select id="es"><option value="">— เพลงใหม่ —</option>${LIST.map(c=>`<option value="${c.id}" ${c.id==ED.id?'selected':''}>${H(c.title)}</option>`).join('')}</select>
 <div class="grid"><label>ชื่อเพลง<input id="et" value="${H(ED.title)}"></label><label>ศิลปิน<input id="ea" value="${H(ED.artist)}"></label><label>BPM<input id="eb" type="number" value="${ED.bpm}"></label><label>ไฟล์เสียง ${ED.audio||ED.hasAudio?'(มีแล้ว)':'(ไม่บังคับ ≤ 6MB)'}<input id="ef" type="file" accept="audio/*"></label></div>
 <datalist id="dl">${DIFF_NAMES.map(n=>`<option>${n}`).join('')}</datalist>
 <div class="scroll"><table><tr><th>ระดับ</th><th>Level</th><th>ปุ่ม</th><th>โน้ต</th><th></th></tr>${ED.diffs.map((d,i)=>`<tr class="dr"><td><input class="dn" list="dl" value="${H(d.name)}"></td><td><input class="dv" type="number" min="1" max="20" value="${d.level}"></td><td><input class="dk" type="number" min="1" max="10" value="${d.keys||4}"></td><td>${d.notes.length}</td><td><button class="alt" onclick="edPick(${i})">${i==edSel?'● ':''}โน้ต</button> <button class="bad" onclick="edDel(${i})">ลบ</button></td></tr>`).join('')||'<tr><td colspan=5>ยังไม่มีระดับ — นำเข้าไฟล์ด้านบน</td></tr>'}</table></div>
 <p><button class="alt" id="an">จัดชื่อ Easy→Challenge ตามความยาก</button></p>
 <details><summary>ขั้นสูง: แก้โน้ตด้วยมือ / เพิ่มระดับสุ่ม</summary><div class="grid"><label>Bars<input id="gb" type="number" value="32"></label><label>Density 0.1–0.95<input id="gd" type="number" step="0.05" value="0.5"></label><button onclick="edGen()">+ เพิ่มระดับสุ่ม</button></div>
 ${sd?`<label>โน้ตของ "${H(sd.name)}": เวลา(ms),เลน(เริ่ม 0),ความยาวโน้ตค้าง(ms)</label><textarea id="nt" rows="7">${sd.notes.map(n=>[n.t,n.l,n.d].join(',')).join('\n')}</textarea>`:''}</details>
 <p><button id="sv">③ บันทึกและเผยแพร่ให้ผู้เล่นทุกคน</button> <button class="bad" id="dl2">ลบเพลงนี้</button></p>`;
 $('#es').onchange=e=>{ED=e.target.value?clone(LIST.find(c=>c.id==e.target.value)):blank();edSel=0;editor(el)};
 $('#ef').onchange=e=>{const f=e.target.files[0];if(!f)return;if(f.size>6e6){alert('ไฟล์ใหญ่เกิน 6MB');e.target.value='';return}const r=new FileReader();r.onload=()=>{ED.audio=r.result;$('#msg').textContent='แนบไฟล์เสียงแล้ว: '+f.name};r.readAsDataURL(f)};
 $('#ez').onchange=async e=>{sync();const m=$('#msg');m.textContent='กำลังอ่านไฟล์...';try{const o=await importFiles([...e.target.files]);
  if(!o.diffs.length)return m.innerHTML=errH('ไม่พบ chart แบบ osu!mania ในไฟล์นี้');
  ED.title=ED.title||o.title;ED.artist=ED.artist||o.artist;ED.bpm=ED.title==o.title?o.bpm:ED.bpm;ED.diffs.push(...o.diffs);if(o.audio)ED.audio=o.audio;edSel=0;
  await editor(el);$('#msg').innerHTML=`นำเข้า ${o.diffs.length} ระดับ${o.skipped?` (ข้าม ${o.skipped} ไฟล์ที่ไม่ใช่ mania)`:''}${o.audio?' + ไฟล์เสียง':o.audioBig?' (ไฟล์เสียงใหญ่เกิน จึงไม่แนบ)':''} — ตรวจแล้วกด ③`}catch(x){m.innerHTML=errH(x)}};
 $('#ag').onclick=()=>{sync();ED.diffs=[.25,.4,.55,.75,.92].map((d,i)=>({id:rid(),name:DIFF_NAMES[i],level:[2,4,7,10,13][i],keys:4,notes:gen(ED.bpm,32,d,Date.now()%1e6+i)}));edSel=0;editor(el)};
 $('#an').onclick=()=>{sync();const n=ED.diffs.length;ED.diffs.slice().sort((a,b)=>a.notes.length-b.notes.length).forEach((d,i)=>d.name=DIFF_NAMES[Math.round(i*4/Math.max(1,n-1))]);editor(el)};
 $('#sv').onclick=async()=>{sync();const m=$('#msg');if(!ED.title.trim()||!ED.diffs.length)return m.innerHTML=errH('ต้องมีชื่อเพลงและอย่างน้อย 1 ระดับ');
  try{m.textContent='กำลังบันทึก...';const{audio,...c}=ED;c.hasAudio=!!(audio||ED.hasAudio);c.diffs.forEach(d=>d.id=d.id||rid());if(audio)await DB.put('audio/'+c.id,audio);await DB.put('charts/'+c.id,c);
   ED=clone(c);LIST=null;await editor(el,true);$('#msg').textContent='✔ เผยแพร่แล้ว ผู้เล่นทุกคนจะเห็นเพลงนี้'}catch(x){m.innerHTML=errH(x)}};
 $('#dl2').onclick=async()=>{if(!confirm('ลบเพลงนี้และคะแนนของเพลงนี้?'))return;try{for(const p of['charts/','audio/','scores/'])await DB.put(p+ED.id,null);ED=null;edSel=0;LIST=null;editor(el,true)}catch(x){$('#msg').innerHTML=errH(x)}}}
function edPick(i){sync();edSel=i;editor($('#tb'))}
function edDel(i){sync();ED.diffs.splice(i,1);edSel=0;editor($('#tb'))}
function edGen(){sync();const dn=+$('#gd').value||.5;ED.diffs.push({id:rid(),name:DIFF_NAMES[Math.min(4,dn*5|0)],level:Math.max(1,Math.round(dn*15)),keys:4,notes:gen(ED.bpm,+$('#gb').value||32,dn,Date.now()%1e6)});edSel=ED.diffs.length-1;editor($('#tb'))}
