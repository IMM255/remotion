import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { KineticWords, PaperCard, SpringIn, TagPin } from "../components/MotionKit";
import type { StyleTheme } from "../styles";

const BrassPin03: React.FC<{ cx: number; cy: number; r?: number; angle?: number }> = ({
  cx,
  cy,
  r = 5.5,
  angle = 20,
}) => (
  <g transform={`translate(${cx}, ${cy}) rotate(${angle})`}>
    <circle r={r + 1.2} cx={1.2} cy={1.8} fill="rgba(28,33,40,0.28)" />
    <circle r={r} fill="#D4A238" stroke="#1C2128" strokeWidth={1.7} />
    <circle r={r * 0.45} cx={-r * 0.18} cy={-r * 0.18} fill="#F5D985" />
    <line x1={-r * 0.72} y1={0} x2={r * 0.72} y2={0} stroke="#6E4E12" strokeWidth={1.4} />
  </g>
);

export const Scene03: React.FC<{ theme: StyleTheme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = theme as unknown as Record<string, string | undefined>;

  const ink = t?.ink ?? "#1C2128";
  const paper = t?.paper ?? "#F4EFE2";
  const printedBlue = "#2C5B88";
  const printedBlueLight = "#7AA4C9";
  const printedBluePale = "#DCE8F2";
  const printedGrey = "#6E7882";
  const printedGreyLight = "#D3D8DC";
  const brass = "#D4A238";
  const stampRed = "#C44536";

  // Smooth camera & shadow motion every frame
  const sec = frame / fps;
  const camX = Math.sin(sec * 0.75) * 9;
  const camY = Math.cos(sec * 0.6) * 7;
  const camScale = interpolate(frame, [0, 356], [0.98, 1.03], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shadowX = 10 + Math.sin(sec * 0.95) * 4;
  const shadowY = 14 + Math.cos(sec * 0.85) * 3;

  // Puppets on twos (~12 poses/sec at 30fps)
  const puppetFrame = Math.floor(frame / 2.5) * 2.5;
  const puppetSec = puppetFrame / fps;

  const sultanBounce = Math.sin(puppetSec * 3.4) * 3.5;
  const sultanHeadNod = Math.sin(puppetSec * 2.8) * 4;
  const britStomp = Math.abs(Math.sin(puppetSec * 4.5)) * 4;
  const britArmShake = Math.sin(puppetSec * 5.2) * 7;

  // Staggered springs across 11.87s (~356 frames)
  const crownDrop = spring({
    frame: Math.max(0, frame - 26),
    fps,
    config: { damping: 10, stiffness: 180, mass: 0.8 },
  });
  const noApprovalStamp = spring({
    frame: Math.max(0, frame - 74),
    fps,
    config: { damping: 11, stiffness: 220, mass: 0.7 },
  });
  const britEnter = spring({
    frame: Math.max(0, frame - 135),
    fps,
    config: { damping: 13, stiffness: 135 },
  });
  const scrollUnroll = spring({
    frame: Math.max(0, frame - 178),
    fps,
    config: { damping: 12, stiffness: 160 },
  });
  const bubblePop = spring({
    frame: Math.max(0, frame - 210),
    fps,
    config: { damping: 11, stiffness: 190 },
  });

  return (
    <AbsoluteFill
      style={{
        paddingTop: 88,
        paddingLeft: 50,
        paddingRight: 50,
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 14 }}>
          <SpringIn delay={2}>
            <TagPin text="AWAL KONFLIK • AGUSTUS 1896" />
          </SpringIn>
          <KineticWords
            text="TAKHTA BARU & ULTIMATUM INGGRIS"
            delay={10}
            style={{
              fontSize: 54,
              lineHeight: 1.06,
              fontWeight: 900,
              color: ink,
              letterSpacing: -1,
            }}
          />
        </div>

        {/* Main Comic Page Stage: Vertical Confrontation */}
        <div
          style={{
            flex: 1,
            marginTop: 20,
            marginBottom: 16,
            display: "flex",
            flexDirection: "column",
            gap: 22,
            justifyContent: "center",
          }}
        >
          {/* UPPER PANEL: Sultan Baru Naik Takhta */}
          <SpringIn delay={14}>
            <div style={{ position: "relative" }}>
              <PaperCard
                style={{
                  background: paper,
                  border: `4.5px solid ${ink}`,
                  borderRadius: 12,
                  padding: 18,
                  transform: "rotate(1deg)",
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
                      fontWeight: 900,
                      fontSize: 21,
                      padding: "4px 14px",
                      border: `2.5px solid ${ink}`,
                      letterSpacing: 1,
                    }}
                  >
                    ISTANA ZANZIBAR
                  </span>
                  <span style={{ fontWeight: 800, fontSize: 19, color: printedBlue }}>
                    SULTAN BARU NAIK TAKHTA
                  </span>
                </div>

                <svg viewBox="0 0 880 390" style={{ width: "100%", height: 345, overflow: "visible" }}>
                  <defs>
                    <pattern id="palaceHatch03" width="14" height="14" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="14" stroke={printedGreyLight} strokeWidth="2" />
                    </pattern>
                  </defs>

                  {/* Printed Map & Palace Interior Scrap */}
                  <rect x="8" y="8" width="864" height="374" rx="8" fill="#EAE3D2" stroke={ink} strokeWidth="3.5" />
                  <rect x="8" y="8" width="864" height="374" fill="url(#palaceHatch03)" opacity="0.55" />

                  {/* Palace Archways Backdrop */}
                  {[130, 440, 750].map((cx) => (
                    <path
                      key={cx}
                      d={`M ${cx - 86} 382 L ${cx - 86} 140 Q ${cx} 45 ${cx + 86} 140 L ${cx + 86} 382 Z`}
                      fill={printedBluePale}
                      stroke={ink}
                      strokeWidth="3"
                    />
                  ))}

                  {/* Red Carpet Step */}
                  <polygon points="270,382 610,382 560,315 320,315" fill={printedBlue} stroke={ink} strokeWidth="3.5" />

                  {/* Ornate Paper-Cutout Throne */}
                  <g transform="translate(440, 225)">
                    <rect x="-92" y="-115" width="184" height="190" rx="20" fill={brass} stroke={ink} strokeWidth="4" />
                    <rect x="-74" y="-95" width="148" height="150" rx="14" fill={printedBlue} stroke={ink} strokeWidth="3" />
                    <rect x="-106" y="42" width="212" height="46" rx="8" fill={brass} stroke={ink} strokeWidth="4" />
                  </g>

                  {/* PAPER PUPPET: New Sultan (White paper border + Brass Split Pins) */}
                  <g transform={`translate(440, ${232 + sultanBounce})`}>
                    <ellipse cx={shadowX * 0.4} cy={125} rx="88" ry="14" fill="rgba(28,33,40,0.22)" />

                    {/* White Paper Cutout Halo */}
                    <path
                      d="M -64 115 L -74 -15 L -48 -42 L -56 -110 L 56 -110 L 48 -42 L 74 -15 L 64 115 Z"
                      fill="#FFFFFF"
                      stroke="#FFFFFF"
                      strokeWidth="12"
                      strokeLinejoin="round"
                    />

                    {/* Robe */}
                    <path d="M -52 52 L 52 52 L 62 118 L -62 118 Z" fill={paper} stroke={ink} strokeWidth="3.8" />
                    {/* Royal Coat */}
                    <path d="M -56 -22 L 56 -22 L 64 68 L -64 68 Z" fill={printedGrey} stroke={ink} strokeWidth="4" />
                    <rect x="-14" y="-22" width="28" height="90" fill={paper} stroke={ink} strokeWidth="2.5" />
                    <line x1="0" y1="-20" x2="0" y2="66" stroke={brass} strokeWidth="4.5" strokeDasharray="6 6" />

                    {/* Arms akimbo (proud pose) */}
                    <g transform="translate(-56, -6) rotate(24)">
                      <rect x="-20" y="-6" width="26" height="68" rx="12" fill={printedGrey} stroke={ink} strokeWidth="3.5" />
                      <BrassPin03 cx={-4} cy={6} />
                    </g>
                    <g transform="translate(56, -6) rotate(-24)">
                      <rect x="-6" y="-6" width="26" height="68" rx="12" fill={printedGrey} stroke={ink} strokeWidth="3.5" />
                      <BrassPin03 cx={4} cy={6} />
                    </g>

                    {/* Head + Turban */}
                    <g transform={`translate(0, -30) rotate(${sultanHeadNod})`}>
                      <circle cx="0" cy="-38" r="40" fill="#C9966B" stroke={ink} strokeWidth="4" />
                      {/* Confident smirk & brows */}
                      <path d="M -22 -48 L -8 -44" stroke={ink} strokeWidth="3.8" strokeLinecap="round" />
                      <path d="M 22 -48 L 8 -44" stroke={ink} strokeWidth="3.8" strokeLinecap="round" />
                      <circle cx="-13" cy="-39" r="3.5" fill={ink} />
                      <circle cx="13" cy="-39" r="3.5" fill={ink} />
                      <path d="M -26 -24 Q 0 12 26 -24 Q 0 -10 -26 -24 Z" fill={ink} />
                      <path d="M -10 -22 Q 0 -14 10 -22" fill="none" stroke={paper} strokeWidth="3" strokeLinecap="round" />

                      {/* Turban */}
                      <path d="M -46 -58 C -52 -114, 52 -114, 46 -58 Z" fill={paper} stroke={ink} strokeWidth="4" />
                      <path d="M -38 -76 Q 0 -94 38 -76" fill="none" stroke={printedBlue} strokeWidth="6" />

                      {/* Golden Crown dropping onto turban */}
                      <g
                        transform={`translate(0, ${interpolate(crownDrop, [0, 1], [-180, -106])}) scale(${interpolate(
                          crownDrop,
                          [0, 1],
                          [1.3, 1]
                        )})`}
                      >
                        <polygon
                          points="-30,16 -36,-18 -14,-2 0,-26 14,-2 36,-18 30,16"
                          fill={brass}
                          stroke={ink}
                          strokeWidth="3.5"
                          strokeLinejoin="round"
                        />
                        <circle cx="0" cy="-28" r="5" fill={stampRed} stroke={ink} strokeWidth="2" />
                      </g>

                      <BrassPin03 cx={0} cy={0} r={6} />
                    </g>

                    <BrassPin03 cx={-22} cy={62} r={5} />
                    <BrassPin03 cx={22} cy={62} r={5} />
                  </g>
                </svg>
              </PaperCard>

              {/* Red Stamp: TANPA PERSETUJUAN INGGRIS */}
              <div
                style={{
                  position: "absolute",
                  top: 76,
                  right: 26,
                  transform: `rotate(8deg) scale(${interpolate(noApprovalStamp, [0, 1], [2.2, 1])})`,
                  opacity: interpolate(noApprovalStamp, [0, 0.25, 1], [0, 1, 1]),
                  background: "rgba(244, 239, 226, 0.95)",
                  border: `5px solid ${stampRed}`,
                  borderRadius: 10,
                  padding: "8px 18px",
                  color: stampRed,
                  fontWeight: 900,
                  fontSize: 24,
                  textAlign: "center",
                  lineHeight: 1.1,
                  boxShadow: "6px 8px 0px rgba(28,33,40,0.2)",
                }}
              >
                TANPA IZIN
                <br />
                INGGRIS!
              </div>
            </div>
          </SpringIn>

          {/* LOWER PANEL: Inggris Memberikan Ultimatum */}
          <SpringIn delay={128}>
            <PaperCard
              style={{
                background: paper,
                border: `4.5px solid ${ink}`,
                borderRadius: 12,
                padding: 18,
                transform: "rotate(-1.1deg)",
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
                    fontWeight: 900,
                    fontSize: 21,
                    padding: "4px 14px",
                    border: `2.5px solid ${ink}`,
                    letterSpacing: 1,
                  }}
                >
                  RESPON INGGRIS
                </span>
                <span style={{ fontWeight: 800, fontSize: 19, color: stampRed }}>
                  ULTIMATUM RESMI
                </span>
              </div>

              <svg viewBox="0 0 880 420" style={{ width: "100%", height: 370, overflow: "visible" }}>
                {/* Printed Sea & Map Strip */}
                <rect x="8" y="8" width="864" height="404" rx="8" fill={printedBluePale} stroke={ink} strokeWidth="3.5" />
                {[80, 160, 240, 320].map((y) => (
                  <path
                    key={y}
                    d={`M 20 ${y} Q 180 ${y - 10} 340 ${y} T 660 ${y} T 860 ${y}`}
                    fill="none"
                    stroke={printedBlueLight}
                    strokeWidth="2.5"
                    opacity="0.55"
                  />
                ))}

                {/* British Admiral Paper Puppet entering from left */}
                <g
                  transform={`translate(${interpolate(britEnter, [0, 1], [-140, 205])}, ${245 - britStomp})`}
                  opacity={britEnter}
                >
                  <ellipse cx={shadowX * 0.4} cy={138} rx="76" ry="14" fill="rgba(28,33,40,0.22)" />

                  {/* Legs */}
                  <rect x="-32" y="64" width="22" height="72" rx="8" fill={printedGreyLight} stroke={ink} strokeWidth="3.5" />
                  <rect x="10" y="64" width="22" height="72" rx="8" fill={printedGreyLight} stroke={ink} strokeWidth="3.5" />

                  {/* Coat */}
                  <path d="M -52 -24 L 52 -24 L 62 72 L -62 72 Z" fill={printedBlue} stroke={ink} strokeWidth="4" />
                  <rect x="-58" y="-28" width="24" height="12" rx="4" fill={brass} stroke={ink} strokeWidth="2.5" />
                  <rect x="34" y="-28" width="24" height="12" rx="4" fill={brass} stroke={ink} strokeWidth="2.5" />
                  <line x1="-40" y1="-22" x2="44" y2="70" stroke={stampRed} strokeWidth="10" />

                  {/* Left Arm on hip */}
                  <g transform="translate(-52, -6) rotate(22)">
                    <rect x="-18" y="-6" width="24" height="68" rx="11" fill={printedBlue} stroke={ink} strokeWidth="3.5" />
                    <BrassPin03 cx={-4} cy={6} />
                  </g>

                  {/* Right Arm thrusting Ultimatum Scroll */}
                  <g transform={`translate(52, -8) rotate(${-78 + britArmShake})`}>
                    <rect x="-8" y="-6" width="26" height="82" rx="12" fill={printedBlue} stroke={ink} strokeWidth="3.5" />
                    <BrassPin03 cx={4} cy={6} />
                  </g>

                  {/* Head + Angry Expression + Bicorne Hat */}
                  <g transform="translate(0, -32)">
                    <circle cx="0" cy="-36" r="38" fill="#F2D7B9" stroke={ink} strokeWidth="4" />
                    {/* Angry Eyebrows */}
                    <line x1="-24" y1="-52" x2="-6" y2="-44" stroke={ink} strokeWidth="4.5" strokeLinecap="round" />
                    <line x1="24" y1="-52" x2="6" y2="-44" stroke={ink} strokeWidth="4.5" strokeLinecap="round" />
                    <circle cx="-13" cy="-40" r="3.5" fill={ink} />
                    <circle cx="13" cy="-40" r="3.5" fill={ink} />
                    {/* Big Mustache */}
                    <path
                      d="M -26 -24 Q -12 -34 0 -24 Q 12 -34 26 -24 Q 12 -14 0 -20 Q -12 -14 -26 -24 Z"
                      fill={printedGrey}
                      stroke={ink}
                      strokeWidth="2.5"
                    />
                    {/* Bicorne Hat */}
                    <path d="M -62 -60 Q 0 -116 62 -60 Q 0 -48 -62 -60 Z" fill={printedBlue} stroke={ink} strokeWidth="4" />
                    <circle cx="0" cy="-76" r="8" fill={brass} stroke={ink} strokeWidth="2.5" />
                    <BrassPin03 cx={0} cy={0} r={6} />
                  </g>

                  <BrassPin03 cx={-20} cy={68} r={5} />
                  <BrassPin03 cx={20} cy={68} r={5} />
                </g>

                {/* Unrolling Paper ULTIMATUM Document */}
                <g
                  transform={`translate(455, 250) scale(${interpolate(scrollUnroll, [0, 1], [0.2, 1])}) rotate(-2)`}
                  opacity={scrollUnroll}
                >
                  <rect x="-110" y="-82" width="220" height="164" rx="6" fill={paper} stroke={ink} strokeWidth="4" />
                  <rect x="-124" y="-92" width="248" height="20" rx="10" fill={brass} stroke={ink} strokeWidth="3.5" />
                  <rect x="-124" y="72" width="248" height="20" rx="10" fill={brass} stroke={ink} strokeWidth="3.5" />
                  <text x="0" y="-36" textAnchor="middle" fontSize="26" fontWeight="900" fill={stampRed}>
                    ULTIMATUM!
                  </text>
                  <line x1="-82" y1="-16" x2="82" y2="-16" stroke={ink} strokeWidth="3" />
                  <text x="0" y="14" textAnchor="middle" fontSize="20" fontWeight="800" fill={ink}>
                    1. MENYERAH
                  </text>
                  <text x="0" y="44" textAnchor="middle" fontSize="20" fontWeight="800" fill={ink}>
                    2. TINGGALKAN ISTANA
                  </text>
                  {/* Red Wax Seal */}
                  <circle cx="76" cy="54" r="18" fill={stampRed} stroke={ink} strokeWidth="2.8" />
                </g>

                {/* Bold Comic Speech Bubble (Top Right inside panel) */}
                <g
                  transform={`translate(625, 102) scale(${interpolate(bubblePop, [0, 1], [0.3, 1])})`}
                  opacity={bubblePop}
                >
                  <path
                    d="M -210 -66 L 210 -66 Q 228 -66 228 -48 L 228 42 Q 228 60 210 60 L -110 60 L -178 96 L -152 60 L -210 60 Q -228 60 -228 42 L -228 -48 Q -228 -66 -210 -66 Z"
                    fill="#FFFFFF"
                    stroke={ink}
                    strokeWidth="4.5"
                    strokeLinejoin="round"
                  />
                  <text x="0" y="-12" textAnchor="middle" fontSize="28" fontWeight="900" fill={ink}>
                    MENYERAH &amp; KELUAR
                  </text>
                  <text x="0" y="26" textAnchor="middle" fontSize="28" fontWeight="900" fill={stampRed}>
                    DARI ISTANA SEKARANG!
                  </text>
                </g>
              </svg>
            </PaperCard>
          </SpringIn>
        </div>
      </div>
    </AbsoluteFill>
  );
};