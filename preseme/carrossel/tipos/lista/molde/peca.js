// PRESEME · carrossel LISTA · a conferência do tipo (o motor roda no comando textos; ok false trava).
// Confere o que faz a lista quebrar: o número da capa diferente do número de itens (a capa promete 5 e mostra 4); de 2
// a 7 itens; item sem nome ou sem porquê; uma lâmina por item, na ordem; a lâmina-resumo (a penúltima) com uma linha por
// item, cada linha começando pelo nome do item dela (o resumo que não bate com os itens ensina errado); a última lâmina
// dizendo o que fazer. Avisa o que deixa a lista rasa: porquê longo demais, item sem desenho, resumo sem fonte, o que
// fazer sem quem faz, cartão do 192 sem a palavra "192".
// É do tipo: vale para toda peça lista (não precisa mexer).
const n2 = (n) => String(n).padStart(2, '0');
const rot = (k) => (typeof k === 'number' ? `[${n2(k)}]` : `[${k}]`);
const semAcento = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const EXTENSO = { um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10 };
// o número que o título promete: o primeiro número da frase, em algarismo ("5 cuidados") ou por extenso ("Cinco cuidados")
function numeroDoTitulo(s) {
  const t = semAcento(s);
  const m = t.match(/\d+/);
  const pal = t.split(/[^a-z0-9]+/).find((w) => EXTENSO[w] !== undefined && w !== 'um' && w !== 'uma');
  if (m && (!pal || t.indexOf(m[0]) <= t.indexOf(pal))) return parseInt(m[0], 10);
  return pal ? EXTENSO[pal] : null;
}
// quantas frases tem o texto (pelo ponto final, de exclamação ou de interrogação seguido de espaço ou do fim)
const nFrases = (s) => (String(s || '').trim().match(/[.!?](\s|$)/g) || []).length;
module.exports = {
  conferir(T, S) {
    const L = S.LAMINAS || [], LI = S.LISTA || [], linhas = [];
    let ok = true;
    const erro = (m) => { ok = false; linhas.push(m); };
    const aviso = (m) => linhas.push('aviso: ' + m);
    // a capa e o número que ela promete
    const C = S.CAPA || {}, k1 = (C.linhas || [1])[0], tit = String(T[k1] || '');
    if (!L.length || L[0].tipo !== 'capa') erro('a lâmina 1 tem de ser a capa (tipo capa)');
    const prometido = numeroDoTitulo(tit);
    if (prometido == null) erro(`a capa ${rot(k1)} não diz o número da lista: o título começa pelo número de itens ("${LI.length} cuidados no calor...")`);
    else if (prometido !== LI.length) erro(`a capa ${rot(k1)} promete ${prometido} e a lista tem ${LI.length} item(ns): o número da capa tem de ser o número de itens`);
    else if (!/^\s*\d/.test(tit)) aviso(`a capa ${rot(k1)} diz o número por extenso: com o algarismo no começo ("${LI.length} ..."), ele sai grande ao lado do título`);
    // os itens
    if (LI.length < 2 || LI.length > 7) erro(`a lista tem ${LI.length} item(ns): o tipo pede de 2 a 7 (mais de 7 não se guarda; um só não é lista)`);
    LI.forEach((it, i) => {
      const q = `item ${i + 1}`;
      const nome = String(T[it.nome] || '').trim();
      if (!nome) erro(`${q}: sem o nome ${rot(it.nome)}`);
      const ps = [].concat(it.porque).filter((k) => k != null);
      const txt = ps.map((k) => String(T[k] || '').trim()).filter(Boolean).join(' ');
      if (!txt) erro(`${q}: "${nome || '?'}" está sem o porquê (a frase ${ps.map(rot).join(' ') || '?'}): item sem porquê é lista rasa`);
      else {
        if (nFrases(txt) > 2) aviso(`${q}: o porquê tem ${nFrases(txt)} frases; o tipo pede uma ou duas, curtas`);
        if (txt.length > 230) aviso(`${q}: o porquê tem ${txt.length} caracteres; acima de uns 230 a letra fica pequena na lâmina`);
      }
      if (!it.desenho || it.desenho === 'troque') aviso(`${q}: sem o desenho que mostra o item (desenho: troque)`);
    });
    // uma lâmina por item, na ordem
    const its = L.filter((l) => l.tipo === 'item');
    if (its.length !== LI.length) erro(`a lista tem ${LI.length} item(ns) e há ${its.length} lâmina(s) de item: cada item precisa da lâmina dele`);
    else if (its.some((l, i) => l.item !== i)) erro('as lâminas de item saíram fora da ordem da lista');
    // o resumo: a penúltima, uma linha por item, cada uma começando pelo nome do item dela
    const rs = L.filter((l) => l.tipo === 'resumo'), r = rs[rs.length - 1], RS = S.RESUMO || {};
    if (!r) erro('falta a lâmina-resumo (tipo resumo), a penúltima, com a lista toda');
    else {
      if (r !== L[L.length - 2]) erro('a lâmina-resumo tem de ser a penúltima (antes do "o que fazer")');
      if (!T[RS.titulo]) aviso('o resumo está sem título (RESUMO.titulo)');
      LI.forEach((it, i) => {
        const s = String(T[it.resumo] || '').trim(), nome = String(T[it.nome] || '').trim();
        const w1 = semAcento(nome).split(/[\s,.:;]+/)[0];
        if (!s) erro(`resumo: falta a linha do item ${i + 1} (a frase ${rot(it.resumo)}): a lâmina-resumo não bate com os itens`);
        else if (nome && !semAcento(s).startsWith(w1)) erro(`resumo: a linha ${rot(it.resumo)} não começa pelo nome do item ${i + 1} ("${nome}"): a lâmina-resumo não bate com os itens`);
      });
      if (!T[RS.fonte]) aviso('o resumo está sem a fonte (RESUMO.fonte)');
      const nr = numeroDoTitulo(T[RS.titulo]);
      if (nr != null && nr !== LI.length) erro(`o título do resumo ${rot(RS.titulo)} fala em ${nr} e a lista tem ${LI.length}`);
    }
    // o que fazer: a última
    const F = S.FAZER || {}, fs = L.filter((l) => l.tipo === 'fazer'), f = fs[fs.length - 1];
    if (!f) erro('falta a última lâmina, o que fazer (tipo fazer)');
    else {
      if (f !== L[L.length - 1]) erro('o "o que fazer" tem de ser a última lâmina');
      const cs = (F.cartoes || []).filter((c) => T[c.texto]);
      if (!cs.length) erro('o "o que fazer" está sem cartão: diga o que é de você, o que é da equipe e, quando couber, quando chamar o 192');
      (F.cartoes || []).forEach((c, i) => {
        if (T[c.texto] && !T[c.quem]) aviso(`o cartão ${i + 1} do "o que fazer" está sem quem faz (${rot(c.quem)})`);
        if (c.icone === '192' && !/192/.test(String(T[c.quem] || '') + String(T[c.texto] || ''))) aviso(`o cartão do 192 não diz "192" (${rot(c.quem)} ou ${rot(c.texto)})`);
      });
      if (!T[F.fonte]) aviso('o "o que fazer" está sem a fonte (FAZER.fonte)');
    }
    if (L.length < 5 || L.length > 10) aviso(`${L.length} lâminas: o tipo foi feito para 5 a 10`);
    if (ok) linhas.push(`tipo lista: ${LI.length} itens (${LI.map((it) => String(T[it.nome] || '?').trim()).join(' · ')}), a capa promete ${prometido}, o resumo e o que fazer no fim (${L.length} lâminas)`);
    return { ok, linhas };
  },
};
