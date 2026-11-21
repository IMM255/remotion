import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export function spokenWeight(text) {
  const s = String(text || '').trim();
  if (!s) return 1;
  let weight = 0;
  for (const w of s.split(/\s+/).filter(Boolean)) {
    const letters = w.replace(/[^a-zA-Z0-9\u00C0-\u024F]/g, '').length;
    weight += Math.max(1.5, letters * 0.45 + 0.8);
    if (/[.!?]$/.test(w)) weight += 3.2;
    else if (/[,;:]$/.test(w)) weight += 1.4;
  }
  return Math.max(1, weight);
}

export async function probeAudio(filePath) {
  let durationSec = 0;
  try {
    const { stdout } = await execFileAsync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'csv=p=0',
      filePath
    ], { windowsHide: true, timeout: 15000 });
    durationSec = Math.max(0.5, Number(stdout.trim()) || 0);
  } catch (err) {
    throw Error(`Gagal membaca durasi audio dengan ffprobe: ${err.message}`);
  }

  const pauses = [];
  try {
    const { stderr } = await execFileAsync('ffmpeg', [
      '-hide_banner',
      '-i', filePath,
      '-af', 'silencedetect=noise=-35dB:d=0.18',
      '-f', 'null', '-'
    ], { windowsHide: true, timeout: 25000 });

    let start = null;
    for (const line of stderr.split(/\r?\n/)) {
      const mStart = line.match(/silence_start:\s*([0-9.]+)/);
      if (mStart) start = Number(mStart[1]);
      const mEnd = line.match(/silence_end:\s*([0-9.]+)\s*\|\s*silence_duration:\s*([0-9.]+)/);
      if (mEnd && start !== null) {
        const end = Number(mEnd[1]);
        const dur = Number(mEnd[2]);
        pauses.push({ startSec: start, endSec: end, midSec: (start + end) / 2, durSec: dur });
        start = null;
      }
    }
  } catch {
    // Silence detection is optional; durationSec alone still works.
  }

  return { durationSec, pauses };
}

export async function probeVideo(filePath) {
  try {
    const { stdout } = await execFileAsync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration,size:stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames',
      '-of', 'json',
      filePath
    ], { windowsHide: true, timeout: 15000 });
    const data = JSON.parse(stdout);
    const v = (data.streams || []).find((s) => s.codec_type === 'video');
    const a = (data.streams || []).find((s) => s.codec_type === 'audio');
    return {
      durationSec: Number(data.format?.duration || 0),
      sizeBytes: Number(data.format?.size || 0),
      width: v?.width || 0,
      height: v?.height || 0,
      fps: v?.r_frame_rate || '30/1',
      videoCodec: v?.codec_name || 'h264',
      audioCodec: a?.codec_name || null
    };
  } catch {
    return null;
  }
}

export function splitScriptIntoScenes(script, targetCount = 0) {
  const clean = String(script || '').trim();
  if (!clean) throw Error('Naskah masih kosong. Tulis atau tempel naskah terlebih dahulu.');

  const words = clean.split(/\s+/).filter(Boolean);
  const autoCount = Math.max(1, Math.min(40, Math.round(words.length / 13) || 1));
  const count = Math.max(1, Math.min(60, Math.round(Number(targetCount) || autoCount)));

  // Prefer natural sentence boundaries when count is auto or close to sentence count.
  const sentences = clean.split(/\n+|(?<=[.!?])\s+/u).map((s) => s.trim()).filter(Boolean);
  let chunks = [];

  if (sentences.length >= count && sentences.length <= count * 2) {
    let cursor = 0;
    for (let i = 0; i < count; i++) {
      const take = Math.ceil((sentences.length - cursor) / (count - i));
      chunks.push(sentences.slice(cursor, cursor + take).join(' '));
      cursor += take;
    }
  } else {
    let cursor = 0;
    for (let i = 0; i < count; i++) {
      const take = Math.max(1, Math.ceil((words.length - cursor) / (count - i)));
      if (cursor >= words.length) break;
      chunks.push(words.slice(cursor, cursor + take).join(' '));
      cursor += take;
    }
  }

  return chunks.filter(Boolean).map((narration, idx) => {
    const estSec = Math.max(2.0, Math.min(20, Number((narration.split(/\s+/).length / 2.4).toFixed(2))));
    return {
      number: idx + 1,
      id: `scene-${String(idx + 1).padStart(2, '0')}`,
      componentName: `Scene${String(idx + 1).padStart(2, '0')}`,
      durationSec: estSec,
      narration,
      visual: narration,
      dark: idx === chunks.length - 1 && chunks.length > 1,
      hasCustomCode: false
    };
  });
}

export function alignScenesToAudio(scenes, audioDurationSec, pauses = []) {
  if (!scenes?.length) throw Error('Belum ada scene untuk disinkronkan.');
  const totalSec = Math.max(scenes.length * 0.8, Number(audioDurationSec) || 0);
  if (scenes.length === 1) return [Number(totalSec.toFixed(2))];

  const weights = scenes.map((s) => spokenWeight(s.narration));
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  const boundaries = [0];
  let cum = 0;
  for (let i = 0; i < scenes.length - 1; i++) {
    cum += weights[i];
    const ideal = (cum / totalWeight) * totalSec;
    const minSec = boundaries[i] + 0.8;
    const maxSec = totalSec - (scenes.length - 1 - i) * 0.8;
    let chosen = Math.max(minSec, Math.min(maxSec, ideal));

    let bestPause = null;
    let bestScore = Infinity;
    for (const p of pauses || []) {
      if (p.midSec < minSec || p.midSec > maxSec) continue;
      const dist = Math.abs(p.midSec - ideal);
      if (dist <= 1.2) {
        const score = dist - Math.min(0.3, p.durSec * 0.4);
        if (score < bestScore) { bestScore = score; bestPause = p; }
      }
    }
    if (bestPause) chosen = bestPause.midSec;
    boundaries.push(Number(chosen.toFixed(2)));
  }
  boundaries.push(Number(totalSec.toFixed(2)));

  return scenes.map((_, i) => Math.max(0.8, Number((boundaries[i + 1] - boundaries[i]).toFixed(2))));
}
