// PRESEME · carrossel · série Notícia comentada · as lâminas, na ordem (molde fixo da série: a notícia é o gancho e
// a peça ensina a medicina preventiva por trás dela). Fonte única: o desenho (film-*.js) e o motor
// (laminas, conferir) leem daqui. O carrossel não tem som nem vídeo: cada lâmina ganha um instante na linha do tempo do
// motor de desenho, e o comando laminas tira uma foto parada de cada uma.
// O que o motor espera deste arquivo (não tire): FPS, FORMAT, DURATION, BEAT, BPM, markers, S, cenas, linha, efeitos, TX,
// CARROSSEL (true), LAMINAS ([{ n, id, tipo, t, linhas }]), ESTILO (o estilo do kit: lapis, pixel, giz, planta, carimbo,
// chapado) e DESTAQUE (o trecho de cada frase no marca-texto).
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
  const ESTILO = 'chapado'; // o estilo do kit para o carrossel inteiro (troque na hora com: laminas --estilo giz)

  // AS LÂMINAS, NA ORDEM (a parte que o chat 1 escreve): o id, o molde de lâmina (tipo, em film-3-moldes.js) e os textos
  // do textos.txt que aparecem nela (frases pelo número, palavras do desenho como 'D01'). A lâmina 1 é a capa e leva o
  // título [01] inteiro. Lâmina com todos os textos apagados sai do carrossel. De 5 a 20 lâminas.
  const ROTEIRO = [
    { id: 'capa', tipo: 'capa', linhas: [1, 2, 'D21'] },
    { id: 'noticia', tipo: 'noticia', linhas: [3, 4, 5, 'D22', 'D01', 'D29'] },
    { id: 'leve', tipo: 'explica', linhas: [6, 7, 'D23'] },
    { id: 'sinais', tipo: 'colunas', linhas: [8, 9, 'D24', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'D11'] },
    { id: 'grave', tipo: 'alerta', linhas: [10, 'D25', 'D12', 'D13', 'D14'] },
    { id: 'cuidado', tipo: 'passos', linhas: [11, 12, 'D26', 'D15', 'D16'] },
    { id: 'prevencao', tipo: 'prevencao', linhas: [13, 14, 15, 'D27', 'D17', 'D18', 'D19'] },
    { id: 'resumo', tipo: 'resumo', linhas: [16, 17, 18, 'D28', 'D20'] },
  ];
  // Os tipos de lâmina do molde (film-3-moldes.js), para a próxima notícia. Em toda lâmina, a primeira palavra (D) é a
  // etiqueta dela (na capa, o nome da série). capa: [título], [promessa]. noticia: 3 frases (o fato, o gancho regional,
  // o contexto) + D fonte + D legenda do mapa (só o molde B usa). explica: 2 frases (o conceito, a definição). colunas: 2 frases (o exemplo que é e o que não
  // é) + as palavras das duas colunas (metade para cada uma; a primeira de cada metade é o nome da coluna). alerta:
  // 1 frase + até 4 sinais. passos: 2 frases + 2 palavras (a linha dos dias: o primeiro trecho e o trecho todo).
  // prevencao: 3 frases + até 3 grupos. resumo: até 3 frases (cada uma começa pela palavra-chave) + D fontes.

  // o trecho de cada frase que vai no destaque do estilo (marca-texto no claro, Marca-texto na letra no cartão escuro)
  const DESTAQUE = { 1: 'Roraima', 4: 'Roraima', 6: 'síndrome gripal', 10: 'sinal de agravamento', 13: 'principal forma', 16: 'Leve,', 17: 'Grave,', 18: 'Prevenção,' };

  const DUR = 2; // segundos de linha do tempo por lâmina (só para o motor achar cada uma; ninguém assiste)
  const LAMINAS = [], cenas = [], linha = {}, efeitos = [], markers = {}, S = {};
  for (const r of ROTEIRO) {
    const todos = r.linhas || [];
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
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, STYLE, ESTILO, CARROSSEL, LAMINAS, DESTAQUE, cenas, linha, efeitos, cenaEm, laminaEm, TX };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
