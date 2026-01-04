import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";
import {
  authRateLimiter,
  checkRateLimit,
  getClientIP,
} from "@/server/lib/ratelimit";

const resetSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  // Rate limiting
  const ip = getClientIP(req);
  const rateLimitResponse = await checkRateLimit(authRateLimiter, ip);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const { token, password } = resetSchema.parse(body);

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 },
      );
    }

    // Hash new password
    const hashedPassword = await hash(password, 12);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
