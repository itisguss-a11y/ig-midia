// PRESEME · tipo "o caminho" · desenho 3/3 · o filme (do molde: igual em toda peça deste tipo)
// Cada frase tem o seu quadro, e toda troca de frase é um corte:
//   pergunta: 1ª frase, o mapa do caminho se desenhando; 2ª frase, o cartão do medidor (o que tem de ser mantido)
//   parada:   1ª frase, o mundo (a viagem, a chegada, o carimbo); as seguintes, o cartão de cada cuidado
//   chegada:  1ª frase, o mundo (a última viagem); 2ª frase, o mapa inteiro, conferido
// O texto da frase fica por cima de tudo, no alto; o passaporte, no topo, em todo quadro que não é o mapa.
(function () {
  const G = globalThis.G, M = globalThis.CAMINHO, SC = globalThis.SCORE;
  const P = () => globalThis.PECA || {};
  const cuidado = (st) => ((P().CUIDADO || {})[st.c.id]) || null;

  function quadro(ctx, t) {
    const st = M.estado(Math.min(Math.max(t, 0), SC.DURATION - 0.001));
    const c = st.c, i = st.i;
    if (c.tipo === 'pergunta' && i === 0) {
      M.mapa(ctx, st);
      M.bloco(ctx, st.it.n, { baseY: 690, sizes: [84, 76, 70, 64], maxLinhas: [3, 3, 3, 4], papel: 'titulo', alpha: st.aTexto });
      return;
    }
    if (c.tipo === 'chegada' && i > 0) {
      M.mapa(ctx, st, { recap: true });
      M.bloco(ctx, st.it.n, { baseY: 690, sizes: [70, 64, 58, 54], maxLinhas: [3, 3, 3, 4], papel: 'titulo', alpha: st.aTexto });
      return;
    }
    if (i === 0 && (c.tipo === 'parada' || c.tipo === 'chegada')) M.mundo(ctx, st);
    else if (c.tipo === 'pergunta') M.cartao(ctx, st, {}, (P().CUIDADO || {}).pergunta || null);
    else M.cartao(ctx, st, st.it.cuidado || {}, cuidado(st));
    M.passaporte(ctx, t);
    M.bloco(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
  }

  globalThis.Studio.film({
    draw(ctx, t) { quadro(ctx, t); },
    fadeOut: 0,
  });
})();
