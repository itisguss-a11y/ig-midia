// PRESEME · motor "Mito ou verdade" · desenho 1/3 · o molde (igual em toda peça deste tipo; o chat não mexe aqui)
// A cara do tipo: o rótulo "Mito ou verdade?" no alto (D01), o trilho dos três selos no canto, o balão com a frase que
// todo mundo repete, o selo que bate (MITO, VERDADE ou DEPENDE, a primeira palavra da frase do veredito) e, no fecho,
// a fileira dos três selos. O porquê de cada frase é desenhado pela peça (film-2-peca.js, PECA.PORQUE), com um plano
// por frase (PECA.PLANOS: corte seco de câmera, junto com a troca seca da frase de baixo).
// Cores e letras vêm do kit de estilos (ferramentas/estilos.js): a mesma peça sai em qualquer estilo trocando o ESTILO do score.js.
(function () {
  const U = globalThis.U, G = globalThis.G, E = globalThis.ESTILOS, SC = globalThis.SCORE, TX = globalThis.TEXTOS;
  const SAFE = G.SAFE;
  const L = SAFE.x, R = SAFE.x + SAFE.w, TOP = SAFE.y, BOT = SAFE.y + SAFE.h, CX = (L + R) / 2;
  const NB = ' ';
  const D = (k) => TX[k] || '';
  const P = () => globalThis.PECA || {};
  const cor = (p) => E.cor(p);
  const p01 = (t, t0, d) => U.clamp((t - t0) / d, 0, 1);
  const AREA = { x: L, y: 400, w: R - L, h: 770 }; // a área do desenho do porquê

  // ---------- texto: quebra sozinha, linhas de tamanho parecido, sem palavrinha solta no fim da linha ----------
  const fonte = (papel = 'corpo') => E.letra(papel); // [família, peso, escala]
  const wid = (ctx, s, size, papel = 'corpo') => { const [fam, w, k] = fonte(papel); return G.measure(ctx, s, Math.round(size * k), fam, w); };
  const escrever = (ctx, s, x, y, { size = 56, papel = 'corpo', cor: c = 'texto', align = 'left', alpha = 1 } = {}) => E.texto(ctx, s, x, y, { papel, size, align, cor: c, alpha });

  function quebrar(ctx, s, size, maxW, papel) {
    const out = []; let cur = '';
    for (const w of s.split(' ')) {
      const t = cur ? cur + ' ' + w : w;
      if (cur && wid(ctx, t, size, papel) > maxW) { out.push(cur); cur = w; } else cur = t;
    }
    if (cur) out.push(cur);
    return out;
  }
  const FRACA = new Set(['a', 'o', 'as', 'os', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'e', 'em', 'no', 'na', 'nos', 'nas', 'que', 'é', 'à', 'ao', 'para', 'por', 'com', 'se', 'não', 'ou', 'pela', 'pelo', 'mas']);
  function equilibrar(ctx, s, size, maxW, papel) {
    const base = quebrar(ctx, s, size, maxW, papel), k = base.length;
    if (k < 2) return base;
    let melhor = base, nota = Infinity;
    for (let w = maxW; w > maxW * 0.45; w -= 20) {
      const ls = quebrar(ctx, s, size, w, papel);
      if (ls.length !== k) break;
      const ws = ls.map((l) => wid(ctx, l, size, papel));
      const fracas = ls.slice(0, -1).filter((l) => FRACA.has(l.split(' ').pop().toLowerCase().replace(/[.,;:!?"”]/g, ''))).length;
      const n = Math.max(...ws) - Math.min(...ws) + 400 * fracas;
      if (n < nota) { nota = n; melhor = ls; }
    }
    return melhor;
  }
  const memo = new Map();
  function linhasDe(ctx, n, size, maxW, papel, texto) {
    const key = [n, size, maxW, papel, texto ? 't' : ''].join(':');
    if (!memo.has(key)) {
      let s = texto != null ? texto : TX[n] || ''; const d = (P().DESTAQUE || {})[n];
      if (d && s.includes(d)) s = s.replace(d, d.split(' ').join(NB)); // o trecho destacado não se parte em duas linhas
      memo.set(key, equilibrar(ctx, s, size, maxW, papel));
    }
    return memo.get(key);
  }
  // escolhe o maior tamanho em que o texto cabe em maxW e em maxLinhas
  function caber(ctx, n, { sizes = [58, 54, 50, 46], maxLinhas = [2, 3, 3, 4], maxW = R - L, papel = 'corpo', texto } = {}) {
    for (let i = 0; i < sizes.length; i++) {
      const t = linhasDe(ctx, n, sizes[i], maxW, papel, texto);
      if (t.length <= maxLinhas[i] && t.every((l) => wid(ctx, l.split(NB).join(' '), sizes[i], papel) <= maxW)) return { size: sizes[i], ls: t };
    }
    const size = sizes[sizes.length - 1];
    return { size, ls: linhasDe(ctx, n, size, maxW, papel, texto) };
  }
  // desenha as linhas; a de y0 é a primeira (topo) ou, com base, a última (baseY); o trecho da peça (DESTAQUE) ganha o destaque
  function desenhar(ctx, n, ls, size, { cx = CX, y0 = null, baseY = null, papel = 'corpo', alpha = 1, dy = 0, kDestaque = 1, align = 'center', x = null } = {}) {
    const lh = size * fonte(papel)[2] * 1.27, d = (P().DESTAQUE || {})[n];
    const top = y0 != null ? y0 : baseY - (ls.length - 1) * lh;
    ctx.save(); ctx.globalAlpha *= alpha;
    ls.forEach((l, i) => {
      const s = l.split(NB).join(' '), y = top + i * lh + dy, w = wid(ctx, s, size, papel);
      const xl = align === 'left' ? x : cx - w / 2;
      const k = d ? s.indexOf(d) : -1;
      if (k >= 0) E.destaque(ctx, xl + wid(ctx, s.slice(0, k), size, papel), y, wid(ctx, d, size, papel), size * fonte(papel)[2], { seed: 7 + n * 3 + i, k: kDestaque });
      escrever(ctx, s, xl, y, { size, papel });
    });
    ctx.restore();
    return { top, bottom: top + (ls.length - 1) * lh, lh };
  }
  // a frase da vez, centrada, com a última linha em baseY
  function bloco(ctx, n, { baseY = 1405, sizes = [54, 50, 46, 42], maxLinhas = [3, 3, 4, 4], maxW = R - L, alpha = 1, dy = 0, papel = 'corpo', cx = CX, kDestaque = 1 } = {}) {
    if (!TX[n]) return;
    const { size, ls } = caber(ctx, n, { sizes, maxLinhas, maxW, papel });
    desenhar(ctx, n, ls, size, { cx, baseY, papel, alpha, dy, kDestaque });
  }
  // o título grande (abertura e fecho), a partir do topo
  function titulo(ctx, n, { y0 = TOP + 190, alpha = 1, kDestaque = 1 } = {}) {
    if (!TX[n]) return null;
    const { size, ls } = caber(ctx, n, { sizes: [80, 72, 64, 58], maxLinhas: [3, 3, 4, 4], papel: 'titulo' });
    return desenhar(ctx, n, ls, size, { y0: y0 + size * 0.8, papel: 'titulo', alpha, kDestaque });
  }

  // ---------- o veredito: MITO, VERDADE ou DEPENDE, a primeira palavra da frase; o resto sai embaixo do selo ----------
  const PAPEL_VEREDITO = { MITO: 'alerta', VERDADE: 'folha', DEPENDE: 'texto' };
  function veredito(n) {
    const s = String(TX[n] || '').trim();
    const m = /^([A-Za-zÀ-ÿ]+)[\s,.;:!?-]*(.*)$/.exec(s);
    const palavra = m ? m[1].toUpperCase() : '';
    const resto = m ? m[2].trim().replace(/\.$/, '') : '';
    return { palavra, resto, papel: PAPEL_VEREDITO[palavra] || 'texto', valido: !!PAPEL_VEREDITO[palavra] };
  }

  // ---------- a cara do tipo ----------
  // o rótulo fixo "Mito ou verdade?" no alto, à esquerda, escrito à mão, com o risco embaixo
  function rotulo(ctx, { alpha = 1, t = 99, t0 = 0 } = {}) {
    if (!D('D01')) return;
    const a = alpha * U.clamp((t - t0) / 0.25, 0, 1);
    escrever(ctx, D('D01'), L + 4, TOP + 46, { size: 50, papel: 'mao', cor: 'destaque', alpha: a });
    const w = wid(ctx, D('D01'), 50, 'mao');
    ctx.save(); ctx.globalAlpha *= a;
    E.linha(ctx, [[L, TOP + 66], [L + w + 8, TOP + 64]], { papel: 'destaque', lw: 5, seed: 31 });
    ctx.restore();
  }
  // o trilho: três anéis no canto de cima, à direita; o da vez acende; depois do selo, o anel mostra a inicial do veredito
  function trilho(ctx, t, { atual = 0 } = {}) {
    const n = SC.ITENS.length, r = 30, gap = 82, y = TOP + 36;
    for (let i = 0; i < n; i++) {
      const x = R - r - (n - 1 - i) * gap;
      const feito = t >= SC.SELO[i] + 0.05, vez = atual === i + 1;
      const pulso = 1 + 0.25 * U.pulse(t, SC.SELO[i] + 0.05, 9) * (t >= SC.SELO[i] ? 1 : 0);
      ctx.save(); ctx.translate(x, y); ctx.scale(pulso, pulso);
      E.circulo(ctx, 0, 0, r, { papel: feito ? 'superficie' : vez ? 'destaque' : null, seed: 700 + i, lw: 4, sombra: false, hachura: false });
      const v = feito ? veredito(SC.ITENS[i].veredito) : null;
      const s = v ? v.palavra.slice(0, 1) : String(i + 1);
      escrever(ctx, s, 0, 11, { size: 32, papel: 'numero', align: 'center', cor: 'texto' });
      ctx.restore();
    }
  }
  // o balão de fala com a frase (aspas incluídas), apontando para quem fala; k faz ele entrar
  function balao(ctx, n, { x = L + 40, y = TOP + 110, w = R - L - 60, cauda = [300, 985], k = 1, alpha = 1, texto } = {}) {
    if (k <= 0) return null;
    const pad = 44, { size, ls } = caber(ctx, n, { sizes: [64, 58, 54, 50], maxLinhas: [3, 4, 4, 5], maxW: w - pad * 2, papel: 'corpo', texto });
    const lh = size * fonte('corpo')[2] * 1.27, h = pad * 1.6 + ls.length * lh;
    const z = 0.6 + 0.4 * U.ease.outBack(Math.min(1, k));
    ctx.save(); ctx.globalAlpha *= alpha * Math.min(1, k * 2);
    ctx.translate(cauda[0], y + h); ctx.scale(z, z); ctx.translate(-cauda[0], -(y + h));
    const bx = cauda[0] - 40;
    E.poligono(ctx, [[bx - 30, y + h - 6], [bx + 60, y + h - 6], [cauda[0] - 10, cauda[1] - 180]], { papel: 'superficie', seed: 811, sombra: false });
    E.ret(ctx, x, y, w, h, { papel: 'superficie', r: 40, seed: 812 });
    G.rrect(ctx, bx - 26, y + h - 14, 82, 24, 0, { fill: cor('superficie'), stroke: null, lw: 0, seed: 813 }); // a cauda sem a linha do balão por cima
    desenhar(ctx, n, ls, size, { y0: y + pad * 0.8 + size * 0.85, papel: 'corpo' });
    ctx.restore();
    return { x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
  }
  // a largura do selo, pela mesma conta do kit (a palavra na letra do título, mais 60 de borda): serve para ele não sair da área segura
  const larguraSelo = (ctx, n, size) => wid(ctx, veredito(n).palavra || 'MITO', size, 'titulo') + 60;
  // o selo do veredito: entra grande e assenta (k de 0 a 1); o resto da frase sai embaixo, à mão, sem passar da margem direita
  function selo(ctx, n, cx, cy, { k = 1, size = 118, rot = -0.1, comResto = true, alpha = 1 } = {}) {
    const v = veredito(n);
    if (!v.palavra || k <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha;
    E.carimbo(ctx, v.palavra, cx, cy, { k, rot, papel: v.papel, size, seed: 41 + n });
    if (comResto && v.resto && k >= 1) {
      const maxW = Math.min(R - L - 40, 2 * (R - cx) - 20);
      const { size: z, ls } = caber(ctx, `V${n}`, { sizes: [54, 48, 44], maxLinhas: [1, 2, 2], maxW, papel: 'mao', texto: v.resto });
      // abaixo da borda do selo, que muda de altura com a letra do estilo (metade da altura do selo = 0,775 da letra)
      desenhar(ctx, `V${n}`, ls, z, { cx, y0: cy + 0.775 * size * fonte('titulo')[2] + 26 + 0.78 * z * fonte('mao')[2], papel: 'mao' });
    }
    ctx.restore();
  }
  // a pessoa que repete a frase (PECA.FALANTE): fala no balão, reage ao selo (MITO: mão na testa; VERDADE: joinha; DEPENDE: pensa)
  function falante(ctx, t, { x = 260, y = 1440, s = 1.12, fala = false, reacao = null, look = 0.5, andando = false } = {}) {
    const F = P().FALANTE || {};
    const gesto = { MITO: 'facepalm', VERDADE: 'thumbsUp', DEPENDE: 'think' }[reacao] || (fala ? 'point' : null);
    const boca = fala ? { open: 0.25 + 0.3 * Math.abs(Math.sin(t * 13)), wide: 0.5, talking: true } : reacao === 'VERDADE' ? 'smile' : reacao === 'MITO' ? 'o' : reacao ? 'flat' : 'smile';
    E.personagem(ctx, { quem: F.quem || 'moradora', style: F.style || {}, x, y, s, pose: andando ? 'walk' : 'stand', walk: andando ? t * 1.8 : 0, look, mouth: boca, gesture: andando ? null : gesto, brows: reacao === 'MITO' ? 'up' : 'neutral', seed: 900 });
  }
  // o tremor da batida do selo
  function tremor(ctx, t, t0) {
    if (!(t >= t0)) return;
    const a = 10 * Math.exp(-(t - t0) * 12);
    ctx.translate(a * Math.sin(t * 95), a * Math.cos(t * 70));
  }

  // ---------- o estado do filme no instante t ----------
  function estado(t) {
    const c = SC.cenaEm(t);
    let i = 0;
    c.itens.forEach((x, j) => { if (t >= x.t0) i = j; });
    const it = c.itens[i], ultima = i === c.itens.length - 1;
    const st = { t, c, it, i, u: t - c.t0 };
    const corte = i === 0;
    // no porquê, a frase troca seca, junto com o corte de plano (a troca inteira cai num quadro só); nas outras cenas, esmaece
    const seca = c.tipo === 'porque';
    st.aTexto = seca ? 1 : Math.min(corte ? 1 : U.clamp((t - it.t0) / 0.2, 0, 1), ultima ? 1 : U.clamp((it.t1 - t) / 0.12, 0, 1));
    st.dyTexto = corte ? 0 : (1 - U.ease.outCubic(U.clamp((t - it.t0) / 0.25, 0, 1))) * 16;
    // tempo desde que cada frase da cena entrou (para o desenho do porquê saber em que passo está)
    st.desde = {}; c.itens.forEach((x) => { st.desde[x.n] = t - x.t0; });
    return st;
  }

  // ---------- as cenas do tipo ----------
  const CENA = {};
  CENA.abertura = (ctx, st) => {
    const t = st.t, c = st.c;
    titulo(ctx, c.itens[0].n, { y0: TOP + 110 }); // a abertura tem uma frase só (o peca.js trava se tiver mais)
    // a pessoa entra andando pela esquerda logo no começo: abertura parada perde quem rola o feed (o conferir quer movimento antes de 1 s)
    const u = p01(t, c.t0 + 0.05, 0.9);
    falante(ctx, t, { look: 0.6, x: U.lerp(-240, 260, U.ease.outCubic(u)), andando: u < 1 });
    // o balão vazio, com os três pontinhos de quem vai falar: estala quando ela chega
    const k = U.ease.outBack(p01(t, c.t0 + 1.0, 0.3));
    if (k > 0) {
      ctx.save(); ctx.globalAlpha *= Math.min(1, k * 2); ctx.translate(520, 1090); ctx.scale(k, k); ctx.translate(-520, -1090);
      E.ret(ctx, 330, 1010, 380, 160, { papel: 'superficie', r: 70, seed: 820 });
      for (let i = 0; i < 3; i++) E.circulo(ctx, 430 + i * 90, 1090 - 12 * Math.abs(Math.sin(t * 5 + i)), 18, { papel: 'tinta', seed: 821 + i, sombra: false, hachura: false });
      ctx.restore();
    }
    trilho(ctx, t);
    rotulo(ctx);
  };
  CENA.mito = (ctx, st) => {
    const t = st.t, c = st.c, tv = SC.linha[c.veredito] ? SC.linha[c.veredito].t0 : Infinity;
    const v = veredito(c.veredito), bateu = t >= tv;
    ctx.save(); tremor(ctx, t, tv);
    // plano médio: quando fala, a pessoa fica um pouco maior que na abertura (o corte da abertura para a frase se vê)
    falante(ctx, t, { s: 1.22, fala: !bateu && st.u < 2.2, reacao: bateu && t >= tv + 0.35 ? v.palavra : null });
    const b = balao(ctx, c.frase, { k: 0.5 + 0.5 * p01(t, c.t0, 0.2) }); // já inteiro no primeiro quadro: a cena entra com corte seco
    // o selo bate na borda de baixo do balão, à direita, sem cobrir a frase e sem passar da margem; o resto do veredito sai embaixo dele
    if (b) {
      const z = 118, w = larguraSelo(ctx, c.veredito, z);
      selo(ctx, c.veredito, Math.min(R - w / 2 - 14, b.x + b.w - w / 2 + 10), b.y + b.h + 84, { k: p01(t, tv, 0.18), size: z });
    }
    ctx.restore();
    trilho(ctx, t, { atual: c.k });
    rotulo(ctx);
  };
  // o plano da frase da vez (PECA.PLANOS[n] = { x, y, z }): o ponto (x, y) do desenho vai para o meio da área, com zoom z.
  // A troca é seca, no começo da frase, como um corte de câmera: um ponto focal por frase e um corte a cada frase
  // (trecho sem corte acima de 12 s é aviso do conferir). Frase sem plano: o desenho inteiro, sem zoom.
  function plano(ctx, n) {
    const pl = (P().PLANOS || {})[n];
    if (!pl || !(pl.z > 0)) return;
    const cy = AREA.y + AREA.h / 2;
    ctx.translate(CX, cy); ctx.scale(pl.z, pl.z); ctx.translate(-(pl.x != null ? pl.x : CX), -(pl.y != null ? pl.y : cy));
  }
  CENA.porque = (ctx, st) => {
    const t = st.t, c = st.c, desenho = (P().PORQUE || {})[c.k];
    if (desenho) { // o porquê funcionando, desenhado pela peça, recortado na área do desenho (y de 400 a 1170)
      // recorte: nada do desenho passa da margem direita (R), onde ficam os botões do Instagram; o qa não vê texto com zoom
      ctx.save(); ctx.beginPath(); ctx.rect(L - 20, AREA.y - 12, R - L + 24, AREA.h + 26); ctx.clip();
      plano(ctx, st.it.n);
      desenho(ctx, st, globalThis.MV);
      ctx.restore();
    }
    bloco(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
    // o selo pequeno do veredito, no canto, logo abaixo do trilho (fora da área do desenho, que começa em y 400)
    selo(ctx, c.veredito, R - larguraSelo(ctx, c.veredito, 40) / 2 - 8, TOP + 128, { size: 40, rot: -0.12, comResto: false });
    trilho(ctx, t, { atual: c.k });
    rotulo(ctx);
  };
  CENA.fecho = (ctx, st) => {
    const t = st.t, c = st.c;
    // o fecho tem uma frase só, o título que junta as três numa regra (o peca.js trava se tiver mais)
    const tt = titulo(ctx, c.itens[0].n, { y0: TOP + 110, kDestaque: U.ease.inOutCubic(p01(t, c.t0 + 1.6, 0.5)) });
    // a fileira dos três selos, cada um com o resumo da frase embaixo (PECA.RESUMO: as palavras D do textos.txt);
    // os três no mesmo tamanho, o maior em que o mais largo cabe na sua coluna
    const n = SC.ITENS.length, gap = (R - L) / n;
    let z = 60;
    while (z > 36 && SC.ITENS.some((it) => larguraSelo(ctx, it.veredito, z) > gap - 24)) z -= 2;
    const y = (tt ? tt.bottom : 600) + 70 + z * 1.4;
    SC.ITENS.forEach((it, i) => {
      const x = L + gap * (i + 0.5), k = p01(t, c.t0 + 0.35 + 0.35 * i, 0.18);
      selo(ctx, it.veredito, x, y, { k, size: z, rot: [-0.12, 0.06, -0.08][i % 3], comResto: false });
      const resumo = D((P().RESUMO || [])[i]);
      if (resumo && k >= 1) {
        const { size, ls } = caber(ctx, `R${i}`, { sizes: [42, 40, 36], maxLinhas: [2, 2, 3], maxW: gap - 24, papel: 'mao', texto: resumo });
        desenhar(ctx, `R${i}`, ls, size, { cx: x, y0: y + z * 0.8 + 56, papel: 'mao' });
      }
    });
    falante(ctx, t, { reacao: 'VERDADE', x: 250, y: 1440, s: 0.9 });
    trilho(ctx, t);
    rotulo(ctx);
  };

  // o que a peça usa para desenhar o porquê (film-2-peca.js): MV.escrever, MV.p01, MV.area...
  globalThis.MV = { L, R, TOP, BOT, CX, D, cor, wid, escrever, quebrar, caber, desenhar, bloco, titulo, veredito, rotulo, trilho, balao, selo, falante, tremor, p01, estado, CENA,
    area: AREA };
})();
