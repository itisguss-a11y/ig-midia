// PRESEME · tipo "o caminho" · desenho 1/3 · o molde (igual em toda peça deste tipo; o chat não mexe aqui)
// O texto que se quebra sozinho, o mundo que rola de lado (chão, estrada, lugares, letreiros, veículo e objeto), o
// passaporte das paradas (a assinatura do tipo: cada chegada carimba uma casa), o medidor da faixa segura, o cartão do
// cuidado e o mapa do caminho inteiro. Cores e letras vêm do kit de estilos (ferramentas/estilos.js): a mesma peça sai
// em carimbo, planta, chapado ou outro estilo trocando o ESTILO do score.js.
// O que é de cada peça (o objeto, os lugares, os veículos e os desenhos dos cuidados) vem de film-2-peca.js (PECA).
(function () {
  const U = globalThis.U, G = globalThis.G, E = globalThis.ESTILOS, SC = globalThis.SCORE, TX = globalThis.TEXTOS;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const L = SAFE.x, R = SAFE.x + SAFE.w, TOP = SAFE.y, BOT = SAFE.y + SAFE.h, CX = (L + R) / 2; // 60, 940, 221, 1498, 500
  const BASE = 700, NB = '\u00A0'; // espaço que não quebra (o trecho destacado e o número com a unidade ficam juntos)
  const D = (k) => TX[k] || '';
  const P = () => globalThis.PECA || {};
  const cl = (x) => U.clamp(x, 0, 1);
  // o papel de cor que mais aparece em cima de outro (a estrada no chão, a casa vazia no fundo), em qualquer estilo do kit
  const luz = (hex) => { const h = String(hex || '#000').replace('#', ''); const v = (i) => { const c = parseInt(h.substr(i, 2), 16) / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * v(0) + 0.7152 * v(2) + 0.0722 * v(4); };
  const contraste = (a, b) => { const x = luz(a), y = luz(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const melhorSobre = (sobre, opcoes) => opcoes.reduce((m, p) => (contraste(E.cor(p), E.cor(sobre)) > contraste(E.cor(m), E.cor(sobre)) ? p : m), opcoes[0]);

  // ---------- a geometria do mundo ----------
  const CHAO = 1330; // a linha do chão: os lugares ficam em cima dela
  const ESTRADA = CHAO + 74; // a estrada, no chão, com as marcas das paradas
  const PASSO = 1080; // a distância entre dois pontos do caminho (uma tela por trecho)
  const OBJ_X = 330; // onde o objeto fica na tela (a câmera anda com ele)
  const LUGAR_DX = 270; // o centro do lugar fica à direita do ponto de parada
  const LETREIRO_Y = 872; // o centro do letreiro de cada lugar
  const TETO = CHAO - 370; // o desenho de cada lugar fica abaixo desta linha (em cima dela vem o letreiro)
  const PX = (k) => k * PASSO;

  // ---------- texto ----------
  const fonte = (papel = 'corpo') => E.letra(papel); // [família, peso, escala]
  const wid = (ctx, s, size, papel = 'corpo') => { const [fam, w, k] = fonte(papel); return G.measure(ctx, s, Math.round(size * k), fam, w); };
  const escrever = (ctx, s, x, y, o = {}) => E.texto(ctx, s, x, y, Object.assign({ papel: 'corpo', size: 56, align: 'left', cor: 'texto', alpha: 1 }, o));
  function quebrar(ctx, s, size, maxW, papel) {
    const out = []; let cur = '';
    for (const w of s.split(' ')) {
      const t = cur ? cur + ' ' + w : w;
      if (cur && wid(ctx, t, size, papel) > maxW) { out.push(cur); cur = w; } else cur = t;
    }
    if (cur) out.push(cur);
    return out;
  }
  const FRACA = new Set(['a', 'o', 'as', 'os', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'e', 'em', 'no', 'na', 'nos', 'nas', 'que', 'é', 'à', 'ao', 'para', 'por', 'com', 'se', 'não', 'ou', 'pela', 'pelo', 'até']);
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
  function linhasDe(ctx, n, size, maxW, papel) {
    const key = [n, size, maxW, papel].join(':');
    if (!memo.has(key)) {
      let s = TX[n] || ''; const d = (P().DESTAQUE || {})[n];
      if (d && s.includes(d)) s = s.replace(d, d.split(' ').join(NB)); // o trecho destacado não se parte em duas linhas
      // número e unidade não se separam ("2 °C", "27 centrais")
      s = s.replace(/(\d) (°C|%)/g, '$1' + NB + '$2');
      memo.set(key, equilibrar(ctx, s, size, maxW, papel));
    }
    return memo.get(key);
  }
  // a frase da vez, centrada; a última linha em baseY; o trecho da peça (PECA.DESTAQUE) ganha o destaque do estilo
  function bloco(ctx, n, { baseY = BASE, sizes = [58, 54, 50, 46], maxLinhas = [2, 3, 3, 4], maxW = R - L, alpha = 1, dy = 0, papel = 'corpo', cx = CX } = {}) {
    if (!TX[n]) return;
    let size = sizes[sizes.length - 1], ls = null;
    for (let i = 0; i < sizes.length; i++) {
      const t = linhasDe(ctx, n, sizes[i], maxW, papel);
      if (t.length <= maxLinhas[i] && t.every((l) => wid(ctx, l.split(NB).join(' '), sizes[i], papel) <= maxW)) { size = sizes[i]; ls = t; break; }
    }
    if (!ls) ls = linhasDe(ctx, n, size, maxW, papel);
    const lh = size * fonte(papel)[2] * 1.27, d = (P().DESTAQUE || {})[n];
    ctx.save(); ctx.globalAlpha *= alpha;
    ls.forEach((l, i) => {
      const s = l.split(NB).join(' '), y = baseY - (ls.length - 1 - i) * lh + dy, w = wid(ctx, s, size, papel), x = cx - w / 2;
      const k = d ? s.indexOf(d) : -1;
      if (k >= 0) E.destaque(ctx, x + wid(ctx, s.slice(0, k), size, papel), y, wid(ctx, d, size, papel), size * fonte(papel)[2], { seed: 7 + n * 3 + i });
      escrever(ctx, s, x, y, { size, papel });
    });
    ctx.restore();
  }

  // ---------- marcas: o visto e o X ----------
  function visto(ctx, x, y, s = 1, k = 1) {
    if (k <= 0) return;
    E.circulo(ctx, x, y, 34 * s, { papel: 'apoio', seed: 811, sombra: false });
    E.linha(ctx, [[x - 15 * s, y + 1 * s], [x - 4 * s, y + 13 * s], [x + 17 * s, y - 13 * s]], { papel: 'tinta', lw: 7 * s, k, seed: 812 });
  }
  function xis(ctx, x, y, s = 1, k = 1) {
    if (k <= 0) return;
    E.linha(ctx, [[x - 22 * s, y - 22 * s], [x + 22 * s, y + 22 * s]], { papel: 'alerta', lw: 11 * s, k: cl(k * 2), seed: 821 });
    E.linha(ctx, [[x + 22 * s, y - 22 * s], [x - 22 * s, y + 22 * s]], { papel: 'alerta', lw: 11 * s, k: cl(k * 2 - 1), seed: 822 });
  }

  // ---------- o objeto que viaja ----------
  // o desenho é da peça (PECA.OBJETO); sem ele, um círculo. O termômetro pequeno ao lado aparece quando o caminho tem medidor.
  function objeto(ctx, x, y, s, st) {
    const f = P().OBJETO;
    if (f) f(ctx, x, y, s, st); else E.circulo(ctx, x, y - 40 * s, 40 * s, { papel: 'destaque', seed: 901 });
    if (SC.MEDIDOR) {
      const tx = x + 46 * s, ty = y - 92 * s;
      E.ret(ctx, tx - 8 * s, ty, 16 * s, 66 * s, { papel: 'superficie', r: 8 * s, seed: 905, sombra: false, hachura: false, lw: 2.5 });
      E.ret(ctx, tx - 4 * s, ty + 26 * s, 8 * s, 38 * s, { papel: 'apoioEscuro', r: 4 * s, seed: 906, sombra: false, contorno: false, hachura: false });
      E.circulo(ctx, tx, ty + 70 * s, 11 * s, { papel: 'apoioEscuro', seed: 907, sombra: false, hachura: false });
    }
  }

  // ---------- o passaporte: uma casa por parada e uma pela chegada; a chegada carimba a casa ----------
  function passaporte(ctx, t, { y = TOP + 18 } = {}) {
    const pts = SC.PONTOS.slice(1), n = pts.length, gap = 14, w = (R - L - gap * (n - 1)) / n, h = 108;
    pts.forEach((p, i) => {
      const x = L + i * (w + gap), feito = t >= p.tChega;
      const vazio = E.cor('apoio') === E.cor('fundo') ? 'superficie' : 'apoio'; // a casa ainda sem carimbo (no chapado, o fundo já é Sálvia)
      E.ret(ctx, x, y, w, h, { papel: feito ? 'superficie' : vazio, r: 14, seed: 600 + i, sombra: false, hachura: false, lw: 3, alpha: feito || vazio === 'apoio' ? 1 : 0.55 });
      const rotulo = p.tipo === 'chegada' ? 'OK' : String(p.num);
      if (!feito) { escrever(ctx, rotulo, x + w / 2, y + h / 2 + 14, { papel: 'numero', size: 40, align: 'center', alpha: 0.55 }); return; }
      E.carimbo(ctx, rotulo, x + w / 2, y + h / 2 + 2, { k: cl((t - p.tChega) / 0.18), size: 34, rot: (U.hash(i, 7) - 0.5) * 0.4, seed: 620 + i });
    });
  }

  // ---------- o mundo que rola de lado ----------
  // um prédio simples com telhado em duas águas (base em y; o telhado chega a y - hParede - hTelhado): serve de lugar
  // para qualquer peça e é o lugar padrão de quem ainda não tem desenho (PECA.LUGAR sem a chave)
  function predio(ctx, cx, y, w, hParede, hTelhado, { papelParede = 'superficie', papelTelhado = 'apoioEscuro', seed = 600 } = {}) {
    E.poligono(ctx, [[cx - w / 2 - 26, y - hParede + 4], [cx, y - hParede - hTelhado], [cx + w / 2 + 26, y - hParede + 4]], { papel: papelTelhado, seed: seed + 1, sombra: false });
    E.ret(ctx, cx - w / 2, y - hParede, w, hParede, { papel: papelParede, r: 6, seed, sombra: false });
  }
  function lugar(ctx, ponto, cx, st) {
    const f = (P().LUGAR || {})[ponto.lugar];
    if (!f) { // sem desenho ainda: um prédio com porta, para a folha de quadros sair desde o primeiro rascunho
      if (ponto.tipo === 'parada' || ponto.tipo === 'partida') { predio(ctx, cx, CHAO, 300, 230, 90, { seed: 640 + ponto.k * 7 }); E.ret(ctx, cx + 40, CHAO - 120, 80, 120, { papel: 'sombra', r: 4, seed: 645 + ponto.k, sombra: false, hachura: false }); }
      return null;
    }
    return f(ctx, cx, CHAO, st, ponto) || null;
  }
  // o letreiro em cima do lugar (o nome curto da parada); pulsa quando o objeto chega
  function letreiro(ctx, cx, chave, pulso = 0) {
    const s = D(chave); if (!s) return;
    const size = 44, w = Math.max(220, wid(ctx, s, size, 'titulo') + 56), h = 84, z = 1 + 0.12 * pulso;
    // na viagem, o letreiro que passa da área segura (a borda que o Instagram cobre) some aos poucos e fica sem letra:
    // texto cortado na borda é erro no qa, e a placa vazia por um instante não se nota com o mundo andando
    const fora = Math.max(0, L - (cx - w / 2), cx + w / 2 - R);
    if (fora > 0) {
      const a = cl(1 - fora / 90); if (a <= 0) return;
      ctx.save(); ctx.globalAlpha *= a; ctx.translate(cx, LETREIRO_Y);
      E.linha(ctx, [[-w / 2 + 34, h / 2], [-w / 2 + 34, h / 2 + 46]], { lw: 6, seed: 31 });
      E.linha(ctx, [[w / 2 - 34, h / 2], [w / 2 - 34, h / 2 + 46]], { lw: 6, seed: 32 });
      E.ret(ctx, -w / 2, -h / 2, w, h, { papel: 'superficie', r: 12, seed: 33 + s.length, sombra: true });
      ctx.restore(); return;
    }
    ctx.save(); ctx.translate(cx, LETREIRO_Y); ctx.scale(z, z);
    E.linha(ctx, [[-w / 2 + 34, h / 2], [-w / 2 + 34, h / 2 + 46]], { lw: 6, seed: 31 });
    E.linha(ctx, [[w / 2 - 34, h / 2], [w / 2 - 34, h / 2 + 46]], { lw: 6, seed: 32 });
    E.ret(ctx, -w / 2, -h / 2, w, h, { papel: 'superficie', r: 12, seed: 33 + s.length, sombra: true });
    escrever(ctx, s, 0, 15, { papel: 'titulo', size, align: 'center' });
    ctx.restore();
  }
  // a estrada: o trecho já andado em traço cheio, o que falta tracejado; um círculo em cada ponto do caminho
  function estrada(ctx, camX, ox, t) {
    const a = Math.max(PX(0) - 900, camX - 60), b = Math.min(PX(SC.PONTOS.length - 1) + 900, camX + W + 60);
    const tinta = melhorSobre('chao', ['tinta', 'superficie', 'texto']); // a estrada aparece no chão de qualquer estilo
    if (ox > a) E.linha(ctx, [[a - camX, ESTRADA], [Math.min(ox, b) - camX, ESTRADA]], { papel: tinta, lw: 9, seed: 41 });
    if (ox < b) E.linha(ctx, [[Math.max(ox, a) - camX, ESTRADA], [b - camX, ESTRADA]], { papel: tinta, lw: 6, seed: 42, tracejado: true });
    for (const p of SC.PONTOS) {
      const sx = PX(p.k) - camX; if (sx < -80 || sx > W + 80) continue;
      const feito = p.k === 0 || t >= p.tChega;
      E.circulo(ctx, sx, ESTRADA, 30, { papel: feito ? 'destaque' : 'superficie', seed: 50 + p.k, sombra: false, hachura: false, lw: 4 });
      if (p.tipo === 'parada' && sx > L + 30 && sx < R - 30) escrever(ctx, String(p.num), sx, ESTRADA + 13, { papel: 'numero', size: 34, align: 'center' }); // número só dentro da área segura
    }
  }
  // um quadro do mundo: a câmera segue o objeto do ponto anterior até o desta cena; depois da chegada, o veículo vai embora
  // e o objeto pula para o lugar (PECA.LUGAR devolve { pouso: [x, y], escala } quando o objeto entra nele)
  function mundo(ctx, st) {
    const c = st.c, t = st.t, k = c.ponto, tc = c.tChega;
    const e = U.ease.inOutCubic(cl((t - c.t0) / Math.max(1e-6, tc - c.t0)));
    const ox = U.lerp(PX(k - 1), PX(k), e), camX = ox - OBJ_X;
    E.fundo(ctx);
    const ceu = P().CEU; if (ceu) ceu(ctx, st, camX);
    E.chao(ctx, CHAO);
    let pouso = null;
    for (const p of SC.PONTOS) {
      const cx = PX(p.k) + LUGAR_DX - camX;
      if (cx < -520 || cx > W + 520) continue;
      const r = lugar(ctx, p, cx, st);
      if (p.k === k) pouso = r && r.pouso ? r : null;
    }
    estrada(ctx, camX, ox, t);
    for (const p of SC.PONTOS) {
      if (p.tipo === 'chegada') continue; // na chegada, o próprio lugar é o fim (o letreiro dela fica no mapa e no passaporte)
      const cx = PX(p.k) + LUGAR_DX - camX;
      if (cx < -320 || cx > W + 320) continue;
      letreiro(ctx, cx, p.nome, p.k === k ? U.pulse(t, tc + 0.35, 7) * (t >= tc + 0.35 ? 1 : 0) : 0);
    }
    const veic = c.transporte && (P().TRANSPORTE || {})[c.transporte];
    // o veículo devolve { carga: [x, y], escala, frente }: onde o objeto vai e o que fica na frente dele (a janela, a borda)
    if (t < tc) {
      if (veic) {
        const r = veic(ctx, OBJ_X, CHAO, st, e) || {}; const [vx, vy] = r.carga || [OBJ_X, CHAO];
        objeto(ctx, vx, vy, r.escala || 0.8, st); if (r.frente) r.frente(ctx);
      } else objeto(ctx, OBJ_X, CHAO - Math.abs(Math.sin(e * Math.PI * 3)) * 70, 1.25, st); // sem veículo, o objeto vai pulando
      return;
    }
    // chegou: o veículo segue para a direita e sai; o objeto pula do veículo (ou do chão) para o pouso
    let de = [OBJ_X, CHAO], s0 = 1.25;
    if (veic) {
      const dx = Math.min((t - tc) * 1300, W + 900); // depois de sair da tela, ele é desenhado fora dela (não aparece)
      const r = veic(ctx, OBJ_X + dx, CHAO, st, 1) || {};
      if (r.carga) { de = [r.carga[0] - dx, r.carga[1]]; s0 = r.escala || 0.8; }
    }
    // o pouso (PECA.LUGAR devolve { pouso: [x, y], escala, frente, apaga }): apaga = segundos depois da chegada em que o objeto
    // some no lugar (a vacina entra no braço, por exemplo)
    const para = pouso ? pouso.pouso : [OBJ_X, CHAO], s1 = pouso ? pouso.escala || 1.25 : 1.25;
    const u = U.ease.outCubic(cl((t - tc) / 0.35));
    const x = U.lerp(de[0], para[0], u), y = U.lerp(de[1], para[1], u) - Math.sin(u * Math.PI) * 120;
    const a = pouso && pouso.apaga !== undefined ? 1 - cl((t - tc - pouso.apaga) / 0.35) : 1;
    if (a > 0) { ctx.save(); ctx.globalAlpha *= a; objeto(ctx, x, y, U.lerp(s0, s1, u), st); ctx.restore(); }
    if (pouso && pouso.frente) pouso.frente(ctx); // o que fica na frente do objeto (a porta, a borda da caixa)
  }

  // ---------- o medidor: a faixa segura, as marcas de alarme e o valor ----------
  function medidor(ctx, x, yTop, yBot, valor, { pulso = 0 } = {}) {
    const M = SC.MEDIDOR; if (!M) return;
    const v2y = (v) => U.lerp(yBot, yTop, cl((v - M.escala[0]) / (M.escala[1] - M.escala[0])));
    const dentro = valor >= M.faixa[0] && valor <= M.faixa[1];
    E.ret(ctx, x - 40, yTop - 26, 80, yBot - yTop + 52, { papel: 'superficie', r: 40, seed: 701, sombra: false, lw: 5 });
    const z = 1 + 0.08 * pulso;
    ctx.save(); ctx.translate(x, (v2y(M.faixa[0]) + v2y(M.faixa[1])) / 2); ctx.scale(z, z); ctx.translate(-x, -(v2y(M.faixa[0]) + v2y(M.faixa[1])) / 2);
    E.ret(ctx, x - 32, v2y(M.faixa[1]), 64, v2y(M.faixa[0]) - v2y(M.faixa[1]), { papel: 'apoio', r: 10, seed: 702, sombra: false, contorno: false, hachura: false });
    ctx.restore();
    const vy = v2y(valor);
    E.ret(ctx, x - 17, vy, 34, yBot - vy + 20, { papel: dentro ? 'apoioEscuro' : 'alerta', r: 17, seed: 703, sombra: false, contorno: false, hachura: false });
    E.circulo(ctx, x, yBot + 42, 50, { papel: dentro ? 'apoioEscuro' : 'alerta', seed: 704, sombra: false });
    // a régua: os dois limites da faixa, ao lado do tubo
    for (const v of M.faixa) {
      E.linha(ctx, [[x + 44, v2y(v)], [x + 70, v2y(v)]], { lw: 5, seed: 710 + v });
      escrever(ctx, String(v), x + 78, v2y(v) + 12, { papel: 'numero', size: 34 });
    }
    return { v2y, dentro };
  }

  // ---------- o cartão: o medidor grande e, ao lado, o desenho da peça ----------
  // conf: { risco, volta, alarme } (do score.js); sem risco, o medidor fica no normal
  // o cartão do cuidado; do 2º cuidado da mesma parada em diante, o cartão novo entra virando, para o corte se ver
  // (sem isso, dois cartões iguais em seguida passam por um trecho só, e o ritmo acusa trecho longo sem corte)
  const CARTAO_MEIO = 1131; // o meio do cartão (y), o eixo da virada
  function cartao(ctx, st, conf = {}, desenho = null) {
    const vira = st.i >= 2 ? U.ease.outCubic(cl((st.t - st.it.t0) / 0.3)) : 1;
    if (vira >= 1) return cartao0(ctx, st, conf, desenho, true);
    E.fundo(ctx);
    ctx.save(); ctx.translate(CX, CARTAO_MEIO); ctx.scale(Math.max(0.02, vira), 1); ctx.translate(-CX, -CARTAO_MEIO);
    const r = cartao0(ctx, st, conf, desenho, false);
    ctx.restore();
    return r;
  }
  function cartao0(ctx, st, conf, desenho, comFundo) {
    const M = SC.MEDIDOR, CA = SC.CARTAO, t = st.t, t0 = st.it.t0;
    if (comFundo) E.fundo(ctx);
    const y0 = 800, y1 = 1462;
    E.ret(ctx, L, y0, R - L, y1 - y0, { papel: 'superficie', r: 30, seed: 720 + st.it.n, sombra: true });
    const sobe = U.ease.inOutCubic(cl((t - t0 - CA.sobe) / CA.sobeDur));
    const volta = conf.volta ? U.ease.inOutCubic(cl((t - t0 - CA.volta) / CA.voltaDur)) : 0;
    const temRisco = conf.risco !== null && conf.risco !== undefined;
    const valor = !M ? 0 : temRisco ? U.lerp(U.lerp(M.normal, conf.risco, sobe), M.normal, volta) : M.normal;
    const fase = { sobe: temRisco ? sobe : 0, volta, valor, risco: conf.risco, temRisco, fim: cl((t - t0 - CA.volta) / CA.voltaDur) };
    const gx = R - 168, gTop = 932, gBot = 1330;
    const caixa = M ? { x: L + 28, y: y0 + 34, w: gx - 120 - L - 28, h: y1 - y0 - 68 } : { x: L + 28, y: y0 + 34, w: R - L - 56, h: y1 - y0 - 68 };
    if (desenho) desenho(ctx, caixa, st, fase);
    if (!M) return fase;
    { // o rótulo da faixa segura em cima do medidor: diminui até caber no cartão (centrado no medidor ou encostado à direita)
      const s = D(M.rotulo), meia = R - 30 - gx, w38 = wid(ctx, s, 38, 'numero');
      const size = Math.max(24, Math.min(38, (38 * 2 * meia) / Math.max(1, w38)));
      if (wid(ctx, s, size, 'numero') <= 2 * meia) escrever(ctx, s, gx, gTop - 52, { papel: 'numero', size, align: 'center' });
      else escrever(ctx, s, R - 30, gTop - 52, { papel: 'numero', size, align: 'right' });
    }
    const pul = st.c.tipo === 'pergunta' ? U.pulse(t, t0 + 0.4, 4) * (t >= t0 + 0.4 ? 1 : 0) : 0;
    const m = medidor(ctx, gx, gTop, gBot, valor, { pulso: pul });
    for (const v of conf.alarme || []) {
      const y = m.v2y(v);
      E.linha(ctx, [[gx - 54, y], [gx + 40, y]], { papel: 'alerta', lw: 5, seed: 730 + v, tracejado: true });
    }
    if (temRisco && t >= t0 + CA.volta + CA.voltaDur * 0.5) {
      const k = cl((t - t0 - CA.volta - CA.voltaDur * 0.5) / 0.3);
      if (conf.volta) visto(ctx, gx - 92, gTop + 30, 1.1, k); else xis(ctx, gx - 92, gTop + 30, 1.2, k);
    }
    return fase;
  }

  // ---------- o mapa do caminho inteiro (a pergunta e o fecho) ----------
  // de 3 a 9 pontos (até 7 paradas), 3 por fileira; de 10 a 12 (8 a 10 paradas), 4 por fileira; a fileira de baixo volta
  function mapaGeo() {
    const n = SC.PONTOS.length, porFila = n <= 9 ? 3 : 4, rows = Math.ceil(n / porFila);
    const slots = porFila === 3 ? [170, CX, 810] : [170, 383, 597, 810];
    const y0 = 900, y1 = 1350, sp = Math.min(240, rows > 1 ? (y1 - y0) / (rows - 1) : 240);
    const pos = SC.PONTOS.map((p, i) => { const r = Math.floor(i / porFila), j = i % porFila, col = r % 2 ? porFila - 1 - j : j; return [slots[col], y0 + r * sp]; });
    const path = [pos[0]], marca = [0];
    for (let i = 1; i < n; i++) {
      const a = pos[i - 1], b = pos[i];
      if (a[1] !== b[1]) { // a curva para a fileira de baixo, do lado em que a fileira acabou
        const cxv = a[0], cyv = (a[1] + b[1]) / 2, rr = (b[1] - a[1]) / 2, lado = a[0] > CX ? 1 : -1;
        for (let q = 1; q <= 16; q++) { const ang = -Math.PI / 2 + (Math.PI * q) / 16; path.push([cxv + lado * Math.cos(ang) * rr, cyv + Math.sin(ang) * rr]); }
      }
      path.push(b); marca.push(path.length - 1);
    }
    let tot = 0; const acum = [0];
    for (let i = 1; i < path.length; i++) { tot += Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); acum.push(tot); }
    return { pos, path, frac: marca.map((m) => acum[m] / (tot || 1)) };
  }
  let GEO = null;
  function mapa(ctx, st, { recap = false } = {}) {
    if (!GEO) GEO = mapaGeo();
    const t = st.t, t0 = st.c.t0, MA = SC.MAPA;
    const k = recap ? 1 : U.ease.inOutCubic(cl((t - t0 - MA.traca) / MA.tracaDur));
    E.fundo(ctx);
    E.linha(ctx, GEO.path, { papel: 'tinta', lw: 6, seed: 61, tracejado: true, k: recap ? 1 : 1 });
    if (k > 0) E.linha(ctx, GEO.path, { papel: 'tinta', lw: 10, seed: 62, k });
    SC.PONTOS.forEach((p, i) => {
      const [x, y] = GEO.pos[i], chegou = k >= GEO.frac[i] - 1e-3;
      const pop = recap ? 0 : U.pulse(t, t0 + MA.traca + GEO.frac[i] * MA.tracaDur, 9) * (chegou ? 1 : 0);
      const r = (p.tipo === 'parada' ? 34 : 42) * (1 + 0.25 * pop);
      E.circulo(ctx, x, y, r, { papel: chegou ? (p.tipo === 'parada' ? 'destaque' : 'apoio') : 'superficie', seed: 70 + i, sombra: false, lw: 4 });
      if (p.tipo === 'parada') escrever(ctx, String(p.num), x, y + 14, { papel: 'numero', size: 38, align: 'center' });
      quebrar(ctx, D(p.nome), 34, GEO.pos.length > 9 ? 180 : 200, 'mao').slice(0, 2).forEach((ln, j) => escrever(ctx, ln, x, y + 84 + j * 36, { papel: 'mao', size: 34, align: 'center', alpha: chegou ? 1 : 0.6 }));
      if (recap && p.k > 0) visto(ctx, x + 40, y - 34, 0.62, cl((t - st.it.t0 - 0.15 - 0.12 * i) / 0.25));
    });
    // o objeto: na partida (pergunta) ou na chegada (fecho), em cima do círculo
    const i0 = recap ? SC.PONTOS.length - 1 : 0, [ox, oy] = GEO.pos[i0];
    const a = recap ? 1 : U.ease.outBack(cl((t - t0 - 0.3) / 0.35));
    // no fecho, o objeto pousa dentro do círculo da chegada, menor, para não cobrir o nome da fileira de cima
    if (a > 0) objeto(ctx, ox - 4, recap ? oy + 10 - 10 * U.pulse(t, st.it.t0 + SC.BEAT, 6) : oy - 44, (recap ? 0.62 : 0.85) * a, st);
  }

  // ---------- o estado do filme no instante t ----------
  function estado(t) {
    const c = SC.cenaEm(t);
    let i = 0;
    c.itens.forEach((x, j) => { if (t >= x.t0) i = j; });
    const it = c.itens[i], ultima = i === c.itens.length - 1;
    const st = { t, c, it, i, u: t - c.t0 };
    const corte = true; // neste tipo, toda frase troca o quadro (mundo, cartão ou mapa): a frase entra junto com a imagem
    st.aTexto = Math.min(corte ? 1 : cl((t - it.t0) / 0.2), ultima ? 1 : cl((it.t1 - t) / 0.12));
    st.dyTexto = 0;
    return st;
  }

  globalThis.CAMINHO = { L, R, TOP, BOT, CX, BASE, CHAO, ESTRADA, PASSO, OBJ_X, LUGAR_DX, LETREIRO_Y, TETO, PX, D, wid, escrever, quebrar, bloco, predio, visto, xis, objeto, passaporte, mundo, medidor, cartao, mapa, estado };
})();
