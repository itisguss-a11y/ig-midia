// PRESEME · motor "Dado que se move" · a conferência do tipo (do molde: igual em toda peça; o motor chama no comando textos)
// Trava (ok false) quando: o vídeo passa de 45 s; o número grande [D02] falta ou não é número; falta a unidade [D03]; falta
// a fonte [D05]; o ano não aparece na tela (nem no lugar e ano [D04], nem na fonte [D05]); a comparação tem menos de duas
// barras ou uma barra traz valor que não é só número (a unidade é uma só, a [D03]: "43,38%" ou "276 casos" travam); o
// número grande não é o da primeira barra; uma frase diz "N vezes" e a conta das barras (a primeira dividida pela última)
// dá outra coisa (mais de meia vez de diferença); a multidão (100 mil) com unidade que não é "por 100 mil", ou a grade
// (100) com unidade que não é "em cada 100" nem porcentagem; uma parte tem mais frases do que o molde desenha.
// Avisa (sem travar) quando: o ano do lugar [D04] e o da fonte [D05] são diferentes (pode ser de propósito: o dado de 2022
// publicado em 2024); a multidão passaria de 400 pontos acesos; falta a prevenção.
const n2 = (n) => String(n).padStart(2, '0');
const ANO = /\b(19|20)\d{2}\b/;

module.exports = {
  conferir(T, S) {
    const linhas = [];
    let ok = true;
    const erro = (m) => { ok = false; linhas.push(`ERRO: ${m}`); };
    const aviso = (m) => linhas.push(`aviso: ${m}`);
    const DW = S.DW, num = S.num;
    // o tamanho: o tipo é curto
    const dur = S.DURATION;
    if (dur > S.LIMITE + 1e-6) erro(`o vídeo tem ${dur.toFixed(1)} s, e o tipo vai até ${S.LIMITE} s. Corte palavras (a leitura manda no tempo) ou tire uma frase do porquê.`);
    // o número, a unidade, a fonte e o ano
    const nt = String(T[DW.numero] || '').trim(), nv = num(nt);
    if (!nt) erro(`falta o número grande [${DW.numero}].`);
    else if (!Number.isFinite(nv)) erro(`o número grande [${DW.numero}] "${nt}" não é número: escreva só os algarismos, com vírgula (ex.: 43,38). A unidade vai na [${DW.unidade}].`);
    const un = String(T[DW.unidade] || '').trim();
    if (!un) erro(`falta a unidade [${DW.unidade}] (ex.: casos por 100 mil habitantes).`);
    const fo = String(T[DW.fonte] || '').trim(), lu = String(T[DW.lugar] || '').trim();
    if (!fo) erro(`falta a fonte [${DW.fonte}]: número sem fonte não vai ao ar.`);
    const anoL = (ANO.exec(lu) || [])[0], anoF = (ANO.exec(fo) || [])[0];
    if (!anoL && !anoF) erro(`o ano do dado não está na tela: ponha no lugar e ano [${DW.lugar}] ou na fonte [${DW.fonte}].`);
    else if (anoL && anoF && anoL !== anoF) aviso(`o ano do lugar [${DW.lugar}] (${anoL}) e o da fonte [${DW.fonte}] (${anoF}) são diferentes; confira se é de propósito (dado de um ano, publicado em outro).`);
    // as barras: a mesma unidade, só número
    const bs = (S.BARRAS_D || []).filter(([a, b]) => T[a] || T[b]).map(([a, b]) => ({ a, b, nome: String(T[a] || '').trim(), texto: String(T[b] || '').trim() }));
    for (const x of bs) {
      if (!x.nome) erro(`a barra de valor [${x.b}] está sem nome [${x.a}].`);
      if (!x.texto) erro(`a barra "${x.nome}" [${x.a}] está sem valor [${x.b}].`);
      else if (!Number.isFinite(num(x.texto))) erro(`o valor [${x.b}] "${x.texto}" não é só número: a unidade é uma só para todas as barras, a [${DW.unidade}] ("${un}"). Escreva só os algarismos.`);
    }
    const boas = bs.filter((x) => x.nome && Number.isFinite(num(x.texto)));
    const temCompara = (S.COMPARA || []).some((n) => T[n]);
    if (temCompara && boas.length < 2) erro(`a comparação pede pelo menos duas barras (nome e valor, de [D08] a [D15]); há ${boas.length}.`);
    const pri = bs[0]; // a primeira barra é a da peça (se o valor dela já deu erro acima, não compara de novo)
    if (pri && Number.isFinite(num(pri.texto)) && Number.isFinite(nv) && Math.abs(num(pri.texto) - nv) > 1e-9) erro(`o número grande [${DW.numero}] (${nt}) não é o da primeira barra [${pri.b}] (${pri.texto}): a primeira barra é a da peça, com o mesmo número.`);
    // "N vezes" nas frases: tem de bater com a conta das barras
    const ult = bs[bs.length - 1], vp = pri ? num(pri.texto) : NaN, vu = ult ? num(ult.texto) : NaN;
    const razao = bs.length >= 2 && Number.isFinite(vp) && Number.isFinite(vu) && vu > 0 ? vp / vu : null; // a régua: a primeira barra ÷ a última
    for (const [k, s] of Object.entries(T)) {
      if (/^D/.test(k)) continue;
      const m = /(\d+(?:,\d+)?)\s+vezes/i.exec(String(s));
      if (!m) continue;
      const v = num(m[1]);
      if (razao == null) { if (bs.length < 2) erro(`a frase [${n2(k)}] diz "${m[0]}", e não há duas barras para a conta.`); continue; } // barra com valor errado: o erro dela já está acima
      if (Math.abs(v - razao) > 0.5) erro(`a frase [${n2(k)}] diz "${m[0]}", e a conta das barras dá ${razao.toFixed(2).replace('.', ',')} vezes (${pri.texto} ÷ ${ult.texto}).`);
      else linhas.push(`CONTA OK: [${n2(k)}] diz "${m[0]}"; ${pri.texto} ÷ ${ult.texto} = ${razao.toFixed(2).replace('.', ',')}.`);
    }
    // o desenho da conta combina com a unidade
    const unl = un.toLowerCase();
    if (S.GRAFICO === 'multidao') {
      if (!/100\s*mil/.test(unl)) erro(`a conta usa a multidão de 100 mil (GRAFICO 'multidao'), e a unidade [${DW.unidade}] não é por 100 mil ("${un}"). Troque o GRAFICO no score.js ('grade' para "em cada 100", null para nenhum).`);
      if (Number.isFinite(nv) && (Math.round(nv) < 1 || Math.round(nv) > 400)) aviso(`a multidão acende ${Math.round(nv)} pontos: abaixo de 1 ou acima de 400 não se conta de olho. Use GRAFICO null.`);
    }
    if (S.GRAFICO === 'grade') {
      if (!/(100\b|%|por cento)/.test(unl) || /100\s*mil/.test(unl)) erro(`a conta usa a grade de 100 (GRAFICO 'grade'), e a unidade [${DW.unidade}] não é "em cada 100" nem porcentagem ("${un}").`);
      if (Number.isFinite(nv) && nv > 100) erro(`a grade tem 100 pessoas, e o número é ${nt}.`);
    }
    // quantas frases cada parte desenha
    for (const [nome, lista, max] of [['GANCHO', S.GANCHO, 2], ['CONTA', S.CONTA, 2], ['COMPARA', S.COMPARA, 2], ['PORQUE', S.PORQUE, 2], ['PREVENCAO', S.PREVENCAO, 2], ['FECHO', S.FECHO, 1]]) {
      const com = (lista || []).filter((n) => T[n]);
      if (com.length > max) erro(`${nome} tem ${com.length} frases no score.js; o molde desenha até ${max}. Junte ou corte.`);
    }
    if (!(S.PREVENCAO || []).some((n) => T[n])) aviso('falta a prevenção (o que fazer): o tipo ensina pelo lado da medicina preventiva.');
    // o resumo
    if (Number.isFinite(nv)) linhas.push(`NÚMERO: ${nt} ${un}${lu ? ' · ' + lu : ''}`);
    if (boas.length) linhas.push(`BARRAS: ${boas.map((x) => `${x.nome} ${x.texto}`).join(' · ')} (${un})`);
    if (razao) linhas.push(`RÉGUA: a última barra cabe ${razao.toFixed(2).replace('.', ',')} vezes na primeira.`);
    linhas.push(`TAMANHO: ${dur.toFixed(1)} s, até ${S.LIMITE} s.`);
    return { ok, linhas };
  },
};
