import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { IntakeFormSchema } from "@/types";
import { findAllTemplates, replacePlaceholders, getStandardReplacements } from "@/lib/template-matcher";
import { generatePolicyWithAI } from "@/lib/ai-service";
import { sendWelcomeEmail } from "@/lib/email-service";
import { createAuditLog, getClientIp, getUserAgent } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    // Get session (optional - can generate without being logged in)
    const session = await getServerSession(authOptions);

    const body = await request.json();

    // Validate input
    const validatedData = IntakeFormSchema.parse(body);

    // Find best matching templates for all 4 policy types
    console.log("Finding matching templates...");
    const templates = await findAllTemplates(validatedData);

    // Get standard replacements (company name, date, etc.)
    const replacements = getStandardReplacements(validatedData);

    // If user is logged in, get/create organization
    let organizationId: string | undefined;
    let userId: string | undefined;

    if (session?.user) {
      userId = session.user.id;

      // Get user's organization
      const userOrg = await prisma.userOrganization.findFirst({
        where: { userId: session.user.id },
        include: { org: true },
      });

      if (userOrg) {
        // Update organization with intake data
        organizationId = userOrg.orgId;
        await prisma.organization.update({
          where: { id: organizationId },
          data: {
            name: validatedData.companyName,
            industry: validatedData.industry as any,
            companySize: validatedData.companySize,
            primaryGeo: validatedData.geography,
            primaryAiUse: validatedData.primaryAiUses,
          },
        });
      }
    } else {
      // Anonymous generation - create temporary organization
      const tempOrg = await prisma.organization.create({
        data: {
          name: validatedData.companyName,
          industry: validatedData.industry as any,
          companySize: validatedData.companySize,
          primaryGeo: validatedData.geography,
          primaryAiUse: validatedData.primaryAiUses,
        },
      });
      organizationId = tempOrg.id;
    }

    if (!organizationId) {
      throw new Error("Failed to create or find organization");
    }

    // Create policy pack
    console.log("Creating policy pack...");
    const policyPack = await prisma.policyPack.create({
      data: {
        organizationId,
        createdByUserId: userId,
        packVersion: 1,
        status: "DRAFT",
      },
    });

    // Generate and create all 4 policy documents
    console.log("Generating policy documents...");
    const documentPromises = [
      {
        type: "ACCEPTABLE_USE" as const,
        template: templates.acceptableUse,
      },
      {
        type: "RISK_STATEMENT" as const,
        template: templates.riskStatement,
      },
      {
        type: "INTERNAL_CONTROLS" as const,
        template: templates.internalControls,
      },
      {
        type: "STAFF_GUIDELINES" as const,
        template: templates.staffGuidelines,
      },
    ].map(async ({ type, template }) => {
      // Replace placeholders in template content
      const contentWithPlaceholders = replacePlaceholders(
        template.content,
        replacements
      );

      // Refine with AI (if API key is configured)
      let finalContent = contentWithPlaceholders;
      if (process.env.ANTHROPIC_API_KEY) {
        try {
          console.log(`Refining ${type} with AI...`);
          finalContent = await generatePolicyWithAI(
            type,
            contentWithPlaceholders,
            validatedData
          );
        } catch (error) {
          console.error(`AI refinement failed for ${type}:`, error);
          // Fallback to template with placeholders replaced
        }
      }

      // Create document in database
      return prisma.policyDocument.create({
        data: {
          policyPackId: policyPack.id,
          templateId: template.id,
          documentType: type,
          title: finalContent.title,
          content: finalContent,
        },
      });
    });

    const documents = await Promise.all(documentPromises);

    // Create generation request record (analytics)
    await prisma.generationRequest.create({
      data: {
        userId,
        organizationId,
        requestPayload: validatedData,
        responseMetadata: {
          documentsGenerated: documents.length,
          aiUsed: !!process.env.ANTHROPIC_API_KEY,
        },
      },
    });

    // Create email subscription if consent given
    if (validatedData.consent && userId) {
      await prisma.emailSubscription.upsert({
        where: {
          userId_email: {
            userId,
            email: validatedData.email,
          },
        },
        update: {
          consent: true,
          source: "policy_generation",
        },
        create: {
          userId,
          email: validatedData.email,
          consent: true,
          source: "policy_generation",
        },
      });
    }

    // Create audit log
    await createAuditLog({
      userId,
      organizationId,
      policyPackId: policyPack.id,
      action: "POLICY_PACK_GENERATED",
      metadata: {
        industry: validatedData.industry,
        companySize: validatedData.companySize,
        documentsCount: documents.length,
      },
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });

    // Send welcome email (async, non-blocking)
    if (validatedData.consent) {
      sendWelcomeEmail({
        to: validatedData.email,
        companyName: validatedData.companyName,
        policyPackId: policyPack.id,
      }).catch((error) => {
        console.error("Failed to send welcome email:", error);
      });
    }

    console.log("Policy pack generated successfully!");

    // Return the policy pack with documents
    return NextResponse.json({
      success: true,
      data: {
        policyPackId: policyPack.id,
        documents: documents.map((doc) => ({
          id: doc.id,
          type: doc.documentType,
          title: doc.title,
          content: doc.content,
        })),
      },
    });
  } catch (error: any) {
    console.error("Policy generation error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Invalid input data",
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || "Failed to generate policy pack",
        },
      },
      { status: 500 }
    );
  }
}
