import AskExperience from "./ask-experience";
import { EXAMPLES } from "@/lib/data";

export default function AskPage() {
  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden px-5">
      <div className="grid-fade pointer-events-none absolute inset-x-0 top-0 h-[70vh] opacity-40" />
      <section className="relative mx-auto flex min-h-[calc(100vh-6rem)] max-w-4xl flex-col items-center justify-center pb-20 pt-14 text-center">
        <h1 className="font-[family-name:var(--font-archivo)] text-[2.9rem] font-extrabold uppercase leading-[.86] tracking-[-.035em] sm:text-[5.25rem]">
          <span className="block">Ask the</span>
          <span className="block bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent">
            Titan Mind
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-zinc-500">
          Search years of field-tested strategies, frameworks, and lessons from inside the mastermind.
        </p>
        <AskExperience examples={EXAMPLES} />
      </section>
    </main>
  );
}
