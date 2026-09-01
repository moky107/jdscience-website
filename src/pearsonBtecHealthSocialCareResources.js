/* Official Pearson BTEC Nationals Health and Social Care (2016) exam materials.
   Only public Pearson URLs are listed so a student click opens a real file or library.
   Copyrighted papers are not copied into JD Science storage. */

const PEARSON = "https://qualifications.pearson.com";
const EXTERNAL = `${PEARSON}/content/dam/pdf/BTEC-Nationals/Health-and-Social-Care/2016/External-assessments`;
const SPECS = `${PEARSON}/content/dam/pdf/BTEC-Nationals/Health-and-Social-Care/2016/specification-and-sample-assessments`;
const PAST_PAPERS = `${PEARSON}/en/support/support-topics/exams/past-papers.html?Qualification-Family=BTEC-Nationals`;
const COURSE = `${PEARSON}/en/qualifications/btec-nationals/health-and-social-care-2016.html`;

function row({ category, title, file, series, url, attribution }) {
  return {
    level: "BTEC",
    subject: "Health and Social Care",
    exam_board: "Pearson",
    resource_category: category,
    title,
    file_name: file,
    series_label: series,
    file_url_override: url,
    source_attribution: attribution,
  };
}

function pearsonPdf({ category, title, file, series, folder, attribution = "Open Pearson PDF" }) {
  return row({
    category,
    title,
    file,
    series,
    url: `${folder}/${file}`,
    attribution,
  });
}

export const PEARSON_BTEC_HSC_RESOURCES = [
  pearsonPdf({
    category: "Past Questions",
    title: "Unit 1: Human Lifespan Development",
    file: "31490h-unit1-que-2022.pdf",
    series: "January 2022",
    folder: EXTERNAL,
  }),
  pearsonPdf({
    category: "Past Questions",
    title: "Unit 2: Working in Health and Social Care",
    file: "31491h-unit2-que-202201.pdf",
    series: "January 2022",
    folder: EXTERNAL,
  }),
  row({
    category: "Past Questions",
    title: "Official Pearson past-paper library",
    file: "pearson-btec-health-and-social-care-past-papers.html",
    series: "Pearson library",
    url: PAST_PAPERS,
    attribution: "Open Pearson library",
  }),
  row({
    category: "Mark Schemes",
    title: "Official Pearson mark schemes",
    file: "pearson-btec-health-and-social-care-mark-schemes.html",
    series: "Pearson library",
    url: PAST_PAPERS,
    attribution: "Open Pearson library",
  }),
  row({
    category: "Examiner Reports",
    title: "Official Pearson examiner reports",
    file: "pearson-btec-health-and-social-care-examiner-reports.html",
    series: "Pearson library",
    url: PAST_PAPERS,
    attribution: "Open Pearson library",
  }),
  pearsonPdf({
    category: "Specifications",
    title: "BTEC National Extended Certificate in Health and Social Care",
    file: "9781446938003-btec-nat-excert-hsc-ag-spec-iss3c.pdf",
    series: "2016 specification",
    folder: SPECS,
  }),
  pearsonPdf({
    category: "Specifications",
    title: "BTEC National Diploma in Health and Social Care",
    file: "9781446950937_BTEC_Nat_Dip_HSC_AG_Spec_ISS10_150622.pdf",
    series: "2016 specification",
    folder: SPECS,
  }),
  row({
    category: "Specifications",
    title: "Pearson Health and Social Care (2016) course page",
    file: "pearson-btec-health-and-social-care-2016.html",
    series: "Pearson library",
    url: COURSE,
    attribution: "Open Pearson library",
  }),
];
