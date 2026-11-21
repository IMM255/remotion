import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { KineticWords, PaperCard, SpringIn, TagPin } from "../components/MotionKit";
import type { StyleTheme } from "../styles";

const SKIN = "#ecc5a2";
const LINE = "#2b262c";

const Thinker: React.FC<{
  x: number;
  shirt: string;
  frame: number;
  fps: number;
  delay: number;
  shrug: number;
  tilt: number;
}> = ({ x, shirt, frame, fps, delay, shrug, tilt }) => {
  const enter = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 110 } });
  const breathe = Math.sin((frame / fps) * 2 + delay) * 3;
  const nod = Math.sin((frame / fps) * 1.6 + delay) * 3 + tilt;
  const arm = Math.sin((frame / fps) * 2.6 + delay) * 5;
  return (
    <g transform={`translate(${x} ${(1 - enter) * 110})`} opacity={enter}>
      <rect x={-40} y={420} width={34} height={150} rx={14} fill="#3b4258" stroke={LINE} strokeWidth={3} />
      <rect x={6} y={420} width={34} height={150} rx={14} fill="#3b4258" stroke={LINE} strokeWidth={3} />
      <g transform={`translate(0 ${breathe * 0.4})`}>
        <path d="M-80 250 Q-88 215 -44 207 L44 207 Q88 215 80 250 L72 430 L-72 430 Z" fill={shirt} stroke={LINE} strokeWidth={3} />
        <path d="M28 215 Q64 232 62 425 L72 430 L80 250 Q88 215 44 207 Z" fill="rgba(0,0,0,0.18)" />
        <g transform={`rotate(${25 + shrug + arm} -66 240)`}>
          <rect x={-96} y={232} width={30} height={130} rx={15} fill={shirt} stroke={LINE} strokeWidth={3} />
          <circle cx={-82} cy={372} r={17} fill={SKIN} stroke={LINE} strokeWidth={3} />
        </g>
        <g transform={`rotate(${-25 - shrug - arm} 66 240)`}>
          <rect x={66} y={232} width={30} height={130} rx={15} fill={shirt} stroke={LINE} strokeWidth={3} />
          <circle cx={82} cy={372} r={17} fill={SKIN} stroke={LINE} strokeWidth={3} />
        </g>
        <rect x={-14} y={185} width={28} height={30} rx={9} fill={SKIN} stroke={LINE} strokeWidth={3} />
        <g transform={`translate(0 ${breathe * 0.5}) rotate(${nod} 0 190)`}>
          <ellipse cx={0} cy={125} rx={54} ry={68} fill={SKIN} stroke={LINE} strokeWidth={3} />
          <path d="M18 62 Q56 92 46 150 Q36 178 18 186 Q44 130 18 62 Z" fill="rgba(0,0,0,0.1)" />
          <path d="M-54 108 Q-60 52 0 54 Q60 52 54 108 Q36 78 0 80 Q-36 78 -54 108 Z" fill="#2b262c" />
        </g>
      </g>
    </g>
  );
};

export const Scene04: React.FC<{ theme: StyleTheme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const pb = height > width ? 260 : 140;

  const word = spring({ frame: frame - 6, fps, config: { damping: 11, stiffness: 120 } });
  const bob = Math.sin((frame / fps) * 2) * 6;

  const bubbles = [
    { x: 190, label: "2 menit", color: "#7fc8a9", delay: 30 },
    { x: 480, label: "30 menit", color: "#f0b86e", delay: 50 },
    { x: 770, label: "sejam+", color: "#e57b7b", delay: 70 },
  ];

  return (
    <AbsoluteFill style={{ paddingBottom: pb, paddingTop: 80, paddingLeft: 50, paddingRight: 50, alignItems: "center" }}>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <div style={{ transform: `scale(${word}) translateY(${bob}px)` }}>
          <PaperCard theme={theme}>
            <div style={{ fontSize: 88, fontWeight: 900, textAlign: "center", letterSpacing: 2 }}>
              “Sebentar”
            </div>
          </PaperCard>
        </div>

        <SpringIn delay={14}>
          <div style={{ fontSize: 44, fontWeight: 800, textAlign: "center", lineHeight: 1.25, color: "#fff6e4", maxWidth: 940 }}>
            <KineticWords text="Artinya beda banget buat setiap orang" />
          </div>
        </SpringIn>

        <svg width={980} height={820} viewBox="0 0 980 820" style={{ overflow: "visible" }}>
          <ellipse cx={490} cy={780} rx={420} ry={24} fill="rgba(0,0,0,0.35)" />

          {bubbles.map((b, i) => {
            const pop = spring({ frame: frame - b.delay, fps, config: { damping: 12, stiffness: 130 } });
            const float = Math.sin((frame / fps) * 2 + i) * 8;
            return (
              <g key={i} transform={`translate(${b.x} ${90 + float}) scale(${pop})`}>
                <rect x={-120} y={-52} width={240} height={104} rx={34} fill="#fff6e4" stroke={LINE} strokeWidth={3} />
                <path d="M-14 52 L0 82 L16 52 Z" fill="#fff6e4" stroke={LINE} strokeWidth={3} />
                <circle cx={-80} cy={0} r={14} fill={b.color} stroke={LINE} strokeWidth={2.5} />
                <text x={14} y={12} textAnchor="middle" fontSize={36} fontWeight={800} fill={LINE}>
                  {b.label}
                </text>
              </g>
            );
          })}

          <g transform="translate(0 150)">
            <Thinker x={190} shirt="#5aa38a" frame={frame} fps={fps} delay={20} shrug={10} tilt={-3} />
            <Thinker x={490} shirt="#d49a4a" frame={frame} fps={fps} delay={40} shrug={22} tilt={4} />
            <Thinker x={790} shirt="#b5566b" frame={frame} fps={fps} delay={60} shrug={36} tilt={-6} />
          </g>

          {/* question marks */}
          {[0, 1, 2].map((i) => {
            const q = spring({ frame: frame - (110 + i * 10), fps, config: { damping: 10 } });
            return (
              <text
                key={i}
                x={150 + i * 300}
                y={210 + Math.sin((frame / fps) * 3 + i) * 6}
                fontSize={60}
                fontWeight={900}
                fill="#ffe19c"
                opacity={q}
                transform={`translate(${i * 0} 0) scale(${q})`}
                style={{ transformOrigin: `${150 + i * 300}px 210px` }}
              >
                ?
              </text>
            );
          })}
        </svg>

        <SpringIn delay={140}>
          <PaperCard theme={theme}>
            <div style={{ fontSize: 46, fontWeight: 800, textAlign: "center", lineHeight: 1.25 }}>
              <KineticWords text="Kenapa sih kita sering bilang sebentar, padahal masih lama?" />
            </div>
          </PaperCard>
        </SpringIn>
      </div>
    </AbsoluteFill>
  );
};