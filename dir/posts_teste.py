#!/usr/bin/env python3
# Primeiros posts de teste (03/10/2026): carrossel C (pressão 12 por 8, 7 slides) e carrossel B (glicemia de jejum, 5 slides).
# Reaproveita os estilos de make3.py (tudo o que vem antes da linha "jobs = [").
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image

HERE = Path(__file__).resolve().parent
exec((HERE / "make3.py").read_text(encoding="utf-8").split("jobs = [")[0], globals())
OUT = HERE.parent / "midia"

def top(serie):
    return f"<div class='top'><i>{serie}</i></div>"

# ------------------------------------------------------------------ carrossel C: pressão 12 por 8
LINE7 = ("M -40 1128 C 250 1128, 520 1140, 668 1112 C 800 1086, 944 1030, 944 936 C 944 868, 880 852, 846 866 C 818 878, 806 902, 800 930 "
         "C 794 902, 780 876, 750 866 C 706 852, 652 880, 652 944 C 652 1030, 748 1086, 806 1150 C 850 1196, 960 1150, 1120 1128 "
         "C 1300 1104, 1420 1128, 1520 1128 L 1610 1128 L 1650 1040 L 1700 1196 L 1746 1128 "            # 2: pulso
         "C 1900 1128, 2040 1150, 2200 1128 "
         "C 2400 1106, 2620 1172, 2860 1154 C 3000 1144, 3120 1124, 3260 1128 "                           # 3: onda
         "C 3500 1140, 3700 1150, 3820 1112 C 3904 1084, 3904 1012, 3842 1012 C 3780 1012, 3780 1092, 3862 1122 "
         "C 3980 1162, 4160 1140, 4340 1128 "                                                             # 4: laço
         "C 4440 1128, 4540 1128, 4640 1128 L 4672 1062 L 4712 1182 L 4748 1128 L 4900 1128 L 4932 1062 L 4972 1182 L 5008 1128 "
         "C 5200 1128, 5300 1140, 5420 1128 "                                                             # 5: dois pulsos
         "C 5700 1120, 5900 1150, 6100 1140 C 6260 1132, 6380 1124, 6500 1128 "                           # 6: quase reta
         "C 6740 1098, 6880 1160, 7020 1150 C 7180 1140, 7280 1176, 7464 1168")                          # 7: sublinhado
def line7(i, color):
    return (f"<svg style='position:absolute;left:0;top:0' width='1080' height='1350' viewBox='{i*1080} 0 1080 1350' fill='none'>"
            f"<path d='{LINE7}' stroke='{color}' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'/></svg>")

C2_CSS = C_CSS + """
.t2{position:absolute;left:96px;right:96px;top:186px}
.t2 h1{font:400 168px/.93 'Serif';letter-spacing:-.026em} .t2 h1 i{font-style:italic}
.t2 p{font:400 44px/1.3 'Sans';margin-top:46px;opacity:.9;max-width:870px} .t2 p b{font-weight:700}
.fx h2{position:absolute;left:96px;top:176px;font:400 124px/.95 'Serif';letter-spacing:-.022em}
.faixas{position:absolute;left:96px;right:96px;top:344px;list-style:none;margin:0;padding:0}
.faixas li{padding:26px 0 28px;border-top:1.5px solid rgba(244,237,223,.28)}
.faixas li:last-child{border-bottom:1.5px solid rgba(244,237,223,.28)}
.faixas b{display:block;font:italic 400 78px/1 'Serif'}
.faixas span{display:block;font:400 41px/1.2 'Sans';margin-top:14px}
.faixas small{display:block;font:400 30px/1.2 'Sans';margin-top:8px;opacity:.66}
.faixas li.on b{color:var(--gold)}
.fim2 h2{position:absolute;left:96px;top:176px;font:400 124px/.95 'Serif';letter-spacing:-.022em}
.fim2 h2 i{font-style:italic}
.lst2{position:absolute;left:96px;right:96px;top:352px;list-style:none;margin:0;padding:0}
.lst2 li{font:400 41px/1.28 'Sans';padding:26px 0;border-top:1.5px solid rgba(244,237,223,.28)}
.lst2 li:last-child{border-bottom:1.5px solid rgba(244,237,223,.28)} .lst2 b{font-weight:700}
.env2{position:absolute;left:96px;right:96px;top:912px;font:italic 400 56px/1.08 'Serif'}
"""
SERIE_C = top("Entenda seu exame")
def pg(n, total): return f"<div class='pg'>{n}/{total}</div>"
C = [
 ("green", SERIE_C + line7(0, "var(--gold)") +
  "<div class='t'><h1>Sua<br>pressão é<br><i>12 por 8?</i></h1><p>Ela acabou de ganhar outro nome.<br>E não é “normal”.</p></div>"),
 ("paperbg", SERIE_C + line7(1, "var(--g)") +
  "<div class='big'><div class='lab'>Desde 2025, quem mede</div><div class='n'>12 por 8</div>"
  "<h2>está em pré-hipertensão.</h2><p>É o que diz a nova diretriz brasileira de hipertensão arterial.</p></div>" + pg(2, 7)),
 ("green fx", SERIE_C + line7(2, "var(--gold)") +
  "<h2>A nova régua</h2><ul class='faixas'>"
  "<li><b>Normal</b><span>Abaixo de 12 por 8</span><small>menos de 120/80 mmHg</small></li>"
  "<li class='on'><b>Pré-hipertensão</b><span>De 12 por 8 até quase 14 por 9</span><small>120 a 139 / 80 a 89 mmHg</small></li>"
  "<li><b>Hipertensão</b><span>14 por 9 ou mais</span><small>140/90 mmHg ou mais</small></li></ul>" + pg(3, 7)),
 ("paperbg", SERIE_C + line7(3, "var(--g)") +
  "<div class='t2'><h1>Ainda não é<br><i>hipertensão.</i></h1>"
  "<p>É um aviso. A hora de cuidar dos hábitos é agora: peso, sal, atividade física, álcool e cigarro.</p></div>" + pg(4, 7)),
 ("green", SERIE_C + line7(4, "var(--gold)") +
  "<div class='t2'><h1>Uma medida<br>só <i>não fecha</i><br>diagnóstico.</h1>"
  "<p>Hipertensão é 14 por 9 ou mais em medidas repetidas, em pelo menos <b>duas consultas</b>. Deu alta uma vez? Meça de novo em outro dia.</p></div>" + pg(5, 7)),
 ("paperbg", SERIE_C + line7(5, "var(--g)") +
  "<div class='t2'><h1>Pressão alta<br>quase nunca<br><i>avisa.</i></h1>"
  "<p>Os sintomas costumam aparecer só quando ela sobe muito. A partir dos 20 anos, meça <b>pelo menos uma vez por ano</b>. Com pressão alta na família, duas.</p></div>" + pg(6, 7)),
 ("green fim2", SERIE_C + line7(6, "var(--gold)") +
  "<h2>Para <i>guardar</i></h2>"
  "<ul class='lst2'><li>12 por 8 agora se chama <b>pré-hipertensão</b>: é um aviso, ainda não é hipertensão.</li>"
  "<li>Hipertensão só se confirma com 14 por 9 ou mais em <b>duas consultas</b>.</li>"
  "<li>Meça <b>uma vez por ano</b>, mesmo sem sentir nada.</li></ul>"
  "<div class='env2'>Envie para quem ainda acha<br>que 12 por 8 é perfeito.</div>"
  "<div class='src'>Fontes: Diretriz Brasileira de Hipertensão Arterial 2025 (SBC, SBH, SBN); Ministério da Saúde. Conteúdo educativo, não substitui consulta.</div>" + pg(7, 7)),
]

# ------------------------------------------------------------------ carrossel B: glicemia de jejum
B2_CSS = B_CSS + """
.green .row{border-top-color:rgba(244,237,223,.28)}
.in .und{display:block;margin:14px 0 0 -6px}
.rows.solo{margin-top:74px} .rows.solo .row{padding:38px 0}
.rows.solo .row:last-child{border-bottom:2px solid rgba(244,237,223,.28)}
.in .pen.solta{position:absolute;right:0;top:118px;font-size:74px;transform:rotate(-5deg)}
"""
SERIE_B = top("Entenda seu exame")
def regua(z, l1, l2, circ_html, pen_html):
    return ("<div class='regua'><div class='line'></div>"
            + "".join(f"<div class='mini' style='left:{x}%'></div>" for x in (8.3, 16.6, 25, 41.6, 50, 58.3, 75, 83.3, 91.6)) +
            "<div class='tk' style='left:33.3%'></div><div class='tk' style='left:66.6%'></div>"
            f"<div class='zone' style='left:16.6%'>{z[0]}</div><div class='zone' style='left:50%'>{z[1]}</div><div class='zone' style='left:83.3%'>{z[2]}</div>"
            f"<div class='lb' style='left:33.3%'>{l1}</div><div class='lb' style='left:66.6%'>{l2}</div>" + circ_html + pen_html + "</div>")
def rows(items, extra=""):
    return f"<div class='rows {extra}'>" + "".join(f"<div class='row'><b>{a}<span>{b}</span></b><p>{c}</p></div>" for a, b, c in items) + "</div>"
ZON = ("normal", "pré-diabetes", "diabetes")
UND = ("<svg class='und' width='520' height='26' viewBox='0 0 520 26' fill='none'><path d='M6 16 C 120 4, 300 22, 514 8' "
       "stroke='var(--gold)' stroke-width='5' stroke-linecap='round'/></svg>")
B = [
 ("green", SERIE_B +
  "<div class='t'><h1>99 é normal.<br>E 100?</h1><p>O que o número da sua glicemia de jejum quer dizer.</p></div>"
  "<div class='laudo'><div class='hd'>GLICEMIA DE JEJUM<span>sangue, coleta pela manhã</span></div>"
  "<div class='r'><span>Glicose</span><u></u><span>100 mg/dL</span></div>"
  "<div class='r'><span>Jejum</span><u></u><span>10 horas</span></div>"
  "<div class='res'><span>Resultado</span><span class='val'>100" + circle(240, 150).replace("class='circ'", "class='circ' style='left:-54px;top:-36px'") + "</span></div>"
  "<div class='pen note'>normal?</div>"
  "<svg class='arrow' width='150' height='120' viewBox='0 0 150 120' fill='none'><path d='M140 78 C 96 96, 44 76, 22 18 M22 18 L 16 52 M22 18 L 50 34' stroke='var(--pen)' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/></svg>"
  "</div>"),
 ("paperbg", SERIE_B +
  "<div class='in'><h2>As três faixas da<br>glicemia de jejum.</h2>"
  + regua(ZON, "100", "126",
          circle(170, 92, 5).replace("class='circ'", "class='circ' style='left:calc(33.3% - 85px)'"),
          "<div class='pen' style='left:calc(33.3% - 120px)'>já é pré-diabetes</div>")
  + rows([("Normal", "abaixo de 100 mg/dL", "Poucos fatores de risco? Repita em 3 anos."),
          ("Pré-diabetes", "100 a 125 mg/dL", "É um aviso. Hora de reavaliar em 12 meses."),
          ("Diabetes", "126 mg/dL ou mais", "Precisa de confirmação com outro exame.")])
  + "</div><div class='foot'><span>Valores de glicemia de jejum, em mg/dL.</span><span>2/5</span></div>"),
 ("paperbg", SERIE_B +
  "<div class='in'><h2>A outra régua:<br>hemoglobina glicada.</h2>"
  + regua(ZON, "5,7%", "6,5%",
          circle(190, 92, 5).replace("class='circ'", "class='circ' style='left:calc(66.6% - 95px)'"),
          "<div class='pen' style='left:calc(66.6% - 250px)'>no laudo: HbA1c</div>")
  + rows([("Normal", "abaixo de 5,7%", "Dentro do esperado."),
          ("Pré-diabetes", "5,7% a 6,4%", "Mesmo aviso: reavaliar em 12 meses."),
          ("Diabetes", "6,5% ou mais", "Com jejum de 126 ou mais, fecha o diagnóstico.")])
  + "</div><div class='foot'><span>Os dois exames são usados no diagnóstico.</span><span>3/5</span></div>"),
 ("green", SERIE_B +
  "<div class='in'><h2>Antes de<br>se preocupar" + UND + "</h2>"
  + rows([("Repita", "um exame só não basta", "Se só um exame veio alterado, ele deve ser repetido para confirmar."),
          ("Jejum certo", "de 8 a 12 horas", "Sem nada que tenha caloria. Água pode."),
          ("Quem faz", "a partir dos 35 anos", "Antes disso, se houver excesso de peso e mais um fator de risco.")], "solo")
  + "</div><div class='foot'><span>Quem interpreta o seu caso é o médico.</span><span>4/5</span></div>"),
 ("green", SERIE_B + "<div class='fim'><h2>Para guardar</h2></div>"
  "<div class='bil'><ul>"
  f"<li>{tick()}<span>Glicemia de jejum normal é <b>abaixo de 100</b>.</span></li>"
  f"<li>{tick()}<span>De 100 a 125 é <b style='white-space:nowrap'>pré-diabetes</b>: um aviso para reavaliar em 12 meses.</span></li>"
  f"<li>{tick()}<span><b>126 ou mais</b> aponta para diabetes, mas precisa de confirmação.</span></li>"
  f"<li>{tick()}<span>Um exame alterado sozinho <b>não fecha diagnóstico</b>.</span></li></ul></div>"
  "<div class='envie'>Envie para quem pegou o exame<br>e ficou na dúvida.</div>"
  "<div class='src'>Fonte: Diretriz da Sociedade Brasileira de Diabetes, Diagnóstico de diabetes mellitus. Conteúdo educativo, não substitui consulta.</div><div class='pg'>5/5</div>"),
]

POSTS = {"2026-10-03-pressao-12-por-8": (C2_CSS, C), "2026-10-03-glicemia-de-jejum": (B2_CSS, B)}
only = sys.argv[1:]
with sync_playwright() as pw:
    b = pw.chromium.launch()
    p = b.new_page(viewport={"width": 1080, "height": 1350}, device_scale_factor=1)
    for slug, (css, slides) in POSTS.items():
        if only and not any(o in slug for o in only): continue
        d = OUT / slug; d.mkdir(parents=True, exist_ok=True)
        for i, (cls, body) in enumerate(slides, 1):
            f = HERE / f"_s{i}.html"; f.write_text(page(css, cls, body), encoding="utf-8")
            p.goto(f.as_uri()); p.evaluate("document.fonts.ready"); p.wait_for_timeout(150)
            p.screenshot(path=str(d / f"{i:02d}.png")); f.unlink()
            Image.open(d / f"{i:02d}.png").convert("RGB").save(d / f"{i:02d}.jpg", "JPEG", quality=93); (d / f"{i:02d}.png").unlink()
        g, n = 24, len(slides)
        sh = Image.new("RGB", (1080 * n + g * (n + 1), 1350 + g * 2), (232, 230, 226))
        for i in range(n): sh.paste(Image.open(d / f"{i+1:02d}.jpg"), (g + i * (1080 + g), g))
        sh.save(HERE / f"_folha-{slug}.jpg", "JPEG", quality=88)
    b.close()
print("ok")
