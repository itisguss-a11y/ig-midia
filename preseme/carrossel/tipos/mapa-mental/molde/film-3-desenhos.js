// PRESEME · carrossel · mapa mental · desenho 3 · TROQUE: os desenhos da peça.
// No molde, cada desenho é a vaga (a moldura tracejada com o X), para a lâmina sair inteira já no primeiro laminas. Na
// peça, troque pelo desenho do tema e de cada ramo: o exemplo (exemplo-oropouche/film-3-desenhos.js) mostra como, com o
// maruim, o vírus, a picada, o termômetro, a lupa no sangue, a rede do repouso e a janela de tela fina.
// O molde de lâmina (film-2-moldes.js, que não muda) chama:
//   PRESEME.DESENHO.centro(ctx, cx, cy, s): o desenho do tema, centrado em cx, cy, em uns 200 × 160 px na escala 1. Fica
//     em cima do círculo do centro, no fundo da lâmina (na capa e no mapa inteiro);
//   PRESEME.DESENHO.ramo[id do ramo](ctx, cx, cy, s): o desenho do ramo, em uns 300 × 240 px na escala 1, em cima do nó do
//     ramo, na lâmina dele;
//   PRESEME.DESENHO.cena.equipe(ctx, caixa): o desenho da última lâmina, embaixo das frases (sem ele, a UBS da biblioteca).
// Use a biblioteca (globalThis.BIB: B.mosquito, B.termometro, B.lupa, B.rede, B.prancheta, B.ubsIcone, B.mapaRR...) antes
// de desenhar à mão; pessoa em pé leva pose: 'stand'. Nenhum desenho escreve palavra: o texto vem do textos.txt.
// Regras da ficha que valem aqui: um ponto de foco por desenho; explicar pela coisa e pelo lugar, nunca por um grupo de
// pessoas; nada de cruz vermelha; nada de foto nem de lesão real de paciente.
(function () {
  const P = globalThis.PRESEME, DS = P.DESENHO, K = P.KIT;
  const vaga = (ctx, cx, cy, s) => K.vaga(ctx, cx, cy, s);
  DS.centro = (ctx, cx, cy, s) => K.vaga(ctx, cx, cy, s * 0.8); // TROQUE: o desenho do tema
  DS.ramo.ramo1 = vaga; // TROQUE: o desenho do ramo 1 (o nome é o id do ramo no score.js)
  DS.ramo.ramo2 = vaga; // TROQUE: o desenho do ramo 2
  DS.ramo.ramo3 = vaga; // TROQUE: o desenho do ramo 3
  DS.ramo.ramo4 = vaga; // TROQUE: o desenho do ramo 4
  DS.ramo.ramo5 = vaga; // TROQUE: o desenho do ramo 5
  // TROQUE (opcional): o desenho da última lâmina, embaixo do que é da equipe
  // DS.cena.equipe = (ctx, b) => globalThis.BIB.ubsIcone(ctx, { x: b.x + b.w / 2, y: b.y + b.h / 2, s: 1.3 });
})();
