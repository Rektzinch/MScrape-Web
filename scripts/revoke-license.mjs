const id = process.argv[2]?.trim().toUpperCase() || "";
const url = process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/+$/, "") || "";
const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || "";

if (!/^[A-F0-9]{12}$/.test(id)) {
  console.error("Gunakan: npm run license:revoke -- ID_LISENSI_12_HEX");
  process.exitCode = 1;
} else if (!url || !token) {
  console.error("UPSTASH_REDIS_REST_URL dan UPSTASH_REDIS_REST_TOKEN wajib tersedia.");
  process.exitCode = 1;
} else {
  const key = `mscrape:license:${id}`;
  const call = async (...parts) => {
    const response = await fetch(`${url}/${parts.map(encodeURIComponent).join("/")}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Redis REST tidak dapat dijangkau.");
    return response.json();
  };

  try {
    const [{ result: raw }, { result: ttl }] = await Promise.all([
      call("GET", key),
      call("TTL", key),
    ]);
    const record = raw ? JSON.parse(raw) : null;
    if (!record || !Number.isSafeInteger(ttl) || ttl <= 0) {
      throw new Error("Lisensi aktif tidak ditemukan.");
    }

    record.revokedAt = Date.now();
    const { result } = await call("SET", key, JSON.stringify(record), "EX", String(ttl));
    if (result !== "OK") throw new Error("Status revokasi tidak dapat disimpan.");
    console.log(`Lisensi ${id} dicabut.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Revokasi gagal.");
    process.exitCode = 1;
  }
}
