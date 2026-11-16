# Motor "linha do tempo" · reel que responde uma pergunta contando a história em datas

> texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos

O reel abre com uma pergunta. Uma linha com os anos atravessa a tela, e a câmera anda por ela, de data em data. Em cada data (o marco), um cartão desenhado mostra o que aconteceu, por quê e o que mudou para quem está numa UBS hoje. No fim, a câmera pula o salto da linha (//) até hoje e depois se afasta para a linha inteira, com o verbo de cada data: a resposta.

O andar da câmera pela linha é a explicação. Quem assiste vê o tempo passando (o ano em cima da linha rola na viagem: 1986, 1987, 1988) e vê que uma coisa levou à outra.

Serve para tudo que tem história em datas: como o SUS nasceu, a história da vacina da pólio no Brasil, o calendário de vacinação mudando, a atenção básica de 1994 (PSF) até a ESF, a epidemia de uma doença em Roraima ano a ano. Política fica de fora: nem partido, nem governo, nem presidente, nem crítica.

## O que tem aqui

| pasta ou arquivo | o que é |
|---|---|
| `molde/` | os arquivos que o chat copia e preenche. O que se troca está marcado com `TROQUE` (no `score.js` e no `film-2-peca.js`) ou entre parênteses (no `textos.txt`). Roda sozinho, com cartões provisórios |
| `exemplo-nascimento-do-sus/` | a peça de exemplo, "Quem decidiu que a UBS atende qualquer pessoa?". Só os arquivos da peça, sem vídeo |
| `tabela-de-afirmacoes-nascimento-do-sus.md` | cada frase e cada palavra do desenho do exemplo, com a fonte e o trecho que a sustenta |

O banco de fatos do exemplo está no projeto: `claude/preseme-fatos-nascimento-do-sus.md`.

## O reel que ele dá

| cena | o que aparece | som |
|---|---|---|
| pergunta | a pergunta grande (é a capa), com a cena de hoje no cartão: no exemplo, Seu Antônio chegando à UBS. Na 2.ª frase, a câmera se afasta e os anos aparecem um a um | um tique por ano |
| marco (um por data) | a câmera viaja até o ano, e o ano em cima da linha rola no caminho; o cartão da data muda a cada frase da cena | um sopro na viagem, um pop na chegada |
| presente | a câmera pula o salto da linha e volta para hoje, com o efeito na UBS | sopro e pop |
| fecho | a linha inteira de novo; cada marco ganha o seu verbo (propôs, garantiu, organiza...) | um pop por verbo; silêncio antes da resposta |

De perto, só aparece o marco que está no meio da tela: o vizinho some antes de chegar à borda, e nada fica cortado. A distância entre duas datas pode virar uma cota de planta ("3 meses"), quando ela é um fato da peça. De longe, os anos não se encostam: o texto que bateria no vizinho sobe (ou desce) um andar, com um tracejado até o ponto.

A duração sai do texto, como em todo reel do motor: 2,17 palavras por segundo, mais 0,5 s, nunca menos de 4 batidas. A viagem da câmera vem antes da frase, e o tempo de ler não perde nada. O molde vazio (3 marcos, 12 frases) dá 1min21; o exemplo (4 marcos, 19 frases) dá 2min29.

## Por que dois reels deste motor não saem iguais

- O assunto e o número de marcos mudam a linha: de 2 a 6 datas; datas perto no tempo ficam perto na linha (`dist`), e a distância pode ganhar cota.
- Cada cartão é desenhado para a peça. No exemplo: a multidão da conferência, os dois blocos que se separam (sistema único e previdência), o livro da Constituição com as abas dos artigos, o escudo da prevenção na frente da cruz do tratamento, o mapa de Roraima, a lei com o artigo riscado e o carimbo VETADO, o calendário de 4 anos, a lupa sobre o dinheiro, a balança dos usuários, a mesa do conselho.
- O estilo troca com uma palavra (`ESTILO` no `score.js`), e o mesmo desenho sai em planta técnica, carimbo, giz, lápis ou chapado. O padrão deste motor é a planta técnica ★: a linha vira régua e a distância vira cota. Os outros motores já usam carimbo (caminho), planta (escada), lápis (um dia) e chapado (comparação, meme, mito): nenhum dos quatro estava livre, e ficou a planta, porque a cota é a medida entre duas datas e porque o motor parecido com este, o do caminho, já é de carimbo.
- O som muda por bloco de cenas (o clima de cada bloco, no `mapa-do-som.json`).

## O que é do molde e o que a peça preenche

| arquivo | quem escreve | o que tem |
|---|---|---|
| `film-1-molde.js` | molde | a linha, os pontos, o salto, os anos (que rolam na viagem), os rótulos, a câmera, a vista de longe, o fecho, a frase e as ajudas dos cartões (`LINHA.KIT`) |
| `film-3-filme.js`, `index.html` | molde | o filme e a ordem dos arquivos |
| `score.js` | molde, menos o bloco PREENCHER | os tempos (leitura, viagens, o tique, o sopro, o pop) |
| `score.js`, bloco PREENCHER | chat 1 | `BPM`, `ESTILO`, `MARCOS`, `HOJE`, `ROTEIRO` |
| `textos.txt` | chat 1 | as frases e as palavras do desenho |
| `film-2-peca.js` | chat 1 | `DESTAQUE` (o marca-texto de cada frase) e o desenho de cada cartão (`CARTAO[id]`) |
| `peca.json`, `mapa-do-som.json`, `legenda.txt` | chat 1 | o título, as cores de gente, o som e a legenda |
| `assets/rr.json` | molde | o mapa de Roraima com os 15 municípios (IBGE), para `mapaRR` |

As ajudas do molde para desenhar o cartão (`const { ap, tf, texto, chao, pessoa, gente, documento, mapaRR } = M.KIT`):

- `ap(info, f)`: o quanto algo ligado à frase f já entrou (0 a 1);
- `tf(info, f)`: há quantos segundos a frase f está na tela;
- `texto(...)`: texto dentro do cartão, que anda para dentro se fosse passar da borda;
- `chao`, `pessoa`, `gente(i)`: o chão, a gente do kit e roupa e pele variadas;
- `documento(...)`: uma lei ou relatório com as linhas em traço;
- `mapaRR(...)`: o mapa de Roraima.

Regras do cartão: letra de 36 para cima (menor que isso não se lê no celular), e letra em cima de preenchimento claro com `cor: 'floresta'`, para se ler também na lousa.

## O que o chat 1 preenche, com uma linha do exemplo

- `textos.txt`, uma frase por linha e as palavras do desenho:
  `[10] Setembro de 1990, a Lei 8.080 diz como o SUS promove, protege e recupera a saúde.` e `[D03] set. 1990`
- `score.js`, bloco PREENCHER, um marco e a cena dele:
  `{ id: 'm1990a', ano: 'D03', rotulo: 'D08', cota: 'D21', dist: 440 }` e
  `{ id: 'm1990a', tipo: 'marco', linhas: [10, 11], efeitos: [{ frase: 11, em: 0.45, som: 'baque', vol: 0.9 }] }`
- `film-2-peca.js`, o desenho do cartão (no exemplo, a lei com o artigo vetado, encurtado):

```js
C.m1990a = (ctx, box, st, info) => {
  const ys = documento(ctx, 110, 34, 560, 472, D('D08'), { linhas: 5, tam: 50 });
  if (ap(info, 1) > 0) E.carimbo(ctx, D('D14'), 460, ys[2] + 120, { k: U.clamp((tf(info, 1) - 0.3) / 0.16, 0, 1) });
};
```

- `peca.json`: o título (a pergunta) e quantas frases e palavras o texto traz;
- `mapa-do-som.json`: o clima de cada bloco, os fundos e as coisas que passam;
- `legenda.txt`: com os guias caption-writer, instagram-seo e hashtag-strategy.

## Os comandos, do molde à entrega

De dentro da pasta da peça. `M` é o motor; vídeo só com a trava da máquina (`flock`).

```
M=/home/claude/ig-midia/preseme/reel/motor/preseme.js
node $M novo <pasta-da-peça> --de /home/claude/trabalho/reel-tipo-linha/entrega/molde
cd <pasta-da-peça>
#   o chat 1 preenche textos.txt, score.js (PREENCHER), film-2-peca.js, peca.json, mapa-do-som.json e legenda.txt
node $M textos --tabela                              # formato, duração e tempo de leitura
node $M quadros                                      # folha de quadros: abrir out/folha.jpg com Read
node $M estilos @<marcador> planta,carimbo,giz       # folha da parada 2, o padrão em A
node $M folha-textos                                 # a folha de textos, para ele editar
node $M som                                          # a trilha (out/music.wav)
flock /home/claude/trabalho/render.lock -c "node $M rascunho"
node $M conferir --rascunho
flock /home/claude/trabalho/render.lock -c "node $M definitivo"
node $M capa @abertura
node $M conferir
node $M entregar
```

## O exemplo: como o SUS nasceu

"Quem decidiu que a UBS atende qualquer pessoa?" Quatro datas: a 8ª Conferência Nacional de Saúde (março de 1986), a Constituição (1988, arts. 196 e 198, e a mesma Constituição transformando Roraima em estado), a Lei 8.080 (setembro de 1990, com o artigo da conferência e do conselho vetado) e a Lei 8.142 (dezembro de 1990, que traz os dois de volta). Hoje, Seu Antônio é atendido e tem lugar no conselho de saúde. O fecho responde com os verbos e deixa a dica de prova (8.080 organiza; 8.142, participação e dinheiro).

19 frases, 35 palavras de desenho, 2min29, planta técnica. A peça escreveu 27.240 caracteres além do molde; quase tudo (20 mil) são os desenhos dos cinco cartões. O molde tem quase 30 mil caracteres (29.941) que nenhuma peça reescreve.

## O que eu conferi (16/11/2026, no exemplo)

- `conferir --rascunho`: nenhum erro e 7 avisos. Passaram: o texto em dia; 2min29, abaixo do limite de 175 s; as 19 frases com tempo de ler; qa em 167 quadros, sem problema; cores em 19 quadros, nada fora da paleta; 540 × 960, 30 quadros por segundo, H.264 yuv420p, 148,69 s; volume −16,0 LUFS e pico −1,4 dBFS; primeiro movimento em 0,97 s, primeiro som em 0 s, primeiro texto em 0,25 s e 2 batidas nos 3 primeiros segundos.
- Os avisos. Um é o tamanho do rascunho (9,9 MB, acima dos 2,9 MB do conector do Drive). Os outros seis vêm da medida de corte do motor: ela só conta como corte a troca brusca de 12% a 25% da imagem de um quadro para o seguinte, e este motor anda de câmera, sem corte seco (a maior troca, na planta, é de 7,9%). Por isso saem "maior trecho sem corte: 148,7 s" e as 5 trocas de música "sem corte". Para quem assiste, o desenho muda a cada frase (de 5 a 13 s) e a câmera viaja a cada data.
- Folhas abertas e refeitas com nome novo: a de quadros 6 vezes (o vizinho cortado na borda e encavalado, letra pequena no cartão, os anos de longe colados, texto cortado na borda do cartão, o contador de anos em cima do cartão), a da parada 2 3 vezes (o ano e o rótulo encostando no cartão no carimbo e no giz; letra clara em fundo claro no giz) e a de textos 2 vezes.
- O molde vazio roda: `novo --de molde`, `textos` e `quadros` saem com 12 frases, 1min21 e os cartões provisórios.
- Os fatos: as 19 frases e as 35 palavras do desenho estão na tabela, cada uma com a fonte e o trecho.

## Limites (no motor e no kit; não mexi neles)

- Kit de estilos, só na planta: `E.chao` e `E.destaque` pintam com transparência fixa (`ctx.globalAlpha = 0.55` e `0.85`) e não respeitam a do quadro. O chão não some junto com o cartão, e o marca-texto aparece cheio enquanto a frase ainda entra. O molde contorna: o cartão tem o próprio chão (`chao`), e o destaque só entra com o texto já meio visível.
- Motor, `textos --tabela`: a coluna "entra" mostra o começo do item, que inclui a viagem da câmera; a frase aparece depois dela. O `conferir` e a folha de textos usam o instante certo (`S.linha`).
