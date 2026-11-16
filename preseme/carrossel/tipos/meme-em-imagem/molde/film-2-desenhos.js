// PRESEME · carrossel MEME EM IMAGEM · desenho 2 · o desenho da peça (TROQUE: é a parte que muda de meme para meme).
// Um palco é a cena inteira, no tamanho da lâmina (1080 × 1350, o chão em 984), feita com a biblioteca (B.*). Cada painel
// diz qual palco mostra e com que câmera: o mesmo palco com a câmera mais perto é o close da reação, e a cena fica igual
// de um painel para o outro sem desenhar duas vezes. O palco devolve a cabeça de quem fala ou pensa (o rabinho do balão
// vai até ela): cabecas: { calouro: MEME.cabeca({ x, y, s, pose }) }, com o mesmo x, y, s e pose da pessoa.
// Regras: nenhum desenho escreve palavra sozinho (palavra de dentro da cena é rótulo D, por info.rotulo); só as cores da
// paleta; gente só da biblioteca; nada de personagem famoso nem de template de meme conhecido.
(function () {
  const P = globalThis.PRESEME, DS = P.DESENHO, B = globalThis.BIB, MEME = () => P.MEME;
  DS.palco = DS.palco || {};

  // TROQUE · o palco da situação: a sala, o calouro sentado à mesa e outra pessoa em pé
  DS.palco.sala = (ctx, info) => {
    B.sala(ctx, { fundo: info.fundo, quadro: false });
    const m = B.mesa(ctx, { x: 470, w: 330, h: 240 });
    const c = B.cadeira(ctx, { x: 300, tipo: 'madeira' });
    const calouro = { quem: 'calouro', x: c.assento[0], y: c.assento[1], pose: 'sit', look: 0.6, eyes: 'normal', mouth: 'flat' };
    B.pessoa(ctx, calouro);
    B.prancheta(ctx, { x: 480, y: m.topo - 30, s: 0.8, rot: 0.2 });
    const outra = { quem: 'medica', x: 800, y: 984, pose: 'stand', look: -0.5, gesture: 'point' };
    B.pessoa(ctx, outra);
    return { cabecas: { calouro: MEME().cabeca(calouro), outra: MEME().cabeca(outra) } };
  };
  // TROQUE · o palco do close: só o calouro, grande, sem fundo (o painel da virada pinta os raios atrás). No painel largo,
  // quem fala fica de um lado e o balão vai para o outro: a cabeça sai grande
  DS.palco.close = (ctx) => {
    const calouro = { quem: 'calouro', x: 400, y: 1180, s: 1.2, pose: 'stand', eyes: 'wide', mouth: 'o', brows: 'up', sweat: 1, gesture: 'facepalm' };
    B.pessoa(ctx, calouro);
    return { cabecas: { calouro: MEME().cabeca(calouro) } };
  };

  // TROQUE · cada painel: o palco e a câmera ([x, y, w, h] do palco). raios: os raios da virada atrás, centrados em foco
  DS.paineis = {
    p1: { palco: 'sala', camera: [150, 380, 820, 640] },
    p2: { palco: 'sala', camera: [560, 360, 480, 660] },
    p3: { palco: 'close', camera: [160, 480, 560, 400], raios: true, foco: [400, 695] },
  };
})();
