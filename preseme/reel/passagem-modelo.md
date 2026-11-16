# PRESEME · passagem do reel <nome> para o chat 2 · partes 3 a 6, com o motor do reel
<!-- modelo para o Fable: estas quatro partes substituem as partes 3 a 6 da passagem do sus-hoje (23 passos) quando a peça é
feita com o motor do reel. As partes 1, 2 e 7 a 12 continuam como no pipeline. Troque <nome> pelo nome da peça e preencha
a parte 5; o resto fica como está. -->

## 3. Arquivos
Os arquivos da peça estão no repositório, na pasta `preseme/reel/pecas/<nome>/`, e o motor em `preseme/reel/motor/`.

| Arquivo | Para que serve |
|---|---|
| peca.json | nome, título, limite de duração, a capa (marcador), as cores além da paleta e quantas frases e palavras o texto tem |
| textos.txt | o texto da tela, versão aprovada por ele ([01]… e [D01]…) |
| score.js | a linha do tempo: cenas, tempos (saem do tamanho das frases), efeitos e marcadores |
| film-*.js e index.html | o desenho, cena por cena, e a ordem de carga |
| mapa-do-som.json | o som: o clima de cada bloco, o lugar de cada cena, as coisas que aparecem e o silêncio |
| legenda.txt | a legenda e as hashtags |
| peca.js | (se houver) a conferência que é só desta peça |

O que sai dos comandos (não está no repositório): textos.js, out/folha.jpg, out/folha-textos.jpg, out/music.wav, out/<nome>-draft.mp4, out/<nome>.mp4, out/capa-<nome>.png.

## 4. Motor e ferramentas, já escolhidos
- **Desenho:** animation-studio, pelo motor do reel. Motivo: a folha aprovada saiu dele e todas as cenas já estão desenhadas no código. Não use outro programa e não desenhe nada.
- **Som:** o comando `som`, que lê o mapa-do-som.json. Não escreva música nem efeito à mão.
- **Conferência dos fatos:** um agente separado (ferramenta Agent, modelo fable), no passo 6.
- Em todo comando abaixo, `M` é `node /home/claude/ig-midia/preseme/reel/motor/preseme.js`. Se o repositório estiver em outra pasta, troque só esse começo.

## 5. O desenho, cena por cena
(o Fable preenche: uma linha por quadro da folha, "o que tem de aparecer", como na parte 5 da passagem do sus-hoje)

## 6. Passos
Rode cada comando de dentro de `/home/claude/<nome>`, com `cd /home/claude/<nome> &&` na frente (menos o passo 1).

1. **Montar.** Carregue a skill `animation-studio:animation-studio` (ferramenta Skill). Se `/home/claude/ig-midia` não existir: `git clone --depth 1 https://github.com/itisguss-a11y/ig-midia /home/claude/ig-midia`. Depois: `M novo /home/claude/<nome> --de /home/claude/ig-midia/preseme/reel/pecas/<nome>`. Tem de sair: três linhas com ✓ (Node, ffmpeg, Chrome), "peça montada", "textos.js gravado: <N> frases e <M> palavras do desenho" e "duração: <X> s". Linha com ✗ ou ERRO: pare (parte 7).
2. **Conferir o desenho e o som.** `M quadros` e abra `out/folha.jpg` com Read: cada quadro tem de bater com a parte 5. Depois `M som`: tem de sair "out/music.wav gravado", entre -17 e -15 LUFS. Depois `M conferir`: tem de terminar em "CONFERÊNCIA: nenhum erro". Aviso de cor ou de ritmo: anote em "O que travou" e siga.
3. **Folha de textos para ele** (decisão 115, no lugar do piloto). `M folha-textos`, abra `out/folha-textos.jpg` com Read, depois `M entregar folha`. Mande com SendUserFile os dois arquivos que o comando lista e a mensagem que ele imprime, sem mudar nada.
4. **Quando ele devolver o textos.txt** (arquivo ou texto colado): grave exatamente o que ele mandou em `out/textos-devolvido-1.txt` (na segunda vez, `-2`). Rode `M compara out/textos-enviado-1.txt out/textos-devolvido-1.txt` e grave a saída inteira no documento de amostras de voz da peça. Depois `M textos out/textos-devolvido-1.txt`: tem de sair "LEITURA OK" e, se a peça tiver peca.js, a conferência dela OK. Ele apagou uma cena inteira, ou a conferência da peça deu ERRO: pare (parte 7). Linha com fato que ele mudou (parte 8): anote o número para o passo 6. Se ele pedir para ver em vídeo: `M rascunho` (run_in_background: true; uns 9 min para 3 min de vídeo, até 13 com a máquina ocupada) e `M entregar rascunho`.
5. **Ajuste pequeno depois do rascunho** (o tempo total não mudou): `M trecho [NN] [MM]`, do começo da primeira frase mexida ao fim da última, em vez do rascunho inteiro (1 a 2 min; o resto do vídeo não é refeito nem recomprimido). Se o comando disser que mudou também fora do trecho, aumente o trecho como ele indicar; se disser que o tempo total mudou, rode `M rascunho`.
6. **Conferência dos fatos.** Ferramenta Agent, com `subagent_type: "general-purpose"`, `model: "fable"`, `run_in_background: false`, e o pedido da parte 16 da passagem do sus-hoje, trocando o caminho do textos.txt por `/home/claude/<nome>/textos.txt`. "TUDO CONFERE": siga. "HÁ LINHA QUE NÃO CONFERE": pare e mande a ele, uma linha por número.
7. **Definitivo.** `M definitivo` (run_in_background: true; umas 3 a 4 vezes o tempo do rascunho). Tem de terminar em "definitivo pronto". Depois `M capa` e abra `out/capa-grade.jpg`: o que importa aparece inteiro no recorte. Depois `M conferir`: "CONFERÊNCIA: nenhum erro".
8. **Entrega.** Confira a parte 10. `M entregar` e mande com SendUserFile os quatro arquivos que ele lista, com a mensagem que ele imprime.
9. **Registro.** Como no passo 23 da passagem do sus-hoje (página de estado, registros e Mapa de projetos), numa leva só.
