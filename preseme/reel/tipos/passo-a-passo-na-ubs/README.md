# Série "Na UBS, e agora?" · molde do reel

> texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos

Cada peça mostra uma emergência que o aluno pode encontrar numa visita ou na UBS e responde à pergunta "e agora?" com os passos do protocolo, um por vez. O molde fixa as cenas, o tipo de cada cena, o tempo, o visual e o som. De uma peça para outra só muda o tema.

## O que tem aqui

| pasta ou arquivo | o que é |
|---|---|
| `molde/` | os arquivos que o chat copia e preenche. O que se troca está marcado com `TROQUE` ou entre parênteses no `textos.txt` |
| `exemplo-engasgo/` | a peça de exemplo, engasgo no adulto, em lápis. São só os arquivos da peça, sem vídeo |
| `exemplo-pressao/` | a 2.ª peça de exemplo, aferir a pressão na visita, no estilo chapado |
| `tabela-de-afirmacoes-engasgo.md`, `tabela-de-afirmacoes-pressao.md` | cada frase dos exemplos com a fonte e o trecho que a sustenta |

## As cenas do molde

| cena | tipo | o que aparece | frases |
|---|---|---|---|
| situacao | situação | o problema já no primeiro quadro, com a frase na tela aos 0,25 s. Aos 0,3 s algo cai (baque); em 1,2 s salta o "!" (sino) e a imagem fecha um pouco | 2 |
| pergunta | pergunta | o cartão escuro com "E agora?" e o trilho vazio. É a capa | 1 |
| passo1 a passo4 | passo | o desenho do gesto, o trilho com o passo da vez e, no gesto contado, as bolinhas que acendem a cada batida | 2 cada |
| alerta | alerta | a borda Coral: o protocolo muda de rumo | 2 |
| especiais | especial | um cartão por caso, como gestante, bebê ou idoso. O cartão novo empurra o velho para fora e tem outra cor | 2 |
| equipe | equipe | o que fica com quem socorre até a equipe chegar | 2 |
| ligue | ligue192 | o cartão do 192, fixo da série. A frase dele já vem escrita no molde e concorda com o `PACIENTE` (dele, dela) | 2 |
| erro | erro | o gesto errado com o X Coral, e depois o certo | 2 |
| fecho | fecho | responde ao "E agora?" da abertura, com o trilho completo | 1 |

A assinatura da série é o trilho do protocolo, os círculos numerados no alto que vão sendo marcados com ✓.

O corte da série é o close: da 2.ª frase de cada cena em diante, o desenho fecha no detalhe que a frase explica, como o punho na compressão ou o telefone no 192. O ponto de cada close fica em `FOCO`, no `film-2-peca.js`.

O som vem em blocos. A rua fica no fundo da maior parte das cenas, a sirene passa da esquerda para a direita quando a ambulância chega, e há 0,6 s de silêncio antes do "E agora?".

## O que o chat 1 preenche

1. `textos.txt`: as frases da peça. A [01] diz o problema em até 6 palavras, porque é o gancho dos 3 primeiros segundos.
2. `score.js`, só a parte PREENCHER:
   - `ESTILO`: o desenho, do kit de estilos (`lapis`, a cara da série; `giz`, `chapado`, `pixel`, `planta`, `carimbo`).
   - `PACIENTE`: `'ele'` ou `'ela'`. A frase do 192 concorda ("Fique perto dele" ou "dela"), e o `textos` dá ERRO se não concordar.
   - `BPM` e o bloco `ROTEIRO`, com o número das frases e o nome dos gestos. Se um passo tem gesto contado, leva `conta` (quantas batidas) e `rotulo` (a palavra `[Dnn]` que dá nome à conta).
   - `SOM_CONTA`: o som de cada batida da conta (`baque`). Um passo troca o dele com `somConta`: `'bip'`, `{ som: 'bip', vol: 0.55, atraso: 0.18 }` ou `null` (sem som). A pressão usa o bip do aparelho.
3. `film-2-peca.js`: os destaques do texto (`DESTAQUE`), o paciente, o desenho de cada gesto (`GESTO`) e o ponto de cada close (`FOCO`). Se a peça quiser outra agente ou outro estudante, troca a aparência em `ACS` e `ESTUDANTE` (pele, cabelo, roupa): a cena é a mesma.
4. `peca.json`: o título. `mapa-do-som.json`: o clima de cada bloco, se mudar.

O resto é do molde e não muda: `film-1-molde.js`, `film-3-filme.js`, `index.html` e `peca.js` (a conferência do 192).

### A cor de desenho novo

O molde pinta pelo papel da cor, e não pelo nome, para a peça sair em qualquer estilo (na lousa, uma linha Floresta some no fundo). No `film-2-peca.js`:

- o que fica sobre o fundo: `COR.tinta` (contorno e linha), `COR.texto` (letra), `COR.cartao` (cartão, balão), `COR.apoio` (o claro que se destaca do fundo, como a janela), `COR.chao`, `COR.destaque`, `COR.alerta`;
- o que fica por cima de uma cor: `B.sobre(cor)`, que dá a escura sobre cor clara, Papel sobre cor escura e Noite sobre Coral. Exemplo: `txt(ctx, '5', x, y, { color: B.sobre(C.marca) })`;
- a paleta pelo nome (`C.coral`, `C.folha`...) fica para o que é sempre daquela cor, como a roupa e o Coral do alerta;
- a roupa passa por `B.vestir({...})`: na lousa, o sapato escuro vira claro para não sumir no chão.

## Como se faz uma peça, na prática

Rode os comandos do motor do reel (`preseme/reel/motor/preseme.js`, no ig-midia) de dentro da pasta da peça. No exemplo abaixo, `preseme.js` é esse caminho:

```
node preseme.js novo na-ubs-convulsao --de <esta pasta>/molde   # monta a peça a partir do molde
node preseme.js textos                                          # lê o textos.txt e mostra a duração e a leitura
node preseme.js quadros                                         # folha de quadros, um por cena
node preseme.js folha-textos                                    # um quadro por frase, com ela inteira na tela
node preseme.js som                                             # a música e os efeitos
node preseme.js rascunho                                        # vídeo em meia resolução, com som (rodar em segundo plano)
node preseme.js conferir --rascunho                             # tudo o que se mede, numa lista só
node preseme.js definitivo                                      # o vídeo final (rodar em segundo plano)
node preseme.js capa @pergunta                                  # a capa
node preseme.js entregar                                        # confere os arquivos e escreve a mensagem para ele
```

Na máquina do Claude, o rascunho e o definitivo rodam dentro de `flock /home/claude/trabalho/render.lock -c '<comando>'`.

A peça de exemplo também roda assim: `node preseme.js novo teste --de exemplo-engasgo`. Ela dá 2min34, com 13 cenas a 100 batidas por minuto.

## Estilo

O estilo da série é lápis no papel (`ESTILO: 'lapis'`), e o molde desenha com o kit de estilos: a cor e a letra de cada papel saem do kit, e a textura de papel só entra no lápis. Para mostrar outros estilos na parada 2, rode `node preseme.js estilos @passo3 lapis,giz,chapado` (sai `out/folha-estilos.jpg`, o mesmo quadro em cada estilo). Para trocar o da peça, mude o `ESTILO` no `score.js`. A outra série, Doença de Roraima, usa giz na lousa: as duas nunca ficam iguais.

## Limites que ele precisa saber

- O exemplo dura 2min34. O guia de roteiro de reel do plugin (reels-script) pede até uns 90 s para tutorial, e até 3 min o vídeo continua sendo recomendado. Para encurtar, a peça pode tirar a cena `especiais` ou a `erro`. O tempo de leitura (2,17 palavras por segundo) não muda.
- O texto do exemplo foi escrito pelo Opus e não é amostra da voz dele.
- Toda frase com fato sai da tabela de afirmações. Afirmação sem trecho de fonte sai da peça.
