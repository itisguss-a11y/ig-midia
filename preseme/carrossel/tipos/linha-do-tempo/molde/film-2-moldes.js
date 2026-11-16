// PRESEME · carrossel · tipo LINHA DO TEMPO · os moldes de lâmina, a linha e o kit (FIXO: não muda de peça para peça).
// A linha do tempo conta uma história em datas e responde a pergunta da capa. Cada lâmina do meio é um marco: o ano
// grande em cima da linha, o que aconteceu (título), o porquê (a nota com o fio), o desenho do assunto e, na faixa
// escura do pé, o que mudou. A linha corre na mesma altura em toda lâmina e sai pela borda: quem passa o dedo vê a
// linha continuar na lâmina seguinte, com os tracinhos dos anos do meio (passos), a cota entre duas datas próximas
// ("3 meses") e o salto (//) antes de hoje. A capa é onde a linha nasce, pendurada na etiqueta; a lâmina hoje é onde
// ela termina, com a resposta, a linha inteira em miniatura (um verbo por data) e a frase da prova na faixa.
// Um molde por tipo de lâmina: PRESEME.MOLDE[tipo] (capa, marco, hoje, texto). O desenho de cada lâmina é
// PRESEME.DESENHO[lam.desenho](ctx, caixa, lam, palavras). Pronto aqui: linhaInteira (a da lâmina hoje) e troque. Os
// desenhos do assunto ficam na peça (film-3-desenhos.js), que carrega depois e pode trocar qualquer um daqui. As peças
// que servem a qualquer história ficam em PRESEME.KIT: o documento (lei, portaria), o livro aberto com abas, o prédio
// com placa, a gente variada, a multidão e o calendário. Estilo padrão: carimbo e gravura. Desenho parado.
// Política fica de fora: data, lei e o que ela diz; nem partido, nem governo, nem presidente.
(function () {
  const E = globalThis.ESTILOS, P = globalThis.PRESEME, TX = globalThis.TEXTOS, DS = P.DESENHO, SC = globalThis.SCORE, G = globalThis.G;
  const { W, L, R, BOT } = P;
  const LW = R - L;
  const RAD = Math.PI / 180;
  const liso = { hachura: false, sombra: false };
  const decor = (fn) => G.decor(fn);
  const GT = E.GENTE, PL = E.PAL;
  // as frases da lâmina na ordem do score.js, com o lugar de quem foi apagada (a frase 2 apagada não vira a frase 3)
  const frases = (lam) => (lam.todas || lam.linhas).filter((k) => typeof k === 'number');

  // ---------- a linha do tempo, que continua de uma lâmina para a outra ----------
  // LY: a altura da linha (a mesma em toda lâmina); MX: onde fica o ponto da data em toda lâmina. Em x corrido, a lâmina
  // n ocupa de (n − 1)·W a n·W, e o ponto dela fica em (n − 1)·W + MX: a distância entre duas datas vizinhas é uma lâmina.
  const LY = 236, MX = L + 22, GROSSA = 9;
  P.LINHA = { LY, MX };
  function pontos() {
    const ps = [];
    SC.LAMINAS.forEach((l, i) => { if (l.tipo === 'capa' || l.tipo === 'marco' || l.tipo === 'hoje') ps.push({ i, x: i * W + MX, tipo: l.tipo, lam: l }); });
    return ps;
  }
  function linha(ctx, lam) {
    const ps = pontos(), ox = (lam.n - 1) * W;
    if (!ps.length) return;
    const ult = ps[ps.length - 1], x0 = ps[0].x, x1 = ult.tipo === 'hoje' ? ult.x : SC.LAMINAS.length * W + 60;
    // o salto (//) fica no meio do trecho que começa num marco com salto: true (o tempo longo que a linha pula)
    const saltos = [];
    for (let k = 0; k + 1 < ps.length; k++) if (ps[k].lam.salto) saltos.push(ps[k].x + (ps[k + 1].x - ps[k].x) * (ps[k].lam.selo ? 0.88 : 0.55)); // com selo no mesmo marco, o salto vai para a ponta, longe dele
    let a = Math.max(x0, ox - 40);
    const b = Math.min(x1, ox + W + 40), aqui = saltos.filter((g) => g > a - 30 && g < b + 30).sort((u, v) => u - v);
    for (const g of aqui) { if (g - 22 > a) E.linha(ctx, [[a - ox, LY], [g - 22 - ox, LY]], { lw: GROSSA, seed: 31 }); a = Math.max(a, g + 22); }
    if (b > a) E.linha(ctx, [[a - ox, LY], [b - ox, LY]], { lw: GROSSA, seed: 32 });
    for (const g of aqui) for (const d of [-13, 13]) E.linha(ctx, [[g - ox + d - 12, LY + 30], [g - ox + d + 12, LY - 30]], { lw: 6, seed: 36 + d });
    // os tracinhos dos anos do meio (passos: quantos) e a cota entre duas datas (cota: a palavra D com a distância)
    for (let k = 0; k + 1 < ps.length; k++) {
      const p = ps[k], q = ps[k + 1], n = p.lam.passos || 0;
      for (let j = 1; j <= n; j++) {
        const g = p.x + ((q.x - p.x) * j) / (n + 1) - ox;
        if (g > -30 && g < W + 30) E.linha(ctx, [[g, LY - 20], [g, LY + 20]], { lw: 5, seed: 40 + j });
      }
      if (p.lam.cota && TX[p.lam.cota] && q.x - ox > -60 && p.x - ox < W + 60) E.cota(ctx, [p.x - ox, LY + 42], [q.x - ox, LY + 42], TX[p.lam.cota], { size: 32, seed: 44 + k });
    }
    // os pontos: o anel onde a linha nasce (capa), o ponto cheio da data (marco) e o alvo de hoje
    for (const p of ps) {
      const x = p.x - ox;
      if (x < -50 || x > W + 50) continue;
      if (p.tipo === 'capa') E.circulo(ctx, x, LY, 17, Object.assign({ papel: 'superficie', lw: 6, seed: 47 }, liso)); // claro com contorno (no chapado, sem contorno, o claro é que aparece)
      else if (p.tipo === 'marco') E.circulo(ctx, x, LY, 21, Object.assign({ papel: 'tinta', seed: 48 }, liso));
      else { E.circulo(ctx, x, LY, 38, Object.assign({ papel: 'destaque', seed: 49 }, liso)); E.circulo(ctx, x, LY, 18, Object.assign({ papel: 'tinta', seed: 50 }, liso)); }
    }
  }
  // o ano grande em cima da linha (ano: a palavra D) e, do lado, o mês ou o dia (quando: a palavra D); devolve onde acaba
  function ano(ctx, lam) {
    const s = TX[lam.ano];
    if (!s) return L;
    const z = 136, base = LY - 34;
    E.texto(ctx, s, L, base, { papel: 'titulo', size: z });
    let fim = L + E.medir(ctx, s, { papel: 'titulo', size: z });
    const q = TX[lam.quando];
    if (q) { E.texto(ctx, q, fim + 24, base - 2, { papel: 'numero', size: 46 }); fim += 24 + E.medir(ctx, q, { papel: 'numero', size: 46 }); }
    return fim;
  }
  // o selo: o que aconteceu ao lado, na mesma data (selo: a palavra D), carimbado do lado do ano, sem fio até a linha
  // (um ponto mais adiante na linha leria como outra data). Fica longe do contador do Instagram
  function selo(ctx, lam, fim) {
    if (!lam.selo || !TX[lam.selo]) return;
    const s0 = TX[lam.selo].toUpperCase(), e = s0.split(' '), m = Math.ceil(e.length / 2);
    const ls = e.length > 1 ? [e.slice(0, m).join(' '), e.slice(m).join(' ')] : [s0];
    const w = Math.max(...ls.map((l) => E.medir(ctx, l, { papel: 'titulo', size: 30 }))) + 60;
    E.carimbo(ctx, TX[lam.selo], Math.min(W - 160 - w / 2, fim + 40 + w / 2), LY - 98, { size: 30, quebra: true, rot: -0.06, seed: 53 });
  }
  // a etiqueta da capa: o nome do tipo num quadro fino, pendurado no anel onde a linha nasce
  function etiqueta(ctx, k) {
    if (!TX[k]) return;
    const s = TX[k].toUpperCase(), z = 30, w = E.medir(ctx, s, { papel: 'numero', size: z }) + 44, hh = z + 30, y = LY - 132;
    E.ret(ctx, L, y, w, hh, { papel: null, r: 4, lw: 3, hachura: false, sombra: false, seed: 5 });
    E.linha(ctx, [[MX, y + hh], [MX, LY - 18]], { lw: 3, seed: 6 });
    E.texto(ctx, s, L + 22, y + hh / 2 + z * 0.36, { papel: 'numero', size: z });
  }
  // o porquê: nota de margem, com o fio Coral à esquerda (sem a frase, nada)
  function nota(ctx, k, cx, o = {}) {
    if (!TX[k]) return { y0: cx.y, y1: cx.y - 26 };
    const r = P.bloco(ctx, k, { x: cx.x + 34, y: cx.y, w: cx.w - 34, h: cx.h }, Object.assign({ sizes: [44, 42, 40, 38, 36], lh: 1.22 }, o));
    E.linha(ctx, [[cx.x + 6, r.y0 + 4], [cx.x + 6, r.y1 + 4]], { papel: 'alerta', lw: 6, seed: 9 });
    return r;
  }
  // a faixa escura do pé: o que mudou (marco) ou a frase da prova (hoje). rot: a palavra D do rótulo, em Marca-texto
  const ALTF = 164;
  function faixa(ctx, kRot, k, y0) {
    const y1 = BOT + 34, esc = E.escuro();
    plano(ctx, L - 26, y0, LW + 52, y1 - y0, esc ? 'noite' : 'floresta', 20); // lisa: é onde se lê a frase que importa
    let yt = y0 + 26;
    if (TX[kRot]) { E.texto(ctx, TX[kRot].toUpperCase(), L, y0 + 50, { papel: 'numero', size: 28, cor: 'marca' }); yt = y0 + 66; }
    P.bloco(ctx, k, { x: L, y: yt, w: LW, h: y1 - 20 - yt }, { sizes: [44, 42, 40, 38, 36], lh: 1.16, cor: 'papel', corTrecho: 'marca' });
  }
  function desenho(ctx, lam, cx, ...mais) {
    const f = lam.desenho && DS[lam.desenho];
    if (f && cx.w > 40 && cx.h > 40) f(ctx, cx, lam, ...mais);
  }

  // ---------- o kit: peças que servem a qualquer história em datas (PRESEME.KIT) ----------
  // o fundo liso de um texto (faixa, placa com letra): sem a falha de tinta do carimbo nem hachura, para a letra se ler
  function plano(ctx, x, y, w, h, papel, r = 12) {
    ctx.save(); ctx.fillStyle = E.cor(papel); ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); ctx.restore();
  }
  // a cor da letra que se lê em cima de um preenchimento (papel): clara no escuro; no claro, a do texto, ou Noite na lousa
  const corSobre = (papel) => (E.escura(E.cor(papel)) ? 'papel' : E.escuro() ? 'noite' : 'texto');
  // a letra que cabe: o maior tamanho (de z para baixo) em que o texto s cabe na largura w
  function cabe(ctx, s, w, z, papel = 'numero', min = 26) {
    while (z > min && E.medir(ctx, s, { papel, size: z }) > w) z -= 2;
    return z;
  }
  // o documento (lei, portaria, relatório): a folha, o título e as linhas de texto em traço. riscar: os números das
  // linhas (de 0) que levam o risco; rotulo: o nome do artigo, escrito na primeira riscada (o risco passa por cima). Devolve as alturas das linhas
  function documento(ctx, x, y, w, h, o = {}) {
    E.ret(ctx, x, y, w, h, { papel: 'superficie', r: 10, seed: o.seed || 60 });
    E.poligono(ctx, [[x + w - 46, y], [x + w, y + 46], [x + w - 46, y + 46]], Object.assign({ papel: 'apoio', seed: 61 }, liso));
    let y0 = y + 40;
    if (o.titulo) { const z = cabe(ctx, o.titulo, w - 110, o.tam || 52, 'titulo', 30); E.texto(ctx, o.titulo, x + 36, y0 + z * 0.95, { papel: 'titulo', size: z, cor: corSobre('superficie') }); y0 += z * 1.3 + 20; }
    const n = o.linhas || 6, passo = (y + h - 34 - y0) / n, ys = [], risca = o.riscar || [];
    for (let i = 0; i < n; i++) {
      const yy = y0 + passo * (i + 0.5), x1 = x + w - 40 - (i % 3 === 2 ? w * 0.22 : 0);
      ys.push(yy);
      if (o.rotulo && i === risca[0]) { // o artigo riscado: o nome dele escrito na linha, e o risco por cima
        const z = cabe(ctx, o.rotulo, w - 90, Math.min(40, passo * 0.9), 'numero');
        E.texto(ctx, o.rotulo, x + 36, yy + z * 0.4, { papel: 'numero', size: z, cor: corSobre('superficie') });
        const xr = x + 36 + E.medir(ctx, o.rotulo, { papel: 'numero', size: z });
        E.linha(ctx, [[x + 24, yy + 4], [xr + 14, yy - 4]], { lw: 7, papel: 'alerta', seed: 70 + i });
        continue;
      }
      E.linha(ctx, [[x + 36, yy], [x1, yy]], { lw: 7, papel: risca.includes(i) ? 'apoio' : 'tinta', seed: 62 + i });
      if (risca.includes(i)) E.linha(ctx, [[x + 26, yy + 6], [x1 + 10, yy - 6]], { lw: 7, papel: 'alerta', seed: 70 + i });
    }
    return ys;
  }
  // o livro aberto (a Constituição, um manual): a capa atrás, as duas páginas, a lombada e as abas que saem por cima
  // (abas: [{ texto, papel, lado: 'esq' | 'dir' }]). Devolve as caixas das duas páginas, para a peça desenhar dentro
  function livro(ctx, cx, cy, w, h, o = {}) {
    const x0 = cx - w / 2, y0 = cy - h / 2;
    const abas = o.abas || [];
    abas.forEach((a, i) => {
      const z = 30, tw = E.medir(ctx, a.texto, { papel: 'numero', size: z }) + 36, ax = a.lado === 'dir' ? cx + 40 + (i % 2) * 20 : x0 + 40 + (i % 2) * 20;
      E.ret(ctx, ax, y0 - 52, tw, 80, Object.assign({ papel: a.papel || 'destaque', r: 8, seed: 63 + i }, liso));
      E.texto(ctx, a.texto, ax + 18, y0 - 52 + 40 + z * 0.36, { papel: 'numero', size: z, cor: corSobre(a.papel || 'destaque') });
    });
    E.ret(ctx, x0 - 16, y0 + 12, w + 32, h + 6, { papel: o.capa || 'apoioEscuro', r: 12, seed: 64 });
    E.poligono(ctx, [[x0, y0 + 16], [cx - 6, y0], [cx - 6, y0 + h - 10], [x0, y0 + h]], { papel: 'superficie', seed: 65 });
    E.poligono(ctx, [[cx + 6, y0], [x0 + w, y0 + 16], [x0 + w, y0 + h], [cx + 6, y0 + h - 10]], { papel: 'superficie', seed: 66 });
    E.linha(ctx, [[cx, y0 + 2], [cx, y0 + h - 6]], { lw: 5, seed: 67 });
    return { esq: { x: x0 + 26, y: y0 + 34, w: w / 2 - 52, h: h - 60 }, dir: { x: cx + 26, y: y0 + 34, w: w / 2 - 52, h: h - 60 } };
  }
  // o prédio com placa (UBS, hospital, instituto): x é o centro, chao é a base. placa: o nome; porta: 'aberta' ou
  // 'fechada' (corPorta troca a cor dela); cruz: a cruz da saúde ao lado da placa. Devolve a porta { x, y, w, h }
  function predio(ctx, x, chao, w, h, o = {}) {
    const x0 = x - w / 2, y0 = chao - h;
    E.ret(ctx, x0, y0, w, h, { papel: o.parede || 'superficie', r: 6, seed: 80 });
    E.ret(ctx, x0 - 18, y0 - 26, w + 36, 38, Object.assign({ papel: o.telhado || 'apoioEscuro', r: 6, seed: 81 }, liso));
    if (o.placa) {
      const z = cabe(ctx, o.placa, w - 90, o.tamPlaca || 50, 'titulo', 28), pw = E.medir(ctx, o.placa, { papel: 'titulo', size: z }) + 40, ph = z * 1.16 + 26;
      const px = o.cruz ? x - (pw + ph + 12) / 2 : x - pw / 2;
      E.ret(ctx, px, y0 + 26, pw, ph, Object.assign({ papel: o.corPlaca || 'apoio', r: 8, seed: 82 }, liso));
      E.texto(ctx, o.placa, px + 20, y0 + 26 + ph / 2 + z * 0.42, { papel: 'titulo', size: z, cor: corSobre(o.corPlaca || 'apoio') });
      if (o.cruz) cruz(ctx, px + pw + 12 + ph / 2, y0 + 26 + ph / 2, ph * 0.42);
    }
    const pw = Math.min(w * 0.32, 130), ph = Math.min(h * 0.5, 200), px = x - pw / 2, py = chao - ph;
    if (o.janelas !== false) for (const sd of [-1, 1]) E.ret(ctx, x + sd * (pw / 2 + 24) + (sd < 0 ? -Math.min(90, w * 0.2) : 0), py + 10, Math.min(90, w * 0.2), Math.min(80, ph * 0.42), Object.assign({ papel: 'apoio', r: 4, seed: 83 + sd }, liso));
    E.ret(ctx, px, py, pw, ph, Object.assign({ papel: o.corPorta || (o.porta === 'fechada' ? 'apoioEscuro' : 'tinta'), r: 6, seed: 85 }, liso));
    if (o.porta !== 'fechada') E.poligono(ctx, [[px + pw, py], [px + pw + pw * 0.34, py + 16], [px + pw + pw * 0.34, chao - 8], [px + pw, chao]], { papel: 'apoio', seed: 86 });
    else E.circulo(ctx, px + pw - 22, py + ph * 0.55, 7, Object.assign({ papel: 'superficie', seed: 87 }, liso));
    return { x: px, y: py, w: pw, h: ph };
  }
  function cruz(ctx, x, y, r) {
    const t = r * 0.36;
    E.poligono(ctx, [[x - t, y - r], [x + t, y - r], [x + t, y - t], [x + r, y - t], [x + r, y + t], [x + t, y + t], [x + t, y + r], [x - t, y + r], [x - t, y + t], [x - r, y + t], [x - r, y - t], [x - t, y - t]], Object.assign({ papel: 'alerta', seed: 88 }, liso));
  }
  // gente variada: pele, cabelo e roupa nas cores do perfil (GENTE[i]); a 4 é a pessoa mais velha, de cabelo branco
  const GENTE = [
    { skin: GT.peleEscura, hair: GT.cabelo, hairStyle: 'short', outfit: 'shirt', shirt: PL.folha, trim: PL.salvia, collar: PL.salvia, bottoms: 'pants', shorts: PL.floresta, shoes: PL.noite, build: 'regular' },
    { skin: GT.peleClara, hair: GT.cabelo, hairStyle: 'bun', outfit: 'dress', shirt: PL.coral, trim: PL.papel, collar: PL.papel, bottoms: 'skirt', shorts: PL.coral, shoes: PL.floresta, build: 'regular' },
    { skin: GT.pele, hair: GT.cabelo, hairStyle: 'curly', outfit: 'tee', shirt: PL.marca, trim: PL.folha, collar: PL.folha, bottoms: 'pants', shorts: PL.folha, shoes: PL.noite, build: 'slim' },
    { skin: GT.peleEscura, hair: GT.cabelo, hairStyle: 'ponytail', outfit: 'tee', shirt: PL.salvia, trim: PL.folha, collar: PL.folha, bottoms: 'pants', shorts: PL.floresta, shoes: PL.noite, build: 'slim' },
    { skin: GT.peleClara, hair: PL.papel, hairStyle: 'short', facialHair: 'mustache', outfit: 'shirt', shirt: PL.floresta, trim: PL.salvia, collar: PL.papel, bottoms: 'pants', shorts: PL.folha, shoes: PL.noite, build: 'broad' },
  ];
  // uma pessoa de pé (ou sentada: pose 'sit'): x, chao, s; i escolhe a roupa da GENTE; style troca o que quiser
  function pessoa(ctx, x, chao, s, o = {}) {
    const i = o.i || 0, st = Object.assign({}, GENTE[i % GENTE.length], o.style || {});
    E.personagem(ctx, Object.assign({ quem: 'calouro', x, y: chao, s, pose: 'stand', look: 0, mouth: 'smile', seed: 300 + i * 7 }, o, { style: st }));
  }
  // a multidão: fileiras de cabeça e ombro, de trás para a frente, com pele e roupa variadas, dentro da caixa
  function multidao(ctx, cx, o = {}) {
    const fil = o.fileiras || 3, por = o.porFileira || 9, passo = cx.w / por;
    const r = Math.min(passo * 0.42, cx.h / (fil * 1.5 + 1.4));
    const peles = ['pele', 'peleClara', 'peleEscura'], roupas = o.roupas || ['folha', 'salvia', 'marca', 'coral', 'apoioEscuro', 'papel'];
    for (let f = 0; f < fil; f++) {
      const yb = cx.y + cx.h - (fil - 1 - f) * r * 1.5, n = por - (f % 2);
      for (let i = 0; i < n; i++) {
        const x = cx.x + passo * (i + 0.5 + (f % 2) * 0.5), k = f * 7 + i * 5;
        E.ret(ctx, x - r * 1.08, yb - r * 0.95, r * 2.16, r * 0.95 + 2, Object.assign({ papel: roupas[k % roupas.length], r: r * 0.55, seed: 90 + k }, liso));
        E.circulo(ctx, x, yb - r * 1.5, r * 0.72, Object.assign({ papel: peles[(f + i) % 3], seed: 91 + k }, liso));
        E.poligono(ctx, [[x - r * 0.74, yb - r * 1.58], [x - r * 0.6, yb - r * 2.08], [x - r * 0.2, yb - r * 2.28], [x + r * 0.2, yb - r * 2.28], [x + r * 0.6, yb - r * 2.08], [x + r * 0.74, yb - r * 1.58], [x, yb - r * 1.86]], Object.assign({ papel: (i + f) % 4 === 1 ? 'papel' : 'cabelo', contorno: false, seed: 92 + k }, liso));
      }
    }
  }
  // o calendário de parede: as argolas, a faixa de cima e o texto grande no meio (texto: "a cada 4 anos", "12 meses")
  function calendario(ctx, x, y, w, h, texto, o = {}) {
    E.ret(ctx, x, y, w, h, { papel: 'superficie', r: 10, seed: 95 });
    E.ret(ctx, x, y, w, h * 0.24, Object.assign({ papel: o.faixa || 'alerta', r: 10, seed: 96 }, liso));
    for (const f of [0.25, 0.75]) E.ret(ctx, x + w * f - 8, y - 18, 16, 40, Object.assign({ papel: 'tinta', r: 8, seed: 97 }, liso));
    if (texto) { const z = cabe(ctx, texto, w - 40, o.tam || 52, 'titulo', 26); E.texto(ctx, texto, x + w / 2, y + h * 0.62 + z * 0.36, { papel: 'titulo', size: z, align: 'center', cor: corSobre('superficie') }); }
  }
  P.KIT = { RAD, liso, decor, plano, corSobre, cabe, documento, livro, predio, cruz, GENTE, pessoa, multidao, calendario, LY, MX };

  // ---------- as cenas prontas do tipo ----------
  // a linha inteira em miniatura (lâmina hoje): um ponto por marco, a data e o verbo de cada marco (verbo e data: palavras D
  // no score.js; sem data, vale o ano), alternando em cima e embaixo, até o alvo de hoje. No fim da linha, a cena de hoje: DS.fimDaLinha, se a
  // peça desenhar uma (film-3-desenhos.js); sem ela, a linha vai até a borda.
  DS.linhaInteira = (ctx, cx, lam) => {
    const ms = SC.LAMINAS.filter((l) => l.tipo === 'marco'), fim = DS.fimDaLinha;
    const x0 = cx.x + 26, xh = cx.x + cx.w * (fim ? 0.7 : 0.94), y = cx.y + cx.h * 0.5;
    const passo = (xh - x0) / Math.max(1, ms.length), larg = passo * 1.9;
    // o rótulo de um ponto (o verbo grande e a data pequena), em cima ou embaixo da linha, centrado no ponto sem sair da caixa
    const rotulo = (x, vb, dt, cima) => {
      const zv = vb ? cabe(ctx, vb, larg, 46, 'titulo', 30) : 0, zd = dt ? cabe(ctx, dt, larg, 34, 'numero', 26) : 0;
      const w = Math.max(vb ? E.medir(ctx, vb, { papel: 'titulo', size: zv }) : 0, dt ? E.medir(ctx, dt, { papel: 'numero', size: zd }) : 0);
      const xc = Math.min(cx.x + cx.w - w / 2, Math.max(cx.x + w / 2, x));
      E.linha(ctx, [[x, y + (cima ? -20 : 20)], [x, y + (cima ? -42 : 42)]], { lw: 3, seed: 120 + Math.round(x) % 9 });
      if (cima) { if (dt) E.texto(ctx, dt, xc, y - 54, { papel: 'numero', size: zd, align: 'center' }); if (vb) E.texto(ctx, vb, xc, y - 54 - zd * 1.25 - 4, { papel: 'titulo', size: zv, align: 'center' }); }
      else { if (dt) E.texto(ctx, dt, xc, y + 54 + zd * 1.0, { papel: 'numero', size: zd, align: 'center' }); if (vb) E.texto(ctx, vb, xc, y + 54 + zd * 1.25 + zv * 1.1, { papel: 'titulo', size: zv, align: 'center' }); }
    };
    E.linha(ctx, [[x0, y], [xh, y]], { lw: 7, seed: 110 });
    ms.forEach((m, i) => {
      const x = x0 + i * passo;
      E.circulo(ctx, x, y, 15, Object.assign({ papel: 'tinta', seed: 111 + i }, liso));
      rotulo(x, TX[m.verbo] || '', TX[m.data] || TX[m.ano] || '', i % 2 === 0);
    });
    E.circulo(ctx, xh, y, 30, Object.assign({ papel: 'destaque', seed: 130 }, liso));
    E.circulo(ctx, xh, y, 14, Object.assign({ papel: 'tinta', seed: 131 }, liso));
    rotulo(xh, TX[lam.ano] || '', '', ms.length % 2 === 0);
    if (fim) fim(ctx, { x: xh + 46, y: cx.y, w: cx.x + cx.w - xh - 46, h: cx.h }, lam);
  };
  // troque: o lugar do desenho que a peça ainda não fez (aparece tracejado, com o aviso; nunca vai para o ar)
  DS.troque = (ctx, cx) => {
    E.ret(ctx, cx.x + 10, cx.y + 10, cx.w - 20, cx.h - 20, Object.assign({ papel: null, r: 24, lw: 4, seed: 700 }, liso));
    E.linha(ctx, [[cx.x + 40, cx.y + 40], [cx.x + cx.w - 40, cx.y + cx.h - 40]], { lw: 3, tracejado: true, seed: 701 });
    E.linha(ctx, [[cx.x + cx.w - 40, cx.y + 40], [cx.x + 40, cx.y + cx.h - 40]], { lw: 3, tracejado: true, seed: 702 });
    const aviso = cx.w >= 420 ? 'TROQUE · desenho da peça' : 'TROQUE', z = Math.min(34, (cx.w - 40) / (aviso.length * 0.62));
    decor(() => E.texto(ctx, aviso, cx.x + cx.w / 2, cx.y + cx.h / 2 + z * 0.36, { papel: 'numero', size: z, align: 'center' }));
  };

  // ---------- os moldes de lâmina ----------
  // capa: a linha nasce no anel, pendurada na etiqueta; a pergunta (título), a promessa e o desenho grande embaixo
  P.MOLDE.capa = (ctx, lam) => {
    E.fundo(ctx);
    linha(ctx, lam);
    etiqueta(ctx, lam.palavras[0]);
    const [t1, t2] = frases(lam);
    const a = P.titulo(ctx, t1, { x: L, y: LY + 60, w: LW, h: 390 }, { sizes: [104, 96, 90, 84, 78, 72, 66], lh: 1.06 });
    const b = P.bloco(ctx, t2, { x: L, y: a.y1 + 30, w: LW, h: 130 }, { sizes: [50, 46, 44, 40] });
    const yd = Math.max(b.y1 + 40, 740);
    desenho(ctx, lam, { x: L, y: yd, w: LW, h: BOT - yd }, lam.palavras.slice(1));
  };
  // marco: o ano (e o mês) em cima da linha, o selo do que aconteceu ao lado, o que aconteceu, o porquê, o desenho e,
  // na faixa escura, o que mudou (rotulo: a palavra D do rótulo da faixa)
  P.MOLDE.marco = (ctx, lam) => {
    E.fundo(ctx);
    linha(ctx, lam);
    selo(ctx, lam, ano(ctx, lam));
    const [f1, f2, f3] = frases(lam);
    const a = P.titulo(ctx, f1, { x: L, y: LY + 82, w: LW, h: 222 }, { sizes: [76, 72, 68, 64, 60, 56], lh: 1.06 });
    const b = nota(ctx, f2, { x: L, y: a.y1 + 26, w: LW, h: 120 });
    const yF = TX[f3] ? BOT - ALTF : BOT + 34, yd = b.y1 + 36;
    desenho(ctx, lam, { x: L, y: yd, w: LW, h: yF - 30 - yd }, lam.palavras);
    if (TX[f3]) faixa(ctx, lam.rotulo, f3, yF);
  };
  // hoje: a linha termina no alvo; a resposta da capa (título), o desenho (de saída, a linha inteira) e a frase da prova
  P.MOLDE.hoje = (ctx, lam) => {
    E.fundo(ctx);
    linha(ctx, lam);
    ano(ctx, lam);
    const [f1, f2] = frases(lam);
    const a = P.titulo(ctx, f1, { x: L, y: LY + 82, w: LW, h: 270 }, { sizes: [72, 68, 64, 60, 56, 52], lh: 1.06 });
    const yF = TX[f2] ? BOT - ALTF : BOT + 34, yd = a.y1 + 36;
    desenho(ctx, lam, { x: L, y: yd, w: LW, h: yF - 30 - yd }, lam.palavras);
    if (TX[f2]) faixa(ctx, lam.rotulo, f2, yF);
  };
  // texto: uma lâmina sem data no meio da história (a linha passa reto); a ideia, o detalhe e o desenho
  P.MOLDE.texto = (ctx, lam) => {
    E.fundo(ctx);
    linha(ctx, lam);
    const [f1, f2] = frases(lam);
    const a = P.titulo(ctx, f1, { x: L, y: LY + 82, w: LW, h: 300 }, { sizes: [76, 72, 68, 64, 60, 56], lh: 1.06 });
    const b = nota(ctx, f2, { x: L, y: a.y1 + 26, w: LW, h: 170 });
    desenho(ctx, lam, { x: L, y: b.y1 + 36, w: LW, h: BOT - b.y1 - 36 }, lam.palavras);
  };
})();
