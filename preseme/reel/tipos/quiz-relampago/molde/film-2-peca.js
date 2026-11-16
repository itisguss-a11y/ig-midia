// PRESEME · motor "Quiz relâmpago" · desenho 2/3 · a peça (o chat 1 preenche este arquivo; o molde, film-1, não muda)
// O que a peça preenche aqui:
//   DESTAQUE   o trecho de cada frase que leva o marca-texto: { número da frase: 'trecho escrito igualzinho na frase' }
//   PESSOA     (opcional) quem joga, na abertura: { quem: 'calouro' | 'medica' | ..., pele, penteado, roupa... } (a
//              biblioteca, B.pessoa); null tira a pessoa
//   DESENHO    o desenho pequeno de cada resposta, um por pergunta: DESENHO[1] a DESENHO[n]. Recebe (ctx, st, M, caixa):
//              caixa = { x, y, w, h }, a faixa do painel da resposta entre o selo e o porquê (uns 850 × 280); o desenho é recortado nela
//   ESTUDAR    (opcional) o desenho do fim, embaixo do que estudar: (ctx, st, M, caixa), caixa de uns 840 de largura
// Cada desenho recebe (ctx, st, M):
//   st.desde.resposta  segundos desde a resposta (negativo antes dela): é o relógio do desenho da resposta
//   st.c.q             a pergunta da vez ({ k, p, r, porque })
//   M                  as funções do molde: M.escrever(ctx, texto, x, y, { size, papel, align, cor }), M.marca(ctx, ok, x, y, s, k),
//                      M.caber, M.desenhar, M.wid, M.p01, M.D('D09') e as medidas M.L, M.R, M.CX
// Desenhe com a biblioteca (const B = globalThis.BIB: B.frascoVacina, B.termometro, B.cartaoVacina, B.calendario...; o guia é o
// motor/estilos/BIBLIOTECA.md) e com o kit (globalThis.ESTILOS: E.ret, E.circulo, E.linha, E.seta, E.texto...), com cor por
// papel ('tinta', 'superficie', 'apoio', 'apoioEscuro', 'destaque', 'alerta'), nunca com cor escrita à mão: assim a peça sai em
// qualquer estilo (node preseme.js estilos). Palavra dentro do desenho vem do textos.txt (M.D('D09')). Todo desenho é função do
// tempo (sem Math.random). Letra de rótulo com 34 ou mais, para ler no celular.
(function () {
  const U = globalThis.U, E = globalThis.ESTILOS;
  const ease = U.ease;

  // TROQUE: o desenho provisório, para o molde rodar inteiro desde o primeiro dia. Um cartão com o número da pergunta,
  // que entra com a resposta. A peça troca cada um pelo desenho de verdade (no exemplo das vacinas: a gota riscada e as
  // doses, o calendário de 1989, a caixa térmica com o termômetro, o cartão de vacina e a barra da cobertura).
  function provisorio(ctx, st, M, cx) {
    const z = ease.outBack(U.clamp((st.desde.resposta - 0.2) / 0.35, 0, 1));
    if (z <= 0) return;
    const x = cx.x + cx.w / 2, y = cx.y + cx.h / 2;
    ctx.save(); ctx.translate(x, y); ctx.scale(z, z);
    E.ret(ctx, -150, -100, 300, 200, { papel: 'superficie', r: 22, seed: 300 + st.c.k });
    M.escrever(ctx, `pergunta ${st.c.k}`, 0, -10, { size: 40, papel: 'mao', align: 'center' });
    M.escrever(ctx, 'desenho', 0, 50, { size: 40, papel: 'mao', align: 'center' });
    ctx.restore();
  }

  globalThis.PECA = {
    // TROQUE: o trecho de cada frase que leva o marca-texto (o número é o da frase no textos.txt)
    DESTAQUE: {},
    // TROQUE: quem joga, na abertura (null tira)
    PESSOA: { quem: 'calouro' },
    // TROQUE: o desenho de cada resposta
    DESENHO: { 1: provisorio, 2: provisorio, 3: provisorio, 4: provisorio, 5: provisorio, 6: provisorio, 7: provisorio },
    ESTUDAR: null,
  };
})();
