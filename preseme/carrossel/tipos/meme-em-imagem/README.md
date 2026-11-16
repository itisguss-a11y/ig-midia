# Carrossel · tipo meme em imagem

> texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos

Feito pela frente V1 na madrugada de 16/11/2026, no motor do reel (`preseme/reel/motor`, carrossel 4:5, 1080 × 1350), com a biblioteca de desenhos. Precisa do `motor.diff` desta frente (abaixo, "O motor").

## O que o tipo faz
O meme parado que a turma manda no grupo: o formato "meme" da estratégia, o que rende curtida e comentário. É um quadrinho de 1 a 4 painéis, com os mesmos tempos do primo em vídeo (`preseme/reel/tipos/meme-em-video`):
1. **preparação** (1 ou 2 painéis): a situação de estudante de medicina da UFRR (a prova, o tutorial, a visita com o ACS, o plantão, a madrugada com o livro);
2. **virada** (1 painel): a piada, de perto, com os raios em Marca-texto atrás;
3. **fecho** (0 ou 1 painel): a volta à situação, opcional;
4. **lição** (obrigatória): o que fica de medicina preventiva, com a fonte na tela.

Dois arranjos, no mesmo molde (`ARRANJO`, no `score.js`):
- `quadrinho`: os painéis numa lâmina só, em grade, e a lição numa faixa escura embaixo. Sai um post de uma imagem, a que se encaminha no grupo. Exemplo: `exemplo-monitor-de-frasco` (3 painéis).
- `laminas`: um painel por lâmina (a piada chega no deslize) e a lição no cartão escuro da última, com um desenho opcional. Exemplo: `exemplo-hipoglicemia` (3 painéis e o cartão, 4 lâminas).

Personagens só da biblioteca (`B.pessoa`: calouro, agente, médica, idosa...). Nada de foto, de personagem famoso ou de template de meme conhecido: o formato próprio é o quadrinho do perfil (borda de tinta, a legenda do narrador com a faixa de Marca-texto, os balões, os raios da virada e a faixa "o que fica"). A piada é com a vida de estudante; paciente, colega, professor e grupo de pessoas ficam fora dela.

## Tipos de lâmina (em `film-3-moldes.js`, do tipo)
- `quadrinho`: os painéis em grade (`GRADE`; sem ela, 1 → [[1]], 2 → [[1, 2]], 3 → [[1, 2], [3]], 4 → [[1, 2], [3, 4]]) e a faixa da lição, que fica com no máximo um terço da lâmina.
- `painel`: um painel na lâmina inteira.
- `licao`: o cartão escuro com a etiqueta (D), até 3 frases, o desenho da peça (`DESENHO.licao`, se tiver: ganha pelo menos 300 px) e a fonte (D).

Dentro do painel, os textos (cada um com o jeito, `como`):
- `legenda`: a caixa do narrador, no alto à esquerda (a faixa de Marca-texto na borda);
- `fala`: o balão com o rabinho até a cabeça de quem fala (`quem`);
- `pensa`: o balão de pensamento, com as bolinhas até a cabeça;
- `grito`: o balão de pontas, sem rabinho.
Todos os textos do mesmo jeito numa lâmina saem no mesmo tamanho: o maior em que todos cabem.

## O palco e a câmera (o que poupa desenho)
Cada painel mostra um pedaço de um palco. O palco é a cena inteira, no tamanho da lâmina (1080 × 1350, chão em 984), feita com a biblioteca; a câmera é o pedaço dele que o painel mostra, `[x, y, w, h]`. O mesmo palco com outra câmera dá o close da reação, e a cena fica igual de um painel para o outro sem ser desenhada duas vezes. No exemplo do monitor, os painéis das 8h e das 11h30 são o mesmo palco (`rua`), com o estado do calouro trocado por `info.id`.

O molde faz sozinho:
- encaixa a câmera no painel, encostada embaixo e no meio, e põe os textos por cima, no alto;
- antes de desenhar, roda o palco numa tela pequena que ninguém vê (o qa não lê) para saber onde ficam as cabeças e os rótulos; se uma cabeça ou um rótulo cairia embaixo de uma caixa de texto, a câmera se afasta até ele aparecer;
- no painel largo (a virada embaixo, no quadrinho), o balão sozinho vai para o lado contrário de quem fala, com o rabinho atravessando, e o rosto fica grande do outro lado;
- dois balões de gente diferente dividem a linha, um de cada lado, quando cabem;
- a letra encolhe quando a caixa passaria de 42% do alto do painel (a letra do pixel é larga);
- o rótulo de dentro da cena (`info.rotulo(D, x, y, op)`) sai no tamanho de verdade, sem encolher com a câmera, e não sai do painel; `caixa: true` põe numa plaquinha clara.

## O que o chat 1 preenche
| Arquivo | O quê | Exemplo (do monitor) |
|---|---|---|
| `textos.txt` | as frases [NN] (painéis e lição) e as palavras D (etiqueta da lição, fonte, rótulos) | `[03] Se eu fosse vacina, já era descarte.` |
| `score.js`, bloco PREENCHER | ESTILO, ARRANJO, GRADE, PAINEIS (id, tempo, textos com como e quem, rotulos), LICAO (linhas, etiqueta, fonte) e DESTAQUE | `{ id: 'virada', tempo: 'virada', textos: [{ n: 3, como: 'fala', quem: 'calouro' }] }` |
| `film-2-desenhos.js` | os palcos (`DESENHO.palco.nome`, que devolvem `cabecas`), as câmeras (`DESENHO.paineis`) e, na sequência, o desenho do cartão (`DESENHO.licao`) | `virada: { palco: 'close', camera: [460, 560, 680, 400], raios: true, foco: [700, 715] }` |
| `peca.json` | nome, título, `esperado` (frases e palavras) e as cores de gente | `"cores": ["#C98A62", "#DBA27E", "#A86E4B", "#2B211E"]` |
| `alt.txt` | o texto alternativo, um por lâmina | `[L01] Quadrinho em três painéis...` |
| `legenda.txt` | a legenda (guias caption-writer, instagram-seo e hashtag-strategy): a primeira linha puxa a piada, o corpo ensina o que a imagem só mostrou, a fonte e até 5 hashtags | `legenda-monitor-de-frasco.txt` |

O resto é do tipo e não muda: `film-3-moldes.js`, `film-1-base.js`, `film-9-filme.js`, `index.html` e `peca.js`.

## Como se faz uma peça, na prática
```
M=/home/claude/ig-midia/preseme/reel/motor/preseme.js
node $M novo /home/claude/trabalho/<nome> --de <esta pasta>/molde     # copia o kit e a biblioteca
cd /home/claude/trabalho/<nome>
node $M textos                         # confere o tipo (peca.js) e grava o textos.js
node $M laminas                        # as lâminas, a folha e os JPEG de subir (4 a 15 s)
node $M estilos @principal lapis,pixel,giz    # a parada 2: o quadro da piada em três estilos
node $M conferir                       # tudo o que se mede, numa lista só
node $M capa
node $M entregar folha                 # e, depois do ok dele, node $M entregar
```
O marcador `@principal` é a lâmina da virada (no quadrinho, a lâmina única).

## O que o molde confere sozinho (peca.js, no comando textos)
Trava quando: os painéis não são de 1 a 4; não há exatamente uma virada; a preparação vem depois da virada ou o fecho antes; há mais de 2 painéis de preparação ou mais de 1 de fecho; um painel tem mais de 3 textos; um texto de painel passa de 12 palavras no quadrinho (18 na lâmina inteira); um balão de fala ou de pensamento não diz de quem é; falta a lição (piada sem lição); a lição passa de 2 frases no quadrinho (3 no cartão) ou uma frase dela passa de 22 palavras; falta a fonte na tela; a GRADE não tem cada painel uma vez.
Avisa quando: um painel tem mais de uma legenda; um rótulo passa de 8 palavras; a etiqueta da lição está vazia; a primeira frase do primeiro painel não é a [01].
Os sete casos de trava principais foram testados um a um (cinco painéis, sem lição, duas viradas, fala sem dono, fecho antes da virada, texto longo, lição sem fonte): todos saem com erro.

## Estilo
O padrão é **lápis no papel** (★): o quadrinho se lê melhor, a letra de mão do balão tem cara de gibi e o contraste aguenta a miniatura do WhatsApp. Na folha dos três estilos, o pixel art e o giz também saíram inteiros nos dois exemplos (B e C), depois dos ajustes da letra e da faixa. O estilo se troca em uma linha (`const ESTILO = 'giz';`) ou na hora (`laminas --estilo giz`).

## O motor
O `conferir` do motor exige de 5 a 20 lâminas, e o meme tem de 1 a 5. O `motor.diff` desta frente deixa o tipo pedir outra faixa no score.js (`LAMINAS_MIN` e `LAMINAS_MAX`, de 1 a 20; sem elas, de 5 a 20, como antes) e, com uma lâmina só, o `entregar` fala em post de uma imagem. Aplicar: `cd /home/claude/ig-midia/preseme/reel/motor && patch -p1 < motor.diff`. Sem o diff, o conferir dos dois exemplos dá 1 erro (a contagem de lâminas) e o resto passa.

## Desenhos novos, candidatos à biblioteca
- Do tipo (em `film-3-moldes.js`, `PRESEME.MEME`): `balao` (fala, pensa e grito), `legenda` (a caixa do narrador), `raios` (a virada) e `cabeca` (o ponto da cabeça de uma `B.pessoa`).
- Do exemplo do monitor: `monitorFrasco` (o monitor de frasco de vacina em 4 estágios, só cores da paleta) e `ondasDeCalor`.
- Do exemplo da hipoglicemia: `lousa`, `folhaProva` (o título e a questão entram por rótulo), `tremor` e `copo` (o copo de água com a colher de açúcar).

## Quanto o chat escreve
O tipo (o que não se reescreve) tem 25.149 caracteres em `film-3-moldes.js`, 4.612 em `peca.js` e 6.103 em `score.js`. O exemplo do monitor acrescenta 6.231 caracteres ao molde (3.740 no desenho); o da hipoglicemia, 9.701 (6.489 no desenho, com os quatro desenhos novos acima, que com a biblioteca deixam de ser escritos).

## Limites
- Pessoa deitada não existe na biblioteca (o Ch.person não tem a pose).
- A câmera que se afasta resolve cabeça embaixo de texto, mas painel com texto demais fica com a cena pequena: o limite de palavras existe por isso.
- `cheio: true` (enche o painel, cortando as sobras) não tem o cuidado com as cabeças: só para painel sem texto.
- Gente com a mão na mesa ou segurando coisa: o Ch.person põe a mão por gesto (`gesture`), não por alvo livre no molde.
- O texto dos exemplos foi escrito pelo Opus e não é amostra da voz dele. Toda frase com fato sai da tabela de afirmações; afirmação sem trecho sai da peça.
