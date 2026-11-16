// PRESEME · carrossel MEME EM IMAGEM · exemplo "monitor do frasco" · desenho 2 · o desenho da peça.
// A piada: o calouro vira um frasco de vacina no sol de Boa Vista. Um monitor de frasco de vacina (MFV) flutua ao lado
// dele, como o status de um personagem: às 8h o quadrado do meio está claro; às 11h30, mudando; no close, mais escuro que o
// círculo (o ponto de descarte). A lição explica o monitor de verdade (Manual de Rede de Frio, 2025).
// Dois palcos: a rua (os painéis da manhã e do meio-dia, com câmeras iguais e o estado do calouro mudando) e o close.
(function () {
  const P = globalThis.PRESEME, DS = P.DESENHO, B = globalThis.BIB, E = globalThis.ESTILOS, MEME = () => P.MEME;
  DS.palco = DS.palco || {};

  // o monitor do frasco de vacina: o círculo de fora (a cor de referência) e o quadrado do meio, que escurece com o calor.
  // estagio 0: quadrado bem mais claro (pode usar); 1: mais claro, mas já mudando; 2: igual ao círculo; 3: mais escuro
  // (2 e 3: descarte). Só cores da paleta, sem degradê. Candidato à biblioteca (B.monitorFrasco).
  const QUADRADO = ['papel', 'salvia', 'folha', 'noite'];
  function monitorFrasco(ctx, { x, y, r = 80, estagio = 0, seed = 700 }) {
    E.circulo(ctx, x, y, r, { papel: 'folha', seed, sombra: true, hachura: false });
    const l = r * 0.9;
    E.ret(ctx, x - l / 2, y - l / 2, l, l, { papel: QUADRADO[Math.max(0, Math.min(3, estagio))], r: 3, seed: seed + 1, sombra: false, hachura: false });
  }
  DS.monitorFrasco = monitorFrasco;
  // as ondas de calor subindo do chão: linhas onduladas em Coral (candidato à biblioteca: B.ondasDeCalor)
  function ondasDeCalor(ctx, xs, y, alto, seed = 730) {
    xs.forEach((x0, i) => {
      const pts = []; for (let k = 0; k <= 12; k++) { const u = k / 12; pts.push([x0 + Math.sin(u * Math.PI * 3 + i) * 10, y - u * alto]); }
      E.linha(ctx, pts, { papel: 'alerta', lw: 6, seed: seed + i });
    });
  }

  // a rua da visita: a manhã (o sol baixo, o calouro animado) ou o meio-dia (o sol alto e grande, o calouro derretendo,
  // a agente de boa)
  DS.palco.rua = (ctx, info) => {
    const meio = info.id === 'meiodia';
    B.rua(ctx, { fundo: info.fundo, numeros: ['', '', ''], arvore: true });
    E.objeto(ctx, 'sol', meio ? { x: 905, y: 470, r: 96 } : { x: 330, y: 470, r: 46 });
    const agente = { quem: 'agente', x: 700, y: 984, pose: 'walk', walk: meio ? 0.6 : 0.2, look: meio ? -0.6 : 0.5, eyes: 'happy', mouth: 'smile', gesture: meio ? 'point' : null };
    const calouro = meio
      ? { quem: 'calouro', x: 470, y: 984, pose: 'walk', walk: 0.9, look: 0.2, lookY: 0.5, eyes: 'worried', brows: 'worried', mouth: 'wavy', sweat: 1 }
      : { quem: 'calouro', x: 470, y: 984, pose: 'walk', walk: 0.4, look: 0.5, eyes: 'happy', brows: 'up', mouth: 'smile' };
    B.pessoa(ctx, agente);
    B.pessoa(ctx, calouro);
    monitorFrasco(ctx, { x: 280, y: 640, r: 82, estagio: meio ? 1 : 0, seed: meio ? 712 : 702 });
    if (!meio) info.rotulo('D03', 245, 800, { caixa: true, rot: -0.05 });
    else ondasDeCalor(ctx, [585, 610, 640], 960, 150, 731);
    return { cabecas: { calouro: MEME().cabeca(calouro), agente: MEME().cabeca(agente) } };
  };

  // o close da virada: o calouro exausto, grande, e o monitor dele já mais escuro que o círculo; sem fundo (os raios)
  DS.palco.close = (ctx) => {
    const calouro = { quem: 'calouro', x: 700, y: 1240, s: 1.3, pose: 'stand', eyes: 'closed', brows: 'worried', mouth: 'wavy', sweat: 1, look: -0.3 };
    B.pessoa(ctx, calouro);
    monitorFrasco(ctx, { x: 1010, y: 850, r: 100, estagio: 3, seed: 722 });
    return { cabecas: { calouro: MEME().cabeca(calouro) } };
  };

  DS.paineis = {
    manha: { palco: 'rua', camera: [150, 400, 700, 620] },
    meiodia: { palco: 'rua', camera: [150, 230, 700, 790] },
    virada: { palco: 'close', camera: [460, 560, 680, 400], raios: true, foco: [700, 715] },
  };
})();
