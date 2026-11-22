import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const BUILTIN_STYLES = [
  { id: 'collage', name: 'Kolase Kertas', category: 'Bawaan Studio', desc: 'Potongan kertas + bayangan lembut + tag paku payung', thumb: 'styles/collage.jpg', accent: '#f07a5a', recipe: 'potongan kertas flat di atas lembar krem, bayangan kertas tegas (boxShadow: "6px 9px 0 rgba(43,42,40,0.16)"), gunakan PaperCard & TagPin berpaku payung miring, palet koral #f07a5a, toska #2a9d8f, kuning #f6c143, navy #26355d.' },
  { id: 'clay', name: 'Clay 3D', category: 'Bawaan Studio', desc: 'Bentuk 3D lembut matte + cahaya studio hangat', thumb: 'styles/clay.png', accent: '#aa765a', recipe: 'bentuk membulat empuk dengan gradient radial lembut & inset highlight putih halus, bayangan difus, palet terakota #aa765a, peach #ffcfb0, biru lembut #8dbbe8, krem #fff1e3, gerak membal (damping 10-12).' },
  { id: 'katalog', name: 'White Catalog (-katalog)', category: 'Bawaan Studio', desc: 'Latar kisi putih + kartu produk komersial', thumb: 'styles/katalog.png', accent: '#c43d21', recipe: 'gaya White Catalog: kartu produk rapi berbingkai gelap tipis, badge pil kapsul, tipografi tebal kontras tinggi (#26231f) + aksen #c43d21, gerak presisi.' },
  { id: 'sketsa', name: 'Vintage Sketch (-sketsa)', category: 'Bawaan Studio', desc: 'Kertas sepia + ilustrasi garis ukir klasik', thumb: 'styles/sketsa.png', accent: '#8e4a2b', recipe: 'gaya Vintage Sketch: ilustrasi SVG garis tinta cokelat tua (#3b2d23) dengan animasi strokeDashoffset progresif, bingkai tipis, aksen warna karat #8e4a2b.' },
  { id: 'kartun', name: 'Cartoon Collage (-kartun)', category: 'Bawaan Studio', desc: 'Kertas krem + ilustrasi flat cerah + pil warna', thumb: 'styles/kartun.png', accent: '#2a9d8f', recipe: 'gaya Cartoon Collage: potongan ilustrasi SVG flat cerah dengan bayangan kertas, badge pil warna (#2a9d8f, #f07a5a, #f6c143, #26355d), gerak ceria.' },
  { id: 'jurnalisme', name: 'Visual Journalism (-jurnalisme)', category: 'Bawaan Studio', desc: 'Editorial koran modern + grafik data + stabilo', thumb: 'styles/jurnalisme.png', accent: '#d9452c', recipe: 'gaya Visual Journalism: kartu data editorial, grafik batang/garis SVG animasi, sorotan stabilo kuning #f6c143 yang melebar, aksen merah #d9452c, tinta #1e2229.' },
  { id: 'panggung', name: 'Cartoon Stage (-panggung)', category: 'Bawaan Studio', desc: 'Satu panggung hidup berlapis + zoom kamera', thumb: 'styles/panggung.png', accent: '#f07a5a', recipe: 'gaya Cartoon Stage: susun properti dalam 3 lapisan kedalaman (belakang/tengah/depan) dengan warna flat cerah, gunakan transform scale/translate halus untuk zoom kamera panggung.' },
  { id: 'anime', name: 'Anime', category: 'Bawaan Studio', desc: 'Cahaya sore dramatis + partikel cahaya', thumb: 'styles/anime.jpg', accent: '#7777b5', recipe: 'gaya Anime: sorot cahaya sore hangat (rim-light #ffd9b3), partikel cahaya melayang, siluet dinamis, palet indigo #353b6e, lavender #7777b5, peach #f5a988.' },
  { id: 'cinema', name: 'Sinematik Realistis', category: 'Bawaan Studio', desc: 'Komposisi film berlapis + cahaya golden hour', thumb: 'styles/cinema.png', accent: '#e8be78', recipe: 'gaya Sinematik: komposisi berlapis gelap elegan, sorot cahaya golden hour (radial-gradient lembut), tipografi bersih lebar, gerak kamera lambat berwibawa.' },
  {
    id: 'faceless',
    name: 'Karakter Orang (Faceless)',
    category: 'Bawaan Studio',
    desc: 'Ilustrasi orang 2D tanpa wajah + lampu hangat & sinar jendela',
    thumb: 'styles/faceless.jpg',
    accent: '#f0b86e',
    hasCharacters: true,
    recipe: 'gaya Storytelling Karakter Orang 2D Faceless: gambar karakter manusia 2D proporsi kartun Indonesia dengan kepala oval warna kulit hangat (#ecc5a2) TANPA mata/hidung/mulut, outline gelap halus (#2b262c, strokeWidth 2.5-3.5), cel-shading lembut satu sisi, pakaian sehari-hari/hijab/koko/kasual sesuai konteks cerita, latar ruangan gelap melankolis-hangat (#3a3844) dengan lampu bohlam gantung warm glow (#ffe19c), jendela 4-panel dengan berkas cahaya miring (god-ray), bangku kayu/properti ruang sederhana, serta gerak hidup lewat pose tangan, anggukan kepala, dan napas halus.'
  }
];

let opuscarStyles = [];
try {
  opuscarStyles = JSON.parse(readFileSync(join(import.meta.dirname, 'opuscar-styles.json'), 'utf8'));
} catch {
  opuscarStyles = [];
}

export const STYLES_META = [...BUILTIN_STYLES, ...opuscarStyles];

export function estimateTokens(text) {
  return Math.max(1, Math.ceil(String(text || '').length / 4));
}

export function buildScriptPrompt({ idea, durationSec = 60, styleName = 'Kolase Kertas' }) {
  const words = Math.round(durationSec * 2.4);
  return [
    `Tulis naskah voice-over video Bahasa Indonesia (Target durasi: ${durationSec} detik / ±${words} kata, gaya visual ${styleName}).`,
    'Struktur: hook kuat di kalimat pertama, poin inti ringkas dengan kalimat pendek yang enak dibacakan TTS, dan penutup yang menancap.',
    'Balas HANYA teks narasi siap baca, tanpa judul, tanpa catatan pembuka/penutup, tanpa instruksi panggung.',
    '',
    `Ide: ${String(idea || '').trim()}`
  ].join('\n');
}

function formatSceneSpec(sc) {
  return [
    `### ${sc.componentName}.tsx (${sc.durationSec} detik${sc.dark ? ', tema gelap' : ''})`,
    `- Narasi: "${String(sc.narration || '').replace(/"/g, '\\"')}"`,
    `- Visual: ${sc.visual || sc.narration}`
  ].join('\n');
}

export function buildBatchPrompt(project, batchScenes, { batchNumber = 1, continuation = false, prevScene = null } = {}) {
  const st = STYLES_META.find((s) => s.id === project.style) || STYLES_META[0];
  const ratioText = project.ratio === '16:9' ? '1920x1080 (landscape 16:9)' : '1080x1920 (portrait 9:16)';
  const markers = batchScenes.map((sc) => `// ===== ${sc.componentName}.tsx =====\n// ...kode TSX...`).join('\n\n');
  const prevNote = prevScene
    ? `Scene sebelum ini (${prevScene.componentName}): ${prevScene.visual || prevScene.narration} (jaga kesinambungan, variasikan komposisi).`
    : 'Kelompok pembuka video: bangun kesan visual awal yang kuat.';
  const list = batchScenes.map(formatSceneSpec).join('\n\n');

  if (continuation && batchNumber > 1) {
    return [
      '(Jika baris "=== AKHIR PERINTAH ===" tidak ada di akhir, jawab hanya "PERINTAH TERPOTONG".)',
      `Lanjutkan di chat ini dengan kontrak Remotion TSX, MotionKit, rasio ${ratioText}, dan gaya "${st.name}" yang sama.`,
      `Tulis ${batchScenes.length} scene berikut (variasikan komposisi & arah gerak). ${prevNote}`,
      '',
      list,
      '',
      'Format: SATU blok ```tsx saja tanpa penjelasan, pisahkan persis:',
      '```tsx',
      markers,
      '```',
      '=== AKHIR PERINTAH ==='
    ].join('\n');
  }

  return [
    '(Perintah ini panjang dan diakhiri baris "=== AKHIR PERINTAH ===". Jika tidak ada di akhir, jawab hanya "PERINTAH TERPOTONG".)',
    `Role: Senior Motion Graphics Designer (Remotion + React + TypeScript + SVG/CSS), rasio ${ratioText} 30fps, gaya ${st.name}.`,
    '',
    '## Kontrak Remotion',
    '- Setiap scene adalah komponen mandiri: `export const SceneXX: React.FC<{ theme: StyleTheme }> = ({ theme }) => { ... }`.',
    '- Import yang diizinkan HANYA:',
    '  - `import React from "react";`',
    '  - `import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";`',
    '  - `import { KineticWords, PaperCard, SpringIn, TagPin } from "../components/MotionKit";`',
    '  - `import type { StyleTheme } from "../styles";`',
    '- Latar belakang (`StageBackdrop`), transisi antar scene, dan subtitle (`SubtitleOverlay`) SUDAH diurus engine. Jangan gambar ulang latar atau subtitle.',
    '- Sisakan ruang bawah aman untuk subtitle (`paddingBottom: height > width ? 260 : 140`).',
    st.id === 'faceless'
      ? '- WAJIB tampilkan karakter orang 2D faceless (kepala oval hangat #ecc5a2 TANPA mata/hidung/mulut, outline gelap halus #2b262c, ekspresi emosi lewat pose kepala, bahu, dan gerakan tangan/lengan yang hidup).'
      : st.hasCharacters
        ? `- Tampilkan karakter/figur SVG bergaya "${st.name}" yang ekspresif lewat pose tubuh dan gerak halus.`
        : '- TANPA karakter manusia & TANPA wajah (wujudkan aksi lewat objek SVG detail, kartu, grafik, dan tipografi kinetik).',
    '- Semua elemen masuk wajib memakai `spring()` / `SpringIn` / `KineticWords`, ditambah gerak hidup halus (`Math.sin((frame / fps) * ...)`). Variasikan komposisi tiap scene.',
    `- Resep gaya "${st.name}": ${st.recipe}`,
    '',
    '## Tugas',
    `Tulis kode TSX untuk ${batchScenes.length} scene berikut. ${prevNote}`,
    '',
    list,
    '',
    '## Format jawaban',
    'SATU blok ```tsx saja tanpa penjelasan/artifact, pisahkan persis:',
    '```tsx',
    markers,
    '```',
    '=== AKHIR PERINTAH ==='
  ].join('\n');
}

export function buildSingleScenePrompt(project, sc, { revisionNote = '' } = {}) {
  const st = STYLES_META.find((s) => s.id === project.style) || STYLES_META[0];
  const ratioText = project.ratio === '16:9' ? '1920x1080 (16:9)' : '1080x1920 (9:16)';
  return [
    `Tulis ulang/buat 1 komponen Remotion TSX \`export const ${sc.componentName}: React.FC<{ theme: StyleTheme }>\` (${ratioText}, 30fps, gaya ${st.name}).`,
    `Import hanya: react, remotion (AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig), ../components/MotionKit (KineticWords, PaperCard, SpringIn, TagPin), ../styles (StyleTheme).`,
    `Latar & subtitle sudah diurus engine; sisakan paddingBottom aman (${project.ratio === '16:9' ? '140px' : '260px'}). ${st.id === 'faceless' ? 'WAJIB gambar karakter orang 2D faceless (kepala oval tanpa mata/hidung/mulut, ekspresi lewat pose tubuh & tangan).' : st.hasCharacters ? `Tampilkan karakter/figur SVG bergaya ${st.name}.` : 'Tanpa manusia/wajah.'} Resep gaya: ${st.recipe}`,
    '',
    formatSceneSpec(sc),
    ...(revisionNote ? [`- Catatan revisi khusus: ${revisionNote}`] : []),
    '',
    'Balas HANYA satu blok ```tsx tanpa penjelasan.'
  ].join('\n');
}
