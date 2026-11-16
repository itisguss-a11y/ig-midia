// PRESEME · motor "Caso com escolha" · exemplo: febre perto da mata · desenho 2/3 · a peça (o molde, film-1, não muda)
// Texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.
// O que é só desta peça: os destaques, o morador que chega, as pistas da ficha, a mata atrás dele e o desenho de cada parte
// (o Aedes e a água parada, os três sintomas da dengue; o maruim e o que a dengue e o Oropouche têm em comum; o Anopheles
// na pele e o número de Roraima; palpite e exame; o parasita no sangue e o remédio do SUS; a notificação semanal; os
// sinais de alarme; as três proteções). Uma imagem por frase: a troca é seca, junto com a frase (um corte por frase).
// Só o kit (E.*) e cor por papel: a peça sai em qualquer estilo. Nada de diagnóstico pela tela.
(function () {
  const U = globalThis.U, E = globalThis.ESTILOS;
  const ease = U.ease, cl = U.clamp;
  const cor = (p) => E.cor(p);
  const desde = (st, n) => (st.desde && st.desde[n] != null ? st.desde[n] : -1);
  const entra = (st, n, atraso = 0, dur = 0.35) => ease.outBack(cl((desde(st, n) - atraso) / dur, 0, 1));
  const listra = () => (E.escuro() ? 'tinta' : 'superficie'); // a listra branca do Aedes: Papel na lousa, branco no papel
  const rotulo = (ctx, M, s, x, y, o = {}) => M.escrever(ctx, s, x, y, Object.assign({ size: 44, papel: 'mao', align: 'center' }, o));
  function escala(ctx, x, y, k, f) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); f(); ctx.restore(); }

  // ---------- os três mosquitos ----------
  // o Aedes: corpo escuro com listras claras, pernas listradas, asas transparentes; x, y é o tórax
  function aedes(ctx, x, y, { s = 1, rot = -0.15, t = 0, seed = 300 } = {}) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    const bate = Math.sin(t * 55) * 0.3;
    for (const sd of [-1, 1]) E.poligono(ctx, [[-4, -6], [66, -44 + sd * 6 + bate * 26 * sd], [92, -26 + sd * 4], [8, 2]], { papel: 'apoio', alpha: 0.5, seed: seed + sd, sombra: false, hachura: false, lw: 3 });
    for (let i = 0; i < 3; i++) for (const sd of [-1, 1]) {
      const pts = [[-24 + i * 14, 8], [-36 + i * 22 + sd * 8, 50 + i * 4], [-48 + i * 30 + sd * 14, 92 + i * 4]];
      E.linha(ctx, pts, { papel: 'tinta', lw: 4, seed: seed + 10 + i * 2 + (sd > 0 ? 1 : 0) });
      E.linha(ctx, [pts[1], [(pts[1][0] + pts[2][0]) / 2, (pts[1][1] + pts[2][1]) / 2]], { papel: listra(), lw: 6, seed: seed + 20 + i });
    }
    E.circulo(ctx, 40, 4, 52, { ry: 15, papel: 'sombra', seed: seed + 3, sombra: false, hachura: false }); // abdome
    for (let i = 0; i < 4; i++) E.linha(ctx, [[14 + i * 18, -9], [18 + i * 18, 17]], { papel: listra(), lw: 5, seed: seed + 30 + i });
    E.circulo(ctx, -22, -2, 21, { ry: 17, papel: 'sombra', seed: seed + 4, sombra: false, hachura: false }); // tórax
    E.linha(ctx, [[-30, -12], [-22, 4], [-14, -12]], { papel: listra(), lw: 4, seed: seed + 35 }); // a lira do tórax
    E.circulo(ctx, -48, 2, 12, { papel: 'sombra', seed: seed + 5, sombra: false, hachura: false }); // cabeça
    E.linha(ctx, [[-58, 6], [-100, 20]], { papel: 'tinta', lw: 3.5, seed: seed + 6 }); // a tromba
    ctx.restore();
  }
  // o Anopheles: o corpo bem inclinado (pica de "bunda para cima"), asas com manchas
  function anopheles(ctx, x, y, { s = 1, rot = -0.75, t = 0, seed = 340 } = {}) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    const bate = Math.sin(t * 55) * 0.3;
    for (const sd of [-1, 1]) {
      E.poligono(ctx, [[-6, -4], [70, -46 + sd * 8 + bate * 30 * sd], [96, -30 + sd * 6], [10, 4]], { papel: 'apoio', alpha: 0.5, seed: seed + sd, sombra: false, hachura: false, lw: 3 });
      for (let i = 0; i < 3; i++) E.circulo(ctx, 30 + i * 20, -22 + sd * 3 - i * 6, 5, { papel: 'tinta', seed: seed + 40 + i, sombra: false, hachura: false, contorno: false });
    }
    E.circulo(ctx, 34, 0, 56, { ry: 12, papel: 'apoioEscuro', seed: seed + 3, sombra: false, hachura: false });
    E.circulo(ctx, -26, -2, 20, { ry: 15, papel: 'apoioEscuro', seed: seed + 4, sombra: false, hachura: false });
    E.circulo(ctx, -52, 2, 11, { papel: 'apoioEscuro', seed: seed + 5, sombra: false, hachura: false });
    E.linha(ctx, [[-60, 6], [-110, 22]], { papel: 'tinta', lw: 3.5, seed: seed + 6 });
    for (let i = 0; i < 3; i++) for (const sd of [-1, 1]) E.linha(ctx, [[-30 + i * 12, 8], [-40 + i * 22 + sd * 6, 46 + i * 6], [-50 + i * 30 + sd * 10, 80 + i * 4]], { papel: 'tinta', lw: 3, seed: seed + 10 + i * 2 + (sd > 0 ? 1 : 0) });
    ctx.restore();
  }
  // o maruim: corpinho corcunda, asas curtas e largas com pintas, pernas curtas
  function maruim(ctx, x, y, { s = 1, t = 0, seed = 380 } = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const bate = Math.sin(t * 60) * 0.25;
    for (const sd of [-1, 1]) {
      E.poligono(ctx, [[0, -16], [60, -64 + sd * 10 + bate * 30 * sd], [92, -40 + sd * 8], [70, -8], [10, 0]], { papel: 'apoio', alpha: 0.55, seed: seed + sd, sombra: false, hachura: false, lw: 3 });
      for (let i = 0; i < 4; i++) E.circulo(ctx, 34 + (i % 2) * 22, -44 + sd * 4 + Math.floor(i / 2) * 18, 6, { papel: 'tinta', seed: seed + 40 + i + (sd > 0 ? 4 : 0), sombra: false, hachura: false, contorno: false });
    }
    for (let i = 0; i < 3; i++) for (const sd of [-1, 1]) E.linha(ctx, [[-14 + i * 14, 18], [-20 + i * 16 + sd * 6, 46], [-26 + i * 18 + sd * 10, 66]], { papel: 'tinta', lw: 3.5, seed: seed + 10 + i * 2 + (sd > 0 ? 1 : 0) });
    E.circulo(ctx, 26, 12, 34, { ry: 18, papel: 'apoioEscuro', seed: seed + 3, sombra: false, hachura: false }); // abdome
    E.circulo(ctx, -10, -2, 30, { ry: 26, papel: 'apoioEscuro', seed: seed + 4, sombra: false, hachura: false }); // a corcunda
    E.circulo(ctx, -40, 14, 14, { papel: 'apoioEscuro', seed: seed + 5, sombra: false, hachura: false }); // cabeça
    E.linha(ctx, [[-50, 20], [-70, 34]], { papel: 'tinta', lw: 3.5, seed: seed + 6 });
    ctx.restore();
  }

  // ---------- os ícones ----------
  // o pneu com água parada (x, y é o centro); vazio: sem a água (o depois da prevenção)
  function pneu(ctx, x, y, { s = 1, t = 0, vazio = false, seed = 420 } = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    E.circulo(ctx, 0, 0, 150, { ry: 62, papel: 'sombra', seed, sombra: false });
    if (!vazio) {
      E.circulo(ctx, 0, -4, 98, { ry: 34, papel: 'apoio', seed: seed + 1, sombra: false, hachura: false });
      for (let i = 0; i < 2; i++) { const r = 30 + ((t * 30 + i * 30) % 60); E.circulo(ctx, 10, -4, r, { ry: r * 0.32, papel: null, tinta: 'tinta', lw: 2.5, seed: seed + 2 + i, sombra: false, hachura: false }); }
    } else E.circulo(ctx, 0, -4, 98, { ry: 34, papel: 'fundo', seed: seed + 1, sombra: false, hachura: false });
    ctx.restore();
  }
  function termometro(ctx, x, y, s = 1, seed = 440) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(0.35); ctx.scale(s, s);
    E.ret(ctx, -18, -110, 36, 190, { papel: 'superficie', r: 18, seed, sombra: false });
    E.circulo(ctx, 0, 92, 32, { papel: 'alerta', seed: seed + 1, sombra: false, hachura: false });
    E.ret(ctx, -7, -70, 14, 150, { papel: 'alerta', r: 6, seed: seed + 2, contorno: false, sombra: false, hachura: false });
    for (let i = 0; i < 4; i++) E.linha(ctx, [[18, -80 + i * 32], [32, -80 + i * 32]], { papel: 'tinta', lw: 3, seed: seed + 3 + i });
    ctx.restore();
  }
  function olho(ctx, x, y, s = 1, t = 0, seed = 460) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    E.poligono(ctx, [[-90, 0], [-40, -44], [40, -44], [90, 0], [40, 44], [-40, 44]], { papel: 'superficie', seed, sombra: false });
    E.circulo(ctx, 0, 0, 34, { papel: 'apoioEscuro', seed: seed + 1, sombra: false, hachura: false });
    E.circulo(ctx, 0, 0, 14, { papel: 'tinta', seed: seed + 2, sombra: false, hachura: false });
    const p = 1 + 0.15 * Math.sin(t * 9); // a dor, pulsando atrás do olho
    for (let i = 0; i < 3; i++) E.linha(ctx, [[96 * p, -40 + i * 40], [130 * p, -52 + i * 52]], { papel: 'alerta', lw: 6, seed: seed + 3 + i });
    ctx.restore();
  }
  function pele(ctx, x, y, s = 1, seed = 480) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    E.ret(ctx, -100, -60, 200, 120, { papel: 'pele', r: 50, seed, sombra: false, hachura: false });
    [[-50, -20, 13], [10, -28, 10], [52, 6, 14], [-20, 22, 11], [32, 34, 8], [-66, 18, 8]].forEach(([a, b, r], i) => E.circulo(ctx, a, b, r, { papel: 'alerta', seed: seed + 1 + i, sombra: false, hachura: false, contorno: false }));
    ctx.restore();
  }
  function gota(ctx, x, y, s = 1, seed = 500) {
    E.poligono(ctx, [[x, y - 70 * s], [x + 44 * s, y + 6 * s], [x + 30 * s, y + 40 * s], [x, y + 52 * s], [x - 30 * s, y + 40 * s], [x - 44 * s, y + 6 * s]], { papel: 'alerta', seed, sombra: false });
  }
  function parasita(ctx, x, y, r, seed = 520) {
    E.circulo(ctx, x, y, r, { papel: 'superficie', seed, sombra: false });
    for (let i = 0; i < 6; i++) {
      const a = i * 1.05 + 0.4, d = r * 0.5;
      E.circulo(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, r * 0.15, { papel: null, tinta: 'alerta', lw: 5, seed: seed + 1 + i, sombra: false, hachura: false });
      E.circulo(ctx, x + Math.cos(a) * d + r * 0.07, y + Math.sin(a) * d - r * 0.05, r * 0.05, { papel: 'alerta', seed: seed + 9 + i, sombra: false, hachura: false, contorno: false });
    }
  }
  function cartela(ctx, x, y, s = 1, seed = 540) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.06); ctx.scale(s, s);
    E.ret(ctx, -170, -100, 340, 200, { papel: 'superficie', r: 24, seed, sombra: false });
    for (let i = 0; i < 2; i++) for (let j = 0; j < 4; j++) E.circulo(ctx, -114 + j * 76, -42 + i * 84, 27, { papel: 'apoio', seed: seed + 1 + i * 4 + j, sombra: false });
    ctx.restore();
  }

  // ---------- o caso: a mata atrás do morador ----------
  function arvore(ctx, x, y, h, seed) {
    E.ret(ctx, x - 12, y - h * 0.45, 24, h * 0.45, { papel: 'apoioEscuro', r: 6, seed, sombra: false });
    E.circulo(ctx, x, y - h * 0.62, h * 0.3, { papel: 'apoio', seed: seed + 1, sombra: false });
    E.circulo(ctx, x - h * 0.2, y - h * 0.5, h * 0.2, { papel: 'apoio', seed: seed + 2, sombra: false });
    E.circulo(ctx, x + h * 0.2, y - h * 0.48, h * 0.21, { papel: 'apoio', seed: seed + 3, sombra: false });
  }
  function CENARIO(ctx, st) {
    const k = st.c.tipo === 'fecho' ? 1 : cl((st.t - (st.c.itens[1] ? st.c.itens[1].t0 : 0)) / 0.5, 0, 1); // a mata aparece com a frase da mata
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha *= k;
    // uma fileira baixa de mata no horizonte, fora do lugar do morador (x de 180 a 390)
    [[50, 230, 900], [125, 190, 905], [450, 210, 910], [535, 250, 915], [625, 200, 920], [710, 240, 925], [800, 200, 930], [885, 230, 935]].forEach(([x, h, s]) => arvore(ctx, x, 1440, h, s));
    ctx.restore();
  }

  // ---------- o porquê de cada opção ----------
  // A, dengue: [08] o Aedes e a água parada onde ele se cria; [09] os três sintomas que a dengue soma
  function porqueDengue(ctx, st, M) {
    const t = st.t;
    if (desde(st, 9) < 0) {
      aedes(ctx, 320, 700, { s: 2.2, rot: -0.2, t, seed: 300 });
      rotulo(ctx, M, M.D('D08'), 320, 990, { size: 54, cor: 'destaque' });
      pneu(ctx, 740, 820, { s: 1.0, t });
      rotulo(ctx, M, M.D('D20'), 740, 990, { size: 48 });
    } else {
      const xs = [200, 500, 800], ks = [0, 1, 2].map((i) => entra(st, 9, 0.25 + 0.55 * i));
      escala(ctx, xs[0], 790, ks[0] * 1.25, () => termometro(ctx, 0, 0, 1));
      escala(ctx, xs[1], 790, ks[1] * 1.15, () => olho(ctx, 0, 0, 1, t));
      escala(ctx, xs[2], 790, ks[2] * 1.15, () => pele(ctx, 0, 0, 0.95));
      ['D09', 'D10', 'D11'].forEach((d, i) => { if (ks[i] >= 1) rotulo(ctx, M, M.D(d), xs[i], 1040, { size: 44 }); });
    }
  }
  // B, Oropouche: [10] o maruim; [11] o que ele tem em comum com a dengue (os dois círculos, as pistas do caso no meio)
  function porqueOropouche(ctx, st, M) {
    const t = st.t;
    if (desde(st, 11) < 0) {
      maruim(ctx, 530, 760, { s: 2.9, t });
      rotulo(ctx, M, M.D('D12'), 500, 1070, { size: 58, cor: 'destaque' });
    } else {
      const k = cl(desde(st, 11) / 0.5, 0, 1);
      const r = 250, yc = 840;
      ctx.save(); ctx.globalAlpha *= k;
      E.circulo(ctx, 390 - 30 * (1 - k), yc, r, { papel: null, tinta: 'tinta', lw: 6, seed: 560, sombra: false, hachura: false });
      E.circulo(ctx, 610 + 30 * (1 - k), yc, r, { papel: null, tinta: 'destaque', lw: 6, seed: 561, sombra: false, hachura: false });
      ctx.restore();
      M.escrever(ctx, (globalThis.TEXTOS[4] || ''), 250, yc - r - 26, { size: 50, papel: 'mao', align: 'center' });
      M.escrever(ctx, M.D('D23'), 750, yc - r - 26, { size: 50, papel: 'mao', align: 'center', cor: 'destaque' });
      const kk = cl((desde(st, 11) - 0.8) / 0.4, 0, 1);
      ctx.save(); ctx.globalAlpha *= kk;
      M.escrever(ctx, M.D('D05'), 500, yc - 14, { size: 42, papel: 'mao', align: 'center' });
      M.escrever(ctx, M.D('D06'), 500, yc + 56, { size: 42, papel: 'mao', align: 'center' });
      ctx.restore();
    }
  }
  // C, malária: [12] o Anopheles inclinado, picando a pele; [13] o número de Roraima, contando
  function porqueMalaria(ctx, st, M) {
    const t = st.t;
    if (desde(st, 13) < 0) {
      E.ret(ctx, 230, 960, 600, 130, { papel: 'pele', r: 60, seed: 600, sombra: false, hachura: false }); // o braço
      E.circulo(ctx, 840, 1022, 78, { ry: 70, papel: 'pele', seed: 601, sombra: false, hachura: false }); // a mão
      E.ret(ctx, 60, 930, 220, 190, { papel: 'apoio', r: 26, seed: 602, sombra: false }); // a manga
      anopheles(ctx, 560, 800, { s: 2.0, rot: -0.85, t, seed: 340 });
      rotulo(ctx, M, M.D('D13'), 290, 600, { size: 58, cor: 'destaque' });
    } else {
      const u = ease.outCubic(cl((desde(st, 13) - 0.2) / 1.4, 0, 1));
      const n = Math.round(30632 * u), s = n.toLocaleString('pt-BR');
      M.escrever(ctx, s, 500, 790, { size: 170, papel: 'numero', align: 'center' });
      if (u >= 1) rotulo(ctx, M, M.D('D14'), 500, 920, { size: 54, cor: 'destaque' });
      E.linha(ctx, [[200, 830], [800, 826]], { papel: 'destaque', lw: 7, k: u, seed: 610 });
    }
  }

  // ---------- na UBS ----------
  // [14] palpite (✗) e exame (✓); [15] o parasita no sangue e a cartela grátis; [16] a notificação semanal; [17] o alarme
  function aps(ctx, st, M) {
    const t = st.t;
    if (desde(st, 15) < 0) {
      // o palpite: o balão de pensamento com a interrogação
      E.circulo(ctx, 270, 700, 150, { ry: 120, papel: 'superficie', seed: 700, sombra: false });
      E.circulo(ctx, 190, 860, 26, { papel: 'superficie', seed: 701, sombra: false });
      E.circulo(ctx, 160, 910, 14, { papel: 'superficie', seed: 702, sombra: false });
      M.escrever(ctx, '?', 270, 750, { size: 150, papel: 'numero', align: 'center' });
      rotulo(ctx, M, M.D('D15'), 270, 1010, { size: 50 });
      M.marca(ctx, 'errada', 400, 590, 1.4, cl((desde(st, 14) - 0.9) / 0.4, 0, 1));
      // o exame: o tubo de sangue
      ctx.save(); ctx.translate(730, 720); ctx.rotate(0.12);
      E.ret(ctx, -46, -170, 92, 300, { papel: 'superficie', r: 40, seed: 710, sombra: false });
      E.ret(ctx, -36, -40, 72, 160, { papel: 'alerta', r: 30, seed: 711, contorno: false, sombra: false, hachura: false });
      E.ret(ctx, -56, -200, 112, 56, { papel: 'apoioEscuro', r: 12, seed: 712, sombra: false });
      ctx.restore();
      rotulo(ctx, M, M.D('D16'), 730, 1010, { size: 50, cor: 'destaque' });
      M.marca(ctx, 'certa', 860, 560, 1.4, cl((desde(st, 14) - 1.5) / 0.4, 0, 1));
    } else if (desde(st, 16) < 0) {
      gota(ctx, 170, 640, 1.6, 720);
      E.seta(ctx, [250, 640], [400, 640], { papel: 'tinta', k: cl((desde(st, 15) - 0.3) / 0.4, 0, 1), seed: 721 });
      escala(ctx, 610, 640, entra(st, 15, 0.7, 0.4), () => parasita(ctx, 0, 0, 170, 722));
      escala(ctx, 290, 990, entra(st, 15, 2.2, 0.4), () => cartela(ctx, 0, 0, 0.8));
      E.carimbo(ctx, M.D('D17'), 690, 1000, { k: cl((desde(st, 15) - 2.8) / 0.25, 0, 1), size: 44, papel: 'destaque', rot: -0.1 });
    } else if (desde(st, 17) < 0) {
      // a ficha de notificação, com as duas doenças marcadas, e a semana com um dia marcado
      E.ret(ctx, 100, 500, 400, 560, { papel: 'superficie', r: 16, seed: 730, sombra: false });
      for (let i = 0; i < 6; i++) E.linha(ctx, [[140, 580 + i * 70], [460, 580 + i * 70]], { papel: 'tinta', lw: 2.5, seed: 731 + i, k: 1 });
      [4, 6].forEach((n, i) => {
        const k = cl((desde(st, 16) - 0.4 - 0.6 * i) / 0.35, 0, 1);
        M.marca(ctx, 'certa', 170, 680 + i * 170, 0.8, k);
        if (k > 0) M.escrever(ctx, globalThis.TEXTOS[n] || '', 220, 700 + i * 170, { size: 50, papel: 'mao' });
      });
      ctx.save(); ctx.translate(740, 700);
      E.ret(ctx, -190, -160, 380, 320, { papel: 'superficie', r: 22, seed: 740, sombra: false });
      E.ret(ctx, -190, -160, 380, 70, { papel: 'apoioEscuro', r: 22, seed: 741, sombra: false, hachura: false });
      for (let i = 0; i < 7; i++) E.ret(ctx, -168 + i * 49, -40, 40, 40, { papel: i === 0 ? 'destaque' : 'apoio', r: 6, seed: 742 + i, sombra: false, hachura: false });
      for (let i = 0; i < 7; i++) E.ret(ctx, -168 + i * 49, 30, 40, 40, { papel: i === 0 ? 'destaque' : 'apoio', r: 6, seed: 750 + i, sombra: false, hachura: false });
      ctx.restore();
      rotulo(ctx, M, M.D('D18'), 740, 940, { size: 50, cor: 'destaque' });
    } else {
      // o alarme: a barriga que dói, o vômito que não para, o sangramento; e a volta na hora
      const xs = [210, 500, 790];
      escala(ctx, xs[0], 680, entra(st, 17, 0.2), () => {
        E.circulo(ctx, 0, 0, 110, { papel: null, tinta: 'alerta', lw: 7, seed: 760, sombra: false, hachura: false });
        E.circulo(ctx, 0, 6, 62, { ry: 70, papel: 'pele', seed: 761, sombra: false, hachura: false });
        E.linha(ctx, [[-20, -6], [8, -14], [16, 10], [-6, 22], [-12, 4], [2, 2]], { papel: 'alerta', lw: 5, seed: 762 });
      });
      escala(ctx, xs[1], 680, entra(st, 17, 0.8), () => {
        E.circulo(ctx, 0, 0, 110, { papel: null, tinta: 'alerta', lw: 7, seed: 770, sombra: false, hachura: false });
        E.circulo(ctx, 0, -14, 50, { papel: 'pele', seed: 771, sombra: false, hachura: false });
        E.circulo(ctx, 0, 6, 12, { papel: 'sombra', seed: 772, sombra: false, hachura: false });
        for (let i = 0; i < 3; i++) E.linha(ctx, [[-14 + i * 14, 30], [-18 + i * 16, 52 + 6 * Math.sin(t * 8 + i)], [-12 + i * 12, 76]], { papel: 'apoio', lw: 6, seed: 773 + i });
      });
      escala(ctx, xs[2], 680, entra(st, 17, 1.4), () => {
        E.circulo(ctx, 0, 0, 110, { papel: null, tinta: 'alerta', lw: 7, seed: 780, sombra: false, hachura: false });
        gota(ctx, 0, 6, 1, 781);
      });
      E.carimbo(ctx, M.D('D19'), 500, 960, { k: cl((desde(st, 17) - 2.4) / 0.25, 0, 1), size: 64, papel: 'coral', rot: -0.08 });
    }
  }

  // ---------- a prevenção: uma proteção por inseto ----------
  function prevencao(ctx, st, M) {
    const t = st.t;
    if (desde(st, 19) < 0) {
      // [18] o Aedes: o pneu tomba e a água sai
      pneu(ctx, 260, 720, { s: 0.95, t });
      aedes(ctx, 260, 540, { s: 0.9, rot: -0.1, t, seed: 790 });
      rotulo(ctx, M, M.D('D20'), 260, 880, { size: 48 });
      M.marca(ctx, 'errada', 260, 990, 1.2, cl((desde(st, 18) - 0.5) / 0.4, 0, 1));
      const kv = cl((desde(st, 18) - 1.0) / 0.5, 0, 1);
      E.seta(ctx, [430, 720], [570, 720], { papel: 'tinta', k: kv, seed: 795 });
      if (kv >= 1) {
        pneu(ctx, 740, 720, { s: 0.95, t, vazio: true });
        M.marca(ctx, 'certa', 740, 990, 1.2, cl((desde(st, 18) - 1.6) / 0.4, 0, 1));
      }
    } else if (desde(st, 20) < 0) {
      // [19] o maruim: a janela de tela de malha fina; ele bate e não entra
      ctx.save(); ctx.translate(480, 760);
      E.ret(ctx, -230, -250, 460, 440, { papel: 'superficie', r: 10, seed: 800, sombra: false });
      for (let i = -210; i <= 210; i += 21) E.linha(ctx, [[i, -238], [i, 178]], { papel: 'tinta', lw: 1.6, seed: 801 + i });
      for (let i = -238; i <= 178; i += 21) E.linha(ctx, [[-218, i], [218, i]], { papel: 'tinta', lw: 1.6, seed: 900 + i });
      E.ret(ctx, -248, -268, 496, 476, { papel: null, tinta: 'apoioEscuro', lw: 14, r: 10, seed: 802, sombra: false, hachura: false });
      ctx.restore();
      const bate = Math.abs(Math.sin(t * 3)) * 40;
      maruim(ctx, 800 - bate, 620, { s: 0.9, t, seed: 810 });
      rotulo(ctx, M, M.D('D21'), 480, 1080, { size: 50, cor: 'destaque' });
    } else {
      // [20] o Anopheles: a cama com mosquiteiro, a camisa de manga comprida e o repelente
      ctx.save(); ctx.translate(330, 820);
      E.ret(ctx, -230, 60, 460, 70, { papel: 'apoioEscuro', r: 12, seed: 820, sombra: false });
      E.ret(ctx, -200, 20, 400, 50, { papel: 'superficie', r: 18, seed: 821, sombra: false });
      E.poligono(ctx, [[0, -300], [-250, 70], [250, 70]], { papel: 'apoio', alpha: 0.35, seed: 822, sombra: false, hachura: false, lw: 4 });
      for (let i = -3; i <= 3; i++) E.linha(ctx, [[0, -300], [i * 72, 70]], { papel: 'tinta', lw: 2, seed: 823 + i });
      ctx.restore();
      rotulo(ctx, M, M.D('D22'), 330, 1010, { size: 50, cor: 'destaque' });
      escala(ctx, 780, 620, entra(st, 20, 1.0), () => E.poligono(ctx, [[-60, -70], [60, -70], [110, -10], [80, 10], [60, -10], [60, 90], [-60, 90], [-60, -10], [-80, 10], [-110, -10]], { papel: 'apoio', seed: 830, sombra: false }));
      escala(ctx, 780, 900, entra(st, 20, 1.6), () => {
        E.ret(ctx, -36, -50, 72, 120, { papel: 'superficie', r: 16, seed: 840, sombra: false });
        E.ret(ctx, -22, -82, 44, 36, { papel: 'destaque', r: 8, seed: 841, sombra: false, hachura: false });
        for (let i = 0; i < 3; i++) E.circulo(ctx, 50 + i * 18, -76 - i * 12, 6, { papel: 'apoio', seed: 842 + i, sombra: false, hachura: false });
      });
    }
  }

  globalThis.PECA = {
    DESTAQUE: { 1: 'de repente', 2: 'área de mata', 7: 'pela tela', 8: 'Aedes aegypti', 10: 'maruim', 12: 'Anopheles', 13: '30.632', 14: 'com o exame', 15: 'parasita no sangue', 16: 'notificação semanal', 17: 'volta na hora', 18: 'água parada', 19: 'tela de malha fina', 20: 'mosquiteiro', 21: 'o exame' },
    // o morador: cabelo curto, bigode, camisa Sálvia
    PACIENTE: { quem: 'calouro', style: { hairStyle: 'short', facialHair: 'mustache', outfit: 'shirt', shirt: E.PAL.salvia, trim: E.PAL.folha, collar: E.PAL.salvia, shorts: E.PAL.folha, build: 'regular', skin: E.GENTE.peleEscura } },
    PISTAS: { 1: ['D04', 'D05', 'D06'], 2: ['D07'] },
    CENARIO,
    PLANOS: {},
    PORQUE: { 1: porqueDengue, 2: porqueOropouche, 3: porqueMalaria },
    APS: aps,
    PREVENCAO: prevencao,
  };
})();
