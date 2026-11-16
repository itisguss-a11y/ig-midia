// PRESEME · carrossel CASO, ARRASTE PARA A RESPOSTA · a conferência do tipo (o motor roda no comando textos; ok false
// trava). É do tipo: vale para toda peça deste tipo (não precisa mexer).
// Trava o que quebra o tipo:
//   - a capa não é o caso; não há uma lâmina de pergunta e uma de resposta; a resposta vem antes da pergunta;
//   - um porquê aparece antes da resposta (a resposta só pode aparecer depois de arrastar);
//   - menos de 2 ou mais de 4 opções; opção vazia; opção sem lâmina de porquê;
//   - o primeiro porquê de uma opção não começa com Certa, Errada ou Pode ser (é de lá que sai o selo);
//   - a resposta diz a letra ("É a B") e as certas não são essas; diz "qualquer uma" e há ERRADA; diz "nenhuma" e há
//     selo que não é ERRADA.
// Avisa: pergunta sem "?"; opção com mais de 5 palavras; resposta que não diz a letra; menos de 7 ou mais de 10 lâminas;
// falta o resumo.
const n2 = (n) => String(n).padStart(2, '0');
const LETRA = ['A', 'B', 'C', 'D'];
module.exports = {
  conferir(T, S) {
    const L = S.LAMINAS || [], OP = S.OPCOES || [], linhas = [];
    let ok = true;
    const erro = (s) => { ok = false; linhas.push(s); };
    const idx = (tipo) => L.findIndex((l) => l.tipo === tipo);
    if (!L.length || L[0].tipo !== 'caso') erro('a lâmina 01 (a capa) tem de ser o caso (tipo caso)');
    const np = L.filter((l) => l.tipo === 'pergunta').length, nr = L.filter((l) => l.tipo === 'resposta').length;
    if (np !== 1) erro(`o tipo pede uma lâmina de pergunta, e há ${np}`);
    if (nr !== 1) erro(`o tipo pede uma lâmina de resposta, e há ${nr}`);
    const ip = idx('pergunta'), ir = idx('resposta');
    if (ip >= 0 && ir >= 0 && ir < ip) erro(`a resposta (lâmina ${n2(L[ir].n)}) vem antes da pergunta (lâmina ${n2(L[ip].n)}): ela só aparece depois de arrastar`);
    L.forEach((l, i) => { if (l.tipo === 'porque' && ir >= 0 && i < ir) erro(`lâmina ${n2(l.n)}: o porquê aparece antes da resposta (lâmina ${n2(L[ir].n)})`); });
    if (OP.length < 2 || OP.length > 4) erro(`o tipo pede de 2 a 4 opções (OPCOES no score.js), e há ${OP.length}`);
    // o veredito de cada opção: a primeira frase do primeiro porquê dela
    const VER = OP.map((n, i) => {
      const txt = String(T[n] || '').trim();
      if (!txt) erro(`a opção ${LETRA[i]} (frase [${n2(n)}]) está vazia`);
      else if (txt.split(/\s+/).length > 5) linhas.push(`aviso: a opção ${LETRA[i]} ("${txt}") passa de 5 palavras: no cartão, curto se lê de uma vez`);
      const ls = L.filter((l) => l.tipo === 'porque' && String(l.opcao || '').toUpperCase() === LETRA[i]);
      if (!ls.length) { erro(`a opção ${LETRA[i]} ("${txt}") não tem lâmina de porquê (tipo porque, opcao: '${LETRA[i]}'): veredito sem porquê é a peça rasa`); return null; }
      const f = String(T[ls[0].linhas[0]] || '').trim();
      const m = /^(pode\s+ser|certa|certo|errada|errado)\b/i.exec(f);
      if (!m) { erro(`lâmina ${n2(ls[0].n)}: o primeiro porquê da opção ${LETRA[i]} tem de começar com Certa, Errada ou Pode ser (é de lá que sai o selo), e começa com "${f.slice(0, 30)}"`); return null; }
      const w = m[1].toLowerCase().replace(/\s+/g, ' ');
      return w === 'pode ser' ? 'pode' : w.startsWith('cert') ? 'certa' : 'errada';
    });
    // a resposta e os selos
    if (ir >= 0) {
      const fr = String(T[L[ir].linhas[0]] || '');
      const certas = OP.map((_, i) => (VER[i] === 'certa' ? LETRA[i] : null)).filter(Boolean);
      // "É a B", "São a A e a C", "letra B" (o \b do JavaScript não enxerga o É: a borda é escrita à mão)
      const m = /(?:^|[^\wÀ-ú])(?:[ÉéE]|[Ss]ão)\s+(?:as?)\s+([A-D])((?:\s*(?:,|e)\s*(?:a\s+)?[A-D](?![\wÀ-ú]))*)(?![\wÀ-ú])/.exec(fr) || /(?:[Ll]etra|[Oo]pção|[Aa]lternativa)\s+([A-D])((?:\s*(?:,|e)\s*[A-D](?![\wÀ-ú]))*)(?![\wÀ-ú])/.exec(fr);
      if (m) {
        const ditas = [m[1]].concat((m[2] || '').match(/[A-D]/g) || []).sort();
        if (ditas.join(',') !== certas.slice().sort().join(',')) erro(`lâmina ${n2(L[ir].n)}: a resposta diz ${ditas.join(' e ')}, e os selos CERTA estão em ${certas.length ? certas.join(' e ') : 'nenhuma'}`);
      } else if (/qualquer uma|todas/i.test(fr)) {
        if (VER.includes('errada')) erro(`lâmina ${n2(L[ir].n)}: a resposta diz "qualquer uma", e há opção com o selo ERRADA`);
      } else if (/nenhuma/i.test(fr)) {
        if (VER.some((v) => v && v !== 'errada')) erro(`lâmina ${n2(L[ir].n)}: a resposta diz "nenhuma", e há opção com selo que não é ERRADA`);
      } else linhas.push(`aviso: a resposta (lâmina ${n2(L[ir].n)}) não diz a letra ("É a B: ..."): quem arrastou quer saber logo se acertou`);
    }
    if (ip >= 0) {
      const q = L[ip].linhas.find((n) => !OP.includes(n));
      if (!/\?\s*$/.test(String(T[q] || ''))) linhas.push(`aviso: a pergunta (lâmina ${n2(L[ip].n)}) não termina em "?"`);
    }
    if (L.length < 7 || L.length > 10) linhas.push(`aviso: o tipo fica entre 7 e 10 lâminas, e esta tem ${L.length}`);
    if (idx('resumo') < 0) linhas.push('aviso: falta o resumo para salvar (tipo resumo), a lâmina que mais se guarda');
    if (ok) linhas.push(`tipo caso, arraste para a resposta: ${OP.length} opções (${OP.map((_, i) => `${LETRA[i]} ${({ certa: 'CERTA', errada: 'ERRADA', pode: 'PODE SER' })[VER[i]] || '?'}`).join(', ')}), cada uma com porquê; a resposta depois da pergunta`);
    return { ok, linhas };
  },
};
