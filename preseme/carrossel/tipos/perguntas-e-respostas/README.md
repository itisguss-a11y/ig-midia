# Carrossel · tipo perguntas e respostas

Texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.

Feito pela frente T3 na madrugada de 16/11/2026, no motor do reel (`preseme/reel/motor`, carrossel 4:5, 1080 × 1350).

## O que o tipo faz
Dúvidas de verdade, uma por lâmina, de 3 a 6. Cada lâmina de dúvida tem, de cima para baixo:
1. a trilha das dúvidas (uma bolinha por dúvida; a da vez no destaque, as já respondidas cheias);
2. a dúvida escrita à mão num balão, como alguém pergunta, com o rosto de quem pergunta na pontinha;
3. a resposta, em letra de forma;
4. o desenho que explica a resposta;
5. o detalhe ou o porquê, com o fio Coral, no pé.

No fim vem o resumo para salvar: uma ficha pautada, presa com o clipe, uma linha por dúvida, com o certo na margem e a fonte no pé. O estilo padrão é o lápis no papel.

Tipos de lâmina (em `film-2-moldes.js`):
- `capa`
- `pergunta`
- `resumo`
- `texto`

## O que fica em cada pasta
- `molde/`: o tipo inteiro, pronto para montar uma peça.
  - Arquivos fixos: `index.html`, `film-1-base.js`, `film-2-moldes.js`, `film-9-filme.js` e `peca.js` (a conferência do tipo, que roda no comando `textos`). O `film-2-moldes.js` traz:
    - os quatro moldes de lâmina, com a trilha, o balão e a ficha;
    - o `troque` (o tracejado do lugar vazio);
    - em `PRESEME.KIT`, as peças que servem a qualquer dúvida de saúde: o rosto de quem pergunta, o frasco (com o monitor de calor, se tiver), o termômetro com faixa, nível e marcas, o certo e o errado.
  - O que se troca vem marcado com TROQUE: `textos.txt`, `score.js` (`ROTEIRO` e `DESTAQUE`), `film-3-desenhos.js`, `alt.txt`, `legenda.txt` e `peca.json`.
- `exemplo-vacina-e-frio/`: só os arquivos da peça de exemplo ("Vacina que esquentou ainda protege?"). Vão por cima do molde.
- `tabela-de-afirmacoes-vacina-e-frio.md` e `legenda-vacina-e-frio.txt`: a conferência dos fatos e a legenda do exemplo.
- `folhas/`: as 6 lâminas do exemplo e a capa em três estilos (lápis ★, giz e planta).

## O que o chat 1 preenche numa peça nova
1. `textos.txt`: as frases [01]… e as palavras do desenho [D01]…. Em cada dúvida, três frases: a dúvida (com o ponto de interrogação), a resposta e o detalhe.
2. `score.js`: o `ROTEIRO` e o `DESTAQUE`. O tipo `pergunta` se repete uma vez por dúvida; o `resumo` leva uma frase por dúvida, a etiqueta e a fonte.
3. `film-3-desenhos.js`: um desenho por dúvida, que explique a resposta. Dúvida sem desenho que explique não entra (lâmina só de frase não ensina).
4. `alt.txt`, uma linha por lâmina.
5. `legenda.txt`: o que não coube na tela, um pedido só (salvar), a fonte e até 5 hashtags.

Uma linha do exemplo, para ver o jeito:
```
{ id: 'p3', tipo: 'pergunta', desenho: 'alarme', linhas: [9, 10, 11, 'D11', 'D12', 'D04', 'D05'] },
```

## Os comandos
```
M=<ig-midia>/preseme/reel/motor/preseme.js
node $M novo <pasta> --de <este>/molde               # monta a peça
cp -r <este>/exemplo-vacina-e-frio/. <pasta>/       # só para ver o exemplo
cd <pasta> && node $M textos && node $M laminas && node $M conferir
node $M estilos @l01 lapis,giz,planta                # a capa em três estilos
```
Carrossel não precisa da trava de render: as 6 lâminas saem em 5 a 12 segundos.

## Medido
- A conferência do exemplo deu 6 lâminas, nenhum erro e nenhum aviso: qa 0, nenhuma cor fora da paleta, o contador livre, a legenda com 500 caracteres e 5 hashtags.
- A conferência do tipo (`peca.js`, no comando `textos`): 4 dúvidas, cada uma com resposta, e o resumo no fim.
- O molde vazio monta 5 lâminas, também sem erro na conferência.
- O molde mais o exemplo dão as mesmas 6 lâminas que a peça de trabalho, sem um pixel de diferença.
- O exemplo escreveu 18.163 caracteres além do molde: 13.364 de desenhos do assunto e 4.799 de texto (textos, score, alt, legenda e peça). O molde inteiro tem 32.543.
- O mesmo exemplo na lousa (giz) e no carimbo: as 6 lâminas saem sem letra apagada. O certo e a fonte do resumo ficam Sálvia na lousa (o Folha some no Floresta).
- Folhas abertas com Read: os pares durante a montagem (o rosto de quem pergunta em cima da resposta, as paradas da rede de frio encavaladas, o clipe em cima do texto do resumo, o rótulo do barco que não cabia); a folha final uma vez; a da capa em três estilos uma vez.

## O que falta no exemplo
Está na tabela: o que é leitura do Opus vai marcado "a conferir". O ponto é um só: quais vacinas têm o monitor do frasco (a parte lida do manual não diz; a tela fala "se ele tiver").

Ficaram fora da tela, de propósito:
- qual vacina não pode congelar;
- a temperatura ideal dentro da faixa;
- a caixa térmica do dia (bobina a 0 °C, troca em 7 °C), que é outra peça inteira;
- o barco e o avião "em circunstâncias especiais" (item 10.3), que foram para a legenda.
