# PRESEME · ferramenta do carrossel (motor do reel, comandos de carrossel). Rodar com python3 -I.
#   folha <saida.jpg> <lamina.png> ...          todas as lâminas numa imagem só, numeradas, para abrir com Read
#   subir <pasta> <lamina.png> ...              JPEG de subir no Instagram (qualidade 95, sem subamostrar a cor)
#   contador <lamina.png> ...                   avisa desenho embaixo do contador "1/8" do Instagram (canto de cima, à direita)
#   grade <lamina.png> <saida.jpg>              o recorte 3:4 da grade do perfil (tira 34 px de cada lado de uma lâmina 4:5)
#   escolha <saida.jpg> <titulo> <rotulo>=<capa.png>,<dentro.png> ...   a folha de escolha de moldes, lado a lado
import os
import sys

from PIL import Image, ImageDraw, ImageFont

PAPEL = (244, 237, 223)
FLORESTA = (23, 64, 44)
FOLHA = (48, 114, 78)
MARCA = (228, 235, 108)
CONTADOR = (936, 0, 1080, 116)  # onde o Instagram escreve "1/8" no carrossel (medido na lâmina de 1080 de largura)


def letra(tam, grossa=True):
    nomes = ['InstrumentSans[wdth,wght].ttf', 'Inter-Bold.ttf', 'DejaVuSans-Bold.ttf'] if grossa else ['InstrumentSans[wdth,wght].ttf', 'DejaVuSans.ttf']
    pastas = [os.path.expanduser('~/.fonts'), '/usr/share/fonts/truetype/dejavu', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'estilos', 'fontes')]
    for p in pastas:
        for n in nomes:
            f = os.path.join(p, n)
            if os.path.exists(f):
                try:
                    fo = ImageFont.truetype(f, tam)
                    try:
                        fo.set_variation_by_axes([100, 700 if grossa else 450])
                    except Exception:
                        pass
                    return fo
                except Exception:
                    continue
    return ImageFont.load_default()


def folha(saida, pngs):
    ims = [Image.open(p).convert('RGB') for p in pngs]
    n = len(ims)
    cols = 4 if n > 6 else max(1, min(n, 3))
    linhas = (n + cols - 1) // cols
    tw = 420
    th = round(tw * ims[0].size[1] / ims[0].size[0])
    gap, topo = 26, 64
    W = cols * tw + (cols + 1) * gap
    H = linhas * (th + topo) + gap * 2
    fol = Image.new('RGB', (W, H), PAPEL)
    d = ImageDraw.Draw(fol)
    f = letra(34)
    for i, im in enumerate(ims):
        c, l = i % cols, i // cols
        x = gap + c * (tw + gap)
        y = gap + l * (th + topo) + topo - 14
        d.text((x, y - 44), f'{i + 1:02d}', fill=FLORESTA, font=f)
        fol.paste(im.resize((tw, th), Image.LANCZOS), (x, y))
        d.rectangle([x - 1, y - 1, x + tw, y + th], outline=FOLHA, width=2)
    k = min(1.0, 1900 / max(fol.size))
    if k < 1:
        fol = fol.resize((round(fol.size[0] * k), round(fol.size[1] * k)), Image.LANCZOS)
    fol.save(saida, quality=88)
    print(f'{saida} · {n} lâminas · {fol.size[0]} x {fol.size[1]}')


def subir(pasta, pngs):
    os.makedirs(pasta, exist_ok=True)
    for i, p in enumerate(pngs):
        dest = os.path.join(pasta, f'{i + 1:02d}.jpg')
        Image.open(p).convert('RGB').save(dest, quality=95, subsampling=0)
        print(f'{dest} · {os.path.getsize(dest) / 1e6:.2f} MB')


def contador(pngs):
    import numpy as np
    problemas = 0
    for i, p in enumerate(pngs):
        im = Image.open(p).convert('L')
        k = im.size[0] / 1080
        x0, y0, x1, y1 = [round(v * k) for v in CONTADOR]
        a = np.asarray(im.crop((x0, y0, x1, y1)), dtype=float)
        # mancha que destoa do fundo da própria área (texto, traço forte): desvio alto em relação à mediana
        med = np.median(a)
        fora = (np.abs(a - med) > 60).mean()
        if fora > 0.03:
            problemas += 1
            print(f'AVISO lâmina {i + 1:02d}: {fora * 100:.0f}% da área do contador do Instagram (canto de cima, à direita) tem desenho forte; o "{i + 1}/{len(pngs)}" fica por cima')
    if not problemas:
        print(f'contador do Instagram: área livre nas {len(pngs)} lâminas')
    return problemas


def grade(png, saida):
    im = Image.open(png).convert('RGB')
    w, h = im.size
    lado = round((w - h * 3 / 4) / 2)
    im.crop((lado, 0, w - lado, h)).resize((540, 720), Image.LANCZOS).save(saida, quality=88)
    print(f'{saida} · recorte 3:4 da grade (tira {lado} px de cada lado)')


def estrela(d, cx, cy, r):
    import math
    pts = []
    for k in range(10):
        a = -math.pi / 2 + k * math.pi / 5
        rr = r if k % 2 == 0 else r * 0.45
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    d.polygon(pts, fill=MARCA, outline=FLORESTA, width=3)


def escolha(saida, titulo, itens):
    """A folha de escolha: um molde por linha (a capa e uma lâmina de dentro, lado a lado), com o rótulo grande.
    Rótulo "A ★ nome": a letra, a estrela (desenhada, não letra) no recomendado e o nome. Feita para ler no celular."""
    blocos = []
    for it in itens:
        rot, arqs = it.split('=', 1)
        blocos.append((rot, [Image.open(a).convert('RGB') for a in arqs.split(',')]))
    tw = 480
    th = round(tw * blocos[0][1][0].size[1] / blocos[0][1][0].size[0])
    gap, topo, rh = 28, 112, 78
    W = gap * 3 + 2 * tw
    H = topo + len(blocos) * (rh + th + gap * 2)
    fol = Image.new('RGB', (W, H), PAPEL)
    d = ImageDraw.Draw(fol)
    d.text((gap, 30), titulo, fill=FLORESTA, font=letra(46))
    for j, (rot, ims) in enumerate(blocos):
        y = topo + j * (rh + th + gap * 2)
        partes = rot.split(' ')
        letra_, nome = partes[0], ' '.join(p for p in partes[1:] if p != '★')
        x = gap
        d.text((x, y + 6), letra_, fill=FLORESTA, font=letra(60))
        x += d.textlength(letra_, font=letra(60)) + 18
        if '★' in partes:
            estrela(d, x + 26, y + 40, 28)
            x += 70
        d.text((x, y + 20), nome, fill=FLORESTA, font=letra(42))
        for i, im in enumerate(ims[:2]):
            xx = gap + i * (tw + gap)
            fol.paste(im.resize((tw, th), Image.LANCZOS), (xx, y + rh))
            d.rectangle([xx - 1, y + rh - 1, xx + tw, y + rh + th], outline=FOLHA, width=2)
    fol.save(saida, quality=90)
    print(f'{saida} · {fol.size[0]} x {fol.size[1]}')


if __name__ == '__main__':
    a = sys.argv[1:]
    if not a:
        print(__doc__ or 'uso: veja o cabeçalho do arquivo')
        sys.exit(2)
    cmd = a[0]
    if cmd == 'folha':
        folha(a[1], a[2:])
    elif cmd == 'subir':
        subir(a[1], a[2:])
    elif cmd == 'contador':
        sys.exit(1 if contador(a[1:]) and False else 0)
    elif cmd == 'grade':
        grade(a[1], a[2])
    elif cmd == 'escolha':
        escolha(a[1], a[2], a[3:])
    else:
        print(f'comando desconhecido: {cmd}')
        sys.exit(2)
