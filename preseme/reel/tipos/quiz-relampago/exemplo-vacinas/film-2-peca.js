// PRESEME · motor "Quiz relâmpago" · desenho 2/3 · a peça "5 perguntas sobre vacina" (exemplo do tipo)
// O que a peça preenche aqui (o guia completo está no film-2-peca.js do molde):
//   DESTAQUE   o trecho de cada frase que leva o marca-texto
//   PESSOA     quem joga, na abertura (a biblioteca, B.pessoa)
//   DESENHO    o desenho pequeno de cada resposta: DESENHO[k](ctx, st, M, caixa), caixa = { x, y, w, h } à direita do selo
//   ESTUDAR    o desenho do fim, embaixo do que estudar
// Desenhos da biblioteca (B.gota, B.calendario, B.caixaTermica, B.termometro, B.cartaoVacina) e do kit, com cor por papel.
// Palavra dentro do desenho vem do textos.txt (M.D('D09')...). Texto de exemplo escrito pelo Opus.
(function () {
  const U = globalThis.U, E = globalThis.ESTILOS;
  const ease = U.ease;
  const B = () => globalThis.BIB;
  const k01 = (st, t0, d = 0.3) => U.clamp(((st.desde.resposta ?? -1) - t0) / d, 0, 1); // a entrada de cada parte, depois da resposta
  const zoom = (ctx, x, y, k, fn) => { if (k <= 0) return; const z = ease.outBack(k); ctx.save(); ctx.translate(x, y); ctx.scale(z, z); ctx.translate(-x, -y); fn(); ctx.restore(); };

  // uma etiqueta: o retângulo com a palavra do textos.txt, que diminui até caber
  function etiqueta(ctx, M, dk, x, y, w, h, { papel = 'superficie', k = 1, seed = 800 } = {}) {
    zoom(ctx, x + w / 2, y + h / 2, k, () => {
      E.ret(ctx, x, y, w, h, { papel, r: 14, seed, sombra: false });
      const { size, ls } = M.caber(ctx, dk, { sizes: [36, 32, 28, 26], maxLinhas: [1, 1, 1, 2], maxW: w - 24, papel: 'corpo', texto: M.D(dk) });
      const lh = size * E.letra('corpo')[2] * 1.27;
      M.desenhar(ctx, dk, ls, size, { cx: x + w / 2, y0: y + h / 2 - ((ls.length - 1) * lh) / 2 + size * 0.36, cor: papel === 'superficie' || !E.escuro() ? 'texto' : 'fundo' });
    });
  }

  // 1. a gotinha saiu: a gota com o ✗ e as quatro doses de VIP, em etiquetas (2, 4, 6 e 15 meses)
  function gotinha(ctx, st, M, c) {
    const cy = c.y + c.h / 2, gx = c.x + 100;
    zoom(ctx, gx, cy, k01(st, 0.15), () => B().gota(ctx, { x: gx, y: cy, r: 64, papel: 'apoioEscuro', seed: 811 }));
    M.marca(ctx, false, gx, cy, 1.6, k01(st, 0.45, 0.25));
    const tw = 250, th = 72, gx2 = 18, gy2 = 16, x0 = c.x + c.w - 2 * tw - gx2 - 6, y0 = cy - th - gy2 / 2;
    ['D09', 'D10', 'D11', 'D12'].forEach((dk, i) => etiqueta(ctx, M, dk, x0 + (i % 2) * (tw + gx2), y0 + Math.floor(i / 2) * (th + gy2), tw, th, { papel: i === 3 ? 'destaque' : 'superficie', k: k01(st, 0.7 + 0.15 * i, 0.25), seed: 820 + i }));
  }
  // 2. o último caso: o calendário de março de 1989, com o dia 19 marcado, e a etiqueta com o mês e o ano
  function ultimoCaso(ctx, st, M, c) {
    const cy = c.y + c.h / 2, s = Math.min(0.8, (c.h - 40) / 340), cx = c.x + 40 + 160 * s;
    B().calendario(ctx, { x: cx, y: cy + 14, s, titulo: '', marcados: k01(st, 0.8, 0.01) > 0 ? [18] : [], k: ease.outBack(k01(st, 0.15, 0.35)), seed: 840 });
    etiqueta(ctx, M, 'D13', cx + 160 * s + 60, cy - 46, c.x + c.w - (cx + 160 * s + 60) - 10, 92, { papel: 'destaque', k: k01(st, 0.55, 0.25), seed: 845 });
  }
  // 3. a temperatura: a caixa térmica aberta, o termômetro em 10 °C (coral, com o ✗) e a faixa certa, 2 a 8 °C, com o ✓
  function frio(ctx, st, M, c) {
    const by = c.y + c.h - 14, bx = c.x + 120;
    zoom(ctx, bx, by - 80, k01(st, 0.15), () => B().caixaTermica(ctx, { x: bx, y: by, w: 210, h: 150, aberta: 0.7, floco: true, seed: 850 }));
    const tx = c.x + 500, ty = c.y + 62;
    zoom(ctx, tx, ty, k01(st, 0.45), () => B().termometro(ctx, { x: tx, y: ty, s: 1.5, leitura: M.D('D14'), febre: true, seed: 860 }));
    M.marca(ctx, false, c.x + c.w - 60, ty, 0.8, k01(st, 0.75, 0.2));
    etiqueta(ctx, M, 'D15', c.x + 300, c.y + c.h - 92, 330, 72, { papel: 'apoio', k: k01(st, 1.0, 0.25), seed: 870 });
    M.marca(ctx, true, c.x + 690, c.y + c.h - 56, 0.8, k01(st, 1.2, 0.2));
  }
  // 4. a BCG: o cartão de vacina com a primeira dose marcada e a etiqueta "ao nascer" apontando para ela
  function bcg(ctx, st, M, c) {
    const s = Math.min(1, (c.h - 36) / 250), cx = c.x + 30 + 170 * s, cy = c.y + c.h / 2 + 8;
    zoom(ctx, cx, cy, k01(st, 0.15), () => B().cartaoVacina(ctx, { x: cx, y: cy, s, marcadas: k01(st, 0.75, 0.01) > 0 ? [0] : [], titulo: '', seed: 880 }));
    const ex = cx + 170 * s + 90, ew = c.x + c.w - ex - 10, eh = 80, ey = c.y + 16;
    etiqueta(ctx, M, 'D16', ex, ey, ew, eh, { papel: 'destaque', k: k01(st, 0.5, 0.25), seed: 890 });
    const kS = k01(st, 0.75, 0.25);
    if (kS > 0) E.seta(ctx, [ex + 20, ey + eh + 10], [cx + (-154 + 33) * s, cy + (-52 + 21) * s], { papel: 'tinta', lw: 6, k: kS, seed: 895 });
  }
  // 5. a cobertura: a barra que enche até 86,5% e não chega na linha da meta, 95%
  function cobertura(ctx, st, M, c) {
    const x0 = c.x + 16, x1 = c.x + c.w - 16, w = x1 - x0, h = 66, y = c.y + c.h / 2 - h / 2 + 6;
    const kB = k01(st, 0.15, 0.25);
    if (kB <= 0) return;
    ctx.save(); ctx.globalAlpha *= kB;
    E.ret(ctx, x0, y, w, h, { papel: 'superficie', r: 16, seed: 900 });
    const kF = ease.outCubic(k01(st, 0.4, 0.9));
    if (kF > 0.01) E.ret(ctx, x0 + 6, y + 6, (w - 12) * 0.865 * kF, h - 12, { papel: 'alerta', r: 12, seed: 901, sombra: false, hachura: false });
    const xm = x0 + 6 + (w - 12) * 0.95;
    E.linha(ctx, [[xm, y - 22], [xm, y + h + 22]], { papel: 'tinta', lw: 8, seed: 902 });
    ctx.restore();
    etiqueta(ctx, M, 'D18', Math.min(x1 - 230, xm - 115), c.y, 230, 70, { papel: 'apoio', k: k01(st, 0.3, 0.25), seed: 905 });
    etiqueta(ctx, M, 'D17', Math.max(x0, x0 + (w - 12) * 0.865 * kF - 200), c.y + c.h - 70, 200, 70, { papel: 'destaque', k: k01(st, 1.2, 0.25), seed: 906 });
  }
  // o fim: o cartão de vacina (o calendário) e a caixa térmica (a rede de frio), lado a lado
  function estudar(ctx, st, M, c) {
    const u = st.t - st.c.t0, y = c.y + c.h / 2;
    const s = Math.min(1.25, (c.w * 0.55) / 360);
    zoom(ctx, c.x + c.w * 0.3, y, U.clamp((u - 0.3) / 0.35, 0, 1), () => B().cartaoVacina(ctx, { x: c.x + c.w * 0.3, y, s, marcadas: [0, 1, 2, 4, 5], titulo: '', seed: 910 }));
    zoom(ctx, c.x + c.w * 0.79, y, U.clamp((u - 0.55) / 0.35, 0, 1), () => B().caixaTermica(ctx, { x: c.x + c.w * 0.79, y: y + 130, w: 270, h: 210, aberta: 0, floco: true, seed: 920 }));
  }

  globalThis.PECA = {
    DESTAQUE: { 1: '3 segundos', 4: 'todas as doses', 6: '19 de março de 1989', 8: 'o máximo é 8 °C', 10: 'até 30 dias de vida', 12: '86,5%' },
    PESSOA: { quem: 'calouro' },
    DESENHO: { 1: gotinha, 2: ultimoCaso, 3: frio, 4: bcg, 5: cobertura },
    ESTUDAR: estudar,
  };
})();
