// PRESEME · carrossel · tipo POR IDADE · desenho 3 · os ícones da peça (exemplo: rastreamento de câncer na mulher).
// Dois ícones que o kit não tem: 'teste' (o tubo de coleta do teste de DNA-HPV, com a escovinha) e 'mamografia' (o
// aparelho, com as duas placas). x, y é o centro e t o tamanho; só papéis de cor do kit (nada some no cartão do chapado).
(function () {
  const P = globalThis.PRESEME, E = globalThis.ESTILOS;
  const liso = { hachura: false, sombra: false };
  P.ICONE = P.ICONE || {};
  P.ICONE.teste = (ctx, x, y, t) => {
    // a escovinha, inclinada, saindo do tubo
    E.linha(ctx, [[x + 0.05 * t, y - 0.18 * t], [x + 0.36 * t, y - 0.5 * t]], { papel: 'tinta', lw: Math.max(3, 0.035 * t), seed: 401 });
    E.ret(ctx, x + 0.3 * t, y - 0.58 * t, 0.14 * t, 0.12 * t, Object.assign({ papel: 'destaque', r: 0.04 * t, lw: 3, seed: 402 }, liso));
    // o tubo: o corpo claro, o líquido embaixo e a tampa
    E.ret(ctx, x - 0.15 * t, y - 0.3 * t, 0.3 * t, 0.78 * t, Object.assign({ papel: 'apoio', r: 0.14 * t, lw: 4, seed: 403 }, liso));
    E.ret(ctx, x - 0.11 * t, y + 0.12 * t, 0.22 * t, 0.3 * t, Object.assign({ papel: 'destaque', r: 0.1 * t, lw: 3, seed: 404 }, liso));
    E.ret(ctx, x - 0.19 * t, y - 0.42 * t, 0.38 * t, 0.15 * t, Object.assign({ papel: 'apoioEscuro', r: 0.04 * t, lw: 4, seed: 405 }, liso));
  };
  P.ICONE.mamografia = (ctx, x, y, t) => {
    // o pé e a coluna
    E.ret(ctx, x - 0.4 * t, y + 0.36 * t, 0.8 * t, 0.1 * t, Object.assign({ papel: 'apoioEscuro', r: 0.03 * t, lw: 4, seed: 411 }, liso));
    E.ret(ctx, x + 0.16 * t, y - 0.5 * t, 0.16 * t, 0.88 * t, Object.assign({ papel: 'apoioEscuro', r: 0.04 * t, lw: 4, seed: 412 }, liso));
    // a cabeça do aparelho, a placa que comprime e a placa de baixo
    E.ret(ctx, x - 0.42 * t, y - 0.5 * t, 0.74 * t, 0.16 * t, Object.assign({ papel: 'apoio', r: 0.05 * t, lw: 4, seed: 413 }, liso));
    E.ret(ctx, x - 0.36 * t, y - 0.12 * t, 0.52 * t, 0.06 * t, Object.assign({ papel: 'destaque', r: 0.02 * t, lw: 3, seed: 414 }, liso));
    E.ret(ctx, x - 0.42 * t, y + 0.06 * t, 0.58 * t, 0.09 * t, Object.assign({ papel: 'apoio', r: 0.03 * t, lw: 4, seed: 415 }, liso));
  };
})();
