// PRESEME · carrossel · tipo MITO OU VERDADE · os moldes de lâmina (estilo padrão: carimbo e gravura).
// A frase que todo mundo repete entra num balão e o carimbo bate MITO, VERDADE ou DEPENDE; a lâmina seguinte mostra o
// porquê desenhado (veredito sem porquê é a peça rasa que ele reprovou); o fecho junta tudo numa regra.
// Este arquivo é do tipo e não muda de peça para peça. O desenho de cada lâmina vem da peça, em film-2-desenhos.js:
// PRESEME.DESENHO.cena[id da lâmina](ctx, caixa, lam) e, nas lâminas de passos, PRESEME.DESENHO.passo[id] (um desenho
// por item). Lâmina sem desenho da peça sai só com o texto. Desenho parado.
// Tipos de lâmina (o score.js diz qual lâmina usa qual; em toda lâmina, a primeira palavra D é a etiqueta):
//   capa:    [título], [promessa] + D etiqueta (o nome do tipo)                     · desenho da peça embaixo
//   dado:    [o fato do número], [o número em frase], [o que o número quer dizer] + D etiqueta, D fonte e os pares
//            nome e valor das barras (D nome, D valor, D nome, D valor...); a primeira barra é a da peça (destaque)
//   frase:   [a frase que todo mundo repete, entre aspas] + D veredito (MITO, VERDADE ou DEPENDE)  · desenho da cena
//   porque:  [o veredito explicado], [a frase de baixo] + D etiqueta, D veredito (repete o carimbo, pequeno)
//   passos:  [o título], [a linha de mão] + D etiqueta e até 5 itens (D), cada um com o desenho dele
//   regra:   até 3 frases, a palavra-chave de cada uma no destaque + D etiqueta e D fontes (cartão escuro)
(function () {
  const G = globalThis.G, E = globalThis.ESTILOS, P = globalThis.PRESEME, TX = globalThis.TEXTOS, DS = P.DESENHO;
  const { L, R, TOP, BOT } = P;
  const LW = R - L;
  DS.cena = DS.cena || {};
  DS.passo = DS.passo || {};
  const cena = (ctx, lam, box) => { const f = DS.cena[lam.id]; if (f && box.h > 40) f(ctx, box, lam); };

  // a etiqueta da lâmina: a palavra em caixa alta, com um fio embaixo (em cima à esquerda, longe do contador 1/8)
  function etiqueta(ctx, k, y = TOP - 6, o = {}) {
    if (!TX[k]) return y;
    const s = TX[k].toUpperCase(), z = 34;
    E.texto(ctx, s, L, y + 36, { papel: 'corpo', size: z, cor: o.cor || 'texto' });
    const w = E.medir(ctx, s, { papel: 'corpo', size: z });
    E.linha(ctx, [[L, y + 54], [L + w, y + 56]], { papel: o.fio || 'alerta', lw: 4, seed: 3 });
    return y + 92;
  }
  // o carimbo do veredito: Coral no MITO, Folha na VERDADE, Floresta no DEPENDE (a letra é sempre a cor do texto)
  const SELO = { MITO: 'alerta', VERDADE: 'apoioEscuro', DEPENDE: 'tinta' };
  // (x, y) é o centro pedido; o selo largo (VERDADE) chega para a esquerda até caber antes da margem
  function selo(ctx, k, x, y, size = 96, rot = -0.14) {
    const s = (TX[k] || '').trim().toUpperCase();
    if (!s) return;
    const w = E.medir(ctx, s, { papel: 'titulo', size }) + 70;
    E.carimbo(ctx, s, Math.min(x, R - 10 - w / 2), y, { papel: SELO[s] || 'alerta', size, rot, seed: 23 + s.length });
  }

  P.MOLDE.capa = (ctx, lam) => {
    E.fundo(ctx);
    const [t1, t2] = lam.linhas, [et] = lam.palavras;
    const y0 = etiqueta(ctx, et);
    const a = P.titulo(ctx, t1, { x: L, y: y0 + 10, w: LW, h: 560 }, { sizes: [124, 116, 108, 100, 92, 84] });
    const b = t2 ? P.bloco(ctx, t2, { x: L, y: a.y1 + 34, w: LW * 0.92, h: 190 }, { sizes: [50, 46, 42, 40] }) : a;
    cena(ctx, lam, { x: L, y: b.y1 + 30, w: LW, h: BOT - b.y1 - 30 });
  };

  P.MOLDE.dado = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2, f3] = lam.linhas, [et, fonte, ...pares] = lam.palavras;
    const y0 = etiqueta(ctx, et);
    const a = P.bloco(ctx, f1, { x: L, y: y0 + 4, w: LW, h: 250 }, { papel: 'titulo', sizes: [70, 64, 60, 56, 52], lh: 1.1 });
    const b = f2 ? P.bloco(ctx, f2, { x: L, y: a.y1 + 24, w: LW, h: 140 }, { sizes: [46, 42, 40, 38] }) : a;
    const itens = [];
    for (let i = 0; i + 1 < pares.length; i += 2) itens.push([pares[i], pares[i + 1]]);
    const num = (k) => parseFloat(String(TX[k] || '0').replace(/\./g, '').replace(',', '.')) || 0;
    const max = Math.max(1, ...itens.map(([, v]) => num(v)));
    const hb = 76, gap = 30, wl = 270, xb = L + wl, wbar = LW - wl - 150, yb = b.y1 + 54;
    itens.forEach(([n, v], i) => {
      const y = yb + i * (hb + gap), w = Math.max(30, (wbar * num(v)) / max);
      P.bloco(ctx, n, { x: L, y: y + 6, w: wl - 24, h: hb - 12 }, { sizes: [38, 34, 30], valign: 'middle', maxLinhas: 2, lh: 1.05 });
      E.ret(ctx, xb, y, w, hb, { papel: i === 0 ? 'destaque' : E.cor('apoio') === E.cor('fundo') ? 'apoioEscuro' : 'apoio', r: 10, seed: 140 + i });
      E.texto(ctx, TX[v] || '', xb + w + 18, y + hb / 2 + 16, { papel: 'numero', size: 46 });
    });
    const yf = yb + itens.length * (hb + gap) + 14;
    if (f3) P.bloco(ctx, f3, { x: L, y: yf, w: LW, h: BOT - 96 - yf }, { sizes: [42, 40, 38, 36], valign: 'middle' });
    P.fonte(ctx, fonte, { x: L, y: BOT - 76, w: LW, h: 76 }, { cor: E.escuro() ? 'salvia' : 'apoioEscuro', valign: 'bottom' });
  };

  P.MOLDE.frase = (ctx, lam) => {
    E.fundo(ctx);
    const [f1] = lam.linhas, [vered] = lam.palavras;
    // o balão da frase que todo mundo repete, com a ponta embaixo à esquerda
    const bx = L, by = TOP + 20, bw = LW, bh = 400;
    E.poligono(ctx, [[bx + 120, by + bh - 20], [bx + 96, by + bh + 92], [bx + 250, by + bh - 20]], { papel: 'superficie', seed: 151, sombra: false });
    E.ret(ctx, bx, by, bw, bh, { papel: 'superficie', r: 40, seed: 150, sombra: true });
    E.poligono(ctx, [[bx + 128, by + bh - 30], [bx + 112, by + bh + 52], [bx + 238, by + bh - 30]], { papel: 'superficie', contorno: false, hachura: false, seed: 152, sombra: false });
    P.bloco(ctx, f1, { x: bx + 60, y: by + 56, w: bw - 120, h: bh - 112 }, { papel: 'titulo', sizes: [88, 80, 74, 68, 62, 56], valign: 'middle', lh: 1.08 });
    cena(ctx, lam, { x: L, y: by + bh + 110, w: LW, h: BOT - (by + bh + 110) });
    selo(ctx, vered, R - 200, by + bh + 4, 96, -0.16);
  };

  P.MOLDE.porque = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas, [et, vered] = lam.palavras;
    const y0 = etiqueta(ctx, et);
    if (vered) selo(ctx, vered, R - 130, TOP + 34, 40, -0.1);
    const a = P.bloco(ctx, f1, { x: L, y: y0 + 4, w: LW, h: 300 }, { papel: 'titulo', sizes: [62, 58, 54, 50, 46], lh: 1.12 });
    const hb = f2 ? 250 : 0;
    cena(ctx, lam, { x: L, y: a.y1 + 34, w: LW, h: BOT - a.y1 - 34 - hb - 20 });
    if (f2) P.bloco(ctx, f2, { x: L, y: BOT - hb, w: LW, h: hb }, { sizes: [46, 42, 40, 38, 36], valign: 'bottom' });
  };

  P.MOLDE.passos = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas, [et, ...itens] = lam.palavras;
    const y0 = etiqueta(ctx, et);
    const a = P.bloco(ctx, f1, { x: L, y: y0 + 4, w: LW, h: 220 }, { papel: 'titulo', sizes: [58, 54, 50, 46], lh: 1.12 });
    const b = f2 ? P.bloco(ctx, f2, { x: L, y: a.y1 + 28, w: LW, h: 84 }, { papel: 'mao', sizes: [54, 50, 46, 42], maxLinhas: 1 }) : a;
    const n = Math.max(1, itens.length), gap = 20, top = b.y1 + 36, h = Math.min(190, (BOT - top - gap * (n - 1)) / n);
    const desenhos = DS.passo[lam.id] || [];
    itens.forEach((k, i) => {
      const y = top + i * (h + gap);
      E.ret(ctx, L, y, LW, h, { papel: 'superficie', r: 24, seed: 160 + i });
      E.circulo(ctx, L + 58, y + h / 2, 34, { papel: 'destaque', hachura: false, seed: 170 + i });
      G.decor(() => E.texto(ctx, String(i + 1), L + 58, y + h / 2 + 16, { papel: 'numero', size: 46, align: 'center' }));
      if (desenhos[i]) desenhos[i](ctx, R - 112, y + h / 2, Math.min(1, h / 180));
      P.bloco(ctx, k, { x: L + 122, y: y + 14, w: LW - 122 - 220, h: h - 28 }, { sizes: [48, 44, 40, 36], valign: 'middle' });
    });
  };

  P.MOLDE.regra = (ctx, lam) => {
    E.fundo(ctx, { tipo: 'escuro' });
    const fr = lam.linhas, [et, fonte] = lam.palavras;
    const y0 = etiqueta(ctx, et, TOP - 6, { cor: 'papel', fio: 'marca' });
    const passo = Math.min(300, (BOT - 130 - y0) / Math.max(1, fr.length));
    fr.forEach((k, i) => {
      const y = y0 + 30 + i * passo;
      if (i) E.linha(ctx, [[L, y - 26], [R, y - 22]], { papel: 'salvia', lw: 3, seed: 101 + i, tracejado: true });
      P.bloco(ctx, k, { x: L, y, w: LW, h: passo - 54 }, { papel: 'titulo', sizes: [70, 64, 60, 56, 52, 48], lh: 1.1, valign: 'middle', cor: 'papel', corTrecho: 'marca' });
    });
    P.fonte(ctx, fonte, { x: L, y: BOT - 80, w: LW, h: 80 }, { cor: 'salvia', valign: 'bottom' });
  };
})();
