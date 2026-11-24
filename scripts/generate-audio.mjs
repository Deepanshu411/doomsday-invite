import {writeFile} from 'node:fs/promises';
const sampleRate=44100, duration=16, count=sampleRate*duration;
const samples=new Float32Array(count);
const notes=[[110,.23],[164.8125,.12],[220,.12],[261.625,.045],[329.625,.06],[440,.025]];
let seed=616,wind=0,peak=0;
for(let i=0;i<count;i++){
 const t=i/sampleRate;
 let value=0;
 for(const [frequency,level] of notes)value+=Math.sin(2*Math.PI*frequency*t)*level*(.85+.15*Math.cos(2*Math.PI*t/8));
 const beat=t%1;
 value+=(Math.sin(2*Math.PI*1100*beat)*.17+Math.sin(2*Math.PI*1650*beat)*.08)*Math.exp(-beat*65)*Math.min(1,beat/.002);
 const pulse=t%2;
 value+=Math.sin(2*Math.PI*73*pulse)*Math.exp(-pulse*6)*.12*Math.min(1,pulse/.01);
 seed=(Math.imul(seed,1664525)+1013904223)>>>0;
 wind=.96*wind+.04*((seed/4294967296)*2-1);
 value+=wind*.09;
 const edge=Math.min(1,t/.03,(duration-t)/.03);
 samples[i]=Math.tanh(value*1.35)*edge;
 peak=Math.max(peak,Math.abs(samples[i]));
}
const wav=Buffer.alloc(44+count*2);
wav.write('RIFF',0);wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(sampleRate,24);wav.writeUInt32LE(sampleRate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(count*2,40);
let squares=0;
for(let i=0;i<count;i++){const normalized=samples[i]*(.82/peak);squares+=normalized*normalized;wav.writeInt16LE(Math.round(normalized*32767),44+i*2);}
await writeFile(new URL('../dist/assets/doomsday-ambience.wav',import.meta.url),wav);
console.log(JSON.stringify({duration,sampleRate,peak:.82,rms:Math.sqrt(squares/count),bytes:wav.length}));
