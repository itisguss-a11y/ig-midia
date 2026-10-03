#!/usr/bin/env python3
# Legendas do segundo lote de teste (03/10/2026), com o que mudou em cada post e por quê. Gera posts/<id>.json. NÃO publicado.
# Regras de legenda que saíram do retorno dele e do estudo de social media:
# - a primeira linha é um segundo gancho, com a palavra que a pessoa buscaria;
# - a legenda ESTENDE o post (o caso, a exceção, quando procurar ajuda); não repete o que os slides já dizem;
# - um pedido só, específico, com destinatário ("envie para..."), igual ao do último slide;
# - no máximo 5 hashtags específicas; aviso e fontes uma vez, no fim.
# Fase de teste: o texto usa o que já foi pesquisado e o que é consenso. Antes de publicar para valer, conferir afirmação por afirmação.
import json, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
RAIZ = HERE.parent
sys.path.insert(0, str(HERE))
import lote_textos as L1
BASE = L1.BASE
AVISO = L1.AVISO
ESTADO = "teste: conferir as afirmações antes de publicar"

OMS_SAL, OMS_AF, MS_AVC, SBAVC, MS_DM, SBD, SBH, MS_DENGUE, MS_INFARTO = L1.OMS_SAL, L1.OMS_AF, L1.MS_AVC, L1.SBAVC, L1.MS_DM, L1.SBD, L1.SBH, L1.MS_DENGUE, L1.MS_INFARTO
AHA_SAL = "American Heart Association. Sodium and salt (o sódio em excesso puxa água para dentro dos vasos; a comparação com a mangueira) - https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/sodium/sodium-and-salt"
ANVISA_IN75 = "ANVISA. Instrução Normativa nº 75/2020 (valor diário de referência do sódio: 2.000 mg; lupa de alto em sódio a partir de 600 mg por 100 g) - https://bvsms.saude.gov.br/bvs/saudelegis/anvisa//2020/IN%2075_2020_.pdf"
ANVISA_ROT = "ANVISA. Rotulagem nutricional: novas regras (valores por 100 g e por porção; %VD) - https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2022/rotulagem-nutricional-novas-regras-entram-em-vigor-em-120-dias"
BHF_SAL = "British Heart Foundation. Salt (sódio x 2,5 = sal) - https://www.bhf.org.uk/informationsupport/support/healthy-living/healthy-eating/salt"
NIDDK = "NIDDK. Symptoms and causes of diabetes - https://www.niddk.nih.gov/health-information/diabetes/overview/symptoms-causes"
MAYO_DM = "Mayo Clinic. Diabetes symptoms: when diabetes symptoms are a concern (por que cada sinal acontece) - https://www.mayoclinic.org/diseases-conditions/diabetes/in-depth/diabetes-symptoms/art-20044248"
MS_AVC_PCDT = "Ministério da Saúde. Protocolo do AVC isquêmico agudo (trombólise até 4 horas e meia) - https://www.gov.br/saude/pt-br/assuntos/pcdt/a/acidente-vascular-cerebral-isquemico-agudo/@@download/file"
MS_HAS = "Ministério da Saúde. Protocolo de hipertensão arterial sistêmica, 2025 (em casa, alta é média de 130 por 80 ou mais) - https://www.gov.br/saude/pt-br/assuntos/pcdt/h/hipertensao-arterial-sistemica.pdf"
SBC_2020 = "Sociedade Brasileira de Cardiologia. Diretrizes Brasileiras de Hipertensão Arterial 2020 - https://www.scielo.br/j/abc/a/Z6m5gGNQCvrW3WLV7csqbqh/?lang=pt"
FEBRASGO = "FEBRASGO. Endometriose afeta uma em cada dez mulheres em idade fértil no Brasil (dor intensa no ciclo menstrual não é normal) - https://www.febrasgo.org.br/pt/noticias/item/2046-endometriose-doenca-afeta-uma-em-cada-dez-mulheres-em-idade-fertil-no-brasil"
OMS_ENDO = "Organização Mundial da Saúde. Endometriosis (o que é; sintomas; demora no diagnóstico) - https://www.who.int/news-room/fact-sheets/detail/endometriosis"
MS_MAMO = "Agência Brasil. Ministério da Saúde passa a recomendar mamografia a partir dos 40 anos (setembro de 2025) - https://agenciabrasil.ebc.com.br/saude/noticia/2025-09/ministerio-da-saude-passa-recomendar-mamografia-partir-dos-40-anos"
INCA = "INCA. Dados e números sobre câncer de mama - https://www.inca.gov.br/sites/ufu.sti.inca.local/files/media/document/relatorio_dados-e-numeros-ca-mama-2023.pdf"
ABCD = "Arquivos Brasileiros de Cirurgia Digestiva (ABCD). Revisão sobre colelitíase - http://www.scielo.br/j/abcd/a/yp8jRmJGgy3DZnkpyg8cTbk/?lang=en"
SBC_MULHER = "Sociedade Brasileira de Cardiologia. Posicionamento sobre Doença Isquêmica do Coração: a Mulher no Centro do Cuidado, 2023 - https://www.scielo.br/j/abc/a/NHTpGXKFCz7NKht5CYLDZZF/?lang=pt"
AHA_MULHER = "American Heart Association. Heart attack symptoms in women - https://www.heart.org/en/health-topics/heart-attack/warning-signs-of-a-heart-attack/heart-attack-symptoms-in-women"
MS_DENGUE_MANEJO = "Ministério da Saúde. Dengue: diagnóstico e manejo clínico (sem AAS e sem anti-inflamatório; hidratação) - https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/svsa/dengue/dengue-diagnostico-e-manejo-clinico-adulto-e-crianca"

POSTS = [
 dict(id="2026-10-03-sal-no-rotulo", tipo="carrossel", serie="Mito ou verdade", titulo="“Quase não uso sal.” O rótulo diz outra coisa.", antes="2026-10-03-sal-por-dia",
      formato="carrossel de 8 slides, capa dourada só com letra",
      seu_retorno="Gancho fraco e sem contexto; faltou explicar por que o sal faz mal e como age; faltou a ligação com o sódio da tabela nutricional; slide e legenda diziam a mesma coisa.",
      mudou=["Capa com uma frase que a pessoa diz (“quase não uso sal”) e a promessa: achar o sal escondido em 10 segundos",
             "Saiu a estatística do mundo; entrou o porquê: o sódio puxa água para dentro dos vasos",
             "Entrou o rótulo: a linha do sódio, o %VD e a lupa de “alto em sódio”",
             "A legenda agora traz o que não está nos slides: a conta sódio x 2,5 e o cuidado com o sal light"],
      quem_manda="Quem cozinha em casa manda para o pai, a mãe ou o marido que tem pressão alta e diz que “quase não usa sal”.",
      fontes=[OMS_SAL, AHA_SAL, ANVISA_IN75, ANVISA_ROT, BHF_SAL],
      legenda="""Pressão alta e sal: a conta não fecha só no saleiro.

No Brasil, mais da metade do sódio ainda vem do sal que a gente põe na comida. O resto já chega pronto, dentro do pão, do embutido, do tempero e do salgadinho. Por isso valem as duas frentes: menos sal na panela e olho no rótulo.

Um truque para o mercado: multiplique o sódio por 2,5 e você tem o sal. 400 mg de sódio é 1 grama de sal, um quinto do limite do dia.

Atenção ao sal light: ele troca parte do sódio por potássio. Quem tem doença nos rins ou usa remédio para pressão precisa perguntar ao médico antes de usar.

Envie para quem diz que “quase não usa sal”.

Conteúdo educativo, não substitui consulta.
Fontes: OMS; ANVISA; American Heart Association.

#pressaoalta #hipertensao #sodio #rotulodealimentos #alimentacaosaudavel"""),
 dict(id="2026-10-03-diabetes-5-sinais", tipo="carrossel", serie="Sinais do corpo", titulo="Sede o dia todo. Xixi a noite inteira.", antes="2026-10-03-diabetes-sinais",
      formato="carrossel de 9 slides, capa com desenho em cima e título embaixo",
      seu_retorno="Gancho fraco: devia ser algo em que a pessoa se reconhece, ou reconhece em alguém, como a sede que não passa. Não explicava do que se tratava. Slide com uma frase só não explica nada.",
      mudou=["Capa com a cena: sede o dia todo, xixi a noite inteira, em você ou na sua mãe",
             "Cada sinal ganhou o porquê e um desenho que mostra o que acontece",
             "O slide 2 diz o assunto de novo (o Instagram mostra o carrossel outra vez a partir dele)",
             "A legenda trata do exame: quem deve fazer, a partir de que idade e de quanto em quanto tempo"],
      quem_manda="A filha manda para a mãe ou para o pai que vive com sede e levanta à noite para ir ao banheiro.",
      fontes=[MS_DM, SBD, NIDDK, MAYO_DM],
      legenda="""Diabetes tipo 2 costuma chegar em silêncio, e os primeiros sinais são fáceis de culpar: o calor, a idade, o cansaço da semana.

O que resolve a dúvida é o exame, não o sintoma. Ele é de sangue e é simples: glicemia de jejum ou hemoglobina glicada. A recomendação é fazer a partir dos 35 anos, mesmo sem sentir nada. Antes disso, vale para quem está acima do peso e tem mais algum fator de risco, como pressão alta ou pai, mãe ou irmão com diabetes.

Resultado normal e poucos fatores de risco? Repete em 3 anos. Deu pré-diabetes? O controle passa a ser todo ano, e é a fase em que mudar a rotina mais funciona.

Pensou em alguém lendo isso? Envie para essa pessoa.

Conteúdo educativo, não substitui consulta.
Fontes: Ministério da Saúde; Sociedade Brasileira de Diabetes; NIDDK; Mayo Clinic.

#diabetes #diabetestipo2 #prediabetes #glicemia #sinaisdocorpo"""),
 dict(id="2026-10-03-avc-sinais-v2", tipo="carrossel", serie="Sinais do corpo", titulo="A boca entortou. A fala enrolou.", antes="2026-10-03-avc-sinais",
      formato="carrossel de 10 slides, capa com desenho em cima e título embaixo",
      seu_retorno="Gostou de tudo, mas sentiu falta de imagens para mostrar como é na prática.",
      mudou=["Cada sinal ganhou um desenho que mostra como ele aparece (o braço que cai, a fala que enrola)",
             "A capa virou uma cena (a boca entortou, a fala enrolou) no lugar da pergunta",
             "Entrou o porquê da pressa: o remédio que desfaz o coágulo só pode ser dado nas primeiras 4 horas e meia",
             "A legenda traz o que não está nos slides: o AVC passageiro e o que não fazer enquanto espera"],
      quem_manda="Quem mora com os pais ou os avós manda para o grupo da família.",
      fontes=[MS_AVC, SBAVC, MS_AVC_PCDT],
      legenda="""AVC é corrida contra o relógio: quanto antes o atendimento, mais cérebro é salvo.

Duas coisas que quase ninguém sabe:

1. Se os sinais sumirem sozinhos em poucos minutos, vá ao hospital do mesmo jeito. Pode ter sido um AVC passageiro, que é um aviso de que outro maior pode vir.

2. Não dê remédio, comida nem água enquanto espera. A pessoa pode engasgar, e alguns remédios pioram certos tipos de AVC.

Anote a hora em que os sinais começaram: é a primeira coisa que a equipe vai perguntar.

Envie para a sua família.

Conteúdo educativo, não substitui consulta.
Fontes: Ministério da Saúde; Sociedade Brasileira de AVC.

#avc #derrame #sinaisdeavc #samu192 #primeirossocorros"""),
 dict(id="2026-10-03-medir-pressao-v2", tipo="carrossel", serie="Para salvar", titulo="Se você mede a pressão assim que chega em casa, o número sai errado.", antes="2026-10-03-medir-pressao",
      formato="carrossel de 9 slides, capa verde com letra e desenho do aparelho",
      seu_retorno="Gostou. Só via desenho de coração e gota: pediu para variar os desenhos e sentiu falta de imagens.",
      mudou=["Desenhos novos e de saúde: o aparelho, a postura certa na cadeira, o que evitar antes",
             "A capa aponta o erro que muita gente comete, no lugar de um título neutro",
             "Entrou o número: em casa, alta é 130 por 80 ou mais",
             "A legenda traz o que não está nos slides: que aparelho usar, quando medir e o que levar ao médico"],
      quem_manda="Quem cuida dos pais manda para o pai ou a mãe que mede a pressão em casa.",
      fontes=[SBH, SBC_2020, MS_HAS],
      legenda="""Medir a pressão em casa só ajuda se o número for confiável. E o erro mais comum é medir com pressa.

Três coisas que o carrossel não mostrou:

• Aparelho: prefira o de braço, automático e validado. Os de pulso erram mais.
• Quando medir: de manhã, antes do café e dos remédios, e à noite, antes do jantar. Duas medidas de cada vez, com 1 minuto entre elas.
• O que levar ao médico: as anotações de pelo menos 5 dias, com data e hora.

Pressão muito alta junto com dor no peito, falta de ar, fraqueza de um lado do corpo ou dor de cabeça forte não é para esperar: é emergência.

Envie para quem mede a pressão em casa.

Conteúdo educativo, não substitui consulta.
Fontes: Diretrizes Brasileiras de Hipertensão; Ministério da Saúde.

#pressaoalta #hipertensao #medirpressao #pressaoarterial #saudedocoracao"""),
 dict(id="2026-10-03-exercicio-150-v2", tipo="carrossel", serie="Para salvar", titulo="Você não precisa de 1 hora de academia por dia.", antes="2026-10-03-exercicio-por-semana",
      formato="carrossel de 7 slides, capa verde com letra e desenho; letra de teste: Fraunces",
      seu_retorno="Gostou. Sentiu falta de imagens e pediu para testar outros tipos de letra.",
      mudou=["Letra de teste: Fraunces (a atual é a Instrument Serif)",
             "Desenhos novos: a semana com os 5 dias marcados, o teste da conversa, as formas de se mexer",
             "A capa tira um peso da pessoa (não precisa de 1 hora por dia) no lugar de dar um número solto",
             "A legenda traz o que não está nos slides: como começar depois de muito tempo parada"],
      quem_manda="Uma amiga manda para a outra, como convite para caminhar junto.",
      fontes=[OMS_AF],
      legenda="""150 minutos de exercício por semana parece muito até você dividir: dá pouco mais de 20 minutos por dia.

O que conta como moderado? Qualquer atividade que acelera o coração e a respiração, mas ainda deixa você conversar: caminhar rápido, dançar, pedalar, varrer o quintal com vontade.

Para quem está parada há muito tempo:

• Comece com 10 minutos por dia e aumente aos poucos.
• Prenda o exercício em algo que já existe na rotina: depois do almoço, na volta do trabalho, enquanto o filho está no treino.
• Duas vezes por semana, inclua força: subir escada, agachar, carregar peso.

Tem doença do coração, ou sente dor no peito ou falta de ar ao esforço? Converse com o médico antes de começar.

Envie para a amiga que topa caminhar com você.

Conteúdo educativo, não substitui consulta.
Fonte: Organização Mundial da Saúde.

#atividadefisica #caminhada #sedentarismo #saudedocoracao #rotinasaudavel"""),
 dict(id="2026-10-03-colica-forte", tipo="carrossel", serie="Isso é normal?", titulo="Cólica que faz você faltar ao trabalho não é normal.", antes=None,
      formato="carrossel de 9 slides, capa creme com letra e desenho; letra de teste: Playfair Display",
      seu_retorno="Pediu temas que mais atingem o seu público e que a pessoa se reconheça no post.",
      mudou=["Tema novo, do seu público: mulheres de 25 anos ou mais",
             "Letra de teste: Playfair Display",
             "Capa com uma situação que ela reconhece: faltar ao trabalho por causa da cólica",
             "Termo difícil (endometriose) explicado em um slide só dele, como você aprovou no post do exame"],
      quem_manda="A amiga manda para a amiga que sofre todo mês. A mãe manda para a filha.",
      fontes=[FEBRASGO, OMS_ENDO],
      legenda="""Cólica forte todo mês não é frescura, e “é assim mesmo” não é diagnóstico.

A endometriose costuma levar anos para ser descoberta, justamente porque a dor da mulher é tratada como normal.

O que faz a consulta render:

• Um diário de 2 ou 3 ciclos: os dias de dor, a nota de 0 a 10 e o que você deixou de fazer.
• Os remédios que tomou e se funcionaram.
• Se a dor aparece também fora da menstruação, na relação, ao evacuar ou ao urinar.

Nem toda cólica forte é endometriose: mioma e outras causas entram na investigação. O ponto é o mesmo: dor que tira você da rotina merece ser investigada.

Envie para a amiga que sofre todo mês.

Conteúdo educativo, não substitui consulta.
Fontes: FEBRASGO; Organização Mundial da Saúde.

#colica #endometriose #saudedamulher #dorpelvica #ginecologia"""),
 dict(id="2026-10-03-mamografia-40", tipo="carrossel", serie="Entenda seu exame", titulo="A mamografia já pode começar aos 40", antes=None,
      formato="carrossel de 7 slides, capa creme com número gigante; letra de teste: DM Serif Display",
      seu_retorno="Pediu temas que mais atingem o seu público. E outubro é o mês do Outubro Rosa.",
      mudou=["Tema novo, do seu público, e do mês (Outubro Rosa)",
             "Letra de teste: DM Serif Display",
             "Capa de número (a série dos exames usa número ou laudo na capa)",
             "Um quadro com o que vale para cada idade, e 1 em cada 4 casos mostrado com desenho"],
      quem_manda="A amiga manda para a amiga que fez 40. A filha manda para a mãe.",
      fontes=[MS_MAMO, INCA],
      legenda="""Mamografia aos 40: desde setembro de 2025, o SUS garante o exame a partir dessa idade para quem quiser fazer.

O que muda na prática:

• 40 a 49 anos: não é convocação. Você conversa com o profissional de saúde sobre os prós e os contras e decide.
• 50 a 74 anos: o exame é recomendado a cada 2 anos, mesmo sem sintoma.

Por que existe conversa antes dos 50? Nessa faixa, a mama costuma ser mais densa e o exame dá mais alarme falso, com biópsia que não precisava. Para muitas mulheres ainda vale a pena. A decisão é sua, com informação.

Quem tem mãe, irmã ou filha com câncer de mama ou de ovário entra em outra regra: o acompanhamento começa mais cedo e é definido pelo médico.

Envie para a amiga que fez 40.

Conteúdo educativo, não substitui consulta.
Fontes: Ministério da Saúde; INCA.

#mamografia #cancerdemama #outubrorosa #saudedamulher #prevencao"""),
 dict(id="2026-10-03-pedra-na-vesicula", tipo="carrossel", serie="Sinais do corpo", titulo="Dor do lado direito depois de comer gordura.", antes=None,
      formato="carrossel de 8 slides, capa com desenho em cima e título embaixo",
      seu_retorno="Pediu temas que mais atingem o seu público. Este também faz a ponte com a cirurgia, a área que você pretende seguir.",
      mudou=["Tema novo: pedra na vesícula é mais comum em mulheres, depois dos 40",
             "Capa com a cena: a dor do lado direito depois de comer gordura",
             "O desenho do corpo mostra onde dói",
             "Faz a ponte com a cirurgia sem oferecer consulta nem procedimento"],
      quem_manda="Quem convive com alguém que vive com “má digestão” depois de comer gordura.",
      fontes=[ABCD],
      legenda="""Pedra na vesícula: muita gente tem e nem sabe. O problema começa quando ela dói.

Quem tem pedra e nunca sentiu nada, em geral, só acompanha. Quando a dor aparece, ela tende a voltar, e aí a conversa costuma ser a cirurgia: a retirada da vesícula, quase sempre por vídeo, com cortes pequenos.

Dá para viver sem vesícula? Dá. O fígado continua produzindo a bile; ela só deixa de ficar guardada.

Enquanto a consulta não chega, refeições menores e com menos gordura costumam diminuir as crises. Chá e “limpeza de vesícula” não dissolvem pedra.

Com febre, pele amarelada ou dor que não passa, o caminho é o pronto-socorro.

Envie para quem vive com “má digestão”.

Conteúdo educativo, não substitui consulta.
Fonte: revisão brasileira de cirurgia digestiva (ABCD, 2019).

#pedranavesicula #vesicula #dornabarriga #cirurgia #saudedamulher"""),
 dict(id="2026-10-03-dengue-febre-baixou-v2", tipo="reel", serie="Sinais do corpo", titulo="A febre da dengue baixou? É agora que você precisa ficar de olho.", duracao="31 s", antes="2026-10-03-dengue-febre-baixou",
      formato="reel de 31 s, fundo verde, texto animado com o gráfico da febre em movimento",
      seu_retorno="Gostou. O desenho em movimento (a curva da febre) podia ser mais explorado.",
      mudou=["O gráfico virou o centro do vídeo: a curva se desenha, a fase de alerta acende e ele fica na tela enquanto os sinais entram",
             "O gancho inteiro já aparece no primeiro quadro (antes, a segunda parte entrava 1 segundo depois)",
             "Entrou o que fazer em casa: beber líquido e não tomar AAS nem anti-inflamatório"],
      quem_manda="Quem tem alguém com dengue em casa manda para quem está cuidando.",
      fontes=[MS_DENGUE, MS_DENGUE_MANEJO],
      legenda="""Dengue: a febre baixar não é sinal de alta.

A fase mais delicada costuma ser entre o 3º e o 7º dia, justamente quando a febre cai. É nela que aparecem os sinais de alerta do vídeo.

Em casa, o tratamento é líquido e repouso: água, soro caseiro, água de coco, suco. Para dor e febre, só o que o serviço de saúde orientar. AAS, ibuprofeno, diclofenaco e outros anti-inflamatórios aumentam o risco de sangramento.

Grávidas, crianças pequenas, idosos e quem tem doença crônica devem ser avaliados logo no começo, mesmo sem sinal de alerta.

Envie para quem está com dengue em casa.

Conteúdo educativo, não substitui consulta.
Fonte: Ministério da Saúde.

#dengue #sinaisdealerta #dengueemcasa #hidratacao #saudepublica"""),
 dict(id="2026-10-03-infarto-na-mulher", tipo="reel", serie="Sinais do corpo", titulo="Infarto em mulher nem sempre é dor forte no peito.", duracao="33 s", antes="2026-10-03-infarto-dor-no-peito",
      formato="reel de 33 s, fundo creme, texto animado com o corpo que acende onde cada sinal aparece",
      seu_retorno="Mais ou menos: de novo, problema de gancho.",
      mudou=["Gancho novo e voltado ao seu público: infarto em mulher nem sempre é dor forte no peito",
             "O gancho inteiro, com a promessa (4 sinais), já está no primeiro quadro",
             "Desenho em movimento: o traçado do coração corre na tela e o corpo acende onde cada sinal aparece",
             "O pedido final tem destinatário: a sua mãe, a sua irmã, a sua amiga"],
      quem_manda="A mulher manda para a mãe, a irmã e a amiga.",
      fontes=[SBC_MULHER, AHA_MULHER, MS_INFARTO],
      legenda="""Infarto em mulher: os sinais podem não parecer “de coração”.

A dor no peito continua sendo o sinal mais comum. Mas, na mulher, é mais frequente ela vir junto com falta de ar, enjoo, dor nas costas ou na mandíbula e um cansaço que não combina com o dia que você teve.

O risco sobe depois da menopausa e com pressão alta, diabetes, colesterol alto, cigarro e casos na família.

Na dúvida, não espere para ver se passa e não vá dirigindo: ligue 192.

Envie para a sua mãe, a sua irmã, a sua amiga.

Conteúdo educativo, não substitui consulta.
Fontes: Sociedade Brasileira de Cardiologia; Ministério da Saúde.

#infarto #saudedamulher #coracao #sinaisdeinfarto #samu192"""),
]

def registro(p, slides):
    d = dict(id=p["id"], formato=p["formato"], serie=p["serie"], titulo=p["titulo"],
             papel="segundo lote de teste de 03/10/2026: refeito a partir do retorno dele, não publicado", estado=ESTADO)
    if p["tipo"] == "carrossel":
        d["midia"] = [f"{BASE}/{p['id']}/{i:02d}.jpg" for i in range(1, slides + 1)]
    else:
        d["midia"] = [f"{BASE}/{p['id']}/reel.mp4"]; d["capa"] = f"{BASE}/{p['id']}/capa.jpg"; d["duracao"] = p["duracao"]
    d.update(antes=p["antes"], seu_retorno=p["seu_retorno"], mudou=p["mudou"], quem_manda=p["quem_manda"], fontes=p["fontes"], legenda=p["legenda"])
    return d

if __name__ == "__main__":
    import lote2
    n_slides = {x["slug"]: len(x["slides"]) for x in lote2.POSTS}
    for p in POSTS:
        assert AVISO in p["legenda"] and p["legenda"].count("#") <= 5, p["id"]
        assert "—" not in p["legenda"] and "–" not in p["legenda"], p["id"]
        (RAIZ / "posts" / f"{p['id']}.json").write_text(json.dumps(registro(p, n_slides.get(p["id"], 0)), ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(len(POSTS), "posts")
