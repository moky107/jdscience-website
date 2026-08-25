/* Official NCFE and Pearson T-Level Science materials.
   SharePoint folders are mapped to the matching subject page; files are linked
   from the awarding-body libraries rather than copied. Portal-locked series
   (no public /media/ URL) are omitted. Titles never start with a number. */

const NCFE = "https://www.ncfe.org.uk/media";
const PEARSON = "https://qualifications.pearson.com/content/dam/pdf";

function ncfe(hash, file) {
  return `${NCFE}/${hash}/${file}`;
}

function row({
  subject,
  board = "NCFE",
  category,
  title,
  file,
  series,
  url,
}) {
  return {
    level: "T-Level",
    subject,
    exam_board: board,
    resource_category: category,
    title,
    file_name: file,
    series_label: series,
    file_url_override: url,
  };
}

function coreExam(subject, series, papers) {
  const out = [];
  for (const paper of papers) {
    if (paper.qp) {
      out.push(row({
        subject,
        category: "Past Questions",
        title: paper.title,
        file: paper.qpFile,
        series,
        url: ncfe(paper.qp, paper.qpFile),
      }));
    }
    if (paper.ms) {
      out.push(row({
        subject,
        category: "Mark Schemes",
        title: `${paper.title} mark scheme`,
        file: paper.msFile,
        series,
        url: ncfe(paper.ms, paper.msFile),
      }));
    }
  }
  return out;
}

function examinerReport(subject, series, title, hash, file) {
  return row({
    subject,
    category: "Examiner Reports",
    title,
    file,
    series,
    url: ncfe(hash, file),
  });
}

export const NCFE_TLEVEL_RESOURCES = [
  // --- T-Level Science / Pearson (2026 specification from the SharePoint root) ---
  row({
    subject: "Science",
    board: "Pearson",
    category: "Specifications",
    title: "T Level Science specification (first teaching September 2026)",
    file: "t-level-science-spec.pdf",
    series: "Specification",
    url: `${PEARSON}/TLevels/science/2026/specification-and-sample-assessment-materials/t-level-science-spec.pdf`,
  }),
  row({
    subject: "Science",
    board: "Pearson",
    category: "Specifications",
    title: "T Level Science qualification description",
    file: "qualification-description-t-level-technical-qualification-in-science.pdf",
    series: "Specification",
    url: `${PEARSON}/TLevels/science/2026/administration/qualification-description-t-level-technical-qualification-in-science.pdf`,
  }),
  row({
    subject: "Science",
    board: "Pearson",
    category: "Specifications",
    title: "Biology teaching plan 2026–2027",
    file: "biology-teaching-plan-2026-2027.docx",
    series: "Teaching plans 2026–2027",
    url: "/resources/pearson/tlevel/science/specifications/biology-teaching-plan-2026-2027.docx",
  }),
  row({
    subject: "Science",
    board: "Pearson",
    category: "Specifications",
    title: "Chemistry teaching plan 2026–2027",
    file: "chemistry-teaching-plan-2026-2027.docx",
    series: "Teaching plans 2026–2027",
    url: "/resources/pearson/tlevel/science/specifications/chemistry-teaching-plan-2026-2027.docx",
  }),
  row({
    subject: "Science",
    board: "Pearson",
    category: "Specifications",
    title: "Physics teaching plan 2026–2027",
    file: "physics-teaching-plan-2026-2027.docx",
    series: "Teaching plans 2026–2027",
    url: "/resources/pearson/tlevel/science/specifications/physics-teaching-plan-2026-2027.docx",
  }),
  row({
    subject: "Laboratory Sciences",
    board: "Pearson",
    category: "Specifications",
    title: "Laboratory Sciences teaching plan 2026–2027",
    file: "laboratory-sciences-teaching-plan-2026-2027.docx",
    series: "Teaching plans 2026–2027",
    url: "/resources/pearson/tlevel/laboratory-sciences/specifications/laboratory-sciences-teaching-plan-2026-2027.docx",
  }),

  // --- T-Level Science / NCFE (core papers, support, withdrawn spec) ---
  row({
    subject: "Science",
    category: "Specifications",
    title: "Science specification 603/6989/9 (withdrawn)",
    file: "603-6989-9-qualification-specification-v5-0-withdrawn.pdf",
    series: "Specification",
    url: ncfe("ynwa4j1k", "603-6989-9-qualification-specification-v5-0-withdrawn.pdf"),
  }),
  row({
    subject: "Science",
    category: "Specifications",
    title: "Science qualification overview",
    file: "science.pdf",
    series: "Specification",
    url: ncfe("2nefzsrw", "science.pdf"),
  }),
  row({
    subject: "Science",
    category: "Revision Notes",
    title: "Command verbs support materials",
    file: "t-level-support-materials_command_verbs_v10.pdf",
    series: "Support materials",
    url: ncfe("s2ydmqzb", "t-level-support-materials_command_verbs_v10.pdf"),
  }),
  row({
    subject: "Science",
    category: "Revision Notes",
    title: "Employer-set project provider checklist",
    file: "employer-set-project-provider-checklist-science.pdf",
    series: "Employer-set project",
    url: ncfe("41vaokcj", "employer-set-project-provider-checklist-science.pdf"),
  }),

  ...coreExam("Science", "Specimen assessment", [
    {
      title: "Core Paper A",
      qp: "q2glzask",
      qpFile: "sci-0014-02-tq-science-core-exam-paper-a-question-paper_23.pdf",
      ms: "khtnpevx",
      msFile: "sci-0014-01-tq-science-core-exam-paper-a-mark-scheme_23.pdf",
    },
    {
      title: "Core Paper B",
      qp: "2iijdpwp",
      qpFile: "sci-0015-02-tq-science-core-exam-paper-b-question-paper_23.pdf",
      ms: "iy0hsnio",
      msFile: "sci-0015-01-tq-science-core-exam-paper-b-mark-scheme_23.pdf",
    },
  ]),
  ...coreExam("Science", "Summer 2023", [
    {
      title: "Core Paper A",
      qp: "ea1nlkpa",
      qpFile: "805-131-cache-tq-p001926-clean-proof.pdf",
      ms: "3cwl4oqb",
      msFile: "tq-p001926-ms-science-core-paper-a-v1-1-final-post-stand.pdf",
    },
    {
      title: "Core Paper B",
      qp: "eiwo3521",
      qpFile: "805-133-cache-tq-p001932-clean-proof.pdf",
      ms: "e0gceigc",
      msFile: "tq-p001932-ms-science-core-paper-b-v1-1-final-post-stand.pdf",
    },
  ]),
  examinerReport(
    "Science",
    "Summer 2023",
    "Chief examiner report — Core Paper A and B",
    "5hwfddj2",
    "core-a-and-b-chief-examiner-report-summer-2023-final.pdf",
  ),
  ...coreExam("Science", "Autumn 2023", [
    {
      title: "Core Paper A",
      qp: "g01cjgb4",
      qpFile: "805-150-cache-tq-p002410-final.pdf",
      ms: "geudzcxa",
      msFile: "ms-science-core-paper-a-04-v1-0-post-standardisation.pdf",
    },
    {
      title: "Core Paper B",
      qp: "jbshlxwt",
      qpFile: "805-156-cache-tq-p002411-final.pdf",
      ms: "gk3lroqg",
      msFile: "science-ms-core-paper-b-04-v1-0-pre-standardisation.pdf",
    },
  ]),
  examinerReport(
    "Science",
    "Autumn 2023",
    "Chief examiner report — Core Paper A and B",
    "i1xda1fm",
    "core-a-and-b_chief-examiner-science-core.pdf",
  ),
  examinerReport(
    "Science",
    "Summer 2025",
    "Chief examiner report — Core Paper A and B",
    "spdfbtsu",
    "science-chief-examiner-report-core-a-and-b-summer-2025.pdf",
  ),
  row({
    subject: "Science",
    category: "Mark Schemes",
    title: "Metrology Sciences employer-set project mark scheme",
    file: "sci-0010-02-tq-science-esp-metrology-sciences-mark-scheme.pdf",
    series: "Employer-set project",
    url: ncfe("evodes3a", "sci-0010-02-tq-science-esp-metrology-sciences-mark-scheme.pdf"),
  }),

  // --- Laboratory Sciences (SharePoint Laboratory science folder + existing OSA pack) ---
  row({
    subject: "Laboratory Sciences",
    category: "Revision Notes",
    title: "Occupational specialism provider guide",
    file: "sci-0007-00-tq-science-osa-laboratory-sciences-all-assignments-provider-guide.pdf",
    series: "Occupational specialism assessment",
    url: ncfe("3knceurq", "sci-0007-00-tq-science-osa-laboratory-sciences-all-assignments-provider-guide.pdf"),
  }),
  row({
    subject: "Laboratory Sciences",
    category: "Past Questions",
    title: "Assignment 1 brief",
    file: "sci-0007-01-tq-science-osa-laboratory-sciences-assignment-1-assignment-brief.pdf",
    series: "Occupational specialism assessment",
    url: ncfe("votpjuvh", "sci-0007-01-tq-science-osa-laboratory-sciences-assignment-1-assignment-brief.pdf"),
  }),
  row({
    subject: "Laboratory Sciences",
    category: "Mark Schemes",
    title: "Assignment 1 mark scheme",
    file: "sci-0007-02-tq-science-osa-laboratory-sciences-assignment-1-mark-scheme.pdf",
    series: "Occupational specialism assessment",
    url: ncfe("edbob2lt", "sci-0007-02-tq-science-osa-laboratory-sciences-assignment-1-mark-scheme.pdf"),
  }),
  row({
    subject: "Laboratory Sciences",
    category: "Past Questions",
    title: "Assignment 2 Part A brief",
    file: "sci-0008-01-tq-science-osa-laboratory-sciences-assignment-2-part-a-assignment-brief.pdf",
    series: "Occupational specialism assessment",
    url: ncfe("z2klu1em", "sci-0008-01-tq-science-osa-laboratory-sciences-assignment-2-part-a-assignment-brief.pdf"),
  }),
  row({
    subject: "Laboratory Sciences",
    category: "Mark Schemes",
    title: "Assignment 2 Part A mark scheme",
    file: "sci-0008-02-tq-science-osa-laboratory-sciences-assignment-2-part-a-mark-scheme.pdf",
    series: "Occupational specialism assessment",
    url: ncfe("0gmopkqf", "sci-0008-02-tq-science-osa-laboratory-sciences-assignment-2-part-a-mark-scheme.pdf"),
  }),
  row({
    subject: "Laboratory Sciences",
    category: "Revision Notes",
    title: "Assignment 2 Part A evidence requirements",
    file: "sci-er-0002-tq-science-osa-laboratory-sciences-assignment-2-part-a-practical-assessment-evidence-requirements.pdf",
    series: "Occupational specialism assessment",
    url: ncfe("rluhpryb", "sci-er-0002-tq-science-osa-laboratory-sciences-assignment-2-part-a-practical-assessment-evidence-requirements.pdf"),
  }),
  row({
    subject: "Laboratory Sciences",
    category: "Past Questions",
    title: "Assignment 2 Part B brief",
    file: "sci-0008-03-tq-science-osa-laboratory-sciences-assignment-2-part-b-assignment-brief.pdf",
    series: "Occupational specialism assessment",
    url: ncfe("nmam2wz0", "sci-0008-03-tq-science-osa-laboratory-sciences-assignment-2-part-b-assignment-brief.pdf"),
  }),
  row({
    subject: "Laboratory Sciences",
    category: "Mark Schemes",
    title: "Assignment 2 Part B mark scheme",
    file: "sci-0008-04-tq-science-osa-laboratory-sciences-assignment-2-part-b-mark-scheme.pdf",
    series: "Occupational specialism assessment",
    url: ncfe("yz4pqlhr", "sci-0008-04-tq-science-osa-laboratory-sciences-assignment-2-part-b-mark-scheme.pdf"),
  }),
  row({
    subject: "Laboratory Sciences",
    category: "Revision Notes",
    title: "Assignment 2 Part B evidence requirements",
    file: "sci-er-0003-tq-science-osa-laboratory-sciences-assignment-2-part-b-practical-assessment-evidence-requirements.pdf",
    series: "Occupational specialism assessment",
    url: ncfe("v0tndu5m", "sci-er-0003-tq-science-osa-laboratory-sciences-assignment-2-part-b-practical-assessment-evidence-requirements.pdf"),
  }),
  row({
    subject: "Laboratory Sciences",
    category: "Past Questions",
    title: "Assignment 3 brief",
    file: "sci-0009-01-tq-science-osa-laboratory-sciences-assignment-3-assignment-brief.pdf",
    series: "Occupational specialism assessment",
    url: ncfe("tdnl3rrf", "sci-0009-01-tq-science-osa-laboratory-sciences-assignment-3-assignment-brief.pdf"),
  }),
  row({
    subject: "Laboratory Sciences",
    category: "Mark Schemes",
    title: "Assignment 3 mark scheme",
    file: "sci-0009-02-tq-science-osa-laboratory-sciences-assignment-3-mark-scheme.pdf",
    series: "Occupational specialism assessment",
    url: ncfe("xghhsaza", "sci-0009-02-tq-science-osa-laboratory-sciences-assignment-3-mark-scheme.pdf"),
  }),
  row({
    subject: "Laboratory Sciences",
    category: "Worksheets",
    title: "Assignment 3 LIMS pH data",
    file: "laboratory-sciences-assignment-3-po3-lims-ph-data.xlsx",
    series: "Occupational specialism assessment",
    url: ncfe("4ysnaeup", "laboratory-sciences-assignment-3-po3-lims-ph-data.xlsx"),
  }),

  row({
    subject: "Laboratory Sciences",
    category: "Past Questions",
    title: "Employer-set project brief",
    file: "tq-esp-laboratory-sciences-brief-v1-0.pdf",
    series: "Employer-set project",
    url: ncfe("zpunaoou", "tq-esp-laboratory-sciences-brief-v1-0.pdf"),
  }),
  row({
    subject: "Laboratory Sciences",
    category: "Mark Schemes",
    title: "Employer-set project mark scheme",
    file: "sci-0006-02-tq-science-esp-laboratory-sciences-mark-scheme.pdf",
    series: "Employer-set project",
    url: ncfe("o5xbtydu", "sci-0006-02-tq-science-esp-laboratory-sciences-mark-scheme.pdf"),
  }),

  examinerReport(
    "Laboratory Sciences",
    "Summer 2023",
    "Chief examiner report — employer-set project",
    "51pk3pav",
    "esp_chief-examiner-report-summer-2023-final.pdf",
  ),
  row({
    subject: "Laboratory Sciences",
    category: "Past Questions",
    title: "Employer-set project brief",
    file: "p001941-esp-lab-science-assignment-brief.pdf",
    series: "Summer 2023",
    url: ncfe("cree2t2g", "p001941-esp-lab-science-assignment-brief.pdf"),
  }),
  row({
    subject: "Laboratory Sciences",
    category: "Revision Notes",
    title: "Employer-set project provider guide",
    file: "p001941-laboratory-sciences-all-briefs-provider-guide.pdf",
    series: "Summer 2023",
    url: ncfe("zr1btyff", "p001941-laboratory-sciences-all-briefs-provider-guide.pdf"),
  }),
  row({
    subject: "Laboratory Sciences",
    category: "Revision Notes",
    title: "Guidance on capturing browsing history",
    file: "tq-science-esp-guidance-on-capturing-browsing-history.pdf",
    series: "Summer 2023",
    url: ncfe("v4glgbrn", "tq-science-esp-guidance-on-capturing-browsing-history.pdf"),
  }),
  row({
    subject: "Laboratory Sciences",
    category: "Revision Notes",
    title: "Statistical techniques",
    file: "tq-science-esp-laboratory-sciences-statistical-techniques.pdf",
    series: "Summer 2023",
    url: ncfe("cibjf0uy", "tq-science-esp-laboratory-sciences-statistical-techniques.pdf"),
  }),
  row({
    subject: "Laboratory Sciences",
    category: "Worksheets",
    title: "Employer-set project pro-formas",
    file: "tq-science-esp-laboratory-sciences-pro-formas-v1-0.docx",
    series: "Summer 2023",
    url: ncfe("rr3ngb3g", "tq-science-esp-laboratory-sciences-pro-formas-v1-0.docx"),
  }),

  // --- Food Sciences (existing specimen OSA pack, not duplicated) ---
  row({
    subject: "Food Sciences",
    category: "Revision Notes",
    title: "Occupational specialism provider guide",
    file: "sci-0002-00-tq-science-osa-food-sciences-all-assignments-provider-guide_23.pdf",
    series: "Occupational specialism assessment",
    url: ncfe("brfbebil", "sci-0002-00-tq-science-osa-food-sciences-all-assignments-provider-guide_23.pdf"),
  }),
  row({
    subject: "Food Sciences",
    category: "Past Questions",
    title: "Assignment 1 brief",
    file: "sci-0002-01-tq-science-osa-food-sciences-assignment-1-assignment-brief_23.pdf",
    series: "Occupational specialism assessment",
    url: ncfe("ifgbvjhv", "sci-0002-01-tq-science-osa-food-sciences-assignment-1-assignment-brief_23.pdf"),
  }),
  row({
    subject: "Food Sciences",
    category: "Mark Schemes",
    title: "Assignment 1 mark scheme",
    file: "sci-0002-02-tq-science-osa-food-sciences-assignment-1-mark-scheme_23.pdf",
    series: "Occupational specialism assessment",
    url: ncfe("3tom010k", "sci-0002-02-tq-science-osa-food-sciences-assignment-1-mark-scheme_23.pdf"),
  }),

  // --- Healthcare Science (SharePoint Health and Social Care folder) ---
  row({
    subject: "Healthcare Science",
    category: "Specifications",
    title: "Healthcare Science specification 603/7083/X",
    file: "603-7083-x-qualification-specification-v6-0-withdrawn.pdf",
    series: "Specification",
    url: ncfe("s2oc0k2c", "603-7083-x-qualification-specification-v6-0-withdrawn.pdf"),
  }),
  ...coreExam("Healthcare Science", "Specimen assessment", [
    {
      title: "Core Paper A",
      qp: "q2mjjyis",
      qpFile: "hcsci-0008-02-tq-healthcare-science-core-exam-paper-a-question-paper.pdf",
      ms: "midocpsi",
      msFile: "hcsci-0008-01-tq-healthcare-science-core-exam-paper-a-mark-scheme.pdf",
    },
    {
      title: "Core Paper B",
      qp: "sw2lvomr",
      qpFile: "hcsci-0009-02-tq-healthcare-science-core-exam-paper-b-question-paper.pdf",
      ms: "pbnflyin",
      msFile: "hcsci-0009-01-tq-healthcare-science-core-exam-paper-b-mark-scheme.pdf",
    },
  ]),
  ...coreExam("Healthcare Science", "Summer 2023", [
    {
      title: "Core Paper A",
      qp: "dy0dqitx",
      qpFile: "805-126-ncfe-tq-p001957_clean_proof.pdf",
      ms: "qfxkdvz1",
      msFile: "tqp001957-hcs-main-ms-v3-2.pdf",
    },
    {
      title: "Core Paper B",
      qp: "oqlhti1c",
      qpFile: "805-132-ncfe-tq-p001963_clean_proof.pdf",
      ms: "libguyti",
      msFile: "p001963_hcs_-core-b_ms.pdf",
    },
  ]),
  examinerReport(
    "Healthcare Science",
    "Summer 2023",
    "Chief examiner report — Core Paper A and B",
    "3c5l233w",
    "chief-examiner-report-core-a-and-b-summer-2023_2.pdf",
  ),
  ...coreExam("Healthcare Science", "Autumn 2023", [
    {
      title: "Core Paper A",
      qp: "ygxpf1wf",
      qpFile: "805-148-ncfe-tq-p002396-clean_proof-core-a.pdf",
      ms: "koihzbrz",
      msFile: "ncfe-ms-p002396-tq-healthcare-science-core-a-paper-4-pre-standardisation-v1-0.pdf",
    },
    {
      title: "Core Paper B",
      qp: "pgmhmjp3",
      qpFile: "805-153-ncfe-tq-p002397-clean_proof-core-b-2.pdf",
      ms: "h5bis1zl",
      msFile: "hcs-04-core-b-ms-04-v1-0.pdf",
    },
  ]),
  examinerReport(
    "Healthcare Science",
    "Autumn 2023",
    "Chief examiner report — Core Paper A and B",
    "prfnezy2",
    "hcs-core-ab-chief-examiner-report-autumn-2023.pdf",
  ),
  row({
    subject: "Healthcare Science",
    category: "Past Questions",
    title: "Employer-set project brief",
    file: "p002400_esp_ahcsc_brief_v1-0.pdf",
    series: "Employer-set project",
    url: ncfe("gzxb31if", "p002400_esp_ahcsc_brief_v1-0.pdf"),
  }),
  row({
    subject: "Healthcare Science",
    category: "Mark Schemes",
    title: "Employer-set project mark scheme",
    file: "p002400_esp_ahcsc_ms_v1-0-final.pdf",
    series: "Employer-set project",
    url: ncfe("nsddhquz", "p002400_esp_ahcsc_ms_v1-0-final.pdf"),
  }),
];
