# CasePack Deployment Guide

## Table of Contents

1. [Quick Start (Development)](#quick-start-development)
2. [Production Deployment](#production-deployment)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Service-Specific Deployments](#service-specific-deployments)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start (Development)

### Prerequisites

- Docker & Docker Compose installed
- Git
- (Optional) Node.js 18+ for local frontend development
- (Optional) Python 3.11+ for local backend development

### 1. Clone and Configure

```bash
git clone https://github.com/subodhkc/Court-Case-Packet.git
cd Court-Case-Packet

# Copy environment template
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` and set the following **required** variables:

```bash
# Required
SECRET_KEY=your-32-character-or-longer-secret-key
NEXTAUTH_SECRET=your-32-character-or-longer-nextauth-secret
ANTHROPIC_API_KEY=sk-ant-your-api-key-here

# Stripe (use test keys for development)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Admin credentials
ADMIN_EMAIL=admin@casepack.com
ADMIN_PASSWORD=change-this-secure-password
```

### 3. Start All Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend API (port 8000)
- Celery Worker
- Flower (worker monitoring at port 5555)

### 4. Initialize Database

```bash
# Run migrations
docker-compose exec backend alembic upgrade head

# (Optional) Create test admin user
docker-compose exec backend python -c "from app.models.user import User; from app.core.database import SessionLocal; from app.core.security import get_password_hash; db = SessionLocal(); user = User(email='admin@test.com', hashed_password=get_password_hash('admin123'), role='admin'); db.add(user); db.commit()"
```

### 5. Access the Application

- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Worker Dashboard**: http://localhost:5555
- **Frontend** (if running): http://localhost:3000

---

## Production Deployment

### Option 1: All-In-One Docker Deployment (Recommended for Small Scale)

**Platform**: DigitalOcean Droplet, AWS EC2, any VPS

1. **Provision server** (minimum 2GB RAM, 2 vCPUs)
2. **Install Docker & Docker Compose**
3. **Clone repository** and configure `.env` with production values
4. **Enable HTTPS** using Nginx + Let's Encrypt:

```bash
# Install Nginx
sudo apt install nginx certbot python3-certbot-nginx

# Configure Nginx reverse proxy
sudo nano /etc/nginx/sites-available/casepack

# Add configuration (see below)
sudo ln -s /etc/nginx/sites-available/casepack /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

5. **Start services**:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: Distributed Deployment (Recommended for Scale)

**Backend**: Railway, Render, AWS ECS, DigitalOcean App Platform

1. **Deploy Backend**:
   - Platform: Railway/Render
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Environment: Set all required `.env` variables

2. **Deploy Workers**:
   - Platform: Same as backend
   - Start command: `celery -A app.workers.celery_app worker --loglevel=info`
   - Environment: Same as backend

3. **Deploy Frontend**:
   - Platform: Vercel (free tier)
   - Framework: Next.js (auto-detected)
   - Environment variables:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.com
     NEXTAUTH_SECRET=your-secret
     NEXTAUTH_URL=https://your-frontend-url.com
     ```

4. **Managed Services**:
   - **Database**: DigitalOcean Managed PostgreSQL, AWS RDS
   - **Redis**: DigitalOcean Managed Redis, AWS ElastiCache
   - **Storage**: AWS S3, DigitalOcean Spaces, Backblaze B2

---

## Environment Configuration

### Required Environment Variables

```bash
# Application
SECRET_KEY=<generate with: openssl rand -hex 32>
NEXTAUTH_SECRET=<generate with: openssl rand -hex 32>

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis
REDIS_URL=redis://host:6379/0

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Stripe
STRIPE_SECRET_KEY=sk_live_... (or sk_test_...)
STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_...)
STRIPE_WEBHOOK_SECRET=whsec_...

# Admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=<strong password>
```

### Optional but Recommended

```bash
# Email (for magic links)
EMAIL_ENABLED=true
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<your-sendgrid-key>

# S3 Storage (production)
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=casepack-prod
AWS_REGION=us-east-1

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
LOG_LEVEL=INFO

# Security
DATA_RETENTION_DAYS=30
SIGNED_URL_EXPIRY=3600
```

---

## Database Setup

### Initial Migration

```bash
# Create initial migration
cd backend
alembic revision --autogenerate -m "Initial migration"

# Apply migration
alembic upgrade head
```

### Backup & Restore

```bash
# Backup
docker-compose exec postgres pg_dump -U casepack casepack > backup.sql

# Restore
docker-compose exec -T postgres psql -U casepack casepack < backup.sql
```

---

## Service-Specific Deployments

### Vercel (Frontend Only)

1. Connect GitHub repository
2. Framework preset: Next.js
3. Root directory: `frontend`
4. Build command: `npm run build`
5. Add environment variables via dashboard

### Railway (Backend + Workers)

1. New project from GitHub
2. **Backend service**:
   - Root directory: `backend`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Add PostgreSQL plugin
   - Add Redis plugin

3. **Worker service**:
   - Root directory: `backend`
   - Start command: `celery -A app.workers.celery_app worker`
   - Share PostgreSQL and Redis from backend

### DigitalOcean App Platform

1. Create new app from GitHub
2. Detect components (backend, frontend, workers)
3. Add managed PostgreSQL database
4. Add managed Redis
5. Configure environment variables

---

## Troubleshooting

### Backend won't start

**Check logs**:
```bash
docker-compose logs backend
```

**Common issues**:
- Database connection: Verify `DATABASE_URL` is correct
- Missing API key: Check `ANTHROPIC_API_KEY` is set
- Port conflict: Change ports in `docker-compose.yml`

### Celery worker not processing tasks

**Check worker logs**:
```bash
docker-compose logs celery_worker
```

**Common issues**:
- Redis connection: Verify `REDIS_URL`
- Task not registered: Check `app/workers/tasks.py` imports

### OCR not working

**Ensure Tesseract is installed**:
```bash
docker-compose exec backend tesseract --version
```

**If missing**:
```bash
# Rebuild backend image
docker-compose build backend
```

### Payments not working

**Test Stripe integration**:
```bash
# Use Stripe CLI for webhook testing
stripe listen --forward-to http://localhost:8000/api/v1/payments/webhook
```

**Check webhook secret**: Must match `STRIPE_WEBHOOK_SECRET`

### Frontend can't connect to backend

**Check CORS settings**:
- Verify `ALLOWED_ORIGINS` in backend `.env` includes frontend URL
- For development: `http://localhost:3000`
- For production: `https://yourdomain.com`

---

## Performance Tuning

### Database

```python
# In config.py, adjust:
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10
```

### Workers

```bash
# Scale workers
docker-compose up -d --scale celery_worker=3
```

### Redis

```bash
# Set max memory in docker-compose.yml
services:
  redis:
    command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
```

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong `SECRET_KEY` and `NEXTAUTH_SECRET`
- [ ] Enable HTTPS/TLS in production
- [ ] Set `DEBUG=false` in production
- [ ] Use production Stripe keys
- [ ] Enable rate limiting
- [ ] Configure firewall (only expose 80, 443)
- [ ] Set up automated backups
- [ ] Enable Sentry error tracking
- [ ] Review and update `DATA_RETENTION_DAYS`

---

## Monitoring & Maintenance

### Health Checks

```bash
# API health
curl http://localhost:8000/health

# Database
docker-compose exec postgres pg_isready -U casepack

# Redis
docker-compose exec redis redis-cli ping
```

### Log Management

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend

# Clear logs
docker-compose down && docker-compose up -d
```

### Automated Cleanup (Cron Job)

Add to crontab for auto-deletion of expired cases:

```bash
0 2 * * * cd /path/to/Court-Case-Packet && docker-compose exec -T backend python -m app.scripts.cleanup_expired_cases
```

---

## Cost Optimization

### Budget-Friendly Stack

- **Frontend**: Vercel Free Tier
- **Backend**: Railway Hobby ($5/mo) or Render Free Tier
- **Database**: DigitalOcean Managed PostgreSQL ($15/mo)
- **Redis**: Railway Redis ($5/mo) or self-hosted
- **Storage**: Local disk (dev) or Backblaze B2 ($0.005/GB)
- **AI**: Anthropic Claude Haiku ($0.25/MTok - cheapest)

**Estimated monthly cost**: $20-40 for low-volume usage

---

## Support

For issues:
- Check logs first
- Review [GitHub Issues](https://github.com/subodhkc/Court-Case-Packet/issues)
- Contact: support@casepack.com (if configured)
