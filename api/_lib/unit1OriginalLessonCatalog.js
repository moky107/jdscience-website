/* Catalogue for the original BTEC Unit 1 lesson batch.
   Used only by the one-off publish script. Do not import from shop
   handlers, npm run build, or Vercel request paths. */

export const UNIT1_LEVEL = "BTEC Level 3";
export const UNIT1_UNIT = "Unit 1 Principles and Applications of Science I";
export const UNIT1_EXAM_BOARD = "Pearson";
export const PPT_PRICE_PENCE = 500;
export const WORKSHEET_PRICE_PENCE = 200;

export const FEATURED_PPT_SLUGS = [
  "btec-unit-1-chemistry-atomic-structure",
  "btec-unit-1-biology-cell-structure",
  "btec-unit-1-physics-progressive-waves",
];

export const UNIT1_LESSONS = [
  {
    folder: "atomic-structure",
    subject: "Chemistry",
    topic: "Atomic Structure",
    pptFile: "btec-unit-1-chemistry-atomic-structure.pptx",
    pptSlug: "btec-unit-1-chemistry-atomic-structure",
    pptTitle: "BTEC Unit 1 Chemistry: Atomic Structure",
    pptShort: "Level 3 teaching presentation on particles, isotopes, ions and relative atomic mass.",
    pptDescription:
      "A structured Level 3 teaching presentation covering subatomic particles, atomic number, mass number, isotopes, ions and relative atomic mass. Includes retrieval tasks, worked examples, original diagrams, checks for understanding, exam-style practice and answers.",
    wsShort: "Level 3 worksheet on particles, nuclide notation, isotopes, ions and relative atomic mass, with answers.",
    wsDescription:
      "A Level 3 chemistry worksheet on subatomic particles, nuclide notation, isotopes, ions and relative atomic mass. Structured questions suit classwork, homework, revision or independent study. The download includes the student worksheet and a separate answer sheet.",
  },
  {
    folder: "electron-configuration",
    subject: "Chemistry",
    topic: "Electron Configuration",
    pptFile: "btec-unit-1-chemistry-electron-configuration.pptx",
    pptSlug: "btec-unit-1-chemistry-electron-configuration",
    pptTitle: "BTEC Unit 1 Chemistry: Electron Configuration",
    pptShort: "Level 3 presentation on shells, subshells, Aufbau, Hund’s rule and ion configurations.",
    pptDescription:
      "A Level 3 chemistry presentation on electron shells, subshells, the Aufbau principle, Hund’s rule and the Pauli exclusion principle. Students write configurations for atoms and ions, with original orbital diagrams, worked examples, retrieval tasks and exam-style practice.",
    wsShort: "Level 3 worksheet on electron arrangements, orbital boxes and ion configurations, with answers.",
    wsDescription:
      "A Level 3 chemistry worksheet on electron shells, subshell notation, orbital boxes and ion configurations. Questions build from retrieval to exam-style items and suit teaching, revision or independent study. The download includes the student worksheet and a separate answer sheet.",
  },
  {
    folder: "ionic-bonding",
    subject: "Chemistry",
    topic: "Ionic Bonding",
    pptFile: "btec-unit-1-chemistry-ionic-bonding.pptx",
    pptSlug: "btec-unit-1-chemistry-ionic-bonding",
    pptTitle: "BTEC Unit 1 Chemistry: Ionic Bonding",
    pptShort: "Level 3 presentation on ion formation, electron transfer, lattices and ionic properties.",
    pptDescription:
      "A Level 3 presentation on ion formation, electron transfer, ionic lattices and the properties of ionic compounds. Original diagrams show how metals and non-metals form ions, with retrieval, worked examples and exam-style questions for teaching, revision or independent study.",
    wsShort: "Level 3 worksheet on ion formation, formulae and ionic properties, with answers.",
    wsDescription:
      "A Level 3 chemistry worksheet on ion formation, electron transfer, ionic formulae and lattice properties. Structured questions suit lessons, homework or revision. The download includes the student worksheet and a separate answer sheet.",
  },
  {
    folder: "covalent-bonding",
    subject: "Chemistry",
    topic: "Covalent Bonding",
    pptFile: "btec-unit-1-chemistry-covalent-bonding.pptx",
    pptSlug: "btec-unit-1-chemistry-covalent-bonding",
    pptTitle: "BTEC Unit 1 Chemistry: Covalent Bonding",
    pptShort: "Level 3 presentation on shared pairs, simple molecules and giant covalent structures.",
    pptDescription:
      "A Level 3 presentation on shared electron pairs, simple covalent molecules, giant covalent structures and the properties that follow. Includes original bonding diagrams, retrieval tasks, worked examples and exam-style practice for teaching, revision or independent study.",
    wsShort: "Level 3 worksheet on shared pairs, molecules and giant covalent structures, with answers.",
    wsDescription:
      "A Level 3 chemistry worksheet on covalent bonding, simple molecules and giant structures such as diamond and graphite. Questions suit classwork, homework or independent study. The download includes the student worksheet and a separate answer sheet.",
  },
  {
    folder: "metallic-bonding",
    subject: "Chemistry",
    topic: "Metallic Bonding",
    pptFile: "btec-unit-1-chemistry-metallic-bonding.pptx",
    pptSlug: "btec-unit-1-chemistry-metallic-bonding",
    pptTitle: "BTEC Unit 1 Chemistry: Metallic Bonding",
    pptShort: "Level 3 presentation on the metallic lattice, delocalised electrons and metal properties.",
    pptDescription:
      "A Level 3 presentation on the metallic lattice, delocalised electrons and the properties of metals. Original diagrams, retrieval, worked examples and exam-style questions support teaching, revision and independent study of Unit 1 bonding.",
    wsShort: "Level 3 worksheet on metallic lattices, delocalised electrons and metal properties, with answers.",
    wsDescription:
      "A Level 3 chemistry worksheet on metallic bonding, delocalised electrons and how the lattice explains conductivity, malleability and high melting points. Suitable for teaching, revision or independent study. The download includes the student worksheet and a separate answer sheet.",
  },
  {
    folder: "cell-structure",
    subject: "Biology",
    topic: "Cell Structure",
    pptFile: "btec-unit-1-biology-cell-structure.pptx",
    pptSlug: "btec-unit-1-biology-cell-structure",
    pptTitle: "BTEC Unit 1 Biology: Cell Structure",
    pptShort: "Level 3 presentation on animal and plant cell ultrastructure and organelle function.",
    pptDescription:
      "A Level 3 biology presentation on animal and plant cell ultrastructure, organelle function and how structure supports function. Original diagrams, retrieval, labelling tasks and exam-style practice are included for teaching, revision or independent study.",
    wsShort: "Level 3 worksheet on organelles, animal and plant cells and structure–function links, with answers.",
    wsDescription:
      "A Level 3 biology worksheet on cell ultrastructure, organelle function and comparisons of animal and plant cells. Labelling and structured questions suit lessons, homework or revision. The download includes the student worksheet and a separate answer sheet.",
  },
  {
    folder: "prokaryotic-and-eukaryotic-cells",
    subject: "Biology",
    topic: "Prokaryotic and Eukaryotic Cells",
    pptFile: "btec-unit-1-biology-prokaryotic-and-eukaryotic-cells.pptx",
    pptSlug: "btec-unit-1-biology-prokaryotic-and-eukaryotic-cells",
    pptTitle: "BTEC Unit 1 Biology: Prokaryotic and Eukaryotic Cells",
    pptShort: "Level 3 presentation comparing prokaryotic and eukaryotic cell structure and examples.",
    pptDescription:
      "A Level 3 biology presentation comparing prokaryotic and eukaryotic cells, including key organelles, cell walls and typical examples. Original comparison diagrams, retrieval and exam-style questions support teaching, revision and independent study.",
    wsShort: "Level 3 worksheet comparing prokaryotic and eukaryotic cells, with answers.",
    wsDescription:
      "A Level 3 biology worksheet comparing prokaryotic and eukaryotic cells, including organelles, DNA arrangement and typical examples. Suitable for classwork, homework or independent study. The download includes the student worksheet and a separate answer sheet.",
  },
  {
    folder: "microscopy",
    subject: "Biology",
    topic: "Microscopy",
    pptFile: "btec-unit-1-biology-microscopy.pptx",
    pptSlug: "btec-unit-1-biology-microscopy",
    pptTitle: "BTEC Unit 1 Biology: Microscopy",
    pptShort: "Level 3 presentation on light and electron microscopes, magnification and resolution.",
    pptDescription:
      "A Level 3 biology presentation on light and electron microscopes, magnification, resolution and microscopy calculations. Includes original diagrams, worked examples, retrieval and exam-style practice for teaching, revision or independent study.",
    wsShort: "Level 3 worksheet on magnification, resolution and microscope calculations, with answers.",
    wsDescription:
      "A Level 3 biology worksheet on light and electron microscopy, magnification, resolution and standard-form calculations. Questions suit lessons, homework or revision. The download includes the student worksheet and a separate answer sheet.",
  },
  {
    folder: "progressive-waves",
    subject: "Physics",
    topic: "Progressive Waves",
    pptFile: "btec-unit-1-physics-progressive-waves.pptx",
    pptSlug: "btec-unit-1-physics-progressive-waves",
    pptTitle: "BTEC Unit 1 Physics: Progressive Waves",
    pptShort: "Level 3 presentation on wave graphs, wavelength, frequency, amplitude and v = fλ.",
    pptDescription:
      "A Level 3 physics presentation on progressive waves, displacement–distance graphs, wavelength, frequency, amplitude and the wave equation. Original wave diagrams, retrieval, worked examples and exam-style practice are included for teaching, revision or independent study.",
    wsShort: "Level 3 worksheet on wave graphs, period, frequency and the wave equation, with answers.",
    wsDescription:
      "A Level 3 physics worksheet on progressive waves, graph reading, period, frequency and v = fλ. Structured and calculation questions suit classwork, homework or independent study. The download includes the student worksheet and a separate answer sheet.",
  },
  {
    folder: "wave-properties",
    subject: "Physics",
    topic: "Wave Properties",
    pptFile: "btec-unit-1-physics-wave-properties.pptx",
    pptSlug: "btec-unit-1-physics-wave-properties",
    pptTitle: "BTEC Unit 1 Physics: Wave Properties",
    pptShort: "Level 3 presentation on reflection, refraction, diffraction and superposition.",
    pptDescription:
      "A Level 3 physics presentation on reflection, refraction, diffraction and superposition. Original ray and wavefront diagrams, retrieval, worked examples and exam-style questions support teaching, revision and independent study.",
    wsShort: "Level 3 worksheet on reflection, refraction, diffraction and superposition, with answers.",
    wsDescription:
      "A Level 3 physics worksheet on reflection, refraction, diffraction and superposition, including wavefront diagrams and structured questions. Suitable for teaching, revision or independent study. The download includes the student worksheet and a separate answer sheet.",
  },
];

export function unit1ProductSpecs() {
  return UNIT1_LESSONS.flatMap((lesson, index) => {
    const wsSlug = `${lesson.pptSlug}-worksheet`;
    const pptFeatured = FEATURED_PPT_SLUGS.includes(lesson.pptSlug);
    return [
      {
        kind: "powerpoint",
        folder: lesson.folder,
        slug: lesson.pptSlug,
        title: lesson.pptTitle,
        subject: lesson.subject,
        topic: lesson.topic,
        product_type: "powerpoint",
        price_pence: PPT_PRICE_PENCE,
        short_description: lesson.pptShort,
        description: lesson.pptDescription,
        is_featured: pptFeatured,
        sort_order: 10 + index,
        localDownloadName: lesson.pptFile,
        localCoverName: "cover.png",
        downloadContentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        keywords: [
          "unit 1",
          UNIT1_UNIT,
          "BTEC Level 3",
          lesson.subject,
          lesson.topic,
          "powerpoint",
          "applied science",
        ],
      },
      {
        kind: "worksheet",
        folder: lesson.folder,
        slug: wsSlug,
        title: `${lesson.pptTitle} Worksheet`,
        subject: lesson.subject,
        topic: lesson.topic,
        product_type: "worksheet",
        price_pence: WORKSHEET_PRICE_PENCE,
        short_description: lesson.wsShort,
        description: lesson.wsDescription,
        is_featured: false,
        sort_order: 20 + index,
        localDownloadName: `btec-unit-1-${lesson.folder}-worksheet-pack.zip`,
        localCoverName: "cover-worksheet.png",
        downloadContentType: "application/zip",
        keywords: [
          "unit 1",
          UNIT1_UNIT,
          "BTEC Level 3",
          lesson.subject,
          lesson.topic,
          "worksheet",
          "answer sheet",
          "applied science",
        ],
      },
    ];
  });
}
