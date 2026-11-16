// PRESEME · motor "linha do tempo" · desenho 3/3 · o filme (do molde: igual em toda peça deste motor)
// Carrega o que a peça pedir (PECA.init, por exemplo um mapa em assets/) e desenha cada quadro pelo molde (LINHA.quadro).
(function () {
  const M = globalThis.LINHA;
  globalThis.Studio.film({
    async init() { await M.carregar(); const p = globalThis.PECA; if (p && typeof p.init === 'function') await p.init(); },
    draw(ctx, t) { M.quadro(ctx, t); },
    fadeOut: 0,
  });
})();
