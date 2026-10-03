#!/usr/bin/env python3
# Identidade do perfil: avatar, capas de destaque, capas de exemplo para a grade e simulação do perfil.
# Regras em vigor: verde-floresta #17402C, creme, dourado; posts SEM identificador (nome/@); só o nome da série.
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image

HERE = Path(__file__).resolve().parent
F = (HERE.parent / "dir" / "fonts").as_uri()
OUT = HERE / "out"; OUT.mkdir(exist_ok=True)
G, CREAM, PAPER, GOLD, PEN, INK = "#17402C", "#F4EDDF", "#F1E9D8", "#D0AB62", "#A6781C", "#16261E"

GRAIN = ("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>"
         "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/>"
         "<feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0'/></filter>"
         "<rect width='100%' height='100%' filter='url(%23n)'/></svg>")
FONTS = f"""
@font-face{{font-family:'Serif';src:url('{F}/ISerif.ttf');font-style:normal}}
@font-face{{font-family:'Serif';src:url('{F}/ISerif-Italic.ttf');font-style:italic}}
@font-face{{font-family:'Sans';src:url('{F}/ISans.ttf');font-weight:400 700;font-stretch:75% 100%}}
@font-face{{font-family:'Laudo';src:url('{F}/CourierPrime-Regular.ttf');font-weight:400}}
@font-face{{font-family:'Laudo';src:url('{F}/CourierPrime-Bold.ttf');font-weight:700}}
@font-face{{font-family:'Pen';src:url('{F}/ReenieBeanie.ttf')}}
@font-face{{font-family:'UI';src:url('{F}/Hanken.ttf');font-weight:100 900}}
*{{box-sizing:border-box}} html,body{{margin:0}} h1,h2,p{{margin:0}}
:root{{--g:{G};--cream:{CREAM};--paper:{PAPER};--gold:{GOLD};--pen:{PEN};--ink:{INK}}}
"""

# ------------------------------------------------------------------ capas (posts 1080x1350)
TILE_CSS = FONTS + f"""
body{{width:1080px;height:1350px;overflow:hidden;position:relative;font-family:'Sans',sans-serif;-webkit-font-smoothing:antialiased}}
body::after{{content:'';position:absolute;inset:0;background:url("{GRAIN}");opacity:.07;mix-blend-mode:overlay;pointer-events:none;z-index:9}}
.green{{background:var(--g);color:var(--cream);--line:var(--gold)}} .cream{{background:var(--cream);color:var(--g);--line:var(--g)}}
.serie{{position:absolute;left:96px;top:82px;font:italic 400 38px/1 'Serif';opacity:.92}}
.t{{position:absolute;left:96px;right:60px;top:180px}}
.t h1{{font:400 212px/.9 'Serif';letter-spacing:-.028em;white-space:nowrap}} .t h1 i{{font-style:italic}}
.t p{{font:400 44px/1.28 'Sans';margin-top:40px;opacity:.86;max-width:820px}}
.tb{{position:absolute;left:96px;right:96px;top:190px}}
.tb h1{{font:400 150px/.96 'Serif';letter-spacing:-.02em;white-space:nowrap}}
.tb p{{font:400 42px/1.3 'Sans';margin-top:30px;opacity:.86}}
.laudo{{position:absolute;left:150px;top:724px;width:860px;height:760px;background:var(--paper);color:var(--ink);transform:rotate(-3.2deg);
  padding:58px 64px;font:400 34px/1 'Laudo';box-shadow:0 2px 0 rgba(0,0,0,.08),0 26px 50px rgba(0,0,0,.34)}}
.laudo .hd{{font:700 30px/1.25 'Laudo';letter-spacing:.04em;padding-bottom:26px;border-bottom:2px solid var(--ink)}}
.laudo .hd span{{display:block;font-weight:400;letter-spacing:0;opacity:.66;margin-top:6px}}
.laudo .r{{display:flex;align-items:baseline;gap:14px;margin-top:38px}}
.laudo .r u{{flex:1;border-bottom:2px dotted rgba(22,38,30,.5);text-decoration:none;transform:translateY(-6px)}}
.laudo .res{{margin-top:70px;display:flex;align-items:center;gap:70px;font:700 36px/1 'Laudo'}}
.laudo .val{{position:relative;font:700 64px/1 'Laudo';padding:6px 8px;white-space:nowrap}}
.laudo .val svg{{position:absolute;left:-44px;top:-34px;width:calc(100% + 88px);height:calc(100% + 68px)}}
.pen{{font:400 96px/.8 'Pen';color:var(--pen);white-space:nowrap}}
.laudo .note{{position:absolute;left:var(--nx,560px);top:448px;transform:rotate(-5deg)}}
.laudo .arrow{{position:absolute;left:calc(var(--nx,560px) - 156px);top:462px}}
svg.line{{position:absolute;left:0;top:0}}
"""
FIT = ("<script>for(const h of document.querySelectorAll('h1')){let s=parseFloat(getComputedStyle(h).fontSize);"
       "while(h.scrollWidth>h.clientWidth&&s>90){s-=3;h.style.fontSize=s+'px'}}</script>")
LINES = {
 "heart": "M -40 1128 C 250 1128, 520 1140, 668 1112 C 800 1086, 944 1030, 944 936 C 944 868, 880 852, 846 866 C 818 878, 806 902, 800 930 "
          "C 794 902, 780 876, 750 866 C 706 852, 652 880, 652 944 C 652 1030, 748 1086, 806 1150 C 850 1196, 960 1150, 1120 1128",
 "loop":  "M -40 1136 C 300 1136, 600 1156, 752 1112 C 900 1070, 968 962, 884 900 C 800 838, 690 900, 700 1000 C 710 1100, 880 1160, 1120 1122",
 "wave":  "M -40 1130 C 180 1130, 300 1046, 430 1082 C 570 1122, 610 1196, 770 1150 C 900 1112, 970 1050, 1120 1092",
 "drop":  "M -40 1136 C 300 1136, 560 1146, 700 1124 C 800 1108, 892 1082, 892 1010 C 892 950, 832 900, 800 826 C 768 900, 708 950, 708 1010 "
          "C 708 1082, 780 1124, 846 1136 C 930 1150, 1030 1140, 1120 1128",
 "pulse": "M -40 1128 C 200 1120, 380 1132, 520 1128 L 610 1128 L 650 1040 L 700 1196 L 746 1128 C 860 1128, 980 1140, 1120 1128",
}
def line(kind):
    return (f"<svg class='line' width='1080' height='1350' viewBox='0 0 1080 1350' fill='none'>"
            f"<path d='{LINES[kind]}' stroke='var(--line)' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'/></svg>")
CIRC = ("<svg viewBox='0 0 300 120' preserveAspectRatio='none' fill='none'><path d='M38 30 C 90 4, 232 2, 276 34 C 312 62, 262 108, 150 112 "
        "C 52 116, -6 86, 12 52 C 26 26, 96 12, 168 12' stroke='var(--pen)' stroke-width='6' stroke-linecap='round' vector-effect='non-scaling-stroke'/></svg>")
ARROW = ("<svg class='arrow' width='150' height='120' viewBox='0 0 150 120' fill='none'><path d='M140 78 C 96 96, 44 76, 22 18 M22 18 L 16 52 M22 18 L 50 34' "
         "stroke='var(--pen)' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/></svg>")

def page(css, cls, body, extra=""):
    return f"<!doctype html><html><head><meta charset='utf-8'><style>{css}</style></head><body class='{cls}'>{body}{extra}</body></html>"
def tile_c(theme, serie, h1, sub, kind):
    return page(TILE_CSS, theme, f"<div class='serie'>{serie}</div>{line(kind)}<div class='t'><h1>{h1}</h1><p>{sub}</p></div>", FIT)
def tile_b(serie, h1, sub, hd, hd2, rows, res_label, res_val, note, nx=560):
    rr = "".join(f"<div class='r'><span>{a}</span><u></u><span>{b}</span></div>" for a, b in rows)
    return page(TILE_CSS, "green", f"<div class='serie'>{serie}</div><div class='tb'><h1>{h1}</h1><p>{sub}</p></div>"
        f"<div class='laudo' style='--nx:{nx}px'><div class='hd'>{hd}<span>{hd2}</span></div>{rr}"
        f"<div class='res'><span>{res_label}</span><span class='val'>{res_val}{CIRC}</span></div>"
        f"<div class='pen note'>{note}</div>{ARROW}</div>", FIT)

TILES = [
 ("01-comece", tile_c("cream", "Comece por aqui", "Comece<br><i>por aqui.</i>", "O que você encontra nesta página<br>e como eu confiro cada informação.", "wave")),
 ("02-pressao", tile_c("green", "Entenda seu exame", "Sua<br>pressão é<br><i>12 por 8?</i>", "Ela acabou de ganhar outro nome.<br>E não é “normal”.", "heart")),
 ("03-glicemia", tile_b("Entenda seu exame", "Glicemia 105.<br>É diabetes?", "O que esse número do seu exame quer dizer, faixa por faixa.",
                         "GLICEMIA DE JEJUM", "sangue, jejum de 8 horas", [("Referência", "70 a 99 mg/dL")], "Resultado", "105", "e agora?", 520)),
 ("04-antibiotico", tile_c("green", "Mito ou verdade", "Antibiótico<br>não cura<br><i>gripe.</i>", "Gripe é vírus.<br>Antibiótico age em bactéria.", "loop")),
 ("05-avc", tile_c("cream", "Para salvar", "AVC:<br>o teste de<br><i>1 minuto.</i>", "Sorriso, abraço, frase.<br>Reconheceu? Ligue 192.", "pulse")),
 ("06-dengue", tile_c("green", "Para salvar", "Dengue:<br>os sinais<br><i>de alarme.</i>", "Quando voltar ao serviço de saúde<br>sem esperar.", "drop")),
 ("07-hemograma", tile_b("Entenda seu exame", "Hemograma,<br>linha por linha.", "O que cada parte do seu exame de sangue quer dizer.",
                          "HEMOGRAMA COMPLETO", "sangue total", [("Hemoglobina", "13,2 g/dL"), ("Leucócitos", "6.800 /mm³")], "Plaquetas", "240 mil", "é bom?", 610)),
 ("08-coracao", tile_c("green", "Isso é normal?", "Coração<br>acelerado.<br><i>É normal?</i>", "Quando é só o café<br>e quando merece consulta.", "heart")),
 ("09-sereno", tile_c("cream", "Mito ou verdade", "Sereno<br>dá gripe?", "O que a ciência diz sobre<br>friagem, vento e resfriado.", "wave")),
]

# ------------------------------------------------------------------ avatar e destaques
def avatar(txt, style="normal", size=600, ls="-.03em", dy="-1.5%", stroke=0):
    return (f"<!doctype html><html><head><meta charset='utf-8'><style>{FONTS}body{{width:1080px;height:1080px;background:{G};display:grid;place-items:center;overflow:hidden}}"
            f"div{{font:{style} 400 {size}px/1 'Serif';color:{CREAM};letter-spacing:{ls};transform:translateY({dy});white-space:nowrap;-webkit-text-stroke:{stroke}px {CREAM};paint-order:stroke fill}}</style></head><body><div>{txt}</div></body></html>")
ICONS = {  # traço fino, viewBox 0 0 100 100
 "Comece":  "<path d='M16 50 H84 M60 26 L84 50 L60 74'/>",
 "Sobre":   "<circle cx='50' cy='32' r='15'/><path d='M18 86 C18 66 33 56 50 56 C67 56 82 66 82 86'/>",
 "Fontes":  "<path d='M50 26 C41 18 25 17 12 21 V76 C25 72 41 73 50 81 C59 73 75 72 88 76 V21 C75 17 59 18 50 26 Z M50 26 V81'/>",
 "Dúvidas": "<path d='M31 34 C31 14 69 14 69 36 C69 51 50 51 50 68'/><path d='M50 86 L50 86.4' stroke-width='7'/>",
 "Exames":  "<rect x='20' y='8' width='60' height='84' rx='4'/><path d='M32 27 H68 M32 41 H58'/><ellipse cx='50' cy='66' rx='16' ry='11'/>",
 "Mitos":   "<path d='M12 16 H88 V66 H54 L36 84 V66 H12 Z'/><path d='M39 30 L61 52 M61 30 L39 52'/>",
}
PEN_ICONS = {  # marcas a caneta, douradas
 "Comece":  "<path d='M14 58 C 32 42, 58 38, 84 46 M84 46 L 64 30 M84 46 L 66 64' stroke-width='5.2'/>",
 "Sobre":   "<text x='50' y='62' text-anchor='middle' font-family='Serif' font-size='54' letter-spacing='-1' fill='CREAM' stroke='none'>GC</text>"
            "<path d='M20 78 C 38 73, 60 73, 82 77' stroke-width='5'/>",
 "Fontes":  "<path d='M16 54 C 26 60, 34 70, 40 82 C 50 54, 66 32, 86 16' stroke-width='5.6'/>",
 "Dúvidas": "<text x='52' y='84' text-anchor='middle' font-family='Pen' font-size='128' fill='GOLD' stroke='none'>?</text>",
 "Exames":  "<text x='50' y='60' text-anchor='middle' font-family='Laudo' font-weight='700' font-size='30' fill='CREAM' stroke='none'>105</text>"
            "<path transform='translate(8 26) scale(.28 .42)' d='M38 30 C 90 4, 232 2, 276 34 C 312 62, 262 108, 150 112 C 52 116, -6 86, 12 52 C 26 26, 96 12, 168 12' stroke-width='14'/>",
 "Mitos":   "<path d='M24 22 C 42 40, 58 58, 78 80 M78 20 C 62 38, 42 60, 22 82' stroke-width='5.6'/>",
}
def capa(name, pen=False):
    if pen:
        inner = PEN_ICONS[name].replace("GOLD", GOLD).replace("CREAM", CREAM); col, sw = GOLD, 5
    else:
        inner, col, sw = ICONS[name], CREAM, 3.6
    return (f"<!doctype html><html><head><meta charset='utf-8'><style>{FONTS}body{{width:1080px;height:1920px;background:{G};display:grid;place-items:center}}</style></head><body>"
            f"<svg width='520' height='520' viewBox='0 0 100 100' fill='none' stroke='{col}' stroke-width='{sw}' stroke-linecap='round' stroke-linejoin='round'>{inner}</svg></body></html>")

def shoot(pg, html, path, w, h):
    f = OUT / "_tmp.html"; f.write_text(html, encoding="utf-8")
    pg.set_viewport_size({"width": w, "height": h}); pg.goto(f.as_uri()); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(120)
    pg.screenshot(path=str(path)); f.unlink()

def foto_avatar():
    cut = Image.open(HERE.parent / "dir" / "cut-frente.png").convert("RGBA"); px = cut.load()
    for x in range(672, 800):
        for y in range(300, 480):
            r, g, b, a = px[x, y]
            if a and min(r, g, b) > 128 and b >= r - 12: px[x, y] = (r, g, b, 0)
    crop = cut.crop((90, 150, 930, 990)).resize((1080, 1080), Image.LANCZOS)
    bg = Image.new("RGBA", (1080, 1080), G); bg.alpha_composite(crop); bg.convert("RGB").save(OUT / "avatar-foto-simulacao.jpg", quality=92)

if __name__ == "__main__":
    what = sys.argv[1:] or ["tiles", "avatar", "capas"]
    with sync_playwright() as pw:
        b = pw.chromium.launch(); pg = b.new_page(device_scale_factor=1)
        if "tiles" in what:
            for name, html in TILES:
                shoot(pg, html, OUT / f"tile-{name}.png", 1080, 1350)
                Image.open(OUT / f"tile-{name}.png").convert("RGB").save(OUT / f"tile-{name}.jpg", quality=92); (OUT / f"tile-{name}.png").unlink()
        if "avatar" in what:
            shoot(pg, avatar("GC"), OUT / "avatar-gc.png", 1080, 1080)
            shoot(pg, avatar("GC", "normal", 680, "-.02em", "-1.5%", 7), OUT / "avatar-gc-forte.png", 1080, 1080)
            shoot(pg, avatar("GC", "normal", 720, "-.015em", "-1.5%", 12), OUT / "avatar-gc-forte2.png", 1080, 1080)
            shoot(pg, avatar("GC", "italic", 600, "-.02em"), OUT / "avatar-gc-italico.png", 1080, 1080)
            shoot(pg, avatar("G", "normal", 780, "0", "-2%"), OUT / "avatar-g.png", 1080, 1080)
            foto_avatar()
        if "capas" in what:
            for n in ICONS:
                shoot(pg, capa(n), OUT / f"destaque-{n.lower().replace('ú','u')}.png", 1080, 1920)
                shoot(pg, capa(n, True), OUT / f"destaquepen-{n.lower().replace('ú','u')}.png", 1080, 1920)
        b.close()
    print("ok")
