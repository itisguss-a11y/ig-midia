// PRESEME · motor do reel · conferir: tudo o que se mede, numa lista só (a lista da fábrica, passo 5, no que é medida).
// Texto: o textos.js é do textos.txt atual, cabe no limite e dá tempo de ler. Desenho: o qa do animation-studio (área
// segura, tamanho, sobreposição, contraste) e as cores da paleta. Vídeo: 1080 × 1920 a 30 quadros por segundo, duração,
// volume de celular, pico, ritmo (pacing), tamanho do arquivo e o aviso de 2,9 MB do Drive. Som em blocos: cada troca
// de música cai num corte. Vale também para vídeo de fora do animation-studio (cenas.json): aí o qa fica com quem desenhou.
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');
const C = require('./comum');
const TXT = require('./textos');

const PALETA = ['#17402C', '#F4EDDF', '#E4EB6C', '#F16D4D', '#B5D8C0', '#30724E', '#072618', '#FFFDF6']; // as seis, a Noite e o branco do papel
const DRIVE_MB = 2.9;

// a parte da imagem que muda de um quadro para o outro, perto do instante t (corte: muda muito de uma vez)
function mudanca(arq, t) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-ss', String(Math.max(0, t - 0.1)), '-i', arq, '-frames:v', '7', '-vf', 'scale=54:96:flags=area,format=gray', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { maxBuffer: 1 << 24 });
  const buf = r.stdout, FS = 54 * 96, nF = Math.floor(buf.length / FS);
  let maior = 0;
  for (let k = 1; k < nF; k++) {
    let n = 0;
    for (let i = 0; i < FS; i++) if (Math.abs(buf[k * FS + i] - buf[(k - 1) * FS + i]) > 20) n++;
    maior = Math.max(maior, (100 * n) / FS);
  }
  return maior;
}
// um quadro do vídeo no instante t, em PNG (peça de fora não tem o render.js)
function quadroDoVideo(arq, t, dest) {
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', t.toFixed(3), '-i', arq, '-frames:v', '1', dest]);
}

// ---------- os cortes que a peça declara ----------
// Nos tipos em que a câmera anda (linha do tempo, escada de níveis), a cena troca sem a imagem mudar de uma vez, e a
// medida da imagem não vê esse corte. A peça declara os cortes no score.js (CORTES; no cenas.json, "cortes"): uma lista
// de instantes (segundos, "@marcador" ou "[NN]") ou "cenas" (o começo de cada cena depois da primeira). Sem CORTES,
// nada muda. Devolve { cortes } (em segundos, em ordem) ou { erro }.
function cortesDeclarados(S) {
  const d = S.CORTES;
  if (d === undefined || d === null) return { cortes: null };
  const lista = d === 'cenas' ? (S.cenas || []).slice(1).map((c) => c.t0) : Array.isArray(d) ? d : null;
  if (!lista) return { erro: 'os cortes declarados (CORTES no score.js, "cortes" no cenas.json) têm de ser uma lista de instantes (segundos, "@marcador" ou "[NN]") ou "cenas"' };
  try {
    const ts = lista.map((c) => (typeof c === 'number' ? c : C.instante(S, c)));
    return { cortes: [...new Set(ts.map((t) => Math.round(t * 1000) / 1000))].filter((t) => t > 0 && t < S.DURATION).sort((a, b) => a - b) };
  } catch (e) { return { erro: `os cortes declarados (CORTES no score.js, "cortes" no cenas.json): ${e.message}` }; }
}
// os cortes que a medida de ritmo achou na imagem, lidos do pacing.svg que ela grava (o render.js só imprime o resumo):
// no gráfico, x = 40 + (t ÷ duração) × 1140; o começo da imagem é o retângulo do gancho, e cada corte, uma linha laranja
function cortesMedidos(svg, dur) {
  const t = (x) => ((parseFloat(x) - 40) / 1140) * dur;
  const ini = /<rect x="([-\d.e+]+)" y="10"[^>]*fill="#FFF3D6"/.exec(svg);
  if (!ini || !(dur > 0)) return null;
  return { t0: t(ini[1]), cortes: [...svg.matchAll(/<line x1="([-\d.e+]+)" y1="10" x2="[-\d.e+]+" y2="[\d.]+" stroke="#E0703E"/g)].map((m) => t(m[1])) };
}
// o maior trecho sem corte, juntando os cortes da imagem e os declarados
function maiorTrecho(t0, cortes, dur) {
  const b = [t0, ...[...new Set(cortes)].filter((c) => c > t0 && c < dur).sort((p, q) => p - q), dur];
  let maior = 0, em = t0;
  for (let i = 1; i < b.length; i++) if (b[i] - b[i - 1] > maior) { maior = b[i] - b[i - 1]; em = b[i - 1]; }
  return { maior, em };
}

function comando(args) {
  const dir = C.pastaPeca(args);
  const peca = C.lerPeca(dir);
  const externo = C.ehExterno(dir);
  const out = path.join(dir, 'out');
  fs.mkdirSync(out, { recursive: true });
  let erros = 0, avisos = 0;
  const ok = (m) => console.log(`✓ ${m}`);
  const aviso = (m) => { avisos++; console.log(`⚠ ${m}`); };
  const erro = (m) => { erros++; console.log(`✗ ${m}`); };

  // 1. texto
  const txt = path.join(dir, 'textos.txt'), js = path.join(dir, 'textos.js');
  if (!fs.existsSync(txt)) erro('falta o textos.txt');
  else {
    const { problemas } = TXT.lerTxt(txt);
    for (const p of problemas) (p.grave ? erro : aviso)(`textos.txt: ${p.msg}`);
    if (externo) ok('textos.txt no formato [NN] (peça de fora: quem desenha lê o arquivo)');
    else if (!fs.existsSync(js) || C.mtime(js) < C.mtime(txt)) erro('o textos.js é mais velho que o textos.txt: rode o comando textos antes');
    else ok('o textos.js saiu do textos.txt atual');
  }
  const S = C.lerScore(dir);
  for (const e of C.conferirCenas(S)) erro(e);
  // a conferência do tipo (peca.js), a mesma do comando textos: o que trava lá trava aqui, antes de entregar
  const g = externo ? {} : C.ganchoPeca(dir);
  if (typeof g.conferir === 'function' && fs.existsSync(txt)) {
    const r = g.conferir(TXT.lerTxt(txt).T, S) || {};
    for (const l of r.linhas || []) {
      if (/^ERRO/i.test(l)) erro(`tipo: ${l.replace(/^ERRO:\s*/i, '')}`);
      else if (/^aviso/i.test(l)) aviso(`tipo: ${l.replace(/^aviso:\s*/i, '')}`);
      else ok(`tipo: ${l}`);
    }
    if (r.ok === false && !(r.linhas || []).some((l) => /^ERRO/i.test(l))) erro('tipo: a conferência do peca.js travou');
  }
  if (S.DURATION > peca.limite) erro(`duração ${S.DURATION.toFixed(2)} s passa do limite de ${peca.limite} s`);
  else ok(`duração ${S.DURATION.toFixed(2)} s (${C.mmss(S.DURATION)}), abaixo do limite de ${peca.limite} s`);
  const curtas = Object.entries(S.linha || {}).filter(([n, it]) => it.t1 - it.t0 < C.tempoMinimo((S.TX || {})[n]) - 0.05 * (S.BEAT || 0) - 1e-6);
  if (curtas.length) aviso(`frases que somem antes de dar tempo de ler: ${curtas.map(([n]) => `[${C.n2(n)}]`).join(', ')} (rode textos para ver os tempos)`);
  else if (Object.keys(S.linha || {}).length) ok('toda frase fica na tela o tempo de ler');
  else if (externo) aviso('cenas.json sem "frases": sem elas não dá para conferir o tempo de leitura');

  // o vídeo que vale (o definitivo; sem ele, ou com --rascunho, o rascunho; numa peça de fora, ainda o out/video.mp4)
  const fin = C.arquivoFinal(dir, false), ras = C.arquivoFinal(dir, true);
  const rascunho = args.includes('--rascunho') || (!fs.existsSync(fin) && fs.existsSync(ras));
  let arq = rascunho ? ras : fin;
  const imagem = fs.existsSync(arq) ? arq : [C.arquivoVideo(dir, rascunho), C.arquivoVideo(dir, !rascunho)].find((f) => fs.existsSync(f));

  // 2. o qa do animation-studio (texto da tela: área segura, tamanho, sobreposição, contraste)
  if (externo) ok('qa do texto da tela: fica com o motor que desenhou (peça de fora)');
  else {
    const qa = C.render(dir, ['qa'], { quieto: true });
    const nqa = parseInt((qa.match(/(\d+) distinct problems/) || [])[1], 10);
    if (nqa === 0) ok(`qa: ${(qa.match(/visual QA: (\d+) frames/) || [])[1]} quadros, 0 problemas`);
    else { erro(`qa: ${nqa} problema(s) no texto da tela (marcados em out/qa.png):`); console.log(qa.split('\n').filter((l) => /safe|small|overlap|contrast/i.test(l)).slice(0, 12).map((l) => '    ' + l.trim()).join('\n')); }
  }

  // 3. cores: um quadro por marcador (sem marcadores, um no meio de cada cena), contra a paleta e as cores da peça
  const pastaQ = path.join(out, 'stills');
  fs.rmSync(pastaQ, { recursive: true, force: true });
  fs.mkdirSync(pastaQ, { recursive: true });
  const mk = Object.entries(S.markers || {}).map(([, m]) => (typeof m === 'number' ? m : m.t));
  const tempos = (mk.length ? mk : (S.cenas || []).map((c) => (c.t0 + c.t1) / 2)).filter((t) => t >= 0 && t < S.DURATION);
  if (externo) {
    if (imagem) tempos.forEach((t) => quadroDoVideo(imagem, t, path.join(pastaQ, `t_${t.toFixed(2).padStart(6, '0')}.png`)));
  } else C.render(dir, ['stills', ...tempos.map((t) => t.toFixed(3))], { quieto: true });
  const quadros = fs.readdirSync(pastaQ).filter((f) => f.endsWith('.png')).sort().map((f) => path.join(pastaQ, f));
  if (!quadros.length) aviso('cores: sem quadros para conferir (falta o vídeo)');
  else {
    const cfg = path.join(out, 'cores.json');
    fs.writeFileSync(cfg, JSON.stringify({ paleta: PALETA, extras: peca.cores || [] }));
    const cr = C.roda('python3', ['-I', path.join(C.FERR, 'preseme-cores.py'), cfg, ...quadros], { quieto: true });
    const foras = cr.split('\n').filter((l) => l.startsWith('AVISO cores'));
    if (foras.length) { aviso(`cores: ${foras.length} quadro(s) com mancha fora da paleta (o que for de propósito vai no peca.json, em "cores"):`); for (const l of foras.slice(0, 8)) console.log('    ' + l.replace('AVISO cores  ', '')); }
    else ok(`cores: ${quadros.length} quadros, nenhuma mancha fora da paleta`);
  }

  // 4. o vídeo final (ou o rascunho)
  if (!fs.existsSync(arq)) {
    aviso(`ainda não há vídeo com som (${path.relative(dir, arq)}): rode ${externo ? 'som e juntar' : 'rascunho ou definitivo'}`);
    const mw = path.join(out, 'music.wav');
    if (fs.existsSync(mw)) {
      const v = C.volume(mw);
      if (v.I >= -17 && v.I <= -15) ok(`som: out/music.wav em ${v.I.toFixed(1)} LUFS, pico ${v.pico.toFixed(1)} dBFS`);
      else erro(`som: out/music.wav em ${v.I.toFixed(1)} LUFS (tem de ficar entre -17 e -15)`);
    }
  } else {
    console.log(`vídeo conferido: ${path.relative(dir, arq)}${rascunho ? ' (rascunho, meia resolução)' : ''}`);
    const s = C.sonda(arq);
    const [W, H] = rascunho ? [540, 960] : [1080, 1920];
    if (s.w === W && s.h === H && s.fps === '30/1') ok(`imagem ${s.w} × ${s.h}, 30 quadros por segundo`);
    else erro(`imagem ${s.w} × ${s.h} a ${s.fps} quadros por segundo (o certo é ${W} × ${H} a 30/1)`);
    if (s.codec === 'h264' && s.pix === 'yuv420p') ok('imagem em H.264 com cor yuv420p (a que o Instagram e o celular abrem sem recomprimir)');
    else erro(`imagem em ${s.codec} com cor ${s.pix}: o certo é h264 e yuv420p (rode juntar de novo; numa peça de fora ele recomprime)`);
    if (Math.abs(s.dur - S.DURATION) <= 0.1) ok(`duração do arquivo ${s.dur.toFixed(2)} s, igual à da linha do tempo (${S.DURATION.toFixed(2)} s)`);
    else erro(`duração do arquivo ${s.dur.toFixed(2)} s e da linha do tempo ${S.DURATION.toFixed(2)} s: o vídeo é de outra versão do texto`);
    const fontes = externo ? ['cenas.json', 'mapa-do-som.json'] : ['textos.js', 'score.js', 'index.html', 'mapa-do-som.json', ...fs.readdirSync(dir).filter((f) => /^film.*\.js$/.test(f))];
    const novo = fontes.map((f) => path.join(dir, f)).filter((f) => C.mtime(f) > C.mtime(arq));
    if (novo.length) aviso(`o vídeo é mais velho que ${novo.map((f) => path.basename(f)).join(', ')}: refaça o vídeo (ou o trecho) antes de entregar`);
    const v = C.volume(arq);
    if (v.I >= -17 && v.I <= -15) ok(`volume ${v.I.toFixed(1)} LUFS (entre -17 e -15, o de celular)`);
    else erro(`volume ${v.I.toFixed(1)} LUFS: tem de ficar entre -17 e -15`);
    if (v.pico <= -1.0) ok(`pico ${v.pico.toFixed(1)} dBFS (até -1)`);
    else erro(`pico ${v.pico.toFixed(1)} dBFS: acima de -1 o som estoura depois do envio`);
    const tam = s.tam / 1e6;
    if (tam > DRIVE_MB) aviso(`arquivo de ${tam.toFixed(1)} MB: acima de ${DRIVE_MB} MB não sobe pelo conector do Drive (uns 3 MB por envio); ele publica à mão ou sobe por link`);
    else ok(`arquivo de ${tam.toFixed(1)} MB (sobe pelo conector do Drive)`);
    // o ritmo: a medida de pacing do animation-studio (o primeiro segundo, os cortes, o texto no começo)
    const dc = cortesDeclarados(S);
    if (dc.erro) erro(dc.erro);
    const declarados = dc.cortes && dc.cortes.length ? dc.cortes : null;
    let linhas = [], durImg = null;
    if (externo) {
      const P = require(path.join(C.pastaEngine(dir), 'tools', 'pacing.js'));
      const t1 = Math.min(...Object.values(S.linha || {}).map((it) => it.t0), Infinity);
      const rep = P.analyse({ path, OUT: out, SCORE: {}, FPS: S.FPS, FW: W, FH: H, execFileSync, FFMPEG: 'ffmpeg', file: arq, probedText: Number.isFinite(t1) ? t1 + 0.25 : undefined });
      linhas = rep.rows.map((r) => `${r.ok ? '✓' : '⚠'} ${r.text}`);
      fs.writeFileSync(path.join(out, 'pacing.svg'), rep.svg);
      durImg = rep.duration;
    } else linhas = C.render(dir, ['pacing', ...(rascunho ? ['--draft'] : [])], { quieto: true }).split('\n').filter((l) => /^[✓⚠]/.test(l));
    for (const l of linhas) {
      const tr = declarados && /longest stretch without a cut: (\S+)s from (\S+)s/.exec(l);
      if (!tr) { (l.startsWith('⚠') ? aviso : ok)(`ritmo: ${C.traduzRitmo(l.slice(2))}`); continue; }
      // com cortes declarados: o maior trecho sem corte conta os da imagem e os da peça
      const dur = durImg || C.contaQuadros(arq) / (S.FPS || 30); // a duração que a medida usou: quadros ÷ 30
      let med = null;
      try { med = cortesMedidos(fs.readFileSync(path.join(out, 'pacing.svg'), 'utf8'), dur); } catch (e) { med = null; }
      const r = med ? maiorTrecho(med.t0, med.cortes.concat(declarados), dur) : maiorTrecho(0, declarados, S.DURATION);
      const certo = (med ? dur : S.DURATION) < 20 || r.maior <= 12;
      (certo ? ok : aviso)(`ritmo: maior trecho sem corte: ${r.maior.toFixed(1)} s, a partir de ${r.em.toFixed(1)} s, contando os ${declarados.length} cortes que a peça declara (CORTES) (o certo: até 12 s); só pela imagem, ${tr[1]} s a partir de ${tr[2]} s${med ? '' : ' (o out/pacing.svg não deu para ler: contei só os declarados)'}`);
    }
    // as trocas de música do modo blocos têm de cair num corte (na imagem, ou num corte que a peça declara)
    const sb = path.join(out, 'som-blocos.json');
    if (fs.existsSync(sb)) { // só existe quando o último som foi feito no modo blocos
      const tol = 2 / (S.FPS || 30) + 1e-6; // até dois quadros de distância
      for (const b of JSON.parse(fs.readFileSync(sb, 'utf8')).blocos.slice(1)) {
        const m = mudanca(arq, b.t0);
        const perto = declarados ? declarados.find((c) => Math.abs(c - b.t0) <= tol) : undefined;
        if (m >= 12) ok(`troca de música em ${b.t0.toFixed(2)} s cai num corte (${m.toFixed(0)}% da imagem muda ali)`);
        else if (perto !== undefined) ok(`troca de música em ${b.t0.toFixed(2)} s cai num corte que a peça declara (CORTES, ${perto.toFixed(2)} s); ali a imagem muda ${m.toFixed(0)}% de uma vez (a câmera anda, não salta)`);
        else aviso(`troca de música em ${b.t0.toFixed(2)} s: a imagem só muda ${m.toFixed(0)}% ali, não parece corte${declarados ? ' e não há corte declarado (CORTES) a até dois quadros' : ''}`);
      }
    }
  }
  console.log(erros ? `CONFERÊNCIA: ${erros} erro(s) e ${avisos} aviso(s). Erro trava a entrega; aviso é para olhar.` : `CONFERÊNCIA: nenhum erro${avisos ? `, ${avisos} aviso(s) para olhar` : ', nada a olhar'}.`);
  process.exitCode = erros ? 1 : 0;
}

module.exports = { comando, PALETA, mudanca, quadroDoVideo, cortesDeclarados, cortesMedidos, maiorTrecho };
