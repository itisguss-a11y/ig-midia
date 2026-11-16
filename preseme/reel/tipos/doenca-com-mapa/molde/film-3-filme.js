// PRESEME · série "Doença de Roraima" · desenho 3/3 · o filme (do molde: igual em toda peça da série)
// Em toda cena: o fundo do estilo, o selo de Roraima no canto e o rótulo fixo da série; no meio, a cena da peça.
// O apagador (SCORE.APAGA): nas trocas de cena e nas frases marcadas com "apaga", a faixa de pó varre o quadro;
// atrás dela fica o quadro novo, na frente dela ainda está o quadro velho.
(function () {
  const U = globalThis.U, G = globalThis.G, E = globalThis.ESTILOS, M = globalThis.DRR, SC = globalThis.SCORE;

  function quadro(ctx, t) {
    E.fundo(ctx);
    const st = M.estado(Math.min(Math.max(t, 0), SC.DURATION - 0.001));
    const c = st.c, desenho = M.CENA[c.id] || M.CENA[c.tipo];
    if (desenho) desenho(ctx, st);
    else M.bloco(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
    if (c.rotulo) { M.rotulo(ctx, c.rotulo, t, c.t0); if (c.tipo !== 'numero') M.selo(ctx); }
  }

  globalThis.Studio.film({
    async init() {
      const d = await globalThis.Studio.loadJSON('assets/rr.json');
      if (d && d.municipios) { M.RR.dados = d.municipios; M.RR.caixa = M.caixaDe(d.municipios); }
    },
    draw(ctx, t) {
      const dur = SC.APAGA_DUR || 0.35;
      const ta = (SC.APAGA || []).filter((a) => t >= a && t < a + dur).pop();
      if (ta === undefined) return quadro(ctx, t);
      const k = (t - ta) / dur, x = -260 + k * (G.W + 520) - 130; // a borda entre o quadro novo e o velho
      ctx.save(); ctx.beginPath(); ctx.rect(x, 0, G.W - x + 10, G.H); ctx.clip(); quadro(ctx, ta - 0.0005); ctx.restore();
      if (x > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, x, G.H); ctx.clip(); quadro(ctx, t); ctx.restore(); }
      M.apagador(ctx, k);
    },
    fadeOut: 0,
  });
})();
