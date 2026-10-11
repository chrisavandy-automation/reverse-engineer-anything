import { Suspense } from "react";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-[calc(100vh-4rem)] place-items-center px-5">
      <section className="w-full max-w-sm text-center">
        <p className="text-xs font-medium uppercase tracking-[.2em] text-[#939eff]">Private archive</p>
        <h1 className="mt-3 font-[family-name:var(--font-archivo)] text-3xl font-extrabold uppercase tracking-[-.03em]">
          Enter the collective mind.
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Use the Titan Mastermind access password to continue.
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
