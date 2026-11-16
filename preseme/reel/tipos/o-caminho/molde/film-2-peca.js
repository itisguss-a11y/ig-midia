// PRESEME · tipo "o caminho" · desenho 2/3 · MOLDE do que é só da peça (o chat 1 escreve). O exemplo completo e conferido
// é exemplo-rede-de-frio/film-2-peca.js (o caminho da vacina até o braço): copie de lá o que servir.
// O chat 1 troca o que está marcado TROQUE e apaga o que não usar; o que está marcado PODE FICAR serve a qualquer peça.
// O que a peça traz (globalThis.PECA):
//   DESTAQUE   o trecho de cada frase que leva o destaque do estilo ({ n: 'trecho' })
//   OBJETO     o que viaja: (ctx, x, y, s, st), com x no meio e y no chão (a base do objeto)
//   LUGAR      um desenho por lugar do caminho: (ctx, cx, chao, st, ponto); cx é o meio do lugar, e o desenho fica entre o
//              chão e CAMINHO.TETO (370 px acima do chão; em cima vem o letreiro). Devolve, se o objeto entra
//              nele, { pouso: [x, y], escala, frente(ctx), apaga } (apaga: segundos depois da chegada em que o objeto some)
//   TRANSPORTE um desenho por veículo: (ctx, x, chao, st, e); x é onde está o objeto, e vai de 0 a 1 na viagem.
//              Devolve { carga: [x, y], escala, frente(ctx) }: onde o objeto vai dentro dele e o que fica na frente
//   CUIDADO    o desenho ao lado do medidor no cartão, por cena (e "pergunta"): (ctx, caixa, st, fase); caixa = {x, y, w, h};
//              fase = { sobe, volta, valor, risco, temRisco, fim } (de 0 a 1), para o desenho andar junto com o medidor;
//              st.i diz qual frase da cena é (1 = o 1º cuidado, 2 = o 2º)
// Sem desenho, o molde se vira: lugar sem chave vira um prédio com porta, objeto sem desenho vira um círculo, veículo sem
// chave faz o objeto ir pulando e cuidado sem chave deixa só o medidor. A folha de quadros sai desde o primeiro rascunho,
// e o chat desenha só o que é novo, um de cada vez.
// Tudo com as funções do kit (E.ret, E.circulo, E.poligono, E.linha, E.seta, E.personagem, E.objeto) e os papéis de cor
// dele, para a peça sair em qualquer estilo. Nada de cor escrita à mão e nada de Math.random.
(function () {
  const U = globalThis.U, E = globalThis.ESTILOS, M = globalThis.CAMINHO;
  const cl = (x) => U.clamp(x, 0, 1);
  const predio = M.predio; // PODE FICAR: o prédio do molde (cx, chão, largura, altura da parede, altura do telhado)

  // PODE FICAR: o floco de neve (o frio): três traços cruzados com as pontas em V
  function floco(ctx, x, y, r, { papel = 'tinta', lw = 5, seed = 90 } = {}) {
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI) / 3 + Math.PI / 2, dx = Math.cos(a) * r, dy = Math.sin(a) * r;
      E.linha(ctx, [[x - dx, y - dy], [x + dx, y + dy]], { papel, lw, seed: seed + i });
      for (const sg of [1, -1]) {
        const px = x + sg * dx * 0.62, py = y + sg * dy * 0.62, b = r * 0.28;
        E.linha(ctx, [[px + Math.cos(a + sg * 2.4) * b, py + Math.sin(a + sg * 2.4) * b], [px, py], [px + Math.cos(a - sg * 2.4) * b, py + Math.sin(a - sg * 2.4) * b]], { papel, lw: lw * 0.8, seed: seed + 5 + i });
      }
    }
  }
  // PODE FICAR: o avião (de lado, virado para a direita), com uma janela redonda onde vai a carga
  function aviao(ctx, x, y, s, seed = 700) {
    E.poligono(ctx, [[x - 40 * s, y], [x - 120 * s, y + 96 * s], [x - 60 * s, y + 96 * s], [x + 50 * s, y]], { papel: 'apoioEscuro', seed: seed + 1, sombra: false });
    E.poligono(ctx, [[x - 210 * s, y - 6 * s], [x - 250 * s, y - 90 * s], [x - 200 * s, y - 90 * s], [x - 150 * s, y - 10 * s]], { papel: 'apoioEscuro', seed: seed + 2, sombra: false });
    E.ret(ctx, x - 240 * s, y - 42 * s, 470 * s, 84 * s, { papel: 'superficie', r: 42 * s, seed, sombra: false });
    E.poligono(ctx, [[x - 30 * s, y + 4 * s], [x + 60 * s, y - 70 * s], [x + 110 * s, y - 70 * s], [x + 50 * s, y + 4 * s]], { papel: 'apoioEscuro', seed: seed + 3, sombra: false });
    for (let i = 0; i < 4; i++) E.circulo(ctx, x + (80 + i * 34) * s, y - 8 * s, 9 * s, { papel: 'apoio', seed: seed + 10 + i, sombra: false, hachura: false, lw: 2 });
    E.ret(ctx, x + 196 * s, y - 24 * s, 30 * s, 22 * s, { papel: 'apoio', r: 6 * s, seed: seed + 20, sombra: false, hachura: false, lw: 2 });
  }
  // PODE FICAR: o caminhão (virado para a direita), baú com janela de carga; frio: true põe o floco no baú (refrigerado)
  function caminhao(ctx, x, chao, t, { frio = true, seed = 800 } = {}) {
    const bob = Math.sin(t * 28) * 2.2, y = chao + bob;
    E.ret(ctx, x - 250, y - 236, 290, 186, { papel: 'superficie', r: 10, seed, sombra: false });
    if (frio) floco(ctx, x - 70, y - 143, 46, { seed: seed + 5 });
    E.ret(ctx, x + 46, y - 176, 128, 126, { papel: 'apoioEscuro', r: 16, seed: seed + 1, sombra: false });
    E.ret(ctx, x + 108, y - 160, 54, 50, { papel: 'apoio', r: 8, seed: seed + 2, sombra: false, hachura: false });
    E.ret(ctx, x - 262, y - 58, 446, 22, { papel: 'tinta', r: 6, seed: seed + 3, sombra: false, hachura: false });
    for (const wx of [x - 190, x - 110, x + 120]) { E.circulo(ctx, wx, chao - 22, 32, { papel: 'tinta', seed: seed + 10 + wx, sombra: false, hachura: false }); E.circulo(ctx, wx, chao - 22, 12, { papel: 'superficie', seed: seed + 20 + wx, sombra: false, hachura: false }); }
    return { janela: [x - 178, y - 143] };
  }

  // TROQUE: o objeto que viaja (base em y). No molde, um pacote com etiqueta; no exemplo, o frasco de vacina.
  function pacote(ctx, x, y, s, seed = 300) {
    E.ret(ctx, x - 40 * s, y - 70 * s, 80 * s, 70 * s, { papel: 'superficie', r: 8 * s, seed, sombra: false });
    E.linha(ctx, [[x, y - 70 * s], [x, y]], { lw: 4 * s, seed: seed + 1 });
    E.ret(ctx, x + 8 * s, y - 52 * s, 24 * s, 18 * s, { papel: 'destaque', r: 3 * s, seed: seed + 2, sombra: false, hachura: false, lw: 2 });
  }

  const PECA = {
    // TROQUE: o trecho de cada frase que leva o destaque, pelo número da frase (ex.: { 1: 'fria', 10: 'em cada parada' })
    DESTAQUE: {},

    OBJETO(ctx, x, y, s) { pacote(ctx, x, y, s); }, // TROQUE

    LUGAR: {
      // TROQUE: um desenho por lugar (as chaves do ROTEIRO: PARTIDA.lugar e o lugar de cada parada e da chegada).
      // Sem a chave, o molde desenha um prédio com porta. Modelo de um lugar em que o objeto entra:
      //   posto(ctx, cx, chao) { predio(ctx, cx, chao, 320, 240, 100); E.ret(ctx, cx - 60, chao - 150, 120, 110, { papel: 'apoio' });
      //     return { pouso: [cx, chao - 50], escala: 0.8 }; }
      // PODE FICAR: a pessoa que recebe o objeto no fim do caminho (o objeto some nas mãos dela e ela sorri)
      pessoa(ctx, cx, chao, st, ponto) {
        const depois = st.t - ponto.tChega;
        E.personagem(ctx, { quem: 'calouro', x: cx, y: chao, s: 1.05, pose: 'stand', look: -0.4, mouth: depois > 0.5 ? 'smile' : 'flat', gesture: depois > 0.9 ? 'thumbsUp' : undefined, seed: 160 });
        return { pouso: [cx - 73, chao - 235], escala: 0.7, apaga: 0.45 };
      },
    },

    TRANSPORTE: {
      // PODE FICAR: o caminhão (frio: false para um caminhão comum)
      caminhao(ctx, x, chao, st) {
        const r = caminhao(ctx, x, chao, st.t, { frio: true });
        const [jx, jy] = r.janela;
        const janela = (c) => { E.ret(c, jx - 46, jy - 52, 92, 104, { papel: null, r: 12, seed: 870, lw: 6, sombra: false }); };
        return { carga: [jx, jy + 44], escala: 0.62, frente: janela };
      },
      // PODE FICAR: o avião, que sobe e desce no trecho
      aviao(ctx, x, chao, st, e) {
        const y = chao - 470 - Math.sin(Math.min(1, e) * Math.PI) * 60;
        aviao(ctx, x, y, 0.8, 880);
        E.circulo(ctx, x - 40, y - 2, 40, { papel: 'apoio', seed: 890, sombra: false, hachura: false });
        const janela = (c) => E.circulo(c, x - 40, y - 2, 40, { papel: null, seed: 891, lw: 6, sombra: false });
        return { carga: [x - 40, y + 30], escala: 0.48, frente: janela };
      },
      // sem veículo (transporte: null no ROTEIRO), o objeto vai pulando: serve para "a pé" e para o trecho dentro da mesma sala
    },

    CUIDADO: {
      // TROQUE: o desenho ao lado do medidor em cada frase de cuidado (chave = id da cena; st.i diz qual frase da cena) e na
      // 2ª frase da pergunta ("pergunta"). Sem a chave, o cartão fica só com o medidor. Use a fase para o desenho andar com
      // o medidor (f.sobe: o valor indo ao risco; f.volta: voltando à faixa). Modelo:
      //   parada1(ctx, b, st, f) { pacote(ctx, b.x + b.w * 0.5, b.y + b.h * 0.8, 3); if (f.sobe > 0.6) E.seta(...); }
      pergunta(ctx, b, st) { const k = U.ease.outBack(cl((st.t - st.it.t0) / 0.4)); pacote(ctx, b.x + b.w * 0.45, b.y + b.h * 0.78, 3.2 * k, 310); },
    },
  };
  globalThis.PECA = PECA;
})();
