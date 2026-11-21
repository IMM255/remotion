export type StylePresetId =
  | 'collage'
  | 'clay'
  | 'katalog'
  | 'sketsa'
  | 'kartun'
  | 'jurnalisme'
  | 'panggung'
  | 'anime'
  | 'cinema'
  | 'faceless';

export const PROJECT_CONFIG = {
  title: "Proyek 2",
  fps: 30,
  style: "faceless" as StylePresetId,
  accent: "#f0b86e",
  showSubtitles: true,
  voiceoverFile: "voiceover-56ec354f.wav" as string | null,
  voiceoverOffsetSec: 0,
  bgmFile: null as string | null,
  bgmVolume: 0.25,
  transitionFrames: 12
};
