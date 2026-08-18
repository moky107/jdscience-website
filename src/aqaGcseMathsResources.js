/* Official AQA GCSE Mathematics (8300) papers hosted on filestore.aqa.org.uk.
   Question papers appear under Past Questions; mark schemes under Mark Schemes. */

const LEVEL = "GCSE/IGCSE";
const SUBJECT = "Maths";
const BOARD = "AQA";
const BASE = "https://filestore.aqa.org.uk/sample-papers-and-mark-schemes";
const SAMPLE_BASE = "https://filestore.aqa.org.uk/resources/mathematics";

const COMPONENTS = [
  { id: "1F", paper: "1", tier: "Foundation", calc: "Non-Calculator" },
  { id: "1H", paper: "1", tier: "Higher", calc: "Non-Calculator" },
  { id: "2F", paper: "2", tier: "Foundation", calc: "Calculator" },
  { id: "2H", paper: "2", tier: "Higher", calc: "Calculator" },
  { id: "3F", paper: "3", tier: "Foundation", calc: "Calculator" },
  { id: "3H", paper: "3", tier: "Higher", calc: "Calculator" },
];

// msPrefix is the AQA filename token: older series use W-MS, 2021+ use MS.
const SERIES = [
  { year: 2023, season: "June", folder: "2023/june", code: "JUN23", msPrefix: "MS" },
  { year: 2022, season: "November", folder: "2022/november", code: "NOV22", msPrefix: "MS" },
  { year: 2022, season: "June", folder: "2022/june", code: "JUN22", msPrefix: "MS" },
  { year: 2021, season: "November", folder: "2021/november", code: "NOV21", msPrefix: "MS" },
  { year: 2020, season: "November", folder: "2020/november", code: "NOV20", msPrefix: "W-MS" },
  { year: 2019, season: "November", folder: "2019/november", code: "NOV19", msPrefix: "W-MS" },
  { year: 2019, season: "June", folder: "2019/june", code: "JUN19", msPrefix: "W-MS" },
  { year: 2018, season: "November", folder: "2018/november", code: "NOV18", msPrefix: "W-MS" },
  { year: 2018, season: "June", folder: "2018/june", code: "JUN18", msPrefix: "W-MS" },
  { year: 2017, season: "November", folder: "2017/november", code: "NOV17", msPrefix: "W-MS" },
  { year: 2017, season: "June", folder: "2017/june", code: "JUN17", msPrefix: "W-MS" },
];

function paperLabel(component) {
  return `Paper ${component.paper} ${component.calc} (${component.tier})`;
}

function item({ category, title, url, seriesLabel, fileName }) {
  return {
    level: LEVEL,
    subject: SUBJECT,
    exam_board: BOARD,
    resource_category: category,
    title,
    file_name: fileName,
    file_url_override: url,
    series_label: seriesLabel,
  };
}

function buildAqaGcseMathsResources() {
  const resources = [
    item({
      category: "Specifications",
      title: "AQA GCSE Mathematics Specification (8300)",
      url: `${SAMPLE_BASE}/specifications/AQA-8300-SP-2015.PDF`,
      seriesLabel: "Specification",
      fileName: "AQA-8300-SP-2015.PDF",
    }),
  ];

  for (const series of SERIES) {
    const seriesLabel = `${series.season} ${series.year}`;
    for (const component of COMPONENTS) {
      const label = paperLabel(component);
      const qpName = `AQA-8300${component.id}-QP-${series.code}.PDF`;
      const msName = `AQA-8300${component.id}-${series.msPrefix}-${series.code}.PDF`;
      resources.push(
        item({
          category: "Past Questions",
          title: label,
          url: `${BASE}/${series.folder}/${qpName}`,
          seriesLabel,
          fileName: qpName,
        }),
        item({
          category: "Mark Schemes",
          title: label,
          url: `${BASE}/${series.folder}/${msName}`,
          seriesLabel,
          fileName: msName,
        }),
      );
    }
  }

  for (const component of COMPONENTS) {
    const label = paperLabel(component);
    resources.push(
      item({
        category: "Past Questions",
        title: `Sample ${label}`,
        url: `${SAMPLE_BASE}/AQA-8300${component.id}-SQP.PDF`,
        seriesLabel: "Sample assessment",
        fileName: `AQA-8300${component.id}-SQP.PDF`,
      }),
      item({
        category: "Mark Schemes",
        title: `Sample ${label}`,
        url: `${SAMPLE_BASE}/AQA-8300${component.id}-SMS.PDF`,
        seriesLabel: "Sample assessment",
        fileName: `AQA-8300${component.id}-SMS.PDF`,
      }),
    );
  }

  return resources;
}

export const AQA_GCSE_MATHS_RESOURCES = buildAqaGcseMathsResources();
