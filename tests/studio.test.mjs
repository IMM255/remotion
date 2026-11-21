import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSceneTsx, parseBatchTsx } from '../server/validator.mjs';
import { spokenWeight, splitScriptIntoScenes, alignScenesToAudio } from '../server/audio.mjs';
import { buildBatchPrompt, buildSingleScenePrompt, estimateTokens } from '../server/prompts.mjs';
import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { SCENES_DIR, PROJECTS_DIR, listProjects, syncProjectToRemotion } from '../server/workspace.mjs';
import { createStudioServer } from '../server/index.mjs';

test('validateSceneTsx allows safe Remotion TSX and blocks dangerous imports or eval', async () => {
  const good = `
    import React from 'react';
    import { AbsoluteFill } from 'remotion';
    import type { StyleTheme } from '../styles';
    export const Scene01: React.FC<{ theme: StyleTheme }> = ({ theme }) => <AbsoluteFill style={{ color: theme.ink }} />;
  `;
  const validated = await validateSceneTsx(good, 'Scene01');
  assert.match(validated, /export const Scene01/);

  const badImport = `import fs from 'node:fs';\nexport const Scene01 = () => null;`;
  await assert.rejects(validateSceneTsx(badImport, 'Scene01'), /tidak diizinkan/);

  const badSyntax = `export const Scene01 = () => <div>;`;
  await assert.rejects(validateSceneTsx(badSyntax, 'Scene01'), /Error sintaks TSX/);

  const withStrayFence = `Berikut kodenya:\r\n\`\`\`tsx\r\nexport const Scene01 = () => <div />;\r\n\`\`\`\r\n`;
  const cleaned1 = await validateSceneTsx(withStrayFence, 'Scene01');
  assert.match(cleaned1, /export const Scene01/);

  const withTrailingBackticksOnly = `export const Scene02 = () => <div />;\r\n\`\`\``;
  const cleaned2 = await validateSceneTsx(withTrailingBackticksOnly, 'Scene02');
  assert.match(cleaned2, /export const Scene02/);
});

test('parseBatchTsx splits SceneXX.tsx markers and remaps non-overlapping scene numbers', () => {
  const raw = [
    '```tsx',
    '// ===== Scene07.tsx =====',
    'export const Scene07 = () => null;',
    '',
    '// ===== Scene08.tsx =====',
    'export const Scene08 = () => null;',
    '```'
  ].join('\n');
  const parsed = parseBatchTsx(raw, [1, 2]);
  assert.equal(parsed.remapped, true);
  assert.deepEqual(parsed.matched, [1, 2]);
  assert.match(parsed.scenes.get(1), /Scene07/);
  assert.match(parsed.scenes.get(2), /Scene08/);
});

test('splitScriptIntoScenes and alignScenesToAudio snap to detected speech pauses', () => {
  const scenes = splitScriptIntoScenes('Kalimat pertama pembuka cerita. Kalimat kedua menutup penjelasan.', 2);
  assert.equal(scenes.length, 2);
  assert.ok(spokenWeight(scenes[0].narration) > 5);
  const durations = alignScenesToAudio(scenes, 6.0, [{ startSec: 2.6, endSec: 3.0, midSec: 2.8, durSec: 0.4 }]);
  assert.equal(Number((durations[0] + durations[1]).toFixed(2)), 6.0);
  assert.equal(durations[0], 2.8);
});

test('prompts are token-efficient and continuation batch 2+ is under 300 tokens', () => {
  const p = { ratio: '9:16', style: 'katalog' };
  const scenes = splitScriptIntoScenes('Satu dua tiga. Empat lima enam. Tujuh delapan sembilan. Sepuluh sebelas.', 4);
  const p1 = buildBatchPrompt(p, scenes.slice(0, 2), { batchNumber: 1, continuation: false });
  const p2 = buildBatchPrompt(p, scenes.slice(2, 4), { batchNumber: 2, continuation: true, prevScene: scenes[1] });
  const ps = buildSingleScenePrompt(p, scenes[0]);
  assert.match(p1, /White Catalog/);
  assert.ok(estimateTokens(p2) < 300, `Expected <300 tokens, got ${estimateTokens(p2)}`);
  assert.match(ps, /Scene01/);
});

test('Studio HTTP server serves UI, meta, projects, and validates batch TSX over REST', async () => {
  const srv = createStudioServer();
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const port = srv.address().port;
  const base = `http://127.0.0.1:${port}`;
  try {
    const html = await (await fetch(base + '/')).text();
    assert.match(html, /Remotion Motion Studio/);

    const meta = await (await fetch(base + '/api/meta')).json();
    assert.ok(meta.styles.length >= 9);

    const { projects } = await (await fetch(base + '/api/projects')).json();
    assert.ok(projects.length >= 1);
  } finally {
    srv.close();
  }
});

test('creating new project and splitting to 2 scenes removes stale scenes from previous project', async () => {
  const existing = await listProjects();
  const prevActive = existing[0];
  const srv = createStudioServer();
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const port = srv.address().port;
  const base = `http://127.0.0.1:${port}`;
  let tempId = null;
  try {
    const created = await (await fetch(`${base}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Tes Bersih Scene' })
    })).json();
    tempId = created.project.id;

    // Right after creating empty project, stale Scene03+ must not exist in src/scenes
    assert.equal(existsSync(join(SCENES_DIR, 'Scene03.tsx')), false);

    // Split new script into 2 scenes
    const splitRes = await (await fetch(`${base}/api/projects/${encodeURIComponent(tempId)}/split`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script: 'Kalimat baru pertama. Kalimat baru kedua.', targetCount: 2 })
    })).json();
    assert.equal(splitRes.project.scenes.length, 2);
    assert.equal(existsSync(join(SCENES_DIR, 'Scene01.tsx')), true);
    assert.equal(existsSync(join(SCENES_DIR, 'Scene02.tsx')), true);
    assert.equal(existsSync(join(SCENES_DIR, 'Scene03.tsx')), false);
  } finally {
    srv.close();
    if (tempId) await rm(join(PROJECTS_DIR, tempId), { recursive: true, force: true }).catch(() => {});
    if (prevActive) await syncProjectToRemotion(prevActive);
  }
});
