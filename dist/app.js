(() => {
'use strict';
const $ = (id) => document.getElementById(id);
const releaseDate = Date.parse('2026-12-17T00:00:00+05:30');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function remainingTime(now = Date.now()) {
 const seconds = Math.max(0, Math.floor((releaseDate - now) / 1000));
 return { days: Math.floor(seconds / 86400), hours: Math.floor(seconds / 3600) % 24, minutes: Math.floor(seconds / 60) % 60, seconds: seconds % 60 };
}
function tick() {
 const time = remainingTime();
 for (const [unit,value] of Object.entries(time)) $(unit).textContent = String(value).padStart(unit === 'days' ? 3 : 2, '0');
 if (Date.now() >= releaseDate) $('clock-status').textContent = 'DOOMSDAY HAS ARRIVED';
}
tick(); setInterval(tick, 1000);
if ('IntersectionObserver' in window) {
 document.documentElement.classList.add('js-ready');
 const observer = new IntersectionObserver((entries) => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), {threshold: .08});
 document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
const dossiers = {
 doom: {label:'MID-CREDITS · THE FANTASTIC FOUR: FIRST STEPS',title:'The man behind the mask.',body:'The mid-credits scene brings a hooded Doctor Doom into Franklin Richards’ orbit. The mask is the clue. Where the encounter leads is still a question for Doomsday.',detail:'OBSERVED: A hooded visitor with Doom’s mask near Franklin. The image on this page is official Doomsday promotional art, not a frame from that scene.',source:'https://time.com/7304793/the-fantastic-four-first-steps-end-credits-scene-mcu/'},
 ship: {label:'POST-CREDITS · THUNDERBOLTS*',title:'An arrival from elsewhere.',body:'The New Avengers are alerted to an extradimensional spacecraft entering their world. Its Fantastic Four emblem is the reveal. The scene establishes an arrival; the identity of every passenger is not confirmed by that shot.',detail:'OBSERVED: An extradimensional ship bearing the Fantastic Four emblem. The animated ship here is a stylized fan illustration.',source:'https://comicbook.com/movies/news/why-fantastic-four-doesnt-address-thunderbolts-post-credits-scene/'},
 xmen: {label:'OFFICIAL TEASER · AVENGERS: DOOMSDAY',title:'The X-Men will return.',body:'Marvel’s official X-Men teaser places the mutants in the Doomsday conversation. Familiar alliances and rivalries are back in play. The archive’s X-shaped vault is a visual tribute to their cinematic legacy.',detail:'CONFIRMED: The X-Men appear in official Doomsday promotional footage. The vault illustration is an homage, not a claimed recreation of a teaser frame.',source:'https://www.youtube.com/watch?v=kH1XlwHQv9o'}
};
document.querySelectorAll('[data-evidence]').forEach(button => button.addEventListener('click', () => {
 const dossier = dossiers[button.dataset.evidence];
 $('dossier-label').textContent = dossier.label; $('dossier-title').textContent = dossier.title;
 $('dossier-body').textContent = dossier.body; $('dossier-detail').textContent = dossier.detail;
 $('dossier-source').href = dossier.source; $('dossier-dialog').showModal();
}));
$('trailer').addEventListener('click', () => $('trailer-dialog').showModal());
document.querySelectorAll('dialog').forEach(dialog => {
 dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
 dialog.addEventListener('click', event => { const r=dialog.getBoundingClientRect(); if (event.target===dialog && (event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)) dialog.close(); });
});
let toastTimer;
function toast(message) { $('toast').textContent = message; $('toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),4000); }
function download(content,type,filename) { const url=URL.createObjectURL(new Blob([content],{type})); const a=document.createElement('a'); a.href=url; a.download=filename; document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000); }
let traveler = '';
function seal(name) { traveler = name; $('invite-form').hidden = true; $('invite-success').hidden = false; $('guest-confirmation').textContent = name + ', your summons is sealed.'; }
try { const saved=localStorage.getItem('doomsday-traveler'); if(saved && saved.trim()) seal(saved.slice(0,48)); } catch {}
$('invite-form').addEventListener('submit', event => { event.preventDefault(); const name=$('guest').value.trim(); if(!name) { $('guest').setCustomValidity('Enter your name to seal the invitation.'); $('guest').reportValidity(); return; } try {localStorage.setItem('doomsday-traveler',name);}catch{} seal(name); toast('TRANSMISSION RECEIVED. YOUR SUMMONS IS SEALED.'); });
$('guest').addEventListener('input',()=>$('guest').setCustomValidity(''));
$('edit-name').addEventListener('click',()=>{ $('invite-form').hidden=false; $('invite-success').hidden=true; $('guest').value=traveler; $('guest').focus(); try{localStorage.removeItem('doomsday-traveler');}catch{} });
const escapeXml = text => text.replace(/[<>&"']/g, c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
$('download-pass').addEventListener('click', () => {
 const name = escapeXml(traveler);
 const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="600" viewBox="0 0 1000 600"><rect width="1000" height="600" fill="#0a100a"/><rect x="22" y="22" width="956" height="556" fill="none" stroke="#6e8951"/><rect x="32" y="32" width="936" height="536" fill="none" stroke="#283721"/><g fill="#c5ee91" font-family="Arial,sans-serif" text-anchor="middle"><text x="500" y="90" font-size="13" letter-spacing="5">LATVERIAN PRIORITY DISPATCH</text><text x="500" y="195" font-size="78" font-weight="900">YOU ARE SUMMONED.</text><text x="500" y="252" font-size="22" letter-spacing="3">AVENGERS: DOOMSDAY</text><text x="500" y="335" font-size="30" textLength="'+Math.min(800,traveler.length*18)+'" lengthAdjust="spacingAndGlyphs">'+name+'</text><text x="500" y="400" font-size="20" letter-spacing="3">DECEMBER 17, 2026</text><text x="500" y="446" font-size="14">Your universe. Your theater. Your people.</text><text x="500" y="510" font-size="11" fill="#83936e">FAN INVITATION · NOT A MOVIE TICKET · NO RESERVED SEAT</text><text x="500" y="542" font-size="10" fill="#83936e">Marvel characters belong to Marvel.</text></g></svg>';
 download(svg,'image/svg+xml','doomsday-invitation.svg'); toast('YOUR INVITATION HAS BEEN DOWNLOADED.');
});
$('calendar').addEventListener('click', () => $('calendar-dialog').showModal());
const ambience = $('ambience');
const soundButton = $('sound');
let soundPending = false;
let resumeOnVisible = false;
ambience.volume = 0.45;
function updateSoundState() {
 const playing = !ambience.paused && !ambience.ended;
 soundButton.setAttribute('aria-pressed', String(playing));
 soundButton.setAttribute('aria-label', playing ? 'Mute cinematic ambience' : 'Play cinematic ambience');
 $('sound-label').textContent = playing ? 'SOUND ON' : 'SOUND OFF';
}
async function playAmbience() {
 try {
 // Keep play() directly in the click handler's call stack for mobile playback policies.
 await ambience.play();
 updateSoundState();
 } catch {
 ambience.pause();
 updateSoundState();
 toast('SOUND COULD NOT START. TAP SOUND OFF TO TRY AGAIN.');
 }
}
async function toggleSound() {
 if (soundPending) return;
 resumeOnVisible = false;
 if (!ambience.paused) { ambience.pause(); updateSoundState(); return; }
 soundPending = true;
 soundButton.disabled = true;
 soundButton.setAttribute('aria-busy', 'true');
 try { await playAmbience(); }
 finally { soundPending = false; soundButton.disabled = false; soundButton.setAttribute('aria-busy', 'false'); }
}
['play', 'playing', 'pause', 'ended'].forEach(type => ambience.addEventListener(type, updateSoundState));
ambience.addEventListener('error', () => {
 ambience.pause(); updateSoundState();
 toast('AMBIENT AUDIO COULD NOT LOAD. RELOAD THE PAGE AND TRY AGAIN.');
});
soundButton.addEventListener('click', toggleSound);
updateSoundState();
document.addEventListener('visibilitychange', () => {
 if (document.hidden) {
 resumeOnVisible = !ambience.paused;
 if (resumeOnVisible) ambience.pause();
 } else if (resumeOnVisible) {
 resumeOnVisible = false;
 void playAmbience();
 }
});

const canvas=$('particles'), context=canvas.getContext('2d');
let particles=[], animation, particleWidth=0,particleHeight=0;
function resizeParticles(){ const box=canvas.getBoundingClientRect(); particleWidth=box.width;particleHeight=box.height; const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=particleWidth*dpr;canvas.height=particleHeight*dpr;context?.setTransform(dpr,0,0,dpr,0,0); particles=Array.from({length:42},()=>({x:Math.random()*particleWidth,y:Math.random()*particleHeight,r:Math.random()*1.2+.3,speed:Math.random()*.22+.08,alpha:Math.random()*.45+.1})); }
function drawParticles(){if(!context)return;context.clearRect(0,0,particleWidth,particleHeight);for(const p of particles){p.y-=p.speed;if(p.y<0){p.y=particleHeight;p.x=Math.random()*particleWidth;}context.fillStyle='rgba(180,220,130,'+p.alpha+')';context.beginPath();context.arc(p.x,p.y,p.r,0,Math.PI*2);context.fill();}animation=requestAnimationFrame(drawParticles);}
function syncParticles(){cancelAnimationFrame(animation);if(!reducedMotion.matches&&!document.hidden)drawParticles();else context?.clearRect(0,0,particleWidth,particleHeight);}
resizeParticles();syncParticles();window.addEventListener('resize',resizeParticles);document.addEventListener('visibilitychange',syncParticles);reducedMotion.addEventListener('change',syncParticles);
let secret='';document.addEventListener('keydown',event=>{if(/INPUT|TEXTAREA/.test(event.target.tagName))return;secret=(secret+event.key.toLowerCase()).slice(-4);if(secret==='doom'){document.documentElement.classList.toggle('doom-protocol');toast('LATVERIAN PROTOCOL: ALL HAIL DOOM.');$('secret-count').textContent='LATVERIA FOREVER';}});
})();