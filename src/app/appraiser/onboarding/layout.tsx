import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, status: true, appraiserProfile: true },
  });

  if (!user || user.status !== "ACTIVE") {
    redirect("/login");
  }

  if (user.role !== "APPRAISER") {
    redirect("/dashboard");
  }

  // If already has profile, redirect to dashboard
  if (user.appraiserProfile) {
    redirect("/appraiser/dashboard");
  }

  // Simple wrapper for onboarding (no sidebar)
  return <div className="min-h-screen bg-[var(--background)]">{children}</div>;
}
