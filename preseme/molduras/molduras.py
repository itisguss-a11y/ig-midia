#!/usr/bin/env python3
"""PRESEME · molduras para fotos (Frente D, noite de 15 para 16/11/2026).

Seis molduras para quem posta fotos no @iescufrr (pedido dele de 13/11, ficha seção 1, Molduras):
3 ocasiões (vivência na UBS, atividade na faculdade, evento ou ação de saúde) x 2 formatos
(feed 1080 x 1350 e story 1080 x 1920), nas seis cores da paleta, sem o nome do perfil e sem brasão.

O que sai, em <saida> (padrão: ./out):
  png/<id>.png            a moldura, com a janela da foto transparente e sem texto
  png/<id>-lembrete.png   camada separada: só a nota do lembrete (o resto é transparente)
  pdf/<id>.pdf            moldura + linha de texto + lembrete, em vetor (teste de importação no Canva)
  exemplos/<id>-exemplo.jpg  a moldura sobre a foto de exemplo, com o texto de exemplo
  molduras-folha*.jpg     a folha de prévia (as seis numa imagem)
  molduras-camadas.jpg    as três camadas de um modelo, lado a lado
  canva-camadas.json      posição e tamanho de cada camada, para montar no Canva

Uso:  python3 -I molduras.py [--saida PASTA] [--folha NOME.jpg]
A conferência roda sozinha no fim e diz "0 problemas" ou lista cada um.
"""
import json
import math
import os
import re
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

# ---------------------------------------------------------------- paleta e letras
P = {
    'floresta': '#17402C', 'papel': '#F4EDDF', 'marca': '#E4EB6C', 'coral': '#F16D4D',
    'salvia': '#B5D8C0', 'folha': '#30724E', 'noite': '#072618',
}
PALETA = {v.upper() for v in P.values()}
NOME_COR = {v.upper(): k for k, v in P.items()}

FONTES = os.path.expanduser('~/.fonts')
ARQ_FONTE = {
    'Instrument Sans': os.path.join(FONTES, 'InstrumentSans%5Bwdth,wght%5D.ttf'),
    'Kalam': os.path.join(FONTES, 'Kalam-Bold.ttf'),
    'Kalam Regular': os.path.join(FONTES, 'Kalam-Regular.ttf'),
}

LEMBRETE = 'Lembrete: só com autorização de quem aparece, e nenhum paciente na foto.'
LEMBRETE_2 = 'apague esta nota antes de postar'

# texto em fundo: pares permitidos pela ficha (texto pequeno)
CLAROS = {'papel', 'salvia', 'marca'}
PARES_OK = {(t, f) for t in ('floresta', 'noite') for f in CLAROS} | \
           {(t, 'floresta') for t in ('papel', 'marca', 'salvia')}

# áreas que o Instagram cobre no story (topo e base)
STORY_TOPO, STORY_BASE = 250, 1650


# ---------------------------------------------------------------- geometria
def rot(px, py, cx, cy, ang):
    a = math.radians(ang)
    c, s = math.cos(a), math.sin(a)
    dx, dy = px - cx, py - cy
    return cx + dx * c - dy * s, cy + dx * s + dy * c


def rrect_d(cx, cy, w, h, r, ang=0.0):
    """Retângulo de cantos redondos (girado em volta do centro) como caminho SVG."""
    x0, y0, x1, y1 = cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2
    passos = [('M', x0 + r, y0), ('L', x1 - r, y0), ('A', x1, y0 + r), ('L', x1, y1 - r),
              ('A', x1 - r, y1), ('L', x0 + r, y1), ('A', x0, y1 - r), ('L', x0, y0 + r),
              ('A', x0 + r, y0)]
    out = []
    for cmd, x, y in passos:
        X, Y = rot(x, y, cx, cy, ang)
        out.append(f'A {r:.2f} {r:.2f} 0 0 1 {X:.2f} {Y:.2f}' if cmd == 'A' else f'{cmd} {X:.2f} {Y:.2f}')
    return ' '.join(out) + ' Z'


def poli_d(pts):
    return 'M ' + ' L '.join(f'{x:.1f} {y:.1f}' for x, y in pts) + ' Z'


def fita_d(cx, cy, L, T, ang, dentes=5):
    """Pedaço de fita adesiva com as pontas picotadas."""
    x0, x1, y0, y1 = cx - L / 2, cx + L / 2, cy - T / 2, cy + T / 2
    pts = [(x0, y0), (x1, y0)]
    n = dentes * 2
    for i in range(1, n):
        pts.append((x1 + (6 if i % 2 else -6), y0 + (y1 - y0) * i / n))
    pts += [(x1, y1), (x0, y1)]
    for i in range(1, n):
        pts.append((x0 + (-6 if i % 2 else 6), y1 - (y1 - y0) * i / n))
    return poli_d([rot(x, y, cx, cy, ang) for x, y in pts])


def estrela_d(cx, cy, R, r, pontas=5, ang=-90.0):
    pts = []
    for i in range(pontas * 2):
        a = math.radians(ang + i * 180 / pontas)
        rad = R if i % 2 == 0 else r
        pts.append((cx + rad * math.cos(a), cy + rad * math.sin(a)))
    return poli_d(pts)


def casa(cx, cy, cor, porta, k=1.0):
    return (f'<path d="M {cx - 18 * k:.1f} {cy - 2 * k:.1f} L {cx:.1f} {cy - 20 * k:.1f} L {cx + 18 * k:.1f} {cy - 2 * k:.1f} Z" fill="{cor}"/>'
            f'<rect x="{cx - 13 * k:.1f}" y="{cy - 3 * k:.1f}" width="{26 * k:.1f}" height="{22 * k:.1f}" fill="{cor}"/>'
            f'<rect x="{cx - 4 * k:.1f}" y="{cy + 7 * k:.1f}" width="{8 * k:.1f}" height="{12 * k:.1f}" fill="{porta}"/>')


def pino(cx, cy, R, cor, miolo):
    tip = cy + 1.9 * R
    d = (f'M {cx:.1f} {tip:.1f} C {cx - 0.45 * R:.1f} {cy + 1.25 * R:.1f} {cx - R:.1f} {cy + 0.75 * R:.1f} '
         f'{cx - R:.1f} {cy:.1f} A {R} {R} 0 1 1 {cx + R:.1f} {cy:.1f} C {cx + R:.1f} {cy + 0.75 * R:.1f} '
         f'{cx + 0.45 * R:.1f} {cy + 1.25 * R:.1f} {cx:.1f} {tip:.1f} Z')
    return f'<path d="{d}" fill="{cor}"/><circle cx="{cx}" cy="{cy}" r="{R * 0.38:.1f}" fill="{miolo}"/>'


def confete(x, y, tipo, cor, ang, esc=1.0):
    if tipo == 0:
        return f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{11 * esc:.1f}" fill="{cor}"/>'
    if tipo == 1:
        pts = [rot(x + 15 * esc * math.cos(math.radians(a)), y + 15 * esc * math.sin(math.radians(a)), x, y, ang)
               for a in (-90, 30, 150)]
        return f'<path d="{poli_d(pts)}" fill="{cor}"/>'
    if tipo == 2:
        L = 22 * esc
        p0 = rot(x - L, y, x, y, ang); p1 = rot(x - L / 2, y - 10 * esc, x, y, ang)
        p2 = rot(x, y, x, y, ang); p3 = rot(x + L / 2, y + 10 * esc, x, y, ang); p4 = rot(x + L, y, x, y, ang)
        return (f'<path d="M {p0[0]:.1f} {p0[1]:.1f} Q {p1[0]:.1f} {p1[1]:.1f} {p2[0]:.1f} {p2[1]:.1f} '
                f'Q {p3[0]:.1f} {p3[1]:.1f} {p4[0]:.1f} {p4[1]:.1f}" fill="none" stroke="{cor}" '
                f'stroke-width="{6 * esc:.1f}" stroke-linecap="round"/>')
    a, b = rot(x - 12 * esc, y, x, y, ang), rot(x + 12 * esc, y, x, y, ang)
    c, d = rot(x, y - 12 * esc, x, y, ang), rot(x, y + 12 * esc, x, y, ang)
    return (f'<path d="M {a[0]:.1f} {a[1]:.1f} L {b[0]:.1f} {b[1]:.1f} M {c[0]:.1f} {c[1]:.1f} L {d[0]:.1f} {d[1]:.1f}" '
            f'stroke="{cor}" stroke-width="{6 * esc:.1f}" stroke-linecap="round"/>')


def borda_janela(j, cor, larg):
    return (f'<path d="{rrect_d(j["cx"], j["cy"], j["w"], j["h"], j["r"], j["ang"])}" fill="none" '
            f'stroke="{cor}" stroke-width="{larg}"/>')


# ---------------------------------------------------------------- os seis modelos
def m_vivencia_feed():
    W, H = 1080, 1350
    j = dict(cx=540, cy=580, w=952, h=1032, r=30, ang=0)
    f = [f'<rect width="{W}" height="{H}" fill="{P["floresta"]}"/>',
         # a rota da visita, tracejada em volta da foto
         f'<path d="{rrect_d(540, 580, 996, 1076, 52)}" fill="none" stroke="{P["marca"]}" stroke-width="8" '
         f'stroke-dasharray="26 18" stroke-linecap="round"/>',
         f'<path d="M 92 1122 V 1176" fill="none" stroke="{P["marca"]}" stroke-width="8" '
         f'stroke-dasharray="14 14" stroke-linecap="round"/>']
    for cx, cy in ((300, 40), (780, 40), (1038, 430), (42, 760)):
        f.append(f'<circle cx="{cx}" cy="{cy}" r="33" fill="{P["floresta"]}"/>')
        f.append(casa(cx, cy + 1, P['papel'], P['folha'], 1.3))
    # placa de rua (o lugar do texto) e o pino de chegada
    f.append(f'<rect x="140" y="1164" width="870" height="126" rx="14" fill="{P["papel"]}"/>')
    f.append(f'<rect x="150" y="1174" width="850" height="106" rx="8" fill="none" stroke="{P["floresta"]}" stroke-width="4"/>')
    f.append(pino(92, 1206, 26, P['coral'], P['floresta']))
    texto = dict(x=184, box=(150, 1174, 1000, 1280), alinhamento='start', fonte='Instrument Sans', peso=600,
                 tam=46, cor='floresta', fundo='papel', exemplo='Visita com a ACS · 13/11')
    return dict(id='1-vivencia-feed', ocasiao='Vivência na UBS', formato='feed', estilo='rota da visita',
                W=W, H=H, janela=j, fundo=''.join(f), frente='', texto=texto)


def m_vivencia_story():
    W, H = 1080, 1920
    j = dict(cx=540, cy=870, w=900, h=1140, r=36, ang=0)
    s, rua = P['salvia'], 18
    f = [f'<rect width="{W}" height="{H}" fill="{P["papel"]}"/>']
    ruas = ['M 0 170 H 1080', 'M 250 0 V 300', 'M 620 0 V 300', 'M 930 0 V 170',
            'M 0 1660 H 1080', 'M 0 1850 H 1080', 'M 180 1440 V 1920', 'M 560 1440 V 1920', 'M 880 1440 V 1920',
            'M 45 0 V 1920', 'M 1035 0 V 1920', 'M 0 620 H 90', 'M 990 1180 H 1080']
    for d in ruas:
        f.append(f'<path d="{d}" fill="none" stroke="{s}" stroke-width="{rua}"/>')
    f.append(f'<path d="M -20 1770 C 200 1712 420 1836 640 1774 S 960 1700 1100 1748" fill="none" '
             f'stroke="{s}" stroke-width="44" stroke-linecap="round"/>')
    # rota tracejada: do pino até a etiqueta, pela rua de cima e pela margem esquerda
    f.append(f'<path d="M 985 290 V 170 H 45 V 1556 H 108" fill="none" stroke="{P["floresta"]}" stroke-width="7" '
             f'stroke-dasharray="22 14" stroke-linecap="round" stroke-linejoin="round"/>')
    # etiqueta (o lugar do texto)
    f.append(f'<rect x="110" y="1500" width="860" height="112" rx="56" fill="{P["floresta"]}"/>')
    f.append(f'<circle cx="160" cy="1556" r="12" fill="{P["papel"]}"/>')
    # o pino fica abaixo da faixa que o Instagram cobre no topo do story (até uns 250 px)
    frente = borda_janela(j, P['floresta'], 10) + pino(985, 334, 44, P['coral'], P['papel'])
    texto = dict(x=196, box=(110, 1500, 970, 1612), alinhamento='start', fonte='Instrument Sans', peso=600,
                 tam=44, cor='papel', fundo='floresta', exemplo='Visita com a ACS · 13/11')
    return dict(id='2-vivencia-story', ocasiao='Vivência na UBS', formato='story', estilo='mapa do território',
                W=W, H=H, janela=j, fundo=''.join(f), frente=frente, texto=texto)


def m_faculdade_feed():
    W, H = 1080, 1350
    j = dict(cx=556, cy=590, w=900, h=1010, r=10, ang=-2.2)
    f = [f'<rect width="{W}" height="{H}" fill="{P["papel"]}"/>']
    for y in range(118, H, 52):
        f.append(f'<path d="M 0 {y} H {W}" stroke="{P["salvia"]}" stroke-width="3"/>')
    f.append(f'<path d="M 92 0 V {H}" stroke="{P["coral"]}" stroke-width="4"/>')
    f.append(f'<path d="{rrect_d(j["cx"] + 14, j["cy"] + 18, j["w"], j["h"], j["r"], j["ang"])}" fill="{P["salvia"]}"/>')
    # faixa de marca-texto (o lugar do texto)
    f.append(f'<path d="{rrect_d(512, 1228, 780, 84, 16, -1.0)}" fill="{P["marca"]}"/>')
    tl = rot(j['cx'] - j['w'] / 2, j['cy'] - j['h'] / 2, j['cx'], j['cy'], j['ang'])
    tr = rot(j['cx'] + j['w'] / 2, j['cy'] - j['h'] / 2, j['cx'], j['cy'], j['ang'])
    frente = (borda_janela(j, P['floresta'], 6)
              + f'<path d="{fita_d(tl[0] + 46, tl[1] + 24, 210, 60, -38)}" fill="{P["marca"]}"/>'
              + f'<path d="{fita_d(tr[0] - 46, tr[1] + 24, 210, 60, 36)}" fill="{P["marca"]}"/>'
              + f'<path d="{estrela_d(968, 1232, 30, 13)}" fill="none" stroke="{P["floresta"]}" '
                f'stroke-width="5" stroke-linejoin="round"/>')
    texto = dict(x=150, box=(122, 1186, 902, 1270), alinhamento='start', fonte='Kalam', peso=700,
                 tam=52, cor='floresta', fundo='marca', exemplo='Atividade em grupo · 20 nov')
    return dict(id='3-faculdade-feed', ocasiao='Atividade na faculdade', formato='feed',
                estilo='foto colada no caderno', W=W, H=H, janela=j, fundo=''.join(f), frente=frente, texto=texto)


def m_faculdade_story():
    W, H = 1080, 1920
    j = dict(cx=540, cy=855, w=880, h=1110, r=14, ang=0)
    f = [f'<rect width="{W}" height="{H}" fill="{P["floresta"]}"/>',
         f'<rect x="56" y="196" width="968" height="1494" rx="28" fill="{P["papel"]}"/>']
    for y in range(330, 1680, 56):
        f.append(f'<path d="M 76 {y} H 1004" stroke="{P["salvia"]}" stroke-width="3"/>')
    for i in range(9):
        x = 130 + i * 102.5
        f.append(f'<circle cx="{x:.1f}" cy="236" r="12" fill="{P["floresta"]}"/>')
        f.append(f'<path d="M {x:.1f} 236 V 166" stroke="{P["salvia"]}" stroke-width="10" stroke-linecap="round"/>')
    f.append(f'<path d="{rrect_d(540, 1500, 880, 96, 18, -1.0)}" fill="{P["marca"]}"/>')
    frente = (borda_janela(j, P['floresta'], 8)
              + f'<path d="{estrela_d(968, 1612, 30, 13)}" fill="none" stroke="{P["coral"]}" '
                f'stroke-width="6" stroke-linejoin="round"/>')
    texto = dict(x=130, box=(100, 1452, 980, 1548), alinhamento='start', fonte='Kalam', peso=700,
                 tam=52, cor='floresta', fundo='marca', exemplo='Atividade em grupo · 20 nov')
    return dict(id='4-faculdade-story', ocasiao='Atividade na faculdade', formato='story',
                estilo='caderno de espiral', W=W, H=H, janela=j, fundo=''.join(f), frente=frente, texto=texto)


def m_evento_feed():
    W, H = 1080, 1350
    j = dict(cx=540, cy=580, w=940, h=1020, r=44, ang=0)
    rng = np.random.default_rng(12)
    cores = [P['floresta']] * 4 + [P['coral']] * 3 + [P['folha']] * 2 + [P['papel']]
    evitar = [(70, 70, 1010, 1090), (86, 1140, 994, 1306)]
    f = [f'<rect width="{W}" height="{H}" fill="{P["salvia"]}"/>']
    pos, tent = [], 0
    while len(pos) < 34 and tent < 6000:
        tent += 1
        x, y = rng.uniform(18, W - 18), rng.uniform(18, H - 18)
        if any(x0 - 16 < x < x1 + 16 and y0 - 16 < y < y1 + 16 for x0, y0, x1, y1 in evitar):
            continue
        if any((x - a) ** 2 + (y - b) ** 2 < 48 ** 2 for a, b in pos):
            continue
        pos.append((x, y))
    for x, y in pos:
        f.append(confete(x, y, int(rng.integers(0, 4)), cores[int(rng.integers(0, len(cores)))], float(rng.uniform(0, 360))))
    # faixa (o lugar do texto): pontas, dobras e a faixa
    f.append(f'<path d="{poli_d([(92, 1190), (210, 1190), (210, 1300), (92, 1300), (126, 1245)])}" fill="{P["folha"]}"/>')
    f.append(f'<path d="{poli_d([(988, 1190), (870, 1190), (870, 1300), (988, 1300), (954, 1245)])}" fill="{P["folha"]}"/>')
    f.append(f'<path d="{poli_d([(150, 1270), (210, 1270), (210, 1300)])}" fill="{P["noite"]}"/>')
    f.append(f'<path d="{poli_d([(930, 1270), (870, 1270), (870, 1300)])}" fill="{P["noite"]}"/>')
    f.append(f'<rect x="150" y="1150" width="780" height="120" fill="{P["floresta"]}"/>')
    borda = [(130, 70, 1, P['coral'], 20), (470, 70, 0, P['floresta'], 0), (870, 70, 2, P['floresta'], 30),
             (1010, 330, 1, P['folha'], 70), (1010, 760, 3, P['coral'], 15), (70, 520, 0, P['coral'], 0),
             (70, 930, 2, P['floresta'], 80)]
    frente = borda_janela(j, P['floresta'], 10) + ''.join(confete(x, y, t, c, a, 1.15) for x, y, t, c, a in borda)
    texto = dict(x=540, box=(150, 1150, 930, 1270), alinhamento='middle', fonte='Instrument Sans', peso=700,
                 tam=48, cor='marca', fundo='floresta', exemplo='Ação de saúde na praça · 30/11')
    return dict(id='5-evento-feed', ocasiao='Evento ou ação de saúde', formato='feed', estilo='confete e faixa',
                W=W, H=H, janela=j, fundo=''.join(f), frente=frente, texto=texto)


def m_evento_story():
    W, H = 1080, 1920
    j = dict(cx=540, cy=820, w=840, h=1120, r=20, ang=0)
    f = [f'<rect width="{W}" height="{H}" fill="{P["floresta"]}"/>',
         f'<rect x="70" y="210" width="940" height="1450" rx="34" fill="{P["papel"]}"/>',
         f'<circle cx="70" cy="1430" r="36" fill="{P["floresta"]}"/>',
         f'<circle cx="1010" cy="1430" r="36" fill="{P["floresta"]}"/>',
         f'<path d="M 124 1430 H 956" stroke="{P["floresta"]}" stroke-width="5" stroke-dasharray="16 12"/>',
         f'<circle cx="905" cy="1546" r="48" fill="none" stroke="{P["coral"]}" stroke-width="6"/>',
         f'<path d="{estrela_d(905, 1546, 22, 9)}" fill="{P["coral"]}"/>']
    for x, y, R in ((200, 118, 24), (880, 140, 30), (35, 430, 22), (1045, 650, 26), (35, 1120, 26),
                    (1045, 1310, 22), (300, 1770, 26), (800, 1800, 22)):
        f.append(f'<path d="{estrela_d(x, y, R, R * 0.32, 4)}" fill="{P["marca"]}"/>')
    frente = borda_janela(j, P['floresta'], 8)
    texto = dict(x=150, box=(120, 1470, 840, 1610), alinhamento='start', fonte='Instrument Sans', peso=700,
                 tam=46, cor='floresta', fundo='papel', exemplo='Ação de saúde na praça · 30/11')
    return dict(id='6-evento-story', ocasiao='Evento ou ação de saúde', formato='story', estilo='ingresso',
                W=W, H=H, janela=j, fundo=''.join(f), frente=frente, texto=texto)


MODELOS = [m_vivencia_feed, m_vivencia_story, m_faculdade_feed, m_faculdade_story, m_evento_feed, m_evento_story]


# ---------------------------------------------------------------- letras e medidas
def fonte_pil(nome, peso, tam):
    f = ImageFont.truetype(ARQ_FONTE[nome], tam)
    if nome == 'Instrument Sans':
        f.set_variation_by_axes([100, peso])
    return f


def largura(texto, nome, peso, tam):
    return fonte_pil(nome, peso, tam).getlength(texto)


def quebra(texto, nome, peso, tam, larg):
    linhas, atual = [], ''
    for p in texto.split():
        teste = (atual + ' ' + p).strip()
        if largura(teste, nome, peso, tam) <= larg:
            atual = teste
        else:
            linhas.append(atual)
            atual = p
    if atual:
        linhas.append(atual)
    return linhas


def esc(t):
    return t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


# ---------------------------------------------------------------- camadas em SVG
def svg_abre(W, H):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'


def svg_moldura(m):
    j = m['janela']
    return (svg_abre(m['W'], m['H'])
            + '<defs><mask id="janela" maskUnits="userSpaceOnUse" x="0" y="0" '
              f'width="{m["W"]}" height="{m["H"]}"><rect width="{m["W"]}" height="{m["H"]}" fill="#FFFFFF"/>'
              f'<path d="{rrect_d(j["cx"], j["cy"], j["w"], j["h"], j["r"], j["ang"])}" fill="#000000"/></mask></defs>'
            + f'<g mask="url(#janela)">{m["fundo"]}</g>{m["frente"]}')


def svg_texto(m, texto=None):
    t = m['texto']
    texto = texto if texto is not None else t['exemplo']
    x0, y0, x1, y1 = t['box']
    base = (y0 + y1) / 2 + t['tam'] * (0.36 if t['fonte'] == 'Instrument Sans' else 0.30)
    familia = 'Kalam' if t['fonte'] == 'Kalam' else 'Instrument Sans'
    return (f'<text x="{t["x"]}" y="{base:.1f}" font-family="{familia}" font-weight="{t["peso"]}" '
            f'font-size="{t["tam"]}" fill="{P[t["cor"]]}" text-anchor="{t["alinhamento"]}">{esc(texto)}</text>')


def nota_lembrete(m):
    """A nota do lembrete: em cima da foto, perto do topo, um pouco torta."""
    j = m['janela']
    larg_txt = 560
    l1 = quebra(LEMBRETE, 'Kalam', 700, 36, larg_txt)
    alt = 40 + len(l1) * 46 + 40 + 30
    w = 640
    cx = j['cx']
    cy = j['cy'] - j['h'] / 2 + 70 + alt / 2
    ang = -2.5
    x0, y0 = cx - w / 2, cy - alt / 2
    partes = [f'<g transform="rotate({ang} {cx:.1f} {cy:.1f})">',
              f'<rect x="{x0 + 8:.1f}" y="{y0 + 10:.1f}" width="{w}" height="{alt:.1f}" rx="6" fill="{P["noite"]}"/>',
              f'<rect x="{x0:.1f}" y="{y0:.1f}" width="{w}" height="{alt:.1f}" rx="6" fill="{P["marca"]}"/>',
              f'<path d="{fita_d(cx, y0 + 2, 150, 40, 3, 4)}" fill="{P["salvia"]}"/>']
    y = y0 + 40 + 36
    for linha in l1:
        partes.append(f'<text x="{x0 + 40:.1f}" y="{y:.1f}" font-family="Kalam" font-weight="700" '
                      f'font-size="36" fill="{P["noite"]}">{esc(linha)}</text>')
        y += 46
    partes.append(f'<text x="{x0 + 40:.1f}" y="{y + 18:.1f}" font-family="Kalam" font-weight="400" '
                  f'font-size="28" fill="{P["noite"]}">{esc(LEMBRETE_2)}</text>')
    partes.append('</g>')
    caixa = (x0 - 12, y0 - 24, x0 + w + 20, y0 + alt + 24)
    return ''.join(partes), l1, caixa


def roda(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f'falhou: {" ".join(cmd)}\n{r.stderr}')


def svg_para(svg, destino, fmt='png'):
    tmp = destino + '.svg'
    with open(tmp, 'w', encoding='utf-8') as fh:
        fh.write(svg)
    roda(['rsvg-convert', '-f', fmt, tmp, '-o', destino])
    os.remove(tmp)


# ---------------------------------------------------------------- foto de exemplo (paisagem feita por código, sem pessoa)
def foto_exemplo(W=1080, H=1920, seed=3):
    rng = np.random.default_rng(seed)
    yy = np.linspace(0, 1, H)[:, None]
    xx = np.linspace(0, 1, W)[None, :]
    t = np.clip(yy / 0.5, 0, 1) ** 1.25
    topo, baixo = np.array([92, 148, 203.0]), np.array([241, 220, 186.0])
    img = np.repeat(topo * (1 - t)[..., None] + baixo * t[..., None], W, axis=1)
    d = np.hypot((xx - 0.70) * W, (yy - 0.30) * H)
    brilho = np.clip(np.exp(-(d / 320) ** 2) * 0.45 + np.exp(-(d / 64) ** 4), 0, 1)
    img = img + brilho[..., None] * (np.array([255, 250, 236.0]) - img)
    im = Image.fromarray(np.clip(img, 0, 255).astype('uint8'), 'RGB')

    def camada(pts, cor, blur=0):
        m = Image.new('L', (W, H), 0)
        ImageDraw.Draw(m).polygon(pts, fill=255)
        if blur:
            m = m.filter(ImageFilter.GaussianBlur(blur))
        im.paste(Image.new('RGB', (W, H), cor), (0, 0), m)

    # serra de topo reto ao fundo (lembra o tepui), colinas e o lavrado
    hz = 0.53 * H
    camada([(0, hz), (0.07 * W, 0.47 * H), (0.17 * W, 0.457 * H), (0.21 * W, 0.405 * H), (0.53 * W, 0.398 * H),
            (0.57 * W, 0.445 * H), (0.71 * W, 0.462 * H), (0.83 * W, 0.436 * H), (W, 0.47 * H), (W, hz)],
           (134, 142, 166), blur=2)
    xs = np.linspace(0, W, 60)
    col = [(x, 0.52 * H - 26 * math.sin(x / 140) - 18 * math.sin(x / 57 + 1)) for x in xs]
    camada([(0, H)] + col + [(W, H)], (122, 146, 104), blur=1)
    xs = np.linspace(0, W, 80)
    campo = [(x, 0.575 * H - 12 * math.sin(x / 90 + 2)) for x in xs]
    camada([(0, H)] + campo + [(W, H)], (199, 182, 118))
    dr = ImageDraw.Draw(im)
    for _ in range(900):
        x = rng.uniform(0, W)
        y = rng.uniform(0.58 * H, H)
        h = 6 + (y / H) * 26
        c = int(rng.uniform(-22, 18))
        dr.line([(x, y), (x + rng.uniform(-4, 4), y - h)], fill=(180 + c, 162 + c, 96 + c), width=2)
    for bx, by, esc_ in ((0.18, 0.60, 1.0), (0.24, 0.615, 0.8), (0.79, 0.63, 1.2), (0.86, 0.60, 0.7)):
        x, y = bx * W, by * H
        alt = 210 * esc_
        dr.line([(x, y), (x + 6 * esc_, y - alt)], fill=(70, 66, 44), width=int(9 * esc_))
        tx, ty = x + 6 * esc_, y - alt
        for k in range(11):
            a = math.radians(-170 + k * 16)
            L = (70 + 18 * math.sin(k)) * esc_
            pts = [(tx + L * s * math.cos(a), ty + L * s * math.sin(a) + 14 * esc_ * s * s) for s in np.linspace(0, 1, 6)]
            dr.line(pts, fill=(52, 88, 52), width=int(6 * esc_))
    arr = np.asarray(im).astype(float)
    arr += rng.normal(0, 5, arr.shape)
    v = np.hypot((xx - 0.5) * 1.3, (yy - 0.5))
    arr *= (1 - 0.22 * np.clip(v - 0.25, 0, 1))[..., None]
    return Image.fromarray(np.clip(arr, 0, 255).astype('uint8'), 'RGB')


def cobre(foto, W, H):
    fw, fh = foto.size
    k = max(W / fw, H / fh)
    f = foto.resize((math.ceil(fw * k), math.ceil(fh * k)), Image.LANCZOS)
    x, y = (f.size[0] - W) // 2, (f.size[1] - H) // 2
    return f.crop((x, y, x + W, y + H))


# ---------------------------------------------------------------- conferência
def cores_do_svg(svg):
    sem_defs = re.sub(r'<defs>.*?</defs>', '', svg, flags=re.S)
    return {c.upper() for c in re.findall(r'(?:fill|stroke)="(#[0-9A-Fa-f]{6})"', sem_defs)}


def confere(m, png_moldura, png_lembrete, svg_m, svg_l, linhas_lembrete):
    prob = []
    W, H, j, t = m['W'], m['H'], m['janela'], m['texto']
    fora = cores_do_svg(svg_m + svg_l + svg_texto(m)) - PALETA
    if fora:
        prob.append(f'cor fora da paleta: {sorted(fora)}')
    if (t['cor'], t['fundo']) not in PARES_OK:
        prob.append(f'texto {t["cor"]} sobre {t["fundo"]} não é par permitido pela ficha')
    if ('noite', 'marca') not in PARES_OK:
        prob.append('lembrete: par de cor não permitido')
    x0, y0, x1, y1 = t['box']
    larg_util = (x1 - x0) - 2 * 28 if t['alinhamento'] == 'middle' else (x1 - t['x'] - 28)
    lw = largura(t['exemplo'], t['fonte'], t['peso'], t['tam'])
    if lw > larg_util:
        prob.append(f'texto de exemplo não cabe: {lw:.0f} px para {larg_util:.0f} px')
    if x0 < 40 or x1 > W - 40:
        prob.append('lugar do texto encosta na borda (o recorte da grade corta uns 34 px de cada lado)')
    if m['formato'] == 'story' and (y0 < STORY_TOPO or y1 > STORY_BASE):
        prob.append(f'lugar do texto fora da área segura do story ({y0}..{y1})')
    frac = (j['w'] * j['h']) / (W * H)
    if frac < (0.60 if m['formato'] == 'feed' else 0.45):
        prob.append(f'janela pequena: {frac:.0%} da imagem')
    im = Image.open(png_moldura)
    if im.size != (W, H) or im.mode != 'RGBA':
        prob.append(f'PNG da moldura com tamanho ou modo errado: {im.size} {im.mode}')
    a = np.asarray(im)[..., 3]
    jx0, jx1 = int(j['cx'] - j['w'] / 2 + 40), int(j['cx'] + j['w'] / 2 - 40)
    jy0, jy1 = int(j['cy'] - j['h'] / 2 + 40), int(j['cy'] + j['h'] / 2 - 40)
    miolo = a[jy0 + 200:jy1 - 200, jx0 + 60:jx1 - 60]
    if miolo.max() > 0:
        prob.append(f'janela não está transparente no miolo (alfa máximo {miolo.max()})')
    transp = (a < 8).mean()
    if abs(transp - frac) > 0.06:
        prob.append(f'área transparente ({transp:.0%}) não bate com a janela ({frac:.0%})')
    if a[5, 5] < 250 or a[H - 6, W - 6] < 250:
        prob.append('canto da moldura não está opaco')
    lb = np.asarray(Image.open(png_lembrete))[..., 3]
    if lb.mean() == 0:
        prob.append('camada do lembrete vazia')
    if (lb > 0).mean() > 0.2:
        prob.append('camada do lembrete cobre demais')
    if len(linhas_lembrete) > 3:
        prob.append('lembrete com mais de 3 linhas')
    return prob, frac, lw, larg_util


# ---------------------------------------------------------------- folhas
def titulo_font(tam, peso=600):
    return fonte_pil('Instrument Sans', peso, tam)


def folha(itens, destino):
    """itens: lista de (modelo, imagem RGB do exemplo). Feeds na linha de cima, stories embaixo."""
    cel, gap, mg, top = 480, 40, 40, 110
    feeds = [x for x in itens if x[0]['formato'] == 'feed']
    stories = [x for x in itens if x[0]['formato'] == 'story']
    hf, hs = int(cel * 1350 / 1080), int(cel * 1920 / 1080)
    Wf = mg * 2 + 3 * cel + 2 * gap
    Hf = top + 46 + hf + 60 + 46 + hs + mg
    out = Image.new('RGB', (Wf, Hf), P['papel'])
    dr = ImageDraw.Draw(out)
    dr.text((mg, 34), 'Molduras para fotos · 6 modelos · prévia com foto de exemplo', font=titulo_font(34), fill=P['floresta'])
    for linha, (lista, alt, y) in enumerate(((feeds, hf, top), (stories, hs, top + 46 + hf + 60))):
        for i, (m, img) in enumerate(lista):
            x = mg + i * (cel + gap)
            dr.text((x, y), f'{m["id"].split("-")[0]} · {m["ocasiao"]} · {m["formato"]}', font=titulo_font(24), fill=P['floresta'])
            out.paste(img.resize((cel, alt), Image.LANCZOS), (x, y + 40))
    out.save(destino, quality=88)


def xadrez(W, H, lado=40):
    a = np.indices((H, W)).sum(axis=0)
    q = ((np.arange(H)[:, None] // lado + np.arange(W)[None, :] // lado) % 2).astype(bool)
    arr = np.where(q[..., None], 205, 235).astype('uint8')
    return Image.fromarray(np.repeat(arr, 3, axis=2), 'RGB')


# ---------------------------------------------------------------- principal
def main():
    args = sys.argv[1:]
    saida = args[args.index('--saida') + 1] if '--saida' in args else 'out'
    nome_folha = args[args.index('--folha') + 1] if '--folha' in args else 'molduras-folha.jpg'
    for sub in ('png', 'pdf', 'exemplos'):
        os.makedirs(os.path.join(saida, sub), exist_ok=True)
    foto = foto_exemplo()
    foto.save(os.path.join(saida, 'exemplos', 'foto-de-exemplo.jpg'), quality=88)
    itens, camadas, problemas = [], [], 0
    for fab in MODELOS:
        m = fab()
        W, H, mid = m['W'], m['H'], m['id']
        nota, linhas_l, caixa_nota = nota_lembrete(m)
        svg_m = svg_moldura(m) + '</svg>'
        svg_l = svg_abre(W, H) + nota + '</svg>'
        p_m = os.path.join(saida, 'png', f'{mid}.png')
        p_l = os.path.join(saida, 'png', f'{mid}-lembrete.png')
        svg_para(svg_m, p_m)
        svg_para(svg_l, p_l)
        svg_para(svg_moldura(m) + svg_texto(m) + nota + '</svg>', os.path.join(saida, 'pdf', f'{mid}.pdf'), 'pdf')
        p_t = os.path.join(saida, 'exemplos', f'{mid}-moldura-e-texto.png')
        svg_para(svg_moldura(m) + svg_texto(m) + '</svg>', p_t)
        ex = cobre(foto, W, H).convert('RGBA')
        ex.alpha_composite(Image.open(p_t).convert('RGBA'))
        ex = ex.convert('RGB')
        ex.save(os.path.join(saida, 'exemplos', f'{mid}-exemplo.jpg'), quality=90)
        os.remove(p_t)
        itens.append((m, ex))
        prob, frac, lw, lu = confere(m, p_m, p_l, svg_m, svg_l, linhas_l)
        problemas += len(prob)
        estado = 'ok' if not prob else 'PROBLEMA'
        print(f'{estado:8} {mid:20} janela {frac:.0%} · texto de exemplo {lw:.0f}/{lu:.0f} px · lembrete {len(linhas_l)} linhas')
        for p in prob:
            print(f'         - {p}')
        t, j = m['texto'], m['janela']
        x0, y0, x1, y1 = t['box']
        camadas.append(dict(
            id=mid, ocasiao=m['ocasiao'], formato=m['formato'], estilo=m['estilo'], largura=W, altura=H,
            ordem_das_camadas='de baixo para cima: foto, moldura, linha de texto, nota do lembrete',
            janela_da_foto=dict(esquerda=round(j['cx'] - j['w'] / 2), topo=round(j['cy'] - j['h'] / 2),
                                largura=j['w'], altura=j['h'], giro_graus=j['ang']),
            moldura=dict(arquivo=f'{mid}.png', esquerda=0, topo=0, largura=W, altura=H),
            linha_de_texto=dict(exemplo=t['exemplo'],
                                esquerda=(x0 + 28) if t['alinhamento'] == 'middle' else t['x'],
                                topo=round((y0 + y1) / 2 - t['tam'] * 0.72),
                                largura=(x1 - x0 - 56) if t['alinhamento'] == 'middle' else (x1 - t['x'] - 28),
                                tamanho=t['tam'], cor=P[t['cor']], negrito=t['peso'] >= 600,
                                alinhamento='center' if t['alinhamento'] == 'middle' else 'start',
                                letra_na_previa=t['fonte']),
            lembrete=dict(arquivo=f'{mid}-lembrete.png', esquerda=0, topo=0, largura=W, altura=H,
                          caixa_da_nota=[round(v) for v in caixa_nota], texto=LEMBRETE + ' ' + LEMBRETE_2),
            pdf=f'{mid}.pdf'))
    with open(os.path.join(saida, 'canva-camadas.json'), 'w', encoding='utf-8') as fh:
        json.dump(camadas, fh, ensure_ascii=False, indent=1)
    folha(itens, os.path.join(saida, nome_folha))
    # as três camadas do primeiro modelo, lado a lado
    m, ex = itens[0]
    W, H = m['W'], m['H']
    fundo = xadrez(W, H).convert('RGBA')
    fundo.alpha_composite(Image.open(os.path.join(saida, 'png', f'{m["id"]}.png')).convert('RGBA'))
    com_nota = ex.convert('RGBA')
    com_nota.alpha_composite(Image.open(os.path.join(saida, 'png', f'{m["id"]}-lembrete.png')).convert('RGBA'))
    cel, gap, mg = 480, 40, 40
    alt = int(cel * H / W)
    cam = Image.new('RGB', (mg * 2 + 3 * cel + 2 * gap, 110 + alt + mg), P['papel'])
    dr = ImageDraw.Draw(cam)
    for i, (rot_, img) in enumerate((('1 · moldura (xadrez = transparente)', fundo.convert('RGB')),
                                     ('2 · com a foto atrás e o texto', ex),
                                     ('3 · com a nota do lembrete por cima', com_nota.convert('RGB')))):
        x = mg + i * (cel + gap)
        dr.text((x, 40), rot_, font=titulo_font(22), fill=P['floresta'])
        cam.paste(img.resize((cel, alt), Image.LANCZOS), (x, 90))
    cam.save(os.path.join(saida, 'molduras-camadas.jpg'), quality=88)
    print(f'folha: {os.path.join(saida, nome_folha)}')
    print('0 problemas' if problemas == 0 else f'{problemas} problema(s)')
    return 0 if problemas == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
