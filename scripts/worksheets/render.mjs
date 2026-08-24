import { totalMarks } from "./exam.mjs";

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function lines(count) {
  return Array.from({ length: count }, () => `<div class="line"></div>`).join("");
}

function renderQuestion(question, index) {
  const number = index + 1;
  const partHtml = (question.parts || [])
    .map((part) => {
      const rows = part.marks >= 5 ? 7 : part.marks >= 3 ? 5 : 3;
      return `<div class="part">
        <div class="part-head"><span class="part-label">(${escapeHtml(part.label)})</span> ${escapeHtml(part.text)} <span class="marks">[${part.marks}]</span></div>
        ${lines(rows)}
      </div>`;
    })
    .join("");

  const stemMarks = question.parts?.length ? "" : ` <span class="marks">[${question.marks}]</span>`;
  const extraLines = question.parts?.length ? "" : lines(question.marks >= 6 ? 8 : question.marks >= 3 ? 5 : 3);

  return `<article class="question">
    <div class="q-head"><span class="q-num">${number}.</span> <div class="q-stem">${escapeHtml(question.stem)}${stemMarks}</div></div>
    ${partHtml}
    ${extraLines}
  </article>`;
}

function renderAnswer(question, index) {
  const number = index + 1;
  const blocks = (question.answers || []).map((answer) => {
    const label = answer.label ? `(${escapeHtml(answer.label)}) ` : "";
    const points = (answer.points || []).map((point) => `<li>${escapeHtml(point)}</li>`).join("");
    return `<div class="ms-block"><div class="ms-label">${label}[${answer.marks} mark${answer.marks === 1 ? "" : "s"}]</div><ul>${points}</ul></div>`;
  }).join("");

  return `<article class="question">
    <div class="q-head"><span class="q-num">${number}.</span> <div class="q-stem">${escapeHtml(question.stem)}</div></div>
    ${blocks}
  </article>`;
}

function pageShell({ title, offering, topicTitle, kind, questions, extraNote, canonicalPath }) {
  const marks = totalMarks(questions);
  const isAnswers = kind === "answers";
  const topicForCopy = String(topicTitle || "")
    .replace(/^Unit\s+(\d+)\s+worksheet\s*[—–-]\s*/i, "Unit $1 — ")
    .replace(/^Unit\s+(\d+)\s+answers\s*[—–-]\s*/i, "Unit $1 — ");
  const watermark = isAnswers ? "JD SCIENCE  ·  ANSWERS" : "JD SCIENCE";
  const banner = isAnswers
    ? "Separate mark scheme — do not issue with the student worksheet"
    : "Original exam-style worksheet — not an official exam paper";
  const description = isAnswers
    ? `Indicative answers and marking points for the JD Science ${offering.board} ${offering.level} ${offering.subject} worksheet on ${topicForCopy}. Original UK practice material, not an official exam paper.`
    : `Free original ${offering.board} ${offering.level} ${offering.subject} worksheet on ${topicForCopy} from JD Science. ${questions.length} exam-style questions for GCSE, A-Level, T-Level and BTEC students in the UK.`;
  const canonical = canonicalPath ? `https://www.jdscience.co.uk${canonicalPath}` : "https://www.jdscience.co.uk/worksheets/";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: title,
    description,
    url: canonical,
    learningResourceType: isAnswers ? "Answer key" : "Worksheet",
    educationalLevel: offering.level,
    about: `${offering.subject} — ${topicForCopy}`,
    inLanguage: "en-GB",
    isAccessibleForFree: true,
    provider: {
      "@type": "EducationalOrganization",
      name: "JD Science",
      url: "https://www.jdscience.co.uk",
    },
  };

  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="index,follow" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="JD Science" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta property="og:image" content="https://www.jdscience.co.uk/og-image.png" />
  <meta property="og:locale" content="en_GB" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>
    :root { --teal: #009688; --teal-dark: #004d40; }
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Times New Roman", Times, Georgia, serif;
      color: #111;
      background: #f3f4f6;
    }
    .sheet {
      position: relative;
      max-width: 210mm;
      margin: 16px auto;
      background: #fff;
      padding: 16px 18px 28px;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
    }
    .watermark {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }
    .watermark span {
      position: absolute;
      left: -20%;
      top: 8%;
      width: 160%;
      font-size: 42px;
      font-weight: 800;
      letter-spacing: 0.18em;
      color: #004d40;
      opacity: 0.055;
      transform: rotate(-28deg);
      text-align: center;
      line-height: 3.2;
      font-family: "Segoe UI", Arial, sans-serif;
    }
    .content { position: relative; z-index: 1; }
    header { border-bottom: 3px solid var(--teal); padding-bottom: 10px; margin-bottom: 14px; }
    .brand {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: flex-start;
      font-family: "Segoe UI", Arial, sans-serif;
    }
    .logo { font-weight: 800; color: var(--teal-dark); font-size: 22px; letter-spacing: 0.04em; }
    .web { color: var(--teal); font-size: 13px; font-weight: 700; }
    .web a { color: inherit; text-decoration: none; }
    h1 { font-size: 20px; margin: 8px 0 4px; }
    .meta, .banner, .note, .toolbar, footer { font-family: "Segoe UI", Arial, sans-serif; }
    .meta { color: #334155; font-size: 13px; line-height: 1.45; }
    .banner {
      margin-top: 8px;
      background: ${isAnswers ? "#fef3c7" : "#ecfeff"};
      border: 1px solid ${isAnswers ? "#f59e0b" : "var(--teal)"};
      color: ${isAnswers ? "#92400e" : "var(--teal-dark)"};
      padding: 7px 10px;
      font-size: 12px;
      font-weight: 700;
    }
    .toolbar { display: flex; gap: 8px; margin: 12px 0; flex-wrap: wrap; }
    .toolbar button {
      background: var(--teal);
      color: #fff;
      border: 0;
      border-radius: 8px;
      padding: 8px 12px;
      font-weight: 700;
      cursor: pointer;
    }
    .note { font-size: 13px; color: #334155; margin: 8px 0 14px; }
    .question { margin: 0 0 16px; break-inside: avoid; }
    .q-head { display: flex; gap: 8px; align-items: flex-start; }
    .q-num { font-weight: 700; min-width: 1.6em; }
    .q-stem { flex: 1; }
    .marks { float: right; font-weight: 700; font-family: "Segoe UI", Arial, sans-serif; font-size: 12px; color: #0f172a; }
    .part { margin: 8px 0 8px 22px; }
    .part-head { margin-bottom: 4px; }
    .part-label { font-weight: 700; }
    .line { border-bottom: 1px dotted #94a3b8; height: 18px; }
    .ms-block { margin: 6px 0 6px 22px; }
    .ms-label { font-weight: 700; font-family: "Segoe UI", Arial, sans-serif; font-size: 13px; color: var(--teal-dark); }
    ul { margin: 4px 0 0 18px; }
    li { margin: 2px 0; }
    footer { margin-top: 22px; border-top: 2px solid var(--teal); padding-top: 8px; font-size: 11px; color: #475569; }
    @media print {
      body { background: #fff; }
      .sheet { margin: 0; box-shadow: none; max-width: none; padding: 0; }
      .toolbar { display: none; }
    }
  </style>
</head>
<body>
  <div class="watermark"><span>${Array.from({ length: 24 }, () => watermark + " · www.jdscience.co.uk").join("<br>")}</span></div>
  <div class="sheet">
    <div class="content">
      <header>
        <div class="brand">
          <div>
            <div class="logo">JD SCIENCE</div>
            <div class="web"><a href="https://www.jdscience.co.uk">www.jdscience.co.uk</a> · <a href="https://www.jdscience.co.uk/worksheets/">Worksheets</a></div>
          </div>
          <div class="meta" style="text-align:right">
            ${escapeHtml(offering.specName)} (${escapeHtml(offering.spec)})<br />
            ${escapeHtml(offering.level.replace("/IGCSE", ""))} ${escapeHtml(offering.subject)}<br />
            ${isAnswers ? (/^Unit\s+\d+/i.test(topicTitle) ? "Unit answers" : "Answer sheet") : (/^Unit\s+\d+/i.test(topicTitle) ? "Unit worksheet" : "Topic worksheet")}
          </div>
        </div>
        <h1>${escapeHtml(topicTitle)}</h1>
        <div class="banner">${banner}</div>
        <div class="meta" style="margin-top:8px">
          Time guide: ${isAnswers ? "—" : "50–60 minutes"} · Questions: ${questions.length} · Total marks: ${marks}<br />
          ${escapeHtml(offering.paperNote)}
        </div>
      </header>
      <div class="toolbar">
        <button onclick="window.print()">Print / Save as PDF</button>
      </div>
      <p class="note">${escapeHtml(extraNote)}</p>
      ${questions.map((question, index) => (isAnswers ? renderAnswer(question, index) : renderQuestion(question, index))).join("\n")}
      <footer>
        © JD Science. Original practice material for personal study and tutoring. Command words, mark allocations and paper layout follow ${escapeHtml(offering.board)} style but this is not an official ${escapeHtml(offering.board)} paper.
        Reproduction of official exam questions is not permitted — every item here is newly written.
      </footer>
    </div>
  </div>
</body>
</html>`;
}

export function renderWorksheet({ offering, topicTitle, questions, canonicalPath }) {
  return pageShell({
    title: `JD Science | ${offering.board} ${offering.subject} | ${topicTitle}`,
    offering,
    topicTitle,
    kind: "questions",
    questions,
    canonicalPath,
    extraNote: "Answer all questions. Show working. Answers are in a separate file on the Worksheets page — do not look at them until you have finished.",
  });
}

export function renderAnswers({ offering, topicTitle, questions, canonicalPath }) {
  return pageShell({
    title: `JD Science answers | ${offering.board} ${offering.subject} | ${topicTitle}`,
    offering,
    topicTitle,
    kind: "answers",
    questions,
    canonicalPath,
    extraNote: "Indicative marking points. Award marks for equivalent scientific or mathematical wording. Do not issue this sheet with the student worksheet.",
  });
}
