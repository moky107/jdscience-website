"""Pointer targets and cue lists for narrated GCSE Biology lessons."""

from __future__ import annotations

from jdscience_video.theme import H, W

# Distinctive spoken phrases used to identify a recording without trusting filenames.
SIGNATURES = {
    "1-3-transport-in-cells": (
        "diffusion", "osmosis", "active transport", "root hair", "alveoli",
        "concentration gradient", "partially permeable",
    ),
    "2-1-principles-of-organisation": (
        "tissue", "organ system", "cardiac muscle", "hierarchy", "organism",
        "smallest to largest",
    ),
    "2-2-animal-tissues-organs-systems": (
        "amylase", "bile", "lipase", "protease", "capillaries", "platelets",
        "gall bladder",
    ),
    "2-3-plant-tissues-organs-systems": (
        "epidermis", "palisade", "stomata", "transpiration", "xylem", "phloem",
        "guard cells",
    ),
    "3-1-communicable-diseases": (
        "pathogen", "measles", "malaria", "vaccine", "antibiotic",
    ),
    "3-1-discovering-and-testing-new-drugs": (
        "penicillin", "placebo", "double-blind", "preclinical", "fleming",
    ),
    "3-2-monoclonal-antibodies": (
        "monoclonal", "hybridoma", "antigen", "tumour", "pregnancy test",
    ),
    "3-3-plant-disease": (
        "rose black spot", "tobacco mosaic", "nitrate", "magnesium",
        "chlorosis",
    ),
    "4-1-photosynthesis": (
        "photosynthesis", "chlorophyll", "limiting factor", "inverse square",
        "light intensity",
    ),
    "4-2-respiration": (
        "aerobic", "anaerobic", "lactic", "lactate", "mitochondria",
        "fermentation",
    ),
    "5-1-homeostasis": (
        "homeostasis", "blood glucose", "negative feedback", "receptor",
        "insulin",
    ),
    "5-2-the-nervous-system": (
        "reflex", "synapse", "neurone", "spinal cord", "stimulus",
    ),
    "5-3-hormonal-coordination": (
        "endocrine", "diabetes", "menstrual", "pituitary", "ovulation",
    ),
    "5-4-plant-hormones": (
        "auxin", "phototropism", "ethene", "gibberellin", "geotropism",
    ),
    "6-1-reproduction": (
        "meiosis", "punnett", "allele", "cystic fibrosis", "fertilisation",
    ),
}

# Extra slide cues tried if the teaching-edition phrase is not spoken.
ALT_CUES = {
    "1-3-transport-in-cells": {
        "intro": ["welcome back", "transport in cells", "substances move"],
        "diff": ["diffusion", "high concentration to low"],
        "faster": ["faster when", "temperature is higher"],
        "lungs": ["oxygen diffuses", "alveoli"],
        "osmosis": ["osmosis", "partially permeable"],
        "active": ["active transport", "against a concentration"],
        "compare": ["passive processes", "useful comparison", "is different because", "carrier proteins"],
        "revise": ["revise this topic", "in your own words"],
        "exam": ["pause the video", "exam-style", "root hair"],
        "answer": ["model answer", "mineral ions"],
        "outro": ["subscribe to jd science", "jdscience"],
    },
    "2-1-principles-of-organisation": {
        "intro": ["welcome back", "principles of organisation"],
        "hierarchy": ["living things are built", "cells", "tissue"],
        "heart": ["cardiac muscle", "heart"],
        "why": ["hierarchy helps", "whole organism"],
        "revise": ["revise this topic"],
        "exam": ["pause the video", "smallest to largest"],
        "answer": ["model answer", "cell tissue organ"],
        "outro": ["subscribe", "jdscience"],
    },
    "2-2-animal-tissues-organs-systems": {
        "intro": ["welcome back", "animal"],
        "enzymes": ["amylase", "starch"],
        "bile": ["bile", "liver"],
        "denature": ["active site", "denatur"],
        "vessels": ["arteries", "circulatory"],
        "blood": ["red blood cells", "platelets"],
        "precise": ["be precise", "maltose"],
        "revise": ["revise this topic"],
        "exam": ["pause the video", "digestion of starch"],
        "answer": ["model answer", "amylase"],
        "outro": ["subscribe", "jdscience"],
    },
    "3-2-monoclonal-antibodies": {
        "intro": ["welcome back", "monoclonal"],
        "hyb": ["mouse is injected", "hybridoma"],
        "uses": ["locate molecules", "pregnancy"],
        "side": ["side effects", "fewer side"],
        "revise": ["revise this topic"],
        "exam": ["pause the video", "hybridoma"],
        "answer": ["model answer"],
        "outro": ["subscribe", "jdscience"],
    },
    "3-3-plant-disease": {
        "intro": ["welcome back", "plant disease"],
        "signs": ["signs of disease", "stunted growth"],
        "infect": ["rose black spot", "tobacco mosaic"],
        "minerals": ["nitrate", "magnesium"],
        "defend": ["waxy", "thorns"],
        "pattern": ["chlorosis", "yellow"],
        "revise": ["revise this topic"],
        "exam": ["pause the video"],
        "answer": ["model answer"],
        "outro": ["subscribe", "jdscience"],
    },
    "4-1-photosynthesis": {
        "intro": ["welcome back", "photosynthesis"],
        "eq": ["carbon dioxide and water", "chlorophyll"],
        "glucose": ["Glucose can be", "converted into starch", "cellulose"],
        "limit": ["rate of photosynthesis", "temperature"],
        "inv": ["light intensity", "falls off"],
        "caveat": ["inverse square", "point source", "lamp"],
        "revise": ["revise this topic"],
        "exam": ["pause the video"],
        "answer": ["model answer"],
        "outro": ["subscribe", "jdscience"],
    },
    "4-2-respiration": {
        "intro": ["welcome back", "respiration"],
        "aero": ["aerobic", "mitochondria"],
        "anaer": ["oxygen is in short", "anaerobic"],
        "ferm": ["ethanol", "yeast"],
        "breathe": ["not breathing", "chemical process"],
        "lactate": ["lactate", "lactic"],
        "revise": ["revise this topic"],
        "exam": ["pause the video"],
        "answer": ["model answer"],
        "outro": ["subscribe", "jdscience"],
    },
    "5-1-homeostasis": {
        "intro": ["welcome back", "homeostasis"],
        "keep": ["keeping conditions", "temperature"],
        "parts": ["three parts", "receptor"],
        "glucose": ["insulin", "blood glucose"],
        "both": ["nervous and endocrine", "negative feedback"],
        "revise": ["revise this topic"],
        "exam": ["pause the video"],
        "answer": ["model answer"],
        "outro": ["subscribe", "jdscience"],
    },
    "5-2-the-nervous-system": {
        "intro": ["welcome back", "nervous system"],
        "conscious": ["conscious action", "stimulus"],
        "reflex": ["spinal reflexes", "relay"],
        "synapse": ["don't touch", "synapses", "neurotransmitter"],
        "eye": ["lens", "cornea", "focus light"],
        "revise": ["revise this topic"],
        "exam": ["pause the video"],
        "answer": ["model answer"],
        "outro": ["subscribe", "jdscience"],
    },
    "5-3-hormonal-coordination": {
        "intro": ["welcome back", "hormones"],
        "glands": ["endocrine", "chemical messengers"],
        "diabetes": ["type 1", "insulin"],
        "cycle": ["menstrual", "FSH"],
        "adh": ["ADH", "water"],
        "revise": ["revise this topic"],
        "exam": ["pause the video"],
        "answer": ["model answer"],
        "outro": ["subscribe", "jdscience"],
    },
    "5-4-plant-hormones": {
        "intro": ["welcome back", "plant hormones"],
        "tropism": ["light and gravity", "phototropism"],
        "uses": ["fruit ripen", "helps fruit", "weed killers"],
        "auxin": ["redistributed", "shaded side"],
        "roots": ["roots", "inhibit"],
        "revise": ["revise this topic"],
        "exam": ["pause the video"],
        "answer": ["model answer"],
        "outro": ["subscribe", "jdscience"],
    },
    "6-1-reproduction": {
        "intro": ["welcome back", "reproduction"],
        "meiosis": ["23 chromosomes", "meiosis"],
        "dna": ["genes are sections", "base"],
        "alleles": ["dominant", "cystic"],
        "punnett": ["punnett", "allele symbols"],
        "revise": ["revise this topic"],
        "exam": ["pause the video"],
        "answer": ["model answer"],
        "outro": ["subscribe", "jdscience"],
    },
    "2-3-plant-tissues-organs-systems": {
        "intro": ["welcome back", "plant tissues"],
        "leaf": ["leaf has several tissues", "epidermis"],
        "stomata": ["guard cells", "stomata"],
        "transpire": ["transpiration", "water evaporates"],
        "xylem": ["xylem", "phloem"],
        "sources": ["sources", "sinks"],
        "revise": ["revise this topic"],
        "exam": ["pause the video", "carries sugars"],
        "answer": ["model answer", "phloem"],
        "outro": ["subscribe", "jdscience"],
    },
}

# Pointer events: target names match spots_for_slide(). target None hides the pointer.
CURSOR_EVENTS = {
    "1-3-transport-in-cells": [
        {"cue": "welcome back", "target": None},
        {"cue": "substances move", "target": "title"},
        {"cue": "diffusion", "target": "heading"},
        {"cue": "high concentration", "target": "high"},
        {"cue": "low concentration", "target": "low"},
        {"cue": "concentration gradient", "target": "arrow"},
        {"cue": "temperature is higher", "target": "b1"},
        {"cue": "concentration gradient is steeper", "target": "b2"},
        {"cue": "surface area is larger", "target": "b3"},
        {"cue": "oxygen diffuses", "target": "alveolus"},
        {"cue": "large surface area", "target": "adapt1"},
        {"cue": "thin lining", "target": "adapt2"},
        {"cue": "blood supply", "target": "adapt3"},
        {"cue": "ventilation", "target": "adapt4"},
        {"cue": "osmosis", "target": "heading"},
        {"cue": "partially permeable", "target": "membrane"},
        {"cue": "more water", "target": "more_water"},
        {"cue": "less water", "target": "less_water"},
        {"cue": "active transport", "target": "heading"},
        {"cue": "against", "target": "carrier"},
        {"cue": "Root hair cells use", "target": "root"},
        {"cue": "using energy", "target": "energy"},
        {"cue": "passive processes", "target": "diff_col"},
        {"cue": "supplied by", "target": "energy"},
        {"cue": "useful comparison", "target": "heading"},
        {"cue": "oxygen entering", "target": "diff_col"},
        {"cue": "water crossing", "target": "osm_col"},
        {"cue": "mineral ions entering", "target": "active_col"},
        {"cue": "root hair cells", "target": "active_col"},
        {"cue": "revise this topic", "target": "r1"},
        {"cue": "why it happens", "target": "r2"},
        {"cue": "structures involved", "target": "r3"},
        {"cue": "pause the video", "target": "question"},
        {"cue": "model answer", "target": "answer"},
        {"cue": "subscribe", "target": None},
    ],
    "2-1-principles-of-organisation": [
        {"cue": "welcome back", "target": None},
        {"cue": "built from cells", "target": "cell"},
        {"cue": "similar cells forms a tissue", "target": "tissue"},
        {"cue": "forms an organ", "target": "organ"},
        {"cue": "forms a system", "target": "system"},
        {"cue": "makes up an organism", "target": "organism"},
        {"cue": "cardiac muscle", "target": "row1"},
        {"cue": "heart muscle", "target": "row2"},
        {"cue": "circulatory system", "target": "row3"},
        {"cue": "hierarchy helps", "target": "heading"},
        {"cue": "revise this topic", "target": "r1"},
        {"cue": "pause the video", "target": "question"},
        {"cue": "model answer", "target": "answer"},
        {"cue": "subscribe", "target": None},
    ],
    "2-2-animal-tissues-organs-systems": [
        {"cue": "welcome back", "target": None},
        {"cue": "amylase", "target": "amylase"},
        {"cue": "protease", "target": "protease"},
        {"cue": "lipase", "target": "lipase"},
        {"cue": "bile is made", "target": "heading"},
        {"cue": "liver", "target": "heading"},
        {"cue": "active site", "target": "site"},
        {"cue": "arteries", "target": "arteries"},
        {"cue": "veins", "target": "veins"},
        {"cue": "capillaries", "target": "capillaries"},
        {"cue": "red blood cells", "target": "b1"},
        {"cue": "platelets", "target": "b2"},
        {"cue": "white blood cells", "target": "b3"},
        {"cue": "revise this topic", "target": "r1"},
        {"cue": "pause the video", "target": "question"},
        {"cue": "model answer", "target": "answer"},
        {"cue": "subscribe", "target": None},
    ],
    "2-3-plant-tissues-organs-systems": [
        {"cue": "welcome back", "target": None},
        {"cue": "epidermis", "target": "epidermis"},
        {"cue": "palisade", "target": "palisade"},
        {"cue": "spongy", "target": "spongy"},
        {"cue": "xylem and phloem", "target": "vein"},
        {"cue": "guard cells", "target": "guard"},
        {"cue": "stomata", "target": "stoma"},
        {"cue": "water evaporates", "target": "heading"},
        {"cue": "xylem carries", "target": "xylem"},
        {"cue": "phloem", "target": "phloem"},
        {"cue": "sources", "target": "heading"},
        {"cue": "sinks", "target": "heading"},
        {"cue": "revise this topic", "target": "r1"},
        {"cue": "pause the video", "target": "question"},
        {"cue": "model answer", "target": "answer"},
        {"cue": "subscribe", "target": None},
    ],
    "3-2-monoclonal-antibodies": [
        {"cue": "welcome back", "target": None},
        {"cue": "mouse is injected", "target": "heading"},
        {"cue": "antigen", "target": "heading"},
        {"cue": "hybridoma", "target": "heading"},
        {"cue": "pregnancy", "target": "b1"},
        {"cue": "locate molecules", "target": "b2"},
        {"cue": "cancer", "target": "b3"},
        {"cue": "side effects", "target": "heading"},
        {"cue": "revise this topic", "target": "r1"},
        {"cue": "pause the video", "target": "question"},
        {"cue": "model answer", "target": "answer"},
        {"cue": "subscribe", "target": None},
    ],
    "3-3-plant-disease": [
        {"cue": "welcome back", "target": None},
        {"cue": "stunted growth", "target": "heading"},
        {"cue": "rose black spot", "target": "b1"},
        {"cue": "tobacco mosaic", "target": "b2"},
        {"cue": "nitrate", "target": "nitrate"},
        {"cue": "magnesium", "target": "magnesium"},
        {"cue": "waxy cuticles", "target": "b1"},
        {"cue": "antibacterial", "target": "b2"},
        {"cue": "revise this topic", "target": "r1"},
        {"cue": "pause the video", "target": "question"},
        {"cue": "model answer", "target": "answer"},
        {"cue": "subscribe", "target": None},
    ],
    "4-1-photosynthesis": [
        {"cue": "welcome back", "target": None},
        {"cue": "carbon dioxide and water", "target": "heading"},
        {"cue": "glucose", "target": "heading"},
        {"cue": "temperature", "target": "heading"},
        {"cue": "light intensity", "target": "heading"},
        {"cue": "inverse", "target": "heading"},
        {"cue": "revise this topic", "target": "r1"},
        {"cue": "pause the video", "target": "question"},
        {"cue": "model answer", "target": "answer"},
        {"cue": "subscribe", "target": None},
    ],
    "4-2-respiration": [
        {"cue": "welcome back", "target": None},
        {"cue": "aerobic", "target": "heading"},
        {"cue": "anaerobic", "target": "heading"},
        {"cue": "ethanol", "target": "heading"},
        {"cue": "not breathing", "target": "heading"},
        {"cue": "lactate", "target": "heading"},
        {"cue": "revise this topic", "target": "r1"},
        {"cue": "pause the video", "target": "question"},
        {"cue": "model answer", "target": "answer"},
        {"cue": "subscribe", "target": None},
    ],
    "5-1-homeostasis": [
        {"cue": "welcome back", "target": None},
        {"cue": "temperature", "target": "b1"},
        {"cue": "water content", "target": "b2"},
        {"cue": "blood glucose", "target": "b3"},
        {"cue": "three parts", "target": "heading"},
        {"cue": "receptor", "target": "heading"},
        {"cue": "insulin", "target": "heading"},
        {"cue": "revise this topic", "target": "r1"},
        {"cue": "pause the video", "target": "question"},
        {"cue": "model answer", "target": "answer"},
        {"cue": "subscribe", "target": None},
    ],
    "5-2-the-nervous-system": [
        {"cue": "welcome back", "target": None},
        {"cue": "stimulus", "target": "heading"},
        {"cue": "reflex", "target": "heading"},
        {"cue": "synapse", "target": "heading"},
        {"cue": "lens", "target": "heading"},
        {"cue": "revise this topic", "target": "r1"},
        {"cue": "pause the video", "target": "question"},
        {"cue": "model answer", "target": "answer"},
        {"cue": "subscribe", "target": None},
    ],
    "5-3-hormonal-coordination": [
        {"cue": "welcome back", "target": None},
        {"cue": "hormones", "target": "heading"},
        {"cue": "type 1", "target": "heading"},
        {"cue": "menstrual", "target": "heading"},
        {"cue": "adh", "target": "heading"},
        {"cue": "revise this topic", "target": "r1"},
        {"cue": "pause the video", "target": "question"},
        {"cue": "model answer", "target": "answer"},
        {"cue": "subscribe", "target": None},
    ],
    "5-4-plant-hormones": [
        {"cue": "welcome back", "target": None},
        {"cue": "light and gravity", "target": "heading"},
        {"cue": "ethene", "target": "b1"},
        {"cue": "gibberellin", "target": "b2"},
        {"cue": "auxin", "target": "b3"},
        {"cue": "shaded", "target": "heading"},
        {"cue": "roots", "target": "heading"},
        {"cue": "revise this topic", "target": "r1"},
        {"cue": "pause the video", "target": "question"},
        {"cue": "model answer", "target": "answer"},
        {"cue": "subscribe", "target": None},
    ],
    "6-1-reproduction": [
        {"cue": "welcome back", "target": None},
        {"cue": "23 chromosomes", "target": "heading"},
        {"cue": "genes are sections", "target": "heading"},
        {"cue": "dominant", "target": "b1"},
        {"cue": "x and y", "target": "b2"},
        {"cue": "punnett", "target": "heading"},
        {"cue": "revise this topic", "target": "r1"},
        {"cue": "pause the video", "target": "question"},
        {"cue": "model answer", "target": "answer"},
        {"cue": "subscribe", "target": None},
    ],
}


def _spot(x0: float, y0: float, x1: float, y1: float) -> dict:
    return {"x0": x0, "y0": y0, "x1": x1, "y1": y1, "cx": (x0 + x1) / 2}


def spots_for_slide(slide: dict) -> dict:
    """Named boxes the gold pointer can sit under."""
    spots = {
        "title": _spot(88, 210, 900, 420),
        "heading": _spot(88, 118, 1400, 220),
        "question": _spot(120, 320, 1800, 620),
        "answer": _spot(120, 520, 1800, 780),
        "r1": _spot(88, 260, W - 88, 400),
        "r2": _spot(88, 420, W - 88, 560),
        "r3": _spot(88, 580, W - 88, 720),
    }
    kind = slide.get("kind")
    if kind == "bullets":
        y = 250
        for key, _title, _body in slide.get("items") or []:
            spots[key] = _spot(88, y, W - 88, y + 140)
            y += 160
    if kind == "intro":
        spots["title"] = _spot(88, 250, 980, 480)
    diagram = slide.get("diagram")
    x0, y0, x1, y1 = 88, 240, W - 88, 900
    if diagram == "diffusion":
        spots["high"] = _spot(x0 + 60, y0 + 70, x0 + 380, y0 + 280)
        spots["low"] = _spot(x1 - 360, y0 + 90, x1 - 80, y0 + 280)
        spots["arrow"] = _spot(x0 + 400, (y0 + y1) / 2 - 40, x0 + 560, (y0 + y1) / 2 + 40)
    elif diagram == "alveoli":
        spots["alveolus"] = _spot(x0 + 80, y0 + 70, x0 + 520, y1 - 70)
        for i, name in enumerate(("adapt1", "adapt2", "adapt3", "adapt4")):
            spots[name] = _spot(x0 + 580, y0 + 80 + i * 110, x1 - 60, y0 + 170 + i * 110)
    elif diagram == "osmosis":
        spots["more_water"] = _spot(x0 + 80, y0 + 80, x0 + 480, y1 - 80)
        spots["less_water"] = _spot(x0 + 520, y0 + 80, x0 + 920, y1 - 80)
        spots["membrane"] = _spot(x0 + 470, y0 + 70, x0 + 530, y1 - 70)
    elif diagram == "active_transport":
        spots["carrier"] = _spot(x0 + 420, y0 + 140, x0 + 700, y1 - 140)
        spots["energy"] = _spot(x0 + 200, y1 - 90, x1 - 200, y1 - 20)
        spots["root"] = _spot(x1 - 520, y0 + 20, x1 - 80, y0 + 90)
    elif diagram == "transport_compare":
        w = (x1 - x0 - 40) / 3
        spots["diff_col"] = _spot(x0, y0, x0 + w, y1)
        spots["osm_col"] = _spot(x0 + w + 20, y0, x0 + 2 * w + 20, y1)
        spots["active_col"] = _spot(x0 + 2 * (w + 20), y0, x1, y1)
    elif diagram == "hierarchy":
        labels = ["cell", "tissue", "organ", "system", "organism"]
        for i, name in enumerate(labels):
            y = y0 + 20 + i * 95
            spots[name] = _spot(x0 + 80 + i * 50, y, x1 - 80 - i * 50, y + 80)
    elif diagram == "heart_org":
        for i, name in enumerate(("row1", "row2", "row3")):
            spots[name] = _spot(x0 + 40, y0 + 60 + i * 140, x1 - 40, y0 + 180 + i * 140)
    elif diagram == "enzymes":
        for i, name in enumerate(("amylase", "protease", "lipase")):
            y = y0 + i * 160
            spots[name] = _spot(x0, y, x1, y + 140)
    elif diagram == "active_site":
        spots["site"] = _spot(x0 + 80, y0 + 80, x0 + 420, y1 - 80)
    elif diagram == "vessels":
        for i, name in enumerate(("arteries", "veins", "capillaries")):
            y = y0 + i * 160
            spots[name] = _spot(x0, y, x1, y + 140)
    elif diagram == "leaf":
        for i, name in enumerate(("epidermis", "palisade", "spongy", "vein")):
            y = y0 + 40 + i * 110
            spots[name] = _spot(x0 + 60, y, x0 + 520, y + 90)
    elif diagram == "stomata":
        spots["guard"] = _spot((x0 + x1) / 2 - 220, (y0 + y1) / 2 - 90, (x0 + x1) / 2 + 220, (y0 + y1) / 2 + 90)
        spots["stoma"] = _spot((x0 + x1) / 2 - 30, (y0 + y1) / 2 - 70, (x0 + x1) / 2 + 30, (y0 + y1) / 2 + 70)
    elif diagram == "xylem_phloem":
        spots["xylem"] = _spot(x0, y0, (x0 + x1) / 2 - 12, y1)
        spots["phloem"] = _spot((x0 + x1) / 2 + 12, y0, x1, y1)
    elif diagram == "minerals":
        spots["nitrate"] = _spot(x0, y0, (x0 + x1) / 2 - 12, y1)
        spots["magnesium"] = _spot((x0 + x1) / 2 + 12, y0, x1, y1)
    # Keep a default rest position so the pointer never jumps to 0,0.
    spots.setdefault("rest", _spot(W * 0.72, H * 0.62, W * 0.78, H * 0.70))
    return spots
