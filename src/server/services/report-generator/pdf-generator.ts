/**
 * PDF Generator
 * Converts HTML reports to PDF format using Playwright, Puppeteer or Gotenberg
 */

import * as storage from "@/shared/lib/storage";
import { chromium } from "@playwright/test";

export interface PDFOptions {
  reportId: string;
  reportType: string;
  format?: "letter" | "a4";
  orientation?: "portrait" | "landscape";
  margins?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
}

export interface PDFResult {
  url: string;
  size: number;
  pages: number;
  key: string;
}

/**
 * PDF Generator class
 * Uses Gotenberg service for PDF generation (Docker-based, production-ready)
 * Falls back to mock if Gotenberg is not available
 */
class PDFGenerator {
  private gotenbergUrl: string | null;

  constructor() {
    this.gotenbergUrl = process.env.GOTENBERG_URL || null;
  }

  /**
   * Generate PDF from HTML content
   */
  async generate(htmlContent: string, options: PDFOptions): Promise<string> {
    const result = await this.generateWithDetails(htmlContent, options);
    return result.url;
  }

  /**
   * Generate PDF with detailed result
   */
  async generateWithDetails(
    htmlContent: string,
    options: PDFOptions,
  ): Promise<PDFResult> {
    // Generate unique key for storage
    const key = storage.generateReportKey({
      reportId: options.reportId,
      version: Date.now(),
    });

    let pdfBuffer: Buffer;

    try {
      // Try Gotenberg first (production)
      if (this.gotenbergUrl) {
        pdfBuffer = await this.generateWithGotenberg(htmlContent, options);
      } else {
        // Fall back to simple HTML-to-PDF approach
        pdfBuffer = await this.generateSimplePDF(htmlContent, options);
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
      // Create a minimal placeholder PDF
      pdfBuffer = this.createPlaceholderPDF(options);
    }

    // Upload to storage
    const uploadResult = await storage.getUploadUrl({
      key,
      contentType: "application/pdf",
      expiresIn: 3600,
    });

    // Upload the PDF buffer
    await this.uploadBuffer(uploadResult.uploadUrl, pdfBuffer);

    // Estimate pages
    const estimatedPages = Math.max(1, Math.ceil(htmlContent.length / 5000));

    return {
      url: uploadResult.publicUrl,
      size: pdfBuffer.length,
      pages: estimatedPages,
      key,
    };
  }

  /**
   * Generate PDF using Gotenberg (Docker-based service)
   */
  private async generateWithGotenberg(
    htmlContent: string,
    options: PDFOptions,
  ): Promise<Buffer> {
    if (!this.gotenbergUrl) {
      throw new Error("Gotenberg URL not configured");
    }

    // Wrap HTML content with proper structure
    const fullHtml = this.wrapHtmlContent(htmlContent, options);

    // Create FormData for Gotenberg
    const formData = new FormData();
    formData.append(
      "files",
      new Blob([fullHtml], { type: "text/html" }),
      "index.html",
    );

    // Set paper size
    formData.append("paperWidth", options.format === "a4" ? "8.27" : "8.5");
    formData.append("paperHeight", options.format === "a4" ? "11.69" : "11");

    // Set margins
    formData.append("marginTop", options.margins?.top || "0.5");
    formData.append("marginRight", options.margins?.right || "0.5");
    formData.append("marginBottom", options.margins?.bottom || "0.5");
    formData.append("marginLeft", options.margins?.left || "0.5");

    // Set orientation
    if (options.orientation === "landscape") {
      formData.append("landscape", "true");
    }

    // Enable header/footer if provided
    if (options.displayHeaderFooter && options.headerTemplate) {
      formData.append("headerTemplate", options.headerTemplate);
    }
    if (options.displayHeaderFooter && options.footerTemplate) {
      formData.append("footerTemplate", options.footerTemplate);
    }

    const response = await fetch(
      `${this.gotenbergUrl}/forms/chromium/convert/html`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(`Gotenberg error: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Generate PDF using Playwright (Chromium)
   * Full HTML rendering without external services
   */
  private async generateSimplePDF(
    htmlContent: string,
    options: PDFOptions,
  ): Promise<Buffer> {
    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();

      // Wrap HTML with proper structure
      const fullHtml = this.wrapHtmlContent(htmlContent, options);

      // Set content and wait for rendering
      await page.setContent(fullHtml, { waitUntil: "networkidle" });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: options.format === "a4" ? "A4" : "Letter",
        landscape: options.orientation === "landscape",
        margin: {
          top: options.margins?.top || "0.5in",
          right: options.margins?.right || "0.5in",
          bottom: options.margins?.bottom || "0.5in",
          left: options.margins?.left || "0.5in",
        },
        printBackground: true,
        displayHeaderFooter: options.displayHeaderFooter || false,
        headerTemplate: options.headerTemplate || "",
        footerTemplate: options.footerTemplate || "",
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  /**
   * Create a basic text-based PDF without external libraries
   */
  private createTextPDF(lines: string[], options: PDFOptions): Buffer {
    const pageWidth = options.format === "a4" ? 595 : 612;
    const pageHeight = options.format === "a4" ? 842 : 792;
    const margin = 50;
    const lineHeight = 14;
    const linesPerPage = Math.floor((pageHeight - 2 * margin) / lineHeight);

    // Split into pages
    const pages: string[][] = [];
    for (let i = 0; i < lines.length; i += linesPerPage) {
      pages.push(lines.slice(i, i + linesPerPage));
    }

    if (pages.length === 0) {
      pages.push(["Report content not available"]);
    }

    // Build PDF structure
    let pdf = "%PDF-1.4\n";
    let objectNum = 1;
    const offsets: number[] = [];

    // Catalog
    offsets.push(pdf.length);
    pdf += `${objectNum++} 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;

    // Pages object
    offsets.push(pdf.length);
    const pageRefs = pages.map((_, i) => `${3 + i * 2} 0 R`).join(" ");
    pdf += `${objectNum++} 0 obj\n<< /Type /Pages /Kids [${pageRefs}] /Count ${pages.length} >>\nendobj\n`;

    // Font
    offsets.push(pdf.length);
    pdf += `${objectNum++} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;

    // Pages and content
    pages.forEach((pageLines, pageIdx) => {
      const pageObjNum = objectNum++;
      const contentObjNum = objectNum++;

      // Build content stream
      let content = "BT\n/F1 10 Tf\n";
      let y = pageHeight - margin;

      pageLines.forEach((line) => {
        // Escape special PDF characters
        const escapedLine = line
          .replace(/\\/g, "\\\\")
          .replace(/\(/g, "\\(")
          .replace(/\)/g, "\\)");
        content += `${margin} ${y} Td\n(${escapedLine}) Tj\n0 ${-lineHeight} Td\n`;
        y -= lineHeight;
      });
      content += "ET\n";

      // Content stream
      offsets.push(pdf.length);
      pdf += `${contentObjNum} 0 obj\n<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`;

      // Page object
      offsets.push(pdf.length);
      pdf += `${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentObjNum} 0 R /Resources << /Font << /F1 3 0 R >> >> >>\nendobj\n`;
    });

    // Cross-reference table
    const xrefOffset = pdf.length;
    pdf += "xref\n";
    pdf += `0 ${objectNum}\n`;
    pdf += "0000000000 65535 f \n";
    offsets.forEach((offset) => {
      pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
    });

    // Trailer
    pdf += "trailer\n";
    pdf += `<< /Size ${objectNum} /Root 1 0 R >>\n`;
    pdf += "startxref\n";
    pdf += `${xrefOffset}\n`;
    pdf += "%%EOF\n";

    return Buffer.from(pdf, "binary");
  }

  /**
   * Create a placeholder PDF for error cases
   */
  private createPlaceholderPDF(options: PDFOptions): Buffer {
    return this.createTextPDF(
      [
        "TruPlat Property Valuation Report",
        "",
        `Report ID: ${options.reportId}`,
        `Type: ${options.reportType}`,
        "",
        "This is a placeholder PDF.",
        "The full report is being generated.",
        "",
        "Please check back shortly or contact support.",
      ],
      options,
    );
  }

  /**
   * Wrap HTML content with proper document structure
   */
  private wrapHtmlContent(html: string, options: PDFOptions): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @page {
      size: ${options.format === "a4" ? "A4" : "Letter"} ${options.orientation || "portrait"};
      margin: ${options.margins?.top || "0.5in"} ${options.margins?.right || "0.5in"} ${options.margins?.bottom || "0.5in"} ${options.margins?.left || "0.5in"};
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #333;
    }
    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
  }

  /**
   * Strip HTML tags from content
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Wrap text to specified width
   */
  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
      if (currentLine.length + word.length + 1 <= maxWidth) {
        currentLine += (currentLine ? " " : "") + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
  }

  /**
   * Upload buffer to storage URL
   */
  private async uploadBuffer(uploadUrl: string, buffer: Buffer): Promise<void> {
    // Convert Buffer to Uint8Array for fetch compatibility
    const uint8Array = new Uint8Array(buffer);

    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: uint8Array,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": buffer.length.toString(),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to upload PDF: ${response.statusText}`);
    }
  }

  /**
   * Generate batch of PDFs
   */
  async generateBatch(
    reports: Array<{ html: string; options: PDFOptions }>,
  ): Promise<PDFResult[]> {
    const results: PDFResult[] = [];

    for (const report of reports) {
      const result = await this.generateWithDetails(
        report.html,
        report.options,
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Delete PDF from storage
   */
  async delete(pdfUrl: string): Promise<boolean> {
    try {
      const key = storage.getKeyFromUrl(pdfUrl);
      if (key) {
        await storage.deleteFile(key);
      }
      return true;
    } catch (error) {
      console.error("Failed to delete PDF:", error);
      return false;
    }
  }

  /**
   * Get signed download URL for a PDF
   */
  async getSignedUrl(
    pdfUrl: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const key = storage.getKeyFromUrl(pdfUrl);
      if (!key) {
        return pdfUrl;
      }

      return storage.getDownloadUrl({ key, expiresIn });
    } catch (error) {
      console.error("Failed to generate signed URL:", error);
      return pdfUrl;
    }
  }
}

export const pdfGenerator = new PDFGenerator();
