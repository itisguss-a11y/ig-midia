# Carrossel no motor do reel e os moldes da série Notícia comentada

Feito pela frente Q na madrugada de 16/11/2026. Texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.

## Onde fica cada coisa
- O motor é um só para reel e carrossel: `preseme/reel/motor` (o carrossel entrou nele em 16/11, por diferença aplicada e testada: o sus-hoje da versão 5 continua dando as mesmas 32 frases, 163,74 s e a mesma conta, e o molde A sai com 8 lâminas e conferência sem erro).
- `tipos/noticia-comentada/`: os três moldes da série (`molde-a-jornal`, `molde-b-telao`, `molde-c-fichas`), cada um já com a peça de exemplo (covid em alta em Roraima), mais a tabela de afirmações e a legenda. O banco de fatos dessa peça mora no projeto (claude/preseme-fatos-noticia-covid-novembro-2026.md e claude/preseme-fatos-covid-caso-leve-cuidados.md), não aqui.
- `antigo-python/`: a base de carrossel em Python, parada em 15/11 (o foco virou reel) e substituída por esta. Fica só para consulta.
- Nos comandos abaixo, `noticia-comentada/molde-X` quer dizer `preseme/carrossel/tipos/noticia-comentada/molde-X`. As folhas de escolha não ficam no repositório: saem do `laminas` de cada molde.

## O carrossel, na prática
Carrossel é a mesma coisa que o reel por dentro: o mesmo motor de desenho (animation-studio) e o mesmo kit de seis estilos. Muda o formato, 4:5 (1080 × 1350), e cada lâmina vira uma foto parada. A peça diz que é carrossel no `peca.json` (`"tipo": "carrossel"`, `"formato": "4:5"`), e o `score.js` lista as lâminas.

Os comandos, de dentro da pasta da peça (`M` = o caminho do `motor/preseme.js`):
1. `node M novo <pasta> --carrossel` monta a peça vazia (modelo de 5 lâminas). Para a série: `node M novo <pasta> --de noticia-comentada/molde-a-jornal`.
2. `node M textos` grava o textos.js e mostra as lâminas (`--tabela` mostra os textos de cada uma).
3. `node M laminas` faz uma imagem por lâmina (`out/laminas/01.png`…), a folha com todas (`out/folha.jpg`), o JPEG de subir (`out/subir/01.jpg`…, qualidade 95, cor sem perda) e o `out/alt.txt`. Avisa o texto que não coube. `--draft` sai em meia resolução; `--estilo giz` troca o estilo na hora.
4. `node M conferir` faz a conferência (lista abaixo). Erro trava a entrega.
5. `node M capa` faz o recorte 3:4 da capa, como a grade do perfil mostra. `node M estilos @l01 lapis,giz,planta` mostra a capa em três estilos (a parada 2).
6. `node M entregar folha` manda a folha e o textos.txt para ele conferir; `node M entregar` lista os JPEG, o alt.txt, a legenda e o textos.txt, com a mensagem de postar.

Não servem ao carrossel, e recusam com aviso: som, rascunho, trecho, definitivo, juntar e folha-textos. Medido: 8 lâminas em 3 a 11 segundos; a conferência em uns 5 segundos. Por serem curtos, esses comandos não precisam da trava de render.

## O que a conferência mede
- o textos.js é do textos.txt atual; de 5 a 20 lâminas; o título [01] inteiro na lâmina 1;
- texto que não coube no espaço dele, nem com a letra mínima do molde (a base do carrossel mede cada texto com a letra dele);
- as lâminas são do texto e do desenho atuais;
- o qa do motor de desenho: texto fora da área segura, pequeno demais, encavalado ou sem contraste;
- cores fora da paleta; o canto do contador "1/8" do Instagram livre; o recorte 3:4 da grade (a área segura fica a 54 px da borda e a grade corta 34 px de cada lado);
- os JPEG de subir; o texto alternativo de cada lâmina; a legenda (até 2.200 caracteres e até 5 hashtags).

## A série Notícia comentada: como escolher o molde
Decisão 118: molde fixo de carrossel, escolhido uma vez entre três. A notícia é o gancho; a peça ensina a medicina preventiva por trás dela. Abra `noticia-comentada/folhas/folha-de-escolha-v2.jpg` (os três moldes, a capa e a lâmina da notícia de cada um). As peças inteiras estão em `folha-molde-a.jpg`, `-b` e `-c`.
- **A ★ jornal anotado** (estilo lápis). A notícia entra como recorte de jornal e o comentário é a caneta de quem estuda por cima: marca-texto, seta, círculo, anotação de mão. É o que a série é (notícia comentada), e o lápis é o acabamento que ele já aprovou. Cuidado: a letra de mão só vai em frase curta.
- **B telão de dados** (estilo chapado, fundo Sálvia). Painel com o mapa do Brasil em quadradinhos, cada ideia num cartão. É o que melhor mostra o dado (os 18 lugares em alta), e o que mais lembra modelo pronto.
- **C fichas de estudo** (estilo carimbo, mesa Floresta). Cada lâmina é uma ficha pautada com carimbo e letra grossa: a cara de "guardar para a prova", e a mesa escura alterna bem na grade.

Os três passaram na conferência sem erro nem aviso (8 lâminas cada; qa 0 problemas; cores 0 fora da paleta; contador livre).

## O que o chat 1 preenche numa peça nova da série
Monta a peça com `novo <pasta> --de noticia-comentada/molde-X` e mexe só em quatro arquivos:
1. `textos.txt`: as frases [01]… e as palavras do desenho [D01]…, no lugar das do exemplo.
2. `score.js`: o `ROTEIRO` (a ordem das lâminas, o tipo de cada uma e os textos dela) e o `DESTAQUE` (o trecho de cada frase no marca-texto). O comentário do arquivo diz o que cada tipo de lâmina leva: capa, noticia, explica, colunas, alerta, passos, prevencao e resumo. Em toda lâmina, a primeira palavra D é a etiqueta (na capa, o nome da série).
3. `alt.txt`: uma linha por lâmina, "[L01] o que a imagem mostra".
4. `legenda.txt`: o que as lâminas não dizem, um pedido só (salvar), as fontes e até 5 hashtags.

O desenho (`film-*.js`) não muda de peça para peça. Os desenhos da peça de exemplo (mapa do Brasil, recorte, oxímetro, pulmões, termômetro, seringa, linha dos dias, certo e errado) ficam em `film-2-desenhos.js` e servem aos três moldes; desenho novo de outra notícia entra ali.

## A peça de exemplo e o que falta nela
Covid em alta em Roraima (Agência Gov, 10/11/2026) e o que ela ensina: caso leve (síndrome gripal) e caso grave (SRAG) pela Nota Técnica nº 5/2026, o cuidado no caso leve e a prevenção. A tabela de afirmações liga cada frase ao trecho da fonte. Falta: "quem precisa procurar a unidade e quando" não está nas duas fontes; uma terceira passaria do teto de duas fontes por peça, e a decisão é do chat 1.
