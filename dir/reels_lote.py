#!/usr/bin/env python3
# Reels do lote de teste de 03/10/2026 (não publicados): texto animado, sem voz, com desenho de linha em movimento.
# Tempo de leitura: sem regra fixa. Cada cena fica o tempo que o texto dela pede (frase curta, menos; frase longa, mais).
# Na dengue, os sinais entram um a um e ficam na tela, então quem lê devagar não perde nenhum.
import subprocess, shutil, sys, wave
from pathlib import Path
import numpy as np
from playwright.sync_api import sync_playwright
from PIL import Image

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "perfil"))
import perfil as P
OUT = HERE.parent / "midia"
FPS = 30

CSS = P.FONTS + f"""
body{{width:1080px;height:1920px;overflow:hidden;position:relative;font-family:'Sans',sans-serif;-webkit-font-smoothing:antialiased}}
body::after{{content:'';position:absolute;inset:0;background:url("{P.GRAIN}");opacity:.07;mix-blend-mode:overlay;pointer-events:none;z-index:9}}
.green{{background:var(--g);color:var(--cream);--acc:var(--gold);--line:var(--gold);--rule:rgba(244,237,223,.26)}}
.cream{{background:var(--cream);color:var(--g);--acc:var(--pen);--line:var(--g);--rule:rgba(23,64,44,.2)}}
.who{{position:absolute;left:96px;top:262px;font:italic 400 46px/1 'Serif';opacity:.92}}
section{{position:absolute;left:96px;right:120px;top:400px;opacity:0}}
@keyframes sin{{from{{opacity:0}}to{{opacity:1}}}} @keyframes sout{{from{{opacity:1}}to{{opacity:0}}}}
.ln{{opacity:0;animation:up .6s cubic-bezier(.2,.7,.2,1) both}}
@keyframes up{{from{{opacity:0;transform:translateY(44px)}}to{{opacity:1;transform:none}}}}
.h{{font:400 196px/.92 'Serif';letter-spacing:-.028em}}
.m{{font:400 128px/1 'Serif';letter-spacing:-.02em;text-wrap:balance}}
.t{{font:400 88px/1.02 'Serif';letter-spacing:-.015em;text-wrap:balance}}
.x{{font:italic 400 280px/.9 'Serif';letter-spacing:-.035em;color:var(--acc);margin:16px 0 34px -10px;white-space:nowrap}}
.s{{font:400 62px/1.25 'Sans';margin-top:46px;text-wrap:pretty}}
.e{{font:italic 400 70px/1.05 'Serif';margin-top:64px;text-wrap:balance}}
.nb{{white-space:nowrap}}
.i{{font-style:italic;color:var(--acc)}} .gap{{margin-top:.13em}}
.lista{{margin-top:44px}}
.li{{display:flex;gap:30px;font:400 62px/1.2 'Sans';padding:22px 0;border-top:1.5px solid var(--rule)}}
.li::before{{content:'';flex:0 0 20px;height:20px;margin-top:26px;border-radius:50%;background:var(--acc)}}
.fonte{{font:400 34px/1.3 'Sans';margin-top:40px}}
svg.d{{position:absolute;left:0;top:0;overflow:visible}}
.draw{{stroke-dasharray:1;stroke-dashoffset:1;animation:draw var(--dur,2s) cubic-bezier(.5,0,.2,1) forwards}}
@keyframes draw{{to{{stroke-dashoffset:0}}}}
.fade{{opacity:0;animation:sin .6s both}}
.beat{{transform-origin:800px 1360px;animation:beat 1.15s ease-in-out infinite}}
@keyframes beat{{0%,100%{{transform:scale(1)}}18%{{transform:scale(1.045)}}36%{{transform:scale(1)}}54%{{transform:scale(1.025)}}72%{{transform:scale(1)}}}}
"""
def scene(t0, t1, inner):
    out = f"sout .4s {t1 - .4:.2f}s forwards" if t1 < 900 else ""
    if t0 == 0:                      # a primeira cena já começa na tela: o gancho aparece no primeiro quadro
        return f"<section style='opacity:1;animation:{out}'>{inner}</section>"
    return f"<section style='animation:sin .45s {t0:.2f}s both{', ' + out if out else ''}'>{inner}</section>"
def ln(txt, t, cls=""):
    if t == 0: return f"<div class='{cls}'>{txt}</div>"          # sem entrada: visível desde o primeiro quadro
    return f"<div class='ln {cls}' style='animation-delay:{t:.2f}s'>{txt}</div>"
def page(theme, who, body):
    return f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body class='{theme}'><div class='who'>{who}</div>{body}</body></html>"

# ------------------------------------------------------------------ 1. dengue (fundo verde)
# desenho: a curva da febre caindo; depois some para dar lugar à lista
febre = ("<svg class='d' width='1080' height='1920' viewBox='0 0 1080 1920' fill='none' style='animation:sout .5s 7.0s forwards'>"
         "<path class='draw' style='--dur:1.9s;animation-delay:.5s' pathLength='1' d='M 96 1228 C 250 1212, 400 1214, 520 1250 C 660 1292, 720 1452, 984 1470' "
         "stroke='var(--line)' stroke-width='4.5' stroke-linecap='round'/>"
         "<circle class='fade' style='animation-delay:2.2s' cx='984' cy='1470' r='11' fill='var(--line)'/>"
         "<text class='fade' style='animation-delay:.6s' x='96' y='1182' font-family='Sans' font-size='36' fill='currentColor' opacity='.8'>39 °C</text>"
         "<text class='fade' style='animation-delay:2.3s' x='984' y='1536' text-anchor='end' font-family='Sans' font-size='36' fill='currentColor' opacity='.8'>a febre cai</text></svg>")
SINAIS = [("Dor forte na barriga", 9.6), ("Vômitos frequentes", 11.4), ("Tontura ou sensação de desmaio", 13.2), ("Dificuldade de respirar", 15.4),
          ("Sangramento no nariz, na gengiva ou nas fezes", 17.2), ("Cansaço ou irritabilidade", 20.2)]
dengue = page("green", "Sinais do corpo", febre
    + scene(0, 3.2, ln("A febre", 0, "h") + ln("baixou.", 0, "h") + ln("E agora?", 1.1, "h i"))
    + scene(3.2, 7.4, ln("Na dengue, o perigo pode vir quando a febre cai.", 3.3, "m"))
    + scene(7.4, 23.4, ln("Entre o 3º e o 7º dia de doença, fique de olho:", 7.5, "t")
            + "<div class='lista'>" + "".join(ln(a, t, "li") for a, t in SINAIS) + "</div>")
    + scene(23.4, 999, ln("Apareceu um deles?", 23.5, "s") + ln("Vá na hora ao serviço de urgência.", 24.1, "m")
            + ln("Não tome remédio por conta própria.", 26.6, "s") + ln("Envie para quem está com dengue.", 28.4, "e")
            + ln("Fonte: Ministério da Saúde.", 29.0, "fonte")))

# ------------------------------------------------------------------ 2. infarto (fundo creme)
# desenho: o coração de uma linha só, batendo devagar
coracao = ("<svg class='d' width='1080' height='1920' viewBox='0 0 1080 1920' fill='none'><g class='beat'>"
           "<path class='draw' style='--dur:2.4s;animation-delay:.4s' pathLength='1' transform='translate(0 360)' "
           "d='M -40 1128 C 250 1128, 520 1140, 668 1112 C 800 1086, 944 1030, 944 936 C 944 868, 880 852, 846 866 C 818 878, 806 902, 800 930 "
           "C 794 902, 780 876, 750 866 C 706 852, 652 880, 652 944 C 652 1030, 748 1086, 806 1150 C 850 1196, 960 1150, 1120 1128' "
           "stroke='var(--line)' stroke-width='4.5' stroke-linecap='round' stroke-linejoin='round'/></g></svg>")
infarto = page("cream", "Sinais do corpo", coracao
    + scene(0, 3.1, ln("Dor no", 0, "h") + ln("peito.", 0, "h") + ln("É infarto?", 1.0, "h i gap"))
    + scene(3.1, 8.3, ln("Desconfie quando a dor é forte e não passa.", 3.2, "m") + ln("Com sensação de peso ou aperto no peito.", 5.7, "s"))
    + scene(8.3, 12.5, ln("Ela pode se espalhar para as costas, o rosto ou o braço esquerdo.", 8.4, "m"))
    + scene(12.5, 16.1, ln("Junto, podem vir suor frio, palidez e falta de ar.", 12.6, "m"))
    + scene(16.1, 20.3, ln("Em idosos e em quem tem diabetes, pode vir sem os sinais típicos.", 16.2, "m"))
    + scene(20.3, 23.7, ln("Fique atento a qualquer <span class='nb'>mal-estar</span> repentino.", 20.4, "m"))
    + scene(23.7, 999, ln("Sentiu isso?", 23.8, "s") + ln("Ligue 192.", 24.3, "x") + ln("Ou vá à emergência mais próxima.", 26.1, "s")
            + ln("Envie para a sua família.", 27.7, "e") + ln("Fonte: Ministério da Saúde.", 28.3, "fonte")))

# ------------------------------------------------------------------ trilha: acordes longos e suaves, gerados aqui (sem direito autoral)
SR = 44100
N = {"C2": 65.41, "D2": 73.42, "E2": 82.41, "F2": 87.31, "G2": 98.0, "A2": 110.0, "C3": 130.81, "D3": 146.83, "E3": 164.81, "F3": 174.61, "G3": 196.0,
     "A3": 220.0, "B3": 246.94, "C4": 261.63, "D4": 293.66, "E4": 329.63, "F4": 349.23, "G4": 392.0, "A4": 440.0}
def pad(freqs, dur):
    t = np.arange(int(SR * dur)) / SR
    y = np.zeros_like(t)
    for k, f in enumerate(freqs):
        for det in (-0.6, 0.0, 0.7):
            ff = f * (1 + det / 1000)
            y += np.sin(2 * np.pi * ff * t + k) + 0.22 * np.sin(2 * np.pi * 2 * ff * t) + 0.06 * np.sin(2 * np.pi * 3 * ff * t)
    a = int(SR * 1.3)
    env = np.ones_like(t); env[:a] = np.sin(np.linspace(0, np.pi / 2, a)) ** 2; env[-a:] = np.cos(np.linspace(0, np.pi / 2, a)) ** 2
    return y * env * (1 + 0.06 * np.sin(2 * np.pi * 0.23 * t))
def trilha(chords, dur, path):
    seg, ov = 5.6, 1.3
    total = np.zeros(int(SR * (dur + 1)))
    for i, ch in enumerate(chords * 4):
        s = int(SR * i * (seg - ov))
        if s >= len(total): break
        p = pad([N[n] for n in ch], seg); e = min(len(total), s + len(p)); total[s:e] += p[:e - s]
    total = total[:int(SR * dur)]
    fade = int(SR * 1.5); total[-fade:] *= np.linspace(1, 0, fade); total[:int(SR * .6)] *= np.linspace(0, 1, int(SR * .6))
    total = total / np.max(np.abs(total)) * 0.22
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.stack([total, total], axis=1) * 32767).astype("<i2").tobytes())

REELS = [
 dict(slug="2026-10-03-dengue-febre-baixou", html=dengue, dur=31.2, capa=2.5, folha=(2.5, 6.4, 10.8, 16.8, 22.8, 25.8, 30.8),
      acordes=[("A2", "A3", "E3", "C4", "G4"), ("F2", "F3", "A3", "C4", "E4"), ("C2", "C3", "G3", "E4", "B3"), ("G2", "G3", "D4", "B3", "E4")]),
 dict(slug="2026-10-03-infarto-dor-no-peito", html=infarto, dur=30.6, capa=2.4, folha=(2.4, 7.6, 11.8, 15.4, 19.6, 23.0, 30.2),
      acordes=[("D2", "D3", "A3", "F4", "C4"), ("G2", "G3", "D4", "B3", "F4"), ("C2", "C3", "G3", "E4", "B3"), ("A2", "A3", "E3", "C4", "G4")]),
]

if __name__ == "__main__":
    only = sys.argv[1:]; sel = [o for o in only if not o.startswith("--")]
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        pg = b.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
        for r in REELS:
            if sel and not any(o in r["slug"] for o in sel): continue
            d = OUT / r["slug"]; d.mkdir(parents=True, exist_ok=True)
            frames = HERE / "_frames"; shutil.rmtree(frames, ignore_errors=True); frames.mkdir()
            f = HERE / "_reel.html"; f.write_text(r["html"], encoding="utf-8")
            pg.goto(f.as_uri()); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(200)
            seek = "ms => document.getAnimations().forEach(a => { a.pause(); a.currentTime = ms; })"
            pg.evaluate(seek, 0); pg.screenshot(path=str(frames / "f.png"))   # a primeira captura depois de carregar sai atrasada: descarta
            sh = Image.new("RGB", (432 * len(r["folha"]) + 16 * (len(r["folha"]) + 1), 768 + 32), (120, 120, 120))
            for i, t in enumerate(r["folha"]):                                  # folha de conferência
                pg.evaluate(seek, t * 1000); pg.screenshot(path=str(frames / "f.png"))
                sh.paste(Image.open(frames / "f.png").convert("RGB").resize((432, 768), Image.LANCZOS), (16 + i * 448, 16))
            sh.save(HERE / f"_folha-{r['slug']}.jpg", quality=88)
            if "--folha" in only: f.unlink(); continue
            pg.evaluate(seek, r["capa"] * 1000); pg.screenshot(path=str(frames / "capa.png"))
            Image.open(frames / "capa.png").convert("RGB").save(d / "capa.jpg", quality=93)
            for n in range(int(FPS * r["dur"])):
                pg.evaluate(seek, n * 1000 / FPS)
                pg.screenshot(path=str(frames / f"{n:04d}.jpg"), type="jpeg", quality=92)
            f.unlink()
            wav = frames / "trilha.wav"; trilha(r["acordes"], r["dur"], wav)
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", str(frames / "%04d.jpg"), "-i", str(wav), "-shortest",
                            "-af", "lowpass=f=2400,aecho=0.8:0.7:90|160:0.25|0.18", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17",
                            "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(d / "reel.mp4")], check=True)
            shutil.rmtree(frames)
            print(r["slug"], (d / "reel.mp4").stat().st_size)
        b.close()
