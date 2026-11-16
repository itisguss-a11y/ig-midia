// PRESEME · carrossel · tipo CASO, ARRASTE PARA A RESPOSTA · os moldes de lâmina e o kit do tipo (este arquivo é do
// tipo e não muda de peça para peça).
// A espinha: a capa é o caso (a pessoa, onde ela está, a ficha com as pistas); a 2ª lâmina faz a pergunta com as
// opções A, B e C e puxa o deslize com a seta do "arraste" na borda; a resposta só aparece depois de arrastar: a letra
// certa e o selo de cada opção (CERTA, ERRADA ou PODE SER); depois, o porquê desenhado de cada opção (uma lâmina por
// opção ou por ideia), o dado de Roraima (se houver fonte), o que a equipe faz na atenção primária, a prevenção e o
// cartão-resumo para salvar.
// O veredito de cada opção sai da primeira frase da primeira lâmina de porquê dela, que começa com Certa, Errada ou Pode
// ser (como no reel caso com escolha). O peca.js trava a peça quando isso não bate.
// Tipos de lâmina (o score.js diz qual lâmina usa qual):
//   caso:     [o caso], [a frase de baixo] + D rótulo e as pistas da ficha (D)      · desenho da peça: cena.caso
//   pergunta: [a pergunta] e as opções (SCORE.OPCOES) + D rótulo, D arraste          · sem desenho (nada de resposta aqui)
//   resposta: [a resposta, com a letra], [o termo explicado] + D rótulo              · os cartões com os selos; cena.resposta
//   porque:   [o veredito explicado], [a frase de baixo] + D rótulos do desenho; no ROTEIRO, opcao: 'A', 'B'...
//   dado:     [o fato], [o que ele quer dizer] + D rótulo, D fonte e os pares D nome, D número (colunas)
//   lista:    [a frase], [a frase de baixo] + D rótulo e de 2 a 6 itens (D), cada um com o desenho de DESENHO.item[id]
//   resumo:   de 2 a 4 frases + D rótulo e D fontes (cartão escuro, com o tracejado de recortar)
//   texto:    [a frase grande], [o detalhe] (lâmina simples, para o que não cabe nos outros)
// O desenho de cada lâmina vem da peça, em film-3-desenhos.js: PRESEME.DESENHO.cena[id](ctx, caixa, lam, extra) e, nas
// lâminas de lista, PRESEME.DESENHO.item[id] = [um desenho por item (ctx, cx, cy, s)]. Lâmina sem desenho sai só com o
// texto. Desenho parado. Nada de cor escrita à mão: tudo pelo kit de estilos (E) e pela biblioteca (globalThis.BIB).
(function () {
  const G = globalThis.G, U = globalThis.U, E = globalThis.ESTILOS, P = globalThis.PRESEME, TX = globalThis.TEXTOS, SC = globalThis.SCORE;
  const DS = P.DESENHO;
  const { L, R, TOP, BOT, W, H } = P;
  const LW = R - L;
  DS.cena = DS.cena || {};
  DS.item = DS.item || {};
  const LETRA = ['A', 'B', 'C', 'D'];
  const OP = () => SC.OPCOES || [];
  const D = (k) => TX[k] || '';
  const cena = (ctx, lam, box, extra) => { const f = DS.cena[lam.id]; if (f && box.h > 40 && box.w > 40) f(ctx, box, lam, extra || {}); };

  // ---------- o veredito de cada opção ----------
  // certa: ✓ e o selo CERTA (Folha; Marca-texto na lousa); errada: ✗ e ERRADA (Coral); pode: ? e PODE SER (Floresta;
  // Sálvia na lousa). As cores são as do reel caso com escolha, para os dois tipos falarem a mesma língua.
  const PAPEL = { certa: () => (E.escuro() ? 'destaque' : 'folha'), errada: () => 'coral', pode: () => (E.escuro() ? 'apoio' : 'tinta') };
  const PALAVRA = { certa: 'CERTA', errada: 'ERRADA', pode: 'PODE SER' };
  const porquesDe = (i) => SC.LAMINAS.filter((l) => l.tipo === 'porque' && String(l.opcao || '').toUpperCase() === LETRA[i]);
  function veredito(i) {
    const l = porquesDe(i)[0];
    const s = l && l.linhas.length ? String(TX[l.linhas[0]] || '').trim() : '';
    const m = /^(pode\s+ser|certa|certo|errada|errado)\b/i.exec(s);
    if (!m) return { chave: null, palavra: '', valido: false };
    const w = m[1].toLowerCase().replace(/\s+/g, ' ');
    const chave = w === 'pode ser' ? 'pode' : w.startsWith('cert') ? 'certa' : 'errada';
    return { chave, palavra: PALAVRA[chave], papel: PAPEL[chave](), valido: true };
  }

  // ---------- o kit do tipo ----------
  // o rótulo da lâmina (a primeira palavra D): à mão, em cima à esquerda, com o risco embaixo (longe do contador 1/8)
  function rotulo(ctx, k, { cor } = {}) {
    const y = TOP - 4;
    if (!D(k)) return y + 10;
    const c = cor || (E.escuro() ? 'destaque' : 'texto');
    E.texto(ctx, D(k), L + 2, y + 44, { papel: 'mao', size: 48, cor: c });
    const w = E.medir(ctx, D(k), { papel: 'mao', size: 48 });
    E.linha(ctx, [[L, y + 64], [L + w + 10, y + 61]], { papel: E.escuro() ? 'destaque' : 'alerta', lw: 5, seed: 31 });
    return y + 96;
  }
  // a marca: ✓, ✗ ou ? (s = escala)
  function marca(ctx, chave, x, y, s = 1, papel) {
    if (!chave) return;
    const p = papel || PAPEL[chave]();
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (chave === 'certa') E.linha(ctx, [[-30, 2], [-8, 26], [34, -30]], { papel: p, lw: 13, seed: 51 });
    else if (chave === 'errada') {
      E.linha(ctx, [[-28, -28], [28, 28]], { papel: p, lw: 13, seed: 52 });
      E.linha(ctx, [[28, -28], [-28, 28]], { papel: p, lw: 13, seed: 53 });
    } else {
      E.linha(ctx, [[-22, -18], [-18, -34], [0, -40], [20, -32], [22, -14], [6, -2], [0, 12]], { papel: p, lw: 12, seed: 54 });
      E.circulo(ctx, 0, 34, 8, { papel: p, seed: 55, sombra: false, hachura: false });
    }
    ctx.restore();
  }
  // o X de Coral por cima de um desenho (o mito desenhado aparece riscado: regra da ficha)
  function risco(ctx, cx, cy, r = 90, seed = 70) {
    E.linha(ctx, [[cx - r, cy - r], [cx + r, cy + r]], { papel: 'coral', lw: 14, seed });
    E.linha(ctx, [[cx + r, cy - r], [cx - r, cy + r]], { papel: 'coral', lw: 14, seed: seed + 1 });
  }
  // o círculo da letra (A, B, C); vez: o da opção da lâmina, no destaque
  function letra(ctx, i, x, y, r = 36, { vez = false } = {}) {
    E.circulo(ctx, x, y, r, { papel: vez ? 'destaque' : null, seed: 600 + i, lw: 4, sombra: false, hachura: false });
    const corL = vez ? (E.escuro() ? 'floresta' : 'texto') : 'texto';
    E.texto(ctx, LETRA[i], x, y + r * 0.38, { papel: 'numero', size: Math.round(r * 1.05), align: 'center', cor: corL });
  }
  // o cartão deitado de uma opção (pergunta): a letra à esquerda e o texto
  function cartao(ctx, i, x, y, w, h) {
    const n = OP()[i];
    if (!TX[n]) return;
    E.ret(ctx, x, y, w, h, { papel: 'superficie', r: 26, seed: 620 + i });
    const r = Math.min(40, h * 0.3);
    letra(ctx, i, x + 30 + r, y + h / 2, r);
    P.bloco(ctx, n, { x: x + 60 + 2 * r, y: y + 14, w: w - 90 - 2 * r, h: h - 28 }, { sizes: [58, 54, 50, 46, 42, 38], valign: 'middle', maxLinhas: 2, lh: 1.1 });
  }
  // o cartão em pé (resposta): a letra no alto e o texto; o selo vai embaixo dele
  function cartaoEmPe(ctx, i, x, y, w, h, { vez = false } = {}) {
    const n = OP()[i];
    if (!TX[n]) return;
    E.ret(ctx, x, y, w, h, { papel: 'superficie', r: 24, seed: 640 + i });
    letra(ctx, i, x + w / 2, y + 58, 34, { vez });
    P.bloco(ctx, n, { x: x + 18, y: y + 106, w: w - 36, h: h - 120 }, { sizes: [40, 38, 36, 34, 32, 30], align: 'center', valign: 'middle', maxLinhas: 3, lh: 1.08 });
  }
  const larguraSelo = (ctx, palavra, size) => E.medir(ctx, palavra || 'ERRADA', { papel: 'titulo', size }) + 60;
  function selo(ctx, i, cx, cy, { size = 50, rot = -0.08 } = {}) {
    const v = veredito(i);
    if (!v.valido) return;
    E.carimbo(ctx, v.palavra, cx, cy, { rot, papel: v.papel, size, seed: 41 + i * 7 });
  }
  // a fileira dos cartões em pé, cada um com o selo embaixo (resposta)
  function fileira(ctx, { y, h = 230, vez = -1 } = {}) {
    const n = OP().length, gap = 24, w = (LW - gap * (n - 1)) / n;
    let z = 50;
    while (z > 28 && [0, 1, 2, 3].slice(0, n).some((i) => veredito(i).valido && larguraSelo(ctx, veredito(i).palavra, z) > w - 4)) z -= 2;
    for (let i = 0; i < n; i++) {
      const x = L + i * (w + gap);
      cartaoEmPe(ctx, i, x, y, w, h, { vez: vez === i });
      selo(ctx, i, x + w / 2, y + h + 22 + z * 0.75, { size: z, rot: [-0.1, 0.05, -0.07, 0.04][i % 4] });
    }
    return { bottom: y + h + 22 + z * 1.5 };
  }
  // o cabeçalho do porquê: a letra da opção, o texto dela e o selo pequeno à direita
  function cabecalho(ctx, i) {
    const n = OP()[i], y = TOP + 4;
    const v = veredito(i), zs = 40, ws = v.valido ? larguraSelo(ctx, v.palavra, zs) : 0;
    letra(ctx, i, L + 38, y + 40, 38, { vez: true });
    const t = P.bloco(ctx, n, { x: L + 96, y: y, w: LW - 96 - ws - 30, h: 84 }, { papel: 'titulo', sizes: [54, 50, 46, 42, 38, 34], valign: 'middle', maxLinhas: 2, lh: 1.05 });
    if (v.valido) E.carimbo(ctx, v.palavra, R - ws / 2 - 6, y + 40, { rot: -0.1, papel: v.papel, size: zs, seed: 41 + i * 7 });
    const yb = Math.max(y + 88, t.y1 + 10);
    E.linha(ctx, [[L, yb + 6], [R, yb + 8]], { papel: 'apoio', lw: 3, seed: 81 + i, tracejado: true });
    return yb + 14;
  }
  // a ficha do caso: a prancheta com as pistas, cada uma com o ✓
  function ficha(ctx, b, pistas) {
    E.ret(ctx, b.x, b.y, b.w, b.h, { papel: 'apoioEscuro', r: 18, seed: 680 });
    E.ret(ctx, b.x + 20, b.y + 34, b.w - 40, b.h - 54, { papel: 'superficie', r: 8, seed: 681, hachura: false });
    E.ret(ctx, b.x + b.w / 2 - 60, b.y - 14, 120, 40, { papel: 'tinta', r: 10, seed: 682, sombra: false, hachura: false });
    const n = Math.max(1, pistas.length), passo = (b.h - 84) / n;
    pistas.forEach((k, j) => {
      const yc = b.y + 58 + passo * (j + 0.5);
      marca(ctx, 'certa', b.x + 64, yc, 0.55, E.escuro() ? 'destaque' : 'folha');
      P.bloco(ctx, k, { x: b.x + 100, y: yc - passo / 2 + 6, w: b.w - 128, h: passo - 12 }, { papel: 'mao', sizes: [42, 40, 38, 36, 34, 32, 30], valign: 'middle', maxLinhas: 2, lh: 1.02 });
    });
  }
  // o "arraste": a frase à mão e a seta que sai pela borda direita da lâmina, puxando o deslize (não imita o Instagram:
  // é a seta de giz, lápis ou carimbo do estilo da vez)
  function arraste(ctx, k, y) {
    const corSeta = E.escuro() ? 'destaque' : 'alerta';
    if (D(k)) {
      const z = 46, w = E.medir(ctx, D(k), { papel: 'mao', size: z });
      E.texto(ctx, D(k), R - 120 - w, y + 14, { papel: 'mao', size: z });
      E.seta(ctx, [R - 104, y], [W - 22, y - 4], { papel: corSeta, lw: 9, curva: -0.12, cabeca: 34, seed: 91 });
    } else E.seta(ctx, [R - 60, y], [W - 22, y - 4], { papel: corSeta, lw: 9, curva: -0.12, cabeca: 34, seed: 91 });
  }

  // a maior letra (de sizes) em que todos os textos ks cabem na caixa w × h (para frases irmãs saírem do mesmo tamanho)
  function mesmaLetra(ctx, ks, papel, sizes, w, h, lh = 1.26) {
    const kz = E.letra(papel)[2];
    for (const z of sizes) {
      if (ks.every((k) => {
        if (!TX[k]) return true;
        const tr = P.DESTAQUE[k], s0 = TX[k], s1 = tr && s0.includes(tr) ? s0.replace(tr, tr.split(' ').join('\u00a0')) : s0;
        const ls = P.equilibrar(ctx, s1, papel, z, w);
        return ls.every((l) => P.larg(ctx, l, papel, z) <= w + 0.5) && (ls.length - 1) * z * kz * lh + z * kz * 1.02 <= h + 0.5;
      })) return z;
    }
    return sizes[sizes.length - 1];
  }

  // ---------- os moldes de lâmina ----------
  P.MOLDE.caso = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas, [rot, ...pistas] = lam.palavras;
    const y0 = rotulo(ctx, rot);
    const a = P.titulo(ctx, f1, { x: L, y: y0 + 4, w: LW, h: 330 }, { sizes: [84, 78, 72, 66, 60, 56], lh: 1.1 });
    const b = f2 ? P.bloco(ctx, f2, { x: L, y: a.y1 + 22, w: LW, h: 140 }, { sizes: [48, 46, 42, 40, 38] }) : a;
    const top = b.y1 + 40, box = { x: L, y: top, w: LW, h: BOT - top };
    const fw = pistas.length ? Math.min(430, LW * 0.47) : 0;
    const fh = Math.min(box.h - 24, 110 + Math.max(1, pistas.length) * 112);
    const fb = { x: R - fw, y: top + 20 + Math.max(0, (box.h - 20 - fh) / 2), w: fw, h: fh };
    cena(ctx, lam, box, { ficha: pistas.length ? fb : null, livre: { x: L, y: top, w: LW - fw - (fw ? 24 : 0), h: box.h } });
    if (pistas.length) ficha(ctx, fb, pistas);
    arraste(ctx, null, H - 48);
  };

  P.MOLDE.pergunta = (ctx, lam) => {
    E.fundo(ctx);
    const fq = lam.linhas.find((n) => !OP().includes(n)), [rot, arr] = lam.palavras;
    const y0 = rotulo(ctx, rot);
    const q = P.titulo(ctx, fq, { x: L, y: y0 + 10, w: LW, h: 250 }, { sizes: [128, 116, 104, 96, 88, 80, 72] });
    const n = Math.max(1, OP().length), gap = 30, top = q.y1 + 64, baixo = H - 150;
    const h = Math.min(178, (baixo - top - gap * (n - 1)) / n);
    const y1 = top + (baixo - top - (n * h + gap * (n - 1))) / 2;
    OP().forEach((k, i) => cartao(ctx, i, L, y1 + i * (h + gap), LW - 40, h));
    arraste(ctx, arr, BOT - 18);
  };

  P.MOLDE.resposta = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas, [rot] = lam.palavras;
    const y0 = rotulo(ctx, rot);
    const a = P.titulo(ctx, f1, { x: L, y: y0 + 4, w: LW, h: 280 }, { sizes: [76, 70, 64, 60, 56, 52], lh: 1.1 });
    const b = f2 ? P.bloco(ctx, f2, { x: L, y: a.y1 + 22, w: LW, h: 190 }, { sizes: [46, 44, 42, 40, 38, 36, 34, 32] }) : a;
    const fil = fileira(ctx, { y: b.y1 + 44, h: 236 });
    cena(ctx, lam, { x: L, y: fil.bottom + 16, w: LW, h: BOT - fil.bottom - 16 });
  };

  P.MOLDE.porque = (ctx, lam) => {
    E.fundo(ctx);
    const i = Math.max(0, LETRA.indexOf(String(lam.opcao || 'A').toUpperCase()));
    const [f1, f2] = lam.linhas;
    const y = cabecalho(ctx, i);
    const a = P.bloco(ctx, f1, { x: L, y: y + 22, w: LW, h: 250 }, { papel: 'titulo', sizes: [58, 54, 50, 46, 44, 42], lh: 1.12 });
    const hb = f2 ? 190 : 0;
    cena(ctx, lam, { x: L, y: a.y1 + 28, w: LW, h: BOT - a.y1 - 28 - hb - (f2 ? 26 : 0) });
    if (f2) P.bloco(ctx, f2, { x: L, y: BOT - hb, w: LW, h: hb }, { sizes: [46, 44, 42, 40, 38, 36], valign: 'bottom' });
  };

  // dado: as colunas (até 8), uma por par nome e número; a mais alta vai no destaque (ou a de lam.realce, o nome D)
  const num = (k) => parseFloat(String(TX[k] || '0').replace(/\./g, '').replace(',', '.')) || 0;
  P.MOLDE.dado = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas, [rot, fonte, ...pares] = lam.palavras;
    const y0 = rotulo(ctx, rot);
    const a = P.bloco(ctx, f1, { x: L, y: y0 + 4, w: LW, h: 250 }, { papel: 'titulo', sizes: [66, 60, 56, 52, 48], lh: 1.1 });
    const b = f2 ? P.bloco(ctx, f2, { x: L, y: a.y1 + 20, w: LW, h: 130 }, { sizes: [46, 42, 40, 38] }) : a;
    const itens = [];
    for (let k = 0; k + 1 < pares.length; k += 2) itens.push([pares[k], pares[k + 1]]);
    const n = Math.max(1, itens.length), max = Math.max(1, ...itens.map(([, v]) => num(v)));
    const iReal = lam.realce ? itens.findIndex(([nk]) => nk === lam.realce) : itens.reduce((m, [, v], k, arr) => (num(v) > num(arr[m][1]) ? k : m), 0);
    const base = BOT - 170, topo = b.y1 + 110, gap = 26, cw = Math.min(170, (LW - gap * (n - 1)) / n);
    const x0 = L + (LW - (n * cw + gap * (n - 1))) / 2;
    E.linha(ctx, [[L, base + 2], [R, base + 2]], { lw: 4, seed: 120 });
    itens.forEach(([nk, vk], k) => {
      const h = Math.max(12, ((base - topo) * num(vk)) / max), x = x0 + k * (cw + gap);
      const papel = k === iReal ? 'destaque' : E.cor('apoio') === E.cor('fundo') ? 'apoioEscuro' : 'apoio';
      E.ret(ctx, x, base - h, cw, h, { papel, r: 10, seed: 130 + k });
      E.texto(ctx, D(vk), x + cw / 2, base - h - 18, { papel: 'numero', size: n > 6 ? 36 : 44, align: 'center' });
      P.bloco(ctx, nk, { x: x - gap / 2, y: base + 16, w: cw + gap, h: 50 }, { sizes: [34, 32, 30, 28], align: 'center', maxLinhas: 1 });
    });
    P.fonte(ctx, fonte, { x: L, y: BOT - 96, w: LW, h: 96 }, { cor: E.escuro() ? 'salvia' : 'apoioEscuro', valign: 'bottom', sizes: [32, 30, 28, 26], maxLinhas: 3 });
  };

  // lista: os itens em cartões com o desenho de cada um (1 fileira até 3; 2 × 2 com 4; 3 × 2 com 5 ou 6)
  P.MOLDE.lista = (ctx, lam) => {
    E.fundo(ctx);
    const [f1, f2] = lam.linhas, [rot, ...itens] = lam.palavras;
    const y0 = rotulo(ctx, rot);
    const a = P.bloco(ctx, f1, { x: L, y: y0 + 4, w: LW, h: 230 }, { papel: 'titulo', sizes: [62, 58, 54, 50, 46], lh: 1.12 });
    const n = Math.max(1, itens.length), cols = n <= 3 ? n : n === 4 ? 2 : 3, rows = Math.ceil(n / cols);
    const hb = f2 ? 150 : 0, gap = 26, top = a.y1 + 40, fundo = BOT - hb - (f2 ? 24 : 0);
    const cw = (LW - gap * (cols - 1)) / cols, ch = Math.min(420, (fundo - top - gap * (rows - 1)) / rows);
    const desenhos = DS.item[lam.id] || [];
    itens.forEach((k, j) => {
      const c = j % cols, r = Math.floor(j / cols), x = L + c * (cw + gap), y = top + r * (ch + gap);
      E.ret(ctx, x, y, cw, ch, { papel: 'superficie', r: 24, seed: 160 + j });
      const hl = Math.min(118, ch * 0.36);
      if (desenhos[j]) desenhos[j](ctx, x + cw / 2, y + (ch - hl) / 2 + 8, Math.min(1, (ch - hl) / 230, cw / 300));
      P.bloco(ctx, k, { x: x + 16, y: y + ch - hl - 8, w: cw - 32, h: hl }, { sizes: [40, 38, 36, 34, 32, 30], align: 'center', valign: 'middle', maxLinhas: 3, lh: 1.05 });
    });
    if (f2) P.bloco(ctx, f2, { x: L, y: BOT - hb, w: LW, h: hb }, { sizes: [44, 42, 40, 38, 36], valign: 'bottom' });
  };

  // resumo: o cartão escuro com o tracejado de recortar, uma frase por linha, cada uma com o ✓
  P.MOLDE.resumo = (ctx, lam) => {
    E.fundo(ctx, { tipo: 'escuro' });
    const fr = lam.linhas, [rot, fonte] = lam.palavras;
    const m = 34;
    // o tracejado de recortar, aberto no canto de cima à direita (lá fica o contador "10/10" do Instagram)
    const C = P.CONTADOR;
    E.linha(ctx, [[W - m, C.h + 24], [W - m, H - m], [m, H - m], [m, m + 6], [C.x - 24, m + 6]], { papel: 'salvia', lw: 4, seed: 99, tracejado: true });
    const y0 = rotulo(ctx, rot, { cor: E.escuro() ? 'destaque' : 'papel' });
    const fim = BOT - 120, passo = Math.min(300, (fim - y0) / Math.max(1, fr.length));
    // a mesma letra em todas as frases: a maior em que todas cabem
    const z = mesmaLetra(ctx, fr, 'titulo', [62, 58, 54, 50, 46, 42], LW - 88, passo - 50, 1.1);
    fr.forEach((k, j) => {
      const y = y0 + 20 + j * passo;
      if (j) E.linha(ctx, [[L, y - 24], [R, y - 20]], { papel: 'salvia', lw: 3, seed: 101 + j, tracejado: true });
      marca(ctx, 'certa', L + 30, y + 46, 0.7, 'marca');
      P.bloco(ctx, k, { x: L + 88, y, w: LW - 88, h: passo - 50 }, { papel: 'titulo', sizes: [z], lh: 1.1, valign: 'middle', cor: 'papel', corTrecho: 'marca' });
    });
    P.fonte(ctx, fonte, { x: L, y: BOT - 96, w: LW, h: 96 }, { cor: 'salvia', valign: 'bottom', sizes: [32, 30, 28, 26], maxLinhas: 3 });
  };

  // texto: a lâmina simples (a frase grande e o detalhe), para o que não cabe nos outros
  P.MOLDE.texto = (ctx, lam) => {
    E.fundo(ctx);
    const [a, b] = lam.linhas, [rot] = lam.palavras;
    const y0 = rotulo(ctx, rot);
    const t = P.bloco(ctx, a, { x: L, y: y0 + 30, w: LW, h: 420 }, { papel: 'titulo', sizes: [72, 66, 60, 56] });
    cena(ctx, lam, { x: L, y: t.y1 + 30, w: LW, h: BOT - t.y1 - 30 - (b ? 220 : 0) });
    if (b) P.bloco(ctx, b, { x: L, y: BOT - 200, w: LW, h: 200 }, { valign: 'bottom' });
  };

  // o kit do tipo, para os desenhos da peça (film-3-desenhos.js) usarem
  P.KIT = { LETRA, veredito, mesmaLetra, rotulo, marca, risco, letra, cartao, cartaoEmPe, selo, fileira, cabecalho, ficha, arraste };
})();
