// PRESEME · carrossel · tipo FLUXOGRAMA · as lâminas e a árvore do fluxo. O fluxograma é o carrossel para salvar e estudar
// para a prova: a conduta de um protocolo oficial em caixas e setas. A capa traz a pergunta; as lâminas do meio andam
// pelo fluxo, uma decisão por lâmina (a pergunta no losango, os caminhos sim e não, a caixa da conduta), com o pedaço já
// percorrido pequeno no canto; a penúltima mostra o fluxo inteiro (o cartão para print); a última, quem faz o quê.
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
  const ESTILO = 'chapado'; // o estilo padrão do fluxograma (troque na hora com: laminas --estilo planta)

  // A ÁRVORE DO FLUXO (TROQUE: é a parte que o chat 1 escreve, com o protocolo aberto). Um nó por caixa:
  //   acao     a caixa do que fazer (texto), e o fluxo segue para prox
  //   pergunta o losango (texto, uma pergunta de sim ou não); sim e nao levam a outro nó. Um dos dois lados termina numa
  //            conduta (fim): o fluxograma desce por uma espinha só, que cabe inteira numa lâmina
  //   fim      a conduta, onde o caminho termina (alerta: true pinta Coral, a urgência)
  // texto: a palavra D do nó na lâmina dele; curto (opcional): a versão curta, no fluxo inteiro. O mesmo D pode servir a dois
  // nós (duas condutas iguais). icone (opcional): um desenho de film-3-desenhos.js ou da biblioteca (B.<nome>), ao lado.
  // Na última pergunta, com as duas pontas em fim, desce a que não é alerta (ou a de desce: 'sim').
  const ARVORE = {
    inicio: 'lavar',
    rotulos: { sim: 'D03', nao: 'D04', pergunta: 'D02', passo: 'D05', proxima: 'D06' },
    nos: {
      lavar: { tipo: 'acao', texto: 'D10', curto: 'D11', prox: 'silvestre' },
      silvestre: { tipo: 'pergunta', texto: 'D12', curto: 'D13', sim: 'soro', nao: 'observavel', icone: 'morcego' },
      soro: { tipo: 'fim', texto: 'D14', alerta: true, icone: 'B.seringa' },
      observavel: { tipo: 'pergunta', texto: 'D15', curto: 'D16', sim: 'observar', nao: 'ja', icone: 'caoEGato' },
      ja: { tipo: 'fim', texto: 'D17', alerta: true, icone: 'B.seringa' },
      observar: { tipo: 'acao', texto: 'D18', curto: 'D19', prox: 'adoeceu' },
      adoeceu: { tipo: 'pergunta', texto: 'D20', curto: 'D21', sim: 'ja2', nao: 'descartada', icone: 'dezDias' },
      ja2: { tipo: 'fim', texto: 'D17', alerta: true, icone: 'B.seringa' },
      descartada: { tipo: 'fim', texto: 'D22', icone: 'B.visto' },
    },
  };

  // AS LÂMINAS, NA ORDEM (TROQUE). Os tipos de lâmina do fluxograma (film-2-moldes.js):
  //   capa     [título], [promessa] + D etiqueta · o desenho da capa e a silhueta do fluxo
  //   dado     [o que o número é], [o detalhe] + D etiqueta, D número, D fonte · opcional: o gancho regional
  //   passo    no: um nó acao · a caixa do que fazer, o desenho e [o porquê] (opcional)
  //   decisao  no: um nó pergunta · o losango, os dois caminhos e [o porquê] (opcional)
  //   fluxo    D etiqueta, D fonte · o fluxo inteiro, desenhado da mesma árvore (o cartão para print)
  //   papeis   [você], [a equipe], [o terceiro] + D etiqueta, D rótulo de cada um, D fonte · o terceiro é o 192 (quando
  //            chamar) ou, se o protocolo não tem 192, a prevenção; frase apagada some com o cartão dela
  const ROTEIRO = [
    { id: 'capa', tipo: 'capa', desenho: 'capa', linhas: [1, 2, 'D01'] },
    { id: 'dado', tipo: 'dado', desenho: 'mapa', linhas: [3, 4, 'D07', 'D08', 'D09'] },
    { id: 'lavar', tipo: 'passo', no: 'lavar', desenho: 'lavar', linhas: [5] },
    { id: 'silvestre', tipo: 'decisao', no: 'silvestre', linhas: [6] },
    { id: 'observavel', tipo: 'decisao', no: 'observavel', linhas: [7] },
    { id: 'observar', tipo: 'passo', no: 'observar', desenho: 'observar', linhas: [8] },
    { id: 'adoeceu', tipo: 'decisao', no: 'adoeceu', linhas: [9] },
    { id: 'fluxo', tipo: 'fluxo', linhas: ['D23', 'D24'] },
    { id: 'papeis', tipo: 'papeis', icones: ['voce', 'equipe', 'prevencao'], linhas: [10, 11, 12, 'D25', 'D26', 'D27', 'D28', 'D24'] },
  ];

  // o trecho de cada frase que vai no destaque do estilo (TROQUE com o texto)
  const DESTAQUE = { 1: 'e agora?', 6: 'sempre grave', 8: 'antes dos sinais' };

  // ---------- daqui para baixo é do tipo (não precisa mexer) ----------
  // os textos de cada nó entram na lâmina dele (o motor confere que existem); o fluxo e o papel usam todos
  const textosDoNo = (id) => { const n = ARVORE.nos[id] || {}; return [n.texto, n.curto].filter(Boolean); };
  const DUR = 2; // segundos de linha do tempo por lâmina (só para o motor achar cada uma; ninguém assiste)
  const LAMINAS = [], cenas = [], linha = {}, efeitos = [], markers = {}, S = {};
  for (const r of ROTEIRO) {
    const todos = (r.linhas || []).concat(r.no ? textosDoNo(r.no) : []).concat(r.no && ARVORE.nos[r.no] && ARVORE.nos[r.no].tipo === 'pergunta' ? [ARVORE.rotulos.sim, ARVORE.rotulos.nao] : []);
    const vivos = todos.filter((k) => TX[k]);
    if ((r.linhas || []).length && !vivos.length) continue;
    const i = LAMINAS.length, t0 = i * DUR, t1 = t0 + DUR, t = t0 + DUR / 2;
    const frases = vivos.filter((k) => typeof k === 'number');
    const lam = Object.assign({}, r, { n: i + 1, t0, t1, t, linhas: frases, palavras: vivos.filter((k) => typeof k !== 'number'), todas: r.linhas || [] });
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
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, STYLE, ESTILO, CARROSSEL, LAMINAS, DESTAQUE, ARVORE, ROTEIRO, cenas, linha, efeitos, cenaEm, laminaEm, TX };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
