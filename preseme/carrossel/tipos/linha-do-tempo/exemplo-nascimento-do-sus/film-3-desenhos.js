// PRESEME · carrossel · linha do tempo · OS DESENHOS DA PEÇA: como o SUS nasceu (texto de exemplo escrito pelo Opus).
// O caso que atravessa a peça é o senhor de cabelo branco (GENTE 4): na fila da UBS (capa), barrado na porta do INAMPS
// (1986), sentado entre os usuários do conselho (dezembro de 1990) e, no fim da linha, entrando na UBS (hoje).
// Cada desenho é PRESEME.DESENHO[nome] = (ctx, caixa, lam, palavras). Toda palavra vem do textos.js (as palavras D da
// lâmina). As peças vêm do kit do tipo (PRESEME.KIT, em film-2-moldes.js). Desenho parado.
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, TX = globalThis.TEXTOS;
  const DS = P.DESENHO;
  const { liso, plano, corSobre, cabe, documento, livro, predio, pessoa, multidao } = P.KIT;
  const ANTONIO = 4; // a roupa da GENTE do caso da peça

  // capa: a UBS de porta aberta e a fila de gente diferente; na frente, o senhor de cabelo branco
  DS.fila = (ctx, cx, lam, pal = []) => {
    const chao = cx.y + cx.h - 8, s = Math.min(0.66, (cx.h - 40) / 520);
    E.linha(ctx, [[cx.x - 30, chao], [cx.x + cx.w + 30, chao]], { lw: 5, seed: 200 });
    const uw = 380, ux = cx.x + cx.w - uw / 2 - 6;
    predio(ctx, ux, chao, uw, Math.min(cx.h - 34, 400), { placa: TX[pal[0]], cruz: true, porta: 'aberta' });
    const ordem = [2, 1, 0, 3, ANTONIO], x1 = ux - uw / 2 - 86, passo = (x1 - cx.x - 56) / (ordem.length - 1);
    ordem.forEach((g, j) => pessoa(ctx, cx.x + 56 + j * passo, chao, s, { i: g, look: 1, mouth: 'smile', seed: 210 + j }));
  };

  // 1986: à esquerda, a porta fechada do INAMPS com o selo "só com carteira" e o senhor do lado de fora; a seta leva à
  // Conferência, à direita: a multidão com a faixa do sistema único
  DS.carteira = (ctx, cx, lam, pal = []) => {
    const chao = cx.y + cx.h - 6, s = Math.min(0.6, (cx.h - 30) / 520);
    E.linha(ctx, [[cx.x - 30, chao], [cx.x + cx.w * 0.5, chao]], { lw: 5, seed: 220 });
    const bx = cx.x + 300, bw = 300, bh = Math.min(cx.h - 30, 330);
    const porta = predio(ctx, bx, chao, bw, bh, { placa: TX[pal[0]], porta: 'fechada', corPorta: 'superficie', janelas: false, corPlaca: 'apoio' });
    if (TX[pal[1]]) E.carimbo(ctx, TX[pal[1]], porta.x + porta.w / 2, porta.y + porta.h * 0.4, { size: 30, quebra: true, rot: -0.1, seed: 221 });
    pessoa(ctx, cx.x + 62, chao, s, { i: ANTONIO, look: 1, mouth: 'flat', seed: 222 });
    // a Conferência: a faixa em cima, a multidão embaixo
    const fx = cx.x + cx.w * 0.58, fw = cx.w * 0.42, fy = cx.y + 14, fh = 96;
    for (const f of [0.12, 0.88]) E.linha(ctx, [[fx + fw * f, fy + fh], [fx + fw * f, chao - 120]], { lw: 6, seed: f < 0.5 ? 223 : 224 });
    E.ret(ctx, fx, fy, fw, fh, Object.assign({ papel: 'destaque', r: 8, seed: 225 }, liso));
    if (TX[pal[2]]) { const z = cabe(ctx, TX[pal[2]], fw - 40, 54, 'titulo', 30); E.texto(ctx, TX[pal[2]], fx + fw / 2, fy + fh / 2 + z * 0.42, { papel: 'titulo', size: z, align: 'center', cor: corSobre('destaque') }); }
    multidao(ctx, { x: fx - 10, y: chao - 170, w: fw + 20, h: 168 }, { fileiras: 3, porFileira: 6 });
    E.seta(ctx, [bx + bw / 2 + 26, cx.y + cx.h * 0.42], [fx - 24, fy + fh * 0.6], { lw: 7, curva: -0.2, seed: 226 });
  };

  // 1988: a Constituição aberta, com as abas dos dois artigos. Na página do 196, gente de todo tipo (todos); na do 198,
  // a ordem, prevenção em primeiro e tratamento em segundo
  DS.constituicao = (ctx, cx, lam, pal = []) => {
    const w = Math.min(cx.w - 40, 820), h = cx.h - 66;
    const pg = livro(ctx, cx.x + cx.w / 2, cx.y + 60 + h / 2, w, h, { abas: [{ texto: TX[pal[0]], papel: 'destaque', lado: 'esq' }, { texto: TX[pal[1]], papel: 'superficie', lado: 'dir' }] });
    multidao(ctx, { x: pg.esq.x + 4, y: pg.esq.y + 6, w: pg.esq.w - 8, h: pg.esq.h - 12 }, { fileiras: 3, porFileira: 4 });
    const d = pg.dir, z1 = cabe(ctx, TX[pal[2]] || '', d.w, 56, 'titulo', 30), z2 = cabe(ctx, TX[pal[3]] || '', d.w, 40, 'titulo', 26);
    if (TX[pal[2]]) E.texto(ctx, TX[pal[2]], d.x + 6, d.y + d.h * 0.36, { papel: 'titulo', size: z1 });
    E.linha(ctx, [[d.x + 6, d.y + d.h * 0.36 + 22], [d.x + d.w - 10, d.y + d.h * 0.36 + 22]], { lw: 3, tracejado: true, seed: 230 });
    if (TX[pal[3]]) E.texto(ctx, TX[pal[3]], d.x + 6, d.y + d.h * 0.72, { papel: 'titulo', size: z2 });
  };

  // setembro de 1990: a lei, com o artigo da conferência e do conselho riscado e o carimbo do veto em cima
  DS.veto = (ctx, cx, lam, pal = []) => {
    const w = Math.min(600, cx.w - 120), h = cx.h - 12, x = cx.x + (cx.w - w) / 2;
    const ys = documento(ctx, x, cx.y + 6, w, h, { titulo: TX[pal[0]], linhas: 5, riscar: [2, 3], rotulo: TX[pal[1]], tam: 54 });
    if (TX[pal[2]]) E.carimbo(ctx, TX[pal[2]], x + w * 0.7, ys[4] + 4, { size: 50, rot: -0.12, seed: 240 });
  };

  // dezembro de 1990: a mesa do conselho de saúde. Metade dos lugares é dos usuários (o senhor do caso entre eles); a
  // outra metade é de governo, prestadores e profissionais juntos (a lei não divide essa metade, e o desenho também não)
  DS.conselho = (ctx, cx, lam, pal = []) => {
    const yt = cx.y + cx.h * 0.6, chao = cx.y + cx.h - 4, s = Math.min(0.5, (yt - cx.y - 6) / 330), n = 4, meio = cx.x + cx.w / 2, vao = 70;
    const lado = (cx.w - vao) / 2, passo = lado / n;
    const us = [ANTONIO, 1, 2, 3], os = [0, 3, 1, 2];
    for (let k = 0; k < n; k++) {
      pessoa(ctx, cx.x + passo * (k + 0.5), yt + 30, s, { i: us[k], pose: 'sit', look: 1, seed: 250 + k });
      pessoa(ctx, meio + vao / 2 + passo * (k + 0.5), yt + 30, s, { i: os[k], pose: 'sit', look: -1, seed: 260 + k, style: { outfit: 'shirt', collar: E.PAL.papel } });
    }
    for (const [x0, k] of [[cx.x, pal[0]], [meio + vao / 2, pal[1]]]) {
      plano(ctx, x0, yt, lado, chao - yt, 'apoioEscuro', 10);
      if (TX[k]) P.bloco(ctx, k, { x: x0 + 18, y: yt + 14, w: lado - 36, h: chao - yt - 28 }, { papel: 'titulo', sizes: [46, 42, 38, 34, 32], cor: 'papel', align: 'center', valign: 'middle', lh: 1.08 });
    }
    for (const dy of [-16, 16]) E.ret(ctx, meio - 26, yt + (chao - yt) / 2 + dy - 7, 52, 14, Object.assign({ papel: 'alerta', r: 4, seed: 280 + dy }, liso));
  };

  // hoje, no fim da linha inteira: o senhor do caso entrando na UBS de porta aberta
  DS.fimDaLinha = (ctx, cx) => {
    const lam = P.LAM, pal = lam.palavras || [], chao = cx.y + cx.h - 6, uw = Math.min(250, cx.w * 0.7);
    E.linha(ctx, [[cx.x - 10, chao], [cx.x + cx.w + 30, chao]], { lw: 5, seed: 290 });
    predio(ctx, cx.x + cx.w - uw / 2, chao, uw, Math.min(cx.h - 30, 300), { placa: TX[pal[0]], cruz: false, porta: 'aberta', janelas: false, tamPlaca: 44 });
    pessoa(ctx, cx.x + 34, chao, Math.min(0.5, (cx.h - 20) / 520), { i: ANTONIO, look: 1, seed: 291 });
  };
})();
