from fastapi import FastAPI
import pandas as pd

from app.reconciliation.engine import reconcile


app = FastAPI(
    title="ReconAI API",
    description="AI-Powered Financial Reconciliation and Finance Controller",
    version="1.0.0"
)


@app.get("/")
def home():
    return {
        "message": "Welcome to ReconAI",
        "status": "Backend is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ReconAI Backend"
    }


@app.get("/test-reconciliation")
def test_reconciliation():

    bank_df = pd.read_csv(
        "../datasets/bank_statement.csv"
    )

    ledger_df = pd.read_csv(
        "../datasets/internal_ledger.csv"
    )

    results = reconcile(
        bank_df,
        ledger_df
    )

    return results