// PRESEME · tipo "tour" · desenho 2/3 · A PEÇA (o chat 1 preenche): o desenho de dentro de cada sala e os destaques.
// Cada sala é uma função PECA.SALA[nome](ctx, st, modo) que desenha o lugar nas medidas de um quadro inteiro (1080 de
// largura, chão em y 1400), como os lugares da biblioteca: o molde encolhe o desenho para a janela e põe por cima quem
// trabalha ali (o "quem" do score.js), com o crachá. modo: 'largo', 'perto' ou 'voce' (a mesma sala serve aos três).
// Comece pelos lugares e objetos da biblioteca (ferramentas/biblioteca.js, guia em motor/estilos/BIBLIOTECA.md): eles
// já saem nos seis estilos. Sem a função, a sala sai com o desenho padrão (meia-parede, mesa e cadeira).
// Opcionais: SALA.entrada (a entrada por dentro; sem ela, a recepção da biblioteca), SALA.fachada (a frente; sem ela, a
// UBS da biblioteca) e GUIA (a aparência de quem faz o tour; padrão, o calouro).
(function () {
  const B = globalThis.BIB, TX = globalThis.TEXTOS;
  const D = (k) => TX[k] || '';
  globalThis.PECA = {
    // TROQUE: o trecho de cada frase que ganha o destaque do estilo (igual ao texto da frase)
    DESTAQUE: {},
    // TROQUE (opcional): quem faz o tour, ex.: { roupa: 'jaleco' }
    GUIA: {},
    SALA: {
      // TROQUE: uma função por sala (o nome é o "sala" do score.js). Exemplo de sala com objetos da biblioteca:
      sala1: (ctx) => {
        const r = B.sala(ctx, { quadro: false });
        const m = B.mesa(ctx, { x: 360, y: 1400, w: 280, h: 250 });
        B.prancheta(ctx, { x: 330, y: m.topo - 40, s: 0.7, rot: -0.2 });
        return r;
      },
      // sala2: (ctx) => B.consultorio(ctx),
      // sala3: (ctx) => { ... },
    },
  };
})();
