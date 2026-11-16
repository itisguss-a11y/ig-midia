// PRESEME · carrossel · tipo LISTA · os moldes de lâmina e o kit do tipo (FIXO: não muda de peça para peça).
// O "N coisas que..." do perfil. A capa promete a lista com o número grande (o número de itens da LISTA, ao lado do
// resto do título); cada item ganha uma lâmina, com a trilha dos itens em cima (a bolinha da vez acesa), o número
// grande, o nome, o desenho que mostra o item e o porquê no pé; a penúltima junta a lista toda (uma linha por item,
// com o número); a última diz o que fazer, em cartões (você, a equipe, o 192).
// Tudo lê a lista do score.js (SCORE.LISTA): o chat 1 só escreve os nomes, os porquês e os desenhos. Um molde por tipo
// de lâmina: PRESEME.MOLDE[tipo] (capa, item, resumo, fazer, texto). O desenho do assunto é
// PRESEME.DESENHO[lam.desenho](ctx, caixa, lam, palavras), em film-3-desenhos.js, que carrega depois; aqui fica o troque.
// Em PRESEME.KIT, as peças que servem a qualquer lista: o número (a bolinha numerada), a trilha, o certo e o errado.
// Estilo padrão: carimbo. Desenho parado.
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, TX = globalThis.TEXTOS, DS = P.DESENHO, SC = globalThis.SCORE, G = globalThis.G;
  const { L, R, TOP, BOT, CX } = P;
  const LW = R - L;
  const liso = { hachura: false, sombra: false };
  const decor = (fn) => G.decor(fn);
  const LISTA = SC.LISTA || [], N = LISTA.length;
  // as frases da lâmina na ordem do score.js, com o lugar de quem foi apagada
  const frases = (lam) => (lam.todas || lam.linhas).filter((k) => typeof k === 'number');
  const kz = (papel) => E.letra(papel)[2];
  const semAcento = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  // ---------- o kit do tipo (PRESEME.KIT) ----------
  // a cor da letra que se lê em cima de um preenchimento: clara no escuro; no claro, a do texto, ou Noite na lousa
  const corSobre = (papel) => (E.escura(E.cor(papel)) ? 'papel' : E.escuro() ? 'noite' : 'texto');
  // a cor da fonte e do certo: Folha no claro, Sálvia na lousa (Folha some no Floresta)
  const apoio = () => (E.escuro() ? 'salvia' : 'apoioEscuro');
  // o número: a bolinha com o número do item (x, y é o centro; d é o diâmetro). o.vez: a da vez, no destaque;
  // o.feito: os que já passaram, cheios no apoio; o.apagado: os que ainda não chegaram, só o contorno; o.papel: outra cor
  function numero(ctx, n, x, y, d, o = {}) {
    const papel = o.papel || (o.vez ? 'destaque' : o.feito ? 'apoio' : o.apagado ? null : 'destaque');
    E.circulo(ctx, x, y, d / 2, { papel, lw: Math.max(3, Math.min(8, d * 0.04)), seed: o.seed || 60, sombra: !!o.sombra, hachura: false });
    const s = String(n);
    let z = d * 0.62;
    while (z > 14 && E.medir(ctx, s, { papel: 'titulo', size: z }) > d * 0.62) z -= 2;
    const cor = papel ? corSobre(papel) : 'texto';
    E.texto(ctx, s, x, y + z * kz('titulo') * 0.36, { papel: 'titulo', size: z, align: 'center', cor });
  }
  // a trilha dos itens: uma bolinha numerada por item; a da vez acesa, as que passaram cheias, as que faltam no contorno.
  // Com ORDEM (do mais comum ao mais grave), a da vez vai no Coral a partir da metade. Devolve onde acaba (x, y)
  function trilha(ctx, i, y, d = 54) {
    const gap = 16;
    LISTA.forEach((_, j) => numero(ctx, j + 1, L + d / 2 + j * (d + gap), y + d / 2, d, { vez: j === i, feito: j < i, apagado: j > i, papel: j === i && SC.ORDEM && j >= N / 2 ? 'alerta' : undefined, seed: 70 + j }));
    return { x: L + N * (d + gap) - gap, y: y + d };
  }
  // o certo e o errado (x, y é o centro; s a escala)
  const certo = (ctx, x, y, s = 1, papel = apoio()) => E.linha(ctx, [[x - 22 * s, y], [x - 6 * s, y + 18 * s], [x + 26 * s, y - 22 * s]], { papel, lw: 9 * s, seed: 30 });
  const errado = (ctx, x, y, s = 1, papel = 'alerta') => { for (const d of [-1, 1]) E.linha(ctx, [[x - 20 * s, y - 20 * s * d], [x + 20 * s, y + 20 * s * d]], { papel, lw: 9 * s, seed: 31 + d }); };
  P.KIT = { liso, decor, corSobre, apoio, numero, trilha, certo, errado };

  // troque: o lugar do desenho que a peça ainda não fez (tracejado, com o aviso; nunca vai para o ar)
  DS.troque = (ctx, cx) => {
    E.ret(ctx, cx.x + 10, cx.y + 10, cx.w - 20, cx.h - 20, Object.assign({ papel: null, r: 24, lw: 4, seed: 700 }, liso));
    E.linha(ctx, [[cx.x + 40, cx.y + 40], [cx.x + cx.w - 40, cx.y + cx.h - 40]], { lw: 3, tracejado: true, seed: 701 });
    E.linha(ctx, [[cx.x + cx.w - 40, cx.y + 40], [cx.x + 40, cx.y + cx.h - 40]], { lw: 3, tracejado: true, seed: 702 });
    const aviso = cx.w >= 420 ? 'TROQUE · desenho da peça' : 'TROQUE', z = Math.min(34, (cx.w - 40) / (aviso.length * 0.62));
    decor(() => E.texto(ctx, aviso, cx.x + cx.w / 2, cx.y + cx.h / 2 + z * 0.36, { papel: 'numero', size: z, align: 'center' }));
  };

  // ---------- as peças das lâminas ----------
  // a etiqueta: um quadro fino com o nome em letra de prancheta (longe do contador do Instagram); devolve onde acaba
  function etiqueta(ctx, k, x = L, y = TOP - 16) {
    if (!TX[k]) return y;
    const s = TX[k].toUpperCase(), z = 30, w = E.medir(ctx, s, { papel: 'numero', size: z }) + 44, hh = z + 30;
    E.ret(ctx, x, y, w, hh, { papel: null, r: 4, lw: 3, hachura: false, sombra: false, seed: 5 });
    E.texto(ctx, s, x + 22, y + hh / 2 + z * 0.36, { papel: 'numero', size: z });
    return y + hh;
  }
  // o porquê: o rótulo pequeno ("por quê", D02) e a frase com o fio Coral, encostados no pé da lâmina; devolve onde começa
  function porque(ctx, k, rotulo, cx) {
    if (!TX[k]) return { y0: cx.y + cx.h, y1: cx.y + cx.h };
    const r = P.bloco(ctx, k, { x: cx.x + 34, y: cx.y + 52, w: cx.w - 34, h: cx.h - 52 }, { sizes: [52, 50, 48, 46, 44, 42, 40, 38, 36], lh: 1.22, valign: 'bottom' });
    E.linha(ctx, [[cx.x + 6, r.y0 + 4], [cx.x + 6, r.y1 + 4]], { papel: 'alerta', lw: 6, seed: 9 });
    if (TX[rotulo]) E.texto(ctx, TX[rotulo].toUpperCase(), cx.x + 34, r.y0 - 22, { papel: 'numero', size: 30, cor: apoio() });
    return { y0: r.y0 - 22 - 30, y1: r.y1 };
  }
  function desenho(ctx, lam, cx, ...mais) {
    const f = lam.desenho && DS[lam.desenho];
    if (f && cx.w > 40 && cx.h > 40) f(ctx, cx, lam, ...mais);
  }
  // o título da capa sem o número do começo (o número sai grande, ao lado): "5 cuidados no calor" vira "cuidados no calor"
  function semNumero(s) {
    const m = String(s || '').match(/^\s*(\d+)\s+(.*)$/);
    return m && parseInt(m[1], 10) === N ? m[2] : null;
  }

  // ---------- os moldes de lâmina ----------
  // capa: a etiqueta, o número grande da lista ao lado do resto do título, a promessa e o desenho da capa (sem desenho, as
  // bolinhas numeradas da lista, como gancho)
  P.MOLDE.capa = (ctx, lam) => {
    E.fundo(ctx);
    const [t1, t2] = frases(lam), [etq, ...resto] = lam.palavras;
    const y0 = etiqueta(ctx, etq) + 40;
    // o número grande: a altura do bloco do título; a largura dele decide onde começa o título
    const s = String(N), zN = 330, wN = E.medir(ctx, s, { papel: 'titulo', size: zN });
    const zk = zN * kz('titulo'), hN = zk * 1.02, yB = y0 + zk * 0.8;
    const rest = semNumero(TX[t1]);
    let yb;
    if (rest) {
      decor(() => E.texto(ctx, s, L - 6, yB, { papel: 'titulo', size: zN }));
      TX.T01 = rest; // o resto do título, ao lado do número (o motor confere o [01] inteiro na lâmina 1 pelo score.js)
      const xt = L + wN + 34;
      const a = P.titulo(ctx, 'T01', { x: xt, y: y0, w: R - xt, h: hN + 20 }, { sizes: [96, 90, 84, 78, 72, 66, 60, 56, 52], lh: 1.06, valign: 'middle', destaque: SC.DESTAQUE && SC.DESTAQUE[t1] });
      yb = Math.max(a.y1, y0 + hN);
    } else {
      // o título não começa pelo número da lista (o tipo avisa no textos): o título inteiro, sem o número grande
      const a = P.titulo(ctx, t1, { x: L, y: y0, w: LW, h: 420 }, { sizes: [104, 96, 90, 84, 78, 72, 66], lh: 1.06 });
      yb = a.y1;
    }
    const b = P.bloco(ctx, t2, { x: L, y: yb + 36, w: LW, h: 220 }, { sizes: [50, 46, 44, 40, 38, 36, 34] });
    const ya = b.y1 + 40;
    if (lam.desenho && lam.desenho !== 'nenhum' && DS[lam.desenho]) desenho(ctx, lam, { x: L, y: ya, w: LW, h: BOT - ya }, resto);
    else {
      // sem desenho: as bolinhas numeradas da lista, grandes, no pé
      const gap = 26, d = Math.min(170, (LW - gap * (N - 1)) / Math.max(1, N)), yc = Math.max(ya + d / 2 + 20, BOT - d / 2 - 30), x0 = CX - (N * d + (N - 1) * gap) / 2;
      LISTA.forEach((_, j) => numero(ctx, j + 1, x0 + d / 2 + j * (d + gap), yc + (j % 2 ? 14 : -8), d, { seed: 90 + j, sombra: true }));
    }
  };
  // item: a trilha dos itens, o número grande da vez com o nome, o desenho que mostra o item e o porquê no pé.
  // palavras: [nome, rótulo do porquê, ...as do desenho]
  P.MOLDE.item = (ctx, lam) => {
    E.fundo(ctx);
    const i = lam.item, it = LISTA[i] || {}, [fp] = frases(lam), [nome, rotulo, ...resto] = lam.palavras;
    const tr = trilha(ctx, i, TOP - 44, 52);
    if (SC.ORDEM && TX[SC.ORDEM] && tr.x + 30 < R - 170) E.texto(ctx, TX[SC.ORDEM], tr.x + 24, TOP - 44 + 36, { papel: 'mao', size: 32, cor: apoio() });
    const yh = tr.y + 40, d = 196;
    numero(ctx, i + 1, L + d / 2, yh + d / 2, d, { vez: true, papel: SC.ORDEM && i >= N / 2 ? 'alerta' : 'destaque', seed: 120 + i, sombra: true });
    P.titulo(ctx, nome || it.nome, { x: L + d + 40, y: yh - 6, w: LW - d - 40, h: d + 12 }, { sizes: [84, 78, 72, 66, 62, 58, 54, 50, 46], lh: 1.06, valign: 'middle', maxLinhas: 3 });
    const b = porque(ctx, fp, rotulo, { x: L, y: BOT - 300, w: LW, h: 300 });
    const yd = yh + d + 34, yf = TX[fp] ? b.y0 - 26 : BOT;
    desenho(ctx, lam, { x: L, y: yd, w: LW, h: yf - yd }, resto);
  };
  // resumo: o título, o cartão com uma linha por item (o número e a linha, com o nome no destaque), a regra (opcional)
  // e a fonte. palavras: [fonte, ordem]
  P.MOLDE.resumo = (ctx, lam) => {
    E.fundo(ctx);
    const R0 = SC.RESUMO || {}, fr = frases(lam), tit = fr[0], linhas = LISTA.map((it) => it.resumo), regra = R0.regra;
    const a = P.titulo(ctx, tit, { x: L, y: TOP - 10, w: LW, h: 220 }, { sizes: [76, 70, 66, 62, 58, 54, 50], lh: 1.08, maxLinhas: 2 });
    let ya = a.y1 + 24;
    if (SC.ORDEM && TX[SC.ORDEM]) { E.texto(ctx, TX[SC.ORDEM], L, ya + 30, { papel: 'mao', size: 34, cor: apoio() }); ya += 54; }
    const yF = BOT - 74;
    const cx = { x: L - 6, y: ya + 10, w: LW + 12, h: yF - 34 - (ya + 10) };
    E.ret(ctx, cx.x, cx.y, cx.w, cx.h, Object.assign({ papel: 'superficie', r: 18, seed: 140 }, liso));
    const pad = 36, xi = cx.x + pad, wi = cx.w - pad * 2;
    const yr = TX[regra] ? cx.y + cx.h - pad - 110 : cx.y + cx.h - pad;
    const y = cx.y + pad, passo = (yr - y) / Math.max(1, N), d = Math.max(56, Math.min(96, passo - 30));
    linhas.forEach((k, j) => {
      const it = LISTA[j] || {}, yy = y + j * passo;
      if (j) E.linha(ctx, [[xi, yy], [xi + wi, yy]], { papel: 'apoio', lw: 3, seed: 142 + j });
      numero(ctx, j + 1, xi + d / 2, yy + passo / 2, d, { seed: 145 + j, papel: SC.ORDEM && j >= N / 2 ? 'alerta' : 'destaque' });
      const s = TX[k] || '', nm = TX[it.nome] || '';
      const trecho = nm && semAcento(s).startsWith(semAcento(nm)) ? s.slice(0, nm.length) : null;
      P.bloco(ctx, k, { x: xi + d + 28, y: yy + 10, w: wi - d - 28, h: passo - 20 }, { sizes: [46, 44, 42, 40, 38, 36, 34, 32], lh: 1.16, valign: 'middle', destaque: trecho });
    });
    if (TX[regra]) {
      E.linha(ctx, [[xi, yr + 6], [xi + wi, yr + 6]], { papel: 'alerta', lw: 5, seed: 150 });
      P.bloco(ctx, regra, { x: xi, y: yr + 18, w: wi, h: 96 }, { papel: 'titulo', sizes: [46, 44, 42, 40, 38, 36], lh: 1.1, valign: 'middle' });
    }
    P.fonte(ctx, lam.palavras[0], { x: L, y: yF - 30, w: LW, h: 104 }, { cor: apoio(), valign: 'bottom', maxLinhas: 3 });
  };
  // fazer: o título e um cartão por quem faz (o ícone, quem e o texto); o do 192 com a faixa Coral. palavras: [...quem, fonte]
  const ICONE = {
    voce(ctx, x, y, t) { const B = globalThis.BIB; if (B) B.pessoa(ctx, { quem: 'calouro', x, y: y + t * 0.46, s: t / 470, pose: 'stand', gesture: 'wave' }); },
    equipe(ctx, x, y, t) { const B = globalThis.BIB; if (B) B.ubsIcone(ctx, { x, y: y + t * 0.06, s: t / 180 }); },
    192(ctx, x, y, t, rotulo) { const B = globalThis.BIB; if (B) B.celular(ctx, { x, y, s: t / 330, numero: rotulo || '', tela: 'ligar' }); },
  };
  P.MOLDE.fazer = (ctx, lam) => {
    E.fundo(ctx);
    const F = SC.FAZER || { cartoes: [] }, cs = (F.cartoes || []).filter((c) => TX[c.texto] || TX[c.quem]), [tit] = frases(lam);
    const a = P.titulo(ctx, tit, { x: L, y: TOP - 10, w: LW, h: 220 }, { sizes: [80, 74, 70, 66, 62, 58, 54], lh: 1.08, maxLinhas: 2 });
    const yF = BOT - 74, y0 = a.y1 + 34, y1 = yF - 40, gap = 26, n = Math.max(1, cs.length);
    const hc = Math.min(330, (y1 - y0 - gap * (n - 1)) / n);
    cs.forEach((c, j) => {
      const y = y0 + j * (hc + gap), urg = c.icone === '192', f = ICONE[c.icone];
      E.ret(ctx, L - 6, y, LW + 12, hc, Object.assign({ papel: 'superficie', r: 18, seed: 160 + j }, liso));
      if (urg) E.ret(ctx, L - 6, y, 18, hc, Object.assign({ papel: 'alerta', r: 6, contorno: false, seed: 170 + j }, liso));
      const corQ = urg ? 'alerta' : 'texto';
      if (hc >= 300) {
        // cartão alto (até 2 cartões): o ícone numa coluna à esquerda, quem faz e o texto ao lado
        const t = Math.min(hc - 40, 190), xi = L + 26 + t / 2;
        if (f) f(ctx, xi, y + hc / 2, t, TX[c.quem]);
        const xt = L + 26 + t + 30, wt = R - 20 - xt;
        const q = TX[c.quem] ? P.bloco(ctx, c.quem, { x: xt, y: y + 22, w: wt, h: 70 }, { papel: 'titulo', sizes: [56, 52, 48, 44], lh: 1, maxLinhas: 1, cor: corQ }) : { y1: y + 10 };
        P.bloco(ctx, c.texto, { x: xt, y: q.y1 + 12, w: wt, h: y + hc - 22 - (q.y1 + 12) }, { sizes: [44, 42, 40, 38, 36, 34, 32, 30], lh: 1.18 });
      } else {
        // cartão baixo (3 cartões): o ícone pequeno e quem faz numa linha em cima, o texto na largura toda embaixo
        const t = Math.max(70, Math.min(110, hc * 0.42)), xi = L + 24 + t / 2, yi = y + 14;
        if (f) f(ctx, xi, yi + t / 2, t, TX[c.quem]);
        if (TX[c.quem]) P.bloco(ctx, c.quem, { x: L + 24 + t + 24, y: yi, w: LW - t - 70, h: t }, { papel: 'titulo', sizes: [56, 52, 48, 44, 40], lh: 1, maxLinhas: 1, valign: 'middle', cor: corQ });
        const yt = yi + t + 8;
        P.bloco(ctx, c.texto, { x: L + 24, y: yt, w: LW - 48, h: y + hc - 16 - yt }, { sizes: [42, 40, 38, 36, 34, 32, 30], lh: 1.16 });
      }
    });
    P.fonte(ctx, F.fonte, { x: L, y: yF - 30, w: LW, h: 104 }, { cor: apoio(), valign: 'bottom', maxLinhas: 3 });
  };
  // texto: a lâmina sem tipo próprio (a ideia grande, o detalhe e o desenho, se houver)
  P.MOLDE.texto = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = frases(lam);
    const y0 = etiqueta(ctx, lam.palavras[0]);
    const a = P.titulo(ctx, f1, { x: L, y: y0 + 40, w: LW, h: 330 }, { sizes: [84, 78, 72, 66, 60], lh: 1.1 });
    const b = porque(ctx, f2, null, { x: L, y: BOT - 220, w: LW, h: 220 });
    desenho(ctx, lam, { x: L, y: a.y1 + 34, w: LW, h: b.y0 - 34 - a.y1 - 34 }, lam.palavras.slice(1));
  };
})();
