import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { KineticWords, PaperCard, SpringIn, TagPin } from "../components/MotionKit";
import type { StyleTheme } from "../styles";

const BrassPin04: React.FC<{ cx: number; cy: number; r?: number }> = ({ cx, cy, r = 5.5 }) => (
  <g transform={`translate(${cx}, ${cy})`}>
    <circle r={r + 1.2} cx={1.2} cy={1.8} fill="rgba(28,33,40,0.28)" />
    <circle r={r} fill="#D4A238" stroke="#1C2128" strokeWidth={1.7} />
    <circle r={r * 0.45} cx={-r * 0.18} cy={-r * 0.18} fill="#F5D985" />
    <line x1={-r * 0.7} y1={0} x2={r * 0.7} y2={0} stroke="#6E4E12" strokeWidth={1.4} />
  </g>
);

export const Scene04: React.FC<{ theme: StyleTheme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = theme as unknown as Record<string, string | undefined>;

  const ink = t?.ink ?? "#1C2128";
  const paper = t?.paper ?? "#F4EFE2";
  const printedBlue = "#2C5B88";
  const printedBlueMid = "#5E8DB8";
  const printedBluePale = "#D8E6F2";
  const printedGrey = "#6A747E";
  const printedGreyLight = "#CFD5DA";
  const brass = "#D4A238";
  const fireRed = "#C44536";

  // Smooth camera & shadow motion every frame + subtle impact shake during bombardment
  const sec = frame / fps;
  const firingActive = frame >= 105;
  const impactBeat = firingActive ? Math.max(0, Math.sin((frame - 105) * 0.42) - 0.65) : 0;
  const shakeX = impactBeat * Math.sin(frame * 2.7) * 14;
  const shakeY = impactBeat * Math.cos(frame * 3.1) * 10;

  const camX = Math.sin(sec * 0.7) * 8 + shakeX;
  const camY = Math.cos(sec * 0.6) * 6 + shakeY;
  const camScale = interpolate(frame, [0, 294], [0.98, 1.045], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shadowX = 11 + Math.sin(sec * 0.9) * 4;
  const shadowY = 15 + Math.cos(sec * 0.8) * 3;

  // Puppets, ships, and explosions on twos (~12 poses/sec at 30fps)
  const puppetFrame = Math.floor(frame / 2.5) * 2.5;
  const puppetSec = puppetFrame / fps;

  const shipBob1 = Math.sin(puppetSec * 3.4) * 5;
  const shipBob2 = Math.sin(puppetSec * 3.4 + 1.4) * 5;
  const shipBob3 = Math.sin(puppetSec * 3.4 + 2.6) * 5;
  const recoil1 = firingActive ? Math.max(0, Math.sin(puppetSec * 6.2)) * 9 : 0;
  const recoil2 = firingActive ? Math.max(0, Math.sin(puppetSec * 6.2 + 2.1)) * 9 : 0;

  // Springs for narrative beats (9.79s = ~294 frames)
  const ignoredStamp = spring({
    frame: Math.max(0, frame - 24),
    fps,
    config: { damping: 10, stiffness: 220, mass: 0.7 },
  });
  const fleetEnter = spring({
    frame: Math.max(0, frame - 72),
    fps,
    config: { damping: 13, stiffness: 120 },
  });
  const boom1 = spring({
    frame: Math.max(0, frame - 122),
    fps,
    config: { damping: 9, stiffness: 210 },
  });
  const boom2 = spring({
    frame: Math.max(0, frame - 165),
    fps,
    config: { damping: 9, stiffness: 210 },
  });

  // Cannonball progress cycles (12fps stepped)
  const shellT1 = firingActive ? ((puppetFrame - 105) % 45) / 45 : 0;
  const shellT2 = firingActive ? ((puppetFrame - 125 + 45) % 45) / 45 : 0;

  const evalArc = (p: number, x0: number, y0: number, cx: number, cy: number, x1: number, y1: number) => {
    const u = 1 - p;
    return {
      x: u * u * x0 + 2 * u * p * cx + p * p * x1,
      y: u * u * y0 + 2 * u * p * cy + p * p * y1,
    };
  };

  const ball1 = evalArc(shellT1, 290, 560, 480, 320, 725, 360);
  const ball2 = evalArc(shellT2, 330, 680, 520, 440, 755, 420);

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
            <TagPin text="27 AGUSTUS 1896 • PAGI HARI" />
          </SpringIn>
          <KineticWords
            text="ULTIMATUM DIABAIKAN, MERIAM MENGGEMA!"
            delay={10}
            style={{
              fontSize: 52,
              lineHeight: 1.06,
              fontWeight: 900,
              color: ink,
              letterSpacing: -1,
            }}
          />
        </div>

        {/* Main Naval Bombardment Comic Map Stage */}
        <SpringIn delay={16} style={{ flex: 1, marginTop: 18, marginBottom: 16, display: "flex" }}>
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
              boxShadow: `${shadowX}px ${shadowY}px 0px rgba(28,33,40,0.24)`,
              position: "relative",
            }}
          >
            {/* Top Strip */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: `3px dashed ${printedGrey}`,
                paddingBottom: 10,
                marginBottom: 10,
              }}
            >
              <span style={{ fontWeight: 900, fontSize: 21, color: printedBlue, letterSpacing: 1 }}>
                ARMADA INGGRIS VS ISTANA ZANZIBAR
              </span>
              <span style={{ fontWeight: 900, fontSize: 20, color: fireRed }}>
                09:00 PAGI
              </span>
            </div>

            <svg viewBox="0 0 920 820" style={{ width: "100%", height: "100%", overflow: "visible" }}>
              <defs>
                <pattern id="seaDots04" width="16" height="16" patternUnits="userSpaceOnUse">
                  <circle cx="5" cy="5" r="1.9" fill={printedBlueMid} opacity="0.35" />
                </pattern>
                <pattern id="islandHatch04" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
                  <line x1="0" y1="0" x2="0" y2="12" stroke={printedGrey} strokeWidth="1.5" opacity="0.28" />
                </pattern>
              </defs>

              {/* Printed Blue Ocean */}
              <rect x="8" y="8" width="904" height="804" rx="8" fill={printedBluePale} stroke={ink} strokeWidth="3.5" />
              <rect x="8" y="8" width="904" height="804" fill="url(#seaDots04)" />

              {/* Morning Sun Cutout (Top Left) */}
              <g transform="translate(108, 102)">
                <circle r="48" fill={brass} stroke={ink} strokeWidth="3.5" />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                  <line
                    key={deg}
                    x1={Math.cos((deg * Math.PI) / 180) * 56}
                    y1={Math.sin((deg * Math.PI) / 180) * 56}
                    x2={Math.cos((deg * Math.PI) / 180) * 72}
                    y2={Math.sin((deg * Math.PI) / 180) * 72}
                    stroke={ink}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                ))}
              </g>

              {/* Crumpled Ultimatum Paper Scrap (Top Left-Center) */}
              <g transform="translate(295, 118) rotate(-7)">
                <polygon
                  points="-84,-52 78,-58 92,42 -68,56 -96,4"
                  fill={paper}
                  stroke={ink}
                  strokeWidth="3.5"
                />
                <line x1="-56" y1="-22" x2="54" y2="-26" stroke={printedGrey} strokeWidth="3" />
                <line x1="-58" y1="0" x2="48" y2="-4" stroke={printedGrey} strokeWidth="3" />
                <line x1="-48" y1="22" x2="36" y2="18" stroke={printedGrey} strokeWidth="3" />
                {/* Red DIABAIKAN stamp */}
                <g
                  transform={`rotate(10) scale(${interpolate(ignoredStamp, [0, 1], [2.1, 1])})`}
                  opacity={interpolate(ignoredStamp, [0, 0.25, 1], [0, 1, 1])}
                >
                  <rect x="-86" y="-22" width="172" height="44" rx="6" fill="rgba(244,239,226,0.92)" stroke={fireRed} strokeWidth="4.5" />
                  <text x="0" y="9" textAnchor="middle" fontSize="24" fontWeight="900" fill={fireRed}>
                    DIABAIKAN!
                  </text>
                </g>
              </g>

              {/* Upper-Right Island Scrap: ZANZIBAR & PALACE */}
              <path
                d="M 520 140 L 760 110 L 898 200 L 902 520 L 740 595 L 575 510 L 505 360 Z"
                fill="#EAE2CF"
                stroke={ink}
                strokeWidth="4"
              />
              <path
                d="M 520 140 L 760 110 L 898 200 L 902 520 L 740 595 L 575 510 L 505 360 Z"
                fill="url(#islandHatch04)"
              />

              {/* Paper-Cutout Zanzibar Palace under Fire */}
              <g transform={`translate(730, 385) rotate(${impactBeat * 2.5})`}>
                <ellipse cx={shadowX * 0.4} cy={82} rx="120" ry="18" fill="rgba(28,33,40,0.2)" />
                {/* Main Palace */}
                <rect x="-104" y="-36" width="208" height="114" fill={paper} stroke={ink} strokeWidth="4" />
                <rect x="-78" y="-74" width="156" height="38" fill={printedGreyLight} stroke={ink} strokeWidth="3.5" />
                <rect x="-24" y="-114" width="48" height="40" fill={paper} stroke={ink} strokeWidth="3.5" />
                <polygon points="-32,-114 0,-148 32,-114" fill={printedBlue} stroke={ink} strokeWidth="3.5" />
                {/* Windows/Arches */}
                {[-68, -24, 20, 64].map((wx) => (
                  <rect key={wx} x={wx - 11} y={14} width="22" height="44" rx="10" fill={printedGrey} stroke={ink} strokeWidth="2.5" />
                ))}
                {/* Palace Label */}
                <rect x="-92" y="92" width="184" height="38" rx="6" fill={printedGrey} stroke={ink} strokeWidth="3" />
                <text x="0" y="118" textAnchor="middle" fontSize="21" fontWeight="900" fill={paper}>
                  ISTANA ZANZIBAR
                </text>
              </g>

              {/* Dashed Cannonball Trajectory Arcs */}
              {firingActive && (
                <g opacity="0.72">
                  <path
                    d="M 290 560 Q 480 320 725 360"
                    fill="none"
                    stroke={fireRed}
                    strokeWidth="4"
                    strokeDasharray="10 10"
                  />
                  <path
                    d="M 330 680 Q 520 440 755 420"
                    fill="none"
                    stroke={fireRed}
                    strokeWidth="4"
                    strokeDasharray="10 10"
                  />
                </g>
              )}

              {/* BRITISH WARSHIP FLEET (Lower-Left, Brass-Pinned Cutouts on Twos) */}
              <g
                transform={`translate(${interpolate(fleetEnter, [0, 1], [-240, 0])}, 0)`}
                opacity={fleetEnter}
              >
                {/* Ship 1 (Upper-Left) */}
                <g transform={`translate(${188 - recoil1}, ${565 + shipBob1})`}>
                  <path d="M -112 0 L 118 0 L 92 42 L -88 42 Z" fill={printedGrey} stroke={ink} strokeWidth="3.8" />
                  <rect x="-48" y="-30" width="90" height="30" fill={printedGreyLight} stroke={ink} strokeWidth="3.2" />
                  <rect x="-26" y="-66" width="16" height="36" fill={brass} stroke={ink} strokeWidth="3" />
                  <rect x="10" y="-66" width="16" height="36" fill={brass} stroke={ink} strokeWidth="3" />
                  {/* Cannon barrel */}
                  <line x1="60" y1="-12" x2="108" y2="-28" stroke={ink} strokeWidth="9" strokeLinecap="round" />
                  <BrassPin04 cx={0} cy={18} />
                  {/* Muzzle Flash */}
                  {firingActive && recoil1 > 4 && (
                    <polygon
                      points="108,-28 134,-48 126,-26 148,-24 124,-12 132,6 106,-16"
                      fill={brass}
                      stroke={fireRed}
                      strokeWidth="3"
                    />
                  )}
                </g>

                {/* Ship 2 (Lower-Center) */}
                <g transform={`translate(${242 - recoil2}, ${690 + shipBob2})`}>
                  <path d="M -124 0 L 132 0 L 102 46 L -96 46 Z" fill={printedBlue} stroke={ink} strokeWidth="4" />
                  <rect x="-56" y="-34" width="104" height="34" fill={printedGreyLight} stroke={ink} strokeWidth="3.2" />
                  <rect x="-32" y="-74" width="18" height="40" fill={brass} stroke={ink} strokeWidth="3" />
                  <rect x="12" y="-74" width="18" height="40" fill={brass} stroke={ink} strokeWidth="3" />
                  <line x1="66" y1="-14" x2="118" y2="-32" stroke={ink} strokeWidth="10" strokeLinecap="round" />
                  <BrassPin04 cx={0} cy={22} />
                  {firingActive && recoil2 > 4 && (
                    <polygon
                      points="118,-32 146,-54 136,-30 160,-28 134,-14 142,6 116,-18"
                      fill={brass}
                      stroke={fireRed}
                      strokeWidth="3"
                    />
                  )}
                </g>

                {/* Ship 3 (Far Background) */}
                <g transform={`translate(115, ${465 + shipBob3}) scale(0.75)`}>
                  <path d="M -100 0 L 106 0 L 82 36 L -78 36 Z" fill={printedGrey} stroke={ink} strokeWidth="4" />
                  <rect x="-42" y="-26" width="80" height="26" fill={printedGreyLight} stroke={ink} strokeWidth="3.5" />
                  <rect x="-18" y="-56" width="14" height="30" fill={brass} stroke={ink} strokeWidth="3" />
                </g>

                {/* Fleet Label */}
                <g transform="translate(230, 772)">
                  <rect x="-136" y="-20" width="272" height="40" rx="6" fill={printedBlue} stroke={ink} strokeWidth="3.5" />
                  <text x="0" y="7" textAnchor="middle" fontSize="21" fontWeight="900" fill={paper}>
                    KAPAL PERANG INGGRIS
                  </text>
                </g>
              </g>

              {/* Flying Paper-Cutout Cannonballs */}
              {firingActive && (
                <>
                  <circle cx={ball1.x} cy={ball1.y} r="11" fill={ink} stroke={paper} strokeWidth="2.5" />
                  <circle cx={ball2.x} cy={ball2.y} r="11" fill={ink} stroke={paper} strokeWidth="2.5" />
                </>
              )}

              {/* Comic Paper-Cutout Explosion 1 ("DUAR!") */}
              <g
                transform={`translate(715, 345) scale(${interpolate(boom1, [0, 1], [0.1, 1]) * (0.94 + Math.sin(puppetSec * 7) * 0.08)})`}
                opacity={boom1}
              >
                <polygon
                  points="0,-78 22,-32 72,-48 42,-8 82,22 30,30 40,76 0,44 -42,72 -28,28 -78,18 -38,-12 -66,-52 -18,-34"
                  fill={brass}
                  stroke={ink}
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                <polygon
                  points="0,-46 14,-18 46,-26 26,-4 50,14 18,18 22,46 0,26 -24,44 -16,16 -48,10 -22,-8 -40,-30 -12,-20"
                  fill={fireRed}
                  stroke={ink}
                  strokeWidth="2.5"
                />
                <text x="0" y="10" textAnchor="middle" fontSize="30" fontWeight="900" fill={paper}>
                  DUAR!
                </text>
              </g>

              {/* Comic Paper-Cutout Explosion 2 ("BOOM!") */}
              <g
                transform={`translate(805, 425) scale(${interpolate(boom2, [0, 1], [0.1, 0.92]) * (0.94 + Math.cos(puppetSec * 6.5) * 0.08)})`}
                opacity={boom2}
              >
                <polygon
                  points="0,-68 18,-28 62,-42 36,-6 70,18 26,26 34,64 0,38 -36,62 -24,24 -66,14 -32,-10 -56,-44 -16,-28"
                  fill={paper}
                  stroke={ink}
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                <text x="0" y="9" textAnchor="middle" fontSize="26" fontWeight="900" fill={fireRed}>
                  BOOM!
                </text>
              </g>
            </svg>
          </PaperCard>
        </SpringIn>
      </div>
    </AbsoluteFill>
  );
};