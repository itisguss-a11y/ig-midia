// PRESEME · carrossel · perguntas e respostas · OS DESENHOS DA PEÇA (TROQUE: é o que o chat 1 desenha para o assunto).
// Cada desenho é PRESEME.DESENHO[nome] = (ctx, caixa, lam, palavras); o score.js diz qual vai em qual lâmina (desenho:).
// O molde põe a dúvida, a resposta e o detalhe, e entrega a caixa livre { x, y, w, h }; o desenho cabe nela e explica a
// resposta (sem desenho que explique, a dúvida não entra: uma lâmina só de frase não ensina). Palavra no desenho, só do
// textos.js (as palavras D da lâmina, que o molde passa em "palavras"); fixo, só o que vem impresso no objeto, dentro de
// G.decor. Pronto no tipo (film-2-moldes.js, que carrega antes deste): o troque (o tracejado do lugar vazio, que nunca vai
// para o ar). Peças para montar: PRESEME.KIT (rosto, frasco com o monitor de calor, termometro com faixa e marcas, certo,
// errado, cabe, liso, decor). Gente: E.personagem (calouro, moradora, agente). Exemplo completo:
// exemplo-vacina-e-frio/film-3-desenhos.js (o termômetro da faixa, as paradas da rede de frio, a câmara com o alarme e o
// monitor do frasco).
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, TX = globalThis.TEXTOS;
  const DS = P.DESENHO;
  const { liso, frasco, termometro, certo, errado } = P.KIT;

  // TROQUE: os desenhos do assunto. Molde de um desenho com palavra do textos.txt (palavras são as D da lâmina):
  // DS.faixa = (ctx, cx, lam, pal = []) => { termometro(ctx, cx.x + 200, cx.y + 30, cx.y + cx.h - 80, { faixa: [2, 8], marcas: [{ v: 8, texto: TX[pal[0]] }] }); };
})();
