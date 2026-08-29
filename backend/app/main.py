from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any

import pandas as pd

from app.reconciliation.engine import reconcile


# =====================================
# FASTAPI APPLICATION
# =====================================

app = FastAPI(
    title="ReconAI API",
    description=(
        "AI-Powered Financial Reconciliation "
        "and Finance Controller"
    ),
    version="1.0.0"
)


# =====================================
# REQUEST MODEL
# =====================================

class ReconciliationRequest(BaseModel):

    bank_transactions: List[Dict[str, Any]]

    ledger_transactions: List[Dict[str, Any]]


# =====================================
# HOME ENDPOINT
# =====================================

@app.get("/")
def home():

    return {
        "message": "Welcome to ReconAI",
        "status": "Backend is running"
    }


# =====================================
# HEALTH CHECK
# =====================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy",
        "service": "ReconAI Backend"
    }


# =====================================
# TEST RECONCILIATION
# =====================================

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


# =====================================
# RECONCILIATION API
# =====================================

@app.post("/reconcile")
def run_reconciliation(
    request: ReconciliationRequest
):

    # Convert uploaded JSON data
    # into Pandas DataFrames

    bank_df = pd.DataFrame(
        request.bank_transactions
    )

    ledger_df = pd.DataFrame(
        request.ledger_transactions
    )

    # Run ReconAI reconciliation engine

    results = reconcile(
        bank_df,
        ledger_df
    )

    return results