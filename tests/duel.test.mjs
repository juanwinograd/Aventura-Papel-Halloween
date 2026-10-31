import test from 'node:test';
import assert from 'node:assert/strict';
import { PaperDuel,duelPowers,BONUS_POWERS,DUEL_FLOOR } from '../src/duel.js';
import { HEROES } from '../src/characters.js';
import { Art } from '../src/art.js';
const step=(game,seconds,input=[{},{}])=>{for(let t=0;t<seconds;t+=.02)game.update(.02,input);};
const hero=id=>HEROES.findIndex(h=>h.id===id);
test('ambos jugadores pueden elegir el mismo personaje y empiezan con marcador válido',()=>{const d=new PaperDuel([2,2]);assert.equal(d.fighters[0].hero,2);assert.equal(d.fighters[1].hero,2);assert.deepEqual(d.fighters.map(f=>f.wins),[0,0]);assert.deepEqual(d.fighters.map(f=>f.hp),[100,100]);});
test('movimiento de ambos, salto, gravedad y defensa frontal',()=>{
 const d=new PaperDuel();const [a,b]=d.fighters;step(d,.2,[{right:true},{left:true}]);assert.ok(a.x>260&&b.x<860);assert.ok(d.jump(0));step(d,.2);assert.ok(a.y<DUEL_FLOOR);step(d,1);assert.equal(a.y,DUEL_FLOOR);
 a.x=500;b.x=570;a.facing=1;b.facing=-1;b.guard=true;d.attack(0);assert.ok(b.hp>93&&b.hp<100);b.invulnerable=0;b.guard=false;a.cooldowns.attack=0;const old=b.hp;d.attack(0);assert.equal(old-b.hp,7);
});
test('ganar dos rounds termina el combate y no permite seguir golpeando',()=>{const d=new PaperDuel();d.fighters[1].hp=0;d.endRound();assert.equal(d.state,'round-over');assert.equal(d.fighters[0].wins,1);d.nextRound();assert.equal(d.round,2);assert.deepEqual(d.fighters.map(f=>f.hp),[100,100]);d.fighters[1].hp=0;d.endRound();assert.equal(d.state,'finished');assert.equal(d.winner,0);assert.equal(d.attack(0),false);assert.equal(d.power(0,0),false);});
test('empates no suman, el tiempo decide por vida y la pausa congela todo',()=>{const d=new PaperDuel();d.seconds=.01;d.update(.02);assert.equal(d.roundWinner,null);assert.deepEqual(d.fighters.map(f=>f.wins),[0,0]);d.nextRound();d.pause();const before=JSON.stringify(d);step(d,3,[{right:true},{}]);assert.equal(JSON.stringify(d),before);d.pause();d.fighters[1].hp=80;d.seconds=.01;d.update(.02);assert.equal(d.roundWinner,0);});
test('Fabrizio drena de cerca: cura, deja gris/tenue/lento y el efecto se termina',()=>{
 const d=new PaperDuel([hero('fabrizio'),0]);const [f,v]=d.fighters;f.hp=60;f.x=500;v.x=600;f.facing=1;const index=duelPowers(f.hero).findIndex(p=>p.kind==='drain');assert.ok(index>=0);d.power(0,index);assert.equal(v.hp,90);assert.equal(f.hp,68);assert.equal(v.statuses.drained,7);assert.equal(d.power(0,index),false);
 const x=v.x;step(d,.2,[{},{right:true}]);assert.ok(v.x-x<25);step(d,7);assert.equal(v.statuses.drained,0);
 const far=new PaperDuel([hero('fabrizio'),0]);far.power(0,index);assert.equal(far.fighters[1].hp,100);assert.equal(far.fighters[1].statuses.drained,undefined);
});
test('las calabazas caen, aterrizan, dan un poder solo al recogerlas y no se duplican',()=>{
 const d=new PaperDuel([0,1],'local',()=>{},()=>.5);d.dropPumpkin();assert.equal(d.pumpkins[0].y,-30);assert.equal(d.fighters[0].bonus,null);step(d,3.4);assert.ok(d.pumpkins[0].landed);const p=d.pumpkins[0];d.fighters[0].x=p.x;d.update(.02);assert.equal(d.fighters[0].bonus,p.power);assert.ok(!d.pumpkins.includes(p));const charge=d.fighters[0].bonus;assert.ok(d.bonus(0));assert.equal(d.fighters[0].bonus,null);assert.equal(d.bonus(0),false);assert.ok(BONUS_POWERS.some(p=>p.id===charge));
});
test('cada poder especial de calabaza tiene un efecto usable',()=>{for(const bonus of BONUS_POWERS){const d=new PaperDuel();d.fighters[0].hp=50;d.fighters[0].bonus=bonus.id;assert.ok(d.bonus(0));if(bonus.id==='heal')assert.equal(d.fighters[0].hp,80);if(bonus.id==='shield')assert.equal(d.fighters[0].statuses.shield,7);if(bonus.id==='fire')assert.equal(d.projectiles.length,3);if(bonus.id==='ice')assert.equal(d.projectiles[0].kind,'ice');if(bonus.id==='thunder')assert.equal(d.delayed[0].kind,'thunder');}});
test('todos los poderes de los ocho disfraces y los originales funcionan en combate',()=>{for(let h=0;h<HEROES.length;h++){for(let p=0;p<duelPowers(h).length;p++){const d=new PaperDuel([h,(h+1)%8]);d.fighters[0].x=500;d.fighters[1].x=610;assert.ok(d.power(0,p));assert.equal(d.power(0,p),false);step(d,1.1);assert.ok(d.fighters.every(f=>Number.isFinite(f.hp)&&f.hp>=0&&f.hp<=100));}}});
test('el cubo refleja proyectiles y las ilusiones absorben golpes',()=>{
 const d=new PaperDuel([hero('fabrizio'),hero('benicio')]);d.fighters[0].x=500;d.fighters[1].x=650;d.fighters[0].facing=1;d.fighters[1].facing=-1;d.power(0,duelPowers(d.fighters[0].hero).findIndex(p=>p.kind==='reflect'));d.projectiles.push({owner:1,x:505,y:DUEL_FLOOR-45,vx:-100,vy:0,life:2,kind:'bones',damage:10});d.update(.02);assert.equal(d.projectiles[0].owner,0);assert.ok(d.projectiles[0].vx>0);
 d.power(1,0);d.summons[0].x=550;d.attack(0);assert.equal(d.summons[0].life,0);assert.equal(d.fighters[1].hp,100);
});
test('la compu se mueve y usa ataques sin necesitar un segundo teclado',()=>{const d=new PaperDuel([0,2],'cpu',()=>{},()=>.3);step(d,2);assert.ok(d.fighters[1].x<860);assert.ok(d.fighters[1].cooldowns.some(c=>c>0)||d.fighters[1].y<DUEL_FLOOR||d.fighters[0].hp<100);});
test('el escenario dibuja vuelo, drenaje, calabazas, escudos y proyectiles',()=>{
 const oldImage=globalThis.Image,oldMatch=globalThis.matchMedia;globalThis.Image=class{complete=true;naturalWidth=90;};globalThis.matchMedia=()=>({matches:false});let depth=0;const noOp=()=>{},gradient={addColorStop:noOp};const c=new Proxy({save(){depth++;},restore(){depth--;assert.ok(depth>=0);},createLinearGradient:()=>gradient,createRadialGradient:()=>gradient,measureText:s=>({width:s.length*10}),arc(x,y,r){assert.ok([x,y,r].every(Number.isFinite));}},{get:(o,k)=>k in o?o[k]:noOp});
 try{const art=new Art({getContext:()=>c}),d=new PaperDuel([2,5]);d.fighters[0].statuses={drained:4,paint:3,reflect:2,shield:2,trap:1,party:1,slow:3};d.fighters[1].statuses={flight:3};d.dropPumpkin();d.effects.push({kind:'drain',x:200,y:400,toX:800,toY:400,life:1});d.projectiles.push({owner:0,x:550,y:450,kind:'ice'});art.drawDuel(d);assert.equal(depth,0);}finally{globalThis.Image=oldImage;globalThis.matchMedia=oldMatch;}
});
