# PRESEME · conferência das cores: aponta, em cada quadro, a mancha de cor que não sai da paleta (ficha, seção 1, Arte).
# Uso: python3 -I preseme-cores.py <cores.json> <quadro.png> [<quadro.png> ...]
#   cores.json: {"paleta": ["#17402C", ...], "extras": ["#C98A62", ...]}  (extras: as cores da peça além da paleta: pele, cabelo...)
# Como mede: reduz o quadro, junta as cores parecidas e olha só as manchas com pelo menos 0,4% do quadro. A mancha passa
# quando fica perto de uma cor permitida, de uma mistura de duas delas (transparência, hachura, borda suave) ou da mesma cor
# mais escura ou mais clara (sombra, vinheta e textura do papel). O que fica longe de tudo isso é cor de fora da paleta.
# É aviso, não erro: quem decide é o olho de quem desenhou (ex.: brasão oficial, que tem as cores dele).
import json, sys
import numpy as np
from PIL import Image

LIMIAR = 24.0   # distância em RGB (0 a 441) a partir da qual a mancha é de fora
MANCHA = 0.004  # 0,4% do quadro


def hexrgb(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=float)


def segmentos(cores):
    segs = []
    for i, a in enumerate(cores):
        segs.append((a, a * 0.6))                      # a mesma cor mais escura (sombra, vinheta)
        segs.append((a, a + (255 - a) * 0.25))         # a mesma cor mais clara (papel, brilho)
        for b in cores[i + 1:]:
            segs.append((a, b))                        # mistura das duas (transparência, borda, hachura)
    return segs


def dist_seg(p, a, b):
    ab = b - a
    den = float(ab @ ab)
    t = 0.0 if den == 0 else max(0.0, min(1.0, float((p - a) @ ab) / den))
    return float(np.linalg.norm(p - (a + t * ab)))


def manchas(img):
    im = Image.open(img).convert('RGB')
    im = im.resize((max(1, im.width // 4), max(1, im.height // 4)), Image.BOX)
    a = np.asarray(im, dtype=float).reshape(-1, 3)
    q = (a // 8).astype(int)
    chave = q[:, 0] * 1024 + q[:, 1] * 32 + q[:, 2]
    u, inv, cont = np.unique(chave, return_inverse=True, return_counts=True)
    soma = np.zeros((len(u), 3))
    for c in range(3):
        soma[:, c] = np.bincount(inv, weights=a[:, c], minlength=len(u))
    media = soma / cont[:, None]
    n = len(a)
    return [(media[i], cont[i] / n) for i in range(len(u)) if cont[i] / n >= MANCHA]


def main():
    if len(sys.argv) < 3:
        sys.exit('uso: preseme-cores.py <cores.json> <quadro.png> [...]')
    cfg = json.load(open(sys.argv[1], encoding='utf-8'))
    cores = [hexrgb(h) for h in cfg.get('paleta', []) + cfg.get('extras', [])]
    segs = segmentos(cores)
    fora_total = 0
    for img in sys.argv[2:]:
        fora = []
        for cor, parte in manchas(img):
            d = min(dist_seg(cor, a, b) for a, b in segs)
            if d > LIMIAR:
                fora.append((parte, '#%02X%02X%02X' % tuple(int(round(x)) for x in cor), d))
        nome = img.split('/')[-1]
        if not fora:
            print(f'cores ok  {nome}')
        else:
            fora.sort(reverse=True)
            fora_total += len(fora)
            print(f'AVISO cores  {nome}: ' + '; '.join(f'{h} em {p * 100:.1f}% do quadro (a {d:.0f} da paleta)' for p, h, d in fora[:5]))
    print(f'CORES: {"nenhuma mancha fora da paleta" if not fora_total else f"{fora_total} mancha(s) fora da paleta (veja acima)"}')


if __name__ == '__main__':
    main()
