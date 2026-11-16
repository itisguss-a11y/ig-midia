// versão 5, só para testar o motor; a peça de verdade está no chat dela
// PRESEME · "Quantas vezes você usou o SUS hoje?" · linha do tempo
// Fonte única dos tempos: o desenho (film-*.js) e o som (ferramentas/sus.js efeitos) leem daqui.
// Os tempos saem do tamanho de cada frase do textos.js: mudou o texto, o tempo se ajusta sozinho.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const TX = node ? require('./textos') : globalThis.TEXTOS;
  const FPS = 30;
  const FORMAT = U.pickFormat('9:16');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const BPM = 107; // o andamento da trilha desta peça (preseme-trilha.py, clima "curioso", semente "sus-hoje")
  const clock = MU.makeClock({ bpm: BPM, offset: 0 });
  const { T, BEAT } = clock;
  const STYLE = U.pickStyle ? U.pickStyle('paper') : 'paper';

  // leitura: 2,17 palavras por segundo e meio segundo de folga; nenhuma frase fica menos de 4 batidas
  const VEL = 2.17, FOLGA = 0.5, MINIMO = 4;
  const batidas = (n) => Math.max(MINIMO, Math.ceil((TX[n].trim().split(/\s+/).length / VEL + FOLGA) / BEAT - 0.05));

  // as cenas, na ordem. uso = o número que o contador passa a mostrar; vig = a vigilância; nome = a frase que diz o nome dela
  const ROTEIRO = [
    { id: 'abertura', linhas: [1, 2, 3] },
    { id: 'agua', hora: 'D02', linhas: [4, 5, 6], uso: 1, vig: 'amb', selo: 'gota', nome: 5 },
    { id: 'pao', hora: 'D03', linhas: [7, 8], uso: 2, vig: 'san', selo: 'pao' },
    { id: 'remedio', hora: 'D04', linhas: [9, 10, 11, 12], uso: 3, vig: 'san', selo: 'remedio', nome: 11 },
    { id: 'braco', hora: 'D05', linhas: [13, 14], uso: 4, vig: 'epi', selo: 'vacina' },
    { id: 'gotinha', hora: 'D06', linhas: [15, 16], uso: 5, vig: 'epi', selo: 'gotinha' },
    { id: 'agente', hora: 'D07', linhas: [17, 18, 19, 20], uso: 6, vig: 'epi', selo: 'mapa', nome: 19 },
    { id: 'lanche', hora: 'D08', linhas: [21, 22], uso: 7, vig: 'san', selo: 'rotulo' },
    { id: 'sal', hora: 'D09', linhas: [23, 24], uso: 8, vig: 'san', selo: 'sal' },
    { id: 'salgadinho', hora: 'D10', linhas: [25, 26], uso: 9, vig: 'san', selo: 'salgadinho' },
    { id: 'recontagem', linhas: [27, 28, 29, 30, 31] },
    { id: 'fecho', linhas: [32] },
  ];

  const cenas = [], linha = {}, efeitos = [], markers = {}, S = {}, nomeado = {};
  let b = 0, nUso = 0;
  for (const r of ROTEIRO) {
    const ls = r.linhas.filter((n) => TX[n]);
    if (!ls.length) continue;
    let bb = b;
    const itens = ls.map((n) => { const d = batidas(n); const it = { n, b0: bb, d }; bb += d; return it; });
    let total = bb - b + (r.id === 'fecho' ? 4 : 0);
    total += (4 - (total % 4)) % 4; // toda cena acaba no fim de um compasso: o corte cai junto com a música
    itens[itens.length - 1].d += total - (bb - b);
    for (const it of itens) { it.t0 = it.b0 * BEAT; it.t1 = (it.b0 + it.d) * BEAT; linha[it.n] = it; }
    const c = Object.assign({}, r, { itens, t0: b * BEAT, t1: (b + total) * BEAT });
    if (r.uso) c.uso = ++nUso; // o contador conta as cenas que ficaram: se ele apagar uma cena inteira, os números seguintes descem
    if (r.uso) { c.tLente = (itens[0].b0 + Math.max(2, Math.round(itens[0].d / 2))) * BEAT; efeitos.push({ t: c.tLente, som: 'pop', vol: 0.9 }); }
    if (r.nome && linha[r.nome]) { nomeado[r.vig] = linha[r.nome].t0; efeitos.push({ t: linha[r.nome].t0, som: 'sino', vol: 0.7 }); }
    cenas.push(c); S[c.id] = [c.t0, c.t1];
    b += total;
  }
  const DURATION = b * BEAT;

  // a faixa da vigilância (etiqueta + selos) só aparece depois que o nome dela foi dito na tela
  for (const c of cenas) {
    if (!c.uso) continue;
    const tn = nomeado[c.vig];
    c.tChip = tn === undefined || tn >= c.t1 ? Infinity : Math.max(c.tLente, tn);
    c.selos = cenas.filter((x) => x.uso && x.vig === c.vig && x.uso <= c.uso).map((x) => x.selo);
  }

  // efeitos sonoros que não são o contador nem o nome da vigilância
  if (linha[2]) efeitos.push({ t: linha[2].t0, som: 'pop', vol: 0.8 }); // o balão da resposta
  if (linha[3]) efeitos.push({ t: linha[3].t0, som: 'sopro', vol: 0.6 }); // a lente aparece pela primeira vez
  for (const n of [27, 28, 29, 30]) if (linha[n]) efeitos.push({ t: linha[n].t0, som: 'tique', vol: 0.8 }); // cada fileira da recontagem
  if (linha[31]) efeitos.push({ t: linha[31].t0, som: 'certo', vol: 0.8 }); // o resultado
  efeitos.sort((p, q) => p.t - q.t);

  // marcadores: um instante de cada cena, para a folha de quadros (node engine/render.js board) e para a conferência (qa)
  const mk = (k, t) => { markers[k] = Math.min(DURATION - 0.2, t); };
  if (linha[2]) mk('abertura', linha[2].t0 + 2 * BEAT);
  if (linha[3]) mk('tese', linha[3].t0 + 2 * BEAT);
  for (const c of cenas) {
    if (!c.uso) continue;
    mk(c.id, c.tLente + 2 * BEAT);
    // a frase vista de perto: a segunda da cena, se vier antes do nome (a mesma regra do estado(), em film-1-base.js)
    const perto = c.itens.find((it, i) => i > 0 && (!c.nome || it.n < c.nome));
    if (perto) mk(c.id + 'Perto', perto.t0 + 2 * BEAT);
    if (c.nome && linha[c.nome]) mk(c.id + 'Nome', linha[c.nome].t0 + 2 * BEAT);
  }
  if (linha[30]) mk('fileiras', linha[30].t0 + 2 * BEAT);
  if (linha[31]) mk('recontagem', linha[31].t0 + 2 * BEAT);
  if (linha[32]) mk('fecho', linha[32].t0 + 3 * BEAT);

  const cenaEm = (t) => { let c = cenas[0]; for (const x of cenas) if (t >= x.t0) c = x; return c; };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, STYLE, cenas, linha, efeitos, cenaEm, TX };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
