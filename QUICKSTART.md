# CasePack - Quick Start Guide

**Get your CasePack application running in 30 minutes**

---

## ⚡ TL;DR (Super Quick Start)

```bash
# 1. Clone repository
git clone https://github.com/subodhkc/Court-Case-Packet.git
cd Court-Case-Packet

# 2. Set up environment
cp .env.example .env
# Edit .env and add your API keys

# 3. Start services
docker-compose up -d

# 4. Check status
docker-compose ps
```

**Access:**
- Backend API: http://localhost:8000/docs
- Worker Monitor: http://localhost:5555

---

## 📋 Prerequisites

**Required:**
- Docker & Docker Compose installed
- Anthropic API key (get free credits at https://console.anthropic.com)
- Stripe test account (https://dashboard.stripe.com)

**Optional:**
- Node.js 18+ (for local frontend development)
- PostgreSQL client (for database inspection)

---

## 🚀 Step-by-Step Setup

### Step 1: Get API Keys (15 minutes)

#### 1.1 Anthropic API Key

1. Go to https://console.anthropic.com
2. Sign up (get $5 free credits)
3. Navigate to **API Keys**
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-...`)

**Cost:** Free $5 credits, then $0.25 per million tokens (very cheap)

#### 1.2 Stripe Test Keys

1. Go to https://dashboard.stripe.com/register
2. Create account
3. **Toggle to Test Mode** (top right)
4. Go to **Developers → API Keys**
5. Copy:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`)
6. Go to **Developers → Webhooks**
7. Add endpoint: `http://localhost:8000/api/v1/payments/webhook`
8. Select events: `checkout.session.completed`
9. Copy **Signing secret** (starts with `whsec_...`)

**Cost:** Free for testing

#### 1.3 Generate Secrets

```bash
# On Mac/Linux:
openssl rand -hex 32

# Run twice to generate two different secrets
```

---

### Step 2: Configure Environment (5 minutes)

```bash
cd Court-Case-Packet
cp .env.example .env
```

Edit `.env` and update these lines:

```bash
# REQUIRED - Add your keys here
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE

# REQUIRED - Generate with: openssl rand -hex 32
SECRET_KEY=your_generated_secret_here
NEXTAUTH_SECRET=your_generated_secret_here

# OPTIONAL - Change if desired
ADMIN_EMAIL=admin@casepack.com
ADMIN_PASSWORD=change_this_secure_password
```

**Save the file.**

---

### Step 3: Start Services (2 minutes)

```bash
# Start all services in background
docker-compose up -d

# Check status (all should show "Up")
docker-compose ps

# Expected output:
# NAME                   STATUS
# casepack_postgres      Up (healthy)
# casepack_redis         Up (healthy)
# casepack_backend       Up
# casepack_worker        Up
# casepack_flower        Up
```

**Wait 30 seconds** for services to fully initialize.

---

### Step 4: Initialize Database (3 minutes)

The database tables need to be created. Currently, you need to do this manually:

#### Option A: Let the app create tables (DEBUG mode only)

If you have `DEBUG=true` in `.env`, the app will auto-create tables on startup.

```bash
# Restart backend to trigger table creation
docker-compose restart backend

# Check logs
docker-compose logs backend | grep "Created tables"
```

#### Option B: Create tables manually (Recommended)

```bash
# Access PostgreSQL
docker-compose exec postgres psql -U casepack -d casepack

# Paste this SQL (creates all tables):
```

```sql
CREATE TYPE userRole AS ENUM ('user', 'admin');
CREATE TYPE caseStatus AS ENUM ('created', 'uploading', 'processing', 'review', 'payment_pending', 'completed', 'failed');
CREATE TYPE caseType AS ENUM ('family_law', 'small_claims', 'landlord_tenant', 'harassment', 'employment', 'immigration', 'other');
CREATE TYPE fileStatus AS ENUM ('uploaded', 'ocr_pending', 'ocr_in_progress', 'ocr_completed', 'ocr_failed', 'parsed');
CREATE TYPE fileType AS ENUM ('image', 'pdf', 'text', 'document', 'other');
CREATE TYPE eventCategory AS ENUM ('message', 'email', 'payment', 'document', 'call', 'meeting', 'incident', 'other');
CREATE TYPE paymentStatus AS ENUM ('pending', 'succeeded', 'failed', 'canceled', 'refunded');

-- Create tables (simplified version)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role userRole DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    magic_link_token VARCHAR(255),
    magic_link_expires TIMESTAMP
);

CREATE TABLE cases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    case_type caseType NOT NULL,
    status caseStatus DEFAULT 'created',
    file_count INTEGER DEFAULT 0,
    processing_started_at TIMESTAMP,
    processing_completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    retention_expiry_at TIMESTAMP NOT NULL,
    notes TEXT
);

CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    original_name VARCHAR(500) NOT NULL,
    stored_name VARCHAR(500) UNIQUE NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_type fileType NOT NULL,
    size_bytes BIGINT NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    storage_path VARCHAR(1000) NOT NULL,
    ocr_status fileStatus DEFAULT 'uploaded',
    ocr_text TEXT,
    ocr_confidence INTEGER,
    exhibit_number INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    file_id INTEGER REFERENCES files(id) ON DELETE SET NULL,
    timestamp TIMESTAMP,
    timestamp_original VARCHAR(255),
    timestamp_confidence FLOAT DEFAULT 0.0,
    actor VARCHAR(255),
    snippet TEXT NOT NULL,
    full_text TEXT,
    category eventCategory DEFAULT 'other',
    source_reference VARCHAR(500),
    user_edited BOOLEAN DEFAULT false,
    user_hidden BOOLEAN DEFAULT false,
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    case_id INTEGER UNIQUE REFERENCES cases(id) ON DELETE CASCADE,
    amount FLOAT NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status paymentStatus DEFAULT 'pending',
    stripe_session_id VARCHAR(255) UNIQUE,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_receipt_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB,
    ip_address_hash VARCHAR(64),
    user_agent VARCHAR(500),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_files_case_id ON files(case_id);
CREATE INDEX idx_events_case_id ON events(case_id);
CREATE INDEX idx_events_timestamp ON events(timestamp);

\q
```

---

### Step 5: Create Admin User (2 minutes)

```bash
# Access backend container
docker-compose exec backend python -c "
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole

db = SessionLocal()
admin = User(
    email='admin@casepack.com',
    hashed_password=get_password_hash('admin123'),
    role=UserRole.ADMIN,
    is_active=True
)
db.add(admin)
db.commit()
print('✅ Admin user created: admin@casepack.com / admin123')
"
```

---

### Step 6: Test the API (3 minutes)

Open your browser: **http://localhost:8000/docs**

You should see the **Swagger UI** with all API endpoints.

#### Test Authentication:

1. Click on **POST /api/v1/auth/register**
2. Click **Try it out**
3. Enter:
   ```json
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```
4. Click **Execute**
5. You should get a response with `access_token`

#### Test Health Check:

1. Go to **GET /health**
2. Click **Try it out**
3. Click **Execute**
4. Should return: `{"status": "healthy"}`

---

## ✅ Verify Everything is Working

### Check Backend
```bash
# View logs
docker-compose logs backend | tail -20

# Should see: "Application startup complete"
```

### Check Database
```bash
# Check tables were created
docker-compose exec postgres psql -U casepack -d casepack -c "\dt"

# Should list: users, cases, files, events, payments, audit_logs
```

### Check Worker
```bash
# View worker logs
docker-compose logs celery_worker | tail -20

# Should see: "celery@... ready"
```

### Check Flower (Worker Monitor)
Open browser: **http://localhost:5555**

Should see Celery dashboard with 1 active worker.

---

## 🧪 Test File Processing (End-to-End)

### 1. Create a Test User

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

Copy the `access_token` from response.

### 2. Create a Case

```bash
curl -X POST http://localhost:8000/api/v1/cases/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{"title":"Test Case","case_type":"small_claims"}'
```

Copy the `id` from response (e.g., `1`).

### 3. Upload a File

Create a test image with text:
```bash
# On Mac/Linux: Create a simple text file
echo "This is a test document dated January 15, 2024. John Smith sent an email." > test.txt
```

Upload it:
```bash
curl -X POST http://localhost:8000/api/v1/files/upload/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -F "file=@test.txt"
```

### 4. Check Worker Processed It

```bash
# Check worker logs
docker-compose logs celery_worker | tail -50

# Should see: "Starting file OCR: 1"
# Should see: "File 1 processed: X events extracted"
```

---

## 🛠️ Common Issues & Fixes

### Issue: `docker-compose: command not found`

**Fix:**
```bash
# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Issue: Port 5432 already in use

**Fix:**
```bash
# Stop local PostgreSQL
sudo systemctl stop postgresql

# Or change port in docker-compose.yml:
ports:
  - "5433:5432"  # Use 5433 instead
```

### Issue: Backend won't start - "Could not connect to database"

**Fix:**
```bash
# Check PostgreSQL is healthy
docker-compose ps

# Restart backend
docker-compose restart backend

# Check logs
docker-compose logs backend
```

### Issue: "Invalid API key" error

**Fix:**
- Verify `ANTHROPIC_API_KEY` in `.env` is correct
- Make sure there are no extra spaces or quotes
- Check you have credits: https://console.anthropic.com

### Issue: OCR not extracting text

**Fix:**
```bash
# Check Tesseract is installed
docker-compose exec backend tesseract --version

# Should show: tesseract 5.x.x

# If missing, rebuild:
docker-compose build backend
```

---

## 📚 Next Steps

Now that your backend is running:

### Option A: Build the Frontend (Recommended)

See `TODO.md` section "Frontend Completion" for detailed steps.

Quick version:
```bash
cd frontend
npm install
npm run dev
```

Frontend will run at: http://localhost:3000

### Option B: Use API Directly (Testing)

- Use **Postman** or **Insomnia** to test API endpoints
- Swagger UI: http://localhost:8000/docs
- Build your own frontend with any framework

### Option C: Deploy to Production

See `DEPLOYMENT.md` for full deployment guide.

---

## 🎯 What's Working Right Now

✅ **Working:**
- User registration & login
- Case creation
- File upload
- OCR text extraction
- Database storage
- API endpoints
- Worker queue system

⚠️ **Not Yet Implemented:**
- Frontend UI (only landing page)
- Event extraction (async issue needs fix)
- Timeline building (depends on events)
- PDF generation (depends on timeline)
- Payment processing (Stripe integration exists but untested)

**To make it fully functional, see `TODO.md` for the complete checklist.**

---

## 💡 Development Tips

### View Logs in Real-Time
```bash
# All services
docker-compose logs -f

# Just backend
docker-compose logs -f backend

# Just worker
docker-compose logs -f celery_worker
```

### Restart a Service
```bash
docker-compose restart backend
docker-compose restart celery_worker
```

### Stop Everything
```bash
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

### Access Database
```bash
docker-compose exec postgres psql -U casepack -d casepack
```

### Run Python Commands
```bash
docker-compose exec backend python -c "print('Hello from Python')"
```

---

## 🔐 Security Reminders

**Before deploying to production:**

- [ ] Change `ADMIN_PASSWORD` to a strong password
- [ ] Use production Stripe keys (not test keys)
- [ ] Set `DEBUG=false`
- [ ] Use strong `SECRET_KEY` and `NEXTAUTH_SECRET`
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Enable database backups

See `TODO.md` section "Security Hardening" for full checklist.

---

## 📞 Get Help

**Documentation:**
- `README.md` - Overview and features
- `TODO.md` - What needs to be done
- `DEPLOYMENT.md` - Production deployment

**API Documentation:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

**Logs:**
- Backend: `docker-compose logs backend`
- Worker: `docker-compose logs celery_worker`
- Database: `docker-compose logs postgres`

**Common Commands:**
```bash
# Check service status
docker-compose ps

# Restart all services
docker-compose restart

# View resource usage
docker stats

# Clean up
docker-compose down
docker system prune -a  # Remove unused images
```

---

## ✅ Success Checklist

After completing this guide, you should have:

- [x] All Docker services running
- [x] Database tables created
- [x] Admin user created
- [x] API accessible at http://localhost:8000
- [x] Swagger docs working
- [x] Worker monitor at http://localhost:5555
- [x] Successfully registered a test user
- [x] Successfully created a test case

**Next:** Build the frontend or deploy to production!

---

**Estimated Total Setup Time:** 30 minutes

**Questions?** Check `TODO.md` for detailed implementation guides.
