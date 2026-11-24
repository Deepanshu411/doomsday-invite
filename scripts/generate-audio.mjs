import {writeFile} from 'node:fs/promises';
// Original score: soft ensemble pads, felt-like notes and a rounded pulse.
const sampleRate=32000, duration=32, count=sampleRate*duration;
const left=new Float32Array(count),right=new Float32Array(count);
const midi=n=>440*2**((n-69)/12);
const chords=[[40,47,55,59],[36,43,52,55],[33,45,52,59],[35,47,54,59]];
function note(t,frequency){return Math.sin(2*Math.PI*frequency*t)+.12*Math.sin(4*Math.PI*frequency*t)+.025*Math.sin(6*Math.PI*frequency*t);}
const melody=[64,null,59,null,67,null,62,null,64,null,59,null,55,null,59,null];
let peak=0;
for(let i=0;i<count;i++){
 const t=i/sampleRate;let l=0,r=0;
 for(let chord=0;chord<4;chord++){
  let delta=(t-chord*8+duration)%duration;if(delta>duration-2)delta-=duration;
  if(delta>=-2&&delta<10){
   const fadeIn=Math.sin(Math.min(1,Math.max(0,(delta+2)/3))*Math.PI/2)**2;
   const fadeOut=Math.sin(Math.min(1,Math.max(0,(10-delta)/3))*Math.PI/2)**2;
   const envelope=fadeIn*fadeOut*(.92+.08*Math.sin(2*Math.PI*t/8));
   chords[chord].forEach((pitch,index)=>{const f=midi(pitch);const level=[.075,.038,.033,.022][index]*envelope;l+=note(t,f*.9991)*level;r+=note(t,f*1.0009)*level;});
  }
 }
 // Sparse struck notes with a soft attack and gently decaying upper partials.
 for(let step=0;step<16;step++){
  const pitch=melody[step];if(pitch===null)continue;
  const age=(t-step*2+duration)%duration;if(age>7)continue;
  const f=midi(pitch),attack=1-Math.exp(-age*18);
  const tone=(Math.sin(2*Math.PI*f*age)*Math.exp(-age/2.2)+.18*Math.sin(2*Math.PI*f*2.002*age)*Math.exp(-age/.7))*.11*attack;
  const pan=step%2?.65:.35;l+=tone*(1-pan);r+=tone*pan;
  for(const delay of [.31,.63,.97]){const a=age-delay;if(a>0){const echo=Math.sin(2*Math.PI*f*a)*Math.exp(-a/1.8)*(1-Math.exp(-a*15))*.018*(1-delay/1.3);l+=echo;r+=echo*.85;}}
 }
 const beat=t%2;const pulse=(1-Math.exp(-beat*12))*Math.exp(-beat*4)*.12;const bass=Math.sin(2*Math.PI*82.4069*t)*pulse;l+=bass;r+=bass;
 const fade=Math.min(1,t/.2,(duration-t)/.5);
 left[i]=l*fade;right[i]=r*fade;peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));
}
const channels=2,bytesPerFrame=channels*2,wav=Buffer.alloc(44+count*bytesPerFrame);
wav.write('RIFF',0);wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(channels,22);wav.writeUInt32LE(sampleRate,24);wav.writeUInt32LE(sampleRate*bytesPerFrame,28);wav.writeUInt16LE(bytesPerFrame,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(count*bytesPerFrame,40);
let squares=0;
for(let i=0;i<count;i++)for(let channel=0;channel<2;channel++){const v=(channel?right[i]:left[i])*.72/peak;squares+=v*v;wav.writeInt16LE(Math.round(v*32767),44+i*4+channel*2);}
await writeFile(new URL('../dist/assets/doomsday-ambience-v2.wav',import.meta.url),wav);
console.log(JSON.stringify({duration,sampleRate,channels,peak:.72,rms:Math.sqrt(squares/(count*channels)),bytes:wav.length}));
