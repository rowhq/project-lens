/**
 * Client-side PDF generation hook
 * Uses html2pdf.js to convert HTML content to PDF in the browser
 * Works in Vercel serverless without needing Gotenberg or Chromium
 */

import { useState, useCallback } from "react";

export interface PdfOptions {
  margin?: number | [number, number, number, number];
  filename?: string;
  pageSize?: "letter" | "a4";
  orientation?: "portrait" | "landscape";
}

export function useHtmlToPdf() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePdf = useCallback(
    async (htmlContent: string, filename: string, options?: PdfOptions) => {
      setIsGenerating(true);
      setError(null);

      try {
        // Dynamic import to avoid SSR issues
        const html2pdf = (await import("html2pdf.js")).default;

        // Create container for HTML content
        const container = document.createElement("div");
        container.innerHTML = htmlContent;

        // Set container width for proper rendering
        container.style.width = "210mm"; // A4/Letter width
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.top = "0";

        document.body.appendChild(container);

        // Configure PDF generation options
        const pdfOptions = {
          margin: options?.margin ?? [10, 10, 10, 10],
          filename: `${filename}.pdf`,
          image: { type: "jpeg" as const, quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            letterRendering: true,
          },
          jsPDF: {
            unit: "mm" as const,
            format: options?.pageSize ?? "letter",
            orientation: options?.orientation ?? "portrait",
          },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        };

        await html2pdf().set(pdfOptions).from(container).save();

        // Cleanup
        document.body.removeChild(container);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "PDF generation failed";
        setError(errorMessage);
        console.error("PDF generation error:", err);
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  return { generatePdf, isGenerating, error };
}
