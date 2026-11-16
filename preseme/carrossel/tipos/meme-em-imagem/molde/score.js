// PRESEME · carrossel · tipo MEME EM IMAGEM · os painéis e a lição. Fonte única: o desenho (film-*.js) e o motor
// (laminas, conferir) leem daqui. O carrossel não tem som nem vídeo: cada lâmina ganha um instante na linha do tempo do
// motor de desenho, e o comando laminas tira uma foto parada de cada uma.
// O que o motor espera deste arquivo (não tire): FPS, FORMAT, DURATION, BEAT, BPM, markers, S, cenas, linha, efeitos, TX,
// CARROSSEL (true), LAMINAS ([{ n, id, tipo, t, linhas }]), ESTILO (lapis, pixel, giz, planta, carimbo, chapado),
// DESTAQUE e, deste tipo, LAMINAS_MIN e LAMINAS_MAX (o meme vai de 1 a 5 lâminas: com o motor.diff do tipo, o conferir lê).
// O meme tem os quatro tempos do primo em vídeo (preseme/reel/tipos/meme-em-video): preparação (a situação), virada (a
// piada), fecho (a volta à situação, opcional) e a lição (o que fica de medicina preventiva, obrigatória).
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
  const LAMINAS_MIN = 1, LAMINAS_MAX = 5;

  // ======================== PREENCHER (a parte que o chat 1 escreve) ========================
  const ESTILO = 'lapis'; // estilo padrão do tipo: lápis no papel, a cara de quadrinho (troque na hora com: laminas --estilo giz)
  // o arranjo: 'quadrinho' (os painéis numa lâmina só, em grade, e a lição na faixa de baixo: um post de uma imagem, o
  // que se encaminha no grupo) ou 'laminas' (um painel por lâmina, a piada no deslize, e a lição no cartão da última)
  const ARRANJO = 'quadrinho';
  // só no quadrinho: as linhas de painéis, de cima para baixo, pelo número do painel. Sem ela: 1 → [[1]], 2 → [[1, 2]]
  // (lado a lado), 3 → [[1, 2], [3]], 4 → [[1, 2], [3, 4]]. Ex.: três painéis em pé, [[1], [2], [3]]
  const GRADE = null;
  // os painéis, na ordem (de 1 a 4). tempo: 'preparacao' (1 ou 2, antes da virada), 'virada' (1, a piada) ou 'fecho'
  // (0 ou 1, depois). textos: as frases do textos.txt, cada uma com o jeito (como): 'legenda' (a caixa do narrador, no alto
  // à esquerda), 'fala' (o balão de quem fala), 'pensa' (o balão de pensamento) ou 'grito' (o balão de pontas, sem
  // rabinho); fala e pensa levam quem (o id da pessoa que o palco devolve em cabecas). rotulos: as palavras D que o
  // desenho põe dentro da cena (a folha da prova, a placa). O desenho de cada painel vem de film-2-desenhos.js.
  const PAINEIS = [
    { id: 'p1', tempo: 'preparacao', textos: [{ n: 1, como: 'legenda' }] },
    { id: 'p2', tempo: 'preparacao', textos: [{ n: 2, como: 'fala', quem: 'outra' }] },
    { id: 'p3', tempo: 'virada', textos: [{ n: 3, como: 'fala', quem: 'calouro' }] },
  ];
  // a lição (obrigatória): as frases (até 2 no quadrinho, até 3 na sequência), a etiqueta (D, o "O QUE FICA") e a fonte (D)
  const LICAO = { linhas: [4, 5], etiqueta: 'D01', fonte: 'D02' };
  // o trecho de cada frase que vai no destaque do estilo: { número da frase: 'trecho' }
  const DESTAQUE = { 4: 'o que fica' };
  // ===========================================================================================

  // as lâminas: no quadrinho, uma (os painéis e a faixa da lição); na sequência, uma por painel e o cartão da lição
  const textosDe = (p) => (p.textos || []).map((x) => x.n).concat(p.rotulos || []);
  const licao = { linhas: LICAO.linhas || [], etiqueta: LICAO.etiqueta, fonte: LICAO.fonte };
  const doLicao = licao.linhas.concat([licao.etiqueta, licao.fonte].filter(Boolean));
  const ROTEIRO = ARRANJO === 'laminas'
    ? PAINEIS.map((p) => ({ id: p.id, tipo: 'painel', painel: p, linhas: textosDe(p), sempre: true })).concat([{ id: 'licao', tipo: 'licao', licao, linhas: doLicao }])
    : [{ id: 'quadrinho', tipo: 'quadrinho', paineis: PAINEIS, licao, linhas: PAINEIS.flatMap(textosDe).concat(doLicao), sempre: true }];

  const DUR = 2; // segundos de linha do tempo por lâmina (só para o motor achar cada uma; ninguém assiste)
  const LAMINAS = [], cenas = [], linha = {}, efeitos = [], markers = {}, S = {};
  for (const r of ROTEIRO) {
    const todos = r.linhas || [];
    const vivos = todos.filter((k) => TX[k]);
    if (todos.length && !vivos.length && !r.sempre) continue; // painel só de imagem fica; lição sem texto sai
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
    // o quadro principal (a folha dos três estilos): a lâmina da virada; no quadrinho, a lâmina única
    if (r.tipo === 'quadrinho' || (r.painel && r.painel.tempo === 'virada')) markers.principal = t;
  }
  const DURATION = Math.max(1, LAMINAS.length) * DUR;

  const laminaEm = (t) => { let l = LAMINAS[0]; for (const x of LAMINAS) if (t >= x.t0) l = x; return l; };
  const cenaEm = (t) => { let c = cenas[0]; for (const x of cenas) if (t >= x.t0) c = x; return c; };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, STYLE, ESTILO, CARROSSEL, LAMINAS, LAMINAS_MIN, LAMINAS_MAX, ARRANJO, GRADE, PAINEIS, LICAO, DESTAQUE, cenas, linha, efeitos, cenaEm, laminaEm, TX };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
