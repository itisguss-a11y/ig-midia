#!/usr/bin/env python3
# Simulação do perfil (como a visitante vê) e prancha de peças.
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
import perfil as P

O = P.OUT
def circle_png(src, dst, box=None):
    im = Image.open(O / src).convert("RGB")
    if box: im = im.crop(box)
    im.resize((600, 600), Image.LANCZOS).save(O / dst, quality=95)
for n in ("comece", "sobre", "fontes", "duvidas", "exames", "mitos"):
    circle_png(f"destaquepen-{n}.png", f"_hl-{n}.jpg", (0, 420, 1080, 1500))

PIN = "<svg width='15' height='15' viewBox='0 0 24 24' fill='#fff'><path d='M15 2l7 7-3 1-4 4 1 5-2 2-5-5-6 6-1-1 6-6-5-5 2-2 5 1 4-4z'/></svg>"
REEL = "<svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='#fff' stroke-width='2.2'><rect x='3' y='3' width='18' height='18' rx='5'/><path d='M3 8.5h18M8.5 3l3 5.5M14 3l3 5.5'/><path d='M10 12.5v5l4.5-2.5z' fill='#fff' stroke='none'/></svg>"
TILES = [("01-comece", PIN), ("02-pressao", ""), ("03-glicemia", ""), ("04-antibiotico", ""), ("05-avc", REEL), ("06-dengue", ""),
         ("07-hemograma", ""), ("08-coracao", ""), ("09-sereno", REEL)]
HL = [("Comece", "comece"), ("Sobre", "sobre"), ("Fontes", "fontes"), ("Dúvidas", "duvidas")]

def phone(avatar, nome, cat, bio, titulo, legenda):
    grid = "".join(f"<div><img src='tile-{t}.jpg'>{ic}</div>" for t, ic in TILES)
    hl = "".join(f"<div><i><img src='_hl-{f}.jpg'></i>{n}</div>" for n, f in HL)
    return f"""<div class='col'><div class='cap'><b>{titulo}</b><span>{legenda}</span></div>
<div class='phone'>
 <div class='bar'><span>dr.gustavocalado</span><svg width='12' height='12' viewBox='0 0 12 12' fill='none' stroke='#111' stroke-width='1.8'><path d='M2 4l4 4 4-4'/></svg><em></em>
  <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='#111' stroke-width='1.9' stroke-linecap='round'><path d='M4 7h16M4 12h16M4 17h16'/></svg></div>
 <div class='head'><img class='av' src='{avatar}'>
  <div class='st'><div><b>9</b><span>posts</span></div><div><b>0</b><span>seguidores</span></div><div><b>0</b><span>seguindo</span></div></div></div>
 <div class='nm'>{nome}</div><div class='cat'>{cat}</div><div class='bio'>{bio}</div>
 <div class='btns'><span class='bt blue'>Seguir</span><span class='bt'>Mensagem</span></div>
 <div class='hl'>{hl}</div>
 <div class='tabs'><div class='on'><svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='#111' stroke-width='1.8'><rect x='3' y='3' width='18' height='18' rx='2'/><path d='M9 3v18M15 3v18M3 9h18M3 15h18'/></svg></div>
  <div><svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='#8e8e8e' stroke-width='1.8'><rect x='3' y='3' width='18' height='18' rx='5'/><path d='M3 8.5h18M8.5 3l3 5.5M14 3l3 5.5'/><path d='M10 12.5v5l4.5-2.5z'/></svg></div>
  <div><svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='#8e8e8e' stroke-width='1.8'><path d='M4 21V8l8-5 8 5v13z'/><circle cx='12' cy='12' r='2.6'/><path d='M7.5 21c.6-3 2.3-4.4 4.5-4.4s3.9 1.4 4.5 4.4'/></svg></div></div>
 <div class='grid'>{grid}</div>
</div></div>"""

CSS = P.FONTS + """
body{background:#E9E6DF;padding:36px 40px 40px;display:flex;gap:44px;font-family:'UI';color:#111;width:max-content}
.cap{width:410px;margin-bottom:16px} .cap b{display:block;font:700 22px/1.2 'UI'} .cap span{display:block;font:400 15.5px/1.35 'UI';color:#4a4a4a;margin-top:4px;min-height:42px}
.phone{width:410px;background:#fff;border-radius:46px;border:10px solid #151515;overflow:hidden;padding-top:16px}
.bar{display:flex;align-items:center;gap:6px;padding:10px 16px 4px;font:700 20px/1 'UI'} .bar em{flex:1}
.head{display:flex;align-items:center;padding:12px 16px 0;gap:22px}
.av{width:86px;height:86px;border-radius:50%;object-fit:cover}
.st{flex:1;display:flex;justify-content:space-around;text-align:center}
.st b{display:block;font:700 17px/1.25 'UI'} .st span{font:400 13.5px/1.2 'UI'}
.nm{padding:12px 16px 0;font:700 14px/1.3 'UI'}
.cat{padding:1px 16px 0;font:400 14px/1.3 'UI';color:#737373}
.bio{padding:1px 16px 0;font:400 14px/1.38 'UI'}
.btns{display:flex;gap:6px;padding:13px 16px 4px}
.bt{flex:1;text-align:center;font:600 14px/1 'UI';padding:9px 0;border-radius:8px;background:#efefef}
.bt.blue{background:#0095f6;color:#fff}
.hl{display:flex;gap:14px;padding:12px 16px 12px}
.hl div{width:70px;text-align:center;font:400 12px/1.2 'UI'}
.hl i{display:block;width:68px;height:68px;border-radius:50%;border:1px solid #dbdbdb;padding:3px;margin:0 auto 5px}
.hl img{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block}
.tabs{display:flex;border-top:1px solid #efefef}
.tabs div{flex:1;display:grid;place-items:center;height:44px} .tabs div.on{border-bottom:1.5px solid #111}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px}
.grid div{position:relative;aspect-ratio:3/4;overflow:hidden}
.grid img{width:100%;height:100%;object-fit:cover;display:block}
.grid svg{position:absolute;right:6px;top:6px;filter:drop-shadow(0 0 2px rgba(0,0,0,.55))}
"""
BIO = "Saúde explicada com calma e com fonte<br>Exames, sintomas e mitos, sem alarme<br>Educativo. Não substitui consulta"
NOME = "Gustavo Calado | Estudante de Medicina"
html = (f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body>"
        + phone("avatar-gc-forte.png", NOME, "Educação", BIO, "Agora: monograma", "Perfil pronto para o lançamento, sem depender de foto.")
        + phone("avatar-foto-simulacao.jpg", NOME, "Educação", BIO, "Depois: sua foto", "Simulação com a selfie que eu tenho, só para ver o encaixe. A foto de verdade segue o guia.")
        + "</body></html>")
f = O / "_mock.html"; f.write_text(html, encoding="utf-8")
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page(viewport={"width": 1000, "height": 900}, device_scale_factor=2.5)
    pg.goto(f.as_uri()); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(300)
    el = pg.query_selector("body"); el.screenshot(path=str(O / "perfil-simulacao.png"))
    b.close()
f.unlink()
im = Image.open(O / "perfil-simulacao.png").convert("RGB"); im.save(O / "perfil-simulacao.jpg", quality=90); (O / "perfil-simulacao.png").unlink()
print(im.size)
