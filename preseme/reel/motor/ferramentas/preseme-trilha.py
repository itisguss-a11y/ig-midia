#!/usr/bin/env python3
"""PRESEME · trilha própria, sintetizada, diferente em cada peça (13/11/2026).
Por que existe: todos os reels copiavam a mesma função de trilha (os mesmos quatro acordes, o mesmo andamento),
e ele reclamou: "precisamos fazer músicas diferentes, tamo só repetindo".
Uso: python3 -I preseme-trilha.py <saida.wav> <segundos> <clima> <semente> [efeitos.json]
  clima: curioso | calmo | brincalhao | serio   (o roteiro escolhe, pelo tom da peça)
  semente: o nome da peça. A mesma semente dá sempre a mesma música; outra semente muda tom, modo, andamento,
           acordes, melodia, ritmo e instrumentos.
  efeitos.json (opcional): efeitos sonoros discretos por cima da música. Ele pediu em 13/11: "efeitos sonoros, nada
           exagerado, só uma forma de fazer com que não fique só música de fundo". É uma lista:
           [{"t": 3.2, "som": "pop"}, {"t": 7.0, "som": "sino", "vol": 0.7}]   (t em segundos; vol de 0 a 1, opcional)
           Sons: pop (algo aparece), tique (um passo, uma marca), sopro (algo passa), gota, sino (o destaque),
           certo (feito, conferido), baque (algo pousa), lapis (um risco). Poucos, e só quando algo acontece na tela.
Dentro de um gerador de reel: subprocess.run([sys.executable, "-I", "preseme-trilha.py", str(wav), str(DUR), clima, NOME, str(efeitos_json)], check=True)
A saída é um WAV estéreo de 44,1 kHz com pico em 0,7 e a sala já aplicada. No ffmpeg, usar só
"loudnorm=I=-16:TP=-1.5:LRA=11" (sem aecho nem lowpass). Só numpy; música feita aqui, sem direito autoral de ninguém."""
import json, sys, wave, zlib
import numpy as np

SR = 44100
MODOS = {"maior": (0, 2, 4, 5, 7, 9, 11), "lidio": (0, 2, 4, 6, 7, 9, 11), "mixo": (0, 2, 4, 5, 7, 9, 10),
         "dorico": (0, 2, 3, 5, 7, 9, 10), "menor": (0, 2, 3, 5, 7, 8, 10)}
PROG = {"maior": ((0, 4, 5, 3), (0, 5, 3, 4), (5, 3, 0, 4), (0, 3, 5, 4), (0, 2, 3, 4)),
        "lidio": ((0, 1, 0, 1), (0, 1, 5, 1), (0, 4, 1, 0)),
        "mixo": ((0, 6, 3, 0), (0, 3, 6, 0), (0, 4, 6, 3)),
        "dorico": ((0, 3, 0, 3), (0, 3, 6, 3), (0, 6, 3, 0), (0, 2, 3, 0)),
        "menor": ((0, 5, 2, 6), (0, 5, 6, 0), (0, 3, 5, 6), (0, 6, 5, 6))}
CLIMAS = {
    "curioso": dict(modos=("dorico", "lidio", "mixo"), bpm=(94, 108), base=("marimba", "pluck"), solo=("pluck", "epiano", "marimba"), perc="leve", setima=True, balanco=(.0, .16), denso=True),
    "calmo": dict(modos=("maior", "lidio"), bpm=(68, 80), base=("epiano", "pluck"), solo=("epiano", "marimba"), perc=None, setima=True, balanco=(.0, .0), denso=False),
    "brincalhao": dict(modos=("maior", "mixo"), bpm=(110, 124), base=("pluck", "marimba"), solo=("marimba", "pluck"), perc="cheia", setima=False, balanco=(.08, .22), denso=True),
    "serio": dict(modos=("menor", "dorico"), bpm=(76, 88), base=("epiano", "pluck"), solo=("epiano", "pluck"), perc="pulso", setima=False, balanco=(.0, .0), denso=False)}
RITMOS_BASE = ("1010101010101010", "1001001010010010", "1011011010110110", "1000101010001010", "1010010010100100", "1001101010011010")
RITMOS_LENTOS = ("1000100010001000", "1000001010000010", "1000100000101000", "1001000010000100")
RITMOS_SOLO = ("1000001010000000", "1001000010100000", "0010100010000010", "1000100000101000", "1010000010010000", "0000101000101000")
RITMOS_BAIXO = ("1000000000100000", "1000001000100000", "1000000010000000", "1001000010010000")
CLAVES = ((0, 3, 6, 10, 12), (0, 6, 10), (3, 6, 11, 14), (0, 4, 10, 14))
ORDENS = ((0, 1, 2, 3), (0, 1, 2, 1), (0, 2, 1, 2), (0, 2, 1, 3), (2, 1, 0, 1), (0, 3, 2, 1))
NOTAS = ("dó", "dó#", "ré", "ré#", "mi", "fá", "fá#", "sol", "sol#", "lá", "lá#", "si")


def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def _t(d): return np.arange(int(SR * d)) / SR
def _ataque(t, a=.004): return np.minimum(1, t / a)


def pluck(f, d=1.2):                                   # corda dedilhada: os harmônicos altos morrem primeiro
    t = _t(d); y = sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (2.6 + 1.5 * h)) / h for h in range(1, 7))
    return y * _ataque(t) * .7
def marimba(f, d=.9):
    t = _t(d); y = np.sin(2 * np.pi * f * t) * np.exp(-6 * t) + .32 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-15 * t) + .1 * np.sin(2 * np.pi * 9.2 * f * t) * np.exp(-32 * t)
    return y * _ataque(t, .002)
def epiano(f, d=1.6):                                  # piano elétrico: o brilho some logo depois do ataque
    t = _t(d); i = 1.9 * np.exp(-5 * t) + .25
    y = np.sin(2 * np.pi * f * t + i * np.sin(2 * np.pi * f * t)) * np.exp(-2.4 * t) + .06 * np.sin(2 * np.pi * 7 * f * t) * np.exp(-14 * t)
    return y * _ataque(t) * .8
def cama(f, d):                                        # acorde longo e macio por baixo de tudo
    t = _t(d); y = (np.sin(2 * np.pi * f * t) + np.sin(2 * np.pi * f * 1.004 * t) + np.sin(2 * np.pi * f * .996 * t)) / 3 + .2 * np.sin(2 * np.pi * 2 * f * t)
    return y * np.minimum(1, t / .5) * np.clip((d - t) / .6, 0, 1) * (1 + .08 * np.sin(2 * np.pi * .23 * t))
def baixo(f, d=.7):
    t = _t(d); return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * 2 * f * t) + .25 * np.sin(2 * np.pi * 3 * f * t)) * np.exp(-4.5 * t) * _ataque(t, .006) * .6
def tum():
    t = _t(.22); f = 110 + 120 * np.exp(-30 * t); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-16 * t)
def chiado(rng, d=.05, k=70):                         # ruído só na faixa do meio (sem o chiado fino lá de cima)
    t = _t(d); r = rng.standard_normal(len(t) + 24)
    r = np.convolve(r - np.convolve(r, np.ones(12) / 12, "same"), np.ones(5) / 5, "same")[12:12 + len(t)]
    return r * np.exp(-k * t) * .9
def toque(f=1700):
    t = _t(.05); return np.sin(2 * np.pi * f * t) * np.exp(-75 * t)
INST = dict(pluck=pluck, marimba=marimba, epiano=epiano)


# ───── efeitos sonoros discretos: cada um marca uma coisa que acontece na tela ─────
def _faixa(rng, d, f0, f1):                            # ruído só entre f0 e f1 hertz
    n = int(SR * d); F = np.fft.rfft(rng.standard_normal(n)); fr = np.fft.rfftfreq(n, 1 / SR)
    F[(fr < f0) | (fr > f1)] = 0; y = np.fft.irfft(F, n); return y / (np.max(np.abs(y)) + 1e-9)
def fx_pop(rng):                                       # algo aparece
    t = _t(.16); f = 430 * (1 + 1.1 * np.exp(-t / .02)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .05) * _ataque(t, .003)
def fx_tique(rng):                                     # um passo, uma marca
    t = _t(.06); return (.7 * np.sin(2 * np.pi * 1500 * t) + .3 * _faixa(rng, .06, 1500, 4000)) * np.exp(-t / .012) * _ataque(t, .001) * 1.4
def fx_sopro(rng):                                     # algo passa ou muda de lugar
    d = .55; t = _t(d); return (_faixa(rng, d, 300, 1400) * (1 - t / d) + _faixa(rng, d, 900, 3200) * (t / d)) * np.sin(np.pi * t / d) ** 2 * 1.5
def fx_gota(rng):                                      # uma gota, um ponto que cai
    t = _t(.2); f = 520 + 700 * (t / .2) ** .6; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .06) * _ataque(t, .004)
def fx_sino(rng, f=1245.0, d=1.1):                     # o destaque: o termo que importa
    t = _t(d); y = np.sin(2 * np.pi * f * t) * np.exp(-t / .35) + .35 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / .14) + .15 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t / .06)
    return y * _ataque(t, .002) * .7
def fx_certo(rng):                                     # feito, conferido: duas notas subindo
    y = np.zeros(int(SR * 1.2)); a = fx_sino(rng, 1245.0, .8) * .8; b = fx_sino(rng, 1661.0, 1.0) * .85
    y[:len(a)] += a; i = int(SR * .13); y[i:i + len(b)] += b; return y
def fx_baque(rng):                                     # algo pousa, encaixa
    t = _t(.25); f = 70 + 90 * np.exp(-t / .03); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .07) * _ataque(t, .002)
def fx_lapis(rng):                                     # um risco de lápis
    d = .4; t = _t(d); return _faixa(rng, d, 1800, 5200) * (.55 + .45 * np.sin(2 * np.pi * 27 * t)) * np.sin(np.pi * t / d) ** .5
EFEITOS = dict(pop=fx_pop, tique=fx_tique, sopro=fx_sopro, gota=fx_gota, sino=fx_sino, certo=fx_certo, baque=fx_baque, lapis=fx_lapis)


def trilha(dur, path, clima="curioso", semente="preseme", efeitos=None):
    c = CLIMAS[clima]; rng = np.random.default_rng(zlib.crc32(f"{clima}:{semente}".encode()))
    modo = str(rng.choice(c["modos"])); esc = MODOS[modo]; prog = PROG[modo][int(rng.integers(len(PROG[modo])))]
    tom = int(rng.integers(53, 62)); bpm = int(rng.integers(c["bpm"][0], c["bpm"][1] + 1)); passo = 60 / bpm / 4; compasso = 16 * passo
    n_base, n_solo = str(rng.choice(c["base"])), str(rng.choice(c["solo"]))
    ritmos = RITMOS_BASE if c["denso"] else RITMOS_LENTOS
    r_base = ritmos[int(rng.integers(len(ritmos)))]; ordem = ORDENS[int(rng.integers(len(ORDENS)))]
    r_baixo = RITMOS_BAIXO[int(rng.integers(len(RITMOS_BAIXO)))] if c["denso"] else RITMOS_BAIXO[2]
    clave = CLAVES[int(rng.integers(len(CLAVES)))]; balanco = float(rng.uniform(*c["balanco"]))
    n = int(SR * (dur + 2)); mix = np.zeros((n, 2)); sala = np.zeros((n, 2))

    def grau(g): return tom + 12 * (g // 7) + esc[g % 7]          # grau da escala (pode passar de 6) -> nota
    def encaixa(g, d):                                              # puxa a nota para dentro do acorde da vez
        for x in (g, g - 1, g + 1):
            if (x - d) % 7 in (0, 2, 4): return x
        return g
    def poe(t0, y, vol, pan=0.0, eco=.25):
        i = int(SR * t0)
        if i >= n or i < 0: return
        y = y[:n - i] * vol; l, r = y * (1 - max(0, pan)), y * (1 + min(0, pan))
        mix[i:i + len(y), 0] += l; mix[i:i + len(y), 1] += r; sala[i:i + len(y), 0] += l * eco; sala[i:i + len(y), 1] += r * eco
    def quando(b, s): return b * compasso + s * passo + (balanco * passo * 2 if s % 4 == 2 else 0)

    motivos = []                                                    # dois motivos de melodia: A e B
    for _ in range(2):
        ritmo = RITMOS_SOLO[int(rng.integers(len(RITMOS_SOLO)))]; g = int(rng.integers(7, 12)); notas = []
        for s, ch in enumerate(ritmo):
            if ch == "1":
                g = int(np.clip(g + int(rng.choice((-2, -1, -1, 1, 1, 2))), 5, 14)); notas.append((s, g))
        motivos.append(notas)

    b_fim = max(1, int((dur - 2.2) / compasso)); k = 0                    # o acorde final soa pelo menos 2,2 s antes do fim
    for b in range(b_fim + 1):
        fim = b == b_fim
        d = 0 if fim else prog[b % len(prog)]
        acorde = [d, d + 2, d + 4, d + 6 if c["setima"] and not fim else d + 7]
        for g in acorde[:3]: poe(b * compasso, cama(hz(grau(g)), compasso * 1.15), .12, 0, .5)
        mb = grau(d) - 12; mb += 12 if mb < 43 else 0
        if fim:
            poe(b * compasso, baixo(hz(mb), 1.6), .5)
            for j, g in enumerate(acorde): poe(b * compasso + j * .07, INST[n_base](hz(grau(g)), 2.2), .42, -.2 + .13 * j, .45)
            continue
        for s, ch in enumerate(r_baixo):
            if ch == "1": poe(quando(b, s), baixo(hz(mb)), .5)
        for s, ch in enumerate(r_base):                                  # a base: o acorde quebrado, no ritmo da peça
            if ch == "1":
                k += 1
                if b == 0 and k % 2 == 0: continue                       # a entrada é mais vazia
                g = acorde[ordem[k % 4]] + (7 if k % 8 == 5 else 0)
                poe(quando(b, s), INST[n_base](hz(grau(g))), (.38 if s % 4 == 0 else .3) * float(rng.uniform(.85, 1)), -.25, .3)
        if b > 0:                                                        # a melodia: A A B A; na segunda volta, uma terça acima
            sobe = 2 if (b // 4) % 2 else 0
            for s, g in motivos[(0, 0, 1, 0)[b % 4]]:
                g = encaixa(g + sobe, d) if s % 8 == 0 else g + sobe
                poe(quando(b, s), INST[n_solo](hz(grau(g))), .5, .25, .4)
        p = c["perc"]
        if p and b > 0:
            for s in range(16):
                t0 = quando(b, s)
                if p == "leve":
                    if s % 4 == 2: poe(t0, chiado(rng, .07, 45), .15, .3, .1)
                    if s in clave: poe(t0, toque(), .1, -.3, .3)
                elif p == "cheia":
                    if s in (0, 10): poe(t0, tum(), .34, 0, .05)
                    if s in (4, 12): poe(t0, chiado(rng, .11, 30), .2, .1, .3)
                    if s % 2 == 0: poe(t0, chiado(rng, .04, 90), .09, .35, .05)
                    if s in clave: poe(t0, toque(2100), .06, -.35, .2)
                elif p == "pulso" and s in (0, 3): poe(t0, tum(), .3 if s == 0 else .18, 0, .1)

    ir_t = _t(.9); ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t / .22); ir = np.convolve(ir, np.ones(8) / 8, "same"); ir /= np.sqrt((ir ** 2).sum())
    N = 1 << int(np.ceil(np.log2(n + len(ir)))); F = np.fft.rfft(ir, N)           # a sala: reverberação curta
    for q in (0, 1): mix[:, q] += np.fft.irfft(np.fft.rfft(sala[:, q], N) * F, N)[:n] * .5
    m = int(SR * dur); y = mix[:m]; fade = int(SR * 1.3)
    y[-fade:] *= np.linspace(1, 0, fade)[:, None]; y[:int(SR * .15)] *= np.linspace(0, 1, int(SR * .15))[:, None]
    y = y / np.max(np.abs(y)) * .7
    if efeitos:                                                              # efeitos: baixos, por cima da música, com um pouco da mesma sala
        fx = np.zeros((m, 2))
        for e in efeitos:
            som = EFEITOS[e["som"]](rng) * float(e.get("vol", 1)); i = int(SR * float(e["t"])); pan = e.get("pan", 0)
            if isinstance(pan, (list, tuple)):                              # pan [de, para]: o efeito anda de um lado para o outro do fone
                if 0 <= i < m:
                    som = som[:m - i]; p = np.clip(np.linspace(float(pan[0]), float(pan[1]), len(som)), -1, 1)
                    fx[i:i + len(som), 0] += som * (1 - np.maximum(0, p)); fx[i:i + len(som), 1] += som * (1 + np.minimum(0, p))
                continue
            pan = float(pan)
            if 0 <= i < m:
                som = som[:m - i]; fx[i:i + len(som), 0] += som * (1 - max(0, pan)); fx[i:i + len(som), 1] += som * (1 + min(0, pan))
        for q in (0, 1): fx[:, q] += np.fft.irfft(np.fft.rfft(fx[:, q], N) * F, N)[:m] * .22
        y = y * .85 + fx * .3
        y *= min(1, .89 / np.max(np.abs(y)))
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype("<i2").tobytes())
    return dict(clima=clima, semente=semente, tom=NOTAS[tom % 12], modo=modo, andamento=bpm, acordes=prog, base=n_base, melodia=n_solo, percussao=c["perc"] or "nenhuma", efeitos=len(efeitos or []))


if __name__ == "__main__":
    a = sys.argv
    fx = json.load(open(a[5], encoding="utf-8")) if len(a) > 5 else None
    print(trilha(float(a[2]), a[1], a[3] if len(a) > 3 else "curioso", a[4] if len(a) > 4 else "preseme", fx))
