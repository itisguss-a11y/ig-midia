// PRESEME · carrossel · tipo MACETE PARA A PROVA · desenho 3 · os desenhos do assunto do exemplo "Princípios do SUS:
// doutrinários ou organizativos?" (o macete DIP: as três diretrizes do art. 198 da Constituição). Um por peça do
// macete e um para a pegadinha:
//   esferas     D, descentralização: as três esferas de governo, um comando só em cada uma (no estado, o mapa de
//               Roraima), e o serviço perto, no município (a UBS ao lado da casa)
//   prevencao   I, atendimento integral: a prevenção em primeiro lugar (maior, no destaque) e o tratamento junto
//   conselho    P, participação da comunidade: o conselho de saúde, com os usuários na metade das cadeiras
//   duasListas  a pegadinha: a lista da Constituição (diretrizes) em cima da lista da Lei 8.080 (princípios), com as fichas D, I e P
//               marcando as três ideias que estão nas duas
// Usa a biblioteca (B.pessoa, B.ubsIcone, B.casa, B.mapaRR, B.seringa, B.cartaoVacina, B.termometro) e o kit do tipo
// (PRESEME.KIT.ficha). Todo texto vem das palavras D do textos.txt.
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, DS = P.DESENHO, TX = globalThis.TEXTOS, SC = globalThis.SCORE;
  const K = P.KIT, liso = K.liso;
  const BB = () => globalThis.BIB;
  const kz = (papel) => E.letra(papel)[2];
  // o rótulo de uma linha, centrado em x (a letra diminui até caber em w, sem passar de 30 px)
  function rotulo(ctx, k, x, yBase, w, o = {}) {
    const s = TX[k] || '';
    if (!s) return;
    const papel = o.papel || 'numero';
    let z = o.size || 40;
    while (z > 30 && E.medir(ctx, s, { papel, size: z }) > w) z -= 2;
    E.texto(ctx, s, x, yBase, { papel, size: z, align: o.align || 'center', cor: o.cor || 'texto' });
  }
  const letraDa = (i) => (SC.MACETE[i] || {}).letra;

  // D · as três esferas de governo, uma faixa cada, com um comando só (uma pessoa); na do município, a UBS perto da casa
  DS.esferas = (ctx, cx, lam, [kU, kE, kM]) => {
    const B = BB(), gap = 18, bh = (cx.h - gap * 2) / 3, wf = cx.w - 96, wl = wf * 0.36;
    const quem = [{ quem: 'medico', corRoupa: 'apoioEscuro' }, { quem: 'medica', corRoupa: 'apoio' }, { quem: 'enfermeira' }];
    [kU, kE, kM].forEach((k, i) => {
      const y = cx.y + i * (bh + gap), aqui = i === 2;
      E.ret(ctx, cx.x, y, wf, bh, Object.assign({ papel: 'superficie', tinta: aqui ? 'destaque' : 'tinta', lw: aqui ? 7 : 4, r: 18, seed: 300 + i }, liso));
      rotulo(ctx, k, cx.x + 34, y + bh / 2 + 50 * kz('titulo') * 0.36, wl - 40, { papel: 'titulo', size: 50, align: 'left' });
      // um comando só: uma pessoa por esfera, inteira dentro da faixa
      const s = Math.min(0.42, (bh - 28) / 430);
      B.pessoa(ctx, Object.assign({ x: cx.x + wl + 60, y: y + bh - 12, s, pose: 'stand' }, quem[i]));
      if (i === 1) B.mapaRR(ctx, { x: cx.x + wl + 150, y: y + 12, w: 230, h: bh - 24, base: 'apoioEscuro', lw: 2.5 }); // o estado: Roraima
      if (aqui) { // o serviço perto: a UBS e a casa do lado
        const sc = Math.min(0.85, (bh - 24) / 160);
        B.ubsIcone(ctx, { x: cx.x + wl + 220, y: y + bh / 2 + 18 * sc, s: sc });
        // a casa da biblioteca tem janela e porta de medida fixa: desenha no tamanho padrão (428 × 540) e encolhe junto
        const sk = (bh - 34) / 540;
        ctx.save(); ctx.translate(cx.x + wl + 390, y + bh - 14); ctx.scale(sk, sk);
        B.casa(ctx, { x: 0, y: 0, porta: 0 });
        ctx.restore();
      }
    });
    // a seta que desce, na margem: do alto até o município
    const xa = cx.x + cx.w - 40;
    E.seta(ctx, [xa, cx.y + bh * 0.3], [xa, cx.y + 2 * (bh + gap) + bh * 0.6], { papel: 'alerta', lw: 8, curva: 0, cabeca: 34, seed: 310 });
  };

  // I · prevenção em primeiro lugar (o quadro maior, no destaque) e o tratamento junto, no mesmo atendimento
  DS.prevencao = (ctx, cx, lam, [kP, kT]) => {
    const B = BB(), gap = 90, w1 = (cx.w - gap) * 0.6, w2 = cx.w - gap - w1, h = cx.h - 10, y = cx.y + 4;
    E.ret(ctx, cx.x, y, w1, h, Object.assign({ papel: 'superficie', tinta: 'destaque', lw: 7, r: 20, seed: 320 }, liso));
    E.ret(ctx, cx.x + w1 + gap, y + h * 0.12, w2, h * 0.76, Object.assign({ papel: 'superficie', r: 20, seed: 321 }, liso));
    rotulo(ctx, kP, cx.x + w1 / 2, y + 70, w1 - 60, { papel: 'titulo', size: 52 });
    rotulo(ctx, kT, cx.x + w1 + gap + w2 / 2, y + h * 0.12 + 62, w2 - 40, { papel: 'titulo', size: 44 });
    const s1 = Math.min(1.1, (h - 120) / 300);
    B.cartaoVacina(ctx, { x: cx.x + w1 / 2, y: y + 110 + (h - 110) * 0.36, s: s1 * 0.78, marcadas: 3 });
    // a seringa vai de -260 (o êmbolo puxado) a +176 (a agulha) no desenho dela: cabe inteira no quadro, com folga
    const ss = Math.min(s1 * 0.9, (w1 - 80) / 436);
    B.seringa(ctx, { x: cx.x + 40 + 260 * ss + (w1 - 80 - 436 * ss) / 2, y: y + 110 + (h - 110) * 0.8, s: ss });
    B.termometro(ctx, { x: cx.x + w1 + gap + w2 / 2, y: y + h * 0.12 + 90 + (h * 0.76 - 90) / 2, s: Math.min(1, (w2 - 30) / 300), febre: true, rot: -0.5 });
    // o mais: os dois no mesmo atendimento
    const mx = cx.x + w1 + gap / 2, my = y + h / 2;
    E.linha(ctx, [[mx - 26, my], [mx + 26, my]], { lw: 9, seed: 324 });
    E.linha(ctx, [[mx, my - 26], [mx, my + 26]], { lw: 9, seed: 325 });
  };

  // P · o conselho de saúde: oito cadeiras atrás da mesa, os usuários na metade (no destaque) e os outros segmentos
  DS.conselho = (ctx, cx, lam, [kU, kO]) => {
    const B = BB(), n = 8, topo = 150, th = Math.max(60, cx.h * 0.2), yMesa = cx.y + cx.h - th;
    const passo = cx.w / n, s = Math.min(0.56, (yMesa + th * 0.55 - cx.y - topo - 10) / 430, passo / 215);
    const outros = [{ quem: 'medico', roupa: 'jaleco' }, { quem: 'enfermeira' }, { quem: 'agente' }, { quem: 'medica', roupa: 'jaleco' }];
    const usu = [{ quem: 'idosa' }, { quem: 'calouro' }, { quem: 'moradora' }, { quem: 'idoso' }];
    for (let i = 0; i < n; i++) {
      const o = i < 4 ? usu[i] : outros[i - 4];
      B.pessoa(ctx, Object.assign({ x: cx.x + passo * (i + 0.5), y: yMesa + th * 0.55, s, pose: 'stand', look: i < 4 ? 0.3 : -0.3 }, o));
    }
    E.ret(ctx, cx.x - 6, yMesa, cx.w + 12, th, Object.assign({ papel: 'apoioEscuro', r: 10, seed: 330 }, liso));
    // as chaves em cima de cada metade, com o nome
    const yc = cx.y + topo - 26;
    for (const [i0, k, papel] of [[0, kU, 'destaque'], [4, kO, 'tinta']]) {
      const x0 = cx.x + passo * i0 + 14, x1 = cx.x + passo * (i0 + 4) - 14;
      E.linha(ctx, [[x0, yc + 22], [x0, yc], [x1, yc], [x1, yc + 22]], { papel, lw: 6, seed: 331 + i0 });
      P.bloco(ctx, k, { x: x0, y: cx.y - 6, w: x1 - x0, h: topo - 44 }, { papel: 'numero', sizes: [40, 38, 36, 34, 32, 30], lh: 1.06, align: 'center', valign: 'bottom', maxLinhas: 2 });
    }
  };

  // a pegadinha · duas listas, uma em cima da outra: a da Constituição (art. 198, diretrizes) e a da Lei 8.080 (art. 7º,
  // princípios). As fichas D, I e P marcam as três ideias que estão nas duas; as reticências são os incisos de fora
  DS.duasListas = (ctx, cx, lam, [kC, kL, c1, c2, c3, l1, l2, l3, l4]) => {
    const gap = 26, hdr = 66, pad = 16, hDots = 26;
    const listas = [[kC, [[c1, 0], [c2, 1], [c3, 2]]], [kL, [[l1, null], [l2, 1], ['...', null], [l3, 2], [l4, 0], ['...', null]]]];
    const nTxt = 7, nDots = 2;
    const rh = Math.max(50, Math.min(66, (cx.h - gap - 2 * (hdr + pad * 2) - nDots * hDots) / nTxt)), tile = Math.round(rh - 10);
    let y = cx.y;
    listas.forEach(([kh, rows], j) => {
      const h = hdr + pad * 2 + rows.reduce((a, [k]) => a + (k === '...' ? hDots : rh), 0);
      E.ret(ctx, cx.x, y, cx.w, h, Object.assign({ papel: 'superficie', r: 16, seed: 340 + j }, liso));
      P.bloco(ctx, kh, { x: cx.x + pad + 8, y: y + 10, w: cx.w - pad * 2 - 16, h: hdr - 14 }, { papel: 'titulo', sizes: [44, 42, 40, 38, 36, 34], lh: 1.04, valign: 'middle', maxLinhas: 1 });
      E.linha(ctx, [[cx.x + pad, y + hdr], [cx.x + cx.w - pad, y + hdr]], { papel: 'alerta', lw: 4, seed: 342 + j });
      let yy = y + hdr + pad;
      for (const [k, i] of rows) {
        if (k === '...') {
          for (let d = 0; d < 3; d++) E.circulo(ctx, cx.x + pad + 8 + tile / 2 + (d - 1) * 20, yy + hDots / 2, 4.5, Object.assign({ papel: 'tinta', seed: 350 + d }, liso));
          yy += hDots; continue;
        }
        if (i !== null) K.ficha(ctx, letraDa(i), cx.x + pad + 8, yy + (rh - tile) / 2, tile, { seed: 360 + i });
        P.bloco(ctx, k, { x: cx.x + pad + 8 + tile + 20, y: yy + 2, w: cx.w - pad * 2 - 16 - tile - 20, h: rh - 4 }, { papel: 'numero', sizes: [40, 38, 36, 34, 32, 30], lh: 1.06, valign: 'middle', maxLinhas: 1 });
        yy += rh;
      }
      y += h + gap;
    });
  };
})();
