// PRESEME · carrossel · tipo CASO, ARRASTE PARA A RESPOSTA · as lâminas, na ordem. Fonte única: o desenho (film-*.js) e
// o motor (laminas, conferir) leem daqui. O carrossel não tem som nem vídeo: cada lâmina ganha um instante na linha do
// tempo do motor de desenho, e o comando laminas tira uma foto parada de cada uma.
// O que o motor espera deste arquivo (não tire): FPS, FORMAT, DURATION, BEAT, BPM, markers, S, cenas, linha, efeitos, TX,
// CARROSSEL (true), LAMINAS ([{ n, id, tipo, t, linhas }]), ESTILO (o estilo do kit: lapis, pixel, giz, planta, carimbo,
// chapado) e DESTAQUE (o trecho de cada frase no marca-texto). Este tipo pede também OPCOES (as frases das opções).
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
  const ESTILO = 'chapado'; // TROQUE se quiser: o estilo do tipo é o chapado (troque na hora com: laminas --estilo giz)

  // TROQUE · AS LÂMINAS, NA ORDEM (a parte que o chat 1 escreve). A espinha do tipo: caso (a capa), pergunta, resposta,
  // um porquê por opção (opcao: 'A', 'B'...; mais de uma lâmina por opção, se precisar), o dado de Roraima (só com fonte
  // oficial; sem dado, apague a lâmina), a atenção primária e a prevenção (tipo lista) e o resumo. De 7 a 10 lâminas.
  // Em toda lâmina, a primeira palavra D é o rótulo. Na capa, as outras D são as pistas da ficha; na pergunta, a segunda
  // D é o "arraste"; no dado, D fonte e os pares D nome, D número; na lista, os itens; no resumo, D fontes.
  const ROTEIRO = [
    { id: 'caso', tipo: 'caso', linhas: [1, 2, 'D01', 'D02', 'D03', 'D04', 'D05'] },
    { id: 'pergunta', tipo: 'pergunta', linhas: [3, 4, 5, 6, 'D01', 'D06'] },
    { id: 'resposta', tipo: 'resposta', linhas: [7, 8, 'D07'] },
    { id: 'porqueA', tipo: 'porque', opcao: 'A', linhas: [9, 10, 'D08', 'D09', 'D10'] },
    { id: 'porqueB', tipo: 'porque', opcao: 'B', linhas: [11, 12, 'D11', 'D12', 'D13'] },
    { id: 'porqueC', tipo: 'porque', opcao: 'C', linhas: [13, 14, 'D14', 'D15'] },
    { id: 'dado', tipo: 'dado', linhas: [15, 16, 'D16', 'D17', 'D18', 'D19', 'D20', 'D21', 'D22', 'D23', 'D24', 'D25', 'D26', 'D27', 'D28', 'D29'] },
    { id: 'aps', tipo: 'lista', linhas: [17, 'D30', 'D31', 'D32', 'D33', 'D34'] },
    { id: 'prevencao', tipo: 'lista', linhas: [18, 'D35', 'D36', 'D37', 'D38', 'D39'] },
    { id: 'resumo', tipo: 'resumo', linhas: [19, 20, 21, 'D40', 'D41'] },
  ];
  // TROQUE · as frases das opções, na ordem A, B, C (de 2 a 4). Ficam na lâmina da pergunta e voltam na da resposta
  const OPCOES = [4, 5, 6];

  // TROQUE · o trecho de cada frase que vai no destaque do estilo (marca-texto no claro): { número da frase: 'trecho' }
  const DESTAQUE = { 1: 'não fecha', 7: 'pede exame', 8: 'leishmaniose tegumentar', 9: 'não passa de pessoa para pessoa', 10: 'flebotomíneo', 11: 'redonda ou oval', 13: 'quem diz é o exame', 15: '2.310 casos', 18: 'o pôr do sol e o anoitecer', 19: 'exame na UBS', 20: 'o inseto', 21: 'roupa comprida' };

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
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, STYLE, ESTILO, CARROSSEL, LAMINAS, DESTAQUE, OPCOES, cenas, linha, efeitos, cenaEm, laminaEm, TX };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
