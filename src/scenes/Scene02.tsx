import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { KineticWords, PaperCard, SpringIn, TagPin } from "../components/MotionKit";
import type { StyleTheme } from "../styles";

const BrassSplitPin: React.FC<{ cx: number; cy: number; r?: number; angle?: number }> = ({
  cx,
  cy,
  r = 6,
  angle = -20,
}) => (
  <g transform={`translate(${cx}, ${cy}) rotate(${angle})`}>
    <circle r={r + 1.2} fill="rgba(28,33,40,0.28)" cx={1.3} cy={1.8} />
    <circle r={r} fill="#D4A238" stroke="#1C2128" strokeWidth={1.8} />
    <circle r={r * 0.45} cx={-r * 0.2} cy={-r * 0.2} fill="#F5D985" />
    <line x1={-r * 0.7} y1={0} x2={r * 0.7} y2={0} stroke="#6E4E12" strokeWidth={1.5} />
  </g>
);

export const Scene02: React.FC<{ theme: StyleTheme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = theme as unknown as Record<string, string | undefined>;

  const ink = t?.ink ?? "#1C2128";
  const paper = t?.paper ?? "#F4EFE2";
  const printedBlue = "#2C5B88";
  const printedBlueMid = "#5E8DB8";
  const printedBluePale = "#DCE8F2";
  const printedGrey = "#6E7882";
  const printedGreyLight = "#CFD5DA";
  const brass = "#D4A238";
  const accentRed = "#C44536";

  // Smooth camera drift & shadow motion every frame
  const sec = frame / fps;
  const camX = Math.sin(sec * 0.65) * 10;
  const camY = Math.cos(sec * 0.55) * 7;
  const camScale = interpolate(frame, [0, 428], [0.97, 1.035], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shadowX = 11 + Math.sin(sec * 0.85) * 4;
  const shadowY = 15 + Math.cos(sec * 0.75) * 3;

  // Puppets & map cutouts on twos (~12 poses/sec at 30fps)
  const puppetFrame = Math.floor(frame / 2.5) * 2.5;
  const puppetSec = puppetFrame / fps;

  const britLean = Math.sin(puppetSec * 2.8) * 3.5;
  const britArmLift = Math.sin(puppetSec * 3.6) * 8;
  const shipBobY = Math.sin(puppetSec * 3.2) * 5;
  const shipTilt = Math.cos(puppetSec * 3.2) * 2.5;

  const zanzLean = Math.sin(puppetSec * 2.6 + 1.2) * 3.5;
  const zanzArmGesture = Math.sin(puppetSec * 4.0) * 10;

  // Staggered spring animations across the 14.25s scene
  const britEnter = spring({
    frame: Math.max(0, frame - 42),
    fps,
    config: { damping: 13, stiffness: 130 },
  });
  const zanzEnter = spring({
    frame: Math.max(0, frame - 74),
    fps,
    config: { damping: 13, stiffness: 130 },
  });

  // Paper scrap slap onto map mid-scene ("PERANG TERSINGKAT")
  const slapSpring = spring({
    frame: Math.max(0, frame - 168),
    fps,
    config: { damping: 10, stiffness: 220, mass: 0.75 },
  });
  const slapScale = interpolate(slapSpring, [0, 1], [2.2, 1]);
  const slapRotate = interpolate(slapSpring, [0, 1], [-18, -4.5]);
  const slapOpacity = interpolate(slapSpring, [0, 0.2, 1], [0, 1, 1]);

  // Stopwatch record arc animation
  const recordSweep = interpolate(frame, [215, 310], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const arcAngle = recordSweep * 228;
  const arcRad = ((arcAngle - 90) * Math.PI) / 180;
  const arcX = Math.cos(arcRad) * 42;
  const arcY = Math.sin(arcRad) * 42;
  const largeArc = arcAngle > 180 ? 1 : 0;

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
        {/* Top Historical Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <SpringIn delay={4}>
              <TagPin text="TAHUN 1896" />
            </SpringIn>
            <SpringIn delay={14}>
              <span
                style={{
                  background: paper,
                  color: printedBlue,
                  border: `3px solid ${ink}`,
                  padding: "6px 16px",
                  fontWeight: 900,
                  fontSize: 22,
                  letterSpacing: 1,
                }}
              >
                BENAR-BENAR TERJADI
              </span>
            </SpringIn>
          </div>
          <KineticWords
            text="INGGRIS VS KESULTANAN ZANZIBAR"
            delay={18}
            style={{
              fontSize: 54,
              lineHeight: 1.06,
              fontWeight: 900,
              color: ink,
              letterSpacing: -1,
            }}
          />
        </div>

        {/* Center Tabletop Printed Map Stage */}
        <SpringIn delay={22} style={{ flex: 1, marginTop: 18, marginBottom: 18, display: "flex" }}>
          <PaperCard
            style={{
              width: "100%",
              background: paper,
              border: `4.5px solid ${ink}`,
              borderRadius: 12,
              padding: 18,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: `${shadowX}px ${shadowY}px 0px rgba(28,33,40,0.22)`,
              position: "relative",
            }}
          >
            {/* Map Title Strip */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: `3px dashed ${printedGrey}`,
                paddingBottom: 10,
                marginBottom: 12,
              }}
            >
              <span style={{ fontWeight: 900, fontSize: 22, color: printedBlue, letterSpacing: 1 }}>
                PETA KONFLIK • SELAT ZANZIBAR
              </span>
              <span style={{ fontWeight: 800, fontSize: 20, color: printedGrey }}>
                27 AGUSTUS 1896
              </span>
            </div>

            {/* Printed Map + Brass-Pinned Country Puppets */}
            <svg viewBox="0 0 920 760" style={{ width: "100%", height: "100%", overflow: "visible" }}>
              <defs>
                <pattern id="seaHalftone02" width="16" height="16" patternUnits="userSpaceOnUse">
                  <circle cx="5" cy="5" r="1.9" fill={printedBlueMid} opacity="0.35" />
                </pattern>
                <pattern id="landHatch02" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                  <line x1="0" y1="0" x2="0" y2="12" stroke={printedGrey} strokeWidth="1.5" opacity="0.28" />
                </pattern>
              </defs>

              {/* Printed Blue Ocean */}
              <rect
                x="8"
                y="8"
                width="904"
                height="744"
                rx="8"
                fill={printedBluePale}
                stroke={ink}
                strokeWidth="3.5"
              />
              <rect x="8" y="8" width="904" height="744" fill="url(#seaHalftone02)" />

              {/* Map Grid Lines */}
              {[180, 360, 540, 720].map((x) => (
                <line key={x} x1={x} y1={8} x2={x} y2={752} stroke={printedBlueMid} strokeWidth="1.5" strokeDasharray="6 8" opacity="0.45" />
              ))}
              {[190, 380, 570].map((y) => (
                <line key={y} x1={8} y1={y} x2={912} y2={y} stroke={printedBlueMid} strokeWidth="1.5" strokeDasharray="6 8" opacity="0.45" />
              ))}

              {/* Compass Rose (Top Center) */}
              <g transform="translate(460, 86)" opacity="0.72">
                <circle r="38" fill={paper} stroke={ink} strokeWidth="2.5" />
                <polygon points="0,-32 8,-6 0,0 -8,-6" fill={printedBlue} stroke={ink} strokeWidth="1.5" />
                <polygon points="0,32 8,6 0,0 -8,6" fill={printedGreyLight} stroke={ink} strokeWidth="1.5" />
                <polygon points="32,0 6,8 0,0 6,-8" fill={printedGreyLight} stroke={ink} strokeWidth="1.5" />
                <polygon points="-32,0 -6,8 0,0 -6,-8" fill={printedGreyLight} stroke={ink} strokeWidth="1.5" />
                <text x="0" y="-44" textAnchor="middle" fontSize="16" fontWeight="900" fill={ink}>
                  U
                </text>
              </g>

              {/* Left Printed Grey Land Scrap (Naval Approach) */}
              <path
                d="M 10 470 L 145 495 L 185 570 L 130 660 L 170 750 L 10 750 Z"
                fill="#E6DFCE"
                stroke={ink}
                strokeWidth="3.5"
              />
              <path
                d="M 10 470 L 145 495 L 185 570 L 130 660 L 170 750 L 10 750 Z"
                fill="url(#landHatch02)"
              />

              {/* Right Island Cutout: ZANZIBAR */}
              <path
                d="M 555 210 L 725 180 L 860 265 L 892 435 L 840 615 L 680 680 L 548 595 L 520 445 L 560 330 Z"
                fill="#EAE2CF"
                stroke={ink}
                strokeWidth="4"
              />
              <path
                d="M 555 210 L 725 180 L 860 265 L 892 435 L 840 615 L 680 680 L 548 595 L 520 445 L 560 330 Z"
                fill="url(#landHatch02)"
              />

              {/* Paper-Cutout Palace on Zanzibar Island (Beit al-Ajaib) */}
              <g transform="translate(755, 290)">
                <rect x="-56" y="-22" width="112" height="72" fill={paper} stroke={ink} strokeWidth="3.2" />
                <rect x="-42" y="-44" width="84" height="22" fill={printedGreyLight} stroke={ink} strokeWidth="3" />
                <rect x="-14" y="-70" width="28" height="26" fill={paper} stroke={ink} strokeWidth="3" />
                <polygon points="-18,-70 0,-90 18,-70" fill={printedBlue} stroke={ink} strokeWidth="2.8" />
                {/* Palace arches */}
                {[-34, -12, 10, 32].map((ax) => (
                  <rect key={ax} x={ax - 6} y={8} width="12" height="24" rx="6" fill={printedGrey} stroke={ink} strokeWidth="2" />
                ))}
              </g>

              {/* Paper-Cutout British Warship on Ocean (12fps bob) */}
              <g transform={`translate(225, ${595 + shipBobY}) rotate(${shipTilt})`}>
                <path
                  d="M -115 0 L 125 0 L 96 42 L -90 42 Z"
                  fill={printedGrey}
                  stroke={ink}
                  strokeWidth="3.8"
                />
                <rect x="-52" y="-32" width="96" height="32" fill={printedGreyLight} stroke={ink} strokeWidth="3.2" />
                {/* Funnels */}
                <rect x="-32" y="-70" width="18" height="38" fill={brass} stroke={ink} strokeWidth="3" />
                <rect x="8" y="-70" width="18" height="38" fill={brass} stroke={ink} strokeWidth="3" />
                {/* Smoke puffs */}
                <circle cx="-22" cy="-86" r="10" fill={paper} stroke={ink} strokeWidth="2.5" />
                <circle cx="18" cy="-92" r="13" fill={paper} stroke={ink} strokeWidth="2.5" />
                {/* Foam line */}
                <path d="M -132 46 Q -60 36 0 46 T 138 44" fill="none" stroke={printedBlue} strokeWidth="4" strokeLinecap="round" />
              </g>

              {/* Dotted tension line across the strait */}
              <path
                d="M 330 390 Q 460 330 590 390"
                fill="none"
                stroke={accentRed}
                strokeWidth="4.5"
                strokeDasharray="10 10"
                opacity={interpolate(frame, [95, 130], [0, 0.9], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })}
              />

              {/* LEFT PUPPET: INGGRIS (Brass-pinned Paper Puppet) */}
              <g
                transform={`translate(${interpolate(britEnter, [0, 1], [-180, 228])}, 360) rotate(${britLean})`}
                opacity={britEnter}
              >
                <ellipse cx={shadowX * 0.45} cy={170} rx="78" ry="15" fill="rgba(28,33,40,0.22)" />
                {/* Legs */}
                <rect x="-34" y="80" width="24" height="84" rx="8" fill={printedGreyLight} stroke={ink} strokeWidth="3.5" />
                <rect x="10" y="80" width="24" height="84" rx="8" fill={printedGreyLight} stroke={ink} strokeWidth="3.5" />

                {/* Naval Coat Torso */}
                <path
                  d="M -52 -24 L 52 -24 L 62 88 L -62 88 Z"
                  fill={printedBlue}
                  stroke={ink}
                  strokeWidth="4"
                />
                {/* Epaulettes & Sash */}
                <rect x="-58" y="-28" width="24" height="12" rx="4" fill={brass} stroke={ink} strokeWidth="2.5" />
                <rect x="34" y="-28" width="24" height="12" rx="4" fill={brass} stroke={ink} strokeWidth="2.5" />
                <line x1="-42" y1="-22" x2="46" y2="86" stroke={paper} strokeWidth="10" />
                <line x1="-42" y1="-22" x2="46" y2="86" stroke={ink} strokeWidth="2" />

                {/* Left Arm */}
                <g transform="translate(-52, -8) rotate(12)">
                  <rect x="-20" y="-6" width="26" height="78" rx="12" fill={printedBlue} stroke={ink} strokeWidth="3.5" />
                  <BrassSplitPin cx={-6} cy={6} r={5.5} />
                </g>

                {/* Right Arm holding Brass Spyglass */}
                <g transform={`translate(52, -8) rotate(${-58 + britArmLift})`}>
                  <rect x="-8" y="-6" width="26" height="78" rx="12" fill={printedBlue} stroke={ink} strokeWidth="3.5" />
                  {/* Spyglass */}
                  <polygon points="8,62 24,58 34,126 12,128" fill={brass} stroke={ink} strokeWidth="3" />
                  <BrassSplitPin cx={4} cy={6} r={5.5} />
                </g>

                {/* Head + Admiral Hat */}
                <g transform={`translate(0, -32) rotate(${-britLean * 0.7})`}>
                  <circle cx="0" cy="-36" r="38" fill="#F2D7B9" stroke={ink} strokeWidth="4" />
                  {/* Mustache & Monocle */}
                  <path d="M -22 -24 Q -10 -34 0 -24 Q 10 -34 22 -24" fill="none" stroke={printedGrey} strokeWidth="6" strokeLinecap="round" />
                  <circle cx="14" cy="-42" r="10" fill="rgba(255,255,255,0.45)" stroke={brass} strokeWidth="3" />
                  <circle cx="-12" cy="-42" r="3.5" fill={ink} />
                  <circle cx="14" cy="-42" r="3.5" fill={ink} />
                  {/* Bicorne Hat */}
                  <path
                    d="M -62 -60 Q 0 -116 62 -60 Q 0 -50 -62 -60 Z"
                    fill={printedBlue}
                    stroke={ink}
                    strokeWidth="4"
                  />
                  <circle cx="0" cy="-76" r="8" fill={brass} stroke={ink} strokeWidth="2.5" />
                  <BrassSplitPin cx={0} cy={0} r={6} />
                </g>

                <BrassSplitPin cx={-22} cy={84} r={5} />
                <BrassSplitPin cx={22} cy={84} r={5} />

                {/* Name Tag pinned to map */}
                <g transform="translate(0, 198)">
                  <rect x="-78" y="-22" width="156" height="44" rx="6" fill={printedBlue} stroke={ink} strokeWidth="3.5" />
                  <text x="0" y="8" textAnchor="middle" fontSize="24" fontWeight="900" fill={paper}>
                    INGGRIS
                  </text>
                </g>
              </g>

              {/* RIGHT PUPPET: KESULTANAN ZANZIBAR (Brass-pinned Paper Puppet) */}
              <g
                transform={`translate(${interpolate(zanzEnter, [0, 1], [1080, 690])}, 405) rotate(${zanzLean})`}
                opacity={zanzEnter}
              >
                <ellipse cx={shadowX * 0.45} cy={168} rx="78" ry="15" fill="rgba(28,33,40,0.22)" />
                {/* Robe Lower Skirt */}
                <path
                  d="M -46 58 L 46 58 L 58 164 L -58 164 Z"
                  fill={paper}
                  stroke={ink}
                  strokeWidth="3.8"
                />
                {/* Royal Coat Torso */}
                <path
                  d="M -50 -24 L 50 -24 L 58 84 L -58 84 Z"
                  fill={printedGrey}
                  stroke={ink}
                  strokeWidth="4"
                />
                {/* Gold Trim */}
                <rect x="-12" y="-24" width="24" height="108" fill={paper} stroke={ink} strokeWidth="2.5" />
                <line x1="0" y1="-22" x2="0" y2="82" stroke={brass} strokeWidth="4" strokeDasharray="6 6" />

                {/* Left Arm gesturing toward strait */}
                <g transform={`translate(-50, -8) rotate(${42 + zanzArmGesture})`}>
                  <rect x="-18" y="-6" width="26" height="78" rx="12" fill={printedGrey} stroke={ink} strokeWidth="3.5" />
                  <BrassSplitPin cx={-4} cy={6} r={5.5} />
                </g>

                {/* Right Arm */}
                <g transform="translate(50, -8) rotate(-14)">
                  <rect x="-8" y="-6" width="26" height="78" rx="12" fill={printedGrey} stroke={ink} strokeWidth="3.5" />
                  <BrassSplitPin cx={4} cy={6} r={5.5} />
                </g>

                {/* Head + Sultan Turban */}
                <g transform={`translate(0, -32) rotate(${-zanzLean * 0.7})`}>
                  <circle cx="0" cy="-36" r="38" fill="#C9966B" stroke={ink} strokeWidth="4" />
                  {/* Beard */}
                  <path d="M -28 -24 Q 0 12 28 -24 Q 0 -10 -28 -24 Z" fill={ink} />
                  <circle cx="-13" cy="-42" r="3.5" fill={ink} />
                  <circle cx="13" cy="-42" r="3.5" fill={ink} />
                  {/* Striped Turban */}
                  <path
                    d="M -46 -56 C -52 -112, 52 -112, 46 -56 Z"
                    fill={paper}
                    stroke={ink}
                    strokeWidth="4"
                  />
                  <path d="M -38 -74 Q 0 -92 38 -74" fill="none" stroke={printedBlue} strokeWidth="6" />
                  <path d="M -32 -88 Q 0 -104 32 -88" fill="none" stroke={brass} strokeWidth="5" />
                  <BrassSplitPin cx={0} cy={0} r={6} />
                </g>

                <BrassSplitPin cx={-20} cy={80} r={5} />
                <BrassSplitPin cx={20} cy={80} r={5} />

                {/* Name Tag pinned to island */}
                <g transform="translate(0, 198)">
                  <rect x="-92" y="-22" width="184" height="44" rx="6" fill={printedGrey} stroke={ink} strokeWidth="3.5" />
                  <text x="0" y="8" textAnchor="middle" fontSize="24" fontWeight="900" fill={paper}>
                    ZANZIBAR
                  </text>
                </g>
              </g>
            </svg>

            {/* Torn Paper Scrap Slapped onto Map Mid-Scene */}
            <div
              style={{
                position: "absolute",
                top: "44%",
                left: "50%",
                transform: `translate(-50%, -50%) rotate(${slapRotate}deg) scale(${slapScale})`,
                opacity: slapOpacity,
                background: paper,
                border: `4.5px solid ${ink}`,
                padding: "14px 28px",
                boxShadow: "10px 14px 0px rgba(28,33,40,0.28)",
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: accentRed,
                  letterSpacing: 2,
                }}
              >
                DIKENAL SEBAGAI
              </div>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 900,
                  color: ink,
                  lineHeight: 1.05,
                  whiteSpace: "nowrap",
                }}
              >
                PERANG TERSINGKAT!
              </div>
            </div>
          </PaperCard>
        </SpringIn>

        {/* Bottom Historical Record Card with Animated Stopwatch */}
        <SpringIn delay={205}>
          <PaperCard
            style={{
              background: paper,
              border: `4px solid ${ink}`,
              borderRadius: 10,
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              gap: 24,
              boxShadow: `${shadowX * 0.75}px ${shadowY * 0.75}px 0px rgba(28,33,40,0.22)`,
            }}
          >
            <svg viewBox="0 0 116 116" style={{ width: 98, height: 98, flexShrink: 0 }}>
              <rect x="46" y="4" width="24" height="10" rx="3" fill={brass} stroke={ink} strokeWidth="3" />
              <circle cx="58" cy="64" r="46" fill={printedBluePale} stroke={ink} strokeWidth="4" />
              <circle cx="58" cy="64" r="38" fill={paper} stroke={printedGrey} strokeWidth="2" />
              {recordSweep > 0.02 && (
                <path
                  d={`M 58 64 L 58 22 A 42 42 0 ${largeArc} 1 ${58 + arcX} ${64 + arcY} Z`}
                  fill={printedBlue}
                  opacity="0.78"
                />
              )}
              <line x1="58" y1="64" x2="58" y2="30" stroke={ink} strokeWidth="3.5" strokeLinecap="round" />
              <line
                x1="58"
                y1="64"
                x2={58 + arcX * 0.85}
                y2={64 + arcY * 0.85}
                stroke={accentRed}
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <BrassSplitPin cx={58} cy={64} r={5.5} />
            </svg>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: printedBlue,
                  letterSpacing: 1.5,
                }}
              >
                REKOR SEJARAH DUNIA • 1896
              </span>
              <span
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  color: ink,
                  lineHeight: 1.15,
                }}
              >
                Salah satu perang tersingkat yang pernah tercatat dalam sejarah.
              </span>
            </div>
          </PaperCard>
        </SpringIn>
      </div>
    </AbsoluteFill>
  );
};