#!/usr/bin/env python3
# Reel de 12/11/2026: o preventivo mudou (teste de HPV, 5 em 5 anos). Conversão do roteiro de 10/10 (Meta, série Entenda seu exame).
# Fundo creme, número gigante no gancho, desenho de linha em movimento em cima e texto menor embaixo.
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
.h4{font:400 92px/.98 'Serif';letter-spacing:-.022em;text-wrap:balance}
.k{font:400 52px/1.22 'Sans';margin-top:30px;text-wrap:pretty}
.t8{font:400 84px/1.04 'Serif';letter-spacing:-.016em;text-wrap:balance}
.sl{animation:sl .6s var(--t) cubic-bezier(.5,0,.2,1) forwards}
@keyframes sl{to{transform:translateX(-26px);opacity:0}}
.si{opacity:0;transform:translateX(26px);animation:si .6s var(--t) cubic-bezier(.2,.7,.2,1) forwards}
@keyframes si{to{transform:none;opacity:1}}
.on{opacity:.25;animation:on .4s var(--t) forwards}
@keyframes on{to{opacity:1}}
.mv{animation:mv 1.2s var(--t) cubic-bezier(.5,0,.2,1) forwards}
@keyframes mv{to{transform:translate(var(--dx),var(--dy))}}
.glow{transform-box:fill-box;transform-origin:center;animation:glow 1.4s var(--t) ease-in-out infinite}
@keyframes glow{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.08)}}
.some{animation:some 3.4s var(--t) linear forwards}
@keyframes some{to{opacity:.06;transform:translateX(14px)}}
.flip{transform-box:fill-box;transform-origin:50% 0;animation:flip .7s var(--t) ease-in infinite}
@keyframes flip{0%{transform:scaleY(1);opacity:1}100%{transform:scaleY(-.05);opacity:0}}
.pinta{transform-box:fill-box;transform-origin:0 50%;transform:scaleX(0);animation:pinta 1.6s var(--t) cubic-bezier(.4,0,.2,1) forwards}
@keyframes pinta{to{transform:scaleX(1)}}
.vai{animation:vai 1.8s var(--t) ease-in-out infinite}
@keyframes vai{0%{transform:translate(0,0);opacity:0}20%{opacity:1}80%{opacity:1}100%{transform:translate(5px,-5px);opacity:0}}
"""
def page(body):
    return f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body class='cream'><div class='who'>Entenda seu exame</div>{body}</body></html>"
def scene(t0, t1, inner, top=None):
    st = f"top:{top}px;" if top else ""
    out = f"sout .4s {t1 - .4:.2f}s forwards" if t1 < 900 else ""
    if t0 == 0:
        return f"<section style='{st}opacity:1;animation:{out}'>{inner}</section>"
    return f"<section style='{st}animation:sin .45s {t0:.2f}s both{', ' + out if out else ''}'>{inner}</section>"
def g(t0, t1, inner):
    out = f"sout .4s {t1 - .4:.2f}s forwards" if t1 < 900 else ""
    if t0 == 0:
        return f"<g style='animation:{out}'>{inner}</g>"
    return f"<g style='opacity:0;animation:sin .45s {t0:.2f}s both{', ' + out if out else ''}'>{inner}</g>"

# tempos das cenas (s): cada cena fica o tempo de ler uma vez com calma
T = [0, 6.2, 10.2, 15.0, 19.0, 24.4, 28.4, 33.0, 38.2, 43.2, 48.8]
FIM = 54.5
LINHA = "fill='none' stroke='currentColor' stroke-width='.2' stroke-linecap='round' stroke-linejoin='round'"

def quadros(y, t0, marca=None):
    s = ""
    for i in range(5):
        x = 3 + i * 5
        cls = f"class='on' style='--t:{t0 + i * .45:.2f}s'" if marca is None else ("" if i in marca else "opacity='.3'")
        s += f"<rect {cls} x='{x}' y='{y}' width='4' height='4' rx='.5' fill='var(--acc)'/>"
    return s

# cena 1 (gancho, visível no primeiro quadro): "5 anos" gigante e linha do tempo de 5 quadrados
c1 = ("<text x='15' y='15.2' text-anchor='middle' font-family='Serif' font-size='17' fill='var(--acc)'>5</text>"
      "<text x='15' y='19.6' text-anchor='middle' font-family='Serif' font-style='italic' font-size='3.6' fill='currentColor'>anos</text>"
      + quadros(22.5, .5))
# cena 2: frasco com etiqueta que troca
def frasco(x, y):
    return (f"<g {LINHA}><rect x='{x}' y='{y}' width='8' height='14' rx='1'/><rect x='{x - .5}' y='{y - 2.4}' width='9' height='2.4' rx='.4'/></g>")
c2 = (frasco(11, 9)
      + "<g class='sl' style='--t:7.4s'><rect x='9' y='13' width='12' height='4.2' rx='.4' fill='currentColor' opacity='.12'/>"
        "<text x='15' y='15.9' text-anchor='middle' font-family='Sans' font-size='1.6' fill='currentColor'>Papanicolau</text></g>"
      + "<g class='si' style='--t:8.0s'><rect x='9' y='13' width='12' height='4.2' rx='.4' fill='var(--acc)'/>"
        "<text x='15' y='15.9' text-anchor='middle' font-family='Sans' font-weight='700' font-size='1.6' fill='var(--cream)'>Teste de HPV</text></g>")
# cena 3: escova de coleta = frasco
escova = (f"<g {LINHA}><path class='draw' style='--dur:1.2s;animation-delay:10.5s' pathLength='1' d='M4 25 L 10 9'/>"
          "<path d='M9.4 10.6 L 11.6 11.4 M9.8 9.6 L 12 10.4 M10.2 8.6 L 12.4 9.4 M8.9 11.7 L 11.1 12.5'/></g>")
c3 = (escova + "<g class='fade' style='animation-delay:11.6s'><path d='M13.4 15.6 H16.6 M13.4 17.4 H16.6' stroke='var(--acc)' stroke-width='.4' stroke-linecap='round'/></g>"
      + "<g class='fade' style='animation-delay:12.2s'>" + frasco(19, 10) + "</g>")
# cena 4: lupa sobre uma célula com mancha
def lupa(x, y, cls=""):
    return (f"<g {cls}><g fill='none' stroke='currentColor' stroke-width='.35' stroke-linecap='round'>"
            f"<circle cx='{x}' cy='{y}' r='3.6'/><path d='M{x + 2.6} {y + 2.6} L {x + 6} {y + 6}'/></g></g>")
cel = (f"<g {LINHA}><path d='M7 15 C 7 10, 12 8, 15 9.5 C 18 11, 18.5 15, 16 18 C 13.5 21, 7 20, 7 15 Z'/><circle cx='12.4' cy='14.4' r='2'/></g>"
       "<circle class='glow' style='--t:16.2s' cx='15.2' cy='16.2' r='1.1' fill='var(--acc)'/>")
c4 = cel + "<g class='fade' style='animation-delay:15.6s'>" + lupa(15.2, 16.2) + "</g>"
# cena 5: a lupa desliza da célula para o vírus, que acende
virus = lambda x, y, t: (f"<g class='glow' style='--t:{t}s'><circle cx='{x}' cy='{y}' r='1.9' fill='var(--acc)'/>"
                         + "".join(f"<path d='M{x} {y} l{dx} {dy}' stroke='var(--acc)' stroke-width='.3' stroke-linecap='round'/><circle cx='{x + dx}' cy='{y + dy}' r='.45' fill='var(--acc)'/>"
                                   for dx, dy in ((0, -3), (2.6, -1.5), (2.6, 1.5), (0, 3), (-2.6, 1.5), (-2.6, -1.5))) + "</g>")
c5 = (f"<g opacity='.35'>{cel}</g>" + virus(22, 8, 20.6)
      + f"<g class='mv' style='--t:19.6s;--dx:6.8px;--dy:-8.2px'>{lupa(15.2, 16.2)}</g>")
# cena 6: 5 quadrados, primeiro e último marcados; calendário que vira as folhas
cal = (f"<g {LINHA}><rect x='10' y='4' width='10' height='11' rx='.8'/><path d='M10 7 H20 M12.5 2.8 V5 M17.5 2.8 V5'/></g>"
       "<rect class='flip' style='--t:25s' x='10.2' y='7.2' width='9.6' height='7.6' fill='currentColor' opacity='.1'/>")
c6 = cal + quadros(20, 0, marca=(0, 4)) + ("<text x='5' y='27.2' text-anchor='middle' font-family='Sans' font-size='1.5' fill='currentColor'>hoje</text>"
                                           "<text x='25' y='27.2' text-anchor='middle' font-family='Sans' font-size='1.5' fill='currentColor'>próximo</text>")
# cena 7: régua de idade com o trecho de 25 a 64 pintado
X0, X1 = 3, 27
ax = lambda a: X0 + (X1 - X0) * a / 80
regua = (f"<g {LINHA}><path d='M{X0} 16 H{X1}'/>" + "".join(f"<path d='M{ax(a):.2f} 15 V17'/>" for a in (0, 20, 40, 60, 80)) + "</g>"
         + "".join(f"<text x='{ax(a):.2f}' y='19.6' text-anchor='middle' font-family='Sans' font-size='1.4' fill='currentColor' opacity='.7'>{a}</text>" for a in (0, 20, 40, 60, 80))
         + f"<rect class='pinta' style='--t:29s' x='{ax(25):.2f}' y='14.6' width='{ax(64) - ax(25):.2f}' height='2.8' rx='.4' fill='var(--acc)'/>"
         + "".join(f"<text class='fade' style='animation-delay:30.4s' x='{ax(a):.2f}' y='13.2' text-anchor='middle' font-family='Sans' font-weight='700' font-size='2' fill='var(--acc)'>{a}</text>" for a in (25, 64)))
c7 = regua
# cena 8: vírus aceso; "câncer" riscado, "vírus" fica
c8 = (virus(15, 9, 33) + "<text x='15' y='20' text-anchor='middle' font-family='Serif' font-size='3.4' fill='currentColor' opacity='.55'>câncer</text>"
      "<path class='draw' style='--dur:.6s;animation-delay:34.4s' pathLength='1' d='M8.6 17.4 L 21.4 20.6' stroke='var(--acc)' stroke-width='.4' stroke-linecap='round'/>"
      "<text class='fade' style='animation-delay:35.4s' x='15' y='26' text-anchor='middle' font-family='Serif' font-style='italic' font-size='3.4' fill='var(--acc)'>vírus</text>")
# cena 9: o vírus vai clareando ao longo de uma linha de 2 anos até sumir
c9 = (f"<g {LINHA}><path d='M4 21 H26'/><path d='M4 20 V22 M26 20 V22'/></g>"
      "<text x='4' y='24.6' text-anchor='middle' font-family='Sans' font-size='1.5' fill='currentColor'>hoje</text>"
      "<text x='26' y='24.6' text-anchor='middle' font-family='Sans' font-size='1.5' fill='currentColor'>até ~2 anos</text>"
      f"<g class='some' style='--t:38.8s'>{virus(6, 14, 38.2)}</g>")
# cena 10: fachada da unidade de saúde com a placa "Preventivo" e pontos que acendem aos poucos
fach = (f"<g {LINHA}><path d='M5 24 V12 H25 V24 M3.8 24 H26.2 M4.4 12 L 6 9 H24 L 25.6 12'/>"
        "<rect x='12.6' y='17' width='4.8' height='7'/><path d='M15 17 V24'/><rect x='6.4' y='14.6' width='4' height='3'/><rect x='19.6' y='14.6' width='4' height='3'/></g>"
        "<rect x='8.4' y='5.4' width='13.2' height='3.6' rx='.5' fill='var(--acc)'/>"
        "<text x='15' y='8.1' text-anchor='middle' font-family='Sans' font-weight='700' font-size='2.2' fill='var(--cream)'>Preventivo</text>"
        + "".join(f"<circle class='on' style='--t:{44 + i * .5:.1f}s' cx='{x}' cy='{y}' r='.5' fill='var(--acc)'/>"
                  for i, (x, y) in enumerate(((2, 4), (27, 3.2), (3.4, 8), (28, 8.6), (1.4, 12.4), (28.4, 13.6)))))
# cena 11: celular com seta de envio
fone = (f"<g {LINHA} stroke-width='.22'><rect x='10.4' y='5' width='9.2' height='17' rx='1.3'/><path d='M13.6 6.4 H16.4'/></g>"
        "<g class='vai' style='--t:49.4s'><path d='M13 16 L 19 10 M19 10 H 15.6 M19 10 V 13.4' fill='none' stroke='var(--acc)' stroke-width='.36' stroke-linecap='round' stroke-linejoin='round'/></g>")

W = 756
cenas = [c1, c2, c3, c4, c5, c6, c7, c8, c9, fach, fone]
desenho = "".join(g(T[i], T[i + 1] if i + 1 < len(T) else 999, c) for i, c in enumerate(cenas))
svg = f"<svg class='d' style='left:162px;top:300px' width='{W}' height='{W}' viewBox='0 0 30 30' fill='none' color='currentColor'>{desenho}</svg>"

FRASES = [
    "Sai o Papanicolau. Entra o <span class='i'>teste de HPV.</span>",
    "Para você, a coleta é parecida: mesmo lugar, com escova ou espátula.",
    "O Papanicolau procura células já alteradas.",
    "O teste novo procura o <span class='i'>vírus</span> ligado ao câncer do colo do útero, antes da lesão.",
    "Deu negativo? O próximo teste é daqui a <span class='i'>5 anos.</span>",
    "É para quem tem de <span class='i'>25 a 64 anos</span> e já teve relação sexual.",
    "Deu positivo? Não quer dizer câncer. Quer dizer que o vírus foi encontrado.",
    "Na maioria das vezes, o corpo elimina o HPV sozinho, em até uns 2 anos.",
    "O teste novo ainda está chegando. Onde não chegou, o Papanicolau continua valendo.",
]
txt = scene(0, T[1], ln("O preventivo mudou. Deu negativo, o próximo é daqui a <span class='i'>5 anos.</span>", 0, "h4")
            + ln("O que muda no posto, dos 25 aos 64 anos.", 0, "k"))
for i, f in enumerate(FRASES):
    txt += scene(T[i + 1], T[i + 2], ln(f, T[i + 1] + .1, "t8"))
txt += scene(T[10], 999, ln("Envie para a amiga que vive adiando o preventivo.", T[10] + .1, "t8")
             + ln("Fonte: Ministério da Saúde e INCA, diretriz de 2025.", T[10] + .8, "fonte"))
HTML = page(svg + txt)

REEL = dict(slug="2026-11-12-preventivo-hpv", html=HTML, dur=FIM, capa=0.0,
            folha=(0.0, 3.0, 8.6, 13.0, 17.5, 22.5, 27.0, 31.5, 36.5, 41.5, 46.5, 51.0, 54.0, 5.0, 9.6),
            acordes=[("C2", "C3", "G3", "E4", "B3"), ("A2", "A3", "E3", "C4", "G4"), ("F2", "F3", "A3", "C4", "E4"), ("G2", "G3", "D4", "B3", "E4")])

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
