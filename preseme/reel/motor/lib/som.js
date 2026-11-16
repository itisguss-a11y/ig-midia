// PRESEME · motor do reel · o som da peça, pelo mapa-do-som.json, em dois modos:
//   "trilha": a trilha do projeto (preseme-trilha.py: um clima e uma semente para o vídeo todo) e os efeitos do score.js.
//             É o caminho do sus-hoje até a versão 5.
//   "blocos": decisões 113 e 122. Um clima por bloco de cenas, a música troca no corte do bloco, cada cena com o som
//             do lugar (fundo) e das coisas que aparecem (andando de um lado para o outro do fone), e silêncio antes
//             da frase mais importante. A música sai do motor de trilha do animation-studio (engine/audio).
// Os dois modos aceitam fundos, coisas e silêncios por cima. Saída: out/music.wav, no volume de celular (-16 LUFS).
'use strict';
const fs = require('fs');
const path = require('path');
const C = require('./comum');

const LIMITE_COISAS = 2; // por cena (regra do mapa do som, decisão 122): no máximo um fundo e duas coisas

// ---------- o motor de áudio do animation-studio, da pasta engine/ da peça ----------
function audio(dir) {
  const e = path.join(C.pastaEngine(dir), 'audio');
  return { D: require(path.join(e, 'dsp.js')), I: require(path.join(e, 'instruments.js')), MIX: require(path.join(e, 'mix.js')) };
}
function ambiente() { return require(path.join(C.FERR, 'preseme-ambiente.js')); }

// ---------- conferências do mapa ----------
function conferirMapa(S, mapa) {
  const ids = new Set((S.cenas || []).map((c) => c.id));
  const erros = [], avisos = [];
  for (const b of mapa.blocos || []) for (const id of b.cenas || []) if (!ids.has(id)) erros.push(`o bloco "${b.clima}" cita a cena "${id}", que não existe no score.js (há: ${[...ids].join(', ')})`);
  for (const id of Object.keys(mapa.fundos || {})) if (!ids.has(id)) erros.push(`o fundo da cena "${id}": essa cena não existe no score.js`);
  const porCena = {};
  for (const k of mapa.coisas || []) {
    if (!ids.has(k.cena)) erros.push(`a coisa "${k.som}" está na cena "${k.cena}", que não existe no score.js`);
    porCena[k.cena] = (porCena[k.cena] || 0) + 1;
  }
  for (const [id, n] of Object.entries(porCena)) if (n > LIMITE_COISAS) erros.push(`a cena "${id}" tem ${n} coisas com som: o limite é ${LIMITE_COISAS} (mais que isso embola e atrapalha a leitura)`);
  if (mapa.modo === 'blocos') {
    const cob = new Set();
    for (const b of mapa.blocos || []) {
      if (!CLIMAS[b.clima]) erros.push(`clima "${b.clima}" não existe (há: ${Object.keys(CLIMAS).join(', ')})`);
      for (const id of b.cenas || []) { if (cob.has(id)) erros.push(`a cena "${id}" está em dois blocos`); cob.add(id); }
    }
    const sem = [...ids].filter((id) => !cob.has(id));
    if (sem.length) avisos.push(`cenas sem música (fora de todos os blocos): ${sem.join(', ')}`);
  }
  return { erros, avisos };
}

// os blocos em tempo: cada um vai do começo da primeira cena ao fim da última
function blocosNoTempo(S, mapa) {
  const cena = Object.fromEntries((S.cenas || []).map((c) => [c.id, c]));
  return (mapa.blocos || []).map((b, i) => {
    const cs = b.cenas.map((id) => cena[id]).filter(Boolean).sort((p, q) => p.t0 - q.t0);
    return Object.assign({}, b, { i, t0: cs[0].t0, t1: cs[cs.length - 1].t1 });
  }).sort((p, q) => p.t0 - q.t0);
}

// ---------- música por blocos ----------
const MODOS = { maior: [0, 2, 4, 5, 7, 9, 11], lidio: [0, 2, 4, 6, 7, 9, 11], mixo: [0, 2, 4, 5, 7, 9, 10], dorico: [0, 2, 3, 5, 7, 9, 10], menor: [0, 2, 3, 5, 7, 8, 10] };
// cada clima: modo, acordes (graus), a cama, o acorde quebrado, o baixo, a percussão e o motivo (a "cara" do bloco)
const CLIMAS = {
  calmo: { modos: ['maior', 'lidio'], progs: [[0, 3, 4, 0], [0, 5, 3, 4], [0, 4, 5, 3]], setima: true,
    pad: { cutoff: 900, attack: 0.6, release: 1.4, g: 0.075 }, arp: { inst: 'musicBox', ritmo: '1000001010000000', g: 0.12, oit: 12 },
    baixo: { ritmo: '10000000', g: 0.34, bright: 0.3, dur: 4 }, perc: [], motivo: { inst: 'musicBox', g: 0.15, oit: 12, cada: 2 } },
  curioso: { modos: ['dorico', 'mixo', 'lidio'], progs: [[0, 3, 0, 3], [0, 6, 3, 0], [0, 2, 3, 0]], setima: true,
    pad: { cutoff: 1100, attack: 0.4, release: 1.0, g: 0.05 }, arp: { inst: 'marimba', ritmo: '1001001010010010', g: 0.2 },
    baixo: { inst: 'pizz', ritmo: '10001000', g: 0.32 }, perc: [['shaker', '0010001000100010', 0.09], ['woodTick', '1000000010100000', 0.07]],
    motivo: { inst: 'marimba', g: 0.22, oit: 12, cada: 2 } },
  brincalhao: { modos: ['maior', 'mixo'], progs: [[0, 4, 5, 3], [0, 3, 4, 4], [0, 5, 3, 4]], setima: false,
    pad: null, arp: { inst: 'pluck', ritmo: '0010001000100010', g: 0.2 },
    baixo: { ritmo: '10101010', g: 0.4, quinta: true }, perc: [['kick', '1000000010000000', 0.45], ['clap', '0000100000001000', 0.26], ['hat', '1010101010101010', 0.08]],
    motivo: { inst: 'marimba', g: 0.2, oit: 12, cada: 1 } },
  tenso: { modos: ['menor'], progs: [[0, 5, 6, 0], [0, 6, 5, 6]], setima: false,
    pad: { cutoff: 650, attack: 0.8, release: 1.6, g: 0.1 }, arp: null,
    baixo: { ritmo: '11111111', g: 0.26, bright: 0.4 }, perc: [['heartbeat', '1000000010000000', 0.32]],
    motivo: { inst: 'bell', g: 0.05, oit: 24, cada: 4 } },
  serio: { modos: ['menor', 'dorico'], progs: [[0, 5, 3, 4], [0, 3, 5, 4]], setima: false,
    pad: { inst: 'strings', g: 0.055 }, arp: { inst: 'pizz', ritmo: '1000100010001000', g: 0.22 },
    baixo: { ritmo: '10000000', g: 0.36, dur: 4 }, perc: [['timpani', '1000000000000000', 0.22]], motivo: null },
  festa: { modos: ['maior'], progs: [[0, 4, 5, 3], [3, 4, 0, 0], [0, 5, 3, 4]], setima: false,
    pad: { cutoff: 2600, attack: 0.05, release: 0.5, g: 0.06 }, arp: { inst: 'epiano', ritmo: '1010101010101010', g: 0.11 },
    baixo: { ritmo: '10101010', g: 0.45, oitava: true }, perc: [['kick', '1000100010001000', 0.5], ['clap', '0000100000001000', 0.28], ['hat', '1111111111111111', 0.07]],
    motivo: { inst: 'bell', g: 0.1, oit: 12, cada: 1 } },
};
function crc(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function sorteio(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const escolhe = (u, arr) => arr[Math.floor(u() * arr.length) % arr.length];
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

function tocaBloco(A, bloco, { bpm, semente, total }) {
  const { D, I } = A;
  const cl = CLIMAS[bloco.clima];
  const u = sorteio(crc(`${semente}:${bloco.clima}:${bloco.i}`));
  const modo = escolhe(u, cl.modos), esc = MODOS[modo], prog = escolhe(u, cl.progs);
  const tom = 50 + Math.floor(u() * 8); // ré a lá, na região da cama
  const grau = (g) => tom + 12 * Math.floor(g / 7) + esc[((g % 7) + 7) % 7];
  const BEAT = 60 / bpm, BAR = 4 * BEAT;
  const n = Math.ceil(total * D.SR) + D.SR;
  const bus = new D.Bus(n);
  const cache = new Map();
  const nota = (inst, midi, dur) => {
    const k = `${inst}:${midi}:${dur ? dur.toFixed(3) : ''}`;
    if (!cache.has(k)) {
      cache.set(k, inst === 'musicBox' ? I.musicBox(midi) : inst === 'marimba' ? I.marimba(midi, { thock: 0 }) : inst === 'pluck' ? I.pluck(midi)
        : inst === 'epiano' ? I.epiano(midi, dur || 0.6) : inst === 'pizz' ? I.pizz(midi) : inst === 'bell' ? I.bell(hz(midi), 0.7) : I.marimba(midi, { thock: 0 }));
    }
    return cache.get(k);
  };
  const perc = {
    kick: I.kick({ punch: 0.9 }), clap: I.clap(), hat: I.hat(false, 11), shaker: I.shaker(1, 15), woodTick: I.woodTick(1.3), heartbeat: I.heartbeat(), timpani: I.timpani(tom - 12),
  };
  // o motivo: 4 a 6 notas em colcheias, sorteadas pela semente do bloco
  const motivo = [];
  if (cl.motivo) { let g = 7 + Math.floor(u() * 4); for (let s = 0; s < 8; s++) if (u() < 0.6 || s === 0) { g = Math.max(5, Math.min(13, g + escolhe(u, [-2, -1, -1, 1, 1, 2]))); motivo.push([s, g]); } }
  const nBar = Math.ceil((bloco.t1 - bloco.t0) / BAR - 1e-6);
  for (let b = 0; b < nBar; b++) {
    const tb = bloco.t0 + b * BAR;
    const resta = bloco.t1 - tb;
    const d = prog[b % prog.length];
    const acorde = [d, d + 2, d + 4].concat(cl.setima ? [d + 6] : []);
    if (cl.pad) {
      const dur = Math.min(BAR * 1.05, resta + 0.3);
      for (const g of acorde.slice(0, 3)) {
        const x = cl.pad.inst === 'strings' ? I.strings(grau(g), dur, { attack: 0.3, release: 0.6 }) : I.padNote(grau(g), dur, { cutoff: cl.pad.cutoff, attack: cl.pad.attack, release: cl.pad.release });
        bus.addStereo(x.L, x.R, tb, cl.pad.g);
      }
    }
    if (cl.baixo) {
      const z = cl.baixo, passo = BAR / z.ritmo.length;
      let mb = grau(d) - 12; if (mb < 38) mb += 12;
      [...z.ritmo].forEach((ch, s) => {
        if (ch !== '1') return;
        const m = z.quinta && s % 4 === 2 ? mb + 7 : z.oitava && s % 2 ? mb + 12 : mb;
        const dur = z.dur ? Math.min(z.dur * BEAT, resta) : passo * 0.9;
        const x = z.inst === 'pizz' ? nota('pizz', m) : I.bass(m, dur, { bright: z.bright === undefined ? 0.7 : z.bright, sub: 0.6 });
        bus.addMono(x, tb + s * passo, z.g);
      });
    }
    if (cl.arp) {
      const a = cl.arp, passo = BAR / a.ritmo.length;
      let k = 0;
      [...a.ritmo].forEach((ch, s) => {
        if (ch !== '1') return;
        const m = grau(acorde[k++ % acorde.length]) + 12 + (a.oit || 0);
        bus.addMono(nota(a.inst, m, passo * 1.8), tb + s * passo, a.g * (s % 4 === 0 ? 1 : 0.8), -0.25);
      });
    }
    if (cl.motivo && b % cl.motivo.cada === cl.motivo.cada - 1) {
      for (const [s, g] of motivo) bus.addMono(nota(cl.motivo.inst, grau(g) + cl.motivo.oit, BEAT), tb + s * (BEAT / 2), cl.motivo.g, 0.25);
    }
    for (const [nome, ritmo, g] of cl.perc) {
      const passo = BAR / ritmo.length;
      [...ritmo].forEach((ch, s) => {
        if (ch !== '1') return;
        bus.addMono(perc[nome], tb + s * passo, g, nome === 'hat' || nome === 'shaker' ? 0.3 : 0);
      });
    }
  }
  // o bloco vale do corte de entrada ao corte de saída: entra em 15 ms e sai em 60 ms, junto com a imagem
  bus.applyGain((t) => (t < bloco.t0 || t > bloco.t1 + 0.06 ? 0 : Math.min(1, (t - bloco.t0) / 0.015, t > bloco.t1 ? 1 - (t - bloco.t1) / 0.06 : 1)));
  return { bus, modo, tom, prog };
}

// ---------- efeitos do score.js (pop, sino, tique…), com os sons do motor ----------
function efeito(A, nome) {
  const { I } = A;
  const AMB = ambiente();
  switch (nome) {
    case 'pop': return I.pop(1800);
    case 'gota': return I.pop(3200);
    case 'tique': return I.woodTick(1.4);
    case 'sopro': return I.noiseSweep(0.55, 600, 3200, { pink: true });
    case 'sino': return I.bell(1245, 0.9);
    case 'certo': { const a = I.bell(1245, 0.6), b = I.bell(1661, 0.8), o = new Float32Array(Math.round(0.13 * 48000) + b.length); o.set(a, 0); for (let i = 0; i < b.length; i++) o[i + Math.round(0.13 * 48000)] += b[i]; return o; }
    case 'baque': return I.thud(80, 0.12);
    case 'lapis': return I.scribble(0.4);
    case 'passaro': return AMB.passaro({ seed: 3 });
    case 'buzina': return AMB.buzina();
    case 'sapo': return AMB.sapo({ seed: 2 });
    case 'bip': return AMB.bip();
    case 'senha': return AMB.senha();
    default: return null;
  }
}

// mono que anda de um lado para o outro do fone: pan de a até b ao longo do som
function panMovel(buf, a, b) {
  const L = new Float32Array(buf.length), R = new Float32Array(buf.length);
  for (let i = 0; i < buf.length; i++) {
    const p = a + (b - a) * (i / Math.max(1, buf.length - 1)), ang = ((Math.max(-1, Math.min(1, p)) + 1) * Math.PI) / 4;
    L[i] = buf[i] * Math.cos(ang) * Math.SQRT2; R[i] = buf[i] * Math.sin(ang) * Math.SQRT2;
  }
  return { L, R };
}

// de que lado do fone está um som: direito menos esquerdo, em dB (positivo = mais à direita)
function ladoBuf(L, R, i0, i1) {
  let l = 0, r = 0;
  for (let i = Math.max(0, i0); i < Math.min(L.length, i1); i++) { l += L[i] * L[i]; r += R[i] * R[i]; }
  return 10 * Math.log10((r + 1e-12) / (l + 1e-12));
}
const dbs = (x) => `${x >= 0 ? '+' : ''}${x.toFixed(1)} dB`;
const ANDA_DB = 3; // de um fone ao outro: entre o começo e o fim da coisa, o lado muda pelo menos isso

// fundos (o lugar) no bus; coisas (o que aparece) no busCoisas, cada uma medida sozinha antes de entrar.
// Devolve as janelas das coisas: a música abaixa sob as que andam, e o lado é medido de novo no som final.
function ambienteNoBus(A, S, mapa, bus, relato, busCoisas = bus) {
  const AMB = ambiente();
  const cena = Object.fromEntries((S.cenas || []).map((c) => [c.id, c]));
  const janelas = [];
  for (const [id, f] of Object.entries(mapa.fundos || {})) {
    const c = cena[id]; if (!c) continue;
    const fazer = AMB[f.som];
    if (typeof fazer !== 'function') throw new Error(`fundo "${f.som}" não existe no banco (há: floresta, cidade, mosquito, chuva, sirene, salaDeEspera, noite, monitor, rio, varanda)`);
    if (AMB.APROVADOS[f.som] === 'reprovado') throw new Error(`o fundo "${f.som}" foi reprovado por ele e não se usa mais`);
    const x = fazer(c.t1 - c.t0, Object.assign({ seed: f.seed || 1 }, f.opcoes || {}));
    bus.addStereo(x.L, x.R, c.t0, f.vol === undefined ? 0.35 : f.vol);
    relato.push(`fundo ${f.som} na cena ${id}, de ${c.t0.toFixed(2)} a ${c.t1.toFixed(2)} s`);
  }
  for (const k of mapa.coisas || []) {
    const c = cena[k.cena]; if (!c) continue;
    const t = typeof k.em === 'string' ? C.instante(S, k.em) : c.t0 + (k.em || 0);
    const vol = k.vol === undefined ? 0.5 : k.vol;
    const pan = Array.isArray(k.pan) ? k.pan : [k.pan || 0, k.pan || 0];
    let x = null;
    if (['mosquito', 'sirene', 'carroPassando', 'chuva', 'floresta', 'cidade', 'noite', 'monitor', 'salaDeEspera', 'rio', 'varanda'].includes(k.som)) {
      const dur = k.dur || 2.5;
      if (k.som === 'mosquito') x = AMB.mosquito(dur, { seed: k.seed || 1, pan: (tt) => pan[0] + (pan[1] - pan[0]) * (tt / dur) });
      else if (k.som === 'carroPassando') x = AMB.carroPassando(dur, { seed: k.seed || 1, ida: pan[1] >= pan[0] ? 1 : -1 });
      else x = AMB[k.som](dur, { seed: k.seed || 1 });
    } else {
      const m = efeito(A, k.som);
      if (!m) throw new Error(`a coisa "${k.som}" não existe (há: passaro, buzina, sapo, bip, senha, mosquito, sirene, carroPassando e os sons de efeito)`);
      x = panMovel(m, pan[0], pan[1]);
    }
    busCoisas.addStereo(x.L, x.R, t, vol);
    const n = x.L.length, anda = pan[0] !== pan[1];
    const j = { som: k.som, cena: k.cena, t, dur: n / A.D.SR, pan, anda, abaixa: k.abaixa !== undefined ? k.abaixa : anda ? 8 : 0 };
    let onde = 'parada';
    if (anda) {
      const a = ladoBuf(x.L, x.R, 0, Math.round(n / 3)), b = ladoBuf(x.L, x.R, Math.round((2 * n) / 3), n);
      const certo = Math.sign(b - a) === Math.sign(pan[1] - pan[0]) && Math.abs(b - a) >= ANDA_DB;
      onde = `andando de ${pan[0]} a ${pan[1]}; sozinha: ${dbs(a)} no começo e ${dbs(b)} no fim (direito menos esquerdo)${certo ? '' : ' (AVISO: quase não anda no fone)'}`;
    }
    relato.push(`coisa ${k.som} na cena ${k.cena}, em ${t.toFixed(2)} s, ${onde}${j.abaixa ? `; a música e o lugar abaixam ${j.abaixa} dB sob ela` : ''}`);
    janelas.push(j);
  }
  return janelas;
}

// a música e o lugar abaixam sob uma coisa (rampa de 150 ms), para ela se ouvir passando de um fone ao outro
function abaixaSob(buses, janelas, SR) {
  const n = Math.max(0, ...buses.map((b) => b.n)), g = new Float32Array(n).fill(1), RAMPA = 0.15;
  for (const j of janelas) {
    if (!j.abaixa) continue;
    const alvo = Math.pow(10, -j.abaixa / 20), fim = j.t + j.dur;
    for (let i = Math.max(0, Math.round((j.t - RAMPA) * SR)); i < Math.min(n, Math.round((fim + RAMPA) * SR)); i++) {
      const s = i / SR, k = s < j.t ? (j.t - s) / RAMPA : s > fim ? (s - fim) / RAMPA : 0;
      g[i] = Math.min(g[i], alvo + (1 - alvo) * Math.min(1, k));
    }
  }
  for (const b of buses) for (let i = 0; i < b.n; i++) { b.L[i] *= g[i]; b.R[i] *= g[i]; }
}

// o lado de cada coisa que anda, medido de novo no som final (com a música por cima)
function ladoNoFinal(mix, janelas, relato, SR) {
  for (const j of janelas.filter((x) => x.anda)) {
    const i0 = Math.round(j.t * SR), n = Math.round(j.dur * SR);
    const a = ladoBuf(mix.L, mix.R, i0, i0 + Math.round(n / 3)), b = ladoBuf(mix.L, mix.R, i0 + Math.round((2 * n) / 3), i0 + n);
    const certo = Math.sign(b - a) === Math.sign(j.pan[1] - j.pan[0]) && Math.abs(b - a) >= ANDA_DB;
    relato.push(`coisa ${j.som} no som final: ${dbs(a)} no começo e ${dbs(b)} no fim${certo ? ' (anda de um fone ao outro: ok)' : ' (AVISO: a música cobre a coisa; suba o "vol" dela ou o "abaixa")'}`);
  }
}

// silêncio antes da frase que importa: tudo cala nesse trecho (música, lugar, coisas e efeitos)
function silencios(S, mapa) {
  return (mapa.silencios || []).map((s) => {
    const t = s.frase !== undefined ? C.instante(S, `[${s.frase}]`) : C.instante(S, s.em);
    return { t0: Math.max(0, t - (s.antes || 0.5)), t1: t };
  });
}

// passa-alta de 24 dB por oitava (duas etapas do filtro do motor), canal por canal
function passaAlta(D, bus, hz) {
  const f = [new D.SVF(), new D.SVF(), new D.SVF(), new D.SVF()];
  for (let i = 0; i < bus.n; i++) { bus.L[i] = f[1].hp(f[0].hp(bus.L[i], hz, 0.707), hz, 0.707); bus.R[i] = f[3].hp(f[2].hp(bus.R[i], hz, 0.707), hz, 0.707); }
}

// ---------- medidas (o Claude não ouve: mede) ----------
function medidas(A, mix, S, blocos, silen) {
  const { D, MIX } = A;
  const SR = D.SR, n = mix.n;
  // grave inútil: a parte da energia abaixo de 100 Hz (filtro de 24 dB por oitava), que o alto-falante do celular não toca
  let eG = 0, eT = 0;
  const f1 = new D.SVF(), f2 = new D.SVF();
  for (let i = 0; i < n; i++) { const x = (mix.L[i] + mix.R[i]) / 2; const g = f2.lp(f1.lp(x, 100, 0.707), 100, 0.707); eG += g * g; eT += x * x; }
  const grave = eT ? (100 * eG) / eT : 0;
  // volume de cada bloco (sem os silêncios), para nenhum bloco sumir no celular
  const dbBloco = blocos.map((b) => {
    let e = 0, c = 0;
    for (let i = Math.round(b.t0 * SR); i < Math.min(n, Math.round(b.t1 * SR)); i++) {
      const t = i / SR; if (silen.some((s) => t >= s.t0 && t < s.t1)) continue;
      e += mix.L[i] * mix.L[i] + mix.R[i] * mix.R[i]; c += 2;
    }
    return { b, db: c ? 10 * Math.log10(e / c + 1e-12) : -99 };
  });
  return { lufs: MIX.lufs(mix), grave, dbBloco };
}

// ---------- o comando ----------
function comando(args) {
  const dir = C.pastaPeca(args);
  const peca = C.lerPeca(dir);
  const mapa = C.lerMapa(dir, peca);
  const S = C.lerScore(dir);
  const out = path.join(dir, 'out');
  fs.mkdirSync(out, { recursive: true });
  const t0 = Date.now();
  if (mapa._padrao) console.log('(sem mapa-do-som.json: modo trilha, clima curioso, semente = nome da peça)');
  const ec = C.conferirCenas(S);
  if (ec.length) { for (const e of ec) console.log(`ERRO: ${e}`); console.log('O som não foi feito: arrume o cenas.json.'); process.exitCode = 1; return; }
  const { erros, avisos } = conferirMapa(S, mapa);
  for (const a of avisos) console.log(`AVISO: ${a}`);
  if (erros.length) { for (const e of erros) console.log(`ERRO: ${e}`); console.log('O som não foi feito: arrume o mapa-do-som.json.'); process.exitCode = 1; return; }
  const efeitos = (S.efeitos || []).map((e) => ({ t: Math.round(e.t * 1000) / 1000, som: e.som, vol: e.vol, pan: e.pan }));
  fs.writeFileSync(path.join(out, 'efeitos.json'), JSON.stringify(efeitos));
  const temAmbiente = Object.keys(mapa.fundos || {}).length || (mapa.coisas || []).length || (mapa.silencios || []).length;
  const relato = [];
  fs.rmSync(path.join(out, 'som-blocos.json'), { force: true }); // o conferir só olha as trocas de música do som atual
  if (mapa.modo === 'trilha' || !mapa.modo) somTrilha(dir, S, peca, mapa, temAmbiente, relato);
  else if (mapa.modo === 'blocos') somBlocos(dir, S, peca, mapa, relato);
  else throw new Error(`modo "${mapa.modo}" não existe no mapa-do-som.json: use "trilha" ou "blocos"`);
  const r = require('child_process').spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(out, 'music.wav')], { encoding: 'utf8' });
  const d = parseFloat(r.stdout);
  const v = C.volume(path.join(out, 'music.wav'));
  console.log(`out/music.wav gravado: ${d.toFixed(2)} s (o filme tem ${S.DURATION.toFixed(2)} s), ${efeitos.length} efeitos, andamento ${S.BPM || mapa.bpm || '—'}, ${v.I.toFixed(1)} LUFS, pico ${v.pico.toFixed(1)} dBFS, em ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  for (const l of relato) console.log('  ' + l);
  let erro = false;
  if (Math.abs(d - S.DURATION) > 0.05) { console.log('ERRO: o som e o filme não têm a mesma duração.'); erro = true; }
  if (!(v.I >= -17 && v.I <= -15)) { console.log(`ERRO: o volume deu ${v.I.toFixed(1)} LUFS; tem de ficar entre -17 e -15 (celular).`); erro = true; }
  if (v.pico > -1.0) { console.log(`ERRO: pico de ${v.pico.toFixed(1)} dBFS: acima de -1 dBFS o som estoura depois do envio.`); erro = true; }
  process.exitCode = erro ? 1 : 0;
}

function somTrilha(dir, S, peca, mapa, temAmbiente, relato) {
  const out = path.join(dir, 'out');
  const clima = mapa.clima || 'curioso', semente = mapa.semente || peca.nome;
  const dito = C.roda('python3', ['-I', path.join(C.FERR, 'preseme-trilha.py'), path.join(out, 'trilha.wav'), S.DURATION.toFixed(3), clima, semente, path.join(out, 'efeitos.json')], { quieto: true }).trim();
  console.log(dito);
  const bpm = parseInt((dito.match(/'andamento': (\d+)/) || [])[1], 10);
  if (S.BPM && bpm !== S.BPM) throw new Error(`a trilha saiu com andamento ${bpm} e o score.js usa ${S.BPM}: mude o BPM do score.js para ${bpm} (ou a semente/o clima do mapa) e rode textos e som de novo.`);
  let fonte = path.join(out, 'trilha.wav');
  if (temAmbiente) {
    // o lugar, as coisas e os silêncios por cima da trilha (decisão 122)
    const A = audio(dir);
    const base = A.MIX.loadAudio(fonte, { length: S.DURATION });
    const amb = new A.D.Bus(base.n), coisas = new A.D.Bus(base.n);
    const janelas = ambienteNoBus(A, S, mapa, amb, relato, coisas);
    abaixaSob([base, amb], janelas, A.D.SR);
    amb.mixInto(base, 1);
    coisas.mixInto(base, 1);
    for (const s of silencios(S, mapa)) { A.MIX.gate(base, s.t0, s.t1); relato.push(`silêncio de ${s.t0.toFixed(2)} a ${s.t1.toFixed(2)} s`); }
    ladoNoFinal(base, janelas, relato, A.D.SR); // o loudnorm depois muda o volume dos dois lados por igual
    fonte = path.join(out, 'trilha-com-ambiente.wav');
    A.MIX.writeWav(fonte, base);
  }
  C.roda('ffmpeg', ['-v', 'error', '-y', '-i', fonte, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', path.join(out, 'music.wav')], { quieto: true });
}

function somBlocos(dir, S, peca, mapa, relato) {
  const A = audio(dir);
  const { D, MIX } = A;
  const bpm = mapa.bpm || S.BPM || 100;
  const total = S.DURATION;
  const N = Math.ceil(total * D.SR);
  const blocos = blocosNoTempo(S, mapa);
  const musica = new D.Bus(N), amb = new D.Bus(N), coisas = new D.Bus(N), fx = new D.Bus(N), envio = new D.Bus(N);
  for (const b of blocos) {
    const r = tocaBloco(A, b, { bpm, semente: mapa.semente || peca.nome, total });
    const x = r.bus; // do tamanho do filme + 1 s
    for (let i = 0; i < N; i++) { musica.L[i] += x.L[i]; musica.R[i] += x.R[i]; }
    relato.push(`bloco ${b.i + 1}: ${b.clima} (${r.modo}), de ${b.t0.toFixed(2)} a ${b.t1.toFixed(2)} s, cenas ${b.cenas.join(', ')}`);
  }
  const janelas = ambienteNoBus(A, S, mapa, amb, relato, coisas);
  abaixaSob([musica, amb], janelas, D.SR);
  musica.mixInto(envio, 0.22);
  if (mapa.efeitos !== false) {
    for (const e of S.efeitos || []) {
      const m = efeito(A, e.som);
      if (!m) { relato.push(`(efeito "${e.som}" não existe no modo blocos: ficou de fora)`); continue; }
      const g = (e.vol === undefined ? 0.8 : e.vol) * 0.5;
      if (Array.isArray(e.pan)) { // pan: [de, para]: o efeito anda de um lado para o outro do fone (ex.: a câmera ou a coisa passa)
        const x = panMovel(m, Number(e.pan[0]) || 0, Number(e.pan[1]) || 0);
        fx.addStereo(x.L, x.R, e.t, g);
        relato.push(`efeito ${e.som} em ${e.t.toFixed(2)} s andando de ${e.pan[0]} a ${e.pan[1]} no fone`);
      } else fx.addMono(m, e.t, g, e.pan || 0);
    }
    fx.mixInto(envio, 0.15);
  }
  passaAlta(D, musica, 80); // o grave que o celular não toca só gastaria volume (o lugar já vem limpo do banco)
  const sala = D.reverb(envio, { room: 0.78, damp: 0.35 });
  const mix = MIX.mixdown({ musica, amb, coisas, fx, sala }, { musica: 1, amb: 0.9, coisas: 0.9, fx: 1, sala: 1 });
  MIX.highpass(mix, 40);
  const silen = silencios(S, mapa);
  for (const s of silen) { MIX.gate(mix, s.t0, s.t1); relato.push(`silêncio de ${s.t0.toFixed(2)} a ${s.t1.toFixed(2)} s, antes da frase`); }
  MIX.fadeOut(mix, Math.max(0, total - 1.2), total);
  const m = MIX.master(mix, 0.8, 0.84, { truePeak: true, lufs: mapa.lufs || -16 });
  MIX.writeWav(path.join(dir, 'out', 'music.wav'), mix);
  ladoNoFinal(mix, janelas, relato, D.SR);
  const med = medidas(A, mix, S, blocos, silen);
  relato.push(`volume ${med.lufs.toFixed(1)} LUFS (master com ganho ${m.drive.toFixed(2)})`);
  relato.push(`grave abaixo de 100 Hz: ${med.grave.toFixed(1)}% da energia${med.grave > 25 ? ' (AVISO: alto; o celular não toca isso)' : ' (ok)'}`);
  const maior = Math.max(...med.dbBloco.map((x) => x.db));
  for (const x of med.dbBloco) relato.push(`bloco ${x.b.i + 1} (${x.b.clima}): ${x.db.toFixed(1)} dB${maior - x.db > 9 ? ' (AVISO: mais de 9 dB abaixo do bloco mais alto; some no celular)' : ''}`);
  // as trocas de música: cada uma é o começo de um bloco, que é o começo de uma cena (um corte)
  for (const b of blocos.slice(1)) relato.push(`troca de música em ${b.t0.toFixed(2)} s = começo da cena ${b.cenas[0]} (um corte; o "conferir" mede o corte no vídeo)`);
  fs.writeFileSync(path.join(dir, 'out', 'som-blocos.json'), JSON.stringify({ bpm, blocos: blocos.map((b) => ({ clima: b.clima, cenas: b.cenas, t0: b.t0, t1: b.t1 })), silencios: silen }, null, 1));
}

module.exports = { comando, CLIMAS, conferirMapa, blocosNoTempo };
