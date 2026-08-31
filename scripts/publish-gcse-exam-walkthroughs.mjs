#!/usr/bin/env node
import { publishGcseExamWalkthroughs } from "../api/_lib/publishGcseExamWalkthroughs.js";

export { publishGcseExamWalkthroughs };

const dryRun = process.argv.includes("--dry-run");

publishGcseExamWalkthroughs({ dryRun })
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok && !result.dryRun) process.exitCode = 1;
  })
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
