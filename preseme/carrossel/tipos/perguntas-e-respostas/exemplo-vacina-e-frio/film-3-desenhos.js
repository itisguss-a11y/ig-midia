// PRESEME · carrossel · perguntas e respostas · OS DESENHOS DA PEÇA: a vacina e o frio (texto de exemplo escrito pelo
// Opus). O frasco de tampa Coral é o mesmo em toda lâmina: no sol da capa, perdendo força a cada saída da faixa, na
// caixa térmica do caminho, na prateleira da câmara e no monitor do fim.
// Cada desenho é PRESEME.DESENHO[nome] = (ctx, caixa, lam, palavras). Toda palavra vem do textos.js (as palavras D da
// lâmina). As peças vêm do kit do tipo (PRESEME.KIT, em film-2-moldes.js). Desenho parado.
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, TX = globalThis.TEXTOS;
  const DS = P.DESENHO;
  const { RAD, liso, cabe, frasco, termometro, certo, errado } = P.KIT;

  // ---------- peças do assunto ----------
  function onda(ctx, x0, x1, y, seed) { // o calor no ar
    const pts = []; for (let x = x0; x <= x1; x += 8) pts.push([x, y + Math.sin((x - x0) / 18) * 9]);
    E.linha(ctx, pts, { papel: 'alerta', lw: 6, seed });
  }
  function floco(ctx, x, y, r, seed = 300) {
    for (let i = 0; i < 3; i++) { const a = i * 60 * RAD; E.linha(ctx, [[x - Math.cos(a) * r, y - Math.sin(a) * r], [x + Math.cos(a) * r, y + Math.sin(a) * r]], { lw: 4, papel: 'apoioEscuro', seed: seed + i }); }
  }
  function solzinho(ctx, x, y, r, seed) {
    for (let i = 0; i < 8; i++) { const a = i * 45 * RAD; E.linha(ctx, [[x + Math.cos(a) * r * 1.35, y + Math.sin(a) * r * 1.35], [x + Math.cos(a) * r * 1.9, y + Math.sin(a) * r * 1.9]], { lw: 4, seed: seed + i }); }
    E.circulo(ctx, x, y, r, Object.assign({ papel: 'destaque', seed }, liso));
  }
  // o depósito (central nacional, central do estado): o galpão de telhado em duas águas, com a porta larga
  function galpao(ctx, x, y, w, h, seed) {
    E.poligono(ctx, [[x - w / 2 - 10, y - h * 0.62], [x, y - h], [x + w / 2 + 10, y - h * 0.62]], Object.assign({ papel: 'apoioEscuro', seed }, liso));
    E.ret(ctx, x - w / 2, y - h * 0.64, w, h * 0.64, { papel: 'superficie', r: 4, seed: seed + 1 });
    E.ret(ctx, x - w * 0.22, y - h * 0.4, w * 0.44, h * 0.4, Object.assign({ papel: 'apoio', r: 3, seed: seed + 2 }, liso));
    floco(ctx, x + w * 0.34, y - h * 0.44, 11, seed + 3);
  }
  function predinho(ctx, x, y, w, h, seed, cruz) { // o município e a sala: prédio baixo; a sala leva a cruz
    E.ret(ctx, x - w / 2, y - h, w, h, { papel: 'superficie', r: 4, seed });
    E.ret(ctx, x - w / 2 - 8, y - h - 14, w + 16, 20, Object.assign({ papel: 'apoioEscuro', r: 4, seed: seed + 1 }, liso));
    E.ret(ctx, x - 16, y - h * 0.5, 32, h * 0.5, Object.assign({ papel: 'tinta', r: 3, seed: seed + 2 }, liso));
    if (cruz) { const t = 7, r = 18, cx = x + w * 0.27, cy = y - h * 0.66; E.poligono(ctx, [[cx - t, cy - r], [cx + t, cy - r], [cx + t, cy - t], [cx + r, cy - t], [cx + r, cy + t], [cx + t, cy + t], [cx + t, cy + r], [cx - t, cy + r], [cx - t, cy + t], [cx - r, cy + t], [cx - r, cy - t], [cx - t, cy - t]], Object.assign({ papel: 'alerta', seed: seed + 3 }, liso)); }
    else for (const sd of [-1, 1]) E.ret(ctx, x + sd * w * 0.3 - 12, y - h * 0.78, 24, 22, Object.assign({ papel: 'apoio', r: 3, seed: seed + 4 + sd }, liso));
  }
  function aviao(ctx, x, y, s, seed) {
    E.poligono(ctx, [[x - 70 * s, y - 6 * s], [x + 62 * s, y - 8 * s], [x + 80 * s, y], [x + 62 * s, y + 8 * s], [x - 70 * s, y + 6 * s]], Object.assign({ papel: 'superficie', seed }, liso));
    E.poligono(ctx, [[x - 6 * s, y - 6 * s], [x - 34 * s, y - 52 * s], [x - 18 * s, y - 52 * s], [x + 22 * s, y - 6 * s]], Object.assign({ papel: 'apoioEscuro', seed: seed + 1 }, liso));
    E.poligono(ctx, [[x - 62 * s, y - 5 * s], [x - 76 * s, y - 30 * s], [x - 64 * s, y - 30 * s], [x - 46 * s, y - 5 * s]], Object.assign({ papel: 'apoioEscuro', seed: seed + 2 }, liso));
  }
  function caminhao(ctx, x, y, s, seed) { // y é o chão; o baú refrigerado com o floco
    E.ret(ctx, x - 70 * s, y - 86 * s, 100 * s, 70 * s, { papel: 'superficie', r: 6 * s, seed });
    E.ret(ctx, x + 34 * s, y - 64 * s, 40 * s, 48 * s, Object.assign({ papel: 'apoioEscuro', r: 8 * s, seed: seed + 1 }, liso));
    for (const wx of [-46, 52]) E.circulo(ctx, x + wx * s, y - 12 * s, 13 * s, Object.assign({ papel: 'tinta', seed: seed + 2 }, liso));
    floco(ctx, x - 20 * s, y - 51 * s, 18 * s, seed + 3);
  }
  // a caixa térmica em corte: as paredes grossas, as bobinas de gelo nas paredes, os frascos no meio e o registrador
  // de temperatura (datalogger) preso do lado de fora, com o risco da temperatura na telinha
  function caixa(ctx, x, y, w, h, seed, o = {}) { // y é o chão
    E.ret(ctx, x - w / 2, y - h, w, h, { papel: 'superficie', r: 10, seed });
    E.ret(ctx, x - w / 2 + 14, y - h + 14, w - 28, h - 28, Object.assign({ papel: 'fundo', r: 6, seed: seed + 1 }, liso));
    for (const sd of [-1, 1]) E.ret(ctx, x + sd * (w / 2 - 34) - 10, y - h + 20, 20, h - 40, Object.assign({ papel: 'apoio', r: 6, seed: seed + 2 + sd }, liso));
    const n = o.frascos ?? 2;
    for (let i = 0; i < n; i++) frasco(ctx, x + (i - (n - 1) / 2) * 30 * (w / 140), y - 22, (h - 50) / 290, { seed: seed + 5 + i, tampa: i === 0 ? 'alerta' : 'apoioEscuro' });
    if (o.registrador) {
      const rx = x + w / 2 - 6, ry = y - h - 6;
      E.ret(ctx, rx - 30, ry - 44, 60, 44, Object.assign({ papel: 'noite', r: 6, seed: seed + 9 }, liso));
      E.linha(ctx, [[rx - 20, ry - 18], [rx - 8, ry - 30], [rx + 4, ry - 20], [rx + 18, ry - 32]], { papel: 'marca', lw: 3, seed: seed + 10 });
    }
  }
  // o sino do alarme, com as ondas do som (x, y é o topo do sino)
  function sino(ctx, x, y, s, seed) {
    E.poligono(ctx, [[x - 10 * s, y], [x + 10 * s, y], [x + 30 * s, y + 30 * s], [x + 38 * s, y + 62 * s], [x - 38 * s, y + 62 * s], [x - 30 * s, y + 30 * s]], Object.assign({ papel: 'alerta', seed }, liso));
    E.circulo(ctx, x, y + 70 * s, 9 * s, Object.assign({ papel: 'tinta', seed: seed + 1 }, liso));
    for (const sd of [-1, 1]) for (let i = 0; i < 2; i++) {
      const r = (52 + i * 22) * s, pts = [];
      for (let a = -38; a <= 38; a += 8) pts.push([x + sd * Math.cos(a * RAD) * r, y + 34 * s + Math.sin(a * RAD) * r]);
      E.linha(ctx, pts, { papel: 'alerta', lw: 5, seed: seed + 2 + i + (sd > 0 ? 4 : 0) });
    }
  }

  // ---------- os desenhos das lâminas ----------
  // capa: o frasco no sol, o calor no ar e o termômetro com a coluna acima da faixa (o 8 e o 2 marcados)
  DS.esquentou = (ctx, cx, lam, pal = []) => {
    E.objeto(ctx, 'sol', { x: cx.x + 110, y: cx.y + 110, r: 60, seed: 400 });
    for (let i = 0; i < 3; i++) onda(ctx, cx.x + 220, cx.x + 390, cx.y + 160 + i * 52, 401 + i);
    frasco(ctx, cx.x + 530, cx.y + cx.h - 8, Math.min(1.25, (cx.h - 30) / 280), { seed: 404, monitor: 'escuro' });
    termometro(ctx, cx.x + 790, cx.y + 30, cx.y + cx.h - 88, { min: 0, max: 12, faixa: [2, 8], nivel: 11, marcas: [{ v: 8, texto: TX[pal[0]] }, { v: 2, texto: TX[pal[1]] }] });
  };

  // 1: o termômetro da faixa (dentro, o certo; acima e abaixo, o errado) e, do lado, o mesmo frasco perdendo força a
  // cada vez que sai da faixa (o sol pequeno é a saída), sem voltar
  DS.faixa = (ctx, cx, lam, pal = []) => {
    const tx = cx.x + 150, y0 = cx.y + 36, y1 = cx.y + cx.h - 86;
    const yDe = termometro(ctx, tx, y0, y1, { min: -2, max: 12, faixa: [2, 8], marcas: [{ v: 8, texto: TX[pal[0]] }, { v: 2, texto: TX[pal[1]] }] });
    errado(ctx, tx - 96, yDe(10.5), 1); certo(ctx, tx - 96, yDe(5), 1.1); errado(ctx, tx - 96, yDe(-0.2), 1);
    const chao = cx.y + cx.h * 0.6, s = Math.min(0.62, (chao - cx.y - 20) / 280), xs = [cx.x + 470, cx.x + 650, cx.x + 830], f = [1, 0.62, 0.3];
    xs.forEach((x, i) => {
      frasco(ctx, x, chao, s, { seed: 410 + i * 3 });
      const bw = 124, by = chao + 28;
      E.ret(ctx, x - bw / 2, by, bw, 30, Object.assign({ papel: 'superficie', r: 6, seed: 420 + i }, liso));
      E.ret(ctx, x - bw / 2 + 5, by + 5, (bw - 10) * f[i], 20, Object.assign({ papel: E.escuro() ? 'destaque' : 'apoioEscuro', r: 4, contorno: false, seed: 423 + i }, liso));
      if (i) { E.seta(ctx, [xs[i - 1] + 52, chao - 70 * s * 1.6], [x - 52, chao - 70 * s * 1.6], { lw: 5, curva: 0, cabeca: 20, seed: 426 + i }); solzinho(ctx, (xs[i - 1] + x) / 2, chao - 70 * s * 1.6 - 46, 13, 430 + i * 9); }
    });
    if (TX[pal[2]]) E.texto(ctx, TX[pal[2]], xs[1], chao + 104, { papel: 'titulo', size: 40, align: 'center' });
  };

  // 2: as paradas da rede de frio na linha, os nomes embaixo; em cima, o arco de cada trecho com o transporte no alto:
  // o avião, o caminhão refrigerado e a caixa térmica com o registrador de temperatura
  DS.paradas = (ctx, cx, lam, pal = []) => {
    const y = cx.y + Math.min(cx.h - 120, 300), passo = (cx.w - 200) / 3, xs = [0, 1, 2, 3].map((i) => cx.x + 100 + i * passo);
    E.linha(ctx, [[xs[0] - 60, y], [xs[3] + 60, y]], { lw: 6, seed: 440 });
    galpao(ctx, xs[0], y + 8, 168, 142, 450);
    galpao(ctx, xs[1], y + 8, 150, 128, 455);
    predinho(ctx, xs[2], y + 8, 136, 112, 460, false);
    predinho(ctx, xs[3], y + 8, 146, 122, 465, true);
    const topo = y - 196;
    for (let i = 0; i < 3; i++) {
      const a = [xs[i] + 52, y - 142], b = [xs[i + 1] - 52, y - 142], m = (a[0] + b[0]) / 2, arco = [];
      for (let j = 0; j <= 16; j++) { const u = j / 16; arco.push([a[0] + (b[0] - a[0]) * u, a[1] - Math.sin(u * Math.PI) * (a[1] - topo)]); }
      E.linha(ctx, arco.slice(0, 6), { lw: 3, tracejado: true, seed: 442 + i });
      E.seta(ctx, arco[11], b, { lw: 3, curva: 0.12, cabeca: 16, seed: 446 + i });
      if (i === 0) aviao(ctx, m, topo + 8, 0.74, 470);
      else if (i === 1) caminhao(ctx, m + 4, topo + 40, 0.8, 474);
      else caixa(ctx, m, topo + 44, 82, 74, 480, { frascos: 1, registrador: true });
    }
    pal.slice(0, 4).forEach((k, i) => { if (TX[k]) P.bloco(ctx, k, { x: xs[i] - passo / 2 + 4, y: y + 30, w: passo - 8, h: 96 }, { papel: 'titulo', sizes: [42, 40, 38, 36, 34], align: 'center', lh: 1.06, maxLinhas: 2 }); });
  };

  // 3: a câmara refrigerada da sala, com a prateleira de frascos, o mostrador e o sino do alarme; do lado, a escala com a
  // faixa de 2 °C a 8 °C e os dois pontos do alarme (3 °C e 7 °C), dentro dela
  DS.alarme = (ctx, cx, lam, pal = []) => {
    const kx = cx.x + 250, kw = 300, kh = cx.h - 30, ky = cx.y + 20;
    E.ret(ctx, kx - kw / 2, ky, kw, kh, { papel: 'superficie', r: 18, seed: 500 });
    E.ret(ctx, kx - kw / 2 + 22, ky + 96, kw - 44, kh - 120, Object.assign({ papel: 'apoio', r: 8, seed: 501 }, liso));
    const prat = 3, ph = (kh - 120) / prat;
    for (let i = 0; i < prat; i++) {
      const yb = ky + 96 + ph * (i + 1) - 10;
      E.linha(ctx, [[kx - kw / 2 + 30, yb], [kx + kw / 2 - 30, yb]], { lw: 5, seed: 502 + i });
      for (let j = 0; j < 3; j++) frasco(ctx, kx - 70 + j * 70, yb - 4, Math.min(0.3, (ph - 30) / 290), { seed: 506 + i * 3 + j, tampa: i === 1 && j === 1 ? 'alerta' : 'apoioEscuro' });
    }
    E.ret(ctx, kx - 84, ky + 22, 168, 58, Object.assign({ papel: 'noite', r: 8, seed: 520 }, liso));
    if (TX[pal[1]]) E.texto(ctx, TX[pal[1]], kx, ky + 66, { papel: 'numero', size: 42, align: 'center', cor: 'marca' });
    sino(ctx, kx + kw / 2 + 52, ky + 6, 0.8, 522);
    const yDe = termometro(ctx, cx.x + 690, cx.y + 50, cx.y + cx.h - 100, { min: 0, max: 10, faixa: [2, 8], nivel: 7, marcas: [{ v: 8, texto: TX[pal[2]], size: 34 }, { v: 2, texto: TX[pal[3]], size: 34 }, { v: 7, texto: TX[pal[1]], lado: 'esq', size: 40 }, { v: 3, texto: TX[pal[0]], lado: 'esq', size: 40 }] });
    for (const v of [7, 3]) sino(ctx, cx.x + 690 - 178, yDe(v) - 28, 0.42, 530 + v);
  };

  // 4: o monitor do frasco, de perto. À esquerda, o quadrado mais claro que o círculo (pode usar); à direita, igual ao
  // círculo (descarte). A lente liga o rótulo do frasco ao monitor aumentado
  DS.monitor = (ctx, cx, lam, pal = []) => {
    const chao = cx.y + cx.h - 70, s = Math.min(0.8, (cx.h - 110) / 280);
    [[cx.x + 200, 'claro', pal[0]], [cx.x + 660, 'escuro', pal[1]]].forEach(([x, m, k], i) => {
      frasco(ctx, x, chao, s, { seed: 540 + i * 9, monitor: m, tampa: 'alerta' });
      const lx = x + 150, ly = cx.y + 120, lr = 100, my = chao - 210 * s * 0.43;
      E.linha(ctx, [[x + 30 * s, my - 30 * s], [lx - lr * 0.7, ly + lr * 0.7]], { lw: 3, tracejado: true, seed: 550 + i });
      E.circulo(ctx, lx, ly, lr + 12, { papel: 'superficie', seed: 552 + i });
      E.circulo(ctx, lx, ly, lr * 0.74, Object.assign({ papel: 'noite', seed: 554 + i }, liso));
      E.ret(ctx, lx - lr * 0.37, ly - lr * 0.37, lr * 0.74, lr * 0.74, Object.assign({ papel: m === 'claro' ? 'papel' : 'noite', tinta: m === 'claro' ? 'tinta' : 'superficie', lw: 3, r: 3, seed: 556 + i }, liso));
      const ty = chao + 52;
      (i ? errado : certo)(ctx, x - 76, ty - 14, 1);
      if (TX[k]) E.texto(ctx, TX[k], x - 34, ty, { papel: 'titulo', size: 44 });
    });
    // no meio, o relógio da leitura de hora em hora
    const rx = cx.x + 440, ry = chao - 92, rr = 56;
    E.circulo(ctx, rx, ry, rr, { papel: 'superficie', seed: 560 });
    for (let h = 0; h < 12; h++) { const a = (h * 30 - 90) * RAD, r0 = h % 3 ? rr * 0.8 : rr * 0.68; E.linha(ctx, [[rx + Math.cos(a) * r0, ry + Math.sin(a) * r0], [rx + Math.cos(a) * rr * 0.92, ry + Math.sin(a) * rr * 0.92]], { lw: h % 3 ? 2 : 4, seed: 561 + h }); }
    E.linha(ctx, [[rx, ry], [rx, ry - rr * 0.7]], { lw: 5, seed: 575 });
    E.linha(ctx, [[rx, ry], [rx + rr * 0.42, ry + rr * 0.1]], { lw: 7, seed: 576 });
    E.seta(ctx, [rx + rr * 0.2, ry - rr - 14], [rx + rr + 10, ry - rr * 0.3], { lw: 4, curva: -0.35, cabeca: 16, seed: 577 });
  };
})();
