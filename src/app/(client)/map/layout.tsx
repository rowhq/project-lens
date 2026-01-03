/**
 * Special Layout for Map Page
 * Map uses fixed positioning, so just render children directly
 */

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
