import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const FONT_FAMILY =
  "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif";

export const Scene09: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Staggered spring entrances (3.74s ~ 112 frames @ 30fps)
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 150, mass: 0.9 },
  });

  const chatSpring = spring({
    frame: Math.max(0, frame - Math.round(fps * 0.45)),
    fps,
    config: { damping: 14, stiffness: 170, mass: 0.85 },
  });

  const charSpring = spring({
    frame: Math.max(0, frame - Math.round(fps * 0.2)),
    fps,
    config: { damping: 15, stiffness: 120, mass: 1 },
  });

  const badgeSpring = spring({
    frame: Math.max(0, frame - Math.round(fps * 1.15)),
    fps,
    config: { damping: 13, stiffness: 165, mass: 0.8 },
  });

  // Left-to-right dashed route progress
  const routeProgress = interpolate(
    frame,
    [Math.round(fps * 0.6), Math.round(fps * 2.2)],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }
  );

  // Subtle idle breathing & phone check bobbing
  const breathY = Math.sin((frame / fps) * 2.6) * 5;
  const headTilt = Math.sin((frame / fps) * 2.0) * 3.5;
  const speedStreakX = ((frame * 14) % 240) - 40;

  // Blue checkmarks pop after chat bubble lands
  const checkPop = spring({
    frame: Math.max(0, frame - Math.round(fps * 1.05)),
    fps,
    config: { damping: 12, stiffness: 220 },
  });

  // Subtle camera pan left-to-right
  const cameraX = interpolate(frame, [0, Math.round(fps * 3.74)], [16, -16], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#FBF8F3',
        fontFamily: FONT_FAMILY,
        overflow: 'hidden',
      }}
    >
      {/* Subtle editorial dot grid */}
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0, opacity: 0.35 }}
      >
        <defs>
          <pattern
            id="s09-dots"
            width="44"
            height="44"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="4" cy="4" r="2" fill="#CBD5E1" />
          </pattern>
        </defs>
        <rect width="1080" height="1920" fill="url(#s09-dots)" />
      </svg>

      {/* Warm organic background shapes */}
      <div
        style={{
          position: 'absolute',
          top: -120,
          right: -140,
          width: 620,
          height: 620,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,90,54,0.13) 0%, rgba(255,90,54,0) 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -140,
          left: -120,
          width: 720,
          height: 720,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(37,99,235,0.10) 0%, rgba(37,99,235,0) 70%)',
        }}
      />

      {/* Main Container with gentle horizontal drift */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translateX(${cameraX}px)`,
        }}
      >
        {/* Top Copy Header */}
        <div
          style={{
            position: 'absolute',
            top: 170,
            left: 84,
            right: 84,
            opacity: headerSpring,
            transform: `translateX(${interpolate(headerSpring, [0, 1], [-70, 0])}px)`,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 22px',
              borderRadius: 999,
              backgroundColor: '#181A20',
              color: '#FBF8F3',
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: 26,
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: '#22C55E',
                display: 'inline-block',
              }}
            />
            Pesan Masuk
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 66,
              lineHeight: 1.15,
              fontWeight: 800,
              color: '#181A20',
              letterSpacing: '-0.025em',
            }}
          >
            Jadi, kalau temanmu bilang,
          </h1>
        </div>

        {/* Incoming Chat Bubble Card (Slides in from right) */}
        <div
          style={{
            position: 'absolute',
            top: 470,
            left: 84,
            right: 84,
            opacity: chatSpring,
            transform: `translateX(${interpolate(chatSpring, [0, 1], [110, 0])}px) scale(${interpolate(chatSpring, [0, 1], [0.92, 1])})`,
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '34px 34px 34px 10px',
              padding: '38px 42px',
              border: '3px solid #181A20',
              boxShadow: '12px 14px 0px #181A20',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 18,
              }}
            >
              {/* Faceless mini avatar */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: '#FFE4D6',
                  border: '2.5px solid #181A20',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle cx="28" cy="22" r="11" fill="#F2BE9B" />
                  <path
                    d="M17 20 C17 10, 39 10, 39 20 C35 16, 21 16, 17 20 Z"
                    fill="#181A20"
                  />
                  <path
                    d="M10 56 C12 40, 44 40, 46 56 Z"
                    fill="#FF5A36"
                  />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: '#181A20',
                  }}
                >
                  Temanmu
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: '#16A34A',
                  }}
                >
                  online
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: 54,
                fontWeight: 800,
                lineHeight: 1.2,
                color: '#181A20',
                letterSpacing: '-0.02em',
              }}
            >
              “Tenang, gue udah{' '}
              <span
                style={{
                  backgroundColor: '#FEF08A',
                  padding: '2px 14px',
                  borderRadius: 12,
                  display: 'inline-block',
                }}
              >
                otw!
              </span>
              ”
            </div>

            {/* Timestamp + Double Blue Tick */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 10,
                marginTop: 22,
                fontSize: 22,
                fontWeight: 600,
                color: '#64748B',
              }}
            >
              <span>Baru saja</span>
              <svg
                width="34"
                height="22"
                viewBox="0 0 34 22"
                style={{
                  transform: `scale(${checkPop})`,
                }}
              >
                <path
                  d="M2 12 L8 18 L20 5"
                  fill="none"
                  stroke="#0EA5E9"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 12 L18 18 L30 5"
                  fill="none"
                  stroke="#0EA5E9"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Animated Dashed Route + Floating "OTW" Speed Pill */}
        <svg
          width="1080"
          height="320"
          viewBox="0 0 1080 320"
          style={{
            position: 'absolute',
            top: 840,
            left: 0,
          }}
        >
          <path
            d="M 110 210 C 310 210, 420 80, 680 120 C 810 140, 890 110, 960 70"
            fill="none"
            stroke="#181A20"
            strokeWidth="5"
            strokeDasharray="16 14"
            strokeDashoffset={interpolate(routeProgress, [0, 1], [950, 0])}
            strokeLinecap="round"
            opacity="0.35"
          />
          {/* Origin pin */}
          <circle cx="110" cy="210" r="14" fill="#2563EB" stroke="#181A20" strokeWidth="4" />
          {/* Destination pin */}
          <g
            transform={`translate(960, 70) scale(${badgeSpring})`}
          >
            <path
              d="M0 0 C-18 -20, -24 -36, -24 -48 C-24 -62, -13 -73, 0 -73 C13 -73, 24 -62, 24 -48 C24 -36, 18 -20, 0 0 Z"
              fill="#FF5A36"
              stroke="#181A20"
              strokeWidth="4"
            />
            <circle cx="0" cy="-48" r="9" fill="#FBF8F3" />
          </g>
        </svg>

        {/* Floating Speed Badge (Right Side) */}
        <div
          style={{
            position: 'absolute',
            top: 995,
            right: 88,
            opacity: badgeSpring,
            transform: `scale(${interpolate(badgeSpring, [0, 1], [0.75, 1])}) rotate(-3deg)`,
          }}
        >
          <div
            style={{
              backgroundColor: '#FF5A36',
              color: '#FFFFFF',
              padding: '22px 34px',
              borderRadius: 26,
              border: '3px solid #181A20',
              boxShadow: '8px 8px 0px #181A20',
              overflow: 'hidden',
              position: 'relative',
              minWidth: 330,
            }}
          >
            {/* Moving speed lines */}
            <div
              style={{
                position: 'absolute',
                top: 18,
                left: speedStreakX,
                width: 90,
                height: 4,
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.45)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 20,
                left: (speedStreakX + 120) % 240,
                width: 65,
                height: 4,
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.35)',
              }}
            />
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                opacity: 0.9,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Katanya sih...
            </div>
            <div
              style={{
                fontSize: 42,
                fontWeight: 900,
                marginTop: 4,
              }}
            >
              OTW 100% ⚡
            </div>
          </div>
        </div>

        {/* Lower Stage: Faceless Character Reading Phone */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 820,
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'flex-end',
            paddingLeft: 60,
            opacity: charSpring,
            transform: `translateY(${interpolate(charSpring, [0, 1], [160, 0]) + breathY}px)`,
          }}
        >
          <svg width="680" height="780" viewBox="0 0 680 780">
            {/* Soft ground shadow */}
            <ellipse cx="300" cy="752" rx="220" ry="22" fill="#E2DDD3" />

            {/* Legs / Trousers */}
            <path
              d="M210 530 L190 745 L268 745 L288 560 Z"
              fill="#1E2430"
              stroke="#181A20"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <path
              d="M312 560 L332 745 L410 745 L390 530 Z"
              fill="#151922"
              stroke="#181A20"
              strokeWidth="5"
              strokeLinejoin="round"
            />

            {/* Torso - Cobalt Hoodie */}
            <path
              d="M175 300 C175 245, 425 245, 425 300 L440 545 C440 562, 425 572, 405 572 L195 572 C175 572, 160 562, 160 545 Z"
              fill="#2563EB"
              stroke="#181A20"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            {/* Hoodie collar & drawstrings */}
            <path
              d="M242 260 C265 295, 335 295, 358 260"
              fill="none"
              stroke="#1D4ED8"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <line
              x1="274"
              y1="286"
              x2="268"
              y2="365"
              stroke="#FBF8F3"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <line
              x1="326"
              y1="286"
              x2="332"
              y2="352"
              stroke="#FBF8F3"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Left Arm bent resting on hip */}
            <path
              d="M180 295 C110 345, 102 440, 175 490"
              fill="none"
              stroke="#2563EB"
              strokeWidth="58"
              strokeLinecap="round"
            />
            <path
              d="M180 295 C110 345, 102 440, 175 490"
              fill="none"
              stroke="#181A20"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Right Arm raised holding smartphone */}
            <path
              d="M412 308 C475 360, 495 415, 520 370"
              fill="none"
              stroke="#1D4ED8"
              strokeWidth="54"
              strokeLinecap="round"
            />
            {/* Hand */}
            <circle
              cx="530"
              cy="358"
              r="28"
              fill="#F3C6A5"
              stroke="#181A20"
              strokeWidth="5"
            />
            {/* Smartphone */}
            <g transform="translate(515, 255) rotate(12)">
              <rect
                x="0"
                y="0"
                width="74"
                height="132"
                rx="16"
                fill="#181A20"
              />
              <rect
                x="7"
                y="10"
                width="60"
                height="112"
                rx="10"
                fill="#E0F2FE"
              />
              {/* Tiny chat lines on screen */}
              <rect x="14" y="26" width="38" height="10" rx="5" fill="#22C55E" />
              <rect x="14" y="44" width="46" height="10" rx="5" fill="#94A3B8" />
              <rect x="22" y="64" width="38" height="12" rx="6" fill="#3B82F6" />
            </g>

            {/* Neck */}
            <rect
              x="272"
              y="210"
              width="56"
              height="60"
              rx="22"
              fill="#E7B08A"
              stroke="#181A20"
              strokeWidth="5"
            />

            {/* Faceless Head (tilted toward phone) */}
            <g transform={`translate(300, 160) rotate(${headTilt + 6})`}>
              {/* Ear */}
              <circle
                cx="-64"
                cy="8"
                r="16"
                fill="#E7B08A"
                stroke="#181A20"
                strokeWidth="5"
              />
              {/* Clean Faceless Head Shape */}
              <ellipse
                cx="0"
                cy="0"
                rx="66"
                ry="76"
                fill="#F3C6A5"
                stroke="#181A20"
                strokeWidth="5"
              />
              {/* Stylized Hair Silhouette */}
              <path
                d="M-68 -6 C-74 -68, -24 -96, 32 -84 C74 -75, 80 -32, 66 -8 C52 -32, 16 -46, -24 -36 C-48 -30, -58 -14, -68 -6 Z"
                fill="#181A20"
              />
            </g>
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default Scene09;