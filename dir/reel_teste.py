#!/usr/bin/env python3
# Reel de teste (03/10/2026): "Antibiótico cura gripe?" Texto animado em HTML, quadro a quadro, montado com ffmpeg.
# Sem voz. Trilha: fundo musical simples e original, gerado aqui mesmo (acordes longos e suaves).
import subprocess, shutil, wave
from pathlib import Path
import numpy as np
from playwright.sync_api import sync_playwright
from PIL import Image

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "midia" / "2026-10-03-antibiotico-gripe"; OUT.mkdir(parents=True, exist_ok=True)
F = (HERE / "fonts").as_uri()
FPS, DUR = 30, 41.0   # esta versão (41 s) ficou lenta demais para ele; nos próximos: 3 a 4 s por cena de uma frase, menos se o texto for simples
GREEN = "#17402C"

LINE = ("M -40 1470 C 200 1448, 380 1500, 560 1470 C 700 1446, 800 1430, 860 1380 C 912 1336, 882 1268, 822 1284 "
        "C 760 1300, 780 1400, 862 1442 C 940 1482, 1020 1474, 1120 1466")

def scene(t0, t1, inner):
    return f"<section style='animation:sin .5s {t0}s both, sout .4s {t1-.4}s forwards'>{inner}</section>"
def ln(txt, d, cls=""):
    return f"<div class='ln {cls}' style='animation-delay:{d}s'>{txt}</div>"

HTML = f"""<!doctype html><html><head><meta charset='utf-8'><style>
@font-face{{font-family:'Serif';src:url('{F}/ISerif.ttf');font-style:normal}}
@font-face{{font-family:'Serif';src:url('{F}/ISerif-Italic.ttf');font-style:italic}}
@font-face{{font-family:'Sans';src:url('{F}/ISans.ttf');font-weight:400 700}}
*{{box-sizing:border-box}} html,body{{margin:0}}
body{{width:1080px;height:1920px;overflow:hidden;position:relative;background:{GREEN};color:#F4EDDF;font-family:'Sans'}}
section{{position:absolute;left:96px;right:96px;top:420px;opacity:0}}
@keyframes sin{{from{{opacity:0}}to{{opacity:1}}}} @keyframes sout{{from{{opacity:1}}to{{opacity:0}}}}
.ln{{opacity:0;animation:up .7s cubic-bezier(.2,.7,.2,1) both}}
@keyframes up{{from{{opacity:0;transform:translateY(46px)}}to{{opacity:1;transform:none}}}}
.h{{font:400 196px/.92 'Serif';letter-spacing:-.028em}} .i{{font-style:italic}}
.m{{font:400 124px/1 'Serif';letter-spacing:-.02em}}
.x{{font:italic 400 380px/.86 'Serif';letter-spacing:-.035em;margin:10px 0 30px -14px;color:#D0AB62}}
.s{{font:400 56px/1.25 'Sans';opacity:.9;margin-top:44px}}
.who{{position:absolute;left:96px;top:290px;font:italic 400 46px/1 'Serif';opacity:.92}}
.fonte{{font:400 30px/1.3 'Sans';margin-top:64px;opacity:.75}}
svg{{position:absolute;left:0;top:0}}
path{{stroke-dasharray:1;stroke-dashoffset:1;animation:draw 2.2s .5s cubic-bezier(.5,0,.2,1) forwards}}
@keyframes draw{{to{{stroke-dashoffset:0}}}}
</style></head><body>
<div class='who'>Mito ou verdade</div>
<svg width='1080' height='1920' viewBox='0 0 1080 1920' fill='none'><path pathLength='1' d='{LINE}' stroke='#D0AB62' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/></svg>
{scene(0, 3.6, ln("Antibiótico", .1, "h") + ln("cura", .28, "h") + ln("gripe?", .46, "h i"))}
{scene(3.6, 8.9, ln("Resposta curta:", 3.7, "s") + ln("Mito.", 4.0, "x") + ln("Gripe é vírus.", 4.8, "m"))}
{scene(8.9, 13.4, ln("Antibiótico só age contra bactéria.", 9.0, "m"))}
{scene(13.4, 18.4, ln("Em gripe e resfriado, ele não faz efeito.", 13.5, "m"))}
{scene(18.4, 24.4, ln("Usar sem precisar deixa as bactérias mais resistentes.", 18.5, "m"))}
{scene(24.4, 30.6, ln("E o remédio pode falhar quando você precisar de verdade.", 24.5, "m"))}
{scene(30.6, 99, ln("Antibiótico, só com receita.", 30.7, "m") + ln("Envie para quem pede antibiótico a cada resfriado.", 31.9, "s") + ln("Fonte: Ministério da Saúde.", 32.7, "fonte"))}
</body></html>"""

# ---- trilha: quatro acordes longos, timbre suave, volume baixo
SR = 44100
def pad(freqs, dur):
    t = np.arange(int(SR * dur)) / SR
    y = np.zeros_like(t)
    for k, f in enumerate(freqs):
        for det in (-0.6, 0.0, 0.7):                       # leve desafinação: som mais cheio
            ff = f * (1 + det / 1000)
            y += np.sin(2 * np.pi * ff * t + k) + 0.22 * np.sin(2 * np.pi * 2 * ff * t) + 0.06 * np.sin(2 * np.pi * 3 * ff * t)
    a = int(SR * 1.3)
    env = np.ones_like(t); env[:a] = np.sin(np.linspace(0, np.pi / 2, a)) ** 2; env[-a:] = np.cos(np.linspace(0, np.pi / 2, a)) ** 2
    return y * env * (1 + 0.06 * np.sin(2 * np.pi * 0.23 * t))
N = {"C3": 130.81, "E3": 164.81, "F3": 174.61, "G3": 196.0, "A3": 220.0, "B3": 246.94, "C4": 261.63, "D4": 293.66, "E4": 329.63, "G4": 392.0, "A2": 110.0, "F2": 87.31, "G2": 98.0, "C2": 65.41}
CH = [("C2", "C3", "G3", "E4", "B3"), ("A2", "A3", "E3", "C4", "G4"), ("F2", "F3", "A3", "C4", "E4"), ("G2", "G3", "D4", "B3", "E4")]
seg, ov = 5.6, 1.3
total = np.zeros(int(SR * (DUR + 1)))
for i, ch in enumerate(CH * 3):
    p = pad([N[n] for n in ch], seg)
    s = int(SR * i * (seg - ov))
    if s >= len(total): break
    e = min(len(total), s + len(p)); total[s:e] += p[:e - s]
total = total[:int(SR * DUR)]
fade = int(SR * 1.5); total[-fade:] *= np.linspace(1, 0, fade); total[:int(SR * .6)] *= np.linspace(0, 1, int(SR * .6))
total = total / np.max(np.abs(total)) * 0.22
wav = OUT / "_trilha.wav"
with wave.open(str(wav), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    st = np.stack([total, total], axis=1); w.writeframes((st * 32767).astype("<i2").tobytes())

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
out = OUT / "reel-v2.mp4"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", str(frames / "%04d.jpg"), "-i", str(wav), "-shortest",
                "-af", "lowpass=f=2400,aecho=0.8:0.7:90|160:0.25|0.18", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
                "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", str(out)], check=True)
Image.open(frames / "0075.jpg").save(OUT / "capa.jpg", quality=93)
sh = Image.new("RGB", (540 * 7 + 20 * 8, 960 + 40), (232, 230, 226))
for i, n in enumerate((75, 240, 370, 520, 700, 880, 1180)):
    sh.paste(Image.open(frames / f"{n:04d}.jpg").resize((540, 960), Image.LANCZOS), (20 + i * 560, 20))
sh.save(HERE / "_folha-reel.jpg", quality=88)
shutil.rmtree(frames); wav.unlink()
print("ok", out.stat().st_size)
