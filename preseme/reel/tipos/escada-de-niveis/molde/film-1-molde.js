// PRESEME · motor "escada de níveis" · desenho 1 · o molde (fixo: a peça não mexe neste arquivo)
// A escada (um degrau por nível, na ordem), a pessoa que sobe um degrau por cena, a placa de cada degrau, o corrimão
// (o que vale em todos os degraus), o quadro do que se faz em cada degrau e o texto da tela.
// Tudo é desenhado com o kit de estilos (globalThis.ESTILOS): a mesma peça sai em qualquer dos seis estilos.
// A peça preenche o film-2-peca.js (a pessoa, o desenho de cada quadro e os destaques do texto) e o score.js (ROTEIRO).
// Palavras de dentro do desenho, do textos.txt: [D01] a [D05] = o nome de cada degrau; [D06] = o nome do corrimão.
(function () {
  const U = globalThis.U, G = globalThis.G, E = globalThis.ESTILOS, SC = globalThis.SCORE, TX = globalThis.TEXTOS;
  if (!E) throw new Error('escada: falta o kit de estilos (a linha ferramentas/estilos.js no index.html, antes do gfx.js)');
  const SAFE = G.SAFE;
  const L = SAFE.x, R = SAFE.x + SAFE.w, TOP = SAFE.y, CX = (L + R) / 2;
  const p01 = (t, t0, d) => U.clamp((t - t0) / Math.max(1e-6, d), 0, 1);
  const NB = ' ';

  // ---------- a geometria: sai do número de degraus do ROTEIRO (de 1 a 5) ----------
  const N = Math.max(1, Math.min(5, SC.NDEGRAUS));
  const CHAO = 1470; // o chão, onde a escada começa (acima da faixa de baixo que o Instagram cobre)
  const X0 = L + 150, X1 = R - 6; // antes do X0, o chão onde a pessoa espera
  const PASSO = (X1 - X0) / N; // a largura de cada degrau
  // a altura de cada degrau (no máximo 105 px): com 3 degraus, quem está no degrau 2 fica com a cabeça abaixo do quadro
  const ALTURA = Math.min(105, 420 / N);
  const xDe = (k) => X0 + (k - 1) * PASSO; // a esquerda do degrau k
  const yDe = (k) => CHAO - Math.max(0, k) * ALTURA; // o piso do degrau k (k = 0: o chão)
  const meio = (k) => (k <= 0 ? X0 - 80 : xDe(k) + PASSO / 2); // onde a pessoa pisa no degrau k
  // o quadro do que se faz no degrau (em cima, à esquerda): acaba antes da cabeça de quem está no degrau 2 e à esquerda
  // de quem está no degrau 3 (com 3 degraus; com mais degraus a escada fica mais baixa e sobra mais espaço)
  const PAINEL = { x: L, y: 520, w: 640, h: 330 };
  const S_P = 0.72; // o tamanho da pessoa
  const TEXTO_Y = TOP + 112; // a primeira linha da frase da vez
  // o corrimão: paralelo à linha das quinas dos degraus, uns 160 px acima do meio de cada piso
  const OFF = 160 - ALTURA / 2;
  const railY = (x) => CHAO - ALTURA - OFF - (x - X0) * (ALTURA / PASSO);
  const RA = X0 + 20, RB = X1 - 30;

  // ---------- o que a peça preenche (film-2-peca.js) ----------
  const P = {
    DESTAQUE: {}, // o trecho de cada frase que leva o destaque do estilo: P.DESTAQUE[3] = 'prevenção primária'
    PESSOA: { quem: 'moradora', style: {}, gestos: {} }, // quem sobe (moradora, calouro ou agente, do kit) e o gesto em cada cena
    PAINEL: {}, // o desenho do quadro de cada cena: P.PAINEL.degrau1 = (ctx, caixa, o) => { ... }
  };
  const nomeDegrau = (k) => TX['D0' + k] || String(k);
  const nomeCorrimao = () => TX.D06 || '';

  // ---------- o texto da tela (do textos.js), centrado, com o destaque do estilo ----------
  const med = (ctx, s, size, papel) => E.medir(ctx, s, { papel, size });
  function quebrar(ctx, s, size, maxW, papel) {
    const out = []; let cur = '';
    for (const w of s.split(' ')) {
      const t = cur ? cur + ' ' + w : w;
      if (cur && med(ctx, t.split(NB).join(' '), size, papel) > maxW) { out.push(cur); cur = w; } else cur = t;
    }
    if (cur) out.push(cur);
    return out;
  }
  // a mesma quantidade de linhas, com as linhas de tamanho parecido e sem palavrinha solta no fim
  const FRACA = new Set(['a', 'o', 'as', 'os', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'e', 'em', 'no', 'na', 'nos', 'nas', 'que', 'é', 'à', 'às', 'ao', 'para', 'por', 'com', 'se', 'seu', 'sua', 'esta', 'este', 'essa', 'esse', 'mais', 'menos']);
  function equilibrar(ctx, s, size, maxW, papel) {
    const base = quebrar(ctx, s, size, maxW, papel), k = base.length;
    if (k < 2) return base;
    let melhor = base, nota = Infinity;
    for (let w = maxW; w > maxW * 0.45; w -= 20) {
      const ls = quebrar(ctx, s, size, w, papel);
      if (ls.length !== k) break;
      const ws = ls.map((l) => med(ctx, l.split(NB).join(' '), size, papel));
      const fracas = ls.slice(0, -1).filter((l) => FRACA.has(l.split(' ').pop().toLowerCase().replace(/[.,;:!?]/g, ''))).length;
      const n = Math.max(...ws) - Math.min(...ws) + 400 * fracas;
      if (n < nota) { nota = n; melhor = ls; }
    }
    return melhor;
  }
  const memo = new Map();
  function linhasDe(ctx, n, size, maxW, papel) {
    const key = [n, size, maxW, papel].join(':');
    if (!memo.has(key)) {
      let s = TX[n] || ''; const d = P.DESTAQUE[n];
      if (d && s.includes(d)) s = s.replace(d, d.split(' ').join(NB)); // o trecho destacado não se parte em duas linhas
      memo.set(key, equilibrar(ctx, s, size, maxW, papel));
    }
    return memo.get(key);
  }
  function desenharLinhas(ctx, ls, n, size, y0, lh, papel, kDest, alpha) {
    const d = P.DESTAQUE[n];
    ls.forEach((l, i) => {
      const s = l.split(NB).join(' ');
      E.textoComDestaque(ctx, s, d && s.includes(d) ? d : '', CX, y0 + i * lh, { papel, size, align: 'center', k: kDest, seed: 7 + n * 3 + i, alpha });
    });
  }
  // a frase da vez: a primeira linha em y0; letra 58 até 2 linhas; 54, 50 ou 46 até 3 linhas. Devolve o y de baixo.
  function bloco(ctx, n, { y0 = TEXTO_Y, sizes = [58, 54, 50, 46], maxLinhas = [2, 3, 3, 3], maxW = R - L, alpha = 1, dy = 0, kDest = 1, papel = 'corpo' } = {}) {
    if (!TX[n]) return y0;
    let size = sizes[sizes.length - 1], ls = null;
    for (let i = 0; i < sizes.length; i++) {
      const t = linhasDe(ctx, n, sizes[i], maxW, papel);
      if (t.length <= maxLinhas[i] && t.every((l) => med(ctx, l.split(NB).join(' '), sizes[i], papel) <= maxW)) { size = sizes[i]; ls = t; break; }
    }
    if (!ls) ls = linhasDe(ctx, n, size, maxW, papel);
    const lh = size * E.letra(papel)[2] * 1.24;
    ctx.save(); ctx.translate(0, dy);
    desenharLinhas(ctx, ls, n, size, y0, lh, papel, kDest, alpha);
    ctx.restore();
    return y0 + (ls.length - 1) * lh;
  }
  // a pergunta grande da abertura (até 3 linhas). Devolve o y da última linha.
  function titulo(ctx, n, { y0 = TOP + 150, alpha = 1, kDest = 1 } = {}) {
    return bloco(ctx, n, { y0, sizes: [96, 86, 76, 68], maxLinhas: [2, 3, 3, 3], alpha, kDest, papel: 'titulo' });
  }

  // ---------- o estado do filme no instante t ----------
  // c = a cena, it = a frase da vez, i = qual frase da cena, tc = segundos desde o corte. A primeira frase da cena entra
  // junto com a imagem (corte); as outras surgem em 0,2 s. Toda frase some 0,12 s antes da seguinte.
  function estado(t) {
    const c = SC.cenaEm(t);
    let i = 0;
    c.itens.forEach((x, j) => { if (t >= x.t0) i = j; });
    const it = c.itens[i], ultima = i === c.itens.length - 1, corte = i === 0;
    return {
      t, c, it, i, tc: t - c.t0, u: (t - c.t0) / Math.max(1e-6, c.t1 - c.t0),
      aTexto: Math.min(corte ? 1 : U.clamp((t - it.t0) / 0.2, 0, 1), ultima ? 1 : U.clamp((it.t1 - t) / 0.12, 0, 1)),
      dyTexto: corte ? 0 : (1 - U.ease.outCubic(U.clamp((t - it.t0) / 0.25, 0, 1))) * 16,
      kDest: U.ease.inOutCubic(U.clamp((t - it.t0 - 0.25) / 0.45, 0, 1)),
    };
  }

  // ---------- a escada ----------
  // aceso: até que degrau a escada está acesa; atual: o degrau da cena; destaque: o degrau que responde no fecho
  function escada(ctx, { aceso = 0, atual = 0, kAtual = 1, destaque = 0, kDestaque = 0 } = {}) {
    for (let k = 1; k <= N; k++) {
      const x = xDe(k), y = yDe(k);
      const luz = k < atual || (k <= aceso && k !== atual) ? 1 : k === atual ? kAtual : 0; // 0 = apagado, 1 = aceso
      const papel = k === destaque && kDestaque > 0 ? 'destaque' : k === atual && luz > 0.5 ? 'apoio' : 'superficie';
      E.ret(ctx, x, y, PASSO + 1, CHAO - y, { papel, r: 4, seed: 400 + k, sombra: false, alpha: 0.32 + 0.68 * luz });
    }
  }
  // a placa do degrau: o número no círculo e o nome; k faz ela entrar (cresce e assenta);
  // enfase (0 a 1): no fecho, a placa do degrau que responde cresce e ganha um anel
  function placa(ctx, k, kp = 1, { soNumero = false, alpha = 1, enfase = 0 } = {}) {
    if (kp <= 0) return;
    const nome = nomeDegrau(k), x = xDe(k), y = yDe(k), alto = CHAO - y;
    // o número no alto do degrau, no meio; o nome logo embaixo, no tamanho que couber na largura (de 42 a 22 px)
    const r = alto >= 120 ? 26 : 20, cx = x + PASSO / 2, cy = y + r + 14;
    const esc = U.ease.outBack(Math.min(1, kp)), mais = 1 + 0.22 * U.ease.outBack(U.clamp(enfase, 0, 1)); // só o número cresce
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(cx, cy); ctx.scale(esc, esc); ctx.translate(-cx, -cy);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(mais, mais); ctx.translate(-cx, -cy);
    if (enfase > 0) E.circulo(ctx, cx, cy, r + 13, { papel: null, tinta: 'alerta', seed: 510 + k, sombra: false, hachura: false, lw: 6, alpha: U.clamp(enfase, 0, 1) });
    E.circulo(ctx, cx, cy, r, { papel: 'superficie', seed: 500 + k, sombra: false, hachura: false, lw: 3 });
    E.texto(ctx, String(k), cx, cy + r * 0.46, { papel: 'numero', size: r * 1.3, align: 'center' });
    ctx.restore();
    if (soNumero) { ctx.restore(); return; }
    let size = 42;
    while (size > 22 && med(ctx, nome, size, 'corpo') > PASSO - 20) size -= 2;
    E.texto(ctx, nome, cx, Math.min(cy + r + 14 + size * 0.75, CHAO - 12), { papel: 'corpo', size, align: 'center' });
    ctx.restore();
  }
  // o corrimão: os pilares sobem um por um, o corrimão corre da base ao topo; aceso = o destaque do estilo por baixo
  function corrimao(ctx, { k = 1, aceso = 0, kPlaca = 1 } = {}) {
    if (k <= 0) return;
    for (let j = 1; j <= N; j++) {
      const x = meio(j), kj = U.clamp(k * (N + 1) - (j - 1), 0, 1);
      E.linha(ctx, [[x, yDe(j)], [x, railY(x)]], { papel: 'tinta', lw: 6, k: kj, seed: 600 + j });
    }
    const kr = U.clamp(k * 1.25 - 0.25, 0, 1);
    if (aceso > 0) E.linha(ctx, [[RA, railY(RA)], [RB, railY(RB)]], { papel: 'destaque', lw: 30, k: aceso, seed: 611 });
    E.linha(ctx, [[RA, railY(RA)], [RB, railY(RB)]], { papel: 'tinta', lw: 13, k: kr, seed: 612 });
    const nome = nomeCorrimao();
    if (!nome || kPlaca <= 0) return;
    // a placa do corrimão: um rótulo em cima do terço de baixo, com um traço até ele
    const px = RA + (RB - RA) * 0.12, py = railY(px) - 92; // no começo do corrimão: no fecho, a pessoa fica mais acima
    let size = 42; while (size > 22 && med(ctx, nome, size, 'corpo') > 330) size -= 2;
    const w = med(ctx, nome, size, 'corpo') + 40, h = size * 1.5;
    const esc = U.ease.outBack(Math.min(1, kPlaca));
    ctx.save(); ctx.translate(px, py); ctx.scale(esc, esc); ctx.translate(-px, -py);
    E.linha(ctx, [[px, py + h / 2], [px, railY(px) - 8]], { papel: 'tinta', lw: 4, seed: 620 });
    E.ret(ctx, px - w / 2, py - h / 2, w, h, { papel: 'destaque', r: 12, seed: 621, sombra: false, hachura: false });
    E.texto(ctx, nome, px, py + size * 0.36, { papel: 'corpo', size, align: 'center' });
    ctx.restore();
  }
  // onde fica a mão no corrimão, para quem está no degrau k (relativo aos pés, sem a escala)
  const maoNoCorrimao = (k) => { const x = meio(k) + 66; return [66 / S_P, (railY(x) - yDe(k)) / S_P]; };

  // ---------- a pessoa: a mesma do começo ao fim ----------
  // de -> para: os degraus da subida (0 = o chão); q de 0 a 1: quanto da subida já foi
  function pessoa(ctx, de, para, q, { gesto = null, look = 0.2, lookY = 0, mouth = 'smile', handR = null, seed = 300 } = {}) {
    const e = U.ease.inOutCubic(U.clamp(q, 0, 1));
    const x = U.lerp(meio(de), meio(para), e);
    const y = U.lerp(yDe(de), yDe(para), e) - Math.sin(e * Math.PI) * (de === para ? 0 : 30);
    const andando = de !== para && q > 0 && q < 1;
    const cfg = P.PESSOA;
    const o = Object.assign({ quem: cfg.quem || 'moradora', style: cfg.style || {}, x, y, s: S_P, seed, look, lookY, mouth },
      andando ? { pose: 'walk', walk: e } : { pose: 'stand', gesture: gesto || undefined, handR: handR || undefined });
    // na planta, o kit pinta tudo em aguada (meio transparente): a pessoa passa cinco vezes para ficar firme na frente
    // da escada e do corrimão (o que fica atrás dela não aparece através do corpo)
    const vezes = E.nome === 'planta' ? 5 : 1;
    for (let v = 0; v < vezes; v++) E.personagem(ctx, o);
  }

  // ---------- o quadro do que se faz no degrau ----------
  // fn(ctx, caixa, o): caixa = { x, y, w, h } (a área de dentro do quadro); o.k = a entrada do quadro (0 a 1);
  // o.i = qual frase da cena está na tela (0, 1, 2…); o.ti = segundos desde que essa frase entrou; o.tc = desde o corte
  // o quadro fica à esquerda da pessoa quando a cabeça dela chega à altura dele (com 4 ou 5 degraus, ele estreita
  // nos degraus do meio); 390 px é a altura dela com o coque, e 120 px a folga para o braço levantado
  function caixaDoPainel(c) {
    const k = c.tipo === 'degrau' ? c.degrau : c.de || 0, topo = yDe(k) - 390 * (S_P / 0.72);
    const dir = topo < PAINEL.y + PAINEL.h + 10 ? Math.min(PAINEL.x + PAINEL.w, meio(k) - 120) : PAINEL.x + PAINEL.w;
    return { x: PAINEL.x, y: PAINEL.y, w: Math.max(380, dir - PAINEL.x), h: PAINEL.h };
  }
  function painel(ctx, st, fn) {
    const a = U.ease.outCubic(p01(st.tc, 0.15, 0.35));
    if (a <= 0) return;
    const { x, y, w, h } = caixaDoPainel(st.c);
    ctx.save(); ctx.globalAlpha *= a;
    const esc = 0.94 + 0.06 * a;
    ctx.translate(x + w / 2, y + h / 2); ctx.scale(esc, esc); ctx.translate(-(x + w / 2), -(y + h / 2));
    E.ret(ctx, x, y, w, h, { papel: 'superficie', r: 18, seed: 700, sombra: true });
    fn(ctx, { x: x + 22, y: y + 22, w: w - 44, h: h - 44 }, { t: st.t, k: a, i: st.i, ti: st.t - st.it.t0, tc: st.tc, c: st.c, E, U, G });
    ctx.restore();
  }

  // ---------- quadros prontos: o desenho de dentro do quadro, já feito ----------
  // A peça só diz as palavras (chaves [Dnn] do textos.txt, como 'D10', ou o texto direto) e os tempos:
  // frase = a partir de qual frase da cena (0 = a primeira) a coisa acontece; quando = segundos depois que essa frase entrou.
  // Cada um devolve o desenho para P.PAINEL (ex.: P.PAINEL.degrau1 = P.PRONTO.lista(['D10', 'D11'], { frase: 1 })).
  // Desenho que não está aqui, a peça faz à mão com o kit (ver o comentário do film-2-peca.js).
  const PR = {};
  const pal = (k) => (k && TX[k]) || k || '';
  // quanto de um acontecimento já foi (0 a 1): antes da frase dele, 0; na frase, sobe de quando até quando + dur; depois, 1
  const ja = (o, frase, quando, dur = 0.35) => (o.i > frase ? 1 : o.i < frase ? 0 : p01(o.ti, quando, dur));
  const caber = (ctx, s, size, maxW, papel = 'mao') => { while (size > 22 && med(ctx, s, size, papel) > maxW) size -= 2; return size; };
  const visto = (ctx, x, y, s, k, seed) => E.linha(ctx, [[x, y], [x + s * 0.35, y + s * 0.35], [x + s, y - s * 0.45]], { papel: 'alerta', lw: 7, k, seed });
  // uma folha de exame ou de papel, com duas linhas escritas
  function folha(ctx, x, y, w, h, { papel = 'superficie', alpha = 1, seed = 0 } = {}) {
    E.ret(ctx, x, y, w, h, { papel, r: 4, seed, sombra: false, hachura: false, lw: 3, alpha });
    ctx.save(); ctx.globalAlpha *= alpha;
    E.linha(ctx, [[x + w * 0.2, y + h * 0.38], [x + w * 0.8, y + h * 0.38]], { lw: 3, seed: seed + 1 });
    E.linha(ctx, [[x + w * 0.2, y + h * 0.62], [x + w * 0.62, y + h * 0.62]], { lw: 3, seed: seed + 2 });
    ctx.restore();
  }
  // lista com caixinha: cada item ganha o visto (✓) quando a frase chega nele. quando = [segundos de cada item]
  PR.lista = (itens, { frase = 0, quando = [] } = {}) => (ctx, b, o) => {
    const n = itens.length, lh = Math.min(76, (b.h - 12) / n), lado = Math.min(46, lh * 0.62), y0 = b.y + (b.h - n * lh) / 2;
    const xt = b.x + 12 + lado + 24, size = Math.min(...itens.map((k) => caber(ctx, pal(k), Math.min(54, lh * 0.7), b.x + b.w - xt)));
    itens.forEach((k, j) => {
      const y = y0 + j * lh, kv = ja(o, frase, quando[j] ?? 0.4 + 0.9 * j, 0.3);
      E.ret(ctx, b.x + 12, y + (lh - lado) / 2, lado, lado, { papel: null, r: 6, seed: 900 + j, sombra: false, hachura: false, lw: 3 });
      if (kv > 0) visto(ctx, b.x + 18, y + lh / 2 + 2, lado * 0.75, kv, 910 + j);
      E.texto(ctx, pal(k), xt, y + lh / 2 + size * 0.36, { papel: 'mao', size, alpha: kv > 0 ? 1 : 0.5 });
    });
  };
  // régua: de uma ponta à outra, com as marcas iguais (ex.: de 50 a 74 anos, 13 exames); rotulo vai em cima.
  // marca = { n: qual marca (0 = a primeira), frase, quando, carimbo }: um anel na marca e, se quiser, um carimbo embaixo
  PR.regua = ({ de = '', ate = '', marcas = 5, rotulo = '', frase = 0, quando = 0.3, marca = null } = {}) => (ctx, b, o) => {
    const xa = b.x + 22, xb = b.x + b.w - 22, ya = b.y + Math.round(b.h * 0.44), kr = ja(o, frase, quando, 1.4);
    if (kr <= 0) return;
    const km = marca ? ja(o, marca.frase ?? frase, marca.quando ?? 0.5, 0.4) : 0;
    E.linha(ctx, [[xa, ya], [xb, ya]], { lw: 5, k: kr, seed: 930 });
    for (let j = 0; j < marcas; j++) {
      const x = xa + ((xb - xa) * j) / Math.max(1, marcas - 1), kt = U.clamp(kr * marcas - j, 0, 1);
      if (kt <= 0) break;
      E.circulo(ctx, x, ya, 10 + 3 * kt, { papel: marca && j === marca.n && km > 0 ? 'destaque' : 'superficie', seed: 931 + j, sombra: false, hachura: false, lw: 3 });
    }
    if (kr >= 1) {
      const zs = caber(ctx, pal(de) + '   ' + pal(ate), 46, b.w - 30);
      E.texto(ctx, pal(de), xa - 8, ya + 64, { papel: 'mao', size: zs, align: 'left' });
      E.texto(ctx, pal(ate), xb + 8, ya + 64, { papel: 'mao', size: zs, align: 'right' });
      if (rotulo) E.texto(ctx, pal(rotulo), (xa + xb) / 2, ya - 46, { papel: 'mao', size: caber(ctx, pal(rotulo), 50, b.w - 20), align: 'center' });
    }
    if (marca && km > 0) {
      const x = xa + ((xb - xa) * marca.n) / Math.max(1, marcas - 1);
      E.circulo(ctx, x, ya, 30, { papel: null, tinta: 'alerta', seed: 950, sombra: false, hachura: false, lw: 5, alpha: km });
      if (marca.carimbo) E.carimbo(ctx, pal(marca.carimbo), b.x + b.w / 2 + 40, ya + b.h * 0.41, { k: km, size: 48, seed: 951 });
    }
  };
  // lupa: procura e acha um ponto pequeno (o que se acha cedo)
  PR.lupa = ({ frase = 0, quando = 1.0 } = {}) => (ctx, b, o) => {
    const cx = b.x + b.w / 2 - 30, cy = b.y + b.h / 2 - 20, r = Math.min(104, b.h * 0.33), kp = ja(o, frase, quando, 0.35);
    E.circulo(ctx, cx, cy, r, { papel: 'superficie', seed: 920, sombra: false, hachura: false, lw: 5 });
    if (kp > 0) {
      E.circulo(ctx, cx + 16, cy - 10, 13 * U.ease.outBack(kp), { papel: 'tinta', seed: 921, sombra: false, hachura: false });
      E.circulo(ctx, cx + 16, cy - 10, 36, { papel: null, tinta: 'alerta', seed: 922, sombra: false, hachura: false, lw: 5, alpha: kp });
    }
    E.linha(ctx, [[cx + r * 0.7, cy + r * 0.7], [cx + r * 1.4, cy + r * 1.3]], { lw: 18, seed: 923 });
  };
  // trilha: etapas uma embaixo da outra, e um ponto (a pessoa) que desce de uma para a outra.
  // anda = [{ frase, quando, para }]: em que frase e segundo o ponto vai até a etapa "para" (0 = a primeira)
  PR.trilha = (itens, { destaque = -1, anda = [] } = {}) => (ctx, b, o) => {
    const n = itens.length, x = b.x + 44, lh = (b.h - 80) / Math.max(1, n - 1), ys = itens.map((_, j) => b.y + 40 + j * lh);
    const size = Math.min(...itens.map((k) => caber(ctx, pal(k), Math.min(56, lh * 0.62), b.w - 80)));
    E.linha(ctx, [[x, ys[0]], [x, ys[n - 1]]], { lw: 5, seed: 960 });
    let pos = 0;
    for (const a of anda) pos = U.lerp(pos, a.para, U.ease.inOutCubic(ja(o, a.frase, a.quando ?? 0.8, 0.9)));
    itens.forEach((k, j) => {
      E.circulo(ctx, x, ys[j], 28, { papel: j === destaque ? 'destaque' : 'superficie', seed: 961 + j, sombra: false, hachura: false, lw: 4 });
      E.texto(ctx, pal(k), x + 60, ys[j] + size * 0.33, { papel: 'mao', size, alpha: pos >= j - 0.5 ? 1 : 0.5 });
    });
    const j0 = U.clamp(Math.floor(pos), 0, n - 1), j1 = Math.min(n - 1, j0 + 1);
    E.circulo(ctx, x, U.lerp(ys[j0], ys[j1], pos - j0), 13, { papel: 'tinta', seed: 965, sombra: false, hachura: false });
  };
  // pilha: folhas que sobem uma por uma e passam da linha tracejada (o que ajuda); as de cima ficam no alerta.
  // total = quantas folhas; acima = quantas passam da linha; rotulo = o nome do que passou (ex.: 'exame a mais')
  PR.pilha = ({ total = 7, acima = 3, rotulo = '', frase = 0, quando = 0.5 } = {}) => (ctx, b, o) => {
    const h = Math.min(38, (b.h - 20) / total - 2), w = Math.min(200, b.w * 0.34), x = b.x + 22, lim = b.y + b.h - 8 - (total - acima) * (h + 2) - 1;
    for (let j = 0; j < total; j++) {
      const kj = ja(o, frase, quando + j * 0.22, 0.2);
      if (kj <= 0) break;
      const y = b.y + b.h - 8 - (j + 1) * (h + 2), passou = j >= total - acima;
      folha(ctx, x + (j % 2 ? 10 : -6), y - (1 - kj) * 20, w, h, { papel: passou ? 'alerta' : 'superficie', alpha: passou ? 0.75 : 1, seed: 970 + j * 3 });
    }
    const kl = ja(o, frase, quando + total * 0.22 + 0.2, 0.6);
    E.linha(ctx, [[b.x + 10, lim], [b.x + b.w - 10, lim]], { lw: 4, k: kl, tracejado: true, seed: 990 });
    if (kl >= 1 && rotulo) E.texto(ctx, pal(rotulo), b.x + b.w - 6, lim - 30, { papel: 'mao', size: caber(ctx, pal(rotulo), 48, b.w - w - 60), align: 'right' });
  };
  // fileiras: uma fileira de folhas por linha, para comparar quantas vezes (ex.: todo ano × a cada 2 anos).
  // linhas = [{ rotulo, marcas: [posições de 0 a 4], apagada }]; visto = { linha, frase, quando }; carimbo = { k, linha, frase, quando }
  PR.fileiras = (linhas, { frase = 0, quando = 0.3, visto: vi = null, carimbo = null } = {}) => (ctx, b, o) => {
    const sx = 58, sh = 72, x0 = b.x + 36, passo = (b.w - 72 - sx) / 4, dy = (b.h - 30) / Math.max(1, linhas.length);
    linhas.forEach((l, r) => {
      const y = b.y + 44 + r * dy;
      E.texto(ctx, pal(l.rotulo), b.x + 8, y, { papel: 'mao', size: caber(ctx, pal(l.rotulo), 46, b.w - 70) });
      (l.marcas || []).forEach((a, j) => {
        const kf = ja(o, frase, quando + r * 1.2 + j * 0.15, 0.2);
        if (kf > 0) folha(ctx, x0 + a * passo, y + 14 + (1 - kf) * 12, sx, sh, { alpha: l.apagada ? 0.7 : 1, seed: 1000 + r * 20 + j * 3 });
      });
    });
    if (vi) { const kv = ja(o, vi.frase ?? frase, vi.quando ?? 1, 0.3); if (kv > 0) visto(ctx, b.x + b.w - 52, b.y + 44 + vi.linha * dy - 14, 42, kv, 1040); }
    if (carimbo) { const kc = ja(o, carimbo.frase ?? frase, carimbo.quando ?? 1, 0.4); if (kc > 0) E.carimbo(ctx, pal(carimbo.k), b.x + b.w / 2 + 10, b.y + 44 + (carimbo.linha || 0) * dy + 50, { k: kc, size: 50, seed: 1041 }); }
  };
  // um desenho por trecho da cena: porFrase([[0, desenhoA], [2, desenhoB]]) = A nas frases 0 e 1, B da frase 2 em diante
  PR.porFrase = (lista) => (ctx, b, o) => {
    let fn = null;
    for (const [f, d] of lista) if (o.i >= f) fn = d;
    if (fn) fn(ctx, b, o);
  };
  // dois desenhos juntos, um por cima do outro
  PR.juntos = (...fs) => (ctx, b, o) => fs.forEach((f) => f(ctx, b, o));
  P.PRONTO = PR;

  // ---------- um quadro do filme ----------
  function quadro(ctx, t) {
    const st = estado(t), c = st.c, tc = st.tc, cfg = P.PESSOA, gestos = cfg.gestos || {};
    E.fundo(ctx);
    E.chao(ctx, CHAO);
    const temCorrimao = SC.cenas.some((x) => x.tipo === 'corrimao');
    if (c.tipo === 'abertura') {
      escada(ctx, { aceso: 0 });
      for (let k = 1; k <= N; k++) placa(ctx, k, 1, { soNumero: true, alpha: 0.45 });
      pessoa(ctx, 0, 0, 1, { gesto: gestos.abertura || 'think', look: 0.6, lookY: -0.4, mouth: 'flat' });
      const yT = titulo(ctx, c.itens[0].n, { kDest: U.ease.inOutCubic(p01(tc, 0.4, 0.5)) });
      if (st.i >= 1) bloco(ctx, st.it.n, { y0: yT + 120, alpha: st.aTexto, dy: st.dyTexto, kDest: st.kDest });
      return;
    }
    if (c.tipo === 'degrau') {
      const kAtual = U.ease.outCubic(p01(tc, SC.SUBIDA - 0.25, 0.35));
      escada(ctx, { aceso: c.degrau, atual: c.degrau, kAtual });
      for (let k = 1; k <= c.degrau; k++) placa(ctx, k, k < c.degrau ? 1 : p01(tc, SC.PLACA, 0.35));
      pessoa(ctx, c.de, c.degrau, tc / SC.SUBIDA, { gesto: gestos[c.id] || null, look: -0.3 });
    } else if (c.tipo === 'corrimao') {
      escada(ctx, { aceso: N });
      for (let k = 1; k <= N; k++) placa(ctx, k, 1);
      const kr = p01(tc, SC.RIL.de, SC.RIL.ate - SC.RIL.de);
      corrimao(ctx, { k: kr, aceso: U.ease.outCubic(p01(tc, SC.RIL.ate, 0.4)), kPlaca: p01(tc, SC.RIL.ate, 0.35) });
      const k = c.de || N;
      pessoa(ctx, k, k, 1, { gesto: gestos[c.id] || null, look: -0.3, handR: kr >= 1 ? maoNoCorrimao(k) : null });
    } else if (c.tipo === 'escada') {
      const d = c.destaque || 0, kd = U.ease.outCubic(p01(tc, SC.MARCA, 0.35));
      escada(ctx, { aceso: N, destaque: d, kDestaque: kd });
      // o degrau que responde: a coluna acende no destaque, a placa cresce e ganha o anel, e a pessoa vai até ele
      for (let k = 1; k <= N; k++) placa(ctx, k, 1, { enfase: k === d ? U.ease.outCubic(p01(tc, SC.MARCA, 0.4)) : 0 });
      if (temCorrimao) corrimao(ctx, { k: 1, aceso: 1, kPlaca: 1 });
      const de = c.de || N, para = d || de;
      pessoa(ctx, de, para, tc / SC.SUBIDA, { gesto: gestos[c.id] || gestos.escada || 'thumbsUp', look: 0.2 });
    }
    const fn = P.PAINEL[c.id] || P.PAINEL[c.tipo];
    if (fn) painel(ctx, st, fn);
    bloco(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto, kDest: st.kDest });
  }

  globalThis.ESCADA = Object.assign(P, { quadro, estado, bloco, titulo, escada, placa, corrimao, pessoa, painel, caixaDoPainel, N, CHAO, X0, X1, PASSO, ALTURA, xDe, yDe, meio, railY, PAINEL, S_P, TEXTO_Y, L, R, TOP, CX });
})();
