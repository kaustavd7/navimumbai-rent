import Link from "next/link";

export const metadata = {
  title: "FAQ — navimumbai.rent",
  description:
    "How navimumbai.rent works: who it's for, how matching works, why there's no signup, and what we do with your data.",
};

const QA: { q: string; a: React.ReactNode }[] = [
  {
    q: "What is this?",
    a: (
      <>
        A crowdsourced rent map for Navi Mumbai. Drop a pin with what you pay
        (or what you&apos;re looking for) and see what everyone else has paid.
        Inspired by{" "}
        <a
          href="https://bengaluru.rent"
          className="underline"
          target="_blank"
          rel="noreferrer"
        >
          bengaluru.rent
        </a>
        .
      </>
    ),
  },
  {
    q: "Why no signup?",
    a: "Because every signup screen kills the data you actually want. Drop a pin, leave a contact, that's it.",
  },
  {
    q: "How does matching work?",
    a: "A nightly job pairs seekers and listers within ~2.5 km on budget, BHK, and lifestyle preferences. Both sides get a single email with each other's contact info. No in-app chat, no broker, no follow-ups from us.",
  },
  {
    q: "Is contact info ever shown publicly?",
    a: "No. It's only emailed to a single match. It is never displayed on the map, in API responses, or anywhere else.",
  },
  {
    q: "How do you keep fake listings out?",
    a: "Per-IP rate limits, rent-range validation, statistical outlier flags, and community reports. A pin with 3+ reports is auto-hidden.",
  },
  {
    q: "What does it cost?",
    a: "Nothing. No ads. No premium tier. No brokers. No data sold. The site exists to make rents transparent.",
  },
  {
    q: "Is the domain itself for sale?",
    a: (
      <>
        Funny you ask. <strong>Yes</strong> — navimumbai.rent the domain is
        also up for grabs. If you want to take this project further or run
        something else on the address, email{" "}
        <a className="underline" href="mailto:kaustavdg.dasgupta@gmail.com">
          kaustavdg.dasgupta@gmail.com
        </a>
        . BHK: 1 domain. Rent: negotiable.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/"
        className="text-sm text-zinc-500 hover:underline"
      >
        ← back to map
      </Link>
      <h1 className="mt-4 font-mono text-3xl tracking-tight">
        navimumbai<span className="text-teal-600">.rent</span> · FAQ
      </h1>
      <div className="mt-10 space-y-8">
        {QA.map(({ q, a }) => (
          <section key={q}>
            <h2 className="text-base font-semibold">{q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {a}
            </p>
          </section>
        ))}
      </div>
    </main>
  );
}
