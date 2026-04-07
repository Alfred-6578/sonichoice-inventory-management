import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export type ExportColumn = {
  header: string;
  key: string;
  width?: number;
};

export type ExportConfig = {
  title: string;
  subtitle?: string;
  columns: ExportColumn[];
  rows: Record<string, string | number>[];
  filename: string;
};

const BRAND_COLOR: [number, number, number] = [245, 158, 11]; // amber
const DARK: [number, number, number] = [17, 24, 39];
const GRAY: [number, number, number] = [156, 163, 175];
const LIGHT_BG: [number, number, number] = [249, 250, 251];

// ── PDF ──

export function generatePDF(config: ExportConfig): jsPDF {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header bar
  doc.setFillColor(...DARK);
  doc.rect(0, 0, pageWidth, 18, "F");

  // Logo text
  doc.setFontSize(14);
  doc.setTextColor(245, 158, 11);
  doc.setFont("helvetica", "bold");
  doc.text("SONICHOICE", 12, 11);

  // Date on right
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.text(`Generated: ${dateStr}`, pageWidth - 12, 11, { align: "right" });

  // Title
  doc.setFontSize(18);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.text(config.title, 12, 30);

  // Subtitle
  if (config.subtitle) {
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "normal");
    doc.text(config.subtitle, 12, 36);
  }

  // Table
  const headers = config.columns.map((c) => c.header);
  const body = config.rows.map((row) =>
    config.columns.map((c) => String(row[c.key] ?? ""))
  );

  autoTable(doc, {
    head: [headers],
    body,
    startY: config.subtitle ? 42 : 36,
    margin: { left: 12, right: 12 },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: DARK,
      lineColor: [229, 231, 235],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: DARK,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    alternateRowStyles: {
      fillColor: LIGHT_BG,
    },
    didDrawPage: () => {
      // Footer
      const pageNum = (doc as any).internal.getCurrentPageInfo().pageNumber;
      doc.setFontSize(7);
      doc.setTextColor(...GRAY);
      doc.text(
        `Sonichoice · ${config.title} · Page ${pageNum}`,
        pageWidth / 2,
        pageHeight - 6,
        { align: "center" }
      );
    },
  });

  return doc;
}

export function downloadPDF(config: ExportConfig) {
  const doc = generatePDF(config);
  doc.save(`${config.filename}.pdf`);
}

// ── Excel ──

export async function downloadExcel(config: ExportConfig) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sonichoice";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(config.title, {
    views: [{ showGridLines: false }],
  });

  // Title row
  const titleRow = sheet.addRow([config.title]);
  titleRow.font = { name: "Calibri", size: 16, bold: true, color: { argb: "FF111827" } };
  titleRow.height = 30;
  sheet.mergeCells(1, 1, 1, config.columns.length);

  // Subtitle row
  if (config.subtitle) {
    const subRow = sheet.addRow([config.subtitle]);
    subRow.font = { name: "Calibri", size: 10, color: { argb: "FF9CA3AF" } };
    sheet.mergeCells(2, 1, 2, config.columns.length);
  }

  // Date row
  const dateRow = sheet.addRow([
    `Generated: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`,
  ]);
  dateRow.font = { name: "Calibri", size: 9, color: { argb: "FF9CA3AF" } };
  sheet.mergeCells(dateRow.number, 1, dateRow.number, config.columns.length);

  // Spacer
  sheet.addRow([]);

  // Header row
  const headerRow = sheet.addRow(config.columns.map((c) => c.header));
  headerRow.eachCell((cell) => {
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF111827" } };
    cell.alignment = { vertical: "middle", horizontal: "left" };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FFE4E7EC" } },
    };
  });
  headerRow.height = 28;

  // Column widths
  config.columns.forEach((col, i) => {
    sheet.getColumn(i + 1).width = col.width || 18;
  });

  // Data rows
  config.rows.forEach((row, idx) => {
    const dataRow = sheet.addRow(config.columns.map((c) => row[c.key] ?? ""));
    dataRow.eachCell((cell) => {
      cell.font = { name: "Calibri", size: 9, color: { argb: "FF374151" } };
      cell.alignment = { vertical: "middle" };
      if (idx % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } };
      }
      cell.border = {
        bottom: { style: "hair", color: { argb: "FFE4E7EC" } },
      };
    });
    dataRow.height = 22;
  });

  // Footer
  sheet.addRow([]);
  const footerRow = sheet.addRow([`Sonichoice · ${config.rows.length} records`]);
  footerRow.font = { name: "Calibri", size: 8, italic: true, color: { argb: "FF9CA3AF" } };
  sheet.mergeCells(footerRow.number, 1, footerRow.number, config.columns.length);

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${config.filename}.xlsx`);
}
