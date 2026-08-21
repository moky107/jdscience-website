export function slugify(t) {
  return String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function levelKey(l) {
  const s = slugify(l);
  if (s.includes("11")) return "11+";
  if (s.includes("gcse") || s.includes("igcse")) return "GCSE/IGCSE";
  if (s.includes("a-level") || s === "alevel") return "A-Level";
  if (s.includes("t-level") || s === "tlevel") return "T-Level";
  if (s.includes("btec")) return "BTEC";
  return l;
}

export const FOLDER_FILE_TYPE = "folder";
export const FOLDER_LABEL_PREFIX = "folder:";
export const FOLDER_ROOT_LABEL = "folder:root";
export const TLEVEL_FOLDER_SUGGESTIONS = ["Core units", "Physics", "Chemistry", "Biology", "ESP"];

export function isFolderResource(resource) {
  const type = slugify(resource?.file_type);
  const url = String(resource?.file_url || "");
  return type === FOLDER_FILE_TYPE || type === "application-x-folder" || url === "folder" || url === "#folder";
}

export function parseFolderParentId(resource) {
  const label = String(resource?.series_label || "");
  if (!label.startsWith(FOLDER_LABEL_PREFIX)) return null;
  const id = label.slice(FOLDER_LABEL_PREFIX.length);
  if (!id || id === "root") return null;
  return id;
}

export function folderMembershipId(resource) {
  if (isFolderResource(resource)) return parseFolderParentId(resource);
  if (resource?.folder_id) return String(resource.folder_id);
  return parseFolderParentId(resource);
}

export function encodeFolderLabel(folderId) {
  return folderId ? `${FOLDER_LABEL_PREFIX}${folderId}` : FOLDER_ROOT_LABEL;
}

export function listFolders({ resources, level, subject, parentId }) {
  return resources
    .filter((resource) => {
      if (!isFolderResource(resource)) return false;
      if (levelKey(resource.level) !== levelKey(level)) return false;
      if (slugify(resource.subject) !== slugify(subject)) return false;
      return String(folderMembershipId(resource) || "") === String(parentId || "");
    })
    .sort((a, b) => String(a.title || "").localeCompare(String(b.title || ""), "en", { sensitivity: "base" }));
}

export function countFolderContents(resources, folderId) {
  const id = String(folderId || "");
  if (!id) return 0;
  return resources.filter((resource) => String(folderMembershipId(resource) || "") === id).length;
}

export function folderBreadcrumb(resources, folderId) {
  const folders = resources.filter(isFolderResource);
  const byId = new Map(folders.map((folder) => [String(folder.id), folder]));
  const trail = [];
  let current = byId.get(String(folderId || ""));
  const seen = new Set();
  while (current && !seen.has(String(current.id))) {
    seen.add(String(current.id));
    trail.unshift(current);
    current = byId.get(String(folderMembershipId(current) || ""));
  }
  return trail;
}

export function seriesGroupKey(resource) {
  const label = String(resource?.series_label || "");
  if (label.startsWith(FOLDER_LABEL_PREFIX)) return "";
  return label;
}
