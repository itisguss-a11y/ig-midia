// PRESEME · motor "por dentro" · a conferência do tipo (do molde: igual em toda peça; o motor chama no comando textos)
// Trava (ok false) quando: são menos de 2 ou mais de 5 níveis; um nível fica sem frase (a câmera passaria por ele sem
// dizer o que acontece ali); a primeira cena não é a pergunta ou a última não é o fecho; a penúltima cena não é de fora (o
// zoom não volta para fora com a prevenção antes do fecho); ou a peça passa de 2 minutos. Avisa (sem travar) quando: um
// nível de dentro não tem porta no film-2-peca.js (a lente pousa no meio da janela); uma cena tem mais de 3 frases; falta a
// palavra da trilha de um nível; a pergunta não termina em "?".
const fs = require('fs');
const path = require('path');

const n2 = (n) => String(n).padStart(2, '0');
const tempo = (s) => `${Math.floor(s / 60)}min${String(Math.round(s % 60)).padStart(2, '0')}`;

module.exports = {
  conferir(T, S) {
    const linhas = [];
    let ok = true;
    const erro = (m) => { ok = false; linhas.push(`ERRO: ${m}`); };
    const NV = S.NIVEIS || [], cenas = S.cenas || [];
    if (NV.length < 2 || NV.length > 5) erro(`são ${NV.length} níveis em NIVEIS no score.js; o tipo pede de 2 a 5 (o de fora e de 1 a 4 de dentro).`);
    // cada nível com pelo menos uma frase
    for (let i = 0; i < NV.length; i++) {
      const com = cenas.filter((c) => c.nivel === i && c.itens.length);
      if (!com.length) erro(`o nível "${NV[i].id}" não tem frase: a câmera passaria por ele sem dizer o que acontece ali. Ponha uma cena nele no ROTEIRO (ou tire o nível do NIVEIS).`);
      if (!T[NV[i].rotulo]) linhas.push(`aviso: o nível "${NV[i].id}" está sem a palavra da trilha ([${NV[i].rotulo}] no textos.txt): o alto da tela fica sem o nome dele.`);
    }
    // a ordem: pergunta primeiro, fecho por último, e a volta para fora antes do fecho
    if (cenas.length) {
      if (cenas[0].tipo !== 'pergunta') erro(`a primeira cena é "${cenas[0].id}" (${cenas[0].tipo}); o tipo abre com a pergunta, de fora.`);
      if (cenas[cenas.length - 1].tipo !== 'fecho') erro(`a última cena é "${cenas[cenas.length - 1].id}"; o tipo fecha com o fecho, de fora.`);
      const pen = cenas[cenas.length - 2];
      if (pen && pen.nivel !== 0) erro(`a penúltima cena ("${pen.id}") fica no nível "${(NV[pen.nivel] || {}).id}": o zoom tem de voltar para fora antes do fecho, com o que se faz para prevenir. Ponha uma cena com nivel: '${(NV[0] || {}).id}' antes do fecho.`);
      if (pen && pen.nivel === 0 && pen.tipo === 'pergunta') erro('a peça não entra em nenhum nível: o tipo é a câmera entrando no corpo.');
    }
    for (const c of cenas) if (c.itens.length > 3) linhas.push(`aviso: a cena "${c.id}" tem ${c.itens.length} frases; o tipo pede de 1 a 3 por cena (o resto vira outro nível ou outra cena).`);
    if (S.DURATION > (S.LIMITE || 120) + 0.01) erro(`a peça tem ${tempo(S.DURATION)}; o tipo vai até 2 minutos. Corte uma frase ou um nível.`);
    const pg = String(T[1] || '').trim();
    if (pg && !/\?$/.test(pg)) linhas.push('aviso: a pergunta [01] não termina em "?".');
    // a porta de cada nível de dentro, no film-2-peca.js (procura "id: { x" no arquivo)
    try {
      const f2 = fs.readFileSync(path.join(__dirname, 'film-2-peca.js'), 'utf8');
      const bloco = (/PORTA\s*:\s*\{([\s\S]*?)\}\s*,\s*\n\s*\/\//.exec(f2) || /PORTA\s*:\s*\{([^\n]*)\n/.exec(f2) || [])[1] || '';
      for (const nv of NV.slice(0, -1)) if (!new RegExp(`['"]?${nv.id}['"]?\\s*:\\s*(\\{\\s*x|\\(|function|st\\s*=>)`).test(bloco)) linhas.push(`aviso: o nível "${nv.id}" está sem porta (PECA.PORTA no film-2-peca.js): a lente pousa no meio da janela.`);
    } catch (e) { linhas.push(`aviso: não li o film-2-peca.js (${e.message}).`); }
    // o caminho da câmera, para conferir de olho
    const cam = cenas.map((c) => (NV[c.nivel] || {}).id).filter((x, i, a) => i === 0 || x !== a[i - 1]);
    const entra = (S.CAM || []).filter((v) => v.para > v.de).length, sai = (S.CAM || []).filter((v) => v.para < v.de).length;
    linhas.push(`CAMINHO: ${cam.join(' → ')} (a câmera entra ${entra} ${entra === 1 ? 'vez' : 'vezes'} e sai ${sai}); ${tempo(S.DURATION)} de 2min00.`);
    return { ok, linhas };
  },
};
