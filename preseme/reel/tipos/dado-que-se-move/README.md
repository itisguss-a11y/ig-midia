# PRESEME · motor do reel · tipo "Dado que se move"

Texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.

Feito na madrugada de 16/11/2026 (frente U1), em cima do motor do reel, do kit de estilos e da biblioteca de desenhos, sem mexer em nenhum dos três. Segue o mesmo molde dos outros tipos (caso-com-escolha, mito-ou-verdade): o chat 1 copia a pasta `molde/`, preenche e roda os comandos de sempre.

## Que reel ele dá
Um número oficial explicado em 20 a 45 s, com o gráfico se movendo, para postar rápido e com frequência (série Doença de Roraima ou qualquer dado de fonte oficial). Na ordem:
1. `gancho`: o número grande sobe de 0 até o valor em 1,1 s e para com uma batida (o som acompanha, tique a tique); o lugar e o ano num selo em cima, a unidade embaixo, e a frase no alto diz o que é.
2. `conta`: o que o número quer dizer, em palavras simples. O desenho é a multidão de 100 mil (pontinhos de gente) com um ponto aceso por caso, para "por 100 mil habitantes"; ou a grade de 100 pessoas com as do número acesas, para "em cada 100" e porcentagem; ou nenhum.
3. `compara`: as barras crescem uma depois da outra, todas na mesma unidade (até quatro; a primeira é a da peça, em Coral). Na 2ª frase, a régua: a última barra vira bloco e voa para baixo da primeira, bloco a bloco, até cobrir; no fim, quantas vezes coube ("6,8×").
4. `porque`: por que é assim (o vetor, o lugar, a hora; nunca um grupo de pessoas), desenhado pela peça.
5. `prevencao`: o que fazer, numa frase, desenhado pela peça.
6. `fecho`: o número volta, parado, e a fonte entra grande num cartão que carimba.

Em toda cena com número, a fonte com o ano fica embaixo (a regra do tipo: número sem fonte não vai ao ar). O rótulo no alto (D01) é o assunto ("Leishmaniose tegumentar") ou "Dado de Roraima".

O estilo: carimbo e gravura ★ (dado oficial, cara de documento; o número em letra grossa lê de longe). Na folha de estilos do exemplo (`@principal`, o número parado), o carimbo ganhou: o 43,38 é o maior e mais forte dos três. B, pixel, dá cara de placar (a unidade quebra em duas linhas na letra de pixel); C, lápis, é o mais calmo. Na régua (`@regua`), os três leem bem.

## O que o chat 1 preenche
| Arquivo | O quê |
|---|---|
| `textos.txt` | as frases [NN] e as palavras do desenho [DNN]. Os números do gráfico são palavras D: [D02] o número grande, [D03] a unidade, [D04] o lugar e o ano, [D05] a fonte com o ano, [D06] e [D07] as legendas da multidão (ou da grade), [D08] a [D15] as barras (nome e valor; a primeira tem o número grande). Valor só com algarismos e vírgula. As palavras da peça começam em [D16] |
| `score.js`, bloco PREENCHER | BPM, ESTILO, GRAFICO ('multidao', 'grade' ou null) e os números das frases: GANCHO (1 ou 2), CONTA (1 ou 2), COMPARA (1 ou 2: barras e régua), PORQUE (1 ou 2), PREVENCAO (1 ou 2), FECHO (1) |
| `film-2-peca.js` | DESTAQUE, PORQUE, PREVENCAO e, se quiser, PLANOS (um enquadramento por frase desenhada). Desenhe com a biblioteca (B.floresta, B.pessoa, B.rede, B.mapaRR...) e com o kit |
| `mapa-do-som.json` | os climas dos quatro blocos e o silêncio de 0,5 s antes da frase da régua |
| `peca.json` | título, "esperado" (quantas frases e palavras) e as cores de gente usadas |
| `legenda.txt` | a legenda, com os guias caption-writer, instagram-seo e hashtag-strategy; a fonte completa (órgão, documento e ano) vai no fim |

Exemplo (do exemplo da leishmaniose): `[D02] 43,38`, `[D03] casos por 100 mil habitantes`, `[D08] Roraima` e `[D09] 43,38`, `[D12] Brasil` e `[D13] 6,34`, e a frase da régua `[04] É quase 7 vezes a taxa do país.`, que o motor confere (43,38 ÷ 6,34 = 6,84).

## Os comandos, do novo ao entregar
```
M=/home/claude/ig-midia/preseme/reel/motor/preseme.js
node $M novo /home/claude/trabalho/<nome> --de <esta-pasta>/molde
cd /home/claude/trabalho/<nome>
node $M textos --tabela
node $M quadros
node $M folha-textos
node $M estilos @principal carimbo,pixel,lapis
node $M som
flock /home/claude/trabalho/render.lock -c "node $M rascunho"
node $M conferir --rascunho
flock /home/claude/trabalho/render.lock -c "node $M definitivo"
node $M capa
node $M conferir
node $M entregar
```
Marcadores prontos no `score.js`: `@gancho`, `@principal` (o número já parado: é também a capa), `@conta` (os pontos acesos), `@compara` (as barras cheias), `@regua` (a régua inteira, com o "6,8×"), `@porque`, `@prevencao`, `@fecho`, e um `F2` para a frase seguinte de uma cena.

## O que o motor confere sozinho (peca.js, no comando textos)
Trava quando: o vídeo passa de 45 s; o número grande [D02] falta ou não é número; falta a unidade [D03] ou a fonte [D05]; o ano não aparece na tela (nem em [D04], nem em [D05]); há menos de duas barras, ou uma barra traz valor com unidade própria ("43,38%", "276 casos"); o número grande não é o da primeira barra; uma frase diz "N vezes" e a conta das barras dá outra coisa (mais de meia vez de diferença); a multidão com unidade que não é "por 100 mil", ou a grade com unidade que não é "em cada 100" nem porcentagem; uma parte tem mais frases do que o molde desenha.
Avisa quando: o ano de [D04] e o de [D05] são diferentes (pode ser de propósito); a multidão passaria de 400 pontos; falta a prevenção.
E mostra o resumo: o número com a unidade, as barras, a régua e o tamanho.

## A medida
O exemplo acrescenta ao molde 11.644 caracteres: o que o chat escreve (as frases e as palavras do desenho, 892; o desenho da peça, 9.574; a legenda, 847; e as linhas trocadas do score.js, do peca.json e do mapa-do-som.json, 331). Do desenho da peça, 2.235 são o flebotomíneo, que na próxima peça pode vir da biblioteca. O resto, 46.076 caracteres (o número que sobe, a multidão, a grade, as barras, a régua, a fonte, o fecho, os tempos, o som e a conferência), vem pronto do molde: o exemplo inteiro tem 52.953, e o chat escreveu 22% dele.

## Candidatos à biblioteca
- `flebotomineo` (o mosquito-palha: miudinho, corcunda, asas peludas em V para cima e pernas compridas), em `exemplo-leishmaniose/film-2-peca.js`. Serve à leishmaniose tegumentar e à visceral. A biblioteca só tem o Aedes e o Anopheles (`B.mosquito`).
- A janela com tela, a rede com mosquiteiro (o cone por cima da `B.rede`) e o cartão com rótulo, do mesmo arquivo: servem à malária, à dengue e ao Oropouche.
- O texto que se quebra sozinho (quebrar, equilibrar, caber, desenhar), que se repete igual em todo molde de tipo: dá para morar no motor, uma vez só.

## Limites
- Um número por reel. Série no tempo (ano a ano) ainda não tem desenho no molde: o próximo seria a linha que anda, como a régua.
- A multidão é de 100 mil: número abaixo de 1 ou acima de 400 por 100 mil não se conta de olho (o peca.js avisa; use GRAFICO null).
- O reel é curto de propósito (até 45 s): a leitura (2,17 palavras por segundo) manda no tempo, então as frases têm de ser curtas. O exemplo deu 44 s.
- O fecho não tem desenho da peça: é o número de novo e a fonte.
