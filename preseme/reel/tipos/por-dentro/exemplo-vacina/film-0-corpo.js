// PRESEME · motor "por dentro" · desenho 0/3 · o corpo por dentro (do molde: a peça chama, não reescreve)
// Desenhos do corpo prontos, no mesmo jeito da biblioteca (B.*): x, y, s (tamanho), rot (giro), seed (o tremido) e k (0 a 1,
// entra crescendo). Saem nos seis estilos e só nas cores da paleta e de gente. Candidatos a entrar na biblioteca do motor.
//   C.pele(ctx, { y0, y1 })                     a pele em corte (faixa cor de pele, com a camada de cima)
//   C.musculo(ctx, { y0, y1, fibras })          o músculo em corte: fibras compridas, deitadas
//   C.vaso(ctx, { de, ate, larg, t })            um vaso com o sangue correndo (hemácias que andam com t)
//   C.plasma(ctx, { papel })                     o fundo do nível das células: líquido claro com pontinhos
//   C.celula(ctx, { x, y, r, tipo })            tipo: 'B' (linfócito B, com os receptores em Y), 'T' (linfócito T),
//                                                'memoria' (pequena, com a marca), 'plasmocito' (grande, núcleo de lado),
//                                                'defesa' (genérica), 'hemacia'
//   C.microbio(ctx, { x, y, r, fraco, forma })  o micróbio com as espículas; fraco: tracejado e pálido (enfraquecido ou
//                                                morto, o da vacina); forma: 'redondo' ou 'quadrado' (outro micróbio)
//   C.anticorpo(ctx, { x, y, s, rot, ponta })   a proteína em Y; as pontas dos braços (as regiões que se ligam) na cor
//                                                ponta. Devolve { pontas: [[x, y], [x, y]], base }
// Todos devolvem pontos úteis (centro, pontas). Sem texto: palavra vem do textos.txt, pela peça.
(function () {
  const U = globalThis.U, E = globalThis.ESTILOS;
  if (!E) return;
  const so = (o) => Object.assign({ sombra: false, hachura: false }, o);
  function em(ctx, o, fn) {
    const s = (o.s ?? 1) * (o.k ?? 1);
    ctx.save(); ctx.translate(o.x, o.y); if (o.rot) ctx.rotate(o.rot); ctx.scale(s, s);
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    try { return fn(); } finally { ctx.restore(); }
  }
  const tela = (o, lx, ly) => { const s = (o.s ?? 1) * (o.k ?? 1), c = Math.cos(o.rot || 0), sn = Math.sin(o.rot || 0); return [o.x + (lx * c - ly * sn) * s, o.y + (lx * sn + ly * c) * s]; };
  const naoSome = (...ps) => ps.find((p) => E.cor(p) !== E.cor('fundo')) || ps[ps.length - 1];
  // o fundo do nível que o último fundo do corpo pintou (pele, músculo, plasma): a cor que não some é contra ele
  let LOCAL = null;
  const naoSomeL = (...ps) => ps.find((p) => E.cor(p) !== E.cor(LOCAL || 'fundo')) || ps[ps.length - 1];
  const ruido = (i, s = 1) => Math.sin(i * 12.9898 + s * 78.233) * 0.5 + 0.5; // pseudo-acaso fixo (sem Math.random)

  function pele(ctx, o = {}) {
    const y0 = o.y0 ?? 330, y1 = o.y1 ?? 450, seed = o.seed ?? 700;
    E.ret(ctx, -300, y0 - 400, 1680, y1 - y0 + 400, so({ papel: 'pele', contorno: false, r: 0, seed }));
    E.ret(ctx, -300, y0 - 400, 1680, 400 + (y1 - y0) * 0.28, so({ papel: 'peleClara', contorno: false, r: 0, seed: seed + 1 }));
    E.linha(ctx, [[-300, y1], [1380, y1]], { lw: 5, seed: seed + 2 });
    E.linha(ctx, [[-300, y0 + (y1 - y0) * 0.28], [1380, y0 + (y1 - y0) * 0.28]], { lw: 3, seed: seed + 3 });
    return { y0, y1 };
  }
  function musculo(ctx, o = {}) {
    const y0 = o.y0 ?? 450, y1 = o.y1 ?? 1400, n = o.fibras ?? 8, seed = o.seed ?? 720;
    E.ret(ctx, -300, y0, 1680, y1 - y0 + 300, so({ papel: 'peleClara', contorno: false, r: 0, seed }));
    LOCAL = 'peleClara';
    const h = (y1 - y0) / n;
    for (let i = 0; i < n; i++) {
      const y = y0 + i * h + 8, off = (i % 2) * 140 - 120;
      for (let j = 0; j < 4; j++) {
        const x = off + j * 420;
        E.ret(ctx, x, y, 390, h - 16, so({ papel: o.fibra || 'pele', r: (h - 16) / 2, lw: 3, seed: seed + i * 7 + j }));
        E.linha(ctx, [[x + 40, y + (h - 16) * 0.5], [x + 350, y + (h - 16) * 0.5 + 4]], { lw: 2, seed: seed + 100 + i * 7 + j });
      }
    }
    return { y0, y1 };
  }
  function vaso(ctx, o = {}) {
    const [x0, y0] = o.de || [-100, 1000], [x1, y1] = o.ate || [1180, 800], larg = o.larg ?? 120, t = o.t || 0, seed = o.seed ?? 760;
    const ang = Math.atan2(y1 - y0, x1 - x0), cmp = Math.hypot(x1 - x0, y1 - y0);
    ctx.save(); ctx.translate(x0, y0); ctx.rotate(ang);
    E.ret(ctx, -40, -larg / 2, cmp + 80, larg, so({ papel: 'papel', r: larg / 2, lw: 6, seed }));
    E.ret(ctx, -40, -larg / 2 + 12, cmp + 80, larg - 24, so({ papel: 'peleClara', contorno: false, r: larg / 2 - 12, seed: seed + 1 }));
    if (o.hemacias !== false) {
      for (let i = 0; i < Math.ceil(cmp / 110) + 2; i++) {
        const x = ((i * 110 + t * 90) % (cmp + 160)) - 60, y = (ruido(i, seed) - 0.5) * (larg - 70);
        celula(ctx, { x, y, r: 26, tipo: 'hemacia', rot: i * 0.7, seed: seed + 10 + i });
      }
    }
    ctx.restore();
    return { de: [x0, y0], ate: [x1, y1], ponto: (u) => [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u] };
  }
  function plasma(ctx, o = {}) {
    const seed = o.seed ?? 780;
    LOCAL = o.papel || naoSome('apoio', 'superficie');
    E.ret(ctx, -300, -300, 1680, 2520, so({ papel: LOCAL, contorno: false, r: 0, alpha: o.alpha ?? 1, seed }));
    for (let i = 0; i < 46; i++) {
      const x = 40 + ruido(i, 3) * 920, y = 320 + ruido(i, 7) * 880;
      E.circulo(ctx, x, y, 5 + ruido(i, 11) * 6, so({ papel: 'superficie', lw: 2, seed: seed + i, alpha: 0.7 }));
    }
  }
  // as hastes do micróbio: um raio com a bolinha na ponta (forma quadrada: a ponta é um quadradinho)
  function microbio(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 760, r: 40, fraco: false, forma: 'redondo', papel: null, espinhos: 10, seed: 800 }, o);
    const papel = o.papel || (o.fraco ? naoSomeL('apoio', 'superficie', 'destaque') : 'alerta'), r = o.r;
    const pontas = [];
    em(ctx, o, () => {
      ctx.save(); if (o.fraco) ctx.globalAlpha *= 0.85;
      for (let i = 0; i < o.espinhos; i++) {
        const a = (i / o.espinhos) * Math.PI * 2 + 0.2, c = Math.cos(a), s = Math.sin(a);
        E.linha(ctx, [[c * r * 0.9, s * r * 0.9], [c * r * 1.38, s * r * 1.38]], { lw: Math.max(2, r * 0.09), seed: o.seed + i, tracejado: !!o.fraco && r > 30 });
        if (o.forma === 'quadrado') E.ret(ctx, c * r * 1.45 - r * 0.12, s * r * 1.45 - r * 0.12, r * 0.24, r * 0.24, so({ papel, r: 2, lw: 2, seed: o.seed + 20 + i }));
        else E.circulo(ctx, c * r * 1.45, s * r * 1.45, r * 0.13, so({ papel, lw: 2, seed: o.seed + 20 + i }));
        pontas.push([c * r * 1.45, s * r * 1.45]);
      }
      if (o.forma === 'quadrado') E.ret(ctx, -r, -r, 2 * r, 2 * r, so({ papel, r: r * 0.35, lw: Math.max(3, r * 0.08), seed: o.seed }));
      else E.circulo(ctx, 0, 0, r, so({ papel, lw: Math.max(3, r * 0.08), seed: o.seed }));
      // por dentro: o material do micróbio (enfraquecido: o traço partido)
      E.linha(ctx, [[-r * 0.45, -r * 0.1], [-r * 0.1, r * 0.25], [r * 0.3, -r * 0.05], [r * 0.5, r * 0.3]], { lw: Math.max(2, r * 0.07), seed: o.seed + 40, tracejado: !!o.fraco });
      ctx.restore();
    });
    return { centro: [o.x, o.y], pontas: pontas.map(([a, b]) => tela(o, a, b)) };
  }
  function anticorpo(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 760, s: 1, rot: 0, papel: 'apoioEscuro', ponta: 'destaque', lw: 15, seed: 840 }, o);
    // em pé, a base embaixo (0, 70); os braços abrem para cima e as pontas ficam em (±52, -62)
    em(ctx, o, () => {
      const lw = o.lw, cor = o.papel;
      E.linha(ctx, [[0, 70], [0, -4]], { papel: cor, lw, seed: o.seed });
      E.linha(ctx, [[0, -4], [-46, -54]], { papel: cor, lw, seed: o.seed + 1 });
      E.linha(ctx, [[0, -4], [46, -54]], { papel: cor, lw, seed: o.seed + 2 });
      for (const sd of [-1, 1]) E.circulo(ctx, sd * 52, -62, lw * 0.75, so({ papel: o.ponta, lw: 3, seed: o.seed + 3 + sd }));
    });
    return { pontas: [tela(o, -52, -62), tela(o, 52, -62)], base: tela(o, 0, 70) };
  }
  function celula(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 760, r: 110, tipo: 'defesa', seed: 900 }, o);
    const r = o.r, t = o.tipo;
    em(ctx, o, () => {
      if (t === 'hemacia') {
        E.circulo(ctx, 0, 0, r, so({ papel: naoSome('alerta', 'coral'), lw: 2.5, seed: o.seed }));
        E.circulo(ctx, 0, 0, r * 0.45, so({ papel: 'peleClara', contorno: false, seed: o.seed + 1 }));
        return;
      }
      const plas = t === 'plasmocito';
      // os receptores em Y do linfócito B (é o mesmo encaixe do anticorpo), as bolinhas do T
      if (t === 'B' || t === 'memoria') for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        anticorpo(ctx, { x: Math.cos(a) * r * 1.02, y: Math.sin(a) * r * 1.02, s: r / 330, rot: a + Math.PI / 2, lw: 12, seed: o.seed + 50 + i });
      }
      if (t === 'T') for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; E.circulo(ctx, Math.cos(a) * r * 1.06, Math.sin(a) * r * 1.06, r * 0.07, so({ papel: 'apoioEscuro', lw: 2, seed: o.seed + 50 + i })); }
      if (plas) E.circulo(ctx, 0, 0, r * 1.22, so({ papel: 'superficie', lw: 4, seed: o.seed, ry: r * 1.0 }));
      else E.circulo(ctx, 0, 0, r, so({ papel: 'superficie', lw: 4, seed: o.seed }));
      // o núcleo: grande no linfócito, de lado no plasmócito; a fábrica do plasmócito são as linhas em volta dele
      const nx = plas ? -r * 0.55 : 0, nr = plas ? r * 0.42 : r * 0.68;
      E.circulo(ctx, nx, 0, nr, so({ papel: t === 'T' ? 'apoio' : 'apoioEscuro', lw: 3, seed: o.seed + 1, alpha: 0.9 }));
      if (plas) for (let i = 0; i < 4; i++) E.linha(ctx, [[r * 0.05, -r * 0.5 + i * r * 0.33], [r * 0.45, -r * 0.42 + i * r * 0.3], [r * 0.85, -r * 0.5 + i * r * 0.33]], { lw: 3, seed: o.seed + 10 + i });
      if (t === 'memoria') E.poligono(ctx, [[r * 0.55, -r * 1.05], [r * 0.95, -r * 1.05], [r * 0.95, -r * 0.35], [r * 0.75, -r * 0.55], [r * 0.55, -r * 0.35]], so({ papel: 'destaque', lw: 3, seed: o.seed + 30 }));
    });
    return { centro: [o.x, o.y], r: r * (o.s ?? 1) * (o.k ?? 1) };
  }

  // local(papel): diga qual é o fundo do nível quando ele não vem do corpo (sala, rua): a cor que não some é contra ele
  const local = (p) => { LOCAL = p || null; };
  globalThis.CORPO = { pele, musculo, vaso, plasma, celula, microbio, anticorpo, local, em, tela, ruido };
})();
