// PRESEME · motor "Caso com escolha" · desenho 3/3 · o filme (do molde: igual em toda peça deste tipo)
// A cada instante: o fundo do estilo e a cena do tipo (caso, pergunta, resposta, porque, aps, prevencao, fecho), que o molde desenha
// (film-1-molde.js) chamando os desenhos da peça (film-2-peca.js). Cena sem frase sai com a frase sobre o fundo.
(function () {
  const E = globalThis.ESTILOS, M = globalThis.MV, SC = globalThis.SCORE;
  globalThis.Studio.film({
    draw(ctx, t) {
      E.fundo(ctx);
      const st = M.estado(Math.min(Math.max(t, 0), SC.DURATION - 0.001));
      const desenho = M.CENA[st.c.tipo];
      if (desenho) desenho(ctx, st); else M.bloco(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
    },
    fadeOut: 0,
  });
})();
