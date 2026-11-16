#!/usr/bin/env python3
"""PRESEME · motor de pixel art · teste de regressao: o motor tem de desenhar o "A casa 12" igual ao codigo original.

Desenha so 44 quadros (8 sorteados; 22 que passam por toda cena, transicao, ficha, lista, contador, mapa, Nota e cartao;
14 da abertura) e compara a impressao digital de cada um com testes/casa12-esperado.json. Rodar depois de mexer em
qualquer arquivo da pasta pixel. Leva uns 5 s.

  python3 -I testes/regressao.py --brasao <arquivo do brasao> [--dados <pasta dos mapas>] [--saida <pasta>]

O brasao e o arquivo do projeto PRESEME (veja o README); sem ele, os quadros da Nota e do cartao saem diferentes.
"""
import os, sys, json, time
AQUI = os.path.dirname(os.path.abspath(__file__)); RAIZ = os.path.dirname(AQUI); sys.path.insert(0, os.path.join(RAIZ, 'pixel'))
import montador as M, camada as C


def opcao(args, nome, padrao=None):
    if nome in args:
        i = args.index(nome); v = args[i + 1]; del args[i:i + 2]; return v
    return padrao


def main(args):
    brasao, dados = opcao(args, '--brasao'), opcao(args, '--dados')
    peca = os.path.join(RAIZ, 'pecas', 'casa12'); saida = os.path.abspath(opcao(args, '--saida', os.path.join(peca, 'out', 'teste')))
    os.makedirs(saida, exist_ok=True)
    esp = json.load(open(os.path.join(AQUI, 'casa12-esperado.json'), encoding='utf-8'))
    t0 = time.time(); r, tl, total = M.carrega(peca, dados, brasao); C.prepara(r, tl)
    if total != esp['total_quadros']:
        sys.exit('FALHOU: o video tem %d quadros e o original tem %d (o tempo de algum momento mudou)' % (total, esp['total_quadros']))
    feitos = M.quadros_soltos(tl, r, saida, [q['instante'] for q in esp['quadros']], nome='regressao.png')
    ruins = 0
    for q, f in zip(esp['quadros'], feitos):
        ok = f['sha256'].startswith(q['sha256']) and f['quadro'] == q['quadro']; ruins += not ok
        print('%s %6s  %-8s momento %2d  %-12s %-10s %s' % ('ok  ' if ok else 'DIF ', f['quadro'], q['instante'], f['momento'], f['cena'],
                                                         f['acao'], f['sha256'][:16]))
    print('%d de %d quadros iguais ao original, em %.1f s; folha: %s' % (len(feitos) - ruins, len(feitos), time.time() - t0,
                                                                         os.path.join(saida, 'regressao.png')))
    if ruins:
        print('FALHOU: abra os q*.png da pasta %s e compare com o original (sem o --brasao, a Nota e o cartao saem diferentes)' % saida)
        sys.exit(1)


if __name__ == '__main__':
    main(sys.argv[1:])
