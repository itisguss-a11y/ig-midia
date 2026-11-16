# Motor do reel "antes e depois" · molde

> texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos

## O que este motor faz

É um programa que já sabe fazer um tipo de reel, o "antes e depois": a mesma cena em dois tempos, separados por uma ação de saúde (uma vacina, uma lei, um programa). A tela dividida e a cortina que corre mostram o antes e o depois do mesmo lugar, cada tempo com o seu número oficial. Depois vêm o que a ação fez, por que funcionou e o que acontece se ela parar, e o fecho volta ao hoje.

O chat só entrega o conteúdo: as frases, os anos, o número oficial de cada tempo e o desenho do lugar. O resto já vem pronto, sem precisar escrever de novo:

- as cenas e o tempo de cada frase;
- onde fica o texto;
- a tela dividida da capa, com os dois lados;
- a cortina que corre no depois e a que volta no "se parar";
- o carimbo do ano e a placa do número de cada tempo;
- a gravura que envelhece o antes;
- a ação de perto e os cortes para perto dentro de uma cena;
- o som e a conferência.

Na peça de exemplo, o chat escreveu 17,8 mil caracteres além do molde, e 12,9 mil deles são o desenho. A peça inteira tem 55,8 mil.

## Que reel ele dá

Um reel de 1min40 a 2min20, em 7 cenas. A peça de exemplo, "Por que ninguém mais pega pólio no Brasil?", dá 2min10, com 15 frases a 96 batidas por minuto.

| cena | tipo | o que aparece | frases |
|---|---|---|---|
| abertura | pergunta | a pergunta grande em cima, que é a capa. Embaixo, a tela dividida: o lugar no antes à esquerda e no depois à direita, cada lado com o carimbo do ano e a placa do número oficial, e a alça da cortina no meio | 2 |
| antes | antes | o lugar inteiro no tempo de antes. O carimbo do ano bate (baque) e a placa do número entra (tique) | 2 |
| acao | ação | o mesmo lugar de perto, no ano da ação (carimbo novo), com a ação acontecendo. A câmera chega perto devagar | 2 |
| depois | depois | a cortina corre da direita para a esquerda em 0,9 s (sopro) e o lugar vira o de hoje. A música troca aqui. Depois, o carimbo do hoje e a placa do número de hoje | 2 |
| porque | porque | sem o lugar: o desenho da peça explica por que funcionou | 2 |
| separar | se parar | 0,6 s de silêncio, a pergunta e a cortina voltando devagar até o meio: o antes entra de novo pela esquerda, com a placa do número de antes | 3 |
| fecho | fecho | o hoje inteiro de novo e a resposta da pergunta da capa | 2 |

Regras de tempo e de corte:

- **Leitura.** Cada frase fica na tela o tempo de ler: palavras ÷ 2,17 por segundo + 0,5 s, com no mínimo 4 batidas. A pergunta da capa fica pelo menos 6 batidas; a primeira frase do depois ganha o tempo de olhar a cortina; a pergunta do "se parar" fica até o antes voltar.
- **Corte.** Toda cena acaba no fim de um compasso, para o corte cair junto com a música.
- **Os dois tempos.** O antes sai com o fundo do estilo mais fundo (misturado com 22% de Folha, mistura que a conferência das cores aceita) e a gravura por cima, traços finos e inclinados, como coisa impressa antiga. O depois sai limpo. Por isso todo corte de um tempo para o outro troca a imagem inteira e se vê.
- **A tela dividida.** O antes fica sempre à esquerda da linha da cortina e o depois à direita. A placa de cada tempo fica do lado dele, e as duas cabem inteiras quando a tela se divide no meio (a capa e o "se parar").
- **Cortes dentro da cena.** A peça pode pedir o lugar de perto numa frase (`PERTO`): é um corte, e o trecho sem corte fica mais curto. Na ação, ele chega ainda mais perto; no porquê, quem cresce é o desenho da peça; no fecho, as últimas 4 batidas voltam para o lugar inteiro. Com um corte por cena, nenhum trecho passa de 12 s sem corte. No exemplo: a criança de muleta (frase 4), a fila ganhando o sinal de vacinada (6), as crianças no dia do certificado (8), as pessoas perto do vírus (10), o lado de 1975 voltando (12) e as crianças de hoje (15).
- **Texto dentro do lugar.** Palavra escrita no lugar (faixa, placa, letreiro) vai com `textoNoLugar`: ela some inteira quando a cortina a cortaria ao meio, porque meio texto não se lê e a conferência acusa contraste.
- **Texto novo.** Mudou o texto, o tempo se ajusta sozinho.

O som vem em blocos, com um clima por bloco e a troca no corte:

| bloco | clima |
|---|---|
| a pergunta | curioso |
| o antes e a ação | sério |
| o depois e o porquê | calmo (a troca é na cortina) |
| se parar | tenso, com 0,6 s de silêncio antes da pergunta |
| o fecho | calmo |

Efeitos fixos de toda peça:

- pop em cada corte (menos na cortina e logo depois do silêncio);
- baque quando o carimbo do ano bate;
- tique quando a placa do número entra;
- sopro quando a cortina corre e quando ela volta.

Cada coisa que entra no desenho da peça tem o som dela no mesmo instante (`MOMENTOS`, no score.js).

### O estilo

O estilo padrão é o carimbo e gravura, no antes e no depois (é o mesmo kit; o que muda de um tempo para o outro é o fundo e a gravura, que o molde põe).

- **Por que o carimbo.** O ano de cada tempo é um carimbo de verdade, como numa ficha datada. Os números oficiais saem na letra grossa (Anton), o que a peça mais precisa mostrar. A folha dos seis estilos, na capa do exemplo, deu ao carimbo o maior contraste entre os dois tempos.
- **Os outros, na mesma folha.** Lápis no papel fica perto e é o B. O infográfico chapado funciona e nunca foi testado como peça inteira: é o C. Na planta técnica as pessoas ficam em aguada e o antes some; não serve para este tipo. No giz os dois lados ficam escuros e o contraste entre eles cai, e o giz já é a cara da série Doença de Roraima. O pixel funciona, mas dá cara de jogo.
- **Para variar.** O tipo "o caminho" também usa o carimbo. Se as duas peças saírem perto uma da outra, a troca é uma linha no score.js: `const ESTILO = 'lapis'`.
- **Parada 2.** A folha da parada 2 do exemplo saiu com carimbo ★, lápis e chapado.

## O que o chat 1 preenche

1. `textos.txt`: as 15 frases e as palavras de dentro do desenho.
   - D01 é o ano do antes, D02 é "hoje", D03 o número oficial do antes e D04 o que ele conta, D05 o número de hoje e D06 o que ele conta, D07 o ano da ação.
   - Da D08 em diante vêm as palavras dos desenhos. Se usar a D08 ou mais, mude `"palavras"` no `esperado` do peca.json para o total.
   - Exemplo de linha: `[03] Em 1975, o Brasil teve um surto de pólio, 3.596 casos num ano só.` e `[D03] 3.596`.
2. `score.js`: só o bloco PREENCHER (`BPM`, `ESTILO` se quiser trocar, e os `MOMENTOS`). Cada coisa que entra no desenho leva o nome, a frase em que entra, quantos segundos depois da entrada da frase e o som. Exemplo: `{ nome: 'virus', frase: 9, dt: 1.8, som: 'sopro', vol: 0.4, lado: -0.6 }`. O desenho pergunta `SCORE.momento('virus')`, e o som cai no mesmo quadro.
3. `film-2-peca.js`:
   - `LUGAR`: uma função só, que desenha o lugar em 1080 × 660 para cada tempo (`info.tempo`: `'antes'`, `'acao'` ou `'depois'`). Por ser a mesma função, o lugar é o mesmo nos dois tempos, e muda só o que a ação mudou. Exemplo: `if (tempo === 'antes') { arvore(ctx, 528, CHAO, { s: 0.42 }); ... }`.
   - `FOCO`: o ponto do lugar que a câmera olha de perto na cena da ação (`{ x, y, z }`).
   - `PERTO` (opcional, mas um por cena deixa o ritmo dentro da conferência): os cortes para perto, por frase. Exemplo: `4: { x: 300, y: 500, z: 1.9 }`.
   - `DESTAQUE`: o trecho de cada frase no destaque.
   - `DESENHO.porque`: o desenho de por que funcionou (a cena inteira). Os outros (`depois`, `separar`, `fecho`...) são opcionais e entram por cima do mundo.
   - Enquanto um desenho não for trocado, ele aparece na folha de quadros como um quadro tracejado escrito TROQUE.
4. `peca.json`: o título e o `esperado`. `mapa-do-som.json`: o som do lugar de cada cena (`fundos`) e até duas coisas com som por cena (`coisas`). `legenda.txt`.

O resto é do molde e não muda: `index.html`, `film-1-molde.js` (os dois mundos, a cortina, o carimbo, a placa, a gravura, o texto e o KIT) e `film-3-filme.js` (o que cada tipo de cena mostra).

O KIT do desenho (`AD.KIT`): `pessoa`, `gente` (roupa e pele variadas), `chao`, `casa`, `arvore`, `virus`, `etiqueta`, `barra` (uma porcentagem com a meta), `textoNoLugar`, `aFazer` (o quadro TROQUE), `mo` e `em` (os momentos).

Se o assunto pedir menos frases, apague a linha que sobra no textos.txt: a cena se ajusta. A ação pode ser uma vacina, uma lei ou um programa; o lugar, uma rua, uma sala de espera, uma escola, uma cozinha.

## Como se faz uma peça, na prática

Os comandos são do motor do reel e rodam de dentro da pasta da peça:

```
M=/home/claude/ig-midia/preseme/reel/motor/preseme.js
node $M novo <pasta-da-peça> --de /home/claude/trabalho/reel-tipo-antes-depois/entrega/molde   # monta a peça (e já roda o textos)
cd <pasta-da-peça>
#   o chat 1 preenche: textos.txt, score.js (PREENCHER), film-2-peca.js, peca.json, mapa-do-som.json, legenda.txt
node $M textos --tabela                           # lê o textos.txt, mostra a duração e o tempo de cada frase
node $M quadros                                   # folha de quadros (um por frase): abrir com Read
node $M folha-textos                              # um quadro por frase, no instante em que ela está inteira
node $M estilos @principal carimbo,lapis,chapado  # parada 2: o quadro principal em 3 estilos
node $M som                                       # a música e os efeitos, pelo mapa do som
flock /home/claude/trabalho/render.lock -c "node $M rascunho"     # vídeo em meia resolução, com som
node $M conferir --rascunho                       # tudo o que se mede, numa lista só
flock /home/claude/trabalho/render.lock -c "node $M definitivo"   # o vídeo final, 1080 × 1920
node $M capa                                      # a capa (o @abertura do peca.json)
node $M conferir                                  # a conferência do vídeo final
node $M entregar                                  # confere os arquivos e escreve a mensagem para ele
```

Na máquina do Claude, o rascunho e o definitivo rodam dentro do `flock`, como acima, porque outras frentes também renderizam.

A peça de exemplo também roda assim: `node $M novo teste --de /home/claude/trabalho/reel-tipo-antes-depois/entrega/exemplo-polio`.

## O que tem aqui

| pasta ou arquivo | o que é |
|---|---|
| `molde/` | os arquivos que o chat copia e preenche. O que se troca está marcado com `TROQUE` ou entre parênteses no textos.txt |
| `exemplo-polio/` | a peça de exemplo, só os arquivos dela, sem vídeo |
| `tabela-de-afirmacoes-polio.md` | cada frase do exemplo com a fonte e o trecho que a sustenta |
| `preseme-fatos-polio-antes-depois.md` | o banco de fatos novo, o mesmo gravado no projeto |

As saídas do exemplo ficaram em `/home/claude/trabalho/reel-tipo-antes-depois/trabalho/polio-antes-depois/out/`:

- `folha.jpg`, a folha de quadros;
- `folha-textos.jpg`, a folha de textos;
- `folha-estilos.jpg`, a parada 2 com carimbo ★, lápis e chapado;
- `folha-estilos-todos.jpg`, os seis estilos na capa;
- `polio-antes-depois-draft.mp4`, o rascunho com som.

## Limites que ele precisa saber

- **O texto.** O texto do exemplo foi escrito pelo Opus e não é amostra da voz dele.
- **Os fatos.** Vêm de dois documentos (o informe de paralisia flácida do Ministério da Saúde, de 2025, e a Agência Gov de 04/11/2024), mais o que já estava no banco, coletados pelo Opus e a conferir pelo Fable. A explicação de "cobertura vacinal" na frase 10 é do Claude.
- **A gotinha em 1980.** O pedido falava da gotinha, mas as duas fontes não dizem que a campanha de 1980 foi com ela. Por isso a gotinha só aparece no fecho (a troca de 2024, que a fonte diz), e o desenho da campanha não tem gota. Se o Fable achar o trecho, a gotinha volta para a cena da ação.
- **Gancho regional.** Achado e não usado: no informe de 2025, Roraima não notificou nenhum dos 2 casos de paralisia flácida esperados. O dado é da vigilância, não da vacina, pediria explicar a vigilância e pode soar como culpa do serviço do estado. O motivo está no banco.
- **Placa de um lado só.** Nas cenas de um tempo só, a outra metade embaixo do lugar fica vazia. É de propósito: na tela dividida as duas placas cabem inteiras, cada uma do seu lado.
- **O lugar.** O desenho do lugar vai até a borda da tela; o que importa fica de 60 a 940 na largura, porque à direita ficam os botões do Instagram.
- **O tamanho do arquivo.** O rascunho do exemplo tem 14,8 MB e não sobe pelo conector do Drive (até 2,9 MB): ele publica à mão. Só o som dos 2min10 já passa de 4 MB; da imagem, a cena mais pesada é a da ação (o lugar de perto, chegando mais perto devagar, com a gravura por cima).
- **O primeiro rascunho.** A primeira conferência deu 1 erro (2 problemas de texto) e o trecho de 20 s sem corte no porquê. Viraram regras do molde: a palavra de dentro do lugar some quando a cortina a cortaria (`textoNoLugar`), o rótulo da meta da `barra` não passa da área segura, e os cortes para perto (`PERTO`) valem em toda cena.

## A conferência do exemplo (rascunho de 16/11, 04h00)

- **Nenhum erro.** O texto está em dia; dura 130,00 s (2min10), abaixo do limite de 175 s; toda frase dá tempo de ler.
- **Medidas.**
  - qa: 146 quadros, 0 problemas;
  - cores: 16 quadros, nada fora da paleta;
  - som: -16,0 LUFS, pico -2,4 dBFS;
  - ritmo: o maior trecho sem corte tem 11,9 s (o certo: até 12 s).
- **Trocas de música.** As 4 caem em corte, com 33% a 39% da imagem mudando ali; a do depois é a cortina.
- **Um aviso.** O tamanho do arquivo, acima.
