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
