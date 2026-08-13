"use client";

import { FormEvent, useEffect, useState } from "react";
import type { LeadRow } from "@/lib/leads";

type ApiState = {
  checked: boolean;
  configured: boolean;
  reachable: boolean;
  mode: "web" | "queue" | "google-live" | null;
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
};

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
    "No",
    "Nama Bisnis",
    "Kategori",
    "Alamat",
    "Telepon",
    "Email",
    "Status Kontak",
    "Status Website",
    "Website",
    "Rating",
    "Jumlah Ulasan",
    "Latitude",
    "Longitude",
    "Google Maps",
    "Waktu Pengambilan",
  ];
  const lines = rows.map((row, index) =>
    [
      index + 1,
      row.business,
      row.category,
      row.address,
      row.phone,
      row.email,
      row.phone ? "Nomor tersedia" : row.email ? "Email tersedia" : "Kontak tidak tersedia",
      row.website ? "Memiliki website" : "Belum memiliki website",
      row.website,
      row.rating,
      row.reviewCount,
      row.latitude,
      row.longitude,
      row.source,
      fetchedAt || "",
    ]
      .map(csvCell)
      .join(","),
  );

  return `\uFEFF${[headers.map(csvCell).join(","), ...lines].join("\r\n")}`;
}

function safeFilenamePart(value: string) {
  return value
    .toLocaleLowerCase("id")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

export function ScrapeConsole() {
  const [api, setApi] = useState<ApiState>(initialApiState);
  const [job, setJob] = useState<JobState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [websiteFilter, setWebsiteFilter] = useState<WebsiteFilter>("ready");

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
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!job || job.status === "completed" || job.status === "failed") return;

    let alive = true;
    const poll = async () => {
      try {
        const response = await fetch(`/api/jobs/${encodeURIComponent(job.id)}`, {
          cache: "no-store",
        });
        const data = (await response.json()) as {
          status?: JobState["status"];
          resultCount?: number | null;
          results?: LeadRow[];
          downloadReady?: boolean;
          error?: string | null;
          message?: string;
        };

        if (!response.ok) throw new Error(data.message || "Status job gagal dibaca.");
        if (!alive || !data.status) return;

        setJob((current) =>
          current
            ? {
                ...current,
                status: data.status!,
                resultCount: data.resultCount ?? null,
                rows: Array.isArray(data.results) ? data.results : [],
                downloadReady: data.downloadReady === true,
                fetchedAt:
                  data.status === "completed" && !current.fetchedAt
                    ? new Date().toISOString()
                    : current.fetchedAt,
              }
            : current,
        );

        if (data.status === "failed") {
          setError(data.error || "Job dihentikan oleh backend.");
        }
      } catch (pollError) {
        if (alive) {
          setError(
            pollError instanceof Error
              ? pollError.message
              : "Status job gagal dibaca.",
          );
        }
      }
    };

    void poll();
    const timer = window.setInterval(poll, 4_000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [job?.id, job?.status]);

  const apiLabel = !api.checked
    ? "memeriksa koneksi"
    : !api.configured
      ? "belum dikonfigurasi"
      : !api.reachable
        ? "tidak terjangkau"
        : api.mode === "google-live"
          ? "terhubung · Google Maps live"
          : `terhubung · mode ${api.mode}`;

  const active = job?.status === "pending" || job?.status === "running";
  const canSubmit = api.reachable && !submitting && !active;
  const sourceRows = job?.rows ?? [];
  const missingWebsiteCount = sourceRows.filter((row) => !row.website).length;
  const emailCount = sourceRows.filter((row) => Boolean(row.email)).length;
  const contactableWithoutWebsiteCount = sourceRows.filter(
    (row) => !row.website && Boolean(row.phone),
  ).length;
  const visibleRows = sourceRows
    .filter((row) => {
      if (websiteFilter === "ready") return !row.website && Boolean(row.phone);
      if (websiteFilter === "missing") return !row.website;
      if (websiteFilter === "present") return Boolean(row.website);
      return true;
    })
    .sort((a, b) => {
      const emailPriority = Number(Boolean(b.email)) - Number(Boolean(a.email));
      return emailPriority || a.business.localeCompare(b.business, "id");
    });

  const feedback = error
    ? {
        title: "Scan berhenti",
        detail: error,
        state: "error",
      }
    : submitting
      ? {
          title: "Request sedang berjalan",
          detail: "Server sedang meminta hasil baru dari Google Maps. Data lama tidak dipakai.",
          state: "loading",
        }
      : active
        ? {
            title: "Job backend diproses",
            detail: "Status dibaca ulang setiap empat detik sampai backend selesai.",
            state: "loading",
          }
        : job?.status === "completed"
          ? {
              title: "Hasil siap diperiksa",
              detail: `${sourceRows.length} bisnis ditemukan → ${missingWebsiteCount} tidak punya website → ${contactableWithoutWebsiteCount} punya nomor yang bisa dihubungi.`,
              state: "success",
            }
          : !api.checked
            ? {
                title: "Memeriksa koneksi",
                detail: "Route server sedang diverifikasi sebelum form diaktifkan.",
                state: "loading",
              }
            : !api.reachable
              ? {
                  title: "API tidak tersedia",
                  detail: "Pencarian belum dapat dimulai. Muat ulang halaman atau periksa konfigurasi backend.",
                  state: "error",
                }
              : {
                  title: "Siap memindai",
                  detail: "Isi niche dan wilayah. Hasil pertama akan menggantikan panel ini.",
                  state: "idle",
                };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setJob(null);

    const form = new FormData(event.currentTarget);
    const keyword = String(form.get("keyword") || "");
    const city = String(form.get("city") || "");
    const payload = {
      keyword,
      city,
      country: form.get("country"),
      lang: form.get("lang"),
      limit: form.get("limit"),
      email: true,
    };

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        jobId?: string;
        status?: JobState["status"];
        resultCount?: number | null;
        results?: LeadRow[];
        downloadReady?: boolean;
        fetchedAt?: string;
        message?: string;
      };

      if (!response.ok || !data.jobId) {
        throw new Error(messageFrom(data, "Job tidak dapat dibuat."));
      }

      setJob({
        id: data.jobId,
        status:
          data.status === "completed"
            ? "completed"
            : data.status === "running"
              ? "running"
              : "pending",
        resultCount: data.resultCount ?? null,
        rows: Array.isArray(data.results) ? data.results : [],
        downloadReady: data.downloadReady === true,
        fetchedAt: data.fetchedAt || null,
        keyword,
        city,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Job tidak dapat dibuat.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function downloadQueueCsv() {
    if (!job || visibleRows.length === 0) return;
    const url = URL.createObjectURL(
      new Blob([rowsToCsv(visibleRows, job.fetchedAt)], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    const queryName = [safeFilenamePart(job.keyword), safeFilenamePart(job.city)]
      .filter(Boolean)
      .join("-");
    link.download = `mscrape-${queryName || job.id}-${websiteFilter}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <section className="scanner" id="scanner" aria-labelledby="scanner-title">
      <div className="scanner__intro reveal" style={{ "--i": 0 } as React.CSSProperties}>
        <h1 id="scanner-title">Bisnis tanpa website. Siap ditindaklanjuti.</h1>
        <p className="scanner__lede">
          Pindai Google Maps saat request dikirim, saring bisnis yang belum punya website,
          lalu bawa kontak yang tersedia ke CSV yang sudah tertata.
        </p>
        <ul className="scanner__facts" aria-label="Karakteristik pencarian">
          <li>Google Maps live</li>
          <li>tanpa cache</li>
          <li>tanpa data demo</li>
        </ul>
        <a className="text-link" href="#results">Lihat format hasil <span aria-hidden="true">↓</span></a>
      </div>

      <div className="scanner__console reveal" style={{ "--i": 1 } as React.CSSProperties} aria-busy={submitting || active}>
        <div className="console__bar">
          <span>Scan baru</span>
          <p className="api-state" data-online={api.reachable} aria-live="polite">
            <span className="api-state__dot" aria-hidden="true" />
            API {apiLabel}
          </p>
        </div>

        <form className="scrape-form" onSubmit={handleSubmit}>
          <label className="field field--wide">
            <span>Niche / kata kunci</span>
            <input name="keyword" type="text" required maxLength={100} autoComplete="off" />
            <small className="field__hint">Jenis bisnis yang ingin diperiksa.</small>
          </label>
          <label className="field">
            <span>Kota</span>
            <input name="city" type="text" required maxLength={100} autoComplete="address-level2" />
            <small className="field__hint">Wilayah kota target.</small>
          </label>
          <label className="field">
            <span>Negara</span>
            <input name="country" type="text" defaultValue="Indonesia" required maxLength={100} autoComplete="country-name" />
            <small className="field__hint">Dipakai untuk memperjelas kueri.</small>
          </label>
          <label className="field">
            <span>Bahasa</span>
            <input name="lang" type="text" defaultValue="id" minLength={2} maxLength={2} required />
            <small className="field__hint">Kode ISO dua huruf.</small>
          </label>
          <label className="field">
            <span>Batas hasil</span>
            <select name="limit" defaultValue="100">
              <option value="50">50</option>
              <option value="75">75</option>
              <option value="100">100</option>
            </select>
            <small className="field__hint">Maksimal 100 tempat per request.</small>
          </label>
          <button
            className="button button--primary field--wide"
            type="submit"
            disabled={!canSubmit}
            data-state={submitting ? "loading" : error ? "error" : job?.status === "completed" ? "success" : "default"}
          >
            <span>
              {submitting
                ? "Memindai Google Maps"
                : active
                  ? "Menunggu hasil"
                  : !api.reachable
                    ? "API belum terhubung"
                    : job?.status === "completed"
                      ? "Pindai wilayah baru"
                      : error
                        ? "Coba lagi"
                        : "Mulai scan"}
            </span>
            {submitting || active ? (
              <span className="button__spinner" aria-hidden="true" />
            ) : (
              <span className="button__arrow" aria-hidden="true">↗</span>
            )}
          </button>
        </form>

        <div className="feedback-panel" data-state={feedback.state} aria-live="polite">
          <span className="feedback-panel__signal" aria-hidden="true" />
          <div>
            <h2>{feedback.title}</h2>
            <p>{feedback.detail}</p>
          </div>
          {submitting || active || !api.checked ? <span className="feedback-panel__progress" aria-hidden="true" /> : null}
        </div>
      </div>

      <div className="results" id="results">
        <div className="results__head">
          <div>
            <h2>Lead hasil scan</h2>
            <p>
              {sourceRows.length
                ? `${sourceRows.length} ${job?.keyword || "bisnis"} ditemukan → ${missingWebsiteCount} tidak punya website → ${contactableWithoutWebsiteCount} punya nomor yang bisa dihubungi.`
                : "Hasil nyata akan muncul di sini setelah scan selesai."}
            </p>
          </div>
          <div className="results__actions">
            <label className="filter-control">
              <span>Filter website</span>
              <select value={websiteFilter} onChange={(event) => setWebsiteFilter(event.target.value as WebsiteFilter)}>
                <option value="ready">Tanpa website + punya nomor</option>
                <option value="missing">Semua tanpa website</option>
                <option value="all">Semua bisnis</option>
                <option value="present">Punya website</option>
              </select>
            </label>
            <button className="button button--secondary" type="button" onClick={downloadQueueCsv} disabled={visibleRows.length === 0}>
              Unduh CSV <span aria-hidden="true">↓</span>
            </button>
          </div>
        </div>

        <dl className="result-facts" aria-label="Ringkasan hasil">
          <div><dt>Diterima</dt><dd>{sourceRows.length || "—"}</dd></div>
          <div><dt>Tanpa website</dt><dd>{sourceRows.length ? missingWebsiteCount : "—"}</dd></div>
          <div>
            <dt>Punya nomor</dt>
            <dd>{sourceRows.length ? contactableWithoutWebsiteCount : "—"}</dd>
          </div>
        </dl>

        <p className="results__captured">
          {job?.fetchedAt
            ? `Diambil ${new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(job.fetchedAt))} · ${emailCount} baris memiliki email.`
            : "Waktu pengambilan dan jumlah email akan dicatat setelah scan selesai."}
        </p>

        {job?.status === "completed" && sourceRows.length === 0 ? (
          <div className="results-empty">
            <h3>Tidak ada baris yang dikembalikan.</h3>
            <p>Ubah niche atau perluas wilayah, lalu jalankan scan baru.</p>
          </div>
        ) : null}

        {sourceRows.length > 0 && visibleRows.length === 0 ? (
          <div className="results-empty">
            <h3>Tidak ada bisnis pada filter ini.</h3>
            <p>Ganti filter website untuk melihat baris lain dari request yang sama.</p>
          </div>
        ) : null}

        {visibleRows.length > 0 ? (
          <div className="results-table-wrap">
            <table className="results-table">
              <caption className="sr-only">Daftar bisnis dari respons Google Maps</caption>
            <thead>
              <tr>
                <th>No</th>
                <th>Bisnis</th>
                <th>Alamat</th>
                <th>Kontak</th>
                <th>Website</th>
                <th>Rating</th>
                <th>Koordinat</th>
                <th>Sumber</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, index) => (
                <tr key={`${row.business}-${row.address}-${index}`}>
                  <td data-label="No">{index + 1}</td>
                  <td data-label="Bisnis">
                    <strong>{row.business || "Nama tidak tersedia"}</strong>
                    <span>{row.category || "Kategori tidak tersedia"}</span>
                  </td>
                  <td data-label="Alamat">{row.address || "—"}</td>
                  <td data-label="Kontak" className="contact-cell">
                    <span>{row.phone || "Telepon tidak tersedia"}</span>
                    {row.email ? <a href={`mailto:${row.email}`}>{row.email}</a> : <span>Email tidak tersedia</span>}
                  </td>
                  <td data-label="Website">
                    {row.website ? (
                      <a href={row.website} target="_blank" rel="noreferrer">Buka website ↗</a>
                    ) : (
                      <span className="status-tag">Belum ada</span>
                    )}
                  </td>
                  <td data-label="Rating">
                    {row.rating || "—"}
                    {row.reviewCount ? <span className="cell-note">{row.reviewCount} ulasan</span> : null}
                  </td>
                  <td data-label="Koordinat" className="numeric-cell">{row.coordinates || "—"}</td>
                  <td data-label="Sumber">
                    {row.source ? <a href={row.source} target="_blank" rel="noreferrer">Google Maps ↗</a> : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        ) : null}

        {job?.downloadReady && sourceRows.length === 0 ? (
          <a className="text-link" href={`/api/jobs/${job.id}/download`}>
            Unduh file mentah dari backend <span aria-hidden="true">↓</span>
          </a>
        ) : null}
      </div>
    </section>
  );
}
