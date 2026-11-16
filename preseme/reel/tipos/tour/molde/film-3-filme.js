// PRESEME · tipo "tour" · desenho 3/3 · o filme (do molde: igual em toda peça deste tipo)
// Cada frase tem o seu quadro, e toda troca de frase é um corte:
//   entrada: 1ª frase, a fachada (a pessoa chega e entra); 2ª, a entrada por dentro, na janela
//   sala:    1ª frase, o corredor (a pessoa anda, a placa acende, a porta abre) e, logo depois, a sala por dentro, na janela;
//            2ª, a sala de perto, em quem trabalha ali; 3ª, o aluno na sala
//   fora:    o lado de fora, com quem anda por ele
//   planta:  a planta inteira se desenhando; na 2ª frase (se houver), a planta inteira conferida
// O texto da frase fica por cima de tudo, no alto.
(function () {
  const M = globalThis.TOUR, SC = globalThis.SCORE;
  function quadro(ctx, t) {
    const st = M.estado(Math.min(Math.max(t, 0), SC.DURATION - 0.001));
    switch (st.vista) {
      case 'fachada': M.fachada(ctx, st); break;
      case 'recepcao': M.recepcao(ctx, st); break;
      case 'corredor': M.corredor(ctx, st); break;
      case 'dentro': M.dentro(ctx, st, 'largo'); break;
      case 'perto': M.dentro(ctx, st, 'perto'); break;
      case 'voce': M.dentro(ctx, st, 'voce'); break;
      case 'fora': M.fora(ctx, st); break;
      case 'resumo': M.planta(ctx, st, { recap: true }); break;
      default: M.planta(ctx, st);
    }
    const titulo = st.c.tipo === 'entrada' && st.i === 0;
    M.bloco(ctx, st.it.n, titulo ? { sizes: [84, 76, 70, 64], maxLinhas: [2, 3, 3, 4], papel: 'titulo', alpha: st.aTexto } : { alpha: st.aTexto });
  }
  globalThis.Studio.film({ draw(ctx, t) { quadro(ctx, t); }, fadeOut: 0 });
})();
