# Quick Setup Guide - Connect Frontend to Backend

## ✅ Your Modal Backend is Live!

**Backend URL:** https://haiec--casepack-backend-fastapi-app.modal.run

## 🔧 Connect It to Your Frontend (2 Steps)

### Step 1: Add to GitHub Secrets

1. Go to: https://github.com/subodhkc/Court-Case-Packet/settings/secrets/actions
2. Click "New repository secret"
3. Add these:

| Secret Name | Value |
|-------------|-------|
| `MODAL_BACKEND_URL` | `https://haiec--casepack-backend-fastapi-app.modal.run` |
| `VERCEL_URL` | `https://court-case-packet.vercel.app` |

### Step 2: Add to Vercel Environment Variables

1. Go to: https://vercel.com/suvodkc-7643s-projects/court-case-packet/settings/environment-variables
2. Click "Add New"
3. Add:

| Variable Name | Value | Environments |
|---------------|-------|--------------|
| `NEXT_PUBLIC_API_URL` | `https://haiec--casepack-backend-fastapi-app.modal.run` | Production, Preview, Development |

### Step 3: Redeploy

**Option A: Trigger Auto-Deploy**
```bash
# Make a small change to trigger deployment
git commit --allow-empty -m "Trigger deployment with backend URL"
git push origin claude/fix-vercel-pipeline-0123m8QxR7cBKvo5Zq11D4H9
```

**Option B: Manual Redeploy on Vercel**
1. Go to: https://vercel.com/suvodkc-7643s-projects/court-case-packet
2. Click on latest deployment
3. Click "⋯" menu → "Redeploy"

---

## 🧪 Test Your Backend

**Health Check:**
```bash
curl https://haiec--casepack-backend-fastapi-app.modal.run/health
```

**API Documentation:**
Visit: https://haiec--casepack-backend-fastapi-app.modal.run/docs

---

## 🎉 After Connection, You Can:

1. **Register an account** at https://court-case-packet.vercel.app/register
2. **Login** and create a case
3. **Upload files** (screenshots, PDFs, etc.)
4. **See AI processing** extract events and build timeline
5. **Download court packets** as professional PDFs

---

**Need help?** Check the error in GitHub Actions and let me know what it says!
