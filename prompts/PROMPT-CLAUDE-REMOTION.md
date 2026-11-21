# Prompt Hemat Token untuk Claude (Remotion TSX)

## Batch 1 (Tempel di chat Claude baru)

```text
Role: Senior Motion Graphics Designer (Remotion + React + TypeScript + SVG/CSS).
Tulis komponen React/TSX untuk 2 scene berikut yang akan dipasang di proyek Remotion 30fps.

## Kontrak
- Setiap scene adalah file komponen mandiri: `export const SceneXX: React.FC<{ theme: StyleTheme }> = ({ theme }) => { ... }`.
- Import yang tersedia:
  - `import React from 'react';`
  - `import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';`
  - `import { KineticWords, PaperCard, SpringIn, TagPin } from '../components/MotionKit';`
  - `import type { StyleTheme } from '../styles';`
- Gunakan `isPortrait = height > width` agar rapi di 1080x1920 maupun 1920x1080.
- Latar belakang (`StageBackdrop`), transisi antar scene, dan subtitle (`SubtitleOverlay`) SUDAH diurus engine. Jangan gambar ulang latar atau subtitle.
- Sisakan ruang bawah aman untuk subtitle (`paddingBottom: isPortrait ? 260 : 140`).
- TANPA karakter manusia & TANPA wajah (wujudkan aksi lewat objek SVG, kartu, grafik, dan tipografi kinetik).
- Semua gerak masuk wajib memakai `spring()` atau `SpringIn` / `KineticWords`, ditambah gerak hidup halus (`Math.sin((frame / fps) * ...)`).

## Gaya aktif
[GANTI SESUAI GAYA: mis. Kolase Kertas / Clay 3D / White Catalog / Visual Journalism / Cartoon Stage]

## Daftar Scene
### Scene01 (5.0 detik)
- Narasi: "[tulis narasi scene 1]"
- Visual: "[tulis benda/aksi konkret scene 1]"

### Scene02 (4.5 detik)
- Narasi: "[tulis narasi scene 2]"
- Visual: "[tulis benda/aksi konkret scene 2]"

## Format Jawaban
Tulis kode TSX rapi dipisahkan komentar `// ===== Scene01.tsx =====` dan `// ===== Scene02.tsx =====` tanpa penjelasan panjang.
```

## Batch 2+ (Tempel di chat Claude yang SAMA agar hemat token)

```text
Lanjutkan di chat ini dengan kontrak, MotionKit, dan gaya yang sama. Variasikan komposisi dan arah gerak.

### Scene03 (5.0 detik)
- Narasi: "[narasi scene 3]"
- Visual: "[visual scene 3]"

### Scene04 (4.5 detik)
- Narasi: "[narasi scene 4]"
- Visual: "[visual scene 4]"

Format: hanya kode TSX dengan penanda `// ===== Scene03.tsx =====` dan `// ===== Scene04.tsx =====`.
```
