// PRESEME · carrossel · desenho 1 · a base (modelo de carrossel do motor): as medidas da lâmina 4:5 (1080 × 1350), o
// texto que se quebra e diminui sozinho até caber na caixa dele (e avisa quando nem a letra menor cabe), o destaque e
// os textos do textos.js. Tudo é desenhado com o kit de estilos (globalThis.ESTILOS), então a mesma lâmina sai em
// qualquer dos seis estilos. Todo texto da tela vem do textos.js.
(function () {
  const U = globalThis.U, G = globalThis.G, SC = globalThis.SCORE, TX = globalThis.TEXTOS, E = globalThis.ESTILOS;
  const W = G.W, H = G.H;
  // margens: a grade do perfil (recorte 3:4) corta 34 px de cada lado e a área segura do motor começa a 54 px; a arte
  // fica a 80 px. Em cima à direita, até 116 px, fica o contador "1/8" do Instagram: nada de texto nem desenho forte ali.
  const M = 80;
  const L = M, R = W - M, CX = W / 2, TOP = 136, BOT = H - 96;
  const CONTADOR = { x: W - 150, y: 0, w: 150, h: 120 };
  const NB = '\u00a0'; // espaço que não quebra: o trecho do destaque não se parte em duas linhas
  const D = (k) => TX[k] || '';
  // o trecho que vai no destaque, por frase: vem do score.js da peça (DESTAQUE: { 3: 'casos leves' }); sumiu da frase, sai sem
  const DESTAQUE = Object.assign({}, SC.DESTAQUE || {});

  const kz = (papel) => E.letra(papel)[2];
  const larg = (ctx, s, papel, size) => E.medir(ctx, String(s).split(NB).join(' '), { papel, size });
  // palavra com hífen que sozinha não cabe na largura (como "(mosquito-palha)" numa célula estreita) pode quebrar depois
  // do hífen; as outras palavras não se partem
  function quebrar(ctx, s, papel, size, maxW) {
    const toks = [];
    String(s).split(' ').forEach((w, i) => {
      const partes = w.includes('-') && larg(ctx, w, papel, size) > maxW ? w.split(/(?<=-)/) : [w];
      partes.forEach((p, j) => toks.push({ p, sp: i > 0 && j === 0 }));
    });
    const out = []; let cur = '';
    for (const { p, sp } of toks) {
      const t = cur ? cur + (sp ? ' ' : '') + p : p;
      if (cur && larg(ctx, t, papel, size) > maxW) { out.push(cur); cur = p; } else cur = t;
    }
    if (cur) out.push(cur);
    return out;
  }
  // mesma quantidade de linhas, com as linhas de tamanho parecido e sem palavrinha solta no fim da linha
  const FRACA = new Set(['a', 'o', 'as', 'os', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'e', 'em', 'no', 'na', 'nos', 'nas', 'que', 'é', 'à', 'às', 'ao', 'para', 'por', 'com', 'se', 'seu', 'sua', 'esta', 'este', 'essa', 'esse', 'só', 'até']);
  function equilibrar(ctx, s, papel, size, maxW) {
    const base = quebrar(ctx, s, papel, size, maxW), k = base.length;
    if (k < 2) return base;
    let melhor = base, nota = Infinity;
    for (let w = maxW; w > maxW * 0.5; w -= 16) {
      const ls = quebrar(ctx, s, papel, size, w);
      if (ls.length !== k) break;
      const ws = ls.map((l) => larg(ctx, l, papel, size));
      const fracas = ls.slice(0, -1).filter((l) => FRACA.has(l.split(/[  ]/).pop().toLowerCase().replace(/[.,;:!?]/g, ''))).length;
      const n = Math.max(...ws) - Math.min(...ws) + 400 * fracas;
      if (n < nota) { nota = n; melhor = ls; }
    }
    return melhor;
  }

  // uma linha com um trecho no destaque. Na cor 'texto' do estilo, o destaque é o do kit (marca-texto atrás da letra);
  // em outra cor de letra (cartão escuro, por exemplo), o trecho sai na corTrecho (Marca-texto, só em fundo escuro)
  function linhaCom(ctx, s, trecho, x, y, { papel, size, align, cor, corTrecho = 'marca', seed = 7, alpha = 1 }) {
    if (!trecho || !s.includes(trecho)) { E.texto(ctx, s, x, y, { papel, size, align, cor, alpha }); return; }
    if (cor === 'texto') { E.textoComDestaque(ctx, s, trecho, x, y, { papel, size, align, seed, alpha }); return; }
    const total = larg(ctx, s, papel, size), x0 = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
    const i = s.indexOf(trecho), a = s.slice(0, i), b = s.slice(i + trecho.length);
    const xa = x0 + larg(ctx, a, papel, size), wd = larg(ctx, trecho, papel, size);
    E.texto(ctx, a, x0, y, { papel, size, cor, alpha });
    E.texto(ctx, trecho, xa, y, { papel, size, cor: corTrecho, alpha });
    E.texto(ctx, b, xa + wd, y, { papel, size, cor, alpha });
  }

  // o aviso de texto que não coube: vai para o console do navegador, o comando laminas recolhe e o conferir trava
  const rot = (k) => (String(k)[0] === 'D' ? String(k) : String(k).padStart(2, '0'));
  function naoCabe(k, cx, z) {
    const n = globalThis.PRESEME && globalThis.PRESEME.LAM ? String(globalThis.PRESEME.LAM.n).padStart(2, '0') : '??';
    console.log(`PRESEME-NAOCABE lâmina ${n}: o texto [${rot(k)}] não coube em ${Math.round(cx.w)} × ${Math.round(cx.h)} px nem com a letra ${z}`);
  }

  // bloco(ctx, k, caixa, op): o texto k do textos.js dentro da caixa { x, y, w, h }. Tenta os tamanhos de letra do maior
  // para o menor (op.sizes) e usa o primeiro em que ele cabe na largura e na altura (e em op.maxLinhas). Se nem o menor
  // cabe, desenha no menor e avisa. op: papel ('titulo', 'corpo', 'mao', 'numero'), align ('left', 'center', 'right'),
  // valign ('top', 'middle', 'bottom'), lh (entrelinha), cor (papel de cor do kit ou nome da paleta), destaque (o
  // trecho; sem ele, vale PRESEME.DESTAQUE[k]). Devolve { size, linhas, alt, y0, y1 } (y1 = onde o texto termina).
  function bloco(ctx, k, cx, o = {}) {
    const s = TX[k];
    if (!s) return { size: 0, linhas: 0, alt: 0, y0: cx.y, y1: cx.y };
    const papel = o.papel || 'corpo', sizes = o.sizes || [56, 52, 48, 44, 40, 36], lh = o.lh || 1.26;
    const align = o.align || 'left', cor = o.cor || 'texto';
    const trecho = o.destaque !== undefined ? o.destaque : DESTAQUE[k];
    const s1 = trecho && s.includes(trecho) ? s.replace(trecho, trecho.split(' ').join(NB)) : s;
    let pick = null;
    for (const z of sizes) {
      const ls = equilibrar(ctx, s1, papel, z, cx.w);
      const alt = (ls.length - 1) * z * kz(papel) * lh + z * kz(papel) * 1.02;
      if (ls.every((l) => larg(ctx, l, papel, z) <= cx.w + 0.5) && alt <= cx.h + 0.5 && (!o.maxLinhas || ls.length <= o.maxLinhas)) { pick = { z, ls, alt }; break; }
    }
    if (!pick) {
      const z = sizes[sizes.length - 1], ls = equilibrar(ctx, s1, papel, z, cx.w);
      pick = { z, ls, alt: (ls.length - 1) * z * kz(papel) * lh + z * kz(papel) * 1.02 };
      naoCabe(k, cx, z);
    }
    const { z, ls, alt } = pick, zz = z * kz(papel), passo = zz * lh;
    let top = cx.y;
    if (o.valign === 'middle') top += (cx.h - alt) / 2; else if (o.valign === 'bottom') top += cx.h - alt;
    const x = align === 'center' ? cx.x + cx.w / 2 : align === 'right' ? cx.x + cx.w : cx.x;
    ls.forEach((l0, i) => {
      const l = l0.split(NB).join(' ');
      linhaCom(ctx, l, trecho && l.includes(trecho) ? trecho : null, x, top + zz * 0.8 + i * passo, { papel, size: z, align, cor, corTrecho: o.corTrecho, seed: 31 + i * 3 + String(k).length, alpha: o.alpha ?? 1 });
    });
    return { size: z, linhas: ls.length, alt, y0: top, y1: top + alt };
  }
  // o título grande (capa, fecho)
  const titulo = (ctx, k, cx, o = {}) => bloco(ctx, k, cx, Object.assign({ papel: 'titulo', sizes: [108, 100, 92, 84, 76, 68, 60], lh: 1.12 }, o));
  // a linha da fonte, pequena e discreta (no rodapé da lâmina)
  const fonte = (ctx, k, cx, o = {}) => bloco(ctx, k, cx, Object.assign({ papel: 'corpo', sizes: [32, 30], lh: 1.2, maxLinhas: 2 }, o));

  globalThis.PRESEME = { C: E.PAL, W, H, M, L, R, CX, TOP, BOT, CONTADOR, D, DESTAQUE, larg, quebrar, equilibrar, linhaCom, bloco, titulo, fonte, MOLDE: {}, DESENHO: {}, LAM: null };
})();
