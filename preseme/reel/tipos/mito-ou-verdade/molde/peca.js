// PRESEME · motor "Mito ou verdade" · a conferência do tipo (do molde: igual em toda peça; o motor chama no comando textos)
// Trava (ok false) quando: a frase do selo não começa com MITO, VERDADE ou DEPENDE; a abertura ou o fecho têm mais de
// uma frase; ou a abertura diz quantas são mito ("Duas são mito") e a conta dos selos não bate. Avisa (sem travar) quando: um selo não tem silêncio antes dele no
// mapa-do-som.json; ou a frase do balão está sem aspas (no balão, quem fala é a pessoa).
const fs = require('fs');
const path = require('path');

const VEREDITOS = ['MITO', 'VERDADE', 'DEPENDE'];
const NUMERO = { nenhuma: 0, uma: 1, um: 1, duas: 2, dois: 2, 'três': 3, tres: 3, todas: null };

module.exports = {
  conferir(T, S) {
    const linhas = [];
    let ok = true;
    const itens = S.ITENS || [];
    let mitos = 0;
    itens.forEach((it, i) => {
      const v = String(T[it.veredito] || '').trim();
      const palavra = (/^([A-Za-zÀ-ÿ]+)/.exec(v) || [, ''])[1].toUpperCase();
      if (!VEREDITOS.includes(palavra)) { ok = false; linhas.push(`ERRO: a frase [${String(it.veredito).padStart(2, '0')}] (selo da ${i + 1}ª frase) tem de começar com MITO, VERDADE ou DEPENDE; começa com "${v.split(/\s+/)[0] || '(vazia)'}".`); }
      if (palavra === 'MITO') mitos++;
      const f = String(T[it.frase] || '').trim();
      if (f && !/^["“«]/.test(f)) linhas.push(`aviso: a frase [${String(it.frase).padStart(2, '0')}] vai no balão, dita pela pessoa: fica melhor entre aspas.`);
    });
    // a abertura e o fecho têm uma frase cada: o molde desenha uma só, como título
    for (const [nome, lista] of [['ABERTURA', S.ABERTURA], ['FECHO', S.FECHO]]) {
      if (Array.isArray(lista) && lista.length !== 1) { ok = false; linhas.push(`ERRO: ${nome} tem ${lista.length} frases no score.js; o molde desenha uma só, como título. Junte numa frase.`); }
    }
    // a abertura promete quantas são mito? a conta tem de bater
    const ab = (S.ABERTURA || [1]).map((n) => String(T[n] || '')).join(' ').toLowerCase();
    const m = /\b(nenhuma|uma|um|duas|dois|três|tres|todas)\s+(?:delas\s+)?(?:é|são|e)\s+mitos?\b/.exec(ab);
    if (m) {
      const n = m[1] === 'todas' ? itens.length : NUMERO[m[1]];
      if (n !== mitos) { ok = false; linhas.push(`ERRO: a abertura diz "${m[0]}", e os selos dão ${mitos} MITO. Troque a abertura ou o veredito.`); }
      else linhas.push(`CONTA OK: a abertura diz ${m[1]}, e ${mitos === 1 ? 'há 1 selo' : `são ${mitos} selos`} MITO.`);
    }
    // um silêncio antes de cada selo (o mapa do som)
    try {
      const mapa = JSON.parse(fs.readFileSync(path.join(__dirname, 'mapa-do-som.json'), 'utf8'));
      const cala = new Set((mapa.silencios || []).map((s) => Number(s.frase)));
      const faltam = itens.map((it) => it.veredito).filter((n) => T[n] && !cala.has(Number(n)));
      if (faltam.length) linhas.push(`aviso: sem silêncio antes do selo nas frases ${faltam.map((n) => `[${String(n).padStart(2, '0')}]`).join(', ')}: ponha { "frase": N, "antes": 0.6 } em "silencios" no mapa-do-som.json.`);
    } catch (e) { linhas.push(`aviso: não li o mapa-do-som.json (${e.message}).`); }
    return { ok, linhas };
  },
};
