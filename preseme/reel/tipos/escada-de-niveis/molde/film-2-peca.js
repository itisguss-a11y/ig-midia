// PRESEME · motor "escada de níveis" · desenho 2 · a peça · MOLDE: o chat 1 troca o que está marcado com TROQUE
// Exemplo completo: ../exemplo-niveis-de-prevencao/film-2-peca.js (os níveis de prevenção a partir da mamografia).
// O que é do molde (a escada, a pessoa que sobe, as placas, o corrimão, o quadro, o texto e os quadros prontos)
// está no film-1-molde.js e não muda.
(function () {
  const P = globalThis.ESCADA, Q = P.PRONTO, E = globalThis.ESTILOS;

  // TROQUE: o trecho de cada frase que leva o destaque do estilo (escrito igual ao da frase no textos.txt).
  // Frase que não tem trecho aqui sai sem destaque. Se ele mudar a frase e o trecho sumir, sai sem destaque, sem erro.
  P.DESTAQUE[3] = 'TROQUE';

  // TROQUE: quem sobe a escada, do kit de estilos: 'moradora', 'calouro' ou 'agente' (style muda roupa, cabelo, óculos:
  // as chaves do Ch.person, ex. { glasses: 'round' }), e o gesto parado em cada cena (pelo id da cena):
  // wave, point, pointUp, thumbsUp, think, shrug, akimbo, cheer, clap, phone. Sem gesto, ela só sorri.
  P.PESSOA = { quem: 'moradora', style: {}, gestos: { abertura: 'think', escada: 'thumbsUp' } };

  // TROQUE: o desenho do quadro de cada cena (pelo id da cena; o fecho não leva quadro).
  // Primeiro, os quadros prontos (Q). Palavra vem do textos.txt pela chave ('D10') ou escrita direto. frase = a partir de
  // que frase da cena (0 = a primeira); quando = segundos depois que essa frase entrou (na 1.ª frase da cena, depois que o
  // quadro entrou: a cena começa de perto e o quadro só entra quando a câmera abre, uns 2 s depois do corte).
  //   Q.lista(['D10', 'D11', 'D12'], { frase: 1, quando: [1.4, 2.6, 3.5] })          lista com o visto entrando item a item
  //   Q.regua({ de: 'D14', ate: 'D15', marcas: 13, rotulo: 'D16', frase: 1,
  //            marca: { n: 1, frase: 2, quando: 3.6, carimbo: 'D17' } })              régua de uma ponta à outra, com uma marca
  //   Q.lupa({ quando: 1.0 })                                                          a lupa que acha um ponto pequeno
  //   Q.trilha(['D18', 'D19', 'D20'], { destaque: 1, anda: [{ frase: 0, quando: 0.8, para: 1 }] })   etapas e o ponto que desce
  //   Q.pilha({ total: 7, acima: 3, rotulo: 'D24' })                                   folhas que passam da linha (o excesso)
  //   Q.fileiras([{ rotulo: 'D21', marcas: [0, 1, 2, 3, 4], apagada: true }, { rotulo: 'D22', marcas: [0, 2, 4] }],
  //              { visto: { linha: 1, quando: 3.4 }, carimbo: { k: 'D23', linha: 0, frase: 1, quando: 1.9 } })   comparar quantas vezes
  //   Q.porFrase([[0, desenhoA], [2, desenhoB]])                                       A nas frases 0 e 1, B da 2 em diante
  //   Q.juntos(desenhoA, desenhoB)                                                     os dois, um por cima do outro
  // Se nenhum servir, desenhe à mão: fn(ctx, caixa, o), com caixa = { x, y, w, h }, a área de dentro do quadro
  // (até 596 × 286 px; mais estreito quando a pessoa está embaixo dele); o.k = a entrada do quadro (0 a 1); o.i = qual frase da cena está na tela (0, 1, 2…); o.ti = segundos
  // desde que essa frase entrou; o.tc = segundos desde o corte da cena. Só com o kit (E.ret, E.circulo, E.poligono,
  // E.linha, E.seta, E.cota, E.texto, E.carimbo, E.objeto, E.personagem): assim o estilo muda o desenho inteiro junto.
  const provisorio = (rotulo) => (ctx, cx) => {
    rotulo.split('|').forEach((l, i) => E.texto(ctx, l, cx.x + cx.w / 2, cx.y + cx.h / 2 - 10 + i * 40, { papel: 'mao', size: 28, align: 'center' }));
  };
  P.PAINEL.degrau1 = provisorio('(TROQUE:|o desenho do degrau 1)');
  P.PAINEL.degrau2 = provisorio('(TROQUE:|o desenho do degrau 2)');
  P.PAINEL.degrau3 = provisorio('(TROQUE:|o desenho do degrau 3)');
  P.PAINEL.corrimao = provisorio('(TROQUE:|o desenho do corrimão)');
})();
