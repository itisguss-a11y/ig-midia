// PRESEME · carrossel · tipo GUIA DE BOLSO · as lâminas, na ordem. O guia de bolso é o carrossel para salvar e consultar
// na hora: um procedimento da visita com o ACS, passo a passo, cada passo com o desenho do gesto e o porquê, o erro
// comum, o que é da equipe, quando chamar o 192 e, por último, o cartão-resumo para print.
// Fonte única: o desenho (film-*.js) e o motor (laminas, conferir) leem daqui. Cada lâmina ganha um instante na linha do
// tempo do motor de desenho, e o comando laminas tira uma foto parada de cada uma.
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
  const ESTILO = 'planta'; // o estilo padrão do guia de bolso (troque na hora com: laminas --estilo giz)

  // AS LÂMINAS, NA ORDEM (TROQUE: é a parte que o chat 1 escreve). Cada uma: o id, o tipo de lâmina (film-2-moldes.js),
  // o desenho que vai nela (PRESEME.DESENHO[desenho]: as cenas prontas do guia, visita, espera, equipe, telefone e
  // troque, ficam em film-2-moldes.js; as do assunto, em film-3-desenhos.js) e os textos do textos.txt (frases pelo
  // número, palavras do desenho como 'D01'; em toda lâmina, a primeira palavra D é a etiqueta).
  // Os tipos de lâmina do guia de bolso:
  //   capa     [título], [promessa] + D etiqueta · desenho grande embaixo
  //   conceito [o que é], [o detalhe] + D etiqueta, D marcas da escala (valor, valor, nome da faixa, nome da faixa)
  //   sinais   [frase] + D etiqueta + até 6 sinais (cada um com o ícone desenho(ctx, caixa, lam, i))
  //   passo    [o que fazer], [o porquê] + D etiqueta (passo N) e, se o desenho pedir, uma palavra · a trilha dos passos embaixo
  //   opcoes   [frase] + D etiqueta + até 4 opções (cada uma com o desenho(ctx, caixa, lam, i))
  //   erro     [o erro], [o porquê] + D etiqueta
  //   equipe   [o que você faz], [o que a equipe faz] + D etiqueta
  //   urgencia [quando chamar], [o detalhe] + D etiqueta, D número da tela · lâmina escura, o celular com o número
  //   resumo   até 4 frases (o cartão para print) + D etiqueta, D fontes
  const ROTEIRO = [
    { id: 'capa', tipo: 'capa', desenho: 'glicosimetro', linhas: [1, 2, 'D01'] },
    { id: 'numero', tipo: 'conceito', desenho: 'escala', linhas: [3, 4, 'D02', 'D03', 'D04', 'D05', 'D06'] },
    { id: 'sinais', tipo: 'sinais', desenho: 'sinal', linhas: [5, 'D07', 'D08', 'D09', 'D10', 'D11', 'D12', 'D13'] },
    { id: 'passo1', tipo: 'passo', desenho: 'visita', linhas: [6, 7, 'D14'] },
    { id: 'opcoes', tipo: 'opcoes', desenho: 'opcao', linhas: [8, 'D15', 'D16', 'D17', 'D18', 'D19'] },
    { id: 'passo2', tipo: 'passo', desenho: 'espera', linhas: [9, 10, 'D20', 'D21'] },
    { id: 'passo3', tipo: 'passo', desenho: 'medir', linhas: [11, 12, 'D22', 'D03'] },
    { id: 'passo4', tipo: 'passo', desenho: 'lanche', linhas: [13, 14, 'D23'] },
    { id: 'erro', tipo: 'erro', desenho: 'erro', linhas: [15, 16, 'D24'] },
    { id: 'equipe', tipo: 'equipe', desenho: 'equipe', linhas: [17, 18, 'D25'] },
    { id: 'urgencia', tipo: 'urgencia', desenho: 'telefone', linhas: [19, 20, 'D26', 'D29'] },
    { id: 'resumo', tipo: 'resumo', linhas: [21, 22, 23, 24, 'D27', 'D28'] },
  ];

  // o trecho de cada frase que vai no destaque do estilo (TROQUE com o texto)
  const DESTAQUE = { 1: 'glicose baixa', 3: 'abaixo de 70 mg/dL', 6: '15 g de açúcar rápido', 9: '15 minutos', 11: 'Repita a regra.', 13: 'em até 1 hora', 15: 'não são a escolha', 18: 'investiga a causa', 21: 'Abaixo de 70,', 22: '15 g', 23: 'Passou de 70,', 24: '192.' };

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
