"use client";

import { type FormEvent, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { LeadRow } from "@/lib/leads";
import {
  recordsToCsv as serializeRecordsToCsv,
  recordsToJson as serializeRecordsToJson,
  recordsToSheetsCsv as serializeRecordsToSheetsCsv,
  recordsToText as serializeRecordsToText,
  toExportRecord as makeExportRecord,
} from "@/lib/lead-export";
import { ALL_RESULTS_LIMIT, planAccess, type PlanAccess, type ResultLimit } from "@/lib/plans";
import { SearchableCombobox, type ComboboxOption } from "./searchable-combobox";
import { ScanResultRow } from "./scan-result-row";
import { Turnstile } from "./turnstile";

type ApiState = {
  checked: boolean;
  configured: boolean;
  reachable: boolean;
  mode: "web" | "queue" | "google-live" | null;
  access: PlanAccess;
  activationAvailable: boolean;
  turnstileSiteKey: string | null;
};

type SearchCompletion = {
  isComplete: boolean;
  stoppedReason: "limit-reached" | "source-exhausted" | "time-budget";
};

type JobState = {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  resultCount: number | null;
  rows: LeadRow[];
  completion: SearchCompletion | null;
  downloadReady: boolean;
  fetchedAt: string | null;
  keyword: string;
  city: string;
};

type WebsiteFilter = "ready" | "missing" | "all" | "present";
type DownloadFormat = "csv" | "txt" | "json" | "sheets";
type NoticeTone = "info" | "success" | "error";

type ActionNotice = {
  id: number;
  title: string;
  detail: string;
  tone: NoticeTone;
};

const ADMIN_WHATSAPP = "https://wa.me/6285111349699";
const RESULT_PAGE_SIZE = 50;
const EMPTY_ROWS: LeadRow[] = [];

const initialApiState: ApiState = {
  checked: false,
  configured: false,
  reachable: false,
  mode: null,
  access: planAccess("free"),
  activationAvailable: false,
  turnstileSiteKey: null,
};

const websiteOptions: ComboboxOption[] = [
  { value: "all", label: "Semua bisnis", description: "Tampilkan seluruh hasil yang diterima" },
  { value: "ready", label: "Siap dihubungi", description: "Tanpa website + punya nomor" },
  { value: "missing", label: "Tanpa website", description: "Semua bisnis tanpa website" },
  { value: "present", label: "Punya website", description: "Website sudah tersedia" },
];

const downloadOptions: ComboboxOption[] = [
  { value: "csv", label: "CSV", description: "Data bisnis lengkap untuk spreadsheet" },
  { value: "txt", label: "TXT", description: "Ringkasan teks berurutan per bisnis" },
  { value: "json", label: "JSON", description: "Metadata pencarian dan data bisnis terstruktur" },
  { value: "sheets", label: "Google Sheets", description: "CSV siap impor dengan kolom tindak lanjut" },
];

function DownloadIcon() {
  return (
    <svg className="button__icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M4 14.5v2h12v-2" />
    </svg>
  );
}

function messageFrom(value: unknown, fallback: string) {
  if (value && typeof value === "object" && "message" in value) {
    const message = (value as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}

function triggerDownload(content: BlobPart, type: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function safeFilenamePart(value: string) {
  return value.toLocaleLowerCase("id").normalize("NFKD").replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "").slice(0, 40);
}

function durationLabel(seconds: number) {
  if (seconds <= 0) return "tanpa cooldown";
  if (seconds >= 3_600) return `${Math.ceil(seconds / 3_600)} jam / scan`;
  if (seconds >= 60) return `${Math.ceil(seconds / 60)} menit / scan`;
  return `${seconds} detik / scan`;
}

function countdownLabel(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function resultLimitLabel(limit: ResultLimit) {
  return limit === ALL_RESULTS_LIMIT ? "Semua hasil" : `${limit} hasil`;
}

function accessLimitLabel(limit: ResultLimit) {
  return limit === ALL_RESULTS_LIMIT ? "semua hasil yang tersedia" : `hingga ${limit} hasil`;
}

function scanCountLabel(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function completionLabel(completion: SearchCompletion | null) {
  if (!completion) return "Kelengkapan hasil akan dilaporkan setelah scan selesai.";
  if (completion.stoppedReason === "source-exhausted") return "Sumber tidak mengembalikan halaman tambahan; hasil saat ini lengkap menurut sumber.";
  if (completion.stoppedReason === "limit-reached") return "Batas hasil scan telah tercapai; sumber mungkin masih memiliki bisnis tambahan.";
  return "Batas waktu scan tercapai; hasil mungkin parsial. Persempit niche atau wilayah untuk hasil yang lebih lengkap.";
}

function licenseDateLabel(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ScrapeConsole() {
  const [api, setApi] = useState<ApiState>(initialApiState);
  const [job, setJob] = useState<JobState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [websiteFilter, setWebsiteFilter] = useState<WebsiteFilter>("all");
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("csv");
  const [downloading, setDownloading] = useState(false);
  const [limit, setLimit] = useState<ResultLimit>(10);
  const [activationOpen, setActivationOpen] = useState(false);
  const [activationCode, setActivationCode] = useState("");
  const [activationError, setActivationError] = useState("");
  const [activating, setActivating] = useState(false);
  const [licenseChecking, setLicenseChecking] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [toast, setToast] = useState<ActionNotice | null>(null);
  const [resultQuery, setResultQuery] = useState("");
  const [resultPage, setResultPage] = useState(1);
  const [manualLimit, setManualLimit] = useState("");
  const [areaLevel, setAreaLevel] = useState<"city" | "subdistrict">("city");
  const [city, setCity] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [locationState, setLocationState] = useState<"idle" | "requesting" | "ready" | "error">("idle");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileNonce, setTurnstileNonce] = useState(0);
  const activationRef = useRef<HTMLInputElement>(null);
  const noticeId = useRef(0);
  const toastTimer = useRef<number | null>(null);
  const notifiedJobs = useRef(new Set<string>());

  const notify = useCallback((title: string, detail: string, tone: NoticeTone = "info") => {
    noticeId.current += 1;
    const next: ActionNotice = {
      id: noticeId.current,
      title,
      detail,
      tone,
    };
    setToast(next);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3_200);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

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
    setManualLimit("");
    setLimit(api.access.tier === "free" ? 10 : api.access.maxLimit);
    if (!api.access.allowsSubdistrict) setAreaLevel("city");
  }, [api.access.allowsSubdistrict, api.access.maxLimit, api.access.tier]);

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
          completion?: SearchCompletion; downloadReady?: boolean; error?: string | null; message?: string;
        };
        if (!response.ok) throw new Error(data.message || "Status hasil gagal dibaca.");
        if (!alive || !data.status) return;
        setJob((current) => current ? {
          ...current,
          status: data.status!,
          resultCount: data.resultCount ?? null,
          rows: Array.isArray(data.results) ? data.results : [],
          completion: data.completion ?? current.completion,
          downloadReady: data.downloadReady === true,
          fetchedAt: data.status === "completed" && !current.fetchedAt ? new Date().toISOString() : current.fetchedAt,
        } : current);
        if (data.status === "completed" && !notifiedJobs.current.has(job.id)) {
          notifiedJobs.current.add(job.id);
          const received = Array.isArray(data.results) ? data.results.length : data.resultCount ?? 0;
          notify("Scan selesai", `${received} data bisnis diterima dan siap difilter.`, "success");
        }
        if (data.status === "failed") {
          const failure = data.error || "Scan dihentikan oleh layanan.";
          setError(failure);
          if (!notifiedJobs.current.has(`${job.id}:failed`)) {
            notifiedJobs.current.add(`${job.id}:failed`);
            notify("Scan berhenti", failure, "error");
          }
        }
      } catch (pollError) {
        if (alive) {
          const failure = pollError instanceof Error ? pollError.message : "Status hasil gagal dibaca.";
          setError(failure);
          if (!notifiedJobs.current.has(`${job.id}:poll`)) {
            notifiedJobs.current.add(`${job.id}:poll`);
            notify("Status hasil belum terbaca", `${failure} Sistem akan mencoba lagi.`, "error");
          }
        }
      }
    };
    void poll();
    const timer = window.setInterval(poll, 4_000);
    return () => { alive = false; window.clearInterval(timer); };
  }, [job?.id, job?.status, notify]);

  const remainingSeconds = api.access.nextAllowedAt
    ? Math.max(0, Math.ceil((new Date(api.access.nextAllowedAt).getTime() - now) / 1_000))
    : 0;
  const hasCredit = api.access.creditRemaining > 0;
  const active = job?.status === "pending" || job?.status === "running";
  const sourceRows = job?.rows ?? EMPTY_ROWS;
  const deferredResultQuery = useDeferredValue(resultQuery.trim().toLocaleLowerCase("id"));
  const rowStats = useMemo(() => sourceRows.reduce((stats, row) => ({
    missingWebsite: stats.missingWebsite + Number(!row.website),
    email: stats.email + Number(Boolean(row.email)),
    contactableWithoutWebsite: stats.contactableWithoutWebsite + Number(!row.website && Boolean(row.phone)),
  }), { missingWebsite: 0, email: 0, contactableWithoutWebsite: 0 }), [sourceRows]);
  const missingWebsiteCount = rowStats.missingWebsite;
  const emailCount = rowStats.email;
  const contactableWithoutWebsiteCount = rowStats.contactableWithoutWebsite;
  const visibleRows = useMemo(() => sourceRows.filter((row) => {
    const matchesWebsite = websiteFilter === "ready" ? !row.website && Boolean(row.phone)
      : websiteFilter === "missing" ? !row.website
        : websiteFilter === "present" ? Boolean(row.website)
          : true;
    if (!matchesWebsite) return false;
    if (!deferredResultQuery) return true;
    return [row.business, row.category, row.address, row.phone, row.email, row.website]
      .some((value) => value.toLocaleLowerCase("id").includes(deferredResultQuery));
  }).toSorted((a, b) => Number(Boolean(b.email)) - Number(Boolean(a.email)) || a.business.localeCompare(b.business, "id")), [deferredResultQuery, sourceRows, websiteFilter]);
  const totalResultPages = Math.max(1, Math.ceil(visibleRows.length / RESULT_PAGE_SIZE));
  const currentResultPage = Math.min(resultPage, totalResultPages);
  const pageStart = (currentResultPage - 1) * RESULT_PAGE_SIZE;
  const pagedRows = visibleRows.slice(pageStart, pageStart + RESULT_PAGE_SIZE);
  const hasManualLimit = manualLimit.trim().length > 0;
  const manualLimitNumber = hasManualLimit ? Number(manualLimit) : null;
  const manualLimitMax = typeof api.access.maxLimit === "number" ? api.access.maxLimit : Number.MAX_SAFE_INTEGER;
  const manualLimitError = api.access.tier === "free" ? ""
    : !hasManualLimit
      ? `Masukkan jumlah data untuk scan tier ${api.access.label}.`
      : !Number.isSafeInteger(manualLimitNumber) || Number(manualLimitNumber) <= 0
      ? "Masukkan bilangan bulat lebih dari 0."
      : Number(manualLimitNumber) > manualLimitMax
        ? `Tier ${api.access.label} menerima maksimal ${manualLimitMax} hasil per scan.`
        : "";
  const requestedLimit: ResultLimit = api.access.tier === "free" ? 10
    : !manualLimitError ? Number(manualLimitNumber)
      : api.access.maxLimit;
  const challengeRequired = api.access.tier === "free" && Boolean(api.turnstileSiteKey);
  const canSubmit = api.reachable && hasCredit && !submitting && !active && remainingSeconds === 0 && !manualLimitError && (!challengeRequired || Boolean(turnstileToken));

  const areaOptions = useMemo<ComboboxOption[]>(() => [
    { value: "city", label: "Kota / kabupaten", description: "Cakupan standar semua tier" },
    {
      value: "subdistrict",
      label: "Kecamatan",
      description: "Mempersempit pencarian ke satu kecamatan",
      locked: !api.access.allowsSubdistrict,
    },
  ], [api.access.allowsSubdistrict]);

  const limitOptions = useMemo<ComboboxOption[]>(() => {
    if (api.access.tier !== "free") return [];
    return api.access.allowedLimits
      .filter((value): value is number => typeof value === "number")
      .map((value) => ({
        value: String(value),
        label: resultLimitLabel(value),
        description: "Free · jeda 1 jam",
      }));
  }, [api.access.allowedLimits, api.access.tier]);

  const apiLabel = !api.checked ? "Menghubungkan layanan…"
    : !api.reachable ? "Layanan belum tersedia"
      : "Siap melakukan scan";

  const feedback = error ? { title: "Scan berhenti", detail: error, state: "error" }
    : submitting ? { title: "Scan sedang dimulai", detail: "Layanan sedang menyiapkan pencarian baru dari Google Maps.", state: "loading" }
    : active ? { title: "Data sedang dicari", detail: "Hasil akan muncul otomatis setelah pencarian selesai.", state: "loading" }
    : !hasCredit ? { title: "Jatah scan habis", detail: `Paket ${api.access.label} telah memakai seluruh ${scanCountLabel(api.access.creditTotal)} scan. Aktifkan atau perbarui lisensi untuk melanjutkan.`, state: "locked" }
    : remainingSeconds > 0 ? { title: "Jeda scan aktif", detail: `Scan berikutnya dapat dijalankan dalam ${countdownLabel(remainingSeconds)}.`, state: "locked" }
    : job?.status === "completed" ? { title: "Hasil siap diperiksa", detail: `${sourceRows.length} bisnis ditemukan → ${missingWebsiteCount} tidak punya website → ${contactableWithoutWebsiteCount} punya nomor yang bisa dihubungi.`, state: "success" }
    : !api.checked ? { title: "Menghubungkan layanan", detail: "Form akan aktif setelah layanan siap menerima scan.", state: "loading" }
    : !api.reachable ? { title: "Layanan belum tersedia", detail: "Pencarian belum dapat dimulai. Muat ulang halaman dan coba lagi.", state: "error" }
    : { title: "Siap melakukan scan", detail: `${scanCountLabel(api.access.creditRemaining)} dari ${scanCountLabel(api.access.creditTotal)} scan tersisa · ${durationLabel(api.access.cooldownSeconds)}.`, state: "idle" };

  function toggleActivation() {
    setActivationError("");
    setActivationOpen((open) => !open);
  }

  function closeActivation() {
    setActivationOpen(false);
  }

  function changeLimit(value: string) {
    const nextLimit = Number(value) as ResultLimit;
    setLimit(nextLimit);
    notify("Jumlah hasil diperbarui", `Scan berikutnya akan meminta ${resultLimitLabel(nextLimit).toLocaleLowerCase("id")}.`);
  }

  function changeAreaLevel(value: string) {
    const nextAreaLevel = value as "city" | "subdistrict";
    setAreaLevel(nextAreaLevel);
    notify(
      "Cakupan pencarian diperbarui",
      nextAreaLevel === "subdistrict"
        ? "Masukkan kecamatan dan kota/kabupaten untuk mempersempit pencarian."
        : "Scan berikutnya menggunakan cakupan kota atau kabupaten.",
    );
  }

  function useCurrentLocation() {
    if (!("geolocation" in navigator)) {
      setLocationState("error");
      notify("Lokasi tidak tersedia", "Perangkat ini tidak menyediakan akses lokasi. Masukkan kota secara manual.", "error");
      return;
    }
    setLocationState("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`;
        setCity(coordinates);
        setLocationState("ready");
        notify("Lokasi digunakan", "Koordinat perangkat dimasukkan sebagai area pencarian.", "success");
      },
      () => {
        setLocationState("error");
        notify("Lokasi tidak dapat dibaca", "Izinkan akses lokasi atau masukkan kota secara manual.", "error");
      },
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 10_000 },
    );
  }

  function handleLockedArea(option: ComboboxOption) {
    notify(`${option.label} terkunci`, "Aktifkan lisensi Pro atau Max untuk pencarian hingga kecamatan.", "info");
  }

  async function checkLicense() {
    setLicenseChecking(true);
    setActivationError("");
    try {
      const response = await fetch("/api/config", { cache: "no-store" });
      const data = (await response.json()) as Omit<ApiState, "checked"> & { message?: string };
      if (!response.ok || !data.access) throw new Error(data.message || "Status lisensi tidak dapat dibaca.");
      setApi({ ...data, checked: true });
      notify(
        `Paket ${data.access.label} terverifikasi`,
        data.access.activatedAt
          ? `Aktif sejak ${licenseDateLabel(data.access.activatedAt)} sampai ${licenseDateLabel(data.access.expiresAt)}. Sisa ${scanCountLabel(data.access.creditRemaining)}/${scanCountLabel(data.access.creditTotal)} scan.`
          : `Belum ada kode Pro atau Max yang aktif pada browser ini. Sisa Free ${scanCountLabel(data.access.creditRemaining)}/${scanCountLabel(data.access.creditTotal)} scan.`,
        data.access.tier === "free" ? "info" : "success",
      );
    } catch (licenseFailure) {
      const failure = licenseFailure instanceof Error ? licenseFailure.message : "Status lisensi tidak dapat dibaca.";
      setActivationError(failure);
      notify("Pemeriksaan lisensi gagal", `${failure} Coba lagi setelah koneksi tersedia.`, "error");
    } finally {
      setLicenseChecking(false);
    }
  }

  function changeWebsiteFilter(value: string) {
    const nextFilter = value as WebsiteFilter;
    setWebsiteFilter(nextFilter);
    setResultPage(1);
    const selected = websiteOptions.find((option) => option.value === nextFilter);
    notify("Filter hasil diperbarui", selected?.description || "Tabel hasil sudah disaring ulang.");
  }

  async function handleActivation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActivating(true);
    setActivationError("");
    notify("Kode sedang diverifikasi", "Server memeriksa tier dan tanda tangan kode aktivasi.");
    try {
      const response = await fetch("/api/license/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: activationCode }),
      });
      const data = (await response.json()) as { access?: PlanAccess; message?: string };
      if (!response.ok || !data.access) throw new Error(data.message || "Lisensi tidak dapat diaktifkan.");
      setApi((current) => ({ ...current, access: data.access! }));
      setActivationCode("");
      notify(
        `Paket ${data.access.label} aktif`,
        `Aktif ${licenseDateLabel(data.access.activatedAt)} sampai ${licenseDateLabel(data.access.expiresAt)} dengan ${scanCountLabel(data.access.creditRemaining)} scan tersedia.`,
        "success",
      );
    } catch (activationFailure) {
      const failure = activationFailure instanceof Error ? activationFailure.message : "Lisensi tidak dapat diaktifkan.";
      setActivationError(failure);
      notify("Aktivasi gagal", failure, "error");
    } finally {
      setActivating(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (manualLimitError) {
      notify("Jumlah hasil belum valid", manualLimitError, "error");
      return;
    }
    setSubmitting(true);
    setError("");
    setJob(null);
    setResultPage(1);
    const form = new FormData(event.currentTarget);
    const keyword = String(form.get("keyword") || "");
    const city = String(form.get("city") || "");
    const subdistrict = areaLevel === "subdistrict" ? String(form.get("subdistrict") || "") : "";
    const areaLabel = [subdistrict, city].filter(Boolean).join(", ");
    const payload = { keyword, city, subdistrict, country: form.get("country"), lang: form.get("lang"), limit: requestedLimit, email: true, turnstileToken };
    notify("Scan dimulai", `${keyword} di ${areaLabel} sedang dipindai dengan batas ${resultLimitLabel(requestedLimit).toLocaleLowerCase("id")}. Satu scan akan digunakan.`);
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        jobId?: string; status?: JobState["status"]; resultCount?: number | null; results?: LeadRow[];
        completion?: SearchCompletion; downloadReady?: boolean; fetchedAt?: string; message?: string; access?: PlanAccess;
      };
      if (data.access) setApi((current) => ({ ...current, access: data.access! }));
      if (!response.ok || !data.jobId) throw new Error(messageFrom(data, "Scan tidak dapat dimulai."));
      const nextJob = {
        id: data.jobId,
        status: data.status === "completed" ? "completed" : data.status === "running" ? "running" : "pending",
        resultCount: data.resultCount ?? null,
        rows: Array.isArray(data.results) ? data.results : [],
        completion: data.completion ?? null,
        downloadReady: data.downloadReady === true,
        fetchedAt: data.fetchedAt || null,
        keyword,
        city: areaLabel,
      } satisfies JobState;
      setJob(nextJob);
      if (nextJob.status === "completed") {
        notifiedJobs.current.add(nextJob.id);
        notify("Scan selesai", `${nextJob.rows.length} data bisnis diterima dan siap difilter.`, "success");
      } else {
        notify("Scan diterima", "Pencarian sedang diproses. Hasil akan diperbarui otomatis.");
      }
    } catch (submitError) {
      const failure = submitError instanceof Error ? submitError.message : "Scan tidak dapat dimulai.";
      setError(failure);
      notify("Scan gagal dimulai", failure, "error");
    } finally {
      setSubmitting(false);
      if (challengeRequired) {
        setTurnstileToken("");
        setTurnstileNonce((nonce) => nonce + 1);
      }
    }
  }

  async function downloadResults() {
    if (!job || visibleRows.length === 0) return;

    const records = visibleRows.map((row) => makeExportRecord(row, job.city));
    const queryName = [safeFilenamePart(job.keyword), safeFilenamePart(job.city)].filter(Boolean).join("-");
    const filename = `mscrape-${queryName || job.id}-${websiteFilter}`;
    const format = downloadOptions.find((option) => option.value === downloadFormat)?.label || "File";

    setDownloading(true);
    try {
      if (downloadFormat === "csv") {
        triggerDownload(serializeRecordsToCsv(records), "text/csv;charset=utf-8", `${filename}.csv`);
      } else if (downloadFormat === "txt") {
        triggerDownload(serializeRecordsToText(records), "text/plain;charset=utf-8", `${filename}.txt`);
      } else if (downloadFormat === "json") {
        triggerDownload(serializeRecordsToJson(records, job, websiteFilter), "application/json;charset=utf-8", `${filename}.json`);
      } else {
        triggerDownload(
          serializeRecordsToSheetsCsv(records),
          "text/csv;charset=utf-8",
          `${filename}-google-sheets.csv`,
        );
      }
      notify(`${format} diunduh`, `${records.length} baris dari filter aktif dimasukkan ke file.`, "success");
    } catch (downloadError) {
      const detail = downloadError instanceof Error ? downloadError.message : "File tidak dapat dibuat.";
      notify("Unduhan gagal", detail, "error");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section className="scanner production-console" id="scanner" aria-label="Konsol produksi">
      <section className="license-dock" aria-labelledby="license-dock-title">
        <div className="license-dock__bar">
          <div className="license-dock__identity">
            <span id="license-dock-title">Akses saat ini</span>
            <strong>{api.access.label} · {scanCountLabel(api.access.creditRemaining)}/{scanCountLabel(api.access.creditTotal)} scan tersisa</strong>
          </div>
          <div className="license-dock__actions">
            {api.access.tier === "free" ? <a className="license-dock__upgrade" href={ADMIN_WHATSAPP} target="_blank" rel="noreferrer">Upgrade ↗</a> : null}
            <button className="license-dock__toggle" type="button" onClick={toggleActivation} aria-expanded={activationOpen} aria-controls="activation-panel">
              {activationOpen ? "Tutup aktivasi" : "Aktivasi lisensi"}
            </button>
          </div>
        </div>

        <details className="license-details">
          <summary>Detail lisensi</summary>
          <div className="license-details__body">
            <dl className="license-dock__facts">
              <div><dt>Paket</dt><dd>{api.access.label}</dd></div>
              <div><dt>Aktivasi</dt><dd>{api.access.activatedAt ? licenseDateLabel(api.access.activatedAt) : "Belum diaktifkan"}</dd></div>
              <div><dt>Berakhir</dt><dd>{api.access.expiresAt ? licenseDateLabel(api.access.expiresAt) : "—"}</dd></div>
              <div><dt>Scan tersisa</dt><dd>{scanCountLabel(api.access.creditRemaining)} / {scanCountLabel(api.access.creditTotal)}</dd></div>
            </dl>
            <button className="license-dock__check" type="button" onClick={checkLicense} disabled={licenseChecking} data-state={licenseChecking ? "loading" : "default"}>
              {licenseChecking ? "Memeriksa" : "Perbarui status"}
              {licenseChecking ? <span className="button__spinner" aria-hidden="true" /> : null}
            </button>
          </div>
        </details>

        {activationOpen ? (
          <form className="activation-panel" id="activation-panel" onSubmit={handleActivation}>
            <div className="activation-panel__copy">
              <p className="activation-panel__label">Aktifkan lisensi</p>
              <h2>Masukkan kode dari admin</h2>
              <p>
                Kode Pro atau Max berlaku dua bulan sejak berhasil diaktifkan. Setelah aktivasi,
                tier dan kedua tanggal di atas diperbarui otomatis.{" "}
                <a href={ADMIN_WHATSAPP} target="_blank" rel="noreferrer" onClick={() => notify("WhatsApp admin dibuka", "Lanjutkan pembelian lisensi pada percakapan baru.")}>Hubungi admin ↗</a>
              </p>
            </div>
            <label className="activation-panel__field">
              <span>Kode aktivasi</span>
              <input ref={activationRef} value={activationCode} onChange={(event) => setActivationCode(event.target.value.toUpperCase())} type="text" name="activation-code" placeholder="MSC1-PRO-…" autoComplete="off" spellCheck={false} aria-invalid={Boolean(activationError)} aria-describedby="activation-help" required />
              <small id="activation-help">{activationError || (api.activationAvailable ? "Kode akan diperiksa saat aktivasi." : "Aktivasi belum disiapkan oleh admin.")}</small>
            </label>
            <div className="activation-panel__actions">
              <button className="button button--activation" type="submit" disabled={activating || !api.activationAvailable} data-state={activating ? "loading" : "default"}>{activating ? "Memverifikasi" : "Aktifkan lisensi"}{activating ? <span className="button__spinner" aria-hidden="true" /> : null}</button>
              <button className="activation-panel__close" type="button" onClick={closeActivation}>Tutup</button>
            </div>
          </form>
        ) : null}
      </section>

      <div className="scanner__console" aria-busy={submitting || active}>
        <header className="workspace-panel__head">
          <span>01 / QUERY BUILDER</span>
          <h2>Rancang scan</h2>
        </header>
        <div className="console__bar">
          <div className="console__identity">
            <span>Scan baru</span>
          </div>
          <div className="console__status">
            <p className="api-state" data-online={api.reachable} aria-live="polite"><span className="api-state__dot" aria-hidden="true" />{apiLabel}</p>
          </div>
        </div>

        <form className="scrape-form" onSubmit={handleSubmit}>
          <label className="field field--wide"><span>Cari apa?</span><input name="keyword" type="text" required maxLength={100} autoComplete="off" placeholder="Klinik gigi" /><small className="field__hint">Masukkan jenis bisnis atau layanan.</small></label>
          <div className="field location-field">
            <label><span>Di mana?</span><input name="city" type="text" value={city} onChange={(event) => { setCity(event.target.value); setLocationState("idle"); }} required maxLength={100} autoComplete="address-level2" placeholder="Makassar" /></label>
            <button className="location-field__button" type="button" onClick={useCurrentLocation} disabled={locationState === "requesting"} data-state={locationState}>
              {locationState === "requesting" ? "Membaca lokasi…" : locationState === "ready" ? "Lokasi digunakan" : "Gunakan lokasi saya"}
            </button>
            <small className="field__hint">Masukkan kota atau gunakan koordinat perangkat.</small>
          </div>
          <div className="field"><SearchableCombobox label="Cakupan" name="areaLevel" value={areaLevel} options={areaOptions} onChange={changeAreaLevel} onLockedOption={handleLockedArea} helper={api.access.allowsSubdistrict ? "Pilih kota/kabupaten atau kecamatan." : "Kecamatan tersedia pada Pro dan Max."} searchPlaceholder="Cari cakupan" /></div>
          {areaLevel === "subdistrict" ? <label className="field field--wide"><span>Kecamatan</span><input name="subdistrict" type="text" required maxLength={100} autoComplete="address-level3" /><small className="field__hint">Masukkan nama kecamatan, lalu pastikan kota/kabupaten di atas sesuai.</small></label> : null}
          {api.access.tier === "free" ? (
            <div className="field">
              <SearchableCombobox label="Jumlah hasil" name="limit" value={String(limit)} options={limitOptions} onChange={changeLimit} helper="Free: maksimal 10 bisnis per scan, dengan jeda 1 jam." searchPlaceholder="Cari jumlah hasil" />
            </div>
          ) : null}
          {api.access.tier !== "free" ? (
            <label className="field custom-limit field--wide">
              <span>Jumlah hasil · {api.access.label}</span>
              <input type="number" min="1" max={manualLimitMax} step="1" inputMode="numeric" value={manualLimit} onChange={(event) => setManualLimit(event.target.value)} placeholder={`Masukkan 1–${manualLimitMax} hasil`} aria-label={`Jumlah data manual untuk tier ${api.access.label}`} aria-invalid={Boolean(manualLimitError)} aria-describedby="manual-limit-help" required />
              <small className="field__hint" id="manual-limit-help">{manualLimitError || `Maksimal ${manualLimitMax} bisnis per scan. Setiap pencarian memakai 1 scan.`}</small>
            </label>
          ) : null}
          <details className="advanced-settings field--wide" open={advancedOpen} onToggle={(event) => setAdvancedOpen(event.currentTarget.open)}>
            <summary>Pengaturan lanjutan</summary>
            <div className="advanced-settings__grid">
              <label className="field"><span>Negara</span><input name="country" type="text" defaultValue="Indonesia" required maxLength={100} autoComplete="country-name" /><small className="field__hint">Default: Indonesia.</small></label>
              <label className="field"><span>Bahasa</span><input name="lang" type="text" defaultValue="id" minLength={2} maxLength={2} required /><small className="field__hint">Default: Bahasa Indonesia.</small></label>
            </div>
          </details>
          {challengeRequired && api.turnstileSiteKey ? (
            <div className="field field--wide turnstile-field">
              <span>Verifikasi keamanan</span>
              <Turnstile key={turnstileNonce} siteKey={api.turnstileSiteKey} onToken={setTurnstileToken} />
              <small className="field__hint">Selesaikan verifikasi sebelum menjalankan scan Free.</small>
            </div>
          ) : null}
          <button className="button button--primary field--wide" type="submit" disabled={!canSubmit} data-state={submitting ? "loading" : error ? "error" : job?.status === "completed" ? "success" : "default"}>
            <span>{submitting ? "Memulai scan" : active ? "Mencari bisnis" : !hasCredit ? "Jatah scan habis" : remainingSeconds > 0 ? `Tunggu ${countdownLabel(remainingSeconds)}` : !api.reachable ? "Layanan belum siap" : job?.status === "completed" ? "Scan wilayah baru" : error ? "Coba lagi" : "Mulai scan"}</span>
            {submitting || active ? <span className="button__spinner" aria-hidden="true" /> : <span className="button__arrow" aria-hidden="true">↗</span>}
          </button>
        </form>

        <div className="feedback-panel" data-state={feedback.state} role="status" aria-live="polite" aria-atomic="true"><span className="feedback-panel__signal" aria-hidden="true" /><div><span className="feedback-panel__label">Status scan</span><h2>{feedback.title}</h2><p>{feedback.detail}</p></div>{submitting || active || !api.checked ? <span className="feedback-panel__progress" aria-hidden="true" /> : null}</div>
      </div>

      <div className="results" id="results">
        <header className="workspace-panel__head workspace-panel__head--results">
          <span>02 / DATASET</span>
          <h2>Hasil pencarian</h2>
        </header>
        {sourceRows.length > 0 ? (
          <>
            <div className="results__head">
              <div><h3>Dataset siap</h3><p>{sourceRows.length} {job?.keyword || "bisnis"} ditemukan → {missingWebsiteCount} tidak punya website → {contactableWithoutWebsiteCount} punya nomor.</p></div>
              <div className="results__actions">
                <label className="results-search"><span>Cari hasil</span><input type="search" value={resultQuery} onChange={(event) => { setResultQuery(event.target.value); setResultPage(1); }} placeholder="Nama, alamat, atau kontak" /></label>
                <SearchableCombobox label="Filter website" value={websiteFilter} options={websiteOptions} onChange={changeWebsiteFilter} searchPlaceholder="Cari filter" />
                <SearchableCombobox className="results-download-format" label="Format unduhan" value={downloadFormat} options={downloadOptions} onChange={(value) => setDownloadFormat(value as DownloadFormat)} searchPlaceholder="Cari format" />
                <button className="button button--secondary button--export" type="button" onClick={downloadResults} disabled={visibleRows.length === 0 || downloading} data-state={downloading ? "loading" : "default"}>
                  <span>{downloading ? "Membuat file" : `Unduh ${downloadOptions.find((option) => option.value === downloadFormat)?.label || "file"}`}</span>
                  {downloading ? <span className="button__spinner" aria-hidden="true" /> : <DownloadIcon />}
                </button>
              </div>
            </div>

            <dl className="result-facts" aria-label="Ringkasan hasil"><div><dt>Diterima</dt><dd>{sourceRows.length}</dd></div><div><dt>Tanpa website</dt><dd>{missingWebsiteCount}</dd></div><div><dt>Punya nomor</dt><dd>{contactableWithoutWebsiteCount}</dd></div></dl>
            <p className="results__captured">{job?.fetchedAt ? `Diambil ${new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(job.fetchedAt))} · ${emailCount} baris memiliki email. ${completionLabel(job.completion)}` : null}</p>
            <p className="results__detail-note">Data ditampilkan sesuai sumber. Kolom kosong tidak diisi dengan perkiraan.</p>
            {visibleRows.length === 0 ? <div className="results-empty"><h3>Tidak ada bisnis pada filter ini.</h3><p>Ganti filter website untuk melihat hasil lain dari scan yang sama.</p></div> : null}

            {visibleRows.length > 0 ? (
              <div className="results-table-wrap">
                <table className="results-table">
                  <caption>Daftar bisnis hasil scan Google Maps</caption>
                  <thead>
                    <tr><th scope="col">No</th><th scope="col">Bisnis</th><th scope="col">Alamat</th><th scope="col">Kontak</th><th scope="col">Website</th><th scope="col">Rating</th><th scope="col">Ulasan</th><th scope="col">Koordinat</th><th scope="col">Sumber</th></tr>
                  </thead>
                  <tbody>{pagedRows.map((row, index) => {
                    const sequence = pageStart + index + 1;
                    return <ScanResultRow key={`${row.business}-${row.address}-${sequence}`} row={row} sequence={sequence} />;
                  })}</tbody>
                </table>
              </div>
            ) : null}
            {visibleRows.length > RESULT_PAGE_SIZE ? <nav className="results-pagination" aria-label="Halaman hasil"><p aria-live="polite"><strong>{pageStart + 1}—{Math.min(pageStart + RESULT_PAGE_SIZE, visibleRows.length)}</strong> dari {visibleRows.length}</p><div><button type="button" onClick={() => setResultPage((page) => Math.max(1, page - 1))} disabled={currentResultPage === 1}>Sebelumnya</button><span>{currentResultPage} / {totalResultPages}</span><button type="button" onClick={() => setResultPage((page) => Math.min(totalResultPages, page + 1))} disabled={currentResultPage === totalResultPages}>Berikutnya</button></div></nav> : null}
          </>
        ) : (
          <div className="results-empty results-empty--initial">
            <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 14h32M8 24h20M8 34h14" /><circle cx="36" cy="32" r="6" /><path d="m40.5 36.5 4 4" /></svg>
            <div>
              <h2>{job?.status === "completed" ? "Tidak ada hasil" : "Belum ada hasil"}</h2>
              <p>{job?.status === "completed" ? "Ubah niche atau perluas wilayah, lalu jalankan scan baru." : "Jalankan scan pertama untuk melihat data bisnis di sini."}</p>
              {job?.downloadReady ? <a className="text-link" href={`/api/jobs/${job.id}/download`}>Unduh file mentah <span aria-hidden="true">↓</span></a> : null}
            </div>
          </div>
        )}
      </div>
      {toast ? <div className="action-toast" data-tone={toast.tone} role={toast.tone === "error" ? "alert" : "status"} aria-live={toast.tone === "error" ? "assertive" : "polite"}><span className="action-toast__signal" aria-hidden="true" /><div><strong>{toast.title}</strong><p>{toast.detail}</p></div><button type="button" onClick={() => setToast(null)} aria-label="Tutup feedback">×</button></div> : null}
    </section>
  );
}
