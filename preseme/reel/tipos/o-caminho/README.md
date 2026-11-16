# Motor do reel · tipo "o caminho"

> texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos

Feito na noite de 15 para 16/11/2026 (frente J), por cima do motor do reel (`/home/claude/ig-midia/preseme/reel/motor`) e do kit de estilos, sem mexer em nenhum dos dois.

## O que este motor faz

Faz um reel em que um processo de saúde anda na tela. Uma pergunta abre. Um objeto percorre um caminho desenhado e para em cada etapa. Em cada parada aparece o que acontece ali e por quê, e depois o que pode dar errado e como se previne. A chegada responde à pergunta. O movimento é a explicação.

Serve para qualquer caminho com etapas em ordem. Exemplos: a vacina até o braço (o exemplo pronto), o sangue do exame até o resultado, a notificação até a vigilância, a água até a torneira, o paciente do posto até o hospital.

## Que reel ele dá

- Vertical (9:16), de 1 a 2 minutos. O estilo padrão é carimbo e gravura ★: no alto fica o passaporte, e cada chegada carimba uma casa dele.
- A ordem dos quadros (toda frase nova é um corte):
  1. A pergunta, com o mapa do caminho se desenhando.
  2. O que tem de ser mantido, num cartão com o medidor (no exemplo, o termômetro de 2 °C a 8 °C).
  3. Em cada parada: a viagem (o mundo rola de lado, o veículo leva o objeto, o letreiro do lugar pulsa na chegada e o passaporte ganha o carimbo). Depois, um cartão por cuidado: o medidor sobe até o risco e volta com o visto, ou fica com o X.
  4. A chegada (no exemplo, a vacina entra no braço e aparece o curativo).
  5. O mapa inteiro conferido, com a resposta.
- O som vem em blocos: o clima muda por trecho, cada parada tem o som do lugar e a viagem anda de um fone ao outro. Há silêncio antes da resposta.
- Cabem de 3 a 7 paradas (testado com 3, 5 e 7). Até 10 também cabe, mas aí o reel passa de 2 minutos e meio.

## O que é do molde e o que a peça preenche

**Do molde (não se mexe):** a rota, as paradas numeradas, o objeto que anda, o letreiro de cada parada, o passaporte, o medidor com o aviso (alarme, visto e X), a chegada, o mapa, os tempos e os efeitos de som. Os tempos saem da regra de leitura: mudou o texto, o tempo se ajusta sozinho. Os arquivos do molde são `film-1-molde.js`, `film-3-filme.js` e `index.html`.

**A peça preenche (chat 1):**

1. **textos.txt.** Vão a pergunta e o que tem de ser mantido. Em cada parada, uma frase de chegada (o que acontece ali e por quê) e uma frase por cuidado (o que pode dar errado e como se previne). No fim, a chegada e a resposta. Embaixo vêm as palavras do desenho: o nome curto de cada lugar e a faixa do medidor.
2. **score.js, só o bloco PREENCHER.** É a lista de paradas, uma linha por parada. Exemplo de linha:

   ```js
   { id: 'parada3', tipo: 'parada', num: 3, nome: 'D04', lugar: 'municipal', transporte: 'caminhao', linhas: [7, 8], cuidados: [{ risco: 7.4, volta: true, alarme: [3, 7] }] },
   ```

   Lê-se assim:
   - A parada 3 se chama [D04] ("município") e o desenho dela é `LUGAR.municipal`.
   - O objeto chega de caminhão.
   - A frase [07] diz o que acontece ali e a [08] é o cuidado.
   - No cuidado, o medidor sobe até 7,4, passando do alarme de 7, volta para a faixa e ganha o visto.
   - `risco: null` quer dizer que o medidor não sai da faixa. `volta: false` quer dizer que não tem volta, e fica o X.
   - `transporte: null` faz o objeto ir pulando, o que serve para "a pé" ou para o trecho dentro da mesma sala.

   No mesmo bloco ficam a PARTIDA (de onde o objeto sai), o MEDIDOR (ou `null`, se não houver uma medida a manter) e o PRINCIPAL (a cena do quadro principal).
3. **film-2-peca.js.** É o desenho do que é novo: o objeto, os lugares, os veículos e o desenho de cada cuidado. Enquanto não tem desenho, o molde se vira:
   - o lugar vira um prédio com porta;
   - o objeto vira um pacote;
   - sem veículo, o objeto vai pulando;
   - o cartão fica só com o medidor.

   Assim a folha de quadros sai desde o primeiro minuto. Já vêm prontos o caminhão, o avião, o prédio, o floco de neve e a pessoa que recebe o objeto. O exemplo tem mais para copiar: o frasco, a caixa térmica, a sala de vacinação e o braço com curativo.
4. **mapa-do-som.json.** Diz o clima de cada trecho, o som do lugar, a coisa que anda na viagem e onde calar. Na viagem vai uma coisa por trecho com veículo, com `"pan": [-0.8, 0.7]`: o `carroPassando` para caminhão e o `sopro` para o resto. Os pulos sem veículo já fazem o som deles pelo molde.
5. **peca.json e legenda.txt.**

Quanto o exemplo precisou escrever além do molde: **22.875 caracteres**, 37% da peça. A maior parte é desenho: 17.625 no `film-2-peca.js`, com 7 lugares, 3 veículos e 6 cartões. O resto: 1.711 no texto, 1.608 na lista de paradas, 930 no som e 1.001 em peca.json e legenda. Uma peça que reaproveite os veículos e os lugares prontos escreve menos.

## Os comandos, do começo ao fim

Abaixo, `M` é `node /home/claude/ig-midia/preseme/reel/motor/preseme.js`.

| Passo | Comando | O que sai |
|---|---|---|
| 1 | `M novo <pasta-da-peca> --de <esta pasta>/molde` | a peça montada, com o kit de estilos e o textos.js |
| 2 | (escrever os cinco arquivos acima, dentro da pasta da peça) | |
| 3 | `M textos --tabela` | LEITURA OK, a duração e o tempo de cada frase |
| 4 | `M quadros` | out/folha.jpg (abrir com Read) |
| 5 | `M folha-textos` | out/folha-textos.jpg, para ele editar o texto |
| 6 | `M estilos @principal carimbo,chapado,planta` | a folha da parada 2 (A ★, B, C) |
| 7 | `M som` | out/music.wav e as medidas: cada coisa que anda tem de dar "anda de um fone ao outro: ok" |
| 8 | `flock /home/claude/trabalho/render.lock -c 'M rascunho'` (em segundo plano) | o rascunho em meia resolução, com som |
| 9 | `M conferir --rascunho` | a lista de medidas (erro trava, aviso é para olhar) |
| 10 | `M entregar folha` ou `M entregar rascunho` | a mensagem para ele |
| 11 | depois do ok: `flock ... -c 'M definitivo'`, `M capa`, `M conferir`, `M entregar` | o vídeo final |

Se ele mexer no texto, `M compara out/textos-enviado-N.txt textos.txt` mostra o que mudou, e `M trecho [NN] [NN]` refaz só aquele pedaço.

## O exemplo: a rede de frio

A pasta `exemplo-rede-de-frio/` é a peça "Como a vacina chega fria até o seu braço?":
- 5 paradas: central nacional, central estadual, município, sala de vacinação e caixa térmica;
- 15 frases, 2 minutos.

A fonte é uma só: o Manual de Rede de Frio do PNI, 6ª edição, 2025. Cada frase está ligada ao seu trecho em `tabela-de-afirmacoes-rede-de-frio.md`, e o banco completo está em `claude/preseme-fatos-rede-de-frio.md`, no projeto. Não há gancho regional: a busca por dado oficial de Roraima só achou jornal.

## O que foi medido no exemplo (16/11, de madrugada)

- Texto: LEITURA OK nas 15 frases; 120,00 s.
- Desenho: qa com 134 quadros e 0 problemas; cores com 15 quadros, todas da paleta.
- Som: −15,9 LUFS e pico −1,5 dBFS. As 4 coisas que andam passam de um fone ao outro: −3,7 → 0,0 dB, −2,6 → +2,7, −4,2 → +0,5 e −5,0 → +3,7. Há silêncio de 110,03 a 110,63 s, antes da resposta.
- Ritmo: o maior trecho sem corte tem 11,3 s, e as 4 trocas de música caem em cortes.
- `conferir --rascunho`: nenhum erro e 1 aviso (o arquivo tem 8,8 MB e não sobe pelo conector do Drive).
- O rascunho levou 388 s, fora a fila do render.
- O molde também foi testado sozinho (10 frases, 62,5 s, qa sem problemas), com 3 paradas (75 s) e com 7 paradas (150 s, qa sem problemas).

## Limites conhecidos

- Na viagem, o letreiro só ganha a letra quando entra inteiro na área segura. Antes disso, a placa aparece vazia e clara. É de propósito: texto cortado na borda é erro no qa.
- Do 2º cuidado da mesma parada em diante, o cartão entra virando, para o corte se ver.
- O objeto anda sempre da esquerda para a direita. Não há caminho de volta nem bifurcação.
- Não há barco pronto: o rio pediria um chão de água. Fica para a peça que precisar.
- No estilo chapado (sem contorno), duas formas da mesma cor se fundem. O molde já cuida da estrada e das casas vazias do passaporte; num desenho novo, use cores de papéis diferentes lado a lado.
