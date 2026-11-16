// PRESEME · carrossel · tipo MAPA MENTAL · as lâminas, na ordem. Fonte única: o desenho (film-*.js), a conferência do
// tipo (peca.js) e o motor (laminas, conferir) leem daqui. O carrossel não tem som nem vídeo: cada lâmina ganha um
// instante na linha do tempo do motor de desenho, e o comando laminas tira uma foto parada de cada uma.
// O que o motor espera deste arquivo (não tire): FPS, FORMAT, DURATION, BEAT, BPM, markers, S, cenas, linha, efeitos, TX,
// CARROSSEL (true), LAMINAS ([{ n, id, tipo, t, linhas }]), ESTILO (o estilo do kit: lapis, pixel, giz, planta, carimbo,
// chapado), DESTAQUE (o trecho de cada frase no marca-texto) e a faixa de lâminas (LAMINAS_MIN, LAMINAS_MAX).
// Este tipo exporta também MAPA ({ CENTRO, RAMOS, CAPA, INTEIRO, EQUIPE }): o mapa inteiro, de onde saem as lâminas.
//
// O chat 1 só escreve a parte TROQUE: o centro, os ramos (com as folhas) e as frases das lâminas fixas. As lâminas saem
// sozinhas, nesta ordem: a capa, uma lâmina por ramo (na ordem dos RAMOS), o mapa inteiro para print e, por último, o que
// é da equipe.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const TX = node ? require('./textos') : globalThis.TEXTOS;
  const FPS = 30;
  const FORMAT = U.pickFormat('4:5');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const BPM = 60;
  const clock = MU.makeClock({ bpm: BPM, offset: 0 });
  const { T, BEAT } = clock;
  const STYLE = U.pickStyle ? U.pickStyle('paper') : 'paper';
  const CARROSSEL = true;
  const ESTILO = 'giz'; // TROQUE se quiser: o estilo do tipo é o giz na lousa (troque na hora com: laminas --estilo lapis)
  const LAMINAS_MIN = 6, LAMINAS_MAX = 10; // capa + de 4 a 6 ramos + o mapa inteiro + a equipe

  // TROQUE · O CENTRO: o tema, numa palavra D curta (cabe num círculo: até umas 20 letras).
  const CENTRO = { nome: 'D02' };
  // TROQUE · OS RAMOS (de 4 a 6), na ordem das lâminas e da leitura do mapa (o 1 fica em cima à direita e os outros seguem
  // em sentido horário). id: o nome do ramo (curto, sem espaço; não pode ser capa, mapa, equipe nem texto; é também o nome
  // do desenho dele em film-3-desenhos.js, PRESEME.DESENHO.ramo[id]); nome: a palavra D com o nome do ramo ("Como pega");
  // frase: a frase da lâmina do ramo (o que guardar dele); folhas: de 2 a 3 palavras D, até 7 palavras cada, cada uma com
  // trecho de fonte. Ramo sem trecho de fonte não entra no mapa.
  const RAMOS = [
    { id: 'ramo1', nome: 'D03', frase: 3, folhas: ['D04', 'D05'] },
    { id: 'ramo2', nome: 'D06', frase: 4, folhas: ['D07', 'D08'] },
    { id: 'ramo3', nome: 'D09', frase: 5, folhas: ['D10', 'D11'] },
    { id: 'ramo4', nome: 'D12', frase: 6, folhas: ['D13', 'D14'] },
    { id: 'ramo5', nome: 'D15', frase: 7, folhas: ['D16', 'D17'] },
  ];
  // TROQUE · as lâminas fixas. CAPA: o título [01] (a pergunta), a frase de baixo e o rótulo. INTEIRO: o mapa inteiro para
  // print (rótulo e a linha das fontes). EQUIPE: o que é da equipe na atenção primária (rótulo, até 3 frases e as
  // fontes). Apague a frase que não quiser (no textos.txt); a lâmina da EQUIPE pode sair inteira.
  const CAPA = { titulo: 1, sub: 2, rotulo: 'D01' };
  const INTEIRO = { rotulo: 'D18', fonte: 'D19' };
  const EQUIPE = { rotulo: 'D20', frases: [8, 9], fonte: 'D21' };

  // TROQUE · o trecho de cada frase que vai no destaque do estilo (marca-texto no claro): { número da frase: 'trecho' }
  const DESTAQUE = { 1: 'num mapa só', 3: 'o que guardar' };

  // ---------- daqui para baixo é do tipo (não precisa mexer) ----------
  const MAPA = { CENTRO, RAMOS, CAPA, INTEIRO, EQUIPE };
  const ROTEIRO = [
    { id: 'capa', tipo: 'capa', linhas: [CAPA.titulo, CAPA.sub, CAPA.rotulo, CENTRO.nome, ...RAMOS.map((r) => r.nome)] },
    ...RAMOS.map((r) => ({ id: r.id, tipo: 'ramo', ramo: r.id, linhas: [r.frase, r.nome, ...(r.folhas || [])] })),
    { id: 'mapa', tipo: 'mapa', linhas: [INTEIRO.rotulo, INTEIRO.fonte, CENTRO.nome, ...RAMOS.flatMap((r) => [r.nome, ...(r.folhas || [])])] },
    { id: 'equipe', tipo: 'equipe', linhas: [...EQUIPE.frases, EQUIPE.rotulo, EQUIPE.fonte] },
  ];

  const DUR = 2; // segundos de linha do tempo por lâmina (só para o motor achar cada uma; ninguém assiste)
  const LAMINAS = [], cenas = [], linha = {}, efeitos = [], markers = {}, S = {};
  for (const r of ROTEIRO) {
    const todos = (r.linhas || []).filter((k) => k !== undefined && k !== null);
    const vivos = todos.filter((k) => TX[k]);
    if (todos.length && !vivos.length) continue;
    const i = LAMINAS.length, t0 = i * DUR, t1 = t0 + DUR, t = t0 + DUR / 2;
    const frases = vivos.filter((k) => typeof k === 'number');
    const lam = Object.assign({}, r, { n: i + 1, t0, t1, t, linhas: frases, palavras: vivos.filter((k) => typeof k !== 'number') });
    LAMINAS.push(lam);
    const itens = frases.length ? frases.map((n) => ({ n, t0, t1 })) : [{ n: null, t0, t1 }];
    for (const it of itens) if (it.n) linha[it.n] = it;
    cenas.push({ id: r.id, tipo: r.tipo, t0, t1, itens, linhas: frases });
    S[r.id] = [t0, t1];
    markers['l' + String(i + 1).padStart(2, '0')] = t;
    if (!/^l\d+$/.test(r.id)) markers[r.id] = t;
  }
  const DURATION = Math.max(1, LAMINAS.length) * DUR;

  const laminaEm = (t) => { let l = LAMINAS[0]; for (const x of LAMINAS) if (t >= x.t0) l = x; return l; };
  const cenaEm = (t) => { let c = cenas[0]; for (const x of cenas) if (t >= x.t0) c = x; return c; };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, STYLE, ESTILO, CARROSSEL, LAMINAS, LAMINAS_MIN, LAMINAS_MAX, DESTAQUE, MAPA, cenas, linha, efeitos, cenaEm, laminaEm, TX };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
