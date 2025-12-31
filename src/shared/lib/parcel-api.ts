/**
 * Parcel Data API Service
 * Handles fetching parcel boundaries and property data from ArcGIS
 */

export interface ParcelProperties {
  id: string;
  accountNumber: string;
  owner: string;
  situs: string;
  city: string;
  state: string;
  zip: string;
  acres: number;
  sqft: number;
  landValue: number;
  improvementValue: number;
  totalValue: number;
  yearBuilt: number;
  zoning: string;
  floodZone: string;
}

export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

class ParcelAPI {
  private apiUrl: string;

  constructor() {
    // Default to Montgomery County Texas ArcGIS public API
    this.apiUrl = process.env.NEXT_PUBLIC_ARCGIS_API_URL ||
      'https://services1.arcgis.com/PRoAPGnMSUqvTrzq/ArcGIS/rest/services/TaxParcel/FeatureServer/0/query';
  }

  /**
   * Fetch parcel boundaries for a given area (bounding box)
   */
  async fetchParcelsInBounds(bounds: Bounds): Promise<GeoJSON.FeatureCollection> {
    // Build spatial query for bounding box
    const envelope = `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`;

    const params = new URLSearchParams({
      where: '1=1',
      outFields: '*',
      geometry: envelope,
      geometryType: 'esriGeometryEnvelope',
      spatialRel: 'esriSpatialRelIntersects',
      inSR: '4326', // WGS84 (lat/lng)
      outSR: '4326', // Output in WGS84
      f: 'geojson',
      resultRecordCount: '500',
    });

    const url = `${this.apiUrl}?${params}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('ArcGIS API error:', response.status, response.statusText);
        return { type: 'FeatureCollection', features: [] };
      }

      const geojson = await response.json();
      return this.transformArcGISResponse(geojson);
    } catch (error) {
      console.error('Error fetching from ArcGIS:', error);
      return { type: 'FeatureCollection', features: [] };
    }
  }

  /**
   * Transform ArcGIS GeoJSON response to our parcel format
   */
  private transformArcGISResponse(geojson: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
    if (!geojson.features) {
      return { type: 'FeatureCollection', features: [] };
    }

    return {
      type: 'FeatureCollection',
      features: geojson.features.map((feature, index) => {
        const props = feature.properties || {};

        // Extract parcel ID
        const parcelId = props.PIN || props.ParcelID || props.PARCEL_ID || props.OBJECTID || `parcel_${index}`;

        // Extract owner name
        const ownerName = props.OwnerName || props.Owner_Name || props.OWNER_NAME || 'Unknown Owner';

        // Extract address
        const ownerAddress = props.OwnerAddress || props.Owner_Address || props.OWNER_ADDR || '';

        // Calculate base value
        const baseValue = props.MarketValue || props.MARKET_VALUE || props.TotalValue || (300000 + Math.random() * 700000);
        const landValue = Math.round(baseValue * 0.31);
        const improvementValue = baseValue - landValue;

        return {
          type: 'Feature' as const,
          id: parcelId,
          geometry: feature.geometry,
          properties: {
            id: parcelId,
            accountNumber: parcelId,
            owner: ownerName,
            situs: ownerAddress,
            city: props.City || 'Spring',
            state: 'TX',
            zip: props.ZipCode || '77389',
            acres: props.Shape__Area ? (props.Shape__Area / 43560) : 0.25,
            sqft: props.Shape__Area || 10000,
            landValue: landValue,
            improvementValue: improvementValue,
            totalValue: baseValue,
            yearBuilt: props.YearBuilt || props.YEAR_BUILT || 2015,
            zoning: props.Zoning || props.ZONING || 'Residential',
            floodZone: props.FloodZone || props.FLOOD_ZONE || 'X',
          } as ParcelProperties,
        };
      }),
    };
  }
}

// Export singleton instance
export const parcelAPI = new ParcelAPI();

// Export hook for React components
export function useParcelAPI() {
  return parcelAPI;
}
