import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { regeneratePolicySection } from "@/lib/ai-service";
import { createAuditLog, getClientIp, getUserAgent } from "@/lib/audit";

/**
 * POST /api/policy/documents/[id]/regenerate
 * Regenerate a specific section of a policy document
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { sectionId } = body;

    if (!sectionId) {
      return NextResponse.json(
        { error: { message: "Section ID is required" } },
        { status: 400 }
      );
    }

    // Fetch document with organization data
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

    // Get organization details for context
    const org = document.policyPack.organization;

    // Build intake data context for AI (approximate from organization)
    const intakeContext = {
      companyName: org.name,
      industry: org.industry,
      companySize: org.companySize,
      geography: org.primaryGeo,
      primaryAiUses: org.primaryAiUse,
      riskPosture: "BALANCED" as const, // Default
      role: "Admin",
      email: session?.user?.email || "",
      consent: true,
      website: org.website || undefined,
    };

    // Regenerate section with AI
    const content = document.content as any;
    const regeneratedSection = await regeneratePolicySection(
      document.documentType as any,
      content,
      sectionId,
      intakeContext
    );

    // Update document with new section
    const updatedSections = content.sections.map((section: any) =>
      section.id === sectionId ? regeneratedSection : section
    );

    const updatedContent = {
      ...content,
      sections: updatedSections,
    };

    const updatedDocument = await prisma.policyDocument.update({
      where: { id: params.id },
      data: {
        content: updatedContent,
        lastRegeneratedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create audit log
    if (session?.user) {
      await createAuditLog({
        userId: session.user.id,
        organizationId: document.policyPack.organizationId,
        policyPackId: document.policyPackId,
        action: "DOCUMENT_REGENERATED",
        metadata: {
          documentId: document.id,
          sectionId,
        },
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        section: regeneratedSection,
        document: {
          id: updatedDocument.id,
          content: updatedDocument.content,
        },
      },
    });
  } catch (error) {
    console.error("Section regeneration error:", error);
    return NextResponse.json(
      { error: { message: "Failed to regenerate section" } },
      { status: 500 }
    );
  }
}
