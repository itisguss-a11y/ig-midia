// PRESEME · demonstração do kit de estilos: a agente chega à casa 7 com a prancheta (conteúdo de teste, sem fato).
// Tudo é desenhado com as funções do kit (globalThis.ESTILOS): a mesma cena sai em qualquer dos seis estilos.
(function () {
  const U = globalThis.U, G = globalThis.G, E = globalThis.ESTILOS, SC = globalThis.SCORE, TX = globalThis.TEXTOS, Ch = globalThis.Ch;
  const SAFE = G.SAFE, ev = SC.ev;
  const L = SAFE.x, R = SAFE.x + SAFE.w, TOP = SAFE.y, CX = (L + R) / 2;
  const GY = 1390; // o chão
  const PARA = 330; // onde ela para
  const S_AG = 1.05; // o tamanho dela
  const p = (t, t0, d) => U.clamp((t - t0) / d, 0, 1);

  // o título em duas linhas (quebra na vírgula), com "de casa em casa" no destaque; diminui até caber
  function titulo(ctx, t) {
    const s = TX['1'] || '';
    const a = U.ease.outCubic(p(t, ev.titulo, 0.3));
    if (!s || a <= 0) return;
    const i = s.indexOf(', ');
    const linhas = i > 0 ? [s.slice(0, i + 1), s.slice(i + 2)] : [s];
    let size = 84;
    while (size > 48 && Math.max(...linhas.map((l) => E.medir(ctx, l, { papel: 'titulo', size }))) > R - L) size -= 4;
    const y0 = TOP + 120 + (1 - a) * 28, lh = size * E.letra('titulo')[2] * 1.2;
    const k = U.ease.inOutCubic(p(t, ev.destaque, 0.55));
    linhas.forEach((l, j) => E.textoComDestaque(ctx, l, j === linhas.length - 1 ? 'de casa em casa' : '', CX, y0 + j * lh, { papel: 'titulo', size, align: 'center', k, seed: 70 + j, alpha: a }));
  }

  // a agente: entra andando, para na frente da casa e levanta a prancheta
  function agente(ctx, t) {
    const an = Ch.walk(t, { x0: -200, speed: 300, t0: ev.entra, stride: 300, s: S_AG });
    const parou = an.x >= PARA;
    const x = parou ? PARA : an.x;
    const lev = parou ? U.ease.outBack(p(t, ev.prancheta, 0.35)) : 0;
    const handR = [U.lerp(88, 80, lev), U.lerp(-196, -262, lev)];
    E.personagem(ctx, { x, y: GY, s: S_AG, quem: 'agente', pose: parou ? 'stand' : 'walk', walk: an.walk, look: 0.7, mouth: parou ? 'smile' : 'flat', handR, seed: 300 });
    const hx = x + handR[0] * S_AG, hy = GY + handR[1] * S_AG;
    E.objeto(ctx, 'prancheta', { x: hx + 20, y: hy - 34, s: 0.95, rot: parou ? U.lerp(-0.22, -0.06, lev) : -0.22 + 0.05 * Math.sin(an.walk * Math.PI * 2) });
    return { x, ponta: [hx + 64, hy - 70] };
  }

  Studio.film({
    fadeOut: 0,
    draw(ctx, t) {
      const choque = 9 * U.pulse(t, ev.carimbo, 16) * (t >= ev.carimbo ? 1 : 0); // a batida do carimbo treme o quadro
      ctx.save(); ctx.translate(choque * Math.sin(t * 90), choque * Math.cos(t * 70));
      E.fundo(ctx);
      E.objeto(ctx, 'sol', { x: 830, y: 640, r: 48, t });
      E.chao(ctx, GY);
      const casa = E.objeto(ctx, 'casa', { x: 560, y: GY, w: 370, h: 420, numero: TX.D01, porta: 0.75 * U.ease.inOutCubic(p(t, ev.porta, 0.5)) });
      E.objeto(ctx, 'vaso', { x: 512, y: GY, s: 0.78 });
      const ag = agente(ctx, t);
      // a seta: da prancheta até a porta
      E.seta(ctx, ag.ponta, [casa.porta[0] - 40, casa.porta[1] - 40], { curva: -0.32, k: U.ease.inOutCubic(p(t, ev.seta, 0.6)), papel: 'tinta' });
      // a medida no chão: dela até a porta
      E.cota(ctx, [PARA + 70, GY + 62], [casa.porta[0] - 52, GY + 62], TX.D02, { k: U.ease.outCubic(p(t, ev.cota, 0.5)), sobre: 'chao' });
      // o carimbo na parede
      if (t >= ev.carimbo) E.carimbo(ctx, TX.D03, 652, GY - 122, { k: p(t, ev.carimbo, 0.16), rot: -0.1, size: 50, quebra: true });
      titulo(ctx, t);
      ctx.restore();
    },
  });
})();
