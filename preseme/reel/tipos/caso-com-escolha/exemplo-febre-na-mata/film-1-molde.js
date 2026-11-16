// PRESEME · motor "Caso com escolha" · desenho 1/3 · o molde (igual em toda peça deste tipo; o chat não mexe aqui)
// A cara do tipo: o rótulo do caso no alto (D01), a pessoa que chega e a ficha com as pistas (PECA.PISTAS); a pergunta com
// os três cartões A, B e C e o relógio da contagem (3, 2, 1, com o tique-taque do score.js); o silêncio; a resposta, com o
// selo de cada cartão (CERTA, ERRADA ou PODE SER, as primeiras palavras do porquê de cada opção); o porquê de cada opção,
// desenhado pela peça (PECA.PORQUE), com o cartão da vez no alto; a atenção primária (PECA.APS) e a prevenção
// (PECA.PREVENCAO), com um plano por frase (PECA.PLANOS: corte seco de câmera); e o fecho, que volta ao caso.
// Cores e letras vêm do kit de estilos (ferramentas/estilos.js): a mesma peça sai em qualquer estilo trocando o ESTILO do score.js.
(function () {
  const U = globalThis.U, G = globalThis.G, E = globalThis.ESTILOS, SC = globalThis.SCORE, TX = globalThis.TEXTOS;
  const SAFE = G.SAFE;
  const L = SAFE.x, R = SAFE.x + SAFE.w, TOP = SAFE.y, BOT = SAFE.y + SAFE.h, CX = (L + R) / 2;
  const NB = ' ';
  const D = (k) => TX[k] || '';
  const P = () => globalThis.PECA || {};
  const cor = (p) => E.cor(p);
  const p01 = (t, t0, d) => U.clamp((t - t0) / d, 0, 1);
  const AREA = { x: L, y: 400, w: R - L, h: 770 }; // a área do desenho (porquê, atenção primária e prevenção)
  const LETRA = ['A', 'B', 'C'];

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
    const key = [n, size, maxW, papel, texto ? 't' + texto : ''].join(':');
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
  function desenhar(ctx, n, ls, size, { cx = CX, y0 = null, baseY = null, papel = 'corpo', alpha = 1, dy = 0, kDestaque = 1, align = 'center', x = null, cor: c = 'texto' } = {}) {
    const lh = size * fonte(papel)[2] * 1.27, d = (P().DESTAQUE || {})[n];
    const top = y0 != null ? y0 : baseY - (ls.length - 1) * lh;
    ctx.save(); ctx.globalAlpha *= alpha;
    ls.forEach((l, i) => {
      const s = l.split(NB).join(' '), y = top + i * lh + dy, w = wid(ctx, s, size, papel);
      const xl = align === 'left' ? x : cx - w / 2;
      const k = d ? s.indexOf(d) : -1;
      if (k >= 0) E.destaque(ctx, xl + wid(ctx, s.slice(0, k), size, papel), y, wid(ctx, d, size, papel), size * fonte(papel)[2], { seed: 7 + n * 3 + i, k: kDestaque });
      escrever(ctx, s, xl, y, { size, papel, cor: c });
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
  // o título grande (caso, pergunta, resposta e fecho), a partir do topo
  function titulo(ctx, n, { y0 = TOP + 110, alpha = 1, kDestaque = 1, dy = 0, sizes = [80, 72, 64, 58] } = {}) {
    if (!TX[n]) return null;
    const { size, ls } = caber(ctx, n, { sizes, maxLinhas: [3, 3, 4, 4], papel: 'titulo' });
    return desenhar(ctx, n, ls, size, { y0: y0 + size * 0.8, papel: 'titulo', alpha, kDestaque, dy });
  }

  // ---------- o veredito de cada opção: as primeiras palavras do porquê dela (Certa, Errada ou Pode ser) ----------
  // certa: ✓ e o selo CERTA; errada: ✗ e o selo ERRADA; pode: ? e o selo PODE SER
  const PAPEL_MARCA = { certa: () => (E.escuro() ? 'destaque' : 'folha'), errada: () => 'coral', pode: () => (E.escuro() ? 'apoio' : 'tinta') };
  function veredito(i) {
    const ls = (SC.PORQUE || [])[i] || [];
    const s = String(TX[ls[0]] || '').trim();
    const m = /^(pode\s+ser|certa|certo|errada|errado)\b[\s,.;:!?-]*(.*)$/i.exec(s);
    if (!m) return { chave: null, palavra: '', resto: s, valido: false };
    const w = m[1].toLowerCase().replace(/\s+/g, ' ');
    const chave = w === 'pode ser' ? 'pode' : w.startsWith('cert') ? 'certa' : 'errada';
    return { chave, palavra: { certa: 'CERTA', errada: 'ERRADA', pode: 'PODE SER' }[chave], resto: m[2].trim(), valido: true, papel: PAPEL_MARCA[chave]() };
  }
  const VER = () => SC.OPCOES.map((_, i) => veredito(i));

  // ---------- a cara do tipo ----------
  // o rótulo fixo no alto, à esquerda (D01, "Caso da UBS"), à mão, com o risco embaixo
  function rotulo(ctx, { alpha = 1 } = {}) {
    if (!D('D01')) return;
    escrever(ctx, D('D01'), L + 4, TOP + 46, { size: 50, papel: 'mao', cor: 'destaque', alpha });
    const w = wid(ctx, D('D01'), 50, 'mao');
    ctx.save(); ctx.globalAlpha *= alpha;
    E.linha(ctx, [[L, TOP + 66], [L + w + 8, TOP + 64]], { papel: 'destaque', lw: 5, seed: 31 });
    ctx.restore();
  }
  // a marca do cartão: ✓, ✗ ou ?, que entra desenhando (k de 0 a 1)
  function marca(ctx, chave, x, y, s = 1, k = 1) {
    if (!chave || k <= 0) return;
    const papel = PAPEL_MARCA[chave]();
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (chave === 'certa') E.linha(ctx, [[-30, 2], [-8, 26], [34, -30]], { papel, lw: 13, k, seed: 51 });
    else if (chave === 'errada') {
      E.linha(ctx, [[-28, -28], [28, 28]], { papel, lw: 13, k: U.clamp(k * 2, 0, 1), seed: 52 });
      E.linha(ctx, [[28, -28], [-28, 28]], { papel, lw: 13, k: U.clamp(k * 2 - 1, 0, 1), seed: 53 });
    } else {
      E.linha(ctx, [[-22, -18], [-18, -34], [0, -40], [20, -32], [22, -14], [6, -2], [0, 12]], { papel, lw: 12, k: U.clamp(k * 1.3, 0, 1), seed: 54 });
      if (k >= 0.85) E.circulo(ctx, 0, 34, 8, { papel, seed: 55, sombra: false, hachura: false });
    }
    ctx.restore();
  }
  // o círculo da letra (A, B ou C)
  function letra(ctx, i, x, y, r = 36, { vez = false } = {}) {
    E.circulo(ctx, x, y, r, { papel: vez ? 'destaque' : null, seed: 600 + i, lw: 4, sombra: false, hachura: false });
    escrever(ctx, LETRA[i], x, y + r * 0.38, { size: Math.round(r * 1.05), papel: 'numero', align: 'center', cor: vez && !E.escuro() ? 'texto' : vez ? 'fundo' : 'texto' });
  }
  // o cartão de uma opção, deitado (pergunta): a letra à esquerda, o texto, e a marca à direita depois da resposta
  function cartao(ctx, i, x, y, w, h, { k = 1, kMarca = 0, alpha = 1 } = {}) {
    const n = SC.OPCOES[i];
    if (!TX[n] || k <= 0) return;
    const z = 0.7 + 0.3 * U.ease.outBack(Math.min(1, k));
    ctx.save(); ctx.globalAlpha *= alpha * Math.min(1, k * 2);
    ctx.translate(x + w / 2, y + h / 2); ctx.scale(z, z); ctx.translate(-(x + w / 2), -(y + h / 2));
    E.ret(ctx, x, y, w, h, { papel: 'superficie', r: 26, seed: 620 + i });
    letra(ctx, i, x + 70, y + h / 2, 40);
    const { size, ls } = caber(ctx, n, { sizes: [60, 54, 48, 44], maxLinhas: [1, 2, 2, 2], maxW: w - 250, papel: 'corpo' });
    const lh = size * fonte('corpo')[2] * 1.27;
    desenhar(ctx, n, ls, size, { align: 'left', x: x + 135, y0: y + h / 2 - ((ls.length - 1) * lh) / 2 + size * 0.36 });
    marca(ctx, VER()[i].chave, x + w - 70, y + h / 2, 1.1, kMarca);
    ctx.restore();
  }
  // o cartão em pé (resposta e fecho): a letra no alto, o texto embaixo; o selo vai abaixo dele
  function cartaoEmPe(ctx, i, x, y, w, h, { k = 1, vez = false } = {}) {
    const n = SC.OPCOES[i];
    if (!TX[n] || k <= 0) return;
    ctx.save(); ctx.globalAlpha *= Math.min(1, k * 2);
    E.ret(ctx, x, y, w, h, { papel: 'superficie', r: 24, seed: 640 + i });
    letra(ctx, i, x + w / 2, y + 62, 36, { vez });
    const { size, ls } = caber(ctx, n, { sizes: [46, 42, 38, 36], maxLinhas: [2, 2, 3, 3], maxW: w - 36, papel: 'corpo' });
    desenhar(ctx, n, ls, size, { cx: x + w / 2, y0: y + 150 });
    ctx.restore();
  }
  // a largura do selo (a palavra na letra do título, mais 60 de borda), pela mesma conta do kit
  const larguraSelo = (ctx, palavra, size) => wid(ctx, palavra || 'ERRADA', size, 'titulo') + 60;
  function selo(ctx, i, cx, cy, { k = 1, size = 60, rot = -0.08 } = {}) {
    const v = VER()[i];
    if (!v.valido || k <= 0) return;
    E.carimbo(ctx, v.palavra, cx, cy, { k, rot, papel: v.papel, size, seed: 41 + i * 7 });
  }
  // a fileira dos três cartões em pé, cada um com o selo embaixo (resposta e fecho); ks: quando cada selo bate
  function fileira(ctx, t, { y = 650, h = 230, ks = [1, 1, 1], kCartao = [1, 1, 1] } = {}) {
    const n = SC.OPCOES.length, gap = 24, w = (R - L - gap * (n - 1)) / n;
    let z = 54;
    while (z > 30 && VER().some((v) => v.valido && larguraSelo(ctx, v.palavra, z) > w - 4)) z -= 2;
    for (let i = 0; i < n; i++) {
      const x = L + i * (w + gap);
      cartaoEmPe(ctx, i, x, y, w, h, { k: kCartao[i] });
      selo(ctx, i, x + w / 2, y + h + 26 + z * 0.75, { k: ks[i], size: z, rot: [-0.1, 0.05, -0.07][i % 3] });
    }
    return { bottom: y + h + 26 + z * 1.5 };
  }
  // o relógio da contagem: o anel que esvazia em 3 s e o número (3, 2, 1); depois, vazio, no silêncio
  function relogio(ctx, t, cx, cy, r = 118) {
    const C = SC.CONTAGEM;
    if (!C) return;
    const kIn = U.ease.outBack(p01(t, C.t0 - 0.35, 0.3));
    if (kIn <= 0) return;
    const u = U.clamp((t - C.t0) / (C.t1 - C.t0), 0, 1);
    const resta = Math.max(0, Math.ceil(SC.CONTA - (t - C.t0) - 1e-6));
    ctx.save(); ctx.translate(cx, cy); ctx.scale(kIn, kIn);
    E.circulo(ctx, 0, 0, r, { papel: 'superficie', seed: 660, sombra: false });
    // o arco que falta: some no sentido do relógio
    const fim = -Math.PI / 2 + 2 * Math.PI * (1 - u), pts = [];
    for (let a = -Math.PI / 2; a <= fim + 1e-6 && u < 1; a += 0.12) pts.push([Math.cos(a) * (r - 16), Math.sin(a) * (r - 16)]);
    if (pts.length > 1) E.linha(ctx, pts, { papel: E.escuro() ? 'destaque' : 'alerta', lw: 14, seed: 661 }); // Marca-texto só no escuro (no claro ele some)
    if (t < C.t1 && resta > 0) {
      const pulso = 1 + 0.18 * Math.exp(-((t - C.t0) % 1) * 7);
      ctx.scale(pulso, pulso);
      escrever(ctx, String(resta), 0, r * 0.36, { size: Math.round(r * 1.05), papel: 'numero', align: 'center' });
    }
    ctx.restore();
  }
  // a pessoa do caso (PECA.PACIENTE): chega andando, sente (febre, dor), reage à resposta
  function paciente(ctx, t, { x = 290, y = 1440, s = 1.15, andando = false, gesto = null, boca = 'flat', olhos = null, look = 0.5, suor = 0 } = {}) {
    const Pc = P().PACIENTE || {};
    E.personagem(ctx, Object.assign({ quem: Pc.quem || 'moradora', style: Pc.style || {}, x, y, s, pose: andando ? 'walk' : 'stand', walk: andando ? t * 1.8 : 0, look, mouth: boca, gesture: andando ? null : gesto, brows: 'neutral', seed: 900 }, olhos ? { eyes: olhos } : {}, suor ? { sweat: suor } : {}));
  }
  // a ficha do caso: a prancheta com as pistas (PECA.PISTAS: { frase: ['D04', ...] }), cada uma com o ✓ quando entra
  function ficha(ctx, t, { x = 520, y = 640, w = 420, h = 560, tudo = false, k = 1 } = {}) {
    if (k <= 0) return null;
    const PI = P().PISTAS || {}, lista = [];
    for (const it of SC.cenas[0] && SC.cenas[0].tipo === 'caso' ? SC.cenas[0].itens : []) (PI[it.n] || []).forEach((dk, j) => lista.push({ dk, t0: it.t0 + 0.3 + 0.55 * j }));
    const z = 0.7 + 0.3 * U.ease.outBack(Math.min(1, k));
    ctx.save(); ctx.globalAlpha *= Math.min(1, k * 2);
    ctx.translate(x + w / 2, y + h / 2); ctx.scale(z, z); ctx.translate(-(x + w / 2), -(y + h / 2));
    E.ret(ctx, x, y, w, h, { papel: 'apoioEscuro', r: 18, seed: 680 });
    E.ret(ctx, x + 22, y + 34, w - 44, h - 56, { papel: 'superficie', r: 8, seed: 681, hachura: false });
    E.ret(ctx, x + w / 2 - 60, y - 14, 120, 40, { papel: 'tinta', r: 10, seed: 682, sombra: false, hachura: false });
    const passo = Math.min(118, (h - 110) / Math.max(1, lista.length));
    lista.forEach((p, j) => {
      const kk = tudo ? 1 : p01(t, p.t0, 0.35);
      if (kk <= 0) return;
      const ly = y + 100 + j * passo;
      marca(ctx, 'certa', x + 62, ly - 12, 0.6, kk);
      const { size, ls } = caber(ctx, `P${p.dk}`, { sizes: [42, 38, 36], maxLinhas: [1, 1, 2], maxW: w - 130, papel: 'mao', texto: D(p.dk) });
      ctx.save(); ctx.globalAlpha *= U.clamp(kk * 1.6, 0, 1);
      desenhar(ctx, `P${p.dk}`, ls, size, { align: 'left', x: x + 98, y0: ly - (ls.length - 1) * size * 0.6, papel: 'mao' });
      ctx.restore();
    });
    ctx.restore();
    return { x, y, w, h };
  }
  // o trilho: os três círculos A, B e C no canto de cima, à direita; o da vez acende; depois da resposta, cada um leva a marca
  function trilho(ctx, t, { atual = 0 } = {}) {
    const n = SC.OPCOES.length, r = 30, gap = 82, y = TOP + 36;
    for (let i = 0; i < n; i++) {
      const x = R - r - (n - 1 - i) * gap;
      letra(ctx, i, x, y, r, { vez: atual === i + 1 });
    }
  }
  // o cartão da vez no alto (porquê): a letra, o texto da opção e o selo pequeno
  function cabecalho(ctx, i) {
    const n = SC.OPCOES[i], y = TOP + 128;
    letra(ctx, i, L + 38, y - 4, 38, { vez: true });
    const v = VER()[i], zs = 40, ws = v.valido ? larguraSelo(ctx, v.palavra, zs) : 0;
    const { size, ls } = caber(ctx, n, { sizes: [62, 56, 50, 44], maxLinhas: [1, 1, 1, 2], maxW: R - L - 100 - ws - 24, papel: 'titulo' });
    desenhar(ctx, n, ls, size, { align: 'left', x: L + 96, y0: y + size * 0.36 - (ls.length - 1) * size * 0.6, papel: 'titulo' });
    if (v.valido) selo(ctx, i, R - ws / 2 - 6, y - 4, { size: zs, rot: -0.1 });
  }
  // o rótulo de uma parte (atenção primária, prevenção): D02 ou D03, no lugar do cartão da vez
  function rotuloParte(ctx, dk) {
    if (!D(dk)) return;
    const y = TOP + 150;
    escrever(ctx, D(dk), L + 4, y, { size: 62, papel: 'titulo' });
    const w = wid(ctx, D(dk), 62, 'titulo');
    E.linha(ctx, [[L, y + 22], [L + w + 10, y + 18]], { papel: 'destaque', lw: 6, seed: 33 });
  }
  // o tremor da batida
  function tremor(ctx, t, t0, a0 = 10) {
    if (!(t >= t0)) return;
    const a = a0 * Math.exp(-(t - t0) * 12);
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
    // nas cenas desenhadas pela peça, a frase troca seca, junto com o corte de plano; nas outras, esmaece
    const seca = ['porque', 'aps', 'prevencao'].includes(c.tipo);
    st.aTexto = seca ? 1 : Math.min(corte ? 1 : U.clamp((t - it.t0) / 0.2, 0, 1), ultima ? 1 : U.clamp((it.t1 - t) / 0.12, 0, 1));
    st.dyTexto = corte || seca ? 0 : (1 - U.ease.outCubic(U.clamp((t - it.t0) / 0.25, 0, 1))) * 16;
    st.desde = {}; c.itens.forEach((x) => { st.desde[x.n] = t - x.t0; });
    return st;
  }

  // o plano da frase da vez (PECA.PLANOS[n] = { x, y, z }): o ponto (x, y) do desenho vai para o meio da área, com zoom z.
  // A troca é seca, no começo da frase, como um corte de câmera (trecho sem corte acima de 12 s é aviso do conferir).
  function plano(ctx, n) {
    const pl = (P().PLANOS || {})[n];
    if (!pl || !(pl.z > 0)) return;
    const cy = AREA.y + AREA.h / 2;
    ctx.translate(CX, cy); ctx.scale(pl.z, pl.z); ctx.translate(-(pl.x != null ? pl.x : CX), -(pl.y != null ? pl.y : cy));
  }
  // o cartaz: nas frases pares de cada cena desenhada (a 2ª, a 4ª...), o desenho vai sobre um cartaz que cobre a área.
  // A troca lousa ⇄ cartaz muda um terço da imagem de uma vez: é o corte que o conferir mede (no giz, traço fino de giz
  // sobre a lousa muda pouco a imagem, e a troca da frase sozinha não conta como corte). A cor é a da superfície do
  // estilo; quando ela quase não se separa do fundo (papel sobre papel), vai a Sálvia. PECA.PAINEL = false desliga.
  const cinza = (h) => { const n = parseInt(String(h).slice(1, 7), 16); return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255); };
  const PAINEL = () => (Math.abs(cinza(cor('superficie')) - cinza(cor('fundo'))) >= 25 ? 'superficie' : 'apoio');
  // o desenho da peça, recortado na área (nada passa da margem direita, onde ficam os botões do Instagram)
  function area(ctx, st, desenho) {
    if (!desenho) return;
    if (P().PAINEL !== false && st.i % 2 === 1) E.ret(ctx, L - 14, AREA.y - 8, R - L + 22, AREA.h + 18, { papel: PAINEL(), r: 34, seed: 690 + st.i, sombra: false, hachura: false });
    ctx.save(); ctx.beginPath(); ctx.rect(L - 20, AREA.y - 12, R - L + 24, AREA.h + 26); ctx.clip();
    plano(ctx, st.it.n);
    desenho(ctx, st, globalThis.MV);
    ctx.restore();
  }

  // ---------- as cenas do tipo ----------
  const CENA = {};
  CENA.caso = (ctx, st) => {
    const t = st.t, c = st.c;
    if (P().CENARIO) P().CENARIO(ctx, st, globalThis.MV); // o lugar do caso, atrás de tudo (a peça desenha)
    E.chao(ctx, 1440);
    // a frase da vez como título; a seguinte entra no lugar dela
    titulo(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto, sizes: [72, 66, 60, 56] });
    // a pessoa entra andando pela esquerda logo no começo (o conferir quer movimento antes de 1 s)
    const u = p01(t, c.t0 + 0.05, 0.85);
    paciente(ctx, t, { x: U.lerp(-200, 285, U.ease.outCubic(u)), andando: u < 1, look: 0.62, boca: u < 1 ? 'flat' : 'wavy', suor: u < 1 ? 0 : 1 });
    ficha(ctx, t, { k: p01(t, c.t0 + 0.85, 0.3) });
    rotulo(ctx);
  };
  CENA.pergunta = (ctx, st) => {
    const t = st.t, c = st.c, C = SC.CONTAGEM;
    // no silêncio (contagem acabou), os cartões esperam parados e um pouco apagados
    const espera = C && t >= C.t1 ? 0.55 : 1;
    titulo(ctx, c.itens[0].n, { y0: TOP + 100 });
    const n = SC.OPCOES.length, h = 150, gap = 30, y0 = 520;
    for (let i = 0; i < n; i++) cartao(ctx, i, L, y0 + i * (h + gap), R - L, h, { k: p01(t, c.t0 + 0.3 + 0.3 * i, 0.25), alpha: espera });
    relogio(ctx, t, CX, y0 + n * (h + gap) + 150);
    trilho(ctx, t);
    rotulo(ctx);
  };
  CENA.resposta = (ctx, st) => {
    const t = st.t, c = st.c, n = SC.OPCOES.length;
    ctx.save(); tremor(ctx, t, c.t0, 8);
    const tt = titulo(ctx, c.itens[0].n, { y0: TOP + 100, sizes: [72, 66, 60, 56] });
    const ks = Array.from({ length: n }, (_, i) => p01(t, c.t0 + 0.55 + 0.4 * i, 0.18));
    const f = fileira(ctx, t, { y: Math.max(560, (tt ? tt.bottom : 500) + 70), ks });
    ctx.restore();
    // a pessoa reage: pensa (pode ser), joinha (uma certa), mão na testa (nenhuma)
    const vs = VER(), certas = vs.filter((v) => v.chave === 'certa').length, podes = vs.filter((v) => v.chave === 'pode').length;
    const gesto = podes ? 'think' : certas ? 'thumbsUp' : 'facepalm';
    // embaixo da fileira, menor, sem encostar nos selos (a pessoa tem uns 560 px de altura na escala 1)
    const sP = U.clamp((1480 - f.bottom - 30) / 560, 0, 0.85);
    if (sP >= 0.6) paciente(ctx, t, { x: CX, y: 1480, s: sP, gesto: t >= c.t0 + 0.55 + 0.4 * n ? gesto : null, boca: certas && !podes ? 'smile' : 'flat', look: 0.5 });
    trilho(ctx, t);
    rotulo(ctx);
  };
  CENA.porque = (ctx, st) => {
    const t = st.t, c = st.c;
    area(ctx, st, (P().PORQUE || {})[c.k]);
    bloco(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
    cabecalho(ctx, c.k - 1);
    trilho(ctx, t, { atual: c.k });
    rotulo(ctx);
  };
  CENA.aps = (ctx, st) => {
    area(ctx, st, P().APS);
    bloco(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
    rotuloParte(ctx, 'D02');
    rotulo(ctx);
  };
  CENA.prevencao = (ctx, st) => {
    area(ctx, st, P().PREVENCAO);
    bloco(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
    rotuloParte(ctx, 'D03');
    rotulo(ctx);
  };
  CENA.fecho = (ctx, st) => {
    const t = st.t, c = st.c, n = SC.OPCOES.length;
    if (P().CENARIO) P().CENARIO(ctx, st, globalThis.MV);
    E.chao(ctx, 1440);
    // volta ao caso: a mesma pessoa e a mesma ficha, agora com todas as pistas; os três selos, pequenos, em cima
    const tt = titulo(ctx, c.itens[0].n, { y0: TOP + 100, sizes: [66, 60, 56, 52], kDestaque: U.ease.inOutCubic(p01(t, c.t0 + 1.4, 0.5)) });
    const y = (tt ? tt.bottom : 520) + 70, gap = (R - L) / n;
    let z = 44;
    while (z > 28 && VER().some((v) => v.valido && larguraSelo(ctx, v.palavra, z) > gap - 30)) z -= 2;
    for (let i = 0; i < n; i++) {
      const x = L + gap * (i + 0.5), k = p01(t, c.t0 + 0.5 + 0.3 * i, 0.18);
      if (k <= 0) continue;
      letra(ctx, i, x, y, 28);
      selo(ctx, i, x, y + 50 + z * 0.75, { k, size: z, rot: [-0.1, 0.05, -0.07][i % 3] });
    }
    paciente(ctx, t, { x: 285, look: 0.62, boca: 'smile' });
    const yf = Math.max(700, y + 150 + z * 1.5);
    ficha(ctx, t, { tudo: true, y: yf, h: Math.min(560, 1420 - yf) });
    rotulo(ctx);
  };

  // o que a peça usa para desenhar (film-2-peca.js): MV.escrever, MV.p01, MV.area...
  globalThis.MV = { L, R, TOP, BOT, CX, D, cor, wid, escrever, quebrar, caber, desenhar, bloco, titulo, veredito, VER, rotulo, marca, letra, cartao, selo, relogio, paciente, ficha, trilho, tremor, p01, estado, CENA,
    area: AREA };
})();
