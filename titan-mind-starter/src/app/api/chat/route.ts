import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { retrieve, type Source } from "@/lib/retrieval";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };

// Reproduces the real Titan Mind stream protocol exactly:
//   event: sources\n data: <JSON array of Source>\n\n
//   event: delta\n   data: <JSON-encoded string token>\n\n   (many)
//   event: done\n    data: true\n\n
export async function POST(req: NextRequest) {
  const { messages, mode } = (await req.json()) as {
    messages: ChatMessage[];
    mode?: "fast" | "detailed";
  };

  const resolvedMode: "fast" | "detailed" = mode === "fast" ? "fast" : "detailed";
  const lastUser = [...(messages ?? [])].reverse().find((m) => m.role === "user");
  const question = lastUser?.content?.trim() ?? "";

  const retrieved = await retrieve(question, resolvedMode);
  const sources: Source[] = retrieved.map((r) => r.source);

  const encoder = new TextEncoder();
  const sse = (event: string, data: unknown) =>
    encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  const stream = new ReadableStream({
    async start(controller) {
      // 1) Sources first, so the UI can render citation cards immediately.
      controller.enqueue(sse("sources", sources));

      try {
        if (process.env.ANTHROPIC_API_KEY) {
          await streamFromClaude(controller, sse, question, retrieved, resolvedMode);
        } else {
          await streamDemo(controller, sse, sources);
        }
      } catch (err) {
        controller.enqueue(sse("delta", `\n\n_(stream error: ${(err as Error).message})_`));
      }

      // 3) Done.
      controller.enqueue(sse("done", true));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}

async function streamFromClaude(
  controller: ReadableStreamDefaultController,
  sse: (event: string, data: unknown) => Uint8Array,
  question: string,
  retrieved: Awaited<ReturnType<typeof retrieve>>,
  mode: "fast" | "detailed",
) {
  const client = new Anthropic();

  const context = retrieved
    .map(
      (r, i) =>
        `[Source ${i + 1}] "${r.source.title}" — ${r.source.memberName}, ${r.source.sessionDate}\n${r.context}`,
    )
    .join("\n\n");

  const system = [
    "You are Titan Mind, the collective intelligence of a private marketing/coaching mastermind.",
    "Answer ONLY from the provided sources — the archive of member calls and roundtables.",
    "Synthesize across sources into field-tested, specific guidance. Cite source titles in **bold** when you lean on one.",
    "If the sources don't cover the question, say so plainly rather than inventing.",
    mode === "fast"
      ? "Be concise: a tight, direct answer."
      : "Be thorough: structure the answer, draw connections across sources, and end with the most relevant plays to study next.",
  ].join(" ");

  const stream = client.messages.stream({
    model: "claude-opus-5-5",
    max_tokens: mode === "detailed" ? 8000 : 2000,
    thinking: { type: "adaptive" },
    output_config: { effort: mode === "detailed" ? "high" : "low" },
    system,
    messages: [
      {
        role: "user",
        content: `Archive excerpts:\n\n${context}\n\n---\nMember question: ${question}`,
      },
    ],
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      controller.enqueue(sse("delta", event.delta.text));
    }
  }
}

// Offline fallback so `npm run dev` works with no API key.
async function streamDemo(
  controller: ReadableStreamDefaultController,
  sse: (event: string, data: unknown) => Uint8Array,
  sources: Source[],
) {
  const titles = sources.map((s) => `**“${s.title}”**`).join(", ");
  const text =
    `Here's the synthesis across the archive. ` +
    `The most relevant sessions are ${titles}. ` +
    `Set ANTHROPIC_API_KEY in .env.local to replace this canned response with a real ` +
    `retrieval-augmented answer streamed from Claude.`;
  for (const word of text.split(" ")) {
    controller.enqueue(sse("delta", word + " "));
    await new Promise((r) => setTimeout(r, 25));
  }
}
