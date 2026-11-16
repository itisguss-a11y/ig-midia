// PRESEME · kit de estilos para os reels feitos no animation-studio.
//
// A cena é escrita uma vez, com as funções deste kit (fundo, chão, forma, linha, seta, cota, texto, destaque,
// personagem, objeto, carimbo), e sai em qualquer dos seis estilos trocando um nome:
//   lapis    lápis no papel (o acabamento A do sus-hoje; a referência do kit)
//   pixel    pixel art de verdade: o quadro desenhado em blocos de 6 px, cada bloco numa cor da paleta, letra nítida por cima
//   giz      giz na lousa: o Floresta é a lousa; giz em Papel, Sálvia e Marca-texto
//   planta   planta técnica: papel quadriculado, traço fino e firme, cor em aguada, cotas e setas
//   carimbo  carimbo e gravura: cor chapada impressa, tinta falhada na borda e no fundo, nunca em cima da letra
//   chapado  infográfico chapado: formas planas, cantos arredondados, sem contorno e sem textura
//
// Como escolher: no score.js, `ESTILO: 'giz'` no SCORE; ou na hora de renderizar, `--style giz` em qualquer comando do
// render.js (stills, board, video, qa...). Sem nada, vale `lapis`.
//
// Como carregar, no index.html da peça: DEPOIS do score.js e ANTES do engine/video/gfx.js:
//   <script src="ferramentas/estilos.js"></script>
// As letras ficam em ferramentas/fontes/ (o kit as carrega sozinho, antes do init do filme).
// O kit não edita o engine: ele escolhe o estilo-base do motor e embrulha G.bg, G.shape, G.text e G.post na hora
// em que o gfx.js publica o G.
(function () {
  'use strict';
  if (typeof window === 'undefined') { if (typeof module !== 'undefined') module.exports = {}; return; } // só no navegador

  const U = globalThis.U;
  // a paleta da ficha (seção 1, Arte) e as cores de gente (pele e cabelo), as únicas fora dela
  const PAL = { floresta: '#17402C', papel: '#F4EDDF', marca: '#E4EB6C', coral: '#F16D4D', salvia: '#B5D8C0', folha: '#30724E', noite: '#072618' };
  const GENTE = { branco: '#FFFDF6', pele: '#C98A62', peleClara: '#DBA27E', peleEscura: '#A86E4B', cabelo: '#2B211E' };
  const PASTA_FONTES = globalThis.ESTILOS_PASTA_FONTES || 'ferramentas/fontes';
  const FONTES = [
    ['Instrument Sans', 'InstrumentSans.ttf', '400 700'],
    ['Anton', 'Anton-Regular.ttf', '400'],
    ['Kalam', 'Kalam-Regular.ttf', '400'],
    ['Kalam', 'Kalam-Bold.ttf', '700'],
    ['VT323', 'VT323-Regular.ttf', '400'],
    ['IBM Plex Mono', 'IBMPlexMono-Medium.ttf', '500'],
  ];

  // ---------- os seis estilos ----------
  // motor: o estilo-base do animation-studio; mais: o que muda nele; escuro: fundo escuro (muda as cores do texto)
  const DEF = {
    lapis: {
      nome: 'lápis no papel', motor: 'paper', mais: {}, escuro: false,
      o: 'traço de lápis que treme, hachura e textura de papel: o acabamento A do sus-hoje',
      serve: 'peça que conta um caso ou um dia; é a referência do kit e o ★ quando não houver motivo para outro',
      nota: 'positivo dele em 15/11 ("Acabamento A (feedback positivo pra esse acabamento)")',
    },
    pixel: {
      nome: 'pixel art', motor: 'pixel', mais: { pixel: 0, lw: 1.7, post: { paper: 0, grain: 0, vignette: 0 } }, escuro: false, px: 6,
      o: 'o quadro em blocos de 6 px, cada bloco numa cor da paleta; a letra fica nítida, por cima dos blocos',
      serve: 'peça com cara de jogo, mapa ou percurso (fases, equipe como party)',
      nota: 'plus no A casa 12; a professora achou divertida a cara de jogo; não pode virar padrão (regra de variar)',
    },
    giz: {
      nome: 'giz na lousa', motor: 'chalk', mais: { bg: PAL.floresta, ink: PAL.papel, post: { vignette: 0.32, grain: 0.05 } }, escuro: true,
      o: 'a lousa é o Floresta; risco de giz falhado, preenchimento rabiscado e letra de mão',
      serve: 'explicação passo a passo, esquema, "como funciona"',
      nota: 'nunca testado no perfil',
    },
    planta: {
      nome: 'planta técnica', motor: 'paper', mais: { amp: 0, lw: 0.55, second: false, hatch: false, textBoil: 0, post: { paper: 0.18, grain: 0.02, vignette: 0.05 } }, escuro: false, planta: true,
      o: 'papel quadriculado, traço fino e firme, cor em aguada transparente, cotas e setas de prancheta',
      serve: 'território, distância, tamanho, fluxo, "onde fica o quê"',
      nota: 'nunca testado no perfil',
    },
    carimbo: {
      nome: 'carimbo e gravura', motor: 'paper', mais: { amp: 0.45, lw: 1.25, second: false, hatch: false, textBoil: 0, boilFps: 0, post: { paper: 0.75, grain: 0.05, vignette: 0.16 } }, escuro: false, carimbo: true,
      o: 'cor chapada impressa, um pouco fora de registro, com falha de tinta na borda e no fundo; a letra sai limpa',
      serve: 'documento, regra, lei, "oficial", antes e depois',
      nota: 'só o carimbo do sus-hoje (15/11) usou; ali a falha de tinta caiu em cima das letras (o O de TRABALHADOR parecia C): aqui ela nunca toca a letra',
    },
    chapado: {
      nome: 'infográfico chapado', motor: 'flat', mais: { post: { vignette: 0.05 } }, escuro: false, chapado: true,
      o: 'formas planas, cantos arredondados, sem contorno e sem textura, fundo Sálvia',
      serve: 'número, comparação, dado oficial, gráfico',
      nota: 'nunca testado como estilo da peça inteira',
    },
  };
  // o que ficou de fora, e por quê (para nenhum chat trazer de volta sem ele pedir)
  const FORA = {
    '3D pastel com etiquetas': 'ele: "já detestei, não gosto desse tipo de estilo" (15/11)',
    'recorte de papel': 'ele achou "horrível" (12/11)',
    'cena escura': 'ele: "ar depressivo e angustiante" (reel da parada, 13/11)',
    'caixa de diálogo de RPG': 'ele: "o jogo pode imitar elementos gráficos de videogame mas não precisa copiar um jogo" (14/11)',
    'boneco genérico': 'ele: "parece que você só pegou qualquer asset e jogou lá" (reel da diarreia, 13/11)',
    neon: 'o motor tem, mas é escuro (noite e brilho): cai na regra da cena escura',
    watercolor: 'o motor tem; fica para testar depois, numa peça de clima calmo (não entrou nos seis que ele aprovou)',
  };
  const APELIDO = { paper: 'lapis', papel: 'lapis', 'lápis': 'lapis', flat: 'chapado', chalk: 'giz', lousa: 'giz', stamp: 'carimbo', gravura: 'carimbo', blueprint: 'planta' };

  // ---------- qual estilo: --style / ?style= / SCORE.ESTILO / SCORE.STYLE / lapis ----------
  const pick0 = U.pickStyle;
  function resolver() {
    const pedido = pick0(null) || (globalThis.SCORE && (globalThis.SCORE.ESTILO || globalThis.SCORE.STYLE)) || 'lapis';
    const n = String(pedido).toLowerCase();
    const nome = DEF[n] ? n : APELIDO[n];
    if (nome) return { nome, motor: DEF[nome].motor };
    console.warn(`[estilos] "${pedido}" não é um estilo do kit (${Object.keys(DEF).join(', ')}); usando lapis`);
    return { nome: 'lapis', motor: 'paper' };
  }
  const ESCOLHA = resolver();
  U.pickStyle = () => ESCOLHA.motor; // o gfx.js pede o estilo-base aqui
  const D = DEF[ESCOLHA.nome];

  // ---------- as cores por papel, em cada estilo ----------
  // fundo · tinta (contorno e linha) · texto · destaque (o que importa) · alerta (erro, pegadinha) · apoio (claro) ·
  // apoioEscuro · superficie (parede, papel, cartão) · chao · sombra · grade (quadriculado, linhas de fundo) ·
  // linhaChao (linha, faixa ou marca desenhada em cima do chão: a cor que se lê no chão de cada estilo; 16/11)
  const CLARO = { fundo: PAL.papel, tinta: PAL.floresta, texto: PAL.floresta, destaque: PAL.marca, alerta: PAL.coral, apoio: PAL.salvia, apoioEscuro: PAL.folha, superficie: GENTE.branco, chao: PAL.salvia, sombra: PAL.folha, grade: PAL.salvia, linhaChao: PAL.floresta };
  const CORES = {
    lapis: CLARO,
    pixel: Object.assign({}, CLARO, { tinta: PAL.noite, linhaChao: PAL.noite }),
    giz: { fundo: PAL.floresta, tinta: PAL.papel, texto: PAL.papel, destaque: PAL.marca, alerta: PAL.coral, apoio: PAL.salvia, apoioEscuro: PAL.folha, superficie: PAL.folha, chao: PAL.folha, sombra: PAL.noite, grade: PAL.folha, linhaChao: PAL.papel },
    planta: Object.assign({}, CLARO, { superficie: PAL.papel, chao: PAL.papel }),
    carimbo: Object.assign({}, CLARO, { superficie: PAL.papel, sombra: PAL.noite }),
    chapado: Object.assign({}, CLARO, { fundo: PAL.salvia, superficie: PAL.papel, chao: PAL.folha, grade: PAL.folha, linhaChao: PAL.papel }), // no chão Folha, a tinta Floresta some (contraste 2:1); o Papel dá 4,9:1
  };
  const cor = (p) => (CORES[ESCOLHA.nome][p] || PAL[p] || GENTE[p] || p);

  // ---------- as letras por papel, em cada estilo: [família, peso, escala do tamanho] ----------
  const LETRAS = {
    lapis: { titulo: ['Inter', 800, 1], corpo: ['Inter', 800, 1], mao: ['Caveat', 700, 1.12], numero: ['Inter', 800, 1] },
    pixel: { titulo: ['VT323', 400, 1.4], corpo: ['VT323', 400, 1.4], mao: ['VT323', 400, 1.4], numero: ['VT323', 400, 1.45] },
    giz: { titulo: ['Kalam', 700, 1.06], corpo: ['Kalam', 700, 1.02], mao: ['Kalam', 400, 1.06], numero: ['Kalam', 700, 1.08] },
    planta: { titulo: ['Instrument Sans', 700, 1.02], corpo: ['Instrument Sans', 600, 1.02], mao: ['IBM Plex Mono', 500, 0.9], numero: ['IBM Plex Mono', 500, 0.96] },
    carimbo: { titulo: ['Anton', 400, 1.16], corpo: ['Instrument Sans', 700, 1.02], mao: ['Anton', 400, 1.04], numero: ['Anton', 400, 1.2] },
    chapado: { titulo: ['Inter', 800, 1], corpo: ['Inter', 700, 1], mao: ['Inter', 700, 0.96], numero: ['Inter', 800, 1] },
  };
  const letra = (papel = 'corpo') => LETRAS[ESCOLHA.nome][papel] || LETRAS[ESCOLHA.nome].corpo;

  let G = null; // o G do motor, quando o gfx.js publicar
  const E = { PAL, GENTE, DEF, FORA, CORES, LETRAS };
  E.nome = ESCOLHA.nome;
  E.info = D;
  E.lista = Object.keys(DEF);
  E.escuro = () => !!D.escuro;
  E.cor = cor;
  E.letra = letra;

  // ---------- os embrulhos, postos quando o gfx.js publica o G ----------
  const H = (...xs) => U.hash(...xs);
  const DA_PALETA = new Set(Object.values(PAL).map((c) => c.toUpperCase()));
  const pendentes = []; // pixel: os textos esperam o quadro virar blocos e saem nítidos por cima
  let replay = false;

  function preparar(g) {
    G = g;
    G.setStyle(D.motor, D.mais);
    G.C.ink = cor('tinta'); G.C.paper = PAL.papel; G.C.cream = PAL.papel; // o contorno das pessoas e das legendas do motor na tinta do perfil
    if (ESCOLHA.nome === 'pixel') G.style.preseme_px = D.px;
    if (D.planta) G.style.preseme_planta = true;
    if (D.carimbo) G.style.preseme_carimbo = true;
    const bg0 = G.bg, shape0 = G.shape, text0 = G.text, post0 = G.post, limb0 = G.limb;

    // braço e perna (o motor desenha com traço grosso, não com forma): na planta, também em aguada
    G.limb = (ctx, pts, o) => {
      if (!D.planta) return limb0(ctx, pts, o);
      ctx.save(); ctx.globalAlpha *= 0.58; limb0(ctx, pts, o); ctx.restore();
    };

    // fundo: o do estilo, com o quadriculado na planta
    G.bg = (ctx, color) => {
      if (D.escuro) { bg0(ctx, color); return; }
      bg0(ctx, color);
      if (D.planta) grade(ctx);
    };

    // forma: aguada na planta; fora de registro e tinta falhada no carimbo
    G.shape = (ctx, pts, o = {}) => {
      if (D.planta && o.fill && (o.closed ?? true)) {
        shape0(ctx, pts, Object.assign({}, o, { stroke: null, lw: 0, alpha: (o.alpha ?? 1) * 0.5 }));
        return o.stroke === null ? pts : shape0(ctx, pts, Object.assign({}, o, { fill: null }));
      }
      if (D.carimbo && o.fill && (o.closed ?? true)) {
        const seed = o.seed || 1;
        ctx.save(); ctx.translate((H(seed, 1) - 0.5) * 7, (H(seed, 2) - 0.2) * 5); // a cor sai um pouco fora do traço
        const p = shape0(ctx, pts, Object.assign({}, o, { stroke: null, lw: 0 }));
        if (DA_PALETA.has(String(o.fill).toUpperCase())) falhas(ctx, p, seed); // pele, cabelo e branco nunca levam falha (no rosto, pareceria mancha)
        ctx.restore();
        if (o.stroke !== null) shape0(ctx, pts, Object.assign({}, o, { fill: null }));
        return p;
      }
      return shape0(ctx, pts, o);
    };

    // texto: na pixel art, espera o quadro virar blocos e sai nítido, na letra de pixel
    G.text = (ctx, str, x, y, o = {}) => {
      if (ESCOLHA.nome === 'pixel' && !replay) {
        pendentes.push({ m: ctx.getTransform(), a: ctx.globalAlpha, decor: G.decorDepth > 0, str, x, y, o: Object.assign({}, o) });
        return;
      }
      return text0(ctx, str, x, y, o);
    };

    // acabamento: os blocos da pixel art (cada bloco na cor da paleta mais perto) e, por cima, os textos que esperavam
    G.post = (ctx, t, opts) => {
      if (ESCOLHA.nome !== 'pixel') { post0(ctx, t, opts); return; }
      pixelar(ctx);
      post0(ctx, t, opts);
      const lista = pendentes.splice(0);
      const [fam, weight, k] = letra('corpo');
      replay = true;
      try {
        for (const p of lista) {
          ctx.save();
          ctx.setTransform(p.m); ctx.globalAlpha = p.a;
          const o = Object.assign({}, p.o, { fam, weight, size: Math.round((p.o.size || 48) * (p.o.preseme_k ? 1 : k)), boil: 0 });
          if (p.decor) G.decor(() => text0(ctx, p.str, p.x, p.y, o)); else text0(ctx, p.str, p.x, p.y, o);
          ctx.restore();
        }
      } finally { replay = false; }
    };
  }

  // o quadriculado da planta (fino a cada 30 px, mais forte a cada 150 px)
  function grade(ctx) {
    ctx.save();
    ctx.strokeStyle = PAL.salvia;
    const a0 = ctx.globalAlpha; // o fundo que entra transparente leva o quadriculado junto
    for (let pass = 0; pass < 2; pass++) {
      const passo = pass ? 150 : 30;
      ctx.globalAlpha = a0 * (pass ? 0.75 : 0.38); ctx.lineWidth = pass ? 2 : 1;
      ctx.beginPath();
      for (let x = 0; x <= G.W; x += passo) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, G.H); }
      for (let y = 0; y <= G.H; y += passo) { ctx.moveTo(0, y + 0.5); ctx.lineTo(G.W, y + 0.5); }
      ctx.stroke();
    }
    ctx.restore();
  }

  // a tinta que faltou no carimbo: pontos e riscos da cor do papel, só dentro da mancha de cor
  // (a letra é desenhada depois, por cima, e nunca leva falha)
  function falhas(ctx, p, seed) {
    const [x0, y0, x1, y1] = G.bbox(p), area = (x1 - x0) * (y1 - y0);
    if (area < 400) return;
    ctx.save();
    ctx.beginPath(); G.path(ctx, p, true); ctx.clip();
    ctx.fillStyle = PAL.papel;
    const n = Math.min(180, Math.round(area / 1300));
    for (let i = 0; i < n; i++) {
      const x = x0 + H(seed, i, 3) * (x1 - x0), y = y0 + H(seed, i, 4) * (y1 - y0);
      const borda = H(seed, i, 9) < 0.55; // mais falha perto da borda, como no carimbo de verdade
      const r = (borda ? 1.2 : 0.8) + H(seed, i, 5) * (borda ? 3 : 2);
      ctx.globalAlpha = 0.55 + H(seed, i, 6) * 0.4;
      ctx.beginPath(); ctx.ellipse(x, y, r * (1 + H(seed, i, 7)), r, H(seed, i, 8) * 3, 0, Math.PI * 2); ctx.fill();
    }
    // dois ou três riscos de rolo sem tinta
    for (let i = 0; i < 3; i++) {
      if (H(seed, i, 11) < 0.35) continue;
      const y = y0 + H(seed, i, 12) * (y1 - y0), w = (x1 - x0) * (0.25 + H(seed, i, 13) * 0.5), x = x0 + H(seed, i, 14) * (x1 - x0 - w);
      ctx.globalAlpha = 0.35; ctx.fillRect(x, y, w, 1.5 + H(seed, i, 15) * 2);
    }
    ctx.restore();
    // a borda gasta: pequenas mordidas no contorno
    ctx.save(); ctx.fillStyle = PAL.papel;
    for (let i = 0; i < p.length; i += 3) {
      if (H(seed, i, 21) > 0.3) continue;
      ctx.globalAlpha = 0.8;
      ctx.beginPath(); ctx.arc(p[i][0] + (H(seed, i, 22) - 0.5) * 3, p[i][1] + (H(seed, i, 23) - 0.5) * 3, 1.2 + H(seed, i, 24) * 2.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // pixel art de verdade: o quadro vai para uma grade de blocos, cada bloco ganha a cor da paleta mais perto
  // e volta ao tamanho cheio sem suavizar
  const PIX_CORES = [...Object.values(PAL), GENTE.branco, GENTE.pele, GENTE.peleClara, GENTE.peleEscura, GENTE.cabelo].map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)));
  function pixelar(ctx) {
    const cv = ctx.canvas, k = G.scale || 1, px = (G.style.preseme_px || 6) * k;
    const w = Math.max(1, Math.round(cv.width / px)), h = Math.max(1, Math.round(cv.height / px));
    const off = G.scratch('preseme-pixel', w, h), ox = off.getContext('2d', { willReadFrequently: true });
    // cada bloco pega a cor de um ponto só (sem média): linha fina não vira cor de mistura
    ox.imageSmoothingEnabled = false; ox.clearRect(0, 0, w, h); ox.drawImage(cv, 0, 0, w, h);
    const im = ox.getImageData(0, 0, w, h), d = im.data;
    for (let i = 0; i < d.length; i += 4) {
      let best = 0, bd = Infinity;
      for (let j = 0; j < PIX_CORES.length; j++) {
        const c = PIX_CORES[j], dr = d[i] - c[0], dg = d[i + 1] - c[1], db = d[i + 2] - c[2];
        const dd = dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11;
        if (dd < bd) { bd = dd; best = j; }
      }
      const c = PIX_CORES[best]; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
    }
    ox.putImageData(im, 0, 0);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, 0, 0, w, h, 0, 0, cv.width, cv.height);
    ctx.imageSmoothingEnabled = true; ctx.restore();
  }

  // ---------- o G e o Studio do motor: o kit entra na hora em que eles são publicados ----------
  Object.defineProperty(globalThis, 'G', {
    configurable: true, enumerable: true,
    get() { return undefined; },
    set(v) { Object.defineProperty(globalThis, 'G', { value: v, writable: true, configurable: true, enumerable: true }); preparar(v); },
  });
  async function carregarFontes() {
    for (const [fam, arq, peso] of FONTES) {
      try { const f = new FontFace(fam, `url(${PASTA_FONTES}/${arq})`, { weight: peso }); document.fonts.add(f); await f.load(); }
      catch (e) { console.error('[estilos] letra não carregou:', fam, arq, String(e)); }
    }
  }
  Object.defineProperty(globalThis, 'Studio', {
    configurable: true, enumerable: true,
    get() { return undefined; },
    set(S) {
      Object.defineProperty(globalThis, 'Studio', { value: S, writable: true, configurable: true, enumerable: true });
      const film0 = S.film;
      S.film = (o = {}) => film0(Object.assign({}, o, { init: async (ctx) => { await carregarFontes(); if (o.init) await o.init(ctx); } }));
    },
  });

  // ======================================================================================================
  // As funções da cena. Todas recebem o ctx primeiro e as medidas no quadro de 1080 × 1920.
  // Cor: o nome de um papel (tinta, texto, destaque, alerta, apoio, apoioEscuro, superficie, chao, sombra, grade,
  // fundo, linhaChao), uma cor da paleta (floresta, papel, marca, coral, salvia, folha, noite) ou de gente (pele, cabelo, branco).
  // k (de 0 a 1): quanto do desenho já apareceu (para desenhar entrando: linha, seta, cota, destaque, carimbo).
  // ======================================================================================================

  const lw0 = () => (D.planta ? 3 : D.carimbo ? 4.5 : 5);
  const raio0 = (r) => (D.chapado ? Math.max(r ?? 22, 22) : r ?? 14);
  const hachura = () => (ESCOLHA.nome === 'lapis' ? { color: 'rgba(23,64,44,0.15)', gap: 12 } : null);

  // o fundo do quadro; tipo 'escuro' pede o cartão escuro (Floresta) no lugar do fundo do estilo
  E.fundo = (ctx, { tipo = 'padrao' } = {}) => {
    if (tipo === 'escuro' && !D.escuro) { ctx.save(); ctx.fillStyle = PAL.floresta; ctx.fillRect(0, 0, G.W, G.H); ctx.restore(); return; }
    G.bg(ctx, cor('fundo'));
  };

  // o chão, do y até embaixo (mais largo que a tela, para câmera que se afasta)
  E.chao = (ctx, y, { papel = 'chao', seed = 6 } = {}) => {
    const x0 = -700, x1 = G.W + 700, y1 = G.H + 400;
    if (D.planta) {
      // o símbolo de terreno das plantas: uma linha firme e a faixa de traços inclinados embaixo dela
      G.line(ctx, [[x0, y], [x1, y]], { color: cor('tinta'), lw: 6, seed, amp: 0 });
      ctx.save(); ctx.beginPath(); ctx.rect(-10, y + 3, G.W + 20, 46); ctx.clip();
      ctx.strokeStyle = cor('tinta'); ctx.globalAlpha *= 0.55; ctx.lineWidth = 2.2; ctx.beginPath(); // *=: respeita o globalAlpha de quem chama
      for (let x = -60; x < G.W + 60; x += 22) { ctx.moveTo(x, y + 48); ctx.lineTo(x + 30, y + 4); }
      ctx.stroke(); ctx.restore();
      return;
    }
    G.poly(ctx, [[x0, y], [x1, y], [x1, y1], [x0, y1]], { fill: cor(papel), stroke: null, lw: 0, seed, hatch: hachura() });
    if (D.chapado) { ctx.save(); ctx.fillStyle = cor('sombra'); ctx.globalAlpha *= 0.35; ctx.fillRect(x0, y, x1 - x0, 14); ctx.restore(); }
    else G.line(ctx, [[x0, y], [x1, y]], { color: cor('tinta'), lw: 7, seed: seed + 1 });
  };

  // formas: retângulo de canto redondo, círculo e polígono, com o preenchimento e o contorno do estilo
  function opts(o, seed) {
    const fill = o.papel === null ? null : cor(o.papel || 'superficie');
    const stroke = o.contorno === false ? null : cor(o.tinta || 'tinta');
    return { fill, stroke, lw: o.lw ?? lw0(), seed, hatch: o.hachura === false ? null : (o.hachura || hachura()), alpha: o.alpha ?? 1, amp: o.amp };
  }
  function sombra(ctx, desenha, o) {
    if (!(o.sombra ?? D.chapado)) return;
    ctx.save(); ctx.translate(o.sombraX ?? 10, o.sombraY ?? 12);
    desenha({ fill: cor('sombra'), stroke: null, lw: 0, alpha: 0.32, hatch: null });
    ctx.restore();
  }
  E.ret = (ctx, x, y, w, h, o = {}) => {
    const seed = o.seed ?? 3, r = raio0(o.r);
    sombra(ctx, (q) => G.rrect(ctx, x, y, w, h, r, Object.assign({ seed }, q)), o);
    return G.rrect(ctx, x, y, w, h, r, opts(o, seed));
  };
  E.circulo = (ctx, cx, cy, r, o = {}) => {
    const seed = o.seed ?? 4;
    sombra(ctx, (q) => G.ellipse(ctx, cx, cy, r, o.ry ?? r, Object.assign({ seed }, q)), o);
    return G.ellipse(ctx, cx, cy, r, o.ry ?? r, opts(o, seed));
  };
  E.poligono = (ctx, pts, o = {}) => {
    const seed = o.seed ?? 5;
    sombra(ctx, (q) => G.poly(ctx, pts, Object.assign({ seed }, q)), o);
    return G.poly(ctx, pts, opts(o, seed));
  };

  // pedaço de uma linha: os pontos até a fração k do comprimento (para desenhar entrando)
  function ate(pts, k) {
    if (k >= 1) return pts;
    const seg = []; let total = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); total += l; }
    let falta = total * Math.max(0, k); const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      if (falta >= seg[i - 1]) { out.push(pts[i]); falta -= seg[i - 1]; continue; }
      const u = seg[i - 1] ? falta / seg[i - 1] : 0;
      out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u]);
      break;
    }
    return out;
  }
  E.linha = (ctx, pts, { papel = 'tinta', lw = 6, k = 1, seed = 9, tracejado = false } = {}) => {
    if (k <= 0) return;
    const p = ate(pts, k);
    if (p.length < 2) return;
    if (tracejado) { ctx.save(); ctx.setLineDash([lw * 3, lw * 2.2]); }
    G.line(ctx, p, { color: cor(papel), lw: D.planta ? Math.max(2, lw * 0.6) : lw, seed, amp: D.planta || D.chapado ? 0 : 1.2 });
    if (tracejado) ctx.restore();
  };

  // seta curva de "de" até "para"; curva > 0 entorta para a esquerda de quem anda
  E.seta = (ctx, de, para, { papel = 'tinta', lw = 7, curva = 0.25, k = 1, cabeca = 30, seed = 13 } = {}) => {
    if (k <= 0) return;
    const mx = (de[0] + para[0]) / 2, my = (de[1] + para[1]) / 2, dx = para[0] - de[0], dy = para[1] - de[1];
    const c = [mx - dy * curva, my + dx * curva];
    const pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), d = u * u; pts.push([a * de[0] + b * c[0] + d * para[0], a * de[1] + b * c[1] + d * para[1]]); }
    const p = ate(pts, k);
    const lwS = D.planta ? 3.5 : lw;
    G.line(ctx, p, { color: cor(papel), lw: lwS, seed, amp: D.planta || D.chapado ? 0 : 1.2 });
    if (p.length < 2) return;
    const [ax, ay] = p[p.length - 1], [bx, by] = p[Math.max(0, p.length - 3)], ang = Math.atan2(ay - by, ax - bx);
    const s = cabeca * (D.planta ? 0.8 : 1);
    const asa = (sinal) => [ax - Math.cos(ang + sinal * 0.45) * s, ay - Math.sin(ang + sinal * 0.45) * s];
    if (D.planta) G.line(ctx, [asa(1), [ax, ay], asa(-1)], { color: cor(papel), lw: lwS, seed: seed + 1, amp: 0 });
    else G.poly(ctx, [asa(1), [ax, ay], asa(-1)], { fill: cor(papel), stroke: D.chapado ? null : cor(papel), lw: 3, seed: seed + 2, amp: 0.5 });
  };

  // cota de prancheta: a medida entre dois pontos, com os traços nas pontas e o texto no meio
  // sobre: o que está embaixo da cota ('fundo', 'chao' ou outro papel): a linha e o número pegam a cor que se lê nele
  E.cota = (ctx, de, para, texto, { papel = 'tinta', k = 1, size = 34, seed = 17, sobre = 'fundo' } = {}) => {
    if (k <= 0) return;
    const dx = para[0] - de[0], dy = para[1] - de[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, t = 18;
    const p1 = [de[0] + dx * Math.min(1, k), de[1] + dy * Math.min(1, k)];
    const baixo = cor(sobre), naoLe = escura(baixo) === escura(cor(papel));
    const corTexto = naoLe ? (escura(baixo) ? PAL.papel : PAL.floresta) : cor(papel === 'tinta' ? 'texto' : papel);
    const col = D.planta && !escura(baixo) ? cor('alerta') : naoLe ? corTexto : cor(papel); // na planta a cota é Coral (linha, nunca texto)
    const fino = D.planta ? 2.5 : 4;
    G.line(ctx, [de, p1], { color: col, lw: fino, seed, amp: D.planta || D.chapado ? 0 : 0.8 });
    const tick = (p) => G.line(ctx, [[p[0] + nx * t, p[1] + ny * t], [p[0] - nx * t, p[1] - ny * t]], { color: col, lw: fino, seed: seed + 1, amp: 0 });
    tick(de); if (k >= 1) tick(para);
    if (k < 1 || !texto) return;
    const [fam, weight, ks] = letra('numero'), z = Math.round(size * ks);
    const w = G.measure(ctx, texto, z, fam, weight) + 26, cx = de[0] + dx / 2, cy = de[1] + dy / 2;
    ctx.save(); ctx.fillStyle = baixo; ctx.fillRect(cx - w / 2, cy - z * 0.62, w, z * 1.24); ctx.restore(); // a linha não passa por cima do número
    G.text(ctx, texto, cx, cy + z * 0.34, { size: z, fam, weight, color: corTexto, align: 'center', boil: 0, preseme_k: true });
  };
  // a cor é escura? (para escolher letra clara ou escura em cima dela)
  function escura(hex) {
    const m = /^#([0-9a-f]{6})$/i.exec(String(hex)); if (!m) return false;
    const n = parseInt(m[1], 16), f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(n >> 16) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255) < 0.25;
  }
  E.escura = escura;

  // texto no papel dele: titulo, corpo, mao (anotação) ou numero. Respeita os pares de contraste da ficha:
  // Marca-texto só vira cor de letra no fundo escuro; Coral nunca vira letra no fundo claro, e no escuro só a partir de 48 px.
  E.texto = (ctx, s, x, y, { papel = 'corpo', size = 56, align = 'left', cor: c = 'texto', alpha = 1, baseline = 'alphabetic' } = {}) => {
    const [fam, weight, k] = letra(papel);
    let col = c;
    if (col === 'destaque' && !D.escuro) col = 'texto';
    if (col === 'alerta' && (!D.escuro || size < 48)) col = 'texto'; // Coral sobre o claro não chega a 3:1; no escuro, só letra grande
    G.text(ctx, s, x, y, { size: Math.round(size * k), fam, weight, color: cor(col), align, alpha, baseline, boil: D.planta || D.chapado || D.carimbo ? 0 : 0.6, preseme_k: true });
  };
  E.medir = (ctx, s, { papel = 'corpo', size = 56 } = {}) => { const [fam, weight, k] = letra(papel); return G.measure(ctx, s, Math.round(size * k), fam, weight); };

  // o destaque atrás de um trecho (marca-texto no fundo claro; risco de giz embaixo na lousa); k faz ele entrar
  E.destaque = (ctx, x, yBase, w, size, { k = 1, seed = 7 } = {}) => {
    if (k <= 0) return;
    const ww = w * Math.min(1, k);
    if (D.escuro) { // giz: dois riscos embaixo da palavra
      G.line(ctx, [[x - 6, yBase + size * 0.2], [x + ww + 8, yBase + size * 0.16]], { color: PAL.marca, lw: 7, seed, amp: 1.6 });
      if (k >= 1) G.line(ctx, [[x + 10, yBase + size * 0.34], [x + ww - 6, yBase + size * 0.3]], { color: PAL.marca, lw: 4, seed: seed + 1, amp: 1.6 });
      return;
    }
    const top = yBase - size * 0.84, bot = yBase + size * 0.22;
    if (D.chapado) { G.rrect(ctx, x - 12, top, ww + 24, bot - top, (bot - top) / 2, { fill: PAL.marca, stroke: null, lw: 0, seed }); return; }
    if (D.planta) { ctx.save(); ctx.globalAlpha *= 0.85; ctx.fillStyle = PAL.marca; ctx.fillRect(x - 8, top + size * 0.25, ww + 16, bot - top - size * 0.25); ctx.restore(); return; }
    G.poly(ctx, [[x - 10, top + size * 0.02], [x + ww + 12, top - size * 0.06], [x + ww + 8, bot], [x - 14, bot + size * 0.04]], { fill: PAL.marca, stroke: null, lw: 0, seed, amp: D.carimbo ? 1.6 : 2.2 });
  };

  // uma linha de texto com um trecho destacado; devolve a largura
  E.textoComDestaque = (ctx, s, trecho, x, y, { papel = 'titulo', size = 72, align = 'left', k = 1, seed = 7, alpha = 1 } = {}) => {
    const total = E.medir(ctx, s, { papel, size });
    const x0 = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
    const i = trecho ? s.indexOf(trecho) : -1;
    if (i < 0) { E.texto(ctx, s, x0, y, { papel, size, alpha }); return total; }
    const a = s.slice(0, i), b = s.slice(i + trecho.length);
    const xa = x0 + E.medir(ctx, a, { papel, size }), wd = E.medir(ctx, trecho, { papel, size }), zk = Math.round(size * letra(papel)[2]);
    ctx.save(); ctx.globalAlpha *= alpha;
    if (!D.escuro) E.destaque(ctx, xa, y, wd, zk, { k, seed });
    E.texto(ctx, a, x0, y, { papel, size });
    E.texto(ctx, trecho, xa, y, { papel, size, cor: D.escuro && k >= 1 ? 'destaque' : 'texto' });
    E.texto(ctx, b, xa + wd, y, { papel, size });
    if (D.escuro) E.destaque(ctx, xa, y, wd, zk, { k, seed });
    ctx.restore();
    return total;
  };

  // o carimbo (um selo com borda e texto); k de 0 a 1 é o tempo da batida: entra grande e assenta.
  // quebra: true parte o texto em duas linhas, no espaço do meio (selo mais estreito)
  E.carimbo = (ctx, texto, cx, cy, { k = 1, rot = -0.12, papel = 'alerta', size = 54, seed = 21, quebra = false } = {}) => {
    if (k <= 0) return;
    const [fam, weight, ks] = letra('titulo'), z = Math.round(size * ks), s0 = String(texto).toUpperCase();
    let ls = [s0];
    if (quebra && s0.includes(' ')) { const e = s0.split(' '), m = Math.ceil(e.length / 2); ls = [e.slice(0, m).join(' '), e.slice(m).join(' ')]; }
    const lh = z * 1.08, w = Math.max(...ls.map((l) => G.measure(ctx, l, z, fam, weight))) + 60, h = z * 0.47 + lh * ls.length;
    const esc = 1 + 0.7 * (1 - U.ease.outCubic(Math.min(1, k)));
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(esc, esc); ctx.globalAlpha *= Math.min(1, k * 3);
    const c = cor(papel === 'alerta' && D.escuro ? 'destaque' : papel);
    G.rrect(ctx, -w / 2, -h / 2, w, h, 12, { fill: null, stroke: c, lw: 7, seed, amp: D.chapado || D.planta ? 0 : 0.8 });
    G.rrect(ctx, -w / 2 + 9, -h / 2 + 9, w - 18, h - 18, 8, { fill: null, stroke: c, lw: 2.5, seed: seed + 1, amp: D.chapado || D.planta ? 0 : 0.6 });
    if (D.carimbo || ESCOLHA.nome === 'lapis') { // a tinta que falha só no anel do selo, nunca dentro, onde vai a letra
      ctx.save(); ctx.fillStyle = cor('fundo');
      for (let i = 0; i < 70; i++) {
        const u = H(seed, i, 1), lado = Math.floor(H(seed, i, 2) * 4);
        const px = lado < 2 ? -w / 2 + u * w : (lado === 2 ? -w / 2 : w / 2) + (H(seed, i, 3) - 0.5) * 8;
        const py = lado < 2 ? (lado ? h / 2 : -h / 2) + (H(seed, i, 3) - 0.5) * 8 : -h / 2 + u * h;
        ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.arc(px, py, 1 + H(seed, i, 4) * 2.2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    // a letra sai na cor do texto (Floresta no claro, Papel na lousa): Coral sobre o papel não chega a 3:1 de contraste
    const corLetra = cor('texto');
    ls.forEach((l, i) => G.text(ctx, l, 0, z * 0.36 + (i - (ls.length - 1) / 2) * lh, { size: z, fam, weight, color: corLetra, align: 'center', boil: 0, preseme_k: true }));
    ctx.restore();
  };

  // ---------- gente: o mesmo Ch.person do motor, vestido nas cores do perfil ----------
  const ROUPA = {
    agente: { skin: GENTE.peleEscura, hair: GENTE.cabelo, hairStyle: 'ponytail', outfit: 'shirt', shirt: PAL.folha, trim: PAL.marca, collar: PAL.folha, bottoms: 'pants', shorts: PAL.floresta, build: 'regular', headwear: 'cap', headwearColor: PAL.folha, shoes: PAL.noite },
    calouro: { skin: GENTE.pele, hair: GENTE.cabelo, hairStyle: 'short', outfit: 'tee', shirt: PAL.salvia, trim: PAL.folha, bottoms: 'pants', shorts: PAL.floresta, shoes: PAL.papel, build: 'slim' },
    moradora: { skin: GENTE.peleClara, hair: GENTE.cabelo, hairStyle: 'bun', outfit: 'dress', shirt: PAL.marca, trim: PAL.folha, bottoms: 'skirt', shorts: PAL.folha, build: 'regular', shoes: PAL.floresta },
  };
  E.ROUPA = ROUPA;
  E.personagem = (ctx, o = {}) => {
    const style = Object.assign({}, ROUPA[o.quem || 'calouro'] || {}, o.style || {});
    if (D.escuro) Object.assign(style, { shoes: PAL.papel }); // na lousa o sapato escuro some no chão
    return globalThis.Ch.person(ctx, Object.assign({}, o, { style }));
  };

  // ---------- objetos de UBS e de rua, desenhados com as funções acima (servem a qualquer estilo) ----------
  E.objeto = (ctx, tipo, o = {}) => {
    const f = OBJ[tipo];
    if (!f) throw new Error(`[estilos] objeto "${tipo}" não existe (${Object.keys(OBJ).join(', ')})`);
    return f(ctx, o);
  };
  const OBJ = {
    // a casa: x é a esquerda, y é o chão; numero é o texto da plaquinha; porta de 0 (fechada) a 1 (aberta)
    casa(ctx, { x = 560, y = 1360, w = 360, h = 420, numero = '', porta = 0, seed = 30 } = {}) {
      const topo = y - h, tl = 120;
      E.poligono(ctx, [[x - 34, topo + 6], [x + w / 2, topo - tl], [x + w + 34, topo + 6]], { papel: 'apoioEscuro', seed: seed + 1, sombra: false });
      E.ret(ctx, x, topo, w, h, { papel: 'superficie', r: 6, seed, sombra: false });
      // janela
      const jx = x + 40, jy = topo + 90, jw = 110, jh = 110;
      E.ret(ctx, jx, jy, jw, jh, { papel: 'apoio', r: 6, seed: seed + 2, sombra: false });
      E.linha(ctx, [[jx + jw / 2, jy + 6], [jx + jw / 2, jy + jh - 6]], { lw: 4, seed: seed + 3 });
      E.linha(ctx, [[jx + 6, jy + jh / 2], [jx + jw - 6, jy + jh / 2]], { lw: 4, seed: seed + 4 });
      // porta (abrindo: a folha estreita e aparece o escuro de dentro)
      const pw = 104, ph = 210, px = x + w - 60 - pw, py = y - ph;
      E.ret(ctx, px, py, pw, ph, { papel: 'sombra', r: 4, seed: seed + 5, sombra: false, hachura: false });
      const aberta = Math.max(0, Math.min(1, porta)), fw = pw * (1 - 0.72 * aberta);
      E.ret(ctx, px, py, fw, ph, { papel: 'apoio', r: 4, seed: seed + 6, sombra: false });
      E.circulo(ctx, px + fw - 16, py + ph * 0.55, 7, { papel: 'tinta', seed: seed + 7, sombra: false, hachura: false });
      // plaquinha do número
      if (numero) {
        const ws = E.medir(ctx, numero, { papel: 'mao', size: 40 }) + 30;
        E.ret(ctx, px + pw / 2 - ws / 2, py - 76, ws, 58, { papel: 'superficie', r: 8, seed: seed + 8, sombra: false, hachura: false });
        E.texto(ctx, numero, px + pw / 2, py - 34, { papel: 'mao', size: 40, align: 'center' });
      }
      return { porta: [px + pw / 2, py + ph / 2], parede: [x + w / 2, topo + h * 0.42], topo };
    },
    // a prancheta, com a folha e três linhas (uma marcada); x, y é o centro
    prancheta(ctx, { x, y, s = 1, rot = -0.1, seed = 40 } = {}) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
      E.ret(ctx, -46, -62, 92, 124, { papel: 'apoioEscuro', r: 8, seed, sombra: false });
      E.ret(ctx, -36, -48, 72, 102, { papel: 'superficie', r: 3, seed: seed + 1, sombra: false, hachura: false, lw: 3 });
      E.ret(ctx, -18, -70, 36, 18, { papel: 'tinta', r: 5, seed: seed + 2, sombra: false, hachura: false });
      for (let i = 0; i < 3; i++) {
        const ly = -22 + i * 26;
        E.ret(ctx, -28, ly - 8, 14, 14, { papel: null, r: 2, seed: seed + 3 + i, lw: 2.5, sombra: false });
        E.linha(ctx, [[-8, ly], [26, ly]], { lw: 3, seed: seed + 6 + i });
        if (i === 0) E.linha(ctx, [[-26, ly - 1], [-21, ly + 5], [-12, ly - 9]], { papel: 'alerta', lw: 3.5, seed: seed + 9 });
      }
      ctx.restore();
    },
    // o vaso de planta da porta
    vaso(ctx, { x, y, s = 1, seed = 50 } = {}) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.42; E.poligono(ctx, [[0, -60], [Math.cos(a - 0.2) * 46, -60 + Math.sin(a - 0.2) * 70], [Math.cos(a) * 80, -60 + Math.sin(a) * 96], [Math.cos(a + 0.2) * 46, -60 + Math.sin(a + 0.2) * 70]], { papel: i % 2 ? 'apoio' : 'apoioEscuro', seed: seed + i, sombra: false, lw: 3 }); }
      E.poligono(ctx, [[-44, -66], [44, -66], [32, 0], [-32, 0]], { papel: 'alerta', seed: seed + 9, sombra: false });
      ctx.restore();
    },
    // o sol: um círculo Marca-texto com raios (x, y é o centro)
    sol(ctx, { x, y, r = 54, t = 0, seed = 60 } = {}) {
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + t * 0.25, r0 = r + 16, r1 = r + 40;
        E.linha(ctx, [[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], { papel: D.escuro ? 'destaque' : 'tinta', lw: 5, seed: seed + i });
      }
      E.circulo(ctx, x, y, r, { papel: 'destaque', seed, sombra: false });
    },
  };
  E.OBJ = OBJ;

  globalThis.ESTILOS = E;
})();
