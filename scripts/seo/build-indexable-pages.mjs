import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JD_SCIENCE_WORKSHEETS } from "../../src/jdScienceWorksheets.js";
import { JOSEPH_DANSO, SITE_ORIGIN } from "../../src/educatorProfile.js";
import { escapeHtml, renderPublicPage } from "./html-chrome.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const publicDir = path.join(root, "public");

const EXTRA_HOSTED_RESOURCES = [
  { level: "GCSE/IGCSE", subject: "Biology", exam_board: "Edexcel", resource_category: "Revision Notes", title: "Biology 1 - Cell Biology", file_name: "Biology 1 - Cell Biology.pptx" },
  { level: "GCSE/IGCSE", subject: "Biology", exam_board: "Edexcel", resource_category: "Revision Notes", title: "Biology 2 - Organisation", file_name: "Biology 2 - Organisation.pptx" },
  { level: "GCSE/IGCSE", subject: "Biology", exam_board: "Edexcel", resource_category: "Revision Notes", title: "Biology 3 - Infection and Response", file_name: "Biology 3 - Infection and Response.pptx" },
  { level: "GCSE/IGCSE", subject: "Biology", exam_board: "Edexcel", resource_category: "Revision Notes", title: "Biology 4 - Bioenergetics", file_name: "Biology 4 - Bioenergetics (1).pptx" },
  { level: "GCSE/IGCSE", subject: "Biology", exam_board: "Edexcel", resource_category: "Revision Notes", title: "Biology 5 - Homeostasis and Response", file_name: "Biology 5 - Homeostasis and Response (1).pptx" },
  { level: "GCSE/IGCSE", subject: "Biology", exam_board: "Edexcel", resource_category: "Revision Notes", title: "Biology 6 - Inheritance Variation and Evolution", file_name: "Biology 6 - Inheritance Variation and Evolution.pptx" },
  { level: "GCSE/IGCSE", subject: "Biology", exam_board: "Edexcel", resource_category: "Revision Notes", title: "Biology 7 - Ecology", file_name: "Biology 7 - Ecology.pptx" },
  { level: "GCSE/IGCSE", subject: "Biology", exam_board: "Edexcel", resource_category: "Revision Notes", title: "Unit 1 Biology Revision Booklet", file_name: "Unit-1-Biology-Revision-Booklet.pdf" },
  { level: "GCSE/IGCSE", subject: "Biology", exam_board: "Edexcel", resource_category: "Revision Notes", title: "JDScience B1 Cell Biology", file_name: "JDScience_B1_Cell_Biology.pptx" },
  { level: "GCSE/IGCSE", subject: "Biology", exam_board: "Edexcel", resource_category: "Revision Notes", title: "JDScience B4 Bioenergetics", file_name: "JDScience_B4_Bioenergetics.pptx" },
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
  return { slug: slugify(title), title };
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
    <p>JD Science is a UK education platform founded by <a href="${JOSEPH_DANSO.profilePath}">${escapeHtml(JOSEPH_DANSO.name)}</a>. Students and parents use it for GCSE, IGCSE, A-Level, T-Level and BTEC science and maths tutoring, official past-paper links, and original JD Science topic worksheets.</p>
    <h2>What JD Science publishes</h2>
    <p>Search engines index public pages, not files sitting only in an admin dashboard. JD Science therefore publishes crawlable pages for the organisation, the educator, and individual subjects and topics.</p>
    <div class="cards">
      ${card("/resources/", "Educational resources", "Subject and topic pages for Chemistry, Physics, Biology and Maths.")}
      ${card(JOSEPH_DANSO.profilePath, "Joseph Danso", "Science Lecturer, FRSC, QTLS, EdD candidate, examiner and WorldSkills educator.")}
      ${card("/worksheets/", "Original worksheets", "Exam-style practice written by JD Science, with separate answer sheets.")}
      ${card("/#book-anchor", "Book a tutor", "1-to-1 online science and maths tutoring, including Chemistry tuition in London.")}
    </div>
    <h2>Who we help</h2>
    <p>JD Science supports school, college and adult learners who need clear explanations, structured revision and exam technique. Resources cover Biology, Chemistry, Physics, Maths and selected vocational science courses.</p>
    <h2>Contact</h2>
    <p>Email <a href="mailto:${JOSEPH_DANSO.email}">${escapeHtml(JOSEPH_DANSO.email)}</a> or call <a href="tel:${JOSEPH_DANSO.telephone}">${escapeHtml(JOSEPH_DANSO.telephoneDisplay)}</a>.</p>
  `;
  writePage("about", renderPublicPage({
    title: "About JD Science | Science and Maths Tutoring UK",
    description: "JD Science is a UK education platform founded by Joseph Danso, offering GCSE and A-Level science tutoring, original worksheets and official past-paper links.",
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
    <p>As a Science Lecturer and examiner, Joseph focuses on how questions are asked, how marks are awarded and how students can show working clearly. His tutoring covers Chemistry, Physics, Biology and Maths from GCSE through to A-Level, T-Level and BTEC.</p>
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
    lede: `${JOSEPH_DANSO.role}. ${JOSEPH_DANSO.honorifics}. EdD candidate, examiner and WorldSkills educator.`,
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
      knowsAbout: ["Chemistry", "Physics", "Biology", "Mathematics", "GCSE", "A-Level", "Science education"],
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
    if (item.series_label !== "JD Science topic worksheets") continue;
    const subject = ensure(item.level, item.subject);
    const category = "Worksheets";
    if (!subject.categories.has(category)) subject.categories.set(category, new Map());
    const { slug, title } = topicFromWorksheet(item);
    const topics = subject.categories.get(category);
    if (!topics.has(slug)) topics.set(slug, { slug, title, items: [] });
    const answers = JD_SCIENCE_WORKSHEETS.find((other) => (
      other.series_label === "JD Science answer sheets"
      && other.exam_board === item.exam_board
      && other.level === item.level
      && other.subject === item.subject
      && other.file_name === item.file_name.replace(/\.html$/, "-answers.html")
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
    const href = item.embed_url || `/resources/${slugify(item.exam_board)}/${item.level === "A-Level" ? "alevel" : "gcse"}/${slugify(item.subject)}/${slugify(item.resource_category)}/${encodeURIComponent(item.file_name)}`;
    topics.get(slug).items.push({
      board: item.exam_board,
      href,
      label: item.title,
    });
  }

  return [...subjects.values()].sort((a, b) => `${a.level} ${a.subject}`.localeCompare(`${b.level} ${b.subject}`));
}

function writeResourcePages(subjects) {
  const levels = new Map();
  for (const subject of subjects) {
    if (!levels.has(subject.level)) levels.set(subject.level, []);
    levels.get(subject.level).push(subject);
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
        <p>Need a tutor? <a href="${JOSEPH_DANSO.profilePath}">Joseph Danso</a> teaches ${subject.subject} online, including to students in London.</p>
        <div class="cards">${categories.map(([category, topics]) => card(`${subjectPath}${categorySlug(category)}/`, category, `${topics.size} topic page${topics.size === 1 ? "" : "s"}`)).join("")}</div>
        <p class="meta">Also browse the interactive <a href="/papers">past papers and mark schemes</a> for official exam-board files.</p>
      `,
    }));

    for (const [category, topics] of categories) {
      const categoryPath = `${subjectPath}${categorySlug(category)}/`;
      const topicList = [...topics.values()].sort((a, b) => a.title.localeCompare(b.title));
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
            <p>This is the public JD Science page for <strong>${escapeHtml(topic.title)}</strong> in ${escapeHtml(levelLabel(subject.level))} ${escapeHtml(subject.subject)} ${escapeHtml(category.toLowerCase())}. Use the links below to open the worksheet, notes or video. Files uploaded only to the admin dashboard are not used as the indexable page.</p>
            <ul>
              ${topic.items.map((item) => `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label || item.board)}</a>${item.answersHref ? ` · <a href="${escapeHtml(item.answersHref)}">Answers</a>` : ""}</li>`).join("")}
            </ul>
            <p>Taught by <a href="${JOSEPH_DANSO.profilePath}">Joseph Danso</a>, Science Lecturer and online Chemistry tutor in London. <a href="/#book-anchor">Book a session</a>.</p>
          `,
        }));
        topicCount += 1;
      }
    }
  }
  return topicCount;
}

writeAboutPage();
writeJosephPage();
const subjects = collectTopics();
const topicCount = writeResourcePages(subjects);
console.log(`Wrote about, Joseph Danso profile, ${subjects.length} subject hubs and ${topicCount} topic pages.`);
