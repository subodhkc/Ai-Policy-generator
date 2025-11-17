import { z } from "zod";

// ============================================================================
// DATABASE ENUMS (matching Prisma schema)
// ============================================================================

export const IndustryType = {
  SOFTWARE_SAAS: "SOFTWARE_SAAS",
  HEALTHCARE: "HEALTHCARE",
  FINANCE_BANKING: "FINANCE_BANKING",
  RETAIL_ECOMMERCE: "RETAIL_ECOMMERCE",
  MANUFACTURING: "MANUFACTURING",
  EDUCATION: "EDUCATION",
  PROFESSIONAL_SERVICES: "PROFESSIONAL_SERVICES",
  GOVERNMENT_PUBLIC_SECTOR: "GOVERNMENT_PUBLIC_SECTOR",
  NON_PROFIT: "NON_PROFIT",
  OTHER: "OTHER",
} as const;

export const CompanySize = {
  MICRO: "MICRO",
  SMALL: "SMALL",
  MEDIUM: "MEDIUM",
  LARGE: "LARGE",
  ENTERPRISE: "ENTERPRISE",
} as const;

export const Geography = {
  US: "US",
  EU: "EU",
  UK: "UK",
  CANADA: "CANADA",
  AUSTRALIA: "AUSTRALIA",
  GLOBAL: "GLOBAL",
  OTHER: "OTHER",
} as const;

export const RiskPosture = {
  CONSERVATIVE: "CONSERVATIVE",
  BALANCED: "BALANCED",
  AGGRESSIVE: "AGGRESSIVE",
} as const;

export const TemplateType = {
  ACCEPTABLE_USE: "ACCEPTABLE_USE",
  RISK_STATEMENT: "RISK_STATEMENT",
  INTERNAL_CONTROLS: "INTERNAL_CONTROLS",
  STAFF_GUIDELINES: "STAFF_GUIDELINES",
} as const;

export type IndustryTypeValue = (typeof IndustryType)[keyof typeof IndustryType];
export type CompanySizeValue = (typeof CompanySize)[keyof typeof CompanySize];
export type GeographyValue = (typeof Geography)[keyof typeof Geography];
export type RiskPostureValue = (typeof RiskPosture)[keyof typeof RiskPosture];
export type TemplateTypeValue = (typeof TemplateType)[keyof typeof TemplateType];

// ============================================================================
// INTAKE FORM VALIDATION
// ============================================================================

export const IntakeFormSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  website: z.string().url().optional().or(z.literal("")),
  industry: z.string().min(1, "Industry is required"),
  companySize: z.enum(["MICRO", "SMALL", "MEDIUM", "LARGE", "ENTERPRISE"]),
  geography: z.enum(["US", "EU", "UK", "CANADA", "AUSTRALIA", "GLOBAL", "OTHER"]),
  primaryAiUses: z.array(z.string()).min(1, "Select at least one AI use case"),
  riskPosture: z.enum(["CONSERVATIVE", "BALANCED", "AGGRESSIVE"]),
  role: z.string().min(1, "Role is required"),
  email: z.string().email("Invalid email address"),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must consent to receive emails",
  }),
});

export type IntakeFormData = z.infer<typeof IntakeFormSchema>;

// ============================================================================
// POLICY CONTENT STRUCTURE
// ============================================================================

export interface PolicySection {
  id: string;
  heading: string;
  content: string;
  riskLevel?: "low" | "medium" | "high";
  notes?: string;
}

export interface PolicyContent {
  title: string;
  sections: PolicySection[];
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export interface PolicyPackResponse {
  policyPackId: string;
  documents: {
    id: string;
    type: TemplateTypeValue;
    title: string;
    content: PolicyContent;
  }[];
}

// ============================================================================
// AI USE CASES
// ============================================================================

export const AI_USE_CASES = [
  { id: "internal_productivity", label: "Internal Productivity (ChatGPT, etc.)" },
  { id: "customer_support", label: "Customer Support / Chatbots" },
  { id: "software_development", label: "Software Development (Copilot, etc.)" },
  { id: "content_creation", label: "Marketing / Content Creation" },
  { id: "data_analysis", label: "Data Analysis / Business Intelligence" },
  { id: "hr_recruitment", label: "HR / Recruitment" },
  { id: "sales", label: "Sales / Lead Generation" },
  { id: "product_features", label: "Product Features (AI in your product)" },
  { id: "other", label: "Other" },
] as const;

// ============================================================================
// INDUSTRY OPTIONS
// ============================================================================

export const INDUSTRY_OPTIONS = [
  { value: "SOFTWARE_SAAS", label: "Software / SaaS" },
  { value: "HEALTHCARE", label: "Healthcare / Medical" },
  { value: "FINANCE_BANKING", label: "Finance / Banking" },
  { value: "RETAIL_ECOMMERCE", label: "Retail / E-Commerce" },
  { value: "MANUFACTURING", label: "Manufacturing / Industrial" },
  { value: "EDUCATION", label: "Education / EdTech" },
  { value: "PROFESSIONAL_SERVICES", label: "Professional Services (Legal, Consulting, etc.)" },
  { value: "GOVERNMENT_PUBLIC_SECTOR", label: "Government / Public Sector" },
  { value: "NON_PROFIT", label: "Non-Profit" },
  { value: "OTHER", label: "Other" },
] as const;

// ============================================================================
// USER ROLE OPTIONS
// ============================================================================

export const USER_ROLE_OPTIONS = [
  "C-Suite (CEO, CTO, etc.)",
  "IT / Security",
  "Operations / COO",
  "Legal / Compliance",
  "HR / People Ops",
  "Product / Engineering",
  "Other",
] as const;
