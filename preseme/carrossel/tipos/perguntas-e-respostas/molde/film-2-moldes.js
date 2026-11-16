// PRESEME · carrossel · tipo PERGUNTAS E RESPOSTAS · os moldes de lâmina e o kit (FIXO: não muda de peça para peça).
// Dúvidas de verdade, uma por lâmina. Em cima, a trilha das dúvidas (uma bolinha por dúvida, a da vez no destaque);
// depois, a dúvida escrita à mão num balão, como alguém pergunta, com o rosto de quem pergunta na pontinha; a resposta
// em letra de forma, o desenho que explica e, embaixo, o detalhe com o fio. No fim, o resumo para salvar: uma ficha
// pautada, presa com o clipe, uma linha por dúvida e a fonte no pé. Um molde por tipo de lâmina: PRESEME.MOLDE[tipo]
// (capa, pergunta, resumo, texto). O desenho de cada lâmina é PRESEME.DESENHO[lam.desenho](ctx, caixa, lam, palavras):
// os do assunto ficam na peça (film-3-desenhos.js), que carrega depois; aqui fica o troque. As peças que servem a
// qualquer dúvida de saúde ficam em PRESEME.KIT: o rosto de quem pergunta, o frasco (com o monitor de calor, se tiver),
// o termômetro com faixa e marcas, o certo e o errado. Estilo padrão: lápis no papel. Desenho parado.
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, TX = globalThis.TEXTOS, DS = P.DESENHO, SC = globalThis.SCORE, G = globalThis.G;
  const { L, R, TOP, BOT } = P;
  const LW = R - L;
  const RAD = Math.PI / 180;
  const liso = { hachura: false, sombra: false };
  const decor = (fn) => G.decor(fn);
  // as frases da lâmina na ordem do score.js, com o lugar de quem foi apagada (a frase 2 apagada não vira a frase 3)
  const frases = (lam) => (lam.todas || lam.linhas).filter((k) => typeof k === 'number');

  // ---------- o kit: peças que servem a qualquer dúvida de saúde (PRESEME.KIT) ----------
  // a cor da letra que se lê em cima de um preenchimento (papel): clara no escuro; no claro, a do texto, ou Noite na lousa
  const corSobre = (papel) => (E.escura(E.cor(papel)) ? 'papel' : E.escuro() ? 'noite' : 'texto');
  // a cor do certo e da fonte: Folha no claro, Sálvia na lousa (Folha some no Floresta)
  const apoio = () => (E.escuro() ? 'salvia' : 'apoioEscuro');
  // a letra que cabe: o maior tamanho (de z para baixo) em que o texto s cabe na largura w
  function cabe(ctx, s, w, z, papel = 'numero', min = 26) {
    while (z > min && E.medir(ctx, s, { papel, size: z }) > w) z -= 2;
    return z;
  }
  // o rosto de quem pergunta: cabeça e ombro, pequeno (x, y é o centro da cabeça)
  function rosto(ctx, x, y, r, o = {}) {
    E.ret(ctx, x - r * 1.25, y + r * 0.82, r * 2.5, r * 1.3, Object.assign({ papel: o.roupa || 'apoio', r: r * 0.7, seed: 20 }, liso));
    E.circulo(ctx, x, y, r, Object.assign({ papel: o.pele || 'pele', seed: 21 }, liso));
    E.poligono(ctx, [[x - r * 1.02, y - r * 0.05], [x - r * 0.86, y - r * 0.72], [x - r * 0.3, y - r * 1.08], [x + r * 0.4, y - r * 1.06], [x + r * 0.94, y - r * 0.62], [x + r * 1.02, y - r * 0.1], [x + r * 0.4, y - r * 0.5], [x - r * 0.3, y - r * 0.42]], Object.assign({ papel: 'cabelo', contorno: false, seed: 22 }, liso));
    for (const sd of [-1, 1]) E.circulo(ctx, x + sd * r * 0.36, y + r * 0.08, r * 0.1, Object.assign({ papel: 'tinta', contorno: false, seed: 23 + sd }, liso));
    E.linha(ctx, [[x - r * 0.18, y + r * 0.5], [x + r * 0.2, y + r * 0.44]], { lw: 4, seed: 26 }); // a boca de quem está em dúvida
  }
  // o certo e o errado (x, y é o centro; s a escala)
  const certo = (ctx, x, y, s = 1, papel = apoio()) => E.linha(ctx, [[x - 22 * s, y], [x - 6 * s, y + 18 * s], [x + 26 * s, y - 22 * s]], { papel, lw: 9 * s, seed: 30 });
  const errado = (ctx, x, y, s = 1, papel = 'alerta') => { for (const d of [-1, 1]) E.linha(ctx, [[x - 20 * s, y - 20 * s * d], [x + 20 * s, y + 20 * s * d]], { papel, lw: 9 * s, seed: 31 + d }); };
  // o frasco (vacina, remédio): x é o centro, y é o fundo. liquido: a cor do que tem dentro; monitor: 'claro' ou
  // 'escuro' desenha o monitor de calor no rótulo (o quadrado de dentro mais claro ou igual ao círculo de fora)
  function frasco(ctx, x, y, s, o = {}) {
    const w = 120 * s, h = 210 * s, x0 = x - w / 2, y0 = y - h;
    E.ret(ctx, x0, y0, w, h, { papel: 'superficie', r: 18 * s, seed: o.seed || 40 });
    E.ret(ctx, x0 + 8 * s, y0 + h * 0.3, w - 16 * s, h * 0.66, Object.assign({ papel: o.liquido || 'apoio', r: 12 * s, seed: 41 }, liso));
    E.ret(ctx, x - w * 0.3, y0 - 30 * s, w * 0.6, 26 * s, Object.assign({ papel: 'superficie', r: 4 * s, seed: 42 }, liso));
    E.ret(ctx, x - w * 0.42, y0 - 62 * s, w * 0.84, 36 * s, Object.assign({ papel: o.tampa || 'alerta', r: 8 * s, seed: 43 }, liso));
    E.ret(ctx, x0 - 4 * s, y0 + h * 0.36, w + 8 * s, h * 0.42, { papel: 'superficie', r: 6 * s, seed: 44 });
    if (o.monitor) {
      const mx = x, my = y0 + h * 0.57, mr = 34 * s;
      E.circulo(ctx, mx, my, mr, Object.assign({ papel: 'noite', seed: 45 }, liso));
      E.ret(ctx, mx - mr * 0.5, my - mr * 0.5, mr, mr, Object.assign({ papel: o.monitor === 'claro' ? 'papel' : 'noite', tinta: o.monitor === 'claro' ? 'tinta' : 'superficie', lw: 3, r: 2, seed: 46 }, liso));
    }
  }
  // o termômetro de escala: vertical, de y1 (embaixo) a y0 (em cima), com os valores de min a max. faixa: [de, até]
  // pintada (papel faixaCor); marcas: [{ v, texto, lado }] tracinho e texto (texto vem do textos.js); devolve yDe(valor)
  function termometro(ctx, x, y0, y1, o = {}) {
    const min = o.min ?? 0, max = o.max ?? 12, yDe = (v) => y1 - ((v - min) / (max - min)) * (y1 - y0), w = o.largura || 54;
    E.ret(ctx, x - w / 2, y0 - 24, w, y1 - y0 + 48, { papel: 'superficie', r: w / 2, seed: 50 });
    if (o.faixa) E.ret(ctx, x - w / 2 + 8, yDe(o.faixa[1]), w - 16, yDe(o.faixa[0]) - yDe(o.faixa[1]), Object.assign({ papel: o.faixaCor || 'apoio', r: 6, seed: 51 }, liso));
    if (o.nivel !== undefined) E.ret(ctx, x - 8, yDe(o.nivel), 16, y1 + 30 - yDe(o.nivel), Object.assign({ papel: 'alerta', r: 8, seed: 52 }, liso));
    E.circulo(ctx, x, y1 + 46, w * 0.62, Object.assign({ papel: 'alerta', seed: 53 }, liso));
    for (const m of o.marcas || []) {
      const ym = yDe(m.v), sd = m.lado === 'esq' ? -1 : 1;
      E.linha(ctx, [[x + sd * (w / 2 - 4), ym], [x + sd * (w / 2 + 26), ym]], { lw: 4, seed: 54 + Math.round(m.v) });
      if (m.texto) E.texto(ctx, m.texto, x + sd * (w / 2 + 38), ym + (m.size || 40) * 0.36, { papel: 'numero', size: m.size || 40, align: sd < 0 ? 'right' : 'left' });
    }
    return yDe;
  }
  P.KIT = { RAD, liso, decor, corSobre, apoio, cabe, rosto, certo, errado, frasco, termometro };

  // troque: o lugar do desenho que a peça ainda não fez (aparece tracejado, com o aviso; nunca vai para o ar)
  DS.troque = (ctx, cx) => {
    E.ret(ctx, cx.x + 10, cx.y + 10, cx.w - 20, cx.h - 20, Object.assign({ papel: null, r: 24, lw: 4, seed: 700 }, liso));
    E.linha(ctx, [[cx.x + 40, cx.y + 40], [cx.x + cx.w - 40, cx.y + cx.h - 40]], { lw: 3, tracejado: true, seed: 701 });
    E.linha(ctx, [[cx.x + cx.w - 40, cx.y + 40], [cx.x + 40, cx.y + cx.h - 40]], { lw: 3, tracejado: true, seed: 702 });
    const aviso = cx.w >= 420 ? 'TROQUE · desenho da peça' : 'TROQUE', z = Math.min(34, (cx.w - 40) / (aviso.length * 0.62));
    decor(() => E.texto(ctx, aviso, cx.x + cx.w / 2, cx.y + cx.h / 2 + z * 0.36, { papel: 'numero', size: z, align: 'center' }));
  };

  // ---------- as peças das lâminas ----------
  // a etiqueta: um quadro fino com o nome em letra de prancheta (longe do contador do Instagram); devolve onde acaba
  function etiqueta(ctx, k, y = TOP - 16) {
    if (!TX[k]) return y;
    const s = TX[k].toUpperCase(), z = 30, w = E.medir(ctx, s, { papel: 'numero', size: z }) + 44, hh = z + 30;
    E.ret(ctx, L, y, w, hh, { papel: null, r: 4, lw: 3, hachura: false, sombra: false, seed: 5 });
    E.texto(ctx, s, L + 22, y + hh / 2 + z * 0.36, { papel: 'numero', size: z });
    return y + hh;
  }
  // a trilha das dúvidas: uma bolinha por lâmina pergunta, a da vez no destaque e as já respondidas cheias
  function trilha(ctx, lam, y) {
    const ps = SC.LAMINAS.filter((l) => l.tipo === 'pergunta'), i = ps.findIndex((l) => l.n === lam.n);
    if (ps.length < 2 || i < 0) return;
    const passo = 54, x0 = L + 16;
    E.linha(ctx, [[x0, y], [x0 + passo * (ps.length - 1), y]], { lw: 4, seed: 12 });
    ps.forEach((_, j) => E.circulo(ctx, x0 + j * passo, y, j === i ? 18 : 11, { papel: j === i ? 'destaque' : j < i ? 'apoioEscuro' : 'superficie', hachura: false, sombra: false, seed: 13 + j }));
  }
  // o balão da dúvida: o texto à mão, o rosto de quem pergunta à esquerda e a pontinha até ele; devolve onde acaba
  const ALTB = 222;
  function balao(ctx, k, y0) {
    if (!TX[k]) return y0;
    const xb = L + 104, wb = R - xb, hb = ALTB, rx = L + 36, ry = y0 + hb - 60;
    rosto(ctx, rx, ry, 32);
    E.poligono(ctx, [[xb + 6, y0 + hb - 112], [rx + 46, ry - 6], [xb + 6, y0 + hb - 62]], Object.assign({ papel: 'superficie', seed: 60 }, liso));
    E.ret(ctx, xb, y0, wb, hb, { papel: 'superficie', r: 36, seed: 61 });
    E.linha(ctx, [[xb + 2, y0 + hb - 106], [xb + 2, y0 + hb - 68]], { papel: 'superficie', lw: 10, seed: 62 }); // a emenda da pontinha
    P.bloco(ctx, k, { x: xb + 36, y: y0 + 22, w: wb - 72, h: hb - 44 }, { papel: 'mao', sizes: [66, 62, 58, 54, 50, 46], lh: 1.08, valign: 'middle', maxLinhas: 3 });
    return y0 + hb;
  }
  // o detalhe: nota de margem com o fio Coral, encostada no pé da lâmina; devolve onde começa e acaba
  function nota(ctx, k, cx) {
    if (!TX[k]) return { y0: cx.y + cx.h, y1: cx.y + cx.h };
    const r = P.bloco(ctx, k, { x: cx.x + 34, y: cx.y, w: cx.w - 34, h: cx.h }, { sizes: [44, 42, 40, 38, 36], lh: 1.22, valign: 'bottom' });
    E.linha(ctx, [[cx.x + 6, r.y0 + 4], [cx.x + 6, r.y1 + 4]], { papel: 'alerta', lw: 6, seed: 9 });
    return r;
  }
  function desenho(ctx, lam, cx, ...mais) {
    const f = lam.desenho && DS[lam.desenho];
    if (f && cx.w > 40 && cx.h > 40) f(ctx, cx, lam, ...mais);
  }

  // ---------- os moldes de lâmina ----------
  // capa: a etiqueta, o título (a dúvida que puxa as outras), a promessa e o desenho grande embaixo
  P.MOLDE.capa = (ctx, lam) => {
    E.fundo(ctx);
    const [t1, t2] = frases(lam);
    const y0 = etiqueta(ctx, lam.palavras[0]);
    const a = P.titulo(ctx, t1, { x: L, y: y0 + 40, w: LW, h: 400 }, { sizes: [104, 96, 90, 84, 78, 72], lh: 1.06 });
    const b = P.bloco(ctx, t2, { x: L, y: a.y1 + 30, w: LW, h: 150 }, { sizes: [50, 46, 44, 40] });
    const yd = Math.max(b.y1 + 40, 740);
    desenho(ctx, lam, { x: L, y: yd, w: LW, h: BOT - yd }, lam.palavras.slice(1));
  };
  // pergunta: a trilha, a dúvida no balão, a resposta, o desenho que explica e o detalhe no pé
  P.MOLDE.pergunta = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2, f3] = frases(lam);
    trilha(ctx, lam, TOP - 6);
    const yb = balao(ctx, f1, TOP + 34);
    const a = P.titulo(ctx, f2, { x: L, y: yb + 34, w: LW, h: 214 }, { sizes: [64, 60, 56, 52, 48], lh: 1.1 });
    const b = nota(ctx, f3, { x: L, y: BOT - 140, w: LW, h: 140 });
    const yd = a.y1 + 34, yf = TX[f3] ? b.y0 - 34 : BOT;
    desenho(ctx, lam, { x: L, y: yd, w: LW, h: yf - yd }, lam.palavras);
  };
  // resumo: a ficha pautada para salvar, presa com o clipe; uma linha por frase, com o certo na margem, e a fonte no pé.
  // palavras: [etiqueta, fonte]
  P.MOLDE.resumo = (ctx, lam) => {
    E.fundo(ctx);
    const fr = frases(lam).filter((k) => TX[k]), [et, fonte] = lam.palavras;
    const y0 = etiqueta(ctx, et);
    const cx = { x: L, y: y0 + 46, w: LW, h: BOT - 120 - y0 - 46 };
    E.ret(ctx, cx.x, cx.y, cx.w, cx.h, { papel: 'superficie', r: 14, seed: 70 });
    E.linha(ctx, [[cx.x + 104, cx.y + 14], [cx.x + 104, cx.y + cx.h - 14]], { papel: 'alerta', lw: 3, seed: 71 }); // a margem da ficha
    const passo = (cx.h - 40) / Math.max(1, fr.length);
    fr.forEach((k, i) => {
      const y = cx.y + 20 + i * passo;
      if (i) E.linha(ctx, [[cx.x + 20, y], [cx.x + cx.w - 20, y]], { papel: 'apoio', lw: 3, seed: 72 + i });
      certo(ctx, cx.x + 54, y + passo / 2, 1.05);
      P.bloco(ctx, k, { x: cx.x + 134, y: y + 14, w: cx.w - 168, h: passo - 28 }, { papel: 'titulo', sizes: [52, 48, 44, 40, 38, 36], lh: 1.1, valign: 'middle' });
    });
    // o clipe, preso no alto da ficha, em cima da margem (longe do texto)
    const kx = cx.x + 30, ky = cx.y - 42;
    E.ret(ctx, kx, ky, 44, 100, Object.assign({ papel: null, r: 22, lw: 6, seed: 75 }, liso));
    E.ret(ctx, kx + 10, ky + 14, 24, 70, Object.assign({ papel: null, r: 12, lw: 5, seed: 76 }, liso));
    P.fonte(ctx, fonte, { x: L, y: BOT - 80, w: LW, h: 84 }, { cor: apoio(), valign: 'bottom' });
  };
  // texto: a lâmina sem tipo próprio (a ideia grande, o detalhe e o desenho, se houver)
  P.MOLDE.texto = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = frases(lam);
    const y0 = etiqueta(ctx, lam.palavras[0]);
    const a = P.titulo(ctx, f1, { x: L, y: y0 + 40, w: LW, h: 330 }, { sizes: [84, 78, 72, 66, 60], lh: 1.1 });
    const b = nota(ctx, f2, { x: L, y: BOT - 160, w: LW, h: 160 });
    desenho(ctx, lam, { x: L, y: a.y1 + 34, w: LW, h: b.y0 - 34 - a.y1 - 34 }, lam.palavras.slice(1));
  };
})();
