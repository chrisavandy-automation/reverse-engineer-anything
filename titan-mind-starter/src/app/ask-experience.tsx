"use client";

import { useRef, useState } from "react";

type Tag = { name: string; slug: string };
type Source = {
  id: string;
  title: string;
  memberName: string;
  sessionDate: string;
  thumbnailUrl: string;
  tags: Tag[];
};
type Mode = "detailed" | "fast";

export default function AskExperience({ examples }: { examples: string[] }) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("detailed");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [status, setStatus] = useState("");
  const [streaming, setStreaming] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || streaming) return;
    setStreaming(true);
    setAnswer("");
    setSources([]);
    setStatus("Searching the archive…");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: q }], mode }),
    });
    if (!res.body) {
      setStatus("No response stream.");
      setStreaming(false);
      return;
    }

    // Parse the named-event SSE: `event: <name>\ndata: <json>\n\n`
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const frames = buf.split("\n\n");
      buf = frames.pop() ?? "";
      for (const frame of frames) {
        const evLine = frame.split("\n").find((l) => l.startsWith("event: "));
        const dataLine = frame.split("\n").find((l) => l.startsWith("data: "));
        if (!evLine || !dataLine) continue;
        const event = evLine.slice(7).trim();
        const data = JSON.parse(dataLine.slice(6));
        if (event === "sources") {
          setSources(data as Source[]);
          setStatus("Synthesizing…");
        } else if (event === "delta") {
          setAnswer((prev) => prev + (data as string));
        } else if (event === "done") {
          setStatus("");
        }
      }
    }
    setStreaming(false);
  }

  function dictate() {
    // Web Speech API — not in the standard TS DOM lib, so access it untyped.
    const w = window as unknown as Record<string, unknown>;
    const SR = (w.SpeechRecognition || w.webkitSpeechRecognition) as
      | (new () => {
          lang: string;
          start: () => void;
          onresult: (e: { results: Array<Array<{ transcript: string }>> }) => void;
        })
      | undefined;
    if (!SR) {
      setStatus("Dictation isn't supported in this browser.");
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " : "") + text);
      taRef.current?.focus();
    };
    rec.start();
  }

  return (
    <div className="w-full">
      {/* Mode toggle */}
      <div className="mt-7 inline-flex rounded-2xl border border-white/[.08] bg-black/25 p-1.5">
        {(["detailed", "fast"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[.11em] transition ${
              mode === m ? "bg-white/[.09] text-white" : "text-zinc-600 hover:text-zinc-300"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-zinc-600">Deep synthesis across the archive</p>

      {/* Composer */}
      <form
        className="mt-9 w-full"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <div className="glow-shell rounded-[1.35rem]">
          <div className="relative flex items-end rounded-[1.35rem] border border-white/10 bg-[#0c0e13] p-2 shadow-[0_25px_80px_rgba(0,0,0,.5)]">
            <textarea
              ref={taRef}
              rows={1}
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(input);
                }
              }}
              placeholder="Ask anything about the archive…"
              className="max-h-48 min-h-14 min-w-0 flex-1 resize-none bg-transparent px-4 py-4 text-base leading-6 text-zinc-100 outline-none placeholder:text-zinc-600"
            />
            <button
              type="button"
              onClick={dictate}
              aria-label="Dictate your question"
              className="size-11 self-center rounded-xl text-zinc-400 transition hover:bg-white/[.055] hover:text-white"
            >
              🎙
            </button>
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              aria-label="Ask Titan Mind"
              className="size-11 self-center rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] transition hover:-translate-y-px hover:bg-white disabled:opacity-40"
            >
              ↑
            </button>
          </div>
          <p role="status" aria-live="polite" className="px-3 pt-1 text-left text-xs text-zinc-400">
            {status}
          </p>
        </div>
      </form>

      {/* Example chips (hidden once an answer starts) */}
      {!answer && sources.length === 0 && (
        <div className="mt-6 flex w-full flex-wrap justify-center gap-2">
          {examples.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setInput(ex);
                ask(ex);
              }}
              className="max-w-full rounded-2xl border border-white/[.08] bg-white/[.04] px-4 py-2 text-[13px] leading-snug text-zinc-400 transition hover:border-white/20 hover:bg-white/[.07] hover:text-zinc-200"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {/* Answer + source cards */}
      {(answer || sources.length > 0) && (
        <div className="mt-10 w-full text-left">
          {sources.length > 0 && (
            <div className="mb-6 grid gap-2 sm:grid-cols-2">
              {sources.map((s) => (
                <div key={s.id} className="rounded-2xl border border-white/[.08] bg-white/[.03] p-4">
                  <p className="text-sm font-medium text-zinc-100">{s.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {s.memberName} · {s.sessionDate}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {s.tags.map((tag) => (
                      <span key={tag.slug} className="rounded-full border border-white/[.08] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#939eff]">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="whitespace-pre-wrap text-[15px] leading-7 text-zinc-200">{answer}</div>
        </div>
      )}
    </div>
  );
}
