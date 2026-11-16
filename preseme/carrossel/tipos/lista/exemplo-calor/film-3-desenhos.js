// PRESEME · carrossel · tipo LISTA · exemplo "5 cuidados no calor forte" · desenho 3 · os desenhos do assunto.
// Um desenho por item (água, álcool e cafeína, hora fresca, prato leve, coração e pulmão) e o da capa. A biblioteca dá
// a pessoa, o relógio, a xícara, o prato, o coração e a gota; o kit do tipo, o certo e o errado; o sol é do kit de
// estilos. Os desenhos novos (garrafa, lata, pulmões, ondas de calor) ficam em PRESEME.NOVOS: candidatos à biblioteca.
(function () {
  const P = globalThis.PRESEME, DS = P.DESENHO, E = globalThis.ESTILOS, TX = globalThis.TEXTOS;
  const so = (o) => Object.assign({ sombra: false, hachura: false }, o);

  // ---------- desenhos novos (candidatos à biblioteca) ----------
  // a garrafa de água: x, y é o pé; s o tamanho; nivel de 0 a 1 (a água dentro)
  function garrafa(ctx, { x, y, s = 1, nivel = 0.7, seed = 900 } = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const w = 96, h = 250;
    E.ret(ctx, -w / 2, -h, w, h, { papel: 'superficie', r: 26, seed });
    const hn = (h - 36) * nivel;
    E.ret(ctx, -w / 2 + 9, -hn - 9, w - 18, hn, so({ papel: 'apoio', r: 18, contorno: false, seed: seed + 1 }));
    E.ret(ctx, -w * 0.36, -h - 26, w * 0.72, 30, { papel: 'superficie', r: 8, seed: seed + 2 });
    E.ret(ctx, -w * 0.3, -h - 52, w * 0.6, 30, { papel: 'apoioEscuro', r: 8, seed: seed + 3 });
    E.ret(ctx, -w / 2 + 2, -h * 0.6, w - 4, 46, so({ papel: 'destaque', r: 4, seed: seed + 4 }));
    ctx.restore();
    return { boca: [x, y - (h + 52) * s] };
  }
  // a lata de bebida: x, y é o pé; s o tamanho
  function lata(ctx, { x, y, s = 1, seed = 920 } = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const w = 110, h = 200;
    E.ret(ctx, -w / 2, -h, w, h, { papel: 'alerta', r: 14, seed });
    E.ret(ctx, -w / 2 + 6, -h - 14, w - 12, 20, so({ papel: 'superficie', r: 8, seed: seed + 1 }));
    E.ret(ctx, -w / 2, -h * 0.62, w, 64, so({ papel: 'superficie', r: 2, seed: seed + 2 }));
    E.circulo(ctx, 0, -h * 0.62 + 32, 18, so({ papel: 'alerta', lw: 3, seed: seed + 3 }));
    ctx.restore();
  }
  // os pulmões: x, y é o centro; s o tamanho
  function pulmoes(ctx, { x, y, s = 1, papel = 'apoio', seed = 940 } = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    E.linha(ctx, [[0, -120], [0, -40], [-34, -6]], { lw: 12, seed });
    E.linha(ctx, [[0, -40], [34, -6]], { lw: 12, seed: seed + 1 });
    for (const d of [-1, 1]) {
      const lobo = [[d * 22, -84], [d * 74, -96], [d * 112, -40], [d * 120, 40], [d * 104, 92], [d * 60, 104], [d * 26, 84], [d * 20, 10]];
      E.poligono(ctx, lobo, { papel, seed: seed + 2 + (d > 0 ? 1 : 0) });
    }
    ctx.restore();
  }
  // as ondas de calor: três linhas onduladas subindo (x, y é o pé da do meio; h a altura)
  function ondas(ctx, { x, y, h = 160, seed = 960 } = {}) {
    for (let j = -1; j <= 1; j++) {
      const pts = [];
      for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push([x + j * 46 + Math.sin(t * Math.PI * 3) * 12, y - t * h]); }
      E.linha(ctx, pts, { papel: 'alerta', lw: 6, seed: seed + j + 1 });
    }
  }
  P.NOVOS = { garrafa, lata, pulmoes, ondas };

  // ---------- os desenhos da peça ----------
  // capa: o sol forte, o calouro a caminho da visita com a garrafa na mão e as ondas de calor
  DS.capaCalor = (ctx, cx) => {
    const B = globalThis.BIB, K = P.KIT;
    const yc = cx.y + cx.h - 30;
    E.objeto(ctx, 'sol', { x: cx.x + cx.w - 140, y: cx.y + 120, r: 70 });
    ondas(ctx, { x: cx.x + cx.w - 140, y: cx.y + 330, h: 120 });
    E.linha(ctx, [[cx.x, yc], [cx.x + cx.w, yc]], { lw: 5, seed: 970 });
    B.pessoa(ctx, { quem: 'calouro', x: cx.x + 270, y: yc, s: Math.min(1, (cx.h - 40) / 520), pose: 'stand', gesture: 'wave' });
    garrafa(ctx, { x: cx.x + 470, y: yc, s: Math.min(1, (cx.h - 40) / 420) });
    if (K) K.certo(ctx, cx.x + 470, yc - Math.min(1, (cx.h - 40) / 420) * 380, 1.3);
  };
  // 1 · água o dia todo: a garrafa, as gotas que o calor tira do corpo e o sol
  DS.agua = (ctx, cx) => {
    const B = globalThis.BIB;
    const yc = cx.y + cx.h - 20, s = Math.min(1.5, (cx.h - 60) / 330);
    E.objeto(ctx, 'sol', { x: cx.x + cx.w - 130, y: cx.y + 110, r: 62 });
    garrafa(ctx, { x: cx.x + cx.w * 0.34, y: yc, s, nivel: 0.75 });
    for (let i = 0; i < 4; i++) B.gota(ctx, { x: cx.x + cx.w * 0.62 + (i % 2) * 70, y: cx.y + cx.h * 0.35 + i * 70, r: 22, papel: 'apoio', seed: 980 + i });
  };
  // 2 · sem álcool e sem cafeína: a lata e o café, os dois com o errado
  DS.alcool = (ctx, cx) => {
    const B = globalThis.BIB, K = P.KIT;
    const yc = cx.y + cx.h - 30, s = Math.min(1.4, (cx.h - 80) / 260);
    lata(ctx, { x: cx.x + cx.w * 0.3, y: yc, s });
    B.xicara(ctx, { x: cx.x + cx.w * 0.7, y: yc, s: s * 2.4 });
    const yx = yc - 214 * s - 80; // o errado em cima dos dois, na mesma altura
    K.errado(ctx, cx.x + cx.w * 0.3, yx, 2.2);
    K.errado(ctx, cx.x + cx.w * 0.7, yx, 2.2);
  };
  // 3 · rua na hora fresca: três relógios (manhã cedo, meio-dia, fim da tarde), o certo e o errado embaixo
  DS.hora = (ctx, cx, lam, palavras) => {
    const B = globalThis.BIB, K = P.KIT;
    const r = Math.min(120, cx.w / 8, (cx.h - 200) / 2.6), y = cx.y + cx.h * 0.42;
    const hs = [6.5, 12, 17.5];
    hs.forEach((h, i) => {
      const x = cx.x + cx.w * (0.17 + i * 0.33);
      B.relogio(ctx, { x, y, r, hora: h, rotulo: TX[palavras[i]] || '', seed: 990 + i * 7 });
      if (i === 1) K.errado(ctx, x, y + r + 110, 1.6); else K.certo(ctx, x, y + r + 110, 1.6);
    });
    E.objeto(ctx, 'sol', { x: cx.x + cx.w * 0.5, y: y - r - 64, r: 36 });
  };
  // 4 · prato leve: o prato pesado (montanha de comida) com o errado e o leve com o certo
  DS.prato = (ctx, cx) => {
    const B = globalThis.BIB, K = P.KIT;
    const s = Math.min(3.4, cx.w / 300), y = cx.y + cx.h * 0.52;
    const xa = cx.x + cx.w * 0.27, xb = cx.x + cx.w * 0.73;
    // o prato pesado: o prato e um monte de comida em cima (arroz, feijão, carne, farofa), mais alto que o prato
    B.prato(ctx, { x: xa, y, s });
    const monte = [[-22, -14, 22, 'superficie'], [18, -16, 20, 'apoioEscuro'], [-4, -30, 22, 'destaque'], [-24, -44, 16, 'alerta'], [14, -46, 18, 'apoioEscuro'], [-4, -62, 17, 'superficie']];
    monte.forEach(([dx, dy, r, papel], i) => E.circulo(ctx, xa + dx * s, y + dy * s, r * s, { papel, seed: 1010 + i, sombra: false }));
    B.prato(ctx, { x: xb, y, s });
    K.errado(ctx, xa, y + 60 * s, 1.8);
    K.certo(ctx, xb, y + 60 * s, 1.8);
  };
  // 5 · atenção ao coração e ao pulmão: o sol puxando esforço dos dois
  DS.coracao = (ctx, cx) => {
    const B = globalThis.BIB;
    const s = Math.min(1.4, (cx.h - 140) / 280), y = cx.y + cx.h * 0.6;
    E.objeto(ctx, 'sol', { x: cx.x + cx.w * 0.5, y: cx.y + 70, r: 50 });
    ondas(ctx, { x: cx.x + cx.w * 0.5, y: cx.y + 260, h: 110 });
    B.coracao(ctx, { x: cx.x + cx.w * 0.27, y, s: s * 3.2 });
    pulmoes(ctx, { x: cx.x + cx.w * 0.73, y, s });
  };
})();
