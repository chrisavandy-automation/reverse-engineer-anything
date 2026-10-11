import Link from "next/link";
import { SESSIONS, ALL_TAGS } from "@/lib/data";

// The real app's Library browses the archive (and published "shares"), filterable
// by tag slug. This is a static version over the seed data.
export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const sessions = tag ? SESSIONS.filter((s) => s.tags.some((t) => t.slug === tag)) : SESSIONS;

  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <p className="text-xs font-medium uppercase tracking-[.2em] text-[#939eff]">The archive</p>
      <h1 className="mt-2 font-[family-name:var(--font-archivo)] text-3xl font-extrabold uppercase tracking-[-.03em]">
        Library
      </h1>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/library"
          className={`rounded-full border border-white/[.08] px-3 py-1 text-xs ${!tag ? "bg-white/[.09] text-white" : "text-zinc-400 hover:text-white"}`}
        >
          All
        </Link>
        {ALL_TAGS.map((t) => (
          <Link
            key={t.slug}
            href={`/library?tag=${t.slug}`}
            className={`rounded-full border border-white/[.08] px-3 py-1 text-xs ${tag === t.slug ? "bg-white/[.09] text-white" : "text-zinc-400 hover:text-white"}`}
          >
            {t.name}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sessions.map((s) => (
          <div key={s.id} className="rounded-2xl border border-white/[.08] bg-white/[.03] p-4">
            <div className="mb-3 aspect-video rounded-lg bg-gradient-to-br from-[#7787ff22] to-[#0c0e13]" />
            <p className="text-sm font-medium text-zinc-100">{s.title}</p>
            <p className="mt-1 text-xs text-zinc-500">
              {s.memberName} · {s.sessionDate}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
