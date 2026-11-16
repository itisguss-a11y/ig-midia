// PRESEME · motor do reel · novo <pasta> [--de <pasta-com-os-arquivos-da-peça>]
// Monta a pasta de trabalho de uma peça: o projeto 9:16 do animation-studio (engine/), as pastas e os arquivos da peça.
// Sem --de, os arquivos saem do modelo do motor (motor/modelo), para o chat 1 preencher.
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const C = require('./comum');

const FORA = new Set(['out', 'engine', 'node_modules', '.git', 'textos.js', 'film.js', 'song.js', 'package.json', '.gitignore']);
// letras da fábrica (passo 1): Instrument Serif e Sans, Anton, Kalam, Press Start 2P, Permanent Marker, Londrina
const LETRAS = ['InstrumentSerif-Regular.ttf', 'Anton-Regular.ttf', 'Kalam-Regular.ttf', 'PressStart2P-Regular.ttf', 'PermanentMarker-Regular.ttf'];
const CMD_LETRAS = "mkdir -p ~/.fonts && cd ~/.fonts && B=https://raw.githubusercontent.com/google/fonts/main && for f in ofl/instrumentserif/InstrumentSerif-Regular.ttf ofl/instrumentserif/InstrumentSerif-Italic.ttf 'ofl/instrumentsans/InstrumentSans%5Bwdth,wght%5D.ttf' 'ofl/instrumentsans/InstrumentSans-Italic%5Bwdth,wght%5D.ttf' ofl/anton/Anton-Regular.ttf ofl/kalam/Kalam-Regular.ttf ofl/kalam/Kalam-Bold.ttf ofl/pressstart2p/PressStart2P-Regular.ttf apache/permanentmarker/PermanentMarker-Regular.ttf; do curl -sSfLO \"$B/$f\" || echo \"FALHOU $f\"; done; fc-cache -f";

function copiar(de, para) {
  for (const it of fs.readdirSync(de, { withFileTypes: true })) {
    if (FORA.has(it.name)) continue;
    const a = path.join(de, it.name), b = path.join(para, it.name);
    if (it.isDirectory()) { fs.mkdirSync(b, { recursive: true }); copiar(a, b); } else fs.copyFileSync(a, b);
  }
}

function comando(args) {
  const pos = C.posicionais(args.filter((x, i) => args[i - 1] !== '--de'));
  const alvo = pos[0];
  if (!alvo) throw new Error('uso: novo <pasta> [--de <pasta-com-os-arquivos-da-peça>]   (o nome da pasta é o nome da peça)');
  const dir = path.resolve(alvo);
  const i = args.indexOf('--de');
  const fonte = i >= 0 ? path.resolve(args[i + 1]) : path.join(C.MOTOR, 'modelo');
  if (!fs.existsSync(fonte)) throw new Error(`não achei ${fonte}`);
  if (fs.existsSync(dir) && fs.readdirSync(dir).some((f) => !['out', 'engine'].includes(f)) && !args.includes('--forca')) throw new Error(`${dir} já existe e não está vazia. Use outra pasta (ou --forca para escrever por cima).`);
  const pj = path.join(fonte, 'peca.json');
  const peca = fs.existsSync(pj) ? JSON.parse(fs.readFileSync(pj, 'utf8')) : {};
  const externo = peca.motor === 'externo';
  if (!externo) {
    const AS = C.acharStudio();
    const np = C.roda(process.execPath, [path.join(AS, 'scripts', 'new-project.js'), dir, '--format', peca.formato || '9:16'], { quieto: true });
    console.log(np.split('\n').filter((l) => /[✓✗]/.test(l)).join('\n')); // a conferência do ambiente: Node, ffmpeg e Chrome
    for (const f of ['film.js', 'song.js']) fs.rmSync(path.join(dir, f), { force: true });
  } else fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync(path.join(dir, 'out'), { recursive: true });
  copiar(fonte, dir);
  // o kit de estilos (motor/estilos): vai para ferramentas/ só na peça cujo index.html o carrega. Ele muda o traço e as
  // cores do motor de desenho, então peça antiga sem a linha do kit continua saindo como saía.
  const ih = path.join(dir, 'index.html');
  if (fs.existsSync(ih) && fs.readFileSync(ih, 'utf8').includes('ferramentas/estilos.js')) {
    const kit = path.join(C.MOTOR, 'estilos');
    fs.mkdirSync(path.join(dir, 'ferramentas', 'fontes'), { recursive: true });
    for (const f of ['estilos.js', 'estilos-folha.js']) fs.copyFileSync(path.join(kit, f), path.join(dir, 'ferramentas', f));
    for (const f of fs.readdirSync(path.join(kit, 'fontes'))) fs.copyFileSync(path.join(kit, 'fontes', f), path.join(dir, 'ferramentas', 'fontes', f));
    console.log('kit de estilos: ferramentas/estilos.js (o estilo sai de ESTILO no score.js; sem ele, lápis no papel)');
  } else if (!externo) console.log('kit de estilos: esta peça não usa (o index.html não carrega ferramentas/estilos.js)');
  // o modelo se chama "modelo": a peça nova leva o nome da pasta
  const pd = path.join(dir, 'peca.json');
  if (fs.existsSync(pd)) {
    const p = JSON.parse(fs.readFileSync(pd, 'utf8'));
    if (!p.nome || p.nome === 'modelo' || fonte === path.join(C.MOTOR, 'modelo')) { p.nome = path.basename(dir); fs.writeFileSync(pd, JSON.stringify(p, null, 2) + '\n'); }
    if (p.nome !== path.basename(dir)) console.log(`AVISO: o peca.json diz que a peça se chama "${p.nome}", e a pasta é "${path.basename(dir)}": o vídeo sai com o nome da pasta (out/${path.basename(dir)}.mp4).`);
  }
  const md = path.join(dir, 'mapa-do-som.json');
  if (fs.existsSync(md)) {
    const m = JSON.parse(fs.readFileSync(md, 'utf8'));
    if (m.semente === 'modelo') { m.semente = path.basename(dir); fs.writeFileSync(md, JSON.stringify(m, null, 2) + '\n'); }
  }
  // as letras: as do motor de desenho vêm com o engine (Inter, Caveat…); as da fábrica ficam em ~/.fonts
  const faltam = LETRAS.filter((f) => !fs.existsSync(path.join(os.homedir(), '.fonts', f)));
  if (faltam.length) console.log(`AVISO: faltam letras da fábrica (${faltam.join(', ')}). Se o desenho usar alguma, rode:\n  ${CMD_LETRAS}`);
  else console.log('letras da fábrica: todas em ~/.fonts');
  console.log(`peça montada em ${dir}${externo ? ' (de fora do animation-studio: sem engine/)' : ''}`);
  if (fs.existsSync(path.join(dir, 'textos.txt'))) require('./textos').comando(['--peca', dir]);
  console.log(`Próximo: cd ${dir} && node ${path.join(C.MOTOR, 'preseme.js')} ${externo ? 'som' : 'quadros'}`);
}

module.exports = { comando };
