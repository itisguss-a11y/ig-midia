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
  const ESTILO = 'giz'; // o estilo padrão do macete: a lousa do cursinho (troque na hora com: laminas --estilo pixel)

  // ===================== PREENCHER (TROQUE: é a parte que o chat 1 escreve) =====================
  // Números são frases do textos.txt ([01]...); 'Dnn' são palavras do desenho ([D01]...).
  // A capa: [a pergunta que cai, com "?"], [a promessa] e a etiqueta. As fichas do macete aparecem sozinhas embaixo.
  const CAPA = { linhas: [1, 2], etiqueta: 'D01' };
  // O macete inteiro (lâmina 2): [a resposta curta à pergunta da capa], [a frase que gruda] e a fonte, curta.
  const RESPOSTA = { linhas: [3, 4], fonte: 'D02' };
  // As peças do macete, de 2 a 7, na ordem do macete. Cada uma ganha uma lâmina:
  //   letra    a letra ou a sigla grande da ficha ('Dnn', até 3 letras)
  //   nome     a palavra inteira ('Dnn'); a palavra que começa com a letra vai no destaque
  //   define   a frase do que significa, em palavra simples
  //   exemplo  a frase da vida real ("Na UBS: ..."); sem ela, a lâmina fica sem o pé
  //   cartao   a linha curta do cartão para print, começando pelo nome ("Nome: ...")
  //   desenho  o desenho que explica (PRESEME.DESENHO[desenho], em film-3-desenhos.js); sem desenho, 'troque'
  //   palavras as palavras do desenho dele (opcional: ['D12', 'D13'])
  const MACETE = [
    { letra: 'D03', nome: 'D05', define: 5, exemplo: 6, cartao: 11, desenho: 'troque' },
    { letra: 'D04', nome: 'D06', define: 7, exemplo: 8, cartao: 12, desenho: 'troque' },
  ];
  // A pegadinha: [o que a prova confunde com o quê], [o detalhe que desfaz], o selo ('Dnn') e as palavras do desenho que
  // compara as duas coisas. Sem pegadinha de fonte, apague a linha (PEGADINHA = null): o tipo avisa, não trava.
  const PEGADINHA = { linhas: [9, 10], selo: 'D07', desenho: 'troque', palavras: [] };
  // O cartão para print (a última): o título ('Dnn'), a regra de uma linha (frase) e a fonte ('Dnn'). As linhas do meio
  // vêm do MACETE (cartao), uma por peça, na mesma ordem.
  const CARTAO = { titulo: 'D08', regra: 13, fonte: 'D09' };
  // o trecho de cada frase que vai no destaque do estilo (os nomes já levam o destaque sozinhos)
  const DESTAQUE = { 1: 'TROQUE', 4: 'TROQUE' };
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
