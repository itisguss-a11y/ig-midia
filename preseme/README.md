# PRESEME · motores do @iescufrr

Programas prontos do perfil da disciplina IESC (PRESEME 1) da Medicina UFRR, mantidos pelo Claude. Criados na noite de 15 para 16/11/2026, a pedido dele: "quero torrar tudo isso criando motores para futuros videos [...] isso ia gerar econmia no futuro".

Para que serve: o chat novo baixa tudo com um comando, em vez de redigitar código que estava num documento do projeto.

```
git clone --depth 1 https://github.com/itisguss-a11y/ig-midia /home/claude/ig-midia
```

## O que tem aqui

- `carrossel/`: o motor de carrossel (lâminas de 1080 × 1350, folha de conferência, textos.txt, texto alternativo e JPEG para subir) e os moldes das três séries (Notícia comentada, Doença de Roraima, Na UBS, e agora?).
- `reel/`: o motor do reel, a camada do PRESEME por cima do animation-studio (texto e tempo de leitura, folha de textos, som por bloco com ambiência, quadros, rascunho, definitivo, trecho, capa, conferência e entrega).
- `molduras/`: o gerador das molduras para fotos (três ocasiões, feed e story) e o caminho para o Canva.

Cada pasta tem o próprio README, com os comandos.

## Regras desta pasta

- O repositório é público: só código e texto de peça. Nada de foto de pessoa, senha, chave, dado pessoal ou brasão (os brasões ficam nos arquivos do projeto PRESEME).
- As regras do perfil (o que vai ao ar, cores, voz, fatos) estão na ficha do projeto PRESEME, que vale acima de qualquer README daqui.
- Saídas (imagem, vídeo, som) não entram: cada motor gera de novo em segundos ou minutos.
- Motor novo só entra no pipeline depois de passar numa peça de verdade.
