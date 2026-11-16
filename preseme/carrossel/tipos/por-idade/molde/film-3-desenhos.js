// PRESEME · carrossel · tipo POR IDADE · desenho 3 · os ícones da peça (TROQUE: é da peça, o chat 1 faz).
// O kit do tipo já traz os ícones 'exame' (a prancheta), 'vacina' (a seringa), 'consulta' (a UBS), 'conversa' (o
// balão), 'calendario' e 'nenhum'. Ícone novo, para uma oferta que nenhum deles mostra: PRESEME.ICONE[nome] =
// (ctx, x, y, t) => { ... }, com o nome que o score.js dá em FAIXAS[].oferta[].icone; x, y é o centro e t o tamanho
// (o cartão dá até 150). Use a biblioteca (const B = globalThis.BIB; a lista em motor/estilos/BIBLIOTECA.md) e o kit
// de estilos (E.ret, E.circulo, E.linha). Nenhum ícone escreve palavra: o texto do cartão vem do textos.txt.
(function () {
  const P = globalThis.PRESEME;
  P.ICONE = P.ICONE || {};
  // exemplo vazio: P.ICONE.meuicone = (ctx, x, y, t) => { const B = globalThis.BIB; ... };
})();
