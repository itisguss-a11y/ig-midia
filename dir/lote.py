#!/usr/bin/env python3
# Lote de teste de 03/10/2026: carrosséis para ele avaliar (não foram publicados).
# Regras deste lote: público leigo, uma ideia por slide, letra grande, capas em fundos variados
# (verde, creme, dourado, número gigante, laudo) e a fonte citada uma vez só, no último slide.
# Cada post testa um jeito de montar o miolo: "base" (texto apoiado na linha) ou "meio" (texto no centro).
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "perfil"))
import perfil as P   # fontes, textura e a capa de laudo (tile_b)

OUT = HERE.parent / "midia"
CSS = P.FONTS + f"""
body{{width:1080px;height:1350px;overflow:hidden;position:relative;font-family:'Sans',sans-serif;-webkit-font-smoothing:antialiased}}
body::after{{content:'';position:absolute;inset:0;background:url("{P.GRAIN}");opacity:.07;mix-blend-mode:overlay;pointer-events:none;z-index:9}}
.green{{background:var(--g);color:var(--cream);--line:var(--gold);--acc:var(--gold);--rule:rgba(244,237,223,.26)}}
.cream{{background:var(--cream);color:var(--g);--line:var(--g);--acc:var(--pen);--rule:rgba(23,64,44,.2)}}
.gold{{background:var(--gold);color:var(--g);--line:var(--g);--acc:#0E2F20;--rule:rgba(23,64,44,.3)}}
.serie{{position:absolute;left:96px;top:84px;font:italic 400 36px/1 'Serif';opacity:.92}}
.pg{{position:absolute;right:96px;bottom:74px;font:400 25px/1 'Sans';opacity:.72}}
svg.line{{position:absolute;left:0;top:0}}
h2{{font:400 150px/.95 'Serif';letter-spacing:-.024em;text-wrap:balance}} h2 i{{font-style:italic;color:var(--acc)}}
h2.nw{{white-space:nowrap}} .nb{{white-space:nowrap}}
p{{font:400 50px/1.28 'Sans';opacity:.92;text-wrap:pretty}}

/* capa tipográfica */
.capa{{position:absolute;left:96px;right:60px;top:180px}}
.capa h1{{font:400 212px/.9 'Serif';letter-spacing:-.028em;white-space:nowrap}} .capa h1 i{{font-style:italic}}
.capa p{{font-size:46px;margin-top:40px;max-width:840px}}

/* capa de número gigante */
.num .q{{position:absolute;left:96px;right:96px;top:176px;font:400 106px/.98 'Serif';letter-spacing:-.02em}}
.num .bx{{position:absolute;left:96px;right:96px;bottom:292px}}
.num .n{{font:italic 400 620px/.84 'Serif';letter-spacing:-.045em;white-space:nowrap;margin-left:-18px;padding-bottom:.07em}}
.num .n small{{font-size:.33em;letter-spacing:-.02em;margin-left:.05em}}
.num p{{font-size:46px;margin-top:22px;max-width:860px}}

/* miolo: texto apoiado na linha (base) ou no centro (meio) */
.base{{position:absolute;left:96px;right:96px;bottom:292px}}
.meio{{position:absolute;left:96px;right:96px;top:176px;height:890px;display:flex;flex-direction:column;justify-content:center}}
.tx p{{margin-top:42px;max-width:880px}}

/* passo numerado */
.k{{position:absolute;left:84px;top:150px;font:italic 400 380px/.8 'Serif';letter-spacing:-.04em;color:var(--acc)}}

/* lista curta (teste rápido) */
.rows{{margin-top:50px}}
.row{{display:flex;align-items:baseline;gap:34px;padding:30px 0 34px;border-top:1.5px solid var(--rule)}}
.row b{{flex:0 0 330px;font:italic 400 92px/1 'Serif';letter-spacing:-.02em;color:var(--acc)}}
.row span{{font:400 48px/1.22 'Sans';opacity:.94}}

/* último slide */
.fim .top{{position:absolute;left:96px;right:96px;top:170px}}
.fim h2{{font-size:124px}}
.fim ul{{list-style:none;margin:50px 0 0;padding:0}}
.fim li{{font:400 50px/1.25 'Sans';padding:34px 0;border-top:1.5px solid var(--rule)}} .fim li:last-child{{border-bottom:1.5px solid var(--rule)}}
.fim .env{{position:absolute;left:96px;right:96px;top:1158px;font:italic 400 54px/1.05 'Serif';white-space:nowrap}}
.fim .src{{position:absolute;left:96px;right:230px;bottom:62px;font:400 23px/1.36 'Sans';opacity:.7}}
"""
FIT = """<script>
for (const h of document.querySelectorAll('.capa h1')) {            // capa: diminui até a linha mais longa caber
  let s = parseFloat(getComputedStyle(h).fontSize);
  while (h.scrollWidth > h.clientWidth && s > 90) { s -= 3; h.style.fontSize = s + 'px'; }
}
for (const x of document.querySelectorAll('.num .bx')) {             // número gigante: cabe na largura e não sobe na pergunta
  const n = x.querySelector('.n'); let s = parseFloat(getComputedStyle(n).fontSize);
  while ((n.scrollWidth > n.clientWidth || x.scrollHeight > 610) && s > 200) { s -= 6; n.style.fontSize = s + 'px'; }
}
for (const b of document.querySelectorAll('[data-max]')) {           // miolo: a maior letra que cabe na área
  const h = b.querySelector('h2'), max = +b.dataset.max; let s = +(b.dataset.start || 230);
  h.style.fontSize = s + 'px';
  const big = () => b.scrollHeight > max || h.scrollWidth > h.clientWidth + 1;
  while (big() && s > 72) { s -= 4; h.style.fontSize = s + 'px'; }
}
for (const e of document.querySelectorAll('.fim .env')) {            // convite do fim: uma linha só
  let s = parseFloat(getComputedStyle(e).fontSize);
  while (e.scrollWidth > e.clientWidth && s > 36) { s -= 2; e.style.fontSize = s + 'px'; }
}
</script>"""

# trechos de linha: todos entram e saem na mesma altura (1128), então qualquer sequência emenda de um slide para o outro
SEG = {
 "reta":  "M -40 1128 C 250 1120, 520 1138, 800 1128 C 920 1124, 1020 1130, 1120 1128",
 "vale":  "M -40 1128 C 200 1128, 330 1132, 470 1150 C 620 1170, 700 1176, 830 1152 C 930 1134, 1010 1128, 1120 1128",
 "onda":  "M -40 1128 C 180 1128, 300 1052, 430 1086 C 570 1124, 610 1190, 770 1150 C 900 1118, 1000 1128, 1120 1128",
 "pulso": "M -40 1128 C 200 1128, 380 1128, 520 1128 L 610 1128 L 650 1040 L 700 1196 L 746 1128 C 860 1128, 980 1128, 1120 1128",
 "coracao": "M -40 1128 C 250 1128, 520 1140, 668 1112 C 800 1086, 944 1030, 944 936 C 944 868, 880 852, 846 866 C 818 878, 806 902, 800 930 "
            "C 794 902, 780 876, 750 866 C 706 852, 652 880, 652 944 C 652 1030, 748 1086, 806 1150 C 850 1196, 960 1150, 1120 1128",
 "gota":  "M -40 1128 C 300 1128, 560 1146, 700 1124 C 800 1108, 892 1082, 892 1010 C 892 950, 832 900, 800 826 C 768 900, 708 950, 708 1010 "
          "C 708 1082, 780 1124, 846 1136 C 930 1150, 1030 1140, 1120 1128",
}
def line(kind):
    return (f"<svg class='line' width='1080' height='1350' viewBox='0 0 1080 1350' fill='none'>"
            f"<path d='{SEG[kind]}' stroke='var(--line)' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'/></svg>")
def page(cls, body):
    return f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body class='{cls}'>{body}{FIT}</body></html>"

def render(serie, miolo, kind, theme, d, n, total, seg):
    top = f"<div class='serie'>{serie}</div>"
    pg = "" if n == 1 else f"<div class='pg'>{n}/{total}</div>"
    par = f"<p>{d['p']}</p>" if d.get("p") else ""
    h2 = f"<h2 class='nw'>{d['h2']}</h2>" if "<br>" in d.get("h2", "") else f"<h2>{d.get('h2', '')}</h2>"
    if kind == "capa":
        return page(theme, top + line(d.get("line", "onda")) + f"<div class='capa'><h1>{d['h1']}</h1><p>{d['sub']}</p></div>")
    if kind == "num":
        return page(theme + " num", top + line("reta") + f"<div class='q'>{d['q']}</div><div class='bx'><div class='n'>{d['n']}</div><p>{d['sub']}</p></div>")
    if kind == "laudo":
        return P.tile_b(serie, d["h1"], d["sub"], d["hd"], d["hd2"], d["rows"], d["res_label"], d["res_val"], d["note"], d.get("nx", 560))
    if kind == "frase":
        if miolo == "meio":
            return page(theme, top + line(seg) + f"<div class='meio'><div class='tx' data-max='800'>{h2}{par}</div></div>" + pg)
        return page(theme, top + line(seg) + f"<div class='base tx' data-max='790'>{h2}{par}</div>" + pg)
    if kind == "passo":
        return page(theme, top + line(seg) + f"<div class='k'>{d['k']}</div><div class='base tx' data-max='560' data-start='190'>{h2}{par}</div>" + pg)
    if kind == "lista":
        rows = "".join(f"<div class='row'><b>{a}</b><span>{b}</span></div>" for a, b in d["rows"])
        return page(theme, top + line(seg) + f"<div class='base' data-max='820' data-start='150'><h2>{d['h2']}</h2><div class='rows'>{rows}</div></div>" + pg)
    if kind == "fim":
        li = "".join(f"<li>{x}</li>" for x in d["items"])
        return page(theme + " fim", top + line("reta") + f"<div class='top' data-max='900' data-start='124'><h2>{d['h2']}</h2><ul>{li}</ul></div>"
                    f"<div class='env'>{d['env']}</div><div class='src'>{d['src']}</div>" + pg)
    raise ValueError(kind)

AVISO = "Conteúdo educativo, não substitui consulta."
POSTS = [
 dict(slug="2026-10-03-avc-sinais", serie="Sinais do corpo", miolo="base", slides=[
  ("capa", "cream", dict(h1="Você<br>reconheceria<br><i>um AVC?</i>", sub="Os sinais aparecem de repente<br>e pedem socorro na hora.", line="pulso")),
  ("frase", "green", dict(h2="Um lado do<br>corpo <i>fraco ou</i><br><i>formigando.</i>", p="No rosto, no braço ou na perna.")),
  ("frase", "cream", dict(h2="A fala <i>enrola.</i>", p="Ou a pessoa fica confusa e não entende o que você diz.")),
  ("frase", "green", dict(h2="A visão muda<br><i>de repente.</i>", p="Em um olho ou nos dois.")),
  ("frase", "cream", dict(h2="Tontura e<br>perda de<br><i>equilíbrio.</i>", p="Dificuldade para andar ou para coordenar os movimentos.")),
  ("frase", "green", dict(h2="Dor de cabeça<br>forte, <i>do nada.</i>", p="Intensa e sem causa aparente.")),
  ("lista", "cream", dict(h2="Na dúvida,<br><i>peça três coisas:</i>", rows=[("Sorriso", "A boca fica torta?"), ("Abraço", "Um dos braços cai?"), ("Frase", "A fala sai enrolada?")])),
  ("fim", "green", dict(h2="Viu um sinal? <i>Ligue 192.</i>", items=["É o SAMU. O 193, dos Bombeiros, também atende.", "Ou leve a pessoa direto ao hospital.", "Quanto mais rápido o atendimento, maior a chance de recuperação."],
                        env="Envie para a sua família.", src="Fontes: Ministério da Saúde; Sociedade Brasileira de AVC. " + AVISO)),
 ]),
 dict(slug="2026-10-03-sal-por-dia", serie="Para salvar", miolo="meio", slides=[
  ("num", "gold", dict(q="Quanto sal<br>por dia?", n="5<small>g</small>", sub="Menos de uma colher de chá, contando o sal que você não vê.")),
  ("frase", "green", dict(h2="O limite é<br><i>5 gramas</i><br>por dia.", p="Menos de uma colher de chá. E conta todo o sal do dia, não só o do saleiro.")),
  ("frase", "cream", dict(h2="A média no<br>mundo é de<br><i>11 gramas.</i>", p="Mais que o dobro do limite.")),
  ("frase", "green", dict(h2="Sal demais<br><i>sobe a</i><br><i>pressão.</i>", p="E pressão alta aumenta o risco de doenças do coração.")),
  ("frase", "cream", dict(h2="Boa parte do<br>sal <i>não vem</i><br><i>do saleiro.</i>", p="Vem de pão, embutidos, salgadinhos e molhos prontos.")),
  ("fim", "green", dict(h2="Como <i>reduzir</i>", items=["Tire o saleiro da mesa.", "Cozinhe com pouco sal. Use ervas e temperos naturais.", "Prefira comida fresca, pouco processada."],
                        env="Envie para quem cozinha na sua casa.", src="Fonte: Organização Mundial da Saúde. " + AVISO)),
 ]),
 dict(slug="2026-10-03-exercicio-por-semana", serie="Para salvar", miolo="base", slides=[
  ("num", "cream", dict(q="Quanto exercício<br>por semana?", n="150<small>min</small>", sub="É menos do que parece.")),
  ("frase", "green", dict(h2="Pelo menos<br><i>150 minutos</i><br>por semana.", p="De atividade moderada. É a recomendação para adultos.")),
  ("frase", "cream", dict(h2="Dá <i>30 minutos,</i><br>5 dias<br>por semana.", p="Ou pouco mais de 20 minutos por dia.")),
  ("frase", "green", dict(h2="<i>Todo</i><br><i>movimento</i><br>conta.", p="Caminhar, pedalar, praticar um esporte, brincar.")),
  ("frase", "cream", dict(h2="Não chega<br>a 150? <i>Faça</i><br><i>o que der.</i>", p="Qualquer quantidade é melhor do que nenhuma.")),
  ("fim", "green", dict(h2="O que você <i>ganha</i>", items=["Menos risco de pressão alta e de diabetes tipo 2.", "Menos risco de morrer de doença do coração.", "Sono e saúde mental melhores."],
                        env="Envie para quem começa na segunda.", src="Fonte: Organização Mundial da Saúde. " + AVISO)),
 ]),
 dict(slug="2026-10-03-diabetes-sinais", serie="Sinais do corpo", miolo="meio", slides=[
  ("capa", "green", dict(h1="Sede que<br><i>não passa?</i>", sub="Pode ser um dos sinais do diabetes.", line="gota")),
  ("frase", "cream", dict(h2="Muita sede<br>e vontade<br>de <i>urinar</i><br><i>toda hora.</i>", p="Fome frequente também entra na lista.")),
  ("frase", "green", dict(h2="<i>Formigamento</i><br>nos pés e<br>nas mãos.")),
  ("frase", "cream", dict(h2="Feridas que<br><i>demoram</i><br><i>a cicatrizar.</i>", p="E infecções frequentes: na bexiga, nos rins ou na pele.")),
  ("frase", "green", dict(h2="Visão<br><i>embaçada.</i>")),
  ("fim", "cream", dict(h2="Reconheceu <i>algum?</i>", items=["Um exame de sangue mostra como está o açúcar.", "Procure a unidade de saúde e peça a avaliação.", "Exercício e alimentação saudável ajudam a prevenir."],
                        env="Envie para quem vive com sede.", src="Fontes: Ministério da Saúde; Sociedade Brasileira de Diabetes. " + AVISO)),
 ]),
 dict(slug="2026-10-03-medir-pressao", serie="Para salvar", miolo="base", slides=[
  ("capa", "gold", dict(h1="Você mede<br>a pressão<br><i>do jeito certo?</i>", sub="Cinco cuidados antes de apertar o botão.", line="coracao")),
  ("passo", "cream", dict(k="1", h2="Nada de café,<br>álcool, cigarro<br>ou exercício antes.", p="Fumou? Espere 30 minutos. Fez exercício? Espere 1 hora.")),
  ("passo", "green", dict(k="2", h2="Esvazie<br>a bexiga.")),
  ("passo", "cream", dict(k="3", h2="Sente e descanse<br>5 minutos.", p="Em um lugar calmo.")),
  ("passo", "green", dict(k="4", h2="Costas apoiadas,<br>pernas descruzadas,<br>pés no chão.")),
  ("passo", "cream", dict(k="5", h2="Braço apoiado,<br>na altura do<br>coração.", p="E não converse durante a medida.")),
  ("fim", "green", dict(h2="Para <i>guardar</i>", items=["Antes: sem café, álcool, cigarro ou exercício.", "Bexiga vazia e 5 minutos de descanso, sentado.", "Costas e braço apoiados, pés no chão, sem conversar."],
                        env="Envie para quem mede a pressão em casa.", src="Fonte: diretrizes brasileiras de hipertensão e de medida da pressão arterial. " + AVISO)),
 ]),
 dict(slug="2026-10-03-exame-diabetes-idade", serie="Entenda seu exame", miolo="meio", slides=[
  ("laudo", "green", dict(h1="Nunca fez exame<br>de diabetes?", sub="Veja a partir de que idade ele é indicado.", hd="GLICEMIA DE JEJUM", hd2="pedido de exame",
                          rows=[("Idade", "35 anos"), ("Sintomas", "nenhum")], res_label="Exame", res_val="indicado", note="já?", nx=640)),
  ("frase", "cream", dict(h2="A partir dos<br><i>35 anos,</i><br>é para todo<br>mundo.", p="Mesmo sem nenhum sintoma.")),
  ("frase", "green", dict(h2="<i>Antes dos 35,</i><br>em alguns<br>casos.", p="Quando há excesso de peso e mais um fator de risco.")),
  ("frase", "cream", dict(h2="O que é<br><i>fator de</i><br><i>risco?</i>", p="Pressão alta, sedentarismo ou diabetes em pais ou irmãos, por exemplo.")),
  ("frase", "green", dict(h2="Deu normal?<br><i>Repita em</i><br><i>3 anos.</i>", p="Com três ou mais fatores de risco, repita em 1 ano.")),
  ("frase", "cream", dict(h2="Pré-diabetes?<br><i>Repita em</i><br><i>1 ano.</i>")),
  ("fim", "green", dict(h2="Para <i>guardar</i>", items=["A partir dos 35 anos: exame para todos.", "Antes disso: excesso de peso e mais um fator de risco.", "O exame é de sangue: glicemia de jejum ou hemoglobina glicada."],
                        env="Envie para quem já passou dos 35.", src="Fonte: Diretriz da Sociedade Brasileira de Diabetes. " + AVISO)),
 ]),
]

if __name__ == "__main__":
    only = sys.argv[1:]
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        pg = b.new_page(viewport={"width": 1080, "height": 1350}, device_scale_factor=1)
        for post in POSTS:
            if only and not any(o in post["slug"] for o in only): continue
            d = OUT / post["slug"]; d.mkdir(parents=True, exist_ok=True)
            for old in d.glob("*.jpg"): old.unlink()
            total = len(post["slides"])
            for i, (kind, theme, data) in enumerate(post["slides"], 1):
                html = render(post["serie"], post["miolo"], kind, theme, data, i, total, "vale" if i % 2 else "reta")
                f = HERE / "_s.html"; f.write_text(html, encoding="utf-8")
                pg.goto(f.as_uri()); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(150)
                pg.screenshot(path=str(d / f"{i:02d}.png")); f.unlink()
                Image.open(d / f"{i:02d}.png").convert("RGB").save(d / f"{i:02d}.jpg", "JPEG", quality=93); (d / f"{i:02d}.png").unlink()
            g, n = 16, total
            sh = Image.new("RGB", (540 * n + g * (n + 1), 675 + g * 2), (232, 230, 226))
            for i in range(n): sh.paste(Image.open(d / f"{i+1:02d}.jpg").resize((540, 675), Image.LANCZOS), (g + i * (540 + g), g))
            sh.save(HERE / f"_folha-{post['slug']}.jpg", "JPEG", quality=88)
        b.close()
    print("ok")
