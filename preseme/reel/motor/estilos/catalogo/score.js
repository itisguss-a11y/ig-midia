// PRESEME · biblioteca · o catálogo: 5 páginas paradas (0 lugares, 1 a 3 objetos, 4 gente), uma por segundo
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const FPS = 30, FORMAT = U.pickFormat('9:16');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION: 5, markers: { lugares: 0.5, objetos1: 1.5, objetos2: 2.5, objetos3: 3.5, gente: 4.5 }, ESTILO: 'lapis' };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
