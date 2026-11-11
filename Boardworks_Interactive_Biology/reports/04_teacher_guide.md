# Teacher guide – reconstructed nervous system presentations

Four macro-free PowerPoints for an A-level (A2) lesson sequence on the nervous system. They follow the Boardworks 2009 course structure. Original course © Boardworks Ltd 2009.

## Before the lesson

1. Open the `.pptx` in **desktop Microsoft PowerPoint** (not Google Slides if you can avoid it).
2. File → Info should **not** mention macros. Enable Content is not required.
3. Start the show with **F5**. Buttons do nothing in the editor.
4. Put Contents on a presenter remote “home” if you like: each file has a Contents slide with jumps into activities.

Suggested timings for a double lesson each:

- Part 1 Organisation – 45–60 min  
- Part 2 Nerve impulse – 60–75 min (longest animation set)  
- Part 3 Sensory receptors – 40–50 min  
- Part 4 Synapse – 40–50 min  

## How every activity works

- **Next / Back arrows** (bottom corners) move through the teaching sequence and skip hidden answer slides.
- **Green buttons** reveal, jump, or mark a correct choice.
- **Orange Reset** returns that activity to slide 1 of itself so you can repeat with a second group.
- **Check / Show all** is the teacher reveal. Use it after class discussion, not before.
- **Space** is safe: it will not dump the answer key. Answers are hidden slides.

## Part 1 – Organisation

Use the explorer (slides 6–10) as a class reveal: “What sits under the CNS?” then press Reveal. Functions opens a definition card for sympathetic vs parasympathetic.

Labelling: ask the class to name the structure first, then press the label.

Matching: left column is in original order; right column is the original shuffle. Students write a mapping, then Check.

Case study: the original Flash interview with Dr Kevin Talbot could not be recovered. The four questions keep the clinical hook (neurology / motor neurone disease) without using his photograph.

## Part 2 – Nerve impulse

Play the resting-potential and action-potential sequences with **Next step**, not Space, so you can talk over each frame.

Cloze: five sentence stems; students choose an ending. Typical A-level answers: –70 mV; polarised; inside negative; 3 Na⁺ out / 2 K⁺ in; more permeable to K⁺.

Ion table (voltage-gated channels only):

| Stage | K⁺ | Na⁺ |
|---|---|---|
| Rest | closed | closed |
| Depolarisation | closed | open |
| Repolarisation | open | closed |

Stimulus-strength: weak / medium / strong change **frequency**, not amplitude.

True/false key: F, T, F, F, T.

## Part 3 – Sensory receptors

Pacinian sequence: pressure → stretch-mediated Na⁺ channels → graded generator potential → AP if threshold.

Retina labels: rod, cone, bipolar, ganglion, optic nerve.

Rods vs cones sort: night / rhodopsin / convergence / high sensitivity = rods; iodopsin / fovea / colour / bright light = cones.

**Specification note:** Boardworks 2009 says opsin from bleached rhodopsin changes rod permeability to sodium and starts a generator potential. That wording is kept. Many current A-level mark schemes still accept “bleaching of rhodopsin leads to a generator potential”. Degree-level physiology: photons close cGMP-gated Na⁺ channels and **hyperpolarise** the rod.

## Part 4 – Synapse

Eight-step animation is the teaching core. Then the **original shuffled list** is used as a sequencing exercise. Correct order:

1. AP arrives at the presynaptic neurone  
2. Ca²⁺ channels open; Ca²⁺ in  
3. Vesicles move to the membrane  
4. Vesicles fuse; acetylcholine released  
5. ACh binds postsynaptic receptors  
6. Na⁺ channels on the postsynaptic membrane open  
7. Na⁺ in; depolarisation  
8. AP in the postsynaptic neurone  

Labelling hotspots 1–7: mitochondrion, voltage-gated Ca²⁺ channel, synaptic cleft, synaptic vesicle, presynaptic membrane, receptor, postsynaptic membrane.

## Accessibility and reuse

- 4:3 slides (same as the 2009 files) for older projectors.  
- No macros, so school security software should not block them.  
- Reset is there so a period 5 class can reuse the same file without rebuilding.  
- Do not redistribute Boardworks logos or the original PDF; those remain Boardworks copyright.

## Rebuild

From `Boardworks_Interactive_Biology/`:

```bash
python3 src/build_all.py
```
