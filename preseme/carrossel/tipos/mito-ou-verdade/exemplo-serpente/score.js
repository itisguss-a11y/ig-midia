// PRESEME · carrossel · tipo MITO OU VERDADE · as lâminas, na ordem. Fonte única: o desenho (film-*.js) e o motor
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
  const ESTILO = 'carimbo'; // estilo padrão do tipo: carimbo e gravura (troque na hora com: laminas --estilo giz)

  // AS LÂMINAS, NA ORDEM (a parte que o chat 1 escreve): o id, o molde de lâmina (tipo, em film-3-moldes.js) e os textos
  // do textos.txt que aparecem nela (frases pelo número, palavras do desenho como 'D01'). A lâmina 1 é a capa e leva o
  // título [01] inteiro. Lâmina com todos os textos apagados sai do carrossel. De 5 a 20 lâminas.
  // O desenho de cada lâmina é o PRESEME.DESENHO.cena[id] da peça (film-2-desenhos.js); passos usam DESENHO.passo[id].
  // Em toda lâmina, a primeira palavra D é a etiqueta; na frase, a única D é o veredito (mito, verdade ou depende);
  // no porquê, a segunda D repete o veredito (o selo pequeno) e as outras são os rótulos do desenho.
  const ROTEIRO = [
    { id: 'capa', tipo: 'capa', linhas: [1, 2, 'D01'] },
    { id: 'dado', tipo: 'dado', linhas: [3, 4, 5, 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09'] },
    { id: 'frase1', tipo: 'frase', linhas: [6, 'D10'] },
    { id: 'porque1', tipo: 'porque', linhas: [7, 8, 'D11', 'D10', 'D12', 'D13', 'D14', 'D15', 'D16'] },
    { id: 'frase2', tipo: 'frase', linhas: [9, 'D17'] },
    { id: 'porque2', tipo: 'passos', linhas: [10, 11, 'D18', 'D19', 'D20', 'D21', 'D22'] },
    { id: 'frase3', tipo: 'frase', linhas: [12, 'D23'] },
    { id: 'porque3', tipo: 'porque', linhas: [13, 14, 'D24', 'D23', 'D25'] },
    { id: 'regra', tipo: 'regra', linhas: [15, 16, 17, 'D26', 'D27'] },
  ];

  // o trecho de cada frase que vai no destaque do estilo (marca-texto no claro): { número da frase: 'trecho' }
  const DESTAQUE = { 1: 'Picada de cobra', 3: 'maior incidência', 13: 'cerca de 75%', 15: 'procure atendimento já', 16: 'membro elevado', 17: 'bota de cano alto' };

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
