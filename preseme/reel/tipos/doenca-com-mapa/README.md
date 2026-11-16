# Série "Doença de Roraima" · molde do reel

> texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos

Cada peça pega uma doença que pesa em Roraima e mostra:

- o número de Roraima ao lado do número do Brasil;
- por que ela é daqui, com o mapa de verdade dos municípios, o vetor e o ambiente;
- como pega, como se previne, como se reconhece e quem notifica.

O molde fixa as cenas, o tipo de cada cena, o tempo, o visual e o som. De uma peça para outra só muda a doença.

Garimpo, terra indígena e migração entram só como lugar e como prevenção. Nenhum grupo de pessoas é culpado, e política fica de fora.

## O que tem aqui

| pasta ou arquivo | o que é |
|---|---|
| `molde/` | os arquivos que o chat copia e preenche. O que se troca está marcado com `TROQUE` ou entre parênteses no `textos.txt` |
| `exemplo-malaria/` | a peça de exemplo, malária. São só os arquivos da peça, sem vídeo |
| `tabela-de-afirmacoes-malaria.md` | cada frase do exemplo com a fonte e o trecho que a sustenta |

## As cenas do molde

| cena | rótulo no alto | o que aparece | frases |
|---|---|---|---|
| abertura | (nenhum) | a pergunta, o mapa de Roraima e o vetor cruzando a tela no 1.º segundo. É a capa | 1 |
| numero | (nenhum) | o contador do Brasil, o de Roraima e a proporção ("1 em cada 5"). Os números saem das próprias frases | 3 |
| mapa | onde | a parte dos casos do país em cem quadradinhos (o número sai da frase); depois os 15 municípios de Roraima, com os dois que têm mais casos em destaque | 2 |
| vetor | quem transmite | o vetor e o agente, com o nome de cada um | 1 |
| ciclo | como pega | a picada; a seta riscada mostra o que não passa | 1 |
| prevencao | como prevenir | a vacina (se existe), a proteção de cada um e a do coletivo, cada uma num quadro | 3 |
| sinais | como reconhecer | os sintomas, o exame e o tratamento, cada um num quadro | 3 |
| notifica | quem notifica | o calendário (o prazo da Amazônia) e o relógio (o outro prazo) | 2 |
| fecho | (nenhum) | o mapa de Roraima com os ícones da prevenção; responde à pergunta da abertura | 1 |

A assinatura da série tem três partes:

- o rótulo escrito à mão no alto de cada cena (onde, quem transmite, como pega...);
- o selo pequeno de Roraima no canto;
- o apagador.

O apagador é o corte da série. Em toda troca de cena, e nas frases marcadas com `apaga` no `score.js`, uma faixa de pó de giz varre a lousa e o quadro novo aparece atrás dela. Marque `apaga` só na frase que troca o desenho inteiro.

O mapa é a malha do IBGE dos 15 municípios (`assets/rr.json`), simplificada. O nome do município no `score.js` tem de ser escrito igual ao do arquivo:

> Amajari, Alto Alegre, Boa Vista, Bonfim, Cantá, Caracaraí, Caroebe, Iracema, Mucajaí, Normandia, Pacaraima, Rorainópolis, São João da Baliza, São Luiz, Uiramutã.

O som vem em blocos, cada um com o seu clima:

- curioso na abertura e no número;
- sério do mapa ao ciclo;
- calmo na prevenção;
- curioso de novo nos sinais e na notificação;
- festa no fecho.

A floresta fica no fundo da abertura e do vetor, e a noite no ciclo. Nessas três cenas, o mosquito passa de um lado para o outro do som. Há 0,6 s de silêncio antes da frase da proporção, a mais importante. Cada passada do apagador tem o som de um sopro.

## O que o chat 1 preenche

1. `textos.txt`: as frases da peça e as palavras de dentro do desenho (`[Dnn]`). Os rótulos fixos da série (D20 a D25) não mudam.
2. `score.js`: o andamento, o estilo (`ESTILO`) e o bloco `ROTEIRO`, que traz o número das frases, as frases com `apaga` e os municípios em destaque.
3. `film-2-peca.js`: os destaques do texto e o desenho de tudo o que é da doença: o vetor, o agente, o ciclo, os ícones da prevenção, os sintomas e o exame. A abertura, o número, o mapa e o fecho já servem para qualquer doença.
4. `peca.json`: o título. `mapa-do-som.json`: o clima de cada bloco, se mudar.

O resto é do molde e não muda: `film-1-molde.js`, `film-3-filme.js`, `index.html`, `assets/rr.json` e o kit de estilos em `ferramentas/`. O `novo` do motor copia o kit mais recente para `ferramentas/` sozinho, porque o `index.html` carrega `ferramentas/estilos.js`. A cópia que vem aqui é a de 16/11 e só serve para a pasta rodar sem o `novo`.

## Como se faz uma peça, na prática

Rode os comandos do motor do reel (`preseme/reel/motor/preseme.js`, no ig-midia) de dentro da pasta da peça. No exemplo abaixo, `preseme.js` é esse caminho:

```
node preseme.js novo doenca-rr-leishmaniose --de <esta pasta>/molde   # monta a peça a partir do molde
node preseme.js textos                                                # lê o textos.txt e mostra a duração e a leitura
node preseme.js quadros                                               # folha de quadros, um por cena
node preseme.js folha-textos                                          # um quadro por frase, com ela inteira na tela
node preseme.js som                                                   # a música e os efeitos
node preseme.js rascunho                                              # vídeo em meia resolução, com som (rodar em segundo plano)
node preseme.js conferir --rascunho                                   # tudo o que se mede, numa lista só
node preseme.js definitivo                                            # o vídeo final (rodar em segundo plano)
node preseme.js capa @abertura                                        # a capa
node preseme.js entregar                                              # confere os arquivos e escreve a mensagem para ele
```

Na máquina do Claude, o rascunho e o definitivo rodam dentro de `flock /home/claude/trabalho/render.lock -c '<comando>'`.

A peça de exemplo também roda assim: `node preseme.js novo teste --de exemplo-malaria`. Ela dá 1min55, com 9 cenas a 96 batidas por minuto.

## Estilo

O estilo sai do kit de estilos, escolhido em `ESTILO` no `score.js`. O da série é `giz` (giz na lousa). Para a parada 2, mostre também `planta` (planta técnica) e `chapado` (infográfico chapado). A folha com os três sai de `node preseme.js estilos @abertura giz,planta,chapado`. A outra série, Na UBS, usa lápis no papel, para as duas nunca ficarem iguais.

## Limites que ele precisa saber

- O número da proporção ("mais de 1 em cada 5") é conta do Opus em cima de dois números oficiais (30.632 de 138.493 dá 22,1%). Está marcado na tabela para o Fable conferir.
- A ferramenta que mede o ritmo conta mal os cortes em traço fino sobre fundo escuro. O apagador existe também para isso: a faixa de pó é larga o bastante para ser medida.
- O texto do exemplo foi escrito pelo Opus e não é amostra da voz dele.
- Toda frase com fato sai da tabela de afirmações. Afirmação sem trecho de fonte sai da peça.
