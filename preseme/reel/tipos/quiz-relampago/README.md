# PRESEME · motor do reel · tipo "Quiz relâmpago"

Texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.

Feito na madrugada de 16/11/2026 (frente X1), em cima do motor do reel, do kit de estilos e da biblioteca de desenhos, sem mexer em nenhum dos três. Segue o mesmo molde dos outros tipos: o chat 1 copia a pasta `molde/`, preenche e roda os comandos de sempre.

## Que reel ele dá
Um jogo de 45 a 75 s sobre um assunto da matéria (pilar 2, medicina preventiva explicada, e pilar 4, a matéria da semana): de 3 a 7 perguntas rápidas de Verdadeiro ou Falso (ou A ou B), cada uma com um relógio de 3 s. Quem assiste responde de cabeça, conta os acertos no placar do canto e comenta o placar. Cada resposta vem com o porquê numa frase e um desenho pequeno; no fim, a régua do placar e o que estudar, com a fonte na tela.

É diferente do "caso com escolha" (um caso só, devagar, com o porquê de cada opção) e do "mito ou verdade" (três frases que o povo repete, com o porquê desenhado e longo): aqui o ritmo é de jogo, o assunto é da prova, e a graça é comentar o placar.

As cenas, nesta ordem (os nomes são os do `score.js` e do `mapa-do-som.json`):
1. `abertura`: o título (quantas perguntas e o assunto), o placar grande com uma casa por pergunta, a regra do jogo ("Conta os acertos e comenta o placar.") e quem joga, que entra andando no primeiro segundo.
2. `q1` a `q7`, uma por pergunta: a pergunta no alto; os dois cartões (Verdadeiro e Falso, ou A e B com as opções); o relógio que esvazia em 3 s com o tique-taque; na resposta, o cartão certo acende (✓) e o outro apaga (✗), o tremor do selo, e o painel da resposta sobe com o selo (VERDADEIRO ou FALSO, carimbado no canto do painel), o desenho pequeno da peça e o porquê embaixo. A casa da pergunta no placar do canto ganha a resposta certa (V ou F): é assim que quem assiste confere e conta.
3. `regua`: "Quantas você acertou?", o placar inteiro com as respostas e as três faixas (D04 a D06: "5 · pronto para a prova", "3 ou 4 · revisa as que errou", "até 2 · começa pelo calendário"), que entram uma por uma.
4. `estudar`: o que estudar, o desenho do fim (opcional) e a fonte na tela (D07), com o placar completo no canto.

O som: a música não para entre as perguntas (um bloco "brincalhao" da abertura à última pergunta); troca para "calmo" na régua. Efeitos: o sopro de pergunta nova, os dois cartões, o tique-taque a cada meio segundo (alternando o lado do fone), o baque do selo, o acerto discreto (o "certo", baixo) e o pop da casa do placar.

O estilo: pixel ★, a cara de jogo. Na folha de estilos do exemplo (`@principal`, a primeira pergunta com o relógio no 2), B é lápis no papel (o bem diferente) e C é carimbo e gravura (o nunca publicado), que é também o que mais pesa na letra. A régua do placar e o placar do canto saem nos três sem ajuste.

## Por que não "salva este vídeo" na régua
A ideia da frente era a faixa de baixo dizer "salva este vídeo". O caderno da voz proíbe apelo no fim; a regra do placar ("conta e comenta") fica na abertura, como regra do jogo, e as três faixas dizem o que fazer com a nota (revisar, começar por onde). Elas são palavras do textos.txt (D04 a D06): o chat 1 ajusta por peça.

## O que o chat 1 preenche
| Arquivo | O quê |
|---|---|
| `textos.txt` | as frases [NN] e as palavras do desenho [DNN]. Cada pergunta é uma afirmação curta (até umas 10 palavras). O porquê é uma frase só, que COMEÇA com a palavra do selo (Verdadeiro ou Falso; no modo A ou B, "É a A" ou "É a B") |
| `score.js`, bloco PREENCHER | BPM, ESTILO, ABERTURA (2 frases), MODO ('vf' ou 'ab'), PERGUNTAS (uma linha por pergunta: `{ p, r, porque }` e, no modo 'ab', `ops: [A, B]`), REGUA e ESTUDAR |
| `film-2-peca.js` | DESTAQUE (o trecho com marca-texto), PESSOA (quem joga na abertura, da biblioteca), DESENHO[1..n] (o desenho pequeno de cada resposta) e ESTUDAR (o desenho do fim, opcional) |
| `mapa-do-som.json` | o bloco das perguntas cita `abertura` e `q1` a `qN` (com o N da peça); o bloco do fim, `regua` e `estudar` |
| `peca.json` | título, "esperado" (quantas frases e palavras) e, se a conferência apontar, as cores de pele em "cores" |
| `legenda.txt` | a legenda, com os guias caption-writer, instagram-seo e hashtag-strategy: ensina o que o vídeo só mostrou |

Palavras do desenho que o molde usa sozinho: D01, o rótulo ("Quiz relâmpago"); D02 e D03, os cartões e o selo ("Verdadeiro" e "Falso"; a primeira letra vai para o placar); D04 a D06, as faixas da régua (nota · o que fazer); D07, a fonte na tela; D08, o selo do modo A ou B ("Certa"). As palavras do desenho de cada resposta vêm depois (no exemplo, D09 a D18).

Exemplo de pergunta (do exemplo das vacinas), com o porquê começando pela palavra do selo:
```
[07] Vacina pode ser guardada a 10 °C.
[08] Falso, o máximo é 8 °C, acima disso ela pode perder força.
```
e, no `score.js`, `{ p: 7, r: 'F', porque: 8 }`.

## Os tempos (o molde calcula; o chat não mexe)
- A resposta vem quando o relógio acaba. O relógio começa depois de pelo menos 1 s de leitura e dura 3 s; pergunta longa ganha mais tempo antes do relógio (o tempo de ler, 2,17 palavras por segundo e meio segundo de folga).
- O porquê entra 0,25 s depois do selo e fica o tempo de ler.
- Cada cena fecha numa batida par (120 bpm: a cada segundo); a régua começa num compasso, onde a música troca de bloco.
- Os cortes que a peça declara (CORTES, para o conferir): cada pergunta nova e cada resposta (o painel cobre um terço da tela de uma vez).

## Os comandos, do novo ao entregar
```
M=/home/claude/ig-midia/preseme/reel/motor/preseme.js
node $M novo /home/claude/trabalho/<nome> --de <esta-pasta>/molde
cd /home/claude/trabalho/<nome>
node $M textos --tabela
node $M quadros
node $M folha-textos
node $M estilos @principal pixel,lapis,carimbo
node $M som
flock /home/claude/trabalho/render.lock -c "node $M rascunho"
node $M conferir --rascunho
flock /home/claude/trabalho/render.lock -c "node $M definitivo"
node $M capa
node $M conferir
node $M entregar
```
Marcadores prontos no `score.js`: `@capa` (o título, a regra e o placar vazio: é a capa), `@principal` (a primeira pergunta com o relógio no 2), `@q1` a `@qN` (cada pergunta com o relógio no 2), `@q1R` a `@qNR` (cada resposta com o porquê inteiro), `@regua`, `@estudar`.

## O que o motor confere sozinho (peca.js, no comando textos)
Trava quando: há menos de 3 ou mais de 7 perguntas; uma pergunta fica sem resposta (r) ou sem o porquê; a resposta não é V ou F (no modo A ou B, A ou B, com as duas opções escritas); o porquê não começa com a palavra do selo, ou começa com a palavra da outra resposta; a régua não tem as três faixas (D04 a D06); a pergunta da régua está vazia; a peça passa de 90 s (o `limite` do peca.json também).
Avisa quando: a pergunta passa de 12 palavras ou o porquê de 16; todas as respostas são iguais (o placar fica fácil de adivinhar); a faixa de cima da régua não começa pelo número de perguntas; falta a fonte na tela (D07); uma cena não está em nenhum bloco do mapa-do-som.json (fica sem música); o andamento do mapa e o do score.js não batem; a peça passa de 75 s.

## O exemplo: 5 perguntas sobre vacina
`exemplo-vacinas/` é a peça inteira (todos os arquivos, como nos outros tipos de reel): a gotinha que saiu do esquema da pólio (F), o último caso de pólio em 1989 (V), a vacina a 10 °C (F), a BCG ao nascer (V) e a cobertura da VIP em 2023 (F). Dura 1min14, com 14 frases e 18 palavras do desenho. Os desenhos das respostas são da biblioteca: a gota com o ✗ e as quatro doses, o calendário de março de 1989, a caixa térmica com o termômetro em 10 °C e a faixa de 2 a 8 °C, o cartão de vacina com a primeira dose e a etiqueta "ao nascer", e a barra de 86,5% que não chega na linha da meta de 95%. Gancho regional: sem gancho regional (os bancos não têm dado oficial de vacinação de Roraima; o dado da vigilância da pólio em Roraima, achado no banco da pólio, não é de vacina).

Os fatos saem só de bancos que já existiam (claude/preseme-fatos-polio-antes-depois.md, claude/preseme-fatos-rede-de-frio.md e claude/preseme-fatos-sal-trans-polio-bcg.md); nenhuma leitura nova. Cada frase, com o trecho, está em `tabela-de-afirmacoes-vacinas.md`.

Quanto o exemplo escreve (medido em 16/11, 05h10, na entrega final): o molde tem 46.138 caracteres; o exemplo acrescenta 8.633, 17% da peça: 6.333 de desenho (film-2-peca.js), 1.231 de texto (textos.txt), 865 da legenda, 94 do PREENCHER (score.js), 82 do peca.json e 28 do mapa do som.

Conferido (16/11, 05h10, a entrega montada do zero com `novo --de`): o rascunho do exemplo passou no `conferir --rascunho` com 0 erro e 1 aviso (3,9 MB: não sobe pelo conector do Drive); qa em 89 quadros, 0 problema; cores em 15 quadros, nenhuma fora da paleta; -16,2 LUFS, pico -2,6 dBFS; 10 batidas nos 3 primeiros segundos; maior trecho sem corte 7,0 s com os 12 cortes declarados (10,2 s só pela imagem); a troca de música em 60 s cai num corte. O molde vazio monta (1min06) e dá a folha de quadros; o modo A ou B, montado sobre o molde final, também.

## Candidatos à biblioteca (desenhos deste tipo que podem servir a outros)
- `etiqueta` (o retângulo com a palavra do textos.txt, que diminui até caber): já se repete em quase todo tipo.
- A barra de cobertura com a linha da meta (`cobertura` no exemplo): serve a qualquer "ficou abaixo da meta".
- O placar de casas (`placar` do molde): serve a qualquer contagem por etapa.

## O que ficou de fora
- Só dois cartões por pergunta (V ou F, A ou B): três opções é o "caso com escolha".
- O placar não sabe o que a pessoa respondeu: mostra a resposta certa de cada pergunta, e quem assiste conta.
- Pessoa reagindo a cada resposta: deixaria a tela cheia demais no ritmo de jogo; quem joga aparece só na abertura.
