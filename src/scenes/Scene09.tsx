import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Scene09 · 3.13 s @ 30 fps · 1080x1920 · Comic History Cartoon (paper-cut) · tema gelap
export const SCENE09_FPS = 30;
export const SCENE09_DURATION = 94;
export const SCENE09_NARRATION = "Ternyata sejarah bisa seaneh itu, ya?";

const clamp9 = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease9 = (
  f: number,
  [a, b]: [number, number],
  [c, d]: [number, number],
  e: (t: number) => number = Easing.out(Easing.cubic)
) => interpolate(f, [a, b], [c, d], { ...clamp9, easing: e });

const CUT9 = "drop-shadow(0px 8px 0px rgba(0,0,0,0.45))";
const SERIF9 = "'Playfair Display','Georgia',serif";
const SANS9 = "'Baloo 2','Arial Black',sans-serif";

export const durationInFrames9 = SCENE09_DURATION;

export const Scene09 = function Scene09() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  // kamera: pull-out dari bawah ke atas dengan sedikit miring (beda dari Scene08)
  const zoom = ease9(f, [0, SCENE09_DURATION], [1.18, 1.0], Easing.out(Easing.cubic));
  const camY = ease9(f, [0, SCENE09_DURATION], [-90, 0], Easing.out(Easing.cubic));
  const tilt = ease9(f, [0, SCENE09_DURATION], [1.4, 0], Easing.out(Easing.cubic));

  // buku sejarah merosot ke bawah (transisi dari Scene08), tertinggal sebagian
  const bookSlide = ease9(f, [0, 30], [0, 1], Easing.in(Easing.quad));

  // tokoh kartun bingung masuk dari kanan dengan pegas
  const enter = spring({ frame: f - 8, fps, config: { damping: 12, stiffness: 120, mass: 0.8 } });
  const charX = (1 - enter) * 700;
  const shrugBob = Math.sin(f / 5) * 6;
  const shrug = ease9(f, [30, 44], [0, 1], Easing.out(Easing.back(2)));

  // tanda tanya berjatuhan / mengambang
  const marks = Array.from({ length: 7 }, (_, i) => {
    const t = f - (16 + i * 5);
    if (t < 0) return null;
    const pop = ease9(t, [0, 10], [0, 1], Easing.out(Easing.back(2.4)));
    const x = 140 + ((i * 151) % 800);
    const baseY = 420 + ((i * 197) % 700);
    const y = baseY - t * 1.6 + Math.sin((t + i * 7) / 7) * 14;
    const colors = ["#e8c25a", "#e87a6a", "#7fc4cf"];
    return (
      <text
        key={i}
        x={x}
        y={y}
        textAnchor="middle"
        fontFamily={SANS9}
        fontWeight={900}
        fontSize={96 + (i % 3) * 30}
        fill={colors[i % 3]}
        opacity={pop * 0.9}
        transform={`rotate(${(i % 2 ? 12 : -12) + Math.sin(t / 6) * 6} ${x} ${y}) scale(${pop})`}
        style={{ transformOrigin: `${x}px ${y}px` }}
      >
        ?
      </text>
    );
  });

  // balon ucapan
  const bubble = ease9(f, [40, 54], [0, 1], Easing.out(Easing.back(2.2)));

  // bintang latar berkelip
  const stars = Array.from({ length: 22 }, (_, i) => {
    const x = (i * 97 + 40) % 1040;
    const y = (i * 181 + 60) % 900;
    const tw = 0.35 + 0.65 * Math.abs(Math.sin((f + i * 11) / 12));
    return <circle key={i} cx={x} cy={y} r={3 + (i % 3)} fill="#f4e7c8" opacity={tw * 0.7} />;
  });

  return (
    <AbsoluteFill style={{ background: "#14182b", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `translateY(${camY}px) scale(${zoom}) rotate(${tilt}deg)`,
          transformOrigin: "50% 60%",
        }}
      >
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          {/* langit malam */}
          <rect width={1080} height={1920} fill="#14182b" />
          <rect y={900} width={1080} height={1020} fill="#1d2340" />
          {stars}

          {/* bulan kertas */}
          <g transform="translate(850,260)" style={{ filter: CUT9 }}>
            <circle r={120} fill="#f1e3c2" />
            <circle cx={-34} cy={-24} r={22} fill="#d9c9a0" />
            <circle cx={40} cy={34} r={30} fill="#d9c9a0" />
            <circle cx={22} cy={-56} r={14} fill="#d9c9a0" />
          </g>

          {/* siluet bukit kertas */}
          <path d="M0 1260 Q 200 1160 420 1240 T 820 1220 T 1080 1250 V1920 H0Z" fill="#262d52" />
          <path d="M0 1420 Q 260 1340 540 1410 T 1080 1390 V1920 H0Z" fill="#2f3763" />

          {/* buku sejarah tertutup, merosot di kiri bawah */}
          <g
            transform={`translate(260,${1500 + bookSlide * 320}) rotate(-8)`}
            style={{ filter: CUT9 }}
          >
            <rect x={-200} y={-250} width={400} height={500} rx={18} fill="#7a2f2a" stroke="#4a1d1a" strokeWidth={6} />
            <rect x={-200} y={-250} width={34} height={500} rx={12} fill="#4a1d1a" />
            <rect x={-130} y={-170} width={280} height={8} fill="#c9a24a" />
            <text x={10} y={-40} textAnchor="middle" fontFamily={SANS9} fontWeight={900} fontSize={64} fill="#f1e3c2">
              SEJARAH
            </text>
            <rect x={-130} y={30} width={280} height={8} fill="#c9a24a" />
          </g>

          {/* tokoh kartun bingung (potongan kertas) */}
          <g transform={`translate(${640 + charX},${1180 + shrugBob})`} style={{ filter: CUT9 }}>
            {/* kaki */}
            <rect x={-60} y={250} width={40} height={120} rx={14} fill="#1f1a17" />
            <rect x={20} y={250} width={40} height={120} rx={14} fill="#1f1a17" />
            <rect x={-84} y={346} width={72} height={30} rx={14} fill="#0f0c0b" />
            <rect x={12} y={346} width={72} height={30} rx={14} fill="#0f0c0b" />
            {/* badan: jas biru dengan selempang */}
            <rect x={-100} y={20} width={200} height={250} rx={30} fill="#27406b" stroke="#142544" strokeWidth={5} />
            <rect x={-60} y={30} width={120} height={230} rx={20} fill="#f1ead8" />
            <path d="M-90 30 L40 30 L90 260 L-10 260Z" fill="#bf3b36" opacity={0.9} />
            {[70, 120, 170, 220].map((y) => (
              <circle key={y} cx={0} cy={y} r={8} fill="#c9a24a" />
            ))}
            {/* lengan: mengangkat bahu */}
            <g transform={`translate(-100,60) rotate(${-30 * shrug})`}>
              <rect x={-30} y={0} width={44} height={150} rx={20} fill="#27406b" stroke="#142544" strokeWidth={5} />
              <circle cx={-8} cy={160} r={26} fill="#f1ead8" />
            </g>
            <g transform={`translate(100,60) rotate(${30 * shrug})`}>
              <rect x={-14} y={0} width={44} height={150} rx={20} fill="#27406b" stroke="#142544" strokeWidth={5} />
              <circle cx={8} cy={160} r={26} fill="#f1ead8" />
            </g>
            {/* kepala */}
            <circle cx={0} cy={-80} r={92} fill="#e8b88a" />
            <circle cx={-50} cy={-56} r={18} fill="#e98b7a" opacity={0.7} />
            <circle cx={50} cy={-56} r={18} fill="#e98b7a" opacity={0.7} />
            {/* mata melebar */}
            <circle cx={-32} cy={-92} r={16} fill="#fbf4e4" stroke="#2a1d18" strokeWidth={4} />
            <circle cx={32} cy={-92} r={16} fill="#fbf4e4" stroke="#2a1d18" strokeWidth={4} />
            <circle cx={-28 + Math.sin(f / 6) * 4} cy={-90} r={7} fill="#2a1d18" />
            <circle cx={36 + Math.sin(f / 6) * 4} cy={-90} r={7} fill="#2a1d18" />
            {/* alis miring bingung */}
            <path d="M-52 -126 L-14 -114" stroke="#2a1d18" strokeWidth={7} strokeLinecap="round" />
            <path d="M14 -120 L52 -134" stroke="#2a1d18" strokeWidth={7} strokeLinecap="round" />
            {/* mulut miring */}
            <path d="M-26 -34 Q 0 -52 28 -30" stroke="#5a2a22" strokeWidth={7} fill="none" strokeLinecap="round" />
            {/* topi bicorne */}
            <path d="M-130 -150 Q 0 -250 130 -150 Q 0 -190 -130 -150Z" fill="#14182b" stroke="#c9a24a" strokeWidth={6} />
            <circle cx={0} cy={-180} r={22} fill="#bf3b36" stroke="#fbf4e4" strokeWidth={6} />
          </g>

          {/* tanda tanya */}
          {marks}

          {/* balon ucapan */}
          <g transform={`translate(80,560) scale(${bubble})`} style={{ transformOrigin: "300px 120px", filter: CUT9 }}>
            <path
              d="M40 0 H560 a40 40 0 0 1 40 40 V220 a40 40 0 0 1 -40 40 H420 L520 340 L330 260 H40 a40 40 0 0 1 -40 -40 V40 a40 40 0 0 1 40 -40Z"
              fill="#fbf4e4"
              stroke="#e8c25a"
              strokeWidth={6}
            />
            <text x={300} y={112} textAnchor="middle" fontFamily={SANS9} fontWeight={900} fontSize={84} fill="#1f1a17">
              SEANEH
            </text>
            <text x={300} y={206} textAnchor="middle" fontFamily={SANS9} fontWeight={900} fontSize={84} fill="#c8372d">
              ITU, YA?
            </text>
          </g>
        </svg>
      </AbsoluteFill>

      {/* label kertas atas (di luar kamera) */}
      <div
        style={{
          position: "absolute",
          right: 60,
          top: 90,
          padding: "14px 28px",
          background: "#2a2f55",
          border: "4px double #e8c25a",
          boxShadow: "0 8px 0 rgba(0,0,0,0.4)",
          transform: `translateX(${ease9(f, [4, 20], [700, 0])}px) rotate(2deg)`,
        }}
      >
        <div style={{ fontFamily: SERIF9, fontStyle: "italic", fontWeight: 700, fontSize: 42, color: "#f1e3c2" }}>
          Fakta unik sejarah
        </div>
      </div>

      {/* keterangan bawah */}
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 100,
          textAlign: "center",
          fontFamily: SERIF9,
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 52,
          color: "#f1e3c2",
          background: "#2a2f55",
          border: "3px solid #e8c25a",
          padding: "18px 24px",
          boxShadow: "0 8px 0 rgba(0,0,0,0.4)",
          opacity: ease9(f, [56, 72], [0, 1]),
          transform: `translateY(${ease9(f, [56, 72], [40, 0])}px) rotate(-1deg)`,
        }}
      >
        Sejarah memang penuh kejutan
      </div>
    </AbsoluteFill>
  );
}