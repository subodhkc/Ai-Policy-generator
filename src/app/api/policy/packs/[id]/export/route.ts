import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { exportPolicyPack } from "@/lib/export-service";
import { createAuditLog, getClientIp, getUserAgent } from "@/lib/audit";

/**
 * GET /api/policy/packs/[id]/export?format=docx|pdf|zip
 * Export policy pack in specified format
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "docx";

    if (!["docx", "pdf", "zip"].includes(format)) {
      return NextResponse.json(
        { error: { message: "Invalid format. Use docx, pdf, or zip" } },
        { status: 400 }
      );
    }

    // Fetch policy pack with documents
    const policyPack = await prisma.policyPack.findUnique({
      where: { id: params.id },
      include: {
        organization: {
          select: {
            name: true,
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
    }

    // Generate export file
    console.log(`Generating ${format.toUpperCase()} export...`);
    const buffer = await exportPolicyPack({
      documents: policyPack.documents.map((doc) => ({
        id: doc.id,
        type: doc.documentType,
        title: doc.title,
        content: doc.content as any,
      })),
      companyName: policyPack.organization.name,
      format: format as "docx" | "pdf" | "zip",
    });

    // Create audit log
    if (session?.user) {
      await createAuditLog({
        userId: session.user.id,
        organizationId: policyPack.organizationId,
        policyPackId: policyPack.id,
        action: "POLICY_PACK_EXPORTED",
        metadata: { format },
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      });
    }

    // Determine content type and filename
    const contentTypes = {
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      pdf: "application/pdf",
      zip: "application/zip",
    };

    const extensions = {
      docx: "docx",
      pdf: "pdf",
      zip: "zip",
    };

    const contentType = contentTypes[format as keyof typeof contentTypes];
    const extension = extensions[format as keyof typeof extensions];
    const filename = `${policyPack.organization.name.replace(/[^a-zA-Z0-9]/g, "-")}-AI-Policies.${extension}`;

    // Return file as download
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: { message: "Failed to export policy pack" } },
      { status: 500 }
    );
  }
}
