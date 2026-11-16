// PRESEME · a conferência que é só desta peça (opcional; apague o arquivo se não precisar).
// O motor chama conferir(T, S) no comando textos: T = os textos do textos.txt ({ '1': 'frase', 'D01': 'palavra' }),
// S = o score.js já com eles. Devolva { ok, linhas }: ok false trava o textos (ex.: uma conta da tela que não bate).
// Exemplo de uso: o sus-hoje confere se a recontagem do fim ([27] a [31]) bate com as cenas.
module.exports = {
  conferir(T, S) {
    return { ok: true, linhas: [] };
  },
};
