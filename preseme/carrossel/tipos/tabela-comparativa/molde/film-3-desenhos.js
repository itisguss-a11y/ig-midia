// PRESEME · carrossel · tabela comparativa · desenho 3 · TROQUE: os desenhos da peça.
// No molde, cada desenho é a vaga (a moldura tracejada com o X), para a lâmina sair inteira já no primeiro laminas. Na
// peça, troque pela coisa de cada coluna: o exemplo (exemplo-malaria-leishmaniose-oncocercose/film-3-desenhos.js) mostra
// como, com os três insetos, o termômetro, a ferida, o olho, a floresta, o mapa de Roraima, o calendário, a cama com
// mosquiteiro, a janela com tela e a roupa comprida.
// O molde de lâmina (film-2-moldes.js, que não muda) chama:
//   PRESEME.DESENHO.coluna[id da coluna](ctx, cx, cy, s): o desenho da coluna (a capa, o alto da tabela inteira e a
//     célula que não tem desenho próprio), centrado em cx, cy, em uns 240 × 200 px na escala 1;
//   PRESEME.DESENHO.celula[id da linha] = [um desenho por coluna, na ordem das COLUNAS], no mesmo formato: o desenho da
//     célula naquela linha (o termômetro na linha "o que se vê", por exemplo). Sem ele, vale o da coluna;
//   PRESEME.DESENHO.cena.equipe(ctx, caixa): o desenho do fecho, ao lado do que é da equipe (sem ele, a UBS da biblioteca).
// Use a biblioteca (globalThis.BIB: B.mosquito, B.termometro, B.calendario, B.mapaRR, B.arvore, B.ubsIcone...) antes de
// desenhar à mão; pessoa em pé leva pose: 'stand'. Nenhum desenho escreve palavra: o texto vem do textos.txt.
// Regras da ficha que valem aqui: um ponto de foco por célula; explicar pela coisa e pelo lugar, nunca por um grupo de
// pessoas; nada de cruz vermelha; nada de foto nem de lesão real de paciente.
(function () {
  const P = globalThis.PRESEME, DS = P.DESENHO, K = P.KIT;
  const vaga = (ctx, cx, cy, s) => K.vaga(ctx, cx, cy, s);
  DS.coluna.a = vaga; // TROQUE: o desenho da coluna A
  DS.coluna.b = vaga; // TROQUE: o desenho da coluna B
  DS.coluna.c = vaga; // TROQUE: o desenho da coluna C
  // TROQUE (opcional): um desenho por célula numa linha, na ordem das colunas; sem ele, vale o da coluna
  // DS.celula.linha3 = [vaga, vaga, vaga];
  // TROQUE (opcional): o desenho do fecho, ao lado do que é da equipe
  // DS.cena.equipe = (ctx, b) => globalThis.BIB.ubsIcone(ctx, { x: b.x + b.w / 2, y: b.y + 120, s: 1.2 });
})();
