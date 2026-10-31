import { HEROES, characterSVG, powerKey } from './characters.js';
import { CHAPTERS, MOVIE, SAVE_KEY, HOUSES, readSave } from './story.js';
import { Art } from './art.js';
import { HalloweenGame } from './engine.js';
import { PaperDuel, duelPowers, BONUS_POWERS } from './duel.js';
import { DUEL_HEROES, duelCharacterSVG } from './duel-characters.js';
import { DUEL_UNLOCK_KEY, readUnlocks, redeemDuelCode, availableDuelIndices } from './duel-unlocks.js';
const $=selector=>document.querySelector(selector),canvas=$('#game'),art=new Art(canvas),screen=$('#screen'),dialog=$('#help-dialog');
const duelInput=[{},{}];let duel=null,duelMenu=false,duelSelection=[0,2],helpDuel=false;
let duelUnlocks=[];try{duelUnlocks=readUnlocks(localStorage.getItem(DUEL_UNLOCK_KEY));}catch{}
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
  if(duel||duelMenu){updateDuelHUD();return;}
  $('#chapters').innerHTML=CHAPTERS.map((ch,i)=>'<li class="chapter '+(i===game.stage&&!game.won?'active':i<game.stage||game.won?'done':'')+'" '+(i===game.stage?'aria-current="step"':'')+'><span class="chapter-number">'+(i<game.stage||game.won?'✓':'0'+(i+1))+'</span><div><strong>'+ch.title+'</strong><small>'+ch.subtitle+'</small></div><span class="chapter-symbol" aria-hidden="true">'+ch.icon+'</span></li>').join('');
  $('#chapter-label').textContent=game.mode==='title'?'LA AVENTURA ESTÁ POR EMPEZAR':'PARTE '+(game.stage+1)+' · '+CHAPTERS[game.stage].title.toUpperCase();
  $('#hearts').textContent='♥ '.repeat(game.hp)+'♡ '.repeat(5-game.hp);$('#hearts').setAttribute('aria-label',game.hp+' de 5 corazones');
  $('#bag').textContent=game.stage===1&&game.blackout?'Arreglos '+game.progress.repairs.length+' / 3':game.stage===2?'Llaves '+game.progress.keys.length+' / 3':game.stage===3?'Dulces recuperados: '+(game.won?'12':'0'):'Dulces '+game.progress.candy+' / 12';
  $('#power-status').textContent=game.stage===1&&!game.blackout?'▷ Función en curso':'✦ Poderes de Halloween + originales';
  for(const button of document.querySelectorAll('[data-power]')){const left=game.cooldowns[game.hero+':'+button.dataset.power]||0;button.querySelector('small').textContent=left>0?Math.ceil(left)+' s':'Listo';button.disabled=game.mode!=='playing'||left>0;}
  $('#touch-extra').hidden=HEROES[game.hero].special.length<2;
  const resident=$('#resident');resident.hidden=game.stage!==0||!game.challenge||game.mode!=='playing';
  if(!resident.hidden){const h=HOUSES[game.challenge.index];$('#resident-name').textContent=h.resident+' · Casa '+(game.challenge.index+1);$('#resident-request').textContent=h.request;$('#resident-progress').textContent=game.props.filter(p=>p.done).length+' / 3';}
  $('#objective').textContent=game.stage===0&&game.challenge?HOUSES[game.challenge.index].request:game.won?'¡Halloween está a salvo! Los ocho amigos vuelven al barrio para compartir sus dulces.':game.mode==='title'?'Prepará tu disfraz. La noche de Halloween nos espera.':CHAPTERS[game.stage].objective;
  $('#pause').disabled=!['playing','movie','paused'].includes(game.mode);$('#pause').textContent=game.mode==='paused'?'▷':'Ⅱ';$('#pause').setAttribute('aria-label',game.mode==='paused'?'Continuar juego':'Pausar juego');
  if(game.mode==='movie'){const frame=MOVIE[game.progress.movie];$('#movie-speaker').textContent=frame.speaker;$('#movie-text').textContent=frame.text;$('#movie-next').textContent=game.progress.movie===2?'Ofrecernos para repararlo →':game.progress.movie===MOVIE.length-1?'Entrar a la casa →':'Siguiente →';}
}
function syncScreen(){
  const mode=game.mode;screen.hidden=['playing','movie'].includes(mode);$('.viewport').classList.toggle('playing',mode==='playing');$('#movie-caption').hidden=mode!=='movie';
  if(mode==='paused')screen.innerHTML='<div class="screen-card"><span class="screen-kicker">LOS FANTASMAS TAMBIÉN DESCANSAN</span><h2>Una pequeña<br><em>pausa.</em></h2><p>Tu equipo te espera justo donde lo dejaste.</p><button class="primary" data-screen-action="resume">Seguir jugando →</button><button class="subtle" data-screen-action="restart">Reiniciar esta parte</button></div>';
  if(mode==='lost')screen.innerHTML='<div class="screen-card"><span class="screen-kicker">HASTA LOS MÁS VALIENTES SE ASUSTAN</span><h2>¡Menudo<br><em>susto!</em></h2><p>Respirá hondo, acomodate el disfraz<br>y probá otra vez. ¡El equipo está con vos!</p><button class="primary" data-screen-action="restart">Reintentar esta parte →</button></div>';
  if(mode==='won')screen.innerHTML='<div class="screen-card"><span class="screen-kicker">CUATRO AVENTURAS · OCHO GRANDES AMIGOS</span><h2>¡Salvamos<br><em>Halloween!</em></h2><p>La Gran Calabaza devolvió los dulces.<br>Ahora sí, ¡a compartirlos con todo el barrio!</p><button class="primary" data-screen-action="duel-menu">Pelear entre nosotros →</button><button class="subtle" data-screen-action="new">Volver a jugar la aventura</button><p class="screen-footnote">Gaspar · Vicente · Fabrizio · Luca<br>Aaron Mamani · Sebástian · Benicio · Amaral</p></div>';
  if(!screen.hidden&&mode!=='title')screen.querySelector('.primary')?.focus({preventScroll:true});
  updateHUD();
}
screen.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  const action=button.dataset.screenAction;
  if(action?.startsWith('duel-')){duelScreenAction(action);return;}
  if(button.id==='start'||action==='new'){game.start();renderCast();focusGame();}
  if(button.id==='continue'&&saved){game.start(saved);renderCast();if(!game.won)focusGame();}
  if(action==='resume'){game.pause();focusGame();}
  if(action==='restart'){game.enter(game.stage);focusGame();}
});
$('#continue').hidden=!saved;
if(saved)$('#start').innerHTML='Empezar de nuevo <span>→</span>';
if(saved?.won)screen.querySelector('.screen-card').insertAdjacentHTML('beforeend','<button class="subtle" data-screen-action="duel-menu">Combates de Halloween desbloqueados →</button>');
$('#cast').addEventListener('click',event=>{const card=event.target.closest('[data-hero]');if(card){game.chooseHero(Number(card.dataset.hero));if(game.mode==='playing')focusGame();}});
$('#pause').addEventListener('click',()=>{clearInput();if(duel){duel.pause();syncDuelScreen();return;}game.pause();if(game.mode!=='paused')focusGame();});
$('#movie-next').addEventListener('click',()=>{game.nextMovie();if(game.mode==='playing')focusGame();});
$('#sound').addEventListener('click',async()=>{try{if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();await audio.resume();sound=!sound;$('#sound').setAttribute('aria-pressed',String(sound));$('#sound').textContent='Sonido: '+(sound?'sí':'no');if(sound)playSound('candy');}catch{$('#sound').textContent='Sonido no disponible';}});
$('#help').addEventListener('click',()=>{clearInput();helpDuel=duel?.state==='playing';if(helpDuel){duel.pause();syncDuelScreen();}helpPaused=['playing','movie'].includes(game.mode);if(helpPaused)game.pause();dialog.showModal();});
for(const button of dialog.querySelectorAll('.close,.close-help'))button.addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{if(helpDuel&&duel?.state==='paused'){duel.pause();syncDuelScreen();}helpDuel=false;if(helpPaused&&game.mode==='paused'){game.pause();focusGame();}helpPaused=false;});
const keyMap={ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'};
function clearInput(){for(const key of Object.keys(input))delete input[key];for(const state of duelInput)for(const key of Object.keys(state))delete state[key];}
window.addEventListener('keydown',event=>{
  if(dialog.open||event.ctrlKey||event.metaKey||event.altKey||event.target.closest('input,textarea,select,[contenteditable="true"]'))return;
  const key=event.key.length===1?event.key.toLowerCase():event.key;
  if(duel){handleDuelKey(event,key);return;}
  if(event.target.closest('button,a')&&[' ','Enter'].includes(key))return;
  if(keyMap[key]){event.preventDefault();input[keyMap[key]]=true;}
  if([' ','e','q','r','z','x','c','v','p','Escape'].includes(key))event.preventDefault();
  if(event.repeat)return;
  if(key==='e'||key===' ')game.action();
  const ability=HEROES[game.hero].powers.findIndex((_,i)=>powerKey(HEROES[game.hero],i)===key);if(ability>=0){event.preventDefault();game.power(ability);}
  if(key==='p'||key==='Escape'){clearInput();game.pause();}
  if(/^[1-8]$/.test(key))game.chooseHero(Number(key)-1);
});
window.addEventListener('keyup',event=>{if(duel){releaseDuelKey(event.key);return;}const key=event.key.length===1?event.key.toLowerCase():event.key;if(keyMap[key])delete input[keyMap[key]];});
window.addEventListener('blur',()=>{clearInput();if(duel?.state==='playing'){duel.pause();syncDuelScreen();}if(['playing','movie'].includes(game.mode))game.pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(duel?.state==='playing'){duel.pause();syncDuelScreen();}if(['playing','movie'].includes(game.mode))game.pause();}});
for(const button of document.querySelectorAll('[data-move]')){
  const direction=button.dataset.move;button.addEventListener('pointerdown',event=>{event.preventDefault();button.setPointerCapture(event.pointerId);input[direction]=true;});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,()=>delete input[direction]);
}
for(const [selector,action] of [['#touch-action',()=>game.action()],['#touch-power',()=>game.power()]])$(selector).addEventListener('pointerdown',event=>{event.preventDefault();action();});
$('#powers-toolbar').addEventListener('click',event=>{const button=event.target.closest('[data-power]');if(button){game.power(Number(button.dataset.power));focusGame();}});

$('#touch-extra').addEventListener('pointerdown',event=>{event.preventDefault();game.power(1);});
canvas.addEventListener('pointerdown',focusGame);
const duelKeys=[['q','r','z','x','c','v'],['7','8','9','0','-','=']];
function openDuelMenu(){
  if(!game.won&&!saved?.won)return;
  clearInput();duel=null;duelMenu=true;$('#duel-config').hidden=false;$('#duel-controls').hidden=true;$('#resident').hidden=true;$('.powers-section').hidden=true;$('.cast-section').hidden=true;$('.viewport').classList.remove('playing');$('#movie-caption').hidden=true;$('#pause').disabled=true;
  screen.hidden=false;screen.innerHTML='<div class="screen-card"><span class="screen-kicker">¡HALLOWEEN ESTÁ A SALVO!</span><h2>Ahora…<br><em>¡a pelear!</em></h2><p>Elegí los dos personajes en el panel de abajo.<br>También pueden usar el mismo personaje.</p><button class="primary" data-screen-action="duel-start">Empezar combate →</button><button class="subtle" data-screen-action="duel-back">Volver a la aventura</button></div>';
  renderDuelSelection();$('#duel-config').scrollIntoView({behavior:'smooth',block:'nearest'});
}
function renderDuelSelection(){for(let player=0;player<2;player++)$('#duel-picker-'+player).innerHTML=availableDuelIndices(duelUnlocks).map(i=>{const h=DUEL_HEROES[i];return '<button data-duel-select="'+i+'" data-player="'+player+'" aria-pressed="'+(duelSelection[player]===i)+'">'+duelCharacterSVG(h.id)+'<span>'+h.name+'</span><small>'+h.costume+(h.secretGroup?' · Secreto':'')+'</small></button>';}).join('');}
function startDuel(){
 if(!game.won&&!saved?.won)return;
 const available=availableDuelIndices(duelUnlocks);duelSelection=duelSelection.map(i=>available.includes(i)?i:0);
 clearInput();duelMenu=false;duel=new PaperDuel(duelSelection,$('#duel-mode').value,(event,data)=>{if(event==='sound')playSound(data);if(event==='round-end')syncDuelScreen();});$('#duel-config').hidden=true;$('#duel-controls').hidden=false;screen.hidden=true;renderDuelControls();updateDuelHUD();focusGame();$('.game-shell').scrollIntoView({behavior:'smooth',block:'start'});
}
function leaveDuel(){clearInput();duel=null;duelMenu=false;$('#duel-config').hidden=true;$('#duel-controls').hidden=true;$('.powers-section').hidden=false;$('.cast-section').hidden=false;if(!game.won&&saved?.won)game.start(saved);syncScreen();renderCast();updateHUD();}
function duelScreenAction(action){if(action==='duel-menu')openDuelMenu();if(action==='duel-start')startDuel();if(action==='duel-back')leaveDuel();if(action==='duel-resume'){duel.pause();syncDuelScreen();}if(action==='duel-next'){duel.nextRound();syncDuelScreen();}if(action==='duel-rematch')startDuel();}
function syncDuelScreen(){
 if(!duel)return;clearInput();screen.hidden=duel.state==='playing';if(screen.hidden){focusGame();return;}
 const paused=duel.state==='paused',finished=duel.state==='finished',winner=duel.roundWinner===null?'¡Empate!':DUEL_HEROES[duel.fighters[finished?duel.winner:duel.roundWinner].hero].name;
 screen.innerHTML='<div class="screen-card"><span class="screen-kicker">COMBATE AMISTOSO DE HALLOWEEN</span><h2>'+(paused?'Una pequeña<br><em>pausa.</em>':finished?'¡Ganó<br><em>'+winner+'!</em>':winner+'<br><em>'+(duel.roundWinner===null?'Otra oportunidad.':'ganó el round.')+'</em>')+'</h2><p>'+duel.fighters.map(f=>'J'+(f.index+1)+': '+f.wins+' rounds').join(' · ')+'</p><button class="primary" data-screen-action="'+(paused?'duel-resume':finished?'duel-rematch':'duel-next')+'">'+(paused?'Seguir jugando':finished?'Revancha':'Siguiente round')+' →</button><button class="subtle" data-screen-action="duel-menu">Cambiar personajes</button><button class="subtle" data-screen-action="duel-back">Volver a la aventura</button></div>';updateDuelHUD();
}
function renderDuelControls(){
 $('#duel-controls').innerHTML=duel.fighters.map((f,player)=>'<div class="duel-player"><h3>J'+(player+1)+' · '+DUEL_HEROES[f.hero].name+(duel.mode==='cpu'&&player===1?' (compu)':'')+'</h3><progress id="duel-life-'+player+'" max="100" value="100" aria-label="Vida jugador '+(player+1)+'"></progress><p class="duel-key-help">'+(player===0?'A/D · W salto · F golpe · G defensa':'←/→ · ↑ salto · K golpe · L defensa')+'</p><div class="duel-pad"><button data-player="'+player+'" data-duel-hold="left" aria-label="J'+(player+1)+' izquierda">←</button><button data-player="'+player+'" data-duel-hold="right" aria-label="J'+(player+1)+' derecha">→</button><button data-player="'+player+'" data-duel-action="jump">↑ Saltar</button><button data-player="'+player+'" data-duel-action="attack">Golpe</button><button data-player="'+player+'" data-duel-hold="guard">Defensa</button></div><div class="duel-power-list">'+duelPowers(f.hero).map((p,i)=>'<button data-player="'+player+'" data-duel-power="'+i+'"><kbd>'+duelKeys[player][i].toUpperCase()+'</kbd> '+p.name+' <small>Listo</small></button>').join('')+'</div><button class="bonus-button" data-player="'+player+'" data-duel-action="bonus"><kbd>'+(player===0?'T':'O')+'</kbd> <span id="duel-bonus-'+player+'">Buscá una calabaza</span></button></div>').join('');
}
function updateDuelHUD(){
 if(!duel)return;
 $('#chapter-label').textContent='BONUS · PAPER KOMBAT HALLOWEEN';$('#hearts').textContent='J1 '+Math.ceil(duel.fighters[0].hp)+' · J2 '+Math.ceil(duel.fighters[1].hp);$('#hearts').setAttribute('aria-label','Vida de los dos combatientes');$('#bag').textContent='Round '+duel.round+' · '+Math.ceil(duel.seconds)+' s';$('#pause').disabled=!['playing','paused'].includes(duel.state);$('#pause').textContent=duel.state==='paused'?'▷':'Ⅱ';$('#pause').setAttribute('aria-label',duel.state==='paused'?'Continuar combate':'Pausar combate');$('#objective').textContent=duel.notice;$('#power-status').textContent='T / O · Poder de calabaza';
 for(const f of duel.fighters){$('#duel-life-'+f.index).value=f.hp;$('#duel-bonus-'+f.index).textContent=f.bonus?BONUS_POWERS.find(p=>p.id===f.bonus).name:'Buscá una calabaza';}
 for(const button of document.querySelectorAll('#duel-controls button')){const player=Number(button.dataset.player),cpu=duel.mode==='cpu'&&player===1,stopped=duel.state!=='playing';button.disabled=cpu||stopped;if(button.dataset.duelPower!==undefined){const wait=duel.fighters[player].cooldowns[button.dataset.duelPower]||0;button.querySelector('small').textContent=wait>0?Math.ceil(wait)+' s':'Listo';button.disabled=cpu||stopped||wait>0;}if(button.dataset.duelAction==='bonus')button.disabled=cpu||stopped||!duel.fighters[player].bonus;}
}
function handleDuelKey(event,key){
 const held={a:[0,'left'],d:[0,'right'],g:[0,'guard'],ArrowLeft:[1,'left'],ArrowRight:[1,'right'],l:[1,'guard']};
 if(held[key]){event.preventDefault();const [p,action]=held[key];if(!(duel.mode==='cpu'&&p===1))duelInput[p][action]=true;return;}
 const actions={w:[0,'jump'],ArrowUp:[1,'jump'],f:[0,'attack'],k:[1,'attack'],t:[0,'bonus'],o:[1,'bonus']};
 if(actions[key]){event.preventDefault();if(event.repeat)return;const [p,action]=actions[key];if(!(duel.mode==='cpu'&&p===1))duel[action](p);return;}
 for(let p=0;p<2;p++){const power=duelKeys[p].indexOf(key);if(power>=0){event.preventDefault();if(!event.repeat&&!(duel.mode==='cpu'&&p===1))duel.power(p,power);return;}}
 if((key==='p'||key==='Escape')&&!event.repeat){event.preventDefault();clearInput();duel.pause();syncDuelScreen();}
}
function releaseDuelKey(key){const map={a:[0,'left'],d:[0,'right'],g:[0,'guard'],ArrowLeft:[1,'left'],ArrowRight:[1,'right'],l:[1,'guard']},item=map[key.length===1?key.toLowerCase():key];if(item)delete duelInput[item[0]][item[1]];}
$('#duel-config').addEventListener('click',event=>{const button=event.target.closest('[data-duel-select]');if(button){duelSelection[Number(button.dataset.player)]=Number(button.dataset.duelSelect);renderDuelSelection();}});
$('#duel-start').addEventListener('click',startDuel);
if(matchMedia('(pointer:coarse)').matches)$('#duel-mode').value='cpu';
$('#duel-controls').addEventListener('pointerdown',event=>{const button=event.target.closest('button');if(!button||button.disabled||!duel)return;event.preventDefault();const player=Number(button.dataset.player);if(button.dataset.duelHold){button.setPointerCapture(event.pointerId);duelInput[player][button.dataset.duelHold]=true;}else if(button.dataset.duelPower!==undefined)duel.power(player,Number(button.dataset.duelPower));else if(button.dataset.duelAction)duel[button.dataset.duelAction](player);});
for(const type of ['pointerup','pointercancel','lostpointercapture'])$('#duel-controls').addEventListener(type,event=>{const b=event.target.closest('[data-duel-hold]');if(b)delete duelInput[Number(b.dataset.player)][b.dataset.duelHold];});
// Keyboard activation of the same accessible buttons generates a click with detail 0.
$('#duel-controls').addEventListener('click',event=>{if(event.detail!==0||!duel)return;const b=event.target.closest('button');if(!b||b.disabled||b.dataset.duelHold)return;const p=Number(b.dataset.player);if(b.dataset.duelPower!==undefined)duel.power(p,Number(b.dataset.duelPower));else if(b.dataset.duelAction)duel[b.dataset.duelAction](p);});
$('#duel-code-form').addEventListener('submit',event=>{
 event.preventDefault();if(!duelMenu)return;
 const result=redeemDuelCode($('#duel-code').value,duelUnlocks),status=$('#duel-code-status');
 if(!result.accepted){status.textContent='Ese código no coincide. Revisá lo que escribiste.';return;}
 duelUnlocks=result.groups;let persistent=true;try{localStorage.setItem(DUEL_UNLOCK_KEY,JSON.stringify({version:1,groups:duelUnlocks}));}catch{persistent=false;}
 status.textContent=(result.changed?'¡Desbloqueados: ':'Ya tenías a ')+result.heroes.join(' y ')+'.'+(persistent?' Disponibles para los dos jugadores.':' Disponibles durante esta sesión; el navegador no permitió guardarlos.');
 $('#duel-code').value='';renderDuelSelection();
});
renderCast();updateHUD();
let last=performance.now(),hudClock=0;
function frame(now){const dt=Math.min((now-last)/1000,.04);last=now;if(duel){duel.update(dt,duelInput);art.drawDuel(duel);}else{game.update(dt,input);art.draw(game);}hudClock+=dt;if(hudClock>.2){hudClock=0;updateHUD();}requestAnimationFrame(frame);}
requestAnimationFrame(frame);
