// versão 5, só para testar o motor; a peça de verdade está no chat dela
// PRESEME · "Quantas vezes você usou o SUS hoje?" · desenho 5/5 · recontagem, fecho e o filme
(function () {
  const U = globalThis.U, G = globalThis.G, Ch = globalThis.Ch, S = globalThis.SUS, SC = globalThis.SCORE, TX = globalThis.TEXTOS;
  const { C, L, R, TOP, CX, GY, txt } = S;
  const usos = SC.cenas.filter((c) => c.uso);

  // ---------- a recontagem: uma fileira por frase [27] a [30]; depois, o resultado [31] ----------
  // o resultado [31] tem tela própria (um corte): a frase, o contador grande e os 9 selos, na ordem do dia
  function resultado(ctx, t, f31) {
    S.bloco(ctx, 31, { baseY: 640, sizes: [70, 64, 58], maxLinhas: [2, 3, 3] });
    S.contador(ctx, usos.length, CX, 1010, 1.3, U.pulse(t, f31.t0, 7));
    const passo = (R - L) / usos.length;
    usos.forEach((u, i) => { const ts = f31.t0 + 0.1 * (i + 1); if (t >= ts) S.selo(ctx, L + passo * (i + 0.5), 1330, u.selo, 300 + i * 5, Math.min(0.9, (passo - 6) / 88) * (1 + 0.3 * U.pulse(t, ts, 9))); });
  }
  S.CENA.recontagem = (ctx, st) => {
    const t = st.t, c = st.c, f31 = c.itens.find((i) => i.n === 31);
    if (f31 && t >= f31.t0) { resultado(ctx, t, f31); return; }
    S.contador(ctx, usos.length, CX, TOP + 215, 0.9);
    const filas = [[27, 'san'], [28, 'epi'], [29, 'amb'], [30, null]], passo = 108;
    filas.forEach(([n, vig], i) => {
      const it = c.itens.find((x) => x.n === n), y = 806 + i * 176, yy = y + 74;
      if (!it || t < it.t0) return;
      // "Vigilância sanitária, 5." vira o nome da fileira e o número grande
      const m = TX[n].match(/^(.*?),?\s*(\d+)\.?$/), nome = m ? m[1] : TX[n], num = m ? m[2] : '';
      txt(ctx, nome, L + 6, y, { size: 46, weight: 700, alpha: U.clamp((t - it.t0) / 0.15, 0, 1) });
      const selos = vig ? usos.filter((x) => x.vig === vig).map((x) => x.selo) : [];
      if (selos.length) {
        selos.forEach((k, j) => { const t0 = it.t0 + 0.12 * (j + 1); if (t >= t0) S.selo(ctx, L + 56 + j * passo, yy, k, 200 + i * 20 + j * 3, 1 + 0.3 * U.pulse(t, t0, 9)); });
        if (t >= it.t0 + 0.12 * (selos.length + 1)) txt(ctx, num, L + 56 + selos.length * passo - 14, yy + 24, { size: 68 });
      } else {
        for (let j = 0; j < 3; j++) { ctx.save(); ctx.setLineDash([10, 12]); G.ellipse(ctx, L + 56 + j * passo, yy, 44, 44, { stroke: C.folha, lw: 4, seed: 260 + j, second: false }); ctx.restore(); }
        if (t >= it.t0 + 0.36) txt(ctx, num, L + 56 + 3 * passo - 14, yy + 24, { size: 68, color: C.coral, stroke: S.INK, strokeW: 7 }); // o contorno dá o contraste que o coral sozinho não tem
      }
    });
  };

  // ---------- o fecho: a tese de novo [32], com o contador cheio ----------
  S.CENA.fecho = (ctx, st) => {
    S.titulo(ctx, 32, 1);
    S.chao(ctx);
    S.contador(ctx, usos.length, CX + 200, 1100, 1.2);
    Ch.person(ctx, { x: L + 200, y: GY, pose: 'stand', s: 1.15, eyes: 'happy', mouth: 'smile', look: 0.7, style: S.CALOURO });
    ctx.save(); ctx.translate(R + 6, 1338); ctx.rotate(-0.25);
    S.lente(ctx, 0, 0, 62, (c) => { G.line(c, [[-34, 12], [-10, 32], [36, -24]], { color: C.marca, lw: 10, seed: 3 }); });
    ctx.restore();
  };

  // ---------- o filme: a cada instante, desenha a cena da vez ----------
  globalThis.Studio.film({
    draw(ctx, t) {
      G.bg(ctx, C.papel);
      const st = S.estado(Math.min(Math.max(t, 0), SC.DURATION - 0.001));
      const c = st.c;
      if (st.cartao) S.cartaoNome(ctx, st); // a frase que dá o nome da vigilância: cartão escuro de tela cheia
      else if (c.uso) { S.palco(ctx, st, () => S.CENA[c.id](ctx, st)); S.moldura(ctx, st); } // o desenho (de longe ou de perto) e, por cima, hora, contador, frase e faixa
      else S.CENA[c.id](ctx, st); // abertura, recontagem e fecho desenham tudo sozinhos
    },
    fadeOut: 0,
    post: { paper: 0.5, vignette: 0.12, grain: 0.04 },
  });
})();
