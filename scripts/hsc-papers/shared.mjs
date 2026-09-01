export function part(label, text, marks, points) {
  return {
    label,
    text,
    marks,
    points: Array.isArray(points) ? points : [points],
  };
}

export function question(number, context, parts) {
  const marks = parts.reduce((sum, item) => sum + item.marks, 0);
  return { number, context, parts, marks };
}

export function paper({ id, unit, unitTitle, setLabel, time, totalMarks, questions }) {
  const counted = questions.reduce((sum, item) => sum + item.marks, 0);
  if (counted !== totalMarks) {
    throw new Error(`${id} totals ${counted} marks, expected ${totalMarks}`);
  }
  return {
    id,
    unit,
    unitTitle,
    setLabel,
    time,
    totalMarks,
    questions,
    studentFile: `JDScience_BTEC_HSC_Unit${unit}_Practice_${setLabel}.pdf`,
    markSchemeFile: `JDScience_BTEC_HSC_Unit${unit}_Practice_${setLabel}_Mark_Scheme.pdf`,
  };
}
