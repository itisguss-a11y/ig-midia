// PRESEME · carrossel · caso, arraste para a resposta · desenho 3 · os desenhos da peça de exemplo ("a ferida que não
// fecha", leishmaniose tegumentar). Texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable).
// O molde de lâmina (film-2-moldes.js, que não muda) chama PRESEME.DESENHO.cena[id da lâmina](ctx, caixa, lam, extra),
// com caixa = { x, y, w, h }, o espaço livre que ele deixou (na capa, extra.ficha e extra.livre dizem onde está a ficha
// e o que sobra à esquerda dela). Nas lâminas de lista, PRESEME.DESENHO.item[id] = [um desenho por item], cada um
// (ctx, cx, cy, s), centrado em cx, cy, em uns 260 × 220 px na escala 1. Os rótulos vêm do textos.txt (palavra D).
// Lugar, objeto e gente saem da biblioteca (B.arvore, B.pessoa, B.lupa, B.calendario, B.ubsIcone, B.prancheta). Os
// desenhos novos (o flebotomíneo, a ferida, a toalha, o copo, a pomada, a janela com tela, o mosquiteiro, a roupa
// comprida e a vassoura) ficam no fim, em PRESEME.NOVOS: são candidatos à biblioteca.
// Regras da ficha que valem aqui: um ponto de foco por lâmina; o mito desenhado aparece riscado (o X de Coral); a
// ferida é um desenho simples, de símbolo, nunca cópia de foto de paciente; nada de nome de remédio.
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, DS = P.DESENHO, TX = globalThis.TEXTOS, B = globalThis.BIB, K = P.KIT;
  const D = (k) => TX[k] || '';
  // a cor que não some: a primeira da lista que não é a cor do fundo (no chapado o fundo é Sálvia)
  const naoSome = (...ps) => ps.find((p) => E.cor(p) !== E.cor('fundo')) || ps[ps.length - 1];
  // a cor que não some em cima do cartão (os desenhos das listas ficam no cartão, que é a superficie)
  const noCartao = (...ps) => ps.find((p) => E.cor(p) !== E.cor('superficie')) || ps[ps.length - 1];
  const rotulo = (ctx, k, cx, y, w, o = {}) => P.bloco(ctx, k, { x: cx - w / 2, y, w, h: o.h || 56 }, Object.assign({ sizes: [38, 36, 34, 32, 30], align: 'center', maxLinhas: 2, lh: 1.05 }, o));

  // ---------- os desenhos novos (candidatos à biblioteca) ----------
  // o flebotomíneo (mosquito-palha): x, y é o meio do corpo; as asas em V, para cima, e as pernas compridas
  function flebotomineo(ctx, x, y, s = 1, seed = 300) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.08);
    const asa = naoSome('apoio', 'superficie');
    for (const sd of [-1, 1]) {
      E.poligono(ctx, [[sd * 4, -8], [sd * 26, -92], [sd * 50, -96], [sd * 30, -40], [sd * 12, -4]], { papel: asa, seed: seed + (sd > 0 ? 1 : 2), hachura: false });
      for (let i = 0; i < 3; i++) E.linha(ctx, [[sd * (10 + i * 6), -12 - i * 4], [sd * (30 + i * 6), -78 + i * 8]], { lw: 2, seed: seed + 20 + i + (sd > 0 ? 5 : 0) });
    }
    for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) {
      E.linha(ctx, [[sd * 6, 2 + i * 7], [sd * (34 + i * 10), 20 + i * 12], [sd * (54 + i * 14), 66 + i * 8]], { lw: 3, seed: seed + 10 + i + (sd > 0 ? 5 : 0) });
    }
    E.circulo(ctx, 0, 30, 9, { ry: 26, papel: naoSome('apoioEscuro', 'tinta'), seed: seed + 30 });
    E.circulo(ctx, 0, 2, 16, { ry: 14, papel: naoSome('apoioEscuro', 'tinta'), seed: seed + 31 });
    E.circulo(ctx, 0, -18, 9, { papel: naoSome('apoioEscuro', 'tinta'), seed: seed + 32 });
    for (const sd of [-1, 1]) E.linha(ctx, [[sd * 4, -24], [sd * 20, -46], [sd * 38, -50]], { lw: 2.5, seed: seed + 40 + (sd > 0 ? 1 : 0) });
    E.linha(ctx, [[0, -26], [2, -42]], { lw: 3, seed: seed + 44 });
    ctx.restore();
  }
  // um pedaço de pele (o braço de perto) com a manchinha ou a ferida: x, y é o centro; r, o tamanho da ferida;
  // fase 0: a manchinha vermelha plana; fase 1: a ferida redonda, com a borda alta. Desenho de símbolo
  function pele(ctx, x, y, w, h, seed = 400) {
    E.ret(ctx, x - w / 2, y - h / 2, w, h, { papel: 'pele', r: h / 2, seed, hachura: false });
  }
  function ferida(ctx, x, y, r = 40, fase = 1, seed = 410) {
    if (fase < 1) { E.circulo(ctx, x, y, r * 0.42, { ry: r * 0.34, papel: 'coral', seed, hachura: false, contorno: false }); return; }
    E.circulo(ctx, x, y, r, { ry: r * 0.8, papel: 'coral', seed, hachura: false });
    E.circulo(ctx, x, y, r * 0.62, { ry: r * 0.48, papel: 'papel', seed: seed + 1, hachura: false });
    for (let i = 0; i < 7; i++) {
      const a = i * 0.9 + 0.3, d = r * (0.12 + 0.05 * (i % 3));
      E.circulo(ctx, x + Math.cos(a) * d * 2, y + Math.sin(a) * d * 1.4, Math.max(2.5, r * 0.06), { papel: 'coral', seed: seed + 2 + i, hachura: false, contorno: false });
    }
  }
  // a toalha pendurada no varal e o copo
  function toalha(ctx, x, y, s = 1, seed = 430) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const c = naoSome('apoio', 'superficie');
    E.linha(ctx, [[-92, -74], [92, -74]], { lw: 7, seed });
    E.ret(ctx, -64, -78, 128, 176, { papel: c, r: 6, seed: seed + 1 });
    E.ret(ctx, -64, -78, 128, 34, { papel: naoSome('apoioEscuro', 'tinta'), r: 6, seed: seed + 2, hachura: false });
    for (const yy of [56, 72]) E.linha(ctx, [[-60, yy], [60, yy]], { papel: 'coral', lw: 7, seed: seed + yy });
    for (let i = -3; i <= 3; i++) E.linha(ctx, [[i * 18, 98], [i * 18, 112]], { lw: 3, seed: seed + 80 + i });
    ctx.restore();
  }
  function copo(ctx, x, y, s = 1, seed = 440) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    E.poligono(ctx, [[-36, -50], [36, -50], [28, 50], [-28, 50]], { papel: 'superficie', seed, hachura: false });
    E.linha(ctx, [[-32, -16], [32, -16]], { papel: naoSome('apoio', 'apoioEscuro'), lw: 4, seed: seed + 1 });
    ctx.restore();
  }
  // o tubo de pomada (sem nome de remédio): x, y é o meio
  function pomada(ctx, x, y, s = 1, seed = 450) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.2);
    E.poligono(ctx, [[-96, -40], [64, -48], [64, 48], [-96, 40], [-108, 26], [-96, 14], [-108, 0], [-96, -14], [-108, -26]], { papel: naoSome('superficie', 'papel'), seed });
    E.ret(ctx, 64, -26, 26, 52, { papel: naoSome('apoioEscuro', 'tinta'), r: 4, seed: seed + 1 });
    E.ret(ctx, 88, -18, 34, 36, { papel: naoSome('apoioEscuro', 'tinta'), r: 6, seed: seed + 4 });
    E.ret(ctx, -60, -22, 96, 44, { papel: naoSome('apoio', 'apoioEscuro'), r: 8, seed: seed + 2, hachura: false });
    E.linha(ctx, [[-82, -30], [-82, 30]], { lw: 3, seed: seed + 3 });
    ctx.restore();
  }
  // a janela com tela (a grade fina)
  function janelaTela(ctx, x, y, s = 1, seed = 460, cartao = false) {
    const ns = cartao ? noCartao : naoSome;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    E.ret(ctx, -90, -90, 180, 180, { papel: ns('apoio', 'apoioEscuro'), r: 8, seed });
    for (let i = 1; i < 8; i++) {
      const u = -80 + i * 20;
      E.linha(ctx, [[u, -80], [u, 80]], { lw: 2, seed: seed + i });
      E.linha(ctx, [[-80, u], [80, u]], { lw: 2, seed: seed + 20 + i });
    }
    E.linha(ctx, [[0, -88], [0, 88]], { lw: 6, seed: seed + 40 });
    ctx.restore();
  }
  // a cama com o mosquiteiro (a rede fina em cone)
  function mosquiteiro(ctx, x, y, s = 1, seed = 470, cartao = false) {
    const ns = cartao ? noCartao : naoSome;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    E.ret(ctx, -110, 40, 220, 34, { papel: naoSome('apoioEscuro', 'tinta'), r: 6, seed });
    for (const sx of [-100, 92]) E.linha(ctx, [[sx, 74], [sx, 100]], { lw: 6, seed: seed + 1 + sx });
    E.ret(ctx, -96, 22, 70, 22, { papel: 'superficie', r: 10, seed: seed + 3 });
    E.poligono(ctx, [[0, -100], [124, 46], [-124, 46]], { papel: ns('apoio', 'apoioEscuro'), seed: seed + 4, hachura: false, alpha: 0.55 });
    for (let i = 1; i < 6; i++) E.linha(ctx, [[0, -100], [-124 + i * 41, 46]], { lw: 2, seed: seed + 10 + i });
    for (let j = 1; j < 4; j++) { const yy = -100 + j * 36, hw = (124 * (yy + 100)) / 146; E.linha(ctx, [[-hw, yy], [hw, yy]], { lw: 2, seed: seed + 20 + j }); }
    E.circulo(ctx, 0, -104, 8, { papel: 'tinta', seed: seed + 30, hachura: false });
    ctx.restore();
  }
  // a camisa de manga comprida e a calça
  function roupaComprida(ctx, x, y, s = 1, seed = 480, cartao = false) {
    const ns = cartao ? noCartao : naoSome;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const c = ns('apoio', 'apoioEscuro');
    E.poligono(ctx, [[-40, -96], [40, -96], [104, -20], [84, -6], [44, -50], [44, 10], [-44, 10], [-44, -50], [-84, -6], [-104, -20]], { papel: c, seed });
    E.poligono(ctx, [[-40, 16], [40, 16], [44, 104], [12, 104], [0, 40], [-12, 104], [-44, 104]], { papel: ns('apoioEscuro', 'tinta'), seed: seed + 1 });
    E.linha(ctx, [[-16, -96], [0, -80], [16, -96]], { lw: 4, seed: seed + 2 });
    ctx.restore();
  }
  // a vassoura (quintal limpo)
  function vassoura(ctx, x, y, s = 1, seed = 490, cartao = false) {
    const ns = cartao ? noCartao : naoSome;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(0.35);
    E.linha(ctx, [[0, -110], [0, 40]], { papel: ns('apoioEscuro', 'tinta'), lw: 10, seed });
    E.poligono(ctx, [[-22, 36], [22, 36], [52, 104], [-52, 104]], { papel: 'destaque', seed: seed + 1 });
    for (let i = -3; i <= 3; i++) E.linha(ctx, [[i * 6, 40], [i * 14, 102]], { lw: 2.5, seed: seed + 5 + i });
    ctx.restore();
  }
  P.NOVOS = { flebotomineo, pele, ferida, toalha, copo, pomada, janelaTela, mosquiteiro, roupaComprida, vassoura };

  // ---------- as lâminas ----------
  // capa: a mata atrás, o chão, Seu Raimundo mostrando o braço e a lupa com a ferida (a ficha é do molde)
  DS.cena.caso = (ctx, b, lam, ex) => {
    const lv = ex.livre || b, chao = b.y + b.h - 4;
    B.arvore(ctx, { x: lv.x + lv.w * 0.18, y: chao - 6, h: Math.min(420, b.h * 0.72), tipo: 'buriti' });
    B.arvore(ctx, { x: lv.x + lv.w * 0.86, y: chao - 6, h: Math.min(360, b.h * 0.6) });
    E.chao(ctx, chao);
    const s = Math.min(1.08, (b.h - 70) / 520), px = lv.x + lv.w * 0.36;
    B.pessoa(ctx, { quem: 'idoso', cabelo: 'preto', corRoupa: 'coral', corCalca: 'papel', x: px, y: chao + 2, s, pose: 'stand', handR: [196, -262], look: 0.4, mouth: 'flat', eyes: 'worried' });
    // a lupa com a ferida, em cima da mão, e o fio até o braço
    const hx = px + 170 * s, hy = chao + 2 - 270 * s, lx = Math.min(lv.x + lv.w - 70, hx + 10), ly = hy - 170 * s;
    E.linha(ctx, [[hx, hy - 6], [lx - 20, ly + 70]], { lw: 3, seed: 501, tracejado: true });
    B.lupa(ctx, { x: lx, y: ly, r: 74, cabo: 2.3, dentro: (c) => { pele(c, lx, ly, 200, 120, 402); ferida(c, lx, ly, 36, 1, 411); } });
  };

  // resposta: o ACS aponta o caminho da UBS, e Seu Raimundo vai junto
  DS.cena.resposta = (ctx, b) => {
    const s = Math.min(0.62, (b.h - 20) / 500);
    if (s < 0.3) return; // sem lugar para a cena (texto longo, letra larga do pixel): a lâmina fica só com os cartões
    const chao = b.y + b.h - 6;
    B.pessoa(ctx, { quem: 'agente', x: b.x + 120, y: chao, s, pose: 'stand', gesture: 'point', look: 0.6 });
    B.pessoa(ctx, { quem: 'idoso', cabelo: 'preto', corRoupa: 'coral', corCalca: 'papel', x: b.x + 300, y: chao, s, pose: 'stand', look: 0.6, mouth: 'smile' });
    E.seta(ctx, [b.x + 420, chao - 160 * s], [b.x + b.w - 190, chao - 160 * s], { papel: naoSome('apoioEscuro', 'tinta'), lw: 7, curva: -0.15, seed: 511 });
    B.ubsIcone(ctx, { x: b.x + b.w - 110, y: chao - 120 * s, s: Math.min(1.3, b.h / 220) });
  };

  // porquê da A: a toalha e o copo separados, riscados; quem passa é o inseto
  DS.cena.porqueA = (ctx, b, lam) => {
    const [kNao, kNome, kPop] = lam.palavras, cxL = b.x + b.w * 0.25, cxR = b.x + b.w * 0.72;
    const s = Math.min(1.35, b.h / 420), cy = b.y + Math.min(b.h * 0.4, 150 * s);
    toalha(ctx, cxL - 60 * s, cy, s); copo(ctx, cxL + 90 * s, cy + 46 * s, s);
    K.risco(ctx, cxL + 10, cy + 10, 110 * s, 71);
    if (kNao) rotulo(ctx, kNao, cxL, cy + 150 * s, b.w * 0.44);
    flebotomineo(ctx, cxR, cy - 10 * s, 1.75 * s);
    if (kNome) rotulo(ctx, kNome, cxR, cy + 172 * s, b.w * 0.5, { papel: 'titulo', sizes: [46, 42, 40, 38], maxLinhas: 1 });
    if (kPop) rotulo(ctx, kPop, cxR, cy + 172 * s + 60, b.w * 0.52, { sizes: [34, 32, 30, 28, 26, 24], maxLinhas: 2, h: 80 });
  };

  // porquê da B: a manchinha que vira a ferida redonda, e a borda, que é de onde o exame tira o pedacinho
  DS.cena.porqueB = (ctx, b, lam) => {
    const [kMancha, kFerida, kBorda] = lam.palavras, s = Math.min(1.3, b.h / 400), cy = b.y + Math.min(b.h * 0.44, 190 * s);
    const x1 = b.x + b.w * 0.16, x2 = b.x + b.w * 0.68;
    pele(ctx, x1, cy, 200 * s, 130 * s, 403); ferida(ctx, x1, cy, 46 * s, 0, 412);
    E.seta(ctx, [x1 + 112 * s, cy], [x2 - 148 * s, cy], { papel: naoSome('apoioEscuro', 'tinta'), lw: 7, curva: -0.2, seed: 521 });
    pele(ctx, x2, cy, 270 * s, 180 * s, 404); ferida(ctx, x2, cy, 66 * s, 1, 413);
    // a borda: a seta de Coral até o anel
    const bx = x2 + 62 * s, by = cy - 34 * s;
    E.seta(ctx, [x2 + 210 * s, cy - 120 * s], [bx + 6, by - 4], { papel: naoSome('alerta', 'coral'), lw: 6, curva: 0.25, cabeca: 24, seed: 522 });
    if (kBorda) E.texto(ctx, D(kBorda), Math.min(b.x + b.w - 10, x2 + 214 * s), cy - 130 * s, { papel: 'mao', size: 44, align: 'right' });
    if (kMancha) rotulo(ctx, kMancha, x1, cy + 110 * s, 260);
    if (kFerida) rotulo(ctx, kFerida, x2, cy + 130 * s, 360);
  };

  // porquê da C: a pomada riscada; o tratamento do SUS, que pode durar até 30 dias
  DS.cena.porqueC = (ctx, b, lam) => {
    const [kDias, kSus] = lam.palavras, s = Math.min(1.25, b.h / 400), cy = b.y + Math.min(b.h * 0.44, 190 * s);
    const x1 = b.x + b.w * 0.17, x2 = b.x + b.w * 0.52, x3 = b.x + b.w * 0.85;
    pomada(ctx, x1, cy, 1.05 * s); K.risco(ctx, x1, cy, 96 * s, 72);
    B.calendario(ctx, { x: x2, y: cy, s: 0.92 * s, titulo: D(kDias), marcados: Array.from({ length: 30 }, (_, i) => i) });
    E.seta(ctx, [x2 + 160 * s, cy - 10], [x3 - 80 * s, cy - 10], { papel: naoSome('apoioEscuro', 'tinta'), lw: 6, curva: -0.2, seed: 531 });
    B.ubsIcone(ctx, { x: x3, y: cy - 10, s: 1.1 * s });
    if (kSus) rotulo(ctx, kSus, x3, cy + 92 * s, 230);
  };

  // atenção primária: acolhe, exame da borda, tratamento do SUS, acompanha depois
  DS.item.aps = [
    (ctx, cx, cy, s) => B.pessoa(ctx, { quem: 'enfermeira', x: cx, y: cy + 92 * s, s: 0.36 * s, pose: 'stand', gesture: 'wave', mouth: 'smile' }),
    (ctx, cx, cy, s) => B.lupa(ctx, { x: cx - 10 * s, y: cy - 6 * s, r: 66 * s, cabo: 0.8, dentro: (c) => { pele(c, cx - 10 * s, cy - 6 * s, 160 * s, 100 * s, 405); ferida(c, cx - 10 * s, cy - 6 * s, 32 * s, 1, 414); } }),
    (ctx, cx, cy, s) => B.ubsIcone(ctx, { x: cx, y: cy, s: 1.2 * s }),
    (ctx, cx, cy, s) => B.prancheta(ctx, { x: cx, y: cy + 4 * s, s: 0.82 * s, linhas: 3, vistos: 3 }),
  ];
  // prevenção: tela, mosquiteiro, roupa comprida, quintal limpo
  DS.item.prevencao = [
    (ctx, cx, cy, s) => janelaTela(ctx, cx, cy, 0.92 * s, 460, true),
    (ctx, cx, cy, s) => mosquiteiro(ctx, cx, cy + 4 * s, 0.9 * s, 470, true),
    (ctx, cx, cy, s) => roupaComprida(ctx, cx, cy, 0.92 * s, 480, true),
    (ctx, cx, cy, s) => vassoura(ctx, cx, cy, 0.9 * s, 490, true),
  ];
})();
