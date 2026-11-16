// PRESEME · tipo "tour" · desenho 1/3 · o molde (igual em toda peça deste tipo; o chat não mexe aqui)
// O texto que se quebra sozinho, a fachada (a pessoa chega e entra), o corredor que anda com a câmera (portas, placas,
// número de cada sala, a recepção e os cartazes), a janela da sala por dentro (com quem trabalha nela e o crachá), a sala
// de perto, o aluno na sala, o lado de fora e a planta do lugar inteiro. Cores e letras vêm do kit de estilos
// (ferramentas/estilos.js) e os lugares, objetos e pessoas, da biblioteca (ferramentas/biblioteca.js): a mesma peça sai
// em planta, lápis, pixel ou outro estilo trocando o ESTILO do score.js.
// O que é de cada peça (o desenho de dentro de cada sala) vem de film-2-peca.js (PECA.SALA).
(function () {
  const U = globalThis.U, G = globalThis.G, E = globalThis.ESTILOS, B = globalThis.BIB, SC = globalThis.SCORE, TX = globalThis.TEXTOS;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const L = SAFE.x, R = SAFE.x + SAFE.w, TOP = SAFE.y, BOT = SAFE.y + SAFE.h, CX = (L + R) / 2;
  const BASE = 700, NB = ' '; // espaço que não quebra (o trecho destacado fica junto)
  const D = (k) => TX[k] || '';
  const P = () => globalThis.PECA || {};
  const cl = (x) => U.clamp(x, 0, 1);

  // ---------- texto ----------
  const fonte = (papel = 'corpo') => E.letra(papel); // [família, peso, escala]
  const wid = (ctx, s, size, papel = 'corpo') => { const [fam, w, k] = fonte(papel); return G.measure(ctx, s, Math.round(size * k), fam, w); };
  const escrever = (ctx, s, x, y, o = {}) => E.texto(ctx, s, x, y, Object.assign({ papel: 'corpo', size: 56, align: 'left', cor: 'texto', alpha: 1 }, o));
  function quebrar(ctx, s, size, maxW, papel) {
    const out = []; let cur = '';
    for (const w of String(s).split(' ')) {
      const t = cur ? cur + ' ' + w : w;
      if (cur && wid(ctx, t, size, papel) > maxW) { out.push(cur); cur = w; } else cur = t;
    }
    if (cur) out.push(cur);
    return out;
  }
  const FRACA = new Set(['a', 'o', 'as', 'os', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'e', 'em', 'no', 'na', 'nos', 'nas', 'que', 'é', 'à', 'ao', 'para', 'por', 'com', 'se', 'não', 'ou', 'pela', 'pelo', 'até']);
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
      if (d && s.includes(d)) s = s.replace(d, d.split(' ').join(NB)); // o trecho destacado não se parte em duas linhas
      memo.set(key, equilibrar(ctx, s, size, maxW, papel));
    }
    return memo.get(key);
  }
  // a frase da vez, centrada no alto; a última linha em baseY; o trecho da peça (PECA.DESTAQUE) ganha o destaque do estilo
  function bloco(ctx, n, { baseY = BASE, sizes = [58, 54, 50, 46], maxLinhas = [2, 3, 3, 4], maxW = R - L, alpha = 1, papel = 'corpo', cx = CX } = {}) {
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
      const s = l.split(NB).join(' '), y = baseY - (ls.length - 1 - i) * lh, w = wid(ctx, s, size, papel), x = cx - w / 2;
      const k = d ? s.indexOf(d) : -1;
      if (k >= 0) E.destaque(ctx, x + wid(ctx, s.slice(0, k), size, papel), y, wid(ctx, d, size, papel), size * fonte(papel)[2], { seed: 7 + n * 3 + i });
      escrever(ctx, s, x, y, { size, papel });
    });
    ctx.restore();
  }
  // um texto curto que encolhe até caber em maxW (até 2 linhas); devolve as linhas e o tamanho
  function caber(ctx, s, maxW, { size = 38, min = 26, papel = 'titulo', linhas = 2 } = {}) {
    for (let z = size; z >= min; z -= 2) {
      const ls = equilibrar(ctx, s, z, maxW, papel);
      if (ls.length <= linhas && ls.every((l) => wid(ctx, l, z, papel) <= maxW)) return { ls, size: z };
    }
    return { ls: equilibrar(ctx, s, min, maxW, papel).slice(0, linhas), size: min };
  }

  // ---------- marcas: o visto ----------
  function visto(ctx, x, y, s = 1, k = 1) {
    if (k <= 0) return;
    E.circulo(ctx, x, y, 30 * s, { papel: 'apoio', seed: 811, sombra: false });
    E.linha(ctx, [[x - 13 * s, y + 1 * s], [x - 3 * s, y + 12 * s], [x + 15 * s, y - 12 * s]], { papel: 'tinta', lw: 6 * s, k, seed: 812 });
  }

  // ---------- a placa (da porta, da recepção) e o crachá ----------
  // a placa: o nome da sala como está na porta. Texto cortado na borda é erro no qa: perto da borda, a placa fica sem letra
  function placa(ctx, cx, cy, s, { pulso = 0, num = null } = {}) {
    if (!s) return;
    const { ls, size } = caber(ctx, s, 360, { size: 38, min: 28 });
    const lh = size * fonte('titulo')[2] * 1.18;
    const w = Math.max(200, Math.max(...ls.map((l) => wid(ctx, l, size, 'titulo'))) + 64 + (num !== null ? 56 : 0)), h = 40 + lh * ls.length;
    const fora = Math.max(0, L - (cx - w / 2), cx + w / 2 - R);
    const a = cl(1 - fora / 90);
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(cx, cy);
    const z = 1 + 0.12 * pulso; ctx.scale(z, z);
    E.ret(ctx, -w / 2, -h / 2, w, h, { papel: 'apoioEscuro', r: 12, seed: 33 + s.length, sombra: true });
    if (fora === 0) {
      let x0 = 0;
      if (num !== null) {
        E.circulo(ctx, -w / 2 + 38, 0, 24, { papel: 'destaque', seed: 35, sombra: false, hachura: false });
        escrever(ctx, String(num), -w / 2 + 38, 11, { papel: 'numero', size: 30, align: 'center', cor: 'noite' });
        x0 = 28;
      }
      ls.forEach((l, i) => escrever(ctx, l, x0, -h / 2 + 20 + lh * (i + 0.78), { papel: 'titulo', size, align: 'center', cor: 'papel' }));
    }
    ctx.restore();
  }
  // o crachá: a função de quem trabalha ali (rotulo do score.js), em cima da cabeça
  function cracha(ctx, cx, cy, s, papel = 'superficie') {
    if (!s) return;
    const { ls, size } = caber(ctx, s, 300, { size: 32, min: 24, papel: 'corpo' });
    const lh = size * fonte('corpo')[2] * 1.2;
    const w = Math.max(...ls.map((l) => wid(ctx, l, size, 'corpo'))) + 44, h = 26 + lh * ls.length;
    const x = U.clamp(cx, L + w / 2 + 6, R - w / 2 - 6), y = Math.max(PANEL.y + h / 2 + 60, cy - h / 2);
    E.ret(ctx, x - w / 2, y - h / 2, w, h, { papel, r: h / 2 > 30 ? 18 : h / 2, seed: 41 + s.length, sombra: true });
    ls.forEach((l, i) => escrever(ctx, l, x, y - h / 2 + 13 + lh * (i + 0.8), { papel: 'corpo', size, align: 'center', cor: papel === 'superficie' ? 'texto' : 'noite' }));
  }

  // ---------- a fachada: a pessoa chega andando e entra pela porta ----------
  const PESSOA = { quem: 'calouro' }; // quem faz o tour (a peça troca em PECA.GUIA)
  const guia = () => Object.assign({}, PESSOA, P().GUIA || {});
  function fachada(ctx, st) {
    const c = st.c, t = st.t, tc = c.tChega;
    E.fundo(ctx);
    const f = (P().SALA || {}).fachada;
    const r = (f ? f(ctx, st) : B.ubsFora(ctx, { placa: D(SC.LUGAR.placa), chao: 1440, arvore: false })) || {};
    const porta = r.porta || [W / 2, 1290];
    const e = U.ease.inOutCubic(cl((t - c.t0) / Math.max(1e-6, tc - c.t0)));
    const x = U.lerp(-140, porta[0] - 30, e);
    const a = 1 - cl((t - tc - 0.15) / 0.35); // entra pela porta e some
    if (a > 0) {
      ctx.save(); ctx.globalAlpha *= a;
      B.pessoa(ctx, Object.assign(guia(), { x, y: r.chao || 1440, s: 1, pose: t < tc ? 'walk' : 'stand', walk: ((x + 140) / 280) % 1, look: 0.2 }));
      ctx.restore();
    }
  }

  // ---------- o corredor: a câmera anda com a pessoa, da porta anterior até a da sala ----------
  const PAREDE = 760, CHAO = 1365, PASSO = 760, OBJ_X = 300, PORTA_DX = 300, PW = 210, PH = 390;
  const PX = (k) => k * PASSO;
  function cartaz(ctx, x, k) {
    const w = 150, h = 190, y = PAREDE + 110;
    E.ret(ctx, x - w / 2, y, w, h, { papel: 'superficie', r: 6, seed: 450 + k, sombra: true });
    E.ret(ctx, x - w / 2 + 14, y + 14, w - 28, 40, { papel: k % 2 ? 'apoio' : 'destaque', r: 4, seed: 460 + k, sombra: false, hachura: false });
    for (let i = 0; i < 3; i++) E.linha(ctx, [[x - w / 2 + 20, y + 84 + i * 30], [x + w / 2 - (i === 2 ? 60 : 20), y + 84 + i * 30]], { lw: 5, seed: 470 + k * 3 + i });
  }
  function porta(ctx, x, p, t, aberta) {
    const y0 = CHAO - PH;
    E.ret(ctx, x - PW / 2 - 14, y0 - 14, PW + 28, PH + 14, { papel: 'apoioEscuro', r: 4, seed: 480 + p.k, sombra: false });
    E.ret(ctx, x - PW / 2, y0, PW, PH, { papel: 'noite', r: 2, seed: 482 + p.k, sombra: false, hachura: false, contorno: false });
    const fw = PW * (1 - 0.72 * aberta);
    E.ret(ctx, x - PW / 2, y0, fw, PH, { papel: 'apoio', r: 3, seed: 484 + p.k, sombra: false });
    E.circulo(ctx, x - PW / 2 + fw - 22, y0 + PH * 0.55, 10, { papel: 'destaque', seed: 486 + p.k, sombra: false, hachura: false });
    // o número da sala, na parede ao lado da porta (só dentro da área segura)
    const nx = x - PW / 2 - 56;
    if (nx > L + 34 && nx < R - 34) {
      E.circulo(ctx, nx, y0 + 46, 30, { papel: 'destaque', seed: 488 + p.k, sombra: false });
      escrever(ctx, String(p.num), nx, y0 + 59, { papel: 'numero', size: 36, align: 'center', cor: 'noite' });
    }
  }
  function recepcaoCorredor(ctx, x, p) {
    const bw = 380, bh = 230;
    for (const [dx, sd] of [[-330, 1], [-250, 2]]) if (x + dx > -120 && x + dx < W + 120) B.cadeira(ctx, { x: x + dx, y: CHAO, s: 0.8, seed: 490 + sd });
    E.ret(ctx, x - bw / 2, CHAO - bh, bw, bh, { papel: 'superficie', r: 6, seed: 495, sombra: true });
    E.ret(ctx, x - bw / 2 - 16, CHAO - bh - 30, bw + 32, 34, { papel: 'apoioEscuro', r: 6, seed: 496, sombra: false });
    for (const sx of [x - 110, x + 110]) E.linha(ctx, [[sx, PAREDE], [sx, CHAO - bh - 160]], { lw: 4, seed: 497 });
    placa(ctx, x, CHAO - bh - 118, D(p.placa));
  }
  function corredor(ctx, st) {
    const c = st.c, t = st.t, k = c.ponto, tc = c.tChega;
    const e = U.ease.inOutCubic(cl((t - c.t0) / Math.max(1e-6, tc - c.t0)));
    const wx = U.lerp(PX(k - 1), PX(k), e), camX = wx - OBJ_X;
    E.fundo(ctx);
    E.ret(ctx, -40, PAREDE, W + 80, CHAO - PAREDE + 6, { papel: 'superficie', r: 0, seed: 401, sombra: false });
    E.ret(ctx, -40, CHAO - 214, W + 80, 26, { papel: 'apoio', r: 0, seed: 402, sombra: false, hachura: false, contorno: false });
    E.chao(ctx, CHAO);
    for (const p of SC.PONTOS) {
      const dx = PX(p.k) + PORTA_DX - camX;
      const mx = dx + PASSO / 2;
      if (mx > -160 && mx < W + 160 && p.k < SC.PONTOS.length - 1) cartaz(ctx, mx, p.k);
      if (dx < -420 || dx > W + 420) continue;
      if (p.tipo === 'entrada') { recepcaoCorredor(ctx, dx, p); continue; }
      const daVez = p.k === k, aberta = daVez ? U.ease.outCubic(cl((t - tc - 0.12) / SC.ABRE)) : 0;
      porta(ctx, dx, p, t, aberta);
      const pulso = daVez && t >= tc ? U.pulse(t, tc, 7) : 0;
      placa(ctx, dx, CHAO - PH - 76, D(p.placa), { pulso });
    }
    const anda = t < tc, dist = Math.abs(wx - PX(k - 1));
    B.pessoa(ctx, Object.assign(guia(), { x: OBJ_X, y: CHAO, s: 0.95 }, anda ? { pose: 'walk', walk: (dist / 260) % 1 } : { pose: 'stand', look: 0.55 }));
  }

  // ---------- a janela: um lugar da biblioteca (ou da peça) desenhado dentro de um quadro, abaixo do texto ----------
  // o lugar é desenhado nas medidas de um quadro inteiro (1080 de largura, chão em y 1400) e encolhido para a janela;
  // com foco, a janela chega perto de um ponto do lugar (zoom)
  const PANEL = { x: L, y: 750, w: R - L, h: 730 };
  const K0 = PANEL.w / W, PY0 = 1400 - (PANEL.h - 60) / K0;
  function janela(ctx, desenhar, { foco = null, zoom = 1 } = {}) {
    const k = K0 * zoom;
    const [fx, fy, sx0, sy0] = foco ? [foco[0], foco[1], PANEL.x + PANEL.w / 2, PANEL.y + PANEL.h * 0.56] : [0, PY0, PANEL.x, PANEL.y];
    const toScreen = ([x, y]) => [sx0 + (x - fx) * k, sy0 + (y - fy) * k];
    E.ret(ctx, PANEL.x - 6, PANEL.y - 6, PANEL.w + 12, PANEL.h + 12, { papel: 'superficie', r: 26, seed: 501, sombra: true });
    ctx.save();
    ctx.beginPath(); ctx.rect(PANEL.x, PANEL.y, PANEL.w, PANEL.h); ctx.clip();
    ctx.translate(sx0 - fx * k, sy0 - fy * k); ctx.scale(k, k);
    const r = desenhar(ctx) || {};
    ctx.restore();
    const x0 = PANEL.x, y0 = PANEL.y, x1 = PANEL.x + PANEL.w, y1 = PANEL.y + PANEL.h;
    E.linha(ctx, [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]], { papel: 'tinta', lw: 6, seed: 503 });
    return { toScreen, r };
  }
  // o rótulo da janela, na borda de cima: o número e a placa da sala (ou o nome da entrada)
  function cabecalho(ctx, num, texto) {
    if (!texto) return;
    const { ls, size } = caber(ctx, texto, R - L - 200, { size: 36, min: 26, linhas: 1 });
    const s = ls[0], w = wid(ctx, s, size, 'titulo') + 60 + (num !== null ? 58 : 0), h = 66, x = L + 26, y = PANEL.y - h / 2;
    E.ret(ctx, x, y, w, h, { papel: 'apoioEscuro', r: 14, seed: 520, sombra: true });
    let tx = x + 30;
    if (num !== null) {
      E.circulo(ctx, x + 36, y + h / 2, 23, { papel: 'destaque', seed: 521, sombra: false, hachura: false });
      escrever(ctx, String(num), x + 36, y + h / 2 + 11, { papel: 'numero', size: 30, align: 'center', cor: 'noite' });
      tx += 58;
    }
    escrever(ctx, s, tx, y + h / 2 + size * 0.36, { papel: 'titulo', size, cor: 'papel' });
  }
  // quem trabalha na sala: em pé no chão da sala (x do score.js; sem, à direita, ou dos dois lados se forem dois)
  function genteDa(c) {
    const qs = c.quem || [];
    return qs.map((q, j) => {
      const x = q.x !== undefined ? q.x : qs.length === 1 ? 770 : [320, 770][j] ?? 540;
      return Object.assign({ s: 1, look: x > 540 ? -0.35 : 0.35 }, q.pessoa || {}, { x, y: 1400, pose: (q.pessoa && q.pessoa.pose) || 'stand' });
    });
  }
  function salaPadrao(ctx) {
    const r = B.sala(ctx, {});
    B.mesa(ctx, { x: 840, y: 1400, w: 260, h: 250 });
    B.cadeira(ctx, { x: 600, y: 1400 });
    return r;
  }
  // a sala por dentro: modo 'largo' (a sala inteira), 'perto' (em quem a frase fala) ou 'voce' (o aluno ao lado)
  function dentro(ctx, st, modo = 'largo') {
    const c = st.c, f = (P().SALA || {})[c.sala];
    const gente = genteDa(c), fi = Math.min(c.foco || 0, Math.max(0, gente.length - 1)), alvo = gente[fi];
    const voce = modo === 'voce';
    const calouro = voce ? Object.assign(guia(), { x: alvo ? (alvo.x > 540 ? alvo.x - 290 : alvo.x + 290) : 420, y: 1400, s: 1, pose: 'stand', look: alvo && alvo.x > 540 ? 0.4 : -0.4 }) : null;
    let foco = null, zoom = 1;
    if (modo !== 'largo' && alvo) { foco = [voce ? (alvo.x + calouro.x) / 2 : alvo.x, 1400 - 360]; zoom = voce ? 1.3 : 1.65; }
    E.fundo(ctx);
    const J = janela(ctx, (cx) => {
      const r = f ? f(cx, st, modo) : salaPadrao(cx);
      for (const g of gente) B.pessoa(cx, g);
      if (calouro) B.pessoa(cx, calouro);
      return r;
    }, { foco, zoom });
    gente.forEach((g, j) => {
      if (modo !== 'largo' && j !== fi) return;
      const top = B.cabeca(g).topo, [sx, sy] = J.toScreen([top[0], top[1] - 24]);
      cracha(ctx, sx, sy, D((c.quem[j] || {}).rotulo));
    });
    if (calouro) { const top = B.cabeca(calouro).topo, [sx, sy] = J.toScreen([top[0], top[1] - 24]); cracha(ctx, sx, sy, D(SC.VOCE), 'destaque'); }
    cabecalho(ctx, c.num, D(c.placa));
  }
  // a entrada por dentro (a 2ª frase da entrada): o desenho da peça ou a recepção da biblioteca
  function recepcao(ctx, st) {
    const f = (P().SALA || {}).entrada;
    E.fundo(ctx);
    janela(ctx, (cx) => (f ? f(cx, st) : B.ubsDentro(cx, { placa: D(SC.LUGAR.entrada) })));
    cabecalho(ctx, null, D(SC.LUGAR.entrada));
  }
  // o lado de fora (cena "fora"): o desenho da peça ou o território da biblioteca, com quem anda por ele
  function fora(ctx, st) {
    const c = st.c, t = st.t, f = (P().SALA || {})[c.sala];
    const u = cl((t - c.t0) / Math.max(1e-6, c.t1 - c.t0));
    const q = (c.quem || [])[0];
    const g = q ? Object.assign({ s: 0.62 }, q.pessoa || {}, { x: U.lerp(120, 960, u), y: 1400, pose: 'walk', walk: (u * 5) % 1 }) : null;
    E.fundo(ctx);
    const J = janela(ctx, (cx) => {
      const r = f ? f(cx, st) : B.territorio(cx, { rotulo: D(c.rotulo), kLimite: cl((t - c.t0) / 1.2), kGente: 1 });
      if (g) B.pessoa(cx, g);
      return r;
    });
    if (g) { const top = B.cabeca(g).topo, [sx, sy] = J.toScreen([top[0], top[1] - 24]); cracha(ctx, sx, sy, D(q.rotulo)); }
  }

  // ---------- a planta: o lugar inteiro visto de cima, a entrada, o corredor e as salas numeradas ----------
  function plantaGeo() {
    const salas = SC.PONTOS.slice(1), n = salas.length;
    const x0 = L + 8, x1 = R - 8, y0 = 800, y1 = 1450, xr = x0 + 168;
    const dupla = n > 3, cols = dupla ? Math.ceil(n / 2) : n, cw = (x1 - xr) / cols;
    const cy0 = dupla ? (y0 + y1) / 2 - 46 : y1 - 120, cy1 = cy0 + 92, cym = (cy0 + cy1) / 2;
    const quartos = salas.map((p, i) => {
      const col = dupla ? Math.floor(i / 2) : i, cima = !dupla || i % 2 === 0;
      const rx = xr + col * cw, ry = cima ? y0 : cy1, rh = cima ? cy0 - y0 : y1 - cy1;
      return { p, rx, ry, rw: cw, rh, cima, px: rx + cw / 2 };
    });
    return { x0, x1, y0, y1, xr, cy0, cy1, cym, quartos, dupla };
  }
  function planta(ctx, st, { recap = false } = {}) {
    const g = plantaGeo(), t = st.t, t0 = st.c.t0, PL = SC.PLANTA;
    const k = recap ? 1 : U.ease.inOutCubic(cl((t - t0 - PL.traca) / PL.tracaDur));
    // os vistos: na frase do resumo, logo no começo; numa planta de uma frase só, depois que o caminho termina de se desenhar
    const tv = recap ? st.it.t0 + 0.15 : t0 + PL.traca + PL.tracaDur + 0.25;
    E.fundo(ctx);
    E.ret(ctx, g.x0, g.y0, g.x1 - g.x0, g.y1 - g.y0, { papel: 'superficie', r: 6, seed: 301, sombra: true, lw: 6 });
    E.ret(ctx, g.xr, g.cy0, g.x1 - g.xr, g.cy1 - g.cy0, { papel: 'apoio', r: 0, seed: 302, sombra: false, hachura: false, contorno: false });
    // a entrada: o bloco da esquerda, com o nome dela e a abertura na parede
    E.linha(ctx, [[g.xr, g.y0], [g.xr, g.cy0]], { lw: 5, seed: 303 });
    E.linha(ctx, [[g.xr, g.cy1], [g.xr, g.y1]], { lw: 5, seed: 304 });
    const ent = caber(ctx, D(SC.LUGAR.entrada), g.xr - g.x0 - 20, { size: 30, min: 22, papel: 'corpo', linhas: 3 });
    ent.ls.forEach((l, i) => escrever(ctx, l, (g.x0 + g.xr) / 2, g.y0 + 70 + i * ent.size * 1.15, { papel: 'corpo', size: ent.size, align: 'center' }));
    E.ret(ctx, g.x0 - 10, g.cym - 40, 20, 80, { papel: 'fundo', r: 2, seed: 305, sombra: false, hachura: false, contorno: false });
    E.seta(ctx, [g.x0 - 46, g.cym], [g.x0 + 40, g.cym], { lw: 6, seed: 306 });
    // as salas: a parede, a porta no corredor, o número e a placa
    g.quartos.forEach((q, i) => {
      E.ret(ctx, q.rx, q.ry, q.rw, q.rh, { papel: 'superficie', r: 2, seed: 310 + i, sombra: false, lw: 5 });
      const wy = q.cima ? q.ry + q.rh : q.ry;
      E.ret(ctx, q.px - 34, wy - 7, 68, 14, { papel: 'destaque', r: 3, seed: 320 + i, sombra: false, hachura: false });
      const feito = recap || k >= (i + 1) / (g.quartos.length + 0.4);
      E.circulo(ctx, q.rx + 38, q.ry + 40, 25, { papel: feito ? 'destaque' : 'superficie', seed: 330 + i, sombra: false, lw: 4 });
      escrever(ctx, String(q.p.num), q.rx + 38, q.ry + 51, { papel: 'numero', size: 30, align: 'center', cor: feito ? 'noite' : 'texto' });
      // quem trabalha na sala, pequeno, no chão do quarto (a primeira pessoa do quem)
      const c = SC.cenas.find((x) => x.id === q.p.cena), g0 = c && genteDa(c)[0];
      if (g0) B.pessoa(ctx, Object.assign({}, g0, { x: q.px + (q.cima ? 0 : 0), y: q.cima ? q.ry + q.rh - 12 : q.ry + q.rh - 14, s: Math.max(0.12, Math.min(0.26, (q.rh - 175) / 520)), look: 0 }));
      const nm = caber(ctx, D(q.p.placa), q.rw - 24, { size: 32, min: 22, papel: 'corpo', linhas: 3 });
      const ty = q.ry + 96;
      nm.ls.forEach((l, j) => escrever(ctx, l, q.px, ty + j * nm.size * 1.12, { papel: 'corpo', size: nm.size, align: 'center', alpha: feito ? 1 : 0.6 }));
      visto(ctx, q.rx + q.rw - 34, q.ry + 38, 0.8, cl((t - tv - 0.12 * i) / 0.25));
    });
    // o caminho: tracejado inteiro e, por cima, o trecho andado; um ponto em cada porta
    const xa = g.x0 + 14, xb = g.quartos.length ? g.quartos[g.quartos.length - 1].px : g.x1 - 40;
    E.linha(ctx, [[xa, g.cym], [xb, g.cym]], { papel: 'tinta', lw: 5, seed: 340, tracejado: true });
    if (k > 0) E.linha(ctx, [[xa, g.cym], [U.lerp(xa, xb, k), g.cym]], { papel: 'tinta', lw: 9, seed: 341 });
    g.quartos.forEach((q, i) => E.circulo(ctx, q.px, g.cym, 12, { papel: k >= (q.px - xa) / Math.max(1, xb - xa) ? 'destaque' : 'superficie', seed: 345 + i, sombra: false, hachura: false }));
    // a pessoa do tour, pequena, na ponta do caminho
    B.pessoa(ctx, Object.assign(guia(), { x: U.lerp(xa, xb, k), y: g.cy1 - 6, s: 0.17, pose: 'stand' }));
  }

  // ---------- o estado do filme no instante t ----------
  function estado(t) {
    const c = SC.cenaEm(t);
    let i = 0;
    c.itens.forEach((x, j) => { if (t >= x.t0) i = j; });
    const it = c.itens[i], ultima = i === c.itens.length - 1;
    const st = { t, c, it, i, u: t - c.t0 };
    if (c.tipo === 'entrada') st.vista = i === 0 ? 'fachada' : 'recepcao';
    else if (c.tipo === 'sala') st.vista = i === 0 ? (t < c.tEntra ? 'corredor' : 'dentro') : i === 1 ? 'perto' : 'voce';
    else if (c.tipo === 'fora') st.vista = 'fora';
    else st.vista = i === c.itens.length - 1 && c.itens.length > 1 ? 'resumo' : 'planta';
    st.aTexto = ultima ? 1 : cl((it.t1 - t) / 0.12); // toda frase entra com um corte de imagem; sai junto com a próxima
    return st;
  }

  globalThis.TOUR = { L, R, TOP, BOT, CX, BASE, CHAO, PASSO, PANEL, D, wid, escrever, quebrar, caber, bloco, placa, cracha, visto, fachada, corredor, janela, cabecalho, dentro, recepcao, fora, planta, estado };
})();
