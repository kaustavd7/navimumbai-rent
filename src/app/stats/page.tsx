import Link from "next/link";

export const metadata = {
  title: "Live stats — navimumbai.rent",
  description:
    "Median rents by node and BHK across Navi Mumbai, computed live from real tenant submissions.",
};

export default function StatsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← back to map
      </Link>
      <h1 className="mt-4 font-mono text-3xl tracking-tight">
        Live stats
      </h1>
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        This page will show median rents by node and BHK once enough pins land.
        For now, the sidebar on the map shows live counts.
      </p>
      <p className="mt-8 text-xs italic text-zinc-500">
        Median rent for a .rent domain in Navi Mumbai: 1 (this one). Available.
      </p>
    </main>
  );
}
