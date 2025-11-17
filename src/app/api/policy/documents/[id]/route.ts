import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getClientIp, getUserAgent } from "@/lib/audit";

/**
 * PUT /api/policy/documents/[id]
 * Update a policy document's content
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    // Fetch document to check authorization
    const document = await prisma.policyDocument.findUnique({
      where: { id: params.id },
      include: {
        policyPack: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: { message: "Document not found" } },
        { status: 404 }
      );
    }

    // Check if pack is finalized
    if (document.policyPack.status === "FINALIZED") {
      return NextResponse.json(
        { error: { message: "Cannot edit finalized policy pack" } },
        { status: 403 }
      );
    }

    // If user is logged in, verify they have access
    if (session?.user) {
      const userOrg = await prisma.userOrganization.findFirst({
        where: {
          userId: session.user.id,
          orgId: document.policyPack.organizationId,
        },
      });

      if (!userOrg) {
        return NextResponse.json(
          { error: { message: "Unauthorized" } },
          { status: 403 }
        );
      }
    }

    // Update document
    const updatedDocument = await prisma.policyDocument.update({
      where: { id: params.id },
      data: {
        content: body.content,
        updatedAt: new Date(),
      },
    });

    // Create audit log
    if (session?.user) {
      await createAuditLog({
        userId: session.user.id,
        organizationId: document.policyPack.organizationId,
        policyPackId: document.policyPackId,
        action: "DOCUMENT_UPDATED",
        metadata: {
          documentId: document.id,
          documentType: document.documentType,
        },
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedDocument.id,
        content: updatedDocument.content,
      },
    });
  } catch (error) {
    console.error("Document update error:", error);
    return NextResponse.json(
      { error: { message: "Failed to update document" } },
      { status: 500 }
    );
  }
}
