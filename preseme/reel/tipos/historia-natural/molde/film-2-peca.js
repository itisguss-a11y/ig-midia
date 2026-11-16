// PRESEME · motor "história natural" · desenho 2/3 · o que é só da peça · MOLDE: o chat 1 troca o que está marcado com TROQUE
// O molde (film-1-molde.js) já põe a régua, o tempo e o nome de cada fase, a linha do primeiro sintoma, a faixa do nível de
// prevenção, a câmera e a frase. Aqui ficam só os destaques do texto (DESTAQUE) e o desenho do cartão de cada fase
// (CARTAO[id], o id é o das FASES do score.js). A mesma pessoa aparece em todos os cartões: é a vida dela que a régua conta.
// Cada CARTAO recebe (ctx, box, st, info): box é o cartão em unidades de desenho (780 × 540; o canto de cima à esquerda é
// 0, 0; o molde amplia 1,1 vezes); info.fase é a frase da cena que está na tela (0 é a primeira; -1, antes dela; 99, cartão
// de fase que já passou) e info.kf, há quantos segundos ela apareceu. Use ap(info, f) para fazer algo entrar na frase f.
// Na abertura (info.cena === 'abertura'), o cartão da primeira fase é a capa: mostre a pessoa.
// Cores e letras só do kit (E.*), da biblioteca (B.*) e das ajudas do molde (HIST.KIT): o cartão sai em qualquer estilo.
// Letra dentro do cartão: 36 ou mais. Pessoa em pé: B.pessoa com pose: 'stand' (sem pose, ela sai sentada).
// Exemplo completo, com seis cartões desenhados: exemplo-oropouche/film-2-peca.js.
(function () {
  const U = globalThis.U, G = globalThis.G, E = globalThis.ESTILOS, B = globalThis.BIB, M = globalThis.HIST;
  const { D } = M;
  const PEC = { DESTAQUE: {}, CARTAO: {}, CENA: {} };
  globalThis.PECA = PEC;

  // TROQUE: o trecho de cada frase que leva marca-texto, pelo número da frase (o termo que cai na prova; um por frase, ou nenhum)
  PEC.DESTAQUE = { 1: '(trecho da frase 01)' };

  // as ajudas do molde (HIST.KIT; não precisa escrever de novo):
  //   ap(info, f, dur, atraso)  o quanto algo ligado à frase f já entrou (0 a 1)
  //   tf(info, f)               há quantos segundos a frase f está na tela (para animar)
  //   texto(ctx, s, x, y, o)    texto dentro do cartão, sem cortar na borda (o: papel, size, align, cor)
  //   chao(ctx, y)              o chão do cartão
  //   virus(ctx, x, y, r, o)    o "bicho" de dentro (vírus, bactéria, parasita), redondo com espinhos; o.k faz entrar crescendo
  //   documento(ctx, x, y, w, h, titulo, o)   ficha, pedido de exame ou notificação, com as linhas em traço
  const { ap, tf, texto, chao, virus, documento } = M.KIT;

  // o cartão provisório: a pessoa em pé e uma folha com o nome da fase (só para o molde rodar; TROQUE)
  function provisorio(ctx, box, info, nome) {
    const piso = box.h - 70;
    chao(ctx, piso);
    B.pessoa(ctx, { quem: 'moradora', pose: 'stand', x: 200, y: piso, s: 0.62, look: 0.4 });
    const ys = documento(ctx, 360, 46, 360, box.h - 150, D(nome), { seed: 820, linhas: 3, tam: 40 });
    ys.forEach((y, i) => { const k = ap(info, i, 0.4); if (k > 0) E.ret(ctx, 380, y - 22, 320 * k, 44, { papel: 'destaque', r: 6, seed: 830 + i, sombra: false }); });
  }

  // TROQUE: o desenho de cada fase. Ele explica a frase que está na tela: cada frase da cena muda o desenho (ap(info, 0),
  // ap(info, 1)...). Ideias que servem a muitas doenças: a pessoa no lugar do risco (B.floresta, B.rua, B.varanda), o bicho
  // que transmite (B.mosquito, B.cobra) dentro da lupa (B.lupa), o vírus que se multiplica sem aparecer (virus() dentro da
  // lupa), o termômetro e a dor (B.termometro, B.dor), o exame (B.seringa, B.glicosimetro), a ficha (documento), o calendário
  // dos dias (B.calendario).
  const C = PEC.CARTAO;
  C.f1 = (ctx, box, st, info) => provisorio(ctx, box, info, 'D04');
  C.f2 = (ctx, box, st, info) => provisorio(ctx, box, info, 'D05');
  C.f3 = (ctx, box, st, info) => provisorio(ctx, box, info, 'D06');
  C.f4 = (ctx, box, st, info) => provisorio(ctx, box, info, 'D07');
})();
