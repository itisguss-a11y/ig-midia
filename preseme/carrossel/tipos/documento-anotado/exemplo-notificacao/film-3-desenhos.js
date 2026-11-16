// PRESEME · carrossel DOCUMENTO ANOTADO · desenho 3 · o documento da peça (TROQUE: é a parte que a peça escreve).
// Exemplo: a FICHA DE NOTIFICAÇÃO/CONCLUSÃO do Sinan (Ministério da Saúde, SVS, 27/09/2005, Sinan NET), a ficha cujos campos
// 1 a 30 são os da notificação individual. Desenhada a partir do PDF oficial (NINDIN_FICHA.pdf): as caixas, a ordem, os
// números e as palavras são os do impresso; as medidas são os pontos da folha A4 do PDF (595 × 842), tiradas da posição
// de cada texto no PDF (pdftotext -bbox) e das caixas na imagem dele. O que ficou simplificado está no README do tipo.
// PRESEME.DOC = { W, H, desenhar(ctx, V) }: desenha com as peças de formulário do tipo (PRESEME.FORM), na vista V.
(function () {
  const P = globalThis.PRESEME, F = P.FORM;
  const S = 7.6, SO = 5.6; // a letra das opções: a normal e a miúda (escolaridade, gestante, raça/cor, idade)

  // as caixas: [número, rótulo, x, y, largura, altura, onde o rótulo começa, tamanho do rótulo, linha de base (opcionais)]
  const CAIXAS = [
    [1, 'Tipo de Notificação', 53, 67.7, 512.2, 22.6],
    [2, 'Agravo/doença', 53, 92.5, 380, 23.7],
    [3, 'Data da Notificação', 435.3, 95.5, 129.9, 20.7, 450],
    [4, 'UF', 53, 119.5, 27.2, 24.5, 66.6],
    [5, 'Município de Notificação', 83.5, 120.4, 481.7, 23.6, 97.2],
    [6, 'Unidade de Saúde (ou outra fonte notificadora)', 53, 150.9, 386.5, 21.9],
    [7, 'Data dos Primeiros Sintomas', 441.2, 148.9, 124, 23.9, 453],
    [8, 'Nome do Paciente', 53, 180.3, 383.9, 24.6],
    [9, 'Data de Nascimento', 442.8, 180.3, 122.4, 24.6, 457.6],
    [10, '(ou) Idade', 53, 208.1, 95.9, 26.9, 67.2],
    [11, 'Sexo', 151.2, 208.1, 94.3, 27.5, 165.8],
    [12, 'Gestante', 247.7, 208.1, 197.4, 27.5, 259.6],
    [13, 'Raça/Cor', 448.4, 206.8, 116.8, 28.2, 461.6],
    [14, 'Escolaridade', 53, 235.6, 512.2, 31.5, 65.6],
    [15, 'Número do Cartão SUS', 53, 269.7, 175.1, 25.5, 70.4],
    [16, 'Nome da mãe', 230.4, 269.7, 334.8, 25.5, 245],
    [17, 'UF', 53.7, 301.4, 26.8, 23.6, 66.6],
    [18, 'Município de Residência', 82.5, 301.4, 329.2, 23.6, 95.8],
    [19, 'Distrito', 411.7, 302.7, 154.5, 22.3, 427.6],
    [20, 'Bairro', 53.7, 328.3, 139.4, 20.9, 67.6],
    [21, 'Logradouro (rua, avenida,...)', 194.4, 328.3, 371.1, 22.9, 207.4],
    [22, 'Número', 53.7, 352.1, 54.6, 21.3, 68],
    [23, 'Complemento (apto., casa, ...)', 110.3, 352.1, 298.1, 21.3, 122],
    [24, 'Geo campo 1', 410.4, 352.8, 154.8, 23.9, 423],
    [25, 'Geo campo 2', 53.7, 378, 158.4, 21.6, 67.6],
    [26, 'Ponto de Referência', 214.7, 378.6, 238.6, 22.5, 228.8],
    [27, 'CEP', 455.2, 379.3, 111, 22.9, 470.4],
    [28, '(DDD) Telefone', 53.7, 402.9, 149.2, 23.5, 69],
    [29, 'Zona', 205.2, 402.9, 147.3, 23.5, 218.8, 7.2, 409.6],
    [30, 'País (se residente fora do Brasil)', 355.1, 402.9, 211.1, 23.5, 368.5],
    [31, 'Data da Investigação', 56.3, 450, 116.2, 27.8, 70],
    [32, 'Classificação Final', 176.4, 450, 143.7, 27.8, 190.5],
    [33, 'Critério de Confirmação/Descarte', 323.7, 450, 243.1, 27.8, 337.6],
    [34, 'O caso é autóctone do município de residência?', 55, 490.9, 283.7, 28.5, 69.5],
    [35, 'UF', 341.7, 490.9, 26.8, 27.6, 354.5],
    [36, 'País', 371.5, 492.6, 193.7, 25.1, 386.5],
    [37, 'Município', 55.6, 523, 237.6, 25.2, 67.6],
    [38, 'Distrito', 296.2, 523, 141.7, 24.2, 311.5],
    [39, 'Bairro', 440.5, 523, 124.7, 24.2, 455.5],
    [40, 'Doença Relacionada ao Trabalho', 55, 550.8, 140.1, 24.2, 69.5],
    [41, 'Evolução do Caso', 199, 550.8, 365.2, 24.2, 213],
    [42, 'Data do Óbito', 56.3, 578.6, 118.1, 23.6, 70],
    [43, 'Data do Encerramento', 180, 578.6, 118.1, 23.6, 195.5],
  ];
  // os campos de data (dd mm aaaa)
  const DATAS = [3, 7, 9, 31, 42, 43];
  // os textos soltos: [texto, x, y (linha de base), tamanho, forte]
  const TEXTOS = [
    ['República Federativa do Brasil', 29.3, 35.4, 7.6, true], ['Ministério da Saúde', 47.1, 45.6, 7.6, true],
    ['SINAN', 268.1, 37.6, 11.4, true], ['SISTEMA DE INFORMAÇÃO  DE AGRAVOS DE NOTIFICAÇÃO', 169.5, 48.6, 8],
    ['FICHA DE NOTIFICAÇÃO/CONCLUSÃO', 220.4, 61, 8.6, true], ['Nº', 456.4, 47.8, 9, true],
    ['2 - Individual', 260.4, 81, S], ['Código (CID10)', 377.6, 100.6, S], ['Código (IBGE)', 482.9, 128.4, S], ['Código', 341.3, 156.8, S],
    ['1 - Hora', 122.6, 212.6, SO], ['2 - Dia', 122.6, 219.3, SO], ['3 - Mês', 122.6, 226, SO], ['4 - Ano', 122.6, 232.7, SO],
    ['M - Masculino', 184.6, 217.4, 6.2], ['F - Feminino', 185.6, 223.4, 6.2], ['I - Ignorado', 186.3, 229.9, 6.2],
    ['1-1ºTrimestre', 264.3, 221.2, SO], ['2-2ºTrimestre', 306.8, 221.2, SO], ['3-3ºTrimestre', 355.1, 221.2, SO],
    ['4- Idade gestacional Ignorada', 264.2, 227.3, SO], ['5-Não', 350.7, 227.3, SO], ['6- Não se aplica', 377.1, 227.3, SO], ['9-Ignorado', 264.2, 234, SO],
    ['1-Branca', 453.3, 227, SO], ['2-Preta', 486.1, 227, SO], ['3-Amarela', 520.8, 227, SO],
    ['4-Parda', 453.3, 233.7, SO], ['5-Indígena', 486.5, 233.7, SO], ['9- Ignorado', 521.2, 233.7, SO],
    ['Código (IBGE)', 329.9, 308.4, S], ['Código', 480.6, 334.8, S], ['-', 523.6, 398.6, S],
    ['1 - Urbana', 237.9, 414.4, S], ['2 - Rural', 286.4, 414.4, S], ['3 - Periurbana 9 - Ignorado', 237.6, 423.6, S],
    ['1 - Confirmado', 231.5, 465.7, S], ['2 - Descartado', 231.5, 474.6, S],
    ['1 - Laboratorial', 350.6, 472, S], ['2 - Clínico-Epidemiológico', 431, 472, S],
    ['Local Provável da Fonte de Infecção', 55.4, 487.1, 8.6, true], ['1-Sim  2-Não  3-Indeterminado', 121.6, 513.3, S],
    ['Código (IBGE)', 216.6, 531.2, S], ['1 - Sim  2 - Não  9 - Ignorado', 58.7, 570.6, S],
    ['1 - Cura', 220.5, 569.7, S], ['2 - Óbito pelo agravo notificado', 262.6, 569.7, S], ['3 - Óbito por outras causas', 386.9, 569.7, S], ['9 - Ignorado', 496.6, 569.7, S],
    ['Observações adicionais', 37, 638.4, 8.6, true],
    ['Município/Unidade de Saúde', 59.5, 753.6, S], ['Cód. da Unid. de Saúde', 478.6, 753.9, S],
    ['Nome', 60.2, 784.6, S], ['Função', 268.3, 786.3, S], ['Assinatura', 478.8, 787.8, S],
    ['Notificação/conclusão', 56.7, 812.4, S], ['Sinan NET', 284.1, 811.6, S], ['SVS', 474.1, 812, S], ['27/09/2005', 507.9, 812, S],
  ];
  // a escolaridade, opção por opção, onde cada uma começa no impresso
  const ESCOLA = [
    ['0-Analfabeto', 64.5, 248.1, 41], ['1-1ª a 4ª série incompleta do EF (antigo primário ou 1º grau)', 107, 248.1, 165], ['2-4ª série completa do EF (antigo primário ou 1º grau)', 274.9, 248.1, 150],
    ['3-5ª à 8ª série incompleta do EF (antigo ginásio ou 1º grau)', 64.5, 254.8, 162], ['4-Ensino fundamental completo (antigo ginásio ou 1º grau)', 229.7, 254.8, 162], ['5-Ensino médio incompleto (antigo colegial  ou 2º grau )', 395, 254.8, 150],
    ['6-Ensino médio completo (antigo colegial  ou 2º grau )', 64.5, 261.5, 147], ['7-Educação superior incompleta', 214.4, 261.5, 92], ['8-Educação superior completa', 308.9, 261.5, 88], ['9-Ignorado', 398.6, 261.5, 33], ['10- Não se aplica', 433, 261.5, 50],
  ];
  // os quadradinhos de resposta: [x, y, largura, altura]
  const QUADRADOS = [[109, 216, 10.8, 10.5], [231.4, 209.5, 11.1, 10.5], [426.1, 209.5, 11.1, 10.5], [551.1, 210, 11.2, 10.6], [551.8, 239.6, 11.2, 10.4],
    [333.2, 405.2, 11.1, 10.5], [300.1, 450.3, 10.8, 9.8], [534.8, 451.3, 11.1, 10.8], [301.7, 497.2, 11.2, 10.4], [178, 562.5, 10.8, 10.5], [548.5, 554.9, 10.8, 10.5]];
  // as casas de dígito (risquinhos no pé da caixa): [lista de x, y do pé]
  const CASAS = [
    [[491.9, 506.6, 520.4, 535.4, 550.1], 143.6], [[349, 363.4, 377.9, 392.4, 406.8, 421.3], 172.4], [[75.3, 88.7], 234.6],
    [Array.from({ length: 15 }, (_, i) => 62 + i * 11.63), 294.8], [[337.6, 352.1, 366.6, 381, 395.5], 324.6],
    [[492.5, 506.9, 521.3, 535.7, 550.8], 350.8], [[469, 483.4, 497.8, 512.2, 537.4, 551.8], 401.8],
    [[67.7, 81.5, 96.5, 110.9, 125.3, 139.7, 154.1, 168.5, 182.9], 426], [[217.6, 232.4, 247.1, 261.5, 275.9], 547.8],
    [[479.8, 494.2, 508.6, 523.3, 537.7, 552.1], 774.2],
  ];
  // os separadores de "Código" dentro das caixas: [x, y de cima, y de baixo]
  const SEPARA = [[376.4, 97, 116.2], [478.8, 123, 144], [337.1, 153, 172.8], [326, 304, 325], [479.4, 331, 351.2], [204.2, 527, 548.2]];
  // as áreas sombreadas do impresso (o cinza das UF e do código da unidade)
  const SOMBRAS = [[54, 132.5, 25.5, 11.5], [54.5, 312.9, 25.5, 12.1], [342.5, 509.9, 25.5, 8.6], [467, 762.6, 98.5, 12]];
  // as faixas dos blocos, em pé: [x, y, largura, altura, nome]
  const FAIXAS = [[30.4, 66.1, 19.3, 110, 'Dados Gerais'], [30.4, 179.3, 19.3, 117.9, 'Notificação Individual'],
    [29.5, 299.1, 19.6, 128.3, 'Dados de Residência'], [30.1, 448.4, 20.6, 153.8, 'Conclusão'], [29.5, 746.2, 20.2, 57.2, 'Investigador']];
  // as caixas sem número (o investigador)
  const SEM_NUMERO = [[53, 746.8, 411.1, 27.8], [466.4, 746.8, 99.8, 27.8], [55, 783.8, 195.7, 20], [254.6, 783.8, 209.5, 20], [465.1, 785, 101.1, 18.8]];

  function desenhar(ctx, V) {
    // o cabeçalho: o quadro cinza do Nº
    F.sombra(ctx, V, 453.6, 31.4, 111.5, 21.8);
    for (const [n, rot, x, y, w, h, rx, size, ry] of CAIXAS) F.caixa(ctx, V, x, y, w, h, { n, rotulo: rot, rx, size, ry });
    for (const n of DATAS) { const c = CAIXAS.find((q) => q[0] === n); F.data(ctx, V, c[2], c[3], c[4], c[5]); }
    for (const [xs, y] of CASAS) F.casas(ctx, V, xs, y);
    for (const [x, y0, y1] of SEPARA) F.separa(ctx, V, x, y0, y1);
    for (const [x, y, w, h] of SOMBRAS) F.sombra(ctx, V, x, y, w, h);
    for (const [x, y, w, h] of QUADRADOS) F.quadrado(ctx, V, x, y, w, h);
    for (const [x, y, w, h, s] of FAIXAS) F.faixa(ctx, V, x, y, w, h, s);
    for (const [x, y, w, h] of SEM_NUMERO) F.caixa(ctx, V, x, y, w, h, {});
    // as risquinhos das UF (um no meio da área cinza)
    F.casas(ctx, V, [66.6], 143.6); F.casas(ctx, V, [66.6], 324.6); F.casas(ctx, V, [355], 518.2);
    // as barras das partes e o quadro das observações, com as linhas de escrever
    F.barra(ctx, V, 28.8, 430.7, 538, 14.7, 'Conclusão', { size: 11 });
    F.barra(ctx, V, 28.8, 606.1, 538, 14.1, 'Informações complementares e observações', { cheia: true, size: 10.5 });
    F.caixa(ctx, V, 29.5, 623.4, 531.4, 119.5, { fechada: true });
    for (const y of [646.6, 660.4, 674.1, 687.8, 701.6, 715.3, 729.1]) F.linha(ctx, V, [[29.5, y], [560.9, y]], { u: 0.5, seed: Math.round(y) });
    for (const [s, x, y, size, forte] of TEXTOS) F.texto(ctx, V, s, x, y, { size, forte });
    for (const [s, x, y, maxw] of ESCOLA) F.texto(ctx, V, s, x, y, { size: SO, maxw });
  }

  P.DOC = { W: 595.3, H: 841.9, desenhar };
})();
