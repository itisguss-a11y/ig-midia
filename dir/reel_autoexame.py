#!/usr/bin/env python3
# Reel de 13/11/2026: "Nunca aprendi a fazer o autoexame direito." Não precisa. Conversão do carrossel de 11/10 (Meta, série Mito ou verdade).
# Gancho em fundo dourado, só letra, visível no primeiro quadro; depois fundo creme, desenho de linha em movimento em cima e texto menor embaixo.
import subprocess, shutil, sys
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import reels_lote as R
OUT = HERE.parent / "midia"
FPS = 30
ln = R.ln

CSS = R.CSS + """
section{top:1120px}
.gold{position:absolute;inset:0;background:var(--gold);z-index:1}
.gancho{position:absolute;left:96px;right:110px;top:470px;z-index:2;color:var(--g)}
.q{font:italic 400 92px/1.02 'Serif';letter-spacing:-.018em;text-wrap:balance}
.np{font:400 236px/.9 'Serif';letter-spacing:-.03em;margin:70px 0 60px -8px}
.k{font:400 54px/1.22 'Sans';text-wrap:pretty}
.t8{font:400 84px/1.04 'Serif';letter-spacing:-.016em;text-wrap:balance}
.on{opacity:.25;animation:on .4s var(--t) forwards}
@keyframes on{to{opacity:1}}
.pop{opacity:0;transform-box:fill-box;transform-origin:center;animation:pop .35s var(--t) cubic-bezier(.2,.7,.2,1.4) forwards}
@keyframes pop{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:none}}
.glow{transform-box:fill-box;transform-origin:center;animation:glow 1.4s var(--t) ease-in-out infinite}
@keyframes glow{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(1.18)}}
.apaga{animation:apaga 1.6s var(--t) ease-in forwards}
@keyframes apaga{to{opacity:.05}}
.cai{animation:cai 1.1s var(--t) linear infinite}
@keyframes cai{0%{transform:translateY(0);opacity:0}15%{opacity:1}100%{transform:translateY(9px);opacity:0}}
.balanca{transform-box:fill-box;transform-origin:50% 0;animation:balanca 2s var(--t) ease-in-out infinite}
@keyframes balanca{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
.cresce{transform-box:fill-box;transform-origin:50% 100%;transform:scaleY(0);animation:cresce 1.2s var(--t) cubic-bezier(.4,0,.2,1) forwards}
@keyframes cresce{to{transform:scaleY(1)}}
.carimbo{opacity:0;transform-origin:20% 50%;animation:carimbo .45s var(--t) cubic-bezier(.2,.7,.2,1.3) forwards}
@keyframes carimbo{from{opacity:0;transform:scale(1.5) rotate(-4deg)}to{opacity:1;transform:none}}
.porta{transform-box:fill-box;transform-origin:0 50%;animation:porta 1.2s var(--t) ease-in-out forwards}
@keyframes porta{to{transform:scaleX(.25)}}
.vai{animation:vai 1.8s var(--t) ease-in-out infinite}
@keyframes vai{0%{transform:translate(0,0);opacity:0}20%{opacity:1}80%{opacity:1}100%{transform:translate(5px,-5px);opacity:0}}
"""
def page(body):
    return f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body class='cream'><div class='who'>Mito ou verdade</div>{body}</body></html>"
def scene(t0, t1, inner, top=None):
    st = f"top:{top}px;" if top else ""
    out = f"sout .4s {t1 - .4:.2f}s forwards" if t1 < 900 else ""
    return f"<section style='{st}animation:sin .45s {t0:.2f}s both{', ' + out if out else ''}'>{inner}</section>"
def g(t0, t1, inner):
    out = f"sout .4s {t1 - .4:.2f}s forwards" if t1 < 900 else ""
    return f"<g style='opacity:0;animation:sin .45s {t0:.2f}s both{', ' + out if out else ''}'>{inner}</g>"

# tempos das cenas (s): cada cena fica o tempo de ler uma vez com calma
DUR = [5.4, 4.2, 4.6, 3.8, 4.2, 3.8, 4.4, 3.8, 6.2, 4.8]
T = [0.0]
for d in DUR: T.append(round(T[-1] + d, 2))
FIM = T[-1] + 4.6
LINHA = "fill='none' stroke='currentColor' stroke-width='.2' stroke-linecap='round' stroke-linejoin='round'"

# cena 2: folha de calendário com um dia circulado; o círculo se apaga
cal = (f"<g {LINHA}><rect x='6' y='5' width='18' height='19' rx='1'/><path d='M6 9 H24 M10 3.4 V6.4 M20 3.4 V6.4'/></g>"
       + "".join(f"<circle cx='{8.6 + c * 3.2:.1f}' cy='{12 + r * 3:.1f}' r='.42' fill='currentColor' opacity='.45'/>" for r in range(4) for c in range(5))
       + f"<circle class='apaga' style='--t:{T[1] + 1.4:.1f}s' cx='18.2' cy='15' r='1.5' fill='none' stroke='var(--acc)' stroke-width='.35'/>")
# figuras de pessoa (sem rosto)
def pessoa(x, y, s=1, cor="currentColor", op=1, cls="", st=""):
    return (f"<g {cls} style='{st}' opacity='{op}'><circle cx='{x}' cy='{y}' r='{.75 * s}' fill='{cor}'/>"
            f"<path d='M{x - 1.1 * s} {y + 3 * s} Q {x} {y + .4 * s} {x + 1.1 * s} {y + 3 * s} Z' fill='{cor}'/></g>")
# cena 3: dois grupos iguais, mesma barra embaixo
def grupo(x0, rot):
    s = "".join(pessoa(x0 + (i % 3) * 3, 8 + (i // 3) * 4.6) for i in range(6))
    return s + f"<text x='{x0 + 3}' y='4.6' text-anchor='middle' font-family='Sans' font-size='1.5' fill='currentColor'>{rot}</text>"
c3 = (grupo(3.2, "com treino") + grupo(20.8, "sem treino")
      + f"<rect class='cresce' style='--t:{T[2] + .8:.1f}s' x='3.6' y='19' width='5.2' height='4' fill='var(--acc)'/>"
      + f"<rect class='cresce' style='--t:{T[2] + .8:.1f}s' x='21.2' y='19' width='5.2' height='4' fill='var(--acc)'/>"
      + f"<path d='M2 23 H28' {LINHA}/>"
      + f"<text class='fade' style='animation-delay:{T[2] + 2:.1f}s' x='15' y='26.6' text-anchor='middle' font-family='Sans' font-size='1.5' fill='currentColor'>mortes por câncer de mama</text>")
# cena 4: biópsias que não deram câncer: o lado com treino dobra
def agulha(x, y, cls="", st=""):
    return (f"<g class='{cls}' style='{st}'><path d='M{x} {y} L {x + 2.6} {y - 2.6}' stroke='var(--acc)' stroke-width='.32' stroke-linecap='round'/>"
            f"<rect x='{x + 2.2}' y='{y - 4.4}' width='1.2' height='2.4' rx='.2' transform='rotate(45 {x + 2.8} {y - 3.2})' fill='var(--acc)'/></g>")
esq = "".join(agulha(3 + (i % 4) * 2.8, 13 + (i // 4) * 4.4, "pop", f"--t:{T[3] + .3 + i * .18:.2f}s") for i in range(8))
dir_ = "".join(agulha(19 + (i % 4) * 2.8, 13 + (i // 4) * 4.4, "pop", f"--t:{T[3] + .3 + i * .18:.2f}s") for i in range(4))
c4 = (esq + dir_ + f"<path d='M15 6 V24' {LINHA} opacity='.4'/>"
      + "<text x='8' y='5.4' text-anchor='middle' font-family='Sans' font-size='1.5' fill='currentColor'>com treino</text>"
      + "<text x='23' y='5.4' text-anchor='middle' font-family='Sans' font-size='1.5' fill='currentColor'>sem treino</text>")
# cena 5: espelho de banheiro e chuveiro
c5 = (f"<g {LINHA}><rect x='4' y='5' width='11' height='14' rx='5.5'/><path d='M6.4 8.4 L 8.4 6.6 M6.4 11 L 10.8 7'/>"
      "<path d='M3 21 H16 M5 21 V24 M14 21 V24'/>"
      "<path d='M25 3 V8 Q25 9.6 23 9.6 H20.6'/><path d='M18 9.6 H23 L 22 11 H19 Z'/></g>"
      + "".join(f"<path class='cai' style='--t:{T[4] + .2 + k * .25:.2f}s' d='M{19 + k * 1} 12.6 v1' stroke='var(--acc)' stroke-width='.3' stroke-linecap='round'/>" for k in range(4)))
# cena 6: gotas caindo e blusa num cabide balançando
blusa = (f"<g class='balanca' style='--t:{T[5]:.1f}s'><g {LINHA}><path d='M20 4 V5.4 M20 5.4 L 15 8.4 H25 Z'/>"
         "<path d='M16.4 8.4 L 13.6 11.6 L 15.6 13 L 16.6 12 V20 H23.4 V12 L 24.4 13 L 26.4 11.6 L 23.6 8.4 Q 20 10.6 16.4 8.4'/></g></g>")
gotas = "".join(f"<path class='cai' style='--t:{T[5] + k * .22:.2f}s' d='M{4 + k * 1.6} {6 + (k % 3) * 2} q .6 1.2 0 1.6 q -.6 -.4 0 -1.6' fill='var(--acc)'/>" for k in range(6))
c6 = blusa + gotas
# cena 7: silhueta sem rosto, mão sobre o peito; contorno acende
c7 = (f"<g {LINHA} stroke-width='.24'><circle cx='15' cy='6.6' r='3'/><path d='M6 26 Q 6 12.4 15 12 Q 24 12.4 24 26'/>"
      "<path d='M11 19.6 Q 13 17 17.6 17.4 Q 18.6 18.2 17.4 19 L 12.6 20.4'/></g>"
      + f"<path class='draw' style='--dur:1.4s;animation-delay:{T[6] + .5:.1f}s' pathLength='1' d='M5 26.6 Q 4.6 11 15 10.8 Q 25.4 11 25 26.6' stroke='var(--acc)' stroke-width='.35' fill='none' stroke-linecap='round'/>")
# cena 8 e 10: mama em linha simples
mama = f"<g {LINHA} stroke-width='.24'><path d='M4 6 Q 6 14 6 16 Q 6 25 15 25 Q 23 25 24 17'/><circle cx='15' cy='17.6' r='.9'/><path d='M22 6 Q 23.4 9 25.4 10.6'/></g>"
c8 = mama + f"<circle class='glow' style='--t:{T[7] + .4:.1f}s' cx='11' cy='15.4' r='1.4' fill='var(--acc)'/>"
# cena 9: 10 figuras, 9 se destacam
c9 = "".join(pessoa(3.4 + (i % 5) * 5.8, 7 + (i // 5) * 9, 1.5, "currentColor", .22) for i in range(10)) + \
     "".join(pessoa(3.4 + (i % 5) * 5.8, 7 + (i // 5) * 9, 1.5, "var(--acc)", 1, "class='pop'", f"--t:{T[8] + .3 + i * .22:.2f}s") for i in range(9))
# cena 10: a mesma mama com 4 marcações numeradas
def marca(x, y, n, t):
    return (f"<g class='pop' style='--t:{t:.2f}s'><circle cx='{x}' cy='{y}' r='1.5' fill='var(--acc)'/>"
            f"<text x='{x}' y='{y + .65}' text-anchor='middle' font-family='Sans' font-weight='700' font-size='1.8' fill='var(--cream)'>{n}</text></g>")
c10 = mama + "".join(marca(x, y, n, T[8] + .5 + i * 1.1) for i, (x, y, n) in enumerate(((8.4, 21.4, 1), (17.4, 16.2, 2), (15, 21.2, 3), (25.4, 7.6, 4))))
c10 += f"<path class='fade' style='animation-delay:{T[8] + 2.7:.1f}s' d='M15 18.8 q .6 1.1 0 1.4 q -.6 -.3 0 -1.4' fill='var(--acc)' opacity='.6'/>"
# cena 11: fachada da UBS, porta abre
c11 = (f"<g {LINHA}><path d='M5 24 V12 H25 V24 M3.8 24 H26.2 M4.4 12 L 6 9 H24 L 25.6 12'/>"
       "<rect x='6.4' y='14.6' width='4' height='3'/><rect x='19.6' y='14.6' width='4' height='3'/><rect x='12.6' y='17' width='4.8' height='7'/></g>"
       + f"<rect class='porta' style='--t:{T[9] + .6:.1f}s' x='12.8' y='17.2' width='4.4' height='6.8' fill='currentColor' opacity='.18'/>"
       "<rect x='10.4' y='5.4' width='9.2' height='3.6' rx='.5' fill='var(--acc)'/>"
       "<text x='15' y='8.1' text-anchor='middle' font-family='Sans' font-weight='700' font-size='2.3' fill='var(--cream)'>UBS</text>")
# cena 12: celular com seta de envio
c12 = (f"<g {LINHA} stroke-width='.22'><rect x='10.4' y='5' width='9.2' height='17' rx='1.3'/><path d='M13.6 6.4 H16.4'/></g>"
       f"<g class='vai' style='--t:{T[10] + .3:.1f}s'><path d='M13 16 L 19 10 M19 10 H 15.6 M19 10 V 13.4' fill='none' stroke='var(--acc)' stroke-width='.36' stroke-linecap='round' stroke-linejoin='round'/></g>")

W = 756
cenas = [cal, c3, c4, c5, c6, c7, c8, c10, c11, c12]
desenho = "".join(g(T[i + 1], T[i + 2] if i + 2 < len(T) else 999, c) for i, c in enumerate(cenas))
svg = f"<svg class='d' style='left:162px;top:300px' width='{W}' height='{W}' viewBox='0 0 30 30' fill='none' color='currentColor'>{desenho}</svg>"

# cena 1 (gancho inteiro no primeiro quadro): fundo dourado, só letra
t1 = T[1]
gancho = (f"<div class='gold' style='animation:sout .4s {t1 - .4:.2f}s forwards'></div>"
          f"<div class='gancho' style='animation:sout .4s {t1 - .4:.2f}s forwards'>"
          "<div class='q'>“Nunca aprendi a fazer o autoexame direito.”</div>"
          "<div class='np'>Não precisa.</div>"
          "<div class='k'>Câncer de mama: o que fazer no lugar do passo a passo.</div></div>")

FRASES = __import__("json").load(open(HERE / "reel_autoexame_frases.json", encoding="utf-8"))
txt = ""
for i, f in enumerate(FRASES[:-1]):
    txt += scene(T[i + 1], T[i + 2], ln(f, T[i + 1] + .1, "t8"))
txt += scene(T[10], 999, ln(FRASES[-1], T[10] + .1, "t8") + ln("Fonte: INCA, 2025.", T[10] + .8, "fonte"))
HTML = page(svg + txt + gancho)

REEL = dict(slug="2026-11-13-autoexame-mama", html=HTML, dur=FIM, capa=0.0,
            folha=tuple([0.0, 3.0] + [T[i] + 2.6 for i in range(1, 11)] + [FIM - .3, T[8] + 5.2, T[8] + 3.0]),
            acordes=[("F2", "F3", "A3", "C4", "E4"), ("C2", "C3", "G3", "E4", "B3"), ("A2", "A3", "E3", "C4", "G4"), ("G2", "G3", "D4", "B3", "E4")])

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
        sh = Image.new("RGB", (324 * 5 + 16 * 6, (576 + 16) * 3 + 16), (120, 120, 120))
        for i, t in enumerate(r["folha"][:15]):
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
        print(r["slug"], (d / "reel.mp4").stat().st_size, r["dur"])
        b.close()
