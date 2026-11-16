// PRESEME · motor "por dentro" · desenho 2/3 · a peça (o chat 1 preenche este arquivo; o molde, film-1, não muda)
// O que a peça preenche aqui:
//   DESTAQUE  o trecho de cada frase que leva o marca-texto: { número da frase: 'trecho escrito igualzinho na frase' }
//   NIVEL     o desenho de cada nível (os ids do NIVEIS do score.js): function (ctx, st, M). Desenhe a janela inteira e um
//             pouco além (a lente e os medalhões mostram o nível pequeno, e a câmera passa por ele): a janela vai de
//             x 60 a 940 e de y 330 a 1170 (M.JAN). Fundo: um retângulo bem maior que a janela, como no provisório
//   PORTA     onde mora o nível seguinte, dentro de cada nível: { id: { x, y, r } }. É o ponto em que a lente pousa e por
//             onde a câmera entra (r: o raio da lente, 50 a 90). O último nível não tem porta
//   (o enquadramento de cada frase, PLANOS, fica no score.js: é um corte, e o conferir conta)
// Cada desenho recebe (ctx, st, M):
//   st.desde[n]  segundos desde que a frase n entrou na tela (negativo antes dela), em qualquer cena: é o relógio do desenho.
//                Use para o nível mudar com a história (o anticorpo que se liga depois da frase 7) e ficar como ficou
//   st.nivel     o id do nível que está sendo desenhado; st.c.id, a cena em que o filme está; st.t, o instante
//   M            as funções do molde: M.escrever(ctx, texto, x, y, { size, papel, align, cor }), M.wid, M.p01,
//                M.desde(st, n), M.D('D05') e as medidas M.JAN e M.JC (o meio da janela)
// Desenhe com a biblioteca (globalThis.BIB: B.sala, B.ubsDentro, B.pessoa, B.seringa, B.cartaoVacina...; a lista em
// motor/estilos/BIBLIOTECA.md) e com o kit (globalThis.ESTILOS: E.ret, E.circulo, E.linha, E.seta, E.poligono,
// E.personagem), com cor por papel ('tinta', 'superficie', 'apoio', 'apoioEscuro', 'destaque', 'alerta', 'fundo'), nunca
// com cor escrita à mão: assim a peça sai em qualquer estilo (node preseme.js estilos). Todo desenho é função do tempo
// (sem Math.random). Palavra dentro do desenho vem do textos.txt ([Dnn]), com 34 ou mais de tamanho.
(function () {
  const U = globalThis.U, E = globalThis.ESTILOS, B = globalThis.BIB;

  // TROQUE: o desenho provisório, para o molde rodar inteiro desde o primeiro dia. Cada nível de dentro é uma cor e um
  // anel tracejado onde fica a porta. A peça troca cada um pelo desenho de verdade (no exemplo da vacina: a sala de
  // vacina, o músculo do braço com o micróbio enfraquecido, os linfócitos e o anticorpo encaixando no antígeno).
  function provisorio(papel) {
    return (ctx, st, M) => {
      E.ret(ctx, -300, -300, 1680, 2520, { papel, contorno: false, hachura: false });
      for (let k = 0; k < 7; k++) E.circulo(ctx, 160 + k * 130, 520 + (k % 3) * 260, 46 + (k % 2) * 20, { papel: 'superficie', seed: 40 + k, sombra: false });
      M.escrever(ctx, `nível ${st.ni}`, M.JC.x, M.JAN.y + 120, { size: 64, papel: 'numero', align: 'center' });
      const pt = (globalThis.PECA.PORTA || {})[st.nivel];
      if (pt) E.circulo(ctx, pt.x, pt.y, pt.r, { papel: null, lw: 5, seed: 58, sombra: false, hachura: false });
    };
  }

  globalThis.PECA = {
    // TROQUE: o trecho de cada frase que leva o marca-texto (o número é o da frase no textos.txt)
    DESTAQUE: { 1: 'por dentro', 9: 'por fora' },
    // TROQUE: onde fica a porta de cada nível (o último não tem)
    PORTA: { fora: { x: 560, y: 760, r: 70 }, n1: { x: 650, y: 700, r: 70 } },
    NIVEL: {
      // a cena de fora: a pessoa no dia a dia (aqui, na sala de casa)
      fora: (ctx, st, M) => {
        B.sala(ctx, { chao: 1110 });
        B.pessoa(ctx, { quem: 'moradora', x: 520, y: 1110, look: 0.3 });
      },
      n1: provisorio('apoio'),
      n2: provisorio('destaque'),
    },
  };
})();
