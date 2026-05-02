import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Server not configured." }, { status: 503 });
  }
  const { id } = await params;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  const { error: insertError } = await admin
    .from("pin_reports")
    .insert({ pin_id: id, ip_hash: ip });
  if (insertError && !insertError.message.includes("duplicate")) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const { count } = await admin
    .from("pin_reports")
    .select("*", { count: "exact", head: true })
    .eq("pin_id", id);

  if ((count ?? 0) >= 3) {
    await admin.from("pins").update({ hidden: true }).eq("id", id);
  }
  return NextResponse.json({ reports: count ?? 0 });
}
