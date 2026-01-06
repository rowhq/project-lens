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
        // Validate htmlContent before proceeding
        if (!htmlContent || htmlContent.trim().length < 100) {
          throw new Error(
            `HTML content is empty or invalid (length: ${htmlContent?.length ?? 0})`,
          );
        }
        console.log("[PDF Debug] HTML content length:", htmlContent.length);
        console.log("[PDF Debug] HTML preview:", htmlContent.substring(0, 200));

        // Dynamic import to avoid SSR issues
        const html2pdf = (await import("html2pdf.js")).default;

        // Create container for HTML content
        const container = document.createElement("div");
        container.innerHTML = htmlContent;

        // CRITICAL: Container must be ON-SCREEN for html2canvas to render properly
        // Using opacity:0 instead of left:-9999px because html2canvas doesn't render offscreen elements
        container.style.position = "fixed";
        container.style.left = "0";
        container.style.top = "0";
        container.style.width = "210mm";
        container.style.opacity = "0"; // Invisible but still rendered
        container.style.pointerEvents = "none";
        container.style.zIndex = "-1";

        document.body.appendChild(container);

        // CRITICAL: Wait for fonts to load before rendering
        await document.fonts.ready;

        // Increased delay to ensure DOM is fully painted and fonts are rendered
        // html2canvas needs more time with generic fonts
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Configure PDF generation options
        const pdfOptions = {
          margin: options?.margin ?? [10, 10, 10, 10],
          filename: `${filename}.pdf`,
          image: { type: "jpeg" as const, quality: 0.95 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true, // Allow external images even if CORS fails
            logging: true, // Enable logging to debug rendering issues
            windowWidth: 794, // A4 width in pixels at 96dpi
          },
          jsPDF: {
            unit: "mm" as const,
            format: options?.pageSize ?? "letter",
            orientation: options?.orientation ?? "portrait",
          },
          pagebreak: { mode: ["css", "legacy"] },
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
