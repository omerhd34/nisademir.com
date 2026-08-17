import { NextResponse } from "next/server";
import { adminHandler } from "@/lib/adminApi";
import {
 createArticleRecord,
 getArticleRecords,
 reorderArticleRecords,
} from "@/lib/contentStore";
import { revalidateArticlePages } from "@/lib/revalidatePublic";

function normalizeContent(content) {
 return content || "";
}

function slugify(value) {
 return value
  .toLowerCase()
  .replace(/ğ/g, "g")
  .replace(/ü/g, "u")
  .replace(/ş/g, "s")
  .replace(/ı/g, "i")
  .replace(/ö/g, "o")
  .replace(/ç/g, "c")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");
}

export async function GET() {
 return adminHandler(async () => {
  const articles = await getArticleRecords();
  return NextResponse.json({ articles });
 });
}

export async function PATCH(request) {
 return adminHandler(async () => {
  const { order } = await request.json();

  if (!Array.isArray(order) || order.length === 0) {
   return NextResponse.json({ error: "Geçersiz sıra" }, { status: 400 });
  }

  const articles = await reorderArticleRecords(order);
  revalidateArticlePages();
  return NextResponse.json({ articles });
 });
}

export async function POST(request) {
 return adminHandler(async () => {
  const body = await request.json();
  const slug = body.slug?.trim() || slugify(body.title || "yazi");

  const article = await createArticleRecord({
   title: body.title,
   slug,
   image: body.image || "/",
   excerpt: body.excerpt || "",
   content: normalizeContent(body.content),
   writer: body.writer || null,
   category: body.category?.trim() || "Psikoloji",
  });

  revalidateArticlePages(article.slug);

  return NextResponse.json(article, { status: 201 });
 });
}
