// PRESEME · carrossel · X não é Y · desenho 2 · TROQUE: os desenhos da peça.
// No molde, cada função só marca a vaga do desenho (a moldura tracejada com o X) e põe os rótulos D no lugar, para a
// lâmina sair inteira já no primeiro laminas. Na peça, troque cada função pelo desenho do assunto: o exemplo do
// rastreamento (exemplo-rastreamento/film-2-desenhos.js) mostra como, com a peneira, a pessoa com o sinal, a lupa, as
// duas mulheres do caso, a balança e os dois caminhos.
// O molde de lâmina (film-3-moldes.js, que não muda) chama PRESEME.DESENHO.cena[id da lâmina](ctx, caixa, lam), com
// caixa = { x, y, w, h }, o espaço livre que ele deixou; na capa, cena.capaX e cena.capaY (um por lado); no caso,
// cena[id] é uma lista com dois desenhos, um por coluna. O rótulo de desenho vem do textos.txt (palavra D) e é escrito
// com P.bloco. Os ids são os do score.js.
// Regras da ficha que valem aqui: o desenho de cada conceito mostra ele funcionando (não um ícone parado); um ponto de
// foco por lâmina; cor que pode sumir no estilo (a do fundo) troca sozinha (veja naoSome no exemplo).
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, DS = P.DESENHO;
  DS.cena = DS.cena || {};
  // a vaga do desenho: a moldura tracejada onde o desenho da peça entra
  const vaga = (ctx, b) => {
    E.linha(ctx, [[b.x, b.y], [b.x + b.w, b.y], [b.x + b.w, b.y + b.h], [b.x, b.y + b.h], [b.x, b.y]], { lw: 3, tracejado: true, seed: 900 });
    E.linha(ctx, [[b.x, b.y], [b.x + b.w, b.y + b.h]], { lw: 2, seed: 901 });
    E.linha(ctx, [[b.x + b.w, b.y], [b.x, b.y + b.h]], { lw: 2, seed: 902 });
  };
  const rotulo = (ctx, k, cx, y, w, h = 56) => P.bloco(ctx, k, { x: cx - w / 2, y, w, h }, { papel: 'mao', sizes: [46, 42, 40, 38, 36], align: 'center', maxLinhas: 2, lh: 1.04 });
  // os rótulos D da lâmina (depois da etiqueta), um ao lado do outro, no alto da vaga
  const rotulos = (ctx, b, ks) => { const w = b.w / Math.max(1, ks.length); ks.forEach((k, i) => rotulo(ctx, k, b.x + w * i + w / 2, b.y + 12, w - 20)); };

  DS.cena.capaX = (ctx, b) => vaga(ctx, b); // TROQUE: X funcionando, pequeno (no exemplo: gente igual entrando na peneira)
  DS.cena.capaY = (ctx, b) => vaga(ctx, b); // TROQUE: Y funcionando, pequeno (no exemplo: a pessoa com o sinal e a lupa)
  DS.cena.conceitoX = (ctx, b, lam) => { vaga(ctx, b); rotulos(ctx, b, lam.palavras.slice(1)); }; // TROQUE: X funcionando
  DS.cena.conceitoY = (ctx, b, lam) => { vaga(ctx, b); rotulos(ctx, b, lam.palavras.slice(1)); }; // TROQUE: Y funcionando
  DS.cena.caso = [(ctx, b) => vaga(ctx, b), (ctx, b) => vaga(ctx, b)]; // TROQUE: as duas pessoas do caso, uma por coluna
  DS.cena.explica1 = (ctx, b, lam) => { vaga(ctx, b); rotulos(ctx, b, lam.palavras.slice(1)); }; // TROQUE ou apague a lâmina
  DS.cena.explica2 = (ctx, b, lam) => { vaga(ctx, b); rotulos(ctx, b, lam.palavras.slice(1, 3)); }; // TROQUE ou apague a lâmina
})();
