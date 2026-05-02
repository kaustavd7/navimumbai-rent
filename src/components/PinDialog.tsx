"use client";

import { useState } from "react";
import {
  BHK_OPTIONS,
  FURNISHING_OPTIONS,
  NODES,
  type BHK,
  type Furnishing,
} from "@/lib/nodes";
import type { NewPinInput, PinType } from "@/lib/types";

type Props = {
  type: PinType;
  location: { lng: number; lat: number };
  onClose: () => void;
  onSubmit: (input: NewPinInput) => Promise<void> | void;
};

export default function PinDialog({ type, location, onClose, onSubmit }: Props) {
  const [bhk, setBhk] = useState<BHK>("2BHK");
  const [rent, setRent] = useState<string>("");
  const [node, setNode] = useState<string>("");
  const [sector, setSector] = useState<string>("");
  const [society, setSociety] = useState<string>("");
  const [furnishing, setFurnishing] = useState<Furnishing>("unfurnished");
  const [gated, setGated] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLister = type === "lister";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const rentNum = Number(rent);
    if (!rentNum || rentNum < 1000 || rentNum > 1_000_000) {
      setError("Enter a realistic monthly rent (₹1,000 – ₹10,00,000).");
      return;
    }
    if (!email && !phone) {
      setError("Provide at least one contact (email or phone).");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        type,
        lat: location.lat,
        lng: location.lng,
        node: node || null,
        sector: sector || null,
        society: society || null,
        bhk,
        rent: rentNum,
        furnishing: isLister ? furnishing : null,
        gated: isLister ? gated : null,
        parking: null,
        deposit_months: null,
        pet_ok: null,
        gender_pref: "any",
        diet_pref: "any",
        smoking_pref: "any",
        notes: notes || null,
        contact_email: email || undefined,
        contact_phone: phone || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 md:items-center md:p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-xl dark:bg-zinc-950 md:rounded-2xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {isLister ? "List your flat" : "Find a flat"}
            </h3>
            <p className="text-xs text-zinc-500">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="BHK">
            <select
              value={bhk}
              onChange={(e) => setBhk(e.target.value as BHK)}
              className="nm-input"
            >
              {BHK_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>
          <Field label={isLister ? "Rent (₹/mo)" : "Max budget (₹/mo)"}>
            <input
              type="number"
              inputMode="numeric"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              className="nm-input"
              placeholder="e.g. 35000"
              required
            />
          </Field>

          <Field label="Node">
            <select
              value={node}
              onChange={(e) => setNode(e.target.value)}
              className="nm-input"
            >
              <option value="">Select node…</option>
              {NODES.map((n) => (
                <option key={n.slug} value={n.slug}>
                  {n.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sector (optional)">
            <input
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="nm-input"
              placeholder="e.g. 17"
            />
          </Field>

          {isLister && (
            <>
              <Field label="Furnishing">
                <select
                  value={furnishing}
                  onChange={(e) => setFurnishing(e.target.value as Furnishing)}
                  className="nm-input"
                >
                  {FURNISHING_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Gated society">
                <select
                  value={gated ? "yes" : "no"}
                  onChange={(e) => setGated(e.target.value === "yes")}
                  className="nm-input"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </Field>
              <Field label="Society (optional)" full>
                <input
                  value={society}
                  onChange={(e) => setSociety(e.target.value)}
                  className="nm-input"
                  placeholder="e.g. Sai Plaza"
                />
              </Field>
            </>
          )}

          <Field label="Contact email" full>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="nm-input"
              placeholder="shared only when matched"
            />
          </Field>
          <Field label="Or phone" full>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="nm-input"
              placeholder="shared only when matched"
            />
          </Field>

          <Field label="Notes (optional)" full>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="nm-input" style={{ minHeight: 64 }}
              placeholder="Move-in date, lifestyle, any context."
            />
          </Field>
        </div>

        {error && (
          <p className="mt-3 text-sm text-rose-600">{error}</p>
        )}

        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            Contact info is never shown publicly. It&apos;s only emailed to a
            single match.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Drop pin"}
          </button>
        </div>

        <style>{`
          .nm-input {
            width: 100%;
            border: 1px solid rgb(212 212 216);
            border-radius: 8px;
            padding: 6px 10px;
            font-size: 14px;
            background: #ffffff;
            color: #0c0a09;
            color-scheme: light;
          }
        `}</style>
      </form>
    </div>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 ${full ? "col-span-2" : ""}`}>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}
