import {
  encodeFolderLabel,
  isFolderResource,
  folderMembershipId,
  listFolders,
  countFolderContents,
  folderBreadcrumb,
  seriesGroupKey,
} from "../src/resourceFolders.js";

const core = { id: "core", title: "Core units", file_type: "folder", file_url: "#folder", series_label: "folder:root", level: "T-Level", subject: "Science" };
const physics = { id: "phys", title: "Physics", file_type: "folder", file_url: "#folder", series_label: "folder:root", level: "T-Level", subject: "Science" };
const nested = { id: "esp-notes", title: "Exam notes", file_type: "folder", file_url: "#folder", series_label: "folder:phys", level: "T-Level", subject: "Science" };
const paper = { id: "p1", title: "Paper 1", file_type: "application/pdf", series_label: "folder:phys", level: "T-Level", subject: "Science", exam_board: "Pearson", resource_category: "Past Questions" };
const aqa = { id: "aqa", title: "Paper 1 Foundation", file_type: "application/pdf", series_label: "June 2023", level: "GCSE/IGCSE", subject: "Maths", exam_board: "AQA", resource_category: "Past Questions" };
const resources = [core, physics, nested, paper, aqa];

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(encodeFolderLabel(null) === "folder:root", "root label");
assert(encodeFolderLabel("phys") === "folder:phys", "nested label");
assert(!isFolderResource(aqa), "AQA papers are not folders");
assert(isFolderResource(physics), "physics is a folder");
assert(folderMembershipId(aqa) == null, "AQA series label is not a folder id");
assert(folderMembershipId(paper) === "phys", "paper lives in physics");
assert(seriesGroupKey(aqa) === "June 2023", "exam series grouping preserved");
assert(seriesGroupKey(paper) === "", "folder labels are not series headers");

const root = listFolders({ resources, level: "T-Level", subject: "Science", parentId: null });
assert(root.map((f) => f.title).join(",") === "Core units,Physics", `root folders were ${root.map((f) => f.title)}`);
assert(listFolders({ resources, level: "T-Level", subject: "Health", parentId: null }).length === 0, "folders are per subject");
assert(countFolderContents(resources, "phys") === 2, "physics contains nested folder + paper");
assert(folderBreadcrumb(resources, "esp-notes").map((f) => f.title).join(" > ") === "Physics > Exam notes", "breadcrumb");

console.log("resource folder helpers ok");
