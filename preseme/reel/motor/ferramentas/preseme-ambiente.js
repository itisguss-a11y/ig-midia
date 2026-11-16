#!/usr/bin/env node
// PRESEME · banco de sons de ambiente, feito por código (versão 1, 15/11/2026).
// Decisão 122, dele, 15/11, 21h54: "quero que ele use o efeito sonoro pra criar uma ambientação, por exemplo,
// se tá aparecendo uma floresta na tela, vai ter sons de passaros, se aparece cidade tem som de buzinas de carro,
// se aparece um mosquito tem o som que o mosquito faz etc, usar aqueles sons mais esteriotipados se posso dizer isso".
//
// Por que por código: a rede do ambiente não baixa sons de banco, e assim o som é nosso (sem licença de ninguém).
// Usa o motor do animation-studio (engine/audio: dsp.js, instruments.js, mix.js); nada de repositório de terceiros.
//
// Como usar no score.js de uma peça do motor (copie este arquivo para ferramentas/ do projeto da peça):
//   const AMB = require('./ferramentas/preseme-ambiente.js');
//   const f = AMB.floresta(4.0, { seed: 3 });           // FUNDO do lugar: Bus estéreo, já com entrada e saída suaves
//   musica.addStereo(f.L, f.R, 12.5, 0.35);             // entra no corte das 12,5 s e sai no corte seguinte
//   const z = AMB.mosquito(2.5, { pan: (t) => -0.8 + 0.6 * t }); // COISA: o pan segue o mosquito na tela (-1 esq., 1 dir.)
//   musica.addStereo(z.L, z.R, 14.0, 0.5);
//   const bz = AMB.buzina();                            // coisa curta: Float32Array mono
//   musica.addMono(bz, 13.2, 0.4, 0.5);
// Regras do mapa do som (pipeline): um fundo por cena, do corte ao corte, baixo, para o texto se ler;
// o som da coisa entra quando ela aparece; no máximo um fundo e duas coisas por cena; antes da frase
// mais importante, tudo em silêncio. Os sons entram direto, sem esperar a amostra; o que ele reprovar
// (no vídeo ou na amostra) vira 'reprovado' em APROVADOS e não se usa mais.
//
// Amostra para ele ouvir:  node preseme-ambiente.js amostra <pasta>
//   → <pasta>/amostra.wav (os sons em fila, todos no mesmo volume) e <pasta>/amostra.json (nome, início e fim de cada um)
//   e o vídeo com um cartão por som: python3 preseme-ambiente-amostra.py <pasta> <saida.mp4> (claude/preseme-ambiente-amostra.py)
// Conferido por máquina em 15/11: volume final −16 LUFS, pico −1,5 dB; o grave abaixo de 50 Hz sai (90 Hz na cidade),
// porque o alto-falante do celular não o toca; o espectro de cada som foi olhado em imagem (o Claude não ouve).
'use strict';
const path = require('path');
const fs = require('fs');

function acharMotor() {
  const cands = [];
  if (process.env.ANIMATION_STUDIO) cands.push(process.env.ANIMATION_STUDIO);
  cands.push(path.join(__dirname, '..', 'engine'), path.join(__dirname, 'engine'), path.join(process.cwd(), 'engine'));
  for (const c of cands) if (fs.existsSync(path.join(c, 'audio', 'dsp.js'))) return c;
  const fila = [['/root/.claude/plugins', 0]];
  while (fila.length) {
    const [d, prof] = fila.shift();
    let itens = [];
    try { itens = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { continue; }
    for (const it of itens) {
      if (!it.isDirectory()) continue;
      const p = path.join(d, it.name);
      if (it.name === 'animation-studio' && fs.existsSync(path.join(p, 'engine', 'audio', 'dsp.js'))) return path.join(p, 'engine');
      if (prof < 8) fila.push([p, prof + 1]);
    }
  }
  throw new Error('motor do animation-studio não encontrado: rode com ANIMATION_STUDIO=<pasta engine>');
}
const MOTOR = acharMotor();
const D = require(path.join(MOTOR, 'audio', 'dsp.js'));
const I = require(path.join(MOTOR, 'audio', 'instruments.js'));
const MIX = require(path.join(MOTOR, 'audio', 'mix.js'));
const { SR, TAU, Bus, rng, Pink, Saw, Square, Sine, SVF, reverb } = D;

// Estado de cada som, pelo ouvido dele: 'em uso' (vale até ele reprovar) | 'reprovado' (não usar; dizer o motivo ao lado)
const APROVADOS = {
  floresta: 'em uso', cidade: 'em uso', mosquito: 'em uso', chuva: 'em uso',
  sirene: 'em uso', salaDeEspera: 'em uso', noite: 'em uso', monitor: 'em uso',
};

// ---------- ajudantes ----------
const sorteio = (seed) => { const r = rng(seed); return () => (r() + 1) / 2; }; // 0..1
const limita = (x, a, b) => Math.max(a, Math.min(b, x));
function panGanhos(pan) { const a = ((limita(pan, -1, 1) + 1) * Math.PI) / 4; return [Math.cos(a) * Math.SQRT2, Math.sin(a) * Math.SQRT2]; }
function suave(bus, entra = 0.25, sai = 0.35) {
  semSubgrave(bus);
  const dur = bus.n / SR;
  bus.applyGain((t) => limita(Math.min(t / entra, (dur - t) / sai), 0, 1));
  return bus;
}
function lfoLento(u, freqs = [0.07, 0.13, 0.21]) { // −1..1, devagar e sem repetir
  const fases = freqs.map(() => u() * TAU);
  return (t) => freqs.reduce((s, f, k) => s + Math.sin(TAU * f * t + fases[k]), 0) / freqs.length;
}
function comEco(bus, quanto, opts) { const w = reverb(bus, opts); w.mixInto(bus, quanto); return bus; }
// tira o grave que o alto-falante do celular não toca (só gastaria volume): passa-alta por canal
function semSubgrave(bus, hz = 50) {
  const a = new SVF(), c = new SVF();
  for (let i = 0; i < bus.n; i++) { bus.L[i] = a.hp(bus.L[i], hz, 0.707); bus.R[i] = c.hp(bus.R[i], hz, 0.707); }
  return bus;
}
function rms(bus) { let e = 0; for (let i = 0; i < bus.n; i++) e += bus.L[i] * bus.L[i] + bus.R[i] * bus.R[i]; return Math.sqrt(e / (2 * bus.n)); }

// ---------- coisas (sons curtos) ----------
// passarinho: 2 a 5 piados de assobio puro (desce, sobe ou trina)
function passaro({ seed = 1, base = null, notas = null, tipo = null } = {}) {
  const u = sorteio(seed * 7919 + 13);
  const f0 = base || 2600 + u() * 2800;
  const nn = notas || 2 + Math.floor(u() * 4);
  const tp = tipo === null ? Math.floor(u() * 3) : tipo;
  const segs = [];
  let t = 0.005;
  for (let k = 0; k < nn; k++) {
    const dur = tp === 2 ? 0.16 + u() * 0.14 : 0.05 + u() * 0.1;
    segs.push({ t, dur, f: f0 * (1 + 0.18 * (u() - 0.5)) });
    t += dur + 0.035 + u() * 0.08;
  }
  const len = Math.ceil((t + 0.02) * SR);
  const out = new Float32Array(len);
  const o1 = new Sine(), o2 = new Sine();
  let s = 0;
  for (let i = 0; i < len; i++) {
    const tt = i / SR;
    while (s < segs.length - 1 && tt > segs[s].t + segs[s].dur) s++;
    const g = segs[s];
    const x = (tt - g.t) / g.dur;
    if (x < 0 || x > 1) continue;
    let f;
    if (tp === 0) f = g.f * (1.3 - 0.55 * x);
    else if (tp === 1) f = g.f * (0.78 + 0.5 * x);
    else f = g.f * (1 + 0.1 * Math.sin(TAU * 38 * (tt - g.t)));
    const env = Math.pow(Math.sin(Math.PI * x), 0.6);
    out[i] = (o1.next(f) * 0.9 + o2.next(2 * f) * 0.1) * env;
  }
  return out;
}

// buzina de carro: duas buzinas em terça maior, "bi-biii" (padrão = trechos em segundos)
function buzina({ padrao = [[0, 0.15], [0.24, 0.6]], f = 415 } = {}) {
  const fim = padrao[padrao.length - 1][1] + 0.06;
  const len = Math.ceil(fim * SR);
  const out = new Float32Array(len);
  const a = new Square(0, 0.5), c = new Square(0.3, 0.5), bp = new SVF(), lp = new SVF();
  const f2 = f * 1.26;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    let env = 0;
    for (const [t0, t1] of padrao) {
      if (t >= t0 && t <= t1 + 0.04) {
        const at = Math.min(1, (t - t0) / 0.008);
        const rel = t > t1 ? Math.max(0, 1 - (t - t1) / 0.04) : 1;
        env = Math.max(env, at * rel);
      }
    }
    let x = a.next(f) * 0.5 + c.next(f2) * 0.5;
    x = bp.bp(x, 1150, 0.9) * 0.8 + x * 0.25;
    x = lp.lp(x, 3800, 0.7);
    out[i] = Math.tanh(x * 2.2) * env * 0.7;
  }
  return out;
}

// carro passando: ronco + pneu, cresce, passa de um lado para o outro e o tom cai (efeito Doppler)
function carroPassando(dur, { seed = 1, ida = 1 } = {}) {
  const n = Math.round(dur * SR);
  const L = new Float32Array(n), R = new Float32Array(n);
  const u = sorteio(seed);
  const ruido = new Pink(seed + 5);
  const bp = new SVF(), hp = new SVF(), lpM = new SVF();
  const motor = new Saw();
  const fm = 75 + u() * 40;
  for (let i = 0; i < n; i++) {
    const x = i / n;
    const perto = Math.exp(-Math.pow((x - 0.5) / 0.22, 2));
    const dop = 1 + 0.05 * Math.tanh((0.5 - x) * 8);
    const r = ruido.next();
    let s = bp.bp(r, 380 + 900 * perto, 0.7) * 0.9 + hp.hp(r, 2500, 0.7) * 0.25 * perto;
    s += lpM.lp(motor.next(fm * dop), 650, 0.8) * 0.35;
    s *= 0.08 + 0.92 * perto;
    const [gl, gr] = panGanhos(ida * (x * 2 - 1) * 0.95);
    L[i] = s * gl; R[i] = s * gr;
  }
  return { L, R };
}

// sapo: um "croac" (voz rouca e grave, cortada em pulsos rápidos, passando por duas ressonâncias)
function sapo({ seed = 1 } = {}) {
  const u = sorteio(seed);
  const dur = 0.22 + u() * 0.16, taxa = 24 + u() * 12, f0 = 140 + u() * 80;
  const len = Math.round(dur * SR);
  const out = new Float32Array(len);
  const voz = new Saw(), f1 = new SVF(), f2 = new SVF(), lp = new SVF();
  const c1 = 600 + u() * 250, c2 = 1400 + u() * 300;
  let fase = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    fase += taxa / SR;
    const x = fase - Math.floor(fase);
    const pulso = x < 0.55 ? Math.pow(Math.sin((Math.PI * x) / 0.55), 2) : 0;
    const v = lp.lp(voz.next(f0 * (1 - 0.08 * t / dur)), 2500, 0.7) * pulso;
    const env = Math.sqrt(Math.sin((Math.PI * t) / dur));
    out[i] = (f1.bp(v, c1, 3) + f2.bp(v, c2, 4) * 0.7) * env;
  }
  return out;
}

// bip do monitor cardíaco
function bip({ f = 988, dur = 0.11 } = {}) {
  const len = Math.round(dur * SR);
  const out = new Float32Array(len);
  const o = new Sine();
  for (let i = 0; i < len; i++) { const t = i / SR; out[i] = o.next(f) * Math.min(1, t / 0.004) * Math.min(1, (dur - t) / 0.02); }
  return out;
}

// senha chamada no painel ("plim-plom"), o sino de duas notas do motor
const senha = ({ nota = 81, vao = 0.32 } = {}) => I.ting(nota, { gap: vao });

// trovão: estalo + ronco grave que treme e some
function trovaoSom(dur, seed = 1) {
  const n = Math.round(dur * SR);
  const L = new Float32Array(n), R = new Float32Array(n);
  const w1 = rng(seed), w2 = rng(seed + 1), w3 = rng(seed + 2);
  let b1 = 0, b2 = 0;
  const lpL = new SVF(), lpR = new SVF(), bpL = new SVF(), bpR = new SVF(), hpE = new SVF(), h1 = new SVF(), h2 = new SVF();
  const tremor = lfoLento(sorteio(seed + 9), [3.1, 5.3, 1.7]);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    b1 = (b1 + w1() * 0.02) * 0.9985;
    b2 = (b2 + w2() * 0.02) * 0.9985;
    const r1 = h1.hp(b1, 45, 0.707), r2 = h2.hp(b2, 45, 0.707); // sem deriva lenta (o "DC" do ruído marrom)
    const env = Math.min(1, t / 0.12) * Math.exp(-t / (dur * 0.38)) * (0.65 + 0.35 * tremor(t));
    const estalo = hpE.hp(w3(), 900, 0.7) * Math.exp(-t / 0.07) * 0.8;
    L[i] = (lpL.lp(r1, 170, 0.7) * 1.6 + bpL.bp(r2, 380, 0.6) * 2.4) * env + estalo;
    R[i] = (lpR.lp(r2, 170, 0.7) * 1.6 + bpR.bp(r1, 400, 0.6) * 2.4) * env + estalo * 0.8;
  }
  return { L, R };
}

// ---------- fundos de lugar (Bus estéreo do tamanho pedido) ----------
function floresta(seg, { seed = 1, passaros = 1.6, folhas = 1 } = {}) {
  const n = Math.round(seg * SR), b = new Bus(n), u = sorteio(seed);
  const pL = new Pink(seed * 3 + 1), pR = new Pink(seed * 3 + 2), fL = new SVF(), fR = new SVF();
  const vento = lfoLento(u);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const g = (0.55 + 0.45 * vento(t)) * 0.22 * folhas;
    const c = 800 + 500 * vento(t * 1.7);
    b.L[i] += fL.bp(pL.next(), c, 0.55) * g;
    b.R[i] += fR.bp(pR.next(), c * 1.07, 0.55) * g;
  }
  let t = 0.1 + u() * 0.3, k = 0;
  while (t < seg - 0.35) {
    b.addMono(passaro({ seed: seed * 101 + k++ }), t, 0.25 + 0.3 * u(), (u() * 2 - 1) * 0.85);
    t += 0.12 + -Math.log(1 - u() * 0.999) / passaros;
  }
  comEco(b, 0.22, { room: 0.72, damp: 0.35, hp: 300, lp: 8000 });
  return suave(b);
}

function cidade(seg, { seed = 1, carros = 0.8, buzinas = 2 } = {}) {
  const n = Math.round(seg * SR), b = new Bus(n), u = sorteio(seed);
  const p1 = new Pink(seed * 5 + 1), p2 = new Pink(seed * 5 + 2);
  const l1 = new SVF(), l2 = new SVF(), m1 = new SVF(), m2 = new SVF();
  const mod = lfoLento(u, [0.11, 0.19, 0.31]);
  for (let i = 0; i < n; i++) {
    const g = 0.75 + 0.25 * mod(i / SR);
    const a = p1.next(), c = p2.next();
    b.L[i] += (l1.lp(a, 300, 0.7) * 0.22 + m1.bp(a, 650, 0.6) * 0.32) * g;
    b.R[i] += (l2.lp(c, 300, 0.7) * 0.22 + m2.bp(c, 700, 0.6) * 0.32) * g;
  }
  let t = -0.8 + u() * 0.5, k = 0;
  while (t < seg - 0.5) {
    const d = 2.2 + u() * 1.4;
    const c = carroPassando(d, { seed: seed * 17 + k++, ida: u() < 0.5 ? 1 : -1 });
    b.addStereo(c.L, c.R, t, 0.55 + 0.3 * u());
    t += d * 0.45 + -Math.log(1 - u() * 0.999) / carros;
  }
  for (let k2 = 0; k2 < buzinas; k2++) {
    const pad = u() < 0.5 ? [[0, 0.14], [0.22, 0.55]] : [[0, 0.32]];
    const bz = buzina({ padrao: pad, f: 380 + u() * 120 });
    const tb = (seg * (k2 + 0.6)) / (buzinas + 0.4) + (u() - 0.5) * 0.3;
    b.addMono(bz, limita(tb, 0.1, seg - 0.8), 0.5 + 0.2 * u(), (u() * 2 - 1) * 0.7);
  }
  comEco(b, 0.18, { room: 0.6, damp: 0.5, hp: 200, lp: 6000 });
  semSubgrave(b, 90); // o ronco dos motores fica nos harmônicos, que o celular toca
  return suave(b);
}

// mosquito: zumbido fino que chega perto do ouvido e vai embora; pan(t) e perto(t) podem seguir o desenho
function mosquito(seg, { seed = 1, pan = null, perto = null, f = 600 } = {}) {
  const n = Math.round(seg * SR), b = new Bus(n), u = sorteio(seed);
  const s1 = new Saw(), hp = new SVF(), lp = new SVF(), pk = new SVF();
  const ph = [u() * TAU, u() * TAU, u() * TAU];
  const panF = pan || ((t) => 0.85 * Math.sin(TAU * 0.33 * t + ph[0]));
  const pertoF = perto || ((t) => Math.pow(Math.sin((Math.PI * t) / seg), 2) * (0.75 + 0.25 * Math.sin(TAU * 0.9 * t + ph[1])));
  let antes = limita(pertoF(0), 0, 1);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const p = limita(pertoF(t), 0, 1);
    const vel = (p - antes) * SR; antes = p; // chegando > 0: o tom sobe; indo embora: cai
    const freq = f * (1 + 0.012 * Math.sin(TAU * 11 * t + ph[2]) + 0.03 * Math.sin(TAU * 0.6 * t + ph[1]) + 0.04 * limita(vel * 0.8, -1, 1));
    let x = s1.next(freq);
    x = hp.hp(x, 400, 0.7);
    x = lp.lp(x, 5200, 0.7);
    x += pk.bp(x, 1800, 2) * 0.3;
    const amp = 0.06 + 0.94 * p * p;
    const [gl, gr] = panGanhos(panF(t));
    b.L[i] += x * amp * gl * 0.5;
    b.R[i] += x * amp * gr * 0.5;
  }
  return suave(b, 0.15, 0.2);
}

function chuva(seg, { seed = 1, forca = 1, trovao = true } = {}) {
  const n = Math.round(seg * SR), b = new Bus(n), u = sorteio(seed);
  const wL = rng(seed * 9 + 1), wR = rng(seed * 9 + 2);
  const hL = new SVF(), hR = new SVF(), lL = new SVF(), lR = new SVF();
  const mod = lfoLento(u, [0.17, 0.29, 0.43]);
  for (let i = 0; i < n; i++) {
    const g = (0.8 + 0.2 * mod(i / SR)) * 0.16 * forca;
    b.L[i] += lL.lp(hL.hp(wL(), 700, 0.7), 7500, 0.7) * g;
    b.R[i] += lR.lp(hR.hp(wR(), 700, 0.7), 7500, 0.7) * g;
  }
  const gotas = Math.round(seg * 55 * forca);
  for (let k = 0; k < gotas; k++) {
    const len = Math.round((0.006 + u() * 0.016) * SR), g = new Float32Array(len), fq = 2200 + u() * 4200, o = new Sine();
    for (let i = 0; i < len; i++) { const x = i / len; g[i] = o.next(fq * (1 - 0.35 * x)) * Math.exp(-x * 5); }
    b.addMono(g, u() * seg, 0.04 + 0.09 * u(), u() * 2 - 1);
  }
  const grossos = Math.round(seg * 10 * forca), rr = rng(seed + 77);
  for (let k = 0; k < grossos; k++) {
    const len = Math.round(0.02 * SR), g = new Float32Array(len), f1 = new SVF(), c = 900 + u() * 1800;
    for (let i = 0; i < len; i++) g[i] = f1.bp(rr(), c, 2.5) * Math.exp(-(i / len) * 6);
    b.addMono(g, u() * seg, 0.12 + 0.12 * u(), u() * 2 - 1);
  }
  if (trovao && seg > 2.5) {
    const tt = seg * 0.42;
    const tv = trovaoSom(Math.min(3.2, seg - tt - 0.1), seed + 3);
    b.addStereo(tv.L, tv.R, tt, 0.9);
  }
  comEco(b, 0.15, { room: 0.65, damp: 0.4, hp: 300, lp: 7000 });
  return suave(b);
}

// ambulância: começa longe, chega, passa (o tom cai); metade em "uóóó-uóóó", metade no ritmo rápido
function sirene(seg, { chegando = true } = {}) {
  const n = Math.round(seg * SR), b = new Bus(n);
  const q = new Square(0, 0.5), bp = new SVF(), lp = new SVF();
  let fase = 0;
  for (let i = 0; i < n; i++) {
    const x = i / n;
    const per = x > 0.55 ? 0.34 : 1.7;
    fase += 1 / (per * SR);
    const lfo = 0.5 - 0.5 * Math.cos(TAU * fase);
    const f = (650 + 700 * lfo) * (1 + 0.025 * Math.tanh((0.8 - x) * 6));
    let s = q.next(f);
    s = bp.bp(s, 1500, 0.8) * 0.9 + s * 0.15;
    s = lp.lp(s, 4500, 0.7);
    const perto = chegando ? Math.min(1, 0.15 + 0.85 * Math.pow(Math.min(x, 0.8) / 0.8, 1.6)) * (x > 0.8 ? Math.max(0.3, 1 - (x - 0.8) * 2.5) : 1) : 1;
    const v = Math.tanh(s * 1.8) * perto * 0.45;
    const [gl, gr] = panGanhos(-0.6 + 1.2 * x);
    b.L[i] += v * gl;
    b.R[i] += v * gr;
  }
  comEco(b, 0.2, { room: 0.7, damp: 0.45, hp: 300, lp: 6000 });
  return suave(b, 0.1, 0.3);
}

// sala de espera da UBS: gente conversando ao fundo (vozes do motor, abafadas) e a senha chamada no painel
function salaDeEspera(seg, { seed = 1, gente = 9, chamaSenha = true } = {}) {
  const n = Math.round(seg * SR), vozes = new Bus(n), u = sorteio(seed);
  const sil = ['o', 'le', 'e', 'a', 'u'];
  let t = 0;
  while (t < seg) {
    const fem = u() < 0.5;
    const base = fem ? 57 + u() * 5 : 46 + u() * 5;
    const pan = (u() * 2 - 1) * 0.75, ganho = 0.09 + 0.07 * u();
    let ts = t;
    const nsil = 3 + Math.floor(u() * 5);
    for (let k = 0; k < nsil; k++) {
      const d = 0.09 + u() * 0.16;
      const midi = base + (u() - 0.5) * 2 - k * 0.35; // a frase cai no fim, como fala
      const v = I.voice(midi, d, { syl: sil[Math.floor(u() * sil.length)], type: fem ? 'alto' : 'tenor', seed: 1 + Math.floor(u() * 1e6), vib: 0.04, glide: (u() - 0.5) * 2, breath: 0.25, shout: 0.55 });
      vozes.addMono(v, ts, ganho, pan);
      ts += d * (0.85 + u() * 0.3);
    }
    t += (-Math.log(1 - u() * 0.999) / gente) * 3;
  }
  const f1 = new SVF(), f2 = new SVF();
  for (let i = 0; i < n; i++) { vozes.L[i] = f1.lp(vozes.L[i], 3000, 0.7); vozes.R[i] = f2.lp(vozes.R[i], 3000, 0.7); }
  const b = new Bus(n);
  vozes.mixInto(b, 1);
  comEco(b, 0.45, { room: 0.78, damp: 0.5, hp: 200, lp: 5000 });
  const p = new Pink(seed + 4), lpr = new SVF();
  for (let i = 0; i < n; i++) { const r = lpr.lp(p.next(), 1200, 0.7) * 0.03; b.L[i] += r; b.R[i] += r; }
  if (chamaSenha) b.addMono(senha(), seg * 0.5, 0.3, 0.3);
  return suave(b);
}

// noite: grilos (pulsos agudos) e sapos
function noite(seg, { seed = 1, grilos = 3, sapos = true } = {}) {
  const n = Math.round(seg * SR), b = new Bus(n), u = sorteio(seed);
  for (let g = 0; g < grilos; g++) {
    const fq = 4300 + u() * 900, per = 0.42 + u() * 0.3, pulsos = 3 + Math.floor(u() * 2), taxa = 30 + u() * 10;
    const pan = (u() * 2 - 1) * 0.8, ganho = 0.07 + 0.06 * u();
    const len = Math.round((pulsos / taxa + 0.02) * SR), ch = new Float32Array(len), o = new Sine();
    for (let i = 0; i < len; i++) {
      const tt = i / SR, k = Math.floor(tt * taxa), x = tt * taxa - k;
      const v = o.next(fq);
      ch[i] = k < pulsos && x < 0.45 ? v * Math.pow(Math.sin((Math.PI * x) / 0.45), 2) : 0;
    }
    for (let t = u() * per; t < seg; t += per * (0.95 + u() * 0.1)) b.addMono(ch, t, ganho, pan);
  }
  if (sapos) {
    let t = 0.3 + u() * 0.5, k = 0;
    while (t < seg - 0.4) { b.addMono(sapo({ seed: seed * 13 + k++ }), t, 0.7 + 0.3 * u(), (u() * 2 - 1) * 0.6); t += 0.55 + u() * 0.9; }
  }
  const p = new Pink(seed + 8), lpr = new SVF();
  for (let i = 0; i < n; i++) { const r = lpr.lp(p.next(), 700, 0.7) * 0.04; b.L[i] += r; b.R[i] += r * 0.9; }
  comEco(b, 0.25, { room: 0.8, damp: 0.3, hp: 400, lp: 8000 });
  return suave(b);
}

// monitor do coração: bip e batida, no ritmo pedido (nunca a linha reta: morte e tragédia ficam fora)
function monitor(seg, { bpm = 72, coracao = true } = {}) {
  const n = Math.round(seg * SR), b = new Bus(n), per = 60 / bpm;
  const bp = bip(), hb = coracao ? I.heartbeat() : null;
  for (let t = 0.25; t < seg - 0.15; t += per) { b.addMono(bp, t, 0.35, 0.15); if (hb) b.addMono(hb, Math.max(0, t - 0.02), 0.22, 0); }
  comEco(b, 0.12, { room: 0.5, damp: 0.6, hp: 300, lp: 6000 });
  return suave(b, 0.05, 0.2);
}

// ---------- amostra para ele ouvir ----------
const AMOSTRA = [
  ['floresta', 'Floresta: pássaros e folhas', (d) => floresta(d, { seed: 4 })],
  ['cidade', 'Cidade: trânsito e buzina', (d) => cidade(d, { seed: 7, buzinas: 2 })],
  ['mosquito', 'Mosquito passando perto do ouvido', (d) => mosquito(d, { seed: 3 })],
  ['chuva', 'Chuva forte com trovão', (d) => chuva(d, { seed: 5 })],
  ['sirene', 'Ambulância chegando', (d) => sirene(d)],
  ['salaDeEspera', 'Sala de espera da UBS, com a senha', (d) => salaDeEspera(d, { seed: 6 })],
  ['noite', 'Noite: grilos e sapos', (d) => noite(d, { seed: 8 })],
  ['monitor', 'Monitor do coração', (d) => monitor(d, { bpm: 72 })],
];

function amostra(pasta, { cada = 4.2, vao = 0.7, abertura = 1.6, alvo = -16 } = {}) {
  const total = abertura + AMOSTRA.length * (cada + vao);
  const mix = new Bus(Math.round(total * SR));
  const marcas = [];
  let t = abertura;
  for (const [chave, nome, fazer] of AMOSTRA) {
    const s = fazer(cada);
    const l = MIX.lufs(s);
    const g = Number.isFinite(l) ? Math.pow(10, (alvo - 2 - l) / 20) : 0.12 / (rms(s) || 1e-9); // todos no mesmo volume
    mix.addStereo(s.L, s.R, t, g);
    marcas.push({ chave, nome, de: +t.toFixed(3), ate: +(t + cada).toFixed(3), lufsAntes: +l.toFixed(1) });
    t += cada + vao;
  }
  const m = MIX.master(mix, 0.8, 0.84, { truePeak: true, lufs: alvo });
  fs.mkdirSync(pasta, { recursive: true });
  MIX.writeWav(path.join(pasta, 'amostra.wav'), mix);
  fs.writeFileSync(path.join(pasta, 'amostra.json'), JSON.stringify({ abertura, cada, vao, total, master: m, marcas }, null, 2));
  return marcas;
}

module.exports = {
  APROVADOS, AMOSTRA, amostra,
  floresta, cidade, mosquito, chuva, sirene, salaDeEspera, noite, monitor, // fundos de lugar
  passaro, buzina, carroPassando, sapo, bip, senha, trovaoSom,               // coisas
};

if (require.main === module) {
  const [cmd, pasta] = process.argv.slice(2);
  if (cmd !== 'amostra' || !pasta) { console.log('uso: node preseme-ambiente.js amostra <pasta>'); process.exit(1); }
  const t0 = Date.now();
  const marcas = amostra(pasta);
  for (const mk of marcas) console.log(`${mk.de.toFixed(1)}–${mk.ate.toFixed(1)} s  ${mk.nome}  (antes: ${mk.lufsAntes} LUFS)`);
  console.log(`pronto em ${((Date.now() - t0) / 1000).toFixed(1)} s → ${path.join(pasta, 'amostra.wav')}`);
}
