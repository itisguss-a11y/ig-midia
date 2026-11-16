// versão 5, só para testar o motor; a peça de verdade está no chat dela
// PRESEME · motor do tipo "um dia, contado pela hora" · linha do tempo
// O chat 1 preenche só o bloco PREENCHER (abaixo). O resto é do molde e não muda: as cenas, os tempos, o contador,
// os marcadores, os efeitos e a conta saem da lista de momentos. Os tempos saem do tamanho de cada frase do textos.txt
// (2,17 palavras por segundo + 0,5 s; nenhuma frase fica menos de 4 batidas; toda cena acaba no fim de um compasso).
(function () {
  const node = typeof require !== 'undefined' && typeof module !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const TX = node ? require('./textos') : globalThis.TEXTOS;

  // ============================== PREENCHER (chat 1) ==============================
  const BPM = 107; // o andamento: os cortes caem nas batidas da música
  const ESTILO = 'lapis'; // o estilo do kit: lapis, pixel, giz, planta, carimbo ou chapado (o padrão deste tipo é lapis)
  const CONTADOR = 'D01'; // a palavra [Dnn] em cima do contador
  // as categorias que a recontagem soma: a etiqueta da faixa ([Dnn]) e a cor dela (folha, salvia, marca ou coral)
  const CATEGORIAS = {
    amb: { etiqueta: 'D11', cor: 'folha' },
    san: { etiqueta: 'D12', cor: 'salvia' },
    epi: { etiqueta: 'D13', cor: 'marca' },
  };
  // a abertura: a pergunta (título), a resposta (balão do calouro) e a tese (a lente aparece)
  const ABERTURA = { pergunta: 1, resposta: 2, tese: 3 };
  // os momentos do dia, na ordem: hora = a palavra [Dnn] da hora ("06h10"; sem hora, ex. "na infância", fica no bloco anterior);
  // frases = as frases da cena (a 1.ª vê de longe, as outras de perto); cat = a categoria; selo = o desenho pequeno do selo
  // (gota, pao, remedio, vacina, gotinha, mapa, rotulo, sal, salgadinho, casa, check ou numero); nome = a frase que dá o
  // nome da categoria (vira o cartão escuro). Som (opcional): lugar = o fundo da cena; coisas = até duas, como no mapa-do-som.
  const MOMENTOS = [
    { id: 'agua', hora: 'D02', frases: [4, 5, 6], cat: 'amb', selo: 'gota', nome: 5, coisas: [{ som: 'passaro', em: 0.4, pan: -0.5, vol: 0.4 }] },
    { id: 'pao', hora: 'D03', frases: [7, 8], cat: 'san', selo: 'pao' },
    { id: 'remedio', hora: 'D04', frases: [9, 10, 11, 12], cat: 'san', selo: 'remedio', nome: 11 },
    { id: 'braco', hora: 'D05', frases: [13, 14], cat: 'epi', selo: 'vacina' },
    { id: 'gotinha', hora: 'D06', frases: [15, 16], cat: 'epi', selo: 'gotinha' },
    { id: 'agente', hora: 'D07', frases: [17, 18, 19, 20], cat: 'epi', selo: 'mapa', nome: 19, lugar: 'cidade', coisas: [{ som: 'mosquito', em: '[17]', dur: 2.5, pan: [-0.9, 0.9], vol: 0.9, abaixa: 12 }] },
    { id: 'lanche', hora: 'D08', frases: [21, 22], cat: 'san', selo: 'rotulo' },
    { id: 'sal', hora: 'D09', frases: [23, 24], cat: 'san', selo: 'sal' },
    { id: 'salgadinho', hora: 'D10', frases: [25, 26], cat: 'san', selo: 'salgadinho' },
  ];
  // a recontagem: uma fileira por frase "Categoria, N." (null = a fileira do que não aconteceu, sempre 0) e o resultado
  const RECONTAGEM = { filas: [[27, 'san'], [28, 'epi'], [29, 'amb'], [30, null]], resultado: 31 };
  const FECHO = { tese: 32 }; // a tese de novo, com o contador cheio
  // o clima da música em cada parte do dia (calmo, curioso, brincalhao, tenso, serio, festa) e o silêncio antes da tese
  const SOM = { climas: { manha: 'curioso', tarde: 'brincalhao', noite: 'calmo', resultado: 'festa' }, silencioAntesDaTese: 0.6 };
  // ============================ fim do PREENCHER ============================

  const FPS = 30;
  const FORMAT = U.pickFormat('9:16');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = MU.makeClock({ bpm: BPM, offset: 0 });
  const { T, BEAT } = clock;
  const STYLE = U.pickStyle ? U.pickStyle('paper') : 'paper';

  const VEL = 2.17, FOLGA = 0.5, MINIMO = 4;
  const batidas = (n) => Math.max(MINIMO, Math.ceil((TX[n].trim().split(/\s+/).length / VEL + FOLGA) / BEAT - 0.05));

  // a hora de cada momento vira a parte do dia: antes das 12h, manhã; até as 18h, tarde; depois, noite
  const periodoDe = (m, antes) => {
    const h = /(\d{1,2})\s*h/i.exec(TX[m.hora] || '');
    if (!h) return antes || 'manha';
    const n = parseInt(h[1], 10);
    return n < 12 ? 'manha' : n < 18 ? 'tarde' : 'noite';
  };
  const ROTEIRO = [{ id: 'abertura', tipo: 'abertura', linhas: [ABERTURA.pergunta, ABERTURA.resposta, ABERTURA.tese] }];
  let per = null;
  for (const m of MOMENTOS) { per = periodoDe(m, per); ROTEIRO.push(Object.assign({}, m, { tipo: 'momento', linhas: m.frases, vig: m.cat, periodo: per })); }
  ROTEIRO[0].periodo = (ROTEIRO[1] && ROTEIRO[1].periodo) || 'manha'; // a abertura entra no clima do primeiro momento
  ROTEIRO.push({ id: 'recontagem', tipo: 'recontagem', linhas: RECONTAGEM.filas.map((f) => f[0]).concat([RECONTAGEM.resultado]), periodo: 'resultado' });
  ROTEIRO.push({ id: 'fecho', tipo: 'fecho', linhas: [FECHO.tese], periodo: 'resultado' });

  const cenas = [], linha = {}, efeitos = [], markers = {}, S = {}, nomeado = {};
  let b = 0, nUso = 0;
  for (const r of ROTEIRO) {
    const ls = r.linhas.filter((n) => TX[n]);
    if (!ls.length) continue;
    let bb = b;
    const itens = ls.map((n) => { const d = batidas(n); const it = { n, b0: bb, d }; bb += d; return it; });
    let total = bb - b + (r.tipo === 'fecho' ? 4 : 0);
    total += (4 - (total % 4)) % 4; // a cena acaba no fim de um compasso: o corte cai junto com a música
    itens[itens.length - 1].d += total - (bb - b);
    for (const it of itens) { it.t0 = it.b0 * BEAT; it.t1 = (it.b0 + it.d) * BEAT; linha[it.n] = it; }
    const c = Object.assign({}, r, { itens, t0: b * BEAT, t1: (b + total) * BEAT });
    if (r.tipo === 'momento') {
      c.uso = ++nUso; // o contador conta os momentos que ficaram: se ele apagar um momento inteiro, os números seguintes descem
      c.tLente = (itens[0].b0 + Math.max(2, Math.round(itens[0].d / 2))) * BEAT;
      efeitos.push({ t: c.tLente, som: 'pop', vol: 0.9 });
      if (r.nome && linha[r.nome]) { nomeado[r.vig] = linha[r.nome].t0; efeitos.push({ t: linha[r.nome].t0, som: 'sino', vol: 0.7 }); }
    }
    cenas.push(c); S[c.id] = [c.t0, c.t1];
    b += total;
  }
  const DURATION = b * BEAT;

  // a faixa da categoria (etiqueta + selos) só aparece depois que o nome dela foi dito na tela
  for (const c of cenas) {
    if (!c.uso) continue;
    const tn = nomeado[c.vig];
    c.tChip = tn === undefined || tn >= c.t1 ? Infinity : Math.max(c.tLente, tn);
    c.selos = cenas.filter((x) => x.uso && x.vig === c.vig && x.uso <= c.uso).map((x) => x.selo);
    c.selosUso = cenas.filter((x) => x.uso && x.vig === c.vig && x.uso <= c.uso).map((x) => x.uso); // o número de cada um (selo "numero")
  }

  // a conta: sai da lista de momentos (a recontagem desenha estes números; o peca.js confere se o texto diz o mesmo)
  const usos = cenas.filter((c) => c.uso);
  const porCat = {};
  for (const k of Object.keys(CATEGORIAS)) porCat[k] = 0;
  for (const c of usos) porCat[c.vig] = (porCat[c.vig] || 0) + 1;
  const contagem = { porCat, total: usos.length };

  // efeitos que não são o contador nem o nome da categoria
  if (linha[ABERTURA.resposta]) efeitos.push({ t: linha[ABERTURA.resposta].t0, som: 'pop', vol: 0.8 }); // o balão da resposta
  if (linha[ABERTURA.tese]) efeitos.push({ t: linha[ABERTURA.tese].t0, som: 'sopro', vol: 0.6 }); // a lente aparece pela primeira vez
  for (const [n] of RECONTAGEM.filas) if (linha[n]) efeitos.push({ t: linha[n].t0, som: 'tique', vol: 0.8 }); // cada fileira
  if (linha[RECONTAGEM.resultado]) efeitos.push({ t: linha[RECONTAGEM.resultado].t0, som: 'certo', vol: 0.8 }); // o resultado
  efeitos.sort((p, q) => p.t - q.t);

  // marcadores: um instante de cada cena, para a folha de quadros, a conferência e a capa (@abertura)
  const mk = (k, t) => { markers[k] = Math.min(DURATION - 0.2, t); };
  if (linha[ABERTURA.resposta]) mk('abertura', linha[ABERTURA.resposta].t0 + 2 * BEAT);
  if (linha[ABERTURA.tese]) mk('tese', linha[ABERTURA.tese].t0 + 2 * BEAT);
  for (const c of usos) {
    mk(c.id, Math.min(c.tLente + 2 * BEAT, c.itens[0].t1 - 0.25)); // ainda na primeira frase, mesmo quando ela é curta
    const perto = c.itens.find((it, i) => i > 0 && (!c.nome || it.n < c.nome)); // a frase vista de perto (a mesma regra do estado())
    if (perto) mk(c.id + 'Perto', perto.t0 + 2 * BEAT);
    if (c.nome && linha[c.nome]) mk(c.id + 'Nome', linha[c.nome].t0 + 2 * BEAT);
  }
  const ultimaFila = RECONTAGEM.filas.map((f) => f[0]).filter((n) => linha[n]).pop();
  if (ultimaFila) mk('fileiras', linha[ultimaFila].t0 + 2 * BEAT);
  if (linha[RECONTAGEM.resultado]) mk('recontagem', linha[RECONTAGEM.resultado].t0 + 2 * BEAT);
  if (linha[FECHO.tese]) mk('fecho', linha[FECHO.tese].t0 + 3 * BEAT);

  // os blocos da música: cenas seguidas da mesma parte do dia (o ferramentas/dia-mapa.js escreve o mapa-do-som.json com eles)
  const blocos = [];
  for (const c of cenas) {
    const last = blocos[blocos.length - 1];
    if (last && last.periodo === c.periodo) last.cenas.push(c.id);
    else blocos.push({ periodo: c.periodo, clima: SOM.climas[c.periodo] || 'curioso', cenas: [c.id] });
  }

  const cenaEm = (t) => { let c = cenas[0]; for (const x of cenas) if (t >= x.t0) c = x; return c; };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, STYLE, ESTILO, cenas, linha, efeitos, cenaEm, TX,
    CATEGORIAS, CONTADOR, ABERTURA, MOMENTOS, RECONTAGEM, FECHO, SOM, blocos, contagem };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
