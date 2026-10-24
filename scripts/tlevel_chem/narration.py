"""Spoken narration for the A11.1 collision-theory pilot.

Display titles stay on screen. Spoken text expands units so the cloned voice
reads them naturally. The opening line is fixed.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class LessonScript:
    slug: str
    spec: str
    title: str
    subtitle: str
    filename: str
    spoken: str


def _join(paragraphs: list[str]) -> str:
    return "\n\n".join(p.strip() for p in paragraphs if p.strip())


A11_1 = LessonScript(
    slug="a11-1-collision-theory",
    spec="A11.1",
    title="Principles of Collision Theory",
    subtitle="Activation energy and spatial orientation",
    filename="jdscience-a11-1-collision-theory-1080p.mp4",
    spoken=_join([
        "Hello and welcome back to JD Science.",
        "In today's T-Level Chemistry lesson, we are going to study A eleven point one, Principles of Collision Theory.",
        "By the end of this lesson, you should be able to explain why reacting particles must collide, define activation energy, distinguish successful and unsuccessful collisions, and explain why particles must also meet in the correct spatial orientation.",
        "Let us start with a simple question. Two reactant particles collide. Must a reaction always occur?",
        "The answer is no. Many collisions are unsuccessful.",
        "In many reactions, existing bonds have to break before atoms can rearrange and new bonds can form. That process needs energy, and it also needs the right parts of the particles to meet.",
        "So what might prevent a collision from producing products? The collision may have insufficient energy, or it may have an unsuitable spatial orientation.",
        "Those two conditions are the heart of collision theory.",
        "Here is the central idea. For a reaction to occur, reactant particles must collide. A collision alone is not enough.",
        "A successful collision must satisfy the energy requirement and the orientation requirement. If either requirement is not met, the collision is unsuccessful and products do not form.",
        "Let us take the energy requirement first. This is specification point A eleven point one point one.",
        "Activation energy is the minimum energy that colliding particles must have for a successful reaction.",
        "Particles need enough collision energy for the required bonds to break and for atoms to rearrange. New bonds can then form as products are produced.",
        "A collision with energy below the activation energy is unsuccessful.",
        "Watch this first animation. Two reactant particles approach and collide, but the collision energy is less than the activation energy.",
        "The required bond breaking cannot occur. The particles separate without forming the specified products.",
        "Now watch a higher-energy collision. The particles collide with energy equal to or greater than the activation energy.",
        "There is now enough energy for the required bond changes. If the orientation is also correct, the collision can be successful, and products can form.",
        "This next point is easy to miss, and it is worth a mark in an examination question.",
        "Energy is necessary, but it is not sufficient. A collision can have enough energy and still fail.",
        "The reacting parts of the particles must also meet in a suitable orientation. Collision theory therefore uses two tests: sufficient energy, and correct spatial orientation.",
        "That prevents the misconception that every high-energy collision must react.",
        "Use this decision rule. If collision energy is less than activation energy, the collision is unsuccessful because of insufficient energy.",
        "If collision energy is equal to or greater than activation energy, the energy requirement is satisfied, but you must still check orientation.",
        "A complete explanation refers to sufficient energy for the required bond breaking and rearrangement, and to the formation of new bonds.",
        "Now specification point A eleven point one point two: spatial orientation.",
        "Reacting particles have a three-dimensional arrangement. For some collisions, particular atoms or reactive regions must meet one another.",
        "If the particles approach in an unsuitable orientation, the necessary bond changes cannot occur, even if they touch.",
        "Correct spatial orientation is therefore a second requirement for a successful collision.",
        "Watch an incorrect orientation. The particles collide, but the required reactive regions do not meet appropriately, so there is no reaction.",
        "Now watch a correct orientation. The relevant parts of the reactants meet. The required bond rearrangement can occur if the collision energy is also sufficient.",
        "Orientation is about how particles meet, not simply whether they touch.",
        "Put the two tests together. Test one: is the collision energy at least the activation energy? Test two: are the particles aligned so the required atoms or regions can interact?",
        "Both yes: a successful collision is possible. Either no: the collision is unsuccessful.",
        "Let us apply this to numbers taken from the lesson.",
        "Reaction X has an activation energy of forty five kilojoules per mole.",
        "Collision A has thirty kilojoules per mole and the correct orientation. Is it successful?",
        "No. Thirty is below forty five, so the collision is unsuccessful because of insufficient energy, even though the orientation is correct.",
        "Collision B has fifty five kilojoules per mole, but the orientation is incorrect.",
        "The energy is sufficient, but the spatial orientation is wrong, so the collision is still unsuccessful.",
        "Collision C has fifty kilojoules per mole and the correct orientation.",
        "Energy exceeds activation energy and orientation is correct, so a successful collision is possible.",
        "Notice the pattern. Correct orientation cannot compensate for low energy, and high energy cannot compensate for the wrong orientation. Both conditions are required.",
        "Here are four misconceptions to avoid.",
        "Particles do not react whenever they collide. Energy and orientation conditions must be satisfied.",
        "Activation energy is not energy released by a reaction. It is the minimum energy required for a successful collision.",
        "Enough energy does not guarantee a reaction, because spatial orientation must also be correct.",
        "And correct orientation cannot make up for collision energy below the activation energy.",
        "Let us finish with an examination-style question.",
        "A reaction occurs when particles P and Q collide. The activation energy is sixty two kilojoules per mole.",
        "Part a. Collision one has fifty eight kilojoules per mole and the correct orientation. Explain why it is unsuccessful. That is worth two marks.",
        "Fifty eight is below sixty two, so there is insufficient energy for the required bond changes.",
        "Part b. Collision two has seventy kilojoules per mole but incorrect orientation. Explain why it is unsuccessful. Two marks.",
        "The energy exceeds the activation energy, but the particles are not in the correct spatial orientation for the required interaction.",
        "Part c. State the conditions needed for a collision between P and Q to form products. Two marks.",
        "Collision energy must be at least the activation energy, and the particles must have the correct spatial orientation.",
        "Part d. Explain why collision theory predicts that many collisions do not produce a reaction. Two marks.",
        "Many collisions fail one or both requirements: insufficient energy, or incorrect orientation, or both.",
        "Before we finish, complete the model.",
        "Reactant particles must collide. The collision must have energy at least equal to the activation energy. That energy is needed so bonds can break and new bonds can form. The particles must also have the correct spatial orientation. Only collisions that satisfy both requirements are successful collisions.",
        "If you found this useful, please subscribe to J D Science, and visit j d science dot co dot u k for more explanations, worksheets and T-Level Chemistry lessons.",
    ]),
)

LESSONS = [A11_1]
BY_SLUG = {lesson.slug: lesson for lesson in LESSONS}
