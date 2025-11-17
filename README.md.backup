# HAIEC AI Policy Generator

> **Production-Ready Lead Magnet Tool**: Generate comprehensive AI governance policy packs in minutes.

A free web application that helps businesses create professional AI governance policies including Acceptable Use Policies, Risk Statements, Internal Controls, and Staff Guidelines—all tailored to their industry, size, and risk tolerance.

---

## 🎯 Overview

### What is HAIEC AI Policy Generator?

HAIEC AI Policy Generator is a sophisticated lead generation tool that provides immediate value to prospects while capturing qualified leads for your AI governance consulting business.

**Value Proposition:**
- ✅ **For Users**: Get a complete, customized AI policy pack in 5-10 minutes—free
- ✅ **For HAIEC**: Capture leads with context (industry, size, AI uses, email) for targeted follow-up

**What Users Get:**
1. **Acceptable Use Policy** - Governs employee AI tool usage
2. **AI Risk Statement** - Identifies and mitigates AI-related risks
3. **Internal Controls Overview** - Framework for AI governance
4. **Staff Guidelines** - Practical, actionable guidance for employees

**All customized based on:**
- Company size (1-10, 11-50, 51-200, 201-1000, 1000+)
- Industry (Software/SaaS, Healthcare, Finance, etc.)
- Geography (US, EU, UK, Global)
- Risk posture (Conservative, Balanced, Aggressive)
- Primary AI use cases (productivity, customer support, hiring, etc.)

---

## 🏗️ Architecture

### Tech Stack

**Chosen Stack: Next.js Full-Stack** ✅

- **Frontend**: Next.js 14 (App Router) + React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js (email/password + session management)
- **AI Integration**: Anthropic Claude API (Claude 3.5 Sonnet)
- **Email**: Resend (transactional emails)
- **File Export**: pdf-lib (PDF) + docx (DOCX) + jszip (ZIP)
- **Deployment**: Vercel (frontend + API) + Vercel Postgres / Neon

**Why This Stack?**
1. **Single codebase** - Easier to maintain and deploy
2. **Serverless scaling** - Handles traffic spikes automatically
3. **Built-in API routes** - No separate backend deployment needed
4. **Type-safe end-to-end** - TypeScript across frontend and backend
5. **Lower cost** - ~$20-40/month vs. dual deployment

---

## 📊 Database Schema

Implemented with Prisma ORM. See `frontend/prisma/schema.prisma` for full details.

### Core Models

```
users → User accounts with email/password auth
  ├─ id, email, passwordHash, role (USER | ADMIN)
  ├─ emailVerified, createdAt, updatedAt
  └─ Relations: organizations, policyPacks, auditLogs

organizations → Company/organization records
  ├─ id, name, website, industry
  ├─ companySize, primaryGeo, primaryAiUse
  └─ Relations: users, policyPacks, generationRequests

policy_templates → Base policy templates
  ├─ id, templateType, industry, companySize, geo, riskPosture
  ├─ version, content (JSON), isActive
  └─ Used for: Template matching and AI generation

policy_packs → Generated policy collections
  ├─ id, organizationId, createdByUserId
  ├─ packVersion, status (DRAFT | FINALIZED)
  └─ Relations: documents (4 per pack)

policy_documents → Individual policy documents
  ├─ id, policyPackId, templateId, documentType
  ├─ title, content (JSON), lastRegeneratedAt
  └─ Content structure: { title, sections: [{ id, heading, content, riskLevel, notes }] }

generation_requests → Audit trail of generations
  ├─ id, userId, organizationId
  ├─ requestPayload (intake data), responseMetadata
  └─ Used for: Analytics and improvement

email_subscriptions → Marketing consent tracking
  ├─ id, userId, email, consent, source
  └─ Used for: Follow-up campaigns

audit_log → Comprehensive action tracking
  ├─ id, userId, organizationId, action, metadata
  └─ Actions: GENERATE_POLICY, DOWNLOAD_PACK, UPDATE_DOCUMENT, etc.
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ (or use Vercel Postgres / Neon)
- Anthropic API key ([get one here](https://console.anthropic.com/))

### Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/subodhkc/Ai-Policy-generator.git
cd Ai-Policy-generator/frontend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, ANTHROPIC_API_KEY, NEXTAUTH_SECRET

# 4. Set up database
npm run db:push          # Create database schema
npm run db:seed          # Seed base templates

# 5. Start development server
npm run dev
```

Navigate to `http://localhost:3000`

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/route.ts    # NextAuth handler
│   │   │   │   └── register/route.ts         # User registration
│   │   │   └── policy/
│   │   │       ├── generate-pack/route.ts    # Policy generation
│   │   │       └── packs/
│   │   │           ├── route.ts              # List packs
│   │   │           └── [id]/
│   │   │               ├── route.ts          # Get specific pack
│   │   │               └── export/route.ts   # Export pack
│   │   ├── (auth)/               # Auth pages (to implement)
│   │   ├── (dashboard)/          # Dashboard pages (to implement)
│   │   ├── (admin)/              # Admin pages (to implement)
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Landing page (to implement)
│   │   └── globals.css
│   │
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui components (existing)
│   │   ├── forms/                # Intake form components (to implement)
│   │   ├── workspace/            # Policy workspace components (to implement)
│   │   └── admin/                # Admin components (to implement)
│   │
│   ├── lib/                      # Core services ✅
│   │   ├── prisma.ts             # Prisma client singleton
│   │   ├── auth.ts               # NextAuth configuration
│   │   ├── ai-service.ts         # AI policy generation
│   │   ├── template-matcher.ts   # Template selection logic
│   │   ├── export-service.ts     # DOCX/PDF/ZIP export
│   │   ├── email-service.ts      # Email sending (Resend)
│   │   └── audit.ts              # Audit logging utilities
│   │
│   ├── types/                    # TypeScript types ✅
│   │   ├── index.ts              # Shared types
│   │   └── next-auth.d.ts        # NextAuth type extensions
│   │
│   └── middleware.ts             # Auth middleware (to implement)
│
├── prisma/                       # Database ✅
│   ├── schema.prisma             # Complete database schema
│   ├── seed.ts                   # Template seeding script
│   └── migrations/               # Auto-generated migrations
│
├── prisma.config.ts              # Prisma configuration
├── package.json
├── .env.example                  # Environment variables template ✅
└── README.md                     # This file
```

---

## 🔑 Core Functionality

### 1. Policy Generation Flow ✅

**Implemented:**
- ✅ Intake form validation (Zod schemas)
- ✅ Template matching algorithm (scores by industry, size, geo, risk posture)
- ✅ AI refinement using Claude 3.5 Sonnet
- ✅ Placeholder replacement (company name, geography, etc.)
- ✅ Database persistence (policy_packs + policy_documents)
- ✅ Audit logging
- ✅ Email subscription tracking
- ✅ Welcome email (async)

**API Endpoint:** `POST /api/policy/generate-pack`

**Input:**
```json
{
  "companyName": "Acme Corp",
  "industry": "Software / SaaS",
  "companySize": "SMALL",
  "geography": "US",
  "primaryAiUses": ["internal_productivity", "software_development"],
  "riskPosture": "BALANCED",
  "role": "IT/Security",
  "email": "cto@acme.com",
  "consent": true
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "policyPackId": "clxy123abc",
    "documents": [
      {
        "id": "doc1",
        "type": "ACCEPTABLE_USE",
        "title": "AI Tools Acceptable Use Policy",
        "content": { ... }
      },
      // ... 3 more documents
    ]
  }
}
```

### 2. Export System ✅

**Implemented:**
- ✅ DOCX export (single file with all policies)
- ✅ PDF export (single file with all policies)
- ✅ ZIP export (individual DOCX files per policy)
- ✅ Disclaimer page in all exports
- ✅ Audit logging of downloads

**API Endpoint:** `GET /api/policy/packs/[id]/export?format=docx|pdf|zip`

**Libraries Used:**
- `docx` - Microsoft Word document generation
- `pdf-lib` - PDF document creation
- `jszip` - ZIP archive creation

### 3. Template System ✅

**Base Templates Seeded:**
- ✅ Generic Acceptable Use Policy (Balanced risk)
- ✅ Software/SaaS Acceptable Use Policy (US, Balanced)
- ✅ Generic Risk Statement (Balanced)
- ✅ Generic Internal Controls (Balanced)
- ✅ Generic Staff Guidelines (Balanced)

**Template Matching Algorithm:**
```
Score =
  + 50 points for exact industry match
  + 30 points for risk posture match
  + 15 points for geography match
  + 10 points for company size match
  + 5 points for generic templates (fallback)
```

**Template Content Structure:**
```json
{
  "title": "Policy Title",
  "sections": [
    {
      "id": "unique-section-id",
      "heading": "Section Heading",
      "content": "Section content with {{PLACEHOLDERS}}",
      "riskLevel": "low|medium|high",
      "notes": "Optional notes for reviewer"
    }
  ]
}
```

### 4. Authentication System ✅

**Implemented:**
- ✅ NextAuth.js with credentials provider
- ✅ Email/password authentication
- ✅ Bcrypt password hashing (12 rounds)
- ✅ JWT session strategy (30-day expiry)
- ✅ User registration with automatic organization creation
- ✅ Role-based access (USER, ADMIN)

**API Endpoints:**
- `POST /api/auth/register` - User registration
- `/api/auth/[...nextauth]` - NextAuth handlers (login, logout, session)

---

## 🎨 Frontend Implementation Status

### ✅ Completed (Backend/API)

- Database schema and migrations
- All core services (AI, templates, export, email, audit)
- API routes for policy generation, CRUD, and export
- NextAuth configuration
- Type definitions

### 🚧 To Implement (Frontend UI)

The following React components need to be built:

#### 1. Landing Page
- **File:** `src/app/page.tsx`
- **Requirements:**
  - Hero section with clear value proposition
  - "Generate my AI policy pack" primary CTA
  - Features/benefits section
  - Social proof (if available)
  - Footer with disclaimer

#### 2. Intake Form
- **Component:** `src/components/forms/intake-form.tsx`
- **Fields:**
  - Company name (required)
  - Company website (optional)
  - Industry (dropdown + "Other")
  - Company size (radio buttons)
  - Geography (dropdown)
  - Primary AI uses (multi-select checkboxes)
  - Risk posture (radio: conservative/balanced/aggressive)
  - Role (dropdown)
  - Email (required)
  - Consent checkbox
- **Tech:** React Hook Form + Zod validation + shadcn/ui components

#### 3. Policy Workspace
- **Component:** `src/components/workspace/policy-workspace.tsx`
- **Features:**
  - 4 tabs (Acceptable Use, Risk Statement, Internal Controls, Staff Guidelines)
  - Editable sections with rich text editor (e.g., Tiptap, Lexical)
  - Sidebar with reviewer notes
  - Risk level indicators (low/medium/high)
  - "Regenerate section" button (per section)
  - "Download pack" button (DOCX/PDF/ZIP selector)
  - "Email me the pack" button
  - "Finalize" button (creates read-only snapshot)

#### 4. Dashboard
- **File:** `src/app/(dashboard)/dashboard/page.tsx`
- **Features:**
  - List of policy packs (table or cards)
  - Pack status (Draft/Finalized)
  - Created date
  - Quick actions: Open, Export, Duplicate
  - "Create new pack" button

#### 5. Admin Panel
- **File:** `src/app/(admin)/admin/templates/page.tsx`
- **Features:**
  - List of policy templates
  - Filters: Document type, Industry, Risk posture
  - Create new template
  - Edit existing template
  - Toggle is_active
  - Version management

#### 6. Authentication Pages
- **Login:** `src/app/(auth)/login/page.tsx`
- **Register:** `src/app/(auth)/register/page.tsx`
- Use existing shadcn/ui form components

---

## 📧 Email Integration ✅

**Service:** Resend
**Status:** Implemented

**Emails Sent:**
1. **Welcome Email** - After first policy generation
   - Policy pack ready notification
   - Link to Policy Workspace
   - Next steps guidance

2. **Export Email** - When user requests "Email me the pack"
   - Download link (7-day expiry)
   - Disclaimer reminder

3. **Verification Email** - User email verification (optional)

**Configuration:**
- Set `RESEND_API_KEY` in `.env`
- Verify sender domain in Resend dashboard
- Set `EMAIL_FROM` to verified email address

---

## 🔐 Security Features ✅

**Implemented:**
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT session tokens with 30-day expiry
- ✅ Input validation with Zod schemas
- ✅ SQL injection protection (Prisma parameterized queries)
- ✅ Authorization checks (user can only access their org's data)
- ✅ Audit logging for all key actions
- ✅ HTTPS enforcement (Vercel default)
- ✅ CORS configuration (Next.js default)

**To Add:**
- Rate limiting on API routes (e.g., `next-rate-limit`)
- Email verification flow
- Password reset flow
- CSP headers
- Input sanitization for rich text editor

---

## 🚢 Deployment Guide

### Option 1: Vercel (Recommended)

**1. Set up Vercel Postgres:**
```bash
# In Vercel dashboard, add Vercel Postgres
# Copy DATABASE_URL to environment variables
```

**2. Deploy:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Set environment variables in Vercel dashboard:
# - DATABASE_URL (from Vercel Postgres)
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - NEXTAUTH_URL (your production URL)
# - ANTHROPIC_API_KEY
# - RESEND_API_KEY
# - EMAIL_FROM

# Run migrations
vercel env pull .env.local
npx prisma migrate deploy

# Seed templates
npx prisma db seed
```

**3. Custom domain (optional):**
```bash
# In Vercel dashboard:
# Settings → Domains → Add domain
# Point your DNS to Vercel

# Update NEXTAUTH_URL to match your domain
```

### Option 2: Railway

```bash
# 1. Create Railway project
# 2. Add PostgreSQL database
# 3. Deploy from GitHub
# 4. Set environment variables
# 5. Run migrations via Railway CLI
```

### Post-Deployment Checklist

- [ ] Verify DATABASE_URL connection
- [ ] Test user registration
- [ ] Generate a test policy pack
- [ ] Test all export formats (DOCX, PDF, ZIP)
- [ ] Test email delivery
- [ ] Review audit logs
- [ ] Set up monitoring (Vercel Analytics, Sentry)
- [ ] Update legal pages (privacy policy, terms)

---

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Register new user
- [ ] Log in with email/password
- [ ] Log out
- [ ] Invalid credentials handled correctly

**Policy Generation:**
- [ ] Fill intake form with various inputs
- [ ] Generate policy pack successfully
- [ ] Verify all 4 documents created
- [ ] Check AI refinement quality
- [ ] Verify placeholders replaced correctly

**Policy Workspace:**
- [ ] View generated policies
- [ ] Edit section content
- [ ] Save edits successfully
- [ ] Regenerate specific section
- [ ] Finalize pack (becomes read-only)

**Export:**
- [ ] Download as DOCX
- [ ] Download as PDF
- [ ] Download as ZIP
- [ ] Verify content accuracy
- [ ] Check disclaimer included

**Emails:**
- [ ] Welcome email received after generation
- [ ] Export email with download link
- [ ] Email links work correctly

**Admin:**
- [ ] Create new template
- [ ] Edit existing template
- [ ] Toggle template active/inactive
- [ ] View audit logs

---

## 📊 Database Seeding

**Base Templates Included:**

```bash
npm run db:seed
```

**What gets seeded:**
1. **Admin User**
   - Email: `admin@haiec.com`
   - Password: `admin123!CHANGE_IN_PROD`
   - Role: ADMIN

2. **Policy Templates** (5 total):
   - Generic Acceptable Use Policy
   - Software/SaaS Acceptable Use Policy (industry-specific)
   - Generic AI Risk Statement
   - Generic Internal Controls Framework
   - Generic Staff Guidelines

**Adding More Templates:**

Edit `frontend/prisma/seed.ts` and add:

```typescript
await prisma.policyTemplate.create({
  data: {
    templateType: TemplateType.ACCEPTABLE_USE,
    industry: 'Healthcare',
    riskPosture: RiskPosture.CONSERVATIVE,
    version: 1,
    isActive: true,
    content: {
      title: 'AI Policy for Healthcare',
      sections: [
        {
          id: 'hipaa-compliance',
          heading: 'HIPAA Compliance',
          content: 'All AI tools must be HIPAA-compliant...',
          riskLevel: 'high',
          notes: 'Review with HIPAA counsel'
        },
        // More sections...
      ]
    },
  },
});
```

---

## 💰 Cost Estimate

### Monthly Costs (Production)

| Service | Usage | Cost |
|---------|-------|------|
| **Vercel (Hobby)** | Hosting + Serverless Functions | $0 |
| **Vercel Postgres** | 256 MB (or upgrade to Pro) | $0 - $20 |
| **Anthropic API** | ~500 requests/month @ $0.015/req | ~$7.50 |
| **Resend** | 100 emails/day (free tier) | $0 |
| **Domain** | Custom domain (optional) | $12/year |
| **TOTAL** | | **~$10-30/month** |

**Scaling Costs:**
- 5,000 policy generations/month: ~$75 (mostly AI API costs)
- 10,000 policy generations/month: ~$150
- Upgrade Vercel to Pro if needed: +$20/month

---

## 🔮 Future Enhancements

### Phase 1 (Post-MVP)
- [ ] Email verification flow
- [ ] Password reset
- [ ] User profile management
- [ ] Organization settings
- [ ] "Duplicate pack" feature
- [ ] Version history for edits
- [ ] Diff view before regenerating

### Phase 2 (Lead Nurturing)
- [ ] Email drip campaigns for unfinished packs
- [ ] CRM integration (HubSpot, Salesforce)
- [ ] Lead scoring based on company size/industry
- [ ] Admin dashboard with lead analytics
- [ ] Export lead data to CSV

### Phase 3 (Advanced Features)
- [ ] Collaboration features (multiple users per org)
- [ ] Comments and review workflows
- [ ] Template marketplace (industry-specific)
- [ ] White-labeling for resellers
- [ ] API for programmatic access
- [ ] Webhook integrations

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Verify DATABASE_URL format
echo $DATABASE_URL

# Test connection
npx prisma db pull

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset
```

### AI Generation Failures

```bash
# Check API key
echo $ANTHROPIC_API_KEY

# Review logs for rate limiting
# Anthropic rate limits: https://docs.anthropic.com/en/api/rate-limits

# Fallback: If AI fails, placeholders are still replaced
```

### Email Delivery Issues

```bash
# Verify Resend API key
echo $RESEND_API_KEY

# Check sender domain verification in Resend dashboard
# Verify EMAIL_FROM matches verified domain
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Regenerate Prisma client
npx prisma generate

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **Anthropic** - Claude AI for policy generation
- **Vercel** - Hosting and deployment platform
- **Prisma** - Type-safe ORM
- **shadcn/ui** - Beautiful React components
- **NextAuth.js** - Authentication for Next.js
- **Resend** - Transactional email service

---

## 📞 Support

For issues or questions:
- GitHub Issues: [Report a bug](https://github.com/subodhkc/Ai-Policy-generator/issues)
- Documentation: This README + inline code comments
- Email: support@haiec.com (after deployment)

---

**Built with ❤️ for organizations navigating AI governance.**
