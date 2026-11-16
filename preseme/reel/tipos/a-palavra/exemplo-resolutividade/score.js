// PRESEME · motor "a palavra" · a linha do tempo (molde). Fonte única dos tempos: o desenho (film-*.js) e o som
// (motor do reel: som) leem daqui. Os tempos saem do tamanho de cada frase do textos.js: mudou o texto, o tempo se ajusta.
// O que o motor do reel espera deste arquivo (não tire): FPS, FORMAT, DURATION, BEAT, BPM, markers, S, cenas (id, t0, t1,
// itens), linha ({ n: { t0, t1 } }), efeitos ([{ t, som, vol, pan }]) e TX. ESTILO é o do kit de estilos.
//
// Um termo da matéria em 20 a 40 s, sempre nesta ordem: palavra (a palavra grande, as sílabas e a pergunta), significa
// (o que ela quer dizer, pela fonte, com o desenho dela funcionando), exemplo (a vida real, na UBS ou na visita),
// pegadinha (com o que ela se confunde) e fecho (a palavra de novo, no verbete, com a definição curta).
// O chat 1 só mexe no bloco PREENCHER (o estilo e os números das frases de cada parte).
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
  // ESTILO: lapis ★ (o padrão do tipo: o verbete escrito à mão no caderno), pixel ou giz; a parada 2 mostra os três.
  const ESTILO = 'pixel';
  const PALAVRA = [1]; // a pergunta do gancho, com a palavra (1 frase); a palavra grande e as sílabas são o [D02] e o [D03]
  const SIGNIFICA = [2]; // o que ela quer dizer, pela fonte (1 ou 2 frases), com o desenho dela funcionando
  const EXEMPLO = [3]; // a vida real, na UBS ou na visita (1 ou 2 frases); a etiqueta é o [D08]
  const PEGADINHA = [4]; // com o que ela se confunde (1 frase); os dois lados são o [D05] e o [D06]
  const FECHO = [5]; // a palavra de novo, numa frase que define (1 frase); vai dentro do verbete
  // ==============================================================

  // 100 batidas por minuto (uma batida = 0,6 s); o corte cai numa batida par, junto com a música
  const BPM = 100;
  const clock = MU.makeClock({ bpm: BPM, offset: 0 });
  const { T, BEAT } = clock;

  // leitura (regra do motor do reel, igual em toda peça): palavras ÷ 2,17 por segundo + 0,5 s de folga; nunca menos de
  // 3 batidas (1,8 s). A frase da palavra ganha 3 batidas a mais (o tempo de ler a palavra grande e as sílabas); a
  // pegadinha, 1 (o carimbo); o fecho, 2 (o verbete inteiro fica parado para o print).
  const VEL = 2.17, FOLGA = 0.5, MINIMO = 3;
  const palavras = (n) => (TX[n] || '').trim().split(/\s+/).filter(Boolean).length;
  const batidas = (n) => Math.max(MINIMO, Math.ceil((palavras(n) / VEL + FOLGA) / BEAT - 0.05));
  const ROTEIRO = [
    { id: 'palavra', linhas: PALAVRA, extra: 3 },
    { id: 'significa', linhas: SIGNIFICA },
    { id: 'exemplo', linhas: EXEMPLO },
    { id: 'pegadinha', linhas: PEGADINHA, extra: 1 },
    { id: 'fecho', linhas: FECHO, extra: 2 },
  ];

  const cenas = [], linha = {}, efeitos = [], markers = {}, S = {};
  let b = 0;
  for (const r of ROTEIRO) {
    const ls = r.linhas.filter((n) => TX[n]);
    if (!ls.length) continue; // parte com todas as frases apagadas sai do vídeo (o peca.js acusa)
    let bb = b;
    const itens = ls.map((n) => { const d = batidas(n); const it = { n, b0: bb, d }; bb += d; return it; });
    let total = bb - b + (r.extra || 0);
    total += total % 2; // o corte cai numa batida par
    itens[itens.length - 1].d += total - (bb - b);
    for (const it of itens) { it.t0 = it.b0 * BEAT; it.t1 = (it.b0 + it.d) * BEAT; linha[it.n] = it; }
    const c = Object.assign({}, r, { itens, t0: b * BEAT, t1: (b + total) * BEAT });
    cenas.push(c); S[c.id] = [c.t0, c.t1];
    b += total;
  }
  const DURATION = b * BEAT;
  const cena = (id) => cenas.find((c) => c.id === id);

  // ===== o gancho e os efeitos sonoros do molde (pop, lapis, tique, sino, baque, certo, sopro) =====
  // o gancho dos 3 primeiros segundos (o motor mede): o verbete sobe aos 0,25 s, com um pop; as sílabas se escrevem
  // aos 1,4 s, com o lápis, e a sílaba forte ganha o destaque aos 1,9 s, com um baque. O desenho lê os tempos daqui.
  const GANCHO = { entrada: 0.25, silabas: 1.4, forte: 1.9 };
  const PA = cena('palavra'), SI = cena('significa'), EX = cena('exemplo'), PE = cena('pegadinha'), FE = cena('fecho');
  if (PA) {
    efeitos.push({ t: PA.t0 + GANCHO.entrada, som: 'pop', vol: 0.7, pan: 0 });
    efeitos.push({ t: PA.t0 + GANCHO.silabas, som: 'lapis', vol: 0.55, pan: [-0.4, 0.4] });
    efeitos.push({ t: PA.t0 + GANCHO.forte, som: 'baque', vol: 0.75, pan: 0.1 });
  }
  // cada frase nova de significa e exemplo: a câmera pula para o foco da frase, com um sopro de um lado do fone
  for (const c of [SI, EX]) if (c) c.itens.forEach((it, i) => efeitos.push({ t: it.t0 + 0.02, som: i ? 'sopro' : 'pop', vol: i ? 0.5 : 0.6, pan: i % 2 ? 0.35 : -0.35 }));
  // a pegadinha: o sino no corte e o carimbo bate no lado da esquerda aos 0,9 s
  if (PE) { efeitos.push({ t: PE.t0, som: 'sino', vol: 0.8, pan: 0 }); efeitos.push({ t: PE.t0 + 0.9, som: 'baque', vol: 0.85, pan: -0.25 }); }
  // o fecho: o verbete volta inteiro, com o certo
  if (FE) efeitos.push({ t: FE.t0 + 0.35, som: 'certo', vol: 0.7, pan: 0 });
  efeitos.sort((p, q) => p.t - q.t);

  // marcadores: um por frase, quando ela já está inteira na tela (folha de quadros, capa, qa e cores), e "principal",
  // o quadro da parada 2 e da capa: a palavra grande com as sílabas e a sílaba forte já marcada
  const mk = (k, t) => { markers[k] = Math.min(DURATION - 0.2, t); };
  for (const c of cenas) c.itens.forEach((it, i) => mk(i ? `${c.id}${i + 1}` : c.id, it.t0 + Math.min(2.4, (it.t1 - it.t0) * 0.6)));
  if (PA) mk('principal', PA.t0 + Math.min(GANCHO.forte + 1.2, (PA.t1 - PA.t0) * 0.8));

  const cenaEm = (t) => { let c = cenas[0]; for (const x of cenas) if (t >= x.t0) c = x; return c; };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, ESTILO, cenas, linha, efeitos, cenaEm, cena, TX, GANCHO };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
