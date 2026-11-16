#!/usr/bin/env node
// PRESEME · tipo "um dia, contado pela hora" · escreve o mapa-do-som.json a partir do score.js (do molde; não muda)
// Os blocos da música são as partes do dia (manhã, tarde, noite) e o resultado, tirados da hora de cada momento; o clima
// de cada parte, o lugar e as coisas de cada momento e o silêncio antes da tese vêm do bloco PREENCHER do score.js.
// Uso, de dentro da pasta da peça, depois do `textos` do motor: node ferramentas/dia-mapa.js   (ou: --peca <pasta>)
'use strict';
const fs = require('fs');
const path = require('path');

const a = process.argv.slice(2), i = a.indexOf('--peca');
const dir = path.resolve(i >= 0 ? a[i + 1] : '.');
for (const f of ['score.js', 'textos.js', path.join('engine', 'util.js')]) {
  if (!fs.existsSync(path.join(dir, f))) { console.log(`ERRO: falta ${f} em ${dir} (rode o novo e o textos do motor antes)`); process.exit(1); }
}
const S = require(path.join(dir, 'score.js'));
const peca = JSON.parse(fs.readFileSync(path.join(dir, 'peca.json'), 'utf8'));
const mapa = {
  _gerado: 'por ferramentas/dia-mapa.js, a partir do score.js: mude o SOM e os momentos lá e rode de novo (não edite aqui)',
  modo: 'blocos',
  semente: peca.nome || path.basename(dir),
  bpm: S.BPM,
  lufs: -16,
  blocos: S.blocos.map((b) => ({ cenas: b.cenas, clima: b.clima })),
  fundos: {},
  coisas: [],
  silencios: [],
  efeitos: true,
};
for (const m of S.MOMENTOS) {
  if (!S.S[m.id]) continue; // momento cujas frases ele apagou
  if (m.lugar) mapa.fundos[m.id] = typeof m.lugar === 'string' ? { som: m.lugar, vol: 0.35 } : m.lugar;
  for (const c of (m.coisas || []).slice(0, 2)) mapa.coisas.push(Object.assign({ cena: m.id }, c));
}
if (S.SOM.silencioAntesDaTese && S.linha[S.FECHO.tese]) mapa.silencios.push({ frase: S.FECHO.tese, antes: S.SOM.silencioAntesDaTese });
fs.writeFileSync(path.join(dir, 'mapa-do-som.json'), JSON.stringify(mapa, null, 2) + '\n');
console.log(`mapa-do-som.json gravado: ${mapa.blocos.map((b) => `${b.clima} (${b.cenas.join(', ')})`).join(' · ')}`);
console.log(`lugares: ${Object.keys(mapa.fundos).map((k) => `${k} = ${mapa.fundos[k].som}`).join(', ') || 'nenhum'} · coisas: ${mapa.coisas.map((c) => `${c.som} em ${c.cena}`).join(', ') || 'nenhuma'} · silêncio: ${mapa.silencios.map((s) => `${s.antes} s antes da [${s.frase}]`).join(', ') || 'nenhum'}`);
