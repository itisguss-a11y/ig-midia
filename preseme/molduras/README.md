# Molduras para fotos do @iescufrr

Pedido dele (13/11/2026): "molduras temáticas no canva pra quando forem postar fotos", "vários modelos de molduras pra escolher para ocasiões diferentes (nós não postamos muito então não precisa de muito)". Quem posta (a professora, a turma) usa direto.

Feitas na noite de 15 para 16/11 só no ambiente do Claude. Ainda não estão no Canva dele, e ele ainda não viu nenhuma.

## O que são

São seis modelos: três ocasiões, cada uma em dois formatos, feed (1080 × 1350) e story (1080 × 1920).

1. Vivência na UBS (a turma com o ACS na rua)
   - feed, "rota da visita": uma rota tracejada contorna a foto e passa por casinhas, e o texto vai numa placa de rua, com um pino;
   - story, "mapa do território": ruas do bairro em volta, um pino no canto da foto e o texto numa etiqueta.
2. Atividade na faculdade
   - feed, "foto colada no caderno": folha pautada, foto presa com fita e texto numa faixa de marca-texto;
   - story, "caderno de espiral": a mesma ideia num caderno de espiral sobre fundo verde.
3. Evento ou ação de saúde
   - feed, "confete e faixa": confetes em volta e o texto numa faixa;
   - story, "ingresso": a foto num ingresso com picote, e o texto no canhoto.

Cada modelo tem três arquivos (na pasta `png/` e na pasta `pdf/`):
- `<id>.png` é a moldura. A janela da foto é transparente, e ela vem sem texto;
- `<id>-lembrete.png` é uma camada separada, do tamanho da moldura, só com a nota do lembrete: "Lembrete: só com autorização de quem aparece, e nenhum paciente na foto." e, embaixo, "apague esta nota antes de postar". Fora da nota, a camada é transparente;
- `<id>.pdf` junta tudo em vetor (moldura, linha de texto e nota), com o texto como texto de verdade, que dá para editar.

O arquivo `canva-camadas.json` diz onde fica cada coisa em cada modelo: a janela da foto, a linha de texto (posição, largura, tamanho, cor e alinhamento) e a nota.

As regras da ficha estão cumpridas:
- só as seis cores da paleta;
- o texto pequeno só aparece nos pares de cor que a ficha permite;
- sem nome do perfil, sem brasão e sem o 3D pastel;
- no story, o texto fica fora das faixas que o Instagram cobre (o topo, até uns 250 px, e a base, a partir de uns 1650 px);
- no feed, o texto fica a mais de 40 px das laterais, porque a grade do perfil corta uns 34 px de cada lado.

A conferência roda sozinha no fim de `python3 -I molduras.py` e termina com "0 problemas". Ela confere as cores, os pares de cor, se o texto de exemplo cabe, as áreas seguras, o tamanho da janela, se a janela é mesmo transparente e se a camada da nota não está vazia.

Prévia (fora desta pasta): `out/molduras-folha-3.jpg` mostra as seis sobre uma foto de exemplo feita por código, uma paisagem sem pessoa. `out/molduras-camadas.jpg` mostra as três camadas de um modelo.

## Como subir para o Canva dele, quando ele autorizar

Isto foi tirado das descrições das ferramentas do Canva conectado, lidas em 16/11. Nenhuma delas foi chamada.

O que cada ferramenta faz:
- `import-design-from-url` e `upload-asset-from-url` só puxam de um endereço público. A própria descrição proíbe usá-las com arquivo feito pelo agente, e proíbe hospedar arquivo gerado (no GitHub ou no Drive, por exemplo) só para criar o endereço. Por isso estão fora;
- `create-upload-url` é a ferramenta certa para arquivo gerado. Ela devolve um endereço de uso único. O arquivo vai por um POST do terminal, com os bytes crus e o cabeçalho `Content-Type: application/octet-stream` (por exemplo, `curl -sS -X POST -H "Content-Type: application/octet-stream" --data-binary @png/1-vivencia-feed.png "<endereço>"`). A resposta traz o identificador do arquivo. Não se sabe se a rede deste ambiente deixa esse POST chegar ao Canva, porque ela bloqueia o que não está liberado. Teste com um arquivo só;
- `create-design` cria um design a partir de um texto, com a IA do Canva. É geração por IA: depende do sim dele;
- `read-design`, com `open_transaction: true`, abre a edição de um design. `edit-design` põe imagem (`insert_fill`, com topo, esquerda, largura e altura), põe texto (`add_text`), formata (`format_text`, com cor, tamanho, negrito e alinhamento, mas sem escolher a letra), ordena as camadas (`layer_element`) e muda o nome (`update_title`). A descrição manda mostrar a prévia e ter o ok dele antes de gravar (`commit`);
- `copy-design` duplica, `resize-design` muda o tamanho, `create-folder` e `move-item-to-folder` organizam, e `export-design` exporta em PNG ou JPG;
- nenhuma ferramenta cria o link de modelo para compartilhar: isso é no app, com ele.

Caminho A, que se testa primeiro:
1. Mande o PDF de um modelo pelo `create-upload-url` e veja na resposta se o Canva criou um design a partir dele.
2. Se criou, esse design já é o modelo, com moldura, texto e nota editáveis. Confira o tamanho: o PDF tem página de 810 × 1012,5 pt (feed) e 810 × 1440 pt (story), que dá 1080 × 1350 px e 1080 × 1920 px a 96 pontos por polegada. Se vier com outro tamanho, use `resize-design` com o tamanho exato.

Caminho B, se o PDF não virar design:
1. Mande pelo `create-upload-url` a moldura e a nota de cada modelo (12 arquivos da pasta `png/`), e anote o identificador de cada um.
2. Para cada formato, é preciso um design vazio. Ele cria no app dois designs em branco, um de 1080 × 1350 e outro de 1080 × 1920 (leva meio minuto), ou autoriza o `create-design`. Depois, `copy-design` faz as três cópias de cada formato.
3. Em cada cópia, abra a edição (`read-design` com `open_transaction`) e use o `edit-design` com `keep_open`:
   - a moldura com `insert_fill`, em topo 0 e esquerda 0, com a largura e a altura do modelo;
   - a linha de texto com `add_text`, com o texto de exemplo, a posição e a largura do `canva-camadas.json`;
   - `format_text` com a cor, o tamanho, o negrito e o alinhamento do mesmo arquivo;
   - a nota com `insert_fill`, também em 0, 0, no tamanho todo;
   - `layer_element` para deixar a nota em cima de tudo;
   - `update_title` com "IESC · moldura · <ocasião> · <feed ou story>".
   Mostre a miniatura a ele e grave (`commit`) só depois do ok.
4. Crie a pasta "IESC · molduras" com `create-folder` e mova os seis designs para ela com `move-item-to-folder`.

Se a rede barrar o POST (erro 403), mande a ele os 12 PNG pelo chat. Ele os sobe em Envios, no app do Canva, e o Claude segue do passo 2.

O plugin oficial do Canva está no catálogo e não está instalado. Ele traz passo a passo pronto para editar design (canva-edit-design) e para criar em lote (canva-bulk-create). Pode ajudar no passo 3. Instalar é com ele.

## O que ele faz para compartilhar com quem vai postar

Em cada modelo, no Canva, ele toca em Compartilhar, depois em Mais (os três pontos), depois em Link de modelo, e copia. Depois manda o link a quem vai postar. Esse passo a passo é do computador, tirado do guia da Big Cat Creative. No celular o nome do menu pode ser outro, e não foi conferido se a conta grátis tem o link de modelo.

## O que quem posta faz (3 passos)

1. Abre o link do modelo e usa o modelo. O Canva cria uma cópia só sua, e o original não muda.
2. Envia a foto, arrasta para cima da moldura e manda a foto para trás (em Posição, Para trás) até ela aparecer pela janela. Depois ajusta o tamanho da foto.
3. Troca a linha de texto (a data ou o que foi), apaga a nota do lembrete e baixa a imagem (PNG ou JPG) ou posta direto.

Antes de postar valem as regras da nota: autorização de quem aparece, e nenhum paciente na foto.

## Limites

- Na letra Kalam, o "1" parece um "l" (o "20/11" fica parecendo "20/ll"). Por isso, nos modelos de caderno, o exemplo escreve o mês por extenso ("20 nov").
- No Canva, a linha de texto entra com a letra padrão do Canva, porque a ferramenta não escolhe a letra. Dá para trocar no app.
- A conta grátis do Canva não tem Kit de Marca (conferido em 14/11).
- O Claude conferiu as regras. Se ficou bonito, quem diz é ele.

## Arquivos desta pasta

- `molduras.py`: gera tudo. Uso: `python3 -I molduras.py --saida out --folha molduras-folha.jpg`. Precisa de rsvg-convert, Pillow, numpy e das letras do comando da fábrica (passo 1).
- `png/`: as 6 molduras e as 6 notas.
- `pdf/`: os 6 modelos inteiros, em vetor.
- `canva-camadas.json`: a posição de cada camada.
