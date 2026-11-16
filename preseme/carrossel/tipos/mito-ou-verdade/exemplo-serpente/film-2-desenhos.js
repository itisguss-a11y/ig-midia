// PRESEME · carrossel · mito ou verdade · desenho 2 · os desenhos DESTA peça (picada de cobra). TROQUE na peça nova.
// O molde (film-3-moldes.js) chama, em cada lâmina, PRESEME.DESENHO.cena[id da lâmina](ctx, caixa, lam), com caixa =
// { x, y, w, h }, o espaço livre que o molde deixou. Nas lâminas de passos, PRESEME.DESENHO.passo[id] = [um desenho por
// item], cada um (ctx, cx, cy, s), centrado em cx, cy, em uns 160 × 140 px na escala 1. Rótulo de desenho vem do
// textos.txt (palavras D) e é escrito com P.bloco. Desenho parado. Pele é a única cor fora da paleta (está no peca.json).
// Cuidado do banco de fatos: o mito desenhado aparece riscado (o X de Coral).
(function () {
  const G = globalThis.G, E = globalThis.ESTILOS, P = globalThis.PRESEME, DS = P.DESENHO;
  DS.cena = DS.cena || {};
  DS.passo = DS.passo || {};

  // ---- ajudas ----
  // a cor que não some: no estilo em que o papel pedido é a mesma cor do que está atrás, usa a outra
  const naoSome = (papel, atras, outra) => (E.cor(papel) === E.cor(atras) ? outra : papel);
  const girado = (ctx, x, y, a, fn) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); fn(); ctx.restore(); };
  // o X de Coral por cima do que não se faz
  const xis = (ctx, cx, cy, r, seed = 300) => {
    const lw = Math.max(7, r * 0.17);
    E.linha(ctx, [[cx - r, cy - r], [cx + r, cy + r]], { papel: 'alerta', lw, seed });
    E.linha(ctx, [[cx + r, cy - r], [cx - r, cy + r]], { papel: 'alerta', lw, seed: seed + 1 });
  };
  // o sinal de proibido (o círculo e a barra de Coral) por cima do ícone, que continua legível dos dois lados da barra
  const proibido = (ctx, cx, cy, r, seed = 320) => {
    E.circulo(ctx, cx, cy, r, { papel: null, tinta: 'alerta', lw: Math.max(6, r * 0.12), hachura: false, seed });
    E.linha(ctx, [[cx - r * 0.7, cy - r * 0.7], [cx + r * 0.7, cy + r * 0.7]], { papel: 'alerta', lw: Math.max(6, r * 0.12), seed: seed + 1 });
  };
  // o rótulo de um desenho: a palavra D, centrada em cx, a partir de y
  const rotulo = (ctx, k, cx, y, w, h = 52, o = {}) => P.bloco(ctx, k, { x: cx - w / 2, y, w, h }, Object.assign({ sizes: [36, 34, 32, 30], align: 'center', maxLinhas: 2, lh: 1.08 }, o));
  // a gota (e a chama), com a ponta para cima
  const gota = (cx, cy, r) => { const p = []; for (let i = 0; i < 28; i++) { const t = (i / 28) * Math.PI * 2; p.push([cx + r * 0.8 * Math.sin(t) * Math.sin(t / 2), cy - r * Math.cos(t)]); } return p; };
  // um tufo de capim no chão
  const capim = (ctx, x, y, s = 1, seed = 400) => {
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.34, l = 48 * s * (1 - Math.abs(i - 2) * 0.16), x0 = x + (i - 2) * 6 * s;
      E.linha(ctx, [[x0, y], [x0 + Math.cos(a) * l, y + Math.sin(a) * l]], { papel: 'apoioEscuro', lw: 5 * s, seed: seed + i });
    }
  };

  // ---- as peças de desenho ----
  // a cobra (jararaca): o corpo em S, mais fino no rabo, as manchas do dorso, a cabeça, o olho e a língua bifurcada
  function cobra(ctx, cx, cy, s = 1, o = {}) {
    const n = 52, comp = (o.comp || 640) * s, amp = (o.amp || 60) * s, ondas = o.ondas || 2.3;
    const pts = [];
    for (let i = 0; i <= n; i++) { const u = i / n; pts.push([cx - comp / 2 + u * comp, cy + Math.sin(u * Math.PI * ondas + 0.4) * amp * (0.5 + 0.5 * u)]); }
    const esp = (u) => s * (5 + 27 * Math.min(1, u / 0.45)) * (u > 0.9 ? 1 - (u - 0.9) * 3 : 1);
    const norm = (i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l, -dy / l, dx / l]; };
    const esq = [], dir = [];
    pts.forEach((p, i) => { const [, , nx, ny] = norm(i), w = esp(i / n); esq.push([p[0] + nx * w, p[1] + ny * w]); dir.push([p[0] - nx * w, p[1] - ny * w]); });
    const corpo = naoSome('apoioEscuro', 'chao', 'apoio');
    E.poligono(ctx, esq.concat(dir.reverse()), { papel: corpo, seed: o.seed || 210 });
    for (let i = 9; i < n - 5; i += 5) {
      const [tx, ty, nx, ny] = norm(i), w = esp(i / n) * 0.78, p = pts[i];
      E.poligono(ctx, [[p[0] + nx * w + tx * 6 * s, p[1] + ny * w + ty * 6 * s], [p[0] + tx * 16 * s, p[1] + ty * 16 * s], [p[0] - nx * w + tx * 6 * s, p[1] - ny * w + ty * 6 * s], [p[0] - tx * 10 * s, p[1] - ty * 10 * s]], { papel: 'tinta', contorno: false, hachura: false, seed: 220 + i });
    }
    const pa = pts[n - 1], pb = pts[n];
    girado(ctx, pb[0], pb[1], Math.atan2(pb[1] - pa[1], pb[0] - pa[0]), () => {
      E.linha(ctx, [[46 * s, 2 * s], [76 * s, 2 * s]], { papel: 'alerta', lw: 4.5 * s, seed: 217 });
      E.linha(ctx, [[76 * s, 2 * s], [92 * s, -9 * s]], { papel: 'alerta', lw: 4.5 * s, seed: 218 });
      E.linha(ctx, [[76 * s, 2 * s], [92 * s, 13 * s]], { papel: 'alerta', lw: 4.5 * s, seed: 219 });
      E.circulo(ctx, 16 * s, 0, 36 * s, { ry: 25 * s, papel: corpo, seed: 215 });
      E.circulo(ctx, 26 * s, -10 * s, 6.5 * s, { papel: 'tinta', contorno: false, hachura: false, seed: 216 });
    });
  }

  // o antebraço deitado, com o punho fechado à direita e as duas marcas da picada (o.picada: de 0 a 1 do antebraço)
  function braco(ctx, x, y, w, s = 1, o = {}) {
    const h = 104 * s;
    E.ret(ctx, x, y - h / 2, w, h, { papel: 'pele', r: h / 2, seed: 230 });
    const hx = x + w - 40 * s;
    E.ret(ctx, hx, y - 66 * s, 150 * s, 132 * s, { papel: 'pele', r: 52 * s, seed: 231 });
    for (let i = 0; i < 3; i++) E.linha(ctx, [[hx + 116 * s, y - 30 * s + i * 30 * s], [hx + 142 * s, y - 28 * s + i * 30 * s]], { lw: 4 * s, seed: 232 + i });
    E.ret(ctx, hx + 18 * s, y - 92 * s, 96 * s, 46 * s, { papel: 'pele', r: 23 * s, seed: 236 });
    const px = x + w * (o.picada ?? 0.6), py = y - 6 * s;
    for (const d of [-17, 17]) E.circulo(ctx, px + d * s, py, 8.5 * s, { papel: 'tinta', contorno: false, hachura: false, seed: 240 + d });
    return { picada: [px, py], h };
  }

  // a corda amarrada no antebraço (o garrote): as duas voltas, o laço em cima e as pontas caindo
  function corda(ctx, x, y, h, s = 1) {
    for (const d of [-15, 15]) E.ret(ctx, x + d * s - 9 * s, y - h / 2 - 10 * s, 18 * s, h + 20 * s, { papel: 'apoioEscuro', r: 8 * s, seed: 250 + d });
    const ky = y - h / 2 - 16 * s;
    E.linha(ctx, [[x - 4 * s, ky], [x - 34 * s, ky + 46 * s]], { papel: 'apoioEscuro', lw: 9 * s, seed: 254 });
    E.linha(ctx, [[x + 4 * s, ky], [x + 30 * s, ky + 50 * s]], { papel: 'apoioEscuro', lw: 9 * s, seed: 255 });
    girado(ctx, x - 32 * s, ky - 16 * s, 0.45, () => E.circulo(ctx, 0, 0, 34 * s, { ry: 17 * s, papel: 'apoioEscuro', seed: 256 }));
    girado(ctx, x + 32 * s, ky - 16 * s, -0.45, () => E.circulo(ctx, 0, 0, 34 * s, { ry: 17 * s, papel: 'apoioEscuro', seed: 257 }));
    E.circulo(ctx, x, ky - 6 * s, 16 * s, { papel: 'apoioEscuro', seed: 253 });
  }

  // o frasco do soro: o vidro, o líquido, o gargalo, a tampa e a gota no rótulo
  function frasco(ctx, cx, cy, s = 1) {
    const w = 130 * s, h = 200 * s;
    E.ret(ctx, cx - 28 * s, cy - h / 2 - 46 * s, 56 * s, 56 * s, { papel: 'superficie', r: 8 * s, seed: 262 });
    E.ret(ctx, cx - 42 * s, cy - h / 2 - 78 * s, 84 * s, 40 * s, { papel: 'tinta', r: 8 * s, seed: 263 });
    E.ret(ctx, cx - w / 2, cy - h / 2, w, h, { papel: 'superficie', r: 24 * s, seed: 260, sombra: true });
    E.ret(ctx, cx - w / 2 + 13 * s, cy - h / 2 + 64 * s, w - 26 * s, h - 78 * s, { papel: 'apoio', r: 15 * s, seed: 261 });
    E.poligono(ctx, gota(cx, cy + 34 * s, 36 * s), { papel: 'superficie', seed: 264 });
  }

  // a bota de cano alto: x é a esquerda do cano, chao é a linha do chão
  function bota(ctx, x, chao, s = 1, seed = 340) {
    E.poligono(ctx, [[x, chao - 300 * s], [x + 122 * s, chao - 300 * s], [x + 128 * s, chao - 92 * s], [x + 246 * s, chao - 72 * s], [x + 262 * s, chao - 22 * s], [x - 4 * s, chao - 22 * s]], { papel: 'apoioEscuro', seed });
    E.ret(ctx, x - 10 * s, chao - 26 * s, 280 * s, 26 * s, { papel: 'tinta', r: 6 * s, seed: seed + 1 });
    E.ret(ctx, x - 8 * s, chao - 318 * s, 138 * s, 30 * s, { papel: 'tinta', r: 6 * s, seed: seed + 2 });
    for (let i = 0; i < 4; i++) E.linha(ctx, [[x + 22 * s, chao - (250 - i * 44) * s], [x + 100 * s, chao - (250 - i * 44) * s]], { papel: 'apoio', lw: 4 * s, seed: seed + 3 + i, tracejado: true });
  }

  // os 100 quadradinhos, os n primeiros cheios
  function grade100(ctx, x, y, cel, n) {
    const cheio = E.escuro() ? 'destaque' : 'apoioEscuro';
    for (let i = 0; i < 100; i++) E.ret(ctx, x + (i % 10) * cel, y + Math.floor(i / 10) * cel, cel - 8, cel - 8, { papel: i < n ? cheio : 'superficie', r: 4, seed: 360 + i, hachura: false, lw: 2.5 });
  }

  // os ícones do que não se faz (cada um dentro de um círculo, riscado)
  const ICONE = {
    amarrar(ctx, cx, cy, s) {
      E.ret(ctx, cx - 50 * s, cy - 16 * s, 100 * s, 32 * s, { papel: 'pele', r: 16 * s, seed: 270 });
      E.ret(ctx, cx - 9 * s, cy - 26 * s, 18 * s, 52 * s, { papel: 'apoioEscuro', r: 6 * s, seed: 271 });
      E.linha(ctx, [[cx, cy - 26 * s], [cx - 22 * s, cy - 48 * s]], { papel: 'apoioEscuro', lw: 6 * s, seed: 272 });
      E.linha(ctx, [[cx, cy - 26 * s], [cx + 22 * s, cy - 48 * s]], { papel: 'apoioEscuro', lw: 6 * s, seed: 273 });
    },
    cortar(ctx, cx, cy, s) {
      girado(ctx, cx, cy, -0.6, () => {
        E.ret(ctx, -54 * s, -11 * s, 42 * s, 22 * s, { papel: 'tinta', r: 6 * s, seed: 274 });
        E.poligono(ctx, [[-12 * s, -11 * s], [42 * s, -11 * s], [58 * s, 2 * s], [-12 * s, 11 * s]], { papel: 'superficie', seed: 275 });
      });
    },
    queimar(ctx, cx, cy, s) {
      E.poligono(ctx, gota(cx, cy + 4 * s, 44 * s), { papel: 'alerta', seed: 276 });
      E.poligono(ctx, gota(cx, cy + 18 * s, 22 * s), { papel: 'destaque', seed: 277 });
    },
    espremer(ctx, cx, cy, s) {
      E.seta(ctx, [cx - 54 * s, cy], [cx - 14 * s, cy], { lw: 6 * s, cabeca: 16 * s, curva: 0, seed: 278 });
      E.seta(ctx, [cx + 54 * s, cy], [cx + 14 * s, cy], { lw: 6 * s, cabeca: 16 * s, curva: 0, seed: 279 });
      E.circulo(ctx, cx, cy, 8 * s, { papel: 'tinta', contorno: false, hachura: false, seed: 280 });
    },
  };

  // ---- as cenas, uma por lâmina (o id é o do score.js) ----
  DS.cena.capa = (ctx, b) => {
    const s = Math.min(1.4, b.w / 700, b.h / 250), chao = b.y + b.h * 0.42;
    E.chao(ctx, chao);
    cobra(ctx, b.x + b.w * 0.47, chao + 74 * s, s, { comp: 640, amp: 58 });
    capim(ctx, b.x + 30 * s, chao + 26 * s, s * 1.2, 401);
    capim(ctx, b.x + b.w - 40 * s, chao + 16 * s, s, 411);
  };

  DS.cena.frase1 = (ctx, b) => {
    const s = Math.min(1.25, b.w / 760, b.h / 320), w = 540 * s, x = b.x + (b.w - w - 110 * s) / 2, y = b.y + b.h * 0.56;
    const r = braco(ctx, x, y, w, s, { picada: 0.7 });
    const cx = x + w * 0.3;
    corda(ctx, cx, y, r.h, s);
    xis(ctx, cx, y - 26 * s, 92 * s, 290);
  };

  DS.cena.frase2 = (ctx, b) => {
    const s = Math.min(1.25, b.w / 760, b.h / 360), w = 540 * s, x = b.x + (b.w - w - 110 * s) / 2, y = b.y + b.h * 0.64;
    const r = braco(ctx, x, y, w, s, { picada: 0.42 });
    const [px, py] = r.picada, alvo = [px + 150 * s, py - 230 * s];
    E.seta(ctx, [px + 10 * s, py - 30 * s], alvo, { lw: 8 * s, curva: -0.3, cabeca: 26 * s, seed: 291 });
    for (let i = 0; i < 2; i++) E.poligono(ctx, gota(px + (44 + i * 46) * s, py - (92 + i * 62) * s, 15 * s), { papel: 'apoioEscuro', seed: 293 + i });
    xis(ctx, px + 80 * s, py - 130 * s, 76 * s, 296);
  };

  DS.cena.frase3 = (ctx, b) => {
    const s = Math.min(1.1, b.h / 380, b.w / 600), chao = b.y + b.h * 0.88;
    E.chao(ctx, chao);
    bota(ctx, b.x + b.w * 0.5 - 130 * s, chao + 8 * s, s);
    capim(ctx, b.x + b.w * 0.5 - 220 * s, chao + 14 * s, s * 1.1, 421);
    capim(ctx, b.x + b.w * 0.5 + 230 * s, chao + 10 * s, s, 431);
  };

  // o porquê do primeiro mito: o que o guia manda não fazer (riscado) e o que trata (o soro)
  DS.cena.porque1 = (ctx, b, lam) => {
    const ks = lam.palavras.slice(2); // depois da etiqueta e do veredito: amarrar, cortar, queimar, espremer, o soro
    const nomes = ['amarrar', 'cortar', 'queimar', 'espremer'];
    const wl = b.w * 0.6, cw = wl / 2, ch = b.h / 2, r = Math.min(82, ch * 0.34);
    nomes.forEach((nome, i) => {
      const cx = b.x + cw * (i % 2) + cw / 2, cy = b.y + ch * Math.floor(i / 2) + r + 8;
      E.circulo(ctx, cx, cy, r, { papel: 'superficie', seed: 281 + i });
      ICONE[nome](ctx, cx, cy, r / 70);
      proibido(ctx, cx, cy, r, 320 + i * 2);
      if (ks[i]) rotulo(ctx, ks[i], cx, cy + r + 12, cw - 16, 48, { maxLinhas: 1 });
    });
    E.linha(ctx, [[b.x + wl + 14, b.y + 10], [b.x + wl + 14, b.y + b.h - 10]], { papel: 'apoio', lw: 4, seed: 309, tracejado: true });
    const s = Math.min(1, (b.h - 70) / 330), fx = b.x + wl + (b.w - wl) / 2 + 10, fy = b.y + 80 * s + (b.h - 70 - 330 * s) / 2 + 100 * s;
    frasco(ctx, fx, fy + 30 * s, s);
    if (ks[4]) rotulo(ctx, ks[4], fx, fy + 30 * s + 116 * s, b.w - wl - 30, 80, { maxLinhas: 2, sizes: [40, 38, 36, 34] });
  };

  // o porquê da bota: 75 de cada 100 acidentes, a bota do lado
  DS.cena.porque3 = (ctx, b, lam) => {
    const k75 = lam.palavras[2];
    const cel = Math.min(46, (b.h - 20) / 10), gw = cel * 10, gx = b.x, gy = b.y + (b.h - gw) / 2;
    grade100(ctx, gx, gy, cel, 75);
    const xr = gx + gw + 40, wr = b.x + b.w - xr;
    const lab = k75 ? rotulo(ctx, k75, xr + wr / 2, gy, wr, 130, { sizes: [44, 40, 38, 36, 34], maxLinhas: 3 }) : { y1: gy };
    const s = Math.min(1, wr / 290, (gy + gw - lab.y1 - 30) / 330);
    bota(ctx, xr + (wr - 262 * s) / 2, gy + gw, s);
  };

  // os passos do que fazer, na ordem do textos.txt (procure atendimento, lave, repouso, água)
  DS.passo.porque2 = [
    (ctx, cx, cy, s) => { // o hospital, com o H de linhas na fachada (nada de cruz vermelha)
      E.ret(ctx, cx - 66 * s, cy - 40 * s, 132 * s, 98 * s, { papel: 'superficie', r: 6 * s, seed: 500 });
      E.ret(ctx, cx - 74 * s, cy - 56 * s, 148 * s, 20 * s, { papel: 'apoioEscuro', r: 4 * s, seed: 501 });
      E.ret(ctx, cx - 17 * s, cy + 16 * s, 34 * s, 42 * s, { papel: 'apoio', r: 3 * s, seed: 502 });
      E.linha(ctx, [[cx - 13 * s, cy - 26 * s], [cx - 13 * s, cy + 4 * s]], { lw: 6 * s, seed: 503 });
      E.linha(ctx, [[cx + 13 * s, cy - 26 * s], [cx + 13 * s, cy + 4 * s]], { lw: 6 * s, seed: 504 });
      E.linha(ctx, [[cx - 13 * s, cy - 11 * s], [cx + 13 * s, cy - 11 * s]], { lw: 6 * s, seed: 505 });
    },
    (ctx, cx, cy, s) => { // a torneira, as gotas e o sabão
      E.ret(ctx, cx - 64 * s, cy - 58 * s, 76 * s, 24 * s, { papel: 'apoioEscuro', r: 8 * s, seed: 510 });
      E.ret(ctx, cx - 6 * s, cy - 58 * s, 24 * s, 46 * s, { papel: 'apoioEscuro', r: 8 * s, seed: 511 });
      E.ret(ctx, cx - 44 * s, cy - 78 * s, 32 * s, 20 * s, { papel: 'tinta', r: 6 * s, seed: 512 });
      for (let i = 0; i < 2; i++) E.poligono(ctx, gota(cx + 6 * s, cy + (8 + i * 32) * s, 11 * s), { papel: 'apoio', seed: 513 + i });
      E.ret(ctx, cx + 30 * s, cy + 26 * s, 54 * s, 30 * s, { papel: 'destaque', r: 9 * s, seed: 516 });
    },
    (ctx, cx, cy, s) => { // a perna em cima do travesseiro, e a seta para cima
      E.circulo(ctx, cx + 8 * s, cy + 34 * s, 58 * s, { ry: 22 * s, papel: 'apoio', seed: 520 });
      girado(ctx, cx - 76 * s, cy + 52 * s, -0.42, () => {
        E.ret(ctx, 0, -17 * s, 130 * s, 34 * s, { papel: 'pele', r: 17 * s, seed: 521 });
        E.ret(ctx, 112 * s, -48 * s, 30 * s, 50 * s, { papel: 'pele', r: 12 * s, seed: 522 });
      });
      E.seta(ctx, [cx + 64 * s, cy - 6 * s], [cx + 64 * s, cy - 66 * s], { lw: 6 * s, cabeca: 18 * s, curva: 0, seed: 523 });
    },
    (ctx, cx, cy, s) => { // o copo de água
      E.poligono(ctx, [[cx - 38 * s, cy - 54 * s], [cx + 38 * s, cy - 54 * s], [cx + 29 * s, cy + 54 * s], [cx - 29 * s, cy + 54 * s]], { papel: 'superficie', seed: 530 });
      E.poligono(ctx, [[cx - 33 * s, cy - 16 * s], [cx + 33 * s, cy - 16 * s], [cx + 28 * s, cy + 47 * s], [cx - 28 * s, cy + 47 * s]], { papel: 'apoio', contorno: false, seed: 531 });
      E.poligono(ctx, gota(cx + 58 * s, cy - 42 * s, 17 * s), { papel: 'apoio', seed: 532 });
    },
  ];
})();
