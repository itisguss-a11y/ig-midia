# Carrossel "mito ou verdade" · molde

> texto de exemplo escrito pelo Opus; a peça de verdade passa pelo chat 1 (Fable) e pela conferência dos fatos

## O que este tipo faz

Um carrossel 4:5 que pega as frases que todo mundo repete sobre um assunto e dá o veredito de cada uma. Cada frase ganha uma lâmina com a frase num balão e o carimbo MITO, VERDADE ou DEPENDE. A lâmina seguinte mostra o porquê desenhado, porque veredito sem porquê é a peça rasa. O fecho junta tudo numa regra.

Estilo padrão, carimbo e gravura. Sai também nos outros cinco estilos do kit: o qa passou nos seis, nas 9 lâminas do exemplo.

| lâmina | o que aparece | textos |
|---|---|---|
| capa | a etiqueta do tipo, o título, a promessa e o desenho do assunto | [título], [promessa] + D etiqueta |
| dado | o gancho regional em barras (a primeira é a da peça), o que o número quer dizer e a fonte | 3 frases + D etiqueta, D fonte e os pares D nome, D número |
| frase | a frase popular num balão, o carimbo e a cena dela | [a frase, entre aspas] + D veredito |
| porque | o veredito explicado, o carimbo pequeno, o desenho do porquê e a frase de baixo | 2 frases + D etiqueta, D veredito e os rótulos do desenho |
| passos | o porquê como lista do que fazer, com até 5 cartões e um ícone em cada | 2 frases + D etiqueta e um D por passo |
| regra | o cartão escuro com até 3 frases, cada uma com o destaque, e as fontes | até 3 frases + D etiqueta e D fontes |

A cor do carimbo: MITO em Coral, VERDADE em Folha, DEPENDE em Floresta. A letra do carimbo é sempre a cor do texto, por causa do contraste.

## O que o chat 1 preenche

- textos.txt, as frases e as palavras do desenho.
- score.js, o ROTEIRO (para cada frase, a lâmina dela e logo depois a do porquê) e o DESTAQUE. Está marcado TROQUE.
- film-2-desenhos.js, um desenho por lâmina. No molde, cada desenho é só uma moldura com um X, marcada TROQUE.
- alt.txt, legenda.txt e, se usar cor fora da paleta (a pele, por exemplo), o "cores" do peca.json.

O resto é do tipo e não muda: film-1-base.js, film-3-moldes.js, film-9-filme.js, index.html e peca.js.

O peca.js é a conferência do tipo. Ela roda no comando textos e trava se uma frase ficar sem veredito (mito, verdade ou depende), se faltar a lâmina do porquê logo depois da frase, ou se um número do dado não for número.

Na peça de exemplo (exemplo-serpente), o chat escreveu 25,8 mil caracteres além do molde, e 16,0 mil deles são o desenho. A peça inteira tem 45,4 mil.

## Os comandos

De dentro da pasta da peça. M é o caminho do motor (.../preseme/reel/motor/preseme.js).

    node M novo <pasta> --de <este tipo>/molde    a peça nova, já com o molde
    node M textos                                 grava o textos.js e roda a conferência do tipo
    node M laminas                                as lâminas, a folha (out/folha.jpg) e os JPEG de subir
    node M conferir                               a conferência inteira, antes de mandar
    node M estilos @l01 carimbo,giz,chapado       a capa em três estilos (veja o aviso)
    node M entregar folha                         manda a folha e o textos.txt para ele conferir

Aviso: o comando estilos monta a folha com quadros 9:16 e estica a lâmina 4:5. Enquanto ele não for corrigido, remonte a folha com o script folha-estilos-45.py, que veio junto com os dois tipos: `python3 -I folha-estilos-45.py <pasta da peça> carimbo,giz,chapado`, que lê os PNG que o estilos já gravou.
