import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

type Atom = { x: number; y: number; label: string; color: string; r?: number };

const AtomNode: React.FC<Atom & { scale?: number }> = ({
  x,
  y,
  label,
  color,
  r = 28,
  scale = 1,
}) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <circle r={r} fill={color} stroke="#0f172a" strokeWidth={3} />
    <text
      textAnchor="middle"
      dominantBaseline="central"
      fill="#0f172a"
      fontSize={r * 0.9}
      fontWeight={800}
      fontFamily="DejaVu Sans, Arial, sans-serif"
    >
      {label}
    </text>
  </g>
);

const Bond: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  double?: boolean;
  progress?: number;
}> = ({ x1, y1, x2, y2, double, progress = 1 }) => {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * 7;
  const ny = (dx / len) * 7;
  const x2a = x1 + dx * progress;
  const y2a = y1 + dy * progress;
  if (!double) {
    return (
      <line
        x1={x1}
        y1={y1}
        x2={x2a}
        y2={y2a}
        stroke={COLORS.bond}
        strokeWidth={6}
        strokeLinecap="round"
      />
    );
  }
  return (
    <g>
      <line
        x1={x1 + nx}
        y1={y1 + ny}
        x2={x1 + nx + (x2a - x1)}
        y2={y1 + ny + (y2a - y1)}
        stroke={COLORS.doubleBond}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <line
        x1={x1 - nx}
        y1={y1 - ny}
        x2={x1 - nx + (x2a - x1)}
        y2={y1 - ny + (y2a - y1)}
        stroke={COLORS.doubleBond}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <circle cx={mx} cy={my} r={0.1} fill="transparent" />
    </g>
  );
};

/** Ethene displayed formula C2H4 with animated double bond */
export const EtheneMolecule: React.FC<{
  highlightDouble?: boolean;
  breakDouble?: number;
  scale?: number;
}> = ({ highlightDouble, breakDouble = 0, scale = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16 } });
  const bondProgress = interpolate(breakDouble, [0, 1], [1, 0.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const gap = breakDouble * 40;

  return (
    <svg width={520 * scale} height={280 * scale} viewBox="0 0 520 280">
      <g transform={`translate(${(1 - enter) * -40},0)`} opacity={enter}>
        <Bond x1={170 - gap} y1={140} x2={350 + gap} y2={140} double progress={bondProgress} />
        <AtomNode x={170 - gap} y={140} label="C" color={COLORS.carbon} />
        <AtomNode x={350 + gap} y={140} label="C" color={COLORS.carbon} />
        <Bond x1={170 - gap} y1={140} x2={90 - gap} y2={70} />
        <Bond x1={170 - gap} y1={140} x2={90 - gap} y2={210} />
        <Bond x1={350 + gap} y1={140} x2={430 + gap} y2={70} />
        <Bond x1={350 + gap} y1={140} x2={430 + gap} y2={210} />
        <AtomNode x={90 - gap} y={70} label="H" color={COLORS.hydrogen} r={22} />
        <AtomNode x={90 - gap} y={210} label="H" color={COLORS.hydrogen} r={22} />
        <AtomNode x={430 + gap} y={70} label="H" color={COLORS.hydrogen} r={22} />
        <AtomNode x={430 + gap} y={210} label="H" color={COLORS.hydrogen} r={22} />
        {highlightDouble ? (
          <rect
            x={230}
            y={105}
            width={60}
            height={70}
            rx={12}
            fill="none"
            stroke={COLORS.highlight}
            strokeWidth={3}
            strokeDasharray="8 6"
            opacity={0.9}
          />
        ) : null}
      </g>
      <text x={260} y={268} textAnchor="middle" fill={COLORS.tealSoft} fontSize={22} fontWeight={700}>
        ethene · C₂H₄
      </text>
    </svg>
  );
};

/** Propene displayed formula */
export const PropeneMolecule: React.FC<{ scale?: number; highlightDouble?: boolean }> = ({
  scale = 1,
  highlightDouble,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16 } });

  return (
    <svg width={620 * scale} height={300 * scale} viewBox="0 0 620 300">
      <g opacity={enter} transform={`translate(0, ${(1 - enter) * 20})`}>
        <Bond x1={160} y1={150} x2={300} y2={150} double />
        <Bond x1={300} y1={150} x2={440} y2={150} />
        <AtomNode x={160} y={150} label="C" color={COLORS.carbon} />
        <AtomNode x={300} y={150} label="C" color={COLORS.carbon} />
        <AtomNode x={440} y={150} label="C" color={COLORS.carbon} />
        <Bond x1={160} y1={150} x2={80} y2={80} />
        <Bond x1={160} y1={150} x2={80} y2={220} />
        <Bond x1={300} y1={150} x2={300} y2={70} />
        <Bond x1={440} y1={150} x2={520} y2={80} />
        <Bond x1={440} y1={150} x2={520} y2={150} />
        <Bond x1={440} y1={150} x2={520} y2={220} />
        <AtomNode x={80} y={80} label="H" color={COLORS.hydrogen} r={22} />
        <AtomNode x={80} y={220} label="H" color={COLORS.hydrogen} r={22} />
        <AtomNode x={300} y={70} label="H" color={COLORS.hydrogen} r={22} />
        <AtomNode x={520} y={80} label="H" color={COLORS.hydrogen} r={22} />
        <AtomNode x={520} y={150} label="H" color={COLORS.hydrogen} r={22} />
        <AtomNode x={520} y={220} label="H" color={COLORS.hydrogen} r={22} />
        {highlightDouble ? (
          <rect
            x={200}
            y={115}
            width={70}
            height={70}
            rx={12}
            fill="none"
            stroke={COLORS.highlight}
            strokeWidth={3}
            strokeDasharray="8 6"
          />
        ) : null}
      </g>
      <text x={310} y={288} textAnchor="middle" fill={COLORS.tealSoft} fontSize={22} fontWeight={700}>
        propene · C₃H₆
      </text>
    </svg>
  );
};

/** Growing addition polymer chain */
export const PolymerChain: React.FC<{
  units?: number;
  label?: string;
  sideGroup?: string;
}> = ({ units = 5, label = "poly(ethene)", sideGroup }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const appear = spring({ frame, fps, config: { damping: 14 } });
  const shown = Math.max(1, Math.floor(interpolate(appear, [0, 1], [1, units + 0.99])));

  const spacing = 110;
  const startX = 80;

  return (
    <svg width={900} height={220} viewBox="0 0 900 220">
      <text x={40} y={36} fill={COLORS.muted} fontSize={18} fontWeight={700}>
        repeating unit →
      </text>
      {Array.from({ length: shown }).map((_, i) => {
        const x = startX + i * spacing;
        const local = spring({
          frame: frame - i * 4,
          fps,
          config: { damping: 16 },
        });
        return (
          <g key={i} opacity={local} transform={`translate(${(1 - local) * 20},0)`}>
            {i > 0 ? (
              <line
                x1={x - spacing + 36}
                y1={120}
                x2={x - 36}
                y2={120}
                stroke={COLORS.teal}
                strokeWidth={6}
              />
            ) : (
              <text x={x - 55} y={128} fill={COLORS.muted} fontSize={28} fontWeight={700}>
                [
              </text>
            )}
            <AtomNode x={x - 22} y={120} label="C" color={COLORS.carbon} r={24} />
            <AtomNode x={x + 22} y={120} label="C" color={COLORS.carbon} r={24} />
            <line x1={x - 22} y1={120} x2={x + 22} y2={120} stroke={COLORS.bond} strokeWidth={5} />
            <AtomNode x={x - 22} y={70} label="H" color={COLORS.hydrogen} r={16} />
            <AtomNode x={x - 22} y={170} label="H" color={COLORS.hydrogen} r={16} />
            <AtomNode
              x={x + 22}
              y={70}
              label={sideGroup && i % 2 === 1 ? sideGroup : "H"}
              color={sideGroup && i % 2 === 1 ? COLORS.accent : COLORS.hydrogen}
              r={16}
            />
            <AtomNode x={x + 22} y={170} label="H" color={COLORS.hydrogen} r={16} />
            <line x1={x - 22} y1={120} x2={x - 22} y2={70} stroke={COLORS.bond} strokeWidth={4} />
            <line x1={x - 22} y1={120} x2={x - 22} y2={170} stroke={COLORS.bond} strokeWidth={4} />
            <line x1={x + 22} y1={120} x2={x + 22} y2={70} stroke={COLORS.bond} strokeWidth={4} />
            <line x1={x + 22} y1={120} x2={x + 22} y2={170} stroke={COLORS.bond} strokeWidth={4} />
          </g>
        );
      })}
      <text
        x={startX + shown * spacing - 40}
        y={128}
        fill={COLORS.muted}
        fontSize={28}
        fontWeight={700}
      >
        ]ₙ
      </text>
      <text x={450} y={210} textAnchor="middle" fill={COLORS.tealSoft} fontSize={22} fontWeight={700}>
        {label}
      </text>
    </svg>
  );
};

/** Condensation: diol + diacid → polyester + water */
export const PolyesterFormation: React.FC<{ stage: number }> = ({ stage }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame, fps, config: { damping: 15 } });

  return (
    <svg width={1100} height={360} viewBox="0 0 1100 360">
      <g opacity={a}>
        {/* diol */}
        <rect x={40} y={40} width={300} height={120} rx={18} fill={COLORS.panel} />
        <text x={190} y={75} textAnchor="middle" fill={COLORS.tealSoft} fontSize={20} fontWeight={700}>
          diol (HO–R–OH)
        </text>
        <AtomNode x={90} y={120} label="HO" color={COLORS.oxygen} r={26} />
        <line x1={116} y1={120} x2={190} y2={120} stroke={COLORS.bond} strokeWidth={5} />
        <AtomNode x={220} y={120} label="R" color={COLORS.carbon} r={26} />
        <line x1={246} y1={120} x2={300} y2={120} stroke={COLORS.bond} strokeWidth={5} />
        <AtomNode x={310} y={120} label="OH" color={COLORS.oxygen} r={26} />

        {/* plus */}
        <text x={390} y={125} fill={COLORS.accent} fontSize={42} fontWeight={800}>
          +
        </text>

        {/* diacid */}
        <rect x={440} y={40} width={380} height={120} rx={18} fill={COLORS.panel} />
        <text x={630} y={75} textAnchor="middle" fill={COLORS.tealSoft} fontSize={20} fontWeight={700}>
          dicarboxylic acid (HOOC–R'–COOH)
        </text>
        <AtomNode x={500} y={120} label="HOOC" color={COLORS.oxygen} r={28} />
        <line x1={530} y1={120} x2={610} y2={120} stroke={COLORS.bond} strokeWidth={5} />
        <AtomNode x={640} y={120} label="R'" color={COLORS.carbon} r={26} />
        <line x1={666} y1={120} x2={740} y2={120} stroke={COLORS.bond} strokeWidth={5} />
        <AtomNode x={780} y={120} label="COOH" color={COLORS.oxygen} r={28} />

        {stage >= 1 ? (
          <>
            <text x={550} y={210} textAnchor="middle" fill={COLORS.accent} fontSize={36} fontWeight={800}>
              ↓ condensation (− H₂O)
            </text>
            <rect x={120} y={240} width={860} height={100} rx={18} fill={COLORS.panel} />
            <text x={550} y={280} textAnchor="middle" fill={COLORS.tealSoft} fontSize={22} fontWeight={700}>
              polyester repeating unit
            </text>
            <text
              x={550}
              y={318}
              textAnchor="middle"
              fill={COLORS.white}
              fontSize={26}
              fontWeight={700}
              fontFamily="DejaVu Sans, Arial, sans-serif"
            >
              [–O–R–O–CO–R'–CO–]ₙ
            </text>
          </>
        ) : null}
        {stage >= 2 ? (
          <g>
            <circle cx={980} cy={280} r={42} fill={COLORS.oxygen} opacity={0.9} />
            <text
              x={980}
              y={286}
              textAnchor="middle"
              fill="#fff"
              fontSize={20}
              fontWeight={800}
            >
              H₂O
            </text>
          </g>
        ) : null}
      </g>
    </svg>
  );
};

/** Addition polymerisation equation card */
export const AdditionEquation: React.FC<{
  monomer: string;
  polymer: string;
}> = ({ monomer, polymer }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14 } });

  return (
    <div
      style={{
        transform: `translateY(${(1 - enter) * 24}px)`,
        opacity: enter,
        background: COLORS.panel,
        borderRadius: 20,
        padding: "28px 40px",
        border: `2px solid ${COLORS.teal}`,
        minWidth: 760,
      }}
    >
      <div style={{ color: COLORS.muted, fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
        ADDITION POLYMERISATION
      </div>
      <div
        style={{
          color: COLORS.white,
          fontSize: 36,
          fontWeight: 800,
          fontFamily: "DejaVu Sans, Arial, sans-serif",
          letterSpacing: 0.5,
        }}
      >
        n {monomer} → [ {polymer} ]ₙ
      </div>
    </div>
  );
};
