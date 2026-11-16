// PRESEME · motor "escada de níveis" · desenho 3 · o filme (fixo): a cada instante, um quadro do molde. Fica por último no index.html.
(function () {
  const P = globalThis.ESCADA, SC = globalThis.SCORE;
  globalThis.Studio.film({
    fadeOut: 0,
    draw(ctx, t) { P.quadro(ctx, Math.min(Math.max(t, 0), SC.DURATION - 0.001)); },
  });
})();
