#!/usr/bin/env node
// PRESEME · motor do reel (versão 1, 16/11/2026). O que é igual em todo reel vira um comando; a peça só traz o desenho,
// a linha do tempo, o textos.txt e o mapa do som. Rodar de dentro da pasta da peça, ou de qualquer lugar com --peca <pasta>.
// O que cada comando faz e o que a pasta da peça traz: README.md, na pasta de cima.
'use strict';
const path = require('path');

const AJUDA = `PRESEME · motor do reel
uso: node ${path.relative(process.cwd(), __filename) || 'preseme.js'} <comando> [--peca <pasta>]

  novo <pasta> [--de <pasta>]       monta a peça (projeto 9:16 do animation-studio + arquivos da peça ou do modelo)
  textos [arquivo.txt] [--tabela]   lê o textos.txt, confere o formato, grava o textos.js, mostra duração e leitura
  folha-textos [--saida <arquivo>]  um quadro por frase, no instante em que ela está inteira (decisão 115; peça de fora: do MP4)
  quadros [--saida <arquivo>]       folha de quadros (um por marcador) e a cópia reduzida para olhar
                                    (--saida: mais uma cópia com esse nome, relativo à pasta da peça; ex.: out/folha-v2.jpg)
  estilos <instante> [a,b,c] [--todos]   a folha da parada 2: o mesmo quadro em três estilos do kit (A ★, B, C)
  som                               out/music.wav pelo mapa-do-som.json (modo trilha ou blocos), no volume de celular
  rascunho                          vídeo inteiro em meia resolução, com som, e o ritmo (demora: rodar em segundo plano)
  trecho <de> <até> [--final]       refaz só um pedaço e emenda sem recomprimir o resto (de/até: segundos, @marcador ou [NN])
  definitivo                        som, vídeo inteiro, junção e medidas (demora: rodar em segundo plano)
  juntar [--rascunho]               junta a imagem com out/music.wav (vídeo de fora: out/video.mp4; animation-studio: o mux)
  capa [@marcador]                  a capa e o recorte 3:4 da grade (peça de fora que já traz capa: fica a dela, sem instante)
  conferir [--rascunho]             tudo o que se mede, numa lista só (corte que a câmera não mostra: CORTES no score.js)
  compara <enviado> <devolvido> [--conta]   o que ele mudou no textos.txt (formato do caderno da voz)
  entregar [rascunho|folha]         confere os arquivos e imprime a mensagem para ele

carrossel (peca.json "tipo": "carrossel", formato 4:5; monta com: novo <pasta> --carrossel, ou --de um molde):
  laminas [--draft] [--estilo X]    um PNG por lâmina, a folha com todas (out/folha.jpg) e o JPEG de subir (out/subir)
  conferir · capa · entregar [folha]   os mesmos nomes; no carrossel conferem as lâminas (qa, cores, contador do
                                    Instagram, grade 3:4, texto alternativo, legenda) e entregam as imagens
  textos, quadros, estilos e compara servem igual; som, rascunho, trecho, definitivo e juntar não (carrossel não tem vídeo)`;

function main() {
  const [cmd, ...args] = process.argv.slice(2);
  const L = (m) => require(path.join(__dirname, 'lib', m));
  // carrossel: os comandos que mudam de sentido, e os que não existem nele
  const C0 = L('comum');
  if (cmd !== 'novo' && C0.ehCarrossel(C0.pastaPeca(args || [], { exigir: false }))) {
    const K = L('carrossel');
    if (cmd === 'laminas') return K.laminas(args);
    if (cmd === 'conferir') return K.conferir(args);
    if (cmd === 'capa') return K.capa(args);
    if (cmd === 'entregar') return K.entregar(args);
    if (['som', 'rascunho', 'trecho', 'definitivo', 'juntar', 'folha-textos'].includes(cmd)) throw new Error(`a peça é carrossel: não tem som nem vídeo (${cmd} não se aplica). As lâminas saem com: laminas`);
  } else if (cmd === 'laminas') throw new Error('laminas é comando de carrossel: o peca.json desta peça não tem "tipo": "carrossel"');
  switch (cmd) {
    case 'novo': return L('novo').comando(args);
    case 'textos': return L('textos').comando(args);
    case 'folha-textos': return L('video').folhaTextos(args);
    case 'quadros': return L('video').quadros(args);
    case 'estilos': {
      // o comando da frente E (motor/estilos/estilos-folha.js), rodado sobre a peça: ele mesmo lê --peca
      const r = require('child_process').spawnSync(process.execPath, [path.join(__dirname, 'estilos', 'estilos-folha.js'), ...args], { stdio: 'inherit' });
      process.exitCode = r.status;
      return;
    }
    case 'som': return L('som').comando(args);
    case 'rascunho': return L('video').rascunho(args);
    case 'trecho': return L('video').trecho(args);
    case 'definitivo': return L('video').definitivo(args);
    case 'juntar': return L('video').juntar(args);
    case 'capa': return L('video').capa(args);
    case 'conferir': return L('conferir').comando(args);
    case 'compara': {
      const C = L('comum');
      const pos = C.posicionais(args);
      if (pos.length !== 2) throw new Error('uso: compara <enviado.txt> <devolvido.txt> [--conta]');
      const r = require('child_process').spawnSync('python3', ['-I', path.join(C.FERR, 'preseme-textos-compara.py'), ...pos.map((p) => path.resolve(p)), ...args.filter((a) => a === '--conta')], { stdio: 'inherit' });
      process.exitCode = r.status;
      return;
    }
    case 'entregar': return L('entregar').comando(args);
    default:
      console.log(AJUDA);
      if (cmd && !['ajuda', 'help', '-h', '--help'].includes(cmd)) { console.log(`\ncomando desconhecido: ${cmd}`); process.exitCode = 1; }
  }
}

try { main(); } catch (e) { console.log(`ERRO: ${e.message}`); process.exitCode = 1; }
