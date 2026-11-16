// PRESEME · carrossel · mapa e dado · OS DESENHOS DA PEÇA (TROQUE: é o que o chat 1 desenha para a doença).
// Cada desenho é PRESEME.DESENHO[nome] = (ctx, caixa, lam, ...mais); o score.js diz qual vai em qual lâmina (desenho:).
// O molde põe o texto e entrega a caixa livre { x, y, w, h }; o desenho cabe nela. Palavra no desenho, só do textos.js
// (as palavras D, que o molde passa em "mais"). Prontos no tipo (film-2-moldes.js, que carrega antes deste): o mapa
// (ajustado pelo SCORE.MAPA: recorte, rótulos, alfinete e municípios marcados) e o troque (o tracejado do lugar vazio,
// que nunca vai para o ar). Peças do kit: PRESEME.KIT (pilulaEm, alfinete, projetor, liso, RAD).
// As lâminas chamam: porque → desenho(ctx, caixa, lam, ...rótulos); sinais e prevencao → desenho(ctx, caixa, lam, i), um
// por cartão. Explique pelo vetor e pelo lugar, nunca pelas pessoas. Exemplo completo de uma peça:
// exemplo-oncocercose/film-3-desenhos.js (o borrachudo sobre o rio, a pele e o olho, a seringa, o calendário e a rosca).
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, TX = globalThis.TEXTOS;
  const DS = P.DESENHO;
  const { liso, pilulaEm } = P.KIT;

  // TROQUE: os desenhos da doença. Molde de um desenho por cartão (lâminas sinais e prevencao chamam com o número):
  // DS.sinal = (ctx, cx, lam, i) => { E.circulo(ctx, cx.x + cx.w / 2, cx.y + cx.h / 2, 80, Object.assign({ papel: 'apoio' }, liso)); };
})();
