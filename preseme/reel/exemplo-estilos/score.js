// PRESEME · demonstração do kit de estilos (não vai ao ar; conteúdo de teste, sem fato).
// A agente chega à casa 7 com a prancheta. A linha do tempo é a mesma em qualquer estilo:
// o estilo vem de ESTILO (abaixo) ou do --style na hora de renderizar.
(function () {
  const node = typeof require !== 'undefined' && typeof module !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const TX = node ? require('./textos.js') : globalThis.TEXTOS;

  const FPS = 30;
  const FORMAT = U.pickFormat('9:16');
  const BPM = 100, BEAT = 60 / BPM;
  const DURATION = 8;
  const ESTILO = 'lapis';

  // os momentos (segundos)
  const ev = {
    titulo: 0.3, // o título entra
    destaque: 0.85, // o marca-texto passa em "de casa em casa"
    entra: 0.5, // a agente começa a andar
    chega: 2.6, // ela para na frente da casa
    prancheta: 2.85, // ela levanta a prancheta
    seta: 3.4, // a seta vai da prancheta até a porta
    porta: 4.4, // a porta abre
    cota: 5.0, // a medida entre ela e a porta
    carimbo: 6.6, // o carimbo bate na parede
    principal: 7.3, // tudo na tela: o quadro principal (folha da parada 2)
  };
  const markers = {
    titulo: ev.titulo + 0.35,
    chega: { t: ev.chega, sync: 'v' },
    seta: ev.seta + 0.6,
    cota: ev.cota + 0.5,
    carimbo: { t: ev.carimbo, sync: 'v' },
    principal: ev.principal,
  };
  const S = { visita: [0, DURATION] };
  const linha = { 1: { t0: ev.titulo, t1: DURATION } };
  const cenas = [{ id: 'visita', t0: 0, t1: DURATION, itens: [{ n: 1, t0: ev.titulo, t1: DURATION }] }];
  const efeitos = [
    { t: ev.chega, som: 'tique', vol: 0.6, pan: -0.3 },
    { t: ev.seta, som: 'lapis', vol: 0.5, pan: 0 },
    { t: ev.cota, som: 'lapis', vol: 0.4, pan: 0.2 },
    { t: ev.carimbo, som: 'baque', vol: 0.8, pan: 0.3 },
  ];

  const SCORE = { FPS, FORMAT, BPM, BEAT, DURATION, ESTILO, ev, markers, S, linha, cenas, efeitos, TX };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
