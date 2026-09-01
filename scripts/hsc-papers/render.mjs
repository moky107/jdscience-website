function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function lines(count) {
  return Array.from({ length: count }, () => `<div class="line"></div>`).join("");
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
      font-size: 12.4px;
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
    h1 { font-size: 19px; margin: 8px 0 6px; color: var(--teal-dark); }
    h2 { font-size: 15px; color: var(--teal-dark); margin: 16px 0 8px; }
    .banner {
      background: #ecfeff; border: 1px solid var(--teal); color: var(--teal-dark);
      padding: 8px 10px; font-size: 11.5px; font-weight: 700; margin: 8px 0;
    }
    .note { font-size: 12px; color: #334155; margin: 8px 0 12px; }
    .context {
      background: #f8fafc; border-left: 4px solid var(--teal); padding: 10px 12px;
      margin: 0 0 10px; white-space: pre-wrap;
    }
    .question { margin: 0 0 16px; }
    .q-head { font-weight: 800; color: var(--teal-dark); margin-bottom: 6px; }
    .part { margin: 8px 0 10px 12px; break-inside: avoid; }
    .part-head { margin-bottom: 4px; }
    .part-label { font-weight: 800; color: var(--teal-dark); }
    .marks { float: right; font-weight: 800; font-size: 11px; }
    .line { border-bottom: 1px dotted #94a3b8; height: 18px; }
    .ms-block { margin: 4px 0 8px 12px; }
    .ms-block ul { margin: 4px 0 0 18px; padding: 0; }
    .ms-block li { margin: 0 0 3px; }
    .ms-label { font-weight: 800; color: var(--teal-dark); font-size: 12px; }
    footer.doc {
      margin-top: 18px; border-top: 2px solid var(--teal); padding-top: 8px;
      font-size: 10.5px; color: #475569;
    }
  `;
}

function renderStudentQuestion(item) {
  const parts = item.parts.map((part) => {
    const rows = part.marks >= 8 ? 9 : part.marks >= 6 ? 7 : part.marks >= 4 ? 5 : 3;
    return `<div class="part">
      <div class="part-head"><span class="part-label">(${escapeHtml(part.label)})</span> ${escapeHtml(part.text)} <span class="marks">[${part.marks}]</span></div>
      ${lines(rows)}
    </div>`;
  }).join("");
  return `<article class="question">
    <div class="q-head">Question ${item.number} · ${item.marks} marks</div>
    <div class="context">${escapeHtml(item.context)}</div>
    ${parts}
  </article>`;
}

function renderMarkSchemeQuestion(item) {
  const parts = item.parts.map((part) => {
    const points = (part.points || []).map((point) => `<li>${escapeHtml(point)}</li>`).join("");
    return `<div class="ms-block">
      <div class="ms-label">(${escapeHtml(part.label)}) [${part.marks} mark${part.marks === 1 ? "" : "s"}]</div>
      <div>${escapeHtml(part.text)}</div>
      <ul>${points}</ul>
    </div>`;
  }).join("");
  return `<article class="question">
    <div class="q-head">Question ${item.number} · ${item.marks} marks</div>
    <div class="context">${escapeHtml(item.context)}</div>
    ${parts}
  </article>`;
}

export function renderHscPaperHtml(paper, { markScheme = false } = {}) {
  const setName = paper.setLabel.replace("_", " ");
  const title = markScheme
    ? `JDScience BTEC Health and Social Care Unit ${paper.unit} ${setName} mark scheme`
    : `JDScience BTEC Health and Social Care Unit ${paper.unit} ${setName}`;
  const banner = markScheme
    ? "Original JDScience mark scheme. Indicative content only. Equivalent wording that meets the command word should be credited. Not an official Pearson paper."
    : "Original JDScience exam-style practice. Written for BTEC Level 3 Health and Social Care (2016) topics. Not an official Pearson past paper.";
  const body = paper.questions
    .map((item) => (markScheme ? renderMarkSchemeQuestion(item) : renderStudentQuestion(item)))
    .join("\n");
  const instructions = markScheme
    ? "Use this booklet after the matching practice paper. Do not issue it with the student paper."
    : "Answer all questions. Use the case studies. The marks for each part are shown in brackets.";

  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>${paperCss()}</style>
</head>
<body>
  <div class="sheet">
    <header class="brand">
      <div class="brand-left">
        <div class="logo-mark">JD</div>
        <div>
          <div class="logo">JD SCIENCE</div>
          <div class="web">www.jdscience.co.uk · Original BTEC practice</div>
        </div>
      </div>
      <div class="meta">
        BTEC Level 3 Health and Social Care<br />
        Unit ${paper.unit}: ${escapeHtml(paper.unitTitle)}<br />
        Free resource · no login required
      </div>
    </header>
    <h1>${escapeHtml(title)}</h1>
    <div class="banner">${banner}</div>
    <p class="note">${escapeHtml(instructions)}</p>
    <p class="note"><strong>Time:</strong> ${escapeHtml(paper.time)} · <strong>Total marks:</strong> ${paper.totalMarks}</p>
    ${body}
    <footer class="doc">
      © JD Science. Original practice for personal study and tutoring. Questions, names and mark schemes are newly written by JDScience. This file is not affiliated with Pearson and must not be presented as an official exam paper. Share from jdscience.co.uk.
    </footer>
  </div>
</body>
</html>`;
}
