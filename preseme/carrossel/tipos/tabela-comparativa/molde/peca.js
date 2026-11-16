// PRESEME · carrossel TABELA COMPARATIVA · a conferência do tipo (o motor roda no comando textos; ok false trava). É do
// tipo: vale para toda peça deste tipo (não precisa mexer).
// Trava o que quebra o tipo:
//   - menos de 3 ou mais de 4 colunas (2 colunas é o tipo "X não é Y"); menos de 4 ou mais de 6 linhas;
//   - id de linha repetido, vazio ou igual ao de uma lâmina fixa (capa, tabela, comum, texto);
//   - coluna sem nome; linha sem nome; linha com número de células diferente do de colunas;
//   - célula vazia (sem trecho de fonte, ela leva "—"); célula com mais de 8 palavras (não cabe na tabela inteira);
//   - a tabela inteira que não bate com as lâminas: a capa não é a primeira; as lâminas de linha não são, uma por uma e
//     na mesma ordem, as LINHAS (uma linha some quando todo o texto dela é apagado); a tabela inteira falta, aparece
//     duas vezes ou vem antes de uma lâmina de linha.
// Avisa: célula com "—" (sem trecho: a peça de verdade acha a fonte ou tira a linha); linha sem a frase do que reparar;
// nome de linha com mais de 30 letras (o rótulo à mão encolhe); célula com mais de 6 palavras (sai em letra menor); a
// tabela inteira sem as fontes; falta o fecho (o que as colunas têm em comum); ESTILO pixel (a letra larga não cabe).
const n2 = (n) => String(n).padStart(2, '0');
const FIXAS = new Set(['capa', 'tabela', 'comum', 'texto']);
const rot = (k) => (typeof k === 'number' ? `[${n2(k)}]` : `[${k}]`);
module.exports = {
  conferir(T, S) {
    const linhas = [];
    let ok = true;
    const erro = (s) => { ok = false; linhas.push(s); };
    const aviso = (s) => linhas.push('aviso: ' + s);
    const TB = S.TABELA;
    if (!TB || !Array.isArray(TB.COLUNAS) || !Array.isArray(TB.LINHAS)) { erro('o score.js não exporta TABELA com COLUNAS e LINHAS (o tipo sai todo de lá)'); return { ok, linhas }; }
    const C = TB.COLUNAS, Ls = TB.LINHAS, L = S.LAMINAS || [];
    const txt = (k) => String(T[k] ?? '').trim();
    const vazia = (k) => /^[—–-]$/.test(txt(k));
    const palavras = (k) => txt(k).split(/\s+/).filter(Boolean).length;
    // as colunas
    if (C.length < 3 || C.length > 4) erro(`o tipo compara de 3 a 4 colunas, e há ${C.length}${C.length === 2 ? ' (duas coisas lado a lado é o tipo "X não é Y")' : ''}`);
    C.forEach((c, i) => { if (!txt(c.nome)) erro(`a coluna ${i + 1} (id "${c.id}") está sem nome: a palavra ${rot(c.nome)} não está no textos.txt`); });
    // as linhas e as células
    if (Ls.length < 4 || Ls.length > 6) erro(`o tipo tem de 4 a 6 linhas, e há ${Ls.length}${Ls.length > 6 ? ' (a tabela inteira não cabe numa lâmina)' : ''}`);
    const vistos = new Set();
    const semFonte = [];
    Ls.forEach((l, j) => {
      const q = `a linha ${j + 1} ("${l.id}")`;
      if (!l.id || /\s/.test(l.id)) erro(`${q}: o id tem de ser uma palavra só, sem espaço`);
      if (FIXAS.has(l.id)) erro(`${q}: o id "${l.id}" é o de uma lâmina fixa; troque (capa, tabela, comum e texto são do tipo)`);
      if (vistos.has(l.id)) erro(`${q}: o id "${l.id}" se repete`);
      vistos.add(l.id);
      if (!txt(l.nome)) erro(`${q} está sem nome: a palavra ${rot(l.nome)} não está no textos.txt`);
      else if (txt(l.nome).length > 30) aviso(`${q}: o nome "${txt(l.nome)}" passa de 30 letras e o rótulo à mão encolhe; curto se lê de uma vez`);
      if (!l.frase || !txt(l.frase)) aviso(`${q} está sem a frase do que reparar (a lâmina sai só com a grade)`);
      const cs = l.celulas || [];
      if (cs.length !== C.length) erro(`${q} tem ${cs.length} células e a tabela tem ${C.length} colunas: uma célula por coluna, na ordem das colunas`);
      cs.forEach((k, i) => {
        const onde = `${q}, coluna ${C[i] ? `"${txt(C[i].nome) || C[i].id}"` : i + 1}`;
        if (!txt(k)) erro(`${onde}: a célula ${rot(k)} está vazia. Sem trecho de fonte, escreva "—" no textos.txt`);
        else if (vazia(k)) semFonte.push(`${rot(k)} (${onde})`);
        else if (palavras(k) > 8) erro(`${onde}: a célula ${rot(k)} tem ${palavras(k)} palavras; até 8 cabem na tabela inteira ("${txt(k)}")`);
        else if (palavras(k) > 6) aviso(`${onde}: a célula ${rot(k)} tem ${palavras(k)} palavras e sai em letra menor na tabela inteira`);
      });
    });
    if (semFonte.length) aviso(`${semFonte.length} célula(s) sem trecho de fonte ("—"): ${semFonte.join('; ')}. A peça de verdade acha o trecho ou tira a linha`);
    // a tabela inteira bate com as lâminas
    if (!L.length || L[0].tipo !== 'capa') erro('a lâmina 01 tem de ser a capa (tipo capa), com a pergunta [01]');
    const deLinha = L.filter((l) => l.tipo === 'linha').map((l) => l.linha);
    const esperado = Ls.map((l) => l.id);
    if (deLinha.join('|') !== esperado.join('|')) {
      const faltam = esperado.filter((id) => !deLinha.includes(id)), sobram = deLinha.filter((id) => !esperado.includes(id));
      erro(`a tabela inteira não bate com as lâminas: as LINHAS são ${esperado.join(', ')} e as lâminas de linha são ${deLinha.join(', ') || 'nenhuma'}${faltam.length ? ` (sem lâmina: ${faltam.join(', ')}; uma lâmina some quando todo o texto dela é apagado)` : ''}${sobram.length ? ` (lâmina de linha que não está nas LINHAS: ${sobram.join(', ')})` : ''}`);
    }
    const it = L.map((l, i) => (l.tipo === 'tabela' ? i : -1)).filter((i) => i >= 0);
    if (it.length !== 1) erro(`o tipo pede uma lâmina com a tabela inteira (tipo tabela), e há ${it.length}`);
    else {
      const ultimaLinha = L.reduce((m, l, i) => (l.tipo === 'linha' ? i : m), -1);
      if (it[0] < ultimaLinha) erro(`a tabela inteira (lâmina ${n2(L[it[0]].n)}) vem antes da última lâmina de linha (${n2(L[ultimaLinha].n)}): ela fecha a grade`);
      if (!txt((TB.INTEIRA || {}).fonte)) aviso('a tabela inteira está sem as fontes: é a lâmina que se salva sozinha, e a fonte vai junto');
    }
    if (!L.some((l) => l.tipo === 'comum')) aviso('falta o fecho (o que as colunas têm em comum e o que é da equipe)');
    if (S.ESTILO === 'pixel') aviso('ESTILO pixel: a letra larga do pixel não cabe nas células da tabela inteira (testado em 16/11: 5 textos de fora); para este tipo, use planta, chapado, carimbo, giz ou lápis');
    if (ok) linhas.push(`tipo tabela comparativa: ${C.length} colunas (${C.map((c) => txt(c.nome) || c.id).join(', ')}) × ${Ls.length} linhas, ${Ls.length * C.length - semFonte.length} de ${Ls.length * C.length} células com fonte; ${L.length} lâminas (capa, ${deLinha.length} de linha, a tabela inteira${L.some((l) => l.tipo === 'comum') ? ' e o fecho' : ''})`);
    return { ok, linhas };
  },
};
