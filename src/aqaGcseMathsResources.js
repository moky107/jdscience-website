/* AQA Maths resources: hosted PDFs in /public plus official filestore links. */

const LEVEL = "GCSE/IGCSE";
const ALEVEL = "A-Level";
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

const COMPONENT_BY_ID = Object.fromEntries(COMPONENTS.map((item) => [item.id, item]));

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

// Local PDFs copied into public/resources/aqa/... — use these instead of filestore when present.
const HOSTED_GCSE_FILES = new Set([
  "AQA-83001F-QP-JUN22.PDF",
  "AQA-83001F-QP-JUN25.PDF",
  "AQA-83001F-SQP.PDF",
  "AQA-83001F-MS-JUN23.PDF",
  "AQA-83001F-MS-JUN25.PDF",
  "AQA-83001H-MS-JUN22.PDF",
  "AQA-83001H-MS-JUN23.PDF",
  "AQA-83001H-MS-NOV24.PDF",
  "AQA-83002F-MS-JUN23.PDF",
  "AQA-83002H-MS-JUN23.PDF",
]);

function paperLabel(component) {
  return `Paper ${component.paper} ${component.calc} (${component.tier})`;
}

function item({ level = LEVEL, subject = SUBJECT, category, title, url, seriesLabel, fileName }) {
  const resource = {
    level,
    subject,
    exam_board: BOARD,
    resource_category: category,
    title,
    file_name: fileName,
    series_label: seriesLabel,
  };
  if (url) resource.file_url_override = url;
  return resource;
}

function hostedGcse({ category, componentId, seriesLabel, fileName }) {
  return item({
    category,
    title: paperLabel(COMPONENT_BY_ID[componentId]),
    seriesLabel,
    fileName,
  });
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
    hostedGcse({ category: "Past Questions", componentId: "1F", seriesLabel: "June 2025", fileName: "AQA-83001F-QP-JUN25.PDF" }),
    hostedGcse({ category: "Mark Schemes", componentId: "1F", seriesLabel: "June 2025", fileName: "AQA-83001F-MS-JUN25.PDF" }),
    hostedGcse({ category: "Mark Schemes", componentId: "1H", seriesLabel: "November 2024", fileName: "AQA-83001H-MS-NOV24.PDF" }),
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
          url: HOSTED_GCSE_FILES.has(qpName) ? null : `${BASE}/${series.folder}/${qpName}`,
          seriesLabel,
          fileName: qpName,
        }),
        item({
          category: "Mark Schemes",
          title: label,
          url: HOSTED_GCSE_FILES.has(msName) ? null : `${BASE}/${series.folder}/${msName}`,
          seriesLabel,
          fileName: msName,
        }),
      );
    }
  }

  for (const component of COMPONENTS) {
    const label = paperLabel(component);
    const qpName = `AQA-8300${component.id}-SQP.PDF`;
    const msName = `AQA-8300${component.id}-SMS.PDF`;
    resources.push(
      item({
        category: "Past Questions",
        title: `Sample ${label}`,
        url: HOSTED_GCSE_FILES.has(qpName) ? null : `${SAMPLE_BASE}/${qpName}`,
        seriesLabel: "Sample assessment",
        fileName: qpName,
      }),
      item({
        category: "Mark Schemes",
        title: `Sample ${label}`,
        url: HOSTED_GCSE_FILES.has(msName) ? null : `${SAMPLE_BASE}/${msName}`,
        seriesLabel: "Sample assessment",
        fileName: msName,
      }),
    );
  }

  resources.push(
    item({ category: "Mark Schemes", title: "Paper 1 (Foundation)", seriesLabel: "Statistics · June 2025", fileName: "AQA-83821F-MS-JUN25.PDF" }),
    item({ category: "Mark Schemes", title: "Paper 2 (Foundation)", seriesLabel: "Statistics · June 2025", fileName: "AQA-83822F-MS-JUN25.PDF" }),
    item({ category: "Mark Schemes", title: "Paper 1 (Foundation)", seriesLabel: "Statistics · June 2024", fileName: "AQA-83821F-MS-JUN24.PDF" }),
    item({ category: "Mark Schemes", title: "Paper 2 (Foundation)", seriesLabel: "Statistics · June 2024", fileName: "AQA-83822F-MS-JUN24.PDF" }),
    item({
      level: ALEVEL,
      category: "Past Questions",
      title: "Paper 1",
      seriesLabel: "Core Maths (1350) · June 2023",
      fileName: "AQA-13501-QP-JUN23.PDF",
    }),
    item({
      level: ALEVEL,
      category: "Mark Schemes",
      title: "Paper 1",
      seriesLabel: "Core Maths (1350) · June 2025",
      fileName: "AQA-13501-MS-JUN25.PDF",
    }),
    item({
      level: ALEVEL,
      category: "Mark Schemes",
      title: "Paper 2A Statistical techniques",
      seriesLabel: "Core Maths (1350) · June 2025",
      fileName: "AQA-13502A-MS-JUN25.PDF",
    }),
    item({
      level: ALEVEL,
      category: "Mark Schemes",
      title: "Paper 2C Graphical techniques",
      seriesLabel: "Core Maths (1350) · June 2025",
      fileName: "AQA-13502C-MS-JUN25.PDF",
    }),
  );

  return resources;
}

export const AQA_GCSE_MATHS_RESOURCES = buildAqaGcseMathsResources();
