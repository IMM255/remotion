import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const SCENE05_DURATION_SECONDS = 6.98;
export const SCENE05_FPS = 30;
export const SCENE05_DURATION_FRAMES = Math.round(
  SCENE05_DURATION_SECONDS * SCENE05_FPS
); // ~209 frames

export const Scene05: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtle ambient drift (bottom-left to upper-right)
  const driftX = interpolate(frame, [0, SCENE05_DURATION_FRAMES], [-18, 22], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const driftY = interpolate(frame, [0, SCENE05_DURATION_FRAMES], [16, -20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Character entrance from right side
  const charProgress = spring({
    frame: frame - 8,
    fps,
    config: { damping: 16, stiffness: 110, mass: 0.9 },
  });
  const charX = interpolate(charProgress, [0, 1], [140, 0]);
  const charOpacity = interpolate(charProgress, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Clock / estimation distortion wave
  const clockAngle = Math.sin(frame * 0.09) * 14;
  const waveShift = interpolate(frame, [20, 170], [-40, 40], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Caption reveal (top-left anchored, distinct from Scene04)
  const captionProgress = spring({
    frame: frame - 16,
    fps,
    config: { damping: 18, stiffness: 120 },
  });
  const captionY = interpolate(captionProgress, [0, 1], [-36, 0]);

  const fadeOut = interpolate(
    frame,
    [SCENE05_DURATION_FRAMES - 14, SCENE05_DURATION_FRAMES],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0F172A",
        overflow: "hidden",
        opacity: fadeOut,
        fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Background radial glow shifted toward upper-right */}
      <div
        style={{
          position: "absolute",
          inset: -80,
          transform: `translate(${driftX}px, ${driftY}px)`,
          background:
            "radial-gradient(circle at 72% 28%, rgba(56, 189, 248, 0.22), rgba(15, 23, 42, 0.96) 62%)",
        }}
      />

      {/* Abstract cognitive time-wave & distorted clock nodes on left/center */}
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${driftX * 0.45}px, ${driftY * 0.45}px)`,
        }}
      >
        <defs>
          <linearGradient id="waveGrad05" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#818CF8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Elastic time ruler / distorted timeline */}
        <path
          d={`M 90 920 Q ${340 + waveShift} ${780 - waveShift * 0.6}, 540 920 T 940 920`}
          fill="none"
          stroke="url(#waveGrad05)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d={`M 120 1010 Q ${360 - waveShift * 0.8} ${1130 + waveShift * 0.5}, 560 1010 T 920 1010`}
          fill="none"
          stroke="#64748B"
          strokeWidth="3"
          strokeDasharray="12 10"
          opacity="0.65"
        />

        {/* Floating distorted clock dial (upper-mid left) */}
        <g transform={`translate(275, 670) rotate(${clockAngle})`}>
          <circle
            cx="0"
            cy="0"
            r="96"
            fill="#1E293B"
            stroke="#38BDF8"
            strokeWidth="5"
          />
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="-56"
            stroke="#F8FAFC"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <line
            x1="0"
            y1="0"
            x2="44"
            y2="24"
            stroke="#38BDF8"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx="0" cy="0" r="8" fill="#38BDF8" />
        </g>
      </svg>

      {/* Faceless Character (Right-aligned, looking toward the distorted timeline) */}
      <div
        style={{
          position: "absolute",
          right: 48,
          bottom: 250,
          width: 470,
          height: 760,
          transform: `translateX(${charX}px)`,
          opacity: charOpacity,
        }}
      >
        <svg
          width="470"
          height="760"
          viewBox="0 0 470 760"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Faceless stylized head & neck */}
          <path
            d="M210 130 C210 72, 255 38, 308 38 C362 38, 405 74, 405 132 C405 186, 368 228, 322 236 L326 296 L252 296 L256 234 C226 218, 210 178, 210 130 Z"
            fill="#F1C29B"
          />
          {/* Minimalist faceless hair silhouette */}
          <path
            d="M206 122 C206 58, 256 24, 314 24 C374 24, 414 66, 412 126 C394 94, 356 80, 302 84 C258 88, 228 104, 206 122 Z"
            fill="#1E293B"
          />
          {/* Hoodie / casual jacket torso */}
          <path
            d="M145 318 C175 286, 224 278, 288 278 C352 278, 402 292, 430 335 L455 760 L115 760 Z"
            fill="#334155"
          />
          {/* Hand raised near temple in thought */}
          <path
            d="M242 292 C196 270, 178 228, 198 186 C210 162, 236 164, 240 188 L244 226 L282 268 Z"
            fill="#F1C29B"
          />
        </svg>
      </div>

      {/* Top-Left Editorial Caption Block */}
      <div
        style={{
          position: "absolute",
          top: 130,
          left: 64,
          right: 64,
          transform: `translateY(${captionY}px)`,
          opacity: captionProgress,
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "8px 18px",
            borderRadius: 999,
            backgroundColor: "rgba(56, 189, 248, 0.16)",
            border: "1px solid rgba(56, 189, 248, 0.45)",
            color: "#7DD3FC",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 22,
          }}
        >
          Psikologi Waktu
        </div>
        <div
          style={{
            color: "#F8FAFC",
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1.22,
            maxWidth: 920,
          }}
        >
          Otak manusia nggak selalu akurat memperkirakan waktu.
        </div>
      </div>
    </AbsoluteFill>
  );
};