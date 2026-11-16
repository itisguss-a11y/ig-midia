// PRESEME · motor "escada de níveis" · linha do tempo (molde) · MOLDE: o chat 1 copia esta pasta e preenche
// Um conceito com degraus em ordem; uma pessoa, a mesma do começo ao fim, sobe um degrau por cena;
// o corrimão (opcional) é o que vale em todos os degraus; o fecho mostra a escada inteira e responde à pergunta.
// Fonte única dos tempos: o desenho (film-*.js) e o som (mapa-do-som.json + os efeitos daqui) leem deste arquivo.
// Os tempos saem do tamanho de cada frase do textos.js: mudou o texto, o tempo se ajusta sozinho.
// O chat 1 preenche só o bloco PREENCHER (andamento, estilo e ROTEIRO); o resto é do molde e não muda.
(function () {
  const node = typeof require !== 'undefined' && typeof module !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const TX = node ? require('./textos') : globalThis.TEXTOS;
  const FPS = 30;
  const FORMAT = U.pickFormat('9:16');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);

  // ===================== PREENCHER (chat 1) =====================
  // Exemplo completo: ../exemplo-niveis-de-prevencao/score.js (os níveis de prevenção a partir da mamografia).
  const BPM = 96;
  // estilo da peça, do kit (motor/estilos): lapis, pixel, giz, planta, carimbo ou chapado. O padrão deste motor é a
  // planta técnica (a escada desenhada como corte de prancheta). Para a folha dos três estilos: node <motor>/preseme.js estilos @principal planta,lapis,carimbo
  const ESTILO = 'planta';
  // as cenas, em ordem. tipos: abertura · degrau (degrau: 1 a 5, um por cena, na ordem da escada) · corrimao (opcional:
  // o que vale em todos os degraus) · escada (o fecho; destaque = o degrau que responde à pergunta, ou 0 para nenhum)
  // linhas: os números das frases do textos.txt que aparecem na cena, na ordem.
  const ROTEIRO = [
    { id: 'abertura', tipo: 'abertura', linhas: [1, 2] },
    { id: 'degrau1', tipo: 'degrau', degrau: 1, linhas: [3, 4] },
    { id: 'degrau2', tipo: 'degrau', degrau: 2, linhas: [5, 6] },
    { id: 'degrau3', tipo: 'degrau', degrau: 3, linhas: [7, 8] },
    { id: 'corrimao', tipo: 'corrimao', linhas: [9, 10] },
    { id: 'escada', tipo: 'escada', destaque: 2, linhas: [11, 12] },
  ];
  // ============================================================================================

  const clock = MU.makeClock({ bpm: BPM, offset: 0 });
  const { T, BEAT } = clock;
  // os tempos fixos do molde (segundos depois do corte da cena)
  const SUBIDA = 0.9; // a pessoa sobe um degrau (no fecho, volta até o degrau que responde)
  const PLACA = SUBIDA + 0.05; // a placa do degrau acende
  const RIL = { de: 0.2, ate: 1.6 }; // o corrimão se desenha
  const MARCA = SUBIDA + 0.25; // no fecho, o degrau que responde se acende
  // leitura: 2,17 palavras por segundo e meio segundo de folga; nenhuma frase fica menos de 4 batidas
  const VEL = 2.17, FOLGA = 0.5, MINIMO = 4;
  const palavras = (n) => (TX[n] || '').trim().split(/\s+/).filter(Boolean).length;
  const batidas = (n) => Math.max(MINIMO, Math.ceil((palavras(n) / VEL + FOLGA) / BEAT - 0.05));

  const NDEGRAUS = ROTEIRO.filter((r) => r.tipo === 'degrau').length;
  const cenas = [], linha = {}, efeitos = [], markers = {}, S = {};
  let b = 0, anterior = 0; // anterior: o último degrau que já apareceu (de onde a pessoa sai)
  for (const r of ROTEIRO) {
    const ls = r.linhas.filter((n) => TX[n]);
    if (!ls.length) continue; // cena com todas as frases apagadas sai do vídeo
    let bb = b;
    const itens = ls.map((n, i) => {
      let d = batidas(n);
      if (i === 0 && r.tipo === 'degrau') d += 1; // a subida acontece junto com a primeira frase
      if (i === 0 && (r.tipo === 'corrimao' || r.tipo === 'escada')) d += 2; // o corrimão se desenha; o fecho acende o degrau
      if (r.tipo === 'abertura' && i === 0) d = Math.max(d, 5); // a pergunta fica no ar
      const it = { n, b0: bb, d }; bb += d; return it;
    });
    let total = bb - b + (r.tipo === 'escada' ? 4 : 0); // o fecho não acaba em cima da última palavra
    total += (4 - (total % 4)) % 4; // toda cena acaba no fim de um compasso: o corte cai junto com a música
    itens[itens.length - 1].d += total - (bb - b);
    for (const it of itens) { it.t0 = it.b0 * BEAT; it.t1 = (it.b0 + it.d) * BEAT; linha[it.n] = it; }
    const c = Object.assign({}, r, { itens, t0: b * BEAT, t1: (b + total) * BEAT });
    if (r.tipo === 'degrau') { c.de = anterior; anterior = r.degrau; }
    if (r.tipo === 'corrimao' || r.tipo === 'escada') c.de = anterior;
    cenas.push(c); S[c.id] = [c.t0, c.t1];
    b += total;
  }
  const DURATION = b * BEAT;

  // efeitos (pop, gota, tique, sopro, sino, certo, baque, lapis): um pop em cada corte; um passo a cada degrau
  // (dois tiques, o pé que sai e o que chega); o sino quando a placa acende; o lápis enquanto o corrimão se desenha;
  // o certo quando o degrau que responde se acende no fecho. pan: o lado do fone em que a pessoa está.
  const X0 = SAFE.x + 150, PASSO = (SAFE.x + SAFE.w - 6 - X0) / Math.max(1, Math.min(5, NDEGRAUS));
  const lado = (k) => U.clamp(((k <= 0 ? X0 - 80 : X0 + (k - 0.5) * PASSO) / W) * 2 - 1, -0.8, 0.8);
  for (const c of cenas) {
    if (c !== cenas[0]) efeitos.push({ t: c.t0, som: 'pop', vol: 0.55 });
    if (c.tipo === 'degrau') {
      efeitos.push({ t: c.t0 + SUBIDA * 0.45, som: 'tique', vol: 0.55, pan: lado(c.de) });
      efeitos.push({ t: c.t0 + SUBIDA, som: 'tique', vol: 0.7, pan: lado(c.degrau) });
      efeitos.push({ t: c.t0 + PLACA + 0.05, som: 'sino', vol: 0.4, pan: lado(c.degrau) });
    }
    if (c.tipo === 'corrimao') {
      efeitos.push({ t: c.t0 + RIL.de, som: 'lapis', vol: 0.45, pan: -0.4 });
      efeitos.push({ t: c.t0 + RIL.ate, som: 'sino', vol: 0.4, pan: 0.4 });
    }
    if (c.tipo === 'escada' && c.destaque) efeitos.push({ t: c.t0 + MARCA, som: 'certo', vol: 0.55, pan: lado(c.destaque) });
  }
  efeitos.sort((p, q) => p.t - q.t);

  // marcadores: um instante por frase, quando ela já está inteira na tela (folha de quadros, capa, qa e cores);
  // "principal" = o fecho com tudo aceso (capa alternativa e a folha dos três estilos da parada 2)
  const mk = (k, t) => { markers[k] = Math.min(DURATION - 0.2, t); };
  for (const c of cenas) {
    c.itens.forEach((it, i) => {
      const extra = i === 0 && c.tipo === 'degrau' ? PLACA + 0.35 : i === 0 && c.tipo === 'corrimao' ? RIL.ate + 0.3 : i === 0 && c.tipo === 'escada' ? MARCA + 0.6 : 0;
      mk(i ? `${c.id}${i + 1}` : c.id, it.t0 + Math.max(extra, Math.min(2 * BEAT, (it.t1 - it.t0) / 2)));
    });
  }
  const fecho = cenas.find((c) => c.tipo === 'escada');
  if (fecho) mk('principal', fecho.t0 + MARCA + 1.0);

  const cenaEm = (t) => { let c = cenas[0]; for (const x of cenas) if (t >= x.t0) c = x; return c; };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, ESTILO, cenas, linha, efeitos, cenaEm, TX, NDEGRAUS, SUBIDA, PLACA, RIL, MARCA, ROTEIRO };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
