import pandas as pd


def find_exact_matches(bank_df: pd.DataFrame, ledger_df: pd.DataFrame):
    """
    Match bank transactions with ledger transactions
    using transaction ID and exact amount.
    """

    matches = []

    used_ledger_indexes = set()

    for bank_index, bank_row in bank_df.iterrows():

        bank_reference = str(bank_row["reference_id"]).strip()
        bank_amount = float(bank_row["amount"])

        # Skip missing or invalid reference IDs
        if bank_reference.upper() in ["NA", "NAN", "NONE", ""]:
            continue

        for ledger_index, ledger_row in ledger_df.iterrows():

            # Don't use the same ledger transaction twice
            if ledger_index in used_ledger_indexes:
                continue

            ledger_transaction_id = str(
                ledger_row["txn_id"]
            ).strip()

            ledger_amount = float(ledger_row["amount"])

            # Exact Match
            if (
                bank_reference == ledger_transaction_id
                and bank_amount == ledger_amount
            ):

                matches.append({
                    "bank_index": bank_index,
                    "ledger_index": ledger_index,
                    "bank_ref": bank_reference,
                    "ledger_ref": ledger_transaction_id,
                    "amount": bank_amount,
                    "match_type": "EXACT",
                    "confidence": 1.0,
                    "reason": "Exact transaction ID and amount match"
                })

                used_ledger_indexes.add(ledger_index)

                break

    return matches