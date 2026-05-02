import type { BHK, Furnishing } from "./nodes";

export type PinType = "lister" | "seeker";

export type Pin = {
  id: string;
  type: PinType;
  lat: number;
  lng: number;
  node: string | null;
  sector: string | null;
  society: string | null;
  bhk: BHK;
  rent: number;
  furnishing: Furnishing | null;
  gated: boolean | null;
  parking: number | null;
  deposit_months: number | null;
  pet_ok: boolean | null;
  gender_pref: "any" | "male" | "female" | null;
  diet_pref: "any" | "veg" | "non-veg" | null;
  smoking_pref: "any" | "ok" | "no" | null;
  notes: string | null;
  created_at: string;
  expires_at: string | null;
  hidden: boolean;
};

export type NewPinInput = Omit<
  Pin,
  "id" | "created_at" | "expires_at" | "hidden"
> & {
  contact_email?: string;
  contact_phone?: string;
};
