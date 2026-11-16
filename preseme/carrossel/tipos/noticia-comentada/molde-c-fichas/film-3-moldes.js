// PRESEME · carrossel · série Notícia comentada · MOLDE C · fichas de estudo (estilo carimbo e gravura).
// Cada lâmina é uma ficha pautada (a de papel, de estudar para a prova) em cima da mesa Floresta: a linha Coral no
// alto, as pautas Sálvia, o carimbo com a etiqueta da lâmina e a letra grossa (Anton) no título. A capa é a pilha de
// fichas. Um molde por tipo de lâmina: PRESEME.MOLDE[tipo]. lam.palavras[0] é a etiqueta (na capa, o nome da série).
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, TX = globalThis.TEXTOS, DS = P.DESENHO;
  const { L, R, CX, TOP, BOT, W, H } = P;

  // a ficha: o cartão branco pautado, inclinado; dentro(ctx, caixa) desenha no papel dela (a caixa já sem o cabeçalho)
  function ficha(ctx, k, x, y, w, h, rot, seed, dentro, o = {}) {
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot); ctx.translate(-w / 2, -h / 2);
    E.ret(ctx, 0, 0, w, h, { papel: 'branco', r: 10, contorno: false, sombra: true, sombraX: 10, sombraY: 14, hachura: false, seed });
    const topo = o.topo || 150;
    ctx.save(); ctx.globalAlpha *= 0.55;
    for (let yy = topo + 70; yy < h - 40; yy += 70) E.linha(ctx, [[28, yy], [w - 28, yy]], { papel: 'apoio', lw: 3, seed: seed + yy });
    ctx.restore();
    E.linha(ctx, [[28, topo], [w - 28, topo]], { papel: 'alerta', lw: 4, seed: seed + 1 });
    if (TX[k]) E.carimbo(ctx, TX[k], o.seloX ?? 70 + E.medir(ctx, TX[k].toUpperCase(), { papel: 'titulo', size: 40 }) / 2 + 30, topo / 2 + 6, { k: 1, rot: -0.07, size: 40, seed: seed + 3 });
    dentro(ctx, { x: 56, y: topo + 40, w: w - 112, h: h - topo - 80 });
    ctx.restore();
  }
  const mesa = (ctx) => E.fundo(ctx, { tipo: 'escuro' });
  const FX = 60, FY = 150, FW = W - 120, FH = H - 150 - 80; // a ficha de cada lâmina

  P.MOLDE.capa = (ctx, lam) => {
    mesa(ctx);
    const [t1, t2] = lam.linhas;
    // a pilha: duas fichas atrás, tortas
    ctx.save(); ctx.translate(560, 720); ctx.rotate(0.07); ctx.translate(-560, -720);
    E.ret(ctx, 120, 250, 880, 960, { papel: 'apoio', r: 10, contorno: false, sombra: true, hachura: false, seed: 3 });
    ctx.restore();
    ctx.save(); ctx.translate(540, 700); ctx.rotate(0.035); ctx.translate(-540, -700);
    E.ret(ctx, 96, 214, 900, 970, { papel: 'papel', r: 10, contorno: false, sombra: true, hachura: false, seed: 4 });
    ctx.restore();
    ficha(ctx, lam.palavras[0], 70, 190, 940, 980, -0.03, 7, (c, b) => {
      const a = P.titulo(c, t1, { x: b.x, y: b.y + 10, w: b.w, h: 500 }, { sizes: [150, 140, 130, 120, 110, 100], lh: 1.02 });
      P.bloco(c, t2, { x: b.x, y: a.y1 + 50, w: b.w, h: b.h - (a.y1 - b.y) - 60 }, { sizes: [60, 56, 52, 48], valign: 'top' });
    }, { topo: 160 });
  };

  P.MOLDE.noticia = (ctx, lam) => {
    mesa(ctx);
    const [f1, f2, f3] = lam.linhas, [et, fonte] = lam.palavras;
    ficha(ctx, et, FX, FY, FW, FH, -0.012, 11, (c, b) => {
      const a = P.bloco(c, f1, { x: b.x, y: b.y, w: b.w, h: 300 }, { papel: 'titulo', sizes: [70, 64, 60, 56, 52], lh: 1.08 });
      const cel = 92, gap = 10, tam = DS.mapaTamanho(cel, gap, 'norte'), my = a.y1 + 50;
      const cs = DS.mapa(c, { x: b.x, y: my, cel, gap, so: 'norte', fortes: ['RR', 'RO'], contorno: true, cores: { apagada: 'apoio', letraApagada: 'floresta' } });
      P.bloco(c, f2, { x: b.x + tam.w + 40, y: my, w: b.w - tam.w - 40, h: tam.h }, { papel: 'titulo', sizes: [60, 56, 52, 48], lh: 1.08, valign: 'middle' });
      const d = P.bloco(c, f3, { x: b.x, y: my + tam.h + 40, w: b.w, h: 150 }, { sizes: [44, 40, 38, 36] });
      P.fonte(c, fonte, { x: b.x, y: b.y + b.h - 70, w: b.w, h: 74 }, { cor: 'apoioEscuro', valign: 'bottom' });
    });
  };

  P.MOLDE.explica = (ctx, lam) => {
    mesa(ctx);
    const [f1, f2] = lam.linhas;
    ficha(ctx, lam.palavras[0], FX, FY, FW, FH, 0.01, 21, (c, b) => {
      const a = P.titulo(c, f1, { x: b.x, y: b.y + 10, w: b.w, h: 420 }, { sizes: [120, 110, 100, 92, 84] });
      P.bloco(c, f2, { x: b.x, y: a.y1 + 60, w: b.w - 250, h: b.y + b.h - a.y1 - 60 }, { sizes: [56, 52, 48, 44] });
      DS.termometro(c, b.x + b.w - 90, b.y + b.h - 170, 1.4);
    });
  };

  P.MOLDE.colunas = (ctx, lam) => {
    mesa(ctx);
    const [ex1, ex2] = lam.linhas, et = lam.palavras[0], cols = lam.palavras.slice(1), meio = Math.ceil(cols.length / 2);
    ficha(ctx, et, FX, FY, FW, FH, -0.01, 31, (c, b) => {
      const w = (b.w - 40) / 2;
      [cols.slice(0, meio), cols.slice(meio)].forEach((col, j) => {
        const x = b.x + j * (w + 40);
        P.bloco(c, col[0], { x, y: b.y, w, h: 80 }, { papel: 'titulo', sizes: [60, 56, 52], maxLinhas: 1 });
        col.slice(1).forEach((k, i) => {
          const y = b.y + 106 + i * 82;
          E.circulo(c, x + 12, y + 30, 9, { papel: 'tinta', contorno: false, sombra: false, seed: 33 + i });
          P.bloco(c, k, { x: x + 38, y, w: w - 38, h: 66 }, { sizes: [48, 44, 40, 36], maxLinhas: 1 });
        });
      });
      const ye = b.y + 106 + 4 * 82 + 40;
      DS.certo(c, b.x + 30, ye + 56, 1.3);
      const a = P.bloco(c, ex1, { x: b.x + 90, y: ye, w: b.w - 90, h: 140 }, { papel: 'titulo', sizes: [54, 50, 46, 42], lh: 1.08, valign: 'middle' });
      DS.errado(c, b.x + 30, a.y1 + 96, 1.2);
      P.bloco(c, ex2, { x: b.x + 90, y: a.y1 + 40, w: b.w - 90, h: b.y + b.h - a.y1 - 40 }, { papel: 'titulo', sizes: [54, 50, 46, 42], lh: 1.08 });
    });
  };

  P.MOLDE.alerta = (ctx, lam) => {
    mesa(ctx);
    const [f1] = lam.linhas, [et, ...sinais] = lam.palavras;
    ficha(ctx, et, FX, FY, FW, FH, 0.012, 41, (c, b) => {
      const a = P.bloco(c, f1, { x: b.x, y: b.y, w: b.w, h: 340 }, { papel: 'titulo', sizes: [72, 66, 60, 56], lh: 1.06 });
      const icone = [(cc, x, y) => DS.pulmoes(cc, x, y, 0.95), (cc, x, y) => DS.pulmoes(cc, x - 28, y, 0.86, { rapido: true }), (cc, x, y) => DS.oximetro(cc, x + 20, y, 0.82)];
      const passo = (b.y + b.h - a.y1 - 30) / Math.max(1, sinais.length);
      sinais.forEach((k, i) => {
        const y = a.y1 + 30 + i * passo;
        (icone[i] || icone[0])(c, b.x + 100, y + passo / 2);
        P.bloco(c, k, { x: b.x + 260, y: y + 10, w: b.w - 260, h: passo - 20 }, { sizes: [52, 48, 44, 40], valign: 'middle' });
      });
    });
  };

  P.MOLDE.passos = (ctx, lam) => {
    mesa(ctx);
    const [f1, f2] = lam.linhas, [et, p1, p2] = lam.palavras;
    ficha(ctx, et, FX, FY, FW, FH, -0.01, 51, (c, b) => {
      const a = P.bloco(c, f1, { x: b.x, y: b.y, w: b.w, h: 260 }, { sizes: [54, 50, 46, 42] });
      const yd = a.y1 + 150;
      const d = DS.dias(c, b.x, yd, b.w, { alt: 80, gap: 10, faixa: 30, vazio: 'apoio' });
      P.bloco(c, p1, { x: b.x, y: yd - 96, w: b.w * 0.8, h: 80 }, { papel: 'titulo', sizes: [52, 48, 44], valign: 'bottom', maxLinhas: 1 });
      P.bloco(c, p2, { x: b.x, y: d.yb + d.hb + 16, w: b.w, h: 74 }, { papel: 'titulo', sizes: [52, 48, 44], align: 'right', maxLinhas: 1 });
      P.bloco(c, f2, { x: b.x, y: d.yb + d.hb + 130, w: b.w, h: b.y + b.h - (d.yb + d.hb + 130) }, { sizes: [54, 50, 46, 42] });
    });
  };

  P.MOLDE.prevencao = (ctx, lam) => {
    mesa(ctx);
    const [f1, f2, f3] = lam.linhas, [et, ...grupos] = lam.palavras;
    ficha(ctx, et, FX, FY, FW, FH, 0.01, 61, (c, b) => {
      const a = P.bloco(c, f1, { x: b.x, y: b.y, w: b.w - 260, h: 300 }, { papel: 'titulo', sizes: [76, 70, 64, 60], lh: 1.04 });
      DS.seringa(c, b.x + b.w - 110, b.y + 130, 0.8, -1.15);
      const q = P.bloco(c, f2, { x: b.x, y: Math.max(a.y1, b.y + 260) + 36, w: b.w, h: 120 }, { sizes: [46, 42, 40] });
      let y = q.y1 + 26;
      grupos.forEach((k, i) => {
        E.circulo(c, b.x + 20, y + 32, 16, { papel: 'marca', contorno: false, sombra: false, seed: 63 + i });
        P.bloco(c, k, { x: b.x + 56, y, w: b.w - 56, h: 66 }, { papel: 'titulo', sizes: [48, 44, 40], maxLinhas: 1 });
        y += 78;
      });
      P.bloco(c, f3, { x: b.x, y: y + 30, w: b.w, h: b.y + b.h - y - 30 }, { sizes: [42, 40, 38, 36] });
    });
  };

  P.MOLDE.resumo = (ctx, lam) => {
    mesa(ctx);
    const fr = lam.linhas, [et, fonte] = lam.palavras;
    ficha(ctx, et, FX, FY, FW, FH, -0.012, 71, (c, b) => {
      const passo = (b.h - 110) / Math.max(1, fr.length);
      fr.forEach((k, i) => P.bloco(c, k, { x: b.x, y: b.y + i * passo, w: b.w, h: passo - 30 }, { papel: 'titulo', sizes: [76, 70, 64, 60, 56], lh: 1.04, valign: 'middle' }));
      P.fonte(c, fonte, { x: b.x, y: b.y + b.h - 74, w: b.w, h: 78 }, { cor: 'apoioEscuro', valign: 'bottom' });
    });
  };
})();
