#!/usr/bin/env python3
# Reels do segundo lote de teste (03/10/2026), refeitos a partir do retorno dele. NÃO publicados.
# - Infarto na mulher: o gancho inteiro já está no primeiro quadro e fala com o público dele (mulheres de 25 anos ou mais);
#   o desenho se mexe o tempo todo (o traçado do coração corre na tela; o corpo acende onde cada sinal aparece).
# - Dengue: o "desenho em movimento" que ele pediu para explorar melhor virou o centro do vídeo: o gráfico da febre
#   se desenha, a fase de alerta acende e fica na tela enquanto os sinais entram um a um.
# Tempo de leitura: sem regra fixa. Cada cena fica o tempo que o texto dela pede.
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
.h2{font:400 150px/.95 'Serif';letter-spacing:-.026em;text-wrap:balance}
.h3{font:400 150px/.93 'Serif';letter-spacing:-.027em}
.m2{font:400 104px/1 'Serif';letter-spacing:-.018em;text-wrap:balance;margin-top:36px}
.li2{display:flex;gap:26px;font:400 54px/1.18 'Sans';padding:20px 0;border-top:1.5px solid var(--rule)}
.li2::before{content:'';flex:0 0 18px;height:18px;margin-top:24px;border-radius:50%;background:var(--acc)}
/* traçado do coração que corre na tela */
.ecg-f{opacity:.24} .ecg-m{stroke-dasharray:.2 1;animation:corre 3.4s linear infinite}
@keyframes corre{from{stroke-dashoffset:.2}to{stroke-dashoffset:-1}}
/* corpo: a zona acende quando o sinal entra e fica pulsando */
.corpo{position:absolute;right:0;top:150px}
.zona{opacity:0;transform-box:fill-box;transform-origin:center;animation:zin .5s var(--t) both, zpulse 1.5s calc(var(--t) + .5s) ease-in-out infinite}
@keyframes zin{from{opacity:0;transform:scale(.3)}to{opacity:.92;transform:scale(1)}}
@keyframes zpulse{0%,100%{opacity:.92}50%{opacity:.5}}
.cansa{animation:cansa 1.6s var(--t) ease-in-out infinite}
@keyframes cansa{0%,100%{stroke:currentColor}50%{stroke:var(--acc)}}
/* gráfico da febre */
.graf{position:absolute;left:96px;top:1070px;transform-origin:0 0}
@keyframes sobe{to{transform:translateY(-690px)}}
.gt{font:500 38px 'Sans';fill:currentColor} .gn{font:400 34px 'Sans';fill:currentColor;opacity:.8}
.janela rect{animation:pulsa 1.7s 4.4s ease-in-out infinite}
@keyframes pulsa{0%,100%{opacity:.16}50%{opacity:.3}}
.bola{offset-rotate:0deg;animation:anda 2.3s .4s cubic-bezier(.5,0,.2,1) both}
@keyframes anda{from{offset-distance:0%}to{offset-distance:100%}}
"""
def page(theme, who, body):
    return f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body class='{theme}'><div class='who'>{who}</div>{body}</body></html>"

# ------------------------------------------------------------------ 1. infarto na mulher (fundo creme)
ECG = "M -20 1450 H 250 q 26 -40 52 0 h 46 l 18 14 l 30 -150 l 36 214 l 26 -78 h 70 q 36 -54 72 0 H 1100"
ecg = (f"<svg class='d' width='1080' height='1920' viewBox='0 0 1080 1920' fill='none'>"
       f"<path class='ecg-f' d='{ECG}' stroke='var(--line)' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'/>"
       f"<path class='ecg-m' pathLength='1' d='{ECG}' stroke='var(--acc)' stroke-width='9' stroke-linecap='round' stroke-linejoin='round'/></svg>")
def zona(cx, cy, r, t): return f"<circle class='zona' style='--t:{t}s' cx='{cx}' cy='{cy}' r='{r}' fill='var(--acc)'/>"
corpo = ("<svg class='corpo' width='372' height='434' viewBox='0 0 24 28' fill='none' stroke='currentColor' stroke-width='.82' stroke-linecap='round' stroke-linejoin='round'>"
         + zona(12, 13.6, 2.7, 9.0) + zona(12, 19.2, 2.4, 11.2) + zona(12, 8.2, 1.5, 13.4) + zona(8.4, 11.2, 1.5, 13.7) + zona(15.6, 11.2, 1.5, 13.7)
         + "<g class='cansa' style='--t:17s'><circle cx='12' cy='4.6' r='3'/><path d='M10.7 7.4 v1.4 M13.3 7.4 v1.4'/>"
         "<path d='M10.7 8.8 C 7.2 9.4, 4.6 10.6, 4.4 14.2 V22.4 M13.3 8.8 C 16.8 9.4, 19.4 10.6, 19.6 14.2 V22.4'/>"
         "<path d='M7.6 14.2 V26.6 M16.4 14.2 V26.6'/></g></svg>")
SINAIS_I = [("Falta de ar", 9.0), ("Enjoo ou vômito", 11.2), ("Dor nas costas, no pescoço ou na mandíbula", 13.4), ("Cansaço fora do comum", 17.0)]
infarto = page("cream", "Sinais do corpo", ecg
    + scene(0, 4.2, ln("Infarto em mulher <span class='i'>nem sempre</span> é dor forte no peito.", 0, "h2")
            + ln("4 sinais que se confundem com cansaço e má digestão.", 0, "s"))
    + scene(4.2, 8.6, ln("Muitas vezes ele chega <span class='i'>disfarçado.</span>", 4.3, "m") + ln("E é por isso que muita mulher demora a procurar ajuda.", 6.0, "s"))
    + scene(8.6, 21.2, corpo + ln("Na mulher,<br>desconfie de:", 8.7, "t")
            + "<div class='lista' style='width:500px'>" + "".join(ln(a, t, "li2") for a, t in SINAIS_I) + "</div>")
    + scene(21.2, 25.8, ln("A dor no peito ainda é o sinal mais comum.", 21.3, "m") + ln("Mas pode vir como aperto ou pressão, sem ser forte.", 23.2, "s"))
    + scene(25.8, 999, ln("Sentiu isso de repente?", 25.9, "s") + ln("Ligue 192.", 26.4, "x") + ln("Não espere passar.", 28.0, "s")
            + ln("Envie para a sua mãe, a sua irmã, a sua amiga.", 29.4, "e")
            + ln("Fontes: Sociedade Brasileira de Cardiologia e Ministério da Saúde.", 30.0, "fonte")))

# ------------------------------------------------------------------ 2. dengue (fundo verde)
# o gráfico: a febre fica alta nos primeiros dias, cai, e é aí que começa a fase de alerta (3º ao 7º dia)
CURVA = "M 40 130 C 120 84, 230 84, 309 120 C 380 152, 400 262, 480 286 C 600 316, 740 310, 848 310"
dias = "".join(f"<path d='M {40 + i * 134.67:.0f} 340 v 14' stroke='currentColor' stroke-width='3' opacity='.5'/>"
               f"<text class='gn' x='{40 + i * 134.67:.0f}' y='396' text-anchor='middle'>{i + 1}º</text>" for i in range(7))
grafico = (f"<div class='graf' style='animation:sobe .9s 8.5s cubic-bezier(.6,0,.2,1) forwards, sout .5s 21.4s forwards'>"
           f"<svg width='888' height='420' viewBox='0 0 888 420' fill='none' style='overflow:visible'>"
           f"<g class='janela' style='opacity:0;animation:sin .7s 3.6s both'><rect x='309' y='40' width='555' height='300' rx='18' fill='var(--acc)' opacity='.16'/>"
           f"<text class='gt' x='586' y='96' text-anchor='middle'>3º ao 7º dia: fique de olho</text></g>"
           f"<path d='M 40 340 H 864' stroke='currentColor' stroke-width='3' opacity='.5'/>{dias}"
           f"<path class='draw' style='--dur:2.3s;animation-delay:.4s' pathLength='1' d='{CURVA}' stroke='var(--line)' stroke-width='6' stroke-linecap='round'/>"
           f"<circle class='bola' r='13' fill='var(--line)' style='offset-path:path(\"{CURVA}\")'/>"
           f"<text class='gt' x='40' y='58'>febre alta</text>"
           f"<text class='gt fade' style='animation-delay:2.2s' x='506' y='236'>a febre cai</text>"
           f"<text class='gn' x='40' y='440' opacity='.8'>dia de doença</text></svg></div>")
SINAIS_D = [("Dor forte na barriga", 9.8), ("Vômitos que não param", 11.6), ("Tontura ou sensação de desmaio", 13.4),
            ("Sangramento no nariz, na gengiva ou nas fezes", 15.4), ("Muito cansaço ou irritabilidade", 18.4)]
dengue = page("green", "Sinais do corpo", grafico
    + scene(0, 3.4, ln("A febre da<br>dengue baixou?", 0, "h3") + ln("É agora que você precisa ficar de olho.", 0, "m2 i"))
    + scene(3.4, 8.4, ln("Na dengue, o perigo costuma vir quando a febre cai.", 3.5, "m"))
    + "<section style='top:850px;animation:sin .45s 9.40s both, sout .4s 21.20s forwards'><div class='lista' style='margin-top:0'>"
    + "".join(ln(a, t, "li2") for a, t in SINAIS_D) + "</div></section>"
    + scene(21.8, 999, ln("Apareceu um deles?", 21.9, "s") + ln("Vá na hora ao serviço de urgência.", 22.5, "m")
            + ln("Beba bastante líquido. Não tome AAS nem anti-inflamatório.", 25.2, "s") + ln("Envie para quem está com dengue.", 27.8, "e")
            + ln("Fonte: Ministério da Saúde.", 28.4, "fonte")))

REELS = [
 dict(slug="2026-10-03-infarto-na-mulher", html=infarto, dur=33.0, capa=1.0, folha=(0.0, 3.6, 7.8, 12.4, 16.4, 20.6, 25.0, 32.4),
      acordes=[("D2", "D3", "A3", "F4", "C4"), ("G2", "G3", "D4", "B3", "F4"), ("C2", "C3", "G3", "E4", "B3"), ("A2", "A3", "E3", "C4", "G4")]),
 dict(slug="2026-10-03-dengue-febre-baixou-v2", html=dengue, dur=31.4, capa=2.9, folha=(0.0, 2.9, 7.6, 10.6, 14.6, 20.8, 24.6, 30.8),
      acordes=[("A2", "A3", "E3", "C4", "G4"), ("F2", "F3", "A3", "C4", "E4"), ("C2", "C3", "G3", "E4", "B3"), ("G2", "G3", "D4", "B3", "E4")]),
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
            n = len(r["folha"])
            sh = Image.new("RGB", (432 * n + 16 * (n + 1), 768 + 32), (120, 120, 120))
            for i, t in enumerate(r["folha"]):                                  # folha de conferência
                pg.evaluate(seek, t * 1000); pg.screenshot(path=str(frames / "f.png"))
                sh.paste(Image.open(frames / "f.png").convert("RGB").resize((432, 768), Image.LANCZOS), (16 + i * 448, 16))
            sh.save(HERE / f"_folha-{r['slug']}.jpg", quality=88)
            if "--folha" in only: f.unlink(); continue
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
