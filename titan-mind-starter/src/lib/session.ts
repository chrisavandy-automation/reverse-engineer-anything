// Signed session cookie using Web Crypto (works in both Node and Edge/middleware).
// Mirrors the real app's shared-password + HttpOnly cookie gate.

const COOKIE_NAME = "tm_session";
const encoder = new TextEncoder();

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const byte of b) s += String.fromCharCode(byte);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return b64url(sig);
}

function secret(): string {
  return process.env.SESSION_SECRET || "dev-insecure-secret-change-me";
}

export const SESSION_COOKIE = COOKIE_NAME;

/** Create a signed token: payload.signature */
export async function createSessionToken(): Promise<string> {
  const payload = b64url(encoder.encode(JSON.stringify({ iat: Date.now() })));
  const sig = await hmac(secret(), payload);
  return `${payload}.${sig}`;
}

/** Verify a token's signature (constant-ish time via length + compare). */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = await hmac(secret(), payload);
  if (expected.length !== sig.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return mismatch === 0;
}
