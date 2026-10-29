import { HEROES } from './characters.js';
import { CHAPTERS, MOVIE, ROOMS, HOUSES, CINEMA, WIS, collides, canFinish, movePlayer } from './story.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const BOSS_RULES={interval:3.8,angryInterval:3.2,speed:92,warning:1.1};
export class HalloweenGame {
 constructor(onEvent=()=>{}){
  this.onEvent=onEvent;this.hero=0;this.stage=0;this.mode='title';this.time=0;this.player={x:140,y:480};this.progress={candy:0,houses:[],keys:[],movie:0,repairs:[]};this.hp=5;this.enemies=[];this.bullets=[];this.effects=[];this.allies=[];this.delayed=[];this.notice={text:'',time:0};this.cooldowns={};this.statuses={};this.attackCooldown=0;this.attackVisual=0;this.protection=0;this.invulnerable=0;this.movieClock=0;this.moving=false;this.boss={x:820,y:340,hp:12,clock:4};this.won=false;this.block=0;this.challenge=null;this.props=[];this.blackout=false;this.face={x:1,y:0};this.lastGround={...this.player};
 }
 get cooldown(){return this.cooldowns[this.hero+':0']||0;}
 get buff(){return this.statuses.bat>0?'flight':this.statuses.flight>0?'gargoyle':'';}
 get invisible(){return this.statuses.invisible>0||this.statuses.fog>0;}
 get flying(){return this.statuses.bat>0||this.statuses.flight>0;}
 chooseHero(index){if(!Number.isInteger(index)||index<0||index>=HEROES.length)return;this.hero=index;this.onEvent('hero');if(this.mode!=='title')this.onEvent('save');}
 start(save=null){this.progress.candy=save?.candy||0;this.hero=save?.hero??this.hero;this.won=false;this.enter(save?.stage||0);if(save?.won)this.victory();}
 checkpoint(){return {version:2,stage:this.stage,hero:this.hero,candy:this.stage?12:0,won:this.won};}
 enter(stage){
  this.stage=stage;this.hp=5;this.player={x:stage===0?140:100,y:stage===0?480:stage===2?400:480};this.lastGround={...this.player};this.enemies=[];this.bullets=[];this.effects=[];this.allies=[];this.delayed=[];this.progress.houses=[];this.progress.keys=[];this.progress.movie=0;this.progress.repairs=[];this.cooldowns={};this.statuses={};this.attackCooldown=0;this.attackVisual=0;this.protection=0;this.invulnerable=1;this.movieClock=0;this.mode=stage===1?'movie':'playing';this.moving=false;this.blackout=false;this.block=0;this.challenge=null;this.props=[];
  if(stage===0)this.progress.candy=0;
  if(stage===2)this.enemies=WIS.map((w,i)=>({...w,hp:5,seed:i*2,stun:0,kind:'wis',home:{x:w.x,y:w.y},paint:0,trap:0}));
  if(stage===3){this.boss={x:820,y:340,hp:12,clock:4,paint:0};this.enemies=[{x:440,y:230,hp:2,seed:1,stun:0,kind:'arena'},{x:530,y:470,hp:2,seed:3,stun:0,kind:'arena'},{x:650,y:310,hp:2,seed:5,stun:0,kind:'arena'}];}
  this.say(CHAPTERS[stage].objective,6);this.onEvent('stage');this.onEvent('save');
 }
 say(text,time=4){this.notice={text,time};this.onEvent('notice',text);}
 effect(text,x=this.player.x,y=this.player.y-80,color='#ffdb97'){this.effects.push({type:'text',text,x,y,color,life:1.5,max:1.5});}
 ring(radius,color=HEROES[this.hero].color){this.effects.push({type:'ring',x:this.player.x,y:this.player.y,radius,color,life:.7,max:.7});}
 pause(){if(['playing','movie'].includes(this.mode)){this.previousMode=this.mode;this.mode='paused';this.onEvent('pause');}else if(this.mode==='paused'){this.mode=this.previousMode;this.onEvent('resume');}}
 nextMovie(){
  if(this.mode!=='movie')return;this.movieClock=0;
  if(this.progress.movie===2&&this.progress.repairs.length<3){this.blackout=true;this.mode='playing';this.player={x:110,y:510};this.say('¡Nos ofrecemos a ayudar! Primero busquemos el fusible en el depósito.',6);this.onEvent('stage');return;}
  if(canFinish(1,this.progress)){this.enter(2);return;}
  this.progress.movie++;this.onEvent('movie');this.onEvent('sound','page');
 }
 changeBlock(direction){
  const next=clamp(this.block+direction,0,2);if(next===this.block)return;
  this.block=next;this.player.x=direction>0?65:1050;this.challenge=null;this.props=[];this.say('Cuadra '+(next+1)+' de 3. ¡Hay cuatro vecinos más para visitar!');this.onEvent('challenge');
 }
 startChallenge(index){
  const h=HOUSES[index];this.challenge={index,time:0};this.props=Array.from({length:3},(_,i)=>({x:h.x+(i-1)*55,y:460+(i%2)*40,hp:1,done:false,challengeTarget:true,kind:h.task}));
  this.say(h.resident+': «'+h.request+'»',7);this.onEvent('challenge');
 }
 finishChallenge(){
  const index=this.challenge.index;if(this.progress.houses.includes(index))return;
  this.progress.houses.push(index);this.progress.candy++;this.effect('+1 dulce',HOUSES[index].x,290);this.say(HOUSES[index].resident+': «¡Qué buen truco! Acá tenés tu dulce».',5);this.challenge=null;this.props=[];this.onEvent('challenge');this.onEvent('sound','candy');
 }
 action(){
  if(this.mode==='movie'){this.nextMovie();return;}if(this.mode!=='playing')return;const p=this.player;
  if(this.stage===0){
   if(p.y>430&&p.x<85&&this.block>0){this.changeBlock(-1);return;}
   if(p.y>430&&p.x>1035&&this.block<2){this.changeBlock(1);return;}
   if(this.block===2&&distance(p,{x:1008,y:370})<100){if(canFinish(0,this.progress))this.enter(1);else this.say('La función espera: completá los trucos de las 12 casas.');return;}
   const i=HOUSES.findIndex(h=>h.block===this.block&&distance(p,h)<95);
   if(i>=0){if(this.progress.houses.includes(i))this.say('¡Este vecino ya nos dio su dulce!');else if(this.challenge?.index===i)this.say(HOUSES[i].request);else this.startChallenge(i);return;}
   this.attack();return;
  }
  if(this.stage===1){
   const stations=Object.entries(CINEMA),station=stations.find(([,at])=>distance(p,at)<85);
   if(!station){this.say('E cerca del fusible, el tablero o el proyector. No hace falta un personaje específico.');return;}
   const [id]=station,order=['fuse','panel','projector'],step=order.indexOf(id);
   if(this.progress.repairs.includes(id)){this.say('¡Esta parte ya quedó lista!');return;}
   if(step!==this.progress.repairs.length){this.say(step===1?'Primero buscá el fusible en el depósito de la izquierda.':'Primero hay que conectar el tablero del centro.');return;}
   this.progress.repairs.push(id);this.effect('¡Arreglado!',p.x,p.y-65);this.onEvent('sound','candy');
   if(step===2){this.blackout=false;this.mode='movie';this.progress.movie=3;this.movieClock=0;this.say('¡Volvió la luz! Ahora escuchamos el plan de la Gran Calabaza.',5);this.onEvent('movie');}
   else this.say(step===0?'¡Tenemos el fusible! Llevémoslo al tablero del centro.':'¡El tablero funciona! Falta encender el proyector de la derecha.',5);
   return;
  }
  if(this.stage===2&&distance(p,{x:1034,y:380})<100){if(canFinish(2,this.progress))this.enter(3);else this.say('Todavía faltan llaves para abrir la puerta.');return;}
  this.attack();
 }
 targets(){return [...this.props.filter(e=>!e.done&&e.kind==='targets'),...this.enemies.filter(e=>e.hp>0)];}
 hit(target,damage,kind='attack',hero=HEROES[this.hero].id){
  if(target.challengeTarget){const request=HOUSES[this.challenge?.index];if(request&&request.hero===hero&&request.kind===kind){target.done=true;target.hp=0;this.effect('¡Bien!',target.x,target.y-35);}return;}
  target.hp=Math.max(0,target.hp-damage);target.stun=Math.max(target.stun||0,.9);const dx=target.x-this.player.x,dy=target.y-this.player.y,len=Math.hypot(dx,dy)||1;
  target.x=clamp(target.x+dx/len*25,50,1070);target.y=clamp(target.y+dy/len*25,165,555);if(target.hp<=0)this.effect('¡Hasta luego!',target.x,target.y-55,'#d8bafa');
 }
 hurtBoss(damage){if(this.stage===3&&this.boss.hp>0&&!this.enemies.some(e=>e.hp>0)){this.boss.hp=Math.max(0,this.boss.hp-damage);this.effect('¡Paf!',this.boss.x,this.boss.y-110);}}
 area(radius,damage,kind,modifier=null){
  for(const target of this.targets())if(distance(this.player,target)<radius){this.hit(target,damage,kind);if(modifier&&!target.challengeTarget)modifier(target);}
  if(this.stage===3&&distance(this.player,this.boss)<radius)this.hurtBoss(damage);
 }
 attack(){if(this.attackCooldown>0)return;this.attackCooldown=.4;this.attackVisual=.28;const kind=HEROES[this.hero].id==='luca'?'katana':'attack';this.area(kind==='katana'?155:112,HEROES[this.hero].id==='aaron'?2:1,kind);this.onEvent('sound','attack');this.checkVictory();}
 safePlace(x,y){
  const walls=this.stage===2?ROOMS.walls:[];
  for(const [dx,dy] of [[0,0],[-75,0],[75,0],[0,90],[0,-90],[-160,0],[160,0]]){const p={x:clamp(x+dx,55,1060),y:clamp(y+dy,this.stage===0?350:155,565)};if(!collides(p.x,p.y,16,walls))return p;}
  return {...this.lastGround};
 }
 shoot(kind,damage=2){
  const target=this.targets().sort((a,b)=>distance(this.player,a)-distance(this.player,b))[0]||(this.stage===3?this.boss:null);
  const dir=target?{x:target.x-this.player.x,y:target.y-this.player.y}:this.face,len=Math.hypot(dir.x,dir.y)||1;
  this.bullets.push({x:this.player.x,y:this.player.y,vx:dir.x/len*340,vy:dir.y/len*340,life:3,friendly:true,kind,damage,hero:HEROES[this.hero].id});
 }
 power(index=0){
  if(this.mode!=='playing')return false;const hero=HEROES[this.hero],ability=hero.powers[index];if(!ability)return false;const key=this.hero+':'+index;
  if((this.cooldowns[key]||0)>0){this.say(ability.name+' todavía está recargando.',1);return false;}
  const kind=ability.kind,p=this.player;this.cooldowns[key]=this.stage===0?Math.min(ability.cooldown,1.1):ability.cooldown;this.effect(ability.name);this.onEvent('sound','power');
  if(['bones','ninja','stone','spikes','potato'].includes(kind))this.shoot(kind,kind==='potato'?3:2);
  if(kind==='snakes'){for(let i=0;i<2;i++)this.allies.push({kind:'snake',x:p.x+(i*2-1)*25,y:p.y+15,life:8,clock:0,hero:this.hero,source:hero.id});}
  if(kind==='bat'||kind==='flight'){this.statuses[kind]=7;this.protection=Math.max(this.protection,5);}
  if(kind==='resist'){this.statuses.resist=6;this.protection=Math.max(this.protection,6);this.ring(90);}
  if(kind==='illusions'||kind==='clone')for(let i=0;i<(kind==='illusions'?3:1);i++)this.allies.push({kind,x:clamp(p.x+(i-1)*70,50,1070),y:clamp(p.y+65,160,560),life:kind==='clone'?6:8,clock:0,hero:this.hero,source:hero.id});
  if(kind==='paint'){this.ring(210,'#b875ff');this.area(215,1,kind,e=>{e.paint=12;e.stun=2;});if(this.stage===3&&distance(p,this.boss)<215)this.boss.paint=12;}
  if(['katana','punch','stretch','sword'].includes(kind)){const reach={katana:160,punch:135,stretch:310,sword:180}[kind];this.attackVisual=.28;this.area(reach,kind==='punch'?3:2,kind);}
  if(kind==='prism'||kind==='gift'){const target=this.enemies.filter(e=>e.hp>0).sort((a,b)=>distance(p,a)-distance(p,b))[0];if(target&&distance(p,target)<500){this.hit(target,kind==='gift'?1:0,kind);target.stun=kind==='prism'?5:3;target.trap=target.stun;target.trapKind=kind;}}
  if(kind==='teleport'){const target=this.enemies.find(e=>e.hp>0)||this.boss;this.player=this.safePlace(target.x+115,target.y);this.ring(100);}
  if(kind==='reflect'){this.statuses.reflect=4;this.protection=Math.max(this.protection,4);}
  if(kind==='invisible'||kind==='fog'){this.statuses[kind]=5;this.ring(180,'#d2d9ee');}
  if(kind==='party'){this.ring(300);this.area(300,0,kind,e=>{e.stun=5;e.party=5;});}
  if(kind==='lightning'){this.ring(200,'#a7eeff');const target=this.targets().sort((a,b)=>distance(p,a)-distance(p,b))[0];if(target&&distance(p,target)<550)this.hit(target,2,kind);else if(this.stage===3&&distance(p,this.boss)<550)this.hurtBoss(2);}
  if(kind==='storm'||kind==='hammer'){this.delayed.push({x:p.x,y:p.y,life:1,kind,radius:kind==='storm'?400:245,damage:3});this.ring(kind==='storm'?400:245);}
  if(kind==='shield'){this.statuses.shield=4;this.protection=Math.max(this.protection,4);}
  if(kind==='mini')this.statuses.mini=6;
  if(kind==='sun'){this.area(400,0,kind,e=>e.stun=5);this.ring(400,'#ffe6a0');}
  if(kind==='wind'){this.area(300,0,kind,e=>{e.x=clamp(e.x+this.face.x*110,50,1070);e.y=clamp(e.y+this.face.y*110,160,560);e.stun=2;});for(const b of this.bullets)if(!b.friendly&&distance(p,b)<350){b.friendly=true;b.vx*=-2;b.vy*=-2;b.damage=2;b.kind='wind';}this.ring(300,'#c4eaf1');}
  if(kind==='time'){this.statuses.time=6;this.area(270,0,kind,e=>e.slow=6);this.ring(270,'#8af4dc');}
  this.onEvent('hud');this.checkVictory();return true;
 }
 damage(){if(this.invulnerable>0||this.protection>0||this.invisible)return;this.hp--;this.invulnerable=2;this.effect('¡Qué susto!',this.player.x,this.player.y-70,'#ffa4b6');this.onEvent('sound','hurt');this.onEvent('hud');if(this.hp<=0){this.mode='lost';this.onEvent('lost');}}
 checkVictory(){if(this.stage===3&&canFinish(3,{boss:this.boss.hp,minions:this.enemies.filter(e=>e.hp>0).length}))this.victory();}
 victory(){this.won=true;this.mode='won';this.bullets=[];this.say('¡Los ocho amigos recuperaron Halloween!',10);this.onEvent('save');this.onEvent('won');this.onEvent('sound','win');}
 update(dt,input={}){
  if(['paused','lost'].includes(this.mode))return;this.time+=dt;if(['title','won'].includes(this.mode))return;
  this.notice.time=Math.max(0,this.notice.time-dt);this.effects=this.effects.filter(e=>(e.life-=dt)>0);
  for(const key of Object.keys(this.cooldowns))this.cooldowns[key]=Math.max(0,this.cooldowns[key]-dt);
  for(const key of Object.keys(this.statuses))this.statuses[key]=Math.max(0,this.statuses[key]-dt);
  this.attackCooldown=Math.max(0,this.attackCooldown-dt);this.attackVisual=Math.max(0,this.attackVisual-dt);this.protection=Math.max(0,this.protection-dt);this.invulnerable=Math.max(0,this.invulnerable-dt);
  if(this.mode==='movie'){this.movieClock+=dt;if(this.movieClock>9)this.nextMovie();return;}
  let dx=Number(!!input.right)-Number(!!input.left),dy=Number(!!input.down)-Number(!!input.up);const len=Math.hypot(dx,dy)||1;
  this.moving=!!(dx||dy);if(this.moving)this.face={x:dx/len,y:dy/len};if(this.statuses.shield>0){dx=0;dy=0;}
  this.player=movePlayer(this.player,dx/len*(this.flying?300:205)*dt,dy/len*(this.flying?300:205)*dt,this.stage===2&&!this.flying?ROOMS.walls:[]);
  if(this.stage===0){this.player.y=Math.max(350,this.player.y);if(this.player.y>430&&this.player.x>1070&&dx>0)this.changeBlock(1);else if(this.player.y>430&&this.player.x<49&&dx<0)this.changeBlock(-1);}
  if(this.stage===2&&!collides(this.player.x,this.player.y,16,ROOMS.walls))this.lastGround={...this.player};else if(this.stage===2&&!this.flying)this.player={...this.lastGround};
  if(this.challenge){
   const h=HOUSES[this.challenge.index],correct=HEROES[this.hero].id===h.hero;
   if(h.task==='fly'&&correct&&this.flying)for(const prop of this.props)if(distance(prop,this.player)<38)prop.done=true;
   if(h.task==='resist'&&correct&&this.statuses.resist>0&&distance(this.player,this.props[1])<65){this.challenge.time+=dt;if(this.challenge.time>=3)this.props.forEach(e=>e.done=true);}
   if(h.task==='illusions'&&this.allies.filter(a=>a.kind==='illusions').length>=3){this.challenge.time+=dt;if(this.challenge.time>=2)this.props.forEach(e=>e.done=true);}
   if(this.props.every(e=>e.done))this.finishChallenge();
  }
  if(this.stage===2)ROOMS.keys.forEach((key,i)=>{if(!this.progress.keys.includes(i)&&distance(this.player,key)<36){this.progress.keys.push(i);this.effect('¡Una llave!',key.x,key.y-40);this.onEvent('sound','candy');this.onEvent('hud');}});
  for(const delayed of this.delayed){delayed.life-=dt;if(delayed.life<=0){const current=this.player;this.player={x:delayed.x,y:delayed.y};this.area(delayed.radius,delayed.damage,delayed.kind);this.ring(delayed.radius);this.player=current;}}
  this.delayed=this.delayed.filter(e=>e.life>0);
  for(const ally of this.allies){
   ally.life-=dt;ally.clock-=dt;if(ally.kind==='illusions')continue;
   const target=this.targets().sort((a,b)=>distance(a,ally)-distance(b,ally))[0]||(this.stage===3&&!this.enemies.some(e=>e.hp>0)?this.boss:null);
   if(target){const len=distance(ally,target)||1;ally.x+=(target.x-ally.x)/len*150*dt;ally.y+=(target.y-ally.y)/len*150*dt;if(len<40&&ally.clock<=0){if(target===this.boss)this.hurtBoss(1);else this.hit(target,1,ally.kind==='snake'?'snakes':'clone',ally.source);ally.clock=1.2;}}
  }
  this.allies=this.allies.filter(a=>a.life>0);
  for(const enemy of this.enemies){
   if(enemy.hp<=0)continue;for(const key of ['stun','paint','trap','party','slow'])enemy[key]=Math.max(0,(enemy[key]||0)-dt);
   if(enemy.stun<=0){
    const decoy=this.allies.filter(a=>['illusions','clone'].includes(a.kind)).sort((a,b)=>distance(enemy,a)-distance(enemy,b))[0];
    const target=decoy||this.player,dist=distance(enemy,target)||1,slow=enemy.slow>0||this.statuses.time>0?.35:1;
    if(enemy.kind==='wis'&&(!decoy&&(distance(enemy,this.player)>170||this.invisible))){enemy.x+=Math.cos(this.time*.8+enemy.seed)*25*dt*slow;enemy.y+=Math.sin(this.time*.7+enemy.seed)*25*dt*slow;}
    else if(!this.invisible||decoy){enemy.x+=(target.x-enemy.x)/dist*48*dt*slow;enemy.y+=(target.y-enemy.y)/dist*48*dt*slow;}
    enemy.x=clamp(enemy.x,60,1060);enemy.y=clamp(enemy.y,170,550);
    if(decoy&&dist<30&&decoy.kind==='clone')decoy.life=0;
   }
   if(enemy.stun<=0&&distance(enemy,this.player)<(this.statuses.mini>0?18:33))this.damage();if(this.mode==='lost')return;
  }
  if(this.stage===3&&this.boss.hp>0){this.boss.paint=Math.max(0,(this.boss.paint||0)-dt);this.boss.clock-=dt;
   if(this.boss.clock<=0){this.boss.clock=this.boss.hp<6?BOSS_RULES.angryInterval:BOSS_RULES.interval;const len=distance(this.player,this.boss)||1;this.bullets.push({x:this.boss.x,y:this.boss.y,vx:(this.player.x-this.boss.x)/len*BOSS_RULES.speed,vy:(this.player.y-this.boss.y)/len*BOSS_RULES.speed,life:10,kind:'pumpkin'});}
   if(distance(this.player,this.boss)<60)this.damage();
  }
  for(const b of this.bullets){
   b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
   if(b.friendly){const target=this.targets().find(t=>distance(b,t)<30);if(target){if(b.kind==='potato'){const old=this.player;this.player={x:b.x,y:b.y};this.area(130,3,b.kind);this.player=old;this.ring(130);}else this.hit(target,b.damage||2,b.kind,b.hero);b.life=0;}else if(this.stage===3&&distance(b,this.boss)<64){this.hurtBoss(b.damage||2);b.life=0;}}
   else if(distance(b,this.player)<(this.statuses.mini>0?12:25)){if(this.statuses.reflect>0){b.friendly=true;b.vx*=-2;b.vy*=-2;b.damage=2;b.kind='reflect';}else{this.damage();b.life=0;}}
  }
  this.bullets=this.bullets.filter(b=>b.life>0&&b.x>10&&b.x<1110&&b.y>125&&b.y<610);this.checkVictory();
 }
}
