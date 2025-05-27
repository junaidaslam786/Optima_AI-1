import PDFDocument from "pdfkit";
import { PassThrough } from "stream";
import path from "path";

export async function buildPdf(resultIds: string[]): Promise<Buffer> {
  // 1) resolve your font file
  const fontPath = path.join(process.cwd(), "public", "fonts", "Helvetica.ttf");

  // 2) pass it into the constructor as `font`
  const doc = new PDFDocument({
    margin: 50,
    font: fontPath,          // ← this makes OpenSans your default
  });

  // 3) pipe & build as usual
  const stream = new PassThrough();
  doc.pipe(stream);

  // now you can call `doc.fontSize(...).text(...)` etc.
  // no more Helvetica.afm errors.

  doc
    .fontSize(18)
    .text("Your Personalized Insights", { underline: true });

  // … your panels / bullets logic …

  doc.end();

  // collect the Buffer
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}