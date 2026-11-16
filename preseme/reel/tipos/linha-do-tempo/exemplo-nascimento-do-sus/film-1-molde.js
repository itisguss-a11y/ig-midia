// PRESEME · motor "linha do tempo" · desenho 1/3 · o molde (igual em toda peça deste motor; o chat não mexe aqui)
// A linha dos anos atravessa a tela e a câmera anda por ela: de perto, um marco por vez, com o ano grande, o rótulo embaixo
// e o cartão da peça em cima; de longe (a linha inteira), todos os marcos com o ano e o rótulo, ou o verbo, no fecho.
// Entre dois marcos com ano numérico, o ano em cima da linha rola durante a viagem. Antes do presente, a linha tem um salto (//).
// Cores e letras vêm do kit de estilos (ferramentas/estilos.js): a mesma peça sai em planta, carimbo, giz... trocando o ESTILO.
(function () {
  const U = globalThis.U, G = globalThis.G, E = globalThis.ESTILOS, SC = globalThis.SCORE, TX = globalThis.TEXTOS;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const L = SAFE.x, R = SAFE.x + SAFE.w, TOP = SAFE.y, BOT = SAFE.y + SAFE.h, CX = (L + R) / 2; // 60, 940, 221, 1498, 500
  // o desenho da tela: o cartão em cima, o ano e a linha no meio, o rótulo embaixo da linha e a frase embaixo de tudo
  // de perto: o cartão (780 × 540, ampliado 1,1 vezes: 858 × 594) de 240 a 834; o ano em cima da linha; a linha em 968;
  // o rótulo embaixo dela; a cota (se houver) mais embaixo; a frase com a última linha em 1404. De longe, a linha sobe para 720.
  const LINHA_Y = 968, ANO_Y = 922, ROT_Y = 1038, COTA_Y = 1188, LINHA_V = 720, TEXTO_Y = 1404;
  const CARTAO = { y: 240, w: 780, h: 540, escala: 1.1 };
  const NB = ' ';
  const D = (k) => TX[k] || '';
  const P = () => globalThis.PECA || {};
  const cor = (p) => E.cor(p);
  const { MARCOS, HOJE, MX, HOJE_X } = SC;
  const PONTOS = MARCOS.map((m, i) => Object.assign({ x: MX[i], i }, m)).concat([Object.assign({ x: HOJE_X, i: MARCOS.length, hoje: true }, HOJE)]);
  const SALTO_X = MX[MX.length - 1] + 0.62 * (HOJE_X - MX[MX.length - 1]); // onde a linha dá o salto (//)

  // ---------- texto (o mesmo jeito dos outros motores: quebra equilibrada e o destaque do kit) ----------
  const fonte = (papel = 'corpo') => E.letra(papel);
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
  const FRACA = new Set(['a', 'o', 'as', 'os', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'e', 'em', 'no', 'na', 'nos', 'nas', 'que', 'é', 'à', 'ao', 'para', 'por', 'com', 'se', 'não', 'ou', 'pela', 'pelo']);
  function equilibrar(ctx, s, size, maxW, papel) {
    const base = quebrar(ctx, s, size, maxW, papel), k = base.length;
    if (k < 2) return base;
    let melhor = base, nota = Infinity;
    for (let w = maxW; w > maxW * 0.45; w -= 20) {
      const ls = quebrar(ctx, s, size, w, papel);
      if (ls.length !== k) break;
      const ws = ls.map((l) => wid(ctx, l, size, papel));
      const fracas = ls.slice(0, -1).filter((l) => FRACA.has(l.split(' ').pop().toLowerCase().replace(/[.,;:!?]/g, ''))).length;
      const n = Math.max(...ws) - Math.min(...ws) + 400 * fracas;
      if (n < nota) { nota = n; melhor = ls; }
    }
    return melhor;
  }
  const memo = new Map();
  function linhasDe(ctx, chave, s0, size, maxW, papel, d) {
    const key = [chave, size, maxW, papel].join(':');
    if (!memo.has(key)) {
      let s = s0;
      if (d && s.includes(d)) s = s.replace(d, d.split(' ').join(NB));
      memo.set(key, equilibrar(ctx, s, size, maxW, papel));
    }
    return memo.get(key);
  }
  // um texto em várias linhas, centrado em cx; a última linha em baseY (ou a primeira em topY); d: o trecho em destaque
  function paragrafo(ctx, chave, s, { baseY = TEXTO_Y, topY = null, sizes = [56, 52, 48, 44], maxLinhas = [2, 3, 3, 4], maxW = R - L, alpha = 1, dy = 0, papel = 'corpo', cx = CX, d = null, c = 'texto', seed = 7 } = {}) {
    if (!s || alpha <= 0) return 0;
    let size = sizes[sizes.length - 1], ls = null;
    for (let i = 0; i < sizes.length; i++) {
      const t = linhasDe(ctx, chave, s, sizes[i], maxW, papel, d);
      if (t.length <= maxLinhas[i] && t.every((l) => wid(ctx, l.split(NB).join(' '), sizes[i], papel) <= maxW)) { size = sizes[i]; ls = t; break; }
    }
    if (!ls) ls = linhasDe(ctx, chave, s, size, maxW, papel, d);
    const lh = size * fonte(papel)[2] * 1.27;
    const y0 = topY !== null ? topY : baseY - (ls.length - 1) * lh;
    ctx.save(); ctx.globalAlpha *= alpha;
    ls.forEach((l, i) => {
      const s1 = l.split(NB).join(' '), y = y0 + i * lh + dy, w = wid(ctx, s1, size, papel), x = cx - w / 2;
      const k = d ? s1.indexOf(d) : -1; // o destaque só entra com o texto já meio visível (no kit, a planta pinta o destaque sem olhar a transparência)
      if (k >= 0 && ctx.globalAlpha > 0.5) E.destaque(ctx, x + wid(ctx, s1.slice(0, k), size, papel), y, wid(ctx, d, size, papel), size * fonte(papel)[2], { seed: seed + i });
      escrever(ctx, s1, x, y, { size, papel, cor: c });
    });
    ctx.restore();
    return ls.length * lh;
  }
  // a medida de um parágrafo (largura da linha mais larga, altura e tamanho escolhido), sem desenhar
  function medirParagrafo(ctx, chave, s, sizes, maxLinhas, maxW, papel) {
    let size = sizes[sizes.length - 1], ls = null;
    for (let i = 0; i < sizes.length; i++) {
      const t = linhasDe(ctx, chave, s, sizes[i], maxW, papel, null);
      if (t.length <= maxLinhas[i] && t.every((l) => wid(ctx, l.split(NB).join(' '), sizes[i], papel) <= maxW)) { size = sizes[i]; ls = t; break; }
    }
    if (!ls) ls = linhasDe(ctx, chave, s, size, maxW, papel, null);
    const lh = size * fonte(papel)[2] * 1.27;
    return { size, ls, w: Math.max(...ls.map((l) => wid(ctx, l.split(NB).join(' '), size, papel))), h: (ls.length - 1) * lh + size * fonte(papel)[2] * 0.8 };
  }
  // a frase n do textos.txt, com o destaque que a peça marcou (PECA.DESTAQUE)
  const bloco = (ctx, n, o = {}) => paragrafo(ctx, 'f' + n, TX[n] || '', Object.assign({ d: (P().DESTAQUE || {})[n] || null, seed: 7 + n * 3 }, o));

  // ---------- câmera e mundo ----------
  const sx = (wx, cam) => CX + (wx - cam.x) * cam.z;
  const perto = (cam) => U.clamp((cam.z - 0.55) / 0.45, 0, 1); // 1: de perto (um marco); 0: a linha inteira
  const anoNum = (k) => { const m = /(\d{4})/.exec(D(k)); return m ? parseInt(m[1], 10) : null; };
  // a altura da linha: de perto, embaixo do cartão; de longe, sobe para o meio da tela
  const yLinha = (cam) => U.lerp(LINHA_V, LINHA_Y, U.ease.inOutCubic(perto(cam)));
  // de perto, só o marco que está no meio da tela aparece; o vizinho some antes de chegar à borda (nada cortado)
  // (r: até onde ele aparece, em pixels do centro; p: o quanto ele some rápido; o texto some antes do cartão)
  const noMeio = (x, r = 360, p = 2) => Math.pow(U.clamp(1 - Math.abs(x - CX) / r, 0, 1), p);

  // a linha, os pontos dos marcos e o salto antes do presente
  function linhaDoTempo(ctx, cam, ativo) {
    const y = yLinha(cam), bx = sx(SALTO_X, cam), g = 16;
    const seg = (a, b) => { if (b > a) E.linha(ctx, [[a, y], [b, y]], { lw: 7, seed: 401 + Math.round(a) % 7 }); };
    seg(-40, bx - g); seg(bx + g, W + 40);
    for (const d of [-g, g]) E.linha(ctx, [[bx + d - 12, y + 26], [bx + d + 12, y - 26]], { lw: 6, seed: 409 + d }); // o salto: //
    for (const p of PONTOS) {
      const x = sx(p.x, cam);
      if (x < -60 || x > W + 60) continue;
      const on = p.i === ativo;
      E.circulo(ctx, x, y, on ? 24 : 15, { papel: on ? 'destaque' : 'superficie', seed: 420 + p.i, sombra: false });
    }
  }
  // de perto: o ano grande em cima da linha e o rótulo embaixo
  function anoERotulo(ctx, cam, p, alpha, semAno = false) {
    const x = sx(p.x, cam), y = yLinha(cam);
    if (alpha <= 0) return;
    // o tamanho é o da letra na tela (cada estilo tem a sua escala): o ano não encosta no cartão nem o rótulo no ponto
    const kN = fonte('numero')[2], kM = fonte('mao')[2];
    if (!semAno) escrever(ctx, D(p.ano), x, y - (LINHA_Y - ANO_Y), { size: Math.min(92, 88 / kN), papel: 'numero', align: 'center', alpha });
    paragrafo(ctx, 'r' + p.i, D(p.rotulo), { topY: y + (ROT_Y - LINHA_Y), sizes: [46 / kM, 42 / kM], maxLinhas: [2, 2], maxW: 760, papel: 'mao', cx: x, alpha });
  }
  // a cota entre dois marcos (só quando a distância é um fato da peça, MARCOS[i].cota): aparece quando a câmera chega ao segundo
  function cotas(ctx, cam, t, ativo, alpha) {
    MARCOS.forEach((m, i) => {
      if (!m.cota || i + 1 >= MARCOS.length || ativo < i + 1) return;
      const c = SC.cenas.find((x) => x.marco === i + 1);
      const k = c ? U.ease.outCubic(U.clamp((t - (c.t0 + c.viagem)) / 0.7, 0, 1)) : 1;
      const y = yLinha(cam) + (COTA_Y - LINHA_Y), a = [sx(MX[i], cam), y], b = [sx(MX[i + 1], cam), y];
      ctx.save(); ctx.globalAlpha *= alpha * noMeio(b[0]); E.cota(ctx, a, b, D(m.cota), { k, size: 44 }); ctx.restore();
    });
  }
  // de longe: o ano de cada marco (e, no fecho, o verbo dele), um marco em cima e o seguinte embaixo da linha.
  // Cada texto tem uma caixa medida; caixa que encostaria na do vizinho do mesmo lado sobe (ou desce) um andar.
  const montagens = new Map();
  function montarVisao(ctx, modo, subs) {
    if (montagens.has(modo)) return montagens.get(modo);
    const cam = { x: SC.VISAO_X, z: SC.VISAO_Z };
    const caixas = PONTOS.map((p, j) => {
      const x = sx(p.x, cam), lado = j % 2 === 0 ? -1 : 1, sub = subs[j] || '';
      let ys = 80; const wa = wid(ctx, D(p.ano), ys, 'numero'); if (wa > 420) ys = Math.floor((ys * 420) / wa);
      const pl = sub ? medirParagrafo(ctx, 'v' + modo + j, sub, [46, 42, 38], [2, 3, 3], 420, 'mao') : { w: 0, h: 0, size: 0 };
      const w = Math.max(wid(ctx, D(p.ano), ys, 'numero'), pl.w) + 24, h = ys * 0.8 + (sub ? 22 + pl.h : 0);
      const cx = U.clamp(x, L + w / 2, R - w / 2);
      return { j, x, cx, w, h, lado, ys, ss: pl.size, sub, andar: 0 };
    });
    for (const c of caixas) {
      const antes = caixas.filter((o) => o.j < c.j && o.lado === c.lado);
      while (antes.some((o) => o.andar === c.andar && Math.abs(o.cx - c.cx) < (o.w + c.w) / 2 + 56)) c.andar++; // 56: o vão mínimo entre dois textos da mesma altura
    }
    for (const lado of [-1, 1]) { // a altura de cada andar: o mais alto dos andares de baixo, mais a folga
      let base = 40;
      for (let a = 0; a < 4; a++) {
        const doAndar = caixas.filter((c) => c.lado === lado && c.andar === a);
        doAndar.forEach((c) => { c.base = base; });
        if (doAndar.length) base += Math.max(...doAndar.map((c) => c.h)) + 28;
      }
    }
    montagens.set(modo, caixas);
    return caixas;
  }
  function visaoGeral(ctx, cam, t, alpha, { modo, subs, aparece = null, tSub = null } = {}) {
    // os textos de longe só entram no fim do zoom, quando já estão no lugar; texto que passaria da borda não aparece
    alpha *= Math.pow(U.clamp((0.55 - cam.z) / (0.55 - SC.VISAO_Z), 0, 1), 1.5);
    if (alpha <= 0) return;
    const y = yLinha(cam);
    for (const c of montarVisao(ctx, modo, subs)) {
      const p = PONTOS[c.j], x = sx(p.x, cam), cx = c.cx + (x - c.x);
      const fora = Math.max(0, L - (cx - c.w / 2), cx + c.w / 2 - R);
      const a = alpha * U.clamp(1 - fora / 40, 0, 1) * (aparece !== null ? U.ease.outCubic(U.clamp((t - (aparece + 0.24 * c.j)) / 0.25, 0, 1)) : 1);
      if (a <= 0) continue;
      const ks = tSub !== null ? U.ease.outBack(U.clamp((t - (tSub + 0.4 * c.j)) / 0.35, 0, 1)) : 1;
      ctx.save(); ctx.globalAlpha *= a;
      if (c.andar > 0) E.linha(ctx, [[x, y + c.lado * 26], [x, y + c.lado * (c.base - 10)]], { lw: 3, seed: 430 + c.j, tracejado: true });
      const ya = c.lado < 0 ? y - c.base : y + c.base + c.ys * 0.74; // a linha de base do ano
      escrever(ctx, D(p.ano), cx, ya, { size: c.ys, papel: 'numero', align: 'center' });
      if (c.sub && ks > 0.01) {
        const o = { sizes: [46, 42, 38], maxLinhas: [2, 3, 3], maxW: 420, papel: 'mao', cx, alpha: Math.min(1, ks), d: tSub !== null ? c.sub : null, seed: 60 + c.j };
        if (c.lado < 0) paragrafo(ctx, 'v' + modo + c.j, c.sub, Object.assign({ baseY: ya - c.ys * 0.8 - 22 }, o));
        else paragrafo(ctx, 'v' + modo + c.j, c.sub, Object.assign({ topY: ya + 22 + c.ss * fonte('mao')[2] * 0.8 }, o));
      }
      ctx.restore();
    }
  }
  // o contador de anos: na viagem entre dois marcos de ano numérico, o ano em cima da linha rola de um até o outro
  // (o tempo passando); começa com o ano de saída e termina com o de chegada, escritos como na peça ("set. 1990")
  function rolagem(cam) {
    const v = cam.viajando;
    if (!v || cam.z < 0.9) return null;
    const i0 = PONTOS.findIndex((p) => Math.abs(p.x - v.de.x) < 1), i1 = PONTOS.findIndex((p) => Math.abs(p.x - v.para.x) < 1);
    if (i0 < 0 || i1 < 0) return null;
    const a0 = anoNum(PONTOS[i0].ano), a1 = anoNum(PONTOS[i1].ano);
    return a0 && a1 && a0 !== a1 ? { i0, i1, a0, a1 } : null;
  }
  function contadorDeAnos(ctx, cam, r) {
    const ano = Math.round(U.lerp(r.a0, r.a1, U.ease.inOutCubic(cam.k)));
    const s = ano === r.a0 ? D(PONTOS[r.i0].ano) : ano === r.a1 ? D(PONTOS[r.i1].ano) : String(ano);
    escrever(ctx, s, CX, yLinha(cam) - (LINHA_Y - ANO_Y), { size: Math.min(92, 88 / fonte('numero')[2]), papel: 'numero', align: 'center' });
  }
  // o cartão de um marco: a moldura do molde e, dentro, o desenho da peça (PECA.CARTAO[id]), em unidades de 780 × 540
  // (o molde amplia o cartão para a largura da tela: CARTAO.escala)
  function cartao(ctx, cam, p, st, alpha) {
    const desenho = (P().CARTAO || {})[p.id];
    const x = sx(p.x, cam), s = CARTAO.escala;
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha;
    ctx.translate(x - (CARTAO.w * s) / 2, CARTAO.y); ctx.scale(s, s);
    E.ret(ctx, 0, 0, CARTAO.w, CARTAO.h, { papel: 'superficie', r: 18, seed: 500 + p.i, sombra: true });
    if (desenho) {
      ctx.save(); ctx.beginPath(); ctx.rect(6, 6, CARTAO.w - 12, CARTAO.h - 12); ctx.clip();
      desenho(ctx, { w: CARTAO.w, h: CARTAO.h }, st, cartaoInfo(p, st));
      ctx.restore();
    }
    ctx.restore();
  }
  // o que o desenho do cartão recebe: em que frase da cena ele está (fase) e há quanto tempo ela apareceu (kf, em segundos).
  // Cartão de marco já passado sai no estado final (fase alta); de marco que ainda vem, no estado inicial (fase -1).
  function cartaoInfo(p, st) {
    const c = st.c;
    if (c.id === p.id) return { ativo: true, fase: st.tv <= st.t ? st.i : st.i - 1, kf: st.t - st.tv, cena: c.id, t: st.t };
    const cp = SC.cenas.find((x) => x.id === p.id);
    const passou = cp ? st.t >= cp.t1 : false;
    return { ativo: false, fase: passou ? 99 : -1, kf: 99, cena: c.id, t: st.t };
  }


  // ---------- o kit do cartão: o que todo desenho de marco usa (a peça pega com const { ap, ... } = LINHA.KIT) ----------
  // ap(info, f, dur, atraso): o quanto um elemento ligado à frase f já entrou (0 a 1): frase passada, 1; da vez, pelo tempo
  const ap = (info, f, dur = 0.5, atraso = 0) => (info.fase > f ? 1 : info.fase === f ? U.ease.outCubic(U.clamp((info.kf - atraso) / dur, 0, 1)) : 0);
  // tf(info, f): o tempo dentro da frase f (para animar): frase passada, muito; frase da vez, kf; frase que vem, 0
  const tf = (info, f) => (info.fase > f ? 99 : info.fase === f ? info.kf : 0);
  // texto dentro do cartão: se passaria da borda, anda para dentro (nada cortado). Letra: 36 ou mais
  const textoCartao = (ctx, s, x, y, o = {}) => {
    const q = Object.assign({ papel: 'mao', size: 40, align: 'center' }, o), wl = E.medir(ctx, s, q);
    const x0 = q.align === 'center' ? x - wl / 2 : q.align === 'right' ? x - wl : x, d = U.clamp(x0, 16, CARTAO.w - 16 - wl) - x0;
    E.texto(ctx, s, x + d, y, q);
  };
  // o chão dentro do cartão (uma faixa e a linha; some junto com o cartão, ao contrário do E.chao da planta)
  const chao = (ctx, y, w = CARTAO.w) => { E.ret(ctx, -20, y, w + 40, 120, { papel: 'chao', r: 0, seed: 609, sombra: false, contorno: false }); E.linha(ctx, [[-20, y], [w + 20, y]], { lw: 6, seed: 608 }); };
  const PELE = ['#C98A62', '#DBA27E', '#A86E4B', '#C98A62', '#A86E4B'], CABELO = '#2B211E';
  const pessoa = (ctx, o) => E.personagem(ctx, Object.assign({ pose: 'stand', s: 0.6, look: 0, mouth: 'smile', seed: 700 }, o));
  // gente variada (i escolhe pele, cabelo e roupa), para multidão, fila, conselho...
  const gente = (i, o = {}) => Object.assign({ skin: PELE[i % 5], hair: i % 4 === 3 ? '#E8E4DA' : CABELO, hairStyle: ['bun', 'short', 'ponytail', 'short', 'curly'][i % 5], outfit: i % 2 ? 'tee' : 'shirt', shirt: ['#E4EB6C', '#B5D8C0', '#30724E', '#F4EDDF', '#B5D8C0'][i % 5], trim: '#30724E', bottoms: 'pants', shorts: '#17402C', shoes: '#072618', build: 'regular' }, o);
  // um documento (lei, portaria, relatório): a folha, o título e as linhas em traço; devolve as alturas das linhas
  function documento(ctx, x, y, w, h, titulo, { seed = 800, linhas = 6, tam = 44 } = {}) {
    E.ret(ctx, x, y, w, h, { papel: 'superficie', r: 6, seed, sombra: true });
    textoCartao(ctx, titulo, x + w / 2, y + 22 + tam, { papel: 'titulo', size: tam });
    const ys = [], y0 = y + 52 + tam;
    for (let i = 0; i < linhas; i++) {
      const ly = y0 + (i + 0.5) * ((y + h - 24 - y0) / linhas), lw = (i % 3 === 2 ? 0.62 : 0.86) * (w - 60);
      E.linha(ctx, [[x + 30, ly], [x + 30 + lw, ly]], { papel: 'apoioEscuro', lw: 7, seed: seed + 10 + i });
      ys.push(ly);
    }
    return ys;
  }
  // o mapa de Roraima com os 15 municípios (IBGE; assets/rr.json, carregado no começo): mapaRR(ctx, { x, y, w, h })
  const RR = { dados: null, caixa: null };
  function projetor([x0, y0, x1, y1], box) {
    const kx = Math.cos((((y0 + y1) / 2) * Math.PI) / 180), gw = (x1 - x0) * kx, gh = y1 - y0;
    const s = Math.min(box.w / gw, box.h / gh), ox = box.x + (box.w - gw * s) / 2, oy = box.y + (box.h - gh * s) / 2;
    return (lon, lat) => [ox + (lon - x0) * kx * s, oy + (y1 - lat) * s];
  }
  function mapaRR(ctx, box) {
    if (!RR.dados) return;
    const pj = projetor(RR.caixa, box);
    for (const [nome, polys] of Object.entries(RR.dados)) for (const r of polys) G.poly(ctx, r.map(([lon, lat]) => pj(lon, lat)), { fill: cor('apoio'), stroke: cor('tinta'), lw: 2.5, seed: 950 + nome.length, amp: 0.6 });
  }
  async function carregar() { // sem o assets/rr.json, o mapa só não aparece
    const d = await globalThis.Studio.loadJSON('assets/rr.json');
    if (!d || !d.municipios) return;
    RR.dados = d.municipios;
    let x0 = 180, x1 = -180, y0 = 90, y1 = -90;
    for (const polys of Object.values(d.municipios)) for (const r of polys) for (const [x, y] of r) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    RR.caixa = [x0, y0, x1, y1];
  }
  const KIT = { ap, tf, texto: textoCartao, chao, PELE, CABELO, pessoa, gente, documento, mapaRR };

  // ---------- o estado do filme no instante t ----------
  function estado(t) {
    const c = SC.cenaEm(t);
    let i = 0;
    c.itens.forEach((x, j) => { if (t >= x.t0) i = j; });
    const it = c.itens[i], tv = it.tv;
    const primeira = c === SC.cenas[0] && i === 0;
    const st = { t, c, it, i, tv, u: t - c.t0, cam: SC.camera(t) };
    const entra = primeira ? 1 : U.clamp((t - tv) / 0.25, 0, 1);
    const sai = U.clamp((it.t1 - t) / 0.15, 0, 1);
    st.aTexto = t < tv && !primeira ? 0 : Math.min(entra, sai);
    st.dyTexto = primeira ? 0 : (1 - U.ease.outCubic(U.clamp((t - tv) / 0.3, 0, 1))) * 18;
    st.ativo = c.tipo === 'marco' ? c.marco : (c.tipo === 'presente' || c.tipo === 'pergunta') ? MARCOS.length : -1;
    return st;
  }

  // ---------- um quadro inteiro ----------
  function quadro(ctx, t) {
    const st = estado(Math.min(Math.max(t, 0), SC.DURATION - 0.001));
    const cam = st.cam, k = perto(cam), c = st.c;
    E.fundo(ctx);
    // de perto: o cartão e o ano do marco que está no meio da tela (na viagem, um sai e o outro entra)
    for (const p of PONTOS) cartao(ctx, cam, p, st, k * noMeio(sx(p.x, cam)));
    linhaDoTempo(ctx, cam, st.ativo);
    const rola = rolagem(cam); // na viagem entre dois anos, o ano dos dois marcos dá lugar ao contador
    for (const p of PONTOS) anoERotulo(ctx, cam, p, k * noMeio(sx(p.x, cam), 280, 2.5), !!rola && (p.i === rola.i0 || p.i === rola.i1));
    if (rola) contadorDeAnos(ctx, cam, rola);
    cotas(ctx, cam, t, st.ativo, k);
    // de longe: a linha inteira só com os anos (na pergunta, os marcos aparecem um a um); no fecho, cada marco ganha o seu
    // verbo, um por vez (a resposta)
    const longe = 1 - k;
    if (c.tipo === 'fecho' && c.verbos) visaoGeral(ctx, cam, t, longe, { modo: 'fecho', subs: c.verbos.concat([HOJE.rotulo]).map(D), tSub: c.itens[0].tv + 0.5 });
    else visaoGeral(ctx, cam, t, longe, { modo: 'anos', subs: [], aparece: c.tipo === 'pergunta' && c.itens[1] ? c.itens[1].t0 + 1.0 : null });
    // a cena pode pôr algo por cima, na tela (PECA.CENA[id]), antes da frase
    const extra = (P().CENA || {})[c.id];
    if (extra) extra(ctx, st);
    // a frase: na pergunta, grande (é a capa); no resto, embaixo
    if (c.tipo === 'pergunta' && st.i === 0) bloco(ctx, st.it.n, { baseY: 1430, sizes: [80, 74, 68, 62], maxLinhas: [2, 3, 3, 3], papel: 'titulo', alpha: st.aTexto, dy: st.dyTexto });
    else bloco(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
  }

  globalThis.LINHA = { L, R, TOP, BOT, CX, LINHA_Y, ANO_Y, ROT_Y, COTA_Y, LINHA_V, CARTAO, TEXTO_Y, D, cor, wid, escrever, paragrafo, medirParagrafo, bloco, sx, perto, yLinha, estado, quadro, PONTOS, KIT, carregar };
})();
