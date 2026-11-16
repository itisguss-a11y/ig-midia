// PRESEME · motor "linha do tempo" · a linha do tempo da peça · MOLDE: o chat 1 copia a pasta e preenche só o bloco PREENCHER
// Fonte única dos tempos: o desenho (film-*.js) e o som (motor do reel: som) leem deste arquivo.
// Os tempos saem do tamanho de cada frase do textos.js: mudou o texto, o tempo se ajusta sozinho.
// O que o motor do reel espera daqui (não tire): FPS, FORMAT, DURATION, BEAT, BPM, markers, S, cenas (id, t0, t1, itens),
// linha ({ n: { t0, t1 } }, quando cada frase está inteira na tela), efeitos ([{ t, som, vol, pan }]) e TX.
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
  const BPM = 92;
  // a cara da peça (kit de estilos). Padrão deste motor: planta técnica ★ (a linha vira régua, e a distância entre dois
  // marcos pode ganhar cota). A folha da parada 2 sai com: node <motor>/preseme.js estilos @m1990aF2 planta,carimbo,giz
  const ESTILO = 'planta';
  // OS MARCOS, na ordem do tempo. ano: a palavra [Dnn] grande na linha (se começar com 4 dígitos, o contador de anos rola
  // até ela na viagem). rotulo: a palavra [Dnn] embaixo da linha. cota (opcional): a palavra [Dnn] escrita entre este marco
  // e o seguinte, só quando a distância é um fato da tabela (ex.: "3 meses"). dist (opcional): a distância até o seguinte,
  // em pixels de mundo (padrão 760); marcos perto no tempo ficam perto na linha (com 440, o ponto do marco
  // anterior fica na borda da tela e a cota liga os dois).
  const MARCOS = [
    { id: 'm1986', ano: 'D01', rotulo: 'D06' },
    { id: 'm1988', ano: 'D02', rotulo: 'D07' },
    { id: 'm1990a', ano: 'D03', rotulo: 'D08', cota: 'D21', dist: 440 },
    { id: 'm1990b', ano: 'D04', rotulo: 'D09' },
  ];
  // o presente, depois do salto (//) da linha
  const HOJE = { id: 'hoje', ano: 'D05', rotulo: 'D10' };
  // AS CENAS, na ordem. tipos:
  //   pergunta  o presente e a pergunta (a capa); a 2ª frase abre a linha inteira, com os anos aparecendo um a um
  //   marco     um por marco, na ordem dos MARCOS (o id da cena é o id do marco); a câmera anda até ele antes da 1ª frase
  //   presente  a câmera atravessa o salto e volta para hoje
  //   fecho     a linha inteira de novo, com o verbo de cada marco junto do ano (verbos: [Dnn] por marco, na ordem)
  // efeitos (opcional, em qualquer cena): [{ frase, em, som, vol, pan }]: um som quando a frase entra, mais "em" segundos
  //   (sons: pop, gota, tique, sopro, sino, certo, baque, lapis)
  const ROTEIRO = [
    { id: 'abertura', tipo: 'pergunta', linhas: [1, 2] },
    { id: 'm1986', tipo: 'marco', linhas: [3, 4, 5] },
    { id: 'm1988', tipo: 'marco', linhas: [6, 7, 8, 9] },
    { id: 'm1990a', tipo: 'marco', linhas: [10, 11], efeitos: [{ frase: 11, em: 0.45, som: 'baque', vol: 0.9 }] },
    { id: 'm1990b', tipo: 'marco', linhas: [12, 13, 14, 15], efeitos: [{ frase: 12, em: 0.7, som: 'certo', vol: 0.8 }] },
    { id: 'hoje', tipo: 'presente', linhas: [16, 17] },
    { id: 'fecho', tipo: 'fecho', linhas: [18, 19], verbos: ['D22', 'D23', 'D24', 'D25'] },
  ];
  // ==============================================================

  const clock = MU.makeClock({ bpm: BPM, offset: 0 });
  const { T, BEAT } = clock;
  // leitura (regra do motor, igual em toda peça): palavras ÷ 2,17 por segundo + 0,5 s de folga; nunca menos de 4 batidas
  const VEL = 2.17, FOLGA = 0.5, MINIMO = 4;
  const palavras = (n) => (TX[n] || '').trim().split(/\s+/).filter(Boolean).length;
  const batidas = (n) => Math.max(MINIMO, Math.ceil((palavras(n) / VEL + FOLGA) / BEAT - 0.05));
  // a viagem da câmera (batidas) acontece antes de a primeira frase da cena aparecer; o tempo de ler não perde nada
  const VIAGEM = { marco: 2, presente: 3, fecho: 3 };
  const VISAO = 3; // na pergunta, batidas a mais na 2ª frase, para a linha inteira se abrir e os marcos aparecerem

  // ---------- o mundo: onde cada marco fica na linha ----------
  const GAP = 760, SALTO = 380;
  const MX = [];
  let xw = 0;
  MARCOS.forEach((m, i) => { MX.push(xw); xw += m.dist || GAP; });
  const HOJE_X = MX[MX.length - 1] + GAP + SALTO;
  const L = SAFE.x, R = SAFE.x + SAFE.w;
  const VISAO_Z = (R - L - 140) / (HOJE_X - MX[0]); // de longe, os marcos vão de L + 70 a R - 70
  const VISAO_X = (MX[0] + HOJE_X) / 2;
  const marcoDe = (id) => MARCOS.findIndex((m) => m.id === id);

  const cenas = [], linha = {}, efeitos = [], markers = {}, S = {}, CAM = [];
  let b = 0;
  let cam = { x: HOJE_X, z: 1 };
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
    else if (r.tipo === 'marco') { const i = marcoDe(r.id); c.marco = i; viaja(c.t0, c.viagem, { x: MX[i], z: 1 }); }
    else if (r.tipo === 'presente') viaja(c.t0, c.viagem, { x: HOJE_X, z: 1 });
    else if (r.tipo === 'fecho') viaja(c.t0, c.viagem, { x: VISAO_X, z: VISAO_Z });
    cenas.push(c); S[c.id] = [c.t0, c.t1];
    b += total;
  }
  const DURATION = b * BEAT;

  // ---------- efeitos sonoros (o que acontece na tela; o som do lugar está no mapa-do-som.json) ----------
  const ef = (t, som, vol = 0.8, pan = 0) => { if (t >= 0 && t < DURATION - 0.05) efeitos.push({ t, som, vol, pan }); };
  for (const v of CAM) if (v.t0 > 0.1) ef(v.t0 + 0.02, 'sopro', 0.35, v.para.x > v.de.x ? 0.4 : -0.4); // a câmera viaja
  for (const c of cenas) {
    if (c.tipo === 'marco') ef(c.t0 + c.viagem - 0.05, 'pop', 0.7); // o ano assenta na linha
    if (c.tipo === 'presente') ef(c.t0 + c.viagem - 0.05, 'pop', 0.7);
    if (c.tipo === 'pergunta' && c.itens[1]) for (let i = 0; i <= MARCOS.length; i++) ef(c.itens[1].t0 + 1.0 + 0.24 * i, 'tique', 0.6, -0.6 + (1.2 * i) / MARCOS.length);
    if (c.tipo === 'fecho' && c.itens[0]) (c.verbos || []).forEach((v, i) => ef(c.itens[0].tv + 0.5 + 0.4 * i, 'pop', 0.7, -0.6 + 0.4 * i));
    if (c.tipo === 'fecho') ef(c.t1 - 4 * BEAT, 'certo', 0.7);
    for (const e of c.efeitos || []) if (linha[e.frase]) ef(linha[e.frase].t0 + (e.em || 0), e.som, e.vol ?? 0.8, e.pan || 0);
  }
  efeitos.sort((p, q) => p.t - q.t);

  // ---------- marcadores: um instante por frase, quando ela já está inteira na tela (folha de quadros, capa, qa e cores) ----------
  const mk = (k, t) => { markers[k] = Math.min(DURATION - 0.2, Math.max(0, t)); };
  for (const c of cenas) c.itens.forEach((it, i) => mk(i ? `${c.id}F${i + 1}` : c.id, linha[it.n].t0 + Math.min(1.6, (linha[it.n].t1 - linha[it.n].t0) / 2)));
  mk('abertura', 1.2); // a capa: a pergunta inteira e Seu Antônio chegando

  const cenaEm = (t) => { let c = cenas[0]; for (const x of cenas) if (t >= x.t0) c = x; return c; };
  // a câmera no instante t: x (pixels de mundo no centro da tela) e z (zoom só na horizontal: 1 = de perto, VISAO_Z = a linha inteira)
  const camera = (t) => {
    let v = null;
    for (const s of CAM) if (t >= s.t0) v = s;
    if (!v) return { x: HOJE_X, z: 1, k: 1, viajando: null };
    const k = U.clamp((t - v.t0) / Math.max(0.001, v.t1 - v.t0), 0, 1), e = U.ease.inOutCubic(k);
    const z = Math.exp(U.lerp(Math.log(v.de.z), Math.log(v.para.z), e));
    return { x: U.lerp(v.de.x, v.para.x, e), z, k, viajando: k < 1 ? v : null };
  };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, ESTILO, STYLE: ESTILO, cenas, linha, efeitos, cenaEm, TX, ROTEIRO, MARCOS, HOJE, MX, HOJE_X, VISAO_Z, VISAO_X, CAM, camera };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
