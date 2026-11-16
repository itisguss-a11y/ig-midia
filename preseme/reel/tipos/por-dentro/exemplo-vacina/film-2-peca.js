// PRESEME · motor "por dentro" · desenho 2/3 · a peça: como a vacina ensina o corpo (exemplo do tipo)
// texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos
// Os níveis: por fora (a sala de vacina; depois, a rua), o braço (o músculo com o micróbio enfraquecido), as células (os
// linfócitos B e T, o plasmócito que fabrica o anticorpo e, na volta, as células de memória) e o anticorpo (o Y que se liga
// ao antígeno, e o micróbio de outra forma que não encaixa). O que é do lugar e da gente vem da biblioteca (B.*); o que é
// do corpo por dentro vem do film-0-corpo.js (C.*). Todo desenho é função do tempo; palavra vem do textos.txt.
(function () {
  const U = globalThis.U, E = globalThis.ESTILOS, B = globalThis.BIB, C = globalThis.CORPO;
  const ease = U.ease, cl = U.clamp, lerp = U.lerp;
  const ds = (st, n) => (st.desde && st.desde[n] != null ? st.desde[n] : -1);
  const ap = (st, n, d = 0.5, de = 0) => cl((ds(st, n) - de) / d, 0, 1); // 0 a 1: o quanto algo da frase n já entrou
  const rotulo = (ctx, M, txt, x, y, { align = 'left', size = 40, alpha = 1, cor = 'texto' } = {}) => { if (alpha > 0) M.escrever(ctx, txt, x, y, { size, papel: 'mao', align, cor, alpha }); };
  const naRua = (st) => ['depois', 'prevencao', 'fecho'].includes(st.c && st.c.id);

  // ---------- por fora ----------
  const CHAO = 1130;
  const PACIENTE = { quem: 'calouro', pele: 'media', penteado: 'crespo', corRoupa: 'apoio' };
  function ubs(ctx, st, M) {
    // plano médio: o chão fica abaixo da janela, e a gente aparece grande, do joelho para cima
    const chao = 1330;
    B.sala(ctx, { chao, quadro: false }); C.local(null);
    const m = B.mesa(ctx, { x: 870, y: chao, w: 230, h: 330 });
    B.frascoVacina(ctx, { x: 850, y: m.topo, s: 1.05 });
    B.pessoa(ctx, Object.assign({ x: 285, y: chao, s: 2.1, look: 0.6 }, PACIENTE));
    B.pessoa(ctx, { quem: 'enfermeira', x: 735, y: chao, s: 2.1, look: -0.7 });
    // a seringa no braço do paciente (a agulha aponta para a esquerda); o êmbolo desce com a frase 1
    B.seringa(ctx, { x: 555, y: 985, rot: Math.PI, s: 0.85, k: ap(st, 1, 2.0, 1.0) });
    // a frase 2: o micróbio enfraquecido, saindo do frasco
    const k2 = ap(st, 2, 0.6, 0.2);
    if (k2 > 0) {
      E.linha(ctx, [[850, m.topo - 190], [858, 640], [836, 560]], { lw: 5, k: k2, seed: 15, tracejado: true });
      C.microbio(ctx, { x: 820, y: 480, r: 58, fraco: true, k: ease.outBack(k2), rot: st.t * 0.3, seed: 820 });
    }
  }
  function rua(ctx, st, M) {
    B.rua(ctx, { chao: CHAO, numeros: ['', '', ''] }); C.local(null);
    const k14 = ap(st, 14, 0.6, 0.2);
    // a frase 14: mais gente vacinada em volta (o visto em cima de cada um)
    if (k14 > 0) {
      for (const [x, quem, i] of [[190, 'idosa', 0], [770, 'medica', 1]]) {
        B.pessoa(ctx, { quem, x, y: CHAO, s: 1.0, alpha: k14, look: x < 400 ? 0.4 : -0.4 });
        B.visto(ctx, { x, y: CHAO - 520, k: ease.outBack(cl(k14 * 1.4 - i * 0.3, 0, 1)) });
      }
    }
    B.pessoa(ctx, Object.assign({ x: 470, y: CHAO, s: 1.1, look: 0.4 }, PACIENTE));
    if (k14 > 0) B.visto(ctx, { x: 470, y: CHAO - 560, k: ease.outBack(cl(k14 * 1.4 - 0.15, 0, 1)) });
    // as frases 10 e 11: o micróbio de verdade chega, e os anticorpos saem na hora e se ligam a ele
    const k10 = ap(st, 10, 2.4), k11 = ap(st, 11, 1.0, 0.2), fim = ap(st, 12, 0.6);
    for (let i = 0; i < 4; i++) {
      const x0 = 1020 + i * 60, y0 = 520 + i * 95, x1 = 610 + (i % 2) * 70, y1 = 610 + i * 85;
      let x = lerp(x0, x1, ease.outCubic(k10)), y = lerp(y0, y1, ease.outCubic(k10)) + Math.sin(st.t * 2 + i) * 6;
      if (k14 > 0) { x += k14 * 420; } // na comunidade vacinada, ele vai embora
      const some = 1 - fim * 0.6;
      if (k10 <= 0) continue;
      C.microbio(ctx, { x, y, r: 30, k: ease.outBack(cl(k10 * 3 - i * 0.3, 0, 1)), rot: st.t * 0.4 + i, alpha: some, seed: 830 + i * 3 });
      if (k11 > 0) for (let j = 0; j < 3; j++) {
        const a = -2.4 + j * 0.9 + i, px = x + Math.cos(a) * 62, py = y + Math.sin(a) * 62;
        const sx = 490, sy = 930, u = ease.outCubic(cl(k11 * 1.6 - j * 0.2, 0, 1));
        C.anticorpo(ctx, { x: lerp(sx, px, u), y: lerp(sy, py, u), s: 0.36, rot: a - Math.PI / 2 + Math.PI, alpha: some, seed: 860 + i * 3 + j });
      }
    }
    // a frase 12: a régua do tempo, no alto (a vacina antes, o tempo de fabricar o anticorpo e só depois a exposição)
    const k12 = ap(st, 12, 0.5, 0.1);
    if (k12 > 0 && ds(st, 13) < 0.3) {
      ctx.save(); ctx.globalAlpha *= k12 * cl((0.3 - ds(st, 13)) / 0.3, 0, 1);
      E.ret(ctx, 110, 370, 780, 250, { papel: 'superficie', r: 26, seed: 870 });
      B.seringa(ctx, { x: 250, y: 495, s: 0.55, k: 1 });
      E.seta(ctx, [360, 495], [460, 495], { lw: 6, seed: 871 });
      B.relogio(ctx, { x: 540, y: 495, r: 70, frac: cl(ds(st, 12) / 3, 0, 1) });
      E.seta(ctx, [625, 495], [720, 495], { lw: 6, seed: 872 });
      C.microbio(ctx, { x: 790, y: 495, r: 36, seed: 873 });
      ctx.restore();
    }
    // a frase 13: a caderneta com duas doses marcadas e a terceira a fazer
    const k13 = ap(st, 13, 0.5, 0.1);
    if (k13 > 0 && ds(st, 14) < 0.3) {
      ctx.save(); ctx.globalAlpha *= cl((0.3 - ds(st, 14)) / 0.3, 0, 1);
      B.cartaoVacina(ctx, { x: 700, y: 760, s: 1.05 * ease.outBack(k13), marcadas: ds(st, 13) > 1.4 ? [0, 1] : [0] });
      ctx.restore();
    }
  }

  // ---------- o braço por dentro ----------
  function braco(ctx, st, M) {
    C.pele(ctx, { y0: 330, y1: 440 });
    C.musculo(ctx, { y0: 440, y1: 1180, fibras: 7 });
    const v = C.vaso(ctx, { de: [-100, 1080], ate: [1100, 880], larg: 120, t: st.t });
    // a agulha sai assim que a câmera chega; o micróbio enfraquecido se espalha a partir da ponta
    const kv = ap(st, 3, 1.6, -1.2);
    if (kv < 0.5) E.linha(ctx, [[380, 140], [380, lerp(640, 300, cl(kv * 2, 0, 1))]], { lw: 12, seed: 701 });
    const pos = [[380, 640], [300, 700], [470, 690], [250, 600], [520, 610], [420, 800], [610, 760]];
    pos.forEach(([x, y], i) => {
      const u = ease.outCubic(kv), dx = (x - 380) * u, dy = (y - 640) * u;
      C.microbio(ctx, { x: 380 + dx + Math.sin(st.t * 0.9 + i) * 8, y: 640 + dy + Math.cos(st.t * 0.8 + i) * 8, r: 30, fraco: true, rot: i + st.t * 0.2, seed: 710 + i * 3 });
    });
    // a frase 3: o nome do que o corpo estranha
    const k3 = ap(st, 3, 0.5, 0.4);
    if (k3 > 0) { E.seta(ctx, [640, 530], [545, 600], { lw: 6, k: k3, seed: 730 }); rotulo(ctx, M, M.D('D05'), 652, 535, { alpha: k3 }); }
    // a frase 4: uma célula de defesa sai do sangue e encosta no micróbio (a porta das células)
    const k4 = ap(st, 4, 1.6, 0.2);
    const cx = lerp(760, 690, ease.inOutCubic(k4)), cy = lerp(990, 800, ease.inOutCubic(k4));
    C.celula(ctx, { x: cx, y: cy, r: 64, tipo: 'defesa', seed: 740, alpha: ds(st, 4) > -0.5 ? 1 : 0.0 });
    if (k4 >= 1) E.circulo(ctx, 640, 772, 22 + 6 * Math.sin(st.t * 6), { papel: null, tinta: 'destaque', lw: 6, seed: 741, sombra: false, hachura: false });
  }

  // ---------- as células ----------
  function celulas(ctx, st, M) {
    C.plasma(ctx);
    const m6 = ap(st, 6, 1.0, 0.9); // o linfócito B virando plasmócito
    const bx = lerp(330, 380, ease.inOutCubic(ap(st, 6, 0.9))), by = 720;
    // os anticorpos que o plasmócito fabrica (saem dele e se espalham)
    const kA = ap(st, 6, 2.6, 1.6);
    if (kA > 0) for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + 0.3, d = 190 + 230 * ease.outCubic(cl(kA * 1.5 - (i % 5) * 0.12, 0, 1)) + (i % 3) * 30;
      C.anticorpo(ctx, { x: bx + Math.cos(a) * d, y: by + Math.sin(a) * d * 0.9, s: 0.42, rot: a + Math.PI / 2 + Math.sin(st.t + i) * 0.3, seed: 760 + i });
    }
    // o antígeno, entre os dois linfócitos (é a porta do anticorpo: um anticorpo se liga a ele)
    C.microbio(ctx, { x: 600, y: 860, r: 44, fraco: true, rot: st.t * 0.25, seed: 790 });
    if (kA > 0.4) C.anticorpo(ctx, { x: 560, y: 935, s: 0.42, rot: -0.55, seed: 795 });
    C.celula(ctx, { x: 720, y: 540, r: 100, tipo: 'T', seed: 780 });
    if (m6 < 1) C.celula(ctx, { x: bx, y: by, r: 120, tipo: 'B', alpha: 1 - m6, seed: 770 });
    if (m6 > 0) C.celula(ctx, { x: bx, y: by, r: 120, tipo: 'plasmocito', alpha: m6, seed: 775 });
    // os nomes (frase 5) e o plasmócito (frase 6)
    const k5 = ap(st, 5, 0.5, 0.3);
    rotulo(ctx, M, M.D('D06'), bx, by - 178, { alpha: k5 * (1 - m6), align: 'center' });
    rotulo(ctx, M, M.D('D08'), bx, by + 205, { alpha: m6, align: 'center' });
    rotulo(ctx, M, M.D('D07'), 720, 700, { alpha: k5 * (1 - ap(st, 6, 0.3)), align: 'center' });
    rotulo(ctx, M, M.D('D05'), 600, 962, { alpha: ap(st, 5, 0.5, 0.8), align: 'center' });
    // a frase 9 (na volta): as células de memória
    const k9 = ap(st, 9, 0.5, 0.2);
    if (k9 > 0) {
      [[200, 1040], [370, 1090], [860, 760]].forEach(([x, y], i) => C.celula(ctx, { x, y, r: 62, tipo: 'memoria', k: ease.outBack(cl(k9 * 1.6 - i * 0.25, 0, 1)), seed: 800 + i * 5 }));
      rotulo(ctx, M, M.D('D10'), 500, 1110, { alpha: k9 });
    }
  }

  // ---------- o anticorpo ----------
  function anticorpo(ctx, st, M) {
    C.plasma(ctx, { papel: 'superficie' });
    // o antígeno grande, no alto à direita; a espícula 5 aponta para baixo e para a esquerda (é onde o anticorpo se liga)
    const ag = { x: 620, y: 560, r: 110, s: 1, rot: 0.1 }, esp = 10, j = 3;
    C.microbio(ctx, Object.assign({ fraco: true, espinhos: esp, seed: 850 }, ag));
    const a = (j / esp) * Math.PI * 2 + 0.2 + ag.rot, kn = [ag.x + Math.cos(a) * ag.r * 1.45, ag.y + Math.sin(a) * ag.r * 1.45];
    // o anticorpo grande sobe até a ponta direita dele encostar na espícula (frase 7)
    const s = 2.5, th = 0.15;
    const alvo = [kn[0] - (52 * Math.cos(th) + 62 * Math.sin(th)) * s, kn[1] - (52 * Math.sin(th) - 62 * Math.cos(th)) * s];
    const k7 = ease.inOutCubic(ap(st, 7, 1.2, 0.4));
    const y = { x: lerp(alvo[0] - 160, alvo[0], k7), y: lerp(alvo[1] + 260, alvo[1], k7) };
    const yk = C.anticorpo(ctx, { x: y.x, y: y.y, s, rot: th, lw: 16, seed: 860 });
    if (k7 >= 1) { const f = cl((ds(st, 7) - 1.6) / 0.5, 0, 1); E.circulo(ctx, kn[0], kn[1], 26 + 30 * f, { papel: null, tinta: 'destaque', lw: 7, alpha: 1 - f * 0.6, seed: 861, sombra: false, hachura: false }); }
    // a frase 8: um micróbio de outra forma chega à ponta esquerda e não encaixa (bate e volta, com o x)
    const d8 = ds(st, 8);
    if (d8 > 0) {
      const pl = yk.pontas[0], ida = ease.outCubic(cl((d8 - 0.3) / 1.5, 0, 1)), volta = ease.outCubic(cl((d8 - 1.9) / 0.8, 0, 1));
      const ox = pl[0] - 64, oy = pl[1] - 86, dx = lerp(-260, 0, ida) - volta * 130, dy = lerp(-150, 0, ida) - volta * 70;
      C.microbio(ctx, { x: ox + dx, y: oy + dy, r: 60, forma: 'quadrado', papel: 'destaque', espinhos: 8, rot: 0.3, seed: 880 });
      if (d8 > 1.9) { const kx = cl((d8 - 1.9) / 0.3, 0, 1); E.linha(ctx, [[pl[0] - 28, pl[1] - 28], [pl[0] + 28, pl[1] + 28]], { papel: 'alerta', lw: 11, k: kx, seed: 881 }); E.linha(ctx, [[pl[0] + 28, pl[1] - 28], [pl[0] - 28, pl[1] + 28]], { papel: 'alerta', lw: 11, k: cl(kx * 2 - 1, 0, 1), seed: 882 }); }
    }
    rotulo(ctx, M, M.D('D09'), alvo[0] + 50, alvo[1] + 200, { alpha: k7 >= 0.9 ? ap(st, 7, 0.4, 1.4) : 0 });
    rotulo(ctx, M, M.D('D05'), 620, 372, { alpha: ap(st, 7, 0.5, 0.2), align: 'center' });
  }

  globalThis.PECA = {
    // o trecho de cada frase que leva o marca-texto (o número é o da frase no textos.txt)
    DESTAQUE: { 1: 'ensina', 2: 'enfraquecido ou morto', 3: 'antígeno', 5: 'linfócitos', 6: 'o anticorpo', 7: 'se ligam ao antígeno', 8: 'específico', 9: 'células de memória', 10: 'preparado', 12: 'antes', 13: 'mais de uma dose', 14: 'circula menos', 15: 'lembra depois' },
    // onde mora o nível seguinte: o ombro do paciente (na UBS e na rua), o encontro da célula com o micróbio, o anticorpo
    // que se liga ao antígeno
    PORTA: {
      fora: (st) => (naRua(st) ? { x: 490, y: 930, r: 62 } : { x: 405, y: 985, r: 66 }),
      braco: { x: 640, y: 772, r: 72 },
      celulas: { x: 588, y: 900, r: 70 },
    },
    NIVEL: {
      fora: (ctx, st, M) => (naRua(st) ? rua(ctx, st, M) : ubs(ctx, st, M)),
      braco,
      celulas,
      anticorpo,
    },
  };
})();
