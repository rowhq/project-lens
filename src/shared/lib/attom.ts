/**
 * ATTOM Data API Client
 * TruPlat - Texas V1
 *
 * ATTOM provides property data, comparable sales, and AVM (Automated Valuation Model)
 */

const ATTOM_BASE_URL = "https://api.gateway.attomdata.com/propertyapi/v1.0.0";

interface AttomConfig {
  apiKey: string;
}

let config: AttomConfig | null = null;

function getConfig(): AttomConfig {
  if (!config) {
    const apiKey = process.env.ATTOM_API_KEY;
    if (!apiKey) {
      throw new Error("ATTOM_API_KEY is not configured");
    }
    config = { apiKey };
  }
  return config;
}

async function attomFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const { apiKey } = getConfig();

  const url = new URL(`${ATTOM_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: {
      "Accept": "application/json",
      "apikey": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`ATTOM API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Types based on ATTOM API responses
export interface AttomProperty {
  identifier: {
    Id: string;
    fips: string;
    apn: string;
  };
  lot: {
    lotSize1: number;
    lotSize2: number;
  };
  area: {
    blockNum: string;
    countrySecSubd: string;
    countyUse1: string;
    munCode: string;
    munName: string;
    situs: {
      county: string;
      state: string;
    };
  };
  address: {
    country: string;
    countrySubd: string;
    line1: string;
    line2: string;
    locality: string;
    matchCode: string;
    oneLine: string;
    postal1: string;
    postal2: string;
    postal3: string;
  };
  location: {
    accuracy: string;
    latitude: string;
    longitude: string;
    distance: number;
    geoid: string;
  };
  summary: {
    propclass: string;
    propsubtype: string;
    proptype: string;
    yearbuilt: number;
    propLandUse: string;
    propIndicator: string;
    legal1: string;
  };
  building: {
    size: {
      bldgSize: number;
      grossSize: number;
      grossSizeAdjusted: number;
      groundFloorSize: number;
      livingSize: number;
      sizeInd: string;
      universalSize: number;
    };
    rooms: {
      bathFixtures: number;
      bathsFull: number;
      bathsTotal: number;
      beds: number;
      roomsTotal: number;
    };
    interior: {
      bsmtSize: number;
      bsmtType: string;
      fplcCount: number;
      fplcInd: string;
      fplcType: string;
    };
    construction: {
      condition: string;
      constructionType: string;
      foundationType: string;
      frameType: string;
      roofCover: string;
      roofShape: string;
      wallType: string;
    };
    parking: {
      garageType: string;
      prkgSize: number;
      prkgSpaces: string;
      prkgType: string;
    };
  };
  vintage: {
    lastModified: string;
    pubDate: string;
  };
}

export interface AttomAVM {
  property: {
    identifier: {
      Id: string;
    };
    address: {
      oneLine: string;
    };
  }[];
  avm: {
    amount: {
      value: number;
      high: number;
      low: number;
      valueRange: number;
    };
    calculated: string;
    eventDate: string;
    model: string;
  };
}

export interface AttomSalesHistory {
  property: {
    identifier: {
      Id: string;
    };
    address: {
      oneLine: string;
    };
    sale: {
      saleSearchDate: string;
      saleTransDate: string;
      amount: {
        saleAmt: number;
        saleCode: string;
        saleRecDate: string;
        saleDisclosureType: number;
        saleDocType: string;
      };
      calculation: {
        pricePerBed: number;
        pricePerSizeUnit: number;
      };
    };
  }[];
}

export interface AttomComparable {
  identifier: {
    Id: string;
  };
  address: {
    oneLine: string;
    locality: string;
    countrySubd: string;
    postal1: string;
  };
  location: {
    latitude: string;
    longitude: string;
    distance: number;
  };
  building: {
    size: {
      livingSize: number;
    };
    rooms: {
      beds: number;
      bathsTotal: number;
    };
  };
  summary: {
    yearbuilt: number;
  };
  sale: {
    saleTransDate: string;
    amount: {
      saleAmt: number;
    };
    calculation: {
      pricePerSizeUnit: number;
    };
  };
}

/**
 * Get property details by address
 */
export async function getPropertyByAddress(params: {
  address: string;
  city: string;
  state: string;
  zipCode?: string;
}): Promise<AttomProperty | null> {
  try {
    const searchParams: Record<string, string> = {
      address1: params.address,
      address2: `${params.city}, ${params.state}${params.zipCode ? ` ${params.zipCode}` : ""}`,
    };

    const response = await attomFetch<{ property: AttomProperty[] }>(
      "/property/basicprofile",
      searchParams
    );

    return response.property?.[0] || null;
  } catch (error) {
    console.error("ATTOM getPropertyByAddress error:", error);
    return null;
  }
}

/**
 * Get AVM (Automated Valuation Model) for a property
 */
export async function getPropertyAVM(params: {
  address: string;
  city: string;
  state: string;
  zipCode?: string;
}): Promise<AttomAVM | null> {
  try {
    const searchParams: Record<string, string> = {
      address1: params.address,
      address2: `${params.city}, ${params.state}${params.zipCode ? ` ${params.zipCode}` : ""}`,
    };

    const response = await attomFetch<AttomAVM>(
      "/attomavm/detail",
      searchParams
    );

    return response;
  } catch (error) {
    console.error("ATTOM getPropertyAVM error:", error);
    return null;
  }
}

/**
 * Get sales history for a property
 */
export async function getSalesHistory(params: {
  address: string;
  city: string;
  state: string;
}): Promise<AttomSalesHistory | null> {
  try {
    const searchParams: Record<string, string> = {
      address1: params.address,
      address2: `${params.city}, ${params.state}`,
    };

    const response = await attomFetch<AttomSalesHistory>(
      "/saleshistory/detail",
      searchParams
    );

    return response;
  } catch (error) {
    console.error("ATTOM getSalesHistory error:", error);
    return null;
  }
}

/**
 * Get comparable sales for a property
 */
export async function getComparableSales(params: {
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  radius?: number; // miles
  maxResults?: number;
}): Promise<AttomComparable[]> {
  try {
    const searchParams: Record<string, string> = {
      address1: params.address,
      address2: `${params.city}, ${params.state}${params.zipCode ? ` ${params.zipCode}` : ""}`,
      searchType: "Radius",
      radius: String(params.radius || 1),
      minComps: "3",
      maxComps: String(params.maxResults || 10),
    };

    const response = await attomFetch<{ property: AttomComparable[] }>(
      "/salescomps/address",
      searchParams
    );

    return response.property || [];
  } catch (error) {
    console.error("ATTOM getComparableSales error:", error);
    return [];
  }
}

/**
 * Get market statistics for an area
 */
export async function getMarketStats(params: {
  zipCode: string;
}): Promise<{
  medianPrice: number;
  avgPricePerSqft: number;
  avgDaysOnMarket: number;
  totalListings: number;
  priceChange30d: number;
  priceChange90d: number;
} | null> {
  try {
    const response = await attomFetch<{
      status: { code: number };
      postalcodes: Array<{
        mediaHomePrice: number;
        averagePricePerSquareFoot: number;
        averageDaysOnMarket: number;
        numberOfListings: number;
        priceChange1Month: number;
        priceChange3Month: number;
      }>;
    }>("/market/snapshot", {
      postalcode: params.zipCode,
    });

    const data = response.postalcodes?.[0];
    if (!data) return null;

    return {
      medianPrice: data.mediaHomePrice || 0,
      avgPricePerSqft: data.averagePricePerSquareFoot || 0,
      avgDaysOnMarket: data.averageDaysOnMarket || 0,
      totalListings: data.numberOfListings || 0,
      priceChange30d: data.priceChange1Month || 0,
      priceChange90d: data.priceChange3Month || 0,
    };
  } catch (error) {
    console.error("ATTOM getMarketStats error:", error);
    return null;
  }
}

/**
 * Convert ATTOM property to our internal format
 */
export function normalizeProperty(attomProperty: AttomProperty) {
  return {
    address: attomProperty.address.line1,
    city: attomProperty.address.locality,
    state: attomProperty.address.countrySubd,
    zipCode: attomProperty.address.postal1,
    county: attomProperty.area?.situs?.county || "",
    latitude: parseFloat(attomProperty.location.latitude) || null,
    longitude: parseFloat(attomProperty.location.longitude) || null,
    propertyType: mapPropertyType(attomProperty.summary.proptype),
    sqft: attomProperty.building?.size?.livingSize || null,
    bedrooms: attomProperty.building?.rooms?.beds || null,
    bathrooms: attomProperty.building?.rooms?.bathsTotal || null,
    yearBuilt: attomProperty.summary.yearbuilt || null,
    lotSize: attomProperty.lot?.lotSize1 || null,
  };
}

function mapPropertyType(attomType: string): string {
  const typeMap: Record<string, string> = {
    "SFR": "SINGLE_FAMILY",
    "SINGLE FAMILY": "SINGLE_FAMILY",
    "CONDO": "CONDO",
    "TOWNHOUSE": "TOWNHOUSE",
    "MULTI-FAMILY": "MULTI_FAMILY",
    "COMMERCIAL": "COMMERCIAL",
    "LAND": "LAND",
  };
  return typeMap[attomType?.toUpperCase()] || "SINGLE_FAMILY";
}

/**
 * Convert ATTOM comparable to our internal format
 */
export function normalizeComparable(comp: AttomComparable) {
  return {
    id: comp.identifier.Id,
    address: comp.address.oneLine,
    city: comp.address.locality,
    state: comp.address.countrySubd,
    zipCode: comp.address.postal1,
    latitude: parseFloat(comp.location.latitude) || null,
    longitude: parseFloat(comp.location.longitude) || null,
    salePrice: comp.sale.amount.saleAmt,
    saleDate: comp.sale.saleTransDate,
    sqft: comp.building?.size?.livingSize || 0,
    bedrooms: comp.building?.rooms?.beds || 0,
    bathrooms: comp.building?.rooms?.bathsTotal || 0,
    yearBuilt: comp.summary.yearbuilt || 0,
    distance: comp.location.distance || 0,
    pricePerSqft: comp.sale.calculation?.pricePerSizeUnit || 0,
  };
}
