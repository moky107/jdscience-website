/* JDScience original BTEC Level 3 Applied Science Unit 1 resources.
   Free PDF worksheets and answer sheets live under /resources/btec-level-3/.
   Matching teaching PowerPoints are paid shop products (not listed here). */

export const BTEC_UNIT1_SERIES = "Unit 1 — Principles and Applications of Science I";

export const BTEC_APPLIED_SCIENCE_TOPICS = [
  {
    slug: "cell-ultrastructure",
    title: "Cell Ultrastructure",
    shopSlug: "btec-level-3-cell-ultrastructure-powerpoint",
    shopTitle: "JDScience BTEC Level 3 Cell Ultrastructure Teaching PowerPoint",
  },
  {
    slug: "chemical-calculations",
    title: "Chemical Calculations",
    shopSlug: "btec-level-3-chemical-calculations-powerpoint",
    shopTitle: "JDScience BTEC Level 3 Chemical Calculations Teaching PowerPoint",
  },
  {
    slug: "structure-and-bonding",
    title: "Structure and Bonding",
    shopSlug: "btec-level-3-structure-and-bonding-powerpoint",
    shopTitle: "JDScience BTEC Level 3 Structure and Bonding Teaching PowerPoint",
  },
  {
    slug: "waves-in-communication",
    title: "Waves in Communication",
    shopSlug: "btec-level-3-waves-in-communication-powerpoint",
    shopTitle: "JDScience BTEC Level 3 Waves in Communication Teaching PowerPoint",
  },
];

const BASE = "/resources/btec-level-3/applied-science/unit-1";

function worksheet({ topic, title, file }) {
  return {
    level: "BTEC",
    subject: "Applied Science",
    exam_board: "Pearson",
    resource_category: "Worksheets",
    title,
    file_name: file,
    file_url_override: `${BASE}/worksheets/${file}`,
    series_label: BTEC_UNIT1_SERIES,
    topic_slug: topic,
    description: `Original JDScience BTEC Level 3 Applied Science worksheet on ${title.replace(/ Worksheet$/, "")}.`,
  };
}

function answerSheet({ topic, title, file }) {
  return {
    level: "BTEC",
    subject: "Applied Science",
    exam_board: "Pearson",
    resource_category: "Mark Schemes",
    title,
    file_name: file,
    file_url_override: `${BASE}/answer-sheets/${file}`,
    series_label: BTEC_UNIT1_SERIES,
    topic_slug: topic,
    description: `Answer sheet for the JDScience BTEC Level 3 ${title.replace(/ Answer Sheet$/, "")} worksheet.`,
  };
}

export const BTEC_APPLIED_SCIENCE_RESOURCES = [
  worksheet({
    topic: "chemical-calculations",
    title: "Chemical Calculations Worksheet",
    file: "JDScience_BTEC_Level_3_Chemical_Calculations_Worksheet.pdf",
  }),
  answerSheet({
    topic: "chemical-calculations",
    title: "Chemical Calculations Answer Sheet",
    file: "JDScience_BTEC_Level_3_Chemical_Calculations_Answer_Sheet.pdf",
  }),
  worksheet({
    topic: "structure-and-bonding",
    title: "Structure and Bonding Worksheet",
    file: "JDScience_BTEC_Level_3_Structure_and_Bonding_Worksheet.pdf",
  }),
  answerSheet({
    topic: "structure-and-bonding",
    title: "Structure and Bonding Answer Sheet",
    file: "JDScience_BTEC_Level_3_Structure_and_Bonding_Answer_Sheet.pdf",
  }),
  worksheet({
    topic: "waves-in-communication",
    title: "Waves in Communication Worksheet",
    file: "JDScience_BTEC_Level_3_Waves_in_Communication_Worksheet.pdf",
  }),
  answerSheet({
    topic: "waves-in-communication",
    title: "Waves in Communication Answer Sheet",
    file: "JDScience_BTEC_Level_3_Waves_in_Communication_Answer_Sheet.pdf",
  }),
];
