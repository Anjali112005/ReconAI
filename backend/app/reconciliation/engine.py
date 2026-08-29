import pandas as pd

from app.reconciliation.exact_matcher import find_exact_matches


def reconcile(bank_df: pd.DataFrame, ledger_df: pd.DataFrame):

    # PASS 1: Exact Matching
    exact_matches = find_exact_matches(
        bank_df,
        ledger_df
    )

    return {
        "summary": {
            "bank_transactions": len(bank_df),
            "ledger_transactions": len(ledger_df),
            "exact_matches": len(exact_matches)
        },
        "matches": exact_matches
    }