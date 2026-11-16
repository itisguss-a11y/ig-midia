// PRESEME · motor do tipo "antes e depois" · linha do tempo · MOLDE: o chat 1 copia esta pasta e preenche o bloco PREENCHER
// A mesma cena em dois tempos, separados por uma ação de saúde (uma vacina, uma lei, um programa). A tela dividida
// (a capa) e a cortina que corre (o corte do antes para o depois) mostram o mesmo lugar nos dois tempos, cada tempo com o
// número oficial dele; depois, o que a ação fez, por que funcionou, o que acontece se ela parar, e o fecho volta ao hoje.
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

  // ===================== PREENCHER (chat 1): o andamento, o estilo e os momentos do desenho da peça =====================
  // EXEMPLO preenchido: a pólio no Brasil antes e depois da vacinação (texto e desenho de exemplo escritos pelo Opus).
  const BPM = 96; // TROQUE só se quiser outro andamento (de 88 a 104); o mapa-do-som.json leva o mesmo número
  // o estilo do kit (motor/estilos). Padrão do tipo: carimbo e gravura (o antes sai com o fundo mais fundo e a gravura
  // por cima, o depois limpo, no mesmo kit). Na parada 2, a folha mostra também outros dois (comando estilos).
  const ESTILO = 'carimbo';
  // as cenas do molde (fixas: o tipo, a ordem e as frases de cada uma). Os tipos de cena:
  //   pergunta · a capa: a pergunta grande em cima e a tela dividida, o antes à esquerda e o depois à direita, cada
  //              lado com o carimbo do ano e a placa do número oficial; depois, a frase que apresenta o lugar
  //   antes    · o lugar no tempo de antes, inteiro: o carimbo do ano bate e a placa do número entra
  //   acao     · o mesmo lugar de perto, no ano da ação (carimbo novo), com a ação acontecendo nele
  //   depois   · a cortina corre da direita para a esquerda e o lugar vira o de hoje (a música troca aqui); o carimbo
  //              do hoje bate e a placa do número de hoje entra
  //   porque   · por que funcionou: o desenho da peça explica o mecanismo, sem o lugar
  //   separar  · o que acontece se a ação parar: silêncio antes (mapa do som), a pergunta, e a cortina volta até o meio,
  //              o antes entrando de novo pela esquerda
  //   fecho    · volta ao hoje e responde à pergunta da capa
  // extra: batidas a mais no fim da cena (para o desenho terminar de andar antes do corte)
  const ROTEIRO = [
    { id: 'abertura', tipo: 'pergunta', linhas: [1, 2] },
    { id: 'antes', tipo: 'antes', linhas: [3, 4] },
    { id: 'acao', tipo: 'acao', linhas: [5, 6] },
    { id: 'depois', tipo: 'depois', linhas: [7, 8] },
    { id: 'porque', tipo: 'porque', linhas: [9, 10], extra: 2 },
    { id: 'separar', tipo: 'separar', linhas: [11, 12, 13] },
    { id: 'fecho', tipo: 'fecho', linhas: [14, 15] },
  ];
  // TROQUE: os momentos do desenho da peça. Cada coisa que entra na tela tem um nome, a frase em que ela entra e
  // quantos segundos depois da entrada da frase (dt). O desenho (film-2-peca.js) pergunta SCORE.momento('nome'), e o
  // som do momento (se houver) vira efeito sonoro no mesmo instante: desenho e som nunca se desencontram.
  // som: pop, gota, tique, sopro, sino, certo, baque, lapis (ou null); vol: de 0 a 1; lado: -1 esquerda, 1 direita
  const MOMENTOS = [
    // a ação (frase 6): cada criança da fila ganha o sinal de vacinada, da primeira para a última
    { nome: 'v1', frase: 6, dt: 0.6, som: 'tique', vol: 0.4, lado: 0.15 },
    { nome: 'v2', frase: 6, dt: 1.0, som: 'tique', vol: 0.4, lado: 0.05 },
    { nome: 'v3', frase: 6, dt: 1.4, som: 'tique', vol: 0.4, lado: -0.05 },
    { nome: 'v4', frase: 6, dt: 1.8, som: 'tique', vol: 0.4, lado: -0.15 },
    // o depois (frase 8): o certificado de 1994
    { nome: 'certificado', frase: 8, dt: 0.6, som: 'baque', vol: 0.55, lado: -0.45 },
    // por que funcionou (frases 9 e 10): as dez pessoas, o vírus chega, pega a primeira e para nas vacinadas
    { nome: 'grupo', frase: 9, dt: 0.3, som: 'pop', vol: 0.4 },
    { nome: 'virus', frase: 9, dt: 1.8, som: 'sopro', vol: 0.4, lado: -0.6 },
    { nome: 'pega', frase: 9, dt: 2.7, som: 'gota', vol: 0.45, lado: -0.5 },
    { nome: 'bloqueio', frase: 9, dt: 3.6, som: 'baque', vol: 0.5, lado: -0.25 },
    { nome: 'bloqueio2', frase: 9, dt: 4.5, som: 'baque', vol: 0.5, lado: -0.45 },
    { nome: 'oitenta', frase: 10, dt: 0.6, som: 'certo', vol: 0.5 },
    // se parar (frases 12 e 13): o vírus do lado do antes; depois, a barra da cobertura e a meta
    { nome: 'volta', frase: 12, dt: 0.9, som: 'sopro', vol: 0.4, lado: -0.6 },
    { nome: 'barra', frase: 13, dt: 0.5, som: 'tique', vol: 0.45 },
    { nome: 'meta', frase: 13, dt: 1.8, som: 'tique', vol: 0.45, lado: 0.4 },
    // o fecho (frase 14): as quatro idades da vacina
    { nome: 'dose1', frase: 14, dt: 1.2, som: 'pop', vol: 0.35, lado: -0.4 },
    { nome: 'dose2', frase: 14, dt: 1.5, som: 'pop', vol: 0.35, lado: -0.15 },
    { nome: 'dose3', frase: 14, dt: 1.8, som: 'pop', vol: 0.35, lado: 0.15 },
    { nome: 'dose4', frase: 14, dt: 2.1, som: 'pop', vol: 0.35, lado: 0.4 },
  ];
  // ==========================================================================================================

  const clock = MU.makeClock({ bpm: BPM, offset: 0 });
  const { T, BEAT } = clock;
  // os tempos do molde (o desenho do molde lê os mesmos números: não mude um sem o outro)
  //   marca: o carimbo do ano bate (s depois do corte) · placa: a placa do número entra · cortina: quanto a cortina
  //   leva para atravessar a tela no "depois" · volta: no "separar", quanto depois da pergunta a cortina começa a voltar
  //   e quanto ela leva até o meio
  const MOLDE = { marca: 0.25, placa: 0.8, cortina: 0.9, volta: { atraso: 0.9, dur: 2.2 } };
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
      if (r.tipo === 'pergunta' && i === 0) d = Math.max(d, 6); // a pergunta fica no ar: é a capa e o gancho
      if (r.tipo === 'depois' && i === 0) d += Math.ceil(MOLDE.cortina / BEAT) + 1; // o tempo de olhar a cortina correr
      if (r.tipo === 'separar' && i === 0) d = Math.max(d, Math.ceil((MOLDE.volta.atraso + MOLDE.volta.dur + 0.6) / BEAT)); // a pergunta fica até o antes voltar
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
  const ef = (t, som, vol = 0.7, pan = 0) => { if (t >= 0 && t < DURATION - 0.05) efeitos.push({ t, som, vol, pan }); };
  for (const c of cenas) {
    // o corte: pop (no "depois" quem faz o corte é a cortina, com o sopro; no "separar" o corte vem depois do silêncio)
    if (c !== cenas[0] && c.tipo !== 'depois' && c.tipo !== 'separar') ef(c.t0, 'pop', 0.55);
    if (c.tipo === 'antes') { ef(c.t0 + MOLDE.marca, 'baque', 0.7, -0.35); ef(c.t0 + MOLDE.placa, 'tique', 0.5, -0.35); }
    if (c.tipo === 'acao') ef(c.t0 + MOLDE.marca, 'baque', 0.7, -0.35);
    if (c.tipo === 'depois') {
      ef(c.t0 + 0.05, 'sopro', 0.8, 0.25); // a cortina corre
      ef(c.t0 + MOLDE.cortina + 0.1, 'baque', 0.7, 0.35); // o carimbo do hoje
      ef(c.t0 + MOLDE.cortina + 0.5, 'tique', 0.5, 0.35); // a placa do número de hoje
    }
    if (c.tipo === 'separar') ef(c.itens[0].t0 + MOLDE.volta.atraso, 'sopro', 0.5, -0.35); // o antes volta pela esquerda
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
  // conferência de cores) e o quadro principal (a folha dos 3 estilos da parada 2: a tela dividida do "separar") ----------
  const mk = (k, t) => { markers[k] = Math.min(DURATION - 0.2, Math.max(0, t)); };
  for (const c of cenas) c.itens.forEach((it, i) => {
    let t = it.t0 + 2.5 * BEAT;
    if (c.tipo === 'depois' && i === 0) t = it.t0 + MOLDE.cortina + 1.0; // a cortina já passou e a placa já entrou
    if (c.tipo === 'separar' && i === 0) t = it.t0 + MOLDE.volta.atraso + MOLDE.volta.dur + 0.3; // o antes já voltou
    mk(i ? `${c.id}${i + 1}` : c.id, Math.min(t, it.t1 - 0.1));
  });
  // o quadro principal: a tela dividida do "separar", com o antes de volta pela esquerda e as duas placas (sem cena
  // "separar", a cortina no meio do caminho)
  const sep = cenas.find((c) => c.tipo === 'separar'), dep = cenas.find((c) => c.tipo === 'depois');
  if (sep) mk('principal', Math.min(sep.itens[0].t0 + MOLDE.volta.atraso + MOLDE.volta.dur + 0.3, sep.itens[0].t1 - 0.1));
  else if (dep) mk('principal', dep.t0 + MOLDE.cortina * 0.5);
  if (dep) mk('cortina', dep.t0 + MOLDE.cortina * 0.45);
  mk('abertura', 1.6);

  const cenaEm = (t) => { let c = cenas[0]; for (const x of cenas) if (t >= x.t0) c = x; return c; };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, ESTILO, STYLE: ESTILO, cenas, linha, efeitos, cenaEm, TX, ROTEIRO, MOMENTOS, MOM, momento, MOLDE };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
