// PRESEME · motor "meme em vídeo" · a linha do tempo (molde). Fonte única dos tempos: o desenho (film-*.js) e o som
// (motor do reel: som) leem daqui. Os tempos saem do tamanho de cada frase do textos.js: mudou o texto, o tempo se ajusta.
// O que o motor do reel espera deste arquivo (não tire): FPS, FORMAT, DURATION, BEAT, BPM, markers, S, cenas (id, t0, t1,
// itens), linha ({ n: { t0, t1 } }), efeitos ([{ t, som, vol, pan }]) e TX. ESTILO é o do kit de estilos.
//
// O molde tem quatro tempos, sempre nesta ordem: preparacao (a situação), virada (a piada), licao (o que fica) e fecho.
// O chat 1 só mexe no bloco marcado com TROQUE (as frases de cada tempo e, se quiser, o estilo).
(function () {
  const node = typeof require !== 'undefined' && typeof module !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const TX = node ? require('./textos') : globalThis.TEXTOS;
  const FPS = 30;
  const FORMAT = U.pickFormat('9:16');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);

  // ===== TROQUE: o estilo e as frases de cada tempo =====
  // ESTILO: lapis, pixel, giz, planta, carimbo ou chapado (o padrão deste motor é chapado; o pixel art já é o padrão
  // do motor de pixel art, e os outros motores usam lápis, giz, carimbo e planta).
  const ESTILO = 'chapado';
  const ROTEIRO = [
    { id: 'preparacao', linhas: [1, 2] }, // a situação: 1 ou 2 frases
    { id: 'virada', linhas: [3], extra: 1 }, // a piada: 1 frase (o silêncio de 0,5 s vem antes dela)
    { id: 'licao', linhas: [4, 5, 6, 7, 8] }, // o que fica: de 2 a 6 frases, uma por cartão ("Termo, o que ele quer dizer.")
    { id: 'fecho', linhas: [9, 10], extra: 2 }, // a volta: 1 ou 2 frases
  ];
  // ===== fim do TROQUE =====

  // o meme corre: 120 batidas por minuto (uma batida = 0,5 s) e o corte cai a cada 2 batidas, não a cada compasso
  const BPM = 120;
  const clock = MU.makeClock({ bpm: BPM, offset: 0 });
  const { T, BEAT } = clock;

  // leitura (regra do motor do reel, igual em toda peça): palavras ÷ 2,17 por segundo + 0,5 s de folga.
  // Mínimo de 3 batidas (1,5 s), para a frase curta da piada ("Eu não sei...") ter o tempo da pausa.
  const VEL = 2.17, FOLGA = 0.5, MINIMO = 3;
  const batidas = (n) => Math.max(MINIMO, Math.ceil((TX[n].trim().split(/\s+/).length / VEL + FOLGA) / BEAT - 0.05));

  const cenas = [], linha = {}, efeitos = [], markers = {}, S = {};
  let b = 0;
  for (const r of ROTEIRO) {
    const ls = r.linhas.filter((n) => TX[n]);
    if (!ls.length) continue; // tempo com todas as frases apagadas sai do vídeo
    let bb = b;
    const itens = ls.map((n) => { const d = batidas(n); const it = { n, b0: bb, d }; bb += d; return it; });
    let total = bb - b + (r.extra || 0);
    total += total % 2; // o corte cai numa batida par: junto com a música
    itens[itens.length - 1].d += total - (bb - b);
    for (const it of itens) { it.t0 = it.b0 * BEAT; it.t1 = (it.b0 + it.d) * BEAT; linha[it.n] = it; }
    const c = Object.assign({}, r, { itens, t0: b * BEAT, t1: (b + total) * BEAT });
    cenas.push(c); S[c.id] = [c.t0, c.t1];
    b += total;
  }
  const DURATION = b * BEAT;
  const cena = (id) => cenas.find((c) => c.id === id);

  // ===== efeitos sonoros do molde (pop, gota, tique, sopro, sino, certo, baque, lapis) =====
  const P = cena('preparacao'), V = cena('virada'), L = cena('licao'), F = cena('fecho');
  // o gancho dos 3 primeiros segundos (o motor mede: movimento antes de 1 s e 2 batidas antes de 3 s): a situação
  // entra subindo aos 0,25 s, com um pop, e a câmera dá um zoom seco no foco da 1.ª frase aos 1,4 s, com um baque
  // (só se a 1.ª frase durar 1,8 s ou mais). O desenho lê os mesmos tempos daqui (GANCHO).
  const GANCHO = { entrada: 0.25, zoom: 1.2, zoomEm: null };
  if (P) {
    const f1 = P.itens[0];
    if (f1.t1 - f1.t0 >= 1.8) GANCHO.zoomEm = f1.t0 + 1.4;
    efeitos.push({ t: P.t0 + GANCHO.entrada, som: 'pop', vol: 0.65, pan: 0 });
    if (GANCHO.zoomEm !== null) efeitos.push({ t: GANCHO.zoomEm, som: 'baque', vol: 0.85, pan: -0.15 });
    // o relógio da prova: um tique por segundo, do 2.º segundo até meio segundo antes da virada (que tem silêncio antes)
    for (let t = P.t0 + 2; t < P.t1 - 0.6; t += 1) efeitos.push({ t, som: 'tique', vol: 0.32, pan: 0.35 });
  }
  // a virada: o sino no corte seco
  if (V) efeitos.push({ t: V.t0, som: 'sino', vol: 0.9, pan: 0 });
  // a lição: um pop por cartão, um de cada lado do fone
  if (L) L.itens.forEach((it, i) => efeitos.push({ t: it.t0 + 0.04, som: 'pop', vol: 0.7, pan: i % 2 ? 0.3 : -0.3 }));
  // o fecho: o carimbo bate na primeira frase; a seta risca na segunda
  if (F) {
    efeitos.push({ t: F.itens[0].t0 + 0.45, som: 'baque', vol: 0.8, pan: 0.2 });
    if (F.itens[1]) efeitos.push({ t: F.itens[1].t0 + 0.25, som: 'lapis', vol: 0.55, pan: -0.2 });
  }
  efeitos.sort((p, q) => p.t - q.t);

  // marcadores: um por frase, quando ela já está inteira na tela (folha de quadros, capa, qa e cores),
  // e "principal", o quadro da parada 2 (a virada, já assentada)
  const mk = (k, t) => { markers[k] = Math.min(DURATION - 0.2, t); };
  for (const c of cenas) c.itens.forEach((it, i) => mk(i ? `${c.id}${i + 1}` : c.id, it.t0 + Math.min(2 * BEAT, (it.t1 - it.t0) / 2)));
  if (V) mk('principal', V.t0 + Math.min(1.4, (V.t1 - V.t0) * 0.6));

  const cenaEm = (t) => { let c = cenas[0]; for (const x of cenas) if (t >= x.t0) c = x; return c; };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, ESTILO, cenas, linha, efeitos, cenaEm, cena, TX, GANCHO };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
