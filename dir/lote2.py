#!/usr/bin/env python3
# Segundo lote (03/10/2026), refeito a partir do retorno dele. Postagens liberadas por ele em 10/10/2026:
# cada post foi conferido na fonte primária por um checador independente e corrigido antes de ir ao ar (ver posts/<id>.json).
# O que mudou em relação ao primeiro lote:
# - gancho: a capa diz o assunto, traz uma cena em que a pessoa se reconhece (nela ou em alguém da família) e promete algo específico;
# - o slide 2 funciona como segunda capa (o Instagram mostra o carrossel de novo a partir dele);
# - cada slide traz a ideia inteira: o que é, por quê e o que fazer (nada de slide com uma frase solta);
# - desenho que explica, dentro de um quadro e com legenda, no lugar de enfeite; desenhos variados e de saúde;
# - uma capa por série (opção C); posição do texto variada; três posts testam outros tipos de letra;
# - temas do público dele (mulheres de 25 anos ou mais): cólica forte, mamografia aos 40, pedra na vesícula.
# Regra: nenhuma afirmação de saúde vai ao ar sem conferência na fonte primária.
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import arte as A
P = A.P
OUT = HERE.parent / "midia"
tb, hi = A.tb, A.hi

def render(post, kind, theme, d, n, total, seg, letra=None):
    serie, letra = post["serie"], letra or post.get("letra", "instrument")
    top = f"<div class='serie'>{serie}</div>"
    pg = "" if n == 1 else f"<div class='pg'>{n}/{total}</div>"
    if kind == "capa":
        des = f"<div class='capa-des'>{d['des']}</div>" if d.get("des") else ""
        estilo = " style='max-width:560px'" if d.get("des") else ""
        return A.page(theme, top + A.line(d.get("line", "reta")) + f"<div class='capa'>{A.titulo('h1', d['h1'])}<p{estilo}>{d['sub']}</p></div>" + des, letra)
    if kind == "sinais":
        return A.page("green sinais", f"<div class='painel'>{d['des']}</div>" + top + A.line("reta")
                      + f"<div class='faixa'>{A.titulo('h1', d['h1'])}<p>{d['sub']}</p></div>", letra)
    if kind == "num":
        return A.page(theme + " num", top + A.line("reta") + f"<div class='q'>{d['q']}</div><div class='bx'><div class='n'>{d['n']}</div><p>{d['sub']}</p></div>", letra)
    if kind == "ideia":
        pos = d.get("pos", "base")
        k = f"<div class='k'>{d['k']}</div>" if d.get("k") else ""
        par = f"<p>{d['p']}</p>" if d.get("p") else ""
        txt = k + A.titulo("h2", d["h2"]) + par
        if d.get("des"):       # texto + quadro com o desenho; o quadro ocupa o espaço que sobra
            rot = f"<div class='rot'>{d['rot']}</div>" if d.get("rot") else ""
            fig = f"<div class='fig {d.get('fig', '')}'>{d['des']}{rot}</div>"
            tx = f"<div class='tx'>{txt}</div>"
            bloco = f"<div class='col' data-start='{d.get('start', 132)}'>{tx + fig if pos == 'topo' else fig + tx}</div>"
        elif pos == "meio": bloco = f"<div class='meio'><div class='tx' data-max='800' data-start='{d.get('start', 230)}'>{txt}</div></div>"
        else: bloco = f"<div class='{pos} tx' data-max='790' data-start='{d.get('start', 230)}'>{txt}</div>"
        return A.page(theme, top + A.line(seg) + bloco + pg, letra)
    if kind == "lista":
        k = f"<div class='k'>{d['k']}</div>" if d.get("k") else ""
        rows = "".join(f"<div class='row'>{i}<span>{t}</span></div>" for i, t in d["rows"])
        return A.page(theme, top + A.line(seg) + f"<div class='topo' data-max='900' data-start='{d.get('start', 124)}'>{k}{A.titulo('h2', d['h2'])}<div class='rows'>{rows}</div></div>" + pg, letra)
    if kind == "fim":
        li = "".join(f"<li>{x}</li>" for x in d["items"])
        return A.page(theme + " fim", top + A.line("reta") + f"<div class='top' data-max='930' data-start='124'>{A.titulo('h2', d['h2'])}<ul>{li}</ul></div>"
                      f"<div class='pe'><div class='env'>{d['env']}</div><div class='src'>{d['src']}</div></div>" + pg, letra)
    raise ValueError(kind)

AVISO = "Conteúdo educativo, não substitui consulta."
ROTULO = [("Valor energético (kcal)", "445", "356", "18"), ("Gorduras totais (g)", "18", "14", "22"), ("Sódio (mg)", "750", "600", "30")]
def vasos():
    return (f"<div class='vasos'><figure>{A.vaso(380, False)}<figcaption>Pouco sal</figcaption></figure>"
            f"<figure>{A.vaso(380, True)}<figcaption>Muito sal: mais líquido</figcaption></figure></div>")
def corpo_dor(px):          # onde dói a vesícula: em cima, do lado direito de quem sente
    return A.corpo(px, A.marca(9.6, 17.6))
def utero_focos(px):        # endometriose: os pontos são o tecido fora do útero
    pts = "".join(f"<circle cx='{x}' cy='{y}' r='1.9' fill='var(--marca)'/>" for x, y in ((6.5, 30.5), (41.5, 31), (12.5, 39), (36, 40), (24, 44.5)))
    return hi("female_reproductive_system", px, pts)

POSTS = [
 # ---------------------------------------------------------------- 1. sal (refeito: gancho, porquê, rótulo)
 dict(slug="2026-10-03-sal-no-rotulo", serie="Mito ou verdade", antes="2026-10-03-sal-por-dia", slides=[
  ("capa", "gold", dict(h1="“Quase não<br>uso sal.”<br><i>O rótulo diz<br>outra coisa.</i>", sub="Pressão alta: como achar o sal escondido em 10 segundos.")),
  ("ideia", "green", dict(pos="topo", h2="Pressão alta e sal: o saleiro é só <i>parte da conta.</i>", p="Boa parte do sódio já vem dentro da comida pronta. E ele está escrito no rótulo.",
        des=A.fluxo([(tb("salt", 250), "O sal que você põe"), (tb("package", 250), "O sal que já vem na comida pronta")], 250, "mais"))),
  ("ideia", "cream", dict(k="Por que o sal sobe a pressão", h2="O sódio puxa água para dentro dos vasos.", p="Mais líquido no mesmo cano, mais pressão na parede. É como abrir mais a torneira de uma mangueira.", des=vasos())),
  ("ideia", "green", dict(pos="topo", h2="O limite do dia inteiro é <i>menos de 1 colher de chá.</i>", p="Contando o sal que já vem dentro da comida pronta.", des=hi("sugar_alt", 300), rot="Pouco menos de 1 colher de chá = 5 g de sal<br>5 g de sal = 2.000 mg de sódio")),
  ("lista", "cream", dict(h2="Onde ele <i>se esconde</i>", rows=[(tb("bread", 92), "Pão de forma e biscoitos"), (tb("soup", 92), "Macarrão instantâneo e sopa pronta"),
        (tb("meat", 92), "Presunto, salsicha e linguiça"), (tb("bowl-spoon", 92), "Tempero pronto, caldo e molhos"), (tb("cheese", 92), "Queijos e salgadinhos")])),
  ("ideia", "green", dict(pos="topo", h2="No rótulo, procure a linha <i>sódio.</i>", p="O %VD mostra quanto do limite do dia aquela porção já gastou. Veja se a porção é a que você come.", des=A.rotulo(ROTULO, "Sódio (mg)", "30% do dia!"), fig="limpo")),
  ("ideia", "cream", dict(h2="Viu esta lupa na frente da embalagem?", p="Ela é obrigatória a partir de 600 mg de sódio em 100 g (líquidos: 300 mg em 100 ml). Sem lupa? Olhe a tabela mesmo assim.", des=A.lupa())),
  ("fim", "green", dict(h2="Três mudanças <i>para começar</i>", items=["Cozinhe com menos sal, prove antes de salgar e tire o saleiro da mesa.", "Entre duas marcas, leve a de menor sódio.", "Troque tempero pronto por alho, cebola, ervas e limão."],
        env="Envie para quem diz que “quase não usa sal”.", src="Fontes: OMS, ANVISA, IBGE e American Heart Association. " + AVISO)),
 ]),
 # ---------------------------------------------------------------- 2. diabetes (refeito: cena, porquê de cada sinal)
 dict(slug="2026-10-03-diabetes-5-sinais", serie="Sinais do corpo", antes="2026-10-03-diabetes-sinais", slides=[
  ("sinais", "green", dict(h1="Sede o dia todo.<br>Xixi a noite inteira.", sub="Em você ou na sua mãe: 5 sinais de diabetes que parecem “coisa da idade”.",
        des=A.linha([tb("bottle", 250), hi("toilet_paper", 250), tb("moon-stars", 250)], 64))),
  ("ideia", "cream", dict(pos="meio", h2="Diabetes tipo 2:<br>5 sinais que<br><i>passam batido.</i>", p="E por que cada um acontece. Em você ou em alguém da sua família.")),
  ("ideia", "green", dict(k="Sinal 1", h2="Sede e xixi toda hora", p="O açúcar que sobra no sangue sai pela urina e leva água junto. Aí o corpo pede mais água.",
        des=A.fluxo([(hi("blood_drop", 170), "Açúcar sobra no sangue"), (hi("toilet_paper", 170), "Sai na urina, com água"), (tb("bottle", 170), "Dá sede")], 170))),
  ("ideia", "cream", dict(pos="topo", k="Sinal 2", h2="Cansaço e fome fora do normal", p="O açúcar fica no sangue e não entra direito nas células. Falta energia, e o corpo pede comida.",
        des=A.fluxo([(hi("sleepy", 200), "Falta energia"), (hi("hot_meal", 200), "O corpo pede comida")], 200, "mais"))),
  ("ideia", "green", dict(k="Sinal 3", h2="Visão embaçada", p="O açúcar alto muda o líquido das lentes dos olhos. Costuma melhorar quando ele baixa, mas precisa ser avaliada.", des=hi("low_vision", 300))),
  ("ideia", "cream", dict(pos="topo", k="Sinal 4", h2="Feridas que demoram e infecções que voltam", p="O açúcar alto atrapalha a circulação e a defesa do corpo. Na mulher, entram candidíase e infecção urinária de repetição.", des=hi("bandage_adhesive", 230))),
  ("ideia", "green", dict(k="Sinal 5", h2="Formigamento nos pés e nas mãos", p="Com o tempo, o açúcar alto machuca os nervos.", des=A.linha([hi("foot", 260), A.mao_formiga(250)], 90))),
  ("ideia", "cream", dict(pos="meio", h2="E muitas vezes:<br><i>nenhum sinal.</i>", p="Em muita gente, o diabetes tipo 2 fica anos sem dar sintoma. Por isso o exame de sangue é indicado para todo mundo a partir dos 35 anos.")),
  ("fim", "green", dict(h2="Lembrou de <i>alguém?</i>", items=["O exame é de sangue: glicemia de jejum ou hemoglobina glicada.", "Reconheceu os sinais em você? Marque uma consulta e peça o exame.", "Tem 35 anos ou mais e nunca fez? Vale pedir, mesmo sem sintoma."],
        env="Envie para a pessoa em quem você pensou.", src="Fontes: Ministério da Saúde, Sociedade Brasileira de Diabetes, NIDDK e Mayo Clinic. " + AVISO)),
 ]),
 # ---------------------------------------------------------------- 3. AVC (aprovado; ganhou cena na capa, desenhos e o porquê da pressa)
 dict(slug="2026-10-03-avc-sinais-v2", serie="Sinais do corpo", antes="2026-10-03-avc-sinais", slides=[
  ("sinais", "green", dict(h1="A boca entortou.<br>A fala enrolou.", sub="Pode ser AVC. 5 sinais que aparecem de repente e um teste de 1 minuto para fazer na hora.", des=A.linha([hi("woozy", 320), A.fala(280)], 80))),
  ("ideia", "cream", dict(pos="meio", h2="AVC: os sinais<br>aparecem<br><i>de repente</i>", p="Quanto mais cedo o socorro, maior a chance de recuperar. Veja os 5 sinais e o teste de 1 minuto.")),
  ("ideia", "green", dict(k="Sinal 1", h2="Um lado do corpo fraco ou formigando", p="No rosto, no braço ou na perna. Quase sempre de um lado só.", des=A.bracos(300), rot="Um dos braços não sustenta")),
  ("ideia", "cream", dict(pos="topo", k="Sinal 2", h2="A fala <i>enrola</i>", p="Ou a pessoa fica confusa e não entende o que você diz.", des=A.fala(300))),
  ("ideia", "green", dict(k="Sinal 3", h2="A visão muda <i>de repente</i>", p="Em um olho ou nos dois: a visão embaça ou fica dobrada.", des=hi("low_vision", 300))),
  ("ideia", "cream", dict(pos="topo", k="Sinal 4", h2="Tontura e perda de <i>equilíbrio</i>", p="Dificuldade para andar ou para coordenar os movimentos.", des=A.tonto(310))),
  ("ideia", "green", dict(k="Sinal 5", h2="Dor de cabeça forte, <i>do nada</i>", p="Intensa e sem causa aparente.", des=hi("headache", 300))),
  ("ideia", "cream", dict(pos="topo", h2="Na dúvida, <i>peça três coisas</i>", p="Falhou em uma? Ligue 192. Passou nas três, mas tem outro sinal? Ligue também.", fig="limpo",
        des=A.trio([(hi("woozy", 240), "Sorriso", "A boca fica torta?"), (A.bracos(240), "Abraço", "Um dos braços cai?"), (A.fala(240), "Frase", "A fala sai enrolada?")]))),
  ("ideia", "green", dict(k="Por que correr", h2="O remédio que desfaz o coágulo tem hora para ser dado", p="Em geral, até 4 horas e meia do começo. Passou disso? Vá do mesmo jeito: ainda há tratamento. Anote a hora em que tudo começou.", des=tb("hourglass", 260))),
  ("fim", "cream", dict(h2="Viu um sinal? <i>Ligue 192.</i>", items=["É o SAMU. Não conseguiu? Ligue 193, dos Bombeiros.", "Sem ambulância? Leve direto a um hospital, não a posto de saúde nem UPA.", "Não espere melhorar."],
        env="Envie para a sua família.", src="Fontes: Ministério da Saúde e Sociedade Brasileira de AVC. " + AVISO)),
 ]),
 # ---------------------------------------------------------------- 4. medir a pressão (aprovado; gancho de erro comum, desenho da postura e o número)
 dict(slug="2026-10-03-medir-pressao-v2", serie="Para salvar", antes="2026-10-03-medir-pressao", slides=[
  ("capa", "green", dict(h1="Se você mede<br>a pressão assim que<br>chega em casa,<br><i>o número pode sair errado.</i>", sub="O jeito certo, em 5 passos.", des=hi("blood_pressure_monitor", 300))),
  ("ideia", "cream", dict(pos="meio", h2="Como medir a<br>pressão em casa<br><i>sem errar o número</i>", p="5 cuidados antes de apertar o botão. Sem eles, o número costuma sair mais alto do que o real.")),
  ("ideia", "green", dict(k="Passo 1", h2="Sem café, cigarro, álcool ou exercício antes", p="Tudo isso altera o número por um tempo. Café, cigarro, álcool ou comida: espere 30 minutos. Exercício: 1 hora e meia.",
        des=A.linha([tb("coffee-off", 178), hi("smoking_cessation", 178), hi("alcohol_cessation", 178), hi("running", 178)], 26))),
  ("ideia", "cream", dict(pos="topo", k="Passo 2", h2="Esvazie a bexiga", p="Bexiga cheia também empurra o número para cima.", des=hi("toilet_paper", 320), rot="Vá ao banheiro antes de medir")),
  ("ideia", "green", dict(k="Passo 3", h2="Sente e descanse 5 minutos", p="Em um lugar calmo. O corpo precisa sair do ritmo da rua.", des=A.linha([tb("armchair", 250), tb("clock", 250)], 80))),
  ("ideia", "cream", dict(pos="topo", k="Passo 4", h2="Costas e pés apoiados", p="Pernas descruzadas. Sem apoio, o corpo faz força e o número sobe.", des=A.postura(520, (("costas", "1"), ("pes", "2"))), rot="<b>1</b> costas apoiadas · <b>2</b> pés no chão", fig="justo")),
  ("ideia", "green", dict(pos="topo", k="Passo 5", h2="Braço apoiado, na<br>altura do coração", p="E sem conversar durante a medida.", des=A.postura(520, (("braco", "♥"),)), rot="A braçadeira fica na linha do coração", fig="justo")),
  ("ideia", "cream", dict(pos="meio", k="E o número?", h2="Em casa, alta é<br><i>130 por 80</i><br>ou mais.", p="Vale a média de vários dias, não uma medida só. Basta um dos dois números passar. Anote e leve ao médico.")),
  ("fim", "green", dict(h2="Para <i>guardar</i>", items=["Antes: sem café, cigarro, álcool ou exercício.", "Bexiga vazia e 5 minutos de descanso, sentada.", "Costas e braço apoiados, pés no chão, sem conversar."],
        env="Envie para quem mede a pressão em casa.", src="Fontes: diretrizes brasileiras de medida da pressão (2023) e de hipertensão (2025) e Ministério da Saúde (2025). " + AVISO)),
 ]),
 # ---------------------------------------------------------------- 5. exercício (aprovado; desenhos e teste de letra: Fraunces)
 dict(slug="2026-10-03-exercicio-150-v2", serie="Para salvar", letra="fraunces", antes="2026-10-03-exercicio-por-semana", slides=[
  ("capa", "green", dict(h1="Você não precisa<br>de 1 hora de<br>academia <i>por dia.</i>", sub="150 minutos por semana já ajudam a proteger o coração. Veja como encaixar na rotina.", des=hi("walking", 300))),
  ("ideia", "cream", dict(pos="meio", h2="A meta da OMS:<br>pelo menos<br><i>150 minutos</i><br>por semana", p="De atividade moderada. É menos do que parece.")),
  ("ideia", "green", dict(h2="30 minutos,<br>5 dias na semana", p="Não precisa ser de uma vez: blocos curtos ao longo do dia também contam. Cada minuto conta.", des=A.semana())),
  ("ideia", "cream", dict(pos="topo", h2="O que é <i>“moderada”?</i>", p="É a atividade em que você consegue conversar, mas não cantar. Caminhada rápida, bicicleta, dança.", des=hi("forum", 290), rot="Dá para conversar. Não dá para cantar.")),
  ("ideia", "green", dict(h2="Todo movimento <i>conta</i>", p="Descer um ponto antes, subir de escada, ir a pé à padaria.", des=A.linha([hi("walking", 230), tb("stairs-up", 230), hi("exercise_bicycle", 230)], 50))),
  ("lista", "cream", dict(h2="O que você <i>ganha</i>", rows=[(hi("blood_pressure", 92), "Menos risco de pressão alta e de diabetes tipo 2"), (hi("heart_cardiogram", 92), "Menos risco de morrer de doença do coração"), (tb("moon-stars", 92), "Sono e humor melhores")])),
  ("fim", "green", dict(h2="Não chega a 150? <i>Faça o que der.</i>", items=["Qualquer quantidade é melhor do que nenhuma.", "Comece com 10 minutos hoje.", "Dor no peito ou tontura no esforço? Pare e procure atendimento."],
        env="Envie para a amiga que topa caminhar com você.", src="Fontes: OMS (2020) e Ministério da Saúde (2021). " + AVISO)),
 ]),
 # ---------------------------------------------------------------- 6. cólica forte (tema do público; teste de letra: Playfair)
 dict(slug="2026-10-03-colica-forte", serie="Isso é normal?", letra="playfair", slides=[
  ("capa", "cream", dict(h1="Cólica que faz<br>você faltar ao<br>trabalho <i>não<br>é normal.</i>", sub="5 sinais de que a sua cólica merece investigação.", line="vale", des=hi("female_reproductive_system", 270))),
  ("ideia", "green", dict(pos="topo", h2="Cólica forte não é <i>“coisa de mulher”</i>", p="Cerca de 1 em cada 10 mulheres em idade fértil tem endometriose. Muitas passam anos ouvindo que é normal.", des=A.pessoas(10, 1, "woman", 170, 5))),
  ("ideia", "cream", dict(k="Sinal 1", h2="A dor tira você da rotina", p="Faltar ao trabalho, cancelar planos ou ficar de cama por causa da cólica é sinal de alerta.", des=A.regua(11), rot="De 0 a 10, que nota você dá para a sua cólica?")),
  ("ideia", "green", dict(pos="topo", k="Sinal 2", h2="O remédio comum não resolve", p="Ou a dor vem piorando com os meses. Não aumente a dose por conta própria.", des=hi("pills_2", 280))),
  ("ideia", "cream", dict(pos="meio", k="Sinal 3", h2="Dor na<br><i>relação sexual</i>", p="Principalmente uma dor profunda, que se repete.")),
  ("ideia", "green", dict(k="Sinal 4", h2="Dor para evacuar ou urinar na menstruação", p="O intestino e a bexiga também podem ser atingidos.", des=A.fluxo([(hi("intestine", 210), "Intestino"), (hi("bladder", 210), "Bexiga")], 210, "mais"))),
  ("ideia", "cream", dict(pos="topo", k="Sinal 5", h2="Dificuldade para engravidar", p="A endometriose pode dificultar a gravidez.", des=tb("baby-carriage", 280))),
  ("ideia", "green", dict(k="Uma causa importante", h2="Endometriose", p="É quando um tecido parecido com o de dentro do útero cresce fora dele e causa inflamação e dor.", des=utero_focos(290), rot="Os pontos mostram o tecido fora do útero")),
  ("fim", "cream", dict(h2="O que <i>fazer</i>", items=["Marque consulta no posto de saúde ou com ginecologista.", "Até lá, anote os dias de dor, a nota de 0 a 10 e o que deixou de fazer.", "Leve as anotações para a consulta."],
        env="Envie para a amiga que sofre todo mês.", src="Fontes: OMS, Ministério da Saúde, FEBRASGO e NICE. " + AVISO)),
 ]),
 # ---------------------------------------------------------------- 7. mamografia aos 40 (tema do público; capa de número; teste de letra: DM Serif)
 dict(slug="2026-10-03-mamografia-40", serie="Entenda seu exame", letra="dmserif", slides=[
  ("num", "cream", dict(q="A mamografia já<br>pode começar aos", n="40", sub="Agora é lei no SUS. Veja o que vale para cada idade.")),
  ("ideia", "green", dict(pos="meio", h2="Mamografia<br>aos 40:<br><i>agora é lei</i>", p="Desde 2025, o SUS garante o exame a partir dos 40 anos para quem quiser fazer. Não precisa ter sintoma.")),
  ("ideia", "cream", dict(pos="topo", h2="O que vale para <i>cada idade</i>", fig="limpo",
        des=A.idades([("40 a 49", "Pode fazer, depois de conversar com o profissional de saúde."), ("50 a 74", "A cada 2 anos, mesmo sem sintoma nenhum."), ("75 ou +", "Pode fazer, depois da mesma conversa.")]))),
  ("ideia", "green", dict(h2="Por que olhar <i>antes dos 50</i>", p="Quase 1 em cada 4 casos de câncer de mama aparece entre os 40 e os 49 anos.", des=A.pessoas(4, 1, "woman", 230, 4))),
  ("lista", "cream", dict(k="Em qualquer idade", h2="Não espere o exame se notar", rows=[(hi("magnifying_glass", 92), "Caroço na mama ou na axila"), (hi("breasts", 92), "Pele repuxada ou avermelhada"), (hi("blood_drop", 92), "Bico do peito que mudou ou solta líquido")], start=104)),
  ("ideia", "green", dict(pos="topo", h2="Mãe ou irmã com câncer de mama?", p="Principalmente antes dos 50 anos: fale com o médico. Ele avalia o seu risco e define o seu acompanhamento.", des=A.linha([hi("old_woman", 260), hi("woman", 260)], 60))),
  ("fim", "cream", dict(h2="Para <i>guardar</i>", items=["40 a 49 anos: pode fazer, depois de conversar com o profissional de saúde.", "50 a 74 anos: a cada 2 anos, mesmo sem sintoma.", "Sinal na mama: procure avaliação em qualquer idade."],
        env="Envie para a amiga que fez 40.", src="Fontes: Ministério da Saúde, INCA e Lei 15.284/2025. " + AVISO)),
 ]),
 # ---------------------------------------------------------------- 8. pedra na vesícula (tema do público, com ponte para cirurgia)
 dict(slug="2026-10-03-pedra-na-vesicula", serie="Sinais do corpo", slides=[
  ("sinais", "green", dict(h1="Dor em cima,<br>do lado direito,<br>depois de comer gordura.", sub="Pode ser pedra na vesícula. Veja onde dói, quando dói e quando correr para o pronto-socorro.",
        des=f"{corpo_dor(350)}<div class='rot' style='max-width:400px;text-align:left;font-size:40px'>A dor costuma ser aqui, logo abaixo das costelas</div>")),
  ("ideia", "cream", dict(pos="topo", h2="Pedra na vesícula: <i>a dor que avisa</i>", p="Cerca de 1 em cada 10 adultos tem. É mais comum em mulheres, depois dos 40.", des=A.pessoas(10, 1, "person", 170, 5))),
  ("ideia", "green", dict(k="Onde dói", h2="Em cima, do lado direito da barriga", p="Ou na “boca do estômago”. Pode ir para as costas ou para o ombro direito.", des=corpo_dor(300), rot="Lado direito de quem sente a dor", fig="lado")),
  ("ideia", "cream", dict(pos="topo", k="Quando dói", h2="Muitas vezes depois de refeição pesada ou gordurosa", p="É comum à noite. Costuma durar de 30 minutos a algumas horas. Passou? Marque consulta mesmo assim.", des=A.linha([hi("unhealthy_food", 250), tb("clock", 250)], 80))),
  ("ideia", "green", dict(k="Por que dói", h2="A vesícula guarda a bile, que ajuda a digerir a gordura", p="Com pedra no caminho, ela aperta para esvaziar e dói.", des=hi("gallbladder", 270), rot="A vesícula é uma “bolsa” embaixo do fígado", fig="lado")),
  ("lista", "cream", dict(k="Sinais de urgência", h2="Vá ao pronto-socorro se tiver", rows=[(hi("thermometer", 92), "Febre ou calafrios"), (hi("eye", 92), "Pele ou olhos amarelados"), (hi("urine_sample", 92), "Urina escura ou fezes claras"), (tb("clock", 92), "Dor forte que não passa em algumas horas, ou com vômitos")], start=104)),
  ("ideia", "green", dict(pos="topo", k="Como se descobre", h2="Com um ultrassom <i>de abdome</i>", p="É um exame simples e sem dor. Quem pede e avalia é o médico.", des=hi("ultrasound_scanner", 300))),
  ("fim", "cream", dict(h2="Quem tem <i>mais chance</i>", items=["Mulheres, principalmente depois dos 40.", "Quem está acima do peso.", "Quem emagreceu muito rápido."],
        env="Envie para quem vive com “má digestão”.", src="Fontes: Ministério da Saúde, NIDDK, NHS e Mayo Clinic. " + AVISO)),
 ]),
]

def captura(pg, html, destino):
    f = HERE / "_s.html"; f.write_text(html, encoding="utf-8")
    pg.goto(f.as_uri()); pg.wait_for_selector("body[data-ok]", state="attached"); pg.wait_for_timeout(60)
    over = pg.evaluate("document.body.dataset.over || ''"); h2 = pg.evaluate("(document.querySelector('.col') || {dataset: {}}).dataset.h2 || ''")
    png = destino.with_suffix(".png"); pg.screenshot(path=str(png)); f.unlink()
    Image.open(png).convert("RGB").save(destino, "JPEG", quality=93); png.unlink()
    return over.strip(), h2

if __name__ == "__main__":
    only = sys.argv[1:]
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        pg = b.new_page(viewport={"width": 1080, "height": 1350}, device_scale_factor=1)
        for post in POSTS:
            if only and not any(o in post["slug"] for o in only): continue
            d = OUT / post["slug"]; d.mkdir(parents=True, exist_ok=True)
            for old in d.glob("[0-9][0-9].jpg"): old.unlink()
            total = len(post["slides"]); notas = []
            for i, (kind, theme, data) in enumerate(post["slides"], 1):
                over, h2 = captura(pg, render(post, kind, theme, data, i, total, "vale" if i % 2 else "reta"), d / f"{i:02d}.jpg")
                if over: notas.append(f"{i}: NÃO COUBE ({over})")
                elif h2: notas.append(f"{i}: título {h2}px")
            print(post["slug"], "|", "; ".join(notas))
        b.close()
    print("ok")
