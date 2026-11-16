// PRESEME · motor "escada de níveis" · a conferência do molde (o motor chama no comando textos).
// Confere o que o desenho precisa do textos.txt: o nome de cada degrau ([D01] a [D05]), o nome do corrimão ([D06]),
// se a peça tem corrimão, e se o degrau que responde no fecho existe.
module.exports = {
  conferir(T, S) {
    const linhas = [];
    let ok = true;
    const degraus = (S.ROTEIRO || []).filter((r) => r.tipo === 'degrau');
    degraus.forEach((r, i) => {
      if (r.degrau !== i + 1) { ok = false; linhas.push(`a cena "${r.id}" diz degrau ${r.degrau}, mas é o ${i + 1}º degrau do ROTEIRO (os degraus vão em ordem, de 1 a ${degraus.length})`); }
      if (!T['D0' + (i + 1)]) { ok = false; linhas.push(`falta o nome do degrau ${i + 1}: a linha [D0${i + 1}] no textos.txt`); }
    });
    if (degraus.length > 5) { ok = false; linhas.push(`a escada tem ${degraus.length} degraus; o molde desenha até 5`); }
    if ((S.ROTEIRO || []).some((r) => r.tipo === 'corrimao') && !T.D06) { ok = false; linhas.push('a peça tem corrimão, e falta o nome dele: a linha [D06] no textos.txt'); }
    const fecho = (S.ROTEIRO || []).find((r) => r.tipo === 'escada');
    if (!fecho) { ok = false; linhas.push('falta a cena do fecho (tipo escada)'); }
    else if (fecho.destaque && (fecho.destaque < 1 || fecho.destaque > degraus.length)) { ok = false; linhas.push(`o fecho destaca o degrau ${fecho.destaque}, que não existe`); }
    if (ok) linhas.push(`ESCADA OK: ${degraus.length} degraus (${degraus.map((r, i) => T['D0' + (i + 1)]).join(', ')})${T.D06 ? `, corrimão (${T.D06})` : ''}${fecho && fecho.destaque ? `, o fecho destaca o degrau ${fecho.destaque}` : ''}`);
    return { ok, linhas };
  },
};
