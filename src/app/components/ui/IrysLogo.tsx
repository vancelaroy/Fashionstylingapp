// IRYS Logo — iris-of-the-eye mark + wordmark
// Three variants: mark only, wordmark only, stacked (mark + wordmark)

interface IrysLogoProps {
  variant?: "mark" | "wordmark" | "stacked";
  size?: number;
  color?: string;
  background?: string;
  className?: string;
}

export function IrysLogo({
  variant = "stacked",
  size = 48,
  color = "#C7B38B",
  background = "transparent",
  className,
}: IrysLogoProps) {
  if (variant === "mark") {
    return <IrysMark size={size} color={color} background={background} className={className} />;
  }
  if (variant === "wordmark") {
    return <IrysWordmark size={size} color={color} className={className} />;
  }
  // stacked
  return (
    <div className={`flex flex-col items-center gap-2 ${className ?? ""}`}>
      <IrysMark size={size} color={color} background={background} />
      <IrysWordmark size={size * 0.65} color={color} />
    </div>
  );
}

// ── The iris-eye mark ─────────────────────────────────────────────────────────
// Concentric rings + 16 radiating fiber lines — reads as an iris at any size

function IrysMark({ size, color, background, className }: { size: number; color: string; background: string; className?: string }) {
  const cx = 50;
  const cy = 50;
  const outerR = 44;    // outer ring
  const midR = 28;      // iris inner boundary
  const pupilR = 11;    // pupil

  // 16 radiating lines from midR to outerR
  const fibers = Array.from({ length: 16 }, (_, i) => {
    const angle = (i * 360) / 16;
    const rad = (angle * Math.PI) / 180;
    const x1 = cx + midR * Math.cos(rad);
    const y1 = cy + midR * Math.sin(rad);
    const x2 = cx + outerR * Math.cos(rad);
    const y2 = cy + outerR * Math.sin(rad);
    return { x1, y1, x2, y2 };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block" }}
    >
      {/* Background tile (transparent unless specified) */}
      {background !== "transparent" && (
        <rect width="100" height="100" rx="24" fill={background} />
      )}

      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={outerR} stroke={color} strokeWidth="1.8" />

      {/* Iris fiber lines */}
      {fibers.map((f, i) => (
        <line
          key={i}
          x1={f.x1} y1={f.y1}
          x2={f.x2} y2={f.y2}
          stroke={color}
          strokeWidth="0.9"
          strokeOpacity="0.55"
        />
      ))}

      {/* Inner iris ring */}
      <circle cx={cx} cy={cy} r={midR} stroke={color} strokeWidth="1.2" />

      {/* Pupil — solid */}
      <circle cx={cx} cy={cy} r={pupilR} fill={color} />

      {/* Highlight — tiny offset circle for depth */}
      <circle cx={cx + 4} cy={cy - 4} r={2.5} fill="rgba(245,240,232,0.35)" />
    </svg>
  );
}

// ── The wordmark ──────────────────────────────────────────────────────────────
// IRYS in spaced italic Cormorant — clean editorial fashion wordmark

function IrysWordmark({ size, color, className }: { size: number; color: string; className?: string }) {
  const fontSize = size * 0.85;
  return (
    <svg
      width={size * 2.8}
      height={size}
      viewBox={`0 0 ${size * 2.8} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block" }}
    >
      <text
        x={size * 1.4}
        y={size * 0.78}
        textAnchor="middle"
        fill={color}
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontSize={fontSize}
        fontStyle="italic"
        fontWeight="400"
        letterSpacing={size * 0.18}
      >
        Irys
      </text>
    </svg>
  );
}

// ── App icon variant — square tile for homescreen / favicon ───────────────────

export function IrysAppIcon({ size = 120 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      {/* Dark tile */}
      <rect width="120" height="120" rx="26" fill="#161616" />

      {/* Subtle gold border */}
      <rect width="120" height="120" rx="26" fill="none" stroke="#C7B38B" strokeWidth="1" strokeOpacity="0.3" />

      {/* Iris mark — centered, slightly above mathematical center for optical balance */}
      <g transform="translate(60 58)">
        {/* Outer ring */}
        <circle r="39" stroke="#C7B38B" strokeWidth="1.6" />

        {/* 16 fiber lines */}
        {Array.from({ length: 16 }, (_, i) => {
          const angle = (i * 360) / 16;
          const rad = (angle * Math.PI) / 180;
          const x1 = 25 * Math.cos(rad);
          const y1 = 25 * Math.sin(rad);
          const x2 = 38 * Math.cos(rad);
          const y2 = 38 * Math.sin(rad);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C7B38B" strokeWidth="0.8" strokeOpacity="0.5" />;
        })}

        {/* Inner ring */}
        <circle r="25" stroke="#C7B38B" strokeWidth="1.1" />

        {/* Pupil */}
        <circle r="10" fill="#C7B38B" />

        {/* Specular highlight */}
        <circle cx="4" cy="-4" r="2.2" fill="rgba(245,240,232,0.3)" />
      </g>
    </svg>
  );
}
