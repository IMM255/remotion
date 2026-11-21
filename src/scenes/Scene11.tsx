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

export const Scene11: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 3.40s (~102 frames @ 30fps) Dark Theme Vertical Split-Screen
  const topPanelSpring = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 150, mass: 0.9 },
  });

  const dividerSpring = spring({
    frame: Math.max(0, frame - Math.round(fps * 0.95)),
    fps,
    config: { damping: 13, stiffness: 210, mass: 0.75 },
  });

  const bottomPanelSpring = spring({
    frame: Math.max(0, frame - Math.round(fps * 1.15)),
    fps,
    config: { damping: 15, stiffness: 145, mass: 0.95 },
  });

  // Top panel: walking stride cycle & scrolling night street
  const walkCycle = Math.sin((frame / fps) * 9.5);
  const streetOffset = (frame * 12) % 360;

  // Bottom panel: cozy phone glow pulse + floating Zzz + dangling foot swing
  const phoneGlow = 0.75 + Math.sin((frame / fps) * 5) * 0.2;
  const footSwing = Math.sin((frame / fps) * 3.2) * 8;
  const zzzRise = interpolate(
    frame,
    [Math.round(fps * 1.3), Math.round(fps * 3.4)],
    [0, -48],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.quad),
    }
  );

  // Subtle focus shift: top dims slightly once bottom punchline lands
  const topDim = interpolate(
    frame,
    [Math.round(fps * 1.25), Math.round(fps * 1.85)],
    [1, 0.58],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0D1017',
        fontFamily: FONT_FAMILY,
        overflow: 'hidden',
      }}
    >
      {/* TOP HALF: "Otw ke sini," (Slides down from top) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 940,
          background:
            'linear-gradient(180deg, #0F172A 0%, #131F36 100%)',
          overflow: 'hidden',
          opacity: topPanelSpring * topDim,
          transform: `translateY(${interpolate(topPanelSpring, [0, 1], [-120, 0])}px)`,
        }}
      >
        {/* Night stars */}
        {[
          { x: 140, y: 120, r: 3 },
          { x: 310, y: 88, r: 2.5 },
          { x: 760, y: 110, r: 3.5 },
          { x: 920, y: 190, r: 2.5 },
          { x: 540, y: 74, r: 2 },
        ].map((star, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: star.x,
              top: star.y,
              width: star.r * 2,
              height: star.r * 2,
              borderRadius: '50%',
              backgroundColor: '#94A3B8',
              opacity: 0.5,
            }}
          />
        ))}

        {/* Top Copy */}
        <div
          style={{
            position: 'absolute',
            top: 135,
            left: 84,
            right: 84,
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '8px 20px',
              borderRadius: 999,
              backgroundColor: 'rgba(45, 212, 191, 0.14)',
              border: '1.5px solid rgba(45, 212, 191, 0.5)',
              color: '#2DD4BF',
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            Ekspektasi
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: 70,
              fontWeight: 800,
              color: '#F8FAFC',
              letterSpacing: '-0.025em',
              lineHeight: 1.12,
            }}
          >
            “Otw ke sini,
          </h2>
        </div>

        {/* Night Street + Faceless Character Striding Right */}
        <svg
          width="1080"
          height="540"
          viewBox="0 0 1080 540"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
          }}
        >
          {/* Scrolling Streetlamps */}
          {[0, 360, 720, 1080].map((baseX, idx) => {
            const x = ((baseX - streetOffset + 1440) % 1440) - 180;
            return (
              <g key={idx} transform={`translate(${x}, 60)`} opacity="0.45">
                <rect x="0" y="30" width="8" height="390" fill="#334155" />
                <path
                  d="M4 34 L54 34"
                  stroke="#334155"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <ellipse cx="52" cy="40" rx="18" ry="7" fill="#5EEAD4" />
                <polygon
                  points="36,46 68,46 125,420 -20,420"
                  fill="url(#s11-lamp)"
                  opacity="0.22"
                />
              </g>
            );
          })}

          <defs>
            <linearGradient id="s11-lamp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Road surface */}
          <rect x="0" y="455" width="1080" height="85" fill="#0B1120" />
          <line
            x1="0"
            y1="498"
            x2="1080"
            y2="498"
            stroke="#334155"
            strokeWidth="6"
            strokeDasharray="48 36"
            strokeDashoffset={streetOffset}
          />

          {/* Speed streaks behind runner/walker */}
          <line
            x1="210"
            y1="250"
            x2="330"
            y2="250"
            stroke="#2DD4BF"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.6"
          />
          <line
            x1="160"
            y1="300"
            x2="295"
            y2="300"
            stroke="#2DD4BF"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.35"
          />

          {/* Faceless Character Striding Briskly */}
          <g transform={`translate(520, ${178 + Math.abs(walkCycle) * -8})`}>
            {/* Back leg */}
            <path
              d={`M0 165 L${-48 * walkCycle} 285`}
              stroke="#1E293B"
              strokeWidth="34"
              strokeLinecap="round"
            />
            {/* Front leg */}
            <path
              d={`M12 165 L${52 * walkCycle} 285`}
              stroke="#334155"
              strokeWidth="36"
              strokeLinecap="round"
            />
            {/* Backpack */}
            <rect
              x="-52"
              y="62"
              width="48"
              height="92"
              rx="18"
              fill="#0F766E"
              stroke="#0D1017"
              strokeWidth="4"
            />
            {/* Torso Jacket (Teal) leaning forward */}
            <path
              d="M-24 62 C-18 42, 46 42, 54 68 L44 176 C42 186, -24 186, -26 172 Z"
              fill="#14B8A6"
              stroke="#0D1017"
              strokeWidth="4"
            />
            {/* Swinging Front Arm */}
            <path
              d={`M18 78 L${46 - 42 * walkCycle} 150`}
              stroke="#0D9488"
              strokeWidth="26"
              strokeLinecap="round"
            />
            {/* Head (Faceless) */}
            <circle
              cx="26"
              cy="12"
              r="34"
              fill="#F3C6A5"
              stroke="#0D1017"
              strokeWidth="4"
            />
            {/* Hair swept back */}
            <path
              d="M-10 4 C-14 -24, 24 -36, 52 -18 C62 -10, 56 2, 46 2 C32 -10, 8 -10, -10 4 Z"
              fill="#0F172A"
            />
          </g>
        </svg>
      </div>

      {/* BOTTOM HALF: "atau baru otw turun dari kasur?" (Pushes up from bottom) */}
      <div
        style={{
          position: 'absolute',
          top: 940,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(circle at 75% 42%, #291F1E 0%, #11131A 65%, #0A0C12 100%)',
          overflow: 'hidden',
          opacity: bottomPanelSpring,
          transform: `translateY(${interpolate(bottomPanelSpring, [0, 1], [140, 0])}px)`,
        }}
      >
        {/* Warm bedside lamp ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: 110,
            right: 40,
            width: 480,
            height: 480,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(251,191,36,0.22) 0%, rgba(251,191,36,0) 70%)',
          }}
        />

        {/* Bedroom Scene: Faceless Character Still on Mattress */}
        <svg
          width="1080"
          height="620"
          viewBox="0 0 1080 620"
          style={{
            position: 'absolute',
            top: 60,
            left: 0,
          }}
        >
          {/* Bedside Table & Warm Lamp (Right) */}
          <rect
            x="835"
            y="340"
            width="160"
            height="190"
            rx="16"
            fill="#1E2433"
            stroke="#090B10"
            strokeWidth="5"
          />
          <line
            x1="855"
            y1="420"
            x2="975"
            y2="420"
            stroke="#090B10"
            strokeWidth="4"
          />
          <circle cx="915" cy="382" r="7" fill="#64748B" />
          {/* Lamp stand */}
          <rect x="907" y="255" width="16" height="85" fill="#475569" />
          <ellipse cx="915" cy="340" rx="34" ry="8" fill="#334155" />
          {/* Lamp shade */}
          <polygon
            points="865,260 965,260 946,185 884,185"
            fill="#FBBF24"
            stroke="#090B10"
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* Bed Headboard */}
          <rect
            x="92"
            y="180"
            width="42"
            height="350"
            rx="16"
            fill="#272E3F"
            stroke="#090B10"
            strokeWidth="5"
          />

          {/* Pillow */}
          <ellipse
            cx="215"
            cy="332"
            rx="84"
            ry="38"
            transform="rotate(-10 215 332)"
            fill="#E2E8F0"
            stroke="#090B10"
            strokeWidth="5"
          />

          {/* Mattress & Bed Frame */}
          <rect
            x="118"
            y="358"
            width="670"
            height="92"
            rx="24"
            fill="#CBD5E1"
            stroke="#090B10"
            strokeWidth="5"
          />
          <rect
            x="110"
            y="436"
            width="686"
            height="58"
            rx="14"
            fill="#272E3F"
            stroke="#090B10"
            strokeWidth="5"
          />
          {/* Bed legs */}
          <rect x="145" y="494" width="26" height="46" rx="8" fill="#1E2433" />
          <rect x="735" y="494" width="26" height="46" rx="8" fill="#1E2433" />

          {/* Faceless Character Lying on Bed Holding Phone */}
          {/* Blue phone screen glow cone */}
          <polygon
            points="435,205 260,260 315,355"
            fill="#38BDF8"
            opacity={0.18 * phoneGlow}
          />

          {/* Head resting on pillow */}
          <g transform="translate(262, 294) rotate(-14)">
            <circle
              cx="0"
              cy="0"
              r="46"
              fill="#F3C6A5"
              stroke="#090B10"
              strokeWidth="5"
            />
            {/* Messy bedhead hair */}
            <path
              d="M-46 -4 C-52 -42, -10 -58, 28 -44 C46 -36, 48 -14, 38 -2 C20 -18, -14 -20, -46 -4 Z"
              fill="#0F172A"
            />
            {/* Little ahoge / messy hair tuft */}
            <path
              d="M-12 -46 C-26 -64, -4 -74, 4 -50"
              fill="none"
              stroke="#0F172A"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </g>

          {/* Cozy Blanket draped over torso */}
          <path
            d="M300 326 C380 282, 560 286, 650 345 L670 432 C560 444, 380 442, 290 430 Z"
            fill="#FF6B4A"
            stroke="#090B10"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* Blanket fold line */}
          <path
            d="M320 356 C410 330, 520 336, 635 372"
            fill="none"
            stroke="#C2410C"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Arm raised holding glowing phone */}
          <path
            d="M352 332 L416 232"
            stroke="#F3C6A5"
            strokeWidth="26"
            strokeLinecap="round"
          />
          <rect
            x="412"
            y="168"
            width="22"
            height="72"
            rx="8"
            transform="rotate(24 423 204)"
            fill="#0F172A"
            stroke="#38BDF8"
            strokeWidth="3.5"
          />

          {/* One Lazy Foot Dangling Off the Mattress */}
          <g
            transform={`translate(664, 396) rotate(${footSwing})`}
          >
            <path
              d="M0 0 C38 8, 56 48, 48 112"
              stroke="#E7B08A"
              strokeWidth="30"
              strokeLinecap="round"
              fill="none"
            />
            <ellipse
              cx="60"
              cy="118"
              rx="28"
              ry="14"
              transform="rotate(14 60 118)"
              fill="#F3C6A5"
              stroke="#090B10"
              strokeWidth="4.5"
            />
          </g>

          {/* Floating Zzz particles */}
          <g transform={`translate(185, ${205 + zzzRise})`} opacity="0.8">
            <text
              x="0"
              y="0"
              fill="#FBBF24"
              fontSize="36"
              fontWeight="900"
              fontFamily={FONT_FAMILY}
            >
              Z
            </text>
            <text
              x="34"
              y="-32"
              fill="#FBBF24"
              fontSize="28"
              fontWeight="800"
              fontFamily={FONT_FAMILY}
              opacity="0.75"
            >
              z
            </text>
            <text
              x="60"
              y="-58"
              fill="#FBBF24"
              fontSize="22"
              fontWeight="800"
              fontFamily={FONT_FAMILY}
              opacity="0.5"
            >
              z
            </text>
          </g>
        </svg>

        {/* Bottom Punchline Copy */}
        <div
          style={{
            position: 'absolute',
            bottom: 130,
            left: 84,
            right: 84,
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '8px 20px',
              borderRadius: 999,
              backgroundColor: 'rgba(255, 107, 74, 0.16)',
              border: '1.5px solid rgba(255, 107, 74, 0.55)',
              color: '#FF6B4A',
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 18,
            }}
          >
            Realita
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: 66,
              fontWeight: 900,
              color: '#F8FAFC',
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
            }}
          >
            atau baru otw{' '}
            <span style={{ color: '#FBBF24' }}>turun dari kasur?”</span>
          </h2>
        </div>
      </div>

      {/* CENTER DIVIDER LINE + "ATAU" PILL BADGE */}
      <div
        style={{
          position: 'absolute',
          top: 936,
          left: 0,
          right: 0,
          height: 8,
          backgroundColor: '#FBBF24',
          transform: `scaleX(${dividerSpring})`,
          boxShadow: '0 0 24px rgba(251,191,36,0.55)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 902,
          left: '50%',
          transform: `translateX(-50%) scale(${dividerSpring}) rotate(-3deg)`,
          backgroundColor: '#FBBF24',
          color: '#0D1017',
          padding: '14px 40px',
          borderRadius: 999,
          fontSize: 34,
          fontWeight: 900,
          letterSpacing: '0.08em',
          border: '4px solid #0D1017',
          boxShadow: '0 10px 28px rgba(0,0,0,0.45)',
        }}
      >
        ATAU
      </div>
    </AbsoluteFill>
  );
};

export default Scene11;