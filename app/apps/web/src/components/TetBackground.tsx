/**
 * Fixed, non-interactive decorative layer behind every page: two swaying red lanterns in the top
 * corners (desktop only), a faint bamboo silhouette along the bottom, and a slow drizzle of gold
 * apricot-blossom petals. Pure CSS animations (see globals.css) — no JS timers, so it costs nothing
 * on the ~70 student phones; `prefers-reduced-motion` turns it all off.
 *
 * Petal positions are generated from a fixed seed table (not Math.random) so server and client
 * render identical markup and React doesn't warn about hydration mismatches.
 */

const PETALS: { left: number; delay: number; dur: number; size: number; drift: number }[] = [
  { left: 4, delay: 0, dur: 15, size: 12, drift: 30 },
  { left: 11, delay: 3.2, dur: 18, size: 9, drift: -40 },
  { left: 19, delay: 7.5, dur: 14, size: 14, drift: 60 },
  { left: 27, delay: 1.1, dur: 20, size: 10, drift: -25 },
  { left: 35, delay: 9.8, dur: 16, size: 13, drift: 45 },
  { left: 43, delay: 4.6, dur: 19, size: 8, drift: -55 },
  { left: 51, delay: 12.3, dur: 15, size: 15, drift: 20 },
  { left: 58, delay: 2.4, dur: 17, size: 11, drift: -35 },
  { left: 66, delay: 6.9, dur: 21, size: 9, drift: 50 },
  { left: 73, delay: 10.7, dur: 14, size: 13, drift: -20 },
  { left: 80, delay: 0.8, dur: 18, size: 10, drift: 40 },
  { left: 87, delay: 5.3, dur: 16, size: 12, drift: -60 },
  { left: 94, delay: 8.1, dur: 20, size: 8, drift: 25 },
  { left: 15, delay: 13.9, dur: 17, size: 11, drift: -45 },
  { left: 62, delay: 11.2, dur: 19, size: 14, drift: 35 },
  { left: 39, delay: 14.6, dur: 15, size: 9, drift: -30 },
];

function Lantern({ className }: { className: string }) {
  return (
    <div className={`lantern ${className}`}>
      <div className="string" />
      <div className="cap" />
      <div className="body" />
      <div className="tassel" />
    </div>
  );
}

function Bamboo({ className }: { className: string }) {
  // Three stalks with node rings + a few leaves. Drawn once as an SVG, mirrored via CSS for the
  // right-hand copy.
  return (
    <svg className={className} viewBox="0 0 160 220" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="bamboo-g" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#6fbf5a" />
          <stop offset="1" stopColor="#2e7d32" />
        </linearGradient>
      </defs>
      {[
        { x: 20, h: 220, w: 16 },
        { x: 60, h: 190, w: 13 },
        { x: 100, h: 205, w: 15 },
      ].map((s, i) => (
        <g key={i}>
          <rect x={s.x} y={220 - s.h} width={s.w} height={s.h} rx={s.w / 2} fill="url(#bamboo-g)" />
          {[0.25, 0.5, 0.75].map((f) => (
            <rect key={f} x={s.x - 1} y={220 - s.h * f} width={s.w + 2} height="4" rx="2" fill="#f6cf5a" opacity="0.8" />
          ))}
        </g>
      ))}
      {[
        [30, 60, -35],
        [75, 40, 25],
        [115, 70, -20],
        [50, 110, 30],
        [125, 120, 15],
      ].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx="26" ry="7" fill="#43a047" transform={`rotate(${r} ${x} ${y})`} />
      ))}
    </svg>
  );
}

export function TetBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-app-gradient">
      {/* lanterns — hidden on phones where they would crowd the join form */}
      <Lantern className="left-6 hidden md:block" />
      <Lantern className="right-8 hidden md:block [animation-delay:-2.5s]" />

      {/* bamboo along the bottom edge */}
      <Bamboo className="absolute -bottom-4 -left-6 h-56 w-40 opacity-[0.16] md:h-72 md:w-52" />
      <Bamboo className="absolute -bottom-4 -right-6 h-56 w-40 -scale-x-100 opacity-[0.16] md:h-72 md:w-52" />

      {/* falling petals */}
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={
            {
              "--left": `${p.left}%`,
              "--delay": `${p.delay}s`,
              "--dur": `${p.dur}s`,
              "--size": `${p.size}px`,
              "--drift": `${p.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
