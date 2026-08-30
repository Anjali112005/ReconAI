import pandas as pd

from app.reconciliation.exact_matcher import find_exact_matches
from app.reconciliation.fuzzy_matcher import find_fuzzy_matches
from app.reconciliation.mismatch_detector import detect_amount_mismatches
from app.reconciliation.duplicate_detector import detect_duplicates
from app.reconciliation.exception_detector import detect_exceptions
from app.reconciliation.risk_scorer import score_exceptions

from app.ai.investigator import investigate_exceptions


# =====================================
# NORMALIZE COLUMN NAMES
# =====================================

def normalize_columns(df: pd.DataFrame):

    df = df.copy()

    df.columns = (
        df.columns
        .astype(str)
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
        .str.replace("-", "_")
    )

    return df


# =====================================
# ADD COLUMN ALIASES
# =====================================

def add_column_aliases(df: pd.DataFrame):

    df = df.copy()

    # =================================
    # TRANSACTION ID ALIASES
    # =================================

    if "transaction_id" in df.columns:

        if "reference_id" not in df.columns:
            df["reference_id"] = df["transaction_id"]

        if "txn_id" not in df.columns:
            df["txn_id"] = df["transaction_id"]


    if "reference_id" in df.columns:

        if "txn_id" not in df.columns:
            df["txn_id"] = df["reference_id"]


    if "txn_id" in df.columns:

        if "reference_id" not in df.columns:
            df["reference_id"] = df["txn_id"]


    # =================================
    # DESCRIPTION / NARRATION / MERCHANT
    # =================================

    if "description" in df.columns:

        if "narration" not in df.columns:
            df["narration"] = df["description"]

        if "merchant" not in df.columns:
            df["merchant"] = df["description"]


    if "narration" in df.columns:

        if "description" not in df.columns:
            df["description"] = df["narration"]

        if "merchant" not in df.columns:
            df["merchant"] = df["narration"]


    if "merchant" in df.columns:

        if "description" not in df.columns:
            df["description"] = df["merchant"]

        if "narration" not in df.columns:
            df["narration"] = df["merchant"]


    # =================================
    # AMOUNT ALIASES
    # =================================

    if "amount" in df.columns:

        if "transaction_amount" not in df.columns:
            df["transaction_amount"] = df["amount"]

        if "txn_amount" not in df.columns:
            df["txn_amount"] = df["amount"]


    if "transaction_amount" in df.columns:

        if "amount" not in df.columns:
            df["amount"] = df["transaction_amount"]


    if "txn_amount" in df.columns:

        if "amount" not in df.columns:
            df["amount"] = df["txn_amount"]


    # =================================
    # DATE ALIASES
    # =================================

    if "value_date" in df.columns:

        if "transaction_date" not in df.columns:
            df["transaction_date"] = df["value_date"]

        if "txn_date" not in df.columns:
            df["txn_date"] = df["value_date"]


    if "txn_date" in df.columns:

        if "transaction_date" not in df.columns:
            df["transaction_date"] = df["txn_date"]


    if "transaction_date" in df.columns:

        if "value_date" not in df.columns:
            df["value_date"] = df["transaction_date"]

        if "txn_date" not in df.columns:
            df["txn_date"] = df["transaction_date"]


    return df


# =====================================
# STANDARDIZE BANK COLUMNS
# =====================================

def standardize_bank_columns(bank_df: pd.DataFrame):

    bank_df = bank_df.copy()

    # ---------------------------------
    # REFERENCE ID
    # ---------------------------------

    possible_reference_columns = [

        "reference_id",
        "transaction_id",
        "transaction_reference",
        "reference",
        "ref_id",
        "txn_id"

    ]

    for column in possible_reference_columns:

        if column in bank_df.columns:

            if column != "reference_id":

                bank_df = bank_df.rename(
                    columns={
                        column: "reference_id"
                    }
                )

            break


    # ---------------------------------
    # DATE
    # ---------------------------------

    possible_date_columns = [

        "value_date",
        "transaction_date",
        "txn_date",
        "date"

    ]

    for column in possible_date_columns:

        if column in bank_df.columns:

            if column != "value_date":

                bank_df = bank_df.rename(
                    columns={
                        column: "value_date"
                    }
                )

            break


    # ---------------------------------
    # DESCRIPTION
    # ---------------------------------

    possible_description_columns = [

        "description",
        "narration",
        "merchant",
        "transaction_description",
        "details",
        "remarks"

    ]

    for column in possible_description_columns:

        if column in bank_df.columns:

            if column != "description":

                bank_df = bank_df.rename(
                    columns={
                        column: "description"
                    }
                )

            break


    # ---------------------------------
    # AMOUNT
    # ---------------------------------

    possible_amount_columns = [

        "amount",
        "transaction_amount",
        "txn_amount",
        "value"

    ]

    for column in possible_amount_columns:

        if column in bank_df.columns:

            if column != "amount":

                bank_df = bank_df.rename(
                    columns={
                        column: "amount"
                    }
                )

            break


    bank_df = add_column_aliases(
        bank_df
    )

    return bank_df


# =====================================
# STANDARDIZE LEDGER COLUMNS
# =====================================

def standardize_ledger_columns(ledger_df: pd.DataFrame):

    ledger_df = ledger_df.copy()

    # ---------------------------------
    # REFERENCE ID
    # ---------------------------------

    possible_reference_columns = [

        "reference_id",
        "transaction_id",
        "transaction_reference",
        "reference",
        "ref_id",
        "txn_id"

    ]

    for column in possible_reference_columns:

        if column in ledger_df.columns:

            if column != "reference_id":

                ledger_df = ledger_df.rename(
                    columns={
                        column: "reference_id"
                    }
                )

            break


    # ---------------------------------
    # DATE
    # ---------------------------------

    possible_date_columns = [

        "txn_date",
        "transaction_date",
        "value_date",
        "date"

    ]

    for column in possible_date_columns:

        if column in ledger_df.columns:

            if column != "txn_date":

                ledger_df = ledger_df.rename(
                    columns={
                        column: "txn_date"
                    }
                )

            break


    # ---------------------------------
    # DESCRIPTION
    # ---------------------------------

    possible_description_columns = [

        "description",
        "narration",
        "merchant",
        "transaction_description",
        "details",
        "remarks"

    ]

    for column in possible_description_columns:

        if column in ledger_df.columns:

            if column != "description":

                ledger_df = ledger_df.rename(
                    columns={
                        column: "description"
                    }
                )

            break


    # ---------------------------------
    # AMOUNT
    # ---------------------------------

    possible_amount_columns = [

        "amount",
        "transaction_amount",
        "txn_amount",
        "value"

    ]

    for column in possible_amount_columns:

        if column in ledger_df.columns:

            if column != "amount":

                ledger_df = ledger_df.rename(
                    columns={
                        column: "amount"
                    }
                )

            break


    ledger_df = add_column_aliases(
        ledger_df
    )

    return ledger_df


# =====================================
# VALIDATE COLUMNS
# =====================================

def validate_columns(
    bank_df: pd.DataFrame,
    ledger_df: pd.DataFrame
):

    required_bank_columns = [

        "reference_id",
        "txn_id",
        "value_date",
        "description",
        "narration",
        "merchant",
        "amount"

    ]

    required_ledger_columns = [

        "reference_id",
        "txn_id",
        "txn_date",
        "description",
        "narration",
        "merchant",
        "amount"

    ]


    missing_bank = [

        column

        for column in required_bank_columns

        if column not in bank_df.columns

    ]


    missing_ledger = [

        column

        for column in required_ledger_columns

        if column not in ledger_df.columns

    ]


    if missing_bank:

        raise ValueError(
            "Bank Statement missing columns: "
            f"{missing_bank}"
        )


    if missing_ledger:

        raise ValueError(
            "Internal Ledger missing columns: "
            f"{missing_ledger}"
        )


# =====================================
# MAIN RECONCILIATION FUNCTION
# =====================================

def reconcile(
    bank_df: pd.DataFrame,
    ledger_df: pd.DataFrame
):

    try:

        # =================================
        # NORMALIZE INPUT COLUMN NAMES
        # =================================

        bank_df = normalize_columns(
            bank_df
        )

        ledger_df = normalize_columns(
            ledger_df
        )


        # =================================
        # STANDARDIZE DATA
        # =================================

        bank_df = standardize_bank_columns(
            bank_df
        )

        ledger_df = standardize_ledger_columns(
            ledger_df
        )


        # =================================
        # DEBUG OUTPUT
        # =================================

        print()
        print("=====================================")
        print("STANDARDIZED BANK COLUMNS:")
        print(bank_df.columns.tolist())

        print()
        print("STANDARDIZED LEDGER COLUMNS:")
        print(ledger_df.columns.tolist())

        print("=====================================")
        print()


        # =================================
        # VALIDATE REQUIRED COLUMNS
        # =================================

        validate_columns(
            bank_df,
            ledger_df
        )


        # =================================
        # CONVERT DATES
        # =================================

        bank_df["value_date"] = pd.to_datetime(
            bank_df["value_date"],
            errors="coerce"
        )

        bank_df["txn_date"] = pd.to_datetime(
            bank_df["txn_date"],
            errors="coerce"
        )

        ledger_df["txn_date"] = pd.to_datetime(
            ledger_df["txn_date"],
            errors="coerce"
        )

        ledger_df["value_date"] = pd.to_datetime(
            ledger_df["value_date"],
            errors="coerce"
        )


        # =================================
        # CONVERT AMOUNTS
        # =================================

        bank_df["amount"] = pd.to_numeric(
            bank_df["amount"],
            errors="coerce"
        )

        ledger_df["amount"] = pd.to_numeric(
            ledger_df["amount"],
            errors="coerce"
        )


        # =================================
        # PASS 1 — EXACT MATCHING
        # =================================

        exact_matches = find_exact_matches(
            bank_df,
            ledger_df
        )


        matched_bank_indexes = {

            match["bank_index"]

            for match in exact_matches

            if "bank_index" in match

        }


        matched_ledger_indexes = {

            match["ledger_index"]

            for match in exact_matches

            if "ledger_index" in match

        }


        # =================================
        # PASS 2 — FUZZY MATCHING
        # =================================

        fuzzy_results = find_fuzzy_matches(
            bank_df,
            ledger_df,
            matched_bank_indexes,
            matched_ledger_indexes
        )


        fuzzy_matches = [

            match

            for match in fuzzy_results

            if match.get("match_type") == "FUZZY"

        ]


        settlement_delays = [

            match

            for match in fuzzy_results

            if match.get("match_type")
            == "SETTLEMENT_DELAY"

        ]


        # Mark fuzzy results as processed

        for match in fuzzy_results:

            if "bank_index" in match:

                matched_bank_indexes.add(
                    match["bank_index"]
                )

            if "ledger_index" in match:

                matched_ledger_indexes.add(
                    match["ledger_index"]
                )


        # =================================
        # COMBINE MATCHES
        # =================================

        all_matches = (

            exact_matches

            + fuzzy_matches

            + settlement_delays

        )


        # =================================
        # PASS 3 — AMOUNT MISMATCHES
        # =================================

        amount_mismatches = (
            detect_amount_mismatches(
                bank_df,
                ledger_df,
                matched_bank_indexes,
                matched_ledger_indexes
            )
        )


        for mismatch in amount_mismatches:

            if "bank_index" in mismatch:

                matched_bank_indexes.add(
                    mismatch["bank_index"]
                )

            if "ledger_index" in mismatch:

                matched_ledger_indexes.add(
                    mismatch["ledger_index"]
                )


        # =================================
        # PASS 4 — DUPLICATES
        # =================================

        duplicates = detect_duplicates(
            ledger_df,
            matched_ledger_indexes
        )


        for duplicate in duplicates:

            if "ledger_index_1" in duplicate:

                matched_ledger_indexes.add(
                    duplicate["ledger_index_1"]
                )

            if "ledger_index_2" in duplicate:

                matched_ledger_indexes.add(
                    duplicate["ledger_index_2"]
                )


        # =================================
        # PASS 5 — BASIC EXCEPTIONS
        # =================================

        basic_exceptions = detect_exceptions(
            bank_df,
            ledger_df,
            matched_bank_indexes,
            matched_ledger_indexes
        )


        # =================================
        # COMBINE EXCEPTIONS
        # =================================

        exceptions = (

            amount_mismatches

            + duplicates

            + basic_exceptions

        )


        # =================================
        # PASS 6 — RISK SCORING
        # =================================

        scored_exceptions = score_exceptions(
            exceptions
        )


        # =================================
        # PASS 7 — AI INVESTIGATION
        # =================================

        investigations = investigate_exceptions(
            scored_exceptions
        )


        # =================================
        # FINAL RESPONSE
        # =================================

        return {

            "summary": {

                "bank_transactions":
                    len(bank_df),

                "ledger_transactions":
                    len(ledger_df),

                "exact_matches":
                    len(exact_matches),

                "fuzzy_matches":
                    len(fuzzy_matches),

                "settlement_delays":
                    len(settlement_delays),

                "amount_mismatches":
                    len(amount_mismatches),

                "possible_duplicates":
                    len(duplicates),

                "total_matches":
                    len(all_matches),

                "exceptions":
                    len(scored_exceptions)

            },

            "matches":
                all_matches,

            "exceptions":
                scored_exceptions,

            "investigations":
                investigations

        }


    except Exception as error:

        print()
        print("=====================================")
        print("RECONCILIATION ERROR:")
        print(str(error))
        print("=====================================")
        print()

        raise error