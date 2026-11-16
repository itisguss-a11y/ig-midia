// PRESEME · série "Na UBS, e agora?" · desenho 3/3 · o filme (do molde: igual em toda peça da série)
// Cada tipo de cena tem o seu arranjo; o desenho do gesto vem da peça (PECA.GESTO), pelo nome do gesto ou da cena.
(function () {
  const U = globalThis.U, G = globalThis.G, B = globalThis.UBS, SC = globalThis.SCORE;
  const { C, INK, W, H } = Object.assign({ W: G.W, H: G.H }, B);
  const desenho = (c) => B.CENA[c.id] || ((globalThis.PECA || {}).GESTO || {})[c.gesto] || ((globalThis.PECA || {}).GESTO || {})[c.id] || (() => {});

  // o close: da 2.ª frase em diante, o desenho fecha no detalhe que a frase explica (PECA.FOCO[cena ou gesto] = [x, y, zoom]).
  // É o corte seco do vídeo curto (o guia reels-script pede mudança na tela a cada 2 a 4 s). O close não sobe acima de
  // ZONA, onde ficam o texto e o trilho (e a conta, quando a cena tem gesto contado). Cena sem FOCO não fecha.
  const ZONA = 840, ZONA_CONTA = 930;
  function foco(c) { const F = (globalThis.PECA || {}).FOCO || {}; return F[c.id] !== undefined ? F[c.id] : F[c.gesto]; }
  function comFoco(ctx, st) {
    let f = st.i > 0 ? foco(st.c) : null;
    // na situação, o "!" (ABERTURA.alerta) já fecha um pouco: largo, médio no "!", fechado na 2.ª frase
    const AB = SC.ABERTURA;
    if (!f && st.c.tipo === 'situacao' && AB && st.u >= AB.alerta) { const g = foco(st.c); if (g) f = [g[0], g[1], 1 + ((g[2] || 1.3) - 1) * 0.45]; }
    if (!f) return desenho(st.c)(ctx, st);
    const [fx, fy, z = 1.3] = f;
    ctx.save();
    const zona = st.c.tConta ? ZONA_CONTA : ZONA;
    ctx.beginPath(); ctx.rect(0, zona, W, H - zona); ctx.clip();
    ctx.translate(fx, fy); ctx.scale(z, z); ctx.translate(-fx, -fy);
    desenho(st.c)(ctx, st);
    ctx.restore();
  }

  function texto(ctx, st, o = {}) { B.bloco(ctx, st.it.n, Object.assign({ alpha: st.aTexto, dy: st.dyTexto }, o)); }

  const ARRANJO = {
    // a situação: o lugar e as pessoas; o texto em cima
    situacao(ctx, st) { comFoco(ctx, st); texto(ctx, st); },
    // a pergunta: o cartão escuro com a frase enorme e o trilho vazio
    pergunta(ctx, st) { B.cartaoPergunta(ctx, st); },
    // o passo: o texto, o trilho com o passo da vez, a conta do gesto e o desenho do gesto
    passo(ctx, st) {
      comFoco(ctx, st);
      texto(ctx, st);
      B.trilho(ctx, st.c.num, st.c.passos, { t: st.t, tAcende: st.c.t0 });
      B.conta(ctx, st.c, st.t, { rot: st.c.rotulo });
    },
    // o alerta: a borda Coral pisca na entrada; o trilho sai de cena (o protocolo mudou de rumo)
    alerta(ctx, st) { comFoco(ctx, st); texto(ctx, st); B.bordaAlerta(ctx, st); },
    // os casos especiais: os cartões de cada caso
    especial(ctx, st) { desenho(st.c)(ctx, st); texto(ctx, st); },
    // a equipe: o que é dela e o que fica com quem socorre
    equipe(ctx, st) { comFoco(ctx, st); texto(ctx, st); },
    // o 192: o cartão do número (e o que a peça puser em volta)
    ligue192(ctx, st) { B.cartao192(ctx, st, desenho(st.c)); },
    // o cuidado: o erro e o certo
    erro(ctx, st) { comFoco(ctx, st); texto(ctx, st); },
    // o fecho: responde à pergunta da abertura, com o trilho completo
    fecho(ctx, st) {
      desenho(st.c)(ctx, st);
      B.bloco(ctx, st.it.n, { baseY: 640, sizes: [64, 58, 54, 50], maxLinhas: [3, 3, 3, 4] });
      B.trilho(ctx, 0, st.c.passos, { tudoFeito: true });
    },
  };

  globalThis.Studio.film({
    draw(ctx, t) {
      G.bg(ctx, C.papel);
      const st = B.estado(Math.min(Math.max(t, 0), SC.DURATION - 0.001));
      (ARRANJO[st.c.tipo] || ARRANJO.situacao)(ctx, st);
    },
    fadeOut: 0,
    post: { paper: 0.5, vignette: 0.12, grain: 0.04 },
  });
})();
