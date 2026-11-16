// PRESEME · carrossel · tipo POR IDADE · os moldes de lâmina e o kit do tipo (FIXO: não muda de peça para peça).
// O que a atenção primária oferece em cada fase da vida, numa régua de idades que atravessa as lâminas. A capa traz a
// pergunta e a régua inteira pequena, com a pessoa de cada faixa em pé em cima dela; cada faixa ganha uma lâmina, com a
// régua no alto (a faixa da vez acesa), o nome da faixa grande, a pessoa daquela idade, um cartão por oferta (o que a
// UBS faz ou oferece ali e de quanto em quanto tempo) e o porquê no pé; a penúltima é a régua inteira, de cima para
// baixo, com tudo, para print; a última diz o que o aluno faz na visita e o que é da equipe, em cartões.
// Tudo lê as faixas do score.js (SCORE.FAIXAS): o chat 1 só escreve as faixas, as ofertas, os porquês e escolhe os
// ícones. Um molde por tipo de lâmina: PRESEME.MOLDE[tipo] (capa, faixa, regua, fazer, texto). Os ícones dos cartões
// são PRESEME.ICONE[nome](ctx, x, y, t): os do kit estão aqui; os da peça, em film-3-desenhos.js, que carrega depois.
// Em PRESEME.KIT, as peças que servem a qualquer peça por idade: a régua, a pessoa da idade, o cartão da oferta.
// Estilo padrão: lápis. Desenho parado.
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, TX = globalThis.TEXTOS, SC = globalThis.SCORE, G = globalThis.G;
  const { L, R, TOP, BOT, CX } = P;
  const LW = R - L;
  const liso = { hachura: false, sombra: false };
  const decor = (fn) => G.decor(fn);
  const FX = SC.FAIXAS || [], N = FX.length;
  const frases = (lam) => (lam.todas || lam.linhas).filter((k) => typeof k === 'number');
  const kz = (papel) => E.letra(papel)[2];
  const B = () => globalThis.BIB;
  // a letra do pixel é larga: no pixel, os tamanhos dos textos pequenos (cartões, régua inteira, regra, fonte) encolhem
  const PX = E.nome === 'pixel' ? 0.84 : 1;
  const zs = (a) => (PX === 1 ? a : a.map((z) => Math.round(z * PX)));

  // ---------- o kit do tipo (PRESEME.KIT) ----------
  // a cor da letra que se lê em cima de um preenchimento: clara no escuro; no claro, a do texto, ou Noite na lousa
  const corSobre = (papel) => (E.escura(E.cor(papel)) ? 'papel' : E.escuro() ? 'noite' : 'texto');
  // a cor da fonte e do rótulo pequeno: Folha no claro, Sálvia na lousa (Folha some no Floresta)
  const apoio = () => (E.escuro() ? 'salvia' : 'apoioEscuro');
  // a idade curta da faixa, para a régua: "25–39", "75+" (sai do de e do ate do score.js, que o tipo confere com o rótulo)
  const curto = (f) => (f.ate == null ? `${f.de}+` : `${f.de}–${f.ate}`);
  // o apoio que não some no fundo: no chapado o fundo já é Sálvia, então o trecho cheio e a linha do chão vão em Folha
  const cheio = () => (E.cor('apoio') === E.cor('fundo') ? 'apoioEscuro' : 'apoio');

  // a régua: um trecho por faixa, lado a lado, com a idade curta embaixo. i: a faixa da vez (acesa no destaque; as que
  // passaram cheias no apoio; as que faltam só no contorno); i = -1: todas cheias (a capa). Devolve os trechos
  // ({ x, w, cx }) e onde a régua acaba (y1)
  function regua(ctx, i, x, y, w, o = {}) {
    const gap = o.gap ?? 10, h = o.h || 24, z = o.z || 30, n = Math.max(1, N);
    const sw = (w - gap * (n - 1)) / n, segs = [];
    FX.forEach((f, j) => {
      const sx = x + j * (sw + gap);
      const papel = i < 0 ? (o.papel || cheio()) : j === i ? 'destaque' : j < i ? cheio() : null;
      E.ret(ctx, sx, y, sw, h, Object.assign({ papel, r: h / 2, lw: 3, seed: 200 + j }, liso));
      let zz = z;
      const s = curto(f);
      while (zz > 18 && E.medir(ctx, s, { papel: 'numero', size: zz }) > sw - 6) zz -= 2;
      const cor = i < 0 || j === i ? 'texto' : apoio();
      E.texto(ctx, s, sx + sw / 2, y + h + 12 + zz * kz('numero') * 0.8, { papel: 'numero', size: zz, align: 'center', cor });
      segs.push({ x: sx, w: sw, cx: sx + sw / 2 });
    });
    return { segs, y1: y + h + 12 + z * kz('numero') * 1.05 };
  }
  // a pessoa da idade, em pé (x, y é o pé; alt é a altura que ela ocupa). A aparência vem da faixa (pessoa: {...});
  // o tamanho sai da altura pedida (no Ch.person, s 1 dá umas 470 unidades de altura)
  function pessoa(ctx, f, x, y, alt, o = {}) {
    const b = B();
    if (!b) return;
    const p = Object.assign({ quem: 'moradora' }, f.pessoa || {}, { x, y, s: alt / 470, pose: 'stand' }, o);
    b.pessoa(ctx, p);
  }
  // os ícones dos cartões (x, y é o centro; t é o tamanho). A peça põe os dela em film-3-desenhos.js (PRESEME.ICONE)
  const ICONE = {
    exame(ctx, x, y, t) { const b = B(); if (b) b.prancheta(ctx, { x, y, s: t / 230, linhas: 3, vistos: 2 }); },
    vacina(ctx, x, y, t) { const b = B(); if (b) b.seringa(ctx, { x, y, s: t / 250, rot: -0.6 }); },
    consulta(ctx, x, y, t) { const b = B(); if (b) b.ubsIcone(ctx, { x, y, s: t / 180 }); },
    conversa(ctx, x, y, t) { const b = B(); if (b) b.balaoFala(ctx, { x, y, w: t * 1.25, h: t * 0.8 }); },
    calendario(ctx, x, y, t) { const b = B(); if (b) b.calendario(ctx, { x, y, s: t / 260, marcados: [9, 23] }); },
    nenhum() {},
  };
  P.ICONE = Object.assign(P.ICONE || {}, ICONE);
  // o X do que não entra (sobre o ícone, no canto)
  const errado = (ctx, x, y, s = 1) => { for (const d of [-1, 1]) E.linha(ctx, [[x - 20 * s, y - 20 * s * d], [x + 20 * s, y + 20 * s * d]], { papel: 'alerta', lw: 9 * s, seed: 31 + d }); };
  // o cartão da oferta: o ícone à esquerda, o nome (o que é) e o quando (de quanto em quanto tempo ou em que caso) ao
  // lado. marca 'nao': o que NÃO entra na rotina daquela idade (contorno tracejado, o ícone com o X, o nome sem destaque)
  function cartao(ctx, of, cx, j) {
    const nao = of.marca === 'nao';
    E.ret(ctx, cx.x, cx.y, cx.w, cx.h, Object.assign({ papel: nao ? null : 'superficie', r: 18, seed: 240 + j, lw: nao ? 3 : undefined }, liso));
    if (nao) E.linha(ctx, [[cx.x + 18, cx.y + cx.h - 2], [cx.x + cx.w - 18, cx.y + cx.h - 2]], { papel: 'apoio', lw: 3, tracejado: true, seed: 248 + j });
    const t = Math.min(cx.h - 36, 150), xi = cx.x + 22 + t / 2, yi = cx.y + cx.h / 2;
    const f = P.ICONE[of.icone];
    if (f) {
      if (nao) { ctx.save(); ctx.globalAlpha *= 0.45; f(ctx, xi, yi, t); ctx.restore(); errado(ctx, xi + t * 0.32, yi - t * 0.3, t / 150); }
      else f(ctx, xi, yi, t);
    }
    const xt = cx.x + 22 + t + 26, wt = cx.x + cx.w - 20 - xt;
    const temQ = !!TX[of.quando];
    const hn = temQ ? (cx.h - 36) * 0.52 : cx.h - 36;
    const a = P.bloco(ctx, of.nome, { x: xt, y: cx.y + 18, w: wt, h: hn }, { papel: 'titulo', sizes: zs([52, 48, 44, 40, 37, 34, 31, 28]), lh: 1.06, valign: temQ ? 'bottom' : 'middle', maxLinhas: 2, cor: nao ? apoio() : 'texto' });
    if (temQ) P.bloco(ctx, of.quando, { x: xt, y: a.y1 + 8, w: wt, h: cx.y + cx.h - 16 - (a.y1 + 8) }, { sizes: zs([40, 38, 36, 34, 32, 30, 28]), lh: 1.14, valign: 'top', maxLinhas: 3 });
  }
  P.KIT = { liso, decor, corSobre, apoio, cheio, curto, regua, pessoa, cartao, errado };

  // ---------- as peças das lâminas ----------
  // a etiqueta: um quadro fino com o nome em letra de prancheta (longe do contador do Instagram); devolve onde acaba
  function etiqueta(ctx, k, x = L, y = TOP - 16) {
    if (!TX[k]) return y;
    const s = TX[k].toUpperCase(), z = 30, w = E.medir(ctx, s, { papel: 'numero', size: z }) + 44, hh = z + 30;
    E.ret(ctx, x, y, w, hh, { papel: null, r: 4, lw: 3, hachura: false, sombra: false, seed: 5 });
    E.texto(ctx, s, x + 22, y + hh / 2 + z * 0.36, { papel: 'numero', size: z });
    return y + hh;
  }
  // o porquê: o rótulo pequeno ("por quê") e a frase com o fio Coral, encostados no pé da lâmina; devolve onde começa
  function porque(ctx, k, rotulo, cx) {
    if (!TX[k]) return { y0: cx.y + cx.h, y1: cx.y + cx.h };
    const r = P.bloco(ctx, k, { x: cx.x + 34, y: cx.y + 52, w: cx.w - 34, h: cx.h - 52 }, { sizes: [48, 46, 44, 42, 40, 38, 36], lh: 1.22, valign: 'bottom' });
    E.linha(ctx, [[cx.x + 6, r.y0 + 4], [cx.x + 6, r.y1 + 4]], { papel: 'alerta', lw: 6, seed: 9 });
    if (TX[rotulo]) E.texto(ctx, TX[rotulo].toUpperCase(), cx.x + 34, r.y0 - 22, { papel: 'numero', size: 30, cor: apoio() });
    return { y0: r.y0 - 22 - 30, y1: r.y1 };
  }

  // ---------- os moldes de lâmina ----------
  // capa: a etiqueta, a pergunta, a promessa e a régua inteira pequena, com a pessoa de cada faixa em pé em cima dela
  P.MOLDE.capa = (ctx, lam) => {
    E.fundo(ctx);
    const [t1, t2] = frases(lam), [etq] = lam.palavras;
    const y0 = etiqueta(ctx, etq) + 36;
    const a = P.titulo(ctx, t1, { x: L, y: y0, w: LW, h: 330 }, { sizes: [96, 90, 84, 78, 72, 66, 60], lh: 1.08, maxLinhas: 4 });
    const b = P.bloco(ctx, t2, { x: L, y: a.y1 + 28, w: LW, h: 170 }, { sizes: [46, 44, 42, 40, 38, 36, 34], maxLinhas: 3 });
    // a régua no pé e as pessoas em cima: a altura da pessoa sai do espaço que sobrou (e da largura de cada trecho)
    const yR = BOT - 64;
    const gap = 10, sw = (LW - gap * (Math.max(1, N) - 1)) / Math.max(1, N);
    const alt = Math.max(120, Math.min(yR - 24 - (b.y1 + 40), sw * 2.25, 420));
    FX.forEach((f, j) => pessoa(ctx, f, L + j * (sw + gap) + sw / 2, yR - 18, alt, { look: j < N / 2 ? 0.3 : -0.3 }));
    regua(ctx, -1, L, yR, LW, { h: 22, z: 30 });
  };
  // faixa: a régua no alto (a faixa da vez acesa), o nome da faixa grande, a pessoa daquela idade à esquerda, os cartões
  // das ofertas à direita e o porquê no pé. palavras: [rótulo da faixa, rótulo do porquê, ...nome e quando de cada oferta]
  P.MOLDE.faixa = (ctx, lam) => {
    E.fundo(ctx);
    const i = lam.faixa, f = FX[i] || { oferta: [] }, [fp] = frases(lam), [rot, rotPq] = lam.palavras;
    // a régua começa abaixo do contador do Instagram ("2/8", no canto de cima à direita, até 120 px)
    const rg = regua(ctx, i, L, 128, LW, { h: 20, z: 28 });
    const a = P.titulo(ctx, rot || f.rotulo, { x: L, y: rg.y1 + 18, w: LW, h: 120 }, { sizes: [96, 90, 84, 78, 72, 66, 60], lh: 1.02, maxLinhas: 1 });
    // a setinha da régua até o nome: liga o trecho aceso ao título
    const seg = rg.segs[i];
    if (seg) E.linha(ctx, [[seg.cx, rg.y1 - 2], [seg.cx, rg.y1 + 10]], { papel: 'alerta', lw: 5, seed: 260 });
    const b = porque(ctx, fp, rotPq, { x: L, y: BOT - 250, w: LW, h: 250 });
    const y0 = a.y1 + 28, y1 = (TX[fp] ? b.y0 : BOT) - 24, hA = y1 - y0;
    // a pessoa: coluna da esquerda, em pé no pé da área
    const wP = Math.min(330, LW * 0.36);
    E.linha(ctx, [[L + 10, y1], [L + wP - 10, y1]], { papel: cheio(), lw: 5, seed: 262 });
    pessoa(ctx, f, L + wP / 2, y1 - 4, Math.min(hA - 10, wP * 1.9), { look: 0.35 });
    // os cartões: coluna da direita, um embaixo do outro, centrados na área
    const of = (f.oferta || []).filter((o) => TX[o.nome]), n = Math.max(1, of.length), gap = 22;
    const xc = L + wP + 26, wc = R - xc + 6;
    const hc = Math.min(250, (hA - gap * (n - 1)) / n), yc0 = y0 + (hA - (hc * n + gap * (n - 1))) / 2;
    of.forEach((o, j) => cartao(ctx, o, { x: xc, y: yc0 + j * (hc + gap), w: wc, h: hc }, j));
  };
  // régua inteira (a penúltima, para print): o título e, de cima para baixo, uma linha por faixa: o nome da faixa num
  // selo à esquerda (os selos ligados pela régua, na vertical) e as ofertas ao lado ("nome · quando"); a regra (opcional)
  // e a fonte. Tudo sai das FAIXAS: a régua inteira bate com as lâminas por construção. palavras: [fonte, ...]
  P.MOLDE.regua = (ctx, lam) => {
    E.fundo(ctx);
    const RG = SC.REGUA || {}, [tit] = frases(lam), regra = RG.regra;
    const a = P.titulo(ctx, tit, { x: L, y: TOP - 10, w: LW, h: 150 }, { sizes: [64, 60, 56, 52, 48, 44], lh: 1.06, maxLinhas: 2 });
    const yF = BOT - 74, ya = a.y1 + 20;
    const cx = { x: L - 6, y: ya, w: LW + 12, h: yF - 34 - ya };
    E.ret(ctx, cx.x, cx.y, cx.w, cx.h, Object.assign({ papel: 'superficie', r: 18, seed: 280 }, liso));
    const pad = 20, xi = cx.x + pad, wi = cx.w - pad * 2;
    const yr = TX[regra] ? cx.y + cx.h - pad - 100 : cx.y + cx.h - pad;
    const y = cx.y + pad, passo = (yr - y) / Math.max(1, N);
    const wS = 210, xS = xi;
    // a régua vertical: a linha que passa pelo meio dos selos
    E.linha(ctx, [[xS + wS / 2, y + passo * 0.5], [xS + wS / 2, y + passo * (N - 0.5)]], { papel: 'apoio', lw: 6, seed: 282 });
    FX.forEach((f, j) => {
      const yy = y + j * passo;
      if (j) E.linha(ctx, [[xS + wS + 16, yy], [xi + wi, yy]], { papel: 'apoio', lw: 2, seed: 284 + j });
      // o selo da faixa
      const hs = Math.min(passo - 14, 92), ys = yy + (passo - hs) / 2;
      E.ret(ctx, xS, ys, wS, hs, Object.assign({ papel: 'destaque', r: hs / 2, seed: 290 + j }, liso));
      P.bloco(ctx, f.rotulo, { x: xS + 14, y: ys + 6, w: wS - 28, h: hs - 12 }, { papel: 'titulo', sizes: [40, 37, 34, 31, 28, 25], lh: 1, align: 'center', valign: 'middle', maxLinhas: 2, cor: corSobre('destaque') });
      // as ofertas: uma linha por oferta, "nome · quando" (o que não entra, com o X na frente)
      const of = (f.oferta || []).filter((o) => TX[o.nome]), no = Math.max(1, of.length);
      const xo = xS + wS + 22, wo = xi + wi - xo, ho = (passo - 8) / no;
      of.forEach((o, q) => {
        const yo = yy + 4 + q * ho, nao = o.marca === 'nao';
        if (nao) errado(ctx, xo + 14, yo + ho / 2, 0.5);
        const k = 'O' + j + '_' + q;
        TX[k] = TX[o.quando] ? `${TX[o.nome]} · ${TX[o.quando]}` : TX[o.nome]; // a linha do print junta o nome e o quando, já na tela das faixas
        P.bloco(ctx, k, { x: xo + (nao ? 34 : 0), y: yo, w: wo - (nao ? 34 : 0), h: ho }, { sizes: zs([38, 36, 34, 32, 30, 28]), lh: 1.08, valign: 'middle', maxLinhas: 2, cor: nao ? apoio() : 'texto', destaque: nao ? null : TX[o.nome] });
      });
    });
    if (TX[regra]) {
      E.linha(ctx, [[xi, yr + 6], [xi + wi, yr + 6]], { papel: 'alerta', lw: 5, seed: 296 });
      P.bloco(ctx, regra, { x: xi, y: yr + 14, w: wi, h: 90 }, { papel: 'titulo', sizes: zs([40, 38, 36, 34, 32, 30, 28]), lh: 1.06, valign: 'middle', maxLinhas: 2 });
    }
    P.fonte(ctx, RG.fonte, { x: L, y: yF - 30, w: LW, h: 104 }, { cor: apoio(), valign: 'bottom', maxLinhas: 3, sizes: zs([32, 30, 28, 26]) });
  };
  // fazer: o título e um cartão por quem faz (o ícone, quem e o texto); o do sinal e o do 192 com a faixa Coral
  const ICF = {
    voce(ctx, x, y, t) { const b = B(); if (b) b.pessoa(ctx, { quem: 'calouro', x, y: y + t * 0.46, s: t / 470, pose: 'stand', gesture: 'wave' }); },
    equipe(ctx, x, y, t) { const b = B(); if (b) b.ubsIcone(ctx, { x, y: y + t * 0.06, s: t / 180 }); },
    sinal(ctx, x, y, t) {
      E.circulo(ctx, x, y, t * 0.42, Object.assign({ papel: 'alerta', lw: 5, seed: 310 }, liso));
      E.texto(ctx, '!', x, y + t * 0.2, { papel: 'titulo', size: t * 0.62, align: 'center', cor: corSobre('alerta') });
    },
    192(ctx, x, y, t, rotulo) { const b = B(); if (b) b.celular(ctx, { x, y, s: t / 330, numero: rotulo || '', tela: 'ligar' }); },
  };
  P.MOLDE.fazer = (ctx, lam) => {
    E.fundo(ctx);
    const F = SC.FAZER || { cartoes: [] }, cs = (F.cartoes || []).filter((c) => TX[c.texto] || TX[c.quem]), [tit] = frases(lam);
    const a = P.titulo(ctx, tit, { x: L, y: TOP - 10, w: LW, h: 220 }, { sizes: [80, 74, 70, 66, 62, 58, 54], lh: 1.08, maxLinhas: 2 });
    const yF = BOT - 74, y0 = a.y1 + 34, y1 = yF - 40, gap = 26, n = Math.max(1, cs.length);
    const hc = Math.min(330, (y1 - y0 - gap * (n - 1)) / n);
    cs.forEach((c, j) => {
      const y = y0 + j * (hc + gap), urg = c.icone === '192' || c.icone === 'sinal', f = ICF[c.icone];
      E.ret(ctx, L - 6, y, LW + 12, hc, Object.assign({ papel: 'superficie', r: 18, seed: 320 + j }, liso));
      if (urg) E.ret(ctx, L - 6, y, 18, hc, Object.assign({ papel: 'alerta', r: 6, contorno: false, seed: 330 + j }, liso));
      const corQ = urg ? 'alerta' : 'texto';
      if (hc >= 300) {
        const t = Math.min(hc - 40, 190), xi = L + 26 + t / 2;
        if (f) f(ctx, xi, y + hc / 2, t, TX[c.quem]);
        const xt = L + 26 + t + 30, wt = R - 20 - xt;
        const q = TX[c.quem] ? P.bloco(ctx, c.quem, { x: xt, y: y + 22, w: wt, h: 70 }, { papel: 'titulo', sizes: [56, 52, 48, 44], lh: 1, maxLinhas: 1, cor: corQ }) : { y1: y + 10 };
        P.bloco(ctx, c.texto, { x: xt, y: q.y1 + 12, w: wt, h: y + hc - 22 - (q.y1 + 12) }, { sizes: [44, 42, 40, 38, 36, 34, 32, 30], lh: 1.18 });
      } else {
        const t = Math.max(70, Math.min(110, hc * 0.42)), xi = L + 24 + t / 2, yi = y + 14;
        if (f) f(ctx, xi, yi + t / 2, t, TX[c.quem]);
        if (TX[c.quem]) P.bloco(ctx, c.quem, { x: L + 24 + t + 24, y: yi, w: LW - t - 70, h: t }, { papel: 'titulo', sizes: [56, 52, 48, 44, 40], lh: 1, maxLinhas: 1, valign: 'middle', cor: corQ });
        const yt = yi + t + 8;
        P.bloco(ctx, c.texto, { x: L + 24, y: yt, w: LW - 48, h: y + hc - 16 - yt }, { sizes: [42, 40, 38, 36, 34, 32, 30], lh: 1.16 });
      }
    });
    P.fonte(ctx, F.fonte, { x: L, y: yF - 30, w: LW, h: 104 }, { cor: apoio(), valign: 'bottom', maxLinhas: 3, sizes: zs([32, 30, 28, 26]) });
  };
  // texto: a lâmina sem tipo próprio (a ideia grande e o detalhe)
  P.MOLDE.texto = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = frases(lam);
    const y0 = etiqueta(ctx, lam.palavras[0]);
    P.titulo(ctx, f1, { x: L, y: y0 + 40, w: LW, h: 330 }, { sizes: [84, 78, 72, 66, 60], lh: 1.1 });
    porque(ctx, f2, null, { x: L, y: BOT - 220, w: LW, h: 220 });
  };
})();
