#!/usr/bin/env python3
# PRESEME · peca de teste do motor de pixel art (16/11/2026). Nao vai ao ar. E tambem o modelo que o comando "novo" copia.
# So o que e desta peca: a coreografia de cada cena (quem anda, o que pisca, que som toca) e o rotulo solto. Os cenarios,
# os bonecos, os papeis, a ficha, o contador, a Nota, o carimbo e as transicoes sao da biblioteca (pasta pixel).
# Cada cena e uma funcao do tempo: cena(acao, u, dur, feitas, t) devolve a tela pequena (216 x 384) do quadro.
#   acao = a acao do momento no roteiro.json; u = segundos dentro do momento; dur = duracao dele;
#   feitas = acoes ja passadas nesta cena (desde a ultima transicao); t = tempo do video.
# Som: ev(chave, som, volume) pede um efeito (pop, tique, sopro, gota, sino, certo, baque, lapis) no quadro em que aparece;
# cada chave toca uma vez so.
import random
from PIL import Image, ImageDraw
import nucleo as N, cenarios as K, letras as L
from nucleo import PA, MA, FO, NO, ACS, MINI, ev, sm, novo, memo, pisca, moldura


def fundo(chave, desenho, semente):
    """o cenario parado, desenhado uma vez so e copiado a cada quadro"""
    def f():
        im, d = novo(); desenho(d, random.Random(semente)); return im
    return memo(chave, f)


# ---------------------------------------------------------------- cena 1: a casa
def cena_casa(acao, u, dur, feitas, t):
    im = fundo('ex-casa', lambda d, rnd: K.cena_casa(d, rnd, balao=False, numero='7'), 7).copy(); d = ImageDraw.Draw(im)
    if pisca(t):                                              # o balao de alerta pisca em cima da casa
        N.bubble(d, 120, 164, card=True)
    p = sm(min(1.0, u / (0.7 * dur)))                         # um morador sai pela porta e vai ate o portao
    pe = -1 if (p < 1 and (t % 0.36) < 0.18) else 0
    N.sprite(d, 101, int(226 + 40 * p) + pe, MINI, {'h': NO, 'X': MA}, sc=2)
    if p >= 1:
        ev('ex-portao', 'pop', 0.6)
    return im


# ---------------------------------------------------------------- cena 2: a rua (o bairro da biblioteca, com o agente)
PARA = 118                                                    # onde o agente para, na frente da casa 7


def cena_rua(acao, u, dur, feitas, t):
    im = fundo('ex-rua', lambda d, rnd: K.bairro(d, rnd, numero='7'), 22).copy(); d = ImageDraw.Draw(im)
    if acao == 'anda':                                        # o agente entra pela esquerda e anda ate a casa 7
        p = min(1.0, u / (0.8 * dur)); x = int(round(-20 + (PARA + 20) * p)); andando = p < 1
    else:
        x, andando = PARA, False
    if x > 0:                                                 # o caminho que ele fez
        N.dashed(d, [(0, 185), (min(128, x + 12), 185)], FO, on=2, off=2, w=2)
    for i in range(5):                                        # casa por onde ele passou ganha a marca
        if x >= K.XS_RUA[i] - 2:
            for y in (156, 198):
                N.check(d, K.XS_RUA[i] + 5, y + 4)
            ev('ex-marca%d' % i, 'pop', 0.7)
    N.sprite(d, x, 163 - (1 if (andando and (t % 0.36) < 0.18) else 0), ACS, sc=2)
    if acao == 'para':                                        # parado: a casa 7 ganha a moldura e o balao pisca
        moldura(d, (139, 195, 163, 217))
        if pisca(t):
            N.bubble(d, 164, 178, card=False)
        ev('ex-para', 'sino', 0.6)
    return im


# ---------------------------------------------------------------- cena 3: a UBS por dentro
def cena_ubs(acao, u, dur, feitas, t):
    im = fundo('ex-ubs', K.cena_ubs_dentro, 31).copy(); d = ImageDraw.Draw(im)
    if acao == 'conta' and pisca(t, 0.8, 0.5):                # a farmacia pisca enquanto o contador conta (a fileira de cima
        moldura(d, (76, 187, 141, 251))                       # fica embaixo do contador)
    if acao == 'fim' and u > 0.4:                             # a marca de feito, em dobro, no meio da UBS
        c = Image.new('RGB', (11, 10), NO); N.check(ImageDraw.Draw(c), 1, 1)
        im.paste(c.resize((22, 20), Image.NEAREST), (97, 148)); ev('ex-fim', 'certo')
    return im


CENAS = {'casa': cena_casa, 'rua': cena_rua, 'ubs': cena_ubs}


# ---------------------------------------------------------------- passada 2: o rotulo solto desta peca
def rotulos(fr, d, e, u, r):
    """a etiqueta da rua (o texto vem do roteiro.json, "rotulos", e entra no textos.txt)"""
    if e['cena'] == 'rua':
        L.chip(d, 600, L.tela(150), r['rotulos']['etiqueta'], PA)
