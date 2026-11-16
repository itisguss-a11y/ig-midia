# Carrossel · tipo caso, arraste para a resposta

Texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.

Feito pela frente U3 na madrugada de 16/11/2026, no motor do reel (`preseme/reel/motor`, carrossel 4:5, 1080 × 1350), com o kit de estilos e a biblioteca de desenhos, sem mexer em nenhum dos três. É o primo em carrossel do reel `caso-com-escolha`: as mesmas cores de selo e a mesma regra do veredito.

## O que o tipo faz
Um caso da visita ou da UBS vira um teste que se resolve arrastando. A capa é o caso: a pessoa, onde ela está e a ficha com as pistas. A 2ª lâmina faz a pergunta ("O que você faz?", "O que é?" ou "O que falta?") com as opções A, B e C, e uma seta na borda direita puxa o deslize ("arraste para a resposta"; é a seta do estilo da vez, sem imitar o Instagram). A resposta só aparece depois de arrastar: a letra certa e um selo em cada opção (CERTA, ERRADA ou PODE SER). Depois vêm o porquê desenhado de cada opção (uma lâmina por opção ou por ideia), o dado de Roraima (só com fonte oficial), o que a equipe faz na atenção primária, a prevenção e o cartão-resumo para salvar, com o tracejado de recortar.

O estilo padrão é o infográfico chapado: na folha de três estilos da capa (chapado ★, giz e pixel), ele leu melhor os cartões, os selos e as colunas do dado, e não repete o giz do reel caso com escolha. As 10 lâminas do exemplo saem nos seis estilos sem texto apagado e sem texto que não cabe.

Tipos de lâmina (em `film-2-moldes.js`):
- `caso` (a capa): [o caso], [a frase de baixo] + D rótulo e as pistas da ficha (D)
- `pergunta`: [a pergunta] e as opções (`OPCOES` no score.js) + D rótulo, D arraste
- `resposta`: [a resposta, com a letra], [o termo explicado] + D rótulo; os cartões com os selos
- `porque`: [o veredito explicado], [a frase de baixo] + os rótulos do desenho; no `ROTEIRO`, `opcao: 'A'`
- `dado`: [o fato], [o que ele quer dizer] + D rótulo, D fonte e os pares D nome, D número (colunas; a mais alta no destaque, ou a de `realce`)
- `lista` (atenção primária e prevenção): [a frase] + D rótulo e de 2 a 6 itens, cada um num cartão com o desenho dele
- `resumo`: de 2 a 4 frases + D rótulo e D fontes (cartão escuro)
- `texto`: a lâmina simples, para o que não cabe nos outros

O veredito de cada opção sai da primeira frase do primeiro porquê dela, que começa com Certa, Errada ou Pode ser (como no reel). O selo, o ✓ e as cores vêm daí.

## O que o motor confere sozinho (peca.js, no comando textos)
Trava quando: a capa não é o caso; não há uma pergunta e uma resposta; a resposta vem antes da pergunta; um porquê aparece antes da resposta; são menos de 2 ou mais de 4 opções; uma opção está vazia ou sem lâmina de porquê; o primeiro porquê de uma opção não começa com Certa, Errada ou Pode ser; a resposta diz a letra ("É a B") e os selos CERTA estão em outra; diz "qualquer uma" e há ERRADA; diz "nenhuma" e há selo que não é ERRADA. Os cinco casos de trava foram testados e param o `textos`.
Avisa quando: a pergunta não termina em "?"; uma opção passa de 5 palavras; a resposta não diz a letra; a peça tem menos de 7 ou mais de 10 lâminas; falta o resumo.

## O que fica em cada pasta
- `molde/`: o tipo inteiro, pronto para montar uma peça.
  - Fixos: `index.html`, `film-1-base.js` e `film-9-filme.js` (iguais aos do modelo de carrossel do motor), `film-2-moldes.js` (os moldes de lâmina e, em `PRESEME.KIT`, a ficha, os cartões, a letra, o selo, a marca, o risco de Coral, o "arraste" e a `mesmaLetra`, que deixa frases irmãs no mesmo tamanho) e `peca.js` (a conferência do tipo).
  - O que se troca vem marcado com TROQUE: `textos.txt`, `score.js` (`ROTEIRO`, `OPCOES` e `DESTAQUE`), `film-3-desenhos.js`, `alt.txt`, `legenda.txt` e `peca.json`.
- `exemplo-leishmaniose/`: só os arquivos da peça de exemplo ("a ferida que não fecha", leishmaniose tegumentar). Vão por cima do molde.
- `tabela-de-afirmacoes-leishmaniose.md` e `legenda-leishmaniose.txt`: a conferência dos fatos e a legenda do exemplo.

## O que o chat 1 preenche numa peça nova
1. `textos.txt`: o caso, a pergunta, as opções (curtas), a resposta com a letra, um porquê por opção (começando com Certa, Errada ou Pode ser), o dado, a atenção primária, a prevenção e o resumo; e as palavras do desenho (pistas, rótulos, colunas, itens, fontes).
2. `score.js`: o `ROTEIRO` (apague a lâmina do dado se não houver dado de fonte oficial), as `OPCOES` e o `DESTAQUE`.
3. `film-3-desenhos.js`: a capa (a pessoa do caso, na área à esquerda da ficha), um desenho por porquê e um ícone por item das listas. Use a biblioteca antes de desenhar à mão (`B.pessoa`, `B.lupa`, `B.ubsIcone`, `B.calendario`, `B.prancheta`...). O mito desenhado sai riscado com `PRESEME.KIT.risco`.
4. `alt.txt`, uma linha por lâmina, e `legenda.txt`: a primeira linha puxa para o caso sem dar a resposta; um pedido só (salvar); as fontes.

Uma linha do exemplo, para ver o jeito:
```
{ id: 'porqueB', tipo: 'porque', opcao: 'B', linhas: [11, 12, 'D11', 'D12', 'D13'] },
[11] Certa. A ferida começa como uma manchinha vermelha e vira uma ferida redonda ou oval.
```

## Os comandos
```
M=/home/claude/ig-midia/preseme/reel/motor/preseme.js
node $M novo <pasta> --de <este>/molde                # monta a peça (o novo copia o kit e a biblioteca)
cp -r <este>/exemplo-leishmaniose/. <pasta>/         # só para ver o exemplo
cd <pasta> && node $M textos && node $M laminas && node $M conferir
node $M estilos @l01 chapado,giz,pixel               # a capa em três estilos (parada 2)
node $M laminas --estilo giz                         # o carrossel inteiro em outro estilo
```
Carrossel não precisa da trava de render: as 10 lâminas saem em 3 a 18 segundos, conforme o estilo.

## Medido
- O exemplo: 10 lâminas; `conferir` sem erro e sem aviso (qa 0, nenhuma cor fora da paleta além da pele, que está no `cores` do peca.json; contador livre; grade 3:4; texto alternativo nas 10; legenda com 1.015 caracteres e 5 hashtags).
- O molde vazio monta as mesmas 10 lâminas, também sem erro na conferência.
- O molde mais o exemplo dão as 10 lâminas da peça de trabalho sem um pixel de diferença.
- O exemplo escreveu 25.451 caracteres além do molde (o molde inteiro tem 44.802): 14.957 de desenho e 10.494 de texto, roteiro, alt, legenda e peça. Dos de desenho, 7.250 são os desenhos novos que a biblioteca ainda não tem (abaixo); as cenas das lâminas são 5.692. Do score.js, só 954 caracteres mudam do molde para o exemplo.
- Nos seis estilos (chapado, giz, pixel, lápis, planta e carimbo), nenhum texto deixa de caber (no pixel, que tem a letra mais larga, quatro textos não cabiam: o molde ganhou letras menores nesses lugares).
- Folhas abertas com Read: a peça três vezes durante a montagem (a pessoa sentada por falta de `pose: 'stand'`, a calça escura sumindo no chão, a vassoura e a roupa sumindo no cartão), a final uma vez, a do molde vazio uma vez e a dos três estilos uma vez.

## Candidatos à biblioteca
Em `exemplo-leishmaniose/film-3-desenhos.js`, `PRESEME.NOVOS`: `flebotomineo` (o mosquito-palha, asas em V), `pele` e `ferida` (a manchinha e a ferida redonda, desenho de símbolo), `toalha`, `copo`, `pomada` (sem nome de remédio), `janelaTela`, `mosquiteiro`, `roupaComprida` e `vassoura`. Os de lista aceitam `cartao: true`, que escolhe a cor que não some em cima do cartão.

## O que falta no exemplo
Está na tabela: o que é leitura do Opus vai marcado "a conferir". Três pontos pedem o Fable: a frase [13] (a pomada) é raciocínio em cima do trecho do exame; "na UBS" da [17] é a ponte do Claude (o álbum diz "equipe de profissionais de saúde"); e a conta da [16] usa o quadro do relatório, que não bate com a "média de 350 casos por ano" do texto dele.
