// PRESEME · carrossel · tipo POR IDADE · as lâminas, na ordem. O que a atenção primária oferece em cada fase da vida,
// numa régua de idades que atravessa as lâminas: a capa traz a pergunta e a régua inteira pequena; cada lâmina do meio
// é uma faixa de idade (a pessoa daquela idade, o que a UBS faz ou oferece ali e o porquê numa frase); a penúltima é a
// régua inteira com tudo, para print; a última diz o que o aluno faz na visita (e o que é da equipe).
// Fonte única: o desenho (film-*.js), a conferência do tipo (peca.js) e o motor (laminas, conferir) leem daqui. As
// lâminas saem sozinhas das FAIXAS: o chat 1 só preenche o bloco PREENCHER (TROQUE) e escreve o textos.txt.
// O que o motor espera deste arquivo (não tire): FPS, FORMAT, DURATION, BEAT, BPM, markers, S, cenas, linha, efeitos, TX,
// CARROSSEL (true), LAMINAS ([{ n, id, tipo, t, linhas }]), ESTILO (o estilo do kit), DESTAQUE, LAMINAS_MIN e LAMINAS_MAX.
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
  const ESTILO = 'lapis'; // o estilo padrão do tipo (troque na hora com: laminas --estilo carimbo)
  // de 3 a 7 faixas: com a capa, a régua inteira e o "o que fazer", são de 6 a 10 lâminas (o conferir trava fora disso)
  const LAMINAS_MIN = 6, LAMINAS_MAX = 10;

  // ===================== PREENCHER (exemplo: rastreamento de câncer na mulher, por idade) =====================
  // Números são frases do textos.txt ([01]...); 'Dnn' são palavras do desenho ([D01]...).
  const CAPA = { linhas: [1, 2], etiqueta: 'D01' };
  // as cinco faixas: o teste do colo do útero (DNA-HPV, de 25 a 64 anos) e a mamografia (sob demanda de 40 a 49, de rotina
  // de 50 a 74, caso a caso depois); 'nao' é o que não entra na rotina daquela idade
  const DNA = { nome: 'D09', quando: 'D10', icone: 'teste' };
  const FAIXAS = [
    { de: 25, ate: 39, rotulo: 'D04', pessoa: { quem: 'moradora', penteado: 'rabo', roupa: 'camiseta', corRoupa: 'coral', pele: 'clara' }, oferta: [DNA, { nome: 'D11', quando: 'D12', icone: 'mamografia', marca: 'nao' }], porque: 3 },
    { de: 40, ate: 49, rotulo: 'D05', pessoa: { quem: 'moradora', penteado: 'cacheado', oculos: true, roupa: 'camisa', corRoupa: 'folha', pele: 'escura' }, oferta: [DNA, { nome: 'D11', quando: 'D13', icone: 'mamografia' }], porque: 4 },
    { de: 50, ate: 64, rotulo: 'D06', pessoa: { quem: 'moradora', penteado: 'curto', oculos: 'quadrado', roupa: 'vestido', corRoupa: 'marca', pele: 'media' }, oferta: [DNA, { nome: 'D11', quando: 'D14', icone: 'mamografia' }], porque: 5 },
    { de: 65, ate: 74, rotulo: 'D07', pessoa: { quem: 'idosa', penteado: 'coque', roupa: 'camisa', corRoupa: 'salvia' }, oferta: [{ nome: 'D09', quando: 'D15', icone: 'teste', marca: 'nao' }, { nome: 'D11', quando: 'D14', icone: 'mamografia' }], porque: 6 },
    { de: 75, ate: null, rotulo: 'D08', pessoa: { quem: 'idosa', oculos: true, corpo: 'magro', roupa: 'vestido', corRoupa: 'coral', pele: 'escura' }, oferta: [{ nome: 'D11', quando: 'D16', icone: 'mamografia' }], porque: 7 },
  ];
  const REGUA = { titulo: 8, regra: 9, fonte: 'D02' };
  const FAZER = { titulo: 10, cartoes: [{ quem: 'D17', texto: 11, icone: 'voce' }, { quem: 'D18', texto: 12, icone: 'equipe' }, { quem: 'D19', texto: 13, icone: 'sinal' }], fonte: 'D02' };
  const DESTAQUE = { 1: 'o que muda com a idade', 3: 'mais preciso', 4: 'decidida com a equipe', 5: 'quase 6 em cada 10', 6: 'desde 2025, vai até os 74', 7: 'a decisão pesa', 9: 'com sintoma' };
  // ===================== fim do PREENCHER =====================

  const ROTEIRO = [
    { id: 'capa', tipo: 'capa', linhas: [...CAPA.linhas, CAPA.etiqueta, ...FAIXAS.map((f) => f.rotulo)] },
    ...FAIXAS.map((f, i) => ({ id: 'faixa' + (i + 1), tipo: 'faixa', faixa: i, linhas: [...[].concat(f.porque), f.rotulo, 'D03', ...f.oferta.flatMap((o) => [o.nome, o.quando])] })),
    { id: 'regua', tipo: 'regua', linhas: [REGUA.titulo, ...(REGUA.regra ? [REGUA.regra] : []), REGUA.fonte, ...FAIXAS.flatMap((f) => [f.rotulo, ...f.oferta.flatMap((o) => [o.nome, o.quando])])] },
    { id: 'fazer', tipo: 'fazer', linhas: [FAZER.titulo, ...FAZER.cartoes.map((c) => c.texto), ...FAZER.cartoes.map((c) => c.quem), FAZER.fonte] },
  ];

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

  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, STYLE, ESTILO, CARROSSEL, LAMINAS, LAMINAS_MIN, LAMINAS_MAX, DESTAQUE, cenas, linha, efeitos, cenaEm, laminaEm, TX, CAPA, FAIXAS, REGUA, FAZER };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
