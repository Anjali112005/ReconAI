import pandas as pd


def detect_exceptions(
    bank_df: pd.DataFrame,
    ledger_df: pd.DataFrame,
    matched_bank_indexes: set,
    matched_ledger_indexes: set
):
    exceptions = []

    # =====================================
    # UNMATCHED BANK TRANSACTIONS
    # =====================================

    for bank_index, bank_row in bank_df.iterrows():

        if bank_index in matched_bank_indexes:
            continue

        narration = str(bank_row["narration"]).upper()
        amount = float(bank_row["amount"])

        # Detect possible bank fees
        fee_keywords = [
            "FEE",
            "CHARGE",
            "SERVICE CHARGE",
            "BANK CHARGE"
        ]

        is_bank_fee = any(
            keyword in narration
            for keyword in fee_keywords
        )

        if is_bank_fee:

            exception_type = "BANK_FEE"

            reason = (
                "Bank fee or service charge with no "
                "matching ledger transaction"
            )

            severity = "LOW"

        else:

            exception_type = "MISSING_LEDGER_ENTRY"

            reason = (
                "Bank transaction has no matching "
                "internal ledger entry"
            )

            severity = "HIGH" if amount >= 50000 else "MEDIUM"

        exceptions.append({
            "source": "BANK",
            "index": int(bank_index),
            "reference_id": str(
                bank_row["reference_id"]
            ),
            "date": str(
                bank_row["value_date"].date()
            ),
            "amount": amount,
            "narration": str(
                bank_row["narration"]
            ),
            "exception_type": exception_type,
            "severity": severity,
            "reason": reason
        })

    # =====================================
    # UNMATCHED LEDGER TRANSACTIONS
    # =====================================

    for ledger_index, ledger_row in ledger_df.iterrows():

        if ledger_index in matched_ledger_indexes:
            continue

        amount = float(ledger_row["amount"])

        exceptions.append({
            "source": "LEDGER",
            "index": int(ledger_index),
            "reference_id": str(
                ledger_row["txn_id"]
            ),
            "date": str(
                ledger_row["txn_date"].date()
            ),
            "amount": amount,
            "narration": str(
                ledger_row["merchant"]
            ),
            "exception_type": "MISSING_BANK_ENTRY",
            "severity": (
                "HIGH"
                if amount >= 50000
                else "MEDIUM"
            ),
            "reason": (
                "Internal ledger transaction has no "
                "matching bank transaction"
            )
        })

    return exceptions