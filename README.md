# Remotion Motion Studio (Lokal)

Aplikasi lokal berbasis **Remotion + Web Studio UI** untuk membuat video motion graphics berbasis React/TSX bersama ChatGPT, Claude, atau Gemini, dengan preview timeline di browser dan export MP4 standar (H.264 + AAC, 30 fps, `faststart`).

## Cara Menjalankan (Web Studio UI)

```powershell
cd E:\remotion
npm run studio
```

Lalu buka **`http://127.0.0.1:4100`** di browser Anda.

### Alur 4 Tahap di Web Studio UI

1. **Proyek & Gaya:** Buat/pilih proyek, atur rasio (`9:16` Vertikal atau `16:9` Horizontal), pilih 1 dari 9 gaya visual (`flat`, `doodle`, `stickman`, `paper`, `watercolor`, `anime`, `editorial`, `noir`, `infographic`), dan unduh gambar referensi gaya jika ingin dilampirkan ke Claude.
2. **Naskah & Audio:** Tulis atau tempel naskah (tersedia prompt bantuan untuk ChatGPT/Claude/Gemini), bagi naskah ke scene secara otomatis, unggah/drag-drop/tempel file Voice Over (`MP3/WAV/M4A`), klik **Auto-Sync Durasi ke Audio** (deteksi jeda via `ffmpeg silencedetect`), serta tambahkan BGM/ambience opsional dengan auto-ducking.
3. **Scene & Kode AI:**
   - **Mode Per Batch:** Salin prompt hemat token (Batch 1 ringkas, Batch 2+ mode lanjutan `< 300` token) lalu tempel hasil TSX berbatas `// ===== Scene01.tsx =====` sekaligus.
   - **Mode Per Scene:** Pilih scene tertentu, salin prompt 1 scene, tempel/edit kode TSX langsung, atau kembalikan ke versi sebelumnya (backup 1 langkah).
   - Setiap kode divalidasi otomatis dengan `esbuild` + whitelist import sebelum ditulis ke `src/scenes/`.
4. **Preview & Render:** Sinkronkan proyek ke Remotion, buka **Remotion Studio** (`http://localhost:3000`) untuk scrub frame-by-frame, atau klik **Render MP4** dengan progress bar live, verifikasi metadata `ffprobe`, preview video langsung, dan tombol unduh.

## Perintah CLI Tambahan

```powershell
# Jalankan Web Studio UI (http://127.0.0.1:4100)
npm run studio

# Jalankan Remotion Studio secara langsung (http://localhost:3000)
npm run dev

# Render MP4 langsung dari CLI
npm run render:9x16
npm run render:16x9

# Jalankan tes otomatis & pengecekan tipe
npm test
npm run typecheck
npm run build
```

Hasil video tersimpan di `E:\remotion\out\` dan data proyek tersimpan di `E:\remotion\projects\`.
