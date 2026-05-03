"use client";

import Link from "next/link";
import { BHK_OPTIONS, NODES, type BHK } from "@/lib/nodes";
import type { Pin, PinType } from "@/lib/types";
import { useMemo } from "react";

export type Filters = {
  type: PinType | "all";
  nodes: Set<string>;
  bhk: Set<BHK>;
  maxRent: number | null;
};

type Props = {
  pins: Pin[];
  filters: Filters;
  onFiltersChange: (next: Filters) => void;
  onStartLister: () => void;
  onStartSeeker: () => void;
};

export default function Sidebar({
  pins,
  filters,
  onFiltersChange,
  onStartLister,
  onStartSeeker,
}: Props) {
  const stats = useMemo(() => computeStats(pins), [pins]);

  return (
    <aside className="flex h-full w-full flex-col gap-4 overflow-y-auto bg-white/95 p-5 backdrop-blur dark:bg-zinc-950/95 md:border-r md:border-black/10 md:dark:border-white/10">
      <header>
        <Link href="/" className="block">
          <h1 className="font-mono text-xl tracking-tight">
            navimumbai<span className="text-teal-600">.rent</span>
          </h1>
        </Link>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          Real rents from real tenants. No brokers. No app. No fees.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onStartLister}
          className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          List my flat
        </button>
        <button
          onClick={onStartSeeker}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          Find a flat
        </button>
      </div>

      <Section title="Show">
        <SegmentedToggle
          value={filters.type}
          options={[
            { value: "all", label: "All" },
            { value: "lister", label: "Listers" },
            { value: "seeker", label: "Seekers" },
          ]}
          onChange={(v) =>
            onFiltersChange({ ...filters, type: v as Filters["type"] })
          }
        />
      </Section>

      <Section title="BHK">
        <div className="flex flex-wrap gap-1.5">
          {BHK_OPTIONS.map((b) => {
            const active = filters.bhk.has(b);
            return (
              <button
                key={b}
                onClick={() => {
                  const next = new Set(filters.bhk);
                  if (active) next.delete(b);
                  else next.add(b);
                  onFiltersChange({ ...filters, bhk: next });
                }}
                className={`rounded-full px-2.5 py-1 text-xs ${
                  active
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "border border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                {b}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Nodes">
        <div className="flex flex-wrap gap-1.5">
          {NODES.map((n) => {
            const active = filters.nodes.has(n.slug);
            return (
              <button
                key={n.slug}
                onClick={() => {
                  const next = new Set(filters.nodes);
                  if (active) next.delete(n.slug);
                  else next.add(n.slug);
                  onFiltersChange({ ...filters, nodes: next });
                }}
                className={`rounded-full px-2.5 py-1 text-xs ${
                  active
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "border border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                {n.name}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Live stats">
        <div className="space-y-1 text-sm">
          <Stat label="Pins on map" value={stats.total.toString()} />
          <Stat label="Listed flats" value={stats.listers.toString()} />
          <Stat label="Seekers" value={stats.seekers.toString()} />
          <Stat
            label="Median 2BHK rent"
            value={
              stats.median2bhk
                ? `₹${stats.median2bhk.toLocaleString("en-IN")}/mo`
                : "—"
            }
          />
          <Stat
            label=".rent domains for sale"
            value="1 (this one) — DM owner"
            muted
          />
        </div>
      </Section>

      <footer className="mt-auto pt-4 text-xs text-zinc-500 dark:text-zinc-500">
        <div className="flex gap-3">
          <Link href="/faq" className="hover:underline">
            FAQ
          </Link>
          <Link href="/stats" className="hover:underline">
            Stats
          </Link>
          <a
            href="https://bengaluru.rent"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            Inspired by bengaluru.rent
          </a>
        </div>
        <p className="mt-3 leading-relaxed">
          Free forever. No signup. No ads. No data sold.
        </p>
      </footer>
    </aside>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Stat({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
      <span
        className={
          muted
            ? "text-xs italic text-zinc-500"
            : "font-medium tabular-nums"
        }
      >
        {value}
      </span>
    </div>
  );
}

function SegmentedToggle<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex w-full rounded-lg border border-zinc-300 p-0.5 dark:border-zinc-700">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition ${
            value === o.value
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function computeStats(pins: Pin[]) {
  const visible = pins.filter((p) => !p.hidden);
  const listers = visible.filter((p) => p.type === "lister");
  const seekers = visible.filter((p) => p.type === "seeker");
  const twoBhk = listers
    .filter((p) => p.bhk === "2BHK" && p.rent > 0)
    .map((p) => p.rent)
    .sort((a, b) => a - b);
  const median2bhk = twoBhk.length
    ? twoBhk[Math.floor(twoBhk.length / 2)]
    : null;
  return {
    total: visible.length,
    listers: listers.length,
    seekers: seekers.length,
    median2bhk,
  };
}
