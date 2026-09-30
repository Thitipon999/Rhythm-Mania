const AU={c:null,on:false,
 async init(){if(!this.c){this.c=new(window.AudioContext||window.webkitAudioContext)();const n=this.c.createBuffer(1,4410,44100),d=n.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);this.noise=n}await this.c.resume()},
 tone(f,t,d,type='sine',v=.2,f2){const c=this.c,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(c.destination);o.start(t);o.stop(t+d+.02)},
 hat(t,v=.07){const s=this.c.createBufferSource(),g=this.c.createGain();s.buffer=this.noise;g.gain.value=v;s.connect(g).connect(this.c.destination);s.start(t)},
 sfx(l){this.tone([523,659,784,988,1175,1319,1568][l%7],this.c.currentTime,.15,'triangle',.12)},
 start(bpm,t0,buf){this.stop();this.bi=0;this.bpm=bpm;this.t0=t0;this.on=true;this.custom=!!buf;
  if(buf){this.src=this.c.createBufferSource();this.src.buffer=buf;this.src.connect(this.c.destination);this.src.start(t0)}},
 tick(){if(!this.on||this.custom)return;const b=60/this.bpm;
  while(this.t0+this.bi*b/2<this.c.currentTime+.4){const i=this.bi++,t=this.t0+i*b/2,beat=i>>1,root=[55,55,65.4,49][(beat>>2)&3];
   if(i%2==0){this.tone(130,t,.16,'sine',.35,45);this.tone(root*2,t,b*.9,'sawtooth',.06)}else this.hat(t);
   this.tone(root*4*[1,1.2,1.5,1.8][i%4],t,b*.4,'square',.025)}},
 stop(){this.on=false;try{this.src&&this.src.stop()}catch(e){}this.src=null}};
