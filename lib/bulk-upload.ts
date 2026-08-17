import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Describes one system field of an import sheet. The backend auto-detects column
// headers, so `aliases` documents the accepted variations rather than enforcing
// them — `header` is only what the generated template writes.
export type TemplateColumn = {
  header: string;
  required?: boolean;
  aliases?: string[];
  example?: string;
  width?: number;
};

export type MerchantMatch = {
  matched_id: string | null;
  matched_name: string | null;
  confidence: "high" | "medium" | "low";
  is_new: boolean;
};

export type CreatedProduct = {
  id: string;
  trackingId?: string;
  name: string;
  merchant?: { id: string; name: string } | null;
  stocks?: {
    branch?: { id: string; name: string } | null;
    quantity: number;
  }[];
};

// Response shape of POST /products/bulk-upload. Note the two different `errors`:
// `data.errors` is a count, the top-level `errors` is the detail list.
export type BulkUploadResponse = {
  message?: string;
  data: {
    created: number;
    skipped: number;
    errors: number;
    total_processed: number;
  };
  created_products?: CreatedProduct[];
  skipped_duplicates?: { name: string; reason: string }[];
  errors?: { name: string; error: string }[];
  ai_summary?: {
    total_rows: number;
    new_products: number;
    duplicates: number;
    new_merchants: number;
    unmatched_branches: number;
  };
  merchant_matches?: Record<string, MerchantMatch>;
};

export const ACCEPTED_EXTENSIONS = [".xlsx", ".xls"];
export const MAX_UPLOAD_MB = 10;

// Builds a styled .xlsx with the canonical header row plus one greyed-out example
// row. Headers are auto-detected server-side, so this is a convenience starting
// point rather than a required format.
export async function downloadTemplate(
  filename: string,
  columns: TemplateColumn[]
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sonichoice";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Template");

  const headerRow = sheet.addRow(
    columns.map((c) => (c.required ? `${c.header} *` : c.header))
  );
  headerRow.eachCell((cell) => {
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF111827" } };
    cell.alignment = { vertical: "middle", horizontal: "left" };
    cell.border = { bottom: { style: "thin", color: { argb: "FFE4E7EC" } } };
  });
  headerRow.height = 28;

  columns.forEach((col, i) => {
    sheet.getColumn(i + 1).width = col.width || 22;
  });

  if (columns.some((c) => c.example)) {
    const exampleRow = sheet.addRow(columns.map((c) => c.example ?? ""));
    exampleRow.eachCell((cell) => {
      cell.font = { name: "Calibri", size: 9, italic: true, color: { argb: "FF9CA3AF" } };
      cell.alignment = { vertical: "middle" };
    });
    exampleRow.height = 20;
  }

  // Keep the header visible while filling in long sheets
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${filename}.xlsx`
  );
}
