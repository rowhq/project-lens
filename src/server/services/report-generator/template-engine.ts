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
      .logo svg {
        display: block;
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

    // TruPlat logo SVG (inline for PDF compatibility)
    const logoSvg = `<svg width="140" height="41" viewBox="0 0 248 73" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_0_3)">
        <path d="M47.891 26.079C47.6594 28.9288 47.5205 31.7723 47.4772 34.6097H55.2707C55.3417 31.408 55.5918 28.197 56.021 24.9799C53.3131 25.4276 50.602 25.795 47.8879 26.079H47.891Z" fill="#4ADE80"/>
        <path d="M55.2707 38.3888H47.4772C47.5205 41.2262 47.6594 44.0698 47.891 46.9195C50.6051 47.2004 53.3162 47.5709 56.0241 48.0186C55.5949 44.8046 55.3417 41.5936 55.2707 38.3888Z" fill="#4ADE80"/>
        <path d="M32.1126 38.3888H24.2851C24.2481 41.1212 24.1215 43.8536 23.9177 46.5829C26.6473 46.3761 29.3799 46.2526 32.1126 46.2155V38.3888Z" fill="#4ADE80"/>
        <path d="M43.7194 38.3888H35.892V46.2155C38.6246 46.2526 41.3573 46.3792 44.0869 46.5829C43.88 43.8536 43.7565 41.1212 43.7194 38.3888Z" fill="#4ADE80"/>
        <path d="M49.4534 13.865C48.9655 16.6561 48.5672 19.4502 48.2584 22.2413C51.0498 21.9326 53.8442 21.5343 56.6355 21.0465C57.1913 17.9281 57.9169 14.8098 58.8093 11.6914C55.6907 12.5837 52.572 13.3062 49.4534 13.865Z" fill="#4ADE80"/>
        <path d="M8.95135 34.6097C8.87107 31.1764 8.57465 27.7308 8.06517 24.279C5.37265 23.7541 2.68631 23.149 -3.26829e-05 22.4636C0.68236 26.5205 1.07142 30.5713 1.16096 34.6128H8.94827L8.95135 34.6097Z" fill="#4ADE80"/>
        <path d="M11.366 21.0496C14.1573 21.5374 16.9517 21.9357 19.743 22.2444C19.4343 19.4533 19.0359 16.6592 18.5481 13.8681C15.4294 13.3124 12.3108 12.5868 9.19219 11.6945C10.0846 14.8129 10.8071 17.9312 11.366 21.0496Z" fill="#4ADE80"/>
        <path d="M35.892 23.0255C38.7296 22.9823 41.5734 22.8434 44.4234 22.6118C44.7044 19.8979 45.0749 17.1871 45.5227 14.4794C42.3083 14.9086 39.0971 15.1587 35.892 15.2297V23.0255Z" fill="#4ADE80"/>
        <path d="M23.5811 22.6118C26.4311 22.8433 29.2749 22.9823 32.1126 23.0255V15.2327C28.9106 15.1617 25.6993 14.9116 22.4819 14.4825C22.9296 17.1902 23.2971 19.8979 23.5811 22.6118Z" fill="#4ADE80"/>
        <path d="M35.892 26.783V34.6097H43.7194C43.7565 31.8773 43.8831 29.1449 44.0869 26.4156C41.3573 26.6224 38.6246 26.7459 35.892 26.783Z" fill="#4ADE80"/>
        <path d="M20.1136 46.9195C20.3452 44.0698 20.4841 41.2262 20.5273 38.3888H12.7339C12.6628 41.5905 12.4127 44.8015 11.9835 48.0186C14.6915 47.5709 17.3994 47.2035 20.1136 46.9195Z" fill="#4ADE80"/>
        <path d="M24.2851 34.6097H32.1126V26.783C29.3799 26.7459 26.6473 26.6194 23.9177 26.4156C24.1246 29.1449 24.2481 31.8773 24.2851 34.6097Z" fill="#4ADE80"/>
        <path d="M12.7308 34.6097H20.5242C20.481 31.7723 20.3421 28.9288 20.1105 26.079C17.3964 25.7981 14.6853 25.4276 11.9773 24.9799C12.4065 28.1939 12.6597 31.4049 12.7308 34.6097Z" fill="#4ADE80"/>
        <path d="M8.95135 38.3888H1.16096C1.07142 42.4303 0.68236 46.4811 -3.26829e-05 50.538C2.68322 49.8495 5.37265 49.2443 8.06517 48.7226C8.57774 45.2708 8.87107 41.8252 8.95135 38.3919V38.3888Z" fill="#4ADE80"/>
        <path d="M32.1126 61.5479C28.679 61.6281 25.2331 61.9245 21.781 62.434C21.2561 65.1262 20.6509 67.8123 19.9654 70.4984C24.0227 69.8161 28.0738 69.4302 32.1157 69.3376V61.551L32.1126 61.5479Z" fill="#4ADE80"/>
        <path d="M46.2236 62.434C42.7715 61.9215 39.3256 61.6281 35.892 61.5479V69.3345C39.9338 69.4271 43.985 69.813 48.0423 70.4954C47.3537 67.8123 46.7485 65.1232 46.2267 62.4309L46.2236 62.434Z" fill="#4ADE80"/>
        <path d="M56.6355 51.949C53.8442 51.4612 51.0498 51.0629 48.2584 50.7541C48.5672 53.5452 48.9655 56.3394 49.4534 59.1304C52.572 59.6862 55.6907 60.4117 58.8093 61.304C57.9169 58.1857 57.1944 55.0673 56.6355 51.949Z" fill="#4ADE80"/>
        <path d="M44.4234 50.3867C41.5734 50.1552 38.7296 50.0162 35.892 49.973V57.7658C39.094 57.8368 42.3052 58.0869 45.5227 58.516C45.0749 55.8083 44.7075 53.0975 44.4234 50.3836V50.3867Z" fill="#4ADE80"/>
        <path d="M32.1126 49.973C29.2749 50.0162 26.4311 50.1552 23.5811 50.3867C23.3001 53.1006 22.9296 55.8114 22.4819 58.5191C25.6962 58.09 28.9075 57.8399 32.1126 57.7689V49.973Z" fill="#4ADE80"/>
        <path d="M59.0532 38.3888C59.1335 41.8221 59.4299 45.2677 59.9394 48.7195C62.6319 49.2443 65.3182 49.8495 68.0046 50.5349C67.3222 46.478 66.9362 42.4272 66.8436 38.3857H59.0563L59.0532 38.3888Z" fill="#4ADE80"/>
        <path d="M59.0532 34.6097H66.8405C66.9331 30.5682 67.3191 26.5175 68.0015 22.4605C65.3182 23.149 62.6288 23.7542 59.9363 24.276C59.4237 27.7278 59.1304 31.1734 59.0501 34.6066L59.0532 34.6097Z" fill="#4ADE80"/>
        <path d="M19.7461 50.7541C16.9548 51.0629 14.1604 51.4612 11.3691 51.949C10.8133 55.0673 10.0877 58.1857 9.19529 61.304C12.3139 60.4117 15.4325 59.6893 18.5512 59.1304C19.039 56.3394 19.4374 53.5452 19.7461 50.7541Z" fill="#4ADE80"/>
        <path d="M21.7779 10.5645C25.23 11.077 28.6759 11.3703 32.1095 11.4506V3.66091C28.0676 3.56829 24.0165 3.18235 19.9592 2.50002C20.6477 5.18304 21.256 7.87222 21.7779 10.5645Z" fill="#4ADE80"/>
        <path d="M35.892 11.4506C39.3255 11.3703 42.7715 11.0739 46.2236 10.5645C46.7485 7.87222 47.3537 5.18612 48.0392 2.50002C43.9819 3.18235 39.9307 3.56829 35.8889 3.66091V11.4475L35.892 11.4506Z" fill="#4ADE80"/>
      </g>
      <path d="M93.272 56C90.3973 56 88.1947 55.2907 86.664 53.872C85.1333 52.4533 84.368 50.1573 84.368 46.984V33.32H80.28V26.88H84.368V21L91.928 20.216V26.88H98.088V33.32H91.928V46.592C91.928 48.384 92.712 49.28 94.28 49.28H97.416V56H93.272ZM100.615 56V26.88H107.951V32.424C108.436 30.3333 109.426 28.7467 110.919 27.664C112.412 26.544 114.428 26.0587 116.967 26.208V33.32H115.903C113.738 33.32 111.908 34.0107 110.415 35.392C108.922 36.7733 108.175 38.6773 108.175 41.104V56H100.615ZM130.29 56.672C128.2 56.672 126.314 56.1867 124.634 55.216C122.954 54.2453 121.629 52.864 120.658 51.072C119.688 49.2427 119.202 47.1147 119.202 44.688V26.88H126.762V42.84C126.762 45.3413 127.266 47.1707 128.274 48.328C129.282 49.4853 130.72 50.064 132.586 50.064C134.192 50.064 135.592 49.4853 136.786 48.328C138.018 47.1707 138.634 45.3413 138.634 42.84V26.88H146.194V56H138.858V51.632C138.149 53.312 137.104 54.5813 135.722 55.44C134.378 56.2613 132.568 56.672 130.29 56.672ZM150.654 67.2V26.88H158.102V31.584C158.886 29.9787 159.987 28.6907 161.406 27.72C162.862 26.7493 164.859 26.264 167.398 26.264C169.414 26.264 171.281 26.6747 172.998 27.496C174.753 28.28 176.283 29.3813 177.59 30.8C178.897 32.1813 179.923 33.8053 180.67 35.672C181.417 37.5013 181.79 39.4613 181.79 41.552C181.79 44.352 181.137 46.9093 179.83 49.224C178.561 51.5013 176.843 53.3307 174.678 54.712C172.513 56.056 170.086 56.728 167.398 56.728C164.897 56.728 162.937 56.28 161.518 55.384C160.099 54.4507 158.998 53.2187 158.214 51.688V67.2H150.654ZM166.166 49.896C167.771 49.896 169.171 49.504 170.366 48.72C171.598 47.936 172.55 46.9093 173.222 45.64C173.894 44.3333 174.23 42.952 174.23 41.496C174.23 39.9653 173.894 38.5653 173.222 37.296C172.55 36.0267 171.598 35.0187 170.366 34.272C169.171 33.488 167.771 33.096 166.166 33.096C164.523 33.096 163.086 33.488 161.854 34.272C160.622 35.056 159.67 36.0827 158.998 37.352C158.326 38.6213 157.99 40.0213 157.99 41.552C157.99 43.0453 158.326 44.4267 158.998 45.696C159.67 46.9653 160.622 47.992 161.854 48.776C163.086 49.5227 164.523 49.896 166.166 49.896ZM185.162 56V15.12H192.722V56H185.162ZM210.465 56.728C207.814 56.728 205.388 56.056 203.185 54.712C201.02 53.3307 199.284 51.5013 197.977 49.224C196.708 46.9093 196.073 44.352 196.073 41.552C196.073 39.4613 196.446 37.5013 197.193 35.672C197.94 33.8053 198.966 32.1813 200.273 30.8C201.58 29.3813 203.092 28.28 204.809 27.496C206.564 26.6747 208.449 26.264 210.465 26.264C213.004 26.264 214.982 26.7493 216.401 27.72C217.82 28.6533 218.921 29.904 219.705 31.472V26.88H227.209V56H219.873V51.24C219.089 52.8827 217.969 54.208 216.513 55.216C215.094 56.224 213.078 56.728 210.465 56.728ZM211.697 49.896C213.377 49.896 214.814 49.5227 216.009 48.776C217.241 47.992 218.193 46.9653 218.865 45.696C219.537 44.4267 219.873 43.0453 219.873 41.552C219.873 40.0213 219.537 38.6213 218.865 37.352C218.193 36.0827 217.241 35.056 216.009 34.272C214.814 33.488 213.377 33.096 211.697 33.096C210.092 33.096 208.673 33.488 207.441 34.272C206.246 35.0187 205.313 36.0267 204.641 37.296C203.969 38.5653 203.633 39.9653 203.633 41.496C203.633 42.952 203.969 44.3333 204.641 45.64C205.313 46.9093 206.246 47.936 207.441 48.72C208.673 49.504 210.092 49.896 211.697 49.896ZM242.733 56C239.858 56 237.656 55.2907 236.125 53.872C234.594 52.4533 233.829 50.1573 233.829 46.984V33.32H229.741V26.88H233.829V21L241.389 20.216V26.88H247.549V33.32H241.389V46.592C241.389 48.384 242.173 49.28 243.741 49.28H246.877V56H242.733Z" fill="white"/>
      <defs>
        <clipPath id="clip0_0_3">
          <rect width="68" height="68" fill="white" transform="translate(0 2.5)"/>
        </clipPath>
      </defs>
    </svg>`;

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
