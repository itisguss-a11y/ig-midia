// PRESEME · série "Doença de Roraima" · linha do tempo (molde fixo da série) · MOLDE: o chat 1 copia esta pasta e preenche
// Fonte única dos tempos: o desenho (film-*.js) e o som (mapa-do-som.json + efeitos daqui) leem deste arquivo.
// Os tempos saem do tamanho de cada frase do textos.js: mudou o texto, o tempo se ajusta sozinho.
// O chat 1 preenche só o bloco PREENCHER (andamento, estilo e as cenas da peça, em ordem); o resto é do molde.
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
  const BPM = 96;
  const ESTILO = 'giz'; // a cara da série (kit de estilos): giz na lousa ★; a folha de escolha mostra também planta e chapado
  // tipos de cena do molde, na ordem da série: pergunta · numero · mapa · vetor · ciclo · prevencao · sinais · notifica · fecho
  //   numero: [Brasil, Roraima, a proporção] (as frases trazem os números; os rótulos são D01, D02 e D14)
  //   mapa: a frase 1 é a Amazônia; a frase 2, os municípios de Roraima (destaques: [{ nome, rotulo, numero }])
  //   rotulo: o rótulo fixo da série no alto da cena (D20 a D25)
  //   apaga: as frases em que o quadro é apagado (o apagador também passa em toda troca de cena). Marque a frase que troca
  //          o desenho inteiro; não marque a que só acrescenta ao que já está na lousa
  //   TROQUE: os destaques do mapa (nome igual ao de assets/rr.json: Amajari, Alto Alegre, Boa Vista, Bonfim, Cantá, Caracaraí,
  //          Caroebe, Iracema, Mucajaí, Normandia, Pacaraima, Rorainópolis, São João da Baliza, São Luiz, Uiramutã)
  const ROTEIRO = [
    { id: 'abertura', tipo: 'pergunta', linhas: [1] },
    { id: 'numero', tipo: 'numero', linhas: [2, 3, 4], apaga: [4] },
    { id: 'mapa', tipo: 'mapa', rotulo: 'D20', linhas: [5, 6], apaga: [6], destaques: [{ nome: 'Alto Alegre', rotulo: 'D03', numero: 'D06' }, { nome: 'Amajari', rotulo: 'D04', numero: 'D07' }] },
    { id: 'vetor', tipo: 'vetor', rotulo: 'D21', linhas: [7] },
    { id: 'ciclo', tipo: 'ciclo', rotulo: 'D22', linhas: [8] },
    { id: 'prevencao', tipo: 'prevencao', rotulo: 'D23', linhas: [9, 10, 11], apaga: [10, 11] },
    { id: 'sinais', tipo: 'sinais', rotulo: 'D24', linhas: [12, 13, 14], apaga: [13, 14] },
    { id: 'notifica', tipo: 'notifica', rotulo: 'D25', linhas: [15, 16], apaga: [16] },
    { id: 'fecho', tipo: 'fecho', linhas: [17] },
  ];
  // ==============================================================

  const clock = MU.makeClock({ bpm: BPM, offset: 0 });
  const { T, BEAT } = clock;
  const VEL = 2.17, FOLGA = 0.5, MINIMO = 4; // leitura: 2,17 palavras por segundo e meio segundo de folga; nunca menos de 4 batidas
  const palavras = (n) => (TX[n] || '').trim().split(/\s+/).filter(Boolean).length;
  const batidas = (n) => Math.max(MINIMO, Math.ceil((palavras(n) / VEL + FOLGA) / BEAT - 0.05));

  const cenas = [], linha = {}, efeitos = [], markers = {}, S = {};
  let b = 0;
  for (const r of ROTEIRO) {
    const ls = r.linhas.filter((n) => TX[n]);
    if (!ls.length) continue;
    let bb = b;
    const itens = ls.map((n) => {
      let d = batidas(n);
      if (r.tipo === 'pergunta') d = Math.max(d, 6);
      if (r.tipo === 'numero') d = Math.max(d, 6); // o contador sobe e para
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

  // ---------- efeitos sonoros (o que acontece na tela; o som do lugar está no mapa-do-som.json) ----------
  const ef = (t, som, vol = 0.8, pan = 0) => efeitos.push({ t, som, vol, pan });
  // o apagador (assinatura da série): o quadro é apagado em cada troca de cena e nas frases marcadas com "apaga" no ROTEIRO.
  // É o corte da série: a lousa limpa e o desenho novo (o guia reels-script pede mudança na tela a cada poucos segundos).
  const APAGA_DUR = 0.35, APAGA = [];
  cenas.forEach((c, k) => {
    if (k > 0) APAGA.push(c.t0);
    ((ROTEIRO.find((r) => r.id === c.id) || {}).apaga || []).forEach((n) => { if (linha[n] && linha[n].t0 > c.t0) APAGA.push(linha[n].t0); });
  });
  APAGA.sort((a, b) => a - b);
  APAGA.forEach((t) => ef(t + 0.02, 'sopro', 0.32, -0.3));
  for (const c of cenas) {
    if (c.rotulo) ef(c.t0 + 0.05, 'lapis', 0.5); // o rótulo da série se escreve no alto
    if (c.tipo === 'numero') c.itens.forEach((it, k) => ef(it.t0 + 1.2, k === 2 ? 'sino' : 'tique', 0.8)); // cada número para
    if (c.tipo === 'mapa' && c.itens[1]) (c.destaques || []).forEach((d, k) => ef(c.itens[1].t0 + 0.4 + 0.5 * k, 'pop', 0.8, 0.2 - 0.4 * k));
    if (c.tipo === 'ciclo') ef(c.itens[0].t0 + 1.6, 'pop', 0.7); // a picada
    if (c.tipo === 'prevencao' && c.itens[0]) ef(c.itens[0].t0 + 0.3, 'baque', 0.8); // "não existe vacina"
    if (c.tipo === 'notifica') c.itens.forEach((it) => ef(it.t0 + 0.4, 'tique', 0.7));
    if (c.tipo === 'fecho') ef(c.t0 + BEAT, 'certo', 0.8);
  }
  efeitos.sort((p, q) => p.t - q.t);

  // ---------- marcadores: um instante de cada cena e de cada frase seguinte (para a folha de quadros e o qa) ----------
  const mk = (k, t) => { markers[k] = Math.min(DURATION - 0.2, Math.max(0, t)); };
  for (const c of cenas) c.itens.forEach((it, i) => mk(c.id + (i ? 'F' + (i + 1) : ''), it.t0 + Math.min(it.t1 - it.t0 - 0.1, 2.5 * BEAT)));

  const cenaEm = (t) => { let c = cenas[0]; for (const x of cenas) if (t >= x.t0) c = x; return c; };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, ESTILO, STYLE: ESTILO, cenas, linha, efeitos, cenaEm, TX, ROTEIRO, APAGA, APAGA_DUR };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
