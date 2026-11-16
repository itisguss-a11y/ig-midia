# Carrossel · tipo por idade

Texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.

Feito pela frente V4 na madrugada de 16/11/2026, no motor do reel (`preseme/reel/motor`, carrossel 4:5, 1080 × 1350), com o kit de estilos e a biblioteca de desenhos versão 2, sem mexer em nenhum dos três.

## O que o tipo faz
O que a atenção primária oferece em cada fase da vida, numa régua de idades que atravessa as lâminas. Em ordem:
1. **capa**: a etiqueta, a pergunta ("Rastreamento de câncer na mulher: o que muda com a idade?"), a promessa e, no pé, a régua inteira pequena, com a pessoa de cada faixa em pé em cima do trecho dela (a idade curta embaixo: 25–39, 40–49...);
2. **faixa**: uma lâmina por faixa de idade, com a régua no alto (a faixa da vez acesa, as que passaram cheias, as que faltam só no contorno; ela começa abaixo do contador "2/8" do Instagram), o nome da faixa grande ("50 a 64 anos"), a pessoa daquela idade à esquerda (da biblioteca), um cartão por oferta à direita (o ícone, o que é e de quanto em quanto tempo) e, no pé, o porquê (o rótulo "por quê" e a frase com o fio Coral). O que NÃO entra na rotina daquela idade (`marca: 'nao'`) sai com o contorno tracejado, o ícone apagado com o X e o nome sem destaque;
3. **régua inteira** (a penúltima, para print): de cima para baixo, um selo por faixa ligado pela régua vertical, e ao lado as ofertas daquela faixa ("Teste de DNA-HPV · a cada 5 anos, se der negativo"); a regra de uma linha (opcional) e a fonte;
4. **fazer** (a última): o que o aluno faz na visita e o que é da equipe, em 1 a 3 cartões: `voce`, `equipe`, `sinal` (o que não espera a idade, com a faixa Coral e o "!") e `192`.

É diferente da linha do tempo (datas da história) e da escada de níveis (níveis de prevenção): aqui o eixo é a idade da pessoa. Serve para rastreamento, vacinas, consultas e qualquer cuidado que muda com a idade (o calendário da criança, o do adulto, o do idoso, o da mulher).

O estilo padrão é o lápis no papel. Na folha dos três estilos (faixa 50 a 64 e capa), lápis ★, carimbo (B) e chapado (C) se leem bem. O exemplo passou na conferência, sem erro e sem aviso, em lápis, carimbo, chapado, giz e planta. O pixel não serve a este exemplo: com 9 ofertas, a letra larga do pixel não cabe na régua inteira (o tipo avisa quando o estilo é pixel e passam de 7 ofertas).

## As lâminas saem das faixas
O chat 1 não monta a lista de lâminas: ela sai sozinha das `FAIXAS`, no `score.js`. Cada faixa vira uma lâmina, e a régua da capa, a régua do alto de cada faixa e a régua inteira leem do mesmo lugar (por isso a régua inteira bate com as lâminas). Com 3 faixas, o carrossel tem 6 lâminas; com 5, 8; com 7, 10. O `score.js` declara `LAMINAS_MIN = 6` e `LAMINAS_MAX = 10`, e o `conferir` do motor trava fora disso.

Tipos de lâmina (em `film-2-moldes.js`): `capa`, `faixa`, `regua`, `fazer` e `texto`.

Em `PRESEME.KIT`: `regua` (a régua de trechos com a idade curta, que o tipo usa na capa e no alto das faixas), `pessoa` (a pessoa da faixa, em pé, no tamanho pedido), `cartao` (o cartão da oferta), `curto` (25–39, 75+), `cheio` (o apoio que não some no fundo: no chapado, Folha), `errado` e as cores `corSobre` e `apoio`. Em `PRESEME.ICONE`, os ícones dos cartões: `exame` (a prancheta), `vacina` (a seringa), `consulta` (a UBS), `conversa` (o balão), `calendario` e `nenhum`; os da peça ficam em `film-3-desenhos.js`.

## O que fica em cada pasta
- `molde/`: o tipo inteiro, pronto para montar uma peça.
  - Fixos: `index.html`, `film-1-base.js`, `film-2-moldes.js`, `film-9-filme.js` e `peca.js` (a conferência do tipo, que roda no comando `textos`).
  - O que se troca vem marcado com TROQUE: `textos.txt`, o bloco PREENCHER do `score.js`, `film-3-desenhos.js` (os ícones da peça), `alt.txt`, `legenda.txt` e `peca.json`.
- `exemplo-mulher/`: só os arquivos da peça de exemplo ("Rastreamento de câncer na mulher: o que muda com a idade?"). Vão por cima do molde (o `novo` acha o molde vizinho sozinho).
- `tabela-de-afirmacoes-mulher.md` e `legenda-mulher.txt`: a conferência dos fatos e a legenda do exemplo. O banco de fatos mora no projeto: claude/preseme-fatos-rastreamento-mulher-idade.md e claude/preseme-fatos-mamografia.md.

## O que o chat 1 preenche numa peça nova
1. `textos.txt`: as frases [01]… (a pergunta, a promessa, um porquê por faixa, o título da régua, a regra, o título e os cartões do "o que fazer") e as palavras do desenho [D01]… (o rótulo de cada faixa, o nome e o quando de cada oferta, quem faz).
2. `score.js`, só o bloco PREENCHER:
   - `CAPA` (as duas frases e a etiqueta);
   - `FAIXAS`, de 3 a 7, da menor idade para a maior e sem se sobrepor; cada uma com `de` e `ate` (em anos; `ate: null` é "ou mais" e só vale na última), `rotulo` (o nome na tela, que diz a mesma idade: "25 a 39 anos"), `pessoa` (a aparência no B.pessoa: `quem`, `penteado`, `roupa`, `corRoupa`, `oculos`, `pele`...), `oferta` (de 1 a 3: `nome`, `quando`, `icone` e, se for o que não entra na rotina, `marca: 'nao'`) e `porque`;
   - `REGUA` (título, regra opcional e fonte), `FAZER` (título, cartões e fonte) e `DESTAQUE`.
3. `film-3-desenhos.js`: os ícones que o kit não tem (no exemplo, o tubo do teste de DNA-HPV e o aparelho de mamografia), com `PRESEME.ICONE[nome] = (ctx, x, y, t) => {...}`.
4. `alt.txt` (uma linha por lâmina), `legenda.txt` (ensina o que a tela não coube, um pedido só e as fontes) e `peca.json` (título; em `cores`, o cinza do cabelo grisalho `#B9B2A6` e o tom de pele do lápis `#C3855D`, quando a conferência apontar).

Uma faixa do exemplo, para ver o jeito:
```
{ de: 40, ate: 49, rotulo: 'D05', pessoa: { quem: 'moradora', penteado: 'cacheado', oculos: true, roupa: 'camisa', corRoupa: 'folha', pele: 'escura' },
  oferta: [DNA, { nome: 'D11', quando: 'D13', icone: 'mamografia' }], porque: 4 },
```
com `[D05] 40 a 49 anos`, `[D11] Mamografia`, `[D13] se ela quiser, depois de conversar com a equipe` e `[04] Nessa idade, a mama mais densa pode dar falso-positivo: a mamografia é decidida com a equipe.`

Regra de conteúdo: recomendação que muda por sexo ou por risco diz o público como a fonte diz ("mulheres de 25 a 64 anos"); faixa sem trecho de fonte não entra.

## O que o tipo confere sozinho (peca.js, no comando textos)
Trava quando:
- são menos de 3 ou mais de 7 faixas;
- uma faixa começa antes da anterior (fora de ordem) ou na mesma idade em que a anterior termina (sobreposição);
- uma faixa sem fim (`ate: null`) não é a última, ou termina antes de começar;
- o rótulo da faixa não diz a mesma idade que o `de` e o `ate` (ex.: o rótulo diz "40 a 59 anos" e o `ate` é 49);
- uma faixa está sem oferta (faixa sem o que fazer), ou tem mais de 3;
- falta a lâmina de uma faixa, ou elas saem fora da ordem;
- falta a régua inteira, ela não é a penúltima, ou não traz uma faixa ou uma oferta das lâminas;
- falta o "o que fazer", ele não é a última lâmina, ou não tem cartão.

Avisa quando: há um buraco de idade entre duas faixas; uma faixa está sem o porquê, ou o porquê passa de duas frases ou de uns 210 caracteres; uma oferta está sem o quando; a pessoa não é da biblioteca; a régua ou o "o que fazer" está sem fonte; um cartão está sem quem faz; o estilo é pixel com mais de 7 ofertas. E lista uma vez os ícones que são da peça (não do kit).

Testado: o exemplo passa; faixas que se sobrepõem, faixas fora de ordem, rótulo com outra idade, faixa sem oferta, 8 faixas, "o que fazer" sem cartão e faixa "ou mais" no meio travam (o `textos` sai com o código 1).

## Os comandos
```
M=<ig-midia>/preseme/reel/motor/preseme.js
node $M novo <pasta> --de <este>/molde                  # monta a peça (o novo copia o kit e a biblioteca)
node $M novo <pasta> --de <este>/exemplo-mulher          # só para ver o exemplo (o molde vizinho vai primeiro)
cd <pasta> && node $M textos && node $M laminas && node $M conferir
node $M estilos @l04 lapis,carimbo,chapado                # uma faixa em três estilos (parada 2)
```
Carrossel não precisa da trava de render: as 8 lâminas saem em uns 15 segundos.

## Medido
- O exemplo: 8 lâminas; a conferência deu nenhum erro e nenhum aviso (qa 0, nenhuma cor fora da paleta com as duas cores de gente no `cores`, todo texto coube, contador livre, grade 3:4, texto alternativo nas 8, legenda com 5 hashtags). O mesmo em carimbo, chapado, giz e planta. No pixel, 9 textos da régua inteira não cabem (é a letra larga), e o tipo avisa.
- O molde vazio monta 6 lâminas, com nenhum erro na conferência.
- O molde inteiro tem 44.297 caracteres em 11 arquivos. O exemplo escreveu 8.704 além do molde: 1.937 de texto da tela, 2.188 do bloco PREENCHER do score.js, 2.176 de desenho (os dois ícones), 1.203 do texto alternativo, 968 da legenda e 232 do peca.json.
- Consertos que as folhas pediram: a régua do alto ia até o canto do contador do Instagram (desceu para 128 px); no chapado, os trechos cheios da régua e a linha do chão sumiam no fundo Sálvia (agora saem em Folha); a régua inteira tinha letra pequena (o título encolheu, o selo afinou e as linhas ficaram entre 28 e 38 px); no giz e no carimbo a regra não cabia (a caixa dela cresceu); no pixel, os textos pequenos encolhem 16%.

## Candidatos à biblioteca
Os dois ícones do exemplo, em `exemplo-mulher/film-3-desenhos.js`: o tubo de coleta do teste de DNA-HPV (com a escovinha) e o aparelho de mamografia. E, do molde, a régua de trechos com a idade (`PRESEME.KIT.regua`), que serve a qualquer peça com faixas.

## O exemplo e o que falta
"Rastreamento de câncer na mulher: o que muda com a idade?": de 25 a 39 anos, o teste de DNA-HPV a cada 5 anos e a mamografia fora da rotina; de 40 a 49, o teste e a mamografia se ela quiser, depois de conversar com a equipe; de 50 a 64, o teste e a mamografia de rotina a cada 2 anos; de 65 a 74, a mamografia de rotina (a faixa do teste acaba aos 64); com 75 ou mais, a mamografia caso a caso. Fontes: Ministério da Saúde (o rastreamento no SUS, 2026; Outubro Rosa, 2025) e INCA (câncer de mama; folder do colo do útero, 2026). Sem gancho regional: as fontes não têm dado de Roraima. A conferir pelo Fable: se o teste de DNA-HPV já é o exame das UBS de Roraima (a troca é gradual), a regra de parar aos 64 na diretriz nova e as pontes marcadas na tabela de afirmações.
