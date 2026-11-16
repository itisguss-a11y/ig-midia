# Motor do reel "X não é Y" · molde

> texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos

## O que este motor faz

É um programa que já sabe fazer um tipo de reel, o "X não é Y". É o formato do reel 1, o da longitudinalidade, que ele aprovou ("gostei muito do conteúdo"). Dois conceitos que se confundem, cada um definido em uma frase com o desenho dele funcionando, um caso concreto que separa os dois e o fecho, que responde ao título e mostra como reconhecer cada um na prova.

O chat só entrega o conteúdo: as frases, os dois nomes, as pistas, o caso e o desenho do que é novo. O resto já vem pronto, sem precisar escrever de novo:

- as cenas;
- o tempo de cada frase;
- onde fica o texto;
- as etiquetas com o nome de cada lado;
- o sinal de diferente (≠);
- a regra com as setas;
- o som;
- a conferência.

Na peça de exemplo, o chat escreveu 21,8 mil caracteres além do molde, e 16,9 mil deles são o desenho. A peça inteira tem 44,6 mil.

## Que reel ele dá

Um reel de 1min15 a 1min30, em 7 cenas. A peça de exemplo, "Longitudinalidade não é continuidade", dá 1min26, com 14 frases a 100 batidas por minuto.

| cena | tipo | o que aparece | frases |
|---|---|---|---|
| titulo | título | "X não é Y" inteiro no primeiro quadro, com "não é" no marca-texto. Embaixo, as duas etiquetas começam coladas e tortas (os dois se confundem) e se separam quando o ≠ bate, aos 0,9 s (sino). Depois vem a frase do porquê. É a capa | 2 |
| y | conceito | a etiqueta de Y no alto, a definição e o desenho de Y funcionando | 2 |
| x | conceito | o mesmo para X, o conceito do título | 2 |
| diferenca | diferença | 0,6 s de silêncio e a frase que separa os dois cai (baque). Embaixo, Y e X pequenos, lado a lado, com o ≠ no meio | 1 |
| caso | caso | o caso concreto, que cresce frase a frase | 4 |
| regra | regra | como reconhecer na prova: as palavras-pista de cada lado e a seta que acha o nome certo (som de certo quando acha) | 2 |
| fecho | fecho | responde ao título, com os dois lados | 1 |

Regras de tempo e de corte:

- **Leitura.** Cada frase fica na tela o tempo de ler: palavras ÷ 2,17 por segundo + 0,5 s, com no mínimo 4 batidas.
- **Título e diferença.** O título fica pelo menos 6 batidas e a frase da diferença, pelo menos 8.
- **Corte.** Toda cena acaba no fim de um compasso, para o corte cair junto com a música.
- **Fundo.** O fundo alterna de uma cena para a outra entre dois tons: o do estilo e o mesmo verde mais fundo (misturado com 20% de Folha). Assim todo corte troca o fundo inteiro e se vê, e os dois conceitos ficam cada um no seu tom.

  Na peça de exemplo, a conferência mudou assim com essa troca:

  | | sem a troca | com a troca |
  |---|---|---|
  | trecho mais longo sem corte | 48 s | 19,2 s, que é o caso |
  | trocas de música fora de corte | duas | nenhuma (92 a 94% da imagem muda em cada corte) |
- **Texto novo.** Mudou o texto, o tempo se ajusta sozinho.

O som vem em blocos, com um clima por bloco e a troca no corte:

| bloco | clima |
|---|---|
| título | curioso |
| os dois conceitos | calmo |
| diferença e caso | curioso |
| regra | brincalhão |
| fecho | festa |

Efeitos fixos de toda peça:

- pop em cada corte;
- sino no ≠ do título;
- lápis quando a etiqueta entra;
- baque na frase da diferença;
- som de certo na regra e no fecho.

Cada coisa que entra no desenho da peça tem o som dela no mesmo instante.

### O estilo

O estilo padrão é o infográfico chapado.

- **Por que não o giz.** O pedido era giz na lousa, mas o giz já é a cara da série Doença de Roraima, e o Na UBS é lápis no papel. Para os tipos não se parecerem, este ficou com o chapado.
- **Como trocar.** É uma linha no score.js: `const ESTILO = 'giz'`. A folha `estilos @principal chapado,giz,planta` mostra os três lado a lado.
- **Parada 2.** A folha da parada 2 do exemplo saiu com chapado ★, lápis e planta técnica.

## O que o chat 1 preenche

1. `textos.txt`: as 14 frases e as palavras de dentro do desenho.
   - D01 e D02 são os nomes dos lados.
   - D03 a D06 são as pistas da regra.
   - Da D07 em diante vêm as palavras dos desenhos.
   - Se usar a D07 ou mais, mude `"palavras"` no `esperado` do peca.json para o total; sem isso, o `textos` avisa que elas são novas.
2. `score.js`: só o bloco PREENCHER, os `MOMENTOS`. Cada coisa que entra no desenho leva:
   - o nome;
   - a frase em que entra;
   - quantos segundos depois da entrada da frase;
   - o som.

   O desenho pergunta `SCORE.momento('nome')`, e o som cai no mesmo quadro.
3. `film-2-peca.js`: os trechos no marca-texto (`DESTAQUE`) e os seis desenhos marcados com `TROQUE`. Os seis são:
   - Y funcionando;
   - X funcionando;
   - os dois pequenos;
   - o caso;
   - o fecho.

   Enquanto um não for trocado, ele aparece na folha de quadros como um quadro tracejado escrito TROQUE. O desenho usa o kit de estilos (`E.*`), para a folha da parada 2 sair sozinha.
4. `peca.json`: o título. `mapa-do-som.json`: o som do lugar do caso (`fundos`) e até duas coisas com som por cena (`coisas`), se houver. `legenda.txt`.

O resto é do molde e não muda: `index.html`, `film-1-molde.js` (as peças do tipo: texto, etiqueta, ≠, pista) e `film-3-filme.js` (onde cada coisa fica em cada tipo de cena).

Se o caso pedir menos frases, apague a linha que sobra no textos.txt: a cena se ajusta. A regra pode ser de prova ("Na questão, falou em...") ou de prática ("No atendimento...").

## Como se faz uma peça, na prática

Os comandos são do motor do reel e rodam de dentro da pasta da peça:

```
M=/home/claude/ig-midia/preseme/reel/motor/preseme.js
node $M novo <pasta-da-peça> --de /home/claude/trabalho/reel-tipo-comparacao/entrega/molde   # monta a peça (e já roda o textos)
cd <pasta-da-peça>
#   o chat 1 preenche: textos.txt, score.js (PREENCHER), film-2-peca.js, peca.json, mapa-do-som.json, legenda.txt
node $M textos                                    # lê o textos.txt, mostra a duração e confere a leitura
node $M quadros                                   # folha de quadros (um por frase): abrir com Read
node $M folha-textos                              # um quadro por frase, no instante em que ela está inteira
node $M estilos @principal chapado,lapis,planta   # parada 2: o quadro principal em 3 estilos
node $M som                                       # a música e os efeitos, pelo mapa do som
flock /home/claude/trabalho/render.lock -c "node $M rascunho"     # vídeo em meia resolução, com som
node $M conferir --rascunho                       # tudo o que se mede, numa lista só
flock /home/claude/trabalho/render.lock -c "node $M definitivo"   # o vídeo final, 1080 × 1920
node $M capa                                      # a capa (o @abertura do peca.json)
node $M conferir                                  # a conferência do vídeo final
node $M entregar                                  # confere os arquivos e escreve a mensagem para ele
```

Na máquina do Claude, o rascunho e o definitivo rodam dentro do `flock`, como acima, porque outras frentes também renderizam.

A peça de exemplo também roda assim: `node $M novo teste --de /home/claude/trabalho/reel-tipo-comparacao/entrega/exemplo-longitudinalidade`.

## O que tem aqui

| pasta ou arquivo | o que é |
|---|---|
| `molde/` | os arquivos que o chat copia e preenche. O que se troca está marcado com `TROQUE` ou entre parênteses no textos.txt |
| `exemplo-longitudinalidade/` | a peça de exemplo, só os arquivos dela, sem vídeo |
| `tabela-de-afirmacoes-longitudinalidade.md` | cada frase do exemplo com a fonte e o trecho que a sustenta |
| `preseme-fatos-longitudinalidade.md` | o banco de fatos novo, o mesmo gravado no projeto |

As saídas do exemplo ficaram em `/home/claude/trabalho/reel-tipo-comparacao/trabalho/longitudinalidade/out/`:

- `folha-6.jpg`, a folha de quadros;
- `folha-textos-3.jpg`, a folha de textos;
- `folha-estilos-3.jpg`, a parada 2 com chapado ★, lápis e planta;
- `estilos-todos.jpg`, os seis estilos;
- `longitudinalidade-draft.mp4`, o rascunho com som.

## Limites que ele precisa saber

- **O texto.** O texto do exemplo foi escrito pelo Opus e não é amostra da voz dele.
- **Os fatos.** Vêm da Starfield (2002), coletados pelo Opus e a conferir pelo Fable. A frase "a equipe te conhece" é leitura do Claude para "uma relação entre um profissional de saúde e um paciente".
- **Afirmação sem fonte.** Toda frase com fato sai da tabela de afirmações. Afirmação sem trecho de fonte sai da peça.
- **Termos explicados.** O exemplo não fala dos quatro atributos da atenção primária: os outros três termos ficariam sem explicação, o que reprova no teste de ensino.
- **O meio da cena "x".** No exemplo, entre o texto e o desenho dessa cena sobra uma faixa vazia de uns 450 px. Fica para o chat 1 da peça de verdade decidir se o desenho cresce.
- **O caso sem corte.** O caso do exemplo passa 19,2 s sem corte, e a conferência pede até 12 s. Ele cresce frase a frase, mas não corta. Se a peça de verdade quiser um corte dentro do caso, o caminho é um close no detalhe da virada, como faz o Na UBS.

## A conferência do exemplo (rascunho de 16/11, 02h14)

- **Nenhum erro.** O texto está em dia; dura 86,40 s, abaixo do limite; toda frase dá tempo de ler.
- **Medidas.**
  - qa: 102 quadros, 0 problemas;
  - cores: 16 quadros, nada fora da paleta;
  - som: -16,0 LUFS, pico -1,5 dBFS.
- **Trocas de música.** As 4 caem em corte.
- **Dois avisos.**
  - O caso passa 19,2 s sem corte.
  - O rascunho tem 4,1 MB e não sobe pelo conector do Drive: ele publica à mão.
