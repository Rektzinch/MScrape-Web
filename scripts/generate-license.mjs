import { createHmac, randomBytes } from "node:crypto";

const requestedTier = process.argv[2]?.trim().toUpperCase();
const tier = requestedTier === "PRO" || requestedTier === "MAX" ? requestedTier : "";
const secret = process.env.MSCRAPE_LICENSE_SECRET?.trim() || "";

if (!tier) {
  console.error("Gunakan: npm run license:generate -- pro|max");
  process.exitCode = 1;
} else if (secret.length < 32) {
  console.error("MSCRAPE_LICENSE_SECRET wajib berisi minimal 32 karakter.");
  process.exitCode = 1;
} else {
  const id = randomBytes(6).toString("hex").toUpperCase();
  const signature = createHmac("sha256", secret)
    .update(`MSC1|${tier}|${id}`)
    .digest("hex")
    .slice(0, 24)
    .toUpperCase();

  console.log(`MSC1-${tier}-${id}-${signature}`);
}
