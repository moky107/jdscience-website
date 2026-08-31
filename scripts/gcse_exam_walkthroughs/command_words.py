"""GCSE science command word guide — Section 1 content."""

COMMAND_WORDS = [
    {
        "word": "State",
        "must_do": "Give a short, factual answer — often one word, number or phrase. No explanation is required unless the question also asks you to explain.",
        "mistake": "Writing a long paragraph when a single fact is enough, or giving an explanation when only a fact was asked for.",
        "starter": "The [quantity/name] is …",
    },
    {
        "word": "Give",
        "must_do": "Provide the information requested. Similar to state, but may need a short phrase or named example.",
        "mistake": "Listing unrelated facts that do not answer the question.",
        "starter": "One example is … / The value is …",
    },
    {
        "word": "Describe",
        "must_do": "Say what happens or what something is like. Focus on observations, patterns or features. You do not need to say why.",
        "mistake": "Explaining causes when the command word is only describe.",
        "starter": "First … then … / The pattern shows …",
    },
    {
        "word": "Explain",
        "must_do": "Give reasons why something happens. Link cause and effect using science ideas and key terms.",
        "mistake": "Describing what happens without saying why, or using everyday language instead of science.",
        "starter": "This happens because … which means …",
    },
    {
        "word": "Calculate",
        "must_do": "Work out a numerical answer. Show your working, include units, and give the final value to the required precision.",
        "mistake": "Missing units, no working, or using the wrong equation.",
        "starter": "Use … = … / Substitute: …",
    },
    {
        "word": "Compare",
        "must_do": "Identify similarities and/or differences between two or more things. Refer to both sides.",
        "mistake": "Only describing one item, or listing features without comparing.",
        "starter": "Both … however … / X has … whereas Y …",
    },
    {
        "word": "Evaluate",
        "must_do": "Weigh up evidence or options, consider strengths and weaknesses, and reach a supported judgement.",
        "mistake": "Only listing advantages with no conclusion or balanced comment.",
        "starter": "An advantage is … A limitation is … Overall …",
    },
    {
        "word": "Suggest",
        "must_do": "Apply your knowledge to a new situation. Your answer should be sensible and scientifically plausible.",
        "mistake": "Repeating textbook facts that do not fit the context given.",
        "starter": "A possible reason is … / This could be because …",
    },
    {
        "word": "Justify",
        "must_do": "Give evidence or reasons that support a choice, conclusion or statement already made.",
        "mistake": "Restating the claim without giving supporting science.",
        "starter": "This is supported by … because …",
    },
    {
        "word": "Determine",
        "must_do": "Find out a value or conclusion using data, a graph or a calculation. Show how you reached your answer.",
        "mistake": "Reading a graph incorrectly or not showing how the value was obtained.",
        "starter": "From the graph … / Using the data …",
    },
    {
        "word": "Analyse",
        "must_do": "Break information into parts, interpret patterns or trends, and explain what the data shows.",
        "mistake": "Describing data without interpreting it, or ignoring anomalies.",
        "starter": "The data shows that … / As X increases, Y …",
    },
]


def intro_paragraphs(subject: str) -> list[str]:
    return [
        f"This {subject} Exam Walkthrough Pack is designed to help you understand how to approach GCSE and IGCSE exam-style questions. "
        "Every question in this booklet is an original JDScience item written to match common specification skills — "
        "it is not copied from AQA, Edexcel, OCR or other past papers.",
        "How to use this pack: read each question, cover the walkthrough, and try answering in exam conditions first. "
        "Then read what the question is asking, follow the step-by-step thinking, compare your answer with the model answer, "
        "and study the mark breakdown to see exactly how marks are awarded.",
        "Command words tell you what type of answer is required. Section 1 explains the most common GCSE science command words. "
        "Always underline the command word before you start writing.",
        "Showing working matters: in calculations, examiners award method marks even when the final answer is wrong. "
        "In longer answers, a clear logical sequence helps you secure every available mark.",
        "Examiners award marks for correct science linked to the question. Keywords from the specification matter, "
        "but a correct idea in your own words can still score. Extended questions often use level-based marking: "
        "plan before you write, use paragraphs, and link ideas.",
        "To move from Grade 4/5 to Grade 7/8/9: use precise terminology, explain mechanisms (not just names), "
        "include data or examples where asked, and check units and significant figures in calculations. "
        "For six-mark questions, a short plan and linked paragraphs beat a long unordered list.",
    ]
