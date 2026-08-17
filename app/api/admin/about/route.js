import { NextResponse } from "next/server";
import { adminHandler } from "@/lib/adminApi";
import { getAboutRecord, saveAboutRecord } from "@/lib/contentStore";
import { revalidateAboutPage } from "@/lib/revalidatePublic";

export async function GET() {
 return adminHandler(async () => {
  const row = await getAboutRecord();
  return NextResponse.json({
   text1: row?.text1 || "",
   text2: row?.text2 || "",
   text3: row?.text3 || "",
  });
 });
}

export async function PUT(request) {
 return adminHandler(async () => {
  const { text1, text2, text3 } = await request.json();
  const row = await saveAboutRecord({ text1, text2, text3 });
  revalidateAboutPage();
  return NextResponse.json(row);
 });
}
