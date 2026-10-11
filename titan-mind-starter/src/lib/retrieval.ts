// Retrieval layer. Default: in-memory keyword scoring over the seed data, so the
// starter runs with zero external services. Production: replace `retrieve` with a
// Postgres + pgvector similarity search (schema + query sketched at the bottom).

import { SESSIONS, type ArchiveSession, type Tag } from "./data";

export type Source = {
  id: string;
  title: string;
  memberName: string;
  sessionDate: string;
  thumbnailUrl: string;
  tags: Tag[];
};

export type Retrieved = { source: Source; context: string; score: number };

function toSource(s: ArchiveSession): Source {
  const { id, title, memberName, sessionDate, thumbnailUrl, tags } = s;
  return { id, title, memberName, sessionDate, thumbnailUrl, tags };
}

const STOP = new Set(["the", "a", "an", "and", "or", "to", "of", "for", "in", "on", "is", "are", "how", "what", "with", "my", "me", "do", "i"]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

/**
 * Return the top-K sessions for a query, each with the most relevant chunk(s)
 * concatenated as `context`. `mode` controls retrieval depth, like the real app.
 */
export async function retrieve(query: string, mode: "fast" | "detailed"): Promise<Retrieved[]> {
  const topK = mode === "detailed" ? 4 : 2;
  const qTokens = tokenize(query);

  const scored = SESSIONS.map((s) => {
    const chunkScores = s.chunks.map((chunk) => {
      const cTokens = new Set(tokenize(chunk + " " + s.title + " " + s.tags.map((x) => x.name).join(" ")));
      let hits = 0;
      for (const q of qTokens) if (cTokens.has(q)) hits++;
      return hits;
    });
    const best = [...s.chunks.keys()].sort((a, b) => chunkScores[b] - chunkScores[a]);
    const score = chunkScores.reduce((a, b) => a + b, 0);
    const take = mode === "detailed" ? 2 : 1;
    const context = best.slice(0, take).map((i) => s.chunks[i]).join(" ");
    return { source: toSource(s), context, score };
  });

  const ranked = scored.filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
  // Always return something so the UI has sources even on a vague query.
  return (ranked.length ? ranked : scored.sort((a, b) => b.score - a.score)).slice(0, topK);
}

/*
--- Production: Postgres + pgvector ---

CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE sessions (
  id uuid PRIMARY KEY, title text, member_name text,
  session_date date, thumbnail_url text, status text DEFAULT 'processing'
);
CREATE TABLE tags (slug text PRIMARY KEY, name text);
CREATE TABLE session_tags (session_id uuid, tag_slug text);
CREATE TABLE chunks (
  id uuid PRIMARY KEY, session_id uuid REFERENCES sessions(id),
  content text, embedding vector(1536)
);
CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);

export async function retrieve(query, mode) {
  const topK = mode === "detailed" ? 8 : 4;
  const [{ embedding }] = await embed([query]);          // your embeddings provider
  const { rows } = await pool.query(
    `SELECT c.content, s.id, s.title, s.member_name, s.session_date, s.thumbnail_url
       FROM chunks c JOIN sessions s ON s.id = c.session_id
      WHERE s.status = 'ready'
      ORDER BY c.embedding <=> $1
      LIMIT $2`, [pgvector.toSql(embedding), topK]);
  // group rows by session -> Source + concatenated context
}
*/
