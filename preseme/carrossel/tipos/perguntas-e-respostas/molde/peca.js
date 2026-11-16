// PRESEME · carrossel PERGUNTAS E RESPOSTAS · a conferência do tipo (o motor roda no comando textos; ok false trava).
// Confere o que faz a peça não ser rasa: a capa abre; de 3 a 6 dúvidas, cada uma escrita como pergunta, com a resposta,
// o detalhe e um desenho que explica; no fim, o resumo para salvar, uma linha por dúvida, com a fonte.
// É do tipo: vale para toda peça perguntas e respostas (não precisa mexer).
const n2 = (n) => String(n).padStart(2, '0');
module.exports = {
  conferir(T, S) {
    const L = S.LAMINAS || [], linhas = [];
    let ok = true;
    const erro = (m) => { ok = false; linhas.push(m); };
    if (!L.length || L[0].tipo !== 'capa') erro('a lâmina 1 tem de ser a capa (tipo capa)');
    const ps = L.filter((l) => l.tipo === 'pergunta');
    if (ps.length < 2 || ps.length > 8) erro(`${ps.length} dúvida(s): o tipo pede de 3 a 6 (uma dúvida só é um post de texto; mais de 8 não se lê)`);
    else if (ps.length < 3 || ps.length > 6) linhas.push(`aviso: ${ps.length} dúvidas; o tipo foi feito para 3 a 6`);
    for (const p of ps) {
      const [f1, f2, f3] = (p.todas || p.linhas).filter((k) => typeof k === 'number');
      if (!/\?\s*$/.test(String(T[f1] || ''))) erro(`lâmina ${n2(p.n)}: a dúvida [${n2(f1)}] tem de ser uma pergunta, com o ponto de interrogação no fim`);
      if (!T[f2]) erro(`lâmina ${n2(p.n)}: dúvida sem resposta (a frase ${f2 ? `[${n2(f2)}]` : '2'})`);
      if (!T[f3]) linhas.push(`aviso: lâmina ${n2(p.n)} sem o detalhe (a frase ${f3 ? `[${n2(f3)}]` : '3'}): resposta sem porquê é a peça rasa`);
      if (!p.desenho || p.desenho === 'troque') linhas.push(`aviso: lâmina ${n2(p.n)} sem o desenho que explica (desenho: troque)`);
    }
    const rs = L.filter((l) => l.tipo === 'resumo');
    if (!rs.length) erro('falta a lâmina resumo (tipo resumo): a ficha para salvar, uma linha por dúvida');
    else {
      const r = rs[rs.length - 1];
      if (r !== L[L.length - 1]) linhas.push('aviso: o resumo é a última lâmina');
      if (r.linhas.length !== ps.length) linhas.push(`aviso: o resumo tem ${r.linhas.length} linha(s) e a peça tem ${ps.length} dúvida(s); o certo é uma linha por dúvida`);
      if (!T[r.palavras[1]]) linhas.push('aviso: o resumo está sem a fonte (a segunda palavra D dele)');
    }
    if (ok) linhas.push(`tipo perguntas e respostas: ${ps.length} dúvidas, cada uma com resposta, e o resumo no fim`);
    return { ok, linhas };
  },
};
