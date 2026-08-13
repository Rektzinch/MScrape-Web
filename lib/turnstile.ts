type TurnstileResponse = {
  success?: boolean;
};

function secret() {
  return process.env.TURNSTILE_SECRET_KEY?.trim() || "";
}

export function turnstileConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() && secret());
}

export async function verifyTurnstile(token: unknown, request: Request) {
  if (typeof token !== "string" || !token.trim()) return false;

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: secret(),
      response: token.trim(),
      remoteip: request.headers.get("cf-connecting-ip") || undefined,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) return false;

  const data = (await response.json()) as TurnstileResponse;
  return data.success === true;
}
