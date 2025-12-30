/**
 * Template Engine
 * Renders HTML templates for appraisal reports
 */

import type { Property, Evidence } from "@prisma/client";

interface ReportData {
  reportType: "AI_REPORT" | "AI_REPORT_WITH_ONSITE" | "CERTIFIED_APPRAISAL";
  appraisalRequest: {
    referenceCode: string;
    purpose: string;
    property: Property;
    organization: { name: string };
    requestedBy: { firstName: string; lastName: string };
  };
  property: Property;
  valuation: {
    valueEstimate: number;
    valueRangeMin: number;
    valueRangeMax: number;
    fastSaleEstimate: number;
    confidenceScore: number;
    pricePerSqft: number;
    methodology: string;
    comps: Array<{
      address: string;
      salePrice: number;
      saleDate: string;
      sqft: number;
      distance: number;
      similarityScore: number;
      adjustedPrice: number;
    }>;
    riskFlags: Array<{
      type: string;
      severity: string;
      description: string;
      recommendation: string;
    }>;
    aiAnalysis?: {
      summary: string;
      strengths: string[];
      concerns: string[];
      marketPosition: string;
      investmentPotential: string;
    };
    marketTrends?: {
      medianPrice: number;
      priceChange30d: number;
      priceChange90d: number;
      daysOnMarket: number;
      inventory: number;
      demandLevel: "LOW" | "MODERATE" | "HIGH";
    };
  };
  evidence: Evidence[];
  appraiserNotes?: string;
  generatedAt: Date;
  generatedById: string;
  certificationNumber?: string;
}

/**
 * Template engine class
 */
class TemplateEngine {
  /**
   * Render complete report HTML
   */
  async render(data: ReportData): Promise<string> {
    const sections = [
      this.renderHeader(data),
      this.renderPropertySummary(data),
      this.renderValuationSummary(data),
      this.renderComparables(data),
      data.valuation.aiAnalysis ? this.renderAIAnalysis(data) : "",
      this.renderRiskAssessment(data),
      data.evidence.length > 0 ? this.renderEvidence(data) : "",
      data.appraiserNotes ? this.renderAppraiserNotes(data) : "",
      data.valuation.marketTrends ? this.renderMarketTrends(data) : "",
      this.renderMethodology(data),
      this.renderDisclaimer(data),
      this.renderFooter(data),
    ];

    return this.wrapInDocument(sections.join("\n"), data);
  }

  /**
   * Wrap content in HTML document
   */
  private wrapInDocument(content: string, data: ReportData): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Property Valuation Report - ${data.appraisalRequest.referenceCode}</title>
  <style>
    ${this.getStyles()}
  </style>
</head>
<body>
  <div class="report-container">
    ${content}
  </div>
</body>
</html>`;
  }

  /**
   * Get CSS styles
   */
  private getStyles(): string {
    return `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; line-height: 1.6; }
      .report-container { max-width: 800px; margin: 0 auto; padding: 40px; }

      .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
      .header h1 { font-size: 28px; color: #2563eb; margin-bottom: 5px; }
      .header .subtitle { color: #666; font-size: 14px; }
      .header .meta { display: flex; gap: 30px; margin-top: 15px; font-size: 13px; color: #444; }

      .section { margin-bottom: 35px; page-break-inside: avoid; }
      .section-title { font-size: 18px; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px; }

      .property-summary { background: #f8fafc; padding: 20px; border-radius: 8px; }
      .property-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
      .property-item { }
      .property-label { font-size: 12px; color: #666; text-transform: uppercase; }
      .property-value { font-size: 16px; font-weight: 600; }

      .valuation-box { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 25px; border-radius: 12px; text-align: center; }
      .valuation-estimate { font-size: 42px; font-weight: 700; margin-bottom: 5px; }
      .valuation-range { font-size: 14px; opacity: 0.9; }
      .valuation-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2); }
      .metric { }
      .metric-value { font-size: 24px; font-weight: 600; }
      .metric-label { font-size: 12px; opacity: 0.8; }

      .comps-table { width: 100%; border-collapse: collapse; font-size: 13px; }
      .comps-table th { background: #f1f5f9; padding: 10px 8px; text-align: left; font-weight: 600; }
      .comps-table td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; }
      .comps-table tr:hover { background: #f8fafc; }

      .risk-flag { padding: 12px 15px; border-radius: 6px; margin-bottom: 10px; }
      .risk-flag.high { background: #fef2f2; border-left: 4px solid #dc2626; }
      .risk-flag.medium { background: #fffbeb; border-left: 4px solid #f59e0b; }
      .risk-flag.low { background: #f0fdf4; border-left: 4px solid #22c55e; }
      .risk-title { font-weight: 600; font-size: 14px; }
      .risk-desc { font-size: 13px; color: #444; margin-top: 4px; }

      .ai-analysis { background: #faf5ff; padding: 20px; border-radius: 8px; border: 1px solid #e9d5ff; }
      .ai-summary { font-size: 15px; line-height: 1.7; margin-bottom: 15px; }
      .ai-list { margin: 10px 0; padding-left: 20px; }
      .ai-list li { margin-bottom: 6px; font-size: 14px; }

      .evidence-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
      .evidence-item { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
      .evidence-img { width: 100%; height: 200px; object-fit: cover; background: #f1f5f9; }
      .evidence-caption { padding: 10px; font-size: 13px; }

      .notes-box { background: #fefce8; padding: 20px; border-radius: 8px; border: 1px solid #fef08a; }
      .notes-box p { font-size: 14px; line-height: 1.7; }

      .methodology { font-size: 14px; color: #444; }

      .disclaimer { background: #f1f5f9; padding: 15px; border-radius: 6px; font-size: 12px; color: #666; }

      .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; font-size: 12px; color: #666; display: flex; justify-content: space-between; }

      @media print {
        .report-container { padding: 20px; }
        .section { page-break-inside: avoid; }
        .valuation-box { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    `;
  }

  /**
   * Render header section
   */
  private renderHeader(data: ReportData): string {
    const reportTypeLabels = {
      AI_REPORT: "AI-Powered Valuation Report",
      AI_REPORT_WITH_ONSITE: "On-Site Verification Report",
      CERTIFIED_APPRAISAL: "Certified Appraisal Report",
    };

    return `
      <header class="header">
        <h1>${reportTypeLabels[data.reportType]}</h1>
        <p class="subtitle">Property Valuation Analysis</p>
        <div class="meta">
          <span><strong>Reference:</strong> ${data.appraisalRequest.referenceCode}</span>
          <span><strong>Date:</strong> ${data.generatedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          <span><strong>Client:</strong> ${data.appraisalRequest.organization.name}</span>
        </div>
      </header>
    `;
  }

  /**
   * Render property summary
   */
  private renderPropertySummary(data: ReportData): string {
    const p = data.property;
    return `
      <section class="section">
        <h2 class="section-title">Subject Property</h2>
        <div class="property-summary">
          <p style="font-size: 18px; font-weight: 600; margin-bottom: 15px;">${p.addressFull}</p>
          <div class="property-grid">
            <div class="property-item">
              <div class="property-label">Property Type</div>
              <div class="property-value">${p.propertyType.replace("_", " ")}</div>
            </div>
            <div class="property-item">
              <div class="property-label">Square Feet</div>
              <div class="property-value">${p.sqft?.toLocaleString() || "N/A"}</div>
            </div>
            <div class="property-item">
              <div class="property-label">Year Built</div>
              <div class="property-value">${p.yearBuilt || "N/A"}</div>
            </div>
            <div class="property-item">
              <div class="property-label">Bedrooms</div>
              <div class="property-value">${p.bedrooms || "N/A"}</div>
            </div>
            <div class="property-item">
              <div class="property-label">Bathrooms</div>
              <div class="property-value">${p.bathrooms || "N/A"}</div>
            </div>
            <div class="property-item">
              <div class="property-label">Lot Size</div>
              <div class="property-value">${p.lotSizeSqft ? (p.lotSizeSqft / 43560).toFixed(2) + " acres" : "N/A"}</div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Render valuation summary
   */
  private renderValuationSummary(data: ReportData): string {
    const v = data.valuation;
    return `
      <section class="section">
        <h2 class="section-title">Valuation Summary</h2>
        <div class="valuation-box">
          <div class="valuation-estimate">$${v.valueEstimate.toLocaleString()}</div>
          <div class="valuation-range">
            Estimated Value Range: $${v.valueRangeMin.toLocaleString()} - $${v.valueRangeMax.toLocaleString()}
          </div>
          <div class="valuation-metrics">
            <div class="metric">
              <div class="metric-value">${v.confidenceScore}%</div>
              <div class="metric-label">Confidence Score</div>
            </div>
            <div class="metric">
              <div class="metric-value">$${v.pricePerSqft}</div>
              <div class="metric-label">Price per Sq Ft</div>
            </div>
            <div class="metric">
              <div class="metric-value">$${v.fastSaleEstimate.toLocaleString()}</div>
              <div class="metric-label">Quick Sale Value</div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Render comparable sales
   */
  private renderComparables(data: ReportData): string {
    const comps = data.valuation.comps.slice(0, 6);
    return `
      <section class="section">
        <h2 class="section-title">Comparable Sales Analysis</h2>
        <table class="comps-table">
          <thead>
            <tr>
              <th>Address</th>
              <th>Sale Price</th>
              <th>Sale Date</th>
              <th>Sq Ft</th>
              <th>Distance</th>
              <th>Match</th>
              <th>Adjusted</th>
            </tr>
          </thead>
          <tbody>
            ${comps
              .map(
                (c) => `
              <tr>
                <td>${c.address}</td>
                <td>$${c.salePrice.toLocaleString()}</td>
                <td>${new Date(c.saleDate).toLocaleDateString()}</td>
                <td>${c.sqft.toLocaleString()}</td>
                <td>${c.distance.toFixed(1)} mi</td>
                <td>${c.similarityScore}%</td>
                <td>$${c.adjustedPrice.toLocaleString()}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <p style="font-size: 12px; color: #666; margin-top: 10px;">
          * Adjusted prices account for differences in size, age, and features compared to the subject property.
        </p>
      </section>
    `;
  }

  /**
   * Render AI analysis
   */
  private renderAIAnalysis(data: ReportData): string {
    const ai = data.valuation.aiAnalysis;
    if (!ai) return "";

    return `
      <section class="section">
        <h2 class="section-title">AI-Powered Analysis</h2>
        <div class="ai-analysis">
          <p class="ai-summary">${ai.summary}</p>

          <h4 style="margin-top: 15px; color: #22c55e;">Strengths</h4>
          <ul class="ai-list">
            ${ai.strengths.map((s) => `<li>${s}</li>`).join("")}
          </ul>

          ${
            ai.concerns.length > 0
              ? `
            <h4 style="margin-top: 15px; color: #f59e0b;">Considerations</h4>
            <ul class="ai-list">
              ${ai.concerns.map((c) => `<li>${c}</li>`).join("")}
            </ul>
          `
              : ""
          }

          <h4 style="margin-top: 15px;">Market Position</h4>
          <p style="font-size: 14px; margin-top: 5px;">${ai.marketPosition}</p>

          <h4 style="margin-top: 15px;">Investment Potential</h4>
          <p style="font-size: 14px; margin-top: 5px;">${ai.investmentPotential}</p>
        </div>
      </section>
    `;
  }

  /**
   * Render risk assessment
   */
  private renderRiskAssessment(data: ReportData): string {
    const risks = data.valuation.riskFlags;
    if (risks.length === 0) {
      return `
        <section class="section">
          <h2 class="section-title">Risk Assessment</h2>
          <div class="risk-flag low">
            <div class="risk-title">No Significant Risks Identified</div>
            <div class="risk-desc">The valuation data and comparable sales provide strong support for the estimated value.</div>
          </div>
        </section>
      `;
    }

    return `
      <section class="section">
        <h2 class="section-title">Risk Assessment</h2>
        ${risks
          .map(
            (r) => `
          <div class="risk-flag ${r.severity.toLowerCase()}">
            <div class="risk-title">${r.type.replace(/_/g, " ")}</div>
            <div class="risk-desc">${r.description}. ${r.recommendation}</div>
          </div>
        `
          )
          .join("")}
      </section>
    `;
  }

  /**
   * Render evidence photos
   */
  private renderEvidence(data: ReportData): string {
    return `
      <section class="section">
        <h2 class="section-title">Property Evidence</h2>
        <div class="evidence-grid">
          ${data.evidence
            .map(
              (e) => `
            <div class="evidence-item">
              <img src="${e.fileUrl}" alt="${e.category || "Evidence"}" class="evidence-img" />
              <div class="evidence-caption">
                <strong>${(e.category || "PHOTO").replace(/_/g, " ")}</strong>
                ${e.notes ? `<br/>${e.notes}` : ""}
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  /**
   * Render appraiser notes
   */
  private renderAppraiserNotes(data: ReportData): string {
    return `
      <section class="section">
        <h2 class="section-title">Appraiser Notes</h2>
        <div class="notes-box">
          <p>${data.appraiserNotes}</p>
        </div>
      </section>
    `;
  }

  /**
   * Render market trends
   */
  private renderMarketTrends(data: ReportData): string {
    const trends = data.valuation.marketTrends;
    if (!trends) return "";

    const changeColor30d = trends.priceChange30d >= 0 ? "#22c55e" : "#dc2626";
    const changeSign30d = trends.priceChange30d >= 0 ? "+" : "";
    const changeColor90d = trends.priceChange90d >= 0 ? "#22c55e" : "#dc2626";
    const changeSign90d = trends.priceChange90d >= 0 ? "+" : "";

    return `
      <section class="section">
        <h2 class="section-title">Local Market Trends</h2>
        <div class="property-grid">
          <div class="property-item">
            <div class="property-label">Median Home Price</div>
            <div class="property-value">$${trends.medianPrice.toLocaleString()}</div>
          </div>
          <div class="property-item">
            <div class="property-label">30-Day Change</div>
            <div class="property-value" style="color: ${changeColor30d}">${changeSign30d}${trends.priceChange30d}%</div>
          </div>
          <div class="property-item">
            <div class="property-label">90-Day Change</div>
            <div class="property-value" style="color: ${changeColor90d}">${changeSign90d}${trends.priceChange90d}%</div>
          </div>
          <div class="property-item">
            <div class="property-label">Avg Days on Market</div>
            <div class="property-value">${trends.daysOnMarket} days</div>
          </div>
          <div class="property-item">
            <div class="property-label">Available Inventory</div>
            <div class="property-value">${trends.inventory} homes</div>
          </div>
          <div class="property-item">
            <div class="property-label">Demand Level</div>
            <div class="property-value">${trends.demandLevel}</div>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Render methodology
   */
  private renderMethodology(data: ReportData): string {
    return `
      <section class="section">
        <h2 class="section-title">Valuation Methodology</h2>
        <p class="methodology">
          <strong>Approach:</strong> ${data.valuation.methodology}<br/><br/>
          This valuation was prepared using the Sales Comparison Approach, which analyzes recent sales
          of similar properties in the subject property's market area. Adjustments were made to the
          comparable sales to account for differences in physical characteristics, location, and
          market conditions. The final value estimate represents the most probable price the subject
          property would sell for in a competitive market under normal conditions.
        </p>
      </section>
    `;
  }

  /**
   * Render disclaimer
   */
  private renderDisclaimer(data: ReportData): string {
    const disclaimers = {
      AI_REPORT: `This AI-powered valuation report is generated using automated valuation models (AVM)
        and public records data. It is intended for informational purposes only and should not be
        used as a substitute for a professional appraisal when making lending decisions. The estimated
        value represents a statistical prediction based on available market data and may not reflect
        the property's actual market value.`,
      AI_REPORT_WITH_ONSITE: `This on-site verification report includes physical inspection data that supplements
        automated valuation analysis. While property condition has been verified, this report is
        not a full appraisal and should be used for preliminary evaluation purposes. A certified
        appraisal may be required for final lending decisions.`,
      CERTIFIED_APPRAISAL: `This certified appraisal report has been prepared in accordance with the Uniform
        Standards of Professional Appraisal Practice (USPAP). The appraiser certifies that the
        statements of fact contained in this report are true and correct, and the analysis and
        conclusions are limited only by the assumptions and limiting conditions stated herein.`,
    };

    return `
      <section class="section">
        <h2 class="section-title">Disclaimer & Limiting Conditions</h2>
        <div class="disclaimer">
          ${disclaimers[data.reportType]}
        </div>
      </section>
    `;
  }

  /**
   * Render footer
   */
  private renderFooter(data: ReportData): string {
    return `
      <footer class="footer">
        <div>
          <strong>Project LENS</strong> - AI-Powered Property Valuation<br/>
          Report ID: ${data.appraisalRequest.referenceCode}
        </div>
        <div style="text-align: right;">
          Generated: ${data.generatedAt.toLocaleString()}<br/>
          Purpose: ${data.appraisalRequest.purpose}
        </div>
      </footer>
    `;
  }
}

export const templateEngine = new TemplateEngine();
