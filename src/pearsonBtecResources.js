/* Official Pearson BTEC Applied Science (2016) Unit 1 materials.
   Links use Pearson's public library so copyrighted exam papers are not copied.
   Locked or unverified series are omitted; students can open Pearson's own library for the rest. */

const PEARSON = "https://qualifications.pearson.com";
const UNIT1 = `${PEARSON}/content/dam/pdf/BTEC-Nationals/Applied-Science/2016/external-assessment`;
const PAST_PAPERS = `${PEARSON}/en/support/support-topics/exams/past-papers.html?Qualification-Family=BTEC-Nationals`;
const COURSE_MATERIALS = `${PEARSON}/en/qualifications/btec-nationals/applied-science-2016.coursematerials.html`;

function row({ category, title, file, series, url }) {
  return {
    level: "BTEC",
    subject: "Applied Science",
    exam_board: "Pearson",
    resource_category: category,
    title,
    file_name: file,
    series_label: series,
    file_url_override: url,
  };
}

export const PEARSON_BTEC_RESOURCES = [
  row({
    category: "Past Questions",
    title: "Unit 1 Biology (31617H/1B)",
    file: "question-paper-btec-applied-science-31617h-1b-unit-1-jan-2021.pdf",
    series: "January 2021",
    url: `${UNIT1}/question-paper-btec-applied-science-31617h-1b-unit-1-jan-2021.pdf`,
  }),
  row({
    category: "Past Questions",
    title: "Unit 1 Chemistry (31617H/1C)",
    file: "question-paper-btec-applied-science-31617h-1c-unit-1-jan-2021.pdf",
    series: "January 2021",
    url: `${UNIT1}/question-paper-btec-applied-science-31617h-1c-unit-1-jan-2021.pdf`,
  }),
  row({
    category: "Past Questions",
    title: "Unit 1 Physics (31617H/1P)",
    file: "question-paper-btec-applied-science-31617h-1p-unit-1-section-c-jan-2021.pdf",
    series: "January 2021",
    url: `${UNIT1}/question-paper-btec-applied-science-31617h-1p-unit-1-section-c-jan-2021.pdf`,
  }),
  row({
    category: "Past Questions",
    title: "Official Pearson past-paper library",
    file: "pearson-btec-applied-science-past-papers.html",
    series: "Pearson library",
    url: PAST_PAPERS,
  }),
  row({
    category: "Mark Schemes",
    title: "Official Pearson mark schemes",
    file: "pearson-btec-applied-science-mark-schemes.html",
    series: "Pearson library",
    url: COURSE_MATERIALS,
  }),
  row({
    category: "Examiner Reports",
    title: "Official Pearson examiner reports",
    file: "pearson-btec-applied-science-examiner-reports.html",
    series: "Pearson library",
    url: `${COURSE_MATERIALS}#examiner-reports`,
  }),
];
