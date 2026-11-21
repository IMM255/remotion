import esbuild from 'esbuild';

const ALLOWED_IMPORTS = [
  /^react$/,
  /^remotion$/,
  /^@remotion\/[a-z0-9-]+(?:\/[a-z0-9-]+)?$/i,
  /^\.\.\/components\/MotionKit(?:\.tsx?)?$/,
  /^\.\.\/styles(?:\.ts)?$/
];

const FORBIDDEN_PATTERNS = [
  { re: /\b(?:child_process|node:fs|node:http|node:net|node:os)\b/, msg: 'Import modul Node sistem tidak diizinkan.' },
  { re: /\b(?:eval|Function)\s*\(/, msg: 'Pemanggilan eval/Function tidak diizinkan dalam kode scene.' },
  { re: /\bprocess\.(?:env|exit|cwd|binding)\b/, msg: 'Akses objek process tidak diizinkan.' },
  { re: /\bwindow\.location\b/, msg: 'Akses window.location tidak diizinkan.' },
  { re: /\bfetch\s*\(/, msg: 'Panggilan jaringan fetch() tidak diizinkan di dalam scene.' }
];

export function stripCodeFences(raw) {
  let out = String(raw || '').replace(/\r\n?/g, '\n').trim();
  if (!out) return '';

  // If the entire snippet is wrapped in a single fenced block (even with brief intro/outro prose), extract it.
  const fenced = out.match(/```(?:tsx|ts|jsx|js|typescript|javascript)?[ \t]*\n([\s\S]*?)\n[ \t]*```/i);
  if (fenced) {
    const before = out.slice(0, fenced.index).trim();
    const after = out.slice(fenced.index + fenced[0].length).trim();
    const hasCodeOutside = /\b(?:import|export|const|function)\b/.test(`${before}\n${after}`);
    if (!hasCodeOutside) {
      out = fenced[1].trim();
    }
  }

  // Strip stray leading/trailing fence lines (e.g. partial paste with only opening or closing ```).
  out = out.replace(/^[ \t]*```(?:tsx|ts|jsx|js|typescript|javascript)?[ \t]*\n?/i, '');
  out = out.replace(/\n?[ \t]*```[ \t]*$/i, '');
  return out.trim();
}

export function normalizeExportName(code, componentName) {
  let out = stripCodeFences(code);
  if (!out) throw Error('Kode TSX masih kosong.');

  // If AI exported a differently named SceneXX (e.g. Scene07 instead of Scene01), normalize to expected name.
  const exportMatch = out.match(/export\s+(?:const|function)\s+(Scene\d+)\b/);
  if (exportMatch && exportMatch[1] !== componentName) {
    out = out.replace(new RegExp(`\\b${exportMatch[1]}\\b`, 'g'), componentName);
  } else if (!new RegExp(`export\\s+(?:const|function)\\s+${componentName}\\b`).test(out)) {
    // Support export default component by re-exporting as named componentName.
    if (/export\s+default\s+/.test(out)) {
      out = out.replace(/export\s+default\s+/, `export const ${componentName} = `);
    } else {
      throw Error(`Komponen harus mengekspor \`export const ${componentName}: React.FC<{ theme: StyleTheme }> = ...\`.`);
    }
  }
  return out;
}

export async function validateSceneTsx(rawCode, componentName) {
  const code = normalizeExportName(rawCode, componentName);

  // Check static imports against allowlist.
  const importRe = /^\s*import\s+(?:type\s+)?[\s\S]*?\s+from\s+['"]([^'"]+)['"]/gm;
  for (const m of code.matchAll(importRe)) {
    const spec = m[1];
    if (!ALLOWED_IMPORTS.some((rx) => rx.test(spec))) {
      throw Error(`Import "${spec}" tidak diizinkan. Gunakan hanya react, remotion, @remotion/*, ../components/MotionKit, atau ../styles.`);
    }
  }

  for (const rule of FORBIDDEN_PATTERNS) {
    if (rule.re.test(code)) throw Error(rule.msg);
  }

  try {
    await esbuild.transform(code, {
      loader: 'tsx',
      jsx: 'automatic',
      target: 'es2022',
      sourcefile: `${componentName}.tsx`
    });
  } catch (err) {
    const first = err?.errors?.[0];
    if (first) {
      const loc = first.location ? ` (baris ${first.location.line}, kolom ${first.location.column})` : '';
      const snippet = first.location?.lineText ? ` -> "${first.location.lineText.trim().slice(0, 80)}"` : '';
      throw Error(`Error sintaks TSX${loc}: ${first.text}${snippet}`);
    }
    throw Error(`Error sintaks TSX: ${err.message}`);
  }

  return code;
}

export function parseBatchTsx(raw, expectedNumbers = []) {
  let text = String(raw || '').replace(/\r\n?/g, '\n').trim();
  if (!text) throw Error('Tempel hasil kode TSX batch terlebih dahulu.');
  if (/^PERINTAH TERPOTONG$/i.test(text)) {
    throw Error('AI melaporkan PERINTAH TERPOTONG. Kurangi jumlah scene per batch lalu salin ulang.');
  }
  const outerFence = text.match(/^```(?:tsx|ts|jsx|js|typescript|javascript)?[ \t]*\n([\s\S]*?)\n[ \t]*```$/i);
  if (outerFence) text = outerFence[1].trim();

  // Match either `// ===== Scene01.tsx =====` or `// ===== SCENE 1 =====`
  const marker = /^\/\/\s*=+\s*(?:Scene\s*0*(\d+)(?:\.tsx?)?)\s*=+\s*$/gim;
  const hits = [...text.matchAll(marker)];
  if (!hits.length) {
    throw Error('Penanda "// ===== Scene01.tsx =====" atau "// ===== SCENE 1 =====" tidak ditemukan.');
  }

  const map = new Map();
  for (let i = 0; i < hits.length; i++) {
    const num = Number(hits[i][1]);
    const start = hits[i].index + hits[i][0].length;
    const end = i + 1 < hits.length ? hits[i + 1].index : text.length;
    const body = stripCodeFences(text.slice(start, end));
    if (body) map.set(num, body);
  }

  let matched = expectedNumbers.length
    ? expectedNumbers.filter((n) => map.has(n))
    : [...map.keys()];
  let remapped = false;

  if (!matched.length && expectedNumbers.length) {
    const ordered = [...map.values()];
    if (ordered.length && ordered.length <= expectedNumbers.length) {
      const next = new Map();
      ordered.forEach((code, idx) => next.set(expectedNumbers[idx], code));
      map.clear();
      for (const [k, v] of next) map.set(k, v);
      matched = expectedNumbers.slice(0, ordered.length);
      remapped = true;
    }
  }

  const missing = expectedNumbers.filter((n) => !map.has(n));
  if (!matched.length) {
    throw Error(`Nomor scene hasil (${[...map.keys()].join(', ')}) tidak cocok dengan batch (${expectedNumbers.join(', ')}).`);
  }

  return { scenes: map, matched, missing, remapped };
}
