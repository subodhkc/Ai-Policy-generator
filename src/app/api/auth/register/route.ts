import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getClientIp, getUserAgent } from "@/lib/audit";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: { message: "Email already registered" } },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    // Create user and organization in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email: validatedData.email,
          passwordHash,
          role: "USER",
        },
      });

      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: validatedData.companyName,
          industry: "OTHER", // Will be updated when they generate policies
          companySize: "SMALL",
          primaryGeo: "US",
          primaryAiUse: [],
        },
      });

      // Link user to organization as owner
      await tx.userOrganization.create({
        data: {
          userId: newUser.id,
          orgId: organization.id,
          role: "OWNER",
        },
      });

      return newUser;
    });

    // Create audit log
    await createAuditLog({
      userId: user.id,
      action: "USER_REGISTERED",
      metadata: { email: validatedData.email },
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: error.errors[0].message } },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
