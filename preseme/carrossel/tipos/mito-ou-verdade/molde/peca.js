// PRESEME · carrossel MITO OU VERDADE · a conferência do tipo (o motor roda no comando textos; ok false trava).
// Confere o que faz a peça não ser rasa: toda lâmina de frase tem o veredito (mito, verdade ou depende) e, logo depois,
// a lâmina do porquê (porque ou passos); a frase que todo mundo repete vem entre aspas; o dado tem pares nome e número.
// É do tipo: vale para toda peça mito ou verdade (não precisa mexer).
const n2 = (n) => String(n).padStart(2, '0');
module.exports = {
  conferir(T, S) {
    const L = S.LAMINAS || [], linhas = [], VER = ['mito', 'verdade', 'depende'];
    let ok = true;
    L.forEach((l, i) => {
      if (l.tipo === 'frase') {
        const v = String(T[l.palavras[0]] || '').trim().toLowerCase();
        if (!VER.includes(v)) { ok = false; linhas.push(`lâmina ${n2(l.n)}: o veredito (${l.palavras[0] || 'falta a palavra D'}) tem de ser mito, verdade ou depende, e veio "${v}"`); }
        if (!/^[“"]/.test(String(T[l.linhas[0]] || ''))) linhas.push(`lâmina ${n2(l.n)}: a frase que todo mundo repete vai entre aspas`);
        const prox = L[i + 1];
        if (!prox || !['porque', 'passos'].includes(prox.tipo)) { ok = false; linhas.push(`lâmina ${n2(l.n)}: depois da frase vem a lâmina do porquê (porque ou passos); veredito sem porquê é a peça rasa`); }
      }
      if (l.tipo === 'dado') {
        const pares = l.palavras.slice(2);
        for (let k = 1; k < pares.length; k += 2) {
          if (Number.isNaN(parseFloat(String(T[pares[k]] || '').replace(/\./g, '').replace(',', '.')))) { ok = false; linhas.push(`lâmina ${n2(l.n)}: ${pares[k]} tem de ser um número (é o tamanho da barra)`); }
        }
      }
    });
    if (!L.some((l) => l.tipo === 'regra')) linhas.push('aviso: falta o fecho (tipo regra), que junta tudo numa regra');
    const nf = L.filter((l) => l.tipo === 'frase').length;
    if (ok) linhas.push(`tipo mito ou verdade: ${nf} frase(s), cada uma com veredito e porquê`);
    return { ok, linhas };
  },
};
