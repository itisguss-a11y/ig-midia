// PRESEME · carrossel · tipo TABELA COMPARATIVA · os moldes de lâmina e o kit do tipo (este arquivo é do tipo e não muda
// de peça para peça).
// A espinha: de 3 a 4 coisas parecidas (as colunas) comparadas em 4 a 6 linhas. A capa traz a pergunta e as colunas,
// cada uma com o seu desenho; cada lâmina do meio é uma linha da tabela, com a célula de cada coluna, o desenho pequeno e
// a tabela montada até ali encolhida no canto (a miniatura: a linha da vez acesa, as de antes preenchidas, as de depois
// vazias); a penúltima é a tabela inteira para print; a última, o que as colunas têm em comum e o que é da equipe.
// Tudo sai da TABELA do score.js (COLUNAS, LINHAS, CAPA, INTEIRA, FECHO): a grade, as células, a miniatura e a tabela
// inteira vêm da mesma lista, então a tabela inteira sempre bate com as lâminas.
// Tipos de lâmina (o score.js monta a ordem sozinho):
//   capa:   [a pergunta], [a frase de baixo] + D rótulo e os nomes das colunas     · desenho: DESENHO.coluna[id]
//   linha:  [o que reparar] + D nome da linha e uma célula D por coluna             · desenho: DESENHO.celula[linha][coluna]
//   tabela: D rótulo, D fontes e a grade inteira (nomes das linhas e células)      · desenho: DESENHO.coluna[id], pequeno
//   comum:  até 2 frases do que as colunas têm em comum e até 2 do que é da equipe + D rótulos e D fontes (cartão escuro)
//   texto:  [a frase grande], [o detalhe] (lâmina simples, para o que não cabe nos outros)
// Célula sem trecho de fonte: o textos.txt diz "—"; a lâmina mostra o cartão tracejado, sem desenho (o peca.js avisa).
// Os desenhos vêm da peça, em film-3-desenhos.js: PRESEME.DESENHO.coluna[id](ctx, cx, cy, s), centrado em cx, cy, em uns
// 240 × 200 px na escala 1; PRESEME.DESENHO.celula[id da linha] = [um desenho por coluna, mesmo formato] (sem ele, vale o
// da coluna); PRESEME.DESENHO.cena.equipe(ctx, caixa), o desenho do fecho (sem ele, a UBS da biblioteca). Desenho parado.
// Nada de cor escrita à mão: tudo pelo kit de estilos (E) e pela biblioteca (globalThis.BIB).
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, TX = globalThis.TEXTOS, SC = globalThis.SCORE, B = globalThis.BIB;
  const DS = P.DESENHO;
  const { L, R, TOP, BOT, W, H } = P;
  const LW = R - L;
  DS.coluna = DS.coluna || {};
  DS.celula = DS.celula || {};
  DS.cena = DS.cena || {};
  const TB = SC.TABELA || { COLUNAS: [], LINHAS: [], CAPA: {}, INTEIRA: {}, FECHO: {} };
  const COLS = TB.COLUNAS || [], LINS = TB.LINHAS || [];
  const D = (k) => TX[k] || '';
  // célula sem trecho de fonte: o texto é só um travessão
  const vazia = (k) => /^\s*[—–-]\s*$/.test(D(k));
  // a cor que não some no fundo (no chapado o fundo é Sálvia) e a que não some em cima do cartão (a superficie)
  const naoSome = (...ps) => ps.find((p) => E.cor(p) !== E.cor('fundo')) || ps[ps.length - 1];
  const noCartao = (...ps) => ps.find((p) => E.cor(p) !== E.cor('superficie')) || ps[ps.length - 1];
  const liso = { sombra: false, hachura: false };

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
  // o retângulo tracejado (a vaga do desenho no molde, a célula sem fonte)
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
  function desenhoColuna(ctx, i, cx, cy, s) {
    const f = COLS[i] && DS.coluna[COLS[i].id];
    if (f) f(ctx, cx, cy, s); else vaga(ctx, cx, cy, s);
  }
  function desenhoCelula(ctx, lin, i, cx, cy, s) {
    const fs = DS.celula[lin.id], f = fs && fs[i];
    if (f) f(ctx, cx, cy, s); else desenhoColuna(ctx, i, cx, cy, s);
  }
  // a maior letra (de sizes) em que todos os textos ks cabem na caixa w × h (para as células da mesma linha, e as da
  // tabela inteira, saírem do mesmo tamanho)
  function mesmaLetra(ctx, ks, papel, sizes, w, h, lh = 1.26) {
    const kz = E.letra(papel)[2];
    for (const z of sizes) {
      if (ks.every((k) => {
        if (!TX[k]) return true;
        const tr = P.DESTAQUE[k], s0 = TX[k], s1 = tr && s0.includes(tr) ? s0.replace(tr, tr.split(' ').join(' ')) : s0;
        const ls = P.equilibrar(ctx, s1, papel, z, w);
        return ls.every((l) => P.larg(ctx, l, papel, z) <= w + 0.5) && (ls.length - 1) * z * kz * lh + z * kz * 1.02 <= h + 0.5;
      })) return z;
    }
    return sizes[sizes.length - 1];
  }
  // a miniatura da tabela, no canto de cima à direita (abaixo do contador "2/9" do Instagram): a grade sem letra, a
  // linha da vez no destaque, as de antes com os riscos de texto, as de depois vazias. A célula sem fonte ganha um risco curto
  function mini(ctx, cur, x, y, w) {
    const n = Math.max(1, COLS.length), m = Math.max(1, LINS.length);
    const lc = Math.round(w * 0.22), cw = (w - lc) / n, hh = 26, rh = 22, h = hh + m * rh + 4;
    const linhaCor = noCartao('apoio', 'apoioEscuro'), risco = noCartao('apoioEscuro', 'tinta');
    E.ret(ctx, x, y, w, h, Object.assign({ papel: 'superficie', r: 10, seed: 700 }, liso));
    for (let i = 0; i < n; i++) E.ret(ctx, x + lc + i * cw + 4, y + 5, cw - 8, hh - 9, Object.assign({ papel: linhaCor, r: 4, seed: 701 + i }, liso));
    for (let j = 0; j < m; j++) {
      const yy = y + hh + j * rh;
      if (j === cur) E.ret(ctx, x + 3, yy + 1, w - 6, rh - 2, Object.assign({ papel: 'destaque', r: 4, seed: 720 + j }, liso));
      if (j <= cur) {
        E.linha(ctx, [[x + 9, yy + rh / 2], [x + lc - 9, yy + rh / 2]], { papel: j === cur ? 'tinta' : risco, lw: 3, seed: 730 + j });
        for (let i = 0; i < n; i++) {
          const xx = x + lc + i * cw, vz = vazia((LINS[j].celulas || [])[i]);
          E.linha(ctx, [[xx + 9, yy + rh / 2], [xx + 9 + (cw - 18) * (vz ? 0.25 : 0.8), yy + rh / 2]], { papel: j === cur ? 'tinta' : risco, lw: 3, seed: 740 + j * 7 + i });
        }
      }
      E.linha(ctx, [[x + 5, yy], [x + w - 5, yy]], { papel: linhaCor, lw: 1.5, seed: 760 + j });
    }
    for (let i = 0; i < n; i++) E.linha(ctx, [[x + lc + i * cw, y + 5], [x + lc + i * cw, y + h - 5]], { papel: linhaCor, lw: 1.5, seed: 780 + i });
    return { x, y, w, h };
  }

  // ---------- os moldes de lâmina ----------
  // capa: o rótulo, a pergunta grande, a frase de baixo e um cartão por coluna (o desenho e o nome); a seta pede o deslize
  P.MOLDE.capa = (ctx, lam) => {
    E.fundo(ctx);
    const C0 = TB.CAPA || {};
    const y0 = rotulo(ctx, C0.rotulo);
    const a = P.titulo(ctx, C0.titulo, { x: L, y: y0 + 4, w: LW, h: 380 }, { sizes: [96, 88, 80, 74, 68, 62, 56], lh: 1.08 });
    const b = TX[C0.sub] ? P.bloco(ctx, C0.sub, { x: L, y: a.y1 + 22, w: LW, h: 150 }, { sizes: [48, 46, 44, 42, 40, 38] }) : a;
    const n = Math.max(1, COLS.length), gap = 22, cw = (LW - gap * (n - 1)) / n;
    const top = b.y1 + 44, ch = Math.min(500, BOT - 30 - top), hn = 112, hd = ch - hn - 26;
    const zn = mesmaLetra(ctx, COLS.map((c) => c.nome), 'titulo', [46, 44, 42, 40, 38, 36, 34, 32, 30], cw - 28, hn - 8, 1.04);
    COLS.forEach((c, i) => {
      const x = L + i * (cw + gap);
      E.ret(ctx, x, top, cw, ch, { papel: 'superficie', r: 24, seed: 600 + i });
      desenhoColuna(ctx, i, x + cw / 2, top + 18 + hd / 2, Math.min(1, (cw - 30) / 260, hd / 230));
      P.bloco(ctx, c.nome, { x: x + 14, y: top + ch - hn - 8, w: cw - 28, h: hn }, { papel: 'titulo', sizes: [zn], align: 'center', valign: 'middle', lh: 1.04 });
    });
    E.seta(ctx, [R - 60, H - 52], [W - 22, H - 56], { papel: E.escuro() ? 'destaque' : 'alerta', lw: 9, curva: -0.12, cabeca: 34, seed: 91 });
  };

  // linha: a miniatura no canto, o nome da linha (rótulo), o que reparar (frase) e um cartão por coluna, com o nome da
  // coluna, o desenho da célula e o texto da célula (todas as células da lâmina na mesma letra)
  P.MOLDE.linha = (ctx, lam) => {
    E.fundo(ctx);
    const j = LINS.findIndex((l) => l.id === lam.linha), lin = LINS[j];
    if (!lin) { P.MOLDE.texto(ctx, lam); return; }
    const MW = 250;
    const mt = mini(ctx, j, R - MW, TOP - 8, MW);
    const y0 = rotulo(ctx, lin.nome, { maxW: LW - MW - 40 });
    const yt = Math.max(y0, mt.y + mt.h + 22);
    const a = TX[lin.frase] ? P.titulo(ctx, lin.frase, { x: L, y: yt, w: LW, h: 250 }, { sizes: [64, 60, 56, 52, 48, 44, 40], lh: 1.1 }) : { y1: yt };
    const n = Math.max(1, COLS.length), gap = 22, cw = (LW - gap * (n - 1)) / n;
    const top = a.y1 + 36, ch = BOT - top, hn = 104;
    const hd = Math.max(120, Math.min(290, ch * 0.4));
    const ycel = top + hn + 14 + hd + 12, hcel = top + ch - ycel - 18;
    const zn = mesmaLetra(ctx, COLS.map((c) => c.nome), 'titulo', [40, 38, 36, 34, 32, 30, 28], cw - 28, hn - 16, 1.04);
    const zc = mesmaLetra(ctx, lin.celulas.filter((k) => !vazia(k)), 'corpo', [48, 46, 44, 42, 40, 38, 36, 34, 32, 30], cw - 32, hcel, 1.12);
    COLS.forEach((c, i) => {
      const x = L + i * (cw + gap), k = lin.celulas[i], vz = vazia(k);
      if (vz) tracejado(ctx, x, top, cw, ch, 810 + i);
      else E.ret(ctx, x, top, cw, ch, { papel: 'superficie', r: 24, seed: 800 + i });
      P.bloco(ctx, c.nome, { x: x + 14, y: top + 8, w: cw - 28, h: hn - 16 }, { papel: 'titulo', sizes: [zn], align: 'center', valign: 'middle', lh: 1.04 });
      E.linha(ctx, [[x + 22, top + hn], [x + cw - 22, top + hn + 2]], { papel: vz ? naoSome('apoio', 'apoioEscuro') : noCartao('apoio', 'apoioEscuro'), lw: 3, tracejado: true, seed: 820 + i });
      if (vz) P.bloco(ctx, k, { x: x + 16, y: top + hn + 14, w: cw - 32, h: ch - hn - 40 }, { papel: 'titulo', sizes: [120, 100], align: 'center', valign: 'middle' });
      else {
        desenhoCelula(ctx, lin, i, x + cw / 2, top + hn + 14 + hd / 2, Math.min(1, (cw - 30) / 260, hd / 230));
        P.bloco(ctx, k, { x: x + 16, y: ycel, w: cw - 32, h: hcel }, { sizes: [zc], align: 'center', valign: 'top', lh: 1.12 });
      }
    });
  };

  // tabela: a grade inteira, para print: o rótulo, os desenhos e os nomes das colunas, uma faixa por linha (o nome da
  // linha à esquerda e as células), as fontes no pé e o tracejado de recortar (aberto no canto do contador)
  P.MOLDE.tabela = (ctx, lam) => {
    E.fundo(ctx);
    const I = TB.INTEIRA || {};
    const m = 34, C = P.CONTADOR;
    E.linha(ctx, [[W - m, C.h + 24], [W - m, H - m], [m, H - m], [m, m + 6], [C.x - 24, m + 6]], { papel: naoSome('apoio', 'apoioEscuro'), lw: 4, seed: 99, tracejado: true });
    const y0 = rotulo(ctx, I.rotulo);
    const fonteH = D(I.fonte) ? 72 : 0;
    const n = Math.max(1, COLS.length), mm = Math.max(1, LINS.length);
    const lc = n >= 4 ? 168 : 196, cw = (LW - lc) / n, hh = 156;
    const top = y0 - 6, bottom = BOT - fonteH - 14, rh = (bottom - top - hh) / mm;
    const zn = mesmaLetra(ctx, COLS.map((c) => c.nome), 'titulo', [32, 30, 28, 26, 24], cw - 16, 62, 1.02);
    COLS.forEach((c, i) => {
      const x = L + lc + i * cw;
      desenhoColuna(ctx, i, x + cw / 2, top + 46, Math.min(0.4, (cw - 20) / 600));
      P.bloco(ctx, c.nome, { x: x + 8, y: top + 88, w: cw - 16, h: 62 }, { papel: 'titulo', sizes: [zn], align: 'center', valign: 'middle', lh: 1.02 });
    });
    const celulas = LINS.flatMap((l) => l.celulas);
    const zl = mesmaLetra(ctx, LINS.map((l) => l.nome), 'titulo', [30, 28, 26, 24], lc - 22, rh - 14, 1.04);
    const zc = mesmaLetra(ctx, celulas.filter((k) => !vazia(k)), 'corpo', [30, 28, 26, 24], cw - 22, rh - 14, 1.08);
    LINS.forEach((lin, j) => {
      const y = top + hh + j * rh;
      if (j % 2 === 0) E.ret(ctx, L - 12, y, LW + 24, rh, Object.assign({ papel: 'superficie', r: 12, seed: 910 + j }, liso));
      P.bloco(ctx, lin.nome, { x: L + 2, y: y + 7, w: lc - 22, h: rh - 14 }, { papel: 'titulo', sizes: [zl], valign: 'middle', lh: 1.04 });
      lin.celulas.forEach((k, i) => {
        const x = L + lc + i * cw;
        P.bloco(ctx, k, { x: x + 11, y: y + 7, w: cw - 22, h: rh - 14 }, { papel: vazia(k) ? 'titulo' : 'corpo', sizes: vazia(k) ? [40] : [zc], align: 'center', valign: 'middle', lh: 1.08 });
      });
    });
    for (let i = 0; i < n; i++) { const x = L + lc + i * cw; E.linha(ctx, [[x, top + hh - 8], [x, bottom]], { papel: naoSome('apoio', 'apoioEscuro'), lw: 2, seed: 950 + i }); }
    if (fonteH) P.fonte(ctx, I.fonte, { x: L, y: BOT - fonteH, w: LW, h: fonteH }, { cor: E.escuro() ? 'salvia' : 'apoioEscuro', valign: 'bottom', sizes: [28, 26, 24], maxLinhas: 2 });
  };

  // comum: o cartão escuro do fecho. Em cima, o que as colunas têm em comum (cada frase com o ✓); embaixo, o que é da
  // equipe, com o desenho do fecho à direita (DESENHO.cena.equipe; sem ele, a UBS da biblioteca) e as fontes no pé
  P.MOLDE.comum = (ctx, lam) => {
    E.fundo(ctx, { tipo: 'escuro' });
    const F = TB.FECHO || {};
    const fr = (F.frases || []).filter((k) => TX[k]), fe = (F.frasesEquipe || []).filter((k) => TX[k]);
    let y = rotulo(ctx, F.rotulo, { cor: E.escuro() ? 'destaque' : 'papel' }) + 6;
    const z1 = mesmaLetra(ctx, fr, 'titulo', [60, 56, 52, 48, 44, 40], LW - 88, 220, 1.1);
    fr.forEach((k, j) => {
      marca(ctx, L + 30, y + z1 * 0.62, 0.7, 'marca');
      const b = P.bloco(ctx, k, { x: L + 88, y, w: LW - 88, h: 230 }, { papel: 'titulo', sizes: [z1], lh: 1.1, cor: 'papel', corTrecho: 'marca' });
      y = b.y1 + (j < fr.length - 1 ? 30 : 40);
    });
    if (fe.length || D(F.equipe)) {
      E.linha(ctx, [[L, y], [R, y + 3]], { papel: 'salvia', lw: 3, seed: 101, tracejado: true });
      y += 26;
      if (D(F.equipe)) {
        E.texto(ctx, D(F.equipe), L + 2, y + 44, { papel: 'mao', size: 48, cor: E.escuro() ? 'destaque' : 'papel' });
        const w = E.medir(ctx, D(F.equipe), { papel: 'mao', size: 48 });
        E.linha(ctx, [[L, y + 64], [L + w + 10, y + 61]], { papel: E.escuro() ? 'destaque' : 'alerta', lw: 5, seed: 32 });
        y += 92;
      }
      const icW = 230, fundoF = BOT - (D(F.fonte) ? 104 : 0);
      const ze = mesmaLetra(ctx, fe, 'corpo', [46, 44, 42, 40, 38, 36, 34], LW - icW - 30, Math.max(60, (fundoF - y) / Math.max(1, fe.length) - 24), 1.2);
      const y1 = y;
      fe.forEach((k) => { const b = P.bloco(ctx, k, { x: L, y, w: LW - icW - 30, h: fundoF - y }, { sizes: [ze], lh: 1.2, cor: 'papel', corTrecho: 'marca' }); y = b.y1 + 22; });
      const box = { x: R - icW, y: y1, w: icW, h: Math.max(180, Math.min(fundoF - y1, y - y1)) };
      if (DS.cena.equipe) DS.cena.equipe(ctx, box);
      else if (B) B.ubsIcone(ctx, { x: box.x + box.w / 2, y: box.y + Math.min(box.h, 220) / 2 + 30, s: 1.2 });
    }
    if (D(F.fonte)) P.fonte(ctx, F.fonte, { x: L, y: BOT - 96, w: LW, h: 96 }, { cor: 'salvia', valign: 'bottom', sizes: [30, 28, 26, 24], maxLinhas: 3 });
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
  P.KIT = { rotulo, marca, tracejado, vaga, vazia, naoSome, noCartao, mesmaLetra, mini, desenhoColuna, desenhoCelula, liso };
})();
