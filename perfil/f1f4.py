#!/usr/bin/env python3
# F1 x F4 onde a foto aparece pequena: ao lado de um comentário, no tamanho real do celular.
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
import perfil as P
O = P.OUT
def row(av, code):
    return f"""<div class='blk'><div class='code'>{code}</div>
<div class='c'><img src='{av}'><div><p><b>dr.gustavocalado</b> Boa pergunta. A fonte está no último slide do post.</p><small>2 h &nbsp; Responder</small></div></div>
<div class='c'><img src='{av}'><div><p><b>dr.gustavocalado</b> Isso mesmo: vale repetir o exame para confirmar.</p><small>1 h &nbsp; Responder</small></div></div></div>"""
CSS = P.FONTS + """
body{background:#fff;margin:0;padding:22px 20px;width:390px;font-family:'UI';color:#111}
.blk{margin-bottom:22px} .code{font:700 20px/1 'UI';margin-bottom:12px}
.c{display:flex;gap:12px;margin-bottom:14px} .c img{width:32px;height:32px;border-radius:50%;flex:none}
.c p{margin:0;font:400 14px/1.35 'UI'} .c b{font-weight:700} .c small{font:400 12px/1.8 'UI';color:#737373}
"""
html = f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body>{row('avatar-gc.png','F1')}{row('avatar-gc-forte.png','F4')}</body></html>"
f = O / "_f1f4.html"; f.write_text(html, encoding="utf-8")
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page(viewport={"width": 430, "height": 300}, device_scale_factor=3)
    pg.goto(f.as_uri()); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(300)
    pg.query_selector("body").screenshot(path=str(O / "_f1f4.png")); b.close()
f.unlink()
phone = Image.open(O / "_f1f4.png").convert("RGB")
# ampliação fiel (sem suavizar) da foto como o celular desenha: 32 pontos = 96 pixels
def real(av):
    im = Image.open(O / av).convert("RGB").resize((96, 96), Image.LANCZOS)
    m = Image.new("L", (96 * 4, 96 * 4), 0); ImageDraw.Draw(m).ellipse((0, 0, 383, 383), fill=255)
    big = im.resize((384, 384), Image.NEAREST); out = Image.new("RGB", (384, 384), (255, 255, 255)); out.paste(big, (0, 0), m); return out
W = phone.width + 60 + 384 + 60
sh = Image.new("RGB", (W, max(phone.height, 2 * 384 + 200) + 40), (255, 255, 255))
sh.paste(phone, (20, 20))
from PIL import ImageFont
fnt = ImageFont.truetype(str(P.HERE.parent / "dir" / "fonts" / "Hanken.ttf"), 30)
d = ImageDraw.Draw(sh); x = phone.width + 60
d.text((x, 30), "A mesma foto, ampliada 4 vezes", font=fnt, fill=(60, 60, 60))
sh.paste(real("avatar-gc.png"), (x, 90)); d.text((x, 90 + 392), "F1", font=fnt, fill=(20, 20, 20))
sh.paste(real("avatar-gc-forte.png"), (x, 90 + 450)); d.text((x, 90 + 450 + 392), "F4", font=fnt, fill=(20, 20, 20))
sh.save(O / "foto-F1-x-F4-nos-comentarios.jpg", quality=92); print(sh.size)
