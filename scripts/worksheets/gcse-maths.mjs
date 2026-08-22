import { shortQ, partsQ, calcQ } from "./exam.mjs";

function sf(value, digits) {
  return Number(Number(value).toPrecision(digits));
}

export function buildGcseMaths(topicId, ctx) {
  const builders = {
    number: numberQs,
    algebra: algebraQs,
    "ratio-proportion": ratioQs,
    "geometry-measures": geometryQs,
    probability: probabilityQs,
    statistics: statisticsQs,
  };
  const build = builders[topicId];
  if (!build) throw new Error(`Unknown GCSE Maths topic ${topicId}`);
  const questions = build(ctx);
  if (questions.length < 30) throw new Error(`GCSE Maths ${topicId} has ${questions.length} questions`);
  return questions.slice(0, 32);
}

function numberQs(ctx) {
  const a = ctx.n(36, 2);
  const b = ctx.n(48, 3);
  const p = ctx.n(240, 20);
  const rate = ctx.n(4, 0.5);
  const years = 3;
  const compound = p * ((1 + rate / 100) ** years);
  const std1 = ctx.n(3.6, 0.2);
  const std2 = ctx.n(4.8, 0.1);
  const addStd = (std1 * 1e5) + (std2 * 1e4);
  const rec = ctx.n(27, 1); // 0.272727... style via 27/99 if 27
  const bound = ctx.n(6.4, 0.1);
  const upper = bound + 0.05;
  const lower = bound - 0.05;
  const length = ctx.n(12.0, 0.2);
  const width = ctx.n(5.0, 0.1);
  const areaUpper = (length + 0.05) * (width + 0.05);

  return [
    calcQ(`Write ${a * 12} as a product of prime factors.`, 2, `${factorize(a * 12)}`, ["Use a factor tree / repeated division"]),
    calcQ(`Find the HCF and LCM of ${a} and ${b}.`, 3, `HCF = ${hcf(a, b)}, LCM = ${lcm(a, b)}`, ["HCF from common primes; LCM from all primes to highest power"]),
    calcQ(`Work out (${std1} × 10⁵) + (${std2} × 10⁴). Give your answer in standard form.`, 3, `${(addStd / 10 ** Math.floor(Math.log10(addStd))).toFixed(2)} × 10^${Math.floor(Math.log10(addStd))}`, ["Convert to the same power of 10, then add"]),
    calcQ(`Work out (${std1} × 10⁴) × (${std2} × 10⁻³). Give your answer in standard form.`, 2, `${sf(std1 * std2, 3)} × 10^${1}`, ["Multiply numbers and add indices"]),
    calcQ(`Convert 0.${String(rec).padStart(2, "0")}${String(rec).padStart(2, "0")}... to a fraction in its simplest form.`, 3, `${rec / hcf(rec, 99)}/${99 / hcf(rec, 99)}`, ["Let x = recurring decimal, 100x − x = integer"]),
    shortQ(`${bound} cm has been rounded to 1 decimal place. Write the error interval.`, 2, [`${lower} ≤ actual value < ${upper}`]),
    calcQ(`A rectangle is measured as ${length.toFixed(1)} cm by ${width.toFixed(1)} cm, each to 1 d.p. Work out the upper bound of the area.`, 3, `${areaUpper.toFixed(3)} cm²`, ["Upper length × upper width"]),
    calcQ(`A jacket is reduced by 20% in a sale and now costs £${ctx.n(48, 2)}. Work out the original price.`, 3, `£${(ctx.n(48, 2) / 0.8).toFixed(2)}`, ["Reverse percentage: sale price ÷ 0.8"]),
    calcQ(`${ctx.student} invests £${p} at ${rate}% compound interest for ${years} years. Work out the value of the investment.`, 3, `£${compound.toFixed(2)}`, [`${p} × (1 + ${rate}/100)^${years}`]),
    calcQ(`The same £${p} is invested at ${rate}% simple interest for ${years} years. Work out the interest earned.`, 2, `£${(p * rate * years / 100).toFixed(2)}`, ["I = PRT/100"]),
    calcQ(`A car worth £${ctx.n(8000, 200)} depreciates by 15% a year for 2 years. Find its value after 2 years.`, 3, `£${(ctx.n(8000, 200) * 0.85 ** 2).toFixed(2)}`, ["Multiply by 0.85 twice"]),
    calcQ(`Work out 2 3/4 + 1 5/6. Give your answer as a mixed number.`, 3, "4 7/12", ["Convert to improper fractions, LCD 12"]),
    calcQ(`Work out 3 1/5 ÷ 2/3.`, 3, "4 4/5", ["16/5 × 3/2 = 48/10 = 24/5"]),
    shortQ("Write down the reciprocal of 0.2", 1, ["5"]),
    calcQ(`Simplify √${ctx.n(72, 8)}.`, 2, simplifySurd(ctx.n(72, 8)), ["Write as a product with a square factor"]),
    calcQ(`Rationalise the denominator of 6 / √${ctx.n(12, 3)}.`, 3, rationalise(6, ctx.n(12, 3)), ["Multiply numerator and denominator by the surd"]),
    calcQ(`Work out 3⁷ ÷ 3⁴.`, 1, "3³ or 27", ["Subtract indices"]),
    calcQ("Work out 5⁻².", 2, "1/25", ["Negative index means reciprocal"]),
    calcQ("Work out 27^(2/3).", 2, "9", ["Cube root of 27 is 3, then square"]),
    calcQ(`Estimate (39.6 × ${ctx.n(18.2, 0.4)}) ÷ 7.9 by rounding each number to 1 significant figure.`, 2, String(Math.round((40 * Math.round(ctx.n(18.2, 0.4))) / 8)), ["40 × rounded value ÷ 8"]),
    shortQ("Write 7/8 as a decimal and as a percentage.", 2, ["0.875", "87.5%"]),
    calcQ(`Share £${ctx.n(180, 20)} in the ratio 2 : 3 : 5.`, 3, shareRatio(ctx.n(180, 20), [2, 3, 5]), ["Total parts = 10"]),
    calcQ(`Round 0.04682 to 2 significant figures.`, 1, "0.047", ["2nd sf is 6, next digit 8 so round up"]),
    calcQ(`Work out (2.5 × 10⁷) ÷ (5 × 10³) in standard form.`, 2, "5 × 10³", ["Divide numbers, subtract indices"]),
    calcQ(`A shop buys a lamp for £${ctx.n(20, 2)} and sells it for £${ctx.n(28, 2)}. Work out the percentage profit.`, 2, `${(((ctx.n(28, 2) - ctx.n(20, 2)) / ctx.n(20, 2)) * 100).toFixed(0)}%`, ["Profit ÷ cost × 100"]),
    calcQ(`Simplify (√${ctx.n(8, 2)} + √2)(√${ctx.n(8, 2)} − √2).`, 3, String(ctx.n(8, 2) - 2), ["Difference of two squares"]),
    partsQ(`${ctx.student} writes 4.7 × 10ⁿ = 0.00047.`, [
      { label: "a", marks: 1, text: "Find n.", points: ["n = −4"] },
      { label: "b", marks: 2, text: "Write 470 000 in standard form.", points: ["4.7 × 10⁵"] },
    ]),
    calcQ(`A number x is given as ${ctx.n(80, 5)} to the nearest 10. Find the lower bound of 1000 / x.`, 3, (1000 / (ctx.n(80, 5) + 5)).toFixed(3), ["To minimise 1000/x use the upper bound of x"]),
    shortQ("Explain the difference between a terminating decimal and a recurring decimal. Give an example of each.", 3, ["Terminating stops, e.g. 0.25", "Recurring repeats, e.g. 1/3 = 0.333..."]),
    calcQ(`Work out 1 1/2 × 2 2/3.`, 3, "4", ["3/2 × 8/3 = 4"]),
    partsQ("Here is a number machine: input → × 4 → − 7 → output.", [
      { label: "a", marks: 1, text: "Find the output when the input is 5.", points: ["13"] },
      { label: "b", marks: 2, text: "The output is 29. Find the input.", points: ["(29 + 7) ÷ 4 = 9"] },
    ]),
    shortQ(`In a ${ctx.board} calculator paper, a student writes 3.6 × 10⁴ + 2.1 × 10³ = 5.7 × 10⁷. Explain the mistake and give the correct answer in standard form.`, 3, ["Powers of 10 were added incorrectly / numbers not converted to the same power", "Correct: 3.81 × 10⁴"]),
  ];
}

function algebraQs(ctx) {
  const m = ctx.n(3, 1);
  const c = ctx.n(2, 1);
  const A = ctx.n(5, 1);
  const B = ctx.n(4, 1);
  return [
    calcQ(`Expand and simplify 3(x + ${c}) + 2(x − 1).`, 2, `5x + ${3 * c - 2}`, ["Expand then collect like terms"]),
    calcQ(`Expand (x + ${m})(x + ${c}).`, 2, `x² + ${m + c}x + ${m * c}`, ["FOIL"]),
    calcQ(`Factorise x² + ${m + c}x + ${m * c}.`, 2, `(x + ${m})(x + ${c})`, ["Two numbers that multiply to c term and add to x term"]),
    calcQ(`Factorise fully 6x² + 9x.`, 2, "3x(2x + 3)", ["Highest common factor 3x"]),
    calcQ(`Solve 5x − ${c} = ${ctx.n(18, 2)}.`, 2, `x = ${(ctx.n(18, 2) + c) / 5}`, ["Add, then divide"]),
    calcQ(`Solve ${m}x + 7 = ${m + 2}x − 3.`, 3, `x = ${10 / 2}`, ["Collect x terms on one side"]),
    partsQ(`Solve the inequality 2x + 1 < ${ctx.n(11, 1)}.`, [
      { label: "a", marks: 2, text: "Solve the inequality.", points: [`x < ${(ctx.n(11, 1) - 1) / 2}`] },
      { label: "b", marks: 1, text: "Represent the solution on a number line.", points: ["Open circle at the critical value, arrow to the left"] },
    ]),
    calcQ(`Solve the simultaneous equations: y = 2x + 1 and 3x + y = ${ctx.n(11, 1)}.`, 3, `x = ${(ctx.n(11, 1) - 1) / 5}, y = ${2 * ((ctx.n(11, 1) - 1) / 5) + 1}`, ["Substitute y into the second equation"]),
    calcQ(`Solve x² − 5x + 6 = 0.`, 3, "x = 2 or x = 3", ["Factorise (x − 2)(x − 3)"]),
    calcQ(`Solve x² + 4x − 2 = 0. Give answers in surd form.`, 3, "x = −2 ± √6", ["Quadratic formula / complete the square"]),
    calcQ(`Complete the square for x² + 6x + 5.`, 3, "(x + 3)² − 4", ["Half of 6 is 3"]),
    calcQ(`The nth term of a sequence is ${m}n + ${c}. Find the first 3 terms and the 20th term.`, 3, `${m + c}, ${2 * m + c}, ${3 * m + c}; 20th = ${20 * m + c}`, ["Substitute n = 1, 2, 3, 20"]),
    shortQ("Here is a sequence: 5, 8, 11, 14, … Find the nth term.", 2, ["3n + 2"]),
    calcQ(`Rearrange v = u + at to make t the subject.`, 2, "t = (v − u)/a", ["Subtract u, divide by a"]),
    calcQ(`Rearrange A = 2πr(r + h) to make h the subject.`, 3, "h = A/(2πr) − r", ["Divide by 2πr then subtract r"]),
    calcQ(`Simplify (3x²y)³.`, 2, "27x⁶y³", ["Cube each factor; multiply indices"]),
    calcQ(`Simplify (8x⁶)¹/³.`, 2, "2x²", ["Cube root of 8 is 2; divide index by 3"]),
    calcQ(`f(x) = ${m}x − 1. Find f(4) and f⁻¹(x).`, 3, `f(4) = ${4 * m - 1}; f⁻¹(x) = (x + 1)/${m}`, ["Swap x and y, rearrange"]),
    calcQ(`Solve 2^{x} = 32.`, 2, "x = 5", ["32 = 2⁵"]),
    calcQ(`The line L has gradient ${m} and passes through (0, ${c}). Write the equation of L.`, 2, `y = ${m}x + ${c}`, ["y = mx + c"]),
    calcQ(`Find the equation of the line through (2, ${A}) and (6, ${A + 8}).`, 3, `y = 2x + ${A - 4}`, ["Gradient = 8/4 = 2, then substitute a point"]),
    calcQ(`Expand (2x − 3)².`, 2, "4x² − 12x + 9", ["(2x − 3)(2x − 3)"]),
    calcQ(`Simplify (x² − 9)/(x − 3), x ≠ 3.`, 2, "x + 3", ["Difference of two squares"]),
    partsQ(`${ctx.student} solves 3(x − 2) = 12 and writes x − 2 = 12, so x = 14.`, [
      { label: "a", marks: 1, text: "Explain the mistake.", points: ["Did not divide 12 by 3 / expanded incorrectly"] },
      { label: "b", marks: 2, text: "Work out the correct solution.", points: ["x − 2 = 4", "x = 6"] },
    ]),
    calcQ(`Solve |2x − 1| = 7.`, 3, "x = 4 or x = −3", ["2x − 1 = 7 or 2x − 1 = −7"]),
    calcQ(`The quadratic graph y = x² − 4x + 3 crosses the x-axis at A and B. Find the coordinates of A and B.`, 3, "(1, 0) and (3, 0)", ["Factorise (x − 1)(x − 3)"]),
    shortQ(`Sketch y = (x + 2)(x − 4), showing intercepts.`, 4, ["x-intercepts −2 and 4", "y-intercept −8", "U-shaped parabola"]),
    calcQ(`Work out the 5th triangular number and show that the nth triangular number is n(n + 1)/2 for n = 5.`, 2, "15", ["1+2+3+4+5 = 15 and 5×6/2 = 15"]),
    calcQ(`Solve 4x² = 64.`, 2, "x = 4 or x = −4", ["x² = 16"]),
    calcQ(`If p is directly proportional to q and p = ${A} when q = 2, find p when q = 8.`, 3, String(A * 4), ["p = kq, k = A/2, p = 4A"]),
    calcQ(`Simplify 2(x + ${B}) − (x − ${B}).`, 2, `x + ${3 * B}`, ["Watch the minus sign in front of the second bracket"]),
    shortQ(`On a ${ctx.board} paper, a 3-mark algebra question usually needs a method mark. Write two things an examiner looks for when you solve a quadratic.`, 2, ["Correct factorisation or formula substitution", "Both solutions, including the negative root if it exists"]),
  ];
}

function ratioQs(ctx) {
  const speed = ctx.n(48, 4);
  const timeH = 2.5;
  const dist = speed * timeH;
  const scale = ctx.n(25000, 5000);
  return [
    calcQ(`Share £${ctx.n(96, 12)} in the ratio 3 : 5.`, 2, shareRatio(ctx.n(96, 12), [3, 5]), ["Total parts 8"]),
    calcQ(`A recipe for 8 people uses ${ctx.n(200, 20)} g of flour. How much flour is needed for 12 people?`, 2, `${(ctx.n(200, 20) * 12) / 8} g`, ["Unitary method or × 1.5"]),
    calcQ(`It takes 6 workers 8 hours to decorate a room. How long would 4 workers take, at the same rate?`, 3, "12 hours", ["Inverse proportion: 6×8 = 4×t"]),
    calcQ(`A car travels ${dist} miles at ${speed} mph. How long does the journey take?`, 2, `${timeH} hours`, ["t = d/s"]),
    calcQ(`Convert ${speed} mph to km/h. Use 1 mile = 1.6 km.`, 2, `${(speed * 1.6).toFixed(1)} km/h`, ["Multiply by 1.6"]),
    calcQ(`A map has scale 1 : ${scale}. Two towns are 4.8 cm apart on the map. Work out the real distance in km.`, 3, `${((4.8 * scale) / 100000).toFixed(2)} km`, ["Multiply by the scale, convert cm to km"]),
    calcQ(`£1 = $${ctx.dec(1.25, 0.05).toFixed(2)}. Convert £${ctx.n(60, 10)} to dollars.`, 2, `$${(ctx.n(60, 10) * ctx.dec(1.25, 0.05)).toFixed(2)}`, ["Multiply"]),
    calcQ(`A recipe is in the ratio flour : sugar : butter = 5 : 2 : 3. ${ctx.student} uses 200 g of flour. How much sugar is used?`, 2, "80 g", ["200/5 = 40 g per part"]),
    calcQ(`The ratio of boys to girls in a class is 3 : 5. There are 20 girls. How many boys are there?`, 2, "12", ["20/5 × 3"]),
    calcQ(`The ratio of red to blue counters is 2 : 7. There are 20 red counters. How many blue counters?`, 2, "70", ["20/2 × 7"]),
    calcQ(`y is directly proportional to x. y = 12 when x = 4. Find y when x = 10.`, 3, "30", ["y = 3x"]),
    calcQ(`y is inversely proportional to x. y = 8 when x = 5. Find y when x = 2.`, 3, "20", ["y = 40/x"]),
    calcQ(`A tap fills a tank in 6 hours. A second tap fills it in 3 hours. How long if both taps are open?`, 3, "2 hours", ["1/6 + 1/3 = 1/2"]),
    calcQ(`Increase £${ctx.n(80, 10)} by 15%.`, 2, `£${(ctx.n(80, 10) * 1.15).toFixed(2)}`, ["× 1.15"]),
    calcQ(`Decrease £${ctx.n(80, 10)} by 15%.`, 2, `£${(ctx.n(80, 10) * 0.85).toFixed(2)}`, ["× 0.85"]),
    calcQ(`A population of ${ctx.n(2000, 100)} grows by 4% each year. Estimate the population after 3 years.`, 3, String(Math.round(ctx.n(2000, 100) * 1.04 ** 3)), ["Compound growth"]),
    calcQ(`Density = mass ÷ volume. A block of mass ${ctx.n(240, 20)} g has volume 30 cm³. Find the density.`, 2, `${(ctx.n(240, 20) / 30).toFixed(2)} g/cm³`, ["D = m/v"]),
    calcQ(`Pressure = force ÷ area. A force of ${ctx.n(120, 20)} N acts on an area of 0.4 m². Find the pressure.`, 2, `${(ctx.n(120, 20) / 0.4).toFixed(1)} N/m²`, ["P = F/A"]),
    calcQ(`A speed camera records 90 km in 1 hour 15 minutes. Work out the average speed in km/h.`, 3, "72 km/h", ["90 ÷ 1.25"]),
    calcQ(`Convert 2 hours 24 minutes to hours as a decimal, then find the distance at 50 mph.`, 3, "120 miles", ["2.4 hours × 50"]),
    shortQ("Which of these is inverse proportion: cost vs number of items at a fixed unit price, or time vs number of workers for a fixed job? Explain.", 3, ["Time vs workers is inverse", "More workers, less time"]),
    calcQ(`A metal bar is 1.2 m long. It is cut in the ratio 5 : 7. Find the two lengths.`, 3, "50 cm and 70 cm", ["1.2 m = 120 cm, 12 parts"]),
    calcQ(`Best buy: 4 cans for £2.40 or 6 cans for £3.30. Which is better value?`, 3, "6 for £3.30 (55p each vs 60p)", ["Unit cost"]),
    calcQ(`A currency conversion charges 3% commission. ${ctx.student} changes £${ctx.n(400, 50)}. How much is left to convert?`, 2, `£${(ctx.n(400, 50) * 0.97).toFixed(2)}`, ["× 0.97"]),
    calcQ(`Scale 1 : 50 000. A road is 3 km long. How long is it on the map in cm?`, 3, "6 cm", ["3 km = 300 000 cm; ÷ 50 000"]),
    partsQ("A graph shows a straight line through (0, 0) and (4, 10).", [
      { label: "a", marks: 1, text: "Explain why this could be direct proportion.", points: ["Straight line through the origin"] },
      { label: "b", marks: 2, text: "Find the constant of proportionality.", points: ["k = 10/4 = 2.5"] },
    ]),
    calcQ(`Mix orange paint in the ratio red : yellow = 2 : 5. How much yellow is needed with 300 ml of red?`, 2, "750 ml", ["300/2 × 5"]),
    calcQ(`A cyclist rides 18 km in 40 minutes. Work out the speed in km/h.`, 2, "27 km/h", ["18 ÷ (2/3)"]),
    shortQ("Write the formula triangle for speed, distance and time, and state two rearranged formulae.", 3, ["s = d/t", "d = st", "t = d/s"]),
    calcQ(`y ∝ x² and y = 12 when x = 2. Find y when x = 5.`, 3, "75", ["y = 3x²"]),
    shortQ(`On ${ctx.board} papers, ratio questions often hide a reverse-percentage step. A price is increased by 10% to £132. Show how to find the original price.`, 3, ["132 ÷ 1.10 = £120"]),
  ];
}

function geometryQs(ctx) {
  const r = ctx.n(7, 1);
  const l = ctx.n(10, 1);
  const w = ctx.n(6, 1);
  return [
    calcQ(`A triangle has sides 5 cm, 12 cm and 13 cm. Show that it is right-angled.`, 3, "5²+12²=13² = 169", ["Pythagoras converse"]),
    calcQ(`Find the length of the hypotenuse of a right-angled triangle with legs ${l} cm and ${w} cm.`, 3, `${Math.hypot(l, w).toFixed(2)} cm`, ["√(l² + w²)"]),
    calcQ(`A circle has radius ${r} cm. Find the circumference. Use π = 3.14.`, 2, `${(2 * 3.14 * r).toFixed(2)} cm`, ["C = 2πr"]),
    calcQ(`The same circle has radius ${r} cm. Find the area. Use π = 3.14.`, 2, `${(3.14 * r * r).toFixed(2)} cm²`, ["A = πr²"]),
    calcQ(`A rectangle is ${l} cm by ${w} cm. Find the area and the perimeter.`, 2, `Area ${l * w} cm², perimeter ${2 * (l + w)} cm`, []),
    calcQ(`Find the volume of a cuboid ${l} cm × ${w} cm × 4 cm.`, 2, `${l * w * 4} cm³`, ["lwh"]),
    calcQ(`A cylinder has radius 3 cm and height ${l} cm. Find the volume. Leave π in your answer.`, 3, `${9 * l}π cm³`, ["πr²h"]),
    calcQ(`The area of a trapezium is ½(a + b)h. a = ${ctx.n(8, 1)}, b = ${ctx.n(12, 1)}, h = 5. Find the area.`, 2, `${0.5 * (ctx.n(8, 1) + ctx.n(12, 1)) * 5} cm²`, []),
    shortQ("Describe the transformation that maps triangle A onto triangle B if B is a reflection of A in the line x = 2.", 2, ["Reflection in the line x = 2"]),
    shortQ("A shape is enlarged by scale factor 3 from the origin. What happens to lengths and to area?", 3, ["Lengths × 3", "Area × 9"]),
    calcQ(`A map scale is 1 : 200. A path is 8 cm on the map. Find the real length in metres.`, 2, "16 m", ["8 × 200 = 1600 cm = 16 m"]),
    calcQ(`Find the interior angle of a regular hexagon.`, 2, "120°", ["(6−2)×180 / 6"]),
    calcQ(`The exterior angle of a regular polygon is 30°. How many sides does it have?`, 2, "12", ["360 ÷ 30"]),
    calcQ(`Work out the missing angle in a triangle with angles 47° and ${ctx.n(62, 2)}°.`, 1, `${180 - 47 - ctx.n(62, 2)}°`, ["Angles in a triangle sum to 180°"]),
    calcQ(`Corresponding angles on parallel lines: one is ${ctx.n(70, 3)}°. Write the corresponding angle and an allied/co-interior angle.`, 2, [`Corresponding ${ctx.n(70, 3)}°`, `Co-interior ${180 - ctx.n(70, 3)}°`]),
    calcQ(`A sector has radius ${r} cm and angle 90°. Find the arc length. Leave π in your answer.`, 3, `${(90 / 360) * 2}πr = ${r / 2}π cm`, ["Fraction of the circumference"]),
    calcQ(`Find the area of the same 90° sector. Leave π in your answer.`, 2, `${(r * r) / 4}π cm²`, ["Quarter of πr²"]),
    calcQ(`SOHCAHTOA: in a right triangle, opposite = 5, hypotenuse = 13. Find sin θ.`, 2, "5/13", []),
    calcQ(`A right-angled triangle has an angle of 30° and the opposite side is 8 cm. Find the hypotenuse.`, 2, "16 cm", ["sin 30° = 1/2 = opposite/hypotenuse"]),
    calcQ(`A ladder of length 5 m leans against a wall. The foot is 1.4 m from the wall. How high up the wall does it reach?`, 3, `${Math.sqrt(25 - 1.96).toFixed(2)} m`, ["Pythagoras"]),
    shortQ("Write the circle theorems: angle in a semicircle, and angle at the centre.", 3, ["Angle in a semicircle is 90°", "Angle at the centre is twice the angle at the circumference"]),
    calcQ(`Find the surface area of a cube of side ${ctx.n(5, 1)} cm.`, 2, `${6 * ctx.n(5, 1) ** 2} cm²`, ["6a²"]),
    calcQ(`A triangular prism has triangle 3-4-5 and length ${l} cm. Find the volume.`, 3, `${(3 * 4 / 2) * l} cm³`, ["Area of triangle × length"]),
    shortQ("Describe a rotation of 90° clockwise about (0, 0) applied to the point (2, 1).", 2, ["Image (−1, 2)"]),
    calcQ(`The bearing of B from A is 060°. Work out the bearing of A from B.`, 2, "240°", ["Add 180°"]),
    calcQ(`Find the midpoint of (2, ${ctx.n(3, 1)}) and (8, ${ctx.n(11, 1)}).`, 2, `(5, ${(ctx.n(3, 1) + ctx.n(11, 1)) / 2})`, ["Average the coordinates"]),
    calcQ(`Find the distance between (0, 0) and (6, 8).`, 2, "10", ["3-4-5 scaled by 2"]),
    shortQ("Explain why SSA is not a congruence condition for triangles.", 2, ["Two triangles can have two sides and a non-included angle equal and not be congruent / ambiguous case"]),
    calcQ(`A cone has radius 3 cm and slant height 5 cm. Find the curved surface area. Leave π in your answer.`, 2, "15π cm²", ["πrl"]),
    partsQ("Triangle ABC is similar to triangle DEF. AB = 6 cm, DE = 9 cm, BC = 10 cm.", [
      { label: "a", marks: 1, text: "Write the scale factor from ABC to DEF.", points: ["1.5"] },
      { label: "b", marks: 2, text: "Find EF.", points: ["15 cm"] },
    ]),
    shortQ("Write the exact values of sin 30°, cos 60° and tan 45°.", 3, ["1/2", "1/2", "1"]),
    shortQ(`A ${ctx.board} geometry 4-mark question often needs a reason at each step. Give two acceptable circle-theorem reasons you should write.`, 2, ["Angle in a semicircle is 90°", "Opposite angles in a cyclic quadrilateral sum to 180°"]),
  ];
}

function probabilityQs(ctx) {
  return [
    calcQ("A fair six-sided dice is rolled. Find P(even number).", 1, "1/2", ["2, 4, 6"]),
    calcQ("Two fair coins are flipped. Find P(two heads).", 2, "1/4", ["HH, HT, TH, TT"]),
    calcQ(`A bag contains ${ctx.n(4, 1)} red and ${ctx.n(6, 1)} blue counters. One counter is taken at random. Find P(red).`, 2, `${ctx.n(4, 1)}/${ctx.n(10, 2)}`, []),
    partsQ("A spinner has sections A, A, B, C. It is fair.", [
      { label: "a", marks: 1, text: "Find P(A).", points: ["1/2"] },
      { label: "b", marks: 2, text: "The spinner is spun twice. Find P(A then B).", points: ["(1/2)×(1/4) = 1/8"] },
    ]),
    calcQ("P(rain) = 0.3. Find P(not rain).", 1, "0.7", ["1 − 0.3"]),
    shortQ("Events A and B are mutually exclusive. P(A) = 0.2, P(B) = 0.5. Find P(A or B).", 2, ["0.7", "Add because they cannot both happen"]),
    shortQ("Events C and D are independent. P(C) = 0.4, P(D) = 0.5. Find P(C and D).", 2, ["0.2"]),
    calcQ(`A bag has 3 red and 5 green sweets. Two sweets are taken without replacement. Find P(both red).`, 3, "3/8 × 2/7 = 6/56 = 3/28", ["Tree diagram"]),
    calcQ("Using the same bag, find P(one of each colour) when two sweets are taken without replacement.", 4, "3/8×5/7 + 5/8×3/7 = 30/56 = 15/28", ["Two orders"]),
    shortQ("Draw a complete tree diagram for two flips of a biased coin with P(H) = 0.6. Label all eight probabilities on the branches and ends.", 4, ["Branches 0.6 and 0.4 twice", "HH 0.36, HT 0.24, TH 0.24, TT 0.16"]),
    calcQ("A two-way table: 20 students, 12 study French, 9 study German, 5 study both. How many study neither?", 3, "4", ["Inclusion-exclusion: 12+9−5 = 16, 20−16 = 4"]),
    calcQ("From that table, a student is chosen at random. Find P(studies French | studies German).", 3, "5/9", ["Conditional: both / German"]),
    shortQ("Write the formula for P(A|B) and explain it in words.", 2, ["P(A and B) / P(B)", "Restrict the sample space to B"]),
    calcQ("The probability of winning a game is 0.15. The game is played 200 times. Estimate the number of wins.", 2, "30", ["Expected frequency np"]),
    shortQ("Relative frequency of a 6 after 50 rolls is 0.1. After 500 rolls it is 0.16. Which is the better estimate of P(6) on a fair dice, and why?", 3, ["500 rolls", "More trials, relative frequency closer to the true probability"]),
    calcQ("A letter is chosen from MISSISSIPPI. Find P(S).", 2, "4/11", ["4 S letters, 11 total"]),
    calcQ("Two events: P(A) = 0.3, P(B) = 0.4, P(A and B) = 0.12. Are A and B independent? Show working.", 3, "Yes, because 0.3×0.4 = 0.12", []),
    calcQ("P(A) = 0.6, P(B) = 0.5, P(A and B) = 0.2. Find P(A or B).", 2, "0.9", ["0.6+0.5−0.2"]),
    shortQ("What is a sample space? List the sample space when a coin is flipped and a dice is rolled.", 3, ["All possible outcomes", "H1–H6 and T1–T6, 12 outcomes"]),
    calcQ("A fair spinner 1–5 is spun twice. Find P(sum is 10).", 2, "1/25", ["Only 5 then 5"]),
    calcQ("Find P(sum is 6) for two fair dice.", 3, "5/36", ["(1,5)(2,4)(3,3)(4,2)(5,1)"]),
    shortQ("Explain the difference between independent events and mutually exclusive events. Give an example of each.", 4, ["Independent: one does not affect the other, e.g. two coin flips", "Mutually exclusive: cannot happen together, e.g. rolling a 2 and a 5 on one roll"]),
    calcQ(`${ctx.student} picks a number from 1 to 20. Find P(prime).`, 2, "8/20 = 2/5", ["2,3,5,7,11,13,17,19"]),
    partsQ("A Venn diagram has P(A) = 0.5, P(B) = 0.4 and P(A and B) = 0.15.", [
      { label: "a", marks: 2, text: "Find P(only A).", points: ["0.35"] },
      { label: "b", marks: 2, text: "Find P(neither).", points: ["0.25"] },
    ]),
    calcQ("Without replacement: 10 tickets numbered 1–10. Two tickets are drawn. Find P(both even).", 3, "5/10 × 4/9 = 2/9", []),
    shortQ("Why must probabilities on a set of mutually exclusive exhaustive outcomes add up to 1?", 2, ["One of them must happen", "The sample space is complete"]),
    calcQ("A biased dice has P(6) = 0.3. It is rolled twice. Find P(at least one 6).", 3, "1 − 0.7² = 0.51", ["Complement"]),
    calcQ("Expected winnings: a game costs £2. P(win £10) = 0.1, otherwise win nothing. Is the game fair? Show working.", 3, "Expected gain = 0.1×10 − 2 = −1, not fair", []),
    shortQ("Describe how to use a set of random numbers from 00 to 99 to simulate P(success) = 0.27.", 2, ["Assign 00–26 as success", "27–99 as failure"]),
    shortQ(`A ${ctx.board} tree-diagram question is often 4 marks. State what must be labelled on the branches and on the ends.`, 2, ["Branch probabilities", "Outcome probabilities multiplied along the path"]),
    calcQ("Three fair coins. Find P(exactly two heads).", 3, "3/8", ["HHT, HTH, THH"]),
    shortQ("The probability of an event is 0. Explain what this means. The probability is 1. Explain what this means.", 2, ["Impossible", "Certain"]),
  ];
}

function statisticsQs(ctx) {
  const data = [2, 5, 7, 7, ctx.n(9, 1), 11, 15].sort((x, y) => x - y);
  const mean = data.reduce((s, v) => s + v, 0) / data.length;
  return [
    calcQ(`For the data ${data.join(", ")}, find the median.`, 2, String(data[Math.floor(data.length / 2)]), ["Ordered already, middle value"]),
    calcQ("Find the mode of that data set.", 1, "7", ["Most frequent"]),
    calcQ("Find the range of that data set.", 1, String(data[data.length - 1] - data[0]), ["Largest − smallest"]),
    calcQ("Find the mean of that data set. Give your answer to 1 d.p. if needed.", 2, mean.toFixed(1), ["Sum ÷ 7"]),
    calcQ("The mean of four numbers is 10. Three of the numbers are 7, 9 and 12. Find the fourth number.", 3, "12", ["Total = 40"]),
    shortQ("Which average is most affected by an outlier: mean, median or mode? Explain.", 2, ["Mean", "It uses every value"]),
    partsQ("A frequency table: 1,2,3,4,5 scored by 4, 6, 7, 3, 0 students.", [
      { label: "a", marks: 2, text: "How many students were surveyed?", points: ["20"] },
      { label: "b", marks: 3, text: "Estimate the mean score.", points: ["(1×4+2×6+3×7+4×3)/20 = 2.45"] },
    ]),
    calcQ("From the same table, find the modal score and the median score.", 3, "Mode 3; median 3", ["20 values, 10th and 11th both in the 3 group"]),
    shortQ("Explain the difference between a bar chart and a histogram.", 3, ["Bar chart: gaps, frequencies of categories", "Histogram: no gaps, frequency density, continuous data"]),
    calcQ("A histogram has a class 10 ≤ t < 20 of width 10 and frequency 16. Find the frequency density.", 2, "1.6", ["f ÷ class width"]),
    shortQ("A scatter graph shows a strong negative correlation. Describe what this means in context if the variables are age of a car and value.", 2, ["As age increases, value decreases", "Strong: points close to a line"]),
    shortQ("Why does correlation not imply causation? Give an exam-style example.", 2, ["A third variable may be involved", "e.g. ice cream sales and drowning both rise in summer"]),
    calcQ("Stem-and-leaf: 1 | 2 5 ; 2 | 0 3 7 8 ; 3 | 1 4. Find the median and the range.", 3, "Median 27; range 22", ["9 values, 5th is 27; 34−12"]),
    calcQ("Quartiles for 11 ordered values: find the positions of Q1, Q2 and Q3.", 2, "Q1 = 3rd, Q2 = 6th, Q3 = 9th", []),
    calcQ("A data set has Q1 = 4, Q3 = 12. Find the interquartile range and explain what it measures.", 3, "IQR = 8", ["Spread of the middle 50%"]),
    shortQ("An outlier is often defined as a value more than 1.5 × IQR above Q3 or below Q1. If Q1 = 10, Q3 = 22, which of 42 and 40 would be outliers?", 3, ["IQR = 12, fence = 22 + 18 = 40", "42 is an outlier; 40 is on the fence / check the definition used"]),
    calcQ("Two groups: A has mean 20 from 10 people, B has mean 30 from 20 people. Find the combined mean.", 3, "26.67 or 80/3", ["(200 + 600)/30"]),
    shortQ("Describe how to draw a box plot from a five-number summary.", 3, ["Min, Q1, median, Q3, max", "Box from Q1 to Q3, line at median, whiskers to min/max"]),
    shortQ("Compare two box plots: team A has a higher median but a larger IQR than team B. Write a comparison in context of test scores.", 3, ["A typically scored higher", "A's scores are more spread out"]),
    calcQ("Grouped data: 0–10 fd=2, 10–20 fd=5, 20–40 fd=3. The second class is 10 wide. Find its frequency.", 2, "50", ["5 × 10"]),
    shortQ("What is frequency density and why is it used in a histogram with unequal class widths?", 2, ["Frequency ÷ class width", "So area represents frequency"]),
    calcQ("A pie chart represents 180 students. The 'walk' sector is 80°. How many students walk?", 2, "40", ["80/360 × 180"]),
    calcQ("In a sample of 40, 7 people own a cat. Estimate how many own a cat in a town of 12 000, assuming the sample is representative.", 2, "2100", ["7/40 × 12000"]),
    shortQ("Give one reason a sample might not be representative, and one way to improve it.", 2, ["Bias / too small / only one location", "Random sample / larger / stratified"]),
    shortQ("Explain the difference between discrete and continuous data. Give an example of each.", 2, ["Discrete: counted, e.g. number of siblings", "Continuous: measured, e.g. height"]),
    calcQ("Moving average: sales 4, 8, 6, 10. Calculate the 3-point moving averages.", 3, "6, 8", ["(4+8+6)/3=6, (8+6+10)/3=8"]),
    shortQ("What is the purpose of a moving average on a time series?", 2, ["Smooth seasonal variation", "Show the trend"]),
    calcQ(`${ctx.student} records 5, 7, a, 9. The mean is 8. Find a.`, 2, "11", ["31 − 21 = 10? 5+7+9=21, 32−21=11"]),
    partsQ("A cumulative frequency graph is drawn for 80 times.", [
      { label: "a", marks: 1, text: "How do you read the median from the graph?", points: ["Read the time at cf = 40"] },
      { label: "b", marks: 2, text: "How do you estimate the IQR?", points: ["Times at cf 20 and 60, subtract"] },
    ]),
    shortQ("A student says the mean of 1, 2, 3, 100 is a good typical value. Critique this.", 2, ["100 is an outlier", "Median 2.5 is more typical"]),
    shortQ(`On ${ctx.board} statistics questions, you are often asked to compare distributions. Write the two things you must compare.`, 2, ["Average (median/mean)", "Spread (range/IQR)"]),
    calcQ("Index numbers: price in year 0 is £2.50 (index 100). Year 1 price is £3.00. Find the index number for year 1.", 2, "120", ["3/2.5 × 100"]),
  ];
}

function factorize(n) {
  const factors = [];
  let x = n;
  for (let p = 2; p * p <= x; p += 1) {
    while (x % p === 0) {
      factors.push(p);
      x /= p;
    }
  }
  if (x > 1) factors.push(x);
  return factors.join(" × ");
}

function hcf(a, b) {
  return b ? hcf(b, a % b) : Math.abs(a);
}

function lcm(a, b) {
  return Math.abs(a * b) / hcf(a, b);
}

function shareRatio(total, parts) {
  const sum = parts.reduce((s, p) => s + p, 0);
  return parts.map((part) => `£${((total * part) / sum).toFixed(2)}`).join(" : ");
}

function simplifySurd(n) {
  let square = 1;
  for (let i = Math.floor(Math.sqrt(n)); i >= 2; i -= 1) {
    if (n % (i * i) === 0) {
      square = i;
      break;
    }
  }
  const rest = n / (square * square);
  return rest === 1 ? String(square) : `${square}√${rest}`;
}

function rationalise(num, surd) {
  const simplified = simplifySurd(surd);
  return `${num} / √${surd} = ${num}√${surd} / ${surd}, then simplify if possible (${simplified})`;
}
