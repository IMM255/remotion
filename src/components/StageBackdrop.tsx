import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { StyleTheme } from '../styles';

export const StageBackdrop: React.FC<{ theme: StyleTheme; dark?: boolean }> = ({ theme, dark }) => {
  const isDark = dark ?? theme.isDark;
  const background = isDark
    ? 'linear-gradient(180deg, #1f2a4a 0%, #30416b 100%)'
    : theme.bg;

  return (
    <AbsoluteFill style={{ background }}>
      {theme.hasGrid && !isDark ? (
        <AbsoluteFill
          style={{
            backgroundImage:
              'linear-gradient(rgba(38,35,31,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(38,35,31,0.06) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            pointerEvents: 'none'
          }}
        />
      ) : null}
      {theme.isPaper && !isDark ? (
        <AbsoluteFill
          style={{
            backgroundImage:
              'radial-gradient(rgba(43,42,40,0.06) 1px, transparent 0)',
            backgroundSize: '20px 20px',
            opacity: 0.55,
            pointerEvents: 'none'
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
