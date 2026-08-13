"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { LeadRow } from "@/lib/leads";
import { ALL_LIMITS, planAccess, type PlanAccess, type ResultLimit } from "@/lib/plans";
import { SearchableCombobox, type ComboboxOption } from "./searchable-combobox";

type ApiState = {
  checked: boolean;
  configured: boolean;
  reachable: boolean;
  mode: "web" | "queue" | "google-live" | null;
  access: PlanAccess;
  activationAvailable: boolean;
};

type JobState = {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  resultCount: number | null;
  rows: LeadRow[];
  downloadReady: boolean;
  fetchedAt: string | null;
  keyword: string;
  city: string;
};

type WebsiteFilter = "ready" | "missing" | "all" | "present";

const initialApiState: ApiState = {
  checked: false,
  configured: false,
  reachable: false,
  mode: null,
  access: planAccess("free"),
  activationAvailable: false,
};

const websiteOptions: ComboboxOption[] = [
  { value: "ready", label: "Siap dihubungi", description: "Tanpa website + punya nomor" },
  { value: "missing", label: "Tanpa website", description: "Semua bisnis tanpa website" },
  { value: "all", label: "Semua bisnis", description: "Tanpa penyaringan website" },
  { value: "present", label: "Punya website", description: "Website sudah tersedia" },
];

function messageFrom(value: unknown, fallback: string) {
  if (value && typeof value === "object" && "message" in value) {
    const message = (value as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}

function csvCell(value: string | number) {
  const normalized = String(value).replace(/[\r\n]+/g, " ").trim();
  const formulaSafe = /^[=+\-@]/.test(normalized) ? `'${normalized}` : normalized;
  return `"${formulaSafe.replaceAll('"', '""')}"`;
}

function rowsToCsv(rows: LeadRow[], fetchedAt: string | null) {
  const headers = [
    "No", "Nama Bisnis", "Kategori", "Alamat", "Telepon", "Email", "Status Kontak",
    "Status Website", "Website", "Rating", "Jumlah Ulasan", "Latitude", "Longitude",
    "Google Maps", "Waktu Pengambilan",
  ];
  const lines = rows.map((row, index) => [
    index + 1, row.business, row.category, row.address, row.phone, row.email,
    row.phone ? "Nomor tersedia" : row.email ? "Email tersedia" : "Kontak tidak tersedia",
    row.website ? "Memiliki website" : "Belum memiliki website", row.website, row.rating,
    row.reviewCount, row.latitude, row.longitude, row.source, fetchedAt || "",
  ].map(csvCell).join(","));
  return `\uFEFF${[headers.map(csvCell).join(","), ...lines].join("\r\n")}`;
}

function safeFilenamePart(value: string) {
  return value.toLocaleLowerCase("id").normalize("NFKD").replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "").slice(0, 40);
}

function durationLabel(seconds: number) {
  if (seconds <= 0) return "tanpa cooldown";
  if (seconds >= 60) return `${Math.ceil(seconds / 60)} menit / request`;
  return `${seconds} detik / request`;
}

function countdownLabel(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

export function ScrapeConsole() {
  const [api, setApi] = useState<ApiState>(initialApiState);
  const [job, setJob] = useState<JobState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [websiteFilter, setWebsiteFilter] = useState<WebsiteFilter>("ready");
  const [limit, setLimit] = useState<ResultLimit>(10);
  const [activationOpen, setActivationOpen] = useState(false);
  const [activationCode, setActivationCode] = useState("");
  const [activationError, setActivationError] = useState("");
  const [activating, setActivating] = useState(false);
  const [pendingLimit, setPendingLimit] = useState<ResultLimit | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const activationRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/config", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as Omit<ApiState, "checked">;
        if (alive) setApi({ ...data, checked: true });
      })
      .catch(() => {
        if (alive) setApi({ ...initialApiState, checked: true });
      });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (activationOpen) activationRef.current?.focus({ preventScroll: true });
  }, [activationOpen]);

  useEffect(() => {
    if (!api.access.nextAllowedAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [api.access.nextAllowedAt]);

  useEffect(() => {
    if (!job || job.status === "completed" || job.status === "failed") return;
    let alive = true;
    const poll = async () => {
      try {
        const response = await fetch(`/api/jobs/${encodeURIComponent(job.id)}`, { cache: "no-store" });
        const data = (await response.json()) as {
          status?: JobState["status"]; resultCount?: number | null; results?: LeadRow[];
          downloadReady?: boolean; error?: string | null; message?: string;
        };
        if (!response.ok) throw new Error(data.message || "Status job gagal dibaca.");
        if (!alive || !data.status) return;
        setJob((current) => current ? {
          ...current,
          status: data.status!,
          resultCount: data.resultCount ?? null,
          rows: Array.isArray(data.results) ? data.results : [],
          downloadReady: data.downloadReady === true,
          fetchedAt: data.status === "completed" && !current.fetchedAt ? new Date().toISOString() : current.fetchedAt,
        } : current);
        if (data.status === "failed") setError(data.error || "Job dihentikan oleh backend.");
      } catch (pollError) {
        if (alive) setError(pollError instanceof Error ? pollError.message : "Status job gagal dibaca.");
      }
    };
    void poll();
    const timer = window.setInterval(poll, 4_000);
    return () => { alive = false; window.clearInterval(timer); };
  }, [job?.id, job?.status]);

  const remainingSeconds = api.access.nextAllowedAt
    ? Math.max(0, Math.ceil((new Date(api.access.nextAllowedAt).getTime() - now) / 1_000))
    : 0;
  const active = job?.status === "pending" || job?.status === "running";
  const canSubmit = api.reachable && !submitting && !active && remainingSeconds === 0;
  const sourceRows = job?.rows ?? [];
  const missingWebsiteCount = sourceRows.filter((row) => !row.website).length;
  const emailCount = sourceRows.filter((row) => Boolean(row.email)).length;
  const contactableWithoutWebsiteCount = sourceRows.filter((row) => !row.website && Boolean(row.phone)).length;
  const visibleRows = sourceRows.filter((row) => {
    if (websiteFilter === "ready") return !row.website && Boolean(row.phone);
    if (websiteFilter === "missing") return !row.website;
    if (websiteFilter === "present") return Boolean(row.website);
    return true;
  }).sort((a, b) => Number(Boolean(b.email)) - Number(Boolean(a.email)) || a.business.localeCompare(b.business, "id"));

  const limitOptions = useMemo<ComboboxOption[]>(() => ALL_LIMITS.map((value) => {
    const requiredTier = value === 10 ? "Free" : value <= 100 ? "Pro" : "Max";
    const cooldown = value === 10 ? "5 menit" : value <= 100 ? "30 detik" : "tanpa cooldown";
    return {
      value: String(value),
      label: `${value} hasil`,
      description: `${requiredTier} · ${cooldown}`,
      locked: !api.access.allowedLimits.includes(value),
    };
  }), [api.access.allowedLimits]);

  const apiLabel = !api.checked ? "memeriksa koneksi" : !api.configured ? "belum dikonfigurasi"
    : !api.reachable ? "tidak terjangkau" : api.mode === "google-live"
      ? "terhubung · Google Maps live" : `terhubung · mode ${api.mode}`;

  const feedback = error ? { title: "Scan berhenti", detail: error, state: "error" }
    : submitting ? { title: "Request sedang berjalan", detail: "Server sedang meminta hasil baru dari Google Maps. Data lama tidak dipakai.", state: "loading" }
    : active ? { title: "Job backend diproses", detail: "Status dibaca ulang setiap empat detik sampai backend selesai.", state: "loading" }
    : remainingSeconds > 0 ? { title: "Cooldown aktif", detail: `Tier ${api.access.label} dapat mengirim request berikutnya dalam ${countdownLabel(remainingSeconds)}.`, state: "locked" }
    : job?.status === "completed" ? { title: "Hasil siap diperiksa", detail: `${sourceRows.length} bisnis ditemukan → ${missingWebsiteCount} tidak punya website → ${contactableWithoutWebsiteCount} punya nomor yang bisa dihubungi.`, state: "success" }
    : !api.checked ? { title: "Memeriksa koneksi", detail: "Route server sedang diverifikasi sebelum form diaktifkan.", state: "loading" }
    : !api.reachable ? { title: "API tidak tersedia", detail: "Pencarian belum dapat dimulai. Muat ulang halaman atau periksa konfigurasi backend.", state: "error" }
    : { title: "Siap memindai", detail: `Tier ${api.access.label}: hingga ${api.access.maxLimit} hasil, ${durationLabel(api.access.cooldownSeconds)}.`, state: "idle" };

  function requestActivation(option?: ComboboxOption) {
    setPendingLimit(option ? Number(option.value) as ResultLimit : null);
    setActivationError("");
    setActivationOpen(true);
  }

  async function handleActivation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActivating(true);
    setActivationError("");
    try {
      const response = await fetch("/api/license/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: activationCode }),
      });
      const data = (await response.json()) as { access?: PlanAccess; message?: string };
      if (!response.ok || !data.access) throw new Error(data.message || "Lisensi tidak dapat diaktifkan.");
      setApi((current) => ({ ...current, access: data.access! }));
      if (pendingLimit && data.access.allowedLimits.includes(pendingLimit)) setLimit(pendingLimit);
      setActivationCode("");
      setPendingLimit(null);
      setActivationOpen(false);
    } catch (activationFailure) {
      setActivationError(activationFailure instanceof Error ? activationFailure.message : "Lisensi tidak dapat diaktifkan.");
    } finally {
      setActivating(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setJob(null);
    const form = new FormData(event.currentTarget);
    const keyword = String(form.get("keyword") || "");
    const city = String(form.get("city") || "");
    const payload = { keyword, city, country: form.get("country"), lang: form.get("lang"), limit, email: true };
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        jobId?: string; status?: JobState["status"]; resultCount?: number | null; results?: LeadRow[];
        downloadReady?: boolean; fetchedAt?: string; message?: string; access?: PlanAccess;
      };
      if (data.access) setApi((current) => ({ ...current, access: data.access! }));
      if (!response.ok || !data.jobId) throw new Error(messageFrom(data, "Job tidak dapat dibuat."));
      setJob({
        id: data.jobId,
        status: data.status === "completed" ? "completed" : data.status === "running" ? "running" : "pending",
        resultCount: data.resultCount ?? null,
        rows: Array.isArray(data.results) ? data.results : [],
        downloadReady: data.downloadReady === true,
        fetchedAt: data.fetchedAt || null,
        keyword,
        city,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Job tidak dapat dibuat.");
    } finally {
      setSubmitting(false);
    }
  }

  function downloadQueueCsv() {
    if (!job || visibleRows.length === 0) return;
    const url = URL.createObjectURL(new Blob([rowsToCsv(visibleRows, job.fetchedAt)], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    const queryName = [safeFilenamePart(job.keyword), safeFilenamePart(job.city)].filter(Boolean).join("-");
    link.download = `mscrape-${queryName || job.id}-${websiteFilter}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <section className="scanner production-console" id="scanner" aria-label="Konsol produksi">
      <div className="scanner__console" aria-busy={submitting || active}>
        <div className="console__bar">
          <div className="console__identity">
            <span>Scan baru</span>
            <button className="license-trigger" type="button" onClick={() => requestActivation()} aria-expanded={activationOpen}>
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5 4 5.3v4.2c0 3.7 2.5 6.5 6 8 3.5-1.5 6-4.3 6-8V5.3L10 2.5Z" /><path d="m7.4 10 1.7 1.7 3.5-3.7" /></svg>
              {api.access.label}
            </button>
          </div>
          <p className="api-state" data-online={api.reachable} aria-live="polite"><span className="api-state__dot" aria-hidden="true" />API {apiLabel}</p>
        </div>

        {activationOpen ? (
          <form className="activation-panel" onSubmit={handleActivation}>
            <div className="activation-panel__copy">
              <p className="activation-panel__label">Aktivasi lisensi</p>
              <h2>{pendingLimit ? `Buka batas ${pendingLimit} hasil` : "Masukkan kode dari admin"}</h2>
              <p>Beli lisensi Pro atau Max dari admin, lalu tempel kode aktivasi di bawah. Tidak perlu membuat akun.</p>
            </div>
            <label className="activation-panel__field">
              <span>Kode aktivasi</span>
              <input ref={activationRef} value={activationCode} onChange={(event) => setActivationCode(event.target.value.toUpperCase())} type="text" name="activation-code" placeholder="MSC1-PRO-…" autoComplete="off" spellCheck={false} aria-invalid={Boolean(activationError)} aria-describedby="activation-help" required />
              <small id="activation-help">{activationError || (api.activationAvailable ? "Kode diverifikasi aman di server." : "Aktivasi belum dikonfigurasi oleh admin.")}</small>
            </label>
            <div className="activation-panel__actions">
              <button className="button button--activation" type="submit" disabled={activating || !api.activationAvailable}>{activating ? "Memverifikasi" : "Aktifkan"}{activating ? <span className="button__spinner" aria-hidden="true" /> : <span aria-hidden="true">→</span>}</button>
              <button className="activation-panel__close" type="button" onClick={() => setActivationOpen(false)}>Tutup</button>
            </div>
          </form>
        ) : null}

        <form className="scrape-form" onSubmit={handleSubmit}>
          <label className="field field--wide"><span>Niche / kata kunci</span><input name="keyword" type="text" required maxLength={100} autoComplete="off" /><small className="field__hint">Jenis bisnis yang ingin diperiksa.</small></label>
          <label className="field"><span>Kota</span><input name="city" type="text" required maxLength={100} autoComplete="address-level2" /><small className="field__hint">Wilayah kota target.</small></label>
          <label className="field"><span>Negara</span><input name="country" type="text" defaultValue="Indonesia" required maxLength={100} autoComplete="country-name" /><small className="field__hint">Dipakai untuk memperjelas kueri.</small></label>
          <label className="field"><span>Bahasa</span><input name="lang" type="text" defaultValue="id" minLength={2} maxLength={2} required /><small className="field__hint">Kode ISO dua huruf.</small></label>
          <div className="field">
            <SearchableCombobox label="Batas hasil" name="limit" value={String(limit)} options={limitOptions} onChange={(value) => setLimit(Number(value) as ResultLimit)} onLockedOption={requestActivation} helper={`Tier ${api.access.label} membuka hingga ${api.access.maxLimit} hasil.`} searchPlaceholder="Cari batas hasil" />
          </div>
          <button className="button button--primary field--wide" type="submit" disabled={!canSubmit} data-state={submitting ? "loading" : error ? "error" : job?.status === "completed" ? "success" : "default"}>
            <span>{submitting ? "Memindai Google Maps" : active ? "Menunggu hasil" : remainingSeconds > 0 ? `Tunggu ${countdownLabel(remainingSeconds)}` : !api.reachable ? "API belum terhubung" : job?.status === "completed" ? "Pindai wilayah baru" : error ? "Coba lagi" : "Mulai scan"}</span>
            {submitting || active ? <span className="button__spinner" aria-hidden="true" /> : <span className="button__arrow" aria-hidden="true">↗</span>}
          </button>
        </form>

        <div className="feedback-panel" data-state={feedback.state} aria-live="polite"><span className="feedback-panel__signal" aria-hidden="true" /><div><h2>{feedback.title}</h2><p>{feedback.detail}</p></div>{submitting || active || !api.checked ? <span className="feedback-panel__progress" aria-hidden="true" /> : null}</div>
      </div>

      <div className="results" id="results">
        <div className="results__head">
          <div><h2>Lead hasil scan</h2><p>{sourceRows.length ? `${sourceRows.length} ${job?.keyword || "bisnis"} ditemukan → ${missingWebsiteCount} tidak punya website → ${contactableWithoutWebsiteCount} punya nomor yang bisa dihubungi.` : "Hasil nyata akan muncul di sini setelah scan selesai."}</p></div>
          <div className="results__actions"><SearchableCombobox label="Filter website" value={websiteFilter} options={websiteOptions} onChange={(value) => setWebsiteFilter(value as WebsiteFilter)} searchPlaceholder="Cari filter" /><button className="button button--secondary" type="button" onClick={downloadQueueCsv} disabled={visibleRows.length === 0}>Unduh CSV <span aria-hidden="true">↓</span></button></div>
        </div>

        <dl className="result-facts" aria-label="Ringkasan hasil"><div><dt>Diterima</dt><dd>{sourceRows.length || "—"}</dd></div><div><dt>Tanpa website</dt><dd>{sourceRows.length ? missingWebsiteCount : "—"}</dd></div><div><dt>Punya nomor</dt><dd>{sourceRows.length ? contactableWithoutWebsiteCount : "—"}</dd></div></dl>
        <p className="results__captured">{job?.fetchedAt ? `Diambil ${new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(job.fetchedAt))} · ${emailCount} baris memiliki email.` : "Waktu pengambilan dan jumlah email akan dicatat setelah scan selesai."}</p>
        {job?.status === "completed" && sourceRows.length === 0 ? <div className="results-empty"><h3>Tidak ada baris yang dikembalikan.</h3><p>Ubah niche atau perluas wilayah, lalu jalankan scan baru.</p></div> : null}
        {sourceRows.length > 0 && visibleRows.length === 0 ? <div className="results-empty"><h3>Tidak ada bisnis pada filter ini.</h3><p>Ganti filter website untuk melihat baris lain dari request yang sama.</p></div> : null}

        {visibleRows.length > 0 ? (
          <div className="results-table-wrap"><table className="results-table"><caption className="sr-only">Daftar bisnis dari respons Google Maps</caption><thead><tr><th>No</th><th>Bisnis</th><th>Alamat</th><th>Kontak</th><th>Website</th><th>Rating</th><th>Koordinat</th><th>Sumber</th></tr></thead><tbody>{visibleRows.map((row, index) => (
            <tr key={`${row.business}-${row.address}-${index}`}><td data-label="No">{index + 1}</td><td data-label="Bisnis"><strong>{row.business || "Nama tidak tersedia"}</strong><span>{row.category || "Kategori tidak tersedia"}</span></td><td data-label="Alamat">{row.address || "—"}</td><td data-label="Kontak" className="contact-cell"><span>{row.phone || "Telepon tidak tersedia"}</span>{row.email ? <a href={`mailto:${row.email}`}>{row.email}</a> : <span>Email tidak tersedia</span>}</td><td data-label="Website">{row.website ? <a href={row.website} target="_blank" rel="noreferrer">Buka website ↗</a> : <span className="status-tag">Belum ada</span>}</td><td data-label="Rating">{row.rating || "—"}{row.reviewCount ? <span className="cell-note">{row.reviewCount} ulasan</span> : null}</td><td data-label="Koordinat" className="numeric-cell">{row.coordinates || "—"}</td><td data-label="Sumber">{row.source ? <a href={row.source} target="_blank" rel="noreferrer">Google Maps ↗</a> : "—"}</td></tr>
          ))}</tbody></table></div>
        ) : null}
        {job?.downloadReady && sourceRows.length === 0 ? <a className="text-link" href={`/api/jobs/${job.id}/download`}>Unduh file mentah dari backend <span aria-hidden="true">↓</span></a> : null}
      </div>
    </section>
  );
}
