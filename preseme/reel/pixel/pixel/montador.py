#!/usr/bin/env python3
# PRESEME · motor de pixel art · o montador: linha do tempo, passada 1 (a cena, quadro a quadro, na tela pequena), passada 2
# (a camada de texto), a abertura, capa, folha de momentos, quadros soltos, video com som, textos.txt, o JSON de cortes e a
# pasta para o motor do reel. Saiu de reel.py, reel_base.py, reel_base3.py e reel_abertura.py do reel "A casa 12" (14/11/2026),
# sem mudar nenhum traco.
import os, sys, re, json, glob, hashlib, subprocess
from PIL import Image, ImageDraw
import nucleo as N, letras as L, papeis as P, camada as C
from nucleo import FPS, MA, NO

AQUI = os.path.dirname(os.path.abspath(__file__))
CFG = {'peca': None, 'pasta_peca': None, 'sem_abertura': False}
CENAS = {}                                                    # nome da cena -> funcao(acao, u, dur, feitas, t), vindas da peca


# ---------------------------------------------------------------- a peca e a linha do tempo
def texto_do_momento(r, b):
    s = ' '.join(b.get('topo', [])) + ' ' + b.get('fala', '') + ' ' + ' '.join(b.get('lista', [])) + ' ' + b.get('agradecimento', '')
    if 'ficha' in b:
        f = r['fichas'][b['ficha']]; s += ' ' + f['titulo'] + ' ' + ' '.join(a + ' ' + c for a, c in f['linhas'])
    if 'nota' in b:
        p = b['nota']; s += ' ' + p['titulo'] + ' ' + p['texto'] + ' ' + p.get('carimbo', '')
    return s.replace('*', '').strip()


def palavras(r, b):
    return len([w for w in texto_do_momento(r, b).split() if re.search(r'\w', w)])


def linha_do_tempo(r):
    """cada momento ('beat') ganha o primeiro quadro, o numero de quadros e as acoes ja feitas na cena; sem 'dur', o tempo sai
    do numero de palavras (ritmo: base + por_palavra, entre min e max). Sem 'ritmo' no roteiro vale a regra de leitura do
    projeto (palavras / 2,17 + 0,5 s com a frase inteira na tela): 0,46 s por palavra e 1,7 s de base (0,5 de folga, ate
    0,9 para o papel subir e se escrever e 0,3 para ele descer). O "A casa 12" traz o ritmo dele (1,3 + 0,32), mais rapido."""
    rit = r.get('ritmo', {}); a = rit.get('base', 1.7); p = rit.get('por_palavra', 0.46)
    mn = rit.get('min', 2.6); mx = rit.get('max', 11.5)
    tl, f, bloco = [], 0, []
    for i, b in enumerate(r['beats']):
        dur = b.get('dur') or min(mx, max(mn, a + p * palavras(r, b)))
        nf = int(round(dur * FPS)); e = dict(b); e.update(i=i, f0=f, nf=nf, t0=f / FPS, dur=nf / FPS)
        if b['cena'] == 'trans':
            bloco = []; e['feitas'] = ()
        else:
            e['feitas'] = tuple(bloco); bloco.append(b['acao'])
        tl.append(e); f += nf
    return tl, f


def carrega(pasta_peca, dados=None, brasao=None):
    """le o roteiro.json e o peca.py da pasta da peca; devolve (r, tl, total)"""
    import importlib.util
    pasta_peca = os.path.abspath(pasta_peca); sys.path.insert(0, pasta_peca)
    r = json.load(open(os.path.join(pasta_peca, 'roteiro.json'), encoding='utf-8'))
    spec = importlib.util.spec_from_file_location('peca', os.path.join(pasta_peca, 'peca.py')); m = importlib.util.module_from_spec(spec)
    sys.modules['peca'] = m; spec.loader.exec_module(m)
    CFG.update(peca=m, pasta_peca=pasta_peca); CENAS.clear(); CENAS.update(m.CENAS)
    if dados:
        N.DADOS[0] = os.path.abspath(dados)
    C.CFG['brasao'] = os.path.abspath(brasao) if brasao else None
    C.CFG['rotulos'] = getattr(m, 'rotulos', None)
    if r.get('usa_brasao') and not C.CFG['brasao']:
        print('AVISO: esta peca usa o brasao da UFRR e nenhum arquivo foi dado (--brasao <arquivo>); a Nota e o cartao saem sem ele.')
    if r.get('usa_mapa') and not os.path.exists(os.path.join(N.DADOS[0], 'rr-mun.json')):
        sys.exit('PAROU: esta peca usa o mapa de Roraima e os dados nao estao em %s. Rode: python3 -I pixel/motor.py dados' % N.DADOS[0])
    if r.get('abertura') and not r['beats'][0].get('topo'):
        sys.exit('PAROU: a abertura usa o cartao de cima ("topo") do primeiro momento, e ele nao tem')
    tl, total = linha_do_tempo(r)
    return r, tl, total


# ---------------------------------------------------------------- a abertura (o problema em destaque, antes do primeiro momento)
def abertura_nf(r):
    """quantos quadros tem a abertura (0 sem abertura, ou com a opcao --sem-abertura). Ela entra antes do primeiro quadro do
    roteiro: no video final, tudo o que e do roteiro acontece abertura_nf / 30 segundos mais tarde."""
    ab = r.get('abertura')
    return int(round(float(ab.get('dur', 4.4)) * FPS)) if (ab and not CFG['sem_abertura']) else 0


def quadro_abertura(r, n):
    """o quadro n da abertura: a cena do primeiro momento, com o tempo dela terminando em zero (emenda com o video), as
    caixinhas de fase, a cena escurecida menos a janela e o balao com a frase do primeiro cartao (reel_abertura.py, 14/11)"""
    ab = r['abertura']; dur = float(ab.get('dur', 4.4)); b = r['beats'][0]; u = n / FPS; c = r['cenas'][b['cena']]
    guarda = set(N._vistos); nev = len(N.EV); N.TNOW[0] = u - dur          # a abertura nao dispara os sons do desenho
    base = CENAS[b['cena']](b['acao'], u, dur, (), u - dur)
    N._vistos.clear(); N._vistos.update(guarda); del N.EV[nev:]
    fr = L.amplia(base)
    if r.get('hud', True):
        L.hud(ImageDraw.Draw(fr), c['fase'], c.get('escuro', False))
    C.abertura(fr, u, b['topo'], ab.get('janela'), dur)
    return fr


def efeitos_do_video(r, sons):
    """os efeitos no tempo do video final: os da abertura e, depois dela, os do desenho e do texto"""
    nab = abertura_nf(r); off = nab / FPS
    ab = [dict(e) for e in r['abertura'].get('sons', [])] if nab else []
    return sorted(ab + [dict(e, t=round(e['t'] + off, 3)) for e in (sons or [])], key=lambda e: e['t'])


def som_com_abertura(wav, r, pasta, trilha_py):
    """silencio do tamanho da abertura + a trilha (a musica entra no mesmo ponto de sempre), com os sons da abertura por
    cima no volume que os efeitos tem dentro da trilha (0,3 do volume pedido); o volume de celular vem depois, no video inteiro"""
    import wave, importlib.util
    import numpy as np
    spec = importlib.util.spec_from_file_location('trilha_abertura', trilha_py); TR = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(TR)
    with wave.open(wav) as w:
        sr = w.getframerate(); y = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').reshape(-1, 2).astype(float) / 32768
    rng = np.random.default_rng(12); out = np.vstack([np.zeros((int(round(sr * abertura_nf(r) / FPS)), 2)), y])
    for e in r['abertura'].get('sons', []):
        som = TR.EFEITOS[e['som']](rng) * float(e.get('vol', 1)) * 0.3; i = int(sr * float(e['t'])); som = som[:max(0, len(out) - i)]
        out[i:i + len(som), 0] += som; out[i:i + len(som), 1] += som
    out = np.clip(out, -0.98, 0.98); final = os.path.join(pasta, 'som_com_abertura.wav')
    with wave.open(final, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((out * 32767).astype('<i2').tobytes())
    return final


# ---------------------------------------------------------------- passada 1: a cena
def desenha(tl, k, n):
    e = tl[k]; u = (n - e['f0']) / FPS
    return CENAS[e['cena']](e['acao'], u, e['dur'], e['feitas'], n / FPS)


def quadro(tl, n):
    """a cena do quadro n, na tela pequena; numa transicao, as pontas sao o ultimo quadro de antes e o primeiro de depois"""
    k = next(i for i, e in enumerate(tl) if e['f0'] <= n < e['f0'] + e['nf']); e = tl[k]
    N.TNOW[0] = n / FPS
    if e['cena'] != 'trans':
        return desenha(tl, k, n)
    guarda = set(N._vistos); nev = len(N.EV)                  # as pontas da transicao nao disparam som
    A = desenha(tl, k - 1, e['f0'] - 1); B = desenha(tl, k + 1, e['f0'] + e['nf'])
    N._vistos.clear(); N._vistos.update(guarda); del N.EV[nev:]
    return N.transicao(e['modo'], A, B, (n - e['f0'] + 1) / (e['nf'] + 1), e.get('alvo'))


def assinatura(tl):
    """muda quando muda o desenho (o codigo do nucleo, dos cenarios ou da peca) ou o tempo de algum momento"""
    h = hashlib.sha256()
    for path in [os.path.join(AQUI, 'nucleo.py'), os.path.join(AQUI, 'cenarios.py')] + sorted(glob.glob(os.path.join(CFG['pasta_peca'], '*.py'))):
        h.update(open(path, 'rb').read())
    h.update(json.dumps([[e['cena'], e.get('acao'), e.get('modo'), e.get('alvo'), e['nf']] for e in tl]).encode())
    return h.hexdigest()


def base_valida(tl, total, pasta):
    man = os.path.join(pasta, 'base', 'manifesto.json')
    if not os.path.exists(man):
        return None
    m = json.load(open(man))
    if m.get('ass') == assinatura(tl) and m.get('total') == total and os.path.exists(os.path.join(pasta, 'base', '%05d.png' % (total - 1))):
        return m
    return None


def passada_base(tl, total, pasta):
    base = os.path.join(pasta, 'base'); os.makedirs(base, exist_ok=True)
    m = base_valida(tl, total, pasta)
    if m:
        print('passada 1: o desenho e o mesmo da ultima vez, pulando'); return m['eventos']
    N.EV.clear(); N._vistos.clear()
    for n in range(total):
        quadro(tl, n).save(os.path.join(base, '%05d.png' % n), compress_level=1)
        if n % 900 == 0:
            print('passada 1:', n, '/', total, flush=True)
    json.dump({'ass': assinatura(tl), 'total': total, 'eventos': N.EV}, open(os.path.join(base, 'manifesto.json'), 'w'))
    return list(N.EV)


# ---------------------------------------------------------------- passada 2: a camada de texto
def momento(tl, n):
    return next(x for x in tl if x['f0'] <= n < x['f0'] + x['nf'])


def monta(tl, n, r, pasta):
    e = momento(tl, n)
    base = Image.open(os.path.join(pasta, 'base', '%05d.png' % n)).convert('RGB')
    return C.camada(L.amplia(base), e, (n - e['f0']) / FPS, r, tl)


def quadro_da_capa(tl):
    """o momento marcado com "capa": true e o primeiro quadro dele em que o balao de alerta esta aceso"""
    e = next(x for x in tl if x.get('capa'))
    return e, next(m for m in range(e['f0'], e['f0'] + e['nf']) if (m / FPS) % 0.8 < 0.4)


def capa(tl, r, pasta, salva=True):
    """a capa: o quadro do momento marcado com "capa": true (no instante em que o balao de alerta esta aceso),
    com o cartao de cima em letra grande, dentro do recorte 3:4 da grade"""
    e, n = quadro_da_capa(tl)
    garante_base(tl, [n], pasta)
    fr = L.amplia(Image.open(os.path.join(pasta, 'base', '%05d.png' % n)).convert('RGB')); d = ImageDraw.Draw(fr); d.fontmode = '1'
    f = L.fonte(86, 700); ls = L.equilibra(' '.join(x.lstrip('*') for x in e['topo_v']), f, 880); L.card(d, (60, 380, 1020, 630))
    for i, l in enumerate(ls):
        w = L.tlen(d, l, f); x = (1080 - w) // 2; y = 398 + 108 * i
        d.rectangle((x - 14, y + 8, x + w + 14, y + 104), fill=MA); L.txt(d, x, y, l, f, NO)
    if salva:
        fr.save(os.path.join(pasta, 'capa.png'))
        fr.crop((0, 240, 1080, 1680)).resize((540, 720), Image.LANCZOS).save(os.path.join(pasta, 'capa-grade.jpg'), quality=90)
    return fr


def fracao_padrao(e):
    if e.get('pergunta'):
        return 0.4
    if e.get('nota') or e.get('ficha') or e.get('lista'):
        return 0.85
    return 0.7 if e.get('contador') else 0.62


def fracao(e):
    f = getattr(CFG['peca'], 'fracao', None)
    return f(e) if f else fracao_padrao(e)


def garante_base(tl, ns, pasta):
    """desenha so os quadros pedidos da passada 1, quando a passada inteira nao esta pronta (ou mudou)"""
    if base_valida(tl, tl[-1]['f0'] + tl[-1]['nf'], pasta):
        return
    os.makedirs(os.path.join(pasta, 'base'), exist_ok=True)
    for n in ns:
        quadro(tl, n).save(os.path.join(pasta, 'base', '%05d.png' % n), compress_level=1)


def folha(tl, r, pasta, pares=None, nome='folha-momentos.png', cols=8):
    """uma folha com um quadro de cada momento que tem texto (ou os pares momento:fracao pedidos)"""
    if pares is None:
        pares = [(e['i'], fracao(e)) for e in tl if e['cena'] != 'trans' and texto_do_momento(r, e)]
    ns = [tl[i]['f0'] + min(tl[i]['nf'] - 1, int(tl[i]['nf'] * fr_)) for i, fr_ in pares]
    garante_base(tl, ns, pasta)
    qs = [monta(tl, n, r, pasta) for n in ns]
    tw, th = 270, 480; rows = (len(qs) + cols - 1) // cols
    sh = Image.new('RGB', (cols * (tw + 4) + 4, rows * (th + 4) + 4), NO)
    for k, q in enumerate(qs):
        sh.paste(q.resize((tw, th), Image.LANCZOS), (4 + (k % cols) * (tw + 4), 4 + (k // cols) * (th + 4)))
    sh.save(os.path.join(pasta, nome)); return qs


def instante(tl, s, nab=0):
    """'12.5' (segundos do video final, com a abertura) | '#1234' (quadro do roteiro, sem a abertura) | '3:0.4' (momento:fracao)
    | 'ab66' ou 'ab:0.5' (quadro da abertura) -> ('ab', n) para a abertura ou ('', n) para o roteiro"""
    total = tl[-1]['f0'] + tl[-1]['nf']
    if s.startswith('ab'):
        n = int(nab * float(s[3:])) if s.startswith('ab:') else int(s[2:])
        return 'ab', max(0, min(nab - 1, n))
    if s.startswith('#'):
        n = int(s[1:])
    elif ':' in s:
        i, f_ = s.split(':'); i = int(i); n = tl[i]['f0'] + min(tl[i]['nf'] - 1, int(tl[i]['nf'] * float(f_)))
    else:
        n = int(round(float(s.rstrip('s')) * FPS))
        if n < nab:
            return 'ab', n
        n -= nab
    return '', max(0, min(total - 1, n))


def quadros_soltos(tl, r, pasta, alvos, nome='quadros.png'):
    """desenha so os quadros pedidos (sem a passada inteira), salva cada um em PNG e uma folha; devolve as impressoes digitais"""
    nab = abertura_nf(r); ns = [instante(tl, a, nab) for a in alvos]; garante_base(tl, [n for k, n in ns if not k], pasta); out = []
    for k, n in ns:
        if k:                                                 # quadro da abertura
            fr = quadro_abertura(r, n); fr.save(os.path.join(pasta, 'qab%03d.png' % n))
            out.append({'quadro': 'ab%d' % n, 'segundos': round(n / FPS, 3), 'momento': -1, 'cena': 'abertura',
                        'acao': r['beats'][0]['acao'], 'sha256': hashlib.sha256(fr.tobytes()).hexdigest(), 'img': fr})
            continue
        fr = monta(tl, n, r, pasta); fr.save(os.path.join(pasta, 'q%05d.png' % n)); e = momento(tl, n)
        out.append({'quadro': n, 'segundos': round((n + nab) / FPS, 3), 'momento': e['i'], 'cena': e['cena'], 'acao': e.get('acao', e.get('modo')),
                    'sha256': hashlib.sha256(fr.tobytes()).hexdigest(), 'img': fr})
    cols = min(6, len(out)); tw, th = 270, 480; rows = (len(out) + cols - 1) // cols
    sh = Image.new('RGB', (cols * (tw + 4) + 4, rows * (th + 4) + 4), NO)
    for k, q in enumerate(out):
        sh.paste(q.pop('img').resize((tw, th), Image.LANCZOS), (4 + (k % cols) * (tw + 4), 4 + (k // cols) * (th + 4)))
    sh.save(os.path.join(pasta, nome))
    return out


# ---------------------------------------------------------------- video, som, legenda, cortes
def nome_arquivo(r):
    return r.get('arquivo') or re.sub(r'[^a-z0-9]+', '-', r['nome'].lower()).strip('-')


def cortes(tl, r, sons=None):
    """o JSON de cortes: cada momento com o tempo de entrada e de saida, as trocas de cena e os efeitos que nasceram do desenho e
    do texto, no tempo do video final (com a abertura, se houver, de 0 ate 'abertura')"""
    nab = abertura_nf(r); off = nab / FPS; total = tl[-1]['f0'] + tl[-1]['nf']; cenas, trocas, ant = [], [], None
    for e in tl:
        cenas.append({'momento': e['i'], 'cena': e['cena'], 'acao': e.get('acao'), 't0': round(e['t0'] + off, 3), 't1': round(e['t0'] + e['dur'] + off, 3),
                      'transicao': e['cena'] == 'trans', **({'de': e['de'], 'para': e['para'], 'modo': e['modo']} if e['cena'] == 'trans' else {})})
        c = e['cena'] if e['cena'] != 'trans' else None
        if c and c != ant:
            trocas.append({'t': round(e['t0'] + off, 3), 'cena': c}); ant = c
    res = {'peca': r['nome'], 'fps': FPS, 'quadros': total + nab, 'duracao': round((total + nab) / FPS, 3),
           'cortes': [x['t'] for x in trocas], 'trocas': trocas, 'momentos': cenas, 'efeitos': efeitos_do_video(r, sons)}
    if nab:
        res['abertura'] = round(off, 3)
    return res


# ---------------------------------------------------------------- o motor do reel (frente B): cenas.json e a pasta "de fora"
def frases(tl, r):
    """quando cada texto da parte 1 do textos.txt esta inteiro na tela (t0) e quando comeca a sair (t1), pelo numero dele no
    textos.txt. Cartao de cima: depois de entrar (0,2 s; numa pergunta, quando ela salta no meio da tela, 0,5 s) ate o proximo
    cartao. Papel: depois de escrito ate descer (ou ate o fim do momento, quando o papel seguinte sobe por cima). Nota: depois
    de subir (0,5 s) ate comecar a descer (0,35 s antes do fim); o carimbo, depois de bater. Precisa do camada.prepara antes."""
    p1, _ = itens_de_texto(r); num = {c: n for n, c, _ in p1}
    off = abertura_nf(r) / FPS; total = (tl[-1]['f0'] + tl[-1]['nf']) / FPS; out = {}

    def poe(c, a, b):
        if c in num:
            out[num[c]] = (a + off, b + off)
    cartoes = [e for e in tl if e.get('topo')]
    for k, e in enumerate(cartoes):
        fim = cartoes[k + 1]['t0'] if k + 1 < len(cartoes) else total
        ini = e['t0'] + (0.5 if e.get('pergunta') else 0.2)
        if off and e['i'] == 0:                               # com abertura, o primeiro cartao ja esta no balao dela, desde 0,35 s
            ini = 0.35 - off
        for j in range(len(e['topo'])):
            poe(('beats', e['i'], 'topo', j), ini, fim)
    for e in tl:
        if e['cena'] == 'trans':
            continue
        i, t0, dur = e['i'], e['t0'], e['dur']
        if C.tem_folha(e):
            a, b = t0 + e['escrito'], t0 + dur - (0.3 if e['sai'] else 0.0)
            for c in [('beats', i, 'fala'), ('beats', i, 'agradecimento')] + [('beats', i, 'lista', j) for j in range(len(e.get('lista', [])))]:
                poe(c, a, b)
        if e.get('nota'):
            b = t0 + dur - 0.35
            poe(('beats', i, 'nota', 'titulo'), t0 + 0.5, b); poe(('beats', i, 'nota', 'texto'), t0 + 0.5, b)
            poe(('beats', i, 'nota', 'carimbo'), t0 + 0.6 * dur + 0.13, b)
    return {str(int(n)): {'t0': round(a, 3), 't1': round(b, 3)} for n, (a, b) in sorted(out.items(), key=lambda x: int(x[0]))}


def cenas_reel(tl, r, sons):
    """o cenas.json do contrato do motor do reel (README dele, 15/11, 23h40): as cenas emendadas de 0 a duracao (o t0 de cada
    uma e um corte), as frases, os efeitos (do desenho e do texto) e os marcadores (a capa e um quadro de cada momento com
    texto, os mesmos da folha de momentos). Corte numa transicao: o quadro do meio dela, onde a imagem mais muda nas transicoes
    afasta, aproxima e desliza. A funde e um dissolve, nao tem corte: o conferir de la avisa se uma troca de musica cair nela.
    Cena que volta mais tarde ganha numero (mapa, mapa-2), para o mapa-do-som poder dar a cada vez o seu som."""
    total = tl[-1]['f0'] + tl[-1]['nf']; cortes_, ant = [], None
    for k, e in enumerate(tl):
        if e['cena'] == 'trans' or e['cena'] == ant:
            continue
        f = 0 if not cortes_ else (tl[k - 1]['f0'] + tl[k - 1]['nf'] // 2 if tl[k - 1]['cena'] == 'trans' else e['f0'])
        cortes_.append((f, e['cena'])); ant = e['cena']
    nab = abertura_nf(r); vezes, cenas = {}, ([{'id': 'abertura', 't0': 0.0, 't1': round(nab / FPS, 3)}] if nab else [])
    for j, (f, c) in enumerate(cortes_):
        vezes[c] = vezes.get(c, 0) + 1; fim = cortes_[j + 1][0] if j + 1 < len(cortes_) else total
        cenas.append({'id': c if vezes[c] == 1 else '%s-%d' % (c, vezes[c]), 't0': round((f + nab) / FPS, 3), 't1': round((fim + nab) / FPS, 3)})
    marc = {'abertura': round(min(2.0, nab / FPS / 2), 3)} if nab else {}
    if any(x.get('capa') for x in tl):
        marc['capa'] = round((quadro_da_capa(tl)[1] + nab) / FPS, 3)
    for e in tl:
        if e['cena'] != 'trans' and texto_do_momento(r, e):
            marc['m%02d' % e['i']] = round((e['f0'] + min(e['nf'] - 1, int(e['nf'] * fracao(e))) + nab) / FPS, 3)
    ef = [{'t': round(s['t'], 3), 'som': s['som'], 'vol': s.get('vol', 1.0), 'pan': s.get('pan', 0)} for s in efeitos_do_video(r, sons)]
    return {'peca': r['nome'], 'motor': 'pixel', 'duracao': round((total + nab) / FPS, 3), 'fps': FPS, 'cenas': cenas,
            'frases': frases(tl, r), 'efeitos': ef, 'marcadores': marc}


def para_reel(tl, r, sons, pasta, pasta_peca, destino):
    """monta a pasta da peca para o motor do reel (frente B), como video de fora: peca.json ("motor": "externo"), textos.txt,
    cenas.json, mapa-do-som.json (o da pasta da peca, se houver; senao, o modo trilha com o clima e a semente do roteiro),
    legenda.txt, out/video.mp4 (a imagem sem som) e a capa deste motor (out/capa-<nome>.png e out/capa-grade.jpg)"""
    import shutil
    nome = nome_arquivo(r); mudo = os.path.join(pasta, 'video_mudo.mp4')
    if not os.path.exists(mudo):
        sys.exit('PAROU: falta o video desta peca em %s. Rode: video' % pasta)
    fontes = [os.path.join(pasta_peca, 'roteiro.json')] + glob.glob(os.path.join(pasta_peca, '*.py'))
    velhos = [os.path.basename(f) for f in fontes if os.path.getmtime(f) > os.path.getmtime(mudo)]
    if velhos:
        sys.exit('PAROU: o video e mais velho que %s. Rode: texto (so palavra trocada) ou video' % ', '.join(velhos))
    destino = os.path.abspath(destino); out = os.path.join(destino, 'out'); os.makedirs(out, exist_ok=True)
    p1, p2 = itens_de_texto(r)
    pj = {'nome': nome, 'titulo': r['nome'], 'motor': 'externo', 'capa': '@capa', 'esperado': {'frases': len(p1), 'palavras': len(p2)}}
    json.dump(pj, open(os.path.join(destino, 'peca.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    gera_textos(r, os.path.join(destino, 'textos.txt'))
    cj = cenas_reel(tl, r, sons)
    json.dump(cj, open(os.path.join(destino, 'cenas.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    mapa = os.path.join(pasta_peca, 'mapa-do-som.json')
    if os.path.exists(mapa):
        shutil.copy(mapa, os.path.join(destino, 'mapa-do-som.json'))
    else:
        json.dump({'modo': 'trilha', 'clima': r.get('clima', 'curioso'), 'semente': r.get('semente', r['nome']), 'efeitos': True},
                  open(os.path.join(destino, 'mapa-do-som.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    open(os.path.join(destino, 'legenda.txt'), 'w', encoding='utf-8').write('\n'.join(r.get('legenda', [])) + '\n')
    shutil.copy(mudo, os.path.join(out, 'video.mp4'))
    for de, para in (('capa.png', 'capa-%s.png' % nome), ('capa-grade.jpg', 'capa-grade.jpg')):
        if os.path.exists(os.path.join(pasta, de)):
            shutil.copy(os.path.join(pasta, de), os.path.join(out, para))
    if os.path.basename(destino) != nome:
        print('AVISO: a pasta se chama %s e o motor do reel da ao video o nome da pasta; o certo e %s' % (os.path.basename(destino), nome))
    return destino, cj


def video(tl, total, r, pasta, sons, som=None, trilha=None):
    """codifica o MP4 (1080 x 1920, 30 quadros por segundo); o som e a trilha do projeto (clima e semente do roteiro, com os efeitos)
    ou um WAV pronto (som=caminho, por exemplo o do motor do reel)"""
    nab = abertura_nf(r); off = nab / FPS
    chaves = ','.join(['0.000'] * bool(nab) + ['%.3f' % (e['t0'] + off) for e in tl if e['cena'] != 'trans' and e['feitas'] == ()])
    mudo = os.path.join(pasta, 'video_mudo.mp4')
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '1080x1920', '-r', str(FPS), '-i', '-',
           '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17',
           '-tune', 'animation', '-g', '60', '-force_key_frames', chaves, '-colorspace', 'bt709', '-color_primaries', 'bt709',
           '-color_trc', 'bt709', '-color_range', 'tv', '-movflags', '+faststart', mudo]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for n in range(nab):                                      # a abertura, antes do primeiro quadro do roteiro
        p.stdin.write(quadro_abertura(r, n).tobytes())
    for n in range(total):
        p.stdin.write(monta(tl, n, r, pasta).tobytes())
        if n % 600 == 0:
            print('passada 2 e video:', n, '/', total, flush=True)
    p.stdin.close(); p.wait()
    ef = os.path.join(pasta, 'efeitos.json'); json.dump(sorted(sons, key=lambda s: s['t']), open(ef, 'w'))
    dur = total / FPS
    if som:                                                   # um WAV pronto vale para o video inteiro, com a abertura
        wav = os.path.abspath(som); print('som: o arquivo dado,', wav)
    else:
        wav = os.path.join(pasta, 'trilha.wav'); tr = trilha or os.path.join(AQUI, 'preseme-trilha.py')
        print(subprocess.run([sys.executable, '-I', tr, wav, '%.3f' % dur, r.get('clima', 'curioso'), r.get('semente', r['nome']), ef],
                             check=True, capture_output=True, text=True).stdout.strip())
        if nab:
            wav = som_com_abertura(wav, r, pasta, tr)
    out = os.path.join(pasta, nome_arquivo(r) + '.mp4')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mudo, '-i', wav, '-af', volume_de_celular(wav), '-ar', '48000',
                    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', out], check=True)
    print('ok', out, '%.1f s' % (dur + off) + (' (abertura de %.1f s + roteiro)' % off if nab else ''))
    return out


def volume_de_celular(wav):
    """o filtro que leva o som a -16 LUFS com pico ate -1,5 dBFS: mede antes e aplica o ganho certo (duas passadas; numa
    passada so, o loudnorm erra ate 1 LUFS em video curto: o de 19 s saia em -15,3)"""
    alvo = 'loudnorm=I=-16:TP=-1.5:LRA=11'
    r = subprocess.run(['ffmpeg', '-nostats', '-i', wav, '-af', alvo + ':print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
    try:
        m = json.loads(r.stderr[r.stderr.rindex('{'):r.stderr.rindex('}') + 1])
        return alvo + ':measured_I=%s:measured_TP=%s:measured_LRA=%s:measured_thresh=%s:offset=%s:linear=true' % (
            m['input_i'], m['input_tp'], m['input_lra'], m['input_thresh'], m['target_offset'])
    except (ValueError, KeyError):
        return alvo


# ---------------------------------------------------------------- textos.txt (o texto da tela, para ele editar)
def itens_de_texto(r):
    """todo texto que aparece no video, na ordem: (numero, caminho no roteiro, texto). Parte 1, a tela: cartao de cima, papel,
    itens da lista, agradecimento e Nota. Parte 2, dentro do desenho: niveis, nomes dos papeis, fichas, contador e rotulos."""
    p1, p2 = [], []
    for i, b in enumerate(r['beats']):
        for j, t in enumerate(b.get('topo', [])):
            p1.append((('beats', i, 'topo', j), t))
        if 'fala' in b:
            p1.append((('beats', i, 'fala'), b['fala']))
        for j, t in enumerate(b.get('lista', [])):
            p1.append((('beats', i, 'lista', j), t))
        if 'agradecimento' in b:
            p1.append((('beats', i, 'agradecimento'), b['agradecimento']))
        if 'nota' in b:
            for k in ('titulo', 'texto', 'carimbo'):
                if k in b['nota']:
                    p1.append((('beats', i, 'nota', k), b['nota'][k]))
    vistas = []
    for b in r['beats']:
        if b['cena'] != 'trans' and b['cena'] not in vistas:
            vistas.append(b['cena'])
    for c in vistas:
        if 'nivel' in r['cenas'][c]:
            p2.append((('cenas', c, 'nivel'), r['cenas'][c]['nivel']))
    for i, b in enumerate(r['beats']):
        if 'nivel' in b:
            p2.append((('beats', i, 'nivel'), b['nivel']))
    for k, v in r.get('papeis', {}).items():
        p2.append((('papeis', k), v))
    fichas = []
    for b in r['beats']:
        if b.get('ficha') and b['ficha'] not in fichas:
            fichas.append(b['ficha'])
    for k in fichas:
        f = r['fichas'][k]; p2.append((('fichas', k, 'titulo'), f['titulo']))
        for j, (a, v) in enumerate(f['linhas']):
            p2.append((('fichas', k, 'linhas', j, 0), a)); p2.append((('fichas', k, 'linhas', j, 1), v))
    for k in ('a', 'b'):
        for j, t in enumerate(r.get('contador', {}).get(k, [])):
            p2.append((('contador', k, j), t))
    for k, v in r.get('rotulos', {}).items():
        if isinstance(v, list):
            for j, t in enumerate(v):
                p2.append((('rotulos', k, j), t))
        else:
            p2.append((('rotulos', k), v))
    larg = 2 if len(p1) < 100 else 3
    return ([('%0*d' % (larg, n + 1), c, t) for n, (c, t) in enumerate(p1)],
            [('D%0*d' % (2 if len(p2) < 100 else 3, n + 1), c, t) for n, (c, t) in enumerate(p2)])


def assinatura_textos(r):
    p1, p2 = itens_de_texto(r)
    return hashlib.sha256(json.dumps([[c, t] for _, c, t in p1 + p2], ensure_ascii=False).encode()).hexdigest()[:12]


def gera_textos(r, path):
    p1, p2 = itens_de_texto(r)
    ls = ['# textos.txt · %s · motor de pixel art do PRESEME' % r['nome'],
          '# Edite só o que vem depois do número e devolva. Linha apagada: o texto sai do vídeo.',
          '# Trecho entre *asteriscos* sai com marca-texto; * no começo de uma linha do cartão de cima pinta a linha inteira.',
          '# assinatura: %s (não mexa: diz de qual versão do roteiro este arquivo saiu)' % assinatura_textos(r),
          '', '# Parte 1 · o texto da tela']
    ls += ['[%s] %s' % (n, t) for n, _, t in p1]
    ls += ['', '# Parte 2 · as palavras de dentro do desenho (nomes, fichas, contador, etiquetas)']
    ls += ['[%s] %s' % (n, t) for n, _, t in p2]
    open(path, 'w', encoding='utf-8').write('\n'.join(ls) + '\n')
    return len(p1), len(p2)


def _pega(r, c):
    o = r
    for k in c[:-1]:
        o = o[k]
    return o, c[-1]


def aplica_textos(r, path, forca=False):
    """aplica o textos.txt editado ao roteiro (em memoria); devolve (r novo, lista de mudancas). Recusa arquivo de outra versao."""
    linhas = open(path, encoding='utf-8').read().splitlines()
    ass = next((re.search(r'assinatura: (\w+)', l).group(1) for l in linhas if 'assinatura:' in l), None)
    if ass and ass != assinatura_textos(r) and not forca:
        sys.exit('PAROU: este textos.txt saiu de outra versao do roteiro (assinatura %s; a de agora e %s). '
                 'Gere um novo com o comando textos, ou use --forca se tiver certeza.' % (ass, assinatura_textos(r)))
    novo = {}
    for l in linhas:
        m = re.match(r'^\[(D?\d+)\]\s?(.*)$', l)
        if m:
            novo[m.group(1)] = m.group(2).rstrip()
    p1, p2 = itens_de_texto(r); mud, apaga = [], []
    for n, c, t in p1 + p2:
        if n not in novo or not novo[n].strip():
            apaga.append(c); mud.append('[%s] apagado: %s' % (n, t))
        elif novo[n] != t:
            o, k = _pega(r, c); o[k] = novo[n]; mud.append('[%s] %s  ->  %s' % (n, t, novo[n]))
    linhas_ficha = set()                                      # linha de ficha apagada (rotulo ou valor): sai a linha inteira, uma vez
    for c in sorted(apaga, key=lambda x: [str(v).zfill(6) if isinstance(v, int) else v for v in x], reverse=True):
        if c[0] == 'fichas' and c[2] == 'linhas':
            linhas_ficha.add((c[1], c[3])); continue
        o, k = _pega(r, c)
        if c[0] == 'beats' and c[2] in ('topo', 'lista'):
            del o[k]
            if not o:
                del r['beats'][c[1]][c[2]]
        elif c[0] == 'beats' and c[2] in ('fala', 'agradecimento'):
            del o[k]
        elif c[0] == 'beats' and c[2] == 'nota' and k == 'carimbo':
            del o[k]
        elif c[0] == 'rotulos' and len(c) == 3:
            del o[k]
        else:
            o[k] = ''
    for (f, j) in sorted(linhas_ficha, reverse=True):
        del r['fichas'][f]['linhas'][j]
    return r, mud
