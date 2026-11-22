import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const SpringIn: React.FC<{
  delaySec?: number;
  delay?: number;
  fromY?: number;
  fromX?: number;
  fromScale?: number;
  damping?: number;
  stiffness?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({
  delaySec,
  delay,
  fromY = 48,
  fromX = 0,
  fromScale = 0.88,
  damping = 14,
  stiffness = 180,
  style,
  children
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rawDelay = delaySec ?? delay ?? 0;
  // Support both seconds (e.g. 0.3) and frame counts if > 5
  const delayFrames = rawDelay > 5 ? Math.round(rawDelay) : Math.round(rawDelay * fps);
  const progress = spring({
    frame: Math.max(0, frame - delayFrames),
    fps,
    config: { damping, stiffness }
  });
  const x = interpolate(progress, [0, 1], [fromX, 0]);
  const y = interpolate(progress, [0, 1], [fromY, 0]);
  const scale = interpolate(progress, [0, 1], [fromScale, 1]);
  const opacity = interpolate(progress, [0, 0.35], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
        opacity,
        ...style
      }}
    >
      {children}
    </div>
  );
};

export const KineticWords: React.FC<{
  text: string;
  accentWord?: string;
  accentColor?: string;
  color?: string;
  fontSize?: number;
  startSec?: number;
  delay?: number;
  gapSec?: number;
  align?: 'center' | 'left';
  style?: React.CSSProperties;
}> = ({
  text,
  accentWord,
  accentColor = '#f07a5a',
  color = '#26355d',
  fontSize = 62,
  startSec,
  delay,
  gapSec = 0.08,
  align = 'center',
  style
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rawStart = startSec ?? delay ?? 0.1;
  const startOffsetSec = rawStart > 5 ? rawStart / fps : rawStart;
  const words = text.trim().split(/\s+/);
  const accentLower = accentWord?.toLowerCase();

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: align === 'left' ? 'flex-start' : 'center',
        gap: '0 16px',
        fontFamily: '"Segoe UI", system-ui, sans-serif',
        fontWeight: 800,
        fontSize,
        lineHeight: 1.15,
        letterSpacing: '-0.02em',
        ...style
      }}
    >
      {words.map((word, i) => {
        const startFrame = Math.round((startOffsetSec + i * gapSec) * fps);
        const k = spring({
          frame: Math.max(0, frame - startFrame),
          fps,
          config: { damping: 16, stiffness: 200 }
        });
        const clean = word.toLowerCase().replace(/[^a-z0-9]/gi, '');
        const isAccent = !!accentLower && (clean === accentLower || word.toLowerCase() === accentLower);
        return (
          <span
            key={`${word}-${i}`}
            style={{
              display: 'inline-block',
              color: isAccent ? accentColor : color,
              transform: `translateY(${interpolate(k, [0, 1], [28, 0])}px) scale(${interpolate(k, [0, 1], [0.9, 1])})`,
              opacity: interpolate(k, [0, 0.35], [0, 1], { extrapolateRight: 'clamp' })
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

export const TagPin: React.FC<{
  label?: string;
  text?: string;
  children?: React.ReactNode;
  theme?: { accent?: string; ink?: string; surface?: string };
  bg?: string;
  color?: string;
  pinColor?: string;
  rotateDeg?: number;
  delaySec?: number;
  delay?: number;
  style?: React.CSSProperties;
}> = ({
  label,
  text,
  children,
  theme,
  bg,
  color = '#ffffff',
  pinColor = '#f07a5a',
  rotateDeg = -3,
  delaySec,
  delay,
  style
}) => (
  <SpringIn delaySec={delaySec ?? delay ?? 0.4} fromY={24} fromScale={0.7} damping={11} stiffness={220}>
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '14px 34px',
        borderRadius: 8,
        background: bg ?? theme?.accent ?? '#2a9d8f',
        color,
        fontFamily: '"Segoe UI", system-ui, sans-serif',
        fontWeight: 800,
        fontSize: 34,
        letterSpacing: '0.04em',
        transform: `rotate(${rotateDeg}deg)`,
        boxShadow: '6px 9px 0 rgba(43,42,40,0.16)',
        ...style
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -12,
          left: '50%',
          width: 24,
          height: 24,
          marginLeft: -12,
          borderRadius: '50%',
          background: pinColor,
          boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.15)'
        }}
      />
      {label ?? text ?? children}
    </div>
  </SpringIn>
);

export const PaperCard: React.FC<{
  bg?: string;
  theme?: { surface?: string; ink?: string };
  radius?: number;
  padding?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ bg, theme, radius = 22, padding = 32, style, children }) => (
  <div
    style={{
      background: bg ?? theme?.surface ?? '#ffffff',
      borderRadius: radius,
      padding,
      boxShadow: '8px 12px 0 rgba(43,42,40,0.15)',
      ...style
    }}
  >
    {children}
  </div>
);
