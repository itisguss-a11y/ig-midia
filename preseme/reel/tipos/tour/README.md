# Motor do reel · tipo "tour"

> texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos

Feito na madrugada de 16/11/2026 (frente T4), por cima do motor do reel (`/home/claude/ig-midia/preseme/reel/motor`), do kit de estilos e da biblioteca v2, sem mexer em nenhum dos três.

## O que este motor faz

Faz um reel que visita um lugar sala por sala. O calouro chega pela frente e entra. Depois anda pelo corredor e para em cada porta. A placa da sala acende, a porta abre e a sala aparece por dentro, com quem trabalha nela e o crachá de cada um. No fim vem a planta do lugar inteiro, com as salas numeradas e o caminho feito, para a pessoa tirar print.

Serve para qualquer lugar que se conhece por partes. Exemplos: a UBS (o exemplo pronto), o pronto-socorro da triagem à observação, o laboratório da coleta ao resultado, o CAPS, a farmácia, o centro de parto. Nunca uma unidade real com nome: o lugar é sempre "uma UBS", "um hospital".

## Que reel ele dá

- Vertical (9:16), de 1 a 2min30. O estilo padrão é **pixel ★**: o lugar parece o mapa de um jogo, que se explora sala por sala. As outras opções da folha são B lápis e C planta. A planta não é o padrão porque, nela, as pessoas ficam transparentes (limite do kit), e o tour existe para mostrar quem trabalha em cada sala.
- A ordem dos quadros (toda frase nova é um corte, e a caminhada declara os cortes dela em `CORTES`):
  1. **A fachada**, com a pergunta. O calouro anda até a porta da frente e entra.
  2. **A entrada por dentro** (opcional): a recepção.
  3. **Cada sala.** Na 1ª frase vem o corredor: o calouro anda até a porta, a placa acende com o número e a porta abre. Logo depois, corta para a sala por dentro, numa janela com o número e o nome, com quem trabalha ali e o crachá. A 2ª frase (opcional) é de perto, em quem trabalha. A 3ª (opcional) põe o calouro dentro da sala, com a etiqueta "você".
  4. **Fora** (opcional): o que fica fora do lugar. No exemplo é a área do agente comunitário, com ele andando.
  5. **A planta.** Mostra o contorno, o corredor, a entrada e cada sala com o número, a placa e o bonequinho de quem trabalha. O caminho se desenha de porta em porta e cada sala ganha o visto. A 2ª frase da planta (opcional) é o resumo, com tudo já marcado.
- O som vem em blocos. Na caminhada, os passos alternam de um fone para o outro. A placa acende com um "pop" e a porta abre com um sopro. Cada sala tem o ambiente de sala de espera, e lá fora tem pássaro. A planta se desenha com som de lápis e fecha com o "certo". A música fica baixa e muda de clima por bloco.
- Cabem de 2 a 7 salas, com 1 a 3 frases cada. Com mais de 3 salas, a planta põe salas dos dois lados do corredor.

## O que é do molde e o que a peça preenche

**Do molde (não se mexe):** a fachada, o corredor, as portas com a placa que acende, o crachá, a janela da sala por dentro, o "de perto", o calouro com a etiqueta, o lugar de fora, a planta com o caminho, os tempos e os efeitos de som. Os tempos saem da regra de leitura: mudou o texto, o tempo se ajusta sozinho. Os arquivos do molde são `film-1-molde.js`, `film-3-filme.js`, `index.html` e `peca.js`.

**A peça preenche (chat 1):**

1. **textos.txt.** A pergunta [01], a entrada por dentro [02] (opcional), de 1 a 3 frases por sala, a frase de fora e a frase da planta. Embaixo vêm as palavras do desenho:
   - o nome na fachada;
   - o nome da entrada, que aparece no corredor e na planta;
   - a placa de cada sala, como está na porta (até 40 letras);
   - o crachá de cada pessoa;
   - a etiqueta do aluno ("você").
2. **score.js, só o bloco PREENCHER.** É a lista de cenas, uma por linha. Exemplo de linha:

   ```js
   { id: 'sala1', tipo: 'sala', num: 1, placa: 'D03', sala: 'vacina', foco: 1, linhas: [3, 4],
     quem: [{ rotulo: 'D08', pessoa: { quem: 'enfermeira', pele: 'escura', penteado: 'coque' }, x: 760 },
            { rotulo: 'D09', pessoa: { quem: 'enfermeira', pele: 'clara', penteado: 'rabo' }, x: 270 }] },
   ```

   Lê-se assim:
   - A sala 1 tem a placa [D03] ("Sala de vacinação") e o desenho de dentro é `PECA.SALA.vacina`.
   - Trabalham ali duas pessoas, com os crachás [D08] ("técnica de enfermagem") e [D09] ("enfermeira"). `x` é onde cada uma fica na sala; sem `x`, o molde escolhe.
   - A frase [03] é a do corredor e da sala por dentro. A [04] é a de perto, e `foco: 1` diz que ela é sobre a 2ª pessoa (a enfermeira).

   No mesmo bloco ficam o LUGAR (a placa da fachada e o nome da entrada), a VOCE (a etiqueta do aluno), o ESTILO e o PRINCIPAL (o quadro principal da folha de estilos; `sala1C` é a porta da sala 1 com a placa acesa).
3. **film-2-peca.js.** É o desenho de dentro de cada sala, em `PECA.SALA[nome]`. Enquanto não tem desenho, o molde põe uma sala com mesa e cadeira, e assim a folha de quadros sai desde o primeiro minuto. A biblioteca v2 já tem o consultório, a sala, a sala de espera, o território e a UBS por fora e por dentro, com mesa, cadeira, maca e prancheta. O exemplo tem mais para copiar: a geladeira de vacina, o carrinho de curativo, os tubos de exame, o apoio de braço e a cadeira do dentista.
4. **mapa-do-som.json.** O clima de cada bloco e o ambiente de cada cena. Os passos, a porta, a placa e o lápis já vêm do molde.
5. **peca.json e legenda.txt.** Em `cores`, vão as cores de pele e, se houver gente de cabelo grisalho, o `#B9B2A6`.

Quanto o exemplo precisou escrever além do molde: **12.014 caracteres**. O molde tem 43.596, e só contam as linhas novas ou trocadas. A maior parte é desenho: 7.276 no `film-2-peca.js`, com 5 salas e 5 objetos novos. O resto: 1.694 na lista de cenas, 1.153 no texto, 996 na legenda, 546 no som e 349 em peca.json. Uma peça que use só as salas prontas da biblioteca escreve uns 5 mil.

## Os comandos, do começo ao fim

Abaixo, `M` é `node /home/claude/ig-midia/preseme/reel/motor/preseme.js`.

| Passo | Comando | O que sai |
|---|---|---|
| 1 | `M novo <pasta-da-peca> --de <esta pasta>/molde` | a peça montada, com o kit de estilos, a biblioteca e o textos.js |
| 2 | (escrever os cinco arquivos acima, dentro da pasta da peça) | |
| 3 | `M textos --tabela` | LEITURA OK, a duração, o tempo de cada frase e a linha "tour: N salas (...), planta com as mesmas N" |
| 4 | `M quadros` | out/folha.jpg (abrir com Read) |
| 5 | `M folha-textos` | out/folha-textos.jpg, para ele editar o texto |
| 6 | `M estilos @principal pixel,lapis,planta` | a folha da parada 2 (A ★, B, C) |
| 7 | `M som` | out/music.wav e as medidas |
| 8 | `flock /home/claude/trabalho/render.lock -c 'M rascunho'` (em segundo plano) | o rascunho em meia resolução, com som |
| 9 | `M conferir --rascunho` | a lista de medidas (erro trava, aviso é para olhar) |
| 10 | `M entregar folha` ou `M entregar rascunho` | a mensagem para ele |
| 11 | depois do ok: `flock ... -c 'M definitivo'`, `M capa`, `M conferir`, `M entregar` | o vídeo final |

O vídeo sai com o nome da pasta: monte a peça numa pasta com o nome dela.

## A conferência do tipo (peca.js)

Roda no comando `textos`. Quando trava, o `textos` sai com ERRO e código 1.

**Trava quando:**
- a primeira cena não é a entrada, ou a última não é a planta;
- uma sala do ROTEIRO ficou sem frase (sala sem frase não entra);
- uma sala está sem placa, ou a placa passa de 40 letras;
- há menos de 2 ou mais de 7 salas;
- os números das salas não vão de 1 a N, na ordem;
- uma sala tem mais de 3 frases ou mais de 2 pessoas, ou um crachá está vazio;
- a sala de 3 frases não tem a etiqueta do aluno;
- a planta não bate com as salas (outra quantidade, outra placa ou outro número);
- a peça passa de 2min30.

**Avisa (sem travar) quando:** a fachada está sem nome; a pergunta [01] não termina em "?"; uma sala não tem ninguém; a planta tem mais de 2 frases.

Testado em cópias quebradas de propósito: sala sem frase, sala sem placa, 8 salas, 2min40 e um defeito que tira uma sala da planta. Nos cinco casos o `textos` deu ERRO e saiu com código 1.

Hoje o `conferir` final (o portão antes de entregar) não repete essa conferência: uma peça com ERRO no `textos` passa nele com "nenhum erro". O conserto está em `motor.diff` (11 linhas a mais no `lib/conferir.js`), testado numa cópia do motor: com ele, a sala sem placa e a planta errada saem com ✗ no `conferir`.

## O exemplo: a UBS sala por sala

A pasta `exemplo-ubs/` é a peça "O que tem numa UBS, sala por sala?":
- a entrada (recepção e espera);
- 5 salas: vacinação, curativo, medicação e coleta, consultório e consultório odontológico;
- a área do agente comunitário, lá fora;
- a planta;
- 10 frases e 14 palavras do desenho, 1min15.

São duas fontes. Os nomes das salas vêm da Portaria GM/MS nº 6.185/2024 (a lista de salas da UBS nova). Quem faz o quê vem da PNAB (Portaria nº 2.436/2017), por trechos que já estavam no banco. Cada frase está ligada ao seu trecho em `tabela-de-afirmacoes-ubs.md`, e o banco completo está em `claude/preseme-fatos-ubs-salas-tour.md`, no projeto. Não há gancho regional: o tour é de uma UBS qualquer.

Ficaram fora por falta de trecho: a farmácia e a sala de práticas coletivas (a portaria tem, mas não diz quem trabalha nelas) e a 3ª frase das salas, a do aluno (não há trecho oficial sobre o que o aluno faz em cada sala).

## O que foi medido no exemplo (16/11, de madrugada)

- Texto: LEITURA OK nas 10 frases; 75,00 s. A conferência do tipo dá "tour: 5 salas (...), planta com as mesmas 5".
- Desenho: qa com 90 quadros e 0 problemas; cores com 15 quadros, todas da paleta (com as peles e o grisalho do `peca.json`).
- Som: −16,0 LUFS e pico −1,4 dBFS. As 2 trocas de música (10,00 s e 57,50 s) caem em cortes.
- Ritmo: o primeiro movimento vem em 0,53 s e o primeiro texto em 0,25 s. O maior trecho sem corte tem 10,0 s (a planta, a partir de 65,0 s), contando os 14 cortes que a caminhada declara.
- `conferir --rascunho`: nenhum erro e 1 aviso (o arquivo tem 4,4 MB e não sobe pelo conector do Drive).
- O rascunho levou 74 s, fora a fila do render.
- A entrega foi testada:
  - `novo --de entrega/exemplo-ubs` dá a mesma folha de quadros, pixel por pixel;
  - `novo --de entrega/molde` monta o molde sozinho (3 salas, 7 frases, 47,5 s), e a folha sai com o texto de molde;
  - uma cópia com 7 salas deu 1min30, com a planta pondo as salas dos dois lados do corredor.

## Candidatos à biblioteca

- Do exemplo (`film-2-peca.js`): a geladeira de vacina, o carrinho de curativo, os tubos de exame, o apoio de braço da coleta e a cadeira do dentista, com o refletor e a bandeja.
- Do molde (`film-1-molde.js`): a porta com a placa que acende, o crachá, o corredor com portas e a planta com o caminho (`plantaGeo` e `planta`). Servem a qualquer peça que mostre um lugar por dentro.

## Limites conhecidos

- As pessoas andam de frente: a biblioteca não tem a pose de perfil andando. No corredor, o calouro desliza de lado com o passo da pose de frente.
- Não há pose deitada. No curativo, o paciente fica sentado na maca.
- A planta é genérica: as salas ficam dos dois lados de um corredor, na ordem do tour. Não é a planta de unidade nenhuma, e isso é de propósito.
- O calouro anda sempre da esquerda para a direita, e a visita segue a ordem do ROTEIRO.
- No estilo planta, as pessoas ficam transparentes (limite do kit). Por isso o padrão é pixel.
- Sala sem trecho de fonte não entra. Se a fonte só dá o nome da sala, a frase diz o que é a sala e não inventa quem trabalha nela.
