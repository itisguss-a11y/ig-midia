#!/usr/bin/env python3
# Rodada 3: conceito com mais atração visual, na paleta pessoal dele (cores profundas).
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image

HERE = Path(__file__).resolve().parent
F = (HERE / "fonts").as_uri()

GRAIN = ("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>"
         "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/>"
         "<feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0'/></filter>"
         "<rect width='100%' height='100%' filter='url(%23n)'/></svg>")

CSS = f"""
@font-face{{font-family:'Serif';src:url('{F}/ISerif.ttf');font-style:normal}}
@font-face{{font-family:'Serif';src:url('{F}/ISerif-Italic.ttf');font-style:italic}}
@font-face{{font-family:'Sans';src:url('{F}/ISans.ttf');font-weight:400 700;font-stretch:75% 100%}}
*{{box-sizing:border-box}} html,body{{margin:0}}
body{{width:1080px;height:1350px;overflow:hidden;position:relative;font-family:'Sans',sans-serif;-webkit-font-smoothing:antialiased}}
body::after{{content:'';position:absolute;inset:0;background:url("{GRAIN}");opacity:var(--grain,.10);mix-blend-mode:overlay;pointer-events:none}}
.dark{{background:radial-gradient(120% 90% at 85% 8%, var(--c2) 0%, var(--c1) 58%, var(--c0) 100%);color:var(--cream)}}
.light{{background:var(--cream);color:var(--c1);--grain:.16}}
.mast{{position:absolute;left:80px;right:80px;top:70px;display:flex;align-items:center;justify-content:space-between}}
.who{{display:flex;align-items:center;gap:20px}}
.mono{{width:76px;height:76px;border-radius:50%;border:2px solid var(--gold);display:grid;place-items:center;font:400 34px/1 'Serif';letter-spacing:.02em;color:inherit}}
.who b{{display:block;font:600 28px/1.2 'Sans'}} .who span{{display:block;font:400 24px/1.2 'Sans';opacity:.72}}
.pill{{font:500 25px/1 'Sans';padding:15px 26px;border-radius:99px;border:1.5px solid currentColor;opacity:.9}}
.num{{position:absolute;right:80px;bottom:64px;font:400 26px/1 'Sans';opacity:.6}}

/* capa */
.arch{{position:absolute;right:80px;top:220px;width:500px;height:500px;border-radius:250px 250px 26px 26px;padding-top:40px;background:var(--cream);
  display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--c1);box-shadow:0 30px 60px rgba(0,0,0,.28)}}
.arch .n{{font:italic 400 218px/.9 'Serif';letter-spacing:-.03em}}
.arch .u{{font:500 26px/1 'Sans';letter-spacing:.06em;margin-top:26px;opacity:.7}}
.arch .line{{width:150px;height:2px;background:var(--gold);margin-top:30px}}
.seal{{position:absolute;right:486px;top:182px;z-index:2;width:206px;height:206px;border-radius:50%;background:var(--gold);color:var(--c0);
  display:grid;place-items:center;text-align:center;transform:rotate(-11deg);box-shadow:0 14px 30px rgba(0,0,0,.3)}}
.seal i{{position:absolute;inset:10px;border:1.5px dashed rgba(0,0,0,.4);border-radius:50%}}
.seal b{{display:block;font:italic 400 60px/.9 'Serif'}} .seal span{{display:block;font:600 21px/1.2 'Sans';letter-spacing:.05em;margin-bottom:6px}}
.hook{{position:absolute;left:80px;right:80px;bottom:196px}}
.hook h1{{margin:0;font:400 122px/.96 'Serif';letter-spacing:-.018em}}
.hook h1 em{{font-style:italic;color:var(--gold)}}
.hook p{{margin:26px 0 0;font:400 42px/1.3 'Sans';opacity:.84}}
.cta{{position:absolute;left:80px;bottom:64px;display:flex;align-items:center;gap:18px;font:600 28px/1 'Sans';
  background:var(--cream);color:var(--c1);padding:20px 30px;border-radius:99px}}

/* slide de dados */
.wrap{{position:absolute;left:80px;right:80px;top:210px;bottom:130px;display:flex;flex-direction:column}}
h2{{margin:0;font:400 92px/1 'Serif';letter-spacing:-.016em}} h2 em{{font-style:italic;color:var(--clay)}}
.lead{{font:400 38px/1.34 'Sans';margin:26px 0 0;opacity:.82}}
.bar{{display:grid;grid-template-columns:1fr 1.15fr 1fr;height:104px;border-radius:52px;overflow:hidden;margin-top:70px}}
.bar div{{display:grid;place-items:center;font:600 30px/1 'Sans';color:#fff;letter-spacing:.01em}}
.ticks{{position:relative;height:74px}}
.ticks span{{position:absolute;top:12px;transform:translateX(-50%);font:italic 400 44px/1 'Serif'}}
.ticks span::before{{content:'';position:absolute;left:50%;top:-12px;width:2px;height:12px;background:currentColor}}
.cols{{display:grid;grid-template-columns:1fr 1.15fr 1fr;gap:0;margin-top:40px}}
.cols div{{padding:0 22px 0 22px;border-left:2px solid rgba(18,53,40,.18)}} .cols div:first-child{{padding-left:0;border-left:0}} .cols b{{display:block;font:italic 400 52px/1.05 'Serif';min-height:112px}} .cols span{{display:block;font:400 27px/1.3 'Sans';opacity:.7;margin-top:10px}} .cols p{{margin:34px 0 0;padding-top:28px;border-top:2px solid var(--gold);font:500 31px/1.3 'Sans'}} .cols p small{{display:block;font:600 21px/1 'Sans';letter-spacing:.08em;opacity:.6;margin-bottom:12px}}
.key{{margin-top:auto;border-radius:30px;background:var(--c1);color:var(--cream);padding:38px 42px;font:400 40px/1.28 'Sans'}}
.key em{{font:italic 400 46px/1 'Serif';color:var(--gold)}}

/* resumo para salvar */
.sum h2{{font-size:104px}} .sum h2 em{{color:var(--gold)}}
.chk{{list-style:none;margin:56px 0 0;padding:0;display:flex;flex-direction:column;gap:34px}}
.chk li{{display:grid;grid-template-columns:64px 1fr;gap:24px;align-items:start;font:400 41px/1.26 'Sans'}}
.chk li i{{width:64px;height:64px;border-radius:50%;border:2px solid var(--gold);display:grid;place-items:center;font:italic 400 38px/1 'Serif';color:var(--gold)}}
.send{{margin-top:auto;margin-bottom:46px;font:italic 400 62px/1.04 'Serif';color:var(--gold)}}
.src{{position:absolute;left:80px;right:220px;bottom:58px;font:400 21px/1.35 'Sans';opacity:.62}}
"""

WAYS = {
    "verde": "--c0:#0B2219;--c1:#123528;--c2:#27634B;--cream:#F4EDDF;--gold:#D0AB62;--clay:#A9573F;",
    "petroleo": "--c0:#08222B;--c1:#0E3642;--c2:#1F6474;--cream:#F4EDDF;--gold:#D0AB62;--clay:#A9573F;",
    "vinho": "--c0:#260A13;--c1:#431423;--c2:#7A2A3F;--cream:#F4EDDF;--gold:#D9B37A;--clay:#A9573F;",
}

MAST = ("<div class='mast'><div class='who'><div class='mono'>GC</div><div><b>Gustavo Calado</b><span>acadêmico de medicina</span></div></div>"
        "<div class='pill'>Entenda seu exame</div></div>")
ARROW = "<svg width='46' height='18' viewBox='0 0 46 18' fill='none'><path d='M1 9H43M43 9L35 1.5M43 9L35 16.5' stroke='currentColor' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'/></svg>"

COVER = (MAST +
    "<div class='seal'><i></i><div><span>NOVA DIRETRIZ</span><b>2025</b></div></div>"
    "<div class='arch'><div class='n'>12×8</div><div class='line'></div><div class='u'>120/80 mmHg</div></div>"
    "<div class='hook'><h1>Sua pressão é<br><em>12 por 8?</em></h1><p>Ela acabou de ganhar outro nome.<br>E não é “normal”.</p></div>"
    f"<div class='cta'>Arraste para entender {ARROW}</div><div class='num'>1/7</div>")

DATA = (MAST +
    "<div class='wrap'><h2>Onde a sua pressão <em>se encaixa</em></h2>"
    "<div class='bar'><div style='background:#5E8F74'>Normal</div><div style='background:#CFA047'>Pré-hipertensão</div><div style='background:#B25A41'>Hipertensão</div></div>"
    ""
    "<div class='cols'><div><b>Abaixo de<br>12 por 8</b><span>menos de 120/80</span><p><small>O QUE FAZER</small>Manter os hábitos e medir uma vez por ano.</p></div><div><b>De 12 por 8 até<br>quase 14 por 9</b><span>120–139 / 80–89</span><p><small>O QUE FAZER</small>Rever hábitos agora e acompanhar de perto.</p></div><div><b>14 por 9<br>ou mais</b><span>140/90 ou mais</span><p><small>O QUE FAZER</small>Confirmar em consulta. Não se trate por conta própria.</p></div></div>"
    "<div class='key'><em>Na prática:</em> se um dos dois números passar da faixa, vale a faixa mais alta.</div></div>"
    "<div class='num'>3/7</div>")

SUM = (MAST +
    "<div class='wrap sum'><h2>Para <em>salvar</em></h2>"
    "<ul class='chk'><li><i>1</i><span>12 por 8 agora é <b>pré-hipertensão</b>. Não é doença: é um aviso.</span></li>"
    "<li><i>2</i><span>O cuidado começa pelos hábitos: peso, sal, movimento, sono.</span></li>"
    "<li><i>3</i><span>Hipertensão só se confirma com 14 por 9 ou mais em <b>duas ocasiões</b>.</span></li>"
    "<li><i>4</i><span>Meça a pressão <b>uma vez por ano</b>,<br>mesmo sem sentir nada.</span></li></ul>"
    "<div class='send'>Envie para quem ainda acha<br>que 12 por 8 é perfeito.</div></div>"
    "<div class='src'>Fontes: Diretriz Brasileira de Hipertensão Arterial 2025 (SBC, SBH, SBN); Ministério da Saúde. Conteúdo educativo, não substitui consulta.</div>"
    "<div class='num'>7/7</div>")

def page(cls, way, body):
    return f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body class='{cls}' style=\"{WAYS[way]}\">{body}</body></html>"

jobs = [("capa-verde", "dark", "verde", COVER), ("dados-verde", "light", "verde", DATA), ("resumo-verde", "dark", "verde", SUM),
        ("capa-petroleo", "dark", "petroleo", COVER), ("capa-vinho", "dark", "vinho", COVER)]
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page(viewport={"width": 1080, "height": 1350}, device_scale_factor=1)
    for name, cls, way, body in jobs:
        f = HERE / f"_{name}.html"; f.write_text(page(cls, way, body), encoding="utf-8")
        pg.goto(f.as_uri()); pg.evaluate("document.fonts.ready")
        pg.screenshot(path=str(HERE / f"{name}.png")); f.unlink()
        Image.open(HERE / f"{name}.png").convert("RGB").save(HERE / f"{name}.jpg", "JPEG", quality=92); (HERE / f"{name}.png").unlink()
    b.close()
g = 30
tri = Image.new("RGB", (1080 * 3 + g * 4, 1350 + g * 2), (232, 230, 226))
for i, n in enumerate(["capa-verde", "capa-petroleo", "capa-vinho"]):
    tri.paste(Image.open(HERE / f"{n}.jpg"), (g + i * (1080 + g), g))
tri.resize((tri.width // 2, tri.height // 2), Image.LANCZOS).save(HERE / "tres-tons.jpg", "JPEG", quality=90)
car = Image.new("RGB", (1080 * 3 + g * 4, 1350 + g * 2), (232, 230, 226))
for i, n in enumerate(["capa-verde", "dados-verde", "resumo-verde"]):
    car.paste(Image.open(HERE / f"{n}.jpg"), (g + i * (1080 + g), g))
car.resize((car.width // 2, car.height // 2), Image.LANCZOS).save(HERE / "carrossel-verde.jpg", "JPEG", quality=90)
print("ok")
