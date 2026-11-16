// PRESEME · carrossel · mapa mental · desenho 3 · a peça de exemplo: febre do Oropouche.
// O tema (o maruim, que passa o vírus) e um desenho por ramo: o vírus, a picada, a febre, a lupa no sangue, a rede do
// repouso e a janela de tela fina. Tudo pelo kit (E) e pela biblioteca (B); desenho parado; nenhum desenho escreve palavra.
// O maruim (Culicoides paraensis) é desenhado como um mosquitinho corcunda, de asa manchada e perna curta: no papel ele
// fica grande, mas o bicho de verdade é minúsculo. O que desenhar do zero e pode voltar em outra peça (o maruim, o vírus,
// a janela com tela, o tubo de sangue) fica em P.NOVOS, candidato à biblioteca.
(function () {
  const P = globalThis.PRESEME, DS = P.DESENHO, K = P.KIT, E = globalThis.ESTILOS, B = globalThis.BIB;
  const liso = K.liso;
  // o corpo do bicho: Folha no claro; na lousa, o giz (a Folha some no quadro)
  const corpo = () => (E.escuro() ? 'tinta' : K.naoSome('apoioEscuro', 'tinta'));

  // o maruim, de perfil, virado para a esquerda: x, y é o meio do corpo; uns 280 × 190 px na escala 1
  function maruim(ctx, x, y, s = 1, seed = 1200) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s * 1.3, s * 1.3);
    const c = corpo();
    // as pernas, curtas e dobradas (três de cada lado, as de trás mais claras)
    for (let i = 0; i < 3; i++) {
      const px = -26 + i * 26;
      E.linha(ctx, [[px, 14], [px - 14 + i * 4, 44], [px - 26 + i * 8, 62]], { papel: c, lw: 4, seed: seed + i });
    }
    // as asas, por cima das costas, manchadas
    E.poligono(ctx, [[-14, -22], [70, -46], [104, -30], [96, -14], [10, -6]], Object.assign({ papel: K.naoSome('apoio', 'superficie'), lw: 3, seed: seed + 10 }, liso));
    for (const [mx, my, mr] of [[34, -30, 7], [62, -34, 6], [84, -27, 5]]) E.circulo(ctx, mx, my, mr, Object.assign({ papel: c, contorno: false, seed: seed + mx }, liso));
    // o abdômen, o tórax corcunda e a cabeça
    E.circulo(ctx, 40, 6, 44, Object.assign({ papel: c, ry: 22, seed: seed + 20 }, liso));
    E.circulo(ctx, -18, -2, 30, Object.assign({ papel: c, ry: 27, seed: seed + 21 }, liso));
    E.circulo(ctx, -52, 10, 15, Object.assign({ papel: c, seed: seed + 22 }, liso));
    // as antenas e a boca que pica
    E.linha(ctx, [[-60, 2], [-82, -18], [-96, -24]], { papel: c, lw: 3, seed: seed + 30 });
    E.linha(ctx, [[-58, 0], [-76, -26], [-84, -40]], { papel: c, lw: 3, seed: seed + 31 });
    E.linha(ctx, [[-62, 18], [-76, 38]], { papel: c, lw: 4, seed: seed + 32 });
    ctx.restore();
  }
  // o vírus: a bolinha com as espículas; x, y é o centro; uns 180 × 180 px na escala 1
  function virus(ctx, x, y, s = 1, seed = 1300) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
      E.linha(ctx, [[c * 62, sn * 62], [c * 84, sn * 84]], { papel: K.naoSome('tinta', 'texto'), lw: 4, seed: seed + i });
      E.circulo(ctx, c * 90, sn * 90, 9, Object.assign({ papel: 'alerta', seed: seed + 20 + i }, liso));
    }
    E.circulo(ctx, 0, 0, 64, { papel: K.naoSome('apoio', 'apoioEscuro'), seed: seed + 40 });
    for (const [a, r] of [[0.4, 26], [2.4, 30], [4.2, 22]]) E.linha(ctx, [[Math.cos(a) * r - 12, Math.sin(a) * r], [Math.cos(a) * r, Math.sin(a) * r + 10], [Math.cos(a) * r + 12, Math.sin(a) * r]], { papel: 'tinta', lw: 3, seed: seed + 50 + r });
    ctx.restore();
  }
  // o tubo de sangue, em pé; x, y é o centro; uns 50 × 170 px na escala 1
  function tubo(ctx, x, y, s = 1, seed = 1400) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    E.ret(ctx, -22, -70, 44, 150, { papel: 'superficie', r: 20, seed });
    E.ret(ctx, -16, -6, 32, 80, Object.assign({ papel: 'alerta', r: 14, seed: seed + 1 }, liso));
    E.ret(ctx, -27, -92, 54, 30, { papel: 'apoioEscuro', r: 6, seed: seed + 2 });
    ctx.restore();
  }
  // a janela com tela de malha fina; x, y é o centro; uns 250 × 210 px na escala 1
  function janela(ctx, x, y, s = 1, seed = 1500) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    E.ret(ctx, -125, -105, 250, 210, { papel: 'superficie', r: 8, seed });
    E.ret(ctx, -104, -84, 208, 168, { papel: K.noCartao('apoio', 'apoioEscuro'), r: 4, seed: seed + 1 });
    ctx.save(); ctx.beginPath(); ctx.rect(-102, -82, 204, 164); ctx.clip();
    for (let gx = -100; gx <= 100; gx += 11) E.linha(ctx, [[gx, -84], [gx, 84]], { papel: 'tinta', lw: 1.6, seed: seed + 10 + gx });
    for (let gy = -80; gy <= 80; gy += 11) E.linha(ctx, [[-104, gy], [104, gy]], { papel: 'tinta', lw: 1.6, seed: seed + 200 + gy });
    ctx.restore();
    E.linha(ctx, [[0, -84], [0, 84]], { papel: 'tinta', lw: 6, seed: seed + 400 });
    ctx.restore();
  }
  P.NOVOS = { maruim, virus, tubo, janela };

  // o tema: o maruim
  DS.centro = (ctx, cx, cy, s) => maruim(ctx, cx + 10 * s, cy, s);
  // 1 · o que é: o vírus, que o maruim passa
  DS.ramo.oquee = (ctx, cx, cy, s) => {
    virus(ctx, cx - 40 * s, cy - 24 * s, 0.9 * s);
    maruim(ctx, cx + 92 * s, cy + 80 * s, 0.45 * s, 1210);
  };
  // 2 · como pega: o maruim pousado na pele, com a boca na picada (a pele é a faixa curva embaixo)
  DS.ramo.pega = (ctx, cx, cy, s) => {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
    E.poligono(ctx, [[-160, 70], [-80, 58], [0, 54], [80, 58], [160, 70], [160, 120], [-160, 120]], { papel: 'pele', seed: 1601, hachura: false });
    E.circulo(ctx, -58, 58, 9, Object.assign({ papel: 'alerta', seed: 1602 }, liso));
    ctx.restore();
    maruim(ctx, cx + 30 * s, cy - 6 * s, 0.82 * s, 1220);
  };
  // 3 · o que se vê: a febre (o termômetro no Coral) e a dor
  DS.ramo.ve = (ctx, cx, cy, s) => {
    B.termometro(ctx, { x: cx - 10 * s, y: cy + 30 * s, s: 0.95 * s, febre: true, rot: -0.2 });
    B.dor(ctx, { x: cx - 60 * s, y: cy - 50 * s, a: -2.2, tam: 54 * s, seed: 1611 });
    B.dor(ctx, { x: cx + 20 * s, y: cy - 66 * s, a: -1.5, tam: 58 * s, seed: 1612 });
    B.dor(ctx, { x: cx + 100 * s, y: cy - 40 * s, a: -0.8, tam: 54 * s, seed: 1613 });
  };
  // 4 · como se confirma: o tubo de sangue e a lupa que acha o vírus
  DS.ramo.confirma = (ctx, cx, cy, s) => {
    tubo(ctx, cx - 100 * s, cy + 10 * s, 1.05 * s);
    B.lupa(ctx, { x: cx + 40 * s, y: cy - 10 * s, r: 92 * s, cabo: 0.8, dentro: (c) => virus(c, cx + 40 * s, cy - 10 * s, 0.62 * s, 1320) });
  };
  // 5 · como se trata: a rede do repouso
  DS.ramo.trata = (ctx, cx, cy, s) => {
    B.rede(ctx, { x: cx, y: cy - 40 * s, s: s * 0.95, w: 280, sag: 78 });
  };
  // 6 · como se previne: a janela de tela fina e o maruim do lado de fora
  DS.ramo.previne = (ctx, cx, cy, s) => {
    janela(ctx, cx - 20 * s, cy, 0.92 * s);
    maruim(ctx, cx + 118 * s, cy - 78 * s, 0.42 * s, 1230);
  };
  // a última lâmina: a ficha (a notificação) e a UBS
  DS.cena.equipe = (ctx, b) => {
    const cy = b.y + b.h / 2, s = Math.min(1, b.h / 240);
    B.prancheta(ctx, { x: b.x + b.w * 0.3, y: cy, s: 0.95 * s, linhas: 3, vistos: 2, rot: -0.08 });
    E.seta(ctx, [b.x + b.w * 0.42, cy], [b.x + b.w * 0.6, cy], { papel: 'marca', lw: 8, curva: -0.2, cabeca: 28, seed: 1701 });
    B.ubsIcone(ctx, { x: b.x + b.w * 0.74, y: cy + 20 * s, s: 1.25 * s });
  };
})();
