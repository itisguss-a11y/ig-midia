// PRESEME · carrossel · série Notícia comentada · MOLDE B · telão de dados (estilo infográfico chapado).
// A notícia vira painel: o dado no mapa e no número grande, cada ideia num cartão, a etiqueta em pílula. Cartão Floresta
// para o que importa (letra Papel, destaque em Marca-texto); cartão Papel para o resto. Fundo Sálvia do estilo.
// Um molde por tipo de lâmina: PRESEME.MOLDE[tipo]. lam.palavras[0] é a etiqueta (na capa, o nome da série).
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, TX = globalThis.TEXTOS, DS = P.DESENHO;
  const { L, R, CX, TOP, BOT } = P;
  const LW = R - L;
  const EM_ALTA = ['AL', 'BA', 'CE', 'DF', 'ES', 'GO', 'MG', 'MT', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RO', 'RR', 'RS', 'SC', 'SP'];

  // a etiqueta em pílula Floresta, letra Papel (em cima à esquerda, longe do contador do Instagram)
  function pilula(ctx, k, x = L, y = TOP - 10, o = {}) {
    if (!TX[k]) return y;
    const s = TX[k].toUpperCase(), z = o.size || 30, w = E.medir(ctx, s, { papel: 'titulo', size: z }) + 52, hh = z + 30;
    E.ret(ctx, x, y, w, hh, { papel: o.fundo || 'floresta', r: hh / 2, contorno: false, sombra: false, seed: 5 });
    E.texto(ctx, s, x + 26, y + hh / 2 + z * 0.36, { papel: 'titulo', size: z, cor: o.letra || 'papel' });
    return y + hh;
  }
  const cartao = (ctx, x, y, w, h, papel = 'superficie', seed = 11) => E.ret(ctx, x, y, w, h, { papel, r: 30, contorno: false, seed });
  const escuro = { cor: 'papel', corTrecho: 'marca' };

  P.MOLDE.capa = (ctx, lam) => {
    E.fundo(ctx);
    const [t1, t2] = lam.linhas;
    const y0 = pilula(ctx, lam.palavras[0]);
    P.titulo(ctx, t1, { x: L, y: y0 + 50, w: LW, h: 430 }, { sizes: [128, 120, 112, 104, 96], lh: 1.04 });
    const cel = 58, gap = 9, tam = DS.mapaTamanho(cel, gap);
    DS.mapa(ctx, { x: R - tam.w, y: BOT - tam.h, cel, gap, acesas: EM_ALTA, fortes: ['RR'], contorno: false, sombra: false, cores: { apagada: 'superficie', letraApagada: 'apoioEscuro' } });
    cartao(ctx, L, BOT - 420, R - tam.w - L - 40, 420, 'floresta', 13);
    P.bloco(ctx, t2, { x: L + 40, y: BOT - 380, w: R - tam.w - L - 120, h: 340 }, Object.assign({ papel: 'titulo', sizes: [64, 58, 54, 50], lh: 1.1, valign: 'middle' }, escuro));
  };

  P.MOLDE.noticia = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2, f3] = lam.linhas, [et, fonte, leg] = lam.palavras;
    const y0 = pilula(ctx, et);
    const a = P.bloco(ctx, f1, { x: L, y: y0 + 34, w: LW, h: 200 }, { papel: 'titulo', sizes: [56, 52, 48, 44], lh: 1.12 });
    const cel = 54, gap = 10, tam = DS.mapaTamanho(cel, gap), my = a.y1 + 40, hm = tam.h + 130;
    cartao(ctx, L, my, tam.w + 60, hm, 'superficie', 21);
    const centros = DS.mapa(ctx, { x: L + 30, y: my + 30, cel, gap, acesas: EM_ALTA, fortes: ['RR', 'RO'], contorno: false, sombra: false, cores: { apagada: 'apoio', letraApagada: 'floresta' } });
    // a legenda do mapa: o quadradinho escuro é "em alta"
    E.ret(ctx, L + 30, my + tam.h + 64, 36, 36, { papel: 'floresta', r: 9, contorno: false, sombra: false, seed: 23 });
    P.bloco(ctx, leg, { x: L + 80, y: my + tam.h + 46, w: tam.w - 50, h: 72 }, { sizes: [30], maxLinhas: 2, lh: 1.15, valign: 'middle' });
    // à direita: o gancho regional (cartão Floresta) e o contexto (cartão Papel)
    const xr = L + tam.w + 90, wr = R - xr;
    cartao(ctx, xr, my, wr, 300, 'floresta', 25);
    P.bloco(ctx, f2, { x: xr + 36, y: my + 30, w: wr - 72, h: 240 }, Object.assign({ papel: 'titulo', sizes: [60, 56, 52, 48, 44], lh: 1.1, valign: 'middle' }, escuro));
    const yc = my + 330;
    cartao(ctx, xr, yc, wr, hm - 330, 'superficie', 27);
    P.bloco(ctx, f3, { x: xr + 36, y: yc + 30, w: wr - 72, h: hm - 390 }, { sizes: [46, 42, 40, 38, 36], valign: 'middle' });
    P.fonte(ctx, fonte, { x: L, y: BOT - 70, w: LW, h: 74 }, { valign: 'bottom' });
  };

  P.MOLDE.explica = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas;
    const y0 = pilula(ctx, lam.palavras[0]);
    cartao(ctx, L, y0 + 40, LW, 440, 'floresta', 31);
    const a = P.titulo(ctx, f1, { x: L + 50, y: y0 + 80, w: LW - 100, h: 360 }, Object.assign({ sizes: [100, 92, 84, 76], valign: 'middle' }, escuro));
    const yb = y0 + 520;
    cartao(ctx, L, yb, LW, BOT - yb, 'superficie', 33);
    P.bloco(ctx, f2, { x: L + 50, y: yb + 50, w: LW - 330, h: BOT - yb - 100 }, { sizes: [56, 52, 48, 44], valign: 'middle' });
    DS.termometro(ctx, R - 130, yb + (BOT - yb) / 2 + 10, 1.35);
  };

  P.MOLDE.colunas = (ctx, lam) => {
    E.fundo(ctx);
    const [ex1, ex2] = lam.linhas, et = lam.palavras[0], cols = lam.palavras.slice(1), meio = Math.ceil(cols.length / 2);
    const y0 = pilula(ctx, et);
    const gap = 30, w = (LW - gap) / 2, hc = 520;
    [cols.slice(0, meio), cols.slice(meio)].forEach((col, j) => {
      const x = L + j * (w + gap), y = y0 + 40;
      cartao(ctx, x, y, w, hc, 'superficie', 41 + j);
      pilula(ctx, col[0], x + 30, y + 30, { size: 30, fundo: j ? 'apoioEscuro' : 'floresta' });
      col.slice(1).forEach((k, i) => {
        const yy = y + 130 + i * 92;
        E.circulo(ctx, x + 46, yy + 30, 9, { papel: 'tinta', contorno: false, sombra: false, seed: 45 + i });
        P.bloco(ctx, k, { x: x + 72, y: yy, w: w - 100, h: 64 }, { sizes: [46, 42, 38], maxLinhas: 1 });
      });
    });
    const ye = y0 + 40 + hc + 30, he = (BOT - ye - 24) / 2;
    [[ex1, 'certo'], [ex2, 'errado']].forEach(([k, m], i) => {
      const y = ye + i * (he + 24);
      cartao(ctx, L, y, LW, he, 'superficie', 51 + i);
      DS[m](ctx, L + 70, y + he / 2, 1.4);
      P.bloco(ctx, k, { x: L + 140, y: y + 24, w: LW - 180, h: he - 48 }, { sizes: [52, 48, 44, 40], valign: 'middle' });
    });
  };

  P.MOLDE.alerta = (ctx, lam) => {
    E.fundo(ctx);
    const [f1] = lam.linhas, [et, ...sinais] = lam.palavras;
    const y0 = pilula(ctx, et);
    cartao(ctx, L, y0 + 40, LW, 380, 'floresta', 61);
    P.bloco(ctx, f1, { x: L + 50, y: y0 + 80, w: LW - 100, h: 300 }, Object.assign({ papel: 'titulo', sizes: [62, 58, 54, 50], lh: 1.12, valign: 'middle' }, escuro));
    const icone = [(c, x, y) => DS.pulmoes(c, x, y, 0.9), (c, x, y) => DS.pulmoes(c, x - 26, y, 0.82, { rapido: true }), (c, x, y) => DS.oximetro(c, x + 20, y, 0.8)];
    const yt = y0 + 450, gap = 24, ht = (BOT - yt - gap * (sinais.length - 1)) / Math.max(1, sinais.length);
    sinais.forEach((k, i) => {
      const y = yt + i * (ht + gap);
      cartao(ctx, L, y, LW, ht, 'superficie', 63 + i);
      (icone[i] || icone[0])(ctx, L + 120, y + ht / 2);
      P.bloco(ctx, k, { x: L + 270, y: y + 20, w: LW - 310, h: ht - 40 }, { sizes: [50, 46, 42, 38], valign: 'middle' });
    });
  };

  P.MOLDE.passos = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas, [et, p1, p2] = lam.palavras;
    const y0 = pilula(ctx, et);
    const a = P.bloco(ctx, f1, { x: L, y: y0 + 36, w: LW, h: 250 }, { sizes: [54, 50, 46, 42] });
    const yc = a.y1 + 50, hc = 420;
    cartao(ctx, L, yc, LW, hc, 'superficie', 71);
    const d = DS.dias(ctx, L + 40, yc + 150, LW - 80, { alt: 90, gap: 10, faixa: 34, vazio: 'apoio' });
    P.bloco(ctx, p1, { x: L + 40, y: yc + 40, w: d.xIso - L - 40, h: 90 }, { papel: 'titulo', sizes: [44, 40, 36], align: 'center', valign: 'middle', maxLinhas: 1 });
    P.bloco(ctx, p2, { x: L + 40, y: d.yb + d.hb + 24, w: LW - 80, h: 70 }, { papel: 'titulo', sizes: [44, 40, 36], align: 'right', maxLinhas: 1 });
    P.bloco(ctx, f2, { x: L, y: yc + hc + 50, w: LW, h: BOT - yc - hc - 50 }, { sizes: [54, 50, 46, 42] });
  };

  P.MOLDE.prevencao = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2, f3] = lam.linhas, [et, ...grupos] = lam.palavras;
    const y0 = pilula(ctx, et);
    cartao(ctx, L, y0 + 40, 640, 330, 'floresta', 81);
    P.bloco(ctx, f1, { x: L + 44, y: y0 + 70, w: 552, h: 270 }, Object.assign({ papel: 'titulo', sizes: [64, 58, 54, 50], lh: 1.1, valign: 'middle' }, escuro));
    DS.seringa(ctx, 870, y0 + 205, 0.92, -1.1);
    const b = P.bloco(ctx, f2, { x: L, y: y0 + 410, w: LW, h: 120 }, { sizes: [48, 44, 40] });
    let y = b.y1 + 30;
    grupos.forEach((k, i) => {
      cartao(ctx, L, y, LW, 84, 'superficie', 83 + i);
      E.circulo(ctx, L + 46, y + 42, 14, { papel: 'marca', contorno: false, sombra: false, seed: 86 + i });
      P.bloco(ctx, k, { x: L + 80, y: y + 10, w: LW - 110, h: 64 }, { sizes: [44, 40, 36], maxLinhas: 1, valign: 'middle' });
      y += 104;
    });
    P.bloco(ctx, f3, { x: L, y: y + 20, w: LW, h: BOT - y - 20 }, { sizes: [44, 40, 38, 36] });
  };

  P.MOLDE.resumo = (ctx, lam) => {
    E.fundo(ctx);
    const fr = lam.linhas, [et, fonte] = lam.palavras;
    const y0 = pilula(ctx, et);
    const gap = 26, hc = (BOT - 110 - y0 - 40 - gap * (fr.length - 1)) / Math.max(1, fr.length);
    fr.forEach((k, i) => {
      const y = y0 + 40 + i * (hc + gap);
      cartao(ctx, L, y, LW, hc, 'superficie', 91 + i);
      P.bloco(ctx, k, { x: L + 44, y: y + 24, w: LW - 88, h: hc - 48 }, { papel: 'titulo', sizes: [62, 58, 54, 50, 46], lh: 1.1, valign: 'middle' });
    });
    P.fonte(ctx, fonte, { x: L, y: BOT - 70, w: LW, h: 74 }, { valign: 'bottom' });
  };
})();
