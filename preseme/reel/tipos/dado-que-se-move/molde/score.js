// PRESEME · motor "Dado que se move" · linha do tempo (molde fixo do tipo) · MOLDE: o chat 1 copia esta pasta e preenche
// Um número oficial explicado em 20 a 45 s: o número grande (o gancho), o que ele quer dizer (a conta em palavras), a
// comparação na mesma unidade (barras e régua), por que é assim, o que fazer e o fecho com a fonte grande.
// Fonte única dos tempos: o desenho (film-*.js) e o som (mapa-do-som.json + efeitos daqui) leem deste arquivo.
// Os tempos saem do tamanho de cada frase do textos.js: mudou o texto, o tempo se ajusta sozinho.
// O chat 1 preenche só o bloco PREENCHER; os números do gráfico vêm das palavras D do textos.txt (D02 e D08 a D15).
// O que o motor do reel espera daqui (não tire): FPS, FORMAT, DURATION, BEAT, BPM, markers, S, cenas, linha, efeitos e TX.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const TX = node ? require('./textos') : globalThis.TEXTOS;
  const FPS = 30;
  const FORMAT = U.pickFormat('9:16');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);

  // ===================== PREENCHER (chat 1) =====================
  const BPM = 120; // reel curto e de número: andamento rápido (o mesmo do mapa-do-som.json)
  const ESTILO = 'carimbo'; // a cara do tipo (kit de estilos): carimbo e gravura ★ (dado oficial, cara de documento); a parada 2 mostra também pixel e lapis
  // O gancho: o que é o número, em uma frase (duas no máximo). O número grande (D02), a unidade (D03) e o lugar e o ano (D04)
  // aparecem junto, desenhados pelo molde.
  const GANCHO = [1];
  // A conta: o que o número quer dizer, em palavras simples (sem letra de fórmula), uma ou duas frases.
  const CONTA = [2];
  // O desenho da conta: 'multidao' (100 mil moradores com um ponto aceso por caso: para "por 100 mil habitantes"),
  // 'grade' (100 pessoas, as do número acesas: para "em cada 100" e porcentagem) ou null (só a frase, sem desenho).
  const GRAFICO = 'multidao';
  // A comparação, na mesma unidade: a 1ª frase mostra as barras (D08 a D15: nome e valor de cada uma; a primeira é a da
  // peça); a 2ª, se houver, mostra a régua: quantas vezes a última barra cabe na primeira.
  const COMPARA = [3, 4];
  // Por que é assim: o vetor, o lugar, a hora (nunca um grupo de pessoas). Uma ou duas frases; a peça desenha (PECA.PORQUE).
  const PORQUE = [5];
  // O que fazer: a prevenção, numa frase. A peça desenha (PECA.PREVENCAO).
  const PREVENCAO = [6];
  // O fecho: uma frase; o molde volta ao número e põe a fonte grande.
  const FECHO = [7];
  // ==============================================================

  const LIMITE = 45; // o tipo é curto: até 45 s (o peca.js trava acima disso)
  const clock = MU.makeClock({ bpm: BPM, offset: 0 });
  const { T, BEAT } = clock;
  const VEL = 2.17, FOLGA = 0.5, MINIMO = 4; // leitura: 2,17 palavras por segundo e meio segundo de folga; nunca menos de 4 batidas
  const SOBE = 1.1; // o número grande sobe de 0 até o valor em 1,1 s (e para: a folha de textos mostra o valor certo)
  const ACENDE = 1.3; // os pontos da conta acendem em 1,3 s
  const CRESCE = 0.9; // cada barra cresce em 0,9 s
  const DW = { rotulo: 'D01', numero: 'D02', unidade: 'D03', lugar: 'D04', fonte: 'D05', todo: 'D06', ponto: 'D07' };
  const BARRAS_D = [['D08', 'D09'], ['D10', 'D11'], ['D12', 'D13'], ['D14', 'D15']];

  // número escrito do jeito brasileiro ("43,38", "3.218", "6,3") para conta
  const num = (s) => {
    const t = String(s == null ? '' : s).trim().replace(/\s/g, '');
    if (!/^-?[\d.]+(,\d+)?$/.test(t) && !/^-?\d+(\.\d+)?$/.test(t)) return NaN;
    if (/,/.test(t)) return parseFloat(t.replace(/\./g, '').replace(',', '.'));
    if (/^\d{1,3}(\.\d{3})+$/.test(t)) return parseFloat(t.replace(/\./g, ''));
    return parseFloat(t);
  };
  const casas = (s) => { const m = /,(\d+)$/.exec(String(s || '').trim()); return m ? m[1].length : 0; };
  const palavras = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
  const pal = (n) => palavras(TX[n]);
  const seg = (s) => Math.ceil(s / BEAT - 0.05); // segundos em batidas, para cima
  const leitura = (w, extra = 0) => Math.max(MINIMO, seg(w / VEL + FOLGA + extra));

  const NUMERO = { texto: TX[DW.numero] || '', valor: num(TX[DW.numero]), casas: casas(TX[DW.numero]) };
  const BARRAS = BARRAS_D.filter(([a, b]) => TX[a] && TX[b]).map(([a, b]) => ({ nome: TX[a], texto: TX[b], valor: num(TX[b]), casas: casas(TX[b]), dn: a, dv: b }));
  const RAZAO = BARRAS.length >= 2 && BARRAS[BARRAS.length - 1].valor > 0 ? BARRAS[0].valor / BARRAS[BARRAS.length - 1].valor : null;

  // as cenas, montadas do PREENCHER
  const ROTEIRO = [
    { id: 'gancho', tipo: 'gancho', linhas: GANCHO },
    { id: 'conta', tipo: 'conta', linhas: CONTA },
    { id: 'compara', tipo: 'compara', linhas: COMPARA },
    { id: 'porque', tipo: 'porque', linhas: PORQUE },
    { id: 'prevencao', tipo: 'prevencao', linhas: PREVENCAO },
    { id: 'fecho', tipo: 'fecho', linhas: FECHO },
  ];

  const cenas = [], linha = {}, efeitos = [], markers = {}, S = {};
  let b = 0;
  for (const r of ROTEIRO) {
    const ls = (r.linhas || []).filter((n) => TX[n]);
    if (!ls.length) continue; // parte com todas as frases apagadas sai do vídeo
    let bb = b;
    const itens = ls.map((n, j) => {
      let d = leitura(pal(n));
      // o gancho: ler a frase e bater o olho no número, na unidade e no lugar, depois que o número sobe
      if (r.tipo === 'gancho' && j === 0) d = leitura(pal(n) + 3, SOBE + 0.2);
      // a conta: ler a frase e as duas legendas do desenho, enquanto os pontos acendem
      if (r.tipo === 'conta' && j === 0 && GRAFICO) d = leitura(pal(n) + 2, 0.6);
      // a comparação: as barras crescem uma depois da outra (nome e valor de relance); a régua bate bloco a bloco
      if (r.tipo === 'compara' && j === 0) d = leitura(pal(n) + BARRAS.length, 0.5 + 0.22 * BARRAS.length);
      if (r.tipo === 'compara' && j === 1) d = leitura(pal(n) + 1, 0.3 + 0.1 * Math.ceil(RAZAO || 1));
      // o fecho: a frase, o número de novo e a fonte grande
      if (r.tipo === 'fecho') d = leitura(pal(n) + 2);
      const it = { n, b0: bb, d }; bb += d; return it;
    });
    let total = bb - b + (r.tipo === 'fecho' ? 2 : 0);
    total += total % 2; // toda cena acaba no fim de meio compasso (2 batidas): o corte cai no tempo da música, sem esticar o reel curto
    itens[itens.length - 1].d += total - (bb - b);
    for (const it of itens) { it.t0 = it.b0 * BEAT; it.t1 = (it.b0 + it.d) * BEAT; linha[it.n] = { t0: it.t0, t1: it.t1 }; }
    const c = Object.assign({}, r, { itens, t0: b * BEAT, t1: (b + total) * BEAT });
    cenas.push(c); S[c.id] = [c.t0, c.t1];
    b += total;
  }
  const DURATION = b * BEAT;
  const cena = (tipo) => cenas.find((c) => c.tipo === tipo);

  // ---------- efeitos sonoros (o que acontece na tela) ----------
  const ef = (t, som, vol = 0.8, pan = 0) => efeitos.push({ t, som, vol, pan });
  const cg = cena('gancho');
  if (cg) {
    for (let k = 0; k < 9; k++) ef(cg.t0 + 0.15 + k * (SOBE / 9), 'tique', 0.28 + 0.03 * k, k % 2 ? 0.25 : -0.25); // o número subindo
    ef(cg.t0 + 0.15 + SOBE, 'baque', 0.85); // o número para
    ef(cg.t0 + 1.85, 'baque', 0.8, 0.15); // o selo do lugar e do ano carimba em cima dele (a 2ª batida dos 3 primeiros segundos)
  }
  const cc = cena('conta');
  if (cc && GRAFICO) {
    for (let k = 0; k < 6; k++) ef(cc.t0 + 0.2 + k * (ACENDE / 6), 'gota', 0.35, -0.5 + k * 0.2); // os pontos acendendo
    ef(cc.t0 + 0.2 + ACENDE, 'pop', 0.6);
  }
  const cm = cena('compara');
  if (cm) {
    BARRAS.forEach((_, i) => ef(cm.t0 + 0.25 + i * 0.22 + CRESCE * 0.85, 'pop', 0.65, -0.3 + 0.3 * i)); // cada barra chega
    const it2 = cm.itens[1];
    if (it2 && RAZAO) {
      const nb = Math.ceil(RAZAO);
      for (let j = 0; j < nb; j++) ef(it2.t0 + 0.3 + j * 0.2, 'tique', 0.55, -0.6 + (1.2 * j) / Math.max(1, nb - 1)); // a régua, bloco a bloco, da esquerda para a direita
      ef(it2.t0 + 0.3 + nb * 0.2 + 0.15, 'sino', 0.7); // quantas vezes
    }
  }
  for (const c of cenas) if (c.tipo === 'porque' || c.tipo === 'prevencao') {
    ef(c.t0 + 0.05, 'lapis', 0.5);
    c.itens.slice(1).forEach((it) => ef(it.t0 + 0.05, 'tique', 0.45));
  }
  const cf = cena('fecho');
  if (cf) { ef(cf.t0 + 0.6, 'baque', 0.8); ef(cf.t0 + 1.2, 'certo', 0.6); } // o número volta e a fonte carimba
  efeitos.sort((p, q) => p.t - q.t);

  // ---------- marcadores: um instante de cada cena e de cada frase seguinte (folha de quadros, capa, qa e cores) ----------
  const mk = (k, t) => { markers[k] = Math.min(DURATION - 0.2, Math.max(0, t)); };
  for (const c of cenas) c.itens.forEach((it, i) => mk(c.id + (i ? 'F' + (i + 1) : ''), it.t0 + Math.min(it.t1 - it.t0 - 0.1, Math.max(2.5 * BEAT, 1.8))));
  if (cg) { mk('principal', cg.t0 + 2.4); mk('gancho', cg.t0 + 2.4); } // o quadro principal e a capa: o número parado e o selo já carimbado
  if (cc && GRAFICO) mk('conta', cc.t0 + 0.2 + ACENDE + 0.4);
  if (cm) mk('compara', cm.t0 + 0.25 + 0.22 * BARRAS.length + CRESCE + 0.3);
  if (cm && cm.itens[1] && RAZAO) mk('regua', cm.itens[1].t0 + 0.3 + Math.ceil(RAZAO) * 0.2 + 0.6);

  // os cortes que a imagem não mostra de uma vez (o fundo é o mesmo de uma cena para outra, só o desenho do meio troca):
  // o começo de cada cena, a frase da régua e cada frase desenhada pela peça. O conferir junta esses aos que ele vê
  const CORTES = cenas.slice(1).map((c) => c.t0);
  if (cm && cm.itens[1] && RAZAO) CORTES.push(cm.itens[1].t0);
  for (const c of cenas) if (c.tipo === 'porque' || c.tipo === 'prevencao') c.itens.slice(1).forEach((it) => CORTES.push(it.t0));
  CORTES.sort((p, q) => p - q);

  const cenaEm = (t) => { let c = cenas[0]; for (const x of cenas) if (t >= x.t0) c = x; return c; };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BPM, S, markers, ESTILO, STYLE: ESTILO, cenas, linha, efeitos, cenaEm, TX, ROTEIRO, CORTES,
    GANCHO, CONTA, GRAFICO, COMPARA, PORQUE, PREVENCAO, FECHO, LIMITE, SOBE, ACENDE, CRESCE, DW, BARRAS_D, NUMERO, BARRAS, RAZAO, num, casas };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
