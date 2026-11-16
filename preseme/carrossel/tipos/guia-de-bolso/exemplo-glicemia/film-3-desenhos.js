// PRESEME · carrossel · guia de bolso · OS DESENHOS DA PEÇA (TROQUE: é o que muda de um guia para outro).
// Peça: glicose baixa na visita (hipoglicemia). Cada desenho é PRESEME.DESENHO[nome] = (ctx, caixa, lam, ...mais), e o
// score.js diz qual vai em qual lâmina (desenho:). O molde põe o texto e entrega a caixa livre { x, y, w, h }. Toda
// palavra que aparece no desenho vem do textos.js (as palavras D, que o molde passa em "mais"); fixo, só o que vem
// impresso no objeto (a unidade "mg/dL" no aparelho), dentro de G.decor. As peças pequenas (copo, relógio, gota, rosto,
// icone...) vêm do kit do guia (PRESEME.KIT, em film-2-moldes.js); as cenas prontas (visita, espera, equipe, telefone)
// também, e esta peça as usa como estão. Desenho parado.
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, TX = globalThis.TEXTOS;
  const DS = P.DESENHO;
  const { RAD, liso, arco, decor, icone, gota, copo, relogio, volta, rosto } = P.KIT;

  // ---------- peças do assunto ----------
  // o aparelho de glicemia (glicosímetro): x é o centro, y é a base; a fita entra por cima, com a gota na ponta.
  // seta: a seta para baixo na tela (glicose baixa) e a unidade impressa
  function aparelho(ctx, x, y, s, o = {}) {
    const w = 220 * s, h = 320 * s, x0 = x - w / 2, y0 = y - h;
    E.ret(ctx, x - 20 * s, y0 - 74 * s, 40 * s, 92 * s, Object.assign({ papel: 'destaque', r: 5 * s, seed: 90 }, liso));
    gota(ctx, x, y0 - 88 * s, 17 * s);
    E.ret(ctx, x0, y0, w, h, { papel: 'superficie', r: 44 * s, seed: 91 });
    const vx = x0 + 30 * s, vy = y0 + 40 * s, vw = w - 60 * s, vh = 130 * s;
    E.ret(ctx, vx, vy, vw, vh, Object.assign({ papel: 'apoio', r: 12 * s, seed: 92 }, liso));
    if (o.seta) {
      E.seta(ctx, [vx + vw * 0.3, vy + 22 * s], [vx + vw * 0.3, vy + vh - 20 * s], { lw: 7, curva: 0, cabeca: 26 * s, seed: 93 });
      decor(() => E.texto(ctx, 'mg/dL', vx + vw - 12 * s, vy + vh - 22 * s, { papel: 'numero', size: 30 * s, align: 'right' }));
    }
    E.circulo(ctx, x - 44 * s, y - 80 * s, 24 * s, Object.assign({ papel: 'apoioEscuro', seed: 94 }, liso));
    E.circulo(ctx, x + 44 * s, y - 80 * s, 24 * s, Object.assign({ papel: 'apoioEscuro', seed: 95 }, liso));
  }
  function bala(ctx, x, y, s, papel, seed) {
    E.poligono(ctx, [[x - 26 * s, y], [x - 52 * s, y - 20 * s], [x - 52 * s, y + 20 * s]], Object.assign({ papel, seed }, liso));
    E.poligono(ctx, [[x + 26 * s, y], [x + 52 * s, y - 20 * s], [x + 52 * s, y + 20 * s]], Object.assign({ papel, seed: seed + 5 }, liso));
    E.circulo(ctx, x, y, 34 * s, Object.assign({ ry: 26 * s, papel, seed: seed + 9 }, liso));
  }
  function chocolate(ctx, x, y, s) { // x, y é o centro; a barra em gomos
    const w = 210 * s, h = 120 * s;
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.12);
    E.ret(ctx, -w / 2, -h / 2, w, h, { papel: 'noite', r: 10 * s, seed: 220 });
    for (let i = 1; i < 4; i++) E.linha(ctx, [[-w / 2 + (w / 4) * i, -h / 2 + 8 * s], [-w / 2 + (w / 4) * i, h / 2 - 8 * s]], { lw: 3, papel: 'superficie', seed: 221 + i });
    E.linha(ctx, [[-w / 2 + 8 * s, 0], [w / 2 - 8 * s, 0]], { lw: 3, papel: 'superficie', seed: 226 });
    ctx.restore();
  }
  function bolacha(ctx, x, y, s) { // a bolacha recheada de lado: as duas metades e o recheio no meio
    const w = 170 * s;
    E.ret(ctx, x - w / 2, y - 44 * s, w, 34 * s, { papel: 'noite', r: 17 * s, seed: 230 });
    E.ret(ctx, x - w / 2 + 8 * s, y - 12 * s, w - 16 * s, 22 * s, Object.assign({ papel: 'superficie', r: 8 * s, seed: 231 }, liso));
    E.ret(ctx, x - w / 2, y + 8 * s, w, 34 * s, { papel: 'noite', r: 17 * s, seed: 232 });
  }

  // ---------- os desenhos das lâminas ----------
  // capa: o caminho inteiro numa linha: o açúcar, os 15 minutos e a medida de novo
  DS.glicosimetro = (ctx, cx) => {
    const s = Math.min(1.15, (cx.h - 24) / 440), base = cx.y + cx.h - 14;
    const gx = cx.x + 100, rx = cx.x + cx.w * 0.47, ax = cx.x + cx.w - 130 * s;
    const r = 108 * s, ry = base - 172 * s;
    copo(ctx, gx, base, 0.95 * s, { colher: true });
    relogio(ctx, rx, ry, r, { de: 0, ate: 15, hora: 12 });
    aparelho(ctx, ax, base, s, { seta: true });
    E.seta(ctx, [gx + 92 * s, ry], [rx - r - 22 * s, ry], { curva: 0.2, seed: 330 });
    E.seta(ctx, [rx + r + 22 * s, ry], [ax - 128 * s, ry], { curva: 0.2, seed: 331 });
  };

  // conceito: a régua da glicose, com as faixas abaixo de 70 e abaixo de 54. marcas: [70, 54, nome de 0-70, nome de 0-54]
  DS.escala = (ctx, cx, lam, marcas = []) => {
    const [k70, k54, kHipo, kN2] = marcas, V = 120;
    const x0 = cx.x + 20, x1 = cx.x + cx.w - 20, X = (v) => x0 + (v / V) * (x1 - x0);
    const bh = Math.max(76, Math.min(110, cx.h * 0.2)), yb = cx.y + 110 + bh / 2;
    E.ret(ctx, x0, yb - bh / 2, x1 - x0, bh, { papel: 'superficie', r: 12, seed: 340 });
    E.ret(ctx, X(54), yb - bh / 2, X(70) - X(54), bh, Object.assign({ papel: 'destaque', r: 0, contorno: false, seed: 341 }, liso));
    E.ret(ctx, x0, yb - bh / 2, X(54) - x0, bh, Object.assign({ papel: 'alerta', r: 12, contorno: false, seed: 342 }, liso));
    E.ret(ctx, x0, yb - bh / 2, x1 - x0, bh, Object.assign({ papel: null, r: 12, seed: 343 }, liso));
    for (let v = 10; v < V; v += 10) E.linha(ctx, [[X(v), yb + bh / 2], [X(v), yb + bh / 2 + 14]], { lw: 3, seed: 344 + v });
    for (const v of [54, 70]) E.linha(ctx, [[X(v), yb - bh / 2 - 6], [X(v), yb + bh / 2 + 34]], { lw: 6, seed: 360 + v });
    const yn = yb + bh / 2 + 100;
    if (TX[k54]) E.texto(ctx, TX[k54], X(54), yn, { papel: 'numero', size: 64, align: 'center' });
    if (TX[k70]) E.texto(ctx, TX[k70], X(70), yn, { papel: 'numero', size: 64, align: 'center' });
    decor(() => E.texto(ctx, 'mg/dL', x1, yn, { papel: 'numero', size: 34, align: 'right' }));
    if (TX[kHipo]) E.cota(ctx, [x0, yb - bh / 2 - 60], [X(70), yb - bh / 2 - 60], TX[kHipo], { size: 44, seed: 380 });
    if (TX[kN2]) E.cota(ctx, [x0, yn + 74], [X(54), yn + 74], TX[kN2], { size: 44, seed: 381 });
  };

  // sinais: um ícone por sinal, na ordem das palavras D da lâmina
  const SINAIS = [
    (ctx) => { rosto(ctx, -12, 16, 68); [[46, -64, 13], [72, -26, 11], [18, -86, 10]].forEach(([x, y, r], i) => gota(ctx, x, y, r, { papel: 'apoio', seed: 110 + i })); }, // suor
    (ctx) => { // fome: o prato vazio, o garfo e a faca
      E.circulo(ctx, 0, 0, 66, { papel: 'superficie', seed: 120 }); E.circulo(ctx, 0, 0, 44, Object.assign({ papel: null, lw: 3, seed: 121 }, liso));
      E.linha(ctx, [[-92, -40], [-92, 72]], { lw: 6, seed: 122 }); E.linha(ctx, [[-104, -40], [-80, -40]], { lw: 4, seed: 123 });
      for (const d of [-12, 0, 12]) E.linha(ctx, [[-92 + d, -74], [-92 + d, -40]], { lw: 4, seed: 125 + d });
      E.ret(ctx, 82, -72, 18, 144, Object.assign({ papel: 'superficie', r: 9, seed: 140 }, liso));
    },
    (ctx) => { // tremor: a mão aberta e os riscos do tremor dos dois lados
      [[-30, 62], [-10, 74], [10, 70], [30, 58]].forEach(([fx, fh], i) => E.ret(ctx, fx - 9, -16 - fh, 18, fh + 20, Object.assign({ papel: 'pele', r: 9, seed: 150 + i }, liso)));
      E.circulo(ctx, -50, 24, 15, Object.assign({ ry: 32, papel: 'pele', seed: 155 }, liso));
      E.ret(ctx, -42, -20, 84, 92, Object.assign({ papel: 'pele', r: 26, seed: 156 }, liso));
      for (const sd of [-1, 1]) for (const rr of [80, 98]) E.linha(ctx, arco(0, 10, rr, sd > 0 ? -25 : 155, sd > 0 ? 25 : 205, 10), { lw: 4, seed: 157 + rr + sd });
    },
    (ctx) => { // coração acelerado: o coração e o traço do batimento
      const pts = []; for (let i = 0; i < 48; i++) { const t = (i / 48) * Math.PI * 2; pts.push([64 * Math.pow(Math.sin(t), 3), -4 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) - 6]); }
      E.poligono(ctx, pts, { papel: 'alerta', hachura: false, seed: 160 });
      E.linha(ctx, [[-98, 6], [-50, 6], [-36, -34], [-20, 44], [-4, -62], [12, 40], [26, 6], [98, 6]], { lw: 6, seed: 161 });
    },
    (ctx) => { // palidez: a cor de sempre (a bolinha) e o rosto que perdeu a cor
      E.circulo(ctx, -70, -64, 22, Object.assign({ papel: 'pele', seed: 170 }, liso));
      E.seta(ctx, [-50, -52], [-18, -34], { lw: 4, curva: 0, cabeca: 16, seed: 171 });
      rosto(ctx, 18, 22, 64, { pele: 'superficie', boca: 'triste', seed: 172 });
    },
    (ctx) => { // visão turva: o olho e a sombra dele, fora do lugar
      const olho = (dx, dy) => { const t = [], b = []; for (let i = 0; i <= 16; i++) { const u = i / 16, x = dx - 84 + u * 168, hh = 50 * Math.sin(Math.PI * u); t.push([x, dy - hh]); b.push([x, dy + hh]); } return t.concat(b.reverse()); };
      const sombra = olho(16, -16); E.linha(ctx, sombra.concat([sombra[0]]), { lw: 4, tracejado: true, seed: 180 });
      E.poligono(ctx, olho(0, 0), { papel: 'superficie', hachura: false, seed: 181 });
      E.circulo(ctx, 0, 0, 32, Object.assign({ papel: 'apoio', seed: 182 }, liso));
      E.circulo(ctx, 0, 0, 14, Object.assign({ papel: 'tinta', contorno: false, seed: 183 }, liso));
      E.circulo(ctx, 16, -14, 30, Object.assign({ papel: null, lw: 3, seed: 184 }, liso));
    },
  ];
  DS.sinal = (ctx, cx, lam, i) => { const f = SINAIS[i]; if (f) icone(ctx, cx, () => f(ctx)); };

  // opções de 15 g: um desenho por opção, na ordem das palavras D da lâmina
  const OPCOES = [
    (ctx) => copo(ctx, 0, 94, 0.64, { colher: true }),
    (ctx) => { bala(ctx, -60, 38, 0.95, 'destaque', 190); bala(ctx, 60, 38, 0.95, 'apoio', 191); bala(ctx, 0, -34, 0.95, 'alerta', 192); },
    (ctx) => copo(ctx, 0, 94, 1.05, { liquido: 'noite', bolhas: true, nivel: 0.8 }),
    (ctx) => copo(ctx, -10, 94, 1.0, { liquido: 'destaque', laranja: true, nivel: 0.78 }),
  ];
  DS.opcao = (ctx, cx, lam, i) => { const f = OPCOES[i]; if (f) icone(ctx, cx, () => f(ctx)); };

  // passo 3: o copo e o aparelho numa volta (a regra se repete) e a régua com o nível ainda abaixo da linha do 70.
  // marcas: [o número da linha]
  DS.medir = (ctx, cx, lam, marcas = []) => {
    const s = Math.min(1, (cx.h - 20) / 430), base = cx.y + cx.h - 10;
    const gx = cx.x + 120, ax = cx.x + cx.w * 0.5, rx = cx.x + cx.w - 70;
    copo(ctx, gx, base, 0.95 * s, {});
    aparelho(ctx, ax, base, s, { seta: true });
    const yA = base - 170 * s, yB = base - 70 * s;
    E.seta(ctx, [gx + 86 * s, yA], [ax - 130 * s, yA], { curva: 0.28, seed: 290 });
    E.seta(ctx, [ax - 130 * s, yB], [gx + 86 * s, yB], { curva: 0.28, seed: 291 });
    const y0 = cx.y + 40, y1 = base, yl = y0 + (y1 - y0) * 0.45;
    E.ret(ctx, rx - 28, y0, 56, y1 - y0, { papel: 'superficie', r: 14, seed: 292 });
    E.ret(ctx, rx - 28, yl + 60, 56, y1 - yl - 60, Object.assign({ papel: 'alerta', r: 14, seed: 293 }, liso));
    E.linha(ctx, [[rx - 64, yl], [rx + 44, yl]], { lw: 5, tracejado: true, seed: 294 });
    if (marcas[0] && TX[marcas[0]]) E.texto(ctx, TX[marcas[0]], rx - 80, yl + 18, { papel: 'numero', size: 52, align: 'right' });
  };

  // passo 4: o prato com pão integral e maçã, e o relógio em que o ponteiro pequeno andou uma hora
  DS.lanche = (ctx, cx) => {
    const s = Math.min(1, (cx.h - 20) / 430), px = cx.x + cx.w * 0.34, py = cx.y + cx.h / 2, r = 200 * s;
    E.circulo(ctx, px, py, r, { papel: 'superficie', seed: 300 });
    E.circulo(ctx, px, py, r * 0.76, Object.assign({ papel: null, lw: 3, seed: 301 }, liso));
    const bx = px - r * 0.62, by = py - r * 0.42, bw = r * 0.7, bh = r * 0.78;
    E.ret(ctx, bx, by, bw, bh, { papel: 'apoio', r: bw * 0.32, seed: 302 });
    for (let i = 0; i < 9; i++) E.circulo(ctx, bx + bw * (0.24 + 0.26 * (i % 3)) + (Math.floor(i / 3) % 2) * 6, by + bh * (0.26 + 0.24 * Math.floor(i / 3)), 5 * s, Object.assign({ papel: 'apoioEscuro', contorno: false, seed: 303 + i }, liso));
    const mx = px + r * 0.38, my = py + r * 0.14, mr = r * 0.3;
    E.linha(ctx, [[mx, my - mr + 4], [mx + 6 * s, my - mr - 26 * s]], { lw: 5, seed: 313 });
    E.poligono(ctx, [[mx + 6 * s, my - mr - 14 * s], [mx + 40 * s, my - mr - 34 * s], [mx + 22 * s, my - mr - 6 * s]], Object.assign({ papel: 'apoioEscuro', seed: 314 }, liso));
    E.circulo(ctx, mx, my, mr, { papel: 'alerta', hachura: false, seed: 315 });
    const rr = Math.min(118, cx.h * 0.26), rx = cx.x + cx.w * 0.8;
    relogio(ctx, rx, py, rr, { hora: 1, ponteiro: 0 });
    volta(ctx, rx, py, rr + 28, -80, 250);
  };

  // erro comum: o chocolate e a bolacha recheada, riscados; do outro lado, o copo com açúcar, certo
  DS.erro = (ctx, cx) => {
    const s = Math.min(1, (cx.h - 20) / 420), mid = cx.x + cx.w * 0.6, pad = 30;
    chocolate(ctx, cx.x + 170, cx.y + cx.h * 0.36, s);
    bolacha(ctx, cx.x + 380, cx.y + cx.h * 0.68, s);
    E.linha(ctx, [[cx.x + pad, cx.y + pad], [mid - pad - 20, cx.y + cx.h - pad]], { papel: 'alerta', lw: 16, seed: 320 });
    E.linha(ctx, [[mid - pad - 20, cx.y + pad], [cx.x + pad, cx.y + cx.h - pad]], { papel: 'alerta', lw: 16, seed: 321 });
    E.linha(ctx, [[mid, cx.y + 10], [mid, cx.y + cx.h - 10]], { lw: 3, tracejado: true, seed: 322 });
    copo(ctx, mid + (cx.x + cx.w - mid) / 2, cx.y + cx.h - 20, 1.08 * s, { colher: true });
    DS.certo(ctx, mid + 70, cx.y + 70, 1.6);
  };

})();
