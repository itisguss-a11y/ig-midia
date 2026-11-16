// PRESEME · motor do tipo "X não é Y" · desenho 2/3 · A PEÇA: Longitudinalidade não é continuidade
// (texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1, no Fable, e pela conferência dos fatos)
// O que é só desta peça: os nomes dos dois lados, o trecho de cada frase no destaque, as pistas da regra e os desenhos
// de cada conceito, do caso e do fecho. Os instantes de cada coisa vêm de SCORE.momento('nome') (score.js, MOMENTOS).
(function () {
  const U = globalThis.U, E = globalThis.ESTILOS, SC = globalThis.SCORE, M = globalThis.MOLDE;
  const { prog, D } = M;
  const mo = (nome) => SC.momento(nome);
  const em = (t, nome, d = 0.3) => prog(t, mo(nome), d); // de 0 a 1 a partir do momento

  // ---------- pecinhas desta peça ----------
  // a UBS: x é a esquerda, y é o chão; s é a escala
  function ubs(ctx, x, y, s = 1, { pulso = 0, seed = 200 } = {}) {
    const w = 170 * s, h = 120 * s, z = 1 + 0.08 * pulso;
    ctx.save(); ctx.translate(x + w / 2, y); ctx.scale(z, z); ctx.translate(-(x + w / 2), -y);
    E.poligono(ctx, [[x - 16 * s, y - h + 4], [x + w / 2, y - h - 56 * s], [x + w + 16 * s, y - h + 4]], { papel: 'apoioEscuro', seed: seed + 1, sombra: false });
    E.ret(ctx, x, y - h, w, h, { papel: 'superficie', r: 6, seed, sombra: false });
    E.ret(ctx, x + w * 0.38, y - h * 0.55, w * 0.24, h * 0.55, { papel: 'apoio', r: 4, seed: seed + 2, sombra: false }); // a porta
    // a placa com a cruz da saúde (cruz simples, não a marca do SUS)
    const cx = x + w * 0.2, cy = y - h * 0.62, r = 22 * s;
    E.circulo(ctx, cx, cy, r, { papel: 'superficie', seed: seed + 3, lw: 3, sombra: false });
    E.ret(ctx, cx - r * 0.18, cy - r * 0.62, r * 0.36, r * 1.24, { papel: 'apoioEscuro', r: 2, contorno: false, sombra: false, hachura: false, seed: seed + 4 });
    E.ret(ctx, cx - r * 0.62, cy - r * 0.18, r * 1.24, r * 0.36, { papel: 'apoioEscuro', r: 2, contorno: false, sombra: false, hachura: false, seed: seed + 5 });
    E.texto(ctx, D('D11'), x + w * 0.76, y - h * 0.56, { papel: 'titulo', size: 30 * s, align: 'center' });
    ctx.restore();
    return { x, y, w, h, porta: [x + w, y - h * 0.6] };
  }
  // o coração (pré-natal), o mosquito (dengue) e o manômetro (pressão alta): x, y é o centro
  function coracao(ctx, x, y, s = 1, seed = 210) {
    const pts = [];
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2, px = 16 * Math.pow(Math.sin(a), 3), py = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
      pts.push([x + px * 1.5 * s, y + py * 1.5 * s]);
    }
    E.poligono(ctx, pts, { papel: 'alerta', seed, lw: 3, sombra: false });
  }
  function elipse(cx, cy, rx, ry, rot) {
    const pts = [];
    for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, px = Math.cos(a) * rx, py = Math.sin(a) * ry; pts.push([cx + px * Math.cos(rot) - py * Math.sin(rot), cy + px * Math.sin(rot) + py * Math.cos(rot)]); }
    return pts;
  }
  function mosquito(ctx, x, y, s = 1, { t = 0, seed = 220 } = {}) {
    const bate = Math.sin(t * 60) * 0.25; // as asas batem
    E.poligono(ctx, elipse(x - 14 * s, y - 10 * s, 20 * s, 8 * s, -0.5 - bate), { papel: 'apoio', seed: seed + 1, lw: 2.5, sombra: false, alpha: 0.9 });
    E.poligono(ctx, elipse(x + 14 * s, y - 10 * s, 20 * s, 8 * s, 0.5 + bate), { papel: 'apoio', seed: seed + 2, lw: 2.5, sombra: false, alpha: 0.9 });
    for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) E.linha(ctx, [[x + sd * 3 * s, y + (2 + i * 7) * s], [x + sd * 16 * s, y + (8 + i * 9) * s], [x + sd * 20 * s, y + (20 + i * 9) * s]], { lw: 2.5, seed: seed + 3 + i + (sd > 0 ? 5 : 0) });
    E.circulo(ctx, x, y + 6 * s, 6 * s, { papel: 'tinta', ry: 18 * s, seed: seed + 9, lw: 2, sombra: false, hachura: false });
    E.circulo(ctx, x, y - 16 * s, 6 * s, { papel: 'tinta', seed: seed + 10, lw: 2, sombra: false, hachura: false });
    E.linha(ctx, [[x, y - 20 * s], [x + 2 * s, y - 36 * s]], { lw: 2.5, seed: seed + 11 });
  }
  function manometro(ctx, x, y, s = 1, seed = 230) {
    const r = 24 * s;
    E.circulo(ctx, x, y, r, { papel: 'superficie', seed, lw: 3, sombra: false });
    for (let i = 0; i <= 4; i++) { const a = Math.PI * (0.8 + i * 0.35); E.linha(ctx, [[x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62], [x + Math.cos(a) * r * 0.86, y + Math.sin(a) * r * 0.86]], { lw: 2, seed: seed + i }); }
    const a = Math.PI * 2.1; // o ponteiro lá em cima: pressão alta
    E.linha(ctx, [[x, y], [x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78]], { papel: 'alerta', lw: 4.5, seed: seed + 8 });
    E.circulo(ctx, x, y, 3.5 * s, { papel: 'tinta', seed: seed + 9, lw: 1, sombra: false, hachura: false });
  }
  // uma parada da linha (um atendimento): o círculo e o nome embaixo; k faz ela aparecer
  function parada(ctx, x, y, nome, k, { r = 24, papel = 'superficie', size = 34, seed = 0 } = {}) {
    if (k <= 0) return;
    const z = U.ease.outBack(Math.min(1, k));
    ctx.save(); ctx.translate(x, y); ctx.scale(z, z); ctx.translate(-x, -y);
    E.circulo(ctx, x, y, r, { papel, seed: 240 + seed, lw: 5 });
    ctx.restore();
    if (nome) E.texto(ctx, nome, x, y + r + size * 1.15, { papel: 'mao', size, align: 'center', alpha: Math.min(1, k * 2) });
  }
  // o fio da longitudinalidade: uma onda de (x0, y0) a (x1), entrando até a fração k
  function fioPts(x0, x1, y0, amp = 20, per = 140) {
    const pts = [];
    for (let x = x0; x <= x1; x += 10) pts.push([x, y0 + amp * Math.sin(((x - x0) / per) * Math.PI)]);
    return pts;
  }
  function yFio(x, x0, y0, amp = 20, per = 140) { return y0 + amp * Math.sin(((x - x0) / per) * Math.PI); }
  // pontinhos que andam para a direita: o fio continua depois da tela
  function continua(ctx, x0, x1, y, t, { papel = 'apoioEscuro', alpha = 1 } = {}) {
    ctx.save(); ctx.globalAlpha *= alpha;
    for (let i = 0; i < 5; i++) {
      const u = ((t * 0.5 + i / 5) % 1), x = x0 + (x1 - x0) * u;
      ctx.globalAlpha = alpha * (1 - u) * 0.9;
      E.circulo(ctx, x, y, 7, { papel, seed: 260 + i, lw: 1, sombra: false, hachura: false, contorno: false });
    }
    ctx.restore();
  }
  // o problema: um círculo Coral com o "!" (o começo da continuidade)
  function problema(ctx, x, y, k, { r = 30, seed = 270 } = {}) {
    if (k <= 0) return;
    const z = U.ease.outBack(Math.min(1, k));
    ctx.save(); ctx.translate(x, y); ctx.scale(z, z); ctx.translate(-x, -y);
    E.circulo(ctx, x, y, r, { papel: 'alerta', seed, lw: 5 });
    E.texto(ctx, '!', x, y + r * 0.5, { papel: 'titulo', size: r * 1.3, align: 'center' });
    ctx.restore();
  }

  // ---------- os desenhos de cada cena ----------
  // continuidade (lado y): o problema, os atendimentos em sequência, a pessoa andando por eles e a linha que termina
  function continuidade(ctx, st) {
    const t = st.t, yL = 1260;
    const X = { problema: 110, consulta: 280, exame: 450, retorno: 620, alta: 790 }, FIM = 920;
    const ordem = ['problema', 'consulta', 'exame', 'retorno', 'alta'];
    // a linha cresce até a parada da vez (chega no instante do momento)
    let xFim = X.problema;
    for (let i = 1; i < ordem.length; i++) { const a = mo(ordem[i - 1]), b = mo(ordem[i]); if (t > a) xFim = U.lerp(X[ordem[i - 1]], X[ordem[i]], U.clamp((t - a) / Math.max(0.2, b - a), 0, 1)); }
    if (t > mo('alta')) xFim = U.lerp(X.alta, FIM, prog(t, mo('alta'), Math.max(0.2, mo('fim') - mo('alta'))));
    // o caminho que vem pela frente, tracejado e claro, enquanto a primeira frase define o conceito
    const kPrevia = prog(t, mo('problema') + 0.4, 0.8) * (1 - prog(t, mo('consulta') - 0.3, 0.3));
    if (kPrevia > 0) { ctx.save(); ctx.globalAlpha *= 0.4 * kPrevia; E.linha(ctx, [[X.problema, yL], [FIM, yL]], { lw: 8, tracejado: true, seed: 279 }); ctx.restore(); }
    if (t >= mo('problema')) E.linha(ctx, [[X.problema, yL], [xFim, yL]], { lw: 12, seed: 280 });
    // o fim: a barra que fecha a linha
    const kFim = em(t, 'fim', 0.25);
    if (kFim > 0) { const h = 110 * U.ease.outBack(kFim); E.ret(ctx, FIM - 10, yL - h / 2, 20, h, { papel: 'tinta', r: 4, contorno: false, sombra: false, hachura: false, seed: 281 }); }
    // as paradas (os atendimentos) e os nomes
    const o = { r: 26, size: 42 };
    parada(ctx, X.consulta, yL, D('D07'), em(t, 'consulta', 0.25), Object.assign({ seed: 1 }, o));
    parada(ctx, X.exame, yL, D('D08'), em(t, 'exame', 0.25), Object.assign({ seed: 2 }, o));
    parada(ctx, X.retorno, yL, D('D09'), em(t, 'retorno', 0.25), Object.assign({ seed: 3 }, o));
    parada(ctx, X.alta, yL, D('D10'), em(t, 'alta', 0.25), Object.assign({ seed: 4, papel: 'apoio' }, o));
    // a pessoa anda de parada em parada (chega junto com a parada), em cima da linha
    const kP = em(t, 'problema', 0.3);
    if (kP > 0) {
      let x = X.problema, anda = false;
      for (let i = 1; i < ordem.length; i++) {
        const b = mo(ordem[i]), a = b - 0.45;
        if (t >= b) x = X[ordem[i]];
        else if (t > a) { x = U.lerp(X[ordem[i - 1]], X[ordem[i]], (t - a) / 0.45); anda = true; break; } else break;
      }
      const resolvido = t >= mo('fim');
      ctx.save(); ctx.globalAlpha *= Math.min(1, kP * 2);
      E.personagem(ctx, { quem: 'calouro', x, y: yL - 4, s: 0.72, pose: anda ? 'walk' : 'stand', walk: (x / 110) % 1, look: 0.6, mouth: resolvido ? 'smile' : 'flat', seed: 290 });
      ctx.restore();
      // o problema: aparece em cima da cabeça dela e fica marcado no começo da linha
      if (x <= X.problema + 1) problema(ctx, X.problema, yL - 400, kP, { r: 40 });
      else problema(ctx, X.problema, yL, 1, { r: 30 });
    }
  }

  // longitudinalidade (lado x): a equipe na UBS, o fio que atravessa os anos até a pessoa e a volta dela à UBS
  function longitudinalidade(ctx, st) {
    const t = st.t, yC = 1430;
    const kE = em(t, 'equipe', 0.35);
    if (kE <= 0) return;
    // a agente fica atrás da quina da UBS (desenhada antes dela): dentro da área segura, sem tapar a placa
    ctx.save(); ctx.globalAlpha *= Math.min(1, kE * 2);
    E.personagem(ctx, { quem: 'agente', x: 160, y: yC, s: 0.8, pose: 'stand', look: 0.6, mouth: 'smile', seed: 310 });
    const u = ubs(ctx, 200, yC, 1.25, { seed: 300 });
    ctx.restore();
    // o fio: da UBS até a pessoa, em onda, com os anos marcados; depois dela, continua
    const x0 = u.x + u.w + 6, xP = 846, y0 = yC - 280, xF = xP - 70;
    const kF = em(t, 'fio', 2.4);
    E.linha(ctx, fioPts(x0, xF, y0, 30, 130), { papel: 'apoioEscuro', lw: 17, k: kF, seed: 320 });
    const ANOS = [[470, 'D15'], [585, 'D16'], [700, 'D17']];
    ANOS.forEach(([x, k], i) => {
      const a = prog(kF, (x - x0) / (xF - x0), 0.08);
      if (a <= 0) return;
      const y = yFio(x, x0, y0, 30, 130);
      E.circulo(ctx, x, y, 19 * U.ease.outBack(a), { papel: 'destaque', seed: 330 + i, lw: 4, sombra: false });
      E.texto(ctx, D(k), x, y - 56, { papel: 'numero', size: 42, align: 'center', alpha: a });
    });
    // a pessoa, no fim do fio (doente ou não, ela tem para onde voltar)
    const kP = em(t, 'pessoa', 0.35);
    if (kP > 0) {
      ctx.save(); ctx.globalAlpha *= Math.min(1, kP * 2);
      E.personagem(ctx, { quem: 'moradora', x: xP, y: yC, s: 0.8, pose: 'stand', look: -0.6, mouth: 'smile', seed: 340 });
      ctx.restore();
      continua(ctx, xP + 70, 1010, y0, t, { alpha: kP });
    }
    // a volta: a seta da pessoa até a UBS, por cima do fio
    const kV = em(t, 'volta', 0.7);
    if (kV > 0) E.seta(ctx, [xP - 40, y0 - 250], [u.x + u.w * 0.55, y0 - 150], { curva: 0.2, k: U.ease.inOutCubic(kV), lw: 10, cabeca: 40, seed: 350 });
  }

  // lado a lado: a continuidade em pé (de cima para baixo, termina) e a longitudinalidade (da UBS, não termina)
  function miniY(ctx, st) {
    const b = st.caixa, t = st.t, k = prog(t, st.it.t0 + 0.1, 1.0);
    const cx = b.x0 + 90, y0 = b.y0 + 60, y1 = b.y1 - 60;
    const ys = [y0, y0 + (y1 - y0) * 0.3, y0 + (y1 - y0) * 0.55, y0 + (y1 - y0) * 0.8];
    E.linha(ctx, [[cx, y0], [cx, U.lerp(y0, y1, k)]], { lw: 10, seed: 360 });
    problema(ctx, cx, ys[0], prog(k, 0, 0.15), { r: 32 });
    ['D07', 'D08', 'D09'].forEach((d, i) => {
      const a = prog(k, (ys[i + 1] - y0) / (y1 - y0) - 0.05, 0.12);
      if (a <= 0) return;
      E.circulo(ctx, cx, ys[i + 1], 24 * U.ease.outBack(a), { papel: 'superficie', seed: 361 + i, lw: 5 });
      E.texto(ctx, D(d), cx + 48, ys[i + 1] + 13, { papel: 'mao', size: 38, alpha: a });
    });
    if (k >= 1) E.ret(ctx, cx - 52, y1 - 9, 104, 18, { papel: 'tinta', r: 4, contorno: false, sombra: false, hachura: false, seed: 365 });
  }
  function miniX(ctx, st) {
    const b = st.caixa, t = st.t, k = prog(t, st.it.t0 + 0.1, 1.4);
    const cx = b.x0 + 120, yU = b.y0 + 150;
    ubs(ctx, cx - 85 * 0.9, yU, 0.9, { seed: 370 });
    const y0 = yU + 26, y1 = b.y1 + 60;
    const pts = []; for (let y = y0; y <= y1; y += 10) pts.push([cx + 22 * Math.sin(((y - y0) / 120) * Math.PI), y]);
    E.linha(ctx, pts, { papel: 'apoioEscuro', lw: 14, k, seed: 371 });
    ['D15', 'D16', 'D17'].forEach((d, i) => {
      const y = y0 + 120 + i * 120, a = prog(k, (y - y0) / (y1 - y0) - 0.03, 0.1);
      if (a <= 0) return;
      const x = cx + 22 * Math.sin(((y - y0) / 120) * Math.PI);
      E.circulo(ctx, x, y, 14, { papel: 'destaque', seed: 372 + i, lw: 3, sombra: false });
      E.texto(ctx, D(d), x + 40, y + 13, { papel: 'numero', size: 36, alpha: a });
    });
    if (k > 0.6) {
      ctx.save(); ctx.globalAlpha *= prog(k, 0.6, 0.3);
      E.personagem(ctx, { quem: 'moradora', x: cx + 205, y: b.y1 + 10, s: 0.48, pose: 'stand', look: -0.7, mouth: 'smile', seed: 380 });
      ctx.restore();
    }
  }

  // o caso: a UBS e Dona Maria no caminho da equipe; cada problema é uma parada no caminho e um ramo curto que termina
  function caso(ctx, st) {
    const t = st.t, yF = 1080;
    const kM = em(t, 'maria', 0.4);
    if (kM <= 0) return;
    const pulso = U.pulse(t, mo('mesma'), 3);
    // o caminho da equipe: da UBS para a direita, até sair da tela (aceso quando a frase diz "a mesma equipe")
    const x0 = 60, x1 = 1010;
    const kF = prog(t, mo('maria') + 0.2, 0.9);
    const kMesma = U.ease.inOutCubic(em(t, 'mesma', 0.8));
    if (kMesma > 0) E.linha(ctx, [[x0, yF], [x1, yF]], { papel: 'destaque', lw: 34, k: kMesma, seed: 419 });
    E.linha(ctx, [[x0, yF], [x1, yF]], { papel: 'apoioEscuro', lw: 13, k: kF, seed: 420 });
    ctx.save(); ctx.globalAlpha *= Math.min(1, kM * 2);
    ubs(ctx, 74, yF, 0.9, { pulso, seed: 400 });
    E.personagem(ctx, { quem: 'moradora', x: 322, y: yF - 6, s: 0.58, pose: 'stand', look: 0.5, mouth: 'smile', seed: 410 });
    ctx.restore();
    // os três problemas: o ano em cima, o desenho no nó, o nome embaixo e o ramo (a continuidade de cada um)
    // (o nome vai embaixo porque é largo: em cima ele encostava em Dona Maria)
    const EV = [
      { nome: 'prenatal', x: 470, ano: 'D15', rot: 'D12', icone: (c) => coracao(c, 470, yF + 2, 1.35) },
      { nome: 'dengue', x: 655, ano: 'D16', rot: 'D13', icone: (c) => mosquito(c, 655, yF + 6, 1.35, { t }) },
      { nome: 'pressao', x: 840, ano: 'D17', rot: 'D14', icone: (c) => manometro(c, 840, yF, 1.6) },
    ];
    const kFins = em(t, 'fins', 0.3);
    EV.forEach((ev, i) => {
      const a = em(t, ev.nome, 0.3);
      if (a <= 0) return;
      const z = U.ease.outBack(Math.min(1, a));
      ctx.save(); ctx.translate(ev.x, yF); ctx.scale(z, z); ctx.translate(-ev.x, -yF);
      E.circulo(ctx, ev.x, yF, 58, { papel: 'superficie', seed: 430 + i, lw: 6 });
      ev.icone(ctx);
      ctx.restore();
      E.texto(ctx, D(ev.ano), ev.x, yF - 84, { papel: 'numero', size: 40, align: 'center', alpha: Math.min(1, a * 2) });
      E.texto(ctx, D(ev.rot), ev.x, yF + 104, { papel: 'mao', size: 32, align: 'center', alpha: Math.min(1, a * 2) });
      // o ramo: os atendimentos daquele problema, que terminam
      const yR0 = yF + 136, yR1 = yF + 360, kR = prog(t, mo(ev.nome) + 0.3, 0.9);
      E.linha(ctx, [[ev.x, yR0], [ev.x, U.lerp(yR0, yR1, kR)]], { lw: 9, seed: 440 + i });
      [0.35, 0.7].forEach((f, j) => { if (kR >= f) E.circulo(ctx, ev.x, yR0 + (yR1 - yR0) * f, 16, { papel: 'superficie', seed: 450 + i * 2 + j, lw: 4 }); });
      const kB = prog(kFins, i * 0.25, 0.4);
      if (kB > 0) { const w = 84 * U.ease.outBack(kB); E.ret(ctx, ev.x - w / 2, yR1 - 9, w, 18, { papel: 'tinta', r: 4, contorno: false, sombra: false, hachura: false, seed: 460 + i }); }
    });
    // o caminho continua depois do último problema
    if (t >= mo('fins')) continua(ctx, 915, 1010, yF, t, { alpha: kFins });
  }

  // o fecho: em cima, a continuidade que termina; embaixo, o fio que fica com a pessoa
  function fecho(ctx, st) {
    const t = st.t, c = st.c;
    const k = prog(t, c.t0 + 0.1, 0.9);
    // a continuidade: a etiqueta, a linha curta com duas paradas e a barra do fim
    M.etiqueta(ctx, 'y', M.L, 700, { size: 34, seed: 2 });
    const yC = 900, xa = 120, xb = 640;
    E.linha(ctx, [[xa, yC], [U.lerp(xa, xb, k), yC]], { lw: 11, seed: 470 });
    problema(ctx, xa, yC, prog(k, 0, 0.1), { r: 32 });
    [300, 470].forEach((x, i) => { if (k >= (x - xa) / (xb - xa)) E.circulo(ctx, x, yC, 24, { papel: 'superficie', seed: 471 + i, lw: 5 }); });
    if (k >= 1) E.ret(ctx, xb - 10, yC - 52, 20, 104, { papel: 'tinta', r: 4, contorno: false, sombra: false, hachura: false, seed: 473 });
    // a longitudinalidade: a etiqueta, a UBS, o fio até Dona Maria e o fio que continua
    M.etiqueta(ctx, 'x', M.L, 1040, { size: 34, seed: 1 });
    const yC2 = 1440, u = ubs(ctx, 78, yC2, 1.1, { seed: 480 });
    const x0 = u.x + u.w + 6, xP = 820, yF = yC2 - 210, xF = xP - 60;
    const kF = prog(t, c.t0 + 0.3, 1.2), kFica = U.ease.inOutCubic(em(t, 'fica', 0.8));
    if (kFica > 0) E.linha(ctx, fioPts(x0, xF, yF, 22, 130), { papel: 'destaque', lw: 34, k: kFica, seed: 489 });
    E.linha(ctx, fioPts(x0, xF, yF, 22, 130), { papel: 'apoioEscuro', lw: 14, k: kF, seed: 490 });
    E.personagem(ctx, { quem: 'moradora', x: xP, y: yC2, s: 0.64, pose: 'stand', look: -0.5, mouth: 'smile', seed: 491 });
    continua(ctx, xP + 60, 1010, yFio(xF, x0, yF, 22, 130), t);
  }

  globalThis.PECA = {
    // os nomes dos dois lados (palavras do textos.txt): x é o conceito do título, y o que se confunde com ele
    NOMES: { x: 'D02', y: 'D01' },
    // o trecho de cada frase que vai no destaque (tem de estar escrito igual na frase)
    DESTAQUE: {
      1: 'não é', 2: 'por isso se confundem', 3: 'um problema', 4: 'a linha termina', 5: 'a mesma equipe',
      6: 'para onde voltar', 7: 'acompanha a pessoa', 8: 'pré-natal', 10: 'A mesma equipe', 11: 'O vínculo com a equipe ficou',
      12: 'vínculo e tempo', 13: 'sequência de atendimentos', 14: 'fica com você',
    },
    // a regra: em cada linha, as palavras-pista (do textos.txt) que levam ao nome do lado
    REGRA: [
      { lado: 'x', pistas: ['D03', 'D04'], frase: 12 },
      { lado: 'y', pistas: ['D05', 'D06'], frase: 13 },
    ],
    // o desenho de cada cena (pelo id da cena, ou pelo lado no caso dos conceitos)
    DESENHO: { y: continuidade, x: longitudinalidade, mini_y: miniY, mini_x: miniX, caso, fecho },
  };
})();
