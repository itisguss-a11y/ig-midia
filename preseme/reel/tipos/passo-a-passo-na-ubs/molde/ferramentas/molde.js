#!/usr/bin/env node
// PRESEME · ferramenta dos moldes de série (até o motor do reel ficar pronto; depois, o "textos" do motor faz o mesmo).
// Rodar de dentro da pasta da peça (a que tem index.html):
//   node ferramentas/molde.js textos [arquivo.txt]   lê o textos.txt, grava textos.js, confere e mostra a duração
//   node ferramentas/molde.js tempos                 a tabela de tempos (cena, frase, quando entra, quanto fica)
//   node ferramentas/molde.js efeitos                grava out/efeitos.json (os efeitos do score.js)
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..');
const cmd = process.argv[2];
const mmss = (s) => `${Math.floor(s / 60)}min${String(Math.round(s % 60)).padStart(2, '0')}`;
const LIMITE = 175; // abaixo de 3 minutos: o Instagram só recomenda a quem não segue reel de até 3 minutos

function lerTxt(arq) {
  const T = {}, fora = [];
  fs.readFileSync(arq, 'utf8').split(/\r?\n/).forEach((l, i) => {
    if (!l.trim() || l.trim().startsWith('#')) return;
    const m = l.match(/^\s*\[(D?)(\d+)\]\s*(.*?)\s*$/);
    if (!m) { fora.push(`linha ${i + 1}: "${l.trim().slice(0, 50)}" não começa com [NN] nem [DNN] (ficou de fora)`); return; }
    if (m[3]) T[m[1] ? 'D' + m[2].padStart(2, '0') : String(parseInt(m[2], 10))] = m[3];
  });
  return { T, fora };
}
function score() { for (const k of Object.keys(require.cache)) if (/score\.js$|textos\.js$/.test(k)) delete require.cache[k]; return require(path.join(raiz, 'score.js')); }

if (cmd === 'textos') {
  const arq = process.argv[3] || path.join(raiz, 'textos.txt');
  const { T, fora } = lerTxt(arq);
  fs.writeFileSync(path.join(raiz, 'textos.js'), '// gerado por "node ferramentas/molde.js textos" a partir do textos.txt. Não editar à mão.\n(function () {\n  const T = ' + JSON.stringify(T, null, 1) + ";\n  if (typeof module !== 'undefined') module.exports = T; else globalThis.TEXTOS = T;\n})();\n");
  for (const f of fora) console.log('AVISO: ' + f);
  const S = score();
  const frases = Object.keys(T).filter((k) => k[0] !== 'D').length, pal = Object.keys(T).filter((k) => k[0] === 'D').length;
  console.log(`textos.js gravado: ${frases} frases e ${pal} palavras do desenho`);
  let erro = false;
  for (const r of S.ROTEIRO) for (const n of r.linhas) if (!T[n]) console.log(`AVISO: a frase [${String(n).padStart(2, '0')}] da cena "${r.id}" não está no arquivo (ela sai do vídeo)`);
  const usadas = new Set(S.ROTEIRO.flatMap((r) => r.linhas.map(String)));
  for (const k of Object.keys(T)) if (k[0] !== 'D' && !usadas.has(k)) console.log(`AVISO: a frase [${k.padStart(2, '0')}] não está em nenhuma cena do ROTEIRO (não aparece no vídeo)`);
  console.log(`duração: ${S.DURATION.toFixed(2)} s (${mmss(S.DURATION)}), ${S.cenas.length} cenas, andamento ${S.BPM}`);
  if (S.DURATION > LIMITE) { console.log(`ERRO: passou de ${mmss(LIMITE)}. O reel tem de ficar abaixo de 3 minutos.`); erro = true; }
  process.exitCode = erro ? 1 : 0;
} else if (cmd === 'tempos') {
  const S = score();
  for (const c of S.cenas) {
    console.log(`\n${c.id} (${c.tipo})  ${c.t0.toFixed(2)} a ${c.t1.toFixed(2)} s`);
    for (const it of c.itens) {
      const fica = it.t1 - it.t0, w = (S.TX[it.n] || '').split(/\s+/).length, precisa = 1 + 0.4 * w;
      console.log(`  [${String(it.n).padStart(2, '0')}] entra ${it.t0.toFixed(2)} s, fica ${fica.toFixed(2)} s${fica < precisa ? `  CURTA: precisa de ${precisa.toFixed(1)} s` : ''}  ${S.TX[it.n]}`);
    }
  }
  console.log(`\ntotal: ${S.DURATION.toFixed(2)} s (${mmss(S.DURATION)})`);
} else if (cmd === 'efeitos') {
  const S = score();
  fs.mkdirSync(path.join(raiz, 'out'), { recursive: true });
  fs.writeFileSync(path.join(raiz, 'out', 'efeitos.json'), JSON.stringify(S.efeitos.map((e) => ({ t: Math.round(e.t * 1000) / 1000, som: e.som, vol: e.vol, pan: e.pan || 0 }))));
  console.log(`out/efeitos.json gravado: ${S.efeitos.length} efeitos (${[...new Set(S.efeitos.map((e) => e.som))].join(', ')})`);
} else {
  console.log('uso: node ferramentas/molde.js textos [arquivo.txt] | tempos | efeitos');
  process.exitCode = 1;
}
