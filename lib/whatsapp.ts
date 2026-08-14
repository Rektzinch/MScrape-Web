const MAX_E164_DIGITS = 15;

/**
 * Normalizes common Indonesian phone formats into digits accepted by wa.me.
 * This is a contact-link fallback, not proof that a WhatsApp account exists.
 */
export function normalizeWhatsappPhone(value: unknown): string | null {
  if (typeof value !== "string") return null;

  let digits = value.replace(/^tel:\s*/i, "").replace(/[^\d+]/g, "");
  if (digits.startsWith("00")) digits = `+${digits.slice(2)}`;
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  if (digits.startsWith("8")) digits = `62${digits}`;

  if (!digits.startsWith("62") || !/^\d+$/.test(digits) || digits.length < 10 || digits.length > MAX_E164_DIGITS) {
    return null;
  }

  return digits;
}

export function whatsappLink(value: unknown): string | null {
  const digits = normalizeWhatsappPhone(value);
  return digits ? `https://wa.me/${digits}` : null;
}

export function whatsappStatus(value: unknown): "unverified" | "unavailable" {
  return whatsappLink(value) ? "unverified" : "unavailable";
}
