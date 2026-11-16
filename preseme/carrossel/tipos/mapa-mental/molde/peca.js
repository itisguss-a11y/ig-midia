// PRESEME · carrossel MAPA MENTAL · a conferência do tipo (o motor roda no comando textos; ok false trava). É do tipo:
// vale para toda peça deste tipo (não precisa mexer).
// Trava o que quebra o tipo:
//   - o centro sem nome; menos de 4 ou mais de 6 ramos (com menos, o tema não está inteiro: vira lista ou guia; com
//     mais, o mapa inteiro não cabe numa lâmina);
//   - id de ramo repetido, vazio, com espaço ou igual ao de uma lâmina fixa (capa, mapa, equipe, texto);
//   - ramo sem nome; ramo sem folha; ramo com mais de 3 folhas; folha com mais de 7 palavras (não cabe no mapa inteiro);
//   - o mapa inteiro que não bate com as lâminas: a capa não é a primeira; as lâminas de ramo não são, uma por uma e na
//     mesma ordem, os RAMOS (um ramo some quando todo o texto dele é apagado); o mapa inteiro falta, aparece duas vezes ou
//     vem antes de uma lâmina de ramo.
// Avisa: ramo com 1 folha só; folha que está na lista e não no textos.txt; folha com mais de 44 letras (sai em letra
// menor no mapa inteiro); nome do centro ou do ramo com mais de 22 letras; ramo sem a frase; o mapa inteiro sem as fontes;
// falta a lâmina da equipe.
const n2 = (n) => String(n).padStart(2, '0');
const FIXAS = new Set(['capa', 'mapa', 'equipe', 'texto']);
const rot = (k) => (typeof k === 'number' ? `[${n2(k)}]` : `[${k}]`);
module.exports = {
  conferir(T, S) {
    const linhas = [];
    let ok = true;
    const erro = (s) => { ok = false; linhas.push(s); };
    const aviso = (s) => linhas.push('aviso: ' + s);
    const MP = S.MAPA;
    if (!MP || !MP.CENTRO || !Array.isArray(MP.RAMOS)) { erro('o score.js não exporta MAPA com CENTRO e RAMOS (o tipo sai todo de lá)'); return { ok, linhas }; }
    const Rs = MP.RAMOS, L = S.LAMINAS || [];
    const txt = (k) => String(T[k] ?? '').trim();
    const palavras = (k) => txt(k).split(/\s+/).filter(Boolean).length;
    // o centro
    if (!txt(MP.CENTRO.nome)) erro(`o centro do mapa está sem nome: a palavra ${rot(MP.CENTRO.nome)} não está no textos.txt`);
    else if (txt(MP.CENTRO.nome).length > 22) aviso(`o nome do centro ("${txt(MP.CENTRO.nome)}") passa de 22 letras e sai pequeno dentro do círculo`);
    // os ramos e as folhas
    if (Rs.length < 4 || Rs.length > 6) erro(`o mapa tem de 4 a 6 ramos, e há ${Rs.length}${Rs.length > 6 ? ' (o mapa inteiro não cabe numa lâmina)' : ' (com menos, o tema não está inteiro: aí o tipo é lista ou guia de bolso)'}`);
    const vistos = new Set();
    let nFolhas = 0;
    Rs.forEach((r, j) => {
      const q = `o ramo ${j + 1} ("${r.id}")`;
      if (!r.id || /\s/.test(r.id)) erro(`${q}: o id tem de ser uma palavra só, sem espaço`);
      if (FIXAS.has(r.id)) erro(`${q}: o id "${r.id}" é o de uma lâmina fixa; troque (capa, mapa, equipe e texto são do tipo)`);
      if (vistos.has(r.id)) erro(`${q}: o id "${r.id}" se repete`);
      vistos.add(r.id);
      if (!txt(r.nome)) erro(`${q} está sem nome: a palavra ${rot(r.nome)} não está no textos.txt`);
      else if (txt(r.nome).length > 22) aviso(`${q}: o nome "${txt(r.nome)}" passa de 22 letras e encolhe no mapa inteiro`);
      if (!r.frase || !txt(r.frase)) aviso(`${q} está sem a frase da lâmina (a lâmina sai só com as folhas)`);
      const fs = r.folhas || [], vivas = fs.filter((k) => txt(k));
      nFolhas += vivas.length;
      if (!vivas.length) erro(`${q} está sem folha: cada ramo leva de 2 a 3 folhas curtas (as palavras D da lista folhas, no textos.txt)`);
      else if (vivas.length > 3) erro(`${q} tem ${vivas.length} folhas; até 3 cabem no mapa inteiro (o que passar vira legenda ou outro ramo)`);
      else if (vivas.length === 1) aviso(`${q} tem só 1 folha; com 2 ou 3 o ramo ensina mais`);
      fs.forEach((k) => {
        if (!txt(k)) aviso(`${q}: a folha ${rot(k)} está na lista e não no textos.txt (sai do mapa)`);
        else if (palavras(k) > 7) erro(`${q}: a folha ${rot(k)} tem ${palavras(k)} palavras; até 7 cabem no mapa inteiro ("${txt(k)}")`);
        else if (txt(k).length > 44) aviso(`${q}: a folha ${rot(k)} tem ${txt(k).length} letras e sai em letra menor no mapa inteiro`);
      });
    });
    // o mapa inteiro bate com as lâminas
    if (!L.length || L[0].tipo !== 'capa') erro('a lâmina 01 tem de ser a capa (tipo capa), com a pergunta [01]');
    const deRamo = L.filter((l) => l.tipo === 'ramo').map((l) => l.ramo);
    const esperado = Rs.map((r) => r.id);
    if (deRamo.join('|') !== esperado.join('|')) {
      const faltam = esperado.filter((id) => !deRamo.includes(id)), sobram = deRamo.filter((id) => !esperado.includes(id));
      erro(`o mapa inteiro não bate com as lâminas: os RAMOS são ${esperado.join(', ')} e as lâminas de ramo são ${deRamo.join(', ') || 'nenhuma'}${faltam.length ? ` (sem lâmina: ${faltam.join(', ')}; uma lâmina some quando todo o texto dela é apagado)` : ''}${sobram.length ? ` (lâmina de ramo que não está nos RAMOS: ${sobram.join(', ')})` : ''}`);
    }
    const im = L.map((l, i) => (l.tipo === 'mapa' ? i : -1)).filter((i) => i >= 0);
    if (im.length !== 1) erro(`o tipo pede uma lâmina com o mapa inteiro (tipo mapa), e há ${im.length}`);
    else {
      const ult = L.reduce((m, l, i) => (l.tipo === 'ramo' ? i : m), -1);
      if (im[0] < ult) erro(`o mapa inteiro (lâmina ${n2(L[im[0]].n)}) vem antes da última lâmina de ramo (${n2(L[ult].n)}): ele fecha o resumo`);
      if (!txt((MP.INTEIRO || {}).fonte)) aviso('o mapa inteiro está sem as fontes: é a lâmina que se salva sozinha, e a fonte vai junto');
    }
    if (!L.some((l) => l.tipo === 'equipe')) aviso('falta a lâmina da equipe (o que é da atenção primária: quem notifica, quem acompanha)');
    if (ok) linhas.push(`tipo mapa mental: "${txt(MP.CENTRO.nome)}" no centro, ${Rs.length} ramos (${Rs.map((r) => txt(r.nome) || r.id).join(', ')}) e ${nFolhas} folhas; ${L.length} lâminas (capa, ${deRamo.length} de ramo, o mapa inteiro${L.some((l) => l.tipo === 'equipe') ? ' e a equipe' : ''})`);
    return { ok, linhas };
  },
};
