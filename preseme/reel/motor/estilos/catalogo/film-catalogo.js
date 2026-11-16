// PRESEME · biblioteca · o catálogo: cada desenho da biblioteca com o nome de chamar, em 4 páginas paradas
// (t 0 a 1: lugares; 1 a 4: objetos, em três páginas; 4 a 5: gente). O texto daqui é só rótulo do catálogo, não é peça.
(function () {
  const E = globalThis.ESTILOS, B = globalThis.BIB, G = globalThis.G;
  const W = G.W, H = G.H;

  function etiqueta(ctx, nome, x, y, max = 330) {
    let size = 42;
    while (size > 22 && E.medir(ctx, nome, { papel: 'corpo', size }) + 30 > max) size -= 2;
    const w = E.medir(ctx, nome, { papel: 'corpo', size }) + 30;
    E.ret(ctx, x - w / 2, y - 40, w, 58, { papel: 'fundo', r: 10, sombra: false, hachura: false, lw: 3 });
    E.texto(ctx, nome, x, y + 2, { papel: 'corpo', size, align: 'center', cor: 'texto' });
  }
  function grade(ctx, cols, rows) {
    for (let c = 1; c < cols; c++) E.linha(ctx, [[(W / cols) * c, 0], [(W / cols) * c, H]], { lw: 4, seed: 900 + c });
    for (let r = 1; r < rows; r++) E.linha(ctx, [[0, (H / rows) * r], [W, (H / rows) * r]], { lw: 4, seed: 910 + r });
  }

  // ---------- página 0: os lugares, cada um no quadro inteiro, reduzido a 1/3 ----------
  const LUGARES = [
    ['varanda', (c) => B.varanda(c)],
    ['rua', (c) => B.rua(c, { numeros: ['12', '14', '16'], portas: [0, 0.7, 0], sol: true })],
    ['sala', (c) => B.sala(c)],
    ['ubsFora', (c) => B.ubsFora(c, { placa: 'UBS Centro' })],
    ['ubsDentro', (c) => B.ubsDentro(c, { porta: 'Sala 3', placa: 'Recepção' })],
    ['consultorio', (c) => B.consultorio(c)],
    ['salaEspera', (c) => B.salaEspera(c, { senha: '042' })],
    ['floresta', (c) => B.floresta(c)],
    ['mapaRR', (c) => { E.fundo(c); B.mapaRR(c, { x: 80, y: 140, w: 920, h: 1560, destaques: { 'Boa Vista': 'destaque', 'Alto Alegre': 'alerta' }, ponto: 'Boa Vista' }); }],
  ];
  function lugares(ctx) {
    const tw = W / 3, th = H / 3;
    LUGARES.forEach(([nome, fn], i) => {
      const tx = (i % 3) * tw, ty = Math.floor(i / 3) * th;
      ctx.save(); ctx.beginPath(); ctx.rect(tx, ty, tw, th); ctx.clip();
      ctx.translate(tx, ty); ctx.scale(1 / 3, 1 / 3); fn(ctx);
      ctx.restore();
      etiqueta(ctx, nome, tx + tw / 2, ty + th - 40);
    });
    grade(ctx, 3, 3);
  }

  // ---------- páginas 1 e 2: os objetos, cada um na sua casinha (cx, cy: o meio da área de desenho) ----------
  const OBJ1 = [
    ['mesa', (c, x, y) => B.mesa(c, { x, y: y + 110, s: 0.7 })],
    ['cadeira', (c, x, y) => B.cadeira(c, { x, y: y + 140, s: 0.55 })],
    ["cadeira · madeira", (c, x, y) => B.cadeira(c, { x, y: y + 140, s: 0.7, tipo: 'madeira' })],
    ['rede', (c, x, y) => B.rede(c, { x, y: y - 50, s: 0.95 })],
    ['relogio · frac', (c, x, y) => B.relogio(c, { x, y, r: 92, frac: 0.35 })],
    ['relogio · hora', (c, x, y) => B.relogio(c, { x, y, r: 92, hora: 10.25 })],
    ['celular', (c, x, y) => B.celular(c, { x, y: y + 6, s: 0.82, numero: '192' })],
    ['celular · mensagem', (c, x, y) => B.celular(c, { x, y: y + 6, s: 0.82, tela: 'mensagem' })],
    ['aparelhoPressao', (c, x, y) => B.aparelhoPressao(c, { x: x + 92, y, s: 0.95, leitura: '12/8', unidade: 'mmHg', manguito: true })],
    ['manguito · tubo', (c, x, y) => {
      const de = [x - 130, y - 70], ate = [x + 110, y + 10];
      E.linha(c, [de, ate], { papel: 'pele', lw: 40, seed: 5 });
      const p = B.manguito(c, { de, ate, infla: 0.5 });
      B.tubo(c, { de: p, ate: [x + 120, y + 110], folga: 50 });
    }],
    ['glicosimetro', (c, x, y) => B.glicosimetro(c, { x, y: y + 40, s: 0.92, leitura: '98', unidade: 'mg/dL' })],
    ['termometro', (c, x, y) => B.termometro(c, { x, y, s: 1.05, leitura: '36,5' })],
    ['termometro · febre', (c, x, y) => B.termometro(c, { x, y, s: 1.05, leitura: '38,2', febre: true })],
    ['seringa', (c, x, y) => B.seringa(c, { x: x + 18, y, s: 0.8, k: 0.25 })],
    ['frascoVacina', (c, x, y) => B.frascoVacina(c, { x, y: y + 110, s: 1.3 })],
  ];
  const OBJ2 = [
    ['caixaTermica', (c, x, y) => B.caixaTermica(c, { x, y: y + 100, s: 0.8 })],
    ['prancheta', (c, x, y) => B.prancheta(c, { x, y: y + 10, s: 1.1, linhas: 3, vistos: 2 })],
    ['cartaoVacina', (c, x, y) => B.cartaoVacina(c, { x, y, s: 0.9, marcadas: 5, titulo: 'Vacinas' })],
    ['mosquito', (c, x, y) => B.mosquito(c, { x: x + 10, y: y - 20, s: 1.2 })],
    ['mosquito · listras', (c, x, y) => B.mosquito(c, { x: x + 10, y: y - 20, s: 1.2, listras: true })],
    ['cobra', (c, x, y) => B.cobra(c, { x: x - 14, y, s: 0.5, comp: 560 })],
    ['lupa · dentro', (c, x, y) => B.lupa(c, { x: x - 34, y: y - 34, r: 92, dentro: (cc) => B.mosquito(cc, { x: x - 30, y: y - 24, s: 0.9 }) })],
    ['calendario', (c, x, y) => B.calendario(c, { x, y: y + 10, s: 0.85, titulo: 'Março', marcados: [9, 23] })],
    ['carimbo', (c, x, y) => B.carimbo(c, { x, y: y + 110, batida: 1 })],
    ['xicara', (c, x, y) => B.xicara(c, { x, y: y + 40, s: 2 })],
    ['estojo', (c, x, y) => B.estojo(c, { x, y: y + 60, s: 1.6 })],
    ['gota · floco', (c, x, y) => { B.gota(c, { x: x - 70, y, r: 40 }); B.floco(c, { x: x + 70, y, r: 55 }); }],
    ['arvore', (c, x, y) => B.arvore(c, { x, y: y + 150, h: 300 })],
    ['arvore · buriti', (c, x, y) => B.arvore(c, { x, y: y + 160, h: 230, tipo: 'buriti' })],
    ['casa', (c, x, y) => B.casa(c, { x, y: y + 140, w: 230, h: 230, numero: '7' })],
  ];
  const OBJ3 = [
    ['coracao', (c, x, y) => B.coracao(c, { x, y, s: 3 })],
    ['visto', (c, x, y) => B.visto(c, { x, y, s: 3 })],
    ['tracejado', (c, x, y) => { B.visto(c, { x: x - 110, y: y + 90, s: 1.2 }); B.tracejado(c, { de: [x - 110, y + 90], ate: [x + 110, y - 90] }); B.coracao(c, { x: x + 110, y: y - 90, s: 1.4 }); }],
    ['balao · riscado', (c, x, y) => B.balao(c, { x: x - 10, y: y - 20, s: 1.7, riscado: true })],
    ['prato', (c, x, y) => B.prato(c, { x, y, s: 3 })],
    ['cigarro', (c, x, y) => B.cigarro(c, { x: x - 10, y: y + 70, s: 2.6 })],
    ['tenis', (c, x, y) => B.tenis(c, { x, y: y + 60, s: 2.6 })],
    ['ubsIcone', (c, x, y) => B.ubsIcone(c, { x, y: y + 20, s: 1.8 })],
    ['dor', (c, x, y) => { E.circulo(c, x - 40, y + 20, 36, { papel: 'pele', sombra: false, hachura: false, seed: 7 }); for (const [a, sd] of [[-0.6, 1], [0.3, 2], [1.2, 3]]) B.dor(c, { x: x - 40 + Math.cos(a) * 50, y: y + 20 + Math.sin(a) * 50, a, tam: 90, seed: 610 + sd }); }],
  ];
  function objetos(ctx, lista, rows = 5) {
    E.fundo(ctx);
    const cw = W / 3, ch = H / rows;
    lista.forEach(([nome, fn], i) => {
      const tx = (i % 3) * cw, ty = Math.floor(i / 3) * ch;
      ctx.save(); ctx.beginPath(); ctx.rect(tx, ty, cw, ch); ctx.clip();
      fn(ctx, tx + cw / 2, ty + ch / 2 + 26);
      ctx.restore();
      etiqueta(ctx, nome, tx + cw / 2, ty + 50);
    });
    grade(ctx, 3, rows);
  }

  // ---------- página 3: a gente ----------
  const GENTE = ['agente', 'calouro', 'moradora', 'idosa', 'idoso', 'medica', 'medico', 'enfermeira', 'crianca'];
  function gente(ctx) {
    E.fundo(ctx);
    const tw = W / 3, th = H / 3;
    GENTE.forEach((quem, i) => {
      const tx = (i % 3) * tw, ty = Math.floor(i / 3) * th;
      B.pessoa(ctx, { quem, x: tx + tw / 2, y: ty + th - 40, s: 0.95, pose: 'stand', eyes: 'happy', mouth: 'smile', look: 0.2, seed: 300 + i * 7 });
      etiqueta(ctx, quem, tx + tw / 2, ty + 60);
    });
    grade(ctx, 3, 3);
  }

  Studio.film({
    fadeOut: 0,
    draw(ctx, t) {
      const p = Math.min(4, Math.floor(t));
      if (p === 0) lugares(ctx);
      else if (p === 1) objetos(ctx, OBJ1);
      else if (p === 2) objetos(ctx, OBJ2);
      else if (p === 3) objetos(ctx, OBJ3, 3);
      else gente(ctx);
    },
  });
})();
