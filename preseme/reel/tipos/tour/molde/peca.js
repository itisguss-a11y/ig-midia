// PRESEME · tipo "tour" · a conferência do tipo (do molde: igual em toda peça; o motor chama no comando textos)
// Trava (ok false) quando: a primeira cena não é a entrada ou a última não é a planta; há menos de 2 ou mais de 7 salas;
// uma sala do ROTEIRO ficou sem frase; uma sala tem mais de 3 frases; uma sala não tem placa (a [Dnn] do score.js vazia
// no textos.txt) ou a placa não cabe (mais de 40 letras); um crachá ([Dnn] do quem) está vazio ou a sala tem mais de duas
// pessoas; os números das salas não vão de 1 a N, na ordem; a planta não bate com as salas (outra quantidade, outra placa
// ou outro número); a sala de 3 frases não tem a etiqueta do aluno; a peça passa de 2min30.
// Avisa (sem travar) quando: a fachada está sem nome; a pergunta [01] não termina em "?"; a planta tem mais de 2 frases.
const n2 = (n) => String(n).padStart(2, '0');

module.exports = {
  conferir(T, S) {
    const linhas = [];
    let ok = true;
    const erro = (m) => { ok = false; linhas.push(`ERRO: ${m}`); };
    const aviso = (m) => linhas.push(`aviso: ${m}`);
    const tem = (k) => String(T[k] || '').trim().length > 0;
    const cenas = S.cenas || [], rot = S.ROTEIRO || [];
    if (!cenas.length) { erro('nenhuma cena tem frase no textos.txt.'); return { ok, linhas }; }
    if (cenas[0].tipo !== 'entrada') erro(`a primeira cena é "${cenas[0].id}"; o tour começa pela entrada (tipo 'entrada').`);
    if (cenas[cenas.length - 1].tipo !== 'planta') erro(`a última cena é "${cenas[cenas.length - 1].id}"; o tour acaba na planta (tipo 'planta').`);
    const pg = String(T[1] || '').trim();
    if (pg && !/\?$/.test(pg)) aviso('a pergunta [01] não termina em "?".');
    if (S.LUGAR && !tem(S.LUGAR.placa)) aviso(`a fachada está sem nome: [${S.LUGAR.placa}] vazia no textos.txt.`);
    if (S.LUGAR && !tem(S.LUGAR.entrada)) erro(`a entrada está sem nome: [${S.LUGAR.entrada}] vazia (ela aparece no corredor e na planta).`);
    // as salas do ROTEIRO: frase, placa, crachá e número
    const salasR = rot.filter((r) => r.tipo === 'sala');
    for (const r of salasR) if (!(r.linhas || []).some((n) => tem(n))) erro(`a sala "${r.id}" ficou sem frase no textos.txt: sala sem frase não entra no tour (apague do ROTEIRO ou escreva a frase).`);
    const salas = cenas.filter((c) => c.tipo === 'sala');
    if (salas.length < 2) erro(`são ${salas.length} sala(s); o tour tem de 2 a 7.`);
    if (salas.length > 7) erro(`são ${salas.length} salas; o tour tem até 7 (a planta e o tempo não cabem). Divida em duas peças.`);
    salas.forEach((c, i) => {
      if (c.num !== i + 1) erro(`a sala "${c.id}" tem o número ${c.num}; as salas vão de 1 a ${salas.length}, na ordem do ROTEIRO.`);
      if (!c.placa || !tem(c.placa)) erro(`a sala "${c.id}" está sem placa: [${c.placa || '?'}] vazia no textos.txt.`);
      else if (String(T[c.placa]).trim().length > 40) erro(`a placa [${c.placa}] tem ${String(T[c.placa]).trim().length} letras; até 40 cabem na porta e na planta. Use o nome curto da sala.`);
      if (c.itens.length > 3) erro(`a sala "${c.id}" tem ${c.itens.length} frases; o molde desenha até 3 (o corredor e a sala, de perto, o aluno).`);
      const qs = c.quem || [];
      if (qs.length > 2) erro(`a sala "${c.id}" tem ${qs.length} pessoas no quem; cabem até 2.`);
      qs.forEach((q) => { if (!q.rotulo || !tem(q.rotulo)) erro(`o crachá de quem trabalha na sala "${c.id}" está vazio: [${q.rotulo || '?'}] no textos.txt.`); });
      if (!qs.length) aviso(`a sala "${c.id}" não tem ninguém no quem: o tipo mostra quem trabalha em cada sala.`);
      if (c.itens.length === 3 && !tem(S.VOCE)) erro(`a sala "${c.id}" tem a 3ª frase (o aluno), mas a etiqueta [${S.VOCE}] do aluno está vazia.`);
    });
    // a planta: sai das mesmas salas; confere que nada se perdeu no caminho
    const pontos = (S.PONTOS || []).filter((p) => p.tipo === 'sala');
    if (pontos.length !== salas.length) erro(`a planta tem ${pontos.length} salas e o tour tem ${salas.length}.`);
    else pontos.forEach((p, i) => { if (p.placa !== salas[i].placa || p.num !== salas[i].num) erro(`a sala ${i + 1} da planta (${p.num}, [${p.placa}]) não bate com a do tour (${salas[i].num}, [${salas[i].placa}]).`); });
    const pl = cenas.find((c) => c.tipo === 'planta');
    if (pl && pl.itens.length > 2) aviso(`a planta tem ${pl.itens.length} frases; o molde desenha 1 ou 2 (as outras repetem o resumo).`);
    if (S.DURATION > 150) erro(`a peça tem ${S.DURATION.toFixed(1)} s; o tour vai até 2min30 (150 s). Corte uma sala ou uma frase.`);
    if (ok) linhas.push(`tour: ${salas.length} salas (${salas.map((c) => `${c.num} ${String(T[c.placa] || '').trim()}`).join(' · ')}), planta com as mesmas ${pontos.length}`);
    return { ok, linhas };
  },
};
