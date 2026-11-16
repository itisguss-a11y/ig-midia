// PRESEME · motor "Quiz relâmpago" · linha do tempo (molde fixo do tipo) · MOLDE: o chat 1 copia esta pasta e preenche
// Fonte única dos tempos: o desenho (film-*.js) e o som (mapa-do-som.json + efeitos daqui) leem deste arquivo.
// Os tempos saem do tamanho de cada frase do textos.js: mudou o texto, o tempo se ajusta sozinho.
// O chat 1 preenche só o bloco PREENCHER (andamento, estilo, o jeito de responder e a lista de perguntas); o resto é do molde.
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
  const BPM = 120; // ritmo de jogo
  const ESTILO = 'pixel'; // a cara do tipo (kit de estilos): pixel ★ (cara de jogo); a parada 2 mostra também lapis e carimbo
  // A abertura: o título (quantas perguntas e o assunto) e a regra do jogo (contar os acertos e comentar o placar).
  const ABERTURA = [1, 2];
  // O jeito de responder: 'vf' (os cartões Verdadeiro e Falso, D02 e D03) ou 'ab' (A ou B: cada pergunta traz as duas opções).
  const MODO = 'vf';
  // As perguntas, de 3 a 7, na ordem:
  //   p       a pergunta (no modo 'vf', uma afirmação para julgar)
  //   r       a resposta: 'V' ou 'F' (no modo 'ab', 'A' ou 'B')
  //   porque  a frase que explica, numa frase só, que COMEÇA com a palavra do selo: Verdadeiro ou Falso (D02, D03);
  //           no modo 'ab', com "É a A" ou "É a B"
  //   ops     só no modo 'ab': as duas opções, [A, B] (até quatro palavras cada)
  const PERGUNTAS = [
    { p: 3, r: 'F', porque: 4 },
    { p: 5, r: 'V', porque: 6 },
    { p: 7, r: 'F', porque: 8 },
    { p: 9, r: 'V', porque: 10 },
    { p: 11, r: 'F', porque: 12 },
  ];
  // A régua do placar: a pergunta da régua (uma frase); as três faixas são as palavras D04 a D06 ("5 · pronto para a prova").
  const REGUA = 13;
  // O que estudar (uma ou duas frases); a fonte fica na tela, na palavra D07.
  const ESTUDAR = [14];
  // ==============================================================

  const clock = MU.makeClock({ bpm: BPM, offset: 0 });
  const { T, BEAT } = clock;
  const VEL = 2.17, FOLGA = 0.5; // leitura: 2,17 palavras por segundo e meio segundo de folga
  const CONTA = 3; // o relógio de cada pergunta: 3 s para responder de cabeça
  const ENTRA = 0.25; // a frase do porquê entra logo depois do selo
  const palavras = (n) => String(TX[n] || '').trim().split(/\s+/).filter(Boolean).length;
  const ler = (n) => palavras(n) / VEL + FOLGA; // segundos para ler a frase
  const seg = (s) => Math.ceil(s / BEAT - 0.05); // segundos em batidas, para cima
  const par = (b) => b + (b % 2); // a cena acaba numa batida par (meio compasso): o corte cai no tempo forte

  const QS = PERGUNTAS.filter((q) => TX[q.p]).map((q, i) => Object.assign({ k: i + 1 }, q));
  const cenas = [], linha = {}, efeitos = [], markers = {}, S = {}, REVELA = {};
  let b = 0;
  const fecha = (c, total) => { c.t0 = b * BEAT; c.t1 = (b + total) * BEAT; cenas.push(c); S[c.id] = [c.t0, c.t1]; b += total; };

  // 1. a abertura: o título fica; a regra do jogo entra embaixo dele
  {
    const ls = ABERTURA.filter((n) => TX[n]);
    let bb = 0;
    // o título fica na tela a abertura inteira: a regra entra quando ele já foi lido em boa parte (45%)
    const itens = ls.map((n, j) => { const d = j === 0 && ls.length > 1 ? Math.max(4, seg(ler(n) * 0.45)) : Math.max(4, seg(ler(n))); const it = { n, b0: bb, d }; bb += d; return it; });
    const total = par(Math.max(bb, 8));
    if (itens.length) itens[itens.length - 1].d += total - bb;
    const c = { id: 'abertura', tipo: 'abertura', itens };
    fecha(c, total);
    for (const it of itens) { it.t0 = c.t0 + it.b0 * BEAT; it.t1 = c.t0 + (it.b0 + it.d) * BEAT; linha[it.n] = { t0: it.t0, t1: c.t1 }; }
  }
  // 2. uma cena por pergunta: a pergunta e os cartões, o relógio de 3 s, o selo e o porquê
  for (const q of QS) {
    const ops = MODO === 'ab' ? (q.ops || []).filter((n) => TX[n]) : [];
    // as opções do modo 'ab' se leem junto com a pergunta; Verdadeiro e Falso são os mesmos em toda pergunta
    const pCartoes = MODO === 'ab' ? ops.reduce((s, o) => s + palavras(o), 0) : 0;
    // a resposta vem quando o relógio acaba: pelo menos 1 s para ler antes de ele começar, e o tempo de ler a pergunta (e as opções)
    const rev = Math.max(1 + CONTA, (palavras(q.p) + pCartoes) / VEL + FOLGA);
    const lerPq = TX[q.porque] ? ler(q.porque) : 2;
    const total = par(seg(rev + ENTRA + lerPq));
    const c = { id: `q${q.k}`, tipo: 'pergunta', k: q.k, q };
    fecha(c, total);
    const tr = c.t0 + rev;
    REVELA[q.k] = tr;
    c.revela = tr; c.relogio = { t0: tr - CONTA, t1: tr };
    c.itens = [{ n: q.p, t0: c.t0, t1: tr }];
    if (TX[q.porque]) c.itens.push({ n: q.porque, t0: tr, t1: c.t1 });
    linha[q.p] = { t0: c.t0, t1: c.t1 }; // a pergunta fica na tela a cena inteira
    for (const o of ops) linha[o] = { t0: c.t0, t1: c.t1 };
    if (TX[q.porque]) linha[q.porque] = { t0: tr + ENTRA, t1: c.t1 };
  }
  // a régua começa num compasso: a música troca de bloco ali (o mapa-do-som); a última pergunta ganha a sobra
  if (cenas.length > 1 && cenas[cenas.length - 1].tipo === 'pergunta' && b % 4) { const last = cenas[cenas.length - 1], extra = 4 - (b % 4); last.t1 += extra * BEAT; S[last.id][1] = last.t1; last.itens[last.itens.length - 1].t1 = last.t1; for (const n of [last.q.p, last.q.porque]) if (linha[n]) linha[n].t1 = last.t1; b += extra; }
  // 3. a régua do placar: a pergunta e as três faixas, que entram uma por uma
  if (TX[REGUA]) {
    // as três faixas: conta só o que vem depois do ponto (a nota, "5" ou "3 ou 4", se lê de relance)
    const dTexto = ['D04', 'D05', 'D06'].reduce((s, k) => s + String(TX[k] || '').split('·').slice(1).join(' ').trim().split(/\s+/).filter(Boolean).length, 0) / VEL;
    const total = par(Math.max(10, seg(ler(REGUA) * 0.6 + dTexto + 0.6)));
    const c = { id: 'regua', tipo: 'regua', itens: [{ n: REGUA }] };
    fecha(c, total);
    c.itens[0].t0 = c.t0; c.itens[0].t1 = c.t1; linha[REGUA] = { t0: c.t0, t1: c.t1 };
  }
  // 4. o que estudar, com a fonte na tela
  {
    const ls = ESTUDAR.filter((n) => TX[n]);
    if (ls.length) {
      let bb = 0;
      const itens = ls.map((n) => { const d = Math.max(6, seg(ler(n) + 0.2)); const it = { n, b0: bb, d }; bb += d; return it; });
      const total = par(bb + 1); // um respiro no fim, para a fonte e o placar inteiro
      itens[itens.length - 1].d += total - bb;
      const c = { id: 'estudar', tipo: 'estudar', itens };
      fecha(c, total);
      // a primeira frase fica (é o título); a segunda entra embaixo
      itens.forEach((it, j) => { it.t0 = c.t0 + it.b0 * BEAT; it.t1 = c.t0 + (it.b0 + it.d) * BEAT; linha[it.n] = { t0: it.t0, t1: c.t1 }; });
    }
  }
  const DURATION = b * BEAT;

  // ---------- efeitos sonoros (o que acontece na tela) ----------
  const ef = (t, som, vol = 0.8, pan = 0) => efeitos.push({ t, som, vol, pan });
  const NQ = QS.length;
  for (const c of cenas) {
    if (c.tipo === 'abertura') {
      for (let i = 0; i < NQ; i++) ef(c.t0 + 0.15 + 0.12 * i, 'pop', 0.55, -0.5 + i / Math.max(1, NQ - 1)); // o placar acende, casa por casa
      if (c.itens[1]) ef(c.itens[1].t0 + 0.05, 'lapis', 0.4, 0.2);
    }
    if (c.tipo === 'pergunta') {
      ef(c.t0 + 0.02, 'sopro', 0.35, 0); // a pergunta nova entra
      ef(c.t0 + 0.3, 'pop', 0.6, -0.35); ef(c.t0 + 0.45, 'pop', 0.6, 0.35); // os dois cartões
      // o tique-taque do relógio: um a cada meio segundo, alternando o lado do fone
      for (let k = 0; k < Math.round(CONTA * 2); k++) ef(c.relogio.t0 + k * 0.5, 'tique', k % 2 ? 0.6 : 0.85, k % 2 ? 0.3 : -0.3);
      ef(c.revela + 0.02, 'baque', 0.55, 0); // o selo bate
      ef(c.revela + 0.14, 'certo', 0.38, 0); // o acerto, discreto
      ef(c.revela + 0.45, 'pop', 0.4, 0.6); // a casa do placar ganha a resposta
    }
    if (c.tipo === 'regua') for (let i = 0; i < 3; i++) ef(c.t0 + 0.8 + 0.45 * i, 'pop', 0.6, -0.3 + 0.3 * i);
    if (c.tipo === 'estudar') ef(c.t0 + 0.1, 'lapis', 0.45);
  }
  efeitos.sort((p, q) => p.t - q.t);

  // ---------- os cortes: cada pergunta nova e cada resposta (o painel da resposta cobre um terço da tela) ----------
  const CORTES = [];
  for (const c of cenas.slice(1)) CORTES.push(c.t0);
  for (const k of Object.keys(REVELA)) CORTES.push(REVELA[k]);
  CORTES.sort((p, q) => p - q);

  // ---------- marcadores: a folha de quadros, a capa, o qa e as cores ----------
  const mk = (k, t) => { markers[k] = Math.min(DURATION - 0.2, Math.max(0, t)); };
  for (const c of cenas) {
    if (c.tipo === 'pergunta') {
      mk(c.id, c.relogio.t0 + 1.2); // a pergunta com o relógio no 2
      mk(c.id + 'R', Math.min(c.t1 - 0.15, (linha[c.q.porque] ? linha[c.q.porque].t0 : c.revela) + 1.6)); // a resposta, com o porquê inteiro
    } else if (c.tipo === 'regua') mk('regua', Math.min(c.t1 - 0.15, c.t0 + 2.6)); // as três faixas já inteiras (a última entra em 2,15 s)
    else c.itens.forEach((it, i) => mk(c.id + (i ? 'F' + (i + 1) : ''), it.t0 + Math.min(it.t1 - it.t0 - 0.1, 1.8)));
  }
  const q1 = cenas.find((c) => c.tipo === 'pergunta');
  if (q1) mk('principal', q1.relogio.t0 + 1.2); // o quadro principal: a pergunta, os cartões, o relógio no 2 e o placar
  mk('capa', (cenas[0].itens[1] ? cenas[0].itens[1].t0 : cenas[0].t0) + 1.0); // a capa: o título, a regra e o placar vazio

  const cenaEm = (t) => { let c = cenas[0]; for (const x of cenas) if (t >= x.t0) c = x; return c; };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, ESTILO, STYLE: ESTILO, cenas, linha, efeitos, cenaEm, TX,
    CORTES, ABERTURA, MODO, PERGUNTAS: QS, REGUA, ESTUDAR, CONTA, ENTRA, REVELA };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
