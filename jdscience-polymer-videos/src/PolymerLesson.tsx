import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BrandFrame } from "./components/BrandFrame";
import {
  AdditionEquation,
  EtheneMolecule,
  PolyesterFormation,
  PolymerChain,
  PropeneMolecule,
} from "./components/Molecules";
import { Lesson, Scene } from "./lessons";
import { COLORS } from "./theme";

export type PolymerLessonProps = {
  lesson: Lesson;
  audioFile: string | null;
  /** Scene start frames (inclusive), length = scenes.length; last end = durationInFrames */
  sceneStarts: number[];
};

const FadeIn: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame: frame - delay, fps, config: { damping: 16 } });
  return (
    <div style={{ opacity: t, transform: `translateY(${(1 - t) * 18}px)` }}>
      {children}
    </div>
  );
};

const SceneChrome: React.FC<{ scene: Scene; children?: React.ReactNode }> = ({
  scene,
  children,
}) => {
  return (
    <AbsoluteFill style={{ padding: "110px 64px 80px" }}>
      <FadeIn>
        <div
          style={{
            color: COLORS.teal,
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          {scene.eyebrow}
        </div>
        <div
          style={{
            color: COLORS.white,
            fontSize: 54,
            fontWeight: 800,
            lineHeight: 1.15,
            maxWidth: 1500,
            marginBottom: 18,
          }}
        >
          {scene.heading}
        </div>
        {scene.body && !scene.body.startsWith("stage-") ? (
          <div
            style={{
              color: COLORS.muted,
              fontSize: 28,
              lineHeight: 1.4,
              maxWidth: 1400,
              marginBottom: 28,
            }}
          >
            {scene.body}
          </div>
        ) : null}
      </FadeIn>
      <div style={{ marginTop: 12 }}>{children}</div>
    </AbsoluteFill>
  );
};

const BulletList: React.FC<{ items: string[] }> = ({ items }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {items.map((item, i) => {
        const t = spring({
          frame: frame - 8 - i * 6,
          fps,
          config: { damping: 14 },
        });
        return (
          <div
            key={item}
            style={{
              opacity: t,
              transform: `translateX(${(1 - t) * 24}px)`,
              background: COLORS.panel,
              borderRadius: 16,
              padding: "18px 24px",
              borderLeft: `6px solid ${COLORS.teal}`,
              color: COLORS.white,
              fontSize: 28,
              fontWeight: 600,
              maxWidth: 1400,
            }}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
};

const SceneView: React.FC<{ lesson: Lesson; scene: Scene }> = ({
  lesson,
  scene,
}) => {
  const frame = useCurrentFrame();

  if (scene.kind === "title") {
    return (
      <SceneChrome scene={scene}>
        <div style={{ display: "flex", gap: 40, alignItems: "center", marginTop: 20 }}>
          <div
            style={{
              flex: 1,
              height: 360,
              borderRadius: 24,
              background: COLORS.panel,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${COLORS.tealDark}`,
            }}
          >
            {lesson.id.includes("propene") ? (
              <PropeneMolecule scale={0.95} />
            ) : lesson.id.includes("polyester") ? (
              <PolyesterFormation stage={0} />
            ) : (
              <EtheneMolecule scale={1.05} highlightDouble />
            )}
          </div>
          <div style={{ width: 420 }}>
            <div
              style={{
                background: COLORS.panel,
                borderRadius: 20,
                padding: 28,
                color: COLORS.tealSoft,
                fontSize: 24,
                fontWeight: 700,
                lineHeight: 1.45,
              }}
            >
              Watch the displayed formulae change as the voiceover explains each step.
            </div>
          </div>
        </div>
      </SceneChrome>
    );
  }

  if (scene.kind === "definition" || scene.kind === "uses" || scene.kind === "summary") {
    return (
      <SceneChrome scene={scene}>
        <BulletList items={scene.bullets || []} />
      </SceneChrome>
    );
  }

  if (scene.kind === "compare") {
    const left = scene.bullets?.[0] || "";
    const right = scene.bullets?.[1] || "";
    return (
      <SceneChrome scene={scene}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginTop: 12 }}>
          {[
            { t: "Addition", d: left, c: COLORS.teal },
            { t: "Condensation", d: right, c: COLORS.accent },
          ].map((card, i) => {
            const t = spring({
              frame: frame - 6 - i * 8,
              fps: 30,
              config: { damping: 14 },
            });
            return (
              <div
                key={card.t}
                style={{
                  opacity: t,
                  background: COLORS.panel,
                  borderRadius: 22,
                  padding: 32,
                  borderTop: `8px solid ${card.c}`,
                  minHeight: 280,
                }}
              >
                <div style={{ color: card.c, fontSize: 28, fontWeight: 800, marginBottom: 16 }}>
                  {card.t}
                </div>
                <div style={{ color: COLORS.white, fontSize: 26, lineHeight: 1.45 }}>
                  {card.d}
                </div>
              </div>
            );
          })}
        </div>
      </SceneChrome>
    );
  }

  if (scene.kind === "molecule") {
    const breaking = /open|break|join|link/i.test(scene.heading + (scene.body || ""));
    const breakAmt = breaking
      ? interpolate(frame, [10, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      : 0;
    return (
      <SceneChrome scene={scene}>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
          {lesson.id.includes("propene") ? (
            <PropeneMolecule highlightDouble scale={1.15} />
          ) : (
            <EtheneMolecule
              highlightDouble={!breaking}
              breakDouble={breakAmt}
              scale={1.2}
            />
          )}
        </div>
      </SceneChrome>
    );
  }

  if (scene.kind === "equation") {
    const monomer = lesson.id.includes("propene")
      ? "CH₂=CHCH₃"
      : lesson.id.includes("ethene") || lesson.id.includes("polyethene")
        ? "CH₂=CH₂"
        : "monomer";
    const polymer = lesson.id.includes("propene")
      ? "–CH₂–CH(CH₃)–"
      : lesson.id.includes("ethene") || lesson.id.includes("polyethene")
        ? "–CH₂–CH₂–"
        : "repeating unit";
    return (
      <SceneChrome scene={scene}>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
          <AdditionEquation monomer={monomer} polymer={polymer} />
        </div>
        {scene.body ? (
          <div
            style={{
              marginTop: 36,
              textAlign: "center",
              color: COLORS.tealSoft,
              fontSize: 32,
              fontWeight: 700,
              fontFamily: "DejaVu Sans, Arial, sans-serif",
            }}
          >
            {scene.body}
          </div>
        ) : null}
      </SceneChrome>
    );
  }

  if (scene.kind === "chain") {
    return (
      <SceneChrome scene={scene}>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
          <PolymerChain
            units={6}
            label={scene.body || "polymer"}
            sideGroup={lesson.id.includes("propene") ? "CH₃" : undefined}
          />
        </div>
      </SceneChrome>
    );
  }

  if (scene.kind === "polyester") {
    const stage = scene.body === "stage-2" ? 2 : scene.body === "stage-0" ? 0 : 1;
    return (
      <SceneChrome scene={scene}>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
          <PolyesterFormation stage={stage} />
        </div>
      </SceneChrome>
    );
  }

  return <SceneChrome scene={scene} />;
};

export const PolymerLesson: React.FC<PolymerLessonProps> = ({
  lesson,
  audioFile,
  sceneStarts,
}) => {
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <BrandFrame title={lesson.title} subtitle={lesson.series} />
      {audioFile ? <Audio src={staticFile(`audio/${audioFile}`)} /> : null}
      {lesson.scenes.map((scene, i) => {
        const start = sceneStarts[i] ?? 0;
        const end = sceneStarts[i + 1] ?? durationInFrames;
        const dur = Math.max(1, end - start);
        return (
          <Sequence key={scene.id} from={start} durationInFrames={dur} name={scene.id}>
            <SceneView lesson={lesson} scene={scene} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
