// PRESEME · carrossel DOCUMENTO ANOTADO · a conferência do tipo. O motor chama conferir(T, S) no comando textos:
// T = os textos do textos.txt ({ '1': 'frase', 'D01': 'palavra' }), S = o score.js já com eles.
// Trava (ok: false) o que quebra o tipo: campo sem número, número repetido, campo sem lâmina ou fora do documento final,
// zoom em que a letra do documento não se lê, campo que fica fora do próprio zoom, mais campos do que cabe.
module.exports = {
  conferir(T, S) {
    const linhas = [], erros = [], avisos = [];
    const D = S.DOC, J = S.JANELA, CAMPOS = S.CAMPOS || [], ROT = S.ROTEIRO || [];
    if (!D || !(D.W > 0) || !(D.H > 0) || !(D.LETRA > 0) || !(D.LETRA_MIN > 0)) erros.push('falta o DOC no score.js (W, H, LETRA e LETRA_MIN do documento)');
    if (!CAMPOS.length) erros.push('falta a lista de CAMPOS no score.js');
    if (CAMPOS.length > 8) erros.push(`${CAMPOS.length} campos anotados: cabem até 8 (uma lâmina cada, mais a capa e o documento final, até 10 lâminas)`);
    const vistos = new Map(), ids = new Set();
    let total = 0;
    for (const c of CAMPOS) {
      const q = `campo "${c.id || '?'}"`;
      if (!c.id) erros.push('um campo está sem id');
      else if (ids.has(c.id)) erros.push(`${q} aparece duas vezes nos CAMPOS`);
      ids.add(c.id);
      const ns = c.numeros || [];
      if (!ns.length || ns.some((n) => !(Number.isInteger(n) && n > 0))) erros.push(`${q} está sem número (numeros: [o número do campo no documento])`);
      for (const n of ns) { if (vistos.has(n)) erros.push(`o número ${n} está repetido (${vistos.get(n)} e ${c.id})`); vistos.set(n, c.id); }
      total += ns.length;
      const ms = c.marcas || [];
      if (ms.length !== ns.length) erros.push(`${q}: são ${ns.length} número(s) e ${ms.length} marca(s); vai uma marca (o retângulo do campo) por número`);
      for (const k of ['oque', 'erro', 'porque']) if (!T[String(c[k])]) erros.push(`${q}: falta a frase [${String(c[k] || '?').padStart(2, '0')}] (${k === 'oque' ? 'o que é' : k === 'erro' ? 'o erro comum' : 'o porquê'})`);
      for (const k of ['nome', 'curto']) if (!T[c[k]]) erros.push(`${q}: falta a palavra ${c[k] || '?'} (${k === 'nome' ? 'o nome do campo' : 'o resumo da legenda'})`);
      for (const e of c.escrito || []) if (!T[e.k]) avisos.push(`${q}: o escrito ${e.k} está vazio (sai sem o exemplo)`);
      if (!D || !c.zoom || c.zoom.length !== 4) { erros.push(`${q}: falta o zoom [x, y, largura, altura]`); continue; }
      // a mesma conta da janela do molde: o pedaço cresce até a proporção da janela e fica dentro do documento
      let [x, y, w, h] = c.zoom;
      const ar = J.w / J.h;
      if (w / h < ar) { const nw = h * ar; x -= (nw - w) / 2; w = nw; } else { const nh = w / ar; y -= (nh - h) / 2; h = nh; }
      const cabe = (v, len, tot) => (len >= tot ? (tot - len) / 2 : Math.min(Math.max(v, 0), tot - len));
      x = cabe(x, w, D.W); y = cabe(y, h, D.H);
      const k = J.w / w, rot = D.LETRA * k, mini = D.LETRA_MIN * k;
      if (rot < 26 || mini < 18) erros.push(`${q}: no zoom, a letra do documento sai com ${rot.toFixed(0)} px no rótulo e ${mini.toFixed(0)} px na opção miúda (o mínimo é 26 e 18): diminua o zoom`);
      else linhas.push(`${q}: zoom de ${k.toFixed(2)} vezes, rótulo com ${rot.toFixed(0)} px e opção miúda com ${mini.toFixed(0)} px`);
      ms.forEach((m, i) => {
        if (!m || m.length !== 4) { erros.push(`${q}: a marca do ${ns[i]} não é [x, y, largura, altura]`); return; }
        if (m[0] < 0 || m[1] < 0 || m[0] + m[2] > D.W + 0.5 || m[1] + m[3] > D.H + 0.5) erros.push(`${q}: a marca do ${ns[i]} sai do documento`);
        // o campo tem de aparecer no zoom: inteiro ou, se for largo (a escolaridade), pelo menos um quarto dele, com a altura toda
        const vx = Math.max(0, Math.min(m[0] + m[2], x + w) - Math.max(m[0], x)), vy = Math.max(0, Math.min(m[1] + m[3], y + h) - Math.max(m[1], y));
        if (vx * vy < 0.25 * m[2] * m[3] || vy < 0.9 * m[3]) erros.push(`${q}: o campo ${ns[i]} fica fora do zoom, ou só um pedaço dele aparece (aumente o zoom ou mude o pedaço)`);
      });
    }
    if (total > 12) erros.push(`${total} números no documento final: cabem até 12`);
    // as lâminas: a capa primeiro, uma lâmina por campo, o documento final por último
    const lams = S.LAMINAS || [];
    if (!lams.length || lams[0].tipo !== 'capa') erros.push('a lâmina 1 tem de ser a capa (tipo capa, com o título [01])');
    const docs = lams.filter((l) => l.tipo === 'documento');
    if (docs.length !== 1) erros.push(`${docs.length} lâmina(s) de documento final: vai uma, no fim (tipo documento)`);
    else if (lams[lams.length - 1].tipo !== 'documento') avisos.push('o documento final não é a última lâmina');
    const final = docs[0] ? new Set(docs[0].campos || CAMPOS.map((c) => c.id)) : new Set();
    for (const c of CAMPOS) {
      const n = lams.filter((l) => l.tipo === 'campo' && l.campo === c.id).length;
      if (n === 0) erros.push(`o campo "${c.id}" está nos CAMPOS e não tem lâmina (tipo campo, campo: '${c.id}' no ROTEIRO)`);
      if (n > 1) erros.push(`o campo "${c.id}" tem ${n} lâminas`);
      if (docs[0] && !final.has(c.id)) erros.push(`o campo "${c.id}" tem lâmina e não aparece no documento final`);
    }
    for (const l of lams) if (l.tipo === 'campo' && !ids.has(l.campo)) erros.push(`a lâmina ${l.n} pede o campo "${l.campo}", que não está nos CAMPOS`);
    // a ordem: as lâminas de campo na ordem dos CAMPOS (a capa mostra a lupa no primeiro)
    const ordem = lams.filter((l) => l.tipo === 'campo').map((l) => l.campo), esperado = CAMPOS.map((c) => c.id).filter((id) => ordem.includes(id));
    if (ordem.join() !== esperado.join()) avisos.push('as lâminas de campo não estão na ordem dos CAMPOS');
    for (const k of Object.values(S.ROTULOS || {})) if (!T[k]) avisos.push(`a palavra ${k} (etiqueta, erro comum ou porquê) está vazia`);
    if (lams.length < 6 || lams.length > 10) erros.push(`${lams.length} lâminas: o tipo vai de 6 a 10`);
    linhas.unshift(`tipo documento anotado: ${CAMPOS.length} campos (${total} números), ${lams.length} lâminas`);
    for (const a of avisos) linhas.push('AVISO: ' + a);
    for (const e of erros) linhas.push('ERRO: ' + e);
    return { ok: !erros.length, linhas };
  },
};
