import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  UNIT1_TITLE,
  productFields,
  publishUnit1SpecialiseCells,
} from "../api/_lib/publishUnit1SpecialiseCells.js";

export { productFields, publishUnit1SpecialiseCells };

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  publishUnit1SpecialiseCells()
    .then((result) => {
      if (result.skipped) {
        console.log(`[shop] skipped publishing "${UNIT1_TITLE}" (${result.reason}).`);
        return;
      }
      if (result.existed) {
        console.log(`[shop] "${UNIT1_TITLE}" is already in the shop.`);
        return;
      }
      console.log(`[shop] published "${result.product.title}" at £${(result.product.price_pence / 100).toFixed(2)} (${result.created ? "created" : "updated"}).`);
    })
    .catch((error) => {
      console.warn(`[shop] publish failed: ${error.message}`);
      process.exitCode = 0;
    });
}
