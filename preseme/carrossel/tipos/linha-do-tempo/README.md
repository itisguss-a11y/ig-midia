# Carrossel · tipo linha do tempo

Texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.

Feito pela frente T3 na madrugada de 16/11/2026, no motor do reel (`preseme/reel/motor`, carrossel 4:5, 1080 × 1350).

## O que o tipo faz
Responde a pergunta da capa contando a história em datas. Cada lâmina do meio é um marco, nesta ordem de leitura:
1. o ano grande em cima da linha (e o mês do lado);
2. o que aconteceu (o título);
3. o porquê (a nota com o fio Coral);
4. o desenho do assunto;
5. o que mudou, na faixa escura do pé.

A linha corre na mesma altura em toda lâmina e sai pela borda. Quem passa o dedo vê a linha continuar na lâmina seguinte, com:
- os tracinhos dos anos do meio;
- a cota entre duas datas próximas (no exemplo, "3 meses", que começa numa lâmina e termina na outra);
- o salto (//) antes de hoje.

A capa é onde a linha nasce, num anel pendurado na etiqueta. A última lâmina é hoje: a linha termina no alvo, com a resposta da capa, a linha inteira em miniatura (um verbo por data) e a frase da prova na faixa. O estilo padrão é o carimbo e gravura (documento, lei, "oficial").

Tipos de lâmina (em `film-2-moldes.js`):
- `capa`
- `marco`
- `hoje`
- `texto` (uma lâmina sem data no meio da história; a linha passa reto)

## O que fica em cada pasta
- `molde/`: o tipo inteiro, pronto para montar uma peça.
  - Arquivos fixos: `index.html`, `film-1-base.js`, `film-2-moldes.js`, `film-9-filme.js` e `peca.js` (a conferência do tipo, que roda no comando `textos`). O `film-2-moldes.js` traz:
    - a linha que continua de uma lâmina para a outra;
    - os quatro moldes de lâmina;
    - a cena pronta `linhaInteira` (a da lâmina hoje) e o `troque` (o tracejado do lugar vazio);
    - em `PRESEME.KIT`, as peças que servem a qualquer história: o documento com o artigo riscado, o livro aberto com abas, o prédio com placa, a gente variada (cinco roupas), a multidão, o calendário e o `plano` (o fundo liso para letra).
  - O que se troca vem marcado com TROQUE: `textos.txt`, `score.js` (`ROTEIRO` e `DESTAQUE`), `film-3-desenhos.js`, `alt.txt`, `legenda.txt` e `peca.json`.
- `exemplo-nascimento-do-sus/`: só os arquivos da peça de exemplo ("Quem decidiu que a UBS atende qualquer pessoa?"). Vão por cima do molde.
- `tabela-de-afirmacoes-nascimento-do-sus.md` e `legenda-nascimento-do-sus.txt`: a conferência dos fatos e a legenda do exemplo.
- `folhas/`: as 6 lâminas do exemplo, a tira das lâminas lado a lado (para ver a linha continuar) e a capa em três estilos (carimbo ★, giz e chapado).

## O que o chat 1 preenche numa peça nova
1. `textos.txt`: as frases [01]… e as palavras do desenho [D01]….
2. `score.js`: o `ROTEIRO` e o `DESTAQUE`. Em cada marco do `ROTEIRO`:
   - `ano` e `quando`: o ano grande e o mês;
   - `rotulo`: o rótulo da faixa;
   - `desenho` e `linhas`: o desenho e as três frases;
   - para o trecho até a data seguinte: `passos` (os tracinhos), `cota` (a distância, para datas próximas) e `salto: true` (no último marco);
   - `selo`: o que aconteceu na mesma data, carimbado do lado do ano;
   - `verbo` e `data`: o que aparece na linha inteira de hoje.
3. `film-3-desenhos.js`: os desenhos do assunto e, se quiser, a cena do fim da linha inteira (`DS.fimDaLinha`).
4. `alt.txt`, uma linha por lâmina.
5. `legenda.txt`: o que não coube na tela, um pedido só (salvar), as fontes e até 5 hashtags.

Uma linha do exemplo, para ver o jeito:
```
{ id: 'm1990a', tipo: 'marco', ano: 'D05', quando: 'D06', data: 'D07', rotulo: 'D11', verbo: 'D15', desenho: 'veto', linhas: [9, 10, 11, 'D27', 'D28', 'D29'], cota: 'D17' },
```

## Os comandos
```
M=<ig-midia>/preseme/reel/motor/preseme.js
node $M novo <pasta> --de <este>/molde                  # monta a peça
cp -r <este>/exemplo-nascimento-do-sus/. <pasta>/      # só para ver o exemplo
cd <pasta> && node $M textos && node $M laminas && node $M conferir
node $M estilos @l01 carimbo,giz,chapado                # a capa em três estilos
```
Carrossel não precisa da trava de render: as 6 lâminas saem em 5 a 10 segundos.

## Medido
- A conferência do exemplo deu 6 lâminas, nenhum erro e nenhum aviso: qa 0, nenhuma cor fora da paleta, o contador livre, a legenda com 823 caracteres e 5 hashtags.
- A conferência do tipo (`peca.js`, no comando `textos`): 4 datas em ordem, até 1990, e a linha termina em hoje.
- O molde vazio monta 5 lâminas, também sem erro na conferência.
- O molde mais o exemplo dão as mesmas 6 lâminas que a peça de trabalho, sem um pixel de diferença.
- O exemplo escreveu 12.108 caracteres além do molde: 6.576 de desenhos do assunto e 5.532 de texto (textos, score, alt, legenda e peça). O molde inteiro tem 44.878.
- O mesmo exemplo na lousa (giz) e no chapado: as 6 lâminas saem sem letra apagada. A letra em cima de preenchimento (aba do livro, placa, faixa) pega a cor que se lê nele (`KIT.corSobre`).
- Folhas abertas com Read: a das lâminas, a tira e os pares durante a montagem; a folha final uma vez; a da capa em três estilos duas vezes (o anel onde a linha nasce sumia no chapado: ficou claro, com contorno).

## O que falta no exemplo
Está na tabela: o que é leitura do Opus vai marcado "a conferir". São dois pontos:
- a frase do INAMPS vem de um texto do Ministério de 2003, que descreve o INAMPS antes do SUS sem dar o ano;
- o "sistema único, separado da previdência" (editorial da revista), quando a Fiocruz fala em Suds.

Ficaram fora da tela, de propósito: "quase cinco mil" com os observadores, os dependentes do trabalhador com carteira e a data exata da Constituição (5 de outubro), que não está no banco.
