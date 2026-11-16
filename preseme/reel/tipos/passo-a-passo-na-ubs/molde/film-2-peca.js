// PRESEME · série "Na UBS, e agora?" · desenho 2/3 · MOLDE do que é só da peça
// O chat 1 (Fable) copia este arquivo para a pasta da peça e troca o que está marcado com TROQUE.
// Exemplo completo: ../exemplo-engasgo/film-2-peca.js (engasgo no adulto).
// O molde (film-1-molde.js) põe em volta o texto, o trilho do protocolo, a conta, o cartão da pergunta e o do 192.
// Regras: todo desenho é função do tempo (nada de Math.random); palavra escrita no desenho vem do textos.txt por D('Dnn').
// Cor: o que fica sobre o fundo pede o papel (COR.tinta, COR.texto, COR.cartao, COR.apoio, COR.chao); o que fica por cima de
// uma cor pede B.sobre(cor) (escura sobre clara, Papel sobre escura, Noite sobre Coral). Assim a peça sai em qualquer estilo do
// kit (na lousa, uma linha Floresta some). A paleta pelo nome (C.coral, C.folha...) fica para o que é sempre daquela cor.
(function () {
  const U = globalThis.U, G = globalThis.G, Ch = globalThis.Ch, B = globalThis.UBS;
  const { C, COR, INK, L, R, CX, GY, D, txt, hand } = B;

  // TROQUE: o trecho de cada frase que leva marca-texto, pelo número da frase. Se o trecho sumir da frase, ela sai sem marca.
  const DESTAQUE = { 3: 'agora' };

  // TROQUE: o paciente desta peça (pele, cabelo, roupa), na paleta do perfil e nas cores de gente. Ele ou ela: PACIENTE no score.js.
  const PACIENTE = B.vestir({ skin: C.pele, hair: C.grisalho, hairStyle: 'short', outfit: 'shirt', shirt: C.coral, trim: C.noite, collar: C.coral, bottoms: 'pants', shorts: C.folha, build: 'regular', shoes: C.noite });

  // TROQUE (se quiser): a aparência da agente e do estudante nesta peça (pele, cabelo, roupa); a cena não muda.
  // Vazio = as da série (film-1-molde.js). Exemplo: const ACS = { skin: C.pele, hairStyle: 'bun' };
  const ACS = {};
  const ESTUDANTE = {};

  // ---------- o lugar (a sala da casa visitada; troque se a peça acontecer em outro lugar) ----------
  function sala(ctx) {
    // a janela: COR.apoio (Sálvia; no chapado, que tem fundo Sálvia, o cartão), com os caixilhos na cor que se lê por cima
    G.rrect(ctx, R - 300, 960, 250, 210, 14, { fill: COR.apoio, stroke: INK, lw: 6, seed: 101, hatch: { color: B.rgba(B.sobre(COR.apoio), 0.12), gap: 12 } });
    G.line(ctx, [[R - 175, 960], [R - 175, 1170]], { color: B.sobre(COR.apoio), lw: 5, seed: 102 });
    G.line(ctx, [[R - 300, 1065], [R - 50, 1065]], { color: B.sobre(COR.apoio), lw: 5, seed: 103 });
    B.chao(ctx, GY);
  }
  // o desenho padrão: a sala, o estudante e o paciente de pé. Roda enquanto o gesto da cena não foi desenhado.
  function padrao(ctx, st) {
    sala(ctx);
    Ch.person(ctx, { x: 360, y: GY, pose: 'stand', s: 1.0, eyes: 'normal', mouth: 'flat', look: 0.6, style: B.ESTUDANTE });
    Ch.person(ctx, { x: 640, y: GY, pose: 'stand', s: 1.02, eyes: 'wide', mouth: 'o', brows: 'worried', look: -0.5, style: PACIENTE });
  }

  const GESTO = {};

  // a situação: o primeiro quadro já é o problema (o gancho dos 3 s). Duas batidas que o score.js já toca:
  // ABERTURA.queda (0,3 s, o "baque": algo cai) e ABERTURA.alerta (1,2 s, o "pop": o "!" salta). Na 2.ª frase, o close (FOCO.situacao).
  B.CENA.situacao = (ctx, st) => {
    const u = st.u, AB = globalThis.SCORE.ABERTURA;
    sala(ctx);
    const entra = (1 - U.ease.outCubic(U.clamp(u / 0.7, 0, 1))) * 380; // a ACS e o estudante chegam correndo
    Ch.person(ctx, { x: L + 90 - entra, y: GY, pose: 'stand', s: 1.0, eyes: 'wide', mouth: 'o', brows: 'worried', look: 0.8, style: B.ACS });
    Ch.person(ctx, { x: L + 290 - entra, y: GY, pose: 'stand', s: 1.02, eyes: 'wide', mouth: 'o', brows: 'worried', look: 0.8, style: B.ESTUDANTE });
    // TROQUE: o paciente no problema da peça (no engasgo: sentado à mesa, as mãos no pescoço)
    Ch.person(ctx, { x: 680 + Math.sin(st.t * 38) * 4, y: GY, pose: 'stand', s: 1.02, eyes: 'wide', mouth: 'o', brows: 'worried', sweat: 1, look: -0.4, style: PACIENTE });
    // TROQUE: o que cai em ABERTURA.queda (aqui, um copo)
    const d = Math.max(0, u), y = GY - 300 + Math.min(280, 0.5 * (280 * 2 / (AB.queda * AB.queda)) * d * d);
    G.rrect(ctx, 820, y - 40, 50, 64, 8, { fill: C.branco, stroke: INK, lw: 5, seed: 151 });
    if (st.i === 0 && u >= AB.alerta) { // o "!" (fixo da série)
      const k = U.ease.outBack(U.clamp((u - AB.alerta) / 0.3, 0, 1));
      ctx.save(); ctx.translate(800, 935); ctx.scale(k, k); // baixo o bastante para caber no close médio
      G.ellipse(ctx, 0, 0, 54, 54, { fill: C.coral, stroke: INK, lw: 6, seed: 152 });
      txt(ctx, '!', 0, 30, { size: 84, align: 'center', color: B.sobre(C.coral) }); // Noite sobre Coral (Papel sobre Coral não chega a 3:1)
      ctx.restore();
    }
  };

  // TROQUE: um desenho por gesto, com o mesmo nome do "gesto" no ROTEIRO do score.js.
  // Gesto contado (conta no ROTEIRO): use B.batida(st.c, st.t), que vale 1 em cada batida da conta e volta a 0 (exemplo: GESTO.golpes).
  GESTO.passo1 = padrao;
  GESTO.passo2 = padrao;
  GESTO.passo3 = padrao;
  GESTO.passo4 = padrao;
  GESTO.alerta = padrao;   // a cena em que o protocolo muda de rumo (no engasgo: desmaiou, compressões no peito)
  GESTO.equipe = padrao;   // o que fica com quem socorre até a equipe chegar
  GESTO.erro = padrao;     // o erro: desenhe o gesto errado e ponha B.xis em cima no tempo do "pop" (BEAT * 2 depois do início)

  // os casos especiais: um cartão por frase, no centro. Na troca, o cartão novo empurra o velho para fora (0,35 s) e tem
  // outra cor (o cartão e o apoio do estilo; no chapado, o marca-texto): é o corte da cena. TROQUE: o rótulo (D04, D05...) e o desenho de cada caso
  const CASOS = ['D04', 'D05'], FUNDO = [COR.cartao, COR.apoio !== COR.cartao ? COR.apoio : COR.destaque];
  GESTO.especiais = (ctx, st) => {
    const it1 = st.c.itens[1], k = it1 ? U.ease.inOutCubic(U.clamp((st.t - it1.t0) / 0.35, 0, 1)) : 0, desliza = 1150;
    const caso = (i, dx) => {
      ctx.save(); ctx.translate(CX + dx, 1150); ctx.scale(1.25, 1.25); ctx.translate(-CX, -1150);
      G.rrect(ctx, CX - 210, 870, 420, 560, 30, { fill: FUNDO[i % 2], stroke: INK, lw: 6, seed: 211 + i });
      hand(ctx, D(CASOS[i]), CX, 935, { size: 50, align: 'center', color: B.sobre(FUNDO[i % 2]) });
      Ch.person(ctx, { x: CX, y: 1390, pose: 'stand', s: 0.92, eyes: 'normal', mouth: 'flat', style: PACIENTE });
      ctx.restore();
    };
    if (k < 1) caso(0, -k * desliza);
    if (it1 && st.t >= it1.t0) caso(1, (1 - k) * desliza);
  };

  // o 192 (fixo da série): na 2.ª frase, o pino no mapa e um ponto de referência
  GESTO.ligue = (ctx, st) => {
    if (st.i < 1) return;
    const k = U.ease.outBack(U.clamp((st.t - st.it.t0) / 0.35, 0, 1));
    ctx.save(); ctx.translate(R - 120, 470); ctx.scale(k, k);
    G.ellipse(ctx, 0, 0, 92, 92, { fill: C.papel, stroke: C.papel, lw: 6, seed: 241 });
    // o mapa é Papel em todo estilo: o traço por cima dele é o escuro (COR.escura)
    G.line(ctx, [[-70, 30], [70, 30]], { color: COR.escura, lw: 6, seed: 242 }); G.line(ctx, [[0, -70], [0, 70]], { color: COR.escura, lw: 6, seed: 243 });
    G.ellipse(ctx, -36, -10, 26, 26, { fill: C.folha, stroke: COR.escura, lw: 4, seed: 244 });
    G.poly(ctx, [[34, -12], [56, -50], [78, -12]], { fill: C.coral, stroke: COR.escura, lw: 4, seed: 245 });
    ctx.restore();
  };

  // o fecho (fixo da série): os três juntos, o paciente bem
  GESTO.fecho = (ctx, st) => {
    sala(ctx);
    Ch.person(ctx, { x: L + 110, y: GY, pose: 'stand', s: 1.0, eyes: 'happy', mouth: 'smile', gesture: 'phone', style: B.ACS });
    Ch.person(ctx, { x: 420, y: GY, pose: 'stand', s: 1.02, eyes: 'happy', mouth: 'smile', gesture: 'thumbsUp', look: 0.6, style: B.ESTUDANTE });
    Ch.person(ctx, { x: 680, y: GY, pose: 'stand', s: 1.02, eyes: 'happy', mouth: 'smile', look: -0.5, style: PACIENTE });
  };

  // o close da 2.ª frase de cada cena: [x, y, zoom] do detalhe que a frase explica. y na altura das cabeças (perto de 990;
  // 950 nas cenas com conta), para o close crescer para baixo e não subir no texto. Cena sem entrada não fecha.
  // TROQUE: aponte para o detalhe de cada gesto (exemplo: o punho nas compressões, o telefone no 192)
  const FOCO = { situacao: [680, 1030, 1.35], passo1: [520, 990, 1.3], passo2: [520, 990, 1.3], passo3: [520, 950, 1.3], passo4: [520, 990, 1.3], alerta: [520, 990, 1.25], erro: [520, 990, 1.3] };

  globalThis.PECA = { DESTAQUE, PACIENTE, GESTO, FOCO, ACS, ESTUDANTE };
})();
