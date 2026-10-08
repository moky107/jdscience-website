import timingJson from "./data/timing.json";

export type LessonTiming = {
  file: string;
  durationSec: number;
  sceneDurationsSec: number[];
  sceneStartsSec: number[];
};

export const TIMING = timingJson as Record<string, LessonTiming>;

export function timingForLessonId(lessonId: string): LessonTiming | null {
  return TIMING[lessonId] ?? null;
}
