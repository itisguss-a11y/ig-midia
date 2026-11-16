// PRESEME · motor do tipo "antes e depois" · desenho 1/3 · o molde (igual em toda peça deste tipo; o chat não mexe aqui)
// O "mundo" de cada tempo (o fundo, o lugar da peça, o carimbo do ano e a placa do número), a cortina que divide a tela
// entre os dois mundos (o antes sempre à esquerda da linha, o depois à direita), a gravura que envelhece o antes, o texto
// que se quebra sozinho com o trecho no destaque, o estado do filme em cada instante e o KIT do desenho da peça.
// Tudo é desenhado com o kit de estilos (globalThis.ESTILOS): a mesma peça sai em qualquer dos seis estilos.
// Todo texto da tela vem do textos.js. O que é de uma peça só (o lugar, os desenhos, os destaques) está em film-2-peca.js.
(function () {
  const U = globalThis.U, G = globalThis.G, E = globalThis.ESTILOS, SC = globalThis.SCORE, TX = globalThis.TEXTOS;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const L = SAFE.x, R = SAFE.x + SAFE.w, TOP = SAFE.y, BOT = SAFE.y + SAFE.h, CX = (L + R) / 2; // 60, 940, 221, 1498, 500
  // o desenho da tela: a frase em cima (fora do mundo); do MUNDO_Y para baixo, o mundo do tempo: o carimbo do ano na
  // borda de cima do lugar, o lugar (faixa da largura toda) e a placa do número embaixo, do lado do tempo dela
  const TEXTO_Y = 285, TITULO_Y = 334; // a base da primeira linha da frase; a da pergunta da capa (dentro do recorte da grade)
  const MUNDO_Y = 512;
  const PALCO = { y0: 576, y1: 1236 }; // o lugar: a peça desenha em 1080 × 660
  const PALCO_ACAO = { y0: 576, y1: 1490 }; // na ação, o lugar de perto ocupa também a faixa das placas
  const PLACA = { y0: 1262, y1: 1490, w: 430 }; // a do antes vai de L a L + 430; a do depois, de R − 430 a R
  const MEIO = CX; // onde a tela se divide (a capa e o "separar"): as duas placas cabem inteiras, uma de cada lado
  const NB = '\u00A0'; // espaço que não quebra: o trecho do destaque fica numa linha só
  const P = () => globalThis.PECA || {};
  const D = (k) => TX[k] || '';
  const prog = (t, t0, d) => U.clamp((t - t0) / d, 0, 1);
  // as palavras do textos.txt que o molde usa (a peça pode trocar os números em PECA.NOMES)
  const NOMES0 = { antes: 'D01', depois: 'D02', numAntes: 'D03', rotAntes: 'D04', numDepois: 'D05', rotDepois: 'D06', acao: 'D07' };
  const nome = (k) => D(Object.assign({}, NOMES0, P().NOMES || {})[k]);

  // ---------- o texto que se quebra sozinho ----------
  const FRACA = new Set(['a', 'o', 'as', 'os', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'e', 'em', 'no', 'na', 'nos', 'nas', 'que', 'é', 'à', 'ao', 'para', 'por', 'com', 'se', 'não', 'ou', 'te', 'num', 'numa']);
  function quebrar(ctx, s, papel, size, maxW) {
    const out = []; let cur = '';
    for (const w of s.split(' ')) {
      const t = cur ? cur + ' ' + w : w;
      if (cur && E.medir(ctx, t.split(NB).join(' '), { papel, size }) > maxW) { out.push(cur); cur = w; } else cur = t;
    }
    if (cur) out.push(cur);
    return out;
  }
  // a mesma quantidade de linhas, com as linhas de tamanho parecido e sem palavrinha solta no fim da linha
  function equilibrar(ctx, s, papel, size, maxW) {
    const base = quebrar(ctx, s, papel, size, maxW), k = base.length;
    if (k < 2) return base;
    let melhor = base, nota = Infinity;
    for (let w = maxW; w > maxW * 0.45; w -= 20) {
      const ls = quebrar(ctx, s, papel, size, w);
      if (ls.length !== k) break;
      const ws = ls.map((l) => E.medir(ctx, l.split(NB).join(' '), { papel, size }));
      const fracas = ls.slice(0, -1).filter((l) => FRACA.has(l.split(' ').pop().toLowerCase().replace(/[.,;:!?]/g, ''))).length;
      const n = Math.max(...ws) - Math.min(...ws) + 400 * fracas;
      if (n < nota) { nota = n; melhor = ls; }
    }
    return melhor;
  }
  // as linhas de um texto, no maior tamanho que cabe (de sizes, com no máximo maxLinhas[i] linhas)
  const memo = new Map();
  function arranjo(ctx, s0, { papel = 'corpo', sizes = [56, 52, 48, 44], maxLinhas = [2, 3, 3, 4], maxW = R - L, d = '' } = {}) {
    const key = [s0, papel, sizes.join(','), maxLinhas.join(','), maxW, d].join('|');
    if (memo.has(key)) return memo.get(key);
    let s = s0;
    if (d && s.includes(d)) s = s.replace(d, d.split(' ').join(NB));
    let res = null;
    for (let i = 0; i < sizes.length; i++) {
      const ls = equilibrar(ctx, s, papel, sizes[i], maxW);
      const cabe = ls.every((l) => E.medir(ctx, l.split(NB).join(' '), { papel, size: sizes[i] }) <= maxW);
      if (ls.length <= maxLinhas[i] && cabe) { res = { ls, size: sizes[i] }; break; }
    }
    if (!res) { const z = sizes[sizes.length - 1]; res = { ls: equilibrar(ctx, s, papel, z, maxW), size: z }; }
    memo.set(key, res);
    return res;
  }
  // um texto em várias linhas a partir da base y0 (primeira linha); devolve a base da última linha
  function paragrafo(ctx, s, { y0 = TEXTO_Y, papel = 'corpo', sizes, maxLinhas, maxW = R - L, align = 'center', x = null, alpha = 1, dy = 0, k = 1, d = '', entrelinha = 1.22, seed = 7 } = {}) {
    if (!s || alpha <= 0) return y0;
    const { ls, size } = arranjo(ctx, s, { papel, sizes, maxLinhas, maxW, d });
    const lh = size * E.letra(papel)[2] * entrelinha;
    const xx = x ?? (align === 'center' ? CX : align === 'right' ? R : L);
    ctx.save(); ctx.globalAlpha *= alpha;
    ls.forEach((l, i) => {
      const s1 = l.split(NB).join(' ');
      // o destaque só entra com o texto já meio visível (na planta, o destaque é pintado sem olhar a transparência)
      const comD = d && s1.includes(d) && ctx.globalAlpha > 0.5;
      E.textoComDestaque(ctx, s1, comD ? d : '', xx, y0 + i * lh + dy, { papel, size, align, k: comD ? k : 0, seed: seed + i });
    });
    ctx.restore();
    return y0 + (ls.length - 1) * lh;
  }
  // a frase n do textos.txt, com o trecho em destaque que a peça marcou (PECA.DESTAQUE)
  const bloco = (ctx, n, o = {}) => paragrafo(ctx, D(n), Object.assign({ d: (P().DESTAQUE || {})[n] || '', seed: 7 + n * 3 }, o));

  // ---------- os dois tempos ----------
  // o tom do antes: o fundo do estilo misturado com 22% de Folha (70% no estilo escuro), mistura de duas cores da
  // paleta, que a conferência das cores aceita. O antes fica mais fundo e o depois limpo: a cortina se vê, e o corte também.
  let corAntes = null;
  const tomAntes = () => {
    if (corAntes) return corAntes;
    const hex = (h) => [1, 3, 5].map((i) => parseInt(String(h).slice(i, i + 2), 16));
    const a = hex(E.cor('fundo')), b = hex(E.cor('folha')), f = E.escuro() ? 0.7 : 0.22;
    if (a.concat(b).some((v) => !Number.isFinite(v))) return (corAntes = E.cor('apoio'));
    return (corAntes = '#' + a.map((v, i) => Math.round(v + (b[i] - v) * f).toString(16).padStart(2, '0')).join(''));
  };
  // a gravura: traços finos e inclinados por cima do lugar do antes (o tempo de antes parece impresso, de gravura)
  function gravura(ctx, y0, y1) {
    ctx.save();
    ctx.beginPath(); ctx.rect(-10, y0, W + 20, y1 - y0); ctx.clip();
    ctx.strokeStyle = E.cor('tinta'); ctx.globalAlpha *= E.escuro() ? 0.16 : 0.11; ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let x = -(y1 - y0); x < W + 20; x += 18) { ctx.moveTo(x, y1); ctx.lineTo(x + (y1 - y0), y0); }
    ctx.stroke();
    ctx.restore();
  }

  // o lugar da peça (PECA.LUGAR) numa faixa da largura toda, recortado nela; zoom: { x, y, z } (de perto, na ação)
  // VIS: a parte da tela (em x) que o mundo da vez ocupa; a cortina corta o mundo, e o texto que ela cortaria some
  let VIS = [-Infinity, Infinity];
  const info = (st, tempo, faixa) => ({ tempo, t: st.t, cena: st.c.id, tipo: st.c.tipo, u: st.t - st.c.t0, i: st.i, n: st.it.n, kf: st.t - st.it.t0, w: W, h: PALCO.y1 - PALCO.y0, perto: faixa === PALCO_ACAO });
  function palco(ctx, st, tempo, faixa, zoom) {
    const f = P().LUGAR, fh = faixa.y1 - faixa.y0;
    const vis = zoom ? VIS.map((a) => (a - W / 2) / zoom.z + zoom.x) : VIS.slice(); // em unidades do lugar
    ctx.save();
    ctx.beginPath(); ctx.rect(-10, faixa.y0, W + 20, fh); ctx.clip();
    ctx.translate(0, faixa.y0);
    if (zoom) { ctx.translate(W / 2, fh / 2); ctx.scale(zoom.z, zoom.z); ctx.translate(-zoom.x, -zoom.y); }
    if (f) f(ctx, Object.assign(info(st, tempo, faixa), { vis }));
    else aFazer(ctx, { x0: L, x1: R, y0: 40, y1: PALCO.y1 - PALCO.y0 - 40 }, 'o lugar (' + tempo + ')');
    ctx.restore();
    // a moldura: a linha de cima e a de baixo da faixa (o lugar é uma fotografia da largura toda)
    E.linha(ctx, [[-10, faixa.y0], [W + 10, faixa.y0]], { lw: 6, seed: 71 });
    E.linha(ctx, [[-10, faixa.y1], [W + 10, faixa.y1]], { lw: 6, seed: 72 });
  }
  // o zoom num ponto do lugar (f: { x, y, z }, em unidades do lugar) dentro de uma faixa: o ponto vai para o meio da
  // faixa, sem sobrar borda vazia; o zoom cresce 5% de t0 a t1 (a câmera chega perto devagar)
  function zoomEm(f, faixa, t, t0, t1) {
    const bh = faixa.y1 - faixa.y0, ph = PALCO.y1 - PALCO.y0;
    const z = Math.max(f.z || 1.45, bh / ph + 0.03) * (1 + 0.05 * U.ease.inOutCubic(prog(t, t0, Math.max(0.1, t1 - t0))));
    return { x: U.clamp(f.x ?? W / 2, W / (2 * z), W - W / (2 * z)), y: U.clamp(f.y ?? ph / 2, bh / (2 * z), ph - bh / (2 * z)), z };
  }
  // a ação: o lugar de perto no ponto que a peça escolheu (PECA.FOCO), na faixa alta, durante a cena inteira
  const foco = (st) => zoomEm(Object.assign({ x: W / 2, y: (PALCO.y1 - PALCO.y0) / 2, z: 1.45 }, P().FOCO || {}), PALCO_ACAO, st.t, st.c.t0, st.c.t1);
  // o corte para perto numa frase (PECA.PERTO[n] = { x, y, z }): enquanto a frase n está na tela, o lugar aparece de
  // perto (é um corte dentro da cena: o trecho sem corte fica mais curto). Na ação, ele chega ainda mais perto, na
  // faixa alta. No fecho, as últimas 4 batidas voltam para o lugar inteiro (o hoje de longe, o último quadro)
  function pertoDaFrase(st, faixa = PALCO) {
    const f = (P().PERTO || {})[st.it.n];
    if (!f || st.c.tipo === 'porque') return null;
    if (st.c.tipo === 'fecho' && st.t >= st.c.t1 - 4 * SC.BEAT) return null;
    return zoomEm(f, faixa, st.t, st.it.t0, st.it.t1);
  }
  // no "porque" não há lugar: PECA.PERTO[n] = { x, y, z } é um ponto da tela, e o desenho da peça cresce em volta dele
  function pertoNaTela(st) {
    const f = (P().PERTO || {})[st.it.n];
    if (!f || st.c.tipo !== 'porque') return null;
    return { x: f.x ?? CX, y: f.y ?? (MUNDO_Y + BOT) / 2, z: (f.z || 1.2) * (1 + 0.04 * U.ease.inOutCubic(prog(st.t, st.it.t0, Math.max(0.1, st.it.t1 - st.it.t0)))) };
  }
  // quanto o carimbo e a placa de um tempo já entraram: só batem na cena que é deles; nas outras, estão no lugar
  function kMarca(tempo, st) {
    const c = st.c, M = SC.MOLDE;
    if (c.tipo === tempo && (tempo === 'antes' || tempo === 'acao')) return prog(st.t, c.t0 + M.marca, 0.35);
    if (c.tipo === 'depois' && tempo === 'depois') return prog(st.t, c.t0 + M.cortina + 0.1, 0.35);
    return 1;
  }
  function kPlaca(tempo, st) {
    const c = st.c, M = SC.MOLDE;
    if (c.tipo === 'antes' && tempo === 'antes') return prog(st.t, c.t0 + M.placa, 0.4);
    if (c.tipo === 'depois' && tempo === 'depois') return prog(st.t, c.t0 + M.cortina + 0.5, 0.4);
    return 1;
  }
  // o carimbo do ano, na borda de cima do lugar: o do antes (e o da ação) à esquerda, o do depois à direita
  function marca(ctx, tempo, st) {
    const k = kMarca(tempo, st), s = nome(tempo === 'depois' ? 'depois' : tempo === 'acao' ? 'acao' : 'antes');
    if (k <= 0 || !s) return;
    const dir = tempo === 'depois';
    E.carimbo(ctx, s, dir ? R - 150 : L + 150, PALCO.y0 - 4, { k, rot: dir ? 0.07 : -0.09, size: 50, seed: dir ? 31 : tempo === 'acao' ? 29 : 27 });
  }
  // a placa do número oficial do tempo: o número grande e, embaixo, o que ele conta (até duas linhas)
  function placa(ctx, tempo, st) {
    const k = kPlaca(tempo, st), dir = tempo === 'depois';
    const num = nome(dir ? 'numDepois' : 'numAntes'), rot = nome(dir ? 'rotDepois' : 'rotAntes');
    if (k <= 0 || !num) return;
    const w = PLACA.w, h = PLACA.y1 - PLACA.y0, x0 = dir ? R - w : L, y0 = PLACA.y0;
    const z = U.ease.outBack(Math.min(1, k));
    ctx.save(); ctx.globalAlpha *= Math.min(1, k * 2.5);
    ctx.translate(x0 + w / 2, y0 + h / 2); ctx.scale(z, z); ctx.translate(-(x0 + w / 2), -(y0 + h / 2));
    E.ret(ctx, x0, y0, w, h, { papel: 'superficie', r: 18, seed: dir ? 81 : 83, sombra: true, hachura: false });
    // as medidas são as da letra na tela (cada estilo tem a sua escala): o número até 112 de altura de letra e o rótulo
    // em até duas linhas de 36, para tudo caber na placa em qualquer estilo
    const kn = E.letra('numero')[2], kc = E.letra('corpo')[2];
    let size = Math.round(112 / kn);
    while (size > 40 && E.medir(ctx, num, { papel: 'numero', size }) > w - 60) size -= 2;
    const yN = y0 + 24 + size * kn * 0.74;
    E.texto(ctx, num, x0 + 30, yN, { papel: 'numero', size, align: 'left' });
    if (rot) paragrafo(ctx, rot, { y0: yN + 16 + 36, papel: 'corpo', sizes: [36, 33, 30].map((v) => Math.round(v / kc)), maxLinhas: [2, 2, 2], maxW: w - 60, align: 'left', x: x0 + 30, entrelinha: 1.18, seed: dir ? 85 : 87 });
    ctx.restore();
  }
  // o mundo de um tempo, inteiro: o fundo dele (do MUNDO_Y para baixo), o lugar, a gravura (só no passado), o
  // carimbo e a placa. tempo: 'antes', 'acao' (o lugar no ano da ação) ou 'depois'; perto: o lugar de perto (a ação)
  function mundo(ctx, tempo, st, { perto = false } = {}) {
    const passado = tempo !== 'depois';
    ctx.save(); ctx.fillStyle = passado ? tomAntes() : E.cor('fundo'); ctx.fillRect(-10, MUNDO_Y, W + 20, H - MUNDO_Y + 10); ctx.restore();
    const faixa = perto ? PALCO_ACAO : PALCO;
    palco(ctx, st, tempo, faixa, perto ? (pertoDaFrase(st, PALCO_ACAO) || foco(st)) : pertoDaFrase(st));
    if (passado) gravura(ctx, MUNDO_Y, H);
    marca(ctx, tempo, st);
    if (!perto && tempo !== 'acao') placa(ctx, tempo, st);
  }
  // a cortina: à esquerda da linha x, o antes; à direita, o depois (x ≥ W: só o antes; x ≤ 0: só o depois).
  // tempoAntes: o que fica do lado esquerdo ('antes' ou 'acao')
  function cortina(ctx, x, st, { tempoAntes = 'antes', alca = true } = {}) {
    if (x >= W) { mundo(ctx, tempoAntes, st); return; }
    if (x <= 0) { mundo(ctx, 'depois', st); return; }
    ctx.save(); ctx.beginPath(); ctx.rect(-20, 0, x + 20, H); ctx.clip(); VIS = [-Infinity, x]; mundo(ctx, tempoAntes, st); VIS = [-Infinity, Infinity]; ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(x, 0, W - x + 20, H); ctx.clip(); VIS = [x, Infinity]; mundo(ctx, 'depois', st); VIS = [-Infinity, Infinity]; ctx.restore();
    // a linha da cortina e a alça (o "arraste para comparar" de antes e depois)
    E.linha(ctx, [[x, MUNDO_Y], [x, H + 10]], { lw: 8, seed: 91 });
    if (alca) {
      const y = (PALCO.y0 + PALCO.y1) / 2;
      E.circulo(ctx, x, y, 40, { papel: 'tinta', seed: 92, sombra: false, hachura: false });
      E.poligono(ctx, [[x - 9, y - 15], [x - 26, y], [x - 9, y + 15]], { papel: 'fundo', seed: 93, sombra: false, hachura: false });
      E.poligono(ctx, [[x + 9, y - 15], [x + 26, y], [x + 9, y + 15]], { papel: 'fundo', seed: 94, sombra: false, hachura: false });
    }
  }
  // onde está a cortina em cada tipo de cena
  function cortinaX(st) {
    const c = st.c, t = st.t, M = SC.MOLDE;
    if (c.tipo === 'pergunta') return MEIO;
    if (c.tipo === 'antes' || c.tipo === 'acao') return W + 40;
    if (c.tipo === 'depois') return U.lerp(W + 40, -40, U.ease.inOutCubic(prog(t, c.t0, M.cortina)));
    if (c.tipo === 'separar') return U.lerp(-40, MEIO, U.ease.inOutCubic(prog(t, c.itens[0].t0 + M.volta.atraso, M.volta.dur)));
    return -40; // porque e fecho: só o depois
  }

  // ---------- o estado do filme no instante t: a cena, a frase da vez e a entrada do texto ----------
  function estado(t) {
    const c = SC.cenaEm(t);
    let i = 0;
    c.itens.forEach((x, j) => { if (t >= x.t0) i = j; });
    const it = c.itens[i], ultima = i === c.itens.length - 1;
    const st = { t, c, it, i, u: t - c.t0 };
    // a primeira frase da cena entra junto com a imagem (corte seco); as outras surgem em 0,2 s e somem 0,12 s antes da seguinte
    const corte = i === 0;
    st.aTexto = Math.min(corte ? 1 : prog(t, it.t0, 0.2), ultima ? 1 : U.clamp((it.t1 - t) / 0.12, 0, 1));
    st.dyTexto = corte ? 0 : (1 - U.ease.outCubic(prog(t, it.t0, 0.25))) * 16;
    // o destaque da frase entra depois dela (0,4 s depois de ela aparecer, em 0,5 s)
    st.kDestaque = U.ease.inOutCubic(prog(t, it.t0 + (corte ? 0.5 : 0.4), 0.5));
    st.x = cortinaX(st);
    return st;
  }
  // a frase da vez, no lugar padrão (em cima, centrada)
  function textoDaVez(ctx, st, o = {}) {
    return bloco(ctx, st.it.n, Object.assign({ alpha: st.aTexto, dy: st.dyTexto, k: st.kDestaque }, o));
  }

  // ---------- o kit do desenho da peça (a peça pega com const { pessoa, gente, ... } = AD.KIT) ----------
  const mo = (nome) => SC.momento(nome); // o instante de um momento do score.js (Infinity se ele não existir)
  const em = (t, nome, d = 0.3) => prog(t, mo(nome), d); // de 0 a 1 a partir do momento
  // o aviso de lugar vazio: enquanto um desenho não for trocado, aparece um quadro tracejado com "TROQUE" e o que vai ali
  function aFazer(ctx, b, texto, k = 1) {
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha *= Math.min(1, k);
    E.linha(ctx, [[b.x0, b.y0], [b.x1, b.y0], [b.x1, b.y1], [b.x0, b.y1], [b.x0, b.y0]], { lw: 5, tracejado: true, seed: 900 });
    const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
    E.texto(ctx, 'TROQUE', cx, cy - 8, { papel: 'titulo', size: 44, align: 'center' });
    E.texto(ctx, texto, cx, cy + 46, { papel: 'mao', size: 34, align: 'center' });
    ctx.restore();
  }
  const PELE = ['#C98A62', '#DBA27E', '#A86E4B', '#C98A62', '#A86E4B'], CABELO = '#2B211E';
  const pessoa = (ctx, o) => E.personagem(ctx, Object.assign({ pose: 'stand', s: 0.42, look: 0, mouth: 'smile', seed: 700 }, o));
  // gente variada (i escolhe pele, cabelo e roupa), para rua, fila, sala de espera...
  const gente = (i, o = {}) => Object.assign({ skin: PELE[i % 5], hair: CABELO, hairStyle: ['bun', 'short', 'ponytail', 'short', 'curly'][i % 5], outfit: i % 2 ? 'tee' : 'shirt', shirt: ['#E4EB6C', '#B5D8C0', '#30724E', '#F4EDDF', '#F16D4D'][i % 5], trim: '#30724E', bottoms: i % 3 === 2 ? 'skirt' : 'pants', shorts: '#17402C', shoes: '#072618', build: 'slim' }, o);
  // o chão do lugar: uma faixa e a linha (dentro da faixa do lugar; some junto com ela)
  const chao = (ctx, y, { w = W, papel = 'chao', seed = 609 } = {}) => { E.ret(ctx, -40, y, w + 80, 400, { papel, r: 0, seed, sombra: false, hachura: false }); E.linha(ctx, [[-40, y], [w + 40, y]], { lw: 6, seed: seed - 1 }); };
  // uma casa de rua (a do kit, em escala): x é a esquerda, y é o chão
  const casa = (ctx, { x, y, s = 0.6, numero = '', porta = 0, seed = 30 } = {}) => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); E.objeto(ctx, 'casa', { x: 0, y: 0, numero, porta, seed }); ctx.restore(); };
  // uma árvore: o tronco e a copa; s = 1 dá uns 300 de altura (x, y: o pé do tronco)
  function arvore(ctx, x, y, { s = 1, seed = 640, copa = 'apoioEscuro' } = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    E.ret(ctx, -16, -150, 32, 150, { papel: 'tinta', r: 6, seed, sombra: false, hachura: false });
    for (const [dx, dy, r] of [[-56, -190, 70], [52, -196, 66], [0, -250, 84]]) E.circulo(ctx, dx, dy, r, { papel: copa, seed: seed + dx, sombra: false });
    ctx.restore();
  }
  // um vírus: o círculo em Coral com as pontas (o alerta do kit); k de 0 a 1 faz ele aparecer
  function virus(ctx, x, y, r, { k = 1, seed = 660, rot = 0 } = {}) {
    if (k <= 0) return;
    const z = U.ease.outBack(Math.min(1, k));
    ctx.save(); ctx.translate(x, y); ctx.scale(z, z); ctx.rotate(rot);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      E.linha(ctx, [[c * r * 0.9, s * r * 0.9], [c * r * 1.35, s * r * 1.35]], { papel: 'alerta', lw: Math.max(4, r * 0.12), seed: seed + i });
      E.circulo(ctx, c * r * 1.42, s * r * 1.42, Math.max(5, r * 0.14), { papel: 'alerta', seed: seed + 20 + i, sombra: false, hachura: false });
    }
    E.circulo(ctx, 0, 0, r, { papel: 'alerta', seed: seed + 40, sombra: false });
    ctx.restore();
  }
  // uma etiqueta (palavra ou número numa placa arredondada); devolve a largura
  function etiqueta(ctx, s, x, y, { k = 1, size = 40, papel = 'corpo', fundo = 'superficie', align = 'center', seed = 670 } = {}) {
    if (k <= 0 || !s) return 0;
    const w = E.medir(ctx, s, { papel, size }) + 44, h = size * 1.55;
    const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    const z = U.ease.outBack(Math.min(1, k));
    ctx.save(); ctx.globalAlpha *= Math.min(1, k * 2.5);
    ctx.translate(x0 + w / 2, y); ctx.scale(z, z); ctx.translate(-(x0 + w / 2), -y);
    E.ret(ctx, x0, y - h / 2, w, h, { papel: fundo, r: h / 2, seed, sombra: false, hachura: false });
    E.texto(ctx, s, x0 + w / 2, y + size * 0.36, { papel, size, align: 'center' });
    ctx.restore();
    return w;
  }
  // a barra de uma porcentagem (cobertura, proporção...): o valor enche a barra, a meta é um traço em Coral com o rótulo
  // em cima. valor e meta de 0 a 100; k de 0 a 1 enche a barra; kMeta faz a meta aparecer
  function barra(ctx, x, y, w, h, valor, { meta = null, k = 1, kMeta = 1, rotulo = '', rotuloMeta = '', seed = 680 } = {}) {
    E.ret(ctx, x, y, w, h, { papel: 'apoio', r: h / 2, seed, sombra: false, hachura: false });
    const f = (U.clamp(valor, 0, 100) / 100) * U.ease.outCubic(U.clamp(k, 0, 1));
    if (f > 0.01) E.ret(ctx, x, y, Math.max(h, w * f), h, { papel: 'apoioEscuro', r: h / 2, seed: seed + 1, sombra: false, hachura: false });
    if (rotulo && k > 0.6) E.texto(ctx, rotulo, x + Math.max(h, w * f) - 18, y + h * 0.5 + 15, { papel: 'numero', size: 40, align: 'right', cor: 'papel' });
    if (meta !== null && kMeta > 0) {
      const mx = x + (meta / 100) * w;
      ctx.save(); ctx.globalAlpha *= Math.min(1, kMeta * 2);
      E.linha(ctx, [[mx, y - 26], [mx, y + h + 26]], { papel: 'alerta', lw: 9, seed: seed + 2 });
      if (rotuloMeta) { const wm = E.medir(ctx, rotuloMeta, { papel: 'mao', size: 40 }); E.texto(ctx, rotuloMeta, U.clamp(mx, L + wm / 2, R - wm / 2), y - 40, { papel: 'mao', size: 40, align: 'center' }); }
      ctx.restore();
    }
  }
  // texto escrito no lugar (faixa, placa, letreiro): some inteiro quando a cortina o cortaria (meio texto não se lê, e a
  // conferência acusa contraste). info é o que o LUGAR recebe
  function textoNoLugar(ctx, info, s, x, y, o = {}) {
    const q = Object.assign({ papel: 'titulo', size: 34, align: 'center' }, o), w = E.medir(ctx, s, q);
    const x0 = q.align === 'center' ? x - w / 2 : q.align === 'right' ? x - w : x, v = info.vis || [-Infinity, Infinity];
    if (x0 < v[0] || x0 + w > v[1]) return;
    E.texto(ctx, s, x, y, q);
  }
  const KIT = { mo, em, prog, aFazer, PELE, CABELO, pessoa, gente, chao, casa, arvore, virus, etiqueta, barra, textoNoLugar };

  globalThis.AD = { W, H, L, R, TOP, BOT, CX, TEXTO_Y, TITULO_Y, MUNDO_Y, PALCO, PALCO_ACAO, PLACA, MEIO, D, nome, prog, paragrafo, bloco, arranjo, tomAntes, gravura, mundo, cortina, cortinaX, estado, textoDaVez, pertoNaTela, KIT };
})();
