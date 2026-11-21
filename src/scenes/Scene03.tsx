import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { KineticWords, PaperCard, SpringIn, TagPin } from "../components/MotionKit";
import type { StyleTheme } from "../styles";

const SKIN = "#ecc5a2";
const LINE = "#2b262c";

export const Scene03: React.FC<{ theme: StyleTheme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const pb = height > width ? 260 : 140;

  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const breathe = Math.sin((frame / fps) * 1.6) * 4;
  const stretch = spring({ frame: frame - 10, fps, config: { damping: 8, stiffness: 90 } });
  const zFloat = (i: number) => ((frame / fps) * 0.8 + i * 0.33) % 1;
  const mirrorIn = spring({ frame: frame - 90, fps, config: { damping: 13, stiffness: 110 } });
  const wobble = Math.sin((frame / fps) * 5) * 3;

  return (
    <AbsoluteFill style={{ paddingBottom: pb, paddingTop: 80, paddingLeft: 60, paddingRight: 60, alignItems: "center" }}>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <SpringIn delay={0}>
          <PaperCard theme={theme}>
            <div style={{ fontSize: 58, fontWeight: 900, textAlign: "center", lineHeight: 1.2 }}>
              <KineticWords text="baru bangun tidur!" />
            </div>
          </PaperCard>
        </SpringIn>

        <svg width={960} height={880} viewBox="0 0 960 880" style={{ overflow: "visible" }}>
          <ellipse cx={480} cy={830} rx={400} ry={26} fill="rgba(0,0,0,0.35)" />

          {/* bed */}
          <g transform={`translate(0 ${(1 - enter) * 100})`} opacity={enter}>
            <rect x={90} y={620} width={560} height={160} rx={22} fill="#6b4f3a" stroke={LINE} strokeWidth={3} />
            <rect x={110} y={560} width={520} height={90} rx={26} fill="#8aa6c4" stroke={LINE} strokeWidth={3} />
            <rect x={120} y={535} width={130} height={60} rx={26} fill="#f2e6d0" stroke={LINE} strokeWidth={3} />
            <path d="M270 570 Q380 540 500 574 Q580 560 630 590 L630 650 L270 650 Z" fill="#6d8fb3" stroke={LINE} strokeWidth={3} />
          </g>

          {/* sleepy person sitting up, stretching */}
          <g transform={`translate(270 ${430 + (1 - enter) * 120})`} opacity={enter}>
            <g transform={`translate(0 ${breathe * 0.5})`}>
              <path d="M-85 150 Q-95 100 -50 92 L50 92 Q95 100 85 150 L78 250 L-78 250 Z" fill="#b5a2d8" stroke={LINE} strokeWidth={3} />
              <path d="M30 100 Q70 120 68 245 L78 250 L85 150 Q95 100 50 92 Z" fill="rgba(0,0,0,0.18)" />
              {/* left arm stretched up */}
              <g transform={`rotate(${-150 * stretch + 10} -70 120)`}>
                <rect x={-104} y={110} width={32} height={150} rx={16} fill="#b5a2d8" stroke={LINE} strokeWidth={3} />
                <circle cx={-88} cy={272} r={19} fill={SKIN} stroke={LINE} strokeWidth={3} />
              </g>
              {/* right arm stretched up */}
              <g transform={`rotate(${150 * stretch - 10} 70 120)`}>
                <rect x={72} y={110} width={32} height={150} rx={16} fill="#b5a2d8" stroke={LINE} strokeWidth={3} />
                <circle cx={88} cy={272} r={19} fill={SKIN} stroke={LINE} strokeWidth={3} />
              </g>
              <rect x={-16} y={68} width={32} height={34} rx={10} fill={SKIN} stroke={LINE} strokeWidth={3} />
              <g transform={`translate(0 ${breathe * 0.4}) rotate(${12 + Math.sin((frame / fps) * 1.2) * 4} 0 70)`}>
                <ellipse cx={0} cy={5} rx={62} ry={76} fill={SKIN} stroke={LINE} strokeWidth={3} />
                <path d="M20 -65 Q64 -30 52 40 Q40 70 20 80 Q50 10 20 -65 Z" fill="rgba(0,0,0,0.1)" />
                {/* messy hair */}
                <path d="M-62 -10 Q-70 -90 -10 -84 Q10 -104 40 -80 Q74 -70 62 -10 Q44 -52 0 -48 Q-40 -50 -62 -10 Z" fill="#2b262c" />
                <path d="M-20 -86 Q-30 -112 -6 -106" fill="none" stroke={LINE} strokeWidth={5} strokeLinecap="round" />
                <path d="M26 -84 Q40 -112 54 -96" fill="none" stroke={LINE} strokeWidth={5} strokeLinecap="round" />
              </g>
            </g>
          </g>

          {/* Z z z */}
          {[0, 1, 2].map((i) => {
            const t = zFloat(i);
            return (
              <text
                key={i}
                x={360 + i * 34 + t * 40}
                y={360 - t * 160}
                fontSize={40 + i * 14}
                fontWeight={900}
                fill="#ffe19c"
                opacity={Math.sin(t * Math.PI)}
              >
                Z
              </text>
            );
          })}

          {/* alarm clock */}
          <g transform={`translate(710 ${600 + wobble * 0.3}) rotate(${wobble})`}>
            <circle r={64} fill="#fff6e4" stroke={LINE} strokeWidth={4} />
            <circle cx={-48} cy={-56} r={22} fill="#c0392b" stroke={LINE} strokeWidth={3} />
            <circle cx={48} cy={-56} r={22} fill="#c0392b" stroke={LINE} strokeWidth={3} />
            <line x1={0} y1={0} x2={0} y2={-42} stroke={LINE} strokeWidth={5} strokeLinecap="round" />
            <line x1={0} y1={0} x2={30} y2={10} stroke={LINE} strokeWidth={5} strokeLinecap="round" />
            <circle r={6} fill={LINE} />
          </g>

          {/* thought mirror question */}
          <g transform={`translate(740 160) scale(${mirrorIn})`}>
            <rect x={-160} y={-80} width={320} height={160} rx={34} fill="#fff6e4" stroke={LINE} strokeWidth={3} />
            <text x={0} y={-8} textAnchor="middle" fontSize={34} fontWeight={800} fill={LINE}>Jangan-jangan</text>
            <text x={0} y={42} textAnchor="middle" fontSize={34} fontWeight={800} fill="#c0392b">kamu juga? 👀</text>
          </g>
        </svg>

        <SpringIn delay={100}>
          <PaperCard theme={theme}>
            <div style={{ fontSize: 48, fontWeight: 800, textAlign: "center", lineHeight: 1.25 }}>
              <KineticWords text="Atau jangan-jangan, kamu sendiri yang sering jadi pelakunya?" />
            </div>
          </PaperCard>
        </SpringIn>
      </div>
    </AbsoluteFill>
  );
};