// PRESEME · motor do reel · entregar [rascunho|folha]: confere se os arquivos existem e estão em dia e imprime a mensagem
// para ele (as mensagens A e B da parte 11 da passagem; "piloto" virou "rascunho" e entrou a da folha de textos, decisão 115).
'use strict';
const fs = require('fs');
const path = require('path');
const C = require('./comum');

const EDITAR = '2. Para trocar palavras, edite o textos.txt (só o que vem depois do número) e me mande. Linha apagada sai do vídeo. As palavras de dentro do desenho estão na parte 2 do arquivo.';

function comando(args) {
  const dir = C.pastaPeca(args);
  const peca = C.lerPeca(dir);
  const tipo = C.posicionais(args)[0] || 'final';
  const out = path.join(dir, 'out');
  // o textos.txt que vai para ele sai daqui, e fica uma cópia do que foi mandado (para o compara depois)
  const txt = path.join(dir, 'textos.txt');
  const ver = fs.readdirSync(out).filter((f) => /^textos-enviado-\d+\.txt$/.test(f)).length + 1;
  let arquivos, msg;
  if (tipo === 'folha') {
    arquivos = [path.join(out, 'folha-textos.jpg'), path.join(out, 'textos.txt')];
    msg = `Folha de textos pronta: um quadro por frase, no instante em que ela está inteira na tela.\n\nO que você tem de fazer:\n1. Olhe a folha.\n${EDITAR}\n3. Se estiver tudo certo, responda "pode fazer o vídeo".`;
  } else if (tipo === 'rascunho') {
    arquivos = [C.arquivoFinal(dir, true), path.join(out, 'textos.txt')];
    msg = `Rascunho pronto. É o vídeo inteiro em meia resolução, para você julgar o texto, a ordem e o ritmo.\n\nO que você tem de fazer:\n1. Assista.\n${EDITAR}\n3. Se estiver tudo certo, responda "pode fazer o definitivo".`;
  } else {
    fs.copyFileSync(path.join(dir, 'legenda.txt'), path.join(out, `legenda-${peca.nome}.txt`));
    arquivos = [C.arquivoFinal(dir, false), path.join(out, `capa-${peca.nome}.png`), path.join(out, `legenda-${peca.nome}.txt`), path.join(out, 'textos.txt')];
    msg = `Reel pronto para postar.\n\nO que você tem de fazer:\n1. No Instagram, crie o reel com o ${path.basename(arquivos[0])}.\n2. Na capa, adicione da galeria a capa-${peca.nome}.png.\n3. Cole a legenda do legenda-${peca.nome}.txt e publique.`;
  }
  if (fs.existsSync(txt)) fs.copyFileSync(txt, path.join(out, 'textos.txt'));
  let falta = false;
  console.log('Arquivos (mandar com SendUserFile):');
  for (const f of arquivos) {
    if (!fs.existsSync(f)) { console.log(`  FALTA ${path.relative(dir, f)}`); falta = true; continue; }
    console.log(`  ${f}  (${C.mb(f).toFixed(1)} MB)`);
  }
  const base = arquivos[0];
  if (fs.existsSync(base)) {
    const fontes = ['textos.txt', 'textos.js', 'score.js', 'cenas.json', 'mapa-do-som.json'].map((f) => path.join(dir, f)).filter((f) => fs.existsSync(f) && C.mtime(f) > C.mtime(base));
    if (fontes.length) { console.log(`ERRO: ${path.relative(dir, base)} é mais velho que ${fontes.map((f) => path.basename(f)).join(', ')}: refaça antes de mandar.`); falta = true; }
  }
  if (tipo === 'final' && fs.existsSync(path.join(dir, 'legenda.txt')) && C.mtime(path.join(dir, 'legenda.txt')) < C.mtime(txt)) console.log('AVISO: a legenda.txt é mais velha que o textos.txt: confira se ela ainda bate com o texto final (uma frase citada que mudou é parada).');
  if (falta) { console.log('Não mande ainda: falta arquivo (veja acima).'); process.exitCode = 1; return; }
  fs.copyFileSync(path.join(out, 'textos.txt'), path.join(out, `textos-enviado-${ver}.txt`));
  console.log(`(cópia do textos mandado: out/textos-enviado-${ver}.txt, para o compara quando ele devolver)`);
  console.log('\nMensagem para ele:\n---\n' + msg + '\n---');
}

module.exports = { comando };
