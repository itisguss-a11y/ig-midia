// PRESEME · carrossel · tipo LISTA · as lâminas, na ordem. O "N coisas que..." do perfil, com a medicina preventiva
// por trás: a capa promete a lista com o número grande, cada lâmina do meio é um item (o número grande, o nome, o
// desenho, o porquê e a trilha dos itens), a penúltima junta a lista toda numa lâmina só e a última diz o que fazer
// (o que é de você, o que é da equipe e quando chamar o 192, quando couber).
// Fonte única: o desenho (film-*.js), a conferência do tipo (peca.js) e o motor (laminas, conferir) leem daqui. As
// lâminas saem sozinhas da LISTA: o chat 1 só preenche o bloco PREENCHER (TROQUE) e escreve o textos.txt.
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
  const ESTILO = 'carimbo'; // o estilo padrão da lista: os números carimbados (troque na hora com: laminas --estilo pixel)
  // a lista vai de 2 a 7 itens: com a capa, o resumo e o "o que fazer", são de 5 a 10 lâminas (o conferir trava fora disso)
  const LAMINAS_MIN = 5, LAMINAS_MAX = 10;

  // ===================== PREENCHER (TROQUE: é a parte que o chat 1 escreve) =====================
  // Números são frases do textos.txt ([01]...); 'Dnn' são palavras do desenho ([D01]...).
  // A capa: [o título, que começa pelo número da lista: "5 cuidados no calor forte..."], [a promessa] e a etiqueta. O
  // número sai grande, e é o número de itens da LISTA (o tipo trava se o título disser outro). desenho: o da capa (opcional).
  const CAPA = { linhas: [1, 2], etiqueta: 'D01', desenho: 'troque', palavras: [] };
  // Os itens, de 2 a 7. Cada um ganha uma lâmina, com o número dele grande:
  //   nome     o nome do item ('Dnn'), curto: é o título da lâmina ("Água o dia todo")
  //   porque   a frase do porquê, uma ou duas frases curtas (o número da frase no textos.txt)
  //   desenho  o desenho que mostra o item (PRESEME.DESENHO[desenho], em film-3-desenhos.js); sem desenho, 'troque'
  //   palavras as palavras do desenho dele (opcional: ['D15', 'D16'])
  //   resumo   a linha dele na lâmina-resumo, começando pelo nome ("Água o dia todo: ..."; o tipo confere)
  const LISTA = [
    { nome: 'D04', porque: 3, desenho: 'troque', palavras: [], resumo: 6 },
    { nome: 'D05', porque: 4, desenho: 'troque', palavras: [], resumo: 7 },
  ];
  // A ordem da lista (opcional): sem rótulo (null), os itens têm o mesmo peso; com um rótulo ('Dnn', ex.: "do mais comum
  // ao mais grave"), ele aparece na trilha e no resumo, e a trilha vai do claro ao Coral.
  const ORDEM = null;
  // A lâmina-resumo (a penúltima): [o título], as linhas da LISTA (resumo), [a regra de uma linha, opcional] e a fonte.
  const RESUMO = { titulo: 5, regra: null, fonte: 'D03' };
  // A última, o que fazer: [o título] e de 1 a 3 cartões, cada um com quem faz ('Dnn': "você", "a equipe", "192"), o
  // texto (frase) e o ícone: 'voce' (o aluno), 'equipe' (a UBS), '192' (o celular, com o número do textos.txt no 'quem').
  // O cartão do 192 só entra quando a fonte diz que é emergência. A fonte da lâmina fica no pé.
  const FAZER = { titulo: 8, cartoes: [{ quem: 'D06', texto: 9, icone: 'voce' }, { quem: 'D07', texto: 10, icone: 'equipe' }], fonte: 'D08' };
  // o trecho de cada frase que vai no destaque do estilo (os nomes dos itens já levam o destaque sozinhos)
  const DESTAQUE = { 1: 'TROQUE' };
  // ===================== fim do PREENCHER =====================

  const ROTEIRO = [
    { id: 'capa', tipo: 'capa', desenho: CAPA.desenho, linhas: [...CAPA.linhas, CAPA.etiqueta, ...(CAPA.palavras || [])] },
    ...LISTA.map((it, i) => ({ id: 'item' + (i + 1), tipo: 'item', item: i, desenho: it.desenho, linhas: [...[].concat(it.porque), it.nome, 'D02', ...(it.palavras || [])] })),
    { id: 'resumo', tipo: 'resumo', linhas: [RESUMO.titulo, ...LISTA.map((it) => it.resumo), ...(RESUMO.regra ? [RESUMO.regra] : []), RESUMO.fonte, ...(ORDEM ? [ORDEM] : [])] },
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

  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, STYLE, ESTILO, CARROSSEL, LAMINAS, LAMINAS_MIN, LAMINAS_MAX, DESTAQUE, cenas, linha, efeitos, cenaEm, laminaEm, TX, CAPA, LISTA, ORDEM, RESUMO, FAZER };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
