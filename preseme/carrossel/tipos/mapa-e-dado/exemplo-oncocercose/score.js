// PRESEME · carrossel · tipo MAPA E DADO · as lâminas, na ordem. Fonte única: o desenho (film-*.js) e o motor (laminas,
// conferir) leem daqui. O mapa e dado põe uma doença ou um número de Roraima no mapa: o número oficial ao lado do resto,
// por que é daqui (o vetor e o lugar, nunca as pessoas), como se previne, quem notifica e o cartão-resumo.
// O carrossel não tem som nem vídeo: cada lâmina ganha um instante na linha do tempo, e o comando laminas tira a foto.
// O que o motor espera deste arquivo (não tire): FPS, FORMAT, DURATION, BEAT, BPM, markers, S, cenas, linha, efeitos, TX,
// CARROSSEL (true), LAMINAS ([{ n, id, tipo, t, linhas }]), ESTILO e DESTAQUE. Este tipo também exporta MAPAS.
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
  const ESTILO = 'chapado'; // o estilo padrão do mapa e dado (troque na hora com: laminas --estilo planta)

  // OS MAPAS (TROQUE se o lugar for outro): o contorno de base (municípios) e a área marcada, em assets/, lidos pelo
  // film-9-filme.js antes da primeira lâmina. base: { fonte, municipios: { nome: [anel, ...] } }; area: { fonte, aneis: [anel, ...] }
  const MAPAS = { base: 'assets/rr.json', area: 'assets/yanomami.json' };
  // O MAPA DESTA PEÇA (TROQUE): o recorte em longitude e latitude, onde vai cada rótulo (na ordem das palavras D da lâmina
  // mapa, depois da etiqueta; tipo area, pais, estado ou cidade), o alfinete da capa e os municípios a marcar em Coral
  const MAPA = {
    caixa: { lon0: -66.8, lon1: -58.5, lat0: -1.8, lat1: 5.5 },
    rotulos: [
      { tipo: 'area', lon: -63.6, lat: 2.2 }, // área endêmica
      { tipo: 'pais', lon: -64.9, lat: 4.95 }, // VENEZUELA
      { tipo: 'pais', lon: -64.6, lat: -1.15 }, // AMAZONAS
      { tipo: 'estado', lon: -60.25, lat: 0.55 }, // RORAIMA
      { tipo: 'pais', lon: -58.55, lat: 4.3, align: 'right' }, // GUIANA
      { tipo: 'cidade', lon: -60.6733, lat: 2.8197 }, // Boa Vista
    ],
    alvo: { lon: -63.6, lat: 2.6 },
    destaques: [],
  };

  // AS LÂMINAS, NA ORDEM (TROQUE: é a parte que o chat 1 escreve). Cada uma: o id, o tipo de lâmina (film-3-moldes.js),
  // o desenho que vai nela, quando o tipo pede (PRESEME.DESENHO[desenho]: o mapa e o troque são do tipo, em
  // film-2-moldes.js; os outros são da peça, em film-3-desenhos.js) e os textos do
  // textos.txt (frases pelo número, palavras do desenho como 'D01'; em toda lâmina, a primeira palavra D é a etiqueta).
  // Os tipos de lâmina do mapa e dado:
  //   capa      [título], [promessa] + D etiqueta · o mapa embaixo (desenho)
  //   numero    [o que o número diz], [o detalhe] + D etiqueta, D número 1, D o que ele é, D número 2, D o que ele é
  //   mapa      [onde está], [o detalhe] + D etiqueta, D rótulos do mapa (na ordem de MAPA.rotulos, acima)
  //   porque    [por que é daqui], [o detalhe] + D etiqueta, D rótulos do desenho (o vetor, o lugar)
  //   sinais    [frase 1], [frase 2] + D etiqueta, D nome 1, D nome 2 · dois cartões, cada um com o desenho(ctx, caixa, lam, i)
  //   prevencao [como se previne], [o detalhe] + D etiqueta, até 3 D, cada uma num cartão com o desenho(ctx, caixa, lam, i)
  //   grafico   [o que caiu ou subiu], [o detalhe] + D etiqueta e os pares D (rótulo, valor): a barra sai do valor
  //   notifica  [quem notifica], [o detalhe] + D etiqueta, até 3 D (quem, quando, onde) · a ficha de notificação
  //   fase      [onde a luta está], [o detalhe] + D etiqueta, D fases (da de agora até a meta), D o rótulo do "agora"
  //   resumo    até 4 frases (o cartão para print) + D etiqueta, D fontes
  // Doença sem fonte de notificação (como esta): a lâmina notifica fica de fora, e o README diz por quê.
  const ROTEIRO = [
    { id: 'capa', tipo: 'capa', desenho: 'mapa', linhas: [1, 2, 'D01'] },
    { id: 'numero', tipo: 'numero', linhas: [3, 4, 'D02', 'D03', 'D04', 'D05', 'D06'] },
    { id: 'mapa', tipo: 'mapa', desenho: 'mapa', linhas: [5, 6, 'D07', 'D08', 'D09', 'D10', 'D11', 'D12', 'D13'] },
    { id: 'porque', tipo: 'porque', desenho: 'borrachudo', linhas: [7, 8, 'D14', 'D15', 'D16'] },
    { id: 'sinais', tipo: 'sinais', desenho: 'sinal', linhas: [9, 10, 'D17', 'D18', 'D19'] },
    { id: 'prevencao', tipo: 'prevencao', desenho: 'prevencao', linhas: [11, 12, 'D20', 'D21', 'D22', 'D23'] },
    { id: 'queda', tipo: 'grafico', linhas: [13, 14, 'D24', 'D25', 'D26', 'D27', 'D28', 'D29', 'D30', 'D31', 'D32'] },
    { id: 'fase', tipo: 'fase', linhas: [15, 16, 'D33', 'D34', 'D35', 'D36'] },
    { id: 'resumo', tipo: 'resumo', linhas: [17, 18, 19, 20, 'D37', 'D38'] },
  ];

  // o trecho de cada frase que vai no destaque do estilo (TROQUE com o texto)
  const DESTAQUE = { 1: 'último foco', 3: 'já eliminaram', 5: 'na fronteira com a Venezuela', 7: 'borrachudo', 9: 'nódulos', 10: 'cegueira dos rios', 11: 'tratar a área inteira', 13: '2,5% em 2016', 15: 'Não houve caso com sintoma', 17: 'Último foco', 19: 'duas vezes por ano', 20: 'o tratamento continua' };

  const DUR = 2; // segundos de linha do tempo por lâmina (só para o motor achar cada uma; ninguém assiste)
  const LAMINAS = [], cenas = [], linha = {}, efeitos = [], markers = {}, S = {};
  for (const r of ROTEIRO) {
    const todos = r.linhas || [];
    const vivos = todos.filter((k) => TX[k]);
    if (todos.length && !vivos.length) continue;
    const i = LAMINAS.length, t0 = i * DUR, t1 = t0 + DUR, t = t0 + DUR / 2;
    const frases = vivos.filter((k) => typeof k === 'number');
    const lam = Object.assign({}, r, { n: i + 1, t0, t1, t, linhas: frases, palavras: vivos.filter((k) => typeof k !== 'number') });
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
  const SCORE = { MAPAS, MAPA, FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, STYLE, ESTILO, CARROSSEL, LAMINAS, DESTAQUE, cenas, linha, efeitos, cenaEm, laminaEm, TX };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
