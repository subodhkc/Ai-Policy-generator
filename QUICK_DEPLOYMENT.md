# Quick Deployment Guide - CasePack

**No GPU Required!** Standard CPU servers work perfectly.

---

## 🎯 What You'll Deploy

**2 Platforms, 5 Services, 0 GPUs**

### Platform 1: Railway (Backend)
- Service 1: FastAPI Backend
- Service 2: PostgreSQL Database
- Service 3: Redis Cache
- Service 4: Celery Worker

### Platform 2: Vercel (Frontend)
- Service 5: Next.js Frontend

**Total Monthly Cost: $10-20** (first month usually free)

---

## 🚀 Quick Setup (30 Minutes)

### Part 1: Deploy Backend to Railway (15 min)

#### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"

#### Step 2: Add Database & Redis
1. Click "+ New" → "Database" → "Add PostgreSQL"
2. Click "+ New" → "Database" → "Add Redis"
3. Wait 30 seconds for provisioning

#### Step 3: Deploy Backend API
1. Click "+ New" → "GitHub Repo"
2. Select: `subodhkc/Court-Case-Packet`
3. Click "Add Variables" → "Add All" from this list:

```env
# Database (auto-filled by Railway)
DATABASE_URL=postgresql+asyncpg://...
REDIS_URL=redis://...

# API Keys (you provide)
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY-HERE
STRIPE_SECRET_KEY=sk_test_YOUR-KEY-HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR-KEY-HERE
SENDGRID_API_KEY=SG.YOUR-KEY-HERE
FROM_EMAIL=admin@haiec.com

# Security (generate with: openssl rand -hex 32)
SECRET_KEY=YOUR-64-CHARACTER-RANDOM-STRING-HERE

# App Config
APP_NAME=CasePack
APP_VERSION=2.0.0
ENVIRONMENT=production
DEBUG=False
LOG_LEVEL=INFO

# CORS (update after deploying frontend)
ALLOWED_ORIGINS=http://localhost:3000

# Pricing (in cents)
BASIC_PRICE_CENTS=1500
STANDARD_PRICE_CENTS=3000
PREMIUM_PRICE_CENTS=5000
```

4. Click "Settings" → "Root Directory" → Enter: `backend`
5. Click "Settings" → "Build Command" → Enter: `pip install -r requirements.txt`
6. Click "Settings" → "Start Command" → Enter: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. Click "Deploy"
8. Wait 2-3 minutes
9. Copy your Railway URL: `https://casepack-production.up.railway.app`

#### Step 4: Run Database Migrations
1. Railway → Backend Service → "Shell" tab
2. Run: `alembic upgrade head`
3. You should see: "Running upgrade..." messages

#### Step 5: Deploy Celery Worker
1. Railway → "+ New" → "GitHub Repo" (same repo)
2. Root Directory: `backend`
3. Start Command: `celery -A app.workers.celery_app worker --loglevel=info`
4. Add same environment variables as Step 3
5. Click "Deploy"

**✅ Backend Complete! You now have:**
- Backend API running
- Database with tables
- Redis cache
- Background worker

---

### Part 2: Deploy Frontend to Vercel (10 min)

#### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project"

#### Step 2: Import Repository
1. Click "Import Git Repository"
2. Select: `subodhkc/Court-Case-Packet`
3. Click "Import"

#### Step 3: Configure Project
1. Framework Preset: Next.js (auto-detected)
2. Root Directory: `frontend`
3. Build Command: `npm run build` (auto-filled)
4. Output Directory: `.next` (auto-filled)

#### Step 4: Add Environment Variables
Click "Environment Variables" and add:

```env
NEXT_PUBLIC_API_URL=https://casepack-production.up.railway.app
NEXT_PUBLIC_APP_NAME=CasePack
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR-KEY-HERE
```

5. Click "Deploy"
6. Wait 2-3 minutes
7. Copy your Vercel URL: `https://casepack.vercel.app`

**✅ Frontend Complete!**

---

### Part 3: Connect Frontend to Backend (5 min)

#### Update CORS in Railway
1. Railway → Backend Service → Variables
2. Update `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=https://casepack.vercel.app,https://www.casepack.app
   ```
3. Click "Redeploy"

**✅ Deployment Complete!**

---

## 🧪 Test Your Deployment

### Test Backend
1. Visit: `https://[your-railway-url].up.railway.app/health`
2. Should see: `{"status":"healthy","app":"CasePack"}`

### Test Frontend
1. Visit: `https://[your-vercel-url].vercel.app`
2. Should see: Landing page loads
3. Click "Sign Up" → Create account
4. Login → Dashboard loads

### Test Full Flow
1. Create a case
2. Upload a test file (any PDF or image)
3. Check if file appears in case detail
4. Navigate around dashboard

**If everything works, you're ready to configure payments and go live!**

---

## 💳 Enable Payments (Optional - Do Later)

Follow **MANUAL_TASKS.md** Section 2 to:
1. Create Stripe products ($15, $30, $50)
2. Configure Stripe webhook
3. Test payment with test card: `4242 4242 4242 4242`
4. Switch to live mode when ready

---

## 🌐 Add Custom Domain (Optional)

### Frontend Domain
1. Buy domain: `casepack.app` (Namecheap/Google Domains)
2. Vercel → Project → Settings → Domains → Add Domain
3. Add DNS records at your registrar:
   ```
   CNAME: www → cname.vercel-dns.com
   A: @ → 76.76.21.21
   ```
4. Wait 24 hours for SSL

### Backend Domain (Optional)
1. Railway → Backend → Settings → Domains → Add `api.casepack.app`
2. Add DNS record:
   ```
   CNAME: api → [your-railway-app].up.railway.app
   ```
3. Update frontend env: `NEXT_PUBLIC_API_URL=https://api.casepack.app`

---

## 📊 Expected Costs

### Free Tier (First Month)
- Railway: $5 free credits
- Vercel: Free forever (hobby tier)
- Anthropic: Free credits for new accounts
- Total: **$0 first month**

### After Free Credits
- Railway Backend: ~$5/month
- Railway Celery Worker: ~$5/month
- Railway Database: Included
- Railway Redis: Included
- Vercel: $0 (free tier)
- Anthropic API: ~$10-30/month (usage-based)
- Stripe: 2.9% + 30¢ per transaction
- SendGrid: $0 (100 emails/day free)
- **Total: $20-40/month**

---

## 🆘 Troubleshooting

### Backend won't start
- Check Railway logs for errors
- Verify all environment variables are set
- Make sure `DATABASE_URL` starts with `postgresql+asyncpg://`

### Frontend can't connect to backend
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify CORS settings in Railway
- Check browser console for errors

### Database migration fails
- Railway → Backend → Shell → Run: `alembic upgrade head`
- Check database is running (Railway → PostgreSQL → should be green)

### File uploads fail
- Check Railway logs for errors
- Verify file size under 50MB
- Check backend has write permissions

---

## 🎯 What Each Service Does

| Service | What It Does | Needs GPU? | RAM Needed |
|---------|-------------|-----------|------------|
| **Backend API** | Handles all requests | ❌ No | 512MB-1GB |
| **PostgreSQL** | Stores all data | ❌ No | 256MB |
| **Redis** | Caching & queues | ❌ No | 256MB |
| **Celery Worker** | OCR, AI, PDF tasks | ❌ No | 512MB-1GB |
| **Frontend** | User interface | ❌ No | Serverless |

**Total RAM Required: ~2GB (very affordable)**

---

## ✅ Deployment Checklist

- [ ] Railway account created
- [ ] PostgreSQL added to Railway
- [ ] Redis added to Railway
- [ ] Backend deployed to Railway
- [ ] Environment variables added to Railway
- [ ] Database migrations run
- [ ] Celery worker deployed to Railway
- [ ] Vercel account created
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables added
- [ ] CORS updated in Railway backend
- [ ] Backend health check works
- [ ] Frontend loads
- [ ] Can create account
- [ ] Can login
- [ ] Can create case
- [ ] Can upload file

**All checked? You're live! 🚀**

---

## 📞 Need Help?

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Full Guide: See `DEPLOYMENT_GUIDE.md`
- Manual Tasks: See `MANUAL_TASKS.md`

---

**Remember: No GPU needed, just standard CPU servers! 🎉**
