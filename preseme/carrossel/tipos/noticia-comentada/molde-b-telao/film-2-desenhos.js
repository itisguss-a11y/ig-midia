// PRESEME · carrossel · série Notícia comentada · desenho 2 · os desenhos da peça, feitos uma vez com o kit de estilos e
// usados pelos três moldes (cada molde os desenha no estilo dele). PRESEME.DESENHO[nome](ctx, ...). Desenho parado.
// Dizeres fixos de objeto (as siglas do mapa) vão dentro de G.decor: são do objeto, não do textos.txt.
(function () {
  const G = globalThis.G, E = globalThis.ESTILOS, P = globalThis.PRESEME;
  const h = (a, b) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };

  // o mapa do Brasil em quadradinhos (um por estado, na posição aproximada de cada um)
  const GRADE = ['. RR AP . . .', 'AM PA MA CE RN .', 'AC RO TO PI PB PE', '. MT GO DF BA AL', '. MS MG ES SE .', '. SP RJ . . .', '. PR . . . .', '. SC . . . .', '. RS . . . .'];
  const NORTE = new Set(['RR', 'AP', 'AM', 'PA', 'AC', 'RO', 'TO']);
  // mapa(ctx, { x, y, cel, gap, so: 'norte' ou null, acesas: [...], fortes: [...], cores }): devolve o centro de cada sigla
  P.DESENHO.mapa = (ctx, o = {}) => {
    const cel = o.cel || 80, gap = o.gap ?? 10, passo = cel + gap, acesas = new Set(o.acesas || []), fortes = new Set(o.fortes || []);
    const cor = Object.assign({ apagada: 'superficie', acesa: 'floresta', forte: 'marca', letraApagada: 'folha', letraAcesa: 'papel', letraForte: 'floresta', tinta: 'tinta' }, o.cores || {});
    const centros = {};
    let col0 = 0, lin0 = 0;
    if (o.so === 'norte') { col0 = 0; lin0 = 0; }
    GRADE.forEach((linha, r) => linha.split(' ').forEach((uf, c) => {
      if (uf === '.' || (o.so === 'norte' && !NORTE.has(uf))) return;
      const x = o.x + (c - col0) * passo, y = o.y + (r - lin0) * passo;
      const papel = fortes.has(uf) ? cor.forte : acesas.has(uf) ? cor.acesa : cor.apagada;
      E.ret(ctx, x, y, cel, cel, { papel, r: Math.round(cel * 0.16), hachura: false, contorno: o.contorno ?? true, tinta: cor.tinta, lw: o.lw, sombra: o.sombra, seed: 200 + r * 7 + c });
      const letra = fortes.has(uf) ? cor.letraForte : acesas.has(uf) ? cor.letraAcesa : cor.letraApagada;
      G.decor(() => E.texto(ctx, uf, x + cel / 2, y + cel / 2 + cel * 0.15, { papel: 'numero', size: Math.round(cel * 0.38), align: 'center', cor: letra }));
      centros[uf] = [x + cel / 2, y + cel / 2];
    }));
    return centros;
  };
  P.DESENHO.mapaTamanho = (cel, gap, so) => (so === 'norte' ? { w: 3 * (cel + gap) - gap, h: 3 * (cel + gap) - gap } : { w: 6 * (cel + gap) - gap, h: 9 * (cel + gap) - gap });

  // o recorte de jornal: papel com as bordas de cima e de baixo rasgadas
  P.DESENHO.recorte = (ctx, x, y, w, hh, o = {}) => {
    const seed = o.seed || 3, dente = o.dente || 9, pts = [];
    const n = Math.max(8, Math.round(w / 26));
    for (let i = 0; i <= n; i++) pts.push([x + (w * i) / n, y + (h(seed, i) - 0.5) * dente * 2]);
    for (let i = n; i >= 0; i--) pts.push([x + (w * i) / n, y + hh + (h(seed + 9, i) - 0.5) * dente * 2]);
    E.poligono(ctx, pts, { papel: o.papel || 'branco', hachura: false, contorno: o.contorno ?? false, sombra: o.sombra ?? true, sombraX: 8, sombraY: 10, seed });
  };

  // o oxímetro de dedo: a tela com a onda do pulso
  P.DESENHO.oximetro = (ctx, cx, cy, s = 1, o = {}) => {
    const w = 170 * s, hh = 120 * s;
    E.ret(ctx, cx - w * 0.92, cy - 26 * s, w * 0.62, 52 * s, { papel: 'pele', r: 26 * s, hachura: false, seed: 61 }); // o dedo
    E.ret(ctx, cx - w / 2, cy - hh / 2, w, hh, { papel: o.corpo || 'superficie', r: 30 * s, hachura: false, seed: 62 });
    E.ret(ctx, cx - w / 2 + 24 * s, cy - hh / 2 + 22 * s, w - 48 * s, hh - 44 * s, { papel: 'floresta', r: 10 * s, hachura: false, contorno: false, seed: 63 });
    const x0 = cx - w / 2 + 34 * s, x1 = cx + w / 2 - 34 * s, yb = cy + 8 * s, pts = [];
    for (let i = 0; i <= 28; i++) { const u = i / 28, f = (u * 2.2) % 1; pts.push([x0 + (x1 - x0) * u, yb - (f < 0.12 ? f / 0.12 : f < 0.3 ? 1 - (f - 0.12) / 0.18 * 1.3 : -0.3 + (f - 0.3) * 0.43) * 26 * s]); }
    E.linha(ctx, pts, { papel: 'marca', lw: 5 * s, seed: 64 });
  };

  // os pulmões (falta de ar); rapido: true põe os riscos de vento (respiração rápida)
  P.DESENHO.pulmoes = (ctx, cx, cy, s = 1, o = {}) => {
    const papel = o.papel || 'apoio';
    E.circulo(ctx, cx - 46 * s, cy + 12 * s, 40 * s, { ry: 62 * s, papel, hachura: false, seed: 71 });
    E.circulo(ctx, cx + 46 * s, cy + 12 * s, 40 * s, { ry: 62 * s, papel, hachura: false, seed: 72 });
    E.linha(ctx, [[cx, cy - 74 * s], [cx, cy - 22 * s]], { lw: 7 * s, seed: 73 });
    E.linha(ctx, [[cx - 30 * s, cy + 2 * s], [cx, cy - 22 * s], [cx + 30 * s, cy + 2 * s]], { lw: 6 * s, seed: 74 });
    if (o.rapido) for (let i = 0; i < 3; i++) E.linha(ctx, [[cx + 104 * s, cy - 34 * s + i * 30 * s], [cx + 150 * s + (i % 2) * 18 * s, cy - 34 * s + i * 30 * s]], { lw: 6 * s, seed: 75 + i });
  };

  // o termômetro (o caso leve: sintoma de gripe)
  P.DESENHO.termometro = (ctx, cx, cy, s = 1) => {
    E.ret(ctx, cx - 18 * s, cy - 120 * s, 36 * s, 150 * s, { papel: 'superficie', r: 18 * s, hachura: false, seed: 81 });
    E.circulo(ctx, cx, cy + 46 * s, 34 * s, { papel: 'alerta', hachura: false, seed: 82 });
    E.ret(ctx, cx - 8 * s, cy - 70 * s, 16 * s, 110 * s, { papel: 'alerta', r: 8 * s, hachura: false, contorno: false, seed: 83 });
    for (let i = 0; i < 5; i++) E.linha(ctx, [[cx + 18 * s, cy - 100 * s + i * 24 * s], [cx + 34 * s, cy - 100 * s + i * 24 * s]], { lw: 4 * s, seed: 84 + i });
  };

  // a seringa da vacina
  P.DESENHO.seringa = (ctx, cx, cy, s = 1, rot = -0.6) => {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
    E.ret(ctx, -150 * s, -10 * s, 70 * s, 20 * s, { papel: 'superficie', r: 6 * s, hachura: false, seed: 91 }); // o êmbolo
    E.ret(ctx, -168 * s, -34 * s, 20 * s, 68 * s, { papel: 'superficie', r: 6 * s, hachura: false, seed: 92 });
    E.ret(ctx, -84 * s, -36 * s, 190 * s, 72 * s, { papel: 'superficie', r: 12 * s, hachura: false, seed: 93 }); // o tubo
    E.ret(ctx, -10 * s, -26 * s, 106 * s, 52 * s, { papel: 'apoio', r: 8 * s, hachura: false, contorno: false, seed: 94 }); // a dose
    for (let i = 0; i < 5; i++) E.linha(ctx, [[-60 * s + i * 30 * s, -36 * s], [-60 * s + i * 30 * s, -16 * s]], { lw: 4 * s, seed: 95 + i });
    E.ret(ctx, 106 * s, -14 * s, 26 * s, 28 * s, { papel: 'superficie', r: 4 * s, hachura: false, seed: 101 });
    E.linha(ctx, [[132 * s, 0], [210 * s, 0]], { lw: 5 * s, seed: 102 });
    ctx.restore();
  };

  // certo e errado (traço, nunca letra)
  P.DESENHO.certo = (ctx, x, y, s = 1, papel = 'apoioEscuro') => E.linha(ctx, [[x - 22 * s, y], [x - 6 * s, y + 18 * s], [x + 26 * s, y - 22 * s]], { papel, lw: 10 * s, seed: 111 });
  P.DESENHO.errado = (ctx, x, y, s = 1, papel = 'alerta') => {
    E.linha(ctx, [[x - 20 * s, y - 20 * s], [x + 20 * s, y + 20 * s]], { papel, lw: 10 * s, seed: 112 });
    E.linha(ctx, [[x + 20 * s, y - 20 * s], [x - 20 * s, y + 20 * s]], { papel, lw: 10 * s, seed: 113 });
  };

  // a linha dos 10 dias: os 5 primeiros cheios (isolamento) e a faixa da máscara até o 10º. Devolve as medidas.
  P.DESENHO.dias = (ctx, x, y, w, o = {}) => {
    const n = o.n || 10, iso = o.iso || 5, gap = o.gap ?? 12, c = (w - gap * (n - 1)) / n, hh = o.alt || c;
    for (let i = 0; i < n; i++) E.ret(ctx, x + i * (c + gap), y, c, hh, { papel: i < iso ? (o.cheio || 'floresta') : (o.vazio || 'superficie'), r: Math.min(14, c * 0.2), hachura: false, seed: 120 + i });
    const yb = y + hh + (o.folga ?? 22), hb = o.faixa || 26;
    E.ret(ctx, x, yb, w, hb, { papel: o.corFaixa || 'marca', r: hb / 2, hachura: false, contorno: o.contornoFaixa ?? false, seed: 140 });
    return { c, gap, hh, yb, hb, xIso: x + iso * (c + gap) - gap };
  };
})();
