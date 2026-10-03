#!/usr/bin/env python3
# Legendas, fontes conferidas e "o que cada post testa" do lote de 03/10/2026. Gera posts/<id>.json.
# Este lote NÃO foi publicado: foi feito para ele ver tudo junto e dizer o que gostou e o que não gostou.
import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
BASE = "https://raw.githubusercontent.com/itisguss-a11y/ig-midia/claude/base/midia"
AVISO = "Conteúdo educativo, não substitui consulta."

MS_AVC = "Ministério da Saúde. Acidente vascular cerebral (lista de sinais; ligar 192 ou 193 ou levar ao hospital; quanto mais rápido o atendimento, maiores as chances de recuperação) - https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/a/avc"
SBAVC = "Sociedade Brasileira de AVC. Página para pacientes (início súbito dos sintomas; teste do sorriso, do abraço e da frase; ligar 192) - https://avc.org.br/pacientes/acidente-vascular-cerebral/"
OMS_SAL = "Organização Mundial da Saúde. Sodium reduction (menos de 5 g de sal por dia, pouco menos de uma colher de chá; média mundial de 11 g em 2021, mais que o dobro; eleva a pressão; fontes em alimentos processados; dicas para reduzir) - https://www.who.int/news-room/fact-sheets/detail/sodium-reduction"
OMS_AF = "Organização Mundial da Saúde. Physical activity (pelo menos 150 minutos de atividade moderada por semana; qualquer quantidade é melhor que nenhuma; benefícios em adultos) - https://www.who.int/news-room/fact-sheets/detail/physical-activity"
MS_DM = "Ministério da Saúde. Diabetes (sintomas do tipo 2; prevenção com atividade física e alimentação saudável) - https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/d/diabetes"
SBD = "Diretriz da Sociedade Brasileira de Diabetes. Diagnóstico de diabetes mellitus (R6: rastrear todos a partir dos 35 anos e adultos com sobrepeso ou obesidade e mais um fator de risco; R7: glicemia de jejum e/ou hemoglobina glicada; R11: normal e menos de 3 fatores, reavaliar em 3 anos; R12: 3 ou mais fatores, em 12 meses; R13: pré-diabetes, em 12 meses; Quadro 2: fatores de risco) - https://diretriz.diabetes.org.br/diagnostico-de-diabetes-mellitus/"
SBH = "Diretrizes brasileiras de hipertensão 2020: consulta rápida. Revista Hipertensão, v. 24, n. 1, 2022, Quadro 2 (bexiga vazia; sem exercício há 60 min; sem álcool, café ou alimentos; sem fumar nos 30 min anteriores; 5 min sentado em ambiente silencioso; costas e antebraço apoiados, pernas descruzadas, pés no chão; manguito ao nível do coração; não conversar) - https://www.sbh.org.br/wp-content/uploads/2022/06/Revista-Hipertensao-Vol-24-Num-1-Artigo-5.pdf"
SBC_MED = "Diretrizes Brasileiras de Medidas da Pressão Arterial Dentro e Fora do Consultório 2023. Arq Bras Cardiol. 2024;121(4) - https://www.scielo.br/j/abc/a/bCSMjJJ39tB9ZKHpsS7j7sz/?lang=pt"
MS_DENGUE = "Ministério da Saúde. Dengue (sinais de alarme; aparecem com o declínio da febre, entre o 3º e o 7º dia; não se automedicar e procurar imediatamente o serviço de urgência; febre de 39 a 40 °C no início) - https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/d/dengue"
MS_INFARTO = "Ministério da Saúde. Infarto (dor ou desconforto no peito que pode irradiar para costas, rosto e braço esquerdo; intensa e prolongada, com peso ou aperto; suor frio, palidez, falta de ar; em idosos e diabéticos pode vir sem sinais específicos; ligar 192 ou procurar emergência) - https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/i/infarto"


POSTS = [
 dict(id="2026-10-03-avc-sinais", tipo="carrossel", serie="Sinais do corpo", titulo="Você reconheceria um AVC?", slides=8,
      formato="carrossel de 8 slides, capa creme com a linha do pulso",
      testa=["Capa em fundo creme", "Texto apoiado na linha", "Slide de teste rápido (3 perguntas)", "Fecha mandando ligar 192"],
      fontes=[MS_AVC, SBAVC],
      legenda="""Você reconheceria um AVC? Os sinais aparecem de repente:

• Fraqueza ou formigamento em um lado do corpo (rosto, braço ou perna)
• Fala enrolada ou dificuldade para entender
• Confusão mental
• Alteração na visão, em um olho ou nos dois
• Tontura, perda de equilíbrio ou dificuldade para andar
• Dor de cabeça forte e repentina, sem causa aparente

Na dúvida, peça três coisas: um sorriso (a boca fica torta?), um abraço (um dos braços cai?) e uma frase (a fala sai enrolada?).

Viu um sinal? Ligue 192 na hora (o 193 também atende) ou leve a pessoa direto ao hospital. Quanto mais rápido o atendimento, maior a chance de recuperação.

Envie para a sua família.

Conteúdo educativo, não substitui consulta.
Fontes: Ministério da Saúde; Sociedade Brasileira de AVC.

#avc #derrame #sinaisdeavc #samu192 #saude"""),
 dict(id="2026-10-03-sal-por-dia", tipo="carrossel", serie="Para salvar", titulo="Quanto sal por dia? 5 g", slides=6,
      formato="carrossel de 6 slides, capa dourada com número gigante",
      testa=["Capa dourada", "Número gigante na capa", "Texto no centro do slide", "Pergunta na legenda para puxar comentário"],
      fontes=[OMS_SAL],
      legenda="""Quanto sal por dia? Menos de 5 gramas, o que dá menos de uma colher de chá. E essa conta inclui todo o sal do dia, não só o do saleiro.

No mundo, a média é de 11 gramas por dia: mais que o dobro do limite.

Por que isso importa: sal demais sobe a pressão, e pressão alta aumenta o risco de doenças do coração.

Boa parte do sal vem de alimentos processados: pão, embutidos, salgadinhos e molhos prontos.

Como reduzir:
• Tire o saleiro da mesa
• Cozinhe com pouco sal e use ervas e temperos naturais
• Prefira comida fresca, pouco processada

Qual desses é o mais difícil para você? Conte nos comentários.

Envie para quem cozinha na sua casa.

Conteúdo educativo, não substitui consulta.
Fonte: Organização Mundial da Saúde.

#sal #pressaoalta #alimentacaosaudavel #coracao #saude"""),
 dict(id="2026-10-03-exercicio-por-semana", tipo="carrossel", serie="Para salvar", titulo="Quanto exercício por semana? 150 min", slides=6,
      formato="carrossel de 6 slides, capa creme com número gigante",
      testa=["Capa creme com número gigante", "Texto apoiado na linha", "Conta pronta (30 min, 5 dias)", "Pergunta na legenda para puxar comentário"],
      fontes=[OMS_AF],
      legenda="""Quanto exercício por semana? Pelo menos 150 minutos de atividade moderada. É a recomendação para adultos.

Parece muito, mas dá 30 minutos em 5 dias da semana. Ou pouco mais de 20 minutos por dia.

E todo movimento conta: caminhar, pedalar, praticar um esporte, brincar.

Não chega a 150? Faça o que der. Qualquer quantidade é melhor do que nenhuma.

O que você ganha:
• Menos risco de pressão alta e de diabetes tipo 2
• Menos risco de morrer de doença do coração
• Sono e saúde mental melhores

Quantos minutos você fez esta semana? Conte nos comentários.

Envie para quem começa na segunda.

Conteúdo educativo, não substitui consulta.
Fonte: Organização Mundial da Saúde.

#atividadefisica #exercicio #caminhada #saude #prevencao"""),
 dict(id="2026-10-03-diabetes-sinais", tipo="carrossel", serie="Sinais do corpo", titulo="Sede que não passa?", slides=6,
      formato="carrossel de 6 slides, capa verde com a gota",
      testa=["Capa verde (a que já está em uso)", "Texto no centro do slide", "Slides com uma frase só", "Fecha mandando procurar a unidade de saúde"],
      fontes=[MS_DM, SBD],
      legenda="""Sede que não passa? Pode ser um dos sinais do diabetes tipo 2. Os outros:

• Vontade de urinar várias vezes
• Fome frequente
• Formigamento nos pés e nas mãos
• Feridas que demoram a cicatrizar
• Infecções frequentes (bexiga, rins, pele)
• Visão embaçada

Reconheceu algum? Um exame de sangue mostra como está o açúcar. Procure a unidade de saúde e peça a avaliação.

Para prevenir: atividade física regular e alimentação saudável.

Envie para quem vive com sede.

Conteúdo educativo, não substitui consulta.
Fontes: Ministério da Saúde; Sociedade Brasileira de Diabetes.

#diabetes #sintomasdediabetes #glicemia #saude #prevencao"""),
 dict(id="2026-10-03-medir-pressao", tipo="carrossel", serie="Para salvar", titulo="Você mede a pressão do jeito certo?", slides=7,
      formato="carrossel de 7 slides, capa dourada com o coração, passo a passo numerado",
      testa=["Capa dourada com desenho", "Passo a passo com número grande", "Último slide como resumo para salvar"],
      fontes=[SBH, SBC_MED],
      legenda="""Você mede a pressão do jeito certo? Cinco cuidados antes de apertar o botão:

1. Nada de café, álcool, cigarro ou exercício antes. Fumou? Espere 30 minutos. Fez exercício? Espere 1 hora. Evite também medir logo depois de comer.
2. Esvazie a bexiga.
3. Sente e descanse 5 minutos, em um lugar calmo.
4. Costas apoiadas, pernas descruzadas, pés no chão.
5. Braço apoiado, com o aparelho na altura do coração. E não converse durante a medida.

Salve para consultar na próxima medida.

Envie para quem mede a pressão em casa.

Conteúdo educativo, não substitui consulta.
Fonte: diretrizes brasileiras de hipertensão arterial e de medida da pressão arterial.

#pressaoalta #hipertensao #medirpressao #coracao #saude"""),
 dict(id="2026-10-03-exame-diabetes-idade", tipo="carrossel", serie="Entenda seu exame", titulo="Nunca fez exame de diabetes?", slides=7,
      formato="carrossel de 7 slides, capa de laudo",
      testa=["Capa de laudo (papel de exame)", "Texto no centro do slide", "Explica o termo difícil (fator de risco) em um slide"],
      fontes=[SBD],
      legenda="""Nunca fez exame de diabetes? A partir dos 35 anos, ele é indicado para todo mundo, mesmo sem nenhum sintoma.

Antes dos 35, o exame entra quando há excesso de peso e pelo menos mais um fator de risco, como pressão alta, sedentarismo ou diabetes em pais ou irmãos.

E depois?
• Deu normal: repita em 3 anos (em 1 ano, se você tem três ou mais fatores de risco)
• Deu pré-diabetes: repita em 1 ano

O exame é de sangue: glicemia de jejum ou hemoglobina glicada.

Envie para quem já passou dos 35.

Conteúdo educativo, não substitui consulta.
Fonte: Diretriz da Sociedade Brasileira de Diabetes.

#diabetes #glicemia #exames #prediabetes #saude"""),
 dict(id="2026-10-03-dengue-febre-baixou", tipo="reel", serie="Sinais do corpo", titulo="A febre baixou. E agora?", duracao="31 s",
      formato="reel de 31 s, fundo verde, sem voz, com fundo musical simples",
      testa=["Lista que vai se formando na tela", "Desenho em movimento (a curva da febre)", "Tempo de leitura ajustado cena por cena"],
      fontes=[MS_DENGUE],
      legenda="""A febre da dengue baixou. E agora? É nessa fase, entre o 3º e o 7º dia de doença, que os sinais de alarme podem aparecer:

• Dor forte na barriga
• Vômitos frequentes
• Tontura ou sensação de desmaio
• Dificuldade de respirar
• Sangramento no nariz, na gengiva ou nas fezes
• Cansaço ou irritabilidade

Apareceu um deles? Vá na hora ao serviço de urgência. E não tome remédio por conta própria.

Envie para quem está com dengue.

Conteúdo educativo, não substitui consulta.
Fonte: Ministério da Saúde.

#dengue #sinaisdealarme #febre #saude #prevencao"""),
 dict(id="2026-10-03-infarto-dor-no-peito", tipo="reel", serie="Sinais do corpo", titulo="Dor no peito. É infarto?", duracao="31 s",
      formato="reel de 31 s, fundo creme, sem voz, com fundo musical simples",
      testa=["Reel em fundo creme", "Uma frase por cena", "Desenho em movimento (o coração batendo)", "Tempo de leitura ajustado cena por cena"],
      fontes=[MS_INFARTO],
      legenda="""Dor no peito. É infarto? Desconfie quando a dor é forte, não passa e vem com sensação de peso ou aperto no peito.

Ela pode se espalhar para as costas, o rosto ou o braço esquerdo. Junto, podem vir suor frio, palidez, falta de ar e sensação de desmaio.

Em idosos, o principal sinal pode ser a falta de ar. E em idosos e em quem tem diabetes, o infarto pode vir sem os sinais típicos: fique atento a qualquer mal-estar repentino.

Sentiu isso? Ligue 192 ou vá à emergência mais próxima.

Envie para a sua família.

Conteúdo educativo, não substitui consulta.
Fonte: Ministério da Saúde.

#infarto #dornopeito #coracao #saude #prevencao"""),
]

def registro(p):
    d = dict(id=p["id"], formato=p["formato"], serie=p["serie"], titulo=p["titulo"],
             papel="lote de teste de 03/10/2026: criado para ele avaliar, não publicado")
    if p["tipo"] == "carrossel":
        d["midia"] = [f"{BASE}/{p['id']}/{i:02d}.jpg" for i in range(1, p["slides"] + 1)]
    else:
        d["midia"] = [f"{BASE}/{p['id']}/reel.mp4"]; d["capa"] = f"{BASE}/{p['id']}/capa.jpg"; d["duracao"] = p["duracao"]
    d.update(testa=p["testa"], fontes=p["fontes"], conferido_em="2026-10-03", legenda=p["legenda"])
    return d

if __name__ == "__main__":
    for p in POSTS:
        assert AVISO in p["legenda"] and p["legenda"].count("#") <= 5, p["id"]
        (RAIZ / "posts" / f"{p['id']}.json").write_text(json.dumps(registro(p), ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(len(POSTS), "posts")
