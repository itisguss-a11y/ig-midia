# PRESEME · motor do reel

> Contrato fechado em 15/11, 23h40: a pasta de uma peça, o formato do `mapa-do-som.json`, o formato do `cenas.json` (vídeo de fora do animation-studio) e o nome de cada comando. Mudança nesses pontos só se for preciso, com aviso aqui no topo e a hora.
>
> **16/11, 00h41: só acréscimos; nenhum nome nem formato mudou.**
> 1. Em `coisas` (mapa-do-som.json), há a opção nova `abaixa`: quantos dB a música e o lugar abaixam enquanto a coisa toca. O padrão é 8 na coisa que anda e 0 na coisa parada. Assim, sem mexer no mapa, toda coisa que anda já abaixa a música 8 dB e sai mais alta no som do que saía antes.
> 2. O `folha-textos` também funciona em peça de fora.
> 3. O `juntar` numa peça de fora recomprime a imagem quando ela não vem em H.264 yuv420p a 30 quadros.
> 4. O `conferir` passou a conferir o H.264 yuv420p.
> 5. O `trecho` agora emenda sem recomprimir o resto do vídeo.

O motor é a parte de todo reel que não muda de uma peça para outra: o texto da tela, o som, a conferência, a capa e a entrega. O desenho continua sendo de cada peça (é ali que mora a variedade que ele cobra). O motor de desenho é o animation-studio, plugin instalado; um vídeo feito por outro programa (o motor de pixel art, por exemplo) também passa pelo `textos`, `folha-textos`, `som`, `juntar`, `capa`, `conferir`, `compara` e `entregar`.

Como rodar: de dentro da pasta da peça, `node <motor>/preseme.js <comando>`, ou de qualquer lugar com `--peca <pasta>`. Só precisa do que o ambiente já tem: Node 22, ffmpeg, Python com Pillow e numpy, e o Chrome que o animation-studio usa. Nada de npm nem de pip.

## O que é do motor e o que é da peça

| Do motor (igual em todo reel) | Da peça (o chat 1 escreve) |
|---|---|
| ler o textos.txt, conferir o formato, gravar o textos.js | o textos.txt |
| a regra de leitura (palavras ÷ 2,17 + 0,5 s) e a conferência dela | as cenas e as frases de cada uma (score.js) |
| a folha de quadros, a folha de textos, o rascunho, o trecho, o definitivo | o desenho (film-*.js) |
| a música por clima, o banco de sons de lugar, o silêncio, o volume de celular | o mapa-do-som.json (que clima, que lugar, que coisa, onde calar) |
| a capa e o recorte da grade | qual marcador é a capa (peca.json) |
| as medidas (qa, cores, volume, pico, ritmo, tamanho, trocas nos cortes) | as cores além da paleta (peca.json) e a conferência só dela (peca.js) |
| as mensagens de entrega | a legenda.txt |

## Os comandos

| Comando | O que faz | Quanto leva (2 núcleos) |
|---|---|---|
| `novo <pasta> [--de <pasta>]` | monta a peça: projeto 9:16 do animation-studio (engine/), as pastas e os arquivos da peça (`--de`: copia os de uma peça já escrita, ex.: a do repositório; sem `--de`, o modelo do motor) e já roda o `textos` | 1 s |
| `textos [arquivo.txt] [--tabela]` | lê o textos.txt (ou o arquivo dado, que passa a ser o textos.txt), aponta o que está fora do formato, grava o textos.js, roda a conferência da peça (peca.js) e mostra a duração e quem não dá tempo de ler. `--tabela`: os tempos de cada frase | 0,2 s |
| `folha-textos` | a folha de textos (decisão 115): um quadro pequeno por frase, no instante em que ela está inteira na tela → out/folha-textos.jpg. Peça de fora: os quadros saem do out/video.mp4, nos tempos das `frases` do cenas.json | 24 s para as 32 frases do sus-hoje |
| `quadros` | a folha de quadros (um por marcador) → out/board.png e a cópia reduzida out/folha.jpg, para abrir com Read | 4 s |
| `estilos <instante> [a,b,c] [--todos]` | a folha da parada 2 (decisão 116): o mesmo quadro em três estilos do kit, rotulados A ★, B e C → out/folha-estilos.jpg. O instante aceita segundos, @marcador ou [NN]. Só na peça que carrega o kit (`motor/estilos`, ver o README de lá); o `novo` copia o kit para a peça cujo index.html tem a linha dele | 12 s para três estilos |
| `som` | o som pelo mapa-do-som.json → out/music.wav, entre -17 e -15 LUFS; mostra os blocos, os lugares, as coisas (e se cada coisa que anda muda mesmo de lado no fone), o silêncio e as medidas | 8 a 22 s |
| `rascunho` | o vídeo inteiro em meia resolução, com som (faz o som antes, se o texto ou o mapa mudou), e o ritmo → out/<nome>-draft.mp4. Rodar com run_in_background | 8 min 30 para 2min44 de vídeo (até 13 min com a máquina ocupada) |
| `trecho <de> <até> [--final]` | refaz só um pedaço do vídeo e emenda pelo número do quadro. O pedaço vai do quadro-chave antes ao quadro-chave depois, com a mesma compressão do vídeo inteiro; o resto do vídeo é copiado sem recomprimir e sai idêntico, bit a bit. Recusa se o tempo total mudou ou se o texto mudou fora do trecho (e diz o que cobrir) | rascunho: 1 min 23 para 3,4 s do sus-hoje; definitivo: 3 min 27 para 4,8 s do exemplo-minimo (já com som e junção) |
| `definitivo` | som, vídeo inteiro em 1080 × 1920, junção e as medidas do animation-studio (check, pacing, qa, verify, ffprobe) → out/<nome>.mp4. Rodar com run_in_background | 5 min 26 para os 14 s do exemplo-minimo; o do sus-hoje não foi rodado (estimativa: 3 a 4 vezes o rascunho) |
| `juntar [--rascunho]` | vídeo de fora: junta out/video.mp4 com out/music.wav → out/<nome>.mp4. A imagem vai como veio se for H.264 yuv420p a 30 quadros; se não for, é recomprimida uma vez. No animation-studio, é o mux dele (depois de mudar só o som) | 1 s copiando; 47 s recomprimindo 14 s; 1 min 28 no mux do animation-studio |
| `capa [@marcador]` | a capa (1080 × 1920) e o recorte 3:4 da grade do perfil (de y 240 a 1680) em out/capa-grade.jpg, para conferir | 1 s |
| `conferir [--rascunho]` | tudo o que se mede, numa lista só: texto em dia, duração e limite, tempo de leitura, qa, cores da paleta, tamanho e quadros por segundo, H.264 yuv420p, duração do arquivo, vídeo mais velho que o texto, volume, pico, MB e o aviso do Drive, ritmo, trocas de música nos cortes. Erro trava; aviso é para olhar | 15 a 50 s |
| `compara <enviado.txt> <devolvido.txt> [--conta]` | o que ele mudou, apagou e escreveu, no formato do caderno da voz | 0,1 s |
| `entregar [rascunho\|folha]` | confere se os arquivos existem e não são mais velhos que o texto, guarda a cópia do textos mandado (out/textos-enviado-N.txt, para o compara) e imprime a mensagem para ele | 0,1 s |

Instantes, onde o comando pede: segundos (`12.5`), marcador do score (`@abertura`, `@abertura+1`) ou frase (`[07]` = quando a frase 7 entra; no fim de um trecho, quando ela sai).

## A pasta de uma peça (animation-studio)

O nome da pasta é o nome da peça: o vídeo sai em `out/<nome>.mp4`.

```
<nome>/
  peca.json          nome, título, limite de duração, capa, cores além da paleta, o que o textos.txt traz
  textos.txt         o texto da tela: "[01] frase" e "[D01] palavra de dentro do desenho" (o arquivo que ele edita)
  score.js           a linha do tempo (o que ele tem de exportar: abaixo)
  film-1-....js      o desenho, em um ou mais arquivos, na ordem do index.html
  index.html         a ordem de carga: engine/util.js, engine/music.js, textos.js, score.js, o resto do engine, film-*.js
  mapa-do-som.json   o som (formato abaixo)
  legenda.txt        a legenda e as hashtags, escritas pelo chat 1
  peca.js            (opcional) a conferência que é só desta peça, ex.: a conta do sus-hoje
  textos.js          gerado pelo motor (não se edita)
  engine/            posto pelo novo (não vai para o repositório)
  out/               saídas (não vai para o repositório)
```

O `score.js` exporta: `FPS`, `FORMAT`, `DURATION`, `BEAT`, `BPM`, `markers`, `S`, `cenas` (cada uma com `id`, `t0`, `t1` e `itens`: `[{ n, t0, t1 }]`, um por frase), `linha` (`{ n: { t0, t1 } }`, quando cada frase está na tela), `efeitos` (`[{ t, som, vol, pan }]`) e `TX` (os textos). O modelo do motor (`motor/modelo/score.js`) já faz tudo isso: o chat 1 só escreve a lista de cenas (`ROTEIRO`). O do sus-hoje (`pecas/sus-hoje-v5`) é o exemplo de uma peça grande.

`peca.json`:
```json
{ "nome": "sus-hoje", "titulo": "Quantas vezes você usou o SUS hoje?", "limite": 175, "capa": "@abertura",
  "cores": ["#C98A62", "#DBA27E", "#A86E4B", "#C9A063", "#2B211E"], "esperado": { "frases": 32, "palavras": 26 } }
```
`limite` (padrão 179,6 s, abaixo de 3 minutos), `capa` (marcador), `cores` (as que a paleta não tem e são de propósito: pele, cabelo, miolo de pão…) e `esperado` (sem ele, o motor compara com o último textos mandado) são opcionais.

O modelo (`motor/modelo`, o que o `novo` põe sem `--de`): `film-1-base.js` (paleta, letras, o texto que se quebra sozinho, o marca-texto, o estado do filme em cada instante), `film-2-cenas.js` (uma função por cena: `PRESEME.CENA[id] = (ctx, st) => { ... }`) e `film-9-filme.js` (o filme; cena sem função sai com a frase sobre o papel, para o vídeo rodar inteiro desde o primeiro dia).

## Vídeo de fora do animation-studio (motor de pixel art e outros)

A pasta leva `"motor": "externo"` no `peca.json` e, no lugar do `score.js`, um `cenas.json` com os cortes:

```
<nome>/
  peca.json          { "nome": "...", "motor": "externo", ... }
  textos.txt         o mesmo formato: "[01] frase" e "[D01] palavra"
  cenas.json         os cortes e os tempos (formato abaixo)
  mapa-do-som.json
  legenda.txt
  out/video.mp4      a imagem, sem som: 1080 × 1920, 30 quadros por segundo (rascunho: out/video-draft.mp4, 540 × 960)
```

`cenas.json` (o que o `som`, o `capa` e o `conferir` esperam):
```json
{
  "duracao": 42.5,
  "fps": 30,
  "bpm": 100,
  "cenas": [ { "id": "abertura", "t0": 0.0, "t1": 6.0 }, { "id": "rua", "t0": 6.0, "t1": 18.4 } ],
  "frases": { "1": { "t0": 0.0, "t1": 3.2 }, "2": { "t0": 3.2, "t1": 6.0 } },
  "efeitos": [ { "t": 6.0, "som": "pop", "vol": 0.8, "pan": 0 } ],
  "marcadores": { "abertura": 1.5, "rua": 9.0 }
}
```
- `duracao` e `cenas` são obrigatórios. As cenas vêm em ordem, uma emendada na outra, da 0 à `duracao`; o `t0` de cada cena é um corte. O motor confere e recusa se não for assim.
- `frases` (quando cada `[NN]` está inteira na tela) serve ao tempo de leitura, ao silêncio "antes da frase" e aos instantes `[NN]`.
- `efeitos`, `marcadores` (a capa e os quadros da conferência de cores; sem eles, o meio de cada cena) e `bpm` (padrão 100) são opcionais.
- Ordem: `textos` (confere o texto), `folha-textos` (os quadros saem do out/video.mp4), `som`, `juntar` (faz out/<nome>.mp4; o áudio que vier dentro do out/video.mp4 é ignorado), `capa`, `conferir`, `entregar`. O qa de texto da tela fica com o motor que desenhou. `quadros`, `rascunho`, `trecho` e `definitivo` são só do animation-studio e recusam com aviso.
- O exemplo está em `exemplo-externo/`. Para testar, ponha lá um `out/video.mp4`, por exemplo o do `exemplo-minimo` depois de um `definitivo`.

## O mapa-do-som.json

Modo trilha (o do sus-hoje até a versão 5: um clima para o vídeo todo, pela `preseme-trilha.py`):
```json
{ "modo": "trilha", "clima": "curioso", "semente": "sus-hoje" }
```
Climas da trilha: `curioso`, `calmo`, `brincalhao`, `serio`. A semente é o nome da peça: a mesma semente dá a mesma música. O andamento sai da semente: se o `BPM` do score.js não bater, o `som` diz o número certo.

Modo blocos (decisões 113 e 122: a música muda no corte, cada lugar com o seu som):
```json
{
  "modo": "blocos",
  "semente": "nome-da-peca",
  "bpm": 100,
  "lufs": -16,
  "blocos": [
    { "cenas": ["abertura"], "clima": "curioso" },
    { "cenas": ["rua", "casa"], "clima": "calmo" },
    { "cenas": ["fecho"], "clima": "festa" }
  ],
  "fundos": { "rua": { "som": "cidade", "vol": 0.35, "seed": 2 } },
  "coisas": [
    { "cena": "rua", "som": "buzina", "em": 1.2, "pan": [-0.8, 0.8], "vol": 0.5 },
    { "cena": "casa", "som": "mosquito", "em": "[07]", "dur": 2.5, "pan": [-0.9, 0.9], "vol": 0.5 }
  ],
  "silencios": [ { "frase": 12, "antes": 0.6 } ],
  "efeitos": true
}
```
- `blocos`: as cenas de cada bloco, em ordem, e o clima: `calmo`, `curioso`, `brincalhao`, `tenso`, `serio`, `festa`. A música do bloco começa no corte da primeira cena e acaba no corte da última (entra em 15 ms, sai em 60 ms). Cena fora de todo bloco fica sem música (aviso). `bpm` padrão: o do score.js.
- `fundos`: o som do lugar, um por cena, do corte ao corte, baixo (padrão 0,35): `floresta`, `cidade`, `mosquito`, `chuva`, `sirene`, `salaDeEspera`, `noite`, `monitor` (banco `preseme-ambiente.js`; som que ele reprovar vira "reprovado" lá e o motor recusa).
- `coisas`: o som do que aparece, no máximo duas por cena (o motor recusa a terceira). `em`: segundos depois do corte da cena, `"[NN]"` (quando a frase NN entra) ou `"@marcador"`. `pan`: `-1` esquerda, `1` direita; `[de, para]` anda de um lado para o outro do fone. Sons: `passaro`, `buzina`, `sapo`, `bip`, `senha`, `mosquito`, `sirene`, `carroPassando` (estes três com `dur`) e os efeitos `pop`, `gota`, `tique`, `sopro`, `sino`, `certo`, `baque`, `lapis`. `abaixa` (opcional): quantos dB a música e o lugar abaixam enquanto a coisa toca (padrão 8 na coisa que anda, 0 na parada; rampa de 150 ms).
- O `som` mede cada coisa que anda duas vezes. Primeiro sozinha: o lado no primeiro terço e no último. Depois no som final, com a música por cima. Ele avisa quando, entre o começo e o fim, o lado muda menos de 3 dB. A medida é direito menos esquerdo, em dB.
  - No exemplo-minimo, o carro deu -6,5 → +6,4 dB sozinho e -2,7 → +2,5 dB no som final.
  - Antes do `abaixa`, no som final, deu -0,5 → +0,9 dB: a música cobria o carro.
  - Se o aviso vier, suba o `vol` da coisa ou o `abaixa`.
- `silencios`: tudo cala (música, lugar, coisas e efeitos) por `antes` segundos antes da frase (padrão 0,5).
- `efeitos`: `true` toca os efeitos do score.js (ou do cenas.json); `false` deixa de fora.
- `fundos`, `coisas` e `silencios` valem também no modo trilha.
- Medidas do modo blocos, no próprio `som`: volume (alvo -16 LUFS), pico, grave abaixo de 100 Hz (o celular não toca; aviso acima de 25%), volume de cada bloco (aviso se um ficar 9 dB abaixo do mais alto) e onde cai cada troca. O `conferir` mede no vídeo se cada troca cai num corte (mais de 12% da imagem mudando ali).

## As ferramentas que o motor chama (motor/ferramentas)

`preseme-trilha.py` (a trilha do modo trilha), `preseme-ambiente.js` (os sons de lugar e de coisa) e `preseme-ambiente-amostra.py` (o vídeo de amostra dos sons), `preseme-folha-textos.py` (a folha de textos), `preseme-textos-compara.py` (o compara), `preseme-cores.py` (a conferência das cores: aponta mancha de cor que não sai da paleta, nem de mistura de duas cores dela, nem dela mais clara ou mais escura) e `preseme-folha-externa.py` (a folha de textos de um vídeo de fora: o mesmo desenho, com os quadros tirados do MP4). As cinco primeiras são cópias exatas das do projeto (`claude/preseme-*`); as duas últimas são novas.

## Os exemplos

- `exemplo-minimo/`: peça do animation-studio com 14,4 s, 3 cenas e o modo blocos. Tem um lugar (`cidade`), um carro que anda de um fone ao outro, uma buzina e um silêncio antes da última frase. Para refazer: `novo <pasta> --de exemplo-minimo` e depois `definitivo`.
- `exemplo-externo/`: a mesma peça como vídeo de fora. Leva `peca.json` com `"motor": "externo"`, `cenas.json`, `textos.txt`, `mapa-do-som.json` e `legenda.txt`, sem o MP4.
- `pecas/sus-hoje-v5/`: a versão 5 do sus-hoje, só para testar o motor. A peça de verdade está no chat dela.

## Testes (16/11)

Os números estão em `relatorio-teste.txt`.
- Prova 1, regressão: o sus-hoje da versão 5 passou pelo motor e bateu com o caminho da passagem, número por número. São iguais textos.js, duração, efeitos, folha de quadros (pixel a pixel), música (byte a byte) e rascunho (o mesmo md5).
- Trecho no rascunho: a frase [14] do sus-hoje foi refeita em 1 min 23. O vídeo tem 4912 quadros; mudaram os 101 do trecho, e os outros 4811 saíram idênticos, bit a bit.
- Trecho no definitivo (`--final`): a frase [02] do exemplo-minimo foi refeita em 3 min 27, já com o mux. Mudaram 192 quadros, e os outros 240 saíram idênticos.
- Prova 2, do zero: o `exemplo-minimo` foi do `novo` ao `entregar` só com comandos do motor. A conferência deu 0 erro e 1 aviso, o tamanho para o Drive.
- Prova 3, vídeo de fora: a imagem do exemplo-minimo, sem o score e com um cenas.json, passou por todos os comandos de peça de fora (`textos`, `folha-textos`, `som`, `juntar` copiando e recomprimindo, `capa`, `conferir`, `compara`, `entregar`).
  - A música saiu igual à do exemplo-minimo: a diferença fica 185 dB abaixo do som.
  - A conferência deu 0 erro e 1 aviso.
  - `quadros`, `rascunho`, `trecho` e `definitivo` recusaram.
