// lib/pdf.ts
import PDFDocument from "pdfkit";
import { Readable } from "stream";

// A helper to collect the PDF into a Buffer
function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

/**
 * Builds a simple PDF report for the given result IDs.
 * You can extend this to query your `results`/`insights` tables and
 * render detailed tables, charts, etc.
 */
import { PassThrough } from "stream";

export async function buildPdf(resultIds: string[]): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 50 });
  const stream = new PassThrough();

  doc.pipe(stream);

  doc.fontSize(20).text("Lab Results Report", { align: "center" });
  doc.moveDown();

  // For each result ID, add a heading.
  // In a real app you'd fetch result data from your DB.
  resultIds.forEach((id, idx) => {
    doc.fontSize(14).text(`Result #${idx + 1}`, { underline: true });
    doc.fontSize(12).text(`• Result ID: ${id}`);
    doc.moveDown();
  });

  doc.end();
  return streamToBuffer(stream);
}
