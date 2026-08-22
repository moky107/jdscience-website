/* Official AQA A-Level Chemistry (7405) papers, mark schemes and related PDFs.
   Links use AQA's public filestore so copyrighted exam material is not copied into the repo. */

const LEVEL = "A-Level";
const SUBJECT = "Chemistry";
const BOARD = "AQA";
const FILESTORE = "https://filestore.aqa.org.uk";
const SAMPLE_BASE = `${FILESTORE}/sample-papers-and-mark-schemes`;
const RESOURCE_BASE = `${FILESTORE}/resources/chemistry`;

const PAPERS = [
  { id: "74051", title: "Paper 1 Inorganic and Physical Chemistry (7405/1)" },
  { id: "74052", title: "Paper 2 Organic and Physical Chemistry (7405/2)" },
  { id: "74053", title: "Paper 3 (7405/3)" },
];

// msPrefix follows AQA filenames: W-MS through Nov 2020, MS from Nov 2021.
const SERIES = [
  { year: 2023, season: "June", folder: "2023/june", code: "JUN23", msPrefix: "MS" },
  { year: 2022, season: "June", folder: "2022/june", code: "JUN22", msPrefix: "MS" },
  { year: 2021, season: "November", folder: "2021/november", code: "NOV21", msPrefix: "MS" },
  { year: 2020, season: "November", folder: "2020/november", code: "NOV20", msPrefix: "W-MS" },
  { year: 2019, season: "June", folder: "2019/june", code: "JUN19", msPrefix: "W-MS" },
  { year: 2018, season: "June", folder: "2018/june", code: "JUN18", msPrefix: "W-MS" },
  { year: 2017, season: "June", folder: "2017/june", code: "JUN17", msPrefix: "W-MS" },
];

function item({ category, title, url, seriesLabel, fileName }) {
  return {
    level: LEVEL,
    subject: SUBJECT,
    exam_board: BOARD,
    resource_category: category,
    title,
    file_name: fileName,
    series_label: seriesLabel,
    file_url_override: url,
  };
}

function buildAqaAlevelChemistryResources() {
  const resources = [
    item({
      category: "Specifications",
      title: "AQA AS and A-level Chemistry Specification (7404 / 7405)",
      url: `${RESOURCE_BASE}/specifications/AQA-7404-7405-SP-2015.PDF`,
      seriesLabel: "Specification",
      fileName: "AQA-7404-7405-SP-2015.PDF",
    }),
  ];

  for (const series of SERIES) {
    const seriesLabel = `${series.season} ${series.year}`;
    const folderUrl = `${SAMPLE_BASE}/${series.folder}`;
    for (const paper of PAPERS) {
      const qpName = `AQA-${paper.id}-QP-${series.code}.PDF`;
      const msName = `AQA-${paper.id}-${series.msPrefix}-${series.code}.PDF`;
      const insName = `AQA-${paper.id}-INS-${series.code}.PDF`;
      const erName = `AQA-${paper.id}-WRE-${series.code}.PDF`;
      resources.push(
        item({
          category: "Past Questions",
          title: paper.title,
          url: `${folderUrl}/${qpName}`,
          seriesLabel,
          fileName: qpName,
        }),
        item({
          category: "Past Questions",
          title: `${paper.title} — data booklet`,
          url: `${folderUrl}/${insName}`,
          seriesLabel,
          fileName: insName,
        }),
        item({
          category: "Mark Schemes",
          title: paper.title,
          url: `${folderUrl}/${msName}`,
          seriesLabel,
          fileName: msName,
        }),
        item({
          category: "Examiner Reports",
          title: paper.title,
          url: `${folderUrl}/${erName}`,
          seriesLabel,
          fileName: erName,
        }),
      );
    }
  }

  for (const paper of PAPERS) {
    const qpName = `AQA-${paper.id}-SQP.PDF`;
    const msName = `AQA-${paper.id}-SMS.PDF`;
    resources.push(
      item({
        category: "Past Questions",
        title: `Sample ${paper.title}`,
        url: `${RESOURCE_BASE}/${qpName}`,
        seriesLabel: "Sample assessment",
        fileName: qpName,
      }),
      item({
        category: "Mark Schemes",
        title: `Sample ${paper.title}`,
        url: `${RESOURCE_BASE}/${msName}`,
        seriesLabel: "Sample assessment",
        fileName: msName,
      }),
    );
  }

  return resources;
}

export const AQA_ALEVEL_CHEMISTRY_RESOURCES = buildAqaAlevelChemistryResources();
