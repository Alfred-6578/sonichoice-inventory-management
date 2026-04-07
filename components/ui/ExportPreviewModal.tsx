"use client";

import { useState } from "react";
import { X, FileText, Sheet } from "lucide-react";
import { Syne } from "next/font/google";
import { ExportConfig, downloadPDF, downloadExcel } from "@/lib/export";

const syne = Syne({ variable: "--font-syne", subsets: ["latin"] });

interface ExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ExportConfig;
}

const PREVIEW_ROWS = 20;

export default function ExportPreviewModal({ isOpen, onClose, config }: ExportPreviewModalProps) {
  const [exporting, setExporting] = useState(false);

  if (!isOpen) return null;

  const previewRows = config.rows.slice(0, PREVIEW_ROWS);
  const hasMore = config.rows.length > PREVIEW_ROWS;

  const handleExport = async (format: "pdf" | "excel") => {
    setExporting(true);
    try {
      if (format === "pdf") {
        downloadPDF(config);
      } else {
        await downloadExcel(config);
      }
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[80]" onClick={onClose} />
      <div className="fixed inset-0 z-[81] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl border border-border shadow-2xl flex flex-col w-full max-w-[95%] xl:max-w-[85%] max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center gap-3 shrink-0">
            <div className="flex-1 min-w-0">
              <div className={`text-lg font-bold text-ink ${syne.className}`}>
                Export Preview
              </div>
              <div className="text-xs text-ink-subtle mt-0.5">
                {config.title} · {config.rows.length} record{config.rows.length !== 1 ? "s" : ""}
                {config.subtitle ? ` · ${config.subtitle}` : ""}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-subtle hover:bg-surface transition shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* Preview Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse min-w-max">
              <thead className="sticky top-0">
                <tr className="bg-[#111827]">
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold text-white uppercase tracking-wider w-10">
                    #
                  </th>
                  {config.columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-3 py-2.5 text-left text-[10px] font-bold text-white uppercase tracking-wider"
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-gray-100 ${idx % 2 === 1 ? "bg-gray-50/50" : ""} hover:bg-gray-50`}
                  >
                    <td className="px-3 py-2 text-[10px] font-mono text-ink-subtle">
                      {idx + 1}
                    </td>
                    {config.columns.map((col) => (
                      <td key={col.key} className="px-3 py-2 text-[11px] text-ink">
                        {String(row[col.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
                {hasMore && (
                  <tr>
                    <td
                      colSpan={config.columns.length + 1}
                      className="px-3 py-3 text-center text-xs text-ink-subtle"
                    >
                      ... and {config.rows.length - PREVIEW_ROWS} more rows (will be included in export)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-amber flex items-center justify-center text-ink text-[9px] font-bold">
                S
              </div>
              <span className="text-[10px] text-ink-subtle font-mono">
                SONICHOICE · {new Date().toLocaleDateString("en-GB")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs border border-border rounded-lg text-ink-muted hover:bg-surface transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExport("excel")}
                disabled={exporting}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold border border-green-300 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition disabled:opacity-50"
              >
                <Sheet size={13} />
                Export Excel
              </button>
              <button
                onClick={() => handleExport("pdf")}
                disabled={exporting}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-ink text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
              >
                <FileText size={13} />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
