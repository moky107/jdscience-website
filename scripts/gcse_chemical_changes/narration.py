"""Cloned-voice narration for the twelve GCSE Chemistry chemical-changes lessons.

Spoken formulas are expanded so the authorised voice clone reads them naturally.
Every lesson uses the mandatory six-stage instructional format.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class LessonScript:
    slug: str
    title: str
    subtitle: str
    filename: str
    spoken: str
    description: str
    spec_codes: tuple[str, ...]
    tier: str = "Foundation and Higher"
    youtube_filename: str = ""
    spec_label: str = "AQA 4.4 / Edexcel Topic 3"


def _join(paragraphs: list[str]) -> str:
    return "\n\n".join(p.strip() for p in paragraphs if p.strip())


OPEN = "Hello and welcome back to JD Science."
CLOSE = _join([
    "If this explanation has helped, please subscribe to JD Science and visit j d science dot co dot u k for further explanations and revision resources.",
    "Thank you for watching, and I look forward to seeing you in the next lesson.",
])


ACIDS_BASES = LessonScript(
    slug="acids-bases-alkalis",
    title="Acids, Bases and Alkalis",
    subtitle="H+ , OH-, and why not every base is an alkali",
    filename="jdscience-acids-bases-alkalis-1080p.mp4",
    youtube_filename="JDScience_GCSE_Chemistry_Acids_Bases_Alkalis.mp4",
    description="Acids, bases and alkalis, including hydrogen ions, hydroxide ions and why not every base is an alkali.",
    spec_codes=("C4.4.2.1", "Edx3.1", "Edx3.2"),
    spoken=_join([
        OPEN,
        "In today's lesson we are going to look at acids, bases and alkalis. These words appear throughout GCSE Chemistry, and examiners expect you to use them precisely.",
        "By the end of this lesson you should be able to define an acid, a base and an alkali, describe what happens when they dissolve in water, and explain why not every base is an alkali.",
        "Let us begin with acids. An acid is a substance that produces hydrogen ions when it dissolves in water. In aqueous solution those hydrogen ions are often written as H plus. A more complete picture is that the hydrogen ion is hydrated, and chemists sometimes write it as H three O plus, the hydronium ion. For GCSE answers, H plus in aqueous solution is accepted.",
        "Common laboratory acids include hydrochloric acid, H Cl, sulfuric acid, H two S O four, and nitric acid, H N O three. Hydrochloric acid is used in the stomach to help digest food. Sulfuric acid is an important industrial acid. Vinegar contains ethanoic acid, a weak acid you will meet in a later lesson.",
        "Acids have a sour taste, though you must never taste laboratory chemicals, and they turn blue litmus red. Their characteristic reactions come from those hydrogen ions.",
        "A base is a substance that can neutralise an acid. Many bases are metal oxides or metal hydroxides. Copper oxide, magnesium oxide and sodium hydroxide are all bases. A base accepts hydrogen ions, or it provides a way to cancel them out.",
        "An alkali is a soluble base. When an alkali dissolves in water it produces hydroxide ions, written O H minus. Sodium hydroxide, potassium hydroxide and aqueous ammonia are alkalis. Calcium hydroxide solution, often called limewater, is also alkaline.",
        "Here is the distinction that loses students marks. Every alkali is a base, but not every base is an alkali. Copper oxide is a base because it will react with an acid to make a salt and water, but it does not dissolve well in water, so it is not described as an alkali. Magnesium oxide is similar: it is a base, but it is only sparingly soluble, so we do not normally call it an alkali.",
        "Think of two beakers. In the acid beaker, water contains extra H plus ions. In the alkali beaker, water contains extra O H minus ions. When you mix them, hydrogen ions and hydroxide ions join to make water. That ionic equation is H plus plus O H minus goes to H two O. That is the essential chemistry of neutralisation.",
        "Aqueous ammonia is a useful example. Ammonia, N H three, dissolves in water and produces some hydroxide ions, so the solution is alkaline. Ammonia itself is a covalent molecule, but its aqueous solution behaves as an alkali.",
        "Let us work through an examination-style example. A student is given three solids: sodium hydroxide, copper oxide and sodium chloride. Which is an alkali, which is a base that is not an alkali, and which is neither?",
        "Sodium hydroxide dissolves in water and produces hydroxide ions, so it is an alkali, and therefore also a base. Copper oxide will neutralise an acid, so it is a base, but it is not soluble enough to be an alkali. Sodium chloride is a salt. It does not produce H plus or O H minus as its characteristic ions, so it is neither an acid, a base nor an alkali.",
        "Now it is your turn. Here is a specification-aligned examination-style question. It is worth three marks.",
        "Explain the difference between a base and an alkali. Use a named example of each in your answer.",
        "Pause the video and try this question yourself. I will go through the model answer in a moment.",
        "Here is the model answer. A base is a substance that can neutralise an acid. An alkali is a soluble base that produces hydroxide ions in water. Copper oxide is a base because it reacts with acids, but it is not an alkali because it is insoluble. Sodium hydroxide is an alkali because it dissolves and produces O H minus ions.",
        "That is three marking points: the definition of a base, the definition of an alkali as a soluble base, and a correct named example of each. Essential vocabulary is base, alkali, soluble, hydroxide ions and neutralise.",
        "A common misconception is to say that a base is just the opposite of an acid, without mentioning solubility. Another is to call copper oxide an alkali. Avoid both. If the question asks for ions, write H plus and O H minus, not just acid and alkali.",
        "Before we finish, remember these key ideas. Acids produce hydrogen ions in water. Bases neutralise acids. Alkalis are soluble bases and produce hydroxide ions. Neutralisation of H plus by O H minus makes water. Not every base is an alkali.",
        CLOSE,
    ]),
)

INDICATORS = LessonScript(
    slug="indicators-and-ph",
    title="Indicators and the pH Scale",
    subtitle="Universal indicator, pH numbers and hydrogen ion concentration",
    filename="jdscience-indicators-and-ph-1080p.mp4",
    youtube_filename="JDScience_GCSE_Chemistry_Indicators_pH.mp4",
    description="Litmus, universal indicator and the pH scale, including how pH links to hydrogen ion concentration.",
    spec_codes=("C4.4.2.4", "Edx3.3", "Edx3.4"),
    spoken=_join([
        OPEN,
        "Today we are exploring indicators and the pH scale. By the end of this lesson you should be able to describe how indicators are used, recall the colours of universal indicator, and explain what pH tells you about a solution.",
        "An indicator is a dye that changes colour depending on whether a solution is acidic or alkaline. Litmus is a simple indicator. In acid it is red. In alkali it is blue. In a neutral solution it is purple. Litmus tells you acid or alkali, but it does not tell you how strong that acidity or alkalinity is.",
        "Methyl orange and phenolphthalein are often used in titrations. Methyl orange is red in acid and yellow in alkali. Phenolphthalein is colourless in acid and pink in alkali. You choose an indicator whose colour change happens at the pH of the end point you need.",
        "Universal indicator is a mixture of dyes. It gives a range of colours that you can match to the pH scale. The pH scale normally runs from zero to fourteen at ordinary classroom temperatures.",
        "pH seven is neutral. Pure water has pH seven because it contains equal concentrations of hydrogen ions and hydroxide ions. Values below seven are acidic. Values above seven are alkaline. The further from seven, the more strongly acidic or alkaline the solution.",
        "A typical colour sequence for universal indicator is red for strong acid, orange or yellow for weak acid, green for neutral, blue for weak alkali, and purple for strong alkali. You should be able to read a pH colour chart in an exam.",
        "pH is a measure of hydrogen ion concentration. As the concentration of H plus increases, the pH value decreases. A solution of pH one has a much higher hydrogen ion concentration than a solution of pH four. Both are acids, but pH one is far more acidic.",
        "On the Higher Tier, you should know that the pH scale is logarithmic. A decrease of one pH unit means the hydrogen ion concentration has increased by a factor of ten. So pH two has ten times the H plus concentration of pH three, and one hundred times that of pH four.",
        "Everyday examples help. Lemon juice is acidic, typically around pH two. Vinegar is also acidic. Pure water is pH seven. Soap solution and baking soda solution are weakly alkaline. Oven cleaner containing sodium hydroxide is strongly alkaline, often around pH thirteen or fourteen. That is why it is so corrosive.",
        "Let us work through an examination-style example. A student tests three solutions with universal indicator. Solution A is red, solution B is green, and solution C is purple. What can the student conclude about each solution?",
        "Solution A is a strong acid, with a low pH. Solution B is neutral, pH about seven. Solution C is a strong alkali, with a high pH. Notice that we have used both the colour and the meaning on the pH scale. That is what examiners want.",
        "Now it is your turn. This specification-aligned question is worth four marks.",
        "A student has hydrochloric acid of pH one and ethanoic acid of pH four, both at the same concentration. Describe how universal indicator would distinguish them, and explain what the pH values tell you about hydrogen ion concentration. Higher Tier students should also refer to the factor of ten.",
        "Pause the video and try this question yourself. I will go through the model answer in a moment.",
        "Here is the model answer. Universal indicator would be red in the hydrochloric acid and orange or yellow in the ethanoic acid. pH one means a higher hydrogen ion concentration than pH four, so hydrochloric acid is more acidic. A difference of three pH units means the H plus concentration differs by a factor of one thousand, because each pH unit is a factor of ten.",
        "Marking points are: correct colours, pH linked to H plus concentration, hydrochloric acid more acidic, and the logarithmic factor for Higher Tier. Essential vocabulary is indicator, pH, hydrogen ion concentration and universal indicator.",
        "A common misconception is to say a higher pH means more acidic. It is the opposite. Another is to treat pH seven as alkaline because it is in the middle of the scale. Neutral is seven. Do not write that acids are always red without naming the indicator.",
        "Before we finish, remember these key ideas. Indicators change colour with pH. Universal indicator estimates pH from zero to fourteen. Below seven is acidic, seven is neutral, above seven is alkaline. Lower pH means higher H plus concentration. On Higher Tier, one pH unit is a factor of ten.",
        CLOSE,
    ]),
)

STRONG_WEAK = LessonScript(
    slug="strong-and-weak-acids",
    title="Strong and Weak Acids",
    subtitle="Ionisation, concentration and pH — Higher Tier",
    filename="jdscience-strong-and-weak-acids-1080p.mp4",
    youtube_filename="JDScience_GCSE_Chemistry_Strong_Weak_Acids.mp4",
    description="Higher Tier: strong and weak acids, ionisation, and why strength is not the same as concentration.",
    spec_codes=("C4.4.2.5", "Edx3.8HT"),
    tier="Higher Tier",
    spoken=_join([
        OPEN,
        "Today's lesson is Higher Tier. We are going to distinguish strong acids from weak acids, and we are going to separate the idea of strength from the idea of concentration. By the end you should be able to explain ionisation, compare pH at the same concentration, and avoid the usual examination traps.",
        "A strong acid is fully ionised in aqueous solution. That means virtually every acid molecule or unit has donated its hydrogen ion. Hydrochloric acid, sulfuric acid and nitric acid are strong acids. In hydrochloric acid, H Cl molecules do not remain. The solution contains H plus and Cl minus ions.",
        "A weak acid is only partially ionised in aqueous solution. Only a small fraction of the acid molecules have donated a hydrogen ion at any moment. Ethanoic acid, the acid in vinegar, is a weak acid. Most ethanoic acid molecules remain as molecules. Only some have ionised to H plus and ethanoate ions. The ionisation is reversible, which is why we write an equilibrium arrow.",
        "Look at two beakers with the same concentration of acid. In the strong acid, almost all of the particles that can produce H plus have done so, so the hydrogen ion concentration is high and the pH is low. In the weak acid, many un-ionised molecules remain, so the hydrogen ion concentration is lower and the pH is higher. Same concentration, different strength, different pH.",
        "Strength is about how completely the acid ionises. Concentration is about how much acid is dissolved per cubic decimetre of solution. You can have a dilute strong acid, such as dilute hydrochloric acid, and a concentrated weak acid, such as concentrated ethanoic acid. Concentrated does not mean strong.",
        "This is the misconception that costs marks every year. Students write that a strong acid is concentrated, or that a weak acid is dilute. Strength and concentration are different ideas. Always say fully ionised or partially ionised when you define strong and weak.",
        "Because pH depends on hydrogen ion concentration, a strong acid of concentration zero point one moles per cubic decimetre has a much lower pH than a weak acid of the same concentration. If you dilute a strong acid, its pH rises because you have lowered the H plus concentration, but it is still a strong acid because it remains fully ionised.",
        "Let us work through an examination-style example. Two acids, A and B, both have concentration zero point one zero moles per cubic decimetre. Acid A has pH one. Acid B has pH three. Which is strong, which is weak, and why?",
        "Acid A has the lower pH, so it has the higher hydrogen ion concentration. At the same overall concentration, that means A is more fully ionised, so A is the strong acid. Acid B is only partially ionised, so it is weak. We have used pH as evidence of ionisation, not as a vague label.",
        "Now it is your turn. This Higher Tier question is worth four marks.",
        "Hydrochloric acid and ethanoic acid are both acids. They are prepared at the same concentration. Explain the difference between a strong acid and a weak acid, and explain why the hydrochloric acid has a lower pH.",
        "Pause the video and try this question yourself. I will go through the model answer in a moment.",
        "Here is the model answer. A strong acid is fully ionised in aqueous solution. A weak acid is only partially ionised. Hydrochloric acid is a strong acid, so it produces a higher concentration of hydrogen ions than ethanoic acid at the same concentration. Higher H plus concentration means a lower pH.",
        "Marking points: fully ionised, partially ionised, same concentration but different H plus, and pH linked correctly. Essential vocabulary is ionised, strong, weak, concentration and pH. Do not write dissociated unless you also make the ionisation idea clear, and never replace strong with concentrated.",
        "A common misconception is that weak acids cannot be dangerous, or that they do not react with metals or carbonates. They do react, just more slowly or to a smaller extent at the same concentration. Another is to draw both acids with the same number of H plus ions in a particle diagram.",
        "Before we finish, remember these Higher Tier ideas. Strong acids are fully ionised. Weak acids are partially ionised. Strength is not concentration. At the same concentration, the strong acid has more H plus and a lower pH. One pH unit is a factor of ten in hydrogen ion concentration.",
        CLOSE,
    ]),
)

ACIDS_METALS = LessonScript(
    slug="acids-metals-redox",
    title="Acids Reacting with Metals",
    subtitle="Salt, hydrogen, and redox half-equations",
    filename="jdscience-acids-metals-redox-1080p.mp4",
    youtube_filename="JDScience_GCSE_Chemistry_Acids_Metals_Redox.mp4",
    description="Metal-acid reactions, the hydrogen test, reactivity, and Higher Tier redox half-equations.",
    spec_codes=("C4.4.1.2", "C4.4.1.3", "Edx3.5"),
    spoken=_join([
        OPEN,
        "Today we are looking at acids reacting with metals, and at the redox chemistry behind those reactions. By the end of this lesson you should be able to write word and symbol equations, test for hydrogen, and, on Higher Tier, describe oxidation and reduction in terms of electrons.",
        "The general reaction is acid plus metal goes to salt plus hydrogen. For example, magnesium plus hydrochloric acid goes to magnesium chloride plus hydrogen. Zinc plus sulfuric acid goes to zinc sulfate plus hydrogen.",
        "Not every metal reacts. Only metals more reactive than hydrogen in the reactivity series displace hydrogen from acids in this way. Magnesium, zinc and iron react. Copper, gold and silver do not react with dilute hydrochloric or sulfuric acid in the school laboratory. That is why copper is useful for water pipes.",
        "You can see the reaction as bubbles of gas. To identify the gas, collect it and apply a lighted splint. Hydrogen burns with a squeaky pop. That is the hydrogen test, and you must name the lighted splint, not just a splint.",
        "The salt you get depends on the acid and the metal. Hydrochloric acid makes chlorides. Sulfuric acid makes sulfates. Nitric acid makes nitrates, though concentrated nitric acid can give nitrogen oxides instead of hydrogen, so school questions usually use hydrochloric or sulfuric acid.",
        "Why does the metal disappear? Metal atoms lose electrons and become positive ions that go into solution. Hydrogen ions from the acid gain those electrons and become hydrogen gas. Losing electrons is oxidation. Gaining electrons is reduction. This is a redox reaction.",
        "A memory aid is oil rig: oxidation is loss, reduction is gain of electrons. On Higher Tier you should write half-equations. For magnesium, M g goes to M g two plus plus two electrons. For hydrogen ions, two H plus plus two electrons goes to H two. Electrons lost by magnesium are gained by hydrogen ions.",
        "If a question gives you iron and hydrochloric acid, the salt is iron chloride. Iron can form iron two plus or iron three plus, so school equations usually use Fe plus two H Cl goes to Fe Cl two plus H two. State symbols help: magnesium is a solid, the acid is aqueous, the salt is aqueous, and hydrogen is a gas.",
        "The metal is oxidised. Hydrogen ions are reduced. Do not say the acid is oxidised. Name the species that actually loses or gains electrons.",
        "Let us work through an examination-style example. Write the balanced symbol equation for zinc reacting with sulfuric acid, name the salt, and describe the test for the gas.",
        "Zinc plus H two S O four goes to Z n S O four plus H two. The salt is zinc sulfate. The gas is hydrogen. It burns with a squeaky pop when a lighted splint is used. We have the equation, the name, and the test. That is a full-mark practical answer.",
        "Now it is your turn. This question is worth four marks. Higher Tier students should include a half-equation.",
        "A student adds magnesium ribbon to dilute hydrochloric acid. Describe what is observed, name the products, and explain, in terms of electrons, which species is oxidised.",
        "Pause the video and try this question yourself. I will go through the model answer in a moment.",
        "Here is the model answer. Bubbles of gas are seen and the magnesium disappears. The products are magnesium chloride and hydrogen. Magnesium atoms lose electrons to form magnesium ions, so magnesium is oxidised. The half-equation is M g goes to M g two plus plus two e minus.",
        "Marking points: observation, both products, oxidation as electron loss, and the half-equation for Higher Tier. Essential vocabulary is salt, hydrogen, oxidised, reduced and electrons.",
        "A common misconception is to write copper plus hydrochloric acid as if it worked. Copper is below hydrogen, so there is no reaction. Another is to test hydrogen with a glowing splint. The glowing splint is for oxygen. Hydrogen needs a lighted splint and a squeaky pop.",
        "Before we finish, remember these key ideas. Acid plus a sufficiently reactive metal gives a salt and hydrogen. Hydrochloric acid gives chlorides, sulfuric acid gives sulfates. Hydrogen pops with a lighted splint. The metal is oxidised as it loses electrons. Copper does not react with dilute hydrochloric acid.",
        CLOSE,
    ]),
)

NEUTRALISATION = LessonScript(
    slug="neutralisation-and-gas-tests",
    title="Neutralisation and Gas Tests",
    subtitle="Acids with alkalis, carbonates and metal oxides",
    filename="jdscience-neutralisation-and-gas-tests-1080p.mp4",
    youtube_filename="JDScience_GCSE_Chemistry_Neutralisation_Gas_Tests.mp4",
    description="Neutralisation reactions, carbonate and oxide reactions, and the hydrogen, oxygen and carbon dioxide tests.",
    spec_codes=("C4.4.2.2", "C4.4.2.3", "Edx3.6"),
    spoken=_join([
        OPEN,
        "Today we are exploring neutralisation and the gas tests that appear with acid reactions. By the end of this lesson you should be able to write the three key acid reaction patterns, give the ionic equation for neutralisation, and recall the tests for hydrogen, oxygen and carbon dioxide.",
        "When an acid reacts with an alkali, the products are a salt and water. Hydrochloric acid plus sodium hydroxide goes to sodium chloride plus water. The ionic equation, which examiners love, is H plus plus O H minus goes to H two O. The spectator ions, sodium and chloride, remain in solution as salt.",
        "When an acid reacts with a metal oxide, you also get a salt and water. Sulfuric acid plus copper oxide goes to copper sulfate plus water. The black copper oxide disappears and a blue copper sulfate solution forms. That colour change is a useful observation.",
        "When an acid reacts with a metal carbonate, the products are a salt, water and carbon dioxide. Hydrochloric acid plus calcium carbonate goes to calcium chloride plus water plus carbon dioxide. You see fizzing as the gas is produced. This is why acid rain damages limestone buildings: limestone is mainly calcium carbonate.",
        "You must match the salt name to the acid. Hydrochloric acid gives chlorides, sulfuric acid gives sulfates, nitric acid gives nitrates. The metal comes from the alkali, oxide or carbonate.",
        "Now the gas tests, which are required practical knowledge. Hydrogen: a lighted splint. The gas burns with a squeaky pop. Oxygen: a glowing splint relights. Carbon dioxide: bubble the gas through limewater, which is calcium hydroxide solution. The limewater turns cloudy or milky because a white precipitate of calcium carbonate forms.",
        "Do not mix these up. A glowing splint is not the hydrogen test. Limewater is not used for oxygen. If a question says the limewater stays clear, the gas is not carbon dioxide.",
        "Write the observations as well as the chemistry. Copper oxide is a black powder. Copper sulfate solution is blue. Carbonates fizz. Alkalis do not fizz with acids unless a carbonate impurity is present. If you are asked for the ionic equation, give H plus plus O H minus goes to H two O, not the full formula equation again.",
        "Let us work through an examination-style example. A student adds dilute hydrochloric acid to calcium carbonate. Write the balanced symbol equation and describe how to identify the gas.",
        "C a C O three plus two H Cl goes to C a Cl two plus H two O plus C O two. Bubble the gas through limewater; it turns milky. We have balanced the acid, named the salt as calcium chloride, and used the correct carbon dioxide test.",
        "Now it is your turn. This question is worth four marks.",
        "Describe what you would observe when dilute sulfuric acid is added to copper oxide, and when the same acid is added to sodium carbonate. Identify any gas produced and give the test you would use.",
        "Pause the video and try this question yourself. I will go through the model answer in a moment.",
        "Here is the model answer. With copper oxide, the black solid disappears and a blue solution of copper sulfate forms. No gas is produced. With sodium carbonate, fizzing is seen as carbon dioxide is produced. The gas turns limewater milky. Both reactions also produce water, but water is not usually seen as a separate layer in a dilute solution.",
        "Marking points: oxide observation, carbonate fizzing, carbon dioxide identified, and limewater test. Essential vocabulary is neutralisation, salt, limewater, milky and ionic equation.",
        "A common misconception is to write acid plus carbonate as salt plus hydrogen. Carbonates give carbon dioxide, not hydrogen. Metals give hydrogen. Another is to say limewater goes cloudy with hydrogen. Keep the three gas tests separate in your revision notes.",
        "Before we finish, remember these key ideas. Acid plus alkali, or acid plus metal oxide, gives salt plus water. Acid plus carbonate gives salt, water and carbon dioxide. The ionic equation for alkali neutralisation is H plus plus O H minus goes to H two O. Hydrogen pops, oxygen relights a glowing splint, carbon dioxide turns limewater milky.",
        CLOSE,
    ]),
)

SALTS = LessonScript(
    slug="soluble-and-insoluble-salts",
    title="Making Soluble and Insoluble Salts",
    subtitle="Crystallisation, precipitation and solubility rules",
    filename="jdscience-soluble-and-insoluble-salts-1080p.mp4",
    youtube_filename="JDScience_GCSE_Chemistry_Soluble_Insoluble_Salts.mp4",
    description="How to make soluble salts by crystallisation and insoluble salts by precipitation, with solubility rules.",
    spec_codes=("C4.4.2.3", "C4.4.2.6", "Edx3.14", "Edx3.15"),
    spoken=_join([
        OPEN,
        "Today we are going to make salts. By the end of this lesson you should be able to choose the correct method for a soluble salt and for an insoluble salt, recall the key solubility rules, and describe filtration, evaporation and crystallisation as a sequence.",
        "First, solubility rules. All sodium, potassium and ammonium salts are soluble. All nitrates are soluble. Most chlorides are soluble, except silver chloride and lead chloride. Most sulfates are soluble, except barium sulfate, lead sulfate and calcium sulfate, which is only slightly soluble. Most carbonates and hydroxides are insoluble, except those of sodium, potassium and ammonium.",
        "If the salt you want is soluble, and you are making it from an insoluble base such as a metal oxide or carbonate, add the solid to warm dilute acid until the solid is in excess. That ensures all the acid has reacted. Then filter to remove the leftover solid. Heat the filtrate to evaporate some of the water, then leave it to cool so crystals form. Finally, filter off the crystals, wash them with a little distilled water, and leave them to dry.",
        "That sequence is a required practical: excess solid, filter, evaporate, crystallise, dry. If you evaporate all the water to dryness you may get a powder rather than well-formed crystals, and you may decompose some salts, so we usually stop at a hot concentrated solution and then cool.",
        "If both the acid and the alkali are soluble, you cannot use excess solid because you would contaminate the salt with leftover alkali. That is when titration is used to find the exact reacting volumes. We will cover titration in the next lesson.",
        "If the salt you want is insoluble, use precipitation. Mix two soluble solutions that together contain the ions of the insoluble salt. For example, mix silver nitrate with sodium chloride. Silver chloride precipitates as a white solid. Filter, wash the residue with distilled water to remove soluble impurities, and dry the solid.",
        "Barium sulfate is another insoluble sulfate, which is why barium chloride is used as a test for sulfate ions: a white precipitate forms. Lead iodide is a bright yellow precipitate. Naming the colour can gain an observation mark, but the method marks come from mix, filter, wash and dry.",
        "Let us work through an examination-style example. How would you make a pure dry sample of copper sulfate crystals from copper oxide and sulfuric acid?",
        "Add copper oxide to warm sulfuric acid until some black solid remains. Filter to remove excess copper oxide. Heat the blue filtrate to evaporate some water. Leave to cool so crystals form. Filter, wash and dry the crystals. We have used excess base, because copper oxide is insoluble, and we have not skipped washing.",
        "Now it is your turn. This question is worth six marks.",
        "Describe how you would make a pure dry sample of insoluble barium sulfate, starting from aqueous barium chloride and aqueous sodium sulfate. Include the solubility reason for choosing precipitation.",
        "Pause the video and try this question yourself. I will go through the model answer in a moment.",
        "Here is the model answer. Barium sulfate is insoluble, so it is made by precipitation. Mix barium chloride solution with sodium sulfate solution. A white precipitate of barium sulfate forms. Filter the mixture. Wash the residue with distilled water to remove sodium chloride and any leftover solutions. Dry the solid on filter paper or in a warm oven.",
        "Marking points: insoluble so precipitation, mix the two solutions, filter, wash, dry. Essential vocabulary is excess, filtrate, crystallise, precipitate and residue. You would lose marks for heating barium sulfate to evaporate, because you are not making a soluble salt.",
        "A common misconception is to add excess sodium hydroxide when making a soluble sodium salt. Excess soluble alkali cannot be filtered out. Another is to forget to wash a precipitate, leaving soluble impurities on the crystals or the solid.",
        "Before we finish, remember these key ideas. Sodium, potassium, ammonium and nitrate salts are soluble. Insoluble salts are made by precipitation, then filter, wash and dry. Soluble salts from an insoluble base are made with excess solid, then filter, evaporate and crystallise. Titration is used when both reactants are soluble.",
        CLOSE,
    ]),
)

TITRATION = LessonScript(
    slug="acid-alkali-titration",
    title="Acid-Alkali Titration",
    subtitle="Burette, pipette, concordant titres and the mole calculation",
    filename="jdscience-acid-alkali-titration-1080p.mp4",
    youtube_filename="JDScience_GCSE_Chemistry_Titration.mp4",
    description="Titration apparatus and method, concordant titres, and calculating unknown concentration.",
    spec_codes=("C4.4.2.4", "Edx3.16", "Edx3.17"),
    spoken=_join([
        OPEN,
        "Today we are exploring acid-alkali titration, a required practical. By the end of this lesson you should be able to name the apparatus, describe a valid method, explain concordant titres, and calculate an unknown concentration using moles.",
        "Titration finds the exact volume of one solution that reacts completely with a known volume of another. We use it when both the acid and the alkali are soluble, so we cannot add excess solid and filter.",
        "The apparatus is specific. A pipette, with a pipette filler, measures a fixed volume of one solution into a conical flask, often twenty-five cubic centimetres of alkali. A burette holds the other solution, often the acid. The burette is graduated so you can read the start and end volumes. An indicator in the flask shows the end point. A white tile under the flask makes the colour change easier to see.",
        "Rinse the pipette with the solution it will measure, and rinse the burette with the solution it will hold. Rinsing with water would dilute those solutions. Fill the burette, remove the air bubble from the tap, and record the initial reading to the nearest zero point zero five cubic centimetres.",
        "Add the solution from the burette while swirling the flask. Near the end point, add drop by drop. Stop when the indicator changes colour permanently. Record the final reading. The titre is final minus initial.",
        "Repeat until you have concordant titres, which means titres that agree to within zero point one zero cubic centimetres. Use the mean of the concordant titres in your calculation. Do not include a rough first titre if it is not concordant.",
        "Phenolphthalein is often used for a strong acid with a strong alkali: it is colourless in acid and pink in alkali. Methyl orange is red in acid and yellow in alkali. Choose an indicator that changes at the right pH.",
        "The calculation uses moles equals concentration times volume, with volume in cubic decimetres. Divide cubic centimetres by one thousand. From the balanced equation, convert moles of one reactant into moles of the other, then rearrange to find the unknown concentration.",
        "Let us work through a worked example. Twenty-five point zero cubic centimetres of sodium hydroxide is titrated with zero point one zero zero moles per cubic decimetre hydrochloric acid. The mean titre is twenty-two point five zero cubic centimetres. The equation is H Cl plus N a O H goes to N a Cl plus H two O. Find the concentration of the sodium hydroxide.",
        "Moles of H Cl equals zero point one zero zero times twenty-two point five zero divided by one thousand, which is zero point zero zero two two five moles. The ratio is one to one, so moles of N a O H are also zero point zero zero two two five. Concentration equals moles divided by volume in cubic decimetres, so zero point zero zero two two five divided by zero point zero two five zero, which is zero point zero nine zero moles per cubic decimetre. Units are essential.",
        "Now it is your turn. This question is worth five marks.",
        "Twenty-five point zero cubic centimetres of dilute sulfuric acid is completely neutralised by twenty-eight point zero cubic centimetres of zero point two zero zero moles per cubic decimetre sodium hydroxide. The equation is H two S O four plus two N a O H goes to N a two S O four plus two H two O. Calculate the concentration of the sulfuric acid. Give your answer to three significant figures.",
        "Pause the video and try this question yourself. I will go through the model answer in a moment.",
        "Here is the model answer. Moles of sodium hydroxide equals zero point two zero zero times twenty-eight point zero divided by one thousand, which is zero point zero zero five six zero moles. The ratio is one sulfuric acid to two sodium hydroxide, so moles of sulfuric acid are zero point zero zero two eight zero. Concentration equals zero point zero zero two eight zero divided by zero point zero two five zero, which is zero point one one two moles per cubic decimetre.",
        "Marking points: volume conversion, moles of alkali, mole ratio of one to two, division by the acid volume, units and three significant figures. A common misconception is to forget the two in the equation, which doubles or halves the answer. Another is to leave volume in cubic centimetres, which makes the concentration a thousand times too small.",
        "Before we finish, remember these examination techniques. Name pipette and burette correctly. Swirl, and add dropwise near the end point. Use concordant titres. Convert cubic centimetres to cubic decimetres. Use the mole ratio from the balanced equation. Always state moles per cubic decimetre.",
        CLOSE,
    ]),
)

ELECTROLYSIS_IONS = LessonScript(
    slug="electrolysis-ions-electrodes",
    title="Electrolysis: Ions and Electrodes",
    subtitle="Electrolytes, anode, cathode and electron transfer",
    filename="jdscience-electrolysis-ions-electrodes-1080p.mp4",
    youtube_filename="JDScience_GCSE_Chemistry_Electrolysis_Ions.mp4",
    description="What an electrolyte is, how ions move, and what happens at the anode and cathode.",
    spec_codes=("C4.4.3.1", "Edx3.21", "Edx3.22"),
    spoken=_join([
        OPEN,
        "Today we begin electrolysis. By the end of this lesson you should be able to define an electrolyte, name the electrodes, describe the movement of ions, and explain that electrolysis is a redox process driven by electricity.",
        "Ionic compounds can only be electrolysed when their ions are free to move. In a solid ionic lattice the ions are locked in place, so solid sodium chloride does not conduct. When the compound is molten, or dissolved in water, the ions can move. A liquid or solution that contains free ions and therefore conducts is called an electrolyte.",
        "Two electrodes are dipped into the electrolyte and connected to a direct current supply. The anode is the positive electrode. The cathode is the negative electrode. A simple memory aid is that anode and acid both begin with a, and acids are associated with positive hydrogen ions, but it is safer just to learn: anode positive, cathode negative.",
        "Cations are positive ions. They are attracted to the negative cathode. Anions are negative ions. They are attracted to the positive anode. Opposite charges attract. In the electrolyte, ions carry the charge. In the wires, electrons carry the charge.",
        "At the cathode, positive ions gain electrons. Gaining electrons is reduction. At the anode, negative ions lose electrons. Losing electrons is oxidation. Electrolysis forces non-spontaneous redox reactions to happen by supplying electrical energy.",
        "The electrodes are often graphite, which is inert, meaning it does not usually take part in the reaction. In copper purification, which we will meet later, the electrodes are copper and they do take part. Never say that the electrolyte is the metal wire; the electrolyte is the molten compound or the solution.",
        "If you electrolyse molten lead bromide, brown bromine gas forms at the anode and a bead of silvery lead forms at the cathode. That classic experiment shows that the ionic compound has been broken down into its elements.",
        "Learn the labels until they are automatic. The cathode is negative, so positive ions are reduced there. The anode is positive, so negative ions are oxidised there. Graphite is used because it conducts and, in many school cells, it is inert. If the question shows a diagram, you should be able to mark the battery, the electrolyte and both electrodes.",
        "Let us work through an examination-style example. Why does solid potassium chloride not conduct electricity, but molten potassium chloride does? Where would potassium ions move during electrolysis?",
        "In the solid, ions cannot move. When molten, ions are free to move, so the liquid conducts. Potassium ions are positive, so they move to the cathode, the negative electrode, where they gain electrons to form potassium metal.",
        "Now it is your turn. This question is worth four marks.",
        "Explain, in terms of ions and electrons, what happens when a direct current is passed through an ionic electrolyte using inert electrodes. In your answer, name the anode and the cathode.",
        "Pause the video and try this question yourself. I will go through the model answer in a moment.",
        "Here is the model answer. The anode is the positive electrode and the cathode is the negative electrode. Positive ions move to the cathode and gain electrons, so they are reduced. Negative ions move to the anode and lose electrons, so they are oxidised. Electrons flow in the external circuit from anode to cathode.",
        "Marking points: electrode polarity, cation movement and reduction, anion movement and oxidation. Essential vocabulary is electrolyte, anode, cathode, cation, anion, oxidation and reduction.",
        "A common misconception is to say electrons flow through the electrolyte. Ions flow in the electrolyte; electrons flow in the metal wires. Another is to reverse anode and cathode. If you mix them up, every half-equation that follows will be wrong.",
        "Before we finish, remember these key ideas. Ions must be free to move, so the electrolyte is molten or dissolved. Anode is positive, cathode is negative. Cations are reduced at the cathode. Anions are oxidised at the anode. Solid ionic compounds do not conduct.",
        CLOSE,
    ]),
)

MOLTEN = LessonScript(
    slug="electrolysis-molten-ionic",
    title="Electrolysis of Molten Ionic Compounds",
    subtitle="Lead bromide, half-equations and extracting metals",
    filename="jdscience-electrolysis-molten-ionic-1080p.mp4",
    youtube_filename="JDScience_GCSE_Chemistry_Molten_Electrolysis.mp4",
    description="Electrolysis of molten ionic compounds, including lead bromide and aluminium extraction ideas.",
    spec_codes=("C4.4.3.2", "Edx3.23"),
    spoken=_join([
        OPEN,
        "Today we are looking at the electrolysis of molten ionic compounds. By the end of this lesson you should be able to predict the products, write half-equations for Higher Tier, and explain why this method is used to extract some metals.",
        "When a binary ionic compound is molten, the only ions present are the metal cation and the non-metal anion. That makes the products predictable. The metal forms at the cathode. The non-metal forms at the anode.",
        "The classic school example is molten lead bromide, P b Br two. Lead ions, P b two plus, move to the cathode and form lead metal. Bromide ions, Br minus, move to the anode and form bromine, a brown gas.",
        "The Higher Tier half-equations are as follows. At the cathode: P b two plus plus two electrons goes to P b. At the anode: two Br minus goes to Br two plus two electrons. Notice that two bromide ions are needed to make one bromine molecule, and the electrons cancel when you add the half-equations.",
        "Molten sodium chloride would give sodium at the cathode and chlorine at the anode. Molten aluminium oxide, in the industrial extraction of aluminium, gives aluminium at the cathode and oxygen at the anode. Cryolite is added to lower the melting point, which saves energy. That is an important examination point for aluminium.",
        "Why not reduce aluminium oxide with carbon? Aluminium is more reactive than carbon, so carbon cannot pull the oxygen away in a blast furnace. Electrolysis is needed for metals above carbon in the reactivity series, such as aluminium, magnesium and sodium. That is why these extractions are expensive: they use large amounts of electricity.",
        "The ionic compound must be molten, not solid. Heating to the melting point uses energy, which is another reason industrial electrolysis is costly. Graphite anodes in aluminium extraction slowly react with the oxygen produced, so they have to be replaced.",
        "State symbols matter in molten electrolysis. Lead bromide is liquid, lead metal is liquid at that temperature in the industrial sense of a molten bead, and bromine is a gas. In an exam, P b two plus plus two e minus goes to P b is enough for the cathode half-equation. Balance charge as well as atoms: two electrons cancel the two-plus charge.",
        "Let us work through an examination-style example. Predict the products at each electrode when molten zinc chloride is electrolysed, and write the half-equations.",
        "Zinc forms at the cathode: Z n two plus plus two electrons goes to Z n. Chlorine forms at the anode: two Cl minus goes to Cl two plus two electrons. The products are a metal and a halogen, as expected for a molten binary ionic compound.",
        "Now it is your turn. This question is worth four marks.",
        "Explain why aluminium is extracted by electrolysis rather than by heating with carbon, and state what you would observe at each electrode during the electrolysis of molten lead bromide.",
        "Pause the video and try this question yourself. I will go through the model answer in a moment.",
        "Here is the model answer. Aluminium is more reactive than carbon, so carbon cannot reduce aluminium oxide. Electrolysis is required. At the cathode in molten lead bromide, a silvery bead of lead forms. At the anode, brown bromine gas is produced.",
        "Marking points: reactivity compared with carbon, electrolysis required, lead at cathode, bromine at anode. Essential vocabulary is molten, half-equation, cathode, anode and reduction.",
        "A common misconception is to give hydrogen and oxygen as products of molten lead bromide. Hydrogen and oxygen appear in aqueous electrolysis because water is present. In the molten compound there is no water, so you get the metal and the non-metal only.",
        "Before we finish, remember these key ideas. Molten binary ionic compounds give the metal at the cathode and the non-metal at the anode. Write half-equations with electrons. Reactive metals are extracted by electrolysis because carbon cannot reduce their ores. Solid ionic compounds cannot be electrolysed.",
        CLOSE,
    ]),
)

AQUEOUS = LessonScript(
    slug="electrolysis-aqueous-solutions",
    title="Electrolysis of Aqueous Solutions",
    subtitle="Water competes: hydrogen, oxygen and halide rules",
    filename="jdscience-electrolysis-aqueous-solutions-1080p.mp4",
    youtube_filename="JDScience_GCSE_Chemistry_Aqueous_Electrolysis.mp4",
    description="Rules for aqueous electrolysis, including hydrogen versus metal at the cathode and halide versus oxygen at the anode.",
    spec_codes=("C4.4.3.4", "C4.4.3.5", "Edx3.24", "Edx3.25"),
    spoken=_join([
        OPEN,
        "Today we are looking at the electrolysis of aqueous solutions. This is where students lose marks, because water also provides ions. By the end of this lesson you should be able to apply the cathode rule and the anode rule, and predict products for common solutions.",
        "In water, there is a tiny amount of H plus and O H minus from the ionisation of H two O. So an aqueous solution of an ionic compound contains the ions of the solute and the ions from water. Those extra ions can be discharged instead of the solute ions.",
        "At the cathode, hydrogen is produced unless the metal in the solution is less reactive than hydrogen. In practice, for GCSE, if the metal is more reactive than hydrogen, such as sodium, potassium, calcium or magnesium, then hydrogen gas is given off at the cathode. If the metal is less reactive than hydrogen, such as copper or silver, the metal is deposited.",
        "At the anode, if a concentrated halide solution is used, the halogen is produced: chlorine, bromine or iodine. If the solution does not contain a halide, or is a very dilute chloride, oxygen is produced from the hydroxide ions or from water. For GCSE, learn: concentrated chloride gives chlorine at the anode; sulfate solutions give oxygen at the anode.",
        "Take sodium chloride solution, brine. Ions present: N a plus, Cl minus, H plus and O H minus. Sodium is more reactive than hydrogen, so hydrogen forms at the cathode. Chloride is a halide and the solution is concentrated, so chlorine forms at the anode. The leftover ions, N a plus and O H minus, make sodium hydroxide in the solution. That is the industrial chlor-alkali process.",
        "Take copper sulfate solution with inert graphite electrodes. Copper is less reactive than hydrogen, so copper metal plates onto the cathode. Sulfate is not a halide, so oxygen forms at the anode. The blue colour of the solution fades as copper ions are removed.",
        "Higher Tier half-equations you should recognise: two H plus plus two electrons goes to H two at the cathode when hydrogen is produced. Four O H minus goes to O two plus two H two O plus four electrons at the anode when oxygen is produced. Two Cl minus goes to Cl two plus two electrons for chlorine.",
        "Let us work through an examination-style example. Predict the products at each electrode when aqueous potassium iodide is electrolysed with inert electrodes, and explain the cathode product.",
        "Potassium is more reactive than hydrogen, so hydrogen forms at the cathode. Iodide is a halide, so iodine forms at the anode. We have applied both rules and named the gases or elements correctly.",
        "Now it is your turn. This question is worth five marks.",
        "A student electrolyses concentrated aqueous sodium chloride and then aqueous copper sulfate, both with graphite electrodes. Predict the product at each electrode in both experiments, and explain why the products at the cathode are different.",
        "Pause the video and try this question yourself. I will go through the model answer in a moment.",
        "Here is the model answer. For sodium chloride: hydrogen at the cathode and chlorine at the anode. For copper sulfate: copper at the cathode and oxygen at the anode. Sodium is more reactive than hydrogen, so hydrogen is discharged. Copper is less reactive than hydrogen, so copper is deposited.",
        "Marking points: four products and the reactivity comparison. Essential vocabulary is aqueous, discharged, inert electrodes, halide and reactivity. A common misconception is to write sodium metal at the cathode from brine. Sodium is too reactive; hydrogen is produced instead. Another is to write chlorine from copper sulfate; there is no chloride ion there, so the anode product is oxygen.",
        "Before we finish, remember these rules. Aqueous solutions include ions from water. Cathode: hydrogen unless the metal is less reactive than hydrogen. Anode: halogen from a concentrated halide, otherwise oxygen. Brine gives hydrogen, chlorine and sodium hydroxide. Copper sulfate with inert electrodes gives copper and oxygen.",
        CLOSE,
    ]),
)

COPPER = LessonScript(
    slug="copper-purification",
    title="Copper Purification by Electrolysis",
    subtitle="Impure anode, pure cathode and copper sulfate electrolyte",
    filename="jdscience-copper-purification-1080p.mp4",
    youtube_filename="JDScience_GCSE_Chemistry_Copper_Purification.mp4",
    description="Purifying copper by electrolysis, including electrode reactions, sludge and why the electrolyte stays blue.",
    spec_codes=("C4.4.3.3", "Edx3.26"),
    spoken=_join([
        OPEN,
        "Today we are looking at the purification of copper by electrolysis. By the end of this lesson you should be able to label the cell, write the electrode reactions, and explain what happens to impurities.",
        "Copper used for electrical wiring must be very pure, because impurities increase electrical resistance. Blister copper from the blast furnace or converter is purified by electrolysis. High-purity copper is also used in electronic circuits, where even a small increase in resistance wastes energy as heat.",
        "The electrolyte is aqueous copper sulfate. The anode is a large plate of impure copper. The cathode is a thin sheet of pure copper. This is different from the inert graphite electrodes in the last lesson. Here the electrodes take part.",
        "At the impure copper anode, copper atoms lose electrons and go into solution as copper two plus ions. The half-equation is C u goes to C u two plus plus two electrons. The anode dissolves and gets smaller.",
        "At the pure copper cathode, copper two plus ions from the solution gain electrons and are deposited as copper metal. C u two plus plus two electrons goes to C u. The cathode gets thicker with a coating of pure copper.",
        "Impurities in the anode either fall to the bottom as an anode sludge, or stay in solution if they are more reactive than copper. The sludge can contain valuable metals such as silver and gold, which helps to pay for the process.",
        "The concentration of copper ions in the electrolyte stays approximately constant, because for every copper ion deposited at the cathode, another copper ion enters from the anode. That is why the blue colour does not fade in purification, whereas it does fade when inert electrodes are used with copper sulfate.",
        "This is still redox. Oxidation is at the anode, where copper atoms lose electrons. Reduction is at the cathode, where copper ions gain electrons. The same element is oxidised at one electrode and reduced at the other.",
        "If you are shown a diagram, label the impure copper as the anode connected to the positive terminal, the pure copper as the cathode connected to the negative terminal, and copper sulfate solution as the electrolyte. A mass increase at the cathode and a mass decrease at the anode is the quantitative signature of this process.",
        "Let us work through an examination-style example. Why does the impure anode lose mass, why does the pure cathode gain mass, and why does the blue colour remain?",
        "Copper atoms leave the anode as ions, so the anode mass falls. Those ions, together with ions already in the electrolyte, are deposited as metal on the cathode, so the cathode mass rises. Copper ions are replaced at the same rate they are removed, so the solution stays blue.",
        "Now it is your turn. This question is worth four marks.",
        "Describe how copper is purified by electrolysis. Include the names of the electrodes and the electrolyte, and write the half-equation for the reaction at the cathode.",
        "Pause the video and try this question yourself. I will go through the model answer in a moment.",
        "Here is the model answer. The electrolyte is copper sulfate solution. The anode is impure copper and the cathode is pure copper. Copper ions are reduced at the cathode: C u two plus plus two electrons goes to C u. Impurities fall away from the anode as sludge.",
        "Marking points: electrolyte, electrode materials, cathode half-equation, impurities as sludge. Essential vocabulary is anode, cathode, electrolyte, oxidised and reduced. A common misconception is to use graphite electrodes in the purification diagram. Another is to say the blue colour fades; that is the inert-electrode experiment, not purification.",
        "Before we finish, remember these key ideas. Impure copper is the anode, pure copper is the cathode, and copper sulfate is the electrolyte. The anode dissolves. Pure copper plates onto the cathode. Impurities form a sludge. The blue colour stays because copper ions are replaced. Inert electrodes with copper sulfate are a different experiment.",
        CLOSE,
    ]),
)

SYNOPTIC = LessonScript(
    slug="chemical-changes-exam-practice",
    title="Chemical Changes: Exam Practice",
    subtitle="Acids, salts and electrolysis in one examination paper",
    filename="jdscience-chemical-changes-exam-practice-1080p.mp4",
    youtube_filename="JDScience_GCSE_Chemistry_Chemical_Changes_Exam.mp4",
    description="Synoptic GCSE practice covering acids, salt-making, titration ideas and electrolysis rules.",
    spec_codes=("C4.4.2", "C4.4.3", "Edx3"),
    spoken=_join([
        OPEN,
        "Today we are going to pull the chemical-changes topic together and practise the way GCSE papers actually ask questions. By the end of this lesson you should be able to choose the right reaction pattern, the right salt-making method, and the right electrolysis products in one mixed problem.",
        "Keep this map in your head. Acids produce H plus. Alkalis produce O H minus. Acid plus metal, if the metal is reactive enough, gives salt plus hydrogen. Acid plus oxide or hydroxide gives salt plus water. Acid plus carbonate gives salt plus water plus carbon dioxide. Hydrogen pops, oxygen relights a glowing splint, carbon dioxide turns limewater milky.",
        "Soluble salts from an insoluble base: excess solid, filter, crystallise. Insoluble salts: precipitation, filter, wash, dry. Both reactants soluble: titration with a pipette, burette and indicator, then moles equals concentration times volume.",
        "Electrolysis: ions must move, so molten or dissolved. Anode positive, cathode negative. Molten binary compounds give the metal and the non-metal. Aqueous solutions follow the hydrogen and halide rules. Copper purification uses an impure copper anode and a pure copper cathode.",
        "Higher Tier extra tools are ionisation of strong and weak acids, electron half-equations, and the factor of ten per pH unit. If a question has a Higher Tier tag, look for electrons or fully ionised.",
        "When you revise, practise writing the three acid equations from memory, then the two salt methods, then the three electrolysis cases. That sequence matches how mixed six-mark questions are built. Always name the gas test in full: lighted splint, glowing splint, or limewater turning milky.",
        "Let us work through a synoptic worked example. A student has dilute sulfuric acid. In experiment one they add magnesium. In experiment two they add copper carbonate. In experiment three they electrolyse the leftover copper sulfate solution with graphite electrodes. What happens in each experiment?",
        "Experiment one: magnesium chloride is not formed, because the acid is sulfuric, so the salt is magnesium sulfate, plus hydrogen, which pops with a lighted splint. Experiment two: copper sulfate, water and carbon dioxide. Limewater turns milky. Experiment three: copper at the cathode, oxygen at the anode, and the blue colour fades because copper ions are not replaced when the electrodes are inert.",
        "Notice how one acid leads to three different product sets. Examiners stitch topics together like this.",
        "Now it is your turn. This synoptic question is worth six marks.",
        "A sample of impure copper is purified by electrolysis, and a separate sample of molten lead bromide is electrolysed. For each process, name the product at the positive electrode and the product at the negative electrode. Then explain one difference between aqueous copper sulfate with graphite electrodes and copper purification, in terms of the colour of the electrolyte.",
        "Pause the video and try this question yourself. I will go through the model answer in a moment.",
        "Here is the model answer. Copper purification: oxygen is not produced at the anode; copper ions enter the solution as the impure anode dissolves, and pure copper forms at the cathode. So the positive electrode product is copper ions going into solution, observed as the anode shrinking, and the negative electrode product is pure copper metal. For molten lead bromide: bromine at the positive electrode and lead at the negative electrode. With graphite electrodes in copper sulfate the blue colour fades as copper ions are removed. In purification the blue colour remains because copper ions are replaced at the anode.",
        "If you wrote oxygen at the purification anode you have mixed up the two copper experiments. That is the most common misconception in this topic. Essential vocabulary is anode, cathode, electrolyte, inert, and molten.",
        "A second common error is to give sodium metal from brine, or hydrogen from molten lead bromide. Apply the right rule to the right system: molten means no water; aqueous means water competes; purification means the copper electrodes take part.",
        "Before we finish, remember the examination technique. Identify the type of reaction first. Name products using the acid and the metal. Quote the correct gas test. For electrolysis, first ask: molten, aqueous or purification? Then apply one rule only. Write half-equations if the paper is Higher Tier. And always include units in titration calculations.",
        CLOSE,
    ]),
)


LESSONS: list[LessonScript] = [
    ACIDS_BASES,
    INDICATORS,
    STRONG_WEAK,
    ACIDS_METALS,
    NEUTRALISATION,
    SALTS,
    TITRATION,
    ELECTROLYSIS_IONS,
    MOLTEN,
    AQUEOUS,
    COPPER,
    SYNOPTIC,
]

BY_SLUG = {lesson.slug: lesson for lesson in LESSONS}
