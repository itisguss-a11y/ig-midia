// PRESEME · carrossel · caso, arraste para a resposta · desenho 3 · TROQUE: os desenhos da peça.
// No molde, cada função só marca a vaga do desenho (a moldura tracejada com o X) e põe os rótulos D no lugar, para a
// lâmina sair inteira já no primeiro laminas. Na peça, troque cada função pelo desenho do assunto: o exemplo da ferida
// que não fecha (exemplo-leishmaniose/film-3-desenhos.js) mostra como, com a pessoa, a lupa, o inseto, a toalha
// riscada, a ferida, o calendário e os ícones da lista.
// O molde de lâmina (film-2-moldes.js, que não muda) chama PRESEME.DESENHO.cena[id da lâmina](ctx, caixa, lam, extra),
// com caixa = { x, y, w, h }, o espaço livre que ele deixou. Na capa (caso), extra.ficha é onde fica a ficha das pistas
// e extra.livre é o que sobra à esquerda dela (lá vai a pessoa do caso). Nas lâminas de lista,
// PRESEME.DESENHO.item[id] = [um desenho por item], cada um (ctx, cx, cy, s), centrado em cx, cy, em uns 260 × 220 px na
// escala 1. Os rótulos vêm do textos.txt (palavra D) e são escritos com P.bloco. Os ids são os do score.js.
// Use a biblioteca (globalThis.BIB: B.pessoa, B.lupa, B.ubsIcone, B.calendario, B.prancheta...) antes de desenhar à mão.
// Regras da ficha que valem aqui: um ponto de foco por lâmina; o mito desenhado aparece riscado (PRESEME.KIT.risco, o X
// de Coral); nada de cruz vermelha; nada que entregue a resposta na capa nem na pergunta.
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, DS = P.DESENHO;
  // a vaga do desenho: a moldura tracejada onde o desenho da peça entra
  const vaga = (ctx, b) => {
    E.linha(ctx, [[b.x, b.y], [b.x + b.w, b.y], [b.x + b.w, b.y + b.h], [b.x, b.y + b.h], [b.x, b.y]], { lw: 3, tracejado: true, seed: 900 });
    E.linha(ctx, [[b.x, b.y], [b.x + b.w, b.y + b.h]], { lw: 2, seed: 901 });
    E.linha(ctx, [[b.x + b.w, b.y], [b.x, b.y + b.h]], { lw: 2, seed: 902 });
  };
  const rotulo = (ctx, k, cx, y, w, h = 52) => P.bloco(ctx, k, { x: cx - w / 2, y, w, h }, { sizes: [36, 34, 32, 30], align: 'center', maxLinhas: 2, lh: 1.08 });
  const comRotulo = (ctx, b, lam) => {
    const k = lam.palavras[0];
    vaga(ctx, { x: b.x, y: b.y, w: b.w, h: Math.max(40, b.h - (k ? 70 : 0)) });
    if (k) rotulo(ctx, k, b.x + b.w / 2, b.y + b.h - 56, b.w * 0.8);
  };

  DS.cena.caso = (ctx, b, lam, ex) => { const v = ex.livre || b; vaga(ctx, { x: v.x, y: v.y + 20, w: v.w, h: v.h - 30 }); }; // TROQUE: a pessoa do caso e o lugar
  DS.cena.resposta = (ctx, b) => { if (b.h > 120) vaga(ctx, { x: b.x, y: b.y, w: b.w, h: b.h - 10 }); }; // TROQUE (opcional): quem reage à resposta
  DS.cena.porqueA = comRotulo; // TROQUE: o porquê da A desenhado (no exemplo: a toalha riscada e o inseto)
  DS.cena.porqueB = comRotulo; // TROQUE: o porquê da B desenhado
  DS.cena.porqueC = comRotulo; // TROQUE: o porquê da C desenhado
  const icone = () => (ctx, cx, cy, s) => vaga(ctx, { x: cx - 90 * s, y: cy - 80 * s, w: 180 * s, h: 160 * s });
  DS.item.aps = [icone(), icone(), icone()]; // TROQUE: um desenho por item da atenção primária
  DS.item.prevencao = [icone(), icone(), icone(), icone()]; // TROQUE: um desenho por item da prevenção
})();
