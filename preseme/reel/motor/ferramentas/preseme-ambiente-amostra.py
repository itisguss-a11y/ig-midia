# PRESEME · vídeo da amostra de sons de ambiente (par do claude/preseme-ambiente.js): um cartão por som,
# com o número, o nome e onde serve, e o áudio da amostra, para ele ouvir de fone e dizer bom ou ruim por número.
# Uso: node preseme-ambiente.js amostra <pasta>  e depois  python3 preseme-ambiente-amostra.py <pasta> <saida.mp4>
import glob, json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

pasta, saida = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
meta = json.load(open(os.path.join(pasta, 'amostra.json')))
W, H = 720, 1280
FUNDO, AMARELO, CREME, CINZA = '#1d4634', '#f2c230', '#f4ecd8', '#b9cdc2'

def fonte(nome, tam):
    achados = glob.glob(f'/usr/share/fonts/**/{nome}', recursive=True)
    return ImageFont.truetype(achados[0], tam)

NEGRITO, NORMAL = 'DejaVuSans-Bold.ttf', 'DejaVuSans.ttf'
ONDE = {
    'floresta': 'mata, aldeia, interior',
    'cidade': 'rua, ônibus, ida ao trabalho',
    'mosquito': 'dengue, malária',
    'chuva': 'chuva forte, alagamento',
    'sirene': 'SAMU 192, urgência',
    'salaDeEspera': 'UBS, posto, consulta',
    'noite': 'noite no interior',
    'monitor': 'hospital, coração',
    'rio': 'beira de rio, igarapé, ribeirinho',
    'varanda': 'casa, quintal, fim de tarde',
}

def quebra(d, texto, f, largura):
    linhas, atual = [], ''
    for p in texto.split():
        teste = (atual + ' ' + p).strip()
        if d.textlength(teste, font=f) <= largura: atual = teste
        else: linhas.append(atual); atual = p
    if atual: linhas.append(atual)
    return linhas

def cartao(arq, grande, titulo, sub):
    im = Image.new('RGB', (W, H), FUNDO)
    d = ImageDraw.Draw(im)
    y = 330
    if grande:
        f = fonte(NEGRITO, 260)
        d.text((W / 2, y), grande, font=f, fill=AMARELO, anchor='mm'); y += 230
    f = fonte(NEGRITO, 54)
    for ln in quebra(d, titulo, f, W - 120):
        d.text((W / 2, y), ln, font=f, fill=CREME, anchor='mm'); y += 70
    y += 30
    f = fonte(NORMAL, 36)
    for ln in quebra(d, sub, f, W - 140):
        d.text((W / 2, y), ln, font=f, fill=CINZA, anchor='mm'); y += 50
    im.save(arq)

tmp = os.path.join(pasta, 'cartoes'); os.makedirs(tmp, exist_ok=True)
lista = []
c0 = os.path.join(tmp, 'c0.png')
cartao(c0, '', 'Sons de ambiente', 'Ouça de fone. Para cada número, diga bom ou ruim. Tudo feito por código, nada baixado.')
marcas = meta['marcas']
lista.append((c0, marcas[0]['de']))
for k, m in enumerate(marcas):
    arq = os.path.join(tmp, f'c{k + 1}.png')
    cartao(arq, str(k + 1), m['nome'], 'Serve para: ' + ONDE.get(m['chave'], ''))
    fim = marcas[k + 1]['de'] if k + 1 < len(marcas) else meta['total']
    lista.append((arq, fim - m['de']))
txt = os.path.join(tmp, 'lista.txt')
with open(txt, 'w') as fh:
    for arq, dur in lista: fh.write(f"file '{arq}'\nduration {dur:.3f}\n")
    fh.write(f"file '{lista[-1][0]}'\n")
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', txt,
                '-i', os.path.join(pasta, 'amostra.wav'), '-r', '30', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '24',
                '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', saida], check=True)
print('ok', saida)
