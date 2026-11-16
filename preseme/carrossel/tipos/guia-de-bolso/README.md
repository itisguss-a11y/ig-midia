# Carrossel · tipo guia de bolso

Texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.

Feito pela frente R1 na madrugada de 16/11/2026, no motor do reel (`preseme/reel/motor`, carrossel 4:5, 1080 × 1350).

## O que o tipo faz
O carrossel para salvar e abrir na hora. Ensina um procedimento da visita com o ACS, passo a passo, cada passo com o desenho do gesto e o porquê. Depois vêm o erro comum, o que é da equipe e quando chamar o 192, e a última lâmina é um cartão-resumo para print, com o recorte tracejado. O estilo padrão é a planta técnica.

Tipos de lâmina (em `film-2-moldes.js`):
- `capa`
- `conceito` (o número, com o desenho embaixo)
- `sinais` (até 6 ícones)
- `passo` (a trilha dos passos fica embaixo)
- `opcoes` (até 4)
- `erro`
- `equipe`
- `urgencia` (a única lâmina escura)
- `resumo`
- `texto`

## O que fica em cada pasta
- `molde/`: o tipo inteiro, pronto para montar uma peça.
  - Arquivos fixos: `index.html`, `film-1-base.js`, `film-2-moldes.js` e `film-9-filme.js`. O `film-2-moldes.js` traz os moldes de lâmina e o kit do guia:
    - as cenas prontas `visita`, `espera`, `equipe`, `telefone` e `troque` (o tracejado do lugar vazio);
    - as peças pequenas copo, relógio, cadeira, rosto, gota e lupa, em `PRESEME.KIT`.
  - O que se troca vem marcado com TROQUE: `textos.txt`, `score.js` (`ROTEIRO` e `DESTAQUE`), `film-3-desenhos.js` (os desenhos do assunto), `alt.txt` e `legenda.txt`.
- `exemplo-glicemia/`: só os arquivos da peça de exemplo (glicose baixa na visita). Vão por cima do molde.
- `tabela-de-afirmacoes-glicemia.md` e `legenda-glicemia.txt`: a conferência dos fatos e a legenda do exemplo.
- `folhas/`: as 12 lâminas do exemplo e a capa em três estilos (planta, giz e carimbo).

## O que o chat 1 preenche numa peça nova
1. `textos.txt`: as frases [01]… e as palavras do desenho [D01]…. Em cada lâmina, a primeira D é a etiqueta.
2. `score.js`: o `ROTEIRO` e o `DESTAQUE`. O `ROTEIRO` diz a ordem, o tipo e o desenho de cada lâmina; o tipo `passo` se repete quantas vezes o procedimento pedir.
3. `film-3-desenhos.js`: só os desenhos que o assunto pede. As cenas do kit já servem a qualquer guia.
4. `alt.txt`, uma linha por lâmina.
5. `legenda.txt`: um pedido só (salvar), as fontes e até 5 hashtags.

## Os comandos
```
M=<ig-midia>/preseme/reel/motor/preseme.js
node $M novo <pasta> --de <este>/molde        # monta a peça
cp -r <este>/exemplo-glicemia/. <pasta>/     # só para ver o exemplo
cd <pasta> && node $M textos && node $M laminas && node $M conferir
node $M estilos @l01 planta,giz,carimbo       # a capa em três estilos
```
Carrossel não precisa da trava de render: as 12 lâminas saem em 5 a 12 segundos.

## Medido
- A conferência do exemplo deu 12 lâminas, nenhum erro e nenhum aviso: qa 0, nenhuma cor fora da paleta e o contador livre.
- O molde vazio monta 10 lâminas, também sem erro.
- O molde mais o exemplo dão a mesma folha que a peça de trabalho, sem um pixel de diferença.
- O exemplo escreveu 18.246 caracteres além do molde: 12.921 de desenhos do assunto e 5.325 de texto (textos, score, alt, legenda e peça).

## O que falta no exemplo
Está na tabela: o que é aplicação ou leitura do Opus vai marcado "a conferir". São quatro pontos:
- o "acordada e engolindo";
- o chocolate e a bolacha;
- o "avise o ACS";
- "não melhora depois de repetir", que vem de "episódios se mantiverem".

Ficaram fora da tela, de propósito:
- o açúcar na bochecha de quem está desacordado (sem trecho);
- o glucagon;
- a técnica da glicemia capilar;
- quem mede (só quem foi treinado, com o aparelho da equipe).
