// PRESEME · motor "Mito ou verdade" · desenho 2/3 · a peça: três frases sobre pressão (EXEMPLO)
// texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos
// A peça preenche: DESTAQUE (o trecho de cada frase que leva o destaque), FALANTE (quem repete as frases),
// RESUMO (as palavras D que resumem cada frase no fecho) e PORQUE[1], [2] e [3] (o desenho que mostra o porquê funcionando).
// Cada PORQUE recebe (ctx, st, M): st.desde[n] = segundos desde que a frase n entrou (negativo antes dela);
// M = as funções do molde (M.escrever, M.p01, M.area...). Área do desenho: x de 60 a 940, y de 400 a 1170.
// Todo desenho é função do tempo (sem Math.random) e usa o kit (globalThis.ESTILOS), para sair em qualquer estilo.
(function () {
  const U = globalThis.U, G = globalThis.G, E = globalThis.ESTILOS, TX = globalThis.TEXTOS;
  const D = (k) => TX[k] || '';
  const ease = U.ease;
  const desde = (st, n) => (st.desde && st.desde[n] != null ? st.desde[n] : -1);

  // ---------- 1 · "12 por 8 é a pressão normal." (MITO): o aparelho e a régua da máxima ----------
  // o aparelho de braço: a tela mostra 120 em cima (máxima) e 80 embaixo (mínima), os números sobem quando ele mede
  function aparelho(ctx, M, u) {
    const cx = M.CX, x = cx - 260, y = 410, w = 520, h = 390;
    E.ret(ctx, x, y, w, h, { papel: 'superficie', r: 44, seed: 101 });
    E.ret(ctx, x + 38, y + 34, w - 76, 250, { papel: 'apoio', r: 20, seed: 102, sombra: false });
    const k = ease.outCubic(U.clamp(u / 0.9, 0, 1));
    const a = String(Math.round(120 * k)), b = String(Math.round(80 * k));
    const xr = x + w - 72;
    M.escrever(ctx, a, xr, y + 150, { size: 110, papel: 'numero', align: 'right' });
    M.escrever(ctx, b, xr, y + 252, { size: 86, papel: 'numero', align: 'right' });
    M.escrever(ctx, D('D05'), x + 72, y + 138, { size: 46, papel: 'mao' });
    M.escrever(ctx, D('D06'), x + 72, y + 242, { size: 46, papel: 'mao' });
    E.circulo(ctx, cx, y + 336, 28, { papel: 'tinta', seed: 104, sombra: false, hachura: false });
  }
  // a régua da máxima, de 110 a 160: abaixo de 120 sem nome; de 120 a 139, pré-hipertensão; de 140 para cima, hipertensão
  function regua(ctx, M, k, ponteiro, marca = 0) {
    const x0 = M.L + 30, x1 = M.R - 30, y = 1000, h = 74, X = (v) => x0 + ((v - 110) / 50) * (x1 - x0);
    const corte = x0 + (x1 - x0) * ease.inOutCubic(k);
    ctx.save(); ctx.beginPath(); ctx.rect(x0 - 30, y - 200, corte - x0 + 60, h + 330); ctx.clip();
    E.ret(ctx, x0, y, X(120) - x0, h, { papel: 'superficie', r: 10, seed: 111 });
    E.ret(ctx, X(120), y, X(140) - X(120), h, { papel: 'destaque', r: 10, seed: 112 });
    E.ret(ctx, X(140), y, x1 - X(140), h, { papel: 'alerta', r: 10, seed: 113 });
    M.escrever(ctx, D('D07'), (X(120) + X(140)) / 2, y - 26, { size: 38, papel: 'mao', align: 'center' });
    M.escrever(ctx, D('D08'), (X(140) + x1) / 2, y - 26, { size: 38, papel: 'mao', align: 'center' });
    for (const v of [120, 140]) {
      E.linha(ctx, [[X(v), y + h + 6], [X(v), y + h + 30]], { lw: 5, seed: 114 + v });
      if (v === 120 && marca > 0) { const w = M.wid(ctx, '120', 42, 'numero'); E.destaque(ctx, X(v) - w / 2, y + h + 80, w, 42 * E.letra('numero')[2], { k: marca, seed: 118 }); }
      M.escrever(ctx, String(v), X(v), y + h + 80, { size: 42, papel: 'numero', align: 'center' });
    }
    ctx.restore();
    if (ponteiro > 0) { // o ponteiro desce em 110 e anda até 120: cai na faixa da pré-hipertensão
      const px = U.lerp(X(110) + 30, X(120), ease.outBack(U.clamp((ponteiro - 0.25) / 0.75, 0, 1))), py = y - 70 + 30 * (1 - ease.outCubic(Math.min(1, ponteiro * 4)));
      E.poligono(ctx, [[px - 26, py - 40], [px + 26, py - 40], [px, py]], { papel: 'tinta', seed: 117, sombra: false });
    }
  }

  // ---------- 2 · "Deu 14 por 9 na farmácia, então é hipertensão." (DEPENDE): três medidas e duas ocasiões ----------
  // a folha de uma ocasião: as medidas 1, 2 e 3 com 1 minuto entre elas; a primeira não conta; a média das duas últimas vale
  function ocasiao(ctx, M, x, y, rotulo, tempo, { fixo = false, tag = 0, certo = 0 } = {}) {
    const w = 390, h = 520;
    E.ret(ctx, x, y, w, h, { papel: 'superficie', r: 26, seed: 121 + x });
    E.ret(ctx, x, y, w, 86, { papel: 'tinta', r: 26, seed: 122 + x, sombra: false });
    M.escrever(ctx, rotulo, x + w / 2, y + 60, { size: 44, papel: 'mao', align: 'center', cor: 'superficie' });
    const cy = y + 200, xs = [x + 70, x + w / 2, x + w - 70];
    const pop = (i) => (fixo ? 1 : ease.outBack(U.clamp((tempo - 0.3 - 0.5 * i) / 0.3, 0, 1)));
    xs.forEach((cx, i) => {
      const z = pop(i);
      if (z <= 0) return;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(z, z);
      E.circulo(ctx, 0, 0, 46, { papel: 'apoio', seed: 123 + i });
      M.escrever(ctx, String(i + 1), 0, 16, { size: 50, papel: 'numero', align: 'center' });
      ctx.restore();
      if (i < 2 && (fixo || tempo > 0.55 + 0.5 * i)) M.escrever(ctx, '1 min', (cx + xs[i + 1]) / 2, cy - 66, { size: 36, papel: 'mao', align: 'center' });
    });
    const risca = fixo ? 1 : U.clamp((tempo - 2.4) / 0.3, 0, 1); // a primeira medida não conta
    if (risca > 0) E.linha(ctx, [[xs[0] - 48, cy + 44], [xs[0] + 48, cy - 44]], { papel: 'alerta', lw: 10, k: risca, seed: 126 });
    const chave = fixo ? 1 : U.clamp((tempo - 3.1) / 0.4, 0, 1); // a chave embaixo da 2 e da 3: a média
    if (chave > 0) {
      E.linha(ctx, [[xs[1] - 40, cy + 74], [xs[1] - 40, cy + 98], [xs[2] + 40, cy + 98], [xs[2] + 40, cy + 74]], { lw: 6, k: chave, seed: 127 });
      if (chave >= 1) {
        E.ret(ctx, (xs[1] + xs[2]) / 2 - 100, cy + 124, 200, 76, { papel: 'destaque', r: 38, seed: 128 });
        M.escrever(ctx, D('D11'), (xs[1] + xs[2]) / 2, cy + 176, { size: 44, papel: 'mao', align: 'center' });
      }
    }
    if (tag > 0) { // o que esta ocasião tem de mostrar para contar
      ctx.save(); ctx.globalAlpha *= Math.min(1, tag * 2);
      M.escrever(ctx, D('D12'), x + w / 2 - 34, y + h - 52, { size: 44, papel: 'numero', align: 'center' });
      ctx.restore();
    }
    if (certo > 0) { // o visto
      const vx = x + w - 50, vy = y + h - 66;
      E.circulo(ctx, vx, vy, 36 * ease.outBack(Math.min(1, certo)), { papel: 'folha', seed: 129, sombra: false });
      if (certo >= 1) E.linha(ctx, [[vx - 16, vy], [vx - 4, vy + 14], [vx + 18, vy - 14]], { papel: 'superficie', lw: 7, seed: 130 });
    }
  }

  // ---------- 3 · "Subiu? Põe um remédio debaixo da língua para baixar na hora." (MITO) ----------
  // o gráfico da pressão no tempo: devagar, em 24 a 48 h (certo); na hora, despenca (errado); e os sinais que pedem pressa
  function grafico(ctx, M, st, a) {
    const t13 = desde(st, 13), t14 = desde(st, 14), t15 = desde(st, 15);
    const perto = t14 >= 0 && t15 < 0; // em [14] o plano fecha na queda: o lado direito do gráfico (fim da curva, "tempo") fica fora e não se desenha
    const x0 = M.L + 70, x1 = M.R - 40, yTopo = 430, yChao = 880;
    ctx.save(); ctx.globalAlpha *= a;
    E.linha(ctx, [[x0, yTopo], [x0, yChao], [x1, yChao]], { lw: 6, seed: 141 });
    M.escrever(ctx, 'pressão', x0 + 18, yTopo + 10, { size: 42, papel: 'mao' });
    if (!perto) M.escrever(ctx, 'tempo', x1, yChao + 56, { size: 42, papel: 'mao', align: 'right' });
    const P0 = [x0 + 40, yTopo + 70];
    // o certo: desce devagar até 24 a 48 h
    const curva = []; for (let i = 0; i <= 30; i++) { const u = i / 30; curva.push([U.lerp(P0[0], x1 - 60, u), P0[1] + (yChao - 170 - P0[1]) * (1 - Math.pow(1 - u, 1.8))]); }
    const kc = U.clamp((t13 - 0.4) / 1.8, 0, 1), kce = ease.inOutCubic(kc);
    if (kce > 0) { // a área embaixo da curva, cheia e clara: o gráfico lê melhor e o corte de plano aparece
      const m = Math.max(1, Math.round(kce * (curva.length - 1)));
      E.poligono(ctx, curva.slice(0, m + 1).concat([[curva[m][0], yChao], [P0[0], yChao]]), { papel: 'folha', alpha: 0.22, contorno: false, hachura: false, sombra: false, seed: 152 });
    }
    E.linha(ctx, curva, { papel: 'folha', lw: 10, k: kce, seed: 142 });
    if (kc >= 1 && !perto) {
      const [ex, ey] = curva[curva.length - 1];
      E.circulo(ctx, ex, ey, 30, { papel: 'folha', seed: 143, sombra: false });
      E.linha(ctx, [[ex - 13, ey], [ex - 3, ey + 12], [ex + 15, ey - 12]], { papel: 'superficie', lw: 6, seed: 144 });
      M.escrever(ctx, D('D13'), ex, ey - 54, { size: 44, papel: 'numero', align: 'right' });
    }
    // o errado: na hora, a pressão despenca e passa do chão
    const kq = U.clamp((t13 - 3.2) / 0.45, 0, 1);
    if (kq > 0) {
      const queda = [P0, [P0[0] + 34, P0[1] + 60], [P0[0] + 52, yChao + 50]];
      E.linha(ctx, queda, { papel: 'alerta', lw: 10, k: ease.inCubic(kq), seed: 145, tracejado: true });
      if (kq >= 1) M.escrever(ctx, D('D14'), P0[0] + 92, yChao - 24, { size: 44, papel: 'mao' });
    }
    // o comprimido debaixo da língua, riscado: no meio da queda (é ele que faz a pressão despencar)
    const kp = ease.outBack(U.clamp((t14 - 0.3) / 0.35, 0, 1));
    if (kp > 0) {
      const px = P0[0] + 44, py = (P0[1] + yChao) / 2 + 40;
      ctx.save(); ctx.translate(px, py); ctx.rotate(-0.4); ctx.scale(kp, kp);
      E.ret(ctx, -70, -30, 140, 60, { papel: 'superficie', r: 30, seed: 148 });
      E.ret(ctx, 0, -30, 70, 60, { papel: 'alerta', r: 30, seed: 149, sombra: false });
      ctx.restore();
      const kx = U.clamp((t14 - 1.0) / 0.25, 0, 1);
      if (kx > 0) {
        E.linha(ctx, [[px - 90, py - 70], [px + 90, py + 70]], { papel: 'alerta', lw: 11, k: kx, seed: 150 });
        E.linha(ctx, [[px + 90, py - 70], [px - 90, py + 70]], { papel: 'alerta', lw: 11, k: kx, seed: 151 });
      }
    }
    ctx.restore();
  }
  // os sinais que pedem pressa: dor no peito, falta de ar, fraqueza ou dormência de repente; e o 192
  function coracao(ctx, x, y, s, seed) {
    const pts = []; for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI * 2; pts.push([x + s * 16 * Math.pow(Math.sin(a), 3) / 16, y - s * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 16]); }
    E.poligono(ctx, pts, { papel: 'alerta', seed });
  }
  function pulmoes(ctx, x, y, s, seed) {
    E.circulo(ctx, x - s * 0.42, y, s * 0.38, { papel: 'apoioEscuro', ry: s * 0.6, seed });
    E.circulo(ctx, x + s * 0.42, y, s * 0.38, { papel: 'apoioEscuro', ry: s * 0.6, seed: seed + 1 });
    E.linha(ctx, [[x, y - s * 0.8], [x, y - s * 0.2], [x - s * 0.3, y + s * 0.05]], { lw: 6, seed: seed + 2 });
    E.linha(ctx, [[x, y - s * 0.2], [x + s * 0.3, y + s * 0.05]], { lw: 6, seed: seed + 3 });
  }
  function raio(ctx, x, y, s, seed) {
    E.poligono(ctx, [[x + s * 0.15, y - s * 0.8], [x - s * 0.45, y + s * 0.1], [x - s * 0.02, y + s * 0.1], [x - s * 0.2, y + s * 0.8], [x + s * 0.45, y - s * 0.15], [x + s * 0.02, y - s * 0.15]], { papel: 'alerta', seed });
  }
  function sinais(ctx, M, st) {
    const t15 = desde(st, 15);
    if (t15 < 0) return;
    const y = 990, xs = [M.L + 110, M.L + 330, M.L + 550, M.R - 110];
    const icones = [[coracao, 'D15'], [pulmoes, 'D16'], [raio, 'D17']];
    icones.forEach(([f, rot], i) => {
      const z = ease.outBack(U.clamp((t15 - 0.3 - 0.7 * i) / 0.3, 0, 1));
      if (z <= 0) return;
      ctx.save(); ctx.translate(xs[i], y); ctx.scale(z, z); f(ctx, 0, 0, 62, 160 + i * 5); ctx.restore();
      if (z >= 1) {
        const { size, ls } = M.caber(ctx, rot, { sizes: [42, 40, 36], maxLinhas: [2, 2, 3], maxW: 212, papel: 'mao', texto: D(rot) });
        M.desenhar(ctx, rot, ls, size, { cx: xs[i], y0: y + 104, papel: 'mao' });
      }
    });
    const z = ease.outBack(U.clamp((t15 - 3.0) / 0.35, 0, 1)); // o 192
    if (z > 0) {
      ctx.save(); ctx.translate(xs[3], y); ctx.scale(z, z);
      E.ret(ctx, -78, -96, 156, 192, { papel: 'destaque', r: 28, seed: 170 });
      M.escrever(ctx, D('D18'), 0, 22, { size: 64, papel: 'numero', align: 'center' });
      ctx.restore();
    }
  }

  globalThis.PECA = {
    DESTAQUE: { 1: 'Duas são mito.', 5: 'pré-hipertensão', 6: 'pré-hipertensão', 9: 'média das duas últimas', 10: 'duas ocasiões diferentes', 13: '24 a 48 horas', 15: 'aí é 192', 16: 'baixar sem pressa' },
    FALANTE: { quem: 'moradora', style: { hair: '#B9B2A6', glasses: 'round' } },
    RESUMO: ['D02', 'D03', 'D04'],
    // o plano de cada frase do porquê (corte seco no começo dela): [04] o aparelho de perto; [06] a régua de perto, com o
    // ponteiro no 120; [09] a primeira folha de medida; [14] a queda com o remédio riscado. As outras: o desenho inteiro.
    PLANOS: { 4: { x: 500, y: 605, z: 1.3 }, 6: { x: 538, y: 1062, z: 1.3 }, 9: { x: 275, y: 690, z: 1.25 }, 14: { x: 300, y: 690, z: 1.35 } },
    PORQUE: {
      1(ctx, st, M) {
        const t4 = desde(st, 4), t5 = desde(st, 5), t6 = desde(st, 6);
        // em [06] o plano fecha na régua: o aparelho fica fora do quadro (e não aparece como um pedaço na borda)
        if (t6 < 0) aparelho(ctx, M, Math.max(0, t4 - 0.3));
        if (t5 >= 0) regua(ctx, M, U.clamp((t5 - 0.2) / 1.2, 0, 1), t6 >= 0 ? U.clamp(t6 / 0.9, 0, 1) : 0, t6 >= 0 ? ease.inOutCubic(U.clamp((t6 - 0.9) / 0.4, 0, 1)) : 0);
      },
      2(ctx, st, M) {
        const t9 = desde(st, 9), t10 = desde(st, 10);
        const segunda = t10 >= 0;
        ocasiao(ctx, M, M.L + 20, 430, D('D09'), t9, { fixo: segunda, tag: segunda ? U.clamp((t10 - 1.0) / 0.3, 0, 1) : 0, certo: segunda ? U.clamp((t10 - 2.0) / 0.3, 0, 1) : 0 });
        if (segunda) {
          const entra = ease.outCubic(U.clamp((t10 - 0.1) / 0.45, 0, 1));
          ctx.save(); ctx.translate((1 - entra) * 520, 0);
          ocasiao(ctx, M, M.R - 410, 430, D('D10'), 99, { fixo: true, tag: U.clamp((t10 - 1.0) / 0.3, 0, 1), certo: U.clamp((t10 - 2.3) / 0.3, 0, 1) });
          ctx.restore();
        }
      },
      3(ctx, st, M) {
        const t15 = desde(st, 15);
        // quando entram os sinais, o gráfico sobe e encolhe para dar lugar a eles
        const sobe = t15 >= 0 ? 1 : 0; // corte seco: o gráfico já entra menor, e os sinais vêm um a um
        ctx.save(); ctx.translate(M.CX, 420); ctx.scale(1 - 0.2 * sobe, 1 - 0.2 * sobe); ctx.translate(-M.CX, -420);
        grafico(ctx, M, st, 1);
        ctx.restore();
        sinais(ctx, M, st);
      },
    },
  };
})();
