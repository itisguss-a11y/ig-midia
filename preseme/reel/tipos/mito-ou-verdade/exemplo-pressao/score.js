// PRESEME · motor "Mito ou verdade" · linha do tempo · EXEMPLO: três frases sobre pressão · texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos
// Fonte única dos tempos: o desenho (film-*.js) e o som (mapa-do-som.json + efeitos daqui) leem deste arquivo.
// Os tempos saem do tamanho de cada frase do textos.js: mudou o texto, o tempo se ajusta sozinho.
// O chat 1 preenche só o bloco PREENCHER (andamento, estilo e as frases de cada parte); o resto é do molde.
// O que o motor do reel espera daqui (não tire): FPS, FORMAT, DURATION, BEAT, BPM, markers, S, cenas, linha, efeitos e TX.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const TX = node ? require('./textos') : globalThis.TEXTOS;
  const FPS = 30;
  const FORMAT = U.pickFormat('9:16');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);

  // ===================== PREENCHER (chat 1) =====================
  const BPM = 100;
  const ESTILO = 'chapado'; // a cara do tipo (kit de estilos): infográfico chapado ★; a parada 2 mostra também lapis e carimbo
  // A abertura: a frase do gancho (o título inteiro já no primeiro quadro).
  const ABERTURA = [1];
  // As três frases que todo mundo repete, na ordem em que uma puxa a outra. Cada uma tem:
  //   frase: o número da frase dita no balão (com as aspas, como a pessoa fala)
  //   veredito: o número da frase do selo; ela COMEÇA com MITO, VERDADE ou DEPENDE (o resto da frase sai embaixo do selo)
  //   porque: os números das frases que explicam, com o desenho do porquê (film-2-peca.js, PECA.PORQUE[1], [2] e [3])
  const ITENS = [
    { frase: 2, veredito: 3, porque: [4, 5, 6] },
    { frase: 7, veredito: 8, porque: [9, 10] },
    { frase: 11, veredito: 12, porque: [13, 14, 15] },
  ];
  // O fecho: a regra que junta as três (uma frase; duas, no máximo).
  const FECHO = [16];
  // ==============================================================

  const clock = MU.makeClock({ bpm: BPM, offset: 0 });
  const { T, BEAT } = clock;
  const VEL = 2.17, FOLGA = 0.5, MINIMO = 4; // leitura: 2,17 palavras por segundo e meio segundo de folga; nunca menos de 4 batidas
  const palavras = (n) => (TX[n] || '').trim().split(/\s+/).filter(Boolean).length;
  const batidas = (n) => Math.max(MINIMO, Math.ceil((palavras(n) / VEL + FOLGA) / BEAT - 0.05));

  // as cenas, montadas do PREENCHER: abertura, e para cada frase a cena do balão (frase + selo) e a do porquê; o fecho
  const ROTEIRO = [{ id: 'abertura', tipo: 'abertura', linhas: ABERTURA }];
  ITENS.forEach((it, i) => {
    ROTEIRO.push({ id: `mito${i + 1}`, tipo: 'mito', k: i + 1, linhas: [it.frase, it.veredito], frase: it.frase, veredito: it.veredito });
    ROTEIRO.push({ id: `porque${i + 1}`, tipo: 'porque', k: i + 1, linhas: it.porque, veredito: it.veredito });
  });
  ROTEIRO.push({ id: 'fecho', tipo: 'fecho', linhas: FECHO });

  const cenas = [], linha = {}, efeitos = [], markers = {}, S = {};
  let b = 0;
  for (const r of ROTEIRO) {
    const ls = r.linhas.filter((n) => TX[n]);
    if (!ls.length) continue; // parte com todas as frases apagadas sai do vídeo
    let bb = b;
    const itens = ls.map((n) => {
      let d = batidas(n);
      if (r.tipo === 'abertura') d = Math.max(d, 8);
      if (r.tipo === 'mito' && n === r.frase) d = Math.max(d, 8); // tempo de a pessoa pensar "mito ou verdade?"
      if (r.tipo === 'mito' && n === r.veredito) d = Math.max(d, 5); // o selo bate e assenta
      const it = { n, b0: bb, d }; bb += d; return it;
    });
    let total = bb - b + (r.tipo === 'fecho' ? 4 : 0);
    total += (4 - (total % 4)) % 4; // toda cena acaba no fim de um compasso: o corte cai junto com a música
    itens[itens.length - 1].d += total - (bb - b);
    for (const it of itens) { it.t0 = it.b0 * BEAT; it.t1 = (it.b0 + it.d) * BEAT; linha[it.n] = { t0: it.t0, t1: it.t1 }; }
    const c = Object.assign({}, r, { itens, t0: b * BEAT, t1: (b + total) * BEAT });
    cenas.push(c); S[c.id] = [c.t0, c.t1];
    b += total;
  }
  const DURATION = b * BEAT;

  // quando cada selo bate (o começo da frase do veredito): o trilho do canto e o fecho leem daqui
  const SELO = ITENS.map((it) => (linha[it.veredito] ? linha[it.veredito].t0 : Infinity));

  // ---------- efeitos sonoros (o que acontece na tela) ----------
  const ef = (t, som, vol = 0.8, pan = 0) => efeitos.push({ t, som, vol, pan });
  for (const c of cenas) {
    if (c.tipo === 'abertura') ef(c.t0 + 0.35, 'pop', 0.6, -0.4); // o balão vazio aparece
    if (c.tipo === 'mito') {
      ef(c.t0 + 0.05, 'pop', 0.7, -0.4); // o balão com a frase
      if (linha[c.veredito]) ef(linha[c.veredito].t0 + 0.02, 'baque', 0.9, 0.1); // o selo bate (o silêncio vem antes: mapa-do-som.json)
    }
    if (c.tipo === 'porque') {
      ef(c.t0 + 0.05, 'lapis', 0.5);
      c.itens.slice(1).forEach((it) => ef(it.t0 + 0.05, 'tique', 0.5));
    }
    if (c.tipo === 'fecho') {
      SELO.forEach((_, i) => ef(c.t0 + 0.35 + 0.35 * i, 'pop', 0.7, -0.5 + 0.5 * i));
      ef(c.t0 + 0.35 + 0.35 * SELO.length + 0.2, 'certo', 0.8);
    }
  }
  efeitos.sort((p, q) => p.t - q.t);

  // ---------- marcadores: um instante de cada cena e de cada frase seguinte (folha de quadros, capa, qa e cores) ----------
  const mk = (k, t) => { markers[k] = Math.min(DURATION - 0.2, Math.max(0, t)); };
  for (const c of cenas) c.itens.forEach((it, i) => mk(c.id + (i ? 'F' + (i + 1) : ''), it.t0 + Math.min(it.t1 - it.t0 - 0.1, 2.5 * BEAT)));
  // o quadro principal (a folha da parada 2): o primeiro selo já assentado sobre o balão
  if (Number.isFinite(SELO[0])) mk('principal', SELO[0] + 0.9);

  const cenaEm = (t) => { let c = cenas[0]; for (const x of cenas) if (t >= x.t0) c = x; return c; };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, ESTILO, STYLE: ESTILO, cenas, linha, efeitos, cenaEm, TX, ROTEIRO, ITENS, ABERTURA, FECHO, SELO };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
