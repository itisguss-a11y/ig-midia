// PRESEME · molde "a palavra" · a conferência do molde (o motor chama conferir(T, S) no comando textos).
// Trava o que quebra o tipo: as cinco partes fora da ordem ou faltando, mais frases do que cada parte comporta, peça
// acima de 40 s, palavra sem definição com fonte (falta a palavra, a fonte ou a frase do que ela quer dizer), exemplo que
// não é da atenção primária e pegadinha sem os dois lados. Avisa: sílabas que não batem com a palavra, mais de uma
// sílaba forte, pergunta ou fecho sem a palavra, lado da pegadinha longo demais para o cartão.
const PARTES = ['palavra', 'significa', 'exemplo', 'pegadinha', 'fecho'];
const LIMITE = { palavra: [1, 1], significa: [1, 2], exemplo: [1, 2], pegadinha: [1, 1], fecho: [1, 1] };
// palavras que mostram que o exemplo é da atenção primária (na frase do exemplo ou na etiqueta [D08])
const APS = ['ubs', 'unidade basica', 'unidade de saude', 'posto', 'visita', 'agente', 'acs', 'equipe', 'saude da familia', 'esf', 'atencao primaria', 'atencao basica', 'consulta', 'territorio', 'microarea', 'cadastro', 'cadastra'];
const tira = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const vazio = (s) => !String(s || '').trim() || /^\(.*\)$/.test(String(s).trim());
const nn = (n) => String(n).padStart(2, '0');

module.exports = {
  conferir(T, S) {
    const linhas = [];
    let ok = true;
    const falha = (m) => { ok = false; linhas.push('ERRO: ' + m); };
    const aviso = (m) => linhas.push('AVISO: ' + m);
    const ids = (S.cenas || []).map((c) => c.id);
    if (ids.join(',') !== PARTES.join(',')) falha(`as partes têm de ser ${PARTES.join(', ')}, nesta ordem e todas com frase (o score tem ${ids.join(', ') || 'nenhuma'})`);
    const cena = (id) => (S.cenas || []).find((c) => c.id === id);
    for (const id of PARTES) {
      const c = cena(id); if (!c) continue;
      const [a, z] = LIMITE[id];
      if (c.itens.length < a || c.itens.length > z) falha(`a parte "${id}" tem ${c.itens.length} frases: ${a === z ? `é ${a}` : `são de ${a} a ${z}`}`);
    }
    if (S.DURATION > 40) falha(`a peça dura ${S.DURATION.toFixed(1)} s: o tipo vai até 40 s (corte frase ou palavra)`);
    else if (S.DURATION < 18) aviso(`a peça dura ${S.DURATION.toFixed(1)} s: abaixo de uns 20 s a palavra não chega a ser explicada`);
    // a palavra, com definição e fonte
    const pal = String(T.D02 || '').trim();
    if (vazio(pal)) falha('falta a palavra: [D02]');
    if (vazio(T.D04)) falha('falta a fonte da definição: [D04] (ex.: "PNAB, Portaria 2.436/2017"); palavra sem fonte não sai');
    const si = cena('significa');
    if (si && vazio(T[String(si.itens[0].n)])) falha('falta a frase do que a palavra quer dizer (a primeira de "significa")');
    // as sílabas (opcionais): juntas, têm de dar a palavra; uma forte só, em maiúsculas
    const sil = String(T.D03 || '').trim();
    if (sil && !vazio(sil)) {
      const partes = sil.split(/[·.\-\s]+/).filter(Boolean);
      if (tira(partes.join('')) !== tira(pal.split(/\s+/).pop())) aviso(`as sílabas "${sil}" juntas não dão "${pal.split(/\s+/).pop()}"`);
      const fortes = partes.filter((p) => p === p.toUpperCase() && p !== p.toLowerCase());
      if (fortes.length !== 1) aviso(`as sílabas "${sil}" têm ${fortes.length} sílabas em maiúsculas: a forte é uma só (ex.: ads·CRI·ta)`);
    }
    // a pergunta e o fecho falam a palavra
    const raiz = tira(pal.split(/\s+/).pop()).slice(0, Math.max(4, Math.min(7, pal.length - 2)));
    const pa = cena('palavra'), fe = cena('fecho');
    if (pa && raiz && !tira(T[String(pa.itens[0].n)]).includes(raiz)) aviso(`a pergunta [${nn(pa.itens[0].n)}] não fala a palavra "${pal}"`);
    if (fe && raiz && !tira(T[String(fe.itens[0].n)]).includes(raiz)) aviso(`o fecho [${nn(fe.itens[0].n)}] não fala a palavra "${pal}": é a palavra de novo`);
    // o exemplo é da atenção primária
    const ex = cena('exemplo');
    if (ex) {
      const txt = tira(ex.itens.map((it) => T[String(it.n)]).join(' ') + ' ' + (T.D08 || ''));
      if (!APS.some((w) => txt.includes(w))) falha('o exemplo não é da atenção primária: a frase ou a etiqueta [D08] tem de mostrar a UBS, a visita, a equipe ou o agente');
    }
    // a pegadinha tem os dois lados, curtos
    for (const k of ['D05', 'D06']) {
      if (vazio(T[k])) falha(`falta o lado [${k}] da pegadinha`);
      else if (String(T[k]).trim().split(/\s+/).length > 4) aviso(`o lado [${k}] da pegadinha tem mais de 4 palavras: o cartão fica apertado`);
    }
    if (ok) linhas.push(`molde da palavra: "${pal}", 5 partes, ${S.DURATION.toFixed(1)} s, fonte ${String(T.D04 || '').trim()}`);
    return { ok, linhas };
  },
};
