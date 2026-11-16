// PRESEME · motor do reel · o carrossel (16/11/2026, frente Q): o mesmo motor de desenho do reel (animation-studio, formato
// 4:5, 1080 × 1350) e o mesmo kit de estilos. Uma lâmina por marcador do score (SCORE.LAMINAS, que o score do modelo de
// carrossel já monta). Comandos: laminas, conferir, capa e entregar (o resto do motor que serve: novo --carrossel, textos,
// quadros, estilos, compara). Carrossel não tem som nem vídeo: som, rascunho, trecho, definitivo e juntar recusam.
'use strict';
const fs = require('fs');
const path = require('path');
const C = require('./comum');
const TXT = require('./textos');
const { PALETA } = require('./conferir');

const TOOL = () => path.join(C.FERR, 'preseme-carrossel.py');
const relogio = () => { const t0 = Date.now(); return () => `${((Date.now() - t0) / 1000).toFixed(0)} s`; };

function lerCarrossel(dir) {
  const S = C.lerScore(dir);
  if (!S.CARROSSEL || !Array.isArray(S.LAMINAS) || !S.LAMINAS.length) throw new Error('esta peça não é carrossel: o score.js não exporta CARROSSEL e LAMINAS (monte com: novo <pasta> --carrossel, ou --de um molde de carrossel)');
  return S;
}
const pngsDe = (dir, S) => S.LAMINAS.map((l) => path.join(dir, 'out', 'laminas', `${C.n2(l.n)}.png`));

// o texto alternativo de cada lâmina: alt.txt da peça, "[L01] texto" (o Instagram lê para quem não enxerga a imagem)
function lerAlt(dir) {
  const arq = path.join(dir, 'alt.txt');
  if (!fs.existsSync(arq)) return null;
  const A = {};
  for (const l of fs.readFileSync(arq, 'utf8').split(/\r?\n/)) { const m = /^\s*\[L(\d+)\]\s*(.*?)\s*$/.exec(l); if (m && m[2]) A[parseInt(m[1], 10)] = m[2]; }
  return A;
}

// laminas [--draft] [--estilo <nome>]: um PNG por lâmina (parado, no fim da entrada), a folha com todas e o JPEG de subir
function laminas(args) {
  const dir = C.pastaPeca(args, { soStudio: true });
  const S = lerCarrossel(dir);
  const fim = relogio();
  const draft = args.includes('--draft');
  const iE = args.indexOf('--estilo');
  const estilo = iE >= 0 ? args[iE + 1] : null;
  const pasta = path.join(dir, 'out', 'stills'), lam = path.join(dir, 'out', 'laminas');
  fs.rmSync(pasta, { recursive: true, force: true });
  fs.rmSync(lam, { recursive: true, force: true });
  fs.mkdirSync(lam, { recursive: true });
  const saida = C.render(dir, ['stills', ...S.LAMINAS.map((l) => l.t.toFixed(3)), ...(draft ? ['--draft'] : []), ...(estilo ? ['--style', estilo] : [])], { quieto: true });
  // o texto que não coube (a base do carrossel avisa no console do navegador): vai para out/naocabe.txt, que o conferir lê
  const naoCabe = [...new Set(saida.split('\n').filter((l) => l.includes('PRESEME-NAOCABE')).map((l) => l.replace(/^.*PRESEME-NAOCABE\s*/, '').trim()))].sort();
  fs.writeFileSync(path.join(dir, 'out', 'naocabe.txt'), naoCabe.join('\n') + (naoCabe.length ? '\n' : ''));
  const pngs = pngsDe(dir, S);
  S.LAMINAS.forEach((l, i) => {
    const f = path.join(pasta, `t_${Number(l.t.toFixed(3)).toFixed(2).padStart(6, '0')}.png`);
    if (!fs.existsSync(f)) throw new Error(`o motor de desenho não gravou a lâmina ${C.n2(l.n)} (${path.relative(dir, f)})`);
    fs.renameSync(f, pngs[i]);
  });
  const fo = C.roda('python3', ['-I', TOOL(), 'folha', path.join(dir, 'out', 'folha.jpg'), ...pngs], { quieto: true }).trim();
  const sub = path.join(dir, 'out', 'subir');
  fs.rmSync(sub, { recursive: true, force: true });
  if (!draft) C.roda('python3', ['-I', TOOL(), 'subir', sub, ...pngs], { quieto: true });
  const A = lerAlt(dir);
  if (A) fs.writeFileSync(path.join(dir, 'out', 'alt.txt'), S.LAMINAS.map((l) => `${C.n2(l.n)}. ${A[l.n] || '(falta o texto alternativo desta lâmina no alt.txt)'}`).join('\n') + '\n');
  console.log(`${S.LAMINAS.length} lâminas${draft ? ' em meia resolução (rascunho: sem JPEG de subir)' : ` em ${S.W} × ${S.H}`}${estilo ? `, estilo ${estilo}` : ''}: out/laminas/01.png a ${C.n2(S.LAMINAS.length)}.png, em ${fim()}`);
  console.log(fo.split('\n').pop());
  if (!draft) console.log(`JPEG de subir (qualidade 95): out/subir/01.jpg a ${C.n2(S.LAMINAS.length)}.jpg`);
  if (naoCabe.length) { console.log(`AVISO: ${naoCabe.length} texto(s) não couberam no espaço deles (a letra já está no mínimo do molde):`); for (const l of naoCabe) console.log('    ' + l); }
  console.log('Abra out/folha.jpg com Read e confira lâmina por lâmina. Depois: conferir.');
}

// conferir: o que se mede num carrossel, numa lista só (erro trava a entrega; aviso é para olhar)
function conferir(args) {
  const dir = C.pastaPeca(args, { soStudio: true });
  const peca = C.lerPeca(dir);
  const S = lerCarrossel(dir);
  const out = path.join(dir, 'out');
  fs.mkdirSync(out, { recursive: true });
  let erros = 0, avisos = 0;
  const ok = (m) => console.log(`✓ ${m}`);
  const aviso = (m) => { avisos++; console.log(`⚠ ${m}`); };
  const erro = (m) => { erros++; console.log(`✗ ${m}`); };

  // 1. texto em dia
  const txt = path.join(dir, 'textos.txt'), js = path.join(dir, 'textos.js');
  if (!fs.existsSync(txt)) erro('falta o textos.txt');
  else {
    for (const p of TXT.lerTxt(txt).problemas) (p.grave ? erro : aviso)(`textos.txt: ${p.msg}`);
    if (!fs.existsSync(js) || C.mtime(js) < C.mtime(txt)) erro('o textos.js é mais velho que o textos.txt: rode o comando textos antes');
    else ok('o textos.js saiu do textos.txt atual');
  }
  // 2. quantas lâminas, e o título inteiro na primeira
  const n = S.LAMINAS.length;
  if (n < 5 || n > 20) erro(`${n} lâminas: o carrossel tem de ter de 5 a 20 (o Instagram aceita até 20)`);
  else ok(`${n} lâminas (de 5 a 20)`);
  if (!(S.LAMINAS[0].linhas || []).includes(1)) erro('a frase [01], o título, não está na lâmina 1: o título vai inteiro na capa');
  else ok('o título [01] está na lâmina 1');
  const fantasmas = Object.keys(S.TX || {}).filter((k) => k[0] !== 'D' && !S.LAMINAS.some((l) => (l.linhas || []).includes(parseInt(k, 10))));
  if (fantasmas.length) aviso(`frases do textos.txt que nenhuma lâmina usa: ${fantasmas.map((k) => `[${C.n2(k)}]`).join(', ')}`);

  // 2b. o texto que não coube no espaço dele (medido pelo comando laminas)
  const nc = path.join(out, 'naocabe.txt');
  if (!fs.existsSync(nc)) aviso('sem out/naocabe.txt: rode laminas de novo para medir se cada texto coube');
  else {
    const ls = fs.readFileSync(nc, 'utf8').split('\n').filter(Boolean);
    if (ls.length) { erro(`${ls.length} texto(s) não couberam no espaço deles (encurte o texto ou mude o molde):`); for (const l of ls) console.log('    ' + l); }
    else ok('todo texto coube no espaço dele, sem passar da letra mínima do molde');
  }

  // 3. as lâminas existem e são do texto e do desenho atuais
  const pngs = pngsDe(dir, S);
  const faltam = pngs.filter((f) => !fs.existsSync(f));
  if (faltam.length) erro(`faltam ${faltam.length} lâmina(s) em out/laminas: rode laminas`);
  else {
    const fontes = ['textos.js', 'score.js', 'index.html', ...fs.readdirSync(dir).filter((f) => /^film.*\.js$/.test(f))].map((f) => path.join(dir, f));
    const velha = Math.min(...pngs.map(C.mtime));
    const novos = fontes.filter((f) => C.mtime(f) > velha);
    if (novos.length) erro(`as lâminas são mais velhas que ${novos.map((f) => path.basename(f)).join(', ')}: rode laminas de novo`);
    else ok('as lâminas saíram do texto e do desenho atuais');
  }

  // 4. o qa do animation-studio nos instantes das lâminas (área segura, letra pequena, sobreposição, contraste)
  const qa = C.render(dir, ['qa', ...S.LAMINAS.map((l) => l.t.toFixed(3))], { quieto: true, aceita: [0, 1] });
  const nqa = parseInt((qa.match(/(\d+) distinct problems/) || [])[1], 10);
  if (nqa === 0) ok(`qa: ${n} lâminas, 0 problemas (texto dentro da área segura, legível, sem encavalar, com contraste)`);
  else { erro(`qa: ${nqa} problema(s) no texto (marcados em out/qa.png):`); console.log(qa.split('\n').filter((l) => /safe|small|overlap|contrast/i.test(l)).slice(0, 14).map((l) => '    ' + l.trim()).join('\n')); }

  if (!faltam.length) {
    // 5. cores da paleta (e as da peça, no peca.json)
    const cfg = path.join(out, 'cores.json');
    fs.writeFileSync(cfg, JSON.stringify({ paleta: PALETA, extras: peca.cores || [] }));
    const cr = C.roda('python3', ['-I', path.join(C.FERR, 'preseme-cores.py'), cfg, ...pngs], { quieto: true });
    const foras = cr.split('\n').filter((l) => l.startsWith('AVISO cores'));
    if (foras.length) { aviso(`cores: ${foras.length} lâmina(s) com mancha fora da paleta (o que for de propósito vai no peca.json, em "cores"):`); for (const l of foras.slice(0, 10)) console.log('    ' + l.replace('AVISO cores  ', '')); }
    else ok(`cores: ${n} lâminas, nenhuma mancha fora da paleta`);
    // 6. o contador "1/8" do Instagram, em cima à direita
    const ct = C.roda('python3', ['-I', TOOL(), 'contador', ...pngs], { quieto: true }).trim().split('\n');
    const avc = ct.filter((l) => l.startsWith('AVISO'));
    if (avc.length) { aviso(`${avc.length} lâmina(s) com desenho forte embaixo do contador do Instagram:`); for (const l of avc) console.log('    ' + l.replace(/^AVISO /, '')); }
    else ok(ct.pop());
    // 7. a grade do perfil: o recorte 3:4 da capa, para olhar
    C.roda('python3', ['-I', TOOL(), 'grade', pngs[0], path.join(out, 'capa-grade.jpg')], { quieto: true });
    const mx = (S.SAFE || {}).x;
    if (mx >= 40) ok(`grade 3:4: a área segura começa a ${mx} px da borda, e a grade corta 34 px de cada lado (recorte da capa em out/capa-grade.jpg)`);
    else aviso(`a área segura começa a ${mx} px da borda: a grade 3:4 corta 34 px de cada lado (olhe out/capa-grade.jpg)`);
    // 8. o JPEG de subir
    const sub = path.join(out, 'subir');
    const jpgs = fs.existsSync(sub) ? fs.readdirSync(sub).filter((f) => f.endsWith('.jpg')) : [];
    if (jpgs.length !== n) erro(`out/subir tem ${jpgs.length} JPEG e o carrossel tem ${n} lâminas: rode laminas (sem --draft)`);
    else if (Math.min(...jpgs.map((f) => C.mtime(path.join(sub, f)))) < Math.max(...pngs.map(C.mtime)) - 2000) erro('os JPEG de out/subir são mais velhos que as lâminas: rode laminas (sem --draft)');
    else ok(`JPEG de subir: ${n} arquivos, qualidade 95`);
  }

  // 9. texto alternativo, um por lâmina
  const A = lerAlt(dir);
  if (!A) erro('falta o alt.txt (uma linha por lâmina, "[L01] o que a imagem mostra")');
  else {
    const semAlt = S.LAMINAS.filter((l) => !A[l.n]).map((l) => C.n2(l.n));
    if (semAlt.length) erro(`lâminas sem texto alternativo no alt.txt: ${semAlt.join(', ')}`);
    else ok(`texto alternativo nas ${n} lâminas`);
  }
  // 10. a legenda: até 2.200 caracteres e até 5 hashtags (ficha)
  const leg = path.join(dir, 'legenda.txt');
  if (!fs.existsSync(leg)) erro('falta a legenda.txt');
  else {
    const s = fs.readFileSync(leg, 'utf8').trim();
    const tags = (s.match(/(^|\s)#[\p{L}\p{N}_]+/gu) || []).length;
    if (s.length > 2200) erro(`legenda com ${s.length} caracteres: o Instagram corta em 2.200`);
    else if (tags > 5) erro(`legenda com ${tags} hashtags: o perfil usa até 5`);
    else ok(`legenda com ${s.length} caracteres e ${tags} hashtag(s)`);
    if (fs.existsSync(txt) && C.mtime(leg) < C.mtime(txt) - 5000) aviso('a legenda.txt é mais velha que o textos.txt: confira se ela ainda bate com o texto das lâminas');
  }
  console.log(erros ? `CONFERÊNCIA: ${erros} erro(s) e ${avisos} aviso(s). Erro trava a entrega; aviso é para olhar.` : `CONFERÊNCIA: nenhum erro${avisos ? `, ${avisos} aviso(s) para olhar` : ', nada a olhar'}.`);
  process.exitCode = erros ? 1 : 0;
}

// capa: no carrossel, a capa é a lâmina 1; sai também o recorte 3:4 da grade, para conferir
function capa(args) {
  const dir = C.pastaPeca(args, { soStudio: true });
  const peca = C.lerPeca(dir);
  const S = lerCarrossel(dir);
  const p1 = pngsDe(dir, S)[0];
  if (!fs.existsSync(p1)) throw new Error('falta out/laminas/01.png: rode laminas antes');
  const dest = path.join(dir, 'out', `capa-${peca.nome}.png`);
  fs.copyFileSync(p1, dest);
  console.log(C.roda('python3', ['-I', TOOL(), 'grade', p1, path.join(dir, 'out', 'capa-grade.jpg')], { quieto: true }).trim());
  console.log(`${path.relative(dir, dest)}: a lâmina 1. Abra out/capa-grade.jpg com Read e confira se o título aparece inteiro no recorte da grade.`);
}

// entregar [folha]: confere os arquivos e imprime a mensagem para ele
function entregar(args) {
  const dir = C.pastaPeca(args, { soStudio: true });
  const peca = C.lerPeca(dir);
  const S = lerCarrossel(dir);
  const tipo = C.posicionais(args)[0] || 'final';
  const out = path.join(dir, 'out');
  const txt = path.join(dir, 'textos.txt');
  const ver = fs.readdirSync(out).filter((f) => /^textos-enviado-\d+\.txt$/.test(f)).length + 1;
  if (fs.existsSync(txt)) fs.copyFileSync(txt, path.join(out, 'textos.txt'));
  const n = S.LAMINAS.length;
  let arquivos, msg;
  if (tipo === 'folha') {
    arquivos = [path.join(out, 'folha.jpg'), path.join(out, 'textos.txt')];
    msg = `Carrossel pronto para você conferir: as ${n} lâminas numa imagem só.\n\nO que você tem de fazer:\n1. Olhe a folha.\n2. Para trocar palavras, edite o textos.txt (só o que vem depois do número) e me mande. Linha apagada sai da lâmina.\n3. Se estiver tudo certo, responda "pode fechar".`;
  } else {
    fs.copyFileSync(path.join(dir, 'legenda.txt'), path.join(out, `legenda-${peca.nome}.txt`));
    const jpgs = S.LAMINAS.map((l) => path.join(out, 'subir', `${C.n2(l.n)}.jpg`));
    arquivos = [...jpgs, path.join(out, 'alt.txt'), path.join(out, `legenda-${peca.nome}.txt`), path.join(out, 'textos.txt')];
    msg = `Carrossel pronto para postar (${n} imagens).\n\nO que você tem de fazer:\n1. No Instagram, crie um post e escolha as imagens na ordem, de 01.jpg a ${C.n2(n)}.jpg.\n2. Antes de publicar, em Configurações avançadas, Escrever texto alternativo, cole em cada imagem a linha dela do alt.txt.\n3. Cole a legenda do legenda-${peca.nome}.txt e publique.`;
  }
  let falta = false;
  console.log('Arquivos (mandar com SendUserFile):');
  for (const f of arquivos) {
    if (!fs.existsSync(f)) { console.log(`  FALTA ${path.relative(dir, f)}`); falta = true; continue; }
    console.log(`  ${f}  (${C.mb(f).toFixed(2)} MB)`);
  }
  const base = arquivos[0];
  if (fs.existsSync(base)) {
    const fontes = ['textos.txt', 'textos.js', 'score.js', 'index.html', ...fs.readdirSync(dir).filter((f) => /^film.*\.js$/.test(f))].map((f) => path.join(dir, f)).filter((f) => fs.existsSync(f) && C.mtime(f) > C.mtime(base));
    if (fontes.length) { console.log(`ERRO: ${path.relative(dir, base)} é mais velho que ${fontes.map((f) => path.basename(f)).join(', ')}: rode laminas antes de mandar.`); falta = true; }
  }
  if (falta) { console.log('Não mande ainda: falta arquivo (veja acima).'); process.exitCode = 1; return; }
  fs.copyFileSync(path.join(out, 'textos.txt'), path.join(out, `textos-enviado-${ver}.txt`));
  console.log(`(cópia do textos mandado: out/textos-enviado-${ver}.txt, para o compara quando ele devolver)`);
  console.log('\nMensagem para ele:\n---\n' + msg + '\n---');
}

module.exports = { laminas, conferir, capa, entregar, lerCarrossel };
