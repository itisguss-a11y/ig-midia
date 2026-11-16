// PRESEME · tipo "um dia, contado pela hora" · a conferência da conta (do molde; não muda)
// A conta sai da lista de momentos do score.js, e a recontagem desenha esses números. Aqui o motor confere, no comando
// textos, se o texto diz o mesmo: o número de cada fileira ("Vigilância sanitária, 5.") e o do resultado ("9 vezes").
module.exports = {
  conferir(T, S) {
    const linhas = [];
    let ok = true;
    const cont = S.contagem.porCat, total = S.contagem.total, RC = S.RECONTAGEM;
    const ultimo = (n) => { const m = (T[n] || '').match(/(\d+)\D*$/); return m ? parseInt(m[1], 10) : null; };
    const somados = [];
    for (const [n, cat] of RC.filas) {
      if (!T[n]) continue;
      const v = cat ? cont[cat] || 0 : 0;
      if (cat) somados.push(v);
      if (ultimo(n) !== v) { linhas.push(`ERRO DE CONTA: a frase [${n}] diz ${ultimo(n)}, e os momentos dão ${v}`); ok = false; }
    }
    if (T[RC.resultado]) {
      const m = T[RC.resultado].match(/(\d+)/);
      if (!m || parseInt(m[1], 10) !== total) { linhas.push(`ERRO DE CONTA: a frase [${RC.resultado}] diz ${m ? m[1] : 'nenhum número'}, e os momentos dão ${total}`); ok = false; }
    }
    for (const cat of Object.keys(cont)) {
      if (cont[cat] && !RC.filas.some(([, c]) => c === cat)) { linhas.push(`ERRO DE CONTA: a categoria "${cat}" tem ${cont[cat]} momento(s) e nenhuma fileira na recontagem`); ok = false; }
      if (cont[cat] && !S.cenas.some((c) => c.uso && c.vig === cat && c.nome)) linhas.push(`AVISO: a categoria "${cat}" nunca ganha nome (nenhum momento dela tem "nome"): a faixa dela não aparece`);
    }
    if (ok) linhas.push(`CONTA OK: ${somados.join(' + ')} = ${total}`);
    return { ok, linhas };
  },
};
