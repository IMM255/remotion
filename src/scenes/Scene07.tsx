import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const SCENE07_DURATION_SECONDS = 5.9;
export const SCENE07_FPS = 30;
export const SCENE07_DURATION_FRAMES = Math.round(
  SCENE07_DURATION_SECONDS * SCENE07_FPS
); // ~177 frames

export const Scene07: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Diagonal motion from top-right to bottom-left
  const diagX = interpolate(frame, [0, SCENE07_DURATION_FRAMES], [24, -24], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const diagY = interpolate(frame, [0, SCENE07_DURATION_FRAMES], [-18, 18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Staggered items: Baju -> Dompet -> Kunci Motor
  const item1 = spring({ frame: frame - 8, fps, config: { damping: 14 } });
  const item2 = spring({ frame: frame - 34, fps, config: { damping: 14 } });
  const item3 = spring({ frame: frame - 60, fps, config: { damping: 14 } });

  // Panicked / searching bob on character
  const searchWobble = Math.sin(frame * 0.35) * 6;

  const fadeOut = interpolate(
    frame,
    [SCENE07_DURATION_FRAMES - 12, SCENE07_DURATION_FRAMES],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#18181B",
        overflow: "hidden",
        opacity: fadeOut,
        fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Subtle rose/coral alert glow */}
      <div
        style={{
          position: "absolute",
          inset: -80,
          transform: `translate(${diagX}px, ${diagY}px)`,
          background:
            "radial-gradient(circle at 80% 70%, rgba(244, 63, 94, 0.18), rgba(24, 24, 27, 0.98) 65%)",
        }}
      />

      {/* Top Caption */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 64,
          right: 64,
          transform: `translate(${diagX * 0.4}px, ${diagY * 0.4}px)`,
        }}
      >
        <div
          style={{
            color: "#FB7185",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          Realita di Lapangan
        </div>
        <div
          style={{
            color: "#FAFAFA",
            fontSize: 46,
            fontWeight: 800,
            lineHeight: 1.22,
          }}
        >
          Realitanya? Tambahan drama dadakan.
        </div>
      </div>

      {/* Three Stacked Distraction Cards */}
      <div
        style={{
          position: "absolute",
          top: 390,
          left: 64,
          right: 64,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {[
          {
            label: "1. Pilih baju yang pas",
            sub: "Ganti dua kali, belum cocok juga",
            prog: item1,
            accent: "#FB7185",
          },
          {
            label: "2. Cari dompet",
            sub: "Terselip di bawah tumpukan berkas",
            prog: item2,
            accent: "#F59E0B",
          },
          {
            label: "3. Nyari kunci motor",
            sub: "Entah ditaruh di mana...",
            prog: item3,
            accent: "#A78BFA",
          },
        ].map((card, i) => (
          <div
            key={i}
            style={{
              opacity: card.prog,
              transform: `translateX(${interpolate(
                card.prog,
                [0, 1],
                [90, 0]
              )}px)`,
              backgroundColor: "#27272A",
              borderLeft: `8px solid ${card.accent}`,
              borderRadius: 20,
              padding: "24px 30px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{ color: "#FAFAFA", fontSize: 34, fontWeight: 700 }}
              >
                {card.label}
              </div>
              <div
                style={{
                  color: "#A1A1AA",
                  fontSize: 24,
                  marginTop: 6,
                }}
              >
                {card.sub}
              </div>
            </div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: "rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: card.accent,
                fontSize: 26,
                fontWeight: 800,
              }}
            >
              ?
            </div>
          </div>
        ))}
      </div>

      {/* Faceless Character at bottom-right searching */}
      <div
        style={{
          position: "absolute",
          right: 64,
          bottom: 140,
          width: 360,
          height: 430,
          transform: `translateX(${searchWobble}px)`,
        }}
      >
        <svg width="360" height="430" viewBox="0 0 360 430" fill="none">
          <circle cx="180" cy="110" r="68" fill="#F1C29B" />
          <path
            d="M112 96 C112 46, 146 24, 182 24 C218 24, 248 48, 248 96 Z"
            fill="#18181B"
          />
          <path
            d="M90 210 C120 185, 240 185, 270 210 L295 430 L65 430 Z"
            fill="#E11D48"
          />
          {/* Question marks floating above */}
          <text
            x="255"
            y="65"
            fill="#FB7185"
            fontSize="44"
            fontWeight="900"
          >
            ??
          </text>
        </svg>
      </div>
    </AbsoluteFill>
  );
};