#!/usr/bin/env python3
# Rodada 4: (1) teste de tons de verde com a foto dele; (2) duas direções de desenho sem foto.
import base64, io, sys
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image

HERE = Path(__file__).resolve().parent
F = (HERE / "fonts").as_uri()

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
*{{box-sizing:border-box}} html,body{{margin:0}}
"""

GREEN = "#17402C"   # tom provisório; troca quando ele escolher
TOK = f"--g:{GREEN};--cream:#F4EDDF;--paper:#F1E9D8;--gold:#D0AB62;--pen:#A6781C;--ink:#16261E;"

BASE = FONTS + f"""
body{{width:1080px;height:1350px;overflow:hidden;position:relative;font-family:'Sans',sans-serif;-webkit-font-smoothing:antialiased;{TOK}}}
body::after{{content:'';position:absolute;inset:0;background:url("{GRAIN}");opacity:.07;mix-blend-mode:overlay;pointer-events:none;z-index:9}}
.green{{background:var(--g);color:var(--cream)}}
.paperbg{{background:var(--cream);color:var(--g)}}
.top{{position:absolute;left:96px;right:96px;top:84px;display:flex;justify-content:space-between;align-items:baseline;font:500 27px/1.2 'Sans'}}
.top i{{font:italic 400 36px/1 'Serif'}}
.foot{{position:absolute;left:96px;right:96px;bottom:74px;display:flex;justify-content:space-between;align-items:baseline;font:400 25px/1.3 'Sans';opacity:.72}}
h1,h2,p{{margin:0}}
"""

def circle(w, h, sw=6, color="var(--pen)"):
    # elipse desenhada à mão, com sobra no fim do traço
    return (f"<svg class='circ' width='{w}' height='{h}' viewBox='0 0 300 120' preserveAspectRatio='none' fill='none'>"
            f"<path d='M38 30 C 90 4, 232 2, 276 34 C 312 62, 262 108, 150 112 C 52 116, -6 86, 12 52 C 26 26, 96 12, 168 12' "
            f"stroke='{color}' stroke-width='{sw}' stroke-linecap='round' vector-effect='non-scaling-stroke'/></svg>")

def tick(color="var(--pen)", s=54):
    return (f"<svg width='{s}' height='{s}' viewBox='0 0 54 54' fill='none'><path d='M8 30 C 14 34, 18 40, 22 46 C 28 30, 38 16, 48 8' "
            f"stroke='{color}' stroke-width='5.5' stroke-linecap='round' stroke-linejoin='round'/></svg>")

# ---------------------------------------------------------------- direção B: laudo anotado
B_CSS = BASE + """
.t{position:absolute;left:96px;right:96px;top:196px}
.t h1{font:400 150px/.96 'Serif';letter-spacing:-.02em}
.t p{font:400 42px/1.3 'Sans';margin-top:30px;opacity:.86}
.laudo{position:absolute;left:150px;top:724px;width:860px;height:760px;background:var(--paper);color:var(--ink);transform:rotate(-3.2deg);
  padding:58px 64px;font:400 34px/1 'Laudo';box-shadow:0 2px 0 rgba(0,0,0,.08),0 26px 50px rgba(0,0,0,.34)}
.laudo .hd{font:700 30px/1.25 'Laudo';letter-spacing:.04em;padding-bottom:26px;border-bottom:2px solid var(--ink)}
.laudo .hd span{display:block;font-weight:400;letter-spacing:0;opacity:.66;margin-top:6px}
.laudo .r{display:flex;align-items:baseline;gap:14px;margin-top:38px}
.laudo .r u{flex:1;border-bottom:2px dotted rgba(22,38,30,.5);text-decoration:none;transform:translateY(-6px)}
.laudo .res{margin-top:70px;display:flex;align-items:center;gap:70px;font:700 36px/1 'Laudo'}
.laudo .val{position:relative;font:700 64px/1 'Laudo';padding:6px 8px}
.laudo .val .circ{position:absolute;left:-44px;top:-34px}
.pen{font:400 82px/.8 'Pen';color:var(--pen)}
.laudo .note{position:absolute;left:560px;top:448px;transform:rotate(-5deg);font-size:96px}
.laudo .arrow{position:absolute;left:404px;top:462px}

/* interno */
.in{position:absolute;left:96px;right:96px;top:180px}
.in h2{font:400 88px/1 'Serif';letter-spacing:-.018em}
.regua{position:relative;margin-top:76px;height:150px}
.regua .line{position:absolute;left:0;right:0;top:64px;height:3px;background:var(--g)}
.regua .tk{position:absolute;top:44px;width:3px;height:43px;background:var(--g)}
.regua .mini{position:absolute;top:56px;width:2px;height:19px;background:var(--g);opacity:.55}
.regua .lb{position:absolute;top:100px;transform:translateX(-50%);font:700 34px/1 'Laudo';white-space:nowrap}
.regua .zone{position:absolute;top:0;font:500 27px/1 'Sans';opacity:.72;transform:translateX(-50%);white-space:nowrap}
.regua .circ{position:absolute;left:calc(33.3% - 128px);top:74px}
.regua .pen{position:absolute;left:calc(33.3% - 150px);top:176px;font-size:68px;transform:rotate(-4deg);white-space:nowrap}
.rows{margin-top:118px}
.row{display:grid;grid-template-columns:400px 1fr;column-gap:36px;padding:28px 0;border-top:2px solid rgba(21,61,44,.2);align-items:baseline}
.row b{font:italic 400 56px/1 'Serif'} .row b span{display:block;font:400 28px/1 'Laudo';margin-top:12px;opacity:.75}
.row p{font:400 36px/1.3 'Sans'}

/* final */
.fim h2{position:absolute;left:96px;top:170px;font:400 112px/1 'Serif';letter-spacing:-.02em}
.bil{position:absolute;left:96px;right:96px;top:340px;background:var(--paper);color:var(--ink);transform:rotate(1.4deg);padding:52px 58px 56px;
  box-shadow:0 2px 0 rgba(0,0,0,.08),0 26px 50px rgba(0,0,0,.34)}
.bil li{display:grid;grid-template-columns:62px 1fr;gap:22px;font:400 39px/1.27 'Sans';margin-top:30px}
.bil li:first-child{margin-top:0} .bil ul{list-style:none;margin:0;padding:0} .bil b{font-weight:700}
.envie{position:absolute;left:96px;right:96px;top:1078px;font:italic 400 52px/1.08 'Serif'}
.src{position:absolute;left:96px;right:240px;bottom:70px;font:400 21px/1.35 'Sans';opacity:.62}
.pg{position:absolute;right:96px;bottom:74px;font:400 25px/1 'Sans';opacity:.72}
"""
TOP = "<div class='top'><i>Entenda seu exame</i></div>"
B_COVER = (TOP +
    "<div class='t'><h1>Seu 12 por 8<br>mudou de nome.</h1><p>A diretriz brasileira de 2025 reclassificou a pressão que todo mundo chamava de perfeita.</p></div>"
    "<div class='laudo'><div class='hd'>AFERIÇÃO DE PRESSÃO ARTERIAL<span>consultório, braço direito, sentada</span></div>"
    "<div class='r'><span>Sistólica</span><u></u><span>120 mmHg</span></div>"
    "<div class='r'><span>Diastólica</span><u></u><span>80 mmHg</span></div>"
    "<div class='res'><span>Resultado</span><span class='val'>12 x 8" + circle(330, 150) + "</span></div>"
    "<div class='pen note'>normal?</div>"
    "<svg class='arrow' width='150' height='120' viewBox='0 0 150 120' fill='none'><path d='M140 78 C 96 96, 44 76, 22 18 M22 18 L 16 52 M22 18 L 50 34' stroke='var(--pen)' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/></svg>"
    "</div>")
B_IN = (TOP +
    "<div class='in'><h2>A régua mudou.<br>Veja onde você está.</h2>"
    "<div class='regua'><div class='line'></div>"
    + "".join(f"<div class='mini' style='left:{x}%'></div>" for x in (8.3, 16.6, 25, 41.6, 50, 58.3, 75, 83.3, 91.6)) +
    "<div class='tk' style='left:33.3%'></div><div class='tk' style='left:66.6%'></div>"
    "<div class='zone' style='left:16.6%'>normal</div><div class='zone' style='left:50%'>pré-hipertensão</div><div class='zone' style='left:83.3%'>hipertensão</div>"
    "<div class='lb' style='left:33.3%'>12 por 8</div><div class='lb' style='left:66.6%'>14 por 9</div>"
    + circle(256, 92, 5) + "<div class='pen'>antes era “normal”</div></div>"
    "<div class='rows'>"
    "<div class='row'><b>Normal<span>abaixo de 120/80</span></b><p>Mantenha os hábitos e meça uma vez por ano.</p></div>"
    "<div class='row'><b>Pré-hipertensão<span>120–139 / 80–89</span></b><p>Não é doença. É o aviso para rever os hábitos.</p></div>"
    "<div class='row'><b>Hipertensão<span>140/90 ou mais</span></b><p>Confirme em consulta, em duas ocasiões.</p></div>"
    "</div></div><div class='foot'><span>Se os dois números caírem em faixas diferentes, vale a mais alta.</span><span>3/7</span></div>")
B_FIM = (TOP + "<div class='fim'><h2>Para guardar</h2></div>"
    "<div class='bil'><ul>"
    f"<li>{tick()}<span>12 por 8 agora se chama <b style='white-space:nowrap'>pré-hipertensão</b>. Não é doença: é um aviso.</span></li>"
    f"<li>{tick()}<span>O cuidado começa pelos hábitos: peso, sal, movimento, sono.</span></li>"
    f"<li>{tick()}<span>Hipertensão só se confirma com 14 por 9 ou mais em <b>duas ocasiões</b>.</span></li>"
    f"<li>{tick()}<span>Meça <b>uma vez por ano</b>, mesmo sem sentir nada.</span></li></ul></div>"
    "<div class='envie'>Envie para quem ainda acha<br>que 12 por 8 é perfeito.</div>"
    "<div class='src'>Fontes: Diretriz Brasileira de Hipertensão Arterial 2025 (SBC, SBH, SBN); Ministério da Saúde. Conteúdo educativo, não substitui consulta.</div><div class='pg'>7/7</div>")

# ---------------------------------------------------------------- direção C: cartaz tipográfico + linha contínua
LINE = ("M -40 1128 C 250 1128, 520 1140, 668 1112 C 800 1086, 944 1030, 944 936 C 944 868, 880 852, 846 866 C 818 878, 806 902, 800 930 "
        "C 794 902, 780 876, 750 866 C 706 852, 652 880, 652 944 C 652 1030, 748 1086, 806 1150 C 850 1196, 960 1150, 1120 1128 "
        # slide 2: pulso
        "C 1300 1104, 1420 1128, 1520 1128 L 1610 1128 L 1650 1040 L 1700 1196 L 1746 1128 "
        "C 1900 1128, 2040 1150, 2200 1128 "
        # slide 3: desce e vira sublinhado
        "C 2420 1098, 2560 1160, 2700 1150 C 2860 1140, 2960 1176, 3144 1168")
def line(i, color):
    return (f"<svg style='position:absolute;left:0;top:0' width='1080' height='1350' viewBox='{i*1080} 0 1080 1350' fill='none'>"
            f"<path d='{LINE}' stroke='{color}' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'/></svg>")
C_CSS = BASE + """
.t{position:absolute;left:96px;right:60px;top:186px}
.t h1{font:400 212px/.9 'Serif';letter-spacing:-.028em}
.t h1 i{font-style:italic}
.t p{font:400 44px/1.28 'Sans';margin-top:40px;opacity:.86;max-width:760px}
.big{position:absolute;left:96px;right:96px;top:176px}
.big .lab{font:400 44px/1.25 'Sans';opacity:.8}
.big .n{font:italic 400 330px/.86 'Serif';letter-spacing:-.035em;margin:26px 0 0 -14px}
.big h2{font:400 92px/1 'Serif';letter-spacing:-.018em;margin-top:34px}
.big p{font:400 42px/1.32 'Sans';margin-top:34px;max-width:800px;opacity:.86}
.fim h2{position:absolute;left:96px;top:176px;font:400 150px/.94 'Serif';letter-spacing:-.022em}
.lst{position:absolute;left:96px;right:96px;top:520px;list-style:none;margin:0;padding:0}
.lst li{font:400 42px/1.28 'Sans';padding:28px 0;border-top:1.5px solid rgba(244,237,223,.28)}
.lst li:last-child{border-bottom:1.5px solid rgba(244,237,223,.28)} .lst b{font-weight:700}
.sig{position:absolute;right:96px;top:1088px;font:italic 400 58px/1 'Serif'}
.src{position:absolute;left:96px;right:240px;bottom:70px;font:400 21px/1.35 'Sans';opacity:.62}
.pg{position:absolute;right:96px;bottom:74px;font:400 25px/1 'Sans';opacity:.72}
"""
C_COVER = (TOP + line(0, "var(--gold)") +
    "<div class='t'><h1>Sua<br>pressão é<br><i>12 por 8?</i></h1><p>Ela acabou de ganhar outro nome.<br>E não é “normal”.</p></div>")
C_IN = (TOP + line(1, "var(--g)") +
    "<div class='big'><div class='lab'>Desde 2025, quem mede</div><div class='n'>12 por 8</div>"
    "<h2>está em pré-hipertensão.</h2><p>Não é doença. É um aviso: a hora de rever os hábitos é agora.</p></div>"
    "<div class='pg'>2/7</div>")
C_FIM = (TOP + line(2, "var(--gold)") + "<div class='fim'><h2>Para<br><i style='font-style:italic'>guardar</i></h2></div>"
    "<ul class='lst'><li>12 por 8 agora se chama <b>pré-hipertensão</b>: é um aviso, não uma doença.</li>"
    "<li>Hipertensão só se confirma com 14 por 9 ou mais em <b>duas ocasiões</b>.</li>"
    "<li>Meça <b>uma vez por ano</b>, mesmo sem sentir nada.</li></ul>"
    "<div class='src'>Fontes: Diretriz Brasileira de Hipertensão Arterial 2025 (SBC, SBH, SBN); Ministério da Saúde. Conteúdo educativo, não substitui consulta.</div><div class='pg'>7/7</div>")

# ---------------------------------------------------------------- teste de tons com a foto
TONS = [("Oliva", "#4B4F27"), ("Militar", "#3B4529"), ("Musgo", "#2F4A2C"),
        ("Floresta", "#17402C"), ("Garrafa", "#0C3A2B"), ("Pinho", "#0A4038")]
def photo_b64():
    im = Image.open(HERE / "cut-frente.png").convert("RGBA")
    px = im.load()
    for x in range(672, 800):          # resto de parede branca ao lado do cabelo
        for y in range(300, 480):
            r, g, b, a = px[x, y]
            if a and min(r, g, b) > 128 and b >= r - 12: px[x, y] = (r, g, b, 0)
    im = im.crop((110, 190, 819, 1010))
    buf = io.BytesIO(); im.save(buf, "PNG"); return base64.b64encode(buf.getvalue()).decode()
def tons_html():
    ph = photo_b64()
    tiles = "".join(
        f"<div class='tile' style='background:{hx}'><img src='data:image/png;base64,{ph}'>"
        f"<div class='cap'><b>{nm}</b><span>{hx}</span></div><div class='aa'>Sua pressão é<br><i>12 por 8?</i></div></div>" for nm, hx in TONS)
    return ("<!doctype html><html><head><meta charset='utf-8'><style>" + FONTS +
            "body{width:2160px;height:1900px;background:#E9E6DF;padding:40px;display:grid;grid-template-columns:repeat(3,1fr);gap:30px;font-family:'Sans'}"
            ".tile{position:relative;overflow:hidden;color:#F4EDDF}"
            ".tile img{position:absolute;left:50%;bottom:-6px;height:74%;transform:translateX(-50%)}"
            ".cap{position:absolute;left:36px;top:30px;font:600 40px/1.1 'Sans'} .cap span{display:block;font:400 26px/1.4 'Sans';opacity:.75}"
            ".aa{position:absolute;right:36px;top:30px;font:400 40px/1.05 'Serif';text-align:right;width:330px} .aa i{color:#D0AB62}"
            "</style></head><body>" + tiles + "</body></html>")

def page(css, cls, body):
    return f"<!doctype html><html><head><meta charset='utf-8'><style>{css}</style></head><body class='{cls}'>{body}</body></html>"

jobs = [("B1", page(B_CSS, "green", B_COVER)), ("B2", page(B_CSS, "paperbg", B_IN)), ("B3", page(B_CSS, "green", B_FIM)),
        ("C1", page(C_CSS, "green", C_COVER)), ("C2", page(C_CSS, "paperbg", C_IN)), ("C3", page(C_CSS, "green", C_FIM))]
only = sys.argv[1:]
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width": 1080, "height": 1350}, device_scale_factor=1)
    for name, html in jobs:
        f = HERE / f"_{name}.html"; f.write_text(html, encoding="utf-8")
        pg.goto(f.as_uri()); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(150)
        pg.screenshot(path=str(HERE / f"{name}.png")); f.unlink()
        Image.open(HERE / f"{name}.png").convert("RGB").save(HERE / f"{name}.jpg", "JPEG", quality=92); (HERE / f"{name}.png").unlink()
    pg2 = b.new_page(viewport={"width": 2160, "height": 1900}, device_scale_factor=1)
    f = HERE / "_tons.html"; f.write_text(tons_html(), encoding="utf-8")
    pg2.goto(f.as_uri()); pg2.evaluate("document.fonts.ready"); pg2.wait_for_timeout(200)
    pg2.screenshot(path=str(HERE / "tons.png")); f.unlink()
    im = Image.open(HERE / "tons.png").convert("RGB"); im.resize((1620, 1425), Image.LANCZOS).save(HERE / "tons-de-verde.jpg", "JPEG", quality=90); (HERE / "tons.png").unlink()
    b.close()
g = 30
for k, out in (("B", "desenho-B-laudo.jpg"), ("C", "desenho-C-cartaz.jpg")):
    sh = Image.new("RGB", (1080 * 3 + g * 4, 1350 + g * 2), (232, 230, 226))
    for i in range(3): sh.paste(Image.open(HERE / f"{k}{i+1}.jpg"), (g + i * (1080 + g), g))
    sh.resize((sh.width // 2, sh.height // 2), Image.LANCZOS).save(HERE / out, "JPEG", quality=90)
print("ok")
