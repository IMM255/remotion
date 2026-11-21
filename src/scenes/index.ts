import type React from 'react';
import type { StyleTheme } from '../styles';
import { Scene01 } from './Scene01';
import { Scene02 } from './Scene02';
import { Scene03 } from './Scene03';
import { Scene04 } from './Scene04';
import { Scene05 } from './Scene05';
import { Scene06 } from './Scene06';
import { Scene07 } from './Scene07';
import { Scene08 } from './Scene08';
import { Scene09 } from './Scene09';
import { Scene10 } from './Scene10';
import { Scene11 } from './Scene11';

export interface SceneDefinition {
  id: string;
  durationSec: number;
  narration: string;
  dark?: boolean;
  Component: React.FC<{ theme: StyleTheme }>;
}

export const SCENES: SceneDefinition[] = [
  {
    id: "scene-01",
    durationSec: 7.74,
    narration: "Pernah nggak, kamu udah siap berangkat, tapi temanmu malah bilang, “Sebentar ya, lima menit lagi!” Lima menit lewat.",
    dark: false,
    Component: Scene01
  },
  {
    id: "scene-02",
    durationSec: 4.46,
    narration: "Sepuluh menit lewat. Pas kamu telepon, ternyata dia...",
    dark: false,
    Component: Scene02
  },
  {
    id: "scene-03",
    durationSec: 5.75,
    narration: "baru bangun tidur! Atau jangan-jangan, kamu sendiri yang sering jadi pelakunya?",
    dark: false,
    Component: Scene03
  },
  {
    id: "scene-04",
    durationSec: 8.82,
    narration: "Anehnya, kata “sebentar” bisa punya arti yang beda banget buat setiap orang. Tapi kenapa sih, kita sering bilang sebentar, padahal masih lama?",
    dark: false,
    Component: Scene04
  },
  {
    id: "scene-05",
    durationSec: 6.98,
    narration: "Ternyata, ada penjelasan psikologisnya. Otak manusia nggak selalu akurat dalam memperkirakan waktu.",
    dark: false,
    Component: Scene05
  },
  {
    id: "scene-06",
    durationSec: 12.46,
    narration: "Salah satunya berkaitan dengan fenomena *planning fallacy*, yaitu kecenderungan meremehkan waktu yang dibutuhkan untuk menyelesaikan sesuatu. Contohnya, kamu yakin bisa mandi dan siap-siap dalam lima menit.",
    dark: false,
    Component: Scene06
  },
  {
    id: "scene-07",
    durationSec: 5.9,
    narration: "Padahal, masih harus pilih baju, cari dompet, dan nyari kunci motor yang entah ditaruh di mana.",
    dark: false,
    Component: Scene07
  },
  {
    id: "scene-08",
    durationSec: 5.54,
    narration: "Selain itu, kata “sebentar” kadang sengaja dipakai supaya orang lain tetap mau menunggu.",
    dark: false,
    Component: Scene08
  },
  {
    id: "scene-09",
    durationSec: 3.74,
    narration: "Jadi, kalau temanmu bilang, “Tenang, gue udah otw!”",
    dark: false,
    Component: Scene09
  },
  {
    id: "scene-10",
    durationSec: 1.37,
    narration: "Coba tanya dulu...",
    dark: false,
    Component: Scene10
  },
  {
    id: "scene-11",
    durationSec: 3.4,
    narration: "“Otw ke sini, atau baru otw turun dari kasur?”",
    dark: true,
    Component: Scene11
  }
];
