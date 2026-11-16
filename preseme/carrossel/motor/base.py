# PRESEME · motor de carrossel · base
# Paleta, letras, texto que se mede e se quebra sozinho, a lâmina (desenho + texto em camadas separadas),
# a renderização (SVG -> PNG pelo rsvg-convert; texto pelo PIL, na mesma letra em que foi medido) e a conferência.
import glob
import hashlib
import json
import math
import os
import random
import re
import shutil
import subprocess
import urllib.request

from PIL import Image, ImageDraw, ImageFont, features

W, H = 1080, 1350
P = {
    'floresta': '#17402C', 'papel': '#F4EDDF', 'marca': '#E4EB6C', 'coral': '#F16D4D',
    'salvia': '#B5D8C0', 'folha': '#30724E', 'noite': '#072618',
}
PALETA = {v.lower() for v in P.values()}
NOME_DA_COR = {v.lower(): k for k, v in P.items()}
CLARAS = {P['papel'].lower(), P['salvia'].lower(), P['marca'].lower()}
MARGEM = 64                      # nada de texto a menos disto da borda
CONTADOR = (936, 0, W, 116)      # o "1/6" que o Instagram põe em cima, à direita, no carrossel
LETRA_GRANDE = 48                # a partir daqui vale a regra de letra grande (contraste 3 para 1)
LETRA_MIN = 30                   # menor letra aceita
NBSP = ' '

# ---------------------------------------------------------------- letras
# chave: (arquivo, de onde baixar, se faltar). As do animation-studio vêm do plugin, se ele estiver instalado.
GF = 'https://raw.githubusercontent.com/google/fonts/main/'
FONTES = {
    'atk': ('AtkinsonHyperlegible-Regular.ttf', GF + 'ofl/atkinsonhyperlegible/AtkinsonHyperlegible-Regular.ttf'),
    'atk-b': ('AtkinsonHyperlegible-Bold.ttf', GF + 'ofl/atkinsonhyperlegible/AtkinsonHyperlegible-Bold.ttf'),
    'atk-i': ('AtkinsonHyperlegible-Italic.ttf', GF + 'ofl/atkinsonhyperlegible/AtkinsonHyperlegible-Italic.ttf'),
    'zilla': ('ZillaSlab-Regular.ttf', GF + 'ofl/zillaslab/ZillaSlab-Regular.ttf'),
    'zilla-sb': ('ZillaSlab-SemiBold.ttf', GF + 'ofl/zillaslab/ZillaSlab-SemiBold.ttf'),
    'zilla-b': ('ZillaSlab-Bold.ttf', GF + 'ofl/zillaslab/ZillaSlab-Bold.ttf'),
    'bebas': ('BebasNeue-Regular.ttf', GF + 'ofl/bebasneue/BebasNeue-Regular.ttf'),
    'archivo': ('ArchivoBlack-Regular.ttf', GF + 'ofl/archivoblack/ArchivoBlack-Regular.ttf'),
    'patrick': ('PatrickHand-Regular.ttf', GF + 'ofl/patrickhand/PatrickHand-Regular.ttf'),
    'courier': ('CourierPrime-Regular.ttf', GF + 'ofl/courierprime/CourierPrime-Regular.ttf'),
    'courier-b': ('CourierPrime-Bold.ttf', GF + 'ofl/courierprime/CourierPrime-Bold.ttf'),
    'oldst': ('OldStandard-Regular.ttf', GF + 'ofl/oldstandardtt/OldStandard-Regular.ttf'),
    'oldst-b': ('OldStandard-Bold.ttf', GF + 'ofl/oldstandardtt/OldStandard-Bold.ttf'),
    'oldst-i': ('OldStandard-Italic.ttf', GF + 'ofl/oldstandardtt/OldStandard-Italic.ttf'),
    'kalam': ('Kalam-Regular.ttf', GF + 'ofl/kalam/Kalam-Regular.ttf'),
    'kalam-b': ('Kalam-Bold.ttf', GF + 'ofl/kalam/Kalam-Bold.ttf'),
    'anton': ('Anton-Regular.ttf', GF + 'ofl/anton/Anton-Regular.ttf'),
    'londrina': ('LondrinaSolid-Regular.ttf', GF + 'ofl/londrinasolid/LondrinaSolid-Regular.ttf'),
    'londrina-k': ('LondrinaSolid-Black.ttf', GF + 'ofl/londrinasolid/LondrinaSolid-Black.ttf'),
    'inter-800': ('Inter-800.ttf', None),   # do animation-studio (o "acabamento A")
    'inter-700': ('Inter-700.ttf', None),
    'inter-400': ('Inter-400.ttf', None),
    'caveat-b': ('Caveat-Bold.ttf', None),
}
PASTA_FONTES = os.path.expanduser('~/.fonts')


def pasta_animation_studio():
    achados = glob.glob('/root/.claude/plugins/**/skills/animation-studio', recursive=True)
    return achados[0] if achados else None


def instalar_fontes():
    """Baixa as letras que faltam (Google Fonts, pelo raw do GitHub) e copia as do animation-studio."""
    os.makedirs(PASTA_FONTES, exist_ok=True)
    asp = pasta_animation_studio()
    faltou = []
    for chave, (arq, url) in FONTES.items():
        dst = os.path.join(PASTA_FONTES, arq)
        if os.path.exists(dst):
            continue
        if url is None:
            src = os.path.join(asp, 'engine', 'fonts', arq) if asp else None
            if src and os.path.exists(src):
                shutil.copy(src, dst)
            else:
                faltou.append(arq)
            continue
        try:
            urllib.request.urlretrieve(url, dst)
        except Exception:
            faltou.append(arq)
    if faltou:
        print('LETRAS QUE FALTARAM:', ', '.join(faltou))
    return faltou


_cache_fontes = {}


def fonte(chave, tam):
    k = (chave, int(tam))
    if k not in _cache_fontes:
        caminho = os.path.join(PASTA_FONTES, FONTES[chave][0])
        if not os.path.exists(caminho):
            instalar_fontes()
        motor = ImageFont.Layout.RAQM if features.check('raqm') else ImageFont.Layout.BASIC
        _cache_fontes[k] = ImageFont.truetype(caminho, int(tam), layout_engine=motor)
    return _cache_fontes[k]


def largura(s, chave, tam):
    return fonte(chave, tam).getlength(s)

# ---------------------------------------------------------------- cor e contraste


def _lin(c):
    c = c / 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def luminancia(hexcor):
    h = hexcor.lstrip('#')
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * _lin(r) + 0.7152 * _lin(g) + 0.0722 * _lin(b)


def contraste(a, b):
    la, lb = luminancia(a), luminancia(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


def regra_de_cor(cor, bg, tam):
    """Devolve a lista de problemas da regra de cores da ficha (seção 1, Arte) para um texto."""
    cor, bg = cor.lower(), bg.lower()
    probs = []
    c = contraste(cor, bg)
    grande = tam >= LETRA_GRANDE
    if c < (3.0 if grande else 4.5):
        probs.append(f'contraste {c:.2f} ({NOME_DA_COR.get(cor, cor)} sobre {NOME_DA_COR.get(bg, bg)}, letra {tam})')
    if cor == P['coral'].lower() and not grande:
        probs.append('Coral em letra pequena')
    if bg == P['coral'].lower() and cor != P['noite'].lower():
        probs.append('sobre o Coral, o texto tem de ser Noite')
    if {cor, bg} == {P['papel'].lower(), P['salvia'].lower()}:
        probs.append('Papel e Sálvia, um sobre o outro')
    return probs

# ---------------------------------------------------------------- quebra de linha
FRACAS = set('a o as os um uma de do da dos das e em no na nos nas que é à às ao para por com se seu sua'.split())


def quebrar(texto, chave, tam, larg):
    linhas, cur = [], ''
    for p in texto.split(' '):
        if not p:
            continue
        t = cur + ' ' + p if cur else p
        if cur and largura(t, chave, tam) > larg:
            linhas.append(cur)
            cur = p
        else:
            cur = t
    if cur:
        linhas.append(cur)
    return linhas


def equilibrar(texto, chave, tam, larg):
    base = quebrar(texto, chave, tam, larg)
    k = len(base)
    if k < 2:
        return base
    melhor, nota = base, float('inf')
    w = larg
    while w > larg * 0.5:
        ls = quebrar(texto, chave, tam, w)
        if len(ls) != k:
            break
        ws = [largura(l, chave, tam) for l in ls]
        fr = sum(1 for l in ls[:-1] if l.split(' ')[-1].lower().strip('.,;!?') in FRACAS)
        n = max(ws) - min(ws) + 400 * fr
        if n < nota:
            nota, melhor = n, ls
        w -= 16
    return melhor

# ---------------------------------------------------------------- traço de mão


def tremido(pontos, amp, semente):
    """Treme os pontos de um traço, sempre igual para a mesma semente (sem sorteio de verdade)."""
    rnd = random.Random(semente)
    return [(x + rnd.uniform(-amp, amp), y + rnd.uniform(-amp, amp)) for x, y in pontos]


def caminho(pontos, fechado=False):
    if not pontos:
        return ''
    d = 'M %.1f %.1f ' % pontos[0] + ' '.join('L %.1f %.1f' % p for p in pontos[1:])
    return d + (' Z' if fechado else '')


def curva(pontos, fechado=False):
    """Caminho suave (Catmull-Rom) passando pelos pontos."""
    n = len(pontos)
    if n < 3:
        return caminho(pontos, fechado)
    pts = pontos + pontos[:3] if fechado else [pontos[0]] + pontos + [pontos[-1]]
    d = 'M %.1f %.1f' % pts[1]
    fim = n + 1 if fechado else n
    for i in range(1, fim):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[i + 1], pts[i + 2] if i + 2 < len(pts) else pts[i + 1]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += ' C %.1f %.1f %.1f %.1f %.1f %.1f' % (c1 + c2 + p2)
    return d + (' Z' if fechado else '')


def retangulo_mao(x, y, w, h, amp=3, semente=1, passo=60):
    pts = []
    for (ax, ay), (bx, by) in [((x, y), (x + w, y)), ((x + w, y), (x + w, y + h)), ((x + w, y + h), (x, y + h)), ((x, y + h), (x, y))]:
        n = max(2, int(math.hypot(bx - ax, by - ay) / passo))
        for k in range(n):
            pts.append((ax + (bx - ax) * k / n, ay + (by - ay) * k / n))
    return curva(tremido(pts, amp, semente), fechado=True)

# ---------------------------------------------------------------- a lâmina


class Lamina:
    """Uma lâmina: o desenho (SVG) e o texto (operações que o PIL desenha por cima)."""

    def __init__(self, peca, i, molde):
        self.peca, self.i, self.molde = peca, i, molde
        self.dados = peca['laminas'][i]
        self.textos = self.dados.get('textos', {})
        self.destaques = self.dados.get('destaques', {})
        self.svg = []
        self.defs = []
        self.ops = []
        self.problemas = []
        self.avisos = []
        self.usados = set()
        self.fundo = P['papel']
        self.alt_desenho = ''

    # desenho
    def cor_de_fundo(self, cor):
        self.fundo = cor
        self.svg.insert(0, f'<rect x="0" y="0" width="{W}" height="{H}" fill="{cor}"/>')

    def add(self, s):
        self.svg.append(s)

    def defs_add(self, s):
        self.defs.append(s)

    def svg_texto(self):
        return (f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
                f'width="{W}" height="{H}" viewBox="0 0 {W} {H}"><defs>{"".join(self.defs)}</defs>'
                + ''.join(self.svg) + '</svg>')

    # texto
    def tem(self, chave):
        return bool(self.textos.get(chave, '').strip())

    def texto(self, chave, x, y, w, h, letra, tam, tam_min=None, cor=None, bg=None, alinh='left', valinh='top',
              entre=1.22, max_linhas=None, equil=False, estilo_destaque='marca', caixa_alta=False, rot=0,
              cor_destaque=None, bg_destaque=None):
        """Põe o texto da chave na caixa (x, y, w, h). Escolhe a maior letra que cabe, de tam até tam_min.
        Devolve a caixa usada {x, y, w, h, tam, linhas} (h é a altura de verdade, para empilhar)."""
        self.usados.add(chave)
        s = self.textos.get(chave, '')
        if not s or not s.strip():
            return {'x': x, 'y': y, 'w': w, 'h': 0, 'tam': tam, 'linhas': []}
        s = ' '.join(s.split())
        if caixa_alta:
            s = s.upper()
        cor = cor or P['floresta']
        bg = bg or self.fundo
        dest = self.destaques.get(chave)
        dest = [dest] if isinstance(dest, str) else list(dest or [])
        if caixa_alta:
            dest = [d.upper() for d in dest]
        s_q = s
        for d in dest:
            if d and d in s_q:
                s_q = s_q.replace(d, d.replace(' ', NBSP))
            elif d:
                self.avisos.append(f'[{chave}] o trecho do destaque "{d}" não está mais no texto: sai sem marca')
        tam_min = tam_min or tam
        escolhido = None
        t = tam
        while t >= tam_min:
            ls = equilibrar(s_q, letra, t, w) if equil else quebrar(s_q, letra, t, w)
            f = fonte(letra, t)
            asc, desc = f.getmetrics()
            alt = asc + desc + (len(ls) - 1) * t * entre
            cabe_l = all(largura(l, letra, t) <= w + 0.5 for l in ls)
            if alt <= h and cabe_l and (max_linhas is None or len(ls) <= max_linhas):
                escolhido = (t, ls, alt)
                break
            t -= 2
        if escolhido is None:
            t = tam_min
            ls = quebrar(s_q, letra, t, w)
            f = fonte(letra, t)
            asc, desc = f.getmetrics()
            alt = asc + desc + (len(ls) - 1) * t * entre
            self.problemas.append(f'[{chave}] não cabe na caixa ({len(ls)} linhas na letra {t}; caixa {w}x{h})')
            escolhido = (t, ls, alt)
        t, ls, alt = escolhido
        if t < LETRA_MIN:
            self.problemas.append(f'[{chave}] letra {t} menor que {LETRA_MIN}')
        y0 = y if valinh == 'top' else (y + (h - alt) / 2 if valinh == 'center' else y + h - alt)
        self.ops.append(dict(chave=chave, x=x, y=y0, w=w, letra=letra, tam=t, linhas=ls, entre=entre, cor=cor, bg=bg,
                             alinh=alinh, dest=[d.replace(' ', NBSP) for d in dest], estilo=estilo_destaque, rot=rot,
                             cor_destaque=cor_destaque, bg_destaque=bg_destaque))
        for p in regra_de_cor(cor, bg, t):
            self.problemas.append(f'[{chave}] {p}')
        if bg_destaque and dest:
            for p in regra_de_cor(cor_destaque or P['floresta'], bg_destaque, t):
                self.problemas.append(f'[{chave}] destaque: {p}')
        # área segura e contador do Instagram
        caixa = (x, y0, x + w, y0 + alt)
        if not rot and (caixa[0] < MARGEM - 0.5 or caixa[2] > W - MARGEM + 0.5 or caixa[1] < MARGEM - 0.5 or caixa[3] > H - MARGEM + 0.5):
            self.problemas.append(f'[{chave}] fora da área segura')
        if not rot and caixa[2] > CONTADOR[0] and caixa[1] < CONTADOR[3]:
            larg_real = max(largura(l, letra, t) for l in ls)
            xr = x + (w - larg_real if alinh == 'right' else ((w - larg_real) / 2 if alinh == 'center' else 0)) + larg_real
            if xr > CONTADOR[0]:
                self.problemas.append(f'[{chave}] embaixo do contador "1/N" do Instagram (canto de cima, à direita)')
        return {'x': x, 'y': y0, 'w': w, 'h': alt, 'tam': t, 'linhas': ls}

    def palavras(self):
        return sum(len(self.textos.get(c, '').split()) for c in self.usados)

# ---------------------------------------------------------------- desenhar o texto (PIL)


def _desenha_ops(img, ops, semente_base=0):
    d = ImageDraw.Draw(img)
    for k, op in enumerate(ops):
        f = fonte(op['letra'], op['tam'])
        asc, desc = f.getmetrics()
        camada = img
        if op['rot']:
            camada = Image.new('RGBA', img.size, (0, 0, 0, 0))
        dd = ImageDraw.Draw(camada)
        for i, l in enumerate(op['linhas']):
            base = op['y'] + asc + i * op['tam'] * op['entre']
            lw = f.getlength(l)
            x = op['x'] + (op['w'] - lw if op['alinh'] == 'right' else ((op['w'] - lw) / 2 if op['alinh'] == 'center' else 0))
            partes = [(l, None)]
            for dst in op['dest']:
                novo = []
                for txt, marc in partes:
                    if marc or dst not in txt:
                        novo.append((txt, marc))
                        continue
                    a, b = txt.split(dst, 1)
                    novo += [(a, None), (dst, True), (b, None)]
                partes = [p for p in novo if p[0]]
            cx = x
            for txt, marc in partes:
                wseg = f.getlength(txt)
                cor = op['cor']
                if marc:
                    rnd = random.Random(semente_base * 97 + k * 13 + i)
                    s = op['tam']
                    if op['estilo'] == 'marca':
                        fill = op['bg_destaque'] or P['marca']
                        pts = [(cx - 8 + rnd.uniform(-2, 2), base - s * 0.80 + rnd.uniform(-2, 2)),
                               (cx + wseg + 10 + rnd.uniform(-2, 2), base - s * 0.86 + rnd.uniform(-2, 2)),
                               (cx + wseg + 7 + rnd.uniform(-2, 2), base + s * 0.20 + rnd.uniform(-2, 2)),
                               (cx - 11 + rnd.uniform(-2, 2), base + s * 0.25 + rnd.uniform(-2, 2))]
                        dd.polygon(pts, fill=fill)
                        cor = op['cor_destaque'] or P['floresta']
                    elif op['estilo'] == 'sublinhado':
                        y = base + s * 0.16
                        dd.line([(cx, y + rnd.uniform(-2, 2)), (cx + wseg, y + rnd.uniform(-2, 2))],
                                fill=op['bg_destaque'] or P['coral'], width=max(4, int(s * 0.09)))
                    elif op['estilo'] == 'cor':
                        cor = op['cor_destaque'] or P['marca']
                dd.text((cx, base), txt.replace(NBSP, ' '), font=f, fill=cor, anchor='ls')
                cx += wseg
        if op['rot']:
            cxr, cyr = op['x'] + op['w'] / 2, op['y'] + 40
            camada = camada.rotate(op['rot'], resample=Image.BICUBIC, center=(cxr, cyr))
            img.alpha_composite(camada)
    return img

# ---------------------------------------------------------------- conferência das cores do desenho
COR_RE = re.compile(r'(?:fill|stroke|stop-color|flood-color|color)\s*[=:]\s*["\']?\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|[a-zA-Z]+)')
LIVRES = {'none', 'transparent', 'currentcolor', 'inherit', 'url'}


def cores_fora(svg):
    fora = set()
    for m in COR_RE.finditer(svg):
        c = m.group(1).strip().lower()
        if c in LIVRES or c.startswith('url'):
            continue
        if c.startswith('#'):
            h = c[1:]
            if len(h) == 3:
                h = ''.join(ch * 2 for ch in h)
            c = '#' + h[:6]
            if c not in PALETA:
                fora.add(c)
        else:
            fora.add(c)
    return sorted(fora)

# ---------------------------------------------------------------- renderizar


def svg_para_png(svg, destino):
    tmp = destino + '.svg'
    with open(tmp, 'w', encoding='utf-8') as f:
        f.write(svg)
    subprocess.run(['rsvg-convert', '-w', str(W), '-h', str(H), '-o', destino, tmp], check=True)
    return destino


def hash_texto(s):
    return hashlib.sha1(s.encode('utf-8')).hexdigest()[:16]
