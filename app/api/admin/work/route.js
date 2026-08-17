import { NextResponse } from "next/server";
import { adminHandler } from "@/lib/adminApi";
import { getWorkAreaRecords, saveWorkAreaRecords } from "@/lib/contentStore";
import { revalidateWorkPage } from "@/lib/revalidatePublic";

export async function GET() {
 return adminHandler(async () => {
  const areas = await getWorkAreaRecords();
  return NextResponse.json({ workAreas: areas });
 });
}

export async function PUT(request) {
 return adminHandler(async () => {
  const { workAreas } = await request.json();
  const updated = await saveWorkAreaRecords(workAreas);
  revalidateWorkPage();
  return NextResponse.json({ workAreas: updated });
 });
}
