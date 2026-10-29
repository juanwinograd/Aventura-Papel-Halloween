import test from 'node:test';
import assert from 'node:assert/strict';
import { HalloweenGame } from '../src/engine.js';
import { HEROES, characterSVG } from '../src/characters.js';
import { ROOMS, readSave, movePlayer } from '../src/story.js';
import { HOUSES } from '../src/art.js';
const tick=(game,seconds,input={})=>{for(let t=0;t<seconds;t+=.02)game.update(.02,input);};
test('los ocho personajes tienen los disfraces pedidos y dibujos propios',()=>{
  assert.deepEqual(HEROES.map(h=>h.costume),['Esqueleto','Coatlicue','Vampiro','Ninja','Zombi','Gárgola','Slenderman','Bruja']);
  assert.equal(new Set(HEROES.map(h=>characterSVG(h.id))).size,8);
});
test('recorrido completo: timbres, película, llaves y pelea',()=>{
  const game=new HalloweenGame();game.start();
  // El cine no abre hasta recibir los dulces de todas las casas.
  game.player={x:1008,y:370};game.action();assert.equal(game.stage,0);
  HOUSES.forEach(h=>{game.player={x:h.x,y:h.y};game.enemies=[];game.action();});
  assert.equal(game.progress.candy,12);assert.equal(game.progress.houses.length,4);
  game.player={x:HOUSES[0].x,y:350};game.enemies=[];game.action();assert.equal(game.progress.candy,12);
  game.player={x:1008,y:370};game.action();assert.equal(game.stage,1);assert.equal(game.mode,'movie');
  for(let i=0;i<5;i++)game.action();assert.equal(game.stage,2);
  game.player={x:1034,y:380};game.action();assert.equal(game.stage,2);
  for(const key of ROOMS.keys){game.player={...key};game.update(.02);}
  assert.equal(game.progress.keys.length,3);game.player={x:1034,y:380};game.action();assert.equal(game.stage,3);
  // La Gran Calabaza está protegida hasta derrotar a los tres fantasmas.
  game.player={x:game.boss.x-90,y:game.boss.y};game.action();assert.equal(game.boss.hp,12);
  for(const e of game.enemies){while(e.hp>0){game.player={x:e.x-50,y:e.y};game.attackCooldown=0;game.action();}}
  while(game.boss.hp>0){game.player={x:game.boss.x-90,y:game.boss.y};game.attackCooldown=0;game.action();}
  assert.equal(game.mode,'won');assert.equal(game.checkpoint().won,true);assert.equal(readSave(JSON.stringify(game.checkpoint())).stage,3);
});
test('los corredores de la casa permiten alcanzar las tres llaves y la salida',()=>{
  let p={x:100,y:400};const travel=(x,y)=>{for(let i=0;i<500&&(Math.abs(x-p.x)>2||Math.abs(y-p.y)>2);i++){const dx=x-p.x,dy=y-p.y,len=Math.hypot(dx,dy)||1;p=movePlayer(p,dx/len*Math.min(2,len),dy/len*Math.min(2,len),ROOMS.walls);}assert.ok(Math.hypot(p.x-x,p.y-y)<4,'No se llega a '+x+','+y);};
  travel(195,205);travel(195,400);travel(455,400);travel(455,510);travel(455,275);travel(715,275);travel(715,200);travel(715,400);travel(950,400);travel(1034,380);
});
test('guardado: rechaza datos dañados y recupera una parte con el personaje elegido',()=>{
  for(const raw of ['{','null','{}',JSON.stringify({version:1,stage:9}),JSON.stringify({version:1,stage:2,hero:0,candy:0,won:false})])assert.equal(readSave(raw),null);
  const game=new HalloweenGame();game.start({stage:2,hero:7,candy:12,won:false});game.progress.keys.push(0);const save=readSave(JSON.stringify(game.checkpoint()));
  const restored=new HalloweenGame();restored.start(save);assert.equal(restored.stage,2);assert.equal(restored.hero,7);assert.equal(restored.progress.candy,12);assert.deepEqual(restored.progress.keys,[]);assert.equal(restored.hp,5);
});
test('pausa detiene enemigos, película y recarga; reintento reinicia la parte',()=>{
  const game=new HalloweenGame();game.start({stage:2,hero:0,candy:12});game.power();game.pause();const before=JSON.stringify({p:game.player,e:game.enemies,c:game.cooldown});tick(game,5,{right:true});assert.equal(JSON.stringify({p:game.player,e:game.enemies,c:game.cooldown}),before);
  game.pause();game.hp=1;game.invulnerable=0;game.protection=0;game.damage();assert.equal(game.mode,'lost');game.enter(game.stage);assert.equal(game.hp,5);assert.equal(game.mode,'playing');
  game.enter(1);game.pause();tick(game,12);assert.equal(game.progress.movie,0);game.pause();tick(game,9.1);assert.equal(game.progress.movie,1);
});
test('cada disfraz tiene un poder usable con recarga compartida al cambiar de personaje',()=>{
  for(let i=0;i<8;i++){const game=new HalloweenGame();game.start({stage:3,hero:i,candy:12});game.player={x:440,y:230};game.hp=3;game.power();assert.equal(game.cooldown,8);if(i===1)assert.equal(game.protection,6);if(i===2||i===6)assert.equal(game.protection,3.5);if(i===4)assert.equal(game.hp,4);if([0,3,5,7].includes(i))assert.equal(game.enemies[0].hp,0);game.chooseHero((i+1)%8);game.power();assert.equal(game.cooldown,8);}
});
test('es posible ahuyentar al fantasma bromista en dulce o truco',()=>{
  const game=new HalloweenGame();game.start();game.player={x:375,y:350};game.action();assert.equal(game.enemies.length,1);game.player={x:game.enemies[0].x,y:game.enemies[0].y+30};game.action();assert.equal(game.enemies[0].hp,0);
});
test('el movimiento diagonal no es más rápido y los muros bloquean el paso',()=>{
  const a=new HalloweenGame(),b=new HalloweenGame();a.start();b.start();a.update(.04,{right:true});b.update(.04,{right:true,down:true});assert.ok(Math.abs(Math.hypot(a.player.x-140,a.player.y-480)-Math.hypot(b.player.x-140,b.player.y-480))<.001);
  const p=movePlayer({x:295,y:200},15,0,ROOMS.walls);assert.equal(p.x,295);
});
