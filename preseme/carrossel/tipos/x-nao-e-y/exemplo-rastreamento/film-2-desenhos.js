// PRESEME · carrossel · X não é Y · desenho 2 · os desenhos DESTA peça (rastreamento não é diagnóstico precoce). TROQUE
// na peça nova. O molde (film-3-moldes.js) chama PRESEME.DESENHO.cena[id da lâmina](ctx, caixa, lam), com caixa =
// { x, y, w, h }, o espaço livre que o molde deixou; na capa, cena.capaX e cena.capaY (um por lado); no caso, cena[id] é
// uma lista com dois desenhos, um por coluna. Rótulo de desenho vem do textos.txt (palavras D), escrito com P.bloco.
// Desenho parado. Pele e cabelo das pessoas são as únicas cores fora da paleta (estão no peca.json).
(function () {
  const G = globalThis.G, E = globalThis.ESTILOS, P = globalThis.PRESEME, DS = P.DESENHO;
  DS.cena = DS.cena || {};

  // ---- ajudas ----
  // a cor que não some: no estilo em que o papel pedido é a cor do fundo (Sálvia no chapado), usa a outra
  const naoSome = (papel, outra) => (E.cor(papel) === E.cor('fundo') ? outra : papel);
  const rotulo = (ctx, k, cx, y, w, h = 56, o = {}) => P.bloco(ctx, k, { x: cx - w / 2, y, w, h }, Object.assign({ papel: 'mao', sizes: [46, 42, 40, 38, 36], align: 'center', maxLinhas: 2, lh: 1.04 }, o));
  // a pessoa simples (cabeça e corpo), em pé com os pés em y; o.sinal marca um sinal no peito (o anel de Coral)
  function pessoa(ctx, x, y, s = 1, o = {}) {
    const pp = naoSome(o.papel || 'apoio', 'superficie');
    E.ret(ctx, x - 26 * s, y - 62 * s, 52 * s, 62 * s, { papel: pp, r: 22 * s, seed: (o.seed || 600) + 1 });
    E.circulo(ctx, x, y - 84 * s, 19 * s, { papel: pp, seed: (o.seed || 600) + 2 });
    if (o.sinal) E.circulo(ctx, x + 6 * s, y - 42 * s, 11 * s, { papel: null, tinta: 'alerta', lw: 5 * s, hachura: false, seed: (o.seed || 600) + 3 });
  }
  // a peneira: o aro, a tela e o cabo; cx, cy é o centro do aro, w a largura
  function peneira(ctx, cx, cy, w, seed = 620) {
    const a = w / 2, b = a * 0.5, fundo = [];
    for (let i = 0; i <= 24; i++) { const t = (i / 24) * Math.PI; fundo.push([cx + a * Math.cos(t), cy + b * Math.sin(t)]); }
    E.ret(ctx, cx + a - 6, cy - 12, w * 0.32, 24, { papel: 'apoioEscuro', r: 10, seed: seed + 9 });
    E.poligono(ctx, fundo, { papel: 'superficie', seed, hachura: false });
    for (let x = cx - a + 24; x < cx + a - 10; x += 26) { const u = (x - cx) / a, yb = cy + b * Math.sqrt(Math.max(0, 1 - u * u)); E.linha(ctx, [[x, cy + 4], [x, yb - 4]], { lw: 2.5, seed: seed + 1 + Math.round(x) % 7 }); }
    for (let y = cy + 22; y < cy + b - 6; y += 22) { const v = (y - cy) / b, xa = a * Math.sqrt(Math.max(0, 1 - v * v)); E.linha(ctx, [[cx - xa + 6, y], [cx + xa - 6, y]], { lw: 2.5, seed: seed + 3 + Math.round(y) % 5 }); }
    E.circulo(ctx, cx, cy, a, { ry: a * 0.14, papel: null, lw: 8, hachura: false, seed: seed + 8 });
  }
  // a lupa: a lente e o cabo (cx, cy é o centro da lente)
  function lupa(ctx, cx, cy, r, seed = 640) {
    E.linha(ctx, [[cx + r * 0.7, cy + r * 0.7], [cx + r * 1.7, cy + r * 1.7]], { lw: Math.max(10, r * 0.32), seed: seed + 1 });
    E.circulo(ctx, cx, cy, r, { papel: naoSome('apoio', 'superficie'), lw: Math.max(6, r * 0.14), seed });
    E.linha(ctx, [[cx - r * 0.45, cy - r * 0.2], [cx - r * 0.15, cy - r * 0.52]], { papel: 'superficie', lw: Math.max(4, r * 0.1), seed: seed + 2 });
  }
  // o calendário com os meses e dois marcados (a rotina)
  function calendario(ctx, cx, cy, w, seed = 660) {
    const h = w * 0.9, x = cx - w / 2, y = cy - h / 2, c = (w - 28) / 4;
    E.ret(ctx, x, y, w, h, { papel: 'superficie', r: 12, seed });
    E.ret(ctx, x, y, w, h * 0.2, { papel: 'apoioEscuro', r: 12, seed: seed + 1 });
    for (let i = 0; i < 12; i++) E.ret(ctx, x + 14 + (i % 4) * c, y + h * 0.27 + Math.floor(i / 4) * c * 0.78, c - 10, c * 0.62, { papel: i === 1 || i === 9 ? 'destaque' : 'apoio', r: 5, seed: seed + 2 + i, hachura: false, lw: 2 });
  }
  // o visto (certo) e o X (não recomendado), em linhas
  const visto = (ctx, cx, cy, r, seed = 680) => E.linha(ctx, [[cx - r, cy], [cx - r * 0.3, cy + r * 0.7], [cx + r, cy - r * 0.8]], { papel: E.escuro() ? 'destaque' : 'apoioEscuro', lw: Math.max(7, r * 0.28), seed });
  const xis = (ctx, cx, cy, r, seed = 690) => { E.linha(ctx, [[cx - r, cy - r], [cx + r, cy + r]], { papel: 'alerta', lw: Math.max(7, r * 0.26), seed }); E.linha(ctx, [[cx + r, cy - r], [cx - r, cy + r]], { papel: 'alerta', lw: Math.max(7, r * 0.26), seed: seed + 1 }); };
  // a mulher do caso: a moradora do kit, com o cabelo e a roupa de cada uma
  const mulher = (ctx, x, y, s, o = {}) => E.personagem(ctx, Object.assign({ quem: 'moradora', x, y, s, pose: 'stand', mouth: 'smile', seed: 700 }, o));

  // ---- as cenas, uma por lâmina (o id é o do score.js) ----
  // capa, lado X: a fila de gente igual entrando na peneira
  DS.cena.capaX = (ctx, b) => {
    const s = Math.min(1.25, b.w / 330, b.h / 330), cx = b.x + b.w / 2, yp = b.y + 130 * s;
    for (let i = 0; i < 3; i++) pessoa(ctx, cx - 100 * s + i * 90 * s, yp, 1.05 * s, { seed: 600 + i * 5 });
    peneira(ctx, cx - 20 * s, yp + 80 * s, 290 * s);
  };
  // capa, lado Y: uma pessoa com o sinal marcado e a lupa em cima dele
  DS.cena.capaY = (ctx, b) => {
    const s = Math.min(1.25, b.w / 330, b.h / 330), cx = b.x + b.w / 2, yp = b.y + 250 * s;
    pessoa(ctx, cx - 50 * s, yp, 2.4 * s, { sinal: true, seed: 650 });
    lupa(ctx, cx + 80 * s, yp - 175 * s, 52 * s);
  };

  // X: o rastreamento, a peneira passando por quem não tem sinal nem sintoma
  DS.cena.conceitoX = (ctx, b, lam) => {
    const s = Math.min(1.1, b.w / 820, b.h / 380), cx = b.x + b.w / 2;
    const k = lam.palavras[1], r = k ? rotulo(ctx, k, cx, b.y, b.w, 56) : { y1: b.y };
    const yp = r.y1 + 130 * s;
    for (let i = 0; i < 7; i++) pessoa(ctx, cx - 300 * s + i * 100 * s, yp, 0.9 * s, { seed: 600 + i * 5 });
    E.seta(ctx, [cx - 150 * s, yp + 12 * s], [cx - 90 * s, yp + 66 * s], { lw: 6, curva: 0.1, cabeca: 20, seed: 631 });
    E.seta(ctx, [cx + 150 * s, yp + 12 * s], [cx + 90 * s, yp + 66 * s], { lw: 6, curva: -0.1, cabeca: 20, seed: 632 });
    peneira(ctx, cx, yp + 100 * s, 420 * s);
  };
  // Y: o diagnóstico precoce, quem já tem um sinal vai direto para a investigação
  DS.cena.conceitoY = (ctx, b, lam) => {
    const s = Math.min(1.35, b.w / 700, b.h / 380), cx = b.x + b.w / 2;
    const k = lam.palavras[1], r = k ? rotulo(ctx, k, b.x + b.w * 0.25, b.y, b.w * 0.5, 56) : { y1: b.y };
    const yp = Math.min(b.y + b.h - 4, r.y1 + 300 * s);
    pessoa(ctx, b.x + b.w * 0.25, yp, 2.6 * s, { sinal: true, seed: 650 });
    E.seta(ctx, [b.x + b.w * 0.25 + 90 * s, yp - 150 * s], [cx + 120 * s, yp - 150 * s], { lw: 8, curva: -0.12, cabeca: 30, seed: 655 });
    lupa(ctx, cx + 230 * s, yp - 170 * s, 70 * s);
  };

  // o caso: duas mulheres na mesma UBS (a de 55, da rotina; a de 42, com o nódulo)
  DS.cena.caso = [
    (ctx, b) => {
      const s = Math.min(0.86, b.h / 430), cx = b.x + b.w / 2;
      mulher(ctx, cx - 80, b.y + b.h - 6, s, { look: 0.5, seed: 701, style: { hair: E.GENTE.branco, hairStyle: 'bun', shirt: E.PAL.salvia } });
      calendario(ctx, cx + 120, b.y + 90, 140, 660);
    },
    (ctx, b) => {
      const s = Math.min(0.86, b.h / 430), cx = b.x + b.w / 2;
      mulher(ctx, cx - 80, b.y + b.h - 6, s, { look: 0.5, seed: 702, style: { hairStyle: 'ponytail', shirt: E.PAL.marca } });
      lupa(ctx, cx + 105, b.y + 70, 50, 670);
    },
  ];

  // a balança: o benefício pesa mais que o risco (na faixa da rotina)
  DS.cena.balanca = (ctx, b, lam) => {
    const [, kb, kr] = lam.palavras, s = Math.min(1, b.w / 820, b.h / 380), cx = b.x + b.w / 2, yt = b.y + 40 * s;
    const ang = 0.16, bw = 300 * s, pa = [cx - bw * Math.cos(ang), yt + bw * Math.sin(ang)], pb = [cx + bw * Math.cos(ang), yt - bw * Math.sin(ang)];
    E.ret(ctx, cx - 11 * s, yt, 22 * s, b.y + b.h - 26 - yt, { papel: 'apoioEscuro', r: 6, seed: 710 });
    E.ret(ctx, cx - 110 * s, b.y + b.h - 30, 220 * s, 26, { papel: 'apoioEscuro', r: 8, seed: 713 });
    E.linha(ctx, [pa, pb], { lw: 10 * s, seed: 711 });
    E.circulo(ctx, cx, yt, 14 * s, { papel: 'tinta', hachura: false, seed: 712 });
    const prato = (p, seed, peso) => {
      const yp = p[1] + 110 * s;
      E.linha(ctx, [p, [p[0] - 70 * s, yp]], { lw: 3, seed }); E.linha(ctx, [p, [p[0] + 70 * s, yp]], { lw: 3, seed: seed + 1 });
      E.ret(ctx, p[0] - peso * s / 2, yp - peso * 0.8 * s, peso * s, peso * 0.8 * s, { papel: 'destaque', r: 8, seed: seed + 3 });
      E.circulo(ctx, p[0], yp, 92 * s, { ry: 18 * s, papel: 'superficie', seed: seed + 2 });
      return yp;
    };
    const ya = prato(pa, 720, 120), yb = prato(pb, 730, 60);
    if (kb) rotulo(ctx, kb, pa[0], ya + 30 * s, 280, 60, { maxLinhas: 1 });
    if (kr) rotulo(ctx, kr, pb[0], yb + 30 * s, 280, 60, { maxLinhas: 1 });
  };

  // a próstata: sem sinal nem sintoma, o exame de rotina em todo homem não é recomendado; com sinal, investigação logo
  DS.cena.prostata = (ctx, b, lam) => {
    const [, ka, kb, kra, krb] = lam.palavras, wc = (b.w - 60) / 2, s = Math.min(1.25, b.h / 400);
    [[ka, kra, b.x, false], [kb, krb, b.x + wc + 60, true]].forEach(([k1, k2, x, sinal], i) => {
      const cx = x + wc / 2;
      const r1 = k1 ? rotulo(ctx, k1, cx, b.y, wc, 60, { sizes: [42, 40, 38, 36] }) : { y1: b.y };
      const yp = r1.y1 + 18 + 160 * s; // os pés; a cabeça fica logo abaixo do rótulo, sem encostar nele
      pessoa(ctx, cx, yp, 1.55 * s, { sinal, seed: 740 + i * 6, papel: 'apoio' });
      E.seta(ctx, [cx, yp + 12 * s], [cx, yp + 66 * s], { lw: 7, curva: 0, cabeca: 22, seed: 750 + i });
      const yc = yp + 76 * s;
      const hc = Math.max(100, 118 * s);
      E.ret(ctx, x + 6, yc, wc - 12, hc, { papel: 'superficie', r: 14, seed: 760 + i, sombra: true });
      if (k2) P.bloco(ctx, k2, { x: x + 26, y: yc + 8, w: wc - 120, h: hc - 16 }, { papel: 'mao', sizes: [46, 42, 40, 38, 36], valign: 'middle', maxLinhas: 2, lh: 1.02 });
      if (sinal) visto(ctx, x + wc - 56, yc + hc / 2, 24, 770); else xis(ctx, x + wc - 56, yc + hc / 2, 22, 780);
    });
  };
})();
