import { DUEL_HEROES as HEROES } from './duel-characters.js';
import { BOSS_RULES } from './engine.js';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const DUEL_FLOOR=510;
export const BONUS_POWERS=[{id:'fire',name:'Fuego de calabaza',icon:'☄'},{id:'ice',name:'Hielo espectral',icon:'❄'},{id:'thunder',name:'Trueno de Halloween',icon:'ϟ'},{id:'shield',name:'Escudo encantado',icon:'◎'},{id:'heal',name:'Dulce curativo',icon:'♥'}];
export function duelPowers(hero){return [...HEROES[hero].powers,...(HEROES[hero].id==='fabrizio'?[{name:'Drenar sangre',kind:'drain',cooldown:9}]:[])];}
const makeFighter=(hero,index,wins=0)=>({hero,index,x:index?860:260,y:DUEL_FLOOR,vy:0,facing:index?-1:1,hp:100,wins,cooldowns:[],statuses:{},attack:0,invulnerable:0,stun:0,guard:false,bonus:null});
export class PaperDuel {
 constructor(heroes=[0,2],mode='local',onEvent=()=>{},random=Math.random){
  this.heroes=heroes.map(h=>Number.isInteger(h)&&h>=0&&h<HEROES.length?h:0);this.mode=mode;this.onEvent=onEvent;this.random=random;this.round=1;this.fighters=this.heroes.map((hero,index)=>makeFighter(hero,index));this.state='playing';this.time=0;this.seconds=60;this.projectiles=[];this.summons=[];this.holes=[];this.effects=[];this.delayed=[];this.pumpkins=[];this.dropClock=3;this.cpuClock=.7;this.winner=null;this.roundWinner=null;this.notice='¡Combate amistoso! Ganá dos rounds. Las calabazas traen sorpresas.';
 }
 announce(text){this.notice=text;this.onEvent('notice',text);}
 pause(){if(this.state==='playing'){this.state='paused';this.onEvent('paused');}else if(this.state==='paused'){this.state='playing';this.onEvent('resume');}}
 nextRound(){if(this.state!=='round-over')return;this.round++;this.fighters=this.fighters.map(f=>makeFighter(f.hero,f.index,f.wins));this.seconds=60;this.projectiles=[];this.summons=[];this.holes=[];this.delayed=[];this.pumpkins=[];this.effects=[];this.dropClock=3;this.roundWinner=null;this.state='playing';this.announce('¡Round '+this.round+'!');this.onEvent('round');}
 endRound(){
  if(this.state!=='playing')return;
  const [a,b]=this.fighters;this.roundWinner=a.hp===b.hp?null:a.hp>b.hp?0:1;
  if(this.roundWinner!==null)this.fighters[this.roundWinner].wins++;
  this.winner=this.fighters.findIndex(f=>f.wins>=2);this.state=this.winner>=0?'finished':'round-over';
  this.announce(this.roundWinner===null?'¡Empate! Nadie suma un round.':HEROES[this.fighters[this.roundWinner].hero].name+' ganó el round.');this.onEvent('round-end');
 }
 effect(text,x,y,color='#ffdb97'){this.effects.push({text,x,y,color,life:1.2});}
 jump(i){const f=this.fighters[i];if(this.state!=='playing'||f.stun>0)return false;if(f.y>=DUEL_FLOOR-1){f.vy=-560;return true;}return false;}
 damage(target,amount,source,kind='hit'){
  if(this.state!=='playing'||target.invulnerable>0)return 0;
  if(['illusions','clone'].includes(kind)&&source===target.index)return 0;
  const from=this.fighters[source],guarded=target.guard&&Math.sign(from.x-target.x)===target.facing;
  if(target.statuses.shield>0||target.statuses.resist>0)amount*=.25;
  if(guarded)amount*=.3;
  if(from.statuses.strength>0)amount*=1.4;
  if(target.statuses.laugh>0||target.statuses.hex>0)amount*=.5;
  amount=Math.min(target.hp,Math.max(1,Math.round(amount)));target.hp=Math.max(0,target.hp-amount);target.invulnerable=.32;target.x=clamp(target.x+(target.x>=from.x?1:-1)*12,55,1065);
  this.effect('-'+amount,target.x,target.y-115,guarded?'#b5e5ed':'#ffb0bb');this.onEvent('sound','hit');
  if(target.hp<=0)this.endRound();return amount;
 }
 melee(i,reach=115,damage=7,kind='attack'){
  const f=this.fighters[i],other=this.fighters[1-i];f.attack=.25;f.statuses.invisible=0;f.statuses.fog=0;
  const decoy=this.summons.find(s=>s.owner!==i&&s.kind==='illusions'&&Math.abs(s.x-f.x)<reach);if(decoy){decoy.life=0;this.effect('¡Ilusión!',decoy.x,decoy.y-60,'#d1b5fa');return false;}
  if(Math.abs(other.x-f.x)<=reach&&Math.abs(other.y-f.y)<90&&Math.sign(other.x-f.x)===f.facing)return this.damage(other,damage,i,kind)>0;return false;
 }
 attack(i){const f=this.fighters[i];if(this.state!=='playing'||f.stun>0||f.statuses.hex>0||(f.cooldowns.attack||0)>0)return false;f.cooldowns.attack=.42;const id=HEROES[f.hero].id;this.melee(i,id==='luca'?150:110,id==='aaron'?10:7,id==='luca'?'katana':'attack');this.onEvent('sound','attack');return true;}
 shoot(i,kind,damage=10,speed=430){const f=this.fighters[i];this.projectiles.push({owner:i,x:f.x+f.facing*35,y:f.y-43,vx:f.facing*speed,vy:0,kind,damage,life:3});}
 power(i,index){
  if(this.state!=='playing')return false;const f=this.fighters[i],other=this.fighters[1-i],power=duelPowers(f.hero)[index];if(!power||f.stun>0||f.statuses.hex>0||(f.cooldowns[index]||0)>0)return false;
  f.cooldowns[index]=power.cooldown;const k=power.kind,near=Math.abs(f.x-other.x),sameHeight=Math.abs(f.y-other.y)<110;this.effect(power.name,f.x,f.y-130,HEROES[f.hero].color);this.onEvent('sound','power');
  if(['bones','ninja','stone','spikes','potato'].includes(k))this.shoot(i,k,k==='potato'?15:10,k==='ninja'?520:420);
  if(['punch','stretch','sword','katana'].includes(k))this.melee(i,{punch:125,stretch:270,sword:175,katana:165}[k],k==='punch'?15:11,k);
  if(k==='bat'||k==='flight'){f.statuses[k]=5;f.vy=-220;f.statuses.dodge=1;}
  if(k==='resist'||k==='shield'||k==='reflect')f.statuses[k]=k==='resist'?5:3;
  if(k==='invisible'||k==='fog')f.statuses[k]=5;
  if(k==='mini')f.statuses.mini=5;
  if(k==='teleport'){f.x=clamp(other.x+(other.x>560?-140:140),55,1065);f.facing=other.x>f.x?1:-1;f.statuses.dodge=.5;}
  if(k==='snakes')for(let j=0;j<2;j++)this.summons.push({owner:i,kind:'snake',x:f.x+j*35,y:DUEL_FLOOR,life:6,clock:0});
  if(k==='clone')this.summons.push({owner:i,kind:'clone',x:f.x+f.facing*50,y:DUEL_FLOOR,life:6,clock:0});
  if(k==='illusions')for(let j=0;j<3;j++)this.summons.push({owner:i,kind:'illusions',x:clamp(f.x+(j-1)*95,55,1065),y:f.y,life:7,clock:0});
  if(k==='prism'||k==='gift'){if(near<260&&sameHeight){other.stun=Math.max(other.stun,k==='prism'?1.6:1.1);other.statuses.trap=other.stun;other.statuses.gift=k==='gift'?other.stun:0;this.damage(other,k==='gift'?7:3,i,k);}}
  if(k==='paint'&&near<260&&sameHeight){other.statuses.paint=9;this.damage(other,8,i,k);}
  if(k==='time'&&near<330)other.statuses.slow=5;
  if(k==='party'&&near<300&&sameHeight){other.statuses.party=2;other.stun=2;}
  if(k==='sun'&&near<360){other.statuses.blind=2.5;other.stun=Math.max(other.stun,.7);}
  if(k==='wind'){if(near<350){other.x=clamp(other.x+f.facing*120,55,1065);this.damage(other,5,i,k);}for(const b of this.projectiles)if(b.owner!==i&&Math.abs(b.x-f.x)<300){b.owner=i;b.vx*=-1;}}
  if(k==='lightning')this.shoot(i,k,12,650);
  if(k==='storm'||k==='hammer')this.delayed.push({owner:i,x:k==='storm'?other.x:f.x+f.facing*120,y:DUEL_FLOOR,life:1,kind:k,radius:k==='storm'?95:130,damage:k==='storm'?17:20});
  if(k==='drain'){
   if(near<160&&sameHeight&&Math.sign(other.x-f.x)===f.facing){const amount=this.damage(other,10,i,k);if(amount>0){other.statuses.drained=7;f.hp=Math.min(100,f.hp+8);this.effects.push({kind:'drain',x:f.x,y:f.y-50,toX:other.x,toY:other.y-50,life:1.2});this.announce('¡Drenaje vampírico! El rival queda gris, tenue y lento durante 7 segundos.');}}
   else this.announce('Para drenar, acercate al rival y mirá hacia él.');
  }
  if(k==='square'){f.statuses.invisible=0;f.statuses.fog=0;this.shoot(i,'square',11,390);}
  if(k==='camouflage')f.statuses.invisible=6;
  if(k==='echo'){
   f.statuses.echo=4;
   if(near<700){other.statuses.revealed=6;other.statuses.invisible=0;other.statuses.fog=0;this.summons=this.summons.filter(s=>s.owner===i||s.kind!=='illusions');this.announce('¡Ecolocalización! El rival y sus ilusiones quedaron al descubierto.');}
  }
  if(k==='hex')this.shoot(i,'hex',5,340);
  if(k==='laugh')this.delayed.push({owner:i,x:clamp(f.x+f.facing*110,55,1065),y:DUEL_FLOOR,life:.7,kind:'laugh',radius:210,damage:0});
  if(k==='pumpkin'){this.shoot(i,'pumpkin',12,BOSS_RULES.speed);this.projectiles.at(-1).life=10;}
  if(k==='black-hole'){this.holes=this.holes.filter(h=>h.owner!==i);this.holes.push({owner:i,x:other.x,y:DUEL_FLOOR-45,life:5,radius:170,clock:.7});}
  if(k==='bone-ground')this.delayed.push({owner:i,x:other.x,y:DUEL_FLOOR,life:.8,kind:'bone-ground',radius:105,damage:16});
  if(k==='crush'){f.statuses.crush=1.4;f.x=clamp(other.x,70,1050);f.y=DUEL_FLOOR-185;f.vy=620;}
  return true;
 }
 bonus(i){
  const f=this.fighters[i],other=this.fighters[1-i];if(this.state!=='playing'||!f.bonus||f.stun>0||f.statuses.hex>0)return false;const kind=f.bonus;f.bonus=null;
  if(kind==='fire'){for(const offset of [-25,0,25]){this.shoot(i,'fire',14,450);this.projectiles.at(-1).y+=offset;}}
  if(kind==='ice'){this.shoot(i,'ice',7,480);}
  if(kind==='thunder'){this.delayed.push({owner:i,x:other.x,y:DUEL_FLOOR,life:1,kind:'thunder',radius:115,damage:23});}
  if(kind==='shield')f.statuses.shield=7;
  if(kind==='heal')f.hp=Math.min(100,f.hp+30);
  this.effect(BONUS_POWERS.find(p=>p.id===kind).name,f.x,f.y-125,'#ffd18e');this.onEvent('sound','power');return true;
 }
 dropPumpkin(){const power=BONUS_POWERS[Math.floor(this.random()*BONUS_POWERS.length)].id;this.pumpkins.push({x:110+this.random()*900,y:-30,vy:160,power,life:15,landed:false});}
 update(dt,inputs=[{},{}]){
  if(this.state!=='playing')return;dt=Math.min(.05,Math.max(0,dt));this.time+=dt;this.seconds=Math.max(0,this.seconds-dt);if(this.seconds<=0){this.endRound();return;}
  this.effects=this.effects.filter(e=>(e.life-=dt)>0);this.dropClock-=dt;if(this.dropClock<=0){this.dropPumpkin();this.dropClock=6.5;}
  const states=inputs.map(i=>({...i}));if(this.mode==='cpu'){
   const f=this.fighters[1],other=this.fighters[0],distance=Math.abs(other.x-f.x);states[1]={left:other.x<f.x&&distance>95,right:other.x>f.x&&distance>95,guard:this.projectiles.some(b=>b.owner===0&&Math.abs(b.x-f.x)<150)};
   this.cpuClock-=dt;if(this.cpuClock<=0){this.cpuClock=.65+this.random()*.55;if(distance<150)this.attack(1);if(this.random()<.25)this.jump(1);if(this.random()<.65)this.power(1,Math.floor(this.random()*duelPowers(f.hero).length));if(f.bonus)this.bonus(1);}
  }
  for(const [i,f] of this.fighters.entries()){
   f.attack=Math.max(0,f.attack-dt);f.invulnerable=Math.max(0,f.invulnerable-dt);f.stun=Math.max(0,f.stun-dt);
   for(const key of Object.keys(f.statuses))f.statuses[key]=Math.max(0,f.statuses[key]-dt);
   for(const key of Object.keys(f.cooldowns))f.cooldowns[key]=Math.max(0,f.cooldowns[key]-dt);
   const input=states[i]||{};f.guard=!!input.guard&&f.stun<=0;
   let direction=Number(!!input.right)-Number(!!input.left);if(f.stun>0)direction=0;
   if(direction)f.facing=direction;
   const speed=230*(f.statuses.drained>0?.45:f.statuses.slow>0||f.statuses.hex>0?.5:1)*(f.guard?.35:1);
   f.x=clamp(f.x+direction*speed*dt,55,1065);
   const flying=f.statuses.bat>0||f.statuses.flight>0;
   if(flying){f.vy=0;f.y=Math.max(360,f.y-90*dt);}else{f.vy+=1500*dt;f.y=Math.min(DUEL_FLOOR,f.y+f.vy*dt);if(f.y>=DUEL_FLOOR){f.vy=0;if(f.statuses.crush>0){const target=this.fighters[1-i];if(Math.abs(f.x-target.x)<115&&target.y>DUEL_FLOOR-75)this.damage(target,21,i,'crush');f.statuses.crush=0;this.effect('¡APLASTAR!',f.x,DUEL_FLOOR-100,'#e9d9c4');}}}
  }
  for(const b of this.projectiles){
   b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;const target=this.fighters[1-b.owner];
   const decoy=this.summons.find(s=>s.owner!==b.owner&&Math.abs(b.x-s.x)<28&&Math.abs(b.y-(s.y-40))<50);
   if(decoy){decoy.life=0;b.life=0;continue;}
   if(Math.abs(b.x-target.x)<(target.statuses.mini>0?13:28)&&Math.abs(b.y-(target.y-45))<(target.statuses.mini>0?25:52)){
    if(target.statuses.reflect>0){b.owner=target.index;b.vx*=-1;b.x=target.x+target.facing*38;}
    else if(!(target.statuses.dodge>0)){const amount=this.damage(target,b.damage,b.owner,b.kind);if(b.kind==='ice'&&amount>0){target.stun=.9;target.statuses.slow=4;}if(b.kind==='hex'&&amount>0&&!target.guard&&!(target.statuses.charmImmune>0)){target.statuses.hex=4;target.statuses.charmImmune=7;target.stun=1;this.announce('¡Hechizado! El rival se volvió una mariposa mágica durante 4 segundos.');}b.life=0;}
   }
  }
  this.projectiles=this.projectiles.filter(b=>b.life>0&&b.x>-30&&b.x<1150);
  for(const s of this.summons){s.life-=dt;s.clock-=dt;const target=this.fighters[1-s.owner];if(s.kind==='illusions')continue;s.x+=Math.sign(target.x-s.x)*130*dt;if(Math.abs(s.x-target.x)<65&&Math.abs(target.y-s.y)<70&&s.clock<=0){this.damage(target,s.kind==='snake'?4:5,s.owner,s.kind);s.clock=1.1;}}
  this.summons=this.summons.filter(s=>s.life>0);
  for(const hole of this.holes){
   hole.life-=dt;hole.clock-=dt;const target=this.fighters[1-hole.owner],distance=Math.hypot(target.x-hole.x,target.y-45-hole.y);
   if(distance<hole.radius){target.x=clamp(target.x+Math.sign(hole.x-target.x)*85*dt,55,1065);if(hole.clock<=0){this.damage(target,3,hole.owner,'black-hole');hole.clock=1.4;}}
   for(const projectile of this.projectiles){const len=Math.hypot(projectile.x-hole.x,projectile.y-hole.y);if(len<28)projectile.life=0;else if(len<hole.radius){projectile.x+=(hole.x-projectile.x)/len*180*dt;projectile.y+=(hole.y-projectile.y)/len*180*dt;}}
  }
  this.holes=this.holes.filter(h=>h.life>0);this.projectiles=this.projectiles.filter(p=>p.life>0);
  for(const d of this.delayed){d.life-=dt;if(d.life<=0){const target=this.fighters[1-d.owner];
   if(Math.abs(target.x-d.x)<d.radius&&target.y>DUEL_FLOOR-75){
    if(d.kind==='laugh'){if(!target.guard&&!(target.statuses.charmImmune>0)){target.stun=5;target.statuses.laugh=5;target.statuses.charmImmune=8;this.announce('¡Ataque de risa! Cinco segundos de carcajadas.');}}
    else this.damage(target,d.damage,d.owner,d.kind);
   }
   if(d.kind==='bone-ground')this.effects.push({kind:'bone-ground',x:d.x,y:DUEL_FLOOR,life:1.2});
   else this.effect(d.kind==='laugh'?'¡JA JA JA!':'¡PUM!',d.x,DUEL_FLOOR-60,'#d7c7ff');
  }}
  this.delayed=this.delayed.filter(d=>d.life>0);
  for(const p of this.pumpkins){p.life-=dt;if(!p.landed){p.y=Math.min(DUEL_FLOOR-20,p.y+p.vy*dt);p.landed=p.y>=DUEL_FLOOR-20;}
   for(const f of this.fighters)if(!f.bonus&&Math.abs(f.x-p.x)<38&&Math.abs(f.y-25-p.y)<55){f.bonus=p.power;p.life=0;this.effect(BONUS_POWERS.find(b=>b.id===p.power).name,f.x,f.y-125);this.onEvent('sound','candy');break;}}
  this.pumpkins=this.pumpkins.filter(p=>p.life>0);
 }
}
