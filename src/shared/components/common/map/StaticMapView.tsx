/**
 * StaticMapView - Static map image using OpenStreetMap
 * Free, no API key required
 */

export interface StaticMapViewProps {
  longitude: number;
  latitude: number;
  zoom?: number;
  width?: number;
  height?: number;
  marker?: boolean;
  className?: string;
}

export function StaticMapView({
  longitude,
  latitude,
  zoom = 15,
  width = 600,
  height = 400,
  marker = true,
  className = "",
}: StaticMapViewProps) {
  // Use OpenStreetMap static map service (free)
  const markerParam = marker
    ? `&markers=${longitude},${latitude},red-pushpin`
    : "";
  const url = `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}&maptype=osmarenderer${markerParam}`;

  return (
    <img
      src={url}
      alt="Map location"
      className={`rounded-lg ${className}`}
      width={width}
      height={height}
      loading="lazy"
    />
  );
}

export default StaticMapView;
