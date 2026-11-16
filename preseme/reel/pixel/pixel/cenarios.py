#!/usr/bin/env python3
# PRESEME · motor de pixel art · cenarios e elementos prontos, na tela pequena (216 x 384)
# Cenarios: casa (moradia), rua (microarea), bairro (a mesma rua sem ninguem, para a peca animar), area (equipe e UBS), cidade (distrito), mapa de Roraima com os contornos oficiais
# (IBGE e FUNAI), aldeia, polo-base, UBS por dentro, adscricao. Elementos: palmeira, maloca, malocao, casa de palha, rede, radio,
# barco, voadeira, cruz, caixa de vacina, marcas do mapa, boneco apagado.
# Saiu do codigo do reel "A casa 12" (quadros.py, folhas.py, reel_desenhos.py, reel_base2.py, reel_base3.py e reel_base4.py, 14/11/2026),
# sem mudar nenhum traco; o que era fixo da peca (o numero 12 na placa) virou parametro com o mesmo valor de antes.
import os, json, math, random, sqlite3, struct
from PIL import Image, ImageDraw
import nucleo as N
from nucleo import (W, H, FL, PA, MA, CO, SA, FO, NO, ACS, MINI, DOT, dither, grass, sprite, tiny, bubble, check, house_top, tree,
                    road_h, road_v, dashed, novo, memo)

N.GLY.update({'0': ["111", "101", "101", "101", "111"], '3': ["111", "001", "011", "001", "111"], '4': ["101", "101", "111", "001", "001"],
              '5': ["111", "100", "111", "001", "111"], '6': ["111", "100", "111", "101", "111"], '7': ["111", "001", "010", "010", "010"],
              '8': ["111", "101", "111", "101", "111"], '9': ["111", "101", "111", "001", "111"]})   # placas com qualquer numero


# ================================================================ cenarios (desenho parado; a peca anima por cima)
def cena_casa(d, rnd, balao=True, numero='12'):
    """a moradia: casa de frente, quintal com mangueira e varal, cerca, calcada e rua"""
    grass(d, (0, 0, W - 1, H - 1), 3)
    for (x, roof) in ((-8, FL), (30, FO), (148, FL), (188, FO)):          # casas da rua de tras
        d.rectangle((x, 120, x + 34, 142), fill=PA, outline=NO)
        d.polygon([(x - 3, 120), (x + 6, 108), (x + 28, 108), (x + 37, 120)], fill=roof, outline=NO)
        d.rectangle((x + 6, 128, x + 12, 142), fill=FO)
        d.rectangle((x + 19, 126, x + 28, 133), fill=SA, outline=FO)
    dither(d, (0, 106, W - 1, 144), SA, 1)
    for cx, r in ((82, 8), (104, 10), (128, 8)):
        tree(d, cx, 132, r)
    # varal
    d.line((186, 214, 186, 244), fill=NO); d.line((213, 214, 213, 244), fill=NO); d.line((186, 216, 213, 216), fill=NO)
    for (x, c, hh) in ((189, PA, 10), (197, MA, 8), (205, FO, 11)):
        d.rectangle((x, 217, x + 5, 217 + hh), fill=c, outline=NO)
    # telhado
    d.polygon([(34, 187), (56, 150), (160, 150), (182, 187)], fill=FO, outline=NO)
    for y in range(156, 186, 6):
        k = (y - 150) * 22 // 37
        xl, xr = 56 - k, 160 + k
        d.line((xl + 1, y, xr - 1, y), fill=FL)
        for x in range(xl + 4 + ((y // 6) % 2) * 4, xr - 2, 8):
            d.line((x, y + 1, x, y + 4), fill=FL)
    d.line((57, 151, 159, 151), fill=SA)
    d.line((38, 188, 178, 188), fill=FL)
    # caixa d'agua e antena
    d.rectangle((140, 137, 156, 150), fill=PA, outline=NO); d.rectangle((138, 134, 158, 138), fill=SA, outline=NO)
    d.line((144, 141, 144, 148), fill=SA)
    d.line((72, 150, 72, 130), fill=NO); d.line((66, 132, 78, 132), fill=NO); d.line((68, 136, 76, 136), fill=NO)
    # parede
    d.rectangle((46, 189, 170, 246), fill=PA, outline=NO)
    dither(d, (157, 190, 169, 245), SA)
    d.rectangle((47, 240, 169, 245), fill=SA); d.line((47, 239, 169, 239), fill=FO)
    # porta
    d.rectangle((98, 206, 118, 246), fill=FO, outline=NO)
    for (a, b, c2, e) in ((101, 209, 107, 222), (109, 209, 115, 222), (101, 226, 107, 242), (109, 226, 115, 242)):
        d.rectangle((a, b, c2, e), fill=FL)
    d.rectangle((114, 224, 115, 225), fill=MA)
    d.rectangle((93, 246, 123, 249), fill=SA, outline=NO)
    # janelas
    for wx in (54, 136):
        d.rectangle((wx, 198, wx + 28, 224), fill=FO, outline=NO)
        d.rectangle((wx + 2, 200, wx + 26, 222), fill=SA)
        d.polygon([(wx + 2, 200), (wx + 10, 200), (wx + 2, 213)], fill=PA)
        d.polygon([(wx + 26, 200), (wx + 18, 200), (wx + 26, 213)], fill=PA)
        d.line((wx + 14, 200, wx + 14, 222), fill=FO); d.line((wx + 2, 211, wx + 26, 211), fill=FO)
        d.rectangle((wx - 2, 225, wx + 30, 227), fill=PA, outline=NO)
    # familia na janela da esquerda
    for hx, hy in ((60, 215), (68, 217)):
        d.rectangle((hx, hy, hx + 4, hy + 7), fill=FL); d.rectangle((hx + 1, hy - 3, hx + 3, hy), fill=FL)
    # numero
    d.rectangle((122, 207, 133, 217), fill=PA, outline=NO); tiny(d, 124, 210, numero, NO)
    # mangueira
    d.rectangle((14, 204, 22, 250), fill=FL, outline=NO)
    for cx, cy, r in ((18, 186, 19), (4, 200, 12), (34, 198, 12)):
        tree(d, cx, cy, r, mango=4, rnd=rnd)
    tree(d, 196, 240, 9); tree(d, 208, 248, 7)
    # cerca e portao aberto
    for x in range(0, W, 5):
        if 92 <= x <= 123:
            continue
        d.rectangle((x, 251, x + 2, 261), fill=PA); d.point((x + 1, 250), fill=PA); d.line((x + 3, 252, x + 3, 261), fill=FO)
    for yy in (254, 258):
        d.line((0, yy, 91, yy), fill=PA); d.line((125, yy, W - 1, yy), fill=PA)
    for i, yy in enumerate(range(252, 300, 7)):
        d.rectangle((102 + (i % 2) * 5, yy, 110 + (i % 2) * 5, yy + 3), fill=PA, outline=FO)
    # calcada e rua
    d.rectangle((0, 302, W - 1, 309), fill=PA); d.line((0, 302, W - 1, 302), fill=FO)
    for x in range(0, W, 12):
        d.line((x, 303, x, 309), fill=SA)
    road_h(d, 310, 338)
    grass(d, (0, 339, W - 1, H - 1), 9)
    if balao:
        bubble(d, 120, 164, card=True)


def cena_rua(d, rnd, numero='12'):
    """a microarea vista de cima: quadras, ruas, o agente com a prancheta, casas visitadas e a casa em destaque"""
    grass(d, (0, 0, W - 1, H - 1), 5, 0.5)
    road_h(d, 178, 192); road_h(d, 246, 258); road_h(d, 322, 334)
    road_v(d, 99, 111, 102, H - 1)
    for (a, b) in ((179, 191), (247, 257), (323, 333)):
        d.rectangle((100, a, 110, b), fill=PA)
    xs = (6, 30, 54, 78, 118, 142, 166, 190)
    rows = (112, 156, 198, 226, 266, 300, 340)
    roofs = (FO, FL, PA, FO, FO, PA, FL, FO)
    for j, y in enumerate(rows):
        for i, x in enumerate(xs):
            r = roofs[(i * 3 + j * 5) % len(roofs)]
            house_top(d, x, y, 18, 16, r, hi=(j == 2 and i == 5))
    for j, y in enumerate((140, 219, 288, 362)):
        for i, x in enumerate(xs):
            if (i + j) % 2 == 0:
                tree(d, x + 6 + rnd.randint(0, 6), y + rnd.randint(-2, 2), 4 + (i % 2), mango=(i % 3 == 0) * 2, rnd=rnd)
    # vizinhos fora da microarea ficam apagados
    dither(d, (0, 224, W - 1, H - 1), SA, 1)
    dither(d, (0, 100, W - 1, 104), SA, 1)
    dashed(d, [(3, 105), (211, 105), (211, 221), (3, 221), (3, 105)], NO, on=4, off=3, w=2)
    # caminho da agente e casas ja visitadas
    dashed(d, [(0, 185), (128, 185)], FO, on=2, off=2, w=2)
    for j, y in ((1, 156), (2, 198)):
        for i, x in enumerate(xs[:5]):
            check(d, x + 5, y + 4)
    sprite(d, 116, 163, ACS, sc=2)
    d.rectangle((133, 180, 140, 190), fill=PA, outline=NO)                    # prancheta
    d.line((135, 183, 138, 183), fill=FO); d.line((135, 186, 138, 186), fill=FO)
    d.rectangle((143, 216, 157, 224), fill=PA, outline=NO); tiny(d, 147, 218, numero, NO)
    bubble(d, 164, 178, card=False)


XS_RUA = (6, 30, 54, 78, 118, 142, 166, 190)                # x das casas de cada fileira do bairro
FILAS_RUA = (112, 156, 198, 226, 266, 300, 340)              # y das fileiras


def bairro(d, rnd, numero='12', apagado=False):
    """a microarea vista de cima, sem ninguem: quadras, ruas, casas, arvores e a placa da casa em destaque (a sexta casa da
    terceira fileira, em x 142, y 198: e o alvo de uma transicao "afasta" que sai de dentro de uma casa). A peca poe o agente,
    as marcas e o balao por cima. apagado: os vizinhos fora da microarea em xadrez claro."""
    grass(d, (0, 0, W - 1, H - 1), 5, 0.5)
    road_h(d, 178, 192); road_h(d, 246, 258); road_h(d, 322, 334); road_v(d, 99, 111, 102, H - 1)
    for (a, b) in ((179, 191), (247, 257), (323, 333)):
        d.rectangle((100, a, 110, b), fill=PA)
    roofs = (FO, FL, PA, FO, FO, PA, FL, FO)
    for j, y in enumerate(FILAS_RUA):
        for i, x in enumerate(XS_RUA):
            house_top(d, x, y, 18, 16, roofs[(i * 3 + j * 5) % len(roofs)], hi=(j == 2 and i == 5))
    for j, y in enumerate((140, 219, 288, 362)):
        for i, x in enumerate(XS_RUA):
            if (i + j) % 2 == 0:
                tree(d, x + 6 + rnd.randint(0, 6), y + rnd.randint(-2, 2), 4 + (i % 2), mango=(i % 3 == 0) * 2, rnd=rnd)
    if apagado:
        dither(d, (0, 224, W - 1, H - 1), SA, 1); dither(d, (0, 100, W - 1, 104), SA, 1)
    d.rectangle((143, 216, 157, 224), fill=PA, outline=NO); tiny(d, 147, 218, numero, NO)


def cena_area(d, rnd, vacina=True, equipe=True, agentes=True, numero='12'):
    """a area de uma equipe: seis microareas, a UBS no meio, um agente por microarea e o caminho da vacina ate a casa em destaque;
    devolve (x e y da casa em destaque, o caminho da vacina)"""
    cols = ((4, 70), (76, 139), (145, 211)); lins = ((106, 175), (181, 250), (256, 330))
    d.rectangle((0, 0, W - 1, H - 1), fill=PA)
    alvo = None
    for j, (y0, y1) in enumerate(lins):
        for i, (x0, x1) in enumerate(cols):
            d.rectangle((x0, y0, x1, y1), fill=SA)
            t = (i + j) % 3
            if t == 1:
                dither(d, (x0, y0, x1, y1), PA)
            elif t == 2:
                for yy in range(y0, y1 + 1, 2):
                    for xx in range(x0 + (yy // 2) % 2 * 2, x1 + 1, 4):
                        d.point((xx, yy), fill=FO)
            d.rectangle((x0, y0, x1, y1), outline=FO)
            for yy in range(y0 + 6, y1 - 8, 13):
                for xx in range(x0 + 5, x1 - 8, 11):
                    if 72 <= xx <= 140 and 140 <= yy <= 218:
                        continue
                    hx, hy = xx + rnd.randint(-1, 1), yy + rnd.randint(-1, 1)
                    if rnd.random() < 0.14:
                        tree(d, hx + 3, hy + 3, 3)
                        continue
                    e = (j == 1 and i == 2 and alvo is None and yy > y0 + 30 and xx > x0 + 25)
                    house_top(d, hx, hy, 7, 6, rnd.choice((FO, FL, FO, PA)))
                    if e:
                        alvo = (hx, hy)
    hx, hy = alvo
    d.rectangle((hx - 3, hy - 3, hx + 9, hy + 8), outline=NO); d.rectangle((hx - 2, hy - 2, hx + 8, hy + 7), outline=MA)
    # agentes, uma por microarea
    for j, (y0, y1) in enumerate(lins[:2]):
        for i, (x0, x1) in enumerate(cols):
            ax, ay = (hx - 9, hy - 1) if (i, j) == (2, 1) else (x0 + 8 + rnd.randint(0, 30), y0 + 22 + rnd.randint(0, 24))
            if agentes:
                sprite(d, ax, ay, MINI, {'h': FO, 'X': MA})
    # fora da area
    dither(d, (0, 254, W - 1, H - 1), PA, 1)
    dashed(d, [(2, 104), (212, 104), (212, 252), (2, 252), (2, 104)], NO, on=4, off=3, w=2)
    # unidade
    d.rectangle((75, 143, 141, 193), fill=NO)
    d.rectangle((77, 145, 139, 191), fill=PA)
    d.rectangle((77, 145, 139, 158), fill=FO); tiny(d, 97, 147, 'UBS', PA, sc=2)
    d.rectangle((98, 163, 118, 183), fill=SA, outline=NO)
    d.rectangle((105, 166, 111, 180), fill=FO); d.rectangle((101, 170, 115, 176), fill=FO)
    d.rectangle((81, 166, 91, 191), fill=FO, outline=NO); d.rectangle((125, 166, 135, 176), fill=SA, outline=NO)
    # a vacina sai da unidade e chega na casa em destaque
    cam = [(142, 186), (hx - 6, 186), (hx - 6, hy + 14), (hx + 3, hy + 14), (hx + 3, hy + 9)]
    if vacina:
        for a, b in zip(cam, cam[1:]):
            d.line((a[0], a[1], b[0], b[1]), fill=NO, width=3)
        dashed(d, cam, MA, on=3, off=2, w=1)
        sx, sy = (142 + hx - 6) // 2 - 6, 180
        d.rectangle((sx, sy, sx + 13, sy + 8), fill=NO); d.rectangle((sx + 1, sy + 1, sx + 10, sy + 7), fill=PA)
        d.rectangle((sx + 2, sy + 2, sx + 7, sy + 6), fill=MA); d.rectangle((sx + 14, sy + 4, sx + 18, sy + 4), fill=NO)
        d.rectangle((sx - 4, sy + 2, sx - 1, sy + 6), fill=NO)
    d.rectangle((hx - 4, hy - 13, hx + 10, hy - 5), fill=PA, outline=NO); tiny(d, hx, hy - 11, numero, NO)
    # equipe na porta
    if equipe:
        for k, (cab, roupa) in enumerate(((NO, PA), (FL, PA), (NO, SA), (FO, MA))):
            sprite(d, 78 + k * 16, 197, MINI, {'h': cab, 'X': roupa}, sc=2)
    return hx, hy, cam


def cena_cidade(d, rnd, barras=True, reforco=True):
    """a cidade vista do alto (o distrito): quarteiroes, o rio, cinco areas com a barra de cobertura, a sede da secretaria;
    devolve (centros das areas, posicao da sede, o retangulo do distrito, as areas)"""
    def rio(y):
        return int(182 + 12 * math.sin(y / 38.0) + 5 * math.sin(y / 11.0))
    for y in range(0, H):
        xr = rio(y)
        d.line((xr, y, W - 1, y), fill=SA)
        d.point((xr, y), fill=FO); d.point((xr + 1, y), fill=FO)
    for _ in range(90):
        y = rnd.randint(100, H - 2); x = rnd.randint(rio(y) + 6, W - 4)
        d.line((x, y, x + 2, y), fill=PA)
    def bloco(i, j):
        return 3 + i * 11, 104 + j * 11
    for j in range(0, 26):
        for i in range(0, 17):
            x, y = bloco(i, j)
            if x + 9 > rio(y) - 3 or x + 9 > rio(y + 8) - 3:
                continue
            r = rnd.random()
            if r < 0.07:
                d.rectangle((x, y, x + 7, y + 7), fill=SA); tree(d, x + 4, y + 4, 2)
            else:
                d.rectangle((x, y, x + 7, y + 7), fill=FO)
                dither(d, (x + 4, y + 4, x + 7, y + 7), FL)
                if r > 0.5:
                    d.rectangle((x + 1 + rnd.randint(0, 2), y + 1 + rnd.randint(0, 2), x + 2 + rnd.randint(1, 2), y + 3), fill=PA)
    # cinco areas (em quarteiroes): i0, j0, i1, j1, cobertura
    areas = ((0, 0, 6, 5, 5), (7, 0, 15, 5, 4), (0, 6, 4, 12, 4), (5, 6, 10, 12, 2), (11, 6, 15, 12, 5))
    dither(d, (0, 248, W - 1, H - 1), PA, 1)
    cent = []
    for n, (i0, j0, i1, j1, cob) in enumerate(areas):
        x0, y0 = bloco(i0, j0); x1, y1 = bloco(i1, j1); x0 -= 2; y0 -= 2; x1 += 9; y1 += 9
        x1 = min(x1, rio((y0 + y1) // 2) - 3)
        dashed(d, [(x0, y0), (x1, y0), (x1, y1), (x0, y1), (x0, y0)], NO, on=3, off=2, w=1)
        cx, cy = (x0 + x1) // 2, (y0 + y1) // 2 + 4
        cent.append((cx, cy))
        d.rectangle((cx - 6, cy - 6, cx + 6, cy + 6), fill=NO)
        d.rectangle((cx - 5, cy - 5, cx + 5, cy + 5), fill=PA)
        d.rectangle((cx - 1, cy - 4, cx + 1, cy + 4), fill=FO); d.rectangle((cx - 4, cy - 1, cx + 4, cy + 1), fill=FO)
        if barras:
            bx, by = cx - 12, cy - 17
            d.rectangle((bx - 1, by - 1, bx + 25, by + 7), fill=NO)
            for k in range(5):
                cor = (CO if cob <= 2 else FO) if k < cob else PA
                d.rectangle((bx + k * 5, by, bx + k * 5 + 4, by + 6), fill=NO)
                d.rectangle((bx + k * 5 + 1, by + 1, bx + k * 5 + 3, by + 5), fill=cor)
    # contorno do distrito
    x0, y0 = bloco(0, 0); xb, yb = bloco(15, 12)
    ret = (x0 - 5, y0 - 5, min(xb + 12, rio(170) - 0), yb + 12)
    if reforco:
        for wdt, c in ((0, NO), (1, MA), (2, MA), (3, NO)):
            d.rectangle((ret[0] + wdt, ret[1] + wdt, ret[2] - wdt, ret[3] - wdt), outline=c)
    # a sede da secretaria
    sx, sy = cent[1][0] - 26, cent[1][1] + 2
    d.rectangle((sx - 8, sy - 9, sx + 8, sy + 7), fill=NO); d.rectangle((sx - 7, sy - 8, sx + 7, sy + 6), fill=FL)
    for a in (-5, -1, 3):
        d.rectangle((sx + a, sy - 5, sx + a + 2, sy - 3), fill=PA); d.rectangle((sx + a, sy, sx + a + 2, sy + 2), fill=PA)
    d.line((sx - 7, sy - 9, sx - 7, sy - 17), fill=NO); d.rectangle((sx - 6, sy - 17, sx, sy - 13), fill=MA, outline=NO)
    tx, ty = cent[3]
    if reforco:
        # o reforco sai da sede e vai para a area com cobertura baixa
        dashed(d, [(sx, sy + 9), (sx, ty - 24), (tx + 14, ty - 24), (tx + 14, ty - 10)], NO, on=2, off=2, w=2)
        cxb, cyb = tx + 9, ty - 13
        d.rectangle((cxb, cyb, cxb + 10, cyb + 8), fill=NO); d.rectangle((cxb + 1, cyb + 1, cxb + 9, cyb + 7), fill=MA)
        d.rectangle((cxb + 4, cyb + 2, cxb + 6, cyb + 6), fill=NO); d.rectangle((cxb + 2, cyb + 3, cxb + 8, cyb + 5), fill=NO)
    return cent, (sx, sy), ret, areas


# ---------------------------------------------------------------- mapa de Roraima (contornos oficiais: IBGE e FUNAI)
BV = (-60.67, 2.82)                                           # Boa Vista (longitude, latitude)
FORA = ('Waimiri', 'Pirititi', 'Trombetas')                   # terras indigenas que aparecem no recorte mas nao sao dos DSEI de Roraima


def aneis_geojson(path):
    for ft in json.load(open(path, encoding='utf-8'))['features']:
        g = ft['geometry']
        polys = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
        for p in polys:
            yield p[0]


def wkb(b, o):
    bo = '<' if b[o] == 1 else '>'
    t = struct.unpack_from(bo + 'I', b, o + 1)[0] % 1000; o += 5
    if t == 3:
        nr = struct.unpack_from(bo + 'I', b, o)[0]; o += 4; rings = []
        for _ in range(nr):
            n = struct.unpack_from(bo + 'I', b, o)[0]; o += 4
            pts = struct.unpack_from(bo + '%dd' % (n * 2), b, o); o += n * 16
            rings.append(list(zip(pts[0::2], pts[1::2])))
        return [rings], o
    if t == 6:
        ng = struct.unpack_from(bo + 'I', b, o)[0]; o += 4; polys = []
        for _ in range(ng):
            p, o = wkb(b, o); polys += p
        return polys, o
    raise ValueError(t)


def terras(path):
    c = sqlite3.connect(path); c.text_factory = lambda b: b.decode('latin-1')
    for nome, uf, blob in c.execute("select terrai_nom, abbrev_state, geom from indigenous_land_202103_simplified where abbrev_state like '%RR%'"):
        env = (blob[3] >> 1) & 7
        polys, _ = wkb(blob, 8 + {0: 0, 1: 32, 2: 48, 3: 48, 4: 64}[env])
        yield nome, [p[0] for p in polys]


def cena_mapa(d, dados, com_terras=True, com_legenda=True):
    """Roraima (municipios do IBGE) e o Amazonas em xadrez; com_terras, as terras indigenas (Yanomami em marca-texto, as do Leste em papel);
    devolve P, a funcao que leva (longitude, latitude) para o ponto da tela pequena"""
    K = 18.5; LON0 = -67.3; LAT1 = 5.45; X0 = 30; Y0 = 118
    def P(pt):
        return (int(round(X0 + (pt[0] - LON0) * K)), int(round(Y0 + (LAT1 - pt[1]) * K)))
    am = Image.new('L', (W, H), 0); da = ImageDraw.Draw(am)
    for r in aneis_geojson(os.path.join(dados, 'am-mun.json')):
        da.polygon([P(p) for p in r], fill=255)
    rr = Image.new('L', (W, H), 0); dr = ImageDraw.Draw(rr)
    aneis_rr = list(aneis_geojson(os.path.join(dados, 'rr-mun.json')))
    for r in aneis_rr:
        dr.polygon([P(p) for p in r], fill=255)
    pa, pr = am.load(), rr.load()
    for y in range(H):
        for x in range(W):
            if pr[x, y]:
                d.point((x, y), fill=FO)
            elif pa[x, y] and (x + y) % 2 == 0:
                d.point((x, y), fill=FO)
    for r in aneis_rr:
        d.polygon([P(p) for p in r], outline=FL)
    for y in range(1, H - 1):                                   # divisa do estado
        for x in range(1, W - 1):
            if pr[x, y] and not (pr[x - 1, y] and pr[x + 1, y] and pr[x, y - 1] and pr[x, y + 1]):
                d.point((x, y), fill=NO)
    for nome, aneis in (terras(os.path.join(dados, 'ti.gpkg')) if com_terras else []):
        if any(nome.startswith(f) for f in FORA):
            continue
        cor = MA if nome.startswith('Yanomami') else PA
        for r in aneis:
            pts = [P(p) for p in r]
            if len(pts) >= 3:
                d.polygon(pts, fill=cor, outline=NO)
    tiny(d, P((-67.0, -0.6))[0], P((-67.0, -0.6))[1], 'AM', SA, sc=3)
    # legenda
    if com_legenda:
        d.rectangle((14, 103, 22, 111), fill=MA, outline=NO); d.rectangle((108, 103, 116, 111), fill=PA, outline=NO)
    return P


def mapa(terras):
    """o mapa de Roraima pronto, guardado: (imagem, P); terras=True com as terras indigenas"""
    def f():
        im, d = novo(FL); P = cena_mapa(d, N.DADOS[0], com_terras=terras, com_legenda=False); return im, P
    return memo(('mapa', terras), f)


def mascaras():
    """(terra Yanomami, terras do Leste de Roraima), como mascaras"""
    def f():
        P = mapa(True)[1]; my = Image.new('L', (W, H), 0); ml = Image.new('L', (W, H), 0)
        for nome, aneis in terras(os.path.join(N.DADOS[0], 'ti.gpkg')):
            if any(nome.startswith(x) for x in FORA):
                continue
            dm = ImageDraw.Draw(my if nome.startswith('Yanomami') else ml)
            for r in aneis:
                pts = [P(p) for p in r]
                if len(pts) >= 3:
                    dm.polygon(pts, fill=255, outline=255)
        return my, ml
    return memo('masc', f)


def mascara_rr():
    """Roraima inteiro, como mascara"""
    def f():
        P = mapa(True)[1]; m = Image.new('L', (W, H), 0); dm = ImageDraw.Draw(m)
        for r in aneis_geojson(os.path.join(N.DADOS[0], 'rr-mun.json')):
            dm.polygon([P(p) for p in r], fill=255)
        return m
    return memo('mrr', f)


def pontos(d, pts):
    """pontos de 2 x 2 (polos, casos, unidades) no mapa"""
    for (x, y) in pts:
        d.rectangle((x, y, x + 1, y + 1), fill=NO)


def marca(d, xy, cor=PA, r=1):
    """um marcador quadrado no mapa (uma cidade, uma aldeia)"""
    x, y = xy; d.rectangle((x - r - 1, y - r - 1, x + r + 1, y + r + 1), fill=NO); d.rectangle((x - r, y - r, x + r, y + r), fill=cor)


# ================================================================ elementos
def palmeira(d, x, y, h=16):
    d.line((x, y, x, y - h), fill=FL, width=2)
    for ang in (-150, -120, -90, -60, -30):
        a = math.radians(ang)
        ex, ey = int(x + 9 * math.cos(a)), int(y - h + 9 * math.sin(a))
        d.line((x, y - h, ex, ey), fill=FO, width=2); d.point((ex, ey), fill=SA)
        d.line((ex, ey, ex + (1 if ex > x else -1), ey + 3), fill=FO)


def maloca(d, cx, cy, r):
    ry = int(r * 0.8)
    d.ellipse((cx - r - 1, cy - r - 1, cx + r + 1, cy + ry + 1), fill=NO)
    d.ellipse((cx - r, cy - r, cx + r, cy + ry), fill=SA)
    for yy in range(cy - r + 3, cy + ry - 1, 3):
        t = (yy - cy) / (r if yy < cy else ry)
        half = int(math.sqrt(max(0.0, 1 - t * t)) * r)
        d.line((cx - half + 1, yy, cx + half - 1, yy), fill=FO)
        for xx in range(cx - half + 2 + (yy % 2) * 3, cx + half - 1, 6):
            d.point((xx, yy + 1), fill=PA)
    d.rectangle((cx - 3, cy + ry - 9, cx + 3, cy + ry), fill=NO)
    d.line((cx - r + 2, cy + ry - 2, cx + r - 2, cy + ry - 2), fill=FL)
    d.point((cx, cy - r + 1), fill=PA)


def rede(d, x0, x1, y, crianca=True):
    for x in (x0, x1):
        d.line((x, y - 14, x, y + 10), fill=NO, width=2)
    pts = [(x0 + i * (x1 - x0) // 12, y - 12 + int(9 * math.sin(math.pi * i / 12))) for i in range(13)]
    d.line(pts, fill=PA, width=3); d.line(pts, fill=SA)
    if crianca:
        mx, my = (x0 + x1) // 2, y - 6
        d.rectangle((mx - 6, my - 2, mx + 4, my + 2), fill=FL); d.rectangle((mx + 4, my - 3, mx + 7, my + 1), fill=PA)
        d.rectangle((mx - 7, my - 4, mx - 4, my + 3), fill=MA)


def radio(d, x, y):
    d.rectangle((x, y, x + 4, y + 6), fill=NO); d.line((x + 3, y - 4, x + 3, y), fill=NO); d.point((x + 1, y + 1), fill=MA)


def barco(d, x, y, dir=1):
    pts = [(x, y), (x + 24, y), (x + 22, y + 5), (x + 2, y + 5)]
    d.polygon(pts, fill=PA, outline=NO)
    d.line((x + 4, y + 2, x + 20, y + 2), fill=SA)
    d.rectangle((x + 22, y - 3, x + 25, y + 2), fill=NO)                       # motor
    sprite(d, x + 9, y - 9, DOT, {'X': SA})
    for k in range(3):
        d.line((x - 4 - k * 6, y + 2 + k, x - 1 - k * 6, y + 2 + k), fill=PA)


def cruz(d, x, y, s, cor=FO, fundo=SA):
    """a cruz da saude num quadrado (placa de unidade)"""
    d.rectangle((x, y, x + s, y + s), fill=fundo, outline=NO)
    m = s // 2; t = max(1, s // 5)
    d.rectangle((x + m - t, y + 2, x + m + t, y + s - 2), fill=cor); d.rectangle((x + 2, y + m - t, x + s - 2, y + m + t), fill=cor)


def caixa_vacina(d, sx, sy):
    """a caixinha de vacina que anda pelo caminho"""
    d.rectangle((sx, sy, sx + 13, sy + 8), fill=NO); d.rectangle((sx + 1, sy + 1, sx + 10, sy + 7), fill=PA)
    d.rectangle((sx + 2, sy + 2, sx + 7, sy + 6), fill=MA); d.rectangle((sx + 14, sy + 4, sx + 18, sy + 4), fill=NO)
    d.rectangle((sx - 4, sy + 2, sx - 1, sy + 6), fill=NO)


def casa_palha(d, x, y, w, h):
    """casa de palha: telhado de quatro aguas que desce quase ate o chao, parede baixa de madeira, porta escura"""
    cw = w // 3; hr = int(h * 0.72); xa, xb = x + (w - cw) // 2, x + (w + cw) // 2
    d.polygon([(x - 2, y + hr), (xa - 1, y - 1), (xb + 1, y - 1), (x + w + 2, y + hr)], fill=NO)
    d.polygon([(x - 1, y + hr - 1), (xa, y), (xb, y), (x + w + 1, y + hr - 1)], fill=PA)
    for yy in range(y + 3, y + hr - 1, 3):                                  # fiadas de palha
        t = (yy - y) / hr; xl = int(xa - (xa - x + 1) * t); xr = int(xb + (x + w + 1 - xb) * t)
        d.line((xl + 1, yy, xr - 1, yy), fill=FO)
        for xx in range(xl + 2 + ((yy // 3) % 2) * 3, xr - 1, 6):
            d.point((xx, yy + 1), fill=SA)
    d.line((xa, y - 1, xb, y - 1), fill=NO)
    d.rectangle((x + 3, y + hr, x + w - 3, y + h), fill=FL, outline=NO)      # parede de madeira
    for xx in range(x + 6, x + w - 4, 4):
        d.line((xx, y + hr + 1, xx, y + h - 1), fill=FO)
    d.rectangle((x + w // 2 - 4, y + hr - 5, x + w // 2 + 4, y + h), fill=NO)   # porta


def malocao(d, cx, by, r, h):
    """a casa grande redonda: cobertura de palha em cone, do alto ate quase o chao, com o remate no topo e a porta baixa"""
    y0 = by - h

    def meia(yy):
        t = (yy - y0) / float(h); return max(1, int(round(r * min(1.0, (t ** 0.6) * 1.04))))
    for yy in range(y0, by + 1):
        m = meia(yy); d.line((cx - m - 1, yy, cx + m + 1, yy), fill=NO)
    d.line((cx - m - 1, by + 1, cx + m + 1, by + 1), fill=NO)
    for yy in range(y0 + 1, by + 1):
        m = meia(yy); k = (yy - y0) % 4
        d.line((cx - m, yy, cx + m, yy), fill=FO if k == 3 else PA)
        if k == 1:
            for xx in range(cx - m + 1 + ((yy - y0) // 4 % 2) * 3, cx + m, 6):
                d.point((xx, yy), fill=SA)
    d.line((cx, y0 - 5, cx, y0), fill=NO); d.line((cx - 2, y0 - 4, cx + 2, y0 - 4), fill=NO)   # remate
    d.rectangle((cx - 5, by - 11, cx + 5, by + 1), fill=NO)                 # porta
    d.rectangle((cx - 3, by - 9, cx + 3, by), fill=FL)
    d.line((cx, by - 9, cx, by), fill=NO)


def lancha(im, x, y, v=0.0, t=0.0, espelho=False):
    """cola a voadeira em im, com o casco de x a x+60 e a borda na linha y; espelho=True vira a proa para a direita"""
    tmp = Image.new('RGBA', (210, 48), (0, 0, 0, 0)); _lancha(ImageDraw.Draw(tmp), 14, 26, v, t)
    if espelho:
        tmp = tmp.transpose(Image.FLIP_LEFT_RIGHT); im.paste(tmp, (x - 136, y - 26), tmp)
    else:
        im.paste(tmp, (x - 14, y - 26), tmp)


def _lancha(d, x, y, v=0.0, t=0.0):
    """voadeira de lado, proa para a esquerda (56 px). v de 0 a 1 e a velocidade: a proa levanta e a esteira de espuma cresce"""
    lev = 6 if v > 0.55 else (4 if v > 0.3 else (2 if v > 0.08 else 0))
    if v > 0.45:                                                            # o jato de agua que sobe atras do motor
        for k in range(8):
            hh = int(9 * v * math.sin(math.pi * (k + 1) / 9))
            d.rectangle((x + 62 + k * 3, y + 5 - hh, x + 63 + k * 3, y + 6 - hh), fill=PA)
    if v > 0.05:                                                            # esteira de espuma atras do motor
        comp = int(18 + 90 * v); f = int(t * 14)
        for k in range(0, comp, 4):
            abre = 1 + k // 14                                              # a esteira abre conforme se afasta
            for s in (-1, 0, 1):
                yy = y + 8 + s * abre * 2 + ((k // 4 + f) % 2)
                if (k // 4 + s + f) % 3 != 0:
                    d.rectangle((x + 60 + k, yy, x + 62 + k, yy + 1), fill=PA)
        d.polygon([(x + 58, y + 2), (x + 58, y + 12), (x + 66 + int(6 * v), y + 7)], fill=PA)   # o jato logo atras da helice
    casco = [(x, y - lev), (x + 55, y), (x + 53, y + 11), (x + 10, y + 11)]
    d.polygon(casco, fill=PA, outline=NO)
    d.line((x + 2, y - lev + 1, x + 54, y + 1), fill=NO)
    d.line((x + 8, y + 5 - lev // 3, x + 50, y + 5), fill=SA, width=2)
    d.rectangle((x + 55, y - 8, x + 60, y + 6), fill=NO); d.rectangle((x + 57, y + 6, x + 59, y + 14), fill=NO)   # motor de popa
    sprite(d, x + 36, y - 12, DOT, {'X': SA}, sc=2); sprite(d, x + 18, y - 12 - lev // 2, DOT, {'X': MA}, sc=2)   # piloto e passageiro
    if v > 0.25:                                                            # respingo na proa
        f = int(t * 12) % 3
        for (a, b) in (((-3, 6), (-7, 2), (-2, 10), (-10, 5)), ((-5, 4), (-9, 8), (-2, 1), (-12, 3)), ((-4, 9), (-8, 5), (-12, 7), (-3, 2)))[f]:
            d.rectangle((x + a, y + b - lev, x + a + 1, y + b - lev + 1), fill=PA)
        d.line((x + 4, y + 12, x + 20, y + 13), fill=PA, width=2)


def riscos_de_velocidade(d, y0, y1, v, t, sentido=1, n=8):
    """tracos claros correndo na agua, no sentido contrario ao da lancha (sentido=1: lancha indo para a esquerda)"""
    if v <= 0.1:
        return
    for k in range(n):
        yy = y0 + 3 + (k * 37) % max(1, (y1 - y0 - 6)); xx = int((k * 53 + sentido * t * (170 + 40 * k) * v) % (W + 30)) - 15
        d.rectangle((xx, yy, xx + 8 + int(14 * v), yy + 1), fill=PA)


PALIDO = {'k': FO, 'g': SA, 'p': PA, 'm': PA, 'f': SA}


def apagado(d, x, y, rows, sc=2):
    """o mesmo boneco em tons claros e contorno fino: a figura 'apagada', de comparacao"""
    sprite(d, x, y, rows, PALIDO, sc)


# ---------------------------------------------------------------- aldeia, polo-base, UBS por dentro, adscricao
def cena_aldeia(d, rnd, alerta=True, ais=True):
    """aldeia com malocas redondas, rede com a crianca, rio e o AIS com o radio (versao do briefing)"""
    d.rectangle((0, 0, W - 1, H - 1), fill=FO)
    for _ in range(420):
        x, y = rnd.randint(-4, W + 4), rnd.randint(96, H + 4)
        if (x - 108) ** 2 / 90 ** 2 + (y - 200) ** 2 / 62 ** 2 < 1.15:
            continue
        if y > 300:
            continue
        tree(d, x, y, rnd.choice((3, 4, 4, 5, 6)))
    # terreiro
    d.ellipse((18, 140, 198, 262), fill=PA)
    dither(d, (18, 140, 198, 262), SA)
    for _ in range(60):
        x, y = rnd.randint(22, 194), rnd.randint(144, 258)
        if (x - 108) ** 2 / 88 ** 2 + (y - 201) ** 2 / 60 ** 2 < 1:
            d.point((x, y), fill=FO if rnd.random() < .5 else SA)
    # rio e barranco
    for y in range(300, H):
        xw = int(6 * math.sin(y / 9.0))
        d.line((0, y, W - 1, y), fill=SA)
    d.line((0, 300, W - 1, 300), fill=FL); d.line((0, 301, W - 1, 301), fill=FO)
    d.rectangle((0, 294, W - 1, 299), fill=PA); dither(d, (0, 294, W - 1, 299), SA)
    for _ in range(70):
        y = rnd.randint(304, H - 2); x = rnd.randint(0, W - 5)
        d.line((x, y, x + 3, y), fill=PA)
    # malocas
    maloca(d, 62, 176, 24); maloca(d, 150, 170, 20); maloca(d, 108, 236, 16)
    # buritis e mangueira
    palmeira(d, 196, 150, 18); palmeira(d, 206, 158, 14); palmeira(d, 10, 290, 16); palmeira(d, 200, 292, 18)
    tree(d, 30, 248, 9, mango=3, rnd=rnd)
    # rede com a crianca
    rede(d, 154, 190, 236)
    if alerta:
        bubble(d, 176, 206, card=False)
    if ais:
        sprite(d, 118, 198, ACS, {'g': NO, 'm': SA}, sc=2)
        radio(d, 138, 208)
    # fogo e panela, canoa na beira
    d.rectangle((88, 262, 96, 266), fill=NO); d.point((92, 260), fill=CO); d.point((91, 259), fill=MA)
    d.polygon([(40, 296), (62, 296), (60, 299), (42, 299)], fill=FL)


def fundo_aldeia(d, rnd):
    """a aldeia do reel: o malocao, duas casas de palha, buritis, a rede vazia, o fogo, o rio e a canoa"""
    d.rectangle((0, 0, W - 1, H - 1), fill=FO)
    for _ in range(420):
        x, y = rnd.randint(-4, W + 4), rnd.randint(96, H + 4)
        if (x - 108) ** 2 / 90 ** 2 + (y - 200) ** 2 / 62 ** 2 < 1.15 or y > 300:
            continue
        tree(d, x, y, rnd.choice((3, 4, 4, 5, 6)))
    d.ellipse((18, 140, 198, 262), fill=PA); dither(d, (18, 140, 198, 262), SA)
    for _ in range(60):
        x, y = rnd.randint(22, 194), rnd.randint(144, 258)
        if (x - 108) ** 2 / 88 ** 2 + (y - 201) ** 2 / 60 ** 2 < 1:
            d.point((x, y), fill=FO if rnd.random() < .5 else SA)
    for y in range(300, H):
        d.line((0, y, W - 1, y), fill=SA)
    d.line((0, 300, W - 1, 300), fill=FL); d.line((0, 301, W - 1, 301), fill=FO)
    d.rectangle((0, 294, W - 1, 299), fill=PA); dither(d, (0, 294, W - 1, 299), SA)
    for _ in range(70):
        y = rnd.randint(304, H - 2); x = rnd.randint(0, W - 5); d.line((x, y, x + 3, y), fill=PA)
    malocao(d, 64, 192, 27, 46)                                             # a casa grande da comunidade
    casa_palha(d, 128, 152, 46, 34)                                         # a casa da familia
    casa_palha(d, 56, 230, 38, 27)
    palmeira(d, 196, 150, 18); palmeira(d, 206, 158, 14); palmeira(d, 10, 290, 16); palmeira(d, 200, 292, 18)
    tree(d, 26, 232, 8, mango=3, rnd=rnd)
    rede(d, 156, 190, 240, crianca=False)                                   # a rede, vazia
    d.rectangle((126, 252, 134, 256), fill=NO); d.point((130, 250), fill=CO); d.point((129, 249), fill=MA)   # fogo
    d.polygon([(40, 296), (62, 296), (60, 299), (42, 299)], fill=FL)        # canoa na beira


BALAO_ALDEIA = (148, 128)                                                   # onde o "!" fica, sobre a casa da familia, no fundo_aldeia


def cena_polo(d, rnd, barco_x=150, equipe=True):
    """o polo-base na beira do rio: predio com a cruz, antena, caixa d'agua, trapiche e, se pedir, a equipe e o barco"""
    d.rectangle((0, 0, W - 1, H - 1), fill=FO)
    for _ in range(320):
        x, y = rnd.randint(-4, W + 4), rnd.randint(96, 150)
        tree(d, x, y, rnd.choice((3, 4, 5)))
    for _ in range(200):
        x, y = rnd.randint(-4, W + 4), rnd.randint(250, H + 4)
        tree(d, x, y, rnd.choice((3, 4, 5, 6)))
    # rio
    d.rectangle((0, 184, W - 1, 250), fill=SA)
    d.line((0, 184, W - 1, 184), fill=FL); d.line((0, 250, W - 1, 250), fill=FL)
    for _ in range(80):
        y = rnd.randint(188, 246); x = rnd.randint(0, W - 5)
        d.line((x, y, x + 3, y), fill=PA)
    d.rectangle((0, 176, W - 1, 183), fill=PA); dither(d, (0, 176, W - 1, 183), SA)
    # clareira do polo
    d.rectangle((30, 118, 190, 176), fill=PA); dither(d, (30, 118, 190, 176), SA)
    # predio do polo-base
    d.rectangle((56, 124, 160, 166), fill=NO)
    d.rectangle((57, 125, 159, 165), fill=PA)
    d.rectangle((57, 125, 159, 137), fill=FO)
    for x in range(60, 156, 10):
        d.rectangle((x, 142, x + 5, 150), fill=SA, outline=NO)
    d.rectangle((102, 148, 114, 165), fill=FO)
    cruz(d, 60, 139, 11)
    # antena
    d.line((168, 170, 168, 112), fill=NO); d.line((164, 118, 172, 118), fill=NO); d.line((165, 126, 171, 126), fill=NO)
    d.point((168, 111), fill=CO)
    # caixa d'agua
    d.rectangle((38, 140, 50, 150), fill=SA, outline=NO); d.line((40, 150, 40, 166), fill=NO); d.line((48, 150, 48, 166), fill=NO)
    # equipe na porta
    if equipe:
        for k, (cab, roupa) in enumerate(((NO, PA), (FL, PA), (NO, SA), (FO, MA), (NO, SA))):
            sprite(d, 62 + k * 20, 168, MINI, {'h': cab, 'X': roupa}, sc=2)
    # trapiche e barco chegando
    for x in range(100, 120, 4):
        d.rectangle((x, 180, x + 2, 196), fill=FL)
    d.rectangle((98, 180, 122, 183), fill=PA, outline=NO)
    if barco_x is not None:
        barco(d, barco_x, 214)
    palmeira(d, 22, 176, 18); palmeira(d, 200, 174, 14)


def cena_ubs_dentro(d, rnd):
    """a UBS vista de cima, por dentro: recepcao, sala de vacina, consultorio, curativo, farmacia, sala da equipe e voce no corredor"""
    grass(d, (0, 0, W - 1, H - 1), 8, 0.5)
    # calcada em volta
    d.rectangle((6, 104, 210, 256), fill=PA); dither(d, (6, 104, 210, 256), SA)
    d.rectangle((10, 108, 206, 252), fill=NO)
    d.rectangle((11, 109, 205, 251), fill=PA)
    for y in range(109, 251, 2):
        for x in range(11 + (y // 2) % 2, 205, 2):
            d.point((x, y), fill=SA)
    # corredor
    d.rectangle((11, 174, 205, 186), fill=SA)
    for x in range(11, 205, 2):
        d.point((x, 180), fill=PA)
    # paredes das salas
    xs = (11, 76, 141, 205)
    for x in xs:
        d.line((x, 109, x, 251), fill=NO)
    d.line((11, 173, 205, 173), fill=NO); d.line((11, 187, 205, 187), fill=NO)
    for i in range(3):                                   # portas
        cx = (xs[i] + xs[i + 1]) // 2
        d.rectangle((cx - 3, 173, cx + 3, 173), fill=SA); d.rectangle((cx - 3, 187, cx + 3, 187), fill=SA)
    # recepcao
    d.rectangle((16, 128, 50, 136), fill=FO); d.rectangle((16, 136, 50, 140), fill=FL)
    for x in (56, 64):
        d.rectangle((x, 150, x + 5, 155), fill=SA, outline=NO)
    sprite(d, 28, 115, MINI, {'h': NO, 'X': SA})
    sprite(d, 56, 158, DOT, {'X': PA}); sprite(d, 66, 158, DOT, {'X': FO})
    # vacina
    d.rectangle((82, 114, 96, 136), fill=SA, outline=NO); d.rectangle((84, 116, 94, 124), fill=PA); d.point((93, 128), fill=NO)   # geladeira
    d.rectangle((110, 140, 134, 150), fill=PA, outline=NO); d.rectangle((110, 140, 116, 150), fill=SA)                               # maca
    sprite(d, 100, 146, MINI, {'h': FO, 'X': MA})
    d.rectangle((120, 128, 126, 132), fill=MA, outline=NO)                                                                           # caixa de vacina
    # consultorio
    d.rectangle((150, 126, 176, 134), fill=FO); d.rectangle((150, 134, 176, 138), fill=FL)                                            # mesa
    d.rectangle((182, 112, 198, 124), fill=PA, outline=NO); d.rectangle((182, 112, 188, 124), fill=SA)                               # maca
    sprite(d, 156, 112, MINI, {'h': FL, 'X': PA}); sprite(d, 170, 142, DOT, {'X': FO})
    # curativo
    d.rectangle((18, 200, 46, 212), fill=PA, outline=NO); d.rectangle((18, 200, 26, 212), fill=SA)
    d.rectangle((50, 220, 60, 232), fill=SA, outline=NO)                                                                              # carrinho
    sprite(d, 30, 216, MINI, {'h': NO, 'X': MA}); d.rectangle((40, 206, 43, 209), fill=CO)
    # farmacia
    for yy in (196, 206, 216):
        d.rectangle((82, yy, 134, yy + 6), fill=FO)
        for x in range(84, 132, 6):
            d.rectangle((x, yy + 1, x + 3, yy + 4), fill=rnd.choice((MA, PA, SA)))
    d.rectangle((82, 232, 134, 238), fill=FO); d.rectangle((82, 238, 134, 241), fill=FL)
    sprite(d, 104, 221, MINI, {'h': NO, 'X': PA})
    # sala da equipe
    d.rectangle((158, 206, 190, 222), fill=FO); d.rectangle((158, 222, 190, 226), fill=FL)
    for k, (x, y, cab, roupa) in enumerate(((150, 198, NO, MA), (162, 196, FO, MA), (176, 196, NO, SA), (188, 198, FL, PA))):
        sprite(d, x, y, DOT, {'X': roupa})
    sprite(d, 170, 230, MINI, {'h': NO, 'X': SA})
    # voce, no corredor
    sprite(d, 60, 172, MINI, {'h': NO, 'X': PA}, sc=2)
    d.line((82, 184, 150, 184), fill=NO); d.point((150, 184), fill=MA)
    # fachada
    d.rectangle((88, 254, 128, 262), fill=FO, outline=NO); tiny(d, 98, 256, 'UBS', PA)
    cruz(d, 128, 253, 9)


def cena_adscricao(d, rnd):
    """o bairro dividido entre duas UBS: a sua (a do endereco) e a mais perto, de outra area; devolve onde fica a sua casa"""
    grass(d, (0, 0, W - 1, H - 1), 7, 0.6)
    road_h(d, 160, 170); road_h(d, 236, 246); road_v(d, 116, 126, 100, H - 1)
    for a, b in ((161, 169), (237, 245)):
        d.rectangle((117, a, 125, b), fill=PA)
    casa = (52, 196)
    for y in (112, 136, 182, 206, 256, 280, 304, 330):
        for x in range(6, W - 14, 22):
            if 100 <= x <= 132 or (x, y) == casa:
                continue
            house_top(d, x + rnd.randint(-1, 1), y, 14, 12, rnd.choice((FO, FL, PA, FO)))
    dither(d, (0, 250, W - 1, H - 1), SA, 1)
    dashed(d, [(121, 100), (121, H - 1)], NO, on=4, off=3, w=2)
    def ubs(x, y, cinza):
        cor = SA if cinza else FO
        d.rectangle((x - 1, y - 1, x + 30, y + 22), fill=FO if cinza else NO)
        d.rectangle((x, y, x + 29, y + 21), fill=PA); d.rectangle((x, y, x + 29, y + 6), fill=cor)
        cruz(d, x + 10, y + 9, 9, cor=cor, fundo=PA if cinza else SA)
        if cinza:
            dither(d, (x, y, x + 29, y + 21), SA)
    ubs(134, 184, True)
    ubs(14, 118, False)
    hx, hy = casa
    house_top(d, hx, hy, 14, 12, FO, hi=True)
    dashed(d, [(hx + 7, hy - 3), (hx + 7, 176), (30, 176), (30, 143)], NO, on=3, off=2, w=2)
    d.line((hx + 16, hy + 5, 130, hy + 5), fill=SA)
    d.line((110, hy, 118, hy + 10), fill=CO, width=2); d.line((118, hy, 110, hy + 10), fill=CO, width=2)
    return casa


def fundo_tela(d, rnd):
    """fundo Floresta com pontinhos Folha (tela de menu)"""
    d.rectangle((0, 0, W - 1, H - 1), fill=FL)
    for y in range(0, H, 6):
        for x in range((y // 6) % 2 * 3, W, 6):
            d.point((x, y), fill=FO)
