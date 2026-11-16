// PRESEME · motor "história natural" · a régua do tempo da peça · MOLDE: o chat 1 copia a pasta e preenche só o bloco PREENCHER
// Fonte única dos tempos: o desenho (film-*.js) e o som (motor do reel: som) leem deste arquivo.
// Os tempos saem do tamanho de cada frase do textos.js: mudou o texto, o tempo se ajusta sozinho.
// O que o motor do reel espera daqui (não tire): FPS, FORMAT, DURATION, BEAT, BPM, markers, S, cenas (id, t0, t1, itens),
// linha ({ n: { t0, t1 } }, quando cada frase está inteira na tela), efeitos ([{ t, som, vol, pan }]), TX e CORTES.
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
  const BPM = 92; // TROQUE se quiser outro andamento (88 a 100 lê bem)
  // a cara da peça (kit de estilos). Padrão deste motor: lápis ★ (a régua desenhada à mão, como no caderno). A folha da
  // parada 2 sai com: node <motor>/preseme.js estilos @principal lapis,pixel,giz
  const ESTILO = 'lapis';
  // TROQUE: AS FASES da doença na vida da pessoa, na ordem do tempo (de 3 a 7). id: o nome curto (o da cena no ROTEIRO).
  // nome: a palavra [Dnn] embaixo da régua ("incubação"). dias (opcional): a palavra [Dnn] grande em cima da régua, quanto
  // tempo a fase dura ou quando ela começa ("3 a 8 dias"); fase sem trecho de fonte fica SEM dias. horizonte: true na fase
  // em que o primeiro sintoma aparece (a régua ganha ali a linha tracejada "o primeiro sintoma": antes dela, a doença está
  // lá e nada aparece). dia (opcional, número): só para conferir a ordem da régua (o peca.js trava dia que volta).
  const FASES = [
    { id: 'f1', nome: 'D04' },
    { id: 'f2', nome: 'D05', dias: 'D01' },
    { id: 'f3', nome: 'D06', dias: 'D02', horizonte: true },
    { id: 'f4', nome: 'D07', dias: 'D03' },
  ];
  // TROQUE: ONDE A PREVENÇÃO AGE, em cima da régua: um trecho por nível, de uma fase até outra (de e ate: ids das FASES).
  // nivel: 'primaria' (promoção e proteção, antes de pegar), 'secundaria' (achar cedo e tratar logo) ou 'terciaria'
  // (reabilitação, no fim). acao (opcional): a palavra [Dnn] do que se faz ali. para: true no trecho em que dava para parar a
  // doença (no fecho, a régua inteira ganha a placa "dava para parar aqui", palavra PARA). Nível que não cabe na doença fica
  // de fora (ex.: sem sequela, sem terciária).
  const PREVENCAO = [
    { nivel: 'primaria', de: 'f1', ate: 'f1', acao: 'D11', para: true },
    { nivel: 'secundaria', de: 'f3', ate: 'f4', acao: 'D12' },
  ];
  // os nomes dos níveis e as palavras fixas do molde (todas no textos.txt, para ele editar)
  const NIVEIS = { primaria: 'D08', secundaria: 'D09', terciaria: 'D10' };
  const HORIZONTE = 'D13'; // "o primeiro sintoma"
  const PARA = 'D14'; // "dava para parar aqui"
  // TROQUE: AS CENAS, na ordem. tipos:
  //   pergunta  a pessoa e a pergunta (a capa, no cartão da primeira fase); a 2ª frase abre a régua inteira, as fases uma a uma
  //   fase      uma por fase, na ordem das FASES (o id da cena é o id da fase); a câmera anda até ela antes da 1ª frase
  //   fecho     a régua inteira de novo, com os trechos da prevenção e a placa de onde dava para parar
  // efeitos (opcional, em qualquer cena): [{ frase, em, som, vol, pan }]: um som quando a frase entra, mais "em" segundos
  //   (sons: pop, gota, tique, sopro, sino, certo, baque, lapis)
  const ROTEIRO = [
    { id: 'abertura', tipo: 'pergunta', linhas: [1, 2] },
    { id: 'f1', tipo: 'fase', linhas: [3] },
    { id: 'f2', tipo: 'fase', linhas: [4] },
    { id: 'f3', tipo: 'fase', linhas: [5, 6] },
    { id: 'f4', tipo: 'fase', linhas: [7] },
    { id: 'fecho', tipo: 'fecho', linhas: [8, 9] },
  ];
  // ==============================================================

  const clock = MU.makeClock({ bpm: BPM, offset: 0 });
  const { T, BEAT } = clock;
  // leitura (regra do motor, igual em toda peça): palavras ÷ 2,17 por segundo + 0,5 s de folga; nunca menos de 4 batidas
  const VEL = 2.17, FOLGA = 0.5, MINIMO = 4;
  const palavras = (n) => (TX[n] || '').trim().split(/\s+/).filter(Boolean).length;
  const batidas = (n) => Math.max(MINIMO, Math.ceil((palavras(n) / VEL + FOLGA) / BEAT - 0.05));
  // a viagem da câmera (batidas) acontece antes de a primeira frase da cena aparecer; o tempo de ler não perde nada
  const VIAGEM = { fase: 2, fecho: 3 };
  const VISAO = 3; // na pergunta, batidas a mais na 2ª frase, para a régua inteira se abrir e as fases aparecerem

  // ---------- o mundo: onde cada fase fica na régua ----------
  const GAP = 760;
  const MX = FASES.map((f, i) => i * GAP);
  const L = SAFE.x, R = SAFE.x + SAFE.w;
  const ULTIMO = MX[MX.length - 1] || 0;
  const VISAO_Z = (R - L - 120) / Math.max(1, ULTIMO - MX[0]); // de longe, as fases vão de L + 60 a R - 60
  const VISAO_X = (MX[0] + ULTIMO) / 2;
  const faseDe = (id) => FASES.findIndex((f) => f.id === id);
  // o trecho de prevenção de cada fase (null se nenhum nível age ali): o primeiro que cobre a fase, na ordem da lista
  const TRECHOS = PREVENCAO.map((p) => Object.assign({}, p, { i0: faseDe(p.de), i1: faseDe(p.ate) }));
  const trechoDa = (i) => TRECHOS.find((p) => p.i0 >= 0 && p.i1 >= 0 && i >= Math.min(p.i0, p.i1) && i <= Math.max(p.i0, p.i1)) || null;

  const cenas = [], linha = {}, efeitos = [], markers = {}, S = {}, CAM = [];
  let b = 0;
  let cam = { x: MX[0] || 0, z: 1 };
  const viaja = (t0, dur, para) => { CAM.push({ t0, t1: t0 + dur, de: Object.assign({}, cam), para }); cam = para; };
  for (const r of ROTEIRO) {
    const ls = r.linhas.filter((n) => TX[n]);
    if (!ls.length) continue; // cena com todas as frases apagadas sai do vídeo
    const atraso = VIAGEM[r.tipo] || 0;
    let bb = b;
    const itens = ls.map((n, i) => {
      let d = batidas(n), at = 0;
      if (i === 0 && atraso) { d += atraso; at = atraso; }
      if (r.tipo === 'pergunta' && i === 1) d += VISAO;
      const it = { n, b0: bb, d, at }; bb += d; return it;
    });
    let total = bb - b + (r.tipo === 'fecho' ? 4 : 0);
    total += (4 - (total % 4)) % 4; // toda cena acaba no fim de um compasso: o corte cai junto com a música
    itens[itens.length - 1].d += total - (bb - b);
    for (const it of itens) {
      it.t0 = it.b0 * BEAT; it.t1 = (it.b0 + it.d) * BEAT; it.tv = it.t0 + it.at * BEAT; // tv: quando a frase aparece
      linha[it.n] = { t0: it.tv, t1: it.t1 };
    }
    const c = Object.assign({}, r, { itens, t0: b * BEAT, t1: (b + total) * BEAT, viagem: atraso * BEAT });
    // a câmera
    if (r.tipo === 'pergunta') { if (itens[1]) viaja(itens[1].t0, 1.5, { x: VISAO_X, z: VISAO_Z }); }
    else if (r.tipo === 'fase') { const i = faseDe(r.id); c.fase = i; viaja(c.t0, c.viagem, { x: MX[Math.max(0, i)], z: 1 }); }
    else if (r.tipo === 'fecho') {
      viaja(c.t0, c.viagem, { x: VISAO_X, z: VISAO_Z });
      // a 2ª frase do fecho corta seco para perto, na fase do primeiro sintoma (onde a secundária começa a agir)
      const ih = FASES.findIndex((f) => f.horizonte);
      if (itens[1] && ih >= 0) viaja(itens[1].t0, 0.001, { x: MX[ih], z: 1 });
    }
    cenas.push(c); S[c.id] = [c.t0, c.t1];
    b += total;
  }
  const DURATION = b * BEAT;
  // a câmera anda e o fundo fica igual: o corte de cada cena não aparece de uma vez na imagem (conferir conta estes), e na
  // 2ª frase da pergunta a câmera se afasta para a régua inteira (a imagem toda troca, em 1,5 s)
  const CORTES = cenas.slice(1).map((c) => c.t0).concat(cenas[0] && cenas[0].tipo === 'pergunta' && cenas[0].itens[1] ? [cenas[0].itens[1].t0] : []).sort((p, q) => p - q);

  // ---------- efeitos sonoros (o que acontece na tela; o som do lugar está no mapa-do-som.json) ----------
  const ef = (t, som, vol = 0.8, pan = 0) => { if (t >= 0 && t < DURATION - 0.05) efeitos.push({ t, som, vol, pan }); };
  for (const v of CAM) if (v.t0 > 0.1) ef(v.t0 + 0.02, 'sopro', 0.35, v.para.x > v.de.x ? 0.4 : -0.4); // a câmera viaja
  for (const c of cenas) {
    if (c.tipo === 'fase') ef(c.t0 + c.viagem - 0.05, 'pop', 0.7); // a fase assenta na régua
    // da 2ª frase da fase (e da 4ª), o cartão de perto (film-1): um tique leve no corte
    if (c.tipo === 'fase') c.itens.forEach((it, i) => { if (i % 2 === 1) ef(it.tv, 'tique', 0.45, 0.3); });
    if (c.tipo === 'pergunta' && c.itens[1]) for (let i = 0; i < FASES.length; i++) ef(c.itens[1].t0 + 1.0 + 0.24 * i, 'tique', 0.6, -0.6 + (1.2 * i) / Math.max(1, FASES.length - 1));
    if (c.tipo === 'fecho' && c.itens[0]) TRECHOS.forEach((p, i) => ef(c.itens[0].tv + 0.3 + 0.45 * i, 'pop', 0.7, -0.5 + 0.5 * i));
    if (c.tipo === 'fecho' && c.itens[0] && TRECHOS.some((p) => p.para)) ef(c.itens[0].tv + 0.3 + 0.45 * TRECHOS.length + 0.2, 'baque', 0.6);
    if (c.tipo === 'fecho') ef(c.t1 - 4 * BEAT, 'certo', 0.7);
    for (const e of c.efeitos || []) if (linha[e.frase]) ef(linha[e.frase].t0 + (e.em || 0), e.som, e.vol ?? 0.8, e.pan || 0);
  }
  efeitos.sort((p, q) => p.t - q.t);

  // ---------- marcadores: um instante por frase, quando ela já está inteira na tela (folha de quadros, capa, qa e cores) ----------
  const mk = (k, t) => { markers[k] = Math.min(DURATION - 0.2, Math.max(0, t)); };
  for (const c of cenas) c.itens.forEach((it, i) => mk(i ? `${c.id}F${i + 1}` : c.id, linha[it.n].t0 + Math.min(1.6, (linha[it.n].t1 - linha[it.n].t0) / 2)));
  mk('abertura', 1.2); // a capa: a pergunta inteira e a pessoa
  // o quadro principal (parada 2 e folha de estilos): a fase da linha do primeiro sintoma, ou a do meio
  const ih = FASES.findIndex((f) => f.horizonte), cp = cenas.find((c) => c.fase === (ih >= 0 ? ih : Math.floor(FASES.length / 2)));
  if (cp) mk('principal', linha[cp.itens[0].n].t0 + Math.min(1.6, (linha[cp.itens[0].n].t1 - linha[cp.itens[0].n].t0) / 2));

  const cenaEm = (t) => { let c = cenas[0]; for (const x of cenas) if (t >= x.t0) c = x; return c; };
  // a câmera no instante t: x (pixels de mundo no centro da tela) e z (zoom só na horizontal: 1 = de perto, VISAO_Z = a régua inteira)
  const camera = (t) => {
    let v = null;
    for (const s of CAM) if (t >= s.t0) v = s;
    if (!v) return { x: MX[0] || 0, z: 1, k: 1, viajando: null };
    const k = U.clamp((t - v.t0) / Math.max(0.001, v.t1 - v.t0), 0, 1), e = U.ease.inOutCubic(k);
    const z = Math.exp(U.lerp(Math.log(v.de.z), Math.log(v.para.z), e));
    return { x: U.lerp(v.de.x, v.para.x, e), z, k, viajando: k < 1 ? v : null };
  };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, ESTILO, STYLE: ESTILO, cenas, linha, efeitos, cenaEm, TX, ROTEIRO, FASES, PREVENCAO, TRECHOS, trechoDa, NIVEIS, HORIZONTE, PARA, MX, GAP, VISAO_Z, VISAO_X, CAM, camera, CORTES };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
