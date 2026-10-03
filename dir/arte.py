#!/usr/bin/env python3
# Sistema de arte da segunda rodada (03/10/2026), feito a partir do retorno dele sobre o primeiro lote:
# - desenho que EXPLICA (com legenda), dentro de um quadro, no lugar de enfeite; desenhos variados e de saúde
#   (bexiga, vaso, vesícula, aparelho de pressão, estetoscópio...), não só coração e gota;
# - uma capa por série (opção C que ele escolheu);
# - posição do texto variada (em cima, no centro, embaixo);
# - tipos de letra para testar (Instrument Serif é a atual; Fraunces, Playfair e DM Serif são os testes).
# Desenhos: Healthicons (MIT) em dir/icones/healthicons, Tabler Icons (MIT) em dir/icones/tabler, e os próprios, abaixo.
import re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "perfil"))
import perfil as P

F = (HERE / "fonts").as_uri()
FONTES = P.FONTS + f"""
@font-face{{font-family:'Fraunces';src:url('{F}/Fraunces.woff2');font-style:normal}}
@font-face{{font-family:'Fraunces';src:url('{F}/Fraunces-Italic.woff2');font-style:italic}}
@font-face{{font-family:'PlayfairD';src:url('{F}/Playfair.woff2');font-style:normal}}
@font-face{{font-family:'PlayfairD';src:url('{F}/Playfair-Italic.woff2');font-style:italic}}
@font-face{{font-family:'DMSerif';src:url('{F}/DMSerif.woff2');font-style:normal}}
@font-face{{font-family:'DMSerif';src:url('{F}/DMSerif-Italic.woff2');font-style:italic}}
"""
# cada letra pede um aperto, uma entrelinha e um tamanho diferentes para ocupar o mesmo espaço na página
LETRAS = {
 "instrument": ("'Serif'", "-.024em", ".95", 1.0, "Instrument Serif (a atual)"),
 "fraunces":   ("'Fraunces'", "-.035em", "1", .80, "Fraunces"),
 "playfair":   ("'PlayfairD'", "-.025em", "1.03", .78, "Playfair Display"),
 "dmserif":    ("'DMSerif'", "-.02em", "1.02", .80, "DM Serif Display"),
}

def _miolo(conj, nome):
    s = (HERE / "icones" / conj / f"{nome}.svg").read_text(encoding="utf-8")
    return re.sub(r"^.*?<svg[^>]*>", "", s, count=1, flags=re.S).rsplit("</svg>", 1)[0]

def tb(nome, px, cls=""):
    # Tabler: traço fino do conjunto engrossado para ficar com o mesmo peso dos Healthicons
    return (f"<svg class='ico {cls}' width='{px}' height='{px}' viewBox='0 0 24 24' fill='none' stroke='currentColor' "
            f"stroke-width='1.05' stroke-linecap='round' stroke-linejoin='round'>{_miolo('tabler', nome)}</svg>")

def hi(nome, px, extra="", cls=""):
    # Healthicons (48x48, já em contorno). "extra" desenha por cima, nas mesmas coordenadas.
    return f"<svg class='ico {cls}' width='{px}' height='{px}' viewBox='0 0 48 48' fill='none'>{_miolo('healthicons', nome)}{extra}</svg>"

def svg(vw, vh, px, inner, sw=None, extra=""):
    sw = sw if sw is not None else 1.05 * vw / 24
    return (f"<svg class='ico' width='{px}' height='{px * vh / vw:.0f}' viewBox='0 0 {vw} {vh}' fill='none' stroke='currentColor' "
            f"stroke-width='{sw:.3f}' stroke-linecap='round' stroke-linejoin='round' {extra}>{inner}</svg>")

# ------------------------------------------------------------------ desenhos próprios (mesmo peso de traço dos conjuntos)
def rosto(px, tipo="torto"):
    base = "<circle cx='12' cy='12' r='9'/>"
    if tipo == "torto":      # AVC: um lado da boca cai
        return svg(24, 24, px, base + "<path d='M9 10 h.01'/><path d='M14.2 9.6 l1.9 .7'/><path d='M8.4 14.2 q2.4 2.6 4.4 1.3 q1.7 -1 3 1.3'/>")
    return svg(24, 24, px, base + "<path d='M9 10 h.01 M15 10 h.01'/><path d='M9 14.6 q3 2.4 6 0'/>")

def tonto(px):
    # tontura: o corpo inclina e o mundo roda
    return svg(26, 24, px, "<g transform='rotate(14 13 22)'><circle cx='13' cy='5.4' r='2.2'/><path d='M13 7.8 v7.2'/><path d='M13 10 l-4.6 2.6 M13 10 l4.6 2.2'/>"
               "<path d='M13 15 l-2.4 6 M13 15 l2.8 5.8'/></g><path d='M3.2 4.6 q-1.6 -2.6 1.2 -3 q2.4 -.2 2 2' /><path d='M22.6 6.4 q2.2 -1.4 1 -3.4'/><path d='M2 22.6 h22' opacity='.5'/>")

def mao_formiga(px):
    return svg(26, 26, px, "<g transform='translate(1 2)'><path d='M8 13v-7.5a1.5 1.5 0 0 1 3 0v6.5'/><path d='M11 5.5v-2a1.5 1.5 0 1 1 3 0v8.5'/><path d='M14 5.5a1.5 1.5 0 0 1 3 0v6.5'/>"
               "<path d='M17 7.5a1.5 1.5 0 0 1 3 0v8.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7a69.74 69.74 0 0 1 -.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47'/></g>"
               "<path d='M3.4 3.6 l1.2 1.4 M6.4 1.4 l.4 1.8 M1.4 7 l1.8 .6'/><path d='M23.4 3 l-1 1.5 M25 6.4 l-1.7 .5'/>")

def bracos(px):
    # teste do abraço: um dos braços não sustenta
    return svg(24, 24, px, "<circle cx='12' cy='5' r='2.2'/><path d='M12 7.4 v7.6'/><path d='M12 9.6 h-7.4'/><path d='M12 9.6 l6.2 3.6'/>"
               "<path d='M12 15 l-2.6 6'/><path d='M12 15 l2.6 6'/><path d='M21 7.6 v3.6 m-1.5 -1.5 l1.5 1.5 l1.5 -1.5' opacity='.8'/>")

def fala(px):
    # fala enrolada: o balão com rabisco no lugar das palavras
    return svg(24, 24, px, "<path d='M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12'/>"
               "<path d='M7.2 9.2 q.9 -1.5 1.8 0 t1.8 0 t1.8 0 t1.8 0 t1.8 0'/><path d='M7.2 13 q.9 1.5 1.8 0 t1.8 0 t1.8 0'/>")

def vaso(px, cheio):
    # um trecho de vaso: com muito sal, mais líquido dentro e a parede empurrada para fora
    if cheio:
        paredes = "<path d='M1 7 C 14 3, 34 3, 47 7'/><path d='M1 21 C 14 25, 34 25, 47 21'/>"
        gotas = [(5, 14), (9.5, 10.6), (10, 17.4), (14.5, 14), (19, 9.4), (19.5, 18.6), (24, 14), (28.5, 9.4), (29, 18.6), (33.5, 14), (38, 10.6), (38.5, 17.4), (43, 14), (24, 7.6), (24, 20.4)]
        setas = "".join(f"<path d='M{x} 2.6 l1.6 -1.8 l1.6 1.8'/><path d='M{x} 25.4 l1.6 1.8 l1.6 -1.8'/>" for x in (10.4, 22.4, 34.4))
    else:
        paredes = "<path d='M1 7 H47'/><path d='M1 21 H47'/>"
        gotas = [(7, 14), (15, 11.4), (23, 16.4), (31, 11.8), (39, 15.6)]
        setas = ""
    g = "".join(f"<circle cx='{x}' cy='{y}' r='1.25' fill='currentColor' stroke='none'/>" for x, y in gotas)
    return svg(48, 28, px, paredes + g + setas, sw=1.2)

def postura(px, marcas=(("costas", "1"), ("braco", "2"), ("pes", "3"))):
    # sentada, costas apoiadas, pés no chão, braço apoiado na mesa com a braçadeira na altura do coração
    pos = {"costas": (4.4, 14.4), "braco": (17.6, 8.2), "pes": (25.8, 25.4)}
    m = "".join(f"<circle cx='{pos[k][0]}' cy='{pos[k][1]}' r='1.9' fill='var(--marca)' stroke='none'/>"
                f"<text x='{pos[k][0]}' y='{pos[k][1] + 1}' text-anchor='middle' font-family='Sans' font-weight='700' font-size='2.7' fill='var(--marca-t)' stroke='none'>{n}</text>" for k, n in marcas)
    cor = "var(--marca)" if any(k == "braco" for k, _ in marcas) else "currentColor"
    return svg(40, 30, px,
        "<path d='M2 28.4 H38' opacity='.55'/>"
        "<path d='M7 9 V20.6 H18 M8.2 20.6 V28.2 M16.8 20.6 V28.2'/>"
        "<circle cx='11.6' cy='5.6' r='2.5'/>"
        "<path d='M11.2 8.4 L9 19.2 H19.6 V27.4 H23'/>"
        "<path d='M11.4 10.6 L16.2 14.6 L24.4 13.6'/>"
        f"<path d='M12.6 10.4 l2.6 2.2' stroke-width='2.7' stroke='{cor}'/>"
        "<path d='M21 14.8 H37 M34.4 14.8 V28.2'/>"
        "<rect x='27.4' y='10.6' width='5.6' height='4.2' rx='.8'/>"
        "<path d='M3 11.4 H26' stroke-dasharray='1.3 1.5' stroke-width='.4' opacity='.8'/>" + m, sw=.62)

def corpo(px, extra=""):
    # tronco de frente, para marcar onde o sinal aparece
    return svg(24, 28, px, "<circle cx='12' cy='4.6' r='3'/><path d='M10.7 7.4 v1.4 M13.3 7.4 v1.4'/>"
               "<path d='M10.7 8.8 C 7.2 9.4, 4.6 10.6, 4.4 14.2 V22.4 M13.3 8.8 C 16.8 9.4, 19.4 10.6, 19.6 14.2 V22.4'/>"
               "<path d='M7.6 14.2 V26.6 M16.4 14.2 V26.6'/>" + extra)

def marca(x, y, r=2.9):
    # o ponto que pulsa: onde dói
    return (f"<circle cx='{x}' cy='{y}' r='{r}' stroke='var(--marca)' stroke-width='.7' stroke-dasharray='.1 1.5'/>"
            f"<circle cx='{x}' cy='{y}' r='{r * .42:.2f}' fill='var(--marca)' stroke='none'/>")

def seta(px=64):
    return svg(24, 24, px, "<path d='M4 12 H20 M14 6 l6 6 l-6 6'/>", sw=1.6)

def mais(px=64):
    return svg(24, 24, px, "<path d='M12 5 V19 M5 12 H19'/>", sw=1.6)

# ------------------------------------------------------------------ peças montadas (HTML)
def fluxo(itens, tam=170, sep="seta"):
    # sequência de desenhos com seta (ou sinal de mais) entre eles e uma frase curta embaixo de cada um
    partes = []
    for i, (des, rot) in enumerate(itens):
        if i: partes.append(f"<div class='fx-seta'>{seta() if sep == 'seta' else mais()}</div>")
        partes.append(f"<figure class='fx'>{des}<figcaption>{rot}</figcaption></figure>")
    return f"<div class='fluxo' style='--t:{tam}px'>{''.join(partes)}</div>"

def trio(itens):
    # desenhos lado a lado, cada um com a palavra-chave embaixo
    return f"<div class='trio' style='--n:{len(itens)}'>" + "".join(f"<figure>{d}<figcaption><b>{a}</b>{b}</figcaption></figure>" for d, a, b in itens) + "</div>"

def linha(itens, gap=56):
    return f"<div class='linha' style='gap:{gap}px'>" + "".join(itens) + "</div>"

def semana(feitos=5, texto="30 min"):
    dias = "STQQSSD"
    return "<div class='semana'>" + "".join(
        f"<div class='dia{' on' if i < feitos else ''}'><span>{d}</span>{'<b>' + texto + '</b>' if i < feitos else ''}</div>" for i, d in enumerate(dias)) + "</div>"

def pessoas(total, marcadas=1, nome="woman", px=150, por_linha=5):
    # "1 em cada 10": uma fileira de pessoas com as que contam destacadas
    return (f"<div class='pessoas' style='grid-template-columns:repeat({min(total, por_linha)},{px}px)'>"
            + "".join(hi(nome, px, cls="on" if i < marcadas else "off") for i in range(total)) + "</div>")

def rotulo(linhas, marca_, nota):
    # tabela nutricional de exemplo, no jeito dos rótulos brasileiros, com a linha do sódio marcada a caneta
    tr = "".join(f"<tr class='{'alvo' if n == marca_ else ''}'><td>{n}</td><td>{a}</td><td>{b}</td><td>{c}</td></tr>" for n, a, b, c in linhas)
    return (f"<div class='rot-wrap'><div class='rotulo'><div class='rt'>INFORMAÇÃO NUTRICIONAL</div><div class='rp'>Porção: 80 g (1 unidade)</div>"
            f"<table><tr><th></th><th>100 g</th><th>80 g</th><th>%VD*</th></tr>{tr}</table><div class='rn'>*Percentual de valores diários fornecidos pela porção.</div></div>"
            f"<div class='rnota'>{P.ARROW}<span class='pen'>{nota}</span></div></div>")

def lupa():
    return ("<div class='lupa'><svg width='150' height='150' viewBox='0 0 24 24' fill='none' stroke='#fff' stroke-width='2.4' stroke-linecap='round'>"
            "<circle cx='10' cy='10' r='6.2'/><path d='M14.8 14.8 L21 21'/></svg><div><small>ALTO EM</small><b>SÓDIO</b></div></div>")

def idades(faixas):
    # o que vale em cada faixa de idade
    return "<div class='idades'>" + "".join(f"<div class='fx-id'><b>{a}</b><span>{t}</span></div>" for a, t in faixas) + "</div>"

def regua(valor=7):
    return ("<div class='regua'>" + "".join(f"<i class='{'on' if n >= valor else ''}'>{n}</i>" for n in range(0, 11)) + "</div>")

# ------------------------------------------------------------------ estilos
def css(letra="instrument"):
    fam, ls, lh, esc, _ = LETRAS[letra]
    return FONTES + f"""
:root{{--tit:{fam};--ls:{ls};--lh:{lh};--esc:{esc}}}
body{{width:1080px;height:1350px;overflow:hidden;position:relative;font-family:'Sans',sans-serif;-webkit-font-smoothing:antialiased}}
body::after{{content:'';position:absolute;inset:0;background:url("{P.GRAIN}");opacity:.07;mix-blend-mode:overlay;pointer-events:none;z-index:9}}
.green{{background:var(--g);color:var(--cream);--line:var(--gold);--acc:var(--gold);--des:var(--gold);--rule:rgba(244,237,223,.26);--painel:rgba(244,237,223,.075);--marca:var(--cream);--marca-t:var(--g);--txt:var(--cream)}}
.cream{{background:var(--cream);color:var(--g);--line:var(--g);--acc:var(--pen);--des:var(--g);--rule:rgba(23,64,44,.2);--painel:rgba(23,64,44,.07);--marca:var(--pen);--marca-t:#fff;--txt:var(--g)}}
.gold{{background:var(--gold);color:var(--g);--line:var(--g);--acc:#0E2F20;--des:var(--g);--rule:rgba(23,64,44,.3);--painel:rgba(23,64,44,.1);--marca:#0E2F20;--marca-t:var(--gold);--txt:var(--g)}}
.serie{{position:absolute;left:96px;top:84px;font:italic 400 36px/1 var(--tit);opacity:.92;z-index:3}}
.pg{{position:absolute;right:96px;bottom:72px;font:400 30px/1 'Sans';opacity:.72}}
svg.line{{position:absolute;left:0;top:0}}
.ico{{display:block;flex:none}}
h1,h2{{font-family:var(--tit);font-weight:400;letter-spacing:var(--ls);line-height:var(--lh);text-wrap:balance}}
h2{{font-size:150px}} h2 i,h1 i{{font-style:italic}} h2 i{{color:var(--acc)}}
h1.nw,h2.nw{{white-space:nowrap}} .nb{{white-space:nowrap}}
p{{font:400 48px/1.3 'Sans';opacity:.94;text-wrap:pretty}}
.k{{font:600 34px/1 'Sans';letter-spacing:.08em;text-transform:uppercase;color:var(--acc);margin-bottom:24px}}

/* texto sozinho: em cima, no centro ou apoiado na linha */
.tx p{{margin-top:34px;max-width:888px}}
.topo{{position:absolute;left:96px;right:96px;top:176px}}
.base{{position:absolute;left:96px;right:96px;bottom:286px}}
.meio{{position:absolute;left:96px;right:96px;top:176px;height:888px;display:flex;flex-direction:column;justify-content:center}}

/* texto + desenho: uma coluna; o quadro do desenho ocupa o espaço que sobra */
.col{{position:absolute;left:96px;right:96px;top:176px;height:888px;display:flex;flex-direction:column;gap:46px}}
.col .tx{{flex:none}}
.fig{{flex:1 0 auto;min-height:250px;border-radius:34px;background:var(--painel);color:var(--des);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;padding:38px 40px;position:relative}}
.fig.lado{{flex-direction:row;gap:48px;justify-content:flex-start;padding-left:60px}}
.fig.limpo{{background:none;padding:0}} .fig.justo{{padding:26px 30px;gap:16px}}
.rot{{font:500 36px/1.22 'Sans';color:var(--txt);max-width:780px;text-align:center}}
.fig.lado .rot{{text-align:left;font-size:40px;line-height:1.24}}
.linha{{display:flex;align-items:center;justify-content:center}}
.fluxo{{display:flex;align-items:flex-start;gap:10px;width:100%}}
.fx{{margin:0;flex:1 1 0;display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center}}
.fx .ico{{width:var(--t);height:var(--t)}}
.fx figcaption{{font:500 34px/1.2 'Sans';color:var(--txt)}}
.fx-seta{{padding-top:calc(var(--t) / 2 - 32px);opacity:.8}}
.trio{{display:grid;grid-template-columns:repeat(var(--n),1fr);gap:22px;width:100%}}
.trio figure{{margin:0;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center}}
.trio figcaption{{font:400 34px/1.2 'Sans';color:var(--txt)}} .trio figcaption b{{display:block;font:italic 400 58px/1 var(--tit);letter-spacing:-.01em;color:var(--acc);margin-bottom:8px}}
.vasos{{display:flex;gap:44px;width:100%}} .vasos figure{{margin:0;flex:1;display:flex;flex-direction:column;align-items:center;gap:14px}} .vasos figcaption{{font:500 36px/1.2 'Sans';color:var(--txt)}}
.semana{{display:grid;grid-template-columns:repeat(7,1fr);gap:12px;width:100%}}
.dia{{height:250px;border:4px solid currentColor;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:20px 0 24px;opacity:.42}}
.dia span{{font:600 36px/1 'Sans'}} .dia b{{font:italic 400 46px/1 var(--tit);writing-mode:vertical-rl;transform:rotate(180deg);letter-spacing:0;font-weight:400}}
.dia.on{{opacity:1;background:var(--des);border-color:var(--des)}} .green .dia.on{{color:var(--g)}} .cream .dia.on,.gold .dia.on{{color:var(--cream)}}
.pessoas{{display:grid;gap:0;justify-content:center}} .pessoas .ico{{margin:-8px -18px}} .pessoas .off{{opacity:.36}} .pessoas .on{{color:var(--marca)}}
.rot-wrap{{display:flex;flex-direction:column;align-items:center}}
.rotulo{{position:relative;width:690px;zoom:.96;background:#fff;color:#111;border:5px solid #111;padding:14px 20px 12px;font-family:'UI',sans-serif;transform:rotate(-1.6deg);box-shadow:0 18px 38px rgba(0,0,0,.3)}}
.rt{{font:800 38px/1.1 'UI';border-bottom:5px solid #111;padding-bottom:9px}} .rp{{font:500 26px/1.3 'UI';padding:7px 0;border-bottom:3px solid #111}}
.rotulo table{{width:100%;border-collapse:collapse;font:500 28px/1.2 'UI'}} .rotulo th{{font-weight:700;text-align:right;padding:7px 0}}
.rotulo td{{padding:8px 0;border-top:1.5px solid #111;text-align:right}} .rotulo td:first-child{{text-align:left}}
.rotulo tr.alvo td{{font-weight:800;font-size:34px;position:relative}} .rotulo tr.alvo td:first-child::after{{content:'';position:absolute;left:-16px;top:-6px;width:672px;height:58px;border:5px solid var(--pen);border-radius:50%;transform:rotate(-1.2deg)}}
.rn{{font:400 20px/1.2 'UI';border-top:3px solid #111;padding-top:7px;margin-top:2px}}
.rnota{{display:flex;align-items:flex-start;gap:0;margin:8px 0 -6px 150px;color:var(--acc)}}
.rnota .pen{{font:400 100px/.8 'Pen';transform:rotate(-4deg);white-space:nowrap;margin-top:34px}}
.rnota .arrow{{width:104px;height:84px;margin-right:6px}} .rnota .arrow path{{stroke:var(--acc)}}
.lupa{{display:flex;align-items:center;gap:26px;background:#111;color:#fff;border-radius:22px;padding:26px 44px 26px 30px;border:6px solid #fff;box-shadow:0 20px 40px rgba(0,0,0,.28);transform:rotate(-2deg)}}
.lupa small{{display:block;font:800 44px/1 'UI';letter-spacing:.02em}} .lupa b{{display:block;font:800 112px/1 'UI';letter-spacing:.01em;margin-top:8px}}
.idades{{width:100%;align-self:stretch;display:flex;flex-direction:column;justify-content:center;flex:1}}
.fx-id{{display:grid;grid-template-columns:350px 1fr;align-items:center;gap:28px;padding:38px 0;border-top:2px solid var(--rule)}} .fx-id:last-child{{border-bottom:2px solid var(--rule)}}
.fx-id b{{font:italic 400 calc(112px * var(--esc))/1 var(--tit);letter-spacing:-.02em;font-weight:400;color:var(--acc);white-space:nowrap}} .fx-id span{{font:400 44px/1.26 'Sans';color:var(--txt)}}
.regua{{display:grid;grid-template-columns:repeat(11,1fr);gap:8px;width:100%}}
.regua i{{font:600 38px/1 'Sans';font-style:normal;text-align:center;padding:30px 0;border:4px solid currentColor;border-radius:14px;opacity:.45}}
.regua i.on{{opacity:1;background:var(--des)}} .green .regua i.on{{color:var(--g)}} .cream .regua i.on{{color:var(--cream)}}
.pen{{font-family:'Pen'}}

/* capas, uma por série */
.capa{{position:absolute;left:96px;right:60px;top:180px}}
.capa h1{{font-size:calc(212px * var(--esc));white-space:nowrap}}
.capa p{{font-size:46px;margin-top:40px;max-width:840px}}
.capa-des{{position:absolute;right:92px;bottom:262px;color:var(--des)}}
.sinais .painel{{position:absolute;left:0;top:0;width:1080px;height:600px;background:var(--cream);color:var(--g);display:flex;align-items:center;justify-content:center;gap:60px;padding-top:76px;--marca:var(--pen);--txt:var(--g)}}
.sinais .serie{{color:var(--g)}}
.sinais .faixa{{position:absolute;left:96px;right:70px;top:660px}}
.sinais .faixa h1{{font-size:calc(132px * var(--esc))}} .sinais .faixa p{{font-size:44px;margin-top:28px;max-width:870px}}
.num .q{{position:absolute;left:96px;right:96px;top:176px;font-family:var(--tit);font-size:calc(100px * var(--esc));line-height:1;letter-spacing:-.02em}}
.num .bx{{position:absolute;left:96px;right:96px;bottom:286px}}
.num .n{{font:italic 400 600px/.84 var(--tit);letter-spacing:-.045em;white-space:nowrap;margin-left:-18px;padding-bottom:.07em}}
.num .n small{{font-size:.33em;letter-spacing:-.02em;margin-left:.05em}} .num p{{font-size:46px;margin-top:22px;max-width:860px}}

/* lista curta e último slide */
.rows{{margin-top:40px}}
.row{{display:flex;align-items:center;gap:32px;padding:24px 0;border-top:1.5px solid var(--rule)}} .row .ico{{color:var(--des)}}
.row span{{font:400 46px/1.22 'Sans'}} .row span b{{font-weight:600}}
.fim .top{{position:absolute;left:96px;right:96px;top:170px}}
.fim h2{{font-size:calc(124px * var(--esc))}}
.fim ul{{list-style:none;margin:44px 0 0;padding:0}}
.fim li{{font:400 48px/1.25 'Sans';padding:30px 0;border-top:1.5px solid var(--rule)}} .fim li:last-child{{border-bottom:1.5px solid var(--rule)}}
.fim .pe{{position:absolute;left:96px;right:96px;top:1154px}}
.fim .env{{font:italic 400 54px/1.05 var(--tit);white-space:nowrap}}
.fim .src{{font:400 25px/1.3 'Sans';opacity:.72;margin-top:14px;max-width:740px}}
"""

FIT = """<script>
(async () => {
  await Promise.all([...document.fonts].map(f => f.load().catch(() => 0)));
  await document.fonts.ready;
  const esc = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--esc')) || 1;
  const avisa = t => { document.body.dataset.over = (document.body.dataset.over || '') + t + ' '; };
  for (const c of document.querySelectorAll('.capa')) {
    const h = c.querySelector('h1'), d = document.querySelector('.capa-des');
    let s = parseFloat(getComputedStyle(h).fontSize);
    const lim = d ? d.getBoundingClientRect().top - 30 : 1088;
    const big = () => h.scrollWidth > h.clientWidth || (d ? h.getBoundingClientRect().bottom > lim : c.getBoundingClientRect().bottom > lim);
    while (big() && s > 80) { s -= 3; h.style.fontSize = s + 'px'; }
    if (c.getBoundingClientRect().bottom > 1092) avisa('capa');
  }
  for (const b of document.querySelectorAll('.sinais .faixa')) {
    const h = b.querySelector('h1'); let s = parseFloat(getComputedStyle(h).fontSize);
    while ((b.scrollHeight > 430 || h.scrollWidth > h.clientWidth + 1) && s > 76) { s -= 3; h.style.fontSize = s + 'px'; }
    if (b.scrollHeight > 436) avisa('faixa');
  }
  for (const x of document.querySelectorAll('.num .bx')) {
    const n = x.querySelector('.n'); let s = parseFloat(getComputedStyle(n).fontSize);
    while ((n.scrollWidth > n.clientWidth || x.scrollHeight > 610) && s > 200) { s -= 6; n.style.fontSize = s + 'px'; }
  }
  for (const b of document.querySelectorAll('[data-max]')) {
    const h = b.querySelector('h2'); if (!h) continue;
    const max = +b.dataset.max;
    let s = Math.round(+(b.dataset.start || 230) * esc);
    h.style.fontSize = s + 'px';
    const big = () => b.scrollHeight > max || h.scrollWidth > h.clientWidth + 1;
    while (big() && s > 64) { s -= 4; h.style.fontSize = s + 'px'; }
    if (big()) avisa('texto');
  }
  for (const c of document.querySelectorAll('.col')) {
    const h = c.querySelector('h2'); if (!h) continue;
    let s = Math.round(+(c.dataset.start || 132) * esc);
    h.style.fontSize = s + 'px';
    // soma das alturas de layout (sem contar a folga que a rotação de um desenho cria)
    const soma = () => [...c.children].reduce((t, e) => t + e.offsetHeight, 0) + 46 * (c.children.length - 1);
    const big = () => soma() > c.clientHeight + 1 || h.scrollWidth > h.clientWidth + 1;
    while (big() && s > 76) { s -= 4; h.style.fontSize = s + 'px'; }
    if (big()) avisa('coluna');
    c.dataset.h2 = s;
  }
  for (const e of document.querySelectorAll('.fim .env')) {
    let s = parseFloat(getComputedStyle(e).fontSize);
    while (e.scrollWidth > e.clientWidth && s > 36) { s -= 2; e.style.fontSize = s + 'px'; }
  }
  for (const e of document.querySelectorAll('.fim .src')) {
    let s = parseFloat(getComputedStyle(e).fontSize);
    while (e.scrollHeight > 70 && s > 21) { s -= 1; e.style.fontSize = s + 'px'; }
  }
  document.body.dataset.ok = '1';
})();
</script>"""

SEG = {
 "reta":  "M -40 1128 C 250 1120, 520 1138, 800 1128 C 920 1124, 1020 1130, 1120 1128",
 "vale":  "M -40 1128 C 200 1128, 330 1132, 470 1150 C 620 1170, 700 1176, 830 1152 C 930 1134, 1010 1128, 1120 1128",
 "pulso": "M -40 1128 C 200 1128, 380 1128, 520 1128 L 610 1128 L 650 1040 L 700 1196 L 746 1128 C 860 1128, 980 1128, 1120 1128",
}
def line(kind="reta"):
    return (f"<svg class='line' width='1080' height='1350' viewBox='0 0 1080 1350' fill='none'>"
            f"<path d='{SEG[kind]}' stroke='var(--line)' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'/></svg>")

def page(cls, body, letra="instrument"):
    return f"<!doctype html><html><head><meta charset='utf-8'><style>{css(letra)}</style></head><body class='{cls}'>{body}{FIT}</body></html>"

def titulo(tag, t):
    return f"<{tag} class='nw'>{t}</{tag}>" if "<br>" in t else f"<{tag}>{t}</{tag}>"
