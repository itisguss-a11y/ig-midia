# Carrossel "X não é Y" · molde

> texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos

## O que este tipo faz

Um carrossel 4:5 para dois conceitos que se confundem. Cada um é definido com o desenho dele funcionando, um caso separa os dois e uma pergunta mostra como reconhecer na prática. É o irmão em carrossel do reel "X não é Y": as mesmas etiquetas com o nome de cada lado, o mesmo sinal de diferente e o "não é" no destaque.

Estilo padrão, giz na lousa. Sai também nos outros cinco estilos do kit: o qa passou nos seis, nas 8 lâminas do exemplo.

| lâmina | o que aparece | textos |
|---|---|---|
| capa | o título "X não é Y", por que se confundem e os dois nomes em cartões, com o ≠ e um desenho pequeno de cada lado | 2 frases + D etiqueta, D nome de X, D nome de Y |
| conceito | o nome no cartão, a definição, o desenho do conceito funcionando e o exemplo | 2 frases + D nome e os rótulos do desenho |
| caso | o caso em cima e duas colunas, uma por conceito, com o desenho e a frase de cada lado | 3 frases + D etiqueta, D nome de X, D nome de Y |
| explica | lâmina livre com desenho (de 0 a 3 por peça) | 2 frases + D etiqueta e os rótulos |
| reconhecer | a pergunta que separa, as duas setas e os dois nomes | 2 frases + D etiqueta, D pergunta, D dos dois ramos, D nome de X, D nome de Y |
| resumo | o cartão escuro com X e Y, o ≠ entre os dois, e as fontes | até 3 frases + D etiqueta e D fontes |

Os nomes dos dois conceitos são escritos uma vez (no exemplo, D02 e D03) e voltam na capa, no conceito, no caso e na pergunta.

## O que o chat 1 preenche

- textos.txt, as frases e as palavras do desenho.
- score.js, o ROTEIRO (a ordem das lâminas e quantas lâminas livres) e o DESTAQUE. Está marcado TROQUE.
- film-2-desenhos.js, um desenho por lâmina (na capa, um por lado; no caso, um por coluna). No molde, cada desenho é só uma moldura com um X, marcada TROQUE.
- alt.txt, legenda.txt e, se usar cor fora da paleta (pele e cabelo das pessoas), o "cores" do peca.json.

O resto é do tipo e não muda: film-1-base.js, film-3-moldes.js, film-9-filme.js, index.html e peca.js.

O peca.js é a conferência do tipo. Ela roda no comando textos e trava se faltar a lâmina de conceito de um dos dois, o caso ou a pergunta, ou se o caso e a pergunta não usarem os mesmos nomes da capa, na mesma ordem.

Na peça de exemplo (exemplo-rastreamento), o chat escreveu 19,6 mil caracteres além do molde, e 9,9 mil deles são o desenho. A peça inteira tem 40,0 mil.

## Os comandos

De dentro da pasta da peça. M é o caminho do motor (.../preseme/reel/motor/preseme.js).

    node M novo <pasta> --de <este tipo>/molde    a peça nova, já com o molde
    node M textos                                 grava o textos.js e roda a conferência do tipo
    node M laminas                                as lâminas, a folha (out/folha.jpg) e os JPEG de subir
    node M conferir                               a conferência inteira, antes de mandar
    node M estilos @l01 giz,lapis,chapado         a capa em três estilos (veja o aviso)
    node M entregar folha                         manda a folha e o textos.txt para ele conferir

Aviso: o comando estilos monta a folha com quadros 9:16 e estica a lâmina 4:5. Enquanto ele não for corrigido, remonte a folha com o script folha-estilos-45.py, que veio junto com os dois tipos: `python3 -I folha-estilos-45.py <pasta da peça> giz,lapis,chapado`, que lê os PNG que o estilos já gravou.
