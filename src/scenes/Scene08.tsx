import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Scene08 · 5.91 s @ 30 fps · 1080x1920 · Comic History Cartoon (paper-cut)
export const SCENE08_FPS = 30;
export const SCENE08_DURATION = 177;
export const SCENE08_NARRATION = "Dan peristiwa ini sekarang dikenal sebagai Perang Inggris-Zanzibar.";

const clamp8 = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease8 = (
  f: number,
  [a, b]: [number, number],
  [c, d]: [number, number],
  e: (t: number) => number = Easing.out(Easing.cubic)
) => interpolate(f, [a, b], [c, d], { ...clamp8, easing: e });

const CUT8 = "drop-shadow(0px 8px 0px rgba(60,40,20,0.28))";
const SERIF8 = "'Playfair Display','Georgia',serif";
const SANS8 = "'Baloo 2','Arial Black',sans-serif";

export const durationInFrames8 = SCENE08_DURATION;

export function Scene08() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  // kamera: zoom-out perlahan dengan sedikit miring (beda dari pan Scene07)
  const zoom = ease8(f, [0, SCENE08_DURATION], [1.16, 1.0], Easing.out(Easing.quad));
  const tilt = ease8(f, [0, SCENE08_DURATION], [-1.6, 0], Easing.out(Easing.quad));
  const camY = ease8(f, [0, SCENE08_DURATION], [60, 0], Easing.out(Easing.quad));

  // buku sejarah terbuka: sampul jatuh dengan pegas
  const drop = spring({ frame: f - 4, fps, config: { damping: 12, stiffness: 100, mass: 0.9 } });
  const bookY = (1 - drop) * 1100;

  // halaman membuka
  const open = ease8(f, [24, 54], [0, 1], Easing.inOut(Easing.cubic));
  const pageScaleX = Math.max(0.02, open);

  // judul mengetik per huruf (reveal)
  const title = "PERANG INGGRIS-ZANZIBAR";
  const lines = ["PERANG", "INGGRIS-", "ZANZIBAR"];
  const lineReveal = (i: number) => ease8(f, [58 + i * 14, 74 + i * 14], [0, 1], Easing.out(Easing.back(2)));

  // stempel tahun & durasi
  const stamp = ease8(f, [104, 112], [3, 1], Easing.out(Easing.back(1.6)));
  const stampO = ease8(f, [104, 108], [0, 1], Easing.linear);

  // bendera kecil di sisi buku
  const wave = Math.sin(f / 4) * 10;
  const flagsIn = ease8(f, [40, 70], [0, 1], Easing.out(Easing.back(1.8)));

  // konfeti kertas
  const confetti = Array.from({ length: 18 }, (_, i) => {
    const t = f - (80 + i * 2);
    if (t < 0) return null;
    const x = 120 + ((i * 53) % 840) + Math.sin((t + i * 9) / 8) * 26;
    const y = -40 + t * (5 + (i % 4));
    const colors = ["#c8372d", "#3f7f86", "#c9a24a", "#fbf4e4"];
    return (
      <rect
        key={i}
        x={x}
        y={y}
        width={22}
        height={34}
        rx={4}
        fill={colors[i % 4]}
        stroke="#3a2f2a"
        strokeWidth={2}
        transform={`rotate(${t * 9 + i * 20} ${x} ${y})`}
        opacity={interpolate(y, [1500, 1920], [1, 0], clamp8)}
      />
    );
  });

  void title;

  return (
    <AbsoluteFill style={{ background: "#e6d3a3", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `translateY(${camY}px) scale(${zoom}) rotate(${tilt}deg)`,
          transformOrigin: "50% 55%",
        }}
      >
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          {/* latar rak/meja */}
          <rect width={1080} height={1920} fill="#d9c28a" />
          <rect x={0} y={0} width={1080} height={420} fill="#7fb6c9" />
          <path d="M0 400 Q 180 360 360 400 T 720 400 T 1080 390 V440 H0Z" fill="#a8d3df" />
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M${100 + i * 340} ${120 + (i % 2) * 90} q40 -22 80 0`}
              stroke="#d9eef3"
              strokeWidth={8}
              fill="none"
              strokeLinecap="round"
            />
          ))}
          <rect x={0} y={420} width={1080} height={1500} fill="#ead9ae" />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={0} y1={520 + i * 120} x2={1080} y2={520 + i * 120} stroke="#d9c28a" strokeWidth={3} />
          ))}

          {/* buku sejarah */}
          <g transform={`translate(540,${1020 + bookY})`} style={{ filter: CUT8 }}>
            {/* sampul belakang */}
            <rect x={-420} y={-560} width={840} height={1120} rx={22} fill="#7a2f2a" stroke="#4a1d1a" strokeWidth={6} />
            {/* halaman */}
            <g transform={`scale(${pageScaleX},1)`}>
              <rect x={-390} y={-530} width={780} height={1060} rx={14} fill="#fbf4e4" stroke="#b8ae96" strokeWidth={5} />
              {Array.from({ length: 9 }, (_, i) => (
                <line
                  key={i}
                  x1={-320}
                  y1={150 + i * 40}
                  x2={320}
                  y2={150 + i * 40}
                  stroke="#d9cfb4"
                  strokeWidth={4}
                  strokeLinecap="round"
                />
              ))}

              {/* ornamen atas */}
              <rect x={-330} y={-480} width={660} height={10} fill="#c9a24a" />
              <rect x={-330} y={-452} width={660} height={4} fill="#c9a24a" />

              {/* judul 3 baris */}
              {lines.map((t, i) => (
                <g key={t} transform={`translate(0,${-340 + i * 150}) scale(${lineReveal(i)})`} opacity={lineReveal(i)}>
                  <text
                    x={0}
                    y={0}
                    textAnchor="middle"
                    fontFamily={SANS8}
                    fontWeight={900}
                    fontSize={i === 2 ? 118 : 124}
                    fill={i === 1 ? "#c8372d" : "#1f1a17"}
                  >
                    {t}
                  </text>
                </g>
              ))}

              {/* garis pemisah */}
              <rect x={-250} y={90} width={500} height={8} rx={4} fill="#c9a24a" />
            </g>
            {/* punggung buku */}
            <rect x={-440} y={-560} width={40} height={1120} rx={14} fill="#4a1d1a" />
          </g>

          {/* dua bendera kecil mengapit buku */}
          <g transform={`translate(110,${1330 - flagsIn * 160})`} opacity={flagsIn} style={{ filter: CUT8 }}>
            <line x1={0} y1={0} x2={0} y2={300} stroke="#5a4636" strokeWidth={8} />
            <path d={`M0 0 h${150 + wave} q-16 38 0 76 h-${150 + wave}Z`} fill="#c8372d" stroke="#8a1f19" strokeWidth={4} />
            <path d={`M0 28 h${150 + wave} v20 h-${150 + wave}Z`} fill="#fbf4e4" />
          </g>
          <g transform={`translate(970,${1330 - flagsIn * 160}) scale(-1,1)`} opacity={flagsIn} style={{ filter: CUT8 }}>
            <line x1={0} y1={0} x2={0} y2={300} stroke="#5a4636" strokeWidth={8} />
            <path d={`M0 0 h${150 - wave} q-16 38 0 76 h-${150 - wave}Z`} fill="#3f7f86" stroke="#2a5a60" strokeWidth={4} />
            <circle cx={60} cy={38} r={16} fill="#fbf4e4" />
          </g>

          {/* konfeti */}
          {confetti}
        </svg>
      </AbsoluteFill>

      {/* label kertas atas */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 80,
          padding: "16px 30px",
          background: "#f4ecd8",
          border: "4px double #7a6a52",
          boxShadow: "0 8px 0 rgba(60,40,20,0.25)",
          transform: `translateX(${ease8(f, [10, 28], [-800, 0])}px) rotate(-1.5deg)`,
        }}
      >
        <div style={{ fontFamily: SERIF8, fontWeight: 800, fontSize: 76, color: "#2a211b", lineHeight: 1 }}>
          1896
        </div>
        <div style={{ fontFamily: SERIF8, fontStyle: "italic", fontSize: 34, color: "#4a3d31", marginTop: 6 }}>
          Catatan sejarah
        </div>
      </div>

      {/* stempel */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1500,
          textAlign: "center",
          opacity: stampO,
          transform: `scale(${stamp}) rotate(-10deg)`,
        }}
      >
        <span
          style={{
            fontFamily: SANS8,
            fontWeight: 900,
            fontSize: 74,
            color: "#c8372d",
            border: "8px solid #c8372d",
            borderRadius: 16,
            padding: "6px 30px",
            background: "rgba(251,244,228,0.9)",
            letterSpacing: 4,
          }}
        >
          38 MENIT
        </span>
      </div>

      {/* keterangan bawah */}
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 90,
          textAlign: "center",
          fontFamily: SERIF8,
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 46,
          color: "#2a211b",
          background: "#f4ecd8",
          padding: "16px 24px",
          boxShadow: "0 8px 0 rgba(60,40,20,0.25)",
          opacity: ease8(f, [124, 142], [0, 1]),
          transform: `translateY(${ease8(f, [124, 142], [40, 0])}px) rotate(1deg)`,
        }}
      >
        Perang terpendek dalam sejarah
      </div>
    </AbsoluteFill>
  );
}

export default Scene08;