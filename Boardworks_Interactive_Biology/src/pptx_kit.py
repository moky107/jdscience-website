"""Shared helpers for macro-free interactive A-level Biology PowerPoints."""

from __future__ import annotations

from lxml import etree
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Emu, Inches, Pt

# Original Boardworks slides were 720 x 540 pt (4:3).
SLIDE_W = Inches(10)
SLIDE_H = Inches(7.5)

# Classroom palette inspired by the 2009 Boardworks chrome, without using
# Boardworks trademarks or logos.
GREEN = RGBColor(0x2E, 0x9E, 0x4F)
GREEN_DARK = RGBColor(0x1B, 0x7A, 0x3A)
GREEN_HEADER = RGBColor(0x3C, 0xB5, 0x4A)
GREEN_SOFT = RGBColor(0xC8, 0xE6, 0xA0)
NAVY = RGBColor(0x1B, 0x3A, 0x6B)
NAVY_TEXT = RGBColor(0x1A, 0x2F, 0x5A)
PURPLE = RGBColor(0x6B, 0x2D, 0x8B)
PURPLE_LINE = RGBColor(0x7A, 0x3E, 0x9B)
YELLOW = RGBColor(0xFF, 0xF6, 0xB0)
YELLOW_EDGE = RGBColor(0xC5, 0xB4, 0x3A)
CREAM = RGBColor(0xFF, 0xFD, 0xF2)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
RED = RGBColor(0xC6, 0x28, 0x28)
ORANGE = RGBColor(0xEF, 0x6C, 0x00)
BLUE = RGBColor(0x15, 0x65, 0xC0)
LIGHT_BLUE = RGBColor(0xE3, 0xF2, 0xFD)
LIGHT_RED = RGBColor(0xFF, 0xEB, 0xEE)
LIGHT_GREEN = RGBColor(0xE8, 0xF5, 0xE9)
GREY = RGBColor(0xEE, 0xEE, 0xEE)
GREY_DARK = RGBColor(0x5A, 0x5A, 0x5A)
BLACK = RGBColor(0x22, 0x22, 0x22)

SLIDE_REL_TYPE = (
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide"
)
A_NS = "http://schemas.openxmlformats.org/drawingml/2006/main"
R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
P_NS = "http://schemas.openxmlformats.org/presentationml/2006/main"

FOOTER_NOTE = (
    "Original course © Boardworks Ltd 2009. Reconstructed interactive resource."
)


def rgb_hex(color: RGBColor) -> str:
    return f"{color[0]:02X}{color[1]:02X}{color[2]:02X}"


def new_presentation() -> Presentation:
    prs = Presentation()
    prs.slide_width = SLIDE_W
    prs.slide_height = SLIDE_H
    return prs


def blank_slide(prs: Presentation):
    return prs.slides.add_slide(prs.slide_layouts[6])


def hide_slide(slide) -> None:
    """Keep a slide reachable by hyperlink but skip it in linear slideshow."""
    slide._element.set("show", "0")


def set_run_font(run, size=18, bold=False, color=NAVY_TEXT, name="Calibri"):
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.name = name
    run.font.italic = False


def _fill_solid(shape, color: RGBColor) -> None:
    shape.fill.solid()
    shape.fill.fore_color.rgb = color


def _line(shape, color: RGBColor, pt: float = 1.25) -> None:
    shape.line.color.rgb = color
    shape.line.width = Pt(pt)


def add_rect(slide, l, t, w, h, fill, line=None, line_pt=1.25, rounded=False):
    kind = MSO_SHAPE.ROUNDED_RECTANGLE if rounded else MSO_SHAPE.RECTANGLE
    sh = slide.shapes.add_shape(kind, l, t, w, h)
    _fill_solid(sh, fill)
    if line is None:
        sh.line.fill.background()
    else:
        _line(sh, line, line_pt)
    if rounded:
        try:
            sh.adjustments[0] = 0.15
        except Exception:
            pass
    return sh


def add_oval(slide, l, t, w, h, fill, line=None, line_pt=1.25):
    sh = slide.shapes.add_shape(MSO_SHAPE.OVAL, l, t, w, h)
    _fill_solid(sh, fill)
    if line is None:
        sh.line.fill.background()
    else:
        _line(sh, line, line_pt)
    return sh


def set_shape_text(
    shape,
    text,
    size=16,
    bold=False,
    color=NAVY_TEXT,
    align=PP_ALIGN.LEFT,
    anchor=MSO_ANCHOR.MIDDLE,
    font="Calibri",
):
    tf = shape.text_frame
    tf.word_wrap = True
    tf.auto_size = None
    try:
        shape.text_frame.auto_size = None
    except Exception:
        pass
    tf.paragraphs[0].clear()
    # python-pptx keeps one paragraph; populate it then extra lines.
    lines = str(text).split("\n")
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.space_after = Pt(2)
        run = p.add_run()
        run.text = line
        set_run_font(run, size=size, bold=bold, color=color, name=font)
    tf.paragraphs[0].space_before = Pt(0)
    try:
        tf._txBody.bodyPr.set("anchor", {MSO_ANCHOR.MIDDLE: "ctr", MSO_ANCHOR.TOP: "t", MSO_ANCHOR.BOTTOM: "b"}.get(anchor, "ctr"))
    except Exception:
        pass
    return shape


def add_textbox(
    slide,
    l,
    t,
    w,
    h,
    text,
    size=16,
    bold=False,
    color=NAVY_TEXT,
    align=PP_ALIGN.LEFT,
    font="Calibri",
    anchor=MSO_ANCHOR.TOP,
):
    box = slide.shapes.add_textbox(l, t, w, h)
    tf = box.text_frame
    tf.word_wrap = True
    lines = str(text).split("\n")
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.space_after = Pt(4)
        run = p.add_run()
        run.text = line
        set_run_font(run, size=size, bold=bold, color=color, name=font)
    try:
        tf._txBody.bodyPr.set(
            "anchor",
            {MSO_ANCHOR.MIDDLE: "ctr", MSO_ANCHOR.TOP: "t", MSO_ANCHOR.BOTTOM: "b"}.get(
                anchor, "t"
            ),
        )
    except Exception:
        pass
    return box


def add_rich_textbox(slide, l, t, w, h, runs, align=PP_ALIGN.LEFT, anchor="t"):
    """runs: list of (text, size, bold, color) possibly with '\\n'."""
    box = slide.shapes.add_textbox(l, t, w, h)
    tf = box.text_frame
    tf.word_wrap = True
    first = True
    p = tf.paragraphs[0]
    p.alignment = align
    for text, size, bold, color in runs:
        parts = str(text).split("\n")
        for i, part in enumerate(parts):
            if i > 0:
                p = tf.add_paragraph()
                p.alignment = align
                p.space_after = Pt(6)
            run = p.add_run()
            run.text = part
            set_run_font(run, size=size, bold=bold, color=color)
            first = False
    try:
        tf._txBody.bodyPr.set("anchor", anchor)
    except Exception:
        pass
    return box


def _cNvPr(shape):
    el = shape._element
    for path in ("nvSpPr", "nvPicPr", "nvGrpSpPr", "nvCxnSpPr"):
        nv = getattr(el, path, None)
        if nv is not None:
            return nv.cNvPr
    raise AttributeError("Could not find cNvPr on shape")


def shape_id(shape) -> int:
    return int(_cNvPr(shape).get("id"))


def hyperlink_to_slide(shape, target_slide) -> None:
    """Native PowerPoint jump; works without macros."""
    cNvPr = _cNvPr(shape)
    for child in list(cNvPr):
        if child.tag == qn("a:hlinkClick"):
            cNvPr.remove(child)
    rel = shape.part.relate_to(target_slide.part, SLIDE_REL_TYPE)
    etree.SubElement(
        cNvPr,
        f"{{{A_NS}}}hlinkClick",
        {
            f"{{{R_NS}}}id": rel,
            "action": "ppaction://hlinksldjump",
        },
    )


def add_notes(slide, text: str) -> None:
    notes = slide.notes_slide
    notes.notes_text_frame.text = text


def add_picture(slide, path, l, t, w=None, h=None, width=None, height=None):
    w = width if width is not None else w
    h = height if height is not None else h
    if w and h:
        return slide.shapes.add_picture(path, l, t, w, h)
    if w:
        return slide.shapes.add_picture(path, l, t, width=w)
    if h:
        return slide.shapes.add_picture(path, l, t, height=h)
    return slide.shapes.add_picture(path, l, t)


class Deck:
    """Named-slide deck with Boardworks-style chrome and hyperlink wiring."""

    def __init__(self, part_title: str, series="A2 Biology  ·  The Nervous System"):
        self.prs = new_presentation()
        self.part_title = part_title
        self.series = series
        self.slides = {}
        self.order = []
        self._hidden = set()
        self._tn_id = 200  # animation node ids
        self._pending_links = []  # (shape, target_name)
        self._nav_shapes = {}  # name -> (prev_shape, next_shape)
        self._num_boxes = {}  # name -> footer number textbox
        self.prefix = ""
        self.home_target = None  # e.g. "home" for a combined course menu

    def _key(self, name: str) -> str:
        if name in self.slides:
            return name
        if self.home_target and name == self.home_target:
            return name
        if self.prefix and not name.startswith(self.prefix):
            return self.prefix + name
        return name

    def add(self, name: str, title: str, hidden=False, kind="content"):
        key = self._key(name)
        slide = blank_slide(self.prs)
        self.slides[key] = {
            "slide": slide,
            "title": title,
            "kind": kind,
            "hidden": hidden,
        }
        self.order.append(key)
        if hidden:
            hide_slide(slide)
            self._hidden.add(key)
        return slide

    def s(self, name: str):
        return self.slides[self._key(name)]["slide"]

    def chrome(self, name: str, show_nav=True, activity=False):
        key = self._key(name)
        slide = self.s(key)
        title = self.slides[key]["title"]
        # Header bar
        add_rect(slide, Inches(0), Inches(0), SLIDE_W, Inches(0.72), WHITE)
        add_rect(slide, Inches(0), Inches(0.70), SLIDE_W, Inches(0.06), GREY)
        title_w = Inches(6.15) if self.home_target else Inches(8.2)
        title_size = 22 if self.home_target else 26
        add_textbox(
            slide,
            Inches(0.28),
            Inches(0.10),
            title_w,
            Inches(0.55),
            title,
            size=title_size,
            bold=True,
            color=GREEN,
        )
        # Small series badge (not a Boardworks logo)
        badge = add_rect(
            slide,
            Inches(8.15),
            Inches(0.12),
            Inches(1.68),
            Inches(0.46),
            GREEN_SOFT,
            line=GREEN_DARK,
            line_pt=1.0,
            rounded=True,
        )
        set_shape_text(badge, "A2 Biology", size=11, bold=True, color=GREEN_DARK, align=PP_ALIGN.CENTER)
        # Left purple rail
        add_rect(slide, Inches(0), Inches(0), Inches(0.08), SLIDE_H, PURPLE)
        # Footer
        add_rect(slide, Inches(0.08), Inches(7.18), Inches(9.92), Inches(0.04), PURPLE_LINE)
        num_box = add_textbox(
            slide,
            Inches(0.25),
            Inches(7.20),
            Inches(1.4),
            Inches(0.28),
            "slide",
            size=10,
            color=PURPLE,
        )
        self._num_boxes[key] = num_box
        add_textbox(
            slide,
            Inches(1.7),
            Inches(7.20),
            Inches(6.6),
            Inches(0.28),
            FOOTER_NOTE,
            size=9,
            color=GREY_DARK,
            align=PP_ALIGN.CENTER,
        )
        if show_nav:
            self._nav_buttons(key)
        self._maybe_home(key, slide)
        if activity:
            bar = add_rect(
                slide,
                Inches(0.22),
                Inches(6.78),
                Inches(9.56),
                Inches(0.36),
                GREY,
            )
            bar.line.fill.background()
        return slide

    def _nav_buttons(self, name: str):
        slide = self.s(name)
        prev = add_oval(
            slide, Inches(0.16), Inches(6.30), Inches(0.42), Inches(0.42), WHITE, line=PURPLE, line_pt=1.75
        )
        set_shape_text(prev, "◀", size=14, bold=True, color=PURPLE, align=PP_ALIGN.CENTER)
        nxt = add_oval(
            slide, Inches(9.42), Inches(6.30), Inches(0.42), Inches(0.42), PURPLE, line=PURPLE, line_pt=1.0
        )
        set_shape_text(nxt, "▶", size=14, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
        self._nav_shapes[name] = (prev, nxt)

    def _maybe_home(self, key: str, slide, left=None, top=None) -> None:
        if not self.home_target or key == self.home_target:
            return
        # Default: header, left of the A2 Biology badge, so Home stays clear of
        # activity bars, info boxes and sequential arrows.
        btn = add_rect(
            slide,
            left if left is not None else Inches(6.52),
            top if top is not None else Inches(0.16),
            Inches(1.48),
            Inches(0.40),
            PURPLE,
            line=PURPLE,
            line_pt=1.0,
            rounded=True,
        )
        set_shape_text(btn, "Home", size=12, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
        self.link(btn, self.home_target)

    def button(
        self,
        slide,
        l,
        t,
        w,
        h,
        label,
        fill=GREEN,
        text_color=WHITE,
        line=None,
        size=14,
        target=None,
        rounded=True,
    ):
        sh = add_rect(slide, l, t, w, h, fill, line=line or fill, line_pt=1.0, rounded=rounded)
        set_shape_text(sh, label, size=size, bold=True, color=text_color, align=PP_ALIGN.CENTER)
        if target:
            self.link(sh, target)
        return sh

    def link(self, shape, target):
        if not isinstance(target, str):
            hyperlink_to_slide(shape, target)
            return
        key = self._key(target)
        if key in self.slides:
            hyperlink_to_slide(shape, self.slides[key]["slide"])
        else:
            self._pending_links.append((shape, key))

    def finalize(self):
        missing = []
        for shape, target in self._pending_links:
            if target not in self.slides:
                missing.append(target)
                continue
            hyperlink_to_slide(shape, self.s(target))
        self._pending_links = []
        visible = [n for n in self.order if n not in self._hidden]
        for name, (prev, nxt) in self._nav_shapes.items():
            if name not in visible:
                continue
            i = visible.index(name)
            if i > 0:
                hyperlink_to_slide(prev, self.s(visible[i - 1]))
            if i < len(visible) - 1:
                hyperlink_to_slide(nxt, self.s(visible[i + 1]))
        total = len(visible)
        for name, box in self._num_boxes.items():
            if name in visible:
                box.text_frame.paragraphs[0].clear()
                run = box.text_frame.paragraphs[0].add_run()
                run.text = f"{visible.index(name) + 1} of {total}"
                set_run_font(run, size=10, color=PURPLE)
            else:
                box.text_frame.paragraphs[0].clear()
                run = box.text_frame.paragraphs[0].add_run()
                run.text = "activity"
                set_run_font(run, size=10, color=PURPLE)
        if missing:
            raise KeyError("Unresolved slide hyperlinks: " + ", ".join(sorted(set(missing))))

    def info_box(self, slide, l, t, w, h, text, size=14, fill=YELLOW, edge=YELLOW_EDGE):
        sh = add_rect(slide, l, t, w, h, fill, line=edge, line_pt=1.25, rounded=True)
        set_shape_text(
            sh,
            text,
            size=size,
            color=NAVY_TEXT,
            align=PP_ALIGN.LEFT,
            anchor=MSO_ANCHOR.TOP,
        )
        # Re-apply with top padding via text frame margins
        tf = sh.text_frame
        tf.margin_left = Inches(0.12)
        tf.margin_right = Inches(0.12)
        tf.margin_top = Inches(0.08)
        tf.margin_bottom = Inches(0.08)
        return sh

    def label_chip(self, slide, l, t, w, h, text, fill=GREEN_SOFT, edge=GREEN_DARK, size=13, target=None):
        sh = add_rect(slide, l, t, w, h, fill, line=edge, line_pt=1.25, rounded=True)
        set_shape_text(sh, text, size=size, bold=True, color=NAVY, align=PP_ALIGN.CENTER)
        if target:
            self.link(sh, target)
        return sh

    def wire_nav(self):
        """Re-apply sequential nav after hidden flags are known.
        Chrome already wires nav at creation; call this if slides were added later.
        """
        return

    def add_click_reveals(self, slide, pairs):
        """pairs: list of (trigger_shape, reveal_shape).
        Reveal shapes start hidden and appear when the trigger is clicked.
        Desktop PowerPoint required; hyperlinks remain the fallback.
        """
        self._tn_id += 1
        sld = slide._element
        existing = sld.find(qn("p:timing"))
        if existing is not None:
            sld.remove(existing)

        def nid():
            self._tn_id += 1
            return str(self._tn_id)

        timing = etree.SubElement(sld, f"{{{P_NS}}}timing")
        tn_lst = etree.SubElement(timing, f"{{{P_NS}}}tnLst")
        root_par = etree.SubElement(tn_lst, f"{{{P_NS}}}par")
        root = etree.SubElement(
            root_par,
            f"{{{P_NS}}}cTn",
            {"id": nid(), "dur": "indefinite", "restart": "never", "nodeType": "tmRoot"},
        )
        root_children = etree.SubElement(root, f"{{{P_NS}}}childTnLst")

        # Main sequence: hide reveal shapes on load.
        main_seq = etree.SubElement(
            root_children, f"{{{P_NS}}}seq", {"concurrent": "1", "nextAc": "seek"}
        )
        main_ctn = etree.SubElement(
            main_seq, f"{{{P_NS}}}cTn", {"id": nid(), "dur": "indefinite", "nodeType": "mainSeq"}
        )
        main_children = etree.SubElement(main_ctn, f"{{{P_NS}}}childTnLst")
        for _trigger, reveal in pairs:
            par = etree.SubElement(main_children, f"{{{P_NS}}}par")
            ctn = etree.SubElement(par, f"{{{P_NS}}}cTn", {"id": nid(), "fill": "hold"})
            st = etree.SubElement(ctn, f"{{{P_NS}}}stCondLst")
            etree.SubElement(st, f"{{{P_NS}}}cond", {"delay": "0"})
            ch = etree.SubElement(ctn, f"{{{P_NS}}}childTnLst")
            inner = etree.SubElement(ch, f"{{{P_NS}}}par")
            inner_ctn = etree.SubElement(inner, f"{{{P_NS}}}cTn", {"id": nid(), "fill": "hold"})
            st2 = etree.SubElement(inner_ctn, f"{{{P_NS}}}stCondLst")
            etree.SubElement(st2, f"{{{P_NS}}}cond", {"delay": "0"})
            ch2 = etree.SubElement(inner_ctn, f"{{{P_NS}}}childTnLst")
            _set_visibility(ch2, nid, shape_id(reveal), "hidden")

        prev = etree.SubElement(main_seq, f"{{{P_NS}}}prevCondLst")
        cond = etree.SubElement(prev, f"{{{P_NS}}}cond", {"evt": "onPrev", "delay": "0"})
        etree.SubElement(etree.SubElement(cond, f"{{{P_NS}}}tgtEl"), f"{{{P_NS}}}sldTgt")
        nxt = etree.SubElement(main_seq, f"{{{P_NS}}}nextCondLst")
        condn = etree.SubElement(nxt, f"{{{P_NS}}}cond", {"evt": "onNext", "delay": "0"})
        etree.SubElement(etree.SubElement(condn, f"{{{P_NS}}}tgtEl"), f"{{{P_NS}}}sldTgt")

        for trigger, reveal in pairs:
            seq = etree.SubElement(
                root_children, f"{{{P_NS}}}seq", {"concurrent": "1", "nextAc": "seek"}
            )
            ctn = etree.SubElement(
                seq,
                f"{{{P_NS}}}cTn",
                {
                    "id": nid(),
                    "restart": "whenNotActive",
                    "fill": "hold",
                    "evtFilter": "cancelBubble",
                    "nodeType": "interactiveSeq",
                },
            )
            st = etree.SubElement(ctn, f"{{{P_NS}}}stCondLst")
            click = etree.SubElement(st, f"{{{P_NS}}}cond", {"evt": "onClick", "delay": "0"})
            tgt = etree.SubElement(click, f"{{{P_NS}}}tgtEl")
            etree.SubElement(tgt, f"{{{P_NS}}}spTgt", {"spid": str(shape_id(trigger))})
            end = etree.SubElement(ctn, f"{{{P_NS}}}endCondLst")
            cancel = etree.SubElement(end, f"{{{P_NS}}}cond", {"evt": "onCancel", "delay": "0"})
            etree.SubElement(etree.SubElement(cancel, f"{{{P_NS}}}tgtEl"), f"{{{P_NS}}}sldTgt")
            ch = etree.SubElement(ctn, f"{{{P_NS}}}childTnLst")
            par = etree.SubElement(ch, f"{{{P_NS}}}par")
            p_ctn = etree.SubElement(par, f"{{{P_NS}}}cTn", {"id": nid(), "fill": "hold"})
            st3 = etree.SubElement(p_ctn, f"{{{P_NS}}}stCondLst")
            etree.SubElement(st3, f"{{{P_NS}}}cond", {"delay": "0"})
            ch3 = etree.SubElement(p_ctn, f"{{{P_NS}}}childTnLst")
            inner = etree.SubElement(ch3, f"{{{P_NS}}}par")
            i_ctn = etree.SubElement(
                inner,
                f"{{{P_NS}}}cTn",
                {
                    "id": nid(),
                    "presetID": "1",
                    "presetClass": "entr",
                    "presetSubtype": "0",
                    "fill": "hold",
                    "grpId": "0",
                    "nodeType": "clickEffect",
                },
            )
            st4 = etree.SubElement(i_ctn, f"{{{P_NS}}}stCondLst")
            etree.SubElement(st4, f"{{{P_NS}}}cond", {"delay": "0"})
            ch4 = etree.SubElement(i_ctn, f"{{{P_NS}}}childTnLst")
            _set_visibility(ch4, nid, shape_id(reveal), "visible")

    def save(self, path: str):
        self.finalize()
        self.prs.save(path)


def _set_visibility(parent, nid, spid: int, value: str):
    sett = etree.SubElement(parent, f"{{{P_NS}}}set")
    bhvr = etree.SubElement(sett, f"{{{P_NS}}}cBhvr")
    etree.SubElement(bhvr, f"{{{P_NS}}}cTn", {"id": nid(), "dur": "1", "fill": "hold"})
    tgt = etree.SubElement(bhvr, f"{{{P_NS}}}tgtEl")
    etree.SubElement(tgt, f"{{{P_NS}}}spTgt", {"spid": str(spid)})
    names = etree.SubElement(bhvr, f"{{{P_NS}}}attrNameLst")
    name = etree.SubElement(names, f"{{{P_NS}}}attrName")
    name.text = "style.visibility"
    to = etree.SubElement(sett, f"{{{P_NS}}}to")
    etree.SubElement(to, f"{{{P_NS}}}strVal", {"val": value})


def title_slide(deck: Deck, name: str, main: str, part: str, subtitle: str):
    slide = deck.add(name, main, kind="title")
    add_rect(slide, Inches(0), Inches(0), SLIDE_W, SLIDE_H, WHITE)
    add_rect(slide, Inches(0), Inches(0), SLIDE_W, Inches(1.05), GREEN_HEADER)
    add_textbox(
        slide,
        Inches(0.4),
        Inches(0.22),
        Inches(9.2),
        Inches(0.7),
        "A2 Biology",
        size=32,
        bold=True,
        color=WHITE,
        align=PP_ALIGN.CENTER,
    )
    banner = add_rect(
        slide,
        Inches(1.4),
        Inches(1.20),
        Inches(7.2),
        Inches(0.7),
        GREEN_SOFT,
        line=GREEN_DARK,
        line_pt=1.5,
        rounded=True,
    )
    set_shape_text(banner, main, size=26, bold=True, color=BLACK, align=PP_ALIGN.CENTER)
    part_b = add_rect(
        slide,
        Inches(2.4),
        Inches(6.15),
        Inches(5.2),
        Inches(0.62),
        GREEN_DARK,
        rounded=True,
    )
    set_shape_text(part_b, part, size=22, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_textbox(
        slide,
        Inches(0.6),
        Inches(6.85),
        Inches(8.8),
        Inches(0.4),
        subtitle,
        size=12,
        color=GREY_DARK,
        align=PP_ALIGN.CENTER,
    )
    add_rect(slide, Inches(0), Inches(0), Inches(0.08), SLIDE_H, PURPLE)
    add_rect(slide, Inches(0.08), Inches(7.22), Inches(9.92), Inches(0.04), PURPLE_LINE)
    add_textbox(
        slide,
        Inches(0.3),
        Inches(7.24),
        Inches(9.4),
        Inches(0.24),
        FOOTER_NOTE,
        size=10,
        color=PURPLE,
        align=PP_ALIGN.CENTER,
    )
    nxt = add_oval(
        slide, Inches(9.42), Inches(6.45), Inches(0.42), Inches(0.42), PURPLE, line=PURPLE, line_pt=1.0
    )
    set_shape_text(nxt, "▶", size=14, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    # Dummy prev so finalize can wire sequential nav from the title slide.
    prev = add_oval(
        slide, Inches(0.16), Inches(6.45), Inches(0.42), Inches(0.42), WHITE, line=PURPLE, line_pt=1.75
    )
    set_shape_text(prev, "◀", size=14, bold=True, color=PURPLE, align=PP_ALIGN.CENTER)
    key = deck._key(name)
    deck._nav_shapes[key] = (prev, nxt)
    deck._maybe_home(key, slide, left=Inches(0.22), top=Inches(0.28))
    return slide
