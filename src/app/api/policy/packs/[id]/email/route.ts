import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendExportEmail } from "@/lib/email-service";
import { createAuditLog, getClientIp, getUserAgent } from "@/lib/audit";

/**
 * POST /api/policy/packs/[id]/email
 * Email policy pack download link to user
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: { message: "Authentication required" } },
        { status: 401 }
      );
    }

    // Fetch policy pack
    const policyPack = await prisma.policyPack.findUnique({
      where: { id: params.id },
      include: {
        organization: true,
      },
    });

    if (!policyPack) {
      return NextResponse.json(
        { error: { message: "Policy pack not found" } },
        { status: 404 }
      );
    }

    // Verify user has access
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        userId: session.user.id,
        orgId: policyPack.organizationId,
      },
    });

    if (!userOrg) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 403 }
      );
    }

    // Generate download URL (valid for 7 days)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const downloadUrl = `${baseUrl}/api/policy/packs/${params.id}/export?format=zip`;

    // Send email
    await sendExportEmail({
      to: session.user.email!,
      companyName: policyPack.organization.name,
      downloadUrl,
      expiryHours: 168, // 7 days
    });

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      organizationId: policyPack.organizationId,
      policyPackId: policyPack.id,
      action: "POLICY_PACK_EMAILED",
      metadata: {
        recipient: session.user.email,
      },
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Email sent successfully",
      },
    });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json(
      { error: { message: "Failed to send email" } },
      { status: 500 }
    );
  }
}
