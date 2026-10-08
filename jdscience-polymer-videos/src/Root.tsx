import React from "react";
import { Composition, CalculateMetadataFunction } from "remotion";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { resolveAudioFile } from "./audioMap";
import { LESSONS, Lesson } from "./lessons";
import { PolymerLesson, PolymerLessonProps } from "./PolymerLesson";
import { FPS, HEIGHT, WIDTH } from "./theme";

const DEFAULT_SECONDS = 60;

function sceneStartsFor(lesson: Lesson, totalFrames: number): number[] {
  const weights = lesson.scenes.map((s) => s.weight);
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const starts: number[] = [];
  let acc = 0;
  for (let i = 0; i < lesson.scenes.length; i++) {
    starts.push(Math.round(acc));
    acc += (weights[i] / sum) * totalFrames;
  }
  return starts;
}

const makeMetadata =
  (lesson: Lesson): CalculateMetadataFunction<PolymerLessonProps> =>
  async ({ props }) => {
    const audioFile = props.audioFile ?? resolveAudioFile(lesson);
    let seconds = DEFAULT_SECONDS;
    if (audioFile) {
      const candidates = [
        `audio/${audioFile}`,
        `public/audio/${audioFile}`,
        `${process.cwd()}/public/audio/${audioFile}`,
      ];
      for (const candidate of candidates) {
        try {
          seconds = await getAudioDurationInSeconds(candidate);
          break;
        } catch {
          // try next
        }
      }
    }
    // Small pad so the last word is not clipped
    const durationInFrames = Math.max(FPS * 5, Math.ceil((seconds + 0.35) * FPS));
    const sceneStarts = sceneStartsFor(lesson, durationInFrames);
    return {
      durationInFrames,
      props: {
        ...props,
        lesson,
        audioFile,
        sceneStarts,
      },
    };
  };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {LESSONS.map((lesson) => (
        <Composition
          key={lesson.compositionId}
          id={lesson.compositionId}
          component={PolymerLesson}
          durationInFrames={FPS * DEFAULT_SECONDS}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
          defaultProps={{
            lesson,
            audioFile: resolveAudioFile(lesson),
            sceneStarts: sceneStartsFor(lesson, FPS * DEFAULT_SECONDS),
          }}
          calculateMetadata={makeMetadata(lesson)}
        />
      ))}
    </>
  );
};
