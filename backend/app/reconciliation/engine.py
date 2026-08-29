import pandas as pd

from app.reconciliation.exact_matcher import find_exact_matches
from app.reconciliation.fuzzy_matcher import find_fuzzy_matches
from app.reconciliation.exception_detector import detect_exceptions


def reconcile(bank_df: pd.DataFrame, ledger_df: pd.DataFrame):

    # =========================
    # DATA PREPARATION
    # =========================

    bank_df["value_date"] = pd.to_datetime(
        bank_df["value_date"]
    )

    ledger_df["txn_date"] = pd.to_datetime(
        ledger_df["txn_date"]
    )

    # =========================
    # PASS 1 — EXACT MATCHING
    # =========================

    exact_matches = find_exact_matches(
        bank_df,
        ledger_df
    )

    matched_bank_indexes = {
        match["bank_index"]
        for match in exact_matches
    }

    matched_ledger_indexes = {
        match["ledger_index"]
        for match in exact_matches
    }

    # =========================
    # PASS 2 — FUZZY MATCHING
    # =========================

    fuzzy_matches = find_fuzzy_matches(
        bank_df,
        ledger_df,
        matched_bank_indexes,
        matched_ledger_indexes
    )

    # Combine matches
    all_matches = exact_matches + fuzzy_matches

    # =========================
    # PASS 3 — EXCEPTIONS
    # =========================

    exceptions = detect_exceptions(
        bank_df,
        ledger_df,
        matched_bank_indexes,
        matched_ledger_indexes
    )

    return {
        "summary": {
            "bank_transactions": len(bank_df),
            "ledger_transactions": len(ledger_df),
            "exact_matches": len(exact_matches),
            "fuzzy_matches": len(fuzzy_matches),
            "total_matches": len(all_matches),
            "exceptions": len(exceptions)
        },
        "matches": all_matches,
        "exceptions": exceptions
    }