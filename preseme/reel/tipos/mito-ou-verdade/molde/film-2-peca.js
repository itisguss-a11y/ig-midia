// PRESEME · motor "Mito ou verdade" · desenho 2/3 · a peça (o chat 1 preenche este arquivo; o molde, film-1, não muda)
// O que a peça preenche aqui:
//   DESTAQUE  o trecho de cada frase que leva o marca-texto: { número da frase: 'trecho escrito igualzinho na frase' }
//   FALANTE   quem repete as três frases no balão: { quem: 'moradora' | 'agente' | 'calouro', style: { hair, glasses... } }
//   RESUMO    as palavras D que resumem cada frase na fileira de selos do fecho (D02, D03 e D04 no textos.txt)
//   PORQUE    PORQUE[1], [2] e [3]: o desenho que mostra o porquê funcionando, um por frase (troque os provisórios)
//   PLANOS    o enquadramento de cada frase do porquê: { número da frase: { x, y, z } } põe o ponto (x, y) do desenho no
//             meio da área, com zoom z; a troca é seca, no começo da frase (um corte por frase: o conferir avisa trecho
//             sem corte acima de 12 s). Frase sem plano mostra o desenho inteiro. Tudo fora da área é recortado.
// Cada PORQUE recebe (ctx, st, M):
//   st.desde[n]  segundos desde que a frase n entrou na tela (negativo antes dela): é o relógio do desenho
//   st.c.itens   as frases da cena ({ n, t0, t1 }); st.c.k é o número do item (1, 2 ou 3)
//   M            as funções do molde: M.escrever(ctx, texto, x, y, { size, papel, align, cor }), M.caber, M.desenhar,
//                M.wid, M.p01, M.D('D05') e as medidas M.L, M.R, M.CX, M.area (x de 60 a 940, y de 400 a 1170)
// Desenhe só com o kit (globalThis.ESTILOS: E.ret, E.circulo, E.linha, E.seta, E.poligono, E.texto, E.destaque,
// E.carimbo, E.personagem, E.objeto) e com cor por papel ('tinta', 'superficie', 'apoio', 'destaque', 'alerta', 'folha'),
// nunca com cor escrita à mão: assim a peça sai em qualquer estilo (node preseme.js estilos). Cor de gente (pele, cabelo)
// fixada no FALANTE entra no peca.json, em "cores". Todo desenho é função do tempo (sem Math.random).
// Letra de rótulo com 36 ou mais, para ler no celular.
(function () {
  const U = globalThis.U, E = globalThis.ESTILOS;
  const ease = U.ease;
  const desde = (st, n) => (st.desde && st.desde[n] != null ? st.desde[n] : -1);

  // TROQUE: o desenho provisório, para o molde rodar inteiro desde o primeiro dia. Um cartão por frase do porquê, que
  // entra quando a frase entra. A peça troca cada PORQUE por um desenho do porquê funcionando (no exemplo da pressão:
  // o aparelho e a régua da máxima, as duas folhas de medida, o gráfico que despenca com o remédio debaixo da língua).
  function provisorio(ctx, st, M) {
    const itens = st.c.itens, n = itens.length, a = M.area, gap = 30;
    const w = (a.w - gap * (n - 1)) / n, h = 380, y = a.y + 30;
    itens.forEach((it, i) => {
      const z = ease.outBack(U.clamp(desde(st, it.n) / 0.35, 0, 1));
      if (z <= 0) return;
      const x = a.x + i * (w + gap), cx = x + w / 2;
      ctx.save(); ctx.translate(cx, y + h / 2); ctx.scale(z, z); ctx.translate(-cx, -(y + h / 2));
      E.ret(ctx, x, y, w, h, { papel: 'superficie', r: 26, seed: 300 + i });
      M.escrever(ctx, `[${String(it.n).padStart(2, '0')}]`, cx, y + 140, { size: 72, papel: 'numero', align: 'center' });
      M.escrever(ctx, 'desenho', cx, y + 236, { size: 44, papel: 'mao', align: 'center' });
      M.escrever(ctx, `do porquê ${st.c.k}`, cx, y + 292, { size: 44, papel: 'mao', align: 'center' });
      ctx.restore();
    });
  }

  globalThis.PECA = {
    // TROQUE: o trecho de cada frase que leva o marca-texto (o número é o da frase no textos.txt)
    DESTAQUE: { 1: 'Uma é mito.' },
    // TROQUE: quem repete as frases e o jeito dela (no exemplo: moradora de cabelo grisalho e óculos redondos)
    FALANTE: { quem: 'moradora', style: {} },
    RESUMO: ['D02', 'D03', 'D04'],
    // TROQUE: o plano de cada frase do porquê (aqui, a primeira frase de cada porquê fecha no primeiro cartão)
    PLANOS: { 4: { x: 272, y: 620, z: 1.3 }, 8: { x: 272, y: 620, z: 1.3 }, 12: { x: 272, y: 620, z: 1.3 } },
    PORQUE: { 1: provisorio, 2: provisorio, 3: provisorio },
  };
})();
