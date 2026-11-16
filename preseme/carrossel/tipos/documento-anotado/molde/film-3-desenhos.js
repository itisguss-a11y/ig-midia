// PRESEME · carrossel DOCUMENTO ANOTADO · desenho 3 · o documento da peça (TROQUE: é a parte que a peça escreve).
// PRESEME.DOC = { W, H, desenhar(ctx, V) }: o documento inteiro, desenhado com as peças de formulário do tipo
// (PRESEME.FORM, em film-2-moldes.js), nas unidades do próprio documento. Regra dele: o documento parte do modelo oficial
// lido, nunca da memória ("pra você não fazer uma caderneta de vacinação em que os campos e as coisas escritas são
// diferentes daqueles da vida real"): as caixas, a ordem, os números e as palavras são as do impresso. O jeito mais fiel:
// baixar o PDF oficial, tirar a posição de cada texto (pdftotext -bbox-layout) e das caixas (a imagem do PDF), e usar os
// pontos da folha como unidade (A4: 595 × 842). Exemplo inteiro: exemplo-notificacao/film-3-desenhos.js (a ficha do Sinan).
// As peças (todas recebem ctx, V e as medidas no documento):
//   F.caixa(ctx, V, x, y, w, h, { n, rotulo, rx, ry, size, fechada })   a caixa do campo, com o número no quadradinho
//   F.texto(ctx, V, 'texto', x, y, { size, forte, align, maxw })        texto impresso (y é a linha de base)
//   F.data(ctx, V, x, y, w, h)                                         as casas de data (dd mm aaaa) dentro da caixa
//   F.casas(ctx, V, [x...], yPe, { altas })                            risquinhos de dígito no pé da caixa
//   F.quadrado, F.separa, F.sombra, F.faixa (o bloco em pé), F.barra (a barra de uma parte), F.linha
(function () {
  const P = globalThis.PRESEME, F = P.FORM;
  // TROQUE: este é um formulário de mentira, só para o molde montar. Folha A5 (420 × 594 pontos).
  function desenhar(ctx, V) {
    F.texto(ctx, V, 'TROQUE: o cabeçalho do documento', 210, 34, { size: 10, forte: true, align: 'center' });
    F.texto(ctx, V, 'o órgão, o sistema e o nome do documento, como no impresso', 210, 48, { size: 7.6, align: 'center' });
    F.faixa(ctx, V, 14, 64, 16, 150, 'Bloco do exemplo');
    F.caixa(ctx, V, 36, 64, 368, 26, { n: 1, rotulo: 'Primeiro campo' });
    F.caixa(ctx, V, 36, 96, 180, 26, { n: 2, rotulo: 'Segundo campo' });
    F.caixa(ctx, V, 222, 96, 182, 26, { n: 3, rotulo: 'Data do terceiro campo' }); F.data(ctx, V, 222, 96, 182, 26);
    F.caixa(ctx, V, 36, 128, 368, 30, { n: 4, rotulo: 'Quarto campo' });
    F.texto(ctx, V, '1 - Sim   2 - Não   9 - Ignorado', 60, 152, { size: 7.6 }); F.quadrado(ctx, V, 388, 132, 11, 10.5);
    F.caixa(ctx, V, 36, 164, 150, 24, { n: 5, rotulo: 'Quinto campo' });
    F.caixa(ctx, V, 190, 164, 120, 24, { n: 6, rotulo: 'Sexto campo' });
    F.caixa(ctx, V, 314, 164, 90, 24, { n: 7, rotulo: 'Sétimo' });
    F.barra(ctx, V, 14, 228, 390, 14, 'Outra parte do documento', { cheia: true });
    F.caixa(ctx, V, 14, 248, 390, 120, { fechada: true });
    for (const y of [270, 290, 310, 330, 350]) F.linha(ctx, V, [[14, y], [404, y]], { u: 0.5, seed: y });
  }
  P.DOC = { W: 420, H: 594, desenhar };
})();
