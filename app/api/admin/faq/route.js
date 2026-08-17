import { NextResponse } from "next/server";
import { adminHandler } from "@/lib/adminApi";
import { getFaqItemRecords, saveFaqItemRecords } from "@/lib/contentStore";
import { revalidateFaqPage } from "@/lib/revalidatePublic";

export async function GET() {
 return adminHandler(async () => {
  const items = await getFaqItemRecords();
  return NextResponse.json({ items });
 });
}

export async function PUT(request) {
 return adminHandler(async () => {
  const { items } = await request.json();
  const updatedItems = await saveFaqItemRecords(items);
  revalidateFaqPage();
  return NextResponse.json({ items: updatedItems });
 });
}
