// PRESEME · motor "Caso com escolha" · linha do tempo (molde fixo do tipo) · MOLDE: o chat 1 copia esta pasta e preenche
// Fonte única dos tempos: o desenho (film-*.js) e o som (mapa-do-som.json + efeitos daqui) leem deste arquivo.
// Os tempos saem do tamanho de cada frase do textos.js: mudou o texto, o tempo se ajusta sozinho.
// O chat 1 preenche só o bloco PREENCHER (andamento, estilo e os números das frases de cada parte); o resto é do molde.
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
  const BPM = 100;
  const ESTILO = 'giz'; // a cara do tipo (kit de estilos): giz na lousa ★ (pergunta de prova no quadro); a parada 2 mostra também lapis e planta
  // O caso: quem chega à UBS ou aparece na visita, em uma ou duas frases (a primeira é o gancho e já está no primeiro quadro).
  const CASO = [1, 2];
  // A pergunta, curta: "O que é?" ou "O que você faz?". Fica no alto, com as três opções e a contagem.
  const PERGUNTA = 3;
  // As três opções, na ordem A, B e C (até quatro palavras cada: cabem no cartão).
  const OPCOES = [4, 5, 6];
  // A resposta, que entra depois da contagem de 3 s e do silêncio. Se disser a letra ("É a B."), o motor confere com os vereditos.
  const RESPOSTA = 7;
  // O porquê de cada opção, na ordem A, B e C: os números das frases, com o desenho de cada uma (film-2-peca.js, PECA.PORQUE).
  // A primeira frase de cada opção COMEÇA com o veredito, Certa, Errada ou Pode ser (é a palavra que o selo carimba).
  const PORQUE = [[8, 9], [10, 11], [12, 13]];
  // O que se faz na atenção primária (o exame e a equipe, quando procurar a unidade, a notificação): PECA.APS desenha.
  const APS = [14, 15, 16, 17];
  // A prevenção: PECA.PREVENCAO desenha.
  const PREVENCAO = [18, 19, 20];
  // O fecho, que volta ao caso (uma frase).
  const FECHO = [21];
  // ==============================================================

  const clock = MU.makeClock({ bpm: BPM, offset: 0 });
  const { T, BEAT } = clock;
  const VEL = 2.17, FOLGA = 0.5, MINIMO = 4; // leitura: 2,17 palavras por segundo e meio segundo de folga; nunca menos de 4 batidas
  const CONTA = 3, SIL = 0.6; // a contagem (3 s, quem assiste responde de cabeça) e o silêncio antes da resposta (o mesmo do mapa-do-som.json)
  const palavras = (n) => (TX[n] || '').trim().split(/\s+/).filter(Boolean).length;
  const seg = (s) => Math.ceil(s / BEAT - 0.05); // segundos em batidas, para cima
  const batidas = (n) => Math.max(MINIMO, seg(palavras(n) / VEL + FOLGA));

  // as cenas, montadas do PREENCHER
  const ROTEIRO = [
    { id: 'caso', tipo: 'caso', linhas: CASO },
    { id: 'pergunta', tipo: 'pergunta', linhas: [PERGUNTA] },
    { id: 'resposta', tipo: 'resposta', linhas: [RESPOSTA] },
  ];
  PORQUE.forEach((ls, i) => ROTEIRO.push({ id: `porque${i + 1}`, tipo: 'porque', k: i + 1, linhas: ls }));
  ROTEIRO.push({ id: 'aps', tipo: 'aps', linhas: APS });
  ROTEIRO.push({ id: 'prevencao', tipo: 'prevencao', linhas: PREVENCAO });
  ROTEIRO.push({ id: 'fecho', tipo: 'fecho', linhas: FECHO });

  const cenas = [], linha = {}, efeitos = [], markers = {}, S = {};
  const OPS = OPCOES.filter((n) => TX[n]);
  let b = 0;
  for (const r of ROTEIRO) {
    const ls = r.linhas.filter((n) => TX[n]);
    if (!ls.length) continue; // parte com todas as frases apagadas sai do vídeo
    let bb = b;
    const itens = ls.map((n, j) => {
      let d = batidas(n);
      if (r.tipo === 'caso' && j === 0) d = Math.max(d, 6); // o gancho: tempo de a pessoa entrar e a ficha abrir
      if (r.tipo === 'pergunta') { // ler a pergunta e as três opções, a contagem e o silêncio
        const pal = palavras(n) + OPS.reduce((s, o) => s + palavras(o), 0);
        d = Math.max(MINIMO, seg(pal / VEL + FOLGA + 0.8)) + seg(CONTA) + seg(SIL);
      }
      if (r.tipo === 'resposta') d = Math.max(d, 6); // os três selos batem, um por vez
      const it = { n, b0: bb, d }; bb += d; return it;
    });
    let total = bb - b + (r.tipo === 'fecho' ? 4 : 0);
    total += (4 - (total % 4)) % 4; // toda cena acaba no fim de um compasso: o corte cai junto com a música
    itens[itens.length - 1].d += total - (bb - b);
    for (const it of itens) { it.t0 = it.b0 * BEAT; it.t1 = (it.b0 + it.d) * BEAT; linha[it.n] = { t0: it.t0, t1: it.t1 }; }
    const c = Object.assign({}, r, { itens, t0: b * BEAT, t1: (b + total) * BEAT });
    cenas.push(c); S[c.id] = [c.t0, c.t1];
    b += total;
  }
  const DURATION = b * BEAT;

  // a contagem: termina SIL segundos antes da resposta (o silêncio do mapa-do-som cai entre o fim da contagem e a resposta)
  const cp = cenas.find((c) => c.tipo === 'pergunta');
  const CONTAGEM = cp ? { t0: cp.t1 - SIL - CONTA, t1: cp.t1 - SIL } : null;
  // as opções ficam na tela da pergunta ao fim da cena (o tempo de leitura delas é o da pergunta)
  if (cp) OPS.forEach((n) => { linha[n] = { t0: cp.t0, t1: cp.t1 }; });
  const REVELA = linha[RESPOSTA] ? linha[RESPOSTA].t0 : Infinity; // quando os selos começam a bater

  // ---------- efeitos sonoros (o que acontece na tela) ----------
  const ef = (t, som, vol = 0.8, pan = 0) => efeitos.push({ t, som, vol, pan });
  for (const c of cenas) {
    if (c.tipo === 'caso') {
      ef(c.t0 + 0.9, 'pop', 0.55, 0.4); // a ficha aparece
      c.itens.forEach((it) => ef(it.t0 + 0.25, 'lapis', 0.45, 0.35)); // as pistas escritas na ficha
    }
    if (c.tipo === 'pergunta') {
      OPS.forEach((_, i) => ef(c.t0 + 0.35 + 0.3 * i, 'pop', 0.65, -0.3 + 0.3 * i)); // os cartões A, B e C
      // o tique-taque da contagem: um a cada meio segundo, alternando o lado do fone e a força
      if (CONTAGEM) for (let k = 0; k < Math.round(CONTA * 2); k++) ef(CONTAGEM.t0 + k * 0.5, 'tique', k % 2 ? 0.7 : 0.95, k % 2 ? 0.35 : -0.35);
    }
    if (c.tipo === 'resposta') {
      ef(c.t0 + 0.02, 'baque', 0.85, 0); // a resposta bate, depois do silêncio
      OPS.forEach((_, i) => ef(c.t0 + 0.55 + 0.4 * i, 'pop', 0.7, -0.4 + 0.4 * i)); // os selos, um por cartão
    }
    if (c.tipo === 'porque' || c.tipo === 'aps' || c.tipo === 'prevencao') {
      ef(c.t0 + 0.05, 'lapis', 0.5);
      c.itens.slice(1).forEach((it) => ef(it.t0 + 0.05, 'tique', 0.45));
    }
    if (c.tipo === 'fecho') {
      OPS.forEach((_, i) => ef(c.t0 + 0.5 + 0.3 * i, 'pop', 0.6, -0.4 + 0.4 * i));
      ef(c.t0 + 0.5 + 0.3 * OPS.length + 0.25, 'certo', 0.75);
    }
  }
  efeitos.sort((p, q) => p.t - q.t);

  // ---------- marcadores: um instante de cada cena e de cada frase seguinte (folha de quadros, capa, qa e cores) ----------
  const mk = (k, t) => { markers[k] = Math.min(DURATION - 0.2, Math.max(0, t)); };
  for (const c of cenas) c.itens.forEach((it, i) => mk(c.id + (i ? 'F' + (i + 1) : ''), it.t0 + Math.min(it.t1 - it.t0 - 0.1, 2.5 * BEAT)));
  if (CONTAGEM) { mk('contagem', CONTAGEM.t0 + 1.2); mk('principal', CONTAGEM.t0 + 1.2); } // o quadro principal: as três opções e o relógio no 2
  if (cp && Number.isFinite(REVELA)) mk('selos', REVELA + 0.55 + 0.4 * OPS.length + 0.4);

  const cenaEm = (t) => { let c = cenas[0]; for (const x of cenas) if (t >= x.t0) c = x; return c; };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, ESTILO, STYLE: ESTILO, cenas, linha, efeitos, cenaEm, TX, ROTEIRO,
    CASO, PERGUNTA, OPCOES: OPS, RESPOSTA, PORQUE, APS, PREVENCAO, FECHO, CONTA, SIL, CONTAGEM, REVELA };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
