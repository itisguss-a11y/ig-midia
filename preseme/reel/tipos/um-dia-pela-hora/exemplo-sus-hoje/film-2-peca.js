// versão 5, só para testar o motor; a peça de verdade está no chat dela
// PRESEME · tipo "um dia" · desenho 2/3 · A PEÇA: "Quantas vezes você usou o SUS hoje?"
// Só o que é desta peça: o trecho com marca-texto de cada frase, a quebra do título, as pessoas, e, de cada momento,
// o objeto do dia (DIA.CENA[id]) e o que a lente mostra (o centro dela em DIA.LENTE[id]). O resto é do molde.
(function () {
  const U = globalThis.U, G = globalThis.G, Ch = globalThis.Ch, SC = globalThis.SCORE, DIA = globalThis.DIA;
  const { C, INK, L, R, GY, HAT, D, txt, hand, wid } = DIA;

  // o trecho que leva marca-texto em cada frase (se a frase mudar e o trecho sumir, ela sai sem marca)
  Object.assign(DIA.DESTAQUE, { 1: 'SUS', 3: 'não aparece', 4: 'conferiu', 5: 'vigilância ambiental', 7: 'ferro e ácido fólico', 9: 'Reg. MS', 10: 'Ministério da Saúde', 11: 'vigilância sanitária', 13: 'vacina BCG', 15: 'gotinha', 16: '1989', 17: 'de casa em casa', 19: 'vigilância epidemiológica', 21: 'lupa preta', 22: 'vigilância sanitária', 23: 'iodo', 24: '1 em cada 70', 25: 'gordura trans', 26: 'proibida', 31: 'hospital', 32: 'não aparece' });
  // a quebra de linha dos títulos, igual à dos quadros aprovados
  Object.assign(DIA.QUEBRA, { 1: ['Quantas vezes', 'você usou o SUS', 'hoje?'], 3: ['Prevenção', 'que funciona', 'não aparece.'], 32: ['Prevenção', 'que funciona', 'não aparece.'] });
  // as pessoas: o calouro (protagonista, o do molde), a criança que ele foi e o agente
  DIA.GENTE.crianca = Object.assign({}, DIA.GENTE.protagonista, { shirt: C.marca, trim: C.folha, bottoms: 'shorts', shorts: C.folha });
  DIA.GENTE.agente = { skin: C.peleEscura, hair: C.cabelo, hairStyle: 'short', outfit: 'shirt', shirt: C.folha, trim: C.marca, collar: C.folha, bottoms: 'pants', shorts: '#5C6B55', build: 'regular', headwear: 'cap', headwearColor: C.folha, shoes: C.noite };
  const caps = { papel: 'titulo' };

  // ---------- 06h10 · a água da torneira ----------
  DIA.LENTE.agua = [L + 610, 1120];
  DIA.CENA.agua = (ctx, st) => {
    DIA.chao(ctx);
    const hat = { color: 'rgba(23,64,44,0.18)', gap: 10 };
    G.rrect(ctx, L + 30, 990, 72, GY - 990, 22, { fill: C.branco, stroke: INK, lw: 6, seed: 51, hatch: hat });
    G.rrect(ctx, L + 30, 975, 330, 72, 30, { fill: C.branco, stroke: INK, lw: 6, seed: 52, hatch: hat });
    G.rrect(ctx, L + 290, 1010, 70, 84, 16, { fill: C.branco, stroke: INK, lw: 6, seed: 53, hatch: hat });
    G.rrect(ctx, L + 96, 940, 90, 40, 12, { fill: C.folha, stroke: INK, lw: 5, seed: 57 });
    const gx = L + 325, gy = GY - 4;
    G.line(ctx, [[gx, 1098], [gx, 1250]], { color: C.salvia, lw: 24, seed: 54, amp: 2 });
    G.poly(ctx, [[gx - 128, gy - 250], [gx + 128, gy - 250], [gx + 98, gy], [gx - 98, gy]], { fill: C.branco, stroke: INK, lw: 7, seed: 55 });
    G.poly(ctx, [[gx - 116, gy - 160], [gx + 116, gy - 160], [gx + 91, gy - 9], [gx - 91, gy - 9]], { fill: C.salvia, stroke: null, lw: 0, seed: 56 });
    // a lente sobre o copo: o tubo de ensaio e a lista conferida
    const [lx, ly] = DIA.LENTE.agua;
    DIA.lente(ctx, lx, ly, 225, (c) => {
      c.save(); c.translate(lx - 78, ly + 4); c.rotate(-0.3);
      G.rrect(c, -37, -153, 74, 276, 37, { fill: C.papel, stroke: null, lw: 0, seed: 60 }); G.rrect(c, -30, -146, 60, 262, 30, { fill: C.folha, stroke: null, lw: 0, seed: 61 });
      G.rrect(c, -27, -10, 54, 122, 27, { fill: C.marca, stroke: null, lw: 0, seed: 62 });
      G.line(c, [[-46, -150], [46, -150]], { color: C.papel, lw: 9, seed: 63 });
      c.restore();
      G.rrect(c, lx + 22, ly - 128, 150, 200, 14, { fill: C.papel, stroke: C.papel, lw: 4, seed: 64 });
      G.rrect(c, lx + 64, ly - 144, 66, 30, 8, { fill: C.folha, stroke: null, lw: 0, seed: 65 });
      for (let i = 0; i < 3; i++) {
        const yy = ly - 74 + i * 50;
        G.line(c, [[lx + 40, yy], [lx + 54, yy + 14], [lx + 78, yy - 16]], { color: C.folha, lw: 8, seed: 66 + i });
        G.line(c, [[lx + 94, yy], [lx + 154, yy]], { color: INK, lw: 6, seed: 70 + i });
      }
      hand(c, D('D14'), lx - 10, ly + 168, { size: 58, color: C.marca, align: 'center' });
    }, { k: st.kLente });
  };

  // ---------- 06h30 · o pão: ferro e ácido fólico na farinha ----------
  DIA.LENTE.pao = [R - 215, 1080];
  DIA.CENA.pao = (ctx, st) => {
    DIA.chao(ctx);
    const fx = L + 6, fw = 250, fh = 410, fy = GY - fh;
    G.rrect(ctx, fx, fy, fw, fh, 14, { fill: C.branco, stroke: INK, lw: 7, seed: 501, hatch: HAT });
    G.line(ctx, [[fx, fy + 44], [fx + fw, fy + 44]], { color: INK, lw: 4, seed: 502 });
    G.rrect(ctx, fx + 20, fy + 86, fw - 40, 150, 10, { fill: C.marca, stroke: INK, lw: 4, seed: 503 });
    G.decor(() => { // dizeres impressos no objeto: a conferência de texto do motor (qa) não os julga
      txt(ctx, 'FARINHA', fx + fw / 2, fy + 150, Object.assign({ size: 42, align: 'center' }, caps));
      txt(ctx, 'DE TRIGO', fx + fw / 2, fy + 204, Object.assign({ size: 42, align: 'center' }, caps));
      txt(ctx, 'enriquecida com ferro', fx + fw / 2, fy + 284, { size: 20, align: 'center' });
      txt(ctx, 'e ácido fólico', fx + fw / 2, fy + 310, { size: 20, align: 'center' });
      txt(ctx, '1 kg', fx + fw / 2, fy + 372, { size: 28, align: 'center' });
    });
    const px = L + 440, py = GY - 14;
    G.ellipse(ctx, px, py, 190, 30, { fill: C.branco, stroke: INK, lw: 6, seed: 505 });
    G.ellipse(ctx, px, py - 80, 150, 72, { fill: C.miolo, stroke: INK, lw: 7, seed: 506, hatch: { color: 'rgba(7,38,24,0.12)', gap: 12 } });
    for (let i = -1; i <= 1; i++) G.line(ctx, [[px + i * 72 - 20, py - 122], [px + i * 72 + 20, py - 62]], { color: INK, lw: 6, seed: 508 + i });
    const [lx, ly] = DIA.LENTE.pao;
    DIA.lente(ctx, lx, ly, 200, (c) => {
      const graos = [[-96, -100, 0.5], [44, -124, -0.4], [-14, -44, 0.2], [108, -50, 0.7], [-124, -6, -0.6]];
      graos.forEach(([dx, dy, a], i) => {
        c.save(); c.translate(lx + dx, ly + dy); c.rotate(a);
        G.ellipse(c, 0, 0, 24, 40, { fill: C.papel, stroke: null, lw: 0, seed: 510 + i });
        G.line(c, [[0, -28], [0, 28]], { color: C.miolo, lw: 4, seed: 520 + i });
        c.restore();
        G.ellipse(c, lx + dx + 16, ly + dy - 12, 12, 12, { fill: i % 2 ? C.coral : C.marca, stroke: null, lw: 0, seed: 530 + i });
      });
      const zf = Math.min(DIA.caber(c, D('D15'), 56, 215), DIA.caber(c, D('D16'), 56, 215)); // as duas cabem dentro do círculo da lente
      G.ellipse(c, lx - 112, ly + 70, 13, 13, { fill: C.marca, stroke: null, lw: 0, seed: 541 });
      hand(c, D('D15'), lx - 86, ly + 88, { size: zf, color: C.marca });
      G.ellipse(c, lx - 112, ly + 128, 13, 13, { fill: C.coral, stroke: null, lw: 0, seed: 542 });
      hand(c, D('D16'), lx - 86, ly + 146, { size: zf, color: C.papel });
    }, { k: st.kLente });
  };

  // ---------- 07h00 · a caixa do remédio: Reg. MS (a caixa é um objeto pronto do molde) ----------
  DIA.LENTE.remedio = [R - 235, 1090];
  DIA.CENA.remedio = (ctx, st) => {
    DIA.chao(ctx);
    const bx = L + 10, bw = 520, bh = 330, by = GY - bh - 6;
    DIA.OBJ.caixa(ctx, { x: bx, w: bw, h: bh, cor: 'folha', linhas: ['ANALGÉSICO', '500 mg'] });
    G.decor(() => txt(ctx, '20 comprimidos · uso oral · uso adulto', bx + 26, by + 268, { size: 20 }));
    G.rrect(ctx, bx + 26, by + 286, 96, 24, 12, { fill: C.coral, stroke: INK, lw: 3, seed: 605 });
    G.rrect(ctx, bx + bw - 262, by + 80, 248, 44, 8, { fill: C.branco, stroke: INK, lw: 3, seed: 606 });
    G.decor(() => txt(ctx, 'Reg. MS 1.0000.0000', bx + bw - 250, by + 111, { size: 22 }));
    const [lx, ly] = DIA.LENTE.remedio;
    DIA.lente(ctx, lx, ly, 200, (c) => {
      txt(c, 'Reg. MS', lx, ly - 64, Object.assign({ size: 78, color: C.papel, align: 'center' }, caps));
      txt(c, '1.0000.0000', lx, ly - 14, { size: 34, color: C.salvia, align: 'center' });
      c.save(); c.translate(lx, ly + 92); c.rotate(-0.1);
      // o visto e a palavra centrados juntos, medidos na letra do estilo (a de carimbo é mais larga que a de lápis)
      const rot = D('D17'); let zs = 60;
      while (zs > 36 && wid(c, rot, zs, 'mao') > 210) zs -= 4;
      const x0 = -(62 + wid(c, rot, zs, 'mao')) / 2;
      G.rrect(c, -158, -46, 316, 92, 14, { stroke: C.marca, lw: 7, seed: 611 });
      G.line(c, [[x0, 2], [x0 + 18, 22], [x0 + 48, -22]], { color: C.marca, lw: 10, seed: 612 });
      hand(c, rot, x0 + 62, 20, { size: zs, color: C.marca });
      c.restore();
    }, { k: st.kLente });
  };

  // ---------- 07h20 · a marquinha da BCG no braço direito ----------
  DIA.LENTE.braco = [L + 330, 1085];
  DIA.CENA.braco = (ctx, st) => {
    DIA.chao(ctx);
    const px = R - 300, s = 1.25;
    Ch.person(ctx, { x: px, y: GY, pose: 'stand', s, eyes: 'normal', mouth: 'smile', look: -0.8, lookY: 0.3, style: DIA.GENTE.protagonista });
    G.ellipse(ctx, px - 92, GY - 384, 9, 8, { fill: C.peleClara, stroke: C.peleEscura, lw: 3, seed: 700 });
    const [lx, ly] = DIA.LENTE.braco;
    DIA.lente(ctx, lx, ly, 205, (c) => {
      c.fillStyle = C.pele; c.fillRect(lx - 220, ly - 220, 440, 440);
      G.poly(c, [[lx - 230, ly - 230], [lx + 230, ly - 230], [lx + 230, ly - 100], [lx - 230, ly - 136]], { fill: C.salvia, stroke: INK, lw: 7, seed: 701 });
      G.line(c, [[lx - 230, ly - 156], [lx + 230, ly - 120]], { color: C.folha, lw: 8, seed: 702 });
      G.ellipse(c, lx - 6, ly - 22, 52, 44, { fill: C.peleClara, stroke: C.peleEscura, lw: 6, seed: 703 });
      G.ellipse(c, lx, ly - 24, 25, 20, { stroke: C.peleEscura, lw: 4, seed: 704 });
      const linhas = DIA.quebrar(c, D('D18'), 40, 300, 'mao'), lz = DIA.zz(40, 'mao');
      if (linhas.length) {
        G.rrect(c, lx - 166, ly + 50, 332, 30 + linhas.length * lz, 16, { fill: C.papel, stroke: INK, lw: 5, seed: 705 });
        linhas.forEach((l, i) => hand(c, l, lx, ly + 50 + lz + i * lz, { size: 40, align: 'center', color: INK }));
      }
    }, { k: st.kLente, lado: -1 });
  };

  // ---------- na infância · a gotinha ----------
  DIA.LENTE.gotinha = [R - 215, 1085];
  DIA.CENA.gotinha = (ctx, st) => {
    DIA.chao(ctx);
    const cx = L + 280, s = 0.84;
    Ch.person(ctx, { x: cx, y: GY, pose: 'stand', s, eyes: 'happy', mouth: 'open', lookY: -0.9, style: DIA.GENTE.crianca });
    const hx = cx + 6, hy = 930;
    G.line(ctx, [[-40, hy - 60], [hx - 34, hy]], { color: INK, lw: 84, seed: 721, amp: 0.6 });
    G.line(ctx, [[-40, hy - 60], [hx - 38, hy]], { color: C.branco, lw: 70, seed: 722, amp: 0.6 });
    G.ellipse(ctx, hx - 8, hy + 2, 38, 31, { fill: C.peleEscura, stroke: INK, lw: 5, seed: 723 });
    ctx.save(); ctx.translate(hx + 24, hy + 4); ctx.rotate(0.35);
    G.rrect(ctx, -22, -46, 44, 64, 12, { fill: C.branco, stroke: INK, lw: 5, seed: 724 });
    G.rrect(ctx, -22, -24, 44, 22, 0, { fill: C.coral, stroke: INK, lw: 3, seed: 725 });
    G.poly(ctx, [[-12, 18], [12, 18], [4, 44], [-4, 44]], { fill: C.branco, stroke: INK, lw: 4, seed: 726 });
    ctx.restore();
    // a gota cai do frasco até a boca, uma a cada duas batidas
    const p = (((st.t - st.c.t0) / (2 * SC.BEAT)) % 1 + 1) % 1, gy0 = hy + 62, gy1 = GY - 368 * s;
    ctx.save(); ctx.globalAlpha *= U.clamp((1 - p) / 0.15, 0, 1);
    G.ellipse(ctx, hx + 8, gy0 + (gy1 - gy0) * p * p, 9, 12, { fill: C.coral, stroke: INK, lw: 3, seed: 727 });
    ctx.restore();
    const [lx, ly] = DIA.LENTE.gotinha;
    DIA.lente(ctx, lx, ly, 200, (c) => {
      G.rrect(c, lx - 134, ly - 150, 268, 216, 16, { fill: C.papel, stroke: null, lw: 0, seed: 731 });
      G.rrect(c, lx - 134, ly - 150, 268, 56, 12, { fill: C.coral, stroke: null, lw: 0, seed: 732 });
      for (const dx of [-72, 72]) G.rrect(c, lx + dx - 8, ly - 172, 16, 44, 8, { fill: C.papel, stroke: INK, lw: 3, seed: 733 + dx });
      txt(c, D('D19'), lx, ly + 30, { size: 96, align: 'center', color: INK, papel: 'numero' });
      hand(c, D('D20'), lx, ly + 138, { size: 62, color: C.marca, align: 'center' });
    }, { k: st.kLente });
  };

  // ---------- 07h30 · o agente de combate às endemias e o mapa dos casos ----------
  DIA.LENTE.agente = [R - 205, 1060];
  DIA.CENA.agente = (ctx, st) => {
    DIA.chao(ctx);
    const gy = GY;
    G.rrect(ctx, L - 90, gy - 290, 250, 290, 4, { fill: C.branco, stroke: INK, lw: 6, seed: 81, hatch: { color: 'rgba(23,64,44,0.16)', gap: 12 } });
    for (let i = 0; i < 5; i++) G.rrect(ctx, L + 176 + i * 46, gy - 320, 24, 320, 8, { fill: C.folha, stroke: INK, lw: 4, seed: 82 + i });
    G.line(ctx, [[L + 166, gy - 240], [L + 402, gy - 240]], { color: INK, lw: 8, seed: 88 });
    const vx = R - 150;
    for (const [dx, dy] of [[-44, -230], [0, -275], [46, -225]]) G.poly(ctx, [[vx, gy - 112], [vx + dx - 24, gy + dy + 70], [vx + dx, gy + dy], [vx + dx + 24, gy + dy + 70]], { fill: C.folha, stroke: INK, lw: 5, seed: 93 + dx });
    G.poly(ctx, [[vx - 74, gy - 124], [vx + 74, gy - 124], [vx + 52, gy - 16], [vx - 52, gy - 16]], { fill: C.coral, stroke: INK, lw: 6, seed: 91 });
    G.rrect(ctx, vx - 98, gy - 20, 196, 24, 10, { fill: C.branco, stroke: INK, lw: 5, seed: 92 });
    Ch.person(ctx, { x: L + 290, y: gy, pose: 'stand', s: 1.12, eyes: 'normal', mouth: 'smile', look: 0.6, handR: [L + 395, gy - 250], style: DIA.GENTE.agente });
    G.rrect(ctx, L + 372, gy - 322, 92, 124, 10, { fill: C.papel, stroke: INK, lw: 5, seed: 96 });
    G.rrect(ctx, L + 398, gy - 334, 40, 22, 6, { fill: C.folha, stroke: INK, lw: 3, seed: 97 });
    for (let i = 0; i < 3; i++) G.line(ctx, [[L + 388, gy - 284 + i * 28], [L + 448, gy - 284 + i * 28]], { color: INK, lw: 4, seed: 98 + i });
    const [lx, ly] = DIA.LENTE.agente;
    DIA.lente(ctx, lx, ly, 200, (c) => {
      for (let i = -3; i <= 3; i++) { G.line(c, [[lx - 240, ly + i * 70 + 18], [lx + 240, ly + i * 70 - 10]], { color: C.folha, lw: 6, seed: 100 + i }); G.line(c, [[lx + i * 74 - 12, ly - 240], [lx + i * 74 + 12, ly + 240]], { color: C.folha, lw: 6, seed: 110 + i }); }
      const pts = [[-36, -40], [10, -68], [48, -30], [-8, 0], [36, 26], [-54, 30], [62, -76], [-96, -100], [120, 60], [-140, 96], [140, -130]];
      pts.forEach(([dx, dy], i) => G.ellipse(c, lx + dx, ly + dy, 14, 14, { fill: i < 7 ? C.coral : C.marca, stroke: null, lw: 0, seed: 120 + i }));
      G.ellipse(c, lx + 2, ly - 20, 108, 96, { stroke: C.marca, lw: 7, seed: 131 });
      hand(c, D('D21'), lx - 4, ly + 150, { size: 60, color: C.marca, align: 'center' });
    }, { k: st.kLente });
  };

  // ---------- 10h00 · o lanche: a lupa preta do rótulo ----------
  DIA.LENTE.lanche = [R - 190, 1085];
  DIA.CENA.lanche = (ctx, st) => {
    DIA.chao(ctx);
    const gy = GY;
    G.ellipse(ctx, L + 60, gy - 20, 44, 22, { fill: C.miolo, stroke: INK, lw: 5, seed: 360 });
    G.ellipse(ctx, L + 60, gy - 26, 27, 11, { fill: C.branco, stroke: INK, lw: 3, seed: 370 });
    const px = L + 150, pw = 330, ph = 470, py = gy - ph;
    G.rrect(ctx, px, py, pw, ph, 22, { fill: C.coral, stroke: INK, lw: 7, seed: 201, hatch: { color: 'rgba(7,38,24,0.10)', gap: 12 } });
    G.poly(ctx, [[px, py + 34], [px + pw, py + 34]], { stroke: INK, lw: 4, seed: 202, closed: false });
    G.poly(ctx, [[px, py + ph - 34], [px + pw, py + ph - 34]], { stroke: INK, lw: 4, seed: 203, closed: false });
    G.decor(() => {
      txt(ctx, 'BISCOITO', px + pw / 2, py + 330, Object.assign({ size: 46, color: C.branco, align: 'center' }, caps));
      txt(ctx, 'RECHEADO', px + pw / 2, py + 384, Object.assign({ size: 46, color: C.branco, align: 'center' }, caps));
    });
    G.ellipse(ctx, px + pw / 2, py + 230, 62, 44, { fill: C.miolo, stroke: INK, lw: 5, seed: 204 });
    G.ellipse(ctx, px + pw / 2, py + 222, 40, 22, { fill: C.branco, stroke: INK, lw: 3, seed: 205 });
    // o aviso da frente do pacote, como é na vida real: lupa + ALTO EM
    const ax = px + 34, ay = py + 62, aw = 262, ah = 96;
    G.rrect(ctx, ax, ay, aw, ah, 12, { fill: C.branco, stroke: C.noite, lw: 5, seed: 206, amp: 0.6 });
    G.ellipse(ctx, ax + 40, ay + 42, 21, 21, { stroke: C.noite, lw: 8, seed: 207, amp: 0.5 });
    G.line(ctx, [[ax + 55, ay + 58], [ax + 72, ay + 78]], { color: C.noite, lw: 10, seed: 208, amp: 0.4 });
    G.rrect(ctx, ax + 84, ay + 8, aw - 92, 34, 6, { fill: C.noite, stroke: null, lw: 0, seed: 209, amp: 0.4 });
    G.rrect(ctx, ax + 84, ay + 48, aw - 92, 40, 6, { fill: C.noite, stroke: null, lw: 0, seed: 210, amp: 0.4 });
    G.decor(() => {
      txt(ctx, 'ALTO EM', ax + 84 + (aw - 92) / 2, ay + 34, Object.assign({ size: 25, color: C.branco, align: 'center' }, caps));
      txt(ctx, 'AÇÚCAR', ax + 84 + (aw - 92) / 2, ay + 70, Object.assign({ size: 20, color: C.branco, align: 'center' }, caps));
      txt(ctx, 'ADICIONADO', ax + 84 + (aw - 92) / 2, ay + 86, Object.assign({ size: 15, color: C.branco, align: 'center' }, caps));
    });
    const [lx, ly] = DIA.LENTE.lanche;
    DIA.lente(ctx, lx, ly, 205, (c) => {
      G.line(c, [[lx - 150, ly + 96], [lx + 150, ly + 96]], { color: C.papel, lw: 6, seed: 221 });
      G.rrect(c, lx - 118, ly + 16, 62, 80, 6, { fill: C.salvia, stroke: null, lw: 0, seed: 222 });
      G.rrect(c, lx - 30, ly - 118, 62, 214, 6, { fill: C.coral, stroke: null, lw: 0, seed: 223 });
      G.rrect(c, lx + 58, ly + 40, 62, 56, 6, { fill: C.salvia, stroke: null, lw: 0, seed: 224 });
      c.save(); c.setLineDash([16, 12]); c.strokeStyle = C.marca; c.lineWidth = 7; c.beginPath(); c.moveTo(lx - 170, ly - 40); c.lineTo(lx + 170, ly - 40); c.stroke(); c.restore();
      hand(c, D('D22'), lx + 92, ly - 54, { size: 46, color: C.marca, align: 'center' });
      hand(c, D('D23'), lx + 2, ly + 146, { size: 46, color: C.papel, align: 'center' });
    }, { k: st.kLente });
  };

  // ---------- 12h00 · o sal da cozinha: iodo contra o bócio ----------
  DIA.LENTE.sal = [R - 215, 1080];
  DIA.CENA.sal = (ctx, st) => {
    DIA.chao(ctx);
    const sx = L + 10, sw = 270, sh = 360, sy = GY - sh;
    G.rrect(ctx, sx, sy, sw, sh, 18, { fill: C.branco, stroke: INK, lw: 7, seed: 801, hatch: HAT });
    G.rrect(ctx, sx, sy + 46, sw, 150, 0, { fill: C.folha, stroke: INK, lw: 5, seed: 802 });
    G.rrect(ctx, sx + 54, sy + 268, sw - 108, 52, 26, { fill: C.marca, stroke: INK, lw: 4, seed: 803 });
    G.decor(() => {
      txt(ctx, 'SAL', sx + sw / 2, sy + 158, Object.assign({ size: 100, color: C.branco, align: 'center' }, caps));
      txt(ctx, 'REFINADO', sx + sw / 2, sy + 246, Object.assign({ size: 34, align: 'center', color: INK }, caps));
      txt(ctx, 'IODADO', sx + sw / 2, sy + 306, Object.assign({ size: 30, align: 'center', color: INK }, caps));
    });
    const hx = L + 410, hy = GY;
    G.poly(ctx, [[hx - 54, hy - 156], [hx + 54, hy - 156], [hx + 66, hy - 6], [hx - 66, hy - 6]], { fill: C.branco, stroke: INK, lw: 6, seed: 805 });
    G.poly(ctx, [[hx - 51, hy - 92], [hx + 51, hy - 92], [hx + 60, hy - 12], [hx - 60, hy - 12]], { fill: C.papel, stroke: null, lw: 0, seed: 806 });
    G.rrect(ctx, hx - 60, hy - 204, 120, 54, 22, { fill: C.salvia, stroke: INK, lw: 6, seed: 807 });
    for (const dx of [-24, 0, 24]) G.ellipse(ctx, hx + dx, hy - 178, 5, 5, { fill: INK, stroke: null, lw: 0, seed: 810 + dx });
    const [lx, ly] = DIA.LENTE.sal;
    DIA.lente(ctx, lx, ly, 200, (c) => {
      const x = lx - 46;
      G.rrect(c, x - 150, ly + 104, 300, 150, 60, { fill: C.marca, stroke: null, lw: 0, seed: 811 });
      G.rrect(c, x - 36, ly - 6, 72, 130, 22, { fill: C.pele, stroke: null, lw: 0, seed: 812 });
      G.ellipse(c, x, ly - 82, 80, 88, { fill: C.pele, stroke: null, lw: 0, seed: 813 });
      G.poly(c, [[x - 84, ly - 92], [x - 62, ly - 166], [x + 8, ly - 180], [x + 70, ly - 156], [x + 84, ly - 96], [x + 44, ly - 132], [x - 30, ly - 126]], { fill: C.cabelo, stroke: null, lw: 0, seed: 814 });
      for (const dx of [-28, 28]) G.ellipse(c, x + dx, ly - 78, 7, 9, { fill: C.noite, stroke: null, lw: 0, seed: 815 + dx });
      G.line(c, [[x - 15, ly - 38], [x, ly - 32], [x + 15, ly - 38]], { color: C.noite, lw: 5, seed: 817 });
      G.ellipse(c, x, ly + 62, 62, 46, { fill: C.peleClara, stroke: C.coral, lw: 6, seed: 818 });
      G.line(c, [[lx + 128, ly + 6], [x + 74, ly + 50]], { color: C.marca, lw: 7, seed: 819 });
      G.line(c, [[x + 100, ly + 22], [x + 74, ly + 50], [x + 110, ly + 52]], { color: C.marca, lw: 7, seed: 820 });
      hand(c, D('D24'), lx + 112, ly - 12, { size: 60, color: C.marca, align: 'center' });
    }, { k: st.kLente });
  };

  // ---------- 16h00 · o salgadinho: a gordura trans que saiu ----------
  DIA.LENTE.salgadinho = [R - 215, 1085];
  DIA.CENA.salgadinho = (ctx, st) => {
    DIA.chao(ctx);
    const bx = L + 100, bw = 320, bh = 440, by = GY - bh - 4;
    G.rrect(ctx, bx, by, bw, bh, 26, { fill: C.marca, stroke: INK, lw: 7, seed: 901, hatch: HAT });
    G.line(ctx, [[bx, by + 38], [bx + bw, by + 38]], { color: INK, lw: 4, seed: 902 });
    G.line(ctx, [[bx, by + bh - 38], [bx + bw, by + bh - 38]], { color: INK, lw: 4, seed: 903 });
    for (let i = 1; i < 10; i++) { G.line(ctx, [[bx + i * 32, by + 6], [bx + i * 32, by + 32]], { color: INK, lw: 3, seed: 904 + i }); G.line(ctx, [[bx + i * 32, by + bh - 32], [bx + i * 32, by + bh - 6]], { color: INK, lw: 3, seed: 920 + i }); }
    G.ellipse(ctx, bx + bw / 2, by + 176, 108, 84, { fill: C.branco, stroke: INK, lw: 5, seed: 940 });
    const tri = (x, y, a, seed) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); G.poly(ctx, [[-30, 22], [30, 22], [0, -30]], { fill: C.miolo, stroke: INK, lw: 4, seed }); ctx.restore(); };
    tri(bx + bw / 2 - 40, by + 168, 0.3, 941); tri(bx + bw / 2 + 30, by + 150, -0.5, 942); tri(bx + bw / 2 + 4, by + 206, 2.2, 943);
    G.decor(() => {
      txt(ctx, 'SALGADINHO', bx + bw / 2, by + 330, Object.assign({ size: 40, align: 'center', color: INK }, caps));
      hand(ctx, 'sabor queijo', bx + bw / 2, by + 378, { size: 44, align: 'center', color: INK });
    });
    tri(L + 40, GY - 22, 0.2, 944); tri(L + 470, GY - 22, -0.3, 945);
    const [lx, ly] = DIA.LENTE.salgadinho;
    DIA.lente(ctx, lx, ly, 200, (c) => {
      G.rrect(c, lx - 146, ly - 140, 292, 204, 14, { fill: C.papel, stroke: null, lw: 0, seed: 951 });
      hand(c, 'ingredientes', lx - 122, ly - 90, { size: 48, color: INK });
      G.line(c, [[lx - 122, ly - 60], [lx + 96, ly - 60]], { color: INK, lw: 5, seed: 952 });
      G.line(c, [[lx - 122, ly - 30], [lx + 44, ly - 30]], { color: INK, lw: 5, seed: 953 });
      txt(c, D('D25'), lx - 122, ly + 30, { size: 36, color: INK });
      if (D('D25')) G.line(c, [[lx - 132, ly + 20], [lx - 112 + wid(c, D('D25'), 36), ly + 16]], { color: C.coral, lw: 9, seed: 954 });
      hand(c, D('D26'), lx, ly + 136, { size: 62, color: C.marca, align: 'center' });
    }, { k: st.kLente });
  };
})();
