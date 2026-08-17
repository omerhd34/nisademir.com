import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getContentStorageError } from "@/lib/contentStore";

export async function adminHandler(handler) {
 try {
  await requireAdmin();
  return await handler();
 } catch (error) {
  if (error.message === "UNAUTHORIZED") {
   return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }
  if (error.code === "NOT_FOUND") {
   return NextResponse.json({ error: error.message || "Kayıt bulunamadı" }, { status: 404 });
  }
  const storageMessage = getContentStorageError(error);
  if (storageMessage) {
   return NextResponse.json({ error: storageMessage }, { status: 500 });
  }
  console.error(error);
  return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
 }
}
