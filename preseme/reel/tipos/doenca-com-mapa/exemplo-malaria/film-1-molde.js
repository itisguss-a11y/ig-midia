// PRESEME · série "Doença de Roraima" · desenho 1/3 · o molde (igual em toda peça da série; o chat não mexe aqui)
// Texto que se quebra sozinho, o rótulo fixo da série no alto de cada cena, o selo de Roraima no canto (a cara da série),
// o mapa de Roraima com o contorno real dos municípios (IBGE), o contador e a barra "1 em cada N".
// Cores e letras vêm do kit de estilos (ferramentas/estilos.js): a mesma peça sai em giz, planta ou chapado trocando o ESTILO do score.js.
(function () {
  const U = globalThis.U, G = globalThis.G, E = globalThis.ESTILOS, SC = globalThis.SCORE, TX = globalThis.TEXTOS;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const L = SAFE.x, R = SAFE.x + SAFE.w, TOP = SAFE.y, BOT = SAFE.y + SAFE.h, CX = (L + R) / 2; // 60, 940, 221, 1498, 500
  const BASE = 700, NB = ' ';
  const D = (k) => TX[k] || '';
  const P = () => globalThis.PECA || {};
  const cor = (p) => E.cor(p);
  const RR = { dados: null }; // o mapa de Roraima, carregado no init do filme (assets/rr.json)

  // ---------- texto ----------
  const fonte = (papel = 'corpo') => E.letra(papel); // [família, peso, escala]
  const wid = (ctx, s, size, papel = 'corpo') => { const [fam, w, k] = fonte(papel); return G.measure(ctx, s, Math.round(size * k), fam, w); };
  const escrever = (ctx, s, x, y, { size = 56, papel = 'corpo', cor: c = 'texto', align = 'left', alpha = 1 } = {}) => E.texto(ctx, s, x, y, { papel, size, align, cor: c, alpha });

  function quebrar(ctx, s, size, maxW, papel) {
    const out = []; let cur = '';
    for (const w of s.split(' ')) {
      const t = cur ? cur + ' ' + w : w;
      if (cur && wid(ctx, t, size, papel) > maxW) { out.push(cur); cur = w; } else cur = t;
    }
    if (cur) out.push(cur);
    return out;
  }
  const FRACA = new Set(['a', 'o', 'as', 'os', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'e', 'em', 'no', 'na', 'nos', 'nas', 'que', 'é', 'à', 'ao', 'para', 'por', 'com', 'se', 'não', 'ou', 'pela', 'pelo']);
  function equilibrar(ctx, s, size, maxW, papel) {
    const base = quebrar(ctx, s, size, maxW, papel), k = base.length;
    if (k < 2) return base;
    let melhor = base, nota = Infinity;
    for (let w = maxW; w > maxW * 0.45; w -= 20) {
      const ls = quebrar(ctx, s, size, w, papel);
      if (ls.length !== k) break;
      const ws = ls.map((l) => wid(ctx, l, size, papel));
      const fracas = ls.slice(0, -1).filter((l) => FRACA.has(l.split(' ').pop().toLowerCase().replace(/[.,;:!?]/g, ''))).length;
      const n = Math.max(...ws) - Math.min(...ws) + 400 * fracas;
      if (n < nota) { nota = n; melhor = ls; }
    }
    return melhor;
  }
  const memo = new Map();
  function linhasDe(ctx, n, size, maxW, papel) {
    const key = [n, size, maxW, papel].join(':');
    if (!memo.has(key)) {
      let s = TX[n] || ''; const d = (P().DESTAQUE || {})[n];
      if (d && s.includes(d)) s = s.replace(d, d.split(' ').join(NB));
      memo.set(key, equilibrar(ctx, s, size, maxW, papel));
    }
    return memo.get(key);
  }
  // a frase da vez, centrada; a última linha em baseY; o trecho da peça (DESTAQUE) ganha o destaque do estilo
  function bloco(ctx, n, { baseY = BASE, sizes = [58, 54, 50, 46], maxLinhas = [2, 3, 3, 4], maxW = R - L, alpha = 1, dy = 0, papel = 'corpo', cx = CX } = {}) {
    if (!TX[n]) return;
    let size = sizes[sizes.length - 1], ls = null;
    for (let i = 0; i < sizes.length; i++) {
      const t = linhasDe(ctx, n, sizes[i], maxW, papel);
      if (t.length <= maxLinhas[i] && t.every((l) => wid(ctx, l.split(NB).join(' '), sizes[i], papel) <= maxW)) { size = sizes[i]; ls = t; break; }
    }
    if (!ls) ls = linhasDe(ctx, n, size, maxW, papel);
    const lh = size * fonte(papel)[2] * 1.27, d = (P().DESTAQUE || {})[n];
    ctx.save(); ctx.globalAlpha *= alpha;
    ls.forEach((l, i) => {
      const s = l.split(NB).join(' '), y = baseY - (ls.length - 1 - i) * lh + dy, w = wid(ctx, s, size, papel), x = cx - w / 2;
      const k = d ? s.indexOf(d) : -1;
      if (k >= 0) E.destaque(ctx, x + wid(ctx, s.slice(0, k), size, papel), y, wid(ctx, d, size, papel), size * fonte(papel)[2], { seed: 7 + n * 3 + i });
      escrever(ctx, s, x, y, { size, papel });
    });
    ctx.restore();
  }

  // ---------- a cara da série ----------
  // o rótulo fixo no alto da cena ("onde", "quem transmite"...), escrito à mão
  function rotulo(ctx, k, t, t0) {
    if (!D(k)) return;
    const a = U.clamp((t - t0) / 0.3, 0, 1);
    escrever(ctx, D(k), L + 4, TOP + 70, { size: 50, papel: 'mao', cor: 'destaque', alpha: a });
    const w = wid(ctx, D(k), 50, 'mao');
    G.line(ctx, [[L, TOP + 88], [L + w * a + 8, TOP + 86]], { color: cor('destaque'), lw: 5, seed: 31 });
  }
  // o selo de Roraima no canto de cima, à direita: o contorno do estado em miniatura (aparece em toda cena)
  function selo(ctx, { x = R - 92, y = TOP + 62, h = 120, alpha = 1, k = 1 } = {}) {
    if (!RR.dados) return;
    ctx.save(); ctx.globalAlpha *= alpha;
    const m = projetor(RR.caixa, { x: x - h * 0.4, y: y - h / 2, w: h * 0.8, h });
    for (const nome of Object.keys(RR.dados)) desenhaMunicipio(ctx, m, nome, { fill: cor('apoioEscuro'), stroke: cor('tinta'), lw: 2.5 * k });
    ctx.restore();
  }

  // ---------- o mapa de Roraima (contorno real dos 15 municípios, IBGE) ----------
  function caixaDe(dados) {
    let x0 = 180, x1 = -180, y0 = 90, y1 = -90;
    for (const polys of Object.values(dados)) for (const r of polys) for (const [x, y] of r) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    return [x0, y0, x1, y1];
  }
  // projeta lon/lat dentro da caixa da tela, mantendo a forma (equirretangular, corrigida pela latitude do meio)
  function projetor([x0, y0, x1, y1], box) {
    const kx = Math.cos((((y0 + y1) / 2) * Math.PI) / 180), gw = (x1 - x0) * kx, gh = y1 - y0;
    const s = Math.min(box.w / gw, box.h / gh), ox = box.x + (box.w - gw * s) / 2, oy = box.y + (box.h - gh * s) / 2;
    return { proj: (lon, lat) => [ox + (lon - x0) * kx * s, oy + (y1 - lat) * s], s };
  }
  function desenhaMunicipio(ctx, m, nome, { fill, stroke, lw = 4, seed = 50, alpha = 1 } = {}) {
    const polys = RR.dados && RR.dados[nome];
    if (!polys) return;
    for (const r of polys) G.poly(ctx, r.map(([lon, lat]) => m.proj(lon, lat)), { fill, stroke, lw, seed: seed + nome.length, amp: 0.8, alpha });
  }
  function centro(nome, m) {
    const polys = RR.dados[nome]; let sx = 0, sy = 0, n = 0;
    for (const r of polys) for (const [lon, lat] of r) { const [x, y] = m.proj(lon, lat); sx += x; sy += y; n++; }
    return [sx / n, sy / n];
  }
  // o mapa inteiro: os municípios, os destacados acendendo um a um (k de 0 a 1), e Boa Vista como referência
  function mapaRR(ctx, box, { destaques = [], t = 0, t0 = 0, referencia = 'Boa Vista', rotuloRef = 'D05' } = {}) {
    if (!RR.dados) return null;
    const m = projetor(RR.caixa, box);
    const lista = destaques.map((d) => d.nome);
    for (const nome of Object.keys(RR.dados)) if (!lista.includes(nome)) desenhaMunicipio(ctx, m, nome, { fill: cor('apoioEscuro'), stroke: cor('tinta'), lw: 3.5 });
    destaques.forEach((d, i) => {
      const k = U.clamp((t - (t0 + 0.4 + 0.5 * i)) / 0.3, 0, 1);
      desenhaMunicipio(ctx, m, d.nome, { fill: k > 0 ? (i === 0 ? cor('alerta') : cor('destaque')) : cor('apoioEscuro'), stroke: cor('tinta'), lw: 4.5 });
    });
    if (referencia && RR.dados[referencia]) {
      const [bx, by] = centro(referencia, m);
      G.ellipse(ctx, bx, by, 12, 12, { fill: cor('texto'), stroke: cor('tinta'), lw: 3, seed: 61 });
      escrever(ctx, D(rotuloRef), bx + 20, by + 12, { size: 34, papel: 'mao' });
    }
    // os rótulos dos destacados: nome e número, numa plaquinha ao lado
    destaques.forEach((d, i) => {
      const k = U.clamp((t - (t0 + 0.4 + 0.5 * i)) / 0.3, 0, 1);
      if (k <= 0) return;
      const [mx, my] = centro(d.nome, m);
      ctx.save(); ctx.globalAlpha *= k;
      const lx = i === 0 ? L + 10 : R - 10, align = i === 0 ? 'left' : 'right', ly = Math.max(box.y + 150, my + (i === 0 ? 200 : -30));
      G.line(ctx, [[mx, my], [i === 0 ? lx + 120 : lx - 120, ly - 60]], { color: cor('texto'), lw: 4, seed: 70 + i });
      escrever(ctx, D(d.rotulo), lx, ly - 70, { size: 42, papel: 'mao', align });
      escrever(ctx, D(d.numero), lx, ly - 10, { size: 64, papel: 'numero', cor: i === 0 ? 'texto' : 'destaque', align });
      ctx.restore();
    });
    return m;
  }

  // ---------- números ----------
  const milhar = (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  // o número da frase: o maior que ela traz ("Em 2024, o Brasil teve 138.493 casos" dá 138.493, não 2024)
  const numeroDe = (s) => { const ns = (String(s).match(/\d{1,3}(?:\.\d{3})+|\d+/g) || []).map((x) => parseInt(x.replace(/\./g, ''), 10)); return ns.length ? Math.max(...ns) : null; };
  // o contador: sobe de 0 ao número em 1 s, com um pulo quando para
  function contador(ctx, valor, x, y, t, t0, { size = 150, cor: c = 'texto', align = 'center', dur = 1.0 } = {}) {
    const u = U.clamp((t - t0) / dur, 0, 1), v = valor * U.ease.outCubic(u), z = 1 + 0.18 * U.pulse(t, t0 + dur, 8);
    ctx.save(); ctx.translate(x, y); ctx.scale(z, z);
    escrever(ctx, milhar(v), 0, 0, { size, papel: 'numero', cor: c, align });
    ctx.restore();
  }
  // a barra "1 em cada N": N quadrados, um acende
  function umEmCada(ctx, n, x, y, w, t, t0) {
    const gap = 18, s = (w - gap * (n - 1)) / n;
    for (let i = 0; i < n; i++) {
      const aceso = i === 0 && t >= t0, z = aceso ? 1 + 0.2 * U.pulse(t, t0, 8) : 1;
      G.rrect(ctx, x + i * (s + gap) + (s - s * z) / 2, y + (s - s * z) / 2, s * z, s * z, 18, { fill: aceso ? cor('destaque') : cor('apoioEscuro'), stroke: cor('tinta'), lw: 5, seed: 80 + i });
    }
  }

  // cem quadradinhos: a parte de um todo (pct de 100). Os quadrados da parte acendem em 1,2 s, a partir do canto de cima.
  // Serve para "X% dos casos estão em Y": mostra a parte sem pôr o número em cima de um lugar só do mapa.
  function cem(ctx, pct, x, y, w, t, t0) {
    const n = Math.max(0, Math.min(100, Math.round(pct))), lado = w / 10, q = lado * 0.82;
    const acesos = Math.floor(U.ease.outCubic(U.clamp((t - t0) / 1.2, 0, 1)) * n);
    for (let i = 0; i < 100; i++) {
      const col = i % 10, lin = Math.floor(i / 10), aceso = i < acesos;
      G.rrect(ctx, x + col * lado, y + lin * lado, q, q, q * 0.2, { fill: aceso ? cor('destaque') : cor('apoioEscuro'), stroke: cor('tinta'), lw: 3, seed: 600 + i });
    }
  }

  // ---------- o estado do filme no instante t ----------
  // o apagador: a faixa de pó de giz que varre o quadro da esquerda para a direita (k de 0 a 1), com o apagador na frente.
  // Nos estilos claros, a faixa é da cor da tinta, mais fraca.
  function apagador(ctx, k) {
    const W = G.W, H = G.H, x = -260 + k * (W + 520), esc = E.escuro();
    const g = ctx.createLinearGradient(x - 300, 0, x + 40, 0), c0 = esc ? '244,237,223' : '23,64,44', a = esc ? 0.3 : 0.2;
    g.addColorStop(0, `rgba(${c0},0)`); g.addColorStop(0.75, `rgba(${c0},${a})`); g.addColorStop(1, `rgba(${c0},0)`);
    ctx.save(); ctx.fillStyle = g; ctx.fillRect(x - 300, 0, 340, H); ctx.restore();
    ctx.save(); ctx.translate(x, 1060); ctx.rotate(0.12);
    E.ret(ctx, -46, -120, 92, 240, { papel: 'apoioEscuro', seed: 901, r: 16 });
    E.ret(ctx, -46, -120, 92, 70, { papel: 'superficie', seed: 902, r: 16 });
    ctx.restore();
  }

  function estado(t) {
    const c = SC.cenaEm(t);
    let i = 0;
    c.itens.forEach((x, j) => { if (t >= x.t0) i = j; });
    const it = c.itens[i], ultima = i === c.itens.length - 1;
    const st = { t, c, it, i, u: t - c.t0 };
    const corte = i === 0;
    st.aTexto = Math.min(corte ? 1 : U.clamp((t - it.t0) / 0.2, 0, 1), ultima ? 1 : U.clamp((it.t1 - t) / 0.12, 0, 1));
    st.dyTexto = corte ? 0 : (1 - U.ease.outCubic(U.clamp((t - it.t0) / 0.25, 0, 1))) * 16;
    return st;
  }

  globalThis.DRR = { L, R, TOP, BOT, CX, BASE, D, cor, wid, escrever, bloco, rotulo, selo, RR, caixaDe, projetor, desenhaMunicipio, centro, mapaRR, milhar, numeroDe, contador, umEmCada, cem, apagador, estado, CENA: {} };
})();
