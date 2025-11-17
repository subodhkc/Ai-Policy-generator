import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/policy/packs
 * List all policy packs for the authenticated user's organization
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    // Get user's organization
    const userOrg = await prisma.userOrganization.findFirst({
      where: { userId: session.user.id },
    });

    if (!userOrg) {
      return NextResponse.json({
        success: true,
        data: { packs: [] },
      });
    }

    // Fetch all policy packs for this organization
    const packs = await prisma.policyPack.findMany({
      where: {
        organizationId: userOrg.orgId,
      },
      include: {
        organization: {
          select: {
            name: true,
            industry: true,
          },
        },
        _count: {
          select: {
            documents: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        packs: packs.map((pack) => ({
          id: pack.id,
          organizationName: pack.organization.name,
          industry: pack.organization.industry,
          status: pack.status,
          documentsCount: pack._count.documents,
          createdAt: pack.createdAt,
          finalizedAt: pack.finalizedAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching policy packs:", error);
    return NextResponse.json(
      { error: { message: "Failed to fetch policy packs" } },
      { status: 500 }
    );
  }
}
