// PRESEME · motor "por dentro" · desenho 1/3 · o molde (igual em toda peça deste tipo; o chat não mexe aqui)
// A cara do tipo: a janela no meio da tela, onde a câmera entra no corpo; a trilha no alto ("Na UBS › O braço › As
// células"), que cresce quando a câmera entra e encolhe quando ela sai; a lente que pousa na porta do nível seguinte
// (com ele já aparecendo dentro dela) e a viagem pela porta, um nível por vez; a frase embaixo da janela; e o fecho, com a
// viagem inteira em medalhões. Cada nível é desenhado pela peça (film-2-peca.js, PECA.NIVEL), que também diz onde fica a
// porta de cada um (PECA.PORTA); o enquadramento de cada frase (PLANOS) fica no score.js, porque é um corte. Cores e letras vêm do kit de estilos: a mesma peça sai em qualquer estilo pelo ESTILO.
(function () {
  const U = globalThis.U, G = globalThis.G, E = globalThis.ESTILOS, SC = globalThis.SCORE, TX = globalThis.TEXTOS;
  const SAFE = G.SAFE;
  const L = SAFE.x, R = SAFE.x + SAFE.w, TOP = SAFE.y, BOT = SAFE.y + SAFE.h, CX = (L + R) / 2;
  const NB = ' ';
  const D = (k) => TX[k] || '';
  const P = () => globalThis.PECA || {};
  const cor = (p) => E.cor(p);
  const p01 = (t, t0, d) => U.clamp((t - t0) / d, 0, 1);
  // a janela: onde os níveis aparecem (coordenadas do nível = coordenadas da tela, sem câmera)
  const JAN = { x: L, y: 330, w: R - L, h: 840, r: 38 };
  const JC = { x: JAN.x + JAN.w / 2, y: JAN.y + JAN.h / 2 };
  const RN = Math.hypot(JAN.w / 2, JAN.h / 2) * 1.02; // o raio que a janela inteira ocupa (o nível de dentro cabe na porta)
  const BASE_TEXTO = 1440; // a última linha da frase, embaixo da janela

  // ---------- texto: quebra sozinha, linhas de tamanho parecido, sem palavrinha solta no fim da linha ----------
  const fonte = (papel = 'corpo') => E.letra(papel); // [família, peso, escala]
  const wid = (ctx, s, size, papel = 'corpo') => { const [fam, w, k] = fonte(papel); return G.measure(ctx, s, Math.round(size * k), fam, w); };
  // TXT: o quanto aparece o texto de dentro dos níveis (os rótulos). Na lente, na viagem e nos medalhões, o nível está
  // pequeno ou passando: o rótulo some (letra de 9 px ou saindo da tela não se lê, e o qa reprova)
  let TXT = 1;
  const escrever = (ctx, s, x, y, { size = 56, papel = 'corpo', cor: c = 'texto', align = 'left', alpha = 1 } = {}) => { const a = alpha * TXT; if (a > 0.02) E.texto(ctx, s, x, y, { papel, size, align, cor: c, alpha: a }); };
  function quebrar(ctx, s, size, maxW, papel) {
    const out = []; let cur = '';
    for (const w of s.split(' ')) {
      const t = cur ? cur + ' ' + w : w;
      if (cur && wid(ctx, t, size, papel) > maxW) { out.push(cur); cur = w; } else cur = t;
    }
    if (cur) out.push(cur);
    return out;
  }
  const FRACA = new Set(['a', 'o', 'as', 'os', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'e', 'em', 'no', 'na', 'nos', 'nas', 'que', 'é', 'à', 'ao', 'para', 'por', 'com', 'se', 'não', 'ou', 'pela', 'pelo', 'mas']);
  function equilibrar(ctx, s, size, maxW, papel) {
    const base = quebrar(ctx, s, size, maxW, papel), k = base.length;
    if (k < 2) return base;
    let melhor = base, nota = Infinity;
    for (let w = maxW; w > maxW * 0.45; w -= 20) {
      const ls = quebrar(ctx, s, size, w, papel);
      if (ls.length !== k) break;
      const ws = ls.map((l) => wid(ctx, l, size, papel));
      const fracas = ls.slice(0, -1).filter((l) => FRACA.has(l.split(' ').pop().toLowerCase().replace(/[.,;:!?"”]/g, ''))).length;
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
  function caber(ctx, n, { sizes = [56, 52, 48, 44], maxLinhas = [3, 3, 3, 4], maxW = R - L, papel = 'corpo' } = {}) {
    for (let i = 0; i < sizes.length; i++) {
      const t = linhasDe(ctx, n, sizes[i], maxW, papel);
      if (t.length <= maxLinhas[i] && t.every((l) => wid(ctx, l.split(NB).join(' '), sizes[i], papel) <= maxW)) return { size: sizes[i], ls: t };
    }
    const size = sizes[sizes.length - 1];
    return { size, ls: linhasDe(ctx, n, size, maxW, papel) };
  }
  function desenhar(ctx, n, ls, size, { cx = CX, baseY = BASE_TEXTO, papel = 'corpo', alpha = 1, dy = 0, kDestaque = 1 } = {}) {
    const lh = size * fonte(papel)[2] * 1.27, d = (P().DESTAQUE || {})[n];
    const top = baseY - (ls.length - 1) * lh;
    ctx.save(); ctx.globalAlpha *= alpha;
    ls.forEach((l, i) => {
      const s = l.split(NB).join(' '), y = top + i * lh + dy, w = wid(ctx, s, size, papel), xl = cx - w / 2;
      const k = d ? s.indexOf(d) : -1;
      if (k >= 0) E.destaque(ctx, xl + wid(ctx, s.slice(0, k), size, papel), y, wid(ctx, d, size, papel), size * fonte(papel)[2], { seed: 7 + n * 3 + i, k: kDestaque });
      escrever(ctx, s, xl, y, { size, papel });
    });
    ctx.restore();
  }
  // a frase da vez, embaixo da janela; o título (pergunta e fecho) é a mesma coisa, maior
  function bloco(ctx, n, { alpha = 1, dy = 0, kDestaque = 1 } = {}) {
    if (!TX[n]) return;
    const { size, ls } = caber(ctx, n);
    desenhar(ctx, n, ls, size, { alpha, dy, kDestaque });
  }
  function titulo(ctx, n, { alpha = 1, dy = 0, kDestaque = 1 } = {}) {
    if (!TX[n]) return;
    const { size, ls } = caber(ctx, n, { sizes: [68, 62, 58, 54], maxLinhas: [3, 3, 3, 3], papel: 'titulo' });
    desenhar(ctx, n, ls, size, { alpha, dy, kDestaque, papel: 'titulo' });
  }

  // ---------- a trilha no alto: os níveis por onde a câmera já entrou ("Na UBS › O braço › As células") ----------
  function trilha(ctx, ate, { alpha = 1, prox = 0 } = {}) {
    const nomes = SC.NIVEIS.slice(0, ate + 1).map((x) => D(x.rotulo)).filter(Boolean);
    if (!nomes.length) return;
    const sz = 46, sep = '  ›  ', y = TOP + 66;
    let ini = 0;
    const largura = (a) => wid(ctx, (a > 0 ? '…' + sep : '') + nomes.slice(a).join(sep), sz, 'mao');
    while (ini < nomes.length - 1 && largura(ini) > R - L) ini++;
    let x = L;
    ctx.save(); ctx.globalAlpha *= alpha;
    if (ini > 0) { escrever(ctx, '…' + sep, x, y, { size: sz, papel: 'mao', cor: 'tinta' }); x += wid(ctx, '…' + sep, sz, 'mao'); }
    nomes.slice(ini).forEach((s, j) => {
      const i = ini + j, ultimo = i === nomes.length - 1;
      if (j > 0) { escrever(ctx, sep, x, y, { size: sz, papel: 'mao', cor: 'tinta' }); x += wid(ctx, sep, sz, 'mao'); }
      const w = wid(ctx, s, sz, 'mao');
      ctx.save(); if (ultimo && prox > 0) ctx.globalAlpha *= prox; // o nível que está chegando entra clareando
      escrever(ctx, s, x, y, { size: sz, papel: 'mao', cor: ultimo ? 'destaque' : 'tinta' });
      if (ultimo) E.linha(ctx, [[x, y + 16], [x + w + 6, y + 14]], { papel: 'destaque', lw: 5, seed: 31 + i });
      ctx.restore();
      x += w;
    });
    ctx.restore();
  }

  // ---------- os níveis, a porta e a câmera ----------
  const NV = () => SC.NIVEIS;
  // a porta pode ser um ponto fixo { x, y, r } ou uma função (st) => { x, y, r }, quando o nível muda de lugar com a história
  const porta = (i, st) => { const id = NV()[i] && NV()[i].id; let p = (P().PORTA || {})[id]; if (typeof p === 'function') p = p(st || {}); return p ? Object.assign({ r: 70 }, p) : { x: JC.x, y: JC.y, r: 70 }; };
  // desenha o nível i em coordenadas de nível (a peça desenha a janela inteira e um pouco além)
  function nivel(ctx, i, st, txt = 1) {
    const id = NV()[i] && NV()[i].id, f = (P().NIVEL || {})[id];
    const sub = Object.assign({}, st, { nivel: id, ni: i, principal: txt >= 1 });
    const antes = TXT; TXT = txt;
    try {
      if (f) f(ctx, sub, globalThis.MV);
      else { E.ret(ctx, -200, -200, G.W + 400, G.H + 400, { papel: 'superficie', contorno: false, hachura: false }); escrever(ctx, `[nível ${id}]`, JC.x, JC.y, { size: 60, papel: 'numero', align: 'center' }); }
    } finally { TXT = antes; }
  }
  // o nível i com o de dentro (i + 1) aparecendo na porta; u: 0 = vista do nível i, 1 = a porta encheu a janela
  function mergulho(ctx, i, u, st, { lente = 0, cabo = 0 } = {}) {
    const pt = porta(i, st), Zmax = RN / pt.r, Z = Math.pow(Zmax, u);
    // a câmera: a porta vai da posição dela até o meio da janela, em linha reta na tela, enquanto o zoom cresce
    const cx = pt.x - ((1 - u) * (pt.x - JC.x)) / Z, cy = pt.y - ((1 - u) * (pt.y - JC.y)) / Z;
    ctx.save(); ctx.translate(JC.x, JC.y); ctx.scale(Z, Z); ctx.translate(-cx, -cy); nivel(ctx, i, st, U.clamp(1 - u * 5, 0, 1)); ctx.restore();
    const sx = (pt.x - cx) * Z + JC.x, sy = (pt.y - cy) * Z + JC.y, sr = pt.r * Z;
    if (i + 1 < NV().length && (u > 0 || lente > 0)) {
      const k = u > 0 ? 1 : U.ease.outBack(lente);
      const r = sr * k, s = (Z * pt.r * k) / RN;
      ctx.save(); ctx.beginPath(); ctx.arc(sx, sy, Math.max(0.5, r), 0, Math.PI * 2); ctx.clip();
      ctx.translate(sx, sy); ctx.scale(s, s); ctx.translate(-JC.x, -JC.y); nivel(ctx, i + 1, st, U.clamp((u - 0.8) * 5, 0, 1)); ctx.restore();
      // o aro da lente (na tela, com a mesma grossura em qualquer zoom) e o cabo, que some quando a câmera entra
      const aro = 1 - U.clamp((u - 0.72) / 0.28, 0, 1);
      if (aro > 0) {
        ctx.save(); ctx.globalAlpha *= aro;
        const a = 0.78, x0 = sx + Math.cos(a) * (r + 8), y0 = sy + Math.sin(a) * (r + 8);
        if (cabo > 0) { ctx.save(); ctx.globalAlpha *= cabo; E.linha(ctx, [[x0, y0], [x0 + Math.cos(a) * 120 * k, y0 + Math.sin(a) * 120 * k]], { papel: 'tinta', lw: 22, seed: 77 }); ctx.restore(); }
        E.circulo(ctx, sx, sy, r, { papel: null, lw: 10, seed: 71, sombra: false, hachura: false });
        E.circulo(ctx, sx, sy, r + 9, { papel: null, tinta: 'destaque', lw: 6, seed: 72, sombra: false, hachura: false });
        ctx.restore();
      }
    }
  }
  function arredondado(ctx, x, y, w, h, r) {
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  // a vista dentro da janela no instante do estado: o nível parado (com o plano da frase), a lente ou a viagem
  function vista(ctx, st) {
    const cam = SC.camera(st.t);
    ctx.save();
    ctx.beginPath(); arredondado(ctx, JAN.x, JAN.y, JAN.w, JAN.h, JAN.r); ctx.clip();
    if (cam.viajando) mergulho(ctx, cam.base, cam.u, st, { cabo: 1 - U.clamp(cam.u * 4, 0, 1) });
    else if (st.lente > 0) mergulho(ctx, cam.base, 0, st, { lente: st.lente, cabo: 1 });
    else {
      const pl = st.it && st.mostra ? (SC.PLANOS || P().PLANOS || {})[st.it.n] : null; // o plano da frase (score.js): corte seco no começo dela
      ctx.save();
      if (pl) { ctx.translate(JC.x, JC.y); ctx.scale(pl.z || 1, pl.z || 1); ctx.translate(-(pl.x ?? JC.x), -(pl.y ?? JC.y)); }
      nivel(ctx, cam.base, st);
      ctx.restore();
    }
    ctx.restore();
    // a moldura da janela
    E.ret(ctx, JAN.x, JAN.y, JAN.w, JAN.h, { papel: null, lw: 9, r: JAN.r, seed: 61, sombra: false, hachura: false });
  }
  // o fecho: a viagem inteira em medalhões, um por nível, ligados por setas, com o nome embaixo
  function medalhoes(ctx, st, k = 1) {
    const n = NV().length, gap = 26, r = Math.min(86, (JAN.w - 40 - gap * (n - 1)) / (2 * n)), y = JAN.y + 40 + r;
    const larg = n * 2 * r + (n - 1) * gap, x0 = JC.x - larg / 2 + r;
    E.ret(ctx, JAN.x + 16, JAN.y + 16, JAN.w - 32, 2 * r + 150, { papel: 'superficie', r: 30, seed: 66, alpha: 0.94 * k, hachura: false });
    for (let i = 0; i < n; i++) {
      const a = U.ease.outBack(U.clamp((k * (n + 1) - i) / 1.2, 0, 1));
      if (a <= 0) continue;
      const x = x0 + i * (2 * r + gap), s = (r * a) / (JAN.h / 2);
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, Math.max(0.5, r * a), 0, Math.PI * 2); ctx.clip();
      ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-JC.x, -JC.y); nivel(ctx, i, st, 0); ctx.restore();
      E.circulo(ctx, x, y, r * a, { papel: null, lw: 7, seed: 80 + i, sombra: false, hachura: false });
      if (i < n - 1 && a >= 1) E.linha(ctx, [[x + r + 4, y], [x + r + gap - 4, y]], { papel: 'destaque', lw: 6, seed: 90 + i });
      const nome = D(NV()[i].rotulo);
      if (nome && a >= 1) {
        // o nome embaixo, com 36 (letra de rótulo que se lê no celular); se não couber, quebra em duas linhas
        const vaga = 2 * r + gap - 6, ws = nome.split(' ');
        let ls = [nome];
        if (wid(ctx, nome, 36, 'mao') > vaga && ws.length > 1) { const m = Math.ceil(ws.length / 2); ls = [ws.slice(0, m).join(' '), ws.slice(m).join(' ')]; }
        const sz = ls.every((l) => wid(ctx, l, 36, 'mao') <= vaga) ? 36 : 30;
        ls.forEach((l, j) => escrever(ctx, l, x, y + r + 48 + j * 40, { size: sz, papel: 'mao', align: 'center', cor: 'texto' }));
      }
    }
  }

  // ---------- o estado do filme no instante t ----------
  function estado(t) {
    const c = SC.cenaEm(t);
    let i = 0;
    c.itens.forEach((x, j) => { if (t >= x.t0) i = j; });
    const it = c.itens[i], ultima = i === c.itens.length - 1;
    const st = { t, c, it, i, u: t - c.t0 };
    st.mostra = t >= it.tv; // a primeira frase da cena só aparece depois da viagem
    const corte = i === 0;
    st.aTexto = !st.mostra ? 0 : Math.min(U.clamp((t - it.tv) / 0.2, 0, 1), ultima ? U.clamp((c.t1 - 0.05 - t) / 0.15, 0, 1) : U.clamp((it.t1 - t) / 0.12, 0, 1));
    if (ultima && c.lente) st.aTexto = Math.min(st.aTexto, U.clamp((c.lente.t0 + 0.25 - t) / 0.25, 0, 1)); // a frase sai quando a lente pousa
    st.dyTexto = corte ? 0 : (1 - U.ease.outCubic(U.clamp((t - it.tv) / 0.25, 0, 1))) * 16;
    st.lente = c.lente && t >= c.lente.t0 ? U.clamp((t - c.lente.t0) / 0.35, 0, 1) : 0;
    // o relógio do desenho: há quantos segundos cada frase da peça entrou na tela (negativo antes dela), em qualquer cena
    st.desde = {}; for (const n in SC.linha) st.desde[n] = t - SC.linha[n].t0;
    return st;
  }
  const desde = (st, n) => (st.desde && st.desde[n] != null ? st.desde[n] : -1);

  // ---------- as cenas do tipo ----------
  const CENA = {};
  CENA.pergunta = (ctx, st) => {
    vista(ctx, st);
    trilha(ctx, 0);
    if (st.i === 0) titulo(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
    else bloco(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
  };
  CENA.nivel = (ctx, st) => {
    vista(ctx, st);
    const cam = SC.camera(st.t);
    if (cam.viajando) trilha(ctx, cam.base + 1, { prox: cam.u }); // o nível de dentro entra clareando (e sai apagando)
    else trilha(ctx, cam.base);
    bloco(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
  };
  CENA.fecho = (ctx, st) => {
    vista(ctx, st);
    trilha(ctx, 0);
    if (st.mostra) medalhoes(ctx, st, p01(st.t, st.it.tv, 1.2));
    titulo(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
  };

  globalThis.MV = { L, R, TOP, BOT, CX, JAN, JC, RN, D, cor, wid, escrever, caber, desenhar, bloco, titulo, trilha, porta, nivel, mergulho, vista, medalhoes, p01, desde, estado, CENA };
})();
