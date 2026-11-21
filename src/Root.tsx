import React from 'react';
import { Composition } from 'remotion';
import { MotionVideo, totalVideoFrames } from './Video';
import { PROJECT_CONFIG } from './config';

export const RemotionRoot: React.FC = () => {
  const fps = PROJECT_CONFIG.fps;
  const durationInFrames = totalVideoFrames(fps);

  return (
    <>
      <Composition
        id="Portrait9x16"
        component={MotionVideo}
        durationInFrames={durationInFrames}
        fps={fps}
        width={1080}
        height={1920}
      />
      <Composition
        id="Landscape16x9"
        component={MotionVideo}
        durationInFrames={durationInFrames}
        fps={fps}
        width={1920}
        height={1080}
      />
    </>
  );
};
