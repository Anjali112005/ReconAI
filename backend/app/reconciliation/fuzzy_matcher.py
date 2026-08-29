from rapidfuzz import fuzz


def find_fuzzy_matches(
    bank_df,
    ledger_df,
    matched_bank_indexes,
    matched_ledger_indexes,
    amount_tolerance=3.0,
    date_tolerance_days=3,
    confidence_threshold=80
):
    matches = []

    for bank_index, bank_row in bank_df.iterrows():

        if bank_index in matched_bank_indexes:
            continue

        bank_amount = float(bank_row["amount"])
        bank_date = bank_row["value_date"]
        bank_name = str(bank_row["narration"]).strip()

        best_match = None
        best_confidence = 0

        for ledger_index, ledger_row in ledger_df.iterrows():

            if ledger_index in matched_ledger_indexes:
                continue

            ledger_amount = float(ledger_row["amount"])
            ledger_date = ledger_row["txn_date"]
            ledger_name = str(ledger_row["merchant"]).strip()

            # -----------------------------
            # 1. AMOUNT COMPARISON
            # -----------------------------

            amount_difference = abs(
                bank_amount - ledger_amount
            )

            if amount_difference > amount_tolerance:
                continue

            # -----------------------------
            # 2. DATE COMPARISON
            # -----------------------------

            date_difference = abs(
                (bank_date - ledger_date).days
            )

            if date_difference > date_tolerance_days:
                continue

            # -----------------------------
            # 3. NAME SIMILARITY
            # -----------------------------

            name_similarity = fuzz.token_sort_ratio(
                bank_name.lower(),
                ledger_name.lower()
            )

            # -----------------------------
            # 4. CONFIDENCE SCORE
            # -----------------------------

            amount_score = max(
                0,
                100 - (
                    amount_difference / amount_tolerance
                ) * 100
            )

            date_score = max(
                0,
                100 - (
                    date_difference / date_tolerance_days
                ) * 100
            )

            confidence = (
                amount_score * 0.45
                + date_score * 0.25
                + name_similarity * 0.30
            )

            if confidence > best_confidence:

                best_confidence = confidence

                # -----------------------------
                # SETTLEMENT DELAY CLASSIFICATION
                # -----------------------------

                if date_difference > 0:

                    match_type = "SETTLEMENT_DELAY"

                    reason = (
                        "Transaction matched successfully, "
                        "but bank settlement occurred later "
                        "than the ledger transaction date"
                    )

                else:

                    match_type = "FUZZY"

                    reason = (
                        "Matched using amount, date and "
                        "merchant similarity"
                    )

                best_match = {
                    "bank_index": int(bank_index),
                    "ledger_index": int(ledger_index),
                    "bank_ref": str(
                        bank_row["reference_id"]
                    ),
                    "ledger_ref": str(
                        ledger_row["txn_id"]
                    ),
                    "amount": bank_amount,
                    "match_type": match_type,
                    "confidence": round(
                        confidence / 100,
                        2
                    ),
                    "reason": reason,
                    "details": {
                        "amount_difference": round(
                            amount_difference,
                            2
                        ),
                        "date_difference_days": int(
                            date_difference
                        ),
                        "name_similarity": round(
                            name_similarity,
                            2
                        )
                    }
                }

        # Add only high-confidence matches
        if (
            best_match
            and best_confidence >= confidence_threshold
        ):

            matches.append(best_match)

            matched_bank_indexes.add(
                bank_index
            )

            matched_ledger_indexes.add(
                best_match["ledger_index"]
            )

    return matches