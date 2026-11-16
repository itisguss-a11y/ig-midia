// PRESEME · carrossel · tipo MACETE PARA A PROVA · os moldes de lâmina e o kit do tipo (FIXO: não muda de peça para peça).
// O carrossel que se salva para decorar. A capa traz a pergunta que cai e as fichas do macete; a lâmina 2, o macete
// inteiro (uma ficha com a letra grande por peça e o nome dela, com a palavra da letra no destaque) e a frase que gruda;
// depois, uma lâmina por peça (a ficha grande, o nome, o que significa, o desenho que explica e o exemplo da vida real,
// com a trilha das fichas em cima); a pegadinha (o selo carimbado, o que confunde com o quê e o desenho que compara); e
// o cartão para print, recortado (borda tracejada e tesoura), uma linha por peça e a regra no pé.
// As fichas, a trilha e o cartão leem o macete do score.js (SCORE.MACETE): o chat 1 só escreve as letras, os nomes, as
// definições e os exemplos. Um molde por tipo de lâmina: PRESEME.MOLDE[tipo] (capa, macete, peca, pegadinha, cartao,
// texto). O desenho do assunto é PRESEME.DESENHO[lam.desenho](ctx, caixa, lam, palavras), em film-3-desenhos.js, que
// carrega depois; aqui fica o troque. Em PRESEME.KIT, as peças que servem a qualquer macete: a ficha, o nome com a
// letra no destaque, a tesoura, o certo e o errado. Estilo padrão: giz na lousa. Desenho parado.
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, TX = globalThis.TEXTOS, DS = P.DESENHO, SC = globalThis.SCORE, G = globalThis.G;
  const { L, R, TOP, BOT, CX } = P;
  const LW = R - L;
  const liso = { hachura: false, sombra: false };
  const decor = (fn) => G.decor(fn);
  const MAC = SC.MACETE || [];
  // as frases da lâmina na ordem do score.js, com o lugar de quem foi apagada (a frase 2 apagada não vira a frase 3)
  const frases = (lam) => (lam.todas || lam.linhas).filter((k) => typeof k === 'number');

  // ---------- o kit do tipo (PRESEME.KIT) ----------
  // a cor da letra que se lê em cima de um preenchimento (papel): clara no escuro; no claro, a do texto, ou Noite na lousa
  const corSobre = (papel) => (E.escura(E.cor(papel)) ? 'papel' : E.escuro() ? 'noite' : 'texto');
  // a cor da fonte e do certo: Folha no claro, Sálvia na lousa (Folha some no Floresta)
  const apoio = () => (E.escuro() ? 'salvia' : 'apoioEscuro');
  const kz = (papel) => E.letra(papel)[2];
  const semAcento = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  // a palavra do nome que começa com a letra da ficha ("Atendimento integral" e "I" dão "integral"); sem ela, null
  function palavraDaLetra(nome, letra) {
    const l = semAcento(letra).replace(/[^a-z0-9]/g, '');
    if (!nome || !l) return null;
    const w = String(nome).split(/\s+/).find((x) => semAcento(x).startsWith(l));
    return w ? w.replace(/[.,;:!?]+$/, '') : null;
  }
  // a ficha: o quadrado com a letra grande (x, y é o canto de cima à esquerda; t é o lado). o.vez: a da vez, no
  // destaque; o.apagada: a que ainda não chegou, só o contorno; o.sombra: a sombra do estilo
  function ficha(ctx, k, x, y, t, o = {}) {
    const papel = o.vez ? 'destaque' : o.apagada ? null : 'superficie';
    E.ret(ctx, x, y, t, t, { papel, r: Math.max(8, t * 0.14), lw: Math.max(3, Math.min(7, t * 0.035)), seed: o.seed || 80, sombra: !!o.sombra, hachura: false });
    const s = TX[k] || '';
    if (!s) return;
    let z = t * 0.66;
    while (z > 18 && E.medir(ctx, s, { papel: 'titulo', size: z }) > t * 0.8) z -= 2;
    const cor = papel ? corSobre(papel) : 'texto';
    E.texto(ctx, s, x + t / 2, y + t / 2 + z * kz('titulo') * 0.36, { papel: 'titulo', size: z, align: 'center', cor });
  }
  // a tesoura do recorte, deitada (x, y é o meio dela, no vão que a linha tracejada do cartão deixa para ela)
  function tesoura(ctx, x, y, s = 1) {
    E.circulo(ctx, x - 22 * s, y - 15 * s, 13 * s, Object.assign({ papel: null, lw: 5, seed: 150 }, liso));
    E.circulo(ctx, x - 22 * s, y + 15 * s, 13 * s, Object.assign({ papel: null, lw: 5, seed: 151 }, liso));
    E.linha(ctx, [[x - 10 * s, y - 8 * s], [x + 46 * s, y + 12 * s]], { lw: 5, seed: 152 });
    E.linha(ctx, [[x - 10 * s, y + 8 * s], [x + 46 * s, y - 12 * s]], { lw: 5, seed: 153 });
  }
  // o certo e o errado (x, y é o centro; s a escala)
  const certo = (ctx, x, y, s = 1, papel = apoio()) => E.linha(ctx, [[x - 22 * s, y], [x - 6 * s, y + 18 * s], [x + 26 * s, y - 22 * s]], { papel, lw: 9 * s, seed: 30 });
  const errado = (ctx, x, y, s = 1, papel = 'alerta') => { for (const d of [-1, 1]) E.linha(ctx, [[x - 20 * s, y - 20 * s * d], [x + 20 * s, y + 20 * s * d]], { papel, lw: 9 * s, seed: 31 + d }); };
  P.KIT = { liso, decor, corSobre, apoio, palavraDaLetra, ficha, tesoura, certo, errado };

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
  // a trilha das fichas: uma ficha pequena por peça do macete; a da vez no destaque, as que ainda não chegaram só no contorno
  function trilha(ctx, i, y, t = 60) {
    const gap = 14;
    MAC.forEach((m, j) => ficha(ctx, m.letra, L + j * (t + gap), y, t, { vez: j === i, apagada: j > i, seed: 90 + j }));
    return y + t;
  }
  // o exemplo da vida real: nota de margem com o fio Coral, encostada no pé da lâmina; devolve onde começa e acaba
  function nota(ctx, k, cx) {
    if (!TX[k]) return { y0: cx.y + cx.h, y1: cx.y + cx.h };
    const r = P.bloco(ctx, k, { x: cx.x + 34, y: cx.y, w: cx.w - 34, h: cx.h }, { sizes: [46, 44, 42, 40, 38, 36], lh: 1.22, valign: 'bottom' });
    E.linha(ctx, [[cx.x + 6, r.y0 + 4], [cx.x + 6, r.y1 + 4]], { papel: 'alerta', lw: 6, seed: 9 });
    return r;
  }
  // o nome com a palavra da letra no destaque, na caixa (a letra 'Dnn' e o nome 'Dnn' vêm do MACETE)
  const nome = (ctx, m, cx, o = {}) => P.bloco(ctx, m.nome, cx, Object.assign({ papel: 'titulo', lh: 1.06, valign: 'middle', destaque: palavraDaLetra(TX[m.nome], TX[m.letra]) }, o));
  function desenho(ctx, lam, cx, ...mais) {
    const f = lam.desenho && DS[lam.desenho];
    if (f && cx.w > 40 && cx.h > 40) f(ctx, cx, lam, ...mais);
  }

  // ---------- os moldes de lâmina ----------
  // capa: a etiqueta, a pergunta que cai (o título), a promessa e as fichas do macete na mesa, embaixo (o gancho)
  P.MOLDE.capa = (ctx, lam) => {
    E.fundo(ctx);
    const [t1, t2] = frases(lam);
    const y0 = etiqueta(ctx, lam.palavras[0]);
    const a = P.titulo(ctx, t1, { x: L, y: y0 + 44, w: LW, h: 430 }, { sizes: [104, 96, 90, 84, 78, 72, 66], lh: 1.06 });
    const b = P.bloco(ctx, t2, { x: L, y: a.y1 + 34, w: LW, h: 250 }, { sizes: [50, 46, 44, 40, 38, 36, 34] });
    const n = MAC.length, gap = 30, t = Math.min(230, (LW - gap * (n - 1)) / Math.max(1, n));
    const yt = Math.max(b.y1 + 70, BOT - t - 50), x0 = CX - (n * t + (n - 1) * gap) / 2;
    MAC.forEach((m, j) => ficha(ctx, m.letra, x0 + j * (t + gap), yt + (j % 2 ? 18 : -10), t, { seed: 100 + j, sombra: true }));
    if (lam.desenho && DS[lam.desenho]) desenho(ctx, lam, { x: L, y: b.y1 + 30, w: LW, h: yt - b.y1 - 60 }, lam.palavras.slice(1));
  };
  // macete: a resposta à pergunta da capa, uma linha por peça (a ficha e o nome), a frase que gruda e a fonte
  P.MOLDE.macete = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = frases(lam), fonte = lam.palavras[0];
    const a = P.titulo(ctx, f1, { x: L, y: TOP - 6, w: LW, h: 270 }, { sizes: [64, 60, 56, 52, 48, 44], lh: 1.1 });
    const yF = BOT - 100; // a fonte cabe em até três linhas (a letra de pixel é larga)
    const b = TX[f2] ? P.bloco(ctx, f2, { x: L, y: yF - 34 - 160, w: LW, h: 160 }, { papel: 'titulo', sizes: [58, 54, 50, 46, 42, 40], lh: 1.1, valign: 'bottom' }) : { y0: yF - 34, y1: yF - 34 };
    const n = MAC.length, y0 = a.y1 + 46, y1 = b.y0 - 46, passo = (y1 - y0) / Math.max(1, n), t = Math.max(70, Math.min(200, passo - 24));
    MAC.forEach((m, j) => {
      const y = y0 + j * passo + (passo - t) / 2;
      ficha(ctx, m.letra, L, y, t, { seed: 110 + j, sombra: true });
      nome(ctx, m, { x: L + t + 44, y: y - 6, w: LW - t - 44, h: t + 12 }, { sizes: [76, 70, 64, 60, 56, 52, 48, 44, 40], maxLinhas: 2 });
    });
    if (TX[f2]) E.linha(ctx, [[L, b.y0 - 24], [L + 160, b.y0 - 24]], { papel: 'alerta', lw: 6, seed: 118 });
    P.fonte(ctx, fonte, { x: L, y: yF, w: LW, h: 106 }, { cor: apoio(), valign: 'bottom', maxLinhas: 3 });
  };
  // peca: a trilha das fichas, a ficha grande da vez com o nome, o que significa, o desenho que explica e, no pé, o
  // exemplo da vida real. palavras: [letra, nome, ...as do desenho]
  P.MOLDE.peca = (ctx, lam) => {
    E.fundo(ctx);
    const i = lam.peca, m = MAC[i] || { letra: lam.palavras[0], nome: lam.palavras[1] }, [fd, fe] = frases(lam);
    const yt = trilha(ctx, i, TOP - 40, 58);
    const yh = yt + 44, t = 196;
    ficha(ctx, m.letra, L, yh, t, { vez: true, seed: 120 + i, sombra: true });
    nome(ctx, m, { x: L + t + 40, y: yh - 6, w: LW - t - 40, h: t + 12 }, { sizes: [80, 74, 68, 64, 60, 56, 52, 48], maxLinhas: 3 });
    const a = P.bloco(ctx, fd, { x: L, y: yh + t + 40, w: LW, h: 210 }, { sizes: [54, 50, 48, 46, 44, 40], lh: 1.2 });
    const b = nota(ctx, fe, { x: L, y: BOT - 156, w: LW, h: 156 });
    const yd = a.y1 + 34, yf = TX[fe] ? b.y0 - 34 : BOT;
    desenho(ctx, lam, { x: L, y: yd, w: LW, h: yf - yd }, lam.palavras.slice(2));
  };
  // pegadinha: o selo carimbado, o que a prova confunde com o quê, o desenho que compara e o detalhe que desfaz.
  // palavras: [selo, ...as do desenho]
  P.MOLDE.pegadinha = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = frases(lam), [selo, ...resto] = lam.palavras;
    let ya = TOP - 10;
    if (TX[selo]) {
      const z = 52, w = E.medir(ctx, TX[selo].toUpperCase(), { papel: 'titulo', size: z }) + 60;
      E.carimbo(ctx, TX[selo], L + w / 2 + 10, TOP + 26, { size: z, rot: -0.07, seed: 130 });
      ya = TOP + 110;
    }
    const a = P.titulo(ctx, f1, { x: L, y: ya, w: LW, h: 280 }, { sizes: [66, 62, 58, 54, 50, 46], lh: 1.1 });
    const b = nota(ctx, f2, { x: L, y: BOT - 176, w: LW, h: 176 });
    const yd = a.y1 + 34, yf = TX[f2] ? b.y0 - 34 : BOT;
    desenho(ctx, lam, { x: L, y: yd, w: LW, h: yf - yd }, resto);
  };
  // cartao: o cartão para print, recortado (borda tracejada e a tesoura no canto): o título, uma linha por peça com a
  // ficha pequena (o nome no destaque) e a regra no pé; a fonte fica fora do cartão. palavras: [título, fonte]
  P.MOLDE.cartao = (ctx, lam) => {
    E.fundo(ctx);
    const fr = frases(lam), n = MAC.length, linhas = fr.slice(0, n), regra = fr[n], [tit, fonte] = lam.palavras;
    const cx = { x: L - 6, y: TOP - 10, w: LW + 12, h: BOT - 130 - (TOP - 10) };
    E.ret(ctx, cx.x, cx.y, cx.w, cx.h, Object.assign({ papel: 'superficie', contorno: false, r: 18, seed: 140 }, liso));
    // a borda tracejada dá a volta e deixa o vão da tesoura, no alto à esquerda
    const xs = [cx.x, cx.x + cx.w], ys = [cx.y, cx.y + cx.h], xt = cx.x + 150;
    E.linha(ctx, [[xt + 62, ys[0]], [xs[1], ys[0]], [xs[1], ys[1]], [xs[0], ys[1]], [xs[0], ys[0]], [xt - 52, ys[0]]], { lw: 4, tracejado: true, seed: 141 });
    tesoura(ctx, xt, cx.y, 1);
    const pad = 44, xi = cx.x + pad, wi = cx.w - pad * 2;
    const a = P.titulo(ctx, tit, { x: xi, y: cx.y + 46, w: wi, h: 150 }, { sizes: [64, 60, 56, 52, 48, 44], lh: 1.06, maxLinhas: 2 });
    const yr = cx.y + cx.h - pad - 120;
    let y = a.y1 + 34;
    const passo = (yr - 30 - y) / Math.max(1, n), t = Math.max(60, Math.min(112, passo - 26));
    linhas.forEach((k, j) => {
      const m = MAC[j] || {}, yy = y + j * passo;
      if (j) E.linha(ctx, [[xi, yy], [xi + wi, yy]], { papel: 'apoio', lw: 3, seed: 142 + j });
      ficha(ctx, m.letra, xi, yy + (passo - t) / 2, t, { seed: 145 + j });
      const s = TX[k] || '', nm = TX[m.nome] || '', trecho = nm && semAcento(s).startsWith(semAcento(nm)) ? s.slice(0, nm.length) : null;
      P.bloco(ctx, k, { x: xi + t + 30, y: yy + 12, w: wi - t - 30, h: passo - 24 }, { sizes: [46, 44, 42, 40, 38, 36, 34], lh: 1.16, valign: 'middle', destaque: trecho });
    });
    E.linha(ctx, [[xi, yr - 12], [xi + wi, yr - 12]], { papel: 'alerta', lw: 5, seed: 150 });
    P.bloco(ctx, regra, { x: xi, y: yr, w: wi, h: 120 }, { papel: 'titulo', sizes: [48, 46, 44, 42, 40, 38, 36], lh: 1.1, valign: 'middle' });
    P.fonte(ctx, fonte, { x: L, y: BOT - 112, w: LW, h: 118 }, { cor: apoio(), valign: 'bottom', maxLinhas: 3 });
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
