// PRESEME · carrossel · guia de bolso · OS DESENHOS DA PEÇA (TROQUE: é o que o chat 1 desenha para o assunto).
// Cada desenho é PRESEME.DESENHO[nome] = (ctx, caixa, lam, ...mais); o score.js diz qual vai em qual lâmina (desenho:).
// O molde põe o texto e entrega a caixa livre { x, y, w, h }; o desenho cabe nela. Palavra no desenho, só do textos.js
// (as palavras D, que o molde passa em "mais"); fixo, só o que vem impresso no objeto, dentro de G.decor.
// Prontos no kit do guia (film-2-moldes.js, que carrega antes deste): as cenas visita, espera, equipe e telefone, e o
// troque (o tracejado do lugar vazio, que nunca vai para o ar). Qualquer uma pode ser trocada aqui com o mesmo nome.
// Peças pequenas para montar os desenhos: PRESEME.KIT (copo, relogio, cadeira, rosto, gota, lupa, volta, icone, arco,
// decor, liso). Gente: E.personagem (calouro, moradora, agente). Exemplo completo de uma peça:
// exemplo-glicemia/film-3-desenhos.js (a régua do número, os seis sinais, as quatro opções, o aparelho, o prato e o erro).
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, TX = globalThis.TEXTOS;
  const DS = P.DESENHO;
  const { liso, icone, copo, relogio, gota } = P.KIT;

  // TROQUE: os desenhos do assunto. Molde de um ícone por item (lâminas sinais e opcoes chamam com o número do item):
  // DS.sinal = (ctx, cx, lam, i) => icone(ctx, cx, () => { if (i === 0) gota(ctx, 0, 30, 40, { papel: 'apoio' }); });
  // Molde de desenho com palavra do textos.txt (marcas são as palavras D da lâmina, depois da etiqueta):
  // DS.regua = (ctx, cx, lam, marcas = []) => { E.texto(ctx, TX[marcas[0]], cx.x, cx.y + 60, { papel: 'numero', size: 60 }); };
})();
