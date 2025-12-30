/**
 * OpenAI Client
 * Project LENS - Texas V1
 */

import OpenAI from "openai";

// Lazy initialization
let openaiInstance: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
}

export interface PropertyAnalysisInput {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  sqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  yearBuilt: number | null;
  lotSize: number | null;
  estimatedValue: number;
  comparables: Array<{
    address: string;
    salePrice: number;
    sqft: number;
    bedrooms: number;
    bathrooms: number;
    yearBuilt: number;
    distance: number;
  }>;
}

export interface PropertyAnalysisResult {
  summary: string;
  strengths: string[];
  concerns: string[];
  marketPosition: string;
  investmentPotential: string;
}

/**
 * Analyze a property using GPT-4
 */
export async function analyzeProperty(
  input: PropertyAnalysisInput
): Promise<PropertyAnalysisResult> {
  const openai = getOpenAI();

  const prompt = `You are a professional real estate appraiser analyzing a property for valuation purposes.

Property Details:
- Address: ${input.address}, ${input.city}, ${input.state} ${input.zipCode}
- Property Type: ${input.propertyType}
- Square Footage: ${input.sqft || "Unknown"}
- Bedrooms: ${input.bedrooms || "Unknown"}
- Bathrooms: ${input.bathrooms || "Unknown"}
- Year Built: ${input.yearBuilt || "Unknown"}
- Lot Size: ${input.lotSize ? `${input.lotSize} sq ft` : "Unknown"}
- Estimated Value: $${input.estimatedValue.toLocaleString()}

Comparable Sales (${input.comparables.length} properties):
${input.comparables
  .map(
    (comp, i) => `
${i + 1}. ${comp.address}
   - Sale Price: $${comp.salePrice.toLocaleString()}
   - Size: ${comp.sqft} sq ft | ${comp.bedrooms}bd/${comp.bathrooms}ba
   - Year Built: ${comp.yearBuilt}
   - Distance: ${comp.distance.toFixed(2)} miles`
  )
  .join("\n")}

Please provide a comprehensive analysis in JSON format with the following structure:
{
  "summary": "A 2-3 sentence executive summary of the property's value and market position",
  "strengths": ["Array of 3-5 key strengths of this property"],
  "concerns": ["Array of 2-4 potential concerns or risks"],
  "marketPosition": "A paragraph describing how this property compares to the local market",
  "investmentPotential": "A paragraph about the investment potential and future value trends"
}

Focus on:
1. Location quality and neighborhood trends
2. Property condition indicators (age, size, features)
3. Comparison to recent sales
4. Market timing and demand
5. Any red flags or exceptional features

Respond ONLY with valid JSON, no additional text.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content:
          "You are an expert real estate appraiser with 20 years of experience in the Texas market. You provide detailed, accurate, and professional property analyses.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1500,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  try {
    const result = JSON.parse(content) as PropertyAnalysisResult;
    return {
      summary: result.summary || "Analysis unavailable",
      strengths: result.strengths || [],
      concerns: result.concerns || [],
      marketPosition: result.marketPosition || "Unable to determine market position",
      investmentPotential: result.investmentPotential || "Unable to assess investment potential",
    };
  } catch {
    throw new Error("Failed to parse OpenAI response as JSON");
  }
}

/**
 * Generate a property description
 */
export async function generatePropertyDescription(params: {
  address: string;
  propertyType: string;
  sqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  yearBuilt: number | null;
  features: string[];
}): Promise<string> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content:
          "You are a professional real estate copywriter. Write concise, professional property descriptions.",
      },
      {
        role: "user",
        content: `Write a professional 2-3 sentence property description for:
Address: ${params.address}
Type: ${params.propertyType}
Size: ${params.sqft || "Unknown"} sq ft
Beds/Baths: ${params.bedrooms || "?"}/${params.bathrooms || "?"}
Year Built: ${params.yearBuilt || "Unknown"}
Features: ${params.features.join(", ") || "Standard features"}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 200,
  });

  return response.choices[0]?.message?.content || "Property description unavailable";
}

/**
 * Analyze market trends
 */
export async function analyzeMarketTrends(params: {
  city: string;
  state: string;
  zipCode: string;
  medianPrice: number;
  priceChange30d: number;
  priceChange90d: number;
  inventory: number;
  daysOnMarket: number;
}): Promise<{
  analysis: string;
  outlook: "bullish" | "bearish" | "neutral";
  confidence: number;
}> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content:
          "You are a real estate market analyst. Provide concise market analysis.",
      },
      {
        role: "user",
        content: `Analyze the market conditions for ${params.city}, ${params.state} ${params.zipCode}:
- Median Price: $${params.medianPrice.toLocaleString()}
- 30-day Price Change: ${params.priceChange30d > 0 ? "+" : ""}${params.priceChange30d}%
- 90-day Price Change: ${params.priceChange90d > 0 ? "+" : ""}${params.priceChange90d}%
- Active Inventory: ${params.inventory} homes
- Average Days on Market: ${params.daysOnMarket} days

Provide a JSON response with:
{
  "analysis": "2-3 sentence market analysis",
  "outlook": "bullish" | "bearish" | "neutral",
  "confidence": 0-100 confidence score
}`,
      },
    ],
    temperature: 0.5,
    max_tokens: 300,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return {
      analysis: "Market analysis unavailable",
      outlook: "neutral",
      confidence: 50,
    };
  }

  try {
    return JSON.parse(content);
  } catch {
    return {
      analysis: "Market analysis unavailable",
      outlook: "neutral",
      confidence: 50,
    };
  }
}
