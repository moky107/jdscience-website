# Production catalogue apply report

Applied on 2026-09-07T20:32:34.141Z against live Supabase. **Storage files were not deleted.**

## Decisions on ambiguous cases

### 1. T-Level decks #370 / #371 / #372
Inspected both PPTX packages:
- Same slide count (25), same notes (25), same media (30 files / 11.6 MB)
- Identical slide XML hash and media hash
- Identical slide headings and topic coverage (A10–A15)
- **Only difference:** `docProps/core.xml` metadata

**Decision:** Keep **#370**. Unpublish **#371** (packaging duplicate) and **#372** (byte-identical to #371).

### 2. Stub worksheets #282–#288
Full worksheets download OK for topics 1/3/4/5 (#425, #437, #436, #435).
- **Unpublished stubs with full replacements:** #285 (Topic 5), #286 (Topic 4), #287 (Topic 3)
- **Kept stubs (no full replacement):** #282 (Topic 9), #283 (Topic 7), #284 (Topic 6), #288 (Topic 2) — retitled accurately after first-page inspection

### 3. Cross-board AQA Physics copies
Unpublished only byte-identical copies filed under the wrong board. AQA keepers (#70–#74, worksheet keepers, etc.) remain published and downloadable.

## Changed metadata record IDs (67)

56, 57, 58, 59, 60, 61, 62, 63, 64, 70, 71, 72, 73, 74, 91, 92, 93, 94, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 128, 132, 139, 140, 141, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 288, 370, 373, 387, 388, 389, 395, 397, 398, 399, 400, 401, 419, 420, 421, 422, 423, 425, 435, 436, 437

## Unpublished catalogue record IDs (110)

75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 95, 98, 99, 100, 101, 104, 105, 106, 107, 120, 121, 122, 123, 124, 125, 126, 127, 129, 130, 131, 133, 134, 135, 136, 137, 138, 142, 143, 144, 145, 146, 147, 148, 149, 150, 285, 286, 287, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 371, 372, 392, 393, 394, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 413, 414, 415, 416, 417, 424, 426, 427, 428, 429, 430, 431, 432, 433, 434, 461, 465

## Live URLs
- Production site (DB live; code pending merge): https://www.jdscience.co.uk/
- PR preview (new classification code): https://jdscience-website-git-cursor-res-abdded-jd943791-1022s-projects.vercel.app
- PR: https://github.com/moky107/jdscience-website/pull/93
