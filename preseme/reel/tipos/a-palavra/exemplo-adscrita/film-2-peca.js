// PRESEME · motor "a palavra" · desenho 2 · a PEÇA "população adscrita" (exemplo do tipo).
// Só o que é desta palavra: os destaques, o território com a UBS e as casas (significa), a agente cadastrando a família
// na visita (exemplo) e o sinal da pegadinha. Tudo da biblioteca (B) e do kit (E); palavra escrita vem do textos.txt.
(function () {
  const U = globalThis.U, E = globalThis.ESTILOS, B = globalThis.BIB;
  const MP = globalThis.PRESEME_PALAVRA, M = MP.M;
  const D = M.D, cl = (v) => U.clamp(v, 0, 1);
  const CHAO = 1420;

  // o território: o chão, a UBS pequena à esquerda, duas casas e os moradores; a linha tracejada em volta se desenha
  // sozinha (kLimite) e o rótulo [D09] fica em cima dela. Devolve onde ficaram a UBS e as portas, para as ligações.
  function territorio(ctx, { kLimite = 1, kGente = 1, rotulo = true } = {}) {
    E.chao(ctx, CHAO, { seed: 3001 });
    B.ubsIcone(ctx, { x: 235, y: CHAO - 58 * 2.3, s: 2.3, seed: 3010 });
    const c1 = B.casa(ctx, { x: 600, y: CHAO, w: 230, h: 270, parede: 'superficie', telhado: 'apoioEscuro', seed: 3020 });
    const c2 = B.casa(ctx, { x: 870, y: CHAO, w: 210, h: 240, parede: 'destaque', telhado: 'coral', seed: 3040 });
    const gente = [['moradora', 515, 0.62], ['idoso', 715, 0.6], ['crianca', 950, 0.6]];
    gente.forEach(([q, x, s], i) => { const a = cl(kGente * 3 - i); if (a > 0) B.pessoa(ctx, { quem: q, x, y: CHAO + 16, s: s * (0.7 + 0.3 * a), look: -0.5, eyes: 'happy', seed: 3060 + i * 7 }); });
    // a linha do território, um lado de cada vez
    const x0 = 70, x1 = 1010, y0 = 880, y1 = 1490;
    const lados = [[[x0, y1], [x0, y0]], [[x0, y0], [x1, y0]], [[x1, y0], [x1, y1]]];
    lados.forEach(([de, ate], i) => B.tracejado(ctx, { de, ate, k: cl(kLimite * 3 - i), papel: 'alerta', lw: 8, n: i === 1 ? 14 : 8, seed: 3080 + i * 10 }));
    if (rotulo && kLimite > 0.3) E.texto(ctx, D('D09'), x0 + 30, y0 - 24, { papel: 'mao', size: 50, alpha: cl((kLimite - 0.3) * 3) });
    return { ubs: [395, CHAO - 240], topos: [[600, c1.topo - 12], [870, c2.topo - 12]] };
  }

  MP.PECA = {
    DESTAQUE: { 2: 'território de uma UBS', 3: 'referência de cuidado', 4: 'cadastra todas as pessoas', 5: 'duas formas', 6: 'População adscrita' },
    // significa: a 1.ª frase no quadro inteiro; a 2.ª pula para a UBS (o vínculo)
    focoSignifica: [null, [300, 1240]],
    focoExemplo: [null],

    significa(ctx, st, M, k) {
      if (st.i === 0) { territorio(ctx, { kLimite: cl(k * 1.8), kGente: cl(k * 2.5) }); return; }
      const T = territorio(ctx, { kLimite: 1, kGente: 1, rotulo: false });
      // o vínculo: a linha de cada casa até a UBS, e a equipe ao lado dela
      T.topos.forEach((pt, i) => B.tracejado(ctx, { de: pt, ate: T.ubs, k: cl(k * 2.4 - i * 0.35), papel: 'apoioEscuro', lw: 7, n: 9, seed: 3100 + i * 10 }));
      B.pessoa(ctx, { quem: 'medica', x: 140, y: CHAO + 16, s: 0.56, look: 0.6, seed: 3120 });
      B.pessoa(ctx, { quem: 'agente', x: 365, y: CHAO + 16, s: 0.56, look: 0.6, gesture: k > 0.5 ? 'point' : null, seed: 3130 });
      B.coracao(ctx, { x: 235, y: 960, k: U.ease.outBack(cl(k * 2 - 0.6)), s: 1.1 });
    },

    // exemplo: a agente na porta da casa [D10], a prancheta enchendo e um visto por morador
    exemplo(ctx, st, M, k) {
      E.chao(ctx, 1450, { seed: 3200 });
      B.arvore(ctx, { x: 160, y: 1450, h: 520, seed: 3205 });
      const casa = B.casa(ctx, { x: 760, y: 1450, w: 400, h: 440, numero: D('D10'), porta: 0.9, parede: 'superficie', telhado: 'apoioEscuro', seed: 3210 });
      const fam = [['moradora', 650, 0.66], ['crianca', 790, 0.62], ['idosa', 905, 0.64]];
      fam.forEach(([q, x, s], i) => B.pessoa(ctx, { quem: q, x, y: 1462, s, look: -0.8, eyes: k > 0.3 + i * 0.18 ? 'happy' : null, seed: 3230 + i * 9 }));
      B.pessoa(ctx, { quem: 'agente', x: 330, y: 1462, s: 0.78, look: 0.8, seed: 3260 });
      B.prancheta(ctx, { x: 455, y: 1075, s: 1.15, rot: 0.08, linhas: cl(k * 1.6) * 3, vistos: Math.floor(cl(k * 1.4) * 3.99), seed: 3270 });
      fam.forEach(([q, x], i) => B.visto(ctx, { x, y: 1170 - i * 6, k: U.ease.outBack(cl(k * 2.2 - 0.45 - i * 0.35)), s: 0.95 }));
      return casa;
    },

    // a pegadinha: as duas grafias que a PNAB usa
    sinal: '=',
    carimbo: true,
  };
})();
