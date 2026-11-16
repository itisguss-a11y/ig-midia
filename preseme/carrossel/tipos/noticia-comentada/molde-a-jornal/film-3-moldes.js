// PRESEME · carrossel · série Notícia comentada · MOLDE A · jornal anotado à mão (estilo lápis no papel).
// A notícia entra como recorte de jornal; o comentário é a caneta de quem estuda por cima dela: marca-texto, seta,
// círculo e anotação de mão. Um molde por tipo de lâmina (o score.js diz qual lâmina usa qual): PRESEME.MOLDE[tipo].
// Em toda lâmina, lam.palavras[0] é a etiqueta (na capa, o nome da série). Desenho parado.
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, TX = globalThis.TEXTOS, DS = P.DESENHO;
  const { L, R, CX, TOP, BOT } = P;
  const LW = R - L;

  // a etiqueta da lâmina: anotação de mão, sublinhada a lápis (em cima à esquerda, longe do contador do Instagram)
  function etiqueta(ctx, k, x = L, y = TOP - 4) {
    if (!TX[k]) return y;
    const s = TX[k], z = 46, w = E.medir(ctx, s, { papel: 'mao', size: z });
    E.texto(ctx, s, x, y + 40, { papel: 'mao', size: z });
    E.linha(ctx, [[x - 4, y + 56], [x + w * 0.55, y + 59], [x + w + 8, y + 54]], { papel: 'alerta', lw: 5, seed: 7 });
    return y + 84;
  }
  // uma anotação de mão: o texto k em Caveat, levemente torto
  function anota(ctx, k, box, o = {}) {
    ctx.save(); ctx.translate(box.x, box.y); ctx.rotate(o.rot ?? -0.02);
    const r = P.bloco(ctx, k, { x: 0, y: 0, w: box.w, h: box.h }, Object.assign({ papel: 'mao', sizes: [62, 58, 54, 50, 46], lh: 1.08 }, o));
    ctx.restore();
    return r;
  }
  // um recorte inclinado: chama dentro(ctx, caixa interna) já no papel do recorte
  function recorte(ctx, x, y, w, h, rot, seed, dentro) {
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot); ctx.translate(-w / 2, -h / 2);
    DS.recorte(ctx, 0, 0, w, h, { seed });
    E.linha(ctx, [[46, 48], [w - 46, 48]], { lw: 3, seed: seed + 1 }); // o fio de cima, de página de jornal
    E.linha(ctx, [[46, 56], [w - 46, 56]], { lw: 1.5, seed: seed + 2 });
    dentro(ctx, { x: 46, y: 80, w: w - 92, h: h - 120 });
    ctx.restore();
  }

  P.MOLDE.capa = (ctx, lam) => {
    E.fundo(ctx);
    const [t1, t2] = lam.linhas, selo = lam.palavras[0];
    recorte(ctx, 62, 168, 956, 690, -0.025, 31, (c, b) => {
      if (TX[selo]) E.texto(c, TX[selo].toUpperCase(), b.x, b.y - 46 + 74, { papel: 'corpo', size: 30 });
      P.titulo(c, t1, { x: b.x, y: b.y + 70, w: b.w, h: b.h - 90 }, { sizes: [128, 120, 112, 104, 96, 88], lh: 1.06, valign: 'middle' });
    });
    // a pergunta, anotada à mão embaixo do recorte, com a seta subindo para a manchete
    anota(ctx, t2, { x: L + 10, y: 912, w: 760, h: 290 }, { rot: -0.035, sizes: [92, 86, 80, 74, 68], valign: 'middle' });
    E.seta(ctx, [930, 1150], [920, 884], { papel: 'alerta', lw: 7, curva: 0.42, seed: 41 });
  };

  P.MOLDE.noticia = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2, f3] = lam.linhas, [et, fonte] = lam.palavras;
    const y0 = etiqueta(ctx, et);
    recorte(ctx, 56, y0 + 10, 968, 560, 0.018, 51, (c, b) => {
      const a = P.bloco(c, f1, { x: b.x, y: b.y, w: b.w, h: 230 }, { papel: 'titulo', sizes: [62, 58, 54, 50, 46], lh: 1.14 });
      const d = P.bloco(c, f3, { x: b.x, y: a.y1 + 28, w: b.w, h: 140 }, { sizes: [44, 40, 38, 36] });
      P.fonte(c, fonte, { x: b.x, y: b.y + b.h - 80, w: b.w, h: 84 }, { cor: 'apoioEscuro', valign: 'bottom' });
    });
    // o mapa do Norte, com os dois estados em alta no marca-texto, e a anotação apontando para eles
    const cel = 108, gap = 12, my = 860;
    const centros = DS.mapa(ctx, { x: L + 6, y: my, cel, gap, so: 'norte', acesas: [], fortes: ['RR', 'RO'], cores: { apagada: 'branco', letraApagada: 'apoioEscuro' } });
    for (const uf of ['RR', 'RO']) E.circulo(ctx, centros[uf][0], centros[uf][1], cel * 0.72, { ry: cel * 0.68, papel: null, tinta: 'alerta', lw: 5, hachura: false, seed: uf === 'RR' ? 57 : 58 });
    anota(ctx, f2, { x: 500, y: 930, w: 500, h: 240 }, { rot: -0.03, sizes: [76, 70, 64, 58], valign: 'middle' });
  };

  P.MOLDE.explica = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas;
    const y0 = etiqueta(ctx, lam.palavras[0]);
    const a = P.titulo(ctx, f1, { x: L, y: y0 + 40, w: LW, h: 380 }, { sizes: [100, 92, 84, 76, 68] });
    const b = P.bloco(ctx, f2, { x: L, y: a.y1 + 60, w: 640, h: BOT - a.y1 - 80 }, { sizes: [56, 52, 48, 44] });
    DS.termometro(ctx, 880, Math.min(1110, Math.max(a.y1 + 260, 1000)), 1.5);
    // as três condições sublinhadas a lápis, como quem estuda a definição
    E.linha(ctx, [[L, b.y1 + 26], [L + 520, b.y1 + 30]], { papel: 'alerta', lw: 4, seed: 61 });
  };

  P.MOLDE.colunas = (ctx, lam) => {
    E.fundo(ctx);
    const [ex1, ex2] = lam.linhas, et = lam.palavras[0], cols = lam.palavras.slice(1), meio = Math.ceil(cols.length / 2);
    const y0 = etiqueta(ctx, et);
    [cols.slice(0, meio), cols.slice(meio)].forEach((col, j) => {
      const x = L + j * (LW / 2 + 10), w = LW / 2 - 20;
      anota(ctx, col[0], { x, y: y0 + 20, w, h: 80 }, { rot: -0.015, sizes: [64, 58, 54] });
      E.linha(ctx, [[x, y0 + 112], [x + w * 0.8, y0 + 116]], { lw: 4, seed: 70 + j });
      col.slice(1).forEach((k, i) => {
        const y = y0 + 150 + i * 104;
        E.circulo(ctx, x + 12, y + 34, 9, { papel: 'tinta', hachura: false, contorno: false, seed: 72 + i });
        P.bloco(ctx, k, { x: x + 38, y, w: w - 38, h: 72 }, { sizes: [52, 48, 44, 40], maxLinhas: 1 });
      });
    });
    // os dois exemplos: o que é e o que não é
    const ye = y0 + 150 + 4 * 104 + 60;
    E.linha(ctx, [[L, ye - 24], [R, ye - 20]], { lw: 3, seed: 79, tracejado: true });
    DS.certo(ctx, L + 30, ye + 54, 1.3);
    const a = P.bloco(ctx, ex1, { x: L + 90, y: ye + 10, w: LW - 90, h: 140 }, { sizes: [56, 52, 48, 44], valign: 'middle' });
    DS.errado(ctx, L + 30, a.y1 + 100, 1.2);
    P.bloco(ctx, ex2, { x: L + 90, y: a.y1 + 44, w: LW - 90, h: BOT - a.y1 - 44 }, { sizes: [56, 52, 48, 44], valign: 'top' });
  };

  P.MOLDE.alerta = (ctx, lam) => {
    E.fundo(ctx);
    const [f1] = lam.linhas, [et, ...sinais] = lam.palavras;
    const y0 = etiqueta(ctx, et);
    const a = P.bloco(ctx, f1, { x: L, y: y0 + 30, w: LW, h: 330 }, { papel: 'titulo', sizes: [68, 62, 58, 54, 50], lh: 1.14 });
    const icone = [(c, x, y) => DS.pulmoes(c, x, y, 1.05), (c, x, y) => DS.pulmoes(c, x - 30, y, 0.95, { rapido: true }), (c, x, y) => DS.oximetro(c, x + 20, y, 0.9)];
    const passo = Math.min(230, (BOT - a.y1 - 60) / Math.max(1, sinais.length));
    sinais.forEach((k, i) => {
      const y = a.y1 + 60 + i * passo;
      if (i) E.linha(ctx, [[L, y - 14], [R, y - 10]], { lw: 3, seed: 81 + i, tracejado: true });
      (icone[i] || icone[0])(ctx, L + 110, y + passo / 2 - 10);
      P.bloco(ctx, k, { x: L + 290, y: y + 10, w: LW - 290, h: passo - 40 }, { sizes: [54, 50, 46, 42], valign: 'middle' });
    });
  };

  P.MOLDE.passos = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas, [et, p1, p2] = lam.palavras;
    const y0 = etiqueta(ctx, et);
    const a = P.bloco(ctx, f1, { x: L, y: y0 + 30, w: LW, h: 260 }, { sizes: [56, 52, 48, 44] });
    const yd = a.y1 + 170;
    const d = DS.dias(ctx, L, yd, LW, { alt: 84, gap: 10, faixa: 30 });
    anota(ctx, p1, { x: L, y: yd - 110, w: d.xIso - L, h: 80 }, { rot: -0.02, sizes: [58, 54, 50], align: 'center' });
    anota(ctx, p2, { x: L + 200, y: d.yb + d.hb + 20, w: LW - 200, h: 80 }, { rot: -0.015, sizes: [58, 54, 50], align: 'right' });
    P.bloco(ctx, f2, { x: L, y: d.yb + d.hb + 150, w: LW, h: BOT - (d.yb + d.hb + 150) }, { sizes: [56, 52, 48, 44] });
  };

  P.MOLDE.prevencao = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2, f3] = lam.linhas, [et, ...grupos] = lam.palavras;
    const y0 = etiqueta(ctx, et);
    const a = P.bloco(ctx, f1, { x: L, y: y0 + 30, w: 640, h: 300 }, { papel: 'titulo', sizes: [72, 66, 60, 56], lh: 1.12 });
    DS.seringa(ctx, 850, y0 + 170, 1.0, -0.75);
    const b = P.bloco(ctx, f2, { x: L, y: Math.max(a.y1, y0 + 300) + 50, w: LW, h: 130 }, { sizes: [48, 44, 40] });
    let y = b.y1 + 30;
    grupos.forEach((k, i) => {
      E.circulo(ctx, L + 22, y + 34, 18, { papel: 'marca', hachura: false, contorno: false, seed: 91 + i });
      const r = P.bloco(ctx, k, { x: L + 60, y, w: LW - 60, h: 70 }, { papel: 'mao', sizes: [56, 52, 48], maxLinhas: 1 });
      y += 82;
    });
    E.linha(ctx, [[L, y + 20], [R, y + 24]], { lw: 3, seed: 97, tracejado: true });
    P.bloco(ctx, f3, { x: L, y: y + 50, w: LW, h: BOT - y - 50 }, { sizes: [44, 40, 38, 36] });
  };

  P.MOLDE.resumo = (ctx, lam) => {
    E.fundo(ctx);
    const fr = lam.linhas, [et, fonte] = lam.palavras;
    const y0 = etiqueta(ctx, et);
    const passo = Math.min(260, (BOT - 120 - y0) / Math.max(1, fr.length));
    fr.forEach((k, i) => {
      const y = y0 + 40 + i * passo;
      if (i) E.linha(ctx, [[L, y - 24], [R, y - 20]], { lw: 3, seed: 101 + i });
      P.bloco(ctx, k, { x: L, y, w: LW, h: passo - 50 }, { papel: 'titulo', sizes: [64, 60, 56, 52, 48], lh: 1.12, valign: 'middle' });
    });
    P.fonte(ctx, fonte, { x: L, y: BOT - 76, w: LW, h: 76 }, { cor: 'apoioEscuro', valign: 'bottom' });
  };
})();
