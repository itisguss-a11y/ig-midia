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

  // ===================== PREENCHER (TROQUE: é a parte que o chat 1 escreve) =====================
  // Números são frases do textos.txt ([01]...); 'Dnn' são palavras do desenho ([D01]...).
  // A capa: [a pergunta], [a promessa] e a etiqueta; embaixo, a régua inteira pequena com a pessoa de cada faixa.
  const CAPA = { linhas: [1, 2], etiqueta: 'D01' };
  // As faixas de idade, da menor para a maior, sem se sobrepor (de 3 a 7). Cada uma ganha uma lâmina:
  //   de, ate   a idade em anos onde a faixa começa e termina (ate: null = "ou mais"); o rótulo tem de dizer o mesmo
  //   rotulo    o nome da faixa na tela ('Dnn': "25 a 39 anos", "75 anos ou mais")
  //   pessoa    quem aparece (B.pessoa da biblioteca: { quem: 'moradora', penteado, roupa, oculos... }; a idade sai da faixa)
  //   oferta    o que a UBS faz ou oferece ali, de 1 a 3 cartões: { nome: 'Dnn' (o que é: "Teste de DNA-HPV"), quando:
  //             'Dnn' (de quanto em quanto tempo ou em que caso: "a cada 5 anos"), icone: o desenho do cartão
  //             (PRESEME.ICONE[icone]: os do kit são 'exame', 'vacina', 'consulta', 'conversa', 'calendario',
  //             'nenhum'; os da peça ficam em film-3-desenhos.js), marca: 'nao' (opcional: o que NÃO entra na rotina) }
  //   porque    a frase do porquê, uma ou duas frases curtas (o número da frase no textos.txt)
  const FAIXAS = [
    { de: 20, ate: 39, rotulo: 'D04', pessoa: { quem: 'moradora' }, oferta: [{ nome: 'D07', quando: 'D08', icone: 'exame' }], porque: 3 },
    { de: 40, ate: 59, rotulo: 'D05', pessoa: { quem: 'moradora', oculos: true }, oferta: [{ nome: 'D07', quando: 'D08', icone: 'exame' }], porque: 4 },
    { de: 60, ate: null, rotulo: 'D06', pessoa: { quem: 'idosa' }, oferta: [{ nome: 'D09', quando: 'D10', icone: 'vacina' }], porque: 5 },
  ];
  // A régua inteira (a penúltima, para print): [o título], a régua com as faixas e o que se oferece em cada uma (sai das
  // FAIXAS: não se escreve de novo), [a regra de uma linha, opcional] e a fonte.
  const REGUA = { titulo: 6, regra: null, fonte: 'D02' };
  // A última, o que fazer na visita: [o título] e de 1 a 3 cartões, cada um com quem faz ('Dnn': "você", "a equipe"), o
  // texto (frase) e o ícone: 'voce' (o aluno), 'equipe' (a UBS), 'sinal' (o que não espera a idade), '192' (o celular).
  const FAZER = { titulo: 7, cartoes: [{ quem: 'D11', texto: 8, icone: 'voce' }, { quem: 'D12', texto: 9, icone: 'equipe' }], fonte: 'D02' };
  // o trecho de cada frase que vai no destaque do estilo
  const DESTAQUE = { 1: 'TROQUE' };
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
