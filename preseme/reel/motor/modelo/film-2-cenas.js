// PRESEME · desenho 2 · as cenas (modelo do motor: troque pelo desenho da peça). Uma função por cena do score.js:
// PRESEME.CENA[id] = (ctx, st) => { ... }. st.t = o instante, st.c = a cena (t0, t1), st.it = a frase da vez (n, t0, t1),
// st.u = 0..1 dentro da cena, st.aTexto e st.dyTexto = a entrada da frase. Todo desenho é função do tempo (sem Math.random).
(function () {
  const G = globalThis.G, U = globalThis.U, P = globalThis.PRESEME;
  const { C, INK, L, R, CX, TOP, BOT, W, H } = P;

  P.CENA.abertura = (ctx, st) => {
    ctx.fillStyle = C.floresta; ctx.fillRect(0, 0, W, H);
    P.titulo(ctx, st.it.n, { cor: C.papel });
  };
  P.CENA.meio = (ctx, st) => {
    ctx.fillStyle = C.papel; ctx.fillRect(0, 0, W, H);
    P.bloco(ctx, st.it.n, { alpha: st.aTexto, dy: st.dyTexto });
  };
  P.CENA.fecho = (ctx, st) => {
    ctx.fillStyle = C.papel; ctx.fillRect(0, 0, W, H);
    P.titulo(ctx, st.it.n);
  };
})();
