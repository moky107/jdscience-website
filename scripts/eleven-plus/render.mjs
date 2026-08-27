export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function questionBody(question) {
  const stem = question.html
    ? `<div class="q-stem">${question.html}</div>`
    : `<div class="q-stem">${escapeHtml(question.stem || "")}</div>`;
  const passage = question.passage
    ? `<div class="passage">${question.passageHtml || escapeHtml(question.passage).replace(/\n\n/g, "</p><p>").replace(/^/, "<p>").replace(/$/, "</p>")}</div>`
    : "";
  const options = (question.options || [])
    .map((option, index) => {
      const letter = String.fromCharCode(65 + index);
      return `<div class="option"><span class="opt-letter">${letter}</span> ${option.html ? option.html : escapeHtml(option.text || option)}</div>`;
    })
    .join("");
  const optionsWrap = options ? `<div class="options">${options}</div>` : "";
  const working = question.lines
    ? Array.from({ length: question.lines }, () => `<div class="line"></div>`).join("")
    : "";
  const figure = question.figure ? `<div class="figure">${question.figure}</div>` : "";
  return `${passage}${stem}${figure}${optionsWrap}${working}`;
}

function renderQuestion(question, index) {
  const heading = question.section ? `<h3 class="section">${escapeHtml(question.section)}</h3>` : "";
  if (question.kind === "passage") {
    return `${heading}<article class="question">${questionBody(question)}</article>`;
  }
  const number = question.number || index + 1;
  const marks = question.marks ? `<span class="marks">[${question.marks}]</span>` : "";
  return `${heading}<article class="question">
    <div class="q-head"><span class="q-num">${number}.</span><div class="q-main">${questionBody(question)}${marks}</div></div>
  </article>`;
}

function renderAnswer(question, index) {
  if (question.kind === "passage") return "";
  const number = question.number || index + 1;
  const answer = question.answerHtml || escapeHtml(question.answer || "");
  const explanation = question.explanationHtml || escapeHtml(question.explanation || "");
  return `<article class="answer">
    <div class="q-head"><span class="q-num">${number}.</span>
      <div class="q-main">
        <div class="ans-line"><strong>Answer:</strong> ${answer}</div>
        ${explanation ? `<div class="why"><strong>Why:</strong> ${explanation}</div>` : ""}
      </div>
    </div>
  </article>`;
}

function paperCss() {
  return `
    :root { --teal: #009688; --teal-dark: #004d40; --ink: #0f172a; }
    @page { size: A4; margin: 12mm 11mm 14mm; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: "Segoe UI", Arial, Helvetica, sans-serif;
      color: var(--ink);
      background: #fff;
      font-size: 12.5px;
      line-height: 1.45;
    }
    .sheet { padding: 0 2mm; }
    header.brand {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      border-bottom: 4px solid var(--teal);
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .logo-mark {
      width: 42px; height: 42px; border-radius: 10px;
      background: linear-gradient(135deg, var(--teal), var(--teal-dark));
      color: #fff; font-weight: 800; display: flex; align-items: center; justify-content: center;
      font-size: 16px;
    }
    .brand-left { display: flex; gap: 10px; align-items: center; }
    .logo { font-weight: 800; font-size: 22px; color: var(--teal-dark); letter-spacing: 0.03em; }
    .web { color: var(--teal); font-size: 12px; font-weight: 700; }
    .meta { text-align: right; font-size: 11.5px; color: #334155; line-height: 1.4; }
    h1 { font-size: 20px; margin: 8px 0 6px; color: var(--teal-dark); }
    h2 { font-size: 16px; color: var(--teal-dark); border-top: 2px solid var(--teal); padding-top: 10px; margin: 18px 0 10px; page-break-before: always; }
    h3.section { font-size: 13px; color: var(--teal-dark); margin: 14px 0 8px; letter-spacing: 0.03em; text-transform: uppercase; }
    .banner {
      background: #ecfeff; border: 1px solid var(--teal); color: var(--teal-dark);
      padding: 8px 10px; font-size: 11.5px; font-weight: 700; margin: 8px 0;
    }
    .note { font-size: 12px; color: #334155; margin: 8px 0 12px; }
    .question, .answer { margin: 0 0 11px; break-inside: avoid; }
    .q-head { display: flex; gap: 8px; align-items: flex-start; }
    .q-num { font-weight: 800; min-width: 1.7em; color: var(--teal-dark); }
    .q-main { flex: 1; }
    .q-stem { white-space: pre-wrap; }
    .marks { float: right; font-weight: 800; font-size: 11px; color: #0f172a; }
    .options { margin-top: 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; }
    .options.stack { grid-template-columns: 1fr; }
    .option { display: flex; gap: 6px; align-items: flex-start; }
    .opt-letter { font-weight: 800; color: var(--teal-dark); min-width: 1.1em; }
    .line { border-bottom: 1px dotted #94a3b8; height: 18px; }
    .passage {
      background: #f8fafc; border-left: 4px solid var(--teal); padding: 10px 12px;
      margin: 0 0 12px; font-family: Georgia, "Times New Roman", serif; font-size: 13px; line-height: 1.55;
    }
    .figure { margin: 8px 0; }
    .nvr-row, .option-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin: 6px 0; }
    .nvr-label { font-weight: 800; color: var(--teal-dark); margin-right: 4px; }
    .ans-line { margin-bottom: 3px; }
    .why { color: #334155; font-size: 12px; }
    .guide h3 { color: var(--teal-dark); margin: 14px 0 6px; font-size: 14px; }
    .guide p, .guide li { font-size: 12.5px; line-height: 1.55; color: #1e293b; }
    .guide ul { margin: 4px 0 8px 18px; }
    footer.doc {
      margin-top: 18px; border-top: 2px solid var(--teal); padding-top: 8px;
      font-size: 10.5px; color: #475569;
    }
    table.data { border-collapse: collapse; margin: 8px 0; font-size: 12px; }
    table.data th, table.data td { border: 1px solid #94a3b8; padding: 4px 8px; text-align: left; }
    table.data th { background: #ecfeff; color: var(--teal-dark); }
  `;
}

export function renderPaperHtml(paper) {
  const isGuide = paper.kind === "guide";
  const questions = paper.questions || [];
  let displayNumber = 0;
  const numbered = questions.map((question) => {
    if (question.kind === "passage") return question;
    displayNumber += 1;
    return { ...question, number: question.number || displayNumber };
  });
  const questionHtml = numbered.map((question, index) => renderQuestion(question, index)).join("\n");
  const answerHtml = numbered.map((question, index) => renderAnswer(question, index)).join("\n");
  const guideHtml = (paper.sections || []).map((section) => `
    <h3>${escapeHtml(section.heading)}</h3>
    ${section.html || `<p>${escapeHtml(section.body || "")}</p>`}
  `).join("\n");

  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(paper.documentTitle || paper.title)}</title>
  <style>${paperCss()}</style>
</head>
<body>
  <div class="sheet">
    <header class="brand">
      <div class="brand-left">
        <div class="logo-mark">JD</div>
        <div>
          <div class="logo">JD SCIENCE</div>
          <div class="web">www.jdscience.co.uk · Original 11+ practice</div>
        </div>
      </div>
      <div class="meta">
        11+ entrance practice<br />
        ${escapeHtml(paper.subject)} · ${escapeHtml(paper.skill_area)}<br />
        Free resource · no login required
      </div>
    </header>
    <h1>${escapeHtml(paper.title)}</h1>
    <div class="banner">Original JDScience material. Not an official GL, CEM, CSSE or independent-school paper. Do not copy third-party exam questions.</div>
    <p class="note">${escapeHtml(paper.instructions)}</p>
    ${paper.time ? `<p class="note"><strong>Suggested time:</strong> ${escapeHtml(paper.time)} · <strong>Questions:</strong> ${isGuide ? "Guide" : questions.length}</p>` : ""}
    ${isGuide ? `<div class="guide">${guideHtml}</div>` : questionHtml}
    ${isGuide ? "" : `<h2>Answers and short explanations</h2>
    <p class="note">Check your work only after you have finished. Equivalent wording is accepted where the meaning is the same.</p>
    ${answerHtml}`}
    <footer class="doc">
      © JD Science. Original 11+ practice for personal study and tutoring. Style and topic coverage follow common UK 11+ papers, but every question, passage and figure is newly written by JDScience. Redistribution of official or third-party PDFs is not permitted — this file may be shared from jdscience.co.uk.
    </footer>
  </div>
</body>
</html>`;
}
