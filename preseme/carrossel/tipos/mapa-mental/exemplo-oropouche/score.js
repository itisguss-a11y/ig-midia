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
  const ESTILO = 'giz'; // o estilo do tipo: giz na lousa (o resumo no quadro)
  const LAMINAS_MIN = 6, LAMINAS_MAX = 10; // capa + de 4 a 6 ramos + o mapa inteiro + a equipe

  // O CENTRO: a febre do Oropouche
  const CENTRO = { nome: 'D02' };
  // OS RAMOS: o que é, como pega, o que se vê, como se confirma, como se trata e como se previne (sentido horário, a
  // partir de cima à direita). Cada folha tem trecho de fonte na tabela de afirmações.
  const RAMOS = [
    { id: 'oquee', nome: 'D03', frase: 3, folhas: ['D04', 'D05'] },
    { id: 'pega', nome: 'D06', frase: 4, folhas: ['D07', 'D08', 'D09'] },
    { id: 've', nome: 'D10', frase: 5, folhas: ['D11', 'D12', 'D13'] },
    { id: 'confirma', nome: 'D14', frase: 6, folhas: ['D15', 'D16', 'D17'] },
    { id: 'trata', nome: 'D18', frase: 7, folhas: ['D19', 'D20', 'D21'] },
    { id: 'previne', nome: 'D22', frase: 8, folhas: ['D23', 'D24', 'D25'] },
  ];
  const CAPA = { titulo: 1, sub: 2, rotulo: 'D01' };
  const INTEIRO = { rotulo: 'D26', fonte: 'D27' };
  const EQUIPE = { rotulo: 'D28', frases: [9, 10], fonte: 'D29' };

  const DESTAQUE = { 1: 'como se evita', 2: '138 casos', 3: 'um inseto passa', 4: 'o maruim', 5: 'Parece dengue', 6: 'o exame', 7: 'repouso', 8: 'tela de malha fina', 9: 'de imediato', 10: 'podem voltar' };

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
