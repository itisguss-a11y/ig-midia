// PRESEME · carrossel FLUXOGRAMA · desenho 3 · os desenhos do assunto (exemplo: mordida de cachorro e a raiva).
// TROQUE na peça nova: só os desenhos que o assunto pede. PRESEME.DESENHO[nome] = (ctx, caixa, lam) desenha dentro da
// caixa { x, y, w, h }. Ícone da biblioteca não precisa de função: no score.js, icone: 'B.seringa' (B.visto, B.celular...).
// Cão, gato e morcego são novos: candidatos à biblioteca (motor/estilos/biblioteca.js).
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, B = globalThis.BIB;
  // desenha num quadro de u × u unidades, com o centro no meio da caixa (o desenho cresce com a caixa)
  const em = (ctx, cx, u, fn, dx = 0, dy = 0) => {
    const s = Math.min(cx.w, cx.h) / u;
    ctx.save(); ctx.translate(cx.x + cx.w / 2 + dx * s, cx.y + cx.h / 2 + dy * s); ctx.scale(s, s); fn(s); ctx.restore();
  };
  const so = (o) => Object.assign({ sombra: false }, o);

  // o cachorro sentado, de lado, olhando para a direita (quadro de 420: o chão em y 170)
  function cachorro(ctx, { espelho = false, seed = 300 } = {}) {
    ctx.save(); if (espelho) ctx.scale(-1, 1);
    E.circulo(ctx, 0, 172, 150, so({ ry: 12, papel: 'sombra', alpha: 0.35, contorno: false, hachura: false, seed }));
    E.linha(ctx, [[-110, 120], [-165, 80], [-185, 20]], { papel: 'apoioEscuro', lw: 18, seed: seed + 1 });
    E.circulo(ctx, -55, 105, 88, so({ ry: 66, papel: 'papel', seed: seed + 2 }));
    E.circulo(ctx, 15, 40, 82, so({ ry: 118, papel: 'papel', seed: seed + 3 }));
    E.circulo(ctx, -18, 30, 34, so({ ry: 28, papel: 'apoioEscuro', seed: seed + 4 }));
    for (const x of [22, 62]) E.ret(ctx, x, 70, 30, 102, so({ papel: 'papel', r: 12, seed: seed + 5 + x }));
    E.ret(ctx, -100, 150, 70, 24, so({ papel: 'papel', r: 12, seed: seed + 6 }));
    E.ret(ctx, 2, -42, 104, 22, so({ papel: 'alerta', r: 10, seed: seed + 7 }));
    E.circulo(ctx, 62, -98, 68, so({ papel: 'papel', seed: seed + 8 }));
    E.circulo(ctx, 128, -76, 46, so({ ry: 32, papel: 'papel', seed: seed + 9 }));
    E.poligono(ctx, [[30, -158], [-12, -130], [-2, -48], [36, -70]], so({ papel: 'apoioEscuro', seed: seed + 10 }));
    E.circulo(ctx, 168, -88, 13, so({ papel: 'tinta', seed: seed + 11 }));
    E.circulo(ctx, 92, -114, 9, so({ papel: 'tinta', seed: seed + 12 }));
    E.linha(ctx, [[150, -58], [128, -52], [110, -60]], { papel: 'tinta', lw: 5, seed: seed + 13 });
    ctx.restore();
  }
  // o gato sentado, de frente (quadro de 320: o chão em y 130)
  function gato(ctx, { seed = 340 } = {}) {
    E.circulo(ctx, 0, 132, 110, so({ ry: 10, papel: 'sombra', alpha: 0.35, contorno: false, hachura: false, seed }));
    E.linha(ctx, [[60, 120], [118, 96], [126, 40], [104, 10]], { papel: 'apoioEscuro', lw: 16, seed: seed + 1 });
    E.circulo(ctx, 0, 60, 74, so({ ry: 76, papel: 'apoioEscuro', seed: seed + 2 }));
    E.circulo(ctx, 0, 72, 36, so({ ry: 46, papel: 'papel', seed: seed + 3 }));
    for (const s of [-1, 1]) E.poligono(ctx, [[s * 20, -112], [s * 62, -150], [s * 58, -86]], so({ papel: 'apoioEscuro', seed: seed + 4 + s }));
    E.circulo(ctx, 0, -66, 64, so({ ry: 56, papel: 'apoioEscuro', seed: seed + 6 }));
    for (const s of [-1, 1]) E.circulo(ctx, s * 24, -74, 10, so({ papel: 'destaque', seed: seed + 7 + s }));
    E.poligono(ctx, [[-8, -50], [8, -50], [0, -40]], so({ papel: 'alerta', seed: seed + 9 }));
    for (const s of [-1, 1]) for (const d of [-8, 6]) E.linha(ctx, [[s * 18, -44 + d / 2], [s * 70, -50 + d]], { papel: 'papel', lw: 3, seed: seed + 10 + d + s });
  }
  // o morcego de asas abertas (quadro de 360)
  function morcego(ctx, { seed = 380 } = {}) {
    for (const s of [-1, 1]) {
      const asa = [[s * 18, -30], [s * 70, -78], [s * 150, -70], [s * 172, -30], [s * 150, 10], [s * 128, -8], [s * 104, 22], [s * 80, 0], [s * 56, 30], [s * 34, 10]];
      E.poligono(ctx, asa, so({ papel: 'tinta', seed: seed + 1 + s }));
    }
    E.circulo(ctx, 0, 0, 40, so({ ry: 58, papel: 'tinta', seed: seed + 3 }));
    for (const s of [-1, 1]) E.poligono(ctx, [[s * 8, -66], [s * 30, -100], [s * 32, -56]], so({ papel: 'tinta', seed: seed + 4 + s }));
    E.circulo(ctx, 0, -56, 32, so({ papel: 'tinta', seed: seed + 6 }));
    for (const s of [-1, 1]) E.circulo(ctx, s * 12, -60, 7, so({ papel: 'destaque', contorno: false, seed: seed + 7 + s }));
  }
  // a torneira aberta, a água e o sabão com espuma (quadro de 360)
  function torneira(ctx, { seed = 420 } = {}) {
    E.ret(ctx, -170, -150, 150, 34, so({ papel: 'superficie', r: 10, seed }));
    E.ret(ctx, -40, -150, 34, 80, so({ papel: 'superficie', r: 10, seed: seed + 1 }));
    E.ret(ctx, -110, -186, 70, 26, so({ papel: 'apoioEscuro', r: 10, seed: seed + 2 }));
    for (let i = 0; i < 5; i++) B.gota(ctx, { x: -24 + (i % 2) * 8, y: -40 + i * 42, r: 13 - i, papel: 'apoioEscuro' });
    E.ret(ctx, 30, 70, 130, 70, so({ papel: 'destaque', r: 20, seed: seed + 3 }));
    for (const [x, y, r] of [[52, 56, 18], [88, 46, 24], [128, 58, 16], [150, 40, 12]]) E.circulo(ctx, x, y, r, so({ papel: 'superficie', seed: seed + 4 + x }));
  }

  P.DESENHO.capa = (ctx, cx) => em(ctx, cx, 440, () => cachorro(ctx, { seed: 301 }), 0, 10);
  P.DESENHO.morcego = (ctx, cx) => em(ctx, cx, 380, () => morcego(ctx));
  P.DESENHO.caoEGato = (ctx, cx) => em(ctx, cx, 430, () => { ctx.save(); ctx.translate(-80, 0); ctx.scale(0.8, 0.8); cachorro(ctx, { seed: 311 }); ctx.restore(); ctx.save(); ctx.translate(150, 40); ctx.scale(0.75, 0.75); gato(ctx); ctx.restore(); });
  P.DESENHO.dezDias = (ctx, cx) => B.calendario(ctx, { x: cx.x + cx.w / 2, y: cx.y + cx.h / 2 + 6, s: Math.min(cx.w, cx.h) / 340, marcados: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] });
  // o passo de lavar: a torneira e o sabão, a seta e o posto
  P.DESENHO.lavar = (ctx, cx) => {
    const u = { x: cx.x, y: cx.y, w: cx.w * 0.55, h: cx.h };
    em(ctx, u, 400, () => torneira(ctx));
    const yy = cx.y + cx.h / 2, s = Math.min(cx.h / 300, 1.1);
    E.seta(ctx, [cx.x + cx.w * 0.52, yy], [cx.x + cx.w * 0.7, yy], { curva: 0, lw: 6, cabeca: 26, seed: 431 });
    B.ubsIcone(ctx, { x: cx.x + cx.w * 0.84, y: yy, s });
  };
  // o passo de observar: o calendário com os 10 dias marcados e o cão em casa
  P.DESENHO.observar = (ctx, cx) => {
    B.calendario(ctx, { x: cx.x + cx.w * 0.3, y: cx.y + cx.h / 2, s: Math.min(cx.h / 330, 1.25), marcados: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] });
    em(ctx, { x: cx.x + cx.w * 0.55, y: cx.y, w: cx.w * 0.45, h: cx.h }, 440, () => cachorro(ctx, { seed: 321 }));
  };
  // o gancho: Roraima no mapa (B.mapaRR, com o contorno do IBGE)
  P.DESENHO.mapa = (ctx, cx) => B.mapaRR(ctx, { x: cx.x, y: cx.y, w: cx.w, h: cx.h, base: 'apoioEscuro' });
  // o terceiro cartão de quem faz o quê, que nesta peça é a prevenção (o cão e a vacina); você e a equipe são do tipo
  P.DESENHO.prevencao = (ctx, cx) => {
    em(ctx, { x: cx.x - cx.w * 0.1, y: cx.y + cx.h * 0.1, w: cx.w * 0.9, h: cx.h * 0.9 }, 440, () => cachorro(ctx, { seed: 331 }));
    B.seringa(ctx, { x: cx.x + cx.w * 0.72, y: cx.y + cx.h * 0.2, s: cx.h / 520, rot: 0.5 });
  };
})();
