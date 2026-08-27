import { escapeHtml, mcOptions, titlePage, paperShell, letter } from "./render-shell.mjs";
import { mathsPaper1 } from "./content/maths-paper1.mjs";
import { englishPaper1 } from "./content/english-paper1.mjs";
import { verbalPaper1 } from "./content/verbal-paper1.mjs";
import { nonverbalPaper1 } from "./content/nonverbal-paper1.mjs";

function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function renderMcQuestion(q, number) {
  const options = q.options?.length ? mcOptions(q.options) : "";
  const shortLines = q.type === "short"
    ? `<div class="write-line"></div><div class="write-line"></div>`
    : "";
  return `<article class="question">
    <div class="q-head">
      <div class="q-num">${number}.</div>
      <div class="q-body">${escapeHtml(q.stem)}${options}${shortLines}${q.figureHtml || ""}${q.optionsHtml || ""}</div>
    </div>
  </article>`;
}

function renderNvrQuestion(q, number) {
  const figure = q.figureHtml || "";
  const optionsAlreadyWrapped = (q.options || []).every((opt) => String(opt).includes("nvr-choice"));
  const choices = optionsAlreadyWrapped
    ? (q.options || []).join("")
    : (q.options || [])
      .map((opt, idx) => {
        const label = letter(idx);
        const body = String(opt).includes("<svg") ? opt : escapeHtml(opt);
        return `<div class="nvr-choice"><div>${label}</div>${body}</div>`;
      })
      .join("");
  const figureBlock = figure.includes("nvr-figure") ? figure : `<div class="nvr-figure">${figure}</div>`;
  const choiceBlock = optionsAlreadyWrapped
    ? `<div class="nvr-choice-row">${choices}</div>`
    : `<div class="nvr-choice-row">${choices}</div>`;
  return `<article class="question">
    <div class="q-head">
      <div class="q-num">${number}.</div>
      <div class="q-body">
        <div>${escapeHtml(q.stem)}</div>
        ${figureBlock}
        ${choiceBlock}
      </div>
    </div>
  </article>`;
}

function wrapPages(sections) {
  return sections
    .map((html, index) => `<section class="page">${html}<div class="page-number">Page ${index + 1}</div><footer class="page-footer">© 2026 JDScience. Original educational resource.</footer></section>`)
    .join("\n");
}

function commonInstructions(subject) {
  return [
    "Work carefully and show clear thinking. For multiple-choice questions, choose the best answer.",
    "If you cannot do a question, move on and return to it later if you have time.",
    "Check your answers if you finish early.",
    `This ${subject} paper is an original JDScience practice resource for 11+ preparation.`,
  ];
}

export function buildMathsPaperHtml() {
  const paper = mathsPaper1;
  const title = titlePage({
    title: paper.title,
    subject: "Mathematics",
    paperType: "Practice Paper 1",
    timeMinutes: paper.timeMinutes,
    questionCount: paper.questions.length,
    instructions: [
      ...commonInstructions("Mathematics"),
      "Each question has five options labelled A to E. Choose one answer only.",
    ],
  });
  const pages = [title];
  for (const group of chunk(paper.questions, 8)) {
    const start = paper.questions.indexOf(group[0]) + 1;
    pages.push(`<div class="banner">Questions</div><h2 class="section-title">Mathematics</h2>${group.map((q, i) => renderMcQuestion(q, start + i)).join("")}`);
  }
  return paperShell({ title: paper.title, subject: paper.subject, bodyHtml: wrapPages(pages) });
}

export function buildMathsAnswersHtml() {
  const paper = mathsPaper1;
  const title = titlePage({
    title: paper.answersTitle,
    subject: "Mathematics",
    paperType: "Answers and Explanations",
    timeMinutes: "—",
    questionCount: paper.questions.length,
    instructions: [
      "Issue this document separately from the pupil paper.",
      "Each explanation shows the correct option and the reasoning.",
    ],
  });
  const blocks = paper.questions.map((q, i) => `<div class="answer-block"><strong>${i + 1}. ${q.answer}</strong> — ${escapeHtml(q.explanation)}</div>`);
  const pages = [title, ...chunk(blocks, 10).map((group) => `<div class="banner">Answers</div><h2 class="section-title">Mark scheme</h2>${group.join("")}`)];
  return paperShell({ title: paper.answersTitle, subject: paper.subject, bodyHtml: wrapPages(pages), isAnswers: true });
}

export function buildEnglishPaperHtml() {
  const paper = englishPaper1;
  const passageHtml = `<div class="passage"><h3 style="margin-top:0;font-family:Segoe UI,Arial,sans-serif">${escapeHtml(paper.passage.title)}</h3>${paper.passage.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("")}</div>`;
  const title = titlePage({
    title: paper.title,
    subject: "English",
    paperType: "Practice Paper 1",
    timeMinutes: paper.timeMinutes,
    questionCount: paper.comprehension.length + paper.language.length,
    instructions: [
      ...commonInstructions("English"),
      "Read the passage carefully before answering the comprehension questions.",
      "Section A has 25 comprehension questions. Section B has 15 language questions.",
    ],
  });
  const pages = [title, `<div class="banner">Reading passage</div><h2 class="section-title">Section A — Reading</h2>${passageHtml}`];
  for (const group of chunk(paper.comprehension, 8)) {
    const start = paper.comprehension.indexOf(group[0]) + 1;
    pages.push(`<div class="banner">Comprehension</div><h2 class="section-title">Section A — Questions</h2>${group.map((q, i) => renderMcQuestion(q, start + i)).join("")}`);
  }
  for (const group of chunk(paper.language, 8)) {
    const start = paper.comprehension.length + paper.language.indexOf(group[0]) + 1;
    pages.push(`<div class="banner">Language</div><h2 class="section-title">Section B — Spelling, punctuation, grammar and vocabulary</h2>${group.map((q, i) => renderMcQuestion(q, start + i)).join("")}`);
  }
  return paperShell({ title: paper.title, subject: paper.subject, bodyHtml: wrapPages(pages) });
}

export function buildEnglishAnswersHtml() {
  const paper = englishPaper1;
  const all = [...paper.comprehension, ...paper.language];
  const title = titlePage({
    title: paper.answersTitle,
    subject: "English",
    paperType: "Answers and Explanations",
    timeMinutes: "—",
    questionCount: all.length,
    instructions: ["Issue separately from the pupil paper.", "Accept clearly equivalent wording for short answers where noted."],
  });
  const blocks = all.map((q, i) => `<div class="answer-block"><strong>${i + 1}. ${escapeHtml(q.answer)}</strong> — ${escapeHtml(q.explanation)}</div>`);
  const pages = [title, ...chunk(blocks, 9).map((group) => `<div class="banner">Answers</div><h2 class="section-title">Mark scheme</h2>${group.join("")}`)];
  return paperShell({ title: paper.answersTitle, subject: paper.subject, bodyHtml: wrapPages(pages), isAnswers: true });
}

export function buildVerbalPaperHtml() {
  const paper = verbalPaper1;
  const title = titlePage({
    title: paper.title,
    subject: "Verbal Reasoning",
    paperType: "Practice Paper 1",
    timeMinutes: paper.timeMinutes,
    questionCount: paper.questions.length,
    instructions: [
      ...commonInstructions("Verbal Reasoning"),
      "Each question has five options labelled A to E unless the stem says otherwise.",
    ],
  });
  const pages = [title];
  for (const group of chunk(paper.questions, 8)) {
    const start = paper.questions.indexOf(group[0]) + 1;
    pages.push(`<div class="banner">Questions</div><h2 class="section-title">Verbal Reasoning</h2>${group.map((q, i) => renderMcQuestion(q, start + i)).join("")}`);
  }
  return paperShell({ title: paper.title, subject: paper.subject, bodyHtml: wrapPages(pages) });
}

export function buildVerbalAnswersHtml() {
  const paper = verbalPaper1;
  const title = titlePage({
    title: paper.answersTitle,
    subject: "Verbal Reasoning",
    paperType: "Answers and Explanations",
    timeMinutes: "—",
    questionCount: paper.questions.length,
    instructions: ["Issue separately from the pupil paper."],
  });
  const blocks = paper.questions.map((q, i) => `<div class="answer-block"><strong>${i + 1}. ${q.answer}</strong> — ${escapeHtml(q.explanation)}</div>`);
  const pages = [title, ...chunk(blocks, 10).map((group) => `<div class="banner">Answers</div><h2 class="section-title">Mark scheme</h2>${group.join("")}`)];
  return paperShell({ title: paper.answersTitle, subject: paper.subject, bodyHtml: wrapPages(pages), isAnswers: true });
}

export function buildNonverbalPaperHtml() {
  const paper = nonverbalPaper1;
  const title = titlePage({
    title: paper.title,
    subject: "Non-Verbal Reasoning",
    paperType: "Practice Paper 1",
    timeMinutes: paper.timeMinutes,
    questionCount: paper.questions.length,
    instructions: [
      ...commonInstructions("Non-Verbal Reasoning"),
      "Study each diagram carefully. Choose the option that best completes the pattern or answers the question.",
      "Diagrams are designed to print clearly in black and white.",
    ],
  });
  const pages = [title];
  for (const group of chunk(paper.questions, 3)) {
    const start = paper.questions.indexOf(group[0]) + 1;
    pages.push(`<div class="banner">Questions</div><h2 class="section-title">Non-Verbal Reasoning</h2>${group.map((q, i) => renderNvrQuestion(q, start + i)).join("")}`);
  }
  return paperShell({ title: paper.title, subject: paper.subject, bodyHtml: wrapPages(pages) });
}

export function buildNonverbalAnswersHtml() {
  const paper = nonverbalPaper1;
  const title = titlePage({
    title: paper.answersTitle,
    subject: "Non-Verbal Reasoning",
    paperType: "Answers and Explanations",
    timeMinutes: "—",
    questionCount: paper.questions.length,
    instructions: ["Issue separately from the pupil paper."],
  });
  const blocks = paper.questions.map((q, i) => `<div class="answer-block"><strong>${i + 1}. ${q.answer}</strong> — ${escapeHtml(q.explanation)}</div>`);
  const pages = [title, ...chunk(blocks, 10).map((group) => `<div class="banner">Answers</div><h2 class="section-title">Mark scheme</h2>${group.join("")}`)];
  return paperShell({ title: paper.answersTitle, subject: paper.subject, bodyHtml: wrapPages(pages), isAnswers: true });
}

export const PAPER_BUILDERS = [
  { key: "maths-paper", subjectSlug: "maths", fileBase: "jdscience-11plus-mathematics-practice-paper-1", title: mathsPaper1.title, answersTitle: mathsPaper1.answersTitle, subject: "Maths", buildPaper: buildMathsPaperHtml, buildAnswers: buildMathsAnswersHtml },
  { key: "english-paper", subjectSlug: "english", fileBase: "jdscience-11plus-english-practice-paper-1", title: englishPaper1.title, answersTitle: englishPaper1.answersTitle, subject: "English", buildPaper: buildEnglishPaperHtml, buildAnswers: buildEnglishAnswersHtml },
  { key: "verbal-paper", subjectSlug: "verbal-reasoning", fileBase: "jdscience-11plus-verbal-reasoning-practice-paper-1", title: verbalPaper1.title, answersTitle: verbalPaper1.answersTitle, subject: "Verbal Reasoning", buildPaper: buildVerbalPaperHtml, buildAnswers: buildVerbalAnswersHtml },
  { key: "nonverbal-paper", subjectSlug: "non-verbal-reasoning", fileBase: "jdscience-11plus-non-verbal-reasoning-practice-paper-1", title: nonverbalPaper1.title, answersTitle: nonverbalPaper1.answersTitle, subject: "Non-Verbal Reasoning", buildPaper: buildNonverbalPaperHtml, buildAnswers: buildNonverbalAnswersHtml },
];
