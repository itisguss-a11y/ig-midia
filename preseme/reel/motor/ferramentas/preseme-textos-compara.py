#!/usr/bin/env python3
# PRESEME · compara o textos.txt mandado com o que ele devolveu
#
# Para que serve: todo vídeo sai com um textos.txt ("[01] frase"). Quando ele
# devolve o arquivo editado, este script diz o que ele mudou, apagou e escreveu,
# já no formato do caderno da voz (claude/preseme-voice.md). Linha igual é texto
# do Claude que ele só manteve: não é amostra da voz.
#
# Uso (no ambiente do Claude, nunca no computador dele):
#   python3 preseme-textos-compara.py mandado.txt devolvido.txt
#   python3 preseme-textos-compara.py mandado.txt devolvido.txt --conta
#
# --conta: confere também a recontagem do fim do roteiro. Soma as linhas do tipo
# "Vigilância sanitária, 5." e compara com o número da frase "usou o SUS N vezes".

import re
import sys

NUMERADA = re.compile(r"\s*\[(\d+)\]\s*(.*?)\s*$")
PARCELA = re.compile(r"^(.+),\s*(\d+)\.?$")
TOTAL = re.compile(r"usou o SUS (\d+) vez", re.IGNORECASE)


def ler(caminho):
    linhas = {}
    with open(caminho, encoding="utf-8") as arquivo:
        for bruto in arquivo:
            achou = NUMERADA.match(bruto)
            if achou:
                linhas[int(achou.group(1))] = achou.group(2)
    return linhas


def compara(antes, depois):
    mudou = [n for n in sorted(antes) if n in depois and antes[n] != depois[n]]
    saiu = [n for n in sorted(antes) if n not in depois]
    entrou = [n for n in sorted(depois) if n not in antes]
    print(
        f"{len(antes)} linhas mandadas, {len(depois)} devolvidas: "
        f"{len(mudou)} mudadas, {len(saiu)} apagadas, {len(entrou)} novas"
    )
    for n in mudou:
        print(f'[{n:02d}] ELE: "{depois[n]}" · ANTES: "{antes[n]}"')
    for n in saiu:
        print(f'[{n:02d}] APAGADA por ele · ANTES: "{antes[n]}"')
    for n in entrou:
        print(f'[{n:02d}] NOVA, dele: "{depois[n]}"')
    iguais = len(antes) - len(mudou) - len(saiu)
    print(f"{iguais} linhas iguais (texto que ele só manteve: não é amostra da voz)")


def confere_conta(linhas):
    parcelas, total = [], None
    for n in sorted(linhas):
        texto = linhas[n]
        achou_total = TOTAL.search(texto)
        if achou_total:
            total = int(achou_total.group(1))
            continue
        achou = PARCELA.match(texto)
        if achou:
            parcelas.append((achou.group(1), int(achou.group(2))))
    soma = sum(valor for _, valor in parcelas)
    for nome, valor in parcelas:
        print(f"  {valor} · {nome}")
    if total is None:
        print("CONTA: não achei a frase 'usou o SUS N vezes'")
    elif soma == total:
        print(f"CONTA OK: as parcelas somam {soma} e a frase diz {total}")
    else:
        print(f"CONTA ERRADA: as parcelas somam {soma} e a frase diz {total}")
    return total is not None and soma == total


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) != 2:
        sys.exit("uso: preseme-textos-compara.py mandado.txt devolvido.txt [--conta]")
    antes, depois = ler(args[0]), ler(args[1])
    compara(antes, depois)
    if "--conta" in sys.argv and not confere_conta(depois):
        sys.exit(1)


if __name__ == "__main__":
    main()
