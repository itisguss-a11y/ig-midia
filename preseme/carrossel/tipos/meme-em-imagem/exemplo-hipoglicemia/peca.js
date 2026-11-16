// PRESEME · carrossel MEME EM IMAGEM · a conferência do tipo (o motor roda no comando textos; ok false trava).
// Confere o que quebra o meme: de 1 a 4 painéis; uma virada só, com a preparação antes e o fecho depois; texto de painel
// curto o bastante para ler no celular; balão com dono; e a lição (piada sem lição não é peça do perfil), com a fonte.
// É do tipo: vale para todo meme em imagem (não precisa mexer).
const n2 = (n) => String(n).padStart(2, '0');
const palavras = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const TEMPOS = ['preparacao', 'virada', 'fecho'];
const JEITOS = ['legenda', 'fala', 'pensa', 'grito'];
module.exports = {
  conferir(T, S) {
    const linhas = [];
    let ok = true;
    const erro = (m) => { ok = false; linhas.push(`ERRO (meme): ${m}`); };
    const aviso = (m) => linhas.push(`AVISO (meme): ${m}`);
    const PS = S.PAINEIS || [], LIC = S.LICAO || {}, QUAD = S.ARRANJO !== 'laminas';
    if (!['quadrinho', 'laminas'].includes(S.ARRANJO)) erro(`ARRANJO "${S.ARRANJO}": use 'quadrinho' ou 'laminas'`);
    // os painéis e os tempos
    if (PS.length < 1 || PS.length > 4) erro(`${PS.length} painéis: o meme tem de 1 a 4`);
    const tempos = PS.map((p) => p.tempo);
    const nv = tempos.filter((t) => t === 'virada').length;
    if (nv !== 1) erro(`${nv} painéis de virada: o meme tem uma piada só (tempo 'virada' em um painel)`);
    const iv = tempos.indexOf('virada');
    PS.forEach((p, i) => {
      if (!TEMPOS.includes(p.tempo)) erro(`painel ${p.id}: tempo "${p.tempo}"; use preparacao, virada ou fecho`);
      else if (p.tempo === 'preparacao' && iv >= 0 && i > iv) erro(`painel ${p.id}: a preparação vem antes da virada`);
      else if (p.tempo === 'fecho' && i < iv) erro(`painel ${p.id}: o fecho vem depois da virada`);
    });
    if (tempos.filter((t) => t === 'preparacao').length > 2) erro('mais de 2 painéis de preparação: a piada demora a chegar');
    if (tempos.filter((t) => t === 'fecho').length > 1) erro('mais de 1 painel de fecho');
    if (S.GRADE && QUAD) {
      const nums = S.GRADE.flat();
      if (nums.length !== PS.length || PS.some((_, i) => !nums.includes(i + 1))) erro(`GRADE ${JSON.stringify(S.GRADE)} não tem cada painel uma vez (são ${PS.length})`);
    }
    // os textos dos painéis
    const maxP = QUAD ? 12 : 18;
    for (const p of PS) {
      const ts = (p.textos || []).filter((x) => T[x.n]);
      if (ts.length > 3) erro(`painel ${p.id}: ${ts.length} textos; no máximo 3 (painel cheio não se lê no celular)`);
      if (ts.filter((x) => x.como === 'legenda').length > 1) aviso(`painel ${p.id}: mais de uma legenda; o narrador fala uma vez por painel`);
      for (const x of ts) {
        if (!JEITOS.includes(x.como)) erro(`[${n2(x.n)}]: como "${x.como}"; use legenda, fala, pensa ou grito`);
        if ((x.como === 'fala' || x.como === 'pensa') && !x.quem) erro(`[${n2(x.n)}]: o balão de ${x.como} precisa de quem (o id da pessoa que o palco devolve em cabecas)`);
        const np = palavras(T[x.n]);
        if (np > maxP) erro(`[${n2(x.n)}] tem ${np} palavras; no ${QUAD ? 'quadrinho' : 'painel de lâmina inteira'} o máximo é ${maxP} (texto longo não se lê no celular)`);
      }
      for (const k of p.rotulos || []) if (T[k] && palavras(T[k]) > 8) aviso(`[${k}] tem ${palavras(T[k])} palavras: rótulo de dentro da cena se lê melhor com até 8`);
    }
    // a lição
    const lk = (LIC.linhas || []).filter((k) => T[k]);
    if (!lk.length) erro('piada sem a lição: falta a frase do que fica de medicina preventiva (LICAO.linhas)');
    const maxL = QUAD ? 2 : 3;
    if (lk.length > maxL) erro(`a lição tem ${lk.length} frases; ${QUAD ? 'na faixa do quadrinho' : 'no cartão'} cabem até ${maxL}`);
    for (const k of lk) { const np = palavras(T[k]); if (np > 22) erro(`[${n2(k)}], da lição, tem ${np} palavras: até 22`); }
    if (!T[LIC.fonte]) erro('a lição sai com a fonte na tela (LICAO.fonte: uma palavra D, "Fonte · órgão, documento, ano")');
    if (LIC.etiqueta && !T[LIC.etiqueta]) aviso(`a etiqueta da lição (${LIC.etiqueta}) está vazia: a lição sai sem o "O QUE FICA"`);
    // a primeira frase abre a peça (o motor confere o [01] na lâmina 1)
    const primeira = PS.length ? (PS[0].textos || []).map((x) => x.n).filter((n) => T[n])[0] : null;
    if (primeira && primeira !== 1) aviso(`a primeira frase do primeiro painel é a [${n2(primeira)}]; numere a partir dela, [01]`);
    if (ok) linhas.push(`tipo meme em imagem: ${PS.length} painel(is) (${tempos.join(', ')}), arranjo ${S.ARRANJO}, lição com ${lk.length} frase(s) e fonte`);
    return { ok, linhas };
  },
};
