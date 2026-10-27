"""Mandatory six-stage GCSE/IGCSE video structure and quality gates."""

from __future__ import annotations

from dataclasses import dataclass, field

STAGES = (
    "introduction",
    "explanation",
    "worked_example",
    "your_turn",
    "model_answer",
    "recap",
)

MIN_SECONDS = 240.0
PREFERRED_MIN = 300.0
PREFERRED_MAX = 480.0
OPENING = "Hello and welcome back to JD Science."
SUBSCRIBE = "subscribe to JD Science"
SITE = "j d science dot co dot u k"
PAUSE = "pause the video"

REQUIRED_KINDS = {
    "introduction": {"intro"},
    "explanation": {"aims", "bullets", "diagram", "note", "equation", "apparatus", "hook"},
    "worked_example": {"worked"},
    "your_turn": {"your_turn"},
    "model_answer": {"model"},
    "recap": {"recap", "outro"},
}


@dataclass
class SpecOutcome:
    code: str
    statement: str
    covered: bool = False
    evidence: str = ""
    tier: str = "both"  # both | higher | separate


@dataclass
class QAReport:
    slug: str
    title: str
    subject: str
    complete: bool
    duration_s: float
    stages: dict
    spec: list[dict]
    checks: dict
    failures: list[str] = field(default_factory=list)


def stage_for_kind(kind: str) -> str | None:
    for stage, kinds in REQUIRED_KINDS.items():
        if kind in kinds:
            return stage
    return None


def spoken_has(text: str, needle: str) -> bool:
    return needle.lower() in (text or "").lower()


def evaluate_lesson(
    lesson: dict,
    *,
    spoken: str,
    duration_s: float,
    outcomes: list[SpecOutcome],
    probe: dict | None = None,
    aligned_slides: int | None = None,
    aligned_total: int | None = None,
) -> QAReport:
    kinds = [s.get("kind") for s in lesson.get("slides") or []]
    present = {stage: False for stage in STAGES}
    for kind in kinds:
        stage = stage_for_kind(kind or "")
        if stage:
            present[stage] = True
    # Explanation also counts any non-stage teaching slide.
    if any(k not in {"intro", "aims", "worked", "your_turn", "model", "recap", "outro"} for k in kinds):
        present["explanation"] = True
    if "aims" in kinds:
        present["explanation"] = True

    failures: list[str] = []
    if not spoken_has(spoken, OPENING):
        failures.append("missing_opening_line")
    if not spoken_has(spoken, PAUSE):
        failures.append("missing_pause_invitation")
    if not spoken_has(spoken, "model answer") and not spoken_has(spoken, "here is the model"):
        failures.append("missing_model_answer_speech")
    if not spoken_has(spoken, SUBSCRIBE):
        failures.append("missing_subscribe")
    if not spoken_has(spoken, SITE) and not spoken_has(spoken, "jdscience.co.uk"):
        failures.append("missing_website")
    for stage, ok in present.items():
        if not ok:
            failures.append(f"missing_stage_{stage}")
    if duration_s < MIN_SECONDS:
        failures.append(f"duration_below_4_min:{duration_s:.1f}s")
    probe = probe or {}
    if probe:
        if probe.get("width") != 1920 or probe.get("height") != 1080:
            failures.append("not_1080p")
        fps = float(probe.get("fps") or 0)
        if fps and abs(fps - 30) > 0.2:
            failures.append(f"fps_not_30:{fps}")
        if (probe.get("vcodec") or probe.get("codec")) not in {None, "h264"}:
            if probe.get("vcodec") and probe.get("vcodec") != "h264":
                failures.append("video_not_h264")
        if probe.get("acodec") and probe.get("acodec") != "aac":
            failures.append("audio_not_aac")
    if aligned_slides is not None and aligned_total:
        if aligned_slides < aligned_total:
            failures.append(f"unaligned_slides:{aligned_slides}/{aligned_total}")
    uncovered = [o for o in outcomes if not o.covered]
    if uncovered:
        failures.append("spec_outcomes_uncovered:" + ",".join(o.code for o in uncovered))

    checks = {
        "opening": spoken_has(spoken, OPENING),
        "pause": spoken_has(spoken, PAUSE),
        "subscribe": spoken_has(spoken, SUBSCRIBE),
        "website": spoken_has(spoken, SITE) or spoken_has(spoken, "jdscience.co.uk"),
        "duration_ok": duration_s >= MIN_SECONDS,
        "preferred_band": PREFERRED_MIN <= duration_s <= PREFERRED_MAX,
        "1080p": (not probe) or (probe.get("width") == 1920 and probe.get("height") == 1080),
    }
    return QAReport(
        slug=lesson.get("slug") or "",
        title=lesson.get("title") or "",
        subject=lesson.get("subject") or "Chemistry",
        complete=not failures,
        duration_s=round(duration_s, 2),
        stages=present,
        spec=[
            {
                "code": o.code,
                "statement": o.statement,
                "covered": o.covered,
                "evidence": o.evidence,
                "tier": o.tier,
            }
            for o in outcomes
        ],
        checks=checks,
        failures=failures,
    )


def report_to_dict(report: QAReport) -> dict:
    return {
        "slug": report.slug,
        "title": report.title,
        "subject": report.subject,
        "complete": report.complete,
        "duration_s": report.duration_s,
        "stages": report.stages,
        "spec": report.spec,
        "checks": report.checks,
        "failures": report.failures,
        "gates": {
            "min_seconds": MIN_SECONDS,
            "preferred_seconds": [PREFERRED_MIN, PREFERRED_MAX],
            "opening": OPENING,
        },
    }
