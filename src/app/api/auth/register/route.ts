import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/server/db/prisma";
import { z } from "zod";
import {
  authRateLimiter,
  checkRateLimit,
  getClientIP,
} from "@/server/lib/ratelimit";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["CLIENT", "APPRAISER"]).optional().default("CLIENT"),
  organizationName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = getClientIP(request);
  const rateLimitResponse = await checkRateLimit(authRateLimiter, ip);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await hash(validated.password, 12);

    // Create organization if user is a client and provided org name
    let organizationId: string | undefined;
    if (validated.role === "CLIENT" && validated.organizationName) {
      const org = await prisma.organization.create({
        data: {
          name: validated.organizationName,
          slug:
            validated.organizationName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "") +
            "-" +
            Date.now(),
        },
      });
      organizationId = org.id;
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        firstName: validated.firstName,
        lastName: validated.lastName,
        role: validated.role,
        status: "ACTIVE",
        organizationId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    // Note: Appraiser profile is created during onboarding flow
    // The appraiser layout redirects to /appraiser/onboarding if profile doesn't exist

    return NextResponse.json(
      { message: "Account created successfully", user },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 },
    );
  }
}
