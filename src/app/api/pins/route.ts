import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const PinSchema = z.object({
  type: z.enum(["lister", "seeker"]),
  lat: z.number().min(18).max(20),
  lng: z.number().min(72).max(74),
  node: z.string().nullable(),
  sector: z.string().nullable(),
  society: z.string().nullable(),
  bhk: z.string(),
  rent: z.number().int().min(1000).max(1_000_000),
  furnishing: z.string().nullable(),
  gated: z.boolean().nullable(),
  parking: z.number().nullable(),
  deposit_months: z.number().nullable(),
  pet_ok: z.boolean().nullable(),
  gender_pref: z.string().nullable(),
  diet_pref: z.string().nullable(),
  smoking_pref: z.string().nullable(),
  notes: z.string().nullable(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().min(7).max(20).optional(),
});

export async function POST(req: Request) {
  if (!url || !serviceKey) {
    return NextResponse.json(
      { error: "Server not configured." },
      { status: 503 }
    );
  }
  const body = await req.json().catch(() => null);
  const parsed = PinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid pin", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  if (!parsed.data.contact_email && !parsed.data.contact_phone) {
    return NextResponse.json(
      { error: "Provide email or phone." },
      { status: 400 }
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  // Per-IP rate limit: max 5 inserts in last 10 minutes.
  const tenMinAgo = new Date(Date.now() - 10 * 60_000).toISOString();
  const { count } = await admin
    .from("pins")
    .select("*", { count: "exact", head: true })
    .eq("ip_hash", ip)
    .gte("created_at", tenMinAgo);
  if ((count ?? 0) >= 5) {
    return NextResponse.json(
      { error: "Too many submissions. Try again later." },
      { status: 429 }
    );
  }

  const insert = {
    ...parsed.data,
    ip_hash: ip,
    expires_at:
      parsed.data.type === "seeker"
        ? new Date(Date.now() + 30 * 86400_000).toISOString()
        : null,
  };

  const { data, error } = await admin
    .from("pins")
    .insert(insert)
    .select()
    .single();
  if (error) {
    console.error("[api/pins] insert error:", error);
    return NextResponse.json({ error: error.message, details: error }, { status: 500 });
  }
  return NextResponse.json({ pin: data });
}
