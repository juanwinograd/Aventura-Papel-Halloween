import { HEROES, characterSVG, powerKey } from './characters.js';
import { CHAPTERS, MOVIE, SAVE_KEY, HOUSES, readSave } from './story.js';
import { Art } from './art.js';
import { HalloweenGame } from './engine.js';
const $=selector=>document.querySelector(selector),canvas=$('#game'),art=new Art(canvas),screen=$('#screen'),dialog=$('#help-dialog');
const input={};let saved=null,audio=null,sound=false,helpPaused=false;
try{saved=readSave(localStorage.getItem(SAVE_KEY));}catch{$('#save-note').textContent='El guardado no está disponible en este navegador.';}
const game=new HalloweenGame((event,data)=>{
  if(event==='save'){try{localStorage.setItem(SAVE_KEY,JSON.stringify(game.checkpoint()));}catch{$('#save-note').textContent='No se pudo guardar. Podés seguir jugando.';}return;}
  if(event==='sound'){playSound(data);return;}
  if(['stage','pause','resume','lost','won','movie'].includes(event))syncScreen();
  if(event==='hero')renderCast();
  updateHUD();
});
if(saved)game.hero=saved.hero;
function playSound(kind){
  if(!sound||!audio)return;
  const notes={candy:[659,880],attack:[190],hit:[330,440],power:[440,554,659],hurt:[160,110],page:[260,330],win:[523,659,784,1047]}[kind]||[440];
  notes.forEach((frequency,i)=>{const osc=audio.createOscillator(),gain=audio.createGain(),start=audio.currentTime+i*.09;osc.type='triangle';osc.frequency.setValueAtTime(frequency,start);gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.06,start+.015);gain.gain.exponentialRampToValueAtTime(.0001,start+.18);osc.connect(gain);gain.connect(audio.destination);osc.start(start);osc.stop(start+.2);});
}
function focusGame(){canvas.focus({preventScroll:true});}
function renderCast(){
  $('#cast').innerHTML=HEROES.map((hero,i)=>'<button class="hero-card" data-hero="'+i+'" aria-pressed="'+(game.hero===i)+'" aria-label="'+hero.name+', disfraz de '+hero.costume+'"><span class="shortcut">'+(i+1)+'</span>'+characterSVG(hero.id)+'<strong>'+hero.name+'</strong><small>'+hero.costume+'</small></button>').join('');
  const h=HEROES[game.hero];$('#character-description').innerHTML='<b>'+h.name+' · '+h.costume+'.</b> Conserva sus poderes originales. Elegí un poder abajo o usá su tecla.';
  $('#powers-toolbar').innerHTML=h.powers.map((ability,i)=>'<button class="ability" data-power="'+i+'"><kbd>'+powerKey(h,i).toUpperCase()+'</kbd><span>'+ability.name+'</span><small>Listo</small></button>').join('');
}
function updateHUD(){
  $('#chapters').innerHTML=CHAPTERS.map((ch,i)=>'<li class="chapter '+(i===game.stage&&!game.won?'active':i<game.stage||game.won?'done':'')+'" '+(i===game.stage?'aria-current="step"':'')+'><span class="chapter-number">'+(i<game.stage||game.won?'✓':'0'+(i+1))+'</span><div><strong>'+ch.title+'</strong><small>'+ch.subtitle+'</small></div><span class="chapter-symbol" aria-hidden="true">'+ch.icon+'</span></li>').join('');
  $('#chapter-label').textContent=game.mode==='title'?'LA AVENTURA ESTÁ POR EMPEZAR':'PARTE '+(game.stage+1)+' · '+CHAPTERS[game.stage].title.toUpperCase();
  $('#hearts').textContent='♥ '.repeat(game.hp)+'♡ '.repeat(5-game.hp);$('#hearts').setAttribute('aria-label',game.hp+' de 5 corazones');
  $('#bag').textContent=game.stage===1&&game.blackout?'Arreglos '+game.progress.repairs.length+' / 3':game.stage===2?'Llaves '+game.progress.keys.length+' / 3':game.stage===3?'Dulces recuperados: '+(game.won?'12':'0'):'Dulces '+game.progress.candy+' / 12';
  $('#power-status').textContent=game.stage===1&&!game.blackout?'▷ Función en curso':'✦ Poderes de Halloween + originales';
  for(const button of document.querySelectorAll('[data-power]')){const left=game.cooldowns[game.hero+':'+button.dataset.power]||0;button.querySelector('small').textContent=left>0?Math.ceil(left)+' s':'Listo';button.disabled=game.mode!=='playing'||left>0;}
  $('#touch-extra').hidden=HEROES[game.hero].special.length<2;
  const resident=$('#resident');resident.hidden=game.stage!==0||!game.challenge||game.mode!=='playing';
  if(!resident.hidden){const h=HOUSES[game.challenge.index],hero=HEROES.find(hero=>hero.id===h.hero),index=HEROES.indexOf(hero);$('#resident-name').textContent=h.resident+' · Casa '+(game.challenge.index+1);$('#resident-request').textContent=h.request;$('#resident-choose').textContent='Elegir a '+hero.name;$('#resident-choose').dataset.hero=index;$('#resident-progress').textContent=game.props.filter(p=>p.done).length+' / 3';}
  $('#objective').textContent=game.stage===0&&game.challenge?HOUSES[game.challenge.index].request:game.won?'¡Halloween está a salvo! Los ocho amigos vuelven al barrio para compartir sus dulces.':game.mode==='title'?'Prepará tu disfraz. La noche de Halloween nos espera.':CHAPTERS[game.stage].objective;
  $('#pause').disabled=!['playing','movie','paused'].includes(game.mode);$('#pause').textContent=game.mode==='paused'?'▷':'Ⅱ';$('#pause').setAttribute('aria-label',game.mode==='paused'?'Continuar juego':'Pausar juego');
  if(game.mode==='movie'){const frame=MOVIE[game.progress.movie];$('#movie-speaker').textContent=frame.speaker;$('#movie-text').textContent=frame.text;$('#movie-next').textContent=game.progress.movie===2?'Ofrecernos para repararlo →':game.progress.movie===MOVIE.length-1?'Entrar a la casa →':'Siguiente →';}
}
function syncScreen(){
  const mode=game.mode;screen.hidden=['playing','movie'].includes(mode);$('.viewport').classList.toggle('playing',mode==='playing');$('#movie-caption').hidden=mode!=='movie';
  if(mode==='paused')screen.innerHTML='<div class="screen-card"><span class="screen-kicker">LOS FANTASMAS TAMBIÉN DESCANSAN</span><h2>Una pequeña<br><em>pausa.</em></h2><p>Tu equipo te espera justo donde lo dejaste.</p><button class="primary" data-screen-action="resume">Seguir jugando →</button><button class="subtle" data-screen-action="restart">Reiniciar esta parte</button></div>';
  if(mode==='lost')screen.innerHTML='<div class="screen-card"><span class="screen-kicker">HASTA LOS MÁS VALIENTES SE ASUSTAN</span><h2>¡Menudo<br><em>susto!</em></h2><p>Respirá hondo, acomodate el disfraz<br>y probá otra vez. ¡El equipo está con vos!</p><button class="primary" data-screen-action="restart">Reintentar esta parte →</button></div>';
  if(mode==='won')screen.innerHTML='<div class="screen-card"><span class="screen-kicker">CUATRO AVENTURAS · OCHO GRANDES AMIGOS</span><h2>¡Salvamos<br><em>Halloween!</em></h2><p>La Gran Calabaza devolvió los dulces.<br>Ahora sí, ¡a compartirlos con todo el barrio!</p><button class="primary" data-screen-action="new">Volver a jugar →</button><p class="screen-footnote">Gaspar · Vicente · Fabrizio · Luca<br>Aaron Mamani · Sebástian · Benicio · Amaral</p></div>';
  if(!screen.hidden&&mode!=='title')screen.querySelector('.primary')?.focus({preventScroll:true});
  updateHUD();
}
screen.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  const action=button.dataset.screenAction;
  if(button.id==='start'||action==='new'){game.start();renderCast();focusGame();}
  if(button.id==='continue'&&saved){game.start(saved);renderCast();if(!game.won)focusGame();}
  if(action==='resume'){game.pause();focusGame();}
  if(action==='restart'){game.enter(game.stage);focusGame();}
});
$('#continue').hidden=!saved;
if(saved)$('#start').innerHTML='Empezar de nuevo <span>→</span>';
$('#cast').addEventListener('click',event=>{const card=event.target.closest('[data-hero]');if(card){game.chooseHero(Number(card.dataset.hero));if(game.mode==='playing')focusGame();}});
$('#pause').addEventListener('click',()=>{clearInput();game.pause();if(game.mode!=='paused')focusGame();});
$('#movie-next').addEventListener('click',()=>{game.nextMovie();if(game.mode==='playing')focusGame();});
$('#sound').addEventListener('click',async()=>{try{if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();await audio.resume();sound=!sound;$('#sound').setAttribute('aria-pressed',String(sound));$('#sound').textContent='Sonido: '+(sound?'sí':'no');if(sound)playSound('candy');}catch{$('#sound').textContent='Sonido no disponible';}});
$('#help').addEventListener('click',()=>{clearInput();helpPaused=['playing','movie'].includes(game.mode);if(helpPaused)game.pause();dialog.showModal();});
for(const button of dialog.querySelectorAll('.close,.close-help'))button.addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{if(helpPaused&&game.mode==='paused'){game.pause();focusGame();}helpPaused=false;});
const keyMap={ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'};
function clearInput(){for(const key of Object.keys(input))delete input[key];}
window.addEventListener('keydown',event=>{
  if(dialog.open||event.ctrlKey||event.metaKey||event.altKey)return;
  const key=event.key.length===1?event.key.toLowerCase():event.key;
  if(event.target.closest('button,a')&&[' ','Enter'].includes(key))return;
  if(keyMap[key]){event.preventDefault();input[keyMap[key]]=true;}
  if([' ','e','q','r','z','x','c','v','p','Escape'].includes(key))event.preventDefault();
  if(event.repeat)return;
  if(key==='e'||key===' ')game.action();
  const ability=HEROES[game.hero].powers.findIndex((_,i)=>powerKey(HEROES[game.hero],i)===key);if(ability>=0){event.preventDefault();game.power(ability);}
  if(key==='p'||key==='Escape'){clearInput();game.pause();}
  if(/^[1-8]$/.test(key))game.chooseHero(Number(key)-1);
});
window.addEventListener('keyup',event=>{const key=event.key.length===1?event.key.toLowerCase():event.key;if(keyMap[key])delete input[keyMap[key]];});
window.addEventListener('blur',()=>{clearInput();if(['playing','movie'].includes(game.mode))game.pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(['playing','movie'].includes(game.mode))game.pause();}});
for(const button of document.querySelectorAll('[data-move]')){
  const direction=button.dataset.move;button.addEventListener('pointerdown',event=>{event.preventDefault();button.setPointerCapture(event.pointerId);input[direction]=true;});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,()=>delete input[direction]);
}
for(const [selector,action] of [['#touch-action',()=>game.action()],['#touch-power',()=>game.power()]])$(selector).addEventListener('pointerdown',event=>{event.preventDefault();action();});
$('#powers-toolbar').addEventListener('click',event=>{const button=event.target.closest('[data-power]');if(button){game.power(Number(button.dataset.power));focusGame();}});
$('#resident-choose').addEventListener('click',event=>{game.chooseHero(Number(event.currentTarget.dataset.hero));focusGame();});
$('#touch-extra').addEventListener('pointerdown',event=>{event.preventDefault();game.power(1);});
canvas.addEventListener('pointerdown',focusGame);
renderCast();updateHUD();
let last=performance.now(),hudClock=0;
function frame(now){const dt=Math.min((now-last)/1000,.04);last=now;game.update(dt,input);art.draw(game);hudClock+=dt;if(hudClock>.2){hudClock=0;updateHUD();}requestAnimationFrame(frame);}
requestAnimationFrame(frame);
