// PRESEME · tipo "o caminho" · desenho 2/3 · a peça (o chat 1 escreve; aqui, o exemplo da rede de frio)
// Texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.
// O que a peça traz (globalThis.PECA):
//   DESTAQUE   o trecho de cada frase que leva o destaque do estilo ({ n: 'trecho' })
//   OBJETO     o que viaja: (ctx, x, y, s, st), com x no meio e y no chão (a base do objeto)
//   LUGAR      um desenho por lugar do caminho: (ctx, cx, chao, st, ponto); cx é o meio do lugar, e o desenho fica entre o
//              chão e CAMINHO.TETO (370 px acima do chão; em cima vem o letreiro). Devolve, se o objeto entra
//              nele, { pouso: [x, y], escala, frente(ctx), apaga } (apaga: segundos depois da chegada em que o objeto some)
//   TRANSPORTE um desenho por veículo: (ctx, x, chao, st, e); x é onde está o objeto, e vai de 0 a 1 na viagem.
//              Devolve { carga: [x, y], escala, frente(ctx) }: onde o objeto vai dentro dele e o que fica na frente
//   CUIDADO    o desenho ao lado do medidor no cartão, por cena (e "pergunta"): (ctx, caixa, st, fase); caixa = {x, y, w, h};
//              fase = { sobe, volta, valor, risco, temRisco, fim } (de 0 a 1), para o desenho andar junto com o medidor;
//              st.i diz qual frase da cena é (1 = o 1º cuidado, 2 = o 2º)
// Tudo com as funções do kit (E.ret, E.circulo, E.poligono, E.linha, E.seta...) e os papéis de cor dele, para a peça sair
// em qualquer estilo. Nada de cor escrita à mão e nada de Math.random.
(function () {
  const U = globalThis.U, E = globalThis.ESTILOS;
  const cl = (x) => U.clamp(x, 0, 1);

  // o floco de neve (o frio): três traços cruzados com as pontas em V
  function floco(ctx, x, y, r, { papel = 'tinta', lw = 5, seed = 90 } = {}) {
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI) / 3 + Math.PI / 2, dx = Math.cos(a) * r, dy = Math.sin(a) * r;
      E.linha(ctx, [[x - dx, y - dy], [x + dx, y + dy]], { papel, lw, seed: seed + i });
      for (const sg of [1, -1]) {
        const px = x + sg * dx * 0.62, py = y + sg * dy * 0.62, b = r * 0.28;
        E.linha(ctx, [[px + Math.cos(a + sg * 2.4) * b, py + Math.sin(a + sg * 2.4) * b], [px, py], [px + Math.cos(a - sg * 2.4) * b, py + Math.sin(a - sg * 2.4) * b]], { papel, lw: lw * 0.8, seed: seed + 5 + i });
      }
    }
  }
  // o frasco de vacina (base em y)
  function frasco(ctx, x, y, s, { seed = 300, forca = 1 } = {}) {
    E.ret(ctx, x - 25 * s, y - 80 * s, 50 * s, 80 * s, { papel: 'superficie', r: 11 * s, seed, sombra: false });
    E.ret(ctx, x - 18 * s, y - 46 * s, 36 * s, 38 * s, { papel: forca > 0.5 ? 'apoio' : 'alerta', r: 8 * s, seed: seed + 1, sombra: false, contorno: false });
    E.ret(ctx, x - 25 * s, y - 66 * s, 50 * s, 14 * s, { papel: 'destaque', r: 2, seed: seed + 2, sombra: false, contorno: false, hachura: false });
    E.ret(ctx, x - 12 * s, y - 94 * s, 24 * s, 16 * s, { papel: 'superficie', r: 4 * s, seed: seed + 3, sombra: false, hachura: false });
    E.ret(ctx, x - 17 * s, y - 110 * s, 34 * s, 18 * s, { papel: 'alerta', r: 6 * s, seed: seed + 4, sombra: false });
  }
  // a bobina de gelo (o bloco que gela a caixa)
  function bobina(ctx, x, y, w, h, { papel = 'apoio', seed = 400, alpha = 1 } = {}) {
    E.ret(ctx, x, y, w, h, { papel, r: Math.min(w, h) * 0.25, seed, sombra: false, alpha });
    const n = Math.max(2, Math.round(Math.max(w, h) / 60));
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n, px = w > h ? x + u * w : x + w / 2, py = w > h ? y + h / 2 : y + u * h;
      floco(ctx, px, py, Math.min(w, h) * 0.24, { lw: 2.5, seed: seed + 10 + i });
    }
  }
  // a caixa térmica vista de frente (fechada ou aberta)
  function caixaTermica(ctx, x, yBase, w, h, { aberta = 0, seed = 500 } = {}) {
    if (aberta > 0) { // a tampa aberta, em pé atrás da caixa (a face de dentro, vista de frente)
      const ht = h * 0.5 * aberta;
      E.ret(ctx, x - w / 2 + 10, yBase - h - ht, w - 20, ht + 12, { papel: 'apoioEscuro', r: 10, seed: seed + 3, sombra: false });
    }
    E.ret(ctx, x - w / 2, yBase - h, w, h, { papel: 'superficie', r: 14, seed });
    if (aberta <= 0) E.ret(ctx, x - w / 2, yBase - h, w, h * 0.22, { papel: 'apoioEscuro', r: 10, seed: seed + 1, sombra: false });
    E.ret(ctx, x - w * 0.18, yBase - h * 0.62, w * 0.36, h * 0.16, { papel: 'apoio', r: 6, seed: seed + 2, sombra: false, hachura: false });
  }
  const predio = globalThis.CAMINHO.predio; // o prédio do molde (telhado em duas águas)
  // o avião (de lado, virado para a direita), com uma janela redonda onde vai a carga
  function aviao(ctx, x, y, s, seed = 700) {
    E.poligono(ctx, [[x - 40 * s, y], [x - 120 * s, y + 96 * s], [x - 60 * s, y + 96 * s], [x + 50 * s, y]], { papel: 'apoioEscuro', seed: seed + 1, sombra: false });
    E.poligono(ctx, [[x - 210 * s, y - 6 * s], [x - 250 * s, y - 90 * s], [x - 200 * s, y - 90 * s], [x - 150 * s, y - 10 * s]], { papel: 'apoioEscuro', seed: seed + 2, sombra: false });
    E.ret(ctx, x - 240 * s, y - 42 * s, 470 * s, 84 * s, { papel: 'superficie', r: 42 * s, seed, sombra: false });
    E.poligono(ctx, [[x - 30 * s, y + 4 * s], [x + 60 * s, y - 70 * s], [x + 110 * s, y - 70 * s], [x + 50 * s, y + 4 * s]], { papel: 'apoioEscuro', seed: seed + 3, sombra: false });
    for (let i = 0; i < 4; i++) E.circulo(ctx, x + (80 + i * 34) * s, y - 8 * s, 9 * s, { papel: 'apoio', seed: seed + 10 + i, sombra: false, hachura: false, lw: 2 });
    E.ret(ctx, x + 196 * s, y - 24 * s, 30 * s, 22 * s, { papel: 'apoio', r: 6 * s, seed: seed + 20, sombra: false, hachura: false, lw: 2 });
  }
  // o caminhão refrigerado (virado para a direita); devolve onde fica a janela da carga
  function caminhao(ctx, x, chao, t, seed = 800) {
    const bob = Math.sin(t * 28) * 2.2, y = chao + bob;
    E.ret(ctx, x - 250, y - 236, 290, 186, { papel: 'superficie', r: 10, seed, sombra: false });
    floco(ctx, x - 70, y - 143, 46, { seed: seed + 5 });
    E.ret(ctx, x + 46, y - 176, 128, 126, { papel: 'apoioEscuro', r: 16, seed: seed + 1, sombra: false });
    E.ret(ctx, x + 108, y - 160, 54, 50, { papel: 'apoio', r: 8, seed: seed + 2, sombra: false, hachura: false });
    E.ret(ctx, x - 262, y - 58, 446, 22, { papel: 'tinta', r: 6, seed: seed + 3, sombra: false, hachura: false });
    for (const wx of [x - 190, x - 110, x + 120]) { E.circulo(ctx, wx, chao - 22, 32, { papel: 'tinta', seed: seed + 10 + wx, sombra: false, hachura: false }); E.circulo(ctx, wx, chao - 22, 12, { papel: 'superficie', seed: seed + 20 + wx, sombra: false, hachura: false }); }
    return { janela: [x - 178, y - 143] };
  }

  const PECA = {
    DESTAQUE: {
      1: 'fria', 2: '8 °C', 3: 'central nacional', 4: 'medida em toda embalagem', 5: '27 centrais estaduais',
      6: 'avisa o Ministério', 7: 'veículo refrigerado', 8: 'apita', 9: 'a cada hora', 10: 'não tem volta',
      11: 'caixa térmica', 12: 'barreira', 13: '7 °C', 14: 'seu braço', 15: 'conferida em cada parada',
    },

    OBJETO(ctx, x, y, s) { frasco(ctx, x, y, s); },

    LUGAR: {
      // a fábrica (a partida): galpão com telhado em dente de serra e chaminé
      fabrica(ctx, cx, chao) {
        E.ret(ctx, cx + 110, chao - 400, 46, 170, { papel: 'apoio', r: 4, seed: 101, sombra: false });
        const top = chao - 250, dentes = 3, w = 400, x0 = cx - w / 2, dw = w / dentes, pts = [[x0, top]];
        for (let i = 0; i < dentes; i++) pts.push([x0 + i * dw, top - 110], [x0 + (i + 1) * dw, top]);
        E.poligono(ctx, pts, { papel: 'apoioEscuro', seed: 102, sombra: false });
        E.ret(ctx, x0, top, w, 250, { papel: 'superficie', r: 6, seed: 103, sombra: false });
        for (let i = 0; i < 3; i++) E.ret(ctx, x0 + 36 + i * 120, top + 46, 84, 70, { papel: 'apoio', r: 6, seed: 104 + i, sombra: false, hachura: false });
        E.ret(ctx, cx - 50, chao - 110, 100, 110, { papel: 'sombra', r: 4, seed: 108, sombra: false, hachura: false });
      },
      // a central nacional, perto do aeroporto: o galpão frio e um avião parado ao lado
      nacional(ctx, cx, chao) {
        predio(ctx, cx - 50, chao, 300, 250, 120, { seed: 110 });
        floco(ctx, cx - 50, chao - 160, 52, { seed: 115 });
        E.ret(ctx, cx - 110, chao - 90, 120, 90, { papel: 'sombra', r: 4, seed: 116, sombra: false, hachura: false });
        aviao(ctx, cx + 150, chao - 60, 0.42, 117);
        E.circulo(ctx, cx + 120, chao - 22, 12, { papel: 'tinta', seed: 118, sombra: false, hachura: false });
        E.circulo(ctx, cx + 200, chao - 22, 12, { papel: 'tinta', seed: 119, sombra: false, hachura: false });
      },
      // uma das centrais estaduais: o prédio frio com a doca de carga
      estadual(ctx, cx, chao) {
        predio(ctx, cx, chao, 380, 280, 90, { seed: 120 });
        floco(ctx, cx - 70, chao - 180, 58, { seed: 125 });
        E.ret(ctx, cx + 40, chao - 150, 140, 150, { papel: 'sombra', r: 4, seed: 126, sombra: false, hachura: false });
        for (let i = 0; i < 4; i++) E.linha(ctx, [[cx + 46, chao - 130 + i * 32], [cx + 174, chao - 130 + i * 32]], { lw: 3, seed: 127 + i });
      },
      // a central do município: menor, com a câmara fria aparecendo na janela
      municipal(ctx, cx, chao) {
        predio(ctx, cx, chao, 320, 250, 120, { seed: 130 });
        E.ret(ctx, cx - 120, chao - 210, 150, 150, { papel: 'apoio', r: 8, seed: 131, sombra: false, hachura: false });
        E.ret(ctx, cx - 92, chao - 196, 94, 128, { papel: 'superficie', r: 6, seed: 132, sombra: false });
        floco(ctx, cx - 45, chao - 132, 26, { lw: 3.5, seed: 133 });
        E.ret(ctx, cx + 60, chao - 130, 90, 130, { papel: 'sombra', r: 4, seed: 134, sombra: false, hachura: false });
      },
      // a sala de vacinação: a parede cortada mostra a câmara fria; o frasco entra numa prateleira
      sala(ctx, cx, chao) {
        predio(ctx, cx, chao, 420, 270, 100, { seed: 140 });
        E.ret(ctx, cx - 170, chao - 240, 340, 210, { papel: 'apoio', r: 10, seed: 141, sombra: false, hachura: false });
        E.ret(ctx, cx - 60, chao - 236, 150, 206, { papel: 'superficie', r: 8, seed: 142, sombra: false });
        E.ret(ctx, cx - 30, chao - 230, 90, 18, { papel: 'apoioEscuro', r: 4, seed: 143, sombra: false, hachura: false });
        for (let i = 0; i < 2; i++) E.linha(ctx, [[cx - 52, chao - 160 + i * 80], [cx + 82, chao - 160 + i * 80]], { lw: 3, seed: 144 + i });
        E.ret(ctx, cx - 160, chao - 120, 80, 90, { papel: 'superficie', r: 6, seed: 147, sombra: false }); // a mesinha
        const vidro = (c) => E.ret(c, cx - 54, chao - 210, 138, 172, { papel: 'apoio', r: 6, seed: 148, sombra: false, hachura: false, alpha: 0.32, lw: 3 });
        return { pouso: [cx + 15, chao - 82], escala: 0.6, frente: vidro };
      },
      // a caixa térmica do dia, em cima da mesa da sala; o frasco entra nela
      caixa(ctx, cx, chao, st, ponto) {
        const mesa = chao - 120, hc = 160, topo = mesa - hc; // a mesa, a caixa em cima (o topo da tampa aberta fica no TETO)
        E.ret(ctx, cx - 210, mesa, 420, 26, { papel: 'apoioEscuro', r: 6, seed: 151, sombra: false });
        E.ret(ctx, cx - 186, mesa + 26, 24, chao - mesa - 26, { papel: 'apoioEscuro', r: 4, seed: 152, sombra: false, hachura: false });
        E.ret(ctx, cx + 162, mesa + 26, 24, chao - mesa - 26, { papel: 'apoioEscuro', r: 4, seed: 153, sombra: false, hachura: false });
        const aberta = st.c.ponto === ponto.k ? cl((st.t - st.c.tChega + 0.4) / 0.4) : 0.0;
        caixaTermica(ctx, cx, mesa, 280, hc, { aberta, seed: 154 });
        const frente = (c) => { // a frente da caixa, por cima do frasco (ele fica dentro, só a tampa dele aparece)
          E.ret(c, cx - 140, topo + 46, 280, hc - 46, { papel: 'superficie', r: 12, seed: 155, sombra: false });
          E.ret(c, cx - 50, mesa - hc * 0.62, 100, hc * 0.16, { papel: 'apoio', r: 6, seed: 156, sombra: false, hachura: false });
        };
        return { pouso: [cx - 20, topo + 62], escala: 0.9, frente };
      },
      // o seu braço: quem recebe a vacina; o frasco some no braço e aparece o curativo
      braco(ctx, cx, chao, st, ponto) {
        const tc = ponto.tChega, depois = st.t - tc, s = 1.05;
        const joia = depois > 0.9;
        E.personagem(ctx, { quem: 'calouro', x: cx, y: chao, s, pose: 'stand', look: -0.4, mouth: depois > 0.5 ? 'smile' : 'flat', gesture: joia ? 'thumbsUp' : undefined, seed: 160 });
        const ax = cx - 64 * s, ay = chao - 262 * s;
        if (depois > 0.55) {
          const k = U.ease.outBack(cl((depois - 0.55) / 0.3));
          ctx.save(); ctx.translate(ax, ay); ctx.rotate(-0.4); ctx.scale(k, k);
          E.ret(ctx, -26, -12, 52, 24, { papel: 'destaque', r: 10, seed: 161, sombra: false, hachura: false, lw: 3 });
          ctx.restore();
        }
        return { pouso: [ax - 6, ay + 40], escala: 0.7, apaga: 0.45 };
      },
    },

    TRANSPORTE: {
      caminhao(ctx, x, chao, st) {
        const r = caminhao(ctx, x, chao, st.t);
        const [jx, jy] = r.janela;
        const janela = (c) => { E.ret(c, jx - 46, jy - 52, 92, 104, { papel: null, r: 12, seed: 870, lw: 6, sombra: false }); };
        return { carga: [jx, jy + 44], escala: 0.62, frente: janela };
      },
      aviao(ctx, x, chao, st, e) {
        const y = chao - 470 - Math.sin(Math.min(1, e) * Math.PI) * 60;
        aviao(ctx, x, y, 0.8, 880);
        E.circulo(ctx, x - 40, y - 2, 40, { papel: 'apoio', seed: 890, sombra: false, hachura: false });
        const janela = (c) => E.circulo(c, x - 40, y - 2, 40, { papel: null, seed: 891, lw: 6, sombra: false });
        return { carga: [x - 40, y + 30], escala: 0.48, frente: janela };
      },
      caixaTermica(ctx, x, chao, st) {
        const bob = Math.abs(Math.sin(st.t * 14)) * -8;
        E.circulo(ctx, x - 70, chao - 16, 16, { papel: 'tinta', seed: 896, sombra: false, hachura: false });
        E.circulo(ctx, x + 70, chao - 16, 16, { papel: 'tinta', seed: 897, sombra: false, hachura: false });
        caixaTermica(ctx, x, chao - 26 + bob, 220, 150, { seed: 898 });
        const frente = (c) => E.ret(c, x - 110, chao - 26 + bob - 98, 220, 98, { papel: 'superficie', r: 12, seed: 899, sombra: false });
        return { carga: [x, chao - 26 + bob - 70], escala: 0.7, frente };
      },
    },

    CUIDADO: {
      // a pergunta: o frasco grande e o frio que ele precisa
      pergunta(ctx, b, st) {
        const k = U.ease.outBack(cl((st.t - st.it.t0) / 0.4));
        frasco(ctx, b.x + b.w * 0.44, b.y + b.h * 0.86, 3.4 * k, { seed: 310 });
        floco(ctx, b.x + b.w * 0.16, b.y + b.h * 0.22, 48 * k, { seed: 311 });
        floco(ctx, b.x + b.w * 0.8, b.y + b.h * 0.3, 34 * k, { seed: 312 });
      },
      // parada 1: toda embalagem viaja com o registrador de temperatura (a linha fica dentro da faixa)
      parada1(ctx, b, st) {
        const u = cl((st.t - st.it.t0) / 2.5);
        const tela = { x: b.x + 30, y: b.y + 20, w: b.w - 60, h: 200 };
        E.ret(ctx, tela.x, tela.y, tela.w, tela.h, { papel: 'superficie', r: 16, seed: 330, sombra: false });
        E.ret(ctx, tela.x + 20, tela.y + 62, tela.w - 40, 76, { papel: 'apoio', r: 8, seed: 331, sombra: false, contorno: false, hachura: false });
        const pts = []; for (let i = 0; i <= 30; i++) { const q = i / 30; pts.push([tela.x + 24 + q * (tela.w - 48), tela.y + 100 + Math.sin(q * 9 + 1) * 18]); }
        E.linha(ctx, pts, { papel: 'tinta', lw: 6, k: u, seed: 332 });
        for (let i = 0; i < 2; i++) {
          const bx = b.x + 50 + i * (b.w * 0.47), by = b.y + b.h - 40, bw = b.w * 0.4, bh = 220;
          E.ret(ctx, bx, by - bh, bw, bh, { papel: 'apoio', r: 10, seed: 335 + i, sombra: false });
          E.linha(ctx, [[bx + bw / 2, by - bh], [bx + bw / 2, by]], { papel: 'destaque', lw: 12, seed: 337 + i });
          E.ret(ctx, bx + bw * 0.6, by - bh + 40, 54, 80, { papel: 'superficie', r: 8, seed: 339 + i, sombra: false, hachura: false });
          E.ret(ctx, bx + bw * 0.6 + 20, by - bh + 64, 14, 46, { papel: 'apoioEscuro', r: 6, seed: 341 + i, sombra: false, contorno: false, hachura: false });
          E.seta(ctx, [bx + bw * 0.7, by - bh + 30], [tela.x + tela.w * (0.35 + 0.3 * i), tela.y + tela.h + 8], { lw: 4, curva: 0.2, k: cl(u * 2 - 0.3 * i), seed: 343 + i });
        }
      },
      // parada 2: a temperatura saiu da faixa no caminho; a central estadual avisa a nacional na hora
      parada2(ctx, b, st, f) {
        frasco(ctx, b.x + 120, b.y + b.h - 40, 1.9, { seed: 350, forca: f.sobe > 0.6 ? 0 : 1 });
        const de = [b.x + 210, b.y + b.h - 230], para = [b.x + b.w - 150, b.y + 160];
        // a central nacional, pequena, no alto
        predio(ctx, para[0], para[1] + 70, 150, 90, 50, { seed: 352 });
        floco(ctx, para[0], para[1] + 30, 22, { lw: 3, seed: 353 });
        const k = cl((st.t - st.it.t0 - 1.4) / 0.7);
        E.seta(ctx, de, [para[0] - 90, para[1] + 40], { curva: -0.25, k, lw: 7, papel: 'alerta', seed: 354 });
        if (k >= 1) { // o aviso (envelope) chega
          const z = 1 + 0.2 * U.pulse(st.t, st.it.t0 + 2.1, 8);
          ctx.save(); ctx.translate(para[0] - 110, para[1] - 30); ctx.scale(z, z);
          E.ret(ctx, -46, -32, 92, 64, { papel: 'superficie', r: 6, seed: 355, sombra: false });
          E.linha(ctx, [[-44, -30], [0, 4], [44, -30]], { lw: 4, seed: 356 });
          ctx.restore();
        }
      },
      // parada 3: a câmara fria apita perto do limite (a luz do alarme acende e as ondas do som saem)
      parada3(ctx, b, st, f) {
        const x = b.x + b.w * 0.42, y0 = b.y + 120, w = 230, h = b.h - 170;
        E.ret(ctx, x - w / 2, y0, w, h, { papel: 'superficie', r: 16, seed: 360 });
        E.ret(ctx, x - w / 2 + 20, y0 + 70, w - 40, h - 100, { papel: 'apoio', r: 10, seed: 361, sombra: false, hachura: false, alpha: 0.6 });
        for (let i = 0; i < 3; i++) E.linha(ctx, [[x - w / 2 + 26, y0 + 170 + i * 110], [x + w / 2 - 26, y0 + 170 + i * 110]], { lw: 4, seed: 362 + i });
        for (let i = 0; i < 3; i++) frasco(ctx, x - 60 + i * 60, y0 + 166 + (i % 2) * 110, 0.55, { seed: 365 + i });
        const tocando = f.sobe > 0.95 && f.volta < 0.5;
        const pisca = tocando && Math.floor((st.t - st.it.t0) * 6) % 2 === 0;
        E.circulo(ctx, x, y0 - 26, 30, { papel: pisca ? 'alerta' : 'apoioEscuro', seed: 370, sombra: false });
        if (tocando) for (let i = 1; i <= 2; i++) {
          const r = 50 + i * 26;
          E.linha(ctx, Array.from({ length: 9 }, (_, q) => { const a = -Math.PI * 0.85 + (q / 8) * Math.PI * 0.5; return [x + Math.cos(a) * r, y0 - 26 + Math.sin(a) * r]; }), { lw: 5, seed: 371 + i });
          E.linha(ctx, Array.from({ length: 9 }, (_, q) => { const a = -Math.PI * 0.15 - (q / 8) * Math.PI * 0.5; return [x + Math.cos(a) * r, y0 - 26 + Math.sin(a) * r]; }), { lw: 5, seed: 373 + i });
        }
      },
      // parada 4: fora da faixa, a força da vacina cai (três barras viram uma) e o frasco racha
      parada4(ctx, b, st, f) {
        const x = b.x + b.w * 0.36, y = b.y + b.h - 40;
        frasco(ctx, x, y, 3.0, { seed: 380, forca: f.sobe > 0.7 ? 0 : 1 });
        if (f.sobe > 0.7) {
          const k = cl((f.sobe - 0.7) / 0.3);
          E.linha(ctx, [[x - 30, y - 210], [x - 6, y - 170], [x - 24, y - 130], [x + 4, y - 96]], { papel: 'tinta', lw: 5, k, seed: 381 });
          E.linha(ctx, [[x + 34, y - 220], [x + 14, y - 186], [x + 30, y - 156]], { papel: 'tinta', lw: 4, k, seed: 382 });
        }
        const barras = f.sobe < 0.35 ? 3 : f.sobe < 0.7 ? 2 : 1;
        for (let i = 0; i < 3; i++) {
          const bx = b.x + b.w * 0.74, by = y - 60 - i * 92, ativo = i < barras;
          E.ret(ctx, bx, by - 70, 92, 70, { papel: ativo ? (barras === 1 ? 'alerta' : 'apoioEscuro') : 'superficie', r: 10, seed: 383 + i, sombra: false });
        }
      },
      // parada 5: 1º cuidado, a caixa por dentro (bobinas no fundo e nas laterais, a barreira, o termômetro no centro);
      // 2º cuidado, a 7 °C a bobina da esquerda sai e entra uma nova
      parada5(ctx, b, st, f) {
        const x0 = b.x + 20, y0 = b.y + 70, w = b.w - 40, h = b.h - 110;
        E.ret(ctx, x0, y0, w, h, { papel: 'superficie', r: 18, seed: 390, lw: 12 });
        const pad = 26, bob = 46;
        const troca = st.i === 2; // no 2º cuidado: a bobina da esquerda esquenta, sai na 1ª metade da volta e a nova entra na 2ª
        const saiK = troca ? cl(f.volta * 2) : 0, entraK = troca ? cl(f.volta * 2 - 1) : 0, hb = h - pad * 2 - bob - 50;
        bobina(ctx, x0 + pad, y0 + h - pad - bob, w - pad * 2, bob, { seed: 391 });
        bobina(ctx, x0 + w - pad - bob, y0 + pad + 40, bob, hb, { seed: 392 });
        if (!troca) bobina(ctx, x0 + pad, y0 + pad + 40, bob, hb, { seed: 393 });
        else {
          if (saiK < 1) bobina(ctx, x0 + pad, y0 + pad + 40 - U.ease.inCubic(saiK) * h * 0.8, bob, hb, { seed: 394, papel: f.sobe > 0.6 ? 'alerta' : 'apoio' });
          if (entraK > 0) bobina(ctx, x0 + pad, y0 + pad + 40 - (1 - U.ease.outCubic(entraK)) * h * 0.8, bob, hb, { seed: 393 });
        }
        // a barreira entre as bobinas e as vacinas (o plástico bolha)
        const bx = x0 + pad + bob + 18, by = y0 + pad + 50, bw = w - 2 * (pad + bob + 18), bh = h - pad * 2 - bob - 80;
        E.linha(ctx, [[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh], [bx, by]], { lw: 5, seed: 395, tracejado: true });
        for (let i = 0; i < 10; i++) E.circulo(ctx, bx + 20 + (i % 5) * ((bw - 40) / 4), by + (i < 5 ? 18 : bh - 18), 9, { papel: 'apoio', seed: 396 + i, sombra: false, hachura: false, lw: 2 });
        // as vacinas e o sensor do termômetro no centro, com o fio até o mostrador em cima da caixa
        for (let i = 0; i < 3; i++) frasco(ctx, bx + bw * (0.22 + i * 0.28), by + bh - 40, 0.62, { seed: 410 + i });
        const sx = bx + bw / 2, sy = by + bh * 0.42;
        E.linha(ctx, [[sx, sy], [sx, y0 - 30], [sx + 70, y0 - 30]], { lw: 4, seed: 415 });
        E.circulo(ctx, sx, sy, 14, { papel: 'alerta', seed: 416, sombra: false, hachura: false });
        E.ret(ctx, sx + 70, y0 - 62, 110, 64, { papel: 'apoioEscuro', r: 10, seed: 417, sombra: false });
      },
    },
  };
  globalThis.PECA = PECA;
})();
