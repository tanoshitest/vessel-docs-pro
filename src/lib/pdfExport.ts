/**
 * PDF Export utilities using pdf-lib.
 *
 * Loads a base template from /public/templates/ and stamps the inspection
 * data onto it at fixed (X, Y) coordinates. If the template is missing
 * (404), we fall back to a freshly created blank A4 page so the export
 * flow still works during development.
 *
 * NOTE: Coordinates below are placeholders — adjust them once the real
 * Vietnamese template PDFs are dropped into /public/templates/.
 */
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

export interface CustomerInfo {
  company: string;
  vessel: string;
  mmsi: string;
  date: string;
  jobNumber: string;
}

export interface Equipment {
  id: string;
  type: string;
  maker: string;
  model: string;
  serial: string;
}

export interface ServiceItem {
  id: string;
  description: string;
  quantity: string;
  unit: string;
}

export interface ReportData {
  customer: CustomerInfo;
  equipments: Equipment[];
  services: ServiceItem[];
}

/** Trigger a browser download from raw PDF bytes. */
function downloadBytes(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Load a template PDF, or return a fresh blank doc if it's missing. */
async function loadTemplateOrBlank(url: string): Promise<PDFDocument> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Template ${url} not found (${res.status})`);
    const buf = await res.arrayBuffer();
    return await PDFDocument.load(buf);
  } catch (err) {
    console.warn("[pdfExport] Falling back to blank PDF:", err);
    const doc = await PDFDocument.create();
    doc.addPage([595.28, 841.89]); // A4 portrait
    return doc;
  }
}

/** Draw a single line of text safely (skips empty strings). */
function drawLine(
  page: PDFPage,
  font: PDFFont,
  text: string | undefined,
  x: number,
  y: number,
  size = 11,
) {
  if (!text) return;
  page.drawText(String(text), {
    x,
    y,
    size,
    font,
    color: rgb(0, 0, 0),
  });
}

/**
 * Export "Biên Bản Kiểm Tra" — radio equipment inspection record.
 * Uses /templates/bb_kiemtra.pdf as the base.
 */
export async function exportBienBanKiemTra(data: ReportData) {
  const pdfDoc = await loadTemplateOrBlank("/templates/bb_kiemtra.pdf");
  // pdf-lib does not embed Unicode glyphs from StandardFonts; for production
  // with full Vietnamese diacritics, embed a TTF (e.g. Roboto) via fontkit.
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.getPages()[0];
  const { height } = page.getSize();

  // Adjust coordinates based on actual PDF template
  drawLine(page, font, data.customer.company, 150, height - 140, 11);
  drawLine(page, font, data.customer.vessel, 150, height - 165, 11);
  drawLine(page, font, data.customer.mmsi, 150, height - 190, 11);
  drawLine(page, font, data.customer.date, 420, height - 140, 11);
  drawLine(page, font, data.customer.jobNumber, 420, height - 165, 11);

  // Equipment table — one row per equipment item.
  // Adjust coordinates based on actual PDF template
  const tableTop = height - 280;
  const rowHeight = 22;
  data.equipments.forEach((eq, i) => {
    const y = tableTop - i * rowHeight;
    drawLine(page, font, String(i + 1), 55, y, 10);
    drawLine(page, font, eq.type, 90, y, 10);
    drawLine(page, font, `${eq.maker}/${eq.model}`, 200, y, 10);
    drawLine(page, font, eq.serial, 380, y, 10);
  });

  const bytes = await pdfDoc.save();
  downloadBytes(bytes, `BienBanKiemTra_${data.customer.jobNumber.replace(/\//g, "-")}.pdf`);
}

/**
 * Export "Biên Bản Nghiệm Thu" — service acceptance record.
 * Uses /templates/bb_nghiemthu.pdf as the base.
 */
export async function exportBienBanNghiemThu(data: ReportData) {
  const pdfDoc = await loadTemplateOrBlank("/templates/bb_nghiemthu.pdf");
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.getPages()[0];
  const { height } = page.getSize();

  // Adjust coordinates based on actual PDF template
  drawLine(page, font, data.customer.company, 150, height - 140, 11);
  drawLine(page, font, data.customer.vessel, 150, height - 165, 11);
  drawLine(page, font, data.customer.date, 420, height - 140, 11);
  drawLine(page, font, data.customer.jobNumber, 420, height - 165, 11);

  // Services table — one row per service line.
  // Adjust coordinates based on actual PDF template
  const tableTop = height - 280;
  const rowHeight = 24;
  data.services.forEach((s, i) => {
    const y = tableTop - i * rowHeight;
    drawLine(page, font, String(i + 1), 55, y, 10);
    drawLine(page, font, s.description, 90, y, 10);
    drawLine(page, font, s.quantity, 420, y, 10);
    drawLine(page, font, s.unit, 470, y, 10);
  });

  const bytes = await pdfDoc.save();
  downloadBytes(bytes, `BienBanNghiemThu_${data.customer.jobNumber.replace(/\//g, "-")}.pdf`);
}
