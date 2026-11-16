# Carrossel · tipo tabela comparativa

Texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.

Feito na madrugada de 16/11/2026 pela frente Y2 (o molde) e terminado pela Y2b (o exemplo, as provas e esta pasta), no motor do reel (`preseme/reel/motor`, carrossel 4:5, 1080 × 1350).

## O que o tipo faz
De 3 a 4 coisas parecidas comparadas em 4 a 6 linhas: o formato de estudo para a prova. Exemplo: malária, leishmaniose e oncocercose, uma coluna cada; linhas "quem passa", "pega de pessoa para pessoa?", "o que se vê", "onde mais pega", "como se trata", "como se previne".

As lâminas saem sozinhas da tabela escrita no `score.js`, nesta ordem:
1. **capa:** a pergunta ("Malária, leishmaniose e oncocercose: o que muda?"), a frase de baixo e um cartão por coluna, com o desenho e o nome;
2. **uma lâmina por linha:** o nome da linha no alto, o que reparar numa frase, a célula de cada coluna com o desenho pequeno e, no canto, a tabela pequena com a linha da vez acesa (quem arrasta sabe onde está);
3. **a tabela inteira para print:** as colunas no alto, uma faixa por linha e as fontes no pé;
4. **o fecho, em fundo escuro:** o que as colunas têm em comum e o que é da equipe, com as fontes.

É diferente do "X não é Y" (duas coisas, com um caso que separa) e do guia de bolso (passos de um procedimento): aqui é a grade.

**Estilo padrão: planta técnica ★** (a grade do papel milimetrado já é uma tabela). O exemplo passou no `conferir` sem erro também em chapado, carimbo, giz e lápis. **O pixel não serve a este tipo:** a letra larga não cabe nas células da tabela inteira (5 textos de fora no teste); o `peca.js` avisa quando o `ESTILO` é pixel.

## O que o chat 1 preenche
No `score.js`, só a parte marcada TROQUE:
- `COLUNAS` (de 3 a 4): `id` (o nome do desenho da coluna no film-3) e `nome` (a palavra D com o nome).
- `LINHAS` (de 4 a 6), na ordem das lâminas: `id` (uma palavra), `nome` (a palavra D com a pergunta da linha), `frase` (o número da frase "o que reparar") e `celulas` (uma palavra D por coluna, na ordem das colunas). Célula sem trecho de fonte leva "—" no textos.txt.
- `CAPA`, `INTEIRA` (rótulo e fontes da tabela inteira), `FECHO` (rótulo, até 2 frases do que é comum, rótulo e até 2 frases da equipe, fontes) e `DESTAQUE`.

Exemplo, do exemplo desta pasta:
```
{ id: 'inseto', nome: 'D05', frase: 3, celulas: ['D06', 'D07', 'D08'] },
```
```
[03] Cada uma tem o seu inseto, e as três passam pela picada.
[D05] Quem passa
[D06] a fêmea do mosquito Anopheles
[D07] flebotomíneo (mosquito-palha)
[D08] o borrachudo, ou pium
```

No `film-3-desenhos.js`: o desenho de cada coluna (`PRESEME.DESENHO.coluna[id]`), e, se quiser, o de cada célula (`PRESEME.DESENHO.celula[id da linha][i]`; sem ele, vale o da coluna) e o do fecho (`DESENHO.cena.equipe`). Primeiro a biblioteca (`B.mosquito`, `B.termometro`, `B.mapaRR`, `B.calendario`, `B.prancheta`...); o que ela não tem vai em `PRESEME.NOVOS`. Também: `alt.txt`, `legenda.txt` e `peca.json` (título e cores de gente).

Célula: até 6 palavras sai na letra maior; 7 e 8, em letra menor na tabela inteira (aviso); mais de 8 trava. Palavra com hífen que sozinha não cabe na célula quebra depois do hífen ("(mosquito-" / "palha)").

## O que o motor confere sozinho (peca.js, no comando textos)
Trava: menos de 3 ou mais de 4 colunas; menos de 4 ou mais de 6 linhas; id de linha repetido, vazio, com espaço ou igual ao de uma lâmina fixa (capa, tabela, comum, texto); coluna ou linha sem nome; linha com número de células diferente do de colunas; célula vazia (sem fonte, "—"); célula com mais de 8 palavras; a tabela inteira que não bate com as lâminas (capa fora do lugar, lâmina de linha faltando ou fora de ordem, tabela inteira faltando, repetida ou antes da última linha).
Avisa: célula com "—"; linha sem a frase do que reparar; nome de linha com mais de 30 letras; célula com 7 ou 8 palavras; tabela inteira sem fontes; falta o fecho; `ESTILO` pixel.
O `conferir` do motor faz o resto: qa, cores, texto que não coube, contador do Instagram, grade 3:4, texto alternativo e legenda; a faixa de lâminas do tipo é de 6 a 10 (`LAMINAS_MIN` e `LAMINAS_MAX`).

## Os comandos
```
M=/home/claude/ig-midia/preseme/reel/motor/preseme.js
node $M novo /home/claude/trabalho/<nome> --de <esta-pasta>/molde        # a peça nova (o novo copia o kit e a biblioteca)
node $M novo /home/claude/trabalho/<nome> --de <esta-pasta>/exemplo-malaria-leishmaniose-oncocercose   # o exemplo (o molde vizinho vai por baixo)
cd /home/claude/trabalho/<nome>
node $M textos
node $M laminas                       # ou: laminas --estilo chapado
node $M estilos @l02 planta,chapado,carimbo     # a folha da parada 2 (@l08 = a tabela inteira, no exemplo)
node $M conferir
node $M capa
node $M entregar
```
Marcadores: `@l01` a `@lNN` (um por lâmina), `@capa`, `@tabela` e `@comum`.

## O exemplo
"Malária, leishmaniose e oncocercose: o que muda?": 9 lâminas, 3 colunas × 6 linhas, 17 de 18 células com fonte. A célula "pega de pessoa para pessoa?" da oncocercose fica "—" de propósito: a página do Ministério da Saúde não fala disso, e a tabela só escreve o que a fonte diz (a legenda explica). Todos os fatos saíram de bancos que já existiam no projeto (malária, leishmaniose tegumentar, leishmaniose caso e dado, oncocercose); não houve leitura nova. A tabela de afirmações diz de onde vem cada célula.

Tamanho: o molde tem 44.281 caracteres; o exemplo escreveu 16.048 além dele. Desses, 9.704 são desenhos novos que a biblioteca ainda não tem; com eles na biblioteca, o exemplo cairia para uns 6 mil.

## Candidatos à biblioteca (em PRESEME.NOVOS, no film-3 do exemplo)
O flebotomíneo, a cama com mosquiteiro, a janela com tela e a roupa comprida (os quatro vindos do carrossel "caso, arraste para a resposta"), o borrachudo (do "mapa e dado"), a ferida, o olho, o busto, o "não passa de pessoa para pessoa" (dois bustos e a seta riscada), a cartela de comprimidos sem rótulo, a área inteira tratada (cinco bustos com o visto) e o "evite o inseto" (o inseto no anel de proibido Coral).

## Achados
- Motor: `novo <pasta> --forca` numa pasta que já tem `engine/` para no new-project do animation-studio e não copia nada (os arquivos velhos ficam). Monte numa pasta nova.
- Nada mudou no motor nem na biblioteca.
