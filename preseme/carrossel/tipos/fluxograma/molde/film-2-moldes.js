// PRESEME · carrossel FLUXOGRAMA · desenho 2 · o fluxo e os moldes de lâmina (fixo: é do tipo, não precisa mexer).
// O fluxo inteiro sai da árvore do score.js (SCORE.ARVORE): a mesma árvore desenha o losango de cada lâmina, o pedaço
// percorrido no canto e o fluxo inteiro da penúltima. Desenho parado, nada depende do tempo. Todo texto vem do textos.js.
// PRESEME.FLUXO: espinha(), layout(caixa), desenhar(ctx, caixa, op), losango(...), caixa(...), icone(...).
// PRESEME.MOLDE: capa, dado, passo, decisao, fluxo, papeis e texto (o de reserva).
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, SC = globalThis.SCORE, TX = globalThis.TEXTOS;
  const { L, R, TOP, BOT, D } = P;
  const LU = R - L;
  const ARV = SC.ARVORE || { inicio: null, nos: {}, rotulos: {} };
  const ROT = Object.assign({ sim: 'D03', nao: 'D04', pergunta: 'D02', passo: 'D05', proxima: 'D06', numero: null }, ARV.rotulos || {});
  const NO = (id) => (ARV.nos || {})[id];
  const tem = (k) => !!(k && TX[k]);
  // o texto do nó: na lâmina dele, o texto; no fluxo inteiro, o curto (se houver)
  const chave = (id, curto) => { const n = NO(id); if (!n) return null; return curto && tem(n.curto) ? n.curto : n.texto; };
  // o canto do pedaço percorrido: embaixo do contador do Instagram (que vai até y 120), à direita
  const CANTO = { x: R - 168, y: TOP + 6, w: 168, h: 236 };

  // ---------- a espinha: o caminho que desce. Em cada pergunta, um lado termina numa conduta (vai para o lado) ----------
  function espinha() {
    const ids = [], lado = {}, desce = {}, vistos = new Set();
    let id = ARV.inicio;
    while (id && NO(id) && !vistos.has(id)) {
      vistos.add(id); ids.push(id);
      const n = NO(id);
      if (n.tipo === 'acao') { id = n.prox; continue; }
      if (n.tipo !== 'pergunta') break;
      const fs = !!(NO(n.sim) && NO(n.sim).tipo === 'fim'), fn = !!(NO(n.nao) && NO(n.nao).tipo === 'fim');
      let d = 'nao';
      if (fs && !fn) d = 'nao';
      else if (fn && !fs) d = 'sim';
      else if (fs && fn) d = n.desce || (NO(n.sim).alerta && !NO(n.nao).alerta ? 'nao' : NO(n.nao).alerta && !NO(n.sim).alerta ? 'sim' : 'nao');
      desce[id] = d; lado[id] = d === 'sim' ? 'nao' : 'sim';
      id = n[d];
    }
    return { ids, lado, desce };
  }

  // ---------- o fluxo inteiro numa caixa: a espinha numa coluna, as condutas do lado. Devolve as posições e as setas ----------
  function layout(cx) {
    const { ids, lado, desce } = espinha();
    const colW = cx.w * 0.56, xs = cx.x + colW / 2, sx0 = cx.x + cx.w * 0.67, sw = cx.x + cx.w - sx0;
    const hA = cx.h * 0.095, hP = cx.h * 0.16;
    const hs = ids.map((id) => (NO(id).tipo === 'pergunta' ? hP : hA));
    const soma = hs.reduce((a, b) => a + b, 0);
    const gap = ids.length > 1 ? Math.max(cx.h * 0.025, Math.min(cx.h * 0.09, (cx.h - soma) / (ids.length - 1))) : 0;
    let y = cx.y + (cx.h - soma - gap * (ids.length - 1)) / 2;
    const pos = {}, setas = [];
    ids.forEach((id, i) => {
      const n = NO(id), h = hs[i], w = n.tipo === 'pergunta' ? colW * 0.92 : colW * 0.84;
      pos[id] = { id, x: xs - w / 2, y, w, h, cx: xs, cy: y + h / 2, forma: n.tipo, ordem: i };
      y += h + gap;
    });
    ids.forEach((id, i) => {
      const n = NO(id), p = pos[id];
      if (i + 1 < ids.length) { const q = pos[ids[i + 1]]; setas.push({ de: id, para: ids[i + 1], a: [p.cx, p.y + p.h], b: [q.cx, q.y], rot: n.tipo === 'pergunta' ? desce[id] : null, desce: true }); }
      if (n.tipo === 'pergunta') {
        const lid = n[lado[id]], h = hA * 1.08;
        pos[lid] = { id: lid, x: sx0, y: p.cy - h / 2, w: sw, h, cx: sx0 + sw / 2, cy: p.cy, forma: 'fim', ordem: p.ordem + 0.5, lado: true };
        setas.push({ de: id, para: lid, a: [p.x + p.w, p.cy], b: [sx0, p.cy], rot: lado[id], lado: true });
      }
    });
    return { pos, setas, ids, lado, desce };
  }

  // ---------- as formas ----------
  // as cores de cada forma, as mesmas nos seis estilos: losango Marca-texto com letra Floresta; caixa do que fazer na
  // superfície do estilo (branco, Papel ou, na lousa, Folha) com a letra do estilo; conduta em Folha com letra Papel;
  // conduta de alerta em Coral com letra Floresta (Coral nunca é letra no claro)
  const FORMA = {
    pergunta: { papel: 'destaque', letra: 'floresta' },
    acao: { papel: 'superficie', letra: 'texto' },
    fim: { papel: 'apoioEscuro', letra: E.nome === 'planta' ? 'floresta' : 'papel' }, // na planta a cor é aguada clara
    alerta: { papel: 'alerta', letra: 'floresta' },
  };
  const formaDe = (id) => { const n = NO(id) || {}; return n.tipo === 'fim' && n.alerta ? FORMA.alerta : FORMA[n.tipo] || FORMA.acao; };
  function losango(ctx, x, y, w, h, o = {}) {
    E.poligono(ctx, [[x + w / 2, y], [x + w, y + h / 2], [x + w / 2, y + h], [x, y + h / 2]], Object.assign({ papel: 'destaque', seed: 71, sombra: false }, o));
  }
  function caixa(ctx, x, y, w, h, o = {}) {
    E.ret(ctx, x, y, w, h, Object.assign({ papel: 'superficie', r: Math.min(22, h * 0.22), seed: 73, sombra: false }, o));
  }
  // o contorno tracejado (o caminho que segue na próxima lâmina)
  function tracejada(ctx, x, y, w, h, o = {}) {
    E.linha(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]], Object.assign({ papel: 'tinta', lw: 4, tracejado: true, seed: 75 }, o));
  }
  function forma(ctx, p, o = {}) {
    const f = formaDe(p.id), lw = o.lw;
    if (p.forma === 'pergunta') losango(ctx, p.x, p.y, p.w, p.h, { papel: f.papel, lw, seed: 80 + p.ordem * 3 });
    else caixa(ctx, p.x, p.y, p.w, p.h, { papel: f.papel, lw, seed: 81 + p.ordem * 3, r: o.r });
  }
  // a seta reta, com o rótulo sim ou não ao lado (o rótulo vem do textos.txt)
  function seta(ctx, s, o = {}) {
    E.seta(ctx, s.a, s.b, { papel: o.tinta || 'tinta', curva: 0, lw: o.lw || 5, cabeca: o.cabeca || 22, seed: 90 + (s.lado ? 1 : 0) });
    if (!o.rotulos || !s.rot) return;
    const k = s.rot === 'sim' ? ROT.sim : ROT.nao, z = o.size || 30;
    if (s.lado) E.texto(ctx, D(k), (s.a[0] + s.b[0]) / 2, s.a[1] - 14, { papel: 'mao', size: z, align: 'center' });
    else E.texto(ctx, D(k), s.a[0] + 16, (s.a[1] + s.b[1]) / 2 + z * 0.35, { papel: 'mao', size: z });
  }
  // o texto do nó dentro da forma dele
  function textoNo(ctx, p, curto, sizes) {
    const f = formaDe(p.id), k = chave(p.id, curto);
    if (!tem(k)) return;
    const pq = p.forma === 'pergunta';
    const iw = pq ? p.w * 0.64 : p.w - 28, ih = pq ? p.h * 0.66 : p.h - 18;
    P.bloco(ctx, k, { x: p.cx - iw / 2, y: p.cy - ih / 2, w: iw, h: ih }, { align: 'center', valign: 'middle', sizes, lh: 1.1, cor: f.letra });
  }

  // o fluxo inteiro (op.texto: com as palavras; sem, a silhueta) ou o pedaço percorrido (op.ate: o nó da lâmina)
  function desenhar(ctx, cx, op = {}) {
    const lay = layout(cx), mini = !op.texto, lw = mini ? 2.5 : 5;
    const ate = op.ate ? lay.ids.indexOf(op.ate) : -1;
    const apaga = (id) => op.ate && !(lay.pos[id] && !lay.pos[id].lado && lay.pos[id].ordem <= ate);
    for (const s of lay.setas) {
      ctx.save(); if (apaga(s.para) || apaga(s.de)) ctx.globalAlpha *= 0.3;
      seta(ctx, s, { lw: mini ? 2.2 : 5, cabeca: mini ? 7 : 22, rotulos: !mini, size: op.size || 30, tinta: op.tinta });
      ctx.restore();
    }
    for (const id of Object.keys(lay.pos)) {
      const p = lay.pos[id];
      ctx.save(); if (apaga(id)) ctx.globalAlpha *= 0.3;
      forma(ctx, p, { lw, r: mini ? 4 : undefined });
      ctx.restore();
      if (!mini) textoNo(ctx, p, true, op.sizes || [32, 30, 28]);
    }
    if (op.ate && lay.pos[op.ate]) { // você está aqui: o anel Coral em volta do nó da lâmina
      const p = lay.pos[op.ate];
      E.circulo(ctx, p.cx, p.cy, Math.max(p.w, p.h) * 0.62, { papel: null, tinta: 'alerta', lw: 4, ry: p.h * 0.95, seed: 97, sombra: false, hachura: false });
    }
    return lay;
  }

  // um ícone: 'B.<nome>' é da biblioteca (B.seringa, B.visto...); o resto é PRESEME.DESENHO[nome] (film-3-desenhos.js)
  const ESCALA_B = { seringa: 0.55, visto: 2.3, frascoVacina: 0.55, calendario: 0.42, celular: 0.42, ubsIcone: 0.7, prancheta: 0.5, coracao: 0.7, gota: 1.6, lupa: 0.5 };
  // mais: o que vai junto para a biblioteca (papel: a cor do ícone, quando o fundo da caixa pede outra)
  function icone(ctx, nome, cx, mais = {}) {
    if (!nome) return;
    if (nome.indexOf('B.') === 0) {
      const B = globalThis.BIB, f = B && B[nome.slice(2)];
      if (!f) return;
      const s = (ESCALA_B[nome.slice(2)] || 0.5) * Math.min(cx.w, cx.h) / 150;
      f(ctx, Object.assign({ x: cx.x + cx.w / 2, y: cx.y + cx.h / 2, s }, mais));
      return;
    }
    const d = P.DESENHO[nome];
    if (d) d(ctx, cx, P.LAM);
  }

  // o maior tamanho de letra em que TODOS os textos cabem na mesma caixa (as perguntas saem do mesmo tamanho em toda lâmina)
  function tamanhoComum(ctx, ks, cx, sizes, papel, lh) {
    const kz = E.letra(papel)[2];
    for (const z of sizes) {
      const cabe = ks.filter(tem).every((k) => {
        const ls = P.equilibrar(ctx, TX[k], papel, z, cx.w);
        return ls.every((l) => P.larg(ctx, l, papel, z) <= cx.w + 0.5) && (ls.length - 1) * z * kz * lh + z * kz * 1.02 <= cx.h + 0.5;
      });
      if (cabe) return z;
    }
    return sizes[sizes.length - 1];
  }

  // ---------- as contas da lâmina ----------
  const etiqueta = (ctx, s, o = {}) => { if (s) E.texto(ctx, s, L, TOP + 40, Object.assign({ papel: 'mao', size: 42 }, o)); };
  const perguntas = () => espinha().ids.filter((id) => NO(id).tipo === 'pergunta');
  const passos = () => espinha().ids.filter((id) => NO(id).tipo === 'acao');
  const deN = (lista, id) => `${lista.indexOf(id) + 1} de ${lista.length}`;
  // a primeira frase da lâmina que não é texto de nó (o porquê)
  const porque = (lam) => (lam.linhas || []).filter((k) => typeof k === 'number')[0];

  // ---------- os moldes de lâmina ----------
  // capa: a etiqueta, o título inteiro [01], a promessa [02]; embaixo, o desenho da capa e a silhueta do fluxo
  P.MOLDE.capa = (ctx, lam) => {
    E.fundo(ctx, { tipo: 'escuro' });
    const [a, b] = lam.linhas;
    const pal = lam.palavras || [];
    if (pal[0]) etiqueta(ctx, D(pal[0]), { cor: 'marca' });
    const t = P.titulo(ctx, a, { x: L, y: TOP + 90, w: LU, h: 400 }, { cor: 'papel' });
    let y = t.y1 + 34;
    if (b) y = P.bloco(ctx, b, { x: L, y, w: LU, h: 200 }, { cor: 'salvia', sizes: [48, 44, 40] }).y1;
    const topo = Math.max(y + 50, 700);
    desenhar(ctx, { x: R - 360, y: topo, w: 360, h: BOT - topo }, { tinta: 'papel' });
    icone(ctx, lam.desenho, { x: L, y: topo, w: LU - 380, h: BOT - topo });
  };
  // dado: a etiqueta, o número grande, o que ele é e o detalhe; o desenho (o mapa, por exemplo) e a fonte
  P.MOLDE.dado = (ctx, lam) => {
    E.fundo(ctx);
    const [a, b] = lam.linhas, [et, num, fon] = lam.palavras || [];
    etiqueta(ctx, D(et));
    const fy = BOT - 76, ld = lam.desenho ? 0.52 : 1;
    const n = P.bloco(ctx, num, { x: L, y: TOP + 80, w: LU * ld, h: 230 }, { papel: 'numero', sizes: [200, 180, 160, 140, 120, 100] });
    P.bloco(ctx, a, { x: L, y: n.y1 + 24, w: LU * ld, h: 330 }, { sizes: [52, 48, 44, 40] });
    if (b) P.bloco(ctx, b, { x: L, y: fy - 230, w: LU, h: 200 }, { papel: 'titulo', sizes: [60, 56, 52, 48, 44], valign: 'bottom' });
    icone(ctx, lam.desenho, { x: L + LU * 0.55, y: TOP + 70, w: LU * 0.45, h: fy - 270 - TOP - 70 });
    if (fon) P.fonte(ctx, fon, { x: L, y: fy, w: LU, h: 76 }, { valign: 'bottom' });
  };
  // passo: um nó acao. A caixa do que fazer, o pedaço percorrido no canto, o desenho e o porquê
  P.MOLDE.passo = (ctx, lam) => {
    E.fundo(ctx);
    const id = lam.no, n = NO(id) || {};
    etiqueta(ctx, `${D(ROT.passo)} ${deN(passos(), id)}`);
    desenhar(ctx, CANTO, { ate: id });
    const bx = { x: L, y: TOP + 100, w: CANTO.x - 40 - L, h: 250 };
    caixa(ctx, bx.x, bx.y, bx.w, bx.h, { papel: formaDe(id).papel, seed: 101 });
    if (tem(n.texto)) P.bloco(ctx, n.texto, { x: bx.x + 34, y: bx.y + 24, w: bx.w - 68, h: bx.h - 48 }, { papel: 'titulo', align: 'center', valign: 'middle', sizes: [60, 56, 52, 48, 44], lh: 1.12, cor: formaDe(id).letra });
    const fr = porque(lam), fy = fr ? 1040 : BOT;
    E.seta(ctx, [bx.x + bx.w / 2, bx.y + bx.h + 8], [bx.x + bx.w / 2, bx.y + bx.h + 70], { curva: 0, lw: 5, cabeca: 22, seed: 103 });
    icone(ctx, lam.desenho, { x: L, y: bx.y + bx.h + 90, w: LU, h: fy - 40 - (bx.y + bx.h + 90) });
    if (fr) P.bloco(ctx, fr, { x: L, y: fy, w: LU, h: BOT - fy }, { sizes: [52, 48, 44, 40] });
  };
  // decisao: um nó pergunta. O losango, os dois caminhos (sim à esquerda, não à direita), o pedaço percorrido no canto e o
  // porquê. Caminho que termina mostra a conduta; caminho que segue mostra, tracejado, o que vem na próxima lâmina
  P.MOLDE.decisao = (ctx, lam) => {
    E.fundo(ctx);
    const id = lam.no, n = NO(id) || {};
    etiqueta(ctx, `${D(ROT.pergunta)} ${deN(perguntas(), id)}`);
    desenhar(ctx, CANTO, { ate: id });
    // o losango
    // o texto vai no retângulo que cabe dentro do losango (largura + altura, em fração do losango, até 1)
    const dw = 700, dh = 430, dx = L + (CANTO.x - 30 - L - dw) / 2 + 40, dy = TOP + 96;
    losango(ctx, dx, dy, dw, dh, { seed: 111 });
    const tc = { x: dx + dw * 0.21, y: dy + dh * 0.29, w: dw * 0.58, h: dh * 0.42 };
    const z = tamanhoComum(ctx, perguntas().map((p) => NO(p).texto), tc, [52, 48, 44, 40, 36], 'titulo', 1.08);
    if (tem(n.texto)) P.bloco(ctx, n.texto, tc, { papel: 'titulo', align: 'center', valign: 'middle', sizes: [z, 36], lh: 1.08, cor: 'floresta' });
    if (n.icone) icone(ctx, n.icone, { x: L - 10, y: dy - 24, w: 156, h: 156 });
    // os dois caminhos
    const fr = porque(lam), by = dy + dh + 80, bh = (fr ? 1010 : 1160) - by, bw = (LU - 40) / 2;
    [['sim', L], ['nao', L + bw + 40]].forEach(([lado, x], j) => {
      const alvo = n[lado], a = NO(alvo) || {};
      const de = [dx + dw / 2 + (j ? 1 : -1) * dw / 4, dy + dh * 0.75], para = [x + bw / 2, by - 6];
      E.seta(ctx, de, para, { curva: 0, lw: 5, cabeca: 24, seed: 115 + j });
      const mx = (de[0] + para[0]) / 2, my = (de[1] + para[1]) / 2;
      E.texto(ctx, D(ROT[lado]), mx + (j ? 26 : -26), my + 12, { papel: 'mao', size: 40, align: j ? 'left' : 'right' });
      if (a.tipo === 'fim') {
        const f = formaDe(alvo);
        caixa(ctx, x, by, bw, bh, { papel: f.papel, seed: 117 + j });
        const ih = a.icone ? Math.min(150, bh * 0.44) : 0;
        if (a.icone) icone(ctx, a.icone, { x: x + bw / 2 - ih / 2, y: by + 18, w: ih, h: ih }, f.papel === 'apoioEscuro' ? { papel: 'papel' } : {});
        const tc = { x: x + 24, y: by + 24 + ih, w: bw - 48, h: bh - 48 - ih };
        const fins = Object.keys(ARV.nos || {}).filter((q) => NO(q).tipo === 'fim').map((q) => NO(q).texto);
        const z = tamanhoComum(ctx, fins, tc, [48, 44, 40, 36], 'titulo', 1.1);
        if (tem(a.texto)) P.bloco(ctx, a.texto, tc, { papel: 'titulo', align: 'center', valign: 'middle', sizes: [z, 36], lh: 1.1, cor: f.letra });
      } else if (alvo) {
        tracejada(ctx, x, by, bw, bh, { seed: 119 + j });
        const k = chave(alvo, true);
        const r = tem(ROT.proxima) ? P.bloco(ctx, ROT.proxima, { x: x + 20, y: by + 22, w: bw - 40, h: 50 }, { papel: 'mao', align: 'center', sizes: [34, 30, 28] }) : { y1: by + 10 };
        if (tem(k)) P.bloco(ctx, k, { x: x + 28, y: r.y1 + 14, w: bw - 56, h: by + bh - 70 - r.y1 - 14 }, { papel: 'titulo', align: 'center', valign: 'middle', sizes: [44, 40, 36, 32] });
        E.seta(ctx, [x + bw / 2 - 50, by + bh - 34], [x + bw / 2 + 50, by + bh - 34], { curva: 0, lw: 5, cabeca: 20, seed: 123 + j });
      }
    });
    if (fr) P.bloco(ctx, fr, { x: L, y: 1040, w: LU, h: BOT - 1040 }, { sizes: [52, 48, 44, 40] });
  };
  // fluxo: o fluxo inteiro numa lâmina (o cartão para print), com a etiqueta e a fonte
  P.MOLDE.fluxo = (ctx, lam) => {
    E.fundo(ctx);
    const [et, fon] = lam.palavras || [];
    etiqueta(ctx, D(et));
    const fy = BOT - 76;
    desenhar(ctx, { x: L, y: TOP + 80, w: LU, h: fy - 30 - TOP - 80 }, { texto: true });
    if (fon) P.fonte(ctx, fon, { x: L, y: fy, w: LU, h: 76 }, { valign: 'bottom' });
  };
  // papeis: quem faz o quê. Até três cartões (você, a equipe e o terceiro: o 192 ou a prevenção), cada um com o rótulo
  // (palavra D) e a frase; frase apagada some com o cartão. Os ícones vêm de lam.icones (um por cartão)
  P.MOLDE.papeis = (ctx, lam) => {
    E.fundo(ctx);
    const pal = lam.palavras || [], et = pal[0], fon = pal[pal.length - 1];
    etiqueta(ctx, D(et));
    const fy = BOT - 76, top = TOP + 90, frs = (lam.todas || []).filter((k) => typeof k === 'number');
    const rots = (lam.todas || []).filter((k) => typeof k === 'string').slice(1, 1 + frs.length);
    const vivos = frs.map((k, i) => ({ k, rot: rots[i], i })).filter((c) => tem(c.k));
    const gap = 28, h = (fy - 40 - top - gap * (vivos.length - 1)) / Math.max(1, vivos.length);
    vivos.forEach((c, j) => {
      const y = top + j * (h + gap), ultimo = c.i === 2;
      caixa(ctx, L, y, LU, h, { papel: ultimo ? 'destaque' : 'superficie', seed: 131 + j });
      const ic = (lam.icones || [])[c.i], iw = ic ? Math.min(190, h - 40) : 0;
      if (ic) icone(ctx, ic, { x: R - 30 - iw, y: y + (h - iw) / 2, w: iw, h: iw });
      const r = P.bloco(ctx, c.rot, { x: L + 34, y: y + 26, w: LU - 68 - iw, h: 70 }, { papel: 'titulo', sizes: [52, 48, 44], cor: ultimo ? 'floresta' : 'texto' });
      P.bloco(ctx, c.k, { x: L + 34, y: r.y1 + 14, w: LU - 88 - iw, h: y + h - 26 - r.y1 - 14 }, { sizes: [44, 40, 36, 34], cor: ultimo ? 'floresta' : 'texto' });
    });
    if (fon && fon !== et) P.fonte(ctx, fon, { x: L, y: fy, w: LU, h: 76 }, { valign: 'bottom' });
  };
  // texto (o de reserva, para lâmina de tipo que não existe): a frase grande e o detalhe
  P.MOLDE.texto = (ctx, lam) => {
    E.fundo(ctx);
    const [a, b] = lam.linhas;
    const t = P.bloco(ctx, a, { x: L, y: TOP + 60, w: LU, h: 420 }, { papel: 'titulo', sizes: [72, 66, 60, 56] });
    if (b) P.bloco(ctx, b, { x: L, y: t.y1 + 56, w: LU, h: BOT - t.y1 - 56 });
  };

  // ---------- os desenhos do tipo (servem a qualquer fluxograma; a peça pode trocar em film-3-desenhos.js) ----------
  const B = () => globalThis.BIB;
  // o lugar vazio do molde (o tracejado com o X): o desenho do assunto entra aqui
  P.DESENHO.troque = (ctx, cx) => {
    const x = cx.x + 10, y = cx.y + 10, w = cx.w - 20, h = cx.h - 20;
    tracejada(ctx, x, y, w, h, { papel: 'alerta', seed: 141 }); // Coral: se lê no claro, na Sálvia e no escuro da capa
    E.linha(ctx, [[x, y], [x + w, y + h]], { papel: 'alerta', lw: 3, seed: 142 });
    E.linha(ctx, [[x + w, y], [x, y + h]], { papel: 'alerta', lw: 3, seed: 143 });
  };
  // quem faz o quê: você (o calouro), a equipe (a médica) e o 192 (o celular, com o número do textos.txt: rotulos.numero).
  // A pessoa em pé (pose: 'stand': o y é o pé; sem a pose, o Ch.person senta e o y vira o quadril)
  const empe = (ctx, cx, quem) => { const s = cx.h / 500; if (B()) B().pessoa(ctx, { quem, pose: 'stand', x: cx.x + cx.w / 2, y: cx.y + cx.h - 8, s }); };
  P.DESENHO.voce = (ctx, cx) => empe(ctx, cx, 'calouro');
  P.DESENHO.equipe = (ctx, cx) => empe(ctx, cx, 'medica');
  P.DESENHO.tel192 = (ctx, cx) => { if (B()) B().celular(ctx, { x: cx.x + cx.w / 2, y: cx.y + cx.h / 2, s: cx.h / 330, numero: ROT.numero ? D(ROT.numero) : '', tela: 'ligar' }); };

  P.FLUXO = { espinha, layout, desenhar, losango, caixa, tracejada, icone, tamanhoComum, FORMA, CANTO };
})();
