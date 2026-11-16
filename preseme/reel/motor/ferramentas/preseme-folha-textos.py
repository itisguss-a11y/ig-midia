# PRESEME · folha de textos (decisão 115): um quadro pequeno por frase do textos.txt, no instante em que ela está inteira na tela.
# Uso, na pasta do filme:  python3 ferramentas/preseme-folha-textos.py [saida.jpg]
# Lê os tempos do score.js, gera os quadros com o motor (render.js stills) e monta a folha (4 colunas, recorte da área útil).
import json, subprocess, sys, pathlib
from PIL import Image, ImageDraw, ImageFont

saida = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'out/folha-textos.jpg')
js = ("const S=require('./score.js');const o=[];for(const c of S.cenas)for(const it of c.itens){if(!it.n)continue;"
      "const t=Math.min(it.t0+0.7*(it.t1-it.t0),it.t1-0.25);o.push([it.n,Math.round(t*100)/100]);}console.log(JSON.stringify(o));")
quadros = json.loads(subprocess.check_output(['node', '-e', js], text=True))
subprocess.run(['node', 'engine/render.js', 'stills'] + [f'{t:.2f}' for _, t in quadros], check=True, stdout=subprocess.DEVNULL)
COL, LARG, Y0, Y1, ROT = 4, 270, 150, 1560, 34      # recorte: a área útil do 9:16 (o resto fica sob a interface do Instagram)
alt = round((Y1 - Y0) * LARG / 1080)
linhas = -(-len(quadros) // COL)
folha = Image.new('RGB', (COL * LARG + (COL + 1) * 6, linhas * (alt + ROT + 6) + 6), (23, 64, 44))
d = ImageDraw.Draw(folha)
try: fonte = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
except OSError: fonte = ImageFont.load_default()
for i, (n, t) in enumerate(quadros):
    img = Image.open(f'out/stills/t_{t:06.2f}.png').convert('RGB')
    img = img.crop((0, Y0, 1080, Y1)).resize((LARG, alt), Image.LANCZOS)
    x, y = 6 + (i % COL) * (LARG + 6), 6 + (i // COL) * (alt + ROT + 6)
    d.text((x + 4, y + 5), f'[{n:02d}]  {int(t // 60)}:{t % 60:05.2f}', fill=(244, 237, 223), font=fonte)
    folha.paste(img, (x, y + ROT))
folha.save(saida, quality=82)
print(saida, folha.size, len(quadros), 'quadros')
