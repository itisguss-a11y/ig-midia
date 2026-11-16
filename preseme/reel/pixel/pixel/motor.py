#!/usr/bin/env python3
"""PRESEME · motor de pixel art (o do reel "A casa 12", feito motor em 16/11/2026)

Uso (de dentro da pasta preseme/reel-pixel, ou com o caminho inteiro):
  python3 -I pixel/motor.py dados                              baixa os mapas oficiais (IBGE e FUNAI) e as duas letras, uma vez por maquina
  python3 -I pixel/motor.py novo <pasta>                       cria a pasta de uma peca nova, com roteiro.json e peca.py de exemplo
  python3 -I pixel/motor.py folha <peca>                       passada 1 inteira (pula se o desenho nao mudou), capa e folha de momentos
  python3 -I pixel/motor.py quadros <peca> <instantes...>      so os quadros pedidos: 12.5 (segundos do video), #1234 (quadro do roteiro),
                                                               3:0.4 (momento:fracao) ou ab66 / ab:0.5 (quadro da abertura)
  python3 -I pixel/motor.py texto <peca>                       so a passada 2 e o video: trocar uma palavra sem redesenhar
  python3 -I pixel/motor.py video <peca>                       tudo: cena, texto, som, MP4, capa, folha, legenda e cortes.json
  python3 -I pixel/motor.py capa <peca>                        so a capa e o recorte da grade do perfil
  python3 -I pixel/motor.py textos <peca> [--aplica <txt>]     gera o textos.txt; com --aplica, poe no roteiro.json o txt que ele devolveu
  python3 -I pixel/motor.py cortes <peca>                      os cortes: out/cenas.json (o contrato do motor do reel: cenas, frases,
                                                               efeitos e marcadores) e out/cortes.json (cada momento, as trocas, os efeitos)
  python3 -I pixel/motor.py para-reel <peca> [--destino <pasta>]  monta a pasta para o motor do reel (video de fora): peca.json,
                                                               textos.txt, cenas.json, mapa-do-som.json, legenda.txt, out/video.mp4
                                                               e a capa (padrao: <saida>/reel/<nome do arquivo>)
Opcoes: --saida <pasta> (padrao: <peca>/out) · --dados <pasta> · --brasao <arquivo> (peca que usa o brasao da UFRR)
        --som <arquivo.wav> (som pronto no lugar da trilha, para o video inteiro) · --forca (aplica textos.txt de outra versao)
        --sem-abertura (o video sem a abertura da peca, como antes dela; serve para comparar com uma versao antiga)
"""
import os, sys, json, shutil, hashlib, subprocess
AQUI = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, AQUI)
import montador as M, camada as C, papeis as P, nucleo as N

URLS = {'rr-mun.json': 'https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-14-mun.json',
        'am-mun.json': 'https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-13-mun.json',
        'ti.gpkg': 'https://github.com/ipeaGIT/geobr/releases/download/v1.7.0/indigenous_land_202103_simplified.gpkg'}
FONTES = {N.FONT: 'https://raw.githubusercontent.com/google/fonts/main/ofl/pixelifysans/PixelifySans%5Bwght%5D.ttf',
          N.FD: 'https://raw.githubusercontent.com/google/fonts/main/ofl/pressstart2p/PressStart2P-Regular.ttf'}


def opcao(args, nome, padrao=None):
    if nome in args:
        i = args.index(nome); v = args[i + 1]; del args[i:i + 2]; return v
    return padrao


def avisos():
    if P.AVISOS:
        print('AVISOS (texto que nao coube no papel; encurte a frase no textos.txt):')
        for a in sorted(set(P.AVISOS)):
            print('  ', a)


def main(argv):
    args = list(argv)
    if not args or args[0] in ('-h', '--help', 'ajuda'):
        print(__doc__); return
    cmd = args.pop(0)
    dados, brasao, som = opcao(args, '--dados'), opcao(args, '--brasao'), opcao(args, '--som')
    saida = opcao(args, '--saida'); destino = opcao(args, '--destino'); forca = '--forca' in args
    M.CFG['sem_abertura'] = '--sem-abertura' in args
    args = [a for a in args if a not in ('--forca', '--sem-abertura')]
    if cmd == 'dados':
        pasta = os.path.abspath(dados or N.DADOS[0]); os.makedirs(pasta, exist_ok=True)
        for nome, url in URLS.items():
            destino = os.path.join(pasta, nome)
            if not os.path.exists(destino):
                subprocess.run(['curl', '-sSfL', '-o', destino, url], check=True)
            print('ok', destino, '%.0f KB' % (os.path.getsize(destino) / 1024))
        for destino, url in FONTES.items():                 # as letras (licenca OFL, do repositorio google/fonts)
            if not os.path.exists(destino):
                os.makedirs(os.path.dirname(destino), exist_ok=True); subprocess.run(['curl', '-sSfL', '-o', destino, url], check=True)
            print('ok', destino, '%.0f KB' % (os.path.getsize(destino) / 1024))
        return
    if cmd == 'novo':
        destino = os.path.abspath(args[0]); modelo = os.path.join(AQUI, '..', 'pecas', 'exemplo-minimo')
        if os.path.exists(destino):
            sys.exit('PAROU: %s ja existe' % destino)
        os.makedirs(destino)
        for nome in ('roteiro.json', 'peca.py', 'mapa-do-som.json'):
            if os.path.exists(os.path.join(modelo, nome)):
                shutil.copy(os.path.join(modelo, nome), destino)
        r = json.load(open(os.path.join(destino, 'roteiro.json'), encoding='utf-8')); r['nome'] = os.path.basename(destino)
        r['semente'] = os.path.basename(destino); r.pop('arquivo', None)
        json.dump(r, open(os.path.join(destino, 'roteiro.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print('ok', destino, '(roteiro.json, peca.py e mapa-do-som.json copiados da peca exemplo-minimo; troque o texto no roteiro, '
              'as cenas no peca.py e o som no mapa)')
        return
    peca = args.pop(0); pasta = os.path.abspath(saida or os.path.join(peca, 'out')); os.makedirs(pasta, exist_ok=True)
    r, tl, total = M.carrega(peca, dados, brasao)
    if cmd == 'textos':
        aplicar = opcao(args, '--aplica')
        rot = os.path.join(peca, 'roteiro.json')
        if aplicar:
            r2, mud = M.aplica_textos(r, aplicar, forca)
            shutil.copy(rot, os.path.join(pasta, 'roteiro-antes.json'))
            json.dump(r2, open(rot, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            print('\n'.join(mud) if mud else 'nada mudou')
            tl2, total2 = M.linha_do_tempo(r2)
            print('ok', rot, '(%d mudancas; antes: %s)' % (len(mud), os.path.join(pasta, 'roteiro-antes.json')))
            print('proximo passo:', 'texto (o tempo nao mudou)' if [e['nf'] for e in tl2] == [e['nf'] for e in tl] else
                  'video (o tempo de algum momento mudou, entao a cena precisa ser desenhada de novo)')
            return
        n1, n2 = M.gera_textos(r, os.path.join(pasta, 'textos.txt'))
        print('ok', os.path.join(pasta, 'textos.txt'), '(%d linhas da tela e %d de dentro do desenho)' % (n1, n2)); return
    if cmd == 'quadros':
        sons = C.prepara(r, tl)
        out = M.quadros_soltos(tl, r, pasta, args)
        for q in out:
            print('%6s  %7.3f s  momento %2d  %-12s %-10s %s' % (q['quadro'], q['segundos'], q['momento'], q['cena'], q['acao'], q['sha256'][:16]))
        json.dump(out, open(os.path.join(pasta, 'quadros.json'), 'w'), ensure_ascii=False, indent=1)
        avisos(); print('ok', os.path.join(pasta, 'quadros.png')); return
    if cmd == 'cortes':
        sons = C.prepara(r, tl); m = M.base_valida(tl, total, pasta); sons += (m['eventos'] if m else [])
        cj = M.cortes(tl, r, sons); cr = M.cenas_reel(tl, r, sons)
        json.dump(cj, open(os.path.join(pasta, 'cortes.json'), 'w'), ensure_ascii=False, indent=1)
        json.dump(cr, open(os.path.join(pasta, 'cenas.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        for c in cr['cenas']:
            print('  %-14s %7.3f a %7.3f s' % (c['id'], c['t0'], c['t1']))
        print('ok', os.path.join(pasta, 'cenas.json'), 'e cortes.json (%d cenas, %d frases, %d efeitos%s)' % (len(cr['cenas']), len(cr['frases']),
              len(cr['efeitos']), '' if m else '; os efeitos do desenho entram depois da passada 1')); return
    if cmd == 'para-reel':
        m = M.base_valida(tl, total, pasta)
        if not m:
            sys.exit('PAROU: a passada 1 desta peca nao esta pronta, ou o desenho mudou. Rode: video')
        sons = C.prepara(r, tl) + m['eventos']; M.capa(tl, r, pasta)
        dest, cr = M.para_reel(tl, r, sons, pasta, os.path.abspath(peca), destino or os.path.join(pasta, 'reel', M.nome_arquivo(r)))
        print('ok', dest, '(%d cenas: %s; %d frases; %d efeitos)' % (len(cr['cenas']), ', '.join(c['id'] for c in cr['cenas']), len(cr['frases']), len(cr['efeitos'])))
        print('proximo (motor do reel): node <motor do reel>/preseme.js textos --peca %s ; depois som, juntar, conferir e entregar' % dest)
        return
    if cmd == 'capa':
        C.prepara(r, tl); M.capa(tl, r, pasta); avisos(); print('ok', os.path.join(pasta, 'capa.png'), os.path.join(pasta, 'capa-grade.jpg')); return
    if cmd == 'texto':
        m = M.base_valida(tl, total, pasta)
        if not m:
            sys.exit('PAROU: a passada 1 desta peca nao esta pronta, ou o desenho ou o tempo de algum momento mudou. Rode: video')
        ev = m['eventos']
    else:
        ev = M.passada_base(tl, total, pasta)
    sons = C.prepara(r, tl) + ev
    M.capa(tl, r, pasta); M.folha(tl, r, pasta)
    if r.get('legenda'):
        open(os.path.join(pasta, 'legenda.txt'), 'w', encoding='utf-8').write('\n'.join(r['legenda']) + '\n')
    json.dump(M.cortes(tl, r, sons), open(os.path.join(pasta, 'cortes.json'), 'w'), ensure_ascii=False, indent=1)
    json.dump(M.cenas_reel(tl, r, sons), open(os.path.join(pasta, 'cenas.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    avisos()
    if cmd in ('video', 'texto'):
        M.video(tl, total, r, pasta, sons, som=som)
        M.gera_textos(r, os.path.join(pasta, 'textos.txt'))
    nab = M.abertura_nf(r)
    print('fim', cmd, total + nab, 'quadros', '%.1f s' % ((total + nab) / N.FPS), '(com a abertura de %d quadros)' % nab if nab else '', '->', pasta)


if __name__ == '__main__':
    main(sys.argv[1:])
