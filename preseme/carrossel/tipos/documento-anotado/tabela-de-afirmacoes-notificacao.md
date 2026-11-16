# Tabela de afirmações · exemplo "Você sabe preencher a ficha de notificação?" (carrossel "documento anotado")

> texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos

Cada frase do exemplo com o que ela afirma e o trecho que a sustenta. Banco: claude/preseme-fatos-sinan-ficha-documento.md (coletado pelo Opus em 16/11/2026, a conferir pelo Fable). Fontes:

- Ficha: Ministério da Saúde, SVS, Sinan NET, Ficha de Notificação/Conclusão (rodapé "Notificação/conclusão Sinan NET SVS 27/09/2005"), PDF NINDIN_FICHA.pdf, lido pela cópia do repositório público rfsaldanha/sis (GitHub). O desenho da ficha saiu desse PDF: caixas, números, rótulos e opções.
- Dicionário: Ministério da Saúde, SVS, GT-Sinan, Dicionário de dados – Sinan NET – versão 5.0, "Revisado em Novembro/2018", PDF NINDIN_DIC_DADOS.pdf, mesma cópia.

| Frase | O que afirma | Fonte e trecho |
|---|---|---|
| [01] Você sabe preencher a ficha de notificação? | o assunto | não afirma fato |
| [02] Oito campos que pedem cuidado, na ficha do Sinan, um por um. | são 8 campos (3, 7, 8, 10, 12, 13, 14 e 26) em 7 lâminas | a conta do exemplo; "pedem cuidado" é leitura do Claude (cada um tem regra no dicionário) |
| [03] A 3 é o dia em que a ficha foi preenchida. A 7, o dia em que os sintomas começaram. | o que são os campos 3 e 7 | Dicionário: "Data de preenchimento da ficha de notificação."; "Data dos primeiros sintomas do caso de agravo agudo." |
| [04] Pôr a 7 depois da 3. O sintoma começa antes, ou no mesmo dia. | a regra das datas | Dicionário: "Data menor ou igual (<=) a Data de Notificação". "Erro comum" é o contrário da regra, sem dado de frequência |
| [05] Delas saem a semana epidemiológica da notificação e a dos primeiros sintomas. | o porquê | Dicionário: semana da notificação "Preenchida automaticamente, a partir da data de notificação"; "A partir desta data é preenchido o campo semana epidemiológica dos primeiros sintomas nos agravos agudos." A CONFERIR: o segundo trecho fala em agravo agudo; nos crônicos, o 7 é a data do diagnóstico |
| [06] O nome de quem está sendo notificado, inteiro. | o campo 8 | Dicionário: "Nome completo do paciente (sem abreviações)" |
| [07] Abreviar, como Fulano T. Silva. | o erro | o contrário da regra; nome inventado |
| [08] O dicionário do Sinan pede nome completo, sem abreviações, aqui e no 16, o nome da mãe. | o porquê, nos dois campos | Dicionário: "Nome completo do paciente (sem abreviações)"; "Nome completo da mãe do paciente (sem abreviações)" |
| [09] Sem a data de nascimento, vai a idade e, no quadradinho, a unidade: 1 hora, 2 dia, 3 mês, 4 ano. | o campo 10 | Dicionário: "1o dígito: 1. Hora 2. Dia 3. Mês 4. Ano"; "Campo Obrigatório Caso a data de nascimento não esteja preenchida". Na ficha, as quatro opções estão ao lado do quadradinho |
| [10] Escrever só o número, sem a unidade. | o erro | o contrário da regra |
| [11] Com o 3, 6 é seis meses. Com o 4, seis anos. | o porquê, com exemplo | Dicionário: "Ex: 3009 – nove meses, 4018 – dezoito anos". O 6 é exemplo do Claude, pela mesma regra |
| [12] Se a paciente está grávida e em que trimestre. | o campo 12 | Dicionário: "Idade gestacional da paciente." Opções na ficha: 1º, 2º e 3º trimestre, 4 idade gestacional ignorada, 5 não, 6 não se aplica, 9 ignorado |
| [13] Deixar em branco numa mulher. | o erro | o contrário da regra abaixo |
| [14] Em mulher é obrigatório: sem ele, a ficha não entra no Sinan. Em homem, vai 6, Não se aplica. | o porquê | Dicionário: "Campo Obrigatório se sexo = F"; "CAMPO DE PREENCHIMENTO OBRIGATÓRIO é aquele cuja ausência de dado impossibilita a inclusão da notificação ou da investigação no Sinan."; "Se Sexo=Masculino o campo é preenchido automaticamente com 6 Não se Aplica". "Vai 6" no papel é leitura do Claude (o sistema preenche sozinho) |
| [15] A cor ou raça que a própria pessoa declara. | o campo 13 | Dicionário: "Considera-se cor ou raça declarada pela pessoa." |
| [16] Marcar pela cor que você vê. | o erro | o contrário da regra |
| [17] O dicionário do Sinan considera a cor ou raça declarada pela pessoa. | o porquê | o mesmo trecho |
| [18] A série que a pessoa frequenta ou já concluiu. | o campo 14 | Dicionário: "Série e grau que a pessoa está freqüentando ou freqüentou considerando a última série concluída com aprovação" (pedaço) |
| [19] Marcar 10, Não se aplica, num adulto. | o erro | o contrário da regra abaixo |
| [20] O 10 é só para menor de 7 anos. Acima disso, o Sinan não aceita o 10. | o porquê | Dicionário: "Preenchido automaticamente com a Categoria 10-não se aplica é quando idade menor a 7 anos de idade."; "Quando caso notificado > 7 anos, campo não pode ser preenchido com categoria 10-não se aplica." A CONFERIR: quem tem exatamente 7 anos fica entre as duas regras |
| [21] O que ajuda a achar a casa: perto de quê ela fica. | o campo 26 | Dicionário: "Ponto de referência para facilitar a localização da residência do paciente" |
| [22] Deixar em branco. É campo essencial do Sinan. | o erro e o tipo do campo | Dicionário: "Campo Essencial"; "CAMPO ESSENCIAL é aquele que, apesar de não ser obrigatório, registra dado necessário à investigação do caso ou ao cálculo de indicador epidemiológico ou operacional." |
| [23] Ele serve para facilitar a localização da residência do paciente. | o porquê | o trecho do campo 26 |
| [24] Para salvar: os oito campos que pedem cuidado. | o resumo | as linhas acima |
| [25] Fonte · Ministério da Saúde, Sinan: Ficha de Notificação/Conclusão (2005) e dicionário de dados do Sinan NET, versão 5.0 (2018) | as fontes | o rodapé da ficha (27/09/2005) e o cabeçalho do dicionário (versão 5.0, revisado em novembro de 2018) |
| [D10] a [D31] | os nomes dos campos e os resumos | os nomes são os da ficha, escritos como estão nela ("(ou) Idade", "Raça/Cor"); os resumos repetem as linhas acima |
| [D20] 16/11/2026, [D21] 12/11/2026, [D22] Fulano de Tal da Silva, [D23] 25 e [D24] 4, [D29] Em frente à escola, casa de muro verde, [D30] 6, [D31] 8 | o preenchimento de exemplo | inventado e claramente de exemplo: homem de 25 anos (por isso o 6 na gestante e o 8 na escolaridade), primeiros sintomas antes da notificação |
| legenda | a legenda | as linhas acima, mais as definições de campo obrigatório e de campo essencial do dicionário e "os campos de 1 a 30 são a notificação, e os de 31 a 43, a conclusão do caso" (blocos da ficha: Dados Gerais, Notificação Individual e Dados de Residência, de 1 a 30; Conclusão, de 31 a 43) |

Cuidados seguidos (do banco): os dois anos como estão (ficha de 2005, dicionário de 2018); nada de "a maioria erra"; raça/cor só como se preenche; nenhum dado de paciente de verdade.
