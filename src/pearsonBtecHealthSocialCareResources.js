/* Official Pearson BTEC Nationals Health and Social Care (2016) exam materials.
   Inventory matches the shared Health and Social Care / Past questions folder.
   Copyrighted papers are linked on Pearson's site, not copied into JD Science storage. */

const PEARSON = "https://qualifications.pearson.com";
const EXTERNAL = `${PEARSON}/content/dam/pdf/BTEC-Nationals/Health-and-Social-Care/2016/External-assessments`;
const COURSE_MATERIALS = `${PEARSON}/en/qualifications/btec-nationals/health-and-social-care-2016.coursematerials.html`;
const PAST_PAPERS = `${PEARSON}/en/support/support-topics/exams/past-papers.html?Qualification-Family=BTEC-Nationals&Qualification-Subject=Health+and+Social+Care+%282016%29&Specification-Code=Pearson-UK%3ASpecification-Code%2Fnat16-hsc&Status=Pearson-UK%3AStatus%2FLive`;

const UNITS = {
  "31490H": "Unit 1: Human Lifespan Development",
  "31491H": "Unit 2: Working in Health and Social Care",
};

function seriesSearch(examSeries) {
  return `${PAST_PAPERS}&Exam-Series=${encodeURIComponent(examSeries)}`;
}

function row({ category, code, title, file, series, url }) {
  return {
    level: "BTEC",
    subject: "Health and Social Care",
    exam_board: "Pearson",
    resource_category: category,
    title,
    file_name: file,
    series_label: series,
    file_url_override: url,
  };
}

function paper({ code, series, examSeries, file, url }) {
  return row({
    category: "Past Questions",
    code,
    title: UNITS[code] || code,
    file,
    series,
    url: url || seriesSearch(examSeries),
  });
}

function markScheme({ code, series, examSeries, file, url }) {
  return row({
    category: "Mark Schemes",
    code,
    title: `${UNITS[code] || code} mark scheme`,
    file,
    series,
    url: url || seriesSearch(examSeries),
  });
}

export const PEARSON_BTEC_HSC_RESOURCES = [
  paper({
    code: "31490H",
    series: "January 2022",
    examSeries: "January-2022",
    file: "31490h-unit1-que-2022.pdf",
    url: `${EXTERNAL}/31490h-unit1-que-2022.pdf`,
  }),
  paper({
    code: "31491H",
    series: "January 2022",
    examSeries: "January-2022",
    file: "31491h-unit2-que-202201.pdf",
    url: `${EXTERNAL}/31491h-unit2-que-202201.pdf`,
  }),
  paper({ code: "31490H", series: "January 2019", examSeries: "January-2019", file: "31490H_0119_QU.pdf" }),
  paper({ code: "31490H", series: "June 2018", examSeries: "June-2018", file: "31490H_0618_QU.pdf" }),
  paper({ code: "31490H", series: "June 2022", examSeries: "June-2022", file: "31490H_0622_QU.pdf" }),
  paper({ code: "31490H", series: "June 2025", examSeries: "June-2025", file: "31490H_0625_QU.pdf" }),
  paper({ code: "31490H", series: "January 2026", examSeries: "January-2026", file: "31490H_0126_QU.pdf" }),
  paper({ code: "31491H", series: "June 2017", examSeries: "June-2017", file: "31491H_0617_QU.pdf" }),
  paper({ code: "31491H", series: "June 2018", examSeries: "June-2018", file: "31491H_0618_QU.pdf" }),
  paper({ code: "31491H", series: "June 2019", examSeries: "June-2019", file: "31491H_0619_QU.pdf" }),
  paper({ code: "31491H", series: "June 2022", examSeries: "June-2022", file: "31491H_0622_QU.pdf" }),
  paper({ code: "31491H", series: "January 2023", examSeries: "January-2023", file: "31491H_0123_QU.pdf" }),
  paper({ code: "31491H", series: "June 2023", examSeries: "June-2023", file: "31491H_0623_QU.pdf" }),
  paper({ code: "31491H", series: "June 2024", examSeries: "June-2024", file: "31491H_0624_QU.pdf" }),
  paper({ code: "31491H", series: "June 2025", examSeries: "June-2025", file: "31491H_0625_QU.pdf" }),
  paper({ code: "31491H", series: "January 2026", examSeries: "January-2026", file: "31491H_0126_QU.pdf" }),
  paper({
    code: "31491H",
    series: "Sample assessment",
    examSeries: "Sample-Assessment-Materials",
    file: "31491_EAM_QU.pdf",
    url: `${COURSE_MATERIALS}#filterQuery=category:Pearson-UK:Category%2FExternal-assessments`,
  }),

  markScheme({ code: "31490H", series: "January 2022", examSeries: "January-2022", file: "31490H_0122_MS.pdf" }),
  markScheme({ code: "31490H", series: "June 2018", examSeries: "June-2018", file: "31490H_0618_MS.pdf" }),
  markScheme({ code: "31490H", series: "June 2022", examSeries: "June-2022", file: "31490H_0622_MS.pdf" }),
  markScheme({ code: "31490H", series: "June 2025", examSeries: "June-2025", file: "31490H_0625_MS.pdf" }),
  markScheme({ code: "31490H", series: "January 2026", examSeries: "January-2026", file: "31490H_0126_MS.pdf" }),
  markScheme({ code: "31491H", series: "June 2017", examSeries: "June-2017", file: "31491H_0617_MS.pdf" }),
  markScheme({ code: "31491H", series: "June 2018", examSeries: "June-2018", file: "31491H_0618_MS.pdf" }),
  markScheme({ code: "31491H", series: "June 2019", examSeries: "June-2019", file: "31491H_0619_MS.pdf" }),
  markScheme({ code: "31491H", series: "June 2022", examSeries: "June-2022", file: "31491H_0622_MS.pdf" }),
  markScheme({ code: "31491H", series: "January 2023", examSeries: "January-2023", file: "31491H_0123_MS.pdf" }),
  markScheme({ code: "31491H", series: "June 2023", examSeries: "June-2023", file: "31491H_0623_MS.pdf" }),
  markScheme({ code: "31491H", series: "June 2024", examSeries: "June-2024", file: "31491H_0624_MS.pdf" }),
  markScheme({ code: "31491H", series: "June 2025", examSeries: "June-2025", file: "31491H_0625_MS.pdf" }),
  markScheme({ code: "31491H", series: "January 2026", examSeries: "January-2026", file: "31491H_0126_MS.pdf" }),
  markScheme({
    code: "31491H",
    series: "Sample assessment",
    examSeries: "Sample-Assessment-Materials",
    file: "31491_EAM_MS.pdf",
    url: `${COURSE_MATERIALS}#filterQuery=category:Pearson-UK:Category%2FSample-assessment-materials`,
  }),

  row({
    category: "Past Questions",
    title: "Official Pearson past-paper library",
    file: "pearson-btec-health-and-social-care-past-papers.html",
    series: "Pearson library",
    url: PAST_PAPERS,
  }),
  row({
    category: "Mark Schemes",
    title: "Official Pearson mark schemes",
    file: "pearson-btec-health-and-social-care-mark-schemes.html",
    series: "Pearson library",
    url: `${COURSE_MATERIALS}#filterQuery=category:Pearson-UK:Category%2FMark-schemes`,
  }),
  row({
    category: "Examiner Reports",
    title: "Official Pearson examiner reports",
    file: "pearson-btec-health-and-social-care-examiner-reports.html",
    series: "Pearson library",
    url: `${COURSE_MATERIALS}#filterQuery=category:Pearson-UK:Category%2FExaminer-reports`,
  }),
];
