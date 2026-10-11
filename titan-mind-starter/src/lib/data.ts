// Seed "archive" — mirrors the real source shape observed on /api/chat:
//   { id, title, memberName, sessionDate, thumbnailUrl, tags:[{name,slug}] }
// Each session has `chunks`: the transcript segments that get retrieved/embedded.
// Swap this for a Postgres + pgvector store (see src/lib/retrieval.ts) in prod.

export type Tag = { name: string; slug: string };

export type ArchiveSession = {
  id: string;
  title: string;
  memberName: string;
  sessionDate: string; // YYYY-MM-DD
  thumbnailUrl: string;
  tags: Tag[];
  chunks: string[];
};

const t = (name: string): Tag => ({ name, slug: name.toLowerCase().replace(/\s+/g, "-") });

export const SESSIONS: ArchiveSession[] = [
  {
    id: "8843d226-613e-43d4-a57c-ef752680dce0",
    title: "Turn Coaching Delivery Into a Scalable Production Line",
    memberName: "Adam Stott",
    sessionDate: "2026-09-08",
    thumbnailUrl: "/thumbnails/placeholder.svg",
    tags: [t("high ticket"), t("operations"), t("team systems"), t("offers")],
    chunks: [
      "To scale coaching past founder dependency, productize delivery: turn every 1:1 into a repeatable curriculum with milestones, templates, and async review so junior coaches can deliver the same outcome.",
      "Measure delivery like a production line — track time-to-first-win, module completion, and client outcome rate. Staff against those numbers instead of guessing when to hire.",
      "A premium offer needs a measurable transformation and a defined client journey; charge for the outcome and the system, not the hours.",
    ],
  },
  {
    id: "b14c9291-8f51-4794-9e76-7ddf8260f996",
    title: "Designing Premium Offers, Two-Step Closes, and Events That Convert",
    memberName: "Titan Mastermind Roundtable",
    sessionDate: "2023-06-01",
    thumbnailUrl: "/thumbnails/placeholder.svg",
    tags: [t("high ticket"), t("sales"), t("offers"), t("paid ads")],
    chunks: [
      "Events and summits convert because they compress trust: a room (physical or virtual) plus a clear two-step close (value session, then offer) outperforms a cold sales page.",
      "Members profit from virtual events by stacking a low-ticket ticket, an in-event upsell to the core offer, and a partnership/affiliate revenue share with speakers.",
      "The two-step close: step one earns the right with a genuinely useful teaching block; step two presents the offer as the obvious next step for the people who raised their hand.",
    ],
  },
  {
    id: "15106cc1-3d60-4a00-bb64-6a0f1b2c3d4e",
    title: "Book-a-Call Funnels: What's Working Now",
    memberName: "Sarah Mehta",
    sessionDate: "2026-07-22",
    thumbnailUrl: "/thumbnails/placeholder.svg",
    tags: [t("funnels"), t("sales"), t("paid ads"), t("measurement")],
    chunks: [
      "Book-a-call funnels that work now front-load qualification: a short VSL, then an application form that filters for budget and intent before the calendar.",
      "The biggest conversion gains came from adding proof between the ad and the call — customer stories and short result clips create demand so the call is a formality, not a pitch.",
      "Track cost-per-booked-call and show-rate separately; a cheap booking with a 40% show-rate is more expensive than a pricier booking that shows at 80%.",
    ],
  },
  {
    id: "27ab93f0-1c2d-4e5f-8a9b-0c1d2e3f4a5b",
    title: "Build a Halo Brand That Lowers Lead Costs",
    memberName: "Marcus Lee",
    sessionDate: "2026-05-14",
    thumbnailUrl: "/thumbnails/placeholder.svg",
    tags: [t("brand"), t("content"), t("paid ads"), t("measurement")],
    chunks: [
      "A 'halo brand' — consistent content and a recognizable founder presence — lowers paid lead costs because warm audiences convert cheaper and sales cycles shorten.",
      "Use customer stories and proof as demand-creation content before the sales call, not just as testimonials on a page; it pre-sells the outcome.",
      "Attribute brand's impact by watching blended CAC over time, not last-click; halo effects show up as falling cost-per-lead across every channel at once.",
    ],
  },
];

export const ALL_TAGS: Tag[] = Array.from(
  new Map(SESSIONS.flatMap((s) => s.tags).map((tag) => [tag.slug, tag])).values(),
).sort((a, b) => a.name.localeCompare(b.name));

export const EXAMPLES = [
  "How are members profiting from conferences, summits and virtual events?",
  "What's working with book a call funnels right now?",
  "What funnel changes have produced the biggest conversion and revenue gains?",
  "How are members using customer stories/content/proof to create demand before a sales call?",
];
