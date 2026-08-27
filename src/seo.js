export const SITE_ORIGIN = "https://www.jdscience.co.uk";

export const PAGE_META = {
  home: {
    title: "JD Science | GCSE & A-Level Science and Maths Tutoring UK",
    description: "JD Science offers expert Chemistry, Physics, Biology and Maths tutoring plus free past papers and original worksheets for GCSE, IGCSE, A-Level, T-Level and BTEC students in the UK.",
  },
  papers: {
    title: "Past Papers and Worksheets | JD Science",
    description: "Find official past papers, mark schemes, specifications and original JD Science worksheets for GCSE, A-Level, T-Level and BTEC science and maths.",
  },
  resources: {
    title: "Revision Resources | JD Science",
    description: "Browse JD Science revision notes, past questions, mark schemes, examiner reports, worksheets and videos by exam board and subject.",
  },
  tutors: {
    title: "Find a Science or Maths Tutor | JD Science",
    description: "Book an approved JD Science tutor for GCSE, A-Level, T-Level or BTEC Biology, Chemistry, Physics and Maths. Online and face-to-face support.",
  },
  "auth-callback": {
    title: "Email verification | JD Science",
    description: "Confirm your JD Science account email address, then log in.",
  },
};

export function pageFromPathname(pathname) {
  if (pathname === "/papers" || pathname === "/papers/") return "papers";
  if (pathname === "/tutors" || pathname === "/tutors/") return "tutors";
  if (pathname === "/auth/callback" || pathname === "/auth/callback/") return "auth-callback";
  return "home";
}

export function pathForPage(page) {
  if (page === "papers" || page === "resources") return "/papers";
  if (page === "tutors") return "/tutors";
  if (page === "auth-callback") return "/auth/callback";
  return "/";
}

export function applyDocumentMeta(page, { noIndex = false } = {}) {
  if (typeof document === "undefined") return;
  const meta = PAGE_META[page] || PAGE_META.home;
  document.title = meta.title;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute("content", meta.description);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute("href", `${SITE_ORIGIN}${pathForPage(page)}`);
  const robots = document.querySelector('meta[name="robots"]');
  if (robots) robots.setAttribute("content", noIndex ? "noindex,nofollow" : "index,follow");
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", meta.title);
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) ogDescription.setAttribute("content", meta.description);
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute("content", `${SITE_ORIGIN}${pathForPage(page)}`);
}
