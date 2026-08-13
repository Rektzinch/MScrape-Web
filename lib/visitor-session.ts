import { randomBytes } from "node:crypto";

export const VISITOR_COOKIE = "mscrape_visitor";

function requestCookie(request: Request, name: string) {
  const raw = request.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return "";
}

function validId(value: string) {
  return /^[a-f0-9]{32}$/.test(value);
}

function cookie(value: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${VISITOR_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure}`;
}

export function visitorSession(request: Request) {
  const existing = requestCookie(request, VISITOR_COOKIE);
  if (validId(existing)) return { id: existing, cookie: null };

  const id = randomBytes(16).toString("hex");
  return { id, cookie: cookie(id) };
}

export function existingVisitorSession(request: Request) {
  const id = requestCookie(request, VISITOR_COOKIE);
  return validId(id) ? id : null;
}
