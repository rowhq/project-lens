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
   * Get CSS styles - TruPlat Brand Design
   */
  private getStyles(): string {
    return `
      /* PDF-compatible system fonts - no external dependencies for html2canvas */

      /* Reset & Base */
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: Arial, Helvetica, sans-serif;
        color: #121212;
        line-height: 1.6;
        background: #FFFFFF;
      }
      .report-container { max-width: 800px; margin: 0 auto; padding: 0; }

      /* Header - Dark with Lime accent */
      .header {
        background: #121212;
        padding: 30px 40px;
        margin-bottom: 0;
        border-bottom: 3px solid #22C55E;
      }
      .header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .logo-text {
        font-size: 28px;
        font-weight: 700;
        color: #4ADE80;
        letter-spacing: 3px;
      }
      .header-badge {
        font-family: 'Courier New', Courier, monospace;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #121212;
        background: #4ADE80;
        padding: 6px 12px;
        font-weight: 500;
      }
      .header .meta {
        display: flex;
        gap: 24px;
        font-family: 'Courier New', Courier, monospace;
        font-size: 11px;
        color: #737373;
      }
      .header .meta span { color: #E5E5E5; }
      .header .meta strong { color: #737373; font-weight: 500; }

      /* Sections */
      .section { margin-bottom: 32px; padding: 0 40px; page-break-inside: avoid; }
      .section:first-of-type { padding-top: 32px; }
      .section-title {
        font-family: 'Courier New', Courier, monospace;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #16A34A;
        border-bottom: 1px solid #E5E5E5;
        padding-bottom: 8px;
        margin-bottom: 16px;
      }
      .section-title::before { content: '[ '; color: #A3A3A3; }
      .section-title::after { content: ' ]'; color: #A3A3A3; }

      /* Property Summary */
      .property-summary {
        background: #F8FAFC;
        padding: 24px;
        border: 1px solid #E5E5E5;
      }
      .property-address {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 16px;
        color: #121212;
      }
      .property-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      .property-item { }
      .property-label {
        font-family: 'Courier New', Courier, monospace;
        font-size: 10px;
        color: #737373;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 4px;
      }
      .property-value {
        font-size: 16px;
        font-weight: 600;
        color: #121212;
      }

      /* Valuation Box - Lime Gradient */
      .valuation-box {
        background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
        color: #FFFFFF;
        padding: 32px;
        text-align: center;
        margin: 0 40px 32px 40px;
      }
      .valuation-estimate {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 48px;
        font-weight: 700;
        letter-spacing: -0.03em;
        margin-bottom: 8px;
      }
      .valuation-range {
        font-family: 'Courier New', Courier, monospace;
        font-size: 13px;
        opacity: 0.9;
      }
      .valuation-metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid rgba(255,255,255,0.3);
      }
      .metric { }
      .metric-value {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 24px;
        font-weight: 600;
      }
      .metric-label {
        font-family: 'Courier New', Courier, monospace;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        opacity: 0.85;
        margin-top: 4px;
      }

      /* Comparables Table */
      .comps-table {
        width: 100%;
        border-collapse: collapse;
        font-family: 'Courier New', Courier, monospace;
        font-size: 11px;
      }
      .comps-table th {
        background: #F8FAFC;
        color: #16A34A;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 12px 8px;
        text-align: left;
        font-weight: 500;
        border-bottom: 2px solid #22C55E;
      }
      .comps-table td {
        padding: 12px 8px;
        border-bottom: 1px solid #E5E5E5;
        color: #374151;
      }
      .comps-table tr:nth-child(even) { background: #F9FAFB; }
      .comps-note {
        font-family: 'Courier New', Courier, monospace;
        font-size: 10px;
        color: #737373;
        margin-top: 12px;
      }

      /* Risk Flags */
      .risk-flag {
        display: flex;
        align-items: flex-start;
        padding: 16px;
        margin-bottom: 12px;
        border-left: 3px solid;
      }
      .risk-flag::before {
        content: '■';
        margin-right: 12px;
        font-size: 8px;
        margin-top: 4px;
      }
      .risk-flag.high {
        background: #FEF2F2;
        border-left-color: #DC2626;
        color: #991B1B;
      }
      .risk-flag.high::before { color: #DC2626; }
      .risk-flag.medium {
        background: #FFFBEB;
        border-left-color: #F59E0B;
        color: #92400E;
      }
      .risk-flag.medium::before { color: #F59E0B; }
      .risk-flag.low {
        background: #ECFDF5;
        border-left-color: #22C55E;
        color: #166534;
      }
      .risk-flag.low::before { color: #22C55E; }
      .risk-content { flex: 1; }
      .risk-title {
        font-family: Arial, Helvetica, sans-serif;
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 4px;
      }
      .risk-desc {
        font-size: 13px;
        line-height: 1.5;
      }

      /* AI Analysis */
      .ai-analysis {
        background: #ECFDF5;
        padding: 24px;
        border: 1px solid #BBF7D0;
      }
      .ai-summary {
        font-size: 15px;
        line-height: 1.7;
        margin-bottom: 20px;
        color: #121212;
      }
      .ai-section-title {
        font-family: 'Courier New', Courier, monospace;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-top: 16px;
        margin-bottom: 8px;
      }
      .ai-section-title.strengths { color: #16A34A; }
      .ai-section-title.concerns { color: #D97706; }
      .ai-section-title.neutral { color: #525252; }
      .ai-list {
        margin: 8px 0;
        padding-left: 20px;
      }
      .ai-list li {
        margin-bottom: 6px;
        font-size: 14px;
        color: #374151;
      }

      /* Evidence Grid */
      .evidence-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
      .evidence-item {
        border: 1px solid #E5E5E5;
        overflow: hidden;
      }
      .evidence-img {
        width: 100%;
        height: 180px;
        object-fit: cover;
        background: #F1F5F9;
      }
      .evidence-caption {
        padding: 12px;
        font-size: 12px;
        background: #F8FAFC;
      }
      .evidence-caption strong {
        font-family: 'Courier New', Courier, monospace;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #16A34A;
      }

      /* Notes Box */
      .notes-box {
        background: #FFFBEB;
        padding: 20px;
        border: 1px solid #FEF08A;
      }
      .notes-box p {
        font-size: 14px;
        line-height: 1.7;
        color: #92400E;
      }

      /* Methodology */
      .methodology {
        font-size: 14px;
        color: #525252;
        line-height: 1.7;
      }
      .methodology strong { color: #121212; }

      /* Disclaimer */
      .disclaimer {
        background: #F8FAFC;
        padding: 16px;
        font-size: 11px;
        color: #737373;
        line-height: 1.6;
        border: 1px solid #E5E5E5;
      }

      /* Footer */
      .footer {
        margin: 40px 40px 0 40px;
        padding: 20px 0;
        border-top: 2px solid #22C55E;
        font-family: 'Courier New', Courier, monospace;
        font-size: 10px;
        color: #737373;
        display: flex;
        justify-content: space-between;
      }
      .footer strong {
        color: #16A34A;
        font-weight: 600;
      }

      /* Market Trends Grid */
      .trends-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }
      .trend-item {
        background: #F8FAFC;
        padding: 16px;
        border: 1px solid #E5E5E5;
      }
      .trend-label {
        font-family: 'Courier New', Courier, monospace;
        font-size: 10px;
        color: #737373;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 4px;
      }
      .trend-value {
        font-size: 18px;
        font-weight: 600;
        color: #121212;
      }
      .trend-value.positive { color: #16A34A; }
      .trend-value.negative { color: #DC2626; }

      /* Print Styles */
      @media print {
        .report-container { padding: 0; }
        .section { page-break-inside: avoid; }
        .header, .valuation-box {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
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

    // TruPlat logo as simple text (SVG with clip-path breaks html2canvas)
    const logoSvg = `<div class="logo-text">TRUPLAT</div>`;

    return `
      <header class="header">
        <div class="header-top">
          <div class="logo">${logoSvg}</div>
          <div class="header-badge">${reportTypeLabels[data.reportType].toUpperCase()}</div>
        </div>
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
          <p class="property-address">${p.addressFull}</p>
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
            `,
              )
              .join("")}
          </tbody>
        </table>
        <p class="comps-note">
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

          <h4 class="ai-section-title strengths">Strengths</h4>
          <ul class="ai-list">
            ${ai.strengths.map((s) => `<li>${s}</li>`).join("")}
          </ul>

          ${
            ai.concerns.length > 0
              ? `
            <h4 class="ai-section-title concerns">Considerations</h4>
            <ul class="ai-list">
              ${ai.concerns.map((c) => `<li>${c}</li>`).join("")}
            </ul>
          `
              : ""
          }

          <h4 class="ai-section-title neutral">Market Position</h4>
          <p style="font-size: 14px; margin-top: 5px; color: #374151;">${ai.marketPosition}</p>

          <h4 class="ai-section-title neutral">Investment Potential</h4>
          <p style="font-size: 14px; margin-top: 5px; color: #374151;">${ai.investmentPotential}</p>
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
            <div class="risk-content">
              <div class="risk-title">No Significant Risks Identified</div>
              <div class="risk-desc">The valuation data and comparable sales provide strong support for the estimated value.</div>
            </div>
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
            <div class="risk-content">
              <div class="risk-title">${r.type.replace(/_/g, " ")}</div>
              <div class="risk-desc">${r.description}. ${r.recommendation}</div>
            </div>
          </div>
        `,
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
          `,
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

    const changeClass30d = trends.priceChange30d >= 0 ? "positive" : "negative";
    const changeSign30d = trends.priceChange30d >= 0 ? "+" : "";
    const changeClass90d = trends.priceChange90d >= 0 ? "positive" : "negative";
    const changeSign90d = trends.priceChange90d >= 0 ? "+" : "";

    return `
      <section class="section">
        <h2 class="section-title">Local Market Trends</h2>
        <div class="trends-grid">
          <div class="trend-item">
            <div class="trend-label">Median Home Price</div>
            <div class="trend-value">$${trends.medianPrice.toLocaleString()}</div>
          </div>
          <div class="trend-item">
            <div class="trend-label">30-Day Change</div>
            <div class="trend-value ${changeClass30d}">${changeSign30d}${trends.priceChange30d}%</div>
          </div>
          <div class="trend-item">
            <div class="trend-label">90-Day Change</div>
            <div class="trend-value ${changeClass90d}">${changeSign90d}${trends.priceChange90d}%</div>
          </div>
          <div class="trend-item">
            <div class="trend-label">Avg Days on Market</div>
            <div class="trend-value">${trends.daysOnMarket} days</div>
          </div>
          <div class="trend-item">
            <div class="trend-label">Available Inventory</div>
            <div class="trend-value">${trends.inventory} homes</div>
          </div>
          <div class="trend-item">
            <div class="trend-label">Demand Level</div>
            <div class="trend-value">${trends.demandLevel}</div>
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
          <strong>TRUPLAT</strong> — AI-Powered Property Valuation<br/>
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
