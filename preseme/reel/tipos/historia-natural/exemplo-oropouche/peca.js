// PRESEME · motor "história natural" · a conferência do tipo (do molde: igual em toda peça; o motor chama no comando textos)
// Trava (ok false) quando: a régua tem menos de 3 ou mais de 7 fases; uma fase fica sem nome ou sem frase; as cenas das fases
// não seguem a ordem das FASES, ou um "dia" volta (régua fora de ordem); um trecho de PREVENCAO cita uma fase que não existe,
// começa depois de onde termina, encosta noutro trecho ou põe os níveis fora da ordem do tempo (primária, secundária,
// terciária); um nível usado fica sem nome no textos.txt; a linha do primeiro sintoma cai na primeira fase ou aparece duas
// vezes; falta a pergunta no começo ou o fecho no fim; a peça passa de 2 minutos.
// Avisa (sem travar) quando: a prevenção primária chega na fase do primeiro sintoma (primária é antes de a doença
// começar); a placa de parar está num trecho de terciária; um "o que se faz" (acao) está vazio; o fecho não tem placa de parar.
const NIV = ['primaria', 'secundaria', 'terciaria'];
const n2 = (n) => String(n).padStart(2, '0');

module.exports = {
  conferir(T, S) {
    const linhas = [];
    let ok = true;
    const erro = (m) => { ok = false; linhas.push(`ERRO: ${m}`); };
    const aviso = (m) => linhas.push(`aviso: ${m}`);
    const F = S.FASES || [], RO = S.ROTEIRO || [], PV = S.PREVENCAO || [];
    if (F.length < 3 || F.length > 7) erro(`a régua tem ${F.length} fases; o tipo pede de 3 a 7 (FASES no score.js).`);
    const ids = F.map((f) => f.id);
    if (new Set(ids).size !== ids.length) erro('há duas fases com o mesmo id em FASES.');
    // cada fase: nome no textos.txt e uma cena com frase
    F.forEach((f, i) => {
      if (!String(T[f.nome] || '').trim()) erro(`a fase "${f.id}" está sem nome: a palavra [${f.nome}] não está no textos.txt.`);
      if (f.dias && !String(T[f.dias] || '').trim()) aviso(`a fase "${f.id}" aponta o tempo [${f.dias}], que está vazio: ela fica sem tempo em cima da régua.`);
      const c = RO.find((r) => r.tipo === 'fase' && r.id === f.id);
      if (!c) erro(`a fase "${f.id}" não tem cena no ROTEIRO (tipo "fase", id "${f.id}").`);
      else if (!(c.linhas || []).some((n) => String(T[n] || '').trim())) erro(`a fase "${f.id}" está sem frase: as frases ${(c.linhas || []).map((n) => `[${n2(n)}]`).join(' ')} estão vazias ou não existem.`);
    });
    for (const r of RO) if (r.tipo === 'fase' && !ids.includes(r.id)) erro(`a cena "${r.id}" do ROTEIRO é de tipo "fase", e não há fase com esse id em FASES.`);
    // a régua em ordem: as cenas das fases na ordem das FASES, e os dias que só andam para a frente
    const ordem = RO.filter((r) => r.tipo === 'fase').map((r) => ids.indexOf(r.id)).filter((i) => i >= 0);
    if (ordem.some((v, i) => i > 0 && v <= ordem[i - 1])) erro(`régua fora de ordem: as cenas das fases vêm na ordem ${ordem.map((i) => ids[i]).join(', ')}, e a régua é ${ids.join(', ')}.`);
    const dias = F.filter((f) => typeof f.dia === 'number');
    if (dias.some((f, i) => i > 0 && f.dia < dias[i - 1].dia)) erro(`régua fora de ordem: o "dia" volta (${dias.map((f) => `${f.id} ${f.dia}`).join(', ')}).`);
    // a pergunta no começo e o fecho no fim
    if (!RO.length || RO[0].tipo !== 'pergunta') erro('a primeira cena do ROTEIRO tem de ser a pergunta (tipo "pergunta"): é a capa.');
    if (!RO.length || RO[RO.length - 1].tipo !== 'fecho') erro('a última cena do ROTEIRO tem de ser o fecho (tipo "fecho"): a régua inteira com a prevenção.');
    // a linha do primeiro sintoma
    const hs = F.map((f, i) => (f.horizonte ? i : -1)).filter((i) => i >= 0);
    if (hs.length > 1) erro(`a linha do primeiro sintoma (horizonte: true) aparece em ${hs.length} fases; é uma só.`);
    if (hs[0] === 0) erro('a linha do primeiro sintoma está na primeira fase: antes dela tem de haver o tempo em que a doença está lá e nada aparece.');
    if (hs.length && !String(T[S.HORIZONTE] || '').trim()) aviso(`a palavra da linha do primeiro sintoma [${S.HORIZONTE}] está vazia: a linha sai sem rótulo.`);
    // os trechos da prevenção
    const tr = [];
    PV.forEach((p, j) => {
      const nome = `o trecho ${j + 1} da PREVENCAO (${p.nivel || 'sem nível'})`;
      if (!NIV.includes(p.nivel)) { erro(`${nome}: o nível tem de ser primaria, secundaria ou terciaria.`); return; }
      const i0 = ids.indexOf(p.de), i1 = ids.indexOf(p.ate);
      if (i0 < 0 || i1 < 0) { erro(`${nome} marca a prevenção numa fase que não existe ("${i0 < 0 ? p.de : p.ate}"; as fases são ${ids.join(', ')}).`); return; }
      if (i1 < i0) { erro(`${nome} começa em "${p.de}", depois de onde termina ("${p.ate}").`); return; }
      if (!String(T[(S.NIVEIS || {})[p.nivel]] || '').trim()) erro(`o nome do nível ${p.nivel} ([${(S.NIVEIS || {})[p.nivel]}]) está vazio no textos.txt.`);
      if (p.acao && !String(T[p.acao] || '').trim()) aviso(`${nome} aponta o que se faz em [${p.acao}], que está vazio.`);
      if (p.para && p.nivel === 'terciaria') aviso(`${nome} tem a placa de parar num trecho de terciária: a terciária é depois que a doença aconteceu.`);
      if (p.nivel === 'primaria' && hs.length && i1 >= hs[0]) aviso(`${nome} chega na fase do primeiro sintoma ("${ids[hs[0]]}"): a primária é antes de a doença começar.`);
      tr.push({ nivel: p.nivel, i0, i1, j });
    });
    for (const a of tr) for (const b of tr) if (a.j < b.j && a.i0 <= b.i1 && b.i0 <= a.i1) erro(`os trechos ${a.j + 1} (${a.nivel}) e ${b.j + 1} (${b.nivel}) da PREVENCAO encostam um no outro: cada fase tem um nível só.`);
    const pos = (n) => tr.filter((x) => x.nivel === n);
    for (let k = 0; k < NIV.length - 1; k++) for (const a of pos(NIV[k])) for (const b of tr.filter((x) => NIV.indexOf(x.nivel) > k)) if (a.i0 > b.i1) erro(`níveis fora de ordem na régua: ${a.nivel} (de "${ids[a.i0]}") vem depois de ${b.nivel} (até "${ids[b.i1]}").`);
    if (!PV.some((p) => p.para)) aviso('nenhum trecho tem a placa de parar (para: true): o fecho fica sem dizer onde dava para parar a doença.');
    // o tamanho
    if (S.DURATION > 120) erro(`a peça tem ${S.DURATION.toFixed(1)} s; o tipo vai até 2 minutos. Corte frase ou junte fases.`);
    if (ok) linhas.push(`RÉGUA OK: ${F.length} fases (${F.map((f) => T[f.nome] || f.id).join(' → ')}); prevenção: ${tr.map((x) => `${x.nivel} de ${ids[x.i0]} a ${ids[x.i1]}`).join('; ') || 'nenhuma'}${hs.length ? `; primeiro sintoma em ${ids[hs[0]]}` : ''}.`);
    return { ok, linhas };
  },
};
