// PRESEME · tipo "tour" · desenho 2/3 · A PEÇA "O que tem numa UBS, sala por sala?" (exemplo do tipo)
// As salas por dentro, nas medidas de um quadro inteiro (1080 de largura, chão em y 1400), com a biblioteca: sala,
// consultório, mesa, cadeira, caixa térmica, frasco de vacina, seringa, pomada, tesoura, copo. O que a biblioteca ainda
// não tem (a geladeira de vacina, o carrinho de curativo, o braço da cadeira de coleta, os tubos de exame e a cadeira do
// dentista) está aqui, em funções com nome: são candidatos à biblioteca.
// A entrada por dentro e o lado de fora ficam com o desenho padrão do molde (a recepção e o território da biblioteca).
(function () {
  const E = globalThis.ESTILOS, B = globalThis.BIB;
  const CH = 1400;

  // ---------- desenhos novos (candidatos à biblioteca) ----------
  // a geladeira de vacina: corpo, porta, puxador e o visor da temperatura (sem número: o número é texto da peça)
  function geladeira(ctx, x, w = 170, h = 420) {
    E.ret(ctx, x - w / 2, CH - h, w, h, { papel: 'superficie', r: 10, seed: 701 });
    E.linha(ctx, [[x - w / 2 + 10, CH - h + 110], [x + w / 2 - 10, CH - h + 110]], { lw: 5, seed: 702 });
    E.ret(ctx, x + w / 2 - 34, CH - h + 150, 14, 120, { papel: 'apoioEscuro', r: 6, seed: 703, sombra: false, hachura: false });
    E.ret(ctx, x - w / 2 + 22, CH - h + 26, 74, 52, { papel: 'noite', r: 6, seed: 704, sombra: false, hachura: false });
    E.ret(ctx, x - w / 2 + 32, CH - h + 38, 54, 28, { papel: 'apoio', r: 4, seed: 705, sombra: false, hachura: false, contorno: false });
    for (let i = 0; i < 3; i++) E.linha(ctx, [[x - w / 2 + 18, CH - h + 190 + i * 70], [x + w / 2 - 50, CH - h + 190 + i * 70]], { lw: 3, seed: 706 + i, tracejado: true });
  }
  // o carrinho de curativo: duas prateleiras sobre rodinhas; devolve o y do tampo
  function carrinho(ctx, x, w = 200) {
    const top = CH - 300;
    for (const sx of [x - w / 2 + 16, x + w / 2 - 16]) E.linha(ctx, [[sx, top + 10], [sx, CH - 26]], { lw: 8, seed: 711 + (sx > x ? 1 : 0) });
    E.ret(ctx, x - w / 2, top, w, 20, { papel: 'apoioEscuro', r: 4, seed: 713 });
    E.ret(ctx, x - w / 2, CH - 150, w, 18, { papel: 'apoioEscuro', r: 4, seed: 714 });
    for (const sx of [x - w / 2 + 16, x + w / 2 - 16]) E.circulo(ctx, sx, CH - 14, 14, { papel: 'tinta', seed: 715 + (sx > x ? 1 : 0), sombra: false, hachura: false });
    return top;
  }
  // os tubos de exame num suporte (o líquido no alerta, a tampa no destaque)
  function tubos(ctx, x, y, n = 4) {
    E.ret(ctx, x - 20 - n * 17, y - 34, n * 34 + 40, 34, { papel: 'apoioEscuro', r: 6, seed: 721 });
    for (let i = 0; i < n; i++) {
      const tx = x - n * 17 + 17 + i * 34;
      E.ret(ctx, tx - 9, y - 110, 18, 86, { papel: 'superficie', r: 8, seed: 722 + i, sombra: false });
      E.ret(ctx, tx - 7, y - 70, 14, 44, { papel: 'alerta', r: 6, seed: 730 + i, sombra: false, hachura: false, contorno: false });
      E.ret(ctx, tx - 11, y - 124, 22, 18, { papel: i % 2 ? 'destaque' : 'apoio', r: 4, seed: 740 + i, sombra: false });
    }
  }
  // o braço da cadeira de coleta: o apoio onde a pessoa estende o braço
  function apoioBraco(ctx, x, y, w = 190) {
    E.linha(ctx, [[x + 30, y + 22], [x + 30, CH - 4]], { lw: 9, seed: 751 });
    E.ret(ctx, x, y, w, 30, { papel: 'apoioEscuro', r: 14, seed: 752 });
  }
  // a cadeira do dentista: a base, o assento, o encosto reclinado, o refletor no braço e a bandeja
  function cadeiraDentista(ctx, x) {
    E.ret(ctx, x - 70, CH - 60, 140, 60, { papel: 'apoioEscuro', r: 10, seed: 761 });
    E.ret(ctx, x - 26, CH - 210, 52, 160, { papel: 'apoioEscuro', r: 8, seed: 762 });
    E.poligono(ctx, [[x - 150, CH - 250], [x + 110, CH - 250], [x + 130, CH - 200], [x - 150, CH - 200]], { papel: 'apoio', seed: 763 });
    E.poligono(ctx, [[x + 100, CH - 250], [x + 150, CH - 250], [x + 290, CH - 450], [x + 245, CH - 470]], { papel: 'apoio', seed: 764 });
    E.ret(ctx, x + 248, CH - 520, 74, 52, { papel: 'superficie', r: 20, seed: 765 });
    E.poligono(ctx, [[x - 150, CH - 250], [x - 240, CH - 160], [x - 200, CH - 150], [x - 120, CH - 230]], { papel: 'apoio', seed: 766 });
    // o refletor: o poste, o braço e a luz
    E.linha(ctx, [[x + 360, CH - 40], [x + 360, CH - 640], [x + 160, CH - 640]], { lw: 9, seed: 767 });
    E.ret(ctx, x + 70, CH - 680, 130, 70, { papel: 'superficie', r: 30, seed: 768 });
    E.ret(ctx, x + 92, CH - 664, 86, 38, { papel: 'destaque', r: 18, seed: 769, sombra: false, hachura: false });
    // a bandeja dos instrumentos, no braço do lado
    E.linha(ctx, [[x - 120, CH - 250], [x - 190, CH - 330]], { lw: 7, seed: 770 });
    E.ret(ctx, x - 300, CH - 350, 180, 26, { papel: 'superficie', r: 6, seed: 771 });
    for (let i = 0; i < 4; i++) E.linha(ctx, [[x - 286 + i * 40, CH - 362], [x - 262 + i * 40, CH - 392]], { lw: 5, seed: 772 + i });
  }

  globalThis.PECA = {
    DESTAQUE: {
      1: 'sala por sala',
      2: 'o acolhimento',
      3: 'técnico ou auxiliar de enfermagem',
      4: 'supervisiona',
      5: 'também',
      6: 'colhe o material para exame',
      7: 'o enfermeiro e o médico',
      8: 'equipe de saúde bucal',
      9: 'a área',
      10: 'a sua função e quem faz',
    },
    GUIA: {},
    SALA: {
      // 1 · a sala de vacinação: a geladeira, a mesa com a caixa térmica, os frascos e a seringa
      vacina: (ctx) => {
        const r = B.sala(ctx, { quadro: false, janela: false });
        geladeira(ctx, 960);
        const m = B.mesa(ctx, { x: 530, y: CH, w: 280, h: 250 });
        B.caixaTermica(ctx, { x: 470, y: m.topo, w: 150, h: 110, aberta: 0.4, s: 1 });
        B.frascoVacina(ctx, { x: 590, y: m.topo, s: 0.9 });
        B.frascoVacina(ctx, { x: 630, y: m.topo, s: 0.9 });
        B.seringa(ctx, { x: 560, y: m.topo - 120, s: 0.6, rot: -0.3 });
        return r;
      },
      // 2 · a sala de curativo: a maca do consultório, o carrinho com a pomada, a gaze e a tesoura, e quem está sendo cuidado
      curativo: (ctx) => {
        const r = B.consultorio(ctx);
        const top = carrinho(ctx, 980);
        B.pomada(ctx, { x: 950, y: top - 18, s: 0.7 });
        E.ret(ctx, 1000, top - 34, 50, 34, { papel: 'superficie', r: 4, seed: 790 }); // a gaze
        B.tesoura(ctx, { x: 990, y: top - 60, s: 0.6 });
        B.pessoa(ctx, { quem: 'idoso', x: r.maca[0] + 60, y: r.maca[1] + 10, pose: 'sit', look: 0.4 });
        return r;
      },
      // 3 · a sala de medicação e coleta: a cadeira com o apoio de braço, quem vai colher o exame e a mesinha com os tubos
      coleta: (ctx) => {
        const r = B.sala(ctx, { quadro: true, janela: false });
        const c = B.cadeira(ctx, { x: 360, y: CH, tipo: 'plastico' });
        B.pessoa(ctx, { quem: 'moradora', x: c.assento[0], y: c.assento[1], pose: 'sit', look: 0.45 });
        apoioBraco(ctx, 430, c.assento[1] - 70);
        const m = B.mesa(ctx, { x: 960, y: CH, w: 190, h: 240 });
        tubos(ctx, 960, m.topo, 4);
        B.copo(ctx, { x: 1010, y: m.topo - 4, s: 0.6, nivel: 0.5 });
        return r;
      },
      // 4 · o consultório: a maca e a mesa com o computador (da biblioteca)
      consultorio: (ctx) => B.consultorio(ctx),
      // 5 · o consultório odontológico: a cadeira do dentista, o refletor e a bandeja
      odonto: (ctx) => {
        const r = B.sala(ctx, { quadro: false, janela: true });
        cadeiraDentista(ctx, 640);
        return r;
      },
    },
  };
})();
