// PRESEME · carrossel · tipo MEME EM IMAGEM · os moldes de lâmina e o que o meme tem de próprio: o painel (o quadro do
// quadrinho), a câmera que enquadra o palco da peça, a legenda do narrador, os balões (fala, pensamento e grito), os raios
// da virada, os rótulos de dentro da cena e a lição (a faixa de baixo no quadrinho, o cartão da última lâmina na sequência).
// Este arquivo é do tipo e não muda de peça para peça. O desenho vem da peça, em film-2-desenhos.js:
//   PRESEME.DESENHO.palco[nome](ctx, info): desenha a cena num palco do tamanho da lâmina (1080 × 1350, chão em 984, onde
//     os lugares da biblioteca já desenham) e devolve { cabecas: { quem: MEME.cabeca({ x, y, s, pose }) } }, o ponto de
//     cada pessoa que fala ou pensa (o rabinho do balão vai até ele). info.rotulo(k, x, y, op) põe uma palavra D dentro da
//     cena (a folha da prova, a placa) no tamanho de verdade, sem encolher com a câmera; op: papel ('mao'), size, align,
//     cor, rot, w (a largura máxima, no palco) e caixa (true: numa plaquinha clara, que se lê em cima de qualquer desenho).
//   PRESEME.DESENHO.paineis[id] = { palco: 'nome', camera: [x, y, w, h], cheio: false, raios: false, foco: [x, y] }:
//     camera é o pedaço do palco que o painel mostra (o mesmo palco com outra câmera dá o close da reação). Ele cabe
//     inteiro no painel, encostado embaixo e no meio, e os textos ficam por cima, no alto; se a cabeça de alguém ficaria
//     embaixo de um texto, a câmera se afasta sozinha até a cabeça aparecer (cheio: true enche o painel, cortando as
//     sobras, sem esse cuidado). raios: true pinta os raios da virada atrás da cena (o palco recebe info.fundo false e
//     não pinta o fundo), centrados em foco (no palco).
//   PRESEME.DESENHO.licao(ctx, caixa): desenho opcional no cartão da lição (só na sequência).
// Arranjos (ARRANJO, no score.js): 'quadrinho' (os painéis numa lâmina só, em grade, e a lição na faixa de baixo: post de
// uma imagem) e 'laminas' (um painel por lâmina, e a lição no cartão da última). Desenho parado.
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, TX = globalThis.TEXTOS, SC = globalThis.SCORE, G = globalThis.G;
  const DS = P.DESENHO;
  const { W, H } = P;
  DS.palco = DS.palco || {};
  DS.paineis = DS.paineis || {};
  const NB = ' ';
  const n2 = (n) => String(n).padStart(2, '0');
  const QUAD = SC.ARRANJO !== 'laminas';
  // as medidas: os painéis vão de x 64 a 1016 (a área segura do motor começa em 54) e começam em y 128, abaixo do
  // contador "1/8" do Instagram; a última coisa termina em y 1286
  const X0 = 64, X1 = W - 64, Y0 = 128, Y1 = H - 64, GUT = 22, PAD = 18;
  // os tamanhos de letra, por jeito de texto e por arranjo, do maior para o menor (todos os textos do mesmo jeito numa
  // lâmina saem no mesmo tamanho: o maior em que todos cabem)
  const TAM = QUAD
    ? { legenda: [42, 40, 38, 36, 34, 32, 30, 28], fala: [46, 44, 42, 40, 38, 36, 34, 32, 30], pensa: [44, 42, 40, 38, 36, 34, 32, 30], grito: [60, 56, 52, 48, 44, 40, 36] }
    : { legenda: [54, 52, 50, 48, 46, 44], fala: [62, 58, 54, 52, 50, 48], pensa: [58, 54, 52, 50, 48], grito: [84, 78, 72, 66, 60, 56] };
  const MAXL = QUAD ? 4 : 5; // linhas por texto de painel
  const PAPEL = { legenda: 'corpo', fala: 'mao', pensa: 'mao', grito: 'titulo' };
  const LH = { legenda: 1.18, fala: 1.1, pensa: 1.1, grito: 1.04 };
  const PADX = { legenda: 24, fala: 34, pensa: 40, grito: 56 }, PADY = { legenda: 16, fala: 22, pensa: 26, grito: 46 };
  const RABO = 46; // espaço embaixo de um balão para o rabinho
  const MEME = (P.MEME = {});
  // a tela pequena e invisível onde o palco roda uma vez antes, só para dizer onde ficam as cabeças (o qa do motor só lê
  // texto de tela com o formato do quadro; esta é quadrada)
  let SECO = null;
  const seco = () => { if (!SECO) { const c = document.createElement('canvas'); c.width = 16; c.height = 16; SECO = c.getContext('2d'); } SECO.setTransform(1, 0, 0, 1, 0, 0); return SECO; };

  // o ponto da cabeça de uma pessoa da biblioteca (B.pessoa), no palco: o centro e o topo (o rabinho para acima dele)
  MEME.cabeca = ({ x, y, s = 1, pose = 'stand' }) => {
    const cy = y - (pose === 'sit' ? 254 : 404) * s;
    return { centro: [x, cy], topo: [x, cy - 112 * s], s };
  };

  // ---------- os textos ----------
  function linhas(ctx, k, papel, z, maxW) {
    const s = TX[k] || '', tr = P.DESTAQUE[k];
    const s1 = tr && s.includes(tr) ? s.replace(tr, tr.split(' ').join(NB)) : s;
    return P.equilibrar(ctx, s1, papel, z, maxW);
  }
  const larg = (ctx, l, papel, z) => P.larg(ctx, l.split(NB).join(' '), papel, z);
  const alturaDe = (n, z, papel, lh) => (n - 1) * z * E.letra(papel)[2] * lh + z * E.letra(papel)[2] * 1.02;
  // o maior tamanho da lista em que o texto cabe na largura e nas linhas; null se nem o menor cabe
  function maiorQueCabe(ctx, k, papel, sizes, maxW, maxL, maxH = Infinity, lh = 1.12) {
    for (const z of sizes) {
      const ls = linhas(ctx, k, papel, z, maxW);
      if (ls.length <= maxL && ls.every((l) => larg(ctx, l, papel, z) <= maxW + 0.5) && alturaDe(ls.length, z, papel, lh) <= maxH) return z;
    }
    return null;
  }
  function naoCabe(k, w, z) {
    const n = P.LAM ? n2(P.LAM.n) : '??';
    console.log(`PRESEME-NAOCABE lâmina ${n}: o texto [${String(k)[0] === 'D' ? k : n2(k)}] não coube em ${Math.round(w)} px de largura nem com a letra ${z}`);
  }
  // escreve as linhas já quebradas, com o trecho do destaque
  function escrever(ctx, k, m, x, top, align, cor = 'texto') {
    const zz = m.z * E.letra(m.papel)[2], passo = zz * m.lh, tr = P.DESTAQUE[k];
    m.ls.forEach((l0, i) => {
      const l = l0.split(NB).join(' ');
      P.linhaCom(ctx, l, tr && l.includes(tr) ? tr : null, x, top + zz * 0.8 + i * passo, { papel: m.papel, size: m.z, align, cor, corTrecho: 'marca', seed: 41 + i * 3 + (parseInt(k, 10) || 7) });
    });
  }
  // a largura máxima de cada jeito de texto num painel de largura w
  const maxDe = (como, w) => (como === 'legenda' ? w - 2 * PAD - 2 * PADX.legenda : Math.min(w * 0.86, w - 2 * PAD) - 2 * PADX[como]);
  // no painel largo (largura de 1,6 vez a altura ou mais), o balão vai num lado só: no máximo 46% da largura
  const maxPainel = (como, w, h) => (w >= 1.6 * h && como !== 'legenda' ? Math.min(maxDe(como, w), w * 0.46 - 2 * PADX[como]) : maxDe(como, w));
  // o tamanho comum de cada jeito numa lâmina: o maior em que todos os textos daquele jeito cabem
  function tamanhos(ctx, itens) {
    const zs = {};
    for (const como of Object.keys(TAM)) {
      const deste = itens.filter((it) => it.x.como === como);
      if (!deste.length) continue;
      let z = TAM[como][0];
      for (const it of deste) {
        const mw = maxPainel(como, it.w, it.h);
        // a caixa não passa de uma fração do alto do painel (a letra larga do pixel quebra em mais linhas: aí ela diminui)
        const mh = (it.h || 1e9) * (QUAD ? 0.42 : 0.3) - 2 * PADY[como];
        let ok = maiorQueCabe(ctx, it.x.n, PAPEL[como], TAM[como], mw, MAXL, mh, LH[como]);
        if (ok === null && maiorQueCabe(ctx, it.x.n, PAPEL[como], TAM[como].slice(-1), mw, MAXL) !== null) ok = TAM[como][TAM[como].length - 1];
        if (ok === null) { z = TAM[como][TAM[como].length - 1]; naoCabe(it.x.n, mw, z); } else z = Math.min(z, ok);
      }
      zs[como] = z;
    }
    return zs;
  }

  // ---------- os desenhos do quadrinho (candidatos à biblioteca: servem a qualquer peça) ----------
  // a borda do painel, de tinta
  function borda(ctx, r, seed) {
    E.linha(ctx, [[r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h], [r.x, r.y]], { lw: 7, seed });
  }
  // os raios da virada: fatias de Marca-texto saindo do foco, atrás da cena
  MEME.raios = (ctx, cx, cy, r, seed = 300) => {
    const n = 22, R0 = Math.hypot(r.w, r.h) * 1.2;
    for (let i = 0; i < n; i += 2) {
      const a0 = (i / n) * Math.PI * 2 + 0.11, a1 = ((i + 1) / n) * Math.PI * 2 + 0.11;
      E.poligono(ctx, [[cx, cy], [cx + Math.cos(a0) * R0, cy + Math.sin(a0) * R0], [cx + Math.cos(a1) * R0, cy + Math.sin(a1) * R0]], { papel: 'destaque', contorno: false, hachura: false, sombra: false, amp: 0, seed: seed + i });
    }
  };
  // o rabinho de um balão: um triângulo da base (no pé do balão) até perto do alvo, com no máximo comp px
  function rabo(base, alvo, larg0, comp) {
    const dx = alvo[0] - base[0], dy = alvo[1] - base[1], d = Math.hypot(dx, dy) || 1, u = Math.min(1, comp / d);
    return [[base[0] - larg0 / 2, base[1] - 12], [base[0] + dx * u, base[1] + dy * u], [base[0] + larg0 / 2, base[1] - 12]];
  }
  // o ponto de uma aresta do triângulo (de a até b) na altura yy, puxado 5 px para dentro (para cobrir a costura)
  const naAltura = (a, b, yy, dentro) => { const t = Math.max(0, Math.min(1, (yy - a[1]) / ((b[1] - a[1]) || 1))); return [a[0] + (b[0] - a[0]) * t + dentro, yy]; };
  // a legenda do narrador: retângulo claro com a faixa de Marca-texto na esquerda
  MEME.legenda = (ctx, bx, by, bw, bh, seed = 500) => {
    E.ret(ctx, bx, by, bw, bh, { papel: 'superficie', r: 4, seed, sombra: true, hachura: false });
    E.ret(ctx, bx + 4, by + 4, 12, bh - 8, { papel: 'destaque', r: 2, contorno: false, hachura: false, sombra: false, seed: seed + 1 });
  };
  // o balão de fala (rabinho até a cabeça), de pensamento (bolinhas até a cabeça) ou de grito (pontas)
  MEME.balao = (ctx, como, bx, by, bw, bh, alvo, seed = 520) => {
    const op = { papel: 'superficie', seed, sombra: true, hachura: false };
    if (como === 'grito') {
      const cx = bx + bw / 2, cy = by + bh / 2, n = 22, pts = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2, fora = i % 2 === 0, rx = bw / 2 + (fora ? 34 : 4), ry = bh / 2 + (fora ? 30 : 4);
        pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
      }
      E.poligono(ctx, pts, Object.assign({}, op, { amp: 0.6 }));
      return;
    }
    if (como === 'pensa') {
      E.ret(ctx, bx, by, bw, bh, Object.assign({}, op, { r: Math.min(bh / 2, 64) }));
      if (alvo) {
        const b = [bx + bw * (alvo[0] < bx + bw / 2 ? 0.3 : 0.7), by + bh];
        for (const [u, rr] of [[0.28, 15], [0.62, 10]]) E.circulo(ctx, b[0] + (alvo[0] - b[0]) * u, b[1] + (alvo[1] - b[1]) * u * 0.6 + 12, rr, Object.assign({}, op, { sombra: false, seed: seed + rr }));
      }
      return;
    }
    // fala: o rabinho sai da base do lado de quem fala
    if (alvo) {
      const base = [Math.max(bx + 70, Math.min(bx + bw - 70, alvo[0] < bx + bw / 2 ? bx + bw * 0.28 : bx + bw * 0.72)), by + bh];
      const tr = rabo(base, alvo, 52, Math.abs(alvo[0] - base[0]) > 160 ? 150 : RABO + 20);
      E.poligono(ctx, tr, Object.assign({}, op, { sombra: false, seed: seed + 3 }));
      E.ret(ctx, bx, by, bw, bh, Object.assign({}, op, { r: 34 }));
      // cobre a costura (a linha do balão que cruza a raiz do rabinho), sem contorno
      const y0 = by + bh - 8, y1 = by + bh + 9;
      E.poligono(ctx, [naAltura(tr[0], tr[1], y0, 5), naAltura(tr[0], tr[1], y1, 5), naAltura(tr[2], tr[1], y1, -5), naAltura(tr[2], tr[1], y0, -5)], { papel: 'superficie', contorno: false, hachura: false, sombra: false, amp: 0, seed: seed + 4 });
      return;
    }
    E.ret(ctx, bx, by, bw, bh, Object.assign({}, op, { r: 34 }));
  };

  // ---------- o painel ----------
  // um painel: o fundo, (os raios), o palco pela câmera, os rótulos, os textos e a borda. zs: os tamanhos comuns da lâmina
  function painel(ctx, p, r, zs, seed) {
    const info = DS.paineis[p.id] || {};
    const palco = DS.palco[info.palco || p.id];
    const textos = (p.textos || []).filter((x) => TX[x.n]);
    const cam = info.camera || [0, 0, W, H];
    const meioCam = cam[0] + cam[2] / 2;
    // 1. onde ficam as cabeças: o palco roda antes numa tela pequena que ninguém vê (e que o qa não lê)
    let cabs = {};
    const rot0 = [];
    if (palco && textos.length) {
      const c0 = seco(); c0.save();
      try { cabs = (palco(c0, { painel: p, id: p.id, tempo: p.tempo, k: 1, rotulo: (kk, x0, y0) => { if (TX[kk]) rot0.push([x0, y0]); }, fundo: !info.raios }) || {}).cabecas || {}; } finally { c0.restore(); }
    }
    // 2. mede os textos e arruma em linhas, de cima para baixo: a legenda sozinha, à esquerda; dois balões de gente
    // diferente, um de cada lado, dividem a linha quando cabem; o grito no meio
    // painel largo (a virada embaixo, no quadrinho): o balão sozinho vai para o lado contrário de quem fala, com o rabinho
    // atravessando, e a cabeça fica livre, grande, do outro lado
    const largo = r.w >= 1.6 * r.h;
    const itens = textos.map((x) => {
      const como = PAPEL[x.como] ? x.como : 'fala';
      const papel = PAPEL[como], z = zs[como] || TAM[como][0];
      const ls = linhas(ctx, x.n, papel, z, maxPainel(como, r.w, r.h));
      const lw = Math.max(...ls.map((l) => larg(ctx, l, papel, z)));
      const bw = Math.min(r.w - 2 * PAD, lw + 2 * PADX[como]), bh = alturaDe(ls.length, z, papel, LH[como]) + 2 * PADY[como];
      const cab = x.quem && cabs[x.quem];
      const lado = como === 'legenda' ? 'esq' : como === 'grito' && !cab ? 'meio' : cab ? (cab.topo[0] < meioCam ? 'esq' : 'dir') : 'esq';
      return { x, como, m: { papel, z, ls, lh: LH[como] }, bw, bh, lado };
    });
    const filas = [];
    for (const it of itens) {
      const f = filas[filas.length - 1];
      const balao = it.como === 'fala' || it.como === 'pensa';
      if (f && balao && f.length === 1 && (f[0].como === 'fala' || f[0].como === 'pensa') && f[0].lado !== it.lado && f[0].bw + it.bw + 3 * PAD <= r.w) f.push(it);
      else filas.push([it]);
    }
    let y = r.y + PAD;
    for (const f of filas) {
      const alto = Math.max(...f.map((it) => it.bh));
      f.forEach((it) => { it.by = y + (it.como === 'grito' ? 30 : 0); });
      y += alto + (f[0].como === 'legenda' ? 14 : f[0].como === 'grito' ? 60 : RABO + 8);
    }
    // 3. a câmera: o pedaço do palco cabe no painel inteiro, encostado embaixo e no meio, e os textos ficam por cima;
    // se a cabeça de alguém ficaria embaixo de um texto (no mesmo pedaço da largura), a câmera se afasta até ela aparecer
    const baixo = cam[1] + cam[3];
    let k = info.cheio ? Math.max(r.w / cam[2], r.h / cam[3]) : Math.min(r.w / cam[2], r.h / cam[3]);
    const mapa = (kk) => { const tx = r.x + r.w / 2 - kk * meioCam, ty = r.y + r.h - kk * baixo; return (pt) => [tx + kk * pt[0], ty + kk * pt[1]]; };
    // onde vai cada caixa de texto, para uma câmera (o x do balão depende de onde a cabeça cai)
    const colocar = (tl) => {
      filas.forEach((f) => f.forEach((c, j) => {
        const cb = c.x.quem && cabs[c.x.quem];
        const alvoP = cb ? tl(cb.topo) : null;
        let bx = r.x + PAD;
        if (c.como === 'grito' && !alvoP) bx = r.x + r.w / 2 - c.bw / 2;
        else if (c.como !== 'legenda') {
          if (f.length === 2) bx = j === 0 ? r.x + PAD : r.x + r.w - PAD - c.bw;
          else if (alvoP && largo) bx = alvoP[0] > r.x + r.w / 2 ? r.x + PAD : r.x + r.w - PAD - c.bw;
          else if (alvoP) bx = Math.max(r.x + PAD, Math.min(r.x + r.w - PAD - c.bw, alvoP[0] - c.bw * (alvoP[0] < r.x + r.w / 2 ? 0.3 : 0.7)));
        }
        c.bx = bx; c.alvoP = alvoP;
      }));
    };
    if (!info.cheio) for (let volta = 0; volta < 3; volta++) {
      const tl = mapa(k);
      colocar(tl);
      let k2 = k;
      // as cabeças e os rótulos (um rótulo conta como uma cabeça pequena: o texto dele não pode ficar embaixo de uma caixa)
      const pontos = Object.values(cabs).concat(rot0.map(([x0, y0]) => ({ centro: [x0, y0], topo: [x0, y0 - 46 / Math.max(k, 0.05)], s: 1.2 })));
      for (const cb of pontos) {
        const [hx] = tl(cb.centro), meia = 92 * (cb.s || 1) * k, alto = cb.topo[1];
        if (alto >= baixo) continue;
        for (const f of filas) for (const c of f) {
          if (hx + meia < c.bx || hx - meia > c.bx + c.bw) continue; // a cabeça não fica embaixo desta caixa
          const limite = c.by + c.bh + (c.como === 'legenda' ? 12 : 22);
          k2 = Math.min(k2, (r.y + r.h - limite) / (baixo - alto));
        }
      }
      if (k2 >= k - 1e-6) break;
      k = Math.max(0.05, k2);
    }
    k = Math.max(0.05, k);
    const tela = mapa(k);
    colocar(tela);
    ctx.save();
    ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip();
    ctx.save(); ctx.fillStyle = E.cor('fundo'); ctx.fillRect(r.x, r.y, r.w, r.h); ctx.restore();
    if (info.raios) { const f = tela(info.foco || [meioCam, cam[1] + cam[3] / 2]); MEME.raios(ctx, f[0], f[1], r, seed + 40); }
    // 4. o palco, pela câmera
    const pedidos = [];
    const inf = { painel: p, id: p.id, tempo: p.tempo, k, rotulo: (kk, x0, y0, op = {}) => pedidos.push({ kk, x0, y0, op }), fundo: !info.raios };
    let volta = {};
    if (palco) {
      const [tx, ty] = tela([0, 0]);
      ctx.save(); ctx.translate(tx, ty); ctx.scale(k, k);
      try { volta = palco(ctx, inf) || {}; } finally { ctx.restore(); }
    }
    // 5. os rótulos de dentro da cena, no tamanho de verdade (papel de mão, a cor do texto)
    for (const { kk, x0, y0, op } of pedidos) {
      const s = TX[kk];
      if (!s) continue;
      const [px, py] = tela([x0, y0]);
      const o = Object.assign({ papel: 'mao', size: QUAD ? 34 : 46, align: 'center', cor: 'texto', w: 0, rot: 0 }, op);
      const maxW = o.w ? o.w * k : Infinity;
      let z = o.size;
      while (z > 26 && E.medir(ctx, s, { papel: o.papel, size: z }) > maxW) z -= 2;
      if (E.medir(ctx, s, { papel: o.papel, size: z }) > maxW + 0.5) naoCabe(kk, maxW, z);
      // o rótulo não sai do painel (a letra larga do pixel o empurraria para fora): o x se ajusta
      const wt0 = E.medir(ctx, s, { papel: o.papel, size: z }) + (o.caixa ? 32 : 0);
      const xa = o.align === 'center' ? wt0 / 2 : o.align === 'right' ? wt0 : 0, xb = wt0 - xa;
      const pxx = Math.max(r.x + 14 + xa, Math.min(r.x + r.w - 14 - xb, px));
      ctx.save(); ctx.translate(pxx, py); ctx.rotate(o.rot);
      if (o.caixa) { // a etiqueta: o rótulo numa plaquinha clara, que se lê em cima de qualquer desenho
        const zz = z * E.letra(o.papel)[2], wt = E.medir(ctx, s, { papel: o.papel, size: z });
        const x0 = o.align === 'center' ? -wt / 2 : o.align === 'right' ? -wt : 0;
        E.ret(ctx, x0 - 16, -zz * 0.92, wt + 32, zz * 1.32, { papel: 'superficie', r: 8, seed: 880, sombra: true, hachura: false });
      }
      E.texto(ctx, s, 0, 0, { papel: o.papel, size: z, align: o.align, cor: o.cor });
      ctx.restore();
    }
    // 6. os textos: a legenda na esquerda; o balão do lado de quem fala (ou do outro lado, no painel largo), com o
    // rabinho até a cabeça
    filas.forEach((f) => f.forEach((c, j) => {
      const { bx, alvoP } = c;
      if (c.como === 'legenda') MEME.legenda(ctx, bx, c.by, c.bw, c.bh, seed + 60 + j * 7);
      else MEME.balao(ctx, c.como, bx, c.by, c.bw, c.bh, alvoP ? [alvoP[0], Math.max(c.by + c.bh + 24, alvoP[1])] : null, seed + 60 + j * 7);
      const xt = c.como === 'legenda' ? bx + PADX.legenda + 6 : bx + c.bw / 2;
      escrever(ctx, c.x.n, c.m, xt, c.by + PADY[c.como], c.como === 'legenda' ? 'left' : 'center');
    }));
    ctx.restore();
    borda(ctx, r, seed + 90);
  }

  // ---------- as grades do quadrinho: as linhas de painéis, de cima para baixo ----------
  function grade(n) {
    if (SC.GRADE) return SC.GRADE;
    return n === 1 ? [[1]] : n === 2 ? [[1, 2]] : n === 3 ? [[1, 2], [3]] : [[1, 2], [3, 4]];
  }
  function retangulos(n, area) {
    const g = grade(n), out = [];
    const hl = (area.h - GUT * (g.length - 1)) / g.length;
    g.forEach((linha, i) => {
      const wl = (area.w - GUT * (linha.length - 1)) / linha.length;
      linha.forEach((num, j) => { out[num - 1] = { x: area.x + j * (wl + GUT), y: area.y + i * (hl + GUT), w: wl, h: hl }; });
    });
    return out;
  }

  // ---------- a lição ----------
  // mede as frases da lição numa largura; devolve as medidas e a altura do bloco
  function medirLicao(ctx, ks, maxW, sizes) {
    let z = sizes[0];
    for (const k of ks) {
      const ok = maiorQueCabe(ctx, k, 'titulo', sizes, maxW, QUAD ? 3 : 4);
      if (ok === null) { z = sizes[sizes.length - 1]; naoCabe(k, maxW, z); } else z = Math.min(z, ok);
    }
    const ms = ks.map((k) => ({ k, m: { papel: 'titulo', z, ls: linhas(ctx, k, 'titulo', z, maxW), lh: 1.12 } }));
    ms.forEach((x) => { x.alt = alturaDe(x.m.ls.length, z, 'titulo', 1.12); });
    return ms;
  }
  // a etiqueta da lição (O QUE FICA), em Marca-texto, com o fio
  function etiqueta(ctx, k, x, y, z = 30) {
    if (!TX[k]) return y;
    const s = TX[k].toUpperCase();
    E.texto(ctx, s, x, y + z, { papel: 'corpo', size: z, cor: 'marca' });
    const w = E.medir(ctx, s, { papel: 'corpo', size: z });
    E.linha(ctx, [[x, y + z + 16], [x + w, y + z + 18]], { papel: 'marca', lw: 4, seed: 3 });
    return y + z + 42;
  }
  const corCartao = () => (E.escuro() ? 'noite' : 'floresta');
  // a altura que a linha da fonte ocupa, na letra z (a do pixel é larga e quebra em mais linhas)
  const alturaFonte = (ctx, k, w, z) => alturaDe(P.equilibrar(ctx, TX[k] || '', 'corpo', z, w).length, z, 'corpo', 1.2) + 4;

  // ---------- os moldes de lâmina ----------
  // quadrinho: os painéis em grade e, embaixo, a faixa escura da lição (a etiqueta, as frases e a fonte)
  P.MOLDE.quadrinho = (ctx, lam) => {
    E.fundo(ctx);
    const ps = lam.paineis || [];
    const lic = lam.licao || {};
    const ks = (lic.linhas || []).filter((k) => TX[k]);
    // a faixa da lição: mede de baixo para cima
    const fw = X1 - X0, px = 36;
    // a faixa fica com no máximo um terço da lâmina: se passar (a letra larga do pixel), as frases diminuem
    const hFonte = TX[lic.fonte] ? Math.max(44, alturaFonte(ctx, lic.fonte, fw - 2 * px, 28)) : 0, gap = 14;
    const tams = [44, 42, 40, 38, 36, 34, 32, 30, 28];
    const altoFaixa = (m) => 26 + (TX[lic.etiqueta] ? 72 : 0) + m.reduce((a, x) => a + x.alt, 0) + gap * Math.max(0, m.length - 1) + (hFonte ? 18 + hFonte : 0) + 26;
    let ms = medirLicao(ctx, ks, fw - 2 * px, tams);
    for (let i = tams.indexOf(ms.length ? ms[0].m.z : 44) + 1; i < tams.length && altoFaixa(ms) > (Y1 - Y0) * 0.34; i++) ms = medirLicao(ctx, ks, fw - 2 * px, tams.slice(i));
    const hFaixa = altoFaixa(ms);
    const yF = ks.length ? Y1 - hFaixa : Y1;
    // os painéis
    const area = { x: X0, y: Y0, w: fw, h: (ks.length ? yF - GUT : Y1) - Y0 };
    const rs = retangulos(ps.length, area);
    const itens = [];
    ps.forEach((p, i) => (p.textos || []).filter((x) => TX[x.n]).forEach((x) => itens.push({ x, w: rs[i].w, h: rs[i].h })));
    const zs = tamanhos(ctx, itens);
    ps.forEach((p, i) => painel(ctx, p, rs[i], zs, 600 + i * 50));
    if (!ks.length) return;
    // a faixa: cartão escuro, letra Papel, o trecho do destaque em Marca-texto
    E.ret(ctx, X0, yF, fw, Y1 - yF, { papel: corCartao(), r: 10, seed: 900, sombra: false, hachura: false });
    let y = etiqueta(ctx, lic.etiqueta, X0 + px, yF + 22);
    ms.forEach((x, i) => { escrever(ctx, x.k, x.m, X0 + px, y, 'left', 'papel'); y += x.alt + gap; });
    if (hFonte) P.fonte(ctx, lic.fonte, { x: X0 + px, y: Y1 - 26 - hFonte, w: fw - 2 * px, h: hFonte }, { cor: 'salvia', valign: 'bottom', sizes: [28] });
  };

  // painel: um painel na lâmina inteira (sequência)
  P.MOLDE.painel = (ctx, lam) => {
    E.fundo(ctx);
    const p = lam.painel;
    const r = { x: X0, y: Y0, w: X1 - X0, h: Y1 - Y0 };
    const itens = (p.textos || []).filter((x) => TX[x.n]).map((x) => ({ x, w: r.w, h: r.h }));
    painel(ctx, p, r, tamanhos(ctx, itens), 600 + lam.n * 50);
  };

  // licao: o cartão escuro da última lâmina da sequência: a etiqueta, até 3 frases grandes, o desenho (se a peça tiver,
  // ganha pelo menos 300 px embaixo) e a fonte. As frases saem no maior tamanho em que todas cabem no espaço que sobra
  P.MOLDE.licao = (ctx, lam) => {
    E.fundo(ctx, { tipo: 'escuro' });
    const lic = lam.licao || {};
    const ks = (lic.linhas || []).filter((k) => TX[k]);
    const x0 = P.L, w = P.R - P.L, gap = 34;
    let y = etiqueta(ctx, lic.etiqueta, x0, P.TOP - 6, 34);
    const hFonte = TX[lic.fonte] ? Math.max(70, alturaFonte(ctx, lic.fonte, w, 32)) : 0, hDesenho = DS.licao ? 300 : 0;
    const livre = P.BOT - hFonte - hDesenho - 24 - y;
    const tams = [66, 62, 58, 54, 50, 46, 42, 40];
    let ms = medirLicao(ctx, ks, w, tams);
    for (let i = tams.indexOf(ms.length ? ms[0].m.z : 66) + 1; i < tams.length && ms.reduce((a, x) => a + x.alt, 0) + gap * (ms.length - 1) > livre; i++) ms = medirLicao(ctx, ks, w, tams.slice(i));
    ms.forEach((x, i) => {
      if (i) E.linha(ctx, [[x0, y - gap / 2 - 4], [x0 + w, y - gap / 2]], { papel: 'salvia', lw: 3, seed: 101 + i, tracejado: true });
      escrever(ctx, x.k, x.m, x0, y, 'left', 'papel');
      y += x.alt + gap;
    });
    if (DS.licao) { const caixa = { x: x0, y: Math.max(y, P.BOT - hFonte - 24 - hDesenho), w, h: 0 }; caixa.h = P.BOT - hFonte - 24 - caixa.y; if (caixa.h > 120) DS.licao(ctx, caixa, lam); }
    if (hFonte) P.fonte(ctx, lic.fonte, { x: x0, y: P.BOT - hFonte, w, h: hFonte }, { cor: 'salvia', valign: 'bottom', sizes: [32], maxLinhas: 3 });
  };
})();
