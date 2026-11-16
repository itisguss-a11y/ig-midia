# PRESEME · motor do reel · tipo "Caso com escolha"

Texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.

Feito na noite de 15 para 16/11/2026 (frente T1), em cima do motor do reel e do kit de estilos, sem mexer em nenhum dos dois. Segue o mesmo molde dos outros tipos (mito-ou-verdade, passo-a-passo-na-ubs): o chat 1 copia a pasta `molde/`, preenche e roda os comandos de sempre.

## Que reel ele dá
Um caso curto, de quem chega à UBS ou aparece na visita. Depois, a pergunta ("O que é?" ou "O que você faz?") com três opções na tela e uma contagem de 3 segundos: quem assiste responde de cabeça. Silêncio. A resposta, com um selo em cada opção (CERTA, ERRADA ou PODE SER) e o porquê de cada uma desenhado, não só o veredito. Em seguida, o que se faz na atenção primária e a prevenção. O fecho volta ao caso.

As cenas, nesta ordem (os nomes são os do `score.js` e do `mapa-do-som.json`):
1. `caso`: a pessoa entra andando no primeiro segundo; a ficha (prancheta) ganha as pistas uma a uma; a frase da vez fica no alto, como título.
2. `pergunta`: a pergunta no alto, os cartões A, B e C entram um a um, e o relógio conta 3, 2, 1 (tique-taque a cada meio segundo, alternando o lado do fone). Depois da contagem, 0,6 s de silêncio total.
3. `resposta`: a resposta como título, os três cartões em fileira e um selo batendo em cada um; a pessoa reage (pensa, joinha ou mão na testa).
4. `porque1`, `porque2`, `porque3`: o cartão da vez no alto, com o selo pequeno; o desenho do porquê no meio; a frase embaixo. Nas cenas desenhadas (porquê, atenção primária e prevenção), a 2ª, a 4ª... frase vai sobre um cartaz que cobre a área do desenho: a troca lousa ⇄ cartaz muda um terço da imagem e conta como corte (no giz, o traço fino sobre a lousa muda pouco a imagem, e sem o cartaz o exemplo ficou com 24 s sem corte).
5. `aps`: o que se faz na atenção primária (rótulo D02).
6. `prevencao`: a prevenção (rótulo D03).
7. `fecho`: a mesma pessoa e a mesma ficha, agora com todas as pistas, os três selos pequenos e a frase do fecho.

O estilo: giz na lousa ★, a pergunta de prova escrita no quadro. Na folha de estilos do exemplo (`@principal`, a pergunta com o relógio no 2), o giz ganhou dos outros dois: as três opções e o número se leem de longe, e a lousa dá cara de "valendo nota" sem copiar jogo. B, lápis no papel, é o bem diferente; C, planta técnica, o nunca testado (no claro, o arco do relógio sai em Coral, porque o Marca-texto some no papel).

## O que o chat 1 preenche
| Arquivo | O quê |
|---|---|
| `textos.txt` | as frases [NN] e as palavras do desenho [DNN]. A primeira frase do porquê de cada opção começa com Certa, Errada ou Pode ser |
| `score.js`, bloco PREENCHER | BPM, ESTILO e os números das frases: CASO (1 ou 2), PERGUNTA, OPCOES (3), RESPOSTA, PORQUE (uma lista por opção), APS, PREVENCAO, FECHO (1) |
| `film-2-peca.js` | DESTAQUE, PACIENTE (quem chega), PISTAS (por frase do caso), CENARIO (o lugar, opcional), PORQUE[1..3], APS, PREVENCAO, PLANOS e, se quiser tirar o cartaz das frases pares, PAINEL: false |
| `mapa-do-som.json` | os climas dos quatro blocos e o silêncio antes da resposta (`{ "frase": <RESPOSTA>, "antes": 0.6 }`) |
| `peca.json` | título, "esperado" (quantas frases e palavras) e as cores de gente usadas |
| `legenda.txt` | a legenda, com os guias caption-writer, instagram-seo e hashtag-strategy |

Palavras do desenho que o molde usa sozinho: D01, o rótulo do tipo ("Caso da UBS" ou "Caso da visita"); D02, o rótulo da atenção primária ("Na UBS"); D03, o da prevenção ("Prevenção"). As pistas da ficha também são palavras D (no exemplo, D04 a D07).

Exemplo de linha (do exemplo da febre), a do porquê da opção B, com o veredito no começo:
```
[10] Pode ser Oropouche, que passa pelo maruim, o mosquito-pólvora.
```
e, no `score.js`, `const PORQUE = [[8, 9], [10, 11], [12, 13]];`.

## Os comandos, do novo ao entregar
```
M=/home/claude/ig-midia/preseme/reel/motor/preseme.js
node $M novo /home/claude/trabalho/<nome> --de <esta-pasta>/molde
cd /home/claude/trabalho/<nome>
node $M textos --tabela
node $M quadros
node $M folha-textos
node $M estilos @principal giz,lapis,planta
node $M som
flock /home/claude/trabalho/render.lock -c "node $M rascunho"
node $M conferir --rascunho
flock /home/claude/trabalho/render.lock -c "node $M definitivo"
node $M capa
node $M conferir
node $M entregar
```
Marcadores prontos no `score.js`: `@caso`, `@pergunta`, `@contagem` e `@principal` (a pergunta com o relógio no 2, que é também a capa), `@resposta`, `@selos` (os três selos já batidos), `@porque1` a `@porque3`, `@aps`, `@prevencao`, `@fecho`, e um `F2`, `F3`... para cada frase seguinte de uma cena.

## O que o motor confere sozinho (peca.js, no comando textos)
Trava quando: não são três opções; o caso tem mais de duas frases ou o fecho mais de uma; a pergunta ou a resposta estão vazias; uma opção fica sem porquê; a primeira frase do porquê de uma opção não começa com Certa, Errada ou Pode ser; a resposta diz a letra ("É a B.") e a B não é a única CERTA; a resposta diz "qualquer uma" e há selo ERRADA; a resposta diz "nenhuma" e há selo que não é ERRADA.
Avisa quando: falta o silêncio antes da resposta no `mapa-do-som.json` ou ele não tem os mesmos 0,6 s do `score.js`; uma opção passa de quatro palavras; o fecho não repete nenhuma palavra do caso; a pergunta não termina em "?".
Mostra sempre a linha SELOS (A, B e C) e, quando a resposta diz a letra ou "qualquer uma", a linha CONTA OK.

Os tempos saem do texto: cada frase fica palavras ÷ 2,17 + 0,5 s (mínimo de 4 batidas); a pergunta fica o tempo de ler ela e as três opções, mais 0,8 s, mais os 3 s da contagem e os 0,6 s do silêncio; toda cena acaba no fim de um compasso, e a música troca nos cortes (quatro blocos: caso, pergunta, resposta com os porquês, e atenção primária com prevenção e fecho).

## Cuidados de quem escreve
- Nada de diagnóstico pela tela. Quando o caso não fecha só pelos sintomas, a resposta honesta é "pode ser", e o porquê diz o que aponta para cada opção e quem separa (o exame e a equipe).
- A pergunta tem uma resposta que se defende com trecho de fonte; opção errada também precisa de porquê com fonte.
- O caso não culpa nenhum grupo de pessoas (no exemplo, "quem mora perto de mata", e não uma profissão ou um povo).
- Remédio só com nome se a fonte trouxer, e nunca como conselho.
- Do jeito dele: vírgula, não dois-pontos, para apresentar algo; nada de aula, módulo ou cronograma; sem apelo no fim; sem o nome do perfil na arte.
- Uma imagem por frase nas cenas desenhadas: a troca seca da frase é o corte (trecho sem corte acima de 12 s vira aviso).

## O que está nesta pasta
- `molde/`: o tipo, para copiar (com desenhos provisórios, que já rodam).
- `exemplo-febre-na-mata/`: a peça de exemplo, só os arquivos dela (o `novo --de` monta o resto). Febre de repente, dor de cabeça e dor no corpo em quem mora perto de mata, em Roraima: dengue, febre do Oropouche ou malária? 2 min, 21 frases e 23 palavras do desenho.
- `tabela-de-afirmacoes-febre-na-mata.md`: cada frase do exemplo, o trecho e a fonte.
- O banco novo de fatos, gravado no projeto: `claude/preseme-fatos-febre-na-mata.md` (dengue e as linhas da lista de notificação).
