// PRESEME · carrossel · mapa e dado · OS DESENHOS DA PEÇA (TROQUE: é o que muda de uma doença para outra).
// Peça: oncocercose, a cegueira dos rios. Cada desenho é PRESEME.DESENHO[nome] = (ctx, caixa, lam, ...mais), e o
// score.js diz qual vai em qual lâmina (desenho:). O molde põe o texto e entrega a caixa livre { x, y, w, h }. Toda
// palavra que aparece no desenho vem do textos.js (as palavras D, que o molde passa em "mais"). O mapa é o do tipo
// (DESENHO.mapa, em film-2-moldes.js), ajustado pelo SCORE.MAPA; aqui ficam o vetor, os sinais e a prevenção.
// Cuidado da peça: explicar pelo inseto e pelo lugar, nunca pelas pessoas; o braço dos desenhos é genérico. Desenho parado.
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, TX = globalThis.TEXTOS;
  const DS = P.DESENHO;
  const { RAD, liso, pilulaEm } = P.KIT;

  // ---------- por que é daqui: o borrachudo, o rio e o ciclo entre dois braços ----------
  function inseto(ctx, x, y, s) { // o borrachudo de lado, virado para a esquerda; x, y é o meio do corpo
    ctx.save(); ctx.translate(x + 40 * s, y - 40 * s); ctx.rotate(-0.32);
    E.circulo(ctx, 70 * s, 0, 130 * s, Object.assign({ ry: 36 * s, papel: 'superficie', seed: 520, alpha: 0.9 }, liso));
    ctx.restore();
    for (let i = 0; i < 3; i++) { // as pernas
      const px = x - 30 * s + i * 34 * s;
      E.linha(ctx, [[px, y + 30 * s], [px - 22 * s + i * 14 * s, y + 80 * s], [px - 40 * s + i * 30 * s, y + 118 * s]], { papel: 'noite', lw: 6, seed: 521 + i });
    }
    E.circulo(ctx, x + 96 * s, y + 18 * s, 80 * s, Object.assign({ ry: 46 * s, papel: 'floresta', seed: 525 }, liso)); // o abdome
    for (let i = 0; i < 3; i++) E.linha(ctx, [[x + 62 * s + i * 30 * s, y - 20 * s], [x + 62 * s + i * 30 * s, y + 56 * s]], { papel: 'apoioEscuro', lw: 4, seed: 526 + i });
    E.circulo(ctx, x, y, 66 * s, Object.assign({ ry: 58 * s, papel: 'noite', seed: 530 }, liso)); // o tórax, corcunda
    E.circulo(ctx, x - 74 * s, y + 18 * s, 34 * s, Object.assign({ papel: 'noite', seed: 531 }, liso)); // a cabeça
    E.circulo(ctx, x - 86 * s, y + 10 * s, 15 * s, Object.assign({ papel: 'apoioEscuro', contorno: false, seed: 532 }, liso)); // o olho
    E.linha(ctx, [[x - 100 * s, y + 4 * s], [x - 128 * s, y - 14 * s]], { papel: 'noite', lw: 5, seed: 533 }); // a antena
    E.linha(ctx, [[x - 92 * s, y + 46 * s], [x - 104 * s, y + 70 * s]], { papel: 'noite', lw: 6, seed: 534 }); // a boca que pica
    ctx.save(); ctx.translate(x + 30 * s, y - 50 * s); ctx.rotate(-0.55);
    E.circulo(ctx, 70 * s, 0, 120 * s, Object.assign({ ry: 32 * s, papel: 'superficie', seed: 535, alpha: 0.82 }, liso));
    ctx.restore();
  }
  function braco(ctx, x, y, lado, s) { // o antebraço genérico: lado -1 vem da esquerda, 1 da direita; x, y é a mão
    const w = 230 * s, h = 64 * s, x0 = lado < 0 ? x - w : x;
    E.ret(ctx, x0, y - h / 2, w, h, Object.assign({ papel: 'pele', r: h / 2, seed: 540 + lado }, liso));
    E.circulo(ctx, x, y, 46 * s, Object.assign({ papel: 'pele', seed: 542 + lado }, liso));
  }
  DS.borrachudo = (ctx, cx, lam, marcas = []) => {
    const [kInseto, kRio] = marcas;
    const hr = Math.min(130, cx.h * 0.22), yr = cx.y + cx.h - hr;
    const onda = []; for (let i = 0; i <= 40; i++) onda.push([cx.x - 10 + ((cx.w + 20) * i) / 40, yr + Math.sin((i / 40) * Math.PI * 3) * 16]);
    E.poligono(ctx, onda.concat([[cx.x + cx.w + 10, cx.y + cx.h], [cx.x - 10, cx.y + cx.h]]), Object.assign({ papel: 'apoioEscuro', contorno: false, seed: 550 }, liso));
    for (let j = 0; j < 3; j++) E.linha(ctx, [[cx.x + 60 + j * 300, yr + hr * 0.55 + (j % 2) * 16], [cx.x + 170 + j * 300, yr + hr * 0.55 + (j % 2) * 16]], { papel: 'apoio', lw: 5, seed: 551 + j });
    const s = Math.min(1.15, (cx.h - hr - 40) / 330), ix = cx.x + cx.w * 0.5, iy = cx.y + (cx.h - hr) * 0.42;
    const yb = yr - 70 * s;
    braco(ctx, cx.x + 200 * s, yb, -1, s);
    braco(ctx, cx.x + cx.w - 200 * s, yb, 1, s);
    // o verme no sangue de quem já tem: três riscos ondulados na mão da esquerda
    for (let j = 0; j < 3; j++) { const vx = cx.x + 120 * s + j * 34 * s, vy = yb - 8 * s + (j % 2) * 14 * s; E.linha(ctx, [[vx, vy], [vx + 8 * s, vy - 6 * s], [vx + 16 * s, vy], [vx + 24 * s, vy - 6 * s]], { papel: 'noite', lw: 4, seed: 555 + j }); }
    E.seta(ctx, [cx.x + 220 * s, yb - 60 * s], [ix - 150 * s, iy + 10 * s], { lw: 7, curva: -0.3, seed: 560 });
    E.seta(ctx, [ix + 170 * s, iy + 30 * s], [cx.x + cx.w - 220 * s, yb - 60 * s], { lw: 7, curva: -0.3, seed: 561 });
    inseto(ctx, ix, iy, s);
    if (TX[kInseto]) pilulaEm(ctx, TX[kInseto], ix, cx.y + 24);
    if (TX[kRio]) pilulaEm(ctx, TX[kRio], cx.x + cx.w - 110, yr + hr * 0.55, { fundo: 'superficie', cor: 'texto' });
  };

  // ---------- o que faz: a pele e os olhos ----------
  const SINAIS = [
    (ctx, cx) => { // a pele: as manchas claras, os nódulos (caroços) e os riscos da coceira
      const w = Math.min(cx.w, 360), h = Math.min(cx.h, 300), x = cx.x + (cx.w - w) / 2, y = cx.y + (cx.h - h) / 2;
      E.ret(ctx, x, y, w, h, Object.assign({ papel: 'pele', r: 40, seed: 570 }, liso));
      [[0.3, 0.32, 44], [0.68, 0.26, 30], [0.48, 0.62, 36], [0.2, 0.74, 24]].forEach(([u, v, r], i) => E.circulo(ctx, x + w * u, y + h * v, r, Object.assign({ papel: 'superficie', contorno: false, seed: 571 + i, alpha: 0.75 }, liso)));
      [[0.8, 0.66, 30], [0.62, 0.86, 22]].forEach(([u, v, r], i) => {
        E.circulo(ctx, x + w * u + 7, y + h * v + 8, r, Object.assign({ papel: 'peleEscura', contorno: false, seed: 576 + i }, liso));
        E.circulo(ctx, x + w * u, y + h * v, r, Object.assign({ papel: 'pele', contorno: false, seed: 578 + i }, liso));
      });
      for (let i = 0; i < 3; i++) E.linha(ctx, [[x + w * 0.62 + i * 22, y + h * 0.06], [x + w * 0.54 + i * 22, y + h * 0.18]], { papel: 'alerta', lw: 6, seed: 580 + i });
    },
    (ctx, cx) => { // os olhos: o olho com a metade da visão apagada
      const x = cx.x + cx.w / 2, y = cx.y + cx.h / 2, a = Math.min(cx.w / 2 - 20, 160), b = a * 0.56;
      E.circulo(ctx, x, y, a + 18, Object.assign({ papel: 'apoio', contorno: false, seed: 585 }, liso));
      const olho = []; for (let i = 0; i <= 20; i++) { const u = i / 20; olho.push([x - a + 2 * a * u, y - b * Math.sin(Math.PI * u)]); }
      for (let i = 20; i >= 0; i--) { const u = i / 20; olho.push([x - a + 2 * a * u, y + b * Math.sin(Math.PI * u)]); }
      E.poligono(ctx, olho, Object.assign({ papel: 'superficie', seed: 586 }, liso));
      E.circulo(ctx, x, y, b * 0.82, Object.assign({ papel: 'apoioEscuro', contorno: false, seed: 587 }, liso));
      E.circulo(ctx, x, y, b * 0.36, Object.assign({ papel: 'noite', contorno: false, seed: 588 }, liso));
      ctx.save(); ctx.beginPath(); olho.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.closePath(); ctx.clip();
      E.ret(ctx, x, y - b - 4, a + 4, 2 * b + 8, Object.assign({ papel: 'noite', r: 0, contorno: false, seed: 589, alpha: 0.62 }, liso));
      ctx.restore();
    },
  ];
  DS.sinal = (ctx, cx, lam, i) => { const f = SINAIS[i]; if (f) f(ctx, cx); };

  // ---------- prevenção: a seringa riscada, o calendário das duas rodadas e a rosca da cobertura ----------
  const PREV = [
    (ctx, x, y, s) => {
      E.linha(ctx, [[x - 84 * s, y], [x - 140 * s, y]], { papel: 'noite', lw: 5, seed: 600 });
      E.ret(ctx, x - 90 * s, y - 24 * s, 140 * s, 48 * s, Object.assign({ papel: 'apoio', r: 8 * s, seed: 601 }, liso));
      for (let i = 1; i < 4; i++) E.linha(ctx, [[x - 90 * s + i * 32 * s, y - 24 * s], [x - 90 * s + i * 32 * s, y - 6 * s]], { papel: 'apoioEscuro', lw: 3, seed: 602 + i });
      E.ret(ctx, x + 50 * s, y - 8 * s, 48 * s, 16 * s, Object.assign({ papel: 'apoioEscuro', r: 4 * s, seed: 606 }, liso));
      E.ret(ctx, x + 94 * s, y - 28 * s, 14 * s, 56 * s, Object.assign({ papel: 'apoioEscuro', r: 4 * s, seed: 607 }, liso));
      E.linha(ctx, [[x - 110 * s, y - 78 * s], [x + 110 * s, y + 78 * s]], { papel: 'alerta', lw: 14, seed: 608 });
      E.linha(ctx, [[x + 110 * s, y - 78 * s], [x - 110 * s, y + 78 * s]], { papel: 'alerta', lw: 14, seed: 609 });
    },
    (ctx, x, y, s) => {
      const w = 220 * s, h = 196 * s, x0 = x - w / 2, y0 = y - h / 2;
      E.ret(ctx, x0, y0, w, h, Object.assign({ papel: 'apoio', r: 16 * s, seed: 610 }, liso));
      E.ret(ctx, x0, y0, w, 42 * s, Object.assign({ papel: 'apoioEscuro', r: 16 * s, seed: 611 }, liso));
      for (let i = 0; i < 12; i++) {
        const c = i % 4, l = Math.floor(i / 4), marcado = i === 0 || i === 6;
        E.ret(ctx, x0 + 16 * s + c * 50 * s, y0 + 56 * s + l * 46 * s, 40 * s, 34 * s, Object.assign({ papel: marcado ? 'floresta' : 'superficie', r: 6 * s, seed: 612 + i }, liso));
      }
    },
    (ctx, x, y, s) => {
      const r = 92 * s;
      E.circulo(ctx, x, y, r, Object.assign({ papel: 'apoio', contorno: false, seed: 630 }, liso));
      const pts = [[x, y]]; for (let i = 0; i <= 40; i++) { const a = (-90 + (360 * 0.85 * i) / 40) * RAD; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
      E.poligono(ctx, pts, Object.assign({ papel: 'apoioEscuro', contorno: false, seed: 631 }, liso));
      E.circulo(ctx, x, y, r * 0.56, Object.assign({ papel: 'superficie', contorno: false, seed: 632 }, liso));
    },
  ];
  DS.prevencao = (ctx, cx, lam, i) => { const f = PREV[i]; if (f) f(ctx, cx.x + cx.w / 2, cx.y + cx.h / 2, Math.min(cx.w / 270, cx.h / 200)); };
})();
