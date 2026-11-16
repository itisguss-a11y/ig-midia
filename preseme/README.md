# PRESEME · motores do @iescufrr

Programas prontos do perfil da disciplina IESC (PRESEME 1) da Medicina UFRR, mantidos pelo Claude. Criados na noite de 15 para 16/11/2026, a pedido dele: "quero torrar tudo isso criando motores para futuros videos [...] isso ia gerar econmia no futuro"; "te pedi para fazer vários motores diferentes para que quando eu for postar algo no futuro, seja feito usando o motor que vc criou hoje".

Motor, na palavra dele, é um programa que já sabe fazer um tipo de peça: o chat entrega só o conteúdo (o texto e o desenho do que é novo), e o programa faz o resto. O chat novo baixa tudo com um comando, em vez de redigitar código:

```
git clone --depth 1 https://github.com/itisguss-a11y/ig-midia /home/claude/ig-midia
```

## O que tem aqui

- `reel/motor/`: a base comum de reel e carrossel, por cima do animation-studio (texto e tempo de leitura, folha de textos, som por bloco com ambiência, quadros, rascunho, trecho, definitivo, capa, conferência, entrega e, para carrossel, lâminas). Inclui o kit de seis estilos (`reel/motor/estilos/`) e o comando da folha dos três estilos. README em `reel/README.md`.
- `reel/tipos/`: os tipos de reel, cada um com o molde e uma peça de exemplo.
- `reel/pixel/`: o motor de pixel art (o do "A casa 12"), em Python, com a biblioteca de cenas.
- `carrossel/`: os tipos de carrossel (hoje, os três moldes da série Notícia comentada), feitos na mesma base. README em `carrossel/README.md`.
- `molduras/`: o gerador das molduras para fotos (três ocasiões, feed e story) e o caminho para o Canva.

## Regras desta pasta

- O repositório é público: só código e texto de peça. Nada de foto de pessoa, senha, chave, dado pessoal ou brasão (os brasões ficam nos arquivos do projeto PRESEME).
- As regras do perfil (o que vai ao ar, cores, voz, fatos) estão na ficha do projeto PRESEME, que vale acima de qualquer README daqui. Texto das peças de exemplo foi escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos.
- Saídas (imagem, vídeo, som) não entram: cada motor gera de novo.
