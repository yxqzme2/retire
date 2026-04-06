from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import create_tables, SessionLocal
from app.services.seed_data import seed_database
from app.routers import (
    profiles,
    scenarios,
    accounts,
    income,
    expenses,
    events,
    assumptions,
    projections,
    import_export,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup/shutdown lifecycle."""
    # Create all tables
    create_tables()

    # Seed the database if empty
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    yield
    # Shutdown: nothing to clean up for SQLite


app = FastAPI(
    title="RetireVision API",
    description="Self-hosted retirement planning dashboard API",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*",  # Allow all in development; restrict in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(profiles.router, prefix=API_PREFIX)
app.include_router(scenarios.router, prefix=API_PREFIX)
app.include_router(accounts.router, prefix=API_PREFIX)
app.include_router(income.router, prefix=API_PREFIX)
app.include_router(expenses.router, prefix=API_PREFIX)
app.include_router(events.router, prefix=API_PREFIX)
app.include_router(assumptions.router, prefix=API_PREFIX)
app.include_router(projections.router, prefix=API_PREFIX)
app.include_router(import_export.router, prefix=API_PREFIX)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "RetireVision API"}


@app.get("/")
def root():
    return {"message": "RetireVision API — visit /docs for interactive documentation"}
