#!/usr/bin/env python3
# Reel de 13/11/2026: o preventivo mudou (teste de HPV de 5 em 5 anos). Conversão do roteiro de 10/10 (Meta, série Entenda seu exame).
# Fundo creme (capa que não é verde), desenho de linha verde com destaque dourado ocupando o alto do quadro; texto menor embaixo.
# Mesmo caminho do reel de 04/11 (dir/reel_itu.py): HTML com animação CSS, captura quadro a quadro, ffmpeg a 30 qps, trilha gerada aqui.
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
.h4{font:400 96px/.98 'Serif';letter-spacing:-.024em;text-wrap:balance}
.k{font:400 54px/1.22 'Sans';margin-top:34px;text-wrap:pretty}
.t8{font:400 84px/1.04 'Serif';letter-spacing:-.016em;text-wrap:balance}
.lit{opacity:0;animation:sin .4s var(--t) both}
.pulse{transform-box:fill-box;transform-origin:center;animation:pulse 1.6s ease-in-out infinite}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
.slide{animation:slide .7s var(--t) cubic-bezier(.5,0,.2,1) forwards}
@keyframes slide{to{transform:translate(var(--dx),0);opacity:0}}
.slin{opacity:0;transform:translate(14px,0);animation:slin .7s var(--t) cubic-bezier(.2,.7,.2,1) forwards}
@keyframes slin{to{transform:none;opacity:1}}
.mv{animation:mv 1.2s var(--t) cubic-bezier(.5,0,.2,1) forwards}
@keyframes mv{to{transform:translate(var(--dx),var(--dy))}}
.grow{transform-box:fill-box;transform-origin:0 50%;transform:scaleX(0);animation:grow 1.6s var(--t) cubic-bezier(.4,0,.2,1) forwards}
@keyframes grow{to{transform:scaleX(1)}}
.fadeo{animation:fadeo 3.2s var(--t) ease-in forwards}
@keyframes fadeo{to{opacity:.08}}
.vai{animation:vai 1.8s var(--t) ease-in-out infinite}
@keyframes vai{0%{transform:translate(0,0);opacity:0}20%{opacity:1}80%{opacity:1}100%{transform:translate(5px,-5px);opacity:0}}
"""
def page(body):
    return f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body class='cream'><div class='who'>Entenda seu exame</div>{body}</body></html>"
def g(t0, t1, inner):
    if t0 == 0:
        return f"<g style='animation:sout .4s {t1 - .4:.2f}s forwards'>{inner}</g>"
    out = f", sout .4s {t1 - .4:.2f}s forwards" if t1 < 900 else ""
    return f"<g style='opacity:0;animation:sin .45s {t0:.2f}s both{out}'>{inner}</g>"
def draw(d, t, dur=1.2, w=.2, col="currentColor"):
    return f"<path class='draw' style='--dur:{dur}s;animation-delay:{t:.2f}s' pathLength='1' d='{d}' stroke='{col}' stroke-width='{w}' stroke-linecap='round' stroke-linejoin='round' fill='none'/>"
LN = "fill='none' stroke='currentColor' stroke-width='.2' stroke-linecap='round' stroke-linejoin='round'"

# tempos das cenas (s): cada cena fica o tempo de ler uma vez com calma
T = [0, 5.6, 9.2, 13.8, 17.4, 22.4, 26.4, 30.8, 35.6, 40.6, 46.2]
FIM = 50.6

def linha5(t, y=21.5, marca=True):
    """linha do tempo de 5 quadrados (anos); o primeiro e o último ficam dourados"""
    s = ""
    for i in range(5):
        x = 3.6 + i * 4.8
        s += f"<rect x='{x}' y='{y}' width='3.6' height='3.6' rx='.5' {LN}/>"
        if marca and i in (0, 4):
            s += f"<rect class='lit' style='--t:{t + (0 if i == 0 else 1.4):.2f}s' x='{x + .5}' y='{y + .5}' width='2.6' height='2.6' rx='.3' fill='var(--acc)'/>"
        elif not marca:
            s += f"<rect class='lit' style='--t:{t + i * .35:.2f}s' x='{x + .5}' y='{y + .5}' width='2.6' height='2.6' rx='.3' fill='var(--acc)' opacity='.85'/>"
    return s
def frasco(x, y):
    return (f"<g {LN}><rect x='{x}' y='{y + 2}' width='5' height='10' rx='.8'/><rect x='{x - .4}' y='{y}' width='5.8' height='2.2' rx='.4'/></g>")
def virus(cx, cy, r=1.6, cls="", st=""):
    sp = "".join(f"<path d='M{cx + r * c:.2f} {cy + r * s:.2f} L{cx + (r + .8) * c:.2f} {cy + (r + .8) * s:.2f}'/><circle cx='{cx + (r + 1) * c:.2f}' cy='{cy + (r + 1) * s:.2f}' r='.28'/>"
                 for c, s in ((1, 0), (.707, .707), (0, 1), (-.707, .707), (-1, 0), (-.707, -.707), (0, -1), (.707, -.707)))
    return f"<g class='{cls}' style='{st}' fill='none' stroke='currentColor' stroke-width='.2'><circle cx='{cx}' cy='{cy}' r='{r}'/>{sp}</g>"
def lupa(cx, cy, r=3.2):
    return (f"<g fill='none' stroke='var(--acc)' stroke-width='.3' stroke-linecap='round'><circle cx='{cx}' cy='{cy}' r='{r}'/>"
            f"<path d='M{cx + r * .72:.2f} {cy + r * .72:.2f} L{cx + r * 1.5:.2f} {cy + r * 1.5:.2f}' stroke-width='.55'/></g>")

# cena 1: "5 anos" gigante e a linha do tempo que acende de um ano ao outro
c1 = ("<text x='15' y='16.5' text-anchor='middle' font-family='Serif' font-size='17' fill='currentColor'>5</text>"
      "<text x='15' y='19.6' text-anchor='middle' font-family='Serif' font-style='italic' font-size='2.6' fill='var(--acc)'>anos</text>"
      + linha5(.6, marca=False))
# cena 2: o frasco troca de etiqueta
eti = lambda txt, cls, st: (f"<g class='{cls}' style='{st}'><rect x='9.6' y='13' width='10.8' height='3' rx='.3' fill='var(--g)'/>"
                             f"<text x='15' y='15.05' text-anchor='middle' font-family='Sans' font-weight='700' font-size='1.45' fill='var(--cream)'>{txt}</text></g>")
c2 = (f"<g transform='translate(0 0)'><g {LN} stroke-width='.24'><rect x='11' y='9' width='8' height='15' rx='1.2'/><rect x='10.4' y='6' width='9.2' height='3.2' rx='.6'/></g>"
      + eti("Papanicolau", "slide", f"--t:{T[1] + .9}s;--dx:-16px") + eti("Teste de HPV", "slin", f"--t:{T[1] + 1.5}s") + "</g>")
# cena 3: escova e frasco, com um sinal de igual
c3 = (draw("M7 6 V20", T[2] + .2, 1.0, .24) + f"<g class='lit' style='--t:{T[2] + 1.0}s' fill='none' stroke='currentColor' stroke-width='.2'>"
      + "".join(f"<path d='M5.6 {y} H8.4'/>" for y in (20.6, 21.3, 22.0, 22.7, 23.4)) + "</g>"
      + f"<g class='lit' style='--t:{T[2] + 1.4}s' stroke='var(--acc)' stroke-width='.4' stroke-linecap='round'><path d='M13.4 14 H16.6 M13.4 16 H16.6'/></g>"
      + f"<g class='lit' style='--t:{T[2] + .6}s'>" + frasco(20.5, 10) + "</g>")
# cenas 4 e 5: a lupa sai da célula alterada e vai ao vírus, que acende
celula = (f"<g {LN}><ellipse cx='8.5' cy='15' rx='5' ry='4'/><circle cx='8.2' cy='15' r='1.3'/></g>"
          f"<circle class='lit pulse' style='--t:{T[3] + .8}s' cx='10.6' cy='13.4' r='.75' fill='var(--acc)'/>")
vir = virus(22, 15, 1.7)
lupa45 = f"<g class='mv' style='--t:{T[4] + .3}s;--dx:{22 - 8.5}px;--dy:0px'>{lupa(8.5, 15, 5.6)}</g>"
vir_on = f"<g class='lit' style='--t:{T[4] + 1.4}s'><circle class='pulse' cx='22' cy='15' r='1.7' fill='var(--acc)'/></g>"
c45 = celula + vir + vir_on + lupa45
# cena 6: negativo hoje, próximo daqui a 5 anos
c6 = (linha5(T[5] + .3, y=13)
      + "<text x='5.4' y='20' text-anchor='middle' font-family='Sans' font-size='1.4' fill='currentColor'>hoje</text>"
      + f"<text class='lit' style='--t:{T[5] + 1.7}s' x='24.6' y='20' text-anchor='middle' font-family='Sans' font-size='1.4' fill='currentColor'>daqui a 5 anos</text>"
      + f"<g class='lit' style='--t:{T[5] + .2}s'><circle cx='5.4' cy='9' r='1.6' fill='none' stroke='var(--acc)' stroke-width='.25'/><path d='M4.7 9 H6.1' stroke='var(--acc)' stroke-width='.3' stroke-linecap='round'/></g>"
      + draw("M7.6 9 C 12 6.4, 18 6.4, 22.4 9", T[5] + .8, 1.4, .2, "var(--acc)")
      + f"<path class='lit' style='--t:{T[5] + 2.1}s' d='M21.4 8 L22.6 9.1 L21.2 9.9' fill='none' stroke='var(--acc)' stroke-width='.2' stroke-linecap='round'/>")
# cena 7: régua de idade, trecho de 25 a 64 pintado
X = lambda a: 3 + a * 24 / 80
regua = (f"<path d='M{X(0)} 16 H{X(80)}' {LN}/>"
         + "".join(f"<path d='M{X(a):.2f} 15.2 V16.8' {LN}/><text x='{X(a):.2f}' y='19.4' text-anchor='middle' font-family='Sans' font-size='1.3' fill='currentColor' opacity='.75'>{a}</text>"
                   for a in (0, 20, 40, 60, 80)))
c7 = (regua + f"<rect class='grow' style='--t:{T[6] + .4}s' x='{X(25):.2f}' y='14.6' width='{X(64) - X(25):.2f}' height='2.8' rx='.4' fill='var(--acc)' opacity='.85'/>"
      + f"<g class='lit' style='--t:{T[6] + 1.9}s' font-family='Serif' font-size='2.6' fill='var(--acc)' text-anchor='middle'>"
      f"<text x='{X(25):.2f}' y='12.6'>25</text><text x='{X(64):.2f}' y='12.6'>64</text></g>")
# cena 8: "câncer" riscado, fica "vírus"
c8 = (virus(15, 9.5, 1.9) + f"<circle class='pulse' cx='15' cy='9.5' r='1.9' fill='var(--acc)'/>"
      "<text x='15' y='18' text-anchor='middle' font-family='Serif' font-size='3.2' fill='currentColor'>câncer</text>"
      + draw("M9.4 16.9 H20.6", T[7] + 1.2, .6, .35, "var(--acc)")
      + f"<text class='lit' style='--t:{T[7] + 2.0}s' x='15' y='23.4' text-anchor='middle' font-family='Serif' font-style='italic' font-size='3.2' fill='var(--acc)'>vírus encontrado</text>")
# cena 9: o vírus clareia ao longo de 2 anos
c9 = (f"<path d='M4 21 H26' {LN}/>" + "".join(f"<path d='M{x} 20.2 V21.8' {LN}/>" for x in (4, 15, 26))
      + "<g font-family='Sans' font-size='1.3' fill='currentColor' text-anchor='middle' opacity='.75'><text x='4' y='24'>hoje</text><text x='15' y='24'>1 ano</text><text x='26' y='24'>2 anos</text></g>"
      + f"<g class='mv' style='--t:{T[8] + .4}s;--dx:22px;--dy:0px;animation-duration:3.4s'><g class='fadeo' style='--t:{T[8] + .4}s'>"
      + virus(4, 13, 1.7) + "<circle cx='4' cy='13' r='1.7' fill='var(--acc)'/></g></g>")
# cena 10: unidade de saúde com a placa e pontos que acendem no mapa
fach = (f"<g {LN}><path d='M5 25 V15 H25 V25 M3.8 25 H26.2 M4.4 15 L 6 12 H24 L 25.6 15'/>"
        "<rect x='12.6' y='19' width='4.8' height='6'/><path d='M15 19 V25'/><rect x='6.4' y='17' width='4' height='3'/><rect x='19.6' y='17' width='4' height='3'/></g>"
        "<rect x='9' y='8.4' width='12' height='3.2' rx='.5' fill='var(--g)'/>"
        "<text x='15' y='10.6' text-anchor='middle' font-family='Sans' font-weight='700' font-size='1.7' fill='var(--cream)'>Preventivo</text>"
        + "".join(f"<circle class='lit pulse' style='--t:{T[9] + .6 + i * .45:.2f}s' cx='{x}' cy='{y}' r='.55' fill='var(--acc)'/>"
                  for i, (x, y) in enumerate(((3, 6), (27, 4.5), (6.5, 3), (24, 7.5), (13, 4), (18.5, 2.8)))))
# cena 11: celular com seta de envio
fone = (f"<g fill='none' stroke='currentColor' stroke-width='.22' stroke-linecap='round' stroke-linejoin='round'>"
        "<rect x='10.4' y='5' width='9.2' height='17' rx='1.3'/><path d='M13.6 6.4 H16.4'/></g>"
        f"<g class='vai' style='--t:{T[10] + .8}s'><path d='M13 16 L 19 10 M19 10 H 15.6 M19 10 V 13.4' fill='none' stroke='var(--acc)' stroke-width='.36' stroke-linecap='round' stroke-linejoin='round'/></g>")

arte = (g(0, T[1], c1) + g(T[1], T[2], c2) + g(T[2], T[3], c3) + g(T[3], T[5], c45) + g(T[5], T[6], c6) + g(T[6], T[7], c7)
        + g(T[7], T[8], c8) + g(T[8], T[9], c9) + g(T[9], T[10], fach) + g(T[10], 999, fone))
W = 756
svg = f"<svg class='d' style='left:162px;top:330px' width='{W}' height='{W}' viewBox='0 0 30 30' fill='none' color='currentColor'>{arte}</svg>"

TX = [
    ("O preventivo mudou. Deu negativo, o próximo é daqui a 5 anos.", "O que muda no posto, dos 25 aos 64 anos."),
    "Sai o Papanicolau. Entra o <span class='i'>teste de HPV.</span>",
    "Para você, a coleta é parecida: mesmo lugar, com escova ou espátula.",
    "O Papanicolau procura células já alteradas.",
    "O teste novo procura o <span class='i'>vírus</span> que pode causar o câncer, muitas vezes antes de qualquer lesão.",
    "Deu negativo? O próximo teste é daqui a <span class='i'>5 anos.</span>",
    "É para quem tem de <span class='i'>25 a 64 anos</span> e já teve relação sexual.",
    "Deu positivo? Não quer dizer câncer. Quer dizer que o vírus foi encontrado.",
    "Na maioria das vezes, o corpo elimina o HPV sozinho, em até uns 2 anos.",
    "O teste novo ainda está chegando. Onde não chegou, o Papanicolau continua valendo.",
    "Envie para a amiga que vive adiando o preventivo.",
]
FONTE = "Fonte: Ministério da Saúde e INCA."
txt = scene(0, T[1], ln(TX[0][0], 0, "h4") + ln(TX[0][1], 0, "k"))
for i in range(1, 10):
    txt += scene(T[i], T[i + 1], ln(TX[i], T[i] + .1, "t8"))
txt += scene(T[10], 999, ln(TX[10], T[10] + .1, "t8") + ln(FONTE, T[10] + .8, "fonte"))
HTML = page(svg + txt)

REEL = dict(slug="2026-11-13-preventivo-teste-hpv", html=HTML, dur=FIM, capa=2.6,
            folha=(0.0, 8.0, 11.8, 16.0, 21.5, 25.0, 29.5, 34.0, 39.5, 44.0),
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
