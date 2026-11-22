import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

// Scene07 · 9.27 s @ 30 fps · 1080x1920 · Comic History Cartoon (paper-cut)
export const SCENE07_FPS = 30;
export const SCENE07_DURATION = 278;
export const SCENE07_NARRATION =
  "Bayangin, perang yang biasanya berlangsung berbulan-bulan, bahkan bertahun-tahun, kali ini selesai dalam waktu kurang dari satu jam.";

const clamp7 = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease7 = (
  f: number,
  [a, b]: [number, number],
  [c, d]: [number, number],
  e: (t: number) => number = Easing.out(Easing.cubic)
) => interpolate(f, [a, b], [c, d], { ...clamp7, easing: e });

const CUT7 = "drop-shadow(0px 8px 0px rgba(60,40,20,0.28))";
const SERIF7 = "'Playfair Display','Georgia',serif";
const SANS7 = "'Baloo 2','Arial Black',sans-serif";

export const durationInFrames7 = SCENE07_DURATION;

// Kalender kertas: satu lembar per bulan, sobek satu per satu
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];

const CalendarSheet: React.FC<{ label: string; x: number; y: number; rot: number; o: number; s?: number }> = ({
  label, x, y, rot, o, s = 1,
}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={o} style={{ filter: CUT7 }}>
    <rect x={-110} y={-130} width={220} height={260} rx={10} fill="#fbf4e4" stroke="#b8ae96" strokeWidth={4} />
    <rect x={-110} y={-130} width={220} height={60} rx={10} fill="#c8372d" />
    <circle cx={-60} cy={-130} r={8} fill="#5a4636" />
    <circle cx={60} cy={-130} r={8} fill="#5a4636" />
    <text x={0} y={30} textAnchor="middle" fontFamily={SANS7} fontWeight={900} fontSize={84} fill="#2a211b">
      {label}
    </text>
    <text x={0} y={90} textAnchor="middle" fontFamily={SERIF7} fontStyle="italic" fontSize={32} fill="#7a6a52">
      perang...
    </text>
  </g>
);

const Tick: React.FC<{ a: number; major: boolean }> = ({ a, major }) => (
  <line
    x1={0}
    y1={-206}
    x2={0}
    y2={major ? -168 : -184}
    stroke="#2a211b"
    strokeWidth={major ? 9 : 5}
    strokeLinecap="round"
    transform={`rotate(${a})`}
  />
);

export const Scene07 = function Scene07() {
  const f = useCurrentFrame();

  // kamera: pan horizontal kiri -> kanan (beda dari Scene06 yang tilt vertikal)
  const panX = ease7(f, [0, SCENE07_DURATION], [70, -70], Easing.inOut(Easing.quad));
  const zoom = ease7(f, [0, SCENE07_DURATION], [1.04, 1.1], Easing.inOut(Easing.quad));

  // Fase 1 (0-120): kalender menyobek bulan demi bulan, bergeser ke kanan
  // Fase 2 (110-278): jam kecil "1 jam" muncul di sisi kanan dan menang
  const sheets = MONTHS.map((m, i) => {
    const start = 6 + i * 8;
    const t = f - start;
    if (t < 0) return null;
    const flyX = ease7(t, [10, 38], [0, 900], Easing.in(Easing.cubic));
    const flyY = ease7(t, [10, 38], [0, -120 - (i % 3) * 60], Easing.in(Easing.quad));
    const rot = ease7(t, [0, 38], [(i % 2 ? 4 : -4), (i % 2 ? 40 : -34)], Easing.in(Easing.quad));
    const pop = ease7(t, [0, 8], [0, 1], Easing.out(Easing.back(2)));
    const fade = ease7(t, [26, 40], [1, 0], Easing.linear);
    return (
      <CalendarSheet
        key={m}
        label={m}
        x={250 + flyX}
        y={520 + flyY + (i % 4) * 8}
        rot={rot}
        o={fade * (pop > 0 ? 1 : 0)}
        s={pop}
      />
    );
  });

  // tumpukan tahun (kertas tebal) di kiri
  const stackH = ease7(f, [0, 20], [0, 1], Easing.out(Easing.back(1.6)));
  const yearSlide = ease7(f, [96, 130], [0, 1], Easing.inOut(Easing.cubic));

  // garis waktu "berbulan-bulan, bertahun-tahun"
  const barW = ease7(f, [24, 130], [0, 880], Easing.inOut(Easing.quad));
  const barSqueeze = ease7(f, [150, 190], [0, 1], Easing.inOut(Easing.cubic)); // menyusut jadi sangat pendek

  // jam 1 jam
  const clockIn = ease7(f, [140, 172], [0, 1], Easing.out(Easing.back(1.8)));
  const clockSweep = ease7(f, [160, 236], [0, 38 * 6], Easing.inOut(Easing.quad));
  const clockMin = Math.round(clockSweep / 6);

  // kurang dari satu jam: tanda "<" mengetuk
  const lt = ease7(f, [196, 212], [0, 1], Easing.out(Easing.back(2.4)));
  const wobble = Math.sin(f / 5) * 2;

  const ticks = Array.from({ length: 12 }, (_, i) => i * 30);

  return (
    <AbsoluteFill style={{ background: "#e6d3a3", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `translateX(${panX}px) scale(${zoom})`,
          transformOrigin: "50% 50%",
        }}
      >
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          {/* latar meja kertas bergaris */}
          <rect width={1080} height={1920} fill="#ead9ae" />
          {Array.from({ length: 16 }, (_, i) => (
            <line key={i} x1={0} y1={160 + i * 112} x2={1080} y2={160 + i * 112} stroke="#d9c28a" strokeWidth={3} />
          ))}
          <rect x={0} y={0} width={1080} height={300} fill="#d9c28a" opacity={0.55} />

          {/* label baris atas: bulan -> tahun */}
          <g transform="translate(540,230)" style={{ filter: CUT7 }}>
            <rect
              x={-440}
              y={-70}
              width={880}
              height={140}
              rx={16}
              fill="#f4ecd8"
              stroke="#7a6a52"
              strokeWidth={5}
            />
            <text
              x={0}
              y={34}
              textAnchor="middle"
              fontFamily={SANS7}
              fontWeight={900}
              fontSize={76}
              fill="#2a211b"
              opacity={1 - yearSlide}
            >
              BERBULAN-BULAN...
            </text>
            <text
              x={0}
              y={34}
              textAnchor="middle"
              fontFamily={SANS7}
              fontWeight={900}
              fontSize={76}
              fill="#c8372d"
              opacity={yearSlide}
            >
              BERTAHUN-TAHUN...
            </text>
          </g>

          {/* kalender yang disobek */}
          {sheets}

          {/* tumpukan kalender di kiri */}
          <g transform="translate(150,760)" style={{ filter: CUT7 }} opacity={stackH}>
            {[0, 1, 2, 3, 4].map((i) => (
              <rect
                key={i}
                x={-90 + i * 4}
                y={-110 + i * 18}
                width={180}
                height={220}
                rx={8}
                fill={i % 2 ? "#fbf4e4" : "#f4ecd8"}
                stroke="#b8ae96"
                strokeWidth={3}
              />
            ))}
            <text x={0} y={30} textAnchor="middle" fontFamily={SANS7} fontWeight={900} fontSize={60} fill="#7a6a52">
              {Math.min(12, Math.floor(f / 8))}x
            </text>
          </g>

          {/* batang waktu panjang yang menyusut */}
          <g transform="translate(100,1000)" style={{ filter: CUT7 }}>
            <rect x={0} y={-34} width={880} height={68} rx={34} fill="#f4ecd8" stroke="#7a6a52" strokeWidth={4} />
            <rect
              x={0}
              y={-34}
              width={Math.max(40, barW * (1 - barSqueeze * 0.96))}
              height={68}
              rx={34}
              fill="#c8372d"
            />
            <text x={0} y={-60} fontFamily={SERIF7} fontStyle="italic" fontWeight={700} fontSize={36} fill="#4a3d31">
              lama perang biasanya
            </text>
          </g>

          {/* jam besar di bawah */}
          <g
            transform={`translate(540,1400) scale(${clockIn})`}
            style={{ filter: CUT7, transformOrigin: "540px 1400px" }}
          >
            <rect x={-36} y={-290} width={72} height={50} rx={12} fill="#c9a24a" />
            <circle r={236} fill="#c9a24a" />
            <circle r={210} fill="#fbf4e4" stroke="#8a6d2a" strokeWidth={6} />
            {clockSweep > 0 && (
              <path
                d={(() => {
                  const r = 186;
                  const rad = ((clockSweep - 90) * Math.PI) / 180;
                  return `M 0 0 L 0 ${-r} A ${r} ${r} 0 ${clockSweep > 180 ? 1 : 0} 1 ${r * Math.cos(rad)} ${r * Math.sin(rad)} Z`;
                })()}
                fill="#c8372d"
                opacity={0.85}
              />
            )}
            {ticks.map((a) => (
              <Tick key={a} a={a} major={a % 90 === 0} />
            ))}
            <g transform={`rotate(${clockSweep})`}>
              <line x1={0} y1={24} x2={0} y2={-182} stroke="#1f1a17" strokeWidth={10} strokeLinecap="round" />
              <circle r={18} fill="#1f1a17" />
            </g>
          </g>

          {/* tanda < 1 jam */}
          <g transform={`translate(540,${1730 + wobble}) scale(${lt})`} style={{ filter: CUT7, transformOrigin: "540px 1730px" }}>
            <rect x={-300} y={-70} width={600} height={140} rx={20} fill="#fbf4e4" stroke="#3a2f2a" strokeWidth={6} />
            <text x={0} y={34} textAnchor="middle" fontFamily={SANS7} fontWeight={900} fontSize={88} fill="#1f1a17">
              {"< 1 JAM!"}
            </text>
          </g>
        </svg>
      </AbsoluteFill>

      {/* label kertas (di luar kamera) */}
      <div
        style={{
          position: "absolute",
          right: 60,
          top: 360,
          padding: "14px 28px",
          background: "#f4ecd8",
          border: "4px double #7a6a52",
          boxShadow: "0 8px 0 rgba(60,40,20,0.25)",
          transform: `translateX(${ease7(f, [150, 170], [700, 0])}px) rotate(2deg)`,
          fontFamily: SANS7,
          fontWeight: 900,
          fontSize: 64,
          color: "#c8372d",
        }}
      >
        {clockMin} menit
      </div>

      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 60,
          textAlign: "center",
          fontFamily: SERIF7,
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 44,
          color: "#2a211b",
          opacity: ease7(f, [214, 232], [0, 1]),
          transform: `translateY(${ease7(f, [214, 232], [30, 0])}px)`,
        }}
      >
        Perang tercepat dalam sejarah
      </div>
    </AbsoluteFill>
  );
}