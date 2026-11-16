// PRESEME · carrossel FLUXOGRAMA · a conferência do tipo (o motor roda no comando textos; ok false trava).
// Confere o que quebra o fluxo: pergunta sem os dois caminhos, caminho que não termina numa conduta, caixa que ninguém
// alcança, volta (o fluxo anda num sentido só), pergunta que continua pelos dois lados (o fluxo inteiro tem de caber numa
// lâmina: uma espinha que desce, com as condutas do lado), espinha comprida demais, e as lâminas fora da ordem do fluxo.
// É do tipo: vale para todo fluxograma (não precisa mexer).
const n2 = (n) => String(n).padStart(2, '0');
const MAX_ESPINHA = 7, MIN_PERG = 2, MAX_PERG = 4;
module.exports = {
  conferir(T, S) {
    const A = S.ARVORE, L = S.LAMINAS || [], linhas = [];
    let ok = true;
    const erro = (m) => { ok = false; linhas.push(m); };
    const aviso = (m) => linhas.push(`aviso: ${m}`);
    if (!A || !A.nos || !A.inicio) { erro('falta a árvore no score.js (ARVORE, com inicio e nos)'); return { ok, linhas }; }
    const nos = A.nos, ids = Object.keys(nos);
    const filhos = (n) => (n.tipo === 'acao' ? [n.prox] : n.tipo === 'pergunta' ? [n.sim, n.nao] : []).filter(Boolean);
    if (!nos[A.inicio]) { erro(`o início "${A.inicio}" não é um nó da árvore`); return { ok, linhas }; }
    // cada nó
    const pais = {};
    for (const id of ids) {
      const n = nos[id];
      if (!['acao', 'pergunta', 'fim'].includes(n.tipo)) { erro(`nó ${id}: o tipo "${n.tipo}" não existe (acao, pergunta ou fim)`); continue; }
      if (!T[n.texto]) erro(`nó ${id}: falta o texto (${n.texto || 'sem a palavra D'}) no textos.txt`);
      if (n.curto && !T[n.curto]) aviso(`nó ${id}: o curto ${n.curto} está vazio; o fluxo inteiro usa o texto`);
      if (n.tipo === 'acao' && !n.prox) erro(`nó ${id}: a caixa do que fazer não leva a lugar nenhum; todo caminho termina numa conduta (tipo fim)`);
      if (n.tipo === 'pergunta' && (!n.sim || !n.nao)) erro(`nó ${id}: a pergunta tem de ter os dois caminhos, sim e não`);
      for (const f of filhos(n)) {
        if (!nos[f]) erro(`nó ${id}: leva a "${f}", que não é um nó da árvore`);
        else (pais[f] = pais[f] || []).push(id);
      }
      if (n.tipo === 'pergunta' && nos[n.sim] && nos[n.nao] && nos[n.sim].tipo !== 'fim' && nos[n.nao].tipo !== 'fim') erro(`nó ${id}: os dois caminhos da pergunta continuam. No fluxograma, um lado termina numa conduta (é assim que o fluxo inteiro cabe numa lâmina): junte perguntas ou divida em duas peças`);
    }
    for (const [f, ps] of Object.entries(pais)) if (ps.length > 1) erro(`nó ${f}: chegam nele ${ps.join(' e ')}. Cada caixa tem um caminho só que chega nela; para duas condutas iguais, faça dois nós com o mesmo texto D`);
    if (pais[A.inicio]) erro(`há caminho que volta para o início (${A.inicio}): o fluxo anda num sentido só`);
    // quem o início alcança (e a volta, se houver)
    const vistos = new Set(), pilha = [[A.inicio, []]];
    while (pilha.length) {
      const [id, cam] = pilha.pop();
      if (cam.includes(id)) { erro(`o fluxo volta: ${cam.concat(id).join(' → ')}`); continue; }
      if (!nos[id] || vistos.has(id)) continue;
      vistos.add(id);
      for (const f of filhos(nos[id])) pilha.push([f, cam.concat(id)]);
    }
    const soltos = ids.filter((id) => !vistos.has(id));
    if (soltos.length) aviso(`nós que nenhum caminho alcança (ficam fora do desenho): ${soltos.join(', ')}`);
    // a espinha, como o desenho anda (film-2-moldes.js)
    const esp = [], ja = new Set();
    let id = A.inicio;
    while (id && nos[id] && !ja.has(id)) {
      ja.add(id); esp.push(id);
      const n = nos[id];
      if (n.tipo === 'acao') { id = n.prox; continue; }
      if (n.tipo !== 'pergunta' || !nos[n.sim] || !nos[n.nao]) break;
      const fs = nos[n.sim].tipo === 'fim', fn = nos[n.nao].tipo === 'fim';
      id = fs && !fn ? n.nao : fn && !fs ? n.sim : n.desce === 'sim' ? n.sim : n.desce === 'nao' ? n.nao : nos[n.sim].alerta && !nos[n.nao].alerta ? n.nao : nos[n.nao].alerta && !nos[n.sim].alerta ? n.sim : n.nao;
    }
    const perg = esp.filter((x) => nos[x].tipo === 'pergunta'), fins = ids.filter((x) => nos[x] && nos[x].tipo === 'fim' && vistos.has(x));
    if (esp.length > MAX_ESPINHA) erro(`a espinha do fluxo tem ${esp.length} caixas: o fluxo inteiro cabe numa lâmina com até ${MAX_ESPINHA}`);
    if (perg.length < MIN_PERG || perg.length > MAX_PERG) erro(`${perg.length} pergunta(s): o fluxograma tem de ${MIN_PERG} a ${MAX_PERG} (uma só não é fluxo; mais de ${MAX_PERG} não cabe na lâmina do fluxo inteiro)`);
    const R = Object.assign({ sim: 'D03', nao: 'D04', pergunta: 'D02', passo: 'D05', proxima: 'D06' }, A.rotulos || {});
    for (const [nome, k] of Object.entries(R)) if (!T[k]) aviso(`o rótulo "${nome}" (${k}) está vazio no textos.txt`);
    // as lâminas
    if (!L.length || L[0].tipo !== 'capa') erro('a lâmina 1 tem de ser a capa (tipo capa), com a pergunta');
    for (const l of L) {
      if (l.tipo === 'decisao' && (!nos[l.no] || nos[l.no].tipo !== 'pergunta')) erro(`lâmina ${n2(l.n)}: decisao com no "${l.no}", que não é uma pergunta da árvore`);
      if (l.tipo === 'passo' && (!nos[l.no] || nos[l.no].tipo !== 'acao')) erro(`lâmina ${n2(l.n)}: passo com no "${l.no}", que não é uma caixa do que fazer (acao) da árvore`);
    }
    for (const p of perg) if (!L.some((l) => l.tipo === 'decisao' && l.no === p)) erro(`a pergunta ${p} não tem lâmina (tipo decisao): uma decisão por lâmina`);
    const ord = L.filter((l) => l.no && esp.includes(l.no)).map((l) => esp.indexOf(l.no));
    if (ord.some((v, i) => i && v <= ord[i - 1])) erro('as lâminas de passo e de decisão vão na ordem do fluxo, uma vez cada');
    const fx = L.filter((l) => l.tipo === 'fluxo');
    if (!fx.length) erro('falta a lâmina do fluxo inteiro (tipo fluxo): é o cartão para print');
    else if (L.indexOf(fx[0]) !== L.length - 2) aviso('o fluxo inteiro costuma ser a penúltima lâmina (a última é a de quem faz o quê)');
    const pp = L.filter((l) => l.tipo === 'papeis');
    if (!pp.length) aviso('sem a lâmina de quem faz o quê (tipo papeis): o aluno, a equipe e o 192');
    else if (L[L.length - 1] !== pp[0]) aviso('a lâmina de quem faz o quê costuma ser a última');
    if (L.length < 7 || L.length > 11) aviso(`${L.length} lâminas: o fluxograma fica entre 7 e 11`);
    if (ok) linhas.push(`tipo fluxograma: ${perg.length} perguntas, ${fins.length} condutas, espinha de ${esp.length} caixas e ${L.length} lâminas`);
    return { ok, linhas };
  },
};
