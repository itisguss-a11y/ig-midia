// PRESEME · motor do tipo "antes e depois" · desenho 2/3 · A PEÇA · exemplo: a pólio no Brasil antes e depois da vacinação
// (texto e desenho de exemplo escritos pelo Opus; a peça de verdade passa pelo chat 1 e pela conferência dos fatos)
// O lugar é uma rua com quatro casas, a mesma nos três tempos:
//   1975 (antes): uma criança de muleta entre as outras (a pólio pode deixar a perna sem força para sempre);
//   1980 (ação): a mesa da campanha de vacinação na calçada, a faixa e a fila de crianças, cada uma ganhando o sinal
//                de vacinada; a criança de muleta, mais velha, olha de longe;
//   hoje (depois): as crianças brincando de bola, a árvore muito maior e o sol.
// Os instantes de cada coisa vêm de SCORE.momento('nome') (score.js, MOMENTOS).
(function () {
  const U = globalThis.U, E = globalThis.ESTILOS, SC = globalThis.SCORE, A = globalThis.AD;
  const { prog, D } = A;
  const { mo, em, pessoa, gente, chao, casa, arvore, virus, etiqueta, barra, textoNoLugar } = A.KIT;
  const CHAO = 520, PE = 612; // o chão do lugar (a calçada) e onde ficam os pés das pessoas, em unidades do lugar

  // ---------- peças do desenho ----------
  // a muleta, na mão direita de quem está em (x, y) com escala s (o desenho é em unidades da pessoa, como o Ch.person)
  function muleta(ctx, x, y, s, seed) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    E.linha(ctx, [[64, -300], [118, 0]], { lw: 16, seed });
    E.linha(ctx, [[76, -296], [128, -6]], { lw: 10, seed: seed + 1 });
    E.ret(ctx, 40, -316, 64, 22, { papel: 'apoioEscuro', r: 10, seed: seed + 2, sombra: false, hachura: false });
    E.linha(ctx, [[84, -170], [104, -168]], { lw: 14, seed: seed + 3 });
    ctx.restore();
  }
  // o sinal de vacinada em cima de uma cabeça: o círculo do destaque com o visto
  function vacinado(ctx, x, y, k = 1, seed = 300) {
    if (k <= 0) return;
    const z = U.ease.outBack(Math.min(1, k));
    ctx.save(); ctx.translate(x, y); ctx.scale(z, z);
    E.circulo(ctx, 0, 0, 24, { papel: 'destaque', seed, sombra: false, hachura: false, lw: 4 });
    E.linha(ctx, [[-11, 1], [-3, 10], [12, -10]], { lw: 6, seed: seed + 1 });
    ctx.restore();
  }
  // a bola (r: o raio), quicando entre dois pontos
  function bola(ctx, x, y, r = 22, seed = 360) {
    E.circulo(ctx, x, y, r, { papel: 'alerta', seed, sombra: false, hachura: false });
  }
  // as quatro casas da rua e o chão (iguais nos três tempos: é o mesmo lugar)
  function rua(ctx) {
    chao(ctx, CHAO, { seed: 611 });
    casa(ctx, { x: 20, y: CHAO, s: 0.6, seed: 30 });
    casa(ctx, { x: 285, y: CHAO, s: 0.6, seed: 40 });
    casa(ctx, { x: 560, y: CHAO, s: 0.6, seed: 50 });
    casa(ctx, { x: 830, y: CHAO, s: 0.6, seed: 60 });
  }
  const crianca = (i, o = {}) => gente(i, Object.assign({ build: 'slim' }, o));

  // ---------- o lugar nos três tempos ----------
  function lugar(ctx, info) {
    const t = info.t, tempo = info.tempo;
    if (tempo === 'depois') E.objeto(ctx, 'sol', { x: 1000, y: 96, r: 40, t, seed: 61 });
    rua(ctx);
    if (tempo === 'antes') {
      // 1975: a árvore ainda é muda; uma criança de muleta conversa com a amiga; outra brinca sentada na porta
      arvore(ctx, 528, CHAO, { s: 0.42, seed: 640 });
      pessoa(ctx, { x: 290, y: PE, s: 0.42, style: crianca(2, { shirt: '#F4EDDF' }), look: 1, handR: [100, -168], seed: 710 });
      muleta(ctx, 290, PE, 0.42, 720);
      pessoa(ctx, { x: 420, y: PE, s: 0.41, style: crianca(1, { shirt: '#E4EB6C', bottoms: 'skirt' }), look: -1, gesture: 'wave', seed: 730 });
      pessoa(ctx, { x: 716, y: PE - 34, s: 0.4, pose: 'sit', style: crianca(4, { shirt: '#B5D8C0' }), look: 1, seed: 740 });
      bola(ctx, 800, PE - 26, 22, 750);
      pessoa(ctx, { x: 905, y: PE - 30, s: 0.47, quem: 'moradora', look: -1, seed: 760 });
      return;
    }
    if (tempo === 'acao') {
      // 1980: a faixa da campanha entre duas casas, a mesa na calçada e a fila; cada criança ganha o sinal de vacinada
      arvore(ctx, 528, CHAO, { s: 0.5, seed: 640 });
      E.linha(ctx, [[400, 236], [470, 254]], { lw: 4, seed: 801 });
      E.linha(ctx, [[690, 254], [760, 236]], { lw: 4, seed: 802 });
      E.ret(ctx, 470, 238, 220, 66, { papel: 'destaque', r: 6, seed: 803, sombra: false, hachura: false });
      textoNoLugar(ctx, info, D('D08').toUpperCase(), 580, 284, { papel: 'titulo', size: 34 });
      // quem vacina, atrás da mesa, com a mão estendida para a primeira da fila
      pessoa(ctx, { x: 822, y: PE - 6, s: 0.47, quem: 'agente', look: -1, handR: [-150, -238], seed: 770 });
      E.ret(ctx, 650, 478, 250, 24, { papel: 'apoioEscuro', r: 6, seed: 804, sombra: false, hachura: false });
      E.linha(ctx, [[672, 502], [672, PE]], { lw: 7, seed: 805 });
      E.linha(ctx, [[878, 502], [878, PE]], { lw: 7, seed: 806 });
      // a caixa de isopor (onde a vacina fica no frio) e a prancheta, em cima da mesa
      E.ret(ctx, 668, 420, 92, 58, { papel: 'superficie', r: 6, seed: 807, sombra: false, hachura: false });
      E.ret(ctx, 662, 410, 104, 16, { papel: 'apoio', r: 5, seed: 808, sombra: false, hachura: false });
      E.objeto(ctx, 'prancheta', { x: 872, y: 448, s: 0.5, seed: 809 });
      // a fila: da primeira (perto da mesa) para a última
      const fila = [[612, 0.4, 3], [522, 0.38, 0], [432, 0.41, 4], [344, 0.37, 1]];
      fila.forEach(([x, s, i], j) => {
        pessoa(ctx, { x, y: PE, s, style: crianca(i), look: 1, seed: 780 + j * 7 });
        vacinado(ctx, x, PE - s * 520 - 34, em(t, 'v' + (j + 1), 0.3), 820 + j * 3);
      });
      // a criança de muleta, cinco anos depois, olha de longe
      pessoa(ctx, { x: 252, y: PE, s: 0.46, style: crianca(2, { shirt: '#F4EDDF' }), look: 1, handR: [100, -168], seed: 710 });
      muleta(ctx, 252, PE, 0.46, 720);
      return;
    }
    // hoje: a árvore cresceu; duas crianças jogam bola, e uma mãe e a filha olham
    arvore(ctx, 528, CHAO, { s: 0.95, seed: 640 });
    const ida = (Math.sin(t * 2.2) + 1) / 2; // a bola vai e volta entre as duas
    pessoa(ctx, { x: 270, y: PE, s: 0.42, style: crianca(0, { shirt: '#F16D4D' }), look: 1, gesture: ida < 0.15 ? 'cheer' : null, seed: 790 });
    pessoa(ctx, { x: 640, y: PE, s: 0.41, style: crianca(3, { shirt: '#E4EB6C' }), look: -1, gesture: ida > 0.85 ? 'cheer' : null, seed: 795 });
    bola(ctx, U.lerp(336, 574, ida), PE - 30 - Math.abs(Math.sin(ida * Math.PI)) * 130, 22, 751);
    // a mãe e a filha olham o jogo, paradas na calçada (quem anda sem sair do lugar parece deslizar)
    pessoa(ctx, { x: 868, y: PE + 4, s: 0.47, quem: 'moradora', look: -1, seed: 765 });
    pessoa(ctx, { x: 790, y: PE + 4, s: 0.34, style: crianca(1, { shirt: '#B5D8C0' }), look: -1, gesture: ida > 0.85 ? 'cheer' : null, seed: 768 });
  }

  // ---------- o certificado de 1994 (cena 'depois', frase 8), no céu da rua, à esquerda ----------
  function depois(ctx, st) {
    const k = em(st.t, 'certificado', 0.35);
    if (k <= 0) return;
    const x = 110, y = A.PALCO.y0 + 22, w = 190, h = 150, z = U.ease.outBack(Math.min(1, k));
    ctx.save(); ctx.globalAlpha *= Math.min(1, k * 2.5);
    ctx.translate(x + w / 2, y + h / 2); ctx.scale(z, z); ctx.rotate(-0.05); ctx.translate(-(x + w / 2), -(y + h / 2));
    E.ret(ctx, x, y, w, h, { papel: 'superficie', r: 6, seed: 851, sombra: true, hachura: false });
    E.texto(ctx, D('D16'), x + w / 2, y + 50, { papel: 'titulo', size: 40, align: 'center' });
    for (let i = 0; i < 3; i++) E.linha(ctx, [[x + 24, y + 76 + i * 20], [x + w - (i === 2 ? 80 : 24), y + 76 + i * 20]], { papel: 'apoioEscuro', lw: 5, seed: 852 + i });
    E.circulo(ctx, x + w - 34, y + h - 26, 22, { papel: 'destaque', seed: 856, sombra: false, hachura: false });
    ctx.restore();
  }

  // ---------- por que funcionou (cena 'porque', frases 9 e 10): dez pessoas, oito vacinadas; o vírus pega a primeira
  // (sem vacina) e tenta passar para as vizinhas, que estão vacinadas: a corrente quebra ----------
  const COL = [150, 330, 510, 690, 870], LIN = [960, 1320];
  const SEM = { '0,0': true, '1,3': true }; // as duas sem vacina (linha, coluna)
  function boneco(ctx, x, y, papel, seed) {
    E.ret(ctx, x - 50, y - 140, 100, 140, { papel, r: 40, seed, sombra: false });
    E.circulo(ctx, x, y - 184, 38, { papel: 'superficie', seed: seed + 1, sombra: false });
  }
  function xis(ctx, x, y, k, seed) {
    if (k <= 0) return;
    const r = 26 * U.ease.outBack(Math.min(1, k));
    E.linha(ctx, [[x - r, y - r], [x + r, y + r]], { papel: 'alerta', lw: 10, seed });
    E.linha(ctx, [[x + r, y - r], [x - r, y + r]], { papel: 'alerta', lw: 10, seed: seed + 1 });
  }
  function porque(ctx, st) {
    const t = st.t, kG = em(t, 'grupo', 0.5), kPega = em(t, 'pega', 0.35);
    LIN.forEach((y, l) => COL.forEach((x, c) => {
      const k = U.clamp(kG * 1.6 - (l * 5 + c) * 0.06, 0, 1);
      if (k <= 0) return;
      const sem = SEM[l + ',' + c], doente = l === 0 && c === 0 && kPega > 0.5;
      ctx.save(); ctx.globalAlpha *= k;
      boneco(ctx, x, y, doente ? 'alerta' : sem ? 'superficie' : 'apoioEscuro', 900 + l * 10 + c);
      if (!sem) vacinado(ctx, x + 46, y - 222, 1, 930 + l * 10 + c);
      ctx.restore();
    }));
    // o vírus chega pela esquerda e pega a primeira pessoa, que não tem vacina
    const kV = em(t, 'virus', 0.8);
    if (kV > 0 && kPega < 1) {
      const vx = U.lerp(-40, COL[0] - 6, U.ease.inOutCubic(kV)), vy = LIN[0] - 290 + Math.sin(t * 6) * 6;
      virus(ctx, vx, vy, 30 * (1 - 0.6 * kPega), { k: Math.min(1, kV * 3), rot: t * 0.8, seed: 960 });
    }
    // da primeira, ele tenta passar para a vizinha do lado e para a de baixo: as duas estão vacinadas, e a corrente para
    const tenta = (de, para, k, seed) => {
      if (k <= 0) return;
      E.seta(ctx, de, para, { k: Math.min(1, k * 1.4), curva: 0.25, lw: 7, cabeca: 24, papel: 'alerta', seed });
      xis(ctx, para[0], para[1], (k - 0.7) / 0.3, seed + 5);
    };
    tenta([COL[0] + 46, LIN[0] - 214], [COL[1] - 62, LIN[0] - 140], em(t, 'bloqueio', 0.6), 970);
    tenta([COL[0] - 12, LIN[0] + 12], [COL[0] - 12, LIN[1] - 236], em(t, 'bloqueio2', 0.6), 980);
    // o número: oito em cada dez vacinadas (frase 10), em cima do grupo
    etiqueta(ctx, D('D09'), A.CX, LIN[0] - 320, { k: em(t, 'oitenta', 0.4), size: 50, papel: 'numero', fundo: 'destaque', seed: 990 });
  }

  // ---------- se parar (cena 'separar'): o vírus aparece do lado do antes, com a seta para o hoje (frase 12); depois, a
  // barra da cobertura de 2023, com a meta (frase 13), por cima do lugar ----------
  function separar(ctx, st) {
    const t = st.t, kV = em(t, 'volta', 0.5), kB = em(t, 'barra', 0.4);
    if (kV > 0 && !(SC.linha[13] && t >= SC.linha[13].t0)) {
      ctx.save();
      virus(ctx, 130, A.PALCO.y0 + 200 + Math.sin(t * 5) * 6, 32, { k: kV, rot: t * 0.7, seed: 1010 });
      E.seta(ctx, [190, A.PALCO.y0 + 230], [430, A.PALCO.y0 + 330], { k: em(t, 'volta', 0.9), curva: -0.2, lw: 7, cabeca: 26, papel: 'alerta', seed: 1020 });
      ctx.restore();
    }
    // na frase 13, corte: o lugar clareia de uma vez (o véu entra no quadro em que a frase entra) e a barra enche
    const f13 = SC.linha[13];
    if (!f13 || t < f13.t0) return;
    E.ret(ctx, -20, A.PALCO.y0 + 48, A.W + 40, A.PALCO.y1 - A.PALCO.y0 - 52, { papel: 'fundo', r: 0, seed: 1030, sombra: false, hachura: false, contorno: false, alpha: 0.86 });
    const y = A.PALCO.y0 + 330;
    barra(ctx, A.L + 10, y, A.R - A.L - 20, 72, 86.5, { meta: 95, k: kB, kMeta: em(t, 'meta', 0.4), rotulo: D('D10'), rotuloMeta: D('D11'), seed: 1040 });
  }

  // ---------- o fecho (cena 'fecho', frase 14): as quatro idades da vacina, uma por vez, no céu da rua ----------
  function fecho(ctx, st) {
    const t = st.t, xs = [178, 386, 594, 802];
    ['D12', 'D13', 'D14', 'D15'].forEach((d, i) => etiqueta(ctx, D(d), xs[i], A.PALCO.y0 + 116, { k: em(t, 'dose' + (i + 1), 0.35), size: 38, papel: 'corpo', fundo: 'superficie', seed: 1060 + i * 3 }));
  }

  globalThis.PECA = {
    NOMES: { antes: 'D01', depois: 'D02', numAntes: 'D03', rotAntes: 'D04', numDepois: 'D05', rotDepois: 'D06', acao: 'D07' },
    // o trecho de cada frase que leva destaque (tem de estar escrito igual na frase)
    DESTAQUE: {
      1: 'ninguém mais',
      3: '3.596 casos',
      4: 'sem força',
      6: 'em massa',
      7: '19 de março de 1989',
      9: 'o vírus não acha em quem passar',
      10: 'cobertura vacinal',
      12: 'ele pode voltar',
      13: 'abaixo da meta de 95%',
      15: 'enquanto for assim',
    },
    FOCO: { x: 552, y: 410, z: 1.45 },
    // os cortes para perto (um por cena, para nenhum trecho passar de 12 s sem corte): a criança de muleta (4, o que a
    // pólio faz), a fila ganhando o sinal de vacinada (6), as crianças brincando no dia do certificado (8), as pessoas
    // do lado do vírus (10; no "porque" o ponto é da tela), o lado de 1975 voltando (12) e as crianças de hoje (15)
    PERTO: {
      4: { x: 300, y: 500, z: 1.9 },
      6: { x: 470, y: 470, z: 1.9 },
      8: { x: 470, y: 470, z: 1.5 },
      10: { x: 440, y: 1000, z: 1.15 },
      12: { x: 330, y: 470, z: 1.4 },
      15: { x: 520, y: 470, z: 1.45 },
    },
    LUGAR: lugar,
    DESENHO: { depois, porque, separar, fecho },
  };
})();
