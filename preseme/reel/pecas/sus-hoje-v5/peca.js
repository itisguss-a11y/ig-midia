// versão 5, só para testar o motor; a peça de verdade está no chat dela
// PRESEME · sus-hoje · a conferência que é só desta peça: a conta da recontagem tem de bater com as cenas.
// O motor chama conferir(T, S) no comando textos: T = os textos do textos.txt, S = o score.js já com eles.
// (Era o "CONTA OK" do ferramentas/sus.js; agora o motor faz o resto, e só isto fica com a peça.)
module.exports = {
  conferir(T, S) {
    const linhas = [];
    let ok = true;
    const usos = S.cenas.filter((c) => c.uso), cont = { san: 0, epi: 0, amb: 0 };
    for (const c of usos) cont[c.vig]++;
    const num = (n) => { const m = (T[n] || '').match(/(\d+)\.?\s*$/); return m ? parseInt(m[1], 10) : null; };
    const total = ((T[31] || '').match(/(\d+)\s+vez/) || [])[1];
    for (const [n, v] of [[27, cont.san], [28, cont.epi], [29, cont.amb], [30, 0]]) {
      if (T[n] && num(n) !== v) { linhas.push(`ERRO DE CONTA: a frase [${n}] diz ${num(n)}, e as cenas dão ${v}`); ok = false; }
    }
    if (T[31] && parseInt(total, 10) !== usos.length) { linhas.push(`ERRO DE CONTA: a frase [31] diz ${total}, e as cenas dão ${usos.length}`); ok = false; }
    if (ok) linhas.push(`CONTA OK: ${cont.san} + ${cont.epi} + ${cont.amb} = ${usos.length}`);
    return { ok, linhas };
  },
};
