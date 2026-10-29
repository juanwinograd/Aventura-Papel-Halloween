import test from 'node:test';
import assert from 'node:assert/strict';
import { HalloweenGame, BOSS_RULES } from '../src/engine.js';
import { HEROES, characterSVG, powerKey } from '../src/characters.js';
import { HOUSES, CINEMA, ROOMS, readSave, movePlayer } from '../src/story.js';
const tick=(g,seconds)=>{for(let t=0;t<seconds;t+=.02)g.update(.02);};
const select=(g,id,kind)=>{g.chooseHero(HEROES.findIndex(h=>h.id===id));return HEROES[g.hero].powers.findIndex(p=>p.kind===kind);};
test('12 casas: cada vecino exige su truco, no regala dulces solo por tocar el timbre',()=>{
 const g=new HalloweenGame();g.start();assert.equal(HOUSES.length,12);assert.equal(new Set(HOUSES.map(h=>h.resident)).size,12);
 HOUSES.forEach((h,index)=>{
  g.block=h.block;g.player={x:h.x,y:h.y};g.action();assert.equal(g.challenge.index,index);assert.ok(!g.progress.houses.includes(index));const power=select(g,h.hero,h.kind);g.player={x:h.x,y:480};
  if(h.task==='resist'){g.player={x:g.props[1].x,y:g.props[1].y};g.power(power);tick(g,3.1);}
  else if(h.task==='fly'){g.power(power);for(const prop of g.props){g.player={x:prop.x,y:prop.y};g.update(.02);}}
  else if(h.task==='illusions'){g.power(power);tick(g,2.1);}
  else for(let tries=0;tries<8&&g.challenge;tries++){g.power(power);tick(g,1.2);}
  assert.ok(g.progress.houses.includes(index),'No se completa la casa '+index);
 });
 assert.equal(g.progress.candy,12);g.block=2;g.player={x:1008,y:370};g.action();assert.equal(g.stage,1);
});
test('poder equivocado no completa el truco; cambiar de cuadra tampoco regala dulces',()=>{
 const g=new HalloweenGame();g.start();g.player={x:155,y:350};g.action();select(g,'luca','ninja');g.player={x:155,y:480};g.power();tick(g,1);assert.equal(g.progress.candy,0);g.changeBlock(1);assert.equal(g.challenge,null);assert.equal(g.progress.candy,0);
});
test('la película obliga a reparar el apagón antes de revelar el plan',()=>{
 const g=new HalloweenGame();g.start({stage:1,hero:0,candy:12});for(let i=0;i<3;i++)g.nextMovie();assert.equal(g.mode,'playing');assert.equal(g.blackout,true);assert.equal(g.progress.movie,2);
 g.player={...CINEMA.projector};g.action();assert.equal(g.progress.repairs.length,0);
 for(const station of Object.values(CINEMA)){g.player={...station};g.action();}
 assert.equal(g.progress.repairs.length,3);assert.equal(g.blackout,false);assert.equal(g.progress.movie,3);assert.equal(g.mode,'movie');g.nextMovie();g.nextMovie();assert.equal(g.stage,2);
});
test('cinco Wis distintos y las tres llaves de la casa',()=>{
 const g=new HalloweenGame();g.start({stage:2,hero:0,candy:12});assert.deepEqual(g.enemies.map(e=>e.id),['radioactive','black','black-wisa','pumpkin','pumpkin-wisa']);assert.equal(g.enemies[0].color,'#a6ff27');
 for(const key of ROOMS.keys){g.player={...key};g.update(.02);}assert.equal(g.progress.keys.length,3);g.player={x:1034,y:380};g.action();assert.equal(g.stage,3);
});
test('todos los poderes nuevos y originales se pueden usar con sus propias recargas',()=>{
 const expected={gaspar:['bones','stretch','punch','teleport','potato'],vicente:['snakes','prism','gift','teleport'],fabrizio:['bat','reflect','invisible','spikes','party'],luca:['ninja','katana','lightning','storm','shield','mini'],aaron:['punch','time'],sebastian:['resist','flight','sword','hammer','stone'],benicio:['illusions','clone'],amaral:['paint','fog','sun','wind']};
 for(const hero of HEROES){assert.deepEqual(hero.powers.map(p=>p.kind),expected[hero.id]);assert.equal(new Set(hero.powers.map((_,i)=>powerKey(hero,i))).size,hero.powers.length);hero.powers.forEach((_,i)=>{const g=new HalloweenGame();g.start({stage:3,hero:HEROES.indexOf(hero),candy:12});g.player={x:435,y:230};assert.equal(g.power(i),true);assert.equal(g.power(i),false);tick(g,1.1);});}
});
test('Luca, Vicente y Aaron Mamani no tienen piernas en el dibujo',()=>{for(const id of ['luca','vicente','aaron'])assert.ok(!characterSVG(id).includes('M45 87L33 103 M45 87L57 103'));assert.ok(characterSVG('gaspar').includes('M45 87L33 103 M45 87L57 103'));});
test('serpientes, ilusiones, clon, pintura y vuelo son efectos diferentes',()=>{
 let g=new HalloweenGame();g.start({stage:3,hero:1,candy:12});g.power();assert.equal(g.allies.filter(a=>a.kind==='snake').length,2);
 g=new HalloweenGame();g.start({stage:3,hero:6,candy:12});g.power();assert.equal(g.allies.filter(a=>a.kind==='illusions').length,3);g.power(1);assert.equal(g.allies.filter(a=>a.kind==='clone').length,1);
 g=new HalloweenGame();g.start({stage:2,hero:7,candy:12});g.player={x:g.enemies[0].x,y:g.enemies[0].y};g.power();assert.equal(g.enemies[0].paint,12);
 g=new HalloweenGame();g.start({stage:2,hero:5,candy:12});g.power();assert.ok(g.protection>0);g.power(1);assert.equal(g.flying,true);
});
test('el reflector devuelve los disparos y la calabaza dispara más lento',()=>{
 const g=new HalloweenGame();g.start({stage:3,hero:2,candy:12});g.power(1);g.bullets.push({x:g.player.x,y:g.player.y,vx:80,vy:0,life:5});g.update(.02);assert.equal(g.bullets[0].friendly,true);assert.ok(g.bullets[0].vx<0);
 const b=new HalloweenGame();b.start({stage:3,hero:0,candy:12});b.invulnerable=100;tick(b,3.9);assert.equal(b.bullets.length,0);tick(b,.2);assert.equal(b.bullets.length,1);assert.ok(Math.abs(Math.hypot(b.bullets[0].vx,b.bullets[0].vy)-92)<.001);assert.ok(BOSS_RULES.interval>=3.5&&BOSS_RULES.angryInterval>=3);
});
test('pausa congela la partida y los guardados viejos siguen cargando',()=>{
 const g=new HalloweenGame();g.start({stage:2,hero:7,candy:12});g.power();g.pause();const state=JSON.stringify({p:g.player,e:g.enemies,c:g.cooldowns});tick(g,5);assert.equal(JSON.stringify({p:g.player,e:g.enemies,c:g.cooldowns}),state);assert.equal(readSave(JSON.stringify({version:1,stage:2,hero:7,candy:12,won:false})).version,2);for(const raw of ['{','null','{}'])assert.equal(readSave(raw),null);
});
test('las llaves y la salida se pueden alcanzar sin volar',()=>{
 let p={x:100,y:400};const travel=(x,y)=>{for(let i=0;i<500&&Math.hypot(x-p.x,y-p.y)>2;i++){const dx=x-p.x,dy=y-p.y,len=Math.hypot(dx,dy)||1;p=movePlayer(p,dx/len*Math.min(2,len),dy/len*Math.min(2,len),ROOMS.walls);}assert.ok(Math.hypot(p.x-x,p.y-y)<4);};for(const [x,y] of [[195,205],[195,400],[455,400],[455,510],[455,275],[715,275],[715,200],[715,400],[950,400],[1034,380]])travel(x,y);
});
test('la pelea se puede ganar después de quitar el escudo',()=>{
 const g=new HalloweenGame();g.start({stage:3,hero:0,candy:12});g.player={x:730,y:340};g.attack();assert.equal(g.boss.hp,12);for(const enemy of g.enemies)for(let n=0;enemy.hp>0&&n<5;n++){g.player={x:enemy.x-45,y:enemy.y};g.attackCooldown=0;g.attack();}for(let n=0;g.boss.hp>0&&n<20;n++){g.player={x:g.boss.x-90,y:g.boss.y};g.attackCooldown=0;g.attack();}assert.equal(g.mode,'won');assert.equal(readSave(JSON.stringify(g.checkpoint())).won,true);
});
import { Art } from '../src/art.js';
test('todos los escenarios y efectos se dibujan sin errores de Canvas',()=>{
 const savedImage=globalThis.Image,savedMatch=globalThis.matchMedia;globalThis.Image=class{complete=true;naturalWidth=90;};globalThis.matchMedia=()=>({matches:false});
 const noOp=()=>{},gradient={addColorStop:noOp};let balance=0,draws=0;
 const context=new Proxy({save(){balance++;},restore(){balance--;assert.ok(balance>=0);},createLinearGradient(){return gradient;},createRadialGradient(){return gradient;},measureText(s){return {width:s.length*10};},drawImage(){draws++;},arc(x,y,r){assert.ok([x,y,r].every(Number.isFinite));assert.ok(r>=0);}}, {get(o,key){return key in o?o[key]:noOp;}});
 try{const art=new Art({getContext:()=>context});const g=new HalloweenGame();art.draw(g);for(let stage=0;stage<4;stage++){g.start({stage,hero:0,candy:stage?12:0});if(stage===0){for(let block=0;block<3;block++){g.block=block;g.player={x:HOUSES[block*4].x,y:350};g.action();art.draw(g);}}else if(stage===1){for(let i=0;i<3;i++){art.draw(g);g.nextMovie();}art.draw(g);}else{for(let hero=0;hero<8;hero++){g.chooseHero(hero);g.power();art.draw(g);tick(g,.2);}}}assert.equal(balance,0);assert.ok(draws>20);}finally{globalThis.Image=savedImage;globalThis.matchMedia=savedMatch;}
});
