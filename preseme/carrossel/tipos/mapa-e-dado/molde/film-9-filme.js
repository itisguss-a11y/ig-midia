// PRESEME · carrossel · mapa e dado · desenho 9 · a lâmina da vez. Fica por último no index.html. Antes da primeira
// lâmina, carrega os mapas do score (SCORE.MAPAS: nome → arquivo em assets/) em PRESEME.MAPAS; a cada instante, acha a
// lâmina (SCORE.laminaEm) e chama o molde dela, PRESEME.MOLDE[tipo]; tipo sem molde sai com o molde 'texto'.
(function () {
  const P = globalThis.PRESEME, SC = globalThis.SCORE;
  globalThis.Studio.film({
    fadeOut: 0,
    async init() {
      P.MAPAS = {};
      for (const [nome, arq] of Object.entries(SC.MAPAS || {})) {
        const d = await globalThis.Studio.loadJSON(arq);
        if (d) P.MAPAS[nome] = d.municipios || d.aneis || d;
        else console.log(`PRESEME-MAPA: não achei ${arq}`);
      }
    },
    draw(ctx, t) {
      const lam = SC.laminaEm(Math.min(Math.max(t, 0), SC.DURATION - 0.001));
      P.LAM = lam;
      const molde = P.MOLDE[lam.tipo] || P.MOLDE.texto;
      molde(ctx, lam);
    },
  });
})();
