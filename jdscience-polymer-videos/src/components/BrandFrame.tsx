import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

export const BrandFrame: React.FC<{ title?: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(1200px 700px at 85% 10%, rgba(20,184,166,0.18), transparent 55%), radial-gradient(900px 600px at 10% 90%, rgba(15,118,110,0.22), transparent 50%), ${COLORS.bg}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 14,
          background: COLORS.teal,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 14,
          right: 0,
          top: 0,
          height: 72,
          background: COLORS.tealDark,
          display: "flex",
          alignItems: "center",
          padding: "0 36px",
          gap: 24,
          borderBottom: `3px solid ${COLORS.teal}`,
        }}
      >
        <div
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: COLORS.tealSoft,
            letterSpacing: 1.2,
          }}
        >
          JD SCIENCE
        </div>
        <div style={{ fontSize: 20, color: COLORS.muted }}>
          GCSE Chemistry · Polymers
        </div>
        {title ? (
          <div
            style={{
              marginLeft: "auto",
              fontSize: 20,
              fontWeight: 700,
              color: COLORS.white,
            }}
          >
            {title}
          </div>
        ) : null}
      </div>
      {subtitle ? (
        <div
          style={{
            position: "absolute",
            left: 48,
            bottom: 28,
            fontSize: 18,
            color: COLORS.muted,
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
