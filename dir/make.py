#!/usr/bin/env python3
# Três direções visuais para o mesmo post (capa + slide interno), 1080 x 1350.
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image

HERE = Path(__file__).resolve().parent
F = (HERE / "fonts").as_uri()

BASE = f"""
@font-face{{font-family:'Playfair';src:url('{F}/Playfair.ttf');font-weight:400 900;font-style:normal}}
@font-face{{font-family:'Playfair';src:url('{F}/Playfair-Italic.ttf');font-weight:400 900;font-style:italic}}
@font-face{{font-family:'ISerif';src:url('{F}/ISerif.ttf');font-style:normal}}
@font-face{{font-family:'ISerif';src:url('{F}/ISerif-Italic.ttf');font-style:italic}}
@font-face{{font-family:'Hanken';src:url('{F}/Hanken.ttf');font-weight:100 900}}
@font-face{{font-family:'ISans';src:url('{F}/ISans.ttf');font-weight:400 700;font-stretch:75% 100%}}
*{{box-sizing:border-box}} html,body{{margin:0}}
body{{width:1080px;height:1350px;overflow:hidden;position:relative;-webkit-font-smoothing:antialiased;
  background:var(--bg);color:var(--fg);font-family:var(--body)}}
.pad{{position:absolute;inset:96px 96px 88px 96px;display:flex;flex-direction:column}}
.top{{display:flex;justify-content:space-between;align-items:baseline;font:var(--lab);color:var(--soft);letter-spacing:var(--labls)}}
.foot{{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;font:var(--sig);color:var(--soft)}}
.foot b{{display:block;color:var(--fg);font:var(--name)}}
.rule{{height:var(--rh);background:var(--accent);width:var(--rw);margin:var(--rm)}}
h1{{margin:0;font:var(--h1);letter-spacing:var(--h1ls);text-wrap:balance}}
h1 em{{font-style:var(--em);color:var(--emc)}}
.deck{{font:var(--deck);color:var(--soft);margin:0;max-width:820px}}
h2{{margin:0 0 56px;font:var(--h2);letter-spacing:var(--h1ls)}}
.row{{display:grid;grid-template-columns:1fr;row-gap:8px;padding:34px 0;border-top:var(--line)}}
.row:last-of-type{{border-bottom:var(--line)}}
.row .l{{font:var(--rl);color:var(--soft);letter-spacing:var(--labls)}}
.row .v{{font:var(--rv)}}
.row .s{{font:var(--rs);color:var(--soft)}}
.note{{font:var(--rs);color:var(--soft);margin-top:40px;line-height:1.35}}
.dot{{display:inline-block;width:14px;height:14px;border-radius:50%;margin-right:16px;vertical-align:middle;position:relative;top:-3px}}
"""

DIRS = {
    "A": {  # Clássico: verde-escuro e marfim, serifada tradicional
        "cover": "--bg:#16302A;--fg:#F2EFE5;--soft:#AFBDB3;--accent:#B89A5E;--emc:#F2EFE5;",
        "inner": "--bg:#F2EFE5;--fg:#16302A;--soft:#5F6E66;--accent:#B89A5E;--emc:#16302A;",
        "type": "--body:'ISans',sans-serif;--lab:500 27px/1 'ISans';--labls:.02em;--sig:400 26px/1.3 'ISans';--name:500 30px/1.3 'Playfair';"
                "--h1:500 104px/1.06 'Playfair';--h1ls:-.012em;--em:italic;--deck:400 42px/1.35 'ISans';--h2:500 72px/1.1 'Playfair';"
                "--rl:500 30px/1 'ISans';--rv:500 54px/1.15 'Playfair';--rs:400 34px/1.3 'ISans';--line:1.5px solid #CFCABA;"
                "--rh:3px;--rw:88px;--rm:44px 0 40px;",
        "line_cover": "1.5px solid #3A5249",
    },
    "B": {  # Clínico: branco, grafite e azul acinzentado, sem serifa leve
        "cover": "--bg:#FFFFFF;--fg:#1D2730;--soft:#6F7C86;--accent:#5F86A0;--emc:#5F86A0;",
        "inner": "--bg:#F5F7F8;--fg:#1D2730;--soft:#6F7C86;--accent:#5F86A0;--emc:#5F86A0;",
        "type": "--body:'Hanken',sans-serif;--lab:500 27px/1 'Hanken';--labls:.01em;--sig:400 26px/1.3 'Hanken';--name:600 29px/1.3 'Hanken';"
                "--h1:300 108px/1.05 'Hanken';--h1ls:-.03em;--em:normal;--deck:400 42px/1.35 'Hanken';--h2:400 70px/1.1 'Hanken';"
                "--rl:500 30px/1 'Hanken';--rv:500 52px/1.15 'Hanken';--rs:400 34px/1.3 'Hanken';--line:1.5px solid #D8DEE2;"
                "--rh:6px;--rw:64px;--rm:48px 0 40px;",
        "line_cover": "1.5px solid #D8DEE2",
    },
    "C": {  # Vinho: bordô e areia, serifada contemporânea com itálico
        "cover": "--bg:#42121F;--fg:#F0E8DD;--soft:#C9ADA6;--accent:#C79A86;--emc:#E7C3B2;",
        "inner": "--bg:#F0E8DD;--fg:#42121F;--soft:#7C5F5C;--accent:#A8705C;--emc:#8C3A45;",
        "type": "--body:'ISans',sans-serif;--lab:500 27px/1 'ISans';--labls:.02em;--sig:400 26px/1.3 'ISans';--name:400 34px/1.2 'ISerif';"
                "--h1:400 124px/1.0 'ISerif';--h1ls:-.015em;--em:italic;--deck:400 42px/1.35 'ISans';--h2:400 84px/1.05 'ISerif';"
                "--rl:500 30px/1 'ISans';--rv:400 62px/1.1 'ISerif';--rs:400 34px/1.3 'ISans';--line:1.5px solid #D8C9BA;"
                "--rh:2px;--rw:100%;--rm:48px 0 40px;",
        "line_cover": "1.5px solid #6A3340",
    },
}

COVER = """<div class='pad'><div class='top'><span>Entenda seu exame</span><span>1 / 8</span></div>
<div style='margin-top:auto'><h1>{h1}</h1><div class='rule'></div><p class='deck'>A diretriz brasileira mudou em 2025. O que isso quer dizer para você.</p></div>
<div class='foot' style='margin-top:86px'><span><b>Gustavo Calado</b>Acadêmico de medicina</span><span>arraste</span></div></div>"""

INNER = """<div class='pad'><div class='top'><span>Entenda seu exame</span><span>3 / 8</span></div>
<div style='margin-top:84px'><h2>A nova classificação</h2>
<div class='row'><div class='l'><i class='dot' style='background:#4E8B6E'></i>Normal</div><div class='v'>Abaixo de 12 por 8</div><div class='s'>menos de 120/80 mmHg</div></div>
<div class='row'><div class='l'><i class='dot' style='background:#C99A3C'></i>Pré-hipertensão</div><div class='v'>De 12 por 8 até quase 14 por 9</div><div class='s'>120 a 139 / 80 a 89 mmHg</div></div>
<div class='row'><div class='l'><i class='dot' style='background:#B4533F'></i>Hipertensão</div><div class='v'>14 por 9 ou mais</div><div class='s'>140/90 mmHg ou mais</div></div>
<p class='note'>Se os dois números caírem em faixas diferentes, vale a mais alta.</p></div>
<div class='foot'><span><b>Gustavo Calado</b>Acadêmico de medicina</span><span></span></div></div>"""

H1 = {
    "A": "<em>12 por 8</em> ainda é pressão normal?",
    "B": "12 por 8 ainda é <em>pressão normal?</em>",
    "C": "12 por 8 ainda é <em>pressão normal?</em>",
}

with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width": 1080, "height": 1350}, device_scale_factor=1)
    for k, d in DIRS.items():
        shots = []
        for kind, body in (("cover", COVER.format(h1=H1[k])), ("inner", INNER)):
            html = f"<!doctype html><html><head><meta charset='utf-8'><style>{BASE}</style></head><body style=\"{d[kind]}{d['type']}\">{body}</body></html>"
            f = HERE / f"_{k}_{kind}.html"
            f.write_text(html, encoding="utf-8")
            pg.goto(f.as_uri()); pg.evaluate("document.fonts.ready")
            png = HERE / f"_{k}_{kind}.png"
            pg.screenshot(path=str(png)); shots.append(png); f.unlink()
        gap = 36
        sheet = Image.new("RGB", (1080 * 2 + gap * 3, 1350 + gap * 2), (228, 228, 226))
        for i, s in enumerate(shots):
            sheet.paste(Image.open(s), (gap + i * (1080 + gap), gap)); s.unlink()
        sheet = sheet.resize((sheet.width * 2 // 3, sheet.height * 2 // 3), Image.LANCZOS)
        sheet.save(HERE / f"direcao-{k}.jpg", "JPEG", quality=90)
        print("ok", k)
    b.close()
