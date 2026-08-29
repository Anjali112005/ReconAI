import pandas as pd

from app.reconciliation.exact_matcher import find_exact_matches
from app.reconciliation.fuzzy_matcher import find_fuzzy_matches
from app.reconciliation.mismatch_detector import detect_amount_mismatches
from app.reconciliation.duplicate_detector import detect_duplicates
from app.reconciliation.exception_detector import detect_exceptions


def reconcile(bank_df: pd.DataFrame, ledger_df: pd.DataFrame):

    # =====================================
    # DATA PREPARATION
    # =====================================

    bank_df["value_date"] = pd.to_datetime(
        bank_df["value_date"]
    )

    ledger_df["txn_date"] = pd.to_datetime(
        ledger_df["txn_date"]
    )

    # =====================================
    # PASS 1 — EXACT MATCHING
    # =====================================

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

    # =====================================
    # PASS 2 — FUZZY MATCHING
    # Includes settlement delay detection
    # =====================================

    fuzzy_results = find_fuzzy_matches(
        bank_df,
        ledger_df,
        matched_bank_indexes,
        matched_ledger_indexes
    )

    # Separate normal fuzzy matches
    fuzzy_matches = [
        match
        for match in fuzzy_results
        if match["match_type"] == "FUZZY"
    ]

    # Separate settlement delays
    settlement_delays = [
        match
        for match in fuzzy_results
        if match["match_type"] == "SETTLEMENT_DELAY"
    ]

    # Successful reconciliation matches
    all_matches = (
        exact_matches
        + fuzzy_matches
        + settlement_delays
    )

    # =====================================
    # PASS 3 — AMOUNT MISMATCH DETECTION
    # =====================================

    amount_mismatches = detect_amount_mismatches(
        bank_df,
        ledger_df,
        matched_bank_indexes,
        matched_ledger_indexes
    )

    for mismatch in amount_mismatches:

        matched_bank_indexes.add(
            mismatch["bank_index"]
        )

        matched_ledger_indexes.add(
            mismatch["ledger_index"]
        )

    # =====================================
    # PASS 4 — DUPLICATE DETECTION
    # =====================================

    duplicates = detect_duplicates(
        ledger_df,
        matched_ledger_indexes
    )

    for duplicate in duplicates:

        matched_ledger_indexes.add(
            duplicate["ledger_index_1"]
        )

        matched_ledger_indexes.add(
            duplicate["ledger_index_2"]
        )

    # =====================================
    # PASS 5 — BASIC EXCEPTIONS
    # =====================================

    basic_exceptions = detect_exceptions(
        bank_df,
        ledger_df,
        matched_bank_indexes,
        matched_ledger_indexes
    )

    exceptions = (
        amount_mismatches
        + duplicates
        + basic_exceptions
    )

    # =====================================
    # FINAL RESPONSE
    # =====================================

    return {
        "summary": {
            "bank_transactions": len(bank_df),
            "ledger_transactions": len(ledger_df),
            "exact_matches": len(exact_matches),
            "fuzzy_matches": len(fuzzy_matches),
            "settlement_delays": len(settlement_delays),
            "amount_mismatches": len(amount_mismatches),
            "possible_duplicates": len(duplicates),
            "total_matches": len(all_matches),
            "exceptions": len(exceptions)
        },
        "matches": all_matches,
        "exceptions": exceptions
    }