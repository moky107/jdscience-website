import { shortQ, partsQ, calcQ, padToThirtyTwo } from "./exam.mjs";

/**
 * Build at least 32 exam-style questions from a topic pack.
 * Pack shape:
 * {
 *   facts: [{ term, define, describe, explain, apply }],
 *   calcs: [{ stem, answer, marks, method: [] }],
 *   practicals: [{ name, method, iv, dv, control, error }],
 *   compares: [{ a, b, points: [] }],
 *   extended: [{ title, points: [] }]
 * }
 */
export function composeScience(ctx, pack) {
  const facts = pack.facts || [];
  const calcs = pack.calcs || [];
  const practicals = pack.practicals || [];
  const compares = pack.compares || [];
  const extended = pack.extended || [];
  const extras = pack.extras || [];

  const questions = [];

  facts.slice(0, 10).forEach((fact) => {
    questions.push(shortQ(
      `State what is meant by ${fact.term}.`,
      1,
      fact.define,
    ));
  });

  facts.slice(0, 6).forEach((fact) => {
    questions.push(partsQ(
      `${ctx.student} is asked about ${fact.term} in a ${ctx.board} ${ctx.subject} paper.`,
      [
        { label: "a", marks: 2, text: `Describe ${fact.term}.`, points: fact.describe || fact.define },
        { label: "b", marks: 3, text: `Explain ${fact.explainPrompt || `why ${fact.term} is important in this topic`}.`, points: fact.explain || fact.apply || fact.define },
      ],
    ));
  });

  calcs.slice(0, 6).forEach((calc) => {
    questions.push(calcQ(calc.stem, calc.marks || 3, calc.answer, calc.method || []));
  });

  practicals.slice(0, 4).forEach((practical) => {
    questions.push(partsQ(
      `${ctx.student} carries out ${practical.name}. This is a typical ${ctx.board} required-practical style question.`,
      [
        { label: "a", marks: 2, text: "Identify the independent variable and the dependent variable.", points: [`Independent: ${practical.iv}`, `Dependent: ${practical.dv}`] },
        { label: "b", marks: 2, text: "State one control variable and explain why it must be controlled.", points: [`${practical.control}`, "so the test is fair / only one variable is changed"] },
        { label: "c", marks: 2, text: "Suggest one improvement or source of error and how it affects the result.", points: practical.error },
      ],
    ));
  });

  compares.slice(0, 4).forEach((pair) => {
    questions.push(shortQ(
      `Compare ${pair.a} with ${pair.b}.`,
      4,
      pair.points,
    ));
  });

  facts.slice(6, 10).forEach((fact) => {
    questions.push(shortQ(
      fact.applyPrompt || `Apply your knowledge of ${fact.term} to this situation: ${fact.apply || fact.describe}`,
      3,
      fact.apply || fact.explain || fact.define,
    ));
  });

  extended.slice(0, 2).forEach((item) => {
    questions.push(shortQ(
      `${item.title} [6 marks]`,
      6,
      item.points,
    ));
  });

  extras.forEach((item) => questions.push(item));

  return padToThirtyTwo(questions, extras.length ? extras : facts.slice(0, 8).map((fact) => (
    shortQ(`Give one exam tip for a question about ${fact.term}.`, 1, [`Use the ${ctx.board} command word; include ${fact.term} and a linked explanation`])
  )));
}
