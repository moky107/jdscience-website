import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JD_SCIENCE_WORKSHEETS } from "../../src/jdScienceWorksheets.js";
import { HOSTED_REVISION_NOTES } from "../../src/hostedRevisionNotes.js";
import { JOSEPH_DANSO, SITE_ORIGIN } from "../../src/educatorProfile.js";
import { FEATURED_RESOURCE_LANDINGS, JOSEPH_TEACHING_SUBJECTS, RESOURCE_TYPES } from "../../src/resourceLandingPages.js";
import { papersHref } from "../../src/papersQuery.js";
import { ELEVEN_PLUS_RESOURCES, ELEVEN_PLUS_SECTIONS } from "../../src/elevenPlusResources.js";
import { PEARSON_BTEC_HSC_RESOURCES } from "../../src/pearsonBtecHealthSocialCareResources.js";
import { JD_SCIENCE_HSC_RESOURCES } from "../../src/jdScienceHscResources.js";
import { writeTermsPage } from "./write-terms-page.mjs";
import { escapeHtml, renderPublicPage } from "./html-chrome.mjs";
import { isAnswerSheet, answersUrlFor, compareTopicTitles } from "../worksheets/catalog.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const publicDir = path.join(root, "public");

const EXTRA_HOSTED_RESOURCES = [
  ...HOSTED_REVISION_NOTES,
  ...ELEVEN_PLUS_RESOURCES,
  { level: "GCSE/IGCSE", subject: "Chemistry", exam_board: "Edexcel", resource_category: "Revision Notes", title: "Topic 1 Key Concepts notes", file_name: "jdscience-edexcel-gcse-chemistry-topic-1-key-concepts-notes-pdf.pdf" },
  { level: "GCSE/IGCSE", subject: "Chemistry", exam_board: "Edexcel", resource_category: "Videos", title: "Topic 1 Key Concepts In Chemistry", embed_url: "https://share.synthesia.io/embeds/videos/99d5e9d6-8756-4051-9e53-246cc6af911e" },
];

function slugify(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function levelSlug(level) {
  if (level === "GCSE/IGCSE") return "gcse";
  if (level === "A-Level") return "a-level";
  if (level === "T-Level") return "t-level";
  if (level === "11+") return "11-plus";
  return slugify(level);
}

function levelLabel(level) {
  if (level === "GCSE/IGCSE") return "GCSE";
  return level;
}

function categorySlug(category) {
  return slugify(category);
}

function topicFromWorksheet(item) {
  const url = item.file_url_override || "";
  const unitFolder = url.match(/\/(unit-\d+)\//i);
  if (unitFolder) {
    const n = unitFolder[1].replace(/^unit-/i, "");
    return { slug: unitFolder[1].toLowerCase(), title: `Unit ${n}` };
  }
  const fileBase = (item.file_name || "").replace(/-answers\.html$/i, "").replace(/\.html$/i, "");
  const title = item.title.replace(/\s*[—-]\s*JD Science.*$/i, "").trim();
  return { slug: fileBase || slugify(title), title };
}

function topicFromHosted(item) {
  let title = item.title
    .replace(/^JDScience\s+/i, "")
    .replace(/^(Biology|Chemistry|Physics|Maths)\s+\d+\s*[-–]\s*/i, "")
    .replace(/^Topic\s+\d+\s+/i, "")
    .replace(/\s+notes$/i, "")
    .trim();
  return { slug: item.topicSlug || slugify(title), title };
}

function writePage(relPath, html) {
  const full = path.join(publicDir, relPath, "index.html");
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
}

function card(href, title, text) {
  return `<a class="card" href="${escapeHtml(href)}"><strong>${escapeHtml(title)}</strong><span class="meta">${escapeHtml(text)}</span></a>`;
}

function writeAboutPage() {
  const bodyHtml = `
    <p>JD Science is a UK education platform. Students and parents use it for Chemistry, Physics, Biology and Applied Science tutoring, official past-paper links, original science worksheets, and the wider JD Science maths resources already published on the site.</p>
    <h2>What JD Science publishes</h2>
    <div class="cards">
      ${card("/resources/", "Educational resources", "Subject and topic pages for Chemistry, Physics, Biology and Maths.")}
      ${card(JOSEPH_DANSO.profilePath, "Joseph Danso", "Science Lecturer, FRSC, QTLS, EdD candidate, examiner and WorldSkills educator.")}
      ${card("/worksheets/", "Original worksheets", "Exam-style practice written by JD Science, with separate answer sheets.")}
      ${card("/#book-anchor", "Book a tutor", "1-to-1 online science tutoring, including Chemistry tuition in London.")}
    </div>
    <h2>Who we help</h2>
    <p>JD Science supports school, college and adult learners who need clear explanations, structured revision and exam technique. The platform publishes Biology, Chemistry, Physics, Maths and selected vocational science resources. Joseph Danso’s own teaching profile is Chemistry, Physics, Biology and Applied Science.</p>
    <h2>Contact</h2>
    <p>Email <a href="mailto:${JOSEPH_DANSO.email}">${escapeHtml(JOSEPH_DANSO.email)}</a> or call <a href="tel:${JOSEPH_DANSO.telephone}">${escapeHtml(JOSEPH_DANSO.telephoneDisplay)}</a>.</p>
  `;
  writePage("about", renderPublicPage({
    title: "About JD Science | Science and Maths Tutoring UK",
    description: "JD Science is a UK education platform offering GCSE and A-Level science tutoring, original worksheets and official past-paper links.",
    canonicalPath: "/about/",
    heading: "About JD Science",
    lede: "An education platform for science and maths tutoring, original worksheets and exam-board past papers.",
    breadcrumbs: [{ name: "About", path: "/about/" }],
    jsonLd: {
      "@type": "AboutPage",
      name: "About JD Science",
      url: `${SITE_ORIGIN}/about/`,
      mainEntity: { "@id": `${SITE_ORIGIN}/#organisation` },
    },
    bodyHtml,
  }));
}

function writeJosephPage() {
  const bodyHtml = `
    <p>${escapeHtml(JOSEPH_DANSO.summary)}</p>
    <h2>Professional profile</h2>
    <ul>${JOSEPH_DANSO.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <h2>JD Science</h2>
    <p>Joseph founded <a href="/about/">JD Science</a> so learners can find both tutoring and public revision pages. The platform publishes indexable subject and topic pages, including GCSE Chemistry resources and original worksheets, rather than keeping teaching files only inside an admin area.</p>
    <h2>Teaching and examining</h2>
    <p>As a Science Lecturer and examiner, Joseph focuses on how questions are asked, how marks are awarded and how students can show working clearly. His tutoring covers Chemistry, Physics, Biology and Applied Science from GCSE through to A-Level, T-Level and BTEC.</p>
    <h2>WorldSkills and authorship</h2>
    <p>Joseph is a WorldSkills educator and a published science education author. That work informs the way JD Science writes original practice questions and revision notes for classroom and online learning.</p>
    <h2>Book an online Chemistry tutor in London</h2>
    <p>Students in London and across the UK can book online or face-to-face support. Start on the <a href="/#book-anchor">booking form</a> or email <a href="mailto:${JOSEPH_DANSO.email}">${escapeHtml(JOSEPH_DANSO.email)}</a>.</p>
    <p class="meta">Also see <a href="/resources/gcse/chemistry/">GCSE Chemistry resources</a> and <a href="/tutors">all JD Science tutors</a>.</p>
  `;
  writePage("tutors/joseph-danso", renderPublicPage({
    title: "Joseph Danso Science Lecturer | FRSC, QTLS | JD Science",
    description: "Joseph Danso is a Science Lecturer, FRSC, QTLS, EdD candidate, examiner, WorldSkills educator and founder of JD Science. Book an online Chemistry tutor in London or across the UK.",
    canonicalPath: JOSEPH_DANSO.profilePath,
    heading: "Joseph Danso",
    lede: JOSEPH_DANSO.lede,
    breadcrumbs: [
      { name: "Tutors", path: "/tutors" },
      { name: "Joseph Danso", path: JOSEPH_DANSO.profilePath },
    ],
    jsonLd: {
      "@type": "Person",
      "@id": `${SITE_ORIGIN}/tutors/joseph-danso/#person`,
      name: JOSEPH_DANSO.name,
      honorificSuffix: JOSEPH_DANSO.honorifics,
      jobTitle: "Science Lecturer",
      description: JOSEPH_DANSO.summary,
      url: `${SITE_ORIGIN}${JOSEPH_DANSO.profilePath}`,
      email: JOSEPH_DANSO.email,
      telephone: JOSEPH_DANSO.telephone,
      address: { "@type": "PostalAddress", addressLocality: "London", addressCountry: "GB" },
      worksFor: { "@id": `${SITE_ORIGIN}/#organisation` },
      knowsAbout: ["Chemistry", "Physics", "Biology", "Applied Science", "GCSE", "A-Level", "Science education"],
    },
    bodyHtml,
  }));
}

function collectTopics() {
  const subjects = new Map();
  const ensure = (level, subject) => {
    const key = `${level}||${subject}`;
    if (!subjects.has(key)) {
      subjects.set(key, {
        level,
        subject,
        levelSlug: levelSlug(level),
        subjectSlug: slugify(subject),
        categories: new Map(),
      });
    }
    return subjects.get(key);
  };

  for (const item of JD_SCIENCE_WORKSHEETS) {
    if (isAnswerSheet(item)) continue;
    const subject = ensure(item.level, item.subject);
    const category = "Worksheets";
    if (!subject.categories.has(category)) subject.categories.set(category, new Map());
    const { slug, title } = topicFromWorksheet(item);
    const topics = subject.categories.get(category);
    if (!topics.has(slug)) topics.set(slug, { slug, title, items: [] });
    const answers = JD_SCIENCE_WORKSHEETS.find((other) => (
      isAnswerSheet(other)
      && other.exam_board === item.exam_board
      && other.level === item.level
      && other.subject === item.subject
      && other.file_url_override === answersUrlFor(item)
    ));
    topics.get(slug).items.push({
      board: item.exam_board,
      href: item.file_url_override,
      answersHref: answers?.file_url_override,
      label: `${item.exam_board} worksheet`,
    });
  }

  for (const item of EXTRA_HOSTED_RESOURCES) {
    const subject = ensure(item.level, item.subject);
    const category = item.resource_category;
    if (!subject.categories.has(category)) subject.categories.set(category, new Map());
    const { slug, title } = topicFromHosted(item);
    const topics = subject.categories.get(category);
    if (!topics.has(slug)) topics.set(slug, { slug, title, items: [] });
    const href = item.embed_url || item.file_url_override || `/resources/${slugify(item.exam_board)}/${item.level === "A-Level" ? "alevel" : "gcse"}/${slugify(item.subject)}/${slugify(item.resource_category)}/${encodeURIComponent(item.file_name)}`;
    topics.get(slug).items.push({
      board: item.exam_board,
      href,
      label: item.title,
    });
    if (item.notesHtml && !topics.get(slug).notesHtml) topics.get(slug).notesHtml = item.notesHtml;
    if (item.downloadHref && !topics.get(slug).downloadHref) {
      topics.get(slug).downloadHref = item.downloadHref;
      topics.get(slug).downloadLabel = item.downloadLabel;
    }
  }

  return [...subjects.values()].sort((a, b) => `${a.level} ${a.subject}`.localeCompare(`${b.level} ${b.subject}`));
}

function writeResourcePages(subjects) {
  const levels = new Map();
  for (const subject of subjects) {
    if (!levels.has(subject.level)) levels.set(subject.level, []);
    levels.get(subject.level).push(subject);
  }

  for (const page of FEATURED_RESOURCE_LANDINGS) {
    if (!levels.has(page.level)) levels.set(page.level, []);
    if (!levels.get(page.level).some((item) => item.subjectSlug === page.subjectSlug || item.subject === page.subject)) {
      levels.get(page.level).push({
        level: page.level,
        subject: page.subject,
        levelSlug: page.levelSlug,
        subjectSlug: page.subjectSlug,
      });
    }
  }

  writePage("resources", renderPublicPage({
    title: "JD Science Resources | GCSE, A-Level, T-Level and BTEC",
    description: "Browse indexable JD Science resource pages by level and subject, including GCSE Chemistry, Biology, Physics and Maths worksheets and revision notes.",
    canonicalPath: "/resources/",
    heading: "JD Science resources",
    lede: "Public subject and topic pages for science and maths — not just a single generic resources screen.",
    breadcrumbs: [{ name: "Resources", path: "/resources/" }],
    jsonLd: { "@type": "CollectionPage", name: "JD Science resources", url: `${SITE_ORIGIN}/resources/` },
    bodyHtml: `
      <p>Each important subject has its own URL so search engines can index pages such as GCSE Chemistry resources or A-Level Biology worksheets. Official past papers are listed in the <a href="/papers">past papers browser</a>.</p>
      ${[...levels.entries()].map(([level, list]) => `
        <h2>${escapeHtml(level)}</h2>
        <div class="cards">${list.map((subject) => card(`/resources/${subject.levelSlug}/${subject.subjectSlug}/`, `${levelLabel(level)} ${subject.subject}`, `Worksheets, revision notes and related ${subject.subject} resources.`)).join("")}</div>
      `).join("")}
    `,
  }));

  for (const [level, list] of levels) {
    const first = list[0];
    writePage(`resources/${first.levelSlug}`, renderPublicPage({
      title: `${levelLabel(level)} Science and Maths Resources | JD Science`,
      description: `Free ${levelLabel(level)} science and maths resource pages from JD Science, including worksheets and revision notes for Biology, Chemistry, Physics and Maths.`,
      canonicalPath: `/resources/${first.levelSlug}/`,
      heading: `${levelLabel(level)} resources`,
      lede: `Indexable ${levelLabel(level)} pages for science and maths topics, tutoring and exam practice.`,
      breadcrumbs: [
        { name: "Resources", path: "/resources/" },
        { name: levelLabel(level), path: `/resources/${first.levelSlug}/` },
      ],
      jsonLd: { "@type": "CollectionPage", name: `${levelLabel(level)} resources`, url: `${SITE_ORIGIN}/resources/${first.levelSlug}/` },
      bodyHtml: `<div class="cards">${list.map((subject) => card(`/resources/${subject.levelSlug}/${subject.subjectSlug}/`, subject.subject, `${levelLabel(level)} ${subject.subject} topic pages.`)).join("")}</div>`,
    }));
  }

  let topicCount = 0;
  for (const subject of subjects) {
    const subjectPath = `/resources/${subject.levelSlug}/${subject.subjectSlug}/`;
    const categories = [...subject.categories.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    writePage(`resources/${subject.levelSlug}/${subject.subjectSlug}`, renderPublicPage({
      title: `${levelLabel(subject.level)} ${subject.subject} Resources | JD Science`,
      description: `${levelLabel(subject.level)} ${subject.subject} resources from JD Science, including original worksheets, revision notes and topic pages for UK students.`,
      canonicalPath: subjectPath,
      heading: `${levelLabel(subject.level)} ${subject.subject} resources`,
      lede: `Public ${subject.subject} pages for ${levelLabel(subject.level)} students, with topic-level worksheets and notes.`,
      breadcrumbs: [
        { name: "Resources", path: "/resources/" },
        { name: levelLabel(subject.level), path: `/resources/${subject.levelSlug}/` },
        { name: subject.subject, path: subjectPath },
      ],
      jsonLd: {
        "@type": "CollectionPage",
        name: `${levelLabel(subject.level)} ${subject.subject} resources`,
        url: `${SITE_ORIGIN}${subjectPath}`,
        about: subject.subject,
        educationalLevel: subject.level,
      },
      bodyHtml: `
        <p>These pages exist so searches such as “JD Science ${levelLabel(subject.level)} ${subject.subject} resources” can land on a real public URL, not an admin upload list.</p>
        ${JOSEPH_TEACHING_SUBJECTS.includes(subject.subject)
          ? `<p>Need a tutor? <a href="${JOSEPH_DANSO.profilePath}">Joseph Danso</a> teaches ${escapeHtml(subject.subject)} online, including to students in London.</p>`
          : `<p>Need a tutor? See the <a href="/tutors">JD Science tutor directory</a> or <a href="${JOSEPH_DANSO.profilePath}">Joseph Danso’s science profile</a>.</p>`}
        <div class="cards">${categories.map(([category, topics]) => card(`${subjectPath}${categorySlug(category)}/`, category, `${topics.size} topic page${topics.size === 1 ? "" : "s"}`)).join("")}</div>
        <p class="meta">Also browse the interactive <a href="/papers">past papers and mark schemes</a> for official exam-board files.</p>
      `,
    }));

    for (const [category, topics] of categories) {
      const categoryPath = `${subjectPath}${categorySlug(category)}/`;
      const topicList = [...topics.values()].sort((a, b) => compareTopicTitles(a.title, b.title));
      writePage(`resources/${subject.levelSlug}/${subject.subjectSlug}/${categorySlug(category)}`, renderPublicPage({
        title: `${levelLabel(subject.level)} ${subject.subject} ${category} | JD Science`,
        description: `${category} for ${levelLabel(subject.level)} ${subject.subject} from JD Science, organised by topic so students can find the exact page they need.`,
        canonicalPath: categoryPath,
        heading: `${levelLabel(subject.level)} ${subject.subject} ${category.toLowerCase()}`,
        lede: `Topic-by-topic ${category.toLowerCase()} for ${levelLabel(subject.level)} ${subject.subject}.`,
        breadcrumbs: [
          { name: "Resources", path: "/resources/" },
          { name: levelLabel(subject.level), path: `/resources/${subject.levelSlug}/` },
          { name: subject.subject, path: subjectPath },
          { name: category, path: categoryPath },
        ],
        jsonLd: {
          "@type": "CollectionPage",
          name: `${levelLabel(subject.level)} ${subject.subject} ${category}`,
          url: `${SITE_ORIGIN}${categoryPath}`,
        },
        bodyHtml: `<div class="cards">${topicList.map((topic) => card(`${categoryPath}${topic.slug}/`, topic.title, `${topic.title} ${levelLabel(subject.level)} ${subject.subject} ${category}`)).join("")}</div>`,
      }));

      for (const topic of topicList) {
        const topicPath = `${categoryPath}${topic.slug}/`;
        const title = `${topic.title} ${levelLabel(subject.level)} ${subject.subject} ${category} | JD Science`;
        const noteLinks = topic.items.filter((item) => item.href && item.href !== topicPath);
        const downloadLink = topic.downloadHref
          ? `<p><a class="download" href="${escapeHtml(topic.downloadHref)}">${escapeHtml(topic.downloadLabel || "Download slides")}</a></p>`
          : "";
        writePage(`resources/${subject.levelSlug}/${subject.subjectSlug}/${categorySlug(category)}/${topic.slug}`, renderPublicPage({
          title,
          description: `${topic.title} ${levelLabel(subject.level)} ${subject.subject} ${category.toLowerCase()} from JD Science. Original practice and revision for UK students, with tutoring from Joseph Danso.`,
          canonicalPath: topicPath,
          heading: `${topic.title}`,
          lede: `${topic.title} ${levelLabel(subject.level)} ${subject.subject} ${category.toLowerCase()} from JD Science.`,
          breadcrumbs: [
            { name: "Resources", path: "/resources/" },
            { name: levelLabel(subject.level), path: `/resources/${subject.levelSlug}/` },
            { name: subject.subject, path: subjectPath },
            { name: category, path: categoryPath },
            { name: topic.title, path: topicPath },
          ],
          jsonLd: {
            "@type": "LearningResource",
            name: `${topic.title} ${levelLabel(subject.level)} ${subject.subject} ${category}`,
            description: `${topic.title} ${levelLabel(subject.level)} ${subject.subject} ${category.toLowerCase()} published by JD Science.`,
            url: `${SITE_ORIGIN}${topicPath}`,
            educationalLevel: subject.level,
            about: topic.title,
            learningResourceType: category,
            isAccessibleForFree: true,
            provider: { "@type": "EducationalOrganization", name: "JD Science", url: SITE_ORIGIN },
            author: { "@id": `${SITE_ORIGIN}/tutors/joseph-danso/#person` },
          },
          bodyHtml: `
            ${topic.notesHtml || `<p>This is the public JD Science page for <strong>${escapeHtml(topic.title)}</strong> in ${escapeHtml(levelLabel(subject.level))} ${escapeHtml(subject.subject)} ${escapeHtml(category.toLowerCase())}.</p>`}
            ${downloadLink}
            ${noteLinks.length ? `<h2>Open these resources</h2><ul>${noteLinks.map((item) => `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label || item.board)}</a>${item.answersHref ? ` · <a href="${escapeHtml(item.answersHref)}">Answers</a>` : ""}</li>`).join("")}</ul>` : ""}
            <p>${JOSEPH_TEACHING_SUBJECTS.includes(subject.subject)
              ? `Taught with support from <a href="${JOSEPH_DANSO.profilePath}">Joseph Danso</a>, Science Lecturer in London.`
              : `Browse more <a href="/resources/">JD Science resource pages</a> or <a href="/tutors">find a tutor</a>.`} <a href="/#book-anchor">Book a session</a>.</p>
          `,
        }));
        topicCount += 1;
      }
    }
  }
  return topicCount;
}

function pearsonOpenCard(item) {
  const isPdf = /\.pdf$/i.test(item.file_url_override || "");
  const label = isPdf ? "Open PDF" : (/qualifications\.pearson\.com/i.test(item.file_url_override || "") ? "Open Pearson library" : "Open PDF");
  return `<article class="resource-card">
    <div class="subject">${escapeHtml(item.resource_category)}</div>
    <h3>${escapeHtml(item.title)}</h3>
    ${item.series_label ? `<p>${escapeHtml(item.series_label)}</p>` : ""}
    <a class="btn" href="${escapeHtml(item.file_url_override)}" target="${/^https?:\/\//i.test(item.file_url_override || "") ? "_blank" : "_self"}" rel="noreferrer">${label}</a>
  </article>`;
}

function hscOpenLinksHtml() {
  const groups = [
    ["Past Questions", "JDScience practice papers"],
    ["Mark Schemes", "JDScience mark schemes"],
    ["Specifications", "Specifications"],
    ["Examiner Reports", "Examiner reports"],
  ];
  const all = [...JD_SCIENCE_HSC_RESOURCES, ...PEARSON_BTEC_HSC_RESOURCES];
  return groups.map(([category, heading]) => {
    const items = all.filter((item) => item.resource_category === category);
    if (!items.length) return "";
    return `
      <h2>${escapeHtml(heading)}</h2>
      <div class="cards">${items.map(pearsonOpenCard).join("")}</div>
    `;
  }).join("");
}

function writeFeaturedLandingPages() {
  for (const page of FEATURED_RESOURCE_LANDINGS) {
    const categoryCards = RESOURCE_TYPES.map((type) => card(
      papersHref({ level: page.level, subject: page.subject, res: type }),
      type,
      `Open the existing JD Science library for ${page.levelLabel} ${page.subject} ${type.toLowerCase()}.`,
    )).join("");
    const boardCards = page.boards.map((board) => card(
      papersHref({ level: page.level, subject: page.subject, board }),
      board,
      `${page.levelLabel} ${page.subject} resources filtered to ${board}.`,
    )).join("");
    const related = page.related.map((item) => `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.text)}</a></li>`).join("");
    const hscOpenLinks = page.path === "/resources/btec/health-and-social-care/"
      ? `<p class="callout">Original JDScience practice papers open as PDFs on this site. No JD Science account is needed. Official Pearson papers remain on Pearson.</p>${hscOpenLinksHtml()}`
      : "";
    writePage(`resources/${page.levelSlug}/${page.subjectSlug}`, renderPublicPage({
      title: page.title,
      description: page.description,
      canonicalPath: page.path,
      heading: page.heading,
      lede: `${page.levelLabel} ${page.subject} revision notes, worksheets, past papers and exam practice from the existing JD Science resource library.`,
      breadcrumbs: [
        { name: "Resources", path: "/resources/" },
        { name: page.levelLabel, path: `/resources/${page.levelSlug}/` },
        { name: page.subject, path: page.path },
      ],
      jsonLd: [
        {
          "@type": ["CollectionPage", "WebPage"],
          name: page.heading,
          url: `${SITE_ORIGIN}${page.path}`,
          description: page.description,
          inLanguage: "en-GB",
          isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
          publisher: { "@id": `${SITE_ORIGIN}/#organisation` },
          about: page.subject,
          educationalLevel: page.level,
        },
      ],
      bodyHtml: `
        <p>${escapeHtml(page.intro)}</p>${hscOpenLinks ? `\n        ${hscOpenLinks}` : ""}
        <h2>Resource categories</h2>
        <p>These links open the current <a href="${escapeHtml(papersHref({ level: page.level, subject: page.subject }))}">${escapeHtml(page.levelLabel)} ${escapeHtml(page.subject)} past papers</a> browser. Uploads, Supabase records and static files stay in that system.</p>
        <div class="cards">${categoryCards}</div>
        <h2>Exam boards</h2>
        <div class="cards">${boardCards}</div>
        <h2>Related JD Science pages</h2>
        <ul>${related}</ul>
      `,
    }));
  }
}

function writeMissingFeaturedHubs(subjects) {
  const missing = FEATURED_RESOURCE_LANDINGS.filter((page) => (
    !subjects.some((item) => item.levelSlug === page.levelSlug && item.subjectSlug === page.subjectSlug)
  ));
  const byLevel = new Map();
  for (const page of missing) {
    if (!byLevel.has(page.level)) byLevel.set(page.level, []);
    byLevel.get(page.level).push(page);
  }
  for (const [level, pages] of byLevel) {
    const levelSlug = pages[0].levelSlug;
    const existing = subjects.filter((item) => item.levelSlug === levelSlug);
    const cards = [
      ...existing.map((item) => card(`/resources/${item.levelSlug}/${item.subjectSlug}/`, item.subject, `${levelLabel(item.level)} ${item.subject} topic pages.`)),
      ...pages.map((page) => card(page.path, page.subject, `${page.levelLabel} ${page.subject} SEO landing page.`)),
    ].join("");
    writePage(`resources/${levelSlug}`, renderPublicPage({
      title: `${pages[0].levelLabel} Science Resources | JD Science`,
      description: `Public ${pages[0].levelLabel} science resource pages from JD Science, including ${pages.map((page) => page.subject).join(", ")}.`,
      canonicalPath: `/resources/${levelSlug}/`,
      heading: `${pages[0].levelLabel} resources`,
      lede: `Indexable ${pages[0].levelLabel} pages that open the existing JD Science resource library.`,
      breadcrumbs: [
        { name: "Resources", path: "/resources/" },
        { name: pages[0].levelLabel, path: `/resources/${levelSlug}/` },
      ],
      jsonLd: { "@type": "CollectionPage", name: `${pages[0].levelLabel} resources`, url: `${SITE_ORIGIN}/resources/${levelSlug}/` },
      bodyHtml: `<div class="cards">${cards}</div>`,
    }));
  }
}

function pdfCard(item) {
  return `<article class="resource-card">
    <div class="subject">${escapeHtml(item.subject)}</div>
    <h3>${escapeHtml(item.title)}</h3>
    <div class="skill">Skill area: ${escapeHtml(item.skill_area)}</div>
    <a class="btn" href="${escapeHtml(item.file_url_override)}" target="_blank" rel="noreferrer">Open PDF</a>
  </article>`;
}

function writeElevenPlusPages() {
  const grouped = new Map();
  for (const section of ELEVEN_PLUS_SECTIONS) {
    grouped.set(section.title, ELEVEN_PLUS_RESOURCES.filter((item) => item.subject === section.title));
  }

  writePage("resources/11-plus", renderPublicPage({
    title: "Free 11+ Practice Papers | JD Science",
    description: "Download original JDScience 11+ Maths, English, Verbal Reasoning, Non-Verbal Reasoning and mixed practice PDFs. Free, no login required.",
    canonicalPath: "/resources/11-plus/",
    heading: "11+ resources",
    lede: "Original JDScience 11+ practice papers with answers. Free to open — no account needed.",
    breadcrumbs: [
      { name: "Resources", path: "/resources/" },
      { name: "11+", path: "/resources/11-plus/" },
    ],
    jsonLd: { "@type": "CollectionPage", name: "JD Science 11+ resources", url: `${SITE_ORIGIN}/resources/11-plus/` },
    bodyHtml: `
      <p class="callout">These PDFs are original JDScience material. They are independent of, and not affiliated with, GL Assessment, CEM, CSSE, Bond, CGP or any other publisher. They do not rehost third-party downloads. Newer papers have a separate answer booklet.</p>
      <p>Also browse them in the live library: <a href="${escapeHtml(papersHref({ level: "11+" }))}">11+ on the resources page</a>.</p>
      <h2>11+ subjects</h2>
      <div class="cards">${ELEVEN_PLUS_SECTIONS.map((section) => card(section.path, section.title, `JDScience 11+ ${section.title} practice papers.`)).join("")}</div>
      ${ELEVEN_PLUS_SECTIONS.map((section) => `
        <h2>11+ → ${escapeHtml(section.title)}</h2>
        <div class="cards">${grouped.get(section.title).map(pdfCard).join("")}</div>
      `).join("")}
    `,
  }));

  for (const section of ELEVEN_PLUS_SECTIONS) {
    if (section.id === "parent-guide") continue;
    const items = section.id === "mixed-practice"
      ? [...(grouped.get("Mixed Practice") || []), ...(grouped.get("Parent Guide") || [])]
      : (grouped.get(section.title) || []);
    writePage(`resources/11-plus/${section.id}`, renderPublicPage({
      title: `11+ ${section.title} Practice Papers | JD Science`,
      description: `Free original JDScience 11+ ${section.title} PDFs with questions, answers and short explanations. No login required.`,
      canonicalPath: `/resources/11-plus/${section.id}/`,
      heading: `11+ ${section.title}`,
      lede: `Original JDScience 11+ ${section.title} resources. Open a PDF in a new tab — no account needed.`,
      breadcrumbs: [
        { name: "Resources", path: "/resources/" },
        { name: "11+", path: "/resources/11-plus/" },
        { name: section.title, path: `/resources/11-plus/${section.id}/` },
      ],
      jsonLd: { "@type": "CollectionPage", name: `11+ ${section.title} resources`, url: `${SITE_ORIGIN}/resources/11-plus/${section.id}/` },
      bodyHtml: `
        <p class="callout">Public downloads. Practice papers include student instructions and timed guidance. Matching answer booklets give short explanations. No account needed.</p>
        <div class="cards">${items.map(pdfCard).join("")}</div>
        <p class="meta"><a href="/resources/11-plus/">All 11+ resources</a> · <a href="${escapeHtml(papersHref({ level: "11+", subject: section.title }))}">Open in the resources library</a></p>
      `,
    }));
  }

  writePage("resources/11-plus/parent-guide", renderPublicPage({
    title: "11+ Parent Guide | JD Science",
    description: "A short original JDScience guide for families on using the free 11+ practice papers, timing, marking and wellbeing.",
    canonicalPath: "/resources/11-plus/parent-guide/",
    heading: "11+ Parent Guide",
    lede: "How to use the JDScience 11+ papers at home. Free to download.",
    breadcrumbs: [
      { name: "Resources", path: "/resources/" },
      { name: "11+", path: "/resources/11-plus/" },
      { name: "Parent Guide", path: "/resources/11-plus/parent-guide/" },
    ],
    jsonLd: { "@type": "LearningResource", name: "11+ Parent Guide", url: `${SITE_ORIGIN}/resources/11-plus/parent-guide/` },
    bodyHtml: `
      <div class="cards">${ELEVEN_PLUS_RESOURCES.filter((item) => item.subject === "Parent Guide").map(pdfCard).join("")}</div>
      <p class="meta"><a href="/resources/11-plus/mixed-practice/">Mixed practice papers</a> · <a href="/resources/11-plus/">All 11+ resources</a></p>
    `,
  }));
}

writeAboutPage();
writeJosephPage();
writeTermsPage(publicDir);
const subjects = collectTopics();
const topicCount = writeResourcePages(subjects);
writeFeaturedLandingPages();
writeMissingFeaturedHubs(subjects);
writeElevenPlusPages();
console.log(`Wrote about, Joseph Danso profile, ${subjects.length} subject hubs, ${topicCount} topic pages, ${FEATURED_RESOURCE_LANDINGS.length} featured SEO landings and 11+ PDF library pages.`);
