// PRESEME · série "Na UBS, e agora?" · a conferência que é só da série (o "textos" do motor chama sozinho; não se mexe aqui)
// A frase do 192 concorda com quem passa mal: PACIENTE = 'ele' pede "dele", 'ela' pede "dela" (score.js, parte de preencher).
'use strict';
module.exports = {
  conferir(T, S) {
    const linhas = [];
    const quem = String(S.PACIENTE || '').toLowerCase();
    if (quem !== 'ele' && quem !== 'ela') return { ok: false, linhas: [`ERRO: PACIENTE no score.js é "${S.PACIENTE}"; vale 'ele' ou 'ela' (a frase do 192 concorda com ele)`] };
    const certo = quem === 'ela' ? 'dela' : 'dele', errado = quem === 'ela' ? 'dele' : 'dela';
    const cena = (S.ROTEIRO || []).find((r) => r.tipo === 'ligue192');
    let ok = true;
    for (const n of cena ? cena.linhas : []) {
      const s = T[String(n)] || '';
      if (new RegExp(`(^|[^\\p{L}])${errado}([^\\p{L}]|$)`, 'iu').test(s)) {
        linhas.push(`ERRO: a frase [${String(n).padStart(2, '0')}] do 192 diz "${errado}", e PACIENTE é '${quem}' no score.js: troque por "${certo}" (ou o PACIENTE)`);
        ok = false;
      }
    }
    if (ok && cena) linhas.push(`192: a frase concorda com o paciente (${quem}: "${certo}")`);
    return { ok, linhas };
  },
};
