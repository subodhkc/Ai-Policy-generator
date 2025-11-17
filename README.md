# CasePack - AI-Assisted Court Evidence & Case Packet Builder

Transform chaotic evidence into professionally formatted court packets with AI-powered timeline building, OCR, and exhibit management.

> **Note**: Court formatting requirements vary by jurisdiction. This tool provides professional document organization, not legal advice. Always verify compliance with local court rules before filing.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)

---

## 🎯 What is CasePack?

CasePack helps pro se litigants (self-represented individuals) organize evidence for court cases. Upload screenshots, PDFs, chat logs, and other evidence files—our AI extracts dates, actors, and events to build a professional timeline and exhibits package.

### Key Features

- **📤 Drag & Drop Upload**: Upload hundreds of evidence files at once
- **🤖 AI-Powered Extraction**: Claude Haiku extracts events, dates, and actors from images and PDFs
- **📊 Automatic Timeline**: Chronological timeline with confidence scores and source references
- **📑 Professional PDFs**: Timeline, Exhibit Index, and Case Summary in court-style format
- **💳 Pay-Per-Case**: Only pay when you're ready to download ($15-$50 per case)
- **🔒 UPL Compliant**: Document organization tool only—no legal advice provided
- **🗑️ 30-Day Retention**: Automatic data deletion for privacy

---

## 🏗️ Architecture

### Tech Stack

**Frontend** (Next.js 14 + TypeScript):
- **Framework**: Next.js 14 with App Router
- **UI Components**: shadcn/ui (46+ Radix UI components)
- **State Management**: React Query + Zustand
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS with dark mode
- **Deployment**: Vercel

**Backend** (FastAPI + Python 3.11):
- **API Framework**: FastAPI with async/await
- **Database**: PostgreSQL + SQLAlchemy + Alembic migrations
- **Cache**: Redis
- **Workers**: Celery for async file processing
- **AI**: Anthropic Claude Haiku for event extraction
- **OCR**: Tesseract for text extraction from images
- **PDF Generation**: ReportLab
- **Payments**: Stripe Checkout
- **Email**: SendGrid or Resend
- **Deployment**: Railway

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│  Next.js 14 + React Query + shadcn/ui + Tailwind CSS       │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS/REST
┌────────────────────────▼────────────────────────────────────┐
│                      BACKEND API                            │
│             FastAPI + JWT Authentication                    │
├─────────────────────────────────────────────────────────────┤
│  Auth  │  Cases  │  Files  │  Events  │  Payments │ Admin  │
└────┬────────────┬────────┬─────────┬──────────┬────────────┘
     │            │        │         │          │
┌────▼─────┐ ┌───▼──┐ ┌───▼──┐ ┌────▼───┐ ┌───▼────┐
│PostgreSQL│ │ Redis│ │Celery│ │Anthropic│ │ Stripe │
│ Database │ │Cache │ │Worker│ │   AI    │ │Payments│
└──────────┘ └──────┘ └───┬──┘ └─────────┘ └────────┘
                          │
                  ┌───────┴───────┐
                  │   Services    │
                  │ OCR │ PDF │ AI│
                  └───────────────┘
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL 14+
- Redis 6+
- Anthropic API key (for AI features)

### 1. Clone Repository

```bash
git clone https://github.com/subodhkc/Court-Case-Packet.git
cd Court-Case-Packet
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your credentials:
# - DATABASE_URL
# - REDIS_URL
# - ANTHROPIC_API_KEY
# - SECRET_KEY (generate with: openssl rand -hex 32)

# Run migrations
alembic upgrade head

# Start backend
uvicorn app.main:app --reload --port 8000

# In another terminal, start Celery worker
celery -A app.workers.celery_app worker --loglevel=info
```

Backend will run at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local:
NEXT_PUBLIC_API_URL=http://localhost:8000

# Start frontend
npm run dev
```

Frontend will run at `http://localhost:3000`

### 4. Test the Application

1. Navigate to `http://localhost:3000`
2. Click "Sign Up" and create an account
3. Create a new case
4. Upload evidence files (try screenshots or PDFs)
5. Watch processing status update
6. View generated timeline

---

## 📦 Project Structure

```
Court-Case-Packet/
├── backend/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── auth.py       # Authentication endpoints
│   │   │   ├── cases.py      # Case CRUD operations
│   │   │   ├── files.py      # File upload/download
│   │   │   ├── payments.py   # Stripe integration
│   │   │   └── deps.py       # Auth dependencies
│   │   ├── core/             # Core configuration
│   │   │   ├── config.py     # Settings with Pydantic
│   │   │   ├── database.py   # Database connection
│   │   │   └── security.py   # JWT, encryption, hashing
│   │   ├── models/           # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   ├── case.py
│   │   │   ├── file.py
│   │   │   ├── event.py
│   │   │   ├── payment.py
│   │   │   └── audit_log.py
│   │   ├── services/         # Business logic
│   │   │   ├── ocr.py        # Tesseract OCR
│   │   │   ├── ai_service.py # Claude Haiku integration
│   │   │   ├── parser.py     # Event extraction
│   │   │   ├── timeline.py   # Timeline builder
│   │   │   ├── pdf_generator.py # ReportLab PDFs
│   │   │   └── storage.py    # File storage (local/S3)
│   │   ├── workers/          # Celery tasks
│   │   │   ├── celery_app.py
│   │   │   └── tasks.py      # Async processing
│   │   ├── infrastructure/   # Security & error handling
│   │   │   ├── security.py   # LogSense security middleware
│   │   │   └── error_handler.py # Global error handling
│   │   └── main.py           # FastAPI application
│   ├── alembic/              # Database migrations
│   │   ├── versions/
│   │   └── env.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/    # Login page
│   │   │   │   └── register/ # Registration page
│   │   │   ├── (dashboard)/
│   │   │   │   ├── dashboard/# Dashboard with stats
│   │   │   │   └── cases/    # Case list and detail
│   │   │   ├── (legal)/
│   │   │   │   ├── privacy/  # Privacy policy
│   │   │   │   └── terms/    # Terms of service
│   │   │   ├── layout.tsx    # Root layout
│   │   │   ├── page.tsx      # Landing page
│   │   │   └── globals.css   # Global styles
│   │   ├── components/
│   │   │   ├── ui/           # 46 shadcn/ui components
│   │   │   ├── file-upload.tsx # Drag & drop upload
│   │   │   ├── timeline-view.tsx # Timeline display
│   │   │   └── theme-toggle.tsx # Dark mode toggle
│   │   ├── hooks/
│   │   │   └── use-cases.ts  # React Query hooks
│   │   ├── lib/
│   │   │   ├── api-client.ts # Axios API client
│   │   │   └── utils.ts      # cn() helper
│   │   └── providers/
│   │       ├── query-provider.tsx # React Query
│   │       └── theme-provider.tsx # Dark mode
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json         # Strict TypeScript config
│   └── .env.example
│
├── docs/
│   ├── DEPLOYMENT_GUIDE.md   # Complete deployment guide
│   ├── MANUAL_TASKS.md       # Required manual tasks
│   ├── MASTER_PLAN.md        # 15-phase implementation roadmap
│   └── TODO.md               # Production readiness checklist
│
├── docker-compose.yml        # Local development setup
└── README.md                 # This file
```

---

## 🔐 Security Features

### Implemented Security (LogSense-Integrated)

- **Authentication**: JWT tokens with secure password hashing (bcrypt)
- **Authorization**: Role-based access control (user/admin)
- **Input Validation**: Request size limits (50MB files, 10MB JSON)
- **File Upload**: Type validation, secure filename generation, SHA-256 hashing
- **CORS**: Strict origin allowlist
- **Headers**: CSP, HSTS, X-Frame-Options, X-XSS-Protection
- **PII Redaction**: Automatic sanitization of logs (emails, SSN, credit cards)
- **Encryption**: Data encrypted at rest and in transit
- **Audit Logs**: All user actions tracked with IP and user agent
- **Rate Limiting**: Handled by infrastructure middleware
- **Error Handling**: Standardized error responses (no stack traces to client)

### Compliance

- **UPL Disclaimer**: Prominently displayed on all pages
- **GDPR Features**: 30-day data retention, user-initiated deletion, PII redaction
- **Privacy Policy**: Included at `/privacy`
- **Terms of Service**: Included at `/terms`

---

## 💰 Pricing Tiers

| Tier | Price | Files | Features |
|------|-------|-------|----------|
| **Basic** | $15 | Up to 50 | Timeline + Exhibit Index + Summary |
| **Standard** | $30 | Up to 200 | Everything in Basic + Bundle PDF |
| **Premium** | $50 | Unlimited | Everything + Priority Processing |

---

## 🚢 Production Deployment

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for complete deployment instructions.

### Quick Deploy Summary

1. **Backend** → Railway (PostgreSQL, Redis, Celery Worker)
2. **Frontend** → Vercel (automatic Next.js deployment)
3. **Domain** → Custom domain with SSL (optional)
4. **Payments** → Stripe (test mode → live mode)
5. **Monitoring** → Vercel Analytics + Sentry (optional)

**Estimated Monthly Cost**: $20-40 (Railway + API usage)

---

## 📋 Manual Tasks Required

See **[MANUAL_TASKS.md](./MANUAL_TASKS.md)** for complete checklist.

### Critical Tasks (Before Going Live)

- [ ] Obtain Anthropic API key
- [ ] Set up Stripe account and create products
- [ ] Configure email service (SendGrid or Resend)
- [ ] Generate SECRET_KEY for JWT
- [ ] Run database migrations (`alembic upgrade head`)
- [ ] Update CORS origins for production
- [ ] Configure Stripe webhooks
- [ ] Update legal pages (privacy policy, terms)
- [ ] Test end-to-end with real evidence files

---

## 🧪 Testing

### Run Backend Tests

```bash
cd backend
pytest
```

### Run Frontend Tests

```bash
cd frontend
npm test                # Vitest unit tests
npm run test:e2e        # Playwright E2E tests
```

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Create and delete cases
- [ ] Upload files (PDF, PNG, JPG)
- [ ] View processing status
- [ ] Review generated timeline
- [ ] Payment flow (Stripe test mode)
- [ ] Download generated PDFs
- [ ] Dark mode toggle
- [ ] Responsive design (mobile/tablet/desktop)

---

## 📊 Performance

### Target Metrics

- **File Upload**: <2 seconds for 50MB files
- **OCR Processing**: <30 seconds per file
- **Timeline Generation**: <10 seconds for 100 events
- **PDF Generation**: <5 seconds
- **Page Load**: <1 second (Vercel CDN)
- **API Response**: <200ms (95th percentile)

### Optimization Features

- Async/await throughout backend
- React Query caching (1 minute stale time)
- Next.js automatic code splitting
- Image optimization (Next.js built-in)
- Database indexes on frequently queried fields
- Celery workers for background processing

---

## 🐛 Troubleshooting

### Common Issues

**Backend not starting**:
- Check DATABASE_URL is correct
- Ensure PostgreSQL and Redis are running
- Run `alembic upgrade head`

**File uploads failing**:
- Check upload directory exists: `backend/uploads/`
- Verify file size <50MB
- Check allowed file types in security.py

**Timeline not generating**:
- Verify Anthropic API key is valid
- Check Celery worker is running
- Review Celery logs for errors

**Payment flow errors**:
- Ensure Stripe is in test mode initially
- Verify webhook endpoint is configured
- Use test card: `4242 4242 4242 4242`

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#troubleshooting) for more.

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `pytest` (backend) and `npm test` (frontend)
5. Commit with clear messages
6. Push to your fork
7. Create a Pull Request

### Code Style

- **Backend**: Black formatter, isort, flake8
- **Frontend**: ESLint, Prettier, TypeScript strict mode
- **Commits**: Conventional Commits format

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **shadcn/ui**: Beautiful React components
- **Nextbase**: Premium Next.js starter (component source)
- **LogSense**: Security middleware and error handling
- **Anthropic**: Claude Haiku AI model
- **Stripe**: Payment processing
- **Vercel**: Frontend hosting
- **Railway**: Backend hosting

---

## 📞 Support

- **Documentation**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md), [MANUAL_TASKS.md](./MANUAL_TASKS.md)
- **GitHub Issues**: [Report bugs or request features](https://github.com/subodhkc/Court-Case-Packet/issues)
- **Email**: support@casepack.app (after deployment)

---

## 🗺️ Roadmap

### Phase 1: Backend Security & Bug Fixes ✅
- Fixed async/sync bugs
- Added LogSense security middleware
- Created Alembic migrations

### Phase 2: Frontend Foundation ✅
- 46 shadcn/ui components integrated
- React Query setup
- Authentication pages
- Dark mode support

### Phase 3-6: Core Features ✅ (Current)
- Case management (CRUD)
- File upload with drag & drop
- Timeline view
- Landing page
- Privacy & terms pages

### Phase 7-10: Advanced Features (Next)
- Stripe payment integration
- PDF generation and download
- Email notifications
- Admin dashboard

### Phase 11-15: Polish & Launch
- Comprehensive testing
- Performance optimization
- SEO optimization
- Production deployment
- Marketing site

---

**Built with ❤️ for pro se litigants navigating the justice system.**

---

## Quick Links

- 📖 [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- ✅ [Manual Tasks Checklist](./MANUAL_TASKS.md)
- 🗺️ [Master Implementation Plan](./MASTER_PLAN.md)
- 📋 [Production Readiness TODO](./TODO.md)

---

**Star ⭐ this repo if you find it helpful!**
