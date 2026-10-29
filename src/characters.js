// Costume illustrations based on the line-drawn cast of Aventura en Papel.
const ability=(name,kind,cooldown=5)=>({name,kind,cooldown});
const original={
 gaspar:[ability('Brazo elástico','stretch',3),ability('Superpuño','punch',4),ability('Teletransporte','teleport',6),ability('Papapumba','potato',5)],
 vicente:[ability('Prisma','prism',5),ability('Rayo regalo','gift',4),ability('Espacio-tiempo','teleport',6)],
 fabrizio:[ability('Cubo reflector','reflect',6),ability('Invisibilidad','invisible',8),ability('Picos','spikes',3),ability('¡Fiesta!','party',7)],
 luca:[ability('Rayo eléctrico','lightning',3),ability('Tormenta','storm',7),ability('Campo de fuerza','shield',7),ability('Hacerse chiquito','mini',5)],
 aaron:[ability('Burbuja temporal','time',5)],
 sebastian:[ability('Espada de piedra','sword',3),ability('Martillo de roca','hammer',5),ability('Piedra arrojadiza','stone',3)],
 benicio:[ability('Clonarse','clone',8)],
 amaral:[ability('Neblina','fog',6),ability('Sol cegador','sun',5),ability('Viento','wind',3)],
};
export const HEROES=[
 {id:'gaspar',name:'Gaspar',costume:'Esqueleto',color:'#22bfd5',special:[ability('Lanzar huesos','bones',1.2)]},
 {id:'vicente',name:'Vicente',costume:'Coatlicue',color:'#f05a96',special:[ability('Crear serpientes','snakes',4)]},
 {id:'fabrizio',name:'Fabrizio',costume:'Vampiro',color:'#9ecb52',special:[ability('Murciélago','bat',5)]},
 {id:'luca',name:'Luca',costume:'Ninja',color:'#20b5d5',special:[ability('Estrella ninja','ninja',1.2),ability('Catana','katana',1)]},
 {id:'aaron',name:'Aaron Mamani',costume:'Zombi',color:'#17a995',special:[ability('Pegar','punch',1)]},
 {id:'sebastian',name:'Sebástian',costume:'Gárgola',color:'#a293a8',special:[ability('Resistencia','resist',6),ability('Vuelo de gárgola','flight',5)]},
 {id:'benicio',name:'Benicio',costume:'Slenderman',color:'#ded9e4',special:[ability('Crear ilusiones','illusions',6)]},
 {id:'amaral',name:'Amaral',costume:'Bruja',color:'#b397df',special:[ability('Pintar de violeta','paint',3)]},
].map(h=>({...h,power:h.special[0].name,description:'Sus poderes de Halloween y todos sus poderes originales.',powers:[...h.special,...original[h.id]]}));
export const POWER_KEYS=['q','r','z','x','c','v','b'];
export function powerKey(hero,index){return index===0?'q':index<hero.special.length?'r':['z','x','c','v'][index-hero.special.length];}
export function characterSVG(id) {
  const hero=HEROES.find(h=>h.id===id)||HEROES[0],c=hero.color;
  const face='<circle cx="45" cy="40" r="15" fill="#fff2dc"/><circle cx="40" cy="39" r="1.7" fill="#38253e"/><circle cx="50" cy="39" r="1.7" fill="#38253e"/><path d="M40 46 Q45 50 50 45" fill="none" stroke="#38253e" stroke-width="2"/>';
  const legs=['luca','vicente','aaron'].includes(id)?'':' M45 87L33 103 M45 87L57 103';
  const body='<path d="M45 56V87 M45 64L29 76 M45 64L61 76'+legs+'" fill="none" stroke="'+c+'" stroke-width="5" stroke-linecap="round"/>';
  let art='';
  if(id==='gaspar')art='<path d="M34 27L30 17M42 25V12M51 26L57 17" stroke="'+c+'" stroke-width="4"/>'+body+'<path d="M45 57V87M34 63Q45 71 56 63M35 70Q45 78 55 70M37 78Q45 84 53 78M33 98L40 88M57 98L50 88" fill="none" stroke="#fff2dc" stroke-width="3" stroke-linecap="round"/><path d="M29 40Q29 24 45 25Q61 24 61 40L55 51H35Z" fill="#fff2dc" stroke="'+c+'" stroke-width="3"/><ellipse cx="39" cy="39" rx="4" ry="5" fill="#302539"/><ellipse cx="51" cy="39" rx="4" ry="5" fill="#302539"/><path d="M42 47L45 43L48 47M38 51H52M42 49V54M47 49V54" stroke="#302539" stroke-width="2"/>';
  if(id==='vicente')art='<path d="M45 25Q34 19 45 15Q56 11 45 6" fill="none" stroke="'+c+'" stroke-width="4"/>'+body+'<path d="M30 59L23 94Q45 108 68 94L59 59Z" fill="#2b735e" stroke="#f0b661" stroke-width="2"/><g fill="none" stroke="#b6db87" stroke-width="3"><path d="M32 66Q48 70 32 78T34 98M44 64Q60 71 44 79T46 99M56 66Q40 73 56 81T58 98"/></g>'+face+'<path d="M28 31L23 19L37 25L45 15L53 25L67 19L62 32Z" fill="#55ad8c" stroke="#f1c472" stroke-width="2"/><path d="M30 57Q45 70 60 57" stroke="#ffcd80" stroke-width="5" fill="none"/><circle cx="45" cy="62" r="4" fill="#f4dca8"/>';
  if(id==='fabrizio')art='<path d="M32 53L12 99Q45 83 78 99L58 53Z" fill="#842849" stroke="#e377a3" stroke-width="2"/><path d="M33 59L45 85L57 59" fill="#f9e7d1"/>'+body+'<path d="M29 40Q21 19 39 25Q54 17 62 31L60 45Z" fill="'+c+'"/>'+face+'<path d="M36 45L39 53L42 46M49 46L52 53L55 44" fill="white" stroke="#9f4b6b" stroke-width="1"/><path d="M30 50L22 49L32 64M60 50L68 49L58 64" fill="#a1375e"/>';
  if(id==='luca')art=body+'<path d="M28 40Q28 20 45 24Q64 23 62 45L57 56H33Z" fill="#283149" stroke="'+c+'" stroke-width="2"/><path d="M30 34H61V43H30Z" fill="'+c+'"/><path d="M33 36H57V42H33Z" fill="#f9e9cf"/><circle cx="39" cy="39" r="2"/><circle cx="51" cy="39" r="2"/><path d="M61 35L77 28L70 40L79 46L61 41" fill="'+c+'"/><path d="M34 58L57 79M35 80H57" stroke="#ffe0a3" stroke-width="3"/><path d="M63 68L66 59L69 68L78 71L69 74L66 83L63 74L54 71Z" fill="#c3d2e5" stroke="#6b7598" stroke-width="1"/>';
  if(id==='aaron')art=body+'<path d="M32 58L58 58L60 85L52 81L46 87L38 82L29 86Z" fill="#7a9e55" stroke="'+c+'" stroke-width="2"/>'+face+'<path d="M29 38Q29 22 44 24Q62 20 62 37L54 32L49 35L40 31L34 36Z" fill="#42745a"/><path d="M31 42L41 44M34 39V46M38 40V47M46 49L54 47M49 45V51" stroke="#725d78" stroke-width="2"/><path d="M27 68L17 61M60 69L72 64" stroke="'+c+'" stroke-width="5" stroke-linecap="round"/>';
  if(id==='sebastian')art='<path d="M34 58L10 43L7 76L20 69L24 83L37 73M56 58L80 43L83 76L70 69L66 83L53 73" fill="#776e8d" stroke="#c4b5cc" stroke-width="2"/>'+body+'<path d="M29 39L25 18L38 27L51 27L65 18L61 43L55 55H35Z" fill="#9b91a8" stroke="#d8ccd9" stroke-width="2"/><path d="M34 37L41 39M49 39L56 37" stroke="#ffcd80" stroke-width="3"/><path d="M37 47L44 50L53 45M45 31L42 37L46 42" stroke="#655773" stroke-width="2" fill="none"/>';
  if(id==='benicio')art='<path d="M35 53L26 88L39 86L37 106M55 53L64 88L51 86L53 106M30 61L15 97M60 61L75 97" fill="#24212d" stroke="#bcb1c5" stroke-width="2" stroke-linecap="round"/><path d="M34 54H56L50 88H40Z" fill="#27232d"/><path d="M38 54L45 65L52 54" fill="#fff1dd"/><path d="M45 59L48 64L45 83L42 64Z" fill="#c04e60"/><ellipse cx="45" cy="35" rx="13" ry="20" fill="#fff5e6" stroke="#b5a7c4" stroke-width="2"/><path d="M27 70Q5 66 12 50M63 70Q85 66 78 50" fill="none" stroke="#7b6b8c" stroke-width="2"/>';
  if(id==='amaral')art='<path d="M35 57L24 95Q45 106 66 95L55 57Z" fill="#8760b4" stroke="#d9b6f0" stroke-width="2"/>'+body+face+'<path d="M25 37Q27 59 31 68L35 46M65 37Q63 59 59 68L55 46" fill="#754ca0"/><path d="M18 32L34 26L44 3L56 26L73 32Q45 41 18 32Z" fill="#6a438f" stroke="#d9a8ef" stroke-width="2"/><path d="M33 25L58 27" stroke="#ffb96d" stroke-width="5"/><path d="M63 75L76 52" stroke="#f9c978" stroke-width="3"/><path d="M76 44L78 50L84 52L78 54L76 61L74 54L68 52L74 50Z" fill="#ffe0a0"/>';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 115" aria-hidden="true"><ellipse cx="45" cy="108" rx="25" ry="4" fill="#100c1a" opacity=".25"/>'+art+'</svg>';
}

