// PRESEME · motor "meme em vídeo" · desenho 3 · o filme (do molde; não mude): a cada instante, o tempo da vez.
// Fica por último no index.html.
(function () {
  const MM = globalThis.PRESEME_MEME, SC = globalThis.SCORE;
  globalThis.Studio.film({
    fadeOut: 0,
    draw(ctx, t) {
      const st = MM.estado(Math.min(Math.max(t, 0), SC.DURATION - 0.001));
      const tempo = MM.TEMPO[st.c.id];
      if (!tempo) throw new Error(`o tempo "${st.c.id}" não existe no molde (preparacao, virada, licao, fecho)`);
      tempo(ctx, st);
    },
  });
})();
