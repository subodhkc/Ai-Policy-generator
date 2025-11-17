# Manual Tasks Required Before Going Live

This document lists all manual tasks you need to complete to make CasePack production-ready.

---

## 1. API Keys and Credentials

### 1.1 Anthropic API Key ⚠️ REQUIRED

**Purpose**: Claude Haiku AI for event extraction from evidence

**Steps**:
1. Go to https://console.anthropic.com/
2. Sign up for an account (requires phone verification)
3. Go to API Keys → Create Key
4. Copy the key (starts with `sk-ant-api03-...`)
5. Add to Railway backend environment: `ANTHROPIC_API_KEY=sk-ant-api03-...`

**Cost**: ~$0.25 per million tokens (~$10-30/month for moderate usage)

### 1.2 Stripe API Keys ⚠️ REQUIRED

**Purpose**: Payment processing for case packets

**Steps**:
1. Go to https://stripe.com → Sign up
2. Complete business verification (can start in test mode)
3. Dashboard → Developers → API Keys
4. Copy both keys:
   - Publishable key: `pk_test_...` or `pk_live_...`
   - Secret key: `sk_test_...` or `sk_live_...`
5. Add to Railway backend environment:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
6. Add to Vercel frontend environment:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

**Test Card**: Use `4242 4242 4242 4242` for testing

### 1.3 Email Service (SendGrid or Resend) ⚠️ REQUIRED

**Purpose**: Send magic link logins and payment confirmations

**Option A: SendGrid (Recommended)**
1. Go to https://sendgrid.com → Sign up
2. Create API Key with "Mail Send" permission
3. Settings → Sender Authentication → Verify Email
4. Add to Railway: `SENDGRID_API_KEY=SG....`

**Option B: Resend**
1. Go to https://resend.com → Sign up
2. Create API Key
3. Verify domain
4. Add to Railway: `RESEND_API_KEY=re_...`

**Cost**: Free tier includes 100 emails/day (SendGrid) or 3,000/month (Resend)

---

## 2. Stripe Configuration

### 2.1 Create Products and Prices ⚠️ REQUIRED

**Steps**:
1. Stripe Dashboard → Products → Create Product
2. Create three products:

   **Basic Packet** ($15):
   - Name: Basic Court Case Packet
   - Description: Timeline + Exhibit Index + Summary (up to 50 files)
   - Price: $15.00 USD (one-time)
   - Copy Price ID: `price_abc123...`

   **Standard Packet** ($30):
   - Name: Standard Court Case Packet
   - Description: Timeline + Exhibit Index + Summary + Bundle (up to 200 files)
   - Price: $30.00 USD
   - Copy Price ID: `price_def456...`

   **Premium Packet** ($50):
   - Name: Premium Court Case Packet
   - Description: Everything + Priority Processing + Expert Review (unlimited files)
   - Price: $50.00 USD
   - Copy Price ID: `price_ghi789...`

3. Update Railway environment with price IDs:
   ```
   STRIPE_PRICE_BASIC=price_abc123...
   STRIPE_PRICE_STANDARD=price_def456...
   STRIPE_PRICE_PREMIUM=price_ghi789...
   ```

### 2.2 Configure Webhooks ⚠️ REQUIRED

**Steps**:
1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://api.casepack.app/api/payments/webhook`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy Webhook Signing Secret: `whsec_...`
5. Add to Railway: `STRIPE_WEBHOOK_SECRET=whsec_...`

**Why**: Verifies payment completion and prevents fraud

---

## 3. Domain Configuration

### 3.1 Purchase Domain (Optional but Recommended)

**Recommended Registrars**:
- Namecheap: ~$12/year
- Google Domains: ~$12/year
- Cloudflare: ~$9/year

**Suggested Domains**:
- `casepack.app`
- `courtcasebuilder.com`
- `evidencepack.app`

### 3.2 Configure DNS Records

Once you have a domain:

**Frontend (Vercel)**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)
```

**Backend (Railway)** - Optional:
```
Type: CNAME
Name: api
Value: [your-railway-app].up.railway.app
```

---

## 4. Security Configuration

### 4.1 Generate Secret Key ⚠️ REQUIRED

**Purpose**: Encrypt user sessions and tokens

**Steps**:
1. Generate a random secret:
   ```bash
   openssl rand -hex 32
   ```
2. Add to Railway: `SECRET_KEY=abc123def456...`

⚠️ **NEVER** commit this to GitHub!

### 4.2 Update CORS Origins ⚠️ REQUIRED

**Steps**:
1. After deploying frontend to Vercel, copy the URL
2. Update Railway backend environment:
   ```
   ALLOWED_ORIGINS=https://casepack.vercel.app,https://www.casepack.app
   ```
3. If using custom domain, add it too

### 4.3 Set Production Mode ⚠️ REQUIRED

**Steps**:
1. Railway backend environment:
   ```
   ENVIRONMENT=production
   DEBUG=False
   LOG_LEVEL=INFO
   ```

---

## 5. Database Setup

### 5.1 Run Migrations ⚠️ REQUIRED

**After deploying backend to Railway**:

1. Railway → Backend Service → Shell (or use CLI)
2. Run:
   ```bash
   alembic upgrade head
   ```
3. Verify:
   ```bash
   psql $DATABASE_URL -c "\dt"
   ```
   Should show 6 tables: users, cases, files, events, payments, audit_logs

### 5.2 Create Admin User (Optional)

**If you want an admin account**:

1. Railway → Backend Service → Shell
2. Run Python:
   ```python
   from app.models.user import User
   from app.core.database import SessionLocal
   from app.core.security import get_password_hash

   db = SessionLocal()
   admin = User(
       email="admin@casepack.app",
       hashed_password=get_password_hash("your-strong-password"),
       full_name="Admin User",
       is_admin=True,
       is_active=True
   )
   db.add(admin)
   db.commit()
   ```

---

## 6. Testing Checklist

### 6.1 Before Launch Testing ⚠️ REQUIRED

Test these flows in production (using Stripe test mode):

- [ ] User registration
- [ ] Login with email/password
- [ ] Create new case
- [ ] Upload evidence file (try PDF, PNG, JPG)
- [ ] Verify file shows in file list
- [ ] Check processing status updates
- [ ] View generated timeline (if processing completes)
- [ ] Payment flow (use test card `4242 4242 4242 4242`)
- [ ] Download generated PDFs
- [ ] Logout and login again
- [ ] Delete a case

### 6.2 Stripe Test Mode → Live Mode

**When ready to accept real payments**:

1. Stripe Dashboard → Switch to Live Mode (toggle in top-right)
2. Create products again in Live Mode (same as test mode)
3. Get new Live API keys: `pk_live_...` and `sk_live_...`
4. Update Railway and Vercel environment variables
5. Update webhook endpoint for Live Mode
6. Redeploy both services

---

## 7. Legal and Compliance

### 7.1 Update Privacy Policy ⚠️ RECOMMENDED

**Edit**: `frontend/src/app/(legal)/privacy/page.tsx`

Update with:
- Your business name and address
- Contact email for data requests
- Cookie policy (if you add analytics)
- Your jurisdiction

### 7.2 Update Terms of Service ⚠️ RECOMMENDED

**Edit**: `frontend/src/app/(legal)/terms/page.tsx`

Update with:
- Your business entity name
- Refund policy details
- Dispute resolution process
- Your governing law jurisdiction

⚠️ **Recommended**: Have a lawyer review both documents before going live.

### 7.3 GDPR Compliance (if serving EU users)

**Already implemented**:
- 30-day data retention
- User-initiated data deletion
- PII redaction in logs
- Encryption at rest and in transit

**Additional steps**:
- [ ] Add cookie consent banner (if using analytics)
- [ ] Provide data export functionality
- [ ] Document data processing activities

---

## 8. Monitoring and Analytics

### 8.1 Enable Vercel Analytics (Optional)

**Steps**:
1. Vercel → Project → Analytics → Enable
2. Free tier includes basic page views and Web Vitals

### 8.2 Set Up Sentry for Error Tracking (Optional)

**Steps**:
1. Go to https://sentry.io → Sign up
2. Create new project (Python for backend, Next.js for frontend)
3. Copy DSN: `https://abc@o123.ingest.sentry.io/456`
4. Add to Railway: `SENTRY_DSN=https://...`
5. Backend will auto-report errors

**Cost**: Free tier includes 5,000 errors/month

### 8.3 Set Up Uptime Monitoring (Optional)

**Services**:
- UptimeRobot (free): https://uptimerobot.com
- Pingdom
- Better Uptime

**Monitor**:
- Frontend: `https://casepack.app`
- Backend health: `https://api.casepack.app/health`

---

## 9. Post-Launch Tasks

### 9.1 First Week

- [ ] Monitor error logs daily (Railway + Vercel)
- [ ] Watch for failed payments (Stripe Dashboard)
- [ ] Check email deliverability (SendGrid Dashboard)
- [ ] Test with real evidence files
- [ ] Monitor API costs (Anthropic Console)

### 9.2 First Month

- [ ] Gather user feedback
- [ ] Review pricing tiers (adjust if needed)
- [ ] Analyze processing times (optimize if >2 min)
- [ ] Check storage usage (upgrade Railway if >90%)
- [ ] Review security logs (unusual activity)

### 9.3 Ongoing

- [ ] Monthly dependency updates: `pip list --outdated`
- [ ] Quarterly security audits
- [ ] Monitor user growth and scale accordingly
- [ ] Keep UPL disclaimer up to date with local laws

---

## 10. Optional Enhancements

### 10.1 SMS Notifications (Twilio)

For case completion notifications:
1. Sign up for Twilio
2. Add to Railway: `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`
3. Uncomment SMS code in `backend/app/workers/tasks.py`

### 10.2 File Storage Migration to S3

When >10GB of files:
1. Create AWS S3 bucket or Cloudflare R2
2. Update Railway:
   ```
   STORAGE_BACKEND=s3
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   S3_BUCKET_NAME=casepack-production
   ```

### 10.3 Custom Branding

**Frontend**:
- Update logo in `frontend/public/logo.svg`
- Change colors in `frontend/tailwind.config.ts`
- Update metadata in `frontend/src/app/layout.tsx`

**Email Templates**:
- Edit HTML files in `backend/app/templates/`

---

## Quick Start Checklist

**Minimum to go live** (30 minutes):

1. [ ] Get Anthropic API key
2. [ ] Get Stripe test API keys
3. [ ] Get SendGrid API key
4. [ ] Generate SECRET_KEY
5. [ ] Deploy backend to Railway
6. [ ] Run database migrations
7. [ ] Deploy frontend to Vercel
8. [ ] Update CORS origins
9. [ ] Test user registration
10. [ ] Test file upload
11. [ ] Test payment flow (test mode)

**For production** (additional 2 hours):

12. [ ] Purchase domain
13. [ ] Configure DNS
14. [ ] Create Stripe products
15. [ ] Configure Stripe webhooks
16. [ ] Switch Stripe to live mode
17. [ ] Update legal pages
18. [ ] Test end-to-end with real payment
19. [ ] Set up monitoring
20. [ ] Launch! 🚀

---

## Support

If you encounter issues:
1. Check Railway and Vercel logs first
2. Review DEPLOYMENT_GUIDE.md troubleshooting section
3. Check GitHub repository issues
4. Review API service status pages (Anthropic, Stripe, SendGrid)

---

**You're almost ready to launch!** 🎉

Follow this checklist step-by-step, and you'll have a production-ready court case packet builder.
