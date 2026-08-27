/** JDScience original 11+ Non-Verbal Reasoning Practice Paper 1 — 100% original SVG content. */

/** Wrap inner SVG markup in a consistent print-clear frame. */
export function svgFrame(inner, { w = 90, h = 90 } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="#fff" stroke="#111" stroke-width="1"/>
  ${inner}
</svg>`;
}

const ink = (extra = "") => `stroke="#111" fill="none" stroke-width="2" ${extra}`.trim();
const fillBlk = `fill="#111" stroke="#111" stroke-width="1.5"`;
const fillWht = `fill="#fff" stroke="#111" stroke-width="2"`;
const fillGrey = `fill="#9ca3af" stroke="#111" stroke-width="1.5"`;

let _hatchSeq = 0;
function hatchDefs(idPrefix = "hatch") {
  const id = `${idPrefix}-${++_hatchSeq}`;
  return {
    id,
    defs: `<defs>
    <pattern id="${id}" patternUnits="userSpaceOnUse" width="6" height="6">
      <path d="M0,6 L6,0" stroke="#111" stroke-width="1"/>
    </pattern>
  </defs>`,
  };
}

export function circle(cx, cy, r, style = fillWht) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" ${style}/>`;
}

export function rect(x, y, w, h, style = fillWht) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${style}/>`;
}

export function square(cx, cy, size, style = fillWht) {
  const h = size / 2;
  return rect(cx - h, cy - h, size, size, style);
}

export function triangle(cx, cy, size, pointing = "up", style = fillWht) {
  const h = (size * Math.sqrt(3)) / 2;
  let pts;
  if (pointing === "up") {
    pts = `${cx},${cy - h / 2} ${cx - size / 2},${cy + h / 2} ${cx + size / 2},${cy + h / 2}`;
  } else if (pointing === "down") {
    pts = `${cx},${cy + h / 2} ${cx - size / 2},${cy - h / 2} ${cx + size / 2},${cy - h / 2}`;
  } else if (pointing === "right") {
    pts = `${cx + h / 2},${cy} ${cx - h / 2},${cy - size / 2} ${cx - h / 2},${cy + size / 2}`;
  } else {
    pts = `${cx - h / 2},${cy} ${cx + h / 2},${cy - size / 2} ${cx + h / 2},${cy + size / 2}`;
  }
  return `<polygon points="${pts}" ${style}/>`;
}

export function line(x1, y1, x2, y2) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${ink()}/>`;
}

export function arrow(x1, y1, x2, y2) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 8;
  const a1 = angle + Math.PI * 0.8;
  const a2 = angle - Math.PI * 0.8;
  const hx1 = x2 + head * Math.cos(a1);
  const hy1 = y2 + head * Math.sin(a1);
  const hx2 = x2 + head * Math.cos(a2);
  const hy2 = y2 + head * Math.sin(a2);
  return `${line(x1, y1, x2, y2)}<polygon points="${x2},${y2} ${hx1},${hy1} ${hx2},${hy2}" ${fillBlk}/>`;
}

export function dot(cx, cy, r = 4) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" ${fillBlk}/>`;
}

export function diamond(cx, cy, size, style = fillWht) {
  const h = size / 2;
  return `<polygon points="${cx},${cy - h} ${cx + h},${cy} ${cx},${cy + h} ${cx - h},${cy}" ${style}/>`;
}

function row(...svgs) {
  return `<div class="nvr-figure">${svgs.join("")}</div>`;
}

function choiceLabel(letter, svg) {
  return `<div class="nvr-choice"><div>${letter}</div>${svg}</div>`;
}

function optionsFrom(svgs) {
  return svgs.map((s, i) => choiceLabel(String.fromCharCode(65 + i), s));
}

function figDots(n, filledStyle = fillBlk) {
  const positions = [[30, 30], [60, 30], [30, 60], [60, 60], [45, 45]];
  const parts = [];
  for (let i = 0; i < n; i++) {
    const [x, y] = positions[i];
    parts.push(`<circle cx="${x}" cy="${y}" r="7" ${filledStyle}/>`);
  }
  return svgFrame(parts.join(""));
}

function figShapesGrowing(count) {
  const parts = [];
  const size = count >= 5 ? 12 : 14;
  const gap = count >= 5 ? 16 : 20;
  const start = 45 - ((count - 1) * gap) / 2;
  for (let i = 0; i < count; i++) {
    parts.push(square(start + i * gap, 45, size, fillWht));
  }
  return svgFrame(parts.join(""));
}

function figArrowDir(dir) {
  const map = {
    right: [20, 45, 70, 45],
    left: [70, 45, 20, 45],
    up: [45, 70, 45, 20],
    down: [45, 20, 45, 70],
    upRight: [25, 65, 65, 25],
  };
  const [x1, y1, x2, y2] = map[dir];
  return svgFrame(arrow(x1, y1, x2, y2));
}

function figCircleSquare(inner = "circle") {
  if (inner === "circle") return svgFrame(`${square(45, 45, 50, fillWht)}${circle(45, 45, 14, fillWht)}`);
  if (inner === "square") return svgFrame(`${circle(45, 45, 28, fillWht)}${square(45, 45, 24, fillWht)}`);
  if (inner === "dot") return svgFrame(`${square(45, 45, 50, fillWht)}${dot(45, 45, 6)}`);
  return svgFrame(`${circle(45, 45, 28, fillWht)}${dot(45, 45, 6)}`);
}

function figTriangleRotate(deg) {
  return svgFrame(`<g transform="rotate(${deg} 45 45)">${triangle(45, 48, 42, "up", fillWht)}</g>`);
}

function figBarCount(n, vertical = true) {
  const parts = [];
  if (vertical) {
    for (let i = 0; i < n; i++) parts.push(rect(20 + i * 16, 25, 10, 40, fillGrey));
  } else {
    for (let i = 0; i < n; i++) parts.push(rect(25, 20 + i * 16, 40, 10, fillGrey));
  }
  return svgFrame(parts.join(""));
}

function figClockHand(hourLike) {
  const angles = { 12: -90, 3: 0, 6: 90, 9: 180 };
  const a = ((angles[hourLike] ?? 0) * Math.PI) / 180;
  const x2 = 45 + 28 * Math.cos(a);
  const y2 = 45 + 28 * Math.sin(a);
  return svgFrame(`${circle(45, 45, 32, fillWht)}${arrow(45, 45, x2, y2)}`);
}

function figCornerDot(corner) {
  const map = { tl: [22, 22], tr: [68, 22], bl: [22, 68], br: [68, 68] };
  const [x, y] = map[corner];
  return svgFrame(`${square(45, 45, 56, fillWht)}${dot(x, y, 6)}`);
}

function figHalfShade(side) {
  const { id, defs } = hatchDefs(`h${side}`);
  if (side === "left") {
    return svgFrame(`${defs}${rect(15, 15, 30, 60, `fill="url(#${id})" stroke="#111" stroke-width="1.5"`)}${rect(45, 15, 30, 60, fillWht)}`);
  }
  if (side === "right") {
    return svgFrame(`${defs}${rect(15, 15, 30, 60, fillWht)}${rect(45, 15, 30, 60, `fill="url(#${id})" stroke="#111" stroke-width="1.5"`)}`);
  }
  if (side === "top") {
    return svgFrame(`${defs}${rect(15, 15, 60, 30, `fill="url(#${id})" stroke="#111" stroke-width="1.5"`)}${rect(15, 45, 60, 30, fillWht)}`);
  }
  return svgFrame(`${defs}${rect(15, 15, 60, 30, fillWht)}${rect(15, 45, 60, 30, `fill="url(#${id})" stroke="#111" stroke-width="1.5"`)}`);
}

function figNested(depth) {
  const parts = [];
  for (let i = 0; i < depth; i++) parts.push(square(45, 45, 56 - i * 14, fillWht));
  return svgFrame(parts.join(""));
}

function figLineCount(n) {
  const parts = [];
  for (let i = 0; i < n; i++) parts.push(line(20, 25 + i * 14, 70, 25 + i * 14));
  return svgFrame(parts.join(""));
}

function figPlusMinus(kind) {
  if (kind === "plus") return svgFrame(`${line(45, 20, 45, 70)}${line(20, 45, 70, 45)}`);
  if (kind === "minus") return svgFrame(line(20, 45, 70, 45));
  if (kind === "cross") return svgFrame(`${line(25, 25, 65, 65)}${line(65, 25, 25, 65)}`);
  return svgFrame(`${circle(45, 45, 22, fillWht)}`);
}

function figRingDot(position) {
  const map = { N: [45, 22], E: [68, 45], S: [45, 68], W: [22, 45], C: [45, 45] };
  const [x, y] = map[position];
  return svgFrame(`${circle(45, 45, 28, fillWht)}${dot(x, y, 5)}`);
}

function matrixGrid(cells, cols = 2) {
  const items = cells
    .map((c) =>
      c === "?"
        ? svgFrame(`<text x="45" y="52" text-anchor="middle" font-size="28" font-family="Segoe UI,Arial,sans-serif" fill="#111">?</text>`)
        : c
    )
    .join("");
  return `<div class="nvr-figure" style="display:grid;grid-template-columns:repeat(${cols},auto);gap:8px;width:max-content;">${items}</div>`;
}

function figLShape(orient) {
  const shapes = {
    0: `${rect(22, 22, 18, 46, fillWht)}${rect(22, 50, 46, 18, fillWht)}`,
    90: `${rect(22, 22, 18, 46, fillWht)}${rect(22, 22, 46, 18, fillWht)}`,
    180: `${rect(50, 22, 18, 46, fillWht)}${rect(22, 22, 46, 18, fillWht)}`,
    270: `${rect(50, 22, 18, 46, fillWht)}${rect(22, 50, 46, 18, fillWht)}`,
  };
  return svgFrame(shapes[orient] || shapes[0]);
}

function figTwoShapes(a, b) {
  const left =
    a === "circle" ? circle(28, 45, 16, fillWht) : a === "square" ? square(28, 45, 28, fillWht) : triangle(28, 48, 28, "up", fillWht);
  const right =
    b === "circle" ? circle(62, 45, 16, fillWht) : b === "square" ? square(62, 45, 28, fillWht) : triangle(62, 48, 28, "up", fillWht);
  return svgFrame(left + right);
}

function figShadedCircle(fraction) {
  const { id, defs } = hatchDefs(`sc${String(fraction).replace(".", "")}`);
  if (fraction === 0) return svgFrame(`${defs}${circle(45, 45, 28, fillWht)}`);
  if (fraction === 1) return svgFrame(`${defs}${circle(45, 45, 28, `fill="url(#${id})" stroke="#111" stroke-width="2"`)}`);
  if (fraction === 0.5) {
    return svgFrame(`${defs}${circle(45, 45, 28, fillWht)}
      <path d="M45,17 A28,28 0 0,1 45,73 Z" fill="url(#${id})" stroke="#111" stroke-width="1"/>
      ${circle(45, 45, 28, 'fill="none" stroke="#111" stroke-width="2"')}`);
  }
  return svgFrame(`${defs}${circle(45, 45, 28, fillWht)}
    <path d="M45,45 L45,17 A28,28 0 0,1 73,45 Z" fill="url(#${id})" stroke="#111" stroke-width="1"/>
    ${circle(45, 45, 28, 'fill="none" stroke="#111" stroke-width="2"')}`);
}

function figGridDots(pattern) {
  const parts = [];
  for (let i = 0; i < 9; i++) {
    const r = Math.floor(i / 3);
    const c = i % 3;
    const x = 22 + c * 23;
    const y = 22 + r * 23;
    if (pattern[i] === "1") parts.push(dot(x, y, 5));
    else parts.push(`<circle cx="${x}" cy="${y}" r="5" ${fillWht}/>`);
  }
  return svgFrame(parts.join(""));
}

function figArrowRotateSeq(deg) {
  return svgFrame(`<g transform="rotate(${deg} 45 45)">${arrow(45, 70, 45, 20)}</g>`);
}

function figSizeShape(kind, size) {
  const s = size === "s" ? 20 : size === "m" ? 32 : 48;
  if (kind === "circle") return svgFrame(circle(45, 45, s / 2, fillWht));
  if (kind === "square") return svgFrame(square(45, 45, s, fillWht));
  return svgFrame(triangle(45, 50, s, "up", fillWht));
}

function orderBlock(circleSvg, squareSvg, triangleSvg) {
  return `<div class="nvr-figure" style="gap:4px">${circleSvg}${squareSvg}${triangleSvg}</div>`;
}

const _c = () => svgFrame(circle(45, 45, 18, fillWht));
const _s = () => svgFrame(square(45, 45, 32, fillWht));
const _t = () => svgFrame(triangle(45, 50, 34, "up", fillWht));

export const nonverbalPaper1 = {
  id: "nonverbal-practice-paper-1",
  title: "JDScience 11+ Non-Verbal Reasoning Practice Paper 1",
  answersTitle: "JDScience 11+ Non-Verbal Reasoning Practice Paper 1 — Answers and Explanations",
  subject: "Non-Verbal Reasoning",
  timeMinutes: 50,
  questions: [
    {
      id: "nvr1-q01",
      kind: "sequence",
      stem: "Which figure comes next in the sequence?",
      figureHtml: row(figDots(1), figDots(2), figDots(3), figDots(4)),
      options: optionsFrom([figDots(5), figDots(3), figDots(1), figDots(4), figShapesGrowing(5)]),
      answer: "A",
      explanation: "Each figure adds one filled dot. After four dots, five dots come next.",
    },
    {
      id: "nvr1-q02",
      kind: "sequence",
      stem: "Which figure comes next in the sequence?",
      figureHtml: row(figShapesGrowing(1), figShapesGrowing(2), figShapesGrowing(3), figShapesGrowing(4)),
      options: optionsFrom([figShapesGrowing(5), figShapesGrowing(3), figShapesGrowing(1), figDots(5), figBarCount(5)]),
      answer: "A",
      explanation: "One square is added each time. Five squares follow four.",
    },
    {
      id: "nvr1-q03",
      kind: "sequence",
      stem: "Which figure comes next in the sequence?",
      figureHtml: row(figArrowDir("right"), figArrowDir("down"), figArrowDir("left"), figArrowDir("up")),
      options: optionsFrom([figArrowDir("right"), figArrowDir("down"), figArrowDir("left"), figArrowDir("up"), figArrowDir("upRight")]),
      answer: "A",
      explanation: "The arrow turns 90° clockwise each step. After pointing up, it points right again.",
    },
    {
      id: "nvr1-q04",
      kind: "sequence",
      stem: "Which figure comes next in the sequence?",
      figureHtml: row(figLineCount(1), figLineCount(2), figLineCount(3), figLineCount(4)),
      options: optionsFrom([figLineCount(5), figLineCount(2), figLineCount(4), figBarCount(5), figDots(5)]),
      answer: "A",
      explanation: "One horizontal line is added each time. Five lines come next.",
    },
    {
      id: "nvr1-q05",
      kind: "sequence",
      stem: "Which figure comes next in the sequence?",
      figureHtml: row(figNested(1), figNested(2), figNested(3), figNested(4)),
      options: optionsFrom([figNested(5), figNested(3), figNested(1), svgFrame(square(45, 45, 40, fillGrey)), figCircleSquare("circle")]),
      answer: "A",
      explanation: "One nested square is added each step. Five nested squares follow.",
    },
    {
      id: "nvr1-q06",
      kind: "sequence",
      stem: "Which figure comes next in the sequence?",
      figureHtml: row(figClockHand(12), figClockHand(3), figClockHand(6), figClockHand(9)),
      options: optionsFrom([figClockHand(12), figClockHand(3), figClockHand(6), figClockHand(9), figArrowDir("up")]),
      answer: "A",
      explanation: "The hand moves a quarter-turn clockwise each time (12→3→6→9→12).",
    },
    {
      id: "nvr1-q07",
      kind: "sequence",
      stem: "Which figure comes next in the sequence?",
      figureHtml: row(figBarCount(1), figBarCount(2), figBarCount(3), figBarCount(4)),
      options: optionsFrom([figBarCount(5), figBarCount(3), figBarCount(1, false), figLineCount(5), figDots(4)]),
      answer: "A",
      explanation: "One vertical bar is added each time. Five bars come next.",
    },
    {
      id: "nvr1-q08",
      kind: "sequence",
      stem: "Which figure comes next in the sequence?",
      figureHtml: row(figShadedCircle(0), figShadedCircle(0.25), figShadedCircle(0.5), figShadedCircle(1)),
      options: optionsFrom([figShadedCircle(0), figShadedCircle(0.25), figShadedCircle(0.5), figShadedCircle(1), figHalfShade("left")]),
      answer: "A",
      explanation: "Shading increases then restarts empty: empty → quarter → half → full → empty again.",
    },
    {
      id: "nvr1-q09",
      kind: "rotation",
      stem: "The figure on the left is rotated. Which option shows a 90° clockwise rotation?",
      figureHtml: row(figTriangleRotate(0)),
      options: optionsFrom([figTriangleRotate(90), figTriangleRotate(180), figTriangleRotate(0), figTriangleRotate(270), figTriangleRotate(45)]),
      answer: "A",
      explanation: "A 90° clockwise turn points the triangle to the right.",
    },
    {
      id: "nvr1-q10",
      kind: "rotation",
      stem: "Which option shows the L-shape rotated 90° clockwise?",
      figureHtml: row(figLShape(0)),
      options: optionsFrom([figLShape(90), figLShape(180), figLShape(270), figLShape(0), figArrowDir("right")]),
      answer: "A",
      explanation: "Rotating the upright L (└) 90° clockwise gives ┌.",
    },
    {
      id: "nvr1-q11",
      kind: "rotation",
      stem: "Which option is the same shape rotated 180°?",
      figureHtml: row(figCornerDot("tl")),
      options: optionsFrom([figCornerDot("br"), figCornerDot("tr"), figCornerDot("bl"), figCornerDot("tl"), figDots(1)]),
      answer: "A",
      explanation: "A 180° turn moves the top-left dot to the bottom-right corner.",
    },
    {
      id: "nvr1-q12",
      kind: "rotation",
      stem: "The arrow rotates 90° clockwise each time. What comes next?",
      figureHtml: row(figArrowRotateSeq(0), figArrowRotateSeq(90), figArrowRotateSeq(180)),
      options: optionsFrom([figArrowRotateSeq(270), figArrowRotateSeq(0), figArrowRotateSeq(45), figArrowRotateSeq(180), figArrowRotateSeq(90)]),
      answer: "A",
      explanation: "After 0°, 90° and 180°, the next clockwise quarter-turn is 270°.",
    },
    {
      id: "nvr1-q13",
      kind: "rotation",
      stem: "Which option shows a 90° anti-clockwise rotation of the figure?",
      figureHtml: row(figLShape(90)),
      options: optionsFrom([figLShape(0), figLShape(180), figLShape(270), figLShape(90), figCornerDot("tl")]),
      answer: "A",
      explanation: "From ┌, a 90° anti-clockwise turn returns the L to └.",
    },
    {
      id: "nvr1-q14",
      kind: "rotation",
      stem: "Which option shows a 180° rotation of the figure?",
      figureHtml: row(figHalfShade("left")),
      options: optionsFrom([figHalfShade("right"), figHalfShade("top"), figHalfShade("bottom"), figShadedCircle(0.5), figHalfShade("left")]),
      answer: "A",
      explanation: "A 180° turn moves left shading to the right side.",
    },
    {
      id: "nvr1-q15",
      kind: "rotation",
      stem: "The triangle rotates 90° clockwise each step. Which comes next?",
      figureHtml: row(figTriangleRotate(0), figTriangleRotate(90), figTriangleRotate(180)),
      options: optionsFrom([figTriangleRotate(270), figTriangleRotate(0), figTriangleRotate(45), figTriangleRotate(90), figTriangleRotate(180)]),
      answer: "A",
      explanation: "Next quarter-turn after 180° is 270°.",
    },
    {
      id: "nvr1-q16",
      kind: "reflection",
      stem: "Which option is the mirror image of the figure in a vertical mirror (left–right flip)?",
      figureHtml: row(figLShape(0)),
      options: optionsFrom([figLShape(270), figLShape(90), figLShape(180), figLShape(0), figArrowDir("left")]),
      answer: "A",
      explanation: "A vertical mirror turns └ into ┘.",
    },
    {
      id: "nvr1-q17",
      kind: "reflection",
      stem: "Which option shows a reflection of the figure in a horizontal mirror (top–bottom flip)?",
      figureHtml: row(figCornerDot("tl")),
      options: optionsFrom([figCornerDot("bl"), figCornerDot("tr"), figCornerDot("br"), figCornerDot("tl"), figDots(1)]),
      answer: "A",
      explanation: "Flipping top to bottom moves the top-left dot to bottom-left.",
    },
    {
      id: "nvr1-q18",
      kind: "reflection",
      stem: "Which option is the left–right mirror image?",
      figureHtml: row(figCornerDot("tr")),
      options: optionsFrom([figCornerDot("tl"), figCornerDot("br"), figCornerDot("bl"), figCornerDot("tr"), figRingDot("E")]),
      answer: "A",
      explanation: "A vertical mirror swaps left and right: top-right becomes top-left.",
    },
    {
      id: "nvr1-q19",
      kind: "reflection",
      stem: "Which option is the reflection of the shaded figure in a vertical mirror?",
      figureHtml: row(figHalfShade("left")),
      options: optionsFrom([figHalfShade("right"), figHalfShade("left"), figHalfShade("top"), figHalfShade("bottom"), figShadedCircle(0.5)]),
      answer: "A",
      explanation: "Left shading becomes right shading under a vertical mirror.",
    },
    {
      id: "nvr1-q20",
      kind: "reflection",
      stem: "Which option is the reflection of the arrow in a vertical mirror?",
      figureHtml: row(figArrowDir("right")),
      options: optionsFrom([figArrowDir("left"), figArrowDir("right"), figArrowDir("up"), figArrowDir("down"), figArrowDir("upRight")]),
      answer: "A",
      explanation: "A left–right mirror turns a right-pointing arrow into a left-pointing arrow.",
    },
    {
      id: "nvr1-q21",
      kind: "reflection",
      stem: "Which option shows the figure reflected in a horizontal mirror?",
      figureHtml: row(figHalfShade("top")),
      options: optionsFrom([figHalfShade("bottom"), figHalfShade("top"), figHalfShade("left"), figHalfShade("right"), figShadedCircle(0.5)]),
      answer: "A",
      explanation: "Top shading becomes bottom shading under a horizontal mirror.",
    },
    {
      id: "nvr1-q22",
      kind: "matrix",
      stem: "Which option completes the 2×2 matrix?",
      figureHtml: matrixGrid([figCircleSquare("circle"), figCircleSquare("square"), figCircleSquare("dot"), "?"], 2),
      options: optionsFrom([figCircleSquare("both"), figDots(1), figShapesGrowing(1), figNested(1), figLineCount(1)]),
      answer: "A",
      explanation: "Pattern pairs outer square+circle, outer circle+square, outer square+dot, so outer circle+dot completes the set.",
    },
    {
      id: "nvr1-q23",
      kind: "matrix",
      stem: "Complete the 2×2 matrix. Each cell adds one bar in reading order.",
      figureHtml: matrixGrid([figBarCount(1), figBarCount(2), figBarCount(3), "?"], 2),
      options: optionsFrom([figBarCount(4), figBarCount(2), figBarCount(1), figBarCount(5), figLineCount(4)]),
      answer: "A",
      explanation: "Reading left-to-right, top-to-bottom: 1, 2, 3, then 4 bars.",
    },
    {
      id: "nvr1-q24",
      kind: "matrix",
      stem: "Complete the 2×2 matrix. The dot moves clockwise around the corners.",
      figureHtml: matrixGrid([figCornerDot("tl"), figCornerDot("tr"), figCornerDot("br"), "?"], 2),
      options: optionsFrom([figCornerDot("bl"), figCornerDot("tl"), figCornerDot("tr"), figCornerDot("br"), figDots(4)]),
      answer: "A",
      explanation: "Clockwise corners: TL → TR → BR → BL.",
    },
    {
      id: "nvr1-q25",
      kind: "matrix",
      stem: "Which option completes the 3×3 matrix? (Dot count increases by one across each row.)",
      figureHtml: matrixGrid([figDots(1), figDots(2), figDots(3), figDots(2), figDots(3), figDots(4), figDots(3), figDots(4), "?"], 3),
      options: optionsFrom([figDots(5), figDots(4), figDots(3), figDots(2), figDots(1)]),
      answer: "A",
      explanation: "Each row is n, n+1, n+2. Bottom row: 3, 4, 5.",
    },
    {
      id: "nvr1-q26",
      kind: "matrix",
      stem: "Complete the 2×2 matrix. Columns swap circle and square.",
      figureHtml: matrixGrid([figSizeShape("circle", "m"), figSizeShape("square", "m"), figSizeShape("square", "m"), "?"], 2),
      options: optionsFrom([figSizeShape("circle", "m"), figSizeShape("square", "s"), figSizeShape("triangle", "m"), figDots(1), figNested(2)]),
      answer: "A",
      explanation: "Top: circle → square, so bottom: square → circle.",
    },
    {
      id: "nvr1-q27",
      kind: "matrix",
      stem: "Complete the matrix: shading moves left → right → top → ?",
      figureHtml: matrixGrid([figHalfShade("left"), figHalfShade("right"), figHalfShade("top"), "?"], 2),
      options: optionsFrom([figHalfShade("bottom"), figHalfShade("left"), figHalfShade("right"), figHalfShade("top"), figShadedCircle(1)]),
      answer: "A",
      explanation: "Shading position cycles: left, right, top, bottom.",
    },
    {
      id: "nvr1-q28",
      kind: "matrix",
      stem: "Which option completes the 3×3 matrix of line counts?",
      figureHtml: matrixGrid([figLineCount(1), figLineCount(2), figLineCount(3), figLineCount(2), figLineCount(3), figLineCount(4), figLineCount(3), figLineCount(4), "?"], 3),
      options: optionsFrom([figLineCount(5), figLineCount(4), figLineCount(3), figLineCount(2), figLineCount(1)]),
      answer: "A",
      explanation: "Same additive row pattern: bottom row ends with 5 lines.",
    },
    {
      id: "nvr1-q29",
      kind: "odd-one-out",
      stem: "Which figure is the odd one out?",
      figureHtml: "",
      options: optionsFrom([figSizeShape("circle", "m"), figSizeShape("circle", "m"), figSizeShape("square", "m"), figSizeShape("circle", "m"), figSizeShape("circle", "m")]),
      answer: "C",
      explanation: "A, B, D and E are circles; C is a square.",
    },
    {
      id: "nvr1-q30",
      kind: "odd-one-out",
      stem: "Which figure is the odd one out?",
      figureHtml: "",
      options: optionsFrom([figArrowDir("up"), figArrowDir("down"), figArrowDir("left"), figArrowDir("right"), figPlusMinus("plus")]),
      answer: "E",
      explanation: "A–D are arrows; E is a plus sign with no arrowhead.",
    },
    {
      id: "nvr1-q31",
      kind: "odd-one-out",
      stem: "Which figure is the odd one out?",
      figureHtml: "",
      options: optionsFrom([figDots(3), figDots(3), figDots(3), figDots(4), figDots(3)]),
      answer: "D",
      explanation: "Four figures have three dots; D has four.",
    },
    {
      id: "nvr1-q32",
      kind: "odd-one-out",
      stem: "Which figure is the odd one out?",
      figureHtml: "",
      options: optionsFrom([figHalfShade("left"), figHalfShade("right"), figHalfShade("top"), figHalfShade("bottom"), figShadedCircle(0.5)]),
      answer: "E",
      explanation: "A–D are half-shaded squares; E is a half-shaded circle.",
    },
    {
      id: "nvr1-q33",
      kind: "odd-one-out",
      stem: "Which figure is the odd one out?",
      figureHtml: "",
      options: optionsFrom([figLShape(0), figLShape(90), figLShape(180), figLShape(270), figNested(2)]),
      answer: "E",
      explanation: "A–D are rotations of the same L-shape; E is nested squares.",
    },
    {
      id: "nvr1-q34",
      kind: "odd-one-out",
      stem: "Which figure is the odd one out?",
      figureHtml: "",
      options: optionsFrom([figRingDot("N"), figRingDot("E"), figRingDot("S"), figRingDot("W"), figRingDot("C")]),
      answer: "E",
      explanation: "In A–D the dot sits on the ring’s edge; in E the dot is in the centre.",
    },
    {
      id: "nvr1-q35",
      kind: "odd-one-out",
      stem: "Which figure is the odd one out?",
      figureHtml: "",
      options: optionsFrom([figTwoShapes("circle", "square"), figTwoShapes("circle", "square"), figTwoShapes("circle", "square"), figTwoShapes("square", "circle"), figTwoShapes("circle", "square")]),
      answer: "D",
      explanation: "Most show circle then square left-to-right; D reverses the order.",
    },
    {
      id: "nvr1-q36",
      kind: "spatial",
      stem: "If the square paper is folded in half left-to-right and a hole is punched in the top-left of the folded sheet, where do holes appear when unfolded?",
      figureHtml: row(figGridDots("100000000")),
      options: optionsFrom([figGridDots("100100000"), figGridDots("100000000"), figGridDots("000000001"), figGridDots("010010000"), figGridDots("111000000")]),
      answer: "A",
      explanation: "A left–right fold mirrors the punch: hole at top-left also appears at top-right.",
    },
    {
      id: "nvr1-q37",
      kind: "spatial",
      stem: "Which figure shows the same arrangement after sliding the left shape to the right of the other (order reversed)?",
      figureHtml: row(figTwoShapes("triangle", "circle")),
      options: optionsFrom([figTwoShapes("circle", "triangle"), figTwoShapes("triangle", "circle"), figTwoShapes("square", "circle"), figTwoShapes("circle", "square"), figTwoShapes("triangle", "square")]),
      answer: "A",
      explanation: "Reversing left–right order: triangle–circle becomes circle–triangle.",
    },
    {
      id: "nvr1-q38",
      kind: "spatial",
      stem: "A strip of four squares has a black dot on the leftmost panel. When that panel becomes the front face of a folded packet, which marking matches?",
      figureHtml: row(svgFrame(`${rect(10, 35, 17, 20, fillWht)}${rect(28, 35, 17, 20, fillWht)}${rect(46, 35, 17, 20, fillWht)}${rect(64, 35, 17, 20, fillWht)}${dot(18, 45, 3)}`)),
      options: optionsFrom([
        svgFrame(`${square(45, 45, 40, fillWht)}${dot(45, 45, 5)}`),
        svgFrame(`${square(45, 45, 40, fillWht)}`),
        figDots(2),
        figCornerDot("tl"),
        figRingDot("C"),
      ]),
      answer: "A",
      explanation: "When that panel becomes the front face, a single black dot remains visible on the front square.",
    },
    {
      id: "nvr1-q39",
      kind: "spatial",
      stem: "Which option shows the figure after a flip over a vertical axis?",
      figureHtml: row(figHalfShade("left")),
      options: optionsFrom([figHalfShade("right"), figHalfShade("left"), figHalfShade("top"), figHalfShade("bottom"), figShadedCircle(0.5)]),
      answer: "A",
      explanation: "A vertical flip moves left shading to the right side.",
    },
    {
      id: "nvr1-q40",
      kind: "spatial",
      stem: "Three blocks sit in a row: circle, square, triangle. After the left block is moved to the far right, which order remains?",
      figureHtml: row(_c(), _s(), _t()),
      options: optionsFrom([
        orderBlock(_s(), _t(), _c()),
        orderBlock(_c(), _s(), _t()),
        orderBlock(_t(), _s(), _c()),
        orderBlock(_s(), _c(), _t()),
        orderBlock(_c(), _t(), _s()),
      ]),
      answer: "A",
      explanation: "Moving the leftmost circle to the far right leaves square, triangle, circle.",
    },
  ],
};

/** Spread correct answers evenly across A–E without changing question logic. */
function redistributeAnswers(paper, targets) {
  const labelRe = /(<div class="nvr-choice"><div>)[A-EX](<\/div>)/;
  const setLabel = (html, letter) => html.replace(labelRe, `$1${letter}$2`);
  for (let i = 0; i < paper.questions.length; i++) {
    const q = paper.questions[i];
    const target = targets[i];
    const cur = q.answer.charCodeAt(0) - 65;
    const tgt = target.charCodeAt(0) - 65;
    if (cur === tgt) {
      q.options = q.options.map((o, idx) => setLabel(o, String.fromCharCode(65 + idx)));
      continue;
    }
    const bodies = q.options.map((o) => setLabel(o, "X"));
    const tmp = bodies[tgt];
    bodies[tgt] = bodies[cur];
    bodies[cur] = tmp;
    q.options = bodies.map((o, idx) => setLabel(o, String.fromCharCode(65 + idx)));
    q.answer = target;
  }
}

redistributeAnswers(nonverbalPaper1, [
  "A","C","B","E","D","B","A","C","E","D",
  "B","A","C","E","D","B","A","C","E","D",
  "A","B","C","D","E","A","B","C","D","E",
  "A","B","C","D","E","B","C","D","E","A",
]);
