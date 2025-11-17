import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getClientIp, getUserAgent } from "@/lib/audit";

/**
 * POST /api/policy/packs/[id]/finalize
 * Finalize a policy pack (make it read-only)
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

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

    // Check if already finalized
    if (policyPack.status === "FINALIZED") {
      return NextResponse.json(
        { error: { message: "Policy pack is already finalized" } },
        { status: 400 }
      );
    }

    // If user is logged in, verify they have access
    if (session?.user) {
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
    }

    // Update pack status
    const updatedPack = await prisma.policyPack.update({
      where: { id: params.id },
      data: {
        status: "FINALIZED",
        finalizedAt: new Date(),
      },
    });

    // Create audit log
    if (session?.user) {
      await createAuditLog({
        userId: session.user.id,
        organizationId: policyPack.organizationId,
        policyPackId: policyPack.id,
        action: "POLICY_PACK_FINALIZED",
        metadata: {},
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedPack.id,
        status: updatedPack.status,
        finalizedAt: updatedPack.finalizedAt,
      },
    });
  } catch (error) {
    console.error("Finalization error:", error);
    return NextResponse.json(
      { error: { message: "Failed to finalize policy pack" } },
      { status: 500 }
    );
  }
}
