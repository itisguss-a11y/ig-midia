// PRESEME · motor "Dado que se move" · desenho 2/3 · a peça (o chat 1 preenche este arquivo; o molde, film-1, não muda)
// O número, a conta, as barras, a régua e a fonte o molde desenha sozinho, das palavras D do textos.txt. A peça preenche:
//   DESTAQUE   o trecho de cada frase que leva o marca-texto: { número da frase: 'trecho escrito igualzinho na frase' }
//   PORQUE     por que é assim, desenhado: o vetor, o lugar, a hora (nunca um grupo de pessoas). function (ctx, st, M)
//   PREVENCAO  o que fazer, desenhado. function (ctx, st, M)
//   PLANOS     (opcional) o enquadramento de cada frase desenhada: { número da frase: { x, y, z } } põe o ponto (x, y) do
//              desenho no meio da área, com zoom z; a troca é seca, no começo da frase. Frase sem plano mostra o desenho inteiro.
// Cada desenho recebe (ctx, st, M):
//   st.desde[n]  segundos desde que a frase n entrou na tela (negativo antes dela): é o relógio do desenho
//   st.c.itens   as frases da cena ({ n, t0, t1 }); st.t é o instante do vídeo
//   M            as funções do molde: M.escrever(ctx, texto, x, y, { size, papel, align, cor }), M.wid, M.p01, M.D('D16'),
//                M.fmt, M.hash, M.apoio() e as medidas M.L, M.R, M.CX e M.area (a área do desenho: x de 0 a 1080, y de 600 a
//                1450; o título da frase fica em cima dela)
// Desenhe com a biblioteca (globalThis.BIB: B.floresta, B.casa, B.pessoa, B.mosquito, B.mapaRR, B.rede, B.ubsIcone...;
// a lista em motor/estilos/BIBLIOTECA.md) e com o kit (globalThis.ESTILOS: E.ret, E.circulo, E.linha, E.seta, E.texto),
// com cor por papel ('tinta', 'superficie', 'apoio', 'apoioEscuro', 'destaque', 'alerta'), nunca com cor escrita à mão:
// assim a peça sai em qualquer estilo (node preseme.js estilos). O lugar da biblioteca pinta o quadro inteiro: dentro da
// área ele fica recortado. Todo desenho é função do tempo (sem Math.random). Letra de rótulo com 36 ou mais.
(function () {
  const U = globalThis.U, E = globalThis.ESTILOS;
  const ease = U.ease;
  const desde = (st, n) => (st.desde && st.desde[n] != null ? st.desde[n] : -1);

  // TROQUE: o desenho provisório, para o molde rodar inteiro desde o primeiro dia. Um cartão por frase, que entra quando
  // a frase entra. A peça troca pelo desenho de verdade (no exemplo da leishmaniose: o mosquito-palha que pica, e não a
  // pessoa ao lado; o pôr do sol na mata; a janela com tela, o mosquiteiro na rede e a roupa comprida).
  function provisorio(ctx, st, M) {
    const itens = st.c.itens, n = itens.length, a = M.area, gap = 30, x0 = M.L, w0 = M.R - M.L;
    const w = (w0 - gap * (n - 1)) / n, h = 420, y = a.y + 120;
    itens.forEach((it, i) => {
      const z = ease.outBack(U.clamp(desde(st, it.n) / 0.35, 0, 1));
      if (z <= 0) return;
      const x = x0 + i * (w + gap), cx = x + w / 2;
      ctx.save(); ctx.translate(cx, y + h / 2); ctx.scale(z, z); ctx.translate(-cx, -(y + h / 2));
      E.ret(ctx, x, y, w, h, { papel: 'superficie', r: 26, seed: 300 + i });
      M.escrever(ctx, `[${String(it.n).padStart(2, '0')}]`, cx, y + 160, { size: 72, papel: 'numero', align: 'center' });
      M.escrever(ctx, 'desenho', cx, y + 256, { size: 44, papel: 'mao', align: 'center' });
      M.escrever(ctx, st.c.tipo === 'porque' ? 'do porquê' : 'do que fazer', cx, y + 312, { size: 44, papel: 'mao', align: 'center' });
      ctx.restore();
    });
  }

  globalThis.PECA = {
    // TROQUE: o trecho de cada frase que leva o marca-texto (o número é o da frase no textos.txt)
    DESTAQUE: { 4: '5 vezes' },
    PORQUE: provisorio,
    PREVENCAO: provisorio,
    PLANOS: {},
  };
})();
