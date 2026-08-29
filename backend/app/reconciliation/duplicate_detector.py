from rapidfuzz import fuzz


def detect_duplicates(
    ledger_df,
    matched_ledger_indexes,
    amount_tolerance=1.0,
    date_tolerance_days=1,
    name_similarity_threshold=90
):
    duplicates = []

    checked_pairs = set()

    # Get only unmatched ledger transactions
    unmatched_indexes = [
        index
        for index in ledger_df.index
        if index not in matched_ledger_indexes
    ]

    for i in range(len(unmatched_indexes)):

        index_a = unmatched_indexes[i]
        row_a = ledger_df.loc[index_a]

        for j in range(i + 1, len(unmatched_indexes)):

            index_b = unmatched_indexes[j]
            row_b = ledger_df.loc[index_b]

            # Avoid checking the same pair twice
            pair = tuple(sorted([int(index_a), int(index_b)]))

            if pair in checked_pairs:
                continue

            checked_pairs.add(pair)

            # Compare amounts
            amount_a = float(row_a["amount"])
            amount_b = float(row_b["amount"])

            amount_difference = abs(amount_a - amount_b)

            if amount_difference > amount_tolerance:
                continue

            # Compare dates
            date_difference = abs(
                (row_a["txn_date"] - row_b["txn_date"]).days
            )

            if date_difference > date_tolerance_days:
                continue

            # Compare merchant names
            merchant_a = str(row_a["merchant"]).strip()
            merchant_b = str(row_b["merchant"]).strip()

            name_similarity = fuzz.token_sort_ratio(
                merchant_a.lower(),
                merchant_b.lower()
            )

            if name_similarity < name_similarity_threshold:
                continue

            # Calculate duplicate confidence
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
                amount_score * 0.40
                + date_score * 0.30
                + name_similarity * 0.30
            )

            duplicates.append({
                "source": "LEDGER",
                "ledger_index_1": int(index_a),
                "ledger_index_2": int(index_b),
                "txn_id_1": str(row_a["txn_id"]),
                "txn_id_2": str(row_b["txn_id"]),
                "date_1": str(row_a["txn_date"].date()),
                "date_2": str(row_b["txn_date"].date()),
                "amount_1": amount_a,
                "amount_2": amount_b,
                "merchant_1": merchant_a,
                "merchant_2": merchant_b,
                "exception_type": "POSSIBLE_DUPLICATE",
                "severity": "HIGH",
                "confidence": round(confidence / 100, 2),
                "reason": (
                    "Two ledger transactions have very similar "
                    "amount, date, and merchant details"
                ),
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
            })

    return duplicates