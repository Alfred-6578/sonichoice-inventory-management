"use client";

import { useRef, useState } from "react";
import {
  X,
  UploadCloud,
  Sheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Sparkles,
  ChevronDown,
  Store,
} from "lucide-react";
import { Syne } from "next/font/google";
import {
  downloadTemplate,
  TemplateColumn,
  BulkUploadResponse,
  ACCEPTED_EXTENSIONS,
  MAX_UPLOAD_MB,
} from "@/lib/bulk-upload";

const syne = Syne({ variable: "--font-syne", subsets: ["latin"] });

type BulkUploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  columns: TemplateColumn[];
  templateFilename: string;
  onUpload: (file: File) => Promise<BulkUploadResponse>;
  /** Called after an upload that created at least one record — refetch the list. */
  onSuccess?: () => void;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const CONFIDENCE_STYLES: Record<string, string> = {
  high: "bg-delivered-bg text-green-900 border-delivered-border",
  medium: "bg-amber-muted text-amber-700 border-amber-border",
  low: "bg-surface text-ink-muted border-border",
};

/* Collapsible result block — counts stay visible, detail is opt-in. */
function ResultSection({
  icon,
  label,
  count,
  tone,
  defaultOpen = false,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  tone: "green" | "amber" | "red" | "neutral";
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (count === 0) return null;

  const tones = {
    green: "text-delivered",
    amber: "text-amber-600",
    red: "text-red-600",
    neutral: "text-ink-muted",
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-surface hover:bg-gray-100 transition text-left"
      >
        <span className={`shrink-0 ${tones[tone]}`}>{icon}</span>
        <span className="text-xs font-medium text-ink flex-1">
          {label}
          <span className="text-ink-subtle font-mono ml-1.5">({count})</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-ink-subtle transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="max-h-52 overflow-y-auto divide-y divide-border border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
}

export default function BulkUploadModal({
  isOpen,
  onClose,
  title,
  subtitle,
  columns,
  templateFilename,
  onUpload,
  onSuccess,
}: BulkUploadModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BulkUploadResponse | null>(null);

  if (!isOpen) return null;

  const pickFile = (picked: File | undefined) => {
    if (!picked) return;

    const ext = picked.name.slice(picked.name.lastIndexOf(".")).toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setError(`Unsupported file type. Use ${ACCEPTED_EXTENSIONS.join(" or ")}.`);
      return;
    }
    if (picked.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setError(
        `File is too large (${formatSize(picked.size)}). Maximum ${MAX_UPLOAD_MB} MB.`
      );
      return;
    }

    setError("");
    setFile(picked);
  };

  const reset = () => {
    setFile(null);
    setError("");
    setResult(null);
    setUploading(false);
    setDragActive(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClose = () => {
    if (uploading) return;
    reset();
    onClose();
  };

  const handleTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      await downloadTemplate(templateFilename, columns);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to build template");
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await onUpload(file);
      setResult(res);
      if (res.data?.created > 0) onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const summary = result?.data;
  const aiSummary = result?.ai_summary;
  const merchantMatches = Object.entries(result?.merchant_matches || {});

  return (
    <>
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[80]"
        onClick={handleClose}
      />
      <div className="fixed inset-0 z-[81] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl border border-border shadow-2xl flex flex-col w-full max-w-[95%] sm:max-w-[560px] max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="px-6 py-4 border-b border-border flex items-center gap-3 shrink-0">
            <div className="flex-1 min-w-0">
              <div className={`text-lg font-bold text-ink ${syne.className}`}>
                {title}
              </div>
              {subtitle && (
                <div className="text-xs text-ink-subtle mt-0.5">{subtitle}</div>
              )}
            </div>

            <button
              onClick={handleClose}
              disabled={uploading}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-subtle hover:bg-surface transition shrink-0 disabled:opacity-40"
            >
              <X size={18} />
            </button>
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {uploading ? (
              /* ── ANALYSING ── */
              <div className="py-10 text-center">
                <div className="relative w-14 h-14 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-2 border-amber/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-amber border-t-transparent animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-amber" />
                </div>
                <div className="text-sm font-medium text-ink">
                  AI is analyzing your spreadsheet...
                </div>
                <div className="text-xs text-ink-subtle mt-1.5">
                  This usually takes 10–60 seconds. Please keep this window open.
                </div>
                {file && (
                  <div className="text-[11px] text-ink-subtle font-mono mt-3">
                    {file.name} · {formatSize(file.size)}
                  </div>
                )}
              </div>
            ) : result ? (
              /* ── RESULT ── */
              <div className="space-y-4">
                {/* Stat tiles */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-delivered-border bg-delivered-bg px-3 py-2.5">
                    <div className="text-xl font-bold text-green-900 leading-none">
                      {summary?.created ?? 0}
                    </div>
                    <div className="text-[10px] text-green-900/70 font-mono uppercase tracking-wider mt-1">
                      Created
                    </div>
                  </div>
                  <div className="rounded-lg border border-amber-border bg-amber-muted px-3 py-2.5">
                    <div className="text-xl font-bold text-amber-700 leading-none">
                      {summary?.skipped ?? 0}
                    </div>
                    <div className="text-[10px] text-amber-700/70 font-mono uppercase tracking-wider mt-1">
                      Skipped
                    </div>
                  </div>
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                    <div className="text-xl font-bold text-red-700 leading-none">
                      {summary?.errors ?? 0}
                    </div>
                    <div className="text-[10px] text-red-700/70 font-mono uppercase tracking-wider mt-1">
                      Errors
                    </div>
                  </div>
                </div>

                {/* AI summary line */}
                {aiSummary && (
                  <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-surface border border-border">
                    <Sparkles className="w-3.5 h-3.5 text-amber shrink-0 mt-0.5" />
                    <div className="text-[11px] text-ink-muted leading-relaxed">
                      {aiSummary.total_rows} row
                      {aiSummary.total_rows !== 1 ? "s" : ""} processed
                      {aiSummary.new_merchants > 0 &&
                        ` · ${aiSummary.new_merchants} new merchant${
                          aiSummary.new_merchants !== 1 ? "s" : ""
                        } created`}
                      {aiSummary.duplicates > 0 &&
                        ` · ${aiSummary.duplicates} duplicate${
                          aiSummary.duplicates !== 1 ? "s" : ""
                        }`}
                      {aiSummary.unmatched_branches > 0 &&
                        ` · ${aiSummary.unmatched_branches} unmatched branch${
                          aiSummary.unmatched_branches !== 1 ? "es" : ""
                        }`}
                    </div>
                  </div>
                )}

                {/* Errors — opened by default, they need action */}
                <ResultSection
                  icon={<XCircle className="w-3.5 h-3.5" />}
                  label="Failed rows"
                  count={result.errors?.length ?? 0}
                  tone="red"
                  defaultOpen
                >
                  {(result.errors || []).map((e, i) => (
                    <div key={`${e.name}-${i}`} className="px-3 py-2">
                      <div className="text-xs font-medium text-ink truncate">
                        {e.name}
                      </div>
                      <div className="text-[11px] text-red-600 leading-snug mt-0.5">
                        {e.error}
                      </div>
                    </div>
                  ))}
                </ResultSection>

                {/* Skipped duplicates */}
                <ResultSection
                  icon={<AlertTriangle className="w-3.5 h-3.5" />}
                  label="Skipped as duplicates"
                  count={result.skipped_duplicates?.length ?? 0}
                  tone="amber"
                  defaultOpen
                >
                  {(result.skipped_duplicates || []).map((d, i) => (
                    <div key={`${d.name}-${i}`} className="px-3 py-2">
                      <div className="text-xs font-medium text-ink truncate">
                        {d.name}
                      </div>
                      <div className="text-[11px] text-ink-muted leading-snug mt-0.5">
                        {d.reason}
                      </div>
                    </div>
                  ))}
                </ResultSection>

                {/* Merchant matching */}
                <ResultSection
                  icon={<Store className="w-3.5 h-3.5" />}
                  label="Merchant matching"
                  count={merchantMatches.length}
                  tone="neutral"
                >
                  {merchantMatches.map(([input, match]) => (
                    <div
                      key={input}
                      className="px-3 py-2 flex items-center gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-ink truncate">
                          {input}
                          {match.matched_name &&
                            match.matched_name !== input && (
                              <span className="text-ink-subtle">
                                {" → "}
                                {match.matched_name}
                              </span>
                            )}
                        </div>
                      </div>
                      {match.is_new && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-delivered-border bg-delivered-bg text-green-900 shrink-0">
                          New
                        </span>
                      )}
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                          CONFIDENCE_STYLES[match.confidence] ||
                          CONFIDENCE_STYLES.low
                        }`}
                      >
                        {match.confidence}
                      </span>
                    </div>
                  ))}
                </ResultSection>

                {/* Created products */}
                <ResultSection
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  label="Created products"
                  count={result.created_products?.length ?? 0}
                  tone="green"
                >
                  {(result.created_products || []).map((p) => {
                    const units = (p.stocks || []).reduce(
                      (sum, s) => sum + (s.quantity ?? 0),
                      0
                    );
                    const branches = (p.stocks || [])
                      .map((s) => s.branch?.name)
                      .filter(Boolean)
                      .join(", ");

                    return (
                      <div key={p.id} className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-ink truncate">
                              {p.name}
                            </div>
                            <div className="text-[10px] text-ink-subtle truncate mt-0.5">
                              {[p.merchant?.name, branches]
                                .filter(Boolean)
                                .join(" · ")}
                            </div>
                          </div>
                          <span className="text-[11px] font-mono font-bold text-ink shrink-0">
                            {units}
                          </span>
                        </div>
                        {p.trackingId && (
                          <div className="text-[9px] font-mono text-ink-subtle mt-0.5">
                            {p.trackingId}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </ResultSection>
              </div>
            ) : (
              <>
                {/* ── DROPZONE / SELECTED FILE ── */}
                {file ? (
                  <div className="flex items-center gap-3 px-4 py-3 border border-amber bg-amber/5 rounded-lg">
                    <div className="w-9 h-9 rounded-lg bg-white border border-border flex items-center justify-center shrink-0">
                      <Sheet className="w-4 h-4 text-delivered" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-ink truncate">
                        {file.name}
                      </div>
                      <div className="text-[11px] text-ink-subtle font-mono">
                        {formatSize(file.size)}
                      </div>
                    </div>
                    <button
                      onClick={reset}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-ink-subtle hover:bg-white hover:text-red-500 transition shrink-0"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      pickFile(e.dataTransfer.files?.[0]);
                    }}
                    onClick={() => inputRef.current?.click()}
                    className={`border border-dashed rounded-lg px-6 py-9 text-center cursor-pointer transition ${
                      dragActive
                        ? "border-amber bg-amber/5"
                        : "border-border-strong hover:border-amber hover:bg-surface"
                    }`}
                  >
                    <UploadCloud
                      className={`w-8 h-8 mx-auto mb-3 ${
                        dragActive ? "text-amber" : "text-ink-subtle"
                      }`}
                    />
                    <div className="text-sm text-ink font-medium">
                      Drag and drop your spreadsheet here
                    </div>
                    <div className="text-xs text-ink-subtle mt-1">
                      or{" "}
                      <span className="text-amber-600 font-medium underline">
                        browse your files
                      </span>
                    </div>
                    <div className="text-[10px] text-ink-subtle font-mono mt-3">
                      {ACCEPTED_EXTENSIONS.join(" · ")} · max {MAX_UPLOAD_MB} MB
                    </div>
                  </div>
                )}

                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED_EXTENSIONS.join(",")}
                  className="hidden"
                  onChange={(e) => pickFile(e.target.files?.[0])}
                />

                {/* ── COLUMN GUIDANCE ── */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-muted border-b border-amber-border">
                    <Sparkles className="w-3.5 h-3.5 text-amber shrink-0 mt-0.5" />
                    <div className="text-[11px] text-ink-muted leading-relaxed">
                      Column headers are detected automatically — they don&apos;t
                      need exact names, and order doesn&apos;t matter. Merchants and
                      branches are matched by name, and unknown merchants are
                      created for you.
                    </div>
                  </div>

                  <div className="divide-y divide-border">
                    {columns.map((c) => (
                      <div
                        key={c.header}
                        className="px-3 py-2 flex items-baseline gap-3"
                      >
                        <div className="w-28 shrink-0 text-[11px] font-medium text-ink">
                          {c.header}
                          {c.required && (
                            <span className="text-red-500 ml-0.5">*</span>
                          )}
                        </div>
                        {c.aliases && c.aliases.length > 0 && (
                          <div className="text-[10px] font-mono text-ink-subtle leading-relaxed min-w-0">
                            {c.aliases.join(", ")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="px-3 py-2 bg-surface border-t border-border text-[10px] text-ink-subtle">
                    <span className="text-red-500">*</span> Product name is the
                    only required column. Everything else is optional.
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="px-6 py-3 border-t border-border flex items-center justify-between gap-3 shrink-0">
            {result ? (
              <>
                <button
                  onClick={reset}
                  className="px-4 py-1.5 text-xs border border-border rounded-lg text-ink-muted hover:bg-surface transition"
                >
                  Upload another
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-1.5 text-xs font-bold bg-ink text-white rounded-lg hover:bg-gray-800 transition"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleTemplate}
                  disabled={downloadingTemplate || uploading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 transition disabled:opacity-50"
                >
                  <Download size={13} />
                  {downloadingTemplate ? "Building..." : "Download template"}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClose}
                    disabled={uploading}
                    className="px-4 py-1.5 text-xs border border-border rounded-lg text-ink-muted hover:bg-surface transition disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                      !file || uploading
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-ink text-white hover:bg-gray-800"
                    }`}
                  >
                    <UploadCloud size={13} />
                    {uploading ? "Analyzing..." : "Upload"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
