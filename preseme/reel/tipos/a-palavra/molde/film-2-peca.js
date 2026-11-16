// PRESEME · motor "a palavra" · desenho 2 · a PEÇA (é o único arquivo de desenho que o chat 1 escreve).
// Aqui fica só o que é desta palavra: os trechos em destaque, o desenho do que ela quer dizer (significa) e do exemplo,
// os focos da câmera e o sinal da pegadinha. O resto (o verbete, as sílabas, os tempos, os cortes, os cartões da
// pegadinha, o carimbo, o fecho) é do molde. Tudo o que se troca está marcado com TROQUE.
// Desenhe com a biblioteca (B = globalThis.BIB: B.ubsFora, B.rua, B.casa, B.pessoa, B.prancheta, B.tracejado...; a lista
// em motor/estilos/BIBLIOTECA.md) e com o kit (E = globalThis.ESTILOS). Cor sai do papel ('tinta', 'apoio', 'destaque'),
// nunca de código. Palavra escrita no desenho vem do textos.txt ([D09] em diante).
(function () {
  const U = globalThis.U, E = globalThis.ESTILOS, B = globalThis.BIB;
  const MP = globalThis.PRESEME_PALAVRA, M = MP.M;
  const D = M.D;
  const CHAO = 1450; // o chão das cenas do meio: o desenho fica entre a frase de cima e uns 1500

  MP.PECA = {
    // TROQUE: o trecho de cada frase que vai no destaque, pelo número da frase. Na pergunta, o molde já destaca a
    // palavra ([D02]) se ela estiver na frase. Ex.: { 2: 'território de uma UBS' }.
    DESTAQUE: {},
    // TROQUE: o foco da câmera em cada frase de significa e de exemplo ([x, y] no quadro 1080 × 1920, ou null para o
    // quadro inteiro). Com foco, a câmera pula para ele na frase nova (é um corte) e chega perto devagar.
    focoSignifica: [null, [330, 1180]],
    focoExemplo: [null],

    // TROQUE: o desenho do que a palavra quer dizer, funcionando. st.i é a frase da vez (0 ou 1); k vai de 0 a 1 dentro dela.
    significa(ctx, st, M, k) {
      B.ubsFora(ctx, { fundo: false, chao: CHAO, placa: '' });
      ['idosa', 'moradora', 'crianca'].forEach((q, i) => B.pessoa(ctx, { quem: q, x: 300 + i * 150, y: CHAO + 10, s: 0.55, look: 0.3, seed: 60 + i }));
      if (st.i >= 1) B.visto(ctx, { x: 330, y: 1000, k: U.ease.outBack(U.clamp(k * 3, 0, 1)), s: 1.4 });
    },
    // TROQUE: o exemplo da vida real, na UBS ou na visita.
    exemplo(ctx, st, M, k) {
      B.casa(ctx, { x: 700, y: CHAO, w: 420, h: 470, numero: '', porta: 0.8, seed: 80 });
      B.pessoa(ctx, { quem: 'agente', x: 330, y: CHAO + 10, s: 0.62, look: 0.6, seed: 90 });
      B.prancheta(ctx, { x: 405, y: 1090, s: 0.8, linhas: Math.min(3, k * 4), vistos: Math.floor(k * 4) });
      E.chao(ctx, CHAO, { seed: 95 });
    },
    // TROQUE: o sinal da pegadinha: '≠' (o que confunde não é o que é) ou '=' (duas formas da mesma coisa)
    sinal: '≠',
    // TROQUE: false tira o carimbo [D07] da pegadinha
    carimbo: true,
    // opcionais: palavra(ctx, st, M, caixa) desenha algo pequeno junto do verbete do começo; pegadinha(ctx, st, M,
    // { esq, dir }) desenha dentro dos dois cartões (em cima do texto, na faixa de cima de cada cartão); fecho(ctx, st, M, caixa).
  };
})();
