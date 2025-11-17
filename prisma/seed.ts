import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...\n");

  // ============================================================================
  // 1. CREATE ADMIN USER
  // ============================================================================
  console.log("👤 Creating admin user...");

  const adminEmail = "admin@haiec.com";
  const adminPassword = "admin123!CHANGE_IN_PROD";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: hashedPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log(`✅ Admin user created: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}\n`);

  // ============================================================================
  // 2. CREATE POLICY TEMPLATES
  // ============================================================================
  console.log("📄 Creating policy templates...\n");

  // Template 1: Generic Acceptable Use Policy (Balanced)
  await prisma.policyTemplate.upsert({
    where: {
      id: "template-generic-acceptable-use"
    },
    update: {},
    create: {
      id: "template-generic-acceptable-use",
      templateType: "ACCEPTABLE_USE",
      industry: null, // Generic
      companySize: null,
      geo: null,
      riskPosture: "BALANCED",
      version: 1,
      isActive: true,
      content: {
        title: "AI Tools Acceptable Use Policy",
        sections: [
          {
            id: "purpose",
            heading: "1. Purpose and Scope",
            content: "This Acceptable Use Policy (\"Policy\") establishes guidelines for the responsible use of artificial intelligence (AI) tools and technologies by {{COMPANY_NAME}} employees, contractors, and authorized users. This Policy applies to all AI-powered applications, including but not limited to: generative AI platforms (e.g., ChatGPT, Claude), code assistants, automated content creation tools, and AI-enabled productivity software.",
            riskLevel: "low",
            notes: "Foundation section - establishes authority and scope"
          },
          {
            id: "permitted-uses",
            heading: "2. Permitted Uses",
            content: "AI tools may be used for the following purposes:\n\n• Enhancing productivity and efficiency in daily work tasks\n• Drafting and editing documents, emails, and communications (subject to review)\n• Research and information gathering\n• Code development and debugging (with human review)\n• Data analysis and visualization\n• Brainstorming and ideation\n• Learning and professional development\n\nAll uses must align with {{COMPANY_NAME}}'s business objectives and comply with applicable laws and regulations.",
            riskLevel: "low",
            notes: "Clearly defines acceptable use cases"
          },
          {
            id: "prohibited-uses",
            heading: "3. Prohibited Uses",
            content: "The following uses of AI tools are strictly prohibited:\n\n• Submitting confidential, proprietary, or sensitive information to public AI platforms\n• Processing customer data, personal information (PII), or protected health information (PHI)\n• Making final decisions on hiring, termination, or employee evaluation without human oversight\n• Creating misleading, false, or deceptive content\n• Bypassing security controls or data protection measures\n• Using AI-generated content without disclosure and verification\n• Violating intellectual property rights or licensing agreements\n• Automating communications with customers without disclosure\n• Any illegal, unethical, or discriminatory purposes",
            riskLevel: "high",
            notes: "Critical restrictions - enforce strictly"
          },
          {
            id: "data-protection",
            heading: "4. Data Protection and Confidentiality",
            content: "Users must adhere to the following data protection requirements:\n\n• Never input confidential business information into public AI platforms\n• Always use approved, enterprise-grade AI tools for sensitive work\n• Verify that AI tool vendors have appropriate data protection agreements\n• Be aware that inputs to public AI platforms may be used for training\n• Follow {{COMPANY_NAME}}'s Data Classification Policy when determining what information may be shared\n• Obtain explicit approval from Legal/Compliance before using AI tools with customer data",
            riskLevel: "high",
            notes: "Essential for compliance - link to Data Classification Policy"
          },
          {
            id: "accountability",
            heading: "5. Human Oversight and Accountability",
            content: "While AI tools can assist in work tasks, ultimate responsibility remains with human users:\n\n• All AI-generated content must be reviewed and verified by a qualified person\n• Users are accountable for the accuracy and quality of AI-assisted work\n• AI recommendations are advisory only; humans must make final decisions\n• Errors or biases in AI outputs are the responsibility of the user to identify and correct\n• Document the use of AI tools in decision-making processes where appropriate",
            riskLevel: "medium",
            notes: "Establishes accountability - critical for governance"
          },
          {
            id: "compliance",
            heading: "6. Compliance and Monitoring",
            content: "{{COMPANY_NAME}} reserves the right to:\n\n• Monitor use of company-approved AI tools\n• Audit AI-related activities for compliance with this Policy\n• Block access to unauthorized AI platforms\n• Require disclosure of AI tool usage in specific contexts\n\nViolations of this Policy may result in disciplinary action, up to and including termination of employment.",
            riskLevel: "medium",
            notes: "Enforcement mechanisms"
          },
          {
            id: "updates",
            heading: "7. Policy Updates",
            content: "This Policy will be reviewed and updated regularly to address evolving AI capabilities and risks. Employees will be notified of material changes.\n\nQuestions about this Policy should be directed to {{COMPANY_NAME}}'s IT Security or Compliance team.\n\nEffective Date: {{CURRENT_DATE}}\nLast Reviewed: {{CURRENT_DATE}}",
            riskLevel: "low",
            notes: "Administrative section"
          }
        ]
      }
    },
  });
  console.log("✅ Generic Acceptable Use Policy created");

  // Template 2: Software/SaaS Acceptable Use Policy (Industry-specific)
  await prisma.policyTemplate.upsert({
    where: { id: "template-saas-acceptable-use" },
    update: {},
    create: {
      id: "template-saas-acceptable-use",
      templateType: "ACCEPTABLE_USE",
      industry: "SOFTWARE_SAAS",
      companySize: null,
      geo: "US",
      riskPosture: "BALANCED",
      version: 1,
      isActive: true,
      content: {
        title: "AI Tools Acceptable Use Policy - Software Development",
        sections: [
          {
            id: "purpose",
            heading: "1. Purpose and Scope",
            content: "This Policy governs the use of AI tools in software development at {{COMPANY_NAME}}, including code generation, code review, testing, and DevOps automation. Given our role as a software company, we recognize both the opportunities and risks AI presents to our development processes and product security.",
            riskLevel: "low"
          },
          {
            id: "permitted-dev-uses",
            heading: "2. Permitted Uses in Development",
            content: "AI tools may be used for:\n\n• Code completion and suggestions (e.g., GitHub Copilot, Tabnine)\n• Debugging and error resolution\n• Code refactoring and optimization\n• Writing unit tests and test cases\n• Documentation generation\n• API design and schema generation\n• DevOps automation and infrastructure as code\n• Security vulnerability scanning\n\nAll AI-assisted code must undergo standard code review processes.",
            riskLevel: "medium",
            notes: "Development-specific use cases"
          },
          {
            id: "code-security",
            heading: "3. Code Security Requirements",
            content: "When using AI code assistants:\n\n• Never expose API keys, credentials, or secrets to AI tools\n• Review all AI-generated code for security vulnerabilities before committing\n• Run security scanning tools (SAST/DAST) on AI-assisted code\n• Be cautious of code suggestions that may introduce vulnerabilities\n• Verify AI-generated code doesn't violate open-source licenses\n• Document AI tool usage in commit messages where significant\n• Understand that AI-generated code may contain bugs or security flaws",
            riskLevel: "high",
            notes: "Critical for product security"
          },
          {
            id: "ip-ownership",
            heading: "4. Intellectual Property Considerations",
            content: "{{COMPANY_NAME}} retains ownership of all code, whether human-written or AI-assisted. However:\n\n• Developers must verify AI-generated code doesn't infringe third-party IP\n• Be aware that AI tools may suggest code similar to existing open-source projects\n• Follow license compatibility guidelines when using AI suggestions\n• Consult Legal team if uncertain about code provenance\n• Maintain records of AI tool usage for IP audit purposes",
            riskLevel: "medium",
            notes: "Legal compliance - consult Legal team"
          },
          {
            id: "customer-data",
            heading: "5. Customer Data Protection",
            content: "Strict prohibitions when working with customer data:\n\n• NEVER input customer data, PII, or production database content into AI tools\n• Use synthetic or anonymized data for AI-assisted testing\n• Obtain explicit approval before using AI tools that access customer systems\n• Follow SOC 2 and data protection requirements at all times\n• Report any accidental exposure of customer data to AI tools immediately",
            riskLevel: "high",
            notes: "Non-negotiable - SOC 2 compliance requirement"
          },
          {
            id: "enforcement",
            heading: "6. Compliance and Enforcement",
            content: "Engineering managers will:\n\n• Ensure team members complete AI tools training\n• Monitor AI tool usage through code review processes\n• Address policy violations promptly\n\nViolations may result in:\n• Revocation of AI tool access\n• Formal disciplinary action\n• Legal consequences for data breaches\n\nEffective Date: {{CURRENT_DATE}}",
            riskLevel: "medium"
          }
        ]
      }
    },
  });
  console.log("✅ Software/SaaS Acceptable Use Policy created");

  // Template 3: Generic AI Risk Statement
  await prisma.policyTemplate.upsert({
    where: { id: "template-generic-risk-statement" },
    update: {},
    create: {
      id: "template-generic-risk-statement",
      templateType: "RISK_STATEMENT",
      industry: null,
      companySize: null,
      geo: null,
      riskPosture: "BALANCED",
      version: 1,
      isActive: true,
      content: {
        title: "AI Risk Assessment and Mitigation Statement",
        sections: [
          {
            id: "executive-summary",
            heading: "Executive Summary",
            content: "{{COMPANY_NAME}} recognizes that the adoption of artificial intelligence (AI) tools presents both significant opportunities and inherent risks to our business operations, data security, and regulatory compliance. This Risk Statement identifies key AI-related risks and outlines our approach to mitigation and ongoing monitoring.",
            riskLevel: "low"
          },
          {
            id: "risk-data-privacy",
            heading: "Risk 1: Data Privacy and Confidentiality Breaches",
            content: "**Risk Description:** Employees may inadvertently expose confidential business information, customer data, or personal information (PII) to public AI platforms that may use such inputs for training or may not adequately protect data in transit or at rest.\n\n**Risk Level:** HIGH\n\n**Mitigation Strategies:**\n• Implement clear data classification policies\n• Provide mandatory training on acceptable AI tool usage\n• Deploy enterprise AI solutions with appropriate data protection agreements\n• Monitor and restrict access to public AI platforms\n• Conduct regular audits of AI tool usage\n\n**Residual Risk:** MEDIUM (with controls in place)",
            riskLevel: "high",
            notes: "Primary risk area - requires continuous monitoring"
          },
          {
            id: "risk-accuracy",
            heading: "Risk 2: Inaccuracy and Hallucinations",
            content: "**Risk Description:** AI tools may generate plausible but incorrect information (\"hallucinations\"), leading to flawed decision-making, incorrect customer communications, or defective work products.\n\n**Risk Level:** MEDIUM\n\n**Mitigation Strategies:**\n• Require human review and verification of all AI-generated content\n• Establish quality assurance processes for AI-assisted work\n• Provide training on AI limitations and critical thinking\n• Implement version control and audit trails for AI-generated content\n• Use AI outputs as drafts requiring validation, not final deliverables\n\n**Residual Risk:** LOW-MEDIUM (with verification processes)",
            riskLevel: "medium",
            notes: "Ongoing concern - emphasize human oversight"
          },
          {
            id: "risk-bias",
            heading: "Risk 3: Algorithmic Bias and Discrimination",
            content: "**Risk Description:** AI systems may perpetuate or amplify existing biases in training data, potentially leading to discriminatory outcomes in hiring, customer service, or business decisions, exposing {{COMPANY_NAME}} to legal and reputational risks.\n\n**Risk Level:** MEDIUM-HIGH\n\n**Mitigation Strategies:**\n• Prohibit use of AI for final decisions in employment, lending, or similar high-stakes contexts\n• Implement human oversight for AI-assisted decision-making\n• Monitor AI outputs for potential bias\n• Provide diversity and inclusion training alongside AI training\n• Conduct periodic reviews of AI-assisted processes for disparate impact\n\n**Residual Risk:** MEDIUM",
            riskLevel: "high",
            notes: "Legal compliance risk - HR and Legal involvement required"
          },
          {
            id: "risk-ip",
            heading: "Risk 4: Intellectual Property Infringement",
            content: "**Risk Description:** AI tools may generate content or code that infringes on third-party intellectual property rights, potentially exposing {{COMPANY_NAME}} to copyright or patent litigation.\n\n**Risk Level:** MEDIUM\n\n**Mitigation Strategies:**\n• Review AI-generated content for potential IP issues\n• Maintain records of AI tool usage for IP audit purposes\n• Use AI tools from reputable vendors with IP indemnification\n• Consult Legal team when AI is used for significant creative or technical work\n• Implement plagiarism detection for AI-generated content\n\n**Residual Risk:** LOW-MEDIUM",
            riskLevel: "medium"
          },
          {
            id: "risk-compliance",
            heading: "Risk 5: Regulatory Non-Compliance",
            content: "**Risk Description:** Use of AI tools may violate industry regulations (GDPR, HIPAA, SOC 2, etc.) or emerging AI-specific regulations, leading to fines, sanctions, or loss of certifications.\n\n**Risk Level:** HIGH (for regulated industries)\n\n**Mitigation Strategies:**\n• Conduct compliance reviews before deploying AI tools in regulated contexts\n• Ensure AI vendors meet regulatory requirements (BAA for HIPAA, DPA for GDPR, etc.)\n• Maintain documentation of AI tool usage for compliance audits\n• Monitor evolving AI regulations in {{GEOGRAPHY}} and adjust policies accordingly\n• Engage Compliance team in AI adoption decisions\n\n**Residual Risk:** MEDIUM (with compliance oversight)",
            riskLevel: "high",
            notes: "Varies by industry - adjust based on applicable regulations"
          },
          {
            id: "monitoring",
            heading: "Ongoing Risk Monitoring and Review",
            content: "{{COMPANY_NAME}} will:\n\n• Review this Risk Statement quarterly or when significant changes occur\n• Monitor AI-related incidents and near-misses\n• Update mitigation strategies based on lessons learned\n• Stay informed of emerging AI risks and regulatory developments\n• Conduct annual AI risk assessments\n\n**Risk Owner:** Chief Information Security Officer (CISO) / Chief Compliance Officer\n**Last Reviewed:** {{CURRENT_DATE}}\n**Next Review:** {{NEXT_REVIEW_DATE}}",
            riskLevel: "low",
            notes: "Assign clear ownership and review schedule"
          }
        ]
      }
    },
  });
  console.log("✅ Generic Risk Statement created");

  // Template 4: Generic Internal Controls Overview
  await prisma.policyTemplate.upsert({
    where: { id: "template-generic-internal-controls" },
    update: {},
    create: {
      id: "template-generic-internal-controls",
      templateType: "INTERNAL_CONTROLS",
      industry: null,
      companySize: null,
      geo: null,
      riskPosture: "BALANCED",
      version: 1,
      isActive: true,
      content: {
        title: "AI Governance: Internal Controls Framework",
        sections: [
          {
            id: "overview",
            heading: "1. Internal Controls Overview",
            content: "This framework establishes internal controls to ensure responsible, compliant, and effective use of AI tools across {{COMPANY_NAME}}. These controls are designed to mitigate risks while enabling innovation and productivity gains from AI adoption.",
            riskLevel: "low"
          },
          {
            id: "control-access",
            heading: "2. Access Control and Authorization",
            content: "**Control Objective:** Ensure only authorized personnel can access AI tools appropriate to their roles and responsibilities.\n\n**Control Activities:**\n• Maintain inventory of approved AI tools and platforms\n• Implement role-based access control (RBAC) for enterprise AI tools\n• Require manager approval for access to advanced or paid AI services\n• Revoke access upon termination or role change\n• Review access permissions quarterly\n\n**Control Owner:** IT Security Team\n**Testing Frequency:** Quarterly\n**Effectiveness Rating:** To be assessed",
            riskLevel: "medium",
            notes: "IT Security owns - integrate with IAM systems"
          },
          {
            id: "control-data",
            heading: "3. Data Protection Controls",
            content: "**Control Objective:** Prevent unauthorized disclosure of confidential or sensitive information to AI platforms.\n\n**Control Activities:**\n• Deploy Data Loss Prevention (DLP) tools to monitor AI platform usage\n• Block access to unauthorized public AI platforms from corporate networks\n• Implement data classification labeling system\n• Require security review before using AI tools with confidential data\n• Encrypt data in transit and at rest when using AI tools\n• Use only AI vendors with appropriate data protection agreements (DPAs)\n\n**Control Owner:** Data Protection Officer / CISO\n**Testing Frequency:** Continuous (automated), Quarterly (manual review)\n**Effectiveness Rating:** To be assessed",
            riskLevel: "high",
            notes: "Critical control - technical + policy enforcement"
          },
          {
            id: "control-review",
            heading: "4. Human Review and Validation Controls",
            content: "**Control Objective:** Ensure AI-generated content and recommendations are reviewed and validated by qualified personnel before use.\n\n**Control Activities:**\n• Require documented review of AI-generated content before publishing or sending to customers\n• Implement approval workflows for AI-assisted decisions in high-risk areas (HR, finance, legal)\n• Maintain audit trails of AI usage and human review\n• Establish quality standards for AI-assisted work products\n• Conduct spot checks of AI-assisted work\n\n**Control Owner:** Department Managers\n**Testing Frequency:** Monthly sampling\n**Effectiveness Rating:** To be assessed",
            riskLevel: "medium",
            notes: "Distributed ownership - varies by function"
          },
          {
            id: "control-training",
            heading: "5. Training and Awareness Controls",
            content: "**Control Objective:** Ensure all AI tool users understand policies, risks, and proper usage.\n\n**Control Activities:**\n• Require completion of AI Acceptable Use Policy training before granting access\n• Provide role-specific AI training (e.g., developers, marketers, HR)\n• Distribute quarterly AI governance updates and case studies\n• Test knowledge retention through assessments\n• Track training completion rates\n\n**Control Owner:** HR / Learning & Development\n**Testing Frequency:** Annually (training completion), Quarterly (assessments)\n**Effectiveness Rating:** To be assessed",
            riskLevel: "medium",
            notes: "Foundation control - enables all others"
          },
          {
            id: "control-vendor",
            heading: "6. Vendor Management Controls",
            content: "**Control Objective:** Ensure AI tool vendors meet security, privacy, and compliance requirements.\n\n**Control Activities:**\n• Conduct vendor security assessments before approving AI tools\n• Require SOC 2 Type II reports or equivalent for enterprise AI vendors\n• Execute Data Processing Agreements (DPAs) and Business Associate Agreements (BAAs) as required\n• Review vendor AI training practices and data handling\n• Monitor vendor security incidents and breaches\n• Reassess vendors annually or upon material changes\n\n**Control Owner:** Procurement / Legal / IT Security\n**Testing Frequency:** Annually (reassessment), As needed (new vendors)\n**Effectiveness Rating:** To be assessed",
            riskLevel: "high",
            notes: "Legal and IT collaboration required"
          },
          {
            id: "control-incident",
            heading: "7. Incident Response Controls",
            content: "**Control Objective:** Detect, respond to, and learn from AI-related security incidents.\n\n**Control Activities:**\n• Establish incident reporting procedures for AI-related issues (data exposure, bias incidents, etc.)\n• Include AI scenarios in incident response playbooks\n• Conduct post-incident reviews and update controls accordingly\n• Maintain incident log for trend analysis\n• Report material incidents to leadership and board as appropriate\n\n**Control Owner:** Incident Response Team / CISO\n**Testing Frequency:** As needed (real incidents), Annually (tabletop exercise)\n**Effectiveness Rating:** To be assessed",
            riskLevel: "medium"
          },
          {
            id: "control-monitoring",
            heading: "8. Monitoring and Assurance",
            content: "**Governance Structure:**\n\n• **AI Governance Committee:** Meets quarterly to review AI risks, controls, and incidents\n  - Members: CISO, Legal, Compliance, HR, IT, Business Unit Leaders\n  - Reports to: Executive Leadership / Board Risk Committee\n\n• **Internal Audit:** Includes AI controls in annual audit plan\n\n• **Metrics and Reporting:**\n  - AI tool adoption and usage rates\n  - Policy violations and incidents\n  - Training completion rates\n  - Vendor compliance status\n  - Control effectiveness assessments\n\n**Review Cycle:** Controls effectiveness reviewed annually; policies reviewed semi-annually\n\n**Last Updated:** {{CURRENT_DATE}}",
            riskLevel: "low",
            notes: "Establish governance committee - ongoing oversight"
          }
        ]
      }
    },
  });
  console.log("✅ Generic Internal Controls created");

  // Template 5: Generic Staff Guidelines
  await prisma.policyTemplate.upsert({
    where: { id: "template-generic-staff-guidelines" },
    update: {},
    create: {
      id: "template-generic-staff-guidelines",
      templateType: "STAFF_GUIDELINES",
      industry: null,
      companySize: null,
      geo: null,
      riskPosture: "BALANCED",
      version: 1,
      isActive: true,
      content: {
        title: "AI Tools: Practical Guidelines for Staff",
        sections: [
          {
            id: "intro",
            heading: "Introduction: AI at {{COMPANY_NAME}}",
            content: "Welcome! {{COMPANY_NAME}} encourages responsible use of AI tools to enhance productivity, creativity, and innovation. These guidelines provide practical, day-to-day advice for using AI safely and effectively.\n\n**Key Principle:** AI is a powerful assistant, but YOU remain responsible for the quality, accuracy, and compliance of your work.",
            riskLevel: "low",
            notes: "Friendly, practical tone for end users"
          },
          {
            id: "quick-dos-donts",
            heading: "Quick Reference: Do's and Don'ts",
            content: "**DO:**\n✅ Use AI to brainstorm ideas and draft initial content\n✅ Verify and fact-check all AI-generated information\n✅ Review and edit AI outputs before sharing externally\n✅ Use approved, enterprise AI tools for work tasks\n✅ Ask for help if you're unsure about AI tool usage\n\n**DON'T:**\n❌ Input confidential company information into public AI platforms (ChatGPT, Claude, etc.)\n❌ Share customer data, PII, or sensitive information with AI tools\n❌ Use AI-generated content without reviewing and editing it\n❌ Rely solely on AI for important decisions\n❌ Assume AI outputs are always accurate or unbiased",
            riskLevel: "medium",
            notes: "Quick reference - most important rules"
          },
          {
            id: "common-scenarios",
            heading: "Common Use Cases and How to Handle Them",
            content: "**Scenario 1: Drafting an email to a customer**\n✅ OK: Ask AI to help structure your thoughts or suggest phrasing\n❌ NOT OK: Input customer-specific details or confidential pricing into public AI\n**Best Practice:** Use generic examples, then customize with real details after AI generates the draft.\n\n---\n\n**Scenario 2: Writing code or scripts**\n✅ OK: Use GitHub Copilot or approved code assistants for suggestions\n❌ NOT OK: Input proprietary algorithms, API keys, or customer data\n**Best Practice:** Review all AI-generated code for security issues and test thoroughly.\n\n---\n\n**Scenario 3: Research and data analysis**\n✅ OK: Ask AI to explain concepts or summarize public information\n❌ NOT OK: Upload internal reports or financial data for analysis\n**Best Practice:** Use AI for general knowledge; use approved analytics tools for company data.\n\n---\n\n**Scenario 4: Creating marketing content**\n✅ OK: Generate initial drafts, headlines, or social media ideas\n❌ NOT OK: Publish AI content without human review and brand alignment\n**Best Practice:** Treat AI output as a first draft requiring editing and fact-checking.\n\n---\n\n**Scenario 5: Hiring and HR decisions**\n✅ OK: Use AI to help write job descriptions (reviewed by HR)\n❌ NOT OK: Use AI to screen resumes or make hiring decisions\n**Best Practice:** AI can assist, but humans must make all employment decisions.",
            riskLevel: "medium",
            notes: "Concrete examples help staff understand practical application"
          },
          {
            id: "approved-tools",
            heading: "Approved AI Tools at {{COMPANY_NAME}}",
            content: "**Enterprise Tools (Recommended):**\nThese tools have been vetted and have appropriate data protection agreements:\n• [List your approved enterprise tools here, e.g., Microsoft Copilot 365, Anthropic Claude for Work, etc.]\n• Contact IT for access if you don't have it\n\n**Public Tools (Use with Caution):**\nThese may be used for non-confidential work only:\n• ChatGPT Free/Plus\n• Claude.ai\n• Google Gemini\n\n**Important:** Never input confidential company or customer information into public AI platforms.\n\n**Need an AI tool not listed?** Submit a request to IT Security for evaluation.",
            riskLevel: "medium",
            notes: "Customize this section with your actual approved tools"
          },
          {
            id: "red-flags",
            heading: "Red Flags: When NOT to Use AI",
            content: "Stop and ask for guidance if you're considering using AI for:\n\n🚩 Processing customer personal information (names, emails, addresses, etc.)\n🚩 Handling financial data or confidential business information\n🚩 Making final decisions on hiring, firing, promotions, or performance reviews\n🚩 Legal analysis or creating contracts (consult Legal team instead)\n🚩 Medical or health-related advice for employees or customers\n🚩 Any situation where errors could cause significant harm or legal liability\n\n**When in doubt, ask!** Contact: [IT Security email] or [Compliance team email]",
            riskLevel: "high",
            notes: "Critical warnings - make highly visible"
          },
          {
            id: "quality-checklist",
            heading: "Quality Checklist for AI-Assisted Work",
            content: "Before using or sharing AI-generated content, ask yourself:\n\n☐ Have I verified the factual accuracy?\n☐ Have I checked for potential bias or inappropriate content?\n☐ Have I edited it to match our company voice and standards?\n☐ Did I avoid inputting confidential information into the AI tool?\n☐ Would I be comfortable explaining my AI usage to my manager?\n☐ Have I disclosed AI assistance where appropriate (e.g., in code commits)?\n\nIf you answered NO to any question, revise before proceeding.",
            riskLevel: "medium",
            notes: "Practical self-assessment tool"
          },
          {
            id: "getting-help",
            heading: "Getting Help and Reporting Issues",
            content: "**Questions about AI tool usage?**\n• Check our internal AI knowledge base: [link]\n• Ask your manager or team lead\n• Contact IT Security: [email]\n• Attend monthly AI office hours: [calendar link]\n\n**Report these issues immediately:**\n• Accidental disclosure of confidential data to an AI tool\n• AI-generated content that appears biased or discriminatory\n• Suspected violation of this policy by yourself or others\n• Security concerns with AI tools\n\n**Reporting:** [Email/form link] - Reports can be made anonymously\n\n**No retaliation:** {{COMPANY_NAME}} prohibits retaliation against anyone who reports concerns in good faith.",
            riskLevel: "low",
            notes: "Encourage questions and reporting"
          },
          {
            id: "training",
            heading: "Required Training and Resources",
            content: "**Mandatory Training:**\nAll employees must complete \"AI Tools Responsible Use\" training within 30 days of hire or policy update.\n• Duration: 30 minutes\n• Access: [Learning platform link]\n\n**Optional Resources:**\n• \"Prompt Engineering Best Practices\" (LinkedIn Learning)\n• \"AI for [Your Role]\" department-specific guides\n• Monthly AI tips newsletter\n\n**Stay Informed:**\nAI capabilities and risks are evolving rapidly. We'll update these guidelines regularly. Watch for announcements!\n\n**Last Updated:** {{CURRENT_DATE}}\n**Questions?** Contact: ai-governance@{{COMPANY_DOMAIN}}",
            riskLevel: "low",
            notes: "Link to actual training resources"
          }
        ]
      }
    },
  });
  console.log("✅ Generic Staff Guidelines created");

  console.log("\n✨ Database seeding completed successfully!\n");
  console.log("Summary:");
  console.log("- 1 admin user created");
  console.log("- 5 policy templates created");
  console.log("\nYou can now run: npx prisma studio");
  console.log("To view the seeded data in Prisma Studio.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
