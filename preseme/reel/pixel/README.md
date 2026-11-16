# PRESEME · motor de pixel art

> Saiu do reel "A casa 12" (14/11/2026), em 16/11/2026. O motor é a parte que todo vídeo em pixel art repete; a peça traz só o roteiro e as cenas dela.

**Regra de variedade:** pixel art é um dos estilos do perfil, não o padrão. O estilo de cada peça se escolhe na proposta, pelo que o tema pede; o motor de pixel só entra quando a proposta pediu pixel art.

## O que é do motor e o que é da peça

| Do motor (pasta `pixel/`, igual em todo vídeo) | Da peça (pasta `pecas/<nome>/`) |
|---|---|
| a tela pequena (216 × 384) ampliada 5 vezes para 1080 × 1920, a 30 quadros por segundo | `roteiro.json`: o texto, a ordem e o tempo de cada momento |
| os cenários prontos e os bonecos (lista abaixo) | `peca.py`: a coreografia de cada cena (quem anda, o que pisca, que som toca) |
| as transições: afasta, aproxima, desliza, funde | os rótulos soltos da peça (o texto deles fica no roteiro) |
| a camada de texto: cartão de cima, papel que sobe e se escreve, pergunta em destaque, ficha, contador, Nota com carimbo | `mapa-do-som.json` (opcional): o som para o motor do reel |
| a capa, a folha de momentos, o vídeo com trilha, o textos.txt, os cortes | a legenda (no roteiro) |

Exemplo: no `exemplo-minimo`, a rua com as casas é do motor (`cenarios.bairro`); o agente que anda até a casa 7 e marca as casas por onde passa é da peça (`pecas/exemplo-minimo/peca.py`, função `cena_rua`).

## Como rodar

De dentro desta pasta. Só precisa de Python com Pillow e numpy, do ffmpeg e das duas letras (Pixelify Sans e Press Start 2P, licença OFL, em `~/.fonts`; o comando `dados` baixa as duas do repositório google/fonts se faltarem). `-I` é o modo isolado do Python (não carrega nada da pasta atual por engano).

| Comando | O que faz | Quanto leva (2 núcleos) |
|---|---|---|
| `python3 -I pixel/motor.py dados` | baixa os mapas oficiais e as letras (uma vez por máquina; abaixo) | 3 s |
| `python3 -I pixel/motor.py novo pecas/<nome>` | cria a peça copiando o `exemplo-minimo` | 0,1 s |
| `python3 -I pixel/motor.py quadros pecas/<nome> 1.5 4:0.5 #120` | desenha só os quadros pedidos → `out/q*.png` e `out/quadros.png` | 0,1 a 0,2 s por quadro |
| `python3 -I pixel/motor.py folha pecas/<nome>` | a cena inteira (passada 1), a capa e a folha com um quadro de cada momento que tem texto → `out/folha-momentos.png` | 2 s para 20 s de vídeo |
| `python3 -I pixel/motor.py video pecas/<nome>` | tudo: cena, texto, trilha, MP4, capa, folha, legenda, textos.txt e cortes | 14 s para o exemplo (19 s de vídeo); 6 min para o "A casa 12" (6 min de vídeo) |
| `python3 -I pixel/motor.py texto pecas/<nome>` | refaz só o texto e o vídeo, sem redesenhar a cena (palavra trocada, mesmo tempo) | quase o mesmo do `video` (a cena é a parte rápida) |
| `python3 -I pixel/motor.py capa pecas/<nome>` | a capa e o recorte 3:4 da grade do perfil (`out/capa-grade.jpg`) | 1 s |
| `python3 -I pixel/motor.py textos pecas/<nome>` | gera o `out/textos.txt` (o texto da tela, para ele editar) | 0,1 s |
| `python3 -I pixel/motor.py textos pecas/<nome> --aplica <arquivo>` | põe no roteiro o textos.txt que ele devolveu e diz o próximo passo | 0,1 s |
| `python3 -I pixel/motor.py cortes pecas/<nome>` | `out/cenas.json` (o formato do motor do reel) e `out/cortes.json` (cada momento) | 0,1 s |
| `python3 -I pixel/motor.py para-reel pecas/<nome>` | monta a pasta da peça para o motor do reel (abaixo) | 1 s |

Instantes, no `quadros`: segundos do vídeo final (`12.5`), número do quadro do roteiro (`#1234`), momento e fração dele (`3:0.4` = o momento 3, a 40 % do caminho) ou quadro da abertura (`ab66`, `ab:0.5`).

Opções: `--saida <pasta>` (padrão: `pecas/<nome>/out`), `--brasao <arquivo>` (abaixo), `--dados <pasta>` (os mapas), `--som <arquivo.wav>` (som pronto no lugar da trilha, para o vídeo inteiro), `--destino <pasta>` (do `para-reel`), `--forca` (aplica textos.txt de outra versão do roteiro), `--sem-abertura` (o vídeo sem a abertura da peça, para comparar com uma versão antiga).

Vídeo inteiro é render longo: na máquina do Claude, rodar dentro de `flock /home/claude/trabalho/render.lock -c '<comando>'` (um render por vez).

## As peças

- `pecas/casa12`: o reel "A casa 12", versão 3 de 14/11 (a abertura e o vídeo da versão 2), a que ele tem para publicar. `python3 -I pixel/motor.py video pecas/casa12 --brasao <arquivo>` refaz o vídeo inteiro (6min06); `--sem-abertura` faz a versão 2 (6min02). Tem 6 minutos: acima do limite de 3 minutos do motor do reel, que trava no `conferir`.
- `pecas/exemplo-minimo`: a peça de teste (19 s, texto neutro, não vai ao ar) e o modelo que o `novo` copia.

## A pasta de uma peça

```
pecas/<nome>/
  roteiro.json       o texto, a ordem e o tempo (o chat 1 escreve)
  peca.py            as cenas desta peça (funções do tempo)
  mapa-do-som.json   (opcional) o som pelo motor do reel; sem ele, o para-reel põe o modo trilha
  out/               saídas (não vai para o repositório)
```

O `roteiro.json`, por partes (o `pecas/exemplo-minimo/roteiro.json` é o modelo pequeno; o `pecas/casa12/roteiro.json`, o grande):
- `nome`, `arquivo` (o nome do MP4), `clima` e `semente` (a trilha: clima `curioso`, `calmo`, `brincalhao` ou `serio`; a mesma semente dá a mesma música), `legenda`.
- `cenas`: para cada cena, o `papel` (caderneta, prancheta, prontuario, relatorio, mapa, caderno, polo, bilhete, cartao), o `nivel` (a palavra no alto do papel) e a `fase` (as caixinhas de fase; `"hud": false` desliga as caixinhas).
- `beats`: os momentos, em ordem. Cada um tem `cena` e `acao` (o nome que o `peca.py` recebe) e o que aparece: `topo` (o cartão de cima; fica até ser trocado; `*` no começo da linha pinta a linha inteira), `fala` (o texto do papel; `*trecho*` = marca-texto), `lista`, `pergunta`, `ficha`, `contador`, `nota` (com `carimbo`), `capa: true` (o momento da capa). Transição: `{"cena": "trans", "de": "casa", "para": "rua", "modo": "afasta", "alvo": [x0, y0, x1, y1]}` (o `alvo` é o retângulo da cena de chegada onde a de saída cabe).
- `dur` (segundos). Sem ela, o tempo sai do `ritmo`: `base + por_palavra × palavras`. Sem `ritmo`, vale a regra de leitura do projeto (palavras ÷ 2,17 + 0,5 s com a frase inteira na tela): 1,7 s + 0,46 s por palavra.
- `fichas`, `contador`, `rotulos`: as palavras de dentro do desenho (entram na parte 2 do textos.txt).
- `usa_brasao` e `usa_mapa`: avisam o motor de que a peça precisa do brasão e dos mapas.
- `abertura` (opcional): o problema em destaque antes do primeiro momento, como no "A casa 12" versão 3. A cena escurece em xadrez, menos a `janela` (o retângulo da tela grande que fica aceso, com moldura); a frase do primeiro cartão (`topo` do primeiro momento) salta num balão Coral e no fim sobe e vira o cartão de cima. Sem música; os `sons` são do tempo da abertura. Exemplo: `"abertura": {"dur": 4.4, "janela": [175, 625, 924, 1124], "sons": [{"t": 0.12, "som": "baque"}]}`. No vídeo final, tudo o que é do roteiro acontece `dur` segundos mais tarde; o `cortes` e o `para-reel` já contam isso.

O `peca.py`: cada cena é uma função `cena(acao, u, dur, feitas, t)` que devolve a tela pequena do quadro. `u` = segundos dentro do momento; `dur` = a duração dele; `feitas` = as ações que já passaram nesta cena; `t` = o tempo do vídeo. O fim do arquivo diz `CENAS = {"casa": cena_casa, ...}`. Ferramentas: `memo(chave, f)` (desenha o cenário parado uma vez só), `ev(chave, som, volume)` (um efeito no quadro em que acontece: pop, tique, sopro, gota, sino, certo, baque, lapis), `pisca(t)`, `sm(x)` (movimento que começa e acaba devagar). Opcionais: `rotulos(fr, d, e, u, r)` (escreve rótulos na tela grande) e `fracao(e)` (o instante de cada momento na folha).

## A biblioteca (pasta `pixel/`)

- `nucleo.py`: as 7 cores da paleta, a tela pequena, os bonecos (ACS, MINI, DOT; cores por profissão), balão de alerta, marca de feito, casa vista de cima, árvore, rua, tracejado, moldura, as quatro transições.
- `cenarios.py`: casa (moradia), rua (microárea, com a agente), bairro (a mesma rua sem ninguém), área (equipe e UBS), cidade (distrito), mapa de Roraima com os contornos oficiais e as terras indígenas, aldeia, polo-base, UBS por dentro, adscrição. Elementos: palmeira, maloca, malocão, casa de palha, rede, rádio, barco, voadeira, cruz, caixa de vacina, marcas do mapa.
- `letras.py`: as letras (Pixelify Sans, e os números em Press Start 2P), o cartão de cima, as caixinhas de fase, a etiqueta (chip), o contador, a ficha, o carimbo e o brasão em pixel.
- `papeis.py`: os 9 papéis e a Nota.
- `camada.py`: a passada 2 (o texto por cima da cena, quadro a quadro) e a abertura.
- `montador.py`: a linha do tempo, as duas passadas, a capa, a folha, o vídeo, o textos.txt, os cortes e a pasta para o motor do reel.
- `motor.py`: os comandos.
- `preseme-trilha.py`: a trilha (cópia exata de `claude/preseme-trilha.py` do projeto).

Dois consertos da letra Pixelify, que valem para toda peça: o C maiúsculo, que em letra pequena fechava e virava O (o motor abre a boca do C de novo), e a ligadura "fi", que parecia um A (o motor desliga as ligaduras).

## O brasão da UFRR (não fica no repositório)

O brasão é o arquivo do projeto PRESEME `075f8d6a-a8f4-4740-a129-0c6cfce57913 1 1 1 1.png`. Num chat do projeto, baixe com a ferramenta Projects (`project_read` desse nome: ela devolve o caminho do arquivo baixado) e passe na hora: `--brasao <caminho>`. O motor lê o arquivo, reduz a pontos na memória e não grava cópia. Nenhum desenho do brasão está no código. Sem `--brasao`, a Nota e o cartão saem sem ele (o título fica no lugar) e o motor avisa.

## Os mapas (não ficam no repositório)

O mapa de Roraima usa três arquivos públicos, 3,2 MB juntos (acima do limite de 1 MB para guardar aqui). `python3 -I pixel/motor.py dados` baixa os três para `~/.cache/preseme-pixel/dados`:
- `rr-mun.json` (196 KB) e `am-mun.json` (858 KB): os municípios de Roraima e do Amazonas, malha do IBGE, do repositório tbrugz/geodata-br.
- `ti.gpkg` (2,1 MB): as terras indígenas da FUNAI, versão simplificada de 2021, do pacote geobr (IPEA).

Peça com `"usa_mapa": true` para com aviso se os mapas não estiverem lá.

## Com o motor do reel (o som em blocos, a conferência e a entrega)

O vídeo em pixel sai pronto com a trilha própria (`video`). Para a música mudar de cena em cena, o som de lugar, a conferência e a mensagem de entrega, a peça passa pelo motor do reel como "vídeo de fora":

```
python3 -I pixel/motor.py para-reel pecas/<nome>                          monta out/reel/<nome>/
node <motor do reel>/preseme.js textos  --peca pecas/<nome>/out/reel/<nome>
node <motor do reel>/preseme.js som     --peca ...                         a música pelo mapa-do-som.json
node <motor do reel>/preseme.js juntar  --peca ...                         o MP4 final
node <motor do reel>/preseme.js conferir --peca ...
node <motor do reel>/preseme.js entregar --peca ...
```

A pasta montada traz `peca.json` (`"motor": "externo"`), `textos.txt`, `cenas.json`, `mapa-do-som.json`, `legenda.txt`, `out/video.mp4` (a imagem sem som) e a capa deste motor (`out/capa-<nome>.png`). Não rode o `capa` do motor do reel nela: ele tira um quadro do vídeo e troca a capa com o título grande por esse quadro.

No `cenas.json`, cada cena vai de corte a corte. O corte numa transição é o quadro do meio dela, onde a imagem mais muda. A transição `funde` é um dissolve e não tem corte: troca de música só em `afasta`, `aproxima`, `desliza` ou em duas cenas seguidas sem transição. Cena que volta mais tarde ganha número (`mapa`, `mapa-2`), para o som de cada vez ser escolhido à parte. A abertura, quando há, é a cena `abertura`: no modo blocos, deixe-a fora dos blocos (fica sem música, como no vídeo deste motor).

## Trocar uma palavra

1. `textos pecas/<nome>` gera o `out/textos.txt`. Ele edita só o que vem depois do número e devolve.
2. `textos pecas/<nome> --aplica <devolvido.txt>` põe no roteiro (guarda o roteiro de antes em `out/roteiro-antes.json`) e diz o próximo passo: `texto` (o tempo não mudou: só a passada 2 e o vídeo) ou `video` (o tempo de algum momento mudou).
3. Se a peça vai pelo motor do reel: `para-reel` de novo, e lá `som`, `juntar`, `conferir`.

O textos.txt tem a mesma forma do motor do reel (`[01] frase` e `[D01] palavra de dentro do desenho`), então o `compara` de lá funciona com ele. A linha "assinatura" diz de qual versão do roteiro o arquivo saiu: o `--aplica` recusa arquivo de outra versão (a não ser com `--forca`).

## Testes

- `python3 -I testes/regressao.py --brasao <arquivo>`: desenha 44 quadros do "A casa 12" (8 sorteados, 22 que passam por toda cena e peça, 14 da abertura) e compara com os do código original (`testes/casa12-esperado.json`). Rodar depois de mexer em qualquer arquivo da pasta `pixel/`. Leva uns 5 s.
- `relatorio-teste.txt`: as duas provas de 16/11 (a regressão do "A casa 12" e a peça nova `exemplo-minimo`), com os números.
