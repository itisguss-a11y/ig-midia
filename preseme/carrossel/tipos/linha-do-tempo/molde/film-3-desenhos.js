// PRESEME · carrossel · linha do tempo · OS DESENHOS DA PEÇA (TROQUE: é o que o chat 1 desenha para o assunto).
// Cada desenho é PRESEME.DESENHO[nome] = (ctx, caixa, lam, palavras); o score.js diz qual vai em qual lâmina (desenho:).
// O molde põe o texto, a linha e o ano, e entrega a caixa livre { x, y, w, h }; o desenho cabe nela. Palavra no desenho,
// só do textos.js (as palavras D da lâmina, que o molde passa em "palavras"); fixo, só o que vem impresso no objeto,
// dentro de G.decor. Pronto no tipo (film-2-moldes.js, que carrega antes deste): linhaInteira (a da lâmina hoje) e troque
// (o tracejado do lugar vazio, que nunca vai para o ar). A cena do fim da linha inteira é DS.fimDaLinha, se a peça fizer.
// Peças para montar os desenhos: PRESEME.KIT (documento, livro, predio, cruz, pessoa e GENTE, multidao, calendario, cabe,
// liso, decor). Gente: KIT.pessoa (cinco roupas variadas) ou E.personagem (calouro, moradora, agente). Exemplo completo:
// exemplo-nascimento-do-sus/film-3-desenhos.js (a fila da UBS, a porta da previdência, a Constituição, a lei vetada, o
// conselho e o fim da linha).
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, TX = globalThis.TEXTOS;
  const DS = P.DESENHO;
  const { liso, documento, livro, predio, pessoa, multidao } = P.KIT;

  // TROQUE: os desenhos do assunto. Molde de um desenho com palavra do textos.txt (palavras são as D da lâmina):
  // DS.lei = (ctx, cx, lam, pal = []) => { documento(ctx, cx.x + 200, cx.y, 520, cx.h, { titulo: TX[pal[0]], riscar: [2] }); };
  // DS.fimDaLinha = (ctx, cx) => { pessoa(ctx, cx.x + cx.w / 2, cx.y + cx.h - 10, 0.5, { i: 4 }); };
})();
