#!/usr/bin/env python3
# PRESEME · motor de pixel art · os papeis: o texto aparece escrito num objeto de verdade que sobe do pe da tela
# (caderneta, prancheta, prontuario, relatorio, legenda do mapa, caderno, ficha de atendimento, bilhete, cartao) e a folha da Nota.
# Saiu de reel_papel.py do reel "A casa 12" (14/11/2026), sem mudar nenhum traco. Papel novo: uma funcao p_<nome>(d, nivel, nome, **k)
# que desenha o fundo e devolve (x, y, largura) de onde o texto comeca, posta em FUNDO.
import re
from PIL import Image, ImageDraw
import letras as L
from nucleo import FL, PA, MA, CO, SA, FO, NO

REC = (40, 1090, 1070, 1790)        # o recorte da tela onde moram os papeis
YMAX = 1572                         # abaixo disto e interface do Instagram: papel pode, texto nao
AVISOS = []


def partes(texto):
    """'chamada *MICROAREA*.' -> palavras com a marca de destaque e a de 'colada na anterior' (o ponto depois do destaque)"""
    out, hl, espaco = [], False, True
    for pedaco in re.split(r'(\*)', texto):
        if pedaco == '*':
            hl = not hl; continue
        if not pedaco:
            continue
        for k, w in enumerate(pedaco.split()):
            out.append((w, hl, k == 0 and not espaco and not pedaco[0].isspace()))
        espaco = pedaco[-1].isspace()
    return out


def quebra(texto, size, w, peso=500):
    f, fb = L.fonte(size, peso), L.fonte(size, 700); esp = L._m.textlength(' ', font=f); atomos = []
    for (p, hl, cola) in partes(texto):
        lw = L.tlen(L._m, p, fb if hl else f)
        if cola and atomos:
            atomos[-1][0].append((p, hl, lw)); atomos[-1][1] += lw
        else:
            atomos.append([[(p, hl, lw)], lw])
    linhas, cur, cw = [], [], 0
    for toks, aw in atomos:
        if cur and cw + esp + aw > w:
            linhas.append(cur); cur, cw = [], 0
        cw += (esp if cur else 0) + aw; cur.append(toks)
    if cur:
        linhas.append(cur)
    return linhas, esp


def largura(linha, esp):
    return sum(lw for toks in linha for (_, _, lw) in toks) + esp * (len(linha) - 1)


def escreve(d, x, y, linha, size, esp, cor=FL, peso=500):
    f, fb = L.fonte(size, peso), L.fonte(size, 700)
    for toks in linha:
        for (p, hl, lw) in toks:
            if hl:
                d.rectangle((x - 6, y + 5, x + lw + 6, y + size + 9), fill=MA); L.txt(d, x, y, p, fb, NO)
            else:
                L.txt(d, x, y, p, f, cor)
            x += lw
        x += esp


def _base(d, box, cor=PA, sombra=12):
    x0, y0, x1, y1 = box
    d.rectangle((x0 + sombra, y0 + sombra, x1 + sombra, y1 + sombra), fill=NO); d.rectangle(box, fill=cor, outline=NO, width=5)


def _cab(d, x, y, nivel, nome, cor=FO):
    f = L.fonte(34, 700); w = L.tlen(d, nivel, f)
    d.rectangle((x - 8, y + 2, x + w + 8, y + 46), fill=MA); L.txt(d, x, y, nivel, f, NO)
    if nome:
        L.txt(d, x + w + 24, y + 8, '· ' + nome, L.fonte(26, 600), cor)


def p_caderneta(d, nivel, nome, **k):
    _base(d, (150, 1184, 960, 1770)); d.rectangle((150, 1184, 960, 1246), fill=FO, outline=NO, width=5); _cab(d, 226, 1192, nivel, nome, PA)
    for y in (1290, 1400, 1510):                              # os grampos da lombada
        d.rectangle((168, y, 180, y + 40), fill=NO); d.rectangle((171, y + 3, 177, y + 37), fill=SA)
    L.txt(d, 226, 1256, 'VACINA', L.fonte(24, 700), FO); L.txt(d, 700, 1256, 'DATA', L.fonte(24, 700), FO)
    for i in range(3):                                        # tracos no lugar dos nomes: duas doses com data e visto, a terceira sem data
        y = 1292 + 44 * i; d.line((226, y + 40, 920, y + 40), fill=SA, width=2)
        d.rectangle((226, y + 12, 226 + (150, 190, 170)[i], y + 26), fill=SA); d.rectangle((450, y + 12, 450 + (90, 110, 70)[i], y + 26), fill=SA)
        if i < 2:
            d.rectangle((700, y + 12, 800, y + 26), fill=FO)
            d.line((836, y + 20, 846, y + 30), fill=FO, width=5); d.line((846, y + 30, 866, y + 8), fill=FO, width=5)
        else:
            d.ellipse((676, y - 4, 904, y + 40), outline=CO, width=6)
    return 226, 1440, 694


def p_prancheta(d, nivel, nome, **k):
    _base(d, (130, 1184, 990, 1770), cor=FO); d.rectangle((156, 1204, 964, 1770), fill=PA, outline=NO, width=4)
    d.rectangle((430, 1154, 690, 1214), fill=NO); d.rectangle((446, 1168, 674, 1200), fill=SA); d.rectangle((524, 1142, 596, 1168), fill=NO)   # o clipe
    _cab(d, 196, 1224, nivel, nome); d.line((196, 1280, 924, 1280), fill=FO, width=3)
    return 196, 1292, 730


def p_prontuario(d, nivel, nome, **k):
    d.rectangle((362, 1152, 812, 1212), fill=NO)
    _base(d, (130, 1196, 990, 1770)); d.rectangle((350, 1140, 800, 1201), fill=FO, outline=NO, width=5); _cab(d, 378, 1148, nivel, nome, PA)
    d.rectangle((135, 1201, 985, 1214), fill=SA)
    return 176, 1240, 750


def p_relatorio(d, nivel, nome, grafico=False, **k):
    _base(d, (110, 1184, 1000, 1770)); d.rectangle((110, 1184, 1000, 1246), fill=FL, outline=NO, width=5)
    L.txt(d, 140, 1196, 'SECRETARIA MUNICIPAL DE SAÚDE', L.fonte(30, 700), PA); _cab(d, 150, 1264, nivel, nome)
    if grafico:                                               # a cobertura de cada area, em barrinhas (a quarta, baixa)
        for i, cob in enumerate((5, 4, 4, 2, 5)):
            x = 640 + i * 58; d.rectangle((x, 1258, x + 44, 1314), outline=SA, width=3)
            d.rectangle((x + 6, 1310 - cob * 10, x + 38, 1310), fill=CO if cob <= 2 else FO)
    return 150, 1330, 780


def p_mapa(d, nivel, nome, **k):
    _base(d, (130, 1184, 990, 1770))
    for x in (417, 703):                                      # as dobras do mapa, tracejadas para nao riscar o texto
        for y in range(1192, 1770, 18):
            d.line((x, y, x, y + 5), fill=SA, width=3)
    for x in range(138, 985, 18):
        d.line((x, 1592, x + 5, 1592), fill=SA, width=3)
    _cab(d, 166, 1204, nivel, nome)
    cx, cy = 898, 1232                                        # a rosa dos ventos
    d.polygon([(cx, cy - 26), (cx - 9, cy), (cx + 9, cy)], fill=FO); d.polygon([(cx, cy + 26), (cx - 9, cy), (cx + 9, cy)], fill=SA, outline=FO)
    d.polygon([(cx - 26, cy), (cx, cy - 7), (cx, cy + 7)], fill=SA, outline=FO); d.polygon([(cx + 26, cy), (cx, cy - 7), (cx, cy + 7)], fill=SA, outline=FO)
    return 166, 1272, 764


def p_caderno(d, nivel, nome, **k):
    _base(d, (150, 1200, 960, 1770))
    for y in range(1338, 1770, 48):                           # a pauta
        d.line((180, y, 930, y), fill=SA, width=2)
    for x in range(190, 930, 56):                             # a espiral
        d.rectangle((x, 1178, x + 14, 1226), fill=NO); d.rectangle((x + 3, 1182, x + 11, 1222), fill=SA)
    _cab(d, 190, 1238, nivel, nome)
    return 190, 1294, 730


def p_polo(d, nivel, nome, **k):
    _base(d, (130, 1184, 990, 1770)); d.rectangle((130, 1184, 990, 1246), fill=FO, outline=NO, width=5)
    d.rectangle((150, 1194, 192, 1236), fill=PA, outline=NO, width=3); d.rectangle((166, 1200, 176, 1230), fill=FO); d.rectangle((156, 1210, 186, 1220), fill=FO)
    _cab(d, 218, 1192, nivel, nome, PA)
    return 166, 1270, 764


def p_bilhete(d, nivel, nome, fim=1322, **k):
    y1 = max(1344, fim + 24)                                  # o bilhete cresce com o texto
    d.rectangle((140, 1206, 960, y1 + 10), fill=NO); d.rectangle((130, 1196, 950, y1), fill=MA, outline=NO, width=5)
    d.rectangle((486, 1176, 594, 1210), fill=SA, outline=NO, width=3)   # a fita
    return 166, 1222, 750


def p_cartao(d, nivel, nome, brasao=None, **k):
    _base(d, (110, 1190, 970, 1500)); d.rectangle((126, 1206, 954, 1484), outline=FO, width=4)
    if brasao is not None:
        d._image.paste(brasao, (156, 1230), brasao)
    return 290, 1240, 630


FUNDO = dict(caderneta=p_caderneta, prancheta=p_prancheta, prontuario=p_prontuario, relatorio=p_relatorio, mapa=p_mapa, caderno=p_caderno,
             polo=p_polo, bilhete=p_bilhete, cartao=p_cartao)
ESTILO = dict(bilhete=dict(cor=NO, peso=700, sizes=((44, 58), (40, 53), (36, 48))), cartao=dict(cor=FL, peso=600, sizes=((38, 52), (34, 46))))
PADRAO = dict(cor=FL, peso=500, sizes=((44, 58), (40, 53), (36, 48), (34, 45), (32, 42), (30, 39)))
_geo = {}


def geo(tipo):
    """onde o texto comeca em cada papel, e a largura que ele tem"""
    if tipo not in _geo:
        _geo[tipo] = FUNDO[tipo](ImageDraw.Draw(Image.new('RGBA', (1080, 1920))), '', '')
    return _geo[tipo]


def monta(tipo, nivel, nome, fala='', lista=None, colunas=1, **extra):
    """o papel pronto: 'bg' (fundo), 'txt' (o texto inteiro), 'linhas' (faixas y0-y1 na ordem em que se escrevem) e 'caixas' (da lista)"""
    tx, ty, tw = geo(tipo); est = ESTILO.get(tipo, PADRAO)
    for size, lh in est['sizes']:                             # a maior letra que couber
        ls, esp = quebra(fala, size, tw, est['peso']) if fala else ([], 0); itens, y = [], ty + lh * len(ls) + (6 if ls and lista else 0)
        col = 0; cw = (tw - 30) // 2 if colunas == 2 else tw
        for it in (lista or []):
            li, e2 = quebra(it, size - 2, cw - 46)
            if colunas == 2 and len(li) == 1 and largura(li[0], e2) <= cw - 46:
                itens.append((tx + col * (cw + 30), y, li, e2)); col += 1
                if col == 2:
                    col = 0; y += lh - 2
            else:
                if col:
                    col = 0; y += lh - 2
                li, e2 = quebra(it, size - 2, tw - 46); itens.append((tx, y, li, e2)); y += (lh - 2) * len(li)
        if col:
            y += lh - 2
        if y <= YMAX:
            break
    else:
        AVISOS.append('NAO COUBE (%s): %s' % (tipo, fala[:40]))
    tela = Image.new('RGBA', (1080, 1920), (0, 0, 0, 0)); d = ImageDraw.Draw(tela); d.fontmode = '1'; FUNDO[tipo](d, nivel, nome, fim=y, **extra)
    txt = Image.new('RGBA', (1080, 1920), (0, 0, 0, 0)); dt = ImageDraw.Draw(txt); dt.fontmode = '1'; faixas, caixas = [], []
    for i, l in enumerate(ls):
        escreve(dt, tx, ty + lh * i, l, size, esp, est['cor'], est['peso']); faixas.append((ty + lh * i - REC[1], ty + lh * (i + 1) - REC[1]))
    for (ix, iy, li, e2) in itens:
        dt.rectangle((ix, iy + 8, ix + 28, iy + 36), fill=PA, outline=NO, width=3); caixas.append((ix, iy + 8))
        for j, l in enumerate(li):
            escreve(dt, ix + 44, iy + (lh - 2) * j, l, size - 2, e2, est['cor'])
        if not faixas or faixas[-1][0] != iy - REC[1]:
            faixas.append((iy - REC[1], iy + (lh - 2) * len(li) - REC[1]))
    return dict(bg=tela.crop(REC), txt=txt.crop(REC), linhas=faixas, caixas=caixas, size=size, tipo=tipo, fim=y, tx=tx - REC[0], tw=tw)


def visto(d, x, y):
    d.rectangle((x, y, x + 28, y + 28), fill=MA, outline=NO, width=3)
    d.line((x + 6, y + 14, x + 12, y + 21), fill=NO, width=3); d.line((x + 12, y + 21, x + 23, y + 6), fill=NO, width=3)


def nota(p, brasao=None):
    """a folha da Nota: o brasao em ponto (se houver), o titulo e o texto (com destaque); devolve a folha e a altura onde o texto acaba
    (o carimbo bate abaixo)"""
    if brasao is None:                                        # sem brasao: o titulo ocupa o lugar dele, na mesma altura
        brasao = Image.new('RGBA', (1, 132), (0, 0, 0, 0))
    wc, size, lh = 880, 40, 54; ls, esp = quebra(p['texto'], size, wc - 100, 600)
    y0 = 40 + brasao.height + 30; h = y0 + lh * len(ls) + 250
    im = Image.new('RGBA', (wc + 12, h + 12), (0, 0, 0, 0)); d = ImageDraw.Draw(im); d.fontmode = '1'
    d.rectangle((12, 12, wc + 11, h + 11), fill=NO); d.rectangle((0, 0, wc - 1, h - 1), fill=PA, outline=NO, width=5)
    im.paste(brasao, (40, 36), brasao); xt = 40 + brasao.width + 32; ym = 36 + brasao.height // 2
    L.txt(d, xt, ym - 52, p['titulo'], L.fonte(72, 700), FO); d.rectangle((xt, ym + 44, wc - 41, ym + 48), fill=FO)
    for i, l in enumerate(ls):
        escreve(d, 40, y0 + lh * i, l, size, esp, NO, 600)
    return im, y0 + lh * len(ls)
