# Motor "meme em vídeo" · molde do reel

> texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos

## O que o motor faz

Faz um meme curto, de 15 a 35 s, para mandar no grupo da turma. São sempre quatro tempos, nesta ordem:

1. **preparação**: uma situação de estudante de medicina (a prova, o plantão, a madrugada com o livro);
2. **virada**: a piada, com corte seco;
3. **lição**: o que fica de medicina preventiva, um cartão por frase;
4. **fecho**: a volta à situação, com o detalhe que pega.

O molde fixa os tempos, o ritmo (120 batidas por minuto, com o corte a cada 2 batidas), o corte seco da virada, os cartões da lição e o som. A peça troca só três coisas: o texto, o desenho e o estilo. Por isso dois memes do mesmo motor não saem iguais.

A brincadeira é só com a matéria e com a vida de estudante. Professor, colega e paciente ficam fora da piada, e nada pode constranger a professora ou a secretaria de saúde.

## O reel que ele dá

| tempo | o que aparece | som | frases |
|---|---|---|---|
| preparacao | a situação, desenhada pela peça. Ela entra subindo aos 0,25 s; aos 1,4 s a câmera dá um zoom seco no foco da 1.ª frase e, na 2.ª frase, pula para o foco dela (no exemplo, a figura da prova e depois o rosto do estudante). A frase fica no alto, fora do zoom | clima tenso (batida de coração), um pop na entrada, um baque no zoom e um tique de relógio por segundo | 1 ou 2 |
| virada | corte seco com clarão, raios girando atrás e um tranco na câmera. A frase entra grande | 0,5 s de silêncio antes, um sino no corte e o clima festa | 1, a piada |
| licao | a fonte numa etiqueta no alto e um cartão por frase. O cartão novo empurra o velho, e o termo que passou vira ficha com ✓ | clima brincalhão e um pop em cada cartão | de 2 a 6, no formato "Termo, o que quer dizer." |
| fecho | a volta à situação, desenhada pela peça. O carimbo bate na 1.ª frase e a seta risca na 2.ª | clima curioso, um baque no carimbo e um risco de lápis na seta | 1 ou 2 |

O exemplo, "O que é um oligodendrócito?", dura 34 s. A preparação vai de 0 a 5 s, a virada de 5 a 10 s, a lição de 10 a 25 s (5 cartões) e o fecho de 25 a 34 s.

## O que tem aqui

| pasta ou arquivo | o que é |
|---|---|
| `molde/` | os arquivos que o chat copia e preenche. O que se troca está marcado com `TROQUE` ou entre parênteses no `textos.txt`. Com o texto de molde, ele já roda (33 s) |
| `exemplo-oligodendrocito/` | a peça de exemplo, a piada dele. São só os arquivos da peça, sem vídeo |
| `tabela-de-afirmacoes-oligodendrocito.md` | cada frase do exemplo com a fonte e o trecho que a sustenta |

O banco de fatos do exemplo está no projeto, em `claude/preseme-fatos-principios-sus.md`.

## O que o chat 1 preenche

| arquivo | o que preenche | linha de exemplo |
|---|---|---|
| `textos.txt` | as frases. A [03] é a piada; as frases da lição começam pelo termo, até a vírgula | `[03] ...mas sei os princípios e diretrizes do SUS.` e `[04] Universalidade, acesso para todos.` |
| `score.js`, bloco `TROQUE` | o número das frases de cada tempo e o estilo | `{ id: 'licao', linhas: [4, 5, 6, 7, 8] }` |
| `film-2-peca.js` | os destaques, o desenho da preparação, da virada e do fecho, o foco do zoom de cada frase da preparação, o desenho de cada cartão e o carimbo | `DESTAQUE: { 1: 'oligodendrócito' }`, `focoPreparacao: [[360, 940], [1000, 1056]]` e `icones: ['todos', 'prevencaoCura', 'semFurarFila', 'conselho', 'descentralizar']` |
| `peca.json` | o título, a capa e quantas frases e palavras o `textos.txt` traz | `"esperado": { "frases": 10, "palavras": 6 }` |
| `mapa-do-som.json` | o clima de cada tempo, se mudar | `{ "cenas": ["virada"], "clima": "festa" }` |
| `legenda.txt` | a legenda, com os guias caption-writer, instagram-seo e hashtag-strategy | `Fonte, Lei nº 8.080/1990, art. 7º.` |

O resto é do molde e não muda: `film-1-molde.js` (os quatro tempos e a biblioteca de desenhos), `film-3-filme.js`, `index.html` e `peca.js` (a conferência do molde).

A biblioteca de cartões tem seis desenhos, todos do SUS: `todos`, `prevencaoCura`, `semFurarFila`, `conselho`, `descentralizar` e `lei`. Um tema de outra área desenha o próprio cartão no `film-2-peca.js`, como uma função no lugar do nome.

## Como se faz uma peça, na prática

Rode os comandos do motor do reel (`/home/claude/ig-midia/preseme/reel/motor/preseme.js`) de dentro da pasta da peça. Abaixo, `M` é esse caminho:

```
node $M novo meme-<tema> --de <esta pasta>/molde        # monta a peça a partir do molde (1 s)
cd meme-<tema>
node $M textos                                          # lê o textos.txt, roda a conferência do molde e mostra a duração
node $M quadros                                         # folha de quadros, um por marcador (4 s)
node $M estilos @principal chapado,giz,lapis            # parada 2: o quadro da piada em três estilos (7 s)
node $M folha-textos                                    # um quadro por frase, com ela inteira na tela (8 s)
node $M entregar folha                                  # a mensagem da folha de textos para ele
node $M som                                             # a música e os efeitos (16 s)
flock /home/claude/trabalho/render.lock -c "node $M rascunho"     # meia resolução, com som (segundo plano; 1 min sem fila)
node $M conferir --rascunho                             # tudo o que se mede, numa lista só
node $M entregar rascunho
flock /home/claude/trabalho/render.lock -c "node $M definitivo"   # o vídeo final (em segundo plano)
node $M capa @preparacao                                # a capa
node $M conferir
node $M entregar                                        # confere os arquivos e escreve a mensagem para ele
```

Na máquina do Claude, o rascunho e o definitivo rodam sempre dentro do `flock`, porque outras peças renderizam ao mesmo tempo.

A peça de exemplo roda do mesmo jeito: `node $M novo teste --de exemplo-oligodendrocito`.

## Estilo

O padrão deste motor é o **infográfico chapado** (`chapado`). Os outros já têm dono: o pixel art é do motor de pixel art, e lápis, giz, carimbo e planta são os padrões das séries. O estilo se troca em uma linha, `const ESTILO = 'giz';` no `score.js`, e a folha da parada 2 mostra o mesmo quadro em três estilos. O exemplo foi conferido em chapado, giz e lápis.

## Limites que ele precisa saber

- O vídeo fica entre 15 e 35 s, e o `textos` trava fora disso. Cada cartão da lição gasta uns 3 s (2,17 palavras por segundo, mais 0,5 s), por isso cabem até 6 cartões.
- A virada tem uma frase só. Piada que precisa de duas frases não cabe neste molde.
- A 1.ª frase da preparação sempre tem foco de zoom, porque o baque do zoom seco toca aos 1,4 s. Texto do desenho longe do foco sai da área segura, e o `conferir` acusa.
- O carimbo do fecho bate em cima da figura da situação: a figura é desenho, sem letra embaixo do carimbo.
- Se a peça tirar o carimbo ou a seta do fecho (`null`), o som deles continua: tire também o efeito no `score.js`.
- O texto do exemplo foi escrito pelo Opus e não é amostra da voz dele.
- Toda frase com fato sai da tabela de afirmações. Afirmação sem trecho de fonte sai da peça.
