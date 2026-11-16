// PRESEME · série "Na UBS, e agora?" · linha do tempo (molde fixo da série)
// Fonte única dos tempos: o desenho (film-*.js) e o som (mapa-do-som.json + efeitos daqui) leem deste arquivo.
// Os tempos saem do tamanho de cada frase do textos.js: mudou o texto, o tempo se ajusta sozinho.
// O chat 1 preenche só o bloco ROTEIRO (as cenas da peça, em ordem) e o BPM; o resto é do molde e não muda.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const TX = node ? require('./textos') : globalThis.TEXTOS;
  const FPS = 30;
  const FORMAT = U.pickFormat('9:16');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const STYLE = 'paper'; // a cara da série: lápis no papel (acabamento A)

  // ===================== PREENCHER (chat 1): o andamento e as cenas da peça =====================
  const BPM = 100;
  // tipos de cena do molde (a ordem é livre, mas a série segue esta): situacao · pergunta · passo · alerta · especial · equipe · ligue192 · erro · fecho
  // passo: num = o número do passo; gesto = o desenho do gesto (film-2-peca.js); conta = quantas batidas contam o gesto (golpes, compressões)
  const ROTEIRO = [
    { id: 'situacao', tipo: 'situacao', linhas: [1, 2] },
    { id: 'pergunta', tipo: 'pergunta', linhas: [3] },
    { id: 'passo1', tipo: 'passo', num: 1, gesto: 'ligar', linhas: [4, 5] },
    { id: 'passo2', tipo: 'passo', num: 2, gesto: 'tosse', linhas: [6, 7] },
    { id: 'passo3', tipo: 'passo', num: 3, gesto: 'golpes', conta: 5, rotulo: 'D03', linhas: [8, 9] },
    { id: 'passo4', tipo: 'passo', num: 4, gesto: 'compressoes', conta: 5, rotulo: 'D04', linhas: [10, 11] },
    { id: 'passo5', tipo: 'passo', num: 5, gesto: 'ciclo', linhas: [12] },
    { id: 'desmaio', tipo: 'alerta', gesto: 'rcp', linhas: [13, 14] },
    { id: 'especiais', tipo: 'especial', gestos: ['gravida', 'bebe'], linhas: [15, 16] },
    { id: 'equipe', tipo: 'equipe', gesto: 'samu', linhas: [17, 18] },
    { id: 'ligue', tipo: 'ligue192', linhas: [19, 20] },
    { id: 'erro', tipo: 'erro', gesto: 'tapaErrado', linhas: [21, 22] },
    { id: 'fecho', tipo: 'fecho', linhas: [23] },
  ];
  // ============================================================================================

  const clock = MU.makeClock({ bpm: BPM, offset: 0 });
  const { T, BEAT } = clock;
  // leitura: 2,17 palavras por segundo e meio segundo de folga; nenhuma frase fica menos de 4 batidas
  const VEL = 2.17, FOLGA = 0.5, MINIMO = 4;
  const palavras = (n) => (TX[n] || '').trim().split(/\s+/).filter(Boolean).length;
  const batidas = (n) => Math.max(MINIMO, Math.ceil((palavras(n) / VEL + FOLGA) / BEAT - 0.05));

  const cenas = [], linha = {}, efeitos = [], markers = {}, S = {};
  const ABERTURA = { queda: 0.3, alerta: 1.2 }; // segundos depois do início da peça
  const passos = ROTEIRO.filter((r) => r.tipo === 'passo').length;
  let b = 0;
  for (const r of ROTEIRO) {
    const ls = r.linhas.filter((n) => TX[n]);
    if (!ls.length) continue;
    let bb = b;
    const itens = ls.map((n, i) => {
      let d = batidas(n);
      if (i === 0 && r.conta) d = Math.max(d, r.conta + 4); // a conta do gesto (1 por batida) cabe na primeira frase do passo
      if (r.tipo === 'pergunta') d = Math.max(d, 6); // a pergunta fica no ar
      const it = { n, b0: bb, d }; bb += d; return it;
    });
    let total = bb - b + (r.tipo === 'fecho' ? 4 : 0);
    total += (4 - (total % 4)) % 4; // toda cena acaba no fim de um compasso: o corte cai junto com a música
    itens[itens.length - 1].d += total - (bb - b);
    for (const it of itens) { it.t0 = it.b0 * BEAT; it.t1 = (it.b0 + it.d) * BEAT; linha[it.n] = { t0: it.t0, t1: it.t1 }; }
    const c = Object.assign({}, r, { itens, t0: b * BEAT, t1: (b + total) * BEAT, passos });
    // a conta do gesto: uma batida por golpe, começando na 2ª batida da primeira frase
    if (r.conta) c.tConta = Array.from({ length: r.conta }, (_, k) => (itens[0].b0 + 2 + k) * BEAT);
    cenas.push(c); S[c.id] = [c.t0, c.t1];
    b += total;
  }
  const DURATION = b * BEAT;

  // ---------- efeitos sonoros (o som do que acontece na tela; o som do lugar está no mapa-do-som.json) ----------
  const ef = (t, som, vol = 0.8, pan = 0) => efeitos.push({ t, som, vol, pan });
  for (const c of cenas) {
    if (c.tipo === 'passo') ef(c.t0 + 0.05, 'sino', 0.55); // o número do passo acende na trilha
    if (c.tConta) c.tConta.forEach((t, k) => ef(t, 'baque', 0.75 + 0.03 * k, -0.2)); // cada golpe, cada compressão
    if (c.gesto === 'ligar') [0, 1, 2].forEach((k) => ef(c.itens[0].t0 + BEAT * (1 + k * 0.5), 'tique', 0.7)); // 1, 9, 2
    if (c.gesto === 'ciclo') ef(c.itens[0].t1 - BEAT * 1.5, 'pop', 0.9); // o objeto sai
    if (c.tipo === 'alerta') ef(c.t0 + 0.05, 'baque', 0.9);
    if (c.tipo === 'erro') ef(c.itens[0].t0 + BEAT * 2, 'pop', 0.8, 0.3); // o X em cima do tapa
    if (c.tipo === 'ligue192') ef(c.t0 + 0.05, 'sino', 0.7);
    if (c.tipo === 'fecho') ef(c.t0 + BEAT, 'certo', 0.8);
  }
  // a abertura (o gancho dos 3 primeiros segundos): o problema já está no primeiro quadro e o som marca duas batidas,
  // a queda da comida (baque) e o "!" (sino, com o primeiro close). O desenho da situação lê os mesmos tempos de ABERTURA
  if (linha[1]) { ef(linha[1].t0 + ABERTURA.queda, 'baque', 0.95, 0.2); ef(linha[1].t0 + ABERTURA.alerta, 'sino', 1.0, 0.2); }
  if (linha[2]) ef(linha[2].t0, 'sopro', 0.6); // ele tenta puxar o ar
  efeitos.sort((p, q) => p.t - q.t);

  // ---------- marcadores: um instante de cada cena, para a folha de quadros e para a conferência ----------
  const mk = (k, t) => { markers[k] = Math.min(DURATION - 0.2, Math.max(0, t)); };
  for (const c of cenas) {
    const it0 = c.itens[0], it1 = c.itens[1];
    mk(c.id, it0.t0 + Math.min(it0.t1 - it0.t0 - 0.1, (c.tConta ? 6 : 2.5) * BEAT));
    if (it1) mk(c.id + 'B', it1.t0 + 2 * BEAT); // o nome não leva hífen: no render.js, "@x-2" quer dizer 2 s antes de @x
  }

  const cenaEm = (t) => { let c = cenas[0]; for (const x of cenas) if (t >= x.t0) c = x; return c; };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, STYLE, cenas, linha, efeitos, cenaEm, TX, ROTEIRO, ABERTURA };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
