/* JDScience original BTEC Level 3 Applied Science Unit 8 A.P2 MSK lesson videos.
   Hosted under /resources/btec/applied-science/videos/ and played inline via directVideoSrc. */

const VIDEO_BASE = "/resources/btec/applied-science/videos";
const SERIES = "Unit 8 — Musculoskeletal Disorders (A.P2)";

const MSK_VIDEOS = [
  {
    file: "msk-disorders-01-lesson-route-and-retrieval.mp4",
    title: "MSK Disorders 1 — Lesson Route and Retrieval",
    description: "Unit 8 A.P2 opener: retrieval do-now, lesson route, and the tissue-to-movement success criterion.",
  },
  {
    file: "msk-disorders-02-read-and-encode.mp4",
    title: "MSK Disorders 2 — Read and Encode",
    description: "Purposeful reading into a four-column disorder / tissue / movement / management table.",
  },
  {
    file: "msk-disorders-03-osteoarthritis-model.mp4",
    title: "MSK Disorders 3 — Osteoarthritis Model",
    description: "Teacher model of the structure → function → movement → management explanation chain.",
  },
  {
    file: "msk-disorders-04-tissue-sort.mp4",
    title: "MSK Disorders 4 — Tissue Sort",
    description: "Sort twelve disorders into four primary tissue groups and check the MND placement.",
  },
  {
    file: "msk-disorders-05-case-practice.mp4",
    title: "MSK Disorders 5 — Case Practice",
    description: "Guided cases on osteomyelitis and rickets with the full explanation chain.",
  },
  {
    file: "msk-disorders-06-hinge-question.mp4",
    title: "MSK Disorders 6 — Hinge Question",
    description: "Hinge question on rickets: discriminating fact and elimination of distractors.",
  },
];

export const BTEC_APPLIED_SCIENCE_VIDEOS = MSK_VIDEOS.map((video, index) => ({
  level: "BTEC",
  subject: "Applied Science",
  exam_board: "Pearson",
  resource_category: "Videos",
  title: video.title,
  file_name: video.file,
  file_url_override: `${VIDEO_BASE}/${video.file}`,
  series_label: SERIES,
  description: video.description,
  sort_order: index + 1,
}));
