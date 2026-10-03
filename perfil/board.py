#!/usr/bin/env python3
# Prancha das peças do perfil: foto, destaques, cores e letras.
from playwright.sync_api import sync_playwright
from PIL import Image
import perfil as P
O = P.OUT
hl = [("Comece", "comece", ""), ("Sobre", "sobre", ""), ("Fontes", "fontes", ""), ("Dúvidas", "duvidas", ""), ("Exames", "exames", "depois"), ("Mitos", "mitos", "depois")]
HL = "".join(f"<div class='h'><img src='_hl-{f}.jpg'><b>{n}</b><span>{x}</span></div>" for n, f, x in hl)
SW = "".join(f"<div class='sw'><i style='background:{c};{b}'></i><b>{n}</b><span>{c}</span></div>" for n, c, b in
             [("Verde-floresta", P.G, ""), ("Creme", P.CREAM, "border:1px solid #d6d0c2"), ("Dourado", P.GOLD, ""), ("Tinta", P.INK, "")])
CSS = P.FONTS + """
body{width:1800px;background:#E9E6DF;padding:56px 60px 60px;font-family:'UI';color:#151515;display:grid;grid-template-columns:430px 560px 1fr;column-gap:70px}
h3{margin:0 0 26px;font:700 24px/1.2 'UI'}
.av{width:360px;height:360px;border-radius:50%;display:block}
.sizes{display:flex;align-items:flex-end;gap:34px;margin-top:34px}
.sizes div{text-align:center;font:400 15px/1.3 'UI';color:#4a4a4a}
.sizes img{border-radius:50%;display:block;margin:0 auto 8px}
.hs{display:grid;grid-template-columns:repeat(3,1fr);gap:30px 26px}
.h{text-align:center} .h img{width:150px;height:150px;border-radius:50%;display:block;margin:0 auto 10px}
.h b{display:block;font:600 18px/1.2 'UI'} .h span{display:block;font:400 14px/1.2 'UI';color:#6a6a6a;min-height:17px}
.sws{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.sw i{display:block;height:120px;border-radius:10px;margin-bottom:10px}
.sw b{display:block;font:600 16px/1.2 'UI'} .sw span{font:400 14px/1.3 'UI';color:#4a4a4a}
.ty{margin-top:44px}
.ty .s{font:400 76px/1 'Serif';letter-spacing:-.02em;color:#17402C} .ty .s i{font-style:italic}
.ty .n{font:400 15px/1.3 'UI';color:#4a4a4a;margin:8px 0 26px}
.ty .t{font:400 27px/1.35 'Sans';color:#17402C}
"""
html = f"""<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body>
<section><h3>Foto de perfil</h3><img class='av' src='avatar-gc-forte.png'>
 <div class='sizes'><div><img src='avatar-gc-forte.png' width='110' height='110'>no perfil</div><div><img src='avatar-gc-forte.png' width='56' height='56'>nos stories</div><div><img src='avatar-gc-forte.png' width='32' height='32'>nos comentários</div></div></section>
<section><h3>Capas dos destaques</h3><div class='hs'>{HL}</div></section>
<section><h3>Cores e letras</h3><div class='sws'>{SW}</div>
 <div class='ty'><div class='s'>Sua pressão é <i>12 por 8?</i></div><div class='n'>Títulos: Instrument Serif, normal e itálico</div>
 <div class='t'>Ela acabou de ganhar outro nome. E não é “normal”.</div><div class='n'>Texto: Instrument Sans</div></div></section>
</body></html>"""
f = O / "_board.html"; f.write_text(html, encoding="utf-8")
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page(viewport={"width": 1800, "height": 700}, device_scale_factor=1.5)
    pg.goto(f.as_uri()); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(300)
    pg.query_selector("body").screenshot(path=str(O / "perfil-pecas.png")); b.close()
f.unlink()
im = Image.open(O / "perfil-pecas.png").convert("RGB"); im.save(O / "perfil-pecas.jpg", quality=90); (O / "perfil-pecas.png").unlink(); print(im.size)
