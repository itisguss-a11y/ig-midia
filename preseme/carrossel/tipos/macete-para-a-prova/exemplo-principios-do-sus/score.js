// PRESEME · carrossel · tipo MACETE PARA A PROVA · as lâminas, na ordem. O carrossel que se salva para decorar: a capa
// com a pergunta que cai, o macete inteiro (as fichas com as letras grandes), uma lâmina por peça do macete (o que
// significa, o desenho que explica e o exemplo da vida real), a pegadinha e o cartão para print.
// Fonte única: o desenho (film-*.js), a conferência do tipo (peca.js) e o motor (laminas, conferir) leem daqui. As
// lâminas saem sozinhas do MACETE: o chat 1 só preenche o bloco PREENCHER (TROQUE) e escreve o textos.txt.
// O que o motor espera deste arquivo (não tire): FPS, FORMAT, DURATION, BEAT, BPM, markers, S, cenas, linha, efeitos, TX,
// CARROSSEL (true), LAMINAS ([{ n, id, tipo, t, linhas }]), ESTILO (o estilo do kit) e DESTAQUE.
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
  const ESTILO = 'giz'; // o estilo desta peça (troque na hora com: laminas --estilo pixel)

  // ===================== PREENCHER (exemplo: "Princípios do SUS: doutrinários ou organizativos?") =====================
  // Números são frases do textos.txt ([01]...); 'Dnn' são palavras do desenho ([D01]...).
  const CAPA = { linhas: [1, 2], etiqueta: 'D01' };
  const RESPOSTA = { linhas: [3, 4], fonte: 'D02' };
  // o macete DIP: as três diretrizes do art. 198 da Constituição, na ordem dos incisos (I, II e III)
  const MACETE = [
    { letra: 'D03', nome: 'D06', define: 5, exemplo: 6, cartao: 13, desenho: 'esferas', palavras: ['D12', 'D13', 'D14'] },
    { letra: 'D04', nome: 'D07', define: 7, exemplo: 8, cartao: 14, desenho: 'prevencao', palavras: ['D15', 'D16'] },
    { letra: 'D05', nome: 'D08', define: 9, exemplo: 10, cartao: 15, desenho: 'conselho', palavras: ['D17', 'D18'] },
  ];
  // a pegadinha: as três diretrizes da Constituição também estão no art. 7º da Lei 8.080, como princípio
  const PEGADINHA = { linhas: [11, 12], selo: 'D09', desenho: 'duasListas', palavras: ['D19', 'D20', 'D21', 'D22', 'D23', 'D24', 'D25', 'D26', 'D27'] };
  const CARTAO = { titulo: 'D10', regra: 16, fonte: 'D11' };
  const DESTAQUE = { 1: 'doutrinários', 4: 'DIP' };
  // ===================== fim do PREENCHER =====================

  const ROTEIRO = [
    { id: 'capa', tipo: 'capa', linhas: [...CAPA.linhas, CAPA.etiqueta] },
    { id: 'macete', tipo: 'macete', linhas: [...RESPOSTA.linhas, RESPOSTA.fonte] },
    ...MACETE.map((m, i) => ({ id: 'p' + (i + 1), tipo: 'peca', peca: i, desenho: m.desenho, linhas: [m.define, m.exemplo, m.letra, m.nome, ...(m.palavras || [])] })),
  ];
  if (PEGADINHA) ROTEIRO.push({ id: 'pegadinha', tipo: 'pegadinha', desenho: PEGADINHA.desenho, linhas: [...PEGADINHA.linhas, PEGADINHA.selo, ...(PEGADINHA.palavras || [])] });
  ROTEIRO.push({ id: 'cartao', tipo: 'cartao', linhas: [...MACETE.map((m) => m.cartao), CARTAO.regra, CARTAO.titulo, CARTAO.fonte] });

  const DUR = 2; // segundos de linha do tempo por lâmina (só para o motor achar cada uma; ninguém assiste)
  const LAMINAS = [], cenas = [], linha = {}, efeitos = [], markers = {}, S = {};
  for (const r of ROTEIRO) {
    const todos = r.linhas || [];
    const vivos = todos.filter((k) => TX[k]);
    if (todos.length && !vivos.length) continue;
    const i = LAMINAS.length, t0 = i * DUR, t1 = t0 + DUR, t = t0 + DUR / 2;
    const frases = vivos.filter((k) => typeof k === 'number');
    const lam = Object.assign({}, r, { n: i + 1, t0, t1, t, linhas: frases, todas: todos, palavras: todos.filter((k) => typeof k !== 'number') });
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

  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, STYLE, ESTILO, CARROSSEL, LAMINAS, DESTAQUE, cenas, linha, efeitos, cenaEm, laminaEm, TX, MACETE, CAPA, RESPOSTA, PEGADINHA, CARTAO };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
