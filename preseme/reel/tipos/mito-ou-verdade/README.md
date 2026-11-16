# Motor "Mito ou verdade"

> O exemplo desta pasta (exemplo-pressao): texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.

Um reel em que três frases que todo mundo repete passam pelo selo. A pessoa diz a frase num balão, a música para, o selo bate (MITO, VERDADE ou DEPENDE) e, logo depois, o desenho mostra o porquê funcionando. No fim, uma frase junta as três numa regra só. Veredito sem porquê é a peça rasa que ele já reprovou: aqui o porquê é metade do vídeo.

Roda no motor de reels do PRESEME (`/home/claude/ig-midia/preseme/reel/motor/preseme.js`), com o kit de estilos. Nada do motor nem do kit foi mudado.

## Que reel ele dá

Cena por cena (o molde vazio dá 1min17; o exemplo da pressão, 1min53):

1. Abertura: o título promete ("Três frases sobre pressão que você vai ouvir na visita. Duas são mito."), a pessoa entra andando e estala um balão de reticências.
2. Para cada uma das três frases:
   - o balão com a frase, entre aspas, dita pela pessoa, agora em plano médio (um pouco maior que na abertura: a entrada da frase é um corte);
   - 0,6 s de silêncio e o selo bate na borda do balão, com um tremor; o resto da frase do veredito sai à mão embaixo do selo ("pela diretriz de 2025");
   - a pessoa reage (MITO: mão na testa; VERDADE: joinha; DEPENDE: pensa);
   - a cena do porquê: o desenho se constrói enquanto as frases do porquê entram embaixo, com um selo pequeno no canto lembrando o veredito; a cada frase, a câmera corta para o plano dela (de perto no que a frase explica, ou o desenho inteiro) e a frase de baixo troca seca, no mesmo quadro.
3. Fecho: a regra que junta as três, em título, e a fileira dos três selos, cada um com o resumo da sua frase.

O que fica igual em toda peça: o rótulo "Mito ou verdade?" no alto, o trilho de três anéis no canto (o da vez acende; depois do selo, mostra a inicial do veredito), o balão, o selo e as cores dele (MITO coral, VERDADE verde-folha, DEPENDE tinta), os tempos, as passagens e os efeitos de som (estalo na entrada, baque no selo, lápis no porquê). O estilo padrão é o chapado (nenhum outro motor o usa como padrão); a peça sai em qualquer estilo do kit trocando uma palavra.

## O que o chat 1 preenche

| Arquivo | O que vai nele |
|---|---|
| `textos.txt` | as frases da tela, numeradas: [01] abertura; para cada frase, a do balão (entre aspas), a do selo (começa com Mito, Verdade ou Depende) e as do porquê (2 ou 3); por último, o fecho. E as palavras do desenho: D01 é o rótulo, D02 a D04 os resumos do fecho, D05 em diante as do porquê |
| `score.js`, só o bloco PREENCHER | que número é cada frase (`ITENS`: frase, veredito e porquê), `ABERTURA`, `FECHO`, `ESTILO` e `BPM` |
| `film-2-peca.js` | `DESTAQUE` (o trecho com marca-texto), `FALANTE` (moradora, agente ou calouro), `RESUMO`, os três desenhos do porquê (`PORQUE[1]`, `[2]` e `[3]`), só com o kit, e os `PLANOS` (o enquadramento de cada frase do porquê, com corte seco: um ponto focal e um corte por frase) |
| `mapa-do-som.json` | o clima da música em cada bloco, os sons de coisas e o silêncio antes de cada selo |
| `peca.json` | nome, título e as cores de gente (pele, cabelo) |
| `legenda.txt` | a legenda, com as fontes |

Exemplo de linha, a frase do selo da primeira frase do exemplo:

```
[03] Mito, pela diretriz de 2025.
```

A primeira palavra vira o selo; "pela diretriz de 2025" sai à mão embaixo dele.

## Os comandos, do novo ao entregar

```
M=/home/claude/ig-midia/preseme/reel/motor/preseme.js
node $M novo /home/claude/trabalho/<nome> --de <esta-pasta>/molde
cd /home/claude/trabalho/<nome>
# o chat 1 preenche os arquivos da tabela acima
node $M textos                                    # confere selo, conta e tempo de leitura
node $M quadros                                   # folha de quadros: abrir com Read
node $M folha-textos                              # folha de textos (vai para ele)
node $M estilos @principal chapado,carimbo,giz    # parada 2: o mesmo quadro em três estilos, o padrão em A
node $M som                                       # a música pelo mapa-do-som.json
flock /home/claude/trabalho/render.lock -c "node $M rascunho"     # em segundo plano
node $M conferir --rascunho
flock /home/claude/trabalho/render.lock -c "node $M definitivo"   # em segundo plano
node $M capa
node $M conferir
node $M entregar
```

Para partir do exemplo em vez do molde vazio: `--de <esta-pasta>/exemplo-pressao`.

## O que o motor confere sozinho (peca.js do tipo)

Trava, e nada segue:
- a frase do selo não começa com Mito, Verdade ou Depende;
- a abertura ou o fecho têm mais de uma frase (o molde desenha uma só, como título);
- a abertura diz quantas são mito ("Duas são mito.") e a conta dos selos não bate.

Avisa: selo sem silêncio antes dele no mapa do som; frase do balão sem aspas.

## Cuidados de quem escreve

- As três frases são ditas de verdade na visita, no consultório ou na roda (teste da premissa): cada uma é testada contra a promessa da abertura.
- O porquê é desenho que funciona, não frase solta: se tirar o desenho e sobrar o mesmo conteúdo, a peça volta.
- Um plano por frase do porquê, alternando perto e inteiro: sem corte, o conferir avisa trecho acima de 12 s (o corte só conta se mudar 12% da imagem; desenho de traço fino muda pouco, e a frase que troca seca ajuda). No plano de perto, o que fica fora não se desenha: senão aparece um pedaço na borda e, se for texto, o qa do conferir acusa texto fora da área segura, mesmo escondido pelo recorte.
- O resto do veredito é curto (até duas linhas embaixo do selo).
- Rótulo de desenho com letra 36 ou maior, para ler no celular.
- Do jeito dele: vírgula, não dois-pontos, para apresentar algo; nada de aula, módulo ou cronograma; sem apelo no fim; sem o nome do perfil.

## O que está nesta pasta

- `molde/`: os arquivos do tipo. `film-1-molde.js`, `film-3-filme.js`, `index.html` e `peca.js` não mudam de peça para peça; os outros são o ponto de partida que o chat 1 preenche (o desenho provisório põe um cartão por frase do porquê, para o vídeo rodar inteiro desde o primeiro dia).
- `exemplo-pressao/`: uma peça inteira sobre pressão, com o banco claude/preseme-fatos-aferir-pressao.md, sem a tabela dos estágios. Texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.
- `tabela-de-afirmacoes-pressao.md`: cada frase do exemplo com o trecho e a fonte. Duas pedem conferência: [04] (a leitura 12 por 8 = 120 por 80, sem trecho) e [15] (o número 192).

## Observação sobre o motor (não mudado)

O `som` ignora o `pan` da sirene: ela já anda sozinha da esquerda para a direita. Na peça, escreva `"pan": [-0.8, 0.8]` para o relatório bater com o que se ouve.
