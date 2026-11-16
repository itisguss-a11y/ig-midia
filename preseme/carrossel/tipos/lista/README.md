# Carrossel · tipo lista

Texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.

Feito pela frente X3 na madrugada de 16/11/2026, no motor do reel (`preseme/reel/motor`, carrossel 4:5, 1080 × 1350), com o kit de estilos e a biblioteca de desenhos, sem mexer em nenhum dos três.

## O que o tipo faz
O "N coisas que..." do perfil, com a medicina preventiva por trás. Em ordem:
1. **capa**: a etiqueta, o número da lista grande, ao lado do resto do título ("5" e "cuidados no calor forte, e o porquê de cada um"), a promessa e o desenho da capa (sem desenho, as bolinhas numeradas da lista);
2. **item**: uma lâmina por item, com a trilha dos itens em cima (a bolinha da vez acesa, as que passaram cheias, as que faltam só no contorno), o número grande do item com o nome ao lado, o desenho que mostra o item e, no pé, o porquê (o rótulo "por quê" e a frase com o fio Coral);
3. **resumo** (a penúltima): o título e um cartão com a lista toda, uma linha por item, com o número e o nome no destaque; a regra de uma linha (opcional) e a fonte;
4. **fazer** (a última): o título e de 1 a 3 cartões, cada um com o ícone, quem faz e o texto: você (o aluno), a equipe e, quando a fonte disser que é emergência, o 192 (com a faixa Coral e o celular).

É diferente do guia de bolso (os passos em ordem de um procedimento) e do perguntas e respostas (dúvidas): na lista, os itens têm o mesmo peso e a ordem não importa. Quando importa (do mais comum ao mais grave), o `ORDEM` põe o rótulo ao lado da trilha e no resumo, e a segunda metade dos números sai no Coral.

O estilo padrão é o carimbo e gravura: o número grande e condensado dá o peso da capa. Na folha de estilos da capa, carimbo ★, pixel (B) e lápis (C) se leem bem. O exemplo passou na conferência, sem erro e sem aviso, nos seis estilos.

## As lâminas saem da lista
O chat 1 não monta a lista de lâminas: ela sai sozinha da `LISTA`, no `score.js`. Cada item vira uma lâmina, e a trilha, o número da capa e o resumo leem do mesmo lugar. Com 2 itens, o carrossel tem 5 lâminas; com 5, 8; com 7, 10. O `score.js` declara `LAMINAS_MIN = 5` e `LAMINAS_MAX = 10`, e o `conferir` do motor trava fora disso.

Tipos de lâmina (em `film-2-moldes.js`): `capa`, `item`, `resumo`, `fazer` e `texto` (a lâmina sem tipo próprio).

Em `PRESEME.KIT`, as peças que servem a qualquer lista: `numero` (a bolinha numerada; `vez`, `feito`, `apagado`, `papel`), `trilha`, `certo` e `errado`.

## O que fica em cada pasta
- `molde/`: o tipo inteiro, pronto para montar uma peça.
  - Fixos: `index.html`, `film-1-base.js`, `film-2-moldes.js`, `film-9-filme.js` e `peca.js` (a conferência do tipo, que roda no comando `textos`).
  - O que se troca vem marcado com TROQUE: `textos.txt`, o bloco PREENCHER do `score.js`, `film-3-desenhos.js`, `alt.txt`, `legenda.txt` e `peca.json`.
- `exemplo-calor/`: só os arquivos da peça de exemplo ("5 cuidados no calor forte, e o porquê de cada um"). Vão por cima do molde (o `novo` acha o molde vizinho sozinho).
- `tabela-de-afirmacoes-calor.md` e `legenda-calor.txt`: a conferência dos fatos e a legenda do exemplo.

## O que o chat 1 preenche numa peça nova
1. `textos.txt`: as frases [01]… e as palavras do desenho [D01]…. O título [01] começa pelo número de itens, em algarismo ("5 cuidados..."). Os nomes dos itens são palavras D.
2. `score.js`, só o bloco PREENCHER:
   - `CAPA` (o título, a promessa, a etiqueta e o desenho da capa, opcional);
   - `LISTA`, de 2 a 7 itens; cada um com `nome`, `porque` (uma ou duas frases curtas), `desenho`, `palavras` (as D do desenho dele, opcional) e `resumo` (a linha do resumo, começando pelo nome);
   - `ORDEM` (null, ou o rótulo da ordem), `RESUMO` (título, regra opcional e fonte), `FAZER` (título, cartões e fonte) e `DESTAQUE`.
3. `film-3-desenhos.js`: um desenho por item e, se quiser, um para a capa. Use a biblioteca (`const B = globalThis.BIB`; pessoa em pé leva `pose: 'stand'`) e o `PRESEME.KIT`.
4. `alt.txt` (uma linha por lâmina), `legenda.txt` (ensina o que a tela não coube, um pedido só e as fontes) e `peca.json` (título; em `cores`, as cores de gente que a conferência apontar).

Uma linha do exemplo, para ver o jeito:
```
{ nome: 'D06', porque: 5, desenho: 'hora', palavras: ['D13', 'D14', 'D15'], resumo: 11 },
```
com `[D06] Rua na hora fresca`, `[05] Atividade ao ar livre, de manhã cedo ou no fim da tarde: ...` e `[11] Rua na hora fresca: manhã cedo ou fim da tarde.`

## O que o tipo confere sozinho (peca.js, no comando textos)
Trava quando:
- o título da capa não diz o número, ou diz um número diferente do número de itens (a capa promete 4 e a lista tem 5);
- a lista tem menos de 2 ou mais de 7 itens;
- um item está sem nome ou sem o porquê;
- falta a lâmina de um item, ou elas saem fora da ordem;
- falta a lâmina-resumo, ela não é a penúltima, falta a linha de um item, a linha não começa pelo nome do item dela, ou o título do resumo fala em outro número (o resumo que não bate com os itens);
- falta o "o que fazer", ele não é a última lâmina, ou não tem cartão.

Avisa quando: o número da capa está por extenso (aí ele não sai grande); o porquê passa de duas frases ou de uns 230 caracteres; falta o desenho de um item; o resumo ou o "o que fazer" está sem fonte; um cartão está sem quem faz; o cartão do 192 não diz "192"; o carrossel sai com menos de 5 ou mais de 10 lâminas.

Testado: o exemplo passa; capa com 4 e lista com 5, título sem número, item sem porquê, 8 itens, linha do resumo trocada, linha do resumo faltando, título do resumo com outro número e "o que fazer" sem cartão travam (o `textos` sai com o código 1).

## Os comandos
```
M=<ig-midia>/preseme/reel/motor/preseme.js
node $M novo <pasta> --de <este>/molde                  # monta a peça (o novo copia o kit e a biblioteca)
node $M novo <pasta> --de <este>/exemplo-calor           # só para ver o exemplo (o molde vizinho vai primeiro)
cd <pasta> && node $M textos && node $M laminas && node $M conferir
node $M estilos @l01 carimbo,pixel,lapis                  # a capa em três estilos (parada 2)
```
Carrossel não precisa da trava de render: as 8 lâminas saem em uns 10 segundos.

## Medido
- O exemplo: 8 lâminas; a conferência deu nenhum erro e nenhum aviso (qa 0, nenhuma cor fora da paleta, todo texto coube, contador livre, grade 3:4, texto alternativo nas 8, legenda com 5 hashtags). O mesmo nos outros cinco estilos (pixel, lápis, giz, chapado e planta), depois de dois consertos: o cartão do "o que fazer" baixo (3 cartões) põe o ícone e quem faz numa linha e o texto na largura toda, e as frases dos cartões do exemplo ficaram curtas (a letra do pixel é larga). No lápis, a pele sai num tom que vai em `cores` do peca.json.
- O molde vazio monta 5 lâminas, sem erro na conferência.
- O molde inteiro tem 39.925 caracteres em 11 arquivos. O exemplo escreveu 11.962 além do molde: 6.932 de desenho (2.496 dos desenhos novos e 3.781 das cenas dos itens e da capa), 3.897 de texto (textos, alt e legenda), 951 do bloco PREENCHER do score.js e 182 do peca.json.
- Folhas abertas com Read: a do molde vazio, as rodadas do exemplo, a dos três estilos e a do `ORDEM` (rótulo e números no Coral). Consertos que elas pediram: o marca-texto atrás do número da capa saía torto e saiu; o errado do item 2 subiu para cima dos dois objetos; o prato pesado virou um monte de comida.

## Candidatos à biblioteca
Os desenhos novos do exemplo estão em `PRESEME.NOVOS`, em `exemplo-calor/film-3-desenhos.js`: a garrafa de água (com o nível), a lata de bebida, os pulmões e as ondas de calor. O sol é o do kit (`E.objeto(ctx, 'sol', ...)`).

## O exemplo e o que falta
"5 cuidados no calor forte, e o porquê de cada um": água o dia todo, sem álcool e sem cafeína, rua na hora fresca, prato leve e atenção ao coração e ao pulmão; no resumo, os cinco; no "o que fazer", a unidade de saúde para os sinais de alerta, a equipe que avalia e ajusta o remédio, e o 192 para confusão, convulsão ou desmaio no calor (golpe de calor). Fontes: as páginas Calor e SAMU 192 do Ministério da Saúde. Sem gancho regional: as fontes não têm dado de Roraima.

A conferir, na tabela: o porquê da hora fresca e o 192 para confusão e desmaio são pontes do Claude entre dois trechos; a "ilha de calor" da legenda veio em paráfrase do leitor de páginas.
