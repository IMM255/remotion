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
  | 'faceless'
  | (string & {});

export const PROJECT_CONFIG = {
  title: "Proyek 2",
  fps: 30,
  style: "opuscar-backrooms" as StylePresetId,
  accent: "#8c763c",
  showSubtitles: false,
  voiceoverFile: "voiceover-56ec354f.wav" as string | null,
  voiceoverOffsetSec: 0,
  bgmFile: null as string | null,
  bgmVolume: 0.25,
  transitionFrames: 12
};
