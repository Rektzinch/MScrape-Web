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
import type { Locale } from "@/lib/locale";
import { languageTag } from "@/lib/locale";
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
  persistent: boolean;
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

function tx(en: boolean, id: string, english: string) {
  return en ? english : id;
}

function websiteOptionsFor(en: boolean): ComboboxOption[] {
  return [
    { value: "all", label: tx(en, "Semua bisnis", "All businesses"), description: tx(en, "Tampilkan seluruh hasil yang diterima", "Show every received result") },
    { value: "ready", label: tx(en, "Siap dihubungi", "Ready to contact"), description: tx(en, "Tanpa website + punya nomor", "No website + has phone") },
    { value: "missing", label: tx(en, "Tanpa website", "No website"), description: tx(en, "Semua bisnis tanpa website", "All businesses without a website") },
    { value: "present", label: tx(en, "Punya website", "Has website"), description: tx(en, "Website sudah tersedia", "Website is available") },
  ];
}

function downloadOptionsFor(en: boolean): ComboboxOption[] {
  return [
    { value: "csv", label: "CSV", description: tx(en, "Data bisnis lengkap untuk spreadsheet", "Complete business data for spreadsheets") },
    { value: "txt", label: "TXT", description: tx(en, "Ringkasan teks berurutan per bisnis", "Sequential text summary for each business") },
    { value: "json", label: "JSON", description: tx(en, "Metadata pencarian dan data bisnis terstruktur", "Structured search metadata and business data") },
    { value: "sheets", label: "Google Sheets", description: tx(en, "CSV siap impor dengan kolom tindak lanjut", "Import-ready CSV with follow-up columns") },
  ];
}

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

function durationLabel(seconds: number, en: boolean) {
  if (seconds <= 0) return tx(en, "tanpa cooldown", "no cooldown");
  if (seconds >= 3_600) return `${Math.ceil(seconds / 3_600)} ${tx(en, "jam", "hours")} / scan`;
  if (seconds >= 60) return `${Math.ceil(seconds / 60)} ${tx(en, "menit", "minutes")} / scan`;
  return `${seconds} ${tx(en, "detik", "seconds")} / scan`;
}

function countdownLabel(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function resultLimitLabel(limit: ResultLimit, en: boolean) {
  return limit === ALL_RESULTS_LIMIT ? tx(en, "Semua hasil", "All results") : `${limit} ${tx(en, "hasil", "results")}`;
}

function scanCountLabel(value: number, locale: Locale) {
  return new Intl.NumberFormat(languageTag(locale)).format(value);
}

function completionLabel(completion: SearchCompletion | null, en: boolean) {
  if (!completion) return tx(en, "Kelengkapan hasil akan dilaporkan setelah scan selesai.", "Result completeness will be reported when the scan finishes.");
  if (completion.stoppedReason === "source-exhausted") return tx(en, "Sumber tidak mengembalikan halaman tambahan; hasil saat ini lengkap menurut sumber.", "The source returned no additional pages; the current results are complete according to the source.");
  if (completion.stoppedReason === "limit-reached") return tx(en, "Batas hasil scan telah tercapai; sumber mungkin masih memiliki bisnis tambahan.", "The scan result limit was reached; the source may contain more businesses.");
  return tx(en, "Batas waktu scan tercapai; hasil mungkin parsial. Persempit niche atau wilayah untuk hasil yang lebih lengkap.", "The scan time limit was reached; results may be partial. Narrow the niche or region for more complete results.");
}

function licenseDateLabel(value: string | null, locale: Locale) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(languageTag(locale), {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ScrapeConsole({ locale = "id" }: { locale?: Locale }) {
  const en = locale === "en";
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

  const dismissToast = useCallback(() => {
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
    setToast(null);
  }, []);

  const notify = useCallback((title: string, detail: string, tone: NoticeTone = "info", persistent = false) => {
    noticeId.current += 1;
    const next: ActionNotice = {
      id: noticeId.current,
      title,
      detail,
      tone,
      persistent,
    };
    setToast(next);
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
    if (!persistent) {
      toastTimer.current = window.setTimeout(() => {
        setToast(null);
        toastTimer.current = null;
      }, 4_800);
    }
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
        if (!response.ok) throw new Error(data.message || tx(en, "Status hasil gagal dibaca.", "The result status could not be read."));
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
          if (en) notify("Scan complete", `${received} business records received and ready to filter.`, "success", true);
          else notify("Scan selesai", `${received} data bisnis diterima dan siap difilter.`, "success", true);
        }
        if (data.status === "failed") {
          const failure = data.error || tx(en, "Scan dihentikan oleh layanan.", "The scan was stopped by the service.");
          setError(failure);
          if (!notifiedJobs.current.has(`${job.id}:failed`)) {
            notifiedJobs.current.add(`${job.id}:failed`);
            notify(tx(en, "Scan berhenti", "Scan stopped"), failure, "error");
          }
        }
      } catch (pollError) {
        if (alive) {
          const failure = pollError instanceof Error ? pollError.message : tx(en, "Status hasil gagal dibaca.", "The result status could not be read.");
          setError(failure);
          if (!notifiedJobs.current.has(`${job.id}:poll`)) {
            notifiedJobs.current.add(`${job.id}:poll`);
            notify(tx(en, "Status hasil belum terbaca", "Result status unavailable"), `${failure} ${tx(en, "Sistem akan mencoba lagi.", "The system will try again.")}`, "error");
          }
        }
      }
    };
    void poll();
    const timer = window.setInterval(poll, 4_000);
    return () => { alive = false; window.clearInterval(timer); };
  }, [en, job?.id, job?.status, notify]);

  const remainingSeconds = api.access.nextAllowedAt
    ? Math.max(0, Math.ceil((new Date(api.access.nextAllowedAt).getTime() - now) / 1_000))
    : 0;
  const hasCredit = api.access.creditRemaining > 0;
  const creditPercent = api.access.creditTotal > 0
    ? Math.max(0, Math.min(100, (api.access.creditRemaining / api.access.creditTotal) * 100))
    : 0;
  const active = job?.status === "pending" || job?.status === "running";
  const sourceRows = job?.rows ?? EMPTY_ROWS;
  const deferredResultQuery = useDeferredValue(resultQuery.trim().toLocaleLowerCase(locale));
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
      .some((value) => value.toLocaleLowerCase(locale).includes(deferredResultQuery));
  }).toSorted((a, b) => Number(Boolean(b.email)) - Number(Boolean(a.email)) || a.business.localeCompare(b.business, locale)), [deferredResultQuery, locale, sourceRows, websiteFilter]);
  const totalResultPages = Math.max(1, Math.ceil(visibleRows.length / RESULT_PAGE_SIZE));
  const currentResultPage = Math.min(resultPage, totalResultPages);
  const pageStart = (currentResultPage - 1) * RESULT_PAGE_SIZE;
  const pagedRows = visibleRows.slice(pageStart, pageStart + RESULT_PAGE_SIZE);
  const hasManualLimit = manualLimit.trim().length > 0;
  const manualLimitNumber = hasManualLimit ? Number(manualLimit) : null;
  const manualLimitMax = typeof api.access.maxLimit === "number" ? api.access.maxLimit : Number.MAX_SAFE_INTEGER;
  const manualLimitError = api.access.tier === "free" ? ""
    : !hasManualLimit
      ? tx(en, `Masukkan jumlah data untuk scan tier ${api.access.label}.`, `Enter the result count for a ${api.access.label} scan.`)
      : !Number.isSafeInteger(manualLimitNumber) || Number(manualLimitNumber) <= 0
      ? tx(en, "Masukkan bilangan bulat lebih dari 0.", "Enter a whole number greater than 0.")
      : Number(manualLimitNumber) > manualLimitMax
        ? tx(en, `Tier ${api.access.label} menerima maksimal ${manualLimitMax} hasil per scan.`, `${api.access.label} accepts up to ${manualLimitMax} results per scan.`)
        : "";
  const requestedLimit: ResultLimit = api.access.tier === "free" ? 10
    : !manualLimitError ? Number(manualLimitNumber)
      : api.access.maxLimit;
  const challengeRequired = api.access.tier === "free" && Boolean(api.turnstileSiteKey);
  const canSubmit = api.reachable && hasCredit && !submitting && !active && remainingSeconds === 0 && !manualLimitError && (!challengeRequired || Boolean(turnstileToken));

  const areaOptions = useMemo<ComboboxOption[]>(() => [
    { value: "city", label: tx(en, "Kota / kabupaten", "City / regency"), description: tx(en, "Cakupan standar semua tier", "Standard coverage on every plan") },
    {
      value: "subdistrict",
      label: tx(en, "Kecamatan", "Subdistrict"),
      description: tx(en, "Mempersempit pencarian ke satu kecamatan", "Narrow the search to one subdistrict"),
      locked: !api.access.allowsSubdistrict,
    },
  ], [api.access.allowsSubdistrict, en]);

  const limitOptions = useMemo<ComboboxOption[]>(() => {
    if (api.access.tier !== "free") return [];
    return api.access.allowedLimits
      .filter((value): value is number => typeof value === "number")
      .map((value) => ({
        value: String(value),
        label: resultLimitLabel(value, en),
        description: tx(en, "Free · jeda 1 jam", "Free · 1 hour cooldown"),
      }));
  }, [api.access.allowedLimits, api.access.tier, en]);

  const websiteOptions = useMemo(() => websiteOptionsFor(en), [en]);
  const downloadOptions = useMemo(() => downloadOptionsFor(en), [en]);

  const apiLabel = !api.checked ? tx(en, "Menghubungkan layanan…", "Connecting to service…")
    : !api.reachable ? tx(en, "Layanan belum tersedia", "Service unavailable")
      : tx(en, "Siap melakukan scan", "Ready to scan");

  const feedback = error ? { title: tx(en, "Scan berhenti", "Scan stopped"), detail: error, state: "error" }
    : submitting ? { title: tx(en, "Scan sedang dimulai", "Starting scan"), detail: tx(en, "Layanan sedang menyiapkan pencarian baru dari Google Maps.", "The service is preparing a new Google Maps search."), state: "loading" }
    : active ? { title: tx(en, "Data sedang dicari", "Searching for data"), detail: tx(en, "Hasil akan muncul otomatis setelah pencarian selesai.", "Results will appear automatically when the search finishes."), state: "loading" }
    : !hasCredit ? { title: tx(en, "Jatah scan habis", "No scans remaining"), detail: tx(en, `Paket ${api.access.label} telah memakai seluruh ${scanCountLabel(api.access.creditTotal, locale)} scan. Aktifkan atau perbarui lisensi untuk melanjutkan.`, `${api.access.label} has used all ${scanCountLabel(api.access.creditTotal, locale)} scans. Activate or renew a license to continue.`), state: "locked" }
    : remainingSeconds > 0 ? { title: tx(en, "Jeda scan aktif", "Scan cooldown active"), detail: tx(en, `Scan berikutnya dapat dijalankan dalam ${countdownLabel(remainingSeconds)}.`, `The next scan can run in ${countdownLabel(remainingSeconds)}.`), state: "locked" }
    : job?.status === "completed" ? { title: tx(en, "Hasil siap diperiksa", "Results ready to review"), detail: tx(en, `${sourceRows.length} bisnis ditemukan → ${missingWebsiteCount} tidak punya website → ${contactableWithoutWebsiteCount} punya nomor yang bisa dihubungi.`, `${sourceRows.length} businesses found → ${missingWebsiteCount} without a website → ${contactableWithoutWebsiteCount} with a phone number.`), state: "success" }
    : !api.checked ? { title: tx(en, "Menghubungkan layanan", "Connecting to service"), detail: tx(en, "Form akan aktif setelah layanan siap menerima scan.", "The form will activate when the service is ready to accept scans."), state: "loading" }
    : !api.reachable ? { title: tx(en, "Layanan belum tersedia", "Service unavailable"), detail: tx(en, "Pencarian belum dapat dimulai. Muat ulang halaman dan coba lagi.", "The search cannot start yet. Reload the page and try again."), state: "error" }
    : { title: tx(en, "Siap melakukan scan", "Ready to scan"), detail: tx(en, `${scanCountLabel(api.access.creditRemaining, locale)} dari ${scanCountLabel(api.access.creditTotal, locale)} scan tersisa · ${durationLabel(api.access.cooldownSeconds, en)}.`, `${scanCountLabel(api.access.creditRemaining, locale)} of ${scanCountLabel(api.access.creditTotal, locale)} scans remaining · ${durationLabel(api.access.cooldownSeconds, en)}.`), state: "idle" };

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
    notify(tx(en, "Jumlah hasil diperbarui", "Result count updated"), tx(en, `Scan berikutnya akan meminta ${resultLimitLabel(nextLimit, en).toLocaleLowerCase(locale)}.`, `The next scan will request ${resultLimitLabel(nextLimit, en).toLocaleLowerCase(locale)}.`));
  }

  function changeAreaLevel(value: string) {
    const nextAreaLevel = value as "city" | "subdistrict";
    setAreaLevel(nextAreaLevel);
    notify(
      tx(en, "Cakupan pencarian diperbarui", "Search coverage updated"),
      nextAreaLevel === "subdistrict"
        ? tx(en, "Masukkan kecamatan dan kota/kabupaten untuk mempersempit pencarian.", "Enter a subdistrict and city/regency to narrow the search.")
        : tx(en, "Scan berikutnya menggunakan cakupan kota atau kabupaten.", "The next scan will use city or regency coverage."),
    );
  }

  function useCurrentLocation() {
    if (!("geolocation" in navigator)) {
      setLocationState("error");
      notify(tx(en, "Lokasi tidak tersedia", "Location unavailable"), tx(en, "Perangkat ini tidak menyediakan akses lokasi. Masukkan kota secara manual.", "This device does not provide location access. Enter a city manually."), "error");
      return;
    }
    setLocationState("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`;
        setCity(coordinates);
        setLocationState("ready");
        notify(tx(en, "Lokasi digunakan", "Location applied"), tx(en, "Koordinat perangkat dimasukkan sebagai area pencarian.", "Device coordinates were entered as the search area."), "success");
      },
      () => {
        setLocationState("error");
        notify(tx(en, "Lokasi tidak dapat dibaca", "Location could not be read"), tx(en, "Izinkan akses lokasi atau masukkan kota secara manual.", "Allow location access or enter a city manually."), "error");
      },
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 10_000 },
    );
  }

  function handleLockedArea(option: ComboboxOption) {
    notify(tx(en, `${option.label} terkunci`, `${option.label} locked`), tx(en, "Aktifkan lisensi Pro atau Max untuk pencarian hingga kecamatan.", "Activate a Pro or Max license to search by subdistrict."), "info");
  }

  async function checkLicense() {
    setLicenseChecking(true);
    setActivationError("");
    try {
      const response = await fetch("/api/config", { cache: "no-store" });
      const data = (await response.json()) as Omit<ApiState, "checked"> & { message?: string };
      if (!response.ok || !data.access) throw new Error(data.message || tx(en, "Status lisensi tidak dapat dibaca.", "The license status could not be read."));
      setApi({ ...data, checked: true });
      notify(
        tx(en, `Paket ${data.access.label} terverifikasi`, `${data.access.label} plan verified`),
        data.access.activatedAt
          ? tx(en, `Aktif sejak ${licenseDateLabel(data.access.activatedAt, locale)} sampai ${licenseDateLabel(data.access.expiresAt, locale)}. Sisa ${scanCountLabel(data.access.creditRemaining, locale)}/${scanCountLabel(data.access.creditTotal, locale)} scan.`, `Active from ${licenseDateLabel(data.access.activatedAt, locale)} until ${licenseDateLabel(data.access.expiresAt, locale)}. ${scanCountLabel(data.access.creditRemaining, locale)}/${scanCountLabel(data.access.creditTotal, locale)} scans remaining.`)
          : tx(en, `Belum ada kode Pro atau Max yang aktif pada browser ini. Sisa Free ${scanCountLabel(data.access.creditRemaining, locale)}/${scanCountLabel(data.access.creditTotal, locale)} scan.`, `No Pro or Max code is active in this browser. Free scans remaining: ${scanCountLabel(data.access.creditRemaining, locale)}/${scanCountLabel(data.access.creditTotal, locale)}.`),
        data.access.tier === "free" ? "info" : "success",
      );
    } catch (licenseFailure) {
      const failure = licenseFailure instanceof Error ? licenseFailure.message : tx(en, "Status lisensi tidak dapat dibaca.", "The license status could not be read.");
      setActivationError(failure);
      notify(tx(en, "Pemeriksaan lisensi gagal", "License check failed"), `${failure} ${tx(en, "Coba lagi setelah koneksi tersedia.", "Try again when a connection is available.")}`, "error");
    } finally {
      setLicenseChecking(false);
    }
  }

  function changeWebsiteFilter(value: string) {
    const nextFilter = value as WebsiteFilter;
    setWebsiteFilter(nextFilter);
    setResultPage(1);
    const selected = websiteOptions.find((option) => option.value === nextFilter);
    notify(tx(en, "Filter hasil diperbarui", "Result filter updated"), selected?.description || tx(en, "Tabel hasil sudah disaring ulang.", "The results table has been filtered again."));
  }

  async function handleActivation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActivating(true);
    setActivationError("");
    notify(tx(en, "Kode sedang diverifikasi", "Verifying code"), tx(en, "Server memeriksa tier dan tanda tangan kode aktivasi.", "The server is checking the plan and activation-code signature."));
    try {
      const response = await fetch("/api/license/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: activationCode }),
      });
      const data = (await response.json()) as { access?: PlanAccess; message?: string };
      if (!response.ok || !data.access) throw new Error(data.message || tx(en, "Lisensi tidak dapat diaktifkan.", "The license could not be activated."));
      setApi((current) => ({ ...current, access: data.access! }));
      setActivationCode("");
      notify(
        tx(en, `Paket ${data.access.label} aktif`, `${data.access.label} plan active`),
        tx(en, `Aktif ${licenseDateLabel(data.access.activatedAt, locale)} sampai ${licenseDateLabel(data.access.expiresAt, locale)} dengan ${scanCountLabel(data.access.creditRemaining, locale)} scan tersedia.`, `Active ${licenseDateLabel(data.access.activatedAt, locale)} through ${licenseDateLabel(data.access.expiresAt, locale)}, with ${scanCountLabel(data.access.creditRemaining, locale)} scans available.`),
        "success",
      );
    } catch (activationFailure) {
      const failure = activationFailure instanceof Error ? activationFailure.message : tx(en, "Lisensi tidak dapat diaktifkan.", "The license could not be activated.");
      setActivationError(failure);
      notify(tx(en, "Aktivasi gagal", "Activation failed"), failure, "error");
    } finally {
      setActivating(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (manualLimitError) {
      notify(tx(en, "Jumlah hasil belum valid", "Invalid result count"), manualLimitError, "error");
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
    notify(tx(en, "Scan dimulai", "Scan started"), tx(en, `${keyword} di ${areaLabel} sedang dipindai dengan batas ${resultLimitLabel(requestedLimit, en).toLocaleLowerCase(locale)}. Satu scan akan digunakan.`, `${keyword} in ${areaLabel} is being scanned with a limit of ${resultLimitLabel(requestedLimit, en).toLocaleLowerCase(locale)}. One scan will be used.`));
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
      if (!response.ok || !data.jobId) throw new Error(messageFrom(data, tx(en, "Scan tidak dapat dimulai.", "The scan could not be started.")));
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
        notify(tx(en, "Scan selesai", "Scan complete"), tx(en, `${nextJob.rows.length} data bisnis diterima dan siap difilter.`, `${nextJob.rows.length} business records received and ready to filter.`), "success", true);
      } else {
        notify(tx(en, "Scan diterima", "Scan accepted"), tx(en, "Pencarian sedang diproses. Hasil akan diperbarui otomatis.", "The search is being processed. Results will update automatically."));
      }
    } catch (submitError) {
      const failure = submitError instanceof Error ? submitError.message : tx(en, "Scan tidak dapat dimulai.", "The scan could not be started.");
      setError(failure);
      notify(tx(en, "Scan gagal dimulai", "Scan failed to start"), failure, "error");
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
      notify(tx(en, `${format} diunduh`, `${format} downloaded`), tx(en, `${records.length} baris dari filter aktif dimasukkan ke file.`, `${records.length} rows from the active filter were added to the file.`), "success");
    } catch (downloadError) {
      const detail = downloadError instanceof Error ? downloadError.message : tx(en, "File tidak dapat dibuat.", "The file could not be created.");
      notify(tx(en, "Unduhan gagal", "Download failed"), detail, "error");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section className="ms-console" id="scanner" aria-label={tx(en, "Konsol produksi", "Production console")}>
      <section className="license-dock" aria-labelledby="license-dock-title">
        <div className="license-dock__bar">
          <div className="license-dock__identity">
            <span id="license-dock-title">{tx(en, "Akses saat ini", "Current access")}</span>
            <strong>{api.access.label} · {scanCountLabel(api.access.creditRemaining, locale)}/{scanCountLabel(api.access.creditTotal, locale)} {tx(en, "scan tersisa", "scans remaining")}</strong>
            <div
              className="license-dock__credit"
              role="progressbar"
              aria-label={tx(en, "Jatah scan tersisa", "Remaining scan allowance")}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(creditPercent)}
            >
              <span style={{ width: `${creditPercent}%` }} />
            </div>
          </div>
          <div className="license-dock__actions">
            {api.access.tier === "free" ? <a className="license-dock__upgrade" href={ADMIN_WHATSAPP} target="_blank" rel="noreferrer">Upgrade ↗</a> : null}
            <button className="license-dock__toggle" type="button" onClick={toggleActivation} aria-expanded={activationOpen} aria-controls="activation-panel">
              {activationOpen ? tx(en, "Tutup aktivasi", "Close activation") : tx(en, "Aktivasi lisensi", "Activate license")}
            </button>
          </div>
        </div>

        <details className="license-details">
          <summary>{tx(en, "Detail lisensi", "License details")}</summary>
          <div className="license-details__body">
            <dl className="license-dock__facts">
              <div><dt>{tx(en, "Paket", "Plan")}</dt><dd>{api.access.label}</dd></div>
              <div><dt>{tx(en, "Aktivasi", "Activated")}</dt><dd>{api.access.activatedAt ? licenseDateLabel(api.access.activatedAt, locale) : tx(en, "Belum diaktifkan", "Not activated")}</dd></div>
              <div><dt>{tx(en, "Berakhir", "Expires")}</dt><dd>{api.access.expiresAt ? licenseDateLabel(api.access.expiresAt, locale) : "—"}</dd></div>
              <div><dt>{tx(en, "Scan tersisa", "Scans remaining")}</dt><dd>{scanCountLabel(api.access.creditRemaining, locale)} / {scanCountLabel(api.access.creditTotal, locale)}</dd></div>
            </dl>
            <button className="license-dock__check" type="button" onClick={checkLicense} disabled={licenseChecking} data-state={licenseChecking ? "loading" : "default"}>
              {licenseChecking ? tx(en, "Memeriksa", "Checking") : tx(en, "Perbarui status", "Refresh status")}
              {licenseChecking ? <span className="button__spinner" aria-hidden="true" /> : null}
            </button>
          </div>
        </details>

        {activationOpen ? (
          <form className="activation-panel" id="activation-panel" onSubmit={handleActivation}>
            <div className="activation-panel__copy">
              <p className="activation-panel__label">{tx(en, "Aktifkan lisensi", "Activate license")}</p>
              <h2>{tx(en, "Masukkan kode dari admin", "Enter the code from the admin")}</h2>
              <p>
                {tx(en, "Kode Pro atau Max berlaku dua bulan sejak berhasil diaktifkan. Setelah aktivasi, tier dan kedua tanggal di atas diperbarui otomatis.", "A Pro or Max code is valid for two months after successful activation. The plan and both dates above update automatically.")} {" "}
                <a href={ADMIN_WHATSAPP} target="_blank" rel="noreferrer" onClick={() => notify(tx(en, "WhatsApp admin dibuka", "Admin WhatsApp opened"), tx(en, "Lanjutkan pembelian lisensi pada percakapan baru.", "Continue the license purchase in the new conversation."))}>{tx(en, "Hubungi admin", "Contact admin")} ↗</a>
              </p>
            </div>
            <label className="activation-panel__field">
              <span>{tx(en, "Kode aktivasi", "Activation code")}</span>
              <input ref={activationRef} value={activationCode} onChange={(event) => setActivationCode(event.target.value.toUpperCase())} type="text" name="activation-code" placeholder="MSC1-PRO-…" autoComplete="off" spellCheck={false} aria-invalid={Boolean(activationError)} aria-describedby="activation-help" required />
              <small id="activation-help">{activationError || (api.activationAvailable ? tx(en, "Kode akan diperiksa saat aktivasi.", "The code will be checked during activation.") : tx(en, "Aktivasi belum disiapkan oleh admin.", "Activation has not been configured by the admin."))}</small>
            </label>
            <div className="activation-panel__actions">
              <button className="button button--activation" type="submit" disabled={activating || !api.activationAvailable} data-state={activating ? "loading" : "default"}>{activating ? tx(en, "Memverifikasi", "Verifying") : tx(en, "Aktifkan lisensi", "Activate license")}{activating ? <span className="button__spinner" aria-hidden="true" /> : null}</button>
              <button className="activation-panel__close" type="button" onClick={closeActivation}>{tx(en, "Tutup", "Close")}</button>
            </div>
          </form>
        ) : null}
      </section>

      <div className="scanner__console" aria-busy={submitting || active}>
        <header className="workspace-panel__head">
          <span>{tx(en, "Pencarian", "Search")}</span>
          <h2>{tx(en, "Rancang scan", "Build a scan")}</h2>
        </header>
        <div className="console__bar">
          <div className="console__identity">
            <span>{tx(en, "Scan baru", "New scan")}</span>
          </div>
          <div className="console__status">
            <p className="api-state" data-online={api.reachable} aria-live="polite"><span className="api-state__dot" aria-hidden="true" />{apiLabel}</p>
          </div>
        </div>

        <form className="scrape-form" onSubmit={handleSubmit}>
          <label className="field field--wide"><span>{tx(en, "Cari apa?", "What are you looking for?")}</span><input name="keyword" type="text" required maxLength={100} autoComplete="off" placeholder={tx(en, "Klinik gigi", "Dental clinic")} /><small className="field__hint">{tx(en, "Masukkan jenis bisnis atau layanan.", "Enter a business or service type.")}</small></label>
          <div className="field location-field">
            <label><span>{tx(en, "Di mana?", "Where?")}</span><input name="city" type="text" value={city} onChange={(event) => { setCity(event.target.value); setLocationState("idle"); }} required maxLength={100} autoComplete="address-level2" placeholder="Makassar" /></label>
            <button className="location-field__button" type="button" onClick={useCurrentLocation} disabled={locationState === "requesting"} data-state={locationState}>
              {locationState === "requesting" ? tx(en, "Membaca lokasi…", "Reading location…") : locationState === "ready" ? tx(en, "Lokasi digunakan", "Location applied") : tx(en, "Gunakan lokasi saya", "Use my location")}
            </button>
            <small className="field__hint">{tx(en, "Masukkan kota atau gunakan koordinat perangkat.", "Enter a city or use device coordinates.")}</small>
          </div>
          <div className="field"><SearchableCombobox locale={locale} label={tx(en, "Cakupan", "Coverage")} name="areaLevel" value={areaLevel} options={areaOptions} onChange={changeAreaLevel} onLockedOption={handleLockedArea} helper={api.access.allowsSubdistrict ? tx(en, "Pilih kota/kabupaten atau kecamatan.", "Choose city/regency or subdistrict.") : tx(en, "Kecamatan tersedia pada Pro dan Max.", "Subdistrict coverage is available on Pro and Max.")} searchPlaceholder={tx(en, "Cari cakupan", "Search coverage")} /></div>
          {areaLevel === "subdistrict" ? <label className="field field--wide"><span>{tx(en, "Kecamatan", "Subdistrict")}</span><input name="subdistrict" type="text" required maxLength={100} autoComplete="address-level3" /><small className="field__hint">{tx(en, "Masukkan nama kecamatan, lalu pastikan kota/kabupaten di atas sesuai.", "Enter the subdistrict name and confirm that the city/regency above is correct.")}</small></label> : null}
          {api.access.tier === "free" ? (
            <div className="field">
              <SearchableCombobox locale={locale} label={tx(en, "Jumlah hasil", "Result count")} name="limit" value={String(limit)} options={limitOptions} onChange={changeLimit} helper={tx(en, "Free: maksimal 10 bisnis per scan, dengan jeda 1 jam.", "Free: up to 10 businesses per scan, with a 1-hour cooldown.")} searchPlaceholder={tx(en, "Cari jumlah hasil", "Search result count")} />
            </div>
          ) : null}
          {api.access.tier !== "free" ? (
            <label className="field custom-limit field--wide">
              <span>{tx(en, "Jumlah hasil", "Result count")} · {api.access.label}</span>
              <input type="number" min="1" max={manualLimitMax} step="1" inputMode="numeric" value={manualLimit} onChange={(event) => setManualLimit(event.target.value)} placeholder={tx(en, `Masukkan 1–${manualLimitMax} hasil`, `Enter 1–${manualLimitMax} results`)} aria-label={tx(en, `Jumlah data manual untuk tier ${api.access.label}`, `Manual result count for ${api.access.label}`)} aria-invalid={Boolean(manualLimitError)} aria-describedby="manual-limit-help" required />
              <small className="field__hint" id="manual-limit-help">{manualLimitError || tx(en, `Maksimal ${manualLimitMax} bisnis per scan. Setiap pencarian memakai 1 scan.`, `Up to ${manualLimitMax} businesses per scan. Each search uses 1 scan.`)}</small>
            </label>
          ) : null}
          <details className="advanced-settings field--wide" open={advancedOpen} onToggle={(event) => setAdvancedOpen(event.currentTarget.open)}>
            <summary>{tx(en, "Pengaturan lanjutan", "Advanced settings")}</summary>
            <div className="advanced-settings__grid">
              <label className="field"><span>{tx(en, "Negara", "Country")}</span><input name="country" type="text" defaultValue="Indonesia" required maxLength={100} autoComplete="country-name" /><small className="field__hint">Default: Indonesia.</small></label>
              <label className="field"><span>{tx(en, "Bahasa", "Language")}</span><input name="lang" type="text" defaultValue={locale} minLength={2} maxLength={2} required /><small className="field__hint">{tx(en, "Default: Bahasa Indonesia.", "Default: English.")}</small></label>
            </div>
          </details>
          {challengeRequired && api.turnstileSiteKey ? (
            <div className="field field--wide turnstile-field">
              <span>{tx(en, "Verifikasi keamanan", "Security verification")}</span>
              <Turnstile key={turnstileNonce} siteKey={api.turnstileSiteKey} onToken={setTurnstileToken} locale={locale} />
              <small className="field__hint">{tx(en, "Selesaikan verifikasi sebelum menjalankan scan Free.", "Complete verification before running a Free scan.")}</small>
            </div>
          ) : null}
          <button className="button button--primary field--wide" type="submit" disabled={!canSubmit} data-state={submitting ? "loading" : error ? "error" : job?.status === "completed" ? "success" : "default"}>
            <span>{submitting ? tx(en, "Memulai scan", "Starting scan") : active ? tx(en, "Mencari bisnis", "Searching businesses") : !hasCredit ? tx(en, "Jatah scan habis", "No scans remaining") : remainingSeconds > 0 ? `${tx(en, "Tunggu", "Wait")} ${countdownLabel(remainingSeconds)}` : !api.reachable ? tx(en, "Layanan belum siap", "Service not ready") : job?.status === "completed" ? tx(en, "Scan wilayah baru", "Scan a new region") : error ? tx(en, "Coba lagi", "Try again") : tx(en, "Mulai scan", "Start scan")}</span>
            {submitting || active ? <span className="button__spinner" aria-hidden="true" /> : <span className="button__arrow" aria-hidden="true">↗</span>}
          </button>
        </form>

        <div className="feedback-panel" data-state={feedback.state} role="status" aria-live="polite" aria-atomic="true"><span className="feedback-panel__signal" aria-hidden="true" /><div><span className="feedback-panel__label">{tx(en, "Status scan", "Scan status")}</span><h2>{feedback.title}</h2><p>{feedback.detail}</p></div>{submitting || active || !api.checked ? <span className="feedback-panel__progress" aria-hidden="true" /> : null}</div>
      </div>

      <div className="results" id="results">
        <header className="workspace-panel__head workspace-panel__head--results">
          <span>{tx(en, "Hasil", "Results")}</span>
          <h2>{tx(en, "Hasil pencarian", "Search results")}</h2>
        </header>
        {sourceRows.length > 0 ? (
          <>
            <div className="results__head">
              <div><h3>{tx(en, "Dataset siap", "Dataset ready")}</h3><p>{tx(en, `${sourceRows.length} ${job?.keyword || "bisnis"} ditemukan → ${missingWebsiteCount} tidak punya website → ${contactableWithoutWebsiteCount} punya nomor.`, `${sourceRows.length} ${job?.keyword || "businesses"} found → ${missingWebsiteCount} without a website → ${contactableWithoutWebsiteCount} with a phone number.`)}</p></div>
              <div className="results__actions">
                <label className="results-search"><span>{tx(en, "Cari hasil", "Search results")}</span><input type="search" value={resultQuery} onChange={(event) => { setResultQuery(event.target.value); setResultPage(1); }} placeholder={tx(en, "Nama, alamat, atau kontak", "Name, address, or contact")} /></label>
                <SearchableCombobox locale={locale} label={tx(en, "Filter website", "Website filter")} value={websiteFilter} options={websiteOptions} onChange={changeWebsiteFilter} searchPlaceholder={tx(en, "Cari filter", "Search filters")} />
                <SearchableCombobox locale={locale} className="results-download-format" label={tx(en, "Format unduhan", "Download format")} value={downloadFormat} options={downloadOptions} onChange={(value) => setDownloadFormat(value as DownloadFormat)} searchPlaceholder={tx(en, "Cari format", "Search formats")} />
                <button className="button button--secondary button--export" type="button" onClick={downloadResults} disabled={visibleRows.length === 0 || downloading} data-state={downloading ? "loading" : "default"}>
                  <span>{downloading ? tx(en, "Membuat file", "Creating file") : `${tx(en, "Unduh", "Download")} ${downloadOptions.find((option) => option.value === downloadFormat)?.label || "file"}`}</span>
                  {downloading ? <span className="button__spinner" aria-hidden="true" /> : <DownloadIcon />}
                </button>
              </div>
            </div>

            <dl className="result-facts" aria-label={tx(en, "Ringkasan hasil", "Results summary")}><div><dt>{tx(en, "Diterima", "Received")}</dt><dd>{sourceRows.length}</dd></div><div><dt>{tx(en, "Tanpa website", "No website")}</dt><dd>{missingWebsiteCount}</dd></div><div><dt>{tx(en, "Punya nomor", "Has phone")}</dt><dd>{contactableWithoutWebsiteCount}</dd></div></dl>
            <p className="results__captured">{job?.fetchedAt ? tx(en, `Diambil ${new Intl.DateTimeFormat(languageTag(locale), { dateStyle: "medium", timeStyle: "short" }).format(new Date(job.fetchedAt))} · ${emailCount} baris memiliki email. ${completionLabel(job.completion, en)}`, `Captured ${new Intl.DateTimeFormat(languageTag(locale), { dateStyle: "medium", timeStyle: "short" }).format(new Date(job.fetchedAt))} · ${emailCount} rows include email. ${completionLabel(job.completion, en)}`) : null}</p>
            <p className="results__detail-note">{tx(en, "Data ditampilkan sesuai sumber. Kolom kosong tidak diisi dengan perkiraan.", "Data is shown as provided by the source. Empty fields are not filled with estimates.")}</p>
            {visibleRows.length === 0 ? <div className="results-empty"><h3>{tx(en, "Tidak ada bisnis pada filter ini.", "No businesses match this filter.")}</h3><p>{tx(en, "Ganti filter website untuk melihat hasil lain dari scan yang sama.", "Change the website filter to view other results from the same scan.")}</p></div> : null}

            {visibleRows.length > 0 ? (
              <div className="results-table-wrap">
                <table className="results-table">
                  <caption>{tx(en, "Daftar bisnis hasil scan Google Maps", "Businesses from the Google Maps scan")}</caption>
                  <thead>
                    <tr><th scope="col">No</th><th scope="col">{tx(en, "Bisnis", "Business")}</th><th scope="col">{tx(en, "Alamat", "Address")}</th><th scope="col">{tx(en, "Kontak", "Contact")}</th><th scope="col">Website</th><th scope="col">Rating</th><th scope="col">{tx(en, "Jumlah ulasan", "Review count")}</th><th scope="col">{tx(en, "Koordinat", "Coordinates")}</th><th scope="col">{tx(en, "Sumber", "Source")}</th></tr>
                  </thead>
                  <tbody>{pagedRows.map((row, index) => {
                    const sequence = pageStart + index + 1;
                    return <ScanResultRow key={`${row.business}-${row.address}-${sequence}`} row={row} sequence={sequence} locale={locale} />;
                  })}</tbody>
                </table>
              </div>
            ) : null}
            {visibleRows.length > RESULT_PAGE_SIZE ? <nav className="results-pagination" aria-label={tx(en, "Halaman hasil", "Result pages")}><p aria-live="polite"><strong>{pageStart + 1}—{Math.min(pageStart + RESULT_PAGE_SIZE, visibleRows.length)}</strong> {tx(en, "dari", "of")} {visibleRows.length}</p><div><button type="button" onClick={() => setResultPage((page) => Math.max(1, page - 1))} disabled={currentResultPage === 1}>{tx(en, "Sebelumnya", "Previous")}</button><span>{currentResultPage} / {totalResultPages}</span><button type="button" onClick={() => setResultPage((page) => Math.min(totalResultPages, page + 1))} disabled={currentResultPage === totalResultPages}>{tx(en, "Berikutnya", "Next")}</button></div></nav> : null}
          </>
        ) : (
          <div className="results-empty results-empty--initial">
            <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 14h32M8 24h20M8 34h14" /><circle cx="36" cy="32" r="6" /><path d="m40.5 36.5 4 4" /></svg>
            <div>
              <h2>{job?.status === "completed" ? tx(en, "Tidak ada hasil", "No results") : tx(en, "Belum ada hasil", "No results yet")}</h2>
              <p>{job?.status === "completed" ? tx(en, "Ubah niche atau perluas wilayah, lalu jalankan scan baru.", "Change the niche or expand the region, then run a new scan.") : tx(en, "Jalankan scan pertama untuk melihat data bisnis di sini.", "Run your first scan to see business data here.")}</p>
              {job?.downloadReady ? <a className="text-link" href={`/api/jobs/${job.id}/download`}>{tx(en, "Unduh file mentah", "Download raw file")} <span aria-hidden="true">↓</span></a> : null}
            </div>
          </div>
        )}
      </div>
      {toast ? (
        <div
          className="action-toast"
          data-tone={toast.tone}
          data-persistent={toast.persistent ? "true" : "false"}
          role={toast.tone === "error" || toast.persistent ? "alert" : "status"}
          aria-live={toast.tone === "error" || toast.persistent ? "assertive" : "polite"}
          aria-atomic="true"
        >
          <span className="action-toast__signal" aria-hidden="true" />
          <div className="action-toast__copy">
            {toast.persistent ? <span className="action-toast__eyebrow">{tx(en, "Hasil siap", "Results ready")}</span> : null}
            <strong>{toast.title}</strong>
            <p>{toast.detail}</p>
          </div>
          <button className="action-toast__close" type="button" onClick={dismissToast} aria-label={tx(en, "Tutup notifikasi", "Close notification")}>×</button>
          {toast.persistent ? (
            <button
              className="action-toast__view"
              type="button"
              onClick={() => {
                dismissToast();
                const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                document.getElementById("results")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
              }}
            >
              {tx(en, "Lihat hasil", "View results")} <span aria-hidden="true">↓</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
