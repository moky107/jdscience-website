import { composeScience } from "./compose.mjs";
import { shortQ, calcQ } from "./exam.mjs";

const F = (term, define, describe, explain, apply) => ({ term, define, describe, explain, apply });

function pack(ctx, data) {
  return composeScience(ctx, data);
}

function chemistryUnitFn(topicId, board) {
  const units = {
    AQA: {
      "unit-1": atomic,
      "unit-2": bonding,
      "unit-3": quantitative,
      "unit-4": chemicalChanges,
      "unit-5": energyChem,
      "unit-6": rates,
      "unit-7": organicGcse,
      "unit-8": analysis,
      "unit-9": atmosphere,
      "unit-10": resources,
    },
    Edexcel: {
      "unit-1": quantitative,
      "unit-2": bonding,
      "unit-3": chemicalChanges,
      "unit-4": chemicalChanges,
      "unit-5": organicGcse,
      "unit-6": analysis,
    },
    OCR: {
      "unit-1": atomic,
      "unit-2": bonding,
      "unit-3": chemicalChanges,
      "unit-4": analysis,
      "unit-5": rates,
      "unit-6": resources,
    },
    WJEC: {
      "unit-1": atomic,
      "unit-2": atomic,
      "unit-3": resources,
      "unit-4": atmosphere,
      "unit-5": rates,
      "unit-6": organicGcse,
      "unit-7": analysis,
    },
  };
  return units[board]?.[topicId] || null;
}

export function buildScience(topicId, ctx) {
  if (ctx.level === "GCSE/IGCSE" && ctx.subject === "Chemistry") {
    const unitFn = chemistryUnitFn(topicId, ctx.board);
    if (unitFn) return unitFn(ctx);
  }

  const table = {
    // GCSE Biology
    "cell-biology": () => cells(ctx, "animal and plant cells, microscopy and transport"),
    "key-concepts": () => cells(ctx, "Edexcel key concepts: cells, enzymes and transport"),
    "b1-cell-level-systems": () => cells(ctx, "OCR B1 cell-level systems"),
    "cells-tissues-organs": () => cells(ctx, "WJEC cells, tissues and organs"),
    organisation: () => organisation(ctx),
    "b2-scaling-up": () => organisation(ctx),
    "infection-and-response": () => infection(ctx),
    "health-and-disease": () => infection(ctx),
    "disease-and-immunity": () => infection(ctx),
    bioenergetics: () => bioenergetics(ctx),
    "plant-structures": () => bioenergetics(ctx),
    "respiration-photosynthesis": () => bioenergetics(ctx),
    "homeostasis-and-response": () => homeostasis(ctx),
    "cells-and-control": () => homeostasis(ctx),
    "animal-coordination": () => homeostasis(ctx),
    "nervous-hormonal-control": () => homeostasis(ctx),
    "b3-organism-level-systems": () => homeostasis(ctx),
    "inheritance-variation-evolution": () => genetics(ctx),
    genetics: () => genetics(ctx),
    "natural-selection-gm": () => genetics(ctx),
    "b5-genes-inheritance": () => genetics(ctx),
    "inheritance-and-variation": () => genetics(ctx),
    ecology: () => ecology(ctx),
    ecosystems: () => ecology(ctx),
    "b4-community-level-systems": () => ecology(ctx),
    "b6-global-challenges": () => ecology(ctx),
    "ecology-and-environment": () => ecology(ctx),
    "exchange-and-transport": () => exchange(ctx),
    "digestion-circulation": () => exchange(ctx),

    // GCSE Chemistry
    "atomic-structure-periodic-table": () => atomic(ctx),
    "c1-particles": () => atomic(ctx),
    "nature-of-substances": () => atomic(ctx),
    "bonding-structure-properties": () => bonding(ctx),
    "c2-elements-compounds-mixtures": () => bonding(ctx),
    "states-and-mixtures": () => bonding(ctx),
    "quantitative-chemistry": () => quantitative(ctx),
    "chemical-changes": () => chemicalChanges(ctx),
    "c3-chemical-reactions": () => chemicalChanges(ctx),
    "extracting-metals-equilibria": () => chemicalChanges(ctx),
    "energy-changes": () => energyChem(ctx),
    "rate-and-extent": () => rates(ctx),
    "rates-of-reaction": () => rates(ctx),
    "c5-monitoring-reactions": () => rates(ctx),
    "organic-chemistry": () => organicGcse(ctx),
    "organic-chemistry-fuels": () => organicGcse(ctx),
    "separate-chemistry-1": () => organicGcse(ctx),
    "separate-chemistry-2": () => analysis(ctx),
    "chemical-analysis": () => analysis(ctx),
    "c4-predicting-reactions": () => analysis(ctx),
    "chemistry-of-atmosphere": () => atmosphere(ctx),
    "earth-and-atmosphere": () => atmosphere(ctx),
    "using-resources": () => resources(ctx),
    "c6-global-challenges": () => resources(ctx),
    "water-and-solutions": () => resources(ctx),
    "key-concepts": null, // handled above for biology; chemistry key-concepts below

    // GCSE Physics
    energy: () => energyPhys(ctx),
    "conservation-of-energy": () => energyPhys(ctx),
    "energy-forces-work": () => energyPhys(ctx),
    "p5-energy": () => energyPhys(ctx),
    "electricity-energy-waves": () => electricity(ctx),
    electricity: () => electricity(ctx),
    "electricity-and-circuits": () => electricity(ctx),
    "p3-electricity-and-magnetism": () => electricity(ctx),
    "particle-model": () => particles(ctx),
    "p1-matter": () => particles(ctx),
    "particles-and-kinetic-theory": () => particles(ctx),
    "atomic-structure": () => radioactivity(ctx),
    radioactivity: () => radioactivity(ctx),
    "radioactivity-and-half-life": () => radioactivity(ctx),
    "p4-waves-and-radioactivity": () => waves(ctx),
    waves: () => waves(ctx),
    "light-and-em-spectrum": () => waves(ctx),
    forces: () => forces(ctx),
    "motion-and-forces": () => forces(ctx),
    "forces-and-motion": () => forces(ctx),
    "p2-forces": () => forces(ctx),
    "magnetism-electromagnetism": () => magnetism(ctx),
    "magnetism-induction": () => magnetism(ctx),
    "magnetism-and-electromagnetism": () => magnetism(ctx),
    "space-physics": () => space(ctx),
    astronomy: () => space(ctx),
    "space-and-the-universe": () => space(ctx),
    "p6-global-challenges": () => space(ctx),
    "key-concepts-physics": () => energyPhys(ctx),

    // A-Level Biology
    "biological-molecules": () => alvlMolecules(ctx),
    "biological-molecules-and-cells": () => alvlMolecules(ctx),
    cells: () => alvlCells(ctx),
    "module-2-foundations": () => alvlMolecules(ctx),
    "basic-biochemistry-cells": () => alvlMolecules(ctx),
    exchange: () => alvlExchange(ctx),
    "exchange-and-transport": () => alvlExchange(ctx),
    "module-3-exchange-transport": () => alvlExchange(ctx),
    "biodiversity-physiology": () => alvlExchange(ctx),
    "genetic-information": () => alvlGenetics(ctx),
    "genetics-and-variation": () => alvlGenetics(ctx),
    "module-4-biodiversity": () => alvlGenetics(ctx),
    "continuity-of-life": () => alvlGenetics(ctx),
    "energy-transfers": () => alvlEnergy(ctx),
    "energy-and-ecosystems": () => alvlEnergy(ctx),
    "respiration-and-photosynthesis": () => alvlEnergy(ctx),
    "energy-for-life": () => alvlEnergy(ctx),
    "requirements-for-life": () => alvlEnergy(ctx),
    "organisms-respond": () => alvlControl(ctx),
    "control-and-coordination": () => alvlControl(ctx),
    "module-5-communication": () => alvlControl(ctx),
    "genetics-populations": () => alvlPopulations(ctx),
    "evolution-and-speciation": () => alvlPopulations(ctx),
    "module-6-genetics": () => alvlPopulations(ctx),
    "control-of-gene-expression": () => alvlGeneExpression(ctx),
    "health-and-disease": () => infection(ctx),

    // A-Level Chemistry
    "physical-chemistry-1": () => alvlPhysical1(ctx),
    "physical-chemistry": () => alvlPhysical1(ctx),
    "topic-1-4-physical": () => alvlPhysical1(ctx),
    "module-2-foundations": () => alvlPhysical1(ctx),
    "physical-chemistry-2": () => alvlPhysical2(ctx),
    "topic-5-8-physical": () => alvlPhysical2(ctx),
    "physical-chemistry-3": () => alvlPhysical3(ctx),
    "module-5-physical-chemistry": () => alvlPhysical3(ctx),
    "inorganic-chemistry": () => alvlInorganic(ctx),
    "module-3-periodic-table": () => alvlInorganic(ctx),
    "organic-chemistry-1": () => alvlOrganic(ctx),
    "organic-core": () => alvlOrganic(ctx),
    "module-4-core-organic": () => alvlOrganic(ctx),
    "organic-chemistry": () => alvlOrganic(ctx),
    "organic-chemistry-2": () => alvlAnalysisChem(ctx),
    "organic-modern": () => alvlAnalysisChem(ctx),
    "module-6-organic-analysis": () => alvlAnalysisChem(ctx),
    "analytical-chemistry": () => alvlAnalysisChem(ctx),

    // A-Level Physics
    "particles-and-radiation": () => alvlParticles(ctx),
    "nuclear-and-particle": () => alvlParticles(ctx),
    "module-6-particles-and-fields": () => alvlParticles(ctx),
    waves: () => alvlWaves(ctx),
    "materials-and-waves": () => alvlWaves(ctx),
    "module-4-electrons-waves-photons": () => alvlWaves(ctx),
    "electricity-and-waves": () => alvlWaves(ctx),
    "mechanics-and-materials": () => alvlMechanics(ctx),
    mechanics: () => alvlMechanics(ctx),
    "module-3-forces": () => alvlMechanics(ctx),
    "module-2-foundations": () => alvlMechanics(ctx),
    electricity: () => alvlElectricity(ctx),
    "electric-circuits": () => alvlElectricity(ctx),
    "further-mechanics-thermal": () => alvlFurtherMech(ctx),
    "further-mechanics": () => alvlFurtherMech(ctx),
    thermodynamics: () => alvlFurtherMech(ctx),
    "thermal-and-nuclear": () => alvlNuclear(ctx),
    fields: () => alvlFields(ctx),
    "fields-and-particles": () => alvlFields(ctx),
    "nuclear-physics": () => alvlNuclear(ctx),
    astrophysics: () => alvlAstro(ctx),
    space: () => alvlAstro(ctx),
    "module-5-newtonian-world": () => alvlAstro(ctx),
  };

  // Disambiguate GCSE Chemistry key-concepts vs Biology
  if (topicId === "key-concepts" && ctx.subject === "Chemistry") return quantitative(ctx);
  if (topicId === "key-concepts" && ctx.subject === "Physics") return energyPhys(ctx);
  if (topicId === "key-concepts" && ctx.subject === "Biology") return cells(ctx, "key concepts in biology");
  if (topicId === "module-2-foundations") {
    if (ctx.subject === "Biology") return alvlMolecules(ctx);
    if (ctx.subject === "Chemistry") return alvlPhysical1(ctx);
    if (ctx.subject === "Physics") return alvlMechanics(ctx);
  }
  if (topicId === "health-and-disease" && ctx.level === "A-Level") return alvlGenetics(ctx);
  if (topicId === "exchange-and-transport" && ctx.level === "A-Level") return alvlExchange(ctx);
  if (topicId === "waves" && ctx.level === "A-Level") return alvlWaves(ctx);
  if (topicId === "electricity" && ctx.level === "A-Level") return alvlElectricity(ctx);
  if (topicId === "fields" && ctx.level === "A-Level") return alvlFields(ctx);

  const fn = table[topicId];
  if (!fn) throw new Error(`No science pack for ${ctx.level} ${ctx.subject} ${topicId}`);
  return fn();
}

function calcSet(items) {
  return items.map(([stem, answer, method]) => ({ stem, answer, marks: 3, method: method || [] }));
}

function cells(ctx, focus) {
  const mag = ctx.n(400, 50);
  const image = ctx.n(8, 1);
  return pack(ctx, {
    facts: [
      F("a eukaryotic cell", "a cell with a nucleus / membrane-bound organelles", "has nucleus, mitochondria, cytoplasm, cell membrane", "why muscle cells contain many mitochondria", "ATP is needed for contraction"),
      F("a prokaryotic cell", "a cell with no nucleus, DNA free in the cytoplasm", "has cell wall, chromosomal DNA, plasmids, flagella", "why bacteria can transfer plasmids", "antibiotic resistance genes can spread"),
      F("the nucleus", "organelle that contains DNA / controls the cell", "surrounded by a nuclear membrane, contains chromosomes", "why a red blood cell has no nucleus when mature", "more room for haemoglobin"),
      F("the cell membrane", "partially permeable barrier around the cell", "controls what enters and leaves", "why osmosis needs a partially permeable membrane", "water moves down a water potential gradient"),
      F("a chloroplast", "organelle where photosynthesis occurs", "contains chlorophyll and membranes", "why root hair cells have no chloroplasts", "roots are underground / no light"),
      F("diffusion", "net movement of particles from high to low concentration", "passive, no energy from respiration", "why gas exchange uses diffusion", "alveoli have a steep gradient"),
      F("osmosis", "net movement of water from dilute to concentrated solution through a partially permeable membrane", "special case of diffusion of water", "why a potato chip shrinks in concentrated sugar solution", "water leaves the cells"),
      F("active transport", "movement against a concentration gradient using energy", "requires carrier proteins and ATP", "why root hair cells use active transport for minerals", "soil concentration is lower than inside the cell"),
      F("mitosis", "cell division producing two genetically identical diploid cells", "used for growth and repair", "why DNA must replicate before mitosis", "so each daughter cell has a full set"),
      F("a stem cell", "an undifferentiated cell that can divide and specialise", "embryonic stem cells are more versatile than adult stem cells", "evaluate the use of embryonic stem cells", "can treat conditions but there are ethical issues"),
    ],
    calcs: calcSet([
      [`A cell image is ${image} mm across. The actual cell is 0.02 mm. Calculate the magnification.`, `${(image / 0.02).toFixed(0)}`, ["magnification = image size ÷ actual size"]],
      [`Magnification is ×${mag}. The image is 20 mm. Calculate the actual size in µm.`, `${((20 / mag) * 1000).toFixed(2)} µm`, ["actual = image ÷ mag; 1 mm = 1000 µm"]],
      [`A cube cell of side ${ctx.n(2, 1)} mm has what surface area to volume ratio?`, `${(6 * ctx.n(2, 1) ** 2) / (ctx.n(2, 1) ** 3)} : 1`, ["SA = 6a², V = a³"]],
      [`A microscope uses a ×10 eyepiece and a ×${ctx.n(40, 10)} objective. What is the total magnification?`, `×${10 * ctx.n(40, 10)}`, ["multiply the two lenses"]],
      [`${ctx.student} counts 24 cells in a 0.004 mm³ haemocytometer square. Estimate the number of cells in 1 mm³.`, `${24 / 0.004}`, ["scale up"]],
      [`A cell divides by mitosis every 2 hours. Starting from 1 cell, how many cells after 8 hours?`, "16", ["4 divisions, 2⁴"]],
    ]),
    practicals: [
      { name: "the microscopy required practical to view onion epidermis", iv: "not always applicable / stain used", dv: "clarity of organelles seen", control: "same light intensity / same stain time", error: ["cells overlapping", "count only single-layer cells"] },
      { name: "the osmosis required practical with potato cylinders", iv: "concentration of sugar solution", dv: "change in mass / length", control: "same temperature, same start length, blot dry", error: ["surface water left on the potato changes mass"] },
      { name: "an investigation of diffusion in agar cubes with indicator", iv: "cube size / concentration", dv: "time for colour to disappear", control: "same temperature", error: ["cubes not identical size"] },
      { name: "preparing a cheek-cell slide", iv: "n/a", dv: "quality of the image", control: "thin layer of cells", error: ["too many cells / air bubbles"] },
    ],
    compares: [
      { a: "diffusion", b: "active transport", points: ["diffusion is down the gradient / passive", "active transport is against the gradient / needs ATP"] },
      { a: "animal cells", b: "plant cells", points: ["both have nucleus, cytoplasm, membrane, mitochondria", "only plant cells have cell wall, chloroplasts, permanent vacuole"] },
      { a: "mitosis", b: "meiosis", points: ["mitosis: two identical diploid cells", "meiosis: four haploid genetically different cells"] },
      { a: "embryonic stem cells", b: "adult stem cells", points: ["embryonic can become most cell types", "adult are more limited / fewer ethical issues"] },
    ],
    extended: [
      { title: `Evaluate the use of stem cells in medicine. Refer to ${focus}.`, points: ["can replace damaged cells / treat paralysis or diabetes", "embryonic cells raise ethical issues", "risk of rejection / tumour formation", "adult stem cells already used for bone marrow transplants", "conclusion with a judgement"] },
      { title: "Explain how the structures of a root hair cell and a palisade cell relate to their functions.", points: ["root hair: large SA for uptake, mitochondria for active transport", "palisade: many chloroplasts, high in the leaf for light"] },
    ],
    extras: [
      shortQ(`This ${ctx.board} worksheet is about ${focus}. State two safety rules when using a microscope and a stain.`, 2, ["do not use the coarse focus on high power", "stains may be irritant / wear eye protection"]),
    ],
  });
}

function organisation(ctx) {
  return pack(ctx, {
    facts: [
      F("a tissue", "a group of similar cells with the same function", "e.g. muscle tissue, xylem", "why tissues are organised into organs", "organs contain several tissues working together"),
      F("an organ system", "a group of organs that work together", "e.g. digestive system", "why the digestive system needs several organs", "each organ carries out a different stage"),
      F("an enzyme", "a biological catalyst / protein that speeds up a reaction", "has an active site complementary to the substrate", "why enzymes are specific", "lock and key / induced fit"),
      F("the lock and key theory", "the substrate fits the active site exactly", "forms an enzyme-substrate complex", "why a change in pH reduces rate", "active site denatures / shape changes"),
      F("bile", "alkaline fluid made in the liver and stored in the gall bladder", "emulsifies fats and neutralises stomach acid", "why emulsification increases fat digestion", "larger surface area for lipase"),
      F("the small intestine", "organ where most digested food is absorbed", "has villi and microvilli", "why villi increase absorption", "large SA, thin wall, good blood supply"),
      F("the heart", "a muscular pump with four chambers", "double circulatory system in mammals", "why a double circulatory system is an advantage", "blood is pumped to the body at higher pressure"),
      F("an artery", "a vessel that carries blood away from the heart", "thick muscular wall, small lumen, high pressure", "why arteries have thick walls", "withstand high pressure"),
      F("a vein", "a vessel that carries blood towards the heart", "thin wall, large lumen, valves", "why veins have valves", "prevent backflow at low pressure"),
      F("a capillary", "a narrow vessel for exchange", "one cell thick wall", "why capillaries are one cell thick", "short diffusion path"),
    ],
    calcs: calcSet([
      [`A person breathes 12 times a minute, 0.5 dm³ each breath. Calculate the volume breathed in 1 hour.`, "360 dm³", ["12 × 0.5 × 60"]],
      [`Heart rate is ${ctx.n(70, 5)} bpm and stroke volume is 70 cm³. Calculate cardiac output.`, `${ctx.n(70, 5) * 70} cm³/min`, ["CO = HR × SV"]],
      [`An enzyme reaction produces 24 cm³ of gas in 2 minutes. Calculate the mean rate in cm³/s.`, "0.2 cm³/s", ["24/120"]],
      [`A villus is 1 mm long and there are about 20 per mm². Estimate how many villi on 1 m² of intestine.`, "2 × 10¹⁰", ["unit conversions"]],
      [`Blood travels 1.5 m in 1.2 s in an artery. Calculate the mean speed.`, "1.25 m/s", ["s = d/t"]],
      [`A patient has a breathing rate of 15 /min. How many breaths in a day?`, "21600", ["15×60×24"]],
    ]),
    practicals: [
      { name: "the enzyme required practical (amylase and starch / catalase)", iv: "pH or temperature", dv: "time for starch to disappear / volume of O₂", control: "same enzyme volume, same substrate concentration", error: ["spotting delays / temperature not constant"] },
      { name: "food tests for sugar, starch, protein and lipid", iv: "food sample", dv: "colour change", control: "same volume of reagent", error: ["not heating Benedict's for long enough"] },
      { name: "investigating the effect of pH on amylase", iv: "pH", dv: "time to end-point with iodine", control: "water bath temperature", error: ["not sampling at regular intervals"] },
      { name: "dissecting a heart or looking at a heart model", iv: "n/a", dv: "identification of chambers and vessels", control: "follow safety rules", error: ["confusing pulmonary artery with aorta"] },
    ],
    compares: [
      { a: "arteries", b: "veins", points: ["arteries: high pressure, thick wall", "veins: valves, large lumen"] },
      { a: "the small intestine", b: "the large intestine", points: ["small: digestion and absorption of nutrients", "large: absorption of water"] },
      { a: "a communicable disease", b: "a non-communicable disease", points: ["communicable: caused by a pathogen and can be spread", "non-communicable: e.g. CHD, not spread between people"] },
      { a: "aerobic exercise effects", b: "long-term training effects on the heart", points: ["short term: heart rate rises", "long term: larger stroke volume / lower resting HR"] },
    ],
    extended: [
      { title: "Explain how the digestive system is adapted to break down and absorb starch.", points: ["amylase in saliva and pancreas", "maltase on the small intestine lining", "villi increase SA", "glucose absorbed into blood"] },
      { title: "Explain how the structure of the heart and blood vessels allows a double circulatory system to function.", points: ["right side to lungs, left side to body", "left ventricle thicker", "valves prevent backflow", "arteries/veins/capillaries have matching structures"] },
    ],
  });
}

function infection(ctx) {
  return pack(ctx, {
    facts: [
      F("a pathogen", "a microorganism that causes disease", "bacteria, viruses, fungi, protists", "why viruses are not treated with antibiotics", "viruses live inside cells / antibiotics target bacterial processes"),
      F("a virus", "a pathogen that reproduces inside cells", "much smaller than bacteria", "why viral diseases cause cell damage", "cells burst when new viruses are released"),
      F("a bacterium", "a prokaryotic pathogen that can produce toxins", "reproduces by binary fission", "why some bacterial diseases make you feel ill", "toxins damage tissues"),
      F("a vaccine", "dead or inactive pathogen / antigen introduced to the body", "stimulates white blood cells to make antibodies and memory cells", "why a second exposure gives a faster response", "memory cells"),
      F("herd immunity", "a large proportion of the population is immune so the pathogen cannot spread easily", "protects people who cannot be vaccinated", "why vaccination programmes aim for high uptake", "breaks chains of infection"),
      F("an antibiotic", "a drug that kills bacteria or stops them growing", "does not work on viruses", "why overuse of antibiotics is a problem", "resistant strains are selected"),
      F("a white blood cell", "a cell that defends the body", "phagocytosis, antibodies, antitoxins", "why antibodies are specific", "complementary shape to the antigen"),
      F("phagocytosis", "engulfing and digesting a pathogen", "done by phagocytes", "why this is a non-specific defence", "works against many pathogens"),
      F("the first line of defence", "barriers that stop pathogens entering", "skin, mucus, cilia, stomach acid", "why a cut increases infection risk", "barrier is broken"),
      F("a clinical trial", "testing a drug for safety and effectiveness", "preclinical, then healthy volunteers, then patients, then larger trials", "why a placebo and double-blind trial are used", "reduces bias"),
    ],
    calcs: calcSet([
      [`A bacterium divides every 20 minutes. Starting from 1 cell, how many after 2 hours?`, "64", ["6 divisions"]],
      [`A vaccine trial has 200 people. 6 have a serious side effect. Calculate the percentage.`, "3%", ["6/200 × 100"]],
      [`Antibody concentration rises from 2 units to 50 units. Calculate the percentage increase.`, "2400%", ["48/2 × 100"]],
      [`A Petri dish colony count is 120 in 0.1 cm³. Estimate colonies in 5 cm³.`, "6000", ["×50"]],
      [`An antibiotic zone of inhibition has diameter ${ctx.n(18, 2)} mm. Calculate the area (π=3.14).`, `${(3.14 * (ctx.n(18, 2) / 2) ** 2).toFixed(1)} mm²`, ["πr²"]],
      [`A pathogen generation time is 30 minutes. How many generations in 5 hours?`, "10", ["300/30"]],
    ]),
    practicals: [
      { name: "growing bacteria on agar using aseptic technique", iv: "antibiotic type / disinfectant concentration", dv: "zone of inhibition / colony number", control: "same incubation temperature and time", error: ["contamination from unsterile loops"] },
      { name: "testing the effectiveness of disinfectants", iv: "disinfectant", dv: "zone of inhibition", control: "same volume on each disc", error: ["discs not equally soaked"] },
      { name: "investigating the effect of antibiotics on bacterial growth", iv: "antibiotic", dv: "clear zone diameter", control: "same bacterial lawn", error: ["measuring diameter inaccurately"] },
      { name: "handwashing comparison with agar plates", iv: "washing method", dv: "number of colonies", control: "same incubation", error: ["unequal contact time with the agar"] },
    ],
    compares: [
      { a: "antibiotics", b: "painkillers", points: ["antibiotics kill bacteria", "painkillers treat symptoms only"] },
      { a: "active immunity", b: "passive immunity", points: ["active: memory cells, long-term", "passive: antibodies given, short-term"] },
      { a: "bacteria", b: "viruses", points: ["bacteria are cells and can be killed by antibiotics", "viruses are not cells and need living hosts"] },
      { a: "preclinical testing", b: "clinical testing", points: ["preclinical: cells and animals", "clinical: human volunteers and patients"] },
    ],
    extended: [
      { title: "Evaluate vaccination as a way of preventing the spread of a disease.", points: ["herd immunity", "side effects / rare risks", "cost and uptake", "does not treat people already ill", "overall judgement"] },
      { title: "Explain how the body defends itself against a bacterial pathogen and why antibiotics can help.", points: ["barriers", "phagocytosis and antibodies", "antibiotics kill bacteria", "do not damage viruses / resistance risk"] },
    ],
  });
}

function bioenergetics(ctx) {
  return pack(ctx, {
    facts: [
      F("photosynthesis", "endothermic reaction that uses light to make glucose from CO₂ and water", "occurs in chloroplasts", "why the rate levels off at high light intensity", "another factor is limiting"),
      F("a limiting factor", "a factor in shortest supply that holds the rate down", "light, CO₂ or temperature for photosynthesis", "why growers increase CO₂ in a greenhouse", "increases rate / yield"),
      F("chlorophyll", "green pigment that absorbs light", "found in chloroplasts", "why a plant with yellow leaves photosynthesises more slowly", "less chlorophyll"),
      F("glucose in plants", "product used for respiration, stored as starch, used to make cellulose, proteins and oils", "can be converted to sucrose for transport", "why a starch test is used after a photosynthesis experiment", "starch is a storage product of photosynthesis"),
      F("aerobic respiration", "exothermic reaction using oxygen to release energy from glucose", "produces CO₂ and water", "why more energy is released than in anaerobic respiration", "glucose is fully broken down"),
      F("anaerobic respiration in muscle", "incomplete breakdown of glucose without oxygen, producing lactic acid", "releases less energy", "why an oxygen debt builds up", "lactic acid must be oxidised later"),
      F("anaerobic respiration in yeast", "fermentation producing ethanol and CO₂", "used in bread and alcohol", "why bread rises", "CO₂ bubbles"),
      F("the stomata", "pores in the leaf that allow gas exchange", "opened and closed by guard cells", "why stomata close on a hot day", "reduce water loss"),
      F("xylem", "tissue that transports water and minerals from roots to leaves", "dead lignified cells, one-way flow", "why transpiration pull moves water", "evaporation from leaves"),
      F("phloem", "tissue that transports dissolved sugars", "translocation in both directions", "why a ringing experiment stops sugar reaching roots", "phloem is removed"),
    ],
    calcs: calcSet([
      [`A plant produces 12 cm³ of oxygen in 4 minutes. Calculate the rate.`, "3 cm³/min", ["12/4"]],
      [`Light intensity is estimated as 1/d². If d = ${ctx.n(20, 5)} cm, calculate 1/d².`, `${(1 / ctx.n(20, 5) ** 2).toExponential(2)}`, ["inverse square"]],
      [`Respiration releases 1200 J from 0.5 g of glucose. Calculate J per gram.`, "2400 J/g", []],
      [`A leaf loses 0.8 g of water in 10 minutes. Calculate the transpiration rate in g/h.`, "4.8 g/h", ["×6"]],
      [`Temperature rises from 10°C to 20°C and rate doubles. What would you expect from 20°C to 30°C if Q10 = 2, before denaturation?`, "rate doubles again", ["Q10 idea"]],
      [`A potometer air bubble moves ${ctx.n(24, 4)} mm in 2 minutes. Calculate the mean speed.`, `${(ctx.n(24, 4) / 2).toFixed(1)} mm/min`, []],
    ]),
    practicals: [
      { name: "the photosynthesis required practical with pondweed", iv: "light intensity / colour / CO₂", dv: "bubbles per minute / volume of O₂", control: "temperature, same length of pondweed", error: ["bubbles not the same size"] },
      { name: "testing a leaf for starch", iv: "whether the leaf was destarched / covered", dv: "iodine colour", control: "same boiling time in ethanol", error: ["not destarching the plant first"] },
      { name: "the potometer transpiration practical", iv: "wind / temperature / humidity / light", dv: "distance moved by the bubble", control: "same leafy shoot", error: ["air leak in the apparatus"] },
      { name: "investigating respiration with germinating seeds and limewater or a respirometer", iv: "alive vs boiled seeds", dv: "CO₂ produced / volume change", control: "same mass of seeds", error: ["temperature change affects gas volume"] },
    ],
    compares: [
      { a: "photosynthesis", b: "aerobic respiration", points: ["photosynthesis stores energy / endothermic", "respiration releases energy / exothermic", "equations are reverse"] },
      { a: "xylem", b: "phloem", points: ["xylem: water, one way, dead", "phloem: sugars, both ways, living"] },
      { a: "aerobic respiration", b: "anaerobic respiration in muscle", points: ["aerobic: more ATP, CO₂ + water", "anaerobic: lactic acid, oxygen debt"] },
      { a: "a palisade cell", b: "a guard cell", points: ["palisade: photosynthesis", "guard cell: controls stomatal opening"] },
    ],
    extended: [
      { title: "Explain how a leaf is adapted for photosynthesis and gas exchange.", points: ["large SA", "thin", "palisade chloroplasts", "stomata and air spaces", "xylem water supply"] },
      { title: "A farmer wants to increase the rate of photosynthesis in a greenhouse. Evaluate the methods available.", points: ["more light / lamps", "paraffin heaters add heat and CO₂", "cost vs yield", "too hot denatures enzymes"] },
    ],
  });
}

function homeostasis(ctx) {
  return pack(ctx, {
    facts: [
      F("homeostasis", "maintaining a constant internal environment", "includes temperature, blood glucose, water", "why homeostasis is needed", "enzymes work best in a narrow range"),
      F("a receptor", "a cell that detects a stimulus", "part of a reflex arc", "why receptors are specific", "each detects a particular stimulus"),
      F("a reflex arc", "a rapid automatic response that does not involve conscious thought", "receptor → sensory neurone → synapse in CNS → motor neurone → effector", "why reflexes are fast", "bypass the conscious brain"),
      F("a synapse", "a gap between two neurones", "neurotransmitter diffuses across", "why synapses only transmit in one direction", "transmitter is released from one side only"),
      F("the eye", "sense organ that detects light", "retina contains receptors", "why the pupil changes size", "controls light entering the eye"),
      F("accommodation", "changing the lens shape to focus near or distant objects", "ciliary muscles and suspensory ligaments", "why a convex lens is needed for long sight", "to increase refraction"),
      F("insulin", "hormone from the pancreas that lowers blood glucose", "causes glucose to be stored as glycogen in the liver", "why Type 1 diabetes is treated with insulin", "the pancreas does not produce enough insulin"),
      F("glucagon", "hormone that raises blood glucose", "glycogen converted to glucose", "why insulin and glucagon are antagonistic", "they have opposite effects"),
      F("Type 2 diabetes", "the body cells no longer respond properly to insulin", "linked to obesity", "why exercise and diet are first treatments", "improve insulin sensitivity / reduce glucose intake"),
      F("auxin", "plant hormone that controls phototropism", "uneven distribution causes bending towards light", "why shoots are positively phototropic", "more growth on the shaded side"),
    ],
    calcs: calcSet([
      [`A reflex takes 0.018 s to travel 1.8 m. Calculate the speed of the impulse.`, "100 m/s", ["1.8/0.018"]],
      [`Blood glucose rises from 4.0 to ${ctx.n(6.2, 0.2)} mmol/dm³. Calculate the percentage increase.`, `${(((ctx.n(6.2, 0.2) - 4) / 4) * 100).toFixed(0)}%`, []],
      [`A person produces 1.5 dm³ of urine a day. How much in a week?`, "10.5 dm³", []],
      [`Reaction time is 0.28 s. How far does a car travelling at 15 m/s travel in that time?`, "4.2 m", ["s=vt"]],
      [`A plant shoot bends 12° in 40 minutes. Calculate the mean rate.`, "0.3 °/min", []],
      [`Body temperature falls from 37.0°C to 35.5°C. Calculate the drop as a percentage of 37.0°C.`, "4.05%", ["1.5/37 × 100"]],
    ]),
    practicals: [
      { name: "the reaction-time practical (ruler drop)", iv: "practice / caffeine / distraction", dv: "catch distance / calculated time", control: "same ruler, same hand", error: ["anticipating the drop"] },
      { name: "investigating phototropism with seedlings", iv: "direction of light", dv: "direction of growth", control: "same species and age", error: ["pots not rotated equally in the control"] },
      { name: "testing urine or a model for glucose", iv: "sample", dv: "Benedict's colour", control: "same heating time", error: ["not using a water bath safely"] },
      { name: "the human nervous system observation of pupil reflex (light)", iv: "light intensity", dv: "pupil diameter", control: "same eye, same starting light", error: ["measuring a moving pupil"] },
    ],
    compares: [
      { a: "the nervous system", b: "the endocrine system", points: ["nervous: fast, electrical, short-lived", "endocrine: slower, chemical hormones, longer lasting"] },
      { a: "Type 1 diabetes", b: "Type 2 diabetes", points: ["Type 1: no insulin produced, insulin injections", "Type 2: cells do not respond, diet/exercise/drugs"] },
      { a: "rods", b: "cones", points: ["rods: low light, black and white", "cones: colour, bright light"] },
      { a: "phototropism", b: "gravitropism", points: ["phototropism is a response to light", "gravitropism is a response to gravity"] },
    ],
    extended: [
      { title: "Explain how blood glucose concentration is controlled and what happens if the system fails.", points: ["pancreas detects change", "insulin / glucagon", "liver glycogen", "diabetes consequences"] },
      { title: "Describe a reflex arc and explain why it is an advantage for survival.", points: ["full pathway", "fast / automatic", "protects from harm"] },
    ],
  });
}

function genetics(ctx) {
  return pack(ctx, {
    facts: [
      F("a gene", "a section of DNA that codes for a protein / sequence of amino acids", "found on a chromosome", "why a change in a gene can change a protein", "different amino acid sequence"),
      F("an allele", "a different version of a gene", "can be dominant or recessive", "why a recessive characteristic only shows if two copies are present", "dominant allele would mask it"),
      F("a chromosome", "a long molecule of DNA that contains many genes", "humans have 23 pairs", "why gametes are haploid", "so fertilisation restores the diploid number"),
      F("meiosis", "cell division that produces four haploid gametes that are genetically different", "two divisions", "why meiosis causes variation", "independent assortment and crossing over"),
      F("a mutation", "a random change in DNA", "may be harmful, beneficial or have no effect", "why a mutation in a body cell is not passed to children", "only mutations in gametes are inherited"),
      F("natural selection", "process where individuals with advantageous alleles are more likely to survive and reproduce", "allele becomes more common", "why antibiotic resistance evolves", "resistant bacteria survive and breed"),
      F("genetic engineering", "transferring a gene from one organism to another", "e.g. insulin produced by bacteria", "evaluate GM crops", "higher yield vs ethical / ecological concerns"),
      F("a Punnett square", "a diagram that shows the possible genotypes of offspring", "used to predict ratios", "why actual ratios may differ from predicted", "fertilisation is random / small sample"),
      F("genotype", "the alleles an organism has", "e.g. Bb", "why two organisms can have the same phenotype but different genotypes", "BB and Bb both show the dominant characteristic"),
      F("sexual reproduction", "fusion of male and female gametes", "produces variation", "why asexual reproduction produces clones", "only mitosis / one parent"),
    ],
    calcs: calcSet([
      [`In a monohybrid cross Bb × Bb, what fraction of offspring are expected to be recessive?`, "1/4", ["Punnett square"]],
      [`80 offspring are produced from Bb × Bb. How many are expected to be heterozygous?`, "40", ["1/2 of 80"]],
      [`A gene has alleles in the ratio 3 : 1 of tall : short. In 200 plants, how many short?`, "50", []],
      [`The chance of a boy is 0.5. What is the chance of two girls in a row?`, "0.25", ["0.5 × 0.5"]],
      [`A DNA sequence is 300 bases. How many amino acids could it code for (ignore start/stop)?`, "100", ["triplet code"]],
      [`A population of 400 beetles includes 36 white (recessive). Estimate q² and q if HWE is assumed.`, "q²=0.09, q=0.3", ["36/400"]],
    ]),
    practicals: [
      { name: "modelling meiosis or fertilisation with cards or beads", iv: "allele combination", dv: "offspring genotype counts", control: "same number of draws", error: ["not replacing / biased shuffling"] },
      { name: "extracting DNA from fruit", iv: "fruit type", dv: "amount of visible DNA", control: "same method", error: ["too much blending shears DNA"] },
      { name: "investigating variation in a class (hand span / height)", iv: "n/a — observational", dv: "measurement", control: "same measuring method", error: ["inconsistent technique"] },
      { name: "dissecting a flower to identify male and female parts", iv: "n/a", dv: "correct identification", control: "same species", error: ["damaging the ovary"] },
    ],
    compares: [
      { a: "mitosis", b: "meiosis", points: ["mitosis: 2 identical diploid", "meiosis: 4 different haploid"] },
      { a: "sexual reproduction", b: "asexual reproduction", points: ["sexual: variation, two parents", "asexual: faster, clones"] },
      { a: "dominant allele", b: "recessive allele", points: ["dominant expressed in heterozygote", "recessive only in homozygote"] },
      { a: "natural selection", b: "genetic engineering", points: ["natural selection is unplanned over generations", "GE is deliberate transfer of a chosen gene"] },
    ],
    extended: [
      { title: "Explain how a new species can arise by natural selection and isolation.", points: ["variation", "selection pressure", "reproduction", "isolation stops gene flow", "speciation"] },
      { title: `Evaluate genetic engineering of crops for a ${ctx.town} farm.`, points: ["yield / pest resistance", "cost", "gene transfer to wild plants", "public opinion", "judgement"] },
    ],
  });
}

function ecology(ctx) {
  return pack(ctx, {
    facts: [
      F("a community", "all the populations of different species in a habitat", "they interact", "why removing one species can affect others", "food web links"),
      F("an ecosystem", "the community and the non-living conditions", "includes abiotic and biotic factors", "why temperature is an abiotic factor", "it is non-living"),
      F("a producer", "an organism that makes its own food by photosynthesis", "start of a food chain", "why all food chains start with a producer", "they input energy from the sun"),
      F("a predator-prey cycle", "populations rise and fall out of step", "more prey → more predators → fewer prey", "why predator numbers peak after prey", "time lag"),
      F("biodiversity", "the variety of species in an area", "high biodiversity makes an ecosystem more stable", "why deforestation reduces biodiversity", "habitats are destroyed"),
      F("the carbon cycle", "carbon moves between air, living things and fossil stores", "photosynthesis, respiration, combustion, decomposition", "why burning fossil fuels increases CO₂", "locked carbon is released"),
      F("the water cycle", "evaporation, transpiration, condensation, precipitation", "water is recycled", "why cutting trees can reduce rainfall locally", "less transpiration"),
      F("eutrophication", "excess nutrients cause algal bloom, then oxygen crash", "often from fertiliser run-off", "why fish die", "decomposers use up oxygen"),
      F("a quadrat", "a square frame used to sample organisms", "used randomly or along a transect", "why samples must be random", "to avoid bias"),
      F("a transect", "a line along which samples are taken", "used when there is a gradient e.g. from sea to land", "why a belt transect is used on a rocky shore", "conditions change with distance"),
    ],
    calcs: calcSet([
      [`A 0.25 m² quadrat contains 8 dandelions. Estimate the number in a 100 m² field.`, "3200", ["8 × (100/0.25)"]],
      [`Five quadrats have 3, 5, 2, 6 and 4 plants. Calculate the mean.`, "4", []],
      [`A food chain has 10 000 kJ in grass and 1000 kJ in rabbits. Calculate the efficiency of transfer.`, "10%", ["1000/10000 × 100"]],
      [`Only 1% of 2 × 10⁶ kJ of sunlight becomes biomass in plants. How much is stored?`, "2 × 10⁴ kJ", []],
      [`A population of 200 deer increases by 15%. What is the new population?`, "230", []],
      [`${ctx.student} samples 10 quadrats of 1 m² in a 500 m² wood and finds a mean of 3 fungi. Estimate the total.`, "1500", ["3×500"]],
    ]),
    practicals: [
      { name: "a random quadrat investigation of plant abundance", iv: "area / mowing / light", dv: "number of plants / percentage cover", control: "same quadrat size", error: ["not using random numbers"] },
      { name: "a transect up a rocky shore or across a field", iv: "distance along the transect", dv: "species abundance", control: "same interval", error: ["uneven spacing"] },
      { name: "measuring abiotic factors (light, temperature, pH, moisture)", iv: "location", dv: "instrument reading", control: "same time of day", error: ["shading the light meter with your body"] },
      { name: "investigating decay with milk or compost and lipase / protease", iv: "temperature", dv: "pH change / mass loss", control: "same volume", error: ["uneven mixing"] },
    ],
    compares: [
      { a: "biotic factors", b: "abiotic factors", points: ["biotic: living, e.g. predation", "abiotic: non-living, e.g. light"] },
      { a: "a food chain", b: "a food web", points: ["chain is one pathway", "web shows many linked pathways"] },
      { a: "decay", b: "combustion", points: ["both release CO₂", "decay is biological / combustion is burning"] },
      { a: "intensive farming", b: "conservation", points: ["intensive: high yield, lower biodiversity", "conservation: protects habitats"] },
    ],
    extended: [
      { title: `Evaluate methods of maintaining biodiversity near ${ctx.town}.`, points: ["breeding programmes", "habitat protection", "field margins / hedgerows", "cost vs food production", "judgement"] },
      { title: "Explain the processes that cycle carbon and why atmospheric CO₂ has increased.", points: ["photosynthesis removes CO₂", "respiration and combustion add CO₂", "fossil fuels", "deforestation"] },
    ],
  });
}

function exchange(ctx) {
  return pack(ctx, {
    facts: [
      F("gas exchange in the lungs", "oxygen in, carbon dioxide out", "occurs in alveoli", "why alveoli have a large surface area", "faster diffusion"),
      F("an alveolus", "air sac adapted for gas exchange", "thin wall, moist, good blood supply", "why a good blood supply maintains the gradient", "blood carries oxygen away"),
      F("the circulatory system", "transports blood around the body", "heart, vessels, blood", "why mammals have a double circulation", "higher pressure to the body"),
      F("haemoglobin", "red pigment in red blood cells that binds oxygen", "forms oxyhaemoglobin", "why red blood cells have no nucleus", "more room for haemoglobin"),
      F("plasma", "liquid part of blood", "transports CO₂, urea, hormones, glucose", "why urea is transported to the kidney", "for excretion"),
      F("digestion of protein", "protease enzymes break proteins into amino acids", "starts in the stomach (pepsin)", "why the stomach is acidic", "optimum pH for pepsin / kills pathogens"),
      F("the villus", "finger-like projection in the small intestine", "microvilli, capillary network, lacteal", "why a lacteal is needed", "absorb fatty acids / glycerol"),
      F("breathing", "ventilation that moves air in and out of the lungs", "diaphragm and intercostal muscles", "why volume increase causes inspiration", "pressure falls below atmospheric"),
      F("coronary heart disease", "layers of fatty material in coronary arteries", "reduces blood flow to heart muscle", "evaluate stents vs statins", "stents open artery; statins reduce cholesterol"),
      F("health", "a state of physical and mental wellbeing", "affected by disease, diet, stress, lifestyle", "why two diseases can interact", "e.g. immune system weakened by one disease"),
    ],
    calcs: calcSet([
      [`Tidal volume 0.5 dm³, rate 12 /min. Calculate pulmonary ventilation.`, "6 dm³/min", ["TV × rate"]],
      [`A red blood cell is 8 µm wide and a capillary is 9 µm. Explain the significance, then calculate the difference.`, "1 µm", ["cells flattened against the wall / short path"]],
      [`Heart rate 75 bpm, stroke volume 80 cm³. Cardiac output?`, "6000 cm³/min", []],
      [`A person runs and tidal volume rises from 0.5 to 1.5 dm³ and rate from 12 to 20. Find the new ventilation.`, "30 dm³/min", []],
      [`Cholesterol falls from 6.0 to 4.8 mmol/dm³. Percentage decrease?`, "20%", []],
      [`An athlete's resting HR is 50 bpm. How many beats in 24 h?`, "72000", ["50×60×24"]],
    ]),
    practicals: [
      { name: "investigating the effect of exercise on heart rate", iv: "exercise intensity / time", dv: "pulse rate", control: "same recovery time measurement", error: ["finding the pulse inconsistently"] },
      { name: "using a peak-flow meter or spirometer (demonstration)", iv: "before/after exercise", dv: "peak flow / volume", control: "same technique", error: ["not a tight seal"] },
      { name: "food tests linked to digestion products", iv: "food type", dv: "colour", control: "same reagent volume", error: ["false positive if apparatus is dirty"] },
      { name: "observing a blood smear or photomicrograph of blood", iv: "n/a", dv: "identification of cell types", control: "same magnification", error: ["confusing platelets with debris"] },
    ],
    compares: [
      { a: "plasma", b: "red blood cells", points: ["plasma transports dissolved substances", "red blood cells transport oxygen"] },
      { a: "inhalation", b: "exhalation", points: ["inhalation: volume up, pressure down", "exhalation: volume down, pressure up"] },
      { a: "stents", b: "statins", points: ["stent is a physical tube in the artery", "statin is a drug that lowers cholesterol"] },
      { a: "the pulmonary artery", b: "the pulmonary vein", points: ["pulmonary artery: deoxygenated to lungs", "pulmonary vein: oxygenated to heart"] },
    ],
    extended: [
      { title: "Explain how the lungs and blood are adapted for efficient gas exchange.", points: ["alveoli adaptations", "haemoglobin", "ventilation and circulation maintain gradient"] },
      { title: "Evaluate lifestyle and medical treatments for coronary heart disease.", points: ["diet, exercise, stop smoking", "statins, stents, bypass", "risks and benefits", "judgement"] },
    ],
  });
}

function atomic(ctx) {
  const protons = ctx.n(11, 1);
  return pack(ctx, {
    facts: [
      F("an atom", "the smallest part of an element that can exist", "nucleus of protons and neutrons, electrons in shells", "why atoms are neutral", "same number of protons and electrons"),
      F("a proton", "positive particle in the nucleus, mass 1, charge +1", "atomic number is the number of protons", "why elements are different", "different proton numbers"),
      F("a neutron", "neutral particle in the nucleus, mass 1", "isotopes have different numbers of neutrons", "why isotopes have the same chemistry", "same electron number / arrangement"),
      F("an electron", "negative particle in shells, almost no mass, charge −1", "arranged 2,8,8", "why Group 1 reacts similarly", "one electron in the outer shell"),
      F("an isotope", "atoms of the same element with different numbers of neutrons", "same atomic number, different mass number", "why relative atomic mass is not a whole number", "weighted mean of isotopes"),
      F("the periodic table", "arrangement of elements in atomic number order", "groups and periods", "why Mendeleev left gaps", "he predicted missing elements"),
      F("a Group 1 metal", "alkali metal with one outer electron", "reactivity increases down the group", "why potassium is more reactive than lithium", "outer electron is further / more shielding"),
      F("a Group 7 element", "halogen with seven outer electrons", "reactivity decreases down the group", "why chlorine displaces iodine", "chlorine is more reactive"),
      F("a mixture", "two or more substances not chemically combined", "can be separated by physical methods", "why filtration separates sand and water", "sand is insoluble"),
      F("a compound", "two or more elements chemically combined", "needs a chemical reaction to separate", "why the properties of a compound differ from its elements", "new bonds have formed"),
    ],
    calcs: calcSet([
      [`An atom has ${protons} protons and ${protons + 12} neutrons. Write the mass number and atomic number.`, `mass number ${2 * protons + 12}, atomic number ${protons}`, ["mass number = protons + neutrons"]],
      [`Calculate the relative atomic mass of an element with 75% isotope 35 and 25% isotope 37.`, "35.5", ["(75×35 + 25×37)/100"]],
      [`How many electrons are in a ${protons}+ ion of this element if it is in Group 1?`, `${protons - 1}`, ["lost 1 electron"]],
      [`A shell holds 2n² electrons. How many in the 3rd shell?`, "18", ["2×9"]],
      [`${ctx.n(12, 2)} g of carbon-12 contains 1 mole. How many atoms?`, "6.02 × 10²³", ["Avogadro"]],
      [`Write the electronic structure of an element with 17 electrons.`, "2,8,7", ["chlorine"]],
    ]),
    practicals: [
      { name: "the flame-test practical for metal ions", iv: "metal ion", dv: "flame colour", control: "clean wire, same flame", error: ["contaminated wire"] },
      { name: "paper chromatography of inks", iv: "ink / solvent", dv: "Rf value", control: "same solvent front measurement", error: ["spot below the solvent level"] },
      { name: "separating rock salt (sand and salt)", iv: "n/a", dv: "mass of salt recovered", control: "same method", error: ["loss on transfer / incomplete evaporation"] },
      { name: "investigating the reaction of Group 1 metals with water (demonstration)", iv: "metal", dv: "observations / time", control: "same size piece", error: ["oxide layer / not a fair size"] },
    ],
    compares: [
      { a: "an element", b: "a compound", points: ["element: one type of atom", "compound: bonded atoms of different elements"] },
      { a: "Group 1", b: "Group 7", points: ["Group 1 lose 1 electron, metals", "Group 7 gain 1 electron, non-metals"] },
      { a: "a mixture", b: "a compound", points: ["mixture: not chemically combined, easier to separate", "compound: fixed composition"] },
      { a: "the plum-pudding model", b: "the nuclear model", points: ["plum pudding: sphere of positive charge with electrons", "nuclear: tiny positive nucleus, electrons outside"] },
    ],
    extended: [
      { title: "Explain how the periodic table is organised and how it is used to predict reactivity for Groups 1 and 7.", points: ["atomic number", "groups = outer electrons", "trends down the group with explanation"] },
      { title: "Describe how the atomic model changed from Dalton to Bohr and why each change happened.", points: ["Dalton solid balls", "Thomson electrons", "Rutherford nucleus / gold foil", "Bohr shells"] },
    ],
  });
}

function bonding(ctx) {
  return pack(ctx, {
    facts: [
      F("an ionic bond", "electrostatic attraction between oppositely charged ions", "formed by transfer of electrons", "why ionic compounds have high melting points", "strong bonds in a giant lattice"),
      F("a covalent bond", "a shared pair of electrons between atoms", "in molecules and giant covalent structures", "why diamond is hard", "each carbon has four strong covalent bonds"),
      F("a metallic bond", "attraction between positive ions and delocalised electrons", "in metals", "why metals conduct electricity", "delocalised electrons move"),
      F("a giant ionic lattice", "repeating 3D structure of ions", "e.g. sodium chloride", "why ionic compounds conduct when molten or dissolved but not as solids", "ions are free to move only when molten/aqueous"),
      F("a simple molecule", "small group of atoms with covalent bonds", "weak intermolecular forces between molecules", "why iodine has a low melting point", "weak forces between molecules"),
      F("graphite", "giant covalent structure of carbon in layers", "layers can slide; delocalised electrons", "why graphite is a lubricant and a conductor", "weak forces between layers; electrons move"),
      F("graphene", "a single layer of graphite", "very strong, conducts", "why graphene is useful in electronics", "conducts and is very thin"),
      F("a polymer", "a long chain of repeating monomers", "covalent bonds in the chain", "why thermosetting polymers do not melt easily", "cross-links"),
      F("a nanoparticle", "a particle 1–100 nm in size", "very large surface area to volume ratio", "evaluate nano-sunscreens", "better coverage vs unknown health risks"),
      F("an intermolecular force", "a force between molecules, weaker than covalent bonds", "affects melting and boiling points", "why bigger covalent molecules have higher boiling points", "stronger intermolecular forces"),
    ],
    calcs: calcSet([
      [`A cube nanoparticle of side 2 nm. Estimate SA:V compared with a 2 m cube (qualitative then ratio idea).`, "SA:V is much larger for the nanoparticle", ["SA:V increases as size decreases"]],
      [`How many covalent bonds does a carbon atom form in diamond?`, "4", []],
      [`Na has 11 electrons. Write the ion and the electron configuration of Na⁺.`, "Na⁺ 2,8", ["loses 1 electron"]],
      [`The formula of magnesium chloride. Mg is 2+ and Cl is 1−.`, "MgCl₂", ["balance charges"]],
      [`A polymer repeat unit is C₂H₄. What is the empirical formula?`, "CH₂", []],
      [`Rf = distance spot / distance solvent. Spot 3.6 cm, solvent 6.0 cm. Rf?`, "0.60", []],
    ]),
    practicals: [
      { name: "melting-point comparison of ionic vs simple molecular substances", iv: "substance type", dv: "melting temperature", control: "same heating method", error: ["uneven heating"] },
      { name: "testing electrical conductivity of solid, molten and dissolved samples", iv: "state of sample", dv: "whether the bulb lights", control: "same voltage", error: ["electrodes not clean"] },
      { name: "building ball-and-stick models of CH₄, H₂O, CO₂, NaCl", iv: "substance", dv: "correct geometry", control: "same modelling kit", error: ["wrong number of bonds"] },
      { name: "chromatography to identify a mixture of dyes", iv: "dye", dv: "Rf", control: "same solvent", error: ["solvent front marked after it evaporates"] },
    ],
    compares: [
      { a: "ionic bonding", b: "covalent bonding", points: ["ionic: transfer, metals + non-metals", "covalent: sharing, non-metals"] },
      { a: "diamond", b: "graphite", points: ["diamond: 3D tetrahedral, insulator, hard", "graphite: layers, conductor, soft"] },
      { a: "a metal", b: "an ionic solid", points: ["both high MP", "metal: malleable, conducts as solid; ionic: brittle, conducts when molten"] },
      { a: "simple molecular", b: "giant covalent", points: ["simple: low MP, weak intermolecular forces", "giant: high MP, many strong covalent bonds"] },
    ],
    extended: [
      { title: "Explain the properties of sodium chloride, diamond and copper using bonding and structure.", points: ["ionic lattice", "giant covalent", "metallic", "link each property to the model"] },
      { title: "Evaluate the use of nanoparticles in medicine or sunscreens.", points: ["high SA:V / better delivery or coverage", "can be more reactive", "unknown long-term toxicity", "judgement"] },
    ],
  });
}

function quantitative(ctx) {
  const mr = 40;
  const mass = ctx.n(8, 1);
  return pack(ctx, {
    facts: [
      F("relative formula mass", "sum of relative atomic masses in a formula", "Mr has no units", "why Mr(H₂O) is 18", "2×1 + 16"),
      F("a mole", "the amount of substance that contains 6.02 × 10²³ particles", "Avogadro's constant", "why we use moles in chemistry", "to count particles using masses"),
      F("conservation of mass", "total mass of reactants equals total mass of products in a closed system", "atoms are rearranged not created", "why a mass drop can occur when a gas escapes", "open system"),
      F("a limiting reactant", "the reactant that is used up first", "stops the reaction", "why adding more of the other reactant does not increase the product", "nothing left to react with"),
      F("concentration", "amount of solute in a given volume of solution", "mol/dm³ or g/dm³", "why diluting halves the concentration", "same moles, double volume"),
      F("yield", "how much product is obtained", "percentage yield = actual/theoretical × 100", "why yield is less than 100%", "incomplete reaction, side reactions, loss on transfer"),
      F("atom economy", "Mr of desired product / Mr of all products × 100", "measure of efficiency", "why a high atom economy is greener", "less waste"),
      F("a balanced equation", "shows the same number of each atom on both sides", "used in mole calculations", "why we must balance before calculating masses", "mole ratios come from the equation"),
      F("an empirical formula", "simplest whole-number ratio of atoms", "from percentage composition", "why the molecular formula may be a multiple", "e.g. CH₂ vs C₂H₄"),
      F("Avogadro's constant", "6.02 × 10²³ mol⁻¹", "number of particles in one mole", "why 12 g of carbon-12 is 1 mole", "definition"),
    ],
    calcs: calcSet([
      [`Calculate Mr of CaCO₃ (Ca=40, C=12, O=16).`, "100", []],
      [`How many moles in ${mass} g of NaOH (Mr=40)?`, `${(mass / mr).toFixed(2)} mol`, ["n = m/Mr"]],
      [`What mass of 0.25 mol of H₂O (Mr=18)?`, "4.5 g", []],
      [`A solution is 0.20 mol/dm³ and has volume 250 cm³. How many moles of solute?`, "0.050 mol", ["n = cV, V in dm³"]],
      [`2Na + 2HCl → 2NaCl + H₂. What mass of H₂ from 4.6 g Na (Aᵣ 23)?`, "0.20 g", ["0.2 mol Na → 0.1 mol H₂"]],
      [`Actual yield 8.0 g, theoretical 10.0 g. Percentage yield?`, "80%", []],
    ]),
    practicals: [
      { name: "a titration of acid with alkali", iv: "volume of acid", dv: "volume of alkali to the end-point", control: "same indicator, same concentration", error: ["overshooting the end-point"] },
      { name: "making a soluble salt from an acid and an insoluble base", iv: "n/a", dv: "mass of crystals", control: "same acid volume", error: ["not evaporating carefully / spitting"] },
      { name: "measuring mass change when Mg burns or CaCO₃ is heated", iv: "starting mass", dv: "mass of product", control: "same heating time", error: ["product lost as smoke"] },
      { name: "preparing a standard solution", iv: "mass of solid", dv: "concentration", control: "volumetric flask to the mark", error: ["not dissolving fully before making up"] },
    ],
    compares: [
      { a: "percentage yield", b: "atom economy", points: ["yield is about how much you actually get", "atom economy is about how much of the atoms are in the desired product"] },
      { a: "a concentrated solution", b: "a dilute solution", points: ["concentrated: more solute per dm³", "dilute: less solute per dm³"] },
      { a: "an empirical formula", b: "a molecular formula", points: ["empirical is simplest ratio", "molecular is actual numbers of atoms"] },
      { a: "a closed system", b: "an open system", points: ["closed: mass appears constant", "open: gas can escape so mass can fall"] },
    ],
    extended: [
      { title: "Explain, with a worked example, how to calculate the mass of product from a known mass of reactant.", points: ["write balanced equation", "moles of reactant", "mole ratio", "mass of product", "limiting reactant mention"] },
      { title: "Evaluate titration as a method for finding the concentration of an acid.", points: ["precise with a pipette and burette", "concordant titres", "indicator error", "still one of the best school methods"] },
    ],
  });
}

function chemicalChanges(ctx) {
  return pack(ctx, {
    facts: [
      F("an acid", "a substance that produces H⁺ ions in water / proton donor", "pH less than 7", "why a strong acid has a lower pH than a weak acid of the same concentration", "more fully ionised"),
      F("an alkali", "a soluble base that produces OH⁻ ions", "pH more than 7", "why acids and alkalis neutralise", "H⁺ + OH⁻ → H₂O"),
      F("a salt", "a compound formed when H⁺ in an acid is replaced by a metal ion or ammonium", "e.g. NaCl from HCl", "why the salt name depends on the acid", "HCl → chloride, H₂SO₄ → sulfate"),
      F("electrolysis", "breaking down an ionic compound using electricity", "ions must be free to move", "why a solid ionic compound does not conduct", "ions are not free"),
      F("reduction", "gain of electrons / loss of oxygen", "at the cathode in electrolysis", "why aluminium is extracted by electrolysis not reduction with carbon", "aluminium is more reactive than carbon"),
      F("oxidation", "loss of electrons / gain of oxygen", "at the anode in electrolysis", "why OIL RIG is useful", "oxidation is loss"),
      F("the reactivity series", "metals in order of reactivity", "used to predict displacement", "why copper does not displace zinc ions", "copper is less reactive"),
      F("a displacement reaction", "a more reactive metal displaces a less reactive metal from a compound", "redox reaction", "why this can be used to extract some metals", "more reactive element takes the oxygen"),
      F("neutralisation", "acid + base → salt + water", "exothermic", "why a titration uses an indicator", "to find the end-point"),
      F("the extraction of iron", "reduction of iron oxide with carbon in a blast furnace", "carbon is more reactive than iron", "why this does not work for aluminium", "aluminium is too reactive"),
    ],
    calcs: calcSet([
      [`HCl + NaOH → NaCl + H₂O. 25.0 cm³ of 0.100 mol/dm³ HCl is neutralised. Moles of HCl?`, "0.00250 mol", ["cV"]],
      [`If the NaOH volume was 20.0 cm³, what is its concentration?`, "0.125 mol/dm³", ["same moles"]],
      [`pH of 0.010 mol/dm³ strong monoprotic acid (if [H⁺]=0.010).`, "2", ["pH = −log[H⁺] if on spec; else state pH is low"]],
      [`Mass of Cu from Cu²⁺ + 2e⁻ → Cu if 0.25 mol of electrons flow. `, "8 g (0.125 mol × 63.5)", ["2 mol e⁻ per mol Cu"]],
      [`A metal oxide is 80% metal by mass. Mass of metal in 50 g of oxide?`, "40 g", []],
      [`In 2Al + Fe₂O₃ → Al₂O₃ + 2Fe, moles of Al needed for 0.5 mol Fe₂O₃?`, "1 mol", ["ratio 2:1"]],
    ]),
    practicals: [
      { name: "making a soluble salt from an acid and a metal oxide or carbonate", iv: "acid / base", dv: "crystals formed", control: "filter off excess base", error: ["not using excess base so acid remains"] },
      { name: "electrolysis of aqueous copper chloride or sodium chloride (demonstration if chlorine)", iv: "electrolyte", dv: "products at electrodes", control: "same current time", error: ["wrong electrode identification"] },
      { name: "displacement reactions of metals with metal salt solutions", iv: "metal", dv: "whether a coating / colour change occurs", control: "same concentration of salt", error: ["dirty metal surface"] },
      { name: "pH measurement of acids of different concentration", iv: "concentration", dv: "pH", control: "same acid type", error: ["unwashed pH probe"] },
    ],
    compares: [
      { a: "a strong acid", b: "a weak acid", points: ["strong: fully ionised", "weak: partially ionised"] },
      { a: "reduction with carbon", b: "electrolysis", points: ["carbon: cheaper for less reactive metals", "electrolysis: needed for more reactive metals, expensive"] },
      { a: "the cathode", b: "the anode", points: ["cathode: reduction, negative", "anode: oxidation, positive"] },
      { a: "an acid + a metal", b: "an acid + a carbonate", points: ["metal: salt + hydrogen", "carbonate: salt + water + carbon dioxide"] },
    ],
    extended: [
      { title: "Explain how to choose a method to extract a metal, using the reactivity series.", points: ["native metals", "reduction with carbon", "electrolysis", "cost and energy"] },
      { title: "Describe electrolysis of molten lead bromide and of aqueous sodium chloride, and explain the products.", points: ["molten: Pb and Br₂", "aqueous: hydrogen and chlorine / oxygen depending on ions", "discharge rules"] },
    ],
  });
}

function energyChem(ctx) {
  return pack(ctx, {
    facts: [
      F("an exothermic reaction", "a reaction that transfers energy to the surroundings", "temperature of surroundings increases", "why hand warmers are exothermic", "they release heat"),
      F("an endothermic reaction", "a reaction that takes in energy from the surroundings", "temperature falls", "why sports injury packs can be endothermic", "they take in heat"),
      F("activation energy", "the minimum energy particles need to react", "shown on a reaction profile", "why a catalyst increases rate", "provides a lower activation energy path"),
      F("a reaction profile", "a diagram of energy against progress of reaction", "shows Ea and energy change", "how to tell exothermic from the profile", "products lower than reactants"),
      F("bond energy", "energy needed to break one mole of a bond", "breaking is endothermic, making is exothermic", "why a reaction is exothermic overall", "more energy released making bonds than is used breaking them"),
      F("a catalyst", "speeds up a reaction without being used up", "not in the overall equation", "why catalysts are useful in industry", "lower temperature / cost / faster"),
      F("cells and batteries", "chemical reactions that produce a potential difference", "go flat when reactants are used up", "why a rechargeable cell can be used again", "the reaction is reversed when charging"),
      F("a fuel cell", "a cell that produces electricity from a fuel and oxygen", "hydrogen fuel cell produces water", "evaluate hydrogen fuel cells vs batteries", "only water emitted vs hydrogen storage issues"),
      F("conservation of energy in reactions", "energy is transferred, not created", "shown in energy level diagrams", "why a calorimeter still loses some heat", "not perfectly insulated"),
      F("a chemical cell", "two metals in an electrolyte produce a voltage", "bigger reactivity difference, bigger voltage", "why the voltage falls with time", "reactants used up"),
    ],
    calcs: calcSet([
      [`Bonds broken 2000 kJ, bonds made 2500 kJ. Energy change?`, "−500 kJ (exothermic)", ["made − broken"]],
      [`Q = mcΔT. 50 g water, c=4.2, ΔT=${ctx.n(12, 2)}°C. Calculate Q.`, `${(50 * 4.2 * ctx.n(12, 2)).toFixed(0)} J`, []],
      [`That Q came from 0.010 mol of fuel. Energy per mole?`, `${((50 * 4.2 * ctx.n(12, 2)) / 0.01 / 1000).toFixed(0)} kJ/mol`, []],
      [`A reaction profile has reactants at 80 kJ and products at 30 kJ. ΔH?`, "−50 kJ", []],
      [`Ea is 60 kJ/mol without a catalyst and 25 kJ/mol with. By how much has Ea fallen?`, "35 kJ/mol", []],
      [`A fuel cell uses 2H₂ + O₂ → 2H₂O. Moles of H₂O from 4 mol H₂?`, "4 mol", ["ratio 2:2"]],
    ]),
    practicals: [
      { name: "temperature change of neutralisation or displacement", iv: "combination of reagents", dv: "temperature change", control: "same volumes, insulated cup", error: ["heat loss to the air"] },
      { name: "comparing fuels by heating water", iv: "fuel", dv: "ΔT of water", control: "same mass of water, same distance of flame", error: ["incomplete combustion / draughts"] },
      { name: "drawing reaction profiles from experimental ΔT data", iv: "reaction", dv: "calculated energy change", control: "same calorimeter", error: ["not stirring so ΔT is wrong"] },
      { name: "investigating chemical cells with different metal pairs", iv: "metal pair", dv: "voltage", control: "same electrolyte", error: ["poor contact / corroded metals"] },
    ],
    compares: [
      { a: "exothermic", b: "endothermic", points: ["exothermic: energy out, products lower", "endothermic: energy in, products higher"] },
      { a: "a battery", b: "a hydrogen fuel cell", points: ["battery: stored chemicals, goes flat", "fuel cell: continuous fuel supply, water product"] },
      { a: "bond breaking", b: "bond making", points: ["breaking takes in energy", "making releases energy"] },
      { a: "a catalyst", b: "an increased temperature", points: ["catalyst: lower Ea, not used up", "temperature: more particles have Ea, rate up"] },
    ],
    extended: [
      { title: "Explain how to calculate an energy change using bond energies and how to tell if the reaction is exothermic.", points: ["sum of bonds broken", "sum of bonds made", "overall sign", "link to reaction profile"] },
      { title: "Evaluate hydrogen fuel cells as a replacement for petrol engines.", points: ["only water produced", "hydrogen manufacture may use fossil fuels", "storage and safety", "cost of cells", "judgement"] },
    ],
  });
}

function rates(ctx) {
  return pack(ctx, {
    facts: [
      F("rate of reaction", "how quickly reactants are used up or products form", "measured as quantity / time", "why rate is fastest at the start", "highest concentration of reactants"),
      F("collision theory", "particles must collide with enough energy and the correct orientation", "successful collisions cause reaction", "why a higher concentration increases rate", "more frequent successful collisions"),
      F("activation energy", "minimum energy for a successful collision", "affected by a catalyst", "why not all collisions succeed", "some have E < Ea or wrong orientation"),
      F("a catalyst", "increases rate by providing an alternative path with lower Ea", "not used up", "why industry uses catalysts", "faster at lower temperature, saves energy"),
      F("equilibrium", "in a closed system, forward and reverse rates are equal", "concentrations stay constant", "why it looks as if the reaction has stopped", "both directions still happen"),
      F("Le Chatelier's principle", "if a change is made, the equilibrium shifts to oppose the change", "used to predict conditions", "why raising pressure favours the side with fewer gas moles", "opposes the pressure increase"),
      F("the Haber process", "N₂ + 3H₂ ⇌ 2NH₃, exothermic", "compromise temperature and pressure, iron catalyst", "why 450°C is a compromise", "lower T favours yield but slower rate"),
      F("surface area", "for a solid, more area means more collisions", "powders react faster than lumps", "why marble chips react slower than powder", "smaller SA"),
      F("a closed system", "no substances can enter or leave", "needed for a true equilibrium", "why an open fizzy drink goes flat", "CO₂ leaves so equilibrium cannot be established"),
      F("a reversible reaction", "can go forwards and backwards", "shown with ⇌", "why heating hydrated copper sulfate is reversible", "water can be added back"),
    ],
    calcs: calcSet([
      [`A gas syringe collects 30 cm³ in 20 s. Mean rate?`, "1.5 cm³/s", []],
      [`Mass falls by 0.80 g in 40 s. Mean rate of mass loss?`, "0.020 g/s", []],
      [`From a graph, the tangent at t=0 has gradient 0.40 cm³/s. What does this represent?`, "initial rate", []],
      [`Concentration doubles and rate doubles. What is the order with respect to that reactant (A-level idea at GCSE: describe the effect)?`, "rate is proportional to concentration", []],
      [`A reaction finishes in 80 s at 20°C and 20 s at 30°C. By what factor has the rate increased?`, "4", ["time is 1/4 so rate ×4"]],
      [`Haber: if 10 mol N₂ and 30 mol H₂ react completely, mol of NH₃?`, "20 mol", ["1:3:2"]],
    ]),
    practicals: [
      { name: "the rate required practical (marble and acid, or sodium thiosulfate and acid)", iv: "concentration / temperature / chip size", dv: "time to X on paper / volume of gas", control: "same volume of acid", error: ["subjective end-point / gas leaks"] },
      { name: "investigating the effect of a catalyst on hydrogen peroxide", iv: "catalyst type", dv: "volume of O₂ / time", control: "same volume and concentration of H₂O₂", error: ["catalyst not the same surface area"] },
      { name: "drawing a rate graph from gas volume data", iv: "time", dv: "volume", control: "same apparatus", error: ["syringe sticks"] },
      { name: "the disappearing-cross (thiosulfate) practical", iv: "concentration or temperature", dv: "time for the cross to disappear", control: "same volume, same cross", error: ["different people judge the end-point differently"] },
    ],
    compares: [
      { a: "a catalyst", b: "an increase in temperature", points: ["catalyst: lower Ea, not used up", "temperature: more particles above Ea and more collisions"] },
      { a: "a powder", b: "a large lump of the same mass", points: ["powder has larger SA", "faster rate"] },
      { a: "dynamic equilibrium", b: "a finished irreversible reaction", points: ["equilibrium: both directions continue", "irreversible: reactants used up"] },
      { a: "increasing pressure (Haber)", b: "increasing temperature (Haber)", points: ["higher P: better yield, expensive", "higher T: worse yield, better rate"] },
    ],
    extended: [
      { title: "Explain how concentration, temperature, surface area and a catalyst affect rate using collision theory.", points: ["each factor with collisions and Ea"] },
      { title: "Explain why the Haber process uses a compromise temperature and pressure.", points: ["exothermic so low T favours yield", "low T is slow", "high P favours yield but is expensive", "iron catalyst"] },
    ],
  });
}

function organicGcse(ctx) {
  return genericTopic(ctx, "organic chemistry and fuels", [
    ["a hydrocarbon", "compound of H and C only", "alkanes and alkenes", "crude oil is a mixture of hydrocarbons"],
    ["an alkane", "saturated hydrocarbon CₙH₂ₙ₊₂", "single C–C bonds only", "used as fuels"],
    ["an alkene", "unsaturated hydrocarbon CₙH₂ₙ", "contains C=C", "bromine water decolourises"],
    ["fractional distillation", "separating crude oil by boiling point", "fractionating column", "larger molecules have higher BP"],
    ["cracking", "breaking long alkanes into shorter alkanes and alkenes", "high T and catalyst", "meets demand for petrol and alkenes"],
    ["complete combustion", "hydrocarbon + O₂ → CO₂ + H₂O", "blue flame", "plenty of oxygen"],
    ["incomplete combustion", "produces CO and/or C", "yellow flame", "CO is toxic"],
    ["a polymer", "long chain of monomers", "addition polymers from alkenes", "poly(ethene) from ethene"],
    ["a functional group", "the reactive part of a molecule", "e.g. C=C, COOH, OH", "determines reactions"],
    ["an ester", "from alcohol + carboxylic acid", "used as flavourings", "condensation reaction"],
  ], [
    [`Write the formula of the alkane with ${ctx.n(5, 1)} carbons.`, `C${ctx.n(5, 1)}H${2 * ctx.n(5, 1) + 2}`],
    ["Balance C₃H₈ + O₂ → CO₂ + H₂O", "C₃H₈ + 5O₂ → 3CO₂ + 4H₂O"],
    ["Mr of C₂H₄ (C=12, H=1)", "28"],
    ["A 100 cm³ sample of alkene decolourises bromine water. What does this show?", "C=C present / unsaturated"],
    ["Percentage of C in CH₄", "75%"],
    ["Moles of CO₂ from 2 mol C₂H₆ complete combustion (2C₂H₆ + 7O₂ → 4CO₂ + 6H₂O)", "4 mol"],
  ]);
}

function analysis(ctx) {
  return genericTopic(ctx, "chemical analysis", [
    ["a pure substance", "single element or compound / sharp melting point", "not a mixture", "used to check purity"],
    ["a formulation", "mixture designed as a useful product", "paints, medicines, alloys", "measured quantities"],
    ["Rf value", "distance spot ÷ distance solvent front", "identifies substances", "must be 0 to 1"],
    ["chromatography", "separating dissolved substances", "stationary and mobile phases", "different solubilities"],
    ["a flame test", "identifies some metal ions by colour", "lithium red, sodium yellow, potassium lilac, calcium orange-red, copper green", "clean wire needed"],
    ["a cation test", "sodium hydroxide gives coloured precipitates", "Cu²⁺ blue, Fe²⁺ green, Fe³⁺ brown", "add NaOH"],
    ["an anion test", "carbonate, sulfate, halide tests", "HCl + limewater; BaCl₂; AgNO₃", "specific observations"],
    ["instrumental analysis", "machines such as flame photometers", "faster, more accurate, sensitive", "expensive"],
    ["a melting point", "temperature at which a solid becomes liquid", "sharp if pure", "impurities lower and widen MP"],
    ["limewater", "calcium hydroxide solution", "turns milky with CO₂", "test for carbon dioxide"],
  ], [
    ["Rf = 4.2 / 6.0", "0.70"],
    ["A solvent front is 8.0 cm and Rf is 0.25. How far did the spot travel?", "2.0 cm"],
    ["How many ions are tested if five flame colours are recorded?", "five metal ions"],
    ["A solution gives a white ppt with acidified BaCl₂. Which ion?", "sulfate"],
    ["A solution gives a cream ppt with AgNO₃ that dissolves in concentrated NH₃. Which halide?", "bromide"],
    ["Percentage purity if 9.6 g of product contains 9.12 g of the pure compound", "95%"],
  ]);
}

function atmosphere(ctx) {
  return genericTopic(ctx, "the atmosphere and Earth", [
    ["the early atmosphere", "mainly CO₂ from volcanoes", "little oxygen", "like some other planets"],
    ["how oxygen increased", "photosynthesis by algae and plants", "CO₂ fell", "oceans absorbed CO₂"],
    ["the greenhouse effect", "greenhouse gases absorb outgoing IR", "H₂O, CO₂, CH₄", "keeps Earth warm enough for life"],
    ["human greenhouse emissions", "burning fossil fuels, deforestation, livestock", "increase CO₂ and CH₄", "linked to climate change"],
    ["a carbon footprint", "total greenhouse gases from a product or activity", "can be reduced", "use less energy / renewables"],
    ["atmospheric pollutants", "CO, SO₂, NOx, particulates", "from combustion", "toxic / acid rain / respiratory problems"],
    ["acid rain", "SO₂ and NOx dissolve to form acids", "damages limestone and lakes", "reduce by low-sulfur fuels / catalytic converters"],
    ["complete vs incomplete combustion of fuels", "CO₂ vs CO/C", "oxygen supply", "CO is colourless and toxic"],
    ["limestone", "mainly calcium carbonate", "thermal decomposition to CaO", "used in building"],
    ["the oceans as a carbon store", "CO₂ dissolves and forms sedimentary rock", "long-term store", "warming reduces solubility"],
  ], [
    ["Air is about 21% oxygen. Volume of O₂ in 5.0 dm³ of air", "1.05 dm³"],
    ["CO₂ rose from 280 to 420 ppm. Percentage increase", "50%"],
    ["A car produces 2.3 kg CO₂ in 10 km. CO₂ per km", "0.23 kg/km"],
    ["Balance CH₄ + O₂ → CO₂ + H₂O", "CH₄ + 2O₂ → CO₂ + 2H₂O"],
    ["If 4 mol CH₄ burn completely, mol of CO₂", "4 mol"],
    ["A sample of air is 78% N₂. Volume of N₂ in 200 cm³", "156 cm³"],
  ]);
}

function resources(ctx) {
  return genericTopic(ctx, "using resources and water", [
    ["a finite resource", "will run out / used faster than it forms", "fossil fuels, metal ores", "need recycling"],
    ["a renewable resource", "can be replaced as fast as it is used", "timber if replanted, wool", "more sustainable"],
    ["potable water", "water safe to drink", "not necessarily pure H₂O", "filtered and sterilised"],
    ["desalination", "removing salt from seawater", "distillation or reverse osmosis", "high energy cost"],
    ["waste-water treatment", "screening, sedimentation, anaerobic digestion, sterilising", "before release", "reduces disease"],
    ["life-cycle assessment", "impact of a product from raw materials to disposal", "energy, water, waste", "used to compare bags / bottles"],
    ["recycling metals", "melting and remaking", "saves energy vs extraction", "sorting can be hard"],
    ["phytomining", "plants absorb metal ions from soil", "burn plants to get ash", "for low-grade ores"],
    ["bioleaching", "bacteria extract metals from ores", "produces a leachate", "slow but less energy"],
    ["an alloy", "mixture of a metal with other elements", "harder than the pure metal", "different sized atoms stop layers sliding"],
  ], [
    ["A tap produces 8 dm³/min. Volume in 5 minutes", "40 dm³"],
    ["Recycling aluminium uses 5% of the energy of extraction. Energy saved as a percentage", "95%"],
    ["A bottle has a mass of 40 g. How many bottles in 2.0 kg", "50"],
    ["Salt water is 3.5% salt. Mass of salt in 200 g of seawater", "7.0 g"],
    ["A filter removes 92% of particles. Particles remaining from 250 mg", "20 mg"],
    ["Cost of desalination is £1.20 per m³. Cost for 15 m³", "£18.00"],
  ]);
}

function energyPhys(ctx) {
  const m = ctx.n(2, 0.5);
  const h = ctx.n(5, 1);
  return genericTopic(ctx, "energy stores and transfers", [
    ["a kinetic energy store", "energy of a moving object", "½mv²", "faster or heavier means more KE"],
    ["a gravitational potential store", "energy due to height in a field", "mgh", "increases when lifted"],
    ["an elastic store", "energy in a stretched spring", "½ke²", "provided the limit of proportionality is not exceeded"],
    ["conservation of energy", "energy is not created or destroyed", "transferred between stores", "total is constant in a closed system"],
    ["efficiency", "useful energy / total energy", "can be a percentage", "never more than 100%"],
    ["thermal conductivity", "how well a material conducts heat", "low for insulators", "cavity walls reduce transfer"],
    ["specific heat capacity", "energy to raise 1 kg by 1°C", "E = mcΔθ", "water has a high SHC"],
    ["power", "energy transferred per second", "P = E/t", "measured in watts"],
    ["work done", "energy transferred by a force", "W = Fs", "when a force moves an object"],
    ["a non-renewable energy resource", "cannot be replaced in a lifetime", "coal, oil, gas, nuclear fuel", "reliable but polluting or finite"],
  ], [
    [`KE of ${m} kg at 4 m/s`, `${0.5 * m * 16} J`],
    [`GPE of ${m} kg raised ${h} m (g=10)`, `${m * 10 * h} J`],
    [`Efficiency if 80 J useful from 200 J`, "40%"],
    [`Power if 600 J is transferred in 12 s`, "50 W"],
    [`SHC: 8000 J heats 1 kg by 4°C. c =`, "2000 J/kg°C"],
    [`Work done by a 20 N force over 3 m`, "60 J"],
  ]);
}

function electricity(ctx) {
  return genericTopic(ctx, "electricity", [
    ["current", "flow of charge", "I = Q/t", "measured in amps, ammeter in series"],
    ["potential difference", "work done per coulomb", "V = E/Q", "voltmeter in parallel"],
    ["resistance", "how difficult it is for current to flow", "R = V/I", "ohms"],
    ["Ohm's law", "I is proportional to V at constant T", "ohmic conductor", "straight I–V graph through origin"],
    ["a series circuit", "one loop", "current the same, voltages add", "resistors add"],
    ["a parallel circuit", "more than one loop", "voltage the same, currents add", "total R is less than the smallest"],
    ["electrical power", "P = VI = I²R = V²/R", "energy per second", "used for heating and motors"],
    ["mains electricity", "a.c. 230 V, 50 Hz in the UK", "live, neutral, earth", "earth and fuse for safety"],
    ["the national grid", "system of cables and transformers", "high V, low I to reduce heat loss", "step-up and step-down transformers"],
    ["static electricity", "charge that builds on insulators", "electrons transferred by friction", "sparks when charge jumps"],
  ], [
    [`Q = It. 2 A for 30 s`, "60 C"],
    [`R = V/I. 12 V, 0.25 A`, "48 Ω"],
    [`P = VI. 230 V, 2 A`, "460 W"],
    [`E = Pt. 2 kW for 0.5 h in kWh`, "1 kWh"],
    [`Two 4 Ω resistors in series`, "8 Ω"],
    [`Two 4 Ω resistors in parallel`, "2 Ω"],
  ]);
}

function particles(ctx) {
  return genericTopic(ctx, "particle model of matter", [
    ["a solid", "particles in a regular arrangement, vibrate", "fixed shape", "strong forces"],
    ["a liquid", "particles touching, can move past", "fixed volume, flows", "weaker forces than a solid"],
    ["a gas", "particles far apart, move freely", "fills the container", "almost no forces"],
    ["density", "mass per unit volume", "ρ = m/V", "solids usually denser than gases"],
    ["internal energy", "total KE + PE of particles", "rises when heated", "temperature is related to mean KE"],
    ["specific latent heat", "energy to change state of 1 kg without a temperature change", "E = mL", "fusion or vaporisation"],
    ["gas pressure", "force of collisions with the walls", "more frequent if T or N increases", "P is proportional to T (K) at constant V"],
    ["Brownian motion", "random movement of smoke / pollen", "caused by unseen particles colliding", "evidence for particles"],
    ["absolute zero", "0 K = −273°C", "minimum particle energy", "kelvin starts there"],
    ["a change of state", "solid ⇌ liquid ⇌ gas", "bonds broken/made, temperature stays constant while changing state", "mass is conserved"],
  ], [
    [`Density of 40 g in 10 cm³`, "4 g/cm³"],
    [`Volume of 1.2 kg with density 400 kg/m³`, "0.003 m³"],
    [`E = mL. 0.25 kg, L=2.3×10⁶`, "5.75 × 10⁵ J"],
    [`Convert 27°C to kelvin`, "300 K"],
    [`A gas is heated from 200 K to 400 K at constant V. What happens to pressure?`, "it doubles"],
    [`Mass of 2.0 m³ of air at 1.2 kg/m³`, "2.4 kg"],
  ]);
}

function radioactivity(ctx) {
  return genericTopic(ctx, "atomic structure and radioactivity", [
    ["the nuclear model", "tiny positive nucleus, electrons in shells", "most of the atom is empty space", "from alpha scattering"],
    ["an isotope", "same protons, different neutrons", "same atomic number", "some are radioactive"],
    ["alpha radiation", "helium nucleus, 2+ , highly ionising, weakly penetrating", "stopped by paper", "dangerous if ingested"],
    ["beta radiation", "fast electron, stopped by aluminium", "moderately ionising", "neutron → proton + e⁻"],
    ["gamma radiation", "electromagnetic wave", "weakly ionising, very penetrating", "stopped by thick lead / concrete"],
    ["half-life", "time for activity or undecayed nuclei to halve", "cannot be changed", "used to choose a source"],
    ["activity", "decays per second", "becquerel (Bq)", "falls exponentially"],
    ["irradiation", "exposure to radiation from outside", "does not make the object radioactive", "use shielding"],
    ["contamination", "radioactive material on or in an object", "keeps emitting", "harder to deal with"],
    ["nuclear fission", "splitting a large nucleus", "used in reactors", "chain reaction"],
  ], [
    [`A sample has activity 800 Bq and half-life 2 h. Activity after 6 h`, "100 Bq"],
    [`How many half-lives from 640 to 40 Bq`, "4"],
    [`Mass number of alpha decay of 238/92 U`, "234/90 Th"],
    [`Count rate 120 cpm, background 20. Corrected rate`, "100 cpm"],
    [`A source falls from 240 Bq to 30 Bq. How many half-lives?`, "3"],
    [`Percentage remaining after 2 half-lives`, "25%"],
  ]);
}

function waves(ctx) {
  return genericTopic(ctx, "waves", [
    ["a transverse wave", "oscillations perpendicular to direction of energy transfer", "light, water, S-waves", "has peaks and troughs"],
    ["a longitudinal wave", "oscillations parallel to energy transfer", "sound, P-waves", "compressions and rarefactions"],
    ["amplitude", "maximum displacement from equilibrium", "related to loudness / brightness", "not the length of the wave"],
    ["wavelength", "distance between two corresponding points", "e.g. peak to peak", "metres"],
    ["frequency", "waves per second", "hertz", "pitch of sound"],
    ["wave speed", "v = fλ", "also distance/time", "same in a given medium for that wave type"],
    ["the EM spectrum", "radio → microwave → IR → visible → UV → X-ray → gamma", "all travel at c in vacuum", "higher frequency, more energy"],
    ["reflection", "wave bounces off a boundary", "angle i = angle r", "used in echoes"],
    ["refraction", "wave changes speed and direction in a new medium", "bends towards the normal if it slows", "light in glass"],
    ["ultrasound", "sound above 20 kHz", "partially reflected at boundaries", "medical imaging / industrial testing"],
  ], [
    [`v = fλ. 200 Hz, 1.7 m`, "340 m/s"],
    [`λ if v=3×10⁸ and f=6×10¹⁴`, "5 × 10⁻⁷ m"],
    [`T = 1/f. f = 50 Hz`, "0.02 s"],
    [`A wave travels 60 m in 0.20 s. Speed`, "300 m/s"],
    [`How many waves in 4.0 s if f=25 Hz`, "100"],
    [`A ripple has λ=4 cm and f=5 Hz. Speed in m/s`, "0.20 m/s"],
  ]);
}

function forces(ctx) {
  return genericTopic(ctx, "forces and motion", [
    ["a scalar", "magnitude only", "mass, speed, distance, energy", "no direction"],
    ["a vector", "magnitude and direction", "force, velocity, acceleration, displacement", "shown by arrows"],
    ["Newton's first law", "resultant force 0 means constant velocity", "including rest", "balanced forces"],
    ["Newton's second law", "F = ma", "resultant force", "in newtons"],
    ["Newton's third law", "equal and opposite forces on two different objects", "same type", "not balanced forces on one object"],
    ["weight", "gravitational force", "W = mg", "newtons, not kg"],
    ["stopping distance", "thinking + braking", "affected by speed, tiredness, road, brakes", "thinking is reaction × speed"],
    ["momentum", "p = mv", "conserved in a closed system", "impulse = Δp = F t"],
    ["Hooke's law", "F = ke, up to the limit of proportionality", "linear F–e graph", "k is spring constant"],
    ["a moment", "turning effect of a force", "M = Fd", "equilibrium when clockwise = anticlockwise"],
  ], [
    [`W = mg. 60 kg, g=10`, "600 N"],
    [`F = ma. 4 kg, 3 m/s²`, "12 N"],
    [`a = Δv/t. 0 to 20 m/s in 8 s`, "2.5 m/s²"],
    [`p = mv. 0.2 kg at 15 m/s`, "3 kg m/s"],
    [`F = ke. k=40 N/m, e=0.05 m`, "2 N"],
    [`Thinking distance at 15 m/s if reaction time is 0.6 s`, "9 m"],
  ]);
}

function magnetism(ctx) {
  return genericTopic(ctx, "magnetism and electromagnetism", [
    ["a magnetic field", "region where a magnetic force acts", "shown by field lines N to S", "stronger where lines are closer"],
    ["a permanent magnet", "produces its own field", "north and south poles", "attracts magnetic materials"],
    ["an induced magnet", "becomes magnetic in a field", "loses magnetism when removed", "paperclips"],
    ["the motor effect", "a current in a field experiences a force", "F = BIl", "Fleming's left-hand rule"],
    ["Fleming's left-hand rule", "thumb motion, first finger field, second finger current", "for motors", "90° angles"],
    ["an electromagnet", "coil with a current, often around an iron core", "can be switched off", "cranes, relays"],
    ["electromagnetic induction", "a voltage induced when a wire cuts field lines", "or a field changes through a coil", "generators"],
    ["a transformer", "two coils on a core, a.c. only", "Vp/Vs = np/ns", "step-up or step-down"],
    ["the generator effect", "coil rotated in a field induces a.c.", "used in power stations", "faster rotation, bigger V"],
    ["a solenoid", "a long coil", "field like a bar magnet", "stronger with more turns or current"],
  ], [
    [`F = BIl. B=0.20 T, I=3.0 A, l=0.50 m`, "0.30 N"],
    [`Transformer: 200 turns to 50 turns, 12 V input. Vs`, "3 V"],
    [`If VpIp = VsIs, 230 V, 0.2 A primary, 12 V secondary. Is`, "3.83 A"],
    [`A coil has 100 turns. Turns ratio to 25 turns`, "4 : 1"],
    [`Force on 4 cm of wire (0.04 m), B=0.5 T, I=2 A`, "0.04 N"],
    [`A magnet induces 0.12 V for 0.20 s. Mean induced V is given; flux change idea — calculate V×t`, "0.024 Wb-turns (flux linkage change)"],
  ]);
}

function space(ctx) {
  return genericTopic(ctx, "space physics", [
    ["a galaxy", "billions of stars held by gravity", "the Milky Way is ours", "stars orbit the centre"],
    ["the solar system", "the Sun and objects in orbit", "planets, moons, asteroids, comets", "the Sun is a star"],
    ["fusion in stars", "hydrogen nuclei join to helium", "releases energy", "why the Sun is stable: fusion vs gravity"],
    ["the life cycle of a star like the Sun", "protostar → main sequence → red giant → white dwarf", "mass decides the path", "more massive stars can form neutron stars or black holes"],
    ["red-shift", "light from distant galaxies is shifted to longer wavelength", "evidence the universe is expanding", "more distant, greater red-shift"],
    ["the Big Bang", "the universe began from a very hot dense point", "supported by red-shift and CMB", "not an explosion in space but of space"],
    ["CMB", "cosmic microwave background", "leftover radiation from the early universe", "evidence for Big Bang"],
    ["orbital motion", "gravity provides the centripetal force", "closer orbits are faster", "moons and planets"],
    ["weight on other planets", "W = mg, g is different", "mass stays the same", "you weigh less on the Moon"],
    ["a satellite", "an object in orbit", "natural or artificial", "used for communication, GPS, weather"],
  ], [
    [`W on Earth 600 N, g=10. Mass`, "60 kg"],
    [`Weight on a planet where g=4 N/kg for that mass`, "240 N"],
    [`A radio signal travels 3×10⁸ m/s. Time to a probe 3×10¹¹ m away`, "1000 s"],
    [`Orbital speed 2000 m/s, radius 4.0×10⁶ m. Period T=2πr/v (leave in terms of π)`, "4000π s"],
    [`A star is 8 light-minutes away. Distance in light-seconds`, "480 light-seconds"],
    [`Red-shift: λ increases from 400 nm to 440 nm. Δλ/λ`, "0.10"],
  ]);
}

function alvlMolecules(ctx) {
  return genericTopic(ctx, "biological molecules", [
    ["a condensation reaction", "joins two molecules and releases water", "makes polymers", "glycosidic, peptide, ester bonds"],
    ["hydrolysis", "breaks a bond using water", "digestion", "opposite of condensation"],
    ["α-glucose", "hexose sugar used in starch and glycogen", "C₆H₁₂O₆", "differs from β-glucose at carbon 1"],
    ["starch", "amylose and amylopectin", "plant energy store", "coiled, compact, insoluble"],
    ["cellulose", "β-glucose chains with hydrogen bonds", "plant cell walls", "high tensile strength"],
    ["a triglyceride", "glycerol + 3 fatty acids", "energy store, insulation", "ester bonds"],
    ["a phospholipid", "phosphate head + two fatty tails", "bilayer", "hydrophobic barrier"],
    ["the primary structure of a protein", "sequence of amino acids", "determined by DNA", "affects all higher structure"],
    ["an enzyme", "globular protein catalyst", "lowers activation energy", "specific active site"],
    ["a nucleotide", "pentose + phosphate + base", "DNA/RNA monomer", "phosphodiester bonds"],
  ], [
    [`A dipeptide is hydrolysed. How many water molecules are needed?`, "1"],
    [`A polypeptide has 50 amino acids. How many peptide bonds?`, "49"],
    [`Rf of a chromatogram spot 3.0 cm, solvent 7.5 cm`, "0.40"],
    [`Enzyme rate is 24 units at 20°C and 48 at 30°C. Q10`, "2"],
    [`A DNA strand is 12% A. Percentage T`, "12%"],
    [`If A=12% in DNA, percentage G`, "38%"],
  ]);
}

function alvlCells(ctx) {
  return genericTopic(ctx, "cells and microscopy", [
    ["ultrastructure of a eukaryotic cell", "organelles with specific functions", "nucleus, mitochondria, RER, Golgi, lysosomes", "division of labour"],
    ["a prokaryotic cell", "no nucleus, 70S ribosomes, cell wall of murein", "plasmids, flagella, capsule", "smaller than eukaryotes"],
    ["the magnification formula", "magnification = image / actual", "convert units first", "µm and nm"],
    ["an organelle", "specialised structure in a cell", "mitochondrion: aerobic respiration", "chloroplast: photosynthesis"],
    ["the fluid mosaic model", "phospholipid bilayer with proteins", "fluid: phospholipids move; mosaic: proteins", "partially permeable"],
    ["osmosis in terms of water potential", "water moves from high to low ψ", "ψ of pure water is 0", "solutes lower ψ"],
    ["active transport", "against a gradient using ATP and carrier proteins", "e.g. mineral ions in roots", "stops if respiration is inhibited"],
    ["mitosis", "produces two genetically identical cells", "prophase metaphase anaphase telophase", "growth and repair"],
    ["the cell cycle", "interphase + mitosis + cytokinesis", "DNA replicates in S phase", "checkpoints"],
    ["an antibody", "protein produced by plasma cells", "specific binding site", "agglutination and marking for phagocytosis"],
  ], [
    [`Image 40 mm, actual 8 µm. Magnification`, "×5000"],
    [`Scale bar 2 cm represents 5 µm. Magnification`, "×4000"],
    [`A cell is 20 µm. Length in mm`, "0.020 mm"],
    [`Water potential: cell −400 kPa, solution −800 kPa. Direction of water`, "out of the cell"],
    [`Mitotic index: 18 cells in mitosis out of 200`, "0.09"],
    [`A bacterium 2 µm long at ×10 000. Image size`, "20 mm"],
  ]);
}

function alvlExchange(ctx) {
  return genericTopic(ctx, "exchange and transport", [
    ["surface area to volume ratio", "decreases as size increases", "why large organisms need exchange systems", "diffusion alone is too slow"],
    ["Fick's law", "rate ∝ SA × difference / thickness", "alveoli and gills", "steep gradient maintained by blood and ventilation"],
    ["the alveolus", "thin, large SA, good blood supply, moist", "gas exchange", "elastin for recoil"],
    ["the counter-current system in fish", "water and blood flow opposite ways", "gradient along the whole lamella", "more oxygen extracted"],
    ["the cardiac cycle", "atria, ventricles, valves", "pressure changes open/close valves", "SAN is the pacemaker"],
    ["tissue fluid formation", "high hydrostatic pressure at arterial end", "plasma out, some return at venous end / lymph", "proteins stay in capillary"],
    ["haemoglobin dissociation", "S-shaped curve", "cooperative binding", "Bohr effect: high CO₂ shifts curve right"],
    ["xylem transport", "cohesion-tension", "transpiration pull", "lignified walls"],
    ["phloem translocation", "mass flow from source to sink", "sucrose loaded using ATP", "companion cells"],
    ["the Bohr effect", "extra CO₂ lowers haemoglobin's affinity for oxygen", "more oxygen released in respiring tissues", "curve shifts right"],
  ], [
    [`SA of a cube side 3 cm`, "54 cm²"],
    [`SA:V of that cube`, "2 : 1"],
    [`Cardiac output 5.6 dm³/min, HR 70. Stroke volume`, "80 cm³"],
    [`Ventilation rate 12 /min × 0.5 dm³`, "6 dm³/min"],
    [`A capillary is 1 µm thick. Time idea: diffusion path compared with 10 µm`, "10 times shorter"],
    [`Heart rate rises from 60 to 150. Percentage increase`, "150%"],
  ]);
}

function alvlGenetics(ctx) {
  return genericTopic(ctx, "genetic information and variation", [
    ["the genetic code", "triplet, degenerate, non-overlapping, universal", "codons code for amino acids", "start and stop"],
    ["transcription", "DNA → mRNA in the nucleus", "RNA polymerase", "template strand"],
    ["translation", "mRNA + tRNA + ribosome → polypeptide", "anticodon pairing", "peptide bonds"],
    ["a mutation", "change in DNA base sequence", "substitution, insertion, deletion", "frameshift is usually worse"],
    ["meiosis", "two divisions, haploid gametes, variation", "crossing over and independent assortment", "fertilisation adds more variation"],
    ["natural selection", "differential survival and reproduction", "allele frequencies change", "directional or stabilising"],
    ["speciation", "new species form when gene flow stops", "allopatric vs sympatric", "reproductive isolation"],
    ["taxonomy", "classification into domain to species", "binomial names", "phylogeny is evolutionary history"],
    ["biodiversity", "variety of species, genetic and habitat", "index of diversity", "conservation"],
    ["an antibody in immunity", "specific protein from plasma cells", "primary and secondary response", "memory cells"],
  ], [
    [`A DNA sequence has 600 bases. Maximum amino acids`, "200"],
    [`Chi-squared: 3:1 expected of 80 plants. Expected recessive`, "20"],
    [`Index of diversity N(N−1)/Σn(n−1). If N=10 and Σ=12, D`, "7.5"],
    [`Heterozygous cross Aa × Aa. Probability of aa`, "0.25"],
    [`A gene pool has p=0.8. If HWE, frequency of heterozygotes`, "0.32"],
    [`A 4-base sequence has 4⁴ possible combinations`, "256"],
  ]);
}

function alvlEnergy(ctx) {
  return genericTopic(ctx, "energy transfers", [
    ["ATP", "adenine, ribose, three phosphates", "immediate energy currency", "hydrolysis is catalysed by ATP hydrolase"],
    ["glycolysis", "glucose to 2 pyruvate in cytoplasm", "net 2 ATP, 2 reduced NAD", "anaerobic or aerobic"],
    ["the link reaction", "pyruvate to acetyl CoA", "CO₂ removed, NAD reduced", "in the matrix"],
    ["the Krebs cycle", "oxidises acetate, produces reduced coenzymes and ATP", "matrix", "CO₂ released"],
    ["oxidative phosphorylation", "electrons down the ETC, chemiosmosis", "inner mitochondrial membrane", "most ATP"],
    ["photosynthesis light-dependent reaction", "thylakoid, photolysis, ATP and reduced NADP", "electron transport", "oxygen by-product"],
    ["the Calvin cycle", "stroma, RuBP + CO₂ → GP → TP", "needs ATP and reduced NADP", "TP used to make glucose"],
    ["a limiting factor of photosynthesis", "light, CO₂ or temperature", "shown by plateaus on graphs", "greenhouses manipulate them"],
    ["a biomass transfer", "energy lost as heat, waste, not eaten", "about 10% between trophic levels", "pyramids of biomass"],
    ["net primary production", "NPP = GPP − respiration", "available to herbivores", "units kJ m⁻² yr⁻¹"],
  ], [
    [`NPP if GPP=80 and R=30 (arbitrary units)`, "50"],
    [`Efficiency 12 000 kJ to 1 200 kJ`, "10%"],
    [`RQ of C₆H₁₂O₆: CO₂/O₂`, "1"],
    [`2 pyruvate from 1 glucose. How many CO₂ in two link reactions?`, "2"],
    [`A plant fixes 6 CO₂. How many turns of Calvin cycle?`, "6"],
    [`ATP from substrate-level phosphorylation per glucose in glycolysis`, "net 2"],
  ]);
}

function alvlControl(ctx) {
  return genericTopic(ctx, "control, coordination and homeostasis", [
    ["a resting potential", "about −70 mV, Na⁺/K⁺ pump, more K⁺ leak", "inside negative", "ready to fire"],
    ["an action potential", "depolarisation then repolarisation", "all-or-nothing", "voltage-gated channels"],
    ["saltatory conduction", "jumps between nodes of Ranvier", "myelin", "faster"],
    ["a synapse", "neurotransmitter, summation, unidirectional", "drugs can mimic or block", "fatigue if transmitter runs out"],
    ["negative feedback", "reverses a change", "blood glucose, temperature", "keeps conditions stable"],
    ["insulin and glucagon", "from islets of the pancreas", "antagonistic", "glycogenesis vs glycogenolysis"],
    ["ADH", "from pituitary, acts on collecting duct", "more aquaporins, less urine", "osmoregulation"],
    ["the kidney nephron", "ultrafiltration, selective reabsorption, loop of Henle", "water potential gradient", "urea concentrated"],
    ["IAA / auxin", "uneven distribution causes tropisms", "inhibits root growth, promotes shoot growth at the same concentration", "phototropism"],
    ["the sliding-filament theory", "actin and myosin, tropomyosin, calcium, ATP", "sarcomere shortens", "cross-bridges"],
  ], [
    [`Impulse speed 1.2 m in 0.015 s`, "80 m/s"],
    [`A neurone diameter doubles (qualitative). Effect on speed`, "faster (less resistance)"],
    [`GFR idea: 125 cm³/min. Volume in 1 hour`, "7.5 dm³"],
    [`Blood glucose 5.0 to 7.5. Percentage increase`, "50%"],
    [`Sarcomere 2.4 µm to 2.0 µm. Percentage shortening`, "16.7%"],
    [`A reflex path is 1.8 m at 60 m/s. Time`, "0.030 s"],
  ]);
}

function alvlPopulations(ctx) {
  return genericTopic(ctx, "populations, evolution and ecosystems", [
    ["a gene pool", "all the alleles in a population", "allele frequency", "changes with selection"],
    ["Hardy–Weinberg", "p² + 2pq + q² = 1", "assumes no selection, large population, random mating", "estimates carriers"],
    ["directional selection", "favours one extreme", "mean shifts", "e.g. antibiotic resistance"],
    ["stabilising selection", "favours the mean", "variation falls", "e.g. human birth mass"],
    ["genetic drift", "random change in allele frequency", "stronger in small populations", "founder and bottleneck"],
    ["succession", "community change over time to a climax", "pioneer species", "deflected succession / plagioclimax"],
    ["an ecosystem", "community + abiotic factors", "dynamic", "energy and nutrient flows"],
    ["conservation", "maintaining biodiversity", "in situ vs ex situ", "seed banks, SSSIs"],
    ["mark-release-recapture", "N = (n1 × n2) / n_marked in second sample", "assumes no migration, marks stay on", "estimate population"],
    ["niche", "the role of a species", "two species cannot occupy the same niche indefinitely", "competitive exclusion"],
  ], [
    [`HWE q²=0.04. q and 2pq if p=0.8`, "q=0.2, 2pq=0.32"],
    [`Mark-release: 40 marked, 50 recaptured of which 10 marked. N`, "200"],
    [`A population grows from 80 to 100. Percentage increase`, "25%"],
    [`Simpson: two communities, higher D means`, "higher diversity"],
    [`If p=0.9, frequency of homozygous dominant`, "0.81"],
    [`40 of 200 snails are striped recessive. q²`, "0.20"],
  ]);
}

function alvlGeneExpression(ctx) {
  return genericTopic(ctx, "control of gene expression", [
    ["totipotent cells", "can become any body cell including placenta", "zygote", "genes not yet permanently switched off"],
    ["pluripotent cells", "can become any body cell except placenta", "embryonic stem cells", "used in research"],
    ["transcription factors", "proteins that bind DNA and switch genes on or off", "oestrogen can be a stimulus", "needed for cell specialisation"],
    ["epigenetics", "heritable changes in gene function without changing the base sequence", "methylation, acetylation", "environment can affect this"],
    ["RNA interference", "siRNA / miRNA can stop mRNA being translated", "breaks down mRNA", "gene silencing"],
    ["a tumour suppressor gene", "slows the cell cycle / promotes apoptosis", "if mutated, cell cycle runs on", "both copies often need to fail"],
    ["a proto-oncogene", "stimulates the cell cycle", "becomes an oncogene if mutated", "too much stimulation"],
    ["recombinant DNA", "DNA from more than one source", "restriction enzymes, ligase, vectors", "insulin production"],
    ["PCR", "amplifies DNA", "denature, anneal, extend", "needs primers and heat-stable polymerase"],
    ["gel electrophoresis", "separates DNA fragments by size", "shorter fragments travel further", "used in genetic fingerprinting"],
  ], [
    [`PCR: starting with 1 molecule, copies after 5 cycles`, "32"],
    [`A fragment is 600 bp. After a 6-cutter idea, number of fragments depends on sites — if 2 cut sites on a linear DNA`, "3 fragments"],
    [`Stem cell therapy risk: name one`, "tumour formation / rejection"],
    [`Methylation of a promoter typically`, "reduces transcription"],
    [`A gene is 900 bases coding. Amino acids (no stop)`, "300"],
    [`Dilution 1 in 10 four times. Final dilution`, "1 in 10 000"],
  ]);
}

function alvlPhysical1(ctx) {
  return genericTopic(ctx, "atomic structure, amount of substance and bonding", [
    ["relative atomic mass", "weighted mean mass of atoms vs 1/12 of C-12", "from mass spectrometry", "isotopes"],
    ["the ideal gas equation", "pV = nRT", "SI units", "T in kelvin"],
    ["empirical formula", "simplest ratio", "from masses or %", "molecular formula needs Mr"],
    ["a mole", "6.02 × 10²³ entities", "n = m/M", "also n = cV"],
    ["ionic bonding", "electrostatic attraction of ions", "giant lattice", "high MP, conduct when molten"],
    ["covalent bonding", "shared electron pair", "dative covalent possible", "shapes from electron pairs"],
    ["electronegativity", "ability to attract a bonding pair", "polar bonds if different", "Pauling scale"],
    ["metallic bonding", "cations + delocalised electrons", "malleable, conduct", "stronger with more delocalised e⁻"],
    ["a mass spectrum", "m/z of ions", "Mr from molecular ion", "isotope peaks"],
    ["electron pair repulsion", "pairs repel, shape from number of pairs", "lone pairs repel more", "bond angles"],
  ], [
    [`n in 8.0 g NaOH (M=40)`, "0.20 mol"],
    [`c if 0.025 mol in 250 cm³`, "0.10 mol dm⁻³"],
    [`pV=nRT: n=1, T=300, p=100 kPa. V`, "0.0249 m³ (R=8.31)"],
    [`% of C in C₂H₆ (M=30)`, "80%"],
    [`Mr from 12% of a 2+ ion at m/z 24. Actual Mr of atom`, "48 if that peak is the ion — treat as Mg²⁺ example: 24"],
    [`Bond angle in CH₄`, "109.5°"],
  ]);
}

function alvlPhysical2(ctx) {
  return genericTopic(ctx, "energetics, kinetics and equilibria", [
    ["enthalpy change", "heat change at constant pressure", "ΔH, kJ mol⁻¹", "exo negative"],
    ["Hess's law", "total ΔH independent of route", "cycles", "formation and combustion data"],
    ["mean bond enthalpy", "mean energy to break 1 mol of a bond", "gas states", "not exact for one molecule"],
    ["collision theory", "E ≥ Ea and orientation", "Maxwell–Boltzmann", "catalysts lower Ea"],
    ["rate equation", "rate = k[A]ᵐ[B]ⁿ", "orders from experiment", "k depends on T"],
    ["equilibrium constant Kc", "products/reactants with powers of moles from equation", "only T changes K", "no units sometimes"],
    ["Le Chatelier", "system opposes a change", "used with K to explain yield", "catalyst does not change K"],
    ["a Born–Haber cycle", "lattice enthalpy from Hess", "formation, atomisation, ionisation, EA", "compares theoretical and experimental lattice"],
    ["entropy", "measure of disorder", "ΔS total = ΔS sys + ΔS surr", "feasible if ΔS total > 0"],
    ["the rate-determining step", "slowest step", "must match the orders", "mechanism evidence"],
  ], [
    [`Q=mcΔT. 100 g, c=4.18, ΔT=5.0`, "2090 J"],
    [`ΔH = −Q/n. Q=2090 J, n=0.010`, "−209 kJ mol⁻¹"],
    [`Kc = [C]²/[A][B]. If all conc=2`, "2"],
    [`A first-order half-life is 20 s. k`, "0.0347 s⁻¹ (ln2/t½)"],
    [`Bonds broken 1200, made 1500. ΔH`, "−300 kJ"],
    [`If T doubles and k increases, Ea is`, "overcome by more particles / Arrhenius"],
  ]);
}

function alvlPhysical3(ctx) {
  return genericTopic(ctx, "thermodynamics, rates, electrode potentials and acids", [
    ["lattice enthalpy", "formation of a solid lattice from gaseous ions", "more exothermic if ions small/high charge", "Born–Haber"],
    ["Gibbs free energy", "ΔG = ΔH − TΔS", "feasible if ΔG < 0", "T can change feasibility"],
    ["the Arrhenius equation", "k = Ae^{−Ea/RT}", "ln k vs 1/T is a straight line", "gradient −Ea/R"],
    ["a half-cell", "metal in a solution of its ions", "Eθ vs SHE", "more positive, easier reduction"],
    ["EMF of a cell", "Eθred − Eθox / more positive minus more negative", "spontaneous if Ecell > 0", "standard conditions"],
    ["a buffer", "resists pH change", "weak acid + salt", "HA ⇌ H⁺ + A⁻"],
    ["pH of a strong acid", "pH = −log[H⁺]", "[H⁺]=concentration if monoprotic", "sig figs"],
    ["Ka", "acid dissociation constant", "pKa = −log Ka", "smaller pKa, stronger acid"],
    ["a redox titration", "e.g. manganate(VII) with Fe²⁺", "self-indicating", "mole ratio 1:5"],
    ["electrochemical series", "order of Eθ values", "predicts displacement", "does not give rate"],
  ], [
    [`pH of 0.020 mol dm⁻³ HCl`, "1.70"],
    [`[H⁺] if pH=3.00`, "1.0 × 10⁻³ mol dm⁻³"],
    [`ΔG if ΔH=−20 kJ, ΔS=−50 J K⁻¹, T=300 K`, "−5 kJ"],
    [`Ecell if 0.80 − (−0.76)`, "1.56 V"],
    [`Ka = 1.8×10⁻⁵, [HA]=0.10. [H⁺] ≈`, "1.3 × 10⁻³"],
    [`Titration: 25.0 cm³ Fe²⁺ needs 20.0 cm³ of 0.0200 mol dm⁻³ MnO₄⁻. Moles MnO₄⁻`, "4.00 × 10⁻⁴"],
  ]);
}

function alvlInorganic(ctx) {
  return genericTopic(ctx, "inorganic chemistry", [
    ["periodicity", "repeating trends across a period", "atomic radius, ionisation energy, melting point", "explained by structure and shielding"],
    ["first ionisation energy", "energy to remove 1 mol of electrons from 1 mol of gaseous atoms", "generally increases across a period", "falls at Group 3 and 6"],
    ["Group 2", "alkaline earth metals", "reactivity increases down the group", "hydroxides more soluble, sulfates less soluble down the group"],
    ["Group 7", "halogens", "oxidising power decreases down the group", "displacement reactions"],
    ["a transition metal", "forms at least one ion with an incomplete d-subshell", "variable oxidation states, coloured ions, catalysts, complexes", "d–d transitions"],
    ["a complex ion", "central metal ion with ligands", "coordinate bonds", "e.g. [Cu(H₂O)₆]²⁺"],
    ["a ligand", "a lone-pair donor", "monodentate or bidentate", "substitution can change colour"],
    ["heterogeneous catalyst", "different phase from reactants", "surface adsorption", "e.g. Fe in Haber"],
    ["homogeneous catalyst", "same phase", "forms an intermediate", "e.g. Fe²⁺ in S₂O₈²⁻ + I⁻"],
    ["amphoteric", "reacts with acids and bases", "Al₂O₃, Al(OH)₃", "used to identify aluminium"],
  ], [
    [`Electron configuration of Fe (Z=26)`, "[Ar] 4s² 3d⁶"],
    [`Oxidation state of Fe in Fe₂O₃`, "+3"],
    [`Cl₂ + 2KBr →`, "2KCl + Br₂"],
    [`Moles of Ca(OH)₂ from 0.10 mol Ca`, "0.10 mol"],
    [`A complex is octahedral. Bond angle`, "90°"],
    [`Percentage of Ca in CaCO₃`, "40%"],
  ]);
}

function alvlOrganic(ctx) {
  return genericTopic(ctx, "organic chemistry", [
    ["a homologous series", "same functional group, differ by CH₂", "gradual change in physical properties", "same general formula"],
    ["isomerism", "same molecular formula, different structure", "structural and stereoisomerism", "E–Z and optical"],
    ["a nucleophile", "electron-pair donor", "OH⁻, CN⁻, NH₃", "attacks δ+ carbon"],
    ["an electrophile", "electron-pair acceptor", "H⁺, Br⁺ (from Br₂/FeBr₃), NO₂⁺", "attacks electron-rich centres"],
    ["free-radical substitution", "alkanes + halogens in UV", "initiation, propagation, termination", "mixture of products"],
    ["electrophilic addition", "alkenes + Br₂ / HBr", "carbocation intermediate", "Markownikoff"],
    ["nucleophilic substitution", "haloalkanes + OH⁻", "Sn1 or Sn2", "rate depends on C–X bond"],
    ["oxidation of alcohols", "primary → aldehyde → carboxylic acid; secondary → ketone", "acidified dichromate", "distil vs reflux"],
    ["a carbonyl test", "Brady's / 2,4-DNP orange ppt", " Tollens' for aldehydes", "Fehling's"],
    ["optical isomerism", "chiral carbon, four different groups", "enantiomers, plane-polarised light", "racemic mixture"],
  ], [
    [`Molecular formula of hexane`, "C₆H₁₄"],
    [`How many structural isomers of C₄H₁₀`, "2"],
    [`Mr of CH₃COOH`, "60"],
    [`Moles in 6.0 g of ethanoic acid`, "0.10 mol"],
    [`A chiral carbon is in CH₃CHBrCH₂CH₃. How many optical isomers`, "2"],
    [`Percentage yield 7.2 g from theoretical 9.0 g`, "80%"],
  ]);
}

function alvlAnalysisChem(ctx) {
  return genericTopic(ctx, "organic analysis and modern techniques", [
    ["infrared spectroscopy", "bonds absorb characteristic wavenumbers", "C=O around 1700 cm⁻¹, O–H broad", "fingerprint region"],
    ["mass spectrometry", "molecular ion gives Mr", "fragmentation pattern", "high-resolution gives formula"],
    ["¹H NMR", "chemical shift, integration, splitting", "n+1 rule", "TMS standard"],
    ["¹³C NMR", "number of environments", "no splitting usually", "used with ¹H NMR"],
    ["a chromatographic method", "TLC, GC, column", "retention time / Rf", "separates mixtures"],
    ["an aromatic compound", "delocalised π ring", "electrophilic substitution", "benzene is more stable than expected"],
    ["phenol", "OH on a benzene ring", "weaker acid than carboxylic acids, stronger than alcohols", "bromine water decolourised / white ppt"],
    ["an acyl chloride", "very reactive carbonyl", "nucleophilic addition–elimination", "fumes of HCl"],
    ["a polymer from condensation", "polyester or polyamide", "water or HCl eliminated", "can be hydrolysed"],
    ["a synthetic route", "planning reagents and conditions", "need to protect groups sometimes", "yield falls in many steps"],
  ], [
    [`A molecular ion is at m/z 46. Possible formula`, "C₂H₆O (ethanol)"] ,
    [`Two peaks in ¹³C NMR for C₂H₆O could mean`, "two carbon environments (ethanol)"],
    [`Splitting of a CH₃ next to CH₂`, "triplet"],
    [`IR: a broad peak at 3200–3600 cm⁻¹ suggests`, "O–H (alcohol or acid)"],
    [`A tripeptide has how many peptide bonds`, "2"],
    [`GC peak area is 20% of total. Estimate % of that component`, "20%"],
  ]);
}

function alvlParticles(ctx) {
  return genericTopic(ctx, "particles and radiation", [
    ["the standard model", "quarks, leptons, exchange bosons", "up down strange; electron, neutrino", "charge must be conserved"],
    ["a hadron", "made of quarks, feels the strong force", "baryons 3 quarks, mesons quark+antiquark", "proton is uud"],
    ["the photoelectric effect", "electrons emitted if f > f₀", "hf = φ + Ek max", "evidence for photons"],
    ["wave-particle duality", "electrons show diffraction", "de Broglie λ = h/p", "particles have wave nature"],
    ["annihilation", "particle + antiparticle → photons", "energy 2mc² minimum", "PET scanners"],
    ["pair production", "a photon → particle + antiparticle", "near a nucleus", "hf ≥ 2mc²"],
    ["the electronvolt", "1.6 × 10⁻¹⁹ J", "convenient energy unit", "convert with e"],
    ["a Feynman diagram", "shows exchange particles", "EM: virtual photon; weak: W±", "time and space axes"],
    ["beta-minus decay", "neutron → proton + e⁻ + antineutrino", "a down quark → up", "weak interaction"],
    ["specific charge", "charge/mass", "electron is very large", "used to identify particles"],
  ], [
    [`E = hf. f=5.0×10¹⁴, h=6.63×10⁻³⁴`, "3.32 × 10⁻¹⁹ J"],
    [`φ = 2.0 eV. f₀ = φ/h`, "4.8 × 10¹⁴ Hz"],
    [`λ = h/mv. m=9.1×10⁻³¹, v=2.0×10⁶`, "0.36 nm order"],
    [`2mc² for electron (0.511 MeV)`, "1.022 MeV"],
    [`Quark composition of a neutron`, "udd"],
    [`Charge of a uud proton in e`, "+1"],
  ]);
}

function alvlWaves(ctx) {
  return genericTopic(ctx, "waves, superposition and optics", [
    ["phase difference", "how far out of step two waves are", "in radians or degrees", "π rad is antiphase"],
    ["superposition", "displacements add", "constructive and destructive interference", "path difference nλ or (n+½)λ"],
    ["Young's double slits", "w = λD/s", "monochromatic coherent sources", "measures λ"],
    ["diffraction grating", "nλ = d sinθ", "sharper maxima than two slits", "used to measure λ"],
    ["stationary waves", "two opposite travelling waves of the same f", "nodes and antinodes", "harmonics on a string"],
    ["the first harmonic", "λ/2 = L on a string", "fundamental", "f = (1/2L)√(T/μ)"],
    ["refraction", "n = c/v = sin i / sin r", "towards the normal if slower", "total internal reflection if i > c"],
    ["optical fibre", "TIR along the core", "cladding of lower n", "pulse broadening issues"],
    ["polarisation", "oscillations in one plane", "only transverse waves", "Polaroid filters, stress analysis"],
    ["a photon in the photoelectric effect", "interacts with one electron", "intensity is number of photons", "explains no time delay"],
  ], [
    [`w = λD/s. λ=6.0×10⁻⁷, D=1.5, s=0.50×10⁻³`, "1.8 mm"],
    [`nλ = d sinθ. n=1, d=2.0×10⁻⁶, θ=18°. λ`, "6.2 × 10⁻⁷ m"],
    [`First harmonic: L=0.80 m. λ`, "1.6 m"],
    [`n = 1.5, c=3.0×10⁸. v in glass`, "2.0 × 10⁸ m/s"],
    [`Critical angle if n=1.5 to air`, "41.8°"],
    [`Path difference for the 2nd bright fringe`, "2λ"],
  ]);
}

function alvlMechanics(ctx) {
  return genericTopic(ctx, "mechanics and materials", [
    ["suvat", "constant acceleration equations", "vectors along a line", "take a direction as positive"],
    ["projectile motion", "horizontal u constant, vertical acceleration g", "time from vertical motion", "range = uₓ t"],
    ["moments", "force × perpendicular distance", "equilibrium: net force and net moment zero", "couples"],
    ["density and pressure", "ρ=m/V, P=F/A, P=ρgh", "fluids", "upthrust"],
    ["Young modulus", "stress/strain in the linear region", "E = (F/A)/(ΔL/L)", "property of the material"],
    ["stress and strain", "F/A and ΔL/L", "elastic if returns to original", "plastic beyond yield"],
    ["energy stored in a spring", "½Fe or ½ke²", "area under F–x", "elastic store"],
    ["terminal velocity", "drag = weight (and upthrust)", "resultant zero", "faster if weight larger or drag smaller"],
    ["resolving vectors", "components Fx = F cosθ", "use a vector triangle", "resultant by Pythagoras if perpendicular"],
    ["centre of mass", "point where the weight acts", "stability if vertical from CoM is inside the base", "suspended objects hang from CoM"],
  ], [
    [`s = ut + ½at². u=0, a=10, t=3`, "45 m"],
    [`Range: ux=12, t=2.0 s`, "24 m"],
    [`Stress if F=80 N, A=0.50×10⁻⁶ m²`, "1.6 × 10⁸ Pa"],
    [`Strain if ΔL=0.40 mm, L=2.0 m`, "2.0 × 10⁻⁴"],
    [`E = stress/strain from those values`, "8.0 × 10¹¹ Pa"],
    [`½ke². k=200, e=0.050`, "0.25 J"],
  ]);
}

function alvlElectricity(ctx) {
  return genericTopic(ctx, "electricity", [
    ["Ohm's law", "V=IR for a constant-temperature ohmic conductor", "I–V graphs", "filament and diode are non-ohmic"],
    ["resistivity", "ρ = RA/L", "property of the material", "increases with T for metals"],
    ["terminal pd", "ε = I(R+r) = V + Ir", "internal resistance", "lost volts"],
    ["potential divider", "Vout = Vin × R2/(R1+R2)", "sensors", "LDR and thermistor"],
    ["superconductivity", "zero resistivity below a critical temperature", "no heating", "strong magnets / MRI"],
    ["power in circuits", "P=VI=I²R=V²/R", "heating in cables", "choose thickness of wire"],
    ["Kirchhoff 1", "conservation of charge", "currents into a junction = currents out", "parallel circuits"],
    ["Kirchhoff 2", "conservation of energy", "sum of emfs = sum of pds around a loop", "series circuits"],
    ["an emf", "energy transferred per coulomb by the source", "volts", "when no current, V=ε"],
    ["a semiconductor", "fewer charge carriers than a metal", "resistance falls as T rises", "more carriers freed"],
  ], [
    [`I=V/R. 12 V, 4.0 Ω`, "3.0 A"],
    [`ρ=RA/L. R=2.0, A=0.50×10⁻⁶, L=2.0`, "5.0 × 10⁻⁷ Ω m"],
    [`ε=I(R+r). I=0.50, R=10, r=2.0`, "6.0 V"],
    [`Vout of 12 V across 1 kΩ and 3 kΩ (across 3 kΩ)`, "9.0 V"],
    [`Power in a 6.0 Ω resistor at 2.0 A`, "24 W"],
    [`Lost volts if I=0.40 A, r=1.5 Ω`, "0.60 V"],
  ]);
}

function alvlFurtherMech(ctx) {
  return genericTopic(ctx, "further mechanics and thermal physics", [
    ["circular motion", "a = v²/r = ω²r", "resultant force towards the centre", "not a new force"],
    ["simple harmonic motion", "a = −ω²x", "isochronous for small angles on a pendulum", "T=2π√(l/g) or 2π√(m/k)"],
    ["energy in SHM", "transfers between KE and PE", "total constant if no damping", "E = ½mω²A²"],
    ["resonance", "driving frequency = natural frequency", "large amplitude", "damping reduces the peak"],
    ["internal energy", "sum of random KE and PE of molecules", "U increases when heated or when work is done on the system", "first law"],
    ["ideal gas assumptions", "point particles, no PE, elastic collisions", "pV=NkT", "RMS speed from (1/2)m c² = (3/2)kT"],
    ["the first law of thermodynamics", "Q = ΔU + W (sign convention as on your spec)", "energy conservation", "careful with the sign of W"],
    ["Brownian motion", "evidence for molecules", "random collisions", "smaller particles move more"],
    ["capacitance (if on your route) or angular speed", "ω=2πf=θ/t", "linked to circular motion", "period T=2π/ω"],
    ["centripetal force examples", "gravity for orbits, tension for a bung, friction for a car", "if F is not enough the object leaves the circle", "banking"],
  ], [
    [`v=ωr. ω=4.0 rad/s, r=0.50 m`, "2.0 m/s"],
    [`a=v²/r. v=6, r=2`, "18 m s⁻²"],
    [`T=2π√(l/g). l=1.0, g=9.8`, "2.0 s"],
    [`pV=nRT. n=2.0, T=300, V=0.050, R=8.31. p`, "9.97 × 10⁴ Pa"],
    [`(3/2)kT for T=300 K (k=1.38×10⁻²³)`, "6.21 × 10⁻²¹ J"],
    [`A mass on a spring: T=0.80 s. f`, "1.25 Hz"],
  ]);
}

function alvlFields(ctx) {
  return genericTopic(ctx, "gravitational, electric and magnetic fields", [
    ["Newton's law of gravitation", "F = Gm₁m₂/r²", "always attractive", "inverse square"],
    ["gravitational field strength", "g = F/m = GM/r²", "N kg⁻¹", "equals free-fall acceleration"],
    ["gravitational potential", "V = −GM/r", "work done per kg from infinity", "equipotentials"],
    ["Coulomb's law", "F = kQq/r²", "attract or repel", "same inverse-square idea"],
    ["electric field strength", "E = F/Q = kQ/r²", "uniform field E=V/d", "between plates"],
    ["capacitance", "C = Q/V", "parallel plate C=εA/d", "energy ½QV"],
    ["magnetic flux", "Φ = BA cosθ", "weber", "cutting flux induces emf"],
    ["Faraday and Lenz", "ε = −N dΦ/dt", "opposes the change", "direction of induced current"],
    ["a charged particle in a B field", "F=BQv, circular path", "r=mv/BQ", "mass spectrometers"],
    ["orbital motion of satellites", "gravity = mv²/r", "geostationary conditions", "period 24 h, equatorial, same sense"],
  ], [
    [`g=GM/r². M=6.0×10²⁴, r=6.4×10⁶, G=6.67×10⁻¹¹`, "9.8 N kg⁻¹"],
    [`E=V/d. 12 V, 4.0 mm`, "3000 V m⁻¹"],
    [`C=Q/V. 6.0 µC, 3.0 V`, "2.0 µF"],
    [`½QV for those values`, "9.0 µJ"],
    [`F=BQv. B=0.20, Q=1.6×10⁻¹⁹, v=3.0×10⁶`, "9.6 × 10⁻¹⁴ N"],
    [`ε=NΔΦ/Δt. N=50, ΔΦ=0.040, Δt=0.10`, "20 V"],
  ]);
}

function alvlNuclear(ctx) {
  return genericTopic(ctx, "nuclear physics", [
    ["the inverse-square law for gamma", "I = k/x²", "plot I vs 1/x²", "safety: inverse square + shielding"],
    ["exponential decay", "N = N₀ e^{−λt}", "λ = ln2 / T½", "activity A=λN"],
    ["binding energy", "energy to separate nucleons", "BE/A is greatest around iron", "fusion/fission release energy if BE/A increases"],
    ["mass defect", "Δm converted with E=Δmc²", "u to kg", "1 u is 931.5 MeV"],
    ["nuclear fission", "induced by a neutron in U-235", "chain reaction, moderators, control rods", "waste is radioactive"],
    ["nuclear fusion", "light nuclei join", "needs high T for electrostatic repulsion", "the process in stars"],
    ["background radiation", "rocks, radon, cosmic, medical, nuclear", "varies with location", "always correct a count"],
    ["safety", "time, distance, shielding", "ALARA", "film badges / GM tubes"],
    ["the inverse square experiment", "measure count vs distance", "correct for background", "random errors in counts"],
    ["a decay chain", "series of decays to a stable isotope", "α and β change the element", "γ does not"],
  ], [
    [`A=λN. λ=0.010 s⁻¹, N=5.0×10¹⁸`, "5.0 × 10¹⁶ Bq"],
    [`T½=8.0 days. λ`, "1.0 × 10⁻⁶ s⁻¹ order (ln2/T)"],
    [`N/N₀ after 3 half-lives`, "1/8"],
    [`I₂/I₁ = (x₁/x₂)². x doubles, I`, "quarters"],
    [`E=mc². 1.0×10⁻⁶ kg`, "9.0 × 10¹⁰ J"],
    [`Activity falls from 240 to 30. Half-lives`, "3"],
  ]);
}

function alvlAstro(ctx) {
  return genericTopic(ctx, "astrophysics and the Newtonian world", [
    ["Stefan's law", "L = 4πr²σT⁴", "power of a black body", "hotter stars are much more luminous"],
    ["Wien's law", "λ_max T = constant", "colour linked to temperature", "blue stars are hotter"],
    ["Hertzsprung–Russell diagram", "L against T (or spectral class)", "main sequence, giants, white dwarfs", "evolution paths"],
    ["parallax", "p in arcseconds, d=1/p parsecs", "nearest stars", "limit of the method"],
    ["the Doppler effect for stars", "Δf/f = v/c", "red-shift recession", "binary stars"],
    ["Hubble's law", "v = H₀ d", "age of the universe ~ 1/H₀", "expanding universe"],
    ["event horizon", "radius from which light cannot escape a black hole", "Rₛ = 2GM/c²", "Schwarzschild"],
    ["dark matter and dark energy (qualitative)", "needed to explain rotation curves and acceleration of expansion", "not directly seen", "active research"],
    ["Kepler's third law", "T² ∝ r³", "from gravity = centripetal force", "used for moons and planets"],
    ["a standard candle", "object of known luminosity", "supernovae, Cepheids", "used to find distance from flux"],
  ], [
    [`d=1/p. p=0.25″`, "4 pc"],
    [`v=H₀d. H₀=70 km s⁻¹ Mpc⁻¹, d=10 Mpc`, "700 km s⁻¹"],
    [`Wien: T if λmax=500 nm, constant=2.9×10⁻³`, "5800 K"],
    [`Age ~ 1/H₀. If H₀=2.2×10⁻¹⁸ s⁻¹`, "1.4 × 10¹⁰ years order"],
    [`Inverse square: flux 4 times smaller. Distance`, "doubles"],
    [`T² ∝ r³. If r×4, T increases by`, "8 times"],
  ]);
}

function genericTopic(ctx, focus, factRows, calcRows) {
  const facts = factRows.map(([term, define, describe, explain]) => F(term, define, describe, explain, describe));
  const calcs = calcSet(calcRows.map(([stem, answer]) => [stem, answer, []]));
  const practicals = [
    { name: `a ${ctx.board}-style required practical linked to ${focus}`, iv: "the independent variable for this topic", dv: "the measured outcome", control: "keep all other variables constant", error: ["repeat and calculate a mean / use a tighter method"] },
    { name: `collecting valid data for ${focus}`, iv: "a chosen factor", dv: "a quantitative measurement", control: "calibrated instrument", error: ["systematic error from zero error"] },
    { name: `drawing a graph for ${focus}`, iv: "x-variable", dv: "y-variable", control: "same scale / same apparatus", error: ["not drawing a line of best fit through the trend"] },
    { name: `evaluating a method about ${focus}`, iv: "method change", dv: "precision / accuracy", control: "same sample size", error: ["too few repeats"] },
  ];
  const compares = facts.slice(0, 4).map((fact, i) => ({
    a: fact.term,
    b: facts[(i + 1) % facts.length].term,
    points: [fact.define, facts[(i + 1) % facts.length].define, "give one linked difference"],
  }));
  const extended = [
    { title: `Explain the key ideas of ${focus} as they appear on a ${ctx.board} ${ctx.level.replace("/IGCSE", "")} paper.`, points: facts.slice(0, 5).map((fact) => fact.define) },
    { title: `${ctx.student} writes a 6-mark answer on ${focus}. State six marking points an examiner would credit.`, points: facts.slice(5, 10).map((fact) => fact.explain || fact.define) },
  ];
  return pack(ctx, { facts, calcs, practicals, compares, extended });
}
