// PRESEME · motor do tipo "X não é Y" · desenho 3/3 · o filme (do molde: igual em toda peça deste tipo)
// Cada tipo de cena tem o seu arranjo: onde fica o texto, a etiqueta de cada lado, o sinal de diferente e o lugar do
// desenho da peça (PECA.DESENHO, em film-2-peca.js). O estilo (lápis, giz, chapado...) vem do kit, pelo score.js.
(function () {
  const U = globalThis.U, G = globalThis.G, E = globalThis.ESTILOS, SC = globalThis.SCORE, M = globalThis.MOLDE;
  const { L, R, TOP, BOT, CX, TEXTO_Y, prog } = M;
  const P = () => globalThis.PECA || {};
  const desenho = (nome) => ((P().DESENHO || {})[nome]) || null;
  // o close de uma frase, no caso e nos conceitos: PECA.FOCO[número da frase] = [x, y, zoom] (o ponto x, y do desenho fica
  // parado e o resto cresce em volta). A frase com close entra em corte seco e no outro tom do fundo (o da cena vizinha):
  // é o corte de dentro da cena, e o conferir o conta (a troca do fundo inteiro muda bem mais de 12% da imagem).
  // Um 4.º número diz quantos segundos o close dura (depois, volta ao quadro inteiro e ao tom da cena, em outro corte):
  // a última frase de uma cena não deve acabar de perto, senão o fim da cena fica no tom da cena seguinte e o corte some.
  const focoDe = (st) => { const f = (P().FOCO || {})[st.it.n]; return f && !(f[3] && st.t - st.it.t0 >= f[3]) ? f : null; };

  const ARRANJO = {
    // o título: "X não é Y" inteiro no primeiro quadro (é a capa e o gancho); embaixo, as duas etiquetas começam uma em
    // cima da outra (os dois se confundem) e se separam quando o sinal de diferente bate; depois, a frase do porquê
    titulo(ctx, st) {
      const c = st.c, t = st.t;
      const it0 = c.itens[0], it1 = c.itens[1];
      // o título: quebra no "não é" (três linhas), no maior tamanho que cabe
      const s = M.D(it0.n), i = s.indexOf(' não é ');
      const ls = i > 0 ? [s.slice(0, i), 'não é', s.slice(i + 7)] : [s];
      let size = 124;
      while (size > 60 && Math.max(...ls.map((l) => E.medir(ctx, l, { papel: 'titulo', size }))) > R - L) size -= 4;
      const lh = size * E.letra('titulo')[2] * 1.12, y0 = TOP + 40 + size * E.letra('titulo')[2];
      const kD = U.ease.inOutCubic(prog(t, it0.t0 + 0.35, 0.45));
      ls.forEach((l, j) => E.textoComDestaque(ctx, l, ls.length === 3 && j === 1 ? 'não é' : '', CX, y0 + j * lh, { papel: 'titulo', size, align: 'center', k: kD, seed: 3 + j }));
      let yFim = y0 + (ls.length - 1) * lh;
      // a frase do porquê (a segunda), embaixo do título
      if (it1 && t >= it1.t0) {
        const a = prog(t, it1.t0, 0.25);
        yFim = M.bloco(ctx, it1.n, { y0: yFim + 110, papel: 'corpo', sizes: [50, 46, 42], maxLinhas: [2, 3, 3], alpha: a, dy: (1 - a) * 14, k: U.ease.inOutCubic(prog(t, it1.t0 + 0.4, 0.5)) });
      }
      // as duas etiquetas: coladas e tortas no começo (os dois se confundem), separadas no instante do sinal de
      // diferente. Coladas sem uma letra cobrir a outra: a de baixo vem por último e só cobre a borda da de cima
      const sep = U.ease.inOutCubic(prog(t, c.t0 + SC.MOLDE.diferente - 0.25, 0.5));
      const yMeio = Math.max(yFim + 380, 1180), dist = 32 + 158 * sep;
      M.etiqueta(ctx, 'x', CX - 22 * (1 - sep), yMeio - dist - 46, { size: 52, align: 'center', seed: 1 });
      M.etiqueta(ctx, 'y', CX + 22 * (1 - sep), yMeio + dist - 46, { size: 52, align: 'center', seed: 2 });
      M.diferente(ctx, CX, yMeio, 74, { k: prog(t, c.t0 + SC.MOLDE.diferente, 0.3) });
      const extra = desenho('titulo'); if (extra) extra(ctx, st);
    },

    // um conceito: a etiqueta do lado em cima, a frase da vez e o desenho do conceito funcionando (da peça)
    // O desenho fica no meio da área livre, embaixo do texto: a peça diz de que altura a que altura ele vai
    // (PECA.ALTURA[lado] = [topo, base], nas coordenadas do desenho) e o molde o desloca para o meio da faixa entre a frase
    // mais alta da cena e o fim da área segura, sem faixa vazia entre o texto e o desenho. st.area é essa faixa.
    conceito(ctx, st) {
      const c = st.c, o = { y0: TOP + 176, align: 'left' };
      M.etiqueta(ctx, c.lado, L, TOP + 2, { k: prog(st.t, c.t0 + SC.MOLDE.etiqueta - 0.1, 0.3), size: 38, seed: c.lado === 'x' ? 1 : 2 });
      M.textoDaVez(ctx, st, o);
      const f = desenho(c.id) || desenho(c.lado); if (!f) return;
      const area = { x0: L, x1: R, y0: M.fimDoTexto(ctx, c, o) + 70, y1: BOT - 20 };
      const alt = (P().ALTURA || {})[c.id] || (P().ALTURA || {})[c.lado];
      // no meio da faixa; se o desenho for mais alto que ela, encosta embaixo do texto (nunca em cima dele)
      const dy = alt ? Math.round(Math.max(area.y0 - alt[0], Math.min((area.y0 + area.y1 - alt[0] - alt[1]) / 2, area.y1 - alt[1]))) : 0;
      const fo = focoDe(st), z = fo ? fo[2] || 1.3 : 1;
      ctx.save();
      if (fo) { ctx.beginPath(); ctx.rect(0, area.y0 - 10, M.W, M.H); ctx.clip(); } // o close não sobe para cima do texto
      ctx.translate(0, dy);
      if (fo) { ctx.translate(fo[0], fo[1]); ctx.scale(z, z); ctx.translate(-fo[0], -fo[1]); }
      f(ctx, Object.assign({ area, dy, zoom: fo ? z : undefined }, st));
      ctx.restore();
    },

    // a diferença: a frase que separa os dois, em cima; os dois desenhos lado a lado, com o sinal de diferente no meio
    diferenca(ctx, st) {
      const t = st.t, it = st.it;
      M.textoDaVez(ctx, st, { sizes: [66, 60, 56, 52], maxLinhas: [2, 3, 3, 4] });
      const yA = 760, yB = 1430, meio = (yA + yB) / 2;
      const esq = { x0: L, x1: CX - 34, y0: yA + 110, y1: yB }, dir = { x0: CX + 34, x1: R, y0: yA + 110, y1: yB };
      M.etiqueta(ctx, 'y', (esq.x0 + esq.x1) / 2, yA, { size: 32, align: 'center', seed: 2 });
      M.etiqueta(ctx, 'x', (dir.x0 + dir.x1) / 2, yA, { size: 32, align: 'center', seed: 1 });
      E.linha(ctx, [[CX, yA - 10], [CX, yB]], { lw: 4, tracejado: true, k: prog(t, it.t0, 0.4), seed: 31 });
      const fy = desenho('mini_y'), fx = desenho('mini_x');
      if (fy) fy(ctx, Object.assign({ caixa: esq }, st));
      if (fx) fx(ctx, Object.assign({ caixa: dir }, st));
      M.diferente(ctx, CX, meio, 60, { k: prog(t, it.t0 + 0.05, 0.3) });
    },

    // o caso: a frase da vez em cima e o desenho do caso (da peça), que vai crescendo frase a frase.
    // O corte do caso é o close: na frase que tem PECA.FOCO[número da frase] = [x, y, zoom], o desenho fecha no detalhe que
    // ela explica (o ponto x, y fica parado e o resto cresce em volta), em corte seco na troca de frase; a frase sem FOCO
    // mostra o caso inteiro. Alternar (inteiro, perto, inteiro, perto) deixa no máximo uma frase sem corte, e o conferir
    // pede um corte a cada 12 s. O close nunca sobe acima do texto. Palavra do desenho tem de ficar na área segura no close.
    caso(ctx, st) {
      M.textoDaVez(ctx, st);
      const f = desenho('caso'); if (!f) return;
      const fo = focoDe(st);
      if (!fo) return f(ctx, st);
      const [fx, fy, z = 1.5] = fo, zona = M.fimDoTexto(ctx, st.c) + 60;
      ctx.save();
      ctx.beginPath(); ctx.rect(0, zona, M.W, M.H - zona); ctx.clip();
      ctx.translate(fx, fy); ctx.scale(z, z); ctx.translate(-fx, -fy);
      f(ctx, Object.assign({ zoom: z }, st));
      ctx.restore();
    },

    // a regra: em cada linha, as palavras-pista e a seta que acha o nome certo (PECA.REGRA); a linha fica na tela
    regra(ctx, st) {
      const t = st.t;
      M.textoDaVez(ctx, st, { sizes: [58, 54, 50, 46], maxLinhas: [2, 3, 3, 4] });
      (P().REGRA || []).forEach((r, i) => {
        const ln = SC.linha[r.frase]; if (!ln || t < ln.t0) return;
        const y = 900 + i * 360, t0 = ln.t0;
        let x = L;
        r.pistas.forEach((k, j) => { x += M.pista(ctx, M.D(k), x, y, { k: prog(t, t0 + 0.15 + 0.15 * j, 0.25), size: 48, seed: i * 5 + j }) + 24; });
        const kS = U.ease.inOutCubic(prog(t, t0 + 0.45, SC.MOLDE.acha - 0.45));
        const wTag = E.medir(ctx, M.nomeDe(r.lado), { papel: 'titulo', size: 42 }) + 56, xTag = R - wTag;
        E.seta(ctx, [L + 70, y + 52], [xTag - 18, y + 140 + 36], { curva: 0.18, k: kS, lw: 9, cabeca: 34, seed: 50 + i });
        M.etiqueta(ctx, r.lado, R, y + 140, { k: prog(t, t0 + SC.MOLDE.acha, 0.3), size: 42, align: 'right', seed: i + 1 });
      });
    },

    // o fecho: responde ao título; o desenho do fecho é da peça (sem ele, as duas etiquetas e o sinal de diferente)
    fecho(ctx, st) {
      const t = st.t;
      M.textoDaVez(ctx, st, { sizes: [70, 64, 58, 54], maxLinhas: [3, 3, 4, 4] });
      const f = desenho('fecho');
      if (f) { f(ctx, st); return; }
      M.etiqueta(ctx, 'x', CX, 1000, { size: 40, align: 'center', seed: 1 });
      M.diferente(ctx, CX, 1190, 50, { k: prog(t, st.c.t0 + SC.MOLDE.fecho, 0.3) });
      M.etiqueta(ctx, 'y', CX, 1290, { size: 40, align: 'center', seed: 2 });
    },
  };

  // o tom do fundo de cada cena: o fundo do estilo (A) ou o mesmo fundo mais fundo (B: misturado com 20% de Folha, ou
  // 70% no estilo escuro; mistura de duas cores da paleta, que a conferência das cores aceita). As cenas se alternam,
  // então todo corte troca o fundo inteiro: o corte se vê (a conferência de ritmo mede a imagem que muda) e os dois
  // conceitos ficam cada um no seu tom. No estilo que tem fundo próprio (o giz, por exemplo), o tom não muda.
  const TOM = { titulo: 'A', y: 'B', x: 'A', diferenca: 'B', caso: 'A', regra: 'B', fecho: 'A' };
  const tomDe = (c) => TOM[c.tipo === 'conceito' ? c.lado : c.tipo] || 'A';
  let corB = null;
  const fundoB = () => {
    if (corB) return corB;
    const hex = (h) => [1, 3, 5].map((i) => parseInt(String(h).slice(i, i + 2), 16));
    const a = hex(E.cor('fundo')), b = hex(E.cor('folha')), f = E.escuro() ? 0.7 : 0.2;
    if (a.concat(b).some((v) => !Number.isFinite(v))) return (corB = E.cor('fundo'));
    return (corB = '#' + a.map((v, i) => Math.round(v + (b[i] - v) * f).toString(16).padStart(2, '0')).join(''));
  };

  globalThis.Studio.film({
    fadeOut: 0,
    draw(ctx, t) {
      const st = M.estado(Math.min(Math.max(t, 0), SC.DURATION - 0.001));
      const tom = focoDe(st) ? (tomDe(st.c) === 'A' ? 'B' : 'A') : tomDe(st.c); // o close usa o outro tom
      if (tom === 'B') G.bg(ctx, fundoB()); else E.fundo(ctx);
      (ARRANJO[st.c.tipo] || ARRANJO.caso)(ctx, st);
    },
  });
})();
