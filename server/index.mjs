import http from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, createReadStream } from 'node:fs';
import { join, extname, basename, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  ROOT, PROJECTS_DIR, PUBLIC_AUDIO_DIR, OUT_DIR,
  ensureDirs, listProjects, loadProject, saveProject, defaultProject,
  readSceneCode, writeSceneCode, restoreSceneBackup, clearProjectScenes, syncProjectToRemotion
} from './workspace.mjs';
import { validateSceneTsx, parseBatchTsx } from './validator.mjs';
import { probeAudio, probeVideo, splitScriptIntoScenes, alignScenesToAudio } from './audio.mjs';
import { STYLES_META, estimateTokens, buildScriptPrompt, buildBatchPrompt, buildSingleScenePrompt } from './prompts.mjs';

const PORT = Number(process.env.STUDIO_PORT || 4100);
const UI_DIR = join(ROOT, 'studio-ui');
const PUBLIC_DIR = join(ROOT, 'public');
const MAX_UPLOAD = 60 * 1024 * 1024;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg',
  '.webm': 'audio/webm'
};

const renderJobs = new Map();
let studioProc = null;

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

async function readBody(req, maxBytes = 10 * 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw Object.assign(Error('Ukuran data melebihi batas.'), { status: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function readJson(req) {
  const raw = (await readBody(req)).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function broadcastRender(job, event) {
  job.lastEvent = event;
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of job.clients) {
    try { client.write(payload); } catch {}
  }
}

async function startRenderJob(project) {
  for (const existing of renderJobs.values()) {
    if (existing.status === 'running') {
      throw Object.assign(Error('Masih ada proses render yang sedang berjalan. Tunggu selesai atau batalkan dulu.'), { status: 409 });
    }
  }
  await syncProjectToRemotion(project);
  const jobId = randomUUID();
  const compId = project.ratio === '16:9' ? 'Landscape16x9' : 'Portrait9x16';
  const safeName = (project.name || 'video').replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 50) || 'video';
  const outName = `${safeName}-${project.ratio === '16:9' ? '16x9' : '9x16'}-${jobId.slice(0, 6)}.mp4`;
  const outPath = join(OUT_DIR, outName);

  const job = {
    id: jobId,
    projectId: project.id,
    status: 'running',
    progress: 0,
    phase: 'Menyiapkan bundle Remotion…',
    outPath,
    outName,
    videoInfo: null,
    error: null,
    clients: new Set(),
    proc: null,
    lastEvent: null
  };
  renderJobs.set(jobId, job);

  const cliScript = join(ROOT, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');
  const args = [cliScript, 'render', compId, outPath, '--codec=h264', '--pixel-format=yuv420p'];
  const proc = spawn(process.execPath, args, {
    cwd: ROOT,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }
  });
  job.proc = proc;

  let logTail = '';
  const handleOutput = (chunk) => {
    const text = chunk.toString('utf8');
    logTail = (logTail + text).slice(-2000);
    const bundleMatch = text.match(/Bundling\s+(\d+)%/i);
    if (bundleMatch) {
      job.progress = Math.round(Number(bundleMatch[1]) * 0.25);
      job.phase = `Bundling Remotion… ${bundleMatch[1]}%`;
      broadcastRender(job, { status: 'running', progress: job.progress, phase: job.phase });
      return;
    }
    const renderMatch = text.match(/Rendered\s+(\d+)\s*\/\s*(\d+)/i);
    if (renderMatch) {
      const done = Number(renderMatch[1]), total = Math.max(1, Number(renderMatch[2]));
      job.progress = 25 + Math.round((done / total) * 65);
      job.phase = `Merender frame ${done} / ${total}…`;
      broadcastRender(job, { status: 'running', progress: job.progress, phase: job.phase });
      return;
    }
    if (/Encoding|Stitching/i.test(text)) {
      job.progress = Math.max(job.progress, 92);
      job.phase = 'Menggabungkan video & audio (H.264 + AAC)…';
      broadcastRender(job, { status: 'running', progress: job.progress, phase: job.phase });
    }
  };

  proc.stdout.on('data', handleOutput);
  proc.stderr.on('data', handleOutput);

  proc.on('close', async (code) => {
    if (job.status === 'cancelled') return;
    if (code === 0 && existsSync(outPath)) {
      job.status = 'done';
      job.progress = 100;
      job.phase = 'Render MP4 selesai.';
      job.videoInfo = await probeVideo(outPath);
      broadcastRender(job, {
        status: 'done',
        progress: 100,
        phase: job.phase,
        downloadUrl: `/api/renders/${jobId}/download`,
        streamUrl: `/out/${encodeURIComponent(outName)}`,
        videoInfo: job.videoInfo
      });
    } else {
      job.status = 'failed';
      job.error = logTail.trim().split(/\r?\n/).slice(-6).join(' | ') || `Render gagal (kode ${code}).`;
      broadcastRender(job, { status: 'failed', progress: job.progress, error: job.error });
    }
    for (const c of job.clients) { try { c.end(); } catch {} }
    job.clients.clear();
  });

  broadcastRender(job, { status: 'running', progress: 2, phase: job.phase });
  return job;
}

async function serveStatic(res, baseDir, relPath) {
  const safePath = resolve(baseDir, relPath.replace(/^\/+/, ''));
  if (!safePath.startsWith(resolve(baseDir))) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  if (!existsSync(safePath)) {
    res.writeHead(404); res.end('Not found'); return;
  }
  const ext = extname(safePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  createReadStream(safePath).pipe(res);
}

export function createStudioServer() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);
      const path = url.pathname;
      const method = req.method || 'GET';

      // Static files
      if (method === 'GET' && (path === '/' || path === '/index.html')) return serveStatic(res, UI_DIR, 'index.html');
      if (method === 'GET' && (path === '/app.js' || path === '/styles.css')) return serveStatic(res, UI_DIR, path.slice(1));
      if (method === 'GET' && path.startsWith('/styles/')) return serveStatic(res, PUBLIC_DIR, path.slice(1));
      if (method === 'GET' && path.startsWith('/audio/')) return serveStatic(res, PUBLIC_DIR, path.slice(1));
      if (method === 'GET' && path.startsWith('/out/')) return serveStatic(res, OUT_DIR, decodeURIComponent(path.slice(5)));

      // API: meta
      if (method === 'GET' && path === '/api/meta') {
        return sendJson(res, 200, { styles: STYLES_META, studioRunning: !!(studioProc && studioProc.exitCode === null) });
      }

      // API: launch remotion studio on localhost:3000
      if (method === 'POST' && path === '/api/studio/launch') {
        const body = await readJson(req).catch(() => ({}));
        if (body.projectId) {
          const p = await loadProject(body.projectId);
          await syncProjectToRemotion(p);
        }
        if (!studioProc || studioProc.exitCode !== null) {
          const cliScript = join(ROOT, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');
          studioProc = spawn(process.execPath, [cliScript, 'studio', '--port', '3000', '--no-open'], {
            cwd: ROOT,
            windowsHide: true,
            stdio: 'ignore',
            env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }
          });
          studioProc.on('exit', () => { studioProc = null; });
        }
        return sendJson(res, 200, { url: 'http://localhost:3000', launched: true });
      }

      // API: projects list / create
      if (method === 'GET' && path === '/api/projects') {
        const projects = await listProjects();
        return sendJson(res, 200, { projects });
      }
      if (method === 'POST' && path === '/api/projects') {
        const body = await readJson(req);
        const p = defaultProject(String(body.name || 'Proyek Baru').trim() || 'Proyek Baru');
        p.scenes = [];
        p.script = '';
        await saveProject(p);
        await syncProjectToRemotion(p);
        return sendJson(res, 201, { project: p });
      }

      // Project-scoped routes
      const projMatch = path.match(/^\/api\/projects\/([^/]+)(\/.*)?$/);
      if (projMatch) {
        const id = decodeURIComponent(projMatch[1]);
        const sub = projMatch[2] || '';

        if (method === 'GET' && sub === '') {
          const p = await loadProject(id);
          await syncProjectToRemotion(p);
          return sendJson(res, 200, { project: p });
        }

        if (method === 'PUT' && sub === '') {
          const existing = await loadProject(id);
          const body = await readJson(req);
          const next = {
            ...existing,
            name: typeof body.name === 'string' ? body.name.trim() || existing.name : existing.name,
            ratio: ['9:16', '16:9'].includes(body.ratio) ? body.ratio : existing.ratio,
            style: typeof body.style === 'string' ? body.style : existing.style,
            accent: typeof body.accent === 'string' ? body.accent : existing.accent,
            showSubtitles: typeof body.showSubtitles === 'boolean' ? body.showSubtitles : existing.showSubtitles,
            transitionFrames: Number.isFinite(Number(body.transitionFrames)) ? Math.max(0, Math.min(30, Number(body.transitionFrames))) : existing.transitionFrames,
            idea: typeof body.idea === 'string' ? body.idea : existing.idea,
            script: typeof body.script === 'string' ? body.script : existing.script,
            voiceoverOffsetMs: Number.isFinite(Number(body.voiceoverOffsetMs))
              ? Math.max(-5000, Math.min(5000, Math.round(Number(body.voiceoverOffsetMs))))
              : (existing.voiceoverOffsetMs ?? 0),
            bgm: body.bgm !== undefined ? body.bgm : existing.bgm,
            scenes: Array.isArray(body.scenes) ? body.scenes : existing.scenes
          };
          await saveProject(next);
          await syncProjectToRemotion(next);
          return sendJson(res, 200, { project: next });
        }

        if (method === 'POST' && sub === '/split') {
          const p = await loadProject(id);
          const body = await readJson(req);
          const scriptText = typeof body.script === 'string' ? body.script : p.script;
          p.script = scriptText;
          const scenes = splitScriptIntoScenes(scriptText, body.targetCount);
          if (p.voiceover?.durationSec) {
            const aligned = alignScenesToAudio(scenes, p.voiceover.durationSec, p.voiceover.pauses || []);
            scenes.forEach((sc, i) => { sc.durationSec = aligned[i]; });
          }
          p.scenes = scenes;
          await clearProjectScenes(p.id);
          await saveProject(p);
          await syncProjectToRemotion(p);
          return sendJson(res, 200, { project: p, syncedToAudio: !!p.voiceover?.durationSec });
        }

        if (method === 'POST' && sub === '/audio') {
          const p = await loadProject(id);
          const kind = url.searchParams.get('kind') === 'bgm' ? 'bgm' : 'voiceover';
          const origName = basename(url.searchParams.get('name') || `${kind}.mp3`).replace(/[^a-zA-Z0-9._-]/g, '_');
          const ext = extname(origName).toLowerCase() || '.mp3';
          if (!/^\.(mp3|wav|m4a|ogg|webm|aac|flac)$/.test(ext)) {
            return sendJson(res, 400, { error: 'Format audio harus MP3, WAV, M4A, OGG, WebM, AAC, atau FLAC.' });
          }
          const buf = await readBody(req, MAX_UPLOAD);
          if (!buf.length) return sendJson(res, 400, { error: 'File audio kosong.' });

          const filename = `${kind}-${p.id.slice(0, 8)}${ext}`;
          const pAudioDir = join(PROJECTS_DIR, p.id, 'audio');
          await mkdir(pAudioDir, { recursive: true });
          const destPath = join(pAudioDir, filename);
          await writeFile(destPath, buf);

          const info = await probeAudio(destPath);
          let synced = false;
          if (kind === 'voiceover') {
            p.voiceover = { filename, originalName: origName, durationSec: Number(info.durationSec.toFixed(2)), pauses: info.pauses };
            if (p.scenes.length) {
              const aligned = alignScenesToAudio(p.scenes, info.durationSec, info.pauses);
              p.scenes.forEach((sc, i) => { sc.durationSec = aligned[i]; });
              synced = true;
            }
          } else {
            p.bgm = { filename, originalName: origName, durationSec: Number(info.durationSec.toFixed(2)), volume: p.bgm?.volume ?? 0.25 };
          }
          await saveProject(p);
          await syncProjectToRemotion(p);
          return sendJson(res, 200, { project: p, audio: kind === 'voiceover' ? p.voiceover : p.bgm, synced });
        }

        if (method === 'DELETE' && sub === '/audio') {
          const p = await loadProject(id);
          const kind = url.searchParams.get('kind') === 'bgm' ? 'bgm' : 'voiceover';
          if (kind === 'voiceover') p.voiceover = null;
          else p.bgm = null;
          await saveProject(p);
          await syncProjectToRemotion(p);
          return sendJson(res, 200, { project: p });
        }

        if (method === 'POST' && sub === '/sync-audio') {
          const p = await loadProject(id);
          if (!p.voiceover?.durationSec) return sendJson(res, 400, { error: 'Unggah atau tempel voice-over terlebih dahulu.' });
          if (!p.scenes.length) return sendJson(res, 400, { error: 'Bagi naskah menjadi scene terlebih dahulu.' });
          const aligned = alignScenesToAudio(p.scenes, p.voiceover.durationSec, p.voiceover.pauses || []);
          p.scenes.forEach((sc, i) => { sc.durationSec = aligned[i]; });
          await saveProject(p);
          await syncProjectToRemotion(p);
          return sendJson(res, 200, { project: p, pauses: (p.voiceover.pauses || []).length });
        }

        if (method === 'POST' && sub === '/prompt/script') {
          const p = await loadProject(id);
          const body = await readJson(req);
          const st = STYLES_META.find((s) => s.id === p.style) || STYLES_META[0];
          const prompt = buildScriptPrompt({ idea: body.idea ?? p.idea, durationSec: Number(body.durationSec) || 60, styleName: st.name });
          return sendJson(res, 200, { prompt, tokens: estimateTokens(prompt) });
        }

        if (method === 'POST' && sub === '/prompt/batch') {
          const p = await loadProject(id);
          const body = await readJson(req);
          const nums = Array.isArray(body.sceneNumbers) ? body.sceneNumbers.map(Number) : [];
          const batchScenes = p.scenes.filter((s) => nums.includes(s.number));
          if (!batchScenes.length) return sendJson(res, 400, { error: 'Scene untuk batch ini tidak ditemukan.' });
          const firstIdx = p.scenes.findIndex((s) => s.number === batchScenes[0].number);
          const prevScene = firstIdx > 0 ? p.scenes[firstIdx - 1] : null;
          const prompt = buildBatchPrompt(p, batchScenes, {
            batchNumber: Number(body.batchNumber) || 1,
            continuation: Boolean(body.continuation),
            prevScene
          });
          return sendJson(res, 200, { prompt, tokens: estimateTokens(prompt) });
        }

        if (method === 'POST' && sub === '/prompt/scene') {
          const p = await loadProject(id);
          const body = await readJson(req);
          const sc = p.scenes.find((s) => s.componentName === body.componentName || s.number === Number(body.sceneNumber));
          if (!sc) return sendJson(res, 404, { error: 'Scene tidak ditemukan.' });
          const prompt = buildSingleScenePrompt(p, sc, { revisionNote: String(body.revisionNote || '') });
          return sendJson(res, 200, { prompt, tokens: estimateTokens(prompt) });
        }

        if (method === 'POST' && sub === '/scenes/batch') {
          const p = await loadProject(id);
          const body = await readJson(req);
          const expected = Array.isArray(body.expectedNumbers) ? body.expectedNumbers.map(Number) : p.scenes.map((s) => s.number);
          const parsed = parseBatchTsx(body.code, expected);
          const saved = [];
          for (const num of parsed.matched) {
            const sc = p.scenes.find((s) => s.number === num);
            if (!sc) continue;
            const raw = parsed.scenes.get(num);
            const validated = await validateSceneTsx(raw, sc.componentName);
            await writeSceneCode(p.id, sc.componentName, validated);
            sc.hasCustomCode = true;
            saved.push(sc.componentName);
          }
          await saveProject(p);
          await syncProjectToRemotion(p);
          return sendJson(res, 200, { project: p, saved, missing: parsed.missing, remapped: parsed.remapped });
        }

        const sceneCodeMatch = sub.match(/^\/scenes\/(Scene\d+)\/(code|restore)$/);
        if (sceneCodeMatch) {
          const [, compName, action] = sceneCodeMatch;
          const p = await loadProject(id);
          const sc = p.scenes.find((s) => s.componentName === compName);
          if (!sc) return sendJson(res, 404, { error: `Scene ${compName} tidak ditemukan.` });

          if (method === 'GET' && action === 'code') {
            const code = await readSceneCode(p.id, compName);
            return sendJson(res, 200, { componentName: compName, code });
          }
          if (method === 'PUT' && action === 'code') {
            const body = await readJson(req);
            const validated = await validateSceneTsx(body.code, compName);
            await writeSceneCode(p.id, compName, validated);
            sc.hasCustomCode = true;
            await saveProject(p);
            await syncProjectToRemotion(p);
            return sendJson(res, 200, { project: p, componentName: compName, code: validated });
          }
          if (method === 'POST' && action === 'restore') {
            const code = await restoreSceneBackup(p.id, compName);
            await syncProjectToRemotion(p);
            return sendJson(res, 200, { componentName: compName, code });
          }
        }

        if (method === 'POST' && sub === '/render') {
          const p = await loadProject(id);
          if (!p.scenes.length) return sendJson(res, 400, { error: 'Tambahkan scene terlebih dahulu sebelum render.' });
          const job = await startRenderJob(p);
          return sendJson(res, 202, { jobId: job.id });
        }
      }

      // Render job SSE / cancel / download
      const renderMatch = path.match(/^\/api\/renders\/([^/]+)\/(events|download)$/);
      if (renderMatch) {
        const [, jobId, action] = renderMatch;
        const job = renderJobs.get(jobId);
        if (!job) return sendJson(res, 404, { error: 'Job render tidak ditemukan.' });

        if (method === 'GET' && action === 'events') {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive'
          });
          if (job.lastEvent) res.write(`data: ${JSON.stringify(job.lastEvent)}\n\n`);
          if (job.status !== 'running') { res.end(); return; }
          job.clients.add(res);
          req.on('close', () => job.clients.delete(res));
          return;
        }
        if (method === 'GET' && action === 'download') {
          if (job.status !== 'done' || !existsSync(job.outPath)) {
            return sendJson(res, 400, { error: 'File MP4 belum siap diunduh.' });
          }
          res.writeHead(200, {
            'Content-Type': 'video/mp4',
            'Content-Disposition': `attachment; filename="${job.outName}"`
          });
          createReadStream(job.outPath).pipe(res);
          return;
        }
      }

      const cancelMatch = path.match(/^\/api\/renders\/([^/]+)$/);
      if (method === 'DELETE' && cancelMatch) {
        const job = renderJobs.get(cancelMatch[1]);
        if (job && job.status === 'running') {
          job.status = 'cancelled';
          try { job.proc?.kill(); } catch {}
          broadcastRender(job, { status: 'cancelled', phase: 'Render dibatalkan.' });
          for (const c of job.clients) { try { c.end(); } catch {} }
          job.clients.clear();
        }
        return sendJson(res, 200, { ok: true });
      }

      return sendJson(res, 404, { error: 'Endpoint tidak ditemukan.' });
    } catch (err) {
      return sendJson(res, err.status || 400, { error: err.message || 'Terjadi kesalahan server.' });
    }
  });
}

export function stopStudioProcesses() {
  if (studioProc && studioProc.exitCode === null) {
    try { studioProc.kill(); } catch {}
    studioProc = null;
  }
  for (const job of renderJobs.values()) {
    if (job.status === 'running') {
      job.status = 'cancelled';
      try { job.proc?.kill(); } catch {}
    }
  }
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('server\\index.mjs') || process.argv[1]?.endsWith('server/index.mjs')) {
  await ensureDirs();
  const projects = await listProjects();
  if (projects[0]) await syncProjectToRemotion(projects[0]);
  const server = createStudioServer();
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`Remotion Motion Studio aktif di http://127.0.0.1:${PORT}`);
  });
}
