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
