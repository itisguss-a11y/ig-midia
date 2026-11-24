#!/usr/bin/env python3
"""Publica APKs no canal cifrado do Instalador (não roda git).

Uso:
  python3 publica.py --repo PASTA_DO_RAMO --chave chave.hex --apk A.apk --nome "Mentor" --notas "o que mudou" [--apk ... --nome ... --notas ...] [--forcar]
  python3 publica.py --repo PASTA --chave chave.hex --listar
  python3 publica.py --repo PASTA --chave chave.hex --remover PACOTE

Formato: b"MSD1" + nonce(12) + AES-256-GCM(cifrado + tag 16), AAD = b"MSD1".
"""
import argparse
import datetime
import hashlib
import json
import os
import re
import secrets
import subprocess
import sys

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

MAGICO = b"MSD1"
AAPT2_PADRAO = "/home/claude/work/apps/tools/apk_x/prebuilt/linux/aapt2"
FUSO = datetime.timezone(datetime.timedelta(hours=-4))  # America/Boa_Vista


class Erro(Exception):
    pass


def ler_chave(caminho):
    with open(caminho, "r", encoding="ascii") as f:
        h = f.read().strip()
    if not re.fullmatch(r"[0-9a-fA-F]{64}", h):
        raise Erro("chave.hex precisa ter 64 caracteres hexadecimais")
    return bytes.fromhex(h)


def cifra(chave, claro):
    nonce = secrets.token_bytes(12)
    return MAGICO + nonce + AESGCM(chave).encrypt(nonce, claro, MAGICO)


def decifra(chave, dados):
    if len(dados) < 4 + 12 + 16 or dados[:4] != MAGICO:
        raise Erro("arquivo sem cabeçalho MSD1 ou curto demais")
    try:
        return AESGCM(chave).decrypt(dados[4:16], dados[16:], MAGICO)
    except Exception:
        raise Erro("não decifrou (chave errada ou arquivo adulterado)")


def badging(aapt2, apk):
    try:
        out = subprocess.run([aapt2, "dump", "badging", apk], capture_output=True, text=True, check=True).stdout
    except subprocess.CalledProcessError as e:
        raise Erro("aapt2 não leu %s: %s" % (apk, e.stderr.strip()[:300]))
    m = re.search(r"package: name='([^']+)' versionCode='(\d+)' versionName='([^']*)'", out)
    if not m:
        raise Erro("aapt2 não achou pacote/versão em %s" % apk)
    return m.group(1), int(m.group(2)), m.group(3)


def gravar(caminho, dados):
    tmp = caminho + ".tmp"
    with open(tmp, "wb") as f:
        f.write(dados)
    os.replace(tmp, caminho)


def ler_manifesto(repo, chave):
    p = os.path.join(repo, "m.bin")
    if not os.path.exists(p):
        return {"v": 1, "gerado": "", "apps": []}
    with open(p, "rb") as f:
        m = json.loads(decifra(chave, f.read()).decode("utf-8"))
    if m.get("v") != 1 or not isinstance(m.get("apps"), list):
        raise Erro("m.bin existente tem formato desconhecido")
    return m


def gravar_manifesto(repo, chave, m):
    m["v"] = 1
    fmt = "%Y-%m-%dT%H:%M:%S-04:00"
    agora = datetime.datetime.now(FUSO)
    # O app ignora manifesto com "gerado" mais antigo que o que ele já guardou (comparação de texto).
    # Se o relógio daqui estiver atrasado, a data nova é empurrada para 1 s depois da anterior.
    antes = m.get("gerado") or ""
    try:
        t_antes = datetime.datetime.strptime(antes, fmt).replace(tzinfo=FUSO) if antes else None
    except ValueError:
        t_antes = None
    if t_antes is not None and agora <= t_antes:
        agora = t_antes + datetime.timedelta(seconds=1)
    m["gerado"] = agora.strftime(fmt)
    claro = json.dumps(m, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    gravar(os.path.join(repo, "m.bin"), cifra(chave, claro))
    return m


def nome_arquivo(repo):
    while True:
        n = secrets.token_hex(8) + ".bin"
        if not os.path.exists(os.path.join(repo, n)):
            return n


def apagar_bin(repo, arquivo):
    if arquivo and re.fullmatch(r"[0-9a-f]{16}\.bin", arquivo):
        p = os.path.join(repo, arquivo)
        if os.path.exists(p):
            os.remove(p)
            return True
    return False


def mostrar(m):
    print(json.dumps(m, ensure_ascii=False, indent=2))


def main(argv=None):
    ap = argparse.ArgumentParser(description="Publica APKs no canal cifrado do Instalador.")
    ap.add_argument("--repo", required=True, help="pasta do ramo claude/apps (já clonada)")
    ap.add_argument("--chave", required=True, help="arquivo chave.hex")
    ap.add_argument("--apk", action="append", default=[])
    ap.add_argument("--nome", action="append", default=[])
    ap.add_argument("--notas", action="append", default=[])
    ap.add_argument("--aapt2", default=AAPT2_PADRAO)
    ap.add_argument("--forcar", action="store_true", help="aceita versionCode menor ou igual ao publicado")
    ap.add_argument("--listar", action="store_true")
    ap.add_argument("--remover", metavar="PACOTE")
    a = ap.parse_args(argv)

    try:
        if not os.path.isdir(a.repo):
            raise Erro("pasta do repositório não existe: %s" % a.repo)
        chave = ler_chave(a.chave)
        m = ler_manifesto(a.repo, chave)

        if a.listar:
            mostrar(m)
            return 0

        if a.remover:
            antes = len(m["apps"])
            for e in m["apps"]:
                if e.get("pacote") == a.remover:
                    apagar_bin(a.repo, e.get("arquivo"))
            m["apps"] = [e for e in m["apps"] if e.get("pacote") != a.remover]
            if len(m["apps"]) == antes:
                raise Erro("pacote não está no manifesto: %s" % a.remover)
            mostrar(gravar_manifesto(a.repo, chave, m))
            return 0

        if not a.apk:
            raise Erro("nada a fazer: passe --apk/--nome/--notas, --listar ou --remover")
        if len(a.nome) != len(a.apk):
            raise Erro("cada --apk precisa de um --nome")
        notas = a.notas + [""] * (len(a.apk) - len(a.notas))
        if len(a.notas) > len(a.apk):
            raise Erro("há mais --notas que --apk")

        # confere tudo antes de gravar qualquer coisa
        novos, vistos = [], set()
        for apk, nome, nota in zip(a.apk, a.nome, notas):
            pacote, vc, vn = badging(a.aapt2, apk)
            if pacote in vistos:
                raise Erro("o mesmo pacote apareceu duas vezes: %s" % pacote)
            vistos.add(pacote)
            if not nome.strip():
                raise Erro("--nome vazio para %s" % apk)
            atual = next((e for e in m["apps"] if e.get("pacote") == pacote), None)
            if atual and vc <= int(atual.get("versionCode", 0)) and not a.forcar:
                raise Erro("%s: versionCode %d não é maior que o publicado (%s); use --forcar se for de propósito"
                           % (pacote, vc, atual.get("versionCode")))
            with open(apk, "rb") as f:
                dados = f.read()
            novos.append((pacote, vc, vn, nome.strip(), nota.strip(), dados, atual))

        for pacote, vc, vn, nome, nota, dados, atual in novos:
            arq = nome_arquivo(a.repo)
            gravar(os.path.join(a.repo, arq), cifra(chave, dados))
            entrada = {"pacote": pacote, "nome": nome, "versionCode": vc, "versionName": vn,
                       "arquivo": arq, "sha256": hashlib.sha256(dados).hexdigest(),
                       "tamanho": len(dados), "notas": nota}
            if atual:
                apagar_bin(a.repo, atual.get("arquivo"))
                m["apps"] = [entrada if e.get("pacote") == pacote else e for e in m["apps"]]
            else:
                m["apps"].append(entrada)
        mostrar(gravar_manifesto(a.repo, chave, m))
        return 0
    except Erro as e:
        print("ERRO: %s" % e, file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
