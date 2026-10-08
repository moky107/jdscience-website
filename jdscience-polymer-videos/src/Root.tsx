import React from "react";
import { Composition, CalculateMetadataFunction } from "remotion";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { resolveAudioFile } from "./audioMap";
import { LESSONS, Lesson } from "./lessons";
import { PolymerLesson, PolymerLessonProps } from "./PolymerLesson";
import { timingForLessonId } from "./timing";
import { FPS, HEIGHT, WIDTH } from "./theme";

const DEFAULT_SECONDS = 60;

function sceneStartsFromWeights(lesson: Lesson, totalFrames: number): number[] {
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

function sceneStartsFromTiming(startsSec: number[], fps: number): number[] {
  return startsSec.map((s) => Math.round(s * fps));
}

const makeMetadata =
  (lesson: Lesson): CalculateMetadataFunction<PolymerLessonProps> =>
  async ({ props }) => {
    const timing = timingForLessonId(lesson.id);
    const audioFile =
      props.audioFile ?? timing?.file ?? resolveAudioFile(lesson);

    let seconds = timing?.durationSec ?? DEFAULT_SECONDS;
    if (!timing && audioFile) {
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

    const durationInFrames = Math.max(
      FPS * 5,
      Math.ceil((seconds + 0.35) * FPS),
    );

    const sceneStarts =
      timing && timing.sceneStartsSec.length === lesson.scenes.length
        ? sceneStartsFromTiming(timing.sceneStartsSec, FPS)
        : sceneStartsFromWeights(lesson, durationInFrames);

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
      {LESSONS.map((lesson) => {
        const timing = timingForLessonId(lesson.id);
        const audioFile = timing?.file ?? resolveAudioFile(lesson);
        const durationInFrames = Math.ceil(
          ((timing?.durationSec ?? DEFAULT_SECONDS) + 0.35) * FPS,
        );
        const sceneStarts =
          timing && timing.sceneStartsSec.length === lesson.scenes.length
            ? sceneStartsFromTiming(timing.sceneStartsSec, FPS)
            : sceneStartsFromWeights(lesson, durationInFrames);

        return (
          <Composition
            key={lesson.compositionId}
            id={lesson.compositionId}
            component={PolymerLesson}
            durationInFrames={durationInFrames}
            fps={FPS}
            width={WIDTH}
            height={HEIGHT}
            defaultProps={{
              lesson,
              audioFile,
              sceneStarts,
            }}
            calculateMetadata={makeMetadata(lesson)}
          />
        );
      })}
    </>
  );
};
