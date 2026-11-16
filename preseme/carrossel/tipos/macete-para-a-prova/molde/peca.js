// PRESEME · carrossel MACETE PARA A PROVA · a conferência do tipo (o motor roda no comando textos; ok false trava).
// Confere o que faz o macete quebrar: de 2 a 7 peças; cada peça com a letra, o nome e a definição; a letra dentro do
// nome; uma lâmina por peça, na ordem do macete; o cartão para print no fim, com uma linha por peça, cada linha
// começando pelo nome da peça dela (o cartão que não bate com as lâminas ensina errado). Avisa o que deixa a peça rasa:
// peça sem exemplo ou sem desenho, capa sem pergunta, sem pegadinha, cartão sem regra ou sem fonte.
// É do tipo: vale para toda peça macete para a prova (não precisa mexer).
const n2 = (n) => String(n).padStart(2, '0');
const rot = (k) => (typeof k === 'number' ? `[${n2(k)}]` : `[${k}]`);
const semAcento = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
module.exports = {
  conferir(T, S) {
    const L = S.LAMINAS || [], M = S.MACETE || [], linhas = [];
    let ok = true;
    const erro = (m) => { ok = false; linhas.push(m); };
    const aviso = (m) => linhas.push('aviso: ' + m);
    // a capa
    if (!L.length || L[0].tipo !== 'capa') erro('a lâmina 1 tem de ser a capa (tipo capa)');
    else if (!/\?\s*$/.test(String(T[(S.CAPA || {}).linhas ? S.CAPA.linhas[0] : 1] || ''))) aviso('a capa não termina em "?": o tipo abre com a pergunta que cai na prova');
    // o macete
    if (M.length < 2 || M.length > 7) erro(`o macete tem ${M.length} peça(s): o tipo pede de 2 a 7 (mais de 7 não se decora; uma só não é macete)`);
    M.forEach((m, i) => {
      const q = `peça ${i + 1}`;
      const letra = String(T[m.letra] || '').trim(), nome = String(T[m.nome] || '').trim();
      if (!letra) erro(`${q}: sem a letra ${rot(m.letra)}`);
      else if (letra.replace(/\s/g, '').length > 3) erro(`${q}: a letra ${rot(m.letra)} "${letra}" tem mais de 3 letras (a ficha é para uma letra ou uma sigla curta)`);
      if (!nome) erro(`${q}: sem o nome ${rot(m.nome)}`);
      if (!T[m.define]) erro(`${q}: a letra "${letra || '?'}" está sem definição (a frase ${rot(m.define)}): letra do macete sem definição não ensina`);
      if (letra && nome && !semAcento(nome).includes(semAcento(letra).replace(/[^a-z0-9]/g, '').slice(0, 1))) aviso(`${q}: a letra "${letra}" não aparece no nome "${nome}" (o macete não fecha)`);
      if (!T[m.exemplo]) aviso(`${q}: sem o exemplo da vida real (a frase ${rot(m.exemplo)})`);
      if (!m.desenho || m.desenho === 'troque') aviso(`${q}: sem o desenho que explica (desenho: troque)`);
    });
    // uma lâmina por peça, na ordem
    const ps = L.filter((l) => l.tipo === 'peca');
    if (ps.length !== M.length) erro(`o macete tem ${M.length} peça(s) e há ${ps.length} lâmina(s) de peça: cada peça precisa da lâmina dela`);
    else if (ps.some((l, i) => l.peca !== i)) erro('as lâminas de peça saíram fora da ordem do macete');
    // a lâmina do macete inteiro, logo depois da capa
    if (L[1] && L[1].tipo !== 'macete') aviso('a lâmina 2 não é o macete inteiro (tipo macete)');
    // a pegadinha
    if (!L.some((l) => l.tipo === 'pegadinha')) aviso('sem a lâmina da pegadinha (o que a prova confunde com o quê): o macete fica sem o porquê de decorar');
    // o cartão para print: o último, uma linha por peça, cada uma começando pelo nome da peça
    const cs = L.filter((l) => l.tipo === 'cartao'), c = cs[cs.length - 1];
    if (!c) erro('falta o cartão para print (tipo cartao), a última lâmina');
    else {
      if (c !== L[L.length - 1]) erro('o cartão para print tem de ser a última lâmina');
      const C = S.CARTAO || {};
      M.forEach((m, i) => {
        const s = String(T[m.cartao] || '').trim(), nome = String(T[m.nome] || '').trim();
        if (!s) erro(`cartão: falta a linha da peça ${i + 1} (a frase ${rot(m.cartao)})`);
        else if (nome && !semAcento(s).startsWith(semAcento(nome).split(/[\s,.:;]+/)[0])) erro(`cartão: a linha ${rot(m.cartao)} não começa pelo nome da peça ${i + 1} ("${nome}"): o cartão não bate com as lâminas`);
      });
      if (!T[C.regra]) aviso('o cartão está sem a regra de uma linha (CARTAO.regra)');
      if (!T[C.fonte]) aviso('o cartão está sem a fonte (CARTAO.fonte)');
    }
    if (L.length < 6 || L.length > 10) aviso(`${L.length} lâminas: o tipo foi feito para 6 a 10`);
    if (ok) linhas.push(`tipo macete para a prova: ${M.length} peças (${M.map((m) => String(T[m.letra] || '?').trim()).join(' ')}), uma lâmina por peça, ${L.some((l) => l.tipo === 'pegadinha') ? 'a pegadinha e ' : ''}o cartão no fim (${L.length} lâminas)`);
    return { ok, linhas };
  },
};
