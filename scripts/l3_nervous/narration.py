"""Spoken narration for the Level 3 nerve-impulse and synapse series.

British English. Key terms are defined before they are used.
Each part opens with the authorised greeting and closes with subscribe plus
jdscience.co.uk. Paragraphs are the TTS chunk boundaries.
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
    youtube_filename: str
    spoken: str
    series: str
    part: str
    description: str = ""
    tier: str = "Level 3 Science"


def _join(paragraphs: list[str]) -> str:
    return "\n\n".join(p.strip() for p in paragraphs if p.strip())


OPEN = "Hello and welcome back to JD Science."
CLOSE = (
    "If this explanation has helped, please subscribe to JD Science for more lessons. "
    "You can find further learning resources and practice questions at jdscience.co.uk. "
    "Thank you for watching."
)


IMPULSE_1 = LessonScript(
    slug="nerve-impulse-part-1",
    spec="L3.1",
    title="Transmission of a Nerve Impulse",
    subtitle="Part 1  ·  Neurone structure and resting potential",
    filename="jdscience-nerve-impulse-part-1-1080p.mp4",
    youtube_filename="JDScience_L3_Nerve_Impulse_Part_1.mp4",
    series="Transmission of a Nerve Impulse",
    part="Part 1 of 3",
    description="Neurone structure, resting potential, ion gradients, the sodium–potassium pump and potassium leak channels.",
    spoken=_join([
        OPEN,
        "This is part one of our Level 3 lesson on the transmission of a nerve impulse. A nerve impulse is a brief electrical signal that travels along a neurone. A neurone is a specialised nerve cell that carries information from one place in the body to another.",
        "Look first at a real stained motor neurone from the spinal cord. The large purple cell bodies and the surrounding fibres are genuine tissue. A light micrograph can show the cell body and processes, but it cannot show the ions that create the impulse, so we now switch to a labelled scientific diagram.",
        "The cell body contains the nucleus and most of the cytoplasm. Short, branched dendrites receive incoming signals and pass them towards the cell body. The axon is a long process that carries the impulse away from the cell body towards another cell.",
        "The axon is bounded by a plasma membrane, which is a phospholipid bilayer with proteins in it. In many neurones, a myelin sheath wraps around the axon. Myelin is made by Schwann cells in the peripheral nervous system and acts as an electrical insulator. The gaps between adjacent Schwann cells are the nodes of Ranvier. At each node the membrane is exposed to the extracellular fluid. Those nodes will matter when we look at how the impulse travels quickly.",
        "A nerve impulse is an action potential travelling along the axon. An action potential is a rapid, temporary reversal of the electrical charge across the membrane. Before that reversal can happen, we must understand the resting state.",
        "At rest, the inside of the axon is negative compared with the outside. That potential difference is the resting potential, about minus seventy millivolts. The unit is the millivolt, one thousandth of a volt. Because opposite charges are separated across the membrane, we say the membrane is polarised.",
        "The ions are not evenly shared. Sodium ions, shown in amber, are far more concentrated outside the axon. Potassium ions, shown in teal, are far more concentrated inside. Large negative organic ions, such as proteins, remain inside because they cannot cross the membrane.",
        "The sodium–potassium pump maintains those concentration gradients. It is a membrane protein that uses ATP, the cell's energy currency. For each cycle, three sodium ions are moved out and two potassium ions are moved in. That is active transport, against their concentration gradients. Because three positive ions leave for every two that enter, the pump also makes the inside a little more negative.",
        "The membrane is selectively permeable, which means it does not treat every ion the same way. At rest it is much more permeable to potassium than to sodium. Potassium leak channels stay open, so some potassium ions diffuse out down their concentration gradient. As those positive ions leave, the inside becomes more negative. Sodium channels are mostly closed at rest, so sodium cannot easily flood back in.",
        "Put those ideas together. The pump keeps sodium high outside and potassium high inside. Potassium leak channels let some potassium leave. Impermeant negative ions stay inside. The result is a polarised membrane at about minus seventy millivolts. That is the resting potential. The pump does not fire the impulse. It quietly maintains the gradients that make an impulse possible.",
        "Here is a worked examination-style example. A student writes, the sodium–potassium pump creates the resting potential by pumping sodium in and potassium out. Identify two scientific errors and correct them.",
        "The first error is the direction. The pump moves three sodium ions out, not in, and two potassium ions in, not out. The second error is the claim that the pump alone creates the resting potential. The pump maintains the gradients. Potassium leak channels and the trapped negative ions are also essential.",
        "Now pause the video and try this sequencing question. Place these four statements in the order that establishes a resting potential. A: the sodium–potassium pump uses ATP. B: sodium stays high outside and potassium stays high inside. C: potassium leaks out through open leak channels. D: the membrane is polarised at about minus seventy millivolts.",
        "Here is a model answer. First A, the pump uses ATP. That produces B, the unequal ion distribution. Then C, potassium leaks out. That produces D, a polarised membrane at about minus seventy millivolts.",
        "In part two we will see how a stimulus changes this polarised membrane into an action potential, and we will build the graph as each phase happens. " + CLOSE,
    ]),
)


IMPULSE_2 = LessonScript(
    slug="nerve-impulse-part-2",
    spec="L3.2",
    title="Transmission of a Nerve Impulse",
    subtitle="Part 2  ·  The action potential",
    filename="jdscience-nerve-impulse-part-2-1080p.mp4",
    youtube_filename="JDScience_L3_Nerve_Impulse_Part_2.mp4",
    series="Transmission of a Nerve Impulse",
    part="Part 2 of 3",
    description="Threshold, all-or-nothing, depolarisation, repolarisation, hyperpolarisation and a synchronised action-potential graph.",
    spoken=_join([
        OPEN,
        "This is part two of our Level 3 lesson on the transmission of a nerve impulse. In part one we left the axon polarised at about minus seventy millivolts. Now we will watch that membrane reverse and recover, and we will draw the action-potential graph as each event happens.",
        "A stimulus is any change that can affect the membrane, such as a neurotransmitter arriving at a dendrite, or an artificial current in an experiment. If the stimulus is strong enough, the membrane potential at one region moves from minus seventy millivolts towards a threshold value of about minus fifty-five millivolts.",
        "Threshold is the critical voltage at which voltage-gated sodium channels open in large numbers. Voltage-gated means the channel's shape depends on the membrane potential. Below threshold, too few of those channels open, the sodium that enters is pumped or leaks away, and the membrane returns to rest. That failed rise is not an action potential.",
        "If threshold is reached, the response is all-or-nothing. The action potential always reaches about the same peak, around plus thirty to plus forty millivolts. A stronger stimulus does not make a taller spike. It can only make action potentials more frequent, once the membrane has recovered.",
        "Look at the graph. The horizontal axis is time in milliseconds. The vertical axis is membrane potential in millivolts. Zero millivolts is drawn as a dashed line. Resting potential sits near minus seventy. Threshold is marked near minus fifty-five. The peak is near plus thirty-five.",
        "Depolarisation is the rising phase. Voltage-gated sodium channels open and sodium ions rush in down their electrochemical gradient. The inside rapidly becomes less negative, then positive. The membrane is now depolarised. On the graph, this is the steep upstroke from threshold to the peak.",
        "At the peak, two things change. The voltage-gated sodium channels become inactivated. Inactivation is not the same as simply closing. A part of the protein blocks the open pore from the inside, so sodium entry stops even though the membrane is still positive. At the same time, voltage-gated potassium channels open. They are slower to open than the sodium channels.",
        "Repolarisation is the falling phase. Potassium ions leave the axon through those open voltage-gated potassium channels. Positive charge leaves, so the inside becomes negative again. This rapid fall is caused by potassium efflux and sodium inactivation. It is not caused by the sodium–potassium pump. The pump is far too slow to produce this millisecond downstroke. The pump's job is to restore the ion gradients afterwards.",
        "The membrane often goes a little more negative than rest. That undershoot is hyperpolarisation, sometimes called after-hyperpolarisation. It happens because voltage-gated potassium channels are still open for a short time. As they close, and as leak channels and the pump continue their resting work, the potential returns towards minus seventy millivolts.",
        "Follow the graph once more. Rest at minus seventy. A stimulus lifts the potential to threshold. Sodium enters and the trace shoots to about plus thirty-five. Sodium channels inactivate, potassium leaves, and the trace falls. A brief dip below minus seventy, then a return to rest. The whole event lasts about two to four milliseconds in a typical axon.",
        "Here is a worked examination-style example. The graph is at plus thirty-five millivolts. Describe the state of the voltage-gated sodium channels and the voltage-gated potassium channels, and name the phase that follows.",
        "At the peak, voltage-gated sodium channels are inactivated, so sodium can no longer enter. Voltage-gated potassium channels are open, so potassium is leaving. The phase that follows is repolarisation, as the inside becomes negative again.",
        "Now pause the video and try this. A student says, the sodium–potassium pump causes the falling phase of the action potential by pumping sodium out. Identify the misconception and write a corrected sentence.",
        "Here is a model answer. That statement is wrong. The falling phase is repolarisation, caused by potassium ions leaving through voltage-gated potassium channels after the sodium channels inactivate. The pump later restores the sodium and potassium gradients, but it does not produce the rapid downstroke.",
        "In part three we will see how this local reversal starts the next region of axon, why the impulse travels in one direction, and how myelin makes conduction faster. " + CLOSE,
    ]),
)


IMPULSE_3 = LessonScript(
    slug="nerve-impulse-part-3",
    spec="L3.3",
    title="Transmission of a Nerve Impulse",
    subtitle="Part 3  ·  Propagation and saltatory conduction",
    filename="jdscience-nerve-impulse-part-3-1080p.mp4",
    youtube_filename="JDScience_L3_Nerve_Impulse_Part_3.mp4",
    series="Transmission of a Nerve Impulse",
    part="Part 3 of 3",
    description="Local currents, the refractory period, one-way propagation, firing frequency and saltatory conduction.",
    spoken=_join([
        OPEN,
        "This is part three of our Level 3 lesson on the transmission of a nerve impulse. We now have a full action potential in one patch of membrane. The remaining question is how that event travels, and why it does not bounce backwards.",
        "When sodium ions enter during depolarisation, the inside of that region becomes positive. Those positive charges spread sideways as local currents. Just ahead of the active region, the local current depolarises the neighbouring membrane towards threshold. Voltage-gated sodium channels there open, and a new action potential is born. The impulse is not a single particle racing down the axon. It is a chain of action potentials, each triggering the next.",
        "Why does the impulse not also travel backwards into membrane that has just fired? The answer is the refractory period. Immediately after an action potential, voltage-gated sodium channels are inactivated. For a short time, no new action potential can start in that patch, however strong the stimulus. That is the absolute refractory period.",
        "As the sodium channels recover from inactivation, a stronger-than-normal stimulus can start another action potential. That interval is the relative refractory period, and it overlaps with hyperpolarisation, when the membrane is even further from threshold. Together, these refractory stages do two important jobs. They force one-way propagation, towards resting membrane ahead and away from inactivated membrane behind. They also set a maximum firing frequency, because a second spike cannot start until the sodium channels have recovered.",
        "In an unmyelinated axon, every neighbouring patch must depolarise in turn. The impulse creeps along the membrane. In a myelinated axon the picture changes. Myelin is an insulator. Ion flow across the membrane is largely restricted to the nodes of Ranvier, where voltage-gated channels are concentrated. Local currents travel quickly under the myelin to the next node. The action potential appears to jump from node to node. That is saltatory conduction, from the Latin for leaping.",
        "Saltatory conduction is faster and more energy-efficient. Fewer ions need to be pumped back, because fewer stretches of membrane exchange ions. Increasing axon diameter also speeds conduction, because local currents travel more easily inside a wider axon. Those two adaptations, myelin and diameter, explain why some fibres carry urgent signals so quickly.",
        "Here is a worked examination-style example. Explain how the refractory period produces one-way transmission along an axon, and how it limits the number of impulses that can be sent each second.",
        "Behind the active region, sodium channels are inactivated, so local currents cannot restart an action potential there. Ahead, the membrane is still at rest, so it can reach threshold. Because each patch must recover before it can fire again, there is a minimum time between spikes, and that limits firing frequency.",
        "Now pause the video and try this matching activity. Match each structure or event to its function. One: myelin sheath. Two: node of Ranvier. Three: local currents. Four: absolute refractory period. Choose from: prevents immediate re-firing; jumps the impulse to the next exposed membrane; insulates the axon; depolarises the neighbouring region to threshold.",
        "Here is a model answer. The myelin sheath insulates the axon. The node of Ranvier is where the impulse is regenerated, so the signal jumps from node to node. Local currents depolarise the neighbouring region to threshold. The absolute refractory period prevents immediate re-firing and so keeps propagation one-way.",
        "That completes transmission of a nerve impulse. The electrical signal has travelled along the axon. In the next topic we will see what happens when it reaches a chemical synapse, where the message must cross a gap using a neurotransmitter. " + CLOSE,
    ]),
)


SYNAPSE_1 = LessonScript(
    slug="chemical-synapse-part-1",
    spec="L3.4",
    title="Transmission at a Chemical Synapse",
    subtitle="Part 1  ·  Structure and chemical transmission",
    filename="jdscience-chemical-synapse-part-1-1080p.mp4",
    youtube_filename="JDScience_L3_Chemical_Synapse_Part_1.mp4",
    series="Transmission at a Chemical Synapse",
    part="Part 1 of 2",
    description="Synapse structure, calcium entry, acetylcholine release by exocytosis, receptor binding and the postsynaptic potential.",
    spoken=_join([
        OPEN,
        "This is part one of our Level 3 lesson on transmission at a chemical synapse. Along the axon, the signal is electrical. An action potential is a wave of membrane depolarisation. Neurones do not usually touch the next cell. There is a tiny gap, so the message must be converted into a chemical form to cross it.",
        "A synapse is the specialised junction between a neurone and the next cell, which may be another neurone or an effector such as a muscle fibre. Look first at a real electron micrograph of a neuromuscular junction. You can see a packed terminal and a folded postsynaptic membrane, but the individual vesicles and ions are clearer on a diagram, so we now use a labelled scientific illustration.",
        "The neurone that arrives is the presynaptic neurone. Its swollen ending is the synaptic knob, or synaptic bouton. Inside the knob are mitochondria and many synaptic vesicles. Each vesicle is a membrane sac filled with neurotransmitter. A neurotransmitter is a chemical that carries the signal across the gap. In this lesson the named example is acetylcholine.",
        "The gap itself is the synaptic cleft, about twenty nanometres wide. The membrane of the next cell is the postsynaptic membrane. Embedded in it are specific receptor proteins. Those receptors recognise acetylcholine and are linked to ion channels.",
        "An action potential arrives at the presynaptic terminal by electrical propagation along the axon. That depolarisation opens voltage-gated calcium channels in the knob membrane. Calcium ions are far more concentrated outside, so they enter the knob down their electrochemical gradient.",
        "The rise in calcium inside the knob is the trigger for vesicle movement. Vesicles are drawn to the presynaptic membrane and fuse with it. Fusion releases acetylcholine into the cleft by exocytosis. Exocytosis means the vesicle membrane joins the plasma membrane and the contents are emptied outside the cell.",
        "Acetylcholine molecules then diffuse across the synaptic cleft. Diffusion is passive movement from high to low concentration. They bind to specific receptors on the postsynaptic membrane. Binding opens ligand-gated ion channels. Ligand-gated means the channel is opened by a chemical messenger, not by voltage. At a nicotinic acetylcholine synapse, those channels allow sodium ions to enter the postsynaptic cell.",
        "Sodium entry produces a postsynaptic potential, a local change in membrane voltage. If enough receptors are activated, and if the depolarisation at the axon hillock of the next neurone reaches threshold, voltage-gated sodium channels open and a new action potential is generated. The electrical signal has been rebuilt on the far side of the gap.",
        "Notice the contrast. Along the axon, charged ions move through voltage-gated channels and the impulse is electrical. Across the cleft, the message is a chemical, acetylcholine, travelling by diffusion. That conversion is why a typical chemical synapse is slower than axonal conduction, and why it can be modified by drugs or enzymes.",
        "Here is a worked examination-style example. Place these events in order, starting from the moment the action potential arrives. Calcium channels open. Calcium enters. Vesicles fuse. Acetylcholine is released by exocytosis. Acetylcholine diffuses and binds. Ligand-gated sodium channels open. A postsynaptic potential forms.",
        "The order is exactly that sequence. Arrival, calcium entry, exocytosis, diffusion, receptor binding, ligand-gated sodium influx, then a postsynaptic potential that may start a new action potential.",
        "Now pause the video and try this. On the synapse diagram, decide which structure releases acetylcholine and which structure binds it. Then state whether that arrangement allows the signal to travel backwards.",
        "Here is a model answer. Acetylcholine is released from vesicles in the presynaptic knob. It binds to receptors on the postsynaptic membrane. Because the vesicles are only on one side and the receptors are only on the other, a typical chemical synapse cannot send the signal backwards.",
        "In part two we will see how acetylcholine is removed, how choline is recycled, and why that clean-up is essential for repeated, one-way transmission. " + CLOSE,
    ]),
)


SYNAPSE_2 = LessonScript(
    slug="chemical-synapse-part-2",
    spec="L3.5",
    title="Transmission at a Chemical Synapse",
    subtitle="Part 2  ·  Removal, recycling and one-way transmission",
    filename="jdscience-chemical-synapse-part-2-1080p.mp4",
    youtube_filename="JDScience_L3_Chemical_Synapse_Part_2.mp4",
    series="Transmission at a Chemical Synapse",
    part="Part 2 of 2",
    description="Acetylcholinesterase, choline recycling, one-way transmission and the distinction between electrical and chemical signalling.",
    spoken=_join([
        OPEN,
        "This is part two of our Level 3 lesson on transmission at a chemical synapse. In part one, acetylcholine crossed the cleft and opened ligand-gated sodium channels. If that acetylcholine stayed bound, the postsynaptic membrane would keep depolarising and control would be lost. The transmitter must be removed.",
        "At a cholinergic synapse, removal is not mainly by reuptake of the intact molecule. The enzyme acetylcholinesterase is found in the cleft and on the postsynaptic membrane. It hydrolyses acetylcholine into acetate and choline. Hydrolysis means water is used to split the molecule. Once split, acetylcholine can no longer bind its receptor, so the ligand-gated channels close.",
        "Choline is then recycled. A transporter in the presynaptic membrane takes choline back into the knob. Inside the knob, choline is combined with acetyl-coenzyme A to remake acetylcholine, and the new transmitter is packaged into vesicles, ready for the next impulse. Acetate does not have to follow the same path. The important exam point is that choline is reused.",
        "This clean-up has two consequences. First, each action potential produces a brief pulse of transmitter rather than a continuous flood, so the postsynaptic cell can respond again. Second, it supports one-way transmission. Vesicles and the machinery for release sit in the presynaptic knob. Receptors and, in this example, acetylcholinesterase sit across the cleft. There is no store of acetylcholine waiting in the postsynaptic cell to be released backwards.",
        "That is why a typical chemical synapse is one-way, while an axon can carry an action potential in either direction if you stimulate it in the middle. In the body, the refractory period keeps axonal travel one-way. At the synapse, the one-way rule is structural: release machinery on one side, receptors on the other.",
        "Keep the two modes of transmission distinct. Electrical propagation along the axon uses local currents and voltage-gated sodium and potassium channels. Chemical transmission across the cleft uses calcium entry, vesicle fusion, a neurotransmitter, diffusion, and ligand-gated channels. Students sometimes write that the impulse jumps the gap electrically. In a typical chemical synapse it does not. The electrical signal stops, a chemical crosses, and a new electrical signal may start.",
        "Here is a worked examination-style example. Explain how acetylcholinesterase and choline recycling allow a synapse to transmit repeated impulses, and why transmission is one-way.",
        "Acetylcholinesterase splits acetylcholine so the receptors are freed and the channels close. Choline returns to the knob and is used to remake acetylcholine for the next vesicles. Transmission is one-way because neurotransmitter is released only from the presynaptic side and receptors are only on the postsynaptic side.",
        "Now pause the video and try this misconception question. A student writes, after release, acetylcholine is pumped straight back into the vesicle, and that is why the synapse is one-way. Correct the two errors.",
        "Here is a model answer. Acetylcholine is first broken down by acetylcholinesterase to acetate and choline. Choline, not intact acetylcholine, is taken back into the presynaptic knob and reused. The synapse is one-way because vesicles and receptors are on opposite sides, not because a pump returns the whole transmitter to the vesicle.",
        "You now have the full sequence, from a polarised axon, through an action potential and saltatory conduction, to chemical transmission and clean-up at a synapse. Use the interactive activity to sequence the stages and to check the channel functions. " + CLOSE,
    ]),
)


LESSONS = [IMPULSE_1, IMPULSE_2, IMPULSE_3, SYNAPSE_1, SYNAPSE_2]
BY_SLUG = {lesson.slug: lesson for lesson in LESSONS}
