/* Original JDScience BTEC Health and Social Care exam-style practice.
   Hosted PDFs live under /resources/btec-level-3/health-and-social-care/.
   These are not official Pearson papers. */

const BASE = "/resources/btec-level-3/health-and-social-care";
export const JD_SCIENCE_HSC_SERIES = "JDScience original practice";

function row({ category, title, file, unit }) {
  return {
    level: "BTEC",
    subject: "Health and Social Care",
    exam_board: "Pearson",
    resource_category: category,
    title,
    file_name: file,
    series_label: unit,
    file_url_override: `${BASE}/${file}`,
    description: category === "Mark Schemes"
      ? "Original JDScience mark scheme. Indicative content for the matching practice paper."
      : "Original JDScience exam-style practice paper. Not an official Pearson past paper.",
  };
}

export const JD_SCIENCE_HSC_RESOURCES = [
  row({
    category: "Past Questions",
    title: "Unit 1 Human Lifespan Development — Practice Set A",
    file: "JDScience_BTEC_HSC_Unit1_Practice_Set_A.pdf",
    unit: "Unit 1 practice",
  }),
  row({
    category: "Mark Schemes",
    title: "Unit 1 Human Lifespan Development — Set A mark scheme",
    file: "JDScience_BTEC_HSC_Unit1_Practice_Set_A_Mark_Scheme.pdf",
    unit: "Unit 1 practice",
  }),
  row({
    category: "Past Questions",
    title: "Unit 1 Human Lifespan Development — Practice Set B",
    file: "JDScience_BTEC_HSC_Unit1_Practice_Set_B.pdf",
    unit: "Unit 1 practice",
  }),
  row({
    category: "Mark Schemes",
    title: "Unit 1 Human Lifespan Development — Set B mark scheme",
    file: "JDScience_BTEC_HSC_Unit1_Practice_Set_B_Mark_Scheme.pdf",
    unit: "Unit 1 practice",
  }),
  row({
    category: "Past Questions",
    title: "Unit 1 Human Lifespan Development — Practice Set C",
    file: "JDScience_BTEC_HSC_Unit1_Practice_Set_C.pdf",
    unit: "Unit 1 practice",
  }),
  row({
    category: "Mark Schemes",
    title: "Unit 1 Human Lifespan Development — Set C mark scheme",
    file: "JDScience_BTEC_HSC_Unit1_Practice_Set_C_Mark_Scheme.pdf",
    unit: "Unit 1 practice",
  }),
  row({
    category: "Past Questions",
    title: "Unit 2 Working in Health and Social Care — Practice Set A",
    file: "JDScience_BTEC_HSC_Unit2_Practice_Set_A.pdf",
    unit: "Unit 2 practice",
  }),
  row({
    category: "Mark Schemes",
    title: "Unit 2 Working in Health and Social Care — Set A mark scheme",
    file: "JDScience_BTEC_HSC_Unit2_Practice_Set_A_Mark_Scheme.pdf",
    unit: "Unit 2 practice",
  }),
  row({
    category: "Past Questions",
    title: "Unit 2 Working in Health and Social Care — Practice Set B",
    file: "JDScience_BTEC_HSC_Unit2_Practice_Set_B.pdf",
    unit: "Unit 2 practice",
  }),
  row({
    category: "Mark Schemes",
    title: "Unit 2 Working in Health and Social Care — Set B mark scheme",
    file: "JDScience_BTEC_HSC_Unit2_Practice_Set_B_Mark_Scheme.pdf",
    unit: "Unit 2 practice",
  }),
  row({
    category: "Past Questions",
    title: "Unit 2 Working in Health and Social Care — Practice Set C",
    file: "JDScience_BTEC_HSC_Unit2_Practice_Set_C.pdf",
    unit: "Unit 2 practice",
  }),
  row({
    category: "Mark Schemes",
    title: "Unit 2 Working in Health and Social Care — Set C mark scheme",
    file: "JDScience_BTEC_HSC_Unit2_Practice_Set_C_Mark_Scheme.pdf",
    unit: "Unit 2 practice",
  }),
];
