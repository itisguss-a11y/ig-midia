# ig-midia

Código e mídias do Instagram @dr.gustavocalado, mantidos pelo Claude.

- `dir/`: geradores de carrossel (`make3.py`) e de reel de texto (`reel.py`), com as fontes em `dir/fonts/`.
- `dir/lote.py`, `dir/reels_lote.py`, `dir/lote_textos.py`: lote de teste de 03/10/2026 (6 carrosséis e 2 reels, não publicados), com as legendas e as fontes conferidas.
- `dir/revisao.py` e `revisao/`: página de revisão do lote (grade do perfil, posts, legendas, fontes e o retorno dele).
- `dir/arte.py`: sistema de arte da segunda rodada (desenho que explica dentro de um quadro, uma capa por série, texto em cima, no centro ou embaixo, quatro letras para testar). Desenhos em `dir/icones/` (Healthicons e Tabler Icons, licença MIT, com as licenças ao lado) e próprios.
- `dir/lote2.py`, `dir/reels_lote2.py`, `dir/lote2_textos.py`: segundo lote de teste de 03/10/2026 (8 carrosséis e 2 reels, não publicados), refeito a partir do retorno dele. Cada `posts/<id>.json` traz o que ele disse, o que mudou, quem manda para quem e a marca "teste: conferir as afirmações antes de publicar".
- `dir/revisao2.py`, `revisao/lote2-2026-10-03.html` e `revisao2/`: página de revisão do segundo lote (marcar slide com um toque, etiquetas de um toque, antes e agora, escolha da letra).
- `perfil/`: gerador da identidade do perfil (foto, capas de destaque, capas de post, simulações).
- `posts/`: roteiro e legenda de cada post, um arquivo por post.
- `midia/`: imagens e vídeos prontos para publicar. O endereço público de cada arquivo é passado ao agendador.
- `teste/`: arquivo usado só para testar o endereço público.

Repositório público: aqui só entram posts prontos e código. Nada de foto pessoal, senha ou chave.
