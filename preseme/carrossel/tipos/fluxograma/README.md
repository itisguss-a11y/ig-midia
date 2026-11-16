# Carrossel · tipo fluxograma

Texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.

Feito pela frente U4 na madrugada de 16/11/2026, no motor do reel (`preseme/reel/motor`, carrossel 4:5, 1080 × 1350), com o kit de estilos e a biblioteca de desenhos, sem mexer em nenhum dos três.

## O que o tipo faz
O carrossel para salvar e estudar para a prova: a conduta de um protocolo oficial em caixas e setas. A capa traz a pergunta ("Mordida de cachorro: e agora?"). As lâminas do meio andam pelo fluxo, uma decisão por lâmina: a pergunta no losango, os caminhos sim (à esquerda) e não (à direita) e, em cada um, a conduta em que ele termina ou, tracejado, o que vem na próxima lâmina. No canto de cada lâmina do meio, o fluxo inteiro em miniatura, com o pedaço já percorrido aceso e um anel Coral em "você está aqui". A penúltima é o fluxo inteiro numa lâmina só (o cartão para print). A última é quem faz o quê: você, a equipe e o 192.

O que o chat 1 escreve é a **árvore**: as caixas e as setas, como dados. O tipo desenha tudo a partir dela: o losango de cada lâmina, a miniatura do canto e o fluxo inteiro saem da mesma árvore, então não há como a lâmina 8 dizer uma coisa e a lâmina 4 outra.

O estilo padrão é o infográfico chapado (★). Na folha de três estilos (`estilos @pergunta1 chapado,planta,pixel`), o chapado foi o que melhor se leu: caixa cheia, losango Marca-texto e conduta Coral se separam de longe. A planta técnica é a segunda opção (bem diferente: traço fino e aguada) e o pixel, a terceira. O tipo passou nos seis estilos (folha `--todos` olhada quadro a quadro).

Cores fixas do tipo, iguais nos seis estilos: pergunta em losango Marca-texto com letra Floresta; caixa do que fazer na superfície do estilo; conduta em Folha com letra Papel (na planta, letra Floresta, porque a aguada é clara); conduta de urgência (`alerta: true`) em Coral com letra Floresta (Coral nunca é letra no claro).

## Tipos de lâmina (em `film-2-moldes.js`)
- `capa`: a etiqueta, o título [01] inteiro, a promessa [02], o desenho da capa e a silhueta do fluxo (da mesma árvore).
- `dado` (opcional): o gancho regional. O número grande, o que ele é, o detalhe, o desenho (no exemplo, `B.mapaRR`) e a fonte. Sem dado oficial, a lâmina sai (apague as frases dela).
- `passo`: um nó `acao`. "passo 1 de 2", a caixa do que fazer, a seta, o desenho e o porquê.
- `decisao`: um nó `pergunta`. "pergunta 1 de 3", o losango, o ícone da pergunta, os dois caminhos e o porquê. Todas as perguntas saem no mesmo tamanho de letra, e todas as condutas também (o tipo mede e escolhe o maior que cabe em todas).
- `fluxo`: o fluxo inteiro, com o texto curto de cada caixa e o sim e o não nas setas, e a fonte.
- `papeis`: até três cartões, cada um com o rótulo (palavra D), a frase e o ícone. O terceiro é o 192 (quando chamar) ou, se o protocolo não fala em 192, a prevenção. Frase apagada some com o cartão.
- `texto`: o de reserva, para tipo de lâmina que não existe.

## A árvore (no `score.js`)
```js
const ARVORE = {
  inicio: 'lavar',
  rotulos: { sim: 'D03', nao: 'D04', pergunta: 'D02', passo: 'D05', proxima: 'D06' },
  nos: {
    lavar: { tipo: 'acao', texto: 'D10', curto: 'D11', prox: 'silvestre' },
    silvestre: { tipo: 'pergunta', texto: 'D12', curto: 'D13', sim: 'soro', nao: 'observavel', icone: 'morcego' },
    soro: { tipo: 'fim', texto: 'D14', alerta: true, icone: 'B.seringa' },
    ...
  },
};
```
- `acao`: a caixa do que fazer; o fluxo segue para `prox`.
- `pergunta`: o losango, uma pergunta de sim ou não; `sim` e `nao` levam a outro nó.
- `fim`: a conduta, onde o caminho termina; `alerta: true` pinta Coral (a urgência).
- `texto`: a palavra D do nó na lâmina dele; `curto` (opcional): a versão curta, no fluxo inteiro e na caixa tracejada.
- `icone` (opcional): `'B.<nome>'` é da biblioteca (`B.seringa`, `B.visto`, `B.celular`...); outro nome é um desenho de `film-3-desenhos.js`.
- Duas condutas iguais: dois nós com o mesmo texto D (no exemplo, `ja` e `ja2` usam o D17).
- `rotulos`: as palavras D que o tipo escreve sozinho (sim, não, "pergunta", "passo", o aviso do caminho tracejado) e, no molde, `numero`: o número na tela do celular do cartão do 192.

Letra: o tipo mede e põe todas as perguntas no mesmo tamanho (o maior em que a mais comprida cabe), e todas as condutas também. Pergunta de até uns 45 caracteres e conduta de até uns 20 saem com letra maior; no exemplo, a mais comprida ("Nos 10 dias, ele morreu, sumiu ou teve sinal de raiva?") deixou as perguntas em 36 px no chapado.

A regra que faz o fluxo inteiro caber numa lâmina: **em cada pergunta, um lado termina numa conduta**. O fluxo desce por uma espinha só, e as condutas ficam do lado. Na última pergunta, com as duas pontas em conduta, desce a que não é alerta (ou a de `desce: 'sim'`). Protocolo que abre dois caminhos que continuam não cabe no tipo: junte perguntas ou faça duas peças.

## O que o tipo confere sozinho (`peca.js`, no comando textos)
Trava quando:
- falta a árvore, o início ou o texto de um nó;
- a pergunta não tem os dois caminhos, ou os dois continuam;
- a caixa do que fazer não leva a lugar nenhum;
- um nó leva a outro que não existe, ou chegam dois caminhos no mesmo nó;
- o fluxo volta para trás;
- a espinha passa de 7 caixas, ou são menos de 2 ou mais de 4 perguntas;
- falta a capa na lâmina 1, uma pergunta não tem lâmina, as lâminas de passo e decisão saem da ordem do fluxo, ou falta a lâmina do fluxo inteiro.

Avisa quando: um nó fica fora de todo caminho; um rótulo (sim, não...) está vazio; o fluxo inteiro não é a penúltima; quem faz o quê não é a última; o carrossel sai do intervalo de 7 a 11 lâminas.

As 10 travas foram testadas (cada uma com uma árvore quebrada de propósito).

## O que fica em cada pasta
- `molde/`: o tipo inteiro, pronto para montar uma peça. Fixos: `index.html`, `film-1-base.js` (a base do motor), `film-2-moldes.js` (o fluxo e os moldes), `film-9-filme.js` e `peca.js`. O que se troca vem marcado com TROQUE: `textos.txt`, `score.js` (a `ARVORE`, o `ROTEIRO` e o `DESTAQUE`), `film-3-desenhos.js`, `alt.txt`, `legenda.txt`. Os desenhos `troque` (o lugar vazio), `voce`, `equipe` e `tel192` já vêm no tipo.
- `exemplo-raiva/`: só os arquivos da peça de exemplo (mordida de cachorro e a profilaxia da raiva). Vão por cima do molde.
- `tabela-de-afirmacoes-raiva.md` e `legenda-raiva.txt`: a conferência dos fatos e a legenda do exemplo.

## O que o chat 1 preenche numa peça nova
1. A árvore, com o protocolo aberto: cada caixa, cada pergunta e cada conduta, e os textos D de cada uma (o texto e o curto).
2. O `ROTEIRO`: a capa, o dado (se houver gancho regional), uma lâmina `passo` por ação e uma `decisao` por pergunta, na ordem do fluxo, o fluxo inteiro e quem faz o quê.
3. `textos.txt`: as frases (o porquê de cada lâmina) e as palavras D.
4. `film-3-desenhos.js`: só os desenhos que o assunto pede (antes, a biblioteca: `motor/estilos/BIBLIOTECA.md`).
5. `alt.txt`, uma linha por lâmina, e `legenda.txt` (um pedido só, salvar; as fontes; até 5 hashtags).

## Os comandos
```
M=/home/claude/ig-midia/preseme/reel/motor/preseme.js
node $M novo /home/claude/trabalho/<nome> --de <este>/molde
cp -r <este>/exemplo-raiva/. /home/claude/trabalho/<nome>/     # só para ver o exemplo
cd /home/claude/trabalho/<nome>
node $M textos
node $M laminas
node $M estilos @pergunta1 chapado,planta,pixel                # no exemplo: @silvestre
node $M conferir
node $M capa
node $M entregar
```
Carrossel não precisa da trava de render: as 9 lâminas saem em uns 10 segundos.

## Medido
- O exemplo deu 9 lâminas e a conferência saiu limpa: nenhum erro e nenhum aviso. qa 0 problemas (área segura, letra legível, sem encavalar, contraste), nenhuma cor fora da paleta, contador do Instagram livre, título inteiro no recorte da grade.
- O molde vazio monta 9 lâminas, também sem erro (qa 0).
- O molde mais o exemplo dão as mesmas 9 lâminas da peça de trabalho, sem um pixel de diferença.
- A parte fixa do tipo tem 35.584 caracteres de código (a base, o fluxo, os moldes, a conferência). O exemplo escreveu 13.818 além do molde: 1.950 na árvore e no roteiro e 11.868 de texto, alt, legenda e desenho do assunto (7.024 só de desenho: o cão, o gato, o morcego e a torneira, candidatos à biblioteca).

## O que ficou de fora, e por quê
- Sem 192 no exemplo: nenhuma das duas fontes fala dele, então o terceiro cartão virou a prevenção (a vacina do cão e do gato).
- O Quadro 3 da nota técnica (o esquema por tipo de exposição) é imagem e o leitor não leu: a peça diz "a equipe decide vacina e soro", sem leve e grave e sem dose.
- Arranhão e lambida ficaram fora da tela: o folder fala de agressão por animais, e a nota, de contato direto ou indireto.
- Boi, cavalo e outros animais de criação foram para a legenda (a indicação depende do contato, e isso não cabe numa pergunta de sim ou não).
- A conferir pelo Fable, na tabela: a vacina junto do soro no morcego (veio em resumo), "começa na hora" para o cão ou gato que só não dá para observar, e "avalia a ferida".
- O tipo só desenha espinha (um lado de cada pergunta termina numa conduta). Fluxo com dois caminhos que continuam fica para outro tipo.
