"""Full spoken narration for the GCSE Biology teaching-edition videos.

Text follows the supplied revised teaching edition in document order.
Opening and closing lines match the scripts. British English throughout.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class LessonScript:
    slug: str
    spec: str
    title: str
    subtitle: str
    filename: str
    youtube_filename: str
    spoken: str
    tier: str = ""
    description: str = ""


def _join(paragraphs: list[str]) -> str:
    return "\n\n".join(p.strip() for p in paragraphs if p.strip())


OPEN = "Hello and welcome back to JD Science."
REVISE = (
    "As you revise this topic, try to explain the key process in your own words. "
    "Focus on what happens, why it happens, and how the structures involved help the process work."
)
CLOSE = (
    "If this explanation has helped, please subscribe to JD Science for more lessons. "
    "You can find further learning resources and practice questions at jdscience.co.uk. "
    "Thank you for watching."
)


CELL_DIVISION = LessonScript(
    slug="1-1-cell-division",
    spec="1.1",
    title="Cell Division",
    subtitle="Mitosis, chromosomes and stem cells",
    filename="jdscience-1-1-cell-division-1080p.mp4",
    youtube_filename="JDScience_GCSE_Biology_1_1_Cell_Division.mp4",
    description="Mitosis, chromosome number, stem cells and therapeutic cloning, with an exam-style question on DNA replication.",
    spoken=_join([
        OPEN,
        "Today, we are exploring cell division.",
        "Every nucleus contains chromosomes made of DNA, and each chromosome carries many genes.",
        "In mitosis, the cell first copies its DNA and then divides it into two. Each daughter cell has the same chromosomes as the parent, so mitosis produces clones.",
        "It is used for growth, repair, and asexual reproduction.",
        "Stem cells have not yet specialised. They are found in embryos and bone marrow, and in plants they are found in meristems.",
        "Therapeutic cloning could produce an embryo with the patient's own genes, which may reduce the risk of rejection. The use of stem cells raises ethical debates.",
        "Before a cell divides, its DNA is replicated during interphase.",
        "During mitosis, the duplicated chromosomes are separated so that each new nucleus receives an equivalent set. The cytoplasm then divides in cytokinesis.",
        "Remember that mitosis maintains chromosome number; it does not halve it. In humans, most body cells have 46 chromosomes, and each daughter cell normally has 46 too.",
        REVISE,
        "Now, pause the video and try this exam-style question. Describe what happens to the DNA in a cell before mitosis begins. [2 marks]",
        "Here is a model answer. The DNA is copied (replicated), so each chromosome has two identical copies before the cell divides.",
        CLOSE,
    ]),
)

BACTERIAL_GROWTH = LessonScript(
    slug="1-2-bacterial-growth",
    spec="1.2",
    title="Bacterial Growth",
    subtitle="Binary fission and culturing bacteria",
    filename="jdscience-1-2-bacterial-growth-1080p.mp4",
    youtube_filename="JDScience_GCSE_Biology_1_2_Bacterial_Growth.mp4",
    tier="Biology only",
    description="Binary fission, doubling-time calculations, and safe school culturing of bacteria.",
    spoken=_join([
        OPEN,
        "Today, we are exploring how bacteria grow.",
        "Bacteria reproduce by binary fission, an asexual process.",
        "If they doubled every 20 minutes, one bacterium would become two after 20 minutes, four after 40, eight after 60, and so on.",
        "Growth is fastest with the right temperature and nutrients.",
        "In the lab, we grow bacteria on agar in a petri dish. We sterilise the loop and dish to stop unwanted microbes, and we tape the lid loosely and store the dish upside down so condensation does not drip onto the agar.",
        "In school labs we do not culture pathogens at 37°C, because that is the temperature that suits human pathogens best.",
        "To calculate growth, use the number of generations. Divide the total time by the doubling time, then multiply the starting number of bacteria by two to the power of that number.",
        "For example, over two hours with a twenty-minute doubling time, there are six generations. One bacterium could therefore become sixty-four, provided conditions remain suitable.",
        "School microbiology work must follow the laboratory’s risk assessment and approved incubation procedures.",
        REVISE,
        "Now, pause the video and try this exam-style question. Explain why the lid of a petri dish should be taped loosely and the dish stored upside down. [2 marks]",
        "Here is a model answer. To stop unwanted microbes getting in while allowing air in. Upside down prevents condensation dripping onto the agar.",
        CLOSE,
    ]),
)

TRANSPORT = LessonScript(
    slug="1-3-transport-in-cells",
    spec="1.3",
    title="Transport in Cells",
    subtitle="Diffusion, osmosis and active transport",
    filename="jdscience-1-3-transport-in-cells-1080p.mp4",
    youtube_filename="JDScience_GCSE_Biology_1_3_Transport_in_Cells.mp4",
    description="How substances move by diffusion, osmosis and active transport, including root hair cells.",
    spoken=_join([
        OPEN,
        "Today, we are exploring how substances move in and out of cells.",
        "In diffusion, particles move from high concentration to low concentration along a concentration gradient.",
        "It is faster when the temperature is higher, the concentration gradient is steeper, or the surface area is larger.",
        "Oxygen diffuses into the blood in the lungs, and carbon dioxide diffuses out. Alveoli have a large surface area, a thin lining, a good blood supply, and ventilation.",
        "Osmosis is the diffusion of water across a partially permeable membrane.",
        "Active transport moves substances against a concentration gradient, using energy from respiration. Root hair cells use active transport to absorb mineral ions.",
        "Diffusion and osmosis are passive processes: they do not require the cell to supply metabolic energy.",
        "Active transport is different because carrier proteins move substances against their concentration gradient using energy, often supplied by ATP.",
        "A useful comparison is oxygen entering cells by diffusion, water crossing a partially permeable membrane by osmosis, and mineral ions entering root hair cells by active transport.",
        REVISE,
        "Now, pause the video and try this exam-style question. Explain why root hair cells use active transport to absorb mineral ions. [2 marks]",
        "Here is a model answer. Mineral ions are often at a lower concentration in the soil than in the root cell, so active transport is needed to move them against the concentration gradient, using energy from respiration.",
        CLOSE,
    ]),
)

ORGANISATION = LessonScript(
    slug="2-1-principles-of-organisation",
    spec="2.1",
    title="Principles of Organisation",
    subtitle="Cells, tissues, organs and systems",
    filename="jdscience-2-1-principles-of-organisation-1080p.mp4",
    youtube_filename="JDScience_GCSE_Biology_2_1_Principles_of_Organisation.mp4",
    description="The hierarchy from cells to organism, with cardiac muscle as the worked example.",
    spoken=_join([
        OPEN,
        "Today, we are exploring the principles of organisation.",
        "All living things are built from cells. A group of similar cells forms a tissue, such as muscle tissue.",
        "A group of tissues forms an organ, such as the heart. A group of organs working together forms a system, such as the circulatory system. A group of systems makes up an organism.",
        "Specialisation explains why cells can form effective tissues. For example, cardiac muscle cells contract together to form heart muscle tissue.",
        "Heart muscle, valves, connective tissue and blood vessels contribute to the organ called the heart. The heart then works with blood vessels as part of the circulatory system.",
        "This hierarchy helps us explain how small structures support the whole organism.",
        REVISE,
        "Now, pause the video and try this exam-style question. Put these in order from smallest to largest: organ, cell, organism, tissue, organ system. [2 marks]",
        "Here is a model answer. Cell, tissue, organ, organ system, organism.",
        CLOSE,
    ]),
)

ANIMAL_SYSTEMS = LessonScript(
    slug="2-2-animal-tissues-organs-systems",
    spec="2.2",
    title="Animal Tissues, Organs and Organ Systems",
    subtitle="Digestion, enzymes and circulation",
    filename="jdscience-2-2-animal-tissues-organs-systems-1080p.mp4",
    youtube_filename="JDScience_GCSE_Biology_2_2_Animal_Tissues_Organs_Systems.mp4",
    description="Digestive enzymes, bile and the circulatory system, with a precise starch-digestion exam question.",
    spoken=_join([
        OPEN,
        "Today, we are exploring animal organ systems.",
        "The digestive system breaks down food into small molecules the body can absorb.",
        "Amylase breaks starch into maltose and other shorter sugars. Protease breaks proteins into amino acids. Lipase breaks fats into fatty acids and glycerol.",
        "Bile is made in the liver and stored in the gall bladder. It neutralises stomach acid and emulsifies fats, which increases their surface area for lipase.",
        "Enzymes have an active site, and high temperatures or the wrong pH can change their shape.",
        "The circulatory system pumps blood around the body. Arteries carry high-pressure blood away from the heart. Veins carry low-pressure blood back. Capillaries are one cell thick, so substances can pass through.",
        "Red blood cells carry oxygen, platelets help clot blood, and white blood cells fight infection.",
        "Be precise about digestion. Amylase breaks starch into smaller sugars, including maltose; other enzymes subsequently produce glucose.",
        "Proteases break proteins into smaller peptides and ultimately amino acids. Lipases break down lipids into fatty acids and glycerol.",
        "Bile is not an enzyme. It neutralises acidic chyme entering the small intestine and emulsifies fat, increasing the surface area available to lipase.",
        REVISE,
        "Now, pause the video and try this exam-style question. Name the enzyme that begins the digestion of starch and state one product of its action. [2 marks]",
        "Here is a model answer. Amylase [1]. It breaks starch into maltose or smaller sugars [1].",
        CLOSE,
    ]),
)

PLANT_SYSTEMS = LessonScript(
    slug="2-3-plant-tissues-organs-systems",
    spec="2.3",
    title="Plant Tissues, Organs and Systems",
    subtitle="Leaf structure, transpiration and translocation",
    filename="jdscience-2-3-plant-tissues-organs-systems-1080p.mp4",
    youtube_filename="JDScience_GCSE_Biology_2_3_Plant_Tissues_Organs_Systems.mp4",
    description="Leaf tissues, transpiration and the roles of xylem and phloem.",
    spoken=_join([
        OPEN,
        "Today, we are exploring plant tissues and organs.",
        "A leaf has several tissues. The epidermis covers the leaf. The palisade mesophyll is packed with chloroplasts for photosynthesis. The spongy mesophyll has air spaces for gas exchange.",
        "Xylem and phloem form the veins. Guard cells control the stomata, which control gas exchange and water loss.",
        "Water evaporates through the stomata, which pulls water up the xylem. This is transpiration. Transpiration is faster in warm, dry, windy conditions and in bright light.",
        "Xylem carries water and mineral ions upwards. Phloem carries sugars up and down the plant.",
        "Transpiration is the loss of water vapour from leaves, mainly through stomata. Water evaporates from mesophyll cell surfaces and diffuses into the air.",
        "This creates tension that helps draw a continuous column of water up the xylem.",
        "Phloem transports dissolved sugars from sources, such as photosynthesising leaves, to sinks, such as roots and growing fruits. The direction depends on the location of sources and sinks.",
        REVISE,
        "Now, pause the video and try this exam-style question. Name the plant tissue that carries sugars and describe the direction it carries them. [2 marks]",
        "Here is a model answer. Phloem. It carries sugars up and down the plant.",
        CLOSE,
    ]),
)

COMMUNICABLE = LessonScript(
    slug="3-1-communicable-diseases",
    spec="3.1",
    title="Communicable Diseases",
    subtitle="Pathogens, immunity, vaccines and antibiotics",
    filename="jdscience-3-1-communicable-diseases-1080p.mp4",
    youtube_filename="JDScience_GCSE_Biology_3_1_Communicable_Diseases.mp4",
    description="How pathogens spread, how the body defends itself, and why antibiotics do not treat viruses.",
    spoken=_join([
        OPEN,
        "Today, we are exploring communicable diseases.",
        "Pathogens are microbes that cause disease. They enter the body through the mouth or nose, through cuts, or in food and water.",
        "Bacteria produce toxins. Viruses reproduce inside cells and damage them. Fungi can produce spores, and protists can be spread by vectors.",
        "HIV is spread through body fluids and attacks the immune system. Measles causes fever and a red rash and is spread by droplets. Malaria is caused by a protist and spread by mosquitoes.",
        "Our defences include hairs and mucus in the nose, skin, and stomach acid. White blood cells engulf microbes, make antibodies, and make antitoxins.",
        "Vaccines contain dead or inactive pathogens, which trigger memory cells. Antibiotics kill bacteria but not viruses.",
        "Not every vaccine contains a dead or weakened pathogen. Some contain purified antigens, inactivated toxins or genetic instructions that allow the body to make an antigen.",
        "The immune response can generate memory cells, helping the body respond more quickly on later exposure.",
        "Antibiotics act on bacterial structures or processes and do not treat viral infections. Misuse of antibiotics can also select for resistant bacteria.",
        REVISE,
        "Now, pause the video and try this exam-style question. Explain why antibiotics cannot be used to treat a viral infection. [2 marks]",
        "Here is a model answer. Antibiotics kill bacteria, but viruses reproduce inside cells and have different structures that antibiotics do not target.",
        CLOSE,
    ]),
)

NEW_DRUGS = LessonScript(
    slug="3-1-discovering-and-testing-new-drugs",
    spec="3.1",
    title="Discovering and Testing New Drugs",
    subtitle="Discovery, preclinical tests and clinical trials",
    filename="jdscience-3-1-discovering-and-testing-new-drugs-1080p.mp4",
    youtube_filename="JDScience_GCSE_Biology_3_1_Discovering_and_Testing_New_Drugs.mp4",
    description="How medicines are discovered and tested, including blinding, placebos and ethical comparisons.",
    spoken=_join([
        OPEN,
        "Today, we are exploring how new drugs are found and tested.",
        "Penicillin was discovered by Alexander Fleming in 1928 from a mould. Many modern drugs are made by chemists, often starting from plant chemicals.",
        "Digitalis comes from foxgloves, and aspirin comes from willow.",
        "New drugs go through preclinical testing on cells and then on animals to check toxicity. Then they go to clinical trials on human volunteers, starting with low doses.",
        "In a single-blind trial, patients don't know which treatment they receive. In a double-blind trial, neither patients nor doctors know. Placebos are used as a comparison.",
        "Drug development begins with discovery and preclinical research, which may include laboratory studies using cells, tissues and suitable models.",
        "Clinical trials then investigate safety, dosage and effectiveness in people. Random allocation and blinding can reduce bias.",
        "Not every trial uses a placebo: some compare a new treatment with the existing standard treatment, and ethical safeguards are essential.",
        REVISE,
        "Now, pause the video and try this exam-style question. Describe the difference between a single-blind and a double-blind trial. [2 marks]",
        "Here is a model answer. In a single-blind trial the patients don't know which treatment they receive. In a double-blind trial neither the patients nor the doctors know.",
        CLOSE,
    ]),
)

MONOCLONAL = LessonScript(
    slug="3-2-monoclonal-antibodies",
    spec="3.2",
    title="Monoclonal Antibodies",
    subtitle="Hybridomas, tests and targeted treatment",
    filename="jdscience-3-2-monoclonal-antibodies-1080p.mp4",
    youtube_filename="JDScience_GCSE_Biology_3_2_Monoclonal_Antibodies.mp4",
    tier="Biology HT only",
    description="How hybridoma cells are made and how monoclonal antibodies are used in tests and cancer treatment.",
    spoken=_join([
        OPEN,
        "Today, we are exploring monoclonal antibodies.",
        "These are identical antibodies made from a single parent cell.",
        "A mouse is injected with an antigen, and its B-lymphocytes produce antibodies against it. These lymphocytes are fused with tumour cells to make a hybridoma.",
        "The hybridoma divides rapidly and produces large amounts of identical antibodies.",
        "They can be used to locate molecules in cells, for pregnancy tests, and for testing hormone levels.",
        "In cancer treatment, they bind to cancer cells and tag them for attack by white blood cells. Compared with chemotherapy and radiotherapy, they target cells more precisely and have fewer side effects.",
        "A monoclonal antibody recognises a particular antigen or part of an antigen.",
        "In traditional hybridoma production, an antibody-producing B lymphocyte is fused with a tumour cell to combine specificity with the ability to divide repeatedly.",
        "Monoclonal antibodies can be used in pregnancy tests, diagnostics and some targeted cancer treatments. They are not automatically free from side effects; their benefits and risks depend on the particular treatment.",
        REVISE,
        "Now, pause the video and try this exam-style question. Describe how a hybridoma cell is produced. [3 marks]",
        "Here is a model answer. A B-lymphocyte from the mouse, which makes the antibody, is fused with a tumour cell. The resulting hybridoma divides rapidly and produces large amounts of identical antibodies.",
        CLOSE,
    ]),
)

PLANT_DISEASE = LessonScript(
    slug="3-3-plant-disease",
    spec="3.3",
    title="Plant Disease",
    subtitle="Infection, mineral deficiency and plant defences",
    filename="jdscience-3-3-plant-disease-1080p.mp4",
    youtube_filename="JDScience_GCSE_Biology_3_3_Plant_Disease.mp4",
    tier="Biology only",
    description="Plant disease symptoms, tobacco mosaic virus, rose black spot, and magnesium versus nitrate deficiency.",
    spoken=_join([
        OPEN,
        "Today, we are exploring plant disease.",
        "Signs of disease include stunted growth, spots on leaves, areas of decay, growths, pests, and discoloured or misshapen leaves.",
        "Rose black spot is a fungal disease that causes black spots on leaves, which turn yellow and fall early. It spreads by wind and rain.",
        "Tobacco mosaic virus causes mosaic patterns on leaves and reduces photosynthesis.",
        "Nitrate deficiency causes stunted growth, because nitrates are needed for protein. Magnesium deficiency causes chlorosis, because magnesium is needed to make chlorophyll.",
        "Plants defend themselves with physical barriers like waxy cuticles and thorns, and chemical defences such as antibacterial chemicals.",
        "Mineral deficiencies can resemble infectious diseases, so the pattern of symptoms matters.",
        "Magnesium deficiency commonly causes interveinal chlorosis, particularly in older leaves, because magnesium is a mobile nutrient and is required for chlorophyll.",
        "Nitrate deficiency can cause poor growth because nitrogen is needed to make amino acids and proteins. A plant’s appearance is evidence, but careful diagnosis may require further investigation.",
        REVISE,
        "Now, pause the video and try this exam-style question. A plant has yellow leaves with green veins. Suggest which mineral ion is missing and explain your answer. [2 marks]",
        "Here is a model answer. Magnesium. It is needed to make chlorophyll, so a deficiency causes chlorosis (yellowing).",
        CLOSE,
    ]),
)

PHOTOSYNTHESIS = LessonScript(
    slug="4-1-photosynthesis",
    spec="4.1",
    title="Photosynthesis",
    subtitle="Equation, uses of glucose and limiting factors",
    filename="jdscience-4-1-photosynthesis-1080p.mp4",
    youtube_filename="JDScience_GCSE_Biology_4_1_Photosynthesis.mp4",
    description="The photosynthesis equation, uses of glucose, limiting factors and the inverse-square law.",
    spoken=_join([
        OPEN,
        "Today, we are exploring photosynthesis.",
        "Plants use carbon dioxide and water, with energy from sunlight and chlorophyll, to make glucose and oxygen.",
        "Carbon dioxide enters through the stomata. Water travels up from the roots.",
        "The equation is six carbon dioxide plus six water gives glucose plus six oxygen.",
        "Glucose can be used for respiration, converted into starch for storage, made into cellulose for cell walls, combined with nitrates to make amino acids, or converted into lipids for seeds.",
        "The rate of photosynthesis depends on temperature, light intensity, and carbon dioxide concentration. Enzymes can become denatured at high temperatures.",
        "Light intensity falls off with distance by the inverse square law. Doubling the distance cuts the intensity to a quarter.",
        "The balanced symbol equation is six carbon dioxide molecules plus six water molecules producing one glucose molecule and six oxygen molecules, using light energy.",
        "A limiting factor is the condition in shortest supply relative to the plant’s needs. Increasing light will not keep increasing the rate if carbon dioxide or temperature becomes limiting.",
        "The inverse-square approximation for a lamp works best when the lamp can be treated as a point source and other conditions are controlled.",
        REVISE,
        "Now, pause the video and try this exam-style question. A plant is moved from 20 cm to 40 cm from a lamp. Explain how the light intensity changes and what this does to the rate of photosynthesis. [3 marks]",
        "Here is a model answer. Doubling the distance reduces the light intensity to a quarter, so the rate of photosynthesis falls, because light is limiting the rate.",
        CLOSE,
    ]),
)

RESPIRATION = LessonScript(
    slug="4-2-respiration",
    spec="4.2",
    title="Respiration",
    subtitle="Aerobic, anaerobic and exercise",
    filename="jdscience-4-2-respiration-1080p.mp4",
    youtube_filename="JDScience_GCSE_Biology_4_2_Respiration.mp4",
    description="Aerobic and anaerobic respiration, fermentation, and the difference between respiration and breathing.",
    spoken=_join([
        OPEN,
        "Today, we are exploring respiration.",
        "Respiration releases energy from glucose. Aerobic respiration uses oxygen and gives carbon dioxide and water. It takes place in the mitochondria.",
        "When oxygen is in short supply, anaerobic respiration takes over. It releases much less energy than aerobic respiration and produces lactic acid in animals.",
        "Lactic acid builds up and causes muscle fatigue and an oxygen debt. Deep breathing after exercise repays this debt.",
        "In yeast and plants, anaerobic respiration produces ethanol and carbon dioxide. This is called fermentation, and it is used to make bread and alcoholic drinks.",
        "During exercise, heart rate and breathing rate increase.",
        "Respiration is a chemical process in cells that transfers energy for life processes; breathing is the physical movement of air into and out of the lungs.",
        "In aerobic respiration, glucose reacts with oxygen to produce carbon dioxide and water.",
        "During intense exercise, anaerobic respiration in muscle cells produces lactate and releases less energy per glucose molecule. Oxygen is needed afterwards for recovery, but lactate is not simply the direct cause of all muscle fatigue.",
        REVISE,
        "Now, pause the video and try this exam-style question. Explain why muscles produce lactic acid during vigorous exercise. [2 marks]",
        "Here is a model answer. Oxygen supply cannot keep up with demand, so the muscles respire anaerobically, which produces lactic acid.",
        CLOSE,
    ]),
)

HOMEOSTASIS = LessonScript(
    slug="5-1-homeostasis",
    spec="5.1",
    title="Homeostasis",
    subtitle="Control systems and negative feedback",
    filename="jdscience-5-1-homeostasis-1080p.mp4",
    youtube_filename="JDScience_GCSE_Biology_5_1_Homeostasis.mp4",
    description="Keeping internal conditions stable, with receptors, coordinators, effectors and blood glucose control.",
    spoken=_join([
        OPEN,
        "Today, we are exploring homeostasis.",
        "Homeostasis means keeping conditions inside the body at the right level. Temperature, ion content, water content, and blood glucose are all controlled.",
        "Control systems have three parts. Receptors detect a change, a coordinator such as the brain processes the information, and effectors such as muscles and glands produce the response.",
        "Negative feedback means the output of a process controls its own level. For example, when blood glucose rises, insulin is released to lower it. When glucose falls, glucagon is released (Higher Tier).",
        "Negative feedback opposes a change from a normal operating range.",
        "For example, after a meal, rising blood glucose stimulates pancreatic beta cells to release insulin, promoting glucose uptake and storage.",
        "When blood glucose falls, pancreatic alpha cells release glucagon, stimulating the liver to release glucose.",
        "The nervous and endocrine systems both contribute to maintaining a stable internal environment.",
        REVISE,
        "Now, pause the video and try this exam-style question. Describe the role of receptors, coordinators, and effectors in a control system. [3 marks]",
        "Here is a model answer. Receptors detect a change in the internal or external environment. The coordinator, such as the brain, processes the information. Effectors, such as muscles or glands, bring about a response.",
        CLOSE,
    ]),
)

NERVOUS = LessonScript(
    slug="5-2-the-nervous-system",
    spec="5.2",
    title="The Nervous System",
    subtitle="Conscious action, reflexes and synapses",
    filename="jdscience-5-2-the-nervous-system-1080p.mp4",
    youtube_filename="JDScience_GCSE_Biology_5_2_The_Nervous_System.mp4",
    description="The pathway of a reflex arc, synapses and how the eye controls light.",
    spoken=_join([
        OPEN,
        "Today, we are exploring the nervous system.",
        "It lets us react to our surroundings. It contains the brain, spinal cord, neurones, and receptors.",
        "In a conscious action, a stimulus is detected by a receptor. Sensory neurones carry the impulse to the spinal cord and brain. The brain decides on a response, and motor neurones carry the impulse to an effector.",
        "In many spinal reflexes, the immediate response is coordinated through the spinal cord without waiting for a conscious decision.",
        "Sensory neurones send the impulse to a relay neurone in the spinal cord, which sends it to a motor neurone. This is much faster.",
        "Neurones don't touch at synapses. Chemicals called neurotransmitters cross the gap. Eyes focus light using the lens and cornea. The iris controls how much light enters.",
        "A reflex arc begins when a receptor detects a stimulus. An impulse travels along a sensory neurone to the central nervous system, where it may pass through a relay neurone before travelling along a motor neurone to an effector.",
        "Reflexes are automatic and can be rapid because they do not require a conscious decision before the response. The brain can still receive information about the event.",
        "At a chemical synapse, neurotransmitter molecules diffuse across the synaptic cleft and bind to receptors.",
        REVISE,
        "Now, pause the video and try this exam-style question. Describe the pathway of a reflex arc, in order. [3 marks]",
        "Here is a model answer. Receptor, sensory neurone, relay neurone in the spinal cord, motor neurone, effector.",
        CLOSE,
    ]),
)

HORMONES = LessonScript(
    slug="5-3-hormonal-coordination",
    spec="5.3",
    title="Hormonal Coordination in Humans",
    subtitle="Endocrine glands, diabetes and the menstrual cycle",
    filename="jdscience-5-3-hormonal-coordination-1080p.mp4",
    youtube_filename="JDScience_GCSE_Biology_5_3_Hormonal_Coordination.mp4",
    description="Hormone action, type 1 and type 2 diabetes, the menstrual cycle and ADH.",
    spoken=_join([
        OPEN,
        "Today, we are exploring hormones.",
        "Hormones are chemical messengers released by endocrine glands into the bloodstream. They are slower than nerves but last longer.",
        "The pancreas makes insulin, the adrenal gland makes adrenaline, the pituitary makes FSH and LH, the testes make testosterone, and the ovaries make oestrogen and progesterone.",
        "The pituitary is the master gland.",
        "In type 1 diabetes, the pancreas does not make enough insulin, and insulin is injected. In type 2, the body doesn't respond well to insulin, and it is managed through diet and exercise.",
        "The menstrual cycle involves FSH, LH, oestrogen, and progesterone. FSH matures an egg, LH triggers ovulation, and progesterone maintains the uterus lining.",
        "When water is low, ADH is released, and the kidney reabsorbs more water.",
        "The endocrine system releases hormones into the bloodstream, and only cells with suitable receptors respond.",
        "The pituitary coordinates several glands, but hormone control involves feedback loops rather than a single gland acting alone.",
        "Type one diabetes usually involves autoimmune destruction of insulin-producing beta cells. Type two diabetes involves insulin resistance and may also involve reduced insulin production; treatment varies and may include medicines as well as lifestyle measures.",
        REVISE,
        "Now, pause the video and try this exam-style question. Name the hormone that triggers ovulation and state which gland produces it. [2 marks]",
        "Here is a model answer. LH (luteinising hormone), produced by the pituitary gland.",
        CLOSE,
    ]),
)

PLANT_HORMONES = LessonScript(
    slug="5-4-plant-hormones",
    spec="5.4",
    title="Plant Hormones",
    subtitle="Tropisms, auxin, ethene and gibberellins",
    filename="jdscience-5-4-plant-hormones-1080p.mp4",
    youtube_filename="JDScience_GCSE_Biology_5_4_Plant_Hormones.mp4",
    tier="Biology only",
    description="Phototropism and geotropism, with auxin redistribution rather than simple destruction by light.",
    spoken=_join([
        OPEN,
        "Today, we are exploring plant hormones.",
        "Plants respond to light and gravity by growth. Shoots grow towards light, which is positive phototropism, and against gravity, which is negative geotropism.",
        "Roots grow away from light and towards gravity.",
        "In shoots, auxin is destroyed by light, so the shaded side grows faster and the shoot bends towards the light.",
        "Ethene helps fruit ripen. Gibberellins help seeds germinate. Auxins are used as weedkillers and rooting powders. Gibberellins can end seed dormancy, promote flowering, and increase fruit size.",
        "In a shoot exposed to light from one side, auxin is redistributed so that more accumulates on the shaded side.",
        "Auxin promotes cell elongation in shoots, causing that side to grow faster and the shoot to bend towards the light.",
        "It is misleading to say that light simply destroys all auxin on the illuminated side.",
        "In roots, higher auxin concentrations can inhibit elongation, helping explain different growth responses to gravity.",
        REVISE,
        "Now, pause the video and try this exam-style question. Explain why a shoot bends towards a light source. [3 marks]",
        "Here is a model answer. Auxin accumulates on the shaded side [1], promoting greater cell elongation there [1], so the shoot bends towards the light [1].",
        CLOSE,
    ]),
)

REPRODUCTION = LessonScript(
    slug="6-1-reproduction",
    spec="6.1",
    title="Reproduction",
    subtitle="Meiosis, DNA, alleles and inheritance",
    filename="jdscience-6-1-reproduction-1080p.mp4",
    youtube_filename="JDScience_GCSE_Biology_6_1_Reproduction.mp4",
    description="Sexual and asexual reproduction, DNA, dominance, and a cystic fibrosis Punnett square.",
    spoken=_join([
        OPEN,
        "Today, we are exploring reproduction.",
        "Human egg and sperm cells each have 23 chromosomes. When they fuse, the zygote has 46 chromosomes, which are 23 pairs.",
        "Mitosis makes identical cells for growth and repair. Meiosis makes gametes with half the chromosomes, and each gamete is genetically different.",
        "Sexual reproduction needs two parents and produces variation. Asexual reproduction needs one parent and produces clones.",
        "Genes are sections of DNA on chromosomes, and each gene codes for a protein. DNA is a double helix made of nucleotides, and bases pair as C with G and A with T.",
        "For genetics, each parent passes on one allele of each gene. Dominant alleles show up even when only one copy is present. Recessive alleles only show when two copies are present.",
        "Cystic fibrosis is recessive. Polydactyly is dominant. Sex is determined by the X and Y chromosomes.",
        "Meiosis reduces chromosome number and generates genetic variation through processes including recombination and independent assortment. Fertilisation restores the diploid chromosome number.",
        "In inheritance questions, always define the allele symbols before completing a Punnett square. A dominant allele is expressed in a heterozygote; this does not mean it is necessarily more common in the population.",
        REVISE,
        "Now, pause the video and try this exam-style question. A woman is heterozygous for cystic fibrosis (Ff) and a man does not carry the allele (FF). Using a Punnett square, work out the probability that their child has cystic fibrosis. [3 marks] Use f for the recessive allele.",
        "Here is a model answer. Parents FF × Ff gives offspring FF, Ff, FF, Ff. The child has cystic fibrosis only if ff. Probability = 0%.",
        CLOSE,
    ]),
)

VARIATION = LessonScript(
    slug="6-2-variation-and-evolution",
    spec="6.2",
    title="Variation and Evolution",
    subtitle="Mutation, selection, breeding and genetic engineering",
    filename="jdscience-6-2-variation-and-evolution-1080p.mp4",
    youtube_filename="JDScience_GCSE_Biology_6_2_Variation_and_Evolution.mp4",
    description="Sources of variation, natural selection, selective breeding and producing insulin in bacteria.",
    spoken=_join([
        OPEN,
        "Today, we are exploring variation and evolution.",
        "Variation is the difference between individuals of the same species. It can be genetic, environmental, or both.",
        "Mutations produce new alleles, while sexual reproduction reshuffles existing alleles. Most have no effect. Some can help an organism survive, like the peppered moth.",
        "Natural selection drives evolution. Individuals with better traits survive and reproduce.",
        "A species is a group that can breed to produce fertile offspring.",
        "Selective breeding chooses parents with desired traits. It can reduce the gene pool and increase inherited defects.",
        "Genetic engineering moves a gene from one organism to another. Examples include insulin production and pest-resistant crops. The steps are to identify the gene, cut it out, insert it into a plasmid, and clone the organism.",
        "Mutations are the ultimate source of new alleles, but variation among individuals also arises when existing alleles are reshuffled during meiosis and fertilisation.",
        "Natural selection acts on heritable differences: individuals with traits that improve reproductive success in a particular environment tend to pass those alleles on.",
        "Evolution means changes in inherited characteristics across generations, not an individual changing because it needs to adapt.",
        REVISE,
        "Now, pause the video and try this exam-style question. Describe the steps of genetic engineering to produce human insulin in bacteria. [3 marks]",
        "Here is a model answer. Identify and cut out the human insulin gene. Insert it into a plasmid. Put the plasmid into bacteria, which then clone and produce insulin.",
        CLOSE,
    ]),
)

GENETICS_HISTORY = LessonScript(
    slug="6-3-genetics-and-evolution",
    spec="6.3",
    title="The Development of Understanding of Genetics and Evolution",
    subtitle="Darwin, Mendel, resistance and speciation",
    filename="jdscience-6-3-genetics-and-evolution-1080p.mp4",
    youtube_filename="JDScience_GCSE_Biology_6_3_Genetics_and_Evolution.mp4",
    description="How ideas about evolution developed, including antibiotic resistance as natural selection.",
    spoken=_join([
        OPEN,
        "Today, we are exploring how our understanding of evolution developed.",
        "Charles Darwin and Alfred Wallace proposed natural selection. Organisms vary. Competition for resources means some survive, and these pass on their traits.",
        "Lamarck proposed that characteristics acquired during life are inherited, but this is now known to be wrong.",
        "Mendel's pea plant experiments showed that traits are inherited as units, which we now call genes. Chromosomes were later found to carry those genes.",
        "Evidence for evolution includes fossils and antibiotic-resistant bacteria. Bacteria with a mutation for resistance survive antibiotics and pass it on.",
        "Speciation occurs when populations become geographically isolated and can no longer breed. Extinction happens when all members of a species die, often due to habitat loss, new predators, disease, or human activity.",
        "Antibiotics do not create purposeful resistance mutations in bacteria. Resistant variants may already exist before exposure.",
        "Antibiotic treatment removes susceptible bacteria more effectively, allowing resistant bacteria to survive and multiply. This is natural selection.",
        "Fossils, comparative anatomy and DNA sequences provide different lines of evidence for evolution.",
        REVISE,
        "Now, pause the video and try this exam-style question. Explain how antibiotic-resistant bacteria evolve. [3 marks]",
        "Here is a model answer. A random mutation gives some bacteria resistance. When antibiotics are used, the non-resistant bacteria die and the resistant ones survive and reproduce, passing on the resistance gene.",
        CLOSE,
    ]),
)

CLASSIFICATION = LessonScript(
    slug="6-4-classification",
    spec="6.4",
    title="Classification of New Organisms",
    subtitle="Linnaeus, kingdoms and the three domains",
    filename="jdscience-6-4-classification-1080p.mp4",
    youtube_filename="JDScience_GCSE_Biology_6_4_Classification.mp4",
    description="The classification hierarchy, three-domain system, and how the domestic dog is named.",
    spoken=_join([
        OPEN,
        "Today, we are exploring classification.",
        "Carl Linnaeus created the modern naming system. Organisms are placed into groups from kingdom down to species, using these levels: kingdom, phylum, class, order, family, genus, and species.",
        "A dog is Animalia, Chordata, Mammalia, Carnivora, Canidae, Canis, and Canis lupus.",
        "The five kingdoms are Animalia, Plantae, Fungi, Protoctista, and Prokaryotae.",
        "Carl Woese later proposed three domains: Archaea, Bacteria, and Eukaryota. DNA evidence shows that all life shares common ancestors.",
        "Evolutionary trees use classification and fossil data to show how species are related.",
        "Classification groups organisms using shared features and evolutionary relationships. The hierarchy runs from kingdom through phylum, class, order, family and genus to species.",
        "Modern biology also uses the three-domain system: Bacteria, Archaea and Eukarya.",
        "The domestic dog is commonly classified as Canis lupus familiaris, a subspecies of the grey wolf, rather than simply equating all dogs with the wild grey wolf.",
        REVISE,
        "Now, pause the video and try this exam-style question. Put these levels of classification in order from largest to smallest: genus, kingdom, species, phylum. [2 marks]",
        "Here is a model answer. Kingdom, phylum, genus, species.",
        CLOSE,
    ]),
)

ADAPTATIONS = LessonScript(
    slug="7-1-adaptations-interdependence",
    spec="7.1",
    title="Adaptations, Interdependence and Competition",
    subtitle="Ecosystems, abiotic and biotic factors",
    filename="jdscience-7-1-adaptations-interdependence-1080p.mp4",
    youtube_filename="JDScience_GCSE_Biology_7_1_Adaptations_Interdependence.mp4",
    description="How organisms compete and adapt, including abiotic and biotic factors.",
    spoken=_join([
        OPEN,
        "Today, we are exploring ecosystems.",
        "An ecosystem is all the living things in an area, along with the non-living parts. Species compete for space, food, water, and light.",
        "Organisms are adapted to their habitats, with structural, behavioural, and functional adaptations.",
        "Interdependence means species rely on each other. For example, oxpeckers eat parasites from buffalo.",
        "Abiotic factors include temperature, moisture, light, pH, wind, oxygen, and carbon dioxide. Biotic factors include food availability, new predators, diseases, and competition.",
        "Organisms in extreme places are called extremophiles. Bacteria near deep sea vents are an example.",
        "A structural adaptation is a physical feature, such as thick fur. A behavioural adaptation is an action, such as migration. A physiological adaptation is an internal process, such as producing concentrated urine.",
        "Organisms can be interdependent through food webs, pollination and decomposition. Changes in one population can therefore affect others, sometimes in unexpected ways.",
        REVISE,
        "Now, pause the video and try this exam-style question. Give one abiotic and one biotic factor that could affect a population of woodland plants. [2 marks]",
        "Here is a model answer. Abiotic: for example, light intensity. Biotic: for example, competition from other plants.",
        CLOSE,
    ]),
)

ECOSYSTEM = LessonScript(
    slug="7-2-organisation-of-an-ecosystem",
    spec="7.2",
    title="Organisation of an Ecosystem",
    subtitle="Food chains, carbon and the water cycle",
    filename="jdscience-7-2-organisation-of-an-ecosystem-1080p.mp4",
    youtube_filename="JDScience_GCSE_Biology_7_2_Organisation_of_an_Ecosystem.mp4",
    description="Energy flow in food chains and how carbon and water cycle through ecosystems.",
    spoken=_join([
        OPEN,
        "Today, we are exploring how energy and materials move through ecosystems.",
        "A food chain shows what eats what, and arrows show the direction of energy flow.",
        "Plants are producers, and they make glucose using the Sun's energy. Herbivores are primary consumers. Carnivores that eat herbivores are secondary consumers, and top carnivores are tertiary consumers.",
        "Carbon moves between air, plants, animals, and decomposers. Respiration releases carbon dioxide.",
        "Water moves through evaporation, condensation, precipitation, and flow. Decomposers break down dead matter. Microbes work best when warm, moist, and oxygenated.",
        "Compost bins and biogas generators use decay to make fertiliser and methane.",
        "In a food chain, the arrow points from the organism being eaten towards the organism receiving energy.",
        "Decomposers break down dead organic material and recycle nutrients. Carbon returns to the atmosphere through respiration, decomposition and combustion.",
        "In the water cycle, evaporation and transpiration transfer water vapour to the air, condensation forms clouds, and precipitation returns water to the surface.",
        REVISE,
        "Now, pause the video and try this exam-style question. Describe how carbon dioxide returns to the air from plants and animals. [2 marks]",
        "Here is a model answer. Respiration by plants and animals releases carbon dioxide. Decomposers also release it when they break down dead matter.",
        CLOSE,
    ]),
)

BIODIVERSITY = LessonScript(
    slug="7-3-biodiversity",
    spec="7.3",
    title="Biodiversity and the Effect of Human Interaction on Ecosystems",
    subtitle="Pollution, deforestation and conservation",
    filename="jdscience-7-3-biodiversity-1080p.mp4",
    youtube_filename="JDScience_GCSE_Biology_7_3_Biodiversity.mp4",
    description="How human activity reduces biodiversity and how deforestation contributes to global warming.",
    spoken=_join([
        OPEN,
        "Today, we are exploring biodiversity and human impact.",
        "Biodiversity is the variety of life. High biodiversity makes ecosystems more stable. Human activities reduce it.",
        "Growing population creates pollution in water, land, and air. Land is lost to quarrying, farming, waste, and homes.",
        "Deforestation for cattle, rice, and biofuels reduces oxygen production, carbon dioxide removal, and biodiversity.",
        "Burning fossil fuels adds carbon dioxide, and deforestation removes the means to absorb it. This increases the greenhouse effect and global warming.",
        "Global warming can cause melting ice, flooding, and extreme weather. To help, we can breed endangered species, protect habitats, cut deforestation and emissions, and recycle.",
        "Biodiversity includes variation within species, between species and across ecosystems.",
        "Deforestation can release stored carbon when vegetation is burnt or decomposes, while also reducing future carbon uptake.",
        "Conservation measures include habitat protection, restoration, sustainable resource management and reducing pollution. The effectiveness of each measure depends on the local ecosystem and the pressures it faces.",
        REVISE,
        "Now, pause the video and try this exam-style question. Explain how deforestation can contribute to global warming. [3 marks]",
        "Here is a model answer. Deforestation removes trees that absorb carbon dioxide. Burning or decay of the wood adds carbon dioxide to the atmosphere. Increased carbon dioxide strengthens the greenhouse effect, causing global warming.",
        CLOSE,
    ]),
)

TROPHIC = LessonScript(
    slug="7-4-trophic-levels",
    spec="7.4",
    title="Trophic Levels in an Ecosystem",
    subtitle="Biomass pyramids and transfer calculations",
    filename="jdscience-7-4-trophic-levels-1080p.mp4",
    youtube_filename="JDScience_GCSE_Biology_7_4_Trophic_Levels.mp4",
    tier="Biology only",
    description="Trophic levels and percentage biomass transfer using the cabbage–rabbit–stoat–fox example.",
    spoken=_join([
        OPEN,
        "Today, we are exploring trophic levels.",
        "Level 1 is producers. Level 2 is herbivores. Level 3 is carnivores that eat herbivores. Level 4 is carnivores that eat other carnivores.",
        "Biomass decreases at each level, which we show with a pyramid. Energy is lost at each stage through respiration, movement, heat, faeces, and waste.",
        "Only about 10 percent of energy is transferred to the next level.",
        "Efficiency equals biomass transferred divided by biomass available. Using the cabbage example at 37 kg, rabbit 3.2 kg, stoat 0.45 kg, and fox 0.04 kg, the efficiencies are about 8.6 percent, 14.1 percent, and 8.9 percent.",
        "A biomass pyramid shows the mass of living material at each trophic level, not a direct measurement of energy.",
        "You can calculate a percentage biomass transfer from the masses given, but do not label it energy-transfer efficiency unless energy data are supplied.",
        "For example, 0.45 kilograms divided by 3.2 kilograms, multiplied by one hundred, gives about 14.1 per cent biomass transfer.",
        REVISE,
        "Now, pause the video and try this exam-style question. Calculate the percentage biomass transferred from the rabbit to the stoat, using a rabbit biomass of 3.2 kg and a stoat biomass of 0.45 kg. Give your answer to one decimal place. [2 marks]",
        "Here is a model answer. Percentage biomass transfer = (0.45 ÷ 3.2) × 100 = 14.1%.",
        CLOSE,
    ]),
)

FOOD_PRODUCTION = LessonScript(
    slug="7-5-food-production",
    spec="7.5",
    title="Food Production",
    subtitle="Food security, mycoprotein and sustainable fishing",
    filename="jdscience-7-5-food-production-1080p.mp4",
    youtube_filename="JDScience_GCSE_Biology_7_5_Food_Production.mp4",
    tier="Biology only",
    description="Food security, efficient food chains, mycoprotein from Fusarium, and fishing quotas.",
    spoken=_join([
        OPEN,
        "Today, we are exploring food production.",
        "The human population has grown rapidly over time. Food security means having enough food for everyone.",
        "Food chains are inefficient, so we can improve them by shortening the chain, keeping animals warm and limiting their movement, and feeding protein.",
        "Sustainable development means not using resources faster than they can be replaced, for example by using fishing quotas and net size limits.",
        "Mycoprotein comes from the fungus Fusarium, which is grown on glucose syrup in aerobic conditions. It is a protein-rich food suitable for vegetarians.",
        "Genetically modified foods can improve crop yield, pest resistance, and shelf life, but they can be expensive and raise ethical issues.",
        "Food security depends not only on total production but also on access, affordability, distribution and stability of supply.",
        "Shorter food chains can reduce losses between trophic levels.",
        "Mycoprotein is produced by cultivating a fungus under controlled conditions, harvesting its biomass and processing it as food. Sustainable fishing requires monitoring stocks and setting catches at levels that populations can withstand.",
        REVISE,
        "Now, pause the video and try this exam-style question. Suggest one reason why fishing quotas help achieve sustainable development. [1 mark]",
        "Here is a model answer. They stop fish being caught faster than they can breed and be replaced, so stocks can recover.",
        CLOSE,
    ]),
)


LESSONS = [
    CELL_DIVISION,
    BACTERIAL_GROWTH,
    TRANSPORT,
    ORGANISATION,
    ANIMAL_SYSTEMS,
    PLANT_SYSTEMS,
    COMMUNICABLE,
    NEW_DRUGS,
    MONOCLONAL,
    PLANT_DISEASE,
    PHOTOSYNTHESIS,
    RESPIRATION,
    HOMEOSTASIS,
    NERVOUS,
    HORMONES,
    PLANT_HORMONES,
    REPRODUCTION,
    VARIATION,
    GENETICS_HISTORY,
    CLASSIFICATION,
    ADAPTATIONS,
    ECOSYSTEM,
    BIODIVERSITY,
    TROPHIC,
    FOOD_PRODUCTION,
]

BY_SLUG = {lesson.slug: lesson for lesson in LESSONS}

assert len(LESSONS) == 25
assert all(lesson.spoken.startswith(OPEN) for lesson in LESSONS)
assert all("jdscience.co.uk" in lesson.spoken for lesson in LESSONS)
assert all("JDScience.in" not in lesson.spoken for lesson in LESSONS)
assert len({lesson.slug for lesson in LESSONS}) == 25
