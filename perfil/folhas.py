#!/usr/bin/env python3
# Folhas com TUDO o que foi gerado, com código em cada peça, para ele escolher.
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont
import perfil as P

O = P.OUT
IG = P.HERE.parent
FONT = str(IG / "dir" / "fonts" / "Hanken.ttf")
BG = (233, 230, 223)
def font(sz, bold=False):
    f = ImageFont.truetype(FONT, sz)
    try: f.set_variation_by_axes([700 if bold else 420])
    except Exception: pass
    return f
def circ(im, sz):
    s = im.convert("RGB").resize((sz * 3, sz * 3), Image.LANCZOS)
    m = Image.new("L", (sz * 3, sz * 3), 0); ImageDraw.Draw(m).ellipse((0, 0, sz * 3 - 1, sz * 3 - 1), fill=255)
    out = Image.new("RGB", (sz * 3, sz * 3), BG); out.paste(s, (0, 0), m)
    return out.resize((sz, sz), Image.LANCZOS)
def text(d, xy, s, sz, bold=False, fill=(21, 21, 21), anchor="la"):
    d.text(xy, s, font=font(sz, bold), fill=fill, anchor=anchor)

# ---------------------------------------------------------------- 1. fotos de perfil
AV = [("F1", "GC fino", "avatar-gc.png"), ("F2", "GC itálico", "avatar-gc-italico.png"), ("F3", "G", "avatar-g.png"),
      ("F4", "GC reforçado (o que mandei)", "avatar-gc-forte.png"), ("F5", "GC mais grosso", "avatar-gc-forte2.png"),
      ("F6", "Sua foto (simulação)", "avatar-foto-simulacao.jpg"), ("F7", "Rodada 1 (azul e amarelo)", IG / "out" / "marca" / "perfil.jpg")]
def folha_fotos():
    cw, pad = 420, 50
    W = pad * 2 + cw * 4; H = pad + 2 * 610 + 30
    sh = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(sh)
    text(d, (pad, 34), "Fotos de perfil: todas as variações", 40, True)
    for i, (code, name, f) in enumerate(AV):
        im = Image.open(f if isinstance(f, Path) else O / f)
        x = pad + (i % 4) * cw; y = 110 + (i // 4) * 610
        sh.paste(circ(im, 330), (x, y))
        text(d, (x, y + 350), code, 40, True); text(d, (x + 70, y + 360), name, 25)
        sh.paste(circ(im, 110), (x, y + 420)); sh.paste(circ(im, 56), (x + 140, y + 447)); sh.paste(circ(im, 32), (x + 222, y + 459))
        text(d, (x, y + 540), "no perfil, nos stories, nos comentários", 19, fill=(90, 90, 90))
    sh.save(O / "todas-1-fotos-de-perfil.jpg", quality=92); return sh.size

# ---------------------------------------------------------------- 2. capas dos destaques
OLD_ICONS = {
 "Comece":  "<path d='M22 50 H76 M57 31 L76 50 L57 69'/>",
 "Sobre":   "<circle cx='50' cy='36' r='11.5'/><path d='M26 77 C26 62 37 55 50 55 C63 55 74 62 74 77'/>",
 "Fontes":  "<path d='M50 34 C43 28 31 27 21 30 V71 C31 68 43 69 50 75 C57 69 69 68 79 71 V30 C69 27 57 28 50 34 Z M50 34 V75'/>",
 "Dúvidas": "<path d='M36 38 C36 24 64 24 64 39 C64 50 50 50 50 63'/><path d='M50 76 L50 76.4' stroke-width='5.4'/>",
 "Exames":  "<rect x='28' y='19' width='44' height='62' rx='3'/><path d='M37 33 H63 M37 43 H56'/><ellipse cx='50' cy='62' rx='12' ry='8'/>",
 "Mitos":   "<path d='M22 26 H78 V62 H52 L39 75 V62 H22 Z'/><path d='M42 36 L58 52 M58 36 L42 52'/>",
}
OI = "<text x='50' y='74' text-anchor='middle' font-family='Pen' font-size='96' fill='%s' stroke='none'>oi</text>" % P.GOLD
def svg_page(inner, col, sw, size=520):
    return (f"<!doctype html><html><head><meta charset='utf-8'><style>{P.FONTS}body{{width:1080px;height:1080px;background:{P.G};display:grid;place-items:center}}</style></head><body>"
            f"<svg width='{size}' height='{size}' viewBox='0 0 100 100' fill='none' stroke='{col}' stroke-width='{sw}' stroke-linecap='round' stroke-linejoin='round'>{inner}</svg></body></html>")
NAMES = ["Comece", "Sobre", "Fontes", "Dúvidas", "Exames", "Mitos"]
def key(n): return n.lower().replace("ú", "u")
def folha_capas():
    with sync_playwright() as pw:
        b = pw.chromium.launch(); pg = b.new_page(device_scale_factor=1)
        for n in NAMES: P.shoot(pg, svg_page(OLD_ICONS[n], P.CREAM, 3.4, 560), O / f"_d1-{key(n)}.png", 1080, 1080)
        P.shoot(pg, svg_page(OI, P.GOLD, 5), O / "_d3-oi.png", 1080, 1080)
        b.close()
    rows = [("D1", "Traço fino, pequeno", [Image.open(O / f"_d1-{key(n)}.png") for n in NAMES], NAMES),
            ("D2", "Traço fino, grande", [Image.open(O / f"destaque-{key(n)}.png").crop((0, 420, 1080, 1500)) for n in NAMES], NAMES),
            ("D3", "Caneta dourada (o que mandei)", [Image.open(O / f"destaquepen-{key(n)}.png").crop((0, 420, 1080, 1500)) for n in NAMES], NAMES),
            ("D4", "Caneta dourada, com \"oi\" no Sobre", [Image.open(O / "_d3-oi.png")], ["Sobre"]),
            ("D5", "Rodada 1 (azul e amarelo)", [Image.open(IG / "out" / "marca" / f"destaque-{k}.jpg") for k in ("sobre", "exames", "mitos", "alertas")], ["Sobre", "Exames", "Mitos", "Alertas"])]
    pad, cw, rh = 50, 250, 330
    W = pad * 2 + 330 + cw * 6; H = 110 + rh * len(rows) + 20
    sh = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(sh)
    text(d, (pad, 34), "Capas dos destaques: todos os conjuntos", 40, True)
    for r, (code, name, ims, labels) in enumerate(rows):
        y = 110 + r * rh
        text(d, (pad, y + 50), code, 46, True)
        for j, part in enumerate(name.replace(" (", "\n(").replace(", ", ",\n").split("\n")): text(d, (pad, y + 112 + j * 30), part, 23)
        for i, (im, lb) in enumerate(zip(ims, labels)):
            x = pad + 330 + i * cw
            sh.paste(circ(im, 170), (x, y)); sh.paste(circ(im, 64), (x + 180, y + 106))
            text(d, (x + 85, y + 186), lb, 22, anchor="ma")
    sh.save(O / "todas-2-capas-de-destaque.jpg", quality=92); return sh.size

# ---------------------------------------------------------------- 3. capas de post
def folha_posts():
    tiles = sorted(O.glob("tile-*.jpg")); pad, w, h, g = 50, 520, 650, 40
    W = pad * 2 + 3 * w + 2 * g; H = 110 + 3 * (h + 70) + 10
    sh = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(sh)
    text(d, (pad, 34), "Capas de post de exemplo (sem identificador)", 40, True)
    for i, t in enumerate(tiles):
        x = pad + (i % 3) * (w + g); y = 110 + (i // 3) * (h + 70)
        sh.paste(Image.open(t).resize((w, h), Image.LANCZOS), (x, y)); text(d, (x, y + h + 10), f"P{i+1}", 34, True)
    sh.save(O / "todas-3-capas-de-post.jpg", quality=90); return sh.size

# ---------------------------------------------------------------- 4. rodadas anteriores
def folha_antigas():
    D = IG / "dir"; R1 = IG / "out" / "2026-10-05-pressao-12-por-8"
    groups = [("R1", "Rodada 1: letra pesada, azul e amarelo (reprovada)", [R1 / "01.jpg", R1 / "03.jpg", R1 / "08.jpg"], 300),
              ("R2", "Rodada 2: três direções editoriais (reprovada)", [D / "direcao-A.jpg", D / "direcao-B.jpg", D / "direcao-C.jpg"], 600),
              ("R3", "Rodada 3: arco, selo e degradê (cores aprovadas, desenho não)", [D / "capa-verde.jpg", D / "dados-verde.jpg", D / "resumo-verde.jpg", D / "capa-petroleo.jpg", D / "capa-vinho.jpg"], 300),
              ("R4", "Rodada 4, desenho B: laudo anotado (vai para teste)", [D / "B1.jpg", D / "B2.jpg", D / "B3.jpg"], 300),
              ("R5", "Rodada 4, desenho C: cartaz com linha dourada (vai para teste)", [D / "C1.jpg", D / "C2.jpg", D / "C3.jpg"], 300),
              ("R6", "Reel de texto animado (quadros)", [D / "_reel-quadros.jpg"], 1000),
              ("R7", "Teste dos tons de verde", [D / "tons-de-verde.jpg"], 700)]
    pad, g = 50, 24; W = 2000
    rows = []
    for code, name, files, tw in groups:
        ims = []
        for f in files:
            im = Image.open(f).convert("RGB"); ims.append(im.resize((tw, round(im.height * tw / im.width)), Image.LANCZOS))
        rows.append((code, name, ims))
    H = 110 + sum(60 + max(i.height for i in ims) + 40 for _, _, ims in rows)
    sh = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(sh)
    text(d, (pad, 34), "Rodadas anteriores", 40, True); y = 110
    for code, name, ims in rows:
        text(d, (pad, y), code, 36, True); text(d, (pad + 80, y + 8), name, 25); y += 60; x = pad
        for k, im in enumerate(ims):
            sh.paste(im, (x, y)); x += im.width + g
        y += max(i.height for i in ims) + 40
    sh.save(O / "todas-4-rodadas-anteriores.jpg", quality=88); return sh.size

if __name__ == "__main__":
    print(folha_fotos(), folha_capas(), folha_posts(), folha_antigas())
