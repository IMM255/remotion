import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { KineticWords, PaperCard, SpringIn, TagPin } from "../components/MotionKit";
import type { StyleTheme } from "../styles";

const SKIN = "#ecc5a2";
const LINE = "#2b262c";

const Person: React.FC<{
  x: number;
  y: number;
  scale?: number;
  shirt: string;
  pants: string;
  frame: number;
  fps: number;
  delay?: number;
  headTilt?: number;
  armRaise?: number;
  flip?: boolean;
}> = ({ x, y, scale = 1, shirt, pants, frame, fps, delay = 0, headTilt = 0, armRaise = 0, flip }) => {
  const enter = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 120 } });
  const breathe = Math.sin((frame / fps) * 2.2 + delay) * 3;
  const nod = Math.sin((frame / fps) * 1.8 + delay) * 2 + headTilt;
  const arm = Math.sin((frame / fps) * 3 + delay) * 6 + armRaise;
  return (
    <g
      transform={`translate(${x} ${y + (1 - enter) * 120}) scale(${(flip ? -1 : 1) * scale} ${scale})`}
      opacity={enter}
    >
      {/* legs */}
      <rect x={-48} y={300} width={40} height={150} rx={16} fill={pants} stroke={LINE} strokeWidth={3} />
      <rect x={8} y={300} width={40} height={150} rx={16} fill={pants} stroke={LINE} strokeWidth={3} />
      <rect x={-56} y={440} width={54} height={22} rx={10} fill="#3a2f2a" stroke={LINE} strokeWidth={3} />
      <rect x={2} y={440} width={54} height={22} rx={10} fill="#3a2f2a" stroke={LINE} strokeWidth={3} />
      {/* torso */}
      <g transform={`translate(0 ${breathe * 0.4})`}>
        <path
          d="M-90 130 Q-100 90 -50 80 L50 80 Q100 90 90 130 L80 310 L-80 310 Z"
          fill={shirt}
          stroke={LINE}
          strokeWidth={3}
        />
        <path d="M30 90 Q70 110 66 300 L80 310 L90 130 Q100 90 50 80 Z" fill="rgba(0,0,0,0.18)" />
        {/* left arm */}
        <g transform={`rotate(${8 + arm * 0.3} -80 110)`}>
          <rect x={-112} y={100} width={34} height={150} rx={17} fill={shirt} stroke={LINE} strokeWidth={3} />
          <circle cx={-95} cy={262} r={19} fill={SKIN} stroke={LINE} strokeWidth={3} />
        </g>
        {/* right arm raised */}
        <g transform={`rotate(${-20 - armRaise - arm} 80 110)`}>
          <rect x={78} y={100} width={34} height={150} rx={17} fill={shirt} stroke={LINE} strokeWidth={3} />
          <circle cx={95} cy={262} r={19} fill={SKIN} stroke={LINE} strokeWidth={3} />
        </g>
        {/* neck + head */}
        <rect x={-16} y={55} width={32} height={34} rx={10} fill={SKIN} stroke={LINE} strokeWidth={3} />
        <g transform={`translate(0 ${breathe * 0.6}) rotate(${nod} 0 60)`}>
          <ellipse cx={0} cy={-5} rx={62} ry={76} fill={SKIN} stroke={LINE} strokeWidth={3} />
          <path d="M20 -75 Q64 -40 52 30 Q40 60 20 70 Q50 0 20 -75 Z" fill="rgba(0,0,0,0.1)" />
          <path d="M-60 -20 Q-66 -90 0 -86 Q66 -90 60 -20 Q40 -60 0 -58 Q-40 -60 -60 -20 Z" fill="#2b262c" />
        </g>
      </g>
    </g>
  );
};

export const Scene01: React.FC<{ theme: StyleTheme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const pb = height > width ? 260 : 140;

  const clockPop = spring({ frame: frame - 70, fps, config: { damping: 12, stiffness: 140 } });
  const minuteAngle = interpolate(frame, [150, 225], [0, 120], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sway = Math.sin((frame / fps) * 1.5) * 2;

  return (
    <AbsoluteFill style={{ paddingBottom: pb, paddingTop: 90, paddingLeft: 60, paddingRight: 60, alignItems: "center" }}>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <SpringIn delay={0}>
          <PaperCard theme={theme}>
            <div style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.25, textAlign: "center", maxWidth: 900 }}>
              <KineticWords text="Pernah nggak, kamu udah siap berangkat..." />
            </div>
          </PaperCard>
        </SpringIn>

        <svg width={960} height={820} viewBox="0 0 960 820" style={{ overflow: "visible" }}>
          {/* floor shadow */}
          <ellipse cx={480} cy={780} rx={380} ry={26} fill="rgba(0,0,0,0.35)" />
          {/* you: ready, bag */}
          <Person x={250} y={300} shirt="#4f8fbf" pants="#35405a" frame={frame} fps={fps} delay={6} armRaise={10} />
          <g transform={`translate(150 ${470 + sway})`}>
            <rect x={0} y={0} width={70} height={90} rx={16} fill="#c8794a" stroke={LINE} strokeWidth={3} />
            <path d="M14 0 Q35 -34 56 0" fill="none" stroke={LINE} strokeWidth={4} />
          </g>
          {/* friend: waving hand "five minutes" */}
          <Person x={700} y={300} shirt="#b5566b" pants="#4b3b4e" frame={frame} fps={fps} delay={24} headTilt={-6} armRaise={70} flip />
          {/* five fingers sign */}
          <g transform={`translate(${770} ${190 + Math.sin((frame / fps) * 4) * 5}) scale(${clockPop})`}>
            <rect x={-60} y={-60} width={120} height={90} rx={22} fill="#fff6e4" stroke={LINE} strokeWidth={3} />
            <text x={0} y={5} textAnchor="middle" fontSize={44} fontWeight={800} fill={LINE}>5 mnt</text>
          </g>
          {/* clock */}
          <g transform={`translate(480 120) scale(${clockPop})`}>
            <circle r={78} fill="#fff6e4" stroke={LINE} strokeWidth={4} />
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={i}
                x1={0}
                y1={-64}
                x2={0}
                y2={-72}
                stroke={LINE}
                strokeWidth={3}
                transform={`rotate(${i * 30})`}
              />
            ))}
            <line x1={0} y1={0} x2={0} y2={-52} stroke={LINE} strokeWidth={5} strokeLinecap="round" transform={`rotate(${minuteAngle})`} />
            <line x1={0} y1={0} x2={0} y2={-32} stroke="#c0392b" strokeWidth={6} strokeLinecap="round" transform={`rotate(${30 + minuteAngle / 12})`} />
            <circle r={7} fill={LINE} />
          </g>
        </svg>

        <SpringIn delay={150}>
          <TagPin theme={theme}>Lima menit lewat…</TagPin>
        </SpringIn>
      </div>
    </AbsoluteFill>
  );
};