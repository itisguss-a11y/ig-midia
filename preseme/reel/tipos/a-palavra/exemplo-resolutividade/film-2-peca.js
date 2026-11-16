// PRESEME · motor "a palavra" · desenho 2 · a PEÇA "resolutividade" (exemplo do tipo, em pixel art).
// Só o que é desta palavra: os destaques, a UBS no meio dos problemas que ela resolve (significa), o Seu Raimundo indo
// ao especialista com a equipe cuidando de longe (exemplo) e o sinal da pegadinha. Tudo da biblioteca (B) e do kit (E).
(function () {
  const U = globalThis.U, E = globalThis.ESTILOS, B = globalThis.BIB;
  const MP = globalThis.PRESEME_PALAVRA, M = MP.M;
  const D = M.D, cl = (v) => U.clamp(v, 0, 1);

  // os problemas de saúde que chegam à UBS (ícones da biblioteca), em volta dela; o último sai da UBS pela seta
  const PROBLEMAS = [
    (ctx, x, y) => B.termometro(ctx, { x, y, s: 0.62, rot: -0.5 }),
    (ctx, x, y) => B.aparelhoPressao(ctx, { x, y, s: 0.72 }),
    (ctx, x, y) => B.glicosimetro(ctx, { x, y, s: 0.62 }),
    (ctx, x, y) => B.cartaoVacina(ctx, { x, y, s: 0.36, marcadas: 3 }),
    (ctx, x, y) => B.coracao(ctx, { x, y, s: 1.3 }),
    (ctx, x, y) => B.seringa(ctx, { x, y, s: 0.55, rot: -0.4 }),
    (ctx, x, y) => B.gota(ctx, { x, y, r: 26 }),
    (ctx, x, y) => B.tenis(ctx, { x, y: y + 30, s: 1.05 }),
  ];

  MP.PECA = {
    DESTAQUE: { 2: 'a grande maioria', 3: 'segue cuidando dele', 4: 'coordenar o resto', 5: 'Resolutividade' },
    focoSignifica: [null],
    focoExemplo: [null],

    // significa: a grade 3 × 3, a UBS no meio; os problemas ganham o visto um a um, e o último leva a seta para fora
    significa(ctx, st, M, k) {
      const cw = 250, ch = 220, gap = 26, x0 = 540 - (3 * cw + 2 * gap) / 2, y0 = 760;
      let q = 0;
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
        const x = x0 + c * (cw + gap), y = y0 + r * (ch + gap), cx = x + cw / 2, cy = y + ch / 2;
        if (r === 1 && c === 1) {
          E.ret(ctx, x, y, cw, ch, { papel: 'apoio', r: 22, sombra: false, seed: 4000 });
          B.ubsIcone(ctx, { x: cx, y: cy + 30, s: 1.2, seed: 4001 });
          continue;
        }
        const i = q++;
        const a = U.ease.outBack(cl(k * 4 - i * 0.18));
        if (a <= 0) continue;
        ctx.save(); ctx.translate(cx, cy); ctx.scale(a, a); ctx.translate(-cx, -cy);
        E.ret(ctx, x, y, cw, ch, { papel: 'superficie', r: 22, sombra: true, seed: 4010 + i });
        PROBLEMAS[i](ctx, cx, cy + 6);
        ctx.restore();
        const kv = cl(k * 2.2 - 0.35 - i * 0.12);
        if (i < 7) B.visto(ctx, { x: x + cw - 26, y: y + 26, k: U.ease.outBack(kv), s: 0.9 });
        else if (kv > 0) E.seta(ctx, [x + cw - 30, y + ch / 2], [x + cw + 120, y + ch / 2 + 90], { k: U.ease.inOutCubic(kv), curva: 0.3, seed: 4030 });
      }
    },

    // exemplo: a UBS à esquerda, o especialista à direita; o Seu Raimundo vai andando pela linha tracejada e a médica
    // fica na UBS com a prancheta (segue cuidando)
    exemplo(ctx, st, M, k) {
      const CHAO = 1440;
      E.chao(ctx, CHAO, { seed: 4100 });
      B.ubsIcone(ctx, { x: 200, y: CHAO - 58 * 2.1, s: 2.1, seed: 4110 });
      const esp = B.casa(ctx, { x: 860, y: CHAO, w: 300, h: 360, parede: 'apoio', telhado: 'apoioEscuro', seed: 4120 });
      E.texto(ctx, D('D09'), 850, esp.topo - 140, { papel: 'mao', size: 46, align: 'center' });
      // o encaminhamento: a linha da UBS até o especialista, por cima das cabeças
      B.tracejado(ctx, { de: [330, 1030], ate: [700, 1030], k: cl(k * 2), papel: 'alerta', lw: 8, n: 8, seed: 4130 });
      const x = 560 + 120 * U.ease.inOutQuad(cl(k * 1.6 - 0.15));
      B.pessoa(ctx, { quem: 'idoso', x, y: CHAO + 14, s: 0.6, pose: k < 0.75 ? 'walk' : 'stand', walk: k * 5, look: 0.8, seed: 4140 });
      // a equipe fica na UBS, com a prancheta do caso: segue cuidando
      B.pessoa(ctx, { quem: 'medica', x: 320, y: CHAO + 14, s: 0.6, look: 0.7, seed: 4150 });
      B.prancheta(ctx, { x: 388, y: 1245, s: 0.7, rot: 0.12, linhas: 3, vistos: k > 0.6 ? 2 : 1, seed: 4160 });
      B.coracao(ctx, { x: 200, y: 1010, k: U.ease.outBack(cl(k * 2 - 1)), s: 1.1 });
    },

    sinal: '≠',
    carimbo: true,
  };
})();
