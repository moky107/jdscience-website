function q(stem, answer, explanation, extra = {}) {
  return { stem, answer, explanation, marks: extra.marks || 1, ...extra };
}

const CLOCKWORK_BAY = `On the last Saturday in March, Nia walked the harbour wall at Clockwork Bay with a paper bag of warm currant buns. The tide was sliding out, leaving a dark shine on the stones, and the gulls argued over nothing in particular.

Grandad waited by the old tide clock, a tall iron case with a cracked glass face. The clock did not tell ordinary time. Its single hand was meant to show whether the water was rising or falling, so fishermen could judge the harbour mouth. For three winters it had stuck at “half-ebb”, which was no use to anyone.

“Today we listen,” Grandad said, tapping the case. “Clocks are shy when they have been ignored.”

Nia thought clocks were metal and glass, not shy, but she kept that to herself. She held the torch while he loosened screws that had gone orange with rust. Inside, a brass wheel sat as still as a held breath. A thread of seaweed had wound through the teeth, dry as string.

They worked slowly. Nia named each tool as Grandad asked for it, proud that she remembered the difference between the two smallest screwdrivers. When the seaweed came free, Grandad oiled the wheel and they waited. Nothing moved.

A boy from the chandlery paused with a crate of rope. “That clock’s only good for gulls to sit on,” he said, not unkindly.

Nia felt heat in her cheeks. She looked at the harbour, then at the little weight on a chain that Grandad had not yet hung. “We haven’t finished,” she said.

They hung the weight. Grandad wound the mechanism twice, carefully, as if the clock might take offence. For a moment there was only the slap of water against the wall. Then, inside the iron case, something ticked. It was not loud. It was more like a polite cough. The hand shivered, then crept from half-ebb toward low water.

Nia did not cheer. She watched the hand take its first honest step in years, and she thought of all the quiet jobs that keep a place working: oil, patience, the right screwdriver, and someone willing to stand in a cold wind with currant buns going stale in a paper bag.

Grandad closed the glass. “Tomorrow it will still need us,” he said. “Things worth keeping usually do.”

They sat on the wall and split the last bun. Below them the harbour mouth widened, brown and bright, and the tide clock, at last, agreed.`;

export const ENGLISH_PAPERS = [
  {
    id: "english-comprehension",
    file: "JDScience_11Plus_English_Comprehension_Practice.pdf",
    folder: "english",
    title: "11+ English: Comprehension Practice",
    subject: "English",
    skill_area: "Reading comprehension",
    description: "An original JDScience fiction extract with retrieval, inference, vocabulary and language questions.",
    time: "30 minutes",
    instructions: "Read the passage carefully, then answer the questions in full sentences unless a single word is enough. Use evidence from the text when you are asked to explain.",
    questions: [
      {
        section: "The passage",
        kind: "passage",
        stem: "Read the passage, then answer questions 1 to 12.",
        passage: CLOCKWORK_BAY,
        answer: "—",
        explanation: "This page is the reading extract. Marks begin at question 1.",
        marks: 0,
      },
      q("Where does Nia walk at the beginning of the passage?", "Along the harbour wall at Clockwork Bay.", "The opening sentence places her on the harbour wall at Clockwork Bay."),
      q("What is unusual about the tide clock compared with an ordinary clock?", "It does not tell ordinary time; its hand shows whether the tide is rising or falling.", "The narrator explains that the single hand is meant to show rising or falling water."),
      q("For how long has the clock been stuck, and at what setting?", "For three winters, at half-ebb.", "The text says it had stuck at “half-ebb” for three winters."),
      q("Find and copy a simile used to describe the brass wheel.", "as still as a held breath", "The wheel “sat as still as a held breath”."),
      q("What two things have stopped the clock from working properly? Use evidence.", "Rusted screws and seaweed wound through the teeth of the brass wheel.", "Screws had gone orange with rust, and seaweed was wound through the teeth."),
      q("How does Nia feel when the boy from the chandlery speaks, and how do you know?", "Embarrassed or stung — she feels heat in her cheeks.", "“Nia felt heat in her cheeks” shows embarrassment after his comment."),
      q("What does Nia’s reply “We haven’t finished” suggest about her character?", "She is determined / not easily put off / proud of the work still to do.", "She answers the boy by pointing out the job is incomplete, showing grit rather than giving up."),
      q("“It was more like a polite cough.” What does this suggest about the first tick?", "It was quiet, small and almost hesitant, not a loud dramatic sound.", "A polite cough is restrained; the clock starts modestly."),
      q("Look at the paragraph beginning “Nia did not cheer.” What is the main idea of this paragraph?", "That useful work is often quiet and patient, not showy.", "She thinks of oil, patience, the right tool and standing in the cold — everyday effort that keeps a place working."),
      q("What does Grandad mean by “Tomorrow it will still need us”?", "The clock (or anything worth keeping) will need ongoing care, not a one-off fix.", "He says things worth keeping usually still need people."),
      q("Give two ways the writer makes the setting feel real and specific.", "Named place Clockwork Bay; sensory details such as currant buns, rust, slap of water, gulls, harbour mouth.", "Precise names and senses (smell/taste of buns, orange rust, sound of water) build a real harbour."),
      q("Do you think the ending is hopeful? Explain using two pieces of evidence.", "Yes: the hand takes an “honest step” and “the tide clock, at last, agreed.” (Accept a thoughtful no if well evidenced.)", "The mechanism moves and the clock matches the tide; Grandad’s warning adds realism but the last image is agreement."),
    ],
  },
  {
    id: "english-grammar",
    file: "JDScience_11Plus_English_Grammar_Punctuation.pdf",
    folder: "english",
    title: "11+ English: Grammar and Punctuation",
    subject: "English",
    skill_area: "Grammar and punctuation",
    description: "Original JDScience questions on apostrophes, commas, clauses, tenses, sentence types and homophones.",
    time: "20 minutes",
    instructions: "Choose the correct option or rewrite the sentence as asked. Write clearly. There is one mark for each question unless shown otherwise.",
    questions: [
      q("Rewrite the sentence with the missing apostrophe: The girls coats were hung by the door.", "The girls’ coats were hung by the door.", "More than one girl, so the possessive apostrophe goes after the s."),
      q("Which sentence is punctuated correctly?\nA) Lets go to Riverwell, its not far.\nB) Let’s go to Riverwell, it’s not far.\nC) Lets go to Riverwell, it’s not far.\nD) Let’s go to Riverwell, its not far.", "B", "Let’s = let us; it’s = it is. Both apostrophes are needed."),
      q("Add commas to this sentence: After the assembly Nia packed her bag her lunch and her recorder.", "After the assembly, Nia packed her bag, her lunch and her recorder.", "A comma after the opening clause, and commas in the list (Oxford comma optional before and)."),
      q("Identify the verb in this sentence: The tide clock shivered, then crept toward low water.", "shivered / crept (both verbs)", "Shivered and crept are the action words. Accept either or both."),
      q("Change this sentence into the past tense: The gulls argue over the wall.", "The gulls argued over the wall.", "Argue → argued."),
      q("Underline the subordinate clause: Although the wind was cold, they sat on the harbour wall.", "Although the wind was cold", "The clause beginning with Although cannot stand alone."),
      q("Which word is an adverb?  quiet  slowly  rusty  harbour", "slowly", "Slowly describes how an action is done."),
      q("Rewrite as a question: The bus stops at Oakmead.", "Does the bus stop at Oakmead? / The bus stops at Oakmead?", "Invert or add an auxiliary. Accept any correctly punctuated question with the same meaning."),
      q("Choose the correct homophone: The class walked quietly to (there / their / they’re) seats.", "their", "Their shows possession — the seats belong to the class."),
      q("Correct the sentence: Me and Sam is going to the library.", "Sam and I are going to the library.", "Use I (subject) and plural verb are. Putting the other person first is polite."),
      q("What type of sentence is this?  Please pass the torch.", "Imperative", "It gives an instruction or request."),
      q("Add a relative pronoun: The boy ____ carried the rope paused by the clock.", "who (or that)", "Who refers to the boy. That is also acceptable in this defining clause."),
      q("Place the colon correctly: She packed three tools a screwdriver an oil can and a cloth.", "She packed three tools: a screwdriver, an oil can and a cloth.", "A colon introduces the list; commas separate items."),
      q("Identify the subject of the sentence: Grandad oiled the brass wheel.", "Grandad", "Grandad is who performs the action."),
      q("Rewrite in direct speech, punctuated correctly: Nia said they had not finished.", "Nia said, “We haven’t finished.” (or similar)", "Invert into spoken words inside speech marks, with a capital and end punctuation inside the marks."),
      q("Choose the correct verb: Neither of the maps (is / are) complete.", "is", "Neither is singular, so the verb is is."),
      q("What is the function of the commas in: My cousin, a keen sailor, lives in Whitlock.", "They mark a parenthesis / extra information about the cousin.", "The phrase “a keen sailor” is extra information set off by commas."),
      q("Correct the comma splice: The hand moved, the clock agreed with the tide.", "The hand moved, and the clock agreed with the tide. / The hand moved; the clock agreed with the tide. / The hand moved. The clock agreed with the tide.", "A comma alone cannot join two full sentences; add a conjunction, a semicolon, or make two sentences."),
      q("Form an adjective from the noun patience.", "patient", "The related adjective is patient."),
      q("Which prefix turns possible into its opposite?", "im-  (impossible)", "The prefix im- is used before p: impossible."),
    ],
  },
  {
    id: "english-vocab",
    file: "JDScience_11Plus_English_Vocabulary_and_Spelling.pdf",
    folder: "english",
    title: "11+ English: Vocabulary and Spelling",
    subject: "English",
    skill_area: "Vocabulary and spelling",
    description: "Original JDScience synonyms, antonyms, word meanings, prefixes, suffixes and common 11+ spellings.",
    time: "20 minutes",
    instructions: "Write the word asked for. Spelling must be correct to score the mark. Use English spelling (for example colour, not color).",
    questions: [
      q("Give a synonym of ancient.", "old / aged / antique / historic (any sensible)", "Ancient means very old."),
      q("Give an antonym of scarce.", "plentiful / abundant / common", "Scarce means in short supply, so the opposite is plentiful."),
      q("What does hesitant mean in: She gave a hesitant smile?", "Uncertain / pausing / not confident", "Hesitant suggests delay or lack of confidence."),
      q("Choose the correct spelling: recieve / receive / receve", "receive", "i before e except after c: receive."),
      q("Choose the correct spelling: definately / definitely / definetly", "definitely", "The word contains finite: definitely."),
      q("Write the plural of library.", "libraries", "y after a consonant becomes ies."),
      q("Write the plural of torch.", "torches", "Words ending in ch usually add es."),
      q("Add a prefix to lock to mean unlock in advance, or open again. Give two different words.", "unlock and relock (accept unlock / relock / lock’s unlock sense)", "un- reverses; re- means again. Accept unlock and relock."),
      q("What does the suffix -less do in the word useless?", "It means without (without use).", "-less means without."),
      q("Which word is closest in meaning to restore?  damage  repair  ignore  hide", "repair", "Restore means bring back to a former condition."),
      q("Which word does not belong?  stroll  march  wander  saunter  remain", "remain", "The others are ways of walking; remain means stay."),
      q("Complete the word: The fisherman used a pair of binocul___ to watch the harbour mouth.", "binoculars", "binoculars — spelling of the whole word."),
      q("Correct the spelling mistake: The assembly was neccessary.", "necessary", "One c, two s: necessary."),
      q("Correct the spelling mistake: She wrote a seperate list.", "separate", "There is a rat in separate."),
      q("Give two homophones of the word wait (words that sound the same but are spelled differently).", "weight (accept wate only if marked wrong — weight is the standard homophone)", "Wait and weight. (If the pupil gives weight, that is the expected pair.)"),
      q("What does fragile mean?", "Easily broken or damaged", "Fragile means delicate / breakable."),
      q("Use the word current correctly in a sentence about water, not about time.", "Any sentence where current means flow of water, e.g. The current pulled the dinghy sideways.", "Here current is a noun meaning a flow of water, not “happening now”."),
      q("Which prefix means against?  pre-  anti-  sub-  over-", "anti-", "Anti- means against, as in antifreeze, antibiotic."),
      q("Spell the missing word: They waited in the q_____ for the ferry.", "queue", "queue — unusual spelling with ueue."),
      q("Give a more precise verb than went for walking slowly because you are tired.", "trudged / plodded / shuffled (any precise verb)", "A precise verb shows manner: trudged suggests tired effort."),
      q("What is the root word in unhelpful?", "help", "Prefix un-, root help, suffix -ful."),
      q("Choose the correctly spelled word: accomodation / accommodation / acommodation", "accommodation", "Two c’s and two m’s: accommodation."),
    ],
  },
  {
    id: "english-writing",
    file: "JDScience_11Plus_English_Creative_Writing_Prompts.pdf",
    folder: "english",
    title: "11+ English: Creative Writing Prompts",
    subject: "English",
    skill_area: "Creative writing",
    description: "Original JDScience story and description prompts with planning frames, success criteria and sample openings.",
    time: "45 minutes for one full task",
    instructions: "Choose ONE main task. Plan for 5 minutes, write for about 30–35 minutes, and check for 5 minutes. Aim for a complete piece with a beginning, middle and end. Answers in this paper are planning notes and a sample opening — not a single “right” story.",
    questions: [
      {
        section: "Task A — Story",
        stem: "Write a story with the title The Last Bus. You should write about a character who must catch a bus that almost never comes. Include a problem and a clear ending. (Do not copy the sample opening in the answers.)",
        answer: "No single correct story. Credit: clear title link; character and setting; a problem; sequenced events; an ending; accurate sentences.",
        explanation: "Plan: who is waiting, why the bus matters, what goes wrong, how it ends. Sample opening: “The shelter clock had already given up when Yasmin counted the coins in her glove. The last bus to Hartloe was listed as 21:12. It was 21:19, and the road was a black ribbon with no headlights on it.”",
        marks: 20,
        lines: 2,
      },
      {
        section: "Task B — Description",
        stem: "Describe a greenhouse at midnight. Do not tell a full adventure story. Focus on atmosphere: what is seen, heard, smelled and felt. Include at least two original similes or metaphors.",
        answer: "No single correct description. Credit: midnight greenhouse atmosphere; senses; imagery; controlled vocabulary; paragraphing.",
        explanation: "Plan by sense, not plot. Sample opening: “Moonlight lay on the glass like cold milk. Inside, tomato vines hung in green ropes, and the heater ticked as if a small animal were trapped in the pipes.”",
        marks: 20,
        lines: 2,
      },
      {
        section: "Task C — Continuation",
        stem: "Continue this opening in your own words (do not copy more than these two sentences):\n\n“The envelope had no stamp. On the front, in sharp pencil, was only her name and the words OPEN ON YOUR BIRTHDAY.”\n\nWrite what happens next. Include the character’s thoughts and a decision.",
        answer: "No single correct continuation. Credit: logical follow-on; thoughts and a decision; rising interest; complete ending.",
        explanation: "Possible path: she waits / opens early; the letter is from a future self or a relative; a choice about whether to tell anyone. Keep the tone consistent with mystery, not slapstick.",
        marks: 20,
        lines: 2,
      },
      {
        section: "Planning frame (use for any task)",
        stem: "Before you write, jot: 1) character, 2) setting, 3) problem, 4) turning point, 5) ending, 6) three precise words you will try to use.",
        answer: "Planning notes will vary. A strong plan names a person, a place, a problem, a change, and an ending, plus three ambitious words (for example: reluctant, sodium-yellow, unlatched).",
        explanation: "Eleven-plus writing is marked for structure as well as spark. A five-box plan prevents a story that fizzles out.",
        marks: 0,
        lines: 6,
      },
      {
        section: "Success criteria",
        stem: "Tick these as you check your work: capital letters and full stops; paragraphs; a variety of sentence lengths; at least one piece of speech punctuated correctly (if you used speech); no missed words; a title if required.",
        answer: "Use as a checklist. Typical slips: missing paragraph breaks, it’s/its, comma splices, and stories that stop instead of ending.",
        explanation: "Five minutes of checking often recovers more marks than an extra adjective. Read once for sense and once for punctuation.",
        marks: 0,
        lines: 2,
      },
      {
        section: "Mini prompt bank",
        stem: "If you finish early, plan (do not write in full) one of these extra titles: The Wrong Key; Harbour Fog; A Sound in the Wall; The Science Fair Judge.",
        answer: "Plans will vary. Each title needs a who, where, problem and ending. Example for The Wrong Key: a spare key opens a neighbour’s shed, not the back door; the character must decide whether to confess.",
        explanation: "Short plans keep ideas ready for timed tests. Do not try to write two full stories in one sitting.",
        marks: 0,
        lines: 4,
      },
    ],
  },
];
