// src/lib/pdf.ts
import { PDFDocument, StandardFonts } from "pdf-lib";

export interface Marker {
  id: string;
  panel_id: string;
  value: number;
  normal_low: number;
  normal_high: number;
  unit: string;
  marker: string;
  status: string;
}
export interface Panel {
  id: string;
  name: string;
}
export interface BuildPdfArgs {
  userName:  string;
  userEmail: string;
  panels:    Panel[];
  markers:   Marker[];
  insights:  string;
}

export async function buildPdf({
  userName,
  userEmail,
  panels,
  markers,
  insights,
}: BuildPdfArgs): Promise<Buffer> {
  // 1) Create document & embed built-in Helvetica
  const pdfDoc = await PDFDocument.create();
  const font   = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // 2) Layout constants
  const pageWidth  = 612;
  const pageHeight = 792;
  const margin     = 40;
  const fontSize   = 12;
  const maxWidth   = pageWidth - margin * 2;

  // 3) Start on page 1
  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let cursorY = pageHeight - margin;

  // 4) Simple word-wrap helper
  function wrapParagraph(text: string): string[] {
    const lines: string[] = [];
    const words = text.split(" ");
    let line = "";

    for (const word of words) {
      const testLine = line ? line + " " + word : word;
      const w = font.widthOfTextAtSize(testLine, fontSize);
      if (w <= maxWidth) {
        line = testLine;
      } else {
        if (line) lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  // 5) Draw a block of text (with manual wrapping & auto-new-page)
  function drawBlock(
    text: string,
    opts: { size?: number; indent?: number } = {}
  ) {
    const size   = opts.size   ?? fontSize;
    const indent = opts.indent ?? 0;
    const lh     = size * 1.2;
    const blockWidth = maxWidth - indent;

    // split into logical paragraphs on "\n"
    const paragraphs = text.split("\n");
    for (const para of paragraphs) {
      const lines = wrapParagraph(para);
      for (const l of lines) {
        if (cursorY - lh < margin) {
          page    = pdfDoc.addPage([pageWidth, pageHeight]);
          cursorY = pageHeight - margin;
        }
        page.drawText(l, {
          x: margin + indent,
          y: cursorY,
          size,
          font,
          maxWidth: blockWidth,
          lineHeight: lh,
        });
        cursorY -= lh;
      }
      // after each paragraph, add a blank line
      cursorY -= lh;
    }
  }

  // 6) Build the PDF content

  drawBlock("Optima Insights AI", { size: 22 });
  drawBlock("", { size: fontSize });

  drawBlock(`Name:  ${userName}`);
  drawBlock(`Email: ${userEmail}`);
  drawBlock("", { size: fontSize });

  for (const panel of panels) {
    drawBlock(panel.name, { size: 14 });
    drawBlock(
      markers
        .filter((m) => m.panel_id === panel.id)
        .map(
          (m) =>
            `• ${m.marker}: ${m.value} ${m.unit} ` +
            `(norm ${m.normal_low}–${m.normal_high}) — ${m.status}`
        )
        .join("\n"),
      { indent: 10 }
    );
    drawBlock("", { size: fontSize });
  }

  // new page for insights
  page = pdfDoc.addPage([pageWidth, pageHeight]);
  cursorY = pageHeight - margin;
  drawBlock("AI Insights", { size: 16 });
  drawBlock(insights);

  // 7) Finish and return
  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
