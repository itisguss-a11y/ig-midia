# PRESEME · kit de estilos do reel

O kit faz a mesma cena sair em seis estilos de desenho, trocando um nome. Serve para duas coisas:
- a parada 2 de toda peça, o quadro principal em três estilos para ele escolher (decisão 116: "você poderia sugerir alguns estilos diferentes de arte, aí eu escolheria o melhor"), sai num comando;
- os reels variam de cara sem sair da paleta (regra dele: "o problema é o excesso").

Feito na noite de 15 para 16/11/2026, por cima do animation-studio (o motor de desenho), sem mexer no motor. Testado numa cena de demonstração (pasta `demo-estilos`): os seis estilos, a folha da parada 2, dois clipes em movimento e o som pelo motor do reel.

Junto do kit mora a **biblioteca de desenhos** (`biblioteca.js`, guia em `BIBLIOTECA.md`): 11 lugares, 61 objetos e 9 pessoas prontos, chamados pelo nome (`B.varanda(ctx)`, `B.cadeira(ctx, { x, y })`, `B.pessoa(ctx, { quem: 'idosa', pose: 'sit' })`), que saem nos seis estilos. Peça nova já nasce com ela: o desenho que está lá não se escreve de novo.

## Os seis estilos

**lapis · lápis no papel.** Traço de lápis que treme, hachura e textura de papel: o acabamento A do sus-hoje. Serve para peça que conta um caso ou um dia; é a referência do kit. Nota dele: positivo (15/11, "Acabamento A").

**pixel · pixel art.** O quadro em blocos de 6 px, cada bloco numa cor da paleta (pixel de verdade, sem cor de mistura), e a letra nítida por cima, na letra de pixel VT323. Serve para peça com cara de jogo, mapa ou percurso. Nota dele: plus no A casa 12; a professora gostou da cara de jogo; não pode virar padrão.

**giz · giz na lousa.** A lousa é o Floresta; risco de giz falhado, preenchimento rabiscado e letra de mão (Kalam). O destaque vira dois riscos de Marca-texto embaixo da palavra. Serve para explicação passo a passo e esquema. Nunca testado no perfil.

**planta · planta técnica.** Papel quadriculado, traço fino e firme, cor em aguada transparente, chão com o símbolo de terreno e cota em Coral. Serve para território, distância, tamanho, "onde fica o quê". Nunca testado no perfil.

**carimbo · carimbo e gravura.** Cor chapada impressa um pouco fora de registro, com falha de tinta na borda e no fundo; letra grossa (Anton). A falha nunca cai na letra nem na pele (no rosto ela pareceria mancha). Serve para documento, regra, lei, "oficial". Nota: só o carimbo do sus-hoje tinha usado, e lá a falha caiu em cima das letras (o O de TRABALHADOR parecia C, 15/11).

**chapado · infográfico chapado.** Formas planas, cantos arredondados, sem contorno e sem textura, fundo Sálvia. Serve para número, comparação e dado oficial. Nunca testado como estilo da peça inteira.

Todos usam só a paleta (Floresta, Papel, Marca-texto, Coral, Sálvia, Folha e o Noite de serviço), mais pele, cabelo e o branco das pessoas. O kit cumpre sozinho os pares de contraste da ficha: Marca-texto só vira cor de letra no fundo escuro (no claro, ele vai atrás da letra); Coral nunca vira cor de letra no fundo claro (sobre o Papel ele não chega a 3:1 de contraste) e, no escuro, só a partir de 48 px; no carimbo, o anel é Coral e a letra sai na cor do texto.

**Ficaram de fora**, com o motivo: boneco 3D em cor pastel com etiquetas ("já detestei", 15/11); recorte de papel ("horrível", 12/11); cena escura ("ar depressivo e angustiante", 13/11); caixa de diálogo de RPG (14/11: imitar elemento de videogame pode, copiar um jogo não); boneco genérico, que serviria em qualquer post (13/11); `neon` do motor (é escuro: cai na regra da cena escura); `watercolor` do motor (fica para testar numa peça de clima calmo; não estava entre os seis).

## Como uma peça usa o kit

1. Na pasta da peça, `ferramentas/estilos.js`, `ferramentas/estilos-folha.js` e a pasta `ferramentas/fontes/` (o `novo` do motor do reel copia; à mão, copie os três daqui).
2. No `index.html`, uma linha depois do `score.js` e antes do `engine/video/gfx.js`:
   `<script src="ferramentas/estilos.js"></script>`
3. No `score.js`, o estilo da peça: `ESTILO: 'giz'` dentro do SCORE. Sem isso, vale `lapis`. Para trocar só na hora, `--style giz` em qualquer comando do `engine/render.js` (stills, board, video, qa).
4. Os arquivos `film-*.js` desenham com o kit (`const E = globalThis.ESTILOS;`), e não com cor e letra escritas à mão:

| função | o que faz |
|---|---|
| `E.fundo(ctx)` | o fundo do estilo (`{ tipo: 'escuro' }` pede o cartão Floresta) |
| `E.chao(ctx, y)` | o chão, do y até embaixo |
| `E.ret`, `E.circulo`, `E.poligono` | formas, com `{ papel: 'superficie', r, sombra, seed }` |
| `E.linha(ctx, pontos, { k })` | linha; `k` de 0 a 1 faz ela entrar desenhando |
| `E.seta(ctx, de, para, { curva, k })` | seta curva |
| `E.cota(ctx, de, para, '3 m', { k, sobre: 'chao' })` | medida de prancheta; `sobre` diz o que está embaixo, para a cor se ler |
| `E.texto(ctx, s, x, y, { papel: 'titulo', size })` | texto no papel dele: `titulo`, `corpo`, `mao` (anotação) ou `numero` |
| `E.textoComDestaque(ctx, s, trecho, x, y, { k })` | a frase com o trecho no destaque do estilo |
| `E.destaque(ctx, x, y, w, size, { k })` | só o destaque, atrás de um texto já medido (`E.medir`) |
| `E.carimbo(ctx, 'visita feita', x, y, { k, quebra: true })` | selo carimbado; `k` é o tempo da batida |
| `E.personagem(ctx, { quem: 'agente', x, y, s, pose, gesture, handR })` | o Ch.person do motor vestido nas cores do perfil (`agente`, `calouro`, `moradora`) |
| `E.objeto(ctx, 'casa' \| 'prancheta' \| 'vaso' \| 'sol', {...})` | objetos de rua e de UBS feitos com as funções acima |
| `E.cor('texto')`, `E.letra('titulo')`, `E.nome`, `E.escuro()` | a cor e a letra de cada papel no estilo da vez |

Os papéis de cor: `fundo`, `tinta` (contorno e linha), `texto`, `destaque`, `alerta`, `apoio`, `apoioEscuro`, `superficie`, `chao`, `sombra`, `grade` e `linhaChao` (linha, faixa ou marca desenhada em cima do chão: `E.linha(ctx, pts, { papel: 'linhaChao' })`; sai na cor que se lê no chão de cada estilo: Floresta no lápis, no carimbo e na planta, Noite no pixel, Papel no giz e no chapado). Também valem os nomes da paleta (`floresta`, `coral`...) e de gente (`pele`, `cabelo`, `branco`). A cena de `demo-estilos/film-1-demo.js` é o exemplo inteiro.

Transparência: as funções respeitam o `ctx.globalAlpha` de quem chama (a cena que entra ou sai clareando leva tudo junto). Desde 16/11 isso vale também para o chão, o marca-texto e o quadriculado da planta e para a faixa de sombra do chão no chapado. Ainda não vale para a falha de tinta do carimbo e para o anel do selo (`E.carimbo`, no lápis e no carimbo): os pontos da cor do papel saem com transparência fixa.

Desenho feito direto no motor (`G.rrect`, `G.text`...) também muda com o estilo (o kit embrulha o motor), mas a cor escrita à mão não acompanha o fundo: na lousa, uma letra Floresta some.

## A folha da parada 2

De dentro da pasta da peça:
```
node ferramentas/estilos-folha.js @principal lapis,giz,planta
```
- O instante: segundos (`7.3`), marcador do score (`@principal`, `@principal+0.5`) ou frase (`[07]`, meio segundo depois que ela entra).
- Os três estilos na ordem A, B e C; o primeiro leva a ★ (o que melhor explica). Pela decisão 116, B é um bem diferente do ★ e C um nunca testado, e nenhum repete o estilo da peça anterior.
- Sai `out/folha-estilos.jpg` (uma imagem só, 1896 × 1234, legível no celular) e um PNG por estilo em `out/estilos/`. Cada estilo leva uns 4 s.
- `--todos` faz os seis numa grade (para conferir o kit, não para mandar a ele); `--draft`, em meia resolução; `--saida`, outro nome.

Para virar comando do motor do reel (`node preseme.js estilos <instante> [a,b,c]`): o comando chama `node ferramentas/estilos-folha.js` com os mesmos argumentos, de dentro da pasta da peça, e o `novo` copia `estilos.js`, `estilos-folha.js` e `fontes/` para a pasta `ferramentas/` da peça e põe a linha do kit no `index.html`.

## O que o kit não faz

- No pixel, só o texto que passa pelo `G.text` sai nítido por cima dos blocos; texto que o motor escreve por outro caminho (`UI.text`, `Data.counter`) vira bloco junto com o desenho.
- Na planta, as pessoas também ficam em aguada (transparentes), como o resto do desenho.
- Na lousa, o fundo é sempre a lousa; `E.fundo(ctx, { tipo: 'escuro' })` não muda nada ali.
- No chapado não há contorno: preenchimento creme (`papel`, `superficie`) ou branco (`branco`) em cima da parede creme (`superficie`) some, porque é a mesma cor sem linha em volta. Em cima da parede, use `apoio` (Sálvia), `apoioEscuro` (Folha), `destaque` ou `alerta`, ou ligue a sombra (`sombra: true`). No chão do chapado (Folha), a linha na `tinta` (Floresta) quase some (contraste de 2 para 1): use `linhaChao`, que ali sai em Papel (4,9 para 1).
- Estilo novo (aquarela, por exemplo) entra como mais uma linha em `DEF`, `CORES` e `LETRAS`, dentro do `estilos.js`, e só depois de passar numa folha que ele viu.

## As letras

Em `fontes/`, todas de licença livre (OFL; o texto de cada licença está junto): Instrument Sans, Anton, Kalam, VT323 e IBM Plex Mono, todas com os acentos do português (conferido). As do motor (Inter, Caveat, Patrick Hand) vêm com ele.
