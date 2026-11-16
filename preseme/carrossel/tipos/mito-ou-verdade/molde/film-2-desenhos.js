// PRESEME · carrossel · mito ou verdade · desenho 2 · TROQUE: os desenhos da peça.
// No molde, cada função só marca a vaga do desenho (a moldura tracejada com o X) e põe os rótulos D no lugar, para a
// lâmina sair inteira já no primeiro laminas. Na peça, troque cada função pelo desenho do assunto: o exemplo da picada
// de cobra (exemplo-serpente/film-2-desenhos.js) mostra como, com a cobra, o braço, os ícones riscados, o frasco do soro,
// os passos, a bota e a grade de 100.
// O molde de lâmina (film-3-moldes.js, que não muda) chama PRESEME.DESENHO.cena[id da lâmina](ctx, caixa, lam), com
// caixa = { x, y, w, h }, o espaço livre que ele deixou. Nas lâminas de passos, PRESEME.DESENHO.passo[id] = [um desenho
// por item], cada um (ctx, cx, cy, s), centrado em cx, cy, em uns 160 × 140 px na escala 1. O rótulo de desenho vem do
// textos.txt (palavra D) e é escrito com P.bloco. Os ids são os do score.js.
// Regras da ficha que valem aqui: um ponto de foco por lâmina; o mito desenhado aparece riscado (o X de Coral); nada de
// cruz vermelha; cor que pode sumir no estilo (a do chão, a do fundo) troca sozinha (veja naoSome no exemplo).
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, DS = P.DESENHO;
  DS.cena = DS.cena || {};
  DS.passo = DS.passo || {};
  // a vaga do desenho: a moldura tracejada onde o desenho da peça entra
  const vaga = (ctx, b) => {
    E.linha(ctx, [[b.x, b.y], [b.x + b.w, b.y], [b.x + b.w, b.y + b.h], [b.x, b.y + b.h], [b.x, b.y]], { lw: 3, tracejado: true, seed: 900 });
    E.linha(ctx, [[b.x, b.y], [b.x + b.w, b.y + b.h]], { lw: 2, seed: 901 });
    E.linha(ctx, [[b.x + b.w, b.y], [b.x, b.y + b.h]], { lw: 2, seed: 902 });
  };
  const rotulo = (ctx, k, cx, y, w, h = 52) => P.bloco(ctx, k, { x: cx - w / 2, y, w, h }, { sizes: [36, 34, 32, 30], align: 'center', maxLinhas: 2, lh: 1.08 });

  DS.cena.capa = (ctx, b) => vaga(ctx, b); // TROQUE: o desenho da capa (o assunto, um ponto de foco)
  DS.cena.frase1 = (ctx, b) => vaga(ctx, b); // TROQUE: a cena da primeira frase (o mito desenhado, riscado)
  DS.cena.porque1 = (ctx, b, lam) => { // TROQUE: o porquê desenhado (no exemplo: o que não se faz, riscado, e o que trata)
    const ks = lam.palavras.slice(2), wl = b.w * 0.6;
    vaga(ctx, { x: b.x, y: b.y, w: wl - 20, h: b.h });
    vaga(ctx, { x: b.x + wl + 20, y: b.y, w: b.w - wl - 20, h: b.h - 80 });
    ks.slice(0, 4).forEach((k, i) => rotulo(ctx, k, b.x + (wl / 2) * (i % 2) + wl / 4, b.y + (b.h / 2) * Math.floor(i / 2) + b.h / 4 - 26, wl / 2 - 30));
    if (ks[4]) rotulo(ctx, ks[4], b.x + wl + 20 + (b.w - wl - 20) / 2, b.y + b.h - 64, b.w - wl - 20, 60);
  };
  DS.cena.frase2 = (ctx, b) => vaga(ctx, b); // TROQUE: a cena da segunda frase
  DS.passo.porque2 = [0, 1, 2, 3].map(() => (ctx, cx, cy, s) => vaga(ctx, { x: cx - 70 * s, y: cy - 60 * s, w: 140 * s, h: 120 * s })); // TROQUE: um ícone por passo
  DS.cena.frase3 = (ctx, b) => vaga(ctx, b); // TROQUE: a cena da terceira frase
  DS.cena.porque3 = (ctx, b, lam) => { // TROQUE: o porquê da terceira (no exemplo: 75 de 100 quadradinhos e a bota)
    vaga(ctx, b);
    if (lam.palavras[2]) rotulo(ctx, lam.palavras[2], b.x + b.w / 2, b.y + 16, b.w * 0.8, 60);
  };
})();
