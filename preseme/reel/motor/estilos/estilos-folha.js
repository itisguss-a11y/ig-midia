#!/usr/bin/env node
// PRESEME · a folha da parada 2: o mesmo quadro de uma peça em três estilos, lado a lado, rotulados "A ★", "B" e "C".
// Decisão dele (16): "você poderia sugerir alguns estilos diferentes de arte, aí eu escolheria o melhor".
//
// Uso, de dentro da pasta da peça (a que tem engine/ e index.html):
//   node ferramentas/estilos-folha.js <instante> [estilo,estilo,estilo] [--todos] [--draft] [--saida out/folha-estilos.jpg]
//   instante: segundos (7.3), marcador do score (@principal, @principal+0.5) ou frase ([07] = 0,5 s depois que a frase 7 entra)
//   estilos: os três da parada, na ordem A, B, C; o primeiro leva a ★ (o que melhor explica). Padrão: lapis,giz,planta
//   --todos: os seis estilos do kit numa grade de 3 × 2 (para conferir o kit, não para mandar a ele)
//   --peca <pasta>: roda de fora da pasta da peça
// Sai: out/folha-estilos.jpg (ou o --saida) e um PNG por estilo em out/estilos/. Cada quadro sai do próprio motor:
// node engine/render.js stills <instante> --style <estilo>, uma vez por estilo.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const NOMES = { lapis: 'lápis no papel', pixel: 'pixel art', giz: 'giz na lousa', planta: 'planta técnica', carimbo: 'carimbo e gravura', chapado: 'infográfico chapado' };
const args = process.argv.slice(2);
const flag = (f) => { const i = args.indexOf(f); return i >= 0 ? args.splice(i, 2)[1] : null; };
const peca = path.resolve(flag('--peca') || '.');
const saidaArg = flag('--saida');
const todos = args.includes('--todos'), draft = args.includes('--draft');
const resto = args.filter((a) => !a.startsWith('--'));
if (!resto.length) { console.error('uso: node estilos-folha.js <instante> [lapis,giz,planta] [--todos] [--draft] [--saida arquivo.jpg] [--peca pasta]'); process.exit(2); }
let instante = resto[0];
const lista = todos ? Object.keys(NOMES) : (resto[1] || 'lapis,giz,planta').split(',').map((s) => s.trim()).filter(Boolean);
for (const s of lista) if (!NOMES[s]) { console.error(`estilo "${s}" não existe no kit (${Object.keys(NOMES).join(', ')})`); process.exit(2); }
if (!todos && lista.length !== 3) { console.error(`a parada 2 pede três estilos (veio ${lista.length})`); process.exit(2); }
if (!fs.existsSync(path.join(peca, 'engine', 'render.js'))) { console.error(`não achei engine/render.js em ${peca}: rode de dentro da pasta da peça ou use --peca`); process.exit(2); }
if (!fs.existsSync(path.join(peca, 'ferramentas', 'estilos.js'))) { console.error('a peça não carrega o kit: falta ferramentas/estilos.js (e a linha dele no index.html, antes do engine/video/gfx.js)'); process.exit(2); }

// [NN]: meio segundo depois que a frase entra (o fim da animação de entrada mais uma folga)
const fr = /^\[(\d+)\]$/.exec(instante);
if (fr) {
  const sc = require(path.join(peca, 'score.js'));
  const l = sc.linha && sc.linha[String(parseInt(fr[1], 10))];
  if (!l) { console.error(`a frase ${instante} não está no SCORE.linha`); process.exit(2); }
  instante = (l.t0 + 0.5).toFixed(2);
}

const out = path.join(peca, 'out'), dirEst = path.join(out, 'estilos');
fs.mkdirSync(dirEst, { recursive: true });
const quadros = [];
for (const s of lista) {
  const st = path.join(out, 'stills');
  fs.rmSync(st, { recursive: true, force: true });
  const t0 = Date.now();
  execFileSync(process.execPath, ['engine/render.js', 'stills', instante, '--style', s].concat(draft ? ['--draft'] : []), { cwd: peca, stdio: ['ignore', 'pipe', 'inherit'] });
  const png = fs.readdirSync(st).filter((f) => f.endsWith('.png'));
  if (png.length !== 1) { console.error(`o motor não deixou um quadro só em out/stills (${png.length})`); process.exit(1); }
  const dst = path.join(dirEst, `${s}.png`);
  fs.copyFileSync(path.join(st, png[0]), dst);
  quadros.push(dst);
  console.log(`  ${s.padEnd(8)} ${((Date.now() - t0) / 1000).toFixed(1)} s → out/estilos/${s}.png`);
}

const saida = path.resolve(peca, saidaArg || (todos ? 'out/folha-estilos-todos.jpg' : 'out/folha-estilos.jpg'));
const fonte = path.join(peca, 'ferramentas', 'fontes', 'InstrumentSans.ttf');
const rotulos = lista.map((s, i) => (todos ? NOMES[s] : `${'ABC'[i]}${i === 0 ? ' ★' : ''} · ${NOMES[s]}`));
// a montagem: PIL (python3), três colunas de 600 px (ou 3 × 2 no --todos), rótulo em cima de cada quadro
const py = `
import json, sys
from PIL import Image, ImageDraw, ImageFont
q, rot, saida, fonte, inst = json.loads(sys.argv[1])
# a altura sai da proporção do próprio quadro (reel 9:16, carrossel 4:5), para não esticar a lâmina
w0, h0 = Image.open(q[0]).size
cw = 600; ch = int(cw * h0 / w0); gap = 24; top = 64
cols = 3; rows = (len(q) + cols - 1) // cols
W = cols * cw + (cols + 1) * gap; H = rows * (ch + top + gap) + gap + 56
f = Image.new('RGB', (W, H), (244, 237, 223)); d = ImageDraw.Draw(f)
try:
    fo = ImageFont.truetype(fonte, 40); fo.set_variation_by_axes([100, 700])
    fp = ImageFont.truetype(fonte, 28)
except Exception:
    fo = fp = ImageFont.load_default()
import math
def estrela(cx, cy, R):
    pts = [(cx + math.cos(-math.pi / 2 + k * math.pi / 5) * (R if k % 2 == 0 else R * 0.45), cy + math.sin(-math.pi / 2 + k * math.pi / 5) * (R if k % 2 == 0 else R * 0.45)) for k in range(10)]
    d.polygon(pts, fill=(228, 235, 108), outline=(23, 64, 44), width=3)
for i, (p, r) in enumerate(zip(q, rot)):
    x = gap + (i % cols) * (cw + gap); y = gap + (i // cols) * (ch + top + gap)
    if '★' in r:  # a letra não tem a estrela: ela é desenhada (Marca-texto com borda Floresta)
        a, b = r.split('★', 1)
        d.text((x, y + 8), a, font=fo, fill=(23, 64, 44)); xa = x + d.textlength(a, font=fo) + 6
        estrela(xa + 20, y + 30, 21); d.text((xa + 46, y + 8), b, font=fo, fill=(23, 64, 44))
    else:
        d.text((x, y + 8), r, font=fo, fill=(23, 64, 44))
    im = Image.open(p).convert('RGB').resize((cw, ch), Image.LANCZOS)
    f.paste(im, (x, y + top))
d.text((gap, H - 46), 'o mesmo quadro (' + inst + ') em cada estilo', font=fp, fill=(48, 114, 78))
f.save(saida, quality=88)
print(saida, f.size[0], 'x', f.size[1])
`;
const r = execFileSync('python3', ['-I', '-c', py, JSON.stringify([quadros, rotulos, saida, fonte, instante])], { encoding: 'utf8' });
console.log('folha: ' + r.trim());
