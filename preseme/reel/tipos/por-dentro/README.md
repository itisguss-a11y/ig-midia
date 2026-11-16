# PRESEME · motor do reel · tipo "por dentro"

Texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.

Feito na madrugada de 16/11/2026 (frente U2), em cima do motor do reel, do kit de estilos e da biblioteca de desenhos, sem mexer em nenhum dos três. Segue o mesmo molde dos outros tipos: o chat 1 copia a pasta `molde/`, preenche e roda os comandos de sempre.

## Que reel ele dá
O mecanismo explicado com zoom. A câmera começa na pessoa, no dia a dia (a cena de fora), entra no corpo pela "porta" (o braço, o pulmão, o vaso), chega mais perto (o tecido, a célula, a molécula) e volta para fora no fim, com o que se faz para prevenir. Cada nível é uma cena com o que acontece ali e por quê; a viagem de um nível ao outro é a explicação. Serve para fisiologia e fisiopatologia vistas pela prevenção (pilar 2, e o pilar 4, a matéria da semana): como a vacina ensina o corpo (o exemplo), o que o excesso de sal faz na pressão, por que a hipoglicemia confunde, o que o calor faz no corpo, o que o cigarro faz no pulmão.

A cara do tipo (é do molde, igual em toda peça):
- **A janela**: o nível aparece numa janela no meio da tela (de y 330 a 1170); a frase fica embaixo dela, sempre no mesmo lugar.
- **A trilha** no alto: "Por fora › O braço › As células", que cresce quando a câmera entra e encolhe quando ela sai (quem assiste sabe onde está).
- **A lente**: no fim da cena, uma lente pousa na porta do nível seguinte, já com ele aparecendo dentro dela.
- **A viagem**: a câmera atravessa a lente, um nível por vez, com o sopro andando no fone; a saída é o mesmo caminho ao contrário. Pode voltar a um nível que já passou (no exemplo, sai do anticorpo para as células, para mostrar a memória).
- **O fecho**: a viagem inteira em medalhões (um círculo por nível, com o desenho dele dentro e o nome embaixo) e a regra grande.

As cenas (os nomes vão no `score.js` e no `mapa-do-som.json`):
1. `pergunta`: a cena de fora, com a pergunta grande (é a capa, `@principal`).
2. Uma cena `nivel` por parada da câmera (de 1 a 3 frases cada), em qualquer ordem de níveis: a câmera vai sozinha do nível da cena anterior até o desta.
3. A penúltima cena é de fora: o que muda na vida da pessoa e o que se faz para prevenir.
4. `fecho`: a regra em uma frase, com os medalhões.

## Por que dois reels deste motor não saem iguais
- Os níveis mudam com o assunto: de 2 a 5 (o de fora e de 1 a 4 de dentro), e a câmera pode entrar e sair quantas vezes a história pedir.
- Cada nível é desenhado para a peça, com a biblioteca (lugar, gente, objetos) e o corpo por dentro (abaixo).
- A cena de fora pode mudar de lugar com a história (no exemplo, a sala de vacina na ida e a rua na volta, meses depois): a porta pode ser uma função do estado.
- O estilo troca com uma palavra (`ESTILO` no `score.js`). O padrão do tipo é o lápis no papel ★, o desenho de livro de biologia, que entra no corpo sem ficar frio. Conferido no exemplo em lápis, giz, pixel, chapado e planta: o corpo por dentro escolhe sozinho a cor que não some no fundo do nível.

## O que o chat 1 preenche
| Arquivo | O quê |
|---|---|
| `textos.txt` | as frases [NN] e as palavras do desenho [DNN]. As primeiras D são os nomes da trilha, uma por nível |
| `score.js`, bloco PREENCHER | `BPM`, `ESTILO`, `NIVEIS` (id e o rótulo D de cada um, de fora para dentro), `ROTEIRO` (as cenas: pergunta, nivel com o id do nível, fecho; e os efeitos de som de cada frase, se quiser) e `PLANOS` (um enquadramento por frase, corte seco; fica aqui porque é um corte, e o motor declara ao conferir: no fundo liso de dentro do corpo, a imagem muda pouco de uma vez e a medida sozinha não veria) |
| `film-2-peca.js` | `DESTAQUE` (o marca-texto de cada frase), `NIVEL` (o desenho de cada nível) e `PORTA` (onde mora o nível seguinte, dentro de cada um: `{ x, y, r }` ou uma função do estado) |
| `peca.json` | título, "esperado" (quantas frases e palavras) e as cores de gente usadas |
| `mapa-do-som.json` | os climas dos blocos de cenas (no exemplo: curioso na pergunta, tenso dentro do corpo, calmo na volta) |
| `legenda.txt` | a legenda, com os guias caption-writer, instagram-seo e hashtag-strategy |

O desenho de cada nível recebe `st.desde[n]` (há quantos segundos a frase n entrou, em qualquer cena): o nível muda com a história e fica como ficou. É assim que o plasmócito do exemplo continua lá quando a câmera volta às células para a memória.

## O corpo por dentro (`film-0-corpo.js`), candidatos à biblioteca
Desenhos prontos, no mesmo jeito da biblioteca (x, y, s, rot, seed, k), nos seis estilos e só nas cores da paleta e de gente. A peça chama por `globalThis.CORPO`:
- `pele({ y0, y1 })`: a pele em corte.
- `musculo({ y0, y1, fibras })`: o músculo em corte, fibras deitadas (cor de pele; `fibra` muda).
- `vaso({ de, ate, larg, t })`: o vaso com as hemácias correndo.
- `plasma({ papel })`: o fundo do nível das células.
- `celula({ x, y, r, tipo })`: `'B'` (linfócito B, com os receptores em Y), `'T'`, `'memoria'` (pequena, com a marca), `'plasmocito'` (núcleo de lado e a fábrica em volta), `'defesa'`, `'hemacia'`.
- `microbio({ x, y, r, fraco, forma })`: o micróbio com as espículas; `fraco` (tracejado, o da vacina); `forma: 'quadrado'` (outro micróbio).
- `anticorpo({ x, y, s, rot, ponta })`: a proteína em Y, com as pontas na cor `ponta`. Devolve as pontas (para encaixar no antígeno).
- `local(papel)`: diz o fundo do nível quando ele não vem do corpo (sala, rua), para a cor que não some.

O texto que a peça escreve dentro do nível (os rótulos, por `M.escrever`) só aparece quando o nível está na tela inteira: na lente, na viagem e nos medalhões ele some sozinho (pequeno ou saindo da tela, ninguém lê, e o qa reprova).
Para entrar na biblioteca do motor: copiar as funções para `motor/estilos/biblioteca.js` (já seguem a regra de lá) e trocar `globalThis.CORPO` por `B`.

## Os comandos, do novo ao entregar
```
M=/home/claude/ig-midia/preseme/reel/motor/preseme.js
node $M novo /home/claude/trabalho/<nome> --de <esta-pasta>/molde
cd /home/claude/trabalho/<nome>
node $M textos --tabela
node $M quadros
node $M folha-textos
node $M estilos @principal lapis,giz,pixel
node $M som
flock /home/claude/trabalho/render.lock -c "node $M rascunho"
node $M conferir --rascunho
flock /home/claude/trabalho/render.lock -c "node $M definitivo"
node $M capa
node $M conferir
node $M entregar
```
Marcadores prontos: `@principal` (a capa), um por frase (`@<cena>`, `@<cena>F2`...) e `@viagem1`, `@viagem2`... (o meio de cada viagem, para olhar a câmera entrando e saindo na folha de quadros).

## O que o motor confere sozinho (peca.js, no comando textos)
Trava quando: são menos de 2 ou mais de 5 níveis; um nível fica sem frase (a câmera passaria por ele sem dizer o que acontece ali); a primeira cena não é a pergunta ou a última não é o fecho; a penúltima cena não é de fora (o zoom não volta para fora antes do fecho); a peça passa de 2 minutos (também no `limite` do peca.json). Os três casos foram testados.
Avisa quando: um nível de dentro está sem porta (a lente pousa no meio da janela); uma cena tem mais de 3 frases; falta o nome de um nível na trilha; a pergunta não termina em "?".
Mostra o caminho da câmera, para conferir de olho: `CAMINHO: fora → braco → celulas → anticorpo → celulas → fora (a câmera entra 3 vezes e sai 3); 1min48 de 2min00.`

## O exemplo: "Como uma vacina ensina o corpo a se defender?"
- `exemplo-vacina/` (só os arquivos da peça) e `tabela-de-afirmacoes-vacina.md`. Banco de fatos: `claude/preseme-fatos-vacina-por-dentro.md`, no projeto (Ministério da Saúde, cartilha do ACS sobre vacinação, 2023; Instituto Butantan, "Soros e vacinas do Butantan", 2018), coletado pelo Opus, a conferir pelo Fable.
- 15 frases e 10 palavras do desenho, 1min48. Quatro níveis (por fora, o braço, as células, o anticorpo); a câmera entra três vezes e sai três (desce até o anticorpo, sobe às células para a memória e sai para a rua).
- O exemplo acrescenta 15.836 caracteres ao molde, quase todos no desenho (`film-2-peca.js`, 12.369). O molde inteiro tem 46.638 (10.217 deles no corpo por dentro), que a peça não escreve.
- Sem gancho regional (nenhum dado de Roraima lido para o mecanismo). O banco guarda o ponto do soro (anticorpo pronto, protege na hora e dura pouco), que liga ao soro antiveneno de Roraima numa peça futura.

## Limites conhecidos
- A câmera entra e sai sempre pela porta, em linha reta; não faz curva nem desvia de obstáculo.
- A lente cobre o pedaço do nível que fica embaixo dela; a porta deve ficar num ponto livre do desenho.
- Os medalhões do fecho mostram cada nível no estado do fim da peça (pelo `st.desde`); um nível que muda muito com a história mostra o último estado.
- Rótulo perto da borda da janela pode sair da tela num plano (`PLANOS`) com zoom, e o qa reprova: ponha o rótulo para dentro ou tire o plano daquela frase.
- Os cortes declarados (`CORTES`, feitos pelo score.js) são o começo de cada cena e de cada frase com plano. A viagem pela porta não conta como corte na imagem (ela muda 1% por quadro): o começo da cena, sim.
