import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const FONT_FAMILY =
  "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif";

export const Scene10: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Snappy 1.37s (~41 frames @ 30fps) center zoom-in beat
  const totalFrames = Math.max(1, Math.round(fps * 1.37));

  const zoomScale = interpolate(frame, [0, totalFrames], [0.92, 1.05], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const badgePop = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 210, mass: 0.75 },
  });

  const textPop = spring({
    frame: Math.max(0, frame - Math.round(fps * 0.1)),
    fps,
    config: { damping: 14, stiffness: 220, mass: 0.7 },
  });

  const q1 = spring({
    frame: Math.max(0, frame - Math.round(fps * 0.18)),
    fps,
    config: { damping: 11, stiffness: 240, mass: 0.65 },
  });

  const q2 = spring({
    frame: Math.max(0, frame - Math.round(fps * 0.3)),
    fps,
    config: { damping: 11, stiffness: 240, mass: 0.65 },
  });

  const q3 = spring({
    frame: Math.max(0, frame - Math.round(fps * 0.42)),
    fps,
    config: { damping: 11, stiffness: 240, mass: 0.65 },
  });

  // Animated ellipsis dots
  const dot1 = interpolate(frame, [fps * 0.45, fps * 0.6], [0.25, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const dot2 = interpolate(frame, [fps * 0.65, fps * 0.8], [0.25, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const dot3 = interpolate(frame, [fps * 0.85, fps * 1.0], [0.25, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const headLean = interpolate(badgePop, [0, 1], [-8, 4]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#FEF3C7',
        fontFamily: FONT_FAMILY,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Radial sunburst rays */}
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.45,
          transform: `rotate(${frame * 0.35}deg)`,
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <polygon
            key={i}
            points="540,960 470,-120 610,-120"
            fill="#FDE68A"
            transform={`rotate(${i * 30} 540 960)`}
          />
        ))}
      </svg>

      {/* Center Zoom Stage */}
      <div
        style={{
          position: 'relative',
          width: 1080,
          height: 1920,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${zoomScale})`,
        }}
      >
        {/* Radial Popping Question Marks */}
        <div
          style={{
            position: 'absolute',
            top: 410,
            left: 165,
            fontSize: 128,
            fontWeight: 900,
            color: '#FF5A36',
            WebkitTextStroke: '4px #181A20',
            transform: `scale(${q1}) rotate(-18deg) translateY(${interpolate(q1, [0, 1], [60, 0])}px)`,
            opacity: q1,
          }}
        >
          ?
        </div>
        <div
          style={{
            position: 'absolute',
            top: 340,
            right: 175,
            fontSize: 152,
            fontWeight: 900,
            color: '#2563EB',
            WebkitTextStroke: '4px #181A20',
            transform: `scale(${q2}) rotate(16deg) translateY(${interpolate(q2, [0, 1], [70, 0])}px)`,
            opacity: q2,
          }}
        >
          ?
        </div>
        <div
          style={{
            position: 'absolute',
            top: 660,
            right: 110,
            fontSize: 96,
            fontWeight: 900,
            color: '#14B8A6',
            WebkitTextStroke: '3.5px #181A20',
            transform: `scale(${q3}) rotate(24deg) translateY(${interpolate(q3, [0, 1], [40, 0])}px)`,
            opacity: q3,
          }}
        >
          ?
        </div>

        {/* Spotlight Arch Frame with Faceless Thinking Character */}
        <div
          style={{
            width: 580,
            height: 640,
            borderRadius: '290px 290px 44px 44px',
            backgroundColor: '#FBF8F3',
            border: '6px solid #181A20',
            boxShadow: '16px 18px 0px #181A20',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            transform: `scale(${interpolate(badgePop, [0, 1], [0.78, 1])})`,
            opacity: badgePop,
            marginBottom: 74,
          }}
        >
          <svg width="560" height="580" viewBox="0 0 560 580">
            {/* Background accent circle inside frame */}
            <circle cx="280" cy="310" r="210" fill="#FFEDD5" />

            {/* Shoulders & Terracotta Sweater */}
            <path
              d="M80 580 C90 420, 165 370, 280 370 C395 370, 470 420, 480 580 Z"
              fill="#E85D3F"
              stroke="#181A20"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            {/* Sweater collar */}
            <path
              d="M222 374 C245 412, 315 412, 338 374"
              fill="none"
              stroke="#181A20"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Neck */}
            <rect
              x="246"
              y="300"
              width="68"
              height="82"
              rx="28"
              fill="#E7B08A"
              stroke="#181A20"
              strokeWidth="6"
            />

            {/* Faceless Head (curious forward lean) */}
            <g transform={`translate(280, 218) rotate(${headLean})`}>
              {/* Ears */}
              <circle
                cx="-82"
                cy="12"
                r="20"
                fill="#E7B08A"
                stroke="#181A20"
                strokeWidth="6"
              />
              <circle
                cx="82"
                cy="12"
                r="20"
                fill="#E7B08A"
                stroke="#181A20"
                strokeWidth="6"
              />
              {/* Clean Faceless Head */}
              <ellipse
                cx="0"
                cy="0"
                rx="82"
                ry="96"
                fill="#F3C6A5"
                stroke="#181A20"
                strokeWidth="6"
              />
              {/* Hair Silhouette */}
              <path
                d="M-84 -10 C-88 -84, -30 -116, 36 -104 C82 -94, 94 -46, 82 -10 C64 -42, 24 -56, -24 -44 C-56 -36, -72 -20, -84 -10 Z"
                fill="#181A20"
              />
            </g>

            {/* Hand Raised to Chin (Suspicious / Thinking Pose) */}
            <g transform={`translate(0, ${interpolate(badgePop, [0, 1], [35, 0])})`}>
              {/* Forearm */}
              <path
                d="M420 580 L352 385"
                stroke="#C94A2E"
                strokeWidth="64"
                strokeLinecap="round"
              />
              <path
                d="M420 580 L352 385"
                stroke="#181A20"
                strokeWidth="6"
                strokeLinecap="round"
              />
              {/* Thinking Hand under chin */}
              <path
                d="M278 320 C278 296, 344 292, 362 326 C376 352, 362 386, 330 388 C302 390, 278 352, 278 320 Z"
                fill="#F3C6A5"
                stroke="#181A20"
                strokeWidth="6"
                strokeLinejoin="round"
              />
              {/* Index finger resting thoughtfully on cheek */}
              <rect
                x="334"
                y="264"
                width="24"
                height="72"
                rx="12"
                transform="rotate(14 346 300)"
                fill="#F3C6A5"
                stroke="#181A20"
                strokeWidth="5.5"
              />
            </g>
          </svg>
        </div>

        {/* Punchy Centered Caption */}
        <div
          style={{
            backgroundColor: '#181A20',
            color: '#FBF8F3',
            padding: '34px 56px',
            borderRadius: 32,
            boxShadow: '0 20px 50px rgba(24,26,32,0.18)',
            transform: `scale(${interpolate(textPop, [0, 1], [0.85, 1])}) translateY(${interpolate(textPop, [0, 1], [40, 0])}px)`,
            opacity: textPop,
          }}
        >
          <span
            style={{
              fontSize: 78,
              fontWeight: 900,
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
            }}
          >
            Coba tanya dulu
            <span style={{ color: '#FBBF24', opacity: dot1 }}>.</span>
            <span style={{ color: '#FBBF24', opacity: dot2 }}>.</span>
            <span style={{ color: '#FBBF24', opacity: dot3 }}>.</span>
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default Scene10;