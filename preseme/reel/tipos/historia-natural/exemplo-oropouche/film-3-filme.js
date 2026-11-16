// PRESEME · motor "história natural" · desenho 3/3 · o filme (do molde: igual em toda peça deste motor)
// Carrega o que a peça pedir (PECA.init) e desenha cada quadro pelo molde (HIST.quadro).
(function () {
  const M = globalThis.HIST;
  globalThis.Studio.film({
    async init() { const p = globalThis.PECA; if (p && typeof p.init === 'function') await p.init(); },
    draw(ctx, t) { M.quadro(ctx, t); },
    fadeOut: 0,
  });
})();
