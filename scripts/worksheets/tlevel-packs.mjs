import { composeScience } from "./compose.mjs";

const F = (term, define, describe, explain, apply) => ({ term, define, describe, explain, apply });

function calcSet(items) {
  return items.map(([stem, answer, method]) => ({ stem, answer, marks: 3, method: method || [] }));
}

function packFrom(ctx, focus, factRows, calcRows) {
  const facts = factRows.map(([term, define, describe, explain]) => F(term, define, describe, explain, describe));
  const calcs = calcSet(calcRows.map(([stem, answer]) => [stem, answer, []]));
  const practicals = [
    { name: `a T-Level occupational task on ${focus}`, iv: "the factor being investigated", dv: "the measured result or quality check", control: "follow the SOP and keep other variables constant", error: ["not recording the batch/lot number or operator ID"] },
    { name: `writing or following an SOP for ${focus}`, iv: "a step in the method", dv: "whether the acceptance criteria are met", control: "same calibrated instrument", error: ["skipping a verification check"] },
    { name: `a COSHH / risk-assessment review for ${focus}`, iv: "hazard", dv: "control measure effectiveness", control: "same PPE and waste route", error: ["using expired reagents or the wrong waste stream"] },
    { name: `data review in a LIMS or quality log for ${focus}`, iv: "sample ID", dv: "result vs specification", control: "same calculation method", error: ["transcription error between the instrument and the LIMS"] },
  ];
  const compares = facts.slice(0, 4).map((fact, i) => ({
    a: fact.term,
    b: facts[(i + 3) % facts.length].term,
    points: [fact.define, facts[(i + 3) % facts.length].define, "state one workplace implication"],
  }));
  const extended = [
    { title: `A ${ctx.board} T-Level core / ESP-style question: explain ${focus} for a laboratory or clinical workplace in ${ctx.town}.`, points: facts.slice(0, 5).map((fact) => fact.define) },
    { title: `${ctx.student} must evaluate a process improvement linked to ${focus}. Give six marking points.`, points: facts.slice(5, 10).map((fact) => fact.explain || fact.define) },
  ];
  return composeScience(ctx, { facts, calcs, practicals, compares, extended });
}

export function buildTLevel(topicId, ctx) {
  const table = {
    "working-in-the-sector": workingInSector,
    "health-safety-environment": healthSafety,
    "managing-information-data": managingData,
    "good-scientific-practice": goodPractice,
    "core-biology": coreBiology,
    "core-chemistry": coreChemistry,
    "core-physics": corePhysics,
    "ethics-and-research": ethicsResearch,
    "lab-techniques-sops": labTechniques,
    "lab-quality-glp-gmp": labQuality,
    "lab-chemical-calculations": labCalcs,
    "lab-data-lims-errors": labData,
    "lab-planning-investigations": labPlanning,
    "food-safety-legislation": foodSafety,
    "food-haccp": foodHaccp,
    "food-microbiology": foodMicro,
    "food-materials-technology": foodTech,
    "food-packaging-processing": foodPack,
    "food-production-data": foodData,
    "health-working-in-health": healthWorking,
    "health-person-centred-care": personCentred,
    "health-infection-control": infectionControl,
    "health-safeguarding": safeguarding,
    "health-physiology": healthPhysiology,
    "health-wellbeing": healthWellbeing,
    "hcs-working-in-healthcare-science": hcsWorking,
    "hcs-physiological-measurement": hcsPhys,
    "hcs-point-of-care": hcsPoc,
    "hcs-quality-governance": hcsQuality,
    "hcs-infection-and-safety": infectionControl,
    "hcs-records-and-data": managingData,
  };
  const fn = table[topicId];
  if (!fn) throw new Error(`No T-Level pack for ${topicId}`);
  return fn(ctx);
}

function workingInSector(ctx) {
  return packFrom(ctx, "working in the health and science sector", [
    ["the science sector", "laboratories, manufacturing, food, healthcare science and regulation", "public and private employers", "why T-Level industry placements matter"],
    ["a job role in the sector", "technician, analyst, healthcare science assistant", "needs threshold competence", "progression to an apprenticeship or HNC"],
    ["professional behaviours", "honesty, reliability, respect, confidentiality", "shown in the workplace", "why they affect patient or customer safety"],
    ["teamwork", "working with scientists, clinicians and quality staff", "handover and communication", "why a poor handover causes errors"],
    ["equality, diversity and inclusion", "treating people fairly and removing barriers", "legal duty plus good practice", "reasonable adjustments"],
    ["personal development", "CPD, appraisal, reflective practice", "keeps skills current", "required after qualification"],
    ["an organisational structure", "roles from operative to quality manager", "SOPs sit under a quality system", "who to escalate a deviation to"],
    ["commercial awareness", "cost, waste, turnaround time", "labs have KPIs", "why repeats cost money"],
    ["communication", "verbal, written, digital", "must be accurate and timely", "used in reports and LIMS comments"],
    ["the industry placement", "substantial time with an employer", "applies core knowledge", "assessed against workplace behaviours"],
  ], [
    ["A placement is 315 hours. How many 7.5-hour days is that?", "42 days"],
    ["A team of 6 staff costs £180 per hour. Cost of a 4-hour investigation?", "£720"],
    ["A KPI target is 95% on-time results. 190 of 200 were on time. Percentage?", "95%"],
    ["Turnaround was 48 h and is cut by 25%. New turnaround?", "36 h"],
    ["A rota has 5 staff covering 35 hours. Mean hours each?", "7 h"],
    ["Training lasts 3 days at 7 hours. Total hours?", "21 h"],
  ]);
}

function healthSafety(ctx) {
  return packFrom(ctx, "health, safety and environmental regulations", [
    ["COSHH", "Control of Substances Hazardous to Health", "assesses chemical and biological hazards", "requires controls and training"],
    ["a hazard", "something with the potential to cause harm", "chemical, biological, physical, ergonomic", "not the same as risk"],
    ["risk", "likelihood × severity of harm", "reduced by control measures", "recorded on a risk assessment"],
    ["the hierarchy of control", "eliminate, substitute, engineer, administer, PPE", "PPE is the last line", "do not rely on PPE alone"],
    ["PPE", "personal protective equipment", "coat, goggles, gloves, visor", "must be suitable and worn"],
    ["a safety data sheet", "supplier information on a chemical", "hazards, first aid, disposal", "used when writing COSHH"],
    ["RIDDOR", "Reporting of Injuries, Diseases and Dangerous Occurrences", "serious incidents must be reported", "legal duty"],
    ["waste streams", "clinical, chemical, sharps, general, recycling", "wrong stream is a non-conformance", "prevents pollution"],
    ["an environmental permit / duty of care", "rules on storing and transferring waste", "keep records", "protects the environment"],
    ["an emergency procedure", "spill, fire, first aid, evacuation", "must be practised", "know the assembly point and spill kit"],
  ], [
    ["A 2.0 mol dm⁻³ acid is diluted 1 in 10. New concentration?", "0.20 mol dm⁻³"],
    ["A spill kit is used in 90 s. How many minutes is that?", "1.5 min"],
    ["Risk score = likelihood 3 × severity 4. Score?", "12"],
    ["A stock bottle is 500 cm³. How many 25 cm³ aliquots?", "20"],
    ["Hearing protection is needed above 85 dB. How many dB above 80 is that?", "5 dB"],
    ["A fire drill lasts 4 minutes 20 seconds. Time in seconds?", "260 s"],
  ]);
}

function managingData(ctx) {
  return packFrom(ctx, "managing information and data", [
    ["primary data", "data you collect yourself", "titration titres, instrument printouts", "must be recorded at the time"],
    ["secondary data", "data from other sources", "papers, certificates of analysis", "must be referenced"],
    ["a LIMS", "Laboratory Information Management System", "tracks samples, results and audit trails", "reduces transcription error"],
    ["traceability", "ability to follow a result back to the sample and method", "batch numbers, operator, date", "needed for audits"],
    ["confidentiality", "keeping personal or commercially sensitive data secure", "GDPR / Caldicott in health", "do not share logins"],
    ["accuracy", "how close a result is to the true value", "checked with a certified standard", "bias is systematic error"],
    ["precision", "how close repeats are to each other", "shown by a small range or SD", "precise is not always accurate"],
    ["an outlier", "a result that does not fit the set", "may be a mistake or a real extreme", "investigate before discarding"],
    ["significant figures", "digits that carry meaning", "must match the instrument", "do not overstate precision"],
    ["an audit trail", "who did what and when", "electronic or paper", "required by GLP and ISO 17025"],
  ], [
    ["Mean of 10.2, 10.4, 10.0, 10.2", "10.2"],
    ["Range of those four titres", "0.4"],
    ["A 25.00 cm³ pipette has a tolerance of ±0.03 cm³. Percentage of 25.00?", "0.12%"],
    ["GDPR fine idea: 4 of 80 records were left unlocked. Percentage?", "5%"],
    ["A chart shows 12 samples, 3 failed. Failure rate?", "25%"],
    ["Convert 0.00250 mol to millimoles", "2.50 mmol"],
  ]);
}

function goodPractice(ctx) {
  return packFrom(ctx, "good scientific and clinical practice", [
    ["GLP", "Good Laboratory Practice", "quality system for non-clinical studies", "SOPs, training, archives"],
    ["GMP", "Good Manufacturing Practice", "quality of medicines and products", "prevents contamination and mix-ups"],
    ["an SOP", "standard operating procedure", "step-by-step controlled method", "must be the current version"],
    ["validation", "showing a method is fit for purpose", "accuracy, precision, range", "done before routine use"],
    ["verification", "checking a validated method still works in this lab", "often with a QC sample", "after a new instrument"],
    ["calibration", "adjusting or checking an instrument against standards", "balance, pH meter, pipette", "record the certificate"],
    ["a blank", "sample without the analyte", "detects contamination", "should be below the limit"],
    ["a QC sample", "sample of known value run with the batch", "Westgard / acceptance rules", "out-of-spec stops the batch"],
    ["aseptic technique", "working to prevent contamination", "flames, sterile consumables, laminar flow", "essential in micro"],
    ["reflective practice", "reviewing what went well and what to improve", "used after a placement or ESP", "feeds CPD"],
  ], [
    ["A balance reads 0.002 g with nothing on it. What should you do first?", "tare / zero and record the zero error"],
    ["A pipette is 0.8% high on a 10.00 cm³ check. Absolute error?", "0.080 cm³"],
    ["QC mean is 5.00, result is 5.30. Percentage difference?", "6%"],
    ["Three QC points: 4.9, 5.0, 5.1. Mean?", "5.0"],
    ["An SOP review is every 24 months. Reviews in 6 years?", "3"],
    ["A waterbath is 37.0 ± 0.5 °C. Is 36.4 °C in spec?", "yes (on the lower limit)"],
  ]);
}

function coreBiology(ctx) {
  return packFrom(ctx, "T-Level core biology", [
    ["a eukaryotic cell", "cell with a nucleus and organelles", "animal, plant, fungal", "different from prokaryotes"],
    ["a prokaryotic cell", "no nucleus, DNA in the cytoplasm", "bacteria", "70S ribosomes, cell wall"],
    ["biological molecules", "carbohydrates, lipids, proteins, nucleic acids", "built by condensation", "hydrolysed in digestion"],
    ["an enzyme", "biological catalyst with an active site", "affected by T, pH, inhibitors", "used in food and diagnostics"],
    ["DNA", "double helix of nucleotides", "A-T and G-C", "codes for proteins"],
    ["the cell cycle", "interphase, mitosis, cytokinesis", "growth and repair", "errors can cause tumours"],
    ["a pathogen", "organism or agent that causes disease", "bacteria, viruses, fungi, protozoa", "detected by culture or PCR"],
    ["the immune response", "non-specific then specific", "phagocytes, antibodies, memory cells", "basis of vaccination"],
    ["transport in organisms", "diffusion, osmosis, active transport", "plus mass flow in blood or xylem", "depends on SA:V"],
    ["microbiology", "study of microorganisms", "culture, stain, count, identify", "aseptic technique is essential"],
  ], [
    ["Magnification = 12 mm / 8 µm. Magnification?", "×1500"],
    ["A culture doubles every 30 min. Cells from 1 after 3 h?", "64"],
    ["Enzyme rate 18 cm³ in 3 min. Mean rate?", "6 cm³/min"],
    ["A DNA sample is 20% adenine. Percentage thymine?", "20%"],
    ["Cfu: 45 colonies from 0.1 cm³ of a 10⁻⁴ dilution. cfu/cm³?", "4.5 × 10⁵"],
    ["SA:V of a 2 cm cube", "3 : 1"],
  ]);
}

function coreChemistry(ctx) {
  return packFrom(ctx, "T-Level core chemistry", [
    ["atomic structure", "protons and neutrons in the nucleus, electrons in shells", "atomic number and mass number", "ions form by electron transfer"],
    ["bonding", "ionic, covalent, metallic", "explains MP, conductivity, solubility", "used when choosing materials"],
    ["a mole", "6.02 × 10²³ particles", "n = m/M = cV", "basis of all lab calculations"],
    ["a balanced equation", "same atoms on both sides", "gives mole ratios", "needed before a yield calculation"],
    ["concentration", "moles or grams per dm³", "c = n/V", "prepare with a volumetric flask"],
    ["an acid–base reaction", "H⁺ + OH⁻ → H₂O", "salt plus water", "followed by titration"],
    ["rate of reaction", "change in amount / time", "collision theory", "T, concentration, SA, catalyst"],
    ["an equilibrium", "forward and reverse rates equal in a closed system", "Le Chatelier", "used in industrial processes"],
    ["organic chemistry", "carbon compounds, functional groups", "fuels, polymers, medicines", "displayed and structural formulae"],
    ["chemical analysis", "identify or quantify a substance", "titration, chromatography, spectroscopy", "must be validated"],
  ], [
    ["n in 8.0 g NaOH (M=40)", "0.20 mol"],
    ["c if 0.025 mol in 250 cm³", "0.10 mol dm⁻³"],
    ["Titre 24.80 cm³ of 0.100 mol dm⁻³. Moles?", "0.00248 mol"],
    ["Mr of CaCO₃ (Ca40, C12, O16)", "100"],
    ["Percentage yield 7.2 g from 9.0 g", "80%"],
    ["Rate: 40 cm³ gas in 50 s", "0.80 cm³/s"],
  ]);
}

function corePhysics(ctx) {
  return packFrom(ctx, "T-Level core physics", [
    ["standard units", "SI units and prefixes", "m, kg, s, A, K, mol, cd", "convert before calculating"],
    ["energy stores and transfers", "KE, GPE, thermal, chemical", "W = Fs, efficiency", "used in lab equipment"],
    ["electricity", "I = Q/t, V = IR, P = VI", "series and parallel", "safe use of supplies"],
    ["waves", "v = fλ", "EM spectrum", "UV, IR, ultrasound in labs and clinics"],
    ["particles and radiation", "atoms, isotopes, ionising radiation", "half-life, shielding", "ALARA"],
    ["gas laws", "pV/T constant, kinetic model", "pressure cookers, autoclaves", "T in kelvin"],
    ["forces and pressure", "F = ma, P = F/A", "hydraulics, syringes", "units N and Pa"],
    ["magnetism", "fields, motors, induction", "used in instruments", "Fleming rules"],
    ["measurement uncertainty", "resolution, random and systematic error", "repeats and means", "quote a range or ±"],
    ["graphs", "independent on x, dependent on y", "gradient and intercept", "line of best fit"],
  ], [
    ["I = V/R. 12 V, 48 Ω", "0.25 A"],
    ["v = fλ. 50 Hz, 6.8 m", "340 m/s"],
    ["pV: 100 kPa × 2.0 dm³ to 50 kPa. New V (T constant)?", "4.0 dm³"],
    ["27 °C in kelvin", "300 K"],
    ["W = mg. 0.25 kg, g=9.8", "2.45 N"],
    ["Efficiency 36 J useful from 80 J", "45%"],
  ]);
}

function ethicsResearch(ctx) {
  return packFrom(ctx, "ethics and scientific research", [
    ["informed consent", "a person agrees after understanding the purpose and risks", "can be withdrawn", "required for human studies"],
    ["confidentiality", "protecting identities and data", "anonymise where possible", "legal and professional duty"],
    ["animal research ethics", "replace, reduce, refine", "Home Office licences", "use alternatives if possible"],
    ["conflict of interest", "a personal interest that could bias the work", "must be declared", "protects integrity"],
    ["plagiarism", "presenting others' work as your own", "includes copying data", "reference sources"],
    ["a literature review", "structured search of existing evidence", "Assignment 1 style task", "judge reliability of sources"],
    ["peer review", "other scientists check a paper", "improves quality", "not perfect"],
    ["an Employer Set Project", "synoptic core assessment set by employers", "research, plan, present", "uses core knowledge"],
    ["intellectual property", "patents, copyright, know-how", "belongs to the employer if created at work", "do not share unpublished data"],
    ["sustainable science", "reduce waste, energy and hazardous substances", "green chemistry", "part of corporate responsibility"],
  ], [
    ["A search finds 40 papers, 8 are relevant. Percentage relevant?", "20%"],
    ["A survey of 25 staff, 5 decline consent. Percentage consenting?", "80%"],
    ["An ESP is 12 hours. How many 90-minute sessions?", "8"],
    ["A reference list has 18 sources, 3 are websites. Fraction websites?", "1/6"],
    ["Word limit 1500. 10% extra allowed. Maximum words?", "1650"],
    ["A poster session is 8 minutes plus 2 minutes questions. Total?", "10 min"],
  ]);
}

function labTechniques(ctx) {
  return packFrom(ctx, "laboratory techniques and SOPs", [
    ["a volumetric flask", "makes a solution of known volume and concentration", "make up to the mark at eye level", "used for standards"],
    ["a burette", "delivers a variable volume to 0.05 cm³", "titration", "read the bottom of the meniscus"],
    ["a balance", "measures mass", "analytical balances to 0.0001 g", "draft shield and tare"],
    ["pH measurement", "glass electrode, calibrated buffers", "rinse between samples", "store in KCl"],
    ["chromatography", "separates mixtures", "TLC, HPLC, GC", "Rf or retention time"],
    ["spectroscopy", "interaction of light with matter", "colorimetry, UV-Vis, IR, AA", "Beer–Lambert"],
    ["microscopy", "magnifies a specimen", "light or electron", "calibration slide"],
    ["centrifugation", "separates by density", "balance the tubes", "do not open until stopped"],
    ["an SOP", "controlled method everyone must follow", "version number and author", "deviation must be recorded"],
    ["sample integrity", "correct ID, storage, chain of custody", "prevents mix-ups", "reject if unlabelled"],
  ], [
    ["A 250 cm³ flask is used for 0.100 mol dm⁻³ NaOH. Mass of NaOH (M=40)?", "1.00 g"],
    ["Beer–Lambert: A = εcl. A=0.60, ε=2000, l=1.0 cm. c?", "3.0 × 10⁻⁴ mol dm⁻³"],
    ["Rf = 3.6 / 9.0", "0.40"],
    ["A centrifuge runs at 3000 rpm for 10 min. Total revolutions?", "30000"],
    ["Titres 24.10, 24.20, 24.15. Mean?", "24.15 cm³"],
    ["A 10 cm³ pipette delivers 9.96 cm³. Percentage error?", "0.40%"],
  ]);
}

function labQuality(ctx) {
  return packFrom(ctx, "GLP, GMP and laboratory quality", [
    ["ISO 17025", "competence of testing and calibration labs", "accreditation", "methods, uncertainty, impartiality"],
    ["a non-conformance", "result or process outside the quality system", "must be logged and investigated", "CAPA follows"],
    ["CAPA", "corrective and preventive action", "fix the cause, stop it recurring", "auditors look for this"],
    ["internal audit", "the lab checks itself against procedures", "independent of the work being audited", "finds gaps before an external audit"],
    ["training records", "proof a person is competent", "sign-off on each method", "do not run a method untrained"],
    ["document control", "only current SOPs in use", "obsolete copies withdrawn", "version on every page"],
    ["equipment log", "use, calibration, maintenance, faults", "supports traceability", "do not use if out of cal"],
    ["change control", "planned change is risk-assessed and approved", "software, method, supplier", "prevents silent changes"],
    ["contamination control", "segregate dirty and clean, colour-code", "swab checks", "especially in micro and GMP"],
    ["customer complaint", "treated as a quality event", "investigate and reply", "may trigger a recall"],
  ], [
    ["An audit finds 4 of 50 SOPs expired. Percentage?", "8%"],
    ["Calibration due every 12 months. Next date after March 2026?", "March 2027"],
    ["A CAPA target is 10 days. Closed in 8. Days spare?", "2"],
    ["OOS rate 3 in 150 batches. Percentage?", "2%"],
    ["Training matrix: 18 methods, competent in 15. Percentage?", "83%"],
    ["A fridge must be 2–8 °C. A logger shows 1.5 °C. In spec?", "no"],
  ]);
}

function labCalcs(ctx) {
  return packFrom(ctx, "laboratory chemical calculations", [
    ["n = m/M", "moles = mass / molar mass", "use consistent grams", "first step in most calculations"],
    ["c = n/V", "concentration in mol dm⁻³", "V must be in dm³", "250 cm³ = 0.250 dm³"],
    ["a dilution", "c1V1 = c2V2", "use a pipette and flask", "mix thoroughly"],
    ["a titration calculation", "moles of known, ratio, moles of unknown, then c or m", "concordant titres", "mean of closest values"],
    ["percentage yield", "actual / theoretical × 100", "losses on transfer", "never over 100% if calculated correctly"],
    ["atom economy", "Mr desired / Mr all products × 100", "green chemistry", "independent of yield"],
    ["a standard solution", "known accurate concentration", "primary standard if possible", "used to standardise others"],
    ["uncertainty", "combine pipette, flask and burette errors", "percentage then add", "quote the result accordingly"],
    ["a calibration graph", "absorbance vs concentration", "use the linear range", "do not extrapolate blindly"],
    ["unit prefixes", "m, µ, n, k, M", "1 mg = 10⁻³ g", "common source of 1000× errors"],
  ], [
    ["Dilute 10.0 cm³ of 1.00 mol dm⁻³ to 250 cm³. New c?", "0.0400 mol dm⁻³"],
    ["25.0 cm³ of 0.100 mol dm⁻³ HCl vs NaOH. Moles HCl?", "0.00250 mol"],
    ["If that NaOH titre is 20.0 cm³, c(NaOH)?", "0.125 mol dm⁻³"],
    ["Mass of 0.0500 mol of H₂SO₄ (M=98)", "4.90 g"],
    ["Convert 250 µg to grams", "2.50 × 10⁻⁴ g"],
    ["A graph reads 0.35 absorbance = 7.0 mg dm⁻³. What is 0.70 if linear through 0?", "14 mg dm⁻³"],
  ]);
}

function labData(ctx) {
  return packFrom(ctx, "laboratory data, LIMS and error", [
    ["a random error", "varies unpredictably", "reduced by repeats and a mean", "shown by scatter"],
    ["a systematic error", "shifts all results the same way", "wrong calibration, indicator, temperature", "not fixed by averaging"],
    ["a transcription error", "wrong number copied into LIMS", "prevent with instrument interfaces", "Assignment 3 style issue"],
    ["an instrument fault", "drift, blockage, lamp failure", "QC fails, flags on the printout", "quarantine the instrument"],
    ["sample mix-up", "wrong ID or swapped tubes", "chain of custody failed", "re-collect if possible"],
    ["Westgard rules (idea)", "QC rules that detect error", "1-3s, 2-2s", "reject the run if failed"],
    ["a control chart", "plots QC over time", "warning and action limits", "shows drift"],
    ["root-cause analysis", "5 whys / fishbone", "find the system cause", "feeds CAPA"],
    ["data integrity ALCOA", "attributable, legible, contemporaneous, original, accurate", "no back-dating", "regulators expect this"],
    ["process improvement", "change the SOP, training or equipment", "must be validated", "PO3 of Laboratory Sciences"],
  ], [
    ["Results 10.1, 10.3, 12.9, 10.2. Which is the likely outlier?", "12.9"],
    ["Mean of the three concordant values 10.1, 10.3, 10.2", "10.2"],
    ["A QC limit is 5.00 ± 0.20. Is 5.25 acceptable?", "no"],
    ["SD idea: values 4, 6, 8. Mean and range?", "mean 6, range 4"],
    ["A LIMS audit finds 6 of 120 entries edited. Percentage?", "5%"],
    ["Two analysts differ by 0.40 on a mean of 20.0. Percentage difference?", "2%"],
  ]);
}

function labPlanning(ctx) {
  return packFrom(ctx, "planning and reviewing laboratory investigations", [
    ["a hypothesis", "a testable statement", "based on the literature", "Assignment 1"],
    ["variables", "independent, dependent, control", "only change one IV", "record units"],
    ["a risk assessment", "hazards, who is harmed, controls, residual risk", "signed before starting", "dynamic if the method changes"],
    ["a sampling plan", "how many, from where, how stored", "must be representative", "include blanks"],
    ["a method selection", "fit for purpose, available kit, cost, time", "from SOPs or papers", "justify in the report"],
    ["repeats and reproducibility", "same person vs different person/lab", "needed for confidence", "state n"],
    ["acceptance criteria", "the numbers that mean a pass", "set before you see the data", "in the SOP or protocol"],
    ["a literature search", "keywords, databases, date limits", "evaluate bias", "Harvard or numbered refs"],
    ["a scientific report", "aim, method, results, discussion, conclusion", "graphs with titles and units", "uncertainties discussed"],
    ["review and improvement", "what limited the method", "next experiment", "PO2 of Laboratory Sciences"],
  ], [
    ["Five repeats take 12 minutes each plus 20 minutes setup. Total time?", "80 min"],
    ["A sample plan is every 15 min for 3 hours. How many samples?", "13 including t=0, or 12 if not — state 12 intervals = 13 if start included"],
    ["n=6. How many degrees of freedom for a mean?", "5"],
    ["A 2×3 factorial has how many combinations?", "6"],
    ["Stock is enough for 8 runs. Runs already done: 3. Remaining?", "5"],
    ["A report is 8 pages, 2 are appendix. Percentage appendix?", "25%"],
  ]);
}

function foodSafety(ctx) {
  return packFrom(ctx, "food safety, quality and legislation", [
    ["food safety", "food will not harm the consumer", "biological, chemical, physical hazards", "legal duty of the FBO"],
    ["the Food Standards Agency", "UK regulator for food", "hygiene ratings, incidents", "works with local authorities"],
    ["a food business operator", "the person responsible for the business", "must have a food safety management system", "due diligence defence"],
    ["allergen control", "14 named allergens in GB", "prevent cross-contact", "labelling must be accurate"],
    ["traceability", "one step forward and one step back", "batch codes", "needed for a recall"],
    ["a recall vs a withdrawal", "recall includes the consumer", "withdrawal is from the supply chain only", "serious risk triggers recall"],
    ["food hygiene rating", "0–5 from a local authority inspection", "published", "cleaning, temperature, training"],
    ["ethical issues in food", "animal welfare, fair trade, advertising to children", "plus sustainability", "company policy"],
    ["quality vs safety", "quality is specification and customer expectation", "safety is absence of harm", "both need records"],
    ["training", "staff must be trained for their tasks", "refresher needed", "competency records"],
  ], [
    ["A batch is 240 packs, 12 are hold-back samples. Percentage hold-back?", "5%"],
    ["Chill food must be ≤ 8 °C. A probe reads 9.5 °C. Action?", "do not use / investigate / discard per SOP"],
    ["Hot hold ≥ 63 °C. How many °C above 60 is that?", "3 °C"],
    ["A recall affects 3 of 15 retailers. Percentage?", "20%"],
    ["Use-by is 22 Aug. Today is 20 Aug. Days remaining?", "2"],
    ["A label lists 8 allergens present of the 14. How many not used?", "6"],
  ]);
}

function foodHaccp(ctx) {
  return packFrom(ctx, "HACCP in the food and drink industry", [
    ["HACCP", "Hazard Analysis and Critical Control Points", "preventive food safety system", "legal requirement for FBOs"],
    ["a prerequisite programme", "basic hygiene that must already be in place", "cleaning, pest control, water, training", "HACCP sits on top"],
    ["a hazard analysis", "list what could go wrong at each step", "bio, chem, physical, allergen", "likelihood and severity"],
    ["a CCP", "critical control point where control is essential", "e.g. cook temperature", "has a critical limit"],
    ["a critical limit", "the value that separates safe from unsafe", "e.g. 75 °C for 30 s", "must be measurable"],
    ["monitoring", "checking the CCP is in control", "temperature log, metal detector", "frequency set in the plan"],
    ["corrective action", "what to do if a limit is failed", "hold, rework or dispose", "record it"],
    ["verification", "checking the HACCP plan works", "audit, microbiological swab, calibration", "not the same as monitoring"],
    ["documentation", "plan, logs, deviations", "kept for the required time", "due diligence"],
    ["a flow diagram", "steps from raw material to dispatch", "validated on site", "used in the hazard analysis"],
  ], [
    ["A cook CCP is 75 °C. A core probe is 72 °C. Has the CCP passed?", "no"],
    ["Monitoring is every 30 min for an 8-hour shift. How many checks?", "16"],
    ["A metal detector rejects 2 of 500 packs. Percentage?", "0.40%"],
    ["Records are kept for 12 months. Weeks (approx)?", "52"],
    ["Three CCPs on a line. If each has 2 critical limits, how many limits?", "6"],
    ["A cooling CCP is 5 °C within 90 min. At 60 min the food is 8 °C. Still in time?", "yes, 30 min remain — but must continue monitoring"],
  ]);
}

function foodMicro(ctx) {
  return packFrom(ctx, "food microbiology", [
    ["a foodborne pathogen", "microbe that causes illness via food", "Salmonella, Listeria, Campylobacter, E. coli", "zero or very low limits"],
    ["a spoilage organism", "makes food unacceptable but not always unsafe", "yeasts, moulds, lactic acid bacteria", "shelf-life testing"],
    ["the danger zone", "5–63 °C where many bacteria grow fast", "keep food out of it", "chill or hot-hold"],
    ["water activity", "available water for microbes", "lowered by salt, sugar, drying", "controls spoilage"],
    ["pH and food", "low pH inhibits many pathogens", "pickles, yoghurt", "not a CCP on its own unless validated"],
    ["cross-contamination", "transfer of microbes from raw to ready-to-eat", "boards, cloths, hands", "colour-coded equipment"],
    ["a colony count", "cfu per gram or ml", "serial dilution and plates", "incubation time and T matter"],
    ["hygiene swabbing", "checks cleaning", "pass/fail limits in the SOP", "trend over time"],
    ["shelf-life", "time the food stays safe and of quality", "challenge tests, storage trials", "use-by vs best-before"],
    ["pasteurisation", "heat process that reduces pathogens", "not sterile", "time–temperature combination"],
  ], [
    ["45 colonies from 1 cm³ of a 10⁻³ dilution. cfu/cm³?", "4.5 × 10⁴"],
    ["A 25 g sample in 225 cm³ diluent. First dilution factor?", "10⁻¹"],
    ["Danger zone width from 5 to 63 °C", "58 °C"],
    ["Fridge 4 °C vs room 20 °C. Difference?", "16 °C"],
    ["Swabs: 2 of 20 fail. Percentage fail?", "10%"],
    ["Generation time 20 min. Generations in 2 h?", "6"],
  ]);
}

function foodTech(ctx) {
  return packFrom(ctx, "food raw materials and technology", [
    ["a raw material specification", "agreed quality, safety and legal limits", "on the COA", "reject if out of spec"],
    ["functional properties of proteins", "foaming, gelling, emulsifying", "egg, milk, soya", "affected by heat and pH"],
    ["functional properties of starch", "gelatinisation and retrogradation", "sauces and bakery", "temperature control"],
    ["an emulsion", "immiscible liquids with an emulsifier", "mayonnaise, milk", "can split if abused"],
    ["a new product development brief", "target consumer, cost, claims, process", "PO2 of Food Sciences", "sensory and shelf-life"],
    ["sensory analysis", "taste, smell, texture, appearance", "triangle tests, hedonic scales", "bias control"],
    ["fortification", "adding nutrients", "legal for some foods", "must not mislead"],
    ["a substitute ingredient", "used for cost, allergy or nutrition", "may change function", "re-validate the process"],
    ["process capability", "can the line hit the spec consistently", "weights, fill, seal", "reduces waste"],
    ["sustainability of ingredients", "water, land, food miles, seasonality", "part of the brief", "label claims need evidence"],
  ], [
    ["A recipe uses 80 g sugar in 400 g mix. Percentage sugar?", "20%"],
    ["Scale a recipe from 5 kg to 12.5 kg. Scale factor?", "2.5"],
    ["A 30 g serving has 6 g protein. Percentage protein?", "20%"],
    ["NPD trial: 8 of 40 testers prefer the new recipe. Percentage?", "20%"],
    ["Fill target 250 g ± 5 g. Is 243 g in spec?", "no"],
    ["Yield 18 kg from 20 kg mix. Percentage yield?", "90%"],
  ]);
}

function foodPack(ctx) {
  return packFrom(ctx, "food packaging and processing", [
    ["MAP", "modified atmosphere packaging", "changes O₂/CO₂/N₂", "extends shelf-life"],
    ["vacuum packing", "removes air", "reduces oxidation and aerobic spoilage", "Clostridium risk if abused"],
    ["a barrier film", "limits oxygen, moisture or light", "chosen for the food", "thickness and material"],
    ["a heat process", "pasteurise, sterilise, UHT, canning", "F₀ / P-value ideas", "commercial sterility"],
    ["freezing", "slows microbial growth", "does not sterilise", "temperature abuse on thawing"],
    ["drying", "lowers water activity", "spray dry, freeze dry", "rehydration quality"],
    ["a seal integrity test", "dye, burst, vacuum", "CCP on many lines", "leakers spoil or become unsafe"],
    ["labelling law", "name, allergens, QUID, durability, origin where required", "must match the pack", "enforced by Trading Standards / FSA"],
    ["line start-up checks", "first-off samples, code, date, seal", "do not release until passed", "recorded"],
    ["process deviation", "temperature, time or seal out of spec", "hold the batch", "investigate before release"],
  ], [
    ["A retort is 121 °C for 15 min. Total minutes at that T?", "15 min"],
    ["MAP gas 30% CO₂. Volume of CO₂ in 2.0 dm³ pack (approx if filled with that mix)?", "0.60 dm³"],
    ["400 packs/hour for 7.5 hours. Output?", "3000 packs"],
    ["A seal fail rate of 6 in 2000. Percentage?", "0.30%"],
    ["Frozen storage −18 °C. How many °C below 0?", "18 °C"],
    ["A code date is Julian day 200. What month is day 200 roughly?", "July"],
  ]);
}

function foodData(ctx) {
  return packFrom(ctx, "food production data", [
    ["a process control chart", "plots weight, T or pH vs time", "spots drift", "PO4 of Food Sciences"],
    ["mass balance", "in = out + waste + hold-up", "finds losses", "used in yield meetings"],
    ["a specification limit", "LSL and USL", "legal or customer", "OOS cannot be released"],
    ["trend analysis", "looking at data over weeks", "seasonal spoilage, supplier issues", "feeds improvement"],
    ["a laboratory COA", "certificate of analysis", "must match the spec", "check before use"],
    ["sampling for QC", "random or structured", "enough to be representative", "retain a reference sample"],
    ["uncertainty of a weight", "scale resolution and draughts", "average of repeats", "legal metrology for pack weights"],
    ["pack-weight law (idea)", "average system / minimum weight", "e-mark", "do not systematically underfill"],
    ["a dashboard KPI", "complaints, yield, downtime, micro fails", "reviewed daily", "escalate if red"],
    ["data integrity in food labs", "same ALCOA rules", "no deleting failed tests", "auditors will ask"],
  ], [
    ["In 100 kg, out 92 kg product and 5 kg waste. Unaccounted?", "3 kg"],
    ["Mean pack weight 502 g, target 500 g. Difference?", "2 g"],
    ["20 packs: 2 below the minimum. Percentage?", "10%"],
    ["Downtime 40 min in an 8-hour shift. Percentage downtime?", "8.3%"],
    ["Micro fail 1 in 50 lots. Percentage?", "2%"],
    ["Yield target 96%. Actual 24.0 kg from 25.0 kg. Met?", "yes (96%)"],
  ]);
}

function healthWorking(ctx) {
  return packFrom(ctx, "working in health", [
    ["the health and science route", "NHS, private, social care, public health", "multidisciplinary teams", "T-Level placement"],
    ["scope of practice", "tasks you are trained and allowed to do", "do not work beyond it", "ask a registered professional"],
    ["confidentiality in health", "Caldicott principles and GDPR", "need-to-know", "never discuss patients in public"],
    ["duty of care", "legal responsibility to keep people safe", "includes raising concerns", "whistleblowing routes"],
    ["person-centred values", "dignity, respect, choice, partnership", "care is with the person not to them", "NICE / NHS constitution"],
    ["communication barriers", "language, hearing, anxiety, jargon", "use interpreters and plain English", "check understanding"],
    ["record keeping", "accurate, contemporaneous, attributable", "legal document", "if it is not written it was not done"],
    ["supervision", "oversight by a competent person", "students must be supervised", "escalation if unsure"],
    ["wellbeing of staff", "breaks, PPE, occupational health", "reduces errors", "report near-misses"],
    ["equality in care", "protected characteristics", "reasonable adjustments", "do not discriminate"],
  ], [
    ["A shift is 12 hours with 3 × 20 min breaks. Working time?", "11 h"],
    ["A caseload of 18 patients, 6 need a translator. Percentage?", "33%"],
    ["Observations every 15 min for 2 hours. How many sets if starting at t=0?", "9"],
    ["Training: 8 modules, 5 completed. Remaining?", "3"],
    ["A handover is 10 minutes for 8 patients. Mean per patient?", "1.25 min"],
    ["Incident forms: 4 in 80 shifts. Rate per shift?", "0.05"],
  ]);
}

function personCentred(ctx) {
  return packFrom(ctx, "person-centred care", [
    ["person-centred care", "care planned around the person's needs and wishes", "shared decisions", "improves outcomes"],
    ["consent", "must be voluntary, informed and capacity-based", "can be withdrawn", "implied vs written"],
    ["capacity", "Mental Capacity Act: assume capacity, support decision-making", "best interests if lacking capacity", "least restrictive option"],
    ["a care plan", "agreed goals and actions", "reviewed regularly", "the person should contribute"],
    ["dignity and privacy", "close curtains, ask before touching", "cultural needs", "never shame"],
    ["advocacy", "someone who speaks for the person", "used if they cannot speak up", "independent advocate"],
    ["coproduction", "people help design the service", "not just a survey", "T-Level ESP can include this idea"],
    ["personalisation", "choice of how and when care is given", "direct payments in social care", "one size does not fit all"],
    ["family and carers", "include them with consent", "they hold useful history", "carer wellbeing matters too"],
    ["complaints", "a right and a learning tool", "acknowledge and investigate", "does not mean you stop caring"],
  ], [
    ["A review is every 6 weeks. Reviews in 1 year?", "about 8–9"],
    ["12 people are offered a choice, 3 decline. Percentage accepting?", "75%"],
    ["A meeting is 45 minutes. How many 15-minute slots?", "3"],
    ["A survey of 40 families, 28 are satisfied. Percentage?", "70%"],
    ["Two advocates cover 18 people. Mean caseload?", "9"],
    ["A consent form has 6 sections, 1 unsigned. Complete?", "no"],
  ]);
}

function infectionControl(ctx) {
  return packFrom(ctx, "infection prevention and control", [
    ["standard precautions", "used for all people", "hand hygiene, PPE, safe sharps, waste", "assume blood and body fluids are infectious"],
    ["the chain of infection", "infectious agent, reservoir, portal of exit, transmission, portal of entry, host", "break any link", "cleaning breaks reservoirs"],
    ["hand hygiene", "WHO 5 moments", "soap and water or alcohol gel", "nails short, no jewellery"],
    ["PPE in health", "gloves, apron, mask, eye protection", "don and doff in order", "dispose as clinical waste"],
    ["isolation / transmission-based precautions", "contact, droplet, airborne", "side room, signage", "MRSA, norovirus, TB"],
    ["decontamination", "clean, disinfect, sterilise", "choose the right level", "dirty to clean workflow"],
    ["a sharps injury", "bleed, wash, report, occupational health", "never recap", "RIDDOR if applicable"],
    ["outbreak", "more cases than expected", "swab, isolate, enhance cleaning", "incident meeting"],
    ["vaccination of staff", "protects staff and patients", "flu, hepatitis B, COVID where policy", "occupational health"],
    ["antimicrobial stewardship", "use the right drug, dose and duration", "reduces resistance", "do not pressure for unnecessary antibiotics"],
  ], [
    ["Hand gel contact time 20 s. Gels in a 10-minute run if one every 2 min?", "5"],
    ["A bay of 6 beds, 2 isolated. Percentage isolated?", "33%"],
    ["Outbreak: 8 cases from 40 residents. Attack rate?", "20%"],
    ["Sharps bins are replaced at 3/4 full. A 4 litre bin. Volume at change?", "3 litres"],
    ["Audit: 18 of 20 staff bare-below-elbow. Percentage compliant?", "90%"],
    ["Incubation 24–48 h. Mid-point in hours?", "36 h"],
  ]);
}

function safeguarding(ctx) {
  return packFrom(ctx, "safeguarding", [
    ["safeguarding", "protecting people's right to live in safety, free from abuse and neglect", "everyone's responsibility", "report, do not investigate alone"],
    ["types of abuse", "physical, sexual, emotional, financial, neglect, organisational, discriminatory, modern slavery", "spot the signs", "record facts"],
    ["a disclosure", "someone tells you they are being harmed", "listen, do not promise secrecy", "report to the safeguarding lead"],
    ["the safeguarding lead", "named person in the organisation", "decides next steps", "you must know who they are"],
    ["prevent duty", "stop people being drawn into terrorism", "notice, check, share", "training is mandatory in many roles"],
    ["FGM and forced marriage", "illegal in the UK", "safeguarding and police", "do not discuss with the family first if it increases risk"],
    ["capacity and safeguarding", "a person may still be at risk if they have capacity", "share information if others are at risk", "MCA and safeguarding work together"],
    ["recording", "date, time, what was said, who was present", "do not add opinions as facts", "sign and job title"],
    ["whistleblowing", "raising a concern about the organisation", "legal protection", "use the policy if internal routes fail"],
    ["multi-agency working", "social care, police, health, education", "information sharing protocols", "the person is at the centre"],
  ], [
    ["A concern must be reported the same day. Hours left if noticed at 14:00 and shift ends 20:00?", "report immediately — do not wait 6 h"],
    ["Training every 12 months. Months late if last done 15 months ago?", "3"],
    ["6 types of abuse are listed in a quiz of 8. How many missing?", "2"],
    ["A log has 12 entries, 3 lack a time. Percentage incomplete?", "25%"],
    ["Two staff plus a lead attend a 30-min meeting. Staff-minutes?", "90"],
    ["A referral form has 10 mandatory fields, 9 complete. Can it be sent?", "no — complete the last field"],
  ]);
}

function healthPhysiology(ctx) {
  return packFrom(ctx, "human physiology for health", [
    ["homeostasis", "keeping a stable internal environment", "temperature, glucose, water, blood pressure", "negative feedback"],
    ["the cardiovascular system", "heart, blood, vessels", "transports O₂, CO₂, nutrients", "pulse and BP observations"],
    ["the respiratory system", "airways and lungs", "gas exchange in alveoli", "spo2 and respiratory rate"],
    ["the nervous system", "CNS and PNS", "fast electrical control", "GCS / AVPU in emergencies"],
    ["the endocrine system", "hormones in the blood", "slower, longer lasting", "diabetes is an endocrine disorder"],
    ["the digestive system", "breaks down food and absorbs nutrients", "liver and pancreas assist", "malnutrition risk"],
    ["the renal system", "kidneys filter blood and balance fluid", "urine output is a key observation", "AKI risk"],
    ["NEWS2 (idea)", "early warning score from observations", "escalation thresholds", "you record, a clinician interprets"],
    ["normal adult ranges (typical teaching values)", "HR 60–100, RR 12–20, temp 36.1–37.2", "know the values your placement uses", "report outside range"],
    ["pathophysiology idea", "how disease changes normal function", "infection, inflammation, ischaemia", "links observations to the person"],
  ], [
    ["Pulse 72 bpm. Beats in 5 minutes?", "360"],
    ["BP 120/80. Pulse pressure?", "40 mmHg"],
    ["RR 16 /min. Breaths in 1 hour?", "960"],
    ["Temp 38.5 °C. How many °C above 37.0?", "1.5 °C"],
    ["Fluid balance: in 1800 ml, out 1500 ml. Balance?", "+300 ml"],
    ["Spo2 94%. How many % below 98%?", "4"],
  ]);
}

function healthWellbeing(ctx) {
  return packFrom(ctx, "health and wellbeing", [
    ["health", "physical, mental and social wellbeing, not only absence of disease", "WHO idea", "wider determinants matter"],
    ["wider determinants", "housing, income, education, environment", "not only lifestyle", "public health role"],
    ["health promotion", "enabling people to increase control over their health", "Make Every Contact Count", "brief advice"],
    ["mental health", "emotional and psychological wellbeing", "anxiety, depression, psychosis", "parity of esteem"],
    ["nutrition and hydration", "balanced diet and enough fluid", "MUST / food charts", "dehydration worsens confusion"],
    ["physical activity", "reduces CVD, diabetes, depression risk", "NICE activity guidelines", "adapt for ability"],
    ["smoking, alcohol and drugs", "major risk factors", "very brief advice and referral", "be non-judgemental"],
    ["screening", "tests a population to find disease early", "must be consented", "false positives and negatives"],
    ["immunisation", "prevents infectious disease", "herd immunity", "record in the notes"],
    ["health inequalities", "avoidable differences in health", "vary by postcode and group", "services should close the gap"],
  ], [
    ["A clinic sees 30 people, 6 smoke. Percentage smokers?", "20%"],
    ["Fluid target 1600 ml. Drunk 1200 ml. Remaining?", "400 ml"],
    ["BMI: 80 kg, 1.60 m. BMI = m/h²", "31.3"],
    ["A walk of 30 min on 5 days. Minutes per week?", "150 min"],
    ["Alcohol units: 2 pints of 4% (approx 2.3 units each). Total?", "4.6 units"],
    ["Uptake 42 of 50 invited. Percentage?", "84%"],
  ]);
}

function hcsWorking(ctx) {
  return packFrom(ctx, "working in healthcare science", [
    ["healthcare science", "prevention, diagnosis, treatment and monitoring using science", "life, physiological, physical sciences and informatics", "NHS Healthcare Science pathway"],
    ["a healthcare science assistant / associate", "supports registered scientists", "follows protocols", "T-Level threshold competence"],
    ["point of work", "wards, clinics, labs, community, theatres", "patients may be present", "professional appearance and ID"],
    ["quality in HCS", "IQC, EQA, ISO standards", "results affect clinical decisions", "never guess a result"],
    ["patient identification", "full name, DOB, NHS number, wristband", "two identifiers minimum", "stop if they do not match"],
    ["infection control in clinics", "decontaminate probes and couches", "single-use where required", "bare below the elbows"],
    ["escalation", "abnormal result or unwell patient", "use the local policy and NEWS2", "stay with the patient if needed"],
    ["stock and reagents", "check expiry and lot", "FIFO", "do not use out-of-date kits"],
    ["reflective CPD", "AHCS / professional body expectations", "log placement learning", "feeds the ESP"],
    ["the multidisciplinary team", "doctors, nurses, scientists, AHP", "your result is one part of the picture", "communicate clearly"],
  ], [
    ["A clinic list is 24 patients in 4 hours. Mean minutes each?", "10 min"],
    ["2 identifiers required. A form has name only. Proceed?", "no"],
    ["IQC fails 1 in 20 days. Percentage?", "5%"],
    ["A probe wipe takes 30 s. Wipes for 12 patients?", "6 min"],
    ["Reagent expires in 14 days. Weeks remaining?", "2"],
    ["EQA is quarterly. Schemes in 2 years?", "8"],
  ]);
}

function hcsPhys(ctx) {
  return packFrom(ctx, "physiological measurement", [
    ["an ECG", "electrical activity of the heart", "correct lead placement", "artefact from movement or poor contact"],
    ["blood pressure", "force of blood on artery walls", "correct cuff size and position", "document arm and position"],
    ["spirometry", "lung volumes and flow", "technique-dependent", "contraindications exist"],
    ["pulse oximetry", "estimate of oxygen saturation", "poor if cold hands or nail polish", "not the same as arterial blood gas"],
    ["peak flow", "fastest blow into a meter", "asthma monitoring", "best of three"],
    ["audiometry / vision (idea)", "screening physiological tests", "quiet room, calibrated kit", "refer if fail"],
    ["a biological signal", "small voltages or flows", "need a good electrode / sensor", "filter noise"],
    ["calibration of physiological kit", "simulators and leak tests", "before the clinic", "record in the log"],
    ["patient preparation", "rest, clothing, explanation, consent", "reduces artefact", "check understanding"],
    ["normal vs artefact", "know common traces", "do not diagnose beyond scope", "a scientist interprets"],
  ], [
    ["BP 118/76. Pulse pressure?", "42 mmHg"],
    ["Best of three peak flows: 380, 400, 390. Record?", "400"],
    ["ECG paper 25 mm/s. 5 large squares is how many seconds?", "1.0 s"],
    ["HR from R-R of 20 small squares (1 mm = 0.04 s): 60 / 0.80", "75 bpm"],
    ["Spo2 readings 96, 97, 96. Mean?", "96.3 (or 96%)"],
    ["A clinic of 15 ECGs at 8 min each. Total time?", "120 min"],
  ]);
}

function hcsPoc(ctx) {
  return packFrom(ctx, "point-of-care testing", [
    ["POCT", "testing near the patient, not in the central lab", "glucose, INR, blood gas, urine dip", "faster decisions"],
    ["governance of POCT", "a named lead and training", "IQC and EQA still required", "connectivity to the record"],
    ["a glucose meter", "capillary blood", "coding / QC, expiry of strips", "wash hands, correct site"],
    ["a urine dipstick", "timed reading, mid-stream sample", "false results if left too long", "infection control"],
    ["blood gas (idea)", "arterial or venous per protocol", "no bubbles, mix, analyse quickly", "critical results phoned"],
    ["critical / alert values", "results that need immediate action", "know the list", "document who you told"],
    ["limitations of POCT", "less precise than the lab sometimes", "interferences", "confirm unexpected results"],
    ["waste from POCT", "sharps and contaminated strips", "correct bins", "never leave a lancet"],
    ["training and lock-out", "untrained users cannot run the device", "barcodes / passwords", "do not share logins"],
    ["stock control", "strips and QC material in date and stored correctly", "temperature logs", "do not use if stored badly"],
  ], [
    ["A glucose is 18.2 mmol/L, alert > 15. Action?", "treat as critical — escalate per SOP"],
    ["Strip pot of 50, 8 used. Remaining?", "42"],
    ["QC every 24 h. Hours late at 30 h?", "6"],
    ["A dipstick is read at 60 s, SOP says 30 s. Valid?", "no"],
    ["Three QC lots, one failed. Lots still in use if failed is quarantined?", "2"],
    ["A clinic runs 40 glucoses. QC + 2 patient repeats. Total strip uses?", "43"],
  ]);
}

function hcsQuality(ctx) {
  return packFrom(ctx, "quality and governance in healthcare science", [
    ["clinical governance", "the system that keeps care safe and effective", "audit, risk, training, evidence", "everyone's job"],
    ["IQC", "internal quality control", "run with patient samples", "accept or reject the batch"],
    ["EQA", "external quality assessment", "blind samples from a scheme", "compares you with other labs"],
    ["uncertainty of measurement", "doubt in a result", "must be estimated for accredited tests", "do not over-interpret a small change"],
    ["ISO 15189", "quality for medical labs", "competence and patients", "UKAS accreditation"],
    ["a clinical incident", "something that caused or could cause harm", "Datix / local system", "duty of candour if harm"],
    ["document control in HCS", "current IFU and SOP only", "version on the analyser", "old kit instructions removed"],
    ["information governance", "safe use of patient data", "smartcards, lock screens", "no photos of results"],
    ["service improvement", "PDSA cycles", "reduce waits and errors", "use data not guesses"],
    ["the HCPC / AHCS standards (idea)", "professional standards for scientists", "students work towards them", "honesty about mistakes"],
  ], [
    ["EQA 3 times a year. In 4 years?", "12"],
    ["IQC fail 2 of 25 days. Percentage?", "8%"],
    ["Turnaround target 60 min, actual 75 min. Percentage over?", "25%"],
    ["An uncertainty is ±0.2 on 5.0. Relative %?", "4%"],
    ["Incidents 6, 2 caused harm. Percentage harm?", "33%"],
    ["A PDSA cycle weekly for 8 weeks. Cycles?", "8"],
  ]);
}
