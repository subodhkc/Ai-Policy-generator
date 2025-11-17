import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getClientIp, getUserAgent } from "@/lib/audit";

/**
 * GET /api/policy/packs/[id]
 * Fetch a specific policy pack with all documents
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Fetch policy pack with documents
    const policyPack = await prisma.policyPack.findUnique({
      where: { id: params.id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            industry: true,
          },
        },
        documents: {
          orderBy: {
            documentType: "asc",
          },
        },
      },
    });

    if (!policyPack) {
      return NextResponse.json(
        { error: { message: "Policy pack not found" } },
        { status: 404 }
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

      // Create audit log for viewing
      await createAuditLog({
        userId: session.user.id,
        organizationId: policyPack.organizationId,
        policyPackId: policyPack.id,
        action: "POLICY_PACK_VIEWED",
        metadata: {},
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: policyPack.id,
        organizationName: policyPack.organization.name,
        status: policyPack.status,
        createdAt: policyPack.createdAt,
        finalizedAt: policyPack.finalizedAt,
        documents: policyPack.documents.map((doc) => ({
          id: doc.id,
          type: doc.documentType,
          title: doc.title,
          content: doc.content,
          lastRegeneratedAt: doc.lastRegeneratedAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching policy pack:", error);
    return NextResponse.json(
      { error: { message: "Failed to fetch policy pack" } },
      { status: 500 }
    );
  }
}
