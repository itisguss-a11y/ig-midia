// PRESEME · carrossel · tipo PERGUNTAS E RESPOSTAS · peça de exemplo: a vacina e o frio (texto de exemplo escrito pelo
// Opus; a peça de verdade passa pelo chat 1, Fable, e pela conferência dos fatos) · as lâminas, na ordem. Dúvidas de verdade, uma por lâmina: a dúvida
// escrita à mão no balão, a resposta, o desenho que explica e o detalhe; no fim, a ficha do resumo, para salvar.
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
  const ESTILO = 'lapis'; // o estilo padrão de perguntas e respostas (troque na hora com: laminas --estilo giz)

  // AS LÂMINAS, NA ORDEM (TROQUE: é a parte que o chat 1 escreve). Cada uma: o id, o tipo de lâmina (film-2-moldes.js),
  // o desenho que vai nela (PRESEME.DESENHO[desenho]: o do assunto fica em film-3-desenhos.js; pronto no tipo, o troque)
  // e os textos (frases pelo número; palavras do desenho como 'D01', que o desenho recebe).
  // Os tipos de lâmina de perguntas e respostas:
  //   capa      [título], [promessa] + D etiqueta · desenho embaixo
  //   pergunta  [a dúvida, como alguém pergunta], [a resposta], [o detalhe] + as D do desenho · a trilha das dúvidas
  //             em cima conta as lâminas pergunta sozinha; de 3 a 6 dúvidas
  //   resumo    uma frase por dúvida (a ficha para salvar) + D etiqueta, D fonte
  //   texto     [ideia], [detalhe] + D etiqueta · desenho no meio, se houver
  const ROTEIRO = [
    { id: 'capa', tipo: 'capa', desenho: 'esquentou', linhas: [1, 2, 'D01', 'D04', 'D05'] },
    { id: 'p1', tipo: 'pergunta', desenho: 'faixa', linhas: [3, 4, 5, 'D04', 'D05', 'D06'] },
    { id: 'p2', tipo: 'pergunta', desenho: 'paradas', linhas: [6, 7, 8, 'D07', 'D08', 'D09', 'D10'] },
    { id: 'p3', tipo: 'pergunta', desenho: 'alarme', linhas: [9, 10, 11, 'D11', 'D12', 'D04', 'D05'] },
    { id: 'p4', tipo: 'pergunta', desenho: 'monitor', linhas: [12, 13, 14, 'D13', 'D14'] },
    { id: 'resumo', tipo: 'resumo', linhas: [15, 16, 17, 18, 'D02', 'D03'] },
  ];
  // o trecho de cada frase que vai no destaque do estilo
  const DESTAQUE = { 1: 'ainda protege?', 4: 'entre 2 °C e 8 °C', 7: 'rede de paradas', 10: 'em 3 °C ou 7 °C', 13: 'a cada hora', 15: 'entre 2 °C e 8 °C', 16: 'com a temperatura registrada', 17: 'em 3 °C e 7 °C', 18: 'igual ou mais escuro' };

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
