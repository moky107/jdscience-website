/** Shared helpers for JDScience 11+ practice paper HTML → PDF pipeline. */

export const TEAL = "#009688";
export const TEAL_DARK = "#004d40";

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function letter(index) {
  return String.fromCharCode(65 + index);
}

export function mcOptions(options) {
  return `<ol class="options" type="A">${options
    .map((opt) => `<li>${typeof opt === "string" && opt.includes("<") ? opt : escapeHtml(opt)}</li>`)
    .join("")}</ol>`;
}

export function pageFooter() {
  return `<footer class="page-footer">© 2026 JDScience. Original educational resource.</footer>`;
}

export function titlePage({ title, subject, paperType, timeMinutes, questionCount, instructions }) {
  const fields = `
    <div class="fields">
      <div class="field"><span>Name</span><div class="line"></div></div>
      <div class="field"><span>Date</span><div class="line"></div></div>
      <div class="field"><span>Score</span><div class="line short"></div></div>
    </div>`;
  const list = (instructions || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  return `
  <section class="title-page">
    <div class="brand-block">
      <div class="logo-mark">JD</div>
      <div>
        <div class="logo-text">JD SCIENCE</div>
        <div class="logo-sub">www.jdscience.co.uk</div>
      </div>
    </div>
    <p class="eyebrow">11+ Practice Collection · Original JDScience resource</p>
    <h1>${escapeHtml(title)}</h1>
    <p class="subject-line">${escapeHtml(subject)} · ${escapeHtml(paperType)}</p>
    ${fields}
    <div class="info-box">
      <div><strong>Recommended time:</strong> ${Number.isFinite(Number(timeMinutes)) ? `${timeMinutes} minutes` : "—"}</div>
      <div><strong>Questions:</strong> ${questionCount}</div>
      <div><strong>Calculator:</strong> Not required unless a question says otherwise</div>
    </div>
    <h2>Instructions</h2>
    <ol class="instructions">${list}</ol>
    <p class="disclaimer">This is an original JDScience practice paper written for school entrance exam preparation. It is not an official GL Assessment, CEM, CSSE, school or publisher paper.</p>
  </section>`;
}

export function paperShell({ title, subject, bodyHtml, isAnswers = false }) {
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root { --teal: ${TEAL}; --teal-dark: ${TEAL_DARK}; }
    @page { size: A4 portrait; margin: 14mm 14mm 16mm; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: "Source Serif 4", "Times New Roman", Times, Georgia, serif;
      color: #0f172a;
      font-size: 11.5pt;
      line-height: 1.45;
      background: #fff;
    }
    h1, h2, h3, .sans, .logo-text, .logo-sub, .eyebrow, .subject-line, .info-box,
    .instructions, .disclaimer, .page-footer, .q-num, .section-title, .fields, .banner {
      font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    }
    .page {
      width: 100%;
      position: relative;
      page-break-after: always;
      padding-bottom: 8mm;
    }
    .page:last-child { page-break-after: auto; }
    .brand-block { display: flex; gap: 12px; align-items: center; margin-bottom: 18px; }
    .logo-mark {
      width: 42px; height: 42px; border-radius: 10px; background: var(--teal);
      color: #fff; display: grid; place-items: center; font-weight: 800; font-size: 16px;
    }
    .logo-text { font-weight: 800; color: var(--teal-dark); font-size: 22px; letter-spacing: 0.04em; }
    .logo-sub { color: var(--teal); font-size: 12px; font-weight: 700; }
    .eyebrow { color: var(--teal-dark); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 8px; }
    h1 { font-size: 26px; line-height: 1.2; margin: 0 0 8px; color: #0f172a; }
    .subject-line { margin: 0 0 18px; color: #334155; font-weight: 700; }
    .fields { display: grid; gap: 10px; margin: 18px 0 20px; }
    .field { display: grid; grid-template-columns: 70px 1fr; gap: 10px; align-items: end; }
    .field span { font-weight: 700; font-size: 12px; color: #334155; }
    .field .line { border-bottom: 1.5px solid #94a3b8; height: 22px; }
    .field .line.short { max-width: 120px; }
    .info-box {
      background: ${isAnswers ? "#fff7ed" : "#ecfeff"};
      border: 1px solid ${isAnswers ? "#fdba74" : "#99f6e4"};
      border-radius: 12px;
      padding: 12px 14px;
      margin-bottom: 16px;
      font-size: 12px;
      color: #334155;
      display: grid; gap: 4px;
    }
    .instructions { margin: 0 0 14px 18px; }
    .disclaimer { font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    .section-title {
      margin: 0 0 12px;
      padding: 8px 10px;
      background: #f0fdfa;
      border-left: 4px solid var(--teal);
      font-size: 14px;
      color: var(--teal-dark);
    }
    .question {
      margin: 0 0 14px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .q-head { display: flex; gap: 8px; align-items: flex-start; }
    .q-num { font-weight: 800; min-width: 2em; color: var(--teal-dark); }
    .q-body { flex: 1; }
    .options { margin: 6px 0 0 8px; padding: 0; }
    .options li { margin: 2px 0; }
    .passage {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 14px;
      margin: 0 0 16px;
      font-size: 11pt;
      text-align: justify;
    }
    .passage p { margin: 0 0 10px; }
    .passage p:last-child { margin-bottom: 0; }
    .write-line { border-bottom: 1px dotted #94a3b8; height: 20px; margin-top: 4px; }
    .nvr-figure {
      display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
      margin: 8px 0; justify-content: flex-start;
    }
    .nvr-figure svg, .nvr-choice svg {
      border: 1px solid #cbd5e1; border-radius: 6px; background: #fff;
      width: 72px; height: 72px;
    }
    .nvr-choice-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
    .question { margin: 0 0 10px; break-inside: avoid; page-break-inside: avoid; }
    .nvr-choice { text-align: center; font-size: 10px; font-family: "Segoe UI", Arial, sans-serif; }
    .answer-block {
      margin: 0 0 12px;
      padding: 8px 10px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      break-inside: avoid;
    }
    .answer-block strong { color: var(--teal-dark); }
    .page-footer {
      position: running(footer);
      font-size: 9px;
      color: #64748b;
      border-top: 1px solid #cbd5e1;
      padding-top: 4px;
      margin-top: 18px;
    }
    .page-number {
      text-align: right;
      font-size: 9px;
      color: #64748b;
      font-family: "Segoe UI", Arial, sans-serif;
      margin-top: 8px;
    }
    .banner {
      display: inline-block;
      background: ${isAnswers ? "#ffedd5" : "#ccfbf1"};
      color: ${isAnswers ? "#9a3412" : "var(--teal-dark)"};
      font-size: 11px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 999px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}
