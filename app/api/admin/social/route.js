import { NextResponse } from "next/server";
import { adminHandler } from "@/lib/adminApi";
import { phoneTelFromDisplay } from "@/lib/contactPhone";
import { getSocialRecord, saveSocialRecord } from "@/lib/contentStore";
import { revalidateSocialPages } from "@/lib/revalidatePublic";
import { instagramUrlFromUsername } from "@/lib/socialAppLinks";

function mapSocial(row) {
 return {
  email: row?.email || "",
  phoneDisplay: row?.phoneDisplay || "",
  instagramUsername: row?.instagramUsername || "",
 };
}

export async function GET() {
 return adminHandler(async () => {
  const row = await getSocialRecord();
  return NextResponse.json(mapSocial(row));
 });
}

export async function PUT(request) {
 return adminHandler(async () => {
  const { email, phoneDisplay, instagramUsername } = await request.json();
  const phoneTel = phoneTelFromDisplay(phoneDisplay);
  const instagramUrl = instagramUrlFromUsername(instagramUsername);

  const row = await saveSocialRecord({
   email,
   phoneDisplay,
   phoneTel,
   instagramUsername,
   instagramUrl,
  });

  revalidateSocialPages();

  return NextResponse.json(mapSocial(row));
 });
}
