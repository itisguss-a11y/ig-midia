// PRESEME · tipo "um dia, contado pela hora" · desenho 2/3 · A PEÇA · MOLDE: o chat 1 troca o que está marcado com TROQUE
// Só o que é da peça: o trecho com marca-texto de cada frase, a quebra do título (opcional), as pessoas (opcional) e,
// de cada momento, o objeto do dia (DIA.CENA[id]) e o que a lente mostra (o centro dela em DIA.LENTE[id]).
// Momento sem DIA.CENA também sai: o molde desenha o chão e a lente com o número do momento.
// Objetos prontos do molde: DIA.OBJ.pacote e DIA.OBJ.caixa. Dentro da lente, prontos: DIA.DENTRO.lista e DIA.DENTRO.palavra.
// Desenho próprio: com G (o motor de desenho) e as cores de DIA.C, como no ../exemplo-sus-hoje/film-2-peca.js.
// Texto: DIA.txt e DIA.hand (letra do estilo); palavra dentro da lente com DIA.caber, para caber em qualquer estilo.
(function () {
  const G = globalThis.G, Ch = globalThis.Ch, DIA = globalThis.DIA;
  const { C, INK, TINTA, L, R, GY, D, hand } = DIA;

  // TROQUE: o trecho que leva marca-texto em cada frase, pelo número da frase (sem trecho, a frase sai sem marca)
  Object.assign(DIA.DESTAQUE, { 1: 'hoje', 3: 'não aparece', 5: 'categoria A', 8: 'categoria B', 12: 'nem viu', 13: 'não aparece' });
  // TROQUE (opcional): a quebra de linha do título; sem ela, o molde quebra sozinho
  Object.assign(DIA.QUEBRA, {});
  // TROQUE (opcional): o protagonista (quem responde na abertura). Sem isso, é o calouro do kit (DIA.GENTE.protagonista).

  // ---------- TROQUE · momento "manha": um pacote pronto do molde e, na lente, a lista conferida ----------
  DIA.LENTE.manha = [R - 215, 1080];
  DIA.CENA.manha = (ctx, st) => {
    DIA.chao(ctx);
    DIA.OBJ.pacote(ctx, { x: L + 20, w: 280, h: 400, cor: 'marca', linhas: ['TROQUE', 'o objeto'], miudo: 'o que está impresso nele' });
    const [lx, ly] = DIA.LENTE.manha;
    DIA.lente(ctx, lx, ly, 200, (c) => DIA.DENTRO.lista(c, lx, ly, { palavra: D('D07') }), { k: st.kLente });
  };

  // ---------- TROQUE · momento "tarde": uma caixa pronta do molde e, na lente, uma coisa grande e a palavra ----------
  DIA.LENTE.tarde = [R - 215, 1080];
  DIA.CENA.tarde = (ctx, st) => {
    DIA.chao(ctx);
    DIA.OBJ.caixa(ctx, { x: L + 10, w: 440, h: 300, cor: 'folha', linhas: ['TROQUE', 'a caixa'] });
    const [lx, ly] = DIA.LENTE.tarde;
    DIA.lente(ctx, lx, ly, 200, (c) => DIA.DENTRO.palavra(c, lx, ly, { grande: D('D08'), palavra: D('D09') }), { k: st.kLente });
  };

  // ---------- TROQUE · momento "noite": desenho próprio (a janela acesa) e, na lente, o que ninguém vê ----------
  DIA.LENTE.noite = [R - 215, 1080];
  DIA.CENA.noite = (ctx, st) => {
    DIA.chao(ctx);
    G.rrect(ctx, L + 20, GY - 520, 360, 520, 8, { fill: C.branco, stroke: TINTA, lw: 7, seed: 71, hatch: DIA.HAT }); // contorno sobre o fundo: TINTA
    G.rrect(ctx, L + 90, GY - 440, 220, 180, 6, { fill: C.marca, stroke: INK, lw: 6, seed: 72 }); // por cima do branco: INK
    G.line(ctx, [[L + 200, GY - 440], [L + 200, GY - 260]], { color: INK, lw: 5, seed: 73 });
    Ch.person(ctx, { x: L + 470, y: GY, pose: 'stand', s: 0.95, eyes: 'normal', mouth: 'smile', look: 0.6, style: DIA.GENTE.protagonista });
    const [lx, ly] = DIA.LENTE.noite;
    DIA.lente(ctx, lx, ly, 200, (c) => {
      G.ellipse(c, lx, ly - 30, 90, 90, { fill: C.salvia, stroke: null, lw: 0, seed: 74 });
      hand(c, D('D10'), lx, ly + 140, { size: DIA.caber(c, D('D10'), 58, 250), color: C.marca, align: 'center' });
    }, { k: st.kLente });
  };
})();
