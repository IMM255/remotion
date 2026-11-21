import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { KineticWords, PaperCard, SpringIn, TagPin } from "../components/MotionKit";
import type { StyleTheme } from "../styles";

const SKIN = "#ecc5a2";
const LINE = "#2b262c";

export const Scene02: React.FC<{ theme: StyleTheme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const pb = height > width ? 260 : 140;

  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 110 } });
  const breathe = Math.sin((frame / fps) * 2.2) * 3;
  const nod = Math.sin((frame / fps) * 1.4) * 3 - 4;
  const phoneShake = Math.sin((frame / fps) * 14) * 2.5;
  const ring = interpolate((frame % 20) / 20, [0, 1], [0.6, 1.6]);
  const ringOp = interpolate((frame % 20) / 20, [0, 1], [0.7, 0]);
  const tickAngle = interpolate(frame, [0, 130], [0, 300], { extrapolateRight: "clamp" });
  const dots = Math.floor(frame / 12) % 4;

  return (
    <AbsoluteFill style={{ paddingBottom: pb, paddingTop: 100, paddingLeft: 60, paddingRight: 60, alignItems: "center" }}>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <SpringIn delay={0}>
          <TagPin theme={theme}>10 menit lewat</TagPin>
        </SpringIn>

        <svg width={940} height={900} viewBox="0 0 940 900" style={{ overflow: "visible" }}>
          <ellipse cx={470} cy={850} rx={300} ry={24} fill="rgba(0,0,0,0.35)" />

          {/* stopwatch top-left */}
          <g transform={`translate(190 130) scale(${enter})`}>
            <circle r={86} fill="#fff6e4" stroke={LINE} strokeWidth={4} />
            <rect x={-12} y={-112} width={24} height={20} rx={6} fill={LINE} />
            <path
              d={`M0 0 L0 -78 A78 78 0 ${tickAngle > 180 ? 1 : 0} 1 ${Math.sin((tickAngle * Math.PI) / 180) * 78} ${-Math.cos((tickAngle * Math.PI) / 180) * 78} Z`}
              fill="rgba(192,57,43,0.35)"
            />
            <line x1={0} y1={0} x2={0} y2={-70} stroke="#c0392b" strokeWidth={6} strokeLinecap="round" transform={`rotate(${tickAngle})`} />
            <circle r={8} fill={LINE} />
          </g>

          {/* person calling */}
          <g transform={`translate(470 ${230 + (1 - enter) * 140})`} opacity={enter}>
            <rect x={-48} y={320} width={40} height={230} rx={16} fill="#35405a" stroke={LINE} strokeWidth={3} />
            <rect x={8} y={320} width={40} height={230} rx={16} fill="#35405a" stroke={LINE} strokeWidth={3} />
            <rect x={-58} y={540} width={56} height={24} rx={10} fill="#3a2f2a" stroke={LINE} strokeWidth={3} />
            <rect x={2} y={540} width={56} height={24} rx={10} fill="#3a2f2a" stroke={LINE} strokeWidth={3} />
            <g transform={`translate(0 ${breathe * 0.4})`}>
              <path d="M-100 150 Q-110 100 -55 90 L55 90 Q110 100 100 150 L88 335 L-88 335 Z" fill="#4f8fbf" stroke={LINE} strokeWidth={3} />
              <path d="M34 100 Q78 120 74 325 L88 335 L100 150 Q110 100 55 90 Z" fill="rgba(0,0,0,0.18)" />
              {/* arm on hip (impatient) */}
              <path d="M-96 120 Q-150 200 -70 250" fill="none" stroke="#4f8fbf" strokeWidth={34} strokeLinecap="round" />
              <path d="M-96 120 Q-150 200 -70 250" fill="none" stroke={LINE} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
              <circle cx={-66} cy={254} r={19} fill={SKIN} stroke={LINE} strokeWidth={3} />
              {/* arm holding phone to ear */}
              <g transform={`rotate(${phoneShake} 90 120)`}>
                <path d="M96 120 Q150 120 128 30" fill="none" stroke="#4f8fbf" strokeWidth={34} strokeLinecap="round" />
                <circle cx={126} cy={20} r={19} fill={SKIN} stroke={LINE} strokeWidth={3} />
                <rect x={104} y={-20} width={30} height={58} rx={8} fill="#222" stroke={LINE} strokeWidth={3} />
              </g>
              <rect x={-16} y={62} width={32} height={34} rx={10} fill={SKIN} stroke={LINE} strokeWidth={3} />
              <g transform={`translate(0 ${breathe * 0.6}) rotate(${nod} 0 60)`}>
                <ellipse cx={0} cy={-5} rx={62} ry={76} fill={SKIN} stroke={LINE} strokeWidth={3} />
                <path d="M20 -75 Q64 -40 52 30 Q40 60 20 70 Q50 0 20 -75 Z" fill="rgba(0,0,0,0.1)" />
                <path d="M-60 -20 Q-66 -90 0 -86 Q66 -90 60 -20 Q40 -60 0 -58 Q-40 -60 -60 -20 Z" fill="#2b262c" />
              </g>
            </g>
          </g>

          {/* ring waves */}
          <g transform="translate(640 220)">
            <circle r={40 * ring} fill="none" stroke="#ffe19c" strokeWidth={4} opacity={ringOp} />
            <circle r={40 * (ring * 0.7)} fill="none" stroke="#ffe19c" strokeWidth={4} opacity={ringOp * 0.8} />
          </g>

          {/* dialing bubble */}
          <g transform={`translate(740 90) scale(${spring({ frame: frame - 40, fps, config: { damping: 12 } })})`}>
            <rect x={-110} y={-44} width={220} height={88} rx={28} fill="#fff6e4" stroke={LINE} strokeWidth={3} />
            <text x={0} y={14} textAnchor="middle" fontSize={44} fontWeight={800} fill={LINE}>
              Tut{".".repeat(dots)}
            </text>
          </g>
        </svg>

        <SpringIn delay={20}>
          <PaperCard theme={theme}>
            <div style={{ fontSize: 56, fontWeight: 800, textAlign: "center", lineHeight: 1.25 }}>
              <KineticWords text="Pas kamu telepon, ternyata dia..." />
            </div>
          </PaperCard>
        </SpringIn>
      </div>
    </AbsoluteFill>
  );
};