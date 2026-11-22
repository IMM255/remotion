import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Scene06 · 4.65 s @ 30 fps · 1080x1920 · Comic History Cartoon (paper-cut)
export const SCENE06_FPS = 30;
export const SCENE06_DURATION = 140;
export const SCENE06_NARRATION = "Sekitar 38 menit kemudian, pertempuran berakhir.";

const clamp6 = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease6 = (
  f: number,
  [a, b]: [number, number],
  [c, d]: [number, number],
  e: (t: number) => number = Easing.out(Easing.cubic)
) => interpolate(f, [a, b], [c, d], { ...clamp6, easing: e });

const CUT6 = "drop-shadow(0px 8px 0px rgba(60,40,20,0.28))";
const SERIF6 = "'Playfair Display','Georgia',serif";
const SANS6 = "'Baloo 2','Arial Black',sans-serif";

const arc = (cx: number, cy: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  const x = cx + r * Math.cos(rad);
  const y = cy + r * Math.sin(rad);
  return `M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${deg > 180 ? 1 : 0} 1 ${x} ${y} Z`;
};

export const durationInFrames6 = SCENE06_DURATION;

export function Scene06() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  // kamera: tilt dari bawah ke atas (beda dari Scene05 yang push-in diagonal)
  const camY = ease6(f, [0, SCENE06_DURATION], [-60, 40], Easing.inOut(Easing.quad));
  const camZoom = ease6(f, [0, SCENE06_DURATION], [1.08, 1.0], Easing.out(Easing.quad));

  // stopwatch jatuh dari atas dengan pantulan
  const drop = spring({ frame: f - 6, fps, config: { damping: 11, stiffness: 110, mass: 0.8 } });
  const swY = (1 - drop) * -900;

  // jarum 0 -> 38 menit (228 derajat)
  const deg = ease6(f, [22, 100], [0, 228], Easing.inOut(Easing.quad));
  const minutes = Math.round(deg / 6);

  // kapal menjauh ke kiri, tanpa tembakan
  const shipX = ease6(f, [0, SCENE06_DURATION], [620, 80], Easing.inOut(Easing.quad));
  const shipBob = Math.sin(f / 10) * 7;

  // bendera putih naik
  const flagUp = ease6(f, [70, 112], [0, 1], Easing.out(Easing.cubic));
  const wave = Math.sin(f / 4) * 8;

  // stempel
  const stamp = ease6(f, [104, 112], [3, 1], Easing.out(Easing.back(1.6)));
  const stampO = ease6(f, [104, 108], [0, 1], Easing.linear);

  const ticks = Array.from({ length: 12 }, (_, i) => i * 30);

  return (
    <AbsoluteFill style={{ background: "#e6d3a3", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateY(${camY}px) scale(${camZoom})`, transformOrigin: "50% 50%" }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          {/* laut */}
          <rect width={1080} height={1050} fill="#7fb6c9" />
          <path d="M0 1000 Q 150 960 320 1000 T 660 1000 T 1080 990 V1060 H0Z" fill="#a8d3df" />
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`M${80 + i * 210} ${160 + (i % 2) * 220} q40 -22 80 0`}
              stroke="#d9eef3"
              strokeWidth={8}
              fill="none"
              strokeLinecap="round"
            />
          ))}

          {/* kapal Inggris menjauh */}
          <g transform={`translate(${shipX},${250 + shipBob})`} style={{ filter: CUT6 }}>
            <path d="M0 120 H300 L270 175 H35 Z" fill="#40485a" />
            <rect x={30} y={75} width={240} height={50} fill="#d8d4c8" stroke="#a9a493" strokeWidth={3} />
            <rect x={80} y={20} width={44} height={58} fill="#c9552e" />
            <rect x={160} y={20} width={44} height={58} fill="#c9552e" />
            <rect x={-30} y={96} width={90} height={14} rx={7} fill="#2d3340" />
            <circle cx={102} cy={-10} r={ease6(f, [0, 90], [22, 40])} fill="#8a847e" opacity={ease6(f, [0, 90], [0.8, 0.2])} />
          </g>

          {/* daratan + istana rusak */}
          <path d="M0 1050 Q 260 1010 540 1040 T 1080 1030 V1920 H0Z" fill="#ead9ae" />
          <path d="M0 1560 H1080 V1920 H0Z" fill="#d9c28a" />

          <g transform="translate(240,1290)" style={{ filter: CUT6 }}>
            <rect x={80} y={90} width={420} height={250} fill="#f4e7c8" stroke="#c9b385" strokeWidth={5} />
            <rect x={0} y={150} width={110} height={190} fill="#f1e3c2" stroke="#c9b385" strokeWidth={5} />
            <path d="M470 340 V190 L520 160 L560 230 L600 200 V340Z" fill="#f1e3c2" stroke="#c9b385" strokeWidth={5} />
            <circle cx={200} cy={190} r={42} fill="#4a3a30" />
            <circle cx={380} cy={160} r={30} fill="#4a3a30" />
            <path d="M250 340 v-70 a40 40 0 0 1 80 0 v70Z" fill="#5a4636" />
            {/* tiang & bendera putih */}
            <line x1={290} y1={90} x2={290} y2={-110} stroke="#5a4636" strokeWidth={7} />
            <g transform={`translate(0,${(1 - flagUp) * 150})`}>
              <path
                d={`M290 -110 h${110 + wave} q-14 30 0 60 h-${110 + wave}Z`}
                fill="#fbf7ee"
                stroke="#b8ae96"
                strokeWidth={4}
              />
            </g>
          </g>

          {/* asap tipis dari reruntuhan */}
          {[0, 1, 2].map((i) => {
            const t = (f * 1.2 + i * 40) % 120;
            return (
              <circle
                key={i}
                cx={330 + i * 130 + Math.sin(t / 12) * 14}
                cy={1380 - t * 2.2}
                r={26 + t * 0.35}
                fill="#7d7570"
                opacity={interpolate(t, [0, 20, 120], [0, 0.55, 0], clamp6)}
              />
            );
          })}

          {/* stopwatch */}
          <g transform={`translate(540,${1000 + swY - 120})`} style={{ filter: CUT6 }}>
            <rect x={-30} y={-380} width={60} height={50} rx={12} fill="#c9a24a" />
            <rect x={-60} y={-410} width={120} height={36} rx={14} fill="#b58a32" />
            <circle r={310} fill="#c9a24a" />
            <circle r={280} fill="#fbf4e4" stroke="#8a6d2a" strokeWidth={6} />
            {deg > 0 && <path d={arc(0, 0, 250, deg)} fill="#c8372d" opacity={0.85} />}
            {ticks.map((a) => (
              <line
                key={a}
                x1={0}
                y1={-262}
                x2={0}
                y2={a % 90 === 0 ? -210 : -232}
                stroke="#2a211b"
                strokeWidth={a % 90 === 0 ? 10 : 6}
                strokeLinecap="round"
                transform={`rotate(${a})`}
              />
            ))}
            <g transform={`rotate(${deg})`}>
              <line x1={0} y1={30} x2={0} y2={-240} stroke="#1f1a17" strokeWidth={12} strokeLinecap="round" />
              <circle r={22} fill="#1f1a17" />
            </g>
          </g>
        </svg>
      </AbsoluteFill>

      {/* angka menit */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 130,
          textAlign: "center",
          transform: `translateY(${ease6(f, [0, 16], [-120, 0])}px)`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: "#f4ecd8",
            border: "4px double #7a6a52",
            boxShadow: "0 8px 0 rgba(60,40,20,0.25)",
            padding: "14px 44px",
            transform: "rotate(-1.5deg)",
          }}
        >
          <span style={{ fontFamily: SANS6, fontWeight: 900, fontSize: 150, color: "#c8372d", lineHeight: 1 }}>
            {minutes}
          </span>
          <span style={{ fontFamily: SERIF6, fontStyle: "italic", fontWeight: 700, fontSize: 52, color: "#2a211b", marginLeft: 16 }}>
            menit
          </span>
        </div>
      </div>

      {/* stempel SELESAI */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 940,
          textAlign: "center",
          opacity: stampO,
          transform: `scale(${stamp}) rotate(-12deg)`,
        }}
      >
        <span
          style={{
            fontFamily: SANS6,
            fontWeight: 900,
            fontSize: 150,
            color: "#c8372d",
            border: "10px solid #c8372d",
            borderRadius: 18,
            padding: "0 36px",
            background: "rgba(251,244,228,0.88)",
            letterSpacing: 6,
          }}
        >
          SELESAI
        </span>
      </div>

      {/* keterangan bawah */}
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 100,
          textAlign: "center",
          fontFamily: SERIF6,
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 50,
          color: "#2a211b",
          background: "#f4ecd8",
          padding: "18px 24px",
          boxShadow: "0 8px 0 rgba(60,40,20,0.25)",
          opacity: ease6(f, [96, 114], [0, 1]),
          transform: `translateY(${ease6(f, [96, 114], [40, 0])}px) rotate(-1deg)`,
        }}
      >
        Pertempuran berakhir · 27 Agustus 1896
      </div>
    </AbsoluteFill>
  );
}

export default Scene06;