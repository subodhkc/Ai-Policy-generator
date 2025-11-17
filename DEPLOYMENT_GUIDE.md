# CasePack Deployment Guide

Complete production deployment guide for CasePack to Vercel (frontend) and Railway (backend).

## Prerequisites

Before deploying, ensure you have:

- [ ] GitHub account with CasePack repository access
- [ ] Vercel account (free tier works)
- [ ] Railway account (hobbyist plan recommended)
- [ ] Anthropic API key for Claude Haiku
- [ ] Stripe account with API keys
- [ ] SendGrid or Resend account for emails
- [ ] Domain name (optional but recommended)

---

## Part 1: Backend Deployment to Railway

### 1.1 Create PostgreSQL Database

1. Go to [Railway.app](https://railway.app) → New Project → Provision PostgreSQL
2. Copy the `DATABASE_URL` connection string
3. Note: Railway provides PostgreSQL with automatic backups

### 1.2 Create Redis Instance

1. In the same Railway project → New Service → Add Redis
2. Copy the `REDIS_URL` connection string

### 1.3 Deploy Backend Service

1. In Railway project → New Service → GitHub Repo
2. Select `subodhkc/Court-Case-Packet` repository
3. Set Root Directory: `backend`
4. Add environment variables:

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/railway
REDIS_URL=redis://default:pass@host:6379

# API Keys
ANTHROPIC_API_KEY=sk-ant-api03-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email
SENDGRID_API_KEY=SG....
FROM_EMAIL=noreply@casepack.app

# Security
SECRET_KEY=your-super-secret-key-here-generate-with-openssl
ALLOWED_ORIGINS=https://casepack.vercel.app,https://www.casepack.app

# App Config
APP_NAME=CasePack
APP_VERSION=2.0.0
ENVIRONMENT=production
LOG_LEVEL=INFO
DEBUG=False

# File Storage (Local for now, S3 optional)
STORAGE_BACKEND=local
UPLOAD_DIR=/app/uploads

# Pricing
BASIC_PRICE_CENTS=1500
STANDARD_PRICE_CENTS=3000
PREMIUM_PRICE_CENTS=5000
```

5. Deploy Settings:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Watch Paths: `backend/**`

6. Generate Deployment: Click "Deploy"
7. Copy the Railway app URL (e.g., `https://casepack-backend.up.railway.app`)

### 1.4 Run Database Migrations

1. In Railway → Backend Service → Terminal (or connect via CLI)
2. Run: `alembic upgrade head`
3. Verify tables created: `psql $DATABASE_URL -c "\dt"`

### 1.5 Deploy Celery Worker

1. Railway Project → New Service → GitHub Repo (same repo)
2. Root Directory: `backend`
3. Same environment variables as backend
4. Start Command: `celery -A app.workers.celery_app worker --loglevel=info`
5. Deploy

---

## Part 2: Frontend Deployment to Vercel

### 2.1 Connect Repository

1. Go to [Vercel](https://vercel.com) → New Project
2. Import Git Repository: `subodhkc/Court-Case-Packet`
3. Configure Project:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 2.2 Environment Variables

Add the following to Vercel → Project Settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://casepack-backend.up.railway.app
NEXT_PUBLIC_APP_NAME=CasePack
```

### 2.3 Deploy

1. Click "Deploy"
2. Vercel will build and deploy automatically
3. Copy the deployment URL (e.g., `https://casepack.vercel.app`)

### 2.4 Update Backend CORS

1. Go back to Railway → Backend Service → Variables
2. Update `ALLOWED_ORIGINS` to include Vercel URL:
   ```
   ALLOWED_ORIGINS=https://casepack.vercel.app,https://casepack-production.vercel.app
   ```
3. Redeploy backend

---

## Part 3: Custom Domain Setup (Optional)

### 3.1 Frontend Domain

1. Purchase domain (e.g., `casepack.app` from Namecheap/Google Domains)
2. Vercel → Project → Settings → Domains
3. Add domain: `casepack.app` and `www.casepack.app`
4. Add DNS records at your registrar:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.21.21
   ```
5. Vercel will auto-provision SSL certificate

### 3.2 Backend Domain (Optional)

1. Railway → Backend Service → Settings → Domains
2. Add custom domain: `api.casepack.app`
3. Add DNS record:
   ```
   Type: CNAME
   Name: api
   Value: casepack-backend.up.railway.app
   ```

---

## Part 4: Stripe Payment Configuration

### 4.1 Create Stripe Products

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Products → Create Product:
   - **Basic Packet**: $15
   - **Standard Packet**: $30
   - **Premium Packet**: $50
3. Note the Price IDs (e.g., `price_1abc...`)

### 4.2 Configure Stripe Webhook

1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://api.casepack.app/api/payments/webhook`
3. Events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy Webhook Signing Secret
5. Add to Railway environment: `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## Part 5: Email Configuration

### 5.1 SendGrid Setup

1. Go to [SendGrid](https://sendgrid.com)
2. Create API Key with "Mail Send" permissions
3. Verify sender identity: `noreply@casepack.app`
4. Add to Railway: `SENDGRID_API_KEY=SG....`

### 5.2 Email Templates

Email templates are in `backend/app/templates/`:
- `magic_link.html` - Magic link login
- `payment_confirmation.html` - Payment receipt
- `case_completed.html` - Case processing complete

---

## Part 6: Monitoring and Logs

### 6.1 Railway Logs

- View real-time logs in Railway Dashboard
- Set up log drains to external services (optional)

### 6.2 Vercel Analytics

- Enable Vercel Analytics in Project Settings
- Monitor page views, performance, and errors

### 6.3 Sentry Error Tracking (Optional)

1. Create Sentry account
2. Add to Railway: `SENTRY_DSN=https://...`
3. Backend will auto-report errors

---

## Part 7: Security Checklist

- [ ] All environment variables use production values
- [ ] `DEBUG=False` in backend
- [ ] CORS origins restricted to production domains
- [ ] Stripe webhook signature verification enabled
- [ ] Database backups enabled (Railway auto-backups daily)
- [ ] SSL certificates active on all domains
- [ ] Rate limiting configured (handled by infrastructure middleware)
- [ ] File upload size limits enforced (50MB)

---

## Part 8: Testing Production Deployment

### 8.1 Health Checks

1. Backend: `https://api.casepack.app/health`
   - Should return: `{"status": "healthy"}`

2. Frontend: `https://casepack.app`
   - Should load landing page

### 8.2 End-to-End Test

1. Register new account
2. Create case
3. Upload evidence file
4. Verify file processing starts
5. Check timeline generation
6. Test payment flow (use Stripe test card: `4242 4242 4242 4242`)
7. Download generated PDFs

---

## Deployment Costs (Estimated)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Vercel | Hobby | $0 (free) |
| Railway - Backend | Hobbyist | $5 |
| Railway - PostgreSQL | Shared | Included |
| Railway - Redis | Shared | Included |
| Railway - Celery Worker | Additional | $5 |
| Anthropic API | Pay-as-go | ~$10-30 |
| Stripe | Transaction fees | 2.9% + 30¢ |
| SendGrid | Free | $0 (up to 100/day) |
| **Total** | | **$20-40/month** |

---

## Scaling Recommendations

### When to Scale

- **>100 cases/day**: Upgrade Railway to Pro ($20/month)
- **>1000 cases/day**: Consider dedicated PostgreSQL instance
- **>10,000 files/day**: Move to S3/R2 for file storage
- **Slow processing**: Add more Celery workers (horizontal scaling)

### S3 Migration (Optional)

When local storage isn't enough:

1. Create AWS S3 bucket or Cloudflare R2
2. Update Railway environment:
   ```env
   STORAGE_BACKEND=s3
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   S3_BUCKET_NAME=casepack-production
   S3_REGION=us-east-1
   ```
3. Redeploy backend

---

## Troubleshooting

### Backend not responding
- Check Railway logs for errors
- Verify DATABASE_URL is correct
- Run `alembic upgrade head` again

### Frontend 500 errors
- Check NEXT_PUBLIC_API_URL is correct
- Verify CORS settings in backend
- Check Vercel function logs

### File uploads failing
- Verify upload directory exists: `/app/uploads`
- Check Railway service has write permissions
- Ensure file size under 50MB limit

### Celery tasks not processing
- Check Celery worker is running in Railway
- Verify Redis connection
- Check worker logs for errors

---

## Maintenance Tasks

### Weekly
- Review error logs in Railway and Vercel
- Check storage usage (upgrade if >90%)
- Monitor API costs (Anthropic, Stripe)

### Monthly
- Review and delete cases >30 days old (auto-handled)
- Update dependencies: `pip list --outdated`
- Check for security updates

### Quarterly
- Review pricing tiers and adjust if needed
- Analyze user feedback
- Plan feature improvements

---

## Support Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Next.js Docs**: https://nextjs.org/docs

---

**Deployment Complete!** 🎉

Your CasePack application is now live and ready to help users build court case packets.
