import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

// Scene05 · 5.34 s @ 30 fps · 1080x1920 · Comic History Cartoon (paper-cut)
export const SCENE05_FPS = 30;
export const SCENE05_DURATION = 160;
export const SCENE05_NARRATION =
  "Bangunan istana rusak parah, dan pasukan sultan tidak mampu bertahan lama.";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (
  f: number,
  [a, b]: [number, number],
  [c, d]: [number, number],
  e: (t: number) => number = Easing.out(Easing.cubic)
) => interpolate(f, [a, b], [c, d], { ...clamp, easing: e });

const CUT = "drop-shadow(0px 8px 0px rgba(60,40,20,0.28))";
const SERIF = "'Playfair Display','Georgia',serif";
const SANS = "'Baloo 2','Arial Black',sans-serif";

const IMPACTS = [16, 46, 78]; // frame saat peluru kena
const SHELL_FLIGHT = 12;
const PALACE = { x: 90, y: 640 };

const Soldier: React.FC<{
  x: number;
  y: number;
  rot?: number;
  bob?: number;
  s?: number;
}> = ({ x, y, rot = 0, bob = 0, s = 1 }) => (
  <g
    transform={`translate(${x},${y + bob}) rotate(${rot}) scale(${s})`}
    style={{ filter: CUT }}
  >
    <rect x={-22} y={70} width={16} height={44} rx={6} fill="#26211f" />
    <rect x={6} y={70} width={16} height={44} rx={6} fill="#26211f" />
    <rect x={-34} y={0} width={68} height={82} rx={14} fill="#f1ead8" stroke="#c9bd9a" strokeWidth={3} />
    <rect x={-34} y={0} width={68} height={22} rx={10} fill="#bf3b36" />
    {[16, 38, 60].map((yy) => (
      <circle key={yy} cx={0} cy={yy} r={4} fill="#c9a24a" />
    ))}
    <rect x={-50} y={8} width={18} height={50} rx={8} fill="#f1ead8" stroke="#c9bd9a" strokeWidth={3} />
    <rect x={32} y={8} width={18} height={50} rx={8} fill="#f1ead8" stroke="#c9bd9a" strokeWidth={3} />
    <circle cx={0} cy={-28} r={30} fill="#d9a77c" />
    <circle cx={-16} cy={-20} r={7} fill="#e98b7a" opacity={0.7} />
    <circle cx={16} cy={-20} r={7} fill="#e98b7a" opacity={0.7} />
    <path d="M-12 -34 L-4 -30 M12 -34 L4 -30" stroke="#2a1d18" strokeWidth={4} strokeLinecap="round" />
    <ellipse cx={0} cy={-12} rx={8} ry={10} fill="#5a2a22" />
    <path d="M-22 -58 L22 -58 L16 -84 L-16 -84 Z" fill="#b8312d" />
    <line x1={0} y1={-84} x2={22} y2={-72} stroke="#c9a24a" strokeWidth={4} />
    <circle cx={24} cy={-70} r={5} fill="#c9a24a" />
  </g>
);

const Smoke: React.FC<{ f: number; x: number; y: number; start: number; size?: number }> = ({
  f, x, y, start, size = 90,
}) => {
  const t = f - start;
  if (t < 0) return null;
  const op = ease(t, [0, 12, 70], [0, 0.85, 0] as any, Easing.linear);
  const o = interpolate(t, [0, 12, 70], [0, 0.85, 0], clamp);
  const sc = ease(t, [0, 70], [0.4, 1.8]);
  const dy = ease(t, [0, 70], [0, -190]);
  const dx = Math.sin(t / 14) * 18;
  void op;
  return (
    <g transform={`translate(${x + dx},${y + dy}) scale(${sc})`} opacity={o}>
      <circle r={size} fill="#6b6460" />
      <circle cx={-size * 0.6} cy={size * 0.2} r={size * 0.7} fill="#7d7570" />
      <circle cx={size * 0.65} cy={size * 0.1} r={size * 0.6} fill="#5b5551" />
    </g>
  );
};

const Flash: React.FC<{ f: number; at: number; x: number; y: number }> = ({ f, at, x, y }) => {
  const t = f - at;
  if (t < 0 || t > 10) return null;
  const sc = ease(t, [0, 4, 10], [0.3, 1.5, 1.1] as any, Easing.linear);
  const s = interpolate(t, [0, 4, 10], [0.3, 1.5, 1.1], clamp);
  const o = interpolate(t, [0, 3, 10], [1, 1, 0], clamp);
  void sc;
  const pts = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    const r = i % 2 ? 60 : 130;
    return `${Math.cos(a) * r},${Math.sin(a) * r}`;
  }).join(" ");
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
      <polygon points={pts} fill="#f4a43a" stroke="#c4501f" strokeWidth={6} />
      <circle r={52} fill="#fff1b8" />
    </g>
  );
};

export const durationInFrames = SCENE05_DURATION;

export const Scene05 = function Scene05() {
  const f = useCurrentFrame();

  // kamera: push-in diagonal + guncangan saat hantaman
  const shake = IMPACTS.reduce((a, t) => {
    const d = f - t;
    return d >= 0 && d < 12 ? a + Math.sin(d * 2.5) * (12 - d) * 1.4 : a;
  }, 0);
  const zoom = ease(f, [0, SCENE05_DURATION], [1.0, 1.14], Easing.inOut(Easing.quad));
  const panX = ease(f, [0, SCENE05_DURATION], [30, -40], Easing.inOut(Easing.quad));
  const panY = ease(f, [0, SCENE05_DURATION], [0, -50], Easing.inOut(Easing.quad));

  // menara runtuh
  const collapse = ease(f, [80, 135], [0, 1], Easing.in(Easing.quad));
  const topDX = collapse * 150;
  const topDY = collapse * 420;
  const topRot = collapse * 38;

  // retakan & lubang
  const hole = (at: number) => ease(f, [at, at + 5], [0, 1], Easing.out(Easing.back(2)));
  const crack = (at: number) => ease(f, [at, at + 14], [1, 0]);

  const bobShip = Math.sin(f / 9) * 6;

  const shells = [4, 34, 66].map((s, i) => {
    const targets = [
      { x: 250, y: 420 },
      { x: 470, y: 520 },
      { x: 760, y: 330 },
    ];
    const t = f - s;
    if (t < 0 || t > SHELL_FLIGHT) return null;
    const p = t / SHELL_FLIGHT;
    const sx = 900, sy = 360;
    const ex = PALACE.x + targets[i].x, ey = PALACE.y + targets[i].y;
    const x = sx + (ex - sx) * p;
    const y = sy + (ey - sy) * p - Math.sin(p * Math.PI) * 120;
    return (
      <g key={i}>
        <line x1={x + 60 * (1 - p)} y1={y - 30 * (1 - p)} x2={x} y2={y} stroke="#3a2f2a" strokeWidth={8} strokeLinecap="round" opacity={0.5} />
        <circle cx={x} cy={y} r={16} fill="#2c2623" />
      </g>
    );
  });

  const soldiers = [0, 1, 2, 3].map((i) => {
    const baseX = 640 + i * 110;
    const run = ease(f, [20 + i * 4, 150], [0, 560 + i * 20], Easing.inOut(Easing.quad));
    const fall = i === 1 ? ease(f, [82, 98], [0, 82], Easing.in(Easing.quad)) : 0;
    const fallDY = i === 1 ? ease(f, [82, 98], [0, 60]) : 0;
    const bob = Math.abs(Math.sin((f + i * 5) / 3)) * -14 * (fall ? 0 : 1);
    const pop = ease(f, [i * 3, i * 3 + 10], [0, 1], Easing.out(Easing.back(2)));
    return (
      <Soldier key={i} x={baseX - run} y={1580 + fallDY} rot={fall} bob={bob} s={0.95 * pop} />
    );
  });

  const bubble = ease(f, [52, 64], [0, 1], Easing.out(Easing.back(2.2)));

  return (
    <AbsoluteFill style={{ background: "#e6d3a3", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `translate(${panX + shake}px, ${panY + shake * 0.6}px) scale(${zoom})`,
          transformOrigin: "55% 50%",
        }}
      >
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          {/* laut */}
          <path
            d="M0 0 H1080 V520 Q 900 560 760 520 T 440 520 T 120 520 T 0 540 Z"
            fill="#7fb6c9"
          />
          <path d="M0 540 Q 140 500 300 540 T 620 540 T 1080 530 V560 H0Z" fill="#a8d3df" />
          <path d="M60 130 q40 -22 80 0 M700 90 q40 -22 80 0 M380 250 q40 -22 80 0" stroke="#d9eef3" strokeWidth={8} fill="none" strokeLinecap="round" />

          {/* kapal perang Inggris */}
          <g transform={`translate(780,${300 + bobShip})`} style={{ filter: CUT }}>
            <path d="M0 120 H300 L270 175 H35 Z" fill="#40485a" />
            <rect x={30} y={75} width={240} height={50} fill="#d8d4c8" stroke="#a9a493" strokeWidth={3} />
            <rect x={80} y={20} width={44} height={58} fill="#c9552e" />
            <rect x={160} y={20} width={44} height={58} fill="#c9552e" />
            <rect x={-30} y={96} width={90} height={14} rx={7} fill="#2d3340" />
            {IMPACTS.concat(0).map((t, i) => {
              const s = [4, 34, 66][i];
              if (s === undefined || f < s || f > s + 8) return null;
              return <circle key={i} cx={-40} cy={102} r={ease(f, [s, s + 8], [10, 42])} fill="#f4a43a" opacity={interpolate(f, [s, s + 8], [1, 0], clamp)} />;
            })}
          </g>

          {/* daratan */}
          <path d="M0 540 Q 200 600 420 570 T 1080 580 V1920 H0Z" fill="#ead9ae" />
          <path d="M0 1380 H1080 V1920 H0Z" fill="#d9c28a" />

          {/* istana */}
          <g transform={`translate(${PALACE.x},${PALACE.y})`} style={{ filter: CUT }}>
            <rect x={200} y={360} width={500} height={340} fill="#f4e7c8" stroke="#c9b385" strokeWidth={5} />
            <rect x={60} y={220} width={170} height={480} fill="#f1e3c2" stroke="#c9b385" strokeWidth={5} />
            <circle cx={145} cy={220} r={60} fill="#3f7f86" />
            <rect x={670} y={350} width={170} height={350} fill="#f1e3c2" stroke="#c9b385" strokeWidth={5} />
            {/* puncak menara kanan yang runtuh */}
            <g transform={`translate(${topDX},${topDY}) rotate(${topRot} 755 275)`}>
              <rect x={670} y={200} width={170} height={150} fill="#f1e3c2" stroke="#c9b385" strokeWidth={5} />
              <circle cx={755} cy={200} r={60} fill="#3f7f86" />
              <line x1={755} y1={140} x2={755} y2={80} stroke="#5a4636" strokeWidth={6} />
              <path d="M755 80 h70 l-14 20 l14 20 h-70Z" fill="#b8312d" />
            </g>
            <path d="M330 360 Q 450 230 570 360 Z" fill="#3f7f86" />
            {[250, 340, 430, 520, 610].map((x) => (
              <path key={x} d={`M${x} 520 v-70 a30 30 0 0 1 60 0 v70Z`} fill="#8a6a4d" />
            ))}
            <path d="M430 700 v-110 a50 50 0 0 1 100 0 v110Z" fill="#5a4636" />
            {/* lubang */}
            <circle cx={250} cy={420} r={50 * hole(IMPACTS[0])} fill="#4a3a30" />
            <circle cx={470} cy={520} r={62 * hole(IMPACTS[1])} fill="#4a3a30" />
            <circle cx={760} cy={430} r={44 * hole(IMPACTS[2])} fill="#4a3a30" />
            {/* retakan */}
            <polyline points="250,420 290,500 270,560 310,640" stroke="#5a4636" strokeWidth={6} fill="none" strokeDasharray={200} strokeDashoffset={200 * crack(IMPACTS[0] + 2)} />
            <polyline points="470,520 560,470 600,560 660,600" stroke="#5a4636" strokeWidth={6} fill="none" strokeDasharray={260} strokeDashoffset={260 * crack(IMPACTS[1] + 2)} />
            <polyline points="560,360 540,420 590,470" stroke="#5a4636" strokeWidth={6} fill="none" strokeDasharray={160} strokeDashoffset={160 * crack(IMPACTS[1] + 4)} />
            {/* ledakan */}
            <Flash f={f} at={IMPACTS[0]} x={250} y={420} />
            <Flash f={f} at={IMPACTS[1]} x={470} y={520} />
            <Flash f={f} at={IMPACTS[2]} x={760} y={330} />
            {/* puing */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const at = IMPACTS[i % 3];
              const t = f - at;
              if (t < 0 || t > 40) return null;
              const bx = [250, 470, 760][i % 3];
              const by = [420, 520, 330][i % 3];
              const dir = i < 3 ? -1 : 1;
              return (
                <rect
                  key={i}
                  x={bx + dir * t * (4 + i)}
                  y={by - 40 * t * 0.4 + t * t * 0.9}
                  width={22}
                  height={22}
                  fill="#cdb98b"
                  stroke="#8a7550"
                  strokeWidth={3}
                  transform={`rotate(${t * 18 * dir} ${bx + dir * t * (4 + i)} ${by})`}
                  opacity={interpolate(t, [25, 40], [1, 0], clamp)}
                />
              );
            })}
          </g>

          {/* asap */}
          <Smoke f={f} x={PALACE.x + 250} y={PALACE.y + 400} start={IMPACTS[0]} />
          <Smoke f={f} x={PALACE.x + 470} y={PALACE.y + 500} start={IMPACTS[1]} size={100} />
          <Smoke f={f} x={PALACE.x + 760} y={PALACE.y + 330} start={IMPACTS[2]} size={110} />
          <Smoke f={f} x={PALACE.x + 300} y={PALACE.y + 460} start={IMPACTS[2] + 10} size={80} />

          {/* prajurit sultan mundur ke kiri */}
          {soldiers}

          {/* balon ucapan */}
          <g transform={`translate(330,1290) scale(${bubble})`} style={{ transformOrigin: "330px 1290px", filter: CUT }}>
            <path d="M0 0 H400 a40 40 0 0 1 40 40 V150 a40 40 0 0 1 -40 40 H150 L110 250 L100 190 H0 a40 40 0 0 1 -40 -40 V40 a40 40 0 0 1 40 -40Z" fill="#fbf4e4" stroke="#3a2f2a" strokeWidth={5} transform="translate(20,0)" />
            <text x={240} y={90} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={68} fill="#1f1a17">MUNDUR!</text>
            <text x={240} y={150} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={34} fill="#c8372d">Kami tak sanggup!</text>
          </g>
        </svg>
      </AbsoluteFill>

      {/* label kertas (di luar kamera) */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 70,
          width: 700,
          padding: "20px 30px",
          background: "#f4ecd8",
          border: "4px double #7a6a52",
          boxShadow: "0 8px 0 rgba(60,40,20,0.25)",
          transform: `translateX(${ease(f, [0, 14], [-800, 0])}px) rotate(-1.5deg)`,
        }}
      >
        <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 84, color: "#2a211b", lineHeight: 1 }}>1896</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 38, color: "#4a3d31", marginTop: 6 }}>
          Zanzibar, 27 Agustus · istana runtuh
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          bottom: 110,
          textAlign: "center",
          fontFamily: SERIF,
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 48,
          color: "#2a211b",
          background: "#f4ecd8",
          padding: "18px 24px",
          boxShadow: "0 8px 0 rgba(60,40,20,0.25)",
          opacity: ease(f, [90, 108], [0, 1]),
          transform: `translateY(${ease(f, [90, 108], [40, 0])}px) rotate(1deg)`,
        }}
      >
        Pasukan sultan tak mampu bertahan lama
      </div>
    </AbsoluteFill>
  );
}