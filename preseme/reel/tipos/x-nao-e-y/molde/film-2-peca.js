// PRESEME · motor do tipo "X não é Y" · desenho 2/3 · A PEÇA (MOLDE)
// O chat 1 (Fable) copia este arquivo para a pasta da peça e troca o que está marcado com TROQUE.
// Exemplo preenchido: ../exemplo-longitudinalidade/film-2-peca.js (a peça "Longitudinalidade não é continuidade").
// O que é só da peça: os nomes dos dois lados, o trecho de cada frase no destaque, as pistas da regra e os desenhos
// de cada conceito, do caso e do fecho. Os instantes de cada coisa vêm de SCORE.momento('nome') (score.js, MOMENTOS).
// Desenhe com o kit de estilos (E.fundo, E.ret, E.circulo, E.poligono, E.linha, E.seta, E.cota, E.texto, E.destaque,
// E.personagem, E.objeto...; ver motor/estilos/README.md): assim a folha dos 3 estilos da parada 2 sai sozinha.
// Regras do desenho: nada encostado (texto, gente e desenho com folga), tudo dentro da área segura (M.L a M.R na
// largura), Coral nunca em letra pequena, e o desenho explica o que a frase diz (régua da ficha, seção 1).
(function () {
  const U = globalThis.U, E = globalThis.ESTILOS, SC = globalThis.SCORE, M = globalThis.MOLDE;
  const { prog, D, AREA } = M;
  const mo = (nome) => SC.momento(nome); // o instante de um momento do score.js (Infinity se ele não existir)
  const em = (t, nome, d = 0.3) => prog(t, mo(nome), d); // de 0 a 1 a partir do momento

  // ---------- o aviso de lugar vazio ----------
  // Enquanto um desenho não for trocado, aparece um quadro tracejado com "TROQUE" e o que vai ali: a folha de quadros
  // mostra o que falta. Apague esta função quando nenhum desenho a usar mais.
  function aFazer(ctx, b, texto, k = 1) {
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha *= Math.min(1, k);
    E.linha(ctx, [[b.x0, b.y0], [b.x1, b.y0], [b.x1, b.y1], [b.x0, b.y1], [b.x0, b.y0]], { lw: 5, tracejado: true, seed: 900 });
    const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
    E.texto(ctx, 'TROQUE', cx, cy - 8, { papel: 'titulo', size: 44, align: 'center' });
    E.texto(ctx, texto, cx, cy + 46, { papel: 'mao', size: 34, align: 'center' });
    ctx.restore();
  }

  // ---------- os desenhos de cada cena ----------
  // st (o que cada desenho recebe): t (o tempo), c (a cena: id, tipo, lado, t0, t1, itens), it (a frase da vez: n, t0,
  // t1) e, nos desenhos da cena diferenca, caixa ({ x0, x1, y0, y1 }: o espaço de cada lado).
  // A área livre do desenho, embaixo do texto, é M.AREA ({ x0, x1, y0, y1 }); a área segura vai de M.L a M.R.

  // TROQUE: o conceito Y (o que se confunde com X) funcionando, na cena 'y' (frases 3 e 4). No exemplo: a pessoa anda
  // pelos atendimentos de um problema, e a linha termina.
  function conceitoY(ctx, st) { aFazer(ctx, AREA, 'o conceito Y funcionando', prog(st.t, st.c.t0, 0.4)); }

  // TROQUE: o conceito X (o do título) funcionando, na cena 'x' (frases 5 e 6). No exemplo: o fio da equipe da UBS
  // atravessa os anos até a pessoa, e ela volta.
  function conceitoX(ctx, st) { aFazer(ctx, AREA, 'o conceito X funcionando', prog(st.t, st.c.t0, 0.4)); }

  // TROQUE: Y e X em miniatura, lado a lado, na cena 'diferenca' (frase 7), cada um na sua caixa (st.caixa). Use o
  // mesmo desenho das cenas 'y' e 'x', em pé ou menor: quem olha reconhece os dois.
  function miniY(ctx, st) { aFazer(ctx, st.caixa, 'Y pequeno', prog(st.t, st.it.t0, 0.4)); }
  function miniX(ctx, st) { aFazer(ctx, st.caixa, 'X pequeno', prog(st.t, st.it.t0, 0.4)); }

  // TROQUE: o caso concreto, que cresce frase a frase (frases 8 a 11) e mostra a diferença acontecendo. No exemplo:
  // Dona Maria e três problemas no caminho da mesma equipe; cada problema termina, o caminho continua.
  function caso(ctx, st) { aFazer(ctx, { x0: M.L, x1: M.R, y0: 760, y1: AREA.y1 }, 'o caso, do começo ao fim', prog(st.t, st.c.t0, 0.4)); }

  // TROQUE: o fecho, com os dois lados (frase 14). Se apagar a linha "fecho" do DESENHO lá embaixo, o molde mostra as
  // duas etiquetas com o sinal de diferente.
  function fecho(ctx, st) { aFazer(ctx, { x0: M.L, x1: M.R, y0: 700, y1: AREA.y1 }, 'o fecho com os dois lados', prog(st.t, st.c.t0, 0.4)); }

  globalThis.PECA = {
    // os nomes dos dois lados (palavras do textos.txt): x é o conceito do título, y o que se confunde com ele
    NOMES: { x: 'D02', y: 'D01' },
    // TROQUE: o trecho de cada frase que leva marca-texto, pelo número da frase. Tem de estar escrito igual na frase; se
    // o trecho sumir da frase, ela sai sem marca. A [01] já sai com "não é" marcado. Exemplo: 7: 'acompanha a pessoa'.
    DESTAQUE: {},
    // a regra (cena 'regra'): em cada linha, as palavras-pista do textos.txt que levam ao nome do lado
    REGRA: [
      { lado: 'x', pistas: ['D03', 'D04'], frase: 12 },
      { lado: 'y', pistas: ['D05', 'D06'], frase: 13 },
    ],
    // o desenho de cada cena (pelo id da cena, ou pelo lado no caso dos conceitos)
    DESENHO: { y: conceitoY, x: conceitoX, mini_y: miniY, mini_x: miniX, caso, fecho },
  };
})();
