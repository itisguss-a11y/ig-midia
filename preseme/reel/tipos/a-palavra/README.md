# PRESEME · motor do reel · tipo "a palavra"

Texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.

Feito na madrugada de 16/11/2026 (frente W1), em cima do motor do reel, do kit de estilos e da biblioteca de desenhos, sem mexer em nenhum dos três. Segue a estrutura dos outros tipos: o chat 1 copia a pasta `molde/`, preenche e roda os comandos de sempre.

## Que reel ele dá
Um termo da matéria explicado em 20 a 40 s, para sair toda semana com pouco trabalho. É diferente do "X não é Y": um conceito só, curto e rápido. A cara do tipo é o verbete, um cartão de dicionário com a palavra grande, as sílabas escritas à mão e a sílaba forte no destaque, que abre e fecha o reel.

As cinco partes, nesta ordem (os nomes são os do `score.js` e do `mapa-do-som.json`):
1. `palavra`: a pergunta no alto ("Você sabe o que é população adscrita?") e o verbete subindo com um pop aos 0,25 s; as sílabas se escrevem aos 1,4 s (o lápis anda de um lado ao outro do fone) e a forte ganha o destaque e o acento aos 1,9 s (baque). É o gancho dos 3 primeiros segundos e o quadro da capa (`@principal`).
2. `significa`: a palavra numa etiqueta no alto, a frase do que ela quer dizer e, embaixo, o desenho dela funcionando. Uma ou duas frases; na segunda, a câmera pula para o foco dela (é um corte).
3. `exemplo`: a vida real, na UBS ou na visita, com a etiqueta [D08] ao lado da palavra. Uma ou duas frases.
4. `pegadinha`: com o que ela se confunde. O que confunde ([D05]) entra pela esquerda, o que é ([D06]) pela direita, com o sinal no meio (≠, ou = quando são duas formas da mesma coisa) e o carimbo [D07] batendo no da esquerda aos 0,9 s. Um silêncio de 0,4 s antes da frase.
5. `fecho`: o verbete inteiro de novo, agora com a frase que define, e o visto no canto. É o quadro para o print.

Estilo: lápis no papel ★ (o verbete escrito no caderno). Na folha dos três estilos do exemplo da adscrita, o lápis foi o que melhor leu a palavra e as sílabas; o pixel (o segundo exemplo) dá cara de jogo e é o bem diferente; o giz é o terceiro. As sílabas e a palavra diminuem sozinhas até caber no cartão (no pixel a letra é larga).

## O que o chat 1 preenche
| Arquivo | O quê |
|---|---|
| `textos.txt` | as frases [NN] e as palavras do desenho: [D01] a etiqueta do tipo ("A palavra"), [D02] a palavra, [D03] as sílabas com a forte em maiúsculas (ads·CRI·ta; deixe vazio se a pronúncia não confunde), [D04] a fonte curta, [D05] e [D06] os dois lados da pegadinha (até 4 palavras cada), [D07] o carimbo, [D08] a etiqueta do exemplo ("Na UBS", "Na visita") e, a partir do [D09], os rótulos do desenho |
| `score.js`, bloco PREENCHER | ESTILO e os números das frases: PALAVRA (1), SIGNIFICA (1 ou 2), EXEMPLO (1 ou 2), PEGADINHA (1), FECHO (1) |
| `film-2-peca.js` | DESTAQUE (o trecho de cada frase no marca-texto), os focos da câmera (focoSignifica, focoExemplo), o desenho de `significa` e de `exemplo` (com a biblioteca: `B.ubsIcone`, `B.casa`, `B.pessoa`, `B.prancheta`, `B.tracejado`...), o `sinal` da pegadinha e `carimbo: false` para tirar o carimbo |
| `mapa-do-som.json` | a semente (o nome da peça) e, se a pegadinha não for a frase 5, o número dela em `silencios` |
| `peca.json` | nome, título e cores de gente usadas (o grisalho `#B9B2A6` já está) |
| `legenda.txt` | a legenda que ensina o que o vídeo só mostrou (decisão 124): a definição inteira, com a fonte |

O desenho é feito no quadro inteiro (1080 × 1920), com o chão em torno de y = 1420 a 1450; o molde recorta tudo o que subir para cima da frase. O ponto do foco fica parado na tela e o resto se afasta dele: rótulo escrito longe do foco pode sair da área segura (o conferir acusa), então esconda o rótulo na frase que tem foco, como o exemplo da adscrita faz com o [D09].

## O que o motor confere sozinho (peca.js, no comando textos)
Trava quando: as cinco partes não estão todas, nesta ordem; uma parte tem mais frases do que comporta; a peça passa de 40 s; falta a palavra [D02], a fonte [D04] ou a frase do que ela quer dizer; o exemplo não mostra a atenção primária (a frase ou o [D08] têm de falar de UBS, visita, equipe, agente, cadastro, território...); falta um lado da pegadinha.
Avisa quando: as sílabas juntas não dão a palavra; há mais de uma sílaba em maiúsculas; a pergunta ou o fecho não falam a palavra; um lado da pegadinha passa de 4 palavras; a peça fica abaixo de uns 20 s.

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
Marcadores prontos no `score.js`: `@palavra`, `@principal` (a palavra com as sílabas e a forte marcada: a parada 2 e a capa), `@significa`, `@significa2`, `@exemplo`, `@exemplo2`, `@pegadinha`, `@fecho`.

## Os dois exemplos (o mesmo molde, dois reels diferentes)
| | `exemplo-adscrita/` | `exemplo-resolutividade/` |
|---|---|---|
| palavra | população adscrita | resolutividade |
| estilo | lápis no papel ★ | pixel art |
| significa | o território da UBS se desenha em volta das casas; na segunda frase, a câmera vai à UBS e as casas se ligam à equipe | a UBS no meio de uma grade de oito problemas de saúde: sete ganham o visto, o oitavo sai pela seta |
| exemplo | a agente na porta da casa 35, a prancheta enchendo e um visto por morador | o Seu Raimundo vai ao especialista pela linha tracejada; a médica fica na UBS com a prancheta |
| pegadinha | adscrita = adstrita (a PNAB escreve das duas formas) | resolver tudo ≠ a maioria e coordenar |
| duração | 37,2 s | 37,2 s |
| o que a peça escreveu além do molde | 6,0 mil caracteres (4,0 mil de desenho) | 6,1 mil caracteres (3,7 mil de desenho) |

O molde inteiro tem 35,6 mil caracteres; cada exemplo escreve uns 17% disso. A tabela de afirmações de cada um está nesta pasta (`tabela-de-afirmacoes-adscrita.md`, `tabela-de-afirmacoes-resolutividade.md`), e os trechos da PNAB, no banco claude/preseme-fatos-pnab-diretrizes-palavra.md, no projeto.

## Candidatos à biblioteca
- `verbete` (no molde: o cartão de dicionário com palavra, sílabas, definição e fonte) e `altoFalante` (o ícone da pronúncia): servem a qualquer peça que apresente um termo.
- O território com a linha tracejada em volta (`territorio` no exemplo da adscrita): UBS, casas, moradores e o limite que se desenha sozinho, com o rótulo; serve a toda peça de território, microárea e adscrição.
- A grade de problemas com a UBS no meio (exemplo da resolutividade): serve a "o que a UBS resolve".

## Próximas palavras da mesma fonte
Da lista de diretrizes da PNAB (art. 3º, II), sem peça ainda: territorialização, cuidado centrado na pessoa, coordenação do cuidado, ordenação da rede e participação da comunidade (longitudinalidade já virou o "X não é Y").
