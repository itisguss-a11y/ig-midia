# Biblioteca de desenhos do PRESEME

Lugares, objetos e pessoas prontos, para qualquer reel ou carrossel feito no animation-studio. A peça chama pelo nome (`B.cadeira(ctx, { x: 600, y: 1400 })`) em vez de desenhar à mão. Tudo é feito com o kit de estilos, então sai nos seis estilos (lápis, pixel, giz, planta, carimbo, chapado) e só nas cores da paleta.

Arquivos (todos em `motor/estilos/`):
- `biblioteca.js`: a biblioteca.
- `catalogo.sh` e a pasta `catalogo/`: geram a folha com todos os desenhos (abaixo, "A folha de catálogo").

A prova da economia (feita em 16/11 com a cena da varanda do reel da pressão): à mão, a cena levava 4.468 caracteres de código; com a biblioteca, 1.254, ou 72% a menos. No reel inteiro, 91% do desenho de lugar e de coisa já está aqui: o reel de uns 35 mil caracteres cai para perto de 24 mil.

## Como uma peça carrega

No `index.html` da peça, a linha da biblioteca vai logo depois da linha do kit. As duas ficam depois do `score.js` e antes do `engine/video/gfx.js`:

```html
<script src="score.js"></script>
<script src="ferramentas/estilos.js"></script>
<script src="ferramentas/biblioteca.js"></script>
<script src="engine/video/gfx.js"></script>
```

O comando `novo` copia a biblioteca para `ferramentas/biblioteca.js` da peça sozinho, quando o `index.html` tem essa linha. Os dois modelos do motor (o do reel e o do carrossel) e os moldes de tipo já trazem a linha: peça nova já nasce com a biblioteca.

No film: `const B = globalThis.BIB;`. Se a biblioteca for carregada sem o kit, ela avisa no console e não faz nada.

## Regras que valem para tudo

- **x, y**: o chão (o pé) para o que fica em pé no chão ou na mesa. O centro para o que se segura. A coluna "ponto" diz qual dos dois.
- **s** é o tamanho (1 = o tamanho numa cena de reel), **rot** é o giro em radianos, **espelho: true** vira para o outro lado e **seed** muda o tremido do traço.
- **k** (0 a 1), quando existe, faz o desenho entrar crescendo ou aparecendo.
- **Nenhum desenho escreve palavra sozinho.** Número da casa, leitura do visor e nome do mês entram por parâmetro e vêm do textos.txt. Exemplo: `B.celular(ctx, { x: 540, y: 900, numero: D('D02') })`.
- **Cor**: só a paleta e as cores de gente. A exceção é o cabelo grisalho (`#B9B2A6`). Se a peça usar `idosa`, `idoso` ou `cabelo: 'grisalho'`, ponha `#B9B2A6` no `cores` do peca.json.
- **A cruz da UBS é verde**, de saúde. A cruz vermelha em fundo branco é emblema protegido por lei e fica de fora.
- **Os lugares desenham o quadro inteiro**: o fundo, o lugar e o chão.
  - O chão padrão fica em y = 1400 no reel e 984 no carrossel; `chao: 1390` muda.
  - O fundo segue o parâmetro `fundo`:
    - `true` (padrão) pinta o fundo do estilo.
    - `false` não pinta (use quando o molde já pintou o fundo do estilo).
    - Uma cor, como `fundo: 'papel'`, pinta essa cor, e as cores do lugar são escolhidas para não sumir nela. Use quando o molde pinta um fundo diferente do estilo, como o molde "Na UBS", que pinta Papel até no chapado.
- Todos devolvem pontos úteis. Exemplo: `const c = B.cadeira(...)`, depois `c.assento` é o x, y da pessoa sentada.

## Lugares (9)

| nome | o que desenha | parâmetros (além de chao e fundo) | devolve |
|---|---|---|---|
| `varanda` | viga, pilares, mureta, a rede no canto | `rede: false` tira a rede; `viga: false`; `t` (a rede balança) | `chao`, `mureta` |
| `rua` | três casas de cores diferentes, árvore, meio-fio | `numeros: ['12','14','16']`; `portas: [0, 0.8, 0]` (abertas); `sol: true`; `arvore: false` | `casas` (porta, parede, topo de cada uma) |
| `sala` | meia-parede, janela com cortina, quadro | `janela: false`; `quadro: false` | `janela` |
| `ubsFora` | fachada, faixa com a cruz verde e a placa, porta de vidro, janelas, buriti | `placa: D('D03')`; `arvore: false` | `porta`, `placa` |
| `ubsDentro` | recepção: porta do consultório com plaquinha, cartaz, balcão com placa pendurada | `porta: D('D04')`; `placa: D('D05')` | `balcao`, `porta` |
| `consultorio` | armário, maca (travesseiro, papel, degrau), mesa com computador | — | `maca` (em cima do colchão), `mesa` (o y do tampo) |
| `salaEspera` | painel de senha, relógio, cadeiras presas na barra, vaso | `senha: D('D06')`; `cadeiras: 4`; `cor: 'coral'`; `hora: 9.25`; `relogio: false`; `vaso: false` | `assentos` (x, y de quem senta em cada cadeira) |
| `floresta` | a mata do outro lado, o rio, uma árvore grande e um buriti | `rio: false`; `t` (a água corre) | `margem`, `agua` |
| `mapaRR` | Roraima com os 15 municípios (contorno do IBGE) | `x, y, w, h` (a caixa); `destaques: { 'Boa Vista': 'destaque', 'Alto Alegre': 'alerta' }`; `base: 'apoioEscuro'`; `k` (acende); `ponto: 'Boa Vista'` | `proj(lon, lat)`, `centro(nome)`, `nomes` |

Exemplos:

```js
B.varanda(ctx);
B.rua(ctx, { numeros: [D('D01'), D('D02'), D('D03')], portas: [0, abre, 0] });
const sala = B.salaEspera(ctx, { senha: D('D06') }); B.pessoa(ctx, { quem: 'idoso', x: sala.assentos[1][0], y: sala.assentos[1][1], pose: 'sit' });
const m = B.mapaRR(ctx, { x: 90, y: 330, w: 820, h: 1000, destaques: { 'Alto Alegre': 'alerta' }, k }); E.seta(ctx, [800, 300], m.centro('Alto Alegre'));
```

## Objetos (35)

| nome | ponto | parâmetros | devolve |
|---|---|---|---|
| `mesa` | chão | `w: 300`, `h: 250` (altura do tampo), `papel: 'apoioEscuro'` | `topo` (o y do tampo) |
| `cadeira` | chão | `tipo: 'plastico'` (encosto alto) ou `'madeira'`; `papel` | `assento` |
| `rede` | ganchos | `w: 262`, `sag: 66`, `papel: 'coral'`, `listra: 'destaque'`, `t` | `meio` |
| `relogio` | centro | `r: 104`; `frac` (0 a 1: a fatia do tempo que passou) ou `hora: 9.5`; `rotulo` | `centro` |
| `celular` | centro | `numero` (o 192); `tela: 'ligar'`, `'mensagem'` ou `'apagada'`; `k` | `tela` |
| `aparelhoPressao` | centro | `leitura`, `unidade`, `alerta: true` (visor coral), `manguito: true` (deitado ao lado), `infla` | `visor`, `saida` (do tubo) |
| `manguito` | — | `de` (ombro) e `ate` (cotovelo), pontos da tela; `infla`; `manga: 'coral'` (o erro por cima da roupa) | o ponto do tubo |
| `tubo` | — | `de`, `ate`, `folga: 60` | — |
| `glicosimetro` | centro | `leitura`, `unidade`, `fita: true`, `gota: true` | `fita`, `visor` |
| `termometro` | centro | `leitura`, `febre: true` (visor coral); deitado, ponta à direita | `ponta` |
| `seringa` | centro | `k` (0 cheia, 1 vazia), `liquido: 'destaque'`; agulha à direita | `agulha` |
| `frascoVacina` | chão | `estragado: true` (líquido coral) | `tampa` |
| `caixaTermica` | chão | `w: 300`, `h: 220`, `aberta` (0 a 1), `floco: true` | `dentro`, `frente` |
| `prancheta` | centro | `linhas` (0 a 3, fração = escrevendo), `vistos`, `rot` | `topo` |
| `cartaoVacina` | centro | `marcadas: 3` (ou a lista dos quadrinhos 0 a 11), `titulo` | `centro` |
| `mosquito` | centro | `listras: true` (Aedes: dengue, zika, chikungunya; sem listras, Anopheles: malária), `t` (asas), `rot` | `tromba` |
| `cobra` | centro | `comp: 640`, `amp: 60`, `ondas: 2.3`, `t` (rasteja, língua); cabeça à direita | `cabeca` |
| `lupa` | centro da lente | `r: 110`, `cabo: 0.8` (ângulo), `dentro: (ctx) => {...}` (o que ela aumenta) | `centro` |
| `calendario` | centro | `titulo` (o mês), `marcados: [9, 23]` (dias 0 a 34), `k` | `centro` |
| `carimbo` | onde bate | `batida` (0 levantado, 1 no papel). A marca no papel é o `E.carimbo` do kit | `ponto` |
| `xicara` | chão (o pires) | `s` | `boca` |
| `estojo` | chão | `papel: 'apoioEscuro'` | `topo` |
| `prato` | centro do prato | `s` | `centro` |
| `cigarro` | centro | `fumaca: true`, `t` | `brasa` |
| `tenis` | sola | `s` | `centro` |
| `coracao` | centro | `k`, `papel: 'coral'` | `centro` |
| `visto` | centro | `k`, `papel: 'apoioEscuro'` | `centro` |
| `tracejado` | — | `de`, `ate`, `k` (vai se desenhando), `papel: 'coral'` | — |
| `balao` | centro | `riscado: true` (o "sem falar"), `k` | `centro` |
| `ubsIcone` | centro | `k` (a UBS pequena, para mapa e percurso) | `centro` |
| `dor` | começo do risco | `a` (ângulo), `tam: 54` | — |
| `gota` | centro | `r: 14`, `papel: 'alerta'` | — |
| `floco` | centro | `r: 30`, `papel: 'tinta'` | — |
| `arvore` | pé do tronco | `h: 420`, `tipo: 'copa'` ou `'buriti'`, `copa` (a cor) | `topo` |
| `casa` | chão, no meio | `w: 360`, `h: 420`, `parede`, `telhado`, `numero`, `porta` (0 a 1) | `porta`, `parede`, `topo` |

Exemplos:

```js
const m = B.mesa(ctx, { x: 820, y: 1400, w: 200, h: 262 });
B.xicara(ctx, { x: 780, y: m.topo });
B.aparelhoPressao(ctx, { x: 872, y: m.topo - 48, s: 0.9, leitura: D('D10'), alerta: true });
B.celular(ctx, { x: 700, y: 900, numero: D('D02'), k: U.ease.outBack(entra) });
B.lupa(ctx, { x: 540, y: 800, dentro: (c) => B.mosquito(c, { x: 540, y: 810, s: 1.4, t }) });
B.cobra(ctx, { x: 500, y: 1300, s: 0.8, t });
```

Também dá para chamar pelo nome, como texto: `B.desenha(ctx, 'cadeira', { x: 600 })`. As listas estão em `B.LUGARES`, `B.OBJETOS` e `B.GENTE`.

## Gente (9)

`B.pessoa(ctx, { quem, x, y, ... })` desenha as pessoas do motor (o Ch.person, pelo kit). Não há boneco genérico de cabeça redonda.

- **quem**: as três do kit (`agente`, `calouro`, `moradora`) e mais seis (`idosa`, `idoso`, `medica`, `medico`, `enfermeira`, `crianca`).
- **Aparência**, toda opcional:

| parâmetro | valores |
|---|---|
| `pele` | `'clara'`, `'media'`, `'escura'` |
| `cabelo` | `'preto'`, `'grisalho'` |
| `penteado` | `'curto'`, `'raspado'`, `'topete'`, `'cacheado'`, `'crespo'`, `'comprido'`, `'coque'`, `'rabo'`, `'careca'` |
| `roupa` | `'camisa'`, `'camiseta'`, `'vestido'`, `'moletom'`, `'jaleco'` |
| `corRoupa`, `corCalca` | uma cor da paleta |
| `calca` | `'calca'`, `'bermuda'`, `'saia'` |
| `barba` | `'bigode'`, `'barba'`, `'cavanhaque'` |
| `oculos` | `true`, `'quadrado'` |
| `corpo` | `'magro'`, `'medio'`, `'forte'`, `'gordo'` |
| `idade` | `'crianca'` (fica menor), `'idosa'` (cabelo grisalho) |

- **O resto vai direto para o Ch.person**: `pose` (`'stand'`, `'sit'`, `'walk'`), `gesture`, `eyes`, `mouth`, `look`, `handR`, `walk`, `s`...
- **Em pé, passe `pose: 'stand'`**: aí o x, y é o pé. Sem a pose, o Ch.person usa `'sit'` (de frente, parece em pé, com as pernas para baixo), e o x, y vira o quadril: o pé fica umas 150 × s unidades abaixo do y (medido em 16/11, frente U4).
- No chapado, roupa da cor do fundo (Sálvia) vira branca. Sem contorno, ela sumiria.

```js
const c = B.cadeira(ctx, { x: 600, y: 1400 });
B.pessoa(ctx, { quem: 'idosa', x: c.assento[0], y: c.assento[1], pose: 'sit', look: -0.5 });
B.pessoa(ctx, { quem: 'medica', pele: 'escura', penteado: 'cacheado', pose: 'stand', x: 300, y: 1400, gesture: 'point' });
B.pessoa(ctx, { quem: 'calouro', roupa: 'jaleco', x: 700, y: 1400, pose: 'walk', walk: an.walk });
```

## A folha de catálogo

`bash motor/estilos/catalogo.sh saida.png lapis,chapado` monta uma peça de catálogo numa pasta temporária (fora do repositório). Ela desenha as 5 páginas (lugares, objetos 1 a 3, gente) em cada estilo e junta tudo numa imagem só, com o nome de chamar de cada desenho. As fotos paradas levam segundos e rodam sem a fila; com `RENDER_LOCK=/home/claude/trabalho/render.lock`, entram na fila.

Conferido nos seis estilos: nenhuma casinha vazia, nenhum erro.

## O que ficou de fora

- Pessoa deitada (na maca, na rede): o Ch.person não tem essa pose.
- Gente com doença à mostra (manchas, feridas): depende do fato de cada peça.
- Os veículos (caminhão, avião, barco) da peça da rede de frio: são de uma série só.
- A cor madeira: não é da paleta. A mesa é Folha.
