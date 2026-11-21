import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';

export const SubtitleOverlay: React.FC<{ text: string }> = ({ text }) => {
  const { width, height } = useVideoConfig();
  const isPortrait = height > width;
  if (!text.trim()) return null;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: isPortrait ? 120 : 52,
        paddingLeft: isPortrait ? 56 : 160,
        paddingRight: isPortrait ? 56 : 160,
        pointerEvents: 'none'
      }}
    >
      <div
        style={{
          background: 'rgba(18, 22, 34, 0.78)',
          color: '#ffffff',
          padding: isPortrait ? '16px 26px' : '12px 24px',
          borderRadius: 16,
          fontFamily: '"Segoe UI", system-ui, sans-serif',
          fontSize: isPortrait ? 34 : 30,
          fontWeight: 700,
          lineHeight: 1.32,
          textAlign: 'center',
          maxWidth: isPortrait ? 940 : 1400,
          boxShadow: '0 8px 24px rgba(0,0,0,0.28)'
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
