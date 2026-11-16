// PRESEME · motor "Dado que se move" · desenho 2/3 · a peça · exemplo: leishmaniose tegumentar em Roraima
// texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos
// O número, a conta, as barras, a régua e a fonte o molde desenha sozinho, das palavras D do textos.txt. Esta peça preenche:
//   DESTAQUE   o trecho de cada frase que leva o marca-texto
//   PORQUE     [05] duas pessoas lado a lado, a seta entre elas riscada (não passa de pessoa para pessoa) e o mosquito-palha
//              que chega voando; [06] o sol que desce atrás da mata e os mosquitos-palha que aparecem com ele
//   PREVENCAO  [07] três cartões que entram na ordem da frase: a janela com tela, a rede com mosquiteiro e a roupa comprida
// Desenho novo (candidato à biblioteca): o flebotomíneo (mosquito-palha), que a biblioteca ainda não tem (o B.mosquito é o
// Aedes ou o Anopheles). O resto vem da biblioteca (B.pessoa, B.floresta, B.rede, B.tracejado) e do kit.
(function () {
  const U = globalThis.U, E = globalThis.ESTILOS, B = globalThis.BIB;
  const ease = U.ease, clamp = U.clamp, lerp = U.lerp;
  const desde = (st, n) => (st.desde && st.desde[n] != null ? st.desde[n] : -1);
  const p01 = (v, d) => clamp(v / d, 0, 1);
  const CHAO = 1400;

  // ---------- desenho novo (candidato à biblioteca): o flebotomíneo, o mosquito-palha ----------
  // x, y: o meio do corpo; s: o tamanho (1 = uns 160 px de altura, das asas aos pés); t: o tempo (as asas tremem);
  // rot: o giro; espelho: olhando para a esquerda. Miudinho, corcunda, asas peludas em V para cima e pernas compridas.
  function flebotomineo(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 900, s: 1, t: 0, rot: 0, espelho: false, seed: 1500 }, o);
    const seed = o.seed, tremor = Math.sin(o.t * 46) * 0.07;
    const asa = B.naoSome('apoio', 'superficie'), corpo = B.naoSome('apoioEscuro', 'tinta');
    const sem = { sombra: false, hachura: false };
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.rot); ctx.scale(o.espelho ? -o.s : o.s, o.s);
    // as pernas compridas, três pares, finas
    const pernas = [[[10, 8], [36, 44], [50, 104]], [[2, 10], [8, 56], [14, 112]], [[-8, 10], [-32, 52], [-48, 106]]];
    pernas.forEach((p, i) => {
      E.linha(ctx, p, { papel: corpo, lw: 2.6, seed: seed + 10 + i });
      E.linha(ctx, p.map(([x, y]) => [x + 7, y + 2]), { papel: corpo, lw: 2.6, seed: seed + 20 + i });
    });
    // o abdome, comprido e caído para trás
    ctx.save(); ctx.translate(-30, 14); ctx.rotate(0.38);
    E.circulo(ctx, 0, 0, 32, Object.assign({ ry: 10, papel: corpo, lw: 3, seed: seed + 1 }, sem));
    ctx.restore();
    // as asas em V, para cima, com os pelinhos na borda
    for (const sd of [-1, 1]) {
      ctx.save(); ctx.rotate(sd * (0.36 + tremor) - 0.12);
      E.poligono(ctx, [[0, -4], [-15, -48], [-7, -96], [7, -100], [17, -50], [6, -2]], Object.assign({ papel: asa, lw: 2.5, alpha: 0.75, seed: seed + 3 + sd }, sem));
      for (let k = 0; k < 6; k++) {
        const y = -24 - k * 13, x = 15 - Math.abs(k - 3) * 2;
        E.linha(ctx, [[x, y], [x + 7, y - 3]], { papel: corpo, lw: 1.8, seed: seed + 30 + k });
        E.linha(ctx, [[-x + 2, y], [-x - 5, y - 3]], { papel: corpo, lw: 1.8, seed: seed + 40 + k });
      }
      ctx.restore();
    }
    // o tórax corcunda e a cabeça baixa, com as antenas e os palpos
    E.circulo(ctx, 0, 2, 17, Object.assign({ papel: corpo, lw: 3, seed: seed + 5 }, sem));
    E.circulo(ctx, 21, 15, 8, Object.assign({ papel: corpo, lw: 3, seed: seed + 6 }, sem));
    E.linha(ctx, [[25, 10], [42, -6], [56, -4]], { papel: corpo, lw: 2.2, seed: seed + 7 });
    E.linha(ctx, [[26, 13], [46, 2], [60, 8]], { papel: corpo, lw: 2.2, seed: seed + 8 });
    E.linha(ctx, [[27, 19], [36, 30], [33, 40]], { papel: corpo, lw: 2.4, seed: seed + 9 });
    ctx.restore();
  }

  // ---------- [05] quem passa é o mosquito-palha, não outra pessoa ----------
  function naoPassa(ctx, st, M, d) {
    E.chao(ctx, CHAO);
    const ent = ease.outCubic(p01(d, 0.45));
    B.pessoa(ctx, { quem: 'moradora', pose: 'stand', x: lerp(150, 290, ent), y: CHAO, s: 1.12, look: 0.6 });
    B.pessoa(ctx, { quem: 'calouro', pose: 'stand', x: lerp(930, 790, ent), y: CHAO, s: 1.12, look: -0.6 });
    // a seta de uma para a outra, tracejada, e o X por cima
    B.tracejado(ctx, { de: [400, 1090], ate: [680, 1090], k: p01(d - 0.3, 0.5), papel: 'tinta', lw: 7 });
    const kx = p01(d - 0.85, 0.3);
    if (kx > 0) {
      E.linha(ctx, [[505, 1040], [585, 1140]], { papel: 'alerta', lw: 13, k: clamp(kx * 2, 0, 1), seed: 1601 });
      E.linha(ctx, [[585, 1040], [505, 1140]], { papel: 'alerta', lw: 13, k: clamp(kx * 2 - 1, 0, 1), seed: 1602 });
    }
    // o mosquito-palha chega voando pela direita, em curva, e para perto da cabeça dela, com o rastro pontilhado
    const v = ease.inOutCubic(p01(d - 1.25, 1.2));
    if (v > 0) {
      const de = [1040, 660], meio = [780, 600], ate = [470, 830];
      const pt = (u) => [(1 - u) * (1 - u) * de[0] + 2 * (1 - u) * u * meio[0] + u * u * ate[0], (1 - u) * (1 - u) * de[1] + 2 * (1 - u) * u * meio[1] + u * u * ate[1]];
      for (let k = 1; k < 14; k++) {
        const u = (k / 14) * v; if (u > v - 0.04) break;
        const [x, y] = pt(u);
        E.circulo(ctx, x, y, 4, { papel: 'tinta', seed: 1610 + k, sombra: false, hachura: false, lw: 1 });
      }
      const [x, y] = pt(v), paira = v >= 1 ? Math.sin(st.t * 5) * 8 : 0;
      flebotomineo(ctx, { x, y: y + paira, s: 1.25, t: st.t, espelho: true, rot: v >= 1 ? 0.05 : -0.15 });
      if (v >= 1) M.escrever(ctx, M.D('D16'), x + 115, y - 25, { size: 50, papel: 'mao', alpha: p01(d - 2.45, 0.3) });
    }
  }

  // ---------- [06] ele pica mais do pôr do sol ao anoitecer ----------
  function porDoSol(ctx, st, M, d) {
    const u = ease.inOutQuad(p01(d, 4.6));
    // o sol desce e some atrás da mata
    const ys = lerp(760, 1200, u);
    E.circulo(ctx, 700, ys, 118, { papel: 'destaque', seed: 1650, sombra: false, hachura: false, lw: 0, alpha: 0.55 });
    E.circulo(ctx, 700, ys, 88, { papel: 'alerta', seed: 1651, sombra: false, hachura: false });
    B.floresta(ctx, { fundo: false, rio: false, t: st.t, chao: CHAO });
    // os mosquitos-palha aparecem, um depois do outro, enquanto o sol desce
    const n = Math.floor(1 + 6 * p01(d - 0.5, 3.4));
    const pos = [[420, 1010], [600, 930], [800, 1040], [330, 900], [520, 1100], [880, 900], [700, 1110]];
    for (let i = 0; i < n; i++) {
      const [x0, y0] = pos[i], a = st.t * (1.3 + 0.2 * i) + i * 1.7;
      flebotomineo(ctx, { x: x0 + Math.sin(a) * 26, y: y0 + Math.cos(a * 1.3) * 16, s: 0.5, t: st.t + i, espelho: i % 2 === 0, seed: 1700 + i * 50 });
    }
  }

  globalThis.PECA = {
    DESTAQUE: { 2: '43 pegaram aqui', 4: 'quase 7 vezes', 5: 'mosquito-palha', 6: 'pôr do sol', 8: 'no SUS' },
    PORQUE(ctx, st, M) {
      const d6 = desde(st, 6);
      if (d6 >= 0) porDoSol(ctx, st, M, d6); else naoPassa(ctx, st, M, desde(st, 5));
    },
    // ---------- [07] tela na janela, mosquiteiro e roupa comprida: três cartões, na ordem da frase ----------
    PREVENCAO(ctx, st, M) {
      const d = desde(st, 7), w = 282, gap = 17, y = 700, h = 520;
      for (let i = 0; i < 3; i++) {
        const x = M.L + i * (w + gap), cx = x + w / 2, z = ease.outBack(p01(d - 0.1 - i * 0.55, 0.35));
        if (z <= 0) continue;
        ctx.save(); ctx.translate(cx, y + h / 2); ctx.scale(z, z); ctx.translate(-cx, -(y + h / 2));
        E.ret(ctx, x, y, w, h, { papel: 'superficie', r: 24, seed: 1800 + i });
        if (i === 0) { // a janela com a tela: a grade se desenha, e o mosquito-palha bate do lado de fora
          const jx = x + 46, jy = y + 90, jw = w - 92, jh = 270, kg = p01(d - 0.3, 0.6);
          E.ret(ctx, jx, jy, jw, jh, { papel: B.naoSome('apoio', 'superficie'), r: 6, seed: 1810, lw: 5, sombra: false, hachura: false });
          ctx.save(); ctx.globalAlpha *= 0.7;
          for (let k = 1; k < 9; k++) {
            const gx = jx + (jw * k) / 9, gy = jy + (jh * k) / 9;
            E.linha(ctx, [[gx, jy + 4], [gx, jy + 4 + (jh - 8) * kg]], { papel: 'tinta', lw: 2, seed: 1820 + k });
            E.linha(ctx, [[jx + 4, gy], [jx + 4 + (jw - 8) * kg, gy]], { papel: 'tinta', lw: 2, seed: 1830 + k });
          }
          ctx.restore();
          E.ret(ctx, jx - 10, jy + jh, jw + 20, 16, { papel: 'tinta', r: 4, seed: 1840, sombra: false, hachura: false });
          const bate = Math.abs(Math.sin(st.t * 4)) * 14;
          flebotomineo(ctx, { x: jx + jw - 24 + bate, y: jy + 64, s: 0.42, t: st.t, espelho: true, seed: 1850 });
        }
        if (i === 1) { // a rede com o mosquiteiro por cima
          B.rede(ctx, { x: cx, y: y + 330, w: 200, sag: 52, t: st.t });
          const topo = [cx, y + 70], esq = [x + 34, y + 420], dir = [x + w - 34, y + 420];
          E.poligono(ctx, [topo, esq, dir], { papel: B.naoSome('apoio', 'superficie'), alpha: 0.35, lw: 3, seed: 1860, sombra: false, hachura: false });
          ctx.save(); ctx.globalAlpha *= 0.45;
          for (let k = 1; k < 8; k++) E.linha(ctx, [topo, [lerp(esq[0], dir[0], k / 8), esq[1]]], { papel: 'tinta', lw: 1.6, seed: 1870 + k });
          ctx.restore();
          E.circulo(ctx, topo[0], topo[1] - 8, 9, { papel: 'tinta', seed: 1880, sombra: false, hachura: false });
        }
        if (i === 2) B.pessoa(ctx, { quem: 'moradora', pose: 'stand', roupa: 'moletom', calca: 'calca', x: cx, y: y + 480, s: 0.92, look: -0.3 });
        const rot = M.D(['D17', 'D18', 'D19'][i]); let zs = 46; while (zs > 32 && M.wid(ctx, rot, zs, 'mao') > w - 16) zs -= 2;
        M.escrever(ctx, rot, cx, y + h + 70, { size: zs, papel: 'mao', align: 'center' });
        ctx.restore();
      }
    },
    PLANOS: {},
  };
})();
