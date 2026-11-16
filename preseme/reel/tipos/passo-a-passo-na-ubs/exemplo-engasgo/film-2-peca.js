// PRESEME · Na UBS, e agora? · exemplo: engasgo no adulto · desenho 2/3 · o que é só desta peça
// O chat 1 (Fable) escreve este arquivo para cada peça: os destaques do texto, o paciente e o desenho de cada gesto.
// O molde (film-1-molde.js) põe em volta o texto, o trilho do protocolo, a conta e os cartões.
(function () {
  const U = globalThis.U, G = globalThis.G, Ch = globalThis.Ch, B = globalThis.UBS, TX = globalThis.TEXTOS;
  const { C, INK, L, R, CX, GY, D, txt, hand } = B;

  // o trecho de cada frase que leva marca-texto (se a frase mudar e o trecho sumir, ela sai sem marca)
  const DESTAQUE = { 1: 'engasgou', 2: 'não consegue tossir', 3: 'agora', 4: '192', 5: 'logo no começo', 6: 'Deixe tossir', 7: 'incentivar a tosse', 8: '5 golpes nas costas', 9: 'engasgo grave', 10: '5 compressões no abdome', 11: 'diretriz de 2025', 12: '5 e 5', 13: 'compressões no peito', 14: 'objeto visível', 15: 'no peito', 16: 'não no abdome', 17: 'Fique com ele', 19: 'Grátis', 20: 'ponto de referência', 21: 'quem ainda tosse', 22: 'incentivar a tosse', 23: '5 golpes e 5 compressões' };

  // o paciente desta peça
  const RAIMUNDO = { skin: C.pele, hair: C.grisalho, hairStyle: 'short', facialHair: 'mustache', outfit: 'shirt', shirt: C.coral, trim: C.noite, collar: C.coral, bottoms: 'pants', shorts: '#5C6B55', build: 'regular', shoes: C.noite };

  // ---------- o lugar: a sala da casa visitada ----------
  function sala(ctx) {
    // parede, janela e o chão
    G.rrect(ctx, R - 300, 960, 250, 210, 14, { fill: C.salvia, stroke: INK, lw: 6, seed: 101, hatch: { color: 'rgba(23,64,44,0.12)', gap: 12 } });
    G.line(ctx, [[R - 175, 960], [R - 175, 1170]], { color: INK, lw: 5, seed: 102 });
    G.line(ctx, [[R - 300, 1065], [R - 50, 1065]], { color: INK, lw: 5, seed: 103 });
    B.chao(ctx, GY, C.salvia);
  }
  function mesa(ctx, x, comida = true) {
    G.rrect(ctx, x - 150, GY - 250, 300, 30, 8, { fill: C.folha, stroke: INK, lw: 6, seed: 111 });
    G.line(ctx, [[x - 120, GY - 222], [x - 120, GY]], { color: INK, lw: 10, seed: 112 });
    G.line(ctx, [[x + 120, GY - 222], [x + 120, GY]], { color: INK, lw: 10, seed: 113 });
    if (comida) {
      G.ellipse(ctx, x, GY - 262, 78, 18, { fill: C.branco, stroke: INK, lw: 5, seed: 114 });
      G.ellipse(ctx, x - 14, GY - 270, 30, 10, { fill: C.miolo, stroke: INK, lw: 3, seed: 115 });
      G.ellipse(ctx, x + 22, GY - 268, 18, 9, { fill: C.folha, stroke: INK, lw: 3, seed: 116 });
    }
  }
  function cadeira(ctx, x) {
    G.rrect(ctx, x - 70, GY - 150, 140, 20, 6, { fill: C.folha, stroke: INK, lw: 5, seed: 121 });
    G.line(ctx, [[x - 60, GY - 132], [x - 60, GY]], { color: INK, lw: 8, seed: 122 });
    G.line(ctx, [[x + 60, GY - 132], [x + 60, GY]], { color: INK, lw: 8, seed: 123 });
    G.line(ctx, [[x - 66, GY - 150], [x - 66, GY - 330]], { color: INK, lw: 9, seed: 124 });
  }
  // a nuvem da tosse: sai da boca, sobe e some
  function tosse(ctx, x, y, t, t0, seed) {
    const d = t - t0;
    if (d < 0 || d > 0.9) return;
    const k = d / 0.9;
    ctx.save(); ctx.globalAlpha *= 1 - k;
    for (let i = 0; i < 3; i++) G.ellipse(ctx, x + 40 + i * 34 + k * 70, y - 10 - i * 14 - k * 40, 22 + i * 6, 16 + i * 4, { fill: C.branco, stroke: INK, lw: 4, seed: seed + i });
    ctx.restore();
  }
  function riscos(ctx, x, y, k, seed) { // as linhas de impacto do golpe
    if (k <= 0.05) return;
    ctx.save(); ctx.globalAlpha *= k;
    for (let i = 0; i < 3; i++) { const a = -2.2 + i * 0.6; G.line(ctx, [[x + Math.cos(a) * 40, y + Math.sin(a) * 40], [x + Math.cos(a) * (70 + 30 * k), y + Math.sin(a) * (70 + 30 * k)]], { color: C.coral, lw: 8, seed: seed + i }); }
    ctx.restore();
  }
  function telefone(ctx, x, y, k = 1, seed = 140) { // a tela da ligação, com o número
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    G.rrect(ctx, -95, -150, 190, 300, 30, { fill: INK, stroke: INK, lw: 5, seed });
    G.rrect(ctx, -78, -126, 156, 230, 16, { fill: C.marca, stroke: null, lw: 0, seed: seed + 1 });
    txt(ctx, D('D02'), 0, 10, { size: 78, align: 'center' });
    G.ellipse(ctx, 0, 72, 26, 26, { fill: C.salvia, stroke: INK, lw: 4, seed: seed + 2 });
    ctx.restore();
  }
  function objeto(ctx, x, y, s = 1, seed = 150) { // o pedaço de comida
    G.poly(ctx, [[x - 22 * s, y - 6 * s], [x - 4 * s, y - 20 * s], [x + 20 * s, y - 10 * s], [x + 16 * s, y + 14 * s], [x - 14 * s, y + 16 * s]], { fill: C.miolo, stroke: INK, lw: 4, seed });
  }

  // ---------- as cenas desta peça ----------
  const GESTO = {};
  // a situação: o primeiro quadro já é o problema (o gancho dos 3 s). Seu Raimundo, com as mãos no pescoço; a comida cai
  // do garfo e bate no chão aos 0,3 s (o "baque"); o "!" salta em 1,2 s (o "pop"); a ACS e o estudante chegam correndo.
  // Na [02], o close (PECA.FOCO.situacao) fecha nele.
  B.CENA.situacao = (ctx, st) => {
    const t = st.t, u = st.u, AB = globalThis.SCORE.ABERTURA;
    sala(ctx); cadeira(ctx, 640); mesa(ctx, 760);
    const entra = (1 - U.ease.outCubic(U.clamp(u / 0.7, 0, 1))) * 380;
    Ch.person(ctx, { x: L + 90 - entra, y: GY, pose: 'stand', s: 1.0, eyes: 'wide', mouth: 'o', brows: 'worried', look: 0.8, style: B.ACS });
    Ch.person(ctx, { x: L + 290 - entra, y: GY, pose: 'stand', s: 1.02, eyes: 'wide', mouth: 'o', brows: 'worried', look: 0.8, style: B.ESTUDANTE });
    const tre = Math.sin(t * 38) * 4;
    const pr = { x: 650 + tre, y: GY - 150, s: 1.0 };
    Ch.person(ctx, Object.assign({}, pr, { pose: 'sit', eyes: 'wide', mouth: 'o', brows: 'worried', look: -0.4, sweat: 1, handR: B.mao(pr, 676, 1062), handL: B.mao(pr, 628, 1062), style: RAIMUNDO })); // as mãos no pescoço
    const d = Math.max(0, u);
    objeto(ctx, 730, GY - 262 + Math.min(230, 0.5 * (230 * 2 / (AB.queda * AB.queda)) * d * d), 0.8, 151); // cai e para no chão em AB.queda
    if (st.i === 0 && u >= AB.alerta) {
      const k = U.ease.outBack(U.clamp((u - AB.alerta) / 0.3, 0, 1));
      ctx.save(); ctx.translate(770, 930); ctx.scale(k, k); // baixo o bastante para caber no close médio
      G.ellipse(ctx, 0, 0, 54, 54, { fill: C.coral, stroke: INK, lw: 6, seed: 152 });
      txt(ctx, '!', 0, 30, { size: 84, align: 'center', color: INK }); // tinta sobre Coral (papel sobre Coral não chega a 3:1)
      ctx.restore();
    }
  };

  // passo 1 · alguém liga 192: a ACS liga; o estudante já está com seu Raimundo
  GESTO.ligar = (ctx, st) => {
    sala(ctx);
    const t = st.t, u = st.u;
    Ch.person(ctx, { x: L + 110, y: GY, pose: 'stand', s: 1.0, eyes: 'normal', mouth: 'open', gesture: 'phone', look: 0.4, style: B.ACS });
    telefone(ctx, L + 330, 1040, U.ease.outBack(U.clamp((u - 0.3) / 0.35, 0, 1)));
    const tre = Math.sin(t * 38) * 4;
    Ch.person(ctx, { x: 560, y: GY, pose: 'stand', s: 1.0, eyes: 'normal', mouth: 'flat', brows: 'worried', look: 0.6, style: B.ESTUDANTE, handR: B.mao({ x: 560, y: GY, s: 1.0 }, 690, 1110) });
    Ch.person(ctx, { x: 760 + tre, y: GY, pose: 'stand', s: 1.02, eyes: 'wide', mouth: 'o', brows: 'worried', sweat: 1, look: -0.5, style: RAIMUNDO });
  };
  // passo 2 · tosse com força e fala: deixe tossir (o estudante incentiva; a tosse sai a cada duas batidas)
  GESTO.tosse = (ctx, st) => {
    sala(ctx);
    const t = st.t, BEAT = globalThis.SCORE.BEAT;
    const fase = ((t - st.c.t0) / (2 * BEAT)) % 1, tossindo = fase < 0.35;
    Ch.person(ctx, { x: 360, y: GY, pose: 'stand', s: 1.0, eyes: 'happy', mouth: 'open', gesture: 'thumbsUp', look: 0.7, style: B.ESTUDANTE });
    Ch.person(ctx, { x: 640, y: GY, pose: 'stand', s: 1.02, sy: tossindo ? 0.97 : 1, eyes: tossindo ? 'closed' : 'normal', mouth: tossindo ? 'open' : 'wavy', look: 0.3, style: RAIMUNDO });
    const k0 = Math.floor((t - st.c.t0) / (2 * BEAT));
    for (let k = Math.max(0, k0 - 1); k <= k0; k++) tosse(ctx, 680, 960, t, st.c.t0 + k * 2 * BEAT, 160 + (k % 3) * 5);
  };
  // passo 3 · 5 golpes nas costas: o estudante atrás; a mão bate a cada batida da conta e o corpo dele dá um tranco
  GESTO.golpes = (ctx, st) => {
    sala(ctx);
    const t = st.t, c = st.c, b = B.batida(c, t);
    const descanso = [430, 1010], golpe = [520, 1112];
    const mao = [U.lerp(descanso[0], golpe[0], b), U.lerp(descanso[1], golpe[1], b)];
    Ch.person(ctx, { x: 620, y: GY, pose: 'stand', s: 1.02, rot: 0.2, sx: 1 + 0.04 * b, sy: 1 - 0.03 * b, eyes: 'wide', mouth: 'o', brows: 'worried', sweat: 1, look: 0.6, style: RAIMUNDO });
    Ch.person(ctx, { x: 330, y: GY, pose: 'stand', s: 1.04, eyes: 'normal', mouth: 'flat', brows: 'determined', look: 0.6, handR: B.mao({ x: 330, y: GY, s: 1.04 }, mao[0], mao[1]), style: B.ESTUDANTE });
    riscos(ctx, golpe[0] + 6, golpe[1] - 4, b, 170);
  };
  // passo 4 · 5 compressões no abdome: os braços do estudante em volta da barriga; a cada batida, para dentro e para cima
  GESTO.compressoes = (ctx, st) => {
    sala(ctx);
    const t = st.t, c = st.c, b = B.batida(c, t);
    const pe = { x: 470, y: GY, s: 1.04 };
    Ch.person(ctx, Object.assign({}, pe, { pose: 'stand', eyes: 'normal', mouth: 'flat', brows: 'determined', look: 0.6, handR: B.mao(pe, 575, 1190), handL: B.mao(pe, 520, 1195), style: B.ESTUDANTE }));
    Ch.person(ctx, { x: 600, y: GY, pose: 'stand', s: 1.02, rot: 0.06, sy: 1 - 0.035 * b, eyes: 'wide', mouth: 'o', brows: 'worried', sweat: 1, look: 0.6, style: RAIMUNDO });
    // o abraço por trás, visto de frente: os dois antebraços na altura da barriga dele e o punho no meio, acima do umbigo
    const fx = 606 - 6 * b, fy = 1196 - 24 * b;
    G.limb(ctx, [[510, 1175], [560, fy + 6], [fx - 20, fy + 4]], { color: C.branco, lw: 28, outline: INK });
    G.limb(ctx, [[700, 1175], [655, fy + 10], [fx + 22, fy + 8]], { color: C.branco, lw: 28, outline: INK });
    G.ellipse(ctx, fx, fy, 30, 26, { fill: C.peleClara, stroke: INK, lw: 5, seed: 181 });
    B.seta(ctx, fx + 150, fy + 70, fx + 70, fy - 10 - 20 * b, { seed: 182 });
  };
  // passo 5 · repita 5 e 5: o ciclo desenhado; no fim, o objeto sai
  GESTO.ciclo = (ctx, st) => {
    B.chao(ctx, GY, C.salvia);
    const t = st.t, cy = 1130, r = 190;
    // as duas metades do ciclo
    G.ellipse(ctx, CX - 210, cy, 120, 120, { fill: C.papel, stroke: INK, lw: 6, seed: 191 });
    G.ellipse(ctx, CX + 210, cy, 120, 120, { fill: C.papel, stroke: INK, lw: 6, seed: 192 });
    txt(ctx, '5', CX - 210, cy + 44, { size: 120, align: 'center' });
    txt(ctx, '5', CX + 210, cy + 44, { size: 120, align: 'center' });
    hand(ctx, D('D03'), CX - 210, cy + 170, { size: 40, align: 'center' });
    hand(ctx, D('D04'), CX + 210, cy + 170, { size: 40, align: 'center' });
    // as setas que giram: uma volta a cada 4 batidas
    const giro = ((t - st.c.t0) / (4 * globalThis.SCORE.BEAT)) * Math.PI * 2;
    for (const s of [0, Math.PI]) {
      const a0 = giro + s, a1 = a0 + 1.1;
      const pts = []; for (let k = 0; k <= 12; k++) { const a = a0 + (a1 - a0) * (k / 12); pts.push([CX + Math.cos(a) * r, cy + Math.sin(a) * r * 0.55]); }
      G.line(ctx, pts, { color: C.coral, lw: 12, seed: 193 });
    }
    // o objeto sai no "pop" (1,5 batida antes do fim da frase)
    const tp = st.c.itens[0].t1 - 1.5 * globalThis.SCORE.BEAT;
    if (t >= tp) { const d = t - tp; objeto(ctx, CX + d * 160, cy - 260 - d * 260 + d * d * 300, 1.3, 194); B.mark(ctx, CX - 60, cy - 330, 120, 20, 195); }
  };
  // desmaiou · compressões no peito: ele deitado; as mãos do estudante entram por cima e descem a cada batida
  GESTO.rcp = (ctx, st) => {
    B.chao(ctx, GY, C.salvia);
    const t = st.t, BEAT = globalThis.SCORE.BEAT;
    const fase = ((t - st.c.t0) / (BEAT / 2)) % 1, desce = Math.max(0, Math.sin(fase * Math.PI));
    // o estudante ajoelhado atrás dele (sentado no chão), os braços retos até o peito; desce duas vezes por batida
    // ele deitado de costas, os pés à direita; o estudante ajoelhado do outro lado, atrás do corpo, com as mãos no peito
    const px = 500, py = GY - 104 + 12 * desce;
    const pe = { x: px, y: GY - 40 + 6 * desce, s: 1.0 };
    Ch.person(ctx, Object.assign({}, pe, { pose: 'floor', eyes: 'normal', mouth: 'flat', brows: 'determined', look: -0.3, handR: B.mao(pe, px + 8, py - 6), handL: B.mao(pe, px - 8, py - 6), style: B.ESTUDANTE }));
    Ch.person(ctx, { x: 820, y: GY - 70, pose: 'stand', s: 1.05, rot: -Math.PI / 2, eyes: 'closed', mouth: 'flat', style: RAIMUNDO });
    G.ellipse(ctx, px, py, 42, 26, { fill: C.peleClara, stroke: INK, lw: 5, seed: 201 }); // as mãos, uma sobre a outra
    G.line(ctx, [[px - 30, py - 4], [px + 30, py - 4]], { color: INK, lw: 4, seed: 207 });
    const f14 = st.c.itens.find((i) => i.n === 14);
    if (!f14 || t < f14.t0) hand(ctx, D('D05'), px + 180, py - 150, { size: 46 }); // na [14] o close vai para a boca e o rótulo sai
    // [14] a lente na boca: olhar se tem objeto visível antes das ventilações
    if (f14 && t >= f14.t0) {
      const k = U.ease.outBack(U.clamp((t - f14.t0) / 0.35, 0, 1));
      const lx = 300, ly = 1090; // perto da cabeça dele
      ctx.save(); ctx.translate(lx, ly); ctx.scale(k, k);
      G.line(ctx, [[60, 60], [118, 118]], { color: INK, lw: 30, seed: 202 });
      G.ellipse(ctx, 0, 0, 100, 100, { fill: C.papel, stroke: INK, lw: 14, seed: 203 });
      G.ellipse(ctx, 0, 6, 54, 34, { fill: C.coral, stroke: INK, lw: 5, seed: 204 });
      objeto(ctx, 4, 4, 0.9, 205);
      ctx.restore();
    }
  };
  // casos especiais: a grávida [15] e o bebê [16], um cartão por plano, no centro. Na troca, o cartão novo empurra o velho
  // para fora (0,35 s) e tem outra cor: é o corte da cena.
  GESTO.especiais = (ctx, st) => {
    const t = st.t, f16 = st.c.itens.find((i) => i.n === 16), bebe = f16 && t >= f16.t0;
    const k = f16 ? U.ease.inOutCubic(U.clamp((t - f16.t0) / 0.35, 0, 1)) : 0, desliza = 1150; // quanto o cartão anda para sair
    const cartao = (x, y, w, h, seed, fill = C.branco) => G.rrect(ctx, x, y, w, h, 30, { fill, stroke: INK, lw: 6, seed });
    const plano = (cx, dx) => { ctx.save(); ctx.translate(CX + dx, 1150); ctx.scale(1.25, 1.25); ctx.translate(-cx, -1150); };
    // grávida
    if (k < 1) {
    plano(L + 210, -k * desliza);
    cartao(L, 870, 420, 560, 211);
    hand(ctx, D('D06'), L + 210, 935, { size: 50, align: 'center' });
    Ch.person(ctx, { x: L + 210, y: 1390, pose: 'stand', s: 0.92, eyes: 'normal', mouth: 'flat', style: { skin: C.peleEscura, hair: C.cabelo, hairStyle: 'long', outfit: 'dress', shirt: C.salvia, build: 'regular', shoes: C.noite } });
    G.ellipse(ctx, L + 212, 1236, 66, 56, { fill: C.salvia, stroke: INK, lw: 5, seed: 212 });
    G.ellipse(ctx, L + 210, 1150, 32, 32, { fill: C.marca, stroke: INK, lw: 5, seed: 213 });
    txt(ctx, '5', L + 210, 1165, { size: 38, align: 'center' });
    ctx.restore();
    }
    // bebê
    if (bebe) {
      plano(R - 210, (1 - k) * desliza);
      cartao(R - 420, 870, 420, 560, 221, C.salvia);
      hand(ctx, D('D07'), R - 210, 935, { size: 50, align: 'center' });
      // de bruços no antebraço: 5 golpes nas costas
      const bx = R - 240, by = 1060;
      G.limb(ctx, [[R - 390, by + 62], [bx, by + 58], [R - 70, by + 40]], { color: C.pele, lw: 40, outline: INK }); // o antebraço de quem segura
      G.rrect(ctx, bx - 70, by - 4, 140, 60, 30, { fill: C.branco, stroke: INK, lw: 5, seed: 222 }); // o corpo do bebê
      G.ellipse(ctx, bx + 96, by + 26, 40, 36, { fill: C.peleClara, stroke: INK, lw: 5, seed: 223 }); // a cabeça
      G.ellipse(ctx, bx - 14, by - 38, 26, 26, { fill: C.marca, stroke: INK, lw: 5, seed: 224 }); txt(ctx, '5', bx - 14, by - 25, { size: 32, align: 'center' });
      // de barriga para cima: 5 compressões no peito; a barriga, riscada
      const cx2 = R - 230, cy2 = 1270;
      G.rrect(ctx, cx2 - 80, cy2 - 30, 160, 64, 30, { fill: C.branco, stroke: INK, lw: 5, seed: 226 });
      G.ellipse(ctx, cx2 + 108, cy2, 40, 36, { fill: C.peleClara, stroke: INK, lw: 5, seed: 227 });
      G.ellipse(ctx, cx2 + 30, cy2 - 64, 26, 26, { fill: C.marca, stroke: INK, lw: 5, seed: 228 }); txt(ctx, '5', cx2 + 30, cy2 - 51, { size: 32, align: 'center' });
      B.xis(ctx, cx2 - 40, cy2 + 2, 26, 1, 225);
      ctx.restore();
    }
  };
  // a equipe: o objeto saiu, o estudante fica com ele; na [18], a ambulância chega
  GESTO.samu = (ctx, st) => {
    sala(ctx); cadeira(ctx, 760);
    const t = st.t, f18 = st.c.itens.find((i) => i.n === 18);
    Ch.person(ctx, { x: 770, y: GY - 150, pose: 'sit', s: 1.0, eyes: 'normal', mouth: 'flat', look: -0.6, style: RAIMUNDO });
    Ch.person(ctx, { x: 560, y: GY, pose: 'stand', s: 1.02, eyes: 'normal', mouth: 'smile', look: 0.6, handR: B.mao({ x: 560, y: GY, s: 1.02 }, 700, 1150), style: B.ESTUDANTE });
    if (f18 && t >= f18.t0) {
      const k = U.ease.outCubic(U.clamp((t - f18.t0) / 1.2, 0, 1)), x = -470 + k * (470 + L), y = GY - 20; // para em L: a palavra SAMU fica na área segura
      ctx.save(); ctx.translate(x, y); ctx.scale(0.82, 0.82); ctx.translate(-x, -y);
      G.rrect(ctx, x, y - 250, 400, 220, 30, { fill: C.branco, stroke: INK, lw: 6, seed: 231 });
      G.rrect(ctx, x + 270, y - 300, 120, 70, 14, { fill: C.branco, stroke: INK, lw: 5, seed: 232 });
      G.rrect(ctx, x, y - 150, 400, 34, 4, { fill: C.coral, stroke: null, lw: 0, seed: 233 });
      ctx.save(); ctx.globalAlpha *= U.clamp((x + 33 - (L - 40)) / 40, 0, 1); // a palavra só aparece dentro da área segura
      txt(ctx, D('D01'), x + 40, y - 168, { size: 54 });
      ctx.restore();
      for (const wx of [x + 80, x + 320]) G.ellipse(ctx, wx, y - 22, 44, 44, { fill: INK, stroke: INK, lw: 5, seed: 234 + wx % 7 });
      const pisca = Math.sin(t * 18) > 0;
      G.rrect(ctx, x + 300, y - 330, 44, 30, 8, { fill: pisca ? C.coral : C.papel, stroke: INK, lw: 4, seed: 236 });
      ctx.restore();
    }
  };
  // o 192: na [20], o pino no mapa e um ponto de referência (a árvore da esquina)
  GESTO.ligue = (ctx, st) => {
    if (st.i < 1) return;
    const k = U.ease.outBack(U.clamp((st.t - st.it.t0) / 0.35, 0, 1));
    ctx.save(); ctx.translate(R - 120, 470); ctx.scale(k, k);
    G.ellipse(ctx, 0, 0, 92, 92, { fill: C.papel, stroke: C.papel, lw: 6, seed: 241 });
    G.line(ctx, [[-70, 30], [70, 30]], { color: INK, lw: 6, seed: 242 }); G.line(ctx, [[0, -70], [0, 70]], { color: INK, lw: 6, seed: 243 });
    G.ellipse(ctx, -36, -10, 26, 26, { fill: C.folha, stroke: INK, lw: 4, seed: 244 });
    G.poly(ctx, [[34, -12], [56, -50], [78, -12]], { fill: C.coral, stroke: INK, lw: 4, seed: 245 });
    ctx.restore();
  };
  // cuidado · tapa em quem ainda tosse: a mão vai, e o X Coral cai em cima; na [22], a mão volta e o estudante incentiva
  GESTO.tapaErrado = (ctx, st) => {
    sala(ctx);
    const t = st.t, BEAT = globalThis.SCORE.BEAT, f22 = st.c.itens.find((i) => i.n === 22), depois = f22 && t >= f22.t0;
    const fase = ((t - st.c.t0) / (2 * BEAT)) % 1, tossindo = fase < 0.35;
    Ch.person(ctx, { x: 640, y: GY, pose: 'stand', s: 1.02, sy: tossindo ? 0.97 : 1, eyes: tossindo ? 'closed' : 'normal', mouth: 'open', look: 0.3, style: RAIMUNDO });
    const tx = st.c.itens[0].t0 + 2 * BEAT; // o X (o "pop" do score.js)
    Ch.person(ctx, { x: 360, y: GY, pose: 'stand', s: 1.0, eyes: depois ? 'happy' : 'normal', mouth: depois ? 'open' : 'flat', look: 0.6, gesture: depois ? 'thumbsUp' : null, handR: depois ? undefined : B.mao({ x: 360, y: GY, s: 1.0 }, 525, t < tx ? 1010 : 1050), style: B.ESTUDANTE });
    const k0 = Math.floor((t - st.c.t0) / (2 * BEAT));
    for (let k = Math.max(0, k0 - 1); k <= k0; k++) tosse(ctx, 680, 960, t, st.c.t0 + k * 2 * BEAT, 250 + (k % 3) * 5);
    if (!depois && t >= tx) B.xis(ctx, 530, 1030, 70, U.ease.outBack(U.clamp((t - tx) / 0.25, 0, 1)), 260);
  };
  // o fecho: os três juntos, ele bem; o trilho completo em cima
  GESTO.fecho = (ctx, st) => {
    sala(ctx);
    Ch.person(ctx, { x: L + 110, y: GY, pose: 'stand', s: 1.0, eyes: 'happy', mouth: 'smile', gesture: 'phone', style: B.ACS });
    Ch.person(ctx, { x: 420, y: GY, pose: 'stand', s: 1.02, eyes: 'happy', mouth: 'smile', gesture: 'thumbsUp', look: 0.6, style: B.ESTUDANTE });
    Ch.person(ctx, { x: 680, y: GY, pose: 'stand', s: 1.02, eyes: 'happy', mouth: 'smile', look: -0.5, style: RAIMUNDO });
  };

  // o close da 2.ª frase de cada cena: [x, y, zoom] do detalhe que a frase explica (sem entrada, a cena não fecha)
  // y na altura das cabeças: assim o close cresce para baixo e não sobe no texto
  const FOCO = { situacao: [650, 1030, 1.4], ligar: [400, 1000, 1.3], tosse: [660, 990, 1.35], golpes: [600, 950, 1.35], compressoes: [600, 950, 1.35], rcp: [360, 1200, 1.6], tapaErrado: [520, 990, 1.3] };

  globalThis.PECA = { DESTAQUE, RAIMUNDO, GESTO, FOCO };
})();
