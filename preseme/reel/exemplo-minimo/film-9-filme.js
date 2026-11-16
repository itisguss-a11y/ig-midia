// PRESEME · desenho 9 · o filme (modelo do motor): a cada instante, desenha a cena da vez. Fica por último no index.html.
// Cada cena é uma função em PRESEME.CENA[id](ctx, st), escrita nos arquivos de cena (film-2-....js); cena sem função
// sai com o desenho padrão (fundo papel e a frase da vez), para o vídeo rodar inteiro desde o começo.
(function () {
  const G = globalThis.G, P = globalThis.PRESEME, SC = globalThis.SCORE;
  globalThis.Studio.film({
    draw(ctx, t) {
      G.bg(ctx, P.C.papel);
      const st = P.estado(Math.min(Math.max(t, 0), SC.DURATION - 0.001));
      const cena = P.CENA[st.c.id];
      if (cena) cena(ctx, st); else P.padrao(ctx, st);
    },
    fadeOut: 0,
    post: { paper: 0.5, vignette: 0.12, grain: 0.04 },
  });
})();
