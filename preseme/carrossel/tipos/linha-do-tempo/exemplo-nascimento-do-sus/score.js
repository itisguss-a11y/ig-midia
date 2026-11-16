// PRESEME · carrossel · tipo LINHA DO TEMPO · peça de exemplo: como o SUS nasceu (texto de exemplo escrito pelo Opus; a
// peça de verdade passa pelo chat 1, Fable, e pela conferência dos fatos) · as lâminas, na ordem. A linha do tempo responde a pergunta da capa
// contando a história em datas: um marco por lâmina (o ano grande, o que aconteceu, o porquê, o desenho e o que mudou)
// e, por último, hoje (a resposta, a linha inteira em miniatura e a frase da prova). A linha corre de uma lâmina para
// a outra na mesma altura: quem passa o dedo vê a história andar.
// Fonte única: o desenho (film-*.js) e o motor (laminas, conferir) leem daqui. Cada lâmina ganha um instante na linha do
// tempo do motor de desenho, e o comando laminas tira uma foto parada de cada uma.
// O que o motor espera deste arquivo (não tire): FPS, FORMAT, DURATION, BEAT, BPM, markers, S, cenas, linha, efeitos, TX,
// CARROSSEL (true), LAMINAS ([{ n, id, tipo, t, linhas }]), ESTILO (o estilo do kit) e DESTAQUE.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const TX = node ? require('./textos') : globalThis.TEXTOS;

  const FPS = 30;
  const FORMAT = U.pickFormat('4:5');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const BPM = 60;
  const clock = MU.makeClock({ bpm: BPM, offset: 0 });
  const { T, BEAT } = clock;
  const STYLE = U.pickStyle ? U.pickStyle('paper') : 'paper';
  const CARROSSEL = true;
  const ESTILO = 'carimbo'; // o estilo padrão da linha do tempo (troque na hora com: laminas --estilo planta)

  // AS LÂMINAS, NA ORDEM (TROQUE: é a parte que o chat 1 escreve). Cada uma: o id, o tipo de lâmina (film-2-moldes.js),
  // o desenho que vai nela (PRESEME.DESENHO[desenho]: o do assunto fica em film-3-desenhos.js; prontos no tipo, a
  // linhaInteira e o troque) e os textos (frases pelo número; palavras do desenho como 'D01', que o desenho recebe).
  // Os tipos de lâmina da linha do tempo:
  //   capa   [pergunta], [promessa] + D etiqueta (o anel onde a linha nasce fica pendurado nela) · desenho embaixo
  //   marco  [o que aconteceu], [o porquê], [o que mudou] · ano: D do ano grande; quando: D do mês ou dia, ao lado;
  //          rotulo: D do rótulo da faixa do que mudou; desenho no meio
  //          e o que vale para o trecho da linha até a data seguinte: passos (tracinhos dos anos do meio), cota (D da
  //          distância, "3 meses", para datas próximas), salto: true (o // do tempo longo; vai no último marco) e
  //          selo (D do que aconteceu ao lado, na mesma data, carimbado em cima da linha)
  //          para a linha inteira da lâmina hoje: verbo (D do que a data fez) e data (D curta; sem ela, vale o ano)
  //   hoje   [a resposta da capa], [a frase da prova] · ano: D de "hoje"; rotulo: D do rótulo da faixa · desenho:
  //          linhaInteira (a linha toda, um verbo por data; a cena do fim da linha é DS.fimDaLinha, na peça)
  //   texto  [ideia], [detalhe] · lâmina sem data, no meio da história (a linha passa reto)
  const ROTEIRO = [
    { id: 'capa', tipo: 'capa', desenho: 'fila', linhas: [1, 2, 'D01', 'D19'] },
    { id: 'm1986', tipo: 'marco', ano: 'D02', quando: 'D03', rotulo: 'D11', verbo: 'D13', desenho: 'carteira', linhas: [3, 4, 5, 'D20', 'D21', 'D22'], passos: 1 },
    { id: 'm1988', tipo: 'marco', ano: 'D04', rotulo: 'D11', verbo: 'D14', selo: 'D18', desenho: 'constituicao', linhas: [6, 7, 8, 'D23', 'D24', 'D25', 'D26'], passos: 1 },
    { id: 'm1990a', tipo: 'marco', ano: 'D05', quando: 'D06', data: 'D07', rotulo: 'D11', verbo: 'D15', desenho: 'veto', linhas: [9, 10, 11, 'D27', 'D28', 'D29'], cota: 'D17' },
    { id: 'm1990b', tipo: 'marco', ano: 'D05', quando: 'D08', data: 'D09', rotulo: 'D11', verbo: 'D16', desenho: 'conselho', linhas: [12, 13, 14, 'D30', 'D31'], salto: true },
    { id: 'hoje', tipo: 'hoje', ano: 'D10', rotulo: 'D12', desenho: 'linhaInteira', linhas: [15, 16, 'D19'] },
  ];
  // o trecho de cada frase que vai no destaque do estilo
  const DESTAQUE = { 1: 'qualquer pessoa', 3: 'mais de quatro mil pessoas', 5: 'sistema único de saúde', 6: 'direito de todos', 8: 'qualquer pessoa e do mesmo jeito', 9: 'Lei 8.080', 11: 'vetado', 12: 'Lei 8.142', 14: 'tanto quanto', 15: 'Quem decidiu?', 16: 'A 8.080 organiza o SUS' };

  const DUR = 2; // segundos de linha do tempo por lâmina (só para o motor achar cada uma; ninguém assiste)
  const LAMINAS = [], cenas = [], linha = {}, efeitos = [], markers = {}, S = {};
  for (const r of ROTEIRO) {
    const todos = r.linhas || [];
    const vivos = todos.filter((k) => TX[k]);
    if (todos.length && !vivos.length) continue;
    const i = LAMINAS.length, t0 = i * DUR, t1 = t0 + DUR, t = t0 + DUR / 2;
    const frases = vivos.filter((k) => typeof k === 'number');
    const lam = Object.assign({}, r, { n: i + 1, t0, t1, t, linhas: frases, todas: todos, palavras: vivos.filter((k) => typeof k !== 'number') });
    LAMINAS.push(lam);
    const itens = frases.length ? frases.map((n) => ({ n, t0, t1 })) : [{ n: null, t0, t1 }];
    for (const it of itens) if (it.n) linha[it.n] = it;
    cenas.push({ id: r.id, tipo: r.tipo, t0, t1, itens, linhas: frases });
    S[r.id] = [t0, t1];
    markers['l' + String(i + 1).padStart(2, '0')] = t;
    if (!/^l\d+$/.test(r.id)) markers[r.id] = t;
  }
  const DURATION = Math.max(1, LAMINAS.length) * DUR;
  const laminaEm = (t) => { let l = LAMINAS[0]; for (const x of LAMINAS) if (t >= x.t0) l = x; return l; };
  const cenaEm = (t) => { let c = cenas[0]; for (const x of cenas) if (t >= x.t0) c = x; return c; };

  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, STYLE, ESTILO, CARROSSEL, LAMINAS, DESTAQUE, cenas, linha, efeitos, cenaEm, laminaEm, TX };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
