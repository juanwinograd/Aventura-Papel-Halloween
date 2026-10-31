import test from 'node:test';
import assert from 'node:assert/strict';
import { HEROES } from '../src/characters.js';
import { DUEL_HEROES, SECRET_HEROES, duelCharacterSVG } from '../src/duel-characters.js';
import { redeemDuelCode, readUnlocks, availableDuelIndices } from '../src/duel-unlocks.js';
import { PaperDuel,duelPowers,DUEL_FLOOR } from '../src/duel.js';
import { BOSS_RULES } from '../src/engine.js';
import { Art } from '../src/art.js';
const step=(d,seconds,inputs=[{},{}])=>{for(let t=0;t<seconds;t+=.02)d.update(.02,inputs);};
const index=id=>DUEL_HEROES.findIndex(h=>h.id===id);
const pair=id=>{const d=new PaperDuel([index(id),0]);d.fighters[0].x=500;d.fighters[1].x=620;return d;};
test('los dos códigos desbloquean sus parejas; los secretos no se agregan a la aventura',()=>{
 assert.equal(HEROES.length,8);assert.equal(DUEL_HEROES.length,12);assert.equal(availableDuelIndices().length,8);
 const a=redeemDuelCode('Escuela Bavio 16 12');assert.deepEqual(a.heroes,['Baltazar','Máquina de bobadas']);assert.equal(availableDuelIndices(a.groups).length,10);
 const b=redeemDuelCode('Halloween vs Día de los muertos',a.groups);assert.deepEqual(b.heroes,['Wis calabaza','Wis catrina']);assert.equal(availableDuelIndices(b.groups).length,12);
 assert.deepEqual(readUnlocks(JSON.stringify({version:1,groups:b.groups})),b.groups);
});
test('mayúsculas, tildes y espacios; códigos erróneos o repetidos no borran ni duplican personajes',()=>{
 const a=redeemDuelCode('  ESCUELA   Bavio  16 12  ');assert.equal(a.accepted,true);assert.equal(redeemDuelCode('halloween VS DIA de los muertos').accepted,true);
 assert.equal(redeemDuelCode('Escuela Bavio 16 12',a.groups).changed,false);
 for(const code of ['nada','constructor','toString','__proto__','Escuela Bavio 16']){const r=redeemDuelCode(code,a.groups);assert.equal(r.accepted,false);assert.deepEqual(r.groups,a.groups);}
 for(const raw of ['{','null','{}',JSON.stringify({version:99,groups:['school']})])assert.deepEqual(readUnlocks(raw),[]);
 assert.deepEqual(readUnlocks(JSON.stringify({version:1,groups:['school','school','fake',null]})),['school']);
});
test('los cuatro secretos tienen sus disfraces y los poderes pedidos',()=>{
 assert.deepEqual(SECRET_HEROES.map(h=>h.costume),['Murciélago','Hada','Calabaza','Catrina']);assert.deepEqual(SECRET_HEROES.map(h=>h.powers.map(p=>p.kind)),[['square','camouflage','echo'],['laugh','hex'],['pumpkin','black-hole'],['bone-ground','teleport','crush']]);
 assert.equal(new Set(SECRET_HEROES.map(h=>duelCharacterSVG(h.id))).size,4);assert.ok(duelCharacterSVG('wis-catrina').includes('fff4df'));
});
test('Baltazar conserva cuadrados y camuflaje; el sonar revela al rival y distingue ilusiones',()=>{
 const d=pair('baltazar');d.power(0,0);assert.equal(d.projectiles[0].kind,'square');d.power(0,1);assert.equal(d.fighters[0].statuses.invisible,6);d.attack(0);assert.equal(d.fighters[0].statuses.invisible,0);
 d.fighters[1].statuses.invisible=6;d.summons.push({owner:1,kind:'illusions',x:620,y:510,life:7,clock:0});d.power(0,2);assert.equal(d.fighters[1].statuses.revealed,6);assert.equal(d.fighters[1].statuses.invisible,0);assert.equal(d.summons.length,0);
});
test('la risa se anuncia y dura cinco segundos; la defensa evita el efecto',()=>{
 const d=pair('maquina-bobadas');d.power(0,0);assert.equal(d.fighters[1].stun,0);step(d,.74);assert.ok(d.fighters[1].statuses.laugh>4.9);assert.equal(d.attack(1),false);const x=d.fighters[1].x;step(d,.3,[{},{right:true}]);assert.equal(d.fighters[1].x,x);step(d,5);assert.equal(d.fighters[1].statuses.laugh,0);
 const guarded=pair('maquina-bobadas');guarded.power(0,0);step(guarded,.8,[{},{guard:true}]);assert.equal(guarded.fighters[1].statuses.laugh,undefined);
});
test('el hechizo de hada transforma temporalmente al rival y después le devuelve los ataques',()=>{
 const d=pair('maquina-bobadas');d.power(0,1);step(d,.4);assert.ok(d.fighters[1].statuses.hex>3);assert.equal(d.attack(1),false);step(d,4.5);assert.equal(d.fighters[1].statuses.hex,0);assert.equal(d.attack(1),true);
});
test('Wis calabaza usa el proyectil de la Gran Calabaza y agujeros negros que atraen y absorben',()=>{
 const d=pair('wis-calabaza');d.power(0,0);assert.equal(d.projectiles[0].kind,'pumpkin');assert.equal(Math.abs(d.projectiles[0].vx),BOSS_RULES.speed);assert.equal(d.projectiles[0].life,10);
 d.projectiles=[];d.power(0,1);const hole=d.holes[0];d.fighters[1].x=hole.x+110;d.projectiles.push({x:hole.x,y:hole.y,vx:0,vy:0,owner:0,kind:'square',damage:1,life:4});d.update(.02);assert.ok(d.fighters[1].x<hole.x+110);assert.equal(d.projectiles.length,0);step(d,5.1);assert.equal(d.holes.length,0);
});
test('los huesos brotan después del aviso y saltar a tiempo los esquiva',()=>{
 const d=pair('wis-catrina');d.power(0,0);assert.equal(d.fighters[1].hp,100);step(d,.9);assert.ok(d.fighters[1].hp<100);assert.ok(d.effects.some(e=>e.kind==='bone-ground'));
 const evade=pair('wis-catrina');evade.power(0,0);step(evade,.45);evade.jump(1);step(evade,.45);assert.equal(evade.fighters[1].hp,100);
});
test('Wis catrina se teletransporta y aplasta desde arriba; reintentar limpia los agujeros',()=>{
 const d=pair('wis-catrina');d.power(0,1);assert.ok(d.fighters[0].x!==500);d.power(0,2);assert.ok(d.fighters[0].y<DUEL_FLOOR);step(d,.4);assert.ok(d.fighters[1].hp<100);assert.equal(d.fighters[0].statuses.crush,0);
 const holes=pair('wis-calabaza');holes.power(0,1);holes.fighters[1].hp=0;holes.endRound();holes.nextRound();assert.equal(holes.holes.length,0);
});
test('cada poder secreto se puede usar con recarga y conserva valores válidos',()=>{
 for(const h of SECRET_HEROES)for(let power=0;power<h.powers.length;power++){const d=pair(h.id);assert.equal(d.power(0,power),true);assert.equal(d.power(0,power),false);step(d,1);assert.ok(d.fighters.every(f=>Number.isFinite(f.hp)&&Number.isFinite(f.x)&&f.hp>=0&&f.hp<=100));assert.ok(duelPowers(d.fighters[0].hero).length<=6);}
});
test('se dibujan los secretos, el sonar, la mariposa, el agujero y los huesos sin errores',()=>{
 const oldImage=globalThis.Image,oldMatch=globalThis.matchMedia;globalThis.Image=class{complete=true;naturalWidth=90;};globalThis.matchMedia=()=>({matches:false});let depth=0;const noOp=()=>{},gradient={addColorStop:noOp};const c=new Proxy({save(){depth++;},restore(){depth--;assert.ok(depth>=0);},createLinearGradient:()=>gradient,createRadialGradient:()=>gradient,measureText:s=>({width:s.length*10}),arc(x,y,r){assert.ok([x,y,r].every(Number.isFinite));assert.ok(r>=0);}},{get:(o,k)=>k in o?o[k]:noOp});
 try{const art=new Art({getContext:()=>c});for(const h of SECRET_HEROES){const d=pair(h.id);for(let p=0;p<h.powers.length;p++)d.power(0,p);d.fighters[1].statuses.hex=3;art.drawDuel(d);step(d,1);art.drawDuel(d);}assert.equal(depth,0);}finally{globalThis.Image=oldImage;globalThis.matchMedia=oldMatch;}
});
