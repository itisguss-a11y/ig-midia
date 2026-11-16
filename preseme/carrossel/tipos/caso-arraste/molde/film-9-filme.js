// PRESEME · carrossel · desenho 9 · a lâmina da vez (modelo do motor). Fica por último no index.html. A cada instante,
// acha a lâmina (SCORE.laminaEm) e chama o molde dela, PRESEME.MOLDE[tipo]; tipo sem molde sai com o molde 'texto'.
// O carrossel é parado: o comando laminas tira uma foto de cada lâmina no meio do tempo dela.
(function () {
  const P = globalThis.PRESEME, SC = globalThis.SCORE, E = globalThis.ESTILOS;
  globalThis.Studio.film({
    fadeOut: 0,
    draw(ctx, t) {
      const lam = SC.laminaEm(Math.min(Math.max(t, 0), SC.DURATION - 0.001));
      P.LAM = lam;
      const molde = P.MOLDE[lam.tipo] || P.MOLDE.texto;
      molde(ctx, lam);
    },
  });
})();
