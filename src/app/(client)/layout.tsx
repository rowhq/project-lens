/**
 * Client Portal Layout
 * For Lenders/Investors
 */

import { ClientLayoutWrapper } from "@/shared/components/layout/ClientLayoutWrapper";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth check disabled for mockup
  return <ClientLayoutWrapper>{children}</ClientLayoutWrapper>;
}
