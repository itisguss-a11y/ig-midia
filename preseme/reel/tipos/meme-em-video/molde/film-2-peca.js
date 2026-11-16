// PRESEME · motor "meme em vídeo" · desenho 2 · a PEÇA (é o único arquivo de desenho que o chat 1 escreve).
// Aqui fica só o que é deste meme: os trechos em destaque, o desenho da situação, da virada e do fecho e o desenho de
// cada cartão da lição. O resto (tempos, cortes, clarão, raios, cartões, fichas, carimbo, seta) é do molde.
// Tudo o que se troca está marcado com TROQUE. O desenho usa o kit de estilos (E = globalThis.ESTILOS): E.personagem,
// E.ret, E.circulo, E.linha, E.seta, E.texto, E.objeto ('casa', 'prancheta', 'vaso', 'sol'), e a biblioteca do molde
// (M.OBJ.folhaDeProva, M.OBJ.mesa, M.ICONE.*). Cor sai do papel ('tinta', 'apoio', 'destaque'...), nunca de código.
(function () {
  const U = globalThis.U, E = globalThis.ESTILOS, SC = globalThis.SCORE;
  const MM = globalThis.PRESEME_MEME, M = MM.M;
  const p = M.p, D = M.D;

  // TROQUE: a figura que a situação mostra (aqui, um "?" desenhado no lugar da figura da questão). Recebe a caixa onde
  // cabe. O carimbo do fecho bate em cima dela: desenhe, não escreva (letra embaixo do carimbo o conferir acusa).
  function figura(ctx, x, y, w, h) {
    E.ret(ctx, x + 20, y + 10, w - 40, h - 20, { papel: 'apoio', r: 24, sombra: false, seed: 2001 });
    const cx = x + w / 2, cy = y + h / 2, gancho = [];
    for (let a = -Math.PI; a <= Math.PI / 2 + 1e-6; a += Math.PI / 12) gancho.push([cx + Math.cos(a) * 44, cy - 50 + Math.sin(a) * 44]);
    gancho.push([cx, cy + 25]);
    E.linha(ctx, gancho, { lw: 16, seed: 2002 });
    E.circulo(ctx, cx, cy + 62, 11, { papel: 'tinta', sombra: false, hachura: false, seed: 2003 });
  }

  // o estudante (o "calouro" do kit) sentado na carteira; a mesa cobre as pernas (origem: o quadril, no assento)
  function calouroSentado(ctx, st, { x = 760, y = 1450, s = 1.55, eyes = 'wide', mouth = 'wavy', brows = 'worried', sweat = 0, look = -0.7, gesture = null } = {}) {
    E.personagem(ctx, { quem: 'calouro', x, y, s, pose: 'sit', eyes, mouth, brows, sweat, look, gesture, seed: 2100, style: { shirt: E.PAL.folha, trim: E.PAL.marca } });
  }

  const FOLHA = { x: 70, y: 600, w: 540, h: 820, rot: -0.05 };
  const termos = () => SC.cena('licao').itens.map((it) => M.termo(it.n)).filter(Boolean);

  MM.PECA = {
    // TROQUE: o trecho de cada frase que vai no destaque, pelo número da frase. Ex.: { 1: 'oligodendrócito' }.
    // Nos cartões da lição o molde já destaca o termo antes da vírgula.
    DESTAQUE: {},
    // TROQUE: a palavra [Dnn] da etiqueta que fica no alto durante a lição (a fonte: "Lei 8.080, art. 7º")
    etiquetaLicao: 'D04',
    // TROQUE: o foco do zoom seco da situação, um ponto por frase (x, y no quadro 1080 × 1920). A câmera pula para ele
    // aos 1,4 s da 1.ª frase (a 1.ª frase sempre tem foco: o baque toca ali) e o ponto fica parado na tela; null volta
    // ao quadro inteiro. Texto do desenho longe do foco sai da área segura: o conferir acusa. E o centro dos raios da virada.
    focoPreparacao: [[240, 940], null],
    centroVirada: [520, 1100],

    // 1. TROQUE: a situação (o estudante na prova, no plantão, de madrugada com o livro...). st.i é a frase da vez.
    preparacao(ctx, st) {
      const reagiu = st.i >= 1; // a 2.ª frase, a reação
      calouroSentado(ctx, st, { eyes: reagiu ? 'worried' : 'wide', mouth: reagiu ? 'flat' : 'wavy', sweat: U.clamp(0.35 + st.u * 0.9, 0, 1), look: reagiu ? 0 : -0.7 });
      M.OBJ.mesa(ctx, 1330);
      M.OBJ.folhaDeProva(ctx, Object.assign({ titulo: D('D01'), questao: D('D02'), legenda: D('D03'), figura }, FOLHA));
    },

    // 2. TROQUE: a virada, a cara da piada (gesto e expressão do kit: cheer, akimbo, thumbsUp, shrug...)
    virada(ctx, st) {
      E.chao(ctx, 1540, { seed: 2200 });
      E.personagem(ctx, { quem: 'calouro', x: 520, y: 1540, s: 1.4, pose: 'stand', eyes: 'sparkle', mouth: 'grin', brows: 'determined', gesture: 'cheer', seed: 2201, style: { shirt: E.PAL.folha, trim: E.PAL.marca } });
    },

    // 3. TROQUE: o desenho de cada cartão da lição, na ordem das frases. Nome da biblioteca do molde (todos,
    // prevencaoCura, semFurarFila, conselho, descentralizar, lei) ou uma função (ctx, cx, cy, s, k, t) => {...}
    // desenhada aqui (k vai de 0 a 1 na entrada do cartão).
    icones: ['lei', 'todos', 'prevencaoCura', 'conselho', 'descentralizar'],

    // 4. TROQUE: o fecho, a volta à situação. Aqui a folha volta com os termos da lição escritos, o estudante dá de
    // ombros e, na 2.ª frase, aparece o livro com o rótulo [D06].
    fecho(ctx, st) {
      const its = st.c.itens;
      M.OBJ.folhaDeProva(ctx, Object.assign({ titulo: D('D01'), questao: D('D02'), legenda: D('D03'), figura, respostas: termos(), kResp: U.clamp(st.dt / 1.2, 0, 1) }, FOLHA));
      E.personagem(ctx, { quem: 'calouro', x: 800, y: 1150, s: 0.62, pose: 'stand', eyes: 'happy', mouth: 'smirk', gesture: 'shrug', seed: 2300, style: { shirt: E.PAL.folha, trim: E.PAL.marca } });
      if (its[1] && st.t >= its[1].t0) {
        const k = p(st.t, its[1].t0, 0.5);
        ctx.save(); ctx.translate(775, 1300); ctx.scale(0.5, 0.5); M.ICONE.lei(ctx, 0, 0, 1, k, st.t); ctx.restore();
        E.texto(ctx, D('D06'), 760, 1445, { papel: 'mao', size: 34, align: 'center', alpha: k });
      }
    },
    // TROQUE: o carimbo do fecho (a palavra [Dnn], onde e com que giro) e a seta que entra na 2.ª frase do fecho.
    // Ponha null em qualquer um para não usar.
    carimboFecho: { texto: 'D05', x: 380, y: 905, rot: -0.14, size: 58 },
    setaFecho: { de: [610, 1150], para: [700, 1240], curva: -0.35 },
  };
})();
