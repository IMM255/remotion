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
    durationSec: 7.87,
    narration: "Bayangin, kamu baru selesai mandi, tapi sebuah perang sudah berakhir. Kedengarannya mustahil, kan?",
    dark: false,
    Component: Scene01
  },
  {
    id: "scene-02",
    durationSec: 14.25,
    narration: "Tapi ini benar-benar pernah terjadi. Pada tahun 1896, Inggris dan Kesultanan Zanzibar terlibat perang yang dikenal sebagai salah satu perang tersingkat dalam sejarah.",
    dark: false,
    Component: Scene02
  },
  {
    id: "scene-03",
    durationSec: 11.87,
    narration: "Semuanya bermula ketika seorang sultan baru naik takhta tanpa persetujuan Inggris. Inggris kemudian memberikan ultimatum agar sang sultan menyerah dan meninggalkan istana.",
    dark: false,
    Component: Scene03
  },
  {
    id: "scene-04",
    durationSec: 9.79,
    narration: "Tapi ultimatum itu diabaikan. Pada pagi tanggal 27 Agustus, kapal perang Inggris mulai menembaki istana Zanzibar.",
    dark: false,
    Component: Scene04
  },
  {
    id: "scene-05",
    durationSec: 5.34,
    narration: "Bangunan istana rusak parah, dan pasukan sultan tidak mampu bertahan lama.",
    dark: false,
    Component: Scene05
  },
  {
    id: "scene-06",
    durationSec: 4.65,
    narration: "Sekitar 38 menit kemudian, pertempuran berakhir.",
    dark: false,
    Component: Scene06
  },
  {
    id: "scene-07",
    durationSec: 9.27,
    narration: "Bayangin, perang yang biasanya berlangsung berbulan-bulan, bahkan bertahun-tahun, kali ini selesai dalam waktu kurang dari satu jam.",
    dark: false,
    Component: Scene07
  },
  {
    id: "scene-08",
    durationSec: 5.91,
    narration: "Dan peristiwa ini sekarang dikenal sebagai Perang Inggris-Zanzibar.",
    dark: false,
    Component: Scene08
  },
  {
    id: "scene-09",
    durationSec: 3.13,
    narration: "Ternyata sejarah bisa seaneh itu, ya?",
    dark: true,
    Component: Scene09
  }
];
