# PRESEME · folha de textos de um vídeo de fora do animation-studio (o motor de pixel art, por exemplo).
# O mesmo desenho da preseme-folha-textos.py (4 colunas, recorte da área útil do 9:16), mas os quadros
# saem do próprio MP4, no instante em que cada frase está inteira na tela (os tempos vêm do cenas.json).
# Uso (o motor chama):  python3 -I preseme-folha-externa.py <video.mp4> <saida.jpg> '[[1, 1.2], [2, 6.5], ...]'
import io, json, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

video, saida, quadros = sys.argv[1], sys.argv[2], json.loads(sys.argv[3])
COL, LARG, Y0, Y1, ROT = 4, 270, 150, 1560, 34      # recorte: a área útil do 9:16 (o resto fica sob a interface do Instagram)


def quadro(t):
    png = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.3f}', '-i', video, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'],
                         capture_output=True, check=True).stdout
    img = Image.open(io.BytesIO(png)).convert('RGB')
    return img if img.size == (1080, 1920) else img.resize((1080, 1920), Image.LANCZOS)  # o rascunho vem em meia resolução


alt = round((Y1 - Y0) * LARG / 1080)
linhas = -(-len(quadros) // COL)
folha = Image.new('RGB', (COL * LARG + (COL + 1) * 6, linhas * (alt + ROT + 6) + 6), (23, 64, 44))
d = ImageDraw.Draw(folha)
try: fonte = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
except OSError: fonte = ImageFont.load_default()
for i, (n, t) in enumerate(quadros):
    img = quadro(t).crop((0, Y0, 1080, Y1)).resize((LARG, alt), Image.LANCZOS)
    x, y = 6 + (i % COL) * (LARG + 6), 6 + (i // COL) * (alt + ROT + 6)
    d.text((x + 4, y + 5), f'[{n:02d}]  {int(t // 60)}:{t % 60:05.2f}', fill=(244, 237, 223), font=fonte)
    folha.paste(img, (x, y + ROT))
folha.save(saida, quality=82)
print(saida, folha.size, len(quadros), 'quadros')
