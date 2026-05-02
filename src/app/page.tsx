"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar, { type Filters } from "@/components/Sidebar";
import PinDialog from "@/components/PinDialog";
import { SEED_PINS } from "@/lib/seed";
import { supabase } from "@/lib/supabase";
import type { NewPinInput, Pin, PinType } from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function Home() {
  const [pins, setPins] = useState<Pin[]>(SEED_PINS);
  const [pending, setPending] = useState<{ lng: number; lat: number } | null>(
    null
  );
  const [dialogType, setDialogType] = useState<PinType | null>(null);
  const [armed, setArmed] = useState<PinType | null>(null);
  const [filters, setFilters] = useState<Filters>({
    type: "all",
    nodes: new Set(),
    bhk: new Set(),
    maxRent: null,
  });

  // Load pins from Supabase if configured.
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("pins_public")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(2000);
      if (cancelled) return;
      if (!error && data) setPins([...SEED_PINS, ...(data as Pin[])]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return pins.filter((p) => {
      if (p.hidden) return false;
      if (filters.type !== "all" && p.type !== filters.type) return false;
      if (filters.nodes.size && !filters.nodes.has(p.node ?? "")) return false;
      if (filters.bhk.size && !filters.bhk.has(p.bhk)) return false;
      if (filters.maxRent && p.rent > filters.maxRent) return false;
      return true;
    });
  }, [pins, filters]);

  const handleMapClick = useCallback(
    (lng: number, lat: number) => {
      if (!armed) return;
      setPending({ lng, lat });
      setDialogType(armed);
      setArmed(null);
    },
    [armed]
  );

  async function handleSubmit(input: NewPinInput) {
    // Optimistic local insert. Persists to Supabase if configured.
    const optimistic: Pin = {
      id: `local-${Date.now()}`,
      type: input.type,
      lat: input.lat,
      lng: input.lng,
      node: input.node,
      sector: input.sector,
      society: input.society,
      bhk: input.bhk,
      rent: input.rent,
      furnishing: input.furnishing,
      gated: input.gated,
      parking: input.parking,
      deposit_months: input.deposit_months,
      pet_ok: input.pet_ok,
      gender_pref: input.gender_pref,
      diet_pref: input.diet_pref,
      smoking_pref: input.smoking_pref,
      notes: input.notes,
      created_at: new Date().toISOString(),
      expires_at: null,
      hidden: false,
    };
    setPins((prev) => [optimistic, ...prev]);

    if (supabase) {
      const { error } = await supabase.from("pins").insert({
        type: input.type,
        lat: input.lat,
        lng: input.lng,
        node: input.node,
        sector: input.sector,
        society: input.society,
        bhk: input.bhk,
        rent: input.rent,
        furnishing: input.furnishing,
        gated: input.gated,
        parking: input.parking,
        deposit_months: input.deposit_months,
        pet_ok: input.pet_ok,
        gender_pref: input.gender_pref,
        diet_pref: input.diet_pref,
        smoking_pref: input.smoking_pref,
        notes: input.notes,
        contact_email: input.contact_email ?? null,
        contact_phone: input.contact_phone ?? null,
        hidden: false,
        expires_at: input.type === "seeker"
          ? new Date(Date.now() + 30 * 86400_000).toISOString()
          : null,
      });
      if (error) {
        console.error("[pins] insert error:", error);
        throw new Error(error.message);
      }
    }
  }

  return (
    <div className="flex h-[100dvh] w-full flex-col md:flex-row">
      <Sidebar
        pins={filtered}
        filters={filters}
        onFiltersChange={setFilters}
        onStartLister={() => setArmed("lister")}
        onStartSeeker={() => setArmed("seeker")}
      />

      <div className="relative flex-1 h-full min-h-0">
        <MapView
          pins={filtered}
          pendingPin={pending}
          onMapClick={handleMapClick}
        />

        {armed && (
          <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
            <div className="pointer-events-auto rounded-full bg-zinc-900/90 px-4 py-1.5 text-xs text-white shadow-lg">
              Tap the map to place your{" "}
              <strong>{armed === "lister" ? "listing" : "seeker"}</strong> pin —{" "}
              <button className="underline" onClick={() => setArmed(null)}>
                cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {dialogType && pending && (
        <PinDialog
          type={dialogType}
          location={pending}
          onClose={() => {
            setDialogType(null);
            setPending(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
