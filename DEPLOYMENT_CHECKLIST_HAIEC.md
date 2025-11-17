# HAIEC AI Policy Generator - Deployment Checklist

Complete guide for deploying the HAIEC AI Policy Generator to production.

---

## 📋 Pre-Deployment Requirements

### 1. Required Accounts & API Keys

Before deployment, obtain the following:

- [ ] **GitHub Account** - Repository access
- [ ] **Vercel Account** - Free tier works (https://vercel.com)
- [ ] **Anthropic API Key** - Get from https://console.anthropic.com/
  - Navigate to: Account Settings → API Keys → Create Key
  - Copy the key starting with `sk-ant-api03-...`
  - **Cost**: ~$0.015 per policy generation (500 generations ≈ $7.50/month)

- [ ] **Resend API Key** - Get from https://resend.com (free tier: 100 emails/day)
  - Sign up → API Keys → Create API Key
  - Copy the key starting with `re_...`
  - Verify sender domain in Resend dashboard

- [ ] **Database** - Choose one:
  - **Option A**: Vercel Postgres (recommended, integrated)
  - **Option B**: Neon (free tier available - https://neon.tech)
  - **Option C**: Railway PostgreSQL
  - **Option D**: Your own PostgreSQL 14+ instance

- [ ] **Domain** (Optional but recommended)
  - Purchase from Namecheap, Google Domains, or Cloudflare
  - Example: `haiec-policies.com`

---

## 🔑 Environment Variables Setup

You'll need these environment variables in production. Prepare them now:

### Required Variables

```env
# 1. DATABASE - PostgreSQL connection string
DATABASE_URL=postgresql://username:password@host:5432/database_name
# Example for Vercel Postgres: postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb?sslmode=require

# 2. NEXTAUTH SECRET - Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-random-secret-at-least-32-characters-long

# 3. NEXTAUTH URL - Your production domain
NEXTAUTH_URL=https://your-domain.vercel.app

# 4. ANTHROPIC API KEY
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# 5. EMAIL SERVICE (Resend)
RESEND_API_KEY=re_your_resend_api_key_here
EMAIL_FROM=noreply@your-domain.com
EMAIL_FROM_NAME=HAIEC AI Policy Generator

# 6. APP URL - Your public URL
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# 7. NODE ENVIRONMENT
NODE_ENV=production
```

### Optional Variables

```env
# Error tracking with Sentry (optional)
SENTRY_DSN=your-sentry-dsn-here
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id

# AI Regeneration toggle (optional - defaults to enabled)
NEXT_PUBLIC_ENABLE_AI_REGENERATE=true
```

---

## 🚀 Deployment Steps

### Step 1: Verify Local Build Works

Before deploying, test locally:

```bash
# 1. Navigate to project directory
cd /path/to/Ai-Policy-generator

# 2. Install dependencies
npm install

# 3. Create .env file from example
cp .env.example .env

# 4. Edit .env with your LOCAL credentials
# Set DATABASE_URL to local PostgreSQL
# Set other required variables

# 5. Generate Prisma client
npx prisma generate

# 6. Run database migrations
npx prisma migrate deploy

# 7. Seed initial templates
npx prisma db seed

# 8. Build the project
npm run build

# 9. Start production server locally
npm start
```

**Test locally at http://localhost:3000:**
- [ ] Landing page loads
- [ ] Can register new account
- [ ] Can login
- [ ] Can generate policy pack (fill intake form)
- [ ] Policies are generated successfully
- [ ] Can download DOCX/PDF/ZIP
- [ ] Welcome email received (if Resend configured)

**If all tests pass, proceed to deployment. Otherwise, fix errors first.**

---

### Step 2: Deploy to Vercel

#### 2.1 Connect GitHub Repository

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select `subodhkc/Ai-Policy-generator`
4. Click **"Import"**

#### 2.2 Configure Project Settings

**Framework Preset:** Next.js (should auto-detect)

**Root Directory:**
- Leave blank (project root) OR
- Enter `.` if prompted

**Build Settings:**
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

#### 2.3 Add Environment Variables

Click **"Environment Variables"** and add ALL of these:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-app.vercel.app
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@your-domain.com
EMAIL_FROM_NAME=HAIEC AI Policy Generator
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

**Important Notes:**
- For `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL`, use your Vercel deployment URL (shown during setup)
- You can update these later if you add a custom domain
- Generate `NEXTAUTH_SECRET`: Run `openssl rand -base64 32` in terminal

#### 2.4 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Copy your deployment URL: `https://your-app-name.vercel.app`

---

### Step 3: Database Setup (Post-Deployment)

After deployment, you need to run migrations and seed the database.

#### Option A: Using Vercel Postgres

1. **Add Vercel Postgres to your project:**
   - Vercel Dashboard → Your Project → Storage → Create Database
   - Select "Postgres" → Continue
   - Copy the `DATABASE_URL` (should look like: `postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb?sslmode=require`)

2. **Update environment variable:**
   - Vercel Dashboard → Project → Settings → Environment Variables
   - Update `DATABASE_URL` with the Vercel Postgres URL
   - Redeploy: Deployments → Click "..." → Redeploy

3. **Run migrations:**
   ```bash
   # Install Vercel CLI if not already installed
   npm i -g vercel

   # Link your project
   vercel link

   # Pull environment variables
   vercel env pull .env.local

   # Run migrations
   npx prisma migrate deploy

   # Seed templates
   npx prisma db seed
   ```

#### Option B: Using Neon / Railway / Other PostgreSQL

1. Create database in your chosen provider
2. Copy the connection string (PostgreSQL format)
3. Add to Vercel environment variables as `DATABASE_URL`
4. Redeploy
5. Run migrations locally (with production DATABASE_URL in .env.local):
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

---

### Step 4: Verify Deployment

Test your production deployment:

#### 4.1 Health Checks

- [ ] Visit `https://your-app.vercel.app`
- [ ] Landing page loads correctly
- [ ] No console errors (check browser DevTools)
- [ ] Responsive design works (test mobile view)

#### 4.2 User Registration & Authentication

- [ ] Click "Sign Up" or "Get Started"
- [ ] Register new account with real email
- [ ] Login successfully
- [ ] Dashboard loads

#### 4.3 Policy Generation Flow

- [ ] Click "Create New Pack" or "Generate Policy Pack"
- [ ] Fill out intake form with test data:
  - Company name: Test Company
  - Industry: Software / SaaS
  - Size: Small (11-50 employees)
  - Geography: US
  - AI Uses: Select 2-3 options
  - Risk Posture: Balanced
  - Role: IT/Security
  - Email: Your email
  - Consent: Check
- [ ] Submit form
- [ ] Wait for generation (should take 30-60 seconds)
- [ ] Redirected to workspace page
- [ ] All 4 policy documents generated:
  1. Acceptable Use Policy
  2. AI Risk Statement
  3. Internal Controls
  4. Staff Guidelines
- [ ] Each document has multiple sections
- [ ] Content looks professional and tailored

#### 4.4 Policy Workspace Features

- [ ] Can switch between document tabs
- [ ] Can edit section content in textarea
- [ ] Save button works
- [ ] Finalize button works (locks pack)
- [ ] After finalization, editing is disabled

#### 4.5 Export Functionality

- [ ] Click "DOCX" export button
  - File downloads successfully
  - Open in Microsoft Word
  - All policies included
  - Disclaimer page present
  - Formatting looks good

- [ ] Click "PDF" export button
  - PDF downloads successfully
  - All policies included
  - Readable formatting

- [ ] Click "ZIP" export button
  - ZIP file downloads
  - Contains 4 separate DOCX files
  - Each file opens correctly

#### 4.6 Email Delivery

- [ ] Check your email for welcome message
- [ ] Email should arrive within 1-2 minutes
- [ ] Email contains:
  - Workspace link (working)
  - Company name
  - Professional formatting
- [ ] Not in spam folder

---

## 🌐 Custom Domain Setup (Optional)

### Step 1: Add Domain to Vercel

1. Vercel Dashboard → Your Project → Settings → **Domains**
2. Click **"Add"**
3. Enter your domain: `haiec-policies.com`
4. Add both:
   - `haiec-policies.com`
   - `www.haiec-policies.com`

### Step 2: Configure DNS Records

Go to your domain registrar (Namecheap, Google Domains, Cloudflare) and add:

**For root domain:**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### Step 3: Update Environment Variables

After domain is verified:

1. Vercel → Settings → Environment Variables
2. Update:
   ```env
   NEXTAUTH_URL=https://haiec-policies.com
   NEXT_PUBLIC_APP_URL=https://haiec-policies.com
   ```
3. Redeploy application

### Step 4: Update Email Sender Domain

1. Go to Resend Dashboard → Domains
2. Add your domain: `haiec-policies.com`
3. Add DNS records provided by Resend (SPF, DKIM, DMARC)
4. Verify domain
5. Update Vercel environment:
   ```env
   EMAIL_FROM=noreply@haiec-policies.com
   ```
6. Redeploy

**SSL Certificate:** Vercel automatically provisions SSL certificates (may take up to 24 hours)

---

## 🔒 Security Checklist

Before going live, verify:

### Authentication & Authorization

- [ ] `NEXTAUTH_SECRET` is a strong random string (32+ characters)
- [ ] Never commit `.env` file to Git
- [ ] JWT tokens expire after 30 days
- [ ] Passwords are hashed with bcrypt (12 rounds)
- [ ] Users can only access their own organization's data

### API Security

- [ ] All API routes validate input with Zod schemas
- [ ] Middleware protects dashboard and workspace routes
- [ ] No sensitive data exposed in API responses
- [ ] Rate limiting configured (see "Production Hardening" below)

### Data Protection

- [ ] Database uses SSL connections (Vercel Postgres default)
- [ ] No API keys in client-side code
- [ ] Audit logging enabled for key actions
- [ ] Regular database backups configured

### Content Security

- [ ] All user inputs sanitized
- [ ] No XSS vulnerabilities in rich text editor
- [ ] CORS properly configured
- [ ] HTTPS enforced (Vercel default)

---

## 🎯 Production Hardening (Recommended)

After initial deployment, add these improvements:

### 1. Rate Limiting

Install rate limiting middleware:

```bash
npm install @upstash/ratelimit @upstash/redis
```

Create rate limiter in `src/lib/rate-limit.ts`:

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create rate limiter (10 requests per 10 seconds)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier);
  return success;
}
```

Add to API routes that need protection.

### 2. Error Tracking with Sentry

```bash
npm install @sentry/nextjs
```

Follow Sentry Next.js setup guide: https://docs.sentry.io/platforms/javascript/guides/nextjs/

### 3. Monitoring & Analytics

- [ ] Enable Vercel Analytics (free)
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Monitor database performance
- [ ] Track API costs (Anthropic usage)

### 4. Email Improvements

- [ ] Set up custom email templates in Resend
- [ ] Add email open tracking
- [ ] Configure reply-to address
- [ ] Set up bounce handling

---

## 💰 Cost Estimates

### Free Tier (First Month)

- **Vercel Hosting**: $0 (hobby tier)
- **Vercel Postgres**: $0 (256 MB free tier)
- **Anthropic API**: ~$10-20 (depending on usage)
- **Resend Email**: $0 (100 emails/day free)
- **Domain**: ~$12/year
- **Total**: ~$10-20/month

### Growth Tier (1000+ users)

- **Vercel Pro**: $20/month
- **Vercel Postgres**: $20/month (Upgrade to Pro)
- **Anthropic API**: ~$50-150/month (usage-based)
- **Resend Email**: $20/month (if exceeding free tier)
- **Total**: ~$110-210/month

---

## 🧪 Testing Checklist

Run through these scenarios after deployment:

### Smoke Tests (Critical - Test Immediately)

- [ ] Homepage loads
- [ ] User registration works
- [ ] User login works
- [ ] Policy generation completes successfully
- [ ] Export downloads work (DOCX, PDF, ZIP)
- [ ] Welcome email sends

### Extended Tests (Within 24 Hours)

- [ ] Mobile responsiveness (test on actual device)
- [ ] Test with different industries
- [ ] Test with different company sizes
- [ ] Verify AI-generated content quality
- [ ] Test edit and save functionality
- [ ] Test finalize pack feature
- [ ] Verify audit logs are created
- [ ] Test logout and re-login
- [ ] Test with multiple users (if multi-tenant)

### Edge Cases

- [ ] Submit form with missing fields (should show validation errors)
- [ ] Try to access another user's pack (should be denied)
- [ ] Generate policy with very long company name
- [ ] Upload extremely large content in textarea
- [ ] Test concurrent policy generations
- [ ] Test with slow network (throttle in DevTools)

---

## 📊 Post-Launch Monitoring (First Week)

### Daily Checks

- [ ] Review Vercel deployment logs for errors
- [ ] Check Anthropic API usage and costs
- [ ] Monitor email delivery success rate
- [ ] Review database storage usage
- [ ] Check for user-reported issues

### Weekly Tasks

- [ ] Analyze user behavior (which features used most)
- [ ] Review generated policy quality
- [ ] Monitor page load times
- [ ] Check for any security alerts
- [ ] Backup database (if not automatic)

---

## 🆘 Troubleshooting Guide

### Build Fails on Vercel

**Error:** `Prisma generate failed`

**Solution:**
```bash
# Vercel may need Prisma in dependencies, not devDependencies
npm install prisma @prisma/client
git commit && git push
```

**Error:** `Type errors in build`

**Solution:**
```bash
# Run locally first
npm run build
# Fix all type errors before deploying
```

### Database Connection Issues

**Error:** `Can't reach database server`

**Solutions:**
- Verify `DATABASE_URL` format is correct
- Check database is running (in Vercel/Neon/Railway dashboard)
- Ensure SSL is configured: Add `?sslmode=require` to connection string
- Check database firewall allows Vercel IPs

### API Routes Return 500 Errors

**Solutions:**
- Check Vercel Function Logs (Vercel Dashboard → Project → Logs)
- Verify all environment variables are set
- Check Anthropic API key is valid and has credits
- Review error in Sentry (if configured)

### Emails Not Sending

**Solutions:**
- Verify `RESEND_API_KEY` is correct
- Check sender email domain is verified in Resend
- Look in Resend dashboard → Logs for delivery status
- Check if emails are in spam folder
- Verify `EMAIL_FROM` matches verified domain

### AI Generation Fails

**Solutions:**
- Check Anthropic API key is valid
- Verify API has sufficient credits
- Check rate limits: https://docs.anthropic.com/en/api/rate-limits
- Review Vercel function timeout (default 10s, max 60s on hobby)
- Consider upgrading to Vercel Pro for longer function timeout

### Slow Performance

**Solutions:**
- Enable Vercel Edge Caching for static content
- Optimize database queries (add indexes)
- Consider upgrading Vercel Postgres storage
- Implement Redis caching for templates
- Monitor Anthropic API latency

---

## 📞 Support Resources

### Documentation

- **HAIEC README**: `/HAIEC_README.md` - Full project documentation
- **Vercel Docs**: https://vercel.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Anthropic Docs**: https://docs.anthropic.com
- **Resend Docs**: https://resend.com/docs

### Help Channels

- **GitHub Issues**: Report bugs and feature requests
- **Vercel Support**: For deployment and hosting issues
- **Anthropic Support**: For AI API issues

---

## ✅ Final Launch Checklist

Before announcing to users:

### Technical Readiness

- [ ] All smoke tests passed
- [ ] No critical errors in logs
- [ ] Database migrations successful
- [ ] Backups configured
- [ ] Monitoring enabled
- [ ] SSL certificate active (green padlock in browser)

### Content & Legal

- [ ] Landing page copy finalized
- [ ] Privacy policy added
- [ ] Terms of service added
- [ ] Legal disclaimer prominent
- [ ] Contact information visible

### Performance

- [ ] Page load time < 3 seconds
- [ ] Policy generation time < 60 seconds
- [ ] Mobile experience acceptable
- [ ] No console errors in production

### Marketing Readiness

- [ ] Email templates reviewed
- [ ] Social media graphics prepared (optional)
- [ ] Analytics tracking configured
- [ ] Lead capture working correctly

**When all items checked: You're ready to launch! 🚀**

---

## 🎉 You're Live!

Congratulations on deploying HAIEC AI Policy Generator!

### Next Steps

1. **Announce Launch**
   - Update website/blog
   - Social media announcement
   - Email announcement to contacts

2. **Monitor Closely** (first 48 hours)
   - Watch logs for errors
   - Respond to user feedback quickly
   - Fix critical bugs immediately

3. **Iterate Based on Feedback**
   - Track which features are used most
   - Identify pain points in user journey
   - Plan improvements for next release

---

**Last Updated**: 2025-11-17
**Version**: 1.0.0
**Status**: ✅ Production Ready

**Need Help?** Check HAIEC_README.md or open a GitHub issue.
