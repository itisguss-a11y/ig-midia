#!/usr/bin/env python3
# Simulação da grade com capas variadas (para o perfil não virar "só verde") e o antes/depois do slide das faixas.
# Títulos das capas futuras são só exemplos de capa: o conteúdo de cada post ainda passa pela conferência na fonte.
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image
import perfil as P

O = P.OUT
MID = P.HERE.parent / "midia"
CSS = P.TILE_CSS + """
.gold{background:var(--gold);color:var(--g);--line:var(--g)}
.gold .t p,.gold .num p{opacity:.92}
.num{position:absolute;left:96px;right:80px;top:176px}
.num .q{font:400 92px/1 'Serif';letter-spacing:-.018em}
.num .n{position:relative;display:inline-block;font:italic 400 500px/.86 'Serif';letter-spacing:-.04em;margin:36px 0 0 -16px}
.num .n svg{position:absolute;left:-46px;top:30px;width:calc(100% + 92px);height:calc(100% - 40px)}
.num p{font:400 44px/1.28 'Sans';margin-top:34px;opacity:.86;max-width:820px}
.foto{position:absolute;left:0;top:0;width:1080px;height:860px;background:
  radial-gradient(ellipse at 38% 42%, #c9a58a 0%, #b58d72 34%, #8f6b55 70%, #6f5243 100%)}
.foto::after{content:'foto do sinal (com licença de uso)';position:absolute;left:0;right:0;top:400px;text-align:center;font:500 34px/1 'Sans';color:rgba(255,255,255,.82);letter-spacing:.04em}
.fx{position:absolute;left:96px;right:60px;top:930px}
.fx .s{font:italic 400 38px/1 'Serif';opacity:.92}
.fx h1{font:400 128px/.94 'Serif';letter-spacing:-.022em;margin-top:26px}
"""
def c(theme, serie, h1, sub, kind):
    return P.page(CSS, theme, f"<div class='serie'>{serie}</div>{P.line(kind)}<div class='t'><h1>{h1}</h1><p>{sub}</p></div>", P.FIT)
def n(theme, serie, q, num, sub):
    return P.page(CSS, theme, f"<div class='serie'>{serie}</div><div class='num'><div class='q'>{q}</div><div class='n'>{num}{P.CIRC}</div><p>{sub}</p></div>")
def f(serie, h1):
    return P.page(CSS, "green", f"<div class='foto'></div><div class='fx'><div class='s'>{serie}</div><h1>{h1}</h1></div>")
def b(*a, **k):
    return P.tile_b(*a, **k).replace(P.TILE_CSS, CSS)

# cada capa futura, em função do fundo pedido
def coracao(th): return c(th, "Isso é normal?", "Coração<br>acelerado.<br><i>É normal?</i>", "Quando é só o café<br>e quando merece consulta.", "heart")
def sereno(th):  return c(th, "Mito ou verdade", "Sereno<br>dá <i>gripe?</i>", "O que se sabe sobre friagem,<br>vento e resfriado.", "wave")
def avc(th):     return c(th, "Para salvar", "AVC:<br>o teste de<br><i>1 minuto.</i>", "Sorriso, abraço, frase.", "pulse")
def dengue(th):  return c(th, "Para salvar", "Dengue:<br>os sinais<br><i>de alarme.</i>", "Quando voltar ao serviço de saúde<br>sem esperar.", "drop")
def comece(th):  return c(th, "Comece por aqui", "Comece<br><i>por aqui.</i>", "O que você encontra nesta página.", "wave")
def cabeca(th):  return c(th, "Isso é normal?", "Dor de<br>cabeça<br><i>todo dia?</i>", "Quando deixa de ser comum.", "loop")
def colest(th):  return n(th, "Entenda seu exame", "Colesterol", "190", "Esse número é alto? Depende de quem você é.")
def hemo():      return b("Entenda seu exame", "Hemograma,<br>linha por linha.", "O que cada parte do seu exame de sangue quer dizer.",
                          "HEMOGRAMA COMPLETO", "sangue total", [("Hemoglobina", "13,2 g/dL"), ("Leucócitos", "6.800 /mm³")], "Plaquetas", "240 mil", "é bom?", 610)
def pescoco():   return f("Sinais do corpo", "Mancha escura<br>no pescoço?")

G, C, D = "green", "cream", "gold"
OPCOES = {
 "A": ("Xadrez: verde e creme", "Duas cores alternadas. O mais simples de manter.",
       [coracao(G), sereno(C), hemo(), avc(C), colest(G), dengue(C), comece(G), cabeca(C), pescoco()]),
 "B": ("Três fundos em rodízio", "Verde, creme e dourado. Cada fileira tem os três.",
       [coracao(G), sereno(C), colest(D), avc(C), dengue(D), hemo(), cabeca(D), comece(G), sereno(C)]),
 "C": ("Uma capa por série", "Cada série tem a sua cara: laudo, número, foto, pergunta.",
       [pescoco(), sereno(D), hemo(), coracao(C), colest(C), avc(G), cabeca(C), dengue(G), sereno(D)]),
}
PUB = ["2026-10-03-antibiotico-gripe/capa.jpg", "2026-10-03-glicemia-de-jejum/01.jpg", "2026-10-03-pressao-12-por-8/01.jpg"]

MOCK = P.FONTS + """
body{background:#E9E6DF;padding:36px 40px 40px;display:flex;gap:44px;font-family:'UI';color:#111;width:max-content}
.cap{width:410px;margin-bottom:14px} .cap b{display:block;font:700 26px/1.2 'UI'} .cap span{display:block;font:400 15.5px/1.35 'UI';color:#4a4a4a;margin-top:4px;min-height:42px}
.phone{width:410px;background:#fff;border-radius:28px;border:8px solid #151515;overflow:hidden;padding:10px 0 0}
.head{display:flex;align-items:center;padding:12px 16px 0;gap:22px}
.av{width:86px;height:86px;border-radius:50%}
.st{flex:1;display:flex;justify-content:space-around;text-align:center} .st b{display:block;font:700 17px/1.25 'UI'} .st span{font:400 13.5px/1.2 'UI'}
.nm{padding:12px 16px 0;font:700 14px/1.3 'UI'} .cat{padding:1px 16px 0;font:400 14px/1.3 'UI';color:#737373} .bio{padding:1px 16px 12px;font:400 14px/1.38 'UI'}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;border-top:1px solid #efefef}
.grid div{aspect-ratio:3/4;overflow:hidden;position:relative}
.grid img{width:100%;height:100%;object-fit:cover;display:block}
.grid div.pub::after{content:'já publicado';position:absolute;left:6px;bottom:6px;font:600 9.5px/1 'UI';color:#fff;background:rgba(0,0,0,.55);padding:3px 5px;border-radius:3px}
"""
def phone(code, title, desc, files):
    cells = "".join(f"<div><img src='{x}'></div>" for x in files) + "".join(f"<div class='pub'><img src='{(MID / p).as_uri()}'></div>" for p in PUB)
    return f"""<div class='col'><div class='cap'><b>{code}. {title}</b><span>{desc}</span></div>
<div class='phone'><div class='head'><img class='av' src='avatar-gc.png'>
 <div class='st'><div><b>12</b><span>posts</span></div><div><b>0</b><span>seguidores</span></div><div><b>11</b><span>seguindo</span></div></div></div>
 <div class='nm'>Gustavo Calado | Medicina</div><div class='cat'>Educação</div>
 <div class='bio'>UFRR, formatura em 2028<br>Saúde explicada com clareza e com fonte<br>Mitos tirados a limpo</div>
 <div class='grid'>{cells}</div></div></div>"""

# ---- antes e depois do slide das faixas
SL = P.FONTS + f"""
body{{width:1080px;height:1350px;overflow:hidden;position:relative;font-family:'Sans';background:var(--cream);color:var(--g)}}
body::after{{content:'';position:absolute;inset:0;background:url("{P.GRAIN}");opacity:.07;mix-blend-mode:overlay;pointer-events:none}}
.serie{{position:absolute;left:96px;top:84px;font:italic 400 36px/1 'Serif'}}
h2{{position:absolute;left:96px;right:96px;top:176px;font:400 112px/.96 'Serif';letter-spacing:-.022em}}
ul{{position:absolute;left:96px;right:96px;top:470px;list-style:none;margin:0;padding:0}}
li{{display:grid;grid-template-columns:400px 1fr;column-gap:40px;align-items:center;padding:42px 0;border-top:2px solid rgba(21,61,44,.2)}}
li:last-child{{border-bottom:2px solid rgba(21,61,44,.2)}}
li b{{font:400 84px/.95 'Serif';letter-spacing:-.02em}} li b small{{display:block;font:400 30px/1.2 'Sans';letter-spacing:0;opacity:.7;margin-top:10px}}
li span{{font:400 42px/1.26 'Sans'}} li span i{{font-style:normal;font-weight:700}}
li.on b{{color:var(--pen)}}
.pg{{position:absolute;right:96px;bottom:74px;font:400 25px/1 'Sans';opacity:.72}}
"""
NOVO = ("<!doctype html><html><head><meta charset='utf-8'><style>" + SL + "</style></head><body>"
        "<div class='serie'>Entenda seu exame</div><h2>Onde o seu<br>número cai</h2><ul>"
        "<li><b>Abaixo<br>de 100</b><span><i>Normal.</i></span></li>"
        "<li class='on'><b>De 100<br>a 125</b><span><i>Sinal amarelo.</i> O açúcar no sangue está acima do normal.</span></li>"
        "<li><b>126<br>ou mais</b><span><i>Pode ser diabetes.</i> Repita o exame para confirmar.</span></li>"
        "</ul><div class='pg'>2/5</div></body></html>")

with sync_playwright() as pw:
    br = pw.chromium.launch()
    pg = br.new_page(viewport={"width": 1080, "height": 1350}, device_scale_factor=1)
    files = {}
    for code, (_, _, tiles) in OPCOES.items():
        files[code] = []
        for i, html in enumerate(tiles):
            name = f"_g{code}{i}.jpg"; fp = O / "_t.html"; fp.write_text(html, encoding="utf-8")
            pg.goto(fp.as_uri()); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(120)
            pg.screenshot(path=str(O / "_t.png")); Image.open(O / "_t.png").convert("RGB").save(O / name, quality=90); files[code].append(name)
    fp = O / "_t.html"; fp.write_text(NOVO, encoding="utf-8"); pg.goto(fp.as_uri()); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(120)
    pg.screenshot(path=str(O / "_t.png")); Image.open(O / "_t.png").convert("RGB").save(O / "_slide-novo.jpg", quality=92)
    html = "<!doctype html><html><head><meta charset='utf-8'><style>" + MOCK + "</style></head><body>" + "".join(phone(k, v[0], v[1], files[k]) for k, v in OPCOES.items()) + "</body></html>"
    fp = O / "_m.html"; fp.write_text(html, encoding="utf-8")
    p2 = br.new_page(viewport={"width": 1500, "height": 1000}, device_scale_factor=2.2)
    p2.goto(fp.as_uri()); p2.evaluate("document.fonts.ready"); p2.wait_for_timeout(400)
    p2.query_selector("body").screenshot(path=str(O / "_m.png")); br.close()
Image.open(O / "_m.png").convert("RGB").save(O / "grade-capas-opcoes.jpg", quality=90)
a = Image.open(MID / "2026-10-03-glicemia-de-jejum" / "02.jpg"); bb = Image.open(O / "_slide-novo.jpg"); g = 40
sh = Image.new("RGB", (1080 * 2 + g * 3, 1350 + g * 2 + 90), (232, 230, 226)); sh.paste(a, (g, g + 90)); sh.paste(bb, (g * 2 + 1080, g + 90))
from PIL import ImageDraw, ImageFont
d = ImageDraw.Draw(sh); ft = ImageFont.truetype(str(P.HERE.parent / "dir" / "fonts" / "Hanken.ttf"), 52)
d.text((g, 34), "Antes (publicado): cerca de 60 palavras", fill=(40, 40, 40), font=ft); d.text((g * 2 + 1080, 34), "Depois: cerca de 25 palavras, uma ideia", fill=(40, 40, 40), font=ft)
sh.save(O / "slide-antes-e-depois.jpg", quality=90)
for x in list(O.glob("_g*.jpg")) + [O / "_t.html", O / "_t.png", O / "_m.html", O / "_m.png"]:
    if x.name.startswith("_g"): continue
    x.unlink(missing_ok=True)
print("ok")
