// PRESEME · tipo "o caminho" · linha do tempo · MOLDE: o chat 1 copia a pasta do molde e preenche só o bloco PREENCHER.
// Um processo de saúde mostrado andando: uma pergunta abre, um objeto percorre um trajeto parando em cada etapa, cada
// parada diz o que acontece ali e o que pode dar errado, e a chegada responde à pergunta. O movimento é a explicação.
// Fonte única dos tempos: o desenho (film-*.js) e o som (mapa-do-som.json + efeitos daqui) leem deste arquivo.
// Os tempos saem do tamanho de cada frase do textos.js: mudou o texto, o tempo se ajusta sozinho.
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
  // TROQUE o que está aqui pela peça. O exemplo completo e conferido é exemplo-rede-de-frio/score.js (a vacina até o braço).
  const BPM = 96; // pode ficar: andamento calmo, que dá tempo de ler
  const ESTILO = 'carimbo'; // a cara do tipo (kit de estilos): carimbo e gravura ★ (cada parada carimba o passaporte); só troca pela folha da parada 2
  const PRINCIPAL = 'parada2'; // TROQUE: a cena do quadro principal (folha da parada 2 e capa alternativa)
  // TROQUE: de onde o objeto sai: o desenho do lugar (PECA.LUGAR; sem desenho, um prédio) e o nome dele no mapa ([Dnn])
  const PARTIDA = { lugar: 'partida', nome: 'D01' };
  // TROQUE: o medidor que acompanha a viagem (null se o caminho não tiver uma medida a manter): o rótulo da faixa segura ([Dnn]),
  // a faixa segura e a escala do desenho. Os números da escala são desenho (régua), não frase.
  const MEDIDOR = { rotulo: 'D06', faixa: [2, 8], escala: [-2, 14], normal: 5 };
  // As cenas, em ordem. Tipos: pergunta · parada · chegada.
  //   pergunta: a 1ª frase é a pergunta (o mapa do caminho se desenha); a 2ª, o que tem de ser mantido (o medidor).
  //   parada: num (1, 2, 3...), nome ([Dnn] curto: letreiro, mapa e passaporte), lugar (o desenho do lugar, PECA.LUGAR),
  //           transporte (o veículo do trecho até ela, PECA.TRANSPORTE; sem, o objeto vai pulando), a 1ª frase é a chegada
  //           (o que acontece ali e por quê); as seguintes são cuidados (o que pode dar errado e como se previne), uma por
  //           frase, cada uma com o seu medidor: risco (o valor que o medidor alcança; null = não sai da faixa),
  //           volta (true: o cuidado traz o valor de volta à faixa, com o visto; false: não tem volta, com o X) e
  //           alarme (as marcas de alarme no medidor, opcional).
  //   chegada: nome, lugar e transporte como na parada; a 1ª frase é a chegada; a 2ª responde à pergunta, com o mapa inteiro.
  // TROQUE: de 3 a 7 paradas (o mapa e o passaporte se ajustam; mais de 7 cabe, mas o reel passa de 2 minutos).
  // Cada parada leva de 1 a 3 frases; a chegada, 2. As linhas seguem a ordem do textos.txt.
  const ROTEIRO = [
    { id: 'pergunta', tipo: 'pergunta', linhas: [1, 2] },
    { id: 'parada1', tipo: 'parada', num: 1, nome: 'D02', lugar: 'lugar1', transporte: 'caminhao', linhas: [3, 4], cuidados: [{ risco: null }] },
    { id: 'parada2', tipo: 'parada', num: 2, nome: 'D03', lugar: 'lugar2', transporte: 'aviao', linhas: [5, 6], cuidados: [{ risco: 11, volta: true, alarme: [3, 7] }] },
    { id: 'parada3', tipo: 'parada', num: 3, nome: 'D04', lugar: 'lugar3', transporte: null, linhas: [7, 8], cuidados: [{ risco: 12, volta: false }] },
    { id: 'chegada', tipo: 'chegada', nome: 'D05', lugar: 'pessoa', transporte: null, linhas: [9, 10] },
  ];
  // ==============================================================

  const clock = MU.makeClock({ bpm: BPM, offset: 0 });
  const { T, BEAT } = clock;
  const VEL = 2.17, FOLGA = 0.5, MINIMO = 4; // leitura: 2,17 palavras por segundo e meio segundo de folga; nunca menos de 4 batidas
  const palavras = (n) => (TX[n] || '').trim().split(/\s+/).filter(Boolean).length;
  const batidas = (n) => Math.max(MINIMO, Math.ceil((palavras(n) / VEL + FOLGA) / BEAT - 0.05));
  // o tempo das coisas que se mexem (batidas e segundos): a viagem, o cartão do cuidado e o mapa
  const VIAGEM = 3; // batidas da viagem até a parada (a chegada cai no começo da 4ª batida da cena)
  const CARTAO = { sobe: 0.6, sobeDur: 0.6, volta: 2.4, voltaDur: 0.6 }; // segundos depois que a frase do cuidado entra
  const MAPA = { traca: 0.5, tracaDur: 1.6 }; // a linha do caminho se desenha na pergunta

  const cenas = [], linha = {}, efeitos = [], markers = {}, S = {};
  let b = 0;
  for (const r of ROTEIRO) {
    const ls = r.linhas.filter((n) => TX[n]);
    if (!ls.length) continue;
    let bb = b;
    const itens = ls.map((n, i) => {
      let d = batidas(n);
      if ((r.tipo === 'parada' || r.tipo === 'chegada') && i === 0) d = Math.max(d, VIAGEM + 4); // a viagem e a chegada cabem na 1ª frase
      if (r.tipo === 'parada' && i > 0) d = Math.max(d, 6); // o medidor sobe e (se for o caso) volta
      if (r.tipo === 'pergunta') d = Math.max(d, 6); // o caminho se desenha
      const it = { n, b0: bb, d }; bb += d; return it;
    });
    let total = bb - b + (r.tipo === 'chegada' ? 4 : 0);
    total += (4 - (total % 4)) % 4; // toda cena acaba no fim de um compasso: o corte cai junto com a música
    itens[itens.length - 1].d += total - (bb - b);
    for (const it of itens) { it.t0 = it.b0 * BEAT; it.t1 = (it.b0 + it.d) * BEAT; linha[it.n] = { t0: it.t0, t1: it.t1 }; }
    const c = Object.assign({}, r, { itens, t0: b * BEAT, t1: (b + total) * BEAT });
    if (r.tipo === 'parada' || r.tipo === 'chegada') c.tChega = c.t0 + VIAGEM * BEAT;
    // os cuidados, um por frase depois da primeira (sem configuração, o medidor fica na faixa)
    if (r.tipo === 'parada') c.itens.forEach((it, i) => { if (i > 0) it.cuidado = Object.assign({ risco: null, volta: true }, (r.cuidados || [])[i - 1] || {}); });
    cenas.push(c); S[c.id] = [c.t0, c.t1];
    b += total;
  }
  const DURATION = b * BEAT;

  // o caminho: a partida (0), as paradas (1..N) e a chegada (N+1), na ordem; cada cena de parada ou chegada leva o objeto
  // do ponto anterior ao dela
  const PONTOS = [Object.assign({ k: 0, tipo: 'partida' }, PARTIDA)];
  for (const c of cenas) if (c.tipo === 'parada' || c.tipo === 'chegada') { c.ponto = PONTOS.length; PONTOS.push({ k: c.ponto, tipo: c.tipo, num: c.num, nome: c.nome, lugar: c.lugar, cena: c.id, tChega: c.tChega }); }

  // ---------- efeitos sonoros (o que acontece na tela; o som do lugar está no mapa-do-som.json) ----------
  const ef = (t, som, vol = 0.8, pan = 0) => efeitos.push({ t, som, vol, pan });
  const invInOut = (y) => (y < 0.5 ? Math.cbrt(y / 4) : 1 - Math.cbrt(2 * (1 - y)) / 2); // o avesso do U.ease.inOutCubic da viagem
  for (const c of cenas) {
    if (c.tipo === 'pergunta') {
      ef(c.t0 + 0.3, 'pop', 0.8, -0.5); // o objeto aparece na partida
      ef(c.t0 + MAPA.traca, 'lapis', 0.55); // a linha do caminho se desenha
      if (c.itens[1]) ef(c.itens[1].t0 + 0.05, 'tique', 0.7); // o medidor
    }
    if (c.tipo === 'parada' || c.tipo === 'chegada') {
      // a viagem que anda de um fone ao outro: com veículo, vem do mapa-do-som.json (uma coisa por trecho, em 0, "pan": [-0.8, 0.7]);
      // sem veículo, o objeto vai pulando, e cada pouso no chão faz uma gota, da esquerda para a direita
      if (!c.transporte) [1 / 3, 2 / 3].forEach((e, j) => ef(c.t0 + invInOut(e) * (c.tChega - c.t0), 'gota', 0.55, j ? 0.35 : -0.6));
      ef(c.tChega, 'baque', 0.9, -0.2); // o carimbo do passaporte, na chegada
      ef(c.tChega + 0.35, 'pop', 0.6, 0.2); // o letreiro
    }
    if (c.tipo === 'parada') c.itens.forEach((it) => {
      if (!it.cuidado) return;
      ef(it.t0 + 0.05, 'tique', 0.7); // o cartão do cuidado
      if (it.cuidado.risco !== null && it.cuidado.risco !== undefined) {
        ef(it.t0 + CARTAO.sobe + CARTAO.sobeDur, 'pop', 0.8, 0.3); // o medidor chega ao risco
        ef(it.t0 + CARTAO.volta + CARTAO.voltaDur, it.cuidado.volta ? 'certo' : 'baque', 0.8); // o visto ou o X
      }
    });
    if (c.tipo === 'chegada' && c.itens[1]) ef(c.itens[1].t0 + BEAT, 'certo', 0.85); // o caminho inteiro conferido
  }
  efeitos.sort((p, q) => p.t - q.t);

  // ---------- marcadores: um instante de cada frase (folha de quadros, capa, qa e cores) ----------
  const mk = (k, t) => { markers[k] = Math.min(DURATION - 0.2, Math.max(0, t)); };
  for (const c of cenas) c.itens.forEach((it, i) => {
    let t = it.t0 + Math.min(it.t1 - it.t0 - 0.1, 2.5 * BEAT);
    if (i === 0 && c.tChega) t = Math.min(it.t1 - 0.1, c.tChega + 1.2); // depois da chegada: o lugar, o letreiro e o carimbo
    if (it.cuidado) t = Math.min(it.t1 - 0.1, it.t0 + CARTAO.sobe + CARTAO.sobeDur + 0.5); // o medidor no ponto alto
    if (c.tipo === 'pergunta' && i === 0) t = Math.min(it.t1 - 0.1, it.t0 + MAPA.traca + MAPA.tracaDur + 0.4); // o caminho inteiro
    mk(c.id + (i ? 'F' + (i + 1) : ''), t);
  });
  if (markers[PRINCIPAL] !== undefined) markers.principal = markers[PRINCIPAL];

  const cenaEm = (t) => { let c = cenas[0]; for (const x of cenas) if (t >= x.t0) c = x; return c; };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, ESTILO, STYLE: ESTILO, cenas, linha, efeitos, cenaEm, TX, ROTEIRO, PARTIDA, MEDIDOR, PONTOS, VIAGEM, CARTAO, MAPA };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
