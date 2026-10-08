import { getStaticFiles } from "remotion";
import { Lesson } from "./lessons";

/** List MP3s under public/audio using Remotion static file registry. */
export function listAudioFiles(): string[] {
  try {
    return getStaticFiles()
      .map((f) => f.name)
      .filter((name) => /^audio\/.+\.mp3$/i.test(name))
      .map((name) => name.replace(/^audio\//, ""))
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

/** Resolve which MP3 maps to a lesson (candidate names, then fuzzy, then index). */
export function resolveAudioFile(lesson: Lesson): string | null {
  const files = listAudioFiles();
  if (files.length === 0) return null;

  for (const candidate of lesson.audioCandidates) {
    const hit = files.find((f) => f.toLowerCase() === candidate.toLowerCase());
    if (hit) return hit;
  }

  const keys = lesson.id.split("-").filter((k) => k.length > 2);
  const fuzzy = files.find((f) =>
    keys.some((k) => f.toLowerCase().includes(k.toLowerCase())),
  );
  if (fuzzy) return fuzzy;

  const idx = ["01", "02", "03", "04"].indexOf(lesson.id.slice(0, 2));
  if (idx >= 0 && files[idx]) return files[idx];

  return null;
}
