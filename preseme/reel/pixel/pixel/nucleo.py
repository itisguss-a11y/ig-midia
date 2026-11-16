#!/usr/bin/env python3
# PRESEME · motor de pixel art · nucleo: paleta, bonecos, desenho basico na tela pequena (216 x 384, ampliada 5x),
# tempo, transicoes de camera e os efeitos de som que nascem do desenho.
# Saiu do codigo do reel "A casa 12" (quadros.py, reel_base.py e reel_base3.py, 14/11/2026), sem mudar nenhum traco.
import os, math, random
from PIL import Image, ImageDraw, ImageFont

S = 5                           # a tela pequena e ampliada 5 vezes: 216 x 384 -> 1080 x 1920
W, H = 216, 384
FPS = 30
# as seis cores da ficha e a Noite (tom de servico)
FL = (23, 64, 44); PA = (244, 237, 223); MA = (228, 235, 108); CO = (241, 109, 77)
SA = (181, 216, 192); FO = (48, 114, 78); NO = (7, 38, 24)
PALETA = {'floresta': FL, 'papel': PA, 'marca-texto': MA, 'coral': CO, 'salvia': SA, 'folha': FO, 'noite': NO}
PALMAP = {'k': NO, 'f': FL, 'g': FO, 's': SA, 'p': PA, 'm': MA, 'c': CO}
DARK = {FO: FL, FL: NO, PA: SA, SA: FO}
FONT = os.path.expanduser('~/.fonts/PixelifySans%5Bwght%5D.ttf')
FD = os.path.expanduser('~/.fonts/PressStart2P-Regular.ttf')
DADOS = [os.path.expanduser('~/.cache/preseme-pixel/dados')]      # mapas oficiais (comando dados); o montador troca


def font(size, wght=700):
    f = ImageFont.truetype(FONT, size)
    try:
        f.set_variation_by_axes([wght])
    except Exception:
        pass
    return f


# ---------------------------------------------------------------- desenho basico
def dither(d, box, c, phase=0):
    x0, y0, x1, y1 = box
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if (x + y + phase) % 2 == 0:
                d.point((x, y), fill=c)


def grass(d, box, seed, dens=1.0):
    x0, y0, x1, y1 = box
    rnd = random.Random(seed)
    d.rectangle(box, fill=SA)
    area = (x1 - x0 + 1) * (y1 - y0 + 1)
    for _ in range(int(area / 90 * dens)):
        x = rnd.randint(x0, x1 - 2); y = rnd.randint(y0 + 1, y1)
        d.point((x, y), fill=FO); d.point((x + 1, y - 1), fill=FO)
        if rnd.random() < .5:
            d.point((x + 2, y), fill=FO)
    for _ in range(int(area / 420 * dens)):
        d.point((rnd.randint(x0, x1), rnd.randint(y0, y1)), fill=PA if rnd.random() < .6 else MA)


def sprite(d, x, y, rows, sub=None, sc=1):
    """desenha um boneco escrito em letras (k noite, f floresta, g folha, s salvia, p papel, m marca-texto, c coral; '.' vazio);
    sub troca letras por cores (exemplo: {'g': NO, 'm': SA}); sc e o tamanho do ponto"""
    for j, row in enumerate(rows):
        for i, ch in enumerate(row):
            if ch == '.':
                continue
            c = (sub or {}).get(ch) or PALMAP.get(ch)
            if c:
                d.rectangle((x + i * sc, y + j * sc, x + i * sc + sc - 1, y + j * sc + sc - 1), fill=c)


GLY = {'1': ["010", "110", "010", "010", "111"], '2': ["111", "001", "111", "100", "111"],
       'U': ["101", "101", "101", "101", "111"], 'B': ["110", "101", "110", "101", "110"],
       'S': ["111", "100", "111", "001", "111"], 'A': ["111", "101", "111", "101", "101"],
       'M': ["101", "111", "111", "101", "101"]}


def tiny(d, x, y, s, c, sc=1):
    """letrinha de 3 x 5 pontos, para placas dentro do desenho (so os caracteres de GLY)"""
    for ch in s:
        for j, row in enumerate(GLY[ch]):
            for i, b in enumerate(row):
                if b == '1':
                    d.rectangle((x + i * sc, y + j * sc, x + i * sc + sc - 1, y + j * sc + sc - 1), fill=c)
        x += 4 * sc


# os personagens: ACS (o agente, de corpo inteiro), MINI (gente pequena; h cabelo, X roupa), DOT (gente de longe; X roupa)
ACS = ["..kkkkk..", ".kgggggk.", "kgggggggk", ".kpppppk.", ".kpkpkpk.", ".kpppppk.", "..kkkkk..",
       ".kmmmmmk.", "kmmpmmmmk", "kmmmmmmmk", "kpkmmmkpk", ".kfffffk.", ".kffkffk.", ".kffkffk.", ".kkk.kkk."]
MINI = [".hhhhh.", "hpppppk", "kpkpkpk", ".kkkkk.", "kXXXXXk", "kXXXXXk", "kXXXXXk", ".kfkfk.", ".kfkfk.", ".kk.kk."]
DOT = [".kkk.", "kpppk", ".kkk.", "kXXXk", "kXXXk", ".k.k."]
# as cores de cada profissao no boneco ACS (as mesmas das fichas do A casa 12)
SUB = {'acs': {}, 'medico': {'g': FL, 'm': PA}, 'enfermeiro': {'g': NO, 'm': SA}, 'tecnico': {'g': FO, 'm': MA}, 'ais': {'g': NO, 'm': SA}}


def bubble(d, x, y, card=True):
    """o balao de alerta (\"!\"), com a caderneta dentro quando card=True"""
    w = 22 if card else 9; h = 15
    d.rectangle((x - 1, y - 1, x + w, y + h), fill=NO)
    d.rectangle((x, y, x + w - 1, y + h - 1), fill=PA)
    for (a, b) in ((x - 1, y - 1), (x + w, y - 1), (x - 1, y + h), (x + w, y + h)):
        d.point((a, b), fill=None)
    d.polygon([(x + 3, y + h), (x + 9, y + h), (x + 3, y + h + 6)], fill=NO)
    d.polygon([(x + 4, y + h - 1), (x + 7, y + h - 1), (x + 4, y + h + 3)], fill=PA)
    cx = x + 2
    if card:
        d.rectangle((cx, y + 2, cx + 8, y + 12), fill=PA, outline=NO)
        d.rectangle((cx + 1, y + 3, cx + 7, y + 5), fill=FO)
        for yy in (7, 9, 11):
            d.line((cx + 2, y + yy, cx + 6, y + yy), fill=SA)
        cx += 12
    d.rectangle((cx + 1, y + 2, cx + 4, y + 9), fill=CO)
    d.rectangle((cx + 1, y + 11, cx + 4, y + 13), fill=CO)


def check(d, x, y):
    """o visto amarelo de \"feito\""""
    d.rectangle((x - 1, y - 1, x + 9, y + 8), fill=NO)
    d.rectangle((x, y, x + 8, y + 7), fill=MA)
    for p in ((7, 1), (6, 2), (7, 2), (1, 3), (5, 3), (6, 3), (1, 4), (2, 4), (4, 4), (5, 4), (2, 5), (3, 5), (4, 5), (3, 6)):
        d.point((x + p[0], y + p[1]), fill=NO)


def house_top(d, x, y, w, h, roof=FO, hi=False):
    """casa vista de cima; hi=True poe a moldura de marca-texto (a casa em destaque)"""
    dark = DARK[roof]
    d.rectangle((x - 1, y - 1, x + w, y + h), fill=NO)
    d.rectangle((x, y, x + w - 1, y + h - 1), fill=roof)
    dither(d, (x, y + h // 2 + 1, x + w - 1, y + h - 1), dark)
    d.line((x, y + h // 2, x + w - 1, y + h // 2), fill=dark)
    if w >= 12:
        d.rectangle((x + w - 7, y + 2, x + w - 3, y + 5), fill=SA if roof == PA else PA, outline=NO)
    if hi:
        d.rectangle((x - 4, y - 4, x + w + 3, y + h + 3), outline=NO)
        d.rectangle((x - 3, y - 3, x + w + 2, y + h + 2), outline=MA)
        d.rectangle((x - 2, y - 2, x + w + 1, y + h + 1), outline=MA)


def tree(d, cx, cy, r, mango=0, rnd=None):
    d.ellipse((cx - r - 1, cy - r - 1, cx + r + 1, cy + r + 1), fill=NO)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=FO)
    for yy in range(cy - r, cy + r + 1):
        for xx in range(cx - r, cx + r + 1):
            if (xx - cx) ** 2 + (yy - cy) ** 2 <= r * r and (xx - cx) + (yy - cy) > r * 0.4 and (xx + yy) % 2 == 0:
                d.point((xx, yy), fill=FL)
    if r >= 3:
        d.point((cx - r // 2, cy - r // 2), fill=SA); d.point((cx - r // 2 + 1, cy - r // 2 - 1), fill=SA)
    for _ in range(mango):
        a = rnd.random() * 6.28; q = rnd.random() * (r - 2)
        mx, my = int(cx + q * math.cos(a)), int(cy + q * math.sin(a))
        d.rectangle((mx, my, mx + 1, my + 1), fill=MA)


def road_h(d, y0, y1, x0=0, x1=W - 1, dash=True):
    d.rectangle((x0, y0, x1, y1), fill=PA)
    d.line((x0, y0, x1, y0), fill=FO); d.line((x0, y1, x1, y1), fill=FO)
    if dash:
        ym = (y0 + y1) // 2
        for x in range(x0 + 2, x1, 9):
            d.line((x, ym, x + 3, ym), fill=SA)


def road_v(d, x0, x1, y0=0, y1=H - 1, dash=True):
    d.rectangle((x0, y0, x1, y1), fill=PA)
    d.line((x0, y0, x0, y1), fill=FO); d.line((x1, y0, x1, y1), fill=FO)
    if dash:
        xm = (x0 + x1) // 2
        for y in range(y0 + 2, y1, 9):
            d.line((xm, y, xm, y + 3), fill=SA)


def dashed(d, pts, c, on=3, off=2, w=1):
    k = 0
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        n = max(abs(x1 - x0), abs(y1 - y0), 1)
        for i in range(n + 1):
            x = x0 + (x1 - x0) * i // n; y = y0 + (y1 - y0) * i // n
            if k % (on + off) < on:
                d.rectangle((x, y, x + w - 1, y + w - 1), fill=c)
            k += 1


# ---------------------------------------------------------------- tempo e animacao
EV = []                      # efeitos sonoros que nascem do desenho: {'t', 'som', 'vol'}
_vistos = set(); _cache = {}; TNOW = [0.0]


def ev(chave, som, vol=1.0):
    """pede um efeito de som (pop, tique, sopro, gota, sino, certo, baque, lapis) no instante do quadro; cada chave toca uma vez so"""
    if chave not in _vistos:
        _vistos.add(chave); EV.append({'t': round(TNOW[0], 3), 'som': som, 'vol': vol})


def sm(x):
    """suaviza: 0 -> 0, 1 -> 1, comecando e terminando devagar"""
    x = max(0.0, min(1.0, x)); return x * x * (3 - 2 * x)


def novo(cor=SA):
    im = Image.new('RGB', (W, H), cor); return im, ImageDraw.Draw(im)


def memo(chave, fn):
    """guarda um desenho parado (o fundo de uma cena) para nao desenhar de novo a cada quadro"""
    if chave not in _cache:
        _cache[chave] = fn()
    return _cache[chave]


def pisca(t, per=0.8, on=0.55):
    return (t % per) < on


def parcial(d, pts, c, frac, on=3, off=2, w=1):
    """tracejado desenhado so ate uma fracao do caminho; devolve o ponto onde parou"""
    seg = []
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        n = max(abs(x1 - x0), abs(y1 - y0), 1)
        seg += [(x0 + (x1 - x0) * i // n, y0 + (y1 - y0) * i // n) for i in range(n + 1)]
    m = int(len(seg) * max(0.0, min(1.0, frac)))
    for k, (x, y) in enumerate(seg[:m]):
        if k % (on + off) < on:
            d.rectangle((x, y, x + w - 1, y + w - 1), fill=c)
    return seg[m - 1] if m else seg[0]


def caminho(pts):
    seg = []
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        n = max(abs(x1 - x0), abs(y1 - y0), 1)
        seg += [(x0 + (x1 - x0) * i // n, y0 + (y1 - y0) * i // n) for i in range(n + 1)]
    return seg


def ao_longo(pts, frac):
    """o ponto que fica a uma fracao do caminho (para levar alguem ou algo de um lugar a outro)"""
    seg = caminho(pts); return seg[int(max(0.0, min(1.0, frac)) * (len(seg) - 1))]


def moldura(d, box, cores=(NO, MA, MA, NO)):
    for k, c in enumerate(cores):
        d.rectangle((box[0] + k, box[1] + k, box[2] - k, box[3] - k), outline=c)


# ---------------------------------------------------------------- transicoes de camera (na tela pequena)
def xadrez():
    def f():
        m = Image.new('L', (W, H), 0); p = m.load()
        for y in range(H):
            for x in range(W):
                if (x + y) % 2 == 0:
                    p[x, y] = 255
        return m
    return memo('xadrez', f)


def bayer():
    def f():
        B = (0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5)
        m = Image.new('L', (W, H), 0); p = m.load()
        for y in range(H):
            for x in range(W):
                p[x, y] = int((B[(y % 4) * 4 + x % 4] + 0.5) * 16)
        return m
    return memo('bayer', f)


def dissolve(A, B, p):
    lim = int(max(0.0, min(1.0, p)) * 256)
    return Image.composite(B, A, bayer().point(lambda v: 255 if v < lim else 0))


def zoom(fora, dentro, alvo, p):
    cx0, cy0 = (alvo[0] + alvo[2]) / 2, (alvo[1] + alvo[3]) / 2
    w0 = max(alvo[2] - alvo[0], (alvo[3] - alvo[1]) * W / H, 4.0); w = w0 * (W / w0) ** p; h = w * H / W
    q = (w - w0) / (W - w0); cx, cy = cx0 + (W / 2 - cx0) * q, cy0 + (H / 2 - cy0) * q
    x0, y0 = cx - w / 2, cy - h / 2
    im = fora.transform((W, H), Image.EXTENT, (x0, y0, x0 + w, y0 + h), Image.NEAREST)
    s = W / w; h0 = w0 * H / W
    r = [int(round(v)) for v in ((cx0 - w0 / 2 - x0) * s, (cy0 - h0 / 2 - y0) * s, (cx0 + w0 / 2 - x0) * s, (cy0 + h0 / 2 - y0) * s)]
    if r[2] - r[0] >= 2 and r[3] - r[1] >= 2 and p < 0.98:
        mini = dentro.resize((r[2] - r[0], r[3] - r[1]), Image.NEAREST)
        if p > 0.6:                                           # a cena de dentro se desfaz e deixa ver o desenho de fora
            lim = (p - 0.6) / 0.38 * 256
            mini = Image.composite(im.crop(tuple(r)), mini, bayer().resize(mini.size, Image.NEAREST).point(lambda v: 255 if v < lim else 0))
        im.paste(mini, (r[0], r[1]))
    return im


def transicao(modo, A, B, p, alvo):
    """afasta (a cena A vira um ponto dentro de B: alvo e o retangulo de B onde A cabe), aproxima (o contrario),
    desliza (B entra pela direita) e funde (dissolve em xadrez)"""
    p = sm(p)
    if modo == 'afasta':
        return zoom(B, A, alvo, p)
    if modo == 'aproxima':
        return zoom(A, B, alvo, 1 - p)
    if modo == 'desliza':
        im = Image.new('RGB', (W, H), NO); dx = int(round(W * p)); im.paste(A, (-dx, 0)); im.paste(B, (W - dx, 0)); return im
    return dissolve(A, B, p)
