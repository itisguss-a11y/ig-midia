// PRESEME · carrossel · tipo TABELA COMPARATIVA · as lâminas, na ordem. Fonte única: o desenho (film-*.js), a conferência
// do tipo (peca.js) e o motor (laminas, conferir) leem daqui. O carrossel não tem som nem vídeo: cada lâmina ganha um
// instante na linha do tempo do motor de desenho, e o comando laminas tira uma foto parada de cada uma.
// O que o motor espera deste arquivo (não tire): FPS, FORMAT, DURATION, BEAT, BPM, markers, S, cenas, linha, efeitos, TX,
// CARROSSEL (true), LAMINAS ([{ n, id, tipo, t, linhas }]), ESTILO (o estilo do kit: lapis, pixel, giz, planta, carimbo,
// chapado), DESTAQUE (o trecho de cada frase no marca-texto) e a faixa de lâminas (LAMINAS_MIN, LAMINAS_MAX).
// Este tipo exporta também TABELA ({ COLUNAS, LINHAS }): a grade inteira, de onde saem as lâminas.
//
// O chat 1 só escreve a parte TROQUE: as colunas, as linhas (com as células) e as frases das lâminas fixas. As lâminas
// saem sozinhas, nesta ordem: a capa, uma lâmina por linha da tabela (na ordem das LINHAS), a tabela inteira para print
// e, por último, o que as colunas têm em comum e o que é da equipe.
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
  const ESTILO = 'planta'; // TROQUE se quiser: o estilo do tipo é a planta técnica (troque na hora com: laminas --estilo chapado)
  const LAMINAS_MIN = 6, LAMINAS_MAX = 10; // capa + de 4 a 6 linhas + a tabela inteira + o fecho

  // TROQUE · AS COLUNAS (de 3 a 4): as coisas parecidas que a tabela compara. id: o nome do desenho da coluna em
  // film-3-desenhos.js (PRESEME.DESENHO.coluna[id]); nome: a palavra D com o nome que vai no alto da coluna.
  const COLUNAS = [
    { id: 'a', nome: 'D02' },
    { id: 'b', nome: 'D03' },
    { id: 'c', nome: 'D04' },
  ];
  // TROQUE · AS LINHAS (de 4 a 6), na ordem das lâminas. id: o nome da linha (curto, sem espaço; não pode ser capa,
  // tabela, comum nem texto); nome: a palavra D com o nome da linha (a pergunta que ela responde: "Quem passa"); frase: a
  // frase da lâmina (o que reparar na linha); celulas: uma palavra D por coluna, na ordem das COLUNAS, até 8 palavras
  // cada. Célula sem trecho de fonte: escreva "—" no textos.txt (a conferência avisa; a peça de verdade acha a fonte ou
  // tira a linha). O desenho de cada célula é PRESEME.DESENHO.celula[id da linha][coluna]; sem ele, vale o da coluna.
  const LINHAS = [
    { id: 'linha1', nome: 'D05', frase: 3, celulas: ['D06', 'D07', 'D08'] },
    { id: 'linha2', nome: 'D09', frase: 4, celulas: ['D10', 'D11', 'D12'] },
    { id: 'linha3', nome: 'D13', frase: 5, celulas: ['D14', 'D15', 'D16'] },
    { id: 'linha4', nome: 'D17', frase: 6, celulas: ['D18', 'D19', 'D20'] },
    { id: 'linha5', nome: 'D21', frase: 7, celulas: ['D22', 'D23', 'D24'] },
  ];
  // TROQUE · as lâminas fixas. CAPA: o título [01] (a pergunta), a frase de baixo e o rótulo. INTEIRA: a tabela inteira
  // para print (rótulo e a linha das fontes). FECHO: o que as colunas têm em comum (rótulo e até 2 frases) e o que é da
  // equipe (rótulo e até 2 frases), com as fontes. Apague a frase que não quiser (no textos.txt); o FECHO pode sair inteiro.
  const CAPA = { titulo: 1, sub: 2, rotulo: 'D01' };
  const INTEIRA = { rotulo: 'D25', fonte: 'D26' };
  const FECHO = { rotulo: 'D27', frases: [8, 9], equipe: 'D28', frasesEquipe: [10, 11], fonte: 'D29' };

  // TROQUE · o trecho de cada frase que vai no destaque do estilo (marca-texto no claro): { número da frase: 'trecho' }
  const DESTAQUE = { 1: 'o que muda', 3: 'o que reparar' };

  // ---------- daqui para baixo é do tipo (não precisa mexer) ----------
  const TABELA = { COLUNAS, LINHAS, CAPA, INTEIRA, FECHO };
  const ROTEIRO = [
    { id: 'capa', tipo: 'capa', linhas: [CAPA.titulo, CAPA.sub, CAPA.rotulo, ...COLUNAS.map((c) => c.nome)] },
    ...LINHAS.map((l) => ({ id: l.id, tipo: 'linha', linha: l.id, linhas: [l.frase, l.nome, ...l.celulas] })),
    { id: 'tabela', tipo: 'tabela', linhas: [INTEIRA.rotulo, INTEIRA.fonte, ...LINHAS.flatMap((l) => [l.nome, ...l.celulas])] },
    { id: 'comum', tipo: 'comum', linhas: [...FECHO.frases, ...FECHO.frasesEquipe, FECHO.rotulo, FECHO.equipe, FECHO.fonte] },
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
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, STYLE, ESTILO, CARROSSEL, LAMINAS, LAMINAS_MIN, LAMINAS_MAX, DESTAQUE, TABELA, cenas, linha, efeitos, cenaEm, laminaEm, TX };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
