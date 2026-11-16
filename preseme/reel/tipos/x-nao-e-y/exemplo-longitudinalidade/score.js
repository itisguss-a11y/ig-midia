// PRESEME · motor do tipo "X não é Y" · linha do tempo · PEÇA DE EXEMPLO: Longitudinalidade não é continuidade
// (texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1, no Fable, e pela conferência dos fatos)
// O formato do reel 1, que ele aprovou ("gostei muito do conteúdo"): dois conceitos que se confundem; cada um definido
// em uma frase, com o desenho do conceito funcionando; um caso concreto que separa os dois; e o fecho que responde,
// com como reconhecer na prática ou na prova.
// Fonte única dos tempos: o desenho (film-*.js) e o som (motor: som) leem daqui. Os tempos saem do tamanho de cada
// frase do textos.js: mudou o texto, o tempo se ajusta sozinho.
// O que o motor do reel espera deste arquivo (não tire): FPS, FORMAT, DURATION, BEAT, BPM, markers, S, cenas
// (id, t0, t1, itens), linha ({ n: { t0, t1 } }), efeitos ([{ t, som, vol, pan }]) e TX.
(function () {
  const node = typeof require !== 'undefined' && typeof module !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const TX = node ? require('./textos') : globalThis.TEXTOS;
  const FPS = 30;
  const FORMAT = U.pickFormat('9:16');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);

  // ===================== PREENCHER (chat 1): o andamento, o estilo e as cenas da peça =====================
  // (o molde, com os lugares a preencher marcados, está em ../molde/score.js)
  const BPM = 100;
  // o estilo do kit (motor/estilos): a cara deste tipo é o infográfico chapado ("chapado"), para não se parecer com as
  // séries (Na UBS é lápis; Doença de Roraima é giz). Na parada 2, a folha mostra também outros dois (comando estilos).
  const ESTILO = 'chapado';
  // os tipos de cena deste motor, na ordem em que costumam vir:
  //   titulo    · "X não é Y" inteiro já no primeiro quadro, e a frase que diz por que os dois se confundem
  //   conceito  · lado: 'x' ou 'y'; a etiqueta com o nome, a definição em uma frase e o desenho do conceito funcionando
  //   diferenca · a frase que separa os dois, com os dois desenhos lado a lado (tem silêncio antes, no mapa do som)
  //   caso      · o caso concreto que separa os dois, do começo ao fim (de 2 a 4 frases)
  //   regra     · como reconhecer na prática ou na prova: as palavras-pista de cada lado levam ao nome certo
  //   fecho     · responde ao título, com os dois lados
  // extra: batidas a mais no fim da cena (para o desenho terminar de andar antes do corte)
  const ROTEIRO = [
    { id: 'titulo', tipo: 'titulo', linhas: [1, 2] },
    { id: 'y', tipo: 'conceito', lado: 'y', linhas: [3, 4], extra: 2 },
    { id: 'x', tipo: 'conceito', lado: 'x', linhas: [5, 6], extra: 2 },
    { id: 'diferenca', tipo: 'diferenca', linhas: [7], extra: 2 },
    { id: 'caso', tipo: 'caso', linhas: [8, 9, 10, 11], extra: 2 },
    { id: 'regra', tipo: 'regra', linhas: [12, 13] },
    { id: 'fecho', tipo: 'fecho', linhas: [14] },
  ];
  // os momentos do desenho da peça: cada coisa que entra na tela tem um nome, a frase em que ela entra e quantos
  // segundos depois da entrada da frase. O desenho (film-2-peca.js) pergunta SCORE.momento('nome'), e o som do momento
  // (se houver) vira efeito sonoro no mesmo instante: desenho e som nunca se desencontram.
  // som: pop, gota, tique, sopro, sino, certo, baque, lapis (ou null); lado: -1 esquerda, 1 direita
  const MOMENTOS = [
    // continuidade: o problema, os atendimentos em sequência e a linha que termina
    { nome: 'problema', frase: 3, dt: 0.5, som: 'pop', vol: 0.45, lado: -0.6 },
    { nome: 'consulta', frase: 4, dt: 0.2, som: 'tique', vol: 0.5, lado: -0.45 },
    { nome: 'exame', frase: 4, dt: 0.75, som: 'tique', vol: 0.5, lado: -0.15 },
    { nome: 'retorno', frase: 4, dt: 1.3, som: 'tique', vol: 0.5, lado: 0.15 },
    { nome: 'alta', frase: 4, dt: 1.85, som: 'tique', vol: 0.55, lado: 0.45 },
    { nome: 'fim', frase: 4, dt: 3.2, som: 'baque', vol: 0.6, lado: 0.6 },
    // longitudinalidade: a equipe, o fio que atravessa os anos e a pessoa que volta
    { nome: 'equipe', frase: 5, dt: 0.15, som: null },
    { nome: 'fio', frase: 5, dt: 0.6, som: 'lapis', vol: 0.4, lado: -0.3 },
    { nome: 'pessoa', frase: 6, dt: 0.3, som: 'pop', vol: 0.4, lado: 0.4 },
    { nome: 'volta', frase: 6, dt: 2.2, som: 'gota', vol: 0.45, lado: -0.2 },
    // o caso de Dona Maria
    { nome: 'maria', frase: 8, dt: 0.2, som: null },
    { nome: 'prenatal', frase: 8, dt: 1.4, som: 'pop', vol: 0.5, lado: -0.5 },
    { nome: 'dengue', frase: 9, dt: 0.4, som: 'pop', vol: 0.5, lado: 0 },
    { nome: 'pressao', frase: 9, dt: 1.9, som: 'pop', vol: 0.5, lado: 0.5 },
    { nome: 'mesma', frase: 10, dt: 1.1, som: 'sino', vol: 0.6, lado: 0 },
    { nome: 'fins', frase: 11, dt: 0.5, som: 'baque', vol: 0.55, lado: 0 },
    // o fecho
    { nome: 'fica', frase: 14, dt: 1.6, som: null },
  ];
  // ==========================================================================================================

  const clock = MU.makeClock({ bpm: BPM, offset: 0 });
  const { T, BEAT } = clock;
  const STYLE = 'flat';
  // leitura (regra do motor, igual em toda peça): palavras ÷ 2,17 por segundo + 0,5 s de folga; nenhuma frase fica
  // menos de 4 batidas
  const VEL = 2.17, FOLGA = 0.5, MINIMO = 4;
  const palavras = (n) => (TX[n] || '').trim().split(/\s+/).filter(Boolean).length;
  const batidas = (n) => Math.max(MINIMO, Math.ceil((palavras(n) / VEL + FOLGA) / BEAT - 0.05));

  const cenas = [], linha = {}, efeitos = [], markers = {}, S = {};
  let b = 0;
  for (const r of ROTEIRO) {
    const ls = r.linhas.filter((n) => TX[n]);
    if (!ls.length) continue; // cena com todas as frases apagadas sai do vídeo
    let bb = b;
    const itens = ls.map((n, i) => {
      let d = batidas(n);
      if (r.tipo === 'titulo' && i === 0) d = Math.max(d, 6); // o título fica no ar: é a capa e o gancho
      if (r.tipo === 'diferenca') d = Math.max(d, 8); // a frase que separa os dois é a mais importante: tempo de olhar os dois lados
      const it = { n, b0: bb, d }; bb += d; return it;
    });
    let total = bb - b + (r.extra || 0) + (r.tipo === 'fecho' ? 4 : 0);
    total += (4 - (total % 4)) % 4; // toda cena acaba no fim de um compasso: o corte cai junto com a música
    itens[itens.length - 1].d += total - (bb - b);
    for (const it of itens) { it.t0 = it.b0 * BEAT; it.t1 = (it.b0 + it.d) * BEAT; linha[it.n] = { t0: it.t0, t1: it.t1 }; }
    const c = Object.assign({}, r, { itens, t0: b * BEAT, t1: (b + total) * BEAT });
    cenas.push(c); S[c.id] = [c.t0, c.t1];
    b += total;
  }
  const DURATION = b * BEAT;

  // ---------- efeitos sonoros (o som do que acontece na tela; o som do lugar e das coisas está no mapa-do-som.json) ----------
  // os tempos do molde (o desenho do molde lê os mesmos números: não mude um sem o outro)
  const MOLDE = { diferente: 0.9, etiqueta: 0.15, acha: 1.2, fecho: 2 * BEAT };
  const ef = (t, som, vol = 0.7, pan = 0) => efeitos.push({ t, som, vol, pan });
  for (const c of cenas) {
    if (c !== cenas[0]) ef(c.t0, 'pop', 0.6); // o corte
    if (c.tipo === 'titulo') ef(c.t0 + MOLDE.diferente, 'sino', 0.7); // o "≠" bate entre os dois nomes
    if (c.tipo === 'conceito') ef(c.t0 + MOLDE.etiqueta, 'lapis', 0.45, c.lado === 'x' ? 0.3 : -0.3); // a etiqueta entra
    if (c.tipo === 'diferenca') ef(c.itens[0].t0 + 0.05, 'baque', 0.75); // a frase que separa cai depois do silêncio
    if (c.tipo === 'regra') c.itens.forEach((it, i) => ef(it.t0 + MOLDE.acha, 'certo', 0.55, i ? 0.35 : -0.35)); // a pista acha o nome
    if (c.tipo === 'fecho') ef(c.t0 + MOLDE.fecho, 'certo', 0.75);
  }
  // os momentos da peça: o instante de cada um e o som dele (frase apagada: o momento some, e o desenho dele não entra)
  const MOM = {};
  for (const m of MOMENTOS) {
    if (!linha[m.frase]) continue;
    const t = Math.min(linha[m.frase].t1 - 0.05, linha[m.frase].t0 + m.dt);
    MOM[m.nome] = t;
    if (m.som) ef(t, m.som, m.vol ?? 0.5, m.lado ?? 0);
  }
  const momento = (nome) => (nome in MOM ? MOM[nome] : Infinity);
  efeitos.sort((p, q) => p.t - q.t);

  // ---------- marcadores: um instante de cada frase, quando ela já está inteira na tela (folha de quadros, capa,
  // conferência de cores) e o quadro principal (a folha dos 3 estilos da parada 2) ----------
  const mk = (k, t) => { markers[k] = Math.min(DURATION - 0.2, Math.max(0, t)); };
  for (const c of cenas) c.itens.forEach((it, i) => mk(i ? `${c.id}${i + 1}` : c.id, it.t0 + Math.min(it.t1 - it.t0 - 0.1, 2.5 * BEAT)));
  const caso = cenas.find((c) => c.tipo === 'caso'), dif = cenas.find((c) => c.tipo === 'diferenca');
  if (caso) mk('principal', caso.itens[caso.itens.length - 1].t0 + Math.min(3.2, (caso.t1 - caso.itens[caso.itens.length - 1].t0) - 0.2));
  else if (dif) mk('principal', dif.t1 - 0.4);
  mk('abertura', 1.6);

  const cenaEm = (t) => { let c = cenas[0]; for (const x of cenas) if (t >= x.t0) c = x; return c; };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, STYLE, ESTILO, cenas, linha, efeitos, cenaEm, TX, ROTEIRO, MOMENTOS, MOM, momento, MOLDE };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
