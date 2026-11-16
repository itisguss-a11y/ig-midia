// PRESEME · carrossel · tabela comparativa · desenho 3 · peça de exemplo: malária, leishmaniose tegumentar e oncocercose.
// Os desenhos de cada coluna (os três insetos) e de cada célula que tem desenho próprio; o resto é do molde
// (film-2-moldes.js). Cada desenho é (ctx, cx, cy, s): centrado em cx, cy, em uns 240 × 200 px na escala 1.
// Da biblioteca: o mosquito (Anopheles, sem listras), o termômetro, a árvore e o buriti, o mapa de Roraima, o calendário
// e a prancheta. Desenhos novos (candidatos à biblioteca), em PRESEME.NOVOS: o flebotomíneo e a cama com mosquiteiro, a
// janela com tela e a roupa comprida (os quatro vieram do exemplo do carrossel caso, arraste para a resposta), o
// borrachudo (do exemplo do mapa e dado, com as cores pelo kit), a ferida, o olho, o busto, o "não passa de pessoa para
// pessoa", a cartela de comprimidos e o "evite o inseto" (o anel de proibido). A roupa comprida fica pronta, sem uso aqui.
// Cuidados da peça: explicar pelo inseto e pelo lugar, nunca pelas pessoas; a ferida e o olho são símbolos (nada de lesão
// real de paciente); sem nome de remédio (a cartela não tem rótulo).
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, DS = P.DESENHO, K = P.KIT, B = globalThis.BIB;
  const { noCartao, liso } = K;
  const L2 = Object.assign({}, liso);

  // ---------- os desenhos novos (candidatos à biblioteca) ----------
  // o flebotomíneo (mosquito-palha): x, y é o meio do corpo; as asas em V, para cima, e as pernas compridas
  function flebotomineo(ctx, x, y, s = 1, seed = 300) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.08);
    const asa = noCartao('apoio', 'superficie'), corpo = noCartao('apoioEscuro', 'tinta');
    for (const sd of [-1, 1]) {
      E.poligono(ctx, [[sd * 4, -8], [sd * 26, -92], [sd * 50, -96], [sd * 30, -40], [sd * 12, -4]], { papel: asa, seed: seed + (sd > 0 ? 1 : 2), hachura: false });
      for (let i = 0; i < 3; i++) E.linha(ctx, [[sd * (10 + i * 6), -12 - i * 4], [sd * (30 + i * 6), -78 + i * 8]], { lw: 2, seed: seed + 20 + i + (sd > 0 ? 5 : 0) });
    }
    for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) {
      E.linha(ctx, [[sd * 6, 2 + i * 7], [sd * (34 + i * 10), 20 + i * 12], [sd * (54 + i * 14), 66 + i * 8]], { lw: 3, seed: seed + 10 + i + (sd > 0 ? 5 : 0) });
    }
    E.circulo(ctx, 0, 30, 9, { ry: 26, papel: corpo, seed: seed + 30 });
    E.circulo(ctx, 0, 2, 16, { ry: 14, papel: corpo, seed: seed + 31 });
    E.circulo(ctx, 0, -18, 9, { papel: corpo, seed: seed + 32 });
    for (const sd of [-1, 1]) E.linha(ctx, [[sd * 4, -24], [sd * 20, -46], [sd * 38, -50]], { lw: 2.5, seed: seed + 40 + (sd > 0 ? 1 : 0) });
    E.linha(ctx, [[0, -26], [2, -42]], { lw: 3, seed: seed + 44 });
    ctx.restore();
  }
  // o borrachudo (pium), de lado e virado para a esquerda: a corcunda, a cabeça baixa, as asas largas por cima e as pernas
  // curtas; x, y é o meio do corpo
  function borrachudo(ctx, x, y, s = 1, seed = 520) {
    const asa = noCartao('apoio', 'superficie'), corpo = noCartao('apoioEscuro', 'tinta'), escuro = noCartao('tinta', 'apoioEscuro');
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    for (let i = 0; i < 3; i++) E.linha(ctx, [[-30 + i * 30, 26], [-44 + i * 34, 66], [-58 + i * 40, 92]], { papel: escuro, lw: 5, seed: seed + 1 + i });
    E.circulo(ctx, 62, 12, 64, Object.assign({ ry: 36, papel: corpo, seed: seed + 5 }, L2));
    for (let i = 0; i < 3; i++) E.linha(ctx, [[36 + i * 24, -16], [36 + i * 24, 40]], { papel: asa, lw: 3, seed: seed + 6 + i });
    E.circulo(ctx, -6, -4, 52, Object.assign({ ry: 46, papel: escuro, seed: seed + 10 }, L2));
    E.circulo(ctx, -62, 14, 26, Object.assign({ papel: escuro, seed: seed + 11 }, L2));
    E.circulo(ctx, -70, 8, 10, { papel: asa, contorno: false, seed: seed + 12, hachura: false, sombra: false });
    E.linha(ctx, [[-80, 2], [-104, -14]], { papel: escuro, lw: 4, seed: seed + 13 });
    E.linha(ctx, [[-72, 36], [-82, 56]], { papel: escuro, lw: 5, seed: seed + 14 });
    ctx.save(); ctx.translate(10, -40); ctx.rotate(-0.42);
    E.circulo(ctx, 60, 0, 96, { ry: 26, papel: asa, seed: seed + 15, alpha: 0.85, hachura: false, sombra: false });
    ctx.restore();
    ctx.restore();
  }
  // um pedaço de pele (o antebraço de perto) e a ferida: fase 0, a manchinha vermelha plana; fase 1, a ferida redonda
  function ferida(ctx, x, y, s = 1, seed = 410) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    E.ret(ctx, -128, -56, 256, 112, Object.assign({ papel: 'pele', r: 56, seed }, L2));
    E.circulo(ctx, -70, 0, 13, { ry: 10, papel: 'coral', seed: seed + 1, hachura: false, sombra: false, contorno: false });
    E.seta(ctx, [-42, 0], [4, 0], { lw: 4, curva: -0.2, cabeca: 14, seed: seed + 2, papel: noCartao('apoioEscuro', 'tinta') });
    E.circulo(ctx, 56, 0, 38, { ry: 31, papel: 'coral', seed: seed + 3, hachura: false, sombra: false });
    E.circulo(ctx, 56, 0, 23, { ry: 18, papel: 'papel', seed: seed + 4, hachura: false, sombra: false });
    ctx.restore();
  }
  // o olho de frente, com a parte de cima da íris coberta (a visão que vai embora); x, y é o meio
  function olho(ctx, x, y, s = 1, seed = 600) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24, a = Math.PI * u; pts.push([-120 + 240 * u, -Math.sin(a) * 66]); }
    for (let i = 24; i >= 0; i--) { const u = i / 24, a = Math.PI * u; pts.push([-120 + 240 * u, Math.sin(a) * 60]); }
    E.poligono(ctx, pts, { papel: 'branco', seed, hachura: false, sombra: false });
    E.circulo(ctx, 0, 0, 46, { papel: noCartao('apoioEscuro', 'tinta'), seed: seed + 1, hachura: false, sombra: false });
    E.circulo(ctx, 0, 0, 18, { papel: 'tinta', seed: seed + 2, contorno: false, hachura: false, sombra: false });
    E.circulo(ctx, 14, -30, 54, { ry: 30, papel: noCartao('apoio', 'superficie'), seed: seed + 3, alpha: 0.85, hachura: false, sombra: false, contorno: false });
    E.linha(ctx, [[-130, 0], [-120, 0]], { lw: 3, seed: seed + 4 });
    ctx.restore();
  }
  // o busto (cabeça e ombros), para os desenhos de gente pequena; x, y é o pé do busto
  function busto(ctx, x, y, s = 1, seed = 640, roupa) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    E.poligono(ctx, [[-46, 0], [-40, -44], [-18, -58], [18, -58], [40, -44], [46, 0]], { papel: roupa || noCartao('apoio', 'apoioEscuro'), seed, hachura: false });
    E.circulo(ctx, 0, -84, 26, { papel: 'pele', seed: seed + 1, hachura: false, sombra: false });
    ctx.restore();
  }
  // "não passa de pessoa para pessoa": dois bustos e a seta entre eles riscada de Coral
  function naoPassa(ctx, x, y, s = 1, seed = 660) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    busto(ctx, -84, 70, 1.05, seed);
    busto(ctx, 84, 70, 1.05, seed + 5, noCartao('apoioEscuro', 'tinta'));
    E.seta(ctx, [-44, -40], [44, -40], { lw: 7, curva: -0.25, cabeca: 20, seed: seed + 10, papel: noCartao('apoioEscuro', 'tinta') });
    E.linha(ctx, [[-26, -70], [26, -14]], { papel: 'coral', lw: 9, seed: seed + 11 });
    E.linha(ctx, [[26, -70], [-26, -14]], { papel: 'coral', lw: 9, seed: seed + 12 });
    ctx.restore();
  }
  // a cartela de comprimidos (sem nome de remédio)
  function cartela(ctx, x, y, s = 1, seed = 680) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.12);
    E.ret(ctx, -120, -70, 240, 140, { papel: noCartao('apoio', 'apoioEscuro'), r: 16, seed });
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
      const px = -84 + c * 56, py = -32 + r * 64;
      E.circulo(ctx, px, py, 21, { papel: r === 1 && c === 3 ? noCartao('apoioEscuro', 'tinta') : 'branco', seed: seed + 1 + r * 4 + c, hachura: false, sombra: false });
    }
    ctx.restore();
  }
  // a área inteira tratada: cinco bustos, cada um com o ✓ em cima
  function areaInteira(ctx, x, y, s = 1, seed = 700) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    for (let i = 0; i < 5; i++) {
      const bx = -108 + i * 54, by = 74 + (i % 2) * 8;
      busto(ctx, bx, by, 0.62, seed + i * 3, i % 2 ? noCartao('apoioEscuro', 'tinta') : undefined);
      K.marca(ctx, bx + 2, by - 108, 0.42, noCartao('folha', 'apoioEscuro'));
    }
    ctx.restore();
  }
  // a janela com tela (a grade fina)
  function janelaTela(ctx, x, y, s = 1, seed = 460) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    E.ret(ctx, -90, -90, 180, 180, { papel: noCartao('apoio', 'apoioEscuro'), r: 8, seed });
    for (let i = 1; i < 8; i++) {
      const u = -80 + i * 20;
      E.linha(ctx, [[u, -80], [u, 80]], { lw: 2, seed: seed + i });
      E.linha(ctx, [[-80, u], [80, u]], { lw: 2, seed: seed + 20 + i });
    }
    E.linha(ctx, [[0, -88], [0, 88]], { lw: 6, seed: seed + 40 });
    ctx.restore();
  }
  // a cama com o mosquiteiro (a rede fina em cone)
  function mosquiteiro(ctx, x, y, s = 1, seed = 470) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    E.ret(ctx, -110, 40, 220, 34, { papel: noCartao('apoioEscuro', 'tinta'), r: 6, seed });
    for (const sx of [-100, 92]) E.linha(ctx, [[sx, 74], [sx, 100]], { lw: 6, seed: seed + 1 + sx });
    E.ret(ctx, -96, 22, 70, 22, { papel: 'branco', r: 10, seed: seed + 3 });
    E.poligono(ctx, [[0, -100], [124, 46], [-124, 46]], { papel: noCartao('apoio', 'apoioEscuro'), seed: seed + 4, hachura: false, alpha: 0.55 });
    for (let i = 1; i < 6; i++) E.linha(ctx, [[0, -100], [-124 + i * 41, 46]], { lw: 2, seed: seed + 10 + i });
    for (let j = 1; j < 4; j++) { const yy = -100 + j * 36, hw = (124 * (yy + 100)) / 146; E.linha(ctx, [[-hw, yy], [hw, yy]], { lw: 2, seed: seed + 20 + j }); }
    E.circulo(ctx, 0, -104, 8, { papel: 'tinta', seed: seed + 30, hachura: false });
    ctx.restore();
  }
  // a camisa de manga comprida e a calça
  function roupaComprida(ctx, x, y, s = 1, seed = 480) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    E.poligono(ctx, [[-40, -96], [40, -96], [104, -20], [84, -6], [44, -50], [44, 10], [-44, 10], [-44, -50], [-84, -6], [-104, -20]], { papel: noCartao('apoio', 'apoioEscuro'), seed });
    E.poligono(ctx, [[-40, 16], [40, 16], [44, 104], [12, 104], [0, 40], [-12, 104], [-44, 104]], { papel: noCartao('apoioEscuro', 'tinta'), seed: seed + 1 });
    E.linha(ctx, [[-16, -96], [0, -80], [16, -96]], { lw: 4, seed: seed + 2 });
    ctx.restore();
  }
  // "evite o inseto": o inseto dentro do anel Coral com a faixa de proibido (o Ministério manda evitar a exposição
  // prolongada ao borrachudo; a peça não inventa roupa nem repelente que a fonte não cita)
  function evite(ctx, x, y, s = 1, inseto = borrachudo, seed = 720) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    inseto(ctx, 0, 6, 0.78, seed + 1);
    const anel = []; for (let i = 0; i <= 48; i++) { const a = (i / 48) * Math.PI * 2; anel.push([Math.cos(a) * 104, Math.sin(a) * 104]); }
    E.linha(ctx, anel, { papel: 'coral', lw: 12, seed: seed + 2 });
    E.linha(ctx, [[-74, -74], [74, 74]], { papel: 'coral', lw: 12, seed: seed + 3 });
    ctx.restore();
  }
  P.NOVOS = { flebotomineo, borrachudo, ferida, olho, busto, naoPassa, cartela, areaInteira, janelaTela, mosquiteiro, roupaComprida, evite };

  // ---------- as colunas: o inseto de cada doença ----------
  DS.coluna.malaria = (ctx, cx, cy, s) => B.mosquito(ctx, { x: cx + 6 * s, y: cy - 6 * s, s: 1.3 * s, listras: false, rot: -0.3 });
  DS.coluna.leishmaniose = (ctx, cx, cy, s) => flebotomineo(ctx, cx, cy + 12 * s, 1.35 * s);
  DS.coluna.oncocercose = (ctx, cx, cy, s) => borrachudo(ctx, cx + 6 * s, cy - 4 * s, 1.15 * s);

  // ---------- as células com desenho próprio (a ordem é a das colunas; sem desenho, vale o da coluna) ----------
  DS.celula.pessoa = [
    (ctx, cx, cy, s) => naoPassa(ctx, cx, cy, s),
    (ctx, cx, cy, s) => naoPassa(ctx, cx, cy, s, 670),
  ];
  DS.celula.sinais = [
    (ctx, cx, cy, s) => B.termometro(ctx, { x: cx - 4 * s, y: cy, s: 0.82 * s, febre: true, rot: -0.5 }),
    (ctx, cx, cy, s) => ferida(ctx, cx, cy, 0.95 * s),
    (ctx, cx, cy, s) => olho(ctx, cx, cy, 0.95 * s),
  ];
  DS.celula.onde = [
    (ctx, cx, cy, s) => { B.arvore(ctx, { x: cx - 52 * s, y: cy + 100 * s, h: 190 * s }); B.arvore(ctx, { x: cx + 56 * s, y: cy + 100 * s, h: 220 * s, tipo: 'buriti' }); },
    (ctx, cx, cy, s) => B.mapaRR(ctx, { x: cx - 105 * s, y: cy - 105 * s, w: 210 * s, h: 210 * s, base: 'destaque', lw: 2 }),
  ];
  DS.celula.trata = [
    (ctx, cx, cy, s) => cartela(ctx, cx, cy, 0.95 * s),
    (ctx, cx, cy, s) => B.calendario(ctx, { x: cx, y: cy, s: 0.64 * s, marcados: Array.from({ length: 30 }, (_, i) => i) }),
    (ctx, cx, cy, s) => areaInteira(ctx, cx, cy, s),
  ];
  DS.celula.previne = [
    (ctx, cx, cy, s) => mosquiteiro(ctx, cx, cy + 6 * s, 0.95 * s),
    (ctx, cx, cy, s) => janelaTela(ctx, cx, cy, 0.95 * s),
    (ctx, cx, cy, s) => evite(ctx, cx, cy, 0.95 * s),
  ];

  // ---------- o fecho: a ficha de notificação (a prancheta da biblioteca) ----------
  DS.cena.equipe = (ctx, b) => B.prancheta(ctx, { x: b.x + b.w / 2, y: b.y + Math.min(b.h, 260) / 2 + 20, s: 0.95, linhas: 3 });
})();
