// PRESEME · motor "história natural" · desenho 2/3 · o que é só da peça · EXEMPLO: o Oropouche na vida da Dona Rita
// (texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 e pela conferência dos fatos)
// Seis cartões, um por fase: a roça perto da mata (e o número de Roraima), a picada do maruim (na lupa), a incubação (o vírus
// se multiplicando na lupa, sem nada por fora), os sinais (febre, dor, e a dúvida com a dengue), o exame (o sangue, o vírus
// achado, a notificação) e o fim (a melhora e a volta dos sintomas em até 6 de cada 10).
// Desenhos novos que podem ir para a biblioteca: maruim(), planta() da roça, tubo() de exame e gente10() (a grade de 10).
(function () {
  const U = globalThis.U, G = globalThis.G, E = globalThis.ESTILOS, B = globalThis.BIB, M = globalThis.HIST;
  const { D } = M;
  const PEC = { DESTAQUE: {}, CARTAO: {}, CENA: {} };
  globalThis.PECA = PEC;

  // o trecho de cada frase que leva marca-texto (o termo que cai na prova)
  PEC.DESTAQUE = { 1: 'dia a dia', 2: 'história natural', 4: '138 casos', 5: 'o maruim', 6: 'incubação', 7: 'febre de repente', 8: 'Parece dengue', 9: 'o exame acha', 10: 'notificado', 11: 'de 2 a 7 dias', 12: 'de volta', 13: 'antes da picada', 14: 'achar cedo' };

  const { ap, tf, texto, chao, virus, documento } = M.KIT;
  // a Dona Rita, igual em todos os cartões (a régua é a vida dela)
  const RITA = { quem: 'moradora', pele: 'media', penteado: 'coque', roupa: 'camiseta', corRoupa: 'coral', calca: 'bermuda', corCalca: 'apoioEscuro' };
  const rita = (ctx, o) => B.pessoa(ctx, Object.assign({}, RITA, { pose: 'stand', s: 0.6, look: 0.3 }, o));

  // ---------- desenhos novos desta peça (candidatos à biblioteca) ----------
  // o maruim (mosquito-pólvora): o inseto minúsculo, de asa larga e pintada; x, y o centro; s o tamanho; t bate as asas
  function maruim(ctx, x, y, s = 1, t = 0, seed = 950) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const bate = Math.sin(t * 40) * 0.12;
    for (const lado of [-1, 1]) { // as asas, largas, com as manchas
      ctx.save(); ctx.rotate(lado * (0.55 + bate));
      const asa = []; for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; asa.push([lado * (34 + 30 * Math.cos(a)), -6 + 15 * Math.sin(a)]); }
      E.poligono(ctx, asa, { papel: 'superficie', seed: seed + (lado > 0 ? 1 : 2), sombra: false });
      for (const [dx, dy] of [[24, -8], [40, -2], [54, -10]]) E.circulo(ctx, lado * dx, dy, 4.5, { papel: 'apoioEscuro', seed: seed + dx, sombra: false, contorno: false });
      ctx.restore();
    }
    for (let i = 0; i < 3; i++) for (const lado of [-1, 1]) E.linha(ctx, [[lado * 6, 4 + i * 7], [lado * (24 + i * 4), 22 + i * 10], [lado * (28 + i * 4), 36 + i * 10]], { lw: 3, seed: seed + 20 + i });
    E.circulo(ctx, 0, 6, 13, { papel: 'tinta', seed: seed + 30, sombra: false }); // o corpo
    E.circulo(ctx, 0, -12, 8, { papel: 'tinta', seed: seed + 31, sombra: false }); // a cabeça
    E.linha(ctx, [[0, -18], [0, -34]], { lw: 3, seed: seed + 32 }); // a tromba
    ctx.restore();
  }
  // uma planta da roça (a rama: o caule e duas folhas)
  function planta(ctx, x, y, h = 70, seed = 970) {
    E.linha(ctx, [[x, y], [x, y - h]], { lw: 4, seed, papel: 'apoioEscuro' });
    for (const lado of [-1, 1]) {
      const f = []; for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; f.push([x + lado * (18 + 16 * Math.cos(a)), y - h * 0.62 + 7 * Math.sin(a) - lado * 6]); }
      E.poligono(ctx, f, { papel: 'apoio', seed: seed + lado + 2, sombra: false });
    }
  }
  // o tubo de exame com sangue, em pé; k: o quanto está cheio
  function tubo(ctx, x, y, k = 1, seed = 990) {
    E.ret(ctx, x - 22, y - 150, 44, 150, { papel: 'superficie', r: 20, seed, sombra: false });
    if (k > 0) E.ret(ctx, x - 16, y - 8 - 110 * k, 32, 110 * k, { papel: 'alerta', r: 14, seed: seed + 1, sombra: false, contorno: false });
    E.ret(ctx, x - 26, y - 170, 52, 30, { papel: 'apoioEscuro', r: 6, seed: seed + 2, sombra: false });
  }
  // a grade de 10 pessoas (bonequinhos), com as n primeiras acesas
  function gente10(ctx, x, y, n, k = 1, seed = 1000) {
    for (let i = 0; i < 10; i++) {
      const cx = x + (i % 5) * 62, cy = y + Math.floor(i / 5) * 92, on = i < n && k > i / 10;
      const papel = on ? 'alerta' : 'apoio';
      E.circulo(ctx, cx, cy, 15, { papel, seed: seed + i, sombra: false });
      E.ret(ctx, cx - 18, cy + 20, 36, 46, { papel, r: 14, seed: seed + 20 + i, sombra: false });
    }
  }
  const pele = (ctx, x, y, w, h, seed) => E.ret(ctx, x, y, w, h, { papel: 'pele', r: h / 2, seed, sombra: false });

  // ---------- os cartões ----------
  const C = PEC.CARTAO;
  const PISO = 476;

  // antes de pegar: a Dona Rita na roça, perto da mata; na 2ª frase, o número de Roraima
  C.antes = (ctx, box, st, info) => {
    chao(ctx, PISO);
    B.arvore(ctx, { x: 690, y: PISO, h: 330, tipo: 'copa', seed: 761 });
    B.arvore(ctx, { x: 560, y: PISO, h: 380, tipo: 'buriti', seed: 762 });
    for (let i = 0; i < 6; i++) planta(ctx, 290 + i * 46, PISO, 64 + (i % 2) * 10, 970 + i * 3);
    rita(ctx, { x: 170, y: PISO, look: 0.5, mouth: 'smile' });
    const k = info.cena === 'abertura' ? 0 : ap(info, 1, 0.5);
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha *= k;
    E.ret(ctx, 350, 22, 410, 330, { papel: 'superficie', r: 14, seed: 771, sombra: true });
    B.mapaRR(ctx, { x: 362, y: 40, w: 140, h: 230, base: 'apoio', destaques: {}, k: 1 });
    texto(ctx, D('D19'), 432, 314, { papel: 'mao', size: 36 });
    texto(ctx, D('D20'), 630, 150, { papel: 'numero', size: 92 });
    texto(ctx, D('D21'), 630, 214, { papel: 'mao', size: 36 });
    texto(ctx, D('D22'), 630, 258, { papel: 'mao', size: 36 });
    ctx.restore();
  };

  // a picada (dia 0): o braço, o maruim pequeno nele e, na lupa, o maruim grande; o vírus entra
  C.picada = (ctx, box, st, info) => {
    const k = ap(info, 0, 0.6);
    pele(ctx, -40, 330, 640, 120, 801); // o braço
    E.ret(ctx, 560, 300, 260, 180, { papel: 'coral', r: 30, seed: 802, sombra: false }); // a manga da camiseta
    const px = 300, py = 334;
    maruim(ctx, px, py - 6, 0.32, info.t, 951);
    for (let i = 0; i < 4; i++) virus(ctx, px - 30 + i * 22, py + 34 + (i % 2) * 22, 9, { k: ap(info, 0, 0.4, 0.8 + i * 0.25), seed: 910 + i * 30, giro: i });
    B.lupa(ctx, { x: 420, y: 160, r: 128, cabo: 0.6, dentro: (c) => maruim(c, 420, 170, 1.15, info.t, 952) });
    texto(ctx, D('D23'), 150, 140, { papel: 'mao', size: 44 });
    B.tracejado(ctx, { de: [200, 162], ate: [300, 162], k: Math.max(0.01, k) });
  };

  // a incubação (3 a 8 dias): por fora, a Dona Rita normal; na lupa, o vírus se multiplicando; o calendário corre
  C.incubacao = (ctx, box, st, info) => {
    chao(ctx, PISO);
    rita(ctx, { x: 190, y: PISO, look: 0.2, mouth: 'smile' });
    const kt = tf(info, 0);
    const dias = Math.min(8, Math.floor(kt * 1.6));
    B.calendario(ctx, { x: 600, y: 330, s: 0.62, marcados: Array.from({ length: dias + 1 }, (_, i) => i), titulo: '', k: 1 });
    const n = Math.min(14, 2 + Math.floor(kt * 3));
    B.lupa(ctx, { x: 420, y: 170, r: 118, cabo: 2.4, dentro: (c) => {
      E.ret(c, 290, 40, 260, 260, { papel: 'pele', r: 0, seed: 811, sombra: false, contorno: false });
      for (let i = 0; i < n; i++) virus(c, 340 + ((i * 53) % 170), 90 + ((i * 37) % 160), 13, { k: 1, seed: 920 + i * 7, giro: i * 0.7 + info.t });
    } });
  };

  // os sinais: febre de repente, dor de cabeça, dor no corpo e nas juntas; na 2ª frase, a dúvida com a dengue
  C.sinais = (ctx, box, st, info) => {
    chao(ctx, PISO);
    const x = 200;
    rita(ctx, { x, y: PISO, look: 0, mouth: 'wavy', eyes: 'worried' });
    const kd = ap(info, 0, 0.5, 0.4);
    if (kd > 0) {
      ctx.save(); ctx.globalAlpha *= kd;
      for (const [dx, dy, a] of [[-40, -330, -2.4], [40, -330, -0.7], [0, -350, -1.57], [-70, -150, 3.1], [62, -60, 0], [-38, -40, 3.1]]) B.dor(ctx, { x: x + dx, y: PISO + dy, a, tam: 40 });
      ctx.restore();
    }
    B.termometro(ctx, { x: 500, y: 140, s: 1.1, febre: true });
    const k2 = ap(info, 1, 0.5);
    if (k2 > 0) {
      ctx.save(); ctx.globalAlpha *= k2;
      E.ret(ctx, 400, 240, 340, 210, { papel: 'superficie', r: 14, seed: 821, sombra: true });
      B.mosquito(ctx, { x: 500, y: 350, s: 0.55, listras: true, t: info.t });
      texto(ctx, D('D24'), 640, 360, { papel: 'mao', size: 44 });
      ctx.restore();
    }
  };

  // o exame: o sangue no tubo, o vírus achado; na 2ª frase, a notificação (todo caso) e o cuidado
  C.exame = (ctx, box, st, info) => {
    const k0 = ap(info, 0, 0.6), kv = ap(info, 0, 0.4, 1.0);
    B.seringa(ctx, { x: 150, y: 150, s: 0.9, k: 1 - k0, liquido: 'alerta' });
    tubo(ctx, 150, 470, k0, 991);
    B.lupa(ctx, { x: 330, y: 300, r: 92, cabo: 0.7, dentro: (c) => { virus(c, 315, 290, 18, { k: kv, seed: 940 }); virus(c, 355, 325, 13, { k: kv, seed: 960, giro: 1 }); } });
    if (kv > 0.6) B.visto(ctx, { x: 330, y: 160, k: (kv - 0.6) / 0.4 });
    const k1 = ap(info, 1, 0.5);
    if (k1 > 0) {
      ctx.save(); ctx.globalAlpha *= k1;
      documento(ctx, 480, 60, 260, 300, D('D25'), { seed: 830, linhas: 4, tam: 40 });
      B.pessoa(ctx, { quem: 'medica', pose: 'stand', x: 610, y: PISO, s: 0.42, look: -0.4 });
      ctx.restore();
    }
  };

  // o fim: na maioria, passa em 2 a 7 dias; em até 6 de cada 10, os sintomas voltam de 1 a 2 semanas depois
  C.fim = (ctx, box, st, info) => {
    chao(ctx, PISO);
    const volta = info.fase >= 1;
    rita(ctx, { x: 170, y: PISO, look: 0.4, mouth: volta ? 'flat' : 'smile', gesture: volta ? null : 'thumbsUp' });
    const k1 = ap(info, 1, 0.6);
    if (k1 <= 0) { B.visto(ctx, { x: 470, y: 230, s: 1.4, k: ap(info, 0, 0.5) }); return; }
    ctx.save(); ctx.globalAlpha *= k1;
    gente10(ctx, 370, 150, 6, ap(info, 1, 1.2, 0.3), 1000);
    texto(ctx, D('D26'), 495, 106, { papel: 'mao', size: 44 });
    B.tracejado(ctx, { de: [700, 340], ate: [600, 420], k: ap(info, 1, 0.6, 0.8) });
    B.termometro(ctx, { x: 560, y: 450, s: 0.6, febre: true });
    ctx.restore();
  };
})();
