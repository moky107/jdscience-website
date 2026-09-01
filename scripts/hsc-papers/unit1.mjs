import { part, question, paper } from "./shared.mjs";

const UNIT = {
  unit: 1,
  unitTitle: "Human Lifespan Development",
  time: "1 hour 30 minutes",
  totalMarks: 90,
};

export const UNIT1_PAPERS = [
  paper({
    ...UNIT,
    id: "unit1-set-a",
    setLabel: "Set_A",
    questions: [
      question(1, "Aisha is 9 months old. She lives with her mother, Farah, in a first-floor flat. Farah works evenings in a supermarket. Aisha’s grandmother looks after her at night. Aisha can sit without support, reach for toys and babbles “mama”. She becomes distressed when Farah leaves for work and settles when her grandmother sings to her.\n\nWhen Aisha is 7 years old she starts Year 3. She can ride a scooter, write her name and has two close friends. She sometimes has tantrums if she loses a game.", [
        part("a", "Identify two physical developments expected in infancy.", 2, [
          "Award 1 mark for each valid physical development, up to 2 marks.",
          "Examples: sitting without support; crawling/cruising; standing with help; palmar or pincer grasp; teething; rapid weight/height gain; improved head control.",
        ]),
        part("b", "Describe two intellectual developments shown by Aisha at 9 months.", 4, [
          "Award 1 mark for identifying a development and 1 mark for a linked description, twice.",
          "Object permanence beginning / looking for dropped toys.",
          "Language: babbling, turning to name, early understanding of familiar words.",
          "Cause and effect: reaching for toys, repeating actions that get a response.",
        ]),
        part("c", "Explain how attachment may affect Aisha’s emotional development in infancy.", 6, [
          "Award marks for linked explanation applied to Aisha, not a list of theorists only.",
          "Secure base: Farah/grandmother as safe people so Aisha explores then returns for comfort.",
          "Separation protest when Farah leaves is typical if an attachment has formed.",
          "Consistent comfort (grandmother singing) supports trust and emotional regulation.",
          "Inconsistent care because Farah works evenings could cause anxiety unless grandmother is a stable secondary attachment.",
          "Level 3 (5–6): applied explanation with more than one idea and a consequence for Aisha.",
        ]),
        part("d", "Discuss how Aisha’s social development is likely to have changed from 9 months to 7 years.", 10, [
          "Indicative content: from dyadic attachment/stranger wariness to friendships, turn-taking, school rules, wider social circle.",
          "Play: solitary/parallel in infancy vs cooperative play and games with rules at 7.",
          "Language used to negotiate; two close friends shows preference and belonging.",
          "Tantrums if she loses may show still-developing emotional control in social situations.",
          "Level 3 (8–10): balanced discussion of change, applied to Aisha, with a conclusion.",
        ]),
      ]),
      question(2, "Callum is 15. He has grown 12 cm in a year, his voice has broken and he has acne. He argues with his dad about going out, spends long periods on his phone and has joined a football team. His predicted grades have dropped. He tells the school nurse he feels “not good enough” compared with friends.", [
        part("a", "Identify two physical changes of puberty in adolescent males.", 2, [
          "Award 1 mark each, up to 2.",
          "Examples: growth spurt; voice breaking; facial/body hair; genital development; increased muscle mass; acne linked to hormones; sperm production.",
        ]),
        part("b", "Outline two intellectual changes that may occur in adolescence.", 4, [
          "Award 1+1 for each outlined change.",
          "Abstract thinking / hypothesising (formal operations).",
          "Better planning and considering consequences, though the prefrontal cortex is still maturing so risk-taking may continue.",
          "Exam-focused memory and specialist vocabulary at school.",
        ]),
        part("c", "Explain two ways hormonal changes may affect Callum’s emotional development.", 6, [
          "Award up to 3 marks per way: identify hormone/change, link to emotion, apply to Callum.",
          "Testosterone/oestrogen fluctuations → mood swings, irritability, arguments with dad.",
          "Body image: acne and rapid growth → self-consciousness and “not good enough”.",
          "Sleep and energy changes affecting mood and motivation for school.",
        ]),
        part("d", "Evaluate the influence of peers on Callum’s social and intellectual development.", 10, [
          "Positive: football team → belonging, teamwork, physical activity supporting mood; peers modelling revision.",
          "Negative: comparison on phone → low self-esteem; possible pressure to skip work; predicted grades dropping.",
          "Identity: trying roles (sport vs school) as part of forming adult identity.",
          "Judgement: peers can support or undermine development depending on the group and adult support.",
          "Level 3 (8–10): both sides, applied to Callum, with a justified conclusion.",
        ]),
      ]),
      question(3, "Noah and Ellis are identical twins, aged 11. They live with their father after their parents separated last year. Noah has asthma. Ellis does not. The family has moved to a smaller house near a busy road. Their father works two jobs. Both boys still attend the same primary school and see their mother every other weekend.", [
        part("a", "Define the nature–nurture debate in human development.", 2, [
          "Award 1 mark for nature (genetic/biological inheritance) and 1 mark for nurture (environment, care, experience).",
          "Do not award a one-word answer of “genes versus environment” without a brief sense of development being shaped by both.",
        ]),
        part("b", "Describe two genetic or biological factors that may affect Noah’s development.", 4, [
          "Identical genes shared with Ellis — any difference is more likely environmental or epigenetic, but asthma can have a genetic component.",
          "Asthma as a biological condition affecting physical development, energy, school sport and sleep.",
          "Shared inheritance from parents (height potential, predisposition).",
        ]),
        part("c", "Explain how two environmental or economic factors may affect the twins’ development.", 6, [
          "Busy road: air quality worsening Noah’s asthma; noise affecting sleep/concentration.",
          "Smaller house / two jobs: less time with father, possible reduced income, fewer clubs.",
          "Parental separation as a major life event affecting emotional security.",
          "Protective: same school and regular contact with mother can support continuity.",
        ]),
        part("d", "Assess the likely combined effects of these factors on the twins’ emotional development.", 10, [
          "Same genes but different experiences (asthma, possible different copings) can lead to different emotional outcomes.",
          "Loss, house move and less parental time may cause anxiety, anger or clinginess.",
          "Routine (school, weekend contact) may buffer stress.",
          "Noah may feel different/limited by asthma; Ellis may feel guilty or overlooked.",
          "Level 3: assessment of combined nature and nurture with a reasoned conclusion about likely emotional effects.",
        ]),
      ]),
      question(4, "Doreen Hale is 78. She lives alone since her husband died 18 months ago. She has osteoarthritis in both knees, wears hearing aids and has started to forget appointments. She used to run the lunch club at the community centre. Her daughter wants her to consider extra support at home.", [
        part("a", "Identify two physical effects of ageing.", 2, [
          "Award 1 mark each.",
          "Examples: reduced mobility/joint stiffness; sensory loss (hearing/vision); slower healing; cardiovascular change; loss of muscle mass (sarcopenia).",
        ]),
        part("b", "Describe two intellectual changes that may occur in later adulthood.", 4, [
          "Mild memory lapses vs more significant forgetfulness (appointments) which may need investigation (not automatically dementia).",
          "Wisdom/experience and vocabulary may remain strong.",
          "Slower processing speed; need for more time to learn new technology.",
        ]),
        part("c", "Explain how Doreen’s social development may be affected by bereavement and reduced mobility.", 6, [
          "Loss of husband → isolation, loss of daily conversation and role as a couple.",
          "Osteoarthritis/hearing → harder to get to lunch club, withdraws from groups.",
          "Loss of the lunch-club role reduces status, purpose and social contact.",
          "Daughter’s involvement can maintain some social support if accepted.",
        ]),
        part("d", "Discuss how health and social care services could support Doreen’s development in later adulthood.", 12, [
          "GP/practice nurse: pain, hearing aid review, memory assessment if appropriate.",
          "Physiotherapy/OT: mobility, home adaptations, falls prevention.",
          "Social care: homecare, befriending, day services to replace lost social role.",
          "Voluntary sector: lunch clubs, hearing support groups.",
          "Person-centred: Doreen’s choice, not only her daughter’s preference.",
          "Level 3 (7–8): a range of services linked to PIES, with a short judgement.",
        ]),
      ]),
    ],
  }),
  paper({
    ...UNIT,
    id: "unit1-set-b",
    setLabel: "Set_B",
    questions: [
      question(1, "Tomasz is 24. He has started his first full-time job in a warehouse and has moved into a shared house. He is saving for driving lessons. He plays five-a-side football twice a week. He argues with his parents less than he did at 17, but he still asks them for advice about money.", [
        part("a", "Identify two characteristic physical features of early adulthood.", 2, [
          "Peak physical fitness/strength for many people; full adult height already reached; reproductive maturity; generally high energy.",
        ]),
        part("b", "Describe how Tomasz’s intellectual development may continue in early adulthood.", 4, [
          "Workplace learning: procedures, time management, specialist skills.",
          "Practical problem-solving (budgeting, tenancy).",
          "Further education or training if he chooses it later.",
        ]),
        part("c", "Explain two emotional developments associated with early adulthood, using Tomasz as an example.", 6, [
          "Independence and identity as a worker, not only as a son.",
          "Intimate relationships / trust in housemates; still using parents as a secure base for money advice.",
          "Self-esteem from football and earning.",
        ]),
        part("d", "Discuss how entering employment can affect social development in early adulthood.", 14, [
          "New colleagues and shared house expand social networks beyond school friends.",
          "Less time for old peers; football maintains a social group.",
          "Adult roles and responsibilities (rent, shifts) change how he relates to parents.",
          "Risk: isolation if shifts clash with friends; benefit: status and belonging at work.",
          "Level 3: both positive and challenging social effects with a conclusion.",
        ]),
      ]),
      question(2, "Priya is 47. She is a secondary school teacher. Her periods have become irregular and she has hot flushes. She cares for her father, who has Parkinson’s disease, and her teenage son. She has started evening walks with a friend because she feels “stretched thin”.", [
        part("a", "Identify two physical changes associated with perimenopause or middle adulthood.", 2, [
          "Irregular periods; hot flushes; possible weight redistribution; reduced fertility; joint stiffness; greying hair.",
        ]),
        part("b", "Outline two intellectual demands Priya may face in middle adulthood.", 4, [
          "Complex job (planning, behaviour management).",
          "Managing appointments and medication for her father.",
          "Supporting a teenager’s schoolwork while keeping her own professional knowledge up to date.",
        ]),
        part("c", "Explain how being a sandwich carer may affect Priya’s emotional development.", 6, [
          "Role strain and guilt if she feels she is not doing enough for son or father.",
          "Stress/anxiety from competing demands; walks with a friend as a coping strategy supporting mood.",
          "Possible pride and purpose from caring, alongside risk of burnout.",
        ]),
        part("d", "Evaluate the impact of lifestyle choices on Priya’s health and development in middle adulthood.", 10, [
          "Evening walks: physical fitness, stress relief, social contact — protective.",
          "Teaching workload and night-time flushes may disrupt sleep — risk for concentration and mood.",
          "Diet, alcohol, screening (not given) would also matter; do not invent facts.",
          "Lifestyle can moderate but not remove biological change (menopause) or caring load.",
          "Level 3: judgement that lifestyle helps but support services may still be needed.",
        ]),
      ]),
      question(3, "Kenji is 71. He retired from engineering two years ago. He volunteers in a repair café, uses a smartphone to video-call his grandchildren in Japan, and has a mild hearing loss. He had a hip replacement six months ago and now walks with a stick on uneven ground.", [
        part("a", "Identify two theories of ageing.", 2, [
          "Award 1 mark each. Examples: disengagement theory; activity theory; social/emotional selectivity; biological (wear and tear, programmed ageing). Names only are acceptable.",
        ]),
        part("b", "Describe how activity theory could be applied to Kenji.", 4, [
          "Activity theory: wellbeing in later life is supported by staying involved.",
          "Repair café, video calls and walking after hip surgery are roles that replace work identity.",
          "Contrast: if he withdrew fully, disengagement theory would predict reduced social involvement (not a good fit here).",
        ]),
        part("c", "Explain two ways sensory change may affect Kenji’s development.", 6, [
          "Hearing loss: conversation at the café harder → risk of isolation unless loops/hearing aids used.",
          "May affect safety (traffic, alarms) and confidence walking outside.",
          "Video calls rely more on vision; captions could help — apply, do not list gadgets unlinked to Kenji.",
        ]),
        part("d", "Assess the likely effects of retirement on Kenji’s PIES development.", 10, [
          "Physical: more time to walk/rehab, but risk of inactivity if volunteering stopped.",
          "Intellectual: repair café keeps problem-solving; risk of boredom if no structure.",
          "Emotional: loss of engineer status vs pride in volunteering and family contact.",
          "Social: workplace friends may fade; café and grandchildren provide new/continuing ties.",
          "Level 3: balanced assessment across PIES with a short overall judgement.",
        ]),
      ]),
      question(4, "Leah is 4. She was born at 34 weeks. She has speech delay and attends a childminder three days a week while her parents work. Health visitors have suggested extra play sessions. Leah loves picture books but becomes frustrated when adults do not understand her.", [
        part("a", "Identify two features of physical development in early childhood (3–8 years).", 2, [
          "Improved running/jumping/climbing; tripod grasp; dressing with less help; better balance; drawing shapes.",
        ]),
        part("b", "Describe two possible causes of Leah’s speech delay.", 4, [
          "Prematurity affecting early neurological/physical development.",
          "Limited adult conversation if both parents work long hours (environmental).",
          "Hearing problem should be considered (glue ear) — as a possible cause, not a diagnosis.",
          "Bilingual home (not stated — do not invent). Only use the case.",
        ]),
        part("c", "Explain how play can support Leah’s intellectual and social development.", 6, [
          "Picture books: vocabulary, joint attention, turn-taking.",
          "Play sessions: pretend play → symbols, problem-solving; parallel to cooperative play with peers.",
          "Childminder as a consistent adult model of language.",
        ]),
        part("d", "Discuss how professionals could work together to support Leah’s development.", 8, [
          "Health visitor: review development, hearing, referral.",
          "Speech and language therapist: strategies for parents/childminder.",
          "Early years setting: targeted communication games.",
          "Parents: reading, reducing frustration by offering choices/signs.",
          "Level 3: joined-up, person-centred support with a conclusion about likely benefit.",
        ]),
      ]),
    ],
  }),
  paper({
    ...UNIT,
    id: "unit1-set-c",
    setLabel: "Set_C",
    questions: [
      question(1, "Sophie is 16 and 28 weeks pregnant. She lives with her mum. She has stopped attending college three days a week because of nausea and tiredness. She wants to keep the baby. Her friends have been less in touch. The midwife has given her information about antenatal classes and college support.", [
        part("a", "Identify two physical developments that occur during pregnancy for the mother.", 2, [
          "Examples: uterine growth; weight gain; breast changes; increased blood volume; tiredness/nausea as physical effects.",
        ]),
        part("b", "Describe two intellectual effects that unexpected pregnancy may have on an adolescent.", 4, [
          "Interrupted college learning; difficulty concentrating because of tiredness.",
          "Need to learn about pregnancy, birth and infant care — new knowledge.",
        ]),
        part("c", "Explain how Sophie’s emotional and social development may be affected.", 6, [
          "Emotional: anxiety, excitement, identity shift from student to parent-to-be; possible conflict at home.",
          "Social: friends less in touch → isolation; mum and midwife as support; antenatal classes as a new social group.",
        ]),
        part("d", "Discuss how nature and nurture both influence the unborn baby’s development in this case.", 14, [
          "Nature: genetics from Sophie and the baby’s father; gestation at 28 weeks — organs still maturing.",
          "Nurture: maternal nutrition, rest, antenatal care, stress, college attendance affecting Sophie’s health which affects the foetus.",
          "Avoid blaming Sophie; keep it applied and balanced.",
          "Level 3: both sides with a conclusion that both matter.",
        ]),
      ]),
      question(2, "Mr Idris is 64. He had a stroke three months ago. His right arm is weaker, his speech is slower and he feels low. He was a bus driver. His partner has reduced her hours to help him. He has started physiotherapy and a stroke group.", [
        part("a", "Identify two physical effects of a stroke.", 2, [
          "Weakness/paralysis on one side; speech difficulty (dysarthria/aphasia); fatigue; balance problems; swallowing difficulty.",
        ]),
        part("b", "Describe two intellectual or communication changes Mr Idris may experience.", 4, [
          "Slower speech; word-finding; possible attention/memory fatigue after the event.",
          "Need to relearn sequences (dressing, using a phone).",
        ]),
        part("c", "Explain how this life event may affect Mr Idris’s emotional development.", 6, [
          "Loss of driving role → grief, frustration, low mood.",
          "Dependence on partner may affect self-esteem and the relationship.",
          "Stroke group and physiotherapy can restore hope and control.",
        ]),
        part("d", "Evaluate the support available to promote Mr Idris’s development after the stroke.", 10, [
          "Physiotherapy: physical recovery and independence.",
          "Stroke group: social/emotional peer support.",
          "Partner: daily support but risk of carer strain — services should support both.",
          "Possible speech and language therapy, occupational therapy, benefits advice (apply, do not dump a list).",
          "Level 3: judgement about what will help most and any gaps.",
        ]),
      ]),
      question(3, "The Holmes and Rahe Social Readjustment Rating Scale lists life events that may cause stress. Amira, 33, has in one year: got married, moved city for work, become pregnant and had a bereavement in her extended family. She is sleeping poorly.", [
        part("a", "Identify two examples of expected life events.", 2, [
          "Examples: starting school; marriage; starting work; retirement; moving house (can also be unexpected). Award expected events, not disasters.",
        ]),
        part("b", "Outline two unexpected life events.", 4, [
          "Bereavement; serious illness/accident; redundancy; relationship breakdown. Outline means a brief phrase, not a full essay.",
        ]),
        part("c", "Explain how a cluster of life events may affect Amira’s physical and emotional development.", 6, [
          "Cumulative stress (Holmes and Rahe idea): sleep loss, immune/physical strain, anxiety.",
          "Positive events (marriage, pregnancy, new job) still require adjustment.",
          "Pregnancy plus poor sleep affects energy; bereavement may complicate joy about the baby.",
        ]),
        part("d", "Discuss ways Amira could be supported to reduce the negative effects of these events.", 8, [
          "Midwife/GP: sleep, mental health, antenatal care.",
          "Employer: reasonable adjustments, maternity information.",
          "Social: partner, friends, bereavement support.",
          "Self-care: rest, realistic expectations — not a substitute for services.",
          "Level 3: range of supports with a conclusion.",
        ]),
      ]),
      question(4, "A nursery reports on two children aged 18 months. Hanna walks confidently, uses 20 words and waves goodbye. Yusuf has low muscle tone, sits with support and uses a few sounds. Yusuf has weekly physiotherapy. Both children have attentive parents.", [
        part("a", "Identify two gross motor skills expected by 18 months.", 2, [
          "Walking independently; crawling; pulling to stand; climbing onto a sofa with help; kicking a ball (emerging).",
        ]),
        part("b", "Describe two fine motor skills expected in infancy or early toddlerhood.", 4, [
          "Pincer grasp; pointing; stacking a few blocks; scribbling; self-feeding with fingers/spoon with mess.",
        ]),
        part("c", "Explain why children of the same age may show different patterns of development.", 6, [
          "Biological: low muscle tone, possible additional needs.",
          "Experience: opportunity to practise; physiotherapy as planned intervention.",
          "Development is a range, not a single timetable; delay needs monitoring but is not automatically neglect — both have attentive parents.",
        ]),
        part("d", "Assess how early intervention could affect Yusuf’s later development.", 10, [
          "Physiotherapy now may improve tone, sitting, later walking and confidence.",
          "Language: sounds now — SALT if needed to support later communication and social play.",
          "Parent involvement: practising at home multiplies effect.",
          "Without support, delay might widen (catch-up vs widening gap).",
          "Level 3: reasoned assessment of likely benefit and remaining uncertainty.",
        ]),
      ]),
    ],
  }),
];
