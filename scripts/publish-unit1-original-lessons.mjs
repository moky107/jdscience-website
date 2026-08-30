import path from "node:path";
import { fileURLToPath } from "node:url";
import { publishUnit1OriginalLessons } from "../api/_lib/publishUnit1OriginalLessons.js";
import { unit1ProductSpecs } from "../api/_lib/unit1OriginalLessonCatalog.js";

export { publishUnit1OriginalLessons, unit1ProductSpecs };

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const dryRun = process.argv.includes("--dry-run");
  publishUnit1OriginalLessons({ dryRun })
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      if (!result.ok) {
        process.exitCode = result.reason === "missing_shop_credentials" ? 2 : 1;
      }
    })
    .catch((error) => {
      console.error(`[shop] Unit 1 original lesson publish failed: ${error.message}`);
      process.exitCode = 1;
    });
}
