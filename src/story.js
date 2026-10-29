export const SAVE_KEY='aventura-papel-halloween-v1';
export const CHAPTERS=[
 {title:'Dulce o truco',subtitle:'12 vecinos, 12 desafíos',icon:'✧',objective:'Visitá las 12 casas de las tres cuadras. Cada vecino pide un truco distinto. E: hablar; Q/R y Z/X/C/V: poderes.'},
 {title:'Película',subtitle:'¡Se cortó la luz!',icon:'▷',objective:'Nos ofrecimos a reparar el apagón. Buscá el fusible, conectá el tablero y encendé el proyector con E.'},
 {title:'Casa embrujada',subtitle:'Los cinco Wis nos esperan',icon:'⌂',objective:'Encontrá tres llaves entre los Wis. Podés distraerlos con ilusiones, pintar de violeta o usar tus poderes originales.'},
 {title:'Pelea',subtitle:'La última calabaza',icon:'✦',objective:'Ahuyentá a los tres fantasmas y enfrentá a la Gran Calabaza. Sus disparos ahora son más lentos. ¡Usá todos tus poderes!'},
];
export const MOVIE=[
 {speaker:'EL EQUIPO',text:'Con los doce dulces, entramos a ver «La casa del último susto». ¡La película empieza!'},
 {speaker:'ENCARGADA DEL CINE',text:'¡Se cortó la luz en medio de la película! El fusible, el tablero y el proyector dejaron de funcionar.'},
 {speaker:'LUCA',text:'¡Nosotros lo arreglamos! Busquemos el fusible en el depósito y volvamos a conectar el tablero.'},
 {speaker:'LA GRAN CALABAZA',text:'¡Ahora que volvió la luz pueden oírme! Mis cinco Wis custodian las llaves. Voy a robarme todos los dulces de Halloween.'},
 {speaker:'VICENTE',text:'¡Ese era su plan! Ahora lo sabemos. Entremos a la casa embrujada y recuperemos Halloween.'},
];
const tricks=[
 ['Doña Luna','gaspar','bones','Lanzá huesos y derribá los tres blancos de mi jardín.','targets'],
 ['Don Jacinto','vicente','snakes','Creá serpientes para espantar a los ratoncitos de papel.','targets'],
 ['La vecina del gato','fabrizio','bat','Convertite en murciélago y recogé las tres estrellas flotantes.','fly'],
 ['Don Farol','luca','katana','Usá la catana para romper las tres piñatas de papel.','targets'],
 ['La bibliotecaria','aaron','time','Frená los tres relojes con tu burbuja temporal.','targets'],
 ['El abuelo de piedra','sebastian','resist','Activá tu resistencia y aguantá tres segundos sobre la marca dorada.','resist'],
 ['La directora de teatro','benicio','illusions','Creá tres ilusiones para que actúen en mi escenario.','illusions'],
 ['La pintora','amaral','paint','Pintá de violeta a mis tres muñecos de papel.','targets'],
 ['El DJ del barrio','fabrizio','party','¡Hacé bailar a los tres espantapájaros con tu fiesta!','targets'],
 ['La electricista','luca','lightning','Encendé mis tres faroles con tu rayo eléctrico.','targets'],
 ['El coleccionista','sebastian','stone','Tirá piedras y acertales a los tres blancos.','targets'],
 ['La señora del viento','amaral','wind','Hacé girar los tres molinetes con una ráfaga de viento.','targets'],
];
export const HOUSES=tricks.map(([resident,hero,kind,request,task],i)=>({x:155+(i%4)*220,y:350,block:Math.floor(i/4),color:['#654c79','#526c70','#816054','#596343'][i%4],name:'Casa '+(i+1),resident,hero,kind,request,task}));
export const CINEMA={fuse:{x:155,y:245},panel:{x:555,y:200},projector:{x:950,y:270}};
export const WIS=[
 {id:'radioactive',name:'Wis radioactivo',color:'#a6ff27',x:235,y:395},
 {id:'black',name:'Wis negro',color:'#24212c',x:470,y:285},
 {id:'black-wisa',name:'Wisa negra',color:'#24212c',x:720,y:385},
 {id:'pumpkin',name:'Wis calabaza',color:'#ff9c3c',x:935,y:210},
 {id:'pumpkin-wisa',name:'Wisa calabaza',color:'#ff9c3c',x:950,y:500},
];
export const ROOMS={
 walls:[{x:315,y:130,w:28,h:225},{x:315,y:445,w:28,h:125},{x:570,y:130,w:28,h:100},{x:570,y:320,w:28,h:250},{x:815,y:130,w:28,h:225},{x:815,y:445,w:28,h:125}],
 keys:[{x:195,y:205},{x:455,y:510},{x:715,y:200}],
};
export function canFinish(stage,p){
 if(stage===0)return p.candy>=12&&new Set(p.houses).size===12;
 if(stage===1)return p.repairs?.length===3&&p.movie>=MOVIE.length-1;
 if(stage===2)return p.keys.length===3;
 return p.boss<=0&&p.minions<=0;
}
export function readSave(raw){
 try{const s=JSON.parse(raw);if(!s||![1,2].includes(s.version)||!Number.isInteger(s.stage)||s.stage<0||s.stage>3||!Number.isInteger(s.hero)||s.hero<0||s.hero>7||!Number.isInteger(s.candy)||s.candy<0||s.candy>12||typeof s.won!=='boolean')return null;if(s.stage>0&&s.candy!==12||s.won&&s.stage!==3)return null;return {...s,version:2};}catch{return null;}
}
export function collides(x,y,r,walls){return walls.some(w=>x+r>w.x&&x-r<w.x+w.w&&y+r>w.y&&y-r<w.y+w.h);}
export function movePlayer(p,dx,dy,walls){const next={...p},r=16;next.x=Math.max(42,Math.min(1078,p.x+dx));if(collides(next.x,p.y,r,walls))next.x=p.x;next.y=Math.max(145,Math.min(575,p.y+dy));if(collides(next.x,next.y,r,walls))next.y=p.y;return next;}
