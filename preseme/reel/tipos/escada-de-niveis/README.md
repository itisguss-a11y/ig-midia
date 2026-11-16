# Motor "escada de níveis" · molde do reel

> texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos

## O que o motor faz

Um assunto que tem níveis em ordem vira uma escada. Uma pessoa, a mesma do começo ao fim, sobe um degrau por cena. Em cada degrau aparecem três coisas:
- o nome do degrau, na placa da escada (por exemplo, "Primária");
- o que se faz nele, no quadro de cima, à esquerda (por exemplo, a lista "caminhar, cuidar do peso...");
- o que aconteceu com a pessoa, na frase da tela (por exemplo, "A Dona Lúcia caminha, cuida do peso...").

O corrimão é opcional. Ele é o que vale em todos os degraus ao mesmo tempo, por isso não vira mais um degrau. No fecho, a escada aparece inteira, com a pessoa, e o degrau que responde à pergunta da abertura acende.

O molde já traz pronto: a escada (de 1 a 5 degraus), a pessoa e a subida, as placas, o corrimão, o quadro, o texto da tela, os tempos de cada frase e o mapa do som. A peça traz só as frases, a ordem das cenas, a pessoa e o desenho de cada quadro.

## Que reel dá

Qualquer assunto com níveis em ordem e uma pessoa que passa por eles. Ideias de tema (cada uma precisa de fonte antes de virar peça):
- os níveis de prevenção, com a quaternária no corrimão (o exemplo desta pasta);
- os níveis de atenção à saúde, da UBS ao hospital;
- a escada analgésica, um remédio mais forte a cada degrau;
- as fases do estudo clínico de uma vacina.

Não serve para comparar duas coisas lado a lado, para coisas sem ordem nem para uma história que desce degrau por degrau. O molde só sobe; no fecho, a pessoa pode voltar até o degrau que responde.

## As cenas do molde

| cena | o que aparece | frases |
|---|---|---|
| abertura | a escada apagada, só com os números, e a pessoa no chão, pensando. A pergunta fica grande no alto. É a capa | 2 |
| degrau1 a degrau5 | a pessoa sobe um degrau (dois passos no som), a placa acende (sino) e o quadro do degrau entra | 2 ou mais |
| corrimao (opcional) | os pilares sobem, o corrimão corre de baixo até o topo (som de lápis) e ganha o nome; a pessoa põe a mão nele | 2 ou mais |
| escada (fecho) | a escada inteira. O degrau que responde acende, a placa dele cresce com um anel (som de "certo") e a pessoa vai até ele | 2 |

O som vem em blocos: abertura curiosa, degraus calmos, corrimão sério e fecho curioso. Há 0,6 s de silêncio antes da escada inteira aparecer. Os sons de fundo e os sons soltos de cada cena (pássaro, senha, bip...) a peça escolhe.

## O que o chat 1 preenche

1. **`textos.txt`**, as frases e as palavras de dentro do desenho. A [01] é a pergunta, em até 7 palavras, e é a capa. Cada degrau tem uma frase com o nome e o que se faz nele, e outra com o que aconteceu com a pessoa. Exemplo de linha:
   `[03] Prevenção primária é evitar que a doença comece.` e `[D01] Primária` (o nome que vai na placa do degrau 1).
2. **`score.js`**, só o bloco PREENCHER: o andamento (`BPM`), o estilo (`ESTILO`) e o `ROTEIRO`, que diz que frases entram em cada cena. Exemplo de linha:
   `{ id: 'degrau2', tipo: 'degrau', degrau: 2, linhas: [5, 6, 7] },`
   No fecho, `destaque` é o número do degrau que responde à pergunta.
3. **`film-2-peca.js`**: o trecho de cada frase que leva o destaque (`P.DESTAQUE[3] = 'Prevenção primária';`), a pessoa e o gesto dela em cada cena (`P.PESSOA`) e o desenho de cada quadro. O desenho sai de um quadro pronto, numa linha. Exemplo:
   `P.PAINEL.degrau1 = Q.lista(['D10', 'D11', 'D12', 'D13'], { frase: 1 });` (a lista do degrau 1, com o visto entrando item a item)
   Os quadros prontos são seis: `lista`, `regua`, `lupa`, `trilha`, `pilha` e `fileiras`, e dois jeitos de juntar (`porFrase`, um desenho por trecho da cena, e `juntos`). Estão explicados no próprio `film-2-peca.js` do molde. Quadro que não cabe em nenhum, o chat 1 desenha à mão com o kit de estilos.
4. **`peca.json`** (o título), **`mapa-do-som.json`** e **`legenda.txt`**. Se o número de degraus mudar, o bloco calmo do mapa do som lista os degraus novos (`degrau4`, `degrau5`). Sem corrimão, o bloco sério sai.

O resto é do molde e não muda: `film-1-molde.js`, `film-3-filme.js`, `index.html` e `peca.js` (que confere a escada quando o `textos` roda).

## Como se faz uma peça, na prática

Rode os comandos do motor do reel (`preseme/reel/motor/preseme.js`, no ig-midia) de dentro da pasta da peça. Abaixo, `preseme.js` é esse caminho:

```
node preseme.js novo escada-atencao --de <esta pasta>/molde   # monta a peça a partir do molde
node preseme.js textos                                        # lê o textos.txt, confere a escada, mostra a duração e a leitura
node preseme.js quadros                                       # folha de quadros, um por frase
node preseme.js folha-textos                                  # um quadro por frase, com ela inteira na tela
node preseme.js estilos @principal planta,lapis,carimbo       # a parada 2: o fecho em três estilos (A é o padrão)
node preseme.js som                                           # a música e os efeitos
node preseme.js rascunho                                      # vídeo em meia resolução, com som (rodar em segundo plano)
node preseme.js conferir --rascunho                           # tudo o que se mede, numa lista só
node preseme.js definitivo                                    # o vídeo final (rodar em segundo plano)
node preseme.js capa @abertura                                # a capa
node preseme.js entregar                                      # confere os arquivos e escreve a mensagem para ele
```

Na máquina do Claude, o que desenha (quadros, folha-textos, estilos, rascunho, definitivo) roda dentro de `flock /home/claude/trabalho/render.lock -c '<comando>'`.

A peça de exemplo também roda assim: `node preseme.js novo teste --de exemplo-niveis-de-prevencao`.

## A peça de exemplo

`exemplo-niveis-de-prevencao/`: os quatro níveis de prevenção a partir da mamografia. A Dona Lúcia, de 52 anos, sobe a escada: no degrau 1 ela caminha e cuida do peso; no 2, a mamografia de rotina acha um tumor pequeno; no 3, ela faz a reabilitação; o corrimão é a prevenção quaternária. A abertura pergunta "Mamografia previne câncer de mama?" e o fecho responde que ela não impede o câncer de começar, acha cedo, e por isso é prevenção secundária.

Ela dá 1min43 (102,5 s), com 6 cenas a 96 batidas por minuto, 15 frases e 19 palavras de dentro do desenho. Além do molde, o exemplo escreveu uns 6 mil caracteres: 1,7 mil no textos.txt, 2,4 mil dos quadros (quatro linhas de quadro pronto e os destaques) e o resto em roteiro, som, título e legenda.

Os fatos saíram todos do banco do projeto. Cada frase tem a fonte em `tabela-de-afirmacoes-niveis-de-prevencao.md`, junto com o teste de ensino e o teste da premissa.

## Estilo

O padrão do motor é a planta técnica (papel quadriculado e cor em aguada): a escada parece um desenho de prancheta. Para trocar, mude `ESTILO` no `score.js` e `estilo` no `peca.json`.

Em 16/11, o motor da linha do tempo também escolheu a planta. Os três estilos de reserva (chapado, carimbo e lápis) já são o padrão de outros motores, e o pixel não pode virar padrão (regra dele, no README do kit). Por isso a planta ficou. Na parada 2, ele vê o fecho em planta, lápis e carimbo e escolhe.

Na planta, a pessoa é desenhada cinco vezes por cima dela mesma, para a cor ficar firme e o corrimão não aparecer através do corpo. Nos outros estilos, uma vez.

## Limites que ele precisa saber

- De 1 a 5 degraus. Com 4 ou 5, a placa fica estreita e o nome diminui (com 5, fica com 22 px, pequeno no celular): use nomes de uma palavra. Nos degraus do meio, o quadro estreita para não cobrir a pessoa.
- O exemplo dura 1min43. O guia de roteiro de reel do plugin (reels-script) pede até uns 90 s para tutorial. Para encurtar, a peça pode tirar a [13] do corrimão ou juntar as duas frases de um degrau numa só. O tempo de leitura (2,17 palavras por segundo) não muda.
- A pessoa só sobe. No fecho, ela pode voltar até o degrau que responde.
- Os seis quadros prontos cobrem lista, régua, achado, etapas, excesso e comparação. Desenho diferente disso, o chat 1 faz à mão (no exemplo, antes dos quadros prontos, isso dava 6,6 mil caracteres).
- O texto do exemplo foi escrito pelo Opus e não é amostra da voz dele.
- Toda frase com fato sai da tabela de afirmações. Afirmação sem trecho de fonte sai da peça.
