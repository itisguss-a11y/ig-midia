# PRESEME · mapa e dado · a área marcada de uma terra indígena de Roraima, tirada do ti.gpkg (geobr,
# indigenous_land_202103_simplified) e simplificada, no formato que o tipo lê ({ fonte, aneis }).
# Uso: python3 -I area-do-gpkg.py <ti.gpkg> <começo do nome> <saída.json> [tolerância em graus, padrão 0.012]
# Exemplo: python3 -I area-do-gpkg.py ~/.cache/preseme-pixel/dados/ti.gpkg Yanomami assets/yanomami.json
# Os nomes saem do arquivo em latin-1 (acento quebrado): use o começo do nome sem acento.
import sqlite3, struct, json, sys, math
src, nome0, dst = sys.argv[1], sys.argv[2], sys.argv[3]
tol = float(sys.argv[4]) if len(sys.argv) > 4 else 0.012
def wkb(b, o):
    bo = '<' if b[o] == 1 else '>'
    t = struct.unpack_from(bo + 'I', b, o + 1)[0] % 1000; o += 5
    if t == 3:
        nr = struct.unpack_from(bo + 'I', b, o)[0]; o += 4; rings = []
        for _ in range(nr):
            n = struct.unpack_from(bo + 'I', b, o)[0]; o += 4
            pts = struct.unpack_from(bo + '%dd' % (n * 2), b, o); o += n * 16
            rings.append(list(zip(pts[0::2], pts[1::2])))
        return [rings], o
    if t == 6:
        ng = struct.unpack_from(bo + 'I', b, o)[0]; o += 4; polys = []
        for _ in range(ng):
            p, o = wkb(b, o); polys += p
        return polys, o
    raise ValueError(t)
def dp(pts, eps):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]; dx, dy = b[0]-a[0], b[1]-a[1]; L = math.hypot(dx, dy) or 1e-12
    dmax, idx = 0, 0
    for i in range(1, len(pts)-1):
        p = pts[i]; d = abs(dy*p[0] - dx*p[1] + b[0]*a[1] - b[1]*a[0]) / L
        if d > dmax: dmax, idx = d, i
    if dmax > eps: return dp(pts[:idx+1], eps)[:-1] + dp(pts[idx:], eps)
    return [a, b]
c = sqlite3.connect('file:' + src + '?mode=ro', uri=True); c.text_factory = lambda b: b.decode('latin-1')
aneis, nomes = [], []
for nome, uf, blob in c.execute("select terrai_nom, abbrev_state, geom from indigenous_land_202103_simplified where abbrev_state like '%RR%'"):
    if not nome.lower().startswith(nome0.lower()): continue
    env = (blob[3] >> 1) & 7
    polys, _ = wkb(blob, 8 + {0: 0, 1: 32, 2: 48, 3: 48, 4: 64}[env])
    nomes.append((nome, uf, len(polys)))
    for p in polys:
        ring = p[0]; m = len(ring) // 2
        r = [list(map(lambda v: round(v, 4), q)) for q in dp(ring[:m + 1], tol)[:-1] + dp(ring[m:], tol)]
        if len(r) >= 4: aneis.append(r)
if not aneis: sys.exit(f'nenhuma terra indígena de Roraima começa com "{nome0}"')
json.dump({'fonte': f'FUNAI, terras indígenas (geobr, indigenous_land_202103_simplified), {nomes[0][0]}; simplificada', 'aneis': aneis}, open(dst, 'w'), separators=(',', ':'))
xs = [q[0] for r in aneis for q in r]; ys = [q[1] for r in aneis for q in r]
print(nomes, len(aneis), sum(map(len, aneis)), 'pontos', min(xs), max(xs), min(ys), max(ys))
