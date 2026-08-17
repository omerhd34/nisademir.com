import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const LEGACY_CONTENT_FILE = path.join(DATA_DIR, "content.json");
const LEGACY_CLOUDINARY_ID = "site-content";

const COLLECTIONS = {
 about: {
  file: "about.js",
  cloudinaryId: "about",
  empty: { text1: "", text2: "", text3: "" },
 },
 social: {
  file: "social.js",
  cloudinaryId: "social",
  empty: {
   email: "",
   phoneDisplay: "",
   phoneTel: "",
   instagramUsername: "",
   instagramUrl: "",
  },
 },
 workAreas: {
  file: "work.js",
  cloudinaryId: "work",
  empty: [],
 },
 articles: {
  file: "articles.js",
  cloudinaryId: "articles",
  empty: [],
 },
 faqItems: {
  file: "faq.js",
  cloudinaryId: "faq",
  empty: [],
 },
 contact: {
  file: "contact.js",
  cloudinaryId: "contact",
  empty: { workingHours: [] },
 },
};

function trimEnv(value) {
 if (!value) return value;
 const trimmed = value.trim();
 if (
  (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
  (trimmed.startsWith("'") && trimmed.endsWith("'"))
 ) {
  return trimmed.slice(1, -1);
 }
 return trimmed;
}

function getCloudinaryConfig() {
 const cloudName = trimEnv(process.env.CLOUDINARY_CLOUD_NAME);
 const apiKey = trimEnv(process.env.CLOUDINARY_API_KEY);
 const apiSecret = trimEnv(process.env.CLOUDINARY_API_SECRET);

 if (!cloudName || !apiKey || !apiSecret) {
  return null;
 }

 return {
  cloudName,
  apiKey,
  apiSecret,
  folder: trimEnv(process.env.CLOUDINARY_FOLDER) || "nisademir",
 };
}

function signCloudinaryParams(params, apiSecret) {
 const stringToSign = Object.keys(params)
  .sort()
  .map((key) => `${key}=${params[key]}`)
  .join("&");

 return crypto.createHash("sha1").update(`${stringToSign}${apiSecret}`).digest("hex");
}

function storageError(message, code = "CONTENT_STORAGE") {
 const error = new Error(message);
 error.code = code;
 return error;
}

function nextId(items) {
 return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

function withListIds(items) {
 const used = new Set();
 let maxId = items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);

 return items.map((item, sortOrder) => {
  let id = Number(item.id);
  if (!Number.isFinite(id) || id <= 0 || used.has(id)) {
   maxId += 1;
   id = maxId;
  }
  used.add(id);
  return { ...item, id, sortOrder };
 });
}

function normalizeCollection(name, raw) {
 if (name === "about") {
  return {
   text1: raw?.text1 || "",
   text2: raw?.text2 || "",
   text3: raw?.text3 || "",
  };
 }

 if (name === "social") {
  return {
   email: raw?.email || "",
   phoneDisplay: raw?.phoneDisplay || "",
   phoneTel: raw?.phoneTel || "",
   instagramUsername: raw?.instagramUsername || "",
   instagramUrl: raw?.instagramUrl || "",
  };
 }

 if (name === "contact") {
  if (Array.isArray(raw?.workingHours)) {
   return { workingHours: raw.workingHours };
  }
  try {
   return { workingHours: JSON.parse(raw?.workingHours || "[]") };
  } catch {
   return { workingHours: [] };
  }
 }

 return Array.isArray(raw) ? raw : [];
}

function localPath(name) {
 return path.join(DATA_DIR, COLLECTIONS[name].file);
}

function parseDataModule(source) {
 const trimmed = source.trim().replace(/;+\s*$/, "");
 const prefix = "export default";

 if (trimmed.startsWith(prefix)) {
  return JSON.parse(trimmed.slice(prefix.length).trim());
 }

 return JSON.parse(source);
}

function serializeDataModule(data) {
 return `export default ${JSON.stringify(data, null, 1)};\n`;
}

async function readDataFile(filePath) {
 const raw = await readFile(filePath, "utf8");
 return parseDataModule(raw);
}

async function writeDataFile(filePath, data) {
 await mkdir(path.dirname(filePath), { recursive: true });
 await writeFile(filePath, serializeDataModule(data), "utf8");
}

let legacyLocalContent = undefined;

async function readLegacyLocalContent() {
 if (legacyLocalContent !== undefined) {
  return legacyLocalContent;
 }

 try {
  legacyLocalContent = await readDataFile(LEGACY_CONTENT_FILE);
 } catch (error) {
  if (error.code !== "ENOENT") {
   throw error;
  }
  legacyLocalContent = null;
 }

 return legacyLocalContent;
}

async function readLocalCollection(name) {
 try {
  return normalizeCollection(name, await readDataFile(localPath(name)));
 } catch (error) {
  if (error.code !== "ENOENT") {
   throw error;
  }
 }

 const legacy = await readLegacyLocalContent();
 if (legacy && legacy[name] !== undefined) {
  return normalizeCollection(name, legacy[name]);
 }

 return structuredClone(COLLECTIONS[name].empty);
}

function cloudinaryRawUrl(config, publicId) {
 return `https://res.cloudinary.com/${config.cloudName}/raw/upload/${config.folder}/${publicId}`;
}

async function fetchCloudinaryJson(config, publicId) {
 const res = await fetch(cloudinaryRawUrl(config, publicId), { cache: "no-store" });
 if (res.status === 404) {
  return null;
 }
 if (!res.ok) {
  throw storageError("Uzaktan içerik okunamadı.");
 }

 try {
  return await res.json();
 } catch {
  return null;
 }
}

let legacyRemoteContent = undefined;

async function readLegacyRemoteContent(config) {
 if (legacyRemoteContent !== undefined) {
  return legacyRemoteContent;
 }

 try {
  legacyRemoteContent = await fetchCloudinaryJson(config, LEGACY_CLOUDINARY_ID);
 } catch (error) {
  console.error("Legacy remote content read failed:", error);
  legacyRemoteContent = null;
 }

 return legacyRemoteContent;
}

async function readRemoteCollection(config, name) {
 const remote = await fetchCloudinaryJson(config, COLLECTIONS[name].cloudinaryId);
 if (remote !== null) {
  return normalizeCollection(name, remote);
 }

 const legacy = await readLegacyRemoteContent(config);
 if (legacy && legacy[name] !== undefined) {
  return normalizeCollection(name, legacy[name]);
 }

 return null;
}

async function writeCloudinaryCollection(config, name, data) {
 const publicId = COLLECTIONS[name].cloudinaryId;
 const timestamp = Math.round(Date.now() / 1000);
 const params = {
  folder: config.folder,
  invalidate: "true",
  overwrite: "true",
  public_id: publicId,
  timestamp,
 };
 const signature = signCloudinaryParams(params, config.apiSecret);

 const form = new FormData();
 form.append("file", new Blob([JSON.stringify(data)], { type: "application/json" }), COLLECTIONS[name].file);
 form.append("api_key", config.apiKey);
 form.append("timestamp", String(timestamp));
 form.append("signature", signature);
 form.append("folder", config.folder);
 form.append("public_id", publicId);
 form.append("overwrite", "true");
 form.append("invalidate", "true");

 const res = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/raw/upload`, {
  method: "POST",
  body: form,
 });

 const payload = await res.json();
 if (!res.ok) {
  throw storageError(payload.error?.message || "İçerik kaydı başarısız.");
 }
}

let writeChain = Promise.resolve();

function enqueueWrite(task) {
 const run = writeChain.then(task, task);
 writeChain = run.then(
  () => { },
  () => { }
 );
 return run;
}

async function readCollection(name) {
 const config = getCloudinaryConfig();
 if (config && process.env.NODE_ENV === "production") {
  try {
   const remote = await readRemoteCollection(config, name);
   if (remote) {
    return remote;
   }
  } catch (error) {
   console.error(`Remote ${name} read failed, falling back to local file:`, error);
  }
 }

 return readLocalCollection(name);
}

async function persistCollection(name, data) {
 const normalized = normalizeCollection(name, data);
 const config = getCloudinaryConfig();

 if (process.env.NODE_ENV !== "production") {
  await writeDataFile(localPath(name), normalized);
  if (config) {
   await writeCloudinaryCollection(config, name, normalized);
  }
  return normalized;
 }

 if (!config) {
  throw storageError(
   "Production ortamında içerik kaydetmek için Cloudinary ayarlanmalı. CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY ve CLOUDINARY_API_SECRET değişkenlerini ekleyin.",
   "PRODUCTION_STORAGE_NOT_CONFIGURED"
  );
 }

 await writeCloudinaryCollection(config, name, normalized);
 try {
  await writeDataFile(localPath(name), normalized);
 } catch (error) {
  if (error.code !== "EROFS" && error.code !== "EACCES" && error.code !== "EPERM") {
   throw error;
  }
 }

 return normalized;
}

async function updateCollection(name, mutator) {
 return enqueueWrite(async () => {
  const current = await readCollection(name);
  return persistCollection(name, await mutator(current));
 });
}

export function getContentStorageError(error) {
 if (error.code === "CONTENT_STORAGE" || error.code === "PRODUCTION_STORAGE_NOT_CONFIGURED") {
  return error.message;
 }

 if (error.code === "EROFS" || error.code === "EACCES" || error.code === "EPERM") {
  return "Sunucu dosya sistemine yazamıyor. İçerik kaydetmek için Cloudinary kullanın.";
 }

 return null;
}

export async function getAboutRecord() {
 return readCollection("about");
}

export async function saveAboutRecord({ text1, text2, text3 }) {
 return updateCollection("about", () => ({
  text1: text1 || "",
  text2: text2 || "",
  text3: text3 || "",
 }));
}

export async function getSocialRecord() {
 return readCollection("social");
}

export async function saveSocialRecord(social) {
 return updateCollection("social", () => ({
  email: social.email || "",
  phoneDisplay: social.phoneDisplay || "",
  phoneTel: social.phoneTel || "",
  instagramUsername: social.instagramUsername || "",
  instagramUrl: social.instagramUrl || "",
 }));
}

export async function getWorkAreaRecords() {
 const workAreas = await readCollection("workAreas");
 return [...workAreas].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

export async function saveWorkAreaRecords(workAreas) {
 const saved = await updateCollection("workAreas", () =>
  withListIds(Array.isArray(workAreas) ? workAreas : []).map((area) => ({
   id: area.id,
   title: area.title || "",
   description: area.description || "",
   icon: area.icon || "LuUser",
   sortOrder: area.sortOrder,
  }))
 );
 return [...saved].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

export async function getFaqItemRecords() {
 const faqItems = await readCollection("faqItems");
 return Array.isArray(faqItems) ? faqItems : [];
}

export async function saveFaqItemRecords(items) {
 return updateCollection("faqItems", () =>
  (Array.isArray(items) ? items : []).map((item) => ({
   question: item.question || "",
   answer: item.answer || "",
  }))
 );
}

export async function getArticleRecords() {
 const articles = await readCollection("articles");
 return [...articles].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

export async function getArticleRecordById(id) {
 const articles = await getArticleRecords();
 return articles.find((article) => article.id === Number(id)) || null;
}

export async function getArticleRecordBySlug(slug) {
 const articles = await getArticleRecords();
 return articles.find((article) => article.slug === slug) || null;
}

export async function createArticleRecord(data) {
 let created = null;
 await updateCollection("articles", (articles) => {
  created = {
   id: nextId(articles),
   title: data.title,
   slug: data.slug,
   image: data.image || "/",
   excerpt: data.excerpt || "",
   content: data.content || "",
   writer: data.writer || null,
   category: data.category || "Psikoloji",
   sortOrder: articles.length,
   createdAt: new Date().toISOString(),
   updatedAt: new Date().toISOString(),
  };
  return [...articles, created];
 });
 return created;
}

export async function updateArticleRecord(id, data) {
 const articleId = Number(id);
 let updated = null;

 await updateCollection("articles", (articles) => {
  const next = articles.map((article) => {
   if (article.id !== articleId) {
    return article;
   }

   updated = {
    ...article,
    title: data.title,
    image: data.image,
    excerpt: data.excerpt,
    content: data.content,
    writer: data.writer || null,
    category: data.category || "Psikoloji",
    updatedAt: new Date().toISOString(),
   };
   return updated;
  });

  if (!updated) {
   throw storageError("Yazı bulunamadı.", "NOT_FOUND");
  }

  return next;
 });

 return updated;
}

export async function deleteArticleRecord(id) {
 const articleId = Number(id);
 let removed = null;

 await updateCollection("articles", (articles) => {
  const next = articles.filter((article) => {
   if (article.id !== articleId) {
    return true;
   }
   removed = article;
   return false;
  });

  if (!removed) {
   throw storageError("Yazı bulunamadı.", "NOT_FOUND");
  }

  return next.map((article, sortOrder) => ({ ...article, sortOrder }));
 });

 return removed;
}

export async function reorderArticleRecords(order) {
 const saved = await updateCollection("articles", (articles) => {
  const byId = new Map(articles.map((article) => [article.id, article]));
  const ordered = [];

  order.forEach((id, index) => {
   const article = byId.get(Number(id));
   if (!article) {
    return;
   }
   ordered.push({ ...article, sortOrder: index });
   byId.delete(Number(id));
  });

  byId.forEach((article) => {
   ordered.push({ ...article, sortOrder: ordered.length });
  });

  return ordered;
 });

 return [...saved].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

export async function getContactRecord() {
 return readCollection("contact");
}
