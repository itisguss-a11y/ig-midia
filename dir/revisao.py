#!/usr/bin/env python3
# Página de revisão de um lote: mostra os posts criados (sem publicar), a grade do perfil como ficaria,
# a legenda e as fontes de cada um, e guarda o retorno dele (gostei / mais ou menos / não gostei + comentário).
# Gera revisao/lote-2026-10-03.html e as miniaturas em revisao/grade/ e revisao/capas/.
import html, json, re, sys
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
RAIZ = HERE.parent
sys.path.insert(0, str(HERE))
import lote, lote_textos

SAIDA = RAIZ / "revisao"; (SAIDA / "grade").mkdir(parents=True, exist_ok=True); (SAIDA / "capas").mkdir(exist_ok=True)
E = html.escape
def limpa(t): return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", t)).strip()

# ordem em que entrariam no perfil (do mais antigo para o mais novo): pensada para a grade não repetir cor lado a lado
ORDEM = ["2026-10-03-sal-por-dia", "2026-10-03-avc-sinais", "2026-10-03-medir-pressao", "2026-10-03-exercicio-por-semana",
         "2026-10-03-diabetes-sinais", "2026-10-03-exame-diabetes-idade", "2026-10-03-dengue-febre-baixou", "2026-10-03-infarto-dor-no-peito"]
NO_AR = [("2026-10-03-antibiotico-gripe/capa.jpg", "Reel: Antibiótico cura gripe? (segunda versão)"),
         ("2026-10-03-glicemia-de-jejum/01.jpg", "Carrossel: 99 é normal. E 100?"),
         ("2026-10-03-pressao-12-por-8/01.jpg", "Carrossel: Sua pressão é 12 por 8?"),
         ("2026-10-03-antibiotico-gripe/capa.jpg", "Reel: Antibiótico cura gripe? (primeira versão)")]
TX = {p["id"]: p for p in lote_textos.POSTS}
SL = {p["slug"]: p for p in lote.POSTS}

def miniatura(src, dst):                      # recorte central 3:4, como o Instagram mostra na grade
    im = Image.open(src).convert("RGB"); w, h = im.size
    if w / h > 3 / 4: nw = int(h * 3 / 4); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else: nh = int(w * 4 / 3); im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    im.resize((540, 720), Image.LANCZOS).save(dst, "JPEG", quality=86)

def alt_slide(kind, d):
    if kind in ("capa", "laudo"): return limpa(d["h1"]) + " " + limpa(d["sub"])
    if kind == "num": return f"{limpa(d['q'])} {limpa(d['n'])}. {limpa(d['sub'])}"
    if kind == "lista": return limpa(d["h2"]) + " " + "; ".join(f"{a}: {b}" for a, b in d["rows"])
    if kind == "fim": return limpa(d["h2"]) + " " + " ".join(d["items"]) + " " + limpa(d["env"])
    return (f"Passo {d['k']}: " if kind == "passo" else "") + limpa(d["h2"]) + (" " + limpa(d["p"]) if d.get("p") else "")

def fonte_li(f):
    txt, _, url = f.rpartition(" - ")
    return f"<li>{E(txt)} <a href='{E(url)}' target='_blank' rel='noopener'>Abrir a fonte</a></li>"

def cartao(n, pid):
    t = TX[pid]
    if t["tipo"] == "carrossel":
        sl = SL[pid]["slides"]; total = len(sl)
        imgs = "".join(f"<img src='midia/{pid}/{i:02d}.jpg' width='1080' height='1350' loading='lazy' decoding='async' alt='Slide {i} de {total}: {E(alt_slide(k, d), quote=True)}'>"
                       for i, (k, _, d) in enumerate(sl, 1))
        dots = "".join("<i></i>" for _ in sl)
        midia = (f"<div class='midia car' data-total='{total}'><div class='trilho' id='t{n}' tabindex='0' role='group' aria-label='Slides do post {n}. Arraste ou use as setas.'>{imgs}</div>"
                 f"<button class='nav ant' type='button' aria-label='Slide anterior' hidden>&#8249;</button><button class='nav prox' type='button' aria-label='Próximo slide'>&#8250;</button>"
                 f"<span class='pos'><b>1</b>/{total}</span></div><div class='dots' aria-hidden='true'>{dots}</div>")
        meta = f"Carrossel · {total} slides"
        marca = "<button class='marca' type='button' data-marca>Marcar o slide 1</button><span class='marcados' data-marcados></span>"
    else:
        midia = (f"<div class='midia reel'><video id='v{n}' controls playsinline preload='metadata' poster='midia/{pid}/capa.jpg' src='midia/{pid}/reel.mp4' "
                 f"aria-label='Reel: {E(t['titulo'], quote=True)}'></video></div>")
        meta = f"Reel · {t['duracao']}"; marca = ""
    testa = "".join(f"<li>{E(x)}</li>" for x in t["testa"])
    fontes = "".join(fonte_li(f) for f in t["fontes"])
    return f"""
<article class="post" id="p{n}" data-id="{pid}" data-titulo="{E(t['titulo'], quote=True)}">
  <header class="ph"><span class="num" aria-hidden="true">{n}</span>
    <div class="pt"><p class="eyebrow">{E(t['serie'])} · {meta}</p><h3>{E(t['titulo'])}</h3></div>
    <span class="selo" data-selo hidden></span></header>
  {midia}
  <div class="testa"><p class="lab">O que este post testa</p><ul>{testa}</ul></div>
  <div class="dobras"><details class="dobra"><summary>Legenda</summary><p class="legenda">{E(t['legenda'])}</p></details>
  <details class="dobra"><summary>Fontes conferidas</summary><ul class="fontes">{fontes}</ul></details></div>
  <div class="retorno">
    <div class="votos" role="group" aria-label="Seu retorno para o post {n}">
      <button type="button" data-v="gostei" aria-pressed="false">Gostei</button><button type="button" data-v="meio" aria-pressed="false">Mais ou menos</button><button type="button" data-v="nao" aria-pressed="false">Não gostei</button></div>
    <div class="linha-marca">{marca}</div>
    <label class="lab" for="nota-{n}">O que mudar?</label>
    <textarea id="nota-{n}" rows="2" data-nota placeholder="Escreva o que quiser: capa, texto, cor, tempo de leitura…"></textarea>
    <p class="st" data-st aria-live="polite"></p>
  </div>
</article>"""

def grade():
    tiles = []
    for n in range(len(ORDEM), 0, -1):                     # o mais novo primeiro, como no perfil
        pid = ORDEM[n - 1]; t = TX[pid]
        src = RAIZ / "midia" / pid / ("01.jpg" if t["tipo"] == "carrossel" else "capa.jpg")
        miniatura(src, SAIDA / "grade" / f"{n:02d}.jpg")
        reel = "<span class='ico' aria-hidden='true'>&#9654;</span>" if t["tipo"] == "reel" else ""
        tiles.append(f"<button class='tile' type='button' data-ir='p{n}' aria-label='Ir para o post {n}: {E(t['titulo'], quote=True)}'>"
                     f"<img src='revisao/grade/{n:02d}.jpg' width='540' height='720' alt=''><span class='n'>{n}</span>{reel}</button>")
    for i, (rel, nome) in enumerate(NO_AR, 1):
        miniatura(RAIZ / "midia" / rel, SAIDA / "grade" / f"ar{i}.jpg")
        tiles.append(f"<div class='tile ar'><img src='revisao/grade/ar{i}.jpg' width='540' height='720' alt='{E(nome, quote=True)}'><span class='tag'>no ar</span></div>")
    return "".join(tiles)

def opcoes():                                              # as três propostas de capa que ele ainda não escolheu
    src = RAIZ / "perfil" / "out" / "grade-capas-opcoes.jpg"
    if not src.exists(): return ""
    im = Image.open(src).convert("RGB"); W, H = im.size
    cortes = {"a": (40, 1038), "b": (1038, 2039), "c": (2039, 3040)}
    for k, (x0, x1) in cortes.items():
        c = im.crop((int(x0 * W / 3076), 0, int(x1 * W / 3076), H)); c.thumbnail((900, 2200), Image.LANCZOS)
        c.save(SAIDA / "capas" / f"{k}.jpg", "JPEG", quality=84)
    nomes = [("a", "A", "Xadrez: verde e creme", "Duas cores alternadas. O mais simples de manter."),
             ("b", "B", "Três fundos em rodízio", "Verde, creme e dourado. É o que a grade lá em cima usa."),
             ("c", "C", "Uma capa por série", "Cada série com a sua cara: laudo, número, foto, pergunta.")]
    figs = "".join(f"<figure><img src='revisao/capas/{k}.jpg' loading='lazy' alt='Simulação do perfil com a opção {L}: {E(t, quote=True)}'>"
                   f"<figcaption><b>{L}.</b> {E(t)}. <span>{E(d)}</span></figcaption></figure>" for k, L, t, d in nomes)
    bot = "".join(f"<button type='button' data-capa='{L}' aria-pressed='false'>{L}</button>" for _, L, _, _ in nomes)
    return f"""
<section class="bloco" id="capas" data-id="capas">
  <h2>Uma decisão que ainda falta</h2>
  <p class="sub">O esquema das capas, para o perfil não virar uma parede verde. Arraste para ver as três opções.</p>
  <div class="opcoes" tabindex="0" role="group" aria-label="Três opções de grade">{figs}</div>
  <div class="votos capa" role="group" aria-label="Escolha o esquema das capas">{bot}<button type="button" data-capa="?" aria-pressed="false">Ainda não sei</button></div>
  <p class="st" data-st aria-live="polite"></p>
</section>"""

PAGINA = (HERE / "revisao_modelo.html").read_text(encoding="utf-8")
if __name__ == "__main__":
    ids = json.dumps([[f"p{n}", pid, TX[pid]["titulo"]] for n, pid in enumerate(ORDEM, 1)], ensure_ascii=False)
    out = (PAGINA.replace("%%GRADE%%", grade()).replace("%%POSTS%%", "".join(cartao(n, pid) for n, pid in enumerate(ORDEM, 1)))
           .replace("%%CAPAS%%", opcoes()).replace("%%IDS%%", ids).replace("%%TOTAL%%", str(len(ORDEM))))
    assert "%%" not in out
    (SAIDA / "lote-2026-10-03.html").write_text(out, encoding="utf-8")
    arquivos = sorted({m for m in re.findall(r"(?:src|poster)='((?:midia|revisao)/[^']+)'", out)})
    faltam = [a for a in arquivos if not (RAIZ / a).exists()]
    (SAIDA / "arquivos.json").write_text(json.dumps(arquivos, indent=0), encoding="utf-8")
    print(len(out), "bytes;", len(arquivos), "arquivos;", sum((RAIZ / a).stat().st_size for a in arquivos if (RAIZ / a).exists()) // 1024, "KB; faltam:", faltam)
