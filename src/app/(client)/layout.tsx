/**
 * Client Portal Layout
 * For Lenders/Investors
 */

import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { ClientLayoutWrapper } from "@/shared/components/layout/ClientLayoutWrapper";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return <ClientLayoutWrapper>{children}</ClientLayoutWrapper>;
}
