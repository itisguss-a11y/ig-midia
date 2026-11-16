# Carrossel · tipo mapa e dado

Texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.

Feito pela frente R1 na madrugada de 16/11/2026, no motor do reel (`preseme/reel/motor`, carrossel 4:5, 1080 × 1350).

## O que o tipo faz
Põe uma doença, ou um número de Roraima, no mapa. Mostra o número oficial ao lado do Brasil e diz por que a doença é daqui, pelo vetor e pelo lugar, nunca pelas pessoas. Também mostra como se previne e quem notifica, e fecha com o cartão-resumo. O estilo padrão é o infográfico chapado.

Tipos de lâmina (em `film-2-moldes.js`):
- `capa`, com o mapa e o alfinete
- `numero`, dois cartões, o claro e o escuro
- `mapa`
- `porque`
- `sinais`, dois cartões
- `prevencao`, até 3 cartões
- `grafico`: as barras saem dos valores escritos no textos.txt
- `notifica`, com a ficha e as linhas quem, quando e onde
- `fase`, o caminho até a meta
- `resumo`
- `texto`

## O que fica em cada pasta
- `molde/`: o tipo inteiro, pronto para montar uma peça.
  - Arquivos fixos:
    - `index.html` e `film-1-base.js`;
    - `film-2-moldes.js`: os moldes de lâmina, o mapa, o `troque` (o tracejado do lugar vazio) e o kit em `PRESEME.KIT` (`pilulaEm`, `alfinete`, `projetor`);
    - `film-9-filme.js`, que carrega os mapas;
    - `assets/rr.json`, os 15 municípios de Roraima, do IBGE.
  - O que se troca vem marcado com TROQUE: `textos.txt`, `score.js`, `film-3-desenhos.js`, `alt.txt` e `legenda.txt`. No `score.js` entram `MAPAS`, `MAPA`, `ROTEIRO` e `DESTAQUE`.
- `exemplo-oncocercose/`: só os arquivos da peça de exemplo (a cegueira dos rios), com `assets/yanomami.json`. Vão por cima do molde.
- `tabela-de-afirmacoes-oncocercose.md` e `legenda-oncocercose.txt`: a conferência dos fatos e a legenda do exemplo.
- `ferramentas/area-do-gpkg.py`: tira o contorno de uma terra indígena de Roraima do `ti.gpkg` (do geobr). Foi assim que saiu o `yanomami.json`.
- `folhas/`: as 9 lâminas do exemplo e a capa em três estilos (chapado, planta e giz).

## O que o chat 1 preenche numa peça nova
1. `textos.txt`: as frases [01]… e as palavras do desenho [D01]…. Em cada lâmina, a primeira D é a etiqueta.
2. `score.js`, em quatro partes:
   - `MAPAS`: o mapa de base e, se houver, a área marcada (`assets/<area>.json`);
   - `MAPA`: o recorte em longitude e latitude, onde vai cada rótulo, o alfinete da capa e os municípios a marcar em Coral;
   - o `ROTEIRO`;
   - o `DESTAQUE`.

   Doença sem fonte de quem notifica: a lâmina `notifica` sai do `ROTEIRO`.
3. `film-3-desenhos.js`: os desenhos da doença, um para o porquê, um por sinal e um por medida de prevenção.
4. `alt.txt` e `legenda.txt`.

## Os comandos
```
M=<ig-midia>/preseme/reel/motor/preseme.js
node $M novo <pasta> --de <este>/molde            # monta a peça
cp -r <este>/exemplo-oncocercose/. <pasta>/      # só para ver o exemplo
cd <pasta> && node $M textos && node $M laminas && node $M conferir
node $M estilos @l01 chapado,planta,giz           # a capa em três estilos
python3 -I <este>/ferramentas/area-do-gpkg.py ~/.cache/preseme-pixel/dados/ti.gpkg Yanomami assets/yanomami.json
```
Carrossel não precisa da trava de render: as 9 lâminas saem em 4 a 9 segundos.

## Medido
- A conferência do exemplo deu 9 lâminas, nenhum erro e nenhum aviso: qa 0, o contador livre e a cor de pele declarada no `peca.json`.
- O molde vazio monta 10 lâminas, também sem erro.
- O molde mais o exemplo dão a mesma folha que a peça de trabalho, sem um pixel de diferença.
- O exemplo escreveu 14.562 caracteres além do molde: 9.284 de desenhos da doença e 5.278 de texto (textos, score, alt, legenda e peça). Fora isso, 7 KB do contorno da terra indígena, gerados pelo script.

## O que falta no exemplo
Quem notifica a oncocercose não tem fonte aberta, então a lâmina `notifica` ficou de fora.

Na tabela, vão marcados "a conferir":
- "o tratamento continua", que é leitura do Opus;
- a frase inteira dos 85%;
- "quem tinha o verme", que é a glosa da prevalência;
- os pedaços de frase da OPAS.

Ficaram fora, de propósito:
- "mal do garimpeiro";
- o nome e a dose do remédio;
- desenho de pessoas indígenas.
