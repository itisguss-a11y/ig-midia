// PRESEME · carrossel LINHA DO TEMPO · a conferência do tipo (o motor roda no comando textos; ok false trava).
// Confere o que faz a peça não ser rasa e a linha não se perder: a capa abre a linha; de 2 a 8 marcos, cada um com o ano,
// o que aconteceu, o porquê e o que mudou; as datas em ordem; a última parada da linha é hoje (a resposta da capa).
// É do tipo: vale para toda peça linha do tempo (não precisa mexer).
const n2 = (n) => String(n).padStart(2, '0');
const anoDe = (s) => { const m = /(\d{4})/.exec(String(s || '')); return m ? parseInt(m[1], 10) : null; };
module.exports = {
  conferir(T, S) {
    const L = S.LAMINAS || [], linhas = [];
    let ok = true;
    const erro = (m) => { ok = false; linhas.push(m); };
    if (!L.length || L[0].tipo !== 'capa') erro('a lâmina 1 tem de ser a capa (tipo capa): é nela que a linha nasce');
    const ms = L.filter((l) => l.tipo === 'marco');
    if (ms.length < 2 || ms.length > 8) erro(`${ms.length} marco(s): a linha do tempo tem de 2 a 8 datas (uma só data não é história; mais de 8 vira lista)`);
    let antes = null;
    for (const m of ms) {
      const fr = (m.todas || m.linhas).filter((k) => typeof k === 'number');
      if (!T[m.ano]) erro(`lâmina ${n2(m.n)}: falta o ano grande (ano: ${m.ano || 'sem a palavra D'})`);
      if (!T[fr[1]]) linhas.push(`aviso: lâmina ${n2(m.n)} sem o porquê (a frase ${fr[1] ? `[${n2(fr[1])}]` : '2'}): data sem porquê é a peça rasa`);
      if (!T[fr[2]]) linhas.push(`aviso: lâmina ${n2(m.n)} sem o que mudou (a frase ${fr[2] ? `[${n2(fr[2])}]` : '3'}), que vai na faixa escura`);
      if (!m.desenho || m.desenho === 'troque') linhas.push(`aviso: lâmina ${n2(m.n)} sem o desenho do assunto (desenho: troque)`);
      const a = anoDe(T[m.ano]);
      if (a !== null && antes !== null && a < antes) erro(`lâmina ${n2(m.n)}: ${a} vem depois de ${antes}: as datas vão em ordem, da mais antiga para a mais nova`);
      if (a !== null) antes = a;
      if (m.salto && m !== ms[ms.length - 1]) linhas.push(`aviso: lâmina ${n2(m.n)}: o salto (//) vai no último marco, o que pula até hoje`);
    }
    const ult = L[L.length - 1];
    const hoje = L.filter((l) => l.tipo === 'hoje');
    if (!hoje.length) erro('falta a lâmina hoje (tipo hoje): a linha termina em hoje, com a resposta da capa');
    else if (L.indexOf(hoje[0]) < L.indexOf(ms[ms.length - 1])) erro('a lâmina hoje vem depois de todos os marcos');
    else if (ult !== hoje[0]) linhas.push('aviso: depois de hoje a linha acabou; o que vier depois sai sem a linha');
    if (hoje.length && hoje[0].desenho === 'linhaInteira') {
      const sem = ms.filter((m) => !T[m.verbo]).map((m) => n2(m.n));
      if (sem.length) linhas.push(`aviso: marcos sem verbo (verbo: a palavra D do que a data fez), que a linha inteira de hoje mostra: lâminas ${sem.join(', ')}`);
    }
    if (ok) linhas.push(`tipo linha do tempo: ${ms.length} datas${antes ? `, até ${antes}` : ''}, e a linha termina em hoje`);
    return { ok, linhas };
  },
};
