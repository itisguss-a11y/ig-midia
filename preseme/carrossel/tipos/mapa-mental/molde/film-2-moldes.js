// PRESEME · carrossel · tipo MAPA MENTAL · os moldes de lâmina e o kit do tipo (este arquivo é do tipo e não muda de
// peça para peça).
// A espinha: um tema no centro e de 4 a 6 ramos (o que é, como pega, o que se vê, como se confirma, como se trata, como
// se previne...), cada ramo com 2 ou 3 folhas curtas: o resumo que a turma faz para a prova. A capa traz a pergunta e o
// mapa inteiro pequeno (o centro e o nome dos ramos); cada lâmina do meio chega perto de um ramo (o pedaço do centro no
// canto de baixo, o galho até o ramo, o desenho dele e as folhas em cartões), com o mapa em miniatura no canto e o ramo
// da vez aceso; a penúltima é o mapa inteiro grande, com as folhas, para print; a última, o que é da equipe.
// Tudo sai do MAPA do score.js (CENTRO, RAMOS, CAPA, INTEIRO, EQUIPE): a capa, as lâminas de ramo, a miniatura e o mapa
// inteiro vêm da mesma lista, então o mapa inteiro sempre bate com as lâminas.
// Os ramos ficam em volta do centro em sentido horário, a partir de cima à direita: metade (a mais) à direita, de cima
// para baixo, e o resto à esquerda, de baixo para cima. O número de cada ramo diz a ordem de leitura.
// Tipos de lâmina (o score.js monta a ordem sozinho):
//   capa:   [a pergunta], [a frase de baixo] + D rótulo, D centro e os nomes dos ramos · desenho: DESENHO.centro
//   ramo:   [a frase do ramo] + D nome do ramo e as folhas D                           · desenho: DESENHO.ramo[id]
//   mapa:   D rótulo, D fontes e o mapa inteiro (centro, ramos e folhas)                · desenho: DESENHO.centro
//   equipe: até 3 frases do que é da equipe + D rótulo e D fontes (cartão escuro)      · desenho: DESENHO.cena.equipe
//   texto:  [a frase grande], [o detalhe] (lâmina simples, para o que não cabe nos outros)
// Os desenhos vêm da peça, em film-3-desenhos.js: PRESEME.DESENHO.centro(ctx, cx, cy, s), o desenho do tema, centrado em
// cx, cy, em uns 200 × 160 px na escala 1 (fica em cima do círculo do centro, no fundo da lâmina); PRESEME.DESENHO.ramo[id]
// (ctx, cx, cy, s), o desenho do ramo, em uns 300 × 240 px na escala 1; PRESEME.DESENHO.cena.equipe(ctx, caixa), o desenho
// da última lâmina (sem ele, a UBS da biblioteca). Desenho parado.
// Nada de cor escrita à mão: tudo pelo kit de estilos (E) e pela biblioteca (globalThis.BIB). A única dupla fixa é a do
// centro e do ramo aceso: letra Floresta em cima do Marca-texto, que se lê nos seis estilos.
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, TX = globalThis.TEXTOS, SC = globalThis.SCORE, B = globalThis.BIB;
  const DS = P.DESENHO;
  const { L, R, TOP, BOT, W, H } = P;
  const LW = R - L;
  DS.ramo = DS.ramo || {};
  DS.cena = DS.cena || {};
  const MP = SC.MAPA || { CENTRO: {}, RAMOS: [], CAPA: {}, INTEIRO: {}, EQUIPE: {} };
  const RAMOS = MP.RAMOS || [], CEN = MP.CENTRO || {};
  const D = (k) => TX[k] || '';
  // as folhas de um ramo que estão no textos.txt (folha apagada sai do mapa)
  const folhasDe = (r) => (r.folhas || []).filter((k) => TX[k]);
  // a cor que não some no fundo (no chapado o fundo é Sálvia) e a que não some em cima do cartão (a superficie)
  const naoSome = (...ps) => ps.find((p) => E.cor(p) !== E.cor('fundo')) || ps[ps.length - 1];
  const noCartao = (...ps) => ps.find((p) => E.cor(p) !== E.cor('superficie')) || ps[ps.length - 1];
  const liso = { sombra: false, hachura: false };
  const kz = (papel) => E.letra(papel)[2];

  // ---------- o kit do tipo ----------
  // o rótulo da lâmina (uma palavra D): à mão, em cima à esquerda, com o risco embaixo; diminui até caber em maxW
  function rotulo(ctx, k, { cor, maxW = LW } = {}) {
    const y = TOP - 4;
    if (!D(k)) return y + 10;
    const c = cor || (E.escuro() ? 'destaque' : 'texto');
    let z = 48;
    while (z > 34 && E.medir(ctx, D(k), { papel: 'mao', size: z }) > maxW) z -= 2;
    E.texto(ctx, D(k), L + 2, y + 44, { papel: 'mao', size: z, cor: c });
    const w = Math.min(maxW, E.medir(ctx, D(k), { papel: 'mao', size: z }));
    E.linha(ctx, [[L, y + 64], [L + w + 10, y + 61]], { papel: E.escuro() ? 'destaque' : 'alerta', lw: 5, seed: 31 });
    return y + 96;
  }
  // o ✓ (s = escala)
  function marca(ctx, x, y, s = 1, papel = 'marca') {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    E.linha(ctx, [[-30, 2], [-8, 26], [34, -30]], { papel, lw: 13, seed: 51 });
    ctx.restore();
  }
  // o retângulo tracejado (a vaga do desenho no molde)
  function tracejado(ctx, x, y, w, h, seed = 900, papel) {
    E.linha(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]], { lw: 3, tracejado: true, seed, papel: papel || naoSome('apoioEscuro', 'tinta') });
  }
  // a vaga: o desenho que a peça ainda não fez (a moldura tracejada com o X), centrada em cx, cy
  function vaga(ctx, cx, cy, s = 1) {
    const w = 220 * s, h = 180 * s, x = cx - w / 2, y = cy - h / 2;
    tracejado(ctx, x, y, w, h, 901);
    E.linha(ctx, [[x, y], [x + w, y + h]], { lw: 2, seed: 902 });
    E.linha(ctx, [[x + w, y], [x, y + h]], { lw: 2, seed: 903 });
  }
  // a altura do texto k na letra z e na largura w (e se cada linha cabe na largura)
  function alt(ctx, k, papel, z, w, lh = 1.2) {
    const s = D(k);
    if (!s) return { h: 0, cabe: true, n: 0 };
    const ls = P.equilibrar(ctx, s, papel, z, w);
    return { h: (ls.length - 1) * z * kz(papel) * lh + z * kz(papel) * 1.02, cabe: ls.every((l) => P.larg(ctx, l, papel, z) <= w + 0.5), n: ls.length };
  }
  // a maior letra (de sizes) em que todos os textos ks cabem na caixa w × h (para os textos parecidos saírem do mesmo tamanho)
  // umaLinha: primeiro procura a maior letra em que cada texto cabe numa linha só (até minUma); só depois aceita quebrar
  function mesmaLetra(ctx, ks, papel, sizes, w, h, lh = 1.26, { umaLinha = false, minUma = 0 } = {}) {
    if (umaLinha) for (const z of sizes) if (z >= minUma && ks.every((k) => { const a = alt(ctx, k, papel, z, w, lh); return a.cabe && a.n <= 1 && a.h <= h + 0.5; })) return z;
    for (const z of sizes) if (ks.every((k) => { const a = alt(ctx, k, papel, z, w, lh); return a.cabe && a.h <= h + 0.5; })) return z;
    return sizes[sizes.length - 1];
  }
  // o galho: curva de a até b, saindo e chegando na horizontal (os pontos, para o E.linha)
  function galho(a, b, n = 22) {
    const dx = b[0] - a[0], c1 = [a[0] + dx * 0.5, a[1]], c2 = [b[0] - dx * 0.45, b[1]], pts = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, v = 1 - u;
      pts.push([v * v * v * a[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * b[0], v * v * v * a[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * b[1]]);
    }
    return pts;
  }
  // o galho que sobe: curva de a até b, saindo e chegando na vertical (o do centro até o nó, na lâmina de ramo)
  function galhoV(a, b, n = 22) {
    const dy = b[1] - a[1], c1 = [a[0], a[1] + dy * 0.5], c2 = [b[0], b[1] - dy * 0.45], pts = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, v = 1 - u;
      pts.push([v * v * v * a[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * b[0], v * v * v * a[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * b[1]]);
    }
    return pts;
  }
  // onde fica cada ramo: lado (1 direita, -1 esquerda), k (a vaga de cima para baixo, naquele lado) e m (vagas no lado)
  function lados(n) {
    const dir = Math.ceil(n / 2), esq = n - dir, out = [];
    for (let i = 0; i < dir; i++) out.push({ lado: 1, k: i, m: dir });
    for (let i = 0; i < esq; i++) out.push({ lado: -1, k: esq - 1 - i, m: esq });
    return out;
  }
  // a pílula do ramo: o número (a ordem de leitura) e o nome. Acesa: Marca-texto com a letra Floresta
  function pilula(ctx, k, num, x, y, w, h, { aceso = false, z = 30 } = {}) {
    E.ret(ctx, x, y, w, h, { papel: aceso ? 'marca' : 'superficie', r: h / 2, seed: 340 + num });
    const rn = h * 0.33, ncx = x + h * 0.5, ncy = y + h / 2, corL = aceso ? 'floresta' : 'texto';
    E.circulo(ctx, ncx, ncy, rn, Object.assign({ papel: null, tinta: aceso ? 'floresta' : noCartao('apoioEscuro', 'tinta'), lw: 3, seed: 350 + num }, liso));
    const zn = Math.round(rn * 1.2);
    E.texto(ctx, String(num), ncx, ncy + zn * kz('titulo') * 0.36, { papel: 'titulo', size: zn, align: 'center', cor: corL });
    P.bloco(ctx, k, { x: x + h * 0.95, y: y + 6, w: w - h * 0.95 - 16, h: h - 12 }, { papel: 'titulo', sizes: [z], valign: 'middle', cor: corL, lh: 1.02 });
  }
  // o centro: o círculo de Marca-texto com o nome do tema em Floresta
  function centro(ctx, cx, cy, r, sizes = [52, 48, 44, 40, 36, 32, 28]) {
    E.circulo(ctx, cx, cy, r, { papel: 'marca', seed: 310, lw: 5 });
    P.bloco(ctx, CEN.nome, { x: cx - r * 0.85, y: cy - r * 0.62, w: r * 1.7, h: r * 1.24 }, { papel: 'titulo', sizes, align: 'center', valign: 'middle', cor: 'floresta', lh: 1.04 });
  }
  // o mapa na caixa: o centro no meio, os ramos dos dois lados (com as folhas, se o.folhas) e os galhos. o: r (raio do
  // centro), gap (do centro aos ramos), hPill (altura da pílula), sizesNome, sizesFolha, desenhoCentro (o desenho do tema
  // em cima do centro: dCentro é a distância, sCentro a escala), aceso (o ramo da vez). Devolve as posições.
  function mapa(ctx, box, o = {}) {
    const n = RAMOS.length, ld = lados(n);
    const r = o.r || 110, gap = o.gap ?? 30, hP = o.hPill || 60, lhF = 1.14;
    const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
    const colW = (box.w - 2 * r - 2 * gap) / 2, fw = colW - 30;
    const zN = mesmaLetra(ctx, RAMOS.map((x) => x.nome), 'titulo', o.sizesNome || [34, 32, 30, 28, 26, 24, 22], colW - hP * 0.95 - 16, hP - 12, 1.02, { umaLinha: true, minUma: 22 });
    // a letra das folhas: a maior em que todo ramo cabe na vaga dele
    let zF = 0;
    if (o.folhas) {
      for (const z of (o.sizesFolha || [30, 28, 26, 24, 22, 20])) {
        zF = z;
        const ok = ld.every((p, i) => {
          let h = hP + 12, cabe = true;
          folhasDe(RAMOS[i]).forEach((k) => { const a = alt(ctx, k, 'corpo', z, fw, lhF); h += a.h + 10; if (!a.cabe) cabe = false; });
          return cabe && h <= box.h / p.m - 10;
        });
        if (ok) break;
      }
    }
    const blocos = ld.map((p, i) => {
      const slotH = box.h / p.m, sy = box.y + p.k * slotH;
      const fs = o.folhas ? folhasDe(RAMOS[i]) : [];
      const hs = fs.map((k) => alt(ctx, k, 'corpo', zF, fw, lhF).h);
      const h = hP + (fs.length ? 12 + hs.reduce((s, v) => s + v + 10, 0) - 10 : 0);
      const x = p.lado > 0 ? box.x + box.w - colW : box.x;
      return { i, p, x, y: sy + (slotH - h) / 2, w: colW, h, fs, hs };
    });
    // os galhos, por baixo de tudo
    blocos.forEach((b) => {
      const ax = b.p.lado > 0 ? b.x : b.x + b.w, ay = b.y + hP / 2, ang = Math.atan2(ay - cy, ax - cx);
      const aceso = b.i === o.aceso;
      E.linha(ctx, galho([cx + Math.cos(ang) * r * 0.96, cy + Math.sin(ang) * r * 0.96], [ax, ay]), { papel: aceso ? 'alerta' : naoSome('tinta', 'texto'), lw: aceso ? (o.lw || 6) + 3 : o.lw || 6, seed: 300 + b.i });
    });
    if (o.desenhoCentro) {
      const dc = DS.centro || ((c, x, y, s) => vaga(c, x, y, s * 0.8));
      dc(ctx, cx, cy - r - (o.dCentro || 80), o.sCentro || 0.6);
    }
    centro(ctx, cx, cy, r, o.sizesCentro);
    blocos.forEach((b) => {
      pilula(ctx, RAMOS[b.i].nome, b.i + 1, b.x, b.y, b.w, hP, { aceso: b.i === o.aceso, z: zN });
      let y = b.y + hP + 12;
      b.fs.forEach((k, j) => {
        E.circulo(ctx, b.x + 13, y + zF * kz('corpo') * 0.5, 5, Object.assign({ papel: naoSome('tinta', 'texto'), seed: 330 + j }, liso));
        P.bloco(ctx, k, { x: b.x + 28, y, w: fw, h: b.hs[j] + 2 }, { sizes: [zF], lh: lhF });
        y += b.hs[j] + 10;
      });
    });
    return { cx, cy, r, colW, blocos, zN, zF };
  }
  // a miniatura do mapa, no canto de cima à direita (abaixo do contador "2/9" do Instagram): o centro, um galho e um nó
  // por ramo, no mesmo lugar do mapa inteiro. O nó da vez é grande e aceso, os de antes cheios, os de depois claros
  function mini(ctx, cur, x, y, w) {
    const n = Math.max(1, RAMOS.length), h = Math.round(w * 0.7);
    E.ret(ctx, x, y, w, h, Object.assign({ papel: 'superficie', r: 12, seed: 700 }, liso));
    const bx = x + 14, by = y + 12, bw = w - 28, bh = h - 24, cx = bx + bw / 2, cy = by + bh / 2;
    const risco = noCartao('apoioEscuro', 'tinta'), claro = noCartao('apoio', 'apoioEscuro');
    const pos = lados(n).map((p) => ({ x: p.lado > 0 ? bx + bw - 16 : bx + 16, y: by + (p.k + 0.5) * bh / p.m }));
    pos.forEach((p, i) => E.linha(ctx, galho([cx, cy], [p.x, p.y], 10), { papel: i === cur ? 'alerta' : risco, lw: i === cur ? 5 : 2.5, seed: 710 + i }));
    E.circulo(ctx, cx, cy, 17, Object.assign({ papel: 'marca', lw: 2, seed: 705 }, liso));
    pos.forEach((p, i) => {
      if (i === cur) E.circulo(ctx, p.x, p.y, 15, Object.assign({ papel: 'marca', tinta: 'floresta', lw: 3, seed: 720 + i }, liso));
      else E.circulo(ctx, p.x, p.y, 9, Object.assign({ papel: i < cur ? risco : claro, lw: 2, seed: 720 + i }, liso));
    });
    return { x, y, w, h };
  }

  // ---------- os moldes de lâmina ----------
  // capa: o rótulo, a pergunta grande, a frase de baixo e o mapa inteiro pequeno (o desenho do tema, o centro e os nomes
  // dos ramos, sem as folhas); a seta pede o deslize
  P.MOLDE.capa = (ctx, lam) => {
    E.fundo(ctx);
    const C0 = MP.CAPA || {};
    const y0 = rotulo(ctx, C0.rotulo);
    const a = P.titulo(ctx, C0.titulo, { x: L, y: y0 + 4, w: LW, h: 330 }, { sizes: [96, 88, 80, 74, 68, 62, 56], lh: 1.08 });
    const b = TX[C0.sub] ? P.bloco(ctx, C0.sub, { x: L, y: a.y1 + 20, w: LW, h: 130 }, { sizes: [46, 44, 42, 40, 38] }) : a;
    const top = b.y1 + 30, box = { x: L - 10, y: top, w: LW + 20, h: BOT - 24 - top };
    const r = Math.max(70, Math.min(96, box.h * 0.17));
    mapa(ctx, box, { folhas: false, r, gap: 24, hPill: 72, sizesNome: [36, 34, 32, 30, 28, 26, 24], desenhoCentro: true, dCentro: Math.min(96, box.h / 2 - r - 56), sCentro: Math.min(0.8, (box.h / 2 - r - 10) / 190), sizesCentro: [44, 40, 36, 32, 28, 26, 24, 22] });
    E.seta(ctx, [R - 60, H - 52], [W - 22, H - 56], { papel: E.escuro() ? 'destaque' : 'alerta', lw: 9, curva: -0.12, cabeca: 34, seed: 91 });
  };

  // ramo: a miniatura no canto, o nome do ramo (rótulo) e a frase dele; embaixo, a câmera chegou perto: o pedaço do
  // centro no canto de baixo à esquerda, o galho grosso até o nó do ramo (aceso), o desenho do ramo em cima do nó e as
  // folhas em cartões à direita, cada uma no seu raminho
  P.MOLDE.ramo = (ctx, lam) => {
    E.fundo(ctx);
    const j = RAMOS.findIndex((r) => r.id === lam.ramo), rm = RAMOS[j];
    if (!rm) { P.MOLDE.texto(ctx, lam); return; }
    const MW = 230;
    const mt = mini(ctx, j, R - MW, TOP - 8, MW);
    const y0 = rotulo(ctx, rm.nome, { maxW: LW - MW - 40 });
    const yt = Math.max(y0, mt.y + mt.h + 22);
    const a = TX[rm.frase] ? P.titulo(ctx, rm.frase, { x: L, y: yt, w: LW, h: 250 }, { sizes: [64, 60, 56, 52, 48, 44, 40], lh: 1.1 }) : { y1: yt };
    const top = a.y1 + 40;
    // o pedaço do centro (o círculo passa da borda: só a parte de cima aparece) e o nome do tema dentro dele
    const cc = { x: L + 40, y: BOT + 120, r: 300 };
    const colL = 340, nodeW = 400, nodeH = 96, nodeY = cc.y - cc.r - 150;
    E.linha(ctx, galhoV([cc.x + 70, cc.y - Math.sqrt(cc.r * cc.r - 70 * 70) + 6], [L + colL * 0.42, nodeY + nodeH - 4], 12), { papel: 'alerta', lw: 14, seed: 404 });
    E.circulo(ctx, cc.x, cc.y, cc.r, { papel: 'marca', seed: 401, lw: 5 });
    P.bloco(ctx, CEN.nome, { x: L + 6, y: BOT - 68, w: 250, h: 60 }, { papel: 'titulo', sizes: [44, 40, 36, 32, 28], valign: 'middle', cor: 'floresta' });
    // o desenho do ramo, em cima do nó, do tamanho que couber (até 1,35 vez)
    const dTop = top, dH = nodeY - 26 - dTop;
    const fr = DS.ramo[rm.id];
    const sD = Math.max(0.5, Math.min(1.35, colL / 310, dH / 250));
    if (fr) fr(ctx, L + colL / 2, dTop + dH / 2, sD); else vaga(ctx, L + colL / 2, dTop + dH / 2, sD);
    // o nó do ramo, aceso
    const zNo = mesmaLetra(ctx, [rm.nome], 'titulo', [46, 44, 42, 40, 38, 36, 34, 32, 30, 28], nodeW - nodeH * 0.95 - 16, nodeH - 12, 1.02, { umaLinha: true, minUma: 30 });
    pilula(ctx, rm.nome, j + 1, L, nodeY, nodeW, nodeH, { aceso: true, z: zNo });
    // as folhas, em cartões na coluna da direita, cada uma no seu raminho, que sai do nó e abre como um leque
    const fs = folhasDe(rm), x0 = L + 460, cw = R - x0, gapF = 30;
    if (fs.length) {
      const avail = BOT - 10 - top, hMax = Math.min(210, (avail - gapF * (fs.length - 1)) / fs.length - 48);
      const zf = mesmaLetra(ctx, fs, 'corpo', [52, 50, 48, 46, 44, 42, 40, 38, 36, 34, 32], cw - 56, hMax, 1.16);
      const hs = fs.map((k) => alt(ctx, k, 'corpo', zf, cw - 56, 1.16).h + 48);
      const total = hs.reduce((s, v) => s + v, 0) + gapF * (fs.length - 1), pc = nodeY + nodeH / 2;
      // os cartões no meio da coluna (do fim da frase até o pé), sem passar do pé
      let y = Math.min(Math.max(top, top + (avail - total) / 2), BOT - 10 - total);
      fs.forEach((k, i) => {
        E.linha(ctx, galho([L + nodeW - 4, pc], [x0, y + hs[i] / 2], 18), { papel: 'alerta', lw: 6, seed: 360 + i });
        E.ret(ctx, x0, y, cw, hs[i], { papel: 'superficie', r: 22, seed: 370 + i });
        P.bloco(ctx, k, { x: x0 + 28, y: y + 24, w: cw - 56, h: hs[i] - 48 }, { sizes: [zf], lh: 1.16, valign: 'middle' });
        y += hs[i] + gapF;
      });
    }
  };

  // mapa: o mapa inteiro, para print: o rótulo, o desenho do tema, o centro, os ramos com as folhas e as fontes no pé, com o
  // tracejado de recortar (aberto no canto do contador)
  P.MOLDE.mapa = (ctx, lam) => {
    E.fundo(ctx);
    const I = MP.INTEIRO || {};
    const m = 34, C = P.CONTADOR;
    E.linha(ctx, [[W - m, C.h + 24], [W - m, H - m], [m, H - m], [m, m + 6], [C.x - 24, m + 6]], { papel: naoSome('apoio', 'apoioEscuro'), lw: 4, seed: 99, tracejado: true });
    const y0 = rotulo(ctx, I.rotulo);
    const fonteH = D(I.fonte) ? 72 : 0;
    const box = { x: L - 22, y: y0 + 4, w: LW + 44, h: BOT - fonteH - 18 - y0 - 4 };
    mapa(ctx, box, { folhas: true, r: 108, gap: 20, hPill: 56, sizesNome: [30, 28, 26, 24, 22], sizesFolha: [30, 28, 27, 26, 24, 22, 20], desenhoCentro: true, dCentro: 104, sCentro: 0.78, sizesCentro: [44, 40, 36, 32, 28, 26, 24, 22] });
    if (fonteH) P.fonte(ctx, I.fonte, { x: L, y: BOT - fonteH, w: LW, h: fonteH }, { cor: E.escuro() ? 'salvia' : 'apoioEscuro', valign: 'bottom', sizes: [28, 26, 24, 22, 20], maxLinhas: 2 });
  };

  // equipe: o cartão escuro do fim. O que é da equipe na atenção primária (cada frase com o ✓), o desenho embaixo
  // (DESENHO.cena.equipe; sem ele, a UBS da biblioteca) e as fontes no pé
  P.MOLDE.equipe = (ctx, lam) => {
    E.fundo(ctx, { tipo: 'escuro' });
    const F = MP.EQUIPE || {};
    const fr = (F.frases || []).filter((k) => TX[k]);
    let y = rotulo(ctx, F.rotulo, { cor: E.escuro() ? 'destaque' : 'papel' }) + 10;
    const fundoF = BOT - (D(F.fonte) ? 110 : 0), icH = 260;
    const z1 = mesmaLetra(ctx, fr, 'titulo', [60, 56, 52, 48, 44, 40, 36], LW - 88, Math.max(90, (fundoF - y - icH - 20) / Math.max(1, fr.length) - 30), 1.1);
    fr.forEach((k) => {
      marca(ctx, L + 30, y + z1 * 0.62, 0.7, 'marca');
      const b = P.bloco(ctx, k, { x: L + 88, y, w: LW - 88, h: 320 }, { papel: 'titulo', sizes: [z1], lh: 1.1, cor: 'papel', corTrecho: 'marca' });
      y = b.y1 + 34;
    });
    const box = { x: L, y: Math.max(y, fundoF - icH - 10), w: LW, h: Math.max(140, Math.min(icH, fundoF - 10 - Math.max(y, fundoF - icH - 10))) };
    if (DS.cena.equipe) DS.cena.equipe(ctx, box);
    else if (B) B.ubsIcone(ctx, { x: box.x + box.w / 2, y: box.y + box.h / 2, s: 1.3 });
    if (D(F.fonte)) P.fonte(ctx, F.fonte, { x: L, y: BOT - 100, w: LW, h: 100 }, { cor: 'salvia', valign: 'bottom', sizes: [30, 28, 26, 24], maxLinhas: 3 });
  };

  // texto: a lâmina simples (a frase grande e o detalhe), para o que não cabe nos outros
  P.MOLDE.texto = (ctx, lam) => {
    E.fundo(ctx);
    const [a, b] = lam.linhas, [rot] = lam.palavras || [];
    const y0 = rotulo(ctx, rot);
    const t = P.bloco(ctx, a, { x: L, y: y0 + 30, w: LW, h: 420 }, { papel: 'titulo', sizes: [72, 66, 60, 56] });
    if (b) P.bloco(ctx, b, { x: L, y: Math.max(t.y1 + 40, BOT - 200), w: LW, h: 200 }, { valign: 'bottom' });
  };

  // o kit do tipo, para os desenhos da peça (film-3-desenhos.js) usarem
  P.KIT = { rotulo, marca, tracejado, vaga, naoSome, noCartao, mesmaLetra, alt, galho, galhoV, lados, pilula, centro, mapa, mini, liso };
})();
