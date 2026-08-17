import { phoneTelFromDisplay } from "./contactPhone";
import { instagramUrlFromUsername } from "./socialAppLinks";
import {
 getAboutRecord,
 getArticleRecordBySlug,
 getArticleRecords,
 getContactRecord,
 getFaqItemRecords,
 getSocialRecord,
 getWorkAreaRecords,
} from "./contentStore";

export async function getSocial() {
 const row = await getSocialRecord();
 if (!row) {
  return {
   email: "",
   phone: { display: "", tel: "" },
   instagram: { username: "", url: "" },
  };
 }

 return {
  email: row.email,
  phone: {
   display: row.phoneDisplay,
   tel: phoneTelFromDisplay(row.phoneDisplay),
  },
  instagram: {
   username: row.instagramUsername,
   url: instagramUrlFromUsername(row.instagramUsername),
  },
 };
}

export async function getAbout() {
 const row = await getAboutRecord();
 if (!row) {
  return { text1: "", text2: "", text3: "" };
 }
 return { text1: row.text1, text2: row.text2, text3: row.text3 };
}

export async function getWork() {
 const workAreas = await getWorkAreaRecords();

 return {
  workAreas: workAreas.map((area) => ({
   title: area.title,
   description: area.description,
   icon: area.icon,
  })),
 };
}

function mapArticle(row) {
 return {
  id: row.id,
  title: row.title,
  slug: row.slug,
  image: row.image,
  excerpt: row.excerpt,
  content: row.content,
  writer: row.writer || undefined,
  category: row.category?.trim() || "Psikoloji",
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
 };
}

export async function getArticles() {
 const rows = await getArticleRecords();
 return rows.map(mapArticle);
}

export async function getArticleBySlug(slug) {
 const row = await getArticleRecordBySlug(slug);
 return row ? mapArticle(row) : null;
}

export async function getArticleSlugs() {
 const rows = await getArticleRecords();
 return rows.map((row) => row.slug);
}

export async function getFaq() {
 const items = await getFaqItemRecords();

 return {
  items: items.map((item) => ({
   question: item.question,
   answer: item.answer,
  })),
 };
}

export async function getContact() {
 const row = await getContactRecord();
 if (!row) {
  return { workingHours: [] };
 }

 if (Array.isArray(row.workingHours)) {
  return { workingHours: row.workingHours };
 }

 try {
  return { workingHours: JSON.parse(row.workingHours) };
 } catch {
  return { workingHours: [] };
 }
}

export async function getSiteContent() {
 const [social, about, work, articles, contact] = await Promise.all([
  getSocial(),
  getAbout(),
  getWork(),
  getArticles(),
  getContact(),
 ]);

 return { social, about, work, articles, contact };
}
