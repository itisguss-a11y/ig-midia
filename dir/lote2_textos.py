#!/usr/bin/env python3
# Legendas do segundo lote (03/10/2026), com o que mudou em cada post e por quê. Gera posts/<id>.json.
# Em 10/10/2026 ele liberou as postagens: cada post foi conferido na fonte primária e corrigido (campos conferido, agenda e correcoes).
# Regras de legenda que saíram do retorno dele e do estudo de social media:
# - a primeira linha é um segundo gancho, com a palavra que a pessoa buscaria;
# - a legenda ESTENDE o post (o caso, a exceção, quando procurar ajuda); não repete o que os slides já dizem;
# - um pedido só, específico, com destinatário ("envie para..."), igual ao do último slide;
# - no máximo 5 hashtags específicas; aviso e fontes uma vez, no fim.
# Regra: nenhuma afirmação de saúde vai ao ar sem conferência na fonte primária.
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
MS_MAMO = "Agência Brasil, 23/09/2025. Ministério da Saúde passa a recomendar mamografia a partir dos 40 anos (40 a 49: sob demanda, em decisão conjunta com o profissional; rastreamento até os 74; 23% dos casos entre 40 e 49 anos) - https://agenciabrasil.ebc.com.br/saude/noticia/2025-09/ministerio-da-saude-passa-recomendar-mamografia-partir-dos-40-anos"
LEI_MAMO = "Lei nº 15.284, de 18/12/2025 (garante a mamografia a todas as mulheres a partir dos 40 anos, conforme as diretrizes do Ministério da Saúde) - https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/L15284.htm"
NT_MAMO = "Ministério da Saúde. Nota Técnica nº 626/2025-CGCAN/DECAN/SAES/MS, de 26/09/2025 (50 a 74 anos: rastreamento a cada dois anos; 40 a 49 e acima de 74: por demanda, com orientação sobre riscos e benefícios), resumida no informe do INCA - https://ninho.inca.gov.br/jspui/handle/123456789/17713"
INCA_CARTILHA = "INCA. Cartilha Câncer de mama, 11ª edição, 2026 (sinais e sintomas; 50 a 74 anos a cada dois anos; mama densa antes da menopausa; histórico familiar: conversar com o médico) - https://ninho.inca.gov.br/jspui/bitstream/123456789/18158/1/cartilha-mama-2026%20-%20DefesoEleitoral.pdf"
INCA_FERRAMENTA = "INCA. Ferramenta de apoio à decisão sobre o rastreamento mamográfico, 2025 (falso-positivo, biópsia e sobrediagnóstico entre 40 e 49 anos) - https://ninho.inca.gov.br/jspui/bitstream/123456789/17734/1/INCA%20ferramenta%20rastreamento-mamo%20A4%202025%20%282%29.pdf"
ABCD = "Arquivos Brasileiros de Cirurgia Digestiva (ABCD). Revisão sobre colelitíase - http://www.scielo.br/j/abcd/a/yp8jRmJGgy3DZnkpyg8cTbk/?lang=en"
SBC_MULHER = "Sociedade Brasileira de Cardiologia. Posicionamento sobre Doença Isquêmica do Coração: a Mulher no Centro do Cuidado, 2023 - https://www.scielo.br/j/abc/a/NHTpGXKFCz7NKht5CYLDZZF/?lang=pt"
AHA_MULHER = "American Heart Association. Heart attack symptoms in women - https://www.heart.org/en/health-topics/heart-attack/warning-signs-of-a-heart-attack/heart-attack-symptoms-in-women"
MS_DENGUE_MANEJO = "Ministério da Saúde. Dengue: diagnóstico e manejo clínico (sem AAS e sem anti-inflamatório; hidratação) - https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/svsa/dengue/dengue-diagnostico-e-manejo-clinico-adulto-e-crianca"

# Fontes abertas na conferência de 10/10/2026 (cada post foi checado por um agente independente, que não escreveu o texto)
OMS_SODIO = "OMS. Sodium reduction, ficha atualizada em 11/05/2026 (menos de 2.000 mg de sódio por dia, o que dá menos de 5 g de sal, pouco menos de 1 colher de chá; cozinhar com menos sal; tirar o saleiro da mesa; ervas e temperos) - https://www.who.int/news-room/fact-sheets/detail/sodium-reduction"
AHA_SAL2 = "American Heart Association. Shaking the Salt Habit, revisada em 14/08/2025 (1 colher de chá de sal tem 2.300 mg de sódio; provar antes de salgar) - https://www.heart.org/en/health-topics/high-blood-pressure/changes-you-can-make-to-manage-high-blood-pressure/shaking-the-salt-habit-to-lower-high-blood-pressure"
ANVISA_IN75B = "ANVISA. Instrução Normativa nº 75/2020, Anexos II, XV e XVI (valor diário de referência do sódio: 2.000 mg; lupa de alto em sódio a partir de 600 mg por 100 g em sólidos e 300 mg por 100 ml em líquidos; queijos, carnes embaladas e sal não levam lupa) - https://visa.jundiai.sp.gov.br/wp-content/uploads/2024/08/IN_75_2020-requisitos-para-rotulagem-nutricional.pdf"
POF_SODIO = "Cadernos de Saúde Pública, 2024. Sodium intake according to NOVA food classification in Brazil: trends from 2002 to 2018 (POF/IBGE 2017-2018: sal de cozinha e condimentos à base de sal somam 55% do sódio disponível nos domicílios; processados e ultraprocessados, cerca de 39%) - https://www.scielo.br/j/csp/a/jjk9FBWrPShYg8nrBCHVyDp"
AHA_POTASSIO = "American Heart Association. How Potassium Can Help Control High Blood Pressure, revisada em 14/08/2025 (substituto do sal com potássio: perguntar ao profissional de saúde, sobretudo com doença nos rins ou remédios que mexem no potássio) - https://www.heart.org/en/health-topics/high-blood-pressure/changes-you-can-make-to-manage-high-blood-pressure/how-potassium-can-help-control-high-blood-pressure"
MS_DM_PCDT26 = "Ministério da Saúde/Conitec. PCDT do Diabete Melito Tipo 2, Portaria SCTIE/MS nº 13, de 21/02/2026 (rastreamento em todos a partir dos 35 anos, com glicemia de jejum; a cada 3 anos; pré-diabetes reavaliado todo ano; sintomas clássicos incluem perda de peso sem querer) - https://www.gov.br/conitec/pt-br/midias/protocolos/2026/pcdt-diabete-melito-tipo-2/@@download/file"
NIDDK_OLHO = "NIDDK. Diabetic Eye Disease (a visão embaçada pela glicose alta é temporária, mas o diabetes sem tratamento lesa a retina) - https://www.niddk.nih.gov/health-information/diabetes/overview/preventing-problems/diabetic-eye-disease"
MS_AVC_PCDT23 = "Ministério da Saúde/Conitec. PCDT do AVC Isquêmico Agudo, Portaria Conjunta SAES/SECTICS nº 29, de 12/12/2023 (alteplase em até 4 horas e meia do início; trombectomia em casos selecionados até 24 horas; hora de início = última vez em que a pessoa foi vista bem) - https://www.gov.br/conitec/pt-br/midias/protocolos/tromb-lise-no-acidente-vascular-cerebral-isqu-mico-agudo.pdf/@@display-file/file"
AHA_AVC26 = "AHA/ASA. 2026 Guideline for the Early Management of Patients With Acute Ischemic Stroke: Top Things to Know, 26/01/2026 (trombólise até 4 horas e meia; casos selecionados por imagem entre 4,5 e 9 horas; trombectomia até 24 horas) - https://professional.heart.org/en/science-news/2026-guideline-for-the-early-management-of-patients-with-acute-ischemic-stroke/top-things-to-know"
NHS_AIT = "NHS. Transient ischaemic attack (TIA), revisada em 28/06/2023 (os sinais podem sumir, mas a pessoa precisa ser avaliada no hospital) - https://www.nhs.uk/conditions/transient-ischaemic-attack-tia/"
SF_AVC = "Stroke Foundation (Austrália). What to do while you wait for an ambulance (não dar comida, bebida nem remédio, nem aspirina) - https://strokefoundation.org.au/About-Stroke/Learn/signs-of-stroke/What-to-do-while-you-wait-for-an-ambulance"
DBMPA23 = "SBC/SBH/SBN. Diretrizes Brasileiras de Medidas da Pressão Arterial Dentro e Fora do Consultório, 2023, Quadro 4 e Tabela 1 (30 minutos sem álcool, café, alimentos ou cigarro; 90 minutos sem exercício; bexiga vazia; 5 minutos de repouso; costas apoiadas, pernas descruzadas, pés no chão, braço na altura do coração, sem falar; MRPA anormal: média de 130 e/ou 80 ou mais; monitores de punho erram mais) - https://sbh.org.br/wp-content/uploads/2025/01/2023-Diretrizes-Brasileiras-HA.pdf"
DBHA25 = "SBC/SBH/SBN. Diretriz Brasileira de Hipertensão Arterial, 2025, kit de slides oficial, Quadro 3.4 (MRPA: 130 e/ou 80 ou mais) - https://sbn.org.br/conteudos/Diretriz-Brasileira-Hipertensao-Arterial/Diretriz-Brasileira-Hipertensao-Arterial-2025_KitSlide.pdf"
MS_HAS25 = "Ministério da Saúde/Conitec. PCDT da Hipertensão Arterial Sistêmica, 2025 (MRPA: média de 130 por 80 ou mais, em cinco dias seguidos; crise hipertensiva: 180 e/ou 120 ou mais) - https://www.gov.br/conitec/pt-br/midias/relatorios/2025/rr-pcdt-has.pdf/@@download/file"
SBH_HIGH = "SBH. Highlights das diretrizes brasileiras de medida da pressão arterial, Revista Hipertensão, 2024;26(1) (MRPA: 3 medidas de manhã e 3 à noite, por 4 a 6 dias) - https://www.sbh.org.br/wp-content/uploads/2024/07/revista-hipertensao-v26-n1-artigo-4.pdf"
AHA_CASA = "American Heart Association. Home Blood Pressure Monitoring, revisada em 14/08/2025 (aparelho de braço, automático; duas medidas com 1 minuto de intervalo; acima de 180/120, repetir e procurar ajuda) - https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings/monitoring-your-blood-pressure-at-home"
OMS_AF20 = "OMS. Diretrizes de atividade física e comportamento sedentário, 2020 (Bull et al., Br J Sports Med): pelo menos 150 a 300 minutos de atividade moderada por semana; força em 2 ou mais dias; qualquer quantidade conta; saiu a exigência de blocos de 10 minutos - https://pmc.ncbi.nlm.nih.gov/articles/PMC7719906/"
MS_GUIA_AF = "Ministério da Saúde. Guia de Atividade Física para a População Brasileira, 2021 (pelo menos 150 minutos; pequenos blocos de tempo; cada minuto conta; teste da conversa; parar se sentir dor no peito ou tontura) - https://bvsms.saude.gov.br/bvs/publicacoes/guia_atividade_fisica_populacao_brasileira.pdf"
CDC_INTENS = "CDC. Measuring Physical Activity Intensity, revisada em 04/12/2025 (na atividade moderada dá para conversar, mas não cantar) - https://www.cdc.gov/physical-activity-basics/measuring/index.html"
MS_ENDO_PCDT26 = "Ministério da Saúde/Conitec. PCDT da Endometriose, Portaria Conjunta nº 54, de 02/06/2026 (tecido semelhante ao endométrio fora do útero, com reação inflamatória crônica; dor na relação; pode atingir bexiga e intestino) - https://www.gov.br/conitec/pt-br/midias/protocolos/portaria-conjunta-n-54-endometriose.pdf/@@display-file/file"
MS_ENDO_AZ = "Ministério da Saúde. Saúde de A a Z, Endometriose (a porta de entrada é a atenção primária; em média sete anos até o diagnóstico) - https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/e/endometriose"
FEBRASGO_24 = "FEBRASGO, 17/10/2024. Sentir dor abdominal intensa durante o período menstrual não é normal (se a dor compromete a rotina, deve ser investigada) - https://febrasgo.org.br/pt/noticias/item/1965-sentir-dor-abdominal-intensa-durante-o-periodo-menstrual-nao-e-normal"
NICE_ENDO = "NICE. Endometriosis: diagnosis and management (NG73, 2017, emendada em 2024): sinais que levam a suspeitar e diário de dor - https://www.nice.org.uk/guidance/ng73/chapter/Recommendations"
NHS_PELVE = "NHS. Pelvic pain, revisada em 24/11/2025 (quando procurar atendimento urgente) - https://www.nhs.uk/conditions/pelvic-pain/"
MS_VESICULA = "Ministério da Saúde/BVS. Pedra na vesícula (cálculo biliar), 2018 (função da vesícula; mais comum em mulheres; diagnóstico por ultrassom; cirurgia por vídeo) - https://bvsms.saude.gov.br/pedra-na-vesicula-calculo-biliar/"
NIDDK_VES = "NIDDK. Gallstones: Symptoms & Causes e Treatment (a crise costuma vir depois de refeição pesada, à noite; pedra sem sintoma em geral não precisa de tratamento; a dor pode voltar; cirurgia por laparoscopia; dá para viver sem vesícula) - https://www.niddk.nih.gov/health-information/digestive-diseases/gallstones/symptoms-causes"
NHS_VES = "NHS. Gallstones, revisada em 11/08/2025 (onde dói; dura de 30 minutos a várias horas; sinais de emergência; dieta com menos gordura enquanto espera) - https://www.nhs.uk/conditions/gallstones/"
MAYO_VES = "Mayo Clinic. Gallstones: Symptoms and causes, 16/04/2025 (dor nas costas e no ombro direito; fatores de risco: mulher, 40 anos ou mais, excesso de peso, emagrecer muito rápido) - https://www.mayoclinic.org/diseases-conditions/gallstones/symptoms-causes/syc-20354214"
MAYO_LIMPEZA = "Mayo Clinic. Gallbladder cleanse: a 'natural' remedy for gallstones?, 28/02/2024 (não há prova de que a limpeza de vesícula funcione) - https://www.mayoclinic.org/diseases-conditions/gallstones/expert-answers/gallbladder-cleanse/faq-20058134"
MS_INFARTO_AZ = "Ministério da Saúde. Saúde de A a Z, Infarto (ligue 192; atenção a qualquer mal-estar súbito) - https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/i/infarto"
AHA_SINAIS = "American Heart Association. Warning Signs of a Heart Attack, revisada em 12/12/2024 (alguns infartos começam aos poucos, com dor leve) - https://www.heart.org/en/health-topics/heart-attack/warning-signs-of-a-heart-attack"
MAYO_MULHER = "Mayo Clinic. Heart disease in women, 25/10/2024 (pode haver infarto sem dor no peito; não dirigir até o hospital) - https://www.mayoclinic.org/diseases-conditions/heart-disease/in-depth/heart-disease/art-20046167"
MS_DENGUE_AZ = "Ministério da Saúde. Saúde de A a Z, Dengue (os seis sinais de alarme, entre eles dificuldade de respirar; surgem com o declínio da febre, entre o 3º e o 7º dia; com suspeita, procurar imediatamente um serviço de saúde) - https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/d/dengue"
MS_DENGUE_6ED = "Ministério da Saúde. Dengue: diagnóstico e manejo clínico: adulto e criança, 6ª edição, 2024 (fase crítica na queda da febre; hidratação com soro de reidratação oral e líquidos caseiros; sem salicilatos nem anti-inflamatórios; retorno no dia em que a febre melhora ou no 5º dia) - https://portaldeboaspraticas.iff.fiocruz.br/wp-content/uploads/2024/02/dengue-manejo-clinico.pdf"
MS_DENGUE_ENF26 = "Ministério da Saúde. Dengue: manual de enfermagem, 3ª edição, 2026 (grupos de risco acompanhados até 48 horas depois de a febre passar) - https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/guias-e-manuais/2026/dengue-manual-de-enfermagem.pdf"
OMS_DENGUE = "OMS. Dengue and severe dengue, ficha de 21/08/2025 (evitar ibuprofeno e aspirina) - https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue"

POSTS = [
 dict(id="2026-10-03-sal-no-rotulo", tipo="carrossel", serie="Mito ou verdade", titulo="“Quase não uso sal.” O rótulo diz outra coisa.", antes="2026-10-03-sal-por-dia",
      formato="carrossel de 8 slides, capa dourada só com letra",
      seu_retorno="Gancho fraco e sem contexto; faltou explicar por que o sal faz mal e como age; faltou a ligação com o sódio da tabela nutricional; slide e legenda diziam a mesma coisa.",
      mudou=["Capa com uma frase que a pessoa diz (“quase não uso sal”) e a promessa: achar o sal escondido em 10 segundos",
             "Saiu a estatística do mundo; entrou o porquê: o sódio puxa água para dentro dos vasos",
             "Entrou o rótulo: a linha do sódio, o %VD e a lupa de “alto em sódio”",
             "A legenda agora traz o que não está nos slides: a conta sódio x 2,5 e o cuidado com o sal light"],
      quem_manda="Quem cozinha em casa manda para o pai, a mãe ou o marido que tem pressão alta e diz que “quase não usa sal”.",
      conferido="2026-10-10", agenda="2026-10-13 19h",
      correcoes=["A colher de chá rasa tem cerca de 6 g de sal: o limite de 5 g virou “pouco menos de 1 colher de chá”",
                 "Lupa de alto em sódio: entrou o corte dos líquidos (300 mg em 100 ml) e o aviso de que produto sem lupa também pode ter muito sódio",
                 "Último slide: entrou “cozinhe com menos sal”, que é de onde vem a maior parte do sódio no Brasil; saiu o “valem mais”, que não tinha fonte",
                 "Legenda: o dado brasileiro ganhou a origem (IBGE); o sal light passou a ser apresentado como ajuda, com o aviso para rins e remédios; entrou que cortar sal não substitui remédio"],
      fontes=[OMS_SODIO, AHA_SAL, AHA_SAL2, ANVISA_IN75B, ANVISA_ROT, POF_SODIO, AHA_POTASSIO],
      legenda="""Pressão alta e sal: a conta não fecha só no saleiro.

No Brasil, mais da metade do sódio ainda vem do sal que a gente põe na comida, segundo a última pesquisa do IBGE. Quase todo o resto já chega pronto, dentro do pão, do embutido, do tempero e do salgadinho. Por isso valem as duas frentes: menos sal na panela e olho no rótulo.

Um truque para o mercado: multiplique o sódio por 2,5 e você tem o sal. 400 mg de sódio é 1 grama de sal, um quinto do limite do dia.

Sal light ajuda: ele troca parte do sódio por potássio. Mas quem tem doença nos rins ou usa remédio para pressão precisa perguntar ao médico antes de usar.

Cortar sal ajuda a controlar a pressão, mas não substitui o remédio nem o acompanhamento.

Envie para quem diz que “quase não usa sal”.

Conteúdo educativo, não substitui consulta.
Fontes: OMS; ANVISA; IBGE; American Heart Association.

#pressaoalta #hipertensao #sodio #rotulodealimentos #alimentacaosaudavel"""),
 dict(id="2026-10-03-diabetes-5-sinais", tipo="carrossel", serie="Sinais do corpo", titulo="Sede o dia todo. Xixi a noite inteira.", antes="2026-10-03-diabetes-sinais",
      formato="carrossel de 9 slides, capa com desenho em cima e título embaixo",
      seu_retorno="Gancho fraco: devia ser algo em que a pessoa se reconhece, ou reconhece em alguém, como a sede que não passa. Não explicava do que se tratava. Slide com uma frase só não explica nada.",
      mudou=["Capa com a cena: sede o dia todo, xixi a noite inteira, em você ou na sua mãe",
             "Cada sinal ganhou o porquê e um desenho que mostra o que acontece",
             "O slide 2 diz o assunto de novo (o Instagram mostra o carrossel outra vez a partir dele)",
             "A legenda trata do exame: quem deve fazer, a partir de que idade e de quanto em quanto tempo"],
      quem_manda="A filha manda para a mãe ou para o pai que vive com sede e levanta à noite para ir ao banheiro.",
      conferido="2026-10-10", agenda="2026-10-16 19h",
      correcoes=["“O mais comum: nenhum sinal” e “na maioria das pessoas” não tinham fonte: viraram “muitas vezes” e “em muita gente”",
                 "Quem reconhece os sinais não deve esperar a próxima consulta: virou “marque uma consulta e peça o exame”",
                 "Visão embaçada: entrou que precisa ser avaliada, mesmo melhorando",
                 "“Os 5 sinais” virou “5 sinais”, porque falta a perda de peso sem explicação, que entrou na legenda",
                 "Confirmado: em fevereiro de 2026 o Ministério da Saúde baixou o rastreamento no SUS de 45 para 35 anos, igual à Sociedade Brasileira de Diabetes"],
      fontes=[MS_DM_PCDT26, SBD, MS_DM, NIDDK, MAYO_DM, NIDDK_OLHO],
      legenda="""Diabetes tipo 2 costuma chegar em silêncio, e os primeiros sinais são fáceis de culpar: o calor, a idade, o cansaço da semana. Emagrecer sem fazer dieta também é sinal de alerta.

O que resolve a dúvida é o exame, não o sintoma. Ele é de sangue e é simples: glicemia de jejum ou hemoglobina glicada. A recomendação é fazer a partir dos 35 anos, mesmo sem sentir nada. Antes disso, vale para quem está acima do peso e tem mais algum fator de risco, como pressão alta ou pai, mãe ou irmão com diabetes.

Resultado normal e poucos fatores de risco? Repete em 3 anos, ou antes se aparecer algum sinal. Deu pré-diabetes? O controle passa a ser todo ano, e é a fase em que mudar a rotina pode evitar ou adiar o diabetes.

Sede intensa, vômito e emagrecimento que pioram em poucos dias não são para esperar consulta: procure um serviço de saúde logo.

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
      conferido="2026-10-10", agenda="2026-10-11 20h",
      correcoes=["“Só nas primeiras 4 horas e meia” podia fazer a pessoa desistir de ir depois desse prazo: virou “em geral, até 4 horas e meia” e “passou disso? vá do mesmo jeito: ainda há tratamento”",
                 "“Sempre de um lado só” era absoluto demais: virou “quase sempre”",
                 "193: os Bombeiros não atendem emergência clínica em todos os estados; virou plano B (“não conseguiu? ligue 193”)",
                 "Hospital: a Sociedade Brasileira de AVC manda ir a hospital, não a posto de saúde nem UPA",
                 "Teste do sorriso, do abraço e da frase: entrou que teste normal não descarta AVC",
                 "Legenda: o AVC passageiro pode durar minutos ou horas; “nem AAS”; se ninguém viu começar, vale a última hora em que a pessoa estava bem"],
      fontes=[MS_AVC, SBAVC, MS_AVC_PCDT23, AHA_AVC26, NHS_AIT, SF_AVC],
      legenda="""AVC é corrida contra o relógio: quanto antes o atendimento, maior a chance de recuperação.

Duas coisas que quase ninguém sabe:

1. Se os sinais sumirem sozinhos, em minutos ou horas, ligue 192 ou vá ao hospital do mesmo jeito. Pode ter sido um AVC passageiro, que é um aviso de que outro maior pode vir.

2. Não dê remédio (nem AAS), comida nem água enquanto espera. A pessoa pode engasgar, e alguns remédios pioram certos tipos de AVC.

Anote a hora em que os sinais começaram: é uma das primeiras coisas que a equipe vai perguntar. Se ninguém viu começar, vale a última hora em que a pessoa estava bem.

Envie para a sua família.

Conteúdo educativo, não substitui consulta.
Fontes: Ministério da Saúde; Sociedade Brasileira de AVC; NHS.

#avc #derrame #sinaisdeavc #samu192 #primeirossocorros"""),
 dict(id="2026-10-03-medir-pressao-v2", tipo="carrossel", serie="Para salvar", titulo="Se você mede a pressão assim que chega em casa, o número sai errado.", antes="2026-10-03-medir-pressao",
      formato="carrossel de 9 slides, capa verde com letra e desenho do aparelho",
      seu_retorno="Gostou. Só via desenho de coração e gota: pediu para variar os desenhos e sentiu falta de imagens.",
      mudou=["Desenhos novos e de saúde: o aparelho, a postura certa na cadeira, o que evitar antes",
             "A capa aponta o erro que muita gente comete, no lugar de um título neutro",
             "Entrou o número: em casa, alta é 130 por 80 ou mais",
             "A legenda traz o que não está nos slides: que aparelho usar, quando medir e o que levar ao médico"],
      quem_manda="Quem cuida dos pais manda para o pai ou a mãe que mede a pressão em casa.",
      conferido="2026-10-10", agenda="2026-10-15 19h",
      correcoes=["Exercício: o post mandava esperar 1 hora (número da diretriz de 2020); a diretriz de medida de 2023 pede 1 hora e meia. Café, álcool, comida e cigarro: 30 minutos",
                 "“O número sai errado” e “o aparelho mostra mais do que você tem” eram absolutos: viraram “pode sair errado” e “costuma sair mais alto”",
                 "“Tudo isso sobe o número”: o álcool pode baixar; virou “altera o número”",
                 "130 por 80: entrou que basta um dos dois números passar",
                 "Legenda: duas ou três medidas de cada vez; anotações de 5 a 7 dias; o que fazer com 18 por 12; sintomas de emergência valem com qualquer número; aviso para grávidas"],
      fontes=[DBMPA23, DBHA25, MS_HAS25, SBH_HIGH, AHA_CASA],
      legenda="""Medir a pressão em casa só ajuda se o número for confiável. E um erro muito comum é medir com pressa.

Três coisas que o carrossel não mostrou:

• Aparelho: prefira o de braço, automático e validado. Os de pulso erram mais.
• Quando medir: de manhã e à noite, antes de comer. Duas ou três medidas de cada vez, com 1 minuto entre elas.
• O que levar ao médico: as anotações de 5 a 7 dias seguidos, com data e hora.

Mediu do jeito certo e deu alto? Não ignore: repita nos outros dias e leve ao médico. Deu 18 por 12 ou mais? Meça de novo depois de 1 minuto. Continuou? Procure um serviço de saúde na hora, mesmo sem sentir nada.

Dor no peito, falta de ar, fraqueza de um lado do corpo ou fala enrolada é emergência com qualquer número no aparelho: ligue 192.

Grávida? Siga a orientação do pré-natal.

Envie para quem mede a pressão em casa.

Conteúdo educativo, não substitui consulta.
Fontes: Diretrizes Brasileiras de Medidas da Pressão Arterial (2023) e de Hipertensão (2025); Ministério da Saúde.

#pressaoalta #hipertensao #medirpressao #pressaoarterial #saudedocoracao"""),
 dict(id="2026-10-03-exercicio-150-v2", tipo="carrossel", serie="Para salvar", titulo="Você não precisa de 1 hora de academia por dia.", antes="2026-10-03-exercicio-por-semana",
      formato="carrossel de 7 slides, capa verde com letra e desenho; letra de teste: Fraunces",
      seu_retorno="Gostou. Sentiu falta de imagens e pediu para testar outros tipos de letra.",
      mudou=["Letra de teste: Fraunces (a atual é a Instrument Serif)",
             "Desenhos novos: a semana com os 5 dias marcados, o teste da conversa, as formas de se mexer",
             "A capa tira um peso da pessoa (não precisa de 1 hora por dia) no lugar de dar um número solto",
             "A legenda traz o que não está nos slides: como começar depois de muito tempo parada"],
      quem_manda="Uma amiga manda para a outra, como convite para caminhar junto.",
      conferido="2026-10-10", agenda="2026-10-19 19h",
      correcoes=["“O mínimo que faz efeito: 150 minutos” contradizia a própria OMS (qualquer quantidade já faz bem): virou “a meta da OMS: pelo menos 150 minutos”",
                 "“3 blocos de 10 minutos” vinha de uma regra que a OMS retirou em 2020: virou “blocos curtos; cada minuto conta”",
                 "“Já protegem o coração” virou “já ajudam a proteger”",
                 "Força: é pelo menos 2 vezes por semana, e subir escada não é exercício de força; os exemplos mudaram",
                 "Último slide: saiu a dica sem fonte e entrou o aviso de segurança (dor no peito ou tontura no esforço: parar e procurar atendimento)"],
      fontes=[OMS_AF20, OMS_AF, MS_GUIA_AF, CDC_INTENS],
      legenda="""150 minutos de exercício por semana parece muito até você dividir: dá pouco mais de 20 minutos por dia.

O que conta como moderado? Qualquer atividade que acelera o coração e a respiração, mas ainda deixa você conversar: caminhar rápido, dançar, pedalar, varrer o quintal com vontade.

Para quem está parada há muito tempo:

• Comece com 10 minutos por dia e aumente aos poucos.
• Prenda o exercício em algo que já existe na rotina: depois do almoço, na volta do trabalho, enquanto o filho está no treino.
• Pelo menos 2 vezes por semana, inclua força: agachar, flexão na parede, carregar peso.

Tem doença do coração, diabetes ou pressão alta? Combine com o seu médico o tipo e a quantidade. Dor no peito, falta de ar fora do normal ou tontura durante o esforço: pare e procure atendimento.

Envie para a amiga que topa caminhar com você.

Conteúdo educativo, não substitui consulta.
Fontes: Organização Mundial da Saúde (2020); Ministério da Saúde (2021).

#atividadefisica #caminhada #sedentarismo #saudedocoracao #rotinasaudavel"""),
 dict(id="2026-10-03-colica-forte", tipo="carrossel", serie="Isso é normal?", titulo="Cólica que faz você faltar ao trabalho não é normal.", antes=None,
      formato="carrossel de 9 slides, capa creme com letra e desenho; letra de teste: Playfair Display",
      seu_retorno="Pediu temas que mais atingem o seu público e que a pessoa se reconheça no post.",
      mudou=["Tema novo, do seu público: mulheres de 25 anos ou mais",
             "Letra de teste: Playfair Display",
             "Capa com uma situação que ela reconhece: faltar ao trabalho por causa da cólica",
             "Termo difícil (endometriose) explicado em um slide só dele, como você aprovou no post do exame"],
      quem_manda="A amiga manda para a amiga que sofre todo mês. A mãe manda para a filha.",
      conferido="2026-10-10", agenda="2026-10-14 12h",
      correcoes=["“A sua cólica passa de 7?”: nenhuma fonte usa nota de corte, e quem dá nota 6 e falta ao trabalho podia achar que está tudo bem; virou “que nota você dá para a sua cólica?”",
                 "“Doses cada vez maiores” não tinha fonte e podia normalizar aumentar a dose: virou “a dor vem piorando com os meses; não aumente a dose por conta própria”",
                 "“Anote por 2 ou 3 ciclos” podia ser lido como esperar 3 meses: virou marcar a consulta já (no SUS, pelo posto de saúde) e anotar até lá",
                 "“Inflama a cada ciclo”: a inflamação é contínua; virou “causa inflamação e dor”",
                 "“1 em cada 10” virou “cerca de 1 em cada 10” (é estimativa)",
                 "Legenda: entrou quando procurar atendimento no mesmo dia"],
      fontes=[OMS_ENDO, MS_ENDO_PCDT26, MS_ENDO_AZ, FEBRASGO, FEBRASGO_24, NICE_ENDO, NHS_PELVE],
      legenda="""Cólica forte todo mês não é frescura, e “é assim mesmo” não é diagnóstico.

A endometriose costuma levar anos para ser descoberta, em parte porque a dor da mulher é tratada como normal.

O que faz a consulta render:

• Um diário da dor: os dias, a nota de 0 a 10 e o que você deixou de fazer.
• Os remédios que tomou e se funcionaram.
• Se a dor aparece também fora da menstruação, na relação, ao evacuar ou ao urinar.

Nem toda cólica forte é endometriose: mioma e outras causas entram na investigação. O ponto é o mesmo: dor que tira você da rotina merece ser investigada.

Não espere a consulta se a dor for muito forte e só piorar, ou vier com febre, desmaio, sangramento muito intenso ou chance de gravidez: procure atendimento no mesmo dia.

Envie para a amiga que sofre todo mês.

Conteúdo educativo, não substitui consulta.
Fontes: OMS; Ministério da Saúde; FEBRASGO; NICE; NHS.

#colica #endometriose #saudedamulher #dorpelvica #ginecologia"""),
 dict(id="2026-10-03-mamografia-40", tipo="carrossel", serie="Entenda seu exame", titulo="A mamografia já pode começar aos 40", antes=None,
      formato="carrossel de 7 slides, capa creme com número gigante; letra de teste: DM Serif Display",
      seu_retorno="Pediu temas que mais atingem o seu público. E outubro é o mês do Outubro Rosa.",
      mudou=["Tema novo, do seu público, e do mês (Outubro Rosa)",
             "Letra de teste: DM Serif Display",
             "Capa de número (a série dos exames usa número ou laudo na capa)",
             "Um quadro com o que vale para cada idade, e 1 em cada 4 casos mostrado com desenho"],
      quem_manda="A amiga manda para a amiga que fez 40. A filha manda para a mãe.",
      conferido="2026-10-10", agenda="2026-10-10 20h",
      correcoes=["“Desde setembro” ficaria errado em 2026: virou “Desde 2025” e entrou a lei de dezembro de 2025 (Lei 15.284), que garante o exame a partir dos 40",
                 "75 anos ou mais: a regra oficial é a mesma dos 40 a 49 (por demanda, depois da conversa sobre riscos e benefícios)",
                 "Histórico familiar: o INCA não tem recomendação padrão para esse grupo; o texto passou a dizer que o médico avalia o risco e define o acompanhamento"],
      fontes=[MS_MAMO, NT_MAMO, LEI_MAMO, INCA_CARTILHA, INCA_FERRAMENTA],
      legenda="""Mamografia aos 40: agora é lei. Desde 2025, o SUS garante o exame a partir dessa idade para quem quiser fazer, mesmo sem sintoma.

O que muda na prática:

• 40 a 49 anos: não é convocação. Você conversa com o profissional de saúde sobre os prós e os contras e decide.
• 50 a 74 anos: o exame é recomendado a cada 2 anos, mesmo sem sintoma.

Por que existe conversa antes dos 50? Antes da menopausa, a mama costuma ser mais densa e o exame erra mais: dá alarme falso, com mais exames e, às vezes, biópsia que não precisava. Para muitas mulheres ainda vale a pena. A decisão é sua, com informação.

Mãe, irmã ou filha teve câncer de mama (principalmente antes dos 50) ou de ovário? A conversa é outra: o médico avalia o seu risco e define o acompanhamento.

Envie para a amiga que fez 40.

Conteúdo educativo, não substitui consulta.
Fontes: Ministério da Saúde; INCA; Lei 15.284/2025.

#mamografia #cancerdemama #outubrorosa #saudedamulher #prevencao"""),
 dict(id="2026-10-03-pedra-na-vesicula", tipo="carrossel", serie="Sinais do corpo", titulo="Dor do lado direito depois de comer gordura.", antes=None,
      formato="carrossel de 8 slides, capa com desenho em cima e título embaixo",
      seu_retorno="Pediu temas que mais atingem o seu público. Este também faz a ponte com a cirurgia, a área que você pretende seguir.",
      mudou=["Tema novo: pedra na vesícula é mais comum em mulheres, depois dos 40",
             "Capa com a cena: a dor do lado direito depois de comer gordura",
             "O desenho do corpo mostra onde dói",
             "Faz a ponte com a cirurgia sem oferecer consulta nem procedimento"],
      quem_manda="Quem convive com alguém que vive com “má digestão” depois de comer gordura.",
      conferido="2026-10-10", agenda="2026-10-18 20h",
      correcoes=["A fonte citada no post (“revisão brasileira de cirurgia digestiva, ABCD, 2019”) não foi localizada: saiu, e entraram as fontes abertas na conferência",
                 "A dor não vem só depois de gordura: virou “muitas vezes depois de refeição pesada ou gordurosa”, e é comum à noite",
                 "Sinais de urgência: entraram calafrios, fezes claras, vômitos e o prazo (“não passa em algumas horas”)",
                 "Capa: “dor do lado direito” virou “dor em cima, do lado direito”, e saiu o “4 sinais”, que o carrossel não numerava",
                 "Legenda: “só acompanha” virou “muitas vezes só acompanha; o médico decide caso a caso”; a dieta “pode ajudar” e não tira a pedra; entrou o aviso de infarto (aperto no peito, falta de ar ou suor frio: 192)"],
      fontes=[MS_VESICULA, NIDDK_VES, NHS_VES, MAYO_VES, MAYO_LIMPEZA],
      legenda="""Pedra na vesícula: muita gente tem e nem sabe. O problema começa quando ela dói.

Quem tem pedra e nunca sentiu nada muitas vezes só acompanha; o médico decide caso a caso. Quando a dor aparece, ela tende a voltar, e aí a conversa costuma ser a cirurgia: a retirada da vesícula, quase sempre por vídeo, com cortes pequenos.

Dá para viver sem vesícula? Dá. O fígado continua produzindo a bile; ela só deixa de ficar guardada.

Enquanto a consulta não chega, comer com menos gordura e evitar o que provoca a dor pode ajudar. Isso não tira a pedra. E não há prova de que chá ou “limpeza de vesícula” dissolva pedra.

Com febre, pele amarelada, vômitos ou dor forte que não passa, o caminho é o pronto-socorro. Aperto no peito, falta de ar ou suor frio junto com a dor: ligue 192.

Envie para quem vive com “má digestão”.

Conteúdo educativo, não substitui consulta.
Fontes: Ministério da Saúde; NIDDK; NHS; Mayo Clinic.

#pedranavesicula #vesicula #dornabarriga #cirurgia #saudedamulher"""),
 dict(id="2026-10-03-dengue-febre-baixou-v2", tipo="reel", serie="Sinais do corpo", titulo="A febre da dengue baixou? É agora que você precisa ficar de olho.", duracao="33 s", antes="2026-10-03-dengue-febre-baixou",
      formato="reel de 33 s, fundo verde, texto animado com o gráfico da febre em movimento",
      seu_retorno="Gostou. O desenho em movimento (a curva da febre) podia ser mais explorado.",
      mudou=["O gráfico virou o centro do vídeo: a curva se desenha, a fase de alerta acende e ele fica na tela enquanto os sinais entram",
             "O gancho inteiro já aparece no primeiro quadro (antes, a segunda parte entrava 1 segundo depois)",
             "Entrou o que fazer em casa: beber líquido e não tomar AAS nem anti-inflamatório"],
      quem_manda="Quem tem alguém com dengue em casa manda para quem está cuidando.",
      conferido="2026-10-10", agenda="2026-10-17 20h",
      correcoes=["A lista oficial tem seis sinais de alarme e o vídeo mostrava cinco: entrou “dificuldade para respirar”, e o vídeo ganhou 1,6 segundo para dar tempo de ler",
                 "Legenda: quem tem suspeita de dengue deve ir à unidade de saúde logo no início, e não só os grupos de risco; e voltar no dia em que a febre baixar",
                 "Legenda: quem toma AAS todo dia por causa do coração não deve parar por conta própria",
                 "Legenda: entrou o soro de reidratação oral; a atenção continua por 2 dias depois que a febre baixa; “não é sinal de alta” era ambíguo e virou “não quer dizer que passou”"],
      fontes=[MS_DENGUE_AZ, MS_DENGUE_6ED, MS_DENGUE_ENF26, OMS_DENGUE],
      legenda="""Dengue: a febre baixar não quer dizer que passou.

A fase mais delicada costuma ser entre o 3º e o 7º dia, justamente quando a febre cai, e a atenção continua por 2 dias depois disso. É nela que podem aparecer os sinais de alerta do vídeo.

Suspeita de dengue? Vá à unidade de saúde logo no início, mesmo sem sinal de alerta, e volte no dia em que a febre baixar (ou no 5º dia, se ela não baixar).

Em casa, o tratamento é líquido e repouso: soro de reidratação oral (o do posto), água, soro caseiro, água de coco, suco. Para dor e febre, só o que o serviço de saúde orientar. AAS, ibuprofeno, diclofenaco e outros anti-inflamatórios aumentam o risco de sangramento. Usa AAS todo dia por causa do coração? Não pare por conta própria: pergunte no serviço de saúde.

Grávidas, crianças pequenas, idosos e quem tem doença crônica precisam de acompanhamento mais de perto desde o começo.

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
      conferido="2026-10-10", agenda="2026-10-12 19h",
      correcoes=["A cena da lista dizia “na mulher, desconfie de”, o que podia passar a ideia de que infarto em mulher não dá dor no peito: virou “além da dor no peito, desconfie de”",
                 "“É por isso que muita mulher demora” virou “é um dos motivos”: o atraso também vem do atendimento",
                 "Legenda: os sinais podem vir com ou sem a dor no peito, começar aos poucos ou ir e voltar; entraram suor frio, tontura, dor no braço e queimação no estômago",
                 "Legenda: “não vá dirigindo” virou “não dirija você mesma”, com a saída para quem não tem SAMU na cidade",
                 "Fontes na tela: entrou a American Heart Association, de onde vêm a mandíbula e a comparação com má digestão"],
      fontes=[SBC_MULHER, MS_INFARTO_AZ, AHA_MULHER, AHA_SINAIS, MAYO_MULHER],
      legenda="""Infarto em mulher: os sinais podem não parecer “de coração”.

A dor no peito continua sendo o sinal mais comum. Mas, na mulher, é mais frequente aparecerem também, com ou sem essa dor, falta de ar, enjoo, dor nas costas ou na mandíbula e um cansaço que não combina com o dia que você teve.

Suor frio, tontura, dor no braço ou queimação no estômago também são sinais de alerta. E eles podem começar aos poucos ou ir e voltar.

O risco sobe depois da menopausa e com pressão alta, diabetes, colesterol alto, cigarro e casos na família.

Na dúvida, não espere para ver se passa e não dirija você mesma: ligue 192. Sem SAMU na sua cidade, peça para alguém levar você ao pronto-socorro.

Envie para a sua mãe, a sua irmã, a sua amiga.

Conteúdo educativo, não substitui consulta.
Fontes: Sociedade Brasileira de Cardiologia; Ministério da Saúde; American Heart Association.

#infarto #saudedamulher #coracao #sinaisdeinfarto #samu192"""),
]

def registro(p, slides):
    estado = ESTADO
    if p.get("conferido"):
        estado = f"conferido na fonte em {p['conferido']}" + (f"; agendado no Metricool para {p['agenda']} (hora de Boa Vista)" if p.get("agenda") else "")
    d = dict(id=p["id"], formato=p["formato"], serie=p["serie"], titulo=p["titulo"],
             papel="segundo lote de 03/10/2026, refeito a partir do retorno dele; postagens liberadas por ele em 10/10/2026", estado=estado)
    if p.get("correcoes"): d["corrigido_na_conferencia"] = p["correcoes"]
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
