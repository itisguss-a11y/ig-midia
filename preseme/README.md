# PRESEME · motores do @iescufrr

Programas prontos do perfil da disciplina IESC (PRESEME 1) da Medicina UFRR, mantidos pelo Claude. Criados na noite de 15 para 16/11/2026, a pedido dele: "quero torrar tudo isso criando motores para futuros videos [...] isso ia gerar econmia no futuro"; "te pedi para fazer vários motores diferentes para que quando eu for postar algo no futuro, seja feito usando o motor que vc criou hoje".

Motor, na palavra dele, é um programa que já sabe fazer um tipo de peça: o chat entrega só o conteúdo (o texto e o desenho do que é novo), e o programa faz o resto. O chat novo baixa tudo com um comando, em vez de redigitar código:

```
git clone --depth 1 https://github.com/itisguss-a11y/ig-midia /home/claude/ig-midia
```

## O que tem aqui

- `reel/motor/`: a base comum de reel e carrossel, por cima do animation-studio (texto e tempo de leitura, folha de textos, som por bloco com ambiência, quadros, rascunho, trecho, definitivo, capa, conferência, entrega e, para carrossel, lâminas). Inclui o kit de seis estilos (`reel/motor/estilos/`) e o comando da folha dos três estilos. README em `reel/README.md`.
- `reel/tipos/`: os tipos de reel, cada um com o molde e uma peça de exemplo. A biblioteca de desenhos (lugares, objetos e gente por nome) mora em `reel/motor/estilos/BIBLIOTECA.md`.
- `reel/pixel/`: o motor de pixel art (o do "A casa 12"), em Python, com a biblioteca de cenas.
- `carrossel/`: os tipos de carrossel, feitos na mesma base (o motor de `reel/motor` monta o 4:5). README em `carrossel/README.md`.
- `molduras/`: o gerador das molduras para fotos (três ocasiões, feed e story) e o caminho para o Canva.

## Os tipos (16/11/2026)

O catálogo com quando usar cada um fica no projeto PRESEME (claude/preseme-motores.md).

Reel (`reel/tipos/`):
- `passo-a-passo-na-ubs`: Na UBS, e agora? (série). Exemplo: engasgo no adulto (lápis, 2min34) e aferir a pressão (chapado, 2min47).
- `doenca-com-mapa`: Doença de Roraima (série). Exemplo: malária (giz, 1min55).
- `um-dia-pela-hora`: um dia contado pela hora. Exemplo: sus-hoje, "Quantas vezes você usou o SUS hoje?" (lápis, 2min44).
- `x-nao-e-y`: X não é Y. Exemplo: longitudinalidade não é continuidade (chapado, 1min26).
- `o-caminho`: o caminho. Exemplo: como a vacina chega fria até o braço, a rede de frio (carimbo, 2min00).
- `mito-ou-verdade`: mito ou verdade. Exemplo: três frases sobre pressão (chapado, 1min53).
- `linha-do-tempo`: linha do tempo. Exemplo: como o SUS nasceu (planta técnica, 2min29).
- `escada-de-niveis`: escada de níveis. Exemplo: mamografia previne câncer de mama? (planta técnica, 1min43).
- `meme-em-video`: meme em vídeo. Exemplo: o oligodendrócito (chapado, 0min34).
- `antes-e-depois`: antes e depois. Exemplo: por que ninguém mais pega pólio no Brasil? (carimbo, 2min10).
- `dado-que-se-move`: dado que se move. Exemplo: leishmaniose tegumentar em Roraima, 43,38 por 100 mil (carimbo, 0min44).
- `a-palavra`: a palavra. Exemplo: adscrita (lápis) e resolutividade (pixel), 0min37 cada.
- `por-dentro`: por dentro. Exemplo: como uma vacina ensina o corpo a se defender? (lápis, 1min48).
- `quiz-relampago`: quiz relâmpago. Exemplo: 5 perguntas sobre vacina (pixel, 1min14).
- `historia-natural`: história natural. Exemplo: o Oropouche na vida da Dona Rita (lápis, 1min52).
- `tour`: tour. Exemplo: o que tem numa UBS, sala por sala? (pixel, 1min15).
- `caso-com-escolha`: caso com escolha. Exemplo: febre de repente perto da mata (giz na lousa, 2min00).
- `reel/pixel`: pixel art (motor próprio, em Python). Exemplo: A casa 12.

Carrossel (`carrossel/tipos/`):
- `noticia-comentada`: Notícia comentada (série). Exemplo: covid em alta em Roraima, 10/11 (A em lápis, B em chapado, C em carimbo).
- `guia-de-bolso`: guia de bolso. Exemplo: glicose baixa em quem tem diabetes (planta técnica, 12 lâminas).
- `mapa-e-dado`: mapa e dado. Exemplo: oncocercose, a cegueira dos rios (chapado, 9 lâminas).
- `mito-ou-verdade`: mito ou verdade. Exemplo: picada de cobra (carimbo, 9 lâminas).
- `x-nao-e-y`: X não é Y. Exemplo: rastreamento não é diagnóstico precoce (giz na lousa, 8 lâminas).
- `linha-do-tempo`: linha do tempo. Exemplo: quem decidiu que a UBS atende qualquer pessoa (carimbo, 6 lâminas).
- `caso-arraste`: caso, arraste para a resposta. Exemplo: a ferida que não fecha, leishmaniose tegumentar (chapado, 10 lâminas).
- `lista`: lista. Exemplo: 5 cuidados no calor forte (carimbo, 8 lâminas).
- `macete-para-a-prova`: macete para a prova. Exemplo: DIP, as diretrizes do SUS na Constituição (giz na lousa, 7 lâminas).
- `fluxograma`: fluxograma de conduta. Exemplo: mordida de cachorro: e agora? (profilaxia da raiva, chapado, 9 lâminas).
- `meme-em-imagem`: meme em imagem. Exemplo: se eu fosse vacina, já era descarte (1 imagem) e a prova da hipoglicemia (4 lâminas), em lápis.
- `tabela-comparativa`: tabela comparativa. Exemplo: malária, leishmaniose e oncocercose: o que muda? (planta técnica, 9 lâminas).
- `documento-anotado`: documento anotado. Exemplo: você sabe preencher a ficha de notificação do Sinan? (planta técnica, 9 lâminas).
- `mapa-mental`: mapa mental. Exemplo: oropouche: o que é, como pega e como se evita? (giz na lousa, 9 lâminas).
- `por-idade`: por idade. Exemplo: rastreamento de câncer na mulher por idade (lápis, 8 lâminas).
- `perguntas-e-respostas`: perguntas e respostas. Exemplo: vacina que esquentou ainda protege? (lápis, 6 lâminas).

## Regras desta pasta

- O repositório é público: só código e texto de peça. Nada de foto de pessoa, senha, chave, dado pessoal ou brasão (os brasões ficam nos arquivos do projeto PRESEME).
- As regras do perfil (o que vai ao ar, cores, voz, fatos) estão na ficha do projeto PRESEME, que vale acima de qualquer README daqui. Texto das peças de exemplo foi escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.
- Saídas (imagem, vídeo, som) não entram: cada motor gera de novo.
