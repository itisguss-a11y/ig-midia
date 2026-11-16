// PRESEME · motor do tipo "antes e depois" · desenho 3/3 · o filme (do molde: igual em toda peça deste tipo)
// Cada tipo de cena tem o seu arranjo: que mundo aparece (o antes, a ação de perto, o depois ou os dois com a cortina),
// o desenho da peça por cima dele (PECA.DESENHO, em film-2-peca.js) e a frase em cima de tudo. O estilo vem do kit,
// pelo score.js.
(function () {
  const U = globalThis.U, E = globalThis.ESTILOS, SC = globalThis.SCORE, A = globalThis.AD;
  const P = () => globalThis.PECA || {};
  const desenho = (c) => { const d = P().DESENHO || {}; return d[c.id] || d[c.tipo] || null; };
  const caixa = { x0: 0, x1: A.W, y0: A.MUNDO_Y, y1: A.BOT }; // o espaço do mundo (onde o desenho do "porque" mora)

  // o mundo de cada tipo de cena
  const MUNDO = {
    // a capa: a tela dividida no meio, o antes à esquerda e o depois à direita, cada lado com o carimbo e a placa
    pergunta: (ctx, st) => A.cortina(ctx, st.x, st),
    // o antes: o lugar inteiro no tempo de antes; o carimbo do ano bate e a placa do número entra
    antes: (ctx, st) => A.cortina(ctx, st.x, st),
    // a ação: o mesmo lugar de perto, no ano da ação (o desenho da ação é a peça que põe, no LUGAR com tempo 'acao')
    acao: (ctx, st) => A.mundo(ctx, 'acao', st, { perto: true }),
    // o depois: a cortina corre da direita para a esquerda; do lado esquerdo ainda é o ano da ação
    depois: (ctx, st) => A.cortina(ctx, st.x, st, { tempoAntes: 'acao' }),
    // por que funcionou: sem o lugar; o desenho da peça ocupa o mundo inteiro, sobre o fundo do depois
    porque: () => {},
    // se parar: começa no depois inteiro; depois da pergunta, a cortina volta até o meio e o antes entra pela esquerda
    separar: (ctx, st) => A.cortina(ctx, st.x, st),
    // o fecho: o depois inteiro de novo (o hoje), com a resposta
    fecho: (ctx, st) => A.cortina(ctx, st.x, st),
  };

  globalThis.Studio.film({
    fadeOut: 0,
    async init() { const p = P(); if (p && typeof p.init === 'function') await p.init(); },
    draw(ctx, t) {
      const st = A.estado(Math.min(Math.max(t, 0), SC.DURATION - 0.001));
      E.fundo(ctx);
      (MUNDO[st.c.tipo] || MUNDO.porque)(ctx, st);
      // o desenho da peça para esta cena (pelo id da cena ou pelo tipo), por cima do mundo e embaixo da frase
      const f = desenho(st.c), z = A.pertoNaTela(st); // no "porque", o corte para perto da frase (PECA.PERTO)
      if (z) { ctx.save(); ctx.translate(z.x, z.y); ctx.scale(z.z, z.z); ctx.translate(-z.x, -z.y); }
      if (f) f(ctx, st, caixa);
      if (z) ctx.restore();
      if (!f && st.c.tipo === 'porque') A.KIT.aFazer(ctx, { x0: A.L, x1: A.R, y0: A.MUNDO_Y + 40, y1: A.BOT - 20 }, 'por que funcionou', U.clamp((st.t - st.c.t0) / 0.4, 0, 1));
      // a frase: na capa, a pergunta grande (é a capa e o gancho); no resto, em cima, no tamanho de sempre
      if (st.c.tipo === 'pergunta' && st.i === 0) A.bloco(ctx, st.it.n, { y0: A.TITULO_Y, papel: 'titulo', sizes: [92, 84, 76, 70, 64, 58], maxLinhas: [2, 2, 2, 2, 2, 2], alpha: st.aTexto, k: st.kDestaque });
      else A.textoDaVez(ctx, st);
    },
  });
})();
