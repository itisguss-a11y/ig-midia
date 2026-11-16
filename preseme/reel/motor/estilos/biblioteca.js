// PRESEME · biblioteca de desenhos prontos: lugares, objetos e gente, para qualquer reel ou carrossel.
//
// Tudo é desenhado com o kit de estilos (ferramentas/estilos.js): sai nos seis estilos (lápis, pixel, giz, planta,
// carimbo, chapado), só nas cores da paleta, e o tamanho, o lugar e o giro vêm por parâmetro.
//
// Como carregar, no index.html da peça: logo DEPOIS da linha do kit (as duas antes do engine/video/gfx.js):
//   <script src="ferramentas/estilos.js"></script>
//   <script src="ferramentas/biblioteca.js"></script>
// Como usar, no film:
//   const B = globalThis.BIB;
//   B.varanda(ctx);                                   // o lugar: desenha o quadro inteiro (fundo, paredes e chão)
//   const c = B.cadeira(ctx, { x: 600, y: 1400 });   // um objeto; devolve pontos úteis (c.assento)
//   B.pessoa(ctx, { quem: 'idosa', x: c.assento[0], y: c.assento[1], pose: 'sit' });
// A lista de tudo, com os parâmetros, está no README.md da biblioteca: leia o README, não este arquivo.
// Nenhum desenho escreve palavra sozinho: todo texto (número da casa, leitura do visor, nome do mês) entra por
// parâmetro e vem do textos.txt (D('Dnn')), como manda o molde.
(function () {
  'use strict';
  if (typeof window === 'undefined') { if (typeof module !== 'undefined') module.exports = {}; return; } // só no navegador
  const E = globalThis.ESTILOS, U = globalThis.U;
  if (!E) { console.error('[biblioteca] falta o kit: ponha <script src="ferramentas/estilos.js"></script> antes da biblioteca'); return; }
  const { PAL, GENTE } = E;

  // ---------- o básico ----------
  const GR = () => globalThis.G; // o G do motor só existe depois do gfx.js: pegue na hora de desenhar
  const WD = () => (GR() ? GR().W : 1080), HT = () => (GR() ? GR().H : 1920);
  const chao0 = () => Math.round(HT() * 0.729); // o chão padrão: 1400 no reel (1920 de altura), 984 no carrossel (1350)
  // a única cor de fora da paleta: o cabelo grisalho (cor de gente). Quem usar põe no "cores" do peca.json
  const EXTRA = { grisalho: '#B9B2A6' };
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  // peça de dentro de um objeto: sem sombra e sem hachura
  const so = (o) => Object.assign({ sombra: false, hachura: false }, o);
  // o fundo atrás do desenho: o do estilo, ou a cor que o último lugar pintou (fundo: 'papel'). Vale até o próximo lugar
  let FUNDO = null;
  const corFundo = () => E.cor(FUNDO || 'fundo');
  // a cor que não some: a primeira da lista que não é a cor do fundo (no chapado o fundo é Sálvia)
  const naoSome = (...ps) => ps.find((p) => E.cor(p) !== corFundo()) || ps[ps.length - 1];
  // desenha no lugar: leva para (x, y), gira rot, aumenta s (espelho: vira para o outro lado)
  function em(ctx, o, fn) {
    const s = o.s ?? 1;
    ctx.save(); ctx.translate(o.x, o.y); if (o.rot) ctx.rotate(o.rot); ctx.scale(o.espelho ? -s : s, s);
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    try { return fn(); } finally { ctx.restore(); }
  }
  // um ponto do desenho (local) levado para a tela, com o mesmo x, y, s, rot e espelho
  function tela(o, lx, ly) {
    const s = o.s ?? 1, c = Math.cos(o.rot || 0), sn = Math.sin(o.rot || 0), fx = o.espelho ? -1 : 1;
    return [o.x + (lx * fx * c - ly * sn) * s, o.y + (lx * fx * sn + ly * c) * s];
  }
  // texto dentro de um desenho (leitura do visor, número da porta): diminui até caber em w e nunca sai espelhado
  function escreve(ctx, s, x, y, o = {}) {
    if (s === undefined || s === null || s === '') return;
    s = String(s);
    const op = Object.assign({ papel: 'corpo', size: 40, align: 'center' }, o);
    if (o.w) while (op.size > 12 && E.medir(ctx, s, op) > o.w) op.size -= 2;
    const m = ctx.getTransform();
    if (m.a * m.d - m.b * m.c < 0) { ctx.save(); ctx.translate(x, y); ctx.scale(-1, 1); E.texto(ctx, s, 0, 0, op); ctx.restore(); }
    else E.texto(ctx, s, x, y, op);
  }
  // pontos de uma curva (para rede, tubo, rio)
  const curva = (de, meio, ate, n = 10) => Array.from({ length: n + 1 }, (_, k) => {
    const u = k / n, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u;
    return [a * de[0] + b * meio[0] + c * ate[0], a * de[1] + b * meio[1] + c * ate[1]];
  });

  // ======================================================================================================
  // OBJETOS. x, y: o chão (o pé do objeto) para o que fica em pé no chão ou na mesa; o centro para o que se segura.
  // s: o tamanho (1 = o tamanho de uma cena de reel); rot: o giro; seed: a semente do traço (mude para variar).
  // ======================================================================================================

  // a mesa: x, y é o chão, no meio dela; w a largura do tampo; h a altura do tampo; papel a cor do tampo
  function mesa(ctx, o = {}) {
    o = Object.assign({ x: 540, y: chao0(), w: 300, h: 250, papel: 'apoioEscuro', seed: 430 }, o);
    const { w, h, seed } = o;
    em(ctx, o, () => {
      for (const sx of [-1, 1]) E.linha(ctx, [[sx * (w / 2 - 30), -h + 20], [sx * (w / 2 - 24), 0]], { lw: 10, seed: seed + 2 + sx });
      E.ret(ctx, -w / 2, -h, w, 28, { papel: o.papel, r: 6, seed });
    });
    return { topo: tela(o, 0, -h)[1], centro: tela(o, 0, -h) };
  }

  // a cadeira: x, y é o chão, no meio dela. tipo 'plastico' (encosto alto, a da varanda; coral) ou 'madeira' (encosto de
  // lado; espelho: o encosto do outro lado). Devolve assento: o x, y da pessoa sentada (Ch.person com pose 'sit')
  function cadeira(ctx, o = {}) {
    o = Object.assign({ x: 540, y: chao0(), tipo: 'plastico', seed: 420 }, o);
    const madeira = o.tipo === 'madeira', papel = o.papel || (madeira ? 'apoioEscuro' : 'coral'), seed = o.seed;
    em(ctx, o, () => {
      if (madeira) {
        E.linha(ctx, [[-66, -150], [-72, -336]], { lw: 10, seed: seed + 1 });
        E.ret(ctx, -86, -350, 32, 84, so({ papel, r: 8, seed: seed + 2 }));
        for (const sx of [-1, 1]) E.linha(ctx, [[sx * 60, -134], [sx * 64, 0]], { lw: 9, seed: seed + 4 + sx });
        E.ret(ctx, -76, -154, 152, 22, { papel, r: 6, seed: seed + 3 });
      } else {
        E.ret(ctx, -94, -484, 188, 306, { papel, r: 44, seed });
        for (const sx of [-1, 1]) E.linha(ctx, [[sx * 84, -142], [sx * 91, 0]], { lw: 10, seed: seed + 3 + sx });
        E.ret(ctx, -104, -170, 208, 30, { papel, r: 12, seed: seed + 1 });
      }
    });
    return { assento: tela(o, 0, madeira ? -132 : -150) };
  }

  // a rede armada: x, y é o meio, na altura dos ganchos; w de gancho a gancho; sag o quanto ela cai; t: o tempo (balança)
  function rede(ctx, o = {}) {
    o = Object.assign({ x: 891, y: 942, w: 262, sag: 66, papel: 'coral', listra: 'destaque', t: null, seed: 410 }, o);
    const { w, sag, seed } = o, n = 14, x0 = -w / 2, x1 = w / 2;
    const bal = o.t == null ? 0 : Math.sin(o.t * 1.6) * 14; // a rede balança devagar
    const ponto = (u, dy, k) => [lerp(x0, x1, u) + Math.sin(Math.PI * u) * bal, dy + Math.sin(Math.PI * u) * sag * k];
    em(ctx, o, () => {
      E.linha(ctx, [[x0 - 34, -24], [x0, 14]], { lw: 4, seed: seed + 4 });
      E.linha(ctx, [[x1 + 26, -30], [x1, 14]], { lw: 4, seed: seed + 5 });
      const top = [], bot = [];
      for (let k = 0; k <= n; k++) top.push(ponto(k / n, 0, 1));
      for (let k = n; k >= 0; k--) bot.push(ponto(k / n, 40, 0.86));
      E.poligono(ctx, top.concat(bot), { papel: o.papel, seed, hachura: false });
      for (const [dy, sd] of [[13, 1], [26, 2]]) {
        const pts = []; for (let k = 1; k < n; k++) pts.push(ponto(k / n, dy, 1 - dy / 300));
        E.linha(ctx, pts, { papel: o.listra, lw: 5, seed: seed + sd });
      }
    });
    return { meio: tela(o, bal, sag + 20) };
  }

  // o relógio: x, y é o centro; r o raio. frac (0 a 1): a fatia do tempo que já passou (no marca-texto), com o ponteiro
  // nela; ou hora (9.5 = 9h30): ponteiros de hora e minuto. rotulo: texto embaixo dele
  function relogio(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 700, r: 104, frac: null, hora: null, rotulo: '', seed: 470 }, o);
    const r = o.r, seed = o.seed, fr = o.frac == null ? null : clamp(o.frac);
    em(ctx, o, () => {
      E.circulo(ctx, 0, 0, r, { papel: 'superficie', lw: 7, seed });
      if (fr != null && fr > 0.002) {
        const pts = [[0, 0]], n = Math.max(3, Math.ceil(48 * fr));
        for (let k = 0; k <= n; k++) { const a = -Math.PI / 2 + 2 * Math.PI * fr * (k / n); pts.push([Math.cos(a) * (r - 11), Math.sin(a) * (r - 11)]); }
        E.poligono(ctx, pts, so({ papel: 'destaque', contorno: false, amp: 0, seed: seed + 1 }));
      }
      for (let k = 0; k < 12; k++) { const a = (k * Math.PI) / 6; E.linha(ctx, [[Math.cos(a) * (r - 18), Math.sin(a) * (r - 18)], [Math.cos(a) * (r - 5), Math.sin(a) * (r - 5)]], { lw: 4, seed: seed + 2 + k }); }
      const pont = (a, len, lw, sd) => E.linha(ctx, [[0, 0], [Math.cos(a) * len, Math.sin(a) * len]], { lw, seed: seed + sd });
      if (o.hora != null) {
        const h = ((o.hora % 12) + 12) % 12;
        pont(-Math.PI / 2 + (2 * Math.PI * h) / 12, r * 0.5, 9, 20);
        pont(-Math.PI / 2 + 2 * Math.PI * (h % 1), r * 0.76, 6, 21);
      } else pont(-Math.PI / 2 + 2 * Math.PI * (fr || 0), r - 26, 8, 20);
      E.circulo(ctx, 0, 0, 9, so({ papel: 'tinta', seed: seed + 22 }));
    });
    escreve(ctx, o.rotulo, o.x, o.y + r * (o.s ?? 1) + 56, { papel: 'mao', size: 54 });
    return { centro: [o.x, o.y] };
  }

  // o celular de pé: x, y é o centro. numero: o texto da tela (o 192 vem do textos.txt); tela: 'ligar' (número e botão
  // verde), 'mensagem' (dois balões) ou 'apagada'; k (0 a 1): o tamanho, para entrar crescendo
  function celular(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 960, numero: '', tela: 'ligar', k: 1, seed: 140 }, o);
    if (o.k <= 0) return null;
    const q = Object.assign({}, o, { s: (o.s ?? 1) * o.k }), seed = o.seed;
    em(ctx, q, () => {
      E.ret(ctx, -95, -150, 190, 300, { papel: 'noite', r: 30, seed });
      E.ret(ctx, -24, -142, 48, 8, so({ papel: 'branco', r: 4, contorno: false, seed: seed + 3 }));
      if (o.tela === 'apagada') { E.linha(ctx, [[-50, -90], [20, -110]], { papel: 'branco', lw: 5, seed: seed + 4 }); return; }
      E.ret(ctx, -78, -126, 156, 230, so({ papel: 'destaque', r: 16, contorno: false, seed: seed + 1 }));
      if (o.tela === 'mensagem') {
        E.ret(ctx, -64, -100, 100, 50, so({ papel: 'superficie', r: 14, seed: seed + 5 }));
        E.ret(ctx, -30, -30, 94, 44, so({ papel: 'apoio', r: 14, seed: seed + 6 }));
        E.ret(ctx, -64, 30, 80, 44, so({ papel: 'superficie', r: 14, seed: seed + 7 }));
        return;
      }
      escreve(ctx, o.numero, 0, 10, { papel: 'numero', size: 78, cor: 'noite', w: 140 });
      E.circulo(ctx, 0, 72, 26, so({ papel: 'apoioEscuro', seed: seed + 2 }));
      E.linha(ctx, [[-11, 66], [-6, 78], [8, 80], [12, 74]], { papel: 'branco', lw: 5, seed: seed + 8 });
    });
    return { tela: tela(q, 0, -10) };
  }

  // o aparelho de pressão automático, de braço: x, y é o centro. leitura: o texto do visor; unidade: o texto pequeno
  // (mmHg, do textos.txt); alerta: o visor em coral; manguito: o manguito deitado ao lado, ligado pelo tubo (infla: 0 a 1)
  function aparelhoPressao(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 960, leitura: '', unidade: '', alerta: false, size: 24, manguito: false, infla: 0, seed: 510 }, o);
    const seed = o.seed;
    em(ctx, o, () => {
      if (o.manguito) {
        const h = 46 * (1 + 0.16 * clamp(o.infla));
        E.linha(ctx, curva([-112, 20], [-90, 70], [-70, 20]), { lw: 5, seed: seed + 6 });
        E.ret(ctx, -262, 50 - h, 150, h, { papel: 'apoioEscuro', r: 10, seed: seed + 4 });
        E.linha(ctx, [[-250, 50 - h + 12], [-128, 50 - h + 12]], { papel: 'apoio', lw: 4, seed: seed + 5 });
      }
      E.ret(ctx, -70, -50, 140, 100, { papel: 'superficie', r: 18, seed });
      E.ret(ctx, -58, -40, 116, 54, so({ papel: o.alerta ? 'alerta' : 'apoio', r: 8, seed: seed + 1 }));
      escreve(ctx, o.leitura, 0, -3, { papel: 'numero', size: o.size, cor: 'noite', w: 108 });
      escreve(ctx, o.unidade, 36, 38, { papel: 'corpo', size: 15, cor: 'noite', w: 60 });
      E.circulo(ctx, -36, 30, 9, so({ papel: 'alerta', seed: seed + 2 }));
      E.circulo(ctx, -10, 30, 9, so({ papel: 'apoioEscuro', seed: seed + 3 }));
    });
    return { visor: tela(o, 0, -13), saida: tela(o, -70, 20) };
  }
  // o manguito no braço: de (o ombro) e ate (o cotovelo), pontos da tela; infla (0 a 1); manga: a cor da manga por
  // baixo (o erro de medir por cima da roupa), ou nada. Devolve o ponto de onde sai o tubo
  function manguito(ctx, o = {}) {
    const { de, ate, infla = 0, manga = null, seed = 600 } = o;
    const ang = Math.atan2(ate[1] - de[1], ate[0] - de[0]), len = Math.hypot(ate[0] - de[0], ate[1] - de[1]);
    ctx.save(); ctx.translate(de[0], de[1]); ctx.rotate(ang);
    if (manga) E.ret(ctx, len * 0.05, -25, len * 0.95, 50, so({ papel: manga, r: 14, lw: 4, seed: seed + 5 }));
    const h = 46 * (1 + 0.16 * clamp(infla));
    E.ret(ctx, len * 0.44, -h / 2, len * 0.46, h, so({ papel: 'apoioEscuro', r: 10, lw: 4, seed }));
    E.linha(ctx, [[len * 0.5, -h / 2 + 12], [len * 0.84, -h / 2 + 12]], { papel: 'apoio', lw: 4, seed: seed + 1 });
    ctx.restore();
    return [de[0] + Math.cos(ang) * len * 0.67, de[1] + Math.sin(ang) * len * 0.67];
  }
  // o tubo (do manguito ao aparelho, ou qualquer fio): de e ate, pontos da tela; folga: o quanto ele cai no meio
  function tubo(ctx, o = {}) {
    const { de, ate, folga = 60, seed = 620 } = o;
    E.linha(ctx, curva(de, [(de[0] + ate[0]) / 2, Math.max(de[1], ate[1]) + folga], ate), { lw: 5, seed });
  }

  // a gota (de sangue, de água): x, y é o centro da parte redonda; r o tamanho; papel a cor
  function gota(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 960, r: 14, papel: 'alerta', seed: 92 }, o);
    const pts = [];
    for (let i = 0; i <= 24; i++) { const t = (i / 24) * Math.PI * 2; pts.push([o.x + o.r * Math.sin(t) * Math.sin(t / 2) * 1.15, o.y - o.r * Math.cos(t) * 1.25 + o.r * 0.25]); }
    E.poligono(ctx, pts, so({ papel: o.papel, lw: 3.5, seed: o.seed }));
  }

  // o glicosímetro: x, y é o centro do aparelho. leitura e unidade: os textos do visor; fita: a fita encaixada em cima;
  // gota: a gota de sangue na ponta da fita
  function glicosimetro(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 960, leitura: '', unidade: '', fita: true, gota: true, seed: 90 }, o);
    const seed = o.seed;
    em(ctx, o, () => {
      if (o.fita) {
        E.ret(ctx, -13, -150, 26, 58, so({ papel: 'destaque', r: 4, seed }));
        if (o.gota) gota(ctx, { x: 0, y: -168, r: 14, seed: seed + 1 });
      }
      E.ret(ctx, -70, -105, 140, 210, { papel: 'superficie', r: 30, seed: seed + 2 });
      E.ret(ctx, -52, -82, 104, 86, so({ papel: 'apoio', r: 10, seed: seed + 3 }));
      escreve(ctx, o.leitura, 0, -32, { papel: 'numero', size: 36, cor: 'noite', w: 92 });
      escreve(ctx, o.unidade, 0, -8, { papel: 'corpo', size: 16, cor: 'noite', w: 92 });
      E.circulo(ctx, -28, 52, 15, so({ papel: 'apoioEscuro', seed: seed + 4 }));
      E.circulo(ctx, 28, 52, 15, so({ papel: 'apoioEscuro', seed: seed + 5 }));
    });
    return { fita: tela(o, 0, -150), visor: tela(o, 0, -40) };
  }

  // o termômetro digital: x, y é o centro; deitado, com a ponta à direita (rot gira); leitura: o texto do visor;
  // febre: o visor em coral
  function termometro(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 960, leitura: '', febre: false, seed: 640 }, o);
    const seed = o.seed;
    em(ctx, o, () => {
      E.ret(ctx, 96, -8, 54, 16, so({ papel: 'apoioEscuro', r: 8, seed: seed + 1 }));
      E.ret(ctx, -140, -26, 244, 52, { papel: 'superficie', r: 26, seed });
      E.ret(ctx, -104, -17, 112, 34, so({ papel: o.febre ? 'alerta' : 'apoio', r: 6, seed: seed + 2 }));
      escreve(ctx, o.leitura, -48, 9, { papel: 'numero', size: 24, cor: 'noite', w: 100 });
      E.circulo(ctx, 40, 0, 10, so({ papel: 'alerta', seed: seed + 3 }));
    });
    return { ponta: tela(o, 150, 0) };
  }

  // a seringa deitada, agulha à direita (rot gira): x, y é o centro do corpo. k (0 a 1): o êmbolo empurrado (0 cheia,
  // 1 vazia); liquido: a cor da vacina
  function seringa(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 960, k: 0, liquido: 'destaque', seed: 660 }, o);
    const k = clamp(o.k), seed = o.seed, xr = -96 + 160 * k; // xr: a borracha do êmbolo
    em(ctx, o, () => {
      E.linha(ctx, [[96, 0], [176, 0]], { lw: 4, seed: seed + 1 });
      E.ret(ctx, 78, -10, 24, 20, so({ papel: 'apoioEscuro', r: 4, seed: seed + 2 }));
      E.ret(ctx, xr - 150, -7, 150, 14, so({ papel: 'superficie', r: 4, seed: seed + 3 }));
      E.ret(ctx, xr - 164, -28, 14, 56, so({ papel: 'superficie', r: 5, seed: seed + 4 }));
      E.ret(ctx, -100, -24, 180, 48, { papel: 'superficie', r: 8, seed });
      if (k < 0.98) E.ret(ctx, xr + 10, -17, 72 - xr - 10, 34, so({ papel: o.liquido, r: 4, contorno: false, seed: seed + 5 }));
      E.ret(ctx, xr, -20, 12, 40, so({ papel: 'tinta', r: 3, seed: seed + 6 }));
      E.ret(ctx, -112, -42, 12, 84, so({ papel: 'superficie', r: 5, seed: seed + 7 }));
      for (let i = 0; i < 7; i++) E.linha(ctx, [[-76 + i * 22, -24], [-76 + i * 22, i % 2 ? -14 : -9]], { lw: 3, seed: seed + 10 + i });
    });
    return { agulha: tela(o, 176, 0) };
  }

  // o frasco de vacina: x, y é o pé dele; estragado: o líquido em coral (perdeu a força)
  function frascoVacina(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 960, estragado: false, seed: 300 }, o);
    const seed = o.seed;
    em(ctx, o, () => {
      E.ret(ctx, -40, -128, 80, 128, { papel: 'superficie', r: 18, seed });
      E.ret(ctx, -29, -74, 58, 60, so({ papel: o.estragado ? 'alerta' : 'apoio', r: 12, contorno: false, seed: seed + 1 }));
      E.ret(ctx, -40, -106, 80, 22, so({ papel: 'destaque', r: 3, contorno: false, seed: seed + 2 }));
      E.ret(ctx, -19, -150, 38, 26, so({ papel: 'superficie', r: 6, seed: seed + 3 }));
      E.ret(ctx, -27, -176, 54, 30, so({ papel: 'alerta', r: 10, seed: seed + 4 }));
    });
    return { tampa: tela(o, 0, -176) };
  }

  // o floco de gelo: x, y é o centro; r o tamanho
  function floco(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 960, r: 30, papel: 'tinta', lw: 5, seed: 90 }, o);
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI) / 3, ca = Math.cos(a), sa = Math.sin(a), r = o.r;
      E.linha(ctx, [[o.x - ca * r, o.y - sa * r], [o.x + ca * r, o.y + sa * r]], { papel: o.papel, lw: o.lw, seed: o.seed + i });
      for (const sd of [-1, 1]) {
        const px = o.x + sd * ca * r * 0.62, py = o.y + sd * sa * r * 0.62, b = a + (sd > 0 ? 0 : Math.PI);
        for (const v of [-0.7, 0.7]) E.linha(ctx, [[px, py], [px + Math.cos(b + v) * r * 0.32, py + Math.sin(b + v) * r * 0.32]], { papel: o.papel, lw: o.lw * 0.8, seed: o.seed + 5 + i });
      }
    }
  }

  // a caixa térmica (da rede de frio): x, y é o pé dela, no meio; w, h o tamanho; aberta (0 a 1): a tampa abrindo;
  // floco: o floco de gelo na frente
  function caixaTermica(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 960, w: 300, h: 220, aberta: 0, floco: true, seed: 500 }, o);
    const { w, h, seed } = o, ab = clamp(o.aberta);
    em(ctx, o, () => {
      if (ab > 0) { const ht = h * 0.5 * ab; E.ret(ctx, -w / 2 + 10, -h - ht, w - 20, ht + 12, so({ papel: 'apoioEscuro', r: 10, seed: seed + 3 })); }
      E.ret(ctx, -w / 2, -h, w, h, { papel: 'superficie', r: 14, seed });
      if (ab <= 0) {
        E.ret(ctx, -w / 2, -h, w, h * 0.22, so({ papel: 'apoioEscuro', r: 10, seed: seed + 1 }));
        E.ret(ctx, -w * 0.16, -h - 14, w * 0.32, 18, so({ papel: 'tinta', r: 6, seed: seed + 2 }));
      }
      if (o.floco) {
        E.circulo(ctx, 0, -h * 0.42, h * 0.19, so({ papel: 'apoio', seed: seed + 4 }));
        floco(ctx, { x: 0, y: -h * 0.42, r: h * 0.12, lw: 4, seed: seed + 5 });
      }
    });
    return { dentro: tela(o, 0, -h), frente: tela(o, 0, -h * 0.42) };
  }

  // a prancheta da ACS: x, y é o centro; linhas (0 a 3; fração = a linha sendo escrita); vistos: quantas linhas têm
  // o visto; rot o giro
  function prancheta(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 960, linhas: 3, vistos: 0, rot: -0.06, seed: 540 }, o);
    const seed = o.seed;
    em(ctx, o, () => {
      E.ret(ctx, -80, -104, 160, 208, { papel: 'apoioEscuro', r: 10, seed });
      E.ret(ctx, -64, -86, 128, 176, so({ papel: 'superficie', r: 4, lw: 3, seed: seed + 1 }));
      E.ret(ctx, -32, -118, 64, 28, so({ papel: 'tinta', r: 7, seed: seed + 2 }));
      for (let i = 0; i < 3; i++) {
        const ly = -40 + i * 46;
        E.ret(ctx, -50, ly - 10, 18, 18, so({ papel: null, r: 3, lw: 2.5, seed: seed + 3 + i }));
        if (o.linhas > i) E.linha(ctx, [[-22, ly], [-22 + 70 * Math.min(1, o.linhas - i), ly]], { lw: 6, seed: seed + 6 + i });
        if (o.vistos > i) E.linha(ctx, [[-48, ly - 1], [-42, ly + 6], [-30, ly - 12]], { papel: 'alerta', lw: 4.5, seed: seed + 9 + i });
      }
    });
    return { topo: tela(o, 0, -104) };
  }

  // o cartão de vacina aberto: x, y é o centro; marcadas: quantas doses têm o visto (ou a lista dos quadrinhos, de 0 a 11,
  // da esquerda para a direita e de cima para baixo); titulo: o texto da faixa de cima
  function cartaoVacina(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 960, marcadas: 3, titulo: '', seed: 560 }, o);
    const seed = o.seed, lista = Array.isArray(o.marcadas) ? o.marcadas : Array.from({ length: o.marcadas }, (_, i) => i);
    em(ctx, o, () => {
      E.ret(ctx, -170, -116, 340, 232, { papel: 'superficie', r: 12, seed });
      E.ret(ctx, -170, -116, 340, 50, so({ papel: 'apoioEscuro', r: 12, seed: seed + 1 }));
      escreve(ctx, o.titulo, 0, -82, { papel: 'titulo', size: 26, cor: 'papel', w: 300 });
      E.linha(ctx, [[0, -58], [0, 108]], { lw: 3, seed: seed + 2, tracejado: true });
      for (let i = 0; i < 12; i++) {
        const pg = i % 4 < 2 ? 0 : 1, c = i % 2, r = Math.floor(i / 4);
        const x = pg ? 18 + c * 76 : -154 + c * 76, y = -52 + r * 52;
        const m = lista.includes(i);
        E.ret(ctx, x, y, 66, 42, so({ papel: m ? 'destaque' : null, r: 5, lw: 2.5, seed: seed + 10 + i }));
        if (m) E.linha(ctx, [[x + 20, y + 22], [x + 29, y + 31], [x + 46, y + 11]], { lw: 4.5, seed: seed + 30 + i });
      }
    });
    return { centro: [o.x, o.y] };
  }

  // o mosquito de lado: x, y é o centro do corpo; rot o giro (o padrão é de tromba para baixo, picando); t: o tempo
  // (as asas batem); listras: as listras brancas do Aedes (dengue, zika, chikungunya); sem listras, o Anopheles (malária)
  function mosquito(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 960, rot: -0.55, t: 0, listras: false, seed: 300 }, o);
    const seed = o.seed, bate = Math.sin(o.t * 60) * 0.35, asa = naoSome('apoio', 'superficie'), corpo = naoSome('apoioEscuro', 'tinta');
    em(ctx, o, () => {
      for (const sd of [-1, 1]) E.poligono(ctx, [[-6, -4], [70, -46 + sd * 8 + bate * 30 * sd], [96, -30 + sd * 6], [10, 4]], so({ papel: asa, lw: 3, alpha: 0.6, seed: seed + 1 + sd }));
      for (let i = 0; i < 3; i++) for (const sd of [-1, 1]) {
        const p = [[-30 + i * 12, 8], [-40 + i * 22 + sd * 6, 46 + i * 6], [-50 + i * 30 + sd * 10, 80 + i * 4]];
        E.linha(ctx, p, { lw: 3, seed: seed + 10 + i * 2 + (sd > 0 ? 1 : 0) });
        if (o.listras) E.linha(ctx, [[lerp(p[1][0], p[2][0], 0.25), lerp(p[1][1], p[2][1], 0.25)], [lerp(p[1][0], p[2][0], 0.45), lerp(p[1][1], p[2][1], 0.45)]], { papel: 'branco', lw: 4, seed: seed + 30 + i });
      }
      E.circulo(ctx, 34, 0, 56, so({ ry: 12, papel: corpo, lw: 4, seed: seed + 3 }));
      if (o.listras) for (let i = 0; i < 3; i++) E.linha(ctx, [[18 + i * 20, -9], [18 + i * 20, 9]], { papel: 'branco', lw: 4, seed: seed + 40 + i });
      E.circulo(ctx, -26, -2, 20, so({ ry: 15, papel: corpo, lw: 4, seed: seed + 4 }));
      if (o.listras) E.linha(ctx, [[-34, -10], [-22, -12], [-16, -4]], { papel: 'branco', lw: 3.5, seed: seed + 44 });
      E.circulo(ctx, -52, 2, 11, so({ ry: 10, papel: corpo, lw: 4, seed: seed + 5 }));
      E.linha(ctx, [[-60, 6], [-104, 22]], { lw: 3.5, seed: seed + 6 });
    });
    return { tromba: tela(o, -104, 22) };
  }

  // a cobra deitada: x, y é o meio do corpo; comp o comprimento; amp o quanto ela ondula; t: o tempo (ela rasteja);
  // a cabeça fica à direita (espelho: à esquerda)
  function cobra(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 960, comp: 640, amp: 60, ondas: 2.3, t: 0, seed: 210 }, o);
    const n = 52, { comp, amp, ondas, seed } = o, fase = 0.4 + o.t * 3;
    const corpo = naoSome('apoioEscuro', 'chao', 'apoio');
    let cab = null;
    em(ctx, Object.assign({}, o), () => {
      const pts = [];
      for (let i = 0; i <= n; i++) { const u = i / n; pts.push([-comp / 2 + u * comp, Math.sin(u * Math.PI * ondas + fase) * amp * (0.5 + 0.5 * u)]); }
      const esp = (u) => (5 + 27 * Math.min(1, u / 0.45)) * (u > 0.9 ? 1 - (u - 0.9) * 3 : 1);
      const norm = (i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l, -dy / l, dx / l]; };
      const esq = [], dir = [];
      pts.forEach((p, i) => { const [, , nx, ny] = norm(i), w = esp(i / n); esq.push([p[0] + nx * w, p[1] + ny * w]); dir.push([p[0] - nx * w, p[1] - ny * w]); });
      E.poligono(ctx, esq.concat(dir.reverse()), { papel: corpo, seed });
      for (let i = 9; i < n - 5; i += 5) {
        const [tx, ty, nx, ny] = norm(i), w = esp(i / n) * 0.78, p = pts[i];
        E.poligono(ctx, [[p[0] + nx * w + tx * 6, p[1] + ny * w + ty * 6], [p[0] + tx * 16, p[1] + ty * 16], [p[0] - nx * w + tx * 6, p[1] - ny * w + ty * 6], [p[0] - tx * 10, p[1] - ty * 10]], so({ papel: 'tinta', contorno: false, seed: seed + 10 + i }));
      }
      const pa = pts[n - 1], pb = pts[n];
      ctx.save(); ctx.translate(pb[0], pb[1]); ctx.rotate(Math.atan2(pb[1] - pa[1], pb[0] - pa[0]));
      const lingua = Math.sin(o.t * 9) > 0 ? 1 : 0.55; // a língua entra e sai
      E.linha(ctx, [[46, 2], [46 + 30 * lingua, 2]], { papel: 'coral', lw: 4.5, seed: seed + 7 });
      E.linha(ctx, [[46 + 30 * lingua, 2], [62 + 30 * lingua, -9]], { papel: 'coral', lw: 4.5, seed: seed + 8 });
      E.linha(ctx, [[46 + 30 * lingua, 2], [62 + 30 * lingua, 13]], { papel: 'coral', lw: 4.5, seed: seed + 9 });
      E.circulo(ctx, 16, 0, 36, { ry: 25, papel: corpo, seed: seed + 5 });
      E.circulo(ctx, 26, -10, 6.5, so({ papel: 'tinta', contorno: false, seed: seed + 6 }));
      ctx.restore();
      cab = pb;
    });
    return { cabeca: tela(o, cab[0], cab[1]) };
  }

  // a lupa: x, y é o centro da lente; r o raio; cabo: o ângulo do cabo (o padrão: para baixo, à direita); dentro: uma
  // função (ctx) => {...} que desenha o que a lente aumenta, em pontos da tela (a lupa corta no círculo)
  function lupa(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 960, r: 110, cabo: 0.8, dentro: null, seed: 680 }, o);
    const { x, y, r, seed } = o;
    ctx.save(); ctx.translate(x + Math.cos(o.cabo) * r, y + Math.sin(o.cabo) * r); ctx.rotate(o.cabo);
    E.ret(ctx, 4, -15, r * 0.3, 30, so({ papel: 'tinta', r: 5, seed: seed + 1 }));
    E.ret(ctx, r * 0.28, -22, r * 1.15, 44, { papel: 'apoioEscuro', r: 20, seed });
    ctx.restore();
    E.circulo(ctx, x, y, r, so({ papel: 'superficie', contorno: false, seed: seed + 2 }));
    if (o.dentro) { ctx.save(); ctx.beginPath(); ctx.arc(x, y, r - 5, 0, Math.PI * 2); ctx.clip(); o.dentro(ctx); ctx.restore(); }
    const brilho = []; for (let i = 0; i <= 8; i++) { const a = Math.PI * 1.08 + i * 0.07; brilho.push([x + Math.cos(a) * r * 0.72, y + Math.sin(a) * r * 0.72]); }
    E.linha(ctx, brilho, { papel: o.dentro ? 'branco' : 'apoio', lw: 7, seed: seed + 3 });
    E.circulo(ctx, x, y, r, so({ papel: null, lw: 14, seed: seed + 4 }));
    return { centro: [x, y] };
  }

  // a folha do calendário (um mês): x, y é o centro; marcados: os dias marcados (quadrinhos de 0 a 34, da esquerda para
  // a direita e de cima para baixo); titulo: o texto da faixa (o mês, do textos.txt); k (0 a 1): o tamanho, para entrar
  function calendario(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 960, marcados: [], titulo: '', k: 1, seed: 580 }, o);
    if (o.k <= 0) return null;
    const q = Object.assign({}, o, { s: (o.s ?? 1) * o.k }), seed = o.seed;
    em(ctx, q, () => {
      E.ret(ctx, -160, -150, 320, 300, { papel: 'superficie', r: 14, seed });
      E.ret(ctx, -160, -150, 320, 66, so({ papel: 'alerta', r: 14, seed: seed + 1 }));
      for (const sx of [-1, 1]) E.ret(ctx, sx * 80 - 7, -166, 14, 34, so({ papel: 'tinta', r: 6, seed: seed + 2 + sx }));
      escreve(ctx, o.titulo, 0, -106, { papel: 'titulo', size: 32, cor: 'noite', w: 280 });
      for (let i = 0; i < 35; i++) {
        const c = i % 7, r = Math.floor(i / 7), x = -140 + c * 40, y = -70 + r * 42, m = o.marcados.includes(i);
        E.ret(ctx, x + 2, y, 34, 32, so({ papel: m ? 'destaque' : null, r: 4, lw: 2.5, seed: seed + 10 + i }));
        if (m) E.linha(ctx, [[x + 9, y + 16], [x + 16, y + 24], [x + 29, y + 7]], { lw: 4.5, seed: seed + 50 + i });
      }
    });
    return { centro: [o.x, o.y] };
  }

  // o carimbo de mão: x, y é onde a borracha toca o papel; batida (0 a 1): 0 levantado, 1 apertado no papel.
  // A marca que fica no papel é o E.carimbo do kit (o texto vem do textos.txt)
  function carimbo(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 960, batida: 1, seed: 700 }, o);
    const seed = o.seed, q = Object.assign({}, o, { y: o.y - (1 - clamp(o.batida)) * 140 });
    em(ctx, q, () => {
      E.ret(ctx, -88, -22, 176, 22, so({ papel: 'tinta', r: 4, seed }));
      E.ret(ctx, -100, -74, 200, 54, { papel: 'apoioEscuro', r: 8, seed: seed + 1 });
      E.ret(ctx, -22, -150, 44, 80, so({ papel: 'superficie', r: 10, seed: seed + 2 }));
      E.circulo(ctx, 0, -178, 46, { ry: 36, papel: 'coral', seed: seed + 3 });
    });
    return { ponto: [o.x, o.y] };
  }

  // a xícara de café no pires: x, y é o pé (em cima da mesa); s o tamanho
  function xicara(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 960, seed: 440 }, o);
    const seed = o.seed;
    em(ctx, o, () => {
      E.circulo(ctx, 0, 6, 38, so({ ry: 8, papel: 'superficie', lw: 4, seed: seed + 3 }));
      E.ret(ctx, -24, -30, 48, 36, so({ papel: 'superficie', r: 10, seed }));
      E.circulo(ctx, 0, -30, 24, so({ ry: 7, papel: 'noite', lw: 4, seed: seed + 1 }));
      E.circulo(ctx, 32, -14, 11, so({ papel: null, lw: 5, seed: seed + 2 }));
    });
    return { boca: tela(o, 0, -30) };
  }

  // o estojo (do aparelho, de remédio): x, y é o pé, no meio; s o tamanho
  function estojo(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 960, papel: 'apoioEscuro', seed: 450 }, o);
    const seed = o.seed;
    em(ctx, o, () => {
      E.ret(ctx, -22, -66, 44, 20, so({ papel: null, r: 8, lw: 5, seed: seed + 2 }));
      E.ret(ctx, -62, -50, 124, 50, so({ papel: o.papel, r: 12, seed }));
      E.linha(ctx, [[-48, -36], [48, -36]], { papel: 'apoio', lw: 4, seed: seed + 1 });
    });
    return { topo: tela(o, 0, -50) };
  }

  // o coração (saúde, o órgão, "gosto"): x, y é o centro; s o tamanho; k (0 a 1) para entrar crescendo; papel a cor
  function coracao(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 960, k: 1, papel: 'coral', seed: 480 }, o);
    if (o.k <= 0) return null;
    const pts = [];
    for (let i = 0; i < 32; i++) { const t = (i / 32) * Math.PI * 2; pts.push([28 * Math.sin(t) ** 3, -1.75 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) - 3]); }
    em(ctx, Object.assign({}, o, { s: (o.s ?? 1) * o.k }), () => E.poligono(ctx, pts, so({ papel: o.papel, lw: 4, seed: o.seed })));
    return { centro: [o.x, o.y] };
  }

  // o visto (feito, certo): o círculo verde com o risco branco; x, y é o centro; k para entrar crescendo
  function visto(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 960, k: 1, papel: 'apoioEscuro', seed: 500 }, o);
    if (o.k <= 0) return null;
    em(ctx, Object.assign({}, o, { s: (o.s ?? 1) * o.k }), () => {
      E.circulo(ctx, 0, 0, 28, so({ papel: o.papel, lw: 4, seed: o.seed }));
      E.linha(ctx, [[-12, 1], [-3, 11], [14, -10]], { papel: 'branco', lw: 6, seed: o.seed + 1 });
    });
    return { centro: [o.x, o.y] };
  }

  // a linha tracejada que vai se desenhando (a mesma altura, a ligação entre dois pontos): de e ate, pontos da tela;
  // k (0 a 1) o quanto já apareceu
  function tracejado(ctx, o = {}) {
    const { de, ate, k = 1, papel = 'coral', lw = 7, n = 7, seed = 490 } = o;
    for (let i = 0; i < n; i++) {
      const a = i / n, b = Math.min((i + 0.55) / n, k);
      if (a >= k) break;
      E.linha(ctx, [[lerp(de[0], ate[0], a), lerp(de[1], ate[1], a)], [lerp(de[0], ate[0], b), lerp(de[1], ate[1], b)]], { papel, lw, seed: seed + i });
    }
  }

  // o balão de fala com os três pontinhos: x, y é o centro; riscado: a conversa riscada ("sem falar"); k para entrar
  function balao(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 960, k: 1, riscado: false, papel: 'apoio', seed: 530 }, o);
    if (o.k <= 0) return null;
    const papel = naoSome(o.papel, 'superficie');
    em(ctx, Object.assign({}, o, { s: (o.s ?? 1) * o.k }), () => {
      E.poligono(ctx, [[30, 32], [58, 66], [62, 32]], so({ papel, lw: 4, seed: o.seed }));
      E.ret(ctx, -72, -42, 144, 82, so({ papel, r: 32, lw: 4, seed: o.seed + 1 }));
      for (const dx of [-32, 0, 32]) E.circulo(ctx, dx, 0, 9, so({ papel: 'tinta', lw: 2, seed: o.seed + 3 + dx }));
      if (o.riscado) for (const sd of [-1, 1]) E.linha(ctx, [[-56, -44 * sd], [56, 44 * sd]], { papel: 'coral', lw: 9, seed: o.seed + 10 + sd });
    });
    return { centro: [o.x, o.y] };
  }

  // o prato de comida: x, y é o meio do prato (em cima da mesa); s o tamanho
  function prato(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 960, seed: 455 }, o);
    em(ctx, o, () => {
      E.circulo(ctx, 0, 0, 46, so({ ry: 14, papel: 'superficie', lw: 4, seed: o.seed }));
      E.circulo(ctx, -8, -9, 20, so({ ry: 9, papel: 'destaque', lw: 3, seed: o.seed + 1 }));
      E.circulo(ctx, 16, -7, 10, so({ ry: 6, papel: 'apoioEscuro', lw: 3, seed: o.seed + 2 }));
    });
    return { centro: [o.x, o.y] };
  }

  // o cigarro aceso, deitado: x, y é o centro; fumaca: a fumaça subindo da brasa (t: o tempo, ela ondula)
  function cigarro(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 960, fumaca: true, t: 0, seed: 460 }, o);
    em(ctx, o, () => {
      if (o.fumaca) { const pts = []; for (let i = 0; i <= 10; i++) pts.push([36 + Math.sin(i * 0.9 + o.t * 3) * 10, -14 - i * 9]); E.linha(ctx, pts, { papel: naoSome('apoio', 'superficie'), lw: 5, seed: o.seed + 3 }); }
      E.ret(ctx, -42, -8, 84, 16, so({ papel: 'superficie', r: 6, lw: 4, seed: o.seed }));
      E.ret(ctx, -42, -8, 24, 16, so({ papel: 'destaque', r: 4, lw: 3, seed: o.seed + 2 }));
      E.ret(ctx, 22, -8, 20, 16, so({ papel: 'coral', r: 4, lw: 3, seed: o.seed + 1 }));
    });
    return { brasa: tela(o, 42, 0) };
  }

  // o tênis (exercício físico): x, y é o pé da sola; s o tamanho
  function tenis(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 960, seed: 465 }, o);
    em(ctx, o, () => {
      E.poligono(ctx, [[-52, 0], [-48, -36], [-12, -42], [18, -20], [52, -12], [56, 0]], so({ papel: 'coral', lw: 5, seed: o.seed }));
      E.ret(ctx, -56, -4, 114, 14, so({ papel: 'superficie', r: 6, lw: 4, seed: o.seed + 1 }));
      for (const dx of [-30, -18, -6]) E.linha(ctx, [[dx, -34], [dx + 8, -26]], { papel: 'branco', lw: 3, seed: o.seed + 40 + dx });
    });
    return { centro: tela(o, 0, -20) };
  }

  // a UBS em ícone (pequena: para mapa, percurso, cartão): x, y é o centro; k para entrar crescendo. A cruz é verde
  function ubsIcone(ctx, o = {}) {
    o = Object.assign({ x: 540, y: 960, k: 1, seed: 580 }, o);
    if (o.k <= 0) return null;
    em(ctx, Object.assign({}, o, { s: (o.s ?? 1) * o.k }), () => {
      E.poligono(ctx, [[-74, -40], [0, -100], [74, -40]], so({ papel: 'apoioEscuro', lw: 5, seed: o.seed }));
      E.ret(ctx, -62, -42, 124, 100, so({ papel: 'branco', r: 6, lw: 5, seed: o.seed + 1 }));
      E.ret(ctx, -9, -30, 18, 46, so({ papel: 'apoioEscuro', r: 3, contorno: false, seed: o.seed + 2 }));
      E.ret(ctx, -23, -16, 46, 18, so({ papel: 'apoioEscuro', r: 3, contorno: false, seed: o.seed + 3 }));
    });
    return { centro: [o.x, o.y] };
  }

  // a dor: o risco em zigue-zague que sai de x, y no ângulo a (radianos); tam o comprimento
  function dor(ctx, o = {}) {
    const { x = 540, y = 960, a = 0, tam = 54, papel = 'coral', seed = 610 } = o;
    const c = Math.cos(a), s = Math.sin(a), t = tam / 54;
    E.linha(ctx, [[x, y], [x + (c * 18 - s * 10) * t, y + (s * 18 + c * 10) * t], [x + (c * 36 + s * 10) * t, y + (s * 36 - c * 10) * t], [x + c * 54 * t, y + s * 54 * t]], { papel, lw: 7, seed });
  }

  // a árvore: x, y é o pé do tronco; h a altura; tipo 'copa' (redonda) ou 'buriti' (a palmeira do lavrado); copa: a cor
  function arvore(ctx, o = {}) {
    o = Object.assign({ x: 540, y: chao0(), h: 420, tipo: 'copa', seed: 760 }, o);
    const { x, y, h, seed } = o, copa = o.copa || naoSome('apoio', 'apoioEscuro');
    if (o.tipo === 'buriti') {
      const topo = [x + h * 0.04, y - h];
      E.linha(ctx, curva([x, y], [x - h * 0.05, y - h * 0.5], topo), { lw: Math.max(10, h * 0.035), seed });
      for (let i = 0; i < 9; i++) {
        const a = -Math.PI / 2 + (i - 4) * 0.36, L = h * (0.3 + 0.06 * Math.cos(i * 1.7)), mid = 0.55;
        const ponta = [topo[0] + Math.cos(a) * L, topo[1] + Math.sin(a) * L * 0.8 + L * 0.25];
        const p1 = [topo[0] + Math.cos(a - 0.12) * L * mid, topo[1] + Math.sin(a - 0.12) * L * mid * 0.8];
        const p2 = [topo[0] + Math.cos(a + 0.12) * L * mid, topo[1] + Math.sin(a + 0.12) * L * mid * 0.8];
        E.poligono(ctx, [topo, p1, ponta, p2], { papel: i % 2 ? copa : naoSome('apoioEscuro', 'apoio'), lw: 3.5, seed: seed + 1 + i, sombra: false, hachura: false });
      }
      return { topo };
    }
    E.ret(ctx, x - h * 0.045, y - h * 0.55, h * 0.09, h * 0.55, { papel: 'tinta', r: 6, seed, sombra: false });
    for (const [dx, dy, rr, sd] of [[-0.17, -0.62, 0.2, 1], [0.17, -0.6, 0.2, 2], [0, -0.76, 0.26, 3]]) E.circulo(ctx, x + dx * h, y + dy * h, rr * h, { papel: copa, seed: seed + sd, sombra: false });
    return { topo: [x, y - h] };
  }

  // a casa (de frente): x, y é o chão, no meio da casa; w, h o tamanho; parede e telhado: as cores; numero: o texto da
  // plaquinha; porta (0 a 1): a porta abrindo. Devolve a porta, a parede e o topo (para setas e falas)
  function casa(ctx, o = {}) {
    o = Object.assign({ x: 540, y: chao0(), w: 360, h: 420, parede: 'superficie', telhado: 'apoioEscuro', numero: '', porta: 0, seed: 30 }, o);
    const { w, h, seed } = o, x0 = o.x - w / 2, topo = o.y - h, tl = 120 * Math.min(1, w / 360);
    const vidro = E.cor(o.parede) === E.cor('apoio') ? 'superficie' : 'apoio';
    E.poligono(ctx, [[x0 - 34, topo + 6], [o.x, topo - tl], [x0 + w + 34, topo + 6]], { papel: o.telhado, seed: seed + 1, sombra: false });
    E.ret(ctx, x0, topo, w, h, { papel: o.parede, r: 6, seed, sombra: false });
    const jw = Math.min(110, w * 0.3), jx = x0 + 36, jy = topo + 90;
    E.ret(ctx, jx, jy, jw, jw, so({ papel: vidro, r: 6, seed: seed + 2 }));
    E.linha(ctx, [[jx + jw / 2, jy + 6], [jx + jw / 2, jy + jw - 6]], { lw: 4, seed: seed + 3 });
    E.linha(ctx, [[jx + 6, jy + jw / 2], [jx + jw - 6, jy + jw / 2]], { lw: 4, seed: seed + 4 });
    const pw = Math.min(104, w * 0.3), ph = Math.min(210, h * 0.55), px = x0 + w - 36 - pw, py = o.y - ph;
    E.ret(ctx, px, py, pw, ph, so({ papel: 'sombra', r: 4, seed: seed + 5 }));
    const fw = pw * (1 - 0.72 * clamp(o.porta));
    E.ret(ctx, px, py, fw, ph, so({ papel: vidro, r: 4, seed: seed + 6 }));
    E.circulo(ctx, px + fw - 16, py + ph * 0.55, 7, so({ papel: 'tinta', seed: seed + 7 }));
    if (o.numero) {
      const ws = E.medir(ctx, String(o.numero), { papel: 'mao', size: 40 }) + 30;
      E.ret(ctx, px + pw / 2 - ws / 2, py - 76, ws, 58, so({ papel: 'superficie', r: 8, seed: seed + 8 }));
      escreve(ctx, o.numero, px + pw / 2, py - 34, { papel: 'mao', size: 40 });
    }
    return { porta: [px + pw / 2, py + ph / 2], parede: [o.x, topo + h * 0.42], topo };
  }

  // ======================================================================================================
  // LUGARES. Cada um desenha o quadro inteiro: o fundo do estilo, o lugar e o chão. chao: o y do chão (padrão 1400 no
  // reel, 984 no carrossel). fundo: true (padrão) pinta o fundo do estilo; false não pinta (o molde já pintou o do
  // estilo); uma cor ('papel') pinta essa cor, e as cores do lugar são escolhidas para não sumir nela. Devolvem os pontos.
  // ======================================================================================================
  function comeco(ctx, o) {
    const f = o.fundo === undefined ? true : o.fundo;
    FUNDO = typeof f === 'string' ? f : null;
    if (f === true) E.fundo(ctx); else if (FUNDO) GR().bg(ctx, E.cor(FUNDO));
    return o.chao ?? chao0();
  }
  // a barra de baixo da parede (meia-parede pintada), com a linha em cima
  function meiaParede(ctx, gy, alto, seed) {
    // no chapado o fundo já é Sálvia: fica só a linha (pintada de creme, o balcão e a maca, que são creme, sumiriam nela)
    if (E.cor('apoio') !== corFundo()) E.ret(ctx, -20, gy - alto, WD() + 40, alto, { papel: 'apoio', r: 0, seed, sombra: false, contorno: false });
    E.linha(ctx, [[-20, gy - alto], [WD() + 20, gy - alto]], { lw: 5, seed: seed + 1 });
  }

  // a varanda da casa visitada: a viga, os pilares, a mureta e a rede no canto (rede: false tira; t: a rede balança)
  function varanda(ctx, o = {}) {
    const gy = comeco(ctx, o), W = WD(), seed = o.seed ?? 400, topo = gy - 500;
    if (o.viga !== false) E.ret(ctx, -20, topo - 40, W + 40, 44, { papel: 'apoioEscuro', r: 0, seed: seed + 5, sombra: false });
    E.ret(ctx, -20, gy - 210, W + 40, 210, { papel: naoSome('apoio', 'superficie'), r: 0, seed: seed + 1, sombra: false });
    for (const [x, sd] of [[26, 2], [W - 26, 3]]) E.ret(ctx, x - 30, topo, 60, gy - topo, { papel: 'apoioEscuro', r: 6, seed: seed + sd });
    if (o.rede !== false) rede(ctx, { x: W * 0.825, y: topo + 42, t: o.t ?? null, seed: seed + 10 });
    E.chao(ctx, gy, { seed: seed + 20 });
    return { chao: gy, mureta: gy - 210 };
  }

  // a rua com casas: três casas de cores diferentes; numeros: os textos das plaquinhas ['12', '14', '16'];
  // portas: o quanto cada porta está aberta [0, 0.8, 0]; sol: true põe o sol (t: o tempo)
  function rua(ctx, o = {}) {
    const gy = comeco(ctx, o), W = WD(), seed = o.seed ?? 800, numeros = o.numeros || [], portas = o.portas || [];
    if (o.sol) E.objeto(ctx, 'sol', { x: W * 0.78, y: gy - 980, r: 48, t: o.t || 0 });
    if (o.arvore !== false) arvore(ctx, { x: 360, y: gy, h: 600, seed: seed + 60 });
    const lista = [
      { x: 168, w: 290, h: 380, parede: 'superficie', telhado: 'apoioEscuro' },
      { x: 545, w: 320, h: 450, parede: 'destaque', telhado: 'coral' },
      { x: 912, w: 290, h: 370, parede: naoSome('apoio', 'superficie'), telhado: 'apoioEscuro' },
    ];
    const casas = lista.map((c, i) => casa(ctx, Object.assign({ y: gy, numero: numeros[i] || '', porta: portas[i] || 0, seed: seed + i * 20 }, c)));
    E.chao(ctx, gy, { seed: seed + 90 });
    E.linha(ctx, [[-20, gy + 110], [W + 20, gy + 110]], { lw: 6, seed: seed + 91 });
    return { chao: gy, casas };
  }

  // a sala de casa: a meia-parede, a janela com cortina e o quadro na parede (janela: false, quadro: false tiram)
  function sala(ctx, o = {}) {
    const gy = comeco(ctx, o), W = WD(), seed = o.seed ?? 820;
    meiaParede(ctx, gy, 380, seed);
    let jan = null;
    if (o.janela !== false) {
      const jx = W * 0.6, jy = gy - 930, jw = 290, jh = 310;
      E.ret(ctx, jx, jy, jw, jh, { papel: naoSome('apoio', 'superficie'), r: 6, seed: seed + 2 });
      E.linha(ctx, [[jx + jw / 2, jy + 8], [jx + jw / 2, jy + jh - 8]], { lw: 5, seed: seed + 3 });
      E.linha(ctx, [[jx + 8, jy + jh / 2], [jx + jw - 8, jy + jh / 2]], { lw: 5, seed: seed + 4 });
      E.ret(ctx, jx - 18, jy + jh, jw + 36, 22, { papel: 'apoioEscuro', r: 4, seed: seed + 5 });
      for (const sd of [-1, 1]) {
        const bx = sd < 0 ? jx - 30 : jx + jw + 30, dx = sd * -70;
        E.poligono(ctx, [[bx, jy - 30], [bx + dx, jy - 30], [bx + dx * 0.55, jy + jh * 0.5], [bx + dx * 0.9, jy + jh + 30], [bx, jy + jh + 30]], { papel: 'coral', seed: seed + 6 + sd, sombra: false });
      }
      E.linha(ctx, [[jx - 70, jy - 30], [jx + jw + 70, jy - 30]], { lw: 8, seed: seed + 9 });
      jan = [jx + jw / 2, jy + jh / 2];
    }
    if (o.quadro !== false) {
      const qx = W * 0.14, qy = gy - 860, qw = 210, qh = 160;
      E.ret(ctx, qx, qy, qw, qh, { papel: 'apoioEscuro', r: 4, seed: seed + 10 });
      E.ret(ctx, qx + 16, qy + 16, qw - 32, qh - 32, so({ papel: 'destaque', r: 2, seed: seed + 11 }));
      E.poligono(ctx, [[qx + 16, qy + qh - 16], [qx + 80, qy + 70], [qx + 130, qy + 110], [qx + 160, qy + 90], [qx + qw - 16, qy + qh - 16]], so({ papel: 'apoioEscuro', seed: seed + 12 }));
      E.circulo(ctx, qx + 150, qy + 50, 16, so({ papel: 'coral', seed: seed + 13 }));
    }
    E.chao(ctx, gy, { seed: seed + 20 });
    return { chao: gy, janela: jan };
  }

  // a UBS por fora: a fachada, a faixa com a cruz verde e a placa (placa: o texto, do textos.txt), a porta de vidro e
  // as janelas; arvore: false tira o buriti. A cruz é verde, de saúde: nunca a cruz vermelha (emblema protegido por lei)
  function ubsFora(ctx, o = {}) {
    const gy = comeco(ctx, o), W = WD(), seed = o.seed ?? 840, x0 = 70, x1 = W - 140, h = 560, topo = gy - h;
    if (o.arvore !== false) arvore(ctx, { x: x1 + 70, y: gy, h: 760, tipo: 'buriti', seed: seed + 50 });
    E.ret(ctx, x0, topo, x1 - x0, h, { papel: 'superficie', r: 6, seed });
    E.ret(ctx, x0 - 20, topo - 120, x1 - x0 + 40, 126, { papel: 'apoioEscuro', r: 6, seed: seed + 1 });
    const cx = x0 + 70, cy = topo - 57;
    E.circulo(ctx, cx, cy, 42, so({ papel: 'branco', seed: seed + 2 }));
    E.ret(ctx, cx - 10, cy - 29, 20, 58, so({ papel: 'apoioEscuro', r: 3, contorno: false, seed: seed + 3 }));
    E.ret(ctx, cx - 29, cy - 10, 58, 20, so({ papel: 'apoioEscuro', r: 3, contorno: false, seed: seed + 4 }));
    escreve(ctx, o.placa, (cx + 60 + x1) / 2, topo - 36, { papel: 'titulo', size: 60, cor: 'papel', w: x1 - cx - 100 });
    const pc = (x0 + x1) / 2, pw = 240, ph = 300;
    E.ret(ctx, pc - pw / 2 - 30, gy - ph - 54, pw + 60, 32, { papel: 'apoioEscuro', r: 4, seed: seed + 5 });
    E.ret(ctx, pc - pw / 2, gy - ph, pw, ph, { papel: 'apoio', r: 4, seed: seed + 6 });
    E.linha(ctx, [[pc, gy - ph + 6], [pc, gy - 4]], { lw: 5, seed: seed + 7 });
    for (const sd of [-1, 1]) E.linha(ctx, [[pc + sd * 16, gy - ph * 0.55], [pc + sd * 16, gy - ph * 0.4]], { lw: 6, seed: seed + 8 + sd });
    for (const [jx, sd] of [[x0 + 50, 10], [x0 + 200, 11], [x1 - 170, 12], [x1 - 320, 13]]) {
      E.ret(ctx, jx, topo + 110, 120, 150, { papel: 'apoio', r: 4, seed: seed + sd });
      E.linha(ctx, [[jx + 60, topo + 116], [jx + 60, topo + 254]], { lw: 4, seed: seed + sd + 10 });
    }
    E.chao(ctx, gy, { seed: seed + 20 });
    return { chao: gy, porta: [pc, gy - ph / 2], placa: [(cx + 60 + x1) / 2, topo - 57] };
  }

  // a UBS por dentro (a recepção): a porta do consultório com a plaquinha (porta: o texto), o cartaz na parede e o
  // balcão com a placa pendurada (placa: o texto)
  function ubsDentro(ctx, o = {}) {
    const gy = comeco(ctx, o), W = WD(), seed = o.seed ?? 860;
    meiaParede(ctx, gy, 360, seed);
    const dx = 80, dw = 220, dh = 560;
    E.ret(ctx, dx, gy - dh, dw, dh, { papel: 'apoioEscuro', r: 4, seed: seed + 2 });
    E.circulo(ctx, dx + dw - 30, gy - dh / 2, 11, so({ papel: 'destaque', seed: seed + 3 }));
    if (o.porta) {
      E.ret(ctx, dx + 30, gy - dh - 84, dw - 60, 60, so({ papel: 'superficie', r: 8, seed: seed + 4 }));
      escreve(ctx, o.porta, dx + dw / 2, gy - dh - 40, { papel: 'corpo', size: 34, cor: 'noite', w: dw - 80 });
    }
    const cx = 370, cy = gy - 840;
    E.ret(ctx, cx, cy, 170, 230, { papel: 'superficie', r: 6, seed: seed + 5 });
    E.ret(ctx, cx + 16, cy + 16, 138, 50, so({ papel: 'destaque', r: 4, seed: seed + 6 }));
    for (let i = 0; i < 4; i++) E.linha(ctx, [[cx + 22, cy + 96 + i * 30], [cx + (i === 3 ? 100 : 148), cy + 96 + i * 30]], { lw: 5, seed: seed + 7 + i });
    const bx = 560, bw = W - bx + 20;
    E.ret(ctx, bx, gy - 300, bw, 300, { papel: 'superficie', r: 6, seed: seed + 12 });
    E.ret(ctx, bx + 40, gy - 250, 150, 200, so({ papel: 'apoio', r: 6, seed: seed + 13 }));
    E.ret(ctx, bx - 20, gy - 334, bw + 20, 36, { papel: 'apoioEscuro', r: 6, seed: seed + 14 });
    if (o.placa) {
      const px = bx + 40, pw = 320, py = gy - 640;
      for (const sx of [px + 40, px + pw - 40]) E.linha(ctx, [[sx, gy - 1000], [sx, py]], { lw: 4, seed: seed + 15 });
      E.ret(ctx, px, py, pw, 84, { papel: 'apoioEscuro', r: 8, seed: seed + 16 });
      escreve(ctx, o.placa, px + pw / 2, py + 56, { papel: 'titulo', size: 44, cor: 'papel', w: pw - 40 });
    }
    E.chao(ctx, gy, { seed: seed + 20 });
    return { chao: gy, balcao: [bx + 190, gy - 334], porta: [dx + dw / 2, gy - dh / 2] };
  }

  // o consultório: o armário de parede, a maca (com travesseiro, papel e degrau) e a mesa com o computador
  function consultorio(ctx, o = {}) {
    const gy = comeco(ctx, o), W = WD(), seed = o.seed ?? 880;
    meiaParede(ctx, gy, 360, seed);
    const ax = 90, ay = gy - 930;
    E.ret(ctx, ax, ay, 380, 170, { papel: 'superficie', r: 6, seed: seed + 2 });
    E.linha(ctx, [[ax + 190, ay + 8], [ax + 190, ay + 162]], { lw: 5, seed: seed + 3 });
    for (const sx of [-1, 1]) E.circulo(ctx, ax + 190 + sx * 24, ay + 90, 8, so({ papel: 'tinta', seed: seed + 4 + sx }));
    const mx0 = 70, mw = 470, my = gy - 290;
    for (const lx of [mx0 + 50, mx0 + mw - 50]) E.linha(ctx, [[lx, my + 50], [lx, gy]], { lw: 11, seed: seed + 6 + lx });
    E.ret(ctx, mx0, my + 28, mw, 34, { papel: 'apoioEscuro', r: 6, seed: seed + 7 });
    E.ret(ctx, mx0 + 8, my - 12, mw - 16, 44, { papel: 'superficie', r: 16, seed: seed + 8 });
    E.ret(ctx, mx0 + 8, my + 14, mw - 16, 14, so({ papel: 'apoio', r: 4, contorno: false, seed: seed + 16 }));
    E.ret(ctx, mx0 + 150, my - 18, mw - 170, 14, so({ papel: 'superficie', r: 4, seed: seed + 9 }));
    E.ret(ctx, mx0 + 20, my - 46, 120, 40, so({ papel: 'superficie', r: 18, seed: seed + 10 }));
    E.ret(ctx, mx0 + mw + 14, gy - 90, 110, 90, { papel: 'apoioEscuro', r: 6, seed: seed + 11 });
    const t = mesa(ctx, { x: 820, y: gy, w: 300, h: 270, seed: seed + 30 });
    E.ret(ctx, 710, t.topo - 200, 200, 140, { papel: 'noite', r: 10, seed: seed + 12 });
    E.ret(ctx, 724, t.topo - 186, 172, 106, so({ papel: 'apoio', r: 6, contorno: false, seed: seed + 13 }));
    E.ret(ctx, 800, t.topo - 62, 20, 54, so({ papel: 'tinta', r: 4, seed: seed + 14 }));
    E.ret(ctx, 760, t.topo - 14, 100, 14, so({ papel: 'tinta', r: 4, seed: seed + 15 }));
    E.chao(ctx, gy, { seed: seed + 20 });
    return { chao: gy, maca: [mx0 + mw / 2, my - 12], mesa: t.topo };
  }

  // a sala de espera: o painel de senha (senha: o texto), o relógio (hora; relogio: false tira), a fila de cadeiras
  // presas na mesma barra (cadeiras: quantas; cor) e o vaso. Devolve assentos: o x, y de quem senta em cada uma
  function salaEspera(ctx, o = {}) {
    const gy = comeco(ctx, o), W = WD(), seed = o.seed ?? 900, n = o.cadeiras ?? 4, cor = o.cor || 'coral';
    meiaParede(ctx, gy, 360, seed);
    const px = 540, py = gy - 900, pw = 320, ph = 160;
    E.ret(ctx, px, py, pw, ph, { papel: 'noite', r: 12, seed: seed + 2 });
    escreve(ctx, o.senha, px + pw / 2, py + ph / 2 + 32, { papel: 'numero', size: 90, cor: 'marca', w: pw - 40 });
    if (o.relogio !== false) relogio(ctx, { x: 250, y: gy - 820, r: 78, hora: o.hora ?? 9.25, seed: seed + 10 });
    const x0 = 160, passo = 190, assentos = [];
    E.ret(ctx, x0 - 90, gy - 128, (n - 1) * passo + 180, 16, so({ papel: 'tinta', r: 4, seed: seed + 3 }));
    for (const lx of [x0 - 60, x0 + (n - 1) * passo + 60]) E.linha(ctx, [[lx, gy - 120], [lx, gy]], { lw: 10, seed: seed + 4 + lx });
    for (let i = 0; i < n; i++) {
      const cx = x0 + i * passo;
      E.ret(ctx, cx - 76, gy - 400, 152, 226, { papel: cor, r: 36, seed: seed + 20 + i });
      E.ret(ctx, cx - 84, gy - 170, 168, 30, { papel: cor, r: 12, seed: seed + 40 + i });
      assentos.push([cx, gy - 150]);
    }
    if (o.vaso !== false) E.objeto(ctx, 'vaso', { x: x0 + n * passo + 20, y: gy, s: 0.9 });
    E.chao(ctx, gy, { seed: seed + 60 });
    return { chao: gy, assentos };
  }

  // a floresta e o rio: a mata do outro lado, o rio (rio: false tira) e a margem de cá, com uma árvore grande e um
  // buriti; t: o tempo (a água corre)
  function floresta(ctx, o = {}) {
    const gy = comeco(ctx, o), W = WD(), seed = o.seed ?? 920, rio = o.rio !== false, t = o.t || 0;
    const margem = rio ? gy - 280 : gy;
    const mata = [[-20, margem]];
    for (let x = -20; x <= W + 20; x += 12) mata.push([x, margem - 190 - 60 * Math.abs(Math.sin((x + 30) / 70)) - 26 * Math.abs(Math.sin((x + 10) / 33))]);
    mata.push([W + 20, margem]);
    E.poligono(ctx, mata, { papel: 'apoioEscuro', seed, sombra: false });
    let agua = null;
    if (rio) {
      agua = naoSome('apoio', 'superficie');
      const onda = agua === 'superficie' ? 'apoioEscuro' : 'superficie';
      E.ret(ctx, -20, margem, W + 40, gy - margem + 4, { papel: agua, r: 0, seed: seed + 1, sombra: false });
      for (let i = 0; i < 9; i++) {
        const y = margem + 40 + (i % 3) * 70, x = ((i * 233 + t * 40) % (W + 200)) - 100;
        E.linha(ctx, [[x, y], [x + 30, y - 8], [x + 60, y], [x + 90, y - 8]], { papel: onda, lw: 5, seed: seed + 10 + i });
      }
    }
    E.chao(ctx, gy, { seed: seed + 20 });
    arvore(ctx, { x: 70, y: gy, h: 760, seed: seed + 30 });
    arvore(ctx, { x: W - 110, y: gy, h: 620, tipo: 'buriti', seed: seed + 40 });
    return { chao: gy, margem, agua: rio ? [margem, gy] : null };
  }

  // o mapa de Roraima, com os 15 municípios (contorno do IBGE): x, y, w, h é a caixa onde ele cabe (a forma não
  // deforma); destaques: { 'Boa Vista': 'destaque', 'Alto Alegre': 'alerta' } (o nome e a cor); base: a cor dos outros;
  // k (0 a 1): os destacados acendem; ponto: o nome de um município que ganha o ponto (a capital, por exemplo).
  // Devolve proj(lon, lat) e centro(nome): os pontos da tela, para pôr rótulo, seta ou número em cima
  const RR = {}; let RR_CAIXA = null; const RR_NOMES = [];
  function rrCarrega() {
    if (RR_CAIXA) return;
    let x0 = 180, x1 = -180, y0 = 90, y1 = -90;
    for (const parte of RR_TXT.split(';')) {
      const i = parte.indexOf(':'), nome = parte.slice(0, i);
      RR[nome] = parte.slice(i + 1).split('|').map((a) => {
        const n = a.split(' ').map(Number), pts = [];
        let lo = n[0], la = n[1];
        for (let k = 0; k < n.length; k += 2) {
          if (k) { lo += n[k]; la += n[k + 1]; }
          const p = [lo / 1000, la / 1000]; pts.push(p);
          x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]);
        }
        return pts;
      });
      RR_NOMES.push(nome);
    }
    RR_CAIXA = [x0, y0, x1, y1];
  }
  function projetor(box) {
    const [x0, y0, x1, y1] = RR_CAIXA;
    const kx = Math.cos((((y0 + y1) / 2) * Math.PI) / 180), gw = (x1 - x0) * kx, gh = y1 - y0;
    const s = Math.min(box.w / gw, box.h / gh), ox = box.x + (box.w - gw * s) / 2, oy = box.y + (box.h - gh * s) / 2;
    return (lon, lat) => [ox + (lon - x0) * kx * s, oy + (y1 - lat) * s];
  }
  function mapaRR(ctx, o = {}) {
    o = Object.assign({ x: 90, y: 330, w: 820, h: 1000, destaques: {}, base: 'apoioEscuro', k: 1, ponto: '', lw: 3.5, seed: 50 }, o);
    rrCarrega();
    const proj = projetor(o), k = clamp(o.k);
    const centro = (nome) => { let sx = 0, sy = 0, n = 0; for (const r of RR[nome] || []) for (const [lo, la] of r) { const [x, y] = proj(lo, la); sx += x; sy += y; n++; } return n ? [sx / n, sy / n] : null; };
    const aneis = (nome) => RR[nome].map((r) => r.map(([lo, la]) => proj(lo, la)));
    for (const nome of RR_NOMES) {
      const d = o.destaques[nome];
      for (const r of aneis(nome)) {
        E.poligono(ctx, r, { papel: o.base, lw: o.lw, seed: o.seed + nome.length, sombra: false, amp: 0.8 });
        if (d && k > 0) E.poligono(ctx, r, { papel: d, lw: o.lw + 1, alpha: k, seed: o.seed + nome.length, sombra: false, amp: 0.8 });
        if (E.info.chapado) E.linha(ctx, r.concat([r[0]]), { papel: 'superficie', lw: 3, seed: o.seed + 1 });
      }
    }
    if (o.ponto && RR[o.ponto]) {
      const [bx, by] = centro(o.ponto);
      E.circulo(ctx, bx, by, 13, so({ papel: o.destaques[o.ponto] === 'destaque' ? 'superficie' : 'destaque', lw: 3.5, seed: o.seed + 2 }));
    }
    return { proj, centro, nomes: RR_NOMES.slice() };
  }

  // ======================================================================================================
  // GENTE: as pessoas do motor (Ch.person, pelo E.personagem do kit), com a aparência por parâmetro.
  // quem: 'agente', 'calouro', 'moradora' (as do kit), 'idosa', 'idoso', 'medica', 'medico', 'enfermeira', 'crianca'.
  // pele: 'clara' | 'media' | 'escura'; cabelo: 'preto' | 'grisalho'; penteado: 'curto' | 'raspado' | 'topete' |
  // 'cacheado' | 'crespo' | 'comprido' | 'coque' | 'rabo' | 'careca'; roupa: 'camisa' | 'camiseta' | 'vestido' |
  // 'moletom' | 'jaleco'; corRoupa (cor da paleta); calca: 'calca' | 'bermuda' | 'saia'; corCalca; barba: 'bigode' |
  // 'barba' | 'cavanhaque'; oculos: true | 'quadrado'; corpo: 'magro' | 'medio' | 'forte' | 'gordo';
  // idade: 'crianca' (menor) | 'idosa' (cabelo grisalho). O resto (x, y, s, pose, gesture, eyes, mouth, look, handR,
  // walk...) vai direto para o Ch.person.
  // ======================================================================================================
  const PELE = { clara: GENTE.peleClara, media: GENTE.pele, 'média': GENTE.pele, escura: GENTE.peleEscura };
  const CABELO = { preto: GENTE.cabelo, grisalho: EXTRA.grisalho, branco: EXTRA.grisalho };
  const PENTEADO = { curto: 'short', raspado: 'buzz', topete: 'quiff', cacheado: 'curly', crespo: 'curlytop', comprido: 'long', longo: 'long', coque: 'bun', rabo: 'ponytail', careca: 'bald' };
  const ROUPA = { camisa: 'shirt', camiseta: 'tee', vestido: 'dress', moletom: 'hoodie', jaleco: 'suit' };
  const CALCA = { calca: 'pants', 'calça': 'pants', bermuda: 'shorts', saia: 'skirt' };
  const BARBA = { bigode: 'mustache', barba: 'beard', cavanhaque: 'trimmed' };
  const CORPO = { magro: 'slim', medio: 'regular', 'médio': 'regular', forte: 'broad', gordo: 'heavy' };
  const DO_KIT = ['agente', 'calouro', 'moradora'];
  const QUEM = {
    idosa: { skin: GENTE.pele, hair: EXTRA.grisalho, hairStyle: 'bun', outfit: 'dress', shirt: PAL.marca, trim: PAL.coral, collar: PAL.marca, bottoms: 'skirt', shorts: PAL.marca, build: 'regular', shoes: PAL.noite },
    idoso: { skin: GENTE.pele, hair: EXTRA.grisalho, hairStyle: 'short', facialHair: 'mustache', outfit: 'shirt', shirt: PAL.coral, trim: PAL.noite, collar: PAL.coral, bottoms: 'pants', shorts: PAL.floresta, build: 'regular', shoes: PAL.noite },
    medica: { skin: GENTE.peleClara, hair: GENTE.cabelo, hairStyle: 'long', outfit: 'suit', robe: GENTE.branco, trim: PAL.salvia, bottoms: 'pants', shorts: PAL.floresta, build: 'slim', shoes: PAL.noite },
    medico: { skin: GENTE.peleEscura, hair: GENTE.cabelo, hairStyle: 'short', outfit: 'suit', robe: GENTE.branco, trim: PAL.folha, bottoms: 'pants', shorts: PAL.floresta, build: 'regular', shoes: PAL.noite },
    enfermeira: { skin: GENTE.peleEscura, hair: GENTE.cabelo, hairStyle: 'bun', outfit: 'shirt', shirt: PAL.salvia, trim: PAL.folha, collar: PAL.salvia, bottoms: 'pants', shorts: PAL.salvia, build: 'regular', shoes: PAL.noite },
    crianca: { skin: GENTE.pele, hair: GENTE.cabelo, hairStyle: 'curlytop', outfit: 'tee', shirt: PAL.marca, trim: PAL.folha, bottoms: 'shorts', shorts: PAL.folha, build: 'slim', shoes: PAL.noite },
  };
  // cópia das três pessoas do kit (estilos.js, ROUPA), só para a regra de não sumir abaixo
  const KIT = {
    agente: { shirt: PAL.folha, collar: PAL.folha, shorts: PAL.floresta, headwearColor: PAL.folha },
    calouro: { shirt: PAL.salvia, shorts: PAL.floresta },
    moradora: { shirt: PAL.marca, shorts: PAL.folha },
  };
  // no chapado não há contorno: roupa da cor do fundo (Sálvia) some. Ela vira branca (a calça, Folha)
  function naoSomeRoupa(st, quem) {
    if (!E.info.chapado) return;
    const fundo = String(corFundo()).toUpperCase(), junto = Object.assign({}, KIT[quem] || {}, st);
    for (const k of ['shirt', 'collar', 'robe', 'shorts', 'headwearColor']) if (junto[k] && String(junto[k]).toUpperCase() === fundo) st[k] = k === 'shorts' ? PAL.folha : GENTE.branco;
  }
  const MEUS = ['quem', 'pele', 'cabelo', 'penteado', 'roupa', 'corRoupa', 'calca', 'corCalca', 'barba', 'oculos', 'corpo', 'idade'];
  function pessoa(ctx, o = {}) {
    const quem = o.quem || 'calouro', doKit = DO_KIT.includes(quem);
    if (!doKit && !QUEM[quem]) console.warn(`[biblioteca] pessoa: "${quem}" não existe; use ${DO_KIT.concat(Object.keys(QUEM)).join(', ')}`);
    const st = doKit ? {} : Object.assign({}, QUEM[quem] || QUEM.idosa);
    if (o.pele) st.skin = PELE[o.pele] || o.pele;
    if (o.cabelo) st.hair = CABELO[o.cabelo] || o.cabelo;
    if (o.penteado) st.hairStyle = PENTEADO[o.penteado] || o.penteado;
    if (o.roupa) { st.outfit = ROUPA[o.roupa] || o.roupa; if (o.roupa === 'jaleco') st.robe = GENTE.branco; }
    if (o.corRoupa) { const c = E.cor(o.corRoupa); st.shirt = c; st.collar = c; if (st.outfit === 'suit' && o.roupa !== 'jaleco') st.robe = c; }
    if (o.calca) st.bottoms = CALCA[o.calca] || o.calca;
    if (o.corCalca) st.shorts = E.cor(o.corCalca);
    if (o.barba) st.facialHair = BARBA[o.barba] || o.barba;
    if (o.oculos) st.glasses = o.oculos === true ? 'round' : ({ redondo: 'round', quadrado: 'square', escuro: 'sun' }[o.oculos] || o.oculos);
    if (o.corpo) st.build = CORPO[o.corpo] || o.corpo;
    const idade = String(o.idade || '');
    if (/^idos/.test(idade) && !o.cabelo) st.hair = EXTRA.grisalho;
    let s = o.s ?? 1;
    if (quem === 'crianca' || /^crian/.test(idade)) { s *= 0.66; if (!o.corpo) st.build = 'slim'; }
    Object.assign(st, o.style || {});
    naoSomeRoupa(st, quem);
    const sai = Object.assign({}, o, { s, style: st });
    for (const k of MEUS) delete sai[k];
    sai.quem = doKit ? quem : 'nenhum'; // o kit junta a roupa do quem com o style; 'nenhum' = só o style daqui
    return E.personagem(ctx, sai);
  }

  // ---------- a lista ----------
  const BIB = {
    // objetos
    mesa, cadeira, rede, relogio, celular, aparelhoPressao, manguito, tubo, glicosimetro, termometro, seringa,
    frascoVacina, caixaTermica, prancheta, cartaoVacina, mosquito, cobra, lupa, calendario, carimbo,
    xicara, estojo, gota, floco, arvore, casa, coracao, visto, tracejado, balao, prato, cigarro, tenis, ubsIcone, dor,
    // lugares
    varanda, rua, sala, ubsFora, ubsDentro, consultorio, salaEspera, floresta, mapaRR,
    // gente
    pessoa,
    // apoio
    naoSome, EXTRA,
  };
  BIB.LUGARES = ['varanda', 'rua', 'sala', 'ubsFora', 'ubsDentro', 'consultorio', 'salaEspera', 'floresta', 'mapaRR'];
  BIB.OBJETOS = ['mesa', 'cadeira', 'rede', 'relogio', 'celular', 'aparelhoPressao', 'manguito', 'tubo', 'glicosimetro', 'termometro', 'seringa', 'frascoVacina', 'caixaTermica', 'prancheta', 'cartaoVacina', 'mosquito', 'cobra', 'lupa', 'calendario', 'carimbo', 'xicara', 'estojo', 'gota', 'floco', 'arvore', 'casa', 'coracao', 'visto', 'tracejado', 'balao', 'prato', 'cigarro', 'tenis', 'ubsIcone', 'dor'];
  BIB.GENTE = DO_KIT.concat(Object.keys(QUEM));
  // por nome: BIB.desenha(ctx, 'cadeira', { x, y })
  BIB.desenha = (ctx, nome, o) => { if (!BIB[nome] || typeof BIB[nome] !== 'function') throw new Error(`[biblioteca] não tenho "${nome}"`); return BIB[nome](ctx, o); };
  globalThis.BIB = BIB;

  // ---------- os dados do mapa de Roraima (IBGE, malha municipal, via tbrugz/geodata-br; simplificada) ----------
  // milésimos de grau; em cada anel, o 1º ponto inteiro e os outros como diferença do anterior. Não precisa ler.
  var RR_TXT = 'Amajari:-64592 4114 32 -12 129 33 96 -6 46 15 71 -28 54 11 52 -35 15 -66 47 -76 49 -17 4 -29 19 -3 14 -33 36 57 78 25 54 -17 41 7 17 -24 56 -8 19 14 -37 28 11 66 13 3 84 -90 1 -43 37 5 3 -26 54 -25 -5 28 13 6 55 -9 -4 19 27 28 -6 23 -35 21 24 21 35 4 55 -24 26 4 2 21 30 -26 76 -4 -29 -70 7 -46 22 -24 101 -18 44 -46 -4 -43 -18 -11 49 -28 42 -54 30 -4 41 65 33 11 51 55 31 -9 61 -56 12 34 -12 79 14 18 -42 29 18 16 -35 44 2 36 43 45 -25 32 15 25 144 12 28 -25 26 0 -7 18 29 9 -8 33 -17 1 14 18 -8 11 29 9 -8 19 23 -10 10 16 33 -4 3 39 73 0 36 -12 24 -31 37 7 95 -29 51 -39 32 14 -3 30 46 8 -5 28 47 -4 47 31 7 -30 45 -47 8 52 49 -4 4 21 45 -9 22 65 38 3 -10 18 50 20 -1 -25 55 18 28 -25 34 23 18 -17 30 8 52 70 160 4 46 -29 2 -23 43 -38 12 -35 -14 -36 20 -34 -12 -33 22 -27 79 -46 92 -22 41 41 61 -22 27 -35 -3 -52 18 -12 40 -91 -15 -93 22 -93 63 -32 -8 -19 14 -14 31 -15 30 7 27 -20 13 11 65 -34 23 -28 -13 -32 28 -68 -149 97 -144 -20 -22 -15 -37 16 -73 -41 -109 -5 -36 19 -54 -3 -103 -94 -58 10 -81 -19 -77 -45 -57 7 -32 49 -55 -36 -30 14 -39 -17 -48 11 -24 -7 -27 -59 -44 28 -39 -3 -25 -38 -103 13 -70 -29 -117 -96 -103 17 -82 -31 -42 78 -162 46 -58 -29 -43 19 -56 -1 -207 107 -55 75 -93 58 -28 62 27 63 -52 80 -74 3 0 -75 -47 -36 -25 14 -3 35 -44 -8 -116 71 -41 -3 -22 20 4 25 -63 13 -79 -42 -28 -128 -47 -27 -2 -16 -16 12 -41 -85 -42 -37 -47 27 -66 -12 -72 47 -69 -7 -43 16 -1 70 -90 102 -14 38 -139 80 -57 8 -83 94 -12 47 -93 76 -59 115 -78 55 -11 84 41 28 81 -37 41 -38 27 -68 39 -30;Alto Alegre:-63632 3742 63 -13 -4 -25 22 -20 41 3 116 -71 44 8 3 -35 25 -14 47 36 0 75 74 -3 52 -80 -27 -63 28 -62 93 -58 55 -75 207 -107 56 1 43 -19 58 29 162 -46 42 -78 82 31 103 -17 117 96 70 29 103 -13 25 38 39 3 44 -28 27 59 24 7 48 -11 39 17 30 -14 55 36 32 -49 57 -7 77 45 81 19 63 -9 98 93 54 3 36 -19 128 14 0 -766 -30 16 -15 -23 -50 33 -7 -13 -24 3 -8 22 -5 -20 -44 -22 -31 4 -8 -25 -20 -5 -24 19 -24 -12 -6 47 -83 110 8 24 -66 30 -13 26 -46 -9 -34 13 -48 48 -49 -15 -77 -83 -17 -38 28 -17 -48 -30 7 -49 -39 4 -44 -31 -42 -5 -54 8 -10 14 -17 -21 -32 3 -5 29 -29 17 -401 49 -78 -13 -43 -24 -87 -6 -24 -24 -59 -19 -58 36 -39 -5 -51 57 -18 -26 -54 5 -64 42 -154 -4 -76 28 -43 0 -62 -38 -65 -8 -6 -14 -86 18 -18 -29 -2 -76 -15 -12 3 -42 -30 -35 -113 12 -308 -135 -31 -6 -17 13 -15 -11 -38 36 14 71 15 2 44 70 0 40 -18 22 19 8 -15 23 6 29 -16 11 -4 40 -44 32 -14 87 -40 23 -62 97 -62 57 27 74 -43 239 62 67 48 -21 69 7 72 -47 66 12 47 -27 42 37 41 85 16 -12 2 16 47 27 28 128 79 42;Boa Vista:-60453 3590 75 -24 21 -24 20 4 51 -86 -36 -46 1 -45 -22 -46 -53 -22 -15 -26 38 -110 -75 -119 -39 -28 -54 -102 -108 -81 -45 -106 -81 -85 -46 -90 -15 -116 -32 -3 11 14 -12 13 -23 14 -20 -8 17 42 -48 10 29 48 -3 60 -83 54 0 766 54 32 37 -16 22 15 144 20 149 -97 -8 55 50 23 0 39 24 36 14 -12 31 63 30 -16;Bonfim:-59892 3576 50 -23 4 -23 34 -23 -37 -82 27 3 11 -66 -30 -8 6 -19 -61 -93 13 -18 -32 -12 8 -58 -22 -5 13 -5 -11 -12 11 -18 -13 7 -35 -40 -5 -66 14 -15 -11 -46 -24 -24 -8 -244 34 -76 -14 -16 42 -23 -8 -18 41 -71 6 -57 -18 -36 11 -26 26 -2 28 -41 14 9 43 -45 47 8 16 -15 -18 -114 18 -65 -19 -24 21 -46 -13 -28 -423 0 -18 44 -40 7 -36 -26 -41 33 73 92 42 -5 27 33 -1 15 -12 -8 -3 55 -39 5 -5 61 12 -2 30 53 -32 41 4 143 -28 21 2 32 -39 8 -52 45 -97 -9 53 51 26 60 -27 44 -152 45 -49 24 -10 23 195 280 -35 91 12 45 48 15 6 28 47 43 105 24 34 52 73 31 27 31 100 49 19 -15 32 28 13 -11;Cantá:-60475 2830 118 -37 28 -39 -27 -65 -53 -51 97 9 52 -45 39 -8 -2 -32 28 -21 -4 -143 32 -41 -30 -53 -12 2 5 -61 39 -5 3 -55 12 8 1 -15 -27 -33 -42 5 -73 -92 41 -33 36 26 40 -7 18 -44 -10 -42 -64 -74 -159 -147 -27 10 -68 -17 -9 -20 -33 15 -10 -16 -42 -2 33 46 -30 38 -2 43 -61 37 -17 27 -95 8 -10 52 17 42 -183 -15 -52 -39 -40 32 -34 85 37 82 106 91 19 48 45 30 21 233 49 97 81 85 45 106 81 50 10 -23 83 -32;Caracaraí:-61414 2026 48 -29 146 -26 198 29 4 -22 40 -32 52 39 183 15 -17 -42 10 -52 95 -8 17 -27 61 -37 2 -43 30 -38 -33 -46 42 2 10 16 33 -15 9 20 68 17 27 -10 159 147 64 74 10 42 423 0 -26 -99 8 -42 60 -5 14 -15 15 32 13 -27 -5 -27 -24 -9 -12 -51 24 -2 4 -18 30 4 15 -25 51 20 27 -13 28 -54 18 5 11 -47 34 -7 36 -68 -35 -6 -40 51 -36 -6 -92 36 -33 -19 -22 17 -38 -20 -56 2 -12 -15 9 -28 -48 -35 12 -19 -18 -30 47 -91 -19 -59 14 -54 -45 -19 -17 -56 -26 -13 -11 25 -12 -16 -50 -5 -52 -67 -130 -29 -92 33 -64 2 -13 -15 -29 32 -81 -18 -16 -28 -16 5 -34 -25 -42 -56 -4 -36 -23 3 -25 -54 -32 -15 -9 9 0 -28 -48 -2 -31 -28 -10 9 -27 -16 -23 35 12 32 -39 1 -42 46 -12 22 3 59 -64 66 -23 -11 -18 -44 -61 19 -26 -8 -7 19 -4 -20 -22 -1 -19 -71 -28 -4 -23 -25 6 -20 -21 1 1 -20 -15 8 -6 -16 -27 27 -16 -13 -34 52 -30 -35 -61 29 -47 -37 -60 -89 -29 -84 -162 -179 -21 -74 -51 -50 -71 -173 -19 -142 4 -109 -42 -91 26 -69 -45 -144 5 -72 -17 -46 46 -93 -24 -70 14 -82 -57 -116 19 -97 -34 -57 13 -53 -20 -69 31 -57 -23 -69 42 -132 -33 -72 32 -70 -29 -1 -27 6 -121 254 -45 42 -52 16 -11 46 -74 37 -4 18 -56 6 -13 24 -21 4 -83 82 0 30 -19 16 -53 10 -17 21 -15 -6 -30 36 16 9 -14 36 22 33 58 -11 22 -35 16 18 32 2 -12 31 74 24 6 50 -28 50 9 38 35 36 1 24 71 61 14 63 -60 28 4 128 -75 72 -13 42 10 36 -24 54 -78 62 -4 82 -24 34 -16 68 2 57 20 47 -39 74 -33 -10 -14 65 14 75 -17 107 78 95 -29 81 44 92 -35 69 6 59 -58 2 -91 274 0 41 -19 35 -81 50 -16 41 68 6 80 66 122 47 180 111 328 155 193 35 149 -11 128 72 74 15;Caroebe:-59611 1621 88 -30 36 6 40 -51 48 12 18 -50 52 6 2 -50 40 -11 5 -42 29 -22 205 -66 55 5 15 -26 60 15 -4 -27 36 -30 -26 -21 17 -11 0 -964 -538 0 -38 82 18 56 -13 28 -38 7 -41 85 -69 49 -36 0 -36 -30 -57 1 -71 77 35 201 17 18 24 238 -14 114 -41 140 19 59 -43 63 -2 38 16 20 -12 19 48 35 -9 28 12 15 153 14;Iracema:-63212 2830 76 -28 154 4 64 -42 -10 -42 -108 -44 -57 -85 -3 -17 22 -22 18 -160 79 -4 21 -29 41 -7 97 -78 195 -17 20 -28 9 -58 36 -49 33 12 85 -9 133 88 146 33 51 -67 108 83 156 52 92 2 82 68 76 31 32 -10 31 -70 79 -20 83 -44 145 7 30 -25 146 43 112 -82 -77 -71 -33 -61 -3 -33 29 -51 -198 -29 -146 26 -48 29 -74 -15 -128 -72 -149 11 -193 -35 -328 -155 -180 -111 -122 -47 -80 -66 -68 -6 -70 74 83 109 -7 106 32 93 -21 42 -119 63 -110 14 -75 -16 -30 14 -66 68 -22 76 -53 9 -88 -28 -77 43 -42 49 0 51 -24 68 31 42 -12 29 -94 0 -155 -42 -96 -7 -227 81 329 138 113 -12 30 35 -3 42 15 12 2 76 18 29 81 -19 11 15 65 8 39 33 66 5;Mucajaí:-61564 2940 34 -40 34 -13 46 9 13 -26 66 -30 -8 -24 83 -110 6 -47 24 12 24 -19 20 5 8 25 31 -4 44 22 5 20 8 -22 24 -3 7 13 50 -33 15 23 113 -70 3 -60 -29 -48 48 -10 -17 -42 20 8 35 -27 -11 -14 32 3 2 -11 -11 -113 -45 -30 -19 -48 -29 -20 -112 82 -146 -43 -30 25 -120 -14 -187 71 -31 70 -32 10 -76 -31 -82 -68 -92 -2 -156 -52 -108 -83 -51 67 -146 -33 -133 -88 -85 9 -33 -12 -36 49 -9 58 -20 28 -195 17 -97 78 -41 7 -21 29 -56 -2 -27 18 -14 148 -22 22 3 17 57 85 108 44 18 46 46 -9 18 26 51 -57 39 5 58 -36 59 19 24 24 87 6 43 24 78 13 401 -49 29 -17 5 -29 32 -3 17 21 10 -14 54 -8 42 5 44 31 39 -4 -2 27 -12 0 23 41 32 11 -28 17 27 52 67 69 63 7;Normandia:-60002 4282 117 -58 119 -12 -29 -32 179 -47 -33 -62 35 -17 16 -24 -11 -13 19 3 3 -26 13 8 -10 -34 38 11 30 -35 -12 -20 -36 -4 -4 -29 -10 11 -16 -18 15 -67 -19 -2 0 -21 -15 9 -16 -18 1 14 -36 -17 -16 -22 16 -26 -4 -31 -75 -43 -21 -34 -86 -21 -21 -41 -34 23 -32 -28 -19 15 -200 -111 -34 -52 -131 -42 -1 45 35 33 -12 40 -30 28 7 15 -15 16 -20 -4 -21 24 -32 6 -28 55 6 22 -43 52 2 25 -11 16 -22 -7 26 40 -11 26 14 39 -22 34 12 26 -14 13 17 42 26 0 -1 38 21 36 -33 98 -16 16 -14 -10 -14 34 -21 0 -6 36 56 12 96 -17 62 -37 29 13 26 -7 42 30 23 -17 33 14 35 28 10 38 50 0 35 44 43 -22;Pacaraima:-60620 4836 -30 -110 12 -7 -6 -48 18 -17 1 -25 -15 -12 29 -71 -45 -121 14 -33 45 -3 40 -55 15 -34 -25 -24 58 -42 -30 -23 0 -38 24 -6 14 -34 14 10 41 -61 8 -53 -21 -36 1 -38 -26 0 -17 -42 14 -13 -12 -26 22 -34 -14 -39 11 -26 -26 -40 22 7 11 -16 -2 -25 43 -52 -6 -22 28 -47 -40 0 -33 26 -31 -63 -14 12 -24 -36 0 -39 -26 -1 -28 -30 -16 21 13 32 -23 28 -65 34 -13 -11 -27 20 -30 -7 -31 15 -14 14 8 19 -63 32 -22 93 15 93 -40 91 -18 12 3 52 -27 35 -61 22 -41 -41 -116 33 -77 62 12 33 -20 34 12 47 -53 62 -2 23 -46 29 -160 -4 -19 20 14 64 51 31 111 -18 32 11 6 28 25 0 10 20 -44 26 -1 31 47 -7 7 12 17 -17 8 11 24 -11 3 13 71 -54 51 40 101 -3 11 24 25 8 2 33 24 3 -17 66 32 12 18 52 47 -13 46 45 55 7 92 93 7 36 32 -49;Rorainópolis:-60320 1144 29 -28 24 12 -12 -13 8 -37 -15 1 -20 -38 -96 -38 145 -35 -16 -13 72 -75 -94 -104 45 -34 -13 -25 8 -48 32 -40 -8 -40 18 7 -13 -28 74 -4 28 -40 6 -66 42 -55 -26 -54 99 -39 -36 -38 -20 -109 -57 -29 -21 -31 14 -22 -15 -52 -47 -29 -18 -33 -25 -68 4 -41 -75 -69 -5 -53 15 -29 -13 -35 -19 -9 -1 -40 -28 -30 6 -33 -38 -30 -17 -40 16 -80 18 2 14 -34 38 -19 4 -83 -37 -22 -31 4 -6 -17 -44 -19 -52 7 -19 -18 0 -33 -21 -11 15 -16 -27 -26 -60 22 -3 -19 -26 9 -48 -31 -7 21 -77 12 -4 66 -17 4 12 30 -36 17 0 43 -46 11 -11 42 -28 -1 -26 25 -12 69 -55 -7 -71 16 -41 46 -61 1 -9 -16 -59 15 -8 -59 -132 -39 -72 -36 2 -19 -38 -11 -20 -56 -58 -43 -10 -48 9 -41 -42 -85 2 -45 23 -6 16 -74 -32 -17 3 -105 -55 -117 46 -52 -37 -41 38 -15 8 -19 35 -5 22 -69 43 -26 -1 -51 -70 54 -60 77 -165 66 -71 -18 -32 70 33 72 -42 132 23 69 -31 57 20 69 -13 53 34 57 -19 97 57 116 -14 82 24 70 -46 93 17 46 -5 72 45 144 -26 69 42 91 -4 109 19 142 71 173 51 50 21 74 56 73 59 44 136 235 47 37 61 -29 24 34 14 -1 26 -50 16 13 27 -27 6 16 15 -8 -1 20 21 -1 -6 20 23 25 28 4 19 71 22 1 4 20 7 -19 26 8 61 -19 18 44 23 11 64 -66 -3 -59 12 -22 42 -46 39 -1 -12 -32 29 -34 -2 11 45 -1 19 24 48 2 0 28 9 -9 32 15 20 47 28 4 4 36 58 72 34 4 4 22 37 16 19 -10 5 14 8 -11 24 11;São João da Baliza:-59776 1277 38 -201 -24 -238 -17 -18 -35 -201 71 -77 57 -1 36 30 36 0 69 -49 41 -85 38 -7 13 -28 -18 -56 38 -82 -605 0 35 46 -99 39 26 54 -42 55 -6 66 -28 40 83 48 -11 62 16 9 18 112 -16 43 12 62 21 16 9 40 38 14 7 19 -7 147 42 56 50 5 12 16 22 -23 32 67 48 20;São Luiz:-59982 1136 7 -147 -7 -19 -38 -14 -9 -40 -21 -16 -12 -62 16 -43 -18 -112 -16 -9 11 -62 -87 -51 -70 7 13 28 -18 -7 8 40 -32 40 -8 48 13 25 -45 34 94 104 -72 75 16 13 -145 35 96 38 20 38 15 -1 -8 37 12 13 53 1 92 -33 140 40;Uiramutã:-60195 5238 23 -11 37 21 41 -108 98 -55 -12 -26 19 -88 -50 -187 12 -11 -16 -56 13 -16 -48 -52 3 -40 -51 -12 -14 -41 -20 7 -3 -56 59 -6 -4 17 17 6 2 -15 21 3 -3 -18 67 2 32 -19 3 26 35 -9 30 -39 34 28 12 -34 46 -3 16 20 1 -19 111 -64 8 -38 -55 -60 23 -17 -27 -32 10 -52 25 -23 -95 19 29 32 -119 12 -160 80 -35 -44 -50 0 -10 -38 -68 -42 -23 17 -41 -29 -27 6 -29 -13 -62 37 -96 17 -30 -14 -23 10 30 23 -5 10 -53 32 25 24 -15 34 -40 55 -45 3 3 14 -14 4 9 75 33 61 -29 71 15 12 -1 25 -18 17 6 48 -12 7 14 85 23 32 -39 42 24 4 12 29 25 9 7 29 -60 101 4 53 -16 5 -5 49 -25 31 -49 6 12 19 71 11 28 -15 27 5 28 -25 118 7 17 -21 21 32 29 8 17 -17 48 3 107 64 17 -34';
})();
