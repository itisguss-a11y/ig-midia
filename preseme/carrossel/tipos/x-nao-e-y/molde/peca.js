// PRESEME · carrossel X NÃO É Y · a conferência do tipo (o motor roda no comando textos; ok false trava).
// Confere a espinha do tipo: os dois nomes da capa (X e Y) têm cada um a lâmina de conceito, o caso e a pergunta de
// reconhecer usam os mesmos nomes, na mesma ordem, e nada falta (conceito, caso, reconhecer). É do tipo: não precisa mexer.
const n2 = (n) => String(n).padStart(2, '0');
module.exports = {
  conferir(T, S) {
    const L = S.LAMINAS || [], linhas = [], capa = L.find((l) => l.tipo === 'capa');
    let ok = true;
    if (!capa || capa.palavras.length < 3) return { ok: false, linhas: ['a capa leva três palavras D: a etiqueta, o nome de X e o nome de Y'] };
    const [, kx, ky] = capa.palavras;
    if (!/não é/i.test(String(T[capa.linhas[0]] || ''))) linhas.push('aviso: o título da capa costuma ser "X não é Y", com o "não é" no destaque');
    for (const k of [kx, ky]) if (!L.some((l) => l.tipo === 'conceito' && l.palavras[0] === k)) { ok = false; linhas.push(`falta a lâmina de conceito de "${T[k]}" (tipo conceito, com ${k} como primeira palavra D)`); }
    for (const l of L) {
      if (l.tipo === 'caso' && (l.palavras[1] !== kx || l.palavras[2] !== ky)) { ok = false; linhas.push(`lâmina ${n2(l.n)}: o caso usa os nomes da capa (${kx} e ${ky}), na mesma ordem`); }
      if (l.tipo === 'reconhecer' && (l.palavras.length < 6 || l.palavras[4] !== kx || l.palavras[5] !== ky)) { ok = false; linhas.push(`lâmina ${n2(l.n)}: reconhecer leva seis palavras D (etiqueta, pergunta, ramo da esquerda, ramo da direita, ${kx}, ${ky})`); }
    }
    if (!L.some((l) => l.tipo === 'caso')) { ok = false; linhas.push('falta o caso que separa os dois (tipo caso)'); }
    if (!L.some((l) => l.tipo === 'reconhecer')) { ok = false; linhas.push('falta o como reconhecer na prática (tipo reconhecer)'); }
    if (ok) linhas.push(`tipo X não é Y: "${T[kx]}" e "${T[ky]}" com conceito, caso e reconhecer`);
    return { ok, linhas };
  },
};
