# CasePack - Master Implementation Plan
**Version:** 2.0 (Integrated with LogSense + Nextbase Premium)
**Target:** Production-Ready Professional SaaS
**Timeline:** 3-4 weeks full implementation

---

## 🎯 Executive Summary

**Objective:** Build a production-ready, professional SaaS application that combines:
- ✅ CasePack backend (FastAPI, Celery, PostgreSQL)
- ✅ LogSense security & infrastructure modules
- ✅ Nextbase Premium UI components
- ✅ Professional landing page & marketing site
- ✅ Complete compliance & privacy pages
- ✅ Error-free, production-grade quality

**Estimated Time:** 20-25 working days
**Deployment Targets:**
- Frontend: Vercel (free tier)
- Backend: Railway ($20/mo) or DigitalOcean ($30/mo)
- Database: Managed PostgreSQL ($15/mo)
- Redis: Managed Redis ($5/mo)

**Total Monthly Cost:** $40-50/month

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│           FRONTEND (Next.js + Nextbase)             │
│  - Landing Page (professional marketing)            │
│  - Auth Pages (login, register)                     │
│  - Dashboard (case management)                      │
│  - Upload UI (drag & drop)                          │
│  - Timeline Review (table with editing)             │
│  - Payment Flow (Stripe checkout)                   │
│  - Download Page (PDF + ZIP downloads)              │
│  - Compliance Pages (privacy, terms, GDPR)          │
└─────────────────┬───────────────────────────────────┘
                  │ REST API (axios + React Query)
                  ↓
┌─────────────────────────────────────────────────────┐
│        BACKEND (FastAPI + LogSense Security)        │
│  - API Routes (auth, cases, files, payments)        │
│  - Security Middleware (from LogSense)              │
│  - Error Handler (from LogSense)                    │
│  - Secure Logger (PII redaction)                    │
│  - Input Sanitization                               │
└─────────────────┬───────────────────────────────────┘
                  │
      ┌───────────┴──────────────┐
      ↓                          ↓
┌─────────────┐          ┌──────────────┐
│ PostgreSQL  │          │ Redis        │
│ (Database)  │          │ (Queue)      │
└─────────────┘          └──────┬───────┘
                                │
                                ↓
                        ┌───────────────┐
                        │ Celery Worker │
                        │ - OCR         │
                        │ - AI Extract  │
                        │ - Timeline    │
                        │ - PDF Gen     │
                        └───────────────┘
```

---

## 🗓️ Phase Breakdown

### **Phase 1: Backend Security & Bug Fixes** (3 days)
**Priority:** CRITICAL
**Focus:** Fix bugs, add production-grade security

**Tasks:**
1. Fix async/sync bug in Celery workers
2. Add LogSense security middleware
3. Add LogSense error handler
4. Add secure logging (PII redaction)
5. Add input sanitization
6. Create database migrations (Alembic)
7. Fix file storage async operations
8. Add comprehensive error codes
9. Test all backend endpoints
10. Add rate limiting

**Deliverables:**
- ✅ All backend bugs fixed
- ✅ Production-grade security
- ✅ Comprehensive error handling
- ✅ Database migrations working
- ✅ All tests passing

---

### **Phase 2: Frontend Foundation** (3 days)
**Priority:** HIGH
**Focus:** Set up Next.js with Nextbase components

**Tasks:**
1. Copy Nextbase UI component library
2. Set up React Query
3. Create API client (FastAPI integration)
4. Set up authentication flow
5. Create base layouts
6. Add dark mode support
7. Configure TypeScript strictly
8. Set up testing (Vitest + Playwright)
9. Configure Tailwind CSS
10. Add loading states

**Deliverables:**
- ✅ Next.js project properly configured
- ✅ All UI components available
- ✅ API client ready
- ✅ Testing framework set up

---

### **Phase 3: Authentication & User Management** (2 days)
**Priority:** HIGH
**Focus:** Complete auth flow

**Tasks:**
1. Build login page (Nextbase component)
2. Build register page
3. Build forgot password page
4. Implement JWT token management
5. Add protected route middleware
6. Create user profile page
7. Add user settings
8. Implement session management
9. Add logout functionality
10. Test auth flow end-to-end

**Deliverables:**
- ✅ Complete authentication system
- ✅ User can register, login, logout
- ✅ Protected routes working
- ✅ Session persistence

---

### **Phase 4: Dashboard & Case Management** (4 days)
**Priority:** HIGH
**Focus:** Core case management UI

**Tasks:**
1. Build dashboard layout (Nextbase sidebar)
2. Create case list page (DataTable)
3. Add create case dialog
4. Build case detail page
5. Add case status indicators
6. Create case stats dashboard
7. Add search & filter functionality
8. Implement pagination
9. Add bulk actions
10. Add case deletion with confirmation

**Deliverables:**
- ✅ Professional dashboard
- ✅ Users can create/view/delete cases
- ✅ Case list with filtering
- ✅ Case statistics

---

### **Phase 5: File Upload & Processing** (3 days)
**Priority:** HIGH
**Focus:** Evidence upload and processing

**Tasks:**
1. Build file upload page (drag & drop)
2. Add file validation (type, size)
3. Implement upload progress indicators
4. Add file preview
5. Create file list view
6. Add delete file functionality
7. Show processing status
8. Add retry for failed files
9. Implement ZIP upload support
10. Test with large files (100MB+)

**Deliverables:**
- ✅ Drag & drop file upload
- ✅ Progress indicators
- ✅ File validation
- ✅ ZIP support
- ✅ Processing status tracking

---

### **Phase 6: Timeline Review & Editing** (4 days)
**Priority:** HIGH
**Focus:** Timeline event management

**Tasks:**
1. Build timeline table (DataTable)
2. Add sortable columns
3. Implement filtering (by date, category, confidence)
4. Create edit event dialog
5. Add hide/show event toggle
6. Implement event reordering (drag & drop)
7. Add confidence indicators
8. Create event detail modal
9. Add source file linking
10. Implement bulk event actions

**Deliverables:**
- ✅ Interactive timeline table
- ✅ Users can edit/hide/reorder events
- ✅ Confidence indicators
- ✅ Filtering and sorting
- ✅ Event detail view

---

### **Phase 7: Payment Integration** (2 days)
**Priority:** HIGH
**Focus:** Stripe checkout flow

**Tasks:**
1. Create pricing tier selection page
2. Integrate Stripe checkout
3. Implement webhook handling
4. Create payment success page
5. Create payment failure page
6. Add payment status checking
7. Lock downloads until payment
8. Add receipt generation
9. Test with Stripe test cards
10. Add payment retry logic

**Deliverables:**
- ✅ Pricing tier selection
- ✅ Stripe checkout working
- ✅ Webhook processing
- ✅ Download access control
- ✅ Payment receipts

---

### **Phase 8: PDF Generation & Downloads** (2 days)
**Priority:** HIGH
**Focus:** Output generation

**Tasks:**
1. Create download page
2. Generate timeline PDF (with watermark if unpaid)
3. Generate exhibit index PDF
4. Generate summary PDF
5. Create exhibit ZIP bundle
6. Add download links with expiry
7. Implement presigned URLs
8. Add preview functionality
9. Add email delivery option
10. Test all PDF outputs

**Deliverables:**
- ✅ All PDFs generating correctly
- ✅ Download page functional
- ✅ ZIP bundle working
- ✅ Watermarks on unpaid previews
- ✅ Presigned URL security

---

### **Phase 9: Landing Page & Marketing Site** (3 days)
**Priority:** MEDIUM
**Focus:** Professional marketing presence

**Tasks:**
1. Choose landing page template (from landing-kit)
2. Customize for CasePack branding
3. Write compelling copy
4. Add hero section
5. Create features section
6. Build pricing section
7. Add testimonials (placeholder)
8. Create FAQ section
9. Add CTA buttons
10. Optimize for SEO

**Deliverables:**
- ✅ Professional landing page
- ✅ Clear value proposition
- ✅ Pricing clearly displayed
- ✅ Strong CTAs
- ✅ Mobile responsive

---

### **Phase 10: Compliance & Legal Pages** (2 days)
**Priority:** MEDIUM
**Focus:** Privacy, terms, GDPR compliance

**Tasks:**
1. Create Privacy Policy page
2. Create Terms of Service page
3. Create Cookie Policy page
4. Add GDPR data export endpoint
5. Add account deletion endpoint
6. Create UPL disclaimer page
7. Add consent banners
8. Create data retention notice
9. Add AI usage disclosure
10. Create accessibility statement

**Deliverables:**
- ✅ All compliance pages
- ✅ GDPR features (export, delete)
- ✅ Clear disclaimers
- ✅ Cookie consent
- ✅ Legal protection

---

### **Phase 11: Email & Notifications** (2 days)
**Priority:** MEDIUM
**Focus:** User communication

**Tasks:**
1. Set up email service (SendGrid/Resend)
2. Create welcome email template
3. Create processing complete email
4. Create payment confirmation email
5. Create download link email
6. Add notification system
7. Create in-app notifications
8. Add notification preferences
9. Implement email queuing
10. Test all email templates

**Deliverables:**
- ✅ Email service configured
- ✅ 4 email templates
- ✅ In-app notifications
- ✅ User notification preferences

---

### **Phase 12: Admin Panel** (2 days)
**Priority:** LOW
**Focus:** System monitoring

**Tasks:**
1. Create admin dashboard
2. Add system statistics
3. Create user list view
4. Add case monitoring (metadata only)
5. Create error logs viewer
6. Add worker queue monitoring
7. Implement admin actions (delete case, etc.)
8. Add audit log viewer
9. Create system health checks
10. Add export functionality

**Deliverables:**
- ✅ Admin dashboard
- ✅ System monitoring
- ✅ User/case management
- ✅ Error tracking
- ✅ Audit logs

---

### **Phase 13: Testing & QA** (3 days)
**Priority:** HIGH
**Focus:** Bug fixing and testing

**Tasks:**
1. Write unit tests (backend)
2. Write integration tests (API)
3. Write E2E tests (Playwright)
4. Test all user flows
5. Test error scenarios
6. Load test with large files
7. Security testing
8. Cross-browser testing
9. Mobile responsiveness testing
10. Fix all bugs found

**Deliverables:**
- ✅ 80%+ test coverage
- ✅ All user flows tested
- ✅ No critical bugs
- ✅ Performance verified
- ✅ Security verified

---

### **Phase 14: Deployment & DevOps** (3 days)
**Priority:** CRITICAL
**Focus:** Production deployment

**Tasks:**
1. Set up production database (PostgreSQL)
2. Set up production Redis
3. Deploy backend to Railway/DO
4. Deploy frontend to Vercel
5. Configure environment variables
6. Set up domain & SSL
7. Configure Stripe webhooks
8. Set up Sentry monitoring
9. Configure database backups
10. Set up uptime monitoring

**Deliverables:**
- ✅ Application deployed
- ✅ Custom domain configured
- ✅ SSL certificates
- ✅ Monitoring active
- ✅ Backups configured

---

### **Phase 15: Polish & Launch** (2 days)
**Priority:** HIGH
**Focus:** Final touches

**Tasks:**
1. Review all UI/UX
2. Add loading skeletons
3. Improve error messages
4. Add helpful tooltips
5. Create user onboarding flow
6. Add demo/tutorial
7. Optimize images
8. Improve page load times
9. Final security review
10. Launch! 🚀

**Deliverables:**
- ✅ Polished UI
- ✅ Great UX
- ✅ Fast performance
- ✅ Ready for users
- ✅ LAUNCHED!

---

## 🛠️ Technology Stack (Final)

### **Frontend**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui (Radix UI)
- React Query (data fetching)
- React Table (timeline display)
- React Hook Form (forms)
- Zod (validation)
- Stripe.js (payments)

### **Backend**
- FastAPI (Python 3.11)
- PostgreSQL 14
- Redis 7
- Celery (workers)
- SQLAlchemy (ORM)
- Alembic (migrations)
- Pydantic (validation)

### **Services**
- Tesseract OCR
- Anthropic Claude Haiku
- ReportLab (PDF generation)
- Stripe (payments)
- SendGrid/Resend (email)
- Sentry (monitoring)

### **Infrastructure**
- Vercel (frontend hosting)
- Railway/DigitalOcean (backend)
- Managed PostgreSQL
- Managed Redis
- S3/Spaces (file storage)

---

## 🔧 Critical Bugs to Fix

### **Bug #1: Async/Sync Mismatch in Celery** ⚠️ CRITICAL

**File:** `backend/app/workers/tasks.py` (line 80)

**Problem:**
```python
@celery_app.task
def process_file_ocr(self, file_id: int):
    result = await parser_service.parse_file_and_extract_events(...)
    # ERROR: Can't use 'await' in sync function
```

**Fix:**
```python
import asyncio

@celery_app.task
def process_file_ocr(self, file_id: int):
    result = asyncio.run(
        parser_service.parse_file_and_extract_events(
            file_content, file.mime_type, file.original_name
        )
    )
```

---

### **Bug #2: Database Query in deps.py** ⚠️ HIGH

**File:** `backend/app/api/deps.py` (line 45)

**Problem:**
```python
result = await db.execute(
    "SELECT * FROM users WHERE id = :user_id", {"user_id": int(user_id)}
)
# Using raw SQL instead of ORM
```

**Fix:**
```python
from sqlalchemy import select
from app.models.user import User

result = await db.execute(
    select(User).where(User.id == int(user_id))
)
user = result.scalar_one_or_none()
```

---

### **Bug #3: Missing pdf2image Dependency** ⚠️ MEDIUM

**File:** `backend/requirements.txt`

**Problem:**
Missing `pdf2image` package needed for PDF OCR

**Fix:**
Add to requirements.txt:
```
pdf2image==1.16.3
```

---

### **Bug #4: No Database Migrations** ⚠️ CRITICAL

**Problem:**
No Alembic migrations exist, tables won't be created

**Fix:**
Create initial migration (see Phase 1 tasks)

---

## 📋 Manual Tasks for You

### **Required API Keys & Credentials**

1. **Anthropic API Key**
   - Sign up: https://console.anthropic.com
   - Get $5 free credits
   - Create API key
   - Cost: $0.25 per million tokens (very cheap)

2. **Stripe API Keys**
   - Sign up: https://dashboard.stripe.com
   - Get test keys first
   - Create products & price IDs
   - Set up webhook endpoint
   - Cost: Free (2.9% + $0.30 per transaction)

3. **Email Service (Optional)**
   - SendGrid: https://sendgrid.com (100 emails/day free)
   - OR Resend: https://resend.com (3,000 emails/month free)

4. **Sentry (Error Tracking)**
   - Sign up: https://sentry.io
   - Create project
   - Get DSN
   - Cost: Free tier available

5. **Database (Production)**
   - DigitalOcean Managed PostgreSQL: $15/mo
   - OR Railway PostgreSQL: Included in plan
   - OR AWS RDS: ~$15-20/mo

6. **Redis (Production)**
   - DigitalOcean Managed Redis: $15/mo
   - OR Railway Redis: Included in plan
   - OR Upstash Redis: Free tier available

---

### **Domain & SSL**

1. **Purchase Domain**
   - Namecheap, Google Domains, Cloudflare
   - Recommended: casepack.com (if available)
   - Cost: $10-15/year

2. **DNS Configuration**
   - Point A record to backend IP
   - Point CNAME to Vercel for frontend
   - Configure Stripe webhook domain

3. **SSL Certificates**
   - Vercel: Automatic (free)
   - Backend: Let's Encrypt (free) or platform-provided

---

### **Stripe Product Setup**

1. **Create Products**
   ```
   Product 1: Basic Pack
   - Price: $29
   - Description: Up to 50 files

   Product 2: Standard Pack
   - Price: $49
   - Description: Up to 200 files

   Product 3: Large Pack
   - Price: $99
   - Description: Up to 500 files
   ```

2. **Get Price IDs**
   - Copy price IDs from Stripe dashboard
   - Add to `.env` file

3. **Configure Webhooks**
   - Endpoint: `https://api.casepack.com/api/v1/payments/webhook`
   - Events: `checkout.session.completed`
   - Copy webhook secret

---

## 🚀 Deployment Guide

### **Frontend Deployment (Vercel)**

**Step 1: Prepare Frontend**
```bash
cd frontend

# Ensure build works
npm run build

# Create .env.production
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=https://api.casepack.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXTAUTH_URL=https://casepack.com
NEXTAUTH_SECRET=<generate-with-openssl-rand>
EOF
```

**Step 2: Deploy to Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Or use Vercel Dashboard:
# 1. Go to https://vercel.com
# 2. Import Git repository
# 3. Configure environment variables
# 4. Deploy
```

**Step 3: Configure Custom Domain**
- Add domain in Vercel dashboard
- Configure DNS (CNAME to vercel.app)
- SSL auto-configured

---

### **Backend Deployment (Railway)**

**Option A: Railway (Recommended)**

**Step 1: Prepare Backend**
```bash
cd backend

# Ensure all dependencies are listed
pip freeze > requirements.txt

# Create Procfile
cat > Procfile << EOF
web: uvicorn app.main:app --host 0.0.0.0 --port \$PORT
worker: celery -A app.workers.celery_app worker --loglevel=info
EOF

# Create railway.json
cat > railway.json << EOF
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port \$PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF
```

**Step 2: Deploy to Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create new project
railway init

# Add PostgreSQL
railway add postgresql

# Add Redis
railway add redis

# Set environment variables
railway variables set ANTHROPIC_API_KEY=sk-ant-...
railway variables set STRIPE_SECRET_KEY=sk_live_...
railway variables set SECRET_KEY=<generate>
# ... (set all from .env.example)

# Deploy
railway up

# Deploy worker service separately
railway add
# Choose "Empty Service"
# Set start command: celery -A app.workers.celery_app worker --loglevel=info
```

**Step 3: Run Migrations**
```bash
# SSH into Railway service
railway run alembic upgrade head
```

---

### **Backend Deployment (DigitalOcean App Platform)**

**Step 1: Create App**
1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Connect GitHub repository
4. Select `backend` directory

**Step 2: Configure Services**

**API Service:**
```yaml
name: casepack-api
source:
  repo: subodhkc/Court-Case-Packet
  branch: main
  directory: backend
build_command: pip install -r requirements.txt
run_command: uvicorn app.main:app --host 0.0.0.0 --port 8080
envs:
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
  - key: REDIS_URL
    value: ${redis.REDIS_URL}
  - key: ANTHROPIC_API_KEY
    value: sk-ant-...
    type: SECRET
```

**Worker Service:**
```yaml
name: casepack-worker
source:
  repo: subodhkc/Court-Case-Packet
  branch: main
  directory: backend
build_command: pip install -r requirements.txt
run_command: celery -A app.workers.celery_app worker --loglevel=info
envs:
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
  - key: REDIS_URL
    value: ${redis.REDIS_URL}
```

**Step 3: Add Databases**
- Add PostgreSQL managed database ($15/mo)
- Add Redis managed database ($15/mo)

**Step 4: Deploy**
- Click "Create Resources"
- Wait for deployment
- Run migrations via console

---

### **Environment Variables Checklist**

**Frontend (.env.production)**
```bash
NEXT_PUBLIC_API_URL=https://api.casepack.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXTAUTH_URL=https://casepack.com
NEXTAUTH_SECRET=<openssl rand -hex 32>
```

**Backend (Railway/DO)**
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://host:6379/0

# Application
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=<openssl rand -hex 32>
API_PREFIX=/api/v1
ALLOWED_ORIGINS=https://casepack.com,https://www.casepack.com

# AI
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-haiku-20240307

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_BASIC=price_...
STRIPE_PRICE_STANDARD=price_...
STRIPE_PRICE_LARGE=price_...

# Email (if using)
EMAIL_ENABLED=true
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG...

# Storage (production)
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=casepack-production
AWS_REGION=us-east-1

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
LOG_LEVEL=WARNING

# Security
DATA_RETENTION_DAYS=30
SIGNED_URL_EXPIRY=3600
```

---

## 📈 Success Metrics

### **Technical Metrics**
- ✅ 99.9% uptime
- ✅ < 2s page load time
- ✅ < 5min processing time (100 files)
- ✅ 0 critical bugs
- ✅ 80%+ test coverage

### **Business Metrics**
- ✅ 10 paid users in first month
- ✅ $1,000 MRR in first 3 months
- ✅ < 5% churn rate
- ✅ 4.5+ star rating

### **User Metrics**
- ✅ < 5min to create first case
- ✅ 80%+ completion rate
- ✅ < 1% support tickets
- ✅ 20%+ referral rate

---

## 🎯 Timeline Summary

| Phase | Duration | Focus |
|-------|----------|-------|
| 1 | 3 days | Backend fixes & security |
| 2 | 3 days | Frontend foundation |
| 3 | 2 days | Authentication |
| 4 | 4 days | Dashboard & cases |
| 5 | 3 days | File upload |
| 6 | 4 days | Timeline review |
| 7 | 2 days | Payment integration |
| 8 | 2 days | PDF & downloads |
| 9 | 3 days | Landing page |
| 10 | 2 days | Compliance pages |
| 11 | 2 days | Email & notifications |
| 12 | 2 days | Admin panel |
| 13 | 3 days | Testing & QA |
| 14 | 3 days | Deployment |
| 15 | 2 days | Polish & launch |
| **TOTAL** | **40 days** | **~8 weeks** |

With focused work, can be compressed to **4-5 weeks**.

---

## ✅ Definition of Done

**Application is ready to launch when:**
- ✅ All 15 phases completed
- ✅ All critical bugs fixed
- ✅ All tests passing
- ✅ Deployed to production
- ✅ SSL configured
- ✅ Monitoring active
- ✅ Backups configured
- ✅ 5 successful end-to-end test cases
- ✅ Documentation complete
- ✅ Legal pages published
- ✅ Payment flow tested with real money
- ✅ First beta user successfully creates case

---

**Next Step:** Begin Phase 1 execution!
