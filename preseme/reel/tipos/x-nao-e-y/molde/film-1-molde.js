// PRESEME · motor do tipo "X não é Y" · desenho 1/3 · o molde (igual em toda peça deste tipo; o chat não mexe aqui)
// O texto que se quebra sozinho com o trecho no destaque, a etiqueta de cada lado (X e Y), o sinal de diferente,
// os painéis lado a lado, as linhas da regra (pistas → nome) e o estado do filme em cada instante.
// Tudo é desenhado com o kit de estilos (globalThis.ESTILOS): a mesma peça sai em qualquer dos seis estilos.
// Todo texto da tela vem do textos.js. O que é de uma peça só (os desenhos, os destaques, os nomes) está em film-2-peca.js.
(function () {
  const U = globalThis.U, G = globalThis.G, E = globalThis.ESTILOS, SC = globalThis.SCORE, TX = globalThis.TEXTOS;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const L = SAFE.x, R = SAFE.x + SAFE.w, TOP = SAFE.y, BOT = SAFE.y + SAFE.h, CX = (L + R) / 2; // 60, 940, 221, 1498, 500
  const TEXTO_Y = TOP + 96; // a base da primeira linha do texto
  const AREA = { x0: L, x1: R, y0: 700, y1: BOT - 30 }; // onde o desenho mora (abaixo do texto)
  const NB = ' '; // espaço que não quebra: o trecho do destaque fica numa linha só
  const P = () => globalThis.PECA || {};
  const D = (k) => TX[k] || '';
  const prog = (t, t0, d) => U.clamp((t - t0) / d, 0, 1);

  // ---------- o texto que se quebra sozinho ----------
  const FRACA = new Set(['a', 'o', 'as', 'os', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'e', 'em', 'no', 'na', 'nos', 'nas', 'que', 'é', 'à', 'ao', 'para', 'por', 'com', 'se', 'não', 'ou', 'te']);
  function quebrar(ctx, s, papel, size, maxW) {
    const out = []; let cur = '';
    for (const w of s.split(' ')) {
      const t = cur ? cur + ' ' + w : w;
      if (cur && E.medir(ctx, t.split(NB).join(' '), { papel, size }) > maxW) { out.push(cur); cur = w; } else cur = t;
    }
    if (cur) out.push(cur);
    return out;
  }
  // a mesma quantidade de linhas, com as linhas de tamanho parecido e sem palavrinha solta no fim da linha
  function equilibrar(ctx, s, papel, size, maxW) {
    const base = quebrar(ctx, s, papel, size, maxW), k = base.length;
    if (k < 2) return base;
    let melhor = base, nota = Infinity;
    for (let w = maxW; w > maxW * 0.45; w -= 20) {
      const ls = quebrar(ctx, s, papel, size, w);
      if (ls.length !== k) break;
      const ws = ls.map((l) => E.medir(ctx, l.split(NB).join(' '), { papel, size }));
      const fracas = ls.slice(0, -1).filter((l) => FRACA.has(l.split(' ').pop().toLowerCase().replace(/[.,;:!?]/g, ''))).length;
      const n = Math.max(...ws) - Math.min(...ws) + 400 * fracas;
      if (n < nota) { nota = n; melhor = ls; }
    }
    return melhor;
  }
  // as linhas de uma frase, no maior tamanho que cabe (de sizes, com no máximo maxLinhas[i] linhas)
  const memo = new Map();
  function arranjo(ctx, n, { papel = 'titulo', sizes = [64, 58, 52, 48], maxLinhas = [2, 3, 3, 4], maxW = R - L } = {}) {
    const key = [n, papel, sizes.join(','), maxW, D(n)].join('|');
    if (memo.has(key)) return memo.get(key);
    let s = D(n); const d = (P().DESTAQUE || {})[n];
    if (d && s.includes(d)) s = s.replace(d, d.split(' ').join(NB));
    let res = null;
    for (let i = 0; i < sizes.length; i++) {
      const ls = equilibrar(ctx, s, papel, sizes[i], maxW);
      const cabe = ls.every((l) => E.medir(ctx, l.split(NB).join(' '), { papel, size: sizes[i] }) <= maxW);
      if (ls.length <= maxLinhas[i] && cabe) { res = { ls, size: sizes[i] }; break; }
    }
    if (!res) { const z = sizes[sizes.length - 1]; res = { ls: equilibrar(ctx, s, papel, z, maxW), size: z }; }
    memo.set(key, res);
    return res;
  }
  // a frase n, a partir da base y0 (primeira linha); devolve a base da última linha
  function bloco(ctx, n, { y0 = TEXTO_Y, papel = 'titulo', sizes, maxLinhas, maxW = R - L, align = 'center', x = null, alpha = 1, dy = 0, k = 1, entrelinha = 1.22 } = {}) {
    if (!D(n)) return y0;
    const { ls, size } = arranjo(ctx, n, { papel, sizes, maxLinhas, maxW });
    const d = (P().DESTAQUE || {})[n] || '';
    const lh = size * E.letra(papel)[2] * entrelinha;
    const xx = x ?? (align === 'center' ? CX : L);
    ctx.save(); ctx.globalAlpha *= alpha;
    ls.forEach((l, i) => {
      const s = l.split(NB).join(' ');
      E.textoComDestaque(ctx, s, d && s.includes(d) ? d : '', xx, y0 + i * lh + dy, { papel, size, align, k, seed: 7 + n * 3 + i });
    });
    ctx.restore();
    return y0 + (ls.length - 1) * lh;
  }

  // ---------- a etiqueta de cada lado: o nome do conceito numa placa ----------
  // lado 'x' (o conceito do título, o que a peça ensina): placa escura (Folha) com letra clara;
  // lado 'y' (o que se confunde com ele): placa clara (superfície do estilo) com a letra do texto
  const nomeDe = (lado) => D((P().NOMES || { x: 'D02', y: 'D01' })[lado]);
  function etiqueta(ctx, lado, x, y, { k = 1, size = 44, align = 'left', seed = 0 } = {}) {
    if (k <= 0) return { w: 0, h: 0 };
    const s = nomeDe(lado), w = E.medir(ctx, s, { papel: 'titulo', size }) + 56, h = size * 1.7;
    const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    const z = U.ease.outBack(Math.min(1, k));
    ctx.save(); ctx.translate(x0 + w / 2, y + h / 2); ctx.scale(z, z); ctx.translate(-(x0 + w / 2), -(y + h / 2));
    E.ret(ctx, x0, y, w, h, { papel: lado === 'x' ? 'apoioEscuro' : 'superficie', r: h / 2, seed: 11 + seed });
    E.texto(ctx, s, x0 + w / 2, y + h * 0.66, { papel: 'titulo', size, align: 'center', cor: lado === 'x' ? 'papel' : 'texto' });
    ctx.restore();
    return { x: x0, y, w, h };
  }

  // ---------- o sinal de diferente (≠), em Coral: o alerta de que são duas coisas ----------
  function diferente(ctx, cx, cy, r, { k = 1, seed = 30 } = {}) {
    if (k <= 0) return;
    const z = U.ease.outBack(Math.min(1, k));
    ctx.save(); ctx.translate(cx, cy); ctx.scale(z, z);
    E.circulo(ctx, 0, 0, r, { papel: 'superficie', seed, lw: 6 });
    const a = r * 0.5, lw = Math.max(8, r * 0.16);
    E.linha(ctx, [[-a, -a * 0.32], [a, -a * 0.32]], { papel: 'alerta', lw, seed: seed + 1 });
    E.linha(ctx, [[-a, a * 0.32], [a, a * 0.32]], { papel: 'alerta', lw, seed: seed + 2 });
    E.linha(ctx, [[a * 0.45, -a * 0.95], [-a * 0.45, a * 0.95]], { papel: 'alerta', lw, seed: seed + 3 });
    ctx.restore();
  }

  // ---------- a placa de uma palavra-pista (na regra) ----------
  function pista(ctx, s, x, y, { k = 1, size = 40, seed = 0 } = {}) {
    if (k <= 0) return 0;
    const w = E.medir(ctx, s, { papel: 'corpo', size }) + 40, h = size * 1.6;
    ctx.save(); ctx.globalAlpha *= Math.min(1, k * 2);
    E.ret(ctx, x, y - h / 2, w, h, { papel: 'apoio', r: 18, seed: 40 + seed });
    E.texto(ctx, s, x + 20, y + size * 0.36, { papel: 'corpo', size });
    ctx.restore();
    return w;
  }

  // ---------- o estado do filme no instante t: a cena, a frase da vez e a entrada do texto ----------
  function estado(t) {
    const c = SC.cenaEm(t);
    let i = 0;
    c.itens.forEach((x, j) => { if (t >= x.t0) i = j; });
    const it = c.itens[i], ultima = i === c.itens.length - 1;
    const st = { t, c, it, i, u: t - c.t0 };
    // a primeira frase da cena entra junto com a imagem (corte seco); as outras surgem em 0,2 s e somem 0,12 s antes da seguinte
    const corte = i === 0;
    st.aTexto = Math.min(corte ? 1 : prog(t, it.t0, 0.2), ultima ? 1 : U.clamp((it.t1 - t) / 0.12, 0, 1));
    st.dyTexto = corte ? 0 : (1 - U.ease.outCubic(prog(t, it.t0, 0.25))) * 16;
    // o destaque da frase entra depois dela (0,4 s depois de ela aparecer, em 0,5 s)
    st.kDestaque = U.ease.inOutCubic(prog(t, it.t0 + (corte ? 0.5 : 0.4), 0.5));
    return st;
  }
  // a frase da vez, no lugar padrão (em cima)
  function textoDaVez(ctx, st, o = {}) {
    return bloco(ctx, st.it.n, Object.assign({ alpha: st.aTexto, dy: st.dyTexto, k: st.kDestaque }, o));
  }

  // a base da última linha da frase mais alta da cena, com as mesmas opções do textoDaVez: o desenho que fica embaixo
  // do texto começa daqui (assim ele não pula quando a frase troca, e não sobra faixa vazia entre o texto e o desenho)
  function fimDoTexto(ctx, c, { y0 = TEXTO_Y, papel = 'titulo', sizes, maxLinhas, maxW = R - L, entrelinha = 1.22 } = {}) {
    let fim = y0;
    for (const it of c.itens) {
      if (!D(it.n)) continue;
      const { ls, size } = arranjo(ctx, it.n, { papel, sizes, maxLinhas, maxW });
      fim = Math.max(fim, y0 + (ls.length - 1) * size * E.letra(papel)[2] * entrelinha);
    }
    return fim;
  }

  globalThis.MOLDE = { W, H, L, R, TOP, BOT, CX, TEXTO_Y, AREA, D, prog, bloco, arranjo, etiqueta, nomeDe, diferente, pista, estado, textoDaVez, fimDoTexto };
})();
