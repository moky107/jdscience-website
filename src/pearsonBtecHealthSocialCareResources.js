/* Official Pearson BTEC Nationals Health and Social Care (2016) links.
   Original JDScience practice papers are listed separately and hosted on JD Science.
   Copyrighted Pearson exam papers are not copied into JD Science storage. */

const PEARSON = "https://qualifications.pearson.com";
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

export const PEARSON_BTEC_HSC_RESOURCES = [
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
  row({
    category: "Specifications",
    title: "BTEC National Extended Certificate in Health and Social Care",
    file: "9781446938003-btec-nat-excert-hsc-ag-spec-iss3c.pdf",
    series: "2016 specification",
    url: `${SPECS}/9781446938003-btec-nat-excert-hsc-ag-spec-iss3c.pdf`,
    attribution: "Open Pearson PDF",
  }),
  row({
    category: "Specifications",
    title: "BTEC National Diploma in Health and Social Care",
    file: "9781446950937_BTEC_Nat_Dip_HSC_AG_Spec_ISS10_150622.pdf",
    series: "2016 specification",
    url: `${SPECS}/9781446950937_BTEC_Nat_Dip_HSC_AG_Spec_ISS10_150622.pdf`,
    attribution: "Open Pearson PDF",
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
