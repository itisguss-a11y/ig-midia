// PRESEME · motor "por dentro" · a linha do tempo da peça · MOLDE: o chat 1 copia a pasta e preenche só o bloco PREENCHER
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
  const BPM = 96; // TROQUE se quiser outro andamento (88 a 104 lê bem)
  // a cara da peça (kit de estilos). Padrão deste motor: lápis no papel ★ (o desenho de livro de biologia, que entra no
  // corpo sem ficar frio). A folha da parada 2 sai com: node <motor>/preseme.js estilos @principal lapis,giz,pixel
  const ESTILO = 'lapis';
  // TROQUE: OS NÍVEIS, de fora para dentro. O primeiro é a cena de fora (a pessoa no dia a dia); cada um seguinte mora
  // dentro do anterior, no ponto que a peça marca como "porta" (PECA.PORTA, no film-2-peca.js). rotulo: a palavra [Dnn] da
  // trilha no alto da tela (ex.: "O braço", "As células"). De 2 a 5 níveis (o de fora e de 1 a 4 de dentro).
  const NIVEIS = [
    { id: 'fora', rotulo: 'D01' },
    { id: 'braco', rotulo: 'D02' },
    { id: 'celulas', rotulo: 'D03' },
    { id: 'anticorpo', rotulo: 'D04' },
  ];
  // TROQUE: AS CENAS, na ordem. tipos:
  //   pergunta  a cena de fora, com a pergunta grande (é a capa). Sempre a primeira
  //   nivel     uma cena dentro de um nível (nivel: o id do nível). Antes da 1ª frase, a câmera viaja do nível da cena
  //             anterior até este, um nível por vez: entra pela porta (zoom) ou sai por ela. Pode voltar a um nível que já
  //             passou (aqui, a câmera sai do anticorpo de volta às células para mostrar a memória)
  //   fecho     a cena de fora, com a regra grande e a trilha inteira (todos os níveis). Sempre a última
  // A penúltima cena tem de ser de fora (nivel: o id do primeiro nível): o tipo volta para fora com o que se faz para
  // prevenir, antes do fecho. A conferência (peca.js) trava a peça que não volta.
  // efeitos (opcional, em qualquer cena): [{ frase, em, som, vol, pan }]: um som quando a frase entra, mais "em" segundos
  //   (sons: pop, gota, tique, sopro, sino, certo, baque, lapis)
  const ROTEIRO = [
    { id: 'pergunta', tipo: 'pergunta', linhas: [1, 2] },
    { id: 'braco', tipo: 'nivel', nivel: 'braco', linhas: [3, 4] },
    { id: 'celulas', tipo: 'nivel', nivel: 'celulas', linhas: [5, 6] },
    { id: 'anticorpo', tipo: 'nivel', nivel: 'anticorpo', linhas: [7, 8], efeitos: [{ frase: 7, em: 1.6, som: 'pop', vol: 0.7 }, { frase: 8, em: 1.9, som: 'baque', vol: 0.5 }] },
    { id: 'memoria', tipo: 'nivel', nivel: 'celulas', linhas: [9], efeitos: [{ frase: 9, em: 0.6, som: 'sino', vol: 0.5 }] },
    { id: 'depois', tipo: 'nivel', nivel: 'fora', linhas: [10, 11], efeitos: [{ frase: 11, em: 0.3, som: 'pop', vol: 0.6 }] },
    { id: 'prevencao', tipo: 'nivel', nivel: 'fora', linhas: [12, 13, 14], efeitos: [{ frase: 13, em: 0.4, som: 'lapis', vol: 0.5 }] },
    { id: 'fecho', tipo: 'fecho', linhas: [15] },
  ];
  // TROQUE (opcional): OS PLANOS, um enquadramento por frase: { número da frase: { x, y, z } } põe o ponto (x, y) do
  // nível no meio da janela, com zoom z (a janela vai de x 60 a 940 e de y 330 a 1170). A troca é seca, no começo da frase:
  // é um corte, que o conferir conta (no fundo liso de dentro do corpo, a imagem muda pouco de uma vez e a medida sozinha
  // não veria). Frase sem plano mostra o nível inteiro. O conferir avisa trecho sem corte acima de 12 s.
  const PLANOS = { 2: { x: 800, y: 620, z: 1.45 }, 4: { x: 600, y: 790, z: 1.3 }, 6: { x: 420, y: 770, z: 1.3 }, 8: { x: 380, y: 680, z: 1.2 }, 11: { x: 560, y: 780, z: 1.3 }, 13: { x: 690, y: 780, z: 1.4 } };
  // ==============================================================

  const clock = MU.makeClock({ bpm: BPM, offset: 0 });
  const { T, BEAT } = clock;
  // leitura (regra do motor, igual em toda peça): palavras ÷ 2,17 por segundo + 0,5 s de folga; nunca menos de 4 batidas
  const VEL = 2.17, FOLGA = 0.5, MINIMO = 4;
  const palavras = (n) => (TX[n] || '').trim().split(/\s+/).filter(Boolean).length;
  const batidas = (n) => Math.max(MINIMO, Math.ceil((palavras(n) / VEL + FOLGA) / BEAT - 0.05));
  // a viagem da câmera: 2 batidas para um nível, mais 1 por nível a mais (a câmera atravessa os do meio mais depressa).
  // Ela acontece antes de a primeira frase da cena aparecer: o tempo de ler não perde nada
  const PERNA1 = 2, PERNA_MAIS = 1;
  const LENTE = 1.1; // segundos: a lente pousa na porta antes de a câmera entrar (fim da cena anterior)

  const nivelDe = (id) => Math.max(0, NIVEIS.findIndex((x) => x.id === id));
  const cenas = [], linha = {}, efeitos = [], markers = {}, S = {}, CAM = [];
  let b = 0, atual = 0; // atual: o nível em que a câmera está
  for (const r of ROTEIRO) {
    const ls = r.linhas.filter((n) => TX[n]);
    if (!ls.length) continue; // cena com todas as frases apagadas sai do vídeo
    const alvo = r.tipo === 'nivel' ? nivelDe(r.nivel) : 0;
    const pernas = Math.abs(alvo - atual);
    const atraso = pernas ? PERNA1 + PERNA_MAIS * (pernas - 1) : 0;
    let bb = b;
    const itens = ls.map((n, i) => {
      let d = batidas(n), at = 0;
      if (i === 0 && atraso) { d += atraso; at = atraso; }
      if (r.tipo === 'pergunta' && i === 0) d = Math.max(d, 6); // a capa: a pergunta e a pessoa, com tempo
      const it = { n, b0: bb, d, at }; bb += d; return it;
    });
    let total = bb - b + (r.tipo === 'fecho' ? 4 : 0);
    total += (4 - (total % 4)) % 4; // toda cena acaba no fim de um compasso: o corte cai junto com a música
    itens[itens.length - 1].d += total - (bb - b);
    for (const it of itens) {
      it.t0 = it.b0 * BEAT; it.t1 = (it.b0 + it.d) * BEAT; it.tv = it.t0 + it.at * BEAT; // tv: quando a frase aparece
      linha[it.n] = { t0: it.tv, t1: it.t1 };
    }
    const c = Object.assign({}, r, { itens, t0: b * BEAT, t1: (b + total) * BEAT, viagem: atraso * BEAT, nivel: alvo, de: atual });
    // a câmera: uma perna por nível, todas do mesmo tamanho, dentro da viagem
    if (pernas) {
      const passo = alvo > atual ? 1 : -1, dur = c.viagem / pernas;
      for (let k = 0; k < pernas; k++) CAM.push({ t0: c.t0 + k * dur, t1: c.t0 + (k + 1) * dur, de: atual + k * passo, para: atual + (k + 1) * passo });
    }
    cenas.push(c); S[c.id] = [c.t0, c.t1];
    atual = alvo; b += total;
  }
  const DURATION = b * BEAT;
  // a lente: no fim da cena cuja seguinte entra mais fundo, ela pousa na porta, com o nível de dentro já aparecendo
  cenas.forEach((c, i) => { const p = cenas[i + 1]; c.lente = p && p.nivel > c.nivel ? { t0: Math.max(c.t0 + 0.6, c.t1 - LENTE), t1: c.t1 } : null; });
  // os cortes que a imagem não mostra de uma vez (o conferir junta aos que ele vê): o começo de cada cena (a câmera que
  // entra ou sai começa ali, e a música troca ali, pelo mapa-do-som.json) e o começo de cada frase com plano (corte seco)
  const CORTES = cenas.slice(1).map((c) => c.t0).concat(Object.keys(PLANOS).map(Number).filter((n) => linha[n]).map((n) => linha[n].t0)).sort((a, b) => a - b);

  // ---------- efeitos sonoros (o que acontece na tela; o som do lugar está no mapa-do-som.json) ----------
  const ef = (t, som, vol = 0.8, pan = 0) => { if (t >= 0 && t < DURATION - 0.05) efeitos.push({ t, som, vol, pan }); };
  for (const v of CAM) {
    const entra = v.para > v.de;
    ef(v.t0 + 0.02, 'sopro', 0.4, entra ? [-0.5, 0.5] : [0.5, -0.5]); // a câmera passa pela porta (o sopro anda no fone)
    ef(v.t1 - 0.06, entra ? 'gota' : 'pop', 0.55); // chegou ao nível
  }
  for (const c of cenas) {
    if (c.lente) ef(c.lente.t0 + 0.05, 'tique', 0.5, 0.3); // a lente pousa
    if (c.tipo === 'fecho') { NIVEIS.forEach((_, i) => ef(c.itens[0].tv + 0.4 + 0.25 * i, 'pop', 0.55, -0.5 + i / Math.max(1, NIVEIS.length - 1))); ef(c.t1 - 4 * BEAT, 'certo', 0.7); }
    for (const e of c.efeitos || []) if (linha[e.frase]) ef(linha[e.frase].t0 + (e.em || 0), e.som, e.vol ?? 0.8, e.pan || 0);
  }
  efeitos.sort((p, q) => p.t - q.t);

  // ---------- marcadores: um instante por frase, quando ela já está inteira na tela (folha de quadros, capa, qa e cores) ----------
  const mk = (k, t) => { markers[k] = Math.min(DURATION - 0.2, Math.max(0, t)); };
  for (const c of cenas) c.itens.forEach((it, i) => mk(i ? `${c.id}F${i + 1}` : c.id, linha[it.n].t0 + Math.min(1.6, (linha[it.n].t1 - linha[it.n].t0) / 2)));
  if (cenas[0]) mk('principal', Math.min(cenas[0].itens[0].t1 - 0.3, 2.4)); // a capa: a pergunta grande e a cena de fora
  // um quadro no meio de cada viagem (para olhar a câmera entrando e saindo na folha de quadros)
  CAM.forEach((v, i) => mk(`viagem${i + 1}`, (v.t0 + v.t1) / 2));

  const cenaEm = (t) => { let c = cenas[0]; for (const x of cenas) if (t >= x.t0) c = x; return c; };
  // a câmera no instante t: base (o nível de fora dos dois da perna) e u (0 = na base, 1 = no nível de dentro dela)
  const camera = (t) => {
    let v = null;
    for (const s of CAM) if (t >= s.t0) v = s;
    if (!v) return { base: 0, u: 0, viajando: null };
    if (t >= v.t1) return { base: v.para, u: 0, viajando: null };
    const k = U.clamp((t - v.t0) / Math.max(0.001, v.t1 - v.t0), 0, 1), e = U.ease.inOutCubic(k);
    return v.para > v.de ? { base: v.de, u: e, viajando: v } : { base: v.para, u: 1 - e, viajando: v };
  };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, ESTILO, STYLE: ESTILO, cenas, linha, efeitos, cenaEm, TX, ROTEIRO, NIVEIS, PLANOS, CAM, camera, CORTES, LIMITE: 120 };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
