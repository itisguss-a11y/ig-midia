// PRESEME · carrossel · tipo DOCUMENTO ANOTADO · desenho 2 · o kit de formulário, a janela de zoom e os moldes de lâmina
// (fixos: o chat 1 não mexe aqui). O documento em si é um desenho da peça (film-3-desenhos.js: PRESEME.DOC.desenhar),
// feito com as peças de formulário deste arquivo (PRESEME.FORM: caixa com número, rótulo, casas, quadradinho, faixa...),
// nas unidades do próprio documento (no exemplo, os pontos da folha A4 do PDF oficial: 595 × 842).
// Os campos que a peça anota vêm do score.js (CAMPOS): para cada um, o número, o retângulo do campo (marca), o pedaço do
// documento que a lâmina aumenta (zoom), o nome, o que é, o erro comum e o porquê. Daqui saem as lâminas:
//   capa       o título, a promessa e o documento inteiro, com a lupa no primeiro campo
//   campo      o número e o nome do campo, o que ele quer dizer, o zoom no documento (com o campo marcado e, se houver,
//              um exemplo escrito à mão) e, embaixo, o erro comum e o porquê
//   documento  o documento inteiro de novo, com todos os números, e a legenda deles (o cartão para salvar)
//   texto      o de reserva (da base do motor)
// Texto miúdo do documento é desenho (G.decor): o qa do motor não o mede. Quem garante que ele se lê no zoom é a conta do
// peca.js (a letra do documento na janela tem de passar de 26 px no rótulo e de 18 px na opção miúda).
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, G = globalThis.G, SC = globalThis.SCORE, TX = globalThis.TEXTOS;
  const { L, R, CX, TOP, BOT } = P;
  const LU = R - L, PAL = E.PAL;
  const META = SC.DOC, JAN = SC.JANELA, CAMPOS = SC.CAMPOS, ROT = SC.ROTULOS;
  const porId = {}; for (const c of CAMPOS) porId[c.id] = c;

  // ---------- as letras do documento: a letra de corpo do estilo, mais leve (o formulário é impresso) ----------
  const [famC, pesoC, kC] = E.letra('corpo');
  const [famM, pesoM, kM] = E.letra('mao');
  const LEVE = /Kalam|VT323|Anton/.test(famC) ? 400 : 500;
  const pena = () => (E.escuro() ? PAL.marca : PAL.folha); // a tinta da caneta do exemplo escrito à mão

  // ---------- a vista: um pedaço do documento (unidades do documento) numa caixa da tela ----------
  // O pedaço cresce até ter a proporção da caixa (em volta do centro) e fica dentro da folha. k = px por unidade.
  function vista(reg, caixa) {
    let { x, y, w, h } = { x: reg[0], y: reg[1], w: reg[2], h: reg[3] };
    const ar = caixa.w / caixa.h;
    if (w / h < ar) { const nw = h * ar; x -= (nw - w) / 2; w = nw; } else { const nh = w / ar; y -= (nh - h) / 2; h = nh; }
    const cabe = (v, len, tot) => (len >= tot ? (tot - len) / 2 : Math.min(Math.max(v, 0), tot - len));
    x = cabe(x, w, META.W); y = cabe(y, h, META.H);
    const k = caixa.w / w;
    return { k, vis: { x, y, w, h }, caixa, X: (u) => caixa.x + (u - x) * k, Y: (v) => caixa.y + (v - y) * k };
  }
  const naVista = (V, x, y, w, h, folga = 0.5) => x >= V.vis.x - folga && y >= V.vis.y - folga && x + w <= V.vis.x + V.vis.w + folga && y + h <= V.vis.y + V.vis.h + folga;
  const cruza = (V, x, y, w, h) => x < V.vis.x + V.vis.w && x + w > V.vis.x && y < V.vis.y + V.vis.h && y + h > V.vis.y;

  // ---------- as peças de formulário (todas nas unidades do documento) ----------
  const F = {};
  const lw = (V, u = 0.7) => Math.max(1.2, u * V.k);
  const amp = () => (E.nome === 'planta' || E.nome === 'chapado' ? 0 : 0.5);
  F.linha = (ctx, V, pts, o = {}) => {
    const p = pts.map(([x, y]) => [V.X(x), V.Y(y)]);
    G.line(ctx, p, { color: E.cor(o.cor || 'tinta'), lw: lw(V, o.u), seed: o.seed || 3, amp: amp() });
  };
  // texto do documento, nas unidades do documento (o: size, forte, align, maxw: a largura máxima, mao: escrito à mão, cor)
  F.texto = (ctx, V, s, x, y, o = {}) => {
    s = String(s || ''); if (!s.trim()) return;
    let size = o.size || 8.2;
    const mao = E.nome === 'pixel' ? [famM, pesoM, kM] : ['Caveat', 700, 1.12]; // o exemplo escrito à mão: a letra de mão do motor
    const fam = o.mao ? mao[0] : famC, kk = o.mao ? mao[2] : kC, peso = o.mao ? mao[1] : o.forte ? 700 : LEVE;
    let px = size * V.k * kk;
    if (px < 1) return;
    let wu = G.measure(ctx, s, px, fam, peso) / V.k;
    if (o.maxw && wu > o.maxw) { px *= o.maxw / wu; wu = o.maxw; }
    const x0 = o.align === 'center' ? x - wu / 2 : o.align === 'right' ? x - wu : x;
    // na pixel art o texto sai depois, por cima e sem o recorte da janela: lá só o texto inteiro na vista. Nos outros
    // estilos, o texto que começa dentro da vista pode passar da borda da direita (o recorte corta, como numa foto
    // aproximada); o que começa fora não sai (o fim de uma palavra solto na borda da esquerda parece outra coisa)
    const v = V.vis, comeca = x0 >= v.x - 0.5 && x0 < v.x + v.w && y - size >= v.y - 0.5 && y + size * 0.3 <= v.y + v.h + 0.5;
    if (E.nome === 'pixel' ? !naVista(V, x0, y - size, wu, size * 1.3) : !comeca) return;
    G.text(ctx, s, V.X(x), V.Y(y), { size: px, fam, weight: peso, color: o.cor ? (o.cor[0] === '#' ? o.cor : E.cor(o.cor)) : E.cor('texto'), align: o.align || 'left', boil: 0, preseme_k: true });
  };
  // a caixa do campo: o quadradinho do número no canto, a linha da esquerda, a de baixo e a da direita (o alto fica aberto,
  // como na ficha impressa); o rótulo depois do número. o: n, rotulo, rx (onde o rótulo começa), size, fechada
  F.caixa = (ctx, V, x, y, w, h, o = {}) => {
    if (!cruza(V, x - 2, y - 2, w + 4, h + 4)) return;
    const r = Math.min(4, h / 4), q = 11.5, pts = [];
    const topoEsq = o.n ? y + q : y + 3;
    pts.push([x, topoEsq], [x, y + h - r]);
    for (let i = 1; i <= 4; i++) { const a = Math.PI - (i / 4) * (Math.PI / 2); pts.push([x + r + Math.cos(a) * r, y + h - r + Math.sin(a) * r]); }
    pts.push([x + w - r, y + h]);
    for (let i = 1; i <= 4; i++) { const a = Math.PI / 2 - (i / 4) * (Math.PI / 2); pts.push([x + w - r + Math.cos(a) * r, y + h - r + Math.sin(a) * r]); }
    pts.push([x + w, y + (o.fechada ? 0 : 3)]);
    if (o.fechada) pts.push([x + (o.n ? q : 0), y]);
    F.linha(ctx, V, pts, { seed: Math.round(x + y) });
    if (o.n) {
      F.linha(ctx, V, [[x, y], [x + q, y], [x + q, y + q], [x, y + q], [x, y]], { seed: Math.round(x * 3 + y) });
      F.texto(ctx, V, o.n, x + q / 2, y + 8.6, { size: String(o.n).length > 1 ? 7.9 : 8.6, forte: true, align: 'center' });
    }
    if (o.rotulo) F.texto(ctx, V, o.rotulo, o.rx ?? x + (o.n ? 14.4 : 6), o.ry ?? y + 7.7, { size: o.size || 8.2, maxw: o.maxw });
  };
  // as casas de dígito: risquinhos em pé no pé da caixa (altas: os índices dos risquinhos mais altos, como dia | mês | ano)
  F.casas = (ctx, V, xs, yPe, o = {}) => {
    const h = o.h || 4.2;
    xs.forEach((x, i) => F.linha(ctx, V, [[x, yPe], [x, yPe - ((o.altas || []).includes(i) ? h * 1.6 : h)]], { u: 0.6, seed: Math.round(x) }));
  };
  // as casas de data (dd mm aaaa): 7 risquinhos dentro da caixa, os altos depois do dia e do mês
  F.data = (ctx, V, x, y, w, h) => {
    const cw = (w - 12) / 8, xs = []; for (let i = 1; i < 8; i++) xs.push(x + 6 + i * cw);
    F.casas(ctx, V, xs, y + h - 0.6, { altas: [1, 3] });
  };
  F.quadrado = (ctx, V, x, y, w, h) => { if (cruza(V, x, y, w, h)) F.linha(ctx, V, [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]], { u: 0.6, seed: Math.round(x + 7) }); };
  F.separa = (ctx, V, x, y0, y1) => { if (cruza(V, x - 1, y0, 2, y1 - y0)) F.linha(ctx, V, [[x, y0], [x, y1]], { u: 0.6, seed: Math.round(x) }); };
  // área sombreada (no impresso, cinza; aqui, a cor de apoio do estilo, clarinha)
  F.sombra = (ctx, V, x, y, w, h) => {
    if (!cruza(V, x, y, w, h)) return;
    ctx.save(); ctx.globalAlpha *= 0.38; ctx.fillStyle = E.cor('apoio'); ctx.fillRect(V.X(x), V.Y(y), w * V.k, h * V.k); ctx.restore();
  };
  // a faixa do bloco, em pé, com o nome de lado (Dados Gerais, Notificação Individual...)
  F.faixa = (ctx, V, x, y, w, h, s) => {
    if (!cruza(V, x, y, w, h)) return;
    F.sombra(ctx, V, x, y, w, h);
    F.linha(ctx, V, [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]], { u: 0.6, seed: Math.round(y) });
    const size = Math.min(8.6, w * 0.5), px = size * V.k * kC;
    const wu = G.measure(ctx, s, px, famC, 700) / V.k;
    if (wu > h - 4 || !naVista(V, x, y + (h - wu) / 2, w, wu)) return;
    ctx.save(); ctx.translate(V.X(x + w / 2 + size * 0.36), V.Y(y + h / 2)); ctx.rotate(-Math.PI / 2);
    G.text(ctx, s, 0, 0, { size: px, fam: famC, weight: 700, color: E.cor('texto'), align: 'center', boil: 0, preseme_k: true });
    ctx.restore();
  };
  // a barra de título de uma parte (Conclusão...), deitada, com o texto no meio
  F.barra = (ctx, V, x, y, w, h, s, o = {}) => {
    if (!cruza(V, x, y, w, h)) return;
    if (o.cheia) F.sombra(ctx, V, x, y, w, h);
    const r = h / 2, pts = [];
    for (let i = 0; i <= 16; i++) { const a = Math.PI / 2 + (i / 16) * Math.PI; pts.push([x + r + Math.cos(a) * r, y + r + Math.sin(a) * r]); }
    for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + (i / 16) * Math.PI; pts.push([x + w - r + Math.cos(a) * r, y + r + Math.sin(a) * r]); }
    pts.push(pts[0]);
    F.linha(ctx, V, pts, { u: 0.6, seed: Math.round(y) });
    if (s) F.texto(ctx, V, s, x + w / 2, y + h * 0.78, { size: o.size || 10.5, forte: true, align: 'center' });
  };
  P.FORM = F;

  // ---------- o documento numa caixa da tela: o papel, o desenho e (por cima) as marcas, os números e o escrito ----------
  function folha(ctx, V, o = {}) {
    const c = V.caixa;
    ctx.save();
    if (o.sombra !== false) { ctx.save(); ctx.globalAlpha *= 0.28; ctx.fillStyle = E.cor('sombra'); ctx.fillRect(c.x + 12, c.y + 14, c.w, c.h); ctx.restore(); }
    ctx.fillStyle = E.cor('superficie'); ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.beginPath(); ctx.rect(c.x, c.y, c.w, c.h); ctx.clip();
    G.decor(() => P.DOC.desenhar(ctx, V));
    ctx.restore();
    ctx.save(); ctx.strokeStyle = E.cor('tinta'); ctx.lineWidth = o.borda || 3; ctx.strokeRect(c.x, c.y, c.w, c.h); ctx.restore();
  }
  // o selo do número: o círculo Floresta com aro Marca-texto e o número em Papel (lê em qualquer fundo e em qualquer estilo)
  function selo(ctx, x, y, n, r = 26) {
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r + 4, 0, Math.PI * 2); ctx.fillStyle = PAL.marca; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = PAL.floresta; ctx.fill();
    ctx.restore();
    const [fam, peso, k] = E.letra('numero');
    const z = r * (String(n).length > 1 ? 1.02 : 1.2);
    G.text(ctx, String(n), x, y + z * 0.36 * k, { size: z * k, fam, weight: peso, color: PAL.papel, align: 'center', boil: 0, preseme_k: true });
  }
  // o campo marcado na tela: o retângulo do campo com o marca-texto clarinho e o contorno Coral
  function marca(ctx, V, m, o = {}) {
    const x = V.X(m[0]) - 6, y = V.Y(m[1]) - 6, w = m[2] * V.k + 12, h = m[3] * V.k + 12;
    ctx.save();
    ctx.globalAlpha *= o.leve ? 0.16 : 0.26; ctx.fillStyle = PAL.marca; ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = o.leve ? 0.85 : 1; ctx.strokeStyle = PAL.coral; ctx.lineWidth = o.leve ? 3 : 6; ctx.lineJoin = 'round';
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
    return { x, y, w, h };
  }
  // os selos dos campos sem encostar um no outro: o selo vai no canto de cima, à esquerda, do campo; se bater num já posto,
  // anda para a direita (e, se sair da caixa, desce)
  function selos(ctx, itens, caixa, r) {
    const postos = [];
    for (const it of itens) {
      let x = Math.max(caixa.x + r + 4, Math.min(it.x, caixa.x + caixa.w - r - 4)), y = Math.max(caixa.y + r + 4, Math.min(it.y, caixa.y + caixa.h - r - 4));
      for (let tenta = 0; tenta < 40 && postos.some((p) => Math.hypot(p[0] - x, p[1] - y) < 2 * r + 8); tenta++) {
        x += 2 * r + 8;
        if (x > caixa.x + caixa.w - r - 4) { x = Math.max(caixa.x + r + 4, it.x); y += 2 * r + 8; }
      }
      postos.push([x, y]); selo(ctx, x, y, it.n, r);
    }
  }
  // o exemplo escrito à mão no campo: { x, y (a linha de base), k: 'Dnn', size, casas (largura da casa: um caractere por
  // casa, a partir do x, pulando / - e espaço), centro (centraliza no x) }, nas unidades do documento
  function escrito(ctx, V, lista) {
    for (const e of lista || []) {
      const s = TX[e.k]; if (!s) continue;
      const o = { size: e.size || 9, mao: true, cor: pena() };
      if (e.casas) [...s.replace(/[\s/.-]/g, '')].forEach((ch, i) => F.texto(ctx, V, ch, e.x + e.casas * (i + 0.5), e.y, Object.assign({ align: 'center' }, o)));
      else F.texto(ctx, V, s, e.x, e.y, Object.assign({ align: e.centro ? 'center' : 'left' }, o));
    }
  }
  P.DOCVISTA = { vista, folha, selo, marca, selos, escrito };

  // ---------- peças da lâmina ----------
  // a etiqueta (pílula com uma palavra D): a do tipo na capa; ERRO COMUM e POR QUÊ no campo
  function etiqueta(ctx, k, x, y, o = {}) {
    const s = TX[k]; if (!s) return { x, y, w: 0, h: 0 };
    const size = o.size || 26, w = E.medir(ctx, s.toUpperCase(), { papel: 'corpo', size }) + 36, h = size * 1.62;
    E.ret(ctx, x, y, w, h, { papel: o.papel || 'destaque', r: h / 2, sombra: false, hachura: false, seed: 61 });
    // a letra da pílula: Noite em cima do Coral (na lousa do giz, Floresta sobre o Coral de giz dava 2,5 para 1)
    E.texto(ctx, s.toUpperCase(), x + 18, y + h * 0.68, { papel: 'corpo', size, cor: o.cor || ((o.papel || 'destaque') === 'alerta' ? 'noite' : 'floresta') });
    return { x, y, w, h };
  }

  // capa: a etiqueta do tipo, o título [01], a promessa e o documento inteiro, com a lupa no primeiro campo
  P.MOLDE.capa = (ctx, lam) => {
    E.fundo(ctx);
    etiqueta(ctx, ROT.etiqueta, L, TOP - 12);
    const [a, b] = lam.linhas;
    const t = P.titulo(ctx, a, { x: L, y: TOP + 56, w: LU, h: 300 }, { sizes: [92, 84, 76, 68, 60] });
    let y = t.y1;
    if (b) y = P.bloco(ctx, b, { x: L, y: y + 22, w: LU, h: 150 }, { sizes: [44, 40, 38, 36] }).y1;
    const topo = y + 44, alt = 1300 - topo, k = Math.min(alt / META.H, (LU * 0.78) / META.W);
    const fw = META.W * k, fh = META.H * k, cx = { x: L + 8, y: topo, w: fw, h: fh };
    const V = vista([0, 0, META.W, META.H], cx);
    folha(ctx, V);
    // a lupa: o primeiro campo, aumentado
    const c0 = CAMPOS[0];
    if (c0 && globalThis.BIB) {
      const m = c0.marcas[0], mx = V.X(m[0] + m[2] / 2), my = V.Y(m[1] + m[3] / 2);
      const r = Math.min(170, (R - (cx.x + fw)) + 120), lx = Math.min(R - r - 10, mx + 40), ly = Math.min(1250 - r, Math.max(topo + r, my + 30));
      globalThis.BIB.lupa(ctx, { x: lx, y: ly, r, cabo: 0.75, seed: 690, dentro: (c) => {
        const z = (r * 1.4) / Math.max(m[2], 60), reg = [m[0] + m[2] / 2 - r / z, m[1] + m[3] / 2 - r / z, (2 * r) / z, (2 * r) / z];
        const V2 = vista(reg, { x: lx - r, y: ly - r, w: 2 * r, h: 2 * r });
        // dentro da lupa, só o quadrado inscrito no círculo leva texto (a pixel art não respeita o recorte redondo)
        const s = r * 0.62, Vt = Object.assign({}, V2, { vis: { x: V2.vis.x + (r - s) / V2.k, y: V2.vis.y + (r - s) / V2.k, w: (2 * s) / V2.k, h: (2 * s) / V2.k } });
        c.fillStyle = E.cor('superficie'); c.fillRect(lx - r, ly - r, 2 * r, 2 * r);
        G.decor(() => P.DOC.desenhar(c, E.nome === 'pixel' ? Vt : V2));
        marca(c, V2, m, { leve: true });
      } });
    }
  };

  // campo: o número e o nome, o que é, a janela com o zoom, o erro comum e o porquê
  P.MOLDE.campo = (ctx, lam) => {
    E.fundo(ctx);
    const c = porId[lam.campo];
    if (!c) { P.MOLDE.texto(ctx, lam); return; }
    let x = L;
    for (const n of c.numeros) { selo(ctx, x + 34, TOP + 30, n, 30); x += 80; }
    P.bloco(ctx, c.nome, { x: x + 4, y: TOP - 14, w: R - x - 4, h: 96 }, { papel: 'titulo', sizes: [54, 50, 46, 42, 38, 34, 30], valign: 'middle', maxLinhas: 2 });
    P.bloco(ctx, c.oque, { x: L, y: TOP + 100, w: LU, h: JAN.y - TOP - 100 - 24 }, { sizes: [42, 40, 38, 36, 34, 32, 30, 28] });
    // a janela
    const V = vista(c.zoom, JAN);
    folha(ctx, V, { borda: 4 });
    ctx.save(); ctx.beginPath(); ctx.rect(JAN.x, JAN.y, JAN.w, JAN.h); ctx.clip();
    G.decor(() => escrito(ctx, V, c.escrito));
    c.marcas.forEach((m) => marca(ctx, V, m));
    ctx.restore();
    selos(ctx, c.marcas.map((m, i) => ({ x: V.X(m[0] + 5.75), y: V.Y(m[1] + 5.75), n: c.numeros[i] })), JAN, 28);
    // erro comum e porquê: a etiqueta à esquerda e a frase ao lado
    const y1 = JAN.y + JAN.h + 26, col = L + 210, hh = (BOT - y1 - 18) / 2;
    etiqueta(ctx, ROT.erro, L, y1 + 4, { papel: 'alerta', size: 24 });
    P.bloco(ctx, c.erro, { x: col, y: y1, w: R - col, h: hh }, { sizes: [40, 38, 36, 34, 32, 30, 28] });
    etiqueta(ctx, ROT.porque, L, y1 + hh + 22, { papel: 'destaque', size: 24 });
    P.bloco(ctx, c.porque, { x: col, y: y1 + hh + 18, w: R - col, h: hh }, { sizes: [40, 38, 36, 34, 32, 30, 28] });
  };

  // documento: o documento inteiro com todos os números e, ao lado, a legenda deles (o cartão para salvar)
  P.MOLDE.documento = (ctx, lam) => {
    E.fundo(ctx);
    const [a, b] = lam.linhas;
    const t = P.bloco(ctx, a, { x: L, y: TOP - 10, w: LU - 110, h: 150 }, { papel: 'titulo', sizes: [60, 56, 52, 48, 44] });
    const quais = (lam.campos || CAMPOS.map((c) => c.id)).map((id) => porId[id]).filter(Boolean);
    const topo = t.y1 + 28, baixo = BOT - 74, alt = baixo - topo;
    const k = Math.min(alt / META.H, 540 / META.W), fw = META.W * k, fh = META.H * k;
    const cx = { x: L, y: topo + (alt - fh) / 2, w: fw, h: fh };
    const V = vista([0, 0, META.W, META.H], cx);
    folha(ctx, V);
    const itens = [];
    for (const c of quais) c.marcas.forEach((m, i) => { marca(ctx, V, m, { leve: true }); itens.push({ x: V.X(m[0] + 5.75), y: V.Y(m[1] + 5.75), n: c.numeros[i] }); });
    selos(ctx, itens, cx, 17);
    // a legenda: os selos do campo e a palavra curta
    const lx = cx.x + fw + 34, lw2 = R - lx, passo = Math.min(118, alt / Math.max(1, quais.length));
    quais.forEach((c, i) => {
      const y = cx.y + i * passo;
      let x = lx;
      c.numeros.forEach((n) => { selo(ctx, x + 22, y + 26, n, 20); x += 52; });
      P.bloco(ctx, c.curto, { x: x + 4, y: y + 2, w: lx + lw2 - x - 4, h: passo - 10 }, { sizes: [32, 30, 28, 26, 24, 22], maxLinhas: 3 });
    });
    if (b) P.fonte(ctx, b, { x: L, y: BOT - 66, w: LU, h: 66 }, { valign: 'bottom', sizes: [26, 24, 22, 20] });
  };

  // texto: o de reserva, com a frase grande e o detalhe embaixo
  P.MOLDE.texto = (ctx, lam) => {
    E.fundo(ctx);
    const [a, b] = lam.linhas;
    const t = P.bloco(ctx, a, { x: L, y: TOP + 60, w: LU, h: 420 }, { papel: 'titulo', sizes: [72, 66, 60, 56] });
    if (b) P.bloco(ctx, b, { x: L, y: t.y1 + 56, w: LU, h: BOT - t.y1 - 56 });
  };
})();
