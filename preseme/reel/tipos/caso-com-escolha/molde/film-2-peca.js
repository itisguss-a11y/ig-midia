// PRESEME · motor "Caso com escolha" · desenho 2/3 · a peça (o chat 1 preenche este arquivo; o molde, film-1, não muda)
// O que a peça preenche aqui:
//   DESTAQUE   o trecho de cada frase que leva o marca-texto: { número da frase: 'trecho escrito igualzinho na frase' }
//   PACIENTE   quem chega ao caso: { quem: 'moradora' | 'agente' | 'calouro', style: { hairStyle, outfit, shirt... } }
//   PISTAS     as pistas que entram na ficha, por frase do caso: { 1: ['D04', 'D05'], 2: ['D06'] } (palavras D do textos.txt)
//   CENARIO    (opcional) o lugar do caso, atrás da pessoa, no caso e no fecho: function (ctx, st, M)
//   PORQUE     PORQUE[1], [2] e [3]: o porquê de cada opção desenhado, um por opção (o que aponta para ela ou contra ela)
//   APS        o que se faz na atenção primária, desenhado (o exame, a equipe, quando procurar a unidade, a notificação)
//   PREVENCAO  a prevenção, desenhada
//   PAINEL     (opcional) false tira o cartaz das frases pares (o molde alterna lousa e cartaz para cada frase virar um corte)
//   PLANOS     o enquadramento de cada frase do porquê, da atenção primária e da prevenção: { número da frase: { x, y, z } }
//              põe o ponto (x, y) do desenho no meio da área, com zoom z; a troca é seca, no começo da frase (um corte por
//              frase: o conferir avisa trecho sem corte acima de 12 s). Frase sem plano mostra o desenho inteiro.
// Cada desenho recebe (ctx, st, M):
//   st.desde[n]  segundos desde que a frase n entrou na tela (negativo antes dela): é o relógio do desenho
//   st.c.itens   as frases da cena ({ n, t0, t1 }); no porquê, st.c.k é a opção (1, 2 ou 3)
//   M            as funções do molde: M.escrever(ctx, texto, x, y, { size, papel, align, cor }), M.caber, M.desenhar,
//                M.marca(ctx, 'certa' | 'errada' | 'pode', x, y, s, k), M.wid, M.p01, M.D('D08') e as medidas M.L, M.R,
//                M.CX, M.area (x de 60 a 940, y de 400 a 1170)
// Desenhe só com o kit (globalThis.ESTILOS: E.ret, E.circulo, E.linha, E.seta, E.poligono, E.texto, E.destaque,
// E.carimbo, E.personagem, E.objeto) e com cor por papel ('tinta', 'superficie', 'apoio', 'apoioEscuro', 'destaque',
// 'alerta'), nunca com cor escrita à mão: assim a peça sai em qualquer estilo (node preseme.js estilos). Cor de gente
// (pele, cabelo) fixada no PACIENTE entra no peca.json, em "cores". Todo desenho é função do tempo (sem Math.random).
// Letra de rótulo com 36 ou mais, para ler no celular. Nada de diagnóstico pela tela: o que separa as opções é o exame e a equipe.
(function () {
  const U = globalThis.U, E = globalThis.ESTILOS;
  const ease = U.ease;
  const desde = (st, n) => (st.desde && st.desde[n] != null ? st.desde[n] : -1);

  // TROQUE: o desenho provisório, para o molde rodar inteiro desde o primeiro dia. Um cartão por frase, que entra quando
  // a frase entra. A peça troca cada um pelo desenho de verdade (no exemplo da febre: o Aedes e a água parada, o maruim e
  // a lista de sintomas parecidos, o Anopheles e o mapa de Roraima, o exame, a notificação e as três proteções).
  function provisorio(ctx, st, M) {
    const itens = st.c.itens, n = itens.length, a = M.area, gap = 30;
    const w = (a.w - gap * (n - 1)) / n, h = 380, y = a.y + 30;
    itens.forEach((it, i) => {
      const z = ease.outBack(U.clamp(desde(st, it.n) / 0.35, 0, 1));
      if (z <= 0) return;
      const x = a.x + i * (w + gap), cx = x + w / 2;
      ctx.save(); ctx.translate(cx, y + h / 2); ctx.scale(z, z); ctx.translate(-cx, -(y + h / 2));
      E.ret(ctx, x, y, w, h, { papel: 'superficie', r: 26, seed: 300 + i });
      M.escrever(ctx, `[${String(it.n).padStart(2, '0')}]`, cx, y + 140, { size: 72, papel: 'numero', align: 'center' });
      M.escrever(ctx, 'desenho', cx, y + 236, { size: 44, papel: 'mao', align: 'center' });
      M.escrever(ctx, st.c.tipo === 'porque' ? `da opção ${['A', 'B', 'C'][st.c.k - 1]}` : `da ${st.c.tipo === 'aps' ? 'UBS' : 'prevenção'}`, cx, y + 292, { size: 44, papel: 'mao', align: 'center' });
      ctx.restore();
    });
  }

  globalThis.PECA = {
    // TROQUE: o trecho de cada frase que leva o marca-texto (o número é o da frase no textos.txt)
    DESTAQUE: { 1: 'de repente', 7: 'qualquer uma' },
    // TROQUE: quem chega (no exemplo: um morador de cabelo curto e camisa Sálvia)
    PACIENTE: { quem: 'moradora', style: {} },
    // TROQUE: as pistas que a ficha mostra, por frase do caso
    PISTAS: { 1: ['D04', 'D05'], 2: ['D06'] },
    CENARIO: null,
    // TROQUE: o plano de cada frase desenhada (aqui, a primeira frase de cada porquê fecha no primeiro cartão)
    PLANOS: { 8: { x: 272, y: 620, z: 1.3 }, 10: { x: 272, y: 620, z: 1.3 }, 12: { x: 272, y: 620, z: 1.3 } },
    PORQUE: { 1: provisorio, 2: provisorio, 3: provisorio },
    APS: provisorio,
    PREVENCAO: provisorio,
  };
})();
