# Final Deployment Checklist - CasePack Production Launch

This is your final pre-launch checklist. Complete all items before going live.

---

## ✅ Pre-Launch Verification (Complete These First)

### Backend Verification

- [ ] Run backend locally: `cd backend && uvicorn app.main:app --reload`
- [ ] Visit http://localhost:8000/docs - verify all API endpoints show
- [ ] Test health endpoint: http://localhost:8000/health
- [ ] Verify database migrations: `alembic current` (should show latest migration)
- [ ] Check all environment variables in `.env` are set
- [ ] Test Celery worker: `celery -A app.workers.celery_app worker --loglevel=info`
- [ ] Verify no import errors or missing dependencies

### Frontend Verification

- [ ] Run frontend locally: `cd frontend && npm run dev`
- [ ] Visit http://localhost:3000 - landing page loads
- [ ] Test user registration flow
- [ ] Test user login flow
- [ ] Create a test case
- [ ] Upload a test file (any PDF or image)
- [ ] Verify file shows in case detail page
- [ ] Test dark mode toggle
- [ ] Check responsive design (mobile, tablet, desktop)
- [ ] Verify no console errors in browser DevTools

---

## 🔐 Security & Credentials Checklist

### API Keys & Secrets (REQUIRED)

- [ ] **Anthropic API Key**: Obtained from https://console.anthropic.com/
  - Added to Railway: `ANTHROPIC_API_KEY=sk-ant-api03-...`
  - Tested with a sample API call

- [ ] **SECRET_KEY**: Generated with `openssl rand -hex 32`
  - Added to Railway: `SECRET_KEY=abc123...` (64 characters)
  - Never committed to Git

- [ ] **Stripe Keys**: Obtained from https://dashboard.stripe.com/apikeys
  - Test mode keys added initially
  - Railway backend: `STRIPE_SECRET_KEY=sk_test_...`
  - Railway backend: `STRIPE_PUBLISHABLE_KEY=pk_test_...`
  - Vercel frontend: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`

- [ ] **Email Service**: SendGrid OR Resend
  - SendGrid: `SENDGRID_API_KEY=SG....` OR
  - Resend: `RESEND_API_KEY=re_...`
  - FROM_EMAIL: `admin@haiec.com`
  - Sender verified in email provider dashboard

### Database & Infrastructure

- [ ] Railway PostgreSQL database created
- [ ] Railway Redis instance created
- [ ] Database URL added to Railway: `DATABASE_URL=postgresql+asyncpg://...`
- [ ] Redis URL added to Railway: `REDIS_URL=redis://...`
- [ ] Database migrations run: `alembic upgrade head`
- [ ] Database connections tested

---

## 💳 Stripe Configuration

### Products & Prices

- [ ] Stripe account activated (test mode initially)
- [ ] Three products created in Stripe Dashboard:
  - [ ] **Basic Packet**: $15 USD (one-time)
  - [ ] **Standard Packet**: $30 USD (one-time)
  - [ ] **Premium Packet**: $50 USD (one-time)
- [ ] Price IDs copied and added to Railway:
  ```
  STRIPE_PRICE_BASIC=price_abc...
  STRIPE_PRICE_STANDARD=price_def...
  STRIPE_PRICE_PREMIUM=price_ghi...
  ```

### Webhook Configuration

- [ ] Webhook endpoint created: `https://api.casepack.app/api/payments/webhook`
- [ ] Events selected:
  - [ ] `checkout.session.completed`
  - [ ] `payment_intent.succeeded`
  - [ ] `payment_intent.payment_failed`
- [ ] Webhook signing secret added to Railway: `STRIPE_WEBHOOK_SECRET=whsec_...`
- [ ] Webhook tested with Stripe CLI (optional): `stripe listen --forward-to localhost:8000/api/payments/webhook`

---

## 🚀 Deployment Steps

### 1. Backend Deployment to Railway

- [ ] Railway account created
- [ ] New project created in Railway
- [ ] PostgreSQL service added
- [ ] Redis service added
- [ ] Backend service connected to GitHub repo
- [ ] Root directory set to: `backend`
- [ ] Build command: `pip install -r requirements.txt`
- [ ] Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- [ ] All environment variables added (see checklist above)
- [ ] Celery worker service created (same repo, different start command)
- [ ] Celery start command: `celery -A app.workers.celery_app worker --loglevel=info`
- [ ] First deployment successful
- [ ] Backend URL copied: `https://[your-app].up.railway.app`

### 2. Frontend Deployment to Vercel

- [ ] Vercel account created
- [ ] New project created in Vercel
- [ ] GitHub repository connected
- [ ] Root directory set to: `frontend`
- [ ] Framework preset: Next.js
- [ ] Environment variables added:
  ```
  NEXT_PUBLIC_API_URL=https://[your-railway-app].up.railway.app
  NEXT_PUBLIC_APP_NAME=CasePack
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  ```
- [ ] First deployment successful
- [ ] Frontend URL copied: `https://[your-app].vercel.app`

### 3. CORS Configuration

- [ ] Update Railway backend environment:
  ```
  ALLOWED_ORIGINS=https://[your-vercel-app].vercel.app,https://[custom-domain].com
  ```
- [ ] Redeploy backend service
- [ ] Test API calls from frontend (check Network tab in browser)

---

## 🌐 Domain Configuration (Optional but Recommended)

### Domain Purchase

- [ ] Domain purchased (e.g., casepack.app)
- [ ] Registrar: Namecheap/Google Domains/Cloudflare

### Frontend Domain (Vercel)

- [ ] Domain added in Vercel project settings
- [ ] DNS records configured:
  ```
  Type: CNAME, Name: www, Value: cname.vercel-dns.com
  Type: A, Name: @, Value: 76.76.21.21
  ```
- [ ] SSL certificate auto-provisioned (may take 24 hours)
- [ ] Domain verified and working

### Backend Domain (Railway - Optional)

- [ ] Custom domain added in Railway: `api.casepack.app`
- [ ] DNS record configured:
  ```
  Type: CNAME, Name: api, Value: [railway-app].up.railway.app
  ```
- [ ] Update frontend environment: `NEXT_PUBLIC_API_URL=https://api.casepack.app`
- [ ] Update CORS origins in backend

---

## 📧 Email Testing

- [ ] Send test welcome email to yourself
- [ ] Send test payment confirmation email
- [ ] Send test case completed notification
- [ ] Verify emails not in spam folder
- [ ] Check email formatting (HTML renders correctly)
- [ ] Verify links in emails work

---

## 🧪 End-to-End Testing (Critical!)

### User Journey Test

1. [ ] Navigate to landing page
2. [ ] Click "Get Started" → Register new account
3. [ ] Verify welcome email received
4. [ ] Login with new account
5. [ ] Dashboard loads with empty state
6. [ ] Create new case with title and description
7. [ ] Navigate to case detail page
8. [ ] Upload evidence file (test with PDF and image)
9. [ ] Verify file appears in file list
10. [ ] Wait for processing (or trigger manually in backend)
11. [ ] Check timeline tab for extracted events
12. [ ] Click payment button
13. [ ] Select pricing tier (use Basic for testing)
14. [ ] Redirected to Stripe Checkout
15. [ ] Use test card: `4242 4242 4242 4242`, any future date, any CVC
16. [ ] Complete payment
17. [ ] Redirected to success page
18. [ ] Verify payment confirmation email received
19. [ ] Return to dashboard
20. [ ] Verify case status updated
21. [ ] Download generated PDFs (if implemented)
22. [ ] Test logout and login again
23. [ ] Verify session persists

### Admin Dashboard Test (If you created admin user)

- [ ] Login as admin user
- [ ] Navigate to /admin
- [ ] Verify statistics show correct counts
- [ ] Check recent activity logs
- [ ] Verify system health indicators

### Error Handling Test

- [ ] Test 404 page (visit non-existent URL)
- [ ] Test error boundary (trigger error intentionally)
- [ ] Verify error messages are user-friendly
- [ ] Check error pages have navigation back

### Mobile Responsiveness

- [ ] Test on mobile device or Chrome DevTools mobile view
- [ ] Landing page responsive
- [ ] Dashboard responsive
- [ ] File upload works on mobile
- [ ] Forms usable on small screens

---

## 🔍 SEO & Marketing Verification

- [ ] Visit `/sitemap.xml` - verify sitemap generates
- [ ] Visit `/robots.txt` - verify robots.txt exists
- [ ] Check page titles in browser tabs (should be descriptive)
- [ ] Verify meta descriptions present (check page source)
- [ ] Test social sharing (share link shows preview)
- [ ] Landing page has compelling copy
- [ ] Testimonials present and believable
- [ ] FAQ section answers common questions
- [ ] Contact information visible (admin@haiec.com)

---

## 📊 Monitoring Setup (Optional)

- [ ] Vercel Analytics enabled
- [ ] Sentry error tracking configured (optional)
- [ ] UptimeRobot monitoring setup (optional)
  - Monitor: Frontend URL
  - Monitor: Backend health endpoint

---

## 🚦 Go-Live Decision

### Final Checks Before Launch

- [ ] All tests passed (no critical errors)
- [ ] Payment flow works end-to-end
- [ ] Emails delivering successfully
- [ ] No console errors in production
- [ ] Mobile experience acceptable
- [ ] Privacy policy and terms of service reviewed
- [ ] UPL disclaimers prominently displayed
- [ ] Domain configured and SSL active

### Switch Stripe to Live Mode (When Ready)

⚠️ **Do this AFTER testing in test mode!**

1. [ ] Stripe Dashboard → Toggle to Live Mode
2. [ ] Create products again (same as test mode)
3. [ ] Copy live API keys: `pk_live_...` and `sk_live_...`
4. [ ] Update Railway environment variables with live keys
5. [ ] Update Vercel environment variables
6. [ ] Configure webhook for live mode
7. [ ] Update webhook secret
8. [ ] Redeploy both services
9. [ ] Test with real payment (small amount)
10. [ ] Verify refund works (test 7-day refund policy)

---

## 📢 Launch Communication

### Announcement Channels

- [ ] Update landing page with "Now Live" banner
- [ ] Social media announcement (if applicable)
- [ ] Email announcement to waitlist (if you have one)
- [ ] Product Hunt launch (optional)

### Support Setup

- [ ] Email auto-responder configured
- [ ] FAQ page comprehensive
- [ ] Help documentation available
- [ ] Support contact information visible

---

## 🔄 Post-Launch Monitoring (First 7 Days)

### Daily Tasks

- [ ] Check Railway logs for errors
- [ ] Check Vercel logs for errors
- [ ] Monitor Stripe Dashboard for payments
- [ ] Check email deliverability
- [ ] Review user feedback
- [ ] Monitor API costs (Anthropic usage)
- [ ] Check storage usage (Railway)

### Weekly Tasks

- [ ] Review error logs and fix critical issues
- [ ] Analyze user behavior (which features used most)
- [ ] Check payment success rate
- [ ] Monitor processing times
- [ ] Review and respond to support emails

---

## 🎉 Launch Checklist Summary

**Minimum Required (Can launch with these):**
- ✅ Anthropic API key
- ✅ Stripe test mode configured
- ✅ Email service configured
- ✅ Backend deployed to Railway
- ✅ Frontend deployed to Vercel
- ✅ End-to-end test passed
- ✅ Payment flow works

**Recommended (Add these soon after):**
- ✅ Custom domain configured
- ✅ Stripe live mode enabled
- ✅ Monitoring setup
- ✅ Error tracking configured

**Nice to Have (Can add later):**
- SEO optimization complete
- Social media presence
- Content marketing
- User onboarding improvements

---

## 🆘 Troubleshooting Quick Reference

### Common Issues

**Backend won't start:**
- Check Railway logs for error message
- Verify all environment variables set
- Run migrations: `alembic upgrade head`

**Frontend can't connect to backend:**
- Check CORS configuration
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check Network tab in browser DevTools

**Payments failing:**
- Verify Stripe keys are correct (test vs live)
- Check webhook configured correctly
- Look in Stripe Dashboard → Events log

**Emails not sending:**
- Verify email API key is correct
- Check sender email is verified
- Look in SendGrid/Resend dashboard for delivery logs

**File uploads failing:**
- Check file size under 50MB
- Verify file type is allowed
- Check Railway logs for errors

---

## 📞 Support Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Anthropic Docs**: https://docs.anthropic.com
- **GitHub Issues**: [Your repo]/issues

---

## ✨ You're Ready to Launch!

Once you've completed all items in the "Minimum Required" section and tested thoroughly, you're ready to go live!

**Good luck with your launch! 🚀**

---

**Pro Tips:**
1. Start with Stripe test mode and switch to live mode after a few successful test transactions
2. Monitor logs closely for the first 24 hours
3. Have a rollback plan (keep previous deployment available)
4. Celebrate your launch! 🎉

---

**Need Help?**
- Review DEPLOYMENT_GUIDE.md for detailed steps
- Review MANUAL_TASKS.md for setup instructions
- Check README.md for architecture overview
- Open GitHub issue for bugs or questions

---

**Last Updated**: 2025-11-15
**Version**: 2.0.0 - Production Ready
**Status**: ✅ Complete - Ready for Launch
