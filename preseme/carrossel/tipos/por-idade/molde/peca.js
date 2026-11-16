// PRESEME · carrossel POR IDADE · a conferência do tipo (o motor roda no comando textos; ok false trava).
// Confere o que faz a peça ensinar errado: faixas fora de ordem ou que se sobrepõem (a mesma idade em duas faixas), o
// rótulo da faixa dizendo outra idade que o de e o ate do score.js, faixa sem o que fazer (sem oferta), de 3 a 7 faixas,
// uma lâmina por faixa e na ordem, a régua inteira (a penúltima) com todas as faixas e ofertas das lâminas, e o "o que
// fazer" na última. Avisa o que deixa a peça rasa: faixa sem porquê, porquê longo demais, buraco entre duas faixas,
// régua ou "o que fazer" sem fonte, cartão sem quem faz.
// É do tipo: vale para toda peça por idade (não precisa mexer).
const n2 = (n) => String(n).padStart(2, '0');
const rot = (k) => (typeof k === 'number' ? `[${n2(k)}]` : `[${k}]`);
const semAcento = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const nFrases = (s) => (String(s || '').trim().match(/[.!?](\s|$)/g) || []).length;
const QUEM = ['agente', 'calouro', 'moradora', 'idosa', 'idoso', 'medica', 'medico', 'enfermeira', 'crianca'];
const ICONES_KIT = ['exame', 'vacina', 'consulta', 'conversa', 'calendario', 'nenhum'];
module.exports = {
  conferir(T, S) {
    const L = S.LAMINAS || [], FX = S.FAIXAS || [], linhas = [];
    let ok = true;
    const erro = (m) => { ok = false; linhas.push(m); };
    const aviso = (m) => linhas.push('aviso: ' + m);
    if (!L.length || L[0].tipo !== 'capa') erro('a lâmina 1 tem de ser a capa (tipo capa)');
    const C = S.CAPA || {};
    if (!T[(C.linhas || [1])[0]]) erro('a capa está sem a pergunta (CAPA.linhas[0])');
    const daPeca = new Set(); // os ícones que não são do kit (a peça desenha em film-3-desenhos.js)
    // as faixas: de 3 a 7, da menor idade para a maior, sem se sobrepor
    if (FX.length < 3 || FX.length > 7) erro(`são ${FX.length} faixa(s): o tipo pede de 3 a 7 (com 2, não é régua; com mais de 7, a régua não cabe nem se guarda)`);
    FX.forEach((f, i) => {
      const q = `faixa ${i + 1}`, rotulo = String(T[f.rotulo] || '').trim();
      if (typeof f.de !== 'number') { erro(`${q}: sem a idade em que começa (de)`); return; }
      if (f.ate != null && (typeof f.ate !== 'number' || f.ate < f.de)) erro(`${q}: termina (ate ${f.ate}) antes de começar (de ${f.de})`);
      if (f.ate == null && i < FX.length - 1) erro(`${q}: "${rotulo || '?'}" não tem fim (ate: null) e não é a última: só a última faixa pode ser "ou mais"`);
      const ant = FX[i - 1];
      if (ant && typeof ant.de === 'number') {
        if (f.de < ant.de) erro(`${q}: começa aos ${f.de} anos, antes da faixa ${i} (${ant.de}): as faixas vão da menor idade para a maior`);
        else if (ant.ate != null && f.de <= ant.ate) erro(`${q}: começa aos ${f.de} anos e a faixa ${i} vai até os ${ant.ate}: as faixas se sobrepõem (a mesma idade em duas faixas)`);
        else if (ant.ate != null && f.de > ant.ate + 1) aviso(`${q}: entre os ${ant.ate} e os ${f.de} anos não há faixa: diga na peça o que vale nesse buraco, ou feche a régua`);
      }
      // o rótulo diz a mesma idade que o de e o ate
      if (!rotulo) erro(`${q}: sem o rótulo ${rot(f.rotulo)} (o nome da faixa na tela, ex.: "25 a 39 anos")`);
      else {
        const ns = (rotulo.match(/\d+/g) || []).map(Number), r = semAcento(rotulo);
        if (!ns.length || ns[0] !== f.de) erro(`${q}: o rótulo ${rot(f.rotulo)} "${rotulo}" não começa pela idade ${f.de} (de): a régua mostra ${f.de} e a lâmina diria outra coisa`);
        else if (f.ate != null && !ns.includes(f.ate)) erro(`${q}: o rótulo ${rot(f.rotulo)} "${rotulo}" não diz ${f.ate} (ate)`);
        else if (f.ate == null && !/(ou mais|\+|acima|a partir)/.test(r)) erro(`${q}: o rótulo ${rot(f.rotulo)} "${rotulo}" não diz que a faixa é "ou mais" (ate: null)`);
      }
      // o que fazer naquela idade
      const of = (f.oferta || []).filter((o) => String(T[o.nome] || '').trim());
      if (!of.length) erro(`${q}: "${rotulo || '?'}" está sem o que a UBS faz ou oferece (oferta): faixa sem o que fazer`);
      if ((f.oferta || []).length > 3) erro(`${q}: tem ${(f.oferta || []).length} ofertas; cabem até 3 cartões por lâmina`);
      (f.oferta || []).forEach((o, j) => {
        if (!String(T[o.nome] || '').trim()) erro(`${q}, oferta ${j + 1}: sem o nome ${rot(o.nome)}`);
        if (!String(T[o.quando] || '').trim()) aviso(`${q}, oferta ${j + 1}: sem o quando ${rot(o.quando)} (de quanto em quanto tempo, ou em que caso)`);
        if (o.icone && !ICONES_KIT.includes(o.icone)) daPeca.add(o.icone);
      });
      // o porquê
      const ps = [].concat(f.porque).filter((k) => k != null), txt = ps.map((k) => String(T[k] || '').trim()).filter(Boolean).join(' ');
      if (!txt) aviso(`${q}: sem o porquê (a frase ${ps.map(rot).join(' ') || '?'}): faixa sem porquê é régua rasa`);
      else {
        if (nFrases(txt) > 2) aviso(`${q}: o porquê tem ${nFrases(txt)} frases; o tipo pede uma ou duas, curtas`);
        if (txt.length > 210) aviso(`${q}: o porquê tem ${txt.length} caracteres; acima de uns 210 a letra fica pequena na lâmina`);
      }
      const quem = (f.pessoa || {}).quem || 'moradora';
      if (!QUEM.includes(quem)) aviso(`${q}: a pessoa "${quem}" não é da biblioteca (${QUEM.join(', ')})`);
    });
    if (daPeca.size) linhas.push(`ícones da peça (não do kit): ${[...daPeca].join(', ')}; cada um tem de estar em film-3-desenhos.js (PRESEME.ICONE), senão o cartão sai sem ícone`);
    // uma lâmina por faixa, na ordem
    const fs = L.filter((l) => l.tipo === 'faixa');
    if (fs.length !== FX.length) erro(`são ${FX.length} faixa(s) e ${fs.length} lâmina(s) de faixa: cada faixa precisa da lâmina dela`);
    else if (fs.some((l, i) => l.faixa !== i)) erro('as lâminas de faixa saíram fora da ordem da régua');
    // a régua inteira: a penúltima, com todas as faixas e todas as ofertas das lâminas
    const rs = L.filter((l) => l.tipo === 'regua'), r = rs[rs.length - 1], RG = S.REGUA || {};
    if (!r) erro('falta a régua inteira (tipo regua), a penúltima, com todas as faixas para print');
    else {
      if (r !== L[L.length - 2]) erro('a régua inteira tem de ser a penúltima lâmina (antes do "o que fazer")');
      const tem = new Set((r.todas || []).filter((k) => typeof k !== 'number'));
      FX.forEach((f, i) => {
        if (T[f.rotulo] && !tem.has(f.rotulo)) erro(`a régua inteira não traz a faixa ${i + 1} (${rot(f.rotulo)}): a régua não bate com as lâminas`);
        (f.oferta || []).forEach((o, j) => { if (T[o.nome] && !tem.has(o.nome)) erro(`a régua inteira não traz a oferta ${j + 1} da faixa ${i + 1} (${rot(o.nome)}): a régua não bate com as lâminas`); });
      });
      if (!T[RG.titulo]) aviso('a régua inteira está sem título (REGUA.titulo)');
      if (!T[RG.fonte]) aviso('a régua inteira está sem a fonte (REGUA.fonte)');
    }
    // o que fazer: a última
    const F = S.FAZER || {}, fz = L.filter((l) => l.tipo === 'fazer'), f = fz[fz.length - 1];
    if (!f) erro('falta a última lâmina, o que fazer na visita (tipo fazer)');
    else {
      if (f !== L[L.length - 1]) erro('o "o que fazer" tem de ser a última lâmina');
      const cs = (F.cartoes || []).filter((c) => T[c.texto]);
      if (!cs.length) erro('o "o que fazer" está sem cartão: diga o que o aluno faz na visita e o que é da equipe');
      (F.cartoes || []).forEach((c, i) => {
        if (T[c.texto] && !T[c.quem]) aviso(`o cartão ${i + 1} do "o que fazer" está sem quem faz (${rot(c.quem)})`);
        if (c.icone === '192' && !/192/.test(String(T[c.quem] || '') + String(T[c.texto] || ''))) aviso(`o cartão do 192 não diz "192" (${rot(c.quem)} ou ${rot(c.texto)})`);
      });
      if (!T[F.fonte]) aviso('o "o que fazer" está sem a fonte (FAZER.fonte)');
    }
    if (L.length < 6 || L.length > 10) aviso(`${L.length} lâminas: o tipo foi feito para 6 a 10`);
    const nOf = FX.reduce((s, x) => s + (x.oferta || []).length, 0);
    if (S.ESTILO === 'pixel' && nOf > 7) aviso(`estilo pixel com ${nOf} ofertas: a letra do pixel é larga e a régua inteira só cabe com até 7 ofertas no total (use outro estilo ou junte ofertas)`);
    if (ok) linhas.push(`tipo por idade: ${FX.length} faixas (${FX.map((x) => String(T[x.rotulo] || '?').trim()).join(' · ')}), ${FX.reduce((s, x) => s + (x.oferta || []).length, 0)} ofertas, a régua inteira e o que fazer no fim (${L.length} lâminas)`);
    return { ok, linhas };
  },
};
