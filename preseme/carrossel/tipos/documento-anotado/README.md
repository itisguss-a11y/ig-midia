# Carrossel · tipo documento anotado

Texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.

Feito pelas frentes X2 e X2b na madrugada de 16/11/2026, no motor do reel (`preseme/reel/motor`, carrossel 4:5, 1080 × 1350), com o kit de estilos e a biblioteca de desenhos (a lupa da capa é a `B.lupa`).

## O que o tipo faz
Um documento de verdade da atenção primária (ficha, cartão, caderneta, receita, formulário do e-SUS) desenhado fiel ao modelo oficial, com números em cima dos campos que importam. Regra dele (13/11): "pra você não fazer uma caderneta de vacinação em que os campos e as coisas escritas são diferentes daqueles da vida real". O documento parte do modelo oficial lido, nunca da memória: as caixas, a ordem, os números e as palavras são as do impresso.

As lâminas (em `film-2-moldes.js`):
- `capa`: a etiqueta do tipo, o título [01] (a pergunta), a promessa [02] e o documento inteiro, com a lupa aumentando o primeiro campo anotado.
- `campo`, uma por campo: o selo com o número e o nome do campo como está no documento; o que ele quer dizer; a janela com o zoom no pedaço do documento, o campo marcado (marca-texto clarinho e contorno Coral) e, se houver, o exemplo escrito à mão; embaixo, ERRO COMUM e POR QUÊ.
- `documento`, a última: o documento inteiro de novo, com todos os números, e ao lado o resumo curto de cada campo (o cartão para salvar), mais a fonte no pé.
- `texto`, de reserva (da base do motor): a frase grande e o detalhe.

O tipo vai de 6 a 10 lâminas: de 4 a 8 campos, ou menos campos com lâminas de texto, e até 12 números no documento final. Dois números numa lâmina só: `numeros: [3, 7]` e as duas marcas (no exemplo, as duas datas).

Estilo padrão: planta técnica ★ (o formulário em papel quadriculado, linha reta e fina). Na folha de três estilos do exemplo (`estilos @l05 planta,lapis,carimbo`), B é lápis no papel e C, carimbo e gravura. O exemplo passa no `conferir` nos seis estilos sem erro; no pixel fica um aviso de cor (0,5% da lâmina 08, um tom de mistura na linha da barra "Conclusão"), que não trava.

## O que fica em cada pasta
- `molde/`: o tipo inteiro, pronto para montar uma peça.
  - Fixos: `index.html` (carrega o kit e a biblioteca), `film-1-base.js`, `film-2-moldes.js` (as peças de formulário, a janela de zoom e os moldes de lâmina), `film-9-filme.js` e `peca.js` (a conferência do tipo, que roda no `textos`).
  - O que se troca vem marcado com TROQUE: `textos.txt`, `score.js` (o bloco PREENCHER), `film-3-desenhos.js` (o documento), `alt.txt`, `legenda.txt` e `peca.json`. O molde traz um formulário de mentira, folha A5, só para montar.
- `exemplo-notificacao/`: só os arquivos da peça de exemplo ("Você sabe preencher a ficha de notificação?", a Ficha de Notificação/Conclusão do Sinan). Vão por cima do molde.
- `legenda-notificacao.txt` e `tabela-de-afirmacoes-notificacao.md`: a legenda e a fonte de cada frase do exemplo. O banco de fatos mora no projeto: claude/preseme-fatos-sinan-ficha-documento.md.

## O que o chat 1 preenche
1. `film-3-desenhos.js`: o documento. `PRESEME.DOC = { W, H, desenhar(ctx, V) }`, desenhado com as peças de formulário (`PRESEME.FORM`), nas unidades do próprio documento. O jeito mais fiel, como no exemplo: baixar o PDF oficial, tirar a posição de cada texto (`pdftotext -bbox-layout arquivo.pdf saida.html`) e das caixas (a imagem do PDF, `pdftoppm -r 220 -png`), e usar os pontos da folha como unidade (A4: 595 × 842). As peças:
   - `F.caixa(ctx, V, x, y, w, h, { n, rotulo, rx, ry, size, fechada })`: a caixa do campo, com o número no quadradinho do canto e o rótulo.
   - `F.texto(ctx, V, 'texto', x, y, { size, forte, align, maxw })`: texto impresso (y é a linha de base).
   - `F.data(ctx, V, x, y, w, h)`: as casas de data (dd mm aaaa); `F.casas(ctx, V, [x...], yPe, { altas })`: risquinhos de dígito.
   - `F.quadrado` (o quadradinho de resposta), `F.separa` (o separador de "Código"), `F.sombra` (a área cinza do impresso), `F.faixa` (o bloco em pé, como "Dados Gerais"), `F.barra` (a barra de uma parte, como "Conclusão") e `F.linha`.
2. `score.js`, bloco PREENCHER:
   - `ESTILO`.
   - `DOC = { W, H, LETRA, LETRA_MIN }`: o tamanho do documento, a letra do rótulo e a letra mais miúda (as opções). O `peca.js` confere se, no zoom de cada lâmina, elas se leem (26 px no rótulo e 18 px na opção).
   - `CAMPOS`, na ordem das lâminas: `id`, `numeros`, `marcas` (o retângulo de cada número), `zoom` (o pedaço que a lâmina aumenta; o tipo alarga até a proporção da janela), `nome` e `curto` (palavras D), `oque`, `erro` e `porque` (frases), e `escrito` (o exemplo à mão, opcional, só com dado inventado).
   - `ROTEIRO` (já sai dos CAMPOS: capa, um campo por lâmina, documento) e `DESTAQUE`.
3. `textos.txt`: as frases e as palavras do desenho. O nome do campo vai escrito como está no documento.
4. `alt.txt`, `legenda.txt` (com os guias caption-writer, instagram-seo e hashtag-strategy) e `peca.json` (nome, título e as cores de propósito).

## Os comandos
```
M=/home/claude/ig-midia/preseme/reel/motor/preseme.js
node $M novo /home/claude/trabalho/<nome> --de <este>/molde      # monta a peça (o novo copia o kit e a biblioteca)
node $M novo /home/claude/trabalho/<nome> --de <este>/exemplo-notificacao   # só para ver o exemplo (o novo põe o molde por baixo)
cd /home/claude/trabalho/<nome>
node $M textos                       # roda também a conferência do tipo (peca.js) e mostra o zoom de cada campo
node $M laminas                      # um PNG por lâmina, a folha (out/folha.jpg) e o JPEG de subir
node $M estilos @l05 planta,lapis,carimbo
node $M conferir
node $M capa
node $M entregar
```

## O que o motor confere sozinho (peca.js, no comando textos)
Trava quando: falta o DOC; não há CAMPOS ou há mais de 8; um campo está sem id, sem número ou repetido; um número aparece em dois campos; o número de marcas não bate com o de números; falta a frase do que é, do erro comum ou do porquê, ou a palavra do nome ou do resumo; falta o zoom; no zoom, a letra do documento fica abaixo de 26 px no rótulo ou de 18 px na opção miúda; a marca sai do documento ou o campo fica fora do zoom (ou só um pedaço dele aparece); passam de 12 números no documento final; a lâmina 1 não é a capa; não há uma lâmina de documento final, no fim; um campo não tem lâmina, tem duas ou não aparece no documento final; uma lâmina pede um campo que não existe; o tipo sai de 6 a 10 lâminas.
Avisa quando: um escrito à mão está vazio; o documento final não é a última lâmina; as lâminas de campo estão fora da ordem dos CAMPOS; falta a palavra da etiqueta, do erro comum ou do porquê.

## O exemplo
"Você sabe preencher a ficha de notificação?": a Ficha de Notificação/Conclusão do Sinan (Ministério da Saúde, SVS, Sinan NET, 27/09/2005), com os campos 3 e 7 (as datas), 8 (nome), 10 (idade), 12 (gestante), 13 (raça/cor), 14 (escolaridade) e 26 (ponto de referência), em 9 lâminas. As regras de cada campo vêm do Dicionário de dados do Sinan NET, versão 5.0, revisado em novembro de 2018. O preenchimento de exemplo é inventado: um homem de 25 anos, Fulano de Tal da Silva (por isso o 6 na gestante e o 8 na escolaridade). Sem gancho regional: as fontes são nacionais.

O que ficou simplificado em relação à ficha impressa:
- A letra é a do estilo (Instrument Sans na planta), não a Helvetica do impresso; as opções em itálico (gestante, raça/cor) saem retas, e o "Nº" e os blocos em pé saem na letra do estilo.
- A linha sai no traço do estilo (reta na planta, tremida no lápis). As casas de dígito e os quadradinhos foram medidos na imagem do PDF, com erro de 1 a 2 pontos.
- O cinza do impresso (UF, código da unidade, "Nº") sai na cor de apoio do estilo, clarinha.
- No zoom, o texto que começa fora da janela não sai (de propósito: o fim de uma palavra solto na borda parece outra coisa). Na lâmina da escolaridade, aparecem só as opções que começam dentro do pedaço aumentado (5, 8, 9 e 10); as outras ficam de fora.
- O modelo lido é o de 2005, pela cópia do PDF no repositório público rfsaldanha/sis; se é o que as UBS de Roraima usam hoje, o chat 1 confere no portal do Sinan.

Quanto o exemplo escreveu: o molde tem 46,8 mil caracteres; o exemplo acrescenta uns 15,3 mil. Desses, 9,7 mil são o desenho da ficha (que vale para qualquer peça sobre a mesma ficha: a segunda peça sobre o Sinan escreve só os CAMPOS e os textos), 1,8 mil o texto da tela, 1,4 mil o PREENCHER do score.js, 1,4 mil o texto alternativo e 0,8 mil a legenda.

## Candidatos à biblioteca
- As peças de formulário (`PRESEME.FORM`: caixa com número, casas de data, quadradinho, faixa em pé, barra) servem a qualquer documento: o cartão de vacina, a caderneta, a receita.
- A própria ficha de notificação do Sinan (`film-3-desenhos.js` do exemplo), para outras peças sobre notificação (a série Doença de Roraima fala em quem notifica).
