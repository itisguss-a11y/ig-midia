// PRESEME · molde do meme em vídeo · a conferência do molde (o motor chama conferir(T, S) no comando textos).
// O meme tem quatro tempos, nesta ordem: preparacao, virada, licao, fecho. Confere aqui o que o molde precisa para
// desenhar certo: a virada com uma frase só (a piada), a lição com 2 a 6 frases no formato "Termo, explicação." (o termo
// antes da vírgula vira a ficha que fica na tela) e o vídeo entre 15 e 35 s.
const TEMPOS = ['preparacao', 'virada', 'licao', 'fecho'];
module.exports = {
  conferir(T, S) {
    const linhas = [];
    let ok = true;
    const falha = (m) => { ok = false; linhas.push('ERRO: ' + m); };
    const ids = (S.cenas || []).map((c) => c.id);
    if (ids.join(',') !== TEMPOS.join(',')) falha(`os tempos têm de ser ${TEMPOS.join(', ')}, nesta ordem (o ROTEIRO tem ${ids.join(', ')})`);
    const cena = (id) => (S.cenas || []).find((c) => c.id === id);
    const v = cena('virada'), l = cena('licao');
    if (v && v.itens.length !== 1) falha(`a virada tem ${v.itens.length} frases: é uma só, a piada`);
    if (l) {
      if (l.itens.length < 2 || l.itens.length > 6) falha(`a lição tem ${l.itens.length} frases: são de 2 a 6`);
      for (const it of l.itens) {
        const s = String(T[String(it.n)] || '');
        const i = s.indexOf(',');
        if (i < 2 || i > 34) falha(`[${String(it.n).padStart(2, '0')}] "${s}": a frase da lição começa pelo termo, até a vírgula ("Universalidade, acesso para todos.")`);
      }
    }
    if (S.DURATION < 15 || S.DURATION > 35) falha(`o meme dura ${S.DURATION.toFixed(1)} s: fica entre 15 e 35 s`);
    if (ok) linhas.push(`molde do meme: 4 tempos, virada com 1 frase, lição com ${l ? l.itens.length : 0} frases com termo, ${S.DURATION.toFixed(1)} s`);
    return { ok, linhas };
  },
};
