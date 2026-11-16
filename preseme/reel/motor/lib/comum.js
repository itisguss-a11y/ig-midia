// PRESEME · motor do reel · o que todos os comandos usam: achar a peça, ler os arquivos dela, rodar programas.
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const MOTOR = path.resolve(__dirname, '..');
const FERR = path.join(MOTOR, 'ferramentas');

// a pasta do animation-studio (a da skill: tem scripts/new-project.js e engine/)
function acharStudio() {
  const cands = [process.env.ANIMATION_STUDIO_SKILL].filter(Boolean);
  for (const c of cands) if (fs.existsSync(path.join(c, 'scripts', 'new-project.js'))) return c;
  const fila = [['/root/.claude/plugins', 0], [path.join(require('os').homedir(), '.claude', 'plugins'), 0]];
  const vistos = new Set();
  while (fila.length) {
    const [d, prof] = fila.shift();
    if (vistos.has(d)) continue;
    vistos.add(d);
    let itens = [];
    try { itens = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { continue; }
    for (const it of itens) {
      if (!it.isDirectory()) continue;
      const p = path.join(d, it.name);
      if (it.name === 'animation-studio' && fs.existsSync(path.join(p, 'scripts', 'new-project.js'))) return p;
      if (prof < 9) fila.push([p, prof + 1]);
    }
  }
  throw new Error('não achei a skill animation-studio. Carregue a skill animation-studio:animation-studio (ferramenta Skill) e rode de novo com ANIMATION_STUDIO_SKILL=<a pasta "Base directory" que ela mostra>.');
}

// peça de fora do animation-studio (motor de pixel art e outros): "motor": "externo" no peca.json, ou cenas.json sem score.js
function ehExterno(dir) {
  const pj = path.join(dir, 'peca.json');
  if (fs.existsSync(pj)) { try { if (JSON.parse(fs.readFileSync(pj, 'utf8')).motor === 'externo') return true; } catch (e) { /* o erro aparece no lerPeca */ } }
  return !fs.existsSync(path.join(dir, 'score.js')) && fs.existsSync(path.join(dir, 'cenas.json'));
}

// carrossel (16/11): "tipo": "carrossel" no peca.json; lâminas paradas em 4:5, sem som nem vídeo (lib/carrossel.js)
function ehCarrossel(dir) {
  const pj = path.join(dir, 'peca.json');
  if (!fs.existsSync(pj)) return false;
  try { return JSON.parse(fs.readFileSync(pj, 'utf8')).tipo === 'carrossel'; } catch (e) { return false; }
}

// a pasta da peça: --peca <pasta> ou a pasta atual
function pastaPeca(args, { exigir = true, soStudio = false } = {}) {
  const i = args.indexOf('--peca');
  const dir = path.resolve(i >= 0 ? args[i + 1] : process.cwd());
  if (!exigir) return dir;
  if (ehExterno(dir)) {
    if (soStudio) throw new Error(`a peça em ${dir} é de fora do animation-studio ("motor": "externo"): este comando é só do animation-studio. O desenho, o vídeo e o trecho são do motor que fez a peça.`);
    for (const f of ['textos.txt', 'cenas.json']) if (!fs.existsSync(path.join(dir, f))) throw new Error(`${dir}: peça de fora sem ${f} (veja no README o que ela tem de trazer)`);
    return dir;
  }
  for (const f of ['index.html', 'score.js']) {
    if (!fs.existsSync(path.join(dir, f))) throw new Error(`${dir} não é a pasta de uma peça (falta ${f}). Rode de dentro da pasta da peça ou use --peca <pasta>.`);
  }
  if (!fs.existsSync(path.join(dir, 'engine', 'render.js'))) throw new Error(`${dir} não tem a pasta engine/ do animation-studio. Monte a peça com: node ${path.join(MOTOR, 'preseme.js')} novo <pasta> --de <arquivos da peça>`);
  return dir;
}
// tira do args o que é opção do motor (--peca X e as bandeiras)
function posicionais(args) {
  const out = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--peca') { i++; continue; }
    if (args[i].startsWith('--')) continue;
    out.push(args[i]);
  }
  return out;
}

const PADRAO_PECA = {
  formato: '9:16',
  limite: 179.6, // s: o reel fica abaixo de 3 minutos (o Instagram só recomenda a quem não segue reels de até 3 min)
  capa: null, // marcador da capa, ex.: "@abertura"
  cores: [], // cores além da paleta (pele, cabelo, miolo de pão…), em código, ex.: "#C98A62"
  esperado: null, // { frases: 32, palavras: 26 }: o que o textos.txt tem de trazer
};
function lerPeca(dir) {
  const arq = path.join(dir, 'peca.json');
  const p = fs.existsSync(arq) ? JSON.parse(fs.readFileSync(arq, 'utf8')) : {};
  const nome = p.nome || path.basename(dir);
  return Object.assign({}, PADRAO_PECA, p, { nome });
}
function ganchoPeca(dir) {
  const arq = path.join(dir, 'peca.js');
  if (!fs.existsSync(arq)) return {};
  delete require.cache[require.resolve(arq)];
  return require(arq);
}
function lerMapa(dir, peca) {
  const arq = path.join(dir, 'mapa-do-som.json');
  if (!fs.existsSync(arq)) return { modo: 'trilha', clima: 'curioso', semente: peca.nome, _padrao: true };
  return JSON.parse(fs.readFileSync(arq, 'utf8'));
}
// o score.js da peça, lido de novo (o textos.js pode ter acabado de mudar); peça de fora: o cenas.json no mesmo formato
function lerScore(dir) {
  if (ehExterno(dir)) return scoreExterno(dir);
  for (const k of Object.keys(require.cache)) if (k.startsWith(dir + path.sep) && /(score|textos)\.js$/.test(k)) delete require.cache[k];
  return require(path.join(dir, 'score.js'));
}
function scoreExterno(dir) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, 'cenas.json'), 'utf8'));
  if (!(j.duracao > 0) || !Array.isArray(j.cenas) || !j.cenas.length) throw new Error('cenas.json: "duracao" e "cenas" são obrigatórios (veja o README)');
  const TX = require('./textos').lerTxt(path.join(dir, 'textos.txt')).T;
  const linha = {};
  for (const [n, f] of Object.entries(j.frases || {})) linha[String(parseInt(n, 10))] = { n: parseInt(n, 10), t0: f.t0, t1: f.t1 };
  const cenas = j.cenas.map((c) => ({ id: String(c.id), t0: c.t0, t1: c.t1, itens: Object.values(linha).filter((it) => it.t0 >= c.t0 - 1e-6 && it.t0 < c.t1 - 1e-6).sort((p, q) => p.t0 - q.t0) }));
  const bpm = j.bpm || null;
  return {
    externo: true, FPS: j.fps || 30, FORMAT: '9:16', DURATION: j.duracao, BPM: bpm, BEAT: bpm ? 60 / bpm : 0,
    cenas, linha, efeitos: j.efeitos || [], markers: j.marcadores || {}, TX, S: Object.fromEntries(cenas.map((c) => [c.id, [c.t0, c.t1]])),
  };
}
// as cenas de uma peça de fora têm de vir em ordem e emendadas (o t0 de cada uma é um corte)
function conferirCenas(S) {
  const erros = [], tol = 1 / (S.FPS || 30) + 1e-6;
  if (!S.externo) return erros;
  if (Math.abs(S.cenas[0].t0) > tol) erros.push(`cenas.json: a primeira cena começa em ${S.cenas[0].t0} s (tem de ser 0)`);
  for (let i = 1; i < S.cenas.length; i++) if (Math.abs(S.cenas[i].t0 - S.cenas[i - 1].t1) > tol) erros.push(`cenas.json: a cena "${S.cenas[i].id}" começa em ${S.cenas[i].t0} s e a anterior acaba em ${S.cenas[i - 1].t1} s (têm de ser emendadas)`);
  const fim = S.cenas[S.cenas.length - 1].t1;
  if (Math.abs(fim - S.DURATION) > tol) erros.push(`cenas.json: a última cena acaba em ${fim} s e a duração é ${S.DURATION} s`);
  return erros;
}
// o engine do animation-studio: o da peça (engine/) ou, numa peça de fora, o da skill
function pastaEngine(dir) {
  const p = path.join(dir, 'engine');
  return fs.existsSync(path.join(p, 'audio', 'dsp.js')) ? p : path.join(acharStudio(), 'engine');
}

// roda um programa e mostra a saída; erro = para tudo com a mensagem em português
function roda(cmd, args, { cwd, quieto = false, aceita = [0], env, aoVivo = false } = {}) {
  if (aoVivo) { // a saída aparece enquanto o programa roda (renders longos: o andamento vai para o log)
    const r = spawnSync(cmd, args, { cwd, stdio: 'inherit', env: Object.assign({}, process.env, env || {}) });
    if (r.error) throw new Error(`não consegui rodar ${cmd}: ${r.error.message}`);
    if (!aceita.includes(r.status)) throw new Error(`${cmd} ${args.join(' ')} falhou (código ${r.status})`);
    return '';
  }
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', maxBuffer: 1 << 28, env: Object.assign({}, process.env, env || {}) });
  const saida = (r.stdout || '') + (r.stderr || '');
  if (!quieto && saida.trim()) process.stdout.write(saida.endsWith('\n') ? saida : saida + '\n');
  if (r.error) throw new Error(`não consegui rodar ${cmd}: ${r.error.message}`);
  if (!aceita.includes(r.status)) {
    const fim = saida.trim().split('\n').slice(-6).join('\n');
    throw new Error(`${cmd} ${args.join(' ')} falhou (código ${r.status})${quieto ? ':\n' + fim : ''}`);
  }
  return saida;
}
// node engine/render.js <modo> … na pasta da peça
const render = (dir, args, op = {}) => roda(process.execPath, [path.join(dir, 'engine', 'render.js'), ...args], Object.assign({ cwd: dir }, op));

// nomes de saída, iguais aos do render.js: out/<pasta><-draft>.mp4 e out/video<-draft>.mp4
const arquivoFinal = (dir, rascunho) => path.join(dir, 'out', `${path.basename(dir)}${rascunho ? '-draft' : ''}.mp4`);
const arquivoVideo = (dir, rascunho) => path.join(dir, 'out', `video${rascunho ? '-draft' : ''}.mp4`);

const mmss = (s) => `${Math.floor(s / 60)}min${String(Math.round(s % 60)).padStart(2, '0')}`;
const n2 = (n) => String(n).padStart(2, '0');
const mtime = (f) => (fs.existsSync(f) ? fs.statSync(f).mtimeMs : 0);
const mb = (f) => fs.statSync(f).size / 1e6;

// ffprobe de um vídeo: largura, altura, quadros por segundo, duração e tamanho
function sonda(arq) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,pix_fmt,width,height,r_frame_rate,nb_frames:format=duration,size', '-of', 'json', arq], { encoding: 'utf8' });
  const j = JSON.parse(r.stdout);
  const s = j.streams[0] || {};
  return { w: s.width, h: s.height, fps: s.r_frame_rate, codec: s.codec_name, pix: s.pix_fmt, quadros: parseInt(s.nb_frames || '0', 10), dur: parseFloat(j.format.duration), tam: parseInt(j.format.size, 10) };
}
// o número de quadros de um vídeo, contando os pacotes (como o animation-studio confere)
function contaQuadros(arq) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-count_packets', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', arq], { encoding: 'utf8' });
  return parseInt((r.stdout || '').trim(), 10);
}
// volume integrado (LUFS) e pico real (dBFS) de um arquivo, pelo ffmpeg (o mesmo do passo 9 da passagem)
function volume(arq) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', arq, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 26 });
  const s = r.stderr.slice(r.stderr.lastIndexOf('Summary:'));
  const I = parseFloat((s.match(/I:\s+(-?[\d.]+) LUFS/) || [])[1]);
  const pico = parseFloat((s.match(/Peak:\s+(-?[\d.]+|-inf) dBFS/) || [])[1]);
  return { I, pico };
}

// tempo de uma frase na tela: palavras ÷ 2,17 por segundo + 0,5 s de folga (a regra do sus-hoje, que vale para todo vídeo)
const VEL_LEITURA = 2.17, FOLGA_LEITURA = 0.5;
const palavras = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const tempoMinimo = (s) => palavras(s) / VEL_LEITURA + FOLGA_LEITURA;

// um instante: segundos (12.5), @marcador (com ±s) ou [NN] (o começo da frase NN; com fim=true, o fim dela)
function instante(S, a, { fim = false } = {}) {
  const s = String(a).trim();
  let m = /^\[(\d+)\]$/.exec(s);
  if (m) {
    const it = S.linha && S.linha[parseInt(m[1], 10)];
    if (!it) throw new Error(`a frase [${m[1]}] não está no vídeo (veja o textos.txt)`);
    return fim ? it.t1 : it.t0;
  }
  m = /^@([A-Za-z_]\w*)([+-]\d*\.?\d+)?$/.exec(s);
  if (m) {
    const mk = (S.markers || {})[m[1]];
    if (mk === undefined) throw new Error(`não existe o marcador @${m[1]} no score.js (há: ${Object.keys(S.markers || {}).join(', ')})`);
    return (typeof mk === 'number' ? mk : mk.t) + (m[2] ? parseFloat(m[2]) : 0);
  }
  const t = Number(s);
  if (!Number.isFinite(t)) throw new Error(`"${a}" não é um instante: use segundos (12.5), @marcador ou [NN]`);
  return t;
}

// os tempos que o vídeo renderizado usou: para o comando trecho saber o que mudou depois
function retratoTempos(S) {
  return {
    DURATION: S.DURATION,
    cenas: (S.cenas || []).map((c) => ({ id: c.id, t0: c.t0, t1: c.t1 })),
    linha: Object.fromEntries(Object.entries(S.linha || {}).map(([n, it]) => [n, { t0: it.t0, t1: it.t1, texto: (S.TX || {})[n] || '' }])),
    palavras: Object.fromEntries(Object.entries(S.TX || {}).filter(([k]) => k[0] === 'D')),
  };
}

// as linhas do pacing do animation-studio, em português (o resto passa como veio)
function traduzRitmo(l) {
  const R = [
    [/first movement (\S+) after the picture starts.*/, (m) => `primeiro movimento ${m[1]} depois que a imagem começa (o certo: até 1 s; abertura parada perde quem rola o feed)`],
    [/first movement never.*/, () => 'nada se mexe no começo (o certo: algo se mexer até 1 s)'],
    [/first sound at (\S+)s .*/, (m) => `primeiro som em ${m[1]} s (o certo: até 1 s)`],
    [/(\d+) hits \(cuts, big changes, sound onsets\) in the first 3s.*/, (m) => `${m[1]} batidas (cortes, mudanças grandes, entradas de som) nos 3 primeiros segundos (o certo: 2 ou mais)`],
    [/first on-screen text at (\S+)s .*/, (m) => `primeiro texto na tela em ${m[1]} s (o certo: até 3 s, para quem assiste sem som)`],
    [/longest stretch without a cut: (\S+)s from (\S+)s .*/, (m) => `maior trecho sem corte: ${m[1]} s, a partir de ${m[2]} s (o certo: até 12 s)`],
    [/first 3s are (\S+) dB quieter than the film.*/, (m) => `os 3 primeiros segundos estão ${m[1]} dB abaixo do resto (o certo: menos de 12)`],
  ];
  for (const [re, f] of R) { const m = re.exec(l); if (m) return l.slice(0, m.index) + f(m); }
  return l;
}

module.exports = {
  traduzRitmo, MOTOR, FERR, acharStudio, ehExterno, ehCarrossel, pastaPeca, posicionais, lerPeca, ganchoPeca, lerMapa, lerScore, conferirCenas, pastaEngine, roda, render,
  arquivoFinal, arquivoVideo, mmss, n2, mtime, mb, sonda, contaQuadros, volume, VEL_LEITURA, FOLGA_LEITURA, palavras, tempoMinimo, instante, retratoTempos,
};
