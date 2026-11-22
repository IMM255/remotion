import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { KineticWords, PaperCard, SpringIn, TagPin } from "../components/MotionKit";
import type { StyleTheme } from "../styles";

const BrassPin: React.FC<{ cx: number; cy: number; r?: number; angle?: number }> = ({
  cx,
  cy,
  r = 6,
  angle = 25,
}) => (
  <g transform={`translate(${cx}, ${cy}) rotate(${angle})`}>
    <circle r={r + 1.2} fill="rgba(28,33,40,0.28)" cx={1.2} cy={1.8} />
    <circle r={r} fill="#D4A238" stroke="#1C2128" strokeWidth={1.8} />
    <circle r={r * 0.48} cx={-r * 0.18} cy={-r * 0.18} fill="#F4D57B" />
    <line x1={-r * 0.72} y1={0} x2={r * 0.72} y2={0} stroke="#6E4E12" strokeWidth={1.5} />
  </g>
);

export const Scene01: React.FC<{ theme: StyleTheme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = theme as unknown as Record<string, string | undefined>;

  const ink = t?.ink ?? "#1C2128";
  const paper = t?.paper ?? "#F4EFE2";
  const printedBlue = "#2E5E8C";
  const printedBlueLight = "#7AA4C9";
  const printedGrey = "#7D8790";
  const printedGreyLight = "#D3D8DC";
  const stampRed = "#C44536";

  // Smooth camera & shadow motion every frame
  const sec = frame / fps;
  const camX = Math.sin(sec * 0.9) * 8;
  const camY = Math.cos(sec * 0.7) * 6;
  const camScale = interpolate(frame, [0, 236], [0.985, 1.025], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shadowX = 10 + Math.sin(sec * 1.1) * 4;
  const shadowY = 14 + Math.cos(sec * 0.9) * 3;

  // Puppets on twos (~12 poses/sec at 30fps)
  const puppetFrame = Math.floor(frame / 2.5) * 2.5;
  const puppetSec = puppetFrame / fps;

  const batherHeadTilt = Math.sin(puppetSec * 3.8) * 5;
  const batherArmSwing = Math.sin(puppetSec * 4.6) * 14 - 8;
  const duckBob = Math.sin(puppetSec * 5.2) * 4;
  const steamDrift = (puppetFrame * 1.4) % 28;

  const cannonRecoil = Math.max(0, Math.sin(puppetSec * 6.5)) * 10;
  const smokeScale = 0.88 + Math.abs(Math.sin(puppetSec * 4.2)) * 0.22;
  const soldierFlagAngle = -18 + Math.sin(puppetSec * 5.5) * 16;

  // Entrances & impact springs
  const stampProgress = spring({
    frame: Math.max(0, frame - 92),
    fps,
    config: { damping: 11, stiffness: 210, mass: 0.7 },
  });
  const stampScale = interpolate(stampProgress, [0, 1], [2.4, 1]);
  const stampOpacity = interpolate(stampProgress, [0, 0.25, 1], [0, 1, 1]);

  const bubbleProgress = spring({
    frame: Math.max(0, frame - 148),
    fps,
    config: { damping: 12, stiffness: 170 },
  });

  const clockPulse = 1 + Math.sin(sec * 4.2) * 0.035;
  const minuteHandAngle = interpolate(frame, [20, 140], [0, 228], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        paddingTop: 88,
        paddingLeft: 52,
        paddingRight: 52,
        paddingBottom: height > width ? 260 : 140,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transform: `translate3d(${camX}px, ${camY}px, 0) scale(${camScale})`,
          transformOrigin: "center center",
        }}
      >
        {/* Top Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16 }}>
          <SpringIn delay={2}>
            <TagPin text="FAKTA SEJARAH • KOMIK KILAT" />
          </SpringIn>
          <KineticWords
            text="BARU SELESAI MANDI, PERANG SUDAH BERAKHIR?"
            delay={10}
            style={{
              fontSize: 56,
              lineHeight: 1.06,
              fontWeight: 900,
              color: ink,
              letterSpacing: -1,
            }}
          />
        </div>

        {/* Comic Page Split Stage */}
        <div
          style={{
            position: "relative",
            flex: 1,
            marginTop: 22,
            marginBottom: 18,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 24,
          }}
        >
          {/* PANEL 1: Baru Selesai Mandi (Paper Puppet) */}
          <SpringIn delay={16}>
            <PaperCard
              style={{
                background: paper,
                border: `4px solid ${ink}`,
                borderRadius: 10,
                padding: 18,
                transform: "rotate(-1.4deg)",
                boxShadow: `${shadowX}px ${shadowY}px 0px rgba(28,33,40,0.22)`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    background: printedBlue,
                    color: paper,
                    fontWeight: 800,
                    fontSize: 22,
                    padding: "4px 14px",
                    border: `2.5px solid ${ink}`,
                    letterSpacing: 1,
                  }}
                >
                  PANEL 01 • SELESAI MANDI
                </span>
                <span style={{ fontWeight: 800, fontSize: 20, color: printedGrey }}>
                  ~38 MENIT
                </span>
              </div>

              <svg viewBox="0 0 880 390" style={{ width: "100%", height: 340, overflow: "visible" }}>
                <defs>
                  <pattern id="blueDots01" width="12" height="12" patternUnits="userSpaceOnUse">
                    <circle cx="4" cy="4" r="2" fill={printedBlueLight} opacity="0.55" />
                  </pattern>
                </defs>

                {/* Printed bathroom tile backdrop scrap */}
                <rect
                  x="10"
                  y="10"
                  width="860"
                  height="370"
                  rx="6"
                  fill="#EBF0F4"
                  stroke={ink}
                  strokeWidth="3.5"
                />
                <rect x="10" y="10" width="860" height="370" fill="url(#blueDots01)" />
                {/* Tile lines */}
                {[120, 240, 360, 480, 600, 720].map((x) => (
                  <line key={x} x1={x} y1={10} x2={x} y2={380} stroke={printedGreyLight} strokeWidth="2" />
                ))}
                {[100, 200, 300].map((y) => (
                  <line key={y} x1={10} y1={y} x2={870} y2={y} stroke={printedGreyLight} strokeWidth="2" />
                ))}

                {/* Shower head on left */}
                <g transform="translate(88, 22)">
                  <path
                    d="M 0 0 L 74 0 L 74 36"
                    fill="none"
                    stroke={printedGrey}
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 42 36 L 106 36 L 118 60 L 30 60 Z"
                    fill={printedGreyLight}
                    stroke={ink}
                    strokeWidth="3.5"
                  />
                  {/* Water droplets (12fps) */}
                  {[0, 1, 2, 3, 4].map((i) => {
                    const dropY = 74 + ((puppetFrame * 4 + i * 26) % 130);
                    return (
                      <line
                        key={i}
                        x1={44 + i * 15}
                        y1={dropY}
                        x2={40 + i * 15}
                        y2={dropY + 14}
                        stroke={printedBlue}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    );
                  })}
                </g>

                {/* Steam curls (12fps) */}
                {[0, 1, 2].map((i) => (
                  <path
                    key={i}
                    d={`M ${640 + i * 54} ${260 - steamDrift} Q ${624 + i * 54} ${225 - steamDrift} ${648 + i * 54} ${190 - steamDrift} T ${644 + i * 54} ${125 - steamDrift}`}
                    fill="none"
                    stroke={printedGrey}
                    strokeWidth="5"
                    strokeLinecap="round"
                    opacity={0.45}
                  />
                ))}

                {/* PAPER PUPPET: Bather with Brass Split Pins */}
                <g transform="translate(430, 195)">
                  {/* Smooth shadow under puppet */}
                  <ellipse cx={shadowX * 0.5} cy={156} rx="108" ry="18" fill="rgba(28,33,40,0.18)" />

                  {/* Legs */}
                  <rect x="-42" y="88" width="28" height="62" rx="10" fill="#F1D5B5" stroke={ink} strokeWidth="3.5" />
                  <rect x="14" y="88" width="28" height="62" rx="10" fill="#F1D5B5" stroke={ink} strokeWidth="3.5" />

                  {/* Torso wrapped in printed-blue towel */}
                  <path
                    d="M -62 -10 L 62 -10 L 72 104 L -72 104 Z"
                    fill={printedBlue}
                    stroke={ink}
                    strokeWidth="4"
                  />
                  {/* Towel stripe */}
                  <rect x="-66" y="72" width="132" height="14" fill={paper} stroke={ink} strokeWidth="2.5" />

                  {/* Left Arm holding soap/sponge */}
                  <g transform={`translate(-60, 8) rotate(${-14 - batherArmSwing * 0.4})`}>
                    <rect x="-24" y="-8" width="32" height="84" rx="14" fill="#F1D5B5" stroke={ink} strokeWidth="3.5" />
                    <BrassPin cx={0} cy={4} r={5.5} />
                  </g>

                  {/* Right Arm holding rubber duck */}
                  <g transform={`translate(60, 8) rotate(${batherArmSwing})`}>
                    <rect x="-8" y="-8" width="32" height="84" rx="14" fill="#F1D5B5" stroke={ink} strokeWidth="3.5" />
                    {/* Rubber duck cutout */}
                    <g transform={`translate(28, ${68 + duckBob})`}>
                      <ellipse cx="0" cy="0" rx="22" ry="15" fill="#E5B94C" stroke={ink} strokeWidth="3" />
                      <circle cx="14" cy="-14" r="11" fill="#E5B94C" stroke={ink} strokeWidth="3" />
                      <polygon points="24,-15 35,-12 24,-8" fill={stampRed} stroke={ink} strokeWidth="2" />
                      <circle cx="17" cy="-16" r="2.2" fill={ink} />
                    </g>
                    <BrassPin cx={0} cy={4} r={5.5} />
                  </g>

                  {/* Head + Towel Turban */}
                  <g transform={`translate(0, -18) rotate(${batherHeadTilt})`}>
                    <circle cx="0" cy="-46" r="46" fill="#F1D5B5" stroke={ink} strokeWidth="4" />
                    {/* Happy eyes & whistle mouth */}
                    <path d="M -20 -52 Q -14 -60 -8 -52" fill="none" stroke={ink} strokeWidth="3.5" strokeLinecap="round" />
                    <path d="M 8 -52 Q 14 -60 20 -52" fill="none" stroke={ink} strokeWidth="3.5" strokeLinecap="round" />
                    <path d="M -12 -30 Q 0 -18 12 -30" fill="none" stroke={ink} strokeWidth="3.5" strokeLinecap="round" />
                    {/* Towel turban */}
                    <path
                      d="M -52 -66 C -58 -118, 58 -118, 52 -66 Z"
                      fill={paper}
                      stroke={ink}
                      strokeWidth="4"
                    />
                    <path
                      d="M -38 -82 Q 0 -98 38 -82"
                      fill="none"
                      stroke={printedBlue}
                      strokeWidth="5"
                    />
                    <BrassPin cx={0} cy={0} r={6} />
                  </g>

                  {/* Hip Brass Pins */}
                  <BrassPin cx={-28} cy={92} r={5} />
                  <BrassPin cx={28} cy={92} r={5} />
                </g>

                {/* Comic Pocket Watch Badge (Top Right inside panel) */}
                <g transform={`translate(760, 108) scale(${clockPulse})`}>
                  <circle cx="0" cy="0" r="64" fill={paper} stroke={ink} strokeWidth="4.5" />
                  <circle cx="0" cy="0" r="52" fill="none" stroke={printedBlue} strokeWidth="3" strokeDasharray="6 5" />
                  {/* 38-min shaded arc */}
                  <path
                    d="M 0 0 L 0 -46 A 46 46 0 1 1 -34 31 Z"
                    fill={printedBlueLight}
                    opacity="0.55"
                  />
                  <line x1="0" y1="0" x2="0" y2="-34" stroke={ink} strokeWidth="4" strokeLinecap="round" />
                  <line
                    x1="0"
                    y1="0"
                    x2={Math.sin((minuteHandAngle * Math.PI) / 180) * 40}
                    y2={-Math.cos((minuteHandAngle * Math.PI) / 180) * 40}
                    stroke={stampRed}
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <BrassPin cx={0} cy={0} r={5.5} />
                </g>
              </svg>
            </PaperCard>
          </SpringIn>

          {/* PANEL 2: Perang Sudah Berakhir (Paper Map & Mini Puppets) */}
          <SpringIn delay={34}>
            <div style={{ position: "relative" }}>
              <PaperCard
                style={{
                  background: paper,
                  border: `4px solid ${ink}`,
                  borderRadius: 10,
                  padding: 18,
                  transform: "rotate(1.3deg)",
                  boxShadow: `${shadowX}px ${shadowY}px 0px rgba(28,33,40,0.22)`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      background: printedGrey,
                      color: paper,
                      fontWeight: 800,
                      fontSize: 22,
                      padding: "4px 14px",
                      border: `2.5px solid ${ink}`,
                      letterSpacing: 1,
                    }}
                  >
                    PANEL 02 • SEBUAH PERANG
                  </span>
                  <span style={{ fontWeight: 800, fontSize: 20, color: printedBlue }}>
                    PETA KERTAS
                  </span>
                </div>

                <svg viewBox="0 0 880 380" style={{ width: "100%", height: 330, overflow: "visible" }}>
                  {/* Printed map sea & land scrap */}
                  <rect
                    x="10"
                    y="10"
                    width="860"
                    height="360"
                    rx="6"
                    fill="#DCE7F0"
                    stroke={ink}
                    strokeWidth="3.5"
                  />
                  {/* Wave lines */}
                  {[70, 145, 225, 305].map((y, idx) => (
                    <path
                      key={y}
                      d={`M 24 ${y} Q 140 ${y - 10} 260 ${y} T 500 ${y} T 740 ${y} T 856 ${y}`}
                      fill="none"
                      stroke={printedBlueLight}
                      strokeWidth="2.5"
                      opacity={0.7 - idx * 0.08}
                    />
                  ))}

                  {/* Torn land scrap on right */}
                  <path
                    d="M 520 50 L 856 50 L 856 356 L 470 356 L 495 270 L 462 190 L 515 120 Z"
                    fill="#E7E0CF"
                    stroke={ink}
                    strokeWidth="3.5"
                  />

                  {/* Paper-cutout Cannon on Left (12fps recoil) */}
                  <g transform={`translate(${185 - cannonRecoil}, 235)`}>
                    {/* Cannon barrel */}
                    <path
                      d="M -40 -26 L 105 -38 L 105 14 L -40 24 Z"
                      fill={printedGrey}
                      stroke={ink}
                      strokeWidth="4"
                    />
                    <rect x="-54" y="-12" width="18" height="24" rx="8" fill={printedGrey} stroke={ink} strokeWidth="3.5" />
                    {/* Carriage wheel */}
                    <circle cx="10" cy="36" r="42" fill={paper} stroke={ink} strokeWidth="4" />
                    <circle cx="10" cy="36" r="28" fill="none" stroke={printedBlue} strokeWidth="3.5" />
                    <BrassPin cx={10} cy={36} r={7} />
                  </g>

                  {/* Comic Paper Cloud "POOF!" */}
                  <g transform={`translate(355, 195) scale(${smokeScale})`}>
                    <path
                      d="M -48 10 C -72 -18, -32 -56, 0 -38 C 28 -64, 78 -36, 62 0 C 84 26, 44 62, 12 44 C -18 64, -64 42, -48 10 Z"
                      fill={paper}
                      stroke={ink}
                      strokeWidth="3.5"
                    />
                    <text
                      x="8"
                      y="10"
                      textAnchor="middle"
                      fontSize="28"
                      fontWeight="900"
                      fill={printedBlue}
                    >
                      DUAR!
                    </text>
                  </g>

                  {/* Paper Puppet Soldier raising White Flag */}
                  <g transform="translate(650, 215)">
                    <ellipse cx={shadowX * 0.4} cy={104} rx="58" ry="12" fill="rgba(28,33,40,0.2)" />
                    {/* Legs */}
                    <rect x="-24" y="42" width="18" height="58" rx="6" fill={printedGrey} stroke={ink} strokeWidth="3" />
                    <rect x="6" y="42" width="18" height="58" rx="6" fill={printedGrey} stroke={ink} strokeWidth="3" />
                    {/* Tunic */}
                    <rect x="-34" y="-26" width="68" height="72" rx="8" fill={printedBlue} stroke={ink} strokeWidth="3.5" />
                    {/* Head + Helmet */}
                    <g transform={`translate(0, -32) rotate(${Math.sin(puppetSec * 3.5) * 4})`}>
                      <circle cx="0" cy="-26" r="28" fill="#F1D5B5" stroke={ink} strokeWidth="3.5" />
                      <circle cx="-9" cy="-30" r="3" fill={ink} />
                      <circle cx="9" cy="-30" r="3" fill={ink} />
                      <circle cx="0" cy="-14" r="5" fill={ink} />
                      <path
                        d="M -34 -36 C -32 -70, 32 -70, 34 -36 Z"
                        fill={printedGreyLight}
                        stroke={ink}
                        strokeWidth="3.5"
                      />
                      <BrassPin cx={0} cy={0} r={5} />
                    </g>

                    {/* Raised Arm with White Flag (12fps wave) */}
                    <g transform={`translate(34, -14) rotate(${soldierFlagAngle})`}>
                      <rect x="-6" y="-56" width="18" height="62" rx="8" fill={printedBlue} stroke={ink} strokeWidth="3" />
                      <line x1="6" y1="-52" x2="6" y2="-142" stroke={ink} strokeWidth="4.5" strokeLinecap="round" />
                      <path
                        d="M 8 -140 Q 48 -150 86 -136 L 82 -86 Q 46 -98 8 -88 Z"
                        fill="#FFFFFF"
                        stroke={ink}
                        strokeWidth="3.5"
                      />
                      <BrassPin cx={0} cy={0} r={5.5} />
                    </g>
                    <BrassPin cx={-15} cy={46} r={4.5} />
                    <BrassPin cx={15} cy={46} r={4.5} />
                  </g>
                </svg>
              </PaperCard>

              {/* Dramatic Rubber Stamp "SELESAI!" */}
              <div
                style={{
                  position: "absolute",
                  top: "34%",
                  left: "50%",
                  transform: `translate(-50%, -50%) rotate(-9deg) scale(${stampScale})`,
                  opacity: stampOpacity,
                  border: `7px solid ${stampRed}`,
                  borderRadius: 12,
                  padding: "10px 30px",
                  background: "rgba(244, 239, 226, 0.92)",
                  color: stampRed,
                  fontSize: 64,
                  fontWeight: 900,
                  letterSpacing: 4,
                  boxShadow: "0 10px 24px rgba(28,33,40,0.22)",
                  pointerEvents: "none",
                }}
              >
                SELESAI!
              </div>
            </div>
          </SpringIn>
        </div>

        {/* Bottom Comic Speech Callout */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            transform: `scale(${interpolate(bubbleProgress, [0, 1], [0.7, 1])}) translateY(${interpolate(
              bubbleProgress,
              [0, 1],
              [28, 0]
            )}px)`,
            opacity: bubbleProgress,
          }}
        >
          <div
            style={{
              background: printedBlue,
              color: paper,
              border: `4px solid ${ink}`,
              borderRadius: 999,
              padding: "16px 38px",
              fontSize: 34,
              fontWeight: 900,
              letterSpacing: 0.5,
              boxShadow: `${shadowX * 0.7}px ${shadowY * 0.7}px 0px ${ink}`,
            }}
          >
            KEDENGARANNYA MUSTAHIL, KAN?
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};