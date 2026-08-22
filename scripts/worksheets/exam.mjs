/** Shared helpers for exam-style JD Science worksheets. */

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const STUDENTS = {
  AQA: ["Amira", "Ben", "Chloe"],
  Edexcel: ["Devon", "Elena", "Farid"],
  OCR: ["Grace", "Hari", "Isla"],
  Eduqas: ["Jac", "Kira", "Llio"],
  WJEC: ["Owain", "Nia", "Rhys"],
};

const TOWNS = {
  AQA: "Keswick",
  Edexcel: "Gravesend",
  OCR: "Worcester",
  Eduqas: "Cardiff",
  WJEC: "Swansea",
};

export function contextFor(offering) {
  const names = STUDENTS[offering.board] || STUDENTS.AQA;
  const offset = { AQA: 0, Edexcel: 1, OCR: 2, Eduqas: 3, WJEC: 4 }[offering.board] || 0;
  return {
    ...offering,
    student: names[0],
    student2: names[1],
    student3: names[2],
    town: TOWNS[offering.board] || "Leeds",
    offset,
    n(base, step = 1) {
      return base + offset * step;
    },
    dec(base, step = 0.1) {
      return Number((base + offset * step).toFixed(3));
    },
  };
}

export function shortQ(stem, marks, points) {
  return {
    stem,
    marks,
    parts: [],
    answers: [{ label: "", marks, points: Array.isArray(points) ? points : [points] }],
  };
}

export function partsQ(stem, parts) {
  return {
    stem,
    marks: parts.reduce((sum, part) => sum + part.marks, 0),
    parts: parts.map((part) => ({
      label: part.label,
      marks: part.marks,
      text: part.text,
    })),
    answers: parts.map((part) => ({
      label: part.label,
      marks: part.marks,
      points: Array.isArray(part.points) ? part.points : [part.points],
    })),
  };
}

export function calcQ(stem, marks, answerLine, methodPoints = []) {
  return shortQ(stem, marks, [...methodPoints, `Final answer: ${answerLine}`]);
}

export function totalMarks(questions) {
  return questions.reduce((sum, question) => {
    if (question.parts?.length) {
      return sum + question.parts.reduce((partSum, part) => partSum + part.marks, 0);
    }
    return sum + (question.marks || 0);
  }, 0);
}

export function padToThirtyTwo(questions, extras) {
  const out = [...questions];
  let i = 0;
  while (out.length < 32 && extras.length) {
    out.push(extras[i % extras.length]);
    i += 1;
    if (i > 200) break;
  }
  if (out.length < 30) {
    throw new Error(`Worksheet only has ${out.length} questions`);
  }
  return out.slice(0, Math.max(32, Math.min(out.length, 36)));
}
