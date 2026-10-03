#!/usr/bin/env python3
# Página de revisão do segundo lote (03/10/2026). O que muda em relação à primeira página:
# - marcar slide com UM toque: na folha de miniaturas de cada post ou no botão em cima do slide aberto
#   (ele disse que marcar um por um "era uma chatice" e acabou não marcando todos);
# - etiquetas de um toque ("gancho fraco", "faltou imagem"...) para não precisar escrever;
# - antes e agora de cada post, com o que ele disse e o que mudou;
# - duas decisões que são dele: a letra (a mesma capa em quatro letras) e as fotos de verdade.
# Gera revisao/lote2-2026-10-03.html, as miniaturas em revisao2/ e a lista de arquivos a publicar.
import html, json, re, sys
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
RAIZ = HERE.parent
sys.path.insert(0, str(HERE))
import arte as A, lote2, lote2_textos

SAIDA = RAIZ / "revisao"; SAIDA.mkdir(exist_ok=True)
R2 = RAIZ / "revisao2"
for sub in ("mini", "grade", "antes", "letras"): (R2 / sub).mkdir(parents=True, exist_ok=True)
E = html.escape
def limpa(t): return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", t)).strip()

# ordem em que entrariam no perfil (do mais antigo para o mais novo): pensada para a grade alternar as capas
ORDEM = ["2026-10-03-diabetes-5-sinais", "2026-10-03-medir-pressao-v2", "2026-10-03-colica-forte", "2026-10-03-dengue-febre-baixou-v2", "2026-10-03-sal-no-rotulo",
         "2026-10-03-avc-sinais-v2", "2026-10-03-mamografia-40", "2026-10-03-exercicio-150-v2", "2026-10-03-infarto-na-mulher", "2026-10-03-pedra-na-vesicula"]
NO_AR = [("2026-10-03-antibiotico-gripe/capa.jpg", "Reel: Antibiótico cura gripe? (segunda versão)"),
         ("2026-10-03-glicemia-de-jejum/01.jpg", "Carrossel: 99 é normal. E 100?"),
         ("2026-10-03-pressao-12-por-8/01.jpg", "Carrossel: Sua pressão é 12 por 8?"),
         ("2026-10-03-antibiotico-gripe/capa.jpg", "Reel: Antibiótico cura gripe? (primeira versão)")]
TX = {p["id"]: p for p in lote2_textos.POSTS}
SL = {p["slug"]: p for p in lote2.POSTS}
assert set(ORDEM) == set(TX), set(ORDEM) ^ set(TX)

BOM = {"gancho": "Gancho", "desenho": "Desenho", "explicacao": "Explicação", "letra": "Letra", "legenda": "Legenda", "ritmo": "Ritmo"}
RUIM = {"gancho": "Gancho fraco", "imagem": "Faltou imagem", "desenho": "Desenho ruim", "explica": "Explica pouco", "texto": "Texto demais",
        "letra": "Letra ruim", "legenda": "Legenda repete", "rapido": "Rápido demais", "lento": "Lento demais", "musica": "Música ruim"}
CHIPS = {"carrossel": (["gancho", "desenho", "explicacao", "letra", "legenda"], ["gancho", "imagem", "desenho", "explica", "texto", "letra", "legenda"]),
         "reel": (["gancho", "desenho", "ritmo", "legenda"], ["gancho", "rapido", "lento", "desenho", "texto", "musica"])}
LETRAS = [("instrument", "A", "Instrument Serif", "A atual."), ("fraunces", "B", "Fraunces", "Mais cheia e macia."),
          ("playfair", "C", "Playfair Display", "Mais clássica, com contraste alto."), ("dmserif", "D", "DM Serif Display", "A mais pesada.")]

def recorta(src, dst, prop, tam, q=84):                       # recorte central na proporção pedida
    im = Image.open(src).convert("RGB"); w, h = im.size
    if w / h > prop: nw = int(h * prop); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else: nh = int(w / prop); im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    im.resize(tam, Image.LANCZOS).save(dst, "JPEG", quality=q)

def alt_slide(kind, d):
    if kind in ("capa", "sinais"): return limpa(d["h1"]) + " " + limpa(d["sub"])
    if kind == "num": return f"{limpa(d['q'])} {limpa(d['n'])}. {limpa(d['sub'])}"
    if kind == "lista": return limpa((d.get("k", "") + ". " if d.get("k") else "") + d["h2"]) + ": " + "; ".join(t for _, t in d["rows"])
    if kind == "fim": return limpa(d["h2"]) + " " + " ".join(d["items"]) + " " + limpa(d["env"])
    return limpa(" ".join(x for x in ((d.get("k", "") + ":") if d.get("k") else "", d["h2"], d.get("p", ""), d.get("rot", "")) if x))

def fonte_li(f):
    txt, _, url = f.rpartition(" - ")
    return f"<li>{E(txt)} <a href=\"{E(url)}\" target=\"_blank\" rel=\"noopener\">Abrir a fonte</a></li>"

def capa_de(pid):
    return RAIZ / "midia" / pid / ("01.jpg" if (RAIZ / "midia" / pid / "01.jpg").exists() else "capa.jpg")

def cartao(n, pid):
    t = TX[pid]; car = t["tipo"] == "carrossel"
    if car:
        sl = SL[pid]["slides"]; total = len(sl)
        (R2 / "mini" / pid).mkdir(exist_ok=True)
        imgs, minis = [], []
        for i, (k, _, d) in enumerate(sl, 1):
            recorta(RAIZ / "midia" / pid / f"{i:02d}.jpg", R2 / "mini" / pid / f"{i:02d}.jpg", 4 / 5, (216, 270), 80)
            imgs.append(f"<img src=\"midia/{pid}/{i:02d}.jpg\" width=\"1080\" height=\"1350\" loading=\"lazy\" decoding=\"async\" alt=\"Slide {i} de {total}: {E(alt_slide(k, d), quote=True)}\">")
            minis.append(f"<button class=\"mini\" type=\"button\" data-slide=\"{i}\" aria-pressed=\"false\" aria-label=\"Marcar o slide {i} para mudar\">"
                         f"<img src=\"revisao2/mini/{pid}/{i:02d}.jpg\" width=\"216\" height=\"270\" loading=\"lazy\" alt=\"\"><span>{i}</span></button>")
        midia = (f"<div class=\"midia car\" data-total=\"{total}\"><div class=\"trilho\" id=\"t{n}\" tabindex=\"0\" role=\"group\" aria-label=\"Slides do post {n}. Arraste ou use as setas.\">{''.join(imgs)}</div>"
                 f"<button class=\"nav ant\" type=\"button\" aria-label=\"Slide anterior\" hidden>&#8249;</button><button class=\"nav prox\" type=\"button\" aria-label=\"Próximo slide\">&#8250;</button>"
                 f"<span class=\"pos\"><b>1</b>/{total}</span><button class=\"marca\" type=\"button\" data-marca aria-pressed=\"false\">Marcar este slide</button></div>"
                 f"<div class=\"folha-w\"><div class=\"folha\" role=\"group\" aria-label=\"Toque nos slides que você quer mudar\">{''.join(minis)}</div>"
                 f"<p class=\"marcados\" data-marcados aria-live=\"polite\">Toque nos slides que você quer mudar.</p></div>")
        meta = f"Carrossel · {total} slides"
    else:
        midia = (f"<div class=\"midia reel\"><video id=\"v{n}\" controls playsinline preload=\"metadata\" poster=\"midia/{pid}/capa.jpg\" src=\"midia/{pid}/reel.mp4\" "
                 f"aria-label=\"Reel: {E(t['titulo'], quote=True)}\"></video></div>")
        meta = f"Reel · {t['duracao']}"
    # antes e agora
    if t["antes"]:
        recorta(capa_de(t["antes"]), R2 / "antes" / f"{pid}-antes.jpg", 4 / 5, (222, 278))
        recorta(capa_de(pid), R2 / "antes" / f"{pid}-agora.jpg", 4 / 5, (222, 278))
        ad = (f"<div class=\"ad\"><figure><img src=\"revisao2/antes/{pid}-antes.jpg\" width=\"222\" height=\"278\" loading=\"lazy\" alt=\"Capa da primeira versão\"><figcaption>Antes</figcaption></figure>"
              f"<span class=\"vai\" aria-hidden=\"true\">&#8594;</span>"
              f"<figure><img src=\"revisao2/antes/{pid}-agora.jpg\" width=\"222\" height=\"278\" loading=\"lazy\" alt=\"Capa da nova versão\"><figcaption>Agora</figcaption></figure></div>")
        rot = "Você disse"
    else:
        ad = "<div class=\"ad\"><span class=\"selo\" style=\"transform:none\">Tema novo</span></div>"; rot = "Por que este tema"
    mudou = "".join(f"<li><span>{E(x)}</span></li>" for x in t["mudou"])
    porque = (f"<div class=\"porque\">{ad}<div class=\"disse\"><p class=\"lab\">{rot}</p><p>{E(t['seu_retorno'])}</p></div>"
              f"<ul class=\"mudou\" aria-label=\"O que mudou\">{mudou}</ul></div>")
    bons, ruins = CHIPS[t["tipo"]]
    chips = ("<div class=\"chips\"><p class=\"lab\">Funcionou</p><div role=\"group\" aria-label=\"O que funcionou\">"
             + "".join(f"<button type=\"button\" data-bom=\"{k}\" aria-pressed=\"false\">{BOM[k]}</button>" for k in bons)
             + "</div><p class=\"lab\" style=\"margin-top:6px\">Incomodou</p><div role=\"group\" aria-label=\"O que incomodou\">"
             + "".join(f"<button type=\"button\" data-ruim=\"{k}\" aria-pressed=\"false\">{RUIM[k]}</button>" for k in ruins) + "</div></div>")
    fontes = "".join(fonte_li(f) for f in t["fontes"])
    return f"""
<article class="post" id="p{n}" data-id="{pid}" data-titulo="{E(t['titulo'], quote=True)}">
  <header class="ph"><span class="num" aria-hidden="true">{n}</span>
    <div class="pt"><p class="eyebrow">{E(t['serie'])} · {meta}</p><h3>{E(t['titulo'])}</h3></div>
    <span class="selo" data-selo hidden></span></header>
  {porque}
  {midia}
  <div class="retorno">
    {chips}
    <div class="votos" role="group" aria-label="Seu voto para o post {n}">
      <button type="button" data-v="gostei" aria-pressed="false">Gostei</button><button type="button" data-v="meio" aria-pressed="false">Mais ou menos</button><button type="button" data-v="nao" aria-pressed="false">Não gostei</button></div>
    <label class="lab" for="nota-{n}">Quer escrever algo? (opcional)</label>
    <textarea id="nota-{n}" rows="2" data-nota placeholder="Só se os toques acima não disserem tudo"></textarea>
    <p class="st" data-st aria-live="polite"></p>
  </div>
  <div class="dobras"><details class="dobra"><summary>Legenda</summary><p class="legenda">{E(t['legenda'])}</p></details>
  <details class="dobra"><summary>Quem manda para quem</summary><p class="quem">{E(t['quem_manda'])}</p></details>
  <details class="dobra"><summary>De onde vem a informação</summary><ul class="fontes">{fontes}</ul>
  <p class="nota-teste">Post de teste: antes de publicar para valer, cada afirmação é conferida na fonte.</p></details></div>
</article>"""

def grade():
    tiles = []
    for n in range(len(ORDEM), 0, -1):                     # o mais novo primeiro, como no perfil
        pid = ORDEM[n - 1]; t = TX[pid]
        recorta(capa_de(pid), R2 / "grade" / f"{n:02d}.jpg", 3 / 4, (540, 720), 86)
        reel = "<span class=\"ico\" aria-hidden=\"true\">&#9654;</span>" if t["tipo"] == "reel" else ""
        tiles.append(f"<button class=\"tile\" type=\"button\" data-ir=\"p{n}\" aria-label=\"Ir para o post {n}: {E(t['titulo'], quote=True)}\">"
                     f"<img src=\"revisao2/grade/{n:02d}.jpg\" width=\"540\" height=\"720\" alt=\"\"><span class=\"n\">{n}</span>{reel}</button>")
    for i, (rel, nome) in enumerate(NO_AR, 1):
        recorta(RAIZ / "midia" / rel, R2 / "grade" / f"ar{i}.jpg", 3 / 4, (540, 720), 86)
        tiles.append(f"<div class=\"tile ar\"><img src=\"revisao2/grade/ar{i}.jpg\" width=\"540\" height=\"720\" alt=\"{E(nome, quote=True)}\"><span class=\"tag\">no ar</span></div>")
    return "".join(tiles)

def letras():                                              # a mesma capa nas quatro letras
    post = SL["2026-10-03-medir-pressao-v2"]; kind, theme, d = post["slides"][0]
    with sync_playwright() as pw:
        b = pw.chromium.launch(); pg = b.new_page(viewport={"width": 1080, "height": 1350}, device_scale_factor=1)
        for k, *_ in LETRAS:
            lote2.captura(pg, lote2.render(post, kind, theme, d, 1, len(post["slides"]), "reta", letra=k), R2 / "letras" / f"{k}-g.jpg")
            Image.open(R2 / "letras" / f"{k}-g.jpg").resize((720, 900), Image.LANCZOS).save(R2 / "letras" / f"{k}.jpg", "JPEG", quality=86)
            (R2 / "letras" / f"{k}-g.jpg").unlink()
        b.close()
    figs = "".join(f"<figure><img src=\"revisao2/letras/{k}.jpg\" width=\"720\" height=\"900\" loading=\"lazy\" alt=\"A capa do post da pressão na letra {E(nome, quote=True)}\">"
                   f"<figcaption><b>{L}.</b> {E(nome)}. <span>{E(desc)}</span></figcaption></figure>" for k, L, nome, desc in LETRAS)
    bot = "".join(f"<button type=\"button\" data-esc=\"{k}\" aria-pressed=\"false\">{L} · {E(nome)}</button>" for k, L, nome, _ in LETRAS)
    ids = {k: nome for k, _, nome, _ in LETRAS}; ids["?"] = "ainda não sei"
    return figs, bot, ids

PAGINA = (HERE / "revisao2_modelo.html").read_text(encoding="utf-8")
if __name__ == "__main__":
    J = lambda o: json.dumps(o, ensure_ascii=False)
    figs, bot, letras_ids = letras()
    ids = J([[f"p{n}", pid, TX[pid]["titulo"], TX[pid]["tipo"]] for n, pid in enumerate(ORDEM, 1)])
    out = (PAGINA.replace("%%GRADE%%", grade()).replace("%%POSTS%%", "".join(cartao(n, pid) for n, pid in enumerate(ORDEM, 1)))
           .replace("%%LETRAS%%", figs).replace("%%LETRAS_BOT%%", bot).replace("%%LETRAS_IDS%%", J(letras_ids))
           .replace("%%BOM%%", J(BOM)).replace("%%RUIM%%", J(RUIM)).replace("%%IDS%%", ids).replace("%%TOTAL%%", str(len(ORDEM))))
    assert "%%" not in out
    (SAIDA / "lote2-2026-10-03.html").write_text(out, encoding="utf-8")
    arquivos = sorted({m for m in re.findall(r"(?:src|poster)=\"((?:midia|revisao2)/[^\"]+)\"", out)})
    faltam = [a for a in arquivos if not (RAIZ / a).exists()]
    (R2 / "arquivos.json").write_text(json.dumps(arquivos, indent=0), encoding="utf-8")
    print(len(out), "bytes;", len(arquivos), "arquivos;", sum((RAIZ / a).stat().st_size for a in arquivos if (RAIZ / a).exists()) // 1024, "KB; faltam:", faltam)
