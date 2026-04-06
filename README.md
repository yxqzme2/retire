# RetireVision — Self-Hosted Retirement Planning Dashboard

A fully self-hosted, privacy-first retirement planning tool. Model multiple scenarios, track account balances, project income and expenses, and visualize your path to financial independence.

---

## Stack Overview

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Charts | Recharts |
| State | TanStack Query v5 |
| Backend | FastAPI, Python 3.12 |
| Database | SQLite (via SQLAlchemy) |
| Container | Docker + Nginx |

---

## Quick Start — Local Development

### Prerequisites
- Python 3.12+
- Node.js 20+

### Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt

# Create data directory
mkdir -p ../data/db

# Run the server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Docker Deployment

### Quick Start

```bash
# Copy environment file
cp .env.example .env

# Build and start
docker compose up -d

# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Environment Variables (.env)

```
BACKEND_PORT=8000       # Port to expose backend on
FRONTEND_PORT=3000      # Port to expose frontend on
DATABASE_URL=sqlite:////data/retire.db
UPLOAD_DIR=/uploads
```

---

## Unraid Deployment

### Using Community Applications (recommended)

Search for "RetireVision" in Community Applications, or use the manual template below.

### Manual docker run

**Backend:**

```bash
docker run -d \
  --name retirevision-backend \
  -p 8000:8000 \
  -v /mnt/user/appdata/retirevision/db:/data \
  -v /mnt/user/appdata/retirevision/uploads:/uploads \
  -e DATABASE_URL=sqlite:////data/retire.db \
  --restart unless-stopped \
  retirevision-backend:latest
```

**Frontend:**

```bash
docker run -d \
  --name retirevision-frontend \
  -p 3000:80 \
  -e VITE_API_URL=http://YOUR_UNRAID_IP:8000/api/v1 \
  --restart unless-stopped \
  retirevision-frontend:latest
```

Replace `YOUR_UNRAID_IP` with your Unraid server's local IP address.

---

## Volume Mapping

| Container Path | Purpose | Host Path (example) |
|---------------|---------|---------------------|
| `/data` | SQLite database | `/mnt/user/appdata/retirevision/db` |
| `/uploads` | CSV upload staging | `/mnt/user/appdata/retirevision/uploads` |

---

## SQLite Backup

The entire database is a single file: `retire.db` inside the `/data` volume.

**Backup:**
```bash
cp /path/to/data/retire.db /path/to/backup/retire_$(date +%Y%m%d).db
```

**Restore:**
```bash
cp /path/to/backup/retire_20250101.db /path/to/data/retire.db
# Restart the backend container
```

For automated backups on Unraid, use the Community Applications Backup plugin or a cron job.

---

## CSV Import Guide

### Supported Import Types

| Type | File | Key Fields |
|------|------|-----------|
| Accounts | accounts.csv | name, account_type, tax_treatment, current_balance |
| Income | income_streams.csv | name, stream_type, start_age, annual_amount |
| Expenses | expenses.csv | name, category, annual_amount, start_age |
| Assumptions | assumptions.csv | baseline_return, inflation_rate, etc. |
| Events | events.csv | name, age, amount, is_inflow |

### Steps to Import

1. Download the template CSV from Import > Download Templates
2. Fill in your data using the template format
3. Go to Import > Select import type > Upload file
4. Review the preview — check for validation errors
5. Click "Import" to save to the database

### Account Types

- `401k` — Traditional 401(k) or 403(b)
- `roth_ira` — Roth IRA or Roth 401(k)
- `taxable_brokerage` — Regular taxable investment account
- `dividend_portfolio` — Dividend-focused taxable account
- `cash_hysa` — Cash, savings, or high-yield savings account
- `pension` — Defined benefit pension (income stream)
- `social_security` — Social Security benefits
- `hsa` — Health Savings Account
- `other` — Any other asset

### Tax Treatment

- `taxable` — Gains and income taxed annually
- `tax_deferred` — Contributions pre-tax, taxed on withdrawal (401k, IRA)
- `tax_free` — Roth accounts; no tax on qualified withdrawals
- `partially_taxable` — Pension, SS (85% of SS may be taxable)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                     Frontend                         │
│  React + TypeScript + Tailwind + Recharts            │
│  TanStack Query for server state                     │
│  React Router for navigation                         │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP/JSON (REST)
                      │ /api/v1/...
┌─────────────────────┴───────────────────────────────┐
│                     Backend                          │
│  FastAPI + Pydantic v2                               │
│  SQLAlchemy ORM                                      │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │           Projection Engine                  │    │
│  │  projection.py — year-by-year simulation     │    │
│  │  tax.py — federal/state/SS/dividend taxes    │    │
│  │  withdrawal.py — account draw-down strategy  │    │
│  │  spending.py — inflation-adjusted expenses   │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  SQLite database (single file, portable)             │
└─────────────────────────────────────────────────────┘
```

### Projection Engine Logic

Each year is simulated in this order:

1. Grow account balances by the selected return rate
2. Add employee + employer contributions (pre-retirement)
3. Calculate active income streams (pension, SS, part-time)
4. Collect dividend income from dividend accounts
5. Inflate and sum annual expenses
6. Apply one-time events (windfalls / large purchases)
7. Determine portfolio withdrawal needed
8. Execute withdrawals per strategy (taxable-first, etc.)
9. Calculate federal, state, SS, and dividend taxes
10. Compute net cash flow; flag shortfall if portfolio depleted

---

## Extending the App

### Adding a New Account Type

1. Add the type string to `account_type` enum in `backend/app/models/models.py`
2. Add labels/colors to `frontend/src/components/ui/Badge.tsx`
3. Add to `accountTypeOptions` in `AccountForm.tsx`
4. Add liquidity/tax efficiency score in `AccountBubbleChart.tsx`

### Adding a New Projection Feature

1. Modify the engine in `backend/app/engine/projection.py`
2. Add any new fields to `ProjectionResult` model and schema
3. Add corresponding frontend chart in `frontend/src/components/charts/`

### Custom Withdrawal Strategies

Extend `backend/app/engine/withdrawal.py` — add a new sort key function and register it in the `key_fn` dict.

---

## Running Tests

```bash
cd backend
pytest tests/ -v
```
