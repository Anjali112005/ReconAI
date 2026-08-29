from rapidfuzz import fuzz


def detect_amount_mismatches(
    bank_df,
    ledger_df,
    matched_bank_indexes,
    matched_ledger_indexes,
    date_tolerance_days=3,
    name_similarity_threshold=75
):
    mismatches = []

    for bank_index, bank_row in bank_df.iterrows():

        # Skip already successfully matched transactions
        if bank_index in matched_bank_indexes:
            continue

        bank_amount = float(bank_row["amount"])
        bank_date = bank_row["value_date"]
        bank_name = str(bank_row["narration"]).strip()

        for ledger_index, ledger_row in ledger_df.iterrows():

            # Skip already successfully matched transactions
            if ledger_index in matched_ledger_indexes:
                continue

            ledger_date = ledger_row["txn_date"]
            ledger_name = str(ledger_row["merchant"]).strip()
            ledger_amount = float(ledger_row["amount"])

            # Check whether dates are close
            date_difference = abs(
                (bank_date - ledger_date).days
            )

            if date_difference > date_tolerance_days:
                continue

            # Compare merchant names
            name_similarity = fuzz.token_sort_ratio(
                bank_name.lower(),
                ledger_name.lower()
            )

            if name_similarity < name_similarity_threshold:
                continue

            # Only flag if the amounts are actually different
            amount_difference = abs(
                bank_amount - ledger_amount
            )

            if amount_difference == 0:
                continue

            mismatches.append({
                "source": "RECONCILIATION",
                "bank_index": int(bank_index),
                "ledger_index": int(ledger_index),
                "bank_ref": str(bank_row["reference_id"]),
                "ledger_ref": str(ledger_row["txn_id"]),
                "date": str(bank_date.date()),
                "bank_amount": bank_amount,
                "ledger_amount": ledger_amount,
                "difference": round(amount_difference, 2),
                "exception_type": "AMOUNT_MISMATCH",
                "severity": (
                    "HIGH"
                    if amount_difference >= 1000
                    else "MEDIUM"
                ),
                "reason": (
                    "Transaction details are similar, "
                    "but the bank and ledger amounts differ"
                ),
                "details": {
                    "date_difference_days": date_difference,
                    "name_similarity": round(
                        name_similarity, 2
                    )
                }
            })

    return mismatches