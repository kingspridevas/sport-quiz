import crypto from "crypto";

const AUTH_SECRET = process.env.AUTH_SECRET;
if (!AUTH_SECRET) {
  throw new Error("AUTH_SECRET environment variable is required but not set. Set it to a strong random secret before starting the server.");
}
const SECRET = AUTH_SECRET;

export interface TokenPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
  tokenVersion: number;
  iat: number;
  exp: number;
}

function base64url(input: string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function createToken(userId: string, email: string, isAdmin: boolean, tokenVersion: number): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    userId,
    email,
    isAdmin,
    tokenVersion,
    iat: now,
    exp: now + 60 * 60 * 24 * 30, // 30 days
  };
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(JSON.stringify(payload));
  const sig = sign(`${header}.${body}`);
  return `${header}.${body}.${sig}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const expectedSig = sign(`${header}.${body}`);
    if (!crypto.timingSafeEqual(Buffer.from(sig, "base64url"), Buffer.from(expectedSig, "base64url"))) {
      return null;
    }
    const payload: TokenPayload = JSON.parse(Buffer.from(body, "base64url").toString());
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  if (authHeader.startsWith("Bearer ")) return authHeader.slice(7);
  return null;
}
