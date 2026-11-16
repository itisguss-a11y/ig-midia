#!/usr/bin/env python3
# PRESEME · motor de pixel art · a letra e as pecas de texto na tela grande (1080 x 1920): escrever e medir com a Pixelify Sans
# (com os dois consertos), algarismos na PressStart2P, quebra de linha, cartao de cima, caixinhas de fase, etiquetas, contador,
# ficha de personagem, carimbo e o brasao em pontos (lido de um arquivo dado na hora; nada do brasao fica neste codigo).
# Saiu de folhas.py e reel_texto.py do reel "A casa 12" (14/11/2026), sem mudar nenhum traco.
# Zona segura do Reels (guia instagram-reels-publishing): topo ~250 px e base ~350 px sao da interface; texto entre y 250 e 1570
# e, na metade de baixo, ate x 930 (coluna de botoes). Por isso a cena sobe 24 linhas (120 px) quando e ampliada.
import re, functools
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import nucleo as N
from nucleo import W, H, FL, PA, MA, CO, SA, FO, NO, ACS, SUB, FD

SH = 24                       # linhas de pixel que a cena sobe
YP = 1190                     # as caixinhas de fase ficam logo acima desta linha; os papeis, logo abaixo
X0, X1 = 50, 1010
fonte = functools.lru_cache(maxsize=None)(N.font)
_m = ImageDraw.Draw(Image.new('RGB', (8, 8)))
GL7 = {'U': ["1...1", "1...1", "1...1", "1...1", "1...1", "1...1", ".111."], 'F': ["11111", "1....", "1....", "1111.", "1....", "1....", "1...."],
       'R': ["1111.", "1...1", "1...1", "1111.", "1.1..", "1..1.", "1...1"]}
GL5 = {'U': ["1.1", "1.1", "1.1", "1.1", "111"], 'F': ["111", "1..", "11.", "1..", "1.."], 'R': ["11.", "1.1", "11.", "1.1", "1.1"]}


def fdig(f):
    """a letra dos algarismos (PressStart2P), no tamanho que casa com a letra f"""
    return ImageFont.truetype(FD, max(8, int(f.size * 0.72)))


_cs = {}
FE = ['-liga', '-clig', '-dlig']   # sem ligaduras: o "fi" e o "fl" da Pixelify saem como um "A" ("Nele Aca a EMSI", "Acha")


def _c_aberto(f, ch, fx, fy):
    """o C maiusculo da Pixelify fecha quase todo no negrito e vira um O ("AOS", "MEDIOO"): a letra sai numa mascara, com a boca aberta"""
    ch_ = (id(f), ch, int(fx * 4), int(fy * 4))
    if ch_ not in _cs:
        m = Image.new('1', (int(f.size * 1.2) + 8, int(f.size * 1.7) + 8), 0); dm = ImageDraw.Draw(m); dm.fontmode = '1'
        dm.text((2 + fx, 2 + fy), ch, font=f, fill=1); gx0, _, gx1, _ = m.getbbox()
        by0, by1 = f.getbbox('C')[1], f.getbbox('C')[3]; alt = by1 - by0; boca = max(3, int(round(alt * 0.36)))
        ya = 2 + by0 + int(round(fy)) + (alt - boca) // 2     # a boca: o meio da altura, na metade direita da letra
        dm.rectangle((gx0 + int(round((gx1 - gx0) * 0.55)), ya, gx1 + 1, ya + boca - 1), fill=0); _cs[ch_] = m
    return _cs[ch_]


def txt(d, x, y, s, f, fill):
    """escreve s na letra f: algarismos na letra de numeros, o C maiusculo aberto e sem ligaduras; devolve onde o texto acaba"""
    fd = fdig(f)
    for p in re.split(r'(\d+|[CÇ])', s):
        if not p:
            continue
        if p.isdigit():
            d.text((x, y + f.size * 0.2), p, font=fd, fill=fill); x += d.textlength(p, font=fd)
        else:
            if p in 'CÇ':
                d.bitmap((int(x) - 2, int(y) - 2), _c_aberto(f, p, x - int(x), y - int(y)), fill=fill)
            else:
                d.text((x, y), p, font=f, fill=fill, features=FE)
            x += d.textlength(p, font=f, features=FE)
    return x


def tlen(d, s, f):
    """a largura que o txt escreve: algarismos na fonte de numeros, o resto sem ligaduras"""
    fd = fdig(f)
    return sum(d.textlength(p, font=fd) if p.isdigit() else d.textlength(p, font=f, features=FE) for p in re.split(r'(\d+)', s) if p)


def wrap(d, s, f, w):
    out, cur = [], ''
    for wd in s.split():
        t = (cur + ' ' + wd).strip()
        if tlen(d, t, f) <= w:
            cur = t
        else:
            out.append(cur); cur = wd
    if cur:
        out.append(cur)
    return out


def para(d, x, y, w, s, size=36, fill=PA, wght=500, lh=None):
    f = fonte(size, wght); lh = lh or int(size * 1.18)
    for l in wrap(d, s, f, w):
        txt(d, x, y, l, f, fill); y += lh
    return y


def card(d, box, fill=PA, sombra=True):
    x0, y0, x1, y1 = box
    if sombra:
        d.rectangle((x0 + 10, y0 + 10, x1 + 10, y1 + 10), fill=NO)
    d.rectangle(box, fill=fill, outline=NO, width=5)


@functools.lru_cache(maxsize=None)
def digitos(size):
    return ImageFont.truetype(FD, size)


def amplia(base):
    """a tela pequena ampliada para 1080 x 1920, subida 24 linhas (a de baixo e espelhada para completar)"""
    g = base.resize((W * 5, H * 5), Image.NEAREST); out = Image.new('RGB', (1080, 1920))
    out.paste(g.crop((0, SH * 5, 1080, 1920)), (0, 0))
    out.paste(g.crop((0, 1920 - SH * 5, 1080, 1920)).transpose(Image.FLIP_TOP_BOTTOM), (0, 1920 - SH * 5))
    return out


def tela(linha):              # linha de pixel da cena -> y na tela
    return (linha - SH) * 5


def cartao_topo(d, linhas, y0=250):
    """o cartao de cima: uma ou mais linhas; '*' no comeco da linha = marca-texto"""
    fr = [(t.lstrip('*'), t.startswith('*')) for t in linhas]
    grande = max(len(t) for t, _ in fr) <= 24
    f = fonte(60 if grande else 46); lh = 76 if grande else 58
    h = lh * len(fr) + (48 if len(fr) > 1 else (40 if grande else 58))
    card(d, (X0, y0, X1, y0 + h)); y = y0 + (h - lh * len(fr)) // 2
    for t, hl in fr:
        w = tlen(d, t, f); x = X0 + (X1 - X0 - w) // 2
        if hl:
            d.rectangle((x - 12, y + 6, x + w + 12, y + lh - 6), fill=MA)
        txt(d, x, y + (2 if grande else 0), t, f, NO); y += lh
    return y0 + h


def hud(d, fase, escuro):
    """as cinco caixinhas de fase (cara de jogo; a peca pode desligar com "hud": false)"""
    for i in range(5):
        x = 60 + i * 55
        d.rectangle((x, YP - 62, x + 44, YP - 18), fill=NO)
        d.rectangle((x + 5, YP - 57, x + 39, YP - 23), fill=MA if i < fase else (FO if escuro else SA))


def cola(frame, spr, x, y, alfa=1.0):
    if alfa >= 0.999:
        frame.paste(spr, (int(x), int(y)), spr)
    elif alfa > 0.01:
        frame.paste(spr, (int(x), int(y)), spr.getchannel('A').point(lambda v: int(v * alfa)))


def chip(d, x, y, texto, cor=PA, quad=None, size=32):
    """etiqueta escura com texto (rotulo solto sobre a cena); quad poe um quadradinho de legenda na frente.
    Texto vazio (rotulo apagado no textos.txt): nao desenha nada."""
    if not texto:
        return x
    f = fonte(size, 600); w = tlen(d, texto, f) + 24 + (34 if quad else 0)
    d.rectangle((x, y, x + w, y + size + 14), fill=NO)
    if quad:
        d.rectangle((x + 10, y + 9, x + 10 + size - 6, y + 3 + size), fill=quad, outline=PA)
    txt(d, x + 12 + (34 if quad else 0), y + 4, texto, f, cor)
    return x + w


def largura_chip(texto, quad=False, size=32):
    return tlen(_m, texto, fonte(size, 600)) + 24 + (34 if quad else 0)


@functools.lru_cache(maxsize=None)
def brasao_pixel(path, n=44, esc=3):
    """o brasao oficial, lido do arquivo em path, reduzido a uma grade de n pontos, com as cores dele e sem o fundo branco;
    as letras UFRR sao redesenhadas em ponto. (os limites 57-545 e 35-500 sao os do arquivo do projeto reduzido a 610 px:
    a parte de cima e o emblema; embaixo, as letras)"""
    a = np.asarray(Image.open(path).convert('RGB').resize((610, 608), Image.LANCZOS)).astype(int)
    cores = np.array([(255, 0, 0), (255, 237, 0), (21, 29, 119), (3, 150, 64), (0, 0, 0), (255, 255, 255)])
    idx = np.argmin(((a[:, :, None, :] - cores[None, None, :, :]) ** 2).sum(-1), axis=-1)
    x0, x1, y0, y1 = 57, 545, 35, 500; cw = (x1 - x0) / n; rows = int(round((y1 - y0) / cw))
    out = Image.new('RGBA', (n, rows + 10), (0, 0, 0, 0)); px = out.load()
    for j in range(rows):
        for i in range(n):
            cel = idx[int(y0 + j * cw):int(y0 + (j + 1) * cw), int(x0 + i * cw):int(x0 + (i + 1) * cw)].flatten(); nb = cel[cel != 5]
            if len(nb) >= 0.45 * len(cel):
                px[i, j] = tuple(int(v) for v in cores[np.bincount(nb, minlength=5).argmax()]) + (255,)
    g = GL7 if n >= 36 else GL5; gw = len(g['U'][0]); gx = (n - (4 * gw + 3)) // 2
    for k, ch in enumerate('UFRR'):
        for j, row in enumerate(g[ch]):
            for i, b in enumerate(row):
                if b == '1':
                    px[gx + k * (gw + 1) + i, rows + 2 + j] = NO + (255,)
    out = out.crop(out.getbbox()); return out.resize((out.width * esc, out.height * esc), Image.NEAREST)


def predio(d, x, y):
    """a secretaria, no lugar do retrato da ficha: o gestor distrital e uma entidade, nao uma pessoa"""
    d.rectangle((x + 22, y + 70, x + 138, y + 225), fill=FL, outline=NO, width=4)
    for j in range(3):
        for i in range(3):
            d.rectangle((x + 36 + i * 34, y + 86 + j * 34, x + 56 + i * 34, y + 106 + j * 34), fill=PA, outline=NO, width=2)
    d.rectangle((x + 66, y + 188, x + 94, y + 225), fill=NO)
    d.rectangle((x + 30, y + 20, x + 35, y + 70), fill=NO); d.rectangle((x + 35, y + 20, x + 80, y + 48), fill=MA, outline=NO, width=3)
    d.rectangle((x + 10, y + 225, x + 150, y + 233), fill=NO)


def sprite_ficha(r, chave):
    """a ficha de personagem (titulo, retrato e linhas rotulo/valor), lida de r['fichas'][chave]; 'sprite' e a profissao
    (acs, medico, enfermeiro, tecnico, ais) ou 'predio'"""
    f = r['fichas'][chave]; wc = 960
    fr, fv = fonte(30, 700), fonte(36, 500); tx = 208; tw = 878 - tx
    blocos, y = [], 96
    for rot, val in f['linhas']:
        ls = wrap(_m, val, fv, tw); blocos.append((y, rot, ls)); y += 38 + 43 * len(ls) + 12
    h = max(y + 12, 96 + 245 + 22)
    im = Image.new('RGBA', (wc + 12, h + 12), (0, 0, 0, 0)); d = ImageDraw.Draw(im); d.fontmode = '1'
    d.rectangle((12, 12, wc + 11, h + 11), fill=NO); d.rectangle((0, 0, wc - 1, h - 1), fill=PA, outline=NO, width=5)
    txt(d, 28, 20, f['titulo'], fonte(40, 700), NO); d.rectangle((28, 76, wc - 29, 79), fill=FO)
    d.rectangle((28, 96, 188, 96 + 245), fill=SA, outline=NO, width=4)
    if f['sprite'] == 'predio':
        predio(d, 28, 96)
    else:
        N.sprite(d, 41, 106, ACS, SUB.get(f['sprite'], {}), sc=15)
    for y, rot, ls in blocos:
        txt(d, tx, y, rot, fr, FO)
        for k, l in enumerate(ls):
            txt(d, tx, y + 38 + 43 * k, l, fv, NO)
    return im


def equilibra(texto, f, maxw):
    """uma linha se couber; senao, duas linhas o mais parecidas possivel"""
    p = texto.split()
    if tlen(_m, texto, f) <= maxw or len(p) < 2:
        return [texto]
    op = [(' '.join(p[:i]), ' '.join(p[i:])) for i in range(1, len(p))]
    a, b = min(op, key=lambda o: max(tlen(_m, o[0], f), tlen(_m, o[1], f)))
    return [a, b] if max(tlen(_m, a, f), tlen(_m, b, f)) <= maxw else wrap(_m, texto, f, maxw)


def sprite_carimbo(texto):
    """carimbo Coral com letra Noite (contraste 5,4): e a frase que fica; gira 12 graus, suavizado"""
    f = fonte(46, 700); ls = equilibra(texto, f, 560); w = int(max(tlen(_m, l, f) for l in ls)) + 72; h = 56 * len(ls) + 48
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im); d.fontmode = '1'
    d.rectangle((0, 0, w - 1, h - 1), fill=CO, outline=NO, width=5); d.rectangle((12, 12, w - 13, h - 13), outline=NO, width=2)
    for k, l in enumerate(ls):
        txt(d, (w - tlen(d, l, f)) // 2, 22 + 56 * k, l, f, NO)
    g = im.resize((w * 3, h * 3), Image.NEAREST).rotate(12, resample=Image.BICUBIC, expand=True)
    return g.resize((g.width // 3, g.height // 3), Image.LANCZOS)


def contador(d, numero, rotulo, y0=560, antes=None):
    """o contador: o numero grande na letra de numeros, o rotulo embaixo e, se tiver, uma palavra antes (ATE, DE)"""
    fn = digitos(120 if len(numero) <= 4 else 58); wn = d.textlength(numero, font=fn)
    fr = fonte(38, 700); wr = tlen(d, rotulo, fr); w = max(wn, wr) + 90; x = (1080 - w) // 2
    hn = 150 if len(numero) <= 4 else 96; ha = 52 if antes else 0
    card(d, (x, y0, x + w, y0 + ha + hn + 92), fill=FL)
    if antes:
        txt(d, x + (w - tlen(d, antes, fr)) // 2, y0 + 22, antes, fr, SA)
    d.text((x + (w - wn) // 2, y0 + ha + 26), numero, font=fn, fill=MA)
    txt(d, x + (w - wr) // 2, y0 + ha + hn + 22, rotulo, fr, PA)
