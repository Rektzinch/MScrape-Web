"use client";

import { type FormEvent, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { LeadRow } from "@/lib/leads";
import { ALL_RESULTS_LIMIT, NUMERIC_LIMITS, planAccess, type PlanAccess, type ResultLimit } from "@/lib/plans";
import { SearchableCombobox, type ComboboxOption } from "./searchable-combobox";
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

type ExportRecord = {
  business: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  cityProvince: string;
  rating: string;
  reviews: string;
  websiteStatus: string;
  website: string;
  googleMaps: string;
};

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
  { value: "csv", label: "CSV", description: "12 kolom data bisnis untuk spreadsheet" },
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

function csvCell(value: string | number) {
  const normalized = String(value).replace(/[\r\n]+/g, " ").trim();
  const formulaSafe = /^[=+\-@]/.test(normalized) ? `'${normalized}` : normalized;
  return `"${formulaSafe.replaceAll('"', '""')}"`;
}

const exportColumns = [
  ["business", "Nama Bisnis"],
  ["category", "Kategori"],
  ["phone", "Telepon"],
  ["email", "Email"],
  ["address", "Alamat"],
  ["cityProvince", "Kota/Provinsi"],
  ["rating", "Rating"],
  ["reviews", "Ulasan"],
  ["websiteStatus", "Status Website"],
  ["website", "Website"],
  ["googleMaps", "Google Maps"],
] as const satisfies readonly (readonly [keyof ExportRecord, string])[];

const exportHeaders = exportColumns.map(([, label]) => label);

function toExportRecord(row: LeadRow, city: string): ExportRecord {
  return {
    business: row.business,
    category: row.category,
    phone: row.phone,
    email: row.email,
    address: row.address,
    cityProvince: city,
    rating: row.rating,
    reviews: row.reviewCount,
    websiteStatus: row.website ? "Memiliki website" : "Belum memiliki website",
    website: row.website,
    googleMaps: row.source,
  };
}

function rowsToCsv(headers: string[], rows: Array<Array<string | number>>) {
  return `\uFEFF${[
    headers.map(csvCell).join(","),
    ...rows.map((row) => row.map(csvCell).join(",")),
  ].join("\r\n")}`;
}

function recordsToCsv(records: ExportRecord[]) {
  return rowsToCsv(
    exportHeaders,
    records.map((record) => exportColumns.map(([key]) => record[key])),
  );
}

function recordsToSheetsCsv(records: ExportRecord[]) {
  const headers = [...exportHeaders, "Status Prospek", "Terakhir Dihubungi", "Follow-up", "Catatan"];
  const rows = records.map((record) => [
    ...exportColumns.map(([key]) => record[key]),
    "", "", "", "",
  ]);
  return rowsToCsv(headers, rows);
}

function recordsToText(records: ExportRecord[]) {
  return records.map((record, index) => [
    `# ${index + 1}`,
    `Nama Bisnis: ${record.business}`,
    `Kategori: ${record.category}`,
    `Kontak: ${record.phone}`,
    `Email: ${record.email}`,
    `Alamat: ${record.address}`,
    `Rating/Ulasan: ${[record.rating, record.reviews && `${record.reviews} ulasan`].filter(Boolean).join(" · ")}`,
    `Status Website: ${record.websiteStatus}`,
    `Website: ${record.website}`,
    `Google Maps: ${record.googleMaps}`,
  ].join("\n")).join("\n\n");
}

function recordsToJson(records: ExportRecord[], job: JobState, websiteFilter: WebsiteFilter) {
  return JSON.stringify({
    metadataPencarian: {
      kataKunci: job.keyword,
      kota: job.city,
      filterWebsite: websiteFilter,
      waktuPengambilan: job.fetchedAt,
      jumlahBisnis: records.length,
    },
    bisnis: records.map((record) => ({
      nama: record.business,
      kategori: record.category,
      kontak: { telepon: record.phone, email: record.email },
      lokasi: { alamat: record.address, kotaProvinsi: record.cityProvince },
      ratingUlasan: { rating: record.rating, ulasan: record.reviews },
      website: { status: record.websiteStatus, url: record.website },
      googleMaps: record.googleMaps,
    })),
  }, null, 2);
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
  if (seconds >= 3_600) return `${Math.ceil(seconds / 3_600)} jam / request`;
  if (seconds >= 60) return `${Math.ceil(seconds / 60)} menit / request`;
  return `${seconds} detik / request`;
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

function creditLabel(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function completionLabel(completion: SearchCompletion | null) {
  if (!completion) return "Kelengkapan hasil akan dilaporkan oleh backend bila tersedia.";
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
    setLimit(api.access.tier === "max" ? api.access.maxLimit : 10);
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
        if (!response.ok) throw new Error(data.message || "Status job gagal dibaca.");
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
          const failure = data.error || "Job dihentikan oleh backend.";
          setError(failure);
          if (!notifiedJobs.current.has(`${job.id}:failed`)) {
            notifiedJobs.current.add(`${job.id}:failed`);
            notify("Scan berhenti", failure, "error");
          }
        }
      } catch (pollError) {
        if (alive) {
          const failure = pollError instanceof Error ? pollError.message : "Status job gagal dibaca.";
          setError(failure);
          if (!notifiedJobs.current.has(`${job.id}:poll`)) {
            notifiedJobs.current.add(`${job.id}:poll`);
            notify("Status job tidak terbaca", `${failure} Sistem akan mencoba lagi.`, "error");
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
  const creditPercent = Math.round((api.access.creditRemaining / api.access.creditTotal) * 100);
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
  const manualLimitError = !hasManualLimit || api.access.tier === "free" ? ""
    : !Number.isSafeInteger(manualLimitNumber) || Number(manualLimitNumber) <= 0
      ? "Masukkan bilangan bulat lebih dari 0."
      : api.access.tier === "pro" && Number(manualLimitNumber) > 250
        ? "Tier Pro menerima maksimal 250 hasil."
        : api.access.tier === "max" && Number(manualLimitNumber) > 500
          ? "Tier Max menerima maksimal 500 hasil per scan."
          : "";
  const requestedLimit: ResultLimit = api.access.tier === "free" ? 10
    : hasManualLimit && !manualLimitError ? Number(manualLimitNumber)
      : api.access.tier === "max" ? api.access.maxLimit : limit;
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
    if (api.access.tier === "max") return [];
    return api.access.allowedLimits
      .filter((value): value is number => typeof value === "number" && NUMERIC_LIMITS.includes(value as (typeof NUMERIC_LIMITS)[number]))
      .map((value) => ({
        value: String(value),
        label: resultLimitLabel(value),
        description: api.access.tier === "free" ? "Free · jeda 1 jam" : "Pro · jeda 1 menit",
      }));
  }, [api.access.allowedLimits, api.access.tier]);

  const apiLabel = !api.checked ? "memeriksa koneksi" : !api.configured ? "belum dikonfigurasi"
    : !api.reachable ? "tidak terjangkau" : api.mode === "google-live"
      ? "terhubung · Google Maps live" : `terhubung · mode ${api.mode}`;

  const feedback = error ? { title: "Scan berhenti", detail: error, state: "error" }
    : submitting ? { title: "Request sedang berjalan", detail: "Server sedang meminta hasil baru dari Google Maps. Data lama tidak dipakai.", state: "loading" }
    : active ? { title: "Job backend diproses", detail: "Status dibaca ulang setiap empat detik sampai backend selesai.", state: "loading" }
    : !hasCredit ? { title: "Kredit habis", detail: `Tier ${api.access.label} telah memakai seluruh ${creditLabel(api.access.creditTotal)} kredit. Aktifkan atau perbarui lisensi untuk melanjutkan scan.`, state: "locked" }
    : remainingSeconds > 0 ? { title: "Cooldown aktif", detail: `Tier ${api.access.label} dapat mengirim request berikutnya dalam ${countdownLabel(remainingSeconds)}.`, state: "locked" }
    : job?.status === "completed" ? { title: "Hasil siap diperiksa", detail: `${sourceRows.length} bisnis ditemukan → ${missingWebsiteCount} tidak punya website → ${contactableWithoutWebsiteCount} punya nomor yang bisa dihubungi.`, state: "success" }
    : !api.checked ? { title: "Memeriksa koneksi", detail: "Route server sedang diverifikasi sebelum form diaktifkan.", state: "loading" }
    : !api.reachable ? { title: "API tidak tersedia", detail: "Pencarian belum dapat dimulai. Muat ulang halaman atau periksa konfigurasi backend.", state: "error" }
    : { title: "Siap memindai", detail: `Tier ${api.access.label}: ${creditLabel(api.access.creditRemaining)} dari ${creditLabel(api.access.creditTotal)} kredit tersedia, ${durationLabel(api.access.cooldownSeconds)}.`, state: "idle" };

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
    notify("Batas hasil diperbarui", `Request berikutnya akan meminta ${resultLimitLabel(nextLimit).toLocaleLowerCase("id")}.`);
  }

  function changeAreaLevel(value: string) {
    const nextAreaLevel = value as "city" | "subdistrict";
    setAreaLevel(nextAreaLevel);
    notify(
      "Cakupan pencarian diperbarui",
      nextAreaLevel === "subdistrict"
        ? "Masukkan kecamatan dan kota/kabupaten untuk mempersempit pencarian."
        : "Request berikutnya menggunakan cakupan kota atau kabupaten.",
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
        `Tier ${data.access.label} terverifikasi`,
        data.access.activatedAt
          ? `Aktif sejak ${licenseDateLabel(data.access.activatedAt)} sampai ${licenseDateLabel(data.access.expiresAt)}. Saldo ${creditLabel(data.access.creditRemaining)}/${creditLabel(data.access.creditTotal)} kredit.`
          : `Belum ada kode Pro atau Max yang aktif pada browser ini. Saldo Free ${creditLabel(data.access.creditRemaining)}/${creditLabel(data.access.creditTotal)} kredit.`,
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
        `Tier ${data.access.label} aktif`,
        `Aktif ${licenseDateLabel(data.access.activatedAt)} sampai ${licenseDateLabel(data.access.expiresAt)} dengan ${creditLabel(data.access.creditRemaining)} kredit tersedia.`,
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
    notify("Scan dimulai", `${keyword} di ${areaLabel} sedang dipindai dengan batas ${resultLimitLabel(requestedLimit).toLocaleLowerCase("id")}. Satu kredit akan digunakan.`);
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
      if (!response.ok || !data.jobId) throw new Error(messageFrom(data, "Job tidak dapat dibuat."));
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
        notify("Job diterima", "Backend memproses permintaan. Status diperbarui setiap empat detik.");
      }
    } catch (submitError) {
      const failure = submitError instanceof Error ? submitError.message : "Job tidak dapat dibuat.";
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

    const records = visibleRows.map((row) => toExportRecord(row, job.city));
    const queryName = [safeFilenamePart(job.keyword), safeFilenamePart(job.city)].filter(Boolean).join("-");
    const filename = `mscrape-${queryName || job.id}-${websiteFilter}`;
    const format = downloadOptions.find((option) => option.value === downloadFormat)?.label || "File";

    setDownloading(true);
    try {
      if (downloadFormat === "csv") {
        triggerDownload(recordsToCsv(records), "text/csv;charset=utf-8", `${filename}.csv`);
      } else if (downloadFormat === "txt") {
        triggerDownload(recordsToText(records), "text/plain;charset=utf-8", `${filename}.txt`);
      } else if (downloadFormat === "json") {
        triggerDownload(recordsToJson(records, job, websiteFilter), "application/json;charset=utf-8", `${filename}.json`);
      } else {
        triggerDownload(
          recordsToSheetsCsv(records),
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
            <span id="license-dock-title">Lisensi aktif</span>
            <strong>Tier {api.access.label}</strong>
          </div>
          <dl className="license-dock__facts">
            <div><dt>Tier</dt><dd>{api.access.label}</dd></div>
            <div><dt>Aktivasi</dt><dd>{api.access.activatedAt ? licenseDateLabel(api.access.activatedAt) : "Belum diredeem"}</dd></div>
            <div><dt>Berakhir</dt><dd>{api.access.expiresAt ? licenseDateLabel(api.access.expiresAt) : "—"}</dd></div>
            <div><dt>Kredit</dt><dd>{creditLabel(api.access.creditRemaining)} / {creditLabel(api.access.creditTotal)}</dd></div>
          </dl>
          <div className="license-dock__credit">
            <div><span>Saldo kredit</span><strong>{creditPercent}%</strong></div>
            <div className="license-dock__credit-track" role="progressbar" aria-label="Saldo kredit tersisa" aria-valuemin={0} aria-valuemax={100} aria-valuenow={creditPercent}>
              <span style={{ "--credit-progress": `${creditPercent}%` } as React.CSSProperties} />
            </div>
            <p>1 kredit digunakan untuk setiap scan.</p>
          </div>
          <div className="license-dock__actions">
            <button className="license-dock__check" type="button" onClick={checkLicense} disabled={licenseChecking} data-state={licenseChecking ? "loading" : "default"}>
              {licenseChecking ? "Memeriksa" : "Cek lisensi"}
              {licenseChecking ? <span className="button__spinner" aria-hidden="true" /> : null}
            </button>
            <button className="license-dock__toggle" type="button" onClick={toggleActivation} aria-expanded={activationOpen} aria-controls="activation-panel">
              {activationOpen ? "Tutup kode" : "Kode aktivasi"}
            </button>
          </div>
        </div>

        {activationOpen ? (
          <form className="activation-panel" id="activation-panel" onSubmit={handleActivation}>
            <div className="activation-panel__copy">
              <p className="activation-panel__label">Redeem lisensi</p>
              <h2>Masukkan kode dari admin</h2>
              <p>
                Kode Pro atau Max berlaku dua bulan sejak berhasil diredeem. Setelah aktivasi,
                tier dan kedua tanggal di atas diperbarui otomatis.{" "}
                <a href={ADMIN_WHATSAPP} target="_blank" rel="noreferrer" onClick={() => notify("WhatsApp admin dibuka", "Lanjutkan pembelian lisensi pada percakapan baru.")}>Hubungi admin ↗</a>
              </p>
            </div>
            <label className="activation-panel__field">
              <span>Kode aktivasi</span>
              <input ref={activationRef} value={activationCode} onChange={(event) => setActivationCode(event.target.value.toUpperCase())} type="text" name="activation-code" placeholder="MSC1-PRO-…" autoComplete="off" spellCheck={false} aria-invalid={Boolean(activationError)} aria-describedby="activation-help" required />
              <small id="activation-help">{activationError || (api.activationAvailable ? "Kode diverifikasi aman di server." : "Aktivasi belum dikonfigurasi oleh admin.")}</small>
            </label>
            <div className="activation-panel__actions">
              <button className="button button--activation" type="submit" disabled={activating || !api.activationAvailable} data-state={activating ? "loading" : "default"}>{activating ? "Memverifikasi" : "Aktifkan lisensi"}{activating ? <span className="button__spinner" aria-hidden="true" /> : null}</button>
              <button className="activation-panel__close" type="button" onClick={closeActivation}>Tutup</button>
            </div>
          </form>
        ) : null}
      </section>

      <div className="scanner__console" aria-busy={submitting || active}>
        <div className="console__bar">
          <div className="console__identity">
            <span>Scan baru</span>
          </div>
          <div className="console__status">
            <p className="api-state" data-online={api.reachable} aria-live="polite"><span className="api-state__dot" aria-hidden="true" />API {apiLabel}</p>
          </div>
        </div>

        <form className="scrape-form" onSubmit={handleSubmit}>
          <label className="field field--wide"><span>Niche / kata kunci</span><input name="keyword" type="text" required maxLength={100} autoComplete="off" /><small className="field__hint">Jenis bisnis yang ingin diperiksa.</small></label>
          <label className="field"><span>Kota / kabupaten</span><input name="city" type="text" required maxLength={100} autoComplete="address-level2" /><small className="field__hint">Wilayah induk target.</small></label>
          <div className="field"><SearchableCombobox label="Cakupan pencarian" name="areaLevel" value={areaLevel} options={areaOptions} onChange={changeAreaLevel} onLockedOption={handleLockedArea} helper={api.access.allowsSubdistrict ? "Pro dan Max dapat mempersempit pencarian hingga kecamatan." : "Aktifkan Pro atau Max untuk pencarian hingga kecamatan."} searchPlaceholder="Cari cakupan" /></div>
          {areaLevel === "subdistrict" ? <label className="field field--wide"><span>Kecamatan</span><input name="subdistrict" type="text" required maxLength={100} autoComplete="address-level3" /><small className="field__hint">Masukkan nama kecamatan, lalu pastikan kota/kabupaten di atas sesuai.</small></label> : null}
          <label className="field"><span>Negara</span><input name="country" type="text" defaultValue="Indonesia" required maxLength={100} autoComplete="country-name" /><small className="field__hint">Dipakai untuk memperjelas kueri.</small></label>
          <label className="field"><span>Bahasa</span><input name="lang" type="text" defaultValue="id" minLength={2} maxLength={2} required /><small className="field__hint">Kode ISO dua huruf.</small></label>
          {api.access.tier !== "max" ? (
            <div className="field">
              <SearchableCombobox label="Batas hasil" name="limit" value={String(limit)} options={limitOptions} onChange={changeLimit} helper={`Pilihan yang tampil hanya milik tier ${api.access.label}.`} searchPlaceholder="Cari batas hasil" />
            </div>
          ) : null}
          {api.access.tier !== "free" ? (
            <label className={`field custom-limit${api.access.tier === "max" ? " field--wide" : ""}`}>
              <span>Jumlah hasil custom · {api.access.label}</span>
              <input type="number" min="1" max={api.access.tier === "pro" ? 250 : 500} step="1" inputMode="numeric" value={manualLimit} onChange={(event) => setManualLimit(event.target.value)} placeholder={api.access.tier === "pro" ? "Opsional · maksimal 250" : "Opsional · maksimal 500"} aria-label={`Jumlah hasil custom untuk tier ${api.access.label}`} aria-invalid={Boolean(manualLimitError)} aria-describedby="manual-limit-help" />
              <small className="field__hint" id="manual-limit-help">{manualLimitError || (api.access.tier === "pro" ? "Kosongkan untuk memakai preset batas hasil." : "Kosongkan untuk memakai batas maksimal 500 hasil per scan.")}</small>
            </label>
          ) : null}
          {challengeRequired && api.turnstileSiteKey ? (
            <div className="field field--wide turnstile-field">
              <span>Verifikasi keamanan</span>
              <Turnstile key={turnstileNonce} siteKey={api.turnstileSiteKey} onToken={setTurnstileToken} />
              <small className="field__hint">Selesaikan verifikasi sebelum menjalankan scan Free.</small>
            </div>
          ) : null}
          <button className="button button--primary field--wide" type="submit" disabled={!canSubmit} data-state={submitting ? "loading" : error ? "error" : job?.status === "completed" ? "success" : "default"}>
            <span>{submitting ? "Memindai Google Maps" : active ? "Menunggu hasil" : !hasCredit ? "Kredit habis" : remainingSeconds > 0 ? `Tunggu ${countdownLabel(remainingSeconds)}` : !api.reachable ? "API belum terhubung" : job?.status === "completed" ? "Pindai wilayah baru" : error ? "Coba lagi" : "Mulai scan"}</span>
            {submitting || active ? <span className="button__spinner" aria-hidden="true" /> : <span className="button__arrow" aria-hidden="true">↗</span>}
          </button>
        </form>

        <div className="feedback-panel" data-state={feedback.state} role="status" aria-live="polite" aria-atomic="true"><span className="feedback-panel__signal" aria-hidden="true" /><div><span className="feedback-panel__label">Feedback center</span><h2>{feedback.title}</h2><p>{feedback.detail}</p></div>{submitting || active || !api.checked ? <span className="feedback-panel__progress" aria-hidden="true" /> : null}</div>
      </div>

      <div className="results" id="results">
        <div className="results__head">
          <div><h2>Lead hasil scan</h2><p>{sourceRows.length ? `${sourceRows.length} ${job?.keyword || "bisnis"} ditemukan → ${missingWebsiteCount} tidak punya website → ${contactableWithoutWebsiteCount} punya nomor yang bisa dihubungi.` : "Hasil nyata akan muncul di sini setelah scan selesai."}</p></div>
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

        <dl className="result-facts" aria-label="Ringkasan hasil"><div><dt>Diterima</dt><dd>{sourceRows.length || "—"}</dd></div><div><dt>Tanpa website</dt><dd>{sourceRows.length ? missingWebsiteCount : "—"}</dd></div><div><dt>Punya nomor</dt><dd>{sourceRows.length ? contactableWithoutWebsiteCount : "—"}</dd></div></dl>
        <p className="results__captured">{job?.fetchedAt ? `Diambil ${new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(job.fetchedAt))} · ${emailCount} baris memiliki email. ${completionLabel(job.completion)}` : "Waktu pengambilan dan jumlah email akan dicatat setelah scan selesai."}</p>
        {job?.status === "completed" && sourceRows.length === 0 ? <div className="results-empty"><h3>Tidak ada baris yang dikembalikan.</h3><p>Ubah niche atau perluas wilayah, lalu jalankan scan baru.</p></div> : null}
        {sourceRows.length > 0 && visibleRows.length === 0 ? <div className="results-empty"><h3>Tidak ada bisnis pada filter ini.</h3><p>Ganti filter website untuk melihat baris lain dari request yang sama.</p></div> : null}

        {visibleRows.length > 0 ? (
          <div className="results-table-wrap">
            <table className="results-table">
              <caption>Daftar bisnis hasil scan Google Maps</caption>
              <thead>
                <tr><th scope="col">No</th><th scope="col">Bisnis</th><th scope="col">Alamat</th><th scope="col">Kontak</th><th scope="col">Website</th><th scope="col">Rating</th><th scope="col">Koordinat</th><th scope="col">Sumber</th></tr>
              </thead>
              <tbody>{pagedRows.map((row, index) => {
                const sequence = pageStart + index + 1;
                const telephone = row.phone.replace(/[^\d+]/g, "");
                return (
                  <tr key={`${row.business}-${row.address}-${sequence}`}>
                    <td data-label="No"><span className="result-index">{sequence}</span></td>
                    <td data-label="Bisnis" className="business-cell"><strong>{row.business || "Nama tidak tersedia"}</strong><span>{row.category || "Kategori tidak tersedia"}</span></td>
                    <td data-label="Alamat" className="address-cell">{row.address || "Alamat tidak tersedia"}</td>
                    <td data-label="Kontak" className="contact-cell">{row.phone ? <a href={`tel:${telephone}`}>{row.phone}</a> : <span>Telepon tidak tersedia</span>}{row.email ? <a href={`mailto:${row.email}`}>{row.email}</a> : <span>Email tidak tersedia</span>}</td>
                    <td data-label="Website" className="website-cell">{row.website ? <><span className="status-tag" data-status="ready">Tersedia</span><a href={row.website} target="_blank" rel="noreferrer">Buka website ↗</a></> : <span className="status-tag" data-status="missing">Belum ada</span>}</td>
                    <td data-label="Rating" className="rating-cell"><strong>{row.rating || "—"}</strong>{row.reviewCount ? <span className="cell-note">{row.reviewCount} ulasan</span> : <span className="cell-note">Tanpa ulasan</span>}</td>
                    <td data-label="Koordinat" className="numeric-cell">{row.coordinates || "—"}</td>
                    <td data-label="Sumber" className="source-cell">{row.source ? <a href={row.source} target="_blank" rel="noreferrer">Buka Maps ↗</a> : <span>—</span>}</td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        ) : null}
        {visibleRows.length > RESULT_PAGE_SIZE ? <nav className="results-pagination" aria-label="Halaman hasil"><p aria-live="polite"><strong>{pageStart + 1}—{Math.min(pageStart + RESULT_PAGE_SIZE, visibleRows.length)}</strong> dari {visibleRows.length}</p><div><button type="button" onClick={() => setResultPage((page) => Math.max(1, page - 1))} disabled={currentResultPage === 1}>Sebelumnya</button><span>{currentResultPage} / {totalResultPages}</span><button type="button" onClick={() => setResultPage((page) => Math.min(totalResultPages, page + 1))} disabled={currentResultPage === totalResultPages}>Berikutnya</button></div></nav> : null}
        {job?.downloadReady && sourceRows.length === 0 ? <a className="text-link" href={`/api/jobs/${job.id}/download`}>Unduh file mentah dari backend <span aria-hidden="true">↓</span></a> : null}
      </div>
      {toast ? <div className="action-toast" data-tone={toast.tone} role={toast.tone === "error" ? "alert" : "status"} aria-live={toast.tone === "error" ? "assertive" : "polite"}><span className="action-toast__signal" aria-hidden="true" /><div><strong>{toast.title}</strong><p>{toast.detail}</p></div><button type="button" onClick={() => setToast(null)} aria-label="Tutup feedback">×</button></div> : null}
    </section>
  );
}
