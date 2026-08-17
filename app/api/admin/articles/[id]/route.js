import { NextResponse } from "next/server";
import { adminHandler } from "@/lib/adminApi";
import {
 deleteArticleRecord,
 getArticleRecordById,
 updateArticleRecord,
} from "@/lib/contentStore";
import { revalidateArticlePages } from "@/lib/revalidatePublic";

function normalizeContent(content) {
 return content || "";
}

export async function GET(_request, { params }) {
 return adminHandler(async () => {
  const { id } = await params;
  const article = await getArticleRecordById(id);

  if (!article) {
   return NextResponse.json({ error: "Yazı bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(article);
 });
}

export async function PUT(request, { params }) {
 return adminHandler(async () => {
  const { id } = await params;
  const body = await request.json();

  const article = await updateArticleRecord(id, {
   title: body.title,
   image: body.image,
   excerpt: body.excerpt,
   content: normalizeContent(body.content),
   writer: body.writer || null,
   category: body.category?.trim() || "Psikoloji",
  });

  revalidateArticlePages(article.slug);

  return NextResponse.json(article);
 });
}

export async function DELETE(_request, { params }) {
 return adminHandler(async () => {
  const { id } = await params;
  const article = await deleteArticleRecord(id);
  revalidateArticlePages(article?.slug);
  return NextResponse.json({ success: true });
 });
}
