# Carrossel · tipo macete para a prova

Texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.

Feito pela frente V2 na madrugada de 16/11/2026, no motor do reel (`preseme/reel/motor`, carrossel 4:5, 1080 × 1350), com o kit de estilos e a biblioteca de desenhos, sem mexer em nenhum dos três.

## O que o tipo faz
O carrossel que se salva para decorar. Ele pega uma lista que a prova cobra e a transforma num macete (letras, sigla ou frase que gruda). Em ordem:
1. **capa**: a pergunta que cai, como título, a promessa e as fichas do macete embaixo, como gancho;
2. **macete**: a resposta curta à pergunta da capa, uma linha por peça (a ficha com a letra grande e o nome, com a palavra da letra no destaque) e a frase que gruda;
3. **peça**: uma lâmina por letra, com a trilha das fichas em cima (a da vez no destaque), a ficha grande com o nome, o que significa em palavra simples, o desenho que explica e, no pé, o exemplo da vida real ("Na UBS: ...");
4. **pegadinha**: o selo carimbado, o que a prova confunde com o quê, o desenho que compara as duas coisas e o detalhe que desfaz a confusão;
5. **cartão**: o cartão para print, recortado (borda tracejada e tesoura), com uma linha por letra e a regra de uma linha no pé; a fonte fica fora do cartão.

O estilo padrão é o giz na lousa: o macete escrito no quadro, como no cursinho. Na folha de estilos do exemplo, giz, pixel e lápis se leem bem; o pixel ficou parecido com teclas de teclado e é a melhor segunda opção. O exemplo passou na conferência nos seis estilos.

## As lâminas saem do macete
O chat 1 não monta a lista de lâminas: ela sai sozinha do `MACETE`, no `score.js`. Cada peça do macete vira uma lâmina, e as fichas da capa, a lâmina do macete inteiro, a trilha e o cartão leem as letras e os nomes do mesmo lugar. Com 2 peças, o carrossel tem 6 lâminas; com 3, 7; com 7, 11.

Tipos de lâmina (em `film-2-moldes.js`): `capa`, `macete`, `peca`, `pegadinha`, `cartao` e `texto` (a lâmina sem tipo próprio).

Em `PRESEME.KIT`, as peças que servem a qualquer macete: `ficha` (o quadrado com a letra grande; `vez`, `apagada`, `sombra`), `palavraDaLetra` (acha a palavra do nome que começa com a letra), `tesoura`, `certo` e `errado`.

## O que fica em cada pasta
- `molde/`: o tipo inteiro, pronto para montar uma peça.
  - Fixos: `index.html`, `film-1-base.js`, `film-2-moldes.js`, `film-9-filme.js` e `peca.js` (a conferência do tipo, que roda no comando `textos`).
  - O que se troca vem marcado com TROQUE: `textos.txt`, o bloco PREENCHER do `score.js`, `film-3-desenhos.js`, `alt.txt`, `legenda.txt` e `peca.json`.
- `exemplo-principios-do-sus/`: só os arquivos da peça de exemplo ("Princípios do SUS: doutrinários ou organizativos?", o macete DIP). Vão por cima do molde.
- `tabela-de-afirmacoes-principios-do-sus.md` e `legenda-principios-do-sus.txt`: a conferência dos fatos e a legenda do exemplo.

## O que o chat 1 preenche numa peça nova
1. `textos.txt`: as frases [01]… e as palavras do desenho [D01]…. As letras e os nomes do macete são palavras D.
2. `score.js`, só o bloco PREENCHER:
   - `CAPA` (a pergunta, com "?", a promessa e a etiqueta) e `RESPOSTA` (a resposta curta, a frase que gruda e a fonte);
   - `MACETE`, de 2 a 7 peças, na ordem do macete; cada uma com `letra`, `nome`, `define`, `exemplo`, `cartao`, `desenho` e, se quiser, `palavras` (as D do desenho dela);
   - `PEGADINHA` (as duas frases, o selo, o desenho e as palavras dele; sem pegadinha de fonte, `null`), `CARTAO` (título, regra e fonte) e `DESTAQUE`.
3. `film-3-desenhos.js`: um desenho por peça e um para a pegadinha. Use a biblioteca (`const B = globalThis.BIB`) e o `PRESEME.KIT`.
4. `alt.txt` (uma linha por lâmina), `legenda.txt` (ensina o que a tela não coube, um pedido só e as fontes) e `peca.json` (título; em `cores`, as cores de gente dos desenhos).

Uma linha do exemplo, para ver o jeito:
```
{ letra: 'D04', nome: 'D07', define: 7, exemplo: 8, cartao: 14, desenho: 'prevencao', palavras: ['D15', 'D16'] },
```
com `[D04] I`, `[D07] Atendimento integral` e `[14] Atendimento integral: prevenção primeiro, sem largar o tratamento.`

## O que o tipo confere sozinho (peca.js, no comando textos)
Trava quando:
- o macete tem menos de 2 ou mais de 7 peças;
- uma peça está sem letra, sem nome ou sem definição;
- a letra tem mais de 3 letras;
- falta a lâmina de uma peça, ou elas saem fora da ordem;
- falta o cartão para print, ou ele não é a última lâmina;
- uma linha do cartão falta ou não começa pelo nome da peça dela (o cartão que não bate com as lâminas).

Avisa quando: a capa não termina em "?"; a letra não aparece no nome; falta o exemplo ou o desenho de uma peça; a lâmina 2 não é o macete inteiro; não há pegadinha; o cartão está sem regra ou sem fonte; o carrossel sai com menos de 6 ou mais de 10 lâminas.

Testado: o exemplo passa; macete com 8 peças, letra sem definição, linha do cartão trocada, letra "DESC" e carrossel sem cartão travam.

## Os comandos
```
M=<ig-midia>/preseme/reel/motor/preseme.js
node $M novo <pasta> --de <este>/molde                     # monta a peça (o novo copia o kit e a biblioteca)
cp <este>/exemplo-principios-do-sus/* <pasta>/            # só para ver o exemplo
cd <pasta> && node $M textos && node $M laminas && node $M conferir
node $M estilos @l02 giz,pixel,lapis                       # a lâmina do macete em três estilos (parada 2)
```
Carrossel não precisa da trava de render: as 7 lâminas saem em 6 a 11 segundos.

## Medido
- O exemplo: 7 lâminas; a conferência deu nenhum erro e nenhum aviso (qa 0, nenhuma cor fora da paleta, todo texto coube, contador livre, grade 3:4, texto alternativo nas 7, legenda com 887 caracteres e 5 hashtags).
- O mesmo exemplo nos outros cinco estilos (pixel, lápis, chapado, planta e carimbo): nenhum erro e nenhum aviso. Para isso o molde dá à promessa da capa e às duas fontes espaço para três linhas (a letra do pixel é larga).
- O molde vazio monta 6 lâminas, sem erro na conferência.
- O molde inteiro tem 36.882 caracteres em 11 arquivos. O exemplo escreveu 14.359 além do molde: 8.628 de desenho do assunto, 4.512 de texto (textos, alt e legenda), 1.047 do bloco PREENCHER do score.js e 172 do peca.json.
- Folhas abertas com Read: a do molde vazio, as quatro rodadas do exemplo e a dos três estilos. Consertos que elas pediram: casa grande demais na faixa do município, seringa saindo do quadro, gente pequena no conselho e as duas listas da pegadinha apertadas lado a lado (viraram uma em cima da outra, cada linha numa linha só).

## O exemplo e o que falta
O macete DIP: as três diretrizes do art. 198 da Constituição (descentralização, atendimento integral e participação da comunidade). A pegadinha: as três também estão no art. 7º da Lei 8.080, como princípios (incisos IX, II e VIII). A resposta à capa: a lei não usa "doutrinário" nem "organizativo"; ela separa princípio (Lei 8.080, art. 7º) de diretriz (Constituição, art. 198).

A conferir, na tabela: que nenhuma lei posterior pôs "doutrinário" ou "organizativo" na Lei 8.080 (a coleta leu a publicação do Senado; a cópia atualizada da Câmara não abriu).

Ficaram fora da tela, de propósito: de onde vem a divisão "doutrinários × organizativos" (apostila, livro ou cartilha: não foi lido) e quantos incisos o art. 7º tem hoje.

## Candidatos à biblioteca (desenhos que servem a outras peças)
- `esferas`: as três esferas de governo em faixas, uma pessoa em cada (o comando único), o mapa de Roraima no estado e a UBS ao lado da casa no município.
- `conselho`: a mesa do conselho de saúde com oito pessoas e as chaves das duas metades.
- `duasListas`: duas listas de lei com as fichas marcando o que está nas duas.
- A ficha com a letra grande e a tesoura do recorte (hoje no `PRESEME.KIT` do tipo).
- Achado: o `B.casa` não encolhe direito (janela e porta têm medida fixa e saem para fora da casa pequena). O exemplo desenha a casa no tamanho padrão dentro de um `ctx.scale`.
