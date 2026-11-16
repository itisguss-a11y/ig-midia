// PRESEME · tipo "tour" · linha do tempo · MOLDE: o chat 1 copia a pasta do molde e preenche só o bloco PREENCHER.
// Um lugar visitado parada por parada: a pessoa chega pela frente, entra, anda pelo corredor e para em cada porta; a placa
// da sala acende, a porta abre e a sala aparece por dentro, com quem trabalha nela. No fim, a planta do lugar inteiro,
// com as salas numeradas, para print. O lugar e as pessoas que trabalham nele são a explicação.
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
  // Exemplo: "O que tem numa UBS, sala por sala?" (fontes: Portaria GM/MS nº 6.185/2024, os nomes das salas; PNAB, quem faz)
  const BPM = 96;
  const ESTILO = 'pixel'; // pixel ★ (a UBS como o mapa de um jogo); B lápis, C planta (na planta, a gente fica transparente)
  const PRINCIPAL = 'sala1C'; // a porta da sala de vacinação, com a placa acesa
  const LUGAR = { placa: 'D01', entrada: 'D02' };
  const VOCE = 'D14';
  const ROTEIRO = [
    { id: 'entrada', tipo: 'entrada', linhas: [1, 2] },
    { id: 'sala1', tipo: 'sala', num: 1, placa: 'D03', sala: 'vacina', foco: 1, linhas: [3, 4],
      quem: [{ rotulo: 'D08', pessoa: { quem: 'enfermeira', pele: 'escura', penteado: 'coque' }, x: 760 }, { rotulo: 'D09', pessoa: { quem: 'enfermeira', pele: 'clara', penteado: 'rabo' }, x: 270 }] },
    { id: 'sala2', tipo: 'sala', num: 2, placa: 'D04', sala: 'curativo', linhas: [5],
      quem: [{ rotulo: 'D08', pessoa: { quem: 'enfermeira', pele: 'media', penteado: 'curto' }, x: 660 }] },
    { id: 'sala3', tipo: 'sala', num: 3, placa: 'D05', sala: 'coleta', linhas: [6],
      quem: [{ rotulo: 'D08', pessoa: { quem: 'enfermeira', pele: 'escura', penteado: 'coque' }, x: 760 }] },
    { id: 'sala4', tipo: 'sala', num: 4, placa: 'D06', sala: 'consultorio', linhas: [7],
      quem: [{ rotulo: 'D09', pessoa: { quem: 'enfermeira', pele: 'clara', penteado: 'rabo' }, x: 430 }, { rotulo: 'D10', pessoa: { quem: 'medico', pele: 'media' }, x: 860 }] },
    { id: 'sala5', tipo: 'sala', num: 5, placa: 'D07', sala: 'odonto', linhas: [8],
      quem: [{ rotulo: 'D11', pessoa: { quem: 'medica', pele: 'media', penteado: 'cacheado' }, x: 300 }] },
    { id: 'fora', tipo: 'fora', rotulo: 'D13', linhas: [9],
      quem: [{ rotulo: 'D12', pessoa: { quem: 'agente' } }] },
    { id: 'planta', tipo: 'planta', linhas: [10] },
  ];
  // ==============================================================

  const clock = MU.makeClock({ bpm: BPM, offset: 0 });
  const { T, BEAT } = clock;
  const VEL = 2.17, FOLGA = 0.5, MINIMO = 4; // leitura: 2,17 palavras por segundo e meio segundo de folga; nunca menos de 4 batidas
  const palavras = (n) => (TX[n] || '').trim().split(/\s+/).filter(Boolean).length;
  const batidas = (n) => Math.max(MINIMO, Math.ceil((palavras(n) / VEL + FOLGA) / BEAT - 0.05));
  // o tempo das coisas que se mexem (batidas e segundos)
  const ANDA = 3; // batidas da caminhada até a porta (na fachada, até a porta da frente)
  const ABRE = 0.45; // segundos que a porta leva para abrir, depois da chegada
  const ENTRA = 1.15; // segundos depois da chegada em que o quadro corta para a sala por dentro
  const PLANTA = { traca: 0.4, tracaDur: 1.8 }; // na planta, o caminho se desenha

  const cenas = [], linha = {}, efeitos = [], markers = {}, S = {};
  let b = 0;
  for (const r of ROTEIRO) {
    const ls = r.linhas.filter((n) => TX[n]);
    if (!ls.length) continue;
    let bb = b;
    const itens = ls.map((n, i) => {
      let d = batidas(n);
      if (r.tipo === 'sala' && i === 0) d = Math.max(d, ANDA + 6); // a caminhada, a porta e a sala por dentro cabem na 1ª frase
      if (r.tipo === 'entrada' && i === 0) d = Math.max(d, ANDA + 3);
      if (r.tipo === 'planta' && i === 0) d = Math.max(d, 6); // a planta se desenha
      if (r.tipo === 'fora') d = Math.max(d, 6);
      const it = { n, b0: bb, d }; bb += d; return it;
    });
    let total = bb - b + (r.tipo === 'planta' ? 4 : 0);
    total += (4 - (total % 4)) % 4; // toda cena acaba no fim de um compasso: o corte cai junto com a música
    itens[itens.length - 1].d += total - (bb - b);
    for (const it of itens) { it.t0 = it.b0 * BEAT; it.t1 = (it.b0 + it.d) * BEAT; linha[it.n] = { t0: it.t0, t1: it.t1 }; }
    const c = Object.assign({}, r, { itens, t0: b * BEAT, t1: (b + total) * BEAT });
    if (r.tipo === 'sala' || r.tipo === 'entrada') c.tChega = c.t0 + ANDA * BEAT;
    if (r.tipo === 'sala') c.tEntra = c.tChega + ENTRA;
    cenas.push(c); S[c.id] = [c.t0, c.t1];
    b += total;
  }
  const DURATION = b * BEAT;

  // as portas do corredor: a entrada (0) e as salas (1..N), na ordem; cada cena de sala leva a pessoa da porta anterior à dela
  const PONTOS = [{ k: 0, tipo: 'entrada', placa: LUGAR.entrada }];
  for (const c of cenas) if (c.tipo === 'sala') { c.ponto = PONTOS.length; PONTOS.push({ k: c.ponto, tipo: 'sala', num: c.num, placa: c.placa, cena: c.id, tChega: c.tChega }); }

  // os cortes que a imagem não mostra de uma vez (o corredor anda com a câmera): o começo de cada cena, a entrada na sala
  // e cada frase seguinte (a sala de perto, o aluno, a planta)
  const CORTES = [];
  for (const c of cenas) {
    if (c.t0 > 0) CORTES.push(+c.t0.toFixed(3));
    if (c.tEntra) CORTES.push(+c.tEntra.toFixed(3));
    c.itens.forEach((it, i) => { if (i > 0) CORTES.push(+it.t0.toFixed(3)); });
  }

  // ---------- efeitos sonoros (o que acontece na tela; o som do lugar está no mapa-do-som.json) ----------
  const ef = (t, som, vol = 0.8, pan = 0) => efeitos.push({ t, som, vol, pan });
  const passos = (t0, t1, n = 4) => { for (let j = 0; j < n; j++) ef(t0 + ((j + 0.5) / n) * (t1 - t0), 'tique', 0.32, j % 2 ? 0.3 : -0.3); };
  for (const c of cenas) {
    if (c.tipo === 'entrada') {
      passos(c.t0 + 0.15, c.tChega);
      ef(c.tChega + 0.1, 'sopro', 0.45); // a porta de vidro abre
      if (c.itens[1]) ef(c.itens[1].t0 + 0.4, 'senha', 0.5, 0.3); // o painel de senha da recepção
    }
    if (c.tipo === 'sala') {
      passos(c.t0 + 0.1, c.tChega);
      ef(c.tChega, 'pop', 0.7, 0.2); // a placa acende
      ef(c.tChega + 0.12, 'sopro', 0.4, 0.3); // a porta abre
      ef(c.tEntra, 'tique', 0.6); // dentro da sala
      c.itens.forEach((it, i) => { if (i > 0) ef(it.t0 + 0.05, 'tique', 0.55, i === 1 ? -0.2 : 0.2); });
    }
    if (c.tipo === 'fora') { ef(c.t0 + 0.4, 'passaro', 0.5, -0.4); passos(c.t0 + 0.6, c.t1 - 0.6, 6); }
    if (c.tipo === 'planta') {
      ef(c.t0 + PLANTA.traca, 'lapis', 0.55); // o caminho se desenha na planta
      ef(c.itens[c.itens.length - 1].t0 + BEAT, 'certo', 0.8); // as salas conferidas
    }
  }
  efeitos.sort((p, q) => p.t - q.t);

  // ---------- marcadores: um instante de cada frase (folha de quadros, capa, qa e cores) ----------
  // salaN: a sala por dentro (1ª frase); salaNC: a porta no corredor (a placa acesa); salaNF2, F3: as frases seguintes
  const mk = (k, t) => { markers[k] = Math.min(DURATION - 0.2, Math.max(0, t)); };
  for (const c of cenas) c.itens.forEach((it, i) => {
    let t = it.t0 + Math.min(it.t1 - it.t0 - 0.1, 2.5 * BEAT);
    if (c.tipo === 'sala' && i === 0) { mk(c.id + 'C', c.tChega + ABRE + 0.25); t = Math.min(it.t1 - 0.1, c.tEntra + 0.9); }
    if (c.tipo === 'entrada' && i === 0) t = Math.min(it.t1 - 0.1, c.tChega - 0.2);
    if (c.tipo === 'planta' && i === 0) t = Math.min(it.t1 - 0.1, c.t0 + PLANTA.traca + PLANTA.tracaDur + 0.4);
    mk(c.id + (i ? 'F' + (i + 1) : ''), t);
  });
  if (markers[PRINCIPAL] !== undefined) markers.principal = markers[PRINCIPAL];

  const cenaEm = (t) => { let c = cenas[0]; for (const x of cenas) if (t >= x.t0) c = x; return c; };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, ESTILO, STYLE: ESTILO, cenas, linha, efeitos, cenaEm, TX, ROTEIRO, LUGAR, VOCE, PONTOS, ANDA, ABRE, ENTRA, PLANTA, CORTES };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
