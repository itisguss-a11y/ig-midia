// PRESEME · motor "linha do tempo" · desenho 2/3 · o que é só da peça · MOLDE: o chat 1 troca o que está marcado com TROQUE
// O molde (film-1-molde.js) já põe a linha, os anos, os rótulos, a câmera, o contador de anos e a frase. Aqui ficam só os
// destaques do texto (DESTAQUE) e o desenho do cartão de cada marco (CARTAO[id], o id é o dos MARCOS do score.js).
// Cada CARTAO recebe (ctx, box, st, info): box é o cartão em unidades de desenho (780 × 540; o canto de cima à esquerda é
// 0, 0; o molde amplia 1,1 vezes); info.fase é a frase da cena que está na tela (0 é a primeira; -1, antes dela; 99, cartão
// de marco que já passou) e info.kf, há quantos segundos ela apareceu. Use ap(info, f) para fazer algo entrar na frase f.
// Cores e letras só do kit (E.*) e das ajudas do molde (LINHA.KIT): o cartão sai em qualquer estilo. Letra dentro do cartão:
// 36 ou mais. Letra em cima de preenchimento claro (apoio, destaque) vai com cor: 'floresta', para se ler também na lousa (giz).
// Exemplo completo, com cinco cartões desenhados: exemplo-nascimento-do-sus/film-2-peca.js.
(function () {
  const U = globalThis.U, G = globalThis.G, E = globalThis.ESTILOS, Ch = globalThis.Ch, M = globalThis.LINHA;
  const { D } = M;
  const cor = (p) => E.cor(p);
  const PEC = { DESTAQUE: {}, CARTAO: {}, CENA: {} };
  globalThis.PECA = PEC;

  // TROQUE: o trecho de cada frase que leva marca-texto, pelo número da frase (o termo que cai na prova; um por frase, ou nenhum)
  PEC.DESTAQUE = { 1: '(trecho da frase 01)' };

  // as ajudas do molde (LINHA.KIT; não precisa escrever de novo):
  //   ap(info, f, dur, atraso)  o quanto algo ligado à frase f já entrou (0 a 1)
  //   tf(info, f)               há quantos segundos a frase f está na tela (para animar)
  //   texto(ctx, s, x, y, o)    texto dentro do cartão, sem cortar na borda (o: papel, size, align, cor)
  //   chao(ctx, y)              o chão do cartão;  pessoa(ctx, o)  gente do kit;  gente(i, o)  roupa e pele variadas
  //   documento(ctx, x, y, w, h, titulo, o)   uma lei ou relatório, com as linhas em traço (devolve as alturas)
  //   mapaRR(ctx, { x, y, w, h })            o mapa de Roraima com os 15 municípios (IBGE)
  const { ap, tf, texto, chao, pessoa, gente, documento, mapaRR } = M.KIT;

  // o cartão provisório: a folha com o rótulo do marco e uma linha marcada por frase (só para o molde rodar; TROQUE)
  function provisorio(ctx, box, info, rotulo) {
    const ys = documento(ctx, 110, 34, box.w - 220, box.h - 68, D(rotulo), { seed: 820, linhas: 4, tam: 44 });
    ys.forEach((y, i) => { const k = ap(info, i, 0.4); if (k > 0) E.ret(ctx, 130, y - 24, (box.w - 260) * k, 48, { papel: 'destaque', r: 6, seed: 830 + i, sombra: false }); });
  }

  // ---------- os cartões ----------
  const C = PEC.CARTAO;

  // hoje: na pergunta e no fecho, alguém chega à UBS; na cena de hoje, a consulta. TROQUE o que a peça pede (a cena de hoje
  // mostra o que mudou para a pessoa: no exemplo, a consulta e o conselho de saúde)
  C.hoje = (ctx, box, st, info) => {
    const { w, h } = box, piso = h - 64;
    chao(ctx, piso);
    if (info.cena !== 'hoje') {
      const ux = 330, uw = 400, uh = 320; // a UBS
      E.poligono(ctx, [[ux - 20, piso - uh + 4], [ux + uw / 2, piso - uh - 70], [ux + uw + 20, piso - uh + 4]], { papel: 'apoioEscuro', seed: 601, sombra: false });
      E.ret(ctx, ux, piso - uh, uw, uh, { papel: 'superficie', r: 6, seed: 602, sombra: false });
      E.ret(ctx, ux + 115, piso - uh + 22, 170, 76, { papel: 'destaque', r: 10, seed: 603, sombra: false });
      texto(ctx, D(M.PONTOS[M.PONTOS.length - 1].rotulo), ux + 200, piso - uh + 78, { papel: 'titulo', size: 54, cor: 'floresta' });
      E.ret(ctx, ux + 34, piso - 170, 100, 90, { papel: 'apoio', r: 4, seed: 604, sombra: false });
      E.ret(ctx, ux + 262, piso - 200, 100, 200, { papel: 'sombra', r: 4, seed: 605, sombra: false, hachura: false }); // a porta aberta
      E.ret(ctx, ux + 262, piso - 200, 28, 200, { papel: 'apoio', r: 4, seed: 606, sombra: false });
      const an = Ch.walk(st.t, { x0: -90, speed: 150, t0: 0.2, stride: 220, s: 0.66 }); // a pessoa chega andando
      const parou = an.x >= 230, x = parou ? 230 : an.x;
      pessoa(ctx, { x, y: piso, s: 0.66, quem: 'moradora', pose: parou ? 'stand' : 'walk', walk: an.walk, look: 0.6, seed: 710 });
      return;
    }
    // na cena de hoje: a consulta (TROQUE pelo efeito de hoje)
    E.ret(ctx, 250, piso - 160, 300, 24, { papel: 'apoioEscuro', r: 6, seed: 621, sombra: false }); // a mesa
    E.linha(ctx, [[280, piso - 136], [280, piso]], { lw: 6, seed: 622 }); E.linha(ctx, [[520, piso - 136], [520, piso]], { lw: 6, seed: 623 });
    for (const [x, s2] of [[170, 1], [630, -1]]) { E.ret(ctx, x - 60, piso - 96, 120, 18, { papel: 'apoio', r: 4, seed: 624 + s2, sombra: false }); E.linha(ctx, [[x - 50, piso - 78], [x - 50, piso]], { lw: 5, seed: 626 + s2 }); E.linha(ctx, [[x + 50, piso - 78], [x + 50, piso]], { lw: 5, seed: 628 + s2 }); } // as cadeiras
    pessoa(ctx, { x: 170, y: piso - 96, s: 0.62, quem: 'moradora', pose: 'sit', look: 0.7, seed: 711 });
    pessoa(ctx, { x: 630, y: piso - 96, s: 0.62, style: gente(1, { shirt: '#FFFDF6', collar: '#FFFDF6' }), pose: 'sit', look: -0.7, seed: 712, gesture: tf(info, 0) > 1.2 ? 'thumbsUp' : null });
  };

  // TROQUE: o desenho de cada marco. Ele explica a frase que está na tela: cada frase da cena muda o desenho (ap(info, 0),
  // ap(info, 1)...). No exemplo: a multidão da conferência, o livro da Constituição com as abas dos artigos, a lei com o artigo
  // vetado, a balança dos usuários. Ideias que servem a muitos temas: documento(), gente(), mapaRR(), E.carimbo, E.seta, E.cota.
  C.m1 = (ctx, box, st, info) => provisorio(ctx, box, info, 'D05');
  C.m2 = (ctx, box, st, info) => provisorio(ctx, box, info, 'D06');
  C.m3 = (ctx, box, st, info) => provisorio(ctx, box, info, 'D07');
})();
