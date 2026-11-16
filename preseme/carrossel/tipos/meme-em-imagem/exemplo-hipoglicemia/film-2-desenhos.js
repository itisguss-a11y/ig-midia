// PRESEME · carrossel MEME EM IMAGEM · exemplo "hipoglicemia na prova" · desenho 2 · o desenho da peça.
// A piada: a primeira questão pede os sinais da hipoglicemia, e o calouro que pulou o café sente todos. A lição separa o
// que define (o número, abaixo de 70 mg/dL) do que se faz (a regra dos 15), pela Sociedade Brasileira de Diabetes, 2023.
// Três palcos: a sala da prova, a folha de perto e o close; e o desenho do cartão da lição (a regra dos 15 em três coisas).
(function () {
  const P = globalThis.PRESEME, DS = P.DESENHO, B = globalThis.BIB, E = globalThis.ESTILOS, MEME = () => P.MEME;
  DS.palco = DS.palco || {};

  // a lousa da sala de aula (candidato à biblioteca: B.lousa): o quadro escuro com a moldura e o apoio do giz
  function lousa(ctx, { x, y, w, h, seed = 740 }) {
    E.ret(ctx, x - 14, y - 14, w + 28, h + 28, { papel: 'apoioEscuro', r: 6, seed, sombra: true, hachura: false });
    E.ret(ctx, x, y, w, h, { papel: E.escuro() ? 'noite' : 'floresta', r: 3, seed: seed + 1, sombra: false, hachura: false });
    E.ret(ctx, x + w * 0.1, y + h + 6, w * 0.8, 16, { papel: 'apoioEscuro', r: 4, seed: seed + 2, sombra: false, hachura: false });
  }
  // a folha da prova (candidato à biblioteca: B.folhaProva): a folha clara com as linhas de resposta; o título e a questão
  // entram por rótulo (palavras D), nunca escritos aqui. x, y: o canto de cima, à esquerda
  function folhaProva(ctx, { x, y, w, h, rot = 0, linhas = 6, seed = 750 }) {
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot);
    E.ret(ctx, -w / 2, -h / 2, w, h, { papel: 'superficie', r: 4, seed, sombra: true, hachura: false });
    const y0 = -h / 2 + h * 0.34, passo = (h * 0.6) / linhas;
    for (let i = 0; i < linhas; i++) E.linha(ctx, [[-w / 2 + w * 0.08, y0 + i * passo], [w / 2 - w * 0.08, y0 + i * passo + 1]], { papel: 'apoio', lw: 3, seed: seed + i + 1 });
    ctx.restore();
  }
  // as marquinhas de tremor dos dois lados de uma coisa (candidato à biblioteca: B.tremor)
  function tremor(ctx, cx, cy, larg, alto, seed = 760) {
    for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) {
      const x = cx + sd * (larg / 2 + 18 + i * 16), y0 = cy - alto * 0.25 + i * 6;
      E.linha(ctx, [[x, y0], [x + sd * 8, y0 + alto * 0.12], [x, y0 + alto * 0.24], [x + sd * 8, y0 + alto * 0.36]], { papel: 'tinta', lw: 4, seed: seed + i + (sd > 0 ? 10 : 0) });
    }
  }
  // o copo de água com a colher de açúcar (candidato à biblioteca: B.copo): x, y é o pé do copo
  function copo(ctx, { x, y, s = 1, colher = true, seed = 770 }) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (colher) {
      E.linha(ctx, [[30, -250], [-6, -80]], { papel: 'superficie', lw: 12, seed: seed + 3 });
      E.circulo(ctx, 34, -262, 22, { papel: 'superficie', seed: seed + 4, sombra: false, hachura: false, ry: 14 });
    }
    E.poligono(ctx, [[-62, -200], [62, -200], [50, 0], [-50, 0]], { papel: 'superficie', seed, sombra: false, hachura: false });
    E.poligono(ctx, [[-56, -120], [56, -120], [50, -4], [-50, -4]], { papel: 'apoio', contorno: false, hachura: false, sombra: false, seed: seed + 1 });
    E.linha(ctx, [[-62, -200], [-50, 0], [50, 0], [62, -200]], { lw: 6, seed: seed + 2 });
    ctx.restore();
  }

  // a sala da prova: a lousa com o nome da prova, o relógio nas 7h, a carteira com a folha e o calouro sentado
  DS.palco.sala = (ctx, info) => {
    B.sala(ctx, { fundo: info.fundo, quadro: false, janela: false });
    lousa(ctx, { x: 190, y: 330, w: 460, h: 250 });
    info.rotulo('D01', 420, 475, { cor: 'papel', size: 44, w: 420, rot: -0.02 });
    B.relogio(ctx, { x: 830, y: 440, r: 78, hora: 7 });
    // o calouro sentado atrás da carteira: a cadeira e ele primeiro, a carteira por cima (esconde as pernas)
    const c = B.cadeira(ctx, { x: 520, tipo: 'madeira' });
    const calouro = { quem: 'calouro', x: c.assento[0], y: c.assento[1], pose: 'sit', look: 0.2, lookY: 0.6, eyes: 'focus', brows: 'worried', mouth: 'flat', gesture: 'typing' };
    B.pessoa(ctx, calouro);
    const m = B.mesa(ctx, { x: 540, w: 460, h: 250 });
    folhaProva(ctx, { x: 450, y: m.topo - 30, w: 190, h: 26, linhas: 2, seed: 752 });
    return { cabecas: { calouro: MEME().cabeca(calouro) } };
  };
  // a folha de perto: o título e a primeira questão
  DS.palco.folha = (ctx, info) => {
    E.ret(ctx, -200, 150, 1480, 1500, { papel: 'apoioEscuro', r: 0, seed: 779, sombra: false }); // o tampo da carteira, de perto
    folhaProva(ctx, { x: 150, y: 260, w: 780, h: 980, rot: -0.03, linhas: 7 });
    info.rotulo('D01', 540, 400, { papel: 'titulo', size: 50, w: 640, rot: -0.03 });
    info.rotulo('D02', 520, 520, { papel: 'corpo', size: 50, w: 680, rot: -0.03 });
    // o lápis em cima da folha
    E.poligono(ctx, [[700, 980], [920, 760], [950, 790], [730, 1010]], { papel: 'destaque', seed: 781, sombra: true, hachura: false });
    E.poligono(ctx, [[700, 980], [730, 1010], [684, 1028]], { papel: 'superficie', seed: 782, sombra: false, hachura: false });
    return { cabecas: {} };
  };
  // o close da virada: o calouro suando e tremendo, de olhos arregalados; sem fundo (os raios)
  DS.palco.close = (ctx) => {
    const calouro = { quem: 'calouro', x: 540, y: 1290, s: 1.35, pose: 'stand', eyes: 'wide', brows: 'worried', mouth: 'wavy', sweat: 1, look: 0.1 };
    B.pessoa(ctx, calouro);
    const cb = MEME().cabeca(calouro);
    tremor(ctx, cb.centro[0], cb.centro[1], 230, 220);
    return { cabecas: { calouro: cb } };
  };

  DS.paineis = {
    sala: { palco: 'sala', camera: [170, 190, 790, 900] },
    questao: { palco: 'folha', camera: [100, 220, 880, 1060] },
    virada: { palco: 'close', camera: [210, 420, 660, 620], raios: true, foco: [540, 745] },
  };

  // o cartão da lição: a regra dos 15 em três coisas, da esquerda para a direita (o copo, o relógio nos 15 minutos e o
  // aparelho de medir), com setas em Marca-texto, que se leem no cartão escuro
  DS.licao = (ctx, cx) => {
    const k = Math.min(1, cx.h / 330), y = cx.y + cx.h - 30 * k, xs = [cx.x + cx.w * 0.17, cx.x + cx.w * 0.5, cx.x + cx.w * 0.83];
    copo(ctx, { x: xs[0], y, s: 0.95 * k });
    B.relogio(ctx, { x: xs[1], y: y - 120 * k, r: 92 * k, frac: 0.25 });
    B.glicosimetro(ctx, { x: xs[2], y: y - 110 * k, s: 0.85 * k, fita: true, gota: true });
    E.seta(ctx, [xs[0] + 90 * k, y - 120 * k], [xs[1] - 120 * k, y - 120 * k], { papel: 'marca', lw: 7, curva: 0.1 });
    E.seta(ctx, [xs[1] + 120 * k, y - 120 * k], [xs[2] - 100 * k, y - 120 * k], { papel: 'marca', lw: 7, curva: 0.1 });
  };
})();
