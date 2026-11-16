# Carrossel · tipo mapa mental

Texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.

Feito pela frente V3 na madrugada de 16/11/2026, no motor do reel (`preseme/reel/motor`, carrossel 4:5, 1080 × 1350), sem mexer no motor.

## O que o tipo faz
É o resumo de um tema inteiro, no formato que a turma usa para estudar para a prova. O tema fica no centro, e em volta saem de 4 a 6 ramos. Os ramos mudam conforme o tema: o que é, como pega, o que se vê, como se confirma, como se trata, como se previne. Cada ramo leva 2 ou 3 folhas curtas.

As lâminas, nesta ordem (o `score.js` monta sozinho):
1. **capa**: o rótulo, a pergunta grande, a frase de baixo (o dado de Roraima, com o ano) e o mapa inteiro pequeno. No mapa aparecem o desenho do tema, o centro e o nome dos ramos, sem as folhas. A seta na borda pede o deslize.
2. **uma lâmina por ramo**, na ordem dos RAMOS. É a câmera chegando perto de um ramo só:
   - no canto de baixo, o pedaço do centro, com o nome do tema;
   - o galho grosso até o nó do ramo, que fica aceso;
   - o desenho do ramo, em cima do nó;
   - as folhas em cartões, cada uma no seu raminho;
   - no alto, o nome do ramo (rótulo) e a frase dele;
   - no canto, o mapa em miniatura, com o ramo da vez aceso, os de antes cheios e os de depois claros.
3. **o mapa inteiro, para print**: o desenho do tema, o centro, os ramos numerados com todas as folhas, as fontes no pé e o tracejado de recortar.
4. **a equipe** (cartão escuro): o que é da atenção primária (quem notifica, quem acompanha), com o ✓, o desenho e as fontes.

Os ramos ficam em volta do centro em sentido horário, a partir de cima à direita. A metade maior vai à direita, de cima para baixo; o resto, à esquerda, de baixo para cima. O número de cada ramo diz a ordem de leitura e é o mesmo na capa, na miniatura e no mapa inteiro.

**Diferença dos outros tipos:**
- tabela comparativa: várias coisas lado a lado;
- fluxograma: decisões;
- guia de bolso: passos de um procedimento;
- mapa mental: um tema só, por inteiro.

**Estilo padrão:** giz na lousa ★, o resumo escrito no quadro. Na folha da parada 2 (`@l05`), B é lápis no papel e C é planta técnica. O exemplo passa no `conferir` nos seis estilos, com 0 erro e 0 aviso: giz, lápis, planta, chapado, carimbo e pixel.

## O que fica em cada pasta
- `molde/`: o tipo inteiro.
  - Arquivos fixos:
    - `index.html`;
    - `film-1-base.js`, a base de carrossel, com a quebra depois do hífen trazida da tabela comparativa;
    - `film-2-moldes.js`, os moldes de lâmina e o kit do tipo: o mapa, a pílula do ramo, o galho, a miniatura e o centro;
    - `film-9-filme.js`;
    - `peca.js`, a conferência do tipo.
  - O que se troca vem marcado com TROQUE: `textos.txt`, `score.js`, `film-3-desenhos.js`, `alt.txt`, `legenda.txt` e `peca.json`.
- `exemplo-oropouche/`: só os arquivos da peça de exemplo ("Oropouche: o que é, como pega e como se evita?"). O `novo` põe o molde vizinho por baixo sozinho.
- `legenda-oropouche.txt` e `tabela-de-afirmacoes-oropouche.md`: a legenda e cada frase do exemplo com a fonte e o trecho.

## O que o chat 1 preenche
| arquivo | o quê |
|---|---|
| `score.js`, bloco TROQUE | `CENTRO` (a palavra D do tema), `RAMOS` (de 4 a 6: `id`, `nome`, `frase`, `folhas`), `CAPA`, `INTEIRO`, `EQUIPE`, `DESTAQUE` e, se quiser, `ESTILO` |
| `textos.txt` | as frases e as palavras D: o nome dos ramos e as folhas, até 7 palavras cada |
| `film-3-desenhos.js` | `DS.centro` (o desenho do tema, uns 200 × 160 px), `DS.ramo[id]` (um desenho por ramo, uns 300 × 240 px) e, se quiser, `DS.cena.equipe` |
| `alt.txt` | uma linha por lâmina, `[L01]` a `[L09]` |
| `legenda.txt` | a legenda, pelos guias caption-writer, instagram-seo e hashtag-strategy. Ensina o que o mapa não coube, com fonte, e faz um pedido só |
| `peca.json` | o título e as cores de gente usadas (a pele: `#C98A62`) |

Exemplo de ramo, do exemplo do Oropouche. No `score.js`:
```js
{ id: 'pega', nome: 'D06', frase: 4, folhas: ['D07', 'D08', 'D09'] },
```
e no `textos.txt`:
```
[04] Quem passa é principalmente o maruim, que não é o mosquito da dengue.
[D06] Como pega
[D07] picada do maruim, o mosquito-pólvora
[D08] nome científico, Culicoides paraensis
[D09] de pessoa a pessoa, sem evidência
```

## Os comandos
```
M=/home/claude/ig-midia/preseme/reel/motor/preseme.js
node $M novo /home/claude/trabalho/<nome> --de <este>/molde              # monta a peça
node $M novo /home/claude/trabalho/<nome> --de <este>/exemplo-oropouche  # só para ver o exemplo
cd /home/claude/trabalho/<nome>
node $M textos
node $M laminas
node $M estilos @l05 giz,lapis,planta
node $M conferir
node $M capa
node $M entregar
```
Para conferir outro estilo, rode `laminas --estilo lapis` (o `conferir` mede as lâminas que estiverem em out/).

## O que o motor confere sozinho (peca.js, no comando textos)
**Trava** quando:
- o centro está sem nome;
- há menos de 4 ou mais de 6 ramos;
- o id de um ramo se repete, está vazio, tem espaço ou é o de uma lâmina fixa (`capa`, `mapa`, `equipe`, `texto`);
- um ramo está sem nome;
- um ramo está sem folha ou tem mais de 3;
- uma folha tem mais de 7 palavras;
- o mapa inteiro não bate com as lâminas: a capa não é a primeira; as lâminas de ramo não são os RAMOS, na mesma ordem (um ramo some quando todo o texto dele é apagado); o mapa inteiro falta, aparece duas vezes ou vem antes de uma lâmina de ramo.

**Avisa** quando:
- um ramo tem 1 folha só;
- uma folha está na lista e não no `textos.txt`;
- uma folha passa de 44 letras (sai em letra menor no mapa inteiro);
- o nome do centro ou de um ramo passa de 22 letras;
- falta a frase de um ramo;
- falta a fonte do mapa inteiro;
- falta a lâmina da equipe.

As 9 travas foram testadas com peças quebradas de propósito, e todas pararam o `textos` com código 1: 3 ramos, 7 ramos, ramo sem folha, 4 folhas, folha de 8 palavras, id repetido, id `mapa`, ramo apagado e centro sem nome.

## A medida
O molde tem 46.820 caracteres em 11 arquivos. O exemplo acrescenta 12.749:

| parte | caracteres |
|---|---|
| desenhos (`film-3-desenhos.js`) | 7.133 |
| texto alternativo | 1.761 |
| textos | 1.720 |
| bloco TROQUE do `score.js` | 1.090 |
| legenda | 953 |
| `peca.json` | 92 |

## Candidatos à biblioteca
Estão em `P.NOVOS`, no `film-3-desenhos.js` do exemplo:
- o maruim (Culicoides paraensis, o mosquitinho corcunda de asa manchada);
- o vírus com espículas;
- o tubo de sangue;
- a janela com tela de malha fina.

## Limites
- **O mapa inteiro com 6 ramos e 3 folhas cada** usa letra de 22 a 26 px. É a lâmina de salvar e ampliar; a lâmina de ler é a de cada ramo.
- **No pixel**, a letra larga deixa o mapa inteiro e o nome do centro ainda menores, mas tudo cabe. Prefira giz, lápis ou planta.
- **O desenho do tema** fica em cima do círculo do centro, onde passam os galhos de cima. Um desenho largo pode cruzar um galho; ali, mais alto é melhor que mais largo.
- **A lâmina de ramo** põe as folhas em cartões no meio da coluna da direita. Com 1 folha curta, sobra lousa vazia.
- **B.pessoa** não foi usada. Se usar, passe `pose: 'stand'`.
