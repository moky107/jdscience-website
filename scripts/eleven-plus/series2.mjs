import {
  arrow,
  bars,
  chevron,
  circle,
  combo,
  cubeNet,
  diamond,
  dots,
  hexagon,
  lShape,
  plus,
  ringDot,
  row,
  square,
  triangle,
  choiceTiles,
} from "./nvr-figures.mjs";

function q(stem, answer, explanation, extra = {}) {
  return { stem, answer, explanation, marks: extra.marks || 1, ...extra };
}

function nvr(stem, figure, options, answer, explanation, extra = {}) {
  return {
    stem,
    figure,
    options: choiceTiles(options),
    answer,
    explanation,
    marks: 1,
    ...extra,
  };
}

const DISCLAIMER =
  "This is original JDScience practice. It is independent of, and not affiliated with, GL Assessment, CEM, CSSE, Bond, CGP or any other publisher or test provider.";

function asQuestionPaper(spec) {
  return {
    ...spec,
    kind: "questions",
    id: spec.baseId,
    file: spec.questionFile,
    title: spec.questionTitle,
    instructions: spec.questionInstructions,
    time: spec.time,
  };
}

function asAnswerPaper(spec) {
  return {
    ...spec,
    kind: "answers",
    id: `${spec.baseId}-answers`,
    file: spec.answerFile,
    title: spec.answerTitle,
    instructions: spec.answerInstructions,
    time: spec.answerTime || "Mark after the timed paper",
  };
}

function pair(spec) {
  return [asQuestionPaper(spec), asAnswerPaper(spec)];
}

const NORTHFIELD_HATCH = `On the first dry Monday after half-term, Ama climbed the narrow stair to the roof of Northfield Primary. The hatch stuck, as it always did, and she had to put her shoulder to the wood before the sky arrived all at once: a wide, pale lid over the playground and the dark line of the canal.

Mr Pell was already there, kneeling beside the weather hatch — a low timber box with a hinged lid, built years ago so the Year 6 science club could keep rain gauges and a wind vane out of the worst of the weather. The lid was swollen. One hinge hung by a single screw.

“We are not inventing the weather,” Mr Pell said, which was his way of beginning. “We are only trying to notice it honestly.”

Ama liked that. Last winter the club had written temperatures in a book that nobody checked, and the numbers had wandered. A thermometer left in a sunny corner had pretended July in January. Ama had felt foolish when she realised. Noticing honestly, she decided, was harder than it sounded.

They lifted the lid. Inside, a copper rain cup sat slightly crooked, and a paper wind rose had faded until the N for north was only a grey suggestion. Ama wiped the cup with a cloth that smelled of lemon soap. Mr Pell tightened the hinge and then sat back on his heels, waiting, as if the box might thank him.

From the roof you could see Mrs Kaur’s washing on the line behind the flats, and a heron standing in the canal like a grey question mark. The wind vane, once they had oiled it, swung toward the west and stayed there, trembling.

“West wind, dry day, high cloud,” Ama said, because she had been reading the old club notes.

Mr Pell smiled with only one side of his mouth. “Write it. Then check it at three o’clock. If the sky disagrees, we believe the sky.”

Ama wrote in a new notebook with a stiff blue cover. She wrote the date, the direction, the look of the cloud, and, in smaller letters, Hatch mended. She did not write about the heron, although she wanted to. That, she thought, was a different kind of noticing, and it belonged in a different book.

At three o’clock the playground was loud with skipping ropes. Ama went up alone. The vane still pointed west. The rain cup was empty. The sky, which had been pale, had taken on a thin brightness, like paper held up to a lamp. She added a tick beside her morning notes.

On the way down she paused on the stair and listened. The hatch no longer rattled. It sat quiet in the roof, doing the small work of keeping the instruments ready, which was not dramatic, and was exactly the point.`;

const MATHS_SPEC = {
  baseId: "gl-maths-1",
  folder: "maths",
  subject: "Maths",
  skill_area: "GL-style mixed maths",
  description: "Original JDScience GL-style Maths practice paper 1: arithmetic, FDP, ratio, word problems, geometry, measures, data and problem solving.",
  questionFile: "JDScience_11Plus_GL_Style_Maths_Practice_Paper_1.pdf",
  answerFile: "JDScience_11Plus_GL_Style_Maths_Answers_1.pdf",
  questionTitle: "11+ GL-Style Maths Practice Paper 1",
  answerTitle: "11+ GL-Style Maths Practice Paper 1 — Answers",
  time: "50 minutes",
  questionInstructions: `${DISCLAIMER} Work without a calculator. Suggested time 50 minutes. Try every question. If you are stuck, move on and return later. There is one mark for each question unless shown otherwise.`,
  answerInstructions: "These answers belong with JDScience 11+ GL-Style Maths Practice Paper 1. Do not open this booklet until you have finished the paper. Equivalent methods are accepted if they reach the same result.",
  questions: [
    q("Section A — Arithmetic. Work out 58 + 247.", "305", "8 + 7 = 15, write 5 carry 1; 5 + 4 + 1 = 10, write 0 carry 1; 2 + 1 = 3.", { section: "Section A — Arithmetic", lines: 2 }),
    q("Work out 804 − 369.", "435", "Borrow where needed: 14 − 9 = 5, 9 − 6 = 3, 7 − 3 = 4, giving 435.", { lines: 2 }),
    q("Work out 36 × 14.", "504", "36 × 10 = 360 and 36 × 4 = 144. 360 + 144 = 504.", { lines: 2 }),
    q("Work out 576 ÷ 16.", "36", "16 × 36 = 576.", { lines: 2 }),
    q("Find the value of 7² − 3³.", "22", "7² = 49 and 3³ = 27. 49 − 27 = 22."),
    q("Work out 4 × (9 + 6).", "60", "Brackets first: 9 + 6 = 15. 4 × 15 = 60."),
    q("Work out 18 + 12 ÷ 3 × 2.", "26", "12 ÷ 3 = 4, then 4 × 2 = 8. 18 + 8 = 26."),
    q("Work out 2.75 + 1.48.", "4.23", "Hundredths 5 + 8 = 13; tenths 7 + 4 + 1 = 12; units 2 + 1 + 1 = 4."),
    q("Work out 9.6 ÷ 0.3.", "32", "Multiply both by 10: 96 ÷ 3 = 32."),
    q("Work out −12 + 19.", "7", "From −12, add 19 to reach 7."),
    q("Section B — Fractions, decimals and percentages. Work out 3/4 + 1/8. Give the answer in its simplest form.", "7/8", "3/4 = 6/8. 6/8 + 1/8 = 7/8.", { section: "Section B — Fractions, decimals and percentages" }),
    q("Find 5/6 of 42.", "35", "42 ÷ 6 = 7, then 7 × 5 = 35."),
    q("Write 0.45 as a percentage.", "45%", "0.45 is 45 hundredths."),
    q("Write 3/5 as a decimal.", "0.6", "3 ÷ 5 = 0.6."),
    q("Find 25% of 84.", "21", "25% is one quarter. 84 ÷ 4 = 21."),
    q("Increase 40 by 15%.", "46", "10% of 40 = 4 and 5% = 2, so 15% = 6. 40 + 6 = 46."),
    q("A jacket costs £64. In a sale it is reduced by 1/4. What is the sale price?", "£48", "1/4 of 64 = 16. 64 − 16 = 48."),
    q("Section C — Ratio and proportion. Simplify the ratio 12 : 18.", "2 : 3", "Divide both parts by 6.", { section: "Section C — Ratio and proportion" }),
    q("Share £48 in the ratio 3 : 5.", "£18 and £30", "8 parts. 48 ÷ 8 = £6. 3 × 6 = £18 and 5 × 6 = £30."),
    q("Three identical cakes cost £4.50. How much do seven of the same cakes cost?", "£10.50", "One cake is £1.50. 7 × 1.50 = £10.50."),
    q("A recipe for 8 people uses 600 g of flour. How much flour is needed for 6 people?", "450 g", "600 ÷ 8 = 75 g per person. 75 × 6 = 450 g."),
    q("Section D — Word problems and measures. A train leaves at 09:35. The journey lasts 1 hour 50 minutes. At what time does it arrive?", "11:25", "09:35 + 1 hour = 10:35. 10:35 + 50 minutes = 11:25.", { section: "Section D — Word problems and measures" }),
    q("Write 2.5 kg in grams.", "2500 g", "1 kg = 1000 g."),
    q("A rectangle is 8 cm long and 5 cm wide. Find its perimeter and its area.", "Perimeter 26 cm; area 40 cm²", "Perimeter = 2 × (8 + 5) = 26 cm. Area = 8 × 5 = 40 cm²."),
    q("Convert 3.2 m into centimetres.", "320 cm", "1 m = 100 cm."),
    q("A cuboid measures 4 cm by 3 cm by 5 cm. What is its volume?", "60 cm³", "4 × 3 × 5 = 60."),
    q("A car travels 90 km in 1.5 hours at a steady speed. What is its speed in km/h?", "60 km/h", "90 ÷ 1.5 = 60."),
    q("There are 30 sweets in a bag. 2/5 of them are eaten. How many sweets are left?", "18", "2/5 of 30 = 12 eaten. 30 − 12 = 18."),
    q("Five coaches each have 48 seats. 17 seats are empty. How many passengers are there?", "223", "5 × 48 = 240. 240 − 17 = 223."),
    q("Section E — Geometry. Two angles in a triangle are 50° and 70°. What is the third angle?", "60°", "180 − 50 − 70 = 60°.", { section: "Section E — Geometry" }),
    q("A regular hexagon has perimeter 54 cm. What is the length of one side?", "9 cm", "54 ÷ 6 = 9 cm."),
    q("Point P is (3, 2). What are the coordinates of P after a reflection in the x-axis?", "(3, −2)", "x stays 3; y changes sign."),
    q("How many faces does a triangular prism have?", "5", "Two triangular ends and three rectangular sides."),
    q("Section F — Data handling. Find the mean of 4, 9, 11 and 16.", "10", "Sum = 40. 40 ÷ 4 = 10.", { section: "Section F — Data handling" }),
    q("Find the median of 3, 8, 8, 12, 20.", "8", "The middle value of the ordered list is 8."),
    q("The range of a set of masses is 14 kg. The smallest mass is 9 kg. What is the largest mass?", "23 kg", "9 + 14 = 23 kg."),
    q("A fair six-sided dice is rolled. What is the probability of an even score? Give a fraction in its simplest form.", "1/2", "2, 4 and 6 are three of six outcomes."),
    q("Club members: Monday 12, Tuesday 9, Wednesday 15. What is the mean number of members per day?", "12", "12 + 9 + 15 = 36. 36 ÷ 3 = 12."),
    q("Section G — Problem solving. A number is multiplied by 8. Then 11 is added. The result is 59. What was the number?", "6", "59 − 11 = 48, then 48 ÷ 8 = 6.", { section: "Section G — Problem solving" }),
    q("Write 60 as a product of prime factors. Use index notation.", "2² × 3 × 5", "60 = 2 × 2 × 3 × 5."),
  ],
};

const ENGLISH_SPEC = {
  baseId: "gl-english-1",
  folder: "english",
  subject: "English",
  skill_area: "GL-style reading, SPaG and writing",
  description: "Original JDScience GL-style English paper 1: an original passage, comprehension, vocabulary, grammar, punctuation, spelling, sentence improvement and a short writing task.",
  questionFile: "JDScience_11Plus_GL_Style_English_Practice_Paper_1.pdf",
  answerFile: "JDScience_11Plus_GL_Style_English_Answers_1.pdf",
  questionTitle: "11+ GL-Style English Practice Paper 1",
  answerTitle: "11+ GL-Style English Practice Paper 1 — Answers",
  time: "50 minutes",
  questionInstructions: `${DISCLAIMER} Spend about 25 minutes on the reading section, 15 minutes on vocabulary, grammar, punctuation and spelling, and 10 minutes on the short writing task. Write in full sentences when you are asked to explain.`,
  answerInstructions: "These answers belong with JDScience 11+ GL-Style English Practice Paper 1. Accept equivalent wording where the meaning matches. The writing task is marked with indicative content, not a single model story.",
  questions: [
    {
      section: "Section A — Reading",
      kind: "passage",
      stem: "Read the passage, then answer questions 1 to 10.",
      passage: NORTHFIELD_HATCH,
    },
    q("Where does Ama go at the start of the passage?", "Up the narrow stair to the roof of Northfield Primary.", "The opening sentence places her climbing to the school roof."),
    q("What is the weather hatch, and what is it used for?", "A low timber box with a hinged lid, used to keep rain gauges and a wind vane out of the worst weather.", "The narrator describes the box and the science-club instruments it protects."),
    q("Give two details that show the hatch is in poor condition before they mend it.", "The lid is swollen; one hinge hangs by a single screw. (Accept: the hatch stuck; rain cup crooked; faded wind rose.)", "These faults are listed when Ama and Mr Pell reach the box."),
    q("What does Mr Pell mean by “noticing it honestly”?", "Recording the weather accurately, without pretending or using a badly placed instrument.", "He contrasts honest noticing with last winter’s unchecked, misleading temperatures."),
    q("Why had Ama felt foolish last winter?", "A thermometer in a sunny corner had given false high readings (July in January) that nobody checked.", "The club wrote numbers that wandered because the instrument was poorly placed."),
    q("Find and copy a simile used to describe the heron.", "like a grey question mark", "The heron stands in the canal “like a grey question mark”."),
    q("Look at Ama’s notebook. What four things does she write in the morning, and what does she choose not to write?", "Date, wind direction, look of the cloud, and “Hatch mended”. She does not write about the heron.", "She keeps the heron for a different kind of noticing."),
    q("“If the sky disagrees, we believe the sky.” What does this suggest about how Mr Pell wants Ama to work?", "She should check her notes against the real weather and correct them if they are wrong.", "Evidence comes first; the notebook is not more important than what she can see."),
    q("How does the writer show that the afternoon check is successful? Use two pieces of evidence.", "The vane still points west; the rain cup is empty; she adds a tick beside her morning notes. (Any two.)", "The later visit confirms the morning record rather than contradicting it."),
    q("What is “exactly the point” of the hatch at the end of the passage?", "It does quiet, useful work keeping the instruments ready, rather than being dramatic.", "Ama notices that it no longer rattles and sits quietly in the roof."),
    q("Section B — Vocabulary in context. What does swollen mean in “The lid was swollen”?", "Puffed up / expanded (from damp), so it no longer fits easily.", "Wood swells when it takes in moisture.", { section: "Section B — Vocabulary in context" }),
    q("Which word is closest in meaning to faded as used in the passage?\nA) brightened   B) disappeared completely   C) lost colour / become paler   D) torn", "C", "The N for north is only a grey suggestion, so the ink has paled."),
    q("Give a synonym of trembling as used of the wind vane.", "shaking / quivering / shivering", "The vane stays west but is not perfectly still."),
    q("Section C — Grammar, punctuation and spelling. Choose the correctly punctuated sentence.\nA) Ama wrote the date the direction and the cloud.\nB) Ama wrote the date, the direction and the cloud.\nC) Ama wrote, the date the direction, and the cloud.", "B", "Commas separate items in a list. B is the standard list.", { section: "Section C — Grammar, punctuation and spelling" }),
    q("Rewrite in the past tense: The hatch sticks, and Ama puts her shoulder to the wood.", "The hatch stuck, and Ama put her shoulder to the wood.", "sticks → stuck; puts → put."),
    q("Add the missing apostrophes: Amas notebook sat beside Mr Pells bag.", "Ama’s notebook sat beside Mr Pell’s bag.", "Both names are singular possessives."),
    q("Which word is an adverb?  honest  quietly  timber  pale", "quietly", "Quietly describes how something is done."),
    q("Choose the correct spelling: recieve / receive / receve", "receive", "i before e except after c."),
    q("Choose the correct spelling: seperate / separate / seperete", "separate", "There is a rat in separate."),
    q("Choose the correct homophone: They climbed (to / too / two) the roof.", "to", "To shows direction. Too means also; two is the number."),
    q("Section D — Sentence improvement. Rewrite this as one correct complex sentence: Ama liked the roof. The hatch stuck.", "Although the hatch stuck, Ama liked the roof. / Ama liked the roof even though the hatch stuck. (Any accurate joining.)", "Use a subordinating conjunction rather than two abrupt sentences.", { section: "Section D — Sentence improvement" }),
    q("Improve this sentence by replacing the repeated word nice: It was a nice day and the view was nice.", "Accept any precise rewrite, e.g. It was a clear, dry day and the view was wide / pale / striking.", "Replace vague nice with specific adjectives."),
    q("Correct the sentence: Me and Mr Pell is mending the hinge.", "Mr Pell and I are mending the hinge.", "I is the subject; the verb agrees (are)."),
    q("Section E — Short writing. Write a description (about 80–120 words) of arriving at a quiet place that is about to become busy. Include: a clear setting, two sensory details, and a change as people or noise arrive. Plan quickly, then write.", "Indicative: a named quiet setting; at least two senses; a shift from stillness to activity; accurate sentences. Award for task coverage, not one model story.", "Look for setting, sensory detail and a change from quiet to busy. Sample opening: The library stairs smelled of polish. For a minute Ama heard only her own steps — then the bell rang below and the corridor filled.", { section: "Section E — Short writing", marks: 8, lines: 12 }),
  ],
};

const VR_SPEC = {
  baseId: "vr-3",
  folder: "verbal-reasoning",
  subject: "Verbal Reasoning",
  skill_area: "Meanings, codes, sequences and word relationships",
  description: "Original JDScience Verbal Reasoning Practice Paper 3: word meanings, synonyms and antonyms, letter and number codes, odd one out, word pairs, compound words and alphabet sequences.",
  questionFile: "JDScience_11Plus_Verbal_Reasoning_Practice_Paper_3.pdf",
  answerFile: "JDScience_11Plus_Verbal_Reasoning_Answers_3.pdf",
  questionTitle: "11+ Verbal Reasoning Practice Paper 3",
  answerTitle: "11+ Verbal Reasoning Practice Paper 3 — Answers",
  time: "25 minutes",
  questionInstructions: `${DISCLAIMER} Suggested time 25 minutes. Write letters in capitals. Choose the best option where choices are given.`,
  answerInstructions: "These answers belong with JDScience 11+ Verbal Reasoning Practice Paper 3. Check letter-by-letter on codes. Equivalent synonyms or antonyms are accepted where listed.",
  questions: [
    q("Section A — Word meanings. Which word is closest in meaning to scarce?\nA) plentiful   B) rare   C) heavy   D) sudden", "B) rare", "Scarce means in short supply.", { section: "Section A — Word meanings" }),
    q("Which word is closest in meaning to cautious?\nA) careless   B) noisy   C) careful   D) rapid", "C) careful", "Cautious means taking care to avoid risk."),
    q("In The path was obscure, obscure is closest to:\nA) well lit   B) unclear / hard to see   C) short   D) crowded", "B", "Obscure here means not clear or not easily seen."),
    q("Section B — Synonyms and antonyms. Find two words closest in meaning:  weary   eager   tired   sharp", "weary and tired", "Both mean worn out.", { section: "Section B — Synonyms and antonyms" }),
    q("Find two words closest in meaning:  ancient   modern   costly   old", "ancient and old", "Both mean from long ago."),
    q("Give an antonym of expand.", "shrink / contract / reduce / decrease", "Expand means grow larger."),
    q("Give an antonym of arrival.", "departure / leaving / exit", "Arrival is coming; the opposite is going away."),
    q("ALWAYS is to NEVER as ALL is to ?\nA) many   B) some   C) none   D) most", "C) none", "ALWAYS/NEVER are opposites; ALL/NONE are opposites."),
    q("Section C — Letter codes. If the code for WIND is XJOE, what is the code for CALM?", "DBMN", "Each letter moves one place forward.", { section: "Section C — Letter codes" }),
    q("If the code for GATE is FZSD, what is the code for OPEN?", "NODM", "Each letter moves one place back."),
    q("If BRICK is written as CSJDL, what is the code for STONE?", "TUPOF", "Each letter moves one place forward."),
    q("The letters of JUMP are each moved two places forward. What is the code?", "LWOR", "J→L, U→W, M→O, P→R."),
    q("Section D — Number codes. A=1, B=2, C=3 and so on. What is the value of MAP?", "30", "M=13, A=1, P=16. 13+1+16=30.", { section: "Section D — Number codes" }),
    q("Using A=1, B=2, C=3 and so on, what is the value of KEY?", "41", "K=11, E=5, Y=25. 11+5+25=41."),
    q("If C=3, A=1, T=20, what is the code number for CAT written as three two-digit parts joined? Write the three letter-values in order, separated by dashes.", "3-1-20", "C=3, A=1, T=20."),
    q("Letters are coded as their place in the alphabet. Which word has the total 24?\nA) BEE   B) ADD   C) CAT   D) DOG", "C) CAT", "C+A+T = 3+1+20=24. BEE=2+5+5=12; ADD=1+4+4=9; DOG=4+15+7=26."),
    q("Section E — Odd one out. Which word does not belong?  robin  sparrow  thrush  trout  wren", "trout", "Trout is a fish; the others are birds.", { section: "Section E — Odd one out" }),
    q("Which word does not belong?  kilogram  metre  litre  hour  centimetre", "hour", "Hour measures time; the others are common metric measures of mass, length or capacity."),
    q("Which word does not belong?  jumper  scarf  mitten  kettle  coat", "kettle", "Kettle is not an item of clothing."),
    q("Section F — Word pairs. Knife is to cut as pen is to ?\nA) ink   B) write   C) paper   D) desk", "B) write", "A knife is used to cut; a pen is used to write.", { section: "Section F — Word pairs" }),
    q("Nest is to bird as kennel is to ?\nA) cat   B) horse   C) dog   D) fish", "C) dog", "A nest houses a bird; a kennel houses a dog."),
    q("Author is to book as composer is to ?\nA) piano   B) song / music   C) stage   D) audience", "B) song / music", "An author produces a book; a composer produces music."),
    q("Section G — Compound words. Which pair makes a real compound word?\n1 light   2 house   3 mill   4 stone\nA) 1+2   B) 2+4   C) 3+1   D) 4+3", "A) 1+2", "light + house = lighthouse.", { section: "Section G — Compound words" }),
    q("Which pair makes a real compound word?\n1 rain   2 drop   3 desk   4 lamp\nA) 3+4   B) 1+2   C) 2+3   D) 1+4", "B) 1+2", "rain + drop = raindrop."),
    q("Insert a letter that finishes the first word and starts the second: CAR _ ATE", "D (CARD / DATE)", "D makes CARD and DATE."),
    q("Section H — Alphabet sequences. Find the next letter: E H K N ?", "Q", "Each letter moves three places on.", { section: "Section H — Alphabet sequences" }),
    q("Find the next letter: T R P N ?", "L", "Each letter moves two places back."),
    q("Find the next pair: AC  EG  IK  ?", "MO", "Each letter of the pair jumps three places: A→E→I→M and C→G→K→O."),
    q("Find the next letter: B E J Q ?", "Z", "Gaps grow: +3, +5, +7, then +9. Q + 9 letters = Z."),
    q("The alphabet is written backwards. Which letter is three before C in this reverse alphabet? (Z Y X …)", "F", "Reverse order: … F E D C B A. Three before C (towards Z) is F."),
  ],
};

const NVR_SPEC = {
  baseId: "nvr-3",
  folder: "non-verbal-reasoning",
  subject: "Non-Verbal Reasoning",
  skill_area: "Sequences, rotations, reflections, matrices and spatial nets",
  description: "Original JDScience Non-Verbal Reasoning Practice Paper 3 with code-drawn figures: sequences, rotations, reflections, matrices, odd one out, analogies, pattern completion and nets.",
  questionFile: "JDScience_11Plus_Non_Verbal_Reasoning_Practice_Paper_3.pdf",
  answerFile: "JDScience_11Plus_Non_Verbal_Reasoning_Answers_3.pdf",
  questionTitle: "11+ Non-Verbal Reasoning Practice Paper 3",
  answerTitle: "11+ Non-Verbal Reasoning Practice Paper 3 — Answers",
  time: "20 minutes",
  questionInstructions: `${DISCLAIMER} Suggested time 20 minutes. These figures were drawn for JDScience. Choose the option that best completes each set.`,
  answerInstructions: "These answers belong with JDScience 11+ Non-Verbal Reasoning Practice Paper 3. Match the letter of the option, not a sketch of the figure.",
  questions: [
    nvr("Section A — Sequences. Which figure comes next?", row([dots(2), dots(4), dots(6)], "Series:"), [dots(5), dots(8), bars(3), plus()], "B", "Dots increase by 2: 2, 4, 6, then 8.", { section: "Section A — Sequences" }),
    nvr("Which figure comes next?", row([chevron({ dir: "right" }), chevron({ dir: "down" }), chevron({ dir: "left" })], "Series:"), [chevron({ dir: "left" }), chevron({ dir: "up" }), chevron({ dir: "right" }), square()], "B", "The chevron turns 90° clockwise: right, down, left, then up."),
    nvr("Which figure comes next?", row([lShape({ rot: 0 }), lShape({ rot: 90 }), lShape({ rot: 180 })], "Series:"), [lShape({ rot: 180 }), lShape({ rot: 270 }), hexagon(), plus()], "B", "The L-shape turns 90° clockwise: 0°, 90°, 180°, then 270°."),
    nvr("Which figure comes next?", row([bars(4), bars(3), bars(2)], "Series:"), [bars(1), bars(4), circle(), diamond()], "A", "One bar is removed each time: 4, 3, 2, then 1."),
    nvr("Section B — Rotations. Which figure comes next?", row([plus({ rot: 0 }), plus({ rot: 45 }), plus({ rot: 90 })], "Series:"), [plus({ rot: 90 }), plus({ rot: 135 }), plus({ rot: 0 }), circle()], "B", "The plus rotates 45° each time: 0°, 45°, 90°, then 135°.", { section: "Section B — Rotations" }),
    nvr("Which figure comes next?", row([arrow({ dir: "up" }), arrow({ dir: "right" }), arrow({ dir: "down" })], "Series:"), [arrow({ dir: "left" }), arrow({ dir: "up" }), plus(), hexagon()], "A", "The arrow turns 90° clockwise: up, right, down, then left."),
    nvr("Section C — Reflections. Complete the analogy: triangle up is to triangle down as chevron up is to ?", `${row([triangle({ dir: "up" }), triangle({ dir: "down" })], "is to")}${row([chevron({ dir: "up" })], "as")}`, [chevron({ dir: "up" }), chevron({ dir: "down" }), triangle({ dir: "down" }), plus()], "B", "Each pair is a reflection in a horizontal line. An upward chevron becomes a downward chevron.", { section: "Section C — Reflections" }),
    nvr("Which figure comes next if each shape is a reflection of the last in a vertical line?", row([triangle({ dir: "right" }), triangle({ dir: "left" }), triangle({ dir: "right" })], "Series:"), [triangle({ dir: "right" }), triangle({ dir: "left" }), triangle({ dir: "up" }), square()], "B", "The triangle flips left-right each time. After right, left, right, the next is left."),
    nvr("Section D — Matrices. Complete the 2×2 matrix. The bottom-right cell is missing.", `${row([hexagon({ fill: "pale" }), hexagon({ fill: "solid" })], "Row 1:")}${row([circle({ fill: "pale" })], "Row 2:")}`, [circle({ fill: "pale" }), circle({ fill: "solid" }), hexagon({ fill: "solid" }), plus()], "B", "Each row keeps the outline; the right-hand cell is solid.", { section: "Section D — Matrices" }),
    nvr("Complete the 2×2 matrix.", `${row([square(), combo([square(), plus()])], "Row 1:")}${row([diamond()], "Row 2:")}`, [diamond(), combo([diamond(), plus()]), square(), plus()], "B", "The right-hand cell adds a plus to the left-hand shape."),
    nvr("Section E — Odd one out. Which figure is the odd one out?", row([square({ fill: "pale" }), square({ fill: "solid" }), hexagon({ fill: "solid" }), square({ fill: "none" })], "Set:"), [square({ fill: "pale" }), square({ fill: "solid" }), hexagon({ fill: "solid" }), square({ fill: "none" })], "C", "Three figures are squares. The hexagon is the odd one out.", { section: "Section E — Odd one out" }),
    nvr("Which figure is the odd one out?", row([dots(3), dots(3), dots(5), dots(3)], "Set:"), [dots(3), dots(3), dots(5), dots(3)], "C", "Three figures have three dots; one has five."),
    nvr("Section F — Analogies. Complete the analogy: empty square is to solid square as empty hexagon is to ?", `${row([square({ fill: "none" }), square({ fill: "solid" })], "is to")}${row([hexagon({ fill: "none" })], "as")}`, [hexagon({ fill: "none" }), hexagon({ fill: "solid" }), square({ fill: "solid" }), plus()], "B", "The outline stays the same and the fill becomes solid.", { section: "Section F — Analogies" }),
    nvr("Complete the analogy: circle with 1 dot is to circle with 2 dots as square with 1 dot is to ?", `${row([combo([circle({ r: 26 }), dots(1)]), combo([circle({ r: 26 }), dots(2)])], "is to")}${row([combo([square({ s: 44 }), dots(1)])], "as")}`, [combo([square({ s: 44 }), dots(1)]), combo([square({ s: 44 }), dots(2)]), combo([circle({ r: 26 }), dots(2)]), diamond()], "B", "One extra dot is added inside the same outline."),
    nvr("Section G — Pattern completion. Which figure comes next?", row([combo([diamond(), dots(1)]), combo([diamond(), dots(2)]), combo([diamond(), dots(3)])], "Series:"), [combo([diamond(), dots(2)]), combo([diamond(), dots(4)]), square(), plus()], "B", "The diamond gains one extra dot each time: 1, 2, 3, then 4.", { section: "Section G — Pattern completion" }),
    nvr("Which figure comes next?", row([ringDot({ rot: 0 }), ringDot({ rot: 90 }), ringDot({ rot: 180 })], "Series:"), [ringDot({ rot: 180 }), ringDot({ rot: 270 }), ringDot({ rot: 0 }), plus()], "B", "The inner dot moves 90° clockwise: top, right, bottom, then left."),
    nvr("Section H — Nets and spatial reasoning. Which net can fold to a cube? (A cross of six squares is a valid cube net; a 2-by-3 block is not.)", row([cubeNet({ variant: "cross" })], "Look at the options."), [cubeNet({ variant: "block" }), cubeNet({ variant: "cross" }), plus(), circle()], "B", "The cross of six squares folds to a cube. A 2-by-3 rectangle would overlap when folded.", { section: "Section H — Nets and spatial reasoning" }),
    nvr("Which of these is a valid cube net?", "", [cubeNet({ variant: "block" }), cubeNet({ variant: "corner" }), cubeNet({ variant: "zigzag" }), plus()], "C", "The zigzag of six squares is a valid cube net. A 2-by-3 block and a 3-by-3 corner of six squares overlap when folded."),
    nvr("The L-shape is rotated 90° clockwise. Which figure is the result?", row([lShape({ rot: 0 })], "Start:"), [lShape({ rot: 0 }), lShape({ rot: 90 }), hexagon(), dots(1)], "B", "A 90° clockwise turn of the L matches option B."),
    nvr("Which figure is the odd one out?", row([chevron({ dir: "up" }), chevron({ dir: "right" }), circle({ fill: "solid" }), chevron({ dir: "left" })], "Set:"), [chevron({ dir: "up" }), chevron({ dir: "right" }), circle({ fill: "solid" }), chevron({ dir: "left" })], "C", "Three figures are chevrons. The solid circle is the odd one out."),
  ],
};

const MIXED_SPEC = {
  baseId: "mixed-3",
  folder: "mixed-practice",
  subject: "Mixed Practice",
  skill_area: "Mixed 11+ practice",
  description: "Original JDScience Mixed Practice Paper 3: a balanced mix of Maths, English, Verbal Reasoning and Non-Verbal Reasoning.",
  questionFile: "JDScience_11Plus_Mixed_Practice_Paper_3.pdf",
  answerFile: "JDScience_11Plus_Mixed_Practice_Answers_3.pdf",
  questionTitle: "11+ Mixed Practice Paper 3",
  answerTitle: "11+ Mixed Practice Paper 3 — Answers",
  time: "40 minutes",
  questionInstructions: `${DISCLAIMER} Suggested time 40 minutes. Work through the four sections in order if you can. Show working in Maths. For NVR, choose the best figure.`,
  answerInstructions: "These answers belong with JDScience 11+ Mixed Practice Paper 3. Equivalent wording is accepted in English. For NVR, match the option letter.",
  questions: [
    q("Section A — Maths. Work out 29 × 6.", "174", "20 × 6 = 120 and 9 × 6 = 54. 120 + 54 = 174.", { section: "Section A — Maths" }),
    q("Find 2/3 of 27.", "18", "27 ÷ 3 = 9, then 9 × 2 = 18."),
    q("A bottle holds 1.2 litres. 350 ml is poured out. How many millilitres are left?", "850 ml", "1.2 l = 1200 ml. 1200 − 350 = 850 ml."),
    q("Simplify the ratio 16 : 24.", "2 : 3", "Divide both parts by 8."),
    q("The mean of 5, 7 and 12 is?", "8", "Sum = 24. 24 ÷ 3 = 8."),
    q("A square has perimeter 36 cm. What is its area?", "81 cm²", "One side is 36 ÷ 4 = 9 cm. Area = 9 × 9 = 81 cm²."),
    q("Section B — English. Choose the correctly punctuated sentence.\nA) The hatch wouldnt shut, its wood was damp.\nB) The hatch wouldn’t shut; its wood was damp.\nC) The hatch wouldn’t shut, it’s wood was damp.", "B", "Wouldn’t = would not. Its is possessive. A semicolon (or a full stop) joins two complete ideas.", { section: "Section B — English" }),
    q("Give a synonym of notice (as a verb, meaning to observe).", "see / spot / observe / detect", "In the passage sense, notice means to observe."),
    q("Rewrite in the future tense: Ama checks the vane at three o’clock.", "Ama will check the vane at three o’clock. (Accept Ama is going to check…)", "Add will (or going to) and the base verb check."),
    q("Which word is a preposition?  canal  beside  pale  write", "beside", "Beside shows position."),
    q("Choose the correct spelling: neccessary / necessary / necesary", "necessary", "One c, two s: necessary."),
    q("Improve the sentence: The sky was nice and the roof was nice.", "Accept any precise rewrite, e.g. The sky was pale and the roof was quiet / wide / still.", "Replace nice with specific adjectives."),
    q("Section C — Verbal Reasoning. Find the next letter: F J N R ?", "V", "Each letter moves four places on.", { section: "Section C — Verbal Reasoning" }),
    q("Which word does not belong?  flute  harp  novel  drum  cello", "novel", "Novel is a book; the others are instruments."),
    q("If the code for HOPE is IPQF, what is the code for REST?", "SFTU", "Each letter moves one place forward."),
    q("A=1, B=2, C=3 and so on. What is the value of SUN?", "54", "S=19, U=21, N=14. 19+21+14=54."),
    q("Hand is to glove as head is to ?\nA) hat   B) hair   C) neck   D) eye", "A) hat", "A glove covers a hand; a hat covers a head."),
    q("Which pair makes a real compound word?\n1 foot   2 ball   3 desk   4 lamp\nA) 3+4   B) 1+2   C) 2+3   D) 1+4", "B) 1+2", "foot + ball = football."),
    nvr("Section D — Non-Verbal Reasoning. Which figure comes next?", row([dots(1), dots(2), dots(4)], "Series:"), [dots(3), dots(8), bars(2), plus()], "B", "The number of dots doubles: 1, 2, 4, then 8.", { section: "Section D — Non-Verbal Reasoning" }),
    nvr("Which figure is the odd one out?", row([hexagon({ fill: "pale" }), hexagon({ fill: "solid" }), plus(), hexagon({ fill: "none" })], "Set:"), [hexagon({ fill: "pale" }), hexagon({ fill: "solid" }), plus(), hexagon({ fill: "none" })], "C", "Three figures are hexagons. The plus is the odd one out."),
    nvr("Which figure comes next?", row([chevron({ dir: "up" }), chevron({ dir: "right" }), chevron({ dir: "down" })], "Series:"), [chevron({ dir: "left" }), chevron({ dir: "up" }), square(), circle()], "A", "The chevron turns 90° clockwise: up, right, down, then left."),
    nvr("Complete the analogy: empty circle is to solid circle as empty square is to ?", `${row([circle({ fill: "none" }), circle({ fill: "solid" })], "is to")}${row([square({ fill: "none" })], "as")}`, [square({ fill: "none" }), square({ fill: "solid" }), circle({ fill: "solid" }), plus()], "B", "The outline stays the same and the fill becomes solid."),
    nvr("Which net can fold to a cube?", "", [cubeNet({ variant: "block" }), cubeNet({ variant: "cross" }), plus(), dots(2)], "B", "The cross of six squares is a valid cube net. A 2-by-3 block is not."),
    nvr("Which figure comes next?", row([lShape({ rot: 0 }), lShape({ rot: 90 }), lShape({ rot: 180 })], "Series:"), [lShape({ rot: 90 }), lShape({ rot: 270 }), hexagon(), bars(1)], "B", "The L turns 90° clockwise, so the next rotation is 270°."),
  ],
};

export const SERIES2_PAPERS = [
  ...pair(MATHS_SPEC),
  ...pair(ENGLISH_SPEC),
  ...pair(VR_SPEC),
  ...pair(NVR_SPEC),
  ...pair(MIXED_SPEC),
];
