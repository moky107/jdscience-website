import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const audioDir = path.join(root, "public", "audio");
const outDir = path.join(root, "out");
mkdirSync(outDir, { recursive: true });

const compositions = [
  { id: "PolymersIntro", file: "01-polymers-intro.mp4" },
  { id: "Polyethene", file: "02-polyethene.mp4" },
  { id: "Polypropene", file: "03-polypropene.mp4" },
  { id: "Polyester", file: "04-polyester.mp4" },
];

const mp3s = existsSync(audioDir)
  ? readdirSync(audioDir).filter((f) => /\.mp3$/i.test(f))
  : [];

if (mp3s.length === 0) {
  console.error(
    "ERROR: No MP3 voiceovers found in public/audio/.\n" +
      "Place the four original JD Science narration MP3 files there, then re-run:\n" +
      "  node scripts/probe-audio.mjs && node scripts/render-all.mjs",
  );
  process.exit(2);
}

console.log("Found audio:", mp3s.join(", "));

for (const c of compositions) {
  console.log(`\nRendering ${c.id} → out/${c.file}`);
  const r = spawnSync(
    "npx",
    [
      "remotion",
      "render",
      c.id,
      path.join("out", c.file),
      "--codec=h264",
      "--image-format=jpeg",
      "--jpeg-quality=90",
    ],
    { stdio: "inherit", cwd: root, shell: false },
  );
  if (r.status !== 0) {
    console.error(`Render failed for ${c.id}`);
    process.exit(r.status || 1);
  }
}

console.log("\nDONE — MP4s in out/");
