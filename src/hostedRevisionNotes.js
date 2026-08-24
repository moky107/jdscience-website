const BIO_TOPIC1_PPTX = "https://xugsznxfvpbifpzpuoek.supabase.co/storage/v1/object/public/resources/gcse-igcse/biology/edexcel/revision-notes/1785700782822-jdscience-gcse-biology-topic1-final-pptx";

const PHYSICS_PPTX = {
  energy: "https://xugsznxfvpbifpzpuoek.supabase.co/storage/v1/object/public/resources/gcse-igcse/physics/aqa/revision-notes/1786377466711-jdscience-aqa-gcse-physics-1-energy-1-pptx",
  electricity: "https://xugsznxfvpbifpzpuoek.supabase.co/storage/v1/object/public/resources/gcse-igcse/physics/aqa/revision-notes/1786377468629-jdscience-aqa-gcse-physics-2-electricity-pptx",
  particles: "https://xugsznxfvpbifpzpuoek.supabase.co/storage/v1/object/public/resources/gcse-igcse/physics/aqa/revision-notes/1786377468227-jdscience-aqa-gcse-physics-3-particle-model-of-matter-pptx",
  forces: "https://xugsznxfvpbifpzpuoek.supabase.co/storage/v1/object/public/resources/gcse-igcse/physics/aqa/revision-notes/1786377467794-jdscience-aqa-gcse-physics-5-forces-pptx",
  waves: "https://xugsznxfvpbifpzpuoek.supabase.co/storage/v1/object/public/resources/gcse-igcse/physics/aqa/revision-notes/1786377467326-jdscience-aqa-gcse-physics-6-waves-pptx",
  atomic: "https://xugsznxfvpbifpzpuoek.supabase.co/storage/v1/object/public/resources/gcse-igcse/physics/edexcel/revision-notes/1786378722441-jdscience-20gcse-20physics-20-20atomic-20structure-pptx",
};

function note(partial) {
  const slug = partial.topicSlug;
  const subjectSlug = String(partial.subject || "").toLowerCase();
  return {
    level: "GCSE/IGCSE",
    exam_board: partial.exam_board || "AQA",
    resource_category: "Revision Notes",
    all_boards: true,
    file_name: `${slug}.html`,
    file_url_override: `/resources/gcse/${subjectSlug}/revision-notes/${slug}/`,
    ...partial,
  };
}

export const HOSTED_REVISION_NOTES = [
  note({
    subject: "Biology",
    title: "Cell Biology",
    topicSlug: "cell-biology",
    downloadHref: BIO_TOPIC1_PPTX,
    downloadLabel: "Download Topic 1 slides (PowerPoint)",
    notesHtml: `
      <div class="callout">Original JD Science GCSE Biology notes. Use the download for the slide deck, or revise from the summary below.</div>
      <h2>Cells</h2>
      <p>All living organisms are made of cells. Animal and plant cells are eukaryotic: they have a nucleus, cytoplasm, cell membrane, mitochondria and ribosomes. Plant cells also have a cell wall of cellulose, a permanent vacuole and often chloroplasts.</p>
      <p>Bacterial cells are prokaryotic. They are smaller, with no nucleus. DNA is a single loop in the cytoplasm, and they may have plasmids, a cell wall and a flagellum.</p>
      <h2>Microscopy and size</h2>
      <ul>
        <li>Light microscopes use light and lenses. They can view living cells but have lower resolution.</li>
        <li>Electron microscopes have much higher magnification and resolution, so organelles such as mitochondria and ribosomes can be seen.</li>
        <li>Image size = actual size × magnification. Rearrange to find the missing value and convert units carefully (1 mm = 1000 µm).</li>
      </ul>
      <h2>Cell division</h2>
      <p>Mitosis produces two identical diploid cells for growth and repair. The cell cycle includes growth, DNA replication and then mitosis. Stem cells can differentiate. Embryonic stem cells can become any cell type; adult stem cells are more limited. In plants, meristems provide stem cells throughout life.</p>
      <h2>Transport</h2>
      <ul>
        <li><strong>Diffusion</strong> is the net movement of particles from higher to lower concentration.</li>
        <li><strong>Osmosis</strong> is the diffusion of water through a partially permeable membrane.</li>
        <li><strong>Active transport</strong> moves substances against a concentration gradient and requires energy from respiration.</li>
      </ul>
    `,
  }),
  note({
    subject: "Biology",
    title: "Organisation",
    topicSlug: "organisation",
    notesHtml: `
      <div class="callout">Cells → tissues → organs → organ systems. Learn the order and one example of each.</div>
      <h2>Human digestive system</h2>
      <p>Food is broken down so soluble molecules can be absorbed. Enzymes are biological catalysts: amylase digests starch, proteases digest proteins and lipases digest lipids. Bile emulsifies fats and provides alkaline conditions in the small intestine.</p>
      <p>The heart is a double pump. Deoxygenated blood goes to the lungs; oxygenated blood goes to the body. Arteries have thick walls, veins have valves, and capillaries are thin for exchange.</p>
      <h2>Health and non-communicable disease</h2>
      <p>Coronary heart disease involves fatty deposits in coronary arteries. Risk factors include diet, smoking, lack of exercise and alcohol. Cancer is uncontrolled cell division. Benign tumours stay in one place; malignant tumours can invade and spread.</p>
      <h2>Plant organisation</h2>
      <p>Xylem transports water and minerals in one direction. Phloem translocates sugars. Root hair cells have a large surface area for water uptake. Stomata control gas exchange and water loss.</p>
    `,
  }),
  note({
    subject: "Biology",
    title: "Infection and Response",
    topicSlug: "infection-and-response",
    notesHtml: `
      <h2>Pathogens</h2>
      <p>Communicable diseases are caused by pathogens: bacteria, viruses, fungi and protists. They can be spread by air, water, contact, vectors or body fluids. Reducing spread means hygiene, vaccination, destroying vectors and isolating infected people.</p>
      <ul>
        <li>Bacteria: salmonella, gonorrhoea. They produce toxins.</li>
        <li>Viruses: measles, HIV, TMV. They reproduce inside cells.</li>
        <li>Fungi: rose black spot.</li>
        <li>Protists: malaria, spread by mosquitoes.</li>
      </ul>
      <h2>Human defence</h2>
      <p>The skin, mucus, cilia and stomach acid are non-specific barriers. White blood cells phagocytose pathogens, produce antibodies and produce antitoxins. Vaccination gives a small amount of dead or inactive pathogen so memory cells form and a later response is faster.</p>
      <h2>Drugs</h2>
      <p>Antibiotics kill bacteria or slow their growth; they do not work on viruses. Painkillers treat symptoms only. New drugs are tested in the laboratory, then on healthy volunteers, then on patients. Double-blind trials reduce bias.</p>
    `,
  }),
  note({
    subject: "Biology",
    title: "Bioenergetics",
    topicSlug: "bioenergetics",
    notesHtml: `
      <h2>Photosynthesis</h2>
      <p>carbon dioxide + water → glucose + oxygen, in the presence of light and chlorophyll. It is endothermic. Glucose is used in respiration, stored as starch, used to make cellulose, amino acids and lipids.</p>
      <p>Limiting factors are light intensity, carbon dioxide concentration and temperature. A limiting factor is the one in shortest supply. Inverse square law: light intensity ∝ 1/distance².</p>
      <h2>Respiration</h2>
      <p>Respiration transfers energy from glucose for movement, warmth and chemical reactions. It is exothermic and happens continuously in living cells.</p>
      <ul>
        <li>Aerobic: glucose + oxygen → carbon dioxide + water. Transfers more energy.</li>
        <li>Anaerobic in animals: glucose → lactic acid. Oxygen debt is the extra oxygen needed afterwards to break down lactic acid.</li>
        <li>Anaerobic in plants/yeast: glucose → ethanol + carbon dioxide (fermentation).</li>
      </ul>
      <p>Exercise increases heart rate, breathing rate and breath volume so more oxygen is delivered to muscles.</p>
    `,
  }),
  note({
    subject: "Biology",
    title: "Homeostasis and Response",
    topicSlug: "homeostasis-and-response",
    notesHtml: `
      <h2>Homeostasis</h2>
      <p>Homeostasis keeps the internal environment within limits: blood glucose, temperature and water. Automatic control systems have receptors, a coordination centre and effectors.</p>
      <h2>Nervous system</h2>
      <p>A reflex arc is receptor → sensory neurone → synapse in the CNS → motor neurone → effector. Reflexes are rapid and automatic. Synapses use chemical transmitter to pass the impulse.</p>
      <p>The eye focuses light on the retina. Accommodation: ciliary muscles and suspensory ligaments change lens shape. Myopia and hyperopia can be corrected with lenses or surgery.</p>
      <h2>Hormones</h2>
      <p>The endocrine system secretes hormones into the blood. Adrenaline prepares the body for fight or flight. Thyroxine controls metabolic rate via negative feedback.</p>
      <p>Blood glucose: insulin from the pancreas lowers glucose by storing glycogen in the liver. Glucagon raises glucose. Type 1 diabetes needs insulin; Type 2 is often managed with diet and exercise.</p>
      <p>The menstrual cycle involves FSH, LH, oestrogen and progesterone. Contraception can be hormonal or non-hormonal. IVF uses FSH and LH to stimulate egg production.</p>
    `,
  }),
  note({
    subject: "Biology",
    title: "Inheritance, Variation and Evolution",
    topicSlug: "inheritance-variation-and-evolution",
    notesHtml: `
      <h2>DNA and genetics</h2>
      <p>DNA is a polymer of nucleotides (sugar, phosphate, base). A gene is a short section of DNA that codes for a protein. Chromosomes are in the nucleus. Gametes are haploid; fertilisation restores the diploid number.</p>
      <p>Meiosis produces four non-identical haploid gametes. Genetic diagrams (Punnett squares) predict offspring ratios. Dominant alleles are expressed if present; recessive alleles need two copies. Sex chromosomes: XX female, XY male.</p>
      <h2>Variation and evolution</h2>
      <p>Variation is genetic, environmental, or both. Mutations change DNA; most have no effect, some influence phenotype. Natural selection: individuals with advantageous phenotypes are more likely to survive and breed, so the allele becomes more common.</p>
      <p>Selective breeding chooses parents with useful characteristics. Genetic engineering transfers genes, for example insulin production or GM crops. Speciation can occur when populations are isolated and natural selection acts differently.</p>
      <h2>Classification</h2>
      <p>The three-domain system groups organisms as Archaea, Bacteria and Eukarya, based on genetic evidence as well as physical features.</p>
    `,
  }),
  note({
    subject: "Biology",
    title: "Ecology",
    topicSlug: "ecology",
    notesHtml: `
      <h2>Communities</h2>
      <p>A community is all the populations in a habitat. Organisms compete for resources. Abiotic factors include light, temperature, moisture and soil pH. Biotic factors include food, new predators, new pathogens and competition.</p>
      <p>Adaptations can be structural, behavioural or functional. Extremophiles live in very harsh conditions.</p>
      <h2>Organisation of ecosystems</h2>
      <p>Photosynthetic organisms are producers. Food chains show feeding relationships. Sampling uses quadrats and transects. Carbon is cycled by photosynthesis, respiration, combustion and decomposition. Water evaporates, condenses and precipitates.</p>
      <h2>Biodiversity and humans</h2>
      <p>Biodiversity is the variety of living organisms. Pollution, land use, deforestation and global warming reduce biodiversity. Maintaining biodiversity matters for resources, medicine and climate stability. Land, water and air can all be polluted; peat destruction and deforestation release carbon dioxide.</p>
    `,
  }),
  note({
    subject: "Biology",
    title: "Unit 1 Biology Revision Booklet",
    topicSlug: "unit-1-biology-revision-booklet",
    downloadHref: BIO_TOPIC1_PPTX,
    downloadLabel: "Download Unit 1 slides (PowerPoint)",
    notesHtml: `
      <p>This booklet page gathers the first biology topics used in many GCSE courses: cells, organisation and the start of bioenergetics. Open the slide deck for diagrams, then use the topic pages for a written recap.</p>
      <ul>
        <li><a href="/resources/gcse/biology/revision-notes/cell-biology/">Cell Biology</a></li>
        <li><a href="/resources/gcse/biology/revision-notes/organisation/">Organisation</a></li>
        <li><a href="/resources/gcse/biology/revision-notes/bioenergetics/">Bioenergetics</a></li>
      </ul>
    `,
  }),
  note({
    subject: "Physics",
    title: "Energy",
    topicSlug: "energy",
    exam_board: "AQA",
    downloadHref: PHYSICS_PPTX.energy,
    downloadLabel: "Download Energy slides (PowerPoint)",
    notesHtml: `
      <div class="callout">These notes sit with the JD Science Energy slides. Physics files are no longer listed under Biology.</div>
      <h2>Energy stores and transfers</h2>
      <p>Energy is stored in kinetic, gravitational potential, elastic potential, thermal, chemical, nuclear and electrostatic stores. It is transferred by heating, mechanically, electrically or by radiation. Energy cannot be created or destroyed.</p>
      <ul>
        <li>Ek = ½ mv²</li>
        <li>Ep = mgh</li>
        <li>Ee = ½ ke²</li>
        <li>ΔE = mcΔθ</li>
      </ul>
      <h2>Power, efficiency and insulation</h2>
      <p>Power is the rate of energy transfer: P = E/t. Efficiency = useful output / total input. Wasted energy usually heats the surroundings. Insulation, double glazing and thicker walls reduce thermal transfer by conduction, convection and radiation.</p>
      <h2>Energy resources</h2>
      <p>Renewable resources include wind, solar, hydroelectric, geothermal, tidal and bio-fuel. Non-renewable include coal, oil, gas and nuclear. Compare reliability, environmental impact and availability in exam answers.</p>
    `,
  }),
  note({
    subject: "Physics",
    title: "Electricity",
    topicSlug: "electricity",
    downloadHref: PHYSICS_PPTX.electricity,
    downloadLabel: "Download Electricity slides (PowerPoint)",
    notesHtml: `
      <h2>Current, potential difference and resistance</h2>
      <p>Current is the flow of charge: Q = It. Potential difference is work done per coulomb. Ohm’s law: V = IR, for an ohmic conductor at constant temperature. Resistance increases with temperature in a filament lamp. A diode only allows current in one direction. An LDR’s resistance falls as light intensity rises; a thermistor’s resistance falls as temperature rises.</p>
      <h2>Series and parallel</h2>
      <ul>
        <li>Series: current the same; PD shared; resistances add.</li>
        <li>Parallel: PD the same; current splits; total resistance is less than the smallest branch.</li>
      </ul>
      <h2>Mains electricity</h2>
      <p>UK mains is about 230 V a.c. at 50 Hz. The live wire carries the alternating PD, the neutral completes the circuit, and the earth is a safety wire. The fuse and earth protect the user if an appliance becomes live. Power P = VI = I²R.</p>
    `,
  }),
  note({
    subject: "Physics",
    title: "Particle Model of Matter",
    topicSlug: "particle-model",
    downloadHref: PHYSICS_PPTX.particles,
    downloadLabel: "Download Particle model slides (PowerPoint)",
    notesHtml: `
      <h2>Density</h2>
      <p>ρ = m/v. Measure mass with a balance and volume with a ruler or a displacement can. Solids have a regular particle arrangement, liquids flow, gases fill their container. Heating increases internal energy.</p>
      <h2>Changes of state</h2>
      <p>Change of state is a physical change. Specific heat capacity is energy to raise 1 kg by 1 °C. Specific latent heat is energy to change state of 1 kg without a temperature change: E = mL. Melting and vaporisation need energy to break attractions; freezing and condensing release energy.</p>
      <h2>Gas pressure</h2>
      <p>Gas particles collide with walls and create pressure. At constant volume, higher temperature means higher pressure. Particle motion is random; increasing temperature increases kinetic energy.</p>
    `,
  }),
  note({
    subject: "Physics",
    title: "Forces",
    topicSlug: "forces",
    downloadHref: PHYSICS_PPTX.forces,
    downloadLabel: "Download Forces slides (PowerPoint)",
    notesHtml: `
      <h2>Forces and motion</h2>
      <p>A force is a push or pull. Contact forces include friction and tension; non-contact forces include gravity, electrostatic and magnetism. Weight W = mg. Resultant force decides whether an object accelerates: F = ma.</p>
      <p>Speed is scalar; velocity is vector. Acceleration a = Δv/t. Distance-time graphs: gradient is speed. Velocity-time graphs: gradient is acceleration and area is distance.</p>
      <h2>Newton’s laws</h2>
      <ul>
        <li>1: If resultant force is zero, the object stays at rest or at constant velocity.</li>
        <li>2: F = ma.</li>
        <li>3: Forces between two objects are equal and opposite.</li>
      </ul>
      <p>Stopping distance = thinking distance + braking distance. Thinking distance increases with speed, tiredness, alcohol and drugs. Braking distance increases with speed, poor brakes, ice and more mass. Work done W = Fs. Momentum p = mv and is conserved in a closed system.</p>
    `,
  }),
  note({
    subject: "Physics",
    title: "Waves",
    topicSlug: "waves",
    downloadHref: PHYSICS_PPTX.waves,
    downloadLabel: "Download Waves slides (PowerPoint)",
    notesHtml: `
      <h2>Wave properties</h2>
      <p>Waves transfer energy without transferring matter. Transverse waves oscillate at right angles to the direction of travel (light, water). Longitudinal waves oscillate parallel (sound) and have compressions and rarefactions.</p>
      <p>Wave speed v = fλ. Frequency is waves per second; wavelength is the distance between the same point on two waves. Amplitude is the maximum displacement from the rest position.</p>
      <h2>EM spectrum</h2>
      <p>Radio, microwave, infrared, visible, ultraviolet, X-ray, gamma. All travel at 3 × 10⁸ m/s in a vacuum. Higher frequency means higher energy and usually more danger to cells. Uses: radio communications, cooking, thermal imaging, vision, sterilising, medical imaging, cancer treatment.</p>
      <h2>Sound and required practicals</h2>
      <p>Sound needs a medium. Measure wave speed in a ripple tank or with a string and a signal generator. Reflection: angle of incidence equals angle of reflection. Refraction occurs when waves change speed at a boundary.</p>
    `,
  }),
  note({
    subject: "Physics",
    title: "Atomic Structure",
    topicSlug: "atomic-structure",
    downloadHref: PHYSICS_PPTX.atomic,
    downloadLabel: "Download Atomic structure slides (PowerPoint)",
    notesHtml: `
      <h2>The atom</h2>
      <p>A positive nucleus of protons and neutrons is surrounded by electrons. Most of the atom is empty space. Atomic number is protons; mass number is protons + neutrons. Isotopes have the same proton number but different neutron numbers.</p>
      <h2>Radioactivity</h2>
      <ul>
        <li>Alpha: helium nucleus, highly ionising, poorly penetrating, stopped by paper.</li>
        <li>Beta: fast electron, moderately ionising, stopped by aluminium.</li>
        <li>Gamma: electromagnetic radiation, weakly ionising, reduced by thick lead or concrete.</li>
      </ul>
      <p>Half-life is the time for the count rate or unstable nuclei to fall by half. Irradiation is exposure to radiation; contamination is unwanted radioactive material on or in an object. Nuclear fission splits a large nucleus; fusion joins small nuclei and powers stars.</p>
    `,
  }),
];

export function notesByTopicKey() {
  const map = new Map();
  for (const item of HOSTED_REVISION_NOTES) {
    map.set(`${String(item.subject).toLowerCase()}/${item.topicSlug}`, item);
  }
  return map;
}
