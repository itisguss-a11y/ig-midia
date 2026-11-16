// PRESEME · motor "escada de níveis" · desenho 2 · a peça · EXEMPLO: os níveis de prevenção a partir da mamografia
// Texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.
// O que é do molde (a escada, a pessoa que sobe, as placas, o corrimão, o quadro, o texto e os quadros prontos)
// está no film-1-molde.js. Aqui ficam só os destaques, a pessoa e que quadro pronto vai em cada cena.
(function () {
  const P = globalThis.ESCADA, Q = P.PRONTO;

  // o trecho de cada frase que leva o destaque do estilo (igual ao da frase no textos.txt)
  P.DESTAQUE[1] = 'previne';
  P.DESTAQUE[3] = 'Prevenção primária';
  P.DESTAQUE[5] = 'Prevenção secundária';
  P.DESTAQUE[6] = 'a cada dois anos';
  P.DESTAQUE[8] = 'Prevenção terciária';
  P.DESTAQUE[10] = 'Prevenção quaternária';
  P.DESTAQUE[11] = 'é o corrimão';
  P.DESTAQUE[13] = 'alarme falso';
  P.DESTAQUE[14] = 'acha cedo';
  P.DESTAQUE[15] = 'prevenção secundária';

  // a Dona Lúcia, de 52 anos: a moradora do kit, de óculos; o gesto parado em cada cena
  P.PESSOA = { quem: 'moradora', style: { glasses: 'round' }, gestos: { abertura: 'think', degrau1: 'wave', degrau2: 'think', degrau3: 'cheer', escada: 'thumbsUp' } };

  // degrau 1 · primária: a lista do que ela faz; cada item ganha o visto quando a frase [04] chega nele
  P.PAINEL.degrau1 = Q.lista(['D10', 'D11', 'D12', 'D13'], { frase: 1, quando: [1.4, 2.6, 3.5, 4.6] });

  // degrau 2 · secundária: a lupa que acha cedo; depois a régua de 50 a 74 anos (13 exames, um a cada dois anos);
  // na [07], o exame dos 52 (a segunda marca) é o que achou
  P.PAINEL.degrau2 = Q.porFrase([
    [0, Q.lupa({ quando: 1.0 })],
    [1, Q.regua({ de: 'D14', ate: 'D15', marcas: 13, rotulo: 'D16', frase: 1, marca: { n: 1, frase: 2, quando: 3.6, carimbo: 'D17' } })],
  ]);

  // degrau 3 · terciária: do tratamento para a reabilitação ([08]) e dela para a rotina ([09])
  P.PAINEL.degrau3 = Q.trilha(['D18', 'D19', 'D20'], { destaque: 1, anda: [{ frase: 0, quando: 0.8, para: 1 }, { frase: 1, quando: 2.4, para: 2 }] });

  // o corrimão · quaternária: a pilha de exames que passa da linha ([10] e [11]); depois, todo ano × a cada 2 anos ([12])
  // e o carimbo do alarme falso em cima do todo ano ([13])
  P.PAINEL.corrimao = Q.porFrase([
    [0, Q.pilha({ total: 7, acima: 3, rotulo: 'D24' })],
    [2, Q.fileiras([{ rotulo: 'D21', marcas: [0, 1, 2, 3, 4], apagada: true }, { rotulo: 'D22', marcas: [0, 2, 4] }],
      { frase: 2, visto: { linha: 1, frase: 2, quando: 3.4 }, carimbo: { k: 'D23', linha: 0, frase: 3, quando: 1.9 } })],
  ]);
})();
