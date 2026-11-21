import type { StylePresetId } from './config';

export interface StyleTheme {
  name: string;
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  accent: string;
  secondary: string;
  yellow: string;
  isDark: boolean;
  isPaper: boolean;
  hasGrid?: boolean;
}

export const STYLE_THEMES: Record<StylePresetId, StyleTheme> = {
  collage: {
    name: 'Kolase Kertas',
    bg: '#d4bc9b',
    surface: '#fffaf0',
    ink: '#2b2a28',
    muted: '#6e655a',
    accent: '#f07a5a',
    secondary: '#2a9d8f',
    yellow: '#f6c143',
    isDark: false,
    isPaper: true
  },
  clay: {
    name: 'Clay 3D',
    bg: 'linear-gradient(180deg, #f7ece1 0%, #e7d8cb 100%)',
    surface: '#fff1e3',
    ink: '#3f2a20',
    muted: '#7a6357',
    accent: '#aa765a',
    secondary: '#6d8fc7',
    yellow: '#f6c143',
    isDark: false,
    isPaper: false
  },
  katalog: {
    name: 'White Catalog',
    bg: '#ffffff',
    surface: '#faf7f2',
    ink: '#26231f',
    muted: '#6f675e',
    accent: '#c43d21',
    secondary: '#26231f',
    yellow: '#f6c143',
    isDark: false,
    isPaper: false,
    hasGrid: true
  },
  sketsa: {
    name: 'Vintage Sketch',
    bg: 'linear-gradient(135deg, #f1e6cf 0%, #dfcca8 100%)',
    surface: '#f7eedb',
    ink: '#3b2d23',
    muted: '#6f5949',
    accent: '#8e4a2b',
    secondary: '#5b4332',
    yellow: '#d9a441',
    isDark: false,
    isPaper: false
  },
  kartun: {
    name: 'Cartoon Collage',
    bg: '#fbf4e6',
    surface: '#ffffff',
    ink: '#26355d',
    muted: '#66718a',
    accent: '#2a9d8f',
    secondary: '#f07a5a',
    yellow: '#f6c143',
    isDark: false,
    isPaper: false
  },
  jurnalisme: {
    name: 'Visual Journalism',
    bg: '#f5f1e8',
    surface: '#ffffff',
    ink: '#1e2229',
    muted: '#5d636e',
    accent: '#d9452c',
    secondary: '#26355d',
    yellow: '#f6c143',
    isDark: false,
    isPaper: false
  },
  panggung: {
    name: 'Cartoon Stage',
    bg: 'linear-gradient(180deg, #e9f4fa 0%, #d9edf7 70%, #f3d8b0 70%, #e8c592 100%)',
    surface: '#ffffff',
    ink: '#26355d',
    muted: '#52627c',
    accent: '#f07a5a',
    secondary: '#2a9d8f',
    yellow: '#f6c143',
    isDark: false,
    isPaper: false
  },
  anime: {
    name: 'Anime',
    bg: 'linear-gradient(180deg, #5e84cc 0%, #b8cdf0 58%, #f8d2b8 100%)',
    surface: '#ffffff',
    ink: '#1f2547',
    muted: '#4a5378',
    accent: '#7777b5',
    secondary: '#f08a6c',
    yellow: '#ffd98e',
    isDark: false,
    isPaper: false
  },
  cinema: {
    name: 'Sinematik Realistis',
    bg: 'linear-gradient(180deg, #1b2621 0%, #2d4037 100%)',
    surface: '#24332c',
    ink: '#f6f2ea',
    muted: '#b5c2ba',
    accent: '#e8be78',
    secondary: '#47715b',
    yellow: '#f6c143',
    isDark: true,
    isPaper: false
  },
  faceless: {
    name: 'Karakter Orang (Faceless)',
    bg: 'linear-gradient(180deg, #3c3a46 0%, #2e2c36 72%, #222029 100%)',
    surface: '#353340',
    ink: '#f5efe6',
    muted: '#b8b3c2',
    accent: '#f0b86e',
    secondary: '#69c993',
    yellow: '#ffe19c',
    isDark: true,
    isPaper: false
  }
};
