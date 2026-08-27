import {
  arrow,
  bars,
  circle,
  diamond,
  dots,
  plus,
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

export const MIXED_PAPERS = [
  {
    id: "mixed-1",
    file: "JDScience_11Plus_Mixed_Practice_Paper_1.pdf",
    folder: "mixed-practice",
    title: "11+ Mixed Practice Paper 1",
    subject: "Mixed Practice",
    skill_area: "Mixed 11+ practice",
    description: "An original JDScience mini mock mixing Maths, English, Verbal Reasoning and Non-Verbal Reasoning.",
    time: "45 minutes",
    instructions: "This paper mixes four 11+ skills. Work through the sections in order if you can. Show working in Maths. For NVR, choose the best figure. Original JDScience questions only.",
    questions: [
      q("Section A — Maths. Work out 36 × 9.", "324", "30 × 9 = 270 and 6 × 9 = 54. 270 + 54 = 324.", { section: "Section A — Maths" }),
      q("A ribbon is 2.4 m long. 85 cm is cut off. How much ribbon is left, in centimetres?", "155 cm", "2.4 m = 240 cm. 240 − 85 = 155 cm."),
      q("Find 3/5 of 45.", "27", "45 ÷ 5 = 9, then 9 × 3 = 27."),
      q("The perimeter of a regular pentagon is 40 cm. What is the length of one side?", "8 cm", "40 ÷ 5 = 8 cm."),
      q("A book costs £7.50. In a sale it is reduced by 20%. What is the sale price?", "£6.00", "20% of 7.50 = 1.50. 7.50 − 1.50 = 6.00."),
      q("The mean of 6, 10 and 14 is?", "10", "Sum = 30. 30 ÷ 3 = 10."),
      q("A clock shows 16:10. What time is this on a 12-hour clock?", "4:10 pm", "16:00 is 4 pm, so 16:10 is 4:10 pm."),
      q("Round 3.481 to 2 decimal places.", "3.48", "The third decimal digit is 1, so 3.48 stays 3.48."),
      q("Section B — English. Choose the correctly punctuated sentence.\nA) Its a long walk to Riverwell.\nB) It’s a long walk to Riverwell.\nC) Its’ a long walk to Riverwell.", "B", "It’s = it is. Its is possessive. Its’ is never correct.", { section: "Section B — English" }),
      q("Give a synonym of brave.", "courageous / bold / fearless (any sensible)", "Brave means showing courage."),
      q("Rewrite in the past tense: The ferry crosses the harbour.", "The ferry crossed the harbour.", "Crosses → crossed."),
      q("Which word is an adverb?  sudden  quickly  harbour  rusty", "quickly", "Quickly describes how something is done."),
      q("Choose the correct homophone: The pupils took (there / their / they’re) places.", "their", "Their shows that the places belong to the pupils."),
      q("Add a comma and an apostrophe: After lunch Nias bag was missing.", "After lunch, Nia’s bag was missing.", "Comma after the opening phrase; Nia’s is singular possessive."),
      q("Section C — Verbal Reasoning. Find the next letter: D G J M ?", "P", "Each letter moves three places on.", { section: "Section C — Verbal Reasoning" }),
      q("Which word does not belong?  oak  ash  pine  rose  beech", "rose", "Rose is a flowering plant, not a tree in this woodland list."),
      q("If the code for FISH is GJTI, what is the code for BIRD?", "CJSE", "Each letter moves one place forward."),
      q("Find the next number: 4, 9, 16, 25, ?", "36", "Square numbers: 2², 3², 4², 5², then 6² = 36."),
      q("Hand is to glove as foot is to ?\nA) sock   B) shoe   C) both A and B are possible   D) toe", "C", "A glove covers a hand; a sock or a shoe can cover a foot."),
      q("A four-letter word is hidden in: PLEASECOMEHERE\nWhich word is hidden?\nA) come   B) here   C) both A and B   D) leap", "C", "COME and HERE both appear as consecutive letters."),
      q("If A=1, B=2, C=3 and so on, what is the value of PEN?", "35", "P=16, E=5, N=14. 16+5+14=35."),
      q("Give an antonym of noisy.", "quiet / silent / peaceful", "Noisy means making a lot of sound."),
      nvr("Section D — Non-Verbal Reasoning. Which figure comes next?", row([dots(1), dots(3), dots(5)], "Series:"), [dots(4), dots(7), circle(), plus()], "B", "Dots increase by 2: 1, 3, 5, then 7.", { section: "Section D — Non-Verbal Reasoning" }),
      nvr("Which figure is the odd one out?", row([square({ fill: "solid" }), circle({ fill: "solid" }), triangle({ fill: "solid" }), bars(2)], "Set:"), [square({ fill: "solid" }), circle({ fill: "solid" }), triangle({ fill: "solid" }), bars(2)], "D", "Three figures are solid geometric outlines. The two bars are different."),
      nvr("Which figure comes next?", row([arrow({ dir: "down" }), arrow({ dir: "left" }), arrow({ dir: "up" })], "Series:"), [arrow({ dir: "right" }), arrow({ dir: "down" }), plus(), square()], "A", "The arrow turns 90° clockwise: down, left, up, then right."),
      nvr("Complete the analogy: small circle is to large circle as small square is to ?", `${row([circle({ r: 12 }), circle({ r: 26 })], "is to")}${row([square({ s: 20 })], "as")}`, [square({ s: 20 }), square({ s: 46 }), circle({ r: 26 }), plus()], "B", "The second figure is a larger version of the first."),
      nvr("Which figure comes next?", row([bars(1), bars(2), bars(3)], "Series:"), [bars(2), bars(4), circle(), diamond()], "B", "One extra bar each time: next is 4."),
      nvr("Which figure is the odd one out?", row([plus(), plus({ rot: 45 }), circle(), plus({ rot: 90 })], "Set:"), [plus(), plus({ rot: 45 }), circle(), plus({ rot: 90 })], "C", "Three figures are plus signs. The circle is the odd one out."),
    ],
  },
  {
    id: "mixed-2",
    file: "JDScience_11Plus_Mixed_Practice_Paper_2.pdf",
    folder: "mixed-practice",
    title: "11+ Mixed Practice Paper 2",
    subject: "Mixed Practice",
    skill_area: "Mixed 11+ practice",
    description: "A second original JDScience mini mock with a fresh mix of Maths, English, VR and NVR.",
    time: "45 minutes",
    instructions: "A second mixed paper with new questions. Do not copy answers from Mixed Practice Paper 1. Show working and check units.",
    questions: [
      q("Section A — Maths. Work out 504 ÷ 8.", "63", "8 × 63 = 504.", { section: "Section A — Maths" }),
      q("A tank holds 12 litres. It is 1/3 full. How many millilitres are in the tank?", "4000 ml", "1/3 of 12 l = 4 l = 4000 ml."),
      q("Find 17% of 200.", "34", "10% = 20, 5% = 10, 2% = 4. 20 + 10 + 4 = 34."),
      q("A square has perimeter 28 cm. What is its area?", "49 cm²", "Side = 28 ÷ 4 = 7 cm. Area = 7 × 7 = 49."),
      q("The ratio of boys to girls in a choir is 2:3. There are 12 boys. How many girls?", "18", "1 part = 6. Girls 3 × 6 = 18."),
      q("The range of 3, 11, 7, 3, 9 is?", "8", "Largest 11 minus smallest 3 is 8."),
      q("How many minutes are there from 09:48 to 11:07?", "79 minutes", "09:48 to 10:48 is 60 minutes, then 19 more to 11:07."),
      q("Write 0.125 as a fraction in its simplest form.", "1/8", "0.125 = 125/1000 = 1/8."),
      q("Section B — English. Correct the sentence: The pair of scissors are on the desk.", "The pair of scissors is on the desk.", "Pair is singular, so the verb is is.", { section: "Section B — English" }),
      q("Give an antonym of ancient.", "modern / new / recent", "Ancient means very old."),
      q("Identify the subordinate clause: Because the fog was thick, the ferry was delayed.", "Because the fog was thick", "The because-clause cannot stand alone."),
      q("Choose the correct spelling: occured / occurred / ocurred", "occurred", "Two c’s and two r’s: occurred."),
      q("Rewrite as a question: The lantern needs oil.", "Does the lantern need oil?", "Add an auxiliary and a question mark."),
      q("Add speech marks and a comma: Grandad said listen to the clock.", "Grandad said, “Listen to the clock.”", "Capital L inside speech; comma before the spoken words."),
      q("Section C — Verbal Reasoning. Find the next letter: Z W T Q ?", "N", "Subtract 3 each time.", { section: "Section C — Verbal Reasoning" }),
      q("Which word does not belong?  knife  fork  spoon  plate  ladle", "plate", "Plate is crockery; the others are handled utensils."),
      q("If the code for WIND is XJOE, what is the code for EAST?", "FBTU", "Each letter moves one place forward."),
      q("Find the next number: 2, 3, 5, 8, 12, ?", "17", "Differences: +1, +2, +3, +4, then +5. 12 + 5 = 17."),
      q("Bee is to hive as bird is to ?\nA) sky   B) nest   C) wing   D) tree", "B) nest", "A hive is a bee’s home; a nest is a bird’s home."),
      q("Move one letter from the first word to the second: STONE    RIP", "TONE and RIPS", "Move S from STONE to RIP."),
      q("If A=1, B=2, C=3 and so on, what is the value of BAG?", "10", "B=2, A=1, G=7. 2+1+7=10."),
      q("Find two synonyms:  calm   noisy   peaceful   sharp", "calm and peaceful", "Both mean quiet and settled."),
      nvr("Section D — Non-Verbal Reasoning. Which figure comes next?", row([circle({ r: 12 }), circle({ r: 18 }), circle({ r: 24 })], "Series:"), [circle({ r: 18 }), circle({ r: 30 }), square(), plus()], "B", "The circle grows larger each time.", { section: "Section D — Non-Verbal Reasoning" }),
      nvr("Which figure is the odd one out?", row([triangle({ dir: "up" }), triangle({ dir: "down" }), triangle({ dir: "left" }), square()], "Set:"), [triangle({ dir: "up" }), triangle({ dir: "down" }), triangle({ dir: "left" }), square()], "D", "Three figures are triangles. The square is the odd one out."),
      nvr("Which figure comes next?", row([plus({ rot: 0 }), plus({ rot: 45 }), plus({ rot: 90 })], "Series:"), [plus({ rot: 90 }), plus({ rot: 135 }), circle(), bars(1)], "B", "The plus rotates 45° each time, so next is 135°."),
      nvr("Complete the analogy: empty circle is to solid circle as empty square is to ?", `${row([circle(), circle({ fill: "solid" })], "is to")}${row([square()], "as")}`, [square(), square({ fill: "solid" }), circle({ fill: "solid" }), diamond()], "B", "The outline stays the same and the fill becomes solid."),
      nvr("Which figure comes next?", row([dots(4), dots(3), dots(2)], "Series:"), [dots(4), dots(1), bars(3), triangle()], "B", "One dot is removed each time: next is 1."),
      nvr("Which figure is the odd one out?", row([bars(1), bars(1), bars(1), bars(3)], "Set:"), [bars(1), bars(1), bars(3), bars(1)], "C", "Three figures have one bar; one has three."),
    ],
  },
];

export const PARENT_GUIDE = {
  id: "parent-guide",
  file: "JDScience_11Plus_Parent_Guide.pdf",
  folder: "mixed-practice",
  kind: "guide",
  title: "11+ Parent Guide",
  subject: "Parent Guide",
  skill_area: "How to use JDScience 11+ papers",
  description: "A short original JDScience guide for families: what the 11+ covers, how to use these papers, timing, marking and wellbeing.",
  time: "15–20 minute read",
  instructions: "This guide is for parents, carers and tutors. It is original JDScience advice. It does not reproduce any exam board’s copyrighted materials. Use it alongside the free practice PDFs in this 11+ library.",
  sections: [
    {
      heading: "1. What the 11+ is",
      body: "The 11+ is a set of entrance tests used by many grammar schools and some independent schools in England, usually taken in Year 6. Papers commonly cover English, Maths, Verbal Reasoning (VR) and Non-Verbal Reasoning (NVR). Exact mix, timing and question style vary by area and by school. Always check the school or local consortium website for the current test provider and dates.",
    },
    {
      heading: "2. Different styles you may hear about",
      html: `<p>Families often hear names such as GL Assessment, CEM, CSSE (Essex) and independent-school papers. Those organisations own their own questions. JDScience does <strong>not</strong> host or retype those PDFs.</p>
      <ul>
        <li><strong>GL-style practice</strong> often uses separately timed papers in English, Maths, VR and NVR, with a mix of multiple-choice and standard-format questions.</li>
        <li><strong>CEM-style familiarisation</strong> is typically mixed, time-pressured and vocabulary-heavy. Our mixed papers give a gentle version of switching skills in one sitting.</li>
        <li><strong>Independent schools</strong> write their own papers. Comprehension, creative writing and problem-solving maths are common.</li>
      </ul>
      <p>Use JDScience papers to build skill, speed and confidence — then use any official familiarisation booklet the school sends you.</p>`,
    },
    {
      heading: "3. What is in this JDScience library",
      html: `<ul>
        <li><strong>Maths:</strong> arithmetic, word problems, fractions/decimals/percentages, geometry and measures, data handling.</li>
        <li><strong>English:</strong> an original comprehension, grammar and punctuation, vocabulary and spelling, creative writing prompts.</li>
        <li><strong>Verbal Reasoning:</strong> two original papers (codes, sequences, analogies, hidden words, odd one out).</li>
        <li><strong>Non-Verbal Reasoning:</strong> two original figure papers (series, odd one out, analogies, 2×2 matrices).</li>
        <li><strong>Mixed practice:</strong> two shorter mocks that switch between skills.</li>
      </ul>
      <p>Every question, passage and diagram is newly written for JDScience. Third-party free samples were used only as a check on level and topic coverage — never copied.</p>`,
    },
    {
      heading: "4. How to use the papers",
      html: `<ol>
        <li>Start with one topic paper (for example Arithmetic) untimed, so your child can show working.</li>
        <li>Mark together using the answer section. Read the short “Why” notes, not only the final number.</li>
        <li>Keep a small error log: one line per mistake (for example “forgot units” or “read half-ebb as a time”).</li>
        <li>Repeat a similar paper a week later, this time with the suggested time.</li>
        <li>Use a mixed paper once a fortnight as a mini mock, not every evening.</li>
      </ol>
      <p>Little and often beats a three-hour Saturday grind. Two or three sessions of 20–30 minutes a week is plenty for most Year 5 pupils.</p>`,
    },
    {
      heading: "5. Suggested timings",
      html: `<ul>
        <li>Maths topic papers: about 25–30 minutes.</li>
        <li>English comprehension: about 30 minutes (including reading).</li>
        <li>Grammar / vocabulary: about 20 minutes.</li>
        <li>Creative writing: 5 minutes plan, 30–35 minutes write, 5 minutes check.</li>
        <li>VR or NVR practice: about 20–25 minutes.</li>
        <li>Mixed papers: about 45 minutes.</li>
      </ul>
      <p>If your child finishes very early, they should check. If they are still on the first half when time is up, stop, mark what they did, and practise that skill untimed before trying a clock again.</p>`,
    },
    {
      heading: "6. Marking without tears",
      html: `<p>Sit on the same side of the table. Ask “talk me through this one” before saying “wrong”. Award the mark if the method is right and a slip is tiny — then still correct the slip. Celebrate a better explanation, not only a higher score.</p>
      <p>A useful family phrase: “What would you try differently next time?” Write one action, not ten.</p>`,
    },
    {
      heading: "7. Wellbeing and balance",
      html: `<p>Sleep, reading for pleasure, sport and unstructured play all support 11+ performance. Avoid ranking your child against classmates. Scores on these papers are for learning, not for predicting a school place.</p>
      <p>If practice causes tears, stop for that day. Go back to a paper they can succeed on. JDScience tutoring can help if you want a calm adult outside the family to take the pressure.</p>`,
    },
    {
      heading: "8. When to add extra support",
      html: `<p>Consider a tutor if your child is stuck on the same skill after several tries, if English is an additional language and vocabulary is the main barrier, or if you want structured mocks closer to the test date. Book through <a href="https://www.jdscience.co.uk">www.jdscience.co.uk</a> or email info@jdscience.co.uk.</p>
      <p>These PDFs are free to download from the JDScience resources library. No account is required. They may be printed for personal study and tutoring. Please do not upload them to other commercial sites as if they were your own.</p>`,
    },
  ],
};
