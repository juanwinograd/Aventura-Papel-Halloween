import { HEROES, characterSVG } from './characters.js';
import { DUEL_HEROES, duelCharacterSVG } from './duel-characters.js';
import { ROOMS, HOUSES, CINEMA, WIS } from './story.js';
export { HOUSES } from './story.js';
const TAU=Math.PI*2;
export class Art {
  constructor(canvas){this.c=canvas.getContext('2d');this.images=DUEL_HEROES.map(h=>{const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(duelCharacterSVG(h.id));return image;});this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;}
  path(points,fill,stroke='#1c1428',width=3){const c=this.c;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));if(fill){c.closePath();c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.stroke();}}
  box(x,y,w,h,fill,stroke='#1c1428',width=3){this.path([[x,y+2],[x+w,y],[x+w-1,y+h],[x+1,y+h-1]],fill,stroke,width);}
  circle(x,y,r,fill,stroke=null,width=2){const c=this.c;c.beginPath();c.arc(x,y,r,0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
  text(value,x,y,size=24,color='#fff0d6',align='left'){const c=this.c;c.font=size+"px Patrick, 'Comic Sans MS', cursive";c.fillStyle=color;c.textAlign=align;c.fillText(value,x,y);}
  line(x,y,xx,yy,color,width=2){this.path([[x,y],[xx,yy]],null,color,width);}
  star(x,y,r,color='#ffcf8a'){const points=[];for(let i=0;i<8;i++){const a=i*TAU/8,rr=i%2?r*.2:r;points.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr]);}this.path(points,color,null);}
  moon(x=920,y=100,r=48){const c=this.c;c.save();c.shadowColor='#ffdcad';c.shadowBlur=40;this.circle(x,y,r,'#ffe4b4');c.restore();this.circle(x+17,y-12,r*.85,'#30213d');}
  sky(t){const c=this.c;const grad=c.createLinearGradient(0,0,0,630);grad.addColorStop(0,'#281b38');grad.addColorStop(.6,'#53405c');grad.addColorStop(1,'#2b263a');c.fillStyle=grad;c.fillRect(0,0,1120,630);for(let i=0;i<44;i++){const x=(i*167+43)%1110,y=(i*89+19)%235;this.star(x,y,2+(i%3),i%5===0?'#ffd38b':'#a38cb4');}this.moon();for(let i=0;i<3;i++)this.path([[0,300+i*31],[150,200+i*30],[370,290+i*22],[585,190+i*45],[835,295],[1120,215+i*52],[1120,630],[0,630]],['#3a2e48','#362c42','#2c2738'][i],null);for(let i=0;i<5;i++)this.bat(510+i*41,88+(i%3)*20,.65,t+i);}
  bat(x,y,s=1,t=0){const c=this.c;c.save();c.translate(x,y);c.scale(s,s);const flap=this.reduced?0:Math.sin(t*7)*6;this.path([[-3,0],[-20,-13-flap],[-26,1],[-17,-1],[-12,8],[-5,4],[0,9],[5,4],[12,8],[17,-1],[26,1],[20,-13-flap],[3,0],[0,-5]],'#1b1527','#9b79b2',1);c.restore();}
  pumpkin(x,y,s=1,evil=false){const c=this.c;c.save();c.translate(x,y);c.scale(s,s);this.line(0,-32,5,-44,'#9aaf6e',5);this.circle(-11,-13,20,'#d67a36','#402634');this.circle(11,-13,20,'#e58c41','#402634');this.circle(0,-14,21,'#ed9a4f','#402634');this.path([[-15,-20],[-5,-22],[-8,-11]],'#ffeb9d',null);this.path([[15,-20],[5,-22],[8,-11]],'#ffeb9d',null);this.path([[-13,-5],[-5,-2],[0,-6],[6,-2],[14,-7],[10,3],[-7,5]],'#ffeb9d',null);if(evil){this.line(-18,-27,-4,-22,'#47253c',3);this.line(18,-27,4,-22,'#47253c',3);}c.restore();}
  ghost(x,y,t=0,color='#dcccf0',size=1){const c=this.c;c.save();c.translate(x,y+(this.reduced?0:Math.sin(t*3)*5));c.scale(size,size);c.globalAlpha=.85;this.path([[-20,0],[-21,-23],[-16,-38],[-7,-45],[7,-45],[17,-38],[21,-23],[23,0],[12,-6],[5,2],[-4,-5],[-12,2]],color,'#82659d',2);this.circle(-7,-26,3,'#352342');this.circle(7,-26,3,'#352342');this.circle(0,-15,4,'#6f528c');c.restore();}
  hero(i,x,y,t=0,s=1,alpha=1){const image=this.images[i];if(!image?.complete||!image.naturalWidth)return;const c=this.c;c.save();c.globalAlpha=alpha;const bob=this.reduced?0:Math.sin(t*5+i)*2;c.drawImage(image,x-36*s,y-91*s+bob,72*s,92*s);c.restore();}
  tree(x,y,s=1){const c=this.c;c.save();c.translate(x,y);c.scale(s,s);this.path([[-11,0],[-4,-95],[-34,-126],[-49,-160],[-22,-139],[-8,-128],[-13,-188],[0,-165],[7,-122],[31,-146],[42,-186],[46,-145],[21,-110],[21,-71],[41,-89],[59,-117],[51,-80],[21,-48],[17,0]],'#201c2d','#65506c',2);c.restore();}
  web(x,y,s=1){const c=this.c;c.save();c.translate(x,y);c.scale(s,s);for(let i=0;i<5;i++){const a=i*Math.PI/8;this.line(0,0,Math.cos(a)*65,Math.sin(a)*65,'#a494b95c',1);}for(let r=18;r<68;r+=16){const pts=[];for(let i=0;i<5;i++){const a=i*Math.PI/8;pts.push([Math.cos(a)*r,Math.sin(a)*r]);}this.path(pts,null,'#a494b95c',1);}c.restore();}
  caption(title,sub){this.box(28,24,390,73,'#21172ed9','#7a6084',1);this.text(title,45,56,28,'#ffd18b');this.text(sub,45,80,17,'#c3afcf');}
  street(g){const c=this.c;this.sky(g.time);this.path([[0,365],[1120,350],[1120,630],[0,630]],'#463b4b','#766075',2);this.path([[0,430],[1120,414]],null,'#806c7d',2);for(let i=0;i<15;i++)this.line(i*90,590+(i%2)*9,i*90+36,588+(i%2)*9,'#655365',2);this.tree(35,385,.95);this.tree(1094,385,.75);
    HOUSES.filter(h=>h.block===g.block).forEach(h=>{const i=HOUSES.indexOf(h);const x=h.x-85;this.box(x,215,170,134,h.color,'#271d31');this.path([[x-13,218],[x+76,141+i%2*15],[x+183,218]],'#36273f','#20182a',4);this.box(x+115,145,22,48,'#5e455e');this.box(x+18,243,35,43,'#f6ce86','#b38a74',3);this.line(x+35,244,x+35,287,'#705361',3);this.line(x+18,264,x+53,264,'#705361',3);this.box(x+111,243,35,43,'#f6ce86','#b38a74',3);this.line(x+128,244,x+128,287,'#705361',3);this.box(h.x-23,281,46,69,g.progress.houses.includes(i)?'#748664':'#3a2a45',g.progress.houses.includes(i)?'#bdd88c':'#d6ab83',2);this.circle(h.x+14,322,3,'#ffd390');if(!g.progress.houses.includes(i)){this.circle(h.x,305,10,'#f7d5af','#39283f',2);this.line(h.x,316,h.x,340,'#d5a3c0',5);this.line(h.x,323,h.x-12,330,'#d5a3c0',4);this.line(h.x,323,h.x+12,330,'#d5a3c0',4);this.text(h.resident,h.x,130,17,'#e4c9e7','center');}this.pumpkin(x+30,348,.55);this.pumpkin(x+145,348,.48);this.text(g.progress.houses.includes(i)?'✓ ¡Gracias!':'Casa '+(i+1),h.x,387,18,g.progress.houses.includes(i)?'#bed496':'#d8c4df','center');if(!g.progress.houses.includes(i)&&Math.hypot(g.player.x-h.x,g.player.y-h.y)<90)this.prompt(h.x,270,'E · Tocar timbre');});
    if(g.block===2){this.box(932,252,151,109,'#735371','#241b30',3);this.path([[922,253],[1008,211],[1094,253]],'#3c2a47','#271c31',3);this.box(945,245,125,32,'#f0bd74','#7b4a4c',3);this.text('CINE DE PAPEL',1007,268,19,'#4b2d3c','center');this.box(981,290,54,71,'#30223e','#c99c87',2);this.line(1008,291,1008,360,'#c99c87',2);this.text('La última función',1009,386,18,'#ddbedf','center');if(g.progress.candy>=12){this.star(1008,312,13);this.prompt(1008,417,'E · Entrar al cine');}}this.caption('01 / Dulce o truco · Cuadra '+(g.block+1)+'/3','Un vecino, un truco y un dulce.');
    if(g.block>0)this.prompt(110,520,'← Cuadra anterior');if(g.block<2)this.prompt(1000,520,'Siguiente cuadra →');
    if(g.mode==='title')for(let i=0;i<8;i++)this.hero(i,245+i*85,515,g.time,.9);
  }
  prompt(x,y,label){const c=this.c;c.font='17px Patrick';const width=c.measureText(label).width+24;this.box(x-width/2,y-22,width,30,'#fff0d6','#33243d',2);this.text(label,x,y,17,'#48314d','center');}
  cinema(g){if(g.blackout){this.blackout(g);return;}const c=this.c;c.fillStyle='#17101f';c.fillRect(0,0,1120,630);for(let x=0;x<200;x+=40){this.path([[x,0],[x+25,0],[x+50,480],[x+5,500]],x%80?'#53263d':'#692e45',null);this.path([[1120-x,0],[1095-x,0],[1070-x,480],[1115-x,500]],x%80?'#53263d':'#692e45',null);}this.box(211,30,698,399,'#e0cbaa','#574354',9);c.save();c.beginPath();c.rect(225,43,670,370);c.clip();this.box(225,43,670,370,'#44324f',null);this.moon(763,110,33);for(let i=0;i<18;i++)this.star(245+(i*73)%620,62+(i*53)%160,3,'#dbb8df');this.path([[225,320],[410,280],[590,319],[750,278],[895,318],[895,414],[225,414]],'#2b2436',null);
    const m=g.progress.movie;if(m===0){this.text('LA CASA DEL',560,161,44,'#ffdcaa','center');this.text('ÚLTIMO SUSTO',560,218,58,'#ffbb70','center');this.pumpkin(560,333,1.6,true);}else if(m===1){this.box(225,43,670,370,'#181222',null);this.text('¡SE CORTÓ LA LUZ!',560,185,43,'#ddc5eb','center');this.text('¿Quién se ofrece a arreglarlo?',560,255,30,'#ffdb9c','center');}else if(m===2){this.text('¡NOSOTROS LO ARREGLAMOS!',560,125,34,'#ffbb70','center');this.hero(3,560,350,g.time,1.8);}else if(m===3){this.pumpkin(560,323,3.4,true);this.text('VOY A ROBAR TODOS LOS DULCES',560,95,30,'#ffbb70','center');}else{this.box(467,131,186,283,'#b07b67','#191020',5);this.path([[444,132],[560,66],[674,132]],'#2c2038','#191020',4);this.box(514,242,92,172,m===4?'#e3b87c':'#1e142b','#f5c37e',3);for(let i=0;i<3;i++)this.key(505+i*55,184,.8);if(m===4)this.hero(1,560,382,g.time,1.2);}c.restore();this.line(211,436,909,436,'#ba826a',4);
    for(let row=0;row<2;row++)for(let i=0;i<8;i++){const x=205+i*102+row*13,y=512+row*94;if(row===0)this.hero(i,x,y,g.time,.8);this.box(x-34,y-12,74,53,'#642e4c','#2d1b34',3);this.box(x-39,y+22,84,18,'#7e3b59','#2d1b34',3);}this.text('FUNCIÓN ESPECIAL · '+(g.progress.movie+1)+' / 5',560,28,16,'#bda1ce','center');
  }
  key(x,y,s=1){const c=this.c;c.save();c.translate(x,y);c.scale(s,s);this.circle(0,-10,9,null,'#ffd38c',5);this.line(0,0,0,21,'#ffd38c',5);this.line(0,12,8,12,'#ffd38c',4);this.line(0,20,8,20,'#ffd38c',4);c.restore();}
  house(g){const c=this.c;c.fillStyle='#201829';c.fillRect(0,0,1120,630);this.box(25,115,1070,482,'#46374c','#8a6c8a',3);for(let i=0;i<12;i++){this.line(28,135+i*39,1091,135+i*39,'#59455a',1);for(let j=0;j<8;j++){const x=28+j*147+(i%2)*60;this.line(x,136+i*39,x,173+i*39,'#59455a',1);}}this.box(50,147,230,84,'#4f3c59','#a17d85',3);this.box(367,147,170,80,'#63475c','#a17d85',2);this.box(631,440,145,100,'#52465c','#a17d85',2);for(let i=0;i<3;i++){this.box(372+i*55,158,43,59,'#705469','#281d31',1);this.circle(391+i*55,188,5,'#d6b48d');}this.box(90,266,140,75,'#6b4659','#b98783',3);this.box(90,253,140,31,'#835c6f','#322238',3);this.text('¡Buuu!',160,309,28,'#d8a19c','center');this.box(367,455,174,82,'#80694d','#2c2232',3);this.text('LOS DULCES',455,486,20,'#e8cb98','center');this.text('NO ESTÁN ACÁ',455,514,20,'#e8cb98','center');
    for(const w of ROOMS.walls){this.box(w.x,w.y,w.w,w.h,'#776077','#b899aa',2);for(let y=w.y+18;y<w.y+w.h;y+=26)this.line(w.x+1,y,w.x+w.w-1,y,'#504057',1);}for(let i=0;i<3;i++)if(!g.progress.keys.includes(i)){const k=ROOMS.keys[i];this.circle(k.x,k.y,28,'#ffca7d18');this.key(k.x,k.y+(this.reduced?0:Math.sin(g.time*3+i)*3));this.star(k.x+21,k.y-21,5);}
    this.box(1000,255,69,125,g.progress.keys.length===3?'#bd7749':'#62435a','#ffc383',3);this.text('SALIDA',1035,238,22,'#ffc383','center');this.text(g.progress.keys.length+' / 3',1034,320,28,'#fff0d6','center');this.circle(1055,335,4,'#ffd99a');if(Math.hypot(g.player.x-1034,g.player.y-380)<105)this.prompt(1018,420,g.progress.keys.length===3?'E · Abrir':'Faltan llaves');this.web(30,119);this.web(845,134,.8);this.web(598,440,.8);this.pumpkin(926,542,.8);this.pumpkin(80,545,.7);this.caption('03 / La casa embrujada','No todo lo que hace «buuu» es malo.');
  }
  arena(g){const c=this.c;this.sky(g.time);this.box(27,130,1065,468,'#493247','#9f7284',3);for(let i=0;i<8;i++)this.line(30,152+i*59,1090,152+i*59,'#624156',1);this.circle(735,350,155,'#9d674120','#a77c62',2);this.circle(735,350,126,null,'#a77c62',1);for(let i=0;i<8;i++){const a=i/8*TAU;this.star(735+Math.cos(a)*142,350+Math.sin(a)*142,10,'#9d795b');}this.tree(56,330,1.1);this.tree(1074,330,1.1);for(let i=0;i<7;i++)this.pumpkin(90+i*156,582,.7);this.caption('04 / La última calabaza','Un equipo de papel contra un gran susto.');const boss=g.boss;if(boss.hp>0){const y=boss.y+(this.reduced?0:Math.sin(g.time*2)*7);c.save();if(boss.paint>0)c.filter='hue-rotate(240deg)';this.pumpkin(boss.x,y,2.2,true);c.restore();if(boss.clock<1.1){this.circle(boss.x,y-28,85,null,'#ffda89',3);this.text('¡Va a disparar!',boss.x,y-145,23,'#ffda89','center');}if(g.enemies.some(e=>e.hp>0)){this.circle(boss.x,y-31,83,'#b391d51c','#ac89cf',2);this.text('Escudo de fantasmas',boss.x,y-125,22,'#d1b1e4','center');}this.box(boss.x-80,y+35,160,12,'#281c31','#bd887f',1);this.box(boss.x-79,y+36,158*Math.max(0,boss.hp)/12,10,'#f5a859',null);this.text('LA GRAN CALABAZA',boss.x,y+75,20,'#eac2aa','center');}
  }
  blackout(g){
    const c=this.c;c.fillStyle='#171323';c.fillRect(0,0,1120,630);this.box(30,125,1060,475,'#302a40','#706082',3);
    for(let i=0;i<10;i++)this.line(32,145+i*44,1087,145+i*44,'#40374d',1);
    const glow=c.createRadialGradient(g.player.x,g.player.y-25,15,g.player.x,g.player.y-25,230);glow.addColorStop(0,'#ffdea52a');glow.addColorStop(1,'#ffdea500');c.fillStyle=glow;c.fillRect(30,125,1060,475);
    this.box(75,155,160,155,'#504452','#a88e8e',3);this.text('DEPÓSITO',155,145,22,'#d8c0dd','center');
    for(const [id,station] of Object.entries(CINEMA)){const done=g.progress.repairs.includes(id),labels={fuse:'1 · Fusible',panel:'2 · Tablero',projector:'3 · Proyector'};this.circle(station.x,station.y,58,done?'#b9e59b22':'#ffca7d18');this.box(station.x-28,station.y-39,56,61,done?'#73a37c':'#796978','#ddc7ac',2);this.text(done?'✓':'ϟ',station.x,station.y+4,33,done?'#e2fbb8':'#fcd28f','center');this.text(labels[id],station.x,station.y+65,25,'#e8c8ed','center');if(Math.hypot(g.player.x-station.x,g.player.y-station.y)<85)this.prompt(station.x,station.y+95,done?'Ya funciona':'E · Reparar');}
    this.line(190,245,510,200,'#9b7f55',4);this.line(590,200,920,270,'#9b7f55',4);
    for(let i=0;i<6;i++){this.box(300+i*110,390,75,90,'#502b44','#80506b',2);this.box(300+i*110,490,75,80,'#502b44','#80506b',2);}
    this.caption('02 / ¡Apagón en el cine!','Nos ofrecemos a ayudar. Reparaciones: '+g.progress.repairs.length+'/3');
  }
  wis(e,t){
    const c=this.c;c.save();c.translate(e.x,e.y+(this.reduced?0:Math.sin(t*3+e.seed)*2));const pumpkin=e.id.includes('pumpkin'),female=e.id.includes('wisa'),color=e.paint>0?'#b875ff':e.color;
    this.path([[0,-31],[0,0],[-12,-12],[0,-24],[12,-12]],null,pumpkin?'#25212b':color,7);
    if(pumpkin){this.box(-20,-72,40,39,e.paint>0?'#b875ff':'#ff9637','#372332',2);this.line(0,-74,6,-82,'#91c46c',4);this.circle(-8,-58,3,'#211826');this.circle(8,-58,3,'#211826');this.path([[-11,-48],[0,-44],[12,-50],[6,-39],[-6,-39]],'#211826',null);}
    else this.circle(0,-52,21,color,e.id==='radioactive'?'#d8ff9f':'#9b8da9',2);
    if(e.id==='radioactive'){this.box(-19,-63,38,26,'#4a5850','#20252c',2);this.circle(-9,-55,7,'#c9f1a0','#253a30',2);this.circle(9,-55,7,'#c9f1a0','#253a30',2);this.circle(0,-40,8,'#59685b','#182a25',2);this.circle(0,-40,3,'#151c1a');}
    if(female){
      // Seshia's mirrored hair strokes from Aventura-Papel/src/art.js, girl().
      // Scale the original head radius of 14 to the Wis head radius of 21.
      const hair=e.id==='black-wisa'?'#15121b':'#f29b43',scale=1.5;
      for(const side of [-1,1])this.path([[side*12,-61],[side*22,-45],[side*33,-47],[side*36,-53]].map(([x,y])=>[x*scale,-52+(y+52)*scale]),null,hair,6);
    }
    if(e.paint>0)this.text('VIOLETA',0,-94,13,'#d7b3ff','center');this.text(e.name,0,23,16,'#e9d9f0','center');c.restore();
  }
  projectile(b){
    if(b.kind==='bones'){this.line(b.x-10,b.y-5,b.x+10,b.y+5,'#fff0d6',5);for(const x of [-1,1])for(const y of [-1,1])this.circle(b.x+x*11,b.y+x*5+y*3,4,'#fff0d6');}
    else if(b.kind==='square')this.box(b.x-10,b.y-10,20,20,'#ad79e3','#e6c9ff',2);
    else if(b.kind==='hex'){this.star(b.x,b.y,17,'#efb3ed');this.circle(b.x,b.y,5,'#fff0ca');}
    else if(b.kind==='ninja')this.star(b.x,b.y,14,'#bde8f4');
    else if(b.kind==='stone'||b.kind==='potato')this.circle(b.x,b.y,12,b.kind==='stone'?'#bbb0ba':'#c4a06c','#5c4858',2);
    else if(b.kind==='spikes')this.path([[b.x,b.y-12],[b.x-9,b.y+8],[b.x+9,b.y+8]],'#b8db79','#4b6d3c',2);
    else{this.circle(b.x,b.y,9,b.friendly?'#b6ecdf':'#f5b365','#d07b5a',2);this.star(b.x,b.y,5,'#ffdeb0');}
  }
  helpers(g){
    const c=this.c;
    for(const ally of g.allies){if(ally.kind==='snake'){this.path([[ally.x-15,ally.y],[ally.x-6,ally.y-9],[ally.x+5,ally.y],[ally.x+16,ally.y-10]],null,'#b4e37c',7);this.circle(ally.x+17,ally.y-12,6,'#b4e37c');this.circle(ally.x+19,ally.y-14,1,'#18251b');}else this.hero(ally.hero,ally.x,ally.y,g.time,.85,ally.kind==='illusions'?.38:.7);}
    for(const delayed of g.delayed){this.circle(delayed.x,delayed.y-25,delayed.radius,null,'#e7b6f2',2);this.text(delayed.kind==='hammer'?'◆':'☁',delayed.x,delayed.y-100,40,'#dfc8f2','center');}
    if(g.challenge){const h=HOUSES[g.challenge.index];for(const prop of g.props){if(prop.done){this.text('✓',prop.x,prop.y-25,32,'#bdd88c','center');continue;}if(h.task==='fly'){this.star(prop.x,prop.y-40,18,'#ffe0a0');this.circle(prop.x,prop.y,23,null,'#a5b8cc',1);}else if(h.task==='resist'){this.circle(prop.x,prop.y,30,'#ffdb8222','#e8c371',2);if(prop===g.props[1])this.text(Math.min(3,g.challenge.time).toFixed(1)+' / 3 s',prop.x,prop.y-45,22,'#ffdb82','center');}else{this.box(prop.x-18,prop.y-64,36,50,'#80697f','#d6b9d2',2);this.circle(prop.x,prop.y-48,8,h.kind==='paint'?'#f0dbbf':'#e9c283');this.text(h.kind==='party'?'♪':h.kind==='time'?'◷':h.kind==='wind'?'✣':h.kind==='lightning'?'ϟ':'◎',prop.x,prop.y-21,25,'#352738','center');}}}
  }
  drawDuel(duel){
    const c=this.c;c.clearRect(0,0,1120,630);this.sky(duel.time);this.box(25,510,1070,100,'#634355','#ad7c7c',3);this.line(30,512,1090,512,'#e0b98c',4);
    for(let i=0;i<9;i++)this.pumpkin(65+i*125,590,.65);
    this.text('PAPER KOMBAT · NOCHE DE HALLOWEEN',560,40,26,'#ffd29d','center');this.text('ROUND '+duel.round+' · '+Math.ceil(duel.seconds)+' s',560,76,25,'#edcee8','center');
    for(const f of duel.fighters){
      const left=f.index===0,x=left?50:725,name=DUEL_HEROES[f.hero].name;
      this.text('J'+(f.index+1)+' · '+name,x,106,27,'#f2dcf2');this.box(x,117,345,17,'#21162b','#ba92b7',1);this.box(x+1,118,343*f.hp/100,15,left?'#8dcfb7':'#eda6b6',null);this.text(Math.ceil(f.hp)+' / 100 · Rounds: '+f.wins,x,158,19,'#d8c4df');
    }
    for(const p of duel.pumpkins){this.pumpkin(p.x,p.y,1);if(p.landed)this.text('PODER',p.x,p.y+30,17,'#ffcf81','center');else this.star(p.x,p.y-55,9,'#ffdd9e');}
    for(const hole of duel.holes){this.circle(hole.x,hole.y,52,'#100c19','#aa79d9',5);this.circle(hole.x,hole.y,34,'#05030c','#714a9f',2);for(let n=0;n<8;n++){const a=n/8*TAU+(this.reduced?0:duel.time*2);this.star(hole.x+Math.cos(a)*68,hole.y+Math.sin(a)*40,5,'#c08cec');}this.text('AGUJERO NEGRO',hole.x,hole.y+85,15,'#d7b5f2','center');}
    for(const d of duel.delayed){this.box(d.x-d.radius,510-8,d.radius*2,9,'#e5b0f033','#f0b6ee',2);this.text(d.kind==='laugh'?'¡RISA!':d.kind==='bone-ground'?'HUESOS ↑':d.kind==='hammer'?'◆':'ϟ',d.x,350,d.kind==='bone-ground'?27:38,'#f7c9ff','center');}
    for(const ally of duel.summons){if(ally.kind==='snake'){this.path([[ally.x-20,502],[ally.x-7,489],[ally.x+5,501],[ally.x+20,487]],null,'#b1df7b',7);this.circle(ally.x+22,485,7,'#b1df7b');}else this.hero(duel.fighters[ally.owner].hero,ally.x,ally.y,duel.time,1.1,ally.kind==='illusions'?.3:.65);}
    for(const b of duel.projectiles){if(b.kind==='fire'){this.circle(b.x,b.y,14,'#ff8d43');this.star(b.x,b.y,9,'#ffe7a3');}else if(b.kind==='ice')this.star(b.x,b.y,17,'#b2f4ff');else if(b.kind==='lightning')this.text('ϟ',b.x,b.y+12,42,'#d1faff','center');else this.projectile(b);}
    for(const f of duel.fighters){
      c.save();const faded=f.statuses.drained>0,alpha=f.hp<=0?.25:faded?.48:(f.statuses.invisible>0||f.statuses.fog>0)&&!(f.statuses.revealed>0)?.25:1;
      c.filter=(faded?'grayscale(1) ':'')+(f.statuses.paint>0?'hue-rotate(245deg)':'');
      if(f.statuses.bat>0){c.globalAlpha=alpha;this.bat(f.x,f.y-50,2,duel.time);}else if(f.statuses.hex>0){for(const side of [-1,1]){this.circle(f.x+side*20,f.y-68,22,'#dfa1f0','#f4daff',2);this.circle(f.x+side*16,f.y-38,15,'#b89fe9','#f4daff',2);}this.line(f.x,f.y-83,f.x,f.y-26,'#ffdcaa',6);}else this.hero(f.hero,f.x,f.y,duel.time,f.statuses.crush>0?1.95:f.statuses.mini>0?.65:1.35,alpha);
      c.restore();
      if(f.statuses.echo>0)for(let n=0;n<3;n++)this.circle(f.x,f.y-55,35+((duel.time*90+n*40)%160),null,'#b4d9f275',2);
      if(f.statuses.revealed>0){this.circle(f.x,f.y-55,70,null,'#b9e7ff',2);this.text('DETECTADO',f.x,f.y-130,17,'#b9e7ff','center');}
      if(f.statuses.laugh>0)this.text('¡JA JA JA!',f.x,f.y-150,24,'#ffc1e7','center');
      if(f.statuses.hex>0)this.text('HECHIZADO',f.x,f.y-115,19,'#e9bbff','center');
      if(f.statuses.crush>0)this.text('↓ ¡APLASTAR!',f.x,f.y+55,22,'#ffdec1','center');
      if(f.statuses.flight>0)this.path([[f.x-20,f.y-60],[f.x-70,f.y-110],[f.x-45,f.y-45],[f.x,f.y-55],[f.x+45,f.y-45],[f.x+70,f.y-110],[f.x+20,f.y-60]],null,'#c0a7d8',5);
      if(f.guard||f.statuses.shield>0||f.statuses.resist>0)this.circle(f.x,f.y-52,75,'#a3defa12',f.guard?'#b8e6ec':'#dec0f7',3);
      if(f.statuses.reflect>0)this.box(f.x-52,f.y-115,104,122,'#c5e4ff14','#bfe9ff',3);
      if(f.statuses.trap>0)this.box(f.x-48,f.y-110,96,115,f.statuses.gift>0?'#eaa4d46b':'#b8ceff28','#e4b9ef',3);
      if(f.statuses.party>0)this.text('♪ ♫',f.x,f.y-130,32,'#ffd28f','center');
      if(f.statuses.drained>0)this.text('DRENADO · '+Math.ceil(f.statuses.drained)+' s',f.x,f.y-140,20,'#c9c3ce','center');
      if(f.statuses.slow>0)this.text('LENTO',f.x,f.y-115,18,'#bbebf2','center');
      if(f.attack>0)this.path([[f.x+f.facing*35,f.y-85],[f.x+f.facing*115,f.y-60],[f.x+f.facing*55,f.y-25]],null,'#ffe2a1',5);
      this.text('J'+(f.index+1),f.x,f.y+29,19,f.index===0?'#aee2c9':'#ffb9cc','center');
    }
    for(const e of duel.effects){c.save();c.globalAlpha=Math.min(1,e.life);if(e.kind==='bone-ground'){for(let offset=-80;offset<=80;offset+=40){this.line(e.x+offset,e.y,e.x+offset,e.y-65,'#f4e9d3',9);this.circle(e.x+offset-5,e.y-70,7,'#f4e9d3');this.circle(e.x+offset+5,e.y-70,7,'#f4e9d3');}}else if(e.kind==='drain'){this.path([[e.toX,e.toY],[e.x,e.y]],null,'#db729a',4);for(let i=0;i<5;i++){const t=(duel.time*2+i/5)%1;this.circle(e.toX+(e.x-e.toX)*t,e.toY+(e.y-e.toY)*t,5,'#e9a2bc');}}else this.text(e.text,e.x,e.y-(1.2-e.life)*20,25,e.color,'center');c.restore();}
  }
  draw(g){const c=this.c;c.clearRect(0,0,1120,630);if(g.stage===0)this.street(g);else if(g.stage===1)this.cinema(g);else if(g.stage===2)this.house(g);else this.arena(g);
    if((g.stage!==1||g.blackout)&&g.mode!=='title'){
      for(const e of g.enemies)if(e.hp>0){if(e.kind==='wis')this.wis(e,g.time);else this.ghost(e.x,e.y,g.time+e.seed,e.paint>0?'#b875ff':e.stun>0?'#f0ddb0':'#dcccf0');if(e.trap>0){this.box(e.x-30,e.y-70,60,80,e.trapKind==='gift'?'#efb9d04a':'#87c9fb33','#e5c9ff',2);this.text(e.trapKind==='gift'?'🎁':'△',e.x,e.y-75,24,'#fff0d6','center');}if(e.party>0)this.text('♪ ♫',e.x,e.y-70,25,'#ffce77','center');if(g.stage===3){this.text('♥'.repeat(e.hp),e.x,e.y+20,14,'#deafd5','center');}}
      for(const b of g.bullets){this.projectile(b);}
      const p=g.player;if(g.protection>0){this.circle(p.x,p.y-30,52,'#b89ae326','#d1b1f2',2);for(let i=0;i<6;i++){const a=i/6*TAU+g.time;this.circle(p.x+Math.cos(a)*51,p.y-30+Math.sin(a)*51,4,'#f3c57b');}}
      if(g.buff==='flight'&&g.protection>0)this.bat(p.x,p.y-45,1.8,g.time);else {const scale=g.statuses.mini>0?.48:1;this.hero(g.hero,p.x,p.y-(g.flying?22:0),g.moving?g.time*2:0,scale,g.invisible?.25:g.invulnerable>0&&Math.floor(g.time*12)%2?.4:1);if(g.buff==='gargoyle'){this.path([[p.x-15,p.y-55],[p.x-65,p.y-90],[p.x-45,p.y-35],[p.x-20,p.y-30]],'#9982af','#d3b5ec',2);this.path([[p.x+15,p.y-55],[p.x+65,p.y-90],[p.x+45,p.y-35],[p.x+20,p.y-30]],'#9982af','#d3b5ec',2);}}
      if(g.attackVisual>0)this.circle(p.x,p.y-22,98*(1-g.attackVisual/.28),null,'#ffe0a4',3);
      if(g.statuses.reflect>0)this.box(p.x-44,p.y-82,88,90,'#a7d7ed22','#a7d7ed',3);
      this.text(HEROES[g.hero].name,p.x,p.y+23,17,'#f0dcf2','center');
    }
    this.helpers(g);
    for(const fx of g.effects){c.save();c.globalAlpha=Math.min(1,fx.life);if(fx.type==='ring')this.circle(fx.x,fx.y-25,(1-fx.life/fx.max)*fx.radius,null,fx.color,4);else if(fx.type==='text')this.text(fx.text,fx.x,fx.y-(fx.max-fx.life)*25,26,fx.color,'center');else this.star(fx.x,fx.y-(fx.max-fx.life)*30,8,fx.color);c.restore();}
    if(g.notice.time>0&&!g.challenge){const text=g.notice.text;c.font='18px Patrick';const width=Math.min(1030,c.measureText(text).width+45);this.box(560-width/2,552,width,45,'#251b32ee','#bd91b1',1);this.text(text,560,582,18,'#ffe5b9','center');}
    // Sparse, fixed flecks retain the look of ink on a handmade sheet.
    c.fillStyle='#ffe0b508';for(let i=0;i<180;i++)c.fillRect((i*137)%1120,(i*83)%630,2,1);
  }
}
