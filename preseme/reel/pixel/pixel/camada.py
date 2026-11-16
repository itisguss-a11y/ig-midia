#!/usr/bin/env python3
# PRESEME · motor de pixel art · passada 2: a camada de texto de cada quadro, em 1080 x 1920, por cima da cena ampliada.
# Papeis que sobem e descem com o texto se escrevendo, a pergunta em destaque, o cartao de cima, as caixinhas de fase,
# o contador, as fichas, a Nota com o carimbo e a abertura (o problema em destaque, de reel_abertura.py, 14/11).
# Tudo e funcao do tempo dentro do momento (u), como na passada 1.
# Saiu de reel_camada.py do reel "A casa 12" (14/11/2026), sem mudar nenhum traco. O que era da peca virou gancho:
# os rotulos soltos (CFG['rotulos'], funcao da peca), o brasao (CFG['brasao'], um caminho dado na hora) e as caixinhas
# de fase (r['hud'], liga por padrao).
import math
from PIL import Image, ImageDraw
import letras as L, papeis as P
from nucleo import FPS, W, H, PA, MA, CO, NO, sm

CFG = {'brasao': None, 'rotulos': None}
_spr = {}


def spr(chave, fn):
    if chave not in _spr:
        _spr[chave] = fn()
    return _spr[chave]


def brasao(n):
    return L.brasao_pixel(CFG['brasao'], n, 3) if CFG['brasao'] else None


def tem_folha(e):
    return e['cena'] != 'trans' and bool(e.get('fala') or e.get('lista') or e.get('agradecimento'))


def folha(e, r):
    """o papel deste momento: fundo, texto, e as versoes prontas (so escrita; escrita e com os vistos)"""
    def f():
        c = r['cenas'][e['cena']]; tipo = c['papel']; extra = {}
        if tipo == 'relatorio':
            extra['grafico'] = bool(e.get('grafico'))
        if tipo == 'cartao':
            extra['brasao'] = brasao(36)
        m = P.monta(tipo, e.get('nivel', c.get('nivel', '')), r['papeis'].get(tipo, ''), e.get('fala') or e.get('agradecimento') or '',
                    e.get('lista'), e.get('colunas', 1), **extra)
        m['escrita'] = Image.alpha_composite(m['bg'], m['txt']); m['cheia'] = m['escrita'].copy(); d = ImageDraw.Draw(m['cheia'])
        for (x, y) in m['caixas']:
            P.visto(d, x - P.REC[0], y - P.REC[1])
        return m
    return spr(('folha', e['i']), f)


def prepara(r, tl):
    """marca em cada momento o cartao de cima que vale e como o papel entra e sai; devolve os sons que nascem do texto"""
    topo, fase, sons = None, 0, []
    for k, e in enumerate(tl):
        e['topo_antes'] = topo
        if e.get('topo'):
            if topo is not None and not e.get('pergunta'):
                sons.append({'t': e['t0'], 'som': 'sino', 'vol': 0.6})
            topo = e['topo']
        e['topo_v'] = topo
        if e['cena'] == 'trans':
            sons.append({'t': e['t0'], 'som': 'sopro', 'vol': 0.8}); continue
        c = r['cenas'][e['cena']]
        if c['fase'] > fase and k > 0:
            sons.append({'t': e['t0'] + 0.05, 'som': 'sino', 'vol': 0.5})
        fase = max(fase, c['fase'])
        if tem_folha(e):                                      # sobe do chao, ou por cima da folha anterior; desce quando o proximo nao tem papel
            e['entra'] = not (k > 0 and tem_folha(tl[k - 1])); e['sai'] = k + 1 < len(tl) and not tem_folha(tl[k + 1])
            e['pouso'] = 0.4 if e['entra'] else 0.3; m = folha(e, r); n = len(m['linhas']); e['passo'] = min(0.22, 1.1 / max(1, n))
            e['escrito'] = e['pouso'] + e['passo'] * n; nc = len(m['caixas'])
            vago = min(0.9, max(0.2, (e['dur'] - e['escrito'] - 1.8) / max(1, nc)))
            e['vistos'] = [e['escrito'] + 0.5 + j * vago for j in range(nc)]
            sons.append({'t': e['t0'] + e['pouso'], 'som': 'lapis', 'vol': 0.3})
            sons += [{'t': e['t0'] + v, 'som': 'tique', 'vol': 0.3} for v in e['vistos']]
        if e.get('pergunta'):
            sons += [{'t': e['t0'] + 0.22, 'som': 'sino', 'vol': 0.9}, {'t': e['t0'] + 3.4, 'som': 'sopro', 'vol': 0.5}]
        if e.get('ficha'):
            sons.append({'t': e['t0'] + 0.1, 'som': 'tique'})
        if e.get('nota'):
            sons += [{'t': e['t0'] + 0.05, 'som': 'lapis'}, {'t': e['t0'] + 0.6 * e['dur'], 'som': 'baque'}]
        if e.get('contador'):
            sons += [{'t': e['t0'] + 0.2, 'som': 'tique'}, {'t': e['t0'] + 0.42 * e['dur'], 'som': 'sino', 'vol': 0.6}]
    return sons


def papel(fr, d, e, u, r, tl):
    m = folha(e, r); dur = e['dur']; x0, y0 = P.REC[0], P.REC[1]; pouso = e['pouso']
    if u < pouso:                                             # a folha sobe; a anterior, se houver, espera por baixo
        if not e['entra']:
            L.cola(fr, folha(tl[e['i'] - 1], r)['cheia'], x0, y0)
        L.cola(fr, m['bg'], x0, y0 + int(round((1 - u / pouso) ** 3 * (840 if e['entra'] else 720)))); return
    dy = int(round(((u - dur + 0.3) / 0.3) ** 2 * 840)) if (e['sai'] and u > dur - 0.3) else 0
    if u >= e['escrito']:
        n = len([v for v in e['vistos'] if u >= v])
        if n == len(e['vistos']):
            L.cola(fr, m['cheia'], x0, y0 + dy); return
        L.cola(fr, m['escrita'], x0, y0 + dy)
        for (x, y) in m['caixas'][:n]:
            P.visto(d, x, y + dy)
        return
    L.cola(fr, m['bg'], x0, y0)
    for k, (a, b) in enumerate(m['linhas']):                  # o texto se escreve linha por linha, da esquerda para a direita
        p = (u - pouso - k * e['passo']) / e['passo']
        if p > 0:
            wl = m['txt'].width if p >= 1 else m['tx'] + int(m['tw'] * p / 20) * 20
            tira = m['txt'].crop((0, a, wl, b)); fr.paste(tira, (x0, y0 + a), tira)


def xadrez(passo):
    """a mascara de escurecer a cena em xadrez, ja do tamanho da tela grande"""
    def f():
        m = Image.new('L', (W, H), 0); px = m.load()
        for y in range(H):
            for x in range(W):
                if (x + y) % 2 == 0 and (passo == 2 or x % 2 == 0):
                    px[x, y] = 255
        return m.resize((1080, 1920), Image.NEAREST)
    return spr(('xadrez', passo), f)


def bloco_pergunta(linhas):
    """a pergunta em letra grande numa faixa de marca-texto; o "?" vem a parte, para pular"""
    texto = ' '.join(t.lstrip('*') for t in linhas).rstrip('?'); f, fi = L.fonte(96, 700), L.fonte(130, 700)
    ls = L.equilibra(texto, f, 780); lh = 116; wi = int(L.tlen(L._m, '?', fi)); wu = int(L.tlen(L._m, ls[-1], f))
    w = int(max([L.tlen(L._m, l, f) for l in ls[:-1]] + [wu + 18 + wi])) + 80; h = lh * len(ls) + 56
    im = Image.new('RGBA', (w + 14, h + 14), (0, 0, 0, 0)); d = ImageDraw.Draw(im); d.fontmode = '1'
    d.rectangle((14, 14, w + 13, h + 13), fill=NO); d.rectangle((0, 0, w - 1, h - 1), fill=MA, outline=NO, width=6)
    for i, l in enumerate(ls):
        L.txt(d, 40, 24 + lh * i, l, f, NO)
    q = Image.new('RGBA', (wi + 8, 200), (0, 0, 0, 0)); dq = ImageDraw.Draw(q); dq.fontmode = '1'; L.txt(dq, 2, 0, '?', fi, NO)
    pe = 24 + lh * (len(ls) - 1) + f.getbbox('a')[3]          # o "?" pisa na linha de base da ultima linha
    pos = (40 + wu + 18, pe - fi.getbbox('?')[3]); cheio = im.copy(); cheio.alpha_composite(q, pos)
    return im, q, pos, cheio


def pergunta(fr, e, u):
    """a pergunta do reel: a cena escurece, a pergunta salta no meio da tela e depois sobe para o cartao de cima"""
    im, q, (qx, qy), cheio = spr(('pergunta',) + tuple(e['topo']), lambda: bloco_pergunta(e['topo']))
    if u < 3.75:
        fr.paste(NO, mask=xadrez(2 if 0.12 <= u < 3.55 else 1))
    if u < 0.2 or u >= 3.85:
        return
    cx, cy = 540, 760
    if 0.5 <= u < 3.4:                                        # parada, com o "?" pulando
        x, y = cx - im.width // 2, cy - im.height // 2; L.cola(fr, im, x, y)
        L.cola(fr, q, x + qx, y + qy - 5 * int(abs(math.sin(math.pi * (u - 0.5) / 0.72)) * 3.4)); return
    if u < 0.5:
        z = 0.5 + 0.58 * sm((u - 0.2) / 0.2) - 0.08 * sm((u - 0.4) / 0.1)
    else:
        p = sm((u - 3.4) / 0.45); z = 1.0 - 0.56 * p; cy = 760 + (308 - 760) * p
    g = cheio.resize((max(2, int(cheio.width * z)), max(2, int(cheio.height * z))), Image.BILINEAR)
    L.cola(fr, g, cx - g.width // 2, int(cy) - g.height // 2)


def spr_topo(linhas):
    def f():
        im = Image.new('RGBA', (1080, 260), (0, 0, 0, 0)); d = ImageDraw.Draw(im); d.fontmode = '1'; L.cartao_topo(d, linhas, y0=4); return im
    return spr(('topo',) + tuple(linhas), f)


def topo(fr, e, u):
    if not e.get('topo_v'):
        return
    if e.get('pergunta'):                                     # o cartao antigo some; o novo so chega quando a pergunta sobe
        if u < 0.2 and e['topo_antes']:
            L.cola(fr, spr_topo(e['topo_antes']), 0, 246)
        elif u >= 3.85:
            L.cola(fr, spr_topo(e['topo_v']), 0, 246)
        return
    al = min(1.0, (int(round(u * FPS)) + 1) / 6) if (e.get('topo') and e['topo_antes'] is not None) else 1.0
    if al < 1.0:
        L.cola(fr, spr_topo(e['topo_antes']), 0, 246, 1 - al)
    L.cola(fr, spr_topo(e['topo_v']), 0, 246, al)


def bloco_abertura(linhas, cor=CO):
    """o balao grande da abertura: a frase do primeiro cartao, centrada, com o bico apontando para baixo"""
    ls = [l.lstrip('*') for l in linhas]
    for size in (96, 92, 88, 84, 80, 76, 72):
        f = L.fonte(size, 700)
        if max(L.tlen(L._m, l, f) for l in ls) <= 840:
            break
    lh = int(size * 1.22); w = int(max(L.tlen(L._m, l, f) for l in ls)) + 100; h = lh * len(ls) + 64; cx = w // 2
    im = Image.new('RGBA', (w + 14, h + 72), (0, 0, 0, 0)); d = ImageDraw.Draw(im); d.fontmode = '1'
    d.rectangle((14, 14, w + 13, h + 13), fill=NO); d.polygon([(cx - 28, h + 13), (cx + 56, h + 13), (cx + 14, h + 70)], fill=NO)
    d.rectangle((0, 0, w - 1, h - 1), fill=cor, outline=NO, width=6)
    d.polygon([(cx - 44, h - 6), (cx + 44, h - 6), (cx, h + 58)], fill=NO); d.polygon([(cx - 32, h - 8), (cx + 32, h - 8), (cx, h + 44)], fill=cor)
    for i, l in enumerate(ls):
        L.txt(d, (w - L.tlen(d, l, f)) // 2, 28 + lh * i, l, f, NO)
    return im


def abertura(fr, u, linhas, janela=None, dur=4.4):
    """a abertura (o problema em destaque, antes do primeiro momento): a cena escurece em xadrez, menos a janela (o retangulo
    da tela grande que fica aceso, com moldura); a frase salta num balao Coral; no fim o balao sobe e vira o cartao de cima"""
    im = spr(('abertura',) + tuple(linhas), lambda: bloco_abertura(linhas)); sobe = dur - 0.6; some = dur - 0.2
    if u < dur - 0.1:                                         # a cena escurece, menos a janela
        m = xadrez(2 if 0.1 <= u < sobe + 0.15 else 1).copy()
        if janela:
            ImageDraw.Draw(m).rectangle(tuple(janela), fill=0)
        fr.paste(NO, mask=m)
        if janela:
            d = ImageDraw.Draw(fr); x0, y0, x1, y1 = janela
            for k, c in enumerate((NO, MA, MA, NO)):          # a moldura de "e esta casa"
                d.rectangle((x0 - 20 + 5 * k, y0 - 20 + 5 * k, x1 + 20 - 5 * k, y1 + 20 - 5 * k), outline=c, width=5)
    cx, cy, z = 540, 430, 1.0
    if u < 0.35:
        z = 0.5 + 0.58 * sm(u / 0.22) - 0.08 * sm((u - 0.25) / 0.1)
    elif u >= sobe:
        p = sm((u - sobe) / 0.45); z = 1.0 - 0.42 * p; cy = 430 - 80 * p
    al = 1.0 if u < some else max(0.0, 1 - (u - some) / 0.2)
    if al < 1.0:                                              # nos ultimos quadros o balao vira o cartao de cima
        L.cola(fr, spr_topo(linhas), 0, 246, 1 - al)
    g = im if z == 1.0 else im.resize((max(2, int(im.width * z)), max(2, int(im.height * z))), Image.BILINEAR)
    L.cola(fr, g, cx - g.width // 2, int(cy) - g.height // 2, al)


def pecas(fr, d, e, u, r):
    dur = e['dur']
    if e.get('contador'):                                     # conta ate 'a'; depois dos 42 % do momento, mostra 'b' (se houver)
        ct = r['contador']; a, b = ct['a'], ct.get('b')
        if b is None or u < 0.42 * dur:
            L.contador(d, str(int(min(1.0, u / 0.9) * int(a[0]) // 10 * 10)), a[1], antes=(a[2] if len(a) > 2 else None))
        else:
            L.contador(d, b[0], b[1], antes=(b[2] if len(b) > 2 else None))
    if e.get('ficha'):                                        # a ficha entra pela direita e sai pela esquerda
        s = spr(('ficha', e['ficha']), lambda: L.sprite_ficha(r, e['ficha']))
        x = 1080 - 1030 * sm(u / 0.45) if u < dur - 0.35 else 50 - 1040 * sm((u - dur + 0.35) / 0.35) ** 2
        L.cola(fr, s, x, 1545 - (s.height - 12))
    if e.get('nota'):                                         # a Nota sobe; o carimbo bate aos 60 %
        p = e['nota']; s, yfim = spr(('nota', p['titulo']), lambda: P.nota(p, brasao(44)))
        y0 = 1556 - (s.height - 12)
        y = 1920 - (1920 - y0) * sm(u / 0.5) if u < dur - 0.35 else y0 + (1920 - y0) * sm((u - dur + 0.35) / 0.35) ** 2
        L.cola(fr, s, 80, y)
        if u >= 0.6 * dur and p.get('carimbo'):
            cb = spr(('carimbo', p['carimbo']), lambda: L.sprite_carimbo(p['carimbo'])); z = 1 + 0.6 * max(0.0, 1 - (u - 0.6 * dur) / 0.13)
            if z > 1.01:
                cb = cb.resize((int(cb.width * z), int(cb.height * z)), Image.NEAREST)
            L.cola(fr, cb, 660 - cb.width // 2, y + yfim + 108 - cb.height // 2)


def camada(fr, e, u, r, tl):
    d = ImageDraw.Draw(fr); d.fontmode = '1'; dur = e['dur']
    if e['cena'] == 'trans':
        ca, cb = r['cenas'][e['de']], r['cenas'][e['para']]; c = ca if u < dur / 2 else cb
        fase, escuro = (ca['fase'] if u < dur / 2 else max(ca['fase'], cb['fase'])), c.get('escuro', False)
    else:
        c = r['cenas'][e['cena']]; fase, escuro = c['fase'], c.get('escuro', False)
        if not c.get('fase_fixa'):                            # a fase nunca volta, a nao ser na cena marcada como fase_fixa
            fase = max(fase, max([r['cenas'][x['cena']]['fase'] for x in tl[:e['i']] if x['cena'] != 'trans'] or [0]))
        if CFG['rotulos']:
            CFG['rotulos'](fr, d, e, u, r)
    topo(fr, e, u)
    if r.get('hud', True):
        L.hud(d, fase, escuro)
    if e['cena'] != 'trans':
        if tem_folha(e):
            papel(fr, d, e, u, r, tl)
        pecas(fr, d, e, u, r)
        if e.get('pergunta'):
            pergunta(fr, e, u)
    return fr
