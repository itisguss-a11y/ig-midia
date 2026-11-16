// PRESEME · motor "a palavra" · desenho 3 · o filme (do molde; não mude): a cada instante, a parte da vez.
// Fica por último no index.html.
(function () {
  const MP = globalThis.PRESEME_PALAVRA, SC = globalThis.SCORE;
  globalThis.Studio.film({
    fadeOut: 0,
    draw(ctx, t) {
      const st = MP.estado(Math.min(Math.max(t, 0), SC.DURATION - 0.001));
      const parte = MP.PARTE[st.c.id];
      if (!parte) throw new Error(`a parte "${st.c.id}" não existe no molde (palavra, significa, exemplo, pegadinha, fecho)`);
      parte(ctx, st);
    },
  });
})();
