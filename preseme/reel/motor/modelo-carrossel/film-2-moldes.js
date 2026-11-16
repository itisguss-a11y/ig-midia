// PRESEME · carrossel · desenho 2 · os moldes de lâmina (modelo do motor: troque pelo desenho da peça ou use um molde de
// série). Um molde por tipo de lâmina do score.js: PRESEME.MOLDE[tipo] = (ctx, lam) => { ... }. lam.n = o número da
// lâmina, lam.linhas = as frases dela, lam.palavras = as palavras do desenho. Desenho parado: nada depende do tempo.
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, TX = globalThis.TEXTOS;
  const { L, R, CX, TOP, BOT, W, H } = P;
  const larguraUtil = R - L;

  // capa: o título inteiro [01] e a promessa [02], com o desenho principal embaixo
  P.MOLDE.capa = (ctx, lam) => {
    E.fundo(ctx, { tipo: 'escuro' });
    const [a, b] = lam.linhas;
    const t = P.titulo(ctx, a, { x: L, y: TOP + 40, w: larguraUtil, h: 520 }, { cor: 'papel' });
    if (b) P.bloco(ctx, b, { x: L, y: t.y1 + 48, w: larguraUtil, h: 260 }, { cor: 'salvia', sizes: [52, 48, 44] });
  };
  // texto: a ideia em uma frase grande e o detalhe embaixo
  P.MOLDE.texto = (ctx, lam) => {
    E.fundo(ctx);
    const [a, b] = lam.linhas;
    const t = P.bloco(ctx, a, { x: L, y: TOP + 60, w: larguraUtil, h: 420 }, { papel: 'titulo', sizes: [72, 66, 60, 56] });
    if (b) P.bloco(ctx, b, { x: L, y: t.y1 + 56, w: larguraUtil, h: BOT - t.y1 - 56 });
  };
  // lista: um título e os itens (palavras do desenho), cada um num cartão
  P.MOLDE.lista = (ctx, lam) => {
    E.fundo(ctx);
    const t = P.bloco(ctx, lam.linhas[0], { x: L, y: TOP + 40, w: larguraUtil, h: 240 }, { papel: 'titulo', sizes: [64, 58, 52] });
    const itens = lam.palavras, gap = 28, h = Math.min(170, (BOT - t.y1 - 60 - gap * (itens.length - 1)) / Math.max(1, itens.length));
    itens.forEach((k, i) => {
      const y = t.y1 + 60 + i * (h + gap);
      E.ret(ctx, L, y, larguraUtil, h, { papel: 'superficie', r: 18, seed: 40 + i });
      P.bloco(ctx, k, { x: L + 40, y: y + 20, w: larguraUtil - 80, h: h - 40 }, { valign: 'middle', sizes: [52, 46, 40] });
    });
  };
  // numero: o número grande (palavra do desenho) e a frase que diz o que ele é
  P.MOLDE.numero = (ctx, lam) => {
    E.fundo(ctx);
    const n = P.bloco(ctx, lam.palavras[0], { x: L, y: TOP + 80, w: larguraUtil, h: 380 }, { papel: 'numero', sizes: [260, 220, 180, 150], align: 'center' });
    P.bloco(ctx, lam.linhas[0], { x: L, y: n.y1 + 60, w: larguraUtil, h: BOT - n.y1 - 60 }, { align: 'center', sizes: [56, 50, 46, 42] });
  };
  // fecho: o resumo para guardar e a fonte no rodapé
  P.MOLDE.fecho = (ctx, lam) => {
    E.fundo(ctx);
    const [a, b] = lam.linhas;
    P.titulo(ctx, a, { x: L, y: TOP + 80, w: larguraUtil, h: 640 }, { sizes: [84, 76, 68, 60] });
    if (b) P.fonte(ctx, b, { x: L, y: BOT - 80, w: larguraUtil, h: 80 }, { valign: 'bottom' });
  };
})();
