// PRESEME · carrossel · tipo LISTA · desenho 3 · os desenhos do assunto (TROQUE: é da peça, o chat 1 faz).
// Um desenho por item da lista (o que mostra o item funcionando) e, se quiser, um para a capa. Cada um:
// PRESEME.DESENHO[nome] = (ctx, caixa, lam, palavras) => { ... }, com o nome que o score.js dá em LISTA[].desenho ou
// CAPA.desenho. caixa = { x, y, w, h }, o espaço livre da lâmina; palavras = as 'Dnn' da lâmina que o desenho escreve
// (todo texto da tela vem do textos.txt). Use a biblioteca (const B = globalThis.BIB: B.pessoa com pose: 'stand' para
// ficar em pé, B.ubsIcone, B.relogio, B.celular...; a lista em motor/estilos/BIBLIOTECA.md) e o kit do tipo
// (PRESEME.KIT: certo, errado, numero). Desenho que não explica não entra.
(function () {
  const P = globalThis.PRESEME, DS = P.DESENHO;
  // exemplo vazio: DS.meudesenho = (ctx, cx, lam, palavras) => { const B = globalThis.BIB; ... };
})();
