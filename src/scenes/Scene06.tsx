import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const SCENE06_DURATION_SECONDS = 12.46;
export const SCENE06_FPS = 30;
export const SCENE06_DURATION_FRAMES = Math.round(
  SCENE06_DURATION_SECONDS * SCENE06_FPS
); // ~374 frames

export const Scene06: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Horizontal pan from left to right across the scene
  const panX = interpolate(frame, [0, SCENE06_DURATION_FRAMES], [28, -28], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Badge & "PLANNING FALLACY" title spring
  const titleSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  // "5 MENIT" optimistic bubble pop-in
  const bubbleSpring = spring({
    frame: frame - 95,
    fps,
    config: { damping: 12, stiffness: 140 },
  });
  const bubbleScale = interpolate(bubbleSpring, [0, 1], [0.4, 1]);

  // Character enters from bottom-left
  const charSpring = spring({
    frame: frame - 24,
    fps,
    config: { damping: 17, stiffness: 105 },
  });
  const charY = interpolate(charSpring, [0, 1], [150, 0]);

  // Shower droplets gentle vertical cycle
  const dropOffset = (frame * 6) % 70;

  const fadeOut = interpolate(
    frame,
    [SCENE06_DURATION_FRAMES - 15, SCENE06_DURATION_FRAMES],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#111827",
        overflow: "hidden",
        opacity: fadeOut,
        fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Warm amber-violet background gradient */}
      <div
        style={{
          position: "absolute",
          inset: -70,
          transform: `translateX(${panX}px)`,
          background:
            "radial-gradient(circle at 25% 35%, rgba(251, 191, 36, 0.16), rgba(17, 24, 39, 0.98) 65%)",
        }}
      />

      {/* Top Header: Planning Fallacy */}
      <div
        style={{
          position: "absolute",
          top: 125,
          left: 64,
          right: 64,
          transform: `translateX(${panX * 0.5}px) scale(${interpolate(
            titleSpring,
            [0, 1],
            [0.94, 1]
          )})`,
          opacity: titleSpring,
        }}
      >
        <div
          style={{
            color: "#FBBF24",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Planning Fallacy
        </div>
        <div
          style={{
            color: "#F9FAFB",
            fontSize: 48,
            fontWeight: 800,
            lineHeight: 1.2,
          }}
        >
          Meremehkan durasi tugas yang sebenarnya.
        </div>
      </div>

      {/* Shower head & droplets on upper-right */}
      <div
        style={{
          position: "absolute",
          top: 410,
          right: 90,
          transform: `translateX(${panX * 0.7}px)`,
        }}
      >
        <svg width="260" height="260" viewBox="0 0 260 260" fill="none">
          <path
            d="M190 0 V45 C190 68, 170 84, 145 84 H115"
            stroke="#9CA3AF"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M75 84 H155 L170 116 H60 Z"
            fill="#D1D5DB"
          />
          {[0, 1, 2, 3].map((idx) => (
            <line
              key={idx}
              x1={78 + idx * 26}
              y1={134 + ((dropOffset + idx * 14) % 70)}
              x2={74 + idx * 26}
              y2={156 + ((dropOffset + idx * 14) % 70)}
              stroke="#38BDF8"
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.8"
            />
          ))}
        </svg>
      </div>

      {/* Faceless Character (Left-center, confident / optimistic posture) */}
      <div
        style={{
          position: "absolute",
          left: 72,
          bottom: 230,
          width: 440,
          height: 680,
          transform: `translate(${panX * 0.8 + 0}px, ${charY}px)`,
          opacity: charSpring,
        }}
      >
        <svg width="440" height="680" viewBox="0 0 440 680" fill="none">
          {/* Faceless head & towel wrap */}
          <circle cx="210" cy="135" r="78" fill="#F1C29B" />
          <path
            d="M128 118 C128 62, 168 34, 212 34 C256 34, 294 64, 292 118 C264 96, 162 96, 128 118 Z"
            fill="#E2E8F0"
          />
          {/* Casual shirt / robe */}
          <path
            d="M110 250 C145 220, 275 220, 310 250 L338 680 L82 680 Z"
            fill="#2563EB"
          />
          {/* Thumbs-up / confident gesture */}
          <circle cx="332" cy="340" r="34" fill="#F1C29B" />
          <path
            d="M324 312 V276 C324 266, 342 266, 342 278 V312 Z"
            fill="#F1C29B"
          />
        </svg>
      </div>

      {/* Optimistic "5 MENIT" Callout Bubble */}
      <div
        style={{
          position: "absolute",
          right: 76,
          bottom: 360,
          transform: `translateX(${panX * 0.6}px) scale(${bubbleScale})`,
          opacity: bubbleSpring,
          backgroundColor: "#FBBF24",
          color: "#111827",
          borderRadius: 28,
          padding: "24px 34px",
          boxShadow: "0 18px 40px rgba(251, 191, 36, 0.28)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.06em" }}>
          ESTIMASI AWAL
        </div>
        <div style={{ fontSize: 54, fontWeight: 900, lineHeight: 1.1 }}>
          5 MENIT!
        </div>
      </div>
    </AbsoluteFill>
  );
};