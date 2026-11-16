// PRESEME · motor do reel · o que vira imagem: folha de quadros, folha de textos, rascunho, trecho, definitivo, juntar e capa.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const C = require('./comum');

const relogio = () => { const t0 = Date.now(); return () => `${((Date.now() - t0) / 1000).toFixed(0)} s`; };
const reduzir = (de, para, lado = 1900) => C.roda('python3', ['-I', '-c', `from PIL import Image; im = Image.open(${JSON.stringify(de)}); k = ${lado} / max(im.size); im.convert('RGB').resize((int(im.size[0] * k), int(im.size[1] * k))).save(${JSON.stringify(para)}, quality=88); print(im.size)`], { quieto: true }).trim();

// quadros: a folha de quadros (um por marcador) e a cópia reduzida que se abre com Read (passo 7 da passagem)
function quadros(args) {
  const dir = C.pastaPeca(args, { soStudio: true });
  const fim = relogio();
  const s = C.render(dir, ['board', ...C.posicionais(args)], { quieto: true });
  const linha = s.split('\n').find((l) => /board written/.test(l)) || s.trim();
  console.log(linha);
  reduzir(path.join(dir, 'out', 'board.png'), path.join(dir, 'out', 'folha.jpg'));
  console.log(`out/folha.jpg pronta (lado maior 1.900 px), em ${fim()}: abra com a ferramenta Read e confira quadro por quadro.`);
}

// folha-textos: um quadro pequeno por frase, no instante em que ela está inteira na tela (decisão 115)
function folhaTextos(args) {
  const dir = C.pastaPeca(args);
  const fim = relogio();
  const dest = path.join(dir, 'out', 'folha-textos.jpg');
  let s;
  if (C.ehExterno(dir)) {
    // peça de fora: os quadros saem do MP4 que o motor de fora entregou, nos tempos das frases do cenas.json
    const S = C.lerScore(dir);
    const fonte = [C.arquivoVideo(dir, false), C.arquivoFinal(dir, false), C.arquivoVideo(dir, true), C.arquivoFinal(dir, true)].find((f) => fs.existsSync(f));
    if (!fonte) throw new Error('falta o vídeo de onde tirar os quadros (out/video.mp4, o que o motor de fora entrega)');
    const quadros = [];
    for (const c of S.cenas) for (const it of c.itens) if (it.n) quadros.push([it.n, Math.round(Math.min(it.t0 + 0.7 * (it.t1 - it.t0), it.t1 - 0.25) * 100) / 100]);
    if (!quadros.length) throw new Error('o cenas.json não tem "frases": sem o tempo de cada frase não há folha de textos');
    s = C.roda('python3', ['-I', path.join(C.FERR, 'preseme-folha-externa.py'), fonte, dest, JSON.stringify(quadros)], { cwd: dir, quieto: true }).trim();
  } else {
    s = C.roda('python3', ['-I', path.join(C.FERR, 'preseme-folha-textos.py'), dest], { cwd: dir, quieto: true }).trim();
  }
  console.log(`${s.split('\n').pop()}  (em ${fim()})`);
  console.log('Abra out/folha-textos.jpg com Read antes de mandar. Para ele: entregar folha.');
}

// o som tem de ser do texto e do mapa atuais antes de qualquer vídeo
function somEmDia(dir) {
  const mw = path.join(dir, 'out', 'music.wav');
  const fontes = ['textos.js', 'score.js', 'mapa-do-som.json', 'cenas.json'].map((f) => path.join(dir, f));
  return fs.existsSync(mw) && fontes.every((f) => C.mtime(f) <= C.mtime(mw));
}
function fazerSom(dir) {
  require('./som').comando(['--peca', dir]);
  if (process.exitCode) throw new Error('o som falhou (veja acima): o vídeo não foi feito');
}

function gravarRetrato(dir, rascunho) {
  const S = C.lerScore(dir);
  fs.writeFileSync(path.join(dir, 'out', `tempos-${rascunho ? 'rascunho' : 'final'}.json`), JSON.stringify(C.retratoTempos(S), null, 1));
}

// rascunho: o vídeo inteiro em meia resolução, com som, e o ritmo
function rascunho(args) {
  const dir = C.pastaPeca(args, { soStudio: true });
  const fim = relogio();
  if (!somEmDia(dir)) fazerSom(dir);
  console.log('vídeo em meia resolução: demora uns minutos (no sus-hoje, 163 s de vídeo, 7 min com 2 núcleos). Rode este comando com run_in_background.');
  C.render(dir, ['video', '--draft'], { aoVivo: true }); // mostra o andamento (quadros, velocidade, quanto falta)
  const m = C.render(dir, ['mux', '--draft'], { quieto: true });
  console.log(m.split('\n').filter((l) => /wrote/.test(l)).join('\n'));
  const p = C.render(dir, ['pacing', '--draft'], { quieto: true });
  console.log(p.split('\n').filter((l) => /^[✓⚠]/.test(l)).map((l) => l.slice(0, 2) + C.traduzRitmo(l.slice(2))).join('\n'));
  gravarRetrato(dir, true);
  console.log(`rascunho pronto em ${fim()}: ${path.relative(dir, C.arquivoFinal(dir, true))}. Para ele: entregar rascunho.`);
}

// definitivo: som, vídeo inteiro, junção e as medidas do animation-studio (passos 17 e 18 da passagem)
function definitivo(args) {
  const dir = C.pastaPeca(args, { soStudio: true });
  const fim = relogio();
  fazerSom(dir); // sempre: a música tem de ter a duração do texto final
  console.log('vídeo inteiro em 1080 × 1920: demora (umas 3 a 4 vezes o rascunho). Rode este comando com run_in_background.');
  C.render(dir, ['video'], { aoVivo: true }); // mostra o andamento (quadros, velocidade, quanto falta)
  const m = C.render(dir, ['mux'], { quieto: true });
  console.log(m.split('\n').filter((l) => /wrote/.test(l)).join('\n'));
  const ch = C.render(dir, ['check'], { quieto: true });
  console.log(ch.trim().split('\n').slice(-4).join('\n'));
  const p = C.render(dir, ['pacing'], { quieto: true });
  console.log(p.split('\n').filter((l) => /^[✓⚠]/.test(l)).map((l) => l.slice(0, 2) + C.traduzRitmo(l.slice(2))).join('\n'));
  const q = C.render(dir, ['qa'], { quieto: true });
  console.log(q.split('\n').filter((l) => /visual QA|✓|problem/.test(l)).slice(0, 3).join('\n'));
  const vf = C.render(dir, ['verify'], { quieto: true, aceita: [0, 1] });
  console.log(vf.trim().split('\n').slice(-2).join('\n'));
  const s = C.sonda(C.arquivoFinal(dir, false));
  console.log(`ffprobe: ${s.w} × ${s.h}, ${s.fps}, ${s.dur.toFixed(2)} s, ${(s.tam / 1e6).toFixed(1)} MB`);
  gravarRetrato(dir, false);
  console.log(`definitivo pronto em ${fim()}: ${path.relative(dir, C.arquivoFinal(dir, false))}. Depois: capa, conferir e entregar.`);
}

// trecho <de> <até> [--final]: refaz só um pedaço e cola no vídeo (quando o tempo total e o resto não mudaram)
function trecho(args) {
  const dir = C.pastaPeca(args, { soStudio: true });
  const fim = relogio();
  const final = args.includes('--final');
  const [de, ate] = C.posicionais(args);
  if (!de || !ate) throw new Error('uso: trecho <de> <até> [--final]   ex.: trecho [29] [30]   ou   trecho 136 160');
  const S = C.lerScore(dir);
  const FPS = S.FPS || 30, N = Math.round(S.DURATION * FPS);
  const vid = C.arquivoVideo(dir, !final), ret = path.join(dir, 'out', `tempos-${final ? 'final' : 'rascunho'}.json`);
  if (!fs.existsSync(vid) || !fs.existsSync(ret)) throw new Error(`não há ${final ? 'definitivo' : 'rascunho'} feito pelo motor para emendar (${path.relative(dir, vid)}). Rode ${final ? 'definitivo' : 'rascunho'} inteiro.`);
  const velho = JSON.parse(fs.readFileSync(ret, 'utf8'));
  if (Math.abs(velho.DURATION - S.DURATION) > 1e-6) throw new Error(`o tempo total mudou (${velho.DURATION.toFixed(2)} → ${S.DURATION.toFixed(2)} s): o trecho não serve. Rode ${final ? 'definitivo' : 'rascunho'} inteiro.`);
  let a = Math.max(0, C.instante(S, de)), b = Math.min(S.DURATION, C.instante(S, ate, { fim: true }));
  const f0 = Math.ceil(a * FPS - 1e-6), f1 = Math.min(N, Math.ceil(b * FPS - 1e-6));
  if (!(f1 > f0)) throw new Error(`trecho vazio: ${a.toFixed(2)} → ${b.toFixed(2)} s`);
  a = f0 / FPS; b = f1 / FPS;
  // o que mudou desde o vídeo: tem de caber dentro do trecho (conta em quadros, como o vídeo)
  const quadro = (t) => Math.ceil(t * FPS - 1e-6);
  const novo = C.retratoTempos(S), fora = [];
  for (const n of new Set([...Object.keys(velho.linha), ...Object.keys(novo.linha)])) {
    const x = velho.linha[n], y = novo.linha[n];
    const mudou = !x || !y || Math.abs(x.t0 - y.t0) > 1e-6 || Math.abs(x.t1 - y.t1) > 1e-6 || x.texto !== y.texto;
    if (!mudou) continue;
    const ini = Math.min(x ? x.t0 : Infinity, y ? y.t0 : Infinity), ter = Math.max(x ? x.t1 : -Infinity, y ? y.t1 : -Infinity);
    if (quadro(ini) < f0 || quadro(ter) > f1) fora.push(`[${C.n2(n)}] (de ${ini.toFixed(2)} a ${ter.toFixed(2)} s)`);
  }
  for (const c of novo.cenas) {
    const x = velho.cenas.find((k) => k.id === c.id);
    if (!x || Math.abs(x.t0 - c.t0) > 1e-6 || Math.abs(x.t1 - c.t1) > 1e-6) { if (quadro(Math.min(c.t0, x ? x.t0 : c.t0)) < f0 || quadro(Math.max(c.t1, x ? x.t1 : c.t1)) > f1) fora.push(`cena ${c.id}`); }
  }
  if (fora.length) throw new Error(`mudou também fora do trecho: ${fora.join(', ')}. Aumente o trecho para cobrir essas partes, ou rode ${final ? 'definitivo' : 'rascunho'} inteiro.`);
  const pal = Object.keys(Object.assign({}, velho.palavras, novo.palavras)).filter((k) => velho.palavras[k] !== novo.palavras[k]);
  if (pal.length) console.log(`AVISO: mudaram palavras de dentro do desenho (${pal.join(', ')}): elas podem aparecer fora do trecho. Confira a folha de quadros.`);
  const desenho = ['score.js', 'index.html', ...fs.readdirSync(dir).filter((f) => /^film.*\.js$/.test(f))].filter((f) => C.mtime(path.join(dir, f)) > C.mtime(vid));
  if (desenho.length) console.log(`AVISO: ${desenho.join(', ')} mudou depois do vídeo: se a mudança aparece fora do trecho, o trecho não basta.`);
  if (!somEmDia(dir)) fazerSom(dir);
  // 1) de onde a onde refazer: do quadro-chave antes do trecho ao quadro-chave depois dele (só ali o vídeo se corta sem recomprimir)
  const K = quadrosChave(vid);
  const kA = Math.max(...K.filter((k) => k <= f0)), depois = K.filter((k) => k >= f1), kB = depois.length ? Math.min(...depois) : N;
  // 2) os quadros novos, um por um, com as mesmas imagens que o vídeo inteiro desenharia (o mesmo instante, f / FPS)
  const pasta = path.join(dir, 'out', 'stills'), tmpd = path.join(dir, 'out', `.trecho-${process.pid}`);
  fs.rmSync(pasta, { recursive: true, force: true });
  fs.rmSync(tmpd, { recursive: true, force: true });
  fs.mkdirSync(tmpd, { recursive: true });
  let como = '';
  try {
    const tempos = [];
    for (let f = kA; f < kB; f++) tempos.push(String(f / FPS));
    C.render(dir, ['stills', ...tempos, ...(final ? [] : ['--draft'])], { quieto: true });
    tempos.forEach((t, i) => fs.renameSync(path.join(pasta, `t_${Number(t).toFixed(2).padStart(6, '0')}.png`), path.join(tmpd, `f_${String(i).padStart(6, '0')}.png`)));
    // 3) o pedaço novo, com a mesma compressão do vídeo inteiro do animation-studio (png, crf 14, medium, -g 60)
    const seg = path.join(tmpd, 'novo.mp4');
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(tmpd, 'f_%06d.png'), '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-g', '60', seg]);
    if (C.contaQuadros(seg) !== kB - kA) throw new Error(`o pedaço novo saiu com ${C.contaQuadros(seg)} quadros, e eram ${kB - kA}: nada foi trocado`);
    // 4) a emenda: sem recomprimir (corta o vídeo nos quadros-chave e junta as partes), se os parâmetros do H.264 forem os mesmos
    const tmp = path.join(tmpd, 'emendado.mp4');
    if (parametrosH264(seg) === parametrosH264(vid)) {
      const cortes = [kA, kB].filter((k) => k > 0 && k < N);
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', vid, '-map', '0:v', '-c', 'copy', '-f', 'segment', ...(cortes.length ? ['-segment_frames', cortes.join(',')] : ['-segment_time', '100000']), '-reset_timestamps', '1', '-segment_format', 'mp4', path.join(tmpd, 'parte%d.mp4')]);
      const lista = [];
      if (kA > 0) lista.push(path.join(tmpd, 'parte0.mp4'));
      lista.push(seg);
      if (kB < N) lista.push(path.join(tmpd, `parte${kA > 0 ? 2 : 1}.mp4`));
      if (kA > 0 && C.contaQuadros(lista[0]) !== kA) throw new Error('o corte antes do trecho não caiu no quadro-chave: nada foi trocado');
      fs.writeFileSync(path.join(tmpd, 'lista.txt'), lista.map((f) => `file '${f}'`).join('\n'));
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(tmpd, 'lista.txt'), '-c', 'copy', tmp]);
      como = 'sem recomprimir o resto';
    } else {
      // parâmetros diferentes (vídeo de uma emenda antiga, outra versão do ffmpeg): recomprime tudo com a compressão do animation-studio
      const partes = [], ent = [];
      if (kA > 0) { partes.push(`[0:v]trim=end_frame=${kA},setpts=PTS-STARTPTS[a]`); ent.push('[a]'); }
      partes.push('[1:v]setpts=PTS-STARTPTS[b]'); ent.push('[b]');
      if (kB < N) { partes.push(`[0:v]trim=start_frame=${kB},setpts=PTS-STARTPTS[c]`); ent.push('[c]'); }
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', vid, '-i', seg, '-filter_complex', `${partes.join(';')};${ent.join('')}concat=n=${ent.length}:v=1:a=0[v]`, '-map', '[v]', '-r', String(FPS), '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-g', '60', tmp]);
      como = 'recomprimindo o vídeo inteiro, com a compressão do animation-studio (os parâmetros do H.264 do vídeo eram outros; o próximo trecho já emenda sem recomprimir)';
    }
    const total = C.contaQuadros(tmp);
    if (total !== N) throw new Error(`a emenda saiu com ${total} quadros, e o vídeo tem ${N}: nada foi trocado`);
    const dec = spawnSync('ffmpeg', ['-v', 'error', '-i', tmp, '-f', 'null', '-'], { encoding: 'utf8' });
    if (dec.status !== 0 || dec.stderr.trim()) throw new Error(`a emenda não decodifica limpa: nada foi trocado\n${dec.stderr.trim().split('\n').slice(0, 3).join('\n')}`);
    fs.renameSync(tmp, vid);
    // 5) o som junto: no rascunho, uma compressão rápida (24 MB e 40 s no sus-hoje, contra 29 MB e 1 min 42 do mux do animation-studio);
    //    no definitivo, o mux do animation-studio (o arquivo de postar)
    if (final) {
      const m = C.render(dir, ['mux'], { quieto: true });
      console.log(m.split('\n').filter((l) => /wrote/.test(l)).join('\n'));
    } else {
      const dest = C.arquivoFinal(dir, true);
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', vid, '-i', path.join(dir, 'out', 'music.wav'), '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', dest]);
      const q = C.sonda(dest);
      if (Math.abs(q.dur - S.DURATION) > 2 / FPS) throw new Error(`${path.relative(dir, dest)} saiu com ${q.dur.toFixed(2)} s, e o vídeo tem ${S.DURATION.toFixed(2)} s`);
      console.log(`${path.relative(dir, dest)} gravado: ${q.dur.toFixed(2)} s, ${(q.tam / 1e6).toFixed(1)} MB`);
    }
  } finally {
    fs.rmSync(tmpd, { recursive: true, force: true });
  }
  gravarRetrato(dir, !final);
  console.log(`trecho de ${a.toFixed(2)} a ${b.toFixed(2)} s refeito: ${kB - kA} quadros (${(kA / FPS).toFixed(2)} a ${(kB / FPS).toFixed(2)} s, de quadro-chave a quadro-chave), emendado ${como}, em ${fim()}.`);
}

// os quadros-chave de um vídeo (índices na ordem dos pacotes; num H.264 de GOP fechado, é o número do quadro)
function quadrosChave(arq) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'packet=flags', '-of', 'csv=p=0', arq], { encoding: 'utf8', maxBuffer: 1 << 28 });
  const k = [];
  r.stdout.trim().split('\n').forEach((l, i) => { if (l.includes('K')) k.push(i); });
  if (k[0] !== 0) throw new Error(`${arq}: o vídeo não começa num quadro-chave`);
  return k;
}
// os parâmetros do H.264 (SPS e PPS): dois pedaços só se emendam sem recomprimir se forem iguais
function parametrosH264(arq) {
  const b = spawnSync('ffmpeg', ['-v', 'error', '-i', arq, '-map', '0:v:0', '-c:v', 'copy', '-frames:v', '1', '-bsf:v', 'h264_mp4toannexb', '-f', 'h264', '-'], { maxBuffer: 1 << 28 }).stdout;
  const nals = [];
  let ini = -1;
  for (let i = 0; i + 3 < b.length;) {
    const c3 = b[i] === 0 && b[i + 1] === 0 && b[i + 2] === 1, c4 = b[i] === 0 && b[i + 1] === 0 && b[i + 2] === 0 && b[i + 3] === 1;
    if (c3 || c4) { if (ini >= 0) nals.push(b.subarray(ini, i)); i += c4 ? 4 : 3; ini = i; } else i++;
  }
  if (ini >= 0) nals.push(b.subarray(ini));
  return nals.filter((n) => [7, 8].includes(n[0] & 0x1f)).map((n) => n.toString('hex')).join('|');
}

// juntar: a imagem (out/video.mp4) com o som (out/music.wav) → out/<nome>.mp4. Para vídeo de fora; no animation-studio, é o mux.
function juntar(args) {
  const dir = C.pastaPeca(args);
  const r = args.includes('--rascunho');
  if (!C.ehExterno(dir)) { const m = C.render(dir, ['mux', ...(r ? ['--draft'] : [])], { quieto: true }); console.log(m.split('\n').filter((l) => /wrote/.test(l)).join('\n')); return; }
  const S = C.lerScore(dir);
  const vid = C.arquivoVideo(dir, r), mw = path.join(dir, 'out', 'music.wav'), dest = C.arquivoFinal(dir, r);
  if (!fs.existsSync(vid)) throw new Error(`falta ${path.relative(dir, vid)} (a imagem que o motor de fora entrega)`);
  if (!fs.existsSync(mw)) throw new Error('falta out/music.wav: rode som antes');
  // a imagem do motor de fora vai como veio se já for H.264 yuv420p a 30 quadros; senão, é recomprimida uma vez
  const e = C.sonda(vid), copia = e.codec === 'h264' && e.pix === 'yuv420p' && e.fps === `${S.FPS || 30}/1`;
  const img = copia ? ['-c:v', 'copy'] : ['-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(S.FPS || 30), '-g', '60'];
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', vid, '-i', mw, '-map', '0:v', '-map', '1:a', ...img, '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', dest]);
  console.log(copia ? 'imagem copiada como veio (H.264 yuv420p)' : `imagem recomprimida: veio em ${e.codec} ${e.pix} a ${e.fps}, saiu em H.264 yuv420p a ${S.FPS || 30}/1`);
  const s = C.sonda(dest);
  if (Math.abs(s.dur - S.DURATION) > 2 / (S.FPS || 30)) throw new Error(`${path.relative(dir, dest)} tem ${s.dur.toFixed(2)} s, e o cenas.json diz ${S.DURATION.toFixed(2)} s`);
  console.log(`${path.relative(dir, dest)} gravado: ${s.w} × ${s.h}, ${s.dur.toFixed(2)} s, ${(s.tam / 1e6).toFixed(1)} MB`);
}

// capa [@marcador]: a capa (1080 × 1920) e o recorte 3:4 da grade do perfil, de y 240 a 1680 (passo 20 da passagem)
function capa(args) {
  const dir = C.pastaPeca(args);
  const peca = C.lerPeca(dir);
  const S = C.lerScore(dir);
  const alvo = C.posicionais(args)[0] || peca.capa;
  if (!alvo) throw new Error('diga o instante da capa: capa @marcador (ou ponha "capa" no peca.json)');
  const t = C.instante(S, alvo);
  const dest = path.join(dir, 'out', `capa-${peca.nome}.png`);
  if (C.ehExterno(dir)) {
    const fonte = [C.arquivoFinal(dir, false), C.arquivoVideo(dir, false)].find((f) => fs.existsSync(f));
    if (!fonte) throw new Error('falta o vídeo para tirar a capa (out/video.mp4)');
    require('./conferir').quadroDoVideo(fonte, t, dest);
  } else {
    const pasta = path.join(dir, 'out', 'stills');
    fs.rmSync(pasta, { recursive: true, force: true });
    C.render(dir, ['stills', t.toFixed(3)], { quieto: true });
    const f = fs.readdirSync(pasta).find((x) => x.endsWith('.png'));
    fs.copyFileSync(path.join(pasta, f), dest);
  }
  const tam = C.roda('python3', ['-I', '-c', `from PIL import Image; c = Image.open(${JSON.stringify(dest)}); print(c.size); c.convert('RGB').crop((0, 240, 1080, 1680)).resize((540, 720)).save(${JSON.stringify(path.join(dir, 'out', 'capa-grade.jpg'))}, quality=88)`], { quieto: true }).trim();
  console.log(`${path.relative(dir, dest)} ${tam}, do instante ${t.toFixed(2)} s; recorte da grade em out/capa-grade.jpg: abra com Read e confira se o título, o rosto e o que importa aparecem inteiros.`);
}

module.exports = { quadros, folhaTextos, rascunho, definitivo, trecho, juntar, capa };
