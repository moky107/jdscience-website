import { existsSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const audioDir = path.join(process.cwd(), "public", "audio");
const out = path.join(process.cwd(), "public", "audio", "manifest.json");

if (!existsSync(audioDir)) {
  console.error("Missing public/audio");
  process.exit(1);
}

const files = readdirSync(audioDir).filter((f) => /\.mp3$/i.test(f));
const entries = files.map((file) => {
  const full = path.join(audioDir, file);
  let duration = null;
  try {
    duration = Number(
      execFileSync(
        "ffprobe",
        ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", full],
        { encoding: "utf8" },
      ).trim(),
    );
  } catch {
    duration = null;
  }
  return { file, duration };
});

writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), entries }, null, 2));
console.log(JSON.stringify(entries, null, 2));
if (entries.length === 0) {
  console.error("No MP3 files found in public/audio");
  process.exit(2);
}
