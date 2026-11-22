const $ = (id) => document.getElementById(id);
const AI_URLS = {
  claude: 'https://claude.ai/new',
  chatgpt: 'https://chatgpt.com/',
  gemini: 'https://gemini.google.com/app'
};
const AI_STUDIO_URL = 'https://aistudio.google.com/generate-speech';

let stylesMeta = [];
let projects = [];
let project = null;
let currentStep = 'setup';
let sceneMode = 'batch';
let batchSize = 2;
let saveTokens = true;
let activeRenderId = null;
let renderSource = null;
let toastTimer = null;
let waveformUrl = '';
let waveformPeaks = [];
let syncDragIdx = -1;
let auditionEndSec = null;
let tapSyncActive = false;
let tapSyncIndex = 0;
let tapSyncMarks = [];
let syncRaf = 0;

function toast(msg) {
  const n = $('toast');
  n.textContent = msg;
  n.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { n.hidden = true; }, 5500);
}

async function api(path, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: opts.body instanceof ArrayBuffer || opts.body instanceof Uint8Array
      ? opts.headers
      : { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Error(data.error || `HTTP ${res.status}`);
  return data;
}

function safe(fn) {
  return async (...args) => {
    try { await fn(...args); }
    catch (err) { toast(err.message || 'Terjadi kesalahan.'); }
  };
}

function setStep(step) {
  currentStep = step;
  for (const s of ['setup', 'script', 'scenes', 'render']) {
    $(`step-${s}`).hidden = s !== step;
  }
  document.querySelectorAll('[data-step]').forEach((b) => {
    const active = b.dataset.step === step;
    b.classList.toggle('active', active);
    b.setAttribute('aria-current', active ? 'step' : 'false');
  });
  if (step === 'script') renderAudioSyncPanel();
  if (step === 'scenes') renderScenesView();
  if (step === 'render') renderSummary();
}

function renderProjectSelect() {
  const sel = $('project-select');
  sel.replaceChildren();
  for (const p of projects) {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    sel.append(opt);
  }
  if (project) sel.value = project.id;
}

let styleFilterQuery = '';
let styleFilterCat = 'all';

function populateStyleCategories() {
  const sel = $('style-category');
  if (!sel) return;
  const cats = [...new Set(stylesMeta.map((s) => s.category || 'Lainnya'))];
  sel.replaceChildren();
  const allOpt = document.createElement('option');
  allOpt.value = 'all';
  allOpt.textContent = `Semua kategori (${stylesMeta.length})`;
  sel.append(allOpt);
  for (const c of cats) {
    const count = stylesMeta.filter((s) => (s.category || 'Lainnya') === c).length;
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = `${c} (${count})`;
    sel.append(opt);
  }
  sel.value = styleFilterCat;
}

function renderStyleGallery() {
  const root = $('style-gallery');
  root.replaceChildren();
  const activeStyle = stylesMeta.find((s) => s.id === project?.style) || stylesMeta[0];
  $('active-style-pill').textContent = activeStyle?.name || 'Kolase Kertas';

  const q = styleFilterQuery.trim().toLowerCase();
  const filtered = stylesMeta.filter((st) => {
    const catOk = styleFilterCat === 'all' || (st.category || 'Lainnya') === styleFilterCat;
    if (!catOk) return false;
    if (!q) return true;
    return `${st.name} ${st.desc} ${st.category || ''} ${st.id}`.toLowerCase().includes(q);
  });

  const countEl = $('style-count');
  if (countEl) {
    countEl.textContent = `Menampilkan ${filtered.length} dari ${stylesMeta.length} gaya visual.`;
  }

  if (!filtered.length) {
    root.innerHTML = '<div class="empty-box" style="grid-column:1/-1">Tidak ada gaya yang cocok dengan pencarian Anda.</div>';
    return;
  }

  for (const st of filtered) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'style-card' + (st.id === project?.style ? ' selected' : '');
    btn.setAttribute('aria-pressed', String(st.id === project?.style));
    const img = document.createElement('img');
    img.src = `/${st.thumb}`;
    img.alt = st.name;
    img.loading = 'lazy';
    const body = document.createElement('div');
    body.className = 'style-card-body';
    if (st.category) {
      const cat = document.createElement('small');
      cat.className = 'style-card-cat';
      cat.textContent = st.category;
      body.append(cat);
    }
    const title = document.createElement('strong');
    title.textContent = st.name;
    const desc = document.createElement('span');
    desc.textContent = st.desc;
    body.append(title, desc);
    btn.append(img, body);
    btn.onclick = safe(async () => {
      project.style = st.id;
      project.accent = st.accent;
      await persistProject();
      renderStyleGallery();
      toast(`Gaya diubah ke ${st.name}.`);
    });
    root.append(btn);
  }
}

function updateScriptStats() {
  const words = ($('script-input').value || '').trim().split(/\s+/).filter(Boolean).length;
  const est = Math.round(words / 2.4);
  $('script-stats').textContent = `${words} kata · ~${est} dtk`;
}

function renderAudioPanels() {
  const vo = project?.voiceover;
  $('vo-info').textContent = vo
    ? `Terpasang: ${vo.originalName || vo.filename} (${vo.durationSec} dtk · ${(vo.pauses || []).length} jeda bicara terdeteksi)`
    : 'Belum ada voice-over terpasang.';
  const player = $('vo-player');
  if (vo?.filename) {
    player.src = `/audio/${encodeURIComponent(vo.filename)}?t=${project.updatedAt}`;
    player.hidden = false;
    $('remove-vo').hidden = false;
  } else {
    player.pause();
    player.removeAttribute('src');
    player.hidden = true;
    $('remove-vo').hidden = true;
  }

  const bgm = project?.bgm;
  $('bgm-info').textContent = bgm
    ? `Terpasang: ${bgm.originalName || bgm.filename} (${bgm.durationSec} dtk · auto-ducking aktif)`
    : 'Belum ada musik latar.';
  $('remove-bgm').hidden = !bgm;
  const vol = Number(bgm?.volume ?? 0.25);
  $('bgm-volume').value = String(vol);
  $('bgm-vol-label').textContent = `${Math.round(vol * 100)}%`;
  renderAudioSyncPanel();
}

function fmtTime(sec) {
  const s = Math.max(0, Number(sec) || 0);
  const m = Math.floor(s / 60);
  const r = (s % 60).toFixed(2).padStart(5, '0');
  return `${String(m).padStart(2, '0')}:${r}`;
}

function getSceneRanges() {
  const ranges = [];
  let cursor = 0;
  for (const sc of project?.scenes || []) {
    const dur = Math.max(0.8, Number(sc.durationSec) || 4);
    ranges.push({ scene: sc, startSec: cursor, endSec: cursor + dur, durationSec: dur });
    cursor += dur;
  }
  return ranges;
}

function applyBoundariesToScenes(boundaries) {
  const scenes = project?.scenes || [];
  if (!scenes.length || boundaries.length !== scenes.length + 1) return;
  for (let i = 0; i < scenes.length; i++) {
    scenes[i].durationSec = Math.max(0.8, Number((boundaries[i + 1] - boundaries[i]).toFixed(2)));
  }
}

async function ensureWaveformPeaks(url) {
  if (!url) { waveformUrl = ''; waveformPeaks = []; return; }
  if (waveformUrl === url && waveformPeaks.length) return;
  waveformUrl = url;
  waveformPeaks = [];
  try {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const audioBuf = await ctx.decodeAudioData(buf.slice(0));
    const data = audioBuf.getChannelData(0);
    const bars = 260;
    const step = Math.max(1, Math.floor(data.length / bars));
    const peaks = new Array(bars);
    for (let i = 0; i < bars; i++) {
      let max = 0;
      const start = i * step;
      const end = Math.min(data.length, start + step);
      for (let j = start; j < end; j++) {
        const v = Math.abs(data[j]);
        if (v > max) max = v;
      }
      peaks[i] = max;
    }
    waveformPeaks = peaks;
    try { await ctx.close(); } catch {}
    drawSyncWaveform();
  } catch {
    waveformPeaks = [];
  }
}

function drawSyncWaveform() {
  const canvas = $('sync-waveform');
  if (!canvas || !project?.voiceover?.durationSec || !project?.scenes?.length) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(300, Math.round(rect.width || 720));
  const h = 136;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const totalSec = Math.max(1, Number(project.voiceover.durationSec) || 1);
  const ranges = getSceneRanges();
  const player = $('vo-player');
  const curSec = Number(player?.currentTime || 0);

  // Scene alternating background bands
  ranges.forEach((r, idx) => {
    const x1 = Math.max(0, Math.min(w, (r.startSec / totalSec) * w));
    const x2 = Math.max(0, Math.min(w, (r.endSec / totalSec) * w));
    const isPlayingHere = curSec >= r.startSec && curSec < r.endSec;
    ctx.fillStyle = isPlayingHere
      ? 'rgba(201, 79, 43, 0.16)'
      : (idx % 2 === 0 ? 'rgba(38, 53, 93, 0.05)' : 'rgba(42, 157, 143, 0.06)');
    ctx.fillRect(x1, 0, Math.max(1, x2 - x1), h);
    ctx.fillStyle = '#5c5042';
    ctx.font = '600 11px system-ui, sans-serif';
    if (x2 - x1 > 26) ctx.fillText(`S${r.scene.number}`, x1 + 6, 16);
  });

  // Waveform bars
  const mid = h * 0.56;
  const maxAmp = h * 0.36;
  if (waveformPeaks.length) {
    const barW = w / waveformPeaks.length;
    ctx.fillStyle = '#7c7163';
    for (let i = 0; i < waveformPeaks.length; i++) {
      const amp = Math.max(2, waveformPeaks[i] * maxAmp);
      ctx.fillRect(i * barW, mid - amp, Math.max(1.5, barW - 1), amp * 2);
    }
  } else {
    ctx.strokeStyle = '#c8bfb2';
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(w, mid);
    ctx.stroke();
  }

  // Draggable scene boundary lines
  for (let i = 0; i < ranges.length - 1; i++) {
    const x = Math.max(2, Math.min(w - 2, (ranges[i].endSec / totalSec) * w));
    ctx.strokeStyle = syncDragIdx === i ? '#1f1c18' : '#c94f2b';
    ctx.lineWidth = syncDragIdx === i ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();

    ctx.fillStyle = syncDragIdx === i ? '#1f1c18' : '#c94f2b';
    ctx.beginPath();
    ctx.arc(x, h - 10, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Playhead line
  const px = Math.max(0, Math.min(w, (curSec / totalSec) * w));
  ctx.strokeStyle = '#1f1c18';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px, 0);
  ctx.lineTo(px, h);
  ctx.stroke();

  $('sync-playhead-label').textContent = `Playhead: ${fmtTime(curSec)} / ${fmtTime(totalSec)}`;
}

function renderAudioSyncPanel() {
  const panel = $('audio-sync-panel');
  if (!panel) return;
  const vo = project?.voiceover;
  const scenes = project?.scenes || [];
  if (!vo?.filename || !scenes.length) {
    panel.hidden = true;
    return;
  }
  panel.hidden = false;

  const ranges = getSceneRanges();
  const totalVideo = ranges.length ? ranges[ranges.length - 1].endSec : 0;
  const diff = Math.abs(totalVideo - vo.durationSec);
  const pill = $('sync-diff-pill');
  pill.textContent = diff <= 0.15
    ? `Sinkron (Video ${totalVideo.toFixed(2)} dtk · Audio ${vo.durationSec} dtk)`
    : `Selisih ${diff.toFixed(2)} dtk (Video ${totalVideo.toFixed(2)} vs Audio ${vo.durationSec} dtk)`;
  pill.className = 'pill' + (diff <= 0.15 ? ' ok' : '');

  const offsetMs = Number(project.voiceoverOffsetMs || 0);
  $('vo-offset-range').value = String(offsetMs);
  $('vo-offset-label').textContent = `${offsetMs > 0 ? '+' : ''}${offsetMs} ms`;

  const list = $('sync-scene-list');
  list.replaceChildren();
  const player = $('vo-player');
  const curSec = Number(player?.currentTime || 0);

  ranges.forEach((r, idx) => {
    const row = document.createElement('div');
    row.className = 'sync-scene-row' + (curSec >= r.startSec && curSec < r.endSec ? ' is-active' : '');

    const timeBox = document.createElement('div');
    timeBox.className = 'sync-scene-time';
    const title = document.createElement('strong');
    title.textContent = `${r.scene.componentName} (${r.durationSec.toFixed(2)} dtk)`;
    const span = document.createElement('span');
    span.textContent = `${fmtTime(r.startSec)} - ${fmtTime(r.endSec)}`;
    timeBox.append(title, span);

    const text = document.createElement('div');
    text.className = 'sync-scene-text';
    text.title = r.scene.narration || '';
    text.textContent = r.scene.narration || '(Tanpa narasi)';

    const actions = document.createElement('div');
    actions.className = 'sync-scene-actions';

    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.textContent = 'Putar scene';
    playBtn.onclick = () => {
      auditionEndSec = r.endSec;
      player.currentTime = r.startSec;
      player.play().catch(() => {});
      drawSyncWaveform();
    };
    actions.append(playBtn);

    if (idx < ranges.length - 1) {
      const setEndBtn = document.createElement('button');
      setEndBtn.type = 'button';
      setEndBtn.textContent = 'Set akhir = playhead';
      setEndBtn.onclick = safe(async () => {
        const t = Number(player.currentTime || 0);
        const minEnd = r.startSec + 0.8;
        const maxEnd = ranges[idx + 1].endSec - 0.8;
        if (t < minEnd || t > maxEnd) {
          throw Error(`Posisi playhead (${t.toFixed(2)} dtk) harus di antara ${minEnd.toFixed(2)} dan ${maxEnd.toFixed(2)} dtk.`);
        }
        const boundaries = [0, ...ranges.map((x) => x.endSec)];
        boundaries[idx + 1] = Number(t.toFixed(2));
        applyBoundariesToScenes(boundaries);
        await persistProject();
        renderAudioSyncPanel();
        toast(`Batas akhir ${r.scene.componentName} disetel ke ${fmtTime(t)}.`);
      });
      actions.append(setEndBtn);
    }

    row.append(timeBox, text, actions);
    list.append(row);
  });

  ensureWaveformPeaks(`/audio/${encodeURIComponent(vo.filename)}`);
  drawSyncWaveform();
}

function renderAll() {
  if (!project) return;
  renderProjectSelect();
  $('proj-name').value = project.name || '';
  $('proj-ratio').value = project.ratio || '9:16';
  $('proj-transition').value = String(project.transitionFrames ?? 12);
  $('proj-subtitles').checked = Boolean(project.showSubtitles ?? true);
  $('proj-idea').value = project.idea || '';
  $('script-input').value = project.script || '';
  updateScriptStats();
  renderStyleGallery();
  renderAudioPanels();
  renderScenesView();
  renderSummary();
}

async function persistProject() {
  $('save-state').textContent = 'Menyimpan…';
  const res = await api(`/api/projects/${encodeURIComponent(project.id)}`, {
    method: 'PUT',
    body: JSON.stringify(project)
  });
  project = res.project;
  const idx = projects.findIndex((x) => x.id === project.id);
  if (idx >= 0) projects[idx] = project;
  $('save-state').textContent = 'Tersimpan & sinkron ke Remotion';
}

function groupBatches(scenes, size) {
  const out = [];
  for (let i = 0; i < scenes.length; i += size) {
    const items = scenes.slice(i, i + size);
    out.push({
      batchNumber: out.length + 1,
      items,
      label: items.length === 1 ? `Scene ${items[0].number}` : `Scene ${items[0].number}-${items[items.length - 1].number}`
    });
  }
  return out;
}

function renderScenesView() {
  if (!project) return;
  const coded = project.scenes.filter((s) => s.hasCustomCode).length;
  $('scenes-progress').textContent = `${coded} / ${project.scenes.length} scene berkode AI`;
  $('batch-view').hidden = sceneMode !== 'batch';
  $('single-view').hidden = sceneMode !== 'single';

  if (!project.scenes.length) {
    const empty = '<div class="empty-box">Belum ada scene. Kembali ke <strong>Tahap 2 (Naskah &amp; Audio)</strong> lalu klik <strong>Bagi naskah ke scene</strong>.</div>';
    $('batch-view').innerHTML = empty;
    $('single-view').innerHTML = empty;
    return;
  }

  renderBatchCards();
  renderSingleSceneCards();
}

function renderBatchCards() {
  const root = $('batch-view');
  root.replaceChildren();
  const batches = groupBatches(project.scenes, batchSize);

  for (const batch of batches) {
    const card = document.createElement('article');
    card.className = 'batch-card';
    const isCont = saveTokens && batch.batchNumber > 1;
    const done = batch.items.filter((s) => s.hasCustomCode).length;

    const head = document.createElement('div');
    head.className = 'panel-head';
    const title = document.createElement('strong');
    title.textContent = `Batch ${batch.batchNumber} · ${batch.label}${isCont ? ' (lanjutan chat)' : ''}`;
    const pill = document.createElement('span');
    pill.className = 'pill' + (done === batch.items.length ? ' ok' : '');
    pill.textContent = `${done}/${batch.items.length} kode AI`;
    head.append(title, pill);

    const list = document.createElement('ul');
    list.className = 'batch-list';
    for (const sc of batch.items) {
      const li = document.createElement('li');
      li.textContent = `${sc.componentName}.tsx (${sc.durationSec} dtk): ${sc.narration}`;
      list.append(li);
    }

    const status = document.createElement('p');
    status.className = 'status-box';
    status.hidden = true;
    const setStatus = (msg, isErr = false) => {
      status.textContent = msg;
      status.hidden = !msg;
      status.classList.toggle('is-error', isErr);
    };

    const pasteWrap = document.createElement('div');
    pasteWrap.hidden = true;
    const pasteId = `batch-paste-${batch.batchNumber}`;
    const pasteLbl = document.createElement('label');
    pasteLbl.htmlFor = pasteId;
    pasteLbl.textContent = `Tempel kode TSX hasil AI (${batch.label})`;
    const pasteInput = document.createElement('textarea');
    pasteInput.id = pasteId;
    pasteInput.className = 'code-area';
    pasteInput.placeholder = `// ===== ${batch.items[0].componentName}.tsx =====\nimport React from 'react';\n...`;

    const pasteBtns = document.createElement('div');
    pasteBtns.className = 'button-row';
    const clipBtn = document.createElement('button');
    clipBtn.type = 'button';
    clipBtn.textContent = 'Tempel dari clipboard';
    clipBtn.onclick = safe(async () => {
      const txt = await navigator.clipboard.readText();
      if (!txt.trim()) { setStatus('Clipboard kosong.', true); return; }
      pasteInput.value = txt;
      setStatus('Kode ditempel. Klik Validasi & Simpan Batch.');
    });

    const applyBtn = document.createElement('button');
    applyBtn.type = 'button';
    applyBtn.className = 'primary';
    applyBtn.textContent = 'Validasi & Simpan Batch';
    applyBtn.onclick = safe(async () => {
      setStatus('Memvalidasi sintaks TSX…');
      const res = await api(`/api/projects/${encodeURIComponent(project.id)}/scenes/batch`, {
        method: 'POST',
        body: JSON.stringify({
          expectedNumbers: batch.items.map((x) => x.number),
          code: pasteInput.value
        })
      });
      project = res.project;
      const msg = `Berhasil divalidasi & disimpan: ${res.saved.join(', ')}.${res.missing?.length ? ` Belum ditemukan: Scene ${res.missing.join(', ')}.` : ''}`;
      toast(msg);
      renderScenesView();
    });

    pasteBtns.append(clipBtn, applyBtn);
    pasteWrap.append(pasteLbl, pasteInput, pasteBtns);

    const details = document.createElement('details');
    details.className = 'details-box';
    const sum = document.createElement('summary');
    sum.textContent = `Lihat prompt ${batch.label}`;
    const preview = document.createElement('textarea');
    preview.className = 'code-area';
    preview.readOnly = true;
    preview.rows = 6;
    details.append(sum, preview);

    const fetchPrompt = async () => {
      const res = await api(`/api/projects/${encodeURIComponent(project.id)}/prompt/batch`, {
        method: 'POST',
        body: JSON.stringify({
          sceneNumbers: batch.items.map((x) => x.number),
          batchNumber: batch.batchNumber,
          continuation: isCont
        })
      });
      preview.value = res.prompt;
      return res;
    };
    details.addEventListener('toggle', () => { if (details.open) fetchPrompt().catch(() => {}); });

    const actions = document.createElement('div');
    actions.className = 'button-row';
    for (const [id, label] of [['claude', 'Claude'], ['chatgpt', 'ChatGPT'], ['gemini', 'Gemini']]) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.onclick = safe(async () => {
        const res = await fetchPrompt();
        let copied = true;
        try { await navigator.clipboard.writeText(res.prompt); } catch { copied = false; }
        window.open(AI_URLS[id], '_blank', 'noopener');
        pasteWrap.hidden = false;
        setStatus(copied
          ? `Prompt ${batch.label} (~${res.tokens} token) disalin & ${label} dibuka.${isCont ? ' Tempel di chat yang sama dengan Batch 1.' : ''}`
          : `Tab ${label} dibuka. Salin prompt dari pratinjau di bawah.`, !copied);
        if (!copied) details.open = true;
        pasteInput.focus();
      });
      actions.append(b);
    }

    const copyOnly = document.createElement('button');
    copyOnly.type = 'button';
    copyOnly.textContent = 'Salin prompt';
    copyOnly.onclick = safe(async () => {
      const res = await fetchPrompt();
      await navigator.clipboard.writeText(res.prompt);
      setStatus(`Prompt ${batch.label} (~${res.tokens} token) disalin ke clipboard.`);
      toast(`Prompt ${batch.label} disalin (~${res.tokens} token).`);
    });

    const togglePaste = document.createElement('button');
    togglePaste.type = 'button';
    togglePaste.textContent = 'Tempel hasil batch';
    togglePaste.onclick = () => { pasteWrap.hidden = !pasteWrap.hidden; if (!pasteWrap.hidden) pasteInput.focus(); };

    actions.append(copyOnly, togglePaste);
    card.append(head, list, actions, status, pasteWrap, details);
    root.append(card);
  }
}

function renderSingleSceneCards() {
  const root = $('single-view');
  root.replaceChildren();

  for (const sc of project.scenes) {
    const card = document.createElement('article');
    card.className = 'scene-card';

    const head = document.createElement('div');
    head.className = 'panel-head';
    const title = document.createElement('strong');
    title.textContent = `${sc.componentName}.tsx · ${sc.durationSec} detik`;
    const pill = document.createElement('span');
    pill.className = 'pill' + (sc.hasCustomCode ? ' ok' : '');
    pill.textContent = sc.hasCustomCode ? 'Kode AI tersimpan' : 'Placeholder default';
    head.append(title, pill);

    const row = document.createElement('div');
    row.className = 'row-two';
    const narWrap = document.createElement('div');
    const narLbl = document.createElement('label'); narLbl.textContent = 'Narasi / Subtitle';
    const narIn = document.createElement('textarea'); narIn.rows = 2; narIn.value = sc.narration || '';
    narIn.onchange = safe(async () => { sc.narration = narIn.value; await persistProject(); });
    narWrap.append(narLbl, narIn);

    const visWrap = document.createElement('div');
    const visLbl = document.createElement('label'); visLbl.textContent = 'Deskripsi Visual (untuk prompt AI)';
    const visIn = document.createElement('textarea'); visIn.rows = 2; visIn.value = sc.visual || '';
    visIn.onchange = safe(async () => { sc.visual = visIn.value; await persistProject(); });
    visWrap.append(visLbl, visIn);
    row.append(narWrap, visWrap);

    const metaRow = document.createElement('div');
    metaRow.className = 'row-two';
    const durWrap = document.createElement('div');
    const durLbl = document.createElement('label'); durLbl.textContent = 'Durasi (detik)';
    const durIn = document.createElement('input'); durIn.type = 'number'; durIn.step = '0.1'; durIn.min = '0.8'; durIn.max = '120'; durIn.value = String(sc.durationSec);
    durIn.onchange = safe(async () => { sc.durationSec = Math.max(0.8, Number(durIn.value) || 4); await persistProject(); title.textContent = `${sc.componentName}.tsx · ${sc.durationSec} detik`; });
    durWrap.append(durLbl, durIn);

    const darkWrap = document.createElement('label');
    darkWrap.className = 'check-row';
    const darkChk = document.createElement('input'); darkChk.type = 'checkbox'; darkChk.checked = !!sc.dark;
    darkChk.onchange = safe(async () => { sc.dark = darkChk.checked; await persistProject(); });
    const darkTxt = document.createElement('span'); darkTxt.textContent = 'Latar gelap (dusk) untuk scene ini';
    darkWrap.append(darkChk, darkTxt);
    metaRow.append(durWrap, darkWrap);

    const status = document.createElement('p');
    status.className = 'status-box';
    status.hidden = true;
    const setStatus = (msg, isErr = false) => { status.textContent = msg; status.hidden = !msg; status.classList.toggle('is-error', isErr); };

    const codeWrap = document.createElement('div');
    codeWrap.hidden = true;
    const codeLbl = document.createElement('label');
    codeLbl.textContent = `Kode TSX ${sc.componentName}.tsx`;
    const codeIn = document.createElement('textarea');
    codeIn.className = 'code-area';
    codeIn.rows = 8;

    const codeBtns = document.createElement('div');
    codeBtns.className = 'button-row';
    const pasteBtn = document.createElement('button');
    pasteBtn.type = 'button';
    pasteBtn.textContent = 'Tempel dari clipboard';
    pasteBtn.onclick = safe(async () => {
      const txt = await navigator.clipboard.readText();
      if (!txt.trim()) { setStatus('Clipboard kosong.', true); return; }
      codeIn.value = txt;
      setStatus('Kode ditempel. Klik Validasi & Simpan Scene.');
    });

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'primary';
    saveBtn.textContent = 'Validasi & Simpan Scene';
    saveBtn.onclick = safe(async () => {
      setStatus('Memvalidasi TSX…');
      const res = await api(`/api/projects/${encodeURIComponent(project.id)}/scenes/${sc.componentName}/code`, {
        method: 'PUT',
        body: JSON.stringify({ code: codeIn.value })
      });
      project = res.project;
      codeIn.value = res.code;
      setStatus(`${sc.componentName}.tsx valid & tersimpan.`);
      toast(`${sc.componentName}.tsx berhasil disimpan.`);
      renderScenesView();
    });

    const restoreBtn = document.createElement('button');
    restoreBtn.type = 'button';
    restoreBtn.textContent = 'Kembalikan versi sebelumnya';
    restoreBtn.onclick = safe(async () => {
      const res = await api(`/api/projects/${encodeURIComponent(project.id)}/scenes/${sc.componentName}/restore`, { method: 'POST' });
      codeIn.value = res.code;
      setStatus(`Versi sebelumnya ${sc.componentName}.tsx dipulihkan.`);
      toast(`${sc.componentName}.tsx dipulihkan.`);
    });

    codeBtns.append(pasteBtn, saveBtn, restoreBtn);
    codeWrap.append(codeLbl, codeIn, codeBtns);

    const actions = document.createElement('div');
    actions.className = 'button-row';
    const copyPromptBtn = document.createElement('button');
    copyPromptBtn.type = 'button';
    copyPromptBtn.textContent = 'Salin prompt scene ini';
    copyPromptBtn.onclick = safe(async () => {
      const res = await api(`/api/projects/${encodeURIComponent(project.id)}/prompt/scene`, {
        method: 'POST',
        body: JSON.stringify({ componentName: sc.componentName })
      });
      await navigator.clipboard.writeText(res.prompt);
      setStatus(`Prompt ${sc.componentName} (~${res.tokens} token) disalin ke clipboard.`);
      toast(`Prompt ${sc.componentName} disalin.`);
    });

    const openCodeBtn = document.createElement('button');
    openCodeBtn.type = 'button';
    openCodeBtn.textContent = 'Edit / Tempel kode TSX';
    openCodeBtn.onclick = safe(async () => {
      codeWrap.hidden = !codeWrap.hidden;
      if (!codeWrap.hidden && !codeIn.value) {
        const res = await api(`/api/projects/${encodeURIComponent(project.id)}/scenes/${sc.componentName}/code`);
        codeIn.value = res.code || '';
      }
    });

    actions.append(copyPromptBtn, openCodeBtn);
    card.append(head, row, metaRow, actions, status, codeWrap);
    root.append(card);
  }
}

function renderSummary() {
  if (!project) return;
  const totalSec = project.scenes.reduce((acc, s) => acc + (Number(s.durationSec) || 0), 0);
  const st = stylesMeta.find((s) => s.id === project.style);
  const items = [
    ['Format & Resolusi', project.ratio === '16:9' ? '16:9 (1920x1080 · 30fps)' : '9:16 (1080x1920 · 30fps)'],
    ['Gaya Visual', st?.name || project.style],
    ['Jumlah Scene', `${project.scenes.length} scene (${project.scenes.filter((s) => s.hasCustomCode).length} berkode AI)`],
    ['Total Durasi', `${totalSec.toFixed(1)} detik`],
    ['Voice-Over', project.voiceover ? `${project.voiceover.durationSec} dtk` : 'Tanpa suara'],
    ['Musik Latar', project.bgm ? `${project.bgm.originalName || project.bgm.filename}` : 'Tidak ada']
  ];
  const root = $('render-summary');
  root.replaceChildren();
  for (const [k, v] of items) {
    const box = document.createElement('div');
    box.className = 'summary-item';
    const l = document.createElement('span'); l.textContent = k;
    const val = document.createElement('strong'); val.textContent = v;
    box.append(l, val);
    root.append(box);
  }
}

async function uploadAudioFile(kind, file) {
  if (!file) return;
  const buf = await file.arrayBuffer();
  toast(`Mengunggah & menganalisis ${kind === 'voiceover' ? 'voice-over' : 'musik latar'}…`);
  const res = await api(`/api/projects/${encodeURIComponent(project.id)}/audio?kind=${kind}&name=${encodeURIComponent(file.name || `${kind}.wav`)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: buf
  });
  project = res.project;
  renderAll();
  toast(kind === 'voiceover'
    ? `Voice-over terpasang (${res.audio.durationSec} dtk)${res.synced ? ' & durasi scene otomatis disinkronkan!' : '.'}`
    : `Musik latar terpasang (${res.audio.durationSec} dtk).`);
}

async function downloadStyleRef() {
  const st = stylesMeta.find((s) => s.id === project?.style) || stylesMeta[0];
  if (!st) return;
  const a = document.createElement('a');
  a.href = `/${st.thumb}`;
  a.download = `referensi-gaya-${st.id}.${st.thumb.split('.').pop()}`;
  a.click();
  toast(`Gambar referensi gaya "${st.name}" diunduh. Lampirkan ke chat Claude bersama Batch 1.`);
}

// Event wiring
document.querySelectorAll('[data-step]').forEach((b) => b.onclick = () => setStep(b.dataset.step));
document.querySelectorAll('[data-goto]').forEach((b) => b.onclick = () => setStep(b.dataset.goto));

$('project-select').onchange = safe(async () => {
  const res = await api(`/api/projects/${encodeURIComponent($('project-select').value)}`);
  project = res.project;
  renderAll();
});

$('new-project').onclick = safe(async () => {
  const name = prompt('Nama proyek baru:', `Proyek ${projects.length + 1}`);
  if (!name) return;
  const res = await api('/api/projects', { method: 'POST', body: JSON.stringify({ name }) });
  project = res.project;
  projects.unshift(project);
  renderAll();
  setStep('setup');
  toast(`Proyek "${project.name}" dibuat.`);
});

$('save-setup').onclick = safe(async () => {
  project.name = $('proj-name').value.trim() || project.name;
  project.ratio = $('proj-ratio').value;
  project.transitionFrames = Number($('proj-transition').value) || 0;
  project.showSubtitles = $('proj-subtitles').checked;
  project.idea = $('proj-idea').value;
  await persistProject();
  renderProjectSelect();
  toast('Pengaturan proyek disimpan & disinkronkan ke Remotion.');
});

$('download-style-ref').onclick = safe(downloadStyleRef);
$('download-style-ref-scenes').onclick = safe(downloadStyleRef);

$('script-input').oninput = updateScriptStats;

$('save-script').onclick = safe(async () => {
  project.script = $('script-input').value;
  await persistProject();
  toast('Naskah tersimpan.');
});

$('split-script').onclick = safe(async () => {
  const res = await api(`/api/projects/${encodeURIComponent(project.id)}/split`, {
    method: 'POST',
    body: JSON.stringify({
      script: $('script-input').value,
      targetCount: Number($('target-scene-count').value) || 0
    })
  });
  project = res.project;
  renderAll();
  setStep('scenes');
  toast(`Naskah dibagi menjadi ${project.scenes.length} scene${res.syncedToAudio ? ' & disinkronkan ke audio!' : '.'}`);
});

document.querySelectorAll('[data-script-ai]').forEach((b) => {
  b.onclick = safe(async () => {
    const id = b.dataset.scriptAi;
    const idea = ($('proj-idea').value || project.idea || '').trim();
    if (!idea) throw Error('Isi Ide cerita terlebih dahulu di Tahap 1.');
    const res = await api(`/api/projects/${encodeURIComponent(project.id)}/prompt/script`, {
      method: 'POST',
      body: JSON.stringify({ idea, durationSec: 60 })
    });
    try { await navigator.clipboard.writeText(res.prompt); } catch {}
    window.open(AI_URLS[id], '_blank', 'noopener');
    $('script-ai-status').textContent = `Prompt naskah (~${res.tokens} token) disalin & ${b.textContent} dibuka. Tempel hasilnya ke kotak naskah di kiri.`;
    $('script-ai-status').hidden = false;
  });
});

$('copy-script-prompt').onclick = safe(async () => {
  const idea = ($('proj-idea').value || project.idea || '').trim();
  if (!idea) throw Error('Isi Ide cerita terlebih dahulu di Tahap 1.');
  const res = await api(`/api/projects/${encodeURIComponent(project.id)}/prompt/script`, {
    method: 'POST',
    body: JSON.stringify({ idea, durationSec: 60 })
  });
  await navigator.clipboard.writeText(res.prompt);
  toast(`Prompt naskah (~${res.tokens} token) disalin.`);
});

$('open-aistudio').onclick = safe(async () => {
  const txt = ($('script-input').value || '').trim();
  if (!txt) throw Error('Naskah masih kosong.');
  try { await navigator.clipboard.writeText(txt); } catch {}
  window.open(AI_STUDIO_URL, '_blank', 'noopener');
  toast('Naskah disalin & Google AI Studio Speech dibuka. Unduh audionya lalu tempel/seret ke kotak audio.');
});

$('sync-audio-btn').onclick = safe(async () => {
  const res = await api(`/api/projects/${encodeURIComponent(project.id)}/sync-audio`, { method: 'POST' });
  project = res.project;
  renderAll();
  toast(`Durasi ${project.scenes.length} scene disinkronkan ke voice-over (${res.pauses} jeda bicara).`);
});

$('sync-auto-inline').onclick = () => $('sync-audio-btn').click();
$('sync-save-btn').onclick = safe(async () => {
  await persistProject();
  renderAudioSyncPanel();
  toast('Timing suara & scene tersimpan dan tersinkron ke Remotion.');
});

$('vo-offset-range').oninput = () => {
  const ms = Number($('vo-offset-range').value) || 0;
  $('vo-offset-label').textContent = `${ms > 0 ? '+' : ''}${ms} ms`;
};
$('vo-offset-range').onchange = safe(async () => {
  project.voiceoverOffsetMs = Number($('vo-offset-range').value) || 0;
  await persistProject();
  toast(`Offset audio disimpan: ${project.voiceoverOffsetMs > 0 ? '+' : ''}${project.voiceoverOffsetMs} ms.`);
});
$('vo-offset-reset').onclick = safe(async () => {
  project.voiceoverOffsetMs = 0;
  $('vo-offset-range').value = '0';
  $('vo-offset-label').textContent = '0 ms';
  await persistProject();
  toast('Offset audio direset ke 0 ms.');
});

// Waveform drag boundaries & click-to-seek
const syncCanvas = $('sync-waveform');
function canvasEventToSec(ev) {
  const rect = syncCanvas.getBoundingClientRect();
  const totalSec = Math.max(1, Number(project?.voiceover?.durationSec) || 1);
  const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / Math.max(1, rect.width)));
  return ratio * totalSec;
}
syncCanvas.addEventListener('pointerdown', (ev) => {
  if (!project?.voiceover?.durationSec || !project?.scenes?.length) return;
  const rect = syncCanvas.getBoundingClientRect();
  const x = ev.clientX - rect.left;
  const totalSec = Math.max(1, Number(project.voiceover.durationSec) || 1);
  const ranges = getSceneRanges();
  let hit = -1;
  for (let i = 0; i < ranges.length - 1; i++) {
    const bx = (ranges[i].endSec / totalSec) * rect.width;
    if (Math.abs(x - bx) <= 10) { hit = i; break; }
  }
  if (hit >= 0) {
    syncDragIdx = hit;
    syncCanvas.setPointerCapture(ev.pointerId);
    drawSyncWaveform();
  } else {
    const sec = canvasEventToSec(ev);
    auditionEndSec = null;
    $('vo-player').currentTime = sec;
    drawSyncWaveform();
  }
});
syncCanvas.addEventListener('pointermove', (ev) => {
  if (syncDragIdx < 0 || !project?.voiceover?.durationSec) return;
  const ranges = getSceneRanges();
  const sec = canvasEventToSec(ev);
  const minEnd = ranges[syncDragIdx].startSec + 0.8;
  const maxEnd = ranges[syncDragIdx + 1].endSec - 0.8;
  const clamped = Math.max(minEnd, Math.min(maxEnd, sec));
  const boundaries = [0, ...ranges.map((x) => x.endSec)];
  boundaries[syncDragIdx + 1] = Number(clamped.toFixed(2));
  applyBoundariesToScenes(boundaries);
  drawSyncWaveform();
});
const finishSyncDrag = safe(async () => {
  if (syncDragIdx < 0) return;
  syncDragIdx = -1;
  await persistProject();
  renderAudioSyncPanel();
  toast('Batas scene diperbarui & disinkronkan ke Remotion.');
});
syncCanvas.addEventListener('pointerup', finishSyncDrag);
syncCanvas.addEventListener('pointercancel', finishSyncDrag);

// Playhead live animation & scene audition stop
const voPlayerEl = $('vo-player');
function tickSyncPlayhead() {
  if (auditionEndSec !== null && voPlayerEl.currentTime >= auditionEndSec) {
    voPlayerEl.pause();
    voPlayerEl.currentTime = auditionEndSec;
    auditionEndSec = null;
  }
  drawSyncWaveform();
  if (!voPlayerEl.paused && !voPlayerEl.ended) {
    syncRaf = requestAnimationFrame(tickSyncPlayhead);
  } else {
    syncRaf = 0;
  }
}
voPlayerEl.addEventListener('play', () => {
  if (!syncRaf) syncRaf = requestAnimationFrame(tickSyncPlayhead);
});
voPlayerEl.addEventListener('pause', () => { drawSyncWaveform(); });
voPlayerEl.addEventListener('seeked', () => { drawSyncWaveform(); });

// Tap-to-Sync live marking
function updateTapSyncUi() {
  const banner = $('tap-sync-banner');
  $('tap-sync-start').hidden = tapSyncActive;
  $('tap-sync-mark').hidden = !tapSyncActive;
  $('tap-sync-cancel').hidden = !tapSyncActive;
  banner.hidden = !tapSyncActive;
  if (!tapSyncActive) return;

  const scenes = project?.scenes || [];
  const cur = scenes[tapSyncIndex];
  const next = scenes[tapSyncIndex + 1];
  $('tap-sync-step').textContent = `Scene ${tapSyncIndex + 1} / ${scenes.length}`;
  $('tap-sync-current').textContent = cur ? `Sedang dibaca: "${cur.narration}"` : '';
  $('tap-sync-next').textContent = next
    ? `Tekan Spasi atau tombol Tandai tepat saat narator mulai membaca: "${next.narration}"`
    : 'Ini scene terakhir. Tunggu audio selesai atau klik tombol untuk menyelesaikan.';
  $('tap-sync-mark').textContent = next ? 'Tandai Scene Berikutnya (Spasi)' : 'Selesai & Simpan Sync (Spasi)';
}

function stopTapSync() {
  tapSyncActive = false;
  tapSyncIndex = 0;
  tapSyncMarks = [];
  updateTapSyncUi();
}

const markTapSyncPoint = safe(async () => {
  if (!tapSyncActive || !project?.voiceover?.durationSec) return;
  const scenes = project.scenes || [];
  const totalSec = Number(project.voiceover.durationSec);
  const nowSec = Number(voPlayerEl.currentTime || 0);

  if (tapSyncIndex < scenes.length - 1) {
    const prevMark = tapSyncMarks[tapSyncMarks.length - 1] ?? 0;
    const minNext = prevMark + 0.8;
    const maxNext = totalSec - (scenes.length - 1 - tapSyncIndex) * 0.8;
    const chosen = Math.max(minNext, Math.min(maxNext, nowSec));
    tapSyncMarks.push(Number(chosen.toFixed(2)));
    tapSyncIndex += 1;
    updateTapSyncUi();
    return;
  }

  // Finalize and save
  const boundaries = [0, ...tapSyncMarks, Number(totalSec.toFixed(2))];
  applyBoundariesToScenes(boundaries);
  voPlayerEl.pause();
  stopTapSync();
  await persistProject();
  renderAll();
  toast('Tap-to-Sync selesai! Durasi semua scene sudah sinkron dengan audio.');
});

$('tap-sync-start').onclick = () => {
  if (!project?.voiceover?.durationSec || !(project?.scenes?.length > 1)) {
    toast('Butuh voice-over dan minimal 2 scene untuk Tap-to-Sync.');
    return;
  }
  auditionEndSec = null;
  tapSyncActive = true;
  tapSyncIndex = 0;
  tapSyncMarks = [];
  updateTapSyncUi();
  voPlayerEl.currentTime = 0;
  voPlayerEl.play().catch(() => {});
};
$('tap-sync-mark').onclick = markTapSyncPoint;
$('tap-sync-cancel').onclick = () => {
  voPlayerEl.pause();
  stopTapSync();
  toast('Tap-to-Sync dibatalkan.');
};
window.addEventListener('keydown', (ev) => {
  if (!tapSyncActive || currentStep !== 'script') return;
  const tag = (ev.target?.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
  if (ev.code === 'Space') {
    ev.preventDefault();
    markTapSyncPoint();
  } else if (ev.code === 'Escape') {
    ev.preventDefault();
    voPlayerEl.pause();
    stopTapSync();
  }
});

const voDrop = $('vo-dropzone');
voDrop.onclick = () => $('vo-file').click();
voDrop.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('vo-file').click(); } };
voDrop.ondragover = (e) => { e.preventDefault(); voDrop.classList.add('dragover'); };
voDrop.ondragleave = () => voDrop.classList.remove('dragover');
voDrop.ondrop = safe(async (e) => { e.preventDefault(); voDrop.classList.remove('dragover'); await uploadAudioFile('voiceover', e.dataTransfer?.files?.[0]); });
voDrop.onpaste = safe(async (e) => {
  const file = [...(e.clipboardData?.items || [])].find((it) => it.kind === 'file')?.getAsFile() || e.clipboardData?.files?.[0];
  if (!file) { toast('Clipboard tidak berisi file audio.'); return; }
  e.preventDefault();
  await uploadAudioFile('voiceover', file);
});
$('vo-file').onchange = safe(async (e) => { const f = e.target.files[0]; e.target.value = ''; await uploadAudioFile('voiceover', f); });
$('remove-vo').onclick = safe(async () => { const res = await api(`/api/projects/${encodeURIComponent(project.id)}/audio?kind=voiceover`, { method: 'DELETE' }); project = res.project; renderAll(); toast('Voice-over dilepas.'); });

$('upload-bgm').onclick = () => $('bgm-file').click();
$('bgm-file').onchange = safe(async (e) => { const f = e.target.files[0]; e.target.value = ''; await uploadAudioFile('bgm', f); });
$('remove-bgm').onclick = safe(async () => { const res = await api(`/api/projects/${encodeURIComponent(project.id)}/audio?kind=bgm`, { method: 'DELETE' }); project = res.project; renderAll(); toast('Musik latar dilepas.'); });
$('bgm-volume').oninput = safe(async () => {
  const vol = Number($('bgm-volume').value) || 0.25;
  $('bgm-vol-label').textContent = `${Math.round(vol * 100)}%`;
  if (project.bgm) { project.bgm.volume = vol; await persistProject(); }
});

$('tab-batch').onclick = () => {
  sceneMode = 'batch';
  $('tab-batch').classList.add('active'); $('tab-batch').setAttribute('aria-selected', 'true');
  $('tab-single').classList.remove('active'); $('tab-single').setAttribute('aria-selected', 'false');
  renderScenesView();
};
$('tab-single').onclick = () => {
  sceneMode = 'single';
  $('tab-single').classList.add('active'); $('tab-single').setAttribute('aria-selected', 'true');
  $('tab-batch').classList.remove('active'); $('tab-batch').setAttribute('aria-selected', 'false');
  renderScenesView();
};
$('batch-size').onchange = () => { batchSize = Number($('batch-size').value) || 2; renderScenesView(); };
$('save-tokens').onchange = () => { saveTokens = $('save-tokens').checked; renderScenesView(); };

$('open-remotion-studio').onclick = safe(async () => {
  const res = await api('/api/studio/launch', { method: 'POST', body: JSON.stringify({ projectId: project.id }) });
  toast('Menjalankan Remotion Studio di jendela preview…');
  window.open(res.url, '_blank', 'noopener');
});

$('start-render').onclick = safe(async () => {
  $('render-error').hidden = true;
  $('render-result').hidden = true;
  $('render-progress-box').hidden = false;
  $('render-bar').value = 2;
  $('render-pct').textContent = '2%';
  $('render-phase').textContent = 'Memulai render Remotion…';
  $('start-render').disabled = true;

  const { jobId } = await api(`/api/projects/${encodeURIComponent(project.id)}/render`, { method: 'POST' });
  activeRenderId = jobId;
  renderSource?.close();
  renderSource = new EventSource(`/api/renders/${jobId}/events`);
  renderSource.onmessage = (e) => {
    const ev = JSON.parse(e.data);
    if (ev.progress !== undefined) {
      $('render-bar').value = ev.progress;
      $('render-pct').textContent = `${ev.progress}%`;
    }
    if (ev.phase) $('render-phase').textContent = ev.phase;
    if (ev.status === 'done') {
      renderSource.close(); activeRenderId = null; $('start-render').disabled = false;
      $('render-progress-box').hidden = true;
      $('render-result').hidden = false;
      $('download-mp4').href = ev.downloadUrl;
      const info = ev.videoInfo;
      $('render-meta').textContent = info
        ? `Durasi: ${info.durationSec.toFixed(2)} dtk · ${info.width}x${info.height} · ${info.videoCodec}${info.audioCodec ? ' + ' + info.audioCodec : ''} · ${(info.sizeBytes / 1048576).toFixed(2)} MB`
        : 'MP4 siap diunduh.';
      $('video-empty').hidden = true;
      $('rendered-video').src = ev.streamUrl;
      $('rendered-video').hidden = false;
      toast('Render MP4 selesai!');
    } else if (ev.status === 'failed' || ev.status === 'cancelled') {
      renderSource.close(); activeRenderId = null; $('start-render').disabled = false;
      $('render-progress-box').hidden = true;
      $('render-error').textContent = ev.error || 'Render dibatalkan.';
      $('render-error').hidden = false;
    }
  };
});

$('cancel-render').onclick = safe(async () => {
  if (!activeRenderId) return;
  await api(`/api/renders/${activeRenderId}`, { method: 'DELETE' });
  renderSource?.close();
  activeRenderId = null;
  $('start-render').disabled = false;
  $('render-progress-box').hidden = true;
  toast('Render dibatalkan.');
});

// Boot
(async () => {
  const [meta, list] = await Promise.all([api('/api/meta'), api('/api/projects')]);
  stylesMeta = meta.styles;
  populateStyleCategories();
  $('style-search').oninput = () => { styleFilterQuery = $('style-search').value; renderStyleGallery(); };
  $('style-category').onchange = () => { styleFilterCat = $('style-category').value; renderStyleGallery(); };
  projects = list.projects;
  project = projects[0];
  renderAll();
})().catch((e) => toast(`Gagal memuat studio: ${e.message}`));
