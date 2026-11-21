import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useVideoConfig
} from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { PROJECT_CONFIG } from './config';
import { STYLE_THEMES } from './styles';
import { SCENES } from './scenes';
import { StageBackdrop } from './components/StageBackdrop';
import { SubtitleOverlay } from './components/SubtitleOverlay';

export function totalVideoFrames(fps: number): number {
  const sum = SCENES.reduce((acc, sc) => acc + Math.max(15, Math.round(sc.durationSec * fps)), 0);
  return Math.max(30, sum);
}

export const MotionVideo: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const baseTheme = STYLE_THEMES[PROJECT_CONFIG.style] ?? STYLE_THEMES.collage;
  const theme = PROJECT_CONFIG.accent
    ? { ...baseTheme, accent: PROJECT_CONFIG.accent }
    : baseTheme;
  const hasVoiceover = !!PROJECT_CONFIG.voiceoverFile;
  const bgmBase = hasVoiceover ? PROJECT_CONFIG.bgmVolume * 0.45 : PROJECT_CONFIG.bgmVolume;
  const transFrames = Math.max(0, PROJECT_CONFIG.transitionFrames);
  const voOffsetSec = Number(PROJECT_CONFIG.voiceoverOffsetSec ?? 0);
  const voOffsetFrames = Math.round(voOffsetSec * fps);

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <TransitionSeries>
        {SCENES.map((sc, idx) => {
          const baseFrames = Math.max(15, Math.round(sc.durationSec * fps));
          const isLast = idx === SCENES.length - 1;
          // Compensate transition overlap so every scene starts at its exact audio timestamp
          // and total video duration matches voice-over duration with zero drift.
          const seqFrames = baseFrames + (!isLast ? transFrames : 0);
          const SceneComponent = sc.Component;
          const presentation = idx % 2 === 0 ? fade() : slide({ direction: 'from-right' });

          return (
            <React.Fragment key={sc.id}>
              <TransitionSeries.Sequence durationInFrames={seqFrames}>
                <AbsoluteFill>
                  <StageBackdrop theme={theme} dark={sc.dark} />
                  <SceneComponent theme={theme} />
                  {PROJECT_CONFIG.showSubtitles && sc.narration ? (
                    <SubtitleOverlay text={sc.narration} />
                  ) : null}
                </AbsoluteFill>
              </TransitionSeries.Sequence>
              {!isLast && transFrames > 0 ? (
                <TransitionSeries.Transition
                  presentation={presentation}
                  timing={linearTiming({ durationInFrames: transFrames })}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </TransitionSeries>

      {PROJECT_CONFIG.voiceoverFile ? (
        voOffsetFrames > 0 ? (
          <Sequence from={voOffsetFrames}>
            <Audio src={staticFile(`audio/${PROJECT_CONFIG.voiceoverFile}`)} volume={1} />
          </Sequence>
        ) : (
          <Audio
            src={staticFile(`audio/${PROJECT_CONFIG.voiceoverFile}`)}
            startFrom={Math.abs(voOffsetFrames)}
            volume={1}
          />
        )
      ) : null}

      {PROJECT_CONFIG.bgmFile ? (
        <Audio
          src={staticFile(`audio/${PROJECT_CONFIG.bgmFile}`)}
          loop
          volume={(f) => {
            const fadeIn = interpolate(f, [0, Math.min(fps, 30)], [0, 1], { extrapolateRight: 'clamp' });
            const fadeOut = interpolate(
              f,
              [Math.max(0, durationInFrames - Math.min(fps, 30)), durationInFrames],
              [1, 0],
              { extrapolateLeft: 'clamp' }
            );
            return bgmBase * fadeIn * fadeOut;
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
