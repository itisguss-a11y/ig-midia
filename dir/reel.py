#!/usr/bin/env python3
# Reel de demonstração (sem rosto, sem material): texto animado em HTML, quadro a quadro, montado com ffmpeg.
import subprocess, shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
F = (HERE / "fonts").as_uri()
FPS, DUR = 30, 15.0
GREEN = "#17402C"

LINE = ("M -40 1420 C 250 1420, 520 1432, 668 1404 C 800 1378, 944 1322, 944 1228 C 944 1160, 880 1144, 846 1158 C 818 1170, 806 1194, 800 1222 "
        "C 794 1194, 780 1168, 750 1158 C 706 1144, 652 1172, 652 1236 C 652 1322, 748 1378, 806 1442 C 850 1488, 960 1442, 1120 1420")

def scene(i, t0, t1, inner):
    return f"<section style='animation:sin .5s {t0}s both, sout .4s {t1-.4}s forwards'>{inner}</section>"
def ln(txt, d, cls=""):
    return f"<div class='ln {cls}' style='animation-delay:{d}s'>{txt}</div>"

HTML = f"""<!doctype html><html><head><meta charset='utf-8'><style>
@font-face{{font-family:'Serif';src:url('{F}/ISerif.ttf');font-style:normal}}
@font-face{{font-family:'Serif';src:url('{F}/ISerif-Italic.ttf');font-style:italic}}
@font-face{{font-family:'Sans';src:url('{F}/ISans.ttf');font-weight:400 700}}
*{{box-sizing:border-box}} html,body{{margin:0}}
body{{width:1080px;height:1920px;overflow:hidden;position:relative;background:{GREEN};color:#F4EDDF;font-family:'Sans'}}
section{{position:absolute;left:96px;right:96px;top:400px;opacity:0}}
@keyframes sin{{from{{opacity:0}}to{{opacity:1}}}} @keyframes sout{{from{{opacity:1}}to{{opacity:0}}}}
.ln{{opacity:0;animation:up .7s cubic-bezier(.2,.7,.2,1) both}}
@keyframes up{{from{{opacity:0;transform:translateY(46px)}}to{{opacity:1;transform:none}}}}
.h{{font:400 214px/.9 'Serif';letter-spacing:-.028em}} .i{{font-style:italic}}
.m{{font:400 132px/.98 'Serif';letter-spacing:-.02em}}
.x{{font:italic 400 330px/.86 'Serif';letter-spacing:-.035em;margin:20px 0 10px -14px}}
.s{{font:400 56px/1.25 'Sans';opacity:.88;margin-top:44px}}
.who{{position:absolute;left:96px;top:270px;font:500 34px/1 'Sans';opacity:.8}}
.fonte{{font:400 30px/1.3 'Sans';margin-top:70px}}
svg{{position:absolute;left:0;top:0}}
path{{stroke-dasharray:1;stroke-dashoffset:1;animation:draw 2.2s .5s cubic-bezier(.5,0,.2,1) forwards}}
@keyframes draw{{to{{stroke-dashoffset:0}}}}
</style></head><body>
<div class='who' style="font:italic 400 46px/1 'Serif';opacity:.92">Entenda seu exame</div>
<svg width='1080' height='1920' viewBox='0 0 1080 1920' fill='none'><path pathLength='1' d='{LINE}' stroke='#D0AB62' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/></svg>
{scene(1, 0, 3.3, ln("Sua", .1, "h") + ln("pressão é", .28, "h") + ln("12 por 8?", .46, "h i"))}
{scene(2, 3.3, 7.2, ln("Desde 2025, quem mede", 3.4, "s") + ln("12 por 8", 3.7, "x") + ln("está em<br>pré-hipertensão.", 4.5, "m"))}
{scene(3, 7.2, 11.0, ln("Não é doença.", 7.3, "h") + ln("É um aviso: a hora de rever os hábitos é agora.", 8.2, "s"))}
{scene(4, 11.0, 99, ln("Meça uma vez por ano, mesmo sem sentir nada.", 11.1, "m") + ln("Envie para quem ainda acha que 12 por 8 é perfeito.", 12.3, "s") + ln("Fonte: Diretriz Brasileira de Hipertensão Arterial 2025.", 12.9, "fonte"))}
</body></html>"""

frames = HERE / "_frames"; shutil.rmtree(frames, ignore_errors=True); frames.mkdir()
f = HERE / "_reel.html"; f.write_text(HTML, encoding="utf-8")
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
    pg.goto(f.as_uri()); pg.evaluate("document.fonts.ready")
    for n in range(int(FPS * DUR)):
        pg.evaluate("ms => document.getAnimations().forEach(a => { a.pause(); a.currentTime = ms; })", n * 1000 / FPS)
        pg.screenshot(path=str(frames / f"{n:04d}.jpg"), type="jpeg", quality=92)
    b.close()
f.unlink()
out = HERE / "reel-demo.mp4"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", str(frames / "%04d.jpg"),
                "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-shortest",
                "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-c:a", "aac", "-movflags", "+faststart", str(out)], check=True)
from PIL import Image
sh = Image.new("RGB", (540 * 4 + 20 * 5, 960 + 40), (232, 230, 226))
for i, n in enumerate((80, 190, 300, 430)):
    sh.paste(Image.open(frames / f"{n:04d}.jpg").resize((540, 960), Image.LANCZOS), (20 + i * 560, 20))
sh.save(HERE / "_reel-quadros.jpg", quality=88)
shutil.rmtree(frames)
print("ok", out.stat().st_size)
