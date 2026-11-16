// PRESEME · motor do tipo "um dia, contado pela hora" · desenho 3/3 · o molde: abertura, recontagem, fecho e o filme
// (não muda de uma peça para outra; as frases e os números saem do score.js e do textos.txt)
(function () {
  const U = globalThis.U, G = globalThis.G, E = globalThis.ESTILOS, SC = globalThis.SCORE, TX = globalThis.TEXTOS, DIA = globalThis.DIA, Ch = globalThis.Ch;
  const { C, L, R, CX, GY, txt } = DIA;
  const usos = SC.cenas.filter((c) => c.uso);
  const A = SC.ABERTURA, RC = SC.RECONTAGEM, FE = SC.FECHO;

  // a lente pequena, com um visto: aparece na tese e volta no fecho
  function lentePequena(ctx, k = 1) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(R + 6 + (1 - k) * 260, 1338 + (1 - k) * 260); ctx.rotate(-0.25);
    DIA.lente(ctx, 0, 0, 62, (c) => { G.line(c, [[-34, 12], [-10, 32], [36, -24]], { color: C.marca, lw: 10, seed: 3 }); });
    ctx.restore();
  }

  // ---------- a abertura: a pergunta, a resposta do protagonista e a tese ----------
  const abertura = (ctx, st) => {
    const t = st.t, f2 = st.c.itens.find((i) => i.n === A.resposta), f3 = st.c.itens.find((i) => i.n === A.tese);
    const fala = f2 && t >= f2.t0, tese = f3 && t >= f3.t0;
    if (tese) DIA.titulo(ctx, A.tese, U.clamp((t - f3.t0) / 0.2, 0, 1)); else DIA.titulo(ctx, A.pergunta, 1);
    DIA.chao(ctx);
    // o primeiro segundo já tem movimento: o protagonista entra pela esquerda (0,5 s) e o contador dá um pulo (aos 0,55 s)
    const u = t - st.c.t0;
    DIA.contador(ctx, 0, CX + 200, 1100, 1.2, U.pulse(u, 0.55, 7));
    Ch.person(ctx, { x: L + 200 - (1 - U.ease.outCubic(U.clamp(u / 0.5, 0, 1))) * 340, y: GY, pose: 'stand', s: 1.15, eyes: 'normal', mouth: 'smirk', gesture: fala ? 'shrug' : null, style: DIA.GENTE.protagonista });
    if (fala) {
      // cada frase da resposta numa linha; linha larga demais se quebra
      const partes = (TX[A.resposta].match(/[^.!?]+[.!?]*/g) || [TX[A.resposta]]).map((s) => s.trim()).filter(Boolean);
      const linhas = [].concat(...partes.map((s) => DIA.quebrar(ctx, s, 44, 470)));
      ctx.save(); ctx.globalAlpha *= U.clamp((t - f2.t0) / 0.15, 0, 1);
      DIA.balao(ctx, linhas, L + 6, 804 - linhas.length * DIA.zz(44) * 1.3, L + 225, 872, 44);
      ctx.restore();
    }
    if (tese) lentePequena(ctx, U.tween(t, f3.t0, f3.t0 + 0.45, 0, 1, U.ease.outBack));
  };

  // ---------- a recontagem: uma fileira por categoria e a do zero; depois, o resultado ----------
  // o número de cada fileira e o total saem da lista de momentos (score.js); o texto só dá o nome da fileira
  function resultado(ctx, t, fr) {
    DIA.bloco(ctx, RC.resultado, { baseY: 640, sizes: [70, 64, 58], maxLinhas: [2, 3, 3] });
    DIA.contador(ctx, usos.length, CX, 1010, 1.3, U.pulse(t, fr.t0, 7));
    const passo = (R - L) / usos.length;
    usos.forEach((u, i) => { const ts = fr.t0 + 0.1 * (i + 1); if (t >= ts) DIA.selo(ctx, L + passo * (i + 0.5), 1330, u.selo, 300 + i * 5, Math.min(0.9, (passo - 6) / 88) * (1 + 0.3 * U.pulse(t, ts, 9)), u.uso); });
  }
  const recontagem = (ctx, st) => {
    const t = st.t, c = st.c, fr = c.itens.find((i) => i.n === RC.resultado);
    if (fr && t >= fr.t0) { resultado(ctx, t, fr); return; }
    DIA.contador(ctx, usos.length, CX, DIA.TOP + 215, 0.9);
    const passo = 108, alto = Math.min(176, 700 / Math.max(1, RC.filas.length));
    RC.filas.forEach(([n, cat], i) => {
      const it = c.itens.find((x) => x.n === n), y = 806 + i * alto, yy = y + 74;
      if (!it || t < it.t0) return;
      // "Vigilância sanitária, 5." vira o nome da fileira; o número desenhado é o da conta
      const m = TX[n].match(/^(.*?),?\s*(\d+)\.?$/), nome = m ? m[1] : TX[n];
      txt(ctx, nome, L + 6, y, { size: 46, alpha: U.clamp((t - it.t0) / 0.15, 0, 1) });
      const daqui = cat ? usos.filter((x) => x.vig === cat) : [];
      if (daqui.length) {
        daqui.forEach((u, j) => { const t0 = it.t0 + 0.12 * (j + 1); if (t >= t0) DIA.selo(ctx, L + 56 + j * passo, yy, u.selo, 200 + i * 20 + j * 3, 1 + 0.3 * U.pulse(t, t0, 9), u.uso); });
        if (t >= it.t0 + 0.12 * (daqui.length + 1)) txt(ctx, String(daqui.length), L + 56 + daqui.length * passo - 14, yy + 24, { size: 68, papel: 'numero' });
      } else {
        for (let j = 0; j < 3; j++) { ctx.save(); ctx.setLineDash([10, 12]); G.ellipse(ctx, L + 56 + j * passo, yy, 44, 44, { stroke: C.folha, lw: 4, seed: 260 + j, second: false }); ctx.restore(); }
        if (t >= it.t0 + 0.36) txt(ctx, '0', L + 56 + 3 * passo - 14, yy + 24, { size: 68, color: C.coral, stroke: DIA.INK, strokeW: 7, papel: 'numero' }); // o contorno dá o contraste que o Coral sozinho não tem
      }
    });
  };

  // ---------- o fecho: a tese de novo, com o contador cheio ----------
  const fecho = (ctx) => {
    DIA.titulo(ctx, FE.tese, 1);
    DIA.chao(ctx);
    DIA.contador(ctx, usos.length, CX + 200, 1100, 1.2);
    Ch.person(ctx, { x: L + 200, y: GY, pose: 'stand', s: 1.15, eyes: 'happy', mouth: 'smile', look: 0.7, style: DIA.GENTE.protagonista });
    lentePequena(ctx, 1);
  };
  const GERAL = { abertura, recontagem, fecho };

  // ---------- o filme: a cada instante, desenha a cena da vez ----------
  globalThis.Studio.film({
    fadeOut: 0,
    draw(ctx, t) {
      E.fundo(ctx);
      const st = DIA.estado(Math.min(Math.max(t, 0), SC.DURATION - 0.001));
      const c = st.c;
      if (st.cartao) DIA.cartaoNome(ctx, st); // a frase que dá o nome da categoria: cartão escuro de tela cheia
      else if (c.uso) { // o momento: o desenho da peça (de longe ou de perto) e, por cima, hora, contador, frase e faixa
        const desenha = DIA.CENA[c.id] || ((cx) => { DIA.chao(cx); DIA.DENTRO.palavra && DIA.lente(cx, DIA.CX, 1100, 200, (k) => DIA.DENTRO.palavra(k, DIA.CX, 1100, { grande: String(c.uso) }), { k: st.kLente }); });
        DIA.palco(ctx, st, () => desenha(ctx, st));
        DIA.moldura(ctx, st);
      } else GERAL[c.tipo](ctx, st); // abertura, recontagem e fecho desenham tudo sozinhos
    },
  });
})();
