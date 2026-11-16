# PRESEME · motor do tipo "um dia, contado pela hora"

Um programa que já sabe fazer um tipo de reel: o de um dia comum contado pelo relógio, em que cada momento esconde algo que ninguém vê. Foi tirado do reel "Quantas vezes você usou o SUS hoje?" (sus-hoje). O chat 1 entrega só o conteúdo (as frases, a lista de momentos e o desenho do que é novo); o molde monta as cenas, os tempos, o contador, a lente, os cartões, a recontagem, a conta e o som.

Serve a outros assuntos do mesmo jeito. Exemplos de uso: "quantas vezes a atenção primária cuidou de você nesta semana", "o que a vigilância fez por você no almoço", "um plantão contado pela hora".

## O reel que ele dá

| cena | o que aparece | de onde vem |
|---|---|---|
| abertura | a pergunta grande, o protagonista entra, o contador em 0; a resposta num balão ("Nenhuma."); a tese, e a lente pequena aparece | as frases de `ABERTURA` |
| um momento por hora do dia | a hora no canto, o objeto do dia, a lente que pousa e mostra o que ninguém vê, o contador que vira, a frase da vez com marca-texto; a 2.ª frase em diante, de perto; a frase que dá o nome da categoria vira um cartão escuro de tela cheia com os selos; depois do nome, a faixa da categoria com um selo por momento | `MOMENTOS` e o `film-2-peca.js` |
| recontagem | uma fileira por categoria, com os selos e o número; a fileira do zero (o que não aconteceu); o resultado, com o contador grande e todos os selos | `RECONTAGEM` (os números saem da lista de momentos) |
| fecho | a tese de novo, o protagonista sorrindo, o contador cheio e a lente com o visto | `FECHO` |

Tempos: cada frase fica na tela o tempo de ler (2,17 palavras por segundo + 0,5 s, no mínimo 4 batidas) e toda cena acaba no fim de um compasso, para o corte cair junto com a música. Mudou o texto, o tempo se ajusta sozinho.

Som: a música troca de clima nas partes do dia (manhã, tarde, noite) e no resultado, sempre num corte; a parte do dia sai da hora de cada momento. Há os efeitos de cada cena (a lente pousa, o nome soa, as fileiras batem, o resultado), o lugar e as coisas que o momento pedir, e silêncio antes da tese do fecho.

Estilo: o do kit (`ESTILO` no score.js). O padrão do tipo é lápis no papel, o acabamento que levou positivo dele no sus-hoje.

## O que é do molde e o que a peça preenche

| do molde (não muda; o chat só copia) | da peça (o chat 1 escreve) |
|---|---|
| `index.html`, `film-1-molde.js`, `film-3-filme.js`, `peca.js` (a conferência da conta), `ferramentas/dia-mapa.js` (escreve o mapa-do-som) e o `score.js` fora do bloco PREENCHER | `textos.txt`, o bloco PREENCHER do `score.js`, o `film-2-peca.js`, o `peca.json` e a `legenda.txt` |

O que se troca está marcado com TROQUE nos arquivos de `molde/`.

## O que o chat 1 preenche

1. **`textos.txt`**: as frases ([01], [02]...) e as palavras de dentro do desenho ([D01]...): o rótulo do contador, a hora de cada momento, a etiqueta de cada categoria e o que a lente mostra.
2. **O bloco PREENCHER do `score.js`**: o estilo, as categorias, a abertura, a recontagem, o fecho, o clima de cada parte do dia e a lista de momentos, uma linha por momento. Exemplo de linha:
   ```js
   { id: 'remedio', hora: 'D04', frases: [9, 10, 11, 12], cat: 'san', selo: 'remedio', nome: 11 },
   ```
   Quer dizer: o momento das 07h00 (palavra [D04]); quatro frases (a 1.ª de longe, as outras de perto); conta para a categoria `san`; o selo é a caixinha de remédio; a frase [11] dá o nome da categoria (cartão escuro). Opcional: `lugar: 'cidade'` (o som do lugar) e `coisas: [{ som: 'mosquito', em: '[17]', dur: 2.5, pan: [-0.9, 0.9], vol: 0.9, abaixa: 12 }]` (até duas).
   Selos prontos: gota, pao, remedio, vacina, gotinha, mapa, rotulo, sal, salgadinho, casa, check e numero (o número do momento, sem desenho).
3. **`film-2-peca.js`**: o trecho com marca-texto de cada frase (`DIA.DESTAQUE`), a quebra do título (opcional) e, de cada momento, o objeto do dia (`DIA.CENA[id]`) e o centro da lente (`DIA.LENTE[id]`). Há atalhos prontos: `DIA.OBJ.pacote`, `DIA.OBJ.caixa`, e dentro da lente `DIA.DENTRO.lista` e `DIA.DENTRO.palavra`. Momento sem desenho também sai (o chão e a lente com o número do momento).
4. **`peca.json`** (nome, título, capa `@abertura`) e **`legenda.txt`**.

A conta não se escreve: o número de cada fileira, o total e o contador saem da lista de momentos. O motor confere no comando `textos` se as frases da recontagem dizem o mesmo (`CONTA OK: 5 + 3 + 1 = 9`); se não disserem, aponta a frase e o número certo.

## A cor de desenho novo

A cor de um desenho da peça depende de onde ele fica, porque na lousa (giz) o fundo é Floresta e um traço Floresta some:

- **Sobre o fundo** (o contorno de um objeto no chão, uma linha, uma seta): `DIA.TINTA`, a tinta do estilo (Floresta nos estilos claros, Papel na lousa). A letra sobre o fundo sai da cor padrão do `DIA.txt` (`E.cor('texto')`), sem passar `color`.
- **Por cima de uma cor clara** (papel, branco, marca-texto, Sálvia): `DIA.INK`, o Floresta, em todo estilo.
- **Letra por cima de uma cor qualquer**: `DIA.sobre(cor)`, que dá Floresta sobre cor clara, Papel sobre cor escura e Noite sobre Coral. Exemplo: `DIA.txt(ctx, 'VACINA', x, y, { color: DIA.sobre(C.coral) })`.
- **Dentro da lente** (o vidro é escuro em todo estilo): Papel e marca-texto, como no `DIA.DENTRO`.
- **A paleta pelo nome** (`DIA.C.coral`, `DIA.C.folha`...) fica para o que é sempre daquela cor: o recheio de um objeto, uma roupa, um selo.

Antes de mandar a parada 2, a folha `estilos @<momento> lapis,giz,chapado` mostra se algum traço sumiu.

## Os comandos, na ordem

De dentro da pasta da peça, com `M=<ig-midia>/preseme/reel/motor/preseme.js`:

```
node $M novo <nome> --de <esta pasta>/molde   # monta a peça (engine, kit de estilos e arquivos do molde) e já roda o textos
# o chat 1 preenche: textos.txt, PREENCHER do score.js, film-2-peca.js, peca.json, legenda.txt
node $M textos                                # lê o textos.txt; CONTA OK, duração e leitura
node ferramentas/dia-mapa.js                  # escreve o mapa-do-som.json (de novo sempre que mudar momento, hora ou SOM)
node $M quadros                               # folha de quadros, um por momento
node $M estilos @<momento> lapis,carimbo,chapado   # a parada 2: o quadro principal em três estilos
node $M folha-textos                          # um quadro por frase, com ela inteira na tela (para ele conferir)
node $M som                                   # a música por blocos, os lugares, as coisas e o silêncio
node $M rascunho                              # vídeo em meia resolução, com som (em segundo plano)
node $M conferir --rascunho                   # tudo o que se mede
node $M trecho <de> <até>                     # ajuste depois de pronto: refaz só o pedaço
node $M definitivo                            # o vídeo final (em segundo plano)
node $M capa @abertura                        # a capa e o recorte da grade
node $M entregar                              # confere os arquivos e escreve a mensagem para ele
```

Na máquina do Claude, o rascunho e o definitivo rodam dentro de `flock /home/claude/trabalho/render.lock -c '<comando>'`.

## O exemplo: o sus-hoje da versão 5, como lista de momentos

`exemplo-sus-hoje/`: o mesmo texto da versão 5 (as 32 frases, sem mudar nenhuma), 9 momentos e 3 categorias. Deu a mesma história com os mesmos números: 163,74 s, 12 cenas, andamento 107, CONTA OK 5 + 3 + 1 = 9. Os números da conferência estão no relatório.

Para refazer: `node $M novo sus-hoje --de exemplo-sus-hoje`, depois `node ferramentas/dia-mapa.js` e os comandos acima.

Quanto a peça precisou escrever além do molde: o bloco PREENCHER (2,8 mil caracteres), o desenho dos 9 objetos e do que cada lente mostra (22,5 mil), o textos.txt (2,8 mil), o peca.json e a legenda (1,2 mil): 29,3 mil caracteres, contra 58,6 mil da versão 5 inteira. Quase todo o resto é desenho próprio do assunto; uma peça que use os objetos prontos do molde escreve bem menos (o modelo de `molde/`, com 3 momentos, tem uns 7 mil).

## Limites

- O molde (o contador, a lente, a hora, os cartões, os selos, a faixa e os objetos prontos) desenha o que fica sobre o fundo com a tinta do kit, e sai certo também no giz. Os desenhos da peça de exemplo (o sus-hoje) ainda usam as cores da paleta escritas à mão: nos estilos de fundo claro (lápis, carimbo, chapado) ficam certos, conferidos com 0 problemas no qa dos três; no giz, o traço Floresta deles some no fundo. Peça nova segue a regra abaixo e sai em qualquer estilo.
- O peso da letra vem do estilo: nos dizeres impressos nos objetos, o `weight` que o sus-hoje usava não vale mais.
- O pixel e a planta não foram testados neste tipo.
- O texto do exemplo é o da versão 5 do sus-hoje, que ele aprovou; a peça de verdade está no chat dela.
