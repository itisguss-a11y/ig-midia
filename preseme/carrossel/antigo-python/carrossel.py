#!/usr/bin/env python3
# PRESEME · motor de carrossel
#
# O que faz: de um peca.json (a série, o molde e o texto de cada lâmina) sai o carrossel pronto para o Instagram:
# as lâminas em PNG (1080 x 1350), a folha com todas, o textos.txt (para ele trocar palavras), o texto alternativo
# de cada lâmina, os JPEG de subir e a conferência. O desenho e o texto ficam em camadas separadas: trocar uma
# palavra refaz só a camada do texto.
#
# Uso (sempre no ambiente do Claude, com python3 -I):
#   python3 -I carrossel.py gerar   <peca.json> [--molde A|B|C] [--saida <pasta>]
#   python3 -I carrossel.py conferir <peca.json> [--molde A|B|C]            (só a conferência, sem desenhar)
#   python3 -I carrossel.py textos  <peca.json> <textos-devolvido.txt> [--molde X] [--saida <pasta>]
#   python3 -I carrossel.py escolha <saida.jpg> <pasta> <pasta> ...       (folha de escolha dos moldes)
#   python3 -I carrossel.py moldes                                       (lista os moldes)
import importlib
import json
import os
import re
import shutil
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)  # com -I a pasta do script não entra sozinha no caminho de import

from PIL import Image, ImageDraw  # noqa: E402

from motor import base  # noqa: E402
from motor.base import H, P, W  # noqa: E402

SERIES = {'noticia': 'Notícia comentada', 'doenca': 'Doença de Roraima', 'ubs': 'Na UBS, e agora?', 'avulsa': 'Peça avulsa'}
NUMERADA = re.compile(r'\s*\[(\d+)\]\s*(.*?)\s*$')
FAMILIA = lambda chave: chave.split('-')[0]  # noqa: E731


def lista_moldes():
    pasta = os.path.join(AQUI, 'motor', 'moldes')
    out = []
    for arq in sorted(os.listdir(pasta)):
        if arq.endswith('.py') and not arq.startswith('_'):
            m = importlib.import_module('motor.moldes.' + arq[:-3])
            out.append((arq[:-3], m))
    return out


def carrega_molde(peca, letra=None):
    letra = (letra or peca.get('molde', 'A')).upper()
    nome = f"{peca['serie']}_{letra.lower()}"
    try:
        return importlib.import_module('motor.moldes.' + nome)
    except ModuleNotFoundError:
        sys.exit(f'ERRO: não existe o molde {nome} (veja: carrossel.py moldes)')


def numerar(peca):
    """Numera os textos na ordem das lâminas e das chaves. Devolve [(n, i, chave, texto)]."""
    out, n = [], 0
    for i, lam in enumerate(peca['laminas']):
        for chave, s in lam.get('textos', {}).items():
            n += 1
            out.append((n, i, chave, s))
    return out


def escreve_textos(peca, pasta, molde):
    linhas = [f"# PRESEME · textos da tela · {peca.get('nome', '')} · {SERIES.get(peca['serie'], peca['serie'])} · molde {molde.LETRA}",
              '# Troque só o que vem depois do número. Linha apagada = texto apagado da lâmina.',
              '# O trecho que leva marca-texto fica no peca.json ("destaques"); se você mudar o trecho, ele sai sem marca.']
    atual = -1
    mapa = {}
    for n, i, chave, s in numerar(peca):
        if i != atual:
            linhas.append(f'# lâmina {i + 1}')
            atual = i
        linhas.append(f'[{n:02d}] {s}')
        mapa[n] = [i, chave]
    with open(os.path.join(pasta, 'textos.txt'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(linhas) + '\n')
    with open(os.path.join(pasta, 'textos-mapa.json'), 'w', encoding='utf-8') as f:
        json.dump(mapa, f, ensure_ascii=False, indent=1)


def monta(peca, molde, pasta=None, desenhar=True):
    """Monta as lâminas. Com desenhar=False, só faz o leiaute e a conferência (rápido)."""
    n = len(peca['laminas'])
    probs, avisos = [], []
    if not 5 <= n <= 8:
        probs.append(f'o carrossel tem {n} lâminas (o certo é de 5 a 8)')
    if peca['laminas'][0].get('tipo') != 'capa' or not peca['laminas'][0].get('textos', {}).get('titulo'):
        probs.append('a lâmina 1 tem de ser a capa, com o título')
    rasters = {}
    if desenhar and hasattr(molde, 'preparar'):
        rasters = molde.preparar(peca, pasta) or {}
    lams, familias = [], set()
    for i in range(n):
        L = base.Lamina(peca, i, molde)
        molde.lamina(L)
        lams.append(L)
        pre = f'lâmina {i + 1}: '
        probs += [pre + p for p in L.problemas]
        avisos += [pre + a for a in L.avisos]
        for c in L.textos:
            if c not in L.usados and L.textos[c].strip():
                avisos.append(pre + f'[{c}] este molde não mostra este texto')
        fams = {FAMILIA(op['letra']) for op in L.ops}
        familias |= fams
        fora = base.cores_fora(L.svg_texto())
        fora += [op['cor'] for op in L.ops if op['cor'].lower() not in base.PALETA]
        if fora:
            probs.append(pre + 'cor fora da paleta: ' + ', '.join(sorted(set(fora))))
        pal = L.palavras()
        if pal > 60:
            avisos.append(pre + f'{pal} palavras: vira slide de texto?')
        if i > 0 and pal < 7 and not L.alt_desenho:
            avisos.append(pre + 'lâmina com uma frase só e sem desenho que explique')
    if len(familias) > 2:
        probs.append('mais de duas famílias de letra na peça: ' + ', '.join(sorted(familias)))
    if not desenhar:
        return lams, probs, avisos
    os.makedirs(os.path.join(pasta, 'laminas'), exist_ok=True)
    os.makedirs(os.path.join(pasta, 'camadas'), exist_ok=True)
    os.makedirs(os.path.join(pasta, 'subir'), exist_ok=True)
    for i, L in enumerate(lams):
        nn = f'{i + 1:02d}'
        svg = L.svg_texto()
        hsh = base.hash_texto(svg + str(rasters.get(i, '')))
        des = os.path.join(pasta, 'camadas', f'{nn}-desenho.png')
        marca = des + '.hash'
        if not (os.path.exists(des) and os.path.exists(marca) and open(marca).read() == hsh):
            if i in rasters:
                img = Image.open(rasters[i]).convert('RGBA').resize((W, H))
                if len(L.svg) > 0:
                    tmp = base.svg_para_png(svg, os.path.join(pasta, 'camadas', f'{nn}-extra.png'))
                    img.alpha_composite(Image.open(tmp).convert('RGBA'))
                img.save(des)
            else:
                base.svg_para_png(svg, des)
            open(marca, 'w').write(hsh)
        img = Image.open(des).convert('RGBA')
        txt = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        base._desenha_ops(txt, L.ops, semente_base=i + 1)
        txt.save(os.path.join(pasta, 'camadas', f'{nn}-texto.png'))
        img.alpha_composite(txt)
        img.save(os.path.join(pasta, 'laminas', f'{nn}.png'))
        img.convert('RGB').save(os.path.join(pasta, 'subir', f'{nn}.jpg'), quality=95, subsampling=0)
    folha(pasta, n)
    escreve_textos(peca, pasta, molde)
    alt = []
    for i, L in enumerate(lams):
        t = L.textos
        titulo = (t.get('titulo') or t.get('chapeu') or '').strip()
        corpo = ' '.join(v for k, v in t.items() if k != 'titulo' and v.strip())
        frase = f'Lâmina {i + 1} de {n}. ' + (L.alt_desenho + '. ' if L.alt_desenho else '') + (titulo + '. ' if titulo else '') + corpo
        alt.append(L.dados.get('alt') or ' '.join(frase.split()))
    with open(os.path.join(pasta, 'alt.txt'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(alt) + '\n')
    return lams, probs, avisos


def folha(pasta, n, nome='folha.jpg', lado=1600):
    cols = min(4, n)
    rows = (n + cols - 1) // cols
    gap, rot = 24, 34
    cw = (lado - gap * (cols + 1)) // cols
    ch = int(cw * H / W)
    img = Image.new('RGB', (lado, gap + rows * (ch + rot + gap)), P['noite'])
    d = ImageDraw.Draw(img)
    f = base.fonte('atk-b', 24)
    for i in range(n):
        c, r = i % cols, i // cols
        x, y = gap + c * (cw + gap), gap + r * (ch + rot + gap)
        lam = Image.open(os.path.join(pasta, 'laminas', f'{i + 1:02d}.png')).convert('RGB').resize((cw, ch), Image.LANCZOS)
        d.text((x, y + 24), f'{i + 1}', font=f, fill=P['papel'], anchor='ls')
        img.paste(lam, (x, y + rot))
    img.save(os.path.join(pasta, nome), quality=88)


def relatorio(pasta, probs, avisos):
    linhas = [f'{len(probs)} problemas'] + ['PROBLEMA ' + p for p in probs] + [f'{len(avisos)} avisos'] + ['aviso ' + a for a in avisos]
    if pasta:
        with open(os.path.join(pasta, 'conferencia.txt'), 'w', encoding='utf-8') as f:
            f.write('\n'.join(linhas) + '\n')
    print('\n'.join(linhas))


def args_opc(argv, nome, padrao=None):
    if nome in argv:
        k = argv.index(nome)
        return argv[k + 1]
    return padrao


def main(argv):
    if not argv or argv[0] in ('-h', '--help', 'ajuda'):
        print(__doc__ or open(os.path.abspath(__file__), encoding='utf-8').read().split('import')[0])
        return
    cmd = argv[0]
    if cmd == 'moldes':
        for nome, m in lista_moldes():
            print(f"{nome:10s} {'★' if getattr(m, 'ESTRELA', False) else ' '} {m.NOME} · fundo {m.FUNDO} · letras {', '.join(m.LETRAS)}")
        return
    if cmd == 'escolha':
        from motor import folhas
        folhas.escolha(argv[1], argv[2:])
        return
    caminho = argv[1]
    peca = json.load(open(caminho, encoding='utf-8'))
    molde = carrega_molde(peca, args_opc(argv, '--molde'))
    pasta = args_opc(argv, '--saida') or os.path.join(os.path.dirname(os.path.abspath(caminho)), 'out', f"{peca['serie']}-{molde.LETRA}")
    if cmd == 'conferir':
        _, probs, avisos = monta(peca, molde, desenhar=False)
        relatorio(None, probs, avisos)
        sys.exit(1 if probs else 0)
    if cmd == 'textos':
        devolvido = argv[2]
        novos = {}
        for bruto in open(devolvido, encoding='utf-8'):
            m = NUMERADA.match(bruto)
            if m:
                novos[int(m.group(1))] = m.group(2)
        antes = {n: (i, chave, s) for n, i, chave, s in numerar(peca)}
        mud, saiu = 0, 0
        for n, (i, chave, s) in antes.items():
            if n not in novos:
                peca['laminas'][i]['textos'][chave] = ''
                saiu += 1
            elif novos[n] != s:
                peca['laminas'][i]['textos'][chave] = novos[n]
                mud += 1
        extras = [n for n in novos if n not in antes]
        k = 1
        while os.path.exists(caminho.replace('.json', f'-antes-{k}.json')):
            k += 1
        shutil.copy(caminho, caminho.replace('.json', f'-antes-{k}.json'))
        json.dump(peca, open(caminho, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print(f'{mud} textos trocados, {saiu} apagados' + (f'; números novos ignorados: {extras}' if extras else ''))
        cmd = 'gerar'
    if cmd == 'gerar':
        os.makedirs(pasta, exist_ok=True)
        _, probs, avisos = monta(peca, molde, pasta)
        relatorio(pasta, probs, avisos)
        print('saída:', pasta)
        return
    sys.exit('comando desconhecido: ' + cmd)


if __name__ == '__main__':
    main(sys.argv[1:])
