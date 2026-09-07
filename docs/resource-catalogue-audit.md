# Resource catalogue audit — classification repair

## Root cause

1. **`looksLikeUploadedDeck` + `tidyResourceTitle`** treated any timestamped Supabase storage basename (every admin upload) as a JDScience deck and prefixed display titles with `JDScience …`, including materials that were only *hosted* by JDScience. Storage paths containing `/worksheets/` (the category folder) were also treated as authorship markers.
2. **No level/board inference from verified filename/content signals**, so:
   - Edexcel GCSE Chemistry topic worksheets were uploaded under AQA/OCR/Eduqas and under **A-Level**.
   - T-Level Core Chemistry packs could be mistitled as generic JDScience Science resources; if mis-tagged as GCSE Chemistry they would appear on the wrong page.
3. **GCSE Chemistry topic maps** were applied to A-Level revision titles (e.g. “Topic 3 Redox” → “Chemical changes”).
4. **Upload API** accepted any level/subject/category combo without conflict checks or confirmation.
5. **Duplicate uploads** of identical file bytes across boards inflated the catalogue.

Display-time canonicalisation in `api/_lib/resourceNormalize.js` now corrects level, subject, board, category and titles. Upload validation requires explicit confirmation when classification is uncertain. A production SQL migration is prepared but **must not be applied until you approve** the correction table and proposed deletions.

## What is fixed in code (safe without DB migration)

- T-Level signals force `T-Level` / `Science` (or pathway) and never match GCSE Chemistry page context.
- Edexcel GCSE Chemistry topic filenames force `GCSE/IGCSE` + `Chemistry` + `Edexcel`.
- `JDScience` / `JDScience worksheet` labels only when authorship markers exist (filename/title/series or public `/worksheets/…` library), never from storage path alone.
- Ambiguous uploads fall back to neutral titles / `Resource` and set `needs_review`.
- Admin upload requires `confirm_classification` when automatic classification conflicts.

## Production data

- **Display works without migration** via `canonicalizeResource` / `mergeResourceCatalog`.
- **Migration** `supabase/migrations/20260907_resource_classification_repair.sql` updates metadata for 175 rows (titles/level/board/subject/category). Review before applying.
- **Proposed deletions** (106 duplicate catalogue rows): see `docs/resource-catalogue-proposed-deletions.md`. Not applied. Storage files retained.
- **Shop / bookings / tutors / analytics**: unchanged APIs; shop products not modified.

## Ambiguous — your decision needed

1. **T-Level Core Chemistry decks #370 vs #371** — different file hashes, same topic. #372 is a byte-identical duplicate of #371 (proposed delete). Which deck version stays public?
2. **Stub (~8KB) vs full (~1–2MB) Edexcel GCSE Chemistry worksheets** — stubs #282–#288 vs full worksheets currently under A-Level (#425, #435–#437) that reclassify to GCSE Edexcel. Keep both, or retire stubs?
3. **Cross-board AQA Physics copies** under Edexcel/OCR/Eduqas — proposed deletions list keepers; confirm unpublish.

## Tests

- `scripts/resource-classification-audit.test.mjs` — cross-level contamination, JDScience branding, upload confirmation
- Existing `resourceNormalize`, `resource-upload`, `tlevel-resources`, `eleven-plus`, `copyright-exam-links`
