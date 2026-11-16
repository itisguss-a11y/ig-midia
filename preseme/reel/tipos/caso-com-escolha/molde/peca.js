// PRESEME · motor "Caso com escolha" · a conferência do tipo (do molde: igual em toda peça; o motor chama no comando textos)
// Trava (ok false) quando: não são três opções; a pergunta, a resposta ou o fecho têm mais de uma frase; o caso tem mais de
// duas; uma opção fica sem porquê; a primeira frase do porquê de uma opção não começa com Certa, Errada ou Pode ser; ou a
// resposta diz a letra ("É a B.") ou "qualquer uma" e os selos dizem outra coisa. Avisa (sem travar) quando: falta o
// silêncio antes da resposta no mapa-do-som.json, ou ele não tem o tamanho do score.js; uma opção passa de quatro palavras
// (aperta no cartão); o fecho não repete nenhuma palavra do caso (o fecho volta ao caso); a pergunta não termina em "?".
const fs = require('fs');
const path = require('path');

const n2 = (n) => String(n).padStart(2, '0');
const PARADAS = new Set(['a', 'o', 'as', 'os', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'e', 'em', 'no', 'na', 'nos', 'nas', 'que', 'é', 'à', 'ao', 'para', 'por', 'com', 'se', 'não', 'ou', 'pela', 'pelo', 'mas', 'ele', 'ela', 'quem', 'mais', 'muito', 'uma', 'tem', 'foi', 'ser']);
const conteudo = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/).filter((w) => w.length > 3 && !PARADAS.has(w));

function veredito(s) {
  const m = /^(pode\s+ser|certa|certo|errada|errado)\b/i.exec(String(s || '').trim());
  if (!m) return null;
  const w = m[1].toLowerCase().replace(/\s+/g, ' ');
  return w === 'pode ser' ? 'pode' : w.startsWith('cert') ? 'certa' : 'errada';
}

module.exports = {
  conferir(T, S) {
    const linhas = [];
    let ok = true;
    const erro = (m) => { ok = false; linhas.push(`ERRO: ${m}`); };
    const ops = (S.OPCOES || []).filter((n) => T[n]);
    if (ops.length !== 3) erro(`são ${ops.length} opções com texto; o tipo pede três (A, B e C), em OPCOES no score.js.`);
    for (const n of ops) if (String(T[n]).trim().split(/\s+/).length > 4) linhas.push(`aviso: a opção [${n2(n)}] tem mais de quatro palavras: no cartão ela aperta. Encurte (o porquê explica o resto).`);
    for (const [nome, lista, max] of [['CASO', S.CASO, 2], ['FECHO', S.FECHO, 1]]) {
      const com = (lista || []).filter((n) => T[n]);
      if (com.length > max) erro(`${nome} tem ${com.length} frases no score.js; o molde desenha ${max === 1 ? 'uma só, como título' : 'até duas'}. Junte.`);
    }
    const pg = String(T[S.PERGUNTA] || '').trim();
    if (!pg) erro(`a pergunta [${n2(S.PERGUNTA)}] está vazia: sem ela não há escolha.`);
    else if (!/\?$/.test(pg)) linhas.push(`aviso: a pergunta [${n2(S.PERGUNTA)}] não termina em "?".`);
    if (!String(T[S.RESPOSTA] || '').trim()) erro(`a resposta [${n2(S.RESPOSTA)}] está vazia.`);
    // o porquê de cada opção, com o veredito no começo
    const vs = [];
    (S.OPCOES || []).forEach((_, i) => {
      const ls = ((S.PORQUE || [])[i] || []).filter((n) => T[n]);
      if (!ls.length) { erro(`a opção ${'ABC'[i]} está sem porquê (PORQUE[${i}] no score.js): o tipo explica cada opção, certa ou errada.`); vs.push(null); return; }
      const v = veredito(T[ls[0]]);
      if (!v) erro(`a frase [${n2(ls[0])}] (porquê da opção ${'ABC'[i]}) tem de começar com Certa, Errada ou Pode ser; começa com "${String(T[ls[0]]).split(/\s+/).slice(0, 2).join(' ')}".`);
      vs.push(v);
    });
    if (vs.length === 3 && vs.every(Boolean)) {
      linhas.push(`SELOS: A ${vs[0]}, B ${vs[1]}, C ${vs[2]} (certa = ✓ CERTA, errada = ✗ ERRADA, pode = ? PODE SER).`);
      // a resposta diz a letra? ou "qualquer uma"/"as três"/"nenhuma"? a conta tem de bater com os selos
      const rs = String(T[S.RESPOSTA] || '').toLowerCase();
      // (o \b do JavaScript não vê o é como letra: a fronteira é feita à mão)
      const letra = /(?:^|[^a-zà-ú])(?:é|e)\s+(?:a\s+)?(?:letra\s+)?([abc])(?![a-zà-ú])/.exec(rs) || /(?:^|[^a-zà-ú])letra\s+([abc])(?![a-zà-ú])/.exec(rs);
      if (letra) {
        const k = 'abc'.indexOf(letra[1]);
        const bate = vs[k] === 'certa' && vs.filter((v) => v === 'certa').length === 1;
        if (!bate) erro(`a resposta diz a letra ${letra[1].toUpperCase()}, e os selos dão ${vs.map((v, i) => `${'ABC'[i]} ${v}`).join(', ')}. A letra da resposta tem de ser a única CERTA.`);
        else linhas.push(`CONTA OK: a resposta diz ${letra[1].toUpperCase()}, e só a ${letra[1].toUpperCase()} é CERTA.`);
      } else if (/\b(qualquer uma|as tr[eê]s|todas)\b/.test(rs)) {
        if (vs.some((v) => v === 'errada')) erro(`a resposta diz que pode ser qualquer uma, e há selo ERRADA (${vs.map((v, i) => `${'ABC'[i]} ${v}`).join(', ')}).`);
        else linhas.push('CONTA OK: a resposta diz qualquer uma, e nenhum selo é ERRADA.');
      } else if (/\bnenhuma\b/.test(rs)) {
        if (vs.some((v) => v !== 'errada')) erro('a resposta diz nenhuma, e há selo que não é ERRADA.');
        else linhas.push('CONTA OK: a resposta diz nenhuma, e os três selos são ERRADA.');
      }
    }
    // o fecho volta ao caso: pelo menos uma palavra do caso aparece no fecho
    const caso = new Set((S.CASO || []).flatMap((n) => conteudo(T[n])));
    const fecho = (S.FECHO || []).flatMap((n) => conteudo(T[n]));
    if (fecho.length && caso.size && !fecho.some((w) => caso.has(w))) linhas.push('aviso: o fecho não repete nenhuma palavra do caso; o tipo fecha voltando ao caso (quem chegou, o que sentia, onde mora).');
    // o silêncio antes da resposta (o mapa do som), do tamanho que o score.js reservou depois da contagem
    try {
      const mapa = JSON.parse(fs.readFileSync(path.join(__dirname, 'mapa-do-som.json'), 'utf8'));
      const s = (mapa.silencios || []).find((x) => Number(x.frase) === Number(S.RESPOSTA));
      if (!s) linhas.push(`aviso: sem silêncio antes da resposta [${n2(S.RESPOSTA)}]: ponha { "frase": ${S.RESPOSTA}, "antes": ${S.SIL} } em "silencios" no mapa-do-som.json.`);
      else if (Math.abs((s.antes || 0.5) - S.SIL) > 0.05) linhas.push(`aviso: o silêncio antes da resposta tem ${s.antes} s no mapa e ${S.SIL} s no score.js: o tique-taque fica cortado ou sobra som. Deixe os dois iguais.`);
    } catch (e) { linhas.push(`aviso: não li o mapa-do-som.json (${e.message}).`); }
    return { ok, linhas };
  },
};
