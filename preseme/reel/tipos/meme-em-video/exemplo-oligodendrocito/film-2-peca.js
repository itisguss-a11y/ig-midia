// PRESEME · motor "meme em vídeo" · desenho 2 · a PEÇA: "o que é um oligodendrócito?" (a piada é dele:
// "o que é um oligodendrócito? Eu não sei, mas sei os princípios e diretrizes do SUS...").
// texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.
// Aqui fica só o que é deste meme: os trechos em destaque, o desenho da situação, da virada e do fecho e o desenho de
// cada cartão da lição. O resto (tempos, cortes, clarão, raios, cartões, fichas, carimbo, seta) é do molde.
(function () {
  const U = globalThis.U, E = globalThis.ESTILOS, SC = globalThis.SCORE, TX = globalThis.TEXTOS;
  const MM = globalThis.PRESEME_MEME, M = MM.M;
  const p = M.p, D = M.D;

  // a figura da questão: o oligodendrócito (o corpo da célula e os braços que enrolam a bainha nos axônios)
  function oligodendrocito(ctx, x, y, w, h) {
    const cx = x + w / 2, cy = y + h / 2, ya = y + 46, yb = y + h - 46;
    E.linha(ctx, [[x + 10, ya], [x + w - 10, ya]], { lw: 6, seed: 2001 });
    E.linha(ctx, [[x + 10, yb], [x + w - 10, yb]], { lw: 6, seed: 2002 });
    const bainhas = [[x + 70, ya], [x + w - 180, ya], [x + 120, yb], [x + w - 130, yb]];
    bainhas.forEach(([bx, by], i) => {
      E.linha(ctx, [[cx, cy], [bx + 55, by]], { lw: 8, seed: 2010 + i });
      E.ret(ctx, bx, by - 20, 110, 40, { papel: 'apoio', r: 18, sombra: false, seed: 2020 + i });
    });
    E.circulo(ctx, cx, cy, 40, { papel: 'apoioEscuro', seed: 2030 });
  }

  // o calouro na carteira, de frente; a mesa cobre as pernas (origem: o quadril, no assento)
  function calouroSentado(ctx, st, { x = 760, y = 1450, s = 1.55, eyes = 'wide', mouth = 'wavy', brows = 'worried', sweat = 0, look = -0.7, gesture = null } = {}) {
    E.personagem(ctx, { quem: 'calouro', x, y, s, pose: 'sit', eyes, mouth, brows, sweat, look, gesture, seed: 2100, style: { shirt: E.PAL.folha, trim: E.PAL.marca } });
  }

  const FOLHA = { x: 70, y: 600, w: 540, h: 820, rot: -0.05 };
  const termos = () => SC.cena('licao').itens.map((it) => M.termo(it.n)).filter(Boolean);

  MM.PECA = {
    // o trecho de cada frase que vai no destaque (nos cartões da lição, o molde já destaca o termo antes da vírgula)
    DESTAQUE: { 1: 'oligodendrócito', 3: 'princípios e diretrizes', 9: 'princípio', 10: 'Constituição, art. 198' },
    etiquetaLicao: 'D04',
    focoPreparacao: [[240, 940], null], // o zoom seco na figura da questão; no "Eu não sei...", volta ao quadro inteiro
    centroVirada: [520, 1100],

    // 1. a situação: a prova de histologia, a figura que ninguém reconhece e o calouro suando
    preparacao(ctx, st) {
      const naoSei = st.i >= 1; // "Eu não sei..."
      calouroSentado(ctx, st, { eyes: naoSei ? 'worried' : 'wide', mouth: naoSei ? 'flat' : 'wavy', sweat: U.clamp(0.35 + st.u * 0.9, 0, 1), look: naoSei ? 0 : -0.7 });
      M.OBJ.mesa(ctx, 1330);
      M.OBJ.folhaDeProva(ctx, Object.assign({ titulo: D('D01'), questao: D('D02'), legenda: D('D03'), figura: oligodendrocito }, FOLHA));
    },

    // 2. a virada: de pé, confiante, no meio dos raios
    virada(ctx, st) {
      E.chao(ctx, 1540, { seed: 2200 });
      E.personagem(ctx, { quem: 'calouro', x: 520, y: 1540, s: 1.4, pose: 'stand', eyes: 'sparkle', mouth: 'grin', brows: 'determined', gesture: 'akimbo', seed: 2201, style: { shirt: E.PAL.folha, trim: E.PAL.marca } });
    },

    // 3. a lição: o desenho de cada cartão, na ordem das frases (nomes da biblioteca do molde)
    icones: ['todos', 'prevencaoCura', 'semFurarFila', 'conselho', 'descentralizar'],

    // 4. o fecho: a prova volta, agora com a lista escrita; o calouro dá de ombros; o livro da Constituição aparece
    fecho(ctx, st) {
      const its = st.c.itens;
      M.OBJ.folhaDeProva(ctx, Object.assign({ titulo: D('D01'), questao: D('D02'), legenda: D('D03'), figura: oligodendrocito, respostas: termos(), kResp: U.clamp(st.dt / 1.2, 0, 1) }, FOLHA));
      E.personagem(ctx, { quem: 'calouro', x: 800, y: 1150, s: 0.62, pose: 'stand', eyes: 'happy', mouth: 'smirk', gesture: 'shrug', seed: 2300, style: { shirt: E.PAL.folha, trim: E.PAL.marca } });
      if (its[1] && st.t >= its[1].t0) {
        const k = p(st.t, its[1].t0, 0.5);
        ctx.save(); ctx.translate(775, 1300); ctx.scale(0.5, 0.5); M.ICONE.lei(ctx, 0, 0, 1, k, st.t); ctx.restore();
        E.texto(ctx, D('D06'), 760, 1445, { papel: 'mao', size: 34, align: 'center', alpha: k });
      }
    },
    carimboFecho: { texto: 'D05', x: 380, y: 905, rot: -0.14, size: 58 },
    setaFecho: { de: [610, 1150], para: [700, 1240], curva: -0.35 },
  };
})();
