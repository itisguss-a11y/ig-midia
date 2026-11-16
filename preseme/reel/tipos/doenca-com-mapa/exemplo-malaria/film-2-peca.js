// PRESEME · Doença de Roraima · exemplo: malária · desenho 2/3 · o que é só desta peça
// O chat 1 (Fable) escreve este arquivo para cada peça: os destaques do texto e o desenho de cada cena
// (o vetor, o ciclo, os ícones da prevenção e dos sinais). O molde (film-1-molde.js) põe em volta o texto,
// o rótulo da série, o selo de Roraima, o mapa e os números. Cores e letras vêm do kit (E.cor, E.texto).
(function () {
  const U = globalThis.U, G = globalThis.G, E = globalThis.ESTILOS, M = globalThis.DRR, SC = globalThis.SCORE;
  const { L, R, TOP, CX, D, cor, escrever } = M;

  const DESTAQUE = { 1: 'doença de Roraima', 4: '1 em cada 5', 5: 'região amazônica', 6: 'Alto Alegre e Amajari', 7: 'fêmea do mosquito Anopheles', 8: 'não passa direto', 9: 'Não existe vacina', 10: 'contra a picada', 11: 'criadouros', 12: 'sintomas mais comuns', 13: 'exame de sangue', 14: 'de graça no SUS', 15: 'toda semana', 16: 'em até 24 horas', 17: 'a prevenção também é daqui' };

  // ---------- o mosquito (fêmea de Anopheles: o corpo inclinado, as asas compridas, as patas finas) ----------
  function mosquito(ctx, x, y, { s = 1, rot = -0.55, t = 0, seed = 300 } = {}) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    const bate = Math.sin(t * 60) * 0.35; // as asas batem rápido
    for (const sd of [-1, 1]) G.poly(ctx, [[-6, -4], [70, -46 + sd * 8 + bate * 30 * sd], [96, -30 + sd * 6], [10, 4]], { fill: cor('apoio'), stroke: cor('tinta'), lw: 3, seed: seed + sd, alpha: 0.55 });
    G.ellipse(ctx, 34, 0, 56, 12, { fill: cor('apoioEscuro'), stroke: cor('tinta'), lw: 4, seed: seed + 3 }); // abdome
    G.ellipse(ctx, -26, -2, 20, 15, { fill: cor('apoioEscuro'), stroke: cor('tinta'), lw: 4, seed: seed + 4 }); // tórax
    G.ellipse(ctx, -52, 2, 11, 10, { fill: cor('apoioEscuro'), stroke: cor('tinta'), lw: 4, seed: seed + 5 }); // cabeça
    G.line(ctx, [[-60, 6], [-104, 22]], { color: cor('tinta'), lw: 3.5, seed: seed + 6 }); // a tromba
    for (let i = 0; i < 3; i++) for (const sd of [-1, 1]) G.line(ctx, [[-30 + i * 12, 8], [-40 + i * 22 + sd * 6, 46 + i * 6], [-50 + i * 30 + sd * 10, 80 + i * 4]], { color: cor('tinta'), lw: 2.5, seed: seed + 10 + i * 2 + (sd > 0 ? 1 : 0) });
    ctx.restore();
  }
  // o parasita, visto de perto (desenho de ícone: anéis pequenos dentro de um círculo)
  function parasita(ctx, x, y, r, seed = 320) {
    E.circulo(ctx, x, y, r, { papel: 'superficie', seed });
    for (let i = 0; i < 5; i++) {
      const a = i * 1.26 + 0.4, d = r * 0.45;
      G.ellipse(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, r * 0.16, r * 0.16, { fill: null, stroke: cor('alerta'), lw: 4, seed: seed + i });
      G.ellipse(ctx, x + Math.cos(a) * d + r * 0.08, y + Math.sin(a) * d - r * 0.05, r * 0.05, r * 0.05, { fill: cor('alerta'), stroke: null, lw: 0, seed: seed + 9 + i });
    }
  }
  function gente(ctx, x, y, s, o = {}) { return E.personagem(ctx, Object.assign({ x, y, s, pose: 'stand', quem: 'calouro' }, o)); }

  // ---------- as cenas ----------
  const C = M.CENA;
  // a pergunta: o mapa de Roraima grande e o mosquito que atravessa a tela no primeiro segundo
  C.abertura = (ctx, st) => {
    M.mapaRR(ctx, { x: L + 80, y: 820, w: R - L - 160, h: 600 }, { referencia: null });
    M.bloco(ctx, 1, { baseY: 640, sizes: [86, 78, 70], maxLinhas: [3, 3, 3], papel: 'titulo' });
    const u = st.u, x = -120 + u * 420, y = 1180 - Math.sin(u * 3) * 80;
    mosquito(ctx, x, y, { s: 1.1, rot: -0.2, t: st.t });
  };
  // o número: o Brasil, Roraima e "1 em cada 5"
  C.numero = (ctx, st) => {
    const t = st.t, c = st.c, [f2, f3, f4] = c.itens;
    M.selo(ctx);
    if (f2) {
      escrever(ctx, D('D01'), CX, 470, { size: 50, papel: 'mao', align: 'center' });
      M.contador(ctx, M.numeroDe(SC.TX[f2.n]) || 0, CX, 640, t, f2.t0, { size: 150 });
      escrever(ctx, D('D14'), CX, 720, { size: 38, papel: 'mao', align: 'center', cor: 'apoio' });
    }
    if (f3 && t >= f3.t0) {
      escrever(ctx, D('D02'), CX, 880, { size: 50, papel: 'mao', align: 'center', cor: 'destaque' });
      M.contador(ctx, M.numeroDe(SC.TX[f3.n]) || 0, CX, 1050, t, f3.t0, { size: 150, cor: 'destaque' });
    }
    if (f4 && t >= f4.t0) M.umEmCada(ctx, 5, L + 90, 1110, R - L - 180, t, f4.t0 + 0.4);
    M.bloco(ctx, st.it.n, { baseY: 1380, sizes: [52, 48, 44], maxLinhas: [2, 2, 3], alpha: st.aTexto, dy: st.dyTexto });
  };
  // onde: a parte do país (os cem quadradinhos e o número da frase); depois, os municípios de Roraima no mapa
  C.mapa = (ctx, st) => {
    const t = st.t, c = st.c, [f5, f6] = c.itens;
    if (!f6 || t < f6.t0) {
      const pct = M.numeroDe(SC.TX[f5.n]) || 0, x = CX - 230, y = 790; // tudo acima de 1.498 px (a área segura de baixo)
      M.cem(ctx, pct, x, y, 460, t, f5.t0 + 0.3);
      escrever(ctx, pct + '%', CX, y + 565, { size: 110, papel: 'numero', cor: 'destaque', align: 'center' });
      escrever(ctx, D('D15'), CX, y + 630, { size: 46, papel: 'mao', align: 'center' });
    } else {
      M.mapaRR(ctx, { x: L + 40, y: 800, w: R - L - 80, h: 640 }, { destaques: c.destaques, t, t0: f6.t0 });
    }
    M.bloco(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
  };
  // quem transmite: o mosquito grande pousando; a lente mostra o parasita dentro dele
  C.vetor = (ctx, st) => {
    const t = st.t, u = st.u;
    E.chao(ctx, 1400, { papel: 'apoioEscuro' });
    for (let i = 0; i < 4; i++) G.line(ctx, [[L - 40 + i * 90, 1400], [L + 10 + i * 90, 1160 - (i % 2) * 60], [L + 60 + i * 90, 1400]], { color: cor('apoio'), lw: 6, seed: 330 + i }); // o capim da beira
    for (let i = 0; i < 3; i++) G.line(ctx, [[-20, 1450 + i * 40], [W2() / 2, 1440 + i * 40 + 10], [W2() + 20, 1452 + i * 40]], { color: cor('apoio'), lw: 4, seed: 340 + i }); // o rio
    const k = U.ease.outCubic(U.clamp(u / 1.4, 0, 1)), x = U.lerp(-200, 470, k), y = U.lerp(860, 1050, k);
    mosquito(ctx, x, y, { s: 1.9, rot: -0.35, t });
    escrever(ctx, D('D08'), 470, 1250, { size: 48, papel: 'mao', align: 'center', cor: 'destaque', alpha: U.clamp((u - 1.2) / 0.3, 0, 1) });
    const kp = U.ease.outBack(U.clamp((u - 2.2) / 0.4, 0, 1));
    if (kp > 0) {
      ctx.save(); ctx.translate(R - 140, 930); ctx.scale(kp, kp);
      parasita(ctx, 0, 0, 92);
      ctx.restore();
      escrever(ctx, D('D09'), R - 140, 1080, { size: 42, papel: 'mao', align: 'center', alpha: U.clamp((u - 2.5) / 0.3, 0, 1) });
    }
    M.bloco(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
  };
  const W2 = () => G.W;
  // como pega: o mosquito pica a pessoa (pop); entre duas pessoas, a seta riscada
  C.ciclo = (ctx, st) => {
    const t = st.t, u = st.u;
    E.chao(ctx, 1400, { papel: 'apoioEscuro' });
    gente(ctx, L + 170, 1400, 0.95, { quem: 'moradora', eyes: u > 1.6 ? 'wide' : 'normal', mouth: u > 1.6 ? 'o' : 'smile' });
    gente(ctx, R - 170, 1400, 0.95, { quem: 'calouro', eyes: 'normal', mouth: 'flat', look: -0.6 });
    const k = U.clamp(u / 1.6, 0, 1), mx = U.lerp(CX + 40, L + 250, U.ease.inOutCubic(k)), my = U.lerp(860, 1080, U.ease.inOutCubic(k));
    mosquito(ctx, mx, my, { s: 0.9, rot: 0.2, t });
    if (u > 1.6) { const z = U.pulse(t, st.c.itens[0].t0 + 1.6, 6); E.circulo(ctx, L + 236, 1092, 18 + 30 * z, { papel: null, tinta: 'alerta', lw: 5, seed: 350, hachura: false }); }
    // de uma pessoa para outra, não passa: a seta e o X por cima
    const ks = U.clamp((u - 2.4) / 0.5, 0, 1);
    E.seta(ctx, [L + 290, 1250], [R - 290, 1250], { papel: 'apoio', k: ks, curva: -0.2, seed: 351 });
    if (u > 3.0) { const z = U.ease.outBack(U.clamp((u - 3.0) / 0.25, 0, 1)); ctx.save(); ctx.translate(CX, 1200); ctx.scale(z, z); G.line(ctx, [[-50, -50], [50, 50]], { color: cor('alerta'), lw: 22, seed: 352 }); G.line(ctx, [[50, -50], [-50, 50]], { color: cor('alerta'), lw: 22, seed: 353 }); ctx.restore(); }
    M.bloco(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
  };
  // como prevenir: a vacina riscada [09]; os quatro ícones contra a picada [10]; os dois do coletivo [11]
  function icone(ctx, tipo, x, y, k, seed) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    E.circulo(ctx, 0, 0, 92, { papel: 'superficie', seed });
    if (tipo === 'mosquiteiro') { E.ret(ctx, -60, 10, 120, 34, { papel: 'apoio', seed: seed + 1, r: 8 }); G.poly(ctx, [[0, -64], [-66, 14], [66, 14]], { fill: null, stroke: cor('tinta'), lw: 4, seed: seed + 2 }); for (let i = -2; i <= 2; i++) G.line(ctx, [[i * 12, -58], [i * 30, 12]], { color: cor('tinta'), lw: 2, seed: seed + 3 + i }); }
    if (tipo === 'roupa') { G.poly(ctx, [[-40, -52], [40, -52], [72, -10], [52, 4], [38, -14], [38, 56], [-38, 56], [-38, -14], [-52, 4], [-72, -10]], { fill: cor('apoio'), stroke: cor('tinta'), lw: 4, seed: seed + 1 }); }
    if (tipo === 'tela') { E.ret(ctx, -56, -56, 112, 112, { papel: 'apoio', seed: seed + 1, r: 6 }); for (let i = -40; i <= 40; i += 20) { G.line(ctx, [[i, -54], [i, 54]], { color: cor('tinta'), lw: 2, seed: seed + 5 + i }); G.line(ctx, [[-54, i], [54, i]], { color: cor('tinta'), lw: 2, seed: seed + 9 + i }); } }
    if (tipo === 'repelente') { E.ret(ctx, -26, -30, 52, 86, { papel: 'apoio', seed: seed + 1, r: 12 }); E.ret(ctx, -16, -52, 32, 24, { papel: 'destaque', seed: seed + 2, r: 6 }); for (let i = 0; i < 3; i++) G.ellipse(ctx, 40 + i * 14, -46 - i * 10, 5, 5, { fill: cor('tinta'), stroke: null, lw: 0, seed: seed + 3 + i }); }
    if (tipo === 'borrifacao') { E.poligono(ctx, [[-60, 50], [-60, -10], [-10, -54], [40, -10], [40, 50]], { papel: 'apoio', seed: seed + 1 }); for (let i = 0; i < 6; i++) G.ellipse(ctx, 48 + (i % 3) * 14, -30 + Math.floor(i / 3) * 16, 4, 4, { fill: cor('tinta'), stroke: null, lw: 0, seed: seed + 4 + i }); }
    if (tipo === 'criadouro') { G.ellipse(ctx, 0, 24, 70, 24, { fill: cor('apoio'), stroke: cor('tinta'), lw: 4, seed: seed + 1 }); E.poligono(ctx, [[-56, 26], [-20, -20], [20, -26], [56, 22]], { papel: 'apoioEscuro', seed: seed + 2 }); }
    ctx.restore();
  }
  C.prevencao = (ctx, st) => {
    const t = st.t, [f9, f10, f11] = st.c.itens;
    if (f9 && (!f10 || t < f10.t0)) {
      // a seringa, e o X por cima
      ctx.save(); ctx.translate(CX, 1080); ctx.rotate(-0.5);
      E.ret(ctx, -150, -36, 260, 72, { papel: 'superficie', seed: 360, r: 14 }); E.ret(ctx, 110, -12, 90, 24, { papel: 'apoio', seed: 361, r: 6 }); E.ret(ctx, -210, -46, 60, 92, { papel: 'apoioEscuro', seed: 362, r: 10 });
      ctx.restore();
      const z = U.ease.outBack(U.clamp((t - f9.t0 - 0.3) / 0.25, 0, 1));
      ctx.save(); ctx.translate(CX, 1080); ctx.scale(z, z); G.line(ctx, [[-170, -170], [170, 170]], { color: cor('alerta'), lw: 30, seed: 363 }); G.line(ctx, [[170, -170], [-170, 170]], { color: cor('alerta'), lw: 30, seed: 364 }); ctx.restore();
    } else if (!f11 || t < f11.t0) {
      // [10] a proteção de cada um: os quatro ícones, um por vez
      const t10 = f10 ? f10.t0 : 0;
      const quatro = [['mosquiteiro', L + 130, 960], ['roupa', R - 130, 960], ['tela', L + 130, 1240], ['repelente', R - 130, 1240]];
      quatro.forEach(([tipo, x, y], i) => icone(ctx, tipo, x, y, U.ease.outBack(U.clamp((t - t10 - 0.6 - 0.9 * i) / 0.3, 0, 1)), 370 + i * 10));
    } else {
      // [11] no coletivo (o quadro foi apagado): a borrifação e o criadouro, grandes, num quadro só deles
      [['borrifacao', CX - 200, 1110], ['criadouro', CX + 200, 1110]].forEach(([tipo, x, y], i) => icone(ctx, tipo, x, y, 1.3 * U.ease.outBack(U.clamp((t - f11.t0 - 0.5 - 0.8 * i) / 0.3, 0, 1)), 420 + i * 10));
    }
    M.bloco(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
  };
  // como reconhecer: os sintomas [12]; o exame de sangue [13]; o comprimido de graça no SUS [14]
  C.sinais = (ctx, st) => {
    const t = st.t, [f12, f13, f14] = st.c.itens;
    if (!f13 || t < f13.t0) {
      // a pessoa com febre: o termômetro e as gotas de suor; ela treme
      const tre = Math.sin(t * 40) * 3;
      gente(ctx, CX + tre, 1400, 1.05, { quem: 'moradora', eyes: 'closed', mouth: 'wavy', sweat: 1, brows: 'worried' });
      ctx.save(); ctx.translate(CX + 160, 1000); ctx.rotate(0.5);
      E.ret(ctx, -16, -110, 32, 200, { papel: 'superficie', seed: 380, r: 16 }); E.circulo(ctx, 0, 100, 30, { papel: 'alerta', seed: 381 }); E.ret(ctx, -7, -40, 14, 140, { papel: 'alerta', seed: 382, r: 6, contorno: false });
      ctx.restore();
      for (let i = 0; i < 3; i++) G.line(ctx, [[CX - 210 - i * 20, 980 + i * 50], [CX - 250 - i * 20, 990 + i * 50]], { color: cor('apoio'), lw: 6, seed: 383 + i });
    } else if (!f14 || t < f14.t0) {
      // a gota de sangue e a lâmina no microscópio: o parasita aparece
      E.poligono(ctx, [[L + 230, 900], [L + 300, 1020], [L + 230, 1080], [L + 160, 1020]], { papel: 'alerta', seed: 390 });
      E.seta(ctx, [L + 330, 1000], [CX + 40, 1000], { papel: 'apoio', seed: 391, k: U.clamp((t - f13.t0 - 0.4) / 0.4, 0, 1) });
      const kp = U.ease.outBack(U.clamp((t - f13.t0 - 0.8) / 0.4, 0, 1));
      if (kp > 0) { ctx.save(); ctx.translate(R - 180, 1010); ctx.scale(kp, kp); parasita(ctx, 0, 0, 130, 392); ctx.restore(); }
    } else {
      // a cartela de comprimidos e o "grátis no SUS"
      ctx.save(); ctx.translate(CX, 1060); ctx.rotate(-0.08);
      E.ret(ctx, -200, -130, 400, 260, { papel: 'superficie', seed: 400, r: 26 });
      for (let i = 0; i < 2; i++) for (let j = 0; j < 4; j++) E.circulo(ctx, -135 + j * 90, -50 + i * 100, 32, { papel: 'apoio', seed: 401 + i * 4 + j });
      ctx.restore();
      E.carimbo(ctx, D('D13'), CX + 120, 1290, { k: U.ease.outBack(U.clamp((t - f14.t0 - 0.5) / 0.3, 0, 1)), size: 54, papel: 'destaque' });
    }
    M.bloco(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
  };
  // quem notifica: o calendário da semana (Amazônia) e o relógio de 24 h (fora dela)
  C.notifica = (ctx, st) => {
    const t = st.t, [f15, f16] = st.c.itens;
    // calendário
    const cx1 = f16 && t >= f16.t0 ? L + 210 : CX, cy = 1080;
    ctx.save(); ctx.translate(cx1, cy);
    E.ret(ctx, -170, -150, 340, 300, { papel: 'superficie', seed: 410, r: 22 });
    E.ret(ctx, -170, -150, 340, 70, { papel: 'apoioEscuro', seed: 411, r: 22 });
    for (let i = 0; i < 7; i++) { const marcado = i === 0; E.ret(ctx, -150 + i * 44, -40, 36, 36, { papel: marcado ? 'destaque' : 'apoio', seed: 412 + i, r: 6 }); }
    escrever(ctx, D('D11'), 0, 70, { size: 44, papel: 'mao', align: 'center', cor: 'texto' });
    ctx.restore();
    escrever(ctx, D('D10'), cx1, cy + 210, { size: 44, papel: 'mao', align: 'center', cor: 'destaque' });
    if (f16 && t >= f16.t0) {
      const k = U.ease.outBack(U.clamp((t - f16.t0) / 0.35, 0, 1));
      ctx.save(); ctx.translate(R - 210, cy); ctx.scale(k, k);
      E.circulo(ctx, 0, 0, 150, { papel: 'superficie', seed: 420 });
      const a = (t * 2) % (Math.PI * 2);
      G.line(ctx, [[0, 0], [Math.cos(a - Math.PI / 2) * 110, Math.sin(a - Math.PI / 2) * 110]], { color: cor('alerta'), lw: 10, seed: 421 });
      G.line(ctx, [[0, 0], [0, -70]], { color: cor('tinta'), lw: 12, seed: 422 });
      ctx.restore();
      escrever(ctx, D('D12'), R - 210, cy + 210, { size: 44, papel: 'mao', align: 'center', cor: 'destaque' });
    }
    M.bloco(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
  };
  // o fecho: o mapa de Roraima de novo, com os ícones da prevenção em volta
  C.fecho = (ctx, st) => {
    const t = st.t;
    M.mapaRR(ctx, { x: L + 160, y: 860, w: R - L - 320, h: 520 }, { referencia: null });
    [['mosquiteiro', L + 90, 940], ['tela', R - 90, 940], ['repelente', L + 90, 1300], ['roupa', R - 90, 1300]].forEach(([tipo, x, y], i) => icone(ctx, tipo, x, y, 0.62 * U.ease.outBack(U.clamp((t - st.c.t0 - 0.4 - 0.25 * i) / 0.3, 0, 1)), 440 + i * 10));
    M.bloco(ctx, st.it.n, { baseY: 690, sizes: [64, 58, 54], maxLinhas: [3, 3, 4], papel: 'titulo' });
  };

  globalThis.PECA = { DESTAQUE, mosquito, parasita, icone };
})();
