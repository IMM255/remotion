import { mkdir, readFile, writeFile, copyFile, readdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { randomUUID } from 'node:crypto';

export const ROOT = resolve(import.meta.dirname, '..');
export const PROJECTS_DIR = join(ROOT, 'projects');
export const SRC_DIR = join(ROOT, 'src');
export const SCENES_DIR = join(SRC_DIR, 'scenes');
export const PUBLIC_AUDIO_DIR = join(ROOT, 'public', 'audio');
export const OUT_DIR = join(ROOT, 'out');

export async function ensureDirs() {
  await Promise.all([
    mkdir(PROJECTS_DIR, { recursive: true }),
    mkdir(SCENES_DIR, { recursive: true }),
    mkdir(PUBLIC_AUDIO_DIR, { recursive: true }),
    mkdir(OUT_DIR, { recursive: true })
  ]);
}

export function defaultProject(name = 'Proyek Remotion 1') {
  return {
    id: randomUUID(),
    name,
    ratio: '9:16',
    style: 'collage',
    accent: '#f07a5a',
    showSubtitles: true,
    transitionFrames: 12,
    idea: '',
    script: 'Jadi atur ketukannya. Mulai minggu ini, pilih satu hari aja, sisanya kasih jeda.\nTetap enak kalau ritmenya pas. Simpan video ini buat pengingat.',
    voiceover: null, // { filename, durationSec, pauses }
    voiceoverOffsetMs: 0,
    bgm: null,       // { filename, volume }
    scenes: [
      {
        number: 1,
        id: 'scene-01',
        componentName: 'Scene01',
        durationSec: 5.0,
        narration: 'Jadi atur ketukannya. Mulai minggu ini, pilih satu hari aja, sisanya kasih jeda.',
        visual: 'Kalender minggu ini dengan 7 kotak dan tag KASIH JEDA.',
        dark: false,
        hasCustomCode: true
      },
      {
        number: 2,
        id: 'scene-02',
        componentName: 'Scene02',
        durationSec: 4.5,
        narration: 'Tetap enak kalau ritmenya pas. Simpan video ini buat pengingat.',
        visual: 'Baris ketukan ritme, drum, dan tag SIMPAN.',
        dark: true,
        hasCustomCode: true
      }
    ],
    updatedAt: Date.now()
  };
}

export function placeholderSceneCode(sc) {
  const safeNarration = JSON.stringify(sc.narration || `Scene ${sc.number}`);
  const safeVisual = JSON.stringify(sc.visual || 'Tempel kode TSX dari Claude untuk mengganti tampilan scene ini.');
  return `import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { KineticWords, PaperCard, SpringIn, TagPin } from '../components/MotionKit';
import type { StyleTheme } from '../styles';

export const ${sc.componentName}: React.FC<{ theme: StyleTheme }> = ({ theme }) => {
  const { width, height } = useVideoConfig();
  const isPortrait = height > width;
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: isPortrait ? '120px 80px 260px' : '60px 120px 140px',
        gap: 36,
        flexDirection: 'column'
      }}
    >
      <TagPin label="SCENE ${String(sc.number).padStart(2, '0')}" bg={theme.accent} delaySec={0.05} rotateDeg={-2} />
      <KineticWords
        text={${safeNarration}}
        color={${sc.dark ? '"#ffffff"' : 'theme.ink'}}
        accentColor={theme.accent}
        fontSize={isPortrait ? 54 : 46}
        startSec={0.15}
      />
      <SpringIn delaySec={0.35}>
        <PaperCard bg={theme.surface} style={{ maxWidth: isPortrait ? 780 : 880 }}>
          <div style={{ fontFamily: '"Segoe UI", sans-serif', fontSize: 26, color: theme.muted, textAlign: 'center' }}>
            {${safeVisual}}
          </div>
        </PaperCard>
      </SpringIn>
    </AbsoluteFill>
  );
};
`;
}

export async function listProjects() {
  await ensureDirs();
  const entries = await readdir(PROJECTS_DIR, { withFileTypes: true });
  const projects = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const file = join(PROJECTS_DIR, e.name, 'project.json');
    if (!existsSync(file)) continue;
    try {
      projects.push(JSON.parse(await readFile(file, 'utf8')));
    } catch {}
  }
  if (!projects.length) {
    const p = defaultProject();
    await saveProject(p);
    // Copy existing demo Scene01 & Scene02 into project folder
    const pScenes = join(PROJECTS_DIR, p.id, 'scenes');
    await mkdir(pScenes, { recursive: true });
    for (const f of ['Scene01.tsx', 'Scene02.tsx']) {
      if (existsSync(join(SCENES_DIR, f))) {
        await copyFile(join(SCENES_DIR, f), join(pScenes, f));
      }
    }
    projects.push(p);
  }
  return projects.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export async function loadProject(id) {
  const file = join(PROJECTS_DIR, id, 'project.json');
  if (!existsSync(file)) throw Error('Proyek tidak ditemukan.');
  return JSON.parse(await readFile(file, 'utf8'));
}

export async function saveProject(p) {
  await ensureDirs();
  p.updatedAt = Date.now();
  const dir = join(PROJECTS_DIR, p.id);
  await mkdir(join(dir, 'scenes', '.backup'), { recursive: true });
  await mkdir(join(dir, 'audio'), { recursive: true });
  await writeFile(join(dir, 'project.json'), JSON.stringify(p, null, 2), 'utf8');
  return p;
}

export async function readSceneCode(projectId, componentName) {
  const file = join(PROJECTS_DIR, projectId, 'scenes', `${componentName}.tsx`);
  if (existsSync(file)) return readFile(file, 'utf8');
  const active = join(SCENES_DIR, `${componentName}.tsx`);
  if (existsSync(active)) return readFile(active, 'utf8');
  return '';
}

export async function writeSceneCode(projectId, componentName, code) {
  const dir = join(PROJECTS_DIR, projectId, 'scenes');
  const backupDir = join(dir, '.backup');
  await mkdir(backupDir, { recursive: true });
  const file = join(dir, `${componentName}.tsx`);
  if (existsSync(file)) {
    await copyFile(file, join(backupDir, `${componentName}.tsx`));
  }
  await writeFile(file, code, 'utf8');
}

export async function restoreSceneBackup(projectId, componentName) {
  const backupFile = join(PROJECTS_DIR, projectId, 'scenes', '.backup', `${componentName}.tsx`);
  if (!existsSync(backupFile)) throw Error(`Belum ada versi sebelumnya untuk ${componentName}.`);
  const code = await readFile(backupFile, 'utf8');
  await writeFile(join(PROJECTS_DIR, projectId, 'scenes', `${componentName}.tsx`), code, 'utf8');
  return code;
}

export async function clearProjectScenes(projectId) {
  const dir = join(PROJECTS_DIR, projectId, 'scenes');
  if (!existsSync(dir)) return;
  const entries = await readdir(dir, { withFileTypes: true });
  await Promise.all(
    entries
      .filter((e) => e.isFile() && /^Scene\d+\.tsx$/i.test(e.name))
      .map((e) => unlink(join(dir, e.name)).catch(() => {}))
  );
}

/**
 * Menulis proyek aktif ke src/config.ts, src/scenes/*.tsx, src/scenes/index.ts, dan public/audio/*
 * agar Remotion Studio (npm run dev) dan CLI Render langsung memakai proyek aktif.
 */
export async function syncProjectToRemotion(p) {
  await ensureDirs();
  const pScenesDir = join(PROJECTS_DIR, p.id, 'scenes');
  await mkdir(pScenesDir, { recursive: true });

  // 1. Sync audio files to public/audio/
  const pAudioDir = join(PROJECTS_DIR, p.id, 'audio');
  if (p.voiceover?.filename && existsSync(join(pAudioDir, p.voiceover.filename))) {
    await copyFile(join(pAudioDir, p.voiceover.filename), join(PUBLIC_AUDIO_DIR, p.voiceover.filename));
  }
  if (p.bgm?.filename && existsSync(join(pAudioDir, p.bgm.filename))) {
    await copyFile(join(pAudioDir, p.bgm.filename), join(PUBLIC_AUDIO_DIR, p.bgm.filename));
  }

  // 2. Determine active scenes (if a brand-new project has 0 scenes yet, render a clean placeholder)
  const effectiveScenes = p.scenes?.length
    ? p.scenes
    : [{
        number: 1,
        id: 'scene-01',
        componentName: 'Scene01',
        durationSec: 4,
        narration: p.name || 'Proyek Baru',
        visual: 'Tempel naskah di Tahap 2 lalu klik Bagi naskah ke scene.',
        dark: false,
        hasCustomCode: false
      }];

  const activeFiles = new Set(effectiveScenes.map((sc) => `${sc.componentName}.tsx`));

  // Remove stale SceneXX.tsx files left over from previous projects or older splits
  for (const dir of [SCENES_DIR, pScenesDir]) {
    if (!existsSync(dir)) continue;
    const existingFiles = await readdir(dir, { withFileTypes: true });
    await Promise.all(
      existingFiles
        .filter((e) => e.isFile() && /^Scene\d+\.tsx$/i.test(e.name) && !activeFiles.has(e.name))
        .map((e) => unlink(join(dir, e.name)).catch(() => {}))
    );
  }

  // 3. Sync each scene TSX file (use custom code only if scene hasCustomCode; otherwise refresh placeholder)
  for (const sc of effectiveScenes) {
    const srcFile = join(pScenesDir, `${sc.componentName}.tsx`);
    let code;
    if (sc.hasCustomCode && existsSync(srcFile)) {
      code = await readFile(srcFile, 'utf8');
    } else {
      code = placeholderSceneCode(sc);
      if (p.scenes?.length) {
        await writeFile(srcFile, code, 'utf8');
      }
    }
    await writeFile(join(SCENES_DIR, `${sc.componentName}.tsx`), code, 'utf8');
  }

  // 4. Write src/scenes/index.ts
  const imports = effectiveScenes.map((sc) => `import { ${sc.componentName} } from './${sc.componentName}';`).join('\n');
  const entries = effectiveScenes.map((sc) => `  {
    id: ${JSON.stringify(sc.id)},
    durationSec: ${Number(sc.durationSec) || 4},
    narration: ${JSON.stringify(sc.narration || '')},
    dark: ${Boolean(sc.dark)},
    Component: ${sc.componentName}
  }`).join(',\n');

  const indexTs = `import type React from 'react';
import type { StyleTheme } from '../styles';
${imports}

export interface SceneDefinition {
  id: string;
  durationSec: number;
  narration: string;
  dark?: boolean;
  Component: React.FC<{ theme: StyleTheme }>;
}

export const SCENES: SceneDefinition[] = [
${entries}
];
`;
  await writeFile(join(SCENES_DIR, 'index.ts'), indexTs, 'utf8');

  // 4. Write src/config.ts
  const configTs = `export type StylePresetId =
  | 'collage'
  | 'clay'
  | 'katalog'
  | 'sketsa'
  | 'kartun'
  | 'jurnalisme'
  | 'panggung'
  | 'anime'
  | 'cinema'
  | 'faceless';

export const PROJECT_CONFIG = {
  title: ${JSON.stringify(p.name || 'Remotion Project')},
  fps: 30,
  style: ${JSON.stringify(p.style || 'collage')} as StylePresetId,
  accent: ${JSON.stringify(p.accent || '#f07a5a')},
  showSubtitles: ${Boolean(p.showSubtitles ?? true)},
  voiceoverFile: ${JSON.stringify(p.voiceover?.filename || null)} as string | null,
  voiceoverOffsetSec: ${Number(((Number(p.voiceoverOffsetMs) || 0) / 1000).toFixed(3))},
  bgmFile: ${JSON.stringify(p.bgm?.filename || null)} as string | null,
  bgmVolume: ${Number(p.bgm?.volume ?? 0.25)},
  transitionFrames: ${Number(p.transitionFrames ?? 12)}
};
`;
  await writeFile(join(SRC_DIR, 'config.ts'), configTs, 'utf8');
}
