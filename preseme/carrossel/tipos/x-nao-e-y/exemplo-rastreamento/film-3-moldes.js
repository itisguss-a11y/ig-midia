// PRESEME · carrossel · tipo X NÃO É Y · os moldes de lâmina (estilo padrão: giz na lousa).
// Dois conceitos que se confundem: cada um definido com o desenho dele funcionando, um caso que separa os dois e como
// reconhecer na prática. É o irmão em carrossel do reel "X não é Y" (mesmas etiquetas, o mesmo ≠, a mesma pergunta).
// Este arquivo é do tipo e não muda de peça para peça. O desenho de cada lâmina vem da peça, em film-2-desenhos.js:
// PRESEME.DESENHO.cena[id](ctx, caixa, lam); na capa, cena.capaX e cena.capaY (um para cada lado); no caso, cena[id] é
// uma lista com dois desenhos, um por coluna. Lâmina sem desenho da peça sai só com o texto. Desenho parado.
// Tipos de lâmina (o score.js diz qual lâmina usa qual; em toda lâmina, a primeira palavra D é a etiqueta):
//   capa:       [título "X não é Y"], [por que se confundem] + D etiqueta, D nome de X, D nome de Y · os dois lados e o ≠
//   conceito:   [a definição], [o exemplo] + D nome do conceito (vira o cartão do alto), D rótulos do desenho
//   explica:    [a frase de cima], [a frase de baixo] + D etiqueta, D rótulos do desenho (lâmina livre, com desenho)
//   caso:       [o caso], [o lado de X], [o lado de Y] + D etiqueta, D nome de X, D nome de Y · duas colunas
//   reconhecer: [a pergunta que separa], [a frase de baixo] + D etiqueta, D pergunta, D ramo da esquerda, D ramo da
//               direita, D nome de X, D nome de Y · a pergunta com as duas setas
//   resumo:     até 3 frases, o nome de cada conceito no destaque + D etiqueta e D fontes (o ≠ entre as duas primeiras)
(function () {
  const G = globalThis.G, E = globalThis.ESTILOS, P = globalThis.PRESEME, TX = globalThis.TEXTOS, DS = P.DESENHO;
  const { L, R, CX, TOP, BOT } = P;
  const LW = R - L;
  DS.cena = DS.cena || {};
  const cena = (ctx, f, box, lam) => { if (typeof f === 'function' && box.h > 40 && box.w > 40) f(ctx, box, lam); };

  // a etiqueta da lâmina: a palavra em caixa alta, com um fio embaixo (em cima à esquerda, longe do contador 1/8)
  function etiqueta(ctx, k, y = TOP - 6, o = {}) {
    if (!TX[k]) return y;
    const s = TX[k].toUpperCase(), z = 34;
    E.texto(ctx, s, L, y + 36, { papel: 'corpo', size: z, cor: o.cor || 'texto' });
    const w = E.medir(ctx, s, { papel: 'corpo', size: z });
    E.linha(ctx, [[L, y + 54], [L + w, y + 56]], { papel: o.fio || 'alerta', lw: 4, seed: 3 });
    return y + 92;
  }
  // o cartão com o nome de um conceito (a etiqueta do reel), centrado em cx, cy e um pouco torto
  // (o.esquerda: true faz o cx ser a borda esquerda do cartão)
  function cartao(ctx, k, cx, cy, o = {}) {
    if (!TX[k]) return { w: 0, h: 0 };
    const size = o.size || 52, papel = o.papel || 'mao';
    const tw = Math.min(o.maxW || LW, E.medir(ctx, TX[k], { papel, size }) + 64), th = o.h || size * E.letra(papel)[2] * 1.5 + 22;
    ctx.save(); ctx.translate(o.esquerda ? cx + tw / 2 : cx, cy); ctx.rotate(o.rot ?? -0.03);
    E.ret(ctx, -tw / 2, -th / 2, tw, th, { papel: o.fundo || 'superficie', r: 16, seed: o.seed || 60, sombra: true });
    P.bloco(ctx, k, { x: -tw / 2 + 24, y: -th / 2 + 8, w: tw - 48, h: th - 16 }, { papel, sizes: [size, size - 4, size - 8, size - 12], align: 'center', valign: 'middle', maxLinhas: 2, lh: 1.04 });
    ctx.restore();
    return { w: tw, h: th };
  }
  // o sinal de diferente (≠), desenhado: os dois traços e a barra de Coral
  function diferente(ctx, cx, cy, r = 44) {
    E.linha(ctx, [[cx - r, cy - r * 0.32], [cx + r, cy - r * 0.32]], { lw: Math.max(6, r * 0.2), seed: 71 });
    E.linha(ctx, [[cx - r, cy + r * 0.32], [cx + r, cy + r * 0.32]], { lw: Math.max(6, r * 0.2), seed: 72 });
    E.linha(ctx, [[cx + r * 0.46, cy - r], [cx - r * 0.46, cy + r]], { papel: 'alerta', lw: Math.max(6, r * 0.2), seed: 73 });
  }

  P.MOLDE.capa = (ctx, lam) => {
    E.fundo(ctx);
    const [t1, t2] = lam.linhas, [et, kx, ky] = lam.palavras;
    const y0 = etiqueta(ctx, et);
    const a = P.titulo(ctx, t1, { x: L, y: y0 + 10, w: LW, h: 420 }, { sizes: [116, 108, 100, 92, 84, 76] });
    const b = t2 ? P.bloco(ctx, t2, { x: L, y: a.y1 + 30, w: LW, h: 170 }, { sizes: [50, 46, 42, 40] }) : a;
    const top = b.y1 + 56, wl = (LW - 140) / 2;
    if (!kx || !ky) return;
    const ca = cartao(ctx, kx, L + wl / 2, top + 40, { maxW: wl, rot: -0.05, seed: 61 });
    const cb = cartao(ctx, ky, R - wl / 2, top + 40, { maxW: wl, rot: 0.04, seed: 62 });
    diferente(ctx, CX, top + 40, 40);
    const hy = top + 40 + Math.max(ca.h, cb.h) / 2 + 26;
    cena(ctx, DS.cena.capaX, { x: L, y: hy, w: wl, h: BOT - hy }, lam);
    cena(ctx, DS.cena.capaY, { x: R - wl, y: hy, w: wl, h: BOT - hy }, lam);
  };

  P.MOLDE.conceito = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas, [nome] = lam.palavras;
    const c = cartao(ctx, nome, L + 4, TOP + 34, { maxW: LW * 0.8, rot: -0.03, seed: 63, size: 56, esquerda: true });
    const y0 = TOP + 34 + c.h / 2 + 34;
    const a = P.bloco(ctx, f1, { x: L, y: y0, w: LW, h: 300 }, { papel: 'titulo', sizes: [64, 60, 56, 52, 48], lh: 1.12 });
    const hb = f2 ? 230 : 0;
    cena(ctx, DS.cena[lam.id], { x: L, y: a.y1 + 30, w: LW, h: BOT - a.y1 - 30 - hb - 20 }, lam);
    if (f2) P.bloco(ctx, f2, { x: L, y: BOT - hb, w: LW, h: hb }, { sizes: [46, 42, 40, 38, 36], valign: 'bottom' });
  };

  P.MOLDE.explica = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas, [et] = lam.palavras;
    const y0 = etiqueta(ctx, et);
    const a = P.bloco(ctx, f1, { x: L, y: y0 + 4, w: LW, h: 320 }, { papel: 'titulo', sizes: [62, 58, 54, 50, 46], lh: 1.12 });
    const hb = f2 ? 230 : 0;
    cena(ctx, DS.cena[lam.id], { x: L, y: a.y1 + 30, w: LW, h: BOT - a.y1 - 30 - hb - 20 }, lam);
    if (f2) P.bloco(ctx, f2, { x: L, y: BOT - hb, w: LW, h: hb }, { sizes: [46, 42, 40, 38, 36], valign: 'bottom' });
  };

  P.MOLDE.caso = (ctx, lam) => {
    E.fundo(ctx);
    const [f0, fa, fb] = lam.linhas, [et, kx, ky] = lam.palavras;
    const y0 = etiqueta(ctx, et);
    const a = P.bloco(ctx, f0, { x: L, y: y0 + 4, w: LW, h: 170 }, { papel: 'titulo', sizes: [62, 58, 54, 50], lh: 1.1 });
    const gap = 60, wc = (LW - gap) / 2, top = a.y1 + 40, hf = 300;
    const des = Array.isArray(DS.cena[lam.id]) ? DS.cena[lam.id] : [];
    E.linha(ctx, [[CX, top + 10], [CX, BOT - 10]], { papel: 'apoio', lw: 3, seed: 81, tracejado: true });
    [[fa, kx, L, -0.04], [fb, ky, R - wc, 0.03]].forEach(([f, k, x, rot], i) => {
      const c = cartao(ctx, k, x + wc / 2, top + 36, { maxW: wc, rot, seed: 64 + i, size: 44 });
      const yd = top + 36 + c.h / 2 + 20;
      cena(ctx, des[i], { x, y: yd, w: wc, h: BOT - hf - 16 - yd }, lam);
      if (f) P.bloco(ctx, f, { x, y: BOT - hf, w: wc, h: hf }, { sizes: [42, 40, 38, 36, 34], valign: 'top' });
    });
  };

  P.MOLDE.reconhecer = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas, [et, kq, ka, kb, kx, ky] = lam.palavras;
    const y0 = etiqueta(ctx, et);
    const a = P.bloco(ctx, f1, { x: L, y: y0 + 4, w: LW, h: 260 }, { papel: 'titulo', sizes: [64, 60, 56, 52, 48], lh: 1.12 });
    const hb = f2 ? 200 : 0, top = a.y1 + 50, bot = BOT - hb - 30;
    // a pergunta no alto, as duas setas e os dois nomes embaixo
    const yq = top + 50, cq = cartao(ctx, kq, CX, yq, { maxW: LW * 0.8, rot: 0, seed: 66, size: 50 });
    const yf = Math.max(yq + cq.h / 2 + 200, bot - 60), xa = L + LW * 0.22, xb = R - LW * 0.22;
    E.seta(ctx, [CX - 60, yq + cq.h / 2 + 12], [xa + 30, yf - 64], { lw: 8, curva: 0.18, seed: 91 });
    E.seta(ctx, [CX + 60, yq + cq.h / 2 + 12], [xb - 30, yf - 64], { lw: 8, curva: -0.18, seed: 92 });
    // o rótulo de cada ramo fica do lado de fora da seta (a seta embarriga para fora)
    const ym = (yq + cq.h / 2 + yf - 64) / 2, ma = (CX - 60 + xa + 30) / 2 - 60, mb = (CX + 60 + xb - 30) / 2 + 60;
    if (ka) P.bloco(ctx, ka, { x: L, y: ym - 40, w: ma - L, h: 70 }, { papel: 'mao', sizes: [56, 52, 48], align: 'right', valign: 'middle', maxLinhas: 1 });
    if (kb) P.bloco(ctx, kb, { x: mb, y: ym - 40, w: R - mb, h: 70 }, { papel: 'mao', sizes: [56, 52, 48], align: 'left', valign: 'middle', maxLinhas: 1 });
    cartao(ctx, kx, xa, yf, { maxW: LW * 0.46, rot: -0.04, seed: 67, size: 46 });
    cartao(ctx, ky, xb, yf, { maxW: LW * 0.46, rot: 0.03, seed: 68, size: 46 });
    if (f2) P.bloco(ctx, f2, { x: L, y: BOT - hb, w: LW, h: hb }, { sizes: [46, 42, 40, 38], valign: 'bottom' });
  };

  P.MOLDE.resumo = (ctx, lam) => {
    E.fundo(ctx, { tipo: 'escuro' });
    const fr = lam.linhas, [et, fonte] = lam.palavras;
    const y0 = etiqueta(ctx, et, TOP - 6, { cor: 'papel', fio: 'marca' });
    const passo = Math.min(330, (BOT - 130 - y0) / Math.max(1, fr.length));
    fr.forEach((k, i) => {
      const y = y0 + 30 + i * passo;
      if (i === 1) diferente(ctx, CX, y - 30, 30);
      else if (i > 1) E.linha(ctx, [[L, y - 26], [R, y - 22]], { papel: 'salvia', lw: 3, seed: 101 + i, tracejado: true });
      P.bloco(ctx, k, { x: L, y, w: LW, h: passo - 70 }, { papel: 'titulo', sizes: [72, 66, 60, 56, 52, 48], lh: 1.1, valign: 'middle', cor: 'papel', corTrecho: 'marca' });
    });
    P.fonte(ctx, fonte, { x: L, y: BOT - 80, w: LW, h: 80 }, { cor: 'salvia', valign: 'bottom' });
  };
})();
