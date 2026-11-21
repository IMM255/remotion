import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const SCENE08_DURATION_SECONDS = 5.54;
export const SCENE08_FPS = 30;
export const SCENE08_DURATION_FRAMES = Math.round(
  SCENE08_DURATION_SECONDS * SCENE08_FPS
); // ~166 frames

export const Scene08: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Gentle zoom-out from 1.05 to 1.0
  const zoomOut = interpolate(frame, [0, SCENE08_DURATION_FRAMES], [1.05, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Quote card entrance from left
  const quoteSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 16, stiffness: 115 },
  });
  const quoteX = interpolate(quoteSpring, [0, 1], [-120, 0]);

  // Faceless character subtle nod
  const nodY = Math.sin(frame * 0.14) * 5;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0F172A",
        overflow: "hidden",
        transform: `scale(${zoomOut})`,
        fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Emerald & teal calm strategic accent */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 42%, rgba(16, 185, 129, 0.18), rgba(15, 23, 42, 0.98) 68%)",
        }}
      />

      {/* Centered-Left Quote Highlight */}
      <div
        style={{
          position: "absolute",
          top: 230,
          left: 64,
          right: 64,
          transform: `translateX(${quoteX}px)`,
          opacity: quoteSpring,
        }}
      >
        <div
          style={{
            color: "#34D399",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 18,
          }}
        >
          Strategi Sosial
        </div>
        <div
          style={{
            backgroundColor: "rgba(30, 41, 59, 0.85)",
            border: "1px solid rgba(52, 211, 153, 0.35)",
            borderRadius: 28,
            padding: "36px 40px",
            color: "#F8FAFC",
            fontSize: 44,
            fontWeight: 800,
            lineHeight: 1.28,
          }}
        >
          Kata “sebentar” kadang dipakai biar orang lain tetap mau menunggu.
        </div>
      </div>

      {/* Faceless Character at bottom-center */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 150,
          width: 420,
          height: 520,
          transform: `translateX(-50%) translateY(${nodY}px)`,
        }}
      >
        <svg width="420" height="520" viewBox="0 0 420 520" fill="none">
          {/* Faceless head & calm expression silhouette */}
          <circle cx="210" cy="130" r="82" fill="#F1C29B" />
          <path
            d="M124 114 C124 54, 164 28, 210 28 C256 28, 294 56, 294 114 C264 88, 156 88, 124 114 Z"
            fill="#0F172A"
          />
          {/* Shoulders & jacket */}
          <path
            d="M95 255 C135 222, 285 222, 325 255 L355 520 L65 520 Z"
            fill="#059669"
          />
          {/* Subtle "wait / hold on" open palm */}
          <circle cx="318" cy="310" r="36" fill="#F1C29B" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};