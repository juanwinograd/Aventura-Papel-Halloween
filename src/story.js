export const SAVE_KEY='aventura-papel-halloween-v1';
export const CHAPTERS=[
  {title:'Dulce o truco',subtitle:'Una vuelta por el barrio',icon:'✧',objective:'Tocá los cuatro timbres con E. Reuní 12 dulces y entrá al cine.'},
  {title:'Película',subtitle:'Algo sale de la pantalla',icon:'▷',objective:'La película tiene algo que contarnos. Mirá la historia o avanzá con E.'},
  {title:'Casa embrujada',subtitle:'Tres llaves. Muchos sustos.',icon:'⌂',objective:'Encontrá las tres llaves. Después abrí la puerta naranja de la derecha con E.'},
  {title:'Pelea',subtitle:'La última calabaza',icon:'✦',objective:'Ahuyentá a los tres fantasmas con E. Después enfrentá a la Gran Calabaza. ¡Q activa tu poder!'},
];
export const MOVIE=[
  {speaker:'EL EQUIPO',text:'Con las bolsas llenas, los ocho amigos entraron al cine. La función se llamaba «La casa del último susto».'},
  {speaker:'GASPAR',text:'¡Ese esqueleto de la pantalla tiene mi mismo disfraz! ¿Y por qué nos está saludando?'},
  {speaker:'LA GRAN CALABAZA',text:'¡Gracias por traer los dulces! Cuando termine esta película, toda la noche de Halloween será mía.'},
  {speaker:'AMARAL',text:'¡La puerta de la película se está abriendo! Las tres llaves de la casa pueden romper el hechizo.'},
  {speaker:'VICENTE',text:'Somos ocho y tenemos un plan: entrar juntos, encontrar las llaves y recuperar Halloween. ¡Vamos!'},
];
export const ROOMS={
  walls:[{x:315,y:130,w:28,h:225},{x:315,y:445,w:28,h:125},{x:570,y:130,w:28,h:100},{x:570,y:320,w:28,h:250},{x:815,y:130,w:28,h:225},{x:815,y:445,w:28,h:125}],
  keys:[{x:195,y:205},{x:455,y:510},{x:715,y:200}],
};
export function canFinish(stage,progress){
  if(stage===0)return progress.candy>=12&&progress.houses.length===4;
  if(stage===1)return progress.movie>=MOVIE.length-1;
  if(stage===2)return progress.keys.length===3;
  return progress.boss<=0&&progress.minions<=0;
}
export function readSave(raw){
  try{
    const s=JSON.parse(raw);
    if(!s||s.version!==1||!Number.isInteger(s.stage)||s.stage<0||s.stage>3||!Number.isInteger(s.hero)||s.hero<0||s.hero>7||!Number.isInteger(s.candy)||s.candy<0||s.candy>12||typeof s.won!=='boolean')return null;
    if(s.stage>0&&s.candy!==12)return null;
    if(s.won&&s.stage!==3)return null;
    return {version:1,stage:s.stage,hero:s.hero,candy:s.candy,won:s.won};
  }catch{return null;}
}
export function collides(x,y,r,walls){return walls.some(w=>x+r>w.x&&x-r<w.x+w.w&&y+r>w.y&&y-r<w.y+w.h);}
export function movePlayer(p,dx,dy,walls){
  const next={...p},r=16;
  next.x=Math.max(42,Math.min(1078,p.x+dx));
  if(collides(next.x,p.y,r,walls))next.x=p.x;
  next.y=Math.max(145,Math.min(575,p.y+dy));
  if(collides(next.x,next.y,r,walls))next.y=p.y;
  return next;
}

