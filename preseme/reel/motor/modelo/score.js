// PRESEME · linha do tempo da peça (modelo do motor). Fonte única dos tempos: o desenho (film-*.js) e o som (motor: som)
// leem daqui. Os tempos saem do tamanho de cada frase do textos.js: mudou o texto, o tempo se ajusta sozinho.
// O que o motor espera deste arquivo (não tire): FPS, FORMAT, DURATION, BEAT, BPM, markers, S, cenas (id, t0, t1, itens),
// linha ({ n: { t0, t1 } }), efeitos ([{ t, som, vol, pan }]) e TX.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const TX = node ? require('./textos') : globalThis.TEXTOS;
  const FPS = 30;
  const FORMAT = U.pickFormat('9:16');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  // o andamento: no som em blocos, é o da música; no modo trilha, tem de ser o que a trilha der para o clima e a semente
  // (o comando som avisa o número certo se não bater)
  const BPM = 100;
  const clock = MU.makeClock({ bpm: BPM, offset: 0 });
  const { T, BEAT } = clock;
  const STYLE = U.pickStyle ? U.pickStyle('paper') : 'paper';

  // leitura (regra do motor, igual em toda peça): palavras ÷ 2,17 por segundo + 0,5 s de folga; nenhuma frase fica menos de 4 batidas
  const VEL = 2.17, FOLGA = 0.5, MINIMO = 4;
  const batidas = (n) => Math.max(MINIMO, Math.ceil((TX[n].trim().split(/\s+/).length / VEL + FOLGA) / BEAT - 0.05));

  // AS CENAS, NA ORDEM (a parte que o chat 1 escreve): o id da cena e as frases do textos.txt que aparecem nela.
  // extra: batidas a mais no fim da cena (o fecho costuma ter 4, para o vídeo não acabar em cima da última palavra)
  const ROTEIRO = [
    { id: 'abertura', linhas: [1, 2] },
    { id: 'meio', linhas: [3, 4] },
    { id: 'fecho', linhas: [5], extra: 4 },
  ];

  const cenas = [], linha = {}, efeitos = [], markers = {}, S = {};
  let b = 0;
  for (const r of ROTEIRO) {
    const ls = r.linhas.filter((n) => TX[n]);
    if (!ls.length) continue; // cena com todas as frases apagadas sai do vídeo
    let bb = b;
    const itens = ls.map((n) => { const d = batidas(n); const it = { n, b0: bb, d }; bb += d; return it; });
    let total = bb - b + (r.extra || 0);
    total += (4 - (total % 4)) % 4; // toda cena acaba no fim de um compasso: o corte cai junto com a música
    itens[itens.length - 1].d += total - (bb - b);
    for (const it of itens) { it.t0 = it.b0 * BEAT; it.t1 = (it.b0 + it.d) * BEAT; linha[it.n] = it; }
    const c = Object.assign({}, r, { itens, t0: b * BEAT, t1: (b + total) * BEAT });
    cenas.push(c); S[c.id] = [c.t0, c.t1];
    b += total;
  }
  const DURATION = b * BEAT;

  // efeitos sonoros (pop, gota, tique, sopro, sino, certo, baque, lapis): um pop em cada corte, menos no primeiro
  for (const c of cenas.slice(1)) efeitos.push({ t: c.t0, som: 'pop', vol: 0.7 });
  efeitos.sort((p, q) => p.t - q.t);

  // marcadores: um instante por frase, quando ela já está inteira na tela (folha de quadros, capa, qa e cores)
  const mk = (k, t) => { markers[k] = Math.min(DURATION - 0.2, t); };
  for (const c of cenas) c.itens.forEach((it, i) => mk(i ? `${c.id}${i + 1}` : c.id, it.t0 + Math.min(2 * BEAT, (it.t1 - it.t0) / 2)));

  const cenaEm = (t) => { let c = cenas[0]; for (const x of cenas) if (t >= x.t0) c = x; return c; };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, STYLE, cenas, linha, efeitos, cenaEm, TX };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
