// PRESEME · carrossel · tipo DOCUMENTO ANOTADO · as lâminas e os campos. Um documento de verdade da atenção primária,
// desenhado fiel ao modelo oficial, com números em cima dos campos que importam: a capa mostra o documento inteiro e a
// pergunta; cada lâmina do meio aumenta um pedaço (o número, o que o campo quer dizer, o erro comum e o porquê); a última
// é o documento inteiro de novo, com todos os números, para salvar.
// Fonte única: o desenho (film-*.js), a conferência do tipo (peca.js) e o motor (laminas, conferir) leem daqui.
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
  const LAMINAS_MIN = 6, LAMINAS_MAX = 10; // a faixa do tipo (o conferir do motor confere)

  // ======================= PREENCHER (o chat 1 escreve daqui até o fim do bloco) =======================
  const ESTILO = 'planta'; // o estilo padrão do documento anotado (troque na hora com: laminas --estilo lapis)

  // O DOCUMENTO: o tamanho dele nas unidades do desenho (film-3-desenhos.js) e a letra que ele usa. LETRA é o rótulo dos
  // campos e LETRA_MIN, a letra mais miúda (as opções); o peca.js confere se, no zoom de cada lâmina, elas se leem.
  // No exemplo, a unidade é o ponto do PDF oficial (folha A4: 595 × 842).
  const DOC = { W: 595.3, H: 841.9, LETRA: 8.2, LETRA_MIN: 5.6 };

  // OS CAMPOS ANOTADOS, na ordem das lâminas. Para cada um:
  //   id       o nome da lâmina dele (vai também no ROTEIRO)
  //   numeros  o número (ou os números) do campo, como está no documento
  //   marcas   o retângulo de cada número, [x, y, largura, altura] nas unidades do documento (na mesma ordem dos números)
  //   zoom     o pedaço do documento que a lâmina aumenta, [x, y, largura, altura]; o tipo alarga até a proporção da janela
  //   nome     a palavra D com o nome do campo, como está escrito no documento
  //   curto    a palavra D da legenda da última lâmina (o resumo do campo em poucas palavras)
  //   oque, erro, porque   as frases do textos.txt: o que o campo quer dizer, o erro comum e o porquê
  //   escrito  (opcional) o exemplo escrito à mão no campo: { x, y (linha de base), k: 'Dnn', size, casas: largura da casa
  //            (espalha um caractere por casa, pulando / e espaço), centro: true (centraliza no x) }. Só dado inventado.
  const CAMPOS = [
    { id: 'datas', numeros: [3, 7], marcas: [[435.3, 95.5, 129.9, 20.7], [441.2, 148.9, 124.0, 23.9]], zoom: [428, 88, 140, 90],
      nome: 'D10', curto: 'D11', oque: 3, erro: 4, porque: 5,
      escrito: [{ x: 441.3, y: 113.6, k: 'D20', size: 9.5, casas: 14.74 }, { x: 447.2, y: 170.2, k: 'D21', size: 9.5, casas: 14.0 }] },
    { id: 'nome', numeros: [8], marcas: [[53, 180.3, 383.9, 24.6]], zoom: [53, 176, 200, 34],
      nome: 'D12', curto: 'D13', oque: 6, erro: 7, porque: 8,
      escrito: [{ x: 72, y: 201.6, k: 'D22', size: 10 }] },
    { id: 'idade', numeros: [10], marcas: [[53, 208.1, 95.9, 26.9]], zoom: [50, 204, 150, 36],
      nome: 'D14', curto: 'D15', oque: 9, erro: 10, porque: 11,
      escrito: [{ x: 75.3, y: 232.6, k: 'D23', size: 9.5, casas: 13.4 }, { x: 114.4, y: 225.2, k: 'D24', size: 9, centro: true }] },
    { id: 'gestante', numeros: [12], marcas: [[247.7, 208.1, 197.4, 27.5]], zoom: [245, 204, 202, 36],
      nome: 'D16', curto: 'D17', oque: 12, erro: 13, porque: 14,
      escrito: [{ x: 431.7, y: 218.6, k: 'D30', size: 9, centro: true }] },
    { id: 'raca', numeros: [13], marcas: [[448.4, 206.8, 116.8, 28.2]], zoom: [400, 196, 167, 44],
      nome: 'D18', curto: 'D19', oque: 15, erro: 16, porque: 17 },
    { id: 'escolaridade', numeros: [14], marcas: [[53, 235.6, 512.2, 31.5]], zoom: [300, 236, 266, 31],
      nome: 'D25', curto: 'D26', oque: 18, erro: 19, porque: 20,
      escrito: [{ x: 557.4, y: 248.4, k: 'D31', size: 8, centro: true }] },
    { id: 'referencia', numeros: [26], marcas: [[214.7, 378.6, 238.6, 22.5]], zoom: [205, 370, 258, 36],
      nome: 'D27', curto: 'D28', oque: 21, erro: 22, porque: 23,
      escrito: [{ x: 229, y: 398.6, k: 'D29', size: 9 }] },
  ];

  // as palavras D que o tipo escreve sozinho: a etiqueta da capa e as de erro comum e porquê
  const ROTULOS = { etiqueta: 'D01', erro: 'D02', porque: 'D03' };

  // AS LÂMINAS, NA ORDEM: a capa ([01] o título, [02] a promessa), uma lâmina por campo (tipo 'campo', com o id dele) e,
  // no fim, o documento inteiro (tipo 'documento': a frase de cima e a fonte). As frases e palavras de cada lâmina de campo
  // saem sozinhas dos CAMPOS. Lâmina extra: tipo 'texto' (a frase grande e o detalhe). De 6 a 10 lâminas.
  const ROTEIRO = [
    { id: 'capa', tipo: 'capa', linhas: [1, 2] },
    ...CAMPOS.map((c) => ({ id: c.id, tipo: 'campo', campo: c.id })),
    { id: 'documento', tipo: 'documento', linhas: [24, 25] },
  ];

  // o trecho de cada frase que vai no destaque do estilo (marca-texto no claro): { número da frase: 'trecho' }
  const DESTAQUE = { 1: 'ficha de notificação', 3: 'os sintomas começaram', 5: 'semana epidemiológica', 8: 'sem abreviações', 9: 'a unidade', 11: 'seis anos', 14: 'Não se aplica', 15: 'própria pessoa', 20: 'só para menor de 7 anos', 23: 'localização da residência' };
  // ============================== fim do PREENCHER ==============================

  // a janela do zoom na lâmina de campo (fixa: o peca.js usa a mesma para conferir a letra)
  const JANELA = { x: 80, y: 400, w: 920, h: 500 };
  // as frases e palavras de cada lâmina, para o motor (fantasma, contador) e para a lâmina sair quando tudo for apagado
  const porId = {}; for (const c of CAMPOS) porId[c.id] = c;
  for (const r of ROTEIRO) {
    const c = r.tipo === 'campo' && porId[r.campo];
    if (c) r.linhas = [c.oque, c.erro, c.porque, c.nome, ROTULOS.erro, ROTULOS.porque, ...(c.escrito || []).map((e) => e.k)];
    if (r.tipo === 'capa') r.linhas = [...(r.linhas || []), ROTULOS.etiqueta];
    if (r.tipo === 'documento') r.linhas = [...(r.linhas || []), ...(r.campos || CAMPOS.map((x) => x.id)).map((id) => porId[id] && porId[id].curto).filter(Boolean)];
  }

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
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, STYLE, ESTILO, CARROSSEL, LAMINAS, LAMINAS_MIN, LAMINAS_MAX, DESTAQUE, cenas, linha, efeitos, cenaEm, laminaEm, TX, DOC, CAMPOS, ROTULOS, ROTEIRO, JANELA };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
