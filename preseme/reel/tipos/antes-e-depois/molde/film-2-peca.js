// PRESEME · motor do tipo "antes e depois" · desenho 2/3 · A PEÇA (MOLDE)
// O chat 1 (Fable) copia este arquivo para a pasta da peça e troca o que está marcado com TROQUE.
// Exemplo preenchido: ../exemplo-polio/film-2-peca.js (a pólio no Brasil antes e depois da vacinação).
// O que é só da peça: o lugar nos dois tempos (LUGAR), o ponto da ação de perto (FOCO), os trechos no destaque e os
// desenhos do "porque" e, se quiser, os que entram por cima do mundo nas outras cenas (DESENHO). Os instantes de cada
// coisa vêm de SCORE.momento('nome') (score.js, MOMENTOS).
// Desenhe com o kit de estilos (E.ret, E.circulo, E.poligono, E.linha, E.seta, E.cota, E.texto, E.personagem,
// E.objeto...; ver motor/estilos/README.md) e com o KIT do molde (AD.KIT: pessoa, gente, chao, casa, arvore, virus,
// etiqueta, barra, textoNoLugar): assim a folha dos 3 estilos da parada 2 sai sozinha. Palavra escrita dentro do lugar
// (faixa, placa, letreiro) vai com textoNoLugar(ctx, info, ...): ela some quando a cortina a cortaria ao meio.
// Regras do desenho: o mesmo lugar nos dois tempos (o que muda é só o que a ação mudou), nada encostado, o que importa
// dentro da área segura (de AD.L a AD.R na largura: à direita de 940 ficam os botões do Instagram), Coral nunca em letra
// pequena, e o desenho explica o que a frase diz (régua da ficha, seção 1).
(function () {
  const U = globalThis.U, E = globalThis.ESTILOS, SC = globalThis.SCORE, A = globalThis.AD;
  const { prog } = A;
  const { aFazer } = A.KIT;

  // TROQUE: o lugar nos dois tempos. É uma função só, chamada para cada tempo, e por isso o lugar é o mesmo:
  //   info.tempo: 'antes' (o tempo de antes), 'acao' (o mesmo lugar no ano da ação, com a ação acontecendo) ou 'depois'
  //   info.t (o tempo do vídeo), info.cena (o id da cena), info.u (segundos desde o corte), info.n (a frase da vez),
  //   info.w × info.h: o tamanho do lugar (1080 × 660); o chão costuma ficar perto de y = 560
  // O molde recorta o lugar na faixa dele, põe a gravura por cima do passado e, na ação, chega perto do FOCO.
  // No exemplo: a mesma rua; em 1975, uma criança de muleta entre as outras; em 1980, a mesa da campanha de vacinação
  // na calçada; hoje, as crianças correndo e a árvore maior.
  function lugar(ctx, info) {
    aFazer(ctx, { x0: A.L, x1: A.R, y0: 40, y1: info.h - 40 }, 'o lugar · ' + info.tempo, 1);
  }

  // TROQUE: o desenho de por que funcionou (cena 'porque', frases 9 e 10), na caixa do mundo ({ x0, x1, y0, y1 }).
  // No exemplo: dez pessoas, oito vacinadas; o vírus pula de uma a outra e para na primeira vacinada (a corrente quebra).
  function porque(ctx, st, caixa) {
    aFazer(ctx, { x0: A.L, x1: A.R, y0: caixa.y0 + 40, y1: caixa.y1 - 20 }, 'por que funcionou', prog(st.t, st.c.t0, 0.4));
  }

  globalThis.PECA = {
    // as palavras do textos.txt que o molde usa: o ano de cada tempo, o número oficial de cada tempo e o que ele conta,
    // e o ano da ação. Só troque se mudar a numeração do textos.txt.
    NOMES: { antes: 'D01', depois: 'D02', numAntes: 'D03', rotAntes: 'D04', numDepois: 'D05', rotDepois: 'D06', acao: 'D07' },
    // TROQUE: o trecho de cada frase que leva destaque, pelo número da frase. Tem de estar escrito igual na frase; se
    // o trecho sumir da frase, ela sai sem marca. Exemplo: 9: 'o vírus não acha em quem passar'.
    DESTAQUE: {},
    // TROQUE: o ponto do lugar que a câmera olha de perto na cena da ação (x, y em unidades do lugar, 1080 × 660) e o
    // quanto ela chega perto (z, de 1,4 a 2)
    FOCO: { x: 540, y: 380, z: 1.45 },
    // (opcional) cortes para perto dentro de uma cena: enquanto a frase n está na tela, o lugar aparece de perto no
    // ponto { x, y } (unidades do lugar), com o zoom z (de 1,3 a 2). Ex.: 4: { x: 300, y: 480, z: 1.9 }. Na ação, chega
    // ainda mais perto; no "porque", o ponto é da tela e quem cresce é o desenho (z de 1,1 a 1,3); no fecho, as últimas
    // 4 batidas voltam para o lugar inteiro. Um corte por cena deixa todo trecho sem corte abaixo de 12 s.
    PERTO: {},
    LUGAR: lugar,
    // o desenho de cada cena, pelo id ou pelo tipo da cena: o do 'porque' é a cena inteira; os outros (opcionais) entram
    // por cima do mundo e embaixo da frase, recebendo (ctx, st, caixa). Ex.: separar: (ctx, st) => { a barra da cobertura }
    DESENHO: { porque },
  };
})();
