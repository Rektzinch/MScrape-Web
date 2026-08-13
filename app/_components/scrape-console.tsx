"use client";

import { FormEvent, useEffect, useState } from "react";
import type { LeadRow } from "@/lib/leads";

type ApiState = {
  checked: boolean;
  configured: boolean;
  reachable: boolean;
  mode: "web" | "queue" | "photon" | null;
};

type JobState = {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  resultCount: number | null;
  rows: LeadRow[];
  downloadReady: boolean;
};

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

function rowsToCsv(rows: LeadRow[]) {
  const fields: (keyof LeadRow)[] = [
    "business",
    "address",
    "phone",
    "website",
    "email",
    "rating",
    "category",
    "coordinates",
    "source",
  ];
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  return [fields.join(","), ...rows.map((row) => fields.map((key) => escape(row[key])).join(","))].join("\n");
}

export function ScrapeConsole() {
  const [api, setApi] = useState<ApiState>(initialApiState);
  const [job, setJob] = useState<JobState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
        : `terhubung · mode ${api.mode}`;

  const active = job?.status === "pending" || job?.status === "running";
  const canSubmit = api.reachable && !submitting && !active;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setJob(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      keyword: form.get("keyword"),
      city: form.get("city"),
      country: form.get("country"),
      lang: form.get("lang"),
      limit: form.get("limit"),
      email: false,
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
    if (!job?.rows.length) return;
    const url = URL.createObjectURL(
      new Blob([rowsToCsv(job.rows)], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `mscrape-${job.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="console" id="console" aria-labelledby="console-title">
      <div className="console__head">
        <h2 id="console-title">setel wilayah. kirim job.</h2>
        <p className="api-state" data-online={api.reachable} aria-live="polite">
          <span className="api-state__dot" aria-hidden="true" />
          API {apiLabel}
        </p>
      </div>

      <div className="console__workspace">
        <form className="scrape-form" onSubmit={handleSubmit}>
          <label className="field field--wide">
            <span>Niche / kata kunci</span>
            <input name="keyword" type="text" required maxLength={100} />
            <small className="field__hint">Istilah bisnis yang ingin dicari.</small>
          </label>
          <label className="field">
            <span>Kota</span>
            <input name="city" type="text" required maxLength={100} />
            <small className="field__hint">Nama kota target.</small>
          </label>
          <label className="field">
            <span>Negara</span>
            <input name="country" type="text" required maxLength={100} />
            <small className="field__hint">Nama negara target.</small>
          </label>
          <label className="field">
            <span>Bahasa hasil</span>
            <input name="lang" type="text" defaultValue="id" minLength={2} maxLength={2} required />
            <small className="field__hint">Kode ISO dua huruf.</small>
          </label>
          <label className="field">
            <span>Jumlah hasil maksimal</span>
            <select name="limit" defaultValue="50">
              <option value="30">30</option>
              <option value="40">40</option>
              <option value="50">50</option>
            </select>
            <small className="field__hint">API mengembalikan hingga 50 tempat dalam satu request.</small>
          </label>
          <button
            className="button button--primary field--wide"
            type="submit"
            disabled={!canSubmit}
            data-state={submitting ? "loading" : error ? "error" : job?.status === "completed" ? "success" : "default"}
          >
            <span>
              {submitting
                ? "Mengirim job"
                : active
                  ? "Job sedang berjalan"
                  : !api.reachable
                    ? "API belum terhubung"
                    : job?.status === "completed"
                      ? "Jalankan pencarian baru"
                      : error
                        ? "Coba lagi"
                        : "Mulai pencarian"}
            </span>
            <span className="button__arrow" aria-hidden="true">↗</span>
          </button>
        </form>

        <div className="job-panel" aria-live="polite">
          <div className="job-panel__top">
            <span className="label">Hasil API</span>
            <span className="job-status" data-status={job?.status || "idle"}>
              {job?.status || "menunggu input"}
            </span>
          </div>

          {job ? (
            <dl className="job-facts">
              <div><dt>Job ID</dt><dd>{job.id}</dd></div>
              <div><dt>Status</dt><dd>{job.status}</dd></div>
              <div><dt>Jumlah hasil</dt><dd>{job.resultCount ?? "—"}</dd></div>
            </dl>
          ) : (
            <div className="empty-state">
              <span className="empty-state__mark" aria-hidden="true" />
              <p>Belum ada data. Isi form untuk mengirim permintaan nyata ke API.</p>
            </div>
          )}

          {error ? <p className="notice notice--error">{error}</p> : null}

          {job?.status === "completed" && job.rows.length === 0 && !job.downloadReady ? (
            <p className="notice">API menyelesaikan job tanpa data hasil.</p>
          ) : null}

          {job?.downloadReady ? (
            <a className="button button--secondary" href={`/api/jobs/${job.id}/download`}>
              Unduh CSV asli <span aria-hidden="true">↓</span>
            </a>
          ) : null}

          {job?.status === "completed" && job.rows.length > 0 ? (
            <button className="button button--secondary" type="button" onClick={downloadQueueCsv}>
              Unduh CSV hasil API <span aria-hidden="true">↓</span>
            </button>
          ) : null}
        </div>
      </div>

      {job?.rows.length ? (
        <div className="results-wrap">
          <table>
            <thead>
              <tr>
                <th>Bisnis</th>
                <th>Kategori</th>
                <th>Alamat</th>
                <th>Koordinat</th>
                <th>Telepon</th>
                <th>Website</th>
                <th>Email</th>
                <th>Rating</th>
                <th>Sumber</th>
              </tr>
            </thead>
            <tbody>
              {job.rows.map((row, index) => (
                <tr key={`${row.business}-${row.address}-${index}`}>
                  <td>{row.business || "—"}</td>
                  <td>{row.category || "—"}</td>
                  <td>{row.address || "—"}</td>
                  <td>{row.coordinates || "—"}</td>
                  <td>{row.phone || "—"}</td>
                  <td>
                    {row.website ? <a href={row.website} target="_blank" rel="noreferrer">Buka ↗</a> : "—"}
                  </td>
                  <td>{row.email || "—"}</td>
                  <td>{row.rating || "—"}</td>
                  <td>
                    {row.source ? <a href={row.source} target="_blank" rel="noreferrer">OSM ↗</a> : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
