# Aventura en Papel · Halloween

Videojuego independiente: Dulce o truco → Película → Casa embrujada → Pelea.

Ocho personajes: Gaspar (esqueleto), Vicente (Coatlicue), Fabrizio (vampiro), Luca (ninja), Aaron Mamani (zombi), Sebástian (gárgola), Benicio (Slenderman) y Amaral (bruja).

## Jugar

Requiere Node.js 20 o posterior, sin dependencias adicionales.

Ejecutar `node scripts/server.mjs` y abrir http://localhost:4175/.

WASD/flechas: moverse. E/espacio: acción. Q: poder. 1–8: personaje. P/Escape: pausa. En pantallas táctiles aparecen controles sobre el escenario. El progreso se guarda por capítulo en el navegador.

## Comprobar y construir

`node --test tests/halloween.test.mjs`

`node scripts/build.mjs`

El resultado está en `dist/`. El flujo incluido prepara GitHub Pages. Habilitar Settings → Pages → Source → GitHub Actions.

## Créditos

Personajes del universo Aventura en Papel, de juanwinograd. Esta primera versión se separó de Ajedrez-Papel para que funcione por su cuenta.

Patrick Hand: Patrick Wagesreiter; licencia SIL Open Font License incluida en assets/FONT-LICENSE.txt.


## Segunda versión: trucos y apagón

- Doce casas repartidas en tres cuadras. Cada vecino propone un truco propio; hay que realizarlo con el personaje y poder indicado para recibir su dulce. Las flechas de los extremos llevan a la siguiente cuadra; también se puede usar E junto a los carteles.
- La película se interrumpe con un apagón. El equipo se ofrece a ayudar: recoger el fusible, conectar el tablero y encender el proyector, en ese orden. Solo después se revela el plan de la Gran Calabaza.
- La casa incorpora Wis radioactivo (verde neón y máscara de gas), Wis negro, Wisa negra, Wis calabaza y Wisa calabaza. El Wis calabaza sigue el glosario original: cabeza naranja, cara negra y cuerpo negro. Las wisas usan los dos mechones curvados de Seshia (Shesia), copiados de la función `girl()` de `Aventura-Papel/src/art.js`: negros en la Wisa negra y naranja original en la Wisa calabaza.
- La Gran Calabaza dispara cada 3,8 segundos (3,2 al perder media vida); los proyectiles avanzan a 92 unidades por segundo y aparece un aviso previo. Antes disparaba cada 1,8/1,2 segundos a velocidad 155.
- Luca, Vicente y Aaron Mamani no tienen piernas en los dibujos.

### Poderes

Los nuevos se activan con Q y, cuando hay dos, R. Los originales se activan con Z, X, C y V. Todos tienen botones en pantalla y recargas individuales. E/espacio conserva el ataque básico; Luca ataca con catana y Aaron Mamani pega.

| Personaje | Halloween | Originales conservados |
| --- | --- | --- |
| Vicente | Crear serpientes | Prisma, rayo regalo, espacio-tiempo |
| Fabrizio | Convertirse en murciélago | Cubo reflector, invisibilidad, picos, fiesta |
| Luca | Estrella ninja y catana | Rayo eléctrico, tormenta, campo de fuerza, hacerse chiquito |
| Sebástian | Resistencia y vuelo | Espada de piedra, martillo de roca, piedra arrojadiza |
| Aaron Mamani | Pegar | Burbuja temporal |
| Gaspar | Lanzar huesos | Brazo elástico, superpuño, teletransporte, Papapumba |
| Benicio | Crear ilusiones que distraen | Clon autónomo que ataca |
| Amaral | Pintar de violeta | Neblina, sol cegador, viento |

Los poderes originales se contrastaron con `juanwinograd/Paper-Kombat/src/content.js`. Los guardados de la primera versión siguen cargando; el progreso se retoma al comienzo del capítulo.


## Combate al salvar Halloween

Al terminar la aventura se desbloquea **Pelear entre nosotros**, un combate lateral inspirado en Paper Kombat. El desbloqueo se conserva con la victoria guardada. Se puede jugar de a dos en el mismo dispositivo o contra la compu, elegir cualquiera de los ocho personajes y repetir personaje. Hay saltos, defensa, vida de 100, rounds de 60 segundos y victoria al ganar dos rounds. Los empates no suman.

Conserva los poderes originales y los de los disfraces. Fabrizio agrega **Drenar sangre**: desde cerca y mirando al rival, le quita vida, recupera hasta 8 puntos y lo deja gris, tenue y lento durante 7 segundos. Es un efecto de historieta sin sangre visible. Los poderes tienen recargas individuales.

Cada pocos segundos cae una calabaza. Recogerla otorga una carga de fuego, hielo, trueno, escudo o curación. Se activa con T (J1), O (J2) o el botón especial. Solo se puede llevar una carga; después de usarla se puede recoger otra. Las calabazas que no se recogen desaparecen.

| Control | Jugador 1 | Jugador 2 |
| --- | --- | --- |
| Moverse | A / D | ← / → |
| Saltar | W | ↑ |
| Golpe | F | K |
| Defensa | G | L |
| Poderes, en el orden de los botones | Q / R / Z / X / C / V | 7 / 8 / 9 / 0 / − / = |
| Poder de calabaza | T | O |
| Pausa | P o Escape | P o Escape |

Los dos jugadores tienen botones en pantalla. En teléfonos se preselecciona contra la compu, y se puede cambiar a dos jugadores. El combate es local; no añade salas online.

Se quitó el botón de elección automática del personaje en el diálogo de cada vecino. La selección general de personajes sigue disponible para resolver los retos.


## Códigos secretos del combate

En **Pelear entre nosotros → Elegí los dos personajes**, la barra **Código secreto** desbloquea personajes para ambos jugadores. Las mayúsculas, los espacios repetidos y las tildes no cambian el resultado. Los códigos incorrectos no modifican la selección y repetir un código no duplica personajes. Se guardan por separado del progreso de la aventura. Si el navegador bloquea el guardado, el desbloqueo funciona durante la sesión y se informa en pantalla.

| Código | Personajes y poderes |
| --- | --- |
| Escuela Bavio 16 12 | Baltazar, disfrazado de murciélago: cuadrados, camuflaje y ecolocalización. Máquina de bobadas, disfrazada de hada: risa y hechizo. |
| Halloween vs Día de los muertos | Wis calabaza: proyectiles de la Gran Calabaza y agujeros negros. Wis catrina: huesos del suelo, teletransporte y aplastamiento. |

La ecolocalización revela al rival invisible y disipa sus ilusiones. La risa avisa antes de activarse y deja al rival riendo cinco segundos; cubrirse o saltar a tiempo permite evitarla. El hechizo de hada lanza una estrella que transforma al rival en mariposa durante cuatro segundos: se mueve más lento y no puede atacar. Estos efectos tienen una breve inmunidad para evitar encadenarlos sin descanso.

El Wis calabaza usa el mismo tipo y velocidad de proyectil que la Gran Calabaza. Su agujero negro dura cinco segundos, atrae al oponente cercano y absorbe proyectiles. Los huesos de la catrina anuncian dónde van a brotar y se esquivan saltando a tiempo. Aplastar sitúa a la catrina sobre el rival y la deja caer sobre esa posición; el oponente puede apartarse o saltar.

Los cuatro personajes secretos tienen dibujos propios y solo se agregan al plantel de combate. La aventura conserva sus ocho personajes y sus guardados existentes. Baltazar conserva su forma violeta y nariz rectangular bajo el disfraz de murciélago; la Máquina mantiene su cara larga y lleva alas y varita de hada. El Wis catrina tiene cuerpo de ciudadano, cabeza de catrina y no tiene pelo.


Gaspar lleva una caperuza roja y una guitarra acústica sobre su disfraz de esqueleto. La misma ilustración se usa en la aventura, el cine, los selectores y el combate.
