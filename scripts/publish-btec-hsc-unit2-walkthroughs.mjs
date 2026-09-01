#!/usr/bin/env node
import { publishBtecHscUnit2Walkthroughs } from "../api/_lib/publishBtecHscUnit2Walkthroughs.js";

export { publishBtecHscUnit2Walkthroughs };

const dryRun = process.argv.includes("--dry-run");

publishBtecHscUnit2Walkthroughs({ dryRun })
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok && !result.dryRun) process.exitCode = 1;
  })
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
