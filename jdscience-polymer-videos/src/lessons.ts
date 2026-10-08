export type SceneKind =
  | "title"
  | "definition"
  | "molecule"
  | "equation"
  | "chain"
  | "compare"
  | "polyester"
  | "uses"
  | "summary";

export type Scene = {
  id: string;
  kind: SceneKind;
  /** Fraction of total narration duration (0–1), used until sentence sync exists */
  weight: number;
  eyebrow: string;
  heading: string;
  body?: string;
  bullets?: string[];
  /** Cue words from the VO used to refine sync when transcript is available */
  cues?: string[];
};

export type Lesson = {
  id: string;
  compositionId: string;
  title: string;
  /** Preferred MP3 filenames (first match in public/audio wins) */
  audioCandidates: string[];
  series: string;
  scenes: Scene[];
};

/**
 * Four JD Science polymer lessons.
 * Scene weights sum to 1 and are scaled to the real MP3 duration at render time.
 */
export const LESSONS: Lesson[] = [
  {
    id: "01-polymers-intro",
    compositionId: "PolymersIntro",
    title: "Polymers: Monomers and Polymerisation",
    audioCandidates: [
      "01-polymers-intro.mp3",
      "polymers-intro.mp3",
      "01.mp3",
      "video1.mp3",
      "polymers.mp3",
    ],
    series: "JD Science · GCSE Chemistry · Polymers",
    scenes: [
      {
        id: "t",
        kind: "title",
        weight: 0.1,
        eyebrow: "Lesson 1",
        heading: "Polymers",
        body: "How small molecules join to make giant chains",
        cues: ["welcome", "polymer", "monomer"],
      },
      {
        id: "def",
        kind: "definition",
        weight: 0.18,
        eyebrow: "Key definitions",
        heading: "Monomer and polymer",
        bullets: [
          "Monomer — a small molecule that can join to others",
          "Polymer — a long chain made from many monomers",
          "Polymerisation — the reaction that builds the chain",
        ],
        cues: ["monomer", "polymer", "chain"],
      },
      {
        id: "types",
        kind: "compare",
        weight: 0.2,
        eyebrow: "Two types",
        heading: "Addition vs condensation",
        bullets: [
          "Addition: monomers with C=C join; one product only",
          "Condensation: two different monomers join; small molecule eliminated (often water)",
        ],
        cues: ["addition", "condensation"],
      },
      {
        id: "alkene",
        kind: "molecule",
        weight: 0.18,
        eyebrow: "Addition polymers",
        heading: "Alkenes are the monomers",
        body: "The C=C double bond opens so carbon atoms can link into a chain.",
        cues: ["alkene", "double bond", "ethene"],
      },
      {
        id: "eq",
        kind: "equation",
        weight: 0.16,
        eyebrow: "General idea",
        heading: "Many monomers → one polymer",
        body: "n monomer → polymer",
        cues: ["repeating", "unit"],
      },
      {
        id: "sum",
        kind: "summary",
        weight: 0.18,
        eyebrow: "Takeaway",
        heading: "Name the monomer, explain the link",
        bullets: [
          "Spot C=C for addition polymerisation",
          "Name the polymer from the monomer (poly…)",
          "Next: ethene → poly(ethene)",
        ],
        cues: ["remember", "next"],
      },
    ],
  },
  {
    id: "02-polyethene",
    compositionId: "Polyethene",
    title: "Poly(ethene) from Ethene",
    audioCandidates: [
      "02-polyethene.mp3",
      "polyethene.mp3",
      "poly-ethene.mp3",
      "ethene.mp3",
      "02.mp3",
      "video2.mp3",
    ],
    series: "JD Science · GCSE Chemistry · Polymers",
    scenes: [
      {
        id: "t",
        kind: "title",
        weight: 0.1,
        eyebrow: "Lesson 2",
        heading: "Poly(ethene)",
        body: "Displayed formula of ethene → addition polymer",
        cues: ["ethene", "polyethene", "poly(ethene)"],
      },
      {
        id: "mol",
        kind: "molecule",
        weight: 0.18,
        eyebrow: "Displayed formula",
        heading: "Ethene, C₂H₄",
        body: "Two carbons joined by a double bond; each carbon bonded to two hydrogens.",
        cues: ["displayed", "double bond", "carbon"],
      },
      {
        id: "break",
        kind: "molecule",
        weight: 0.16,
        eyebrow: "Mechanism idea",
        heading: "The double bond opens",
        body: "Each carbon forms a new single bond to the next ethene unit.",
        cues: ["opens", "joins", "links"],
      },
      {
        id: "eq",
        kind: "equation",
        weight: 0.16,
        eyebrow: "Equation",
        heading: "n ethene → poly(ethene)",
        body: "n CH₂=CH₂ → [–CH₂–CH₂–]ₙ",
        cues: ["equation", "repeating unit"],
      },
      {
        id: "chain",
        kind: "chain",
        weight: 0.2,
        eyebrow: "Polymer chain",
        heading: "Repeating –CH₂–CH₂– units",
        body: "poly(ethene)",
        cues: ["chain", "plastic", "bag"],
      },
      {
        id: "uses",
        kind: "uses",
        weight: 0.2,
        eyebrow: "Properties and uses",
        heading: "Why poly(ethene) is useful",
        bullets: [
          "Flexible, waterproof, unreactive",
          "Plastic bags, bottles, packaging, pipes",
          "LDPE vs HDPE: branching changes strength",
        ],
        cues: ["uses", "packaging", "bags"],
      },
    ],
  },
  {
    id: "03-polypropene",
    compositionId: "Polypropene",
    title: "Poly(propene) from Propene",
    audioCandidates: [
      "03-polypropene.mp3",
      "polypropene.mp3",
      "poly-propene.mp3",
      "propene.mp3",
      "03.mp3",
      "video3.mp3",
    ],
    series: "JD Science · GCSE Chemistry · Polymers",
    scenes: [
      {
        id: "t",
        kind: "title",
        weight: 0.1,
        eyebrow: "Lesson 3",
        heading: "Poly(propene)",
        body: "Propene monomer → tough, flexible polymer",
        cues: ["propene", "polypropene", "poly(propene)"],
      },
      {
        id: "mol",
        kind: "molecule",
        weight: 0.2,
        eyebrow: "Displayed formula",
        heading: "Propene, C₃H₆",
        body: "Three-carbon alkene with a methyl side group on the double bond.",
        cues: ["methyl", "side", "group"],
      },
      {
        id: "eq",
        kind: "equation",
        weight: 0.18,
        eyebrow: "Equation",
        heading: "n propene → poly(propene)",
        body: "n CH₂=CHCH₃ → [–CH₂–CH(CH₃)–]ₙ",
        cues: ["repeating", "unit"],
      },
      {
        id: "chain",
        kind: "chain",
        weight: 0.2,
        eyebrow: "Polymer chain",
        heading: "Methyl groups along the backbone",
        body: "poly(propene)",
        cues: ["chain", "methyl"],
      },
      {
        id: "uses",
        kind: "uses",
        weight: 0.18,
        eyebrow: "Uses",
        heading: "Stronger and more heat-resistant than poly(ethene)",
        bullets: [
          "Crates, ropes, carpets, food containers",
          "Can be moulded and drawn into fibres",
        ],
        cues: ["crates", "ropes", "carpets"],
      },
      {
        id: "sum",
        kind: "summary",
        weight: 0.14,
        eyebrow: "Compare",
        heading: "Ethene vs propene polymers",
        bullets: [
          "Same addition process; different side group",
          "Side group changes strength and melting behaviour",
        ],
        cues: ["compare", "difference"],
      },
    ],
  },
  {
    id: "04-polyester",
    compositionId: "Polyester",
    title: "Polyester by Condensation",
    audioCandidates: [
      "04-polyester.mp3",
      "polyester.mp3",
      "condensation.mp3",
      "04.mp3",
      "video4.mp3",
    ],
    series: "JD Science · GCSE Chemistry · Polymers",
    scenes: [
      {
        id: "t",
        kind: "title",
        weight: 0.1,
        eyebrow: "Lesson 4",
        heading: "Polyesters",
        body: "Condensation polymerisation — and water is lost",
        cues: ["polyester", "condensation"],
      },
      {
        id: "def",
        kind: "definition",
        weight: 0.16,
        eyebrow: "Idea",
        heading: "Two monomers, one small molecule out",
        bullets: [
          "Diol provides –OH groups",
          "Dicarboxylic acid provides –COOH groups",
          "Ester link forms; H₂O is eliminated",
        ],
        cues: ["diol", "acid", "ester", "water"],
      },
      {
        id: "form1",
        kind: "polyester",
        weight: 0.2,
        eyebrow: "Formation",
        heading: "Diol + dicarboxylic acid",
        body: "stage-0",
        cues: ["react", "join"],
      },
      {
        id: "form2",
        kind: "polyester",
        weight: 0.18,
        eyebrow: "Formation",
        heading: "Ester link and water",
        body: "stage-2",
        cues: ["ester", "water", "eliminated"],
      },
      {
        id: "uses",
        kind: "uses",
        weight: 0.18,
        eyebrow: "Uses",
        heading: "Where polyesters appear",
        bullets: [
          "Clothes and fabrics (PET fibres)",
          "Plastic bottles (PET)",
          "Can be recycled; condensation is reversible in principle",
        ],
        cues: ["bottles", "fabric", "PET"],
      },
      {
        id: "sum",
        kind: "summary",
        weight: 0.18,
        eyebrow: "Exam tip",
        heading: "Addition vs condensation checklist",
        bullets: [
          "Addition: C=C monomers, one product",
          "Condensation: two functional groups, small molecule lost",
          "Name the link: C–C chain vs ester link",
        ],
        cues: ["addition", "condensation", "remember"],
      },
    ],
  },
];
