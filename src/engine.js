import { HEROES } from './characters.js';
import { CHAPTERS, MOVIE, ROOMS, canFinish, movePlayer } from './story.js';
import { HOUSES } from './art.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export class HalloweenGame {
  constructor(onEvent=()=>{}){
    this.onEvent=onEvent;this.hero=0;this.stage=0;this.mode='title';this.time=0;this.player={x:140,y:480};this.progress={candy:0,houses:[],keys:[],movie:0};this.hp=5;this.enemies=[];this.bullets=[];this.effects=[];this.notice={text:'',time:0};this.cooldown=0;this.attackCooldown=0;this.attackVisual=0;this.protection=0;this.invulnerable=0;this.buff='';this.movieClock=0;this.moving=false;this.boss={x:820,y:340,hp:12,clock:2};this.won=false;
  }
  chooseHero(index){if(index<0||index>=HEROES.length)return;this.hero=index;this.onEvent('hero');if(this.mode!=='title')this.onEvent('save');}
  start(save=null){this.progress.candy=save?.candy||0;this.hero=save?.hero??this.hero;this.won=false;this.enter(save?.stage||0);if(save?.won)this.victory();}
  checkpoint(){return {version:1,stage:this.stage,hero:this.hero,candy:this.stage?12:0,won:this.won};}
  enter(stage){
    this.stage=stage;this.hp=5;this.player={x:stage===0?140:100,y:stage===0?480:stage===2?400:340};this.enemies=[];this.bullets=[];this.effects=[];this.progress.houses=[];this.progress.keys=[];this.progress.movie=0;this.cooldown=0;this.attackCooldown=0;this.attackVisual=0;this.protection=0;this.invulnerable=1;this.buff='';this.movieClock=0;this.mode=stage===1?'movie':'playing';this.moving=false;
    if(stage===0)this.progress.candy=0;
    if(stage===2)this.enemies=[{x:250,y:395,hp:99,seed:0,stun:0,kind:'house'},{x:475,y:295,hp:99,seed:2,stun:0,kind:'house'},{x:740,y:385,hp:99,seed:4,stun:0,kind:'house'}];
    if(stage===3){this.boss={x:820,y:340,hp:12,clock:2};this.enemies=[{x:440,y:230,hp:2,seed:1,stun:0,kind:'arena'},{x:530,y:470,hp:2,seed:3,stun:0,kind:'arena'},{x:650,y:310,hp:2,seed:5,stun:0,kind:'arena'}];}
    this.say(CHAPTERS[stage].objective,7);this.onEvent('stage');this.onEvent('save');
  }
  say(text,time=3.5){this.notice={text,time};this.onEvent('notice',text);}
  effect(text,x=this.player.x,y=this.player.y-80,color='#ffdb97'){this.effects.push({type:'text',text,x,y,color,life:1.5,max:1.5});}
  ring(radius,color=HEROES[this.hero].color){this.effects.push({type:'ring',x:this.player.x,y:this.player.y,radius,color,life:.7,max:.7});}
  pause(){if(this.mode==='playing'||this.mode==='movie'){this.previousMode=this.mode;this.mode='paused';this.onEvent('pause');}else if(this.mode==='paused'){this.mode=this.previousMode;this.onEvent('resume');}}
  nextMovie(){if(this.mode!=='movie')return;this.movieClock=0;if(canFinish(1,this.progress))this.enter(2);else{this.progress.movie++;this.onEvent('movie');this.onEvent('sound','page');}}
  action(){
    if(this.mode==='movie'){this.nextMovie();return;}
    if(this.mode!=='playing')return;
    const p=this.player;
    if(this.stage===0){
      if(this.enemies.some(e=>e.hp>0&&distance(p,e)<115)){this.attack();return;}
      if(distance(p,{x:1008,y:370})<110){if(canFinish(0,this.progress)){this.enter(1);return;}this.say('¡Todavía faltan dulces! Hay más timbres por tocar.');return;}
      const index=HOUSES.findIndex(h=>distance(p,h)<95);
      if(index<0){this.say('Acercate a una puerta y tocá el timbre con E.');return;}
      if(this.progress.houses.includes(index)){this.say('¡Esta casa ya nos dio dulces! Probemos otro timbre.');return;}
      this.progress.houses.push(index);this.progress.candy+=3;this.effect('+3 dulces',HOUSES[index].x,285);this.onEvent('sound','candy');
      if(index%2){this.enemies.push({x:HOUSES[index].x+45,y:390,hp:1,seed:index,stun:0,kind:'trick',life:7});this.say('¡Truco! Un fantasmita bromista. ¡Esquivalo o ahuyentalo con E!');}
      else this.say('¡Dulce! Tres caramelos para compartir con el equipo.');
      if(canFinish(0,this.progress))this.say('¡Doce dulces! La función está por empezar. Vamos al cine de la derecha.',6);
      this.onEvent('hud');return;
    }
    if(this.stage===2){
      if(distance(p,{x:1034,y:380})<100){if(canFinish(2,this.progress)){this.enter(3);return;}this.say('La puerta necesita las tres llaves. ¡Busquemos en las habitaciones!');}
      else this.say('Buscá los brillos dorados. Las llaves se recogen al acercarse.');
    }
    this.attack();
  }
  attack(){
    if(this.attackCooldown>0)return;this.attackCooldown=.4;this.attackVisual=.28;this.onEvent('sound','attack');let hit=false;
    for(const e of this.enemies)if(e.hp>0&&distance(this.player,e)<115){this.hit(e,1);hit=true;}
    if(this.stage===3&&this.boss.hp>0&&distance(this.player,this.boss)<155){if(this.enemies.some(e=>e.hp>0))this.say('Los tres fantasmas protegen a la calabaza. ¡Ahuyentalos primero!');else{this.boss.hp--;this.effect('¡Paf!',this.boss.x,this.boss.y-110);hit=true;}}
    if(hit)this.onEvent('sound','hit');this.checkVictory();
  }
  hit(enemy,damage){
    if(enemy.kind==='house'){enemy.stun=3;this.effect('¡Buuu!',enemy.x,enemy.y-60);return;}
    enemy.hp=Math.max(0,enemy.hp-damage);enemy.stun=.9;const dx=enemy.x-this.player.x,dy=enemy.y-this.player.y,len=Math.hypot(dx,dy)||1;enemy.x=Math.max(50,Math.min(1070,enemy.x+dx/len*48));enemy.y=Math.max(165,Math.min(555,enemy.y+dy/len*48));if(enemy.hp<=0)this.effect('¡Hasta luego!',enemy.x,enemy.y-55,'#d8bafa');
  }
  power(){
    if(this.mode!=='playing')return;if(this.cooldown>0){this.say('El poder está recargando. ¡Ya falta poco!',1.5);return;}
    const hero=HEROES[this.hero],p=this.player;this.cooldown=8;this.ring(hero.kind==='quake'?300:210);this.effect(hero.power);this.onEvent('sound','power');
    if(hero.kind==='shield')this.protection=6;
    if(hero.kind==='flight'||hero.kind==='shadow'){this.protection=3.5;this.buff=hero.kind;}
    if(hero.kind==='heal'){this.hp=Math.min(5,this.hp+1);this.protection=1;}
    const radius=hero.kind==='quake'?300:hero.kind==='spell'?280:hero.kind==='heal'?170:210;
    if(['burst','quake','spell','heal'].includes(hero.kind)){
      for(const enemy of this.enemies)if(enemy.hp>0&&distance(p,enemy)<radius){this.hit(enemy,2);if(hero.kind==='spell')enemy.stun=4;}
      if(this.stage===3&&!this.enemies.some(e=>e.hp>0)&&distance(p,this.boss)<radius&&this.boss.hp>0)this.boss.hp=Math.max(0,this.boss.hp-2);
    }
    if(hero.kind==='ranged'){
      const targets=this.enemies.filter(e=>e.hp>0).sort((a,b)=>distance(p,a)-distance(p,b));
      if(targets[0]&&distance(p,targets[0])<540){this.hit(targets[0],2);this.effects.push({type:'text',text:'✦',x:targets[0].x,y:targets[0].y-30,color:'#b6ecfa',life:1,max:1});}
      else if(this.stage===3&&!targets.length&&distance(p,this.boss)<540)this.boss.hp=Math.max(0,this.boss.hp-2);
    }
    this.onEvent('hud');this.checkVictory();
  }
  damage(){if(this.invulnerable>0||this.protection>0)return;this.hp--;this.invulnerable=1.8;this.effect('¡Qué susto!',this.player.x,this.player.y-70,'#ffa4b6');this.onEvent('sound','hurt');this.onEvent('hud');if(this.hp<=0){this.mode='lost';this.onEvent('lost');}}
  checkVictory(){if(this.stage===3&&canFinish(3,{boss:this.boss.hp,minions:this.enemies.filter(e=>e.hp>0).length}))this.victory();}
  victory(){this.won=true;this.mode='won';this.bullets=[];this.say('¡Los ocho amigos recuperaron Halloween!',10);this.onEvent('save');this.onEvent('won');this.onEvent('sound','win');}
  update(dt,input={}){
    if(this.mode==='paused'||this.mode==='lost')return;this.time+=dt;
    if(this.mode==='title'||this.mode==='won')return;
    this.notice.time=Math.max(0,this.notice.time-dt);this.effects=this.effects.filter(e=>(e.life-=dt)>0);this.cooldown=Math.max(0,this.cooldown-dt);this.attackCooldown=Math.max(0,this.attackCooldown-dt);this.attackVisual=Math.max(0,this.attackVisual-dt);this.protection=Math.max(0,this.protection-dt);this.invulnerable=Math.max(0,this.invulnerable-dt);
    if(this.mode==='movie'){this.movieClock+=dt;if(this.movieClock>9)this.nextMovie();return;}
    const dx=Number(!!input.right)-Number(!!input.left),dy=Number(!!input.down)-Number(!!input.up),len=Math.hypot(dx,dy)||1,speed=this.protection>0&&['flight','shadow'].includes(this.buff)?310:205;
    this.moving=!!(dx||dy);this.player=movePlayer(this.player,dx/len*speed*dt,dy/len*speed*dt,this.stage===2?ROOMS.walls:[]);if(this.stage===0)this.player.y=Math.max(350,this.player.y);
    if(this.stage===2)ROOMS.keys.forEach((key,index)=>{if(!this.progress.keys.includes(index)&&distance(this.player,key)<36){this.progress.keys.push(index);this.effect('¡Una llave!',key.x,key.y-40);this.onEvent('sound','candy');this.onEvent('hud');if(canFinish(2,this.progress))this.say('¡Las tres llaves! La puerta naranja está en la habitación de la derecha.',6);}});
    for(const enemy of this.enemies){
      if(enemy.hp<=0)continue;enemy.stun=Math.max(0,enemy.stun-dt);if(enemy.kind==='trick'){enemy.life-=dt;if(enemy.life<=0){enemy.hp=0;continue;}}
      if(enemy.stun<=0){if(enemy.kind==='house'){enemy.x+=Math.cos(this.time*.9+enemy.seed)*dt*43;enemy.y+=Math.sin(this.time*.7+enemy.seed)*dt*48;enemy.x=Math.max(70,Math.min(1050,enemy.x));enemy.y=Math.max(180,Math.min(540,enemy.y));}else{const len=distance(enemy,this.player)||1,speed=enemy.kind==='arena'?58:55;enemy.x+=(this.player.x-enemy.x)/len*dt*speed;enemy.y+=(this.player.y-enemy.y)/len*dt*speed;}}
      if(enemy.stun<=0&&distance(enemy,this.player)<33)this.damage();if(this.mode==='lost')return;
    }
    if(this.stage===3&&this.boss.hp>0){
      this.boss.clock-=dt;if(this.boss.clock<=0){this.boss.clock=this.boss.hp<6?1.2:1.8;const len=distance(this.player,this.boss)||1;this.bullets.push({x:this.boss.x,y:this.boss.y,vx:(this.player.x-this.boss.x)/len*155,vy:(this.player.y-this.boss.y)/len*155,life:8});}
      if(distance(this.player,this.boss)<62)this.damage();
    }
    for(const bullet of this.bullets){bullet.x+=bullet.vx*dt;bullet.y+=bullet.vy*dt;bullet.life-=dt;if(distance(bullet,this.player)<25){this.damage();bullet.life=0;}}
    this.bullets=this.bullets.filter(b=>b.life>0&&b.x>10&&b.x<1110&&b.y>125&&b.y<610);
  }
}
