#!/usr/bin/env bash
# PRESEME · biblioteca · a folha de catálogo: todos os lugares, objetos e pessoas da biblioteca, com o nome de chamar,
# em dois estilos (lápis e chapado). Uso:
#   bash motor/estilos/catalogo.sh [saida.png] [estilo1,estilo2]   (padrão: ./catalogo-biblioteca.png; lapis,chapado)
# Monta a peça do catálogo numa pasta temporária (o engine vem do animation-studio), copia o kit, a biblioteca e os
# arquivos de catalogo/, desenha as 5 páginas em cada estilo e junta tudo numa imagem só.
set -euo pipefail
AQUI="$(cd "$(dirname "$0")" && pwd)"
SAIDA="$(realpath -m "${1:-catalogo-biblioteca.png}")"
ESTILOS="${2:-lapis,chapado}"
MOTOR="${PRESEME_MOTOR:-$(cd "$AQUI/.." && pwd)}"
PECA="${PRESEME_CATALOGO:-${TMPDIR:-/tmp}/preseme-catalogo-peca}"
# as fotos paradas levam segundos: rodam sem a fila. Com RENDER_LOCK=<arquivo>, entram na fila (flock) mesmo assim
LOCK="${RENDER_LOCK:-}"
if [ ! -f "$PECA/engine/render.js" ]; then
  AS="$(node -e "console.log(require('$MOTOR/lib/comum.js').acharStudio())")"
  node "$AS/scripts/new-project.js" "$PECA" --format 9:16 >/dev/null
  rm -f "$PECA/film.js" "$PECA/song.js"
fi
mkdir -p "$PECA/ferramentas/fontes"
cp "$MOTOR/estilos/estilos.js" "$PECA/ferramentas/"
cp "$MOTOR/estilos/fontes/"* "$PECA/ferramentas/fontes/"
cp "$MOTOR/estilos/biblioteca.js" "$PECA/ferramentas/"
cp "$AQUI/catalogo/"* "$PECA/"
cd "$PECA"
for e in ${ESTILOS//,/ }; do
  CMD="timeout 300 node engine/render.js stills 0.5 1.5 2.5 3.5 4.5 --style $e"
  if [ -n "$LOCK" ]; then flock "$LOCK" -c "$CMD"; else bash -c "$CMD"; fi | grep -v '^still ' || true
  mkdir -p "out/$e" && mv out/stills/*.png "out/$e/"
done
python3 -I - "$SAIDA" "$ESTILOS" "$PECA/out" <<'PY'
# junta as páginas: uma linha por estilo, as 4 páginas lado a lado, na metade do tamanho, com o nome do estilo em cima
import sys
from PIL import Image, ImageDraw, ImageFont
saida, estilos, out = sys.argv[1], sys.argv[2].split(','), sys.argv[3]
NOME = {'lapis': 'lápis', 'chapado': 'chapado', 'giz': 'giz', 'pixel': 'pixel', 'planta': 'planta', 'carimbo': 'carimbo'}
PAG = ['lugares', 'objetos 1', 'objetos 2', 'objetos 3', 'gente']
w, h, faixa = 540, 960, 70
folha = Image.new('RGB', (w * len(PAG), (h + faixa) * len(estilos)), '#F4EDDF')
d = ImageDraw.Draw(folha)
try: f = ImageFont.truetype('DejaVuSans-Bold.ttf', 30)
except OSError: f = ImageFont.load_default()
for i, e in enumerate(estilos):
    y = i * (h + faixa)
    d.rectangle([0, y, w * len(PAG), y + faixa], fill='#17402C')
    for j, t in enumerate(['t_000.50', 't_001.50', 't_002.50', 't_003.50', 't_004.50']):
        im = Image.open(f'{out}/{e}/{t}.png').convert('RGB').resize((w, h), Image.LANCZOS)
        folha.paste(im, (j * w, y + faixa))
        d.text((j * w + 16, y + 16), f'{NOME.get(e, e)} · {PAG[j]}', fill='#F4EDDF', font=f)
folha.save(saida)
print('folha:', saida, folha.size)
PY
