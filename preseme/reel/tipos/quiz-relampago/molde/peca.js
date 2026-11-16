// PRESEME · motor "Quiz relâmpago" · a conferência do tipo (do molde: igual em toda peça; o motor chama no comando textos)
// Trava (ok false) quando: há menos de 3 ou mais de 7 perguntas; uma pergunta fica sem resposta (r) ou sem o porquê; a
// resposta não é V ou F (no modo A ou B, A ou B, com as duas opções escritas); o porquê não começa com a palavra do selo
// (Verdadeiro ou Falso, D02 e D03; no modo A ou B, "É a A" ou "É a B") ou começa com a palavra da outra resposta; a régua
// não tem as três faixas (D04 a D06); a peça passa de 90 s. Avisa (sem travar) quando: pergunta ou porquê longos demais
// para o ritmo (mais de 12 ou de 16 palavras); todas as respostas iguais; a faixa de cima da régua não começa pelo total
// de perguntas; falta a fonte na tela (D07); uma cena não está em nenhum bloco do mapa-do-som.json; a peça passa de 75 s.
const fs = require('fs');
const path = require('path');

const n2 = (n) => String(n).padStart(2, '0');
const pal = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const sem = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

module.exports = {
  conferir(T, S) {
    const linhas = [];
    let ok = true;
    const erro = (m) => { ok = false; linhas.push(`ERRO: ${m}`); };
    const aviso = (m) => linhas.push(`aviso: ${m}`);
    const AB = S.MODO === 'ab';
    if (!['vf', 'ab'].includes(S.MODO)) erro(`MODO "${S.MODO}" no score.js: use 'vf' (Verdadeiro ou Falso) ou 'ab' (A ou B).`);
    const qs = S.PERGUNTAS || [];
    if (qs.length < 3 || qs.length > 7) erro(`são ${qs.length} perguntas com texto; o tipo pede de 3 a 7 (o placar e o ritmo são de jogo curto).`);
    const pV = sem(T.D02 || 'Verdadeiro'), pF = sem(T.D03 || 'Falso');
    const resps = [];
    for (const q of qs) {
      const nome = `a pergunta ${q.k} ([${n2(q.p)}])`;
      const r = String(q.r || '').toUpperCase();
      if (!r) { erro(`${nome} está sem resposta (r) no score.js.`); continue; }
      if (AB ? !['A', 'B'].includes(r) : !['V', 'F'].includes(r)) { erro(`${nome} tem a resposta "${q.r}"; no modo ${AB ? "'ab' a resposta é A ou B" : "'vf' a resposta é V ou F"}.`); continue; }
      resps.push(r);
      if (AB) {
        const ops = (q.ops || []).filter((n) => T[n]);
        if (ops.length !== 2) erro(`${nome} tem ${ops.length} opções com texto; no modo A ou B são duas (ops no score.js).`);
        for (const o of ops) if (pal(T[o]) > 4) aviso(`a opção [${n2(o)}] tem mais de quatro palavras: no cartão ela aperta.`);
      }
      const pq = T[q.porque];
      if (!pq || !String(pq).trim()) { erro(`${nome} está sem o porquê (a frase [${n2(q.porque)}] está vazia ou não existe): o tipo explica toda resposta.`); continue; }
      const ini = sem(pq);
      if (AB) {
        const m = /^(?:e a|a resposta e a)\s+([ab])\b/.exec(ini);
        if (!m) erro(`o porquê [${n2(q.porque)}] (pergunta ${q.k}) tem de começar com "É a A" ou "É a B"; começa com "${String(pq).split(/\s+/).slice(0, 3).join(' ')}".`);
        else if (m[1].toUpperCase() !== r) erro(`a pergunta ${q.k} tem a resposta ${r} no score.js, e o porquê [${n2(q.porque)}] diz "É a ${m[1].toUpperCase()}". Os dois têm de bater.`);
      } else {
        const certa = r === 'V' ? pV : pF, outra = r === 'V' ? pF : pV;
        if (ini.startsWith(outra)) erro(`a pergunta ${q.k} tem a resposta ${r} no score.js, e o porquê [${n2(q.porque)}] começa com "${String(pq).split(/\s+/)[0]}". O selo e o porquê têm de dizer a mesma coisa.`);
        else if (!ini.startsWith(certa)) erro(`o porquê [${n2(q.porque)}] (pergunta ${q.k}) tem de começar com a palavra do selo, "${r === 'V' ? T.D02 || 'Verdadeiro' : T.D03 || 'Falso'}".`);
      }
      if (pal(T[q.p]) > 12) aviso(`a pergunta [${n2(q.p)}] tem ${pal(T[q.p])} palavras: no quiz relâmpago ela se lê em uns 4 s (até umas 10 palavras).`);
      if (pal(pq) > 16) aviso(`o porquê [${n2(q.porque)}] tem ${pal(pq)} palavras: no ritmo de jogo, uma frase de até umas 14.`);
    }
    if (resps.length >= 3 && new Set(resps).size === 1) aviso(`todas as respostas são ${resps[0]}: o placar fica fácil de adivinhar. Misture.`);
    if (resps.length) linhas.push(`RESPOSTAS: ${resps.map((r, i) => `${i + 1} ${r}`).join(', ')} (o placar do canto mostra a certa de cada uma depois do selo).`);
    // a régua e a fonte
    const faltam = ['D04', 'D05', 'D06'].filter((k) => !T[k] || !String(T[k]).trim());
    if (faltam.length) erro(`a régua do placar precisa das três faixas; falta ${faltam.join(', ')} no textos.txt ("5 · pronto para a prova").`);
    else {
      if (!String(T.D04).includes('·')) aviso('a faixa D04 não tem o "·" entre a nota e o que fazer ("5 · pronto para a prova").');
      const topo = parseInt(String(T.D04), 10);
      if (Number.isFinite(topo) && topo !== qs.length) aviso(`a faixa de cima da régua (D04) começa com ${topo}, e são ${qs.length} perguntas.`);
    }
    if (!T[S.REGUA]) erro(`a pergunta da régua [${n2(S.REGUA)}] está vazia.`);
    if (!T.D07 || !String(T.D07).trim()) aviso('falta a fonte na tela (D07): quiz de fato tem a fonte no fim.');
    // a duração
    if (S.DURATION > 90) erro(`a peça tem ${S.DURATION.toFixed(1)} s; o quiz relâmpago vai até 90 s. Tire uma pergunta ou encurte os porquês.`);
    else if (S.DURATION > 75) aviso(`a peça tem ${S.DURATION.toFixed(1)} s; o ritmo do tipo é de 45 a 75 s.`);
    // o mapa do som: toda cena num bloco (cena fora de bloco fica sem música)
    try {
      const mapa = JSON.parse(fs.readFileSync(path.join(__dirname, 'mapa-do-som.json'), 'utf8'));
      if (mapa.modo === 'blocos') {
        const nos = new Set((mapa.blocos || []).flatMap((b) => b.cenas || []));
        const fora = (S.cenas || []).map((c) => c.id).filter((id) => !nos.has(id));
        if (fora.length) aviso(`as cenas ${fora.join(', ')} não estão em nenhum bloco do mapa-do-som.json: ficam sem música. Ponha as perguntas no bloco das perguntas (q1 a q${qs.length}).`);
        if (Number(mapa.bpm) !== Number(S.BPM)) aviso(`o mapa-do-som.json tem andamento ${mapa.bpm} e o score.js, ${S.BPM}: deixe os dois iguais.`);
      }
    } catch (e) { aviso(`não li o mapa-do-som.json (${e.message}).`); }
    return { ok, linhas };
  },
};
