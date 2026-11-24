#!/usr/bin/env python3
"""Guarda e abre a FONTE dos apps no canal, cifrada (mesmo formato do publica.py).

A fonte tem a chave do Notion e a chave do canal dentro: nunca vai legível para o repositório.

Uso:
  python3 cofre.py guardar --chave chave.hex --pasta PASTA_DO_APP --saida fontes/NOME.bin
  python3 cofre.py abrir   --chave chave.hex --arquivo fontes/NOME.bin --destino PASTA_NOVA
  python3 cofre.py listar  --chave chave.hex --arquivo fontes/NOME.bin

guardar: junta a pasta num .tar.gz (sem build, out, bin e .class) e cifra.
Formato: b"MSD1" + nonce(12) + AES-256-GCM(cifrado + tag 16), AAD = b"MSD1".
"""
import argparse
import io
import os
import re
import secrets
import sys
import tarfile

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

MAGICO = b"MSD1"
FORA = {"build", "out", "bin", "__pycache__"}


def ler_chave(caminho):
    with open(caminho, "r", encoding="ascii") as f:
        h = f.read().strip()
    if not re.fullmatch(r"[0-9a-fA-F]{64}", h):
        sys.exit("chave.hex precisa ter 64 caracteres hexadecimais")
    return bytes.fromhex(h)


def cifra(chave, claro):
    nonce = secrets.token_bytes(12)
    return MAGICO + nonce + AESGCM(chave).encrypt(nonce, claro, MAGICO)


def decifra(chave, dados):
    if len(dados) < 32 or dados[:4] != MAGICO:
        sys.exit("arquivo sem cabeçalho MSD1 ou curto demais")
    try:
        return AESGCM(chave).decrypt(dados[4:16], dados[16:], MAGICO)
    except Exception:
        sys.exit("não decifrou (chave errada ou arquivo adulterado)")


def filtro(info):
    partes = info.name.split("/")
    if any(p in FORA for p in partes) or info.name.endswith(".class"):
        return None
    info.uid = info.gid = 0
    info.uname = info.gname = ""
    return info


def guardar(a):
    pasta = os.path.abspath(a.pasta)
    if not os.path.isdir(pasta):
        sys.exit("pasta não existe: %s" % pasta)
    mem = io.BytesIO()
    with tarfile.open(fileobj=mem, mode="w:gz") as t:
        t.add(pasta, arcname=os.path.basename(pasta), filter=filtro)
    claro = mem.getvalue()
    os.makedirs(os.path.dirname(os.path.abspath(a.saida)), exist_ok=True)
    tmp = a.saida + ".tmp"
    with open(tmp, "wb") as f:
        f.write(cifra(ler_chave(a.chave), claro))
    os.replace(tmp, a.saida)
    with tarfile.open(fileobj=io.BytesIO(claro), mode="r:gz") as t:
        n = len([m for m in t.getmembers() if m.isfile()])
    print("guardado: %s (%d arquivos, %d bytes em claro)" % (a.saida, n, len(claro)))


def abrir_tar(a):
    with open(a.arquivo, "rb") as f:
        claro = decifra(ler_chave(a.chave), f.read())
    return tarfile.open(fileobj=io.BytesIO(claro), mode="r:gz")


def abrir(a):
    os.makedirs(a.destino, exist_ok=True)
    with abrir_tar(a) as t:
        t.extractall(a.destino, filter="data")
        n = len([m for m in t.getmembers() if m.isfile()])
    print("aberto em %s (%d arquivos)" % (os.path.abspath(a.destino), n))


def listar(a):
    with abrir_tar(a) as t:
        for m in t.getmembers():
            if m.isfile():
                print("%8d  %s" % (m.size, m.name))


def main():
    ap = argparse.ArgumentParser(description="Fonte dos apps, cifrada, no canal.")
    sub = ap.add_subparsers(dest="cmd", required=True)
    g = sub.add_parser("guardar"); g.add_argument("--chave", required=True); g.add_argument("--pasta", required=True); g.add_argument("--saida", required=True)
    o = sub.add_parser("abrir"); o.add_argument("--chave", required=True); o.add_argument("--arquivo", required=True); o.add_argument("--destino", required=True)
    l = sub.add_parser("listar"); l.add_argument("--chave", required=True); l.add_argument("--arquivo", required=True)
    a = ap.parse_args()
    {"guardar": guardar, "abrir": abrir, "listar": listar}[a.cmd](a)


if __name__ == "__main__":
    main()
