#!/usr/bin/env python3
# D1 x D2 no tamanho real do celular (linha de destaques do perfil), com a foto F1.
from playwright.sync_api import sync_playwright
from PIL import Image
import perfil as P
O = P.OUT
NAMES = [("Comece", "comece"), ("Sobre", "sobre"), ("Fontes", "fontes"), ("Dúvidas", "duvidas"), ("Exames", "exames"), ("Mitos", "mitos")]
for n, k in NAMES:
    Image.open(O / f"destaque-{k}.png").convert("RGB").crop((0, 420, 1080, 1500)).resize((600, 600), Image.LANCZOS).save(O / f"_d2-{k}.jpg", quality=95)
def row(prefix, ext):
    return "".join(f"<div><i><img src='{prefix}{k}.{ext}'></i>{n}</div>" for n, k in NAMES[:4])
def big(prefix, ext):
    return "".join(f"<img src='{prefix}{k}.{ext}'>" for n, k in NAMES)
def col(code, desc, prefix, ext):
    return f"""<div class='col'><div class='cap'><b>{code}</b><span>{desc}</span></div>
<div class='phone'><div class='head'><img class='av' src='avatar-gc.png'>
 <div class='st'><div><b>6</b><span>posts</span></div><div><b>0</b><span>seguidores</span></div><div><b>0</b><span>seguindo</span></div></div></div>
 <div class='nm'>Gustavo Calado | Medicina</div><div class='cat'>Educação</div>
 <div class='bio'>UFRR, formatura em 2028<br>Saúde explicada com clareza e com fonte<br>Mitos tirados a limpo<br>Não substitui atendimento. Procure o médico de sua confiança</div>
 <div class='btns'><span class='bt blue'>Seguir</span><span class='bt'>Mensagem</span></div>
 <div class='hl'>{row(prefix, ext)}</div></div>
<div class='zoom'>{big(prefix, ext)}</div><small>Os seis, ampliados</small></div>"""
CSS = P.FONTS + """
body{background:#E9E6DF;padding:36px 40px 40px;display:flex;gap:44px;font-family:'UI';color:#111;width:max-content}
.cap{width:410px;margin-bottom:14px} .cap b{display:block;font:700 26px/1.2 'UI'} .cap span{display:block;font:400 15.5px/1.35 'UI';color:#4a4a4a;margin-top:4px}
.phone{width:410px;background:#fff;border-radius:28px;border:8px solid #151515;overflow:hidden;padding:10px 0 14px}
.head{display:flex;align-items:center;padding:12px 16px 0;gap:22px}
.av{width:86px;height:86px;border-radius:50%}
.st{flex:1;display:flex;justify-content:space-around;text-align:center} .st b{display:block;font:700 17px/1.25 'UI'} .st span{font:400 13.5px/1.2 'UI'}
.nm{padding:12px 16px 0;font:700 14px/1.3 'UI'} .cat{padding:1px 16px 0;font:400 14px/1.3 'UI';color:#737373} .bio{padding:1px 16px 0;font:400 14px/1.38 'UI'}
.btns{display:flex;gap:6px;padding:13px 16px 4px} .bt{flex:1;text-align:center;font:600 14px/1 'UI';padding:9px 0;border-radius:8px;background:#efefef} .bt.blue{background:#0095f6;color:#fff}
.hl{display:flex;gap:14px;padding:12px 16px 2px} .hl div{width:70px;text-align:center;font:400 12px/1.2 'UI'}
.hl i{display:block;width:68px;height:68px;border-radius:50%;border:1px solid #dbdbdb;padding:3px;margin:0 auto 5px} .hl img{width:100%;height:100%;border-radius:50%;display:block}
.zoom{width:410px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:22px} .zoom img{width:100%;border-radius:50%;display:block}
small{display:block;font:400 13.5px/1.2 'UI';color:#5a5a5a;margin-top:10px}
"""
html = (f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body>"
        + col("D1", "Ícone menor, com mais verde em volta.", "_d1-", "png")
        + col("D2", "Ícone maior, ocupa mais a bolinha.", "_d2-", "jpg") + "</body></html>")
f = O / "_d1d2.html"; f.write_text(html, encoding="utf-8")
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page(viewport={"width": 1000, "height": 900}, device_scale_factor=2.5)
    pg.goto(f.as_uri()); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(300)
    pg.query_selector("body").screenshot(path=str(O / "destaques-D1-x-D2.png")); b.close()
f.unlink()
im = Image.open(O / "destaques-D1-x-D2.png").convert("RGB"); im.save(O / "destaques-D1-x-D2.jpg", quality=90); (O / "destaques-D1-x-D2.png").unlink(); print(im.size)
