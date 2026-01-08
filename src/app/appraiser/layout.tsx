/**
 * Appraiser Portal Layout
 * Desktop: Sidebar navigation (consistent with Client)
 * Mobile: Bottom navigation (mobile-first for field work)
 */

import { AppraiserLayoutWrapper } from "@/shared/components/layout/AppraiserLayoutWrapper";

export default function AppraiserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth check disabled for mockup
  return <AppraiserLayoutWrapper>{children}</AppraiserLayoutWrapper>;
}
