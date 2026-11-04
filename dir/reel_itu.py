#!/usr/bin/env python3
# Reel de 04/11/2026: infecção urinária que sobe para o rim (conversão do roteiro de 10/10, Meta, série Sinais do corpo).
# Silhueta de costas em linha dourada sobre fundo verde, bexiga e rins que acendem; texto menor embaixo.
import subprocess, shutil, sys
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import reels_lote as R
OUT = HERE.parent / "midia"
FPS = 30
scene, ln = R.scene, R.ln

CSS = R.CSS + """
section{top:1120px}
.h4{font:400 100px/.96 'Serif';letter-spacing:-.024em;text-wrap:balance}
.k{font:400 54px/1.22 'Sans';margin-top:34px;text-wrap:pretty}
.t8{font:400 84px/1.04 'Serif';letter-spacing:-.016em;text-wrap:balance}
.t8b{font:400 62px/1.2 'Sans';margin-top:34px}
.zona{opacity:0;transform-box:fill-box;transform-origin:center;animation:zin .5s var(--t) both, zpulse 1.5s calc(var(--t) + .5s) ease-in-out infinite}
@keyframes zin{from{opacity:0;transform:scale(.3)}to{opacity:.92;transform:scale(1)}}
@keyframes zpulse{0%,100%{opacity:.92}50%{opacity:.5}}
.pt{opacity:0;transform-box:fill-box;animation:rise 2.2s var(--t) ease-in infinite}
@keyframes rise{0%{opacity:0;transform:translate(0,0)}15%{opacity:1}80%{opacity:1}100%{opacity:0;transform:translate(var(--dx),-8.2px)}}
.merc{transform-box:fill-box;transform-origin:50% 100%;transform:scaleY(0);animation:merc 2.2s var(--t) cubic-bezier(.4,0,.2,1) forwards}
@keyframes merc{to{transform:scaleY(1)}}
.tr{opacity:0;animation:trm .5s var(--t) ease-in-out infinite alternate}
@keyframes trm{from{opacity:0;transform:translateX(-.25px)}to{opacity:.9;transform:translateX(.25px)}}
.vai{animation:vai 1.8s var(--t) ease-in-out infinite}
@keyframes vai{0%{transform:translate(0,0);opacity:0}20%{opacity:1}80%{opacity:1}100%{transform:translate(5px,-5px);opacity:0}}
.onda{stroke-dasharray:.6 .3;animation:onda 1.4s linear infinite}
@keyframes onda{to{stroke-dashoffset:-.9}}
"""
def page(body):
    return f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body class='green'><div class='who'>Sinais do corpo</div>{body}</body></html>"
def g(t0, t1, inner):
    out = f", sout .4s {t1 - .4:.2f}s forwards" if t1 < 900 else ""
    return f"<g style='opacity:0;animation:sin .45s {t0:.2f}s both{out}'>{inner}</g>"
def zona(cx, cy, rx, ry, t, rot=0):
    return f"<ellipse class='zona' style='--t:{t}s' cx='{cx}' cy='{cy}' rx='{rx}' ry='{ry}' transform='rotate({rot} {cx} {cy})' fill='var(--acc)'/>"
def pt(x, y, dx, t): return f"<circle class='pt' style='--t:{t}s;--dx:{dx}px' cx='{x}' cy='{y}' r='.33' fill='var(--acc)'/>"

# tempos das cenas (segundos): cada cena fica o tempo de ler uma vez com calma
T = [0, 6.0, 12.0, 18.0, 21.5, 26.3, 29.8, 35.3, 41.8]
FIM = 47.0
BX = 3   # desloca o corpo para a direita no desenho (sobra espaço dos dois lados)

corpo = (f"<g transform='translate({BX} 0)' fill='none' stroke='currentColor' stroke-width='.17' stroke-linecap='round' stroke-linejoin='round'>"
         "<circle cx='12' cy='3' r='2.5'/><path d='M10.9 5.4 V7 M13.1 5.4 V7'/>"
         "<path d='M10.9 7 C 7.2 7.6, 4.6 8.9, 4.4 12.8 V 21'/><path d='M13.1 7 C 16.8 7.6, 19.4 8.9, 19.6 12.8 V 21'/>"
         "<path d='M7.6 11 C 8.6 14, 9 16.4, 8 19.2 C 7.2 20.6, 7 22.4, 7.4 24.2'/><path d='M16.4 11 C 15.4 14, 15 16.4, 16 19.2 C 16.8 20.6, 17 22.4, 16.6 24.2'/>"
         "<path d='M7.4 24.2 C 10 25.2, 14 25.2, 16.6 24.2'/><path d='M9.4 24.9 V 29.6 M14.6 24.9 V 29.6'/></g>")
def rim(x, rot): return f"<ellipse cx='{x + BX}' cy='13.4' rx='.95' ry='1.85' transform='rotate({rot} {x + BX} 13.4)' fill='none' stroke='currentColor' stroke-width='.14' opacity='.75'/>"
orgaos = rim(9.3, 12) + rim(14.7, -12) + f"<ellipse cx='{12 + BX}' cy='21.2' rx='1.55' ry='1.35' fill='none' stroke='currentColor' stroke-width='.14' opacity='.75'/>"
KE, KD, BEX = (9.3 + BX, 13.4), (14.7 + BX, 13.4), (12 + BX, 21.2)

# cena 1: bexiga acende, depois um rim
c1 = zona(*BEX, 1.55, 1.35, 0.6) + zona(*KD, .95, 1.85, 2.6, -12)
# cena 2: três marcas (chama, relógio, gota) ao lado da bexiga
ic = ("<g transform='translate(0 0)' fill='none' stroke='var(--acc)' stroke-width='.2' stroke-linecap='round' stroke-linejoin='round'>"
      "<g class='fade' style='animation-delay:7.6s'><path d='M2.2 18.6 C 1 17.4, 1.6 15.9, 2.4 15 C 2.6 16, 3.2 16.4, 3.6 16.6 C 3.8 17.1, 3.6 18, 2.2 18.6 Z'/></g>"
      "<g class='fade' style='animation-delay:8.6s'><circle cx='2.5' cy='21.2' r='1.3'/><path d='M2.5 20.4 V21.3 H3.2'/></g>"
      "<g class='fade' style='animation-delay:9.6s'><path d='M2.5 23.1 C 1.7 24.2, 1.5 24.7, 1.5 25.1 C 1.5 25.8, 2 26.2, 2.5 26.2 C 3 26.2, 3.5 25.8, 3.5 25.1 C 3.5 24.7, 3.3 24.2, 2.5 23.1 Z'/></g></g>")
c2 = zona(*BEX, 1.55, 1.35, 6.0) + ic
# cena 3: pontos sobem da bexiga ao rim; depois o outro rim pisca
c3 = (zona(*KD, .95, 1.85, 13.8, -12) + zona(*KE, .95, 1.85, 16.2, 12)
      + pt(BEX[0] - .6, 19.8, 3.4, 12.2) + pt(BEX[0], 19.6, 3.4, 12.7) + pt(BEX[0] + .6, 19.8, 3.4, 13.2)
      + pt(BEX[0] - .6, 19.8, -2.9, 14.4) + pt(BEX[0] + .2, 19.6, -2.9, 15.0))
# cena 4: termômetro sobe, linhas de tremor ao lado do corpo
tx = 25.8
c4 = (f"<g fill='none' stroke='currentColor' stroke-width='.2'><rect x='{tx - .55}' y='7' width='1.1' height='9.6' rx='.55'/><circle cx='{tx}' cy='17.5' r='1.25'/></g>"
      f"<rect class='merc' style='--t:18.2s' x='{tx - .3}' y='7.8' width='.6' height='9.4' fill='var(--acc)'/><circle cx='{tx}' cy='17.5' r='.95' fill='var(--acc)'/>"
      + "".join(f"<path class='tr' style='--t:{19.2 + i * .1}s' d='M{x} {y} q.6 .7 0 1.4 q-.6 .7 0 1.4' fill='none' stroke='var(--acc)' stroke-width='.18' stroke-linecap='round'/>"
                for i, (x, y) in enumerate([(1.0 + BX, 10), (23.2 + BX - 1.5, 11), (2.4 + BX, 15.2), (21.8 + BX - 1.4, 16)])))
# cena 5: dor nas costas (rins), na lateral e na virilha
c5 = (zona(*KE, 1.1, 2.0, 22.0, 12) + zona(*KD, 1.1, 2.0, 22.0, -12) + zona(7.6 + BX, 17.4, .9, 1.7, 23.4, 8) + zona(16.4 + BX, 17.4, .9, 1.7, 23.4, -8)
      + zona(12 + BX, 24.0, 1.1, .9, 24.8))
# cena 6: enjoo, ondas na barriga
c6 = ("<g fill='none' stroke='var(--acc)' stroke-width='.22' stroke-linecap='round'>"
      + "".join(f"<path class='onda' d='M{9.2 + BX} {y} q.9 -.7 1.8 0 t1.8 0 t1.8 0' style='animation-delay:{27 + i * .15}s'/>" for i, y in enumerate((16.6, 17.8, 19.0))) + "</g>")
# cena 7: o rim aceso ganha uma marca que não apaga
c7 = (zona(*KD, 1.05, 1.95, 29.8, -12)
      + f"<path class='draw' style='--dur:1.2s;animation-delay:30.6s' pathLength='1' d='M{KD[0] - .9} {KD[1] - 1.5} L {KD[0] + .8} {KD[1] + 1.5}' stroke='var(--g)' stroke-width='.26' stroke-linecap='round'/>"
      + f"<path class='draw' style='--dur:1.0s;animation-delay:31.6s' pathLength='1' d='M{KD[0] + .9} {KD[1] - 1.2} L {KD[0] - .9} {KD[1] + 1.2}' stroke='var(--g)' stroke-width='.26' stroke-linecap='round'/>")
silu = ("<g style='animation:sout .5s 34.8s forwards'>" + corpo + orgaos
        + g(0, 6.0, c1) + g(6.0, 12.0, c2) + g(12.0, 18.0, c3) + g(18.0, 21.5, c4) + g(21.5, 26.3, c5) + g(26.3, 29.8, c6) + g(29.8, 35.3, c7) + "</g>")
# cena 8: fachada da UPA com placa e relógio
fach = ("<g fill='none' stroke='currentColor' stroke-width='.2' stroke-linecap='round' stroke-linejoin='round'>"
        "<path d='M5 24 V12 H25 V24 M3.8 24 H26.2 M4.4 12 L 6 9 H24 L 25.6 12'/>"
        "<rect x='12.6' y='17' width='4.8' height='7'/><path d='M15 17 V24'/><rect x='6.4' y='14.6' width='4' height='3'/><rect x='19.6' y='14.6' width='4' height='3'/></g>"
        "<rect x='8.4' y='5.4' width='13.2' height='3.6' rx='.5' fill='var(--acc)'/>"
        "<text x='15' y='8.1' text-anchor='middle' font-family='Sans' font-weight='700' font-size='2.4' fill='var(--g)'>UPA 24h</text>"
        "<g fill='none' stroke='var(--acc)' stroke-width='.2' stroke-linecap='round'><circle cx='25.4' cy='5.2' r='2'/>"
        f"<path class='draw' style='--dur:1.6s;animation-delay:36s' pathLength='1' d='M25.4 5.2 V3.9'/><path d='M25.4 5.2 L26.4 5.7'/></g>")
# cena 9: celular com seta de envio
fone = ("<g fill='none' stroke='currentColor' stroke-width='.22' stroke-linecap='round' stroke-linejoin='round'>"
        "<rect x='10.4' y='5' width='9.2' height='17' rx='1.3'/><path d='M13.6 6.4 H16.4'/></g>"
        "<g class='vai' style='--t:42.6s'><path d='M13 16 L 19 10 M19 10 H 15.6 M19 10 V 13.4' fill='none' stroke='var(--acc)' stroke-width='.36' stroke-linecap='round' stroke-linejoin='round'/></g>")
cena89 = g(35.3, 41.8, fach) + g(41.8, 999, fone)

W = 756
svg = f"<svg class='d' style='left:162px;top:300px' width='{W}' height='{W * 30 // 30}' viewBox='0 0 30 30' fill='none' color='currentColor'>{silu}{cena89}</svg>"

txt = (scene(T[0], T[1], ln("Ardência para fazer xixi. Depois, febre e dor nas costas.", 0, "h4") + ln("3 sinais de que a infecção urinária pode ter chegado ao rim.", 0, "k"))
       + scene(T[1], T[2], ln("Ela começa na bexiga: arde para urinar, a vontade vem toda hora e sai pouco xixi.", T[1] + .1, "t8"))
       + scene(T[2], T[3], ln("Sem tratamento, as bactérias podem subir da bexiga para o rim.", T[2] + .1, "t8"))
       + scene(T[3], T[4], ln("Sinal 1: <span class='i'>febre com calafrio.</span>", T[3] + .1, "t8"))
       + scene(T[4], T[5], ln("Sinal 2: <span class='i'>dor nas costas,</span> na lateral do corpo ou na virilha.", T[4] + .1, "t8"))
       + scene(T[5], T[6], ln("Sinal 3: <span class='i'>enjoo ou vômito.</span>", T[5] + .1, "t8"))
       + scene(T[6], T[7], ln("Por que a pressa: infecção no rim sem tratamento pode deixar lesão permanente.", T[6] + .1, "t8"))
       + scene(T[7], T[8], ln("Ardência com febre, calafrio, dor nas costas ou vômito: procure uma <span class='i'>UPA</span> ou pronto atendimento <span class='i'>hoje,</span> sem esperar passar.", T[7] + .1, "t8"))
       + scene(T[8], 999, ln("Envie para a amiga que vive com infecção urinária.", T[8] + .1, "t8")
               + ln("Fontes: NIDDK (governo dos EUA) e Ministério da Saúde.", T[8] + .8, "fonte")))
HTML = page(svg + txt)

REEL = dict(slug="2026-11-04-infeccao-urinaria-rim", html=HTML, dur=FIM, capa=2.0, folha=(0.0, 2.8, 8.0, 14.0, 19.5, 24.0, 28.0, 32.5, 38.0, 44.0),
            acordes=[("A2", "A3", "E3", "C4", "G4"), ("F2", "F3", "A3", "C4", "E4"), ("C2", "C3", "G3", "E4", "B3"), ("G2", "G3", "D4", "B3", "E4")])

if __name__ == "__main__":
    only = sys.argv[1:]
    r = REEL
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args=['--no-sandbox'])
        pg = b.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
        d = OUT / r["slug"]; d.mkdir(parents=True, exist_ok=True)
        frames = HERE / "_frames"; shutil.rmtree(frames, ignore_errors=True); frames.mkdir()
        f = HERE / "_reel.html"; f.write_text(r["html"], encoding="utf-8")
        pg.goto(f.as_uri()); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(200)
        seek = "ms => document.getAnimations().forEach(a => { a.pause(); a.currentTime = ms; })"
        pg.evaluate(seek, 0); pg.screenshot(path=str(frames / "f.png"))   # a primeira captura depois de carregar sai atrasada: descarta
        n = len(r["folha"])
        sh = Image.new("RGB", (324 * 5 + 16 * 6, (576 + 16) * 2 + 16), (120, 120, 120))
        for i, t in enumerate(r["folha"]):
            pg.evaluate(seek, t * 1000); pg.screenshot(path=str(frames / "f.png"))
            sh.paste(Image.open(frames / "f.png").convert("RGB").resize((324, 576), Image.LANCZOS), (16 + (i % 5) * 340, 16 + (i // 5) * 592))
        sh.save(HERE / f"_folha-{r['slug']}.jpg", quality=88)
        if "--folha" in only: f.unlink(); b.close(); sys.exit()
        pg.evaluate(seek, r["capa"] * 1000); pg.screenshot(path=str(frames / "capa.png"))
        Image.open(frames / "capa.png").convert("RGB").save(d / "capa.jpg", quality=93)
        for k in range(int(FPS * r["dur"])):
            pg.evaluate(seek, k * 1000 / FPS)
            pg.screenshot(path=str(frames / f"{k:04d}.jpg"), type="jpeg", quality=92)
        f.unlink()
        wav = frames / "trilha.wav"; R.trilha(r["acordes"], r["dur"], wav)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", str(frames / "%04d.jpg"), "-i", str(wav), "-shortest",
                        "-af", "lowpass=f=2400,aecho=0.8:0.7:90|160:0.25|0.18", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17",
                        "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(d / "reel.mp4")], check=True)
        shutil.rmtree(frames)
        print(r["slug"], (d / "reel.mp4").stat().st_size)
        b.close()
