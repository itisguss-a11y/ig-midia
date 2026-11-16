#!/usr/bin/env python3
# PRESEME · reel "A casa 12" (territorio, 14/11/2026) · o que e so desta peca: a coreografia de cada cena e os rotulos soltos.
# O desenho dos cenarios, os bonecos, os papeis, as fichas, o contador, o carimbo e as transicoes sao do motor (pasta pixel).
# Cada cena e uma funcao do tempo: cena(acao, u, dur, feitas, t) devolve a tela pequena (216 x 384) do quadro.
#   u = segundos dentro do momento; dur = duracao dele; feitas = acoes ja passadas nesta cena; t = tempo do video.
# Saiu de reel_base.py, reel_base2.py, reel_base3.py, reel_base4.py e reel_rotulos.py, sem mudar nenhum traco; os textos dos
# rotulos passaram para o roteiro.json ("rotulos"), para entrarem no textos.txt.
import random
from PIL import Image, ImageDraw, ImageChops
import nucleo as N, cenarios as K, letras as L
from nucleo import (W, H, FL, PA, MA, CO, SA, FO, NO, ACS, MINI, DOT, ev, sm, novo, memo, pisca, parcial, moldura, ao_longo,
                    xadrez, dissolve)


# ---------------------------------------------------------------- moradia
def b_casa():
    def f():
        im, d = novo(); K.cena_casa(d, random.Random(12), balao=False); return im
    return memo('casa', f)


def b_grama3():
    def f():
        im, d = novo(); N.grass(d, (0, 0, W - 1, H - 1), 3); return im
    return memo('g3', f)


def cena_moradia(acao, u, dur, feitas, t):
    im = b_casa().copy(); d = ImageDraw.Draw(im)
    dx = 1 if (t % 1.2) < 0.6 else 0                         # a roupa no varal balanca um pixel
    im.paste(b_grama3().crop((188, 217, 213, 230)), (188, 217))
    for (x, c, hh) in ((189, PA, 10), (197, MA, 8), (205, FO, 11)):
        d.rectangle((x + dx, 217, x + 5 + dx, 217 + hh), fill=c, outline=NO)
    if acao == 'alerta' and pisca(t):
        N.bubble(d, 120, 164, card=True)
    if (acao == 'certo' and u > 0.5) or acao == 'obrigado':   # a marca de feito, em dobro, em cima da porta
        c = Image.new('RGB', (11, 10), NO); N.check(ImageDraw.Draw(c), 1, 1)
        im.paste(c.resize((22, 20), Image.NEAREST), (97, 183)); ev('fim', 'certo')
    if acao == 'obrigado':                                    # o agente e os alunos, na frente da casa
        for k, cab in enumerate((NO, FL, FO)):
            if u > 0.3 + 0.25 * k:
                N.sprite(d, 152 + 15 * k, 239 - (1 if ((t + 0.15 * k) % 0.7) < 0.2 else 0), MINI, {'h': cab, 'X': PA}, sc=2)
        if u > 0.2:
            N.sprite(d, 126, 229 - (1 if (t % 0.7) < 0.2 else 0), ACS, sc=2)
        ev('obrigado', 'sino', 0.6)
    return im


# ---------------------------------------------------------------- rua (microarea)
XS = (6, 30, 54, 78, 118, 142, 166, 190)
RUA_FIM = {'sai': 8, 'visita1': 34, 'visita2': 62, 'alunos': 92, 'visita3': 116}


def b_rua(apagado):
    def f():
        im, d = novo(); rnd = random.Random(22)
        N.grass(d, (0, 0, W - 1, H - 1), 5, 0.5)
        N.road_h(d, 178, 192); N.road_h(d, 246, 258); N.road_h(d, 322, 334); N.road_v(d, 99, 111, 102, H - 1)
        for (a, b) in ((179, 191), (247, 257), (323, 333)):
            d.rectangle((100, a, 110, b), fill=PA)
        rows = (112, 156, 198, 226, 266, 300, 340); roofs = (FO, FL, PA, FO, FO, PA, FL, FO)
        for j, y in enumerate(rows):
            for i, x in enumerate(XS):
                N.house_top(d, x, y, 18, 16, roofs[(i * 3 + j * 5) % len(roofs)], hi=(j == 2 and i == 5))
        for j, y in enumerate((140, 219, 288, 362)):
            for i, x in enumerate(XS):
                if (i + j) % 2 == 0:
                    N.tree(d, x + 6 + rnd.randint(0, 6), y + rnd.randint(-2, 2), 4 + (i % 2), mango=(i % 3 == 0) * 2, rnd=rnd)
        if apagado:                                           # vizinhos fora da microarea ficam apagados
            N.dither(d, (0, 224, W - 1, H - 1), SA, 1); N.dither(d, (0, 100, W - 1, 104), SA, 1)
        d.rectangle((143, 216, 157, 224), fill=PA, outline=NO); N.tiny(d, 147, 218, '12', NO)
        return im
    return memo(('rua', apagado), f)


def rua_x(acao, u, dur, feitas):
    pos, n = -20, 0
    for a in feitas:
        if a == 'visita':
            n += 1; pos = RUA_FIM['visita%d' % n]
        elif a in RUA_FIM:
            pos = RUA_FIM[a]
    chave = 'visita%d' % (n + 1) if acao == 'visita' else acao
    if chave in RUA_FIM:
        p = min(1.0, u / (dur * 0.85)); return pos + (RUA_FIM[chave] - pos) * p, p < 1.0
    return pos, False


def cena_rua(acao, u, dur, feitas, t):
    fb = 1.0 if 'borda' in feitas else (sm(u / 2.6) if acao == 'borda' else 0.0)
    im = b_rua(fb >= 1.0).copy(); d = ImageDraw.Draw(im)
    if fb > 0:
        parcial(d, [(3, 105), (211, 105), (211, 221), (3, 221), (3, 105)], NO, fb, on=4, off=3, w=2)
        ev('borda', 'lapis', 0.8)
    if acao == 'casas':                                       # o conjunto de casas da microarea acende, uma a uma
        for k in range(int(24 * sm(u / max(1.0, dur * 0.6)))):
            if k != 21:                                       # a casa 12 ja tem a moldura dela
                hx, hy = XS[k % 8], (112, 156, 198)[k // 8]
                d.rectangle((hx - 3, hy - 3, hx + 20, hy + 18), outline=NO); d.rectangle((hx - 2, hy - 2, hx + 19, hy + 17), outline=MA)
        ev('casas', 'gota', 0.6)
    x, andando = rua_x(acao, u, dur, feitas); x = int(round(x))
    bob = -1 if (andando and (t % 0.36) < 0.18) else 0
    if x > 0:
        N.dashed(d, [(0, 185), (min(128, x + 12), 185)], FO, on=2, off=2, w=2)
    for i in range(5):                                        # casa visitada ganha a marca
        if x >= XS[i] - 2:
            for y in (156, 198):
                N.check(d, XS[i] + 5, y + 4)
            ev('chk%d' % i, 'pop', 0.8)
    if acao == 'alunos':                                      # os alunos da UFRR, atras dela, no sol
        for k in range(3):
            kb = -1 if (andando and ((t + 0.12 * (k + 1)) % 0.36) < 0.18) else 0
            N.sprite(d, x - 18 - 16 * k, 173 + kb, MINI, {'h': (NO, FL, FO)[k], 'X': PA}, sc=2)
            if pisca(t + 0.3 * k, 1.1, 0.5):
                d.point((x - 20 - 16 * k, 172), fill=PA); d.point((x - 20 - 16 * k, 174), fill=PA)
        sx, sy = max(16, x - 26), 143                         # o sol, em cima deles
        d.ellipse((sx - 6, sy - 6, sx + 6, sy + 6), fill=NO); d.ellipse((sx - 5, sy - 5, sx + 5, sy + 5), fill=MA)
        r0 = 8 if pisca(t, 0.6, 0.3) else 9
        for (a, b) in ((0, -1), (0, 1), (-1, 0), (1, 0), (-0.7, -0.7), (0.7, 0.7), (-0.7, 0.7), (0.7, -0.7)):
            d.line((sx + int(a * r0), sy + int(b * r0), sx + int(a * (r0 + 3)), sy + int(b * (r0 + 3))), fill=NO, width=3)
            d.line((sx + int(a * r0), sy + int(b * r0), sx + int(a * (r0 + 3)), sy + int(b * (r0 + 3))), fill=MA)
        ev('sol', 'sino', 0.5)
    N.sprite(d, x, 163 + bob, ACS, sc=2)
    d.rectangle((x + 17, 180 + bob, x + 24, 190 + bob), fill=PA, outline=NO)      # prancheta
    d.line((x + 19, 183 + bob, x + 22, 183 + bob), fill=FO); d.line((x + 19, 186 + bob, x + 22, 186 + bob), fill=FO)
    if pisca(t, 1.0 if acao != 'percebe' else 0.6, 0.6 if acao != 'percebe' else 0.4):
        N.bubble(d, 164, 178, card=False)
    if acao == 'percebe':
        ev('percebe', 'sino', 0.8)
    return im


# ---------------------------------------------------------------- area
CEL = [(x0, y0, x1, y1) for (y0, y1) in ((106, 175), (181, 250)) for (x0, x1) in ((4, 70), (76, 139), (145, 211))]
UBS = (75, 143, 141, 193)
TIME = ((NO, PA), (FL, PA), (NO, SA), (FO, MA))


def b_area(vacina, equipe, agentes):
    def f():
        im, d = novo(PA); r = K.cena_area(d, random.Random(33), vacina=vacina, equipe=equipe, agentes=agentes); return im, r
    return memo(('area', vacina, equipe, agentes), f)


def cena_area(acao, u, dur, feitas, t):
    com_time = 'equipe' in feitas
    base, (hx, hy, cam) = b_area(False, com_time, True)
    im = base.copy(); d = ImageDraw.Draw(im)
    if acao == 'forma':                                       # as microareas aparecem uma a uma, cada uma com a sua agente
        for k, c in enumerate(CEL):
            if u < 0.35 + 0.42 * k:
                d.rectangle(c, fill=PA); N.dither(d, c, SA, 1); d.rectangle(c, outline=SA)
            else:
                ev('cel%d' % k, 'pop', 0.6)
        im.paste(base.crop((UBS[0], UBS[1], UBS[2] + 1, UBS[3] + 1)), (UBS[0], UBS[1]))
    elif acao == 'equipe':                                    # a equipe chega na porta da unidade
        for k, (cab, roupa) in enumerate(TIME):
            if u > 0.4 + 0.45 * k:
                N.sprite(d, 78 + k * 16, 197, MINI, {'h': cab, 'X': roupa}, sc=2); ev('time%d' % k, 'pop', 0.7)
    elif acao == 'opcionais':                                 # os tres que podem ou nao estar: piscam, com moldura tracejada
        parcial(d, [(82, 219), (134, 219), (134, 243), (82, 243), (82, 219)], NO, 1.0, on=2, off=2)
        if pisca(t, 1.0, 0.65):
            for k, (cab, roupa) in enumerate(((NO, SA), (FL, SA), (FO, SA))):
                N.sprite(d, 87 + k * 16, 222, MINI, {'h': cab, 'X': roupa}, sc=2)
        ev('opc', 'gota', 0.7)
    elif acao == 'ubs':
        if pisca(t, 0.7, 0.45):
            moldura(d, (71, 139, 145, 197))
        ev('ubs', 'sino', 0.7)
    elif acao == 'porta':                                     # gente chegando pela porta de entrada
        for k in range(3):
            p = ((u - 0.7 * k) % 3.2) / 2.2
            if u > 0.7 * k and p < 1.0:
                N.sprite(d, int(18 + 62 * p), 180 - ((t + k * 0.1) % 0.4 < 0.2), DOT, {'X': (PA, MA, SA)[k]}, sc=2)
            if u > 0.7 * k + 2.2:
                ev('entra%d' % k, 'tique', 0.6)
    elif acao == 'encaminha':                                 # o encaminhamento sai da unidade
        fr = sm(u / 1.8)
        px, py = parcial(d, [(142, 168), (210, 168)], NO, fr, on=3, off=2, w=2)
        if fr > 0.05:
            d.polygon([(px + 6, py), (px, py - 5), (px, py + 6)], fill=NO); d.polygon([(px + 4, py), (px + 1, py - 2), (px + 1, py + 3)], fill=MA)
        ev('enc', 'sopro', 0.7)
    elif acao == 'resolve':                                   # a vacina sai da unidade e chega na casa 12
        fr = sm(u / 3.2)
        parcial(d, [(a - 1, b - 1) for a, b in cam], NO, fr, on=1, off=0, w=3)
        px, py = parcial(d, cam, MA, fr, on=3, off=2, w=1)
        if fr < 1.0:
            K.caixa_vacina(d, px - 6, py - 4)
        else:
            N.check(d, hx - 1, hy - 1); ev('resolve', 'certo')
    return im


# ---------------------------------------------------------------- cidade (distrito)
AREA4 = (55, 167, 123, 246)


def b_cid(barras):
    def f():
        im, d = novo(PA); r = K.cena_cidade(d, random.Random(44), barras=barras, reforco=False); return im, r
    return memo(('cid', barras), f)


def cena_cidade(acao, u, dur, feitas, t):
    viu = 'enxerga' in feitas
    base, (cent, (sx, sy), ret, areas) = b_cid(viu)
    im = base.copy(); d = ImageDraw.Draw(im)
    if acao == 'enxerga':                                     # o distrito enxerga a cobertura de cada area
        cheio = b_cid(True)[0]
        for k, (cx, cy) in enumerate(cent):
            if u > 0.5 + 0.8 * k:
                bx, by = cx - 12, cy - 17
                im.paste(cheio.crop((bx - 1, by - 1, bx + 26, by + 8)), (bx - 1, by - 1)); ev('barra%d' % k, 'pop', 0.6)
    if acao == 'bairro' and pisca(t, 0.7, 0.42):              # o bairro inteiro com problema
        d.rectangle(AREA4, outline=CO); d.rectangle((AREA4[0] + 1, AREA4[1] + 1, AREA4[2] - 1, AREA4[3] - 1), outline=CO)
    if acao == 'bairro':
        ev('bairro', 'gota', 0.7)
    fc = 1.0 if 'distrito' in feitas else (sm(u / 2.4) if acao == 'distrito' else 0.0)
    if fc > 0:                                                # o contorno do distrito
        for k, c in enumerate((NO, MA, MA, NO)):
            b = (ret[0] + k, ret[1] + k, ret[2] - k, ret[3] - k)
            parcial(d, [(b[0], b[1]), (b[2], b[1]), (b[2], b[3]), (b[0], b[3]), (b[0], b[1])], c, fc, on=1, off=0)
        ev('distrito', 'lapis', 0.8)
    tx, ty = cent[3]
    ff = 1.0 if 'faz' in feitas else (sm(u / 2.6) if acao == 'faz' else 0.0)
    if ff > 0:                                                # o reforco sai da sede e vai para a area com cobertura baixa
        parcial(d, [(sx, sy + 9), (sx, ty - 24), (tx + 14, ty - 24), (tx + 14, ty - 10)], NO, ff, on=2, off=2, w=2)
        if ff >= 1.0:
            cxb, cyb = tx + 9, ty - 13
            d.rectangle((cxb, cyb, cxb + 10, cyb + 8), fill=NO); d.rectangle((cxb + 1, cyb + 1, cxb + 9, cyb + 7), fill=MA)
            d.rectangle((cxb + 4, cyb + 2, cxb + 6, cyb + 6), fill=NO); d.rectangle((cxb + 2, cyb + 3, cxb + 8, cyb + 5), fill=NO)
            ev('reforco', 'baque', 0.8)
    if acao == 'sede':                                        # o gestor distrital e a secretaria: o predio acende
        if pisca(t, 0.7, 0.45):
            moldura(d, (sx - 12, sy - 21, sx + 12, sy + 11))
        ev('sede', 'sino', 0.7)
    return im


# ---------------------------------------------------------------- saude indigena: o mapa com os polos-base
MALOCA, POLO0 = (-63.5, 2.75), (-63.9, 3.3)
TIME5 = ((NO, PA), (FL, PA), (NO, SA), (FO, MA), (NO, SA))


def polos():
    """os polos-base como pontos de 2x2: 37 no DSEI Yanomami (23 em Roraima e 14 no Amazonas) e 34 no Leste de Roraima.
    A quantidade e a do texto; a posicao de cada ponto e esquematica (sorteada dentro da terra indigena, com semente fixa)."""
    def f():
        P = K.mapa(True)[1]; my, ml = K.mascaras(); rr = K.mascara_rr().load(); rnd = random.Random(3437); todos = []

        def sorteia(mask, n, em_rr, fixos=()):
            px = mask.load(); pts = list(fixos); todos.extend(fixos); k = 0
            while len(pts) < n and k < 200000:
                k += 1; x, y = rnd.randint(3, W - 4), rnd.randint(100, 340)
                if not (px[x, y] and px[x + 1, y] and px[x, y + 1] and px[x + 1, y + 1]):
                    continue
                if em_rr is not None and bool(rr[x, y]) != em_rr:
                    continue
                if any(abs(x - a) < 3 and abs(y - b) < 3 for a, b in todos):
                    continue
                pts.append((x, y)); todos.append((x, y))
            return pts
        return sorteia(my, 23, True, (P(POLO0),)), sorteia(my, 14, False), sorteia(ml, 34, None)
    return memo('polos', f)


def conta_polos(u, dur):
    """quantos pontos ja apareceram em cada distrito no momento 'polos': primeiro o Leste (34), depois o Yanomami (37)"""
    a, b = 0.42 * dur, 0.84 * dur
    n1 = 34 if u >= a else int(round(34 * sm((u - 0.6) / max(0.5, a - 1.4))))
    n2 = 0 if u < a else (37 if u >= b else int(round(37 * sm((u - a - 0.3) / max(0.5, b - a - 1.1)))))
    return n1, n2


def conta_degraus(feitas, u, dur):
    n = int(max(0, min(4, 1 + (u - 0.5) / max(0.1, (dur - 2.0) / 3))))
    return (4, n) if 'resposta1' in feitas else (max(1, n), 0)


def cena_mapa(acao, u, dur, feitas, t):
    semt, P = K.mapa(False); comt = K.mapa(True)[0]
    ax, ay = P(MALOCA); bx, by = P(K.BV); my, ml = K.mascaras(); yr, ya, le = polos(); yan = yr + ya
    if acao == 'maloca':
        im = semt.copy()
    elif acao == 'subsistema':                                # as terras indigenas aparecem: o mapa e outro
        im = dissolve(semt, comt, u / 1.4); ev('terras', 'sino', 0.7)
    else:
        im = comt.copy()
    d = ImageDraw.Draw(im); fase = u / dur
    if acao in ('dois', 'polos'):                             # um distrito aceso de cada vez; no fim, os dois
        apaga = my if fase < 0.42 else (ml if fase < 0.84 else None)
        if apaga is not None:
            im.paste(Image.new('RGB', (W, H), FO), mask=ImageChops.multiply(apaga, xadrez()))
        ev(acao + 'a', 'sino', 0.6)
        if fase >= 0.42:
            ev(acao + 'b', 'sino', 0.6)
    if acao == 'segue' and pisca(t, 0.8, 0.45):               # a parte do Yanomami que passa da divisa do estado acende
        im.paste(Image.new('RGB', (W, H), PA), mask=ImageChops.multiply(my, ImageChops.invert(K.mascara_rr())))
    if acao == 'dsei':                                        # os polos-base aparecem em cascata
        ordem = sorted(yan + le, key=lambda p: (p[0] * 7 + p[1] * 13) % 71); n = int(len(ordem) * sm((u - 0.6) / 3.2))
        K.pontos(d, ordem[:n])
        for k in range(0, n, 14):
            ev('polo%d' % k, 'pop', 0.4)
    elif acao == 'polos':                                     # a contagem: 34 no Leste, depois 37 no Yanomami
        n1, n2 = conta_polos(u, dur)
        K.pontos(d, le[:n1] if (fase < 0.42 or fase >= 0.84) else []); K.pontos(d, yan[:n2])
        for k in range(0, n1 + n2, 7):
            ev('conta%d' % k, 'tique', 0.35)
    elif acao in ('dois', 'segue', 'casai'):
        K.pontos(d, yan + le)
    if acao == 'casai':                                       # da aldeia ao polo, do polo a CASAI; fica, e volta
        rota = [(ax, ay), P(POLO0), (bx, by)]; fr = sm((u - 0.6) / 2.2)
        parcial(d, rota, NO, fr, on=1, off=0); parcial(d, rota, PA, fr, on=2, off=2)
        d.rectangle((bx - 4, by - 4, bx + 4, by + 4), fill=NO); d.rectangle((bx - 3, by - 3, bx + 3, by + 3), fill=CO)
        d.rectangle((bx - 1, by - 3, bx + 1, by + 3), fill=NO); d.rectangle((bx - 3, by - 1, bx + 3, by + 1), fill=NO)
        ev('casai', 'baque', 0.7)
        K.marca(d, (ax, ay), MA, 2); K.marca(d, ao_longo(rota, fr - sm((u - (dur - 3.2)) / 2.4)), MA, 1)
        if u > dur - 0.9:
            ev('volta', 'certo', 0.7)
    else:
        K.marca(d, (bx, by), PA)                              # Boa Vista
    if acao in ('maloca', 'subsistema'):                      # a maloca
        if pisca(t, 0.7, 0.4):
            d.rectangle((ax - 5, ay - 5, ax + 5, ay + 5), outline=PA)
        K.marca(d, (ax, ay), MA, 2)
    return im


# ---------------------------------------------------------------- aldeia e polo-base
def b_aldeia():
    def f():
        im, d = novo(FO); K.fundo_aldeia(d, random.Random(5)); return im
    return memo('aldeia2', f)


def cena_aldeia(acao, u, dur, feitas, t):
    im = b_aldeia().copy(); d = ImageDraw.Draw(im)
    if pisca(t):                                              # o "!" sobre a casa onde a familia mora
        N.bubble(d, K.BALAO_ALDEIA[0], K.BALAO_ALDEIA[1], card=False)
    if acao == 'ais':                                         # o AIS chega
        p = min(1.0, u / min(3.0, dur * 0.5)); x = int(round(216 - 98 * p))
        N.sprite(d, x, 198 - (1 if p < 1 and (t % 0.36) < 0.18 else 0), ACS, {'g': NO, 'm': SA}, sc=2)
        if p >= 1:
            K.radio(d, 138, 208); ev('ais', 'pop', 0.7)
    elif 'ais' in feitas:
        if acao == 'degrau' and u > 0.8:                      # o mesmo degrau, na cidade: o ACS, apagado, ao lado
            K.apagado(d, 94, 198, ACS, 2); ev('igual', 'pop', 0.6)
        N.sprite(d, 118, 198, ACS, {'g': NO, 'm': SA}, sc=2); K.radio(d, 138, 208)
        if acao == 'radio':                                   # chama a equipe do polo-base
            for j in range(int(u / 0.3) % 4):
                r = 4 + 4 * j; d.arc((141 - r, 204 - r, 141 + r, 204 + r), 285, 345, fill=NO)
            ev('radio1', 'tique', 0.7)
            if u > 0.7:
                ev('radio2', 'tique', 0.7)
    return im


def b_polo():
    def f():
        im, d = novo(FO); K.cena_polo(d, random.Random(8), barco_x=None, equipe=False); return im
    return memo('polo', f)


def cena_polo(acao, u, dur, feitas, t):
    im = b_polo().copy(); d = ImageDraw.Draw(im)
    for k, (cab, roupa) in enumerate(TIME5):                  # a EMSI na porta
        if 'emsi' in feitas or (acao == 'emsi' and u > 0.4 + 0.45 * k):
            N.sprite(d, 62 + k * 20, 168, MINI, {'h': cab, 'X': roupa}, sc=2); ev('emsi%d' % k, 'pop', 0.7)
    bob = 1 if (t % 1.0) < 0.5 else 0
    if acao == 'lancha':                                      # a lancha sai do polo em velocidade, rumo a aldeia
        q = u - 2.0
        x = 84 if q < 0 else (84 - 70 * q * q if q < 1 else 14 - 140 * (q - 1)); v = max(0.0, min(1.0, q * 1.3))
        if x > -230:
            K.riscos_de_velocidade(d, 188, 248, v, t); K.lancha(im, int(x), 212 + (bob if v < 0.1 else 0), v, t)
        if q > 0:
            ev('parte', 'sopro', 0.9)
    else:                                                     # e volta pela esquerda, e encosta no trapiche
        q = (u - max(2.6, dur - 5.2)) / 2.8 if acao == 'emsi' else 2.0
        if q >= 0:
            p = min(1.0, q); x = -80 + 164 * (1 - (1 - p) ** 2); v = max(0.0, 1.0 - p * 1.05)
            K.riscos_de_velocidade(d, 188, 248, v, t, sentido=-1); K.lancha(im, int(x), 212 + (bob if v < 0.1 else 0), v, t, espelho=True)
            if acao == 'emsi':
                ev('chega', 'sopro', 0.7)
                if p >= 1:
                    ev('encosta', 'baque', 0.6)
    return im


# ---------------------------------------------------------------- a resposta: duas colunas, quatro degraus
def cena_escada(acao, u, dur, feitas, t):
    im, d = novo(SA)
    N.dither(d, (0, 0, 107, H - 1), PA); d.rectangle((110, 0, W - 1, H - 1), fill=FO); N.dither(d, (110, 0, W - 1, H - 1), FL)
    d.rectangle((107, 0, 109, H - 1), fill=NO)
    ne, nd = conta_degraus(feitas, u, dur)
    for k in range(4):
        y = 100 + 36 * k
        if k == 0:
            N.house_top(d, 12, y + 7, 26, 20, FO, hi=True); K.casa_palha(d, 120, y + 6, 32, 25)
        elif k == 1:
            N.sprite(d, 16, y + 3, ACS, sc=2); N.sprite(d, 127, y + 3, ACS, {'g': NO, 'm': SA}, sc=2)
        elif k == 2:
            for x0 in (8, 119):
                d.rectangle((x0, y + 5, x0 + 34, y + 31), fill=PA, outline=NO); d.rectangle((x0 + 1, y + 6, x0 + 33, y + 12), fill=FO)
                K.cruz(d, x0 + 11, y + 15, 12)
            d.line((151, y + 5, 151, y - 2), fill=NO); d.point((151, y - 3), fill=CO)
        else:
            for yy in range(y + 6, y + 30, 10):
                for xx in range(9, 42, 10):
                    d.rectangle((xx, yy, xx + 6, yy + 6), fill=FO)
            moldura(d, (6, y + 3, 44, y + 35))
            d.polygon([(118, y + 11), (132, y + 5), (144, y + 13), (146, y + 26), (132, y + 34), (120, y + 28)], fill=MA, outline=NO)
            d.polygon([(140, y + 9), (154, y + 7), (158, y + 30), (146, y + 32)], fill=PA, outline=NO)
        for col, n, box, bg in ((0, ne, (2, y, 105, y + 35), PA), (1, nd, (112, y, 213, y + 35), FL)):
            if k >= n:                                        # degrau ainda apagado
                N.dither(d, box, bg)
            else:
                ev('deg%d%d' % (col, k), 'pop', 0.7)
    if nd == 4:
        ev('resposta', 'certo')
    return im


CENAS = {'moradia': cena_moradia, 'moradia_fim': cena_moradia, 'rua': cena_rua, 'area': cena_area, 'cidade': cena_cidade,
         'mapa': cena_mapa, 'aldeia': cena_aldeia, 'polo': cena_polo, 'escada': cena_escada}


# ---------------------------------------------------------------- passada 2: os rotulos soltos sobre a cena (textos em r['rotulos'])
def aba(d, x, y, w, texto, escuro):
    """uma folha da pilha: o papel de cada degrau, guardado"""
    d.rectangle((x + 6, y + 6, x + w + 6, y + 44), fill=NO); d.rectangle((x, y, x + w, y + 38), fill=PA, outline=NO, width=3)
    d.rectangle((x + 10, y + 10, x + 28, y + 28), fill=MA if escuro else SA, outline=NO, width=2)
    L.txt(d, x + 40, y + 3, texto, L.fonte(26, 600), FL)


def _mapa(d, e, u, R):
    a, dur = e['acao'], e['dur']; fase = u / dur; LESTE, YANO = R['dsei_leste'], R['dsei_yanomami']
    if a == 'dsei' and u > 0.5:                               # a legenda do ponto
        L.chip(d, 60, 474, R['polo_base'], PA, quad=PA); d.rectangle((78, 491, 88, 501), fill=NO)
    elif a == 'dois':
        L.chip(d, 60, 474, LESTE, PA, quad=PA)
        if fase >= 0.42:
            L.chip(d, 60, 530, YANO, MA, quad=MA)
    elif a == 'polos':                                        # a conta dos polos-base, distrito por distrito
        n1, n2 = conta_polos(u, dur); L.chip(d, 60, 474, '%s: %d' % (LESTE, n1), PA, quad=PA)
        if fase >= 0.42:
            L.chip(d, 60, 530, '%s: %d' % (YANO, n2), MA, quad=MA)
    elif a in ('segue', 'casai'):
        L.chip(d, 60, 474, LESTE, PA, quad=PA); L.chip(d, 60, 530, YANO, MA, quad=MA)
    if a == 'segue' or (a == 'dois' and fase >= 0.42):        # de que lado da divisa esta cada pedaco
        L.chip(d, 610, 915, R['roraima'], PA, size=26); L.chip(d, 130, 1000, R['amazonas'], PA, size=26)
    if a == 'casai':
        bx, by = K.mapa(True)[1](K.BV); w = L.largura_chip(R['casai'])
        L.chip(d, min(bx * 5 + 30, 1000 - w), L.tela(by) + 34, R['casai'], PA)


def _cidade(d, e, u, R):
    a = e['acao']
    if a == 'enxerga' and u > 0.5:
        L.chip(d, 60, 384, R['cobertura'], PA)
    elif a == 'sede' and u > 0.3:                             # a placa do predio: o gestor e a Secretaria
        sx, sy = b_cid('enxerga' in e['feitas'])[1][1]; t = R['secretaria']; w = L.largura_chip(t, size=28)
        L.chip(d, max(60, min(sx * 5 - w // 2, 1010 - w)), L.tela(sy - 21) - 56, t, MA, size=28)


def _rua(d, e, u, R):
    if e['acao'] == 'casas' and u > 1.0:
        L.chip(d, 60, 1000, R['microarea'], MA)


def _aldeia(d, e, u, R):
    if e['acao'] == 'degrau' and u > 0.8:                     # o mesmo degrau, dos dois lados
        w = L.largura_chip(R['acs_cidade'], size=28)
        L.chip(d, 585 - w, 800, R['acs_cidade'], SA, size=28); L.chip(d, 597, 800, R['ais_aldeia'], MA, size=28)


def _escada(d, e, u, R):
    ne, nd = conta_degraus(e['feitas'], u, e['dur'])
    for k in range(4):
        y = L.tela(100 + 36 * k) + 62
        if k < ne:
            L.txt(d, 250, y, R['degraus_cidade'][k], L.fonte(40, 700), NO); aba(d, 60, 1396 + 44 * k, 440, R['pilha_cidade'][k], False)
        if k < nd:
            L.txt(d, 808, y, R['degraus_aldeia'][k], L.fonte(40, 700), PA); aba(d, 572, 1396 + 44 * k, 352, R['pilha_aldeia'][k], True)


_marca = {}


def _marca_canto(fr, d, e, u, R):
    c, a = e['cena'], e.get('acao')
    if (c, a) in (('area', 'ubs'), ('escada', 'resposta1')) and 1.0 < u < 4.0 and R.get('marca'):   # a marca, discreta, no canto
        if c not in _marca:
            cor = NO if c == 'area' else PA                   # tinta escura na cena clara, clara na escura
            im = Image.new('RGBA', (200, 40), (0, 0, 0, 0)); dd = ImageDraw.Draw(im); dd.fontmode = '1'
            dd.text((0, 0), R['marca'], font=L.fonte(28, 600), fill=cor + (178,)); _marca[c] = im
        L.cola(fr, _marca[c], 1000 - int(L.tlen(d, R['marca'], L.fonte(28, 600))), L.YP - 50, min(1.0, (u - 1.0) / 0.4, (4.0 - u) / 0.4))


ROT = dict(mapa=_mapa, cidade=_cidade, rua=_rua, aldeia=_aldeia, escada=_escada)   # o "FASE CONCLUÍDA" do fim saiu em 14/11, a pedido dele


def rotulos(fr, d, e, u, r):
    R = r['rotulos']
    if e['cena'] in ROT:
        ROT[e['cena']](d, e, u, R)
    _marca_canto(fr, d, e, u, R)


def fracao(e):
    """o instante de cada momento na folha de momentos"""
    if e.get('pergunta'):
        return 0.4
    if e['cena'] == 'escada':
        return 0.97
    if e.get('nota') or e.get('ficha') or e.get('lista'):
        return 0.85
    return 0.7 if e.get('contador') else 0.62
