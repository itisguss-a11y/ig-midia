// PRESEME · carrossel · tipo MACETE PARA A PROVA · desenho 3 · os desenhos do assunto (TROQUE: é da peça, o chat 1 faz).
// Um desenho por peça do macete (o que explica a letra), um para a pegadinha (o que compara as duas coisas que a prova
// confunde) e, se quiser, um para a capa. Cada um: PRESEME.DESENHO[nome] = (ctx, caixa, lam, palavras) => { ... }, com
// o nome que o score.js dá em MACETE[].desenho, PEGADINHA.desenho ou CAPA.desenho. caixa = { x, y, w, h }, o espaço
// livre da lâmina; palavras = as 'Dnn' da lâmina que o desenho escreve (todo texto da tela vem do textos.txt).
// Use a biblioteca (const B = globalThis.BIB: B.pessoa, B.ubsIcone, B.mapaRR, B.cartaoVacina...; a lista em
// motor/estilos/BIBLIOTECA.md) e o kit do tipo (PRESEME.KIT: ficha, certo, errado). Desenho que não explica não entra.
(function () {
  const P = globalThis.PRESEME, DS = P.DESENHO;
  // exemplo vazio: DS.meudesenho = (ctx, cx, lam, palavras) => { const B = globalThis.BIB; ... };
})();
