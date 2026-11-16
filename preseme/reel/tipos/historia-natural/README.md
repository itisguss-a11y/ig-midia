# PRESEME · motor do reel · tipo "história natural"

Texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.

Feito na madrugada de 16/11/2026 (frentes Y1 e Y1b), em cima do motor do reel, do kit de estilos e da biblioteca de desenhos, sem mexer em nenhum dos três. Segue o mesmo molde dos outros tipos: o chat 1 copia a pasta `molde/`, preenche e roda os comandos de sempre.

## Que reel ele dá
A doença contada na vida de uma pessoa, numa régua de tempo (dias ou semanas) que corre na tela. Cada fase é uma parada da câmera na régua: em cima, o tempo grande ("3 a 8 dias"); embaixo, o nome da fase ("incubação") e a faixa do nível de prevenção que age ali; no cartão, a mesma pessoa vivendo aquela fase. Uma linha tracejada marca o primeiro sintoma: antes dela, a doença já está lá e nada aparece. No fecho, a câmera se afasta para a régua inteira, com os trechos de cada nível de prevenção embaixo e a placa de parar no ponto em que dava para ter parado a doença.

É o conceito de história natural da doença e dos níveis de prevenção (Leavell e Clark) aplicado a um caso. É diferente da escada de níveis (níveis sem tempo) e da linha do tempo (datas da história do país): aqui o tempo é o da doença numa pessoa.

As cenas, nesta ordem (os nomes são os do `score.js` e do `mapa-do-som.json`):
1. `abertura` (tipo pergunta): a pergunta grande; no primeiro segundo o cartão da primeira fase (a pessoa) sobe entrando e a régua se desenha da esquerda para a direita; na 2ª frase, a câmera se afasta e a régua inteira aparece, com os nomes das fases um a um (um tique por fase).
2. Uma cena por fase (tipo fase), na ordem do tempo: a câmera viaja até a fase (sopro no som), a fase assenta na régua (pop) e as frases da cena mudam o desenho do cartão. Da 2ª frase da fase (e da 4ª), corte seco para o cartão de perto: a régua sai da tela durante a frase, o cartão desce para o lugar dela, um pouco maior (1,06, para o texto de dentro não sair da área segura), e o vídeo ganha um corte a cada frase (tique leve no som).
3. `fecho` (tipo fecho): a régua inteira; os trechos da prevenção entram um a um, com o que se faz em colunas lado a lado, a placa de parar bate e a frase fica no pé da tela. Na 2ª frase do fecho, corte seco para perto, na fase do primeiro sintoma, com a faixa da prevenção que age ali.

O estilo: lápis no papel ★ (a régua desenhada à mão, como no caderno). Na folha de estilos do exemplo (`@principal`, a fase dos sinais), o lápis leu melhor o tempo grande e a faixa; o giz na lousa é o bem diferente e o pixel art o nunca testado neste tipo (no pixel, a letra larga deixa a faixa pequena).

## O que o chat 1 preenche
| Arquivo | O quê |
|---|---|
| `textos.txt` | as frases [NN] (1 a 3 por fase) e as palavras do desenho [DNN]: o tempo e o nome de cada fase, os nomes dos níveis, o que cada nível faz |
| `score.js`, bloco PREENCHER | BPM, ESTILO, `FASES` (de 3 a 7, na ordem do tempo: id, nome, dias, horizonte na fase do primeiro sintoma, dia para conferir a ordem), `PREVENCAO` (um trecho por nível: de que fase até que fase, o que se faz, `para: true` onde dava para parar) e o `ROTEIRO` (a pergunta, uma cena por fase com as frases, o fecho) |
| `film-2-peca.js` | DESTAQUE (o trecho com marca-texto de cada frase) e `CARTAO[id]`, o desenho de cada fase, que muda a cada frase da cena (`ap(info, 0)`, `ap(info, 1)`...). Desenho primeiro da biblioteca (`B.*`) |
| `mapa-do-som.json` | os climas dos blocos, os fundos de ambiente por cena e o silêncio antes da frase do fecho |
| `peca.json` | título, "esperado" (quantas frases e palavras) e as cores de gente usadas |
| `legenda.txt` | a legenda que ensina (decisão 124), com os guias caption-writer, instagram-seo e hashtag-strategy |

Exemplo de linhas (do exemplo do Oropouche), a fase da incubação, com o tempo em cima da régua:
```
[06] De 3 a 8 dias, o vírus está no corpo e nada aparece: é a incubação.
[D02] 3 a 8 dias
[D08] incubação
```
e, no `score.js`, `{ id: 'incubacao', nome: 'D08', dias: 'D02', dia: 3 }` em `FASES` e `{ id: 'incubacao', tipo: 'fase', linhas: [6] }` no `ROTEIRO`. Fase sem trecho de fonte fica sem `dias`.

O molde já desenha, igual em toda peça: a régua e os tiques, o tempo e o nome de cada fase, a linha do primeiro sintoma, a faixa do nível, a viagem da câmera, o cartão de perto nas frases pares, a entrada da abertura, a régua inteira com os nomes em andares (dois até 4 fases, três de 5 em diante), os trechos da prevenção com as colunas do que se faz, a placa de parar, o corte do fecho, os efeitos sonoros e o texto. As ajudas do molde para o cartão (em `HIST.KIT`): `ap` e `tf` (animar pela frase), `texto` (texto dentro do cartão), `chao`, `virus` (o bicho de dentro, redondo com espinhos) e `documento` (ficha, pedido de exame, notificação).

## Os comandos, do novo ao entregar
```
M=/home/claude/ig-midia/preseme/reel/motor/preseme.js
node $M novo /home/claude/trabalho/<nome> --de <esta-pasta>/molde
cd /home/claude/trabalho/<nome>
node $M textos --tabela
node $M quadros
node $M folha-textos
node $M estilos @principal lapis,pixel,giz
node $M som
flock /home/claude/trabalho/render.lock -c "node $M rascunho"
node $M conferir --rascunho
flock /home/claude/trabalho/render.lock -c "node $M definitivo"
node $M capa
node $M conferir
node $M entregar
```
Marcadores prontos no `score.js`: um por frase (`@abertura`, `@aberturaF2`, `@<fase>`, `@<fase>F2`..., `@fecho`, `@fechoF2`), `@abertura` também é a capa, e `@principal` é a primeira frase da fase do primeiro sintoma (a parada 2 e a folha de estilos). A câmera anda e o fundo fica: o `score.js` declara os cortes para o `conferir` (`CORTES`: o começo de cada cena e a 2ª frase da pergunta, quando a câmera se afasta para a régua inteira); os cortes do cartão de perto e do fecho a imagem mostra sozinha.

## O que o motor confere sozinho (peca.js, no comando textos)
Trava quando: a régua tem menos de 3 ou mais de 7 fases; uma fase fica sem nome ou sem frase; as cenas das fases não seguem a ordem das `FASES`, ou um `dia` volta (régua fora de ordem); um trecho de `PREVENCAO` cita uma fase que não existe, começa depois de onde termina, encosta noutro trecho ou põe os níveis fora da ordem do tempo; um nível usado fica sem nome no textos.txt; a linha do primeiro sintoma cai na primeira fase ou aparece duas vezes; falta a pergunta no começo ou o fecho no fim; a peça passa de 2 minutos.
Avisa quando: a primária chega na fase do primeiro sintoma; a placa de parar está num trecho de terciária; um "o que se faz" está vazio; nenhum trecho tem a placa de parar.
Testado em 16/11 com cópias quebradas de propósito (fase sem frase, prevenção numa fase que não existe, régua fora de ordem, peça de 2min16): as quatro travam (`textos` sai com código 1).

## Cuidados do tipo
- O tempo de cada fase sai da fonte, com o trecho na tabela de afirmações. Sem trecho, a fase fica sem tempo.
- "Na maioria" quando a fonte fala da evolução comum e cita complicação; nunca "não mata" sem a fonte mais nova.
- A placa de parar fica na prevenção primária ou na secundária (onde a doença ainda pode ser parada ou achada cedo), nunca na terciária.
- A pessoa é inventada e a mesma em todos os cartões; nenhum grupo de pessoas é culpado (a peça fala da atividade e do lugar).

## O exemplo
`exemplo-oropouche/` (só os arquivos da peça) e `tabela-de-afirmacoes-oropouche.md`: o Oropouche na vida da Dona Rita, em seis fases (antes de pegar, a picada, a incubação, os sinais, o exame, o fim ou a volta), com a prevenção primária antes da picada e a secundária dos sinais ao exame. 14 frases, 26 palavras do desenho, 1min52, lápis. Banco: claude/preseme-fatos-oropouche-historia.md (Nota Técnica nº 6/2024 do Ministério da Saúde) e claude/preseme-fatos-oropouche.md.

Medida: o molde tem 49.168 caracteres; o exemplo acrescenta 14.328 (linhas novas ou trocadas), 25% da peça de 56.362. Desses, 9.740 são o desenho dos seis cartões (film-2-peca.js), 1.604 o textos.txt, 1.224 a legenda, 1.107 o bloco PREENCHER do score.js, 511 o mapa do som e 142 o peca.json. O desenho chama a biblioteca 18 vezes (11 desenhos: pessoa, árvore, mapa de Roraima, lupa, tracejado, calendário, dor, termômetro, mosquito, seringa, visto).

## Candidatos à biblioteca
Do molde (`HIST.KIT`): `virus` (o bicho redondo com espinhos, que entra crescendo) e `documento` (ficha com título e linhas). Do exemplo: o maruim (o mosquito-pólvora, para a lupa), a planta da roça, o tubo de sangue e a grade de pessoas ("6 em 10", que acende uma parte).

## O que ficou de fora
- A terciária no exemplo: a nota diz evolução sem sequelas na maioria. O molde desenha a terciária (Coral) quando a peça usa.
- Pessoa deitada: a biblioteca não tem (o cartão dos sinais mostra a pessoa em pé, com a dor).
