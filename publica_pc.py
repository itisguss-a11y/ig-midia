#!/usr/bin/env python3
"""Publica um programa do computador (pomodoro.py, cadernos.py) no canal do ig-midia, pasta pc/, cifrado.

O programa do computador procura versão nova em dois lugares: no estudos-apps (privado, pede chave do GitHub)
e aqui, na pasta pc/ do ramo claude/apps do ig-midia (público, sem chave do GitHub, tudo cifrado).

Uso:
  python3 publica_pc.py --repo PASTA_DO_RAMO --chave chave_pc.hex --app pomodoro --arquivo pomodoro.py --notas "o que mudou"
  python3 publica_pc.py --repo PASTA_DO_RAMO --chave chave_pc.hex --listar
  python3 publica_pc.py --chave chave_pc.hex --abrir ARQUIVO.bin --saida ARQUIVO.py

O arquivo vai SEM a chave do Notion (a linha ESTUDOS_NOTION_EMBUTIDA sai em branco, como faz a função
nv_sem_chave do próprio programa): a versão baixada recebe a chave da versão instalada.
A versão é lida da linha VERSAO_<APP> = número. Versão que não sobe é recusada (use --forcar para repetir).

Formato MSD2 (só biblioteca padrão, para o programa não precisar de nada instalado):
  b"MSD2" + 16 bytes sorteados + conteúdo cifrado + selo de 32 bytes.
  chave da cifra = HMAC-SHA256(chave, "cifra"); chave do selo = HMAC-SHA256(chave, "selo");
  bloco i do fluxo = HMAC-SHA256(chave da cifra, sorteio + i em 8 bytes); selo = HMAC-SHA256(chave do selo, tudo antes dele).
Lista das versões (pc/v.bin, cifrada): {"v":1,"gerado":"...","apps":{"pomodoro":{"versao","arquivo","sha256","tamanho","notas"}}}
"""
import argparse
import hashlib
import hmac
import json
import os
import re
import secrets
import sys
from datetime import datetime, timedelta, timezone

MAGICO = b"MSD2"


def ler_chave(caminho):
    with open(caminho, "r", encoding="ascii") as f:
        h = f.read().strip()
    if not re.fullmatch(r"[0-9a-fA-F]{64}", h):
        sys.exit("a chave precisa ter 64 caracteres hexadecimais")
    return bytes.fromhex(h)


def _chaves(chave):
    return hmac.new(chave, b"cifra", "sha256").digest(), hmac.new(chave, b"selo", "sha256").digest()


def _fluxo(k_cifra, sorteio, n):
    return b"".join(hmac.new(k_cifra, sorteio + i.to_bytes(8, "big"), "sha256").digest()
                    for i in range((n + 31) // 32))[:n]


def fechar(claro, chave):
    k_cifra, k_selo = _chaves(chave)
    sorteio = secrets.token_bytes(16)
    corpo = b""
    if claro:
        corpo = (int.from_bytes(claro, "big") ^ int.from_bytes(_fluxo(k_cifra, sorteio, len(claro)), "big")).to_bytes(len(claro), "big")
    sem_selo = MAGICO + sorteio + corpo
    return sem_selo + hmac.new(k_selo, sem_selo, "sha256").digest()


def abrir(dados, chave):
    if len(dados) < 52 or dados[:4] != MAGICO:
        raise ValueError("não é um arquivo do canal")
    k_cifra, k_selo = _chaves(chave)
    if not hmac.compare_digest(hmac.new(k_selo, dados[:-32], "sha256").digest(), dados[-32:]):
        raise ValueError("o arquivo não confere com a chave")
    sorteio, corpo = dados[4:20], dados[20:-32]
    if not corpo:
        return b""
    return (int.from_bytes(corpo, "big") ^ int.from_bytes(_fluxo(k_cifra, sorteio, len(corpo)), "big")).to_bytes(len(corpo), "big")


def sem_chave(texto):
    """A mesma troca da função nv_sem_chave do programa."""
    return re.sub(r"(?m)^(ESTUDOS_NOTION_EMBUTIDA = )'[^']*'", r"\1''", texto)


def ler_lista(pasta, chave):
    p = os.path.join(pasta, "v.bin")
    if not os.path.isfile(p):
        return {"v": 1, "gerado": "", "apps": {}}
    with open(p, "rb") as f:
        return json.loads(abrir(f.read(), chave).decode("utf-8"))


def agora_boa_vista():
    return datetime.now(timezone(timedelta(hours=-4))).replace(microsecond=0).isoformat()


def main():
    ap = argparse.ArgumentParser(description="Publica programa do computador no canal (pasta pc/), cifrado.")
    ap.add_argument("--repo")
    ap.add_argument("--chave", required=True)
    ap.add_argument("--app")
    ap.add_argument("--arquivo")
    ap.add_argument("--notas", default="")
    ap.add_argument("--listar", action="store_true")
    ap.add_argument("--forcar", action="store_true")
    ap.add_argument("--abrir")
    ap.add_argument("--saida")
    a = ap.parse_args()
    chave = ler_chave(a.chave)

    if a.abrir:
        if not a.saida:
            sys.exit("--abrir pede --saida")
        with open(a.abrir, "rb") as f:
            claro = abrir(f.read(), chave)
        with open(a.saida, "wb") as f:
            f.write(claro)
        print("aberto: %s (%d bytes)" % (a.saida, len(claro)))
        return

    if not a.repo:
        sys.exit("falta --repo")
    pasta = os.path.join(a.repo, "pc")
    lista = ler_lista(pasta, chave)
    if a.listar:
        print(json.dumps(lista, ensure_ascii=False, indent=2))
        return
    if not a.app or not a.arquivo:
        sys.exit("faltam --app e --arquivo")
    if not re.fullmatch(r"[a-z0-9_]{1,30}", a.app):
        sys.exit("nome de app inválido")

    with open(a.arquivo, "r", encoding="utf-8", newline="") as f:
        texto = sem_chave(f.read())
    for marca in ("ntn_", "secret_", "ghp_", "github_pat_"):
        if marca in texto:
            sys.exit("PARADO: o arquivo ainda tem um segredo (%s...) depois de tirar a chave do Notion" % marca)
    m = re.search(r"(?m)^VERSAO_%s = (\d+)" % a.app.upper(), texto)
    if not m:
        sys.exit("não achei a linha VERSAO_%s = número" % a.app.upper())
    versao = int(m.group(1))
    compile(texto, a.app + ".py", "exec")
    claro = texto.encode("utf-8")

    antigo = (lista.get("apps") or {}).get(a.app) or {}
    if versao <= int(antigo.get("versao") or 0) and not a.forcar:
        sys.exit("PARADO: a versão %d não é maior que a do canal (%s)" % (versao, antigo.get("versao")))

    cifrado = fechar(claro, chave)
    assert abrir(cifrado, chave) == claro
    nome = hashlib.sha256(cifrado).hexdigest()[:16] + ".bin"
    os.makedirs(pasta, exist_ok=True)
    with open(os.path.join(pasta, nome), "wb") as f:
        f.write(cifrado)
    velho = antigo.get("arquivo")
    if velho and velho != nome and re.fullmatch(r"[0-9a-f]{16}\.bin", velho):
        try:
            os.remove(os.path.join(pasta, velho))
        except OSError:
            pass
    gerado = agora_boa_vista()
    if lista.get("gerado") and gerado < lista["gerado"]:
        gerado = lista["gerado"]
    lista.setdefault("apps", {})[a.app] = {"versao": versao, "arquivo": nome, "sha256": hashlib.sha256(claro).hexdigest(),
                                           "tamanho": len(claro), "notas": a.notas}
    lista["v"], lista["gerado"] = 1, gerado
    with open(os.path.join(pasta, "v.bin"), "wb") as f:
        f.write(fechar(json.dumps(lista, ensure_ascii=False).encode("utf-8"), chave))
    print(json.dumps(lista, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
