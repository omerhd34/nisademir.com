import { prisma } from "./prisma";
import { phoneTelFromDisplay } from "./contactPhone";
import { instagramUrlFromUsername } from "./socialAppLinks";

export async function getSocial() {
 const row = await prisma.social.findUnique({ where: { id: 1 } });
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
 const row = await prisma.about.findUnique({ where: { id: 1 } });
 if (!row) {
  return { text1: "", text2: "", text3: "" };
 }
 return { text1: row.text1, text2: row.text2, text3: row.text3 };
}

export async function getWork() {
 const workAreas = await prisma.workArea.findMany({ orderBy: { sortOrder: "asc" } });

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
 const rows = await prisma.article.findMany({ orderBy: { sortOrder: "asc" } });
 return rows.map(mapArticle);
}

export async function getArticleBySlug(slug) {
 const row = await prisma.article.findUnique({ where: { slug } });
 return row ? mapArticle(row) : null;
}

export async function getArticleSlugs() {
 const rows = await prisma.article.findMany({
  select: { slug: true },
  orderBy: { sortOrder: "asc" },
 });
 return rows.map((row) => row.slug);
}

export async function getFaq() {
 const items = await prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" } });

 return {
  items: items.map((item) => ({
   id: item.id,
   question: item.question,
   answer: item.answer,
  })),
 };
}

export async function getContact() {
 const row = await prisma.contact.findUnique({ where: { id: 1 } });
 if (!row) {
  return { workingHours: [] };
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
